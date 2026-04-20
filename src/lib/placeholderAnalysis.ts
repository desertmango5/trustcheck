import type {
  CategoryBreakdownItem,
  CategoryName,
  ContentTypeGuess,
  HumanReviewRecommendation,
  TrustCheckAnalysisResult,
  TrustLevel
} from "@/types/trustcheck";

type CategoryWeightMap = Record<CategoryName, number>;
type CategoryScoreMap = Record<CategoryName, CategoryBreakdownItem["score"]>;

type GuardrailSignalSet = {
  blockHighTrust: boolean;
  enforceLimitedOrWeak: boolean;
  enforceStrongReview: boolean;
  enforceRecommendedReview: boolean;
  addOverstatementFlag: boolean;
  addContextFlag: boolean;
  addContextVerifyStep: boolean;
};

const CATEGORY_WEIGHTS: CategoryWeightMap = {
  "Source Visibility": 15,
  "Evidence Quality": 20,
  "Claim Discipline": 15,
  "Confidence Calibration": 10,
  "Uncertainty Handling": 10,
  "Fact vs Interpretation": 10,
  "Context Completeness": 10,
  "Verification Burden": 10
};

const CATEGORY_ORDER = Object.keys(CATEGORY_WEIGHTS) as CategoryName[];

const SIGNAL_PATTERNS = {
  url: /\b(?:https?:\/\/|www\.)\S+/gi,
  citationCue:
    /\b(according to|source|sources|study|studies|report|reports|data|survey|research|citation|citations)\b/gi,
  quote: /"[^"]{8,}"/g,
  number: /\b\d+(?:\.\d+)?%?\b/g,
  hedge:
    /\b(may|might|could|possibly|suggests?|appears?|likely|unlikely|uncertain|estimate|estimated|approximately)\b/gi,
  absolute:
    /\b(always|never|definitely|proves?|everyone|no one|undeniably|guaranteed?|must)\b/gi,
  vagueAttribution: /\b(experts say|people say|reports indicate|it is said)\b/gi,
  opinionMarker: /\b(i think|i believe|in my view|opinion|should|ought to)\b/gi,
  factMarker: /\b(observed|measured|recorded|reported|published|dataset|statistic)\b/gi,
  contextMarker:
    /\b(in \d{4}|between|from \d{4}|during|within|scope|sample|region|country|state|city|timeframe|baseline|compared with)\b/gi,
  limitationMarker:
    /\b(limitations?|caveat|except|however|depends|unknown|unclear|not enough data)\b/gi
};

function countMatches(text: string, pattern: RegExp) {
  return text.match(pattern)?.length ?? 0;
}

function toLabel(score: CategoryBreakdownItem["score"]): CategoryBreakdownItem["label"] {
  if (score === 5) return "Strong";
  if (score === 4) return "Good";
  if (score === 3) return "Moderate";
  if (score === 2) return "Weak";
  return "Poor";
}

function getTrustLevelFromScore(score: number): TrustLevel {
  if (score >= 85) return "High trust support";
  if (score >= 70) return "Moderate trust support";
  if (score >= 50) return "Limited trust support";
  return "Weak trust support";
}

function guessContentType(text: string): ContentTypeGuess {
  const normalized = text.toLowerCase();

  if (/\b(in conclusion|overall|to summarize|summary)\b/.test(normalized)) {
    return "summary";
  }
  if (/\b(i believe|in my view|my opinion)\b/.test(normalized)) {
    return "opinion";
  }
  if (/\b(we recommend|you should|must)\b/.test(normalized)) {
    return "persuasive content";
  }
  if (/\b(method|results|references|hypothesis)\b/.test(normalized)) {
    return "academic-style writing";
  }
  if (/\b(report|investigation|published|witness)\b/.test(normalized)) {
    return "reporting";
  }
  return "mixed/unclear";
}

function clampScore(score: number): CategoryBreakdownItem["score"] {
  if (score <= 1) return 1;
  if (score >= 5) return 5;
  return Math.round(score) as CategoryBreakdownItem["score"];
}

function computeCategoryScores(text: string): CategoryScoreMap {
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const urlCount = countMatches(text, SIGNAL_PATTERNS.url);
  const citationCueCount = countMatches(text, SIGNAL_PATTERNS.citationCue);
  const quoteCount = countMatches(text, SIGNAL_PATTERNS.quote);
  const numberCount = countMatches(text, SIGNAL_PATTERNS.number);
  const hedgeCount = countMatches(text, SIGNAL_PATTERNS.hedge);
  const absoluteCount = countMatches(text, SIGNAL_PATTERNS.absolute);
  const vagueAttributionCount = countMatches(text, SIGNAL_PATTERNS.vagueAttribution);
  const opinionCount = countMatches(text, SIGNAL_PATTERNS.opinionMarker);
  const factCount = countMatches(text, SIGNAL_PATTERNS.factMarker);
  const contextCount = countMatches(text, SIGNAL_PATTERNS.contextMarker);
  const limitationCount = countMatches(text, SIGNAL_PATTERNS.limitationMarker);

  let sourceVisibility = 1;
  if (urlCount >= 2 && citationCueCount >= 3) sourceVisibility = 5;
  else if (urlCount >= 1 && citationCueCount >= 2) sourceVisibility = 4;
  else if (citationCueCount >= 1 || urlCount >= 1) sourceVisibility = 3;
  else if (vagueAttributionCount >= 1) sourceVisibility = 2;

  const evidenceSignal = numberCount + citationCueCount + quoteCount + urlCount;
  let evidenceQuality = 1;
  if (evidenceSignal >= 10) evidenceQuality = 5;
  else if (evidenceSignal >= 7) evidenceQuality = 4;
  else if (evidenceSignal >= 4) evidenceQuality = 3;
  else if (evidenceSignal >= 2) evidenceQuality = 2;

  let claimDiscipline = 5;
  if (absoluteCount >= 6) claimDiscipline = 1;
  else if (absoluteCount >= 4) claimDiscipline = 2;
  else if (absoluteCount >= 2) claimDiscipline = 3;
  else if (absoluteCount === 1) claimDiscipline = 4;

  const confidenceMismatch =
    absoluteCount - Math.min(hedgeCount, 3) + (evidenceSignal < 4 ? 1 : 0);
  let confidenceCalibration = 5;
  if (confidenceMismatch >= 5) confidenceCalibration = 1;
  else if (confidenceMismatch >= 3) confidenceCalibration = 2;
  else if (confidenceMismatch >= 2) confidenceCalibration = 3;
  else if (confidenceMismatch >= 1) confidenceCalibration = 4;

  const uncertaintySignal = hedgeCount + limitationCount;
  let uncertaintyHandling = 1;
  if (uncertaintySignal >= 6) uncertaintyHandling = 5;
  else if (uncertaintySignal >= 4) uncertaintyHandling = 4;
  else if (uncertaintySignal >= 2) uncertaintyHandling = 3;
  else if (uncertaintySignal >= 1) uncertaintyHandling = 2;

  let factVsInterpretation = 3;
  if (factCount >= 4 && opinionCount <= 1) factVsInterpretation = 5;
  else if (factCount >= 2 && opinionCount <= 1) factVsInterpretation = 4;
  else if (opinionCount > factCount + 2) factVsInterpretation = 1;
  else if (opinionCount > factCount) factVsInterpretation = 2;

  let contextCompleteness = 1;
  if (contextCount >= 6) contextCompleteness = 5;
  else if (contextCount >= 4) contextCompleteness = 4;
  else if (contextCount >= 2) contextCompleteness = 3;
  else if (contextCount >= 1) contextCompleteness = 2;

  const reliabilityAverage =
    (sourceVisibility +
      evidenceQuality +
      factVsInterpretation +
      contextCompleteness +
      claimDiscipline) /
    5;
  let verificationBurden = 1;
  if (reliabilityAverage >= 4.4 && wordCount >= 100) verificationBurden = 5;
  else if (reliabilityAverage >= 3.6) verificationBurden = 4;
  else if (reliabilityAverage >= 2.8) verificationBurden = 3;
  else if (reliabilityAverage >= 2.1) verificationBurden = 2;

  if (wordCount < 30) {
    sourceVisibility = Math.min(sourceVisibility, 3);
    evidenceQuality = Math.min(evidenceQuality, 2);
    contextCompleteness = Math.min(contextCompleteness, 2);
    verificationBurden = Math.min(verificationBurden, 2);
  }

  return {
    "Source Visibility": clampScore(sourceVisibility),
    "Evidence Quality": clampScore(evidenceQuality),
    "Claim Discipline": clampScore(claimDiscipline),
    "Confidence Calibration": clampScore(confidenceCalibration),
    "Uncertainty Handling": clampScore(uncertaintyHandling),
    "Fact vs Interpretation": clampScore(factVsInterpretation),
    "Context Completeness": clampScore(contextCompleteness),
    "Verification Burden": clampScore(verificationBurden)
  };
}

function computeWeightedTrustScore(scores: CategoryScoreMap) {
  const weighted = CATEGORY_ORDER.reduce((total, category) => {
    const categoryScore = scores[category];
    const weight = CATEGORY_WEIGHTS[category];
    return total + (categoryScore / 5) * weight;
  }, 0);

  return Math.round(weighted);
}

function getGuardrailSignals(scores: CategoryScoreMap): GuardrailSignalSet {
  const weakOrPoorCount = CATEGORY_ORDER.filter((category) => scores[category] <= 2).length;
  const hasCriticalOne =
    scores["Source Visibility"] === 1 ||
    scores["Evidence Quality"] === 1 ||
    scores["Fact vs Interpretation"] === 1;

  const overstatementRisk =
    scores["Claim Discipline"] <= 2 && scores["Confidence Calibration"] <= 2;
  const lowContext = scores["Context Completeness"] <= 2;
  const lowVerificationBurden = scores["Verification Burden"] <= 2;

  return {
    blockHighTrust: hasCriticalOne,
    enforceLimitedOrWeak: weakOrPoorCount >= 3,
    enforceStrongReview: lowVerificationBurden || weakOrPoorCount >= 3 || hasCriticalOne,
    enforceRecommendedReview: lowVerificationBurden,
    addOverstatementFlag: overstatementRisk,
    addContextFlag: lowContext,
    addContextVerifyStep: lowContext
  };
}

function applyTrustLevelGuardrails(
  scores: CategoryScoreMap,
  baseTrustLevel: TrustLevel,
  signals: GuardrailSignalSet
): TrustLevel {
  let trustLevel = baseTrustLevel;
  const weakOrPoorCount = CATEGORY_ORDER.filter((category) => scores[category] <= 2).length;

  if (signals.blockHighTrust && trustLevel === "High trust support") {
    trustLevel = "Moderate trust support";
  }

  if (signals.enforceLimitedOrWeak && trustLevel === "High trust support") {
    trustLevel = "Limited trust support";
  }

  if (signals.enforceLimitedOrWeak && trustLevel === "Moderate trust support") {
    trustLevel = "Limited trust support";
  }

  if (weakOrPoorCount >= 5) {
    trustLevel = "Weak trust support";
  }

  return trustLevel;
}

function reviewStrength(rec: HumanReviewRecommendation) {
  if (rec === "Not usually necessary") return 1;
  if (rec === "Recommended") return 2;
  return 3;
}

function strongerReview(
  current: HumanReviewRecommendation,
  minimum: HumanReviewRecommendation
): HumanReviewRecommendation {
  return reviewStrength(current) >= reviewStrength(minimum) ? current : minimum;
}

function getHumanReviewRecommendation(
  trustScore: number,
  scores: CategoryScoreMap,
  signals: GuardrailSignalSet
): HumanReviewRecommendation {
  const coreWeak =
    scores["Source Visibility"] <= 2 ||
    scores["Evidence Quality"] <= 2 ||
    scores["Fact vs Interpretation"] <= 2;
  const weakCount = CATEGORY_ORDER.filter((category) => scores[category] <= 2).length;

  let recommendation: HumanReviewRecommendation = "Recommended";

  // Spec rule: High trust + no major weak categories + verification burden 4/5.
  if (
    trustScore >= 85 &&
    weakCount === 0 &&
    scores["Verification Burden"] >= 4 &&
    !coreWeak
  ) {
    recommendation = "Not usually necessary";
  }

  // Spec rule: Below 70, verification burden 1/2, or core category weak/poor.
  if (trustScore < 70 || scores["Verification Burden"] <= 2 || coreWeak) {
    recommendation = "Strongly recommended";
  } else if (trustScore >= 70 || (weakCount >= 1 && weakCount <= 2)) {
    recommendation = "Recommended";
  }

  if (signals.enforceRecommendedReview) {
    recommendation = strongerReview(recommendation, "Recommended");
  }

  if (signals.enforceStrongReview) {
    recommendation = strongerReview(recommendation, "Strongly recommended");
  }

  return recommendation;
}

function getStrengths(scores: CategoryScoreMap) {
  return [...CATEGORY_ORDER]
    .sort((a, b) => scores[b] - scores[a])
    .filter((category) => scores[category] >= 4)
    .slice(0, 2);
}

function getWeaknesses(scores: CategoryScoreMap) {
  return [...CATEGORY_ORDER]
    .sort((a, b) => scores[a] - scores[b])
    .filter((category) => scores[category] <= 2)
    .slice(0, 2);
}

function formatCategoryList(categories: CategoryName[]) {
  if (categories.length === 0) return "";
  if (categories.length === 1) return categories[0].toLowerCase();
  return `${categories[0].toLowerCase()} and ${categories[1].toLowerCase()}`;
}

function buildSummary(
  trustScore: number,
  trustLevel: TrustLevel,
  scores: CategoryScoreMap,
  reviewRecommendation: HumanReviewRecommendation
) {
  const strengths = getStrengths(scores);
  const weaknesses = getWeaknesses(scores);
  const strengthText = formatCategoryList(strengths);
  const weaknessText = formatCategoryList(weaknesses);

  const firstSentence = `This content shows ${trustLevel.toLowerCase()} with a trust score of ${trustScore}.`;
  const secondSentence =
    strengths.length > 0
      ? `Its strongest signals appear in ${strengthText}.`
      : "Its strongest signals are limited, so confidence should stay provisional.";
  const thirdSentence =
    weaknesses.length > 0
      ? `The biggest gaps are in ${weaknessText}, so human review is ${reviewRecommendation.toLowerCase()} before relying on it.`
      : `No category is currently weak or poor, and human review is ${reviewRecommendation.toLowerCase()} as the current recommendation.`;

  return `${firstSentence} ${secondSentence} ${thirdSentence}`;
}

function buildRedFlags(scores: CategoryScoreMap, signals: GuardrailSignalSet) {
  const materiallySensitiveCategories = new Set<CategoryName>([
    "Source Visibility",
    "Evidence Quality",
    "Claim Discipline",
    "Confidence Calibration",
    "Fact vs Interpretation",
    "Verification Burden"
  ]);

  const redFlags: string[] = [];

  for (const category of CATEGORY_ORDER) {
    const score = scores[category];

    // Spec rule: <=2 always flagged; 3 flagged only when materially trust-impacting.
    if (score <= 2 || (score === 3 && materiallySensitiveCategories.has(category))) {
      redFlags.push(`${category} is currently ${toLabel(score).toLowerCase()}.`);
    }
  }

  if (signals.addOverstatementFlag) {
    redFlags.push("Overstatement risk: claims may be more certain than the support allows.");
  }

  if (signals.addContextFlag) {
    redFlags.push(
      "Context risk: missing date, scope, or background may materially affect interpretation."
    );
  }

  return Array.from(new Set(redFlags)).slice(0, 6);
}

function buildVerifyNext(scores: CategoryScoreMap, signals: GuardrailSignalSet) {
  const actionsByCategory: Record<CategoryName, string> = {
    "Source Visibility": "Identify and review the original sources behind the strongest claims.",
    "Evidence Quality":
      "Find at least one independent source with concrete data that supports the main claims.",
    "Claim Discipline":
      "Rewrite or annotate any sweeping statements so they match the available support.",
    "Confidence Calibration":
      "Adjust definitive wording where evidence is limited, mixed, or uncertain.",
    "Uncertainty Handling":
      "Add missing caveats, exceptions, or known unknowns to the key conclusions.",
    "Fact vs Interpretation":
      "Separate observed facts from conclusions or opinions in each major point.",
    "Context Completeness":
      "Confirm date, scope, and background context before relying on the conclusions.",
    "Verification Burden":
      "Run an independent cross-check of the core claim before taking action."
  };

  const sorted = [...CATEGORY_ORDER].sort((a, b) => scores[a] - scores[b]);
  const verifyNext: string[] = [];

  for (const category of sorted) {
    if (scores[category] <= 3) {
      verifyNext.push(actionsByCategory[category]);
    }
    if (verifyNext.length === 5) break;
  }

  if (signals.addContextVerifyStep) {
    verifyNext.unshift(
      "Confirm the timeframe and scope boundaries so missing context does not distort the takeaway."
    );
  }

  const deduped = Array.from(new Set(verifyNext));
  const fallbackActions = [
    "Check whether key claims are attributed to specific, identifiable sources.",
    "Cross-check one central claim with an independent reference.",
    "Note any assumptions that should be validated before use."
  ];

  for (const action of fallbackActions) {
    if (deduped.length >= 3) break;
    deduped.push(action);
  }

  return deduped.slice(0, 5);
}

function toCategoryBreakdown(scores: CategoryScoreMap): CategoryBreakdownItem[] {
  return CATEGORY_ORDER.map((category) => ({
    name: category,
    score: scores[category],
    label: toLabel(scores[category])
  }));
}

export function analyzeTextPlaceholder(text: string): TrustCheckAnalysisResult {
  const trimmed = text.trim();
  const scores = computeCategoryScores(trimmed);
  const trustScore = computeWeightedTrustScore(scores);
  const signals = getGuardrailSignals(scores);

  const baseTrustLevel = getTrustLevelFromScore(trustScore);
  const trustLevel = applyTrustLevelGuardrails(scores, baseTrustLevel, signals);
  const humanReviewRecommendation = getHumanReviewRecommendation(
    trustScore,
    scores,
    signals
  );
  const contentTypeGuess = guessContentType(trimmed);

  return {
    trustScore,
    trustLevel,
    contentTypeGuess,
    humanReviewRecommendation,
    categoryBreakdown: toCategoryBreakdown(scores),
    summary: buildSummary(
      trustScore,
      trustLevel,
      scores,
      humanReviewRecommendation
    ),
    redFlags: buildRedFlags(scores, signals),
    verifyNext: buildVerifyNext(scores, signals)
  };
}

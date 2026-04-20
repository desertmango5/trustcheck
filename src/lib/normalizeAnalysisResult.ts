import type {
  CategoryBreakdownItem,
  CategoryName,
  ContentTypeGuess,
  HumanReviewRecommendation,
  TrustCheckAnalysisResult,
  TrustLevel
} from "@/types/trustcheck";

const CATEGORY_ORDER: CategoryName[] = [
  "Source Visibility",
  "Evidence Quality",
  "Claim Discipline",
  "Confidence Calibration",
  "Uncertainty Handling",
  "Fact vs Interpretation",
  "Context Completeness",
  "Verification Burden"
];

const TRUST_LEVELS: TrustLevel[] = [
  "High trust support",
  "Moderate trust support",
  "Limited trust support",
  "Weak trust support"
];

const CONTENT_TYPES: ContentTypeGuess[] = [
  "reporting",
  "opinion",
  "summary",
  "persuasive content",
  "professional writing",
  "academic-style writing",
  "mixed/unclear"
];

const REVIEW_RECOMMENDATIONS: HumanReviewRecommendation[] = [
  "Not usually necessary",
  "Recommended",
  "Strongly recommended"
];

const CATEGORY_LABELS: CategoryBreakdownItem["label"][] = [
  "Strong",
  "Good",
  "Moderate",
  "Weak",
  "Poor"
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toSafeString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function toSafeStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  return normalized.length > 0 ? normalized : fallback;
}

function clampScore(value: unknown): CategoryBreakdownItem["score"] {
  const num = typeof value === "number" ? value : Number.NaN;
  if (!Number.isFinite(num)) return 3;
  if (num <= 1) return 1;
  if (num >= 5) return 5;
  return Math.round(num) as CategoryBreakdownItem["score"];
}

function scoreToLabel(score: CategoryBreakdownItem["score"]): CategoryBreakdownItem["label"] {
  if (score === 5) return "Strong";
  if (score === 4) return "Good";
  if (score === 3) return "Moderate";
  if (score === 2) return "Weak";
  return "Poor";
}

export function normalizeAnalysisResult(payload: unknown): TrustCheckAnalysisResult {
  const data = isObject(payload) ? payload : {};

  const trustScoreValue =
    typeof data.trustScore === "number" && Number.isFinite(data.trustScore)
      ? Math.max(0, Math.min(100, Math.round(data.trustScore)))
      : 0;

  const trustLevel = TRUST_LEVELS.includes(data.trustLevel as TrustLevel)
    ? (data.trustLevel as TrustLevel)
    : "Weak trust support";

  const contentTypeGuess = CONTENT_TYPES.includes(data.contentTypeGuess as ContentTypeGuess)
    ? (data.contentTypeGuess as ContentTypeGuess)
    : "mixed/unclear";

  const humanReviewRecommendation = REVIEW_RECOMMENDATIONS.includes(
    data.humanReviewRecommendation as HumanReviewRecommendation
  )
    ? (data.humanReviewRecommendation as HumanReviewRecommendation)
    : "Recommended";

  const rawBreakdown = Array.isArray(data.categoryBreakdown) ? data.categoryBreakdown : [];
  const breakdownByName = new Map<CategoryName, CategoryBreakdownItem>();

  for (const item of rawBreakdown) {
    if (!isObject(item)) continue;
    const name = item.name;
    if (!CATEGORY_ORDER.includes(name as CategoryName)) continue;
    const score = clampScore(item.score);
    const requestedLabel = item.label;
    const label = CATEGORY_LABELS.includes(requestedLabel as CategoryBreakdownItem["label"])
      ? (requestedLabel as CategoryBreakdownItem["label"])
      : scoreToLabel(score);

    breakdownByName.set(name as CategoryName, {
      name: name as CategoryName,
      score,
      label
    });
  }

  const categoryBreakdown = CATEGORY_ORDER.map(
    (name): CategoryBreakdownItem =>
      breakdownByName.get(name) ?? {
        name,
        score: 3,
        label: "Moderate"
      }
  );

  return {
    trustScore: trustScoreValue,
    trustLevel,
    contentTypeGuess,
    humanReviewRecommendation,
    categoryBreakdown,
    summary: toSafeString(
      data.summary,
      "A complete analysis summary was not returned. Please review category signals and verify key claims before relying on this content."
    ),
    redFlags: toSafeStringArray(data.redFlags, [
      "No specific red flags were returned. Review weak categories before relying on this content."
    ]),
    verifyNext: toSafeStringArray(data.verifyNext, [
      "Check the strongest claim against an independent source.",
      "Confirm source attribution for key statements.",
      "Add missing context, limits, or caveats before relying on conclusions."
    ]).slice(0, 5)
  };
}

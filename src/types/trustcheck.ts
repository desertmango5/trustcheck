export type TrustLevel =
  | "High trust support"
  | "Moderate trust support"
  | "Limited trust support"
  | "Weak trust support";

export type ContentTypeGuess =
  | "reporting"
  | "opinion"
  | "summary"
  | "persuasive content"
  | "professional writing"
  | "academic-style writing"
  | "mixed/unclear";

export type HumanReviewRecommendation =
  | "Not usually necessary"
  | "Recommended"
  | "Strongly recommended";

export type CategoryLabel = "Strong" | "Good" | "Moderate" | "Weak" | "Poor";

export type CategoryName =
  | "Source Visibility"
  | "Evidence Quality"
  | "Claim Discipline"
  | "Confidence Calibration"
  | "Uncertainty Handling"
  | "Fact vs Interpretation"
  | "Context Completeness"
  | "Verification Burden";

export interface CategoryBreakdownItem {
  name: CategoryName;
  score: 1 | 2 | 3 | 4 | 5;
  label: CategoryLabel;
}

export interface TrustCheckAnalysisResult {
  trustScore: number;
  trustLevel: TrustLevel;
  contentTypeGuess: ContentTypeGuess;
  humanReviewRecommendation: HumanReviewRecommendation;
  categoryBreakdown: CategoryBreakdownItem[];
  summary: string;
  redFlags: string[];
  verifyNext: string[];
}

export interface AnalyzeTrustRequestBody {
  text?: string;
  url?: string;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeAnalysisResult } from "@/lib/normalizeAnalysisResult";
import { TRUSTCHECK_SAMPLE_CASES } from "@/lib/sampleCases";
import type { TrustCheckAnalysisResult } from "@/types/trustcheck";
import type { FormEvent, KeyboardEvent } from "react";

function joinWithAnd(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function getHumanReviewReason(result: TrustCheckAnalysisResult) {
  if (!result.categoryBreakdown || !result.humanReviewRecommendation) {
    return "Recommendation detail is not available for this analysis.";
  }

  const scoreByCategory = new Map(
    result.categoryBreakdown.map((category) => [category.name, category.score] as const)
  );

  const sourceVisibility = scoreByCategory.get("Source Visibility") ?? 3;
  const evidenceQuality = scoreByCategory.get("Evidence Quality") ?? 3;
  const factVsInterpretation = scoreByCategory.get("Fact vs Interpretation") ?? 3;
  const verificationBurden = scoreByCategory.get("Verification Burden") ?? 3;

  const weakCore: string[] = [];
  if (sourceVisibility <= 2) weakCore.push("Source Visibility");
  if (evidenceQuality <= 2) weakCore.push("Evidence Quality");
  if (factVsInterpretation <= 2) weakCore.push("Fact vs Interpretation");

  if (result.humanReviewRecommendation === "Not usually necessary") {
    return "High trust support with no weak major categories and a manageable verification burden.";
  }

  const reasons: string[] = [];
  if ((result.trustScore ?? 0) < 70) {
    reasons.push("the overall trust score is below 70");
  }
  if (verificationBurden <= 2) {
    reasons.push("Verification Burden is high");
  }
  if (weakCore.length > 0) {
    reasons.push(`${joinWithAnd(weakCore)} ${weakCore.length > 1 ? "are" : "is"} weak or poor`);
  }

  if (reasons.length === 0 && result.humanReviewRecommendation === "Recommended") {
    return "Overall trust signals are mixed, so a quick human review is still helpful before relying on the content.";
  }

  if (reasons.length === 0) {
    return "Multiple credibility signals need closer review before relying on the content.";
  }

  return `This recommendation is shown because ${joinWithAnd(reasons)}.`;
}

function getWeakCategoryNames(result: TrustCheckAnalysisResult) {
  return (result.categoryBreakdown ?? [])
    .filter((category) => category.score <= 2)
    .map((category) => category.name);
}

function trustLevelClass(level: TrustCheckAnalysisResult["trustLevel"]) {
  if (!level) return "trust-weak";
  if (level === "High trust support") return "trust-high";
  if (level === "Moderate trust support") return "trust-moderate";
  if (level === "Limited trust support") return "trust-limited";
  return "trust-weak";
}

function analysisConfidenceClass(
  confidence: TrustCheckAnalysisResult["analysisConfidence"]
) {
  if (confidence === "High") return "confidence-high";
  if (confidence === "Moderate") return "confidence-moderate";
  return "confidence-low";
}

function categoryMeterClass(score: 1 | 2 | 3 | 4 | 5) {
  if (score === 5) return "meter-score-5";
  if (score === 4) return "meter-score-4";
  if (score === 3) return "meter-score-3";
  if (score === 2) return "meter-score-2";
  return "meter-score-1";
}

function renderHighStakesWarning(result: TrustCheckAnalysisResult) {
  if (!result.highStakesWarning || !result.highStakesMessage) return null;

  return (
    <article className="result-panel full-width high-stakes-card">
      <h3>High-Stakes Use Warning</h3>
      <p className="high-stakes-short">
        For high-stakes decisions, verify against qualified sources or
        professionals.
      </p>
      <p>{result.highStakesMessage}</p>
    </article>
  );
}

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [analysisResult, setAnalysisResult] =
    useState<TrustCheckAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isScoreTooltipOpen, setIsScoreTooltipOpen] = useState(false);
  const scoreTooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isResultsOpen) return;

    function handleEscapeKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && !isAnalyzing) {
        setIsResultsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isResultsOpen, isAnalyzing]);

  useEffect(() => {
    if (!isResultsOpen) {
      setIsScoreTooltipOpen(false);
    }
  }, [isResultsOpen]);

  useEffect(() => {
    if (!isScoreTooltipOpen) return;

    function handleOutsidePointer(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (scoreTooltipRef.current && target && !scoreTooltipRef.current.contains(target)) {
        setIsScoreTooltipOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsidePointer);
    document.addEventListener("touchstart", handleOutsidePointer);
    return () => {
      document.removeEventListener("mousedown", handleOutsidePointer);
      document.removeEventListener("touchstart", handleOutsidePointer);
    };
  }, [isScoreTooltipOpen]);

  async function handleAnalyze() {
    const normalizedInput = inputText.trim();
    const normalizedUrl = inputUrl.trim();

    if (!normalizedInput && !normalizedUrl) {
      setAnalysisResult(null);
      setErrorMessage(
        "Please enter text or a public article URL before running TrustCheck."
      );
      return;
    }

    setErrorMessage(null);
    setIsResultsOpen(true);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: normalizedInput, url: normalizedUrl })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          payload.error ??
            "We could not complete the analysis. Please review your input and try again."
        );
      }

      const payload = (await response.json().catch(() => null)) as
        | TrustCheckAnalysisResult
        | null;
      setAnalysisResult(normalizeAnalysisResult(payload));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not complete the analysis right now. Please try again.";
      setErrorMessage(message);
      setIsResultsOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleAnalyzeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleAnalyze();
  }

  function loadSampleCase(caseText: string) {
    setInputText(caseText);
    setErrorMessage(null);
    setAnalysisResult(null);
  }

  function clearContent() {
    setInputText("");
    setInputUrl("");
    setErrorMessage(null);
    setAnalysisResult(null);
    setIsResultsOpen(false);
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void handleAnalyze();
    }
  }

  return (
    <main className="page">
      <section className="card">
        <header className="header">
          <p className="eyebrow">Credibility review for written content</p>
          <h1>
            <span className="brand-trust">Trust</span>Check
            <span className="brand-checkmark" aria-hidden="true">
              ✓
            </span>
          </h1>
          <p className="tagline">Check before you trust.</p>
          <p className="description">
            TrustCheck helps you assess whether written content deserves
            confidence, caution, or closer verification.
          </p>
          <p className="description description-secondary">
            It evaluates credibility signals in the text and returns a practical
            review summary. TrustCheck is not an AI detector and does not
            guarantee truth or falsity.
          </p>
          <ol className="quick-steps" aria-label="How TrustCheck works">
            <li>Paste text you want to review.</li>
            <li>Run Analyze Trust to see score and category signals.</li>
            <li>Use Red Flags and Verify Next before relying on the content.</li>
          </ol>
        </header>

        <form className="analyzer" onSubmit={handleAnalyzeSubmit}>
          <h2 className="section-heading">Analyze Content</h2>
          <label htmlFor="claim-input">
            Paste written content to evaluate credibility signals
          </label>
          <textarea
            id="claim-input"
            name="claim"
            placeholder="Paste an article summary, blog post, social claim, email draft, or report excerpt..."
            rows={10}
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
          />
          <label htmlFor="url-input">
            Optional: public article URL (TrustCheck will try to extract
            readable text)
          </label>
          <input
            id="url-input"
            name="url"
            type="url"
            placeholder="https://example.com/article"
            value={inputUrl}
            onChange={(event) => setInputUrl(event.target.value)}
          />
          <p className="input-helper">
            Public text-based webpages work best. Social video links are not
            supported.
          </p>
          <div className="action-row">
            <button type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Analyze Trust"}
            </button>
            <button
              type="button"
              className="clear-button"
              onClick={clearContent}
              disabled={isAnalyzing}
            >
              Clear
            </button>
          </div>
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
        </form>

        <details className="sample-cases">
          <summary className="sample-summary">Sample Inputs</summary>
          <p className="sample-helper">
            Use a sample case to test scoring and interpretation quickly.
          </p>
          <div className="sample-grid">
            {TRUSTCHECK_SAMPLE_CASES.map((sampleCase) => (
              <article className="sample-card" key={sampleCase.id}>
                <h3>{sampleCase.title}</h3>
                <p>{sampleCase.description}</p>
                <p>
                  <strong>Expected score behavior:</strong>{" "}
                  {sampleCase.expectedScoreBehavior}
                </p>
                <p>
                  <strong>Expected weak categories:</strong>{" "}
                  {sampleCase.expectedWeakCategories.join(", ")}
                </p>
                <button
                  type="button"
                  className="sample-button"
                  onClick={() => loadSampleCase(sampleCase.text)}
                >
                  Use This Sample
                </button>
              </article>
            ))}
          </div>
        </details>

        <section className="use-cases" aria-label="Example use cases">
          <h2 className="section-heading">Example Use Cases</h2>
          <div className="use-case-grid">
            <article className="use-case-card">
              <h3>Article review</h3>
              <p>Check whether a summary includes visible support before sharing it.</p>
            </article>
            <article className="use-case-card">
              <h3>Draft quality check</h3>
              <p>Evaluate cover letters or generated drafts for weak or vague claims.</p>
            </article>
            <article className="use-case-card">
              <h3>Social claim screening</h3>
              <p>Review persuasive posts to identify where verification is still needed.</p>
            </article>
          </div>
        </section>

        {isResultsOpen ? (
          <div
            className="results-modal-overlay"
            onClick={() => {
              if (!isAnalyzing) {
                setIsResultsOpen(false);
              }
            }}
          >
            <div
              className="results-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="results-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="results-modal-header">
                <p className="results-modal-brand">
                  <span className="brand-trust">Trust</span>Check
                  <span className="brand-checkmark" aria-hidden="true">
                    ✓
                  </span>
                </p>
                <h2 className="results-modal-title" id="results-title">
                  Results
                </h2>
                <button
                  type="button"
                  className="results-close-button"
                  onClick={() => setIsResultsOpen(false)}
                  disabled={isAnalyzing}
                >
                  Close
                </button>
              </div>

              <section className="results" aria-live="polite" aria-busy={isAnalyzing}>
                {isAnalyzing ? (
                  <p className="loading-text">
                    Analyzing credibility signals. This usually takes a moment.
                  </p>
                ) : null}
                {isAnalyzing ? (
                  <div className="results-skeleton" aria-hidden="true">
                    <div className="skeleton-block skeleton-large" />
                    <div className="skeleton-grid">
                      <div className="skeleton-block" />
                      <div className="skeleton-block" />
                    </div>
                    <div className="skeleton-grid">
                      <div className="skeleton-block" />
                      <div className="skeleton-block" />
                    </div>
                  </div>
                ) : !analysisResult ? (
                  <p className="results-placeholder">
                    Submit text or a public article URL to generate a structured
                    TrustCheck analysis.
                  </p>
                ) : analysisResult.analysisStatus === "cannot_score" ||
                  analysisResult.analysisStatus === "insufficient_basis" ? (
                  <>
                    <article className="result-panel full-width limitation-card">
                      <h3>{analysisResult.title}</h3>
                      <p>{analysisResult.message}</p>
                      <h3>Possible Reasons</h3>
                      <ul>
                        {(analysisResult.possibleReasons ?? []).map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                      <h3>Next Step</h3>
                      <p>{analysisResult.nextStep}</p>
                    </article>
                    {renderHighStakesWarning(analysisResult)}
                  </>
                ) : (
                  <>
                    {analysisResult.analysisStatus === "limited" &&
                    analysisResult.limitationMessage ? (
                      <article className="result-panel full-width limitation-card">
                        <h3>Limited Analysis</h3>
                        <p>{analysisResult.limitationMessage}</p>
                      </article>
                    ) : null}
                    {renderHighStakesWarning(analysisResult)}
                    <div className="results-top">
                      <article className="result-panel score-panel score-panel-large">
                        <div className="score-heading-row">
                          <h3>Overall Trust Score</h3>
                          <div
                            className={`score-tooltip ${
                              isScoreTooltipOpen ? "is-open" : ""
                            }`}
                            ref={scoreTooltipRef}
                          >
                            <button
                              type="button"
                              className="score-tooltip-trigger"
                              aria-label="How this score works"
                              aria-expanded={isScoreTooltipOpen}
                              onClick={() =>
                                setIsScoreTooltipOpen((previous) => !previous)
                              }
                            >
                              ⓘ
                            </button>
                            <div role="tooltip" className="score-tooltip-content">
                              How this score works: TrustCheck uses a weighted
                              rubric across 8 credibility categories, including
                              sources, evidence, claim discipline, uncertainty,
                              and verification burden. The score reflects
                              credibility signals in the content, not proof that
                              something is true or false.
                            </div>
                          </div>
                        </div>
                        <p className="score-value">{analysisResult.trustScore ?? "N/A"}</p>
                        <p className="score-scale">Scored on a 0-100 range</p>
                        <h3>Trust Level</h3>
                        <p
                          className={`trust-pill ${trustLevelClass(
                            analysisResult.trustLevel
                          )}`}
                        >
                          {analysisResult.trustLevel ?? "Unavailable"}
                        </p>
                        <h3>Analysis Confidence</h3>
                        <p
                          className={`confidence-pill ${analysisConfidenceClass(
                            analysisResult.analysisConfidence
                          )}`}
                        >
                          {analysisResult.analysisConfidence ?? "Moderate"}
                        </p>
                      </article>

                      <article className="result-panel summary-status">
                        <h3>Human Review Recommendation</h3>
                        <p>{analysisResult.humanReviewRecommendation ?? "Unavailable"}</p>
                        <p className="review-reason">
                          <strong>Why:</strong> {getHumanReviewReason(analysisResult)}
                        </p>
                        <h3>Weak Categories</h3>
                        {getWeakCategoryNames(analysisResult).length === 0 ? (
                          <p className="weak-none">No weak or poor categories currently.</p>
                        ) : (
                          <div className="weak-tags">
                            {getWeakCategoryNames(analysisResult).map((name) => (
                              <span className="weak-tag" key={name}>
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    </div>

                    <article className="result-panel full-width">
                      <h3>Category Breakdown</h3>
                      <div className="category-list">
                        {(analysisResult.categoryBreakdown ?? []).map((category) => (
                          <div className="category-row" key={category.name}>
                            <p className="category-name">{category.name}</p>
                            <div className="category-meter-wrap" aria-hidden="true">
                              <div
                                className={`category-meter-fill ${categoryMeterClass(
                                  category.score
                                )}`}
                                style={{ width: `${(category.score / 5) * 100}%` }}
                              />
                            </div>
                            <p className="category-score">{category.score}/5</p>
                            <p className="category-label">{category.label}</p>
                          </div>
                        ))}
                      </div>
                    </article>

                    <article className="result-panel full-width">
                      <h3>Summary</h3>
                      <p>{analysisResult.summary ?? "Summary unavailable."}</p>
                    </article>

                    <div className="results-grid">
                      <article className="result-panel">
                        <h3>Red Flags</h3>
                        <ul>
                          {(analysisResult.redFlags ?? []).map((flag) => (
                            <li key={flag}>{flag}</li>
                          ))}
                        </ul>
                      </article>

                      <article className="result-panel">
                        <h3>Verify Next</h3>
                        <ol>
                          {(analysisResult.verifyNext ?? []).map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </article>
                    </div>

                    <article className="result-panel full-width">
                      <h3>Content Type Guess</h3>
                      <p>{analysisResult.contentTypeGuess ?? "mixed/unclear"}</p>
                    </article>
                  </>
                )}
              </section>
            </div>
          </div>
        ) : null}

        <footer className="page-footer-link">
          <p className="disclaimer">
            TrustCheck evaluates credibility signals. It does not guarantee
            truth or falsity.
          </p>
        </footer>
      </section>
    </main>
  );
}

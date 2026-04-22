"use client";

import { useEffect, useState } from "react";

export default function DebugAnalyzedTextPage() {
  const [analyzedText, setAnalyzedText] = useState("");
  const [usedUrlExtraction, setUsedUrlExtraction] = useState(false);
  const [analyzedAt, setAnalyzedAt] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAnalyzedText(window.localStorage.getItem("trustcheck:last-analyzed-text") ?? "");
    setUsedUrlExtraction(
      (window.localStorage.getItem("trustcheck:last-analyzed-used-url") ?? "") ===
        "true"
    );
    setAnalyzedAt(window.localStorage.getItem("trustcheck:last-analyzed-at") ?? "");
  }, []);

  return (
    <main className="how-page">
      <article className="how-card debug-analyzed-card">
        <h1>Temporary Debug: Exact Analyzed Text</h1>
        <p>
          This page shows the exact text payload sent into TrustCheck analysis
          for your most recent run.
        </p>
        <p>
          URL extraction used: <strong>{usedUrlExtraction ? "Yes" : "No"}</strong>
        </p>
        {analyzedAt ? (
          <p>
            Captured at: <strong>{analyzedAt}</strong>
          </p>
        ) : null}

        {analyzedText ? (
          <pre className="debug-analyzed-text">{analyzedText}</pre>
        ) : (
          <p>
            No captured analyzed text found yet. Run an analysis first, then
            reopen this page from the Results modal link.
          </p>
        )}
      </article>
    </main>
  );
}


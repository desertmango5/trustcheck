# TrustCheck — Product Spec

## 1) Product Overview

**Product name:** TrustCheck  
**Tagline:** Check before you trust.

**One-line description:**  
TrustCheck is a lightweight web app that evaluates written content for credibility signals and helps users identify unsupported claims, weak sourcing, and what to verify before relying on it.

**Core purpose:**  
Help users decide what deserves trust, what deserves caution, and what deserves a second look.

**Important framing:**  
TrustCheck is a **general trustworthiness evaluation tool**, not an AI detector. It may evaluate AI-generated content, human-written content, or mixed content, but it does **not** attempt to determine authorship.

---

## 2) Version Scope

### Version 1 (build now)
TrustCheck V1 evaluates **text only**.

**Supported inputs:**
- Pasted text
- Optional public webpage/article URL only if simple enough to support after text input is working

**Supported content types:**
- article summaries
- blog posts
- AI-generated writing
- cover letters
- social media claims pasted as text
- email drafts
- internal summaries
- short reports

**V1 outputs:**
- Overall Trust Score (0–100)
- Trust Level label
- Category breakdown
- Summary
- Red Flags
- Verify Next checklist
- Human Review Recommendation
- Content Type Guess

### Version 2 (future)
Add **video/transcript evaluation**.

**Potential V2 inputs:**
- pasted transcript text
- captions
- selected supported video transcript sources

**Do not build in V1:**
- video analysis
- deepfake detection
- TikTok scraping
- frame-by-frame media forensics
- user accounts
- saved history
- collaboration
- browser extension support

---

## 3) Product Positioning

### What TrustCheck is
A credibility review tool for the AI era.

### What TrustCheck is not
- not an AI detector
- not a lie detector
- not a fact-checking authority
- not a guarantee of truth

### Positioning statement
TrustCheck evaluates credibility signals and highlights what deserves confidence, caution, or verification.

---

## 4) Target Users

### Primary users
- students
- job seekers
- everyday internet users
- professionals reviewing summaries or reports

### Secondary users
- researchers
- managers
- insurance or claims professionals
- anyone reviewing AI-assisted writing

---

## 5) Functional Requirements

### A. Input
The user can paste written content into a large text input field.

**Optional later enhancement for V1.1:**  
The user can submit a public article URL and the app will attempt to extract the readable page text. If extraction fails, the app should clearly instruct the user to paste the text manually.

### B. Analysis Trigger
The app includes a primary button labeled **Analyze Trust**.

When clicked, the app analyzes the input and returns a structured result.

### C. Output
The app must display:
- Overall Trust Score
- Trust Level
- Content Type Guess
- Summary
- Red Flags
- Verify Next
- Human Review Recommendation
- Category Breakdown

### D. Disclaimer
The UI must clearly state:

> TrustCheck evaluates credibility signals. It does not guarantee truth or falsity.

If URL analysis is supported, also state:

> Analysis is based on accessible page content and may miss paywalled, embedded, or hidden material.

---

## 6) Scoring Model

TrustCheck uses a **weighted rubric** with 8 categories. Each category is scored from **1 to 5**, then converted into an overall **0–100** Trust Score.

### Category Scale
- **5 = Strong** — clear, consistent strength in this category
- **4 = Good** — mostly strong, minor weaknesses
- **3 = Moderate** — acceptable but with noticeable limitations
- **2 = Weak** — important weaknesses reduce confidence
- **1 = Poor** — major credibility problem in this category

### Categories and Weights
- **Source Visibility** — 15%
- **Evidence Quality** — 20%
- **Claim Discipline** — 15%
- **Confidence Calibration** — 10%
- **Uncertainty Handling** — 10%
- **Fact vs Interpretation** — 10%
- **Context Completeness** — 10%
- **Verification Burden** — 10%

### Score Calculation
For each category:

`category contribution = (category score / 5) × category weight`

Overall score = sum of all category contributions, resulting in a value from 0 to 100.

---

## 7) Category Definitions and Exact Scoring Criteria

### 1. Source Visibility
**Question:** Are sources named, linked, quoted, or otherwise identifiable?

- **5 Strong:** Primary or clearly credible secondary sources are explicitly named; attribution is clear and specific; quotes, links, or references are included where needed.
- **4 Good:** Sources are mostly visible and identifiable; attribution is present for major claims; some minor claims may lack direct sourcing.
- **3 Moderate:** Some sources are mentioned, but attribution is incomplete or inconsistent; important claims may rely on vague references like “experts say” or “reports indicate.”
- **2 Weak:** Very limited source visibility; most claims are unattributed or weakly attributed; sources are vague, generic, or difficult to identify.
- **1 Poor:** No meaningful source attribution; major claims appear without any identifiable origin.

### 2. Evidence Quality
**Question:** Are claims supported by facts, data, examples, or references?

- **5 Strong:** Claims are supported by specific, relevant evidence; facts, examples, data, or references materially support conclusions.
- **4 Good:** Most important claims are supported; evidence is generally relevant and useful; a few claims may be lightly supported.
- **3 Moderate:** Some support is present, but it is uneven; evidence may be partial, general, or limited in depth.
- **2 Weak:** Support is thin or poorly matched to the claims; claims rely more on assertion than evidence.
- **1 Poor:** Little to no meaningful evidence is provided; major claims are unsupported.

### 3. Claim Discipline
**Question:** Does the content avoid exaggeration, overreach, and unsupported certainty?

- **5 Strong:** Claims stay within what the available support justifies; no obvious exaggeration or overreach.
- **4 Good:** Claims are mostly restrained and appropriate; minor overstatement may appear but does not materially distort the content.
- **3 Moderate:** Some claims are reasonable, but others stretch beyond the support; mild exaggeration appears in places.
- **2 Weak:** Multiple claims overreach the available evidence; broader conclusions are made than the support allows.
- **1 Poor:** Claims are exaggerated, sweeping, or recklessly overstated.

### 4. Confidence Calibration
**Question:** Does the language match the strength of the evidence?

**Hedging Distribution sub-signal:** TrustCheck evaluates not just whether uncertainty language appears, but how it is distributed. Cautious wording helps credibility only when paired with clear claims, identifiable sources, and meaningful supporting context. Selective hedging around weak, vague, or unsupported claims may count against the analysis rather than in its favor.

- **5 Strong:** Tone is appropriately calibrated; strong claims are made only when support is strong; tentative matters are framed with caution.
- **4 Good:** Language is mostly aligned with the evidence; minor overconfidence may appear, but calibration is generally good.
- **3 Moderate:** Language is somewhat mismatched to support; content occasionally sounds more certain than the evidence warrants.
- **2 Weak:** Overconfident or overly definitive language appears often; tone regularly outruns the support.
- **1 Poor:** The content presents uncertain or weakly supported material as settled fact.

### 5. Uncertainty Handling
**Question:** Does the content acknowledge ambiguity, limits, exceptions, or unknowns where appropriate?

- **5 Strong:** Uncertainty is clearly acknowledged where relevant; limits, caveats, and unknowns are handled thoughtfully.
- **4 Good:** Uncertainty is generally addressed; some nuance may be missing, but limits are recognized.
- **3 Moderate:** Some uncertainty is acknowledged, but incompletely; important caveats may be missing or underdeveloped.
- **2 Weak:** The content gives limited attention to uncertainty and tends to omit important limitations.
- **1 Poor:** The content ignores or suppresses uncertainty where it clearly matters.

### 6. Fact vs Interpretation
**Question:** Does the content clearly separate observable facts from conclusions, opinions, or inferences?

- **5 Strong:** Facts, interpretations, and opinions are clearly distinguished.
- **4 Good:** Distinctions are mostly clear; occasional blending appears but does not materially confuse the reader.
- **3 Moderate:** Some separation exists, but the line is not always clear.
- **2 Weak:** Facts and interpretation are often blurred.
- **1 Poor:** Interpretation is repeatedly presented as fact.

### 7. Context Completeness
**Question:** Is enough relevant context provided to understand the claim fairly and accurately?

- **5 Strong:** Important background is included; time, scope, conditions, and qualifiers are present where needed.
- **4 Good:** Context is generally sufficient; minor background may be missing without materially distorting understanding.
- **3 Moderate:** Basic context is present, but some important details are missing.
- **2 Weak:** Significant context is missing.
- **1 Poor:** Missing background materially distorts meaning or credibility.

### 8. Verification Burden
**Question:** How much independent checking would still be needed before relying on this content?

- **5 Strong:** Minimal additional verification is needed for ordinary use.
- **4 Good:** Some verification is still wise, but the content is generally reliable enough for preliminary use.
- **3 Moderate:** Noticeable checking is still needed; usable as a starting point, not a final authority.
- **2 Weak:** Significant independent verification is required.
- **1 Poor:** Extensive verification is required; the content is not fit to rely on in its current form.

---

## 8) Trust Level Labels

Based on the overall weighted Trust Score:

- **85–100:** High trust support
- **70–84:** Moderate trust support
- **50–69:** Limited trust support
- **0–49:** Weak trust support

These labels indicate the strength of credibility signals, not objective truth.

---

## 9) Output Interpretation Rules

### Summary
The summary should be **2–3 sentences** and answer:
1. What is the overall trust picture?
2. What are the biggest strengths?
3. What are the biggest weaknesses?

**Template:**
> This content shows [trust level] based on [top strengths]. However, [main weaknesses]. [Optional note about verification or human review.]

### Red Flags
Generate red flags when:
- a category score is **2 or below**, or
- a category score is **3** and the issue materially affects trustworthiness

### Verify Next
Provide **3 to 5 specific action steps** tied to the weakest categories.

### Human Review Recommendation
Must use one of these labels:
- **Not usually necessary**
- **Recommended**
- **Strongly recommended**

#### Rules
- Use **Not usually necessary** when overall score is high, no major category is weak or poor, and verification burden is 4 or 5.
- Use **Recommended** when overall score is moderate or one or two categories are weak.
- Use **Strongly recommended** when overall score is below 70, or verification burden is 1 or 2, or source visibility/evidence quality/fact vs interpretation is weak or poor.

### Content Type Guess
Use one of the following:
- reporting
- opinion
- summary
- persuasive content
- professional writing
- academic-style writing
- mixed/unclear

---

## 10) Guardrails

These rules override the raw weighted math when needed:

1. A **High trust support** label should be impossible if **Source Visibility**, **Evidence Quality**, or **Fact vs Interpretation** is **1**.
2. If **Verification Burden** is **1 or 2**, human review must be at least **Recommended**, usually **Strongly recommended**.
3. If **Claim Discipline** and **Confidence Calibration** are both **2 or below**, add a red flag about overstatement risk.
4. If **Context Completeness** is **2 or below**, add at least one Verify Next step related to date, scope, or missing background.
5. If **three or more categories** are **2 or below**, the trust level should usually fall into **Limited** or **Weak**, even if weighted math lands higher.
6. TrustCheck must score based on **credibility signals in the content**, not whether the evaluator agrees with the viewpoint.

---

## 11) User Interface Requirements

### Homepage
Must include:
- App name: **TrustCheck**
- Tagline: **Check before you trust.**
- Short product description
- Large text input area
- Analyze Trust button
- Optional URL input only if implemented simply
- 3 example use cases
- Disclaimer

### Results View
Must display, in a clear hierarchy:
1. Trust Score
2. Trust Level
3. Human Review Recommendation
4. Category Breakdown
5. Summary
6. Red Flags
7. Verify Next
8. Content Type Guess

### Visual Style
- clean
- professional
- minimal
- readable
- credible, not flashy

Avoid:
- hype language
- excessive animation
- gimmicky “AI detection” styling
- dramatic warning language

---

## 12) Tone and Content Rules

TrustCheck’s language must be:
- clear
- practical
- calm
- non-absolute
- tied to the rubric

TrustCheck must **not** say things like:
- “This is definitely true.”
- “This is false.”
- “This was written by AI.”
- “This source is lying.”

TrustCheck should say things like:
- “This content shows weak source visibility.”
- “Several claims need stronger support.”
- “Human review is recommended before relying on this.”

---

## 13) Technical Requirements

### Recommended stack
- Next.js
- React
- Tailwind CSS or simple CSS
- Single API route for analysis
- Deploy on Vercel

### Technical behavior
- App should support text analysis first
- Analysis should return structured JSON
- Frontend should render results cleanly
- If URL analysis is added, failures should degrade gracefully with a clear manual-paste fallback

### Suggested output shape
```json
{
  "trustScore": 76,
  "trustLevel": "Moderate trust support",
  "contentTypeGuess": "summary",
  "humanReviewRecommendation": "Recommended",
  "categoryBreakdown": [
    { "name": "Source Visibility", "score": 4, "label": "Good" },
    { "name": "Evidence Quality", "score": 3, "label": "Moderate" },
    { "name": "Claim Discipline", "score": 4, "label": "Good" },
    { "name": "Confidence Calibration", "score": 3, "label": "Moderate" },
    { "name": "Uncertainty Handling", "score": 2, "label": "Weak" },
    { "name": "Fact vs Interpretation", "score": 4, "label": "Good" },
    { "name": "Context Completeness", "score": 3, "label": "Moderate" },
    { "name": "Verification Burden", "score": 3, "label": "Moderate" }
  ],
  "summary": "This content shows moderate trust support because it includes some visible sourcing and generally separates fact from interpretation. However, uncertainty is handled weakly and several claims need stronger support. Additional review is recommended before relying on it.",
  "redFlags": [
    "Several claims are only lightly supported.",
    "Important caveats or uncertainty are missing.",
    "Some wording is more confident than the evidence justifies."
  ],
  "verifyNext": [
    "Check the original source for the strongest claim.",
    "Look for missing limitations or exceptions.",
    "Compare the main claim against one independent source."
  ]
}

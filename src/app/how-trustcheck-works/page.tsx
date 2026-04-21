import Link from "next/link";

export default function HowTrustCheckWorksPage() {
  return (
    <main className="how-page">
      <article className="how-card">
        <header>
          <h1>
            How <span className="brand-trust">Trust</span>Check
            <span className="brand-checkmark" aria-hidden="true">
              ✓
            </span>{" "}
            Works
          </h1>
          <p>
            TrustCheck helps users evaluate whether written content shows strong
            credibility signals. It does this by reviewing the content across
            multiple categories related to sourcing, evidence, clarity, and the
            need for verification.
          </p>
          <p>
            TrustCheck is not a fact-checking authority, a lie detector, or an
            AI detector. It does not determine whether something is true or
            false. Instead, it helps users see what supports trust, what
            weakens trust, and what may need a closer look.
          </p>
        </header>

        <section>
          <h2>How the score is calculated</h2>
          <p>
            TrustCheck uses a weighted rubric across 8 credibility categories.
            Each category is scored on a scale from 1 to 5, then combined into
            an overall Trust Score from 0 to 100.
          </p>
          <ul>
            <li>5 = Strong — clear, consistent strength in this category</li>
            <li>4 = Good — mostly strong, minor weaknesses</li>
            <li>3 = Moderate — acceptable but with noticeable limitations</li>
            <li>2 = Weak — important weaknesses reduce confidence</li>
            <li>1 = Poor — major credibility problem in this category</li>
          </ul>
        </section>

        <section>
          <h2>The 8 categories and their weights</h2>
          <ul>
            <li>
              <strong>Source Visibility — 15%</strong>
              <br />
              Are sources named, linked, quoted, or otherwise identifiable?
            </li>
            <li>
              <strong>Evidence Quality — 20%</strong>
              <br />
              Are claims supported by facts, data, examples, or references?
            </li>
            <li>
              <strong>Claim Discipline — 15%</strong>
              <br />
              Does the content avoid exaggeration, overreach, and unsupported
              certainty?
            </li>
            <li>
              <strong>Confidence Calibration — 10%</strong>
              <br />
              Does the language match the strength of the evidence?
            </li>
            <li>
              <strong>Uncertainty Handling — 10%</strong>
              <br />
              Does the content acknowledge ambiguity, limits, or unknowns where
              appropriate?
            </li>
            <li>
              <strong>Fact vs Interpretation — 10%</strong>
              <br />
              Does the content clearly separate observable facts from
              conclusions, opinions, or inferences?
            </li>
            <li>
              <strong>Context Completeness — 10%</strong>
              <br />
              Is enough relevant context provided to understand the claim fairly
              and accurately?
            </li>
            <li>
              <strong>Verification Burden — 10%</strong>
              <br />
              How much independent checking would still be needed before relying
              on this content?
            </li>
          </ul>
        </section>

        <section>
          <h2>Why some categories carry more weight</h2>
          <p>
            Not every category contributes equally to the Trust Score. Some
            factors matter more because they form the foundation of credibility.
          </p>
          <p>
            For example, Evidence Quality carries the most weight at 20% because
            strong claims need real support. Source Visibility and Claim
            Discipline each carry 15% because it matters both where information
            comes from and whether the content stays within what the evidence
            actually justifies.
          </p>
          <p>
            The remaining categories each carry 10% and help measure how
            responsibly the content presents information, handles ambiguity, and
            signals the need for further review.
          </p>
        </section>

        <section>
          <h2>Why the score is not just math</h2>
          <p>
            TrustCheck also uses guardrails. This helps prevent weak foundations
            from receiving overly high trust ratings.
          </p>
          <p>For example:</p>
          <ul>
            <li>poor sourcing can limit how high a trust rating should go</li>
            <li>
              weak evidence can reduce confidence even if the writing sounds
              polished
            </li>
            <li>
              high verification burden can trigger a stronger recommendation for
              human review
            </li>
          </ul>
          <p className="how-note-spaced">
            This is meant to keep the score more realistic and transparent.
          </p>
        </section>

        <section>
          <h2>What the trust score means</h2>
          <p>
            The Trust Score reflects the strength of credibility signals in the
            content. It is not a measure of objective truth.
          </p>
          <p>Trust levels:</p>
          <ul>
            <li>85–100: High trust support</li>
            <li>70–84: Moderate trust support</li>
            <li>50–69: Limited trust support</li>
            <li>0–49: Weak trust support</li>
          </ul>
          <p className="how-note-spaced">
            These levels are meant to show how much confidence the content
            appears to support, and how much caution or verification may still
            be needed.
          </p>
        </section>

        <section>
          <h2>Why people may disagree with a score</h2>
          <p>
            TrustCheck evaluates the presentation of support in the content
            provided to it. It does not determine whether a claim is ultimately
            true or false in the real world.
          </p>
          <p>Because of this:</p>
          <ul>
            <li>
              a claim may be true but weakly supported in the provided text
            </li>
            <li>
              a claim may be misleading in reality while still
              being presented with relatively strong credibility signals
            </li>
            <li>
              the Trust Score reflects sourcing, evidence, context, and
              interpretive discipline within the content itself
            </li>
          </ul>
          <p className="how-short-examples">Short examples:</p>
          <ul>
            <li>
              true claim with weak support: "Local air quality improved this
              year," but the text provides no source, no data, and no timeframe
            </li>
            <li>
              strong-looking claim that still needs outside verification: "A new
              policy cut fraud by 40%," with a clear chart but no independent
              source link
            </li>
            <li>
              forceful opinion with insufficient basis: "This approach is
              obviously the only solution," with persuasive wording but little
              evidence
            </li>
          </ul>
          <p className="how-note-spaced">
            TrustCheck is designed to support evaluation of credibility
            signals, not replace fact-checking or real-world verification.
          </p>
        </section>

        <section>
          <h2>What TrustCheck does not do</h2>
          <ul>
            <li>prove something is true</li>
            <li>prove something is false</li>
            <li>identify whether content was written by AI</li>
            <li>replace human judgment</li>
          </ul>
          <p className="how-note-spaced">
            TrustCheck is designed to support review, not replace it.
          </p>
        </section>

        <section>
          <h2>Best way to use TrustCheck</h2>
          <p>TrustCheck works best as a decision-support tool.</p>
          <p>It can help users:</p>
          <ul>
            <li>spot weak sourcing</li>
            <li>notice overconfident claims</li>
            <li>identify missing context</li>
            <li>decide what to verify next</li>
          </ul>
          <p className="how-note-spaced">
            For high-stakes decisions, important claims should still be reviewed
            carefully and, when appropriate, checked against original or
            independent sources.
          </p>
        </section>

        <p className="how-closing">
          TrustCheck is built to make credibility easier to examine, not easier
          to assume.
        </p>

        <p className="how-back-link">
          <Link href="/">Back to TrustCheck</Link>
        </p>
      </article>
    </main>
  );
}

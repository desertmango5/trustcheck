import type { CategoryName } from "@/types/trustcheck";

export interface TrustCheckSampleCase {
  id: string;
  title: string;
  description: string;
  text: string;
  expectedScoreBehavior: string;
  expectedWeakCategories: CategoryName[];
}

export const TRUSTCHECK_SAMPLE_CASES: TrustCheckSampleCase[] = [
  {
    id: "credible-article-summary",
    title: "Reasonably Credible Article Summary",
    description: "A balanced summary with visible sourcing and measured wording.",
    text: `According to the City Health Department's 2025 respiratory report (https://cityhealth.example.gov/reports/respiratory-2025), emergency visits for severe asthma dropped by 12% after indoor air filter upgrades were introduced in public schools. The report cites monitoring data collected from 48 schools between January and November 2025 and compares rates with the same period in 2024. A separate university brief (https://publichealth.example.edu/briefs/school-air-quality) reports a similar trend, while noting that weather variation and seasonal infections may also affect outcomes. Overall, the evidence suggests the upgrades likely helped, but the authors caution that follow-up across additional districts is still needed.`,
    expectedScoreBehavior:
      "Should trend in the moderate-to-high range due to sourcing, evidence, and caveats.",
    expectedWeakCategories: ["Verification Burden"]
  },
  {
    id: "weak-blog-claim",
    title: "Weak Blog-Style Claim",
    description: "Sweeping claims with little attribution or evidence.",
    text: `Everyone knows productivity apps are ruining focus forever. I have seen it everywhere, and people say attention spans are basically gone now. This proves modern tools are a disaster and no one can work deeply anymore. Experts say this is the worst decline in history, and it will only get worse.`,
    expectedScoreBehavior:
      "Should trend in the weak range because evidence and sourcing are minimal.",
    expectedWeakCategories: [
      "Source Visibility",
      "Evidence Quality",
      "Claim Discipline",
      "Confidence Calibration"
    ]
  },
  {
    id: "ai-cover-letter-vague",
    title: "AI-Style Cover Letter With Vague Claims",
    description: "Polished but generic claims without concrete support.",
    text: `Dear Hiring Manager, I am excited to apply for the Operations Analyst role. Throughout my career, I have consistently driven outstanding results, improved cross-functional performance, and delivered strategic impact in fast-paced environments. I am highly skilled at solving complex problems, aligning stakeholders, and creating measurable value. My background has prepared me to make an immediate difference on day one, and I am confident I would be a strong fit for your organization.`,
    expectedScoreBehavior:
      "Should trend in the limited-to-weak range due to vague evidence and overconfident tone.",
    expectedWeakCategories: [
      "Evidence Quality",
      "Source Visibility",
      "Confidence Calibration",
      "Verification Burden"
    ]
  },
  {
    id: "social-persuasive-post",
    title: "Social-Media-Style Persuasive Post",
    description: "Short persuasive post with urgency and minimal verification detail.",
    text: `If you care about your family, stop buying from Brand X right now. They always hide the truth and definitely use unsafe ingredients. Share this today so everyone sees it before it's deleted. We must boycott them immediately.`,
    expectedScoreBehavior:
      "Should trend in the weak range because persuasive certainty outruns support.",
    expectedWeakCategories: [
      "Claim Discipline",
      "Confidence Calibration",
      "Evidence Quality",
      "Fact vs Interpretation"
    ]
  },
  {
    id: "academic-style-summary",
    title: "Academic-Style Summary With Decent Structure",
    description: "Structured summary with method, findings, and limitations.",
    text: `This summary reviews a 2024 multi-site study on remote onboarding outcomes. The authors measured 90-day retention across 22 teams and reported a 7% higher retention rate when new hires completed a structured mentor check-in protocol. The paper distinguishes observed outcomes from interpretation and notes that team size and manager tenure were potential confounders. Results are promising, but the authors state that additional replication in non-technology sectors is needed before generalizing broadly.`,
    expectedScoreBehavior:
      "Should trend in the moderate range with stronger marks for structure and uncertainty handling.",
    expectedWeakCategories: ["Source Visibility", "Verification Burden"]
  },
  {
    id: "hedging-justified-uncertainty",
    title: "Justified Uncertainty With Clear Support",
    description:
      "Cautious wording is paired with identifiable sources, evidence, and context.",
    text: `According to the county public health dashboard (https://countyhealth.example.gov/dashboard) and a university report published in February 2026 (https://research.example.edu/respiratory-report-2026), emergency visits for asthma may have declined by about 9% after school ventilation upgrades. The report includes district-level data from 37 schools and notes that wildfire smoke variation could also influence outcomes. The authors state that the trend appears consistent, but they recommend another season of follow-up before drawing broader conclusions.`,
    expectedScoreBehavior:
      "Should not be penalized for hedging because uncertainty language is supported by named sources, evidence, and context.",
    expectedWeakCategories: ["Verification Burden"]
  },
  {
    id: "hedging-evasive-vagueness",
    title: "Evasive Vagueness With Selective Hedging",
    description:
      "Indirect claims use heavy hedging while stronger claims are stated confidently without support.",
    text: `Some experts say there may be concerns about the safety data, and observers suggest it could be argued that key reports are being withheld. Questions have been raised, and it is possible that reviewers are worried, but no documents are named. At the same time, this policy definitely works and will protect everyone, so there is no reason to question it.`,
    expectedScoreBehavior:
      "Should trigger hedging-distribution red flags and trend lower due to weak sourcing, weak evidence, and uneven confidence.",
    expectedWeakCategories: [
      "Source Visibility",
      "Evidence Quality",
      "Confidence Calibration",
      "Claim Discipline"
    ]
  },
  {
    id: "hedging-mixed-legitimate-and-suspicious",
    title: "Mixed Hedging: Legitimate and Suspicious",
    description:
      "Some caveats are responsible, but other hedged claims avoid accountability.",
    text: `A March 2026 audit summary says processing delays fell by 14% after workflow changes, based on weekly operational logs from three regions. The report notes that the estimate may shift after final reconciliation, which is reasonable. However, some people say there may be broader compliance concerns and it is possible that key failures were hidden, but the text does not identify who made those claims or cite evidence.`,
    expectedScoreBehavior:
      "Should show a mixed result: legitimate uncertainty is recognized, but selective vague hedging should reduce calibration confidence and add a targeted red flag.",
    expectedWeakCategories: ["Confidence Calibration", "Source Visibility"]
  }
];

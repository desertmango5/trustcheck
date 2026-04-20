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
  }
];

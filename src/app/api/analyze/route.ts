import { NextResponse } from "next/server";
import { analyzeTextPlaceholder } from "@/lib/placeholderAnalysis";
import { extractReadableTextFromUrl } from "@/lib/urlExtraction";
import type { AnalyzeTrustRequestBody } from "@/types/trustcheck";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | Partial<AnalyzeTrustRequestBody>
      | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Please submit a valid request body with text to analyze." },
        { status: 400 }
      );
    }

    if (body.text !== undefined && typeof body.text !== "string") {
      return NextResponse.json(
        { error: "Input text must be provided as plain text." },
        { status: 400 }
      );
    }

    if (body.url !== undefined && typeof body.url !== "string") {
      return NextResponse.json(
        { error: "URL input must be provided as plain text." },
        { status: 400 }
      );
    }

    const text = body.text?.trim() ?? "";
    const url = body.url?.trim() ?? "";

    if (!text && !url) {
      return NextResponse.json(
        { error: "Please enter text or a public article URL before analysis." },
        { status: 400 }
      );
    }

    let analysisInputText = text;
    let usedUrlExtraction = false;

    if (!analysisInputText && url) {
      try {
        analysisInputText = await extractReadableTextFromUrl(url);
        usedUrlExtraction = true;
      } catch (error) {
        const detail = error instanceof Error ? error.message : "";
        return NextResponse.json(
          {
            error:
              "We couldn't extract readable article text from that URL. Please paste the article text manually and try again.",
            detail
          },
          { status: 400 }
        );
      }
    }

    const result = analyzeTextPlaceholder(analysisInputText);

    if (
      usedUrlExtraction &&
      (result.analysisStatus === "cannot_score" ||
        result.analysisStatus === "insufficient_basis")
    ) {
      return NextResponse.json(
        {
          error:
            "We couldn't extract enough usable article text from that URL. Please paste the article text manually and try again.",
          detail:
            result.analysisStatus === "cannot_score"
              ? "Extracted content was not meaningfully analyzable."
              : "Extracted content was readable but lacked enough credibility-relevant detail."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to process analysis request." },
      { status: 500 }
    );
  }
}

const BLOCKED_VIDEO_HOST_PATTERNS = [
  /(^|\.)youtube\.com$/i,
  /(^|\.)youtu\.be$/i,
  /(^|\.)tiktok\.com$/i,
  /(^|\.)vimeo\.com$/i,
  /(^|\.)dailymotion\.com$/i,
  /(^|\.)instagram\.com$/i
];

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
  /^0\.0\.0\.0$/
];

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeWhitespace(input: string) {
  return input
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function stripHtml(html: string) {
  return normalizeWhitespace(
    decodeHtmlEntities(
      html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
        .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
    )
  );
}

function looksLikePrivateHost(hostname: string) {
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function isBlockedVideoHost(hostname: string) {
  return BLOCKED_VIDEO_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function selectLikelyReadableRegion(html: string) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (articleMatch?.[0]) return articleMatch[0];

  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  if (mainMatch?.[0]) return mainMatch[0];

  const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i);
  if (bodyMatch?.[0]) return bodyMatch[0];

  return html;
}

export async function extractReadableTextFromUrl(rawUrl: string) {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Please provide a valid public webpage URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only public HTTP or HTTPS webpage URLs are supported.");
  }

  if (looksLikePrivateHost(parsed.hostname)) {
    throw new Error("Please provide a public webpage URL.");
  }

  if (isBlockedVideoHost(parsed.hostname)) {
    throw new Error(
      "Social video URLs are not supported here. Please paste the written content manually."
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "TrustCheck/1.0 (+Text Analysis)"
      }
    });

    if (!response.ok) {
      throw new Error("Unable to access that page right now.");
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    const isHtml = contentType.includes("text/html");
    const isPlainText = contentType.includes("text/plain");

    if (!isHtml && !isPlainText) {
      throw new Error("This page format is not supported for text extraction.");
    }

    const raw = await response.text();
    const extracted = isPlainText
      ? normalizeWhitespace(raw)
      : stripHtml(selectLikelyReadableRegion(raw));

    if (extracted.length < 140) {
      throw new Error("Not enough readable article text was found on that page.");
    }

    return extracted.slice(0, 24000);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The webpage took too long to respond.");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Could not extract readable text from this URL.");
  } finally {
    clearTimeout(timeout);
  }
}

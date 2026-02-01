import type { Policy } from "./types";

/**
 * Build a Policy from raw HTML attribute strings (e.g. from <claim policy="rounded" decimals="2">).
 */
export function policyFromAttrs(
  policyType: string | undefined,
  decimals?: string,
  tolerance?: string
): Policy {
  const type = (policyType?.trim() || "auto") as Policy["type"];
  if (type === "exact") return { type: "exact" };
  if (type === "percent") return { type: "percent" };
  if (type === "abbr") return { type: "abbr" };
  if (type === "ratio") return { type: "ratio" };
  if (type === "range") return { type: "range" };
  if (type === "year") return { type: "year" };
  if (type === "rounded") {
    const d = decimals != null ? Number(decimals) : 0;
    return { type: "rounded", decimals: Number.isFinite(d) ? d : 0 };
  }
  if (type === "tolerance") {
    const t = tolerance != null ? Number(tolerance) : 0.02;
    return { type: "tolerance", tolerance: Number.isFinite(t) ? t : 0.02 };
  }
  return { type: "auto" };
}

export type ResponseSegment =
  | { type: "text"; content: string }
  | { type: "claim"; id: string; policy: Policy; inner: string };

const CLAIM_RE =
  /<claim\s+id="([^"]+)"\s+policy="([^"]+)"(?:\s+decimals="(\d+)")?(?:\s+tolerance="([^"]+)")?\s*>([\s\S]*?)<\/claim>/gi;

/**
 * Splits message text into segments: plain text and <claim> blocks.
 * Useful for custom renderers that want to render claim blocks with ClaimMark
 * and text with a markdown renderer. If you use Streamdown with streamdownClaimComponents,
 * you don't need this.
 */
export function parseClaimSegments(text: string): ResponseSegment[] {
  const segments: ResponseSegment[] = [];
  let lastIndex = 0;
  const re = new RegExp(CLAIM_RE.source, "gi");
  let m = re.exec(text);
  while (m !== null) {
    const before = text.slice(lastIndex, m.index);
    if (before.length > 0) segments.push({ type: "text", content: before });
    const policy = policyFromAttrs(m[2], m[3], m[4]);
    segments.push({ type: "claim", id: m[1], policy, inner: m[5] });
    lastIndex = re.lastIndex;
    m = re.exec(text);
  }
  const after = text.slice(lastIndex);
  if (after.length > 0) segments.push({ type: "text", content: after });
  if (segments.length === 0) segments.push({ type: "text", content: text });
  return segments;
}

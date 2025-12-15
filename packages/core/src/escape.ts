const ATTR_ESCAPE_RE = /[&<>"']/g;
const ATTR_ESCAPE_MAP: Record<string, string> = { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" };

export function escapeAttr(s: unknown) {
  return String(s).replace(ATTR_ESCAPE_RE, (ch) => ATTR_ESCAPE_MAP[ch] ?? ch);
}

export function toTitleAttr(country?: string, date?: string | Date, value?: string | number | undefined | null, policy?: unknown) {
  if (value === undefined) return "Claim not found";
  const parts = [
    country ? `Country: ${country}` : "",
    date ? `Date: ${typeof date === "string" ? date : date.toISOString().slice(0,10)}` : "",
    value ? `Actual: ${value}` : "",
    policy ? `Policy: ${JSON.stringify(policy)}` : ""
  ].filter(Boolean);
  return escapeAttr(parts.join("\n")).replace(/\n/g, "&#10;");
}

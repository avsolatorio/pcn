export const normalizeSpaces = (s: string) => s.replace(/\s+/g, " ").trim();
export const stripDecorations = (s: string) => s.replace(/[\u00A0 ,]/g, "");
export const coalesceNumber = (...c: Array<number | null | undefined>): number => {
  for (const v of c) if (v !== null && v !== undefined) return v;
  return Number.NaN;
};
export const isFiniteNumber = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

export function parseAbbreviatedNumber(s: string): number | null {
  const m = s.trim().match(/^([+-]?\d+(?:\.\d+)?)([kmb])?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = (m[2] || "").toLowerCase();
  const mult = unit === "k" ? 1e3 : unit === "m" ? 1e6 : unit === "b" ? 1e9 : 1;
  return n * mult;
}

export function parsePercentish(s: string): { value: number; isPercent: boolean } | null {
  const t = s.trim();
  const pct = t.endsWith("%");
  const num = pct ? t.slice(0, -1) : t;
  const n = Number(num.replace(/[, ]/g, ""));
  if (!Number.isFinite(n)) return null;
  return { value: pct ? n / 100 : n, isPercent: pct };
}

export function parseRatio(s: string): number | null {
  const m = s.match(/^\s*(\d+(?:\.\d+)?)\s*(?:in|\/|:)\s*(\d+(?:\.\d+)?)\s*$/i);
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return a / b;
}

export function extractRange(s: string): { lo: number; hi: number } | null {
  const compact = normalizeSpaces(s.toLowerCase());
  const between = compact.match(/between\s+([^\s]+)\s+(?:and|to)\s+([^\s]+)/i);
  const simple = compact.match(/^([^\s]+)\s*(?:–|-|to)\s*([^\s]+)$/i);
  const m = between ?? simple;
  if (!m) return null;
  const aStr = stripDecorations(m[1]), bStr = stripDecorations(m[2]);
  const a = parseAbbreviatedNumber(aStr) ?? Number(m[1]);
  const b = parseAbbreviatedNumber(bStr) ?? Number(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { lo: Math.min(a,b), hi: Math.max(a,b) };
}

function percentAwareNumber(raw: string): number {
  const cleaned = raw.replace(/[, ]/g, "");
  const hasPercent = raw.endsWith("%");
  const n = Number(cleaned.replace(/%$/, ""));
  if (!Number.isFinite(n)) return Number.NaN;
  return hasPercent ? n / 100 : n;
}

export function buildNumericFromText(raw: string) {
  const percentish = parsePercentish(raw);
  const abbr = parseAbbreviatedNumber(stripDecorations(raw.toLowerCase()));
  const ratio = parseRatio(raw);
  const plain = percentAwareNumber(raw);
  return { percentish, abbr, ratio, plain };
}

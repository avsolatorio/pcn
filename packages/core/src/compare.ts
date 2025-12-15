import type { Claim, Policy } from "./types";
import { buildNumericFromText, coalesceNumber, extractRange, isFiniteNumber, normalizeSpaces, stripDecorations } from "./parse";

const compareExact = (innerRaw: string, claimRaw: string) =>
  stripDecorations(innerRaw.replace(/%/g, "")) === stripDecorations(claimRaw.replace(/%/g, ""));

const comparePercent = (inner: any, claim: any) => !!inner.percentish && !!claim.percentish && inner.percentish.value === claim.percentish.value;
const compareAbbr = (inner: any, claim: any) => inner.abbr != null && claim.abbr != null && inner.abbr === claim.abbr;
const compareRatio = (inner: any, claim: any) => inner.ratio != null && claim.ratio != null && inner.ratio === claim.ratio;

const compareRange = (innerRaw: string, claimNum: number) => {
  const r = extractRange(innerRaw);
  return !!r && isFiniteNumber(claimNum) && claimNum >= r.lo && claimNum <= r.hi;
};

const numEqualRounded = (a: number, b: number, d: number) => Number(a.toFixed(d)) === Number(b.toFixed(d));
const numWithinTolerance = (a: number, b: number, tol: number) => {
  if (a === 0 && b === 0) return true;
  const denom = Math.max(1e-12, Math.max(Math.abs(a), Math.abs(b)));
  return Math.abs(a-b)/denom <= tol;
};

const compareYear = (innerRaw: string, claim: Claim) => {
  const innerYear = Number(innerRaw.match(/\b(19|20)\d{2}\b/)?.[0]);
  const date = typeof claim.date === "string" ? new Date(claim.date) : (claim.date instanceof Date ? claim.date : new Date(String(claim.value)));
  const t = date.getTime();
  const claimYear = Number.isNaN(t) ? Number.NaN : new Date(t).getUTCFullYear();
  return Number.isFinite(innerYear) && Number.isFinite(claimYear) && innerYear === claimYear;
};

export function compareByPolicy(innerText: string, claim: Claim, policy: Policy): boolean {
  const innerRaw = String(normalizeSpaces(String(innerText)).trim());
  const claimRaw = String(claim.value ?? "").trim();

  if (policy.type === "exact" || policy.type === "auto") {
    const exact = compareExact(innerRaw, claimRaw);
    if (policy.type === "exact") return exact;
    if (exact) return true;
  }

  const inner = buildNumericFromText(innerRaw);
  const claimParts = buildNumericFromText(claimRaw);

  if (policy.type === "percent") return comparePercent(inner, claimParts);
  if (policy.type === "abbr") return compareAbbr(inner, claimParts);
  if (policy.type === "ratio") return compareRatio(inner, claimParts);
  if (policy.type === "year") return compareYear(innerRaw, claim);

  if (policy.type === "range") {
    const claimNum = coalesceNumber(claimParts.abbr, claimParts.percentish?.value, claimParts.ratio, claimParts.plain);
    return compareRange(innerRaw, claimNum);
  }

  const innerNum = coalesceNumber(inner.percentish?.value, inner.abbr, inner.ratio, inner.plain);
  const claimNum = coalesceNumber(claimParts.percentish?.value, claimParts.abbr, claimParts.ratio, claimParts.plain);
  const bothNumeric = Number.isFinite(innerNum) && Number.isFinite(claimNum);

  if (policy.type === "rounded") return bothNumeric && numEqualRounded(innerNum, claimNum, policy.decimals);
  if (policy.type === "tolerance") return bothNumeric && numWithinTolerance(innerNum, claimNum, policy.tolerance);

  if (policy.type === "auto") {
    if (compareExact(innerRaw, claimRaw)) return true;
    if (comparePercent(inner, claimParts)) return true;
    if (compareAbbr(inner, claimParts)) return true;
    if (compareRatio(inner, claimParts)) return true;
    if (bothNumeric && numEqualRounded(innerNum, claimNum, 0)) return true;
    if (bothNumeric && numWithinTolerance(innerNum, claimNum, 0.02)) return true;
    if (compareRange(innerRaw, claimNum)) return true;
    return false;
  }
  return false;
}

import type { Claim, Policy } from "./types";
import { toTitleAttr } from "./escape";

export function withMark(claimId: string, inner: string, ok: boolean, claim: Claim, policy: Policy) {
  const title = toTitleAttr(claim.country, claim.date, claim.value as any, policy);
  if (ok) {
    return `<claim id="${claimId}">${inner}<sup class="verified-mark" title="Verified data&#10;&#10;${title}">✓</sup></claim>`;
  }
  return `<claim id="${claimId}">${inner}<sup class="verify-pending" title="Needs verification&#10;&#10;${title}" role="img" aria-label="Needs verification">⚠</sup></claim>`;
}

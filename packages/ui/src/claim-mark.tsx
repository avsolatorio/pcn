import type { ReactNode } from "react";
import { compareByPolicy } from "@pcn-js/core";
import type { Claim, Policy } from "@pcn-js/core";
import { useClaim } from "./context";

export type ClaimMarkProps = {
  /** Claim id (must match id used when registering the claim). */
  id: string;
  /** Verification policy (e.g. { type: "rounded", decimals: 0 }). */
  policy: Policy;
  /** Inner text displayed in the claim (the number or phrase to verify). */
  children: ReactNode;
};

function formatDate(d: string | Date): string {
  return d instanceof Date ? d.toISOString().slice(0, 10) : String(d);
}

function buildTitle(claim: Claim | undefined, policy: Policy): string {
  if (!claim) return "Needs verification";
  const parts = [
    claim.country ? `Country: ${claim.country}` : "",
    claim.date != null ? `Date: ${formatDate(claim.date)}` : "",
    claim.value != null ? `Actual: ${claim.value}` : "",
    `Policy: ${JSON.stringify(policy)}`,
  ].filter(Boolean);
  return parts.join("\n");
}

/**
 * Renders a claim with a verification mark (✓ or ⚠) based on whether the
 * displayed content matches the registered claim under the given policy.
 * Use inside ClaimsProvider; looks up claim by id from context.
 */
export function ClaimMark({ id, policy, children }: ClaimMarkProps) {
  const claim = useClaim(id);
  const innerText = typeof children === "string" ? children : String(children ?? "");
  const ok = claim ? compareByPolicy(innerText, claim, policy) : false;
  const title = buildTitle(claim, policy);

  const markTitle = ok ? `Verified data\n\n${title}` : `Needs verification\n\n${title}`;
  const showPendingValue = !ok && claim?.value != null;

  return (
    <span data-pcn-claim-id={id} className="pcn-claim" id={id}>
      {children}
      <sup
        className={ok ? "verified-mark" : "verify-pending"}
        title={markTitle}
        role="img"
        aria-label={ok ? "Verified" : "Needs verification"}
      >
        {ok ? "✓" : "⚠"}
      </sup>
      {showPendingValue && (
        <span className="pcn-pending-value" title={title} aria-hidden="true">
          {" "}
          (Actual: {String(claim.value)})
        </span>
      )}
    </span>
  );
}

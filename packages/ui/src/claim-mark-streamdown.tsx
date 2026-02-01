import type { ReactNode } from "react";
import { policyFromAttrs } from "@pcn/core";
import { ClaimMark } from "./claim-mark";

/** Props passed by react-markdown/rehype for raw HTML <claim> element */
export type ClaimNodeProps = {
  id?: string;
  policy?: string;
  decimals?: string;
  tolerance?: string;
  children?: ReactNode;
};

/**
 * Custom component for Streamdown (or react-markdown with rehype-raw) components.claim.
 * Renders <claim> tags inside markdown (e.g. in tables) as ClaimMark so layout is preserved.
 * Use with: <Streamdown components={streamdownClaimComponents}>{markdown}</Streamdown>
 */
export function ClaimMarkStreamdown({
  id = "",
  policy: policyAttr,
  decimals,
  tolerance,
  children,
}: ClaimNodeProps) {
  const policy = policyFromAttrs(policyAttr, decimals, tolerance);
  return (
    <ClaimMark id={id} policy={policy}>
      {children}
    </ClaimMark>
  );
}

/** Ready-made components object for Streamdown: pass as components={streamdownClaimComponents} */
export const streamdownClaimComponents = { claim: ClaimMarkStreamdown };

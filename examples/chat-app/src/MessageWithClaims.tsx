import { ClaimMark } from "@pcn-js/ui";

/**
 * Renders a simple "assistant" message that contains numeric claims.
 * Each claim is wrapped in ClaimMark so it shows ✓ (verified) or ⚠ (pending)
 * based on whether the displayed text matches the cached claim under the policy.
 */
export function MessageWithClaims() {
  return (
    <div className="message" data-testid="message-content">
      <p>
        In Kenya the poverty rate was{" "}
        <ClaimMark
          id="claim-poverty-kenya-2022"
          policy={{ type: "percent" }}
        >
          42%
        </ClaimMark>{" "}
        in 2022. GDP per capita was{" "}
        <ClaimMark
          id="claim-gdp-per-capita-kenya-2022"
          policy={{ type: "abbr" }}
        >
          2.1k
        </ClaimMark>
        . Unemployment was{" "}
        <ClaimMark
          id="claim-unemployment-kenya-2022"
          policy={{ type: "rounded", decimals: 1 }}
        >
          about 5.2%
        </ClaimMark>{" "}
        (no source data for this claim — shows pending).
      </p>
    </div>
  );
}

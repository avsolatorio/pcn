import { useId, useLayoutEffect, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { compareByPolicy } from "@pcn-js/core";
import type { Claim, Policy } from "@pcn-js/core";
import { useClaim } from "./context";

const GAP = 8;
/** Default delay (ms) before hiding tooltip when leaving trigger/tooltip. */
const DEFAULT_TOOLTIP_HIDE_DELAY_MS = 150;

function useTooltipPosition(triggerRef: RefObject<HTMLElement | null>, open: boolean) {
  const [position, setPosition] = useState<{ bottom: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || typeof document === "undefined") return;
    const el = triggerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setPosition({
        bottom: window.innerHeight - rect.top + GAP,
        left: Math.max(GAP, Math.min(rect.left, window.innerWidth - 280 - GAP)),
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, triggerRef]);

  return position;
}

export type ClaimMarkProps = {
  /** Claim id (must match id used when registering the claim). */
  id: string;
  /** Verification policy (e.g. { type: "rounded", decimals: 0 }). */
  policy: Policy;
  /** Inner text displayed in the claim (the number or phrase to verify). */
  children: ReactNode;
  /**
   * Optional. Milliseconds to wait before hiding the tooltip when the pointer
   * leaves the trigger or the tooltip. Default 150. Set to 0 for immediate hide
   * (original behavior: tooltip disappears as soon as the pointer leaves).
   */
  tooltipHideDelayMs?: number;
};

function formatDate(d: string | Date): string {
  return d instanceof Date ? d.toISOString().slice(0, 10) : String(d);
}

/** Match a string that looks like scientific notation (e.g. "1.42863e+009"). */
const SCIENTIFIC_STRING = /^[-+]?\d*\.?\d+e[+-]?\d+$/i;

function formatNumberNoScientific(value: number): string {
  const s = String(value);
  if (!s.includes("e") && !s.includes("E")) return s;
  if (value === 0 || !Number.isFinite(value)) return s;
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs < 1e-6) {
    return sign + abs.toFixed(20).replace(/\.?0+$/, "");
  }
  if (abs >= 1e21) {
    const fixed = abs.toFixed(0);
    if (!fixed.includes("e") && !fixed.includes("E")) return sign + fixed;
    const match = String(abs).toLowerCase().match(/e\+?(-?\d+)$/);
    const exp = match ? Number.parseInt(match[1], 10) : 0;
    const mantissa = abs / 10 ** exp;
    const mStr = mantissa.toFixed(15).replace(/\.?0+$/, "");
    const [whole, frac = ""] = mStr.split(".");
    const pad = exp - whole.length - frac.length + 1;
    return sign + whole + frac + (pad > 0 ? "0".repeat(pad) : "");
  }
  return sign + abs.toFixed(20).replace(/\.?0+$/, "");
}

/**
 * Format a claim value for display exactly as it appears: no scientific
 * notation, no locale formatting, no rounding. Strings are shown as-is
 * unless they are scientific notation (e.g. "1.42863e+009"), which we
 * expand to plain digits.
 */
function formatSourceValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (SCIENTIFIC_STRING.test(trimmed)) {
      const num = Number(trimmed);
      if (Number.isFinite(num)) return formatNumberNoScientific(num);
    }
    return value;
  }
  if (typeof value === "number") return formatNumberNoScientific(value);
  return String(value);
}

function formatPolicyDescription(policy: Policy): string {
  switch (policy.type) {
    case "exact":
      return "Exact match";
    case "rounded":
      return policy.decimals === 0
        ? "Rounded to whole number"
        : `Rounded to ${policy.decimals} decimal place${policy.decimals === 1 ? "" : "s"}`;
    case "tolerance":
      return `Within ±${policy.tolerance}`;
    case "percent":
      return "Percentage match";
    case "range":
      return "Within range";
    case "abbr":
      return "Abbreviation match";
    case "ratio":
      return "Ratio match";
    case "year":
      return "Year match";
    case "auto":
    default:
      return "Automatic match";
  }
}

type VerificationStatus = "verified" | "claim_not_found" | "policy_failed";

function getVerificationStatus(
  claim: Claim | undefined,
  ok: boolean,
): VerificationStatus {
  if (ok) return "verified";
  if (!claim) return "claim_not_found";
  return "policy_failed";
}

function buildDetailLines(claim: Claim | undefined, policy: Policy): string[] {
  if (!claim) return [];
  const lines: string[] = [];
  if (claim.country) lines.push(`Country: ${claim.country}`);
  if (claim.date != null) lines.push(`Date: ${formatDate(claim.date)}`);
  if (claim.value != null) lines.push(`Source value: ${formatSourceValue(claim.value)}`);
  lines.push(`Display rule: ${formatPolicyDescription(policy)}`);
  return lines;
}

function buildTitle(claim: Claim | undefined, policy: Policy): string {
  if (!claim) return "Needs verification";
  return buildDetailLines(claim, policy).join("\n");
}

const UNVERIFIED_MESSAGES = {
  claim_not_found: {
    heading: "Claim not found",
    explanation:
      "No source data was registered for this claim. The value may not have been fetched yet, the claim ID may be wrong, or the data pipeline may not have run.",
    suggestion: "Check that the claim ID is correct and that source data is being registered for this claim.",
    ariaLabel: "Claim not found; no source data for this claim",
  },
  policy_failed: {
    heading: "Value doesn't match source",
    explanation:
      "The shown value does not match the source data under the display rule. Common causes: rounding, units, or formatting differences.",
    suggestion: "Check rounding and formatting, or adjust the display rule to match how the value is derived.",
    ariaLabel: "Verification failed; displayed value does not match source data",
  },
} as const;

/**
 * Renders a claim with a verification mark (✓ or ⚠) based on whether the
 * displayed content matches the registered claim under the given policy.
 * Use inside ClaimsProvider; looks up claim by id from context.
 */
export function ClaimMark({
  id,
  policy,
  children,
  tooltipHideDelayMs = DEFAULT_TOOLTIP_HIDE_DELAY_MS,
}: ClaimMarkProps) {
  const detailId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const position = useTooltipPosition(triggerRef, tooltipOpen);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current != null) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimeout();
    if (tooltipHideDelayMs <= 0) {
      setTooltipOpen(false);
    } else {
      hideTimeoutRef.current = setTimeout(
        () => setTooltipOpen(false),
        tooltipHideDelayMs,
      );
    }
  };


  useEffect(() => () => clearHideTimeout(), []);

  const claim = useClaim(id);
  const innerText = typeof children === "string" ? children : String(children ?? "");
  const ok = claim ? compareByPolicy(innerText, claim, policy) : false;
  const status = getVerificationStatus(claim, ok);
  const detailLines = buildDetailLines(claim ?? undefined, policy);

  const hasTooltipContent = ok ? detailLines.length > 0 : true;
  const openTooltipIfContent = () => {
    clearHideTimeout();
    if (hasTooltipContent) setTooltipOpen(true);
  };

  const markTitle = ok
    ? `Verified data\n\n${detailLines.join("\n")}`
    : status === "claim_not_found"
      ? `Claim not found\n\n${UNVERIFIED_MESSAGES.claim_not_found.explanation}\n\n${UNVERIFIED_MESSAGES.claim_not_found.suggestion}\n\nClaim ID: ${id}`
      : `Value doesn't match source\n\nDisplayed: ${innerText}\nSource value: ${claim ? formatSourceValue(claim.value) : "—"}\nDisplay rule: ${formatPolicyDescription(policy)}\n\n${UNVERIFIED_MESSAGES.policy_failed.explanation}\n\n${UNVERIFIED_MESSAGES.policy_failed.suggestion}`;

  const ariaLabel =
    ok ? "Verified" : status === "claim_not_found" ? UNVERIFIED_MESSAGES.claim_not_found.ariaLabel : UNVERIFIED_MESSAGES.policy_failed.ariaLabel;

  const tooltipContent =
    tooltipOpen && hasTooltipContent && position != null && typeof document !== "undefined" ? (
      <span
        id={detailId}
        className={`pcn-claim-detail pcn-claim-detail-portal pcn-claim-detail--${status}`}
        role="tooltip"
        style={{
          position: "fixed",
          bottom: `${position.bottom}px`,
          left: `${position.left}px`,
        }}
        onMouseEnter={openTooltipIfContent}
        onMouseLeave={scheduleHide}
      >
        <span className="pcn-claim-detail-status">
          {ok ? "Verified data" : status === "claim_not_found" ? UNVERIFIED_MESSAGES.claim_not_found.heading : UNVERIFIED_MESSAGES.policy_failed.heading}
        </span>
        {ok ? (
          <dl className="pcn-claim-detail-list">
            {detailLines.map((line) => {
              const colon = line.indexOf(": ");
              const label = colon >= 0 ? line.slice(0, colon) : "";
              const value = colon >= 0 ? line.slice(colon + 2) : line;
              return (
                <div key={line} className="pcn-claim-detail-row">
                  <dt className="pcn-claim-detail-label">{label}</dt>
                  <dd className="pcn-claim-detail-value">{value}</dd>
                </div>
              );
            })}
          </dl>
        ) : status === "claim_not_found" ? (
          <div className="pcn-claim-detail-body">
            <p className="pcn-claim-detail-explanation">
              {UNVERIFIED_MESSAGES.claim_not_found.explanation}
            </p>
            <p className="pcn-claim-detail-suggestion">
              {UNVERIFIED_MESSAGES.claim_not_found.suggestion}
            </p>
            <dl className="pcn-claim-detail-list">
              <div className="pcn-claim-detail-row">
                <dt className="pcn-claim-detail-label">Claim ID</dt>
                <dd className="pcn-claim-detail-value">{id}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="pcn-claim-detail-body">
            <p className="pcn-claim-detail-explanation">
              {UNVERIFIED_MESSAGES.policy_failed.explanation}
            </p>
            <p className="pcn-claim-detail-suggestion">
              {UNVERIFIED_MESSAGES.policy_failed.suggestion}
            </p>
            <dl className="pcn-claim-detail-list">
              <div className="pcn-claim-detail-row">
                <dt className="pcn-claim-detail-label">Displayed</dt>
                <dd className="pcn-claim-detail-value">{innerText || "—"}</dd>
              </div>
              {claim?.value != null && (
                <div className="pcn-claim-detail-row">
                  <dt className="pcn-claim-detail-label">Source value</dt>
                  <dd className="pcn-claim-detail-value">{formatSourceValue(claim.value)}</dd>
                </div>
              )}
              <div className="pcn-claim-detail-row">
                <dt className="pcn-claim-detail-label">Display rule</dt>
                <dd className="pcn-claim-detail-value">{formatPolicyDescription(policy)}</dd>
              </div>
            </dl>
          </div>
        )}
      </span>
    ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        data-pcn-claim-id={id}
        className="pcn-claim"
        id={id}
        onMouseEnter={openTooltipIfContent}
        onMouseLeave={scheduleHide}
        onFocus={() => hasTooltipContent && setTooltipOpen(true)}
        onBlur={() => setTooltipOpen(false)}
      >
        {children}
        <sup
          className={ok ? "verified-mark" : "verify-pending"}
          title={markTitle}
          role="img"
          aria-label={ariaLabel}
          aria-describedby={hasTooltipContent ? detailId : undefined}
        >
          {ok ? "✓" : "⚠"}
        </sup>
      </span>
      {tooltipContent != null && createPortal(tooltipContent, document.body)}
    </>
  );
}

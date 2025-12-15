import * as cheerio from "cheerio";
import type { Claim, Policy, ClaimTag } from "./types";
import { compareByPolicy } from "./compare";
import { withMark } from "./render";

export function pcnPolicy(claimId: string, cleanInner: string, claim: Claim, policy: Policy) {
  const ok = compareByPolicy(cleanInner, claim, policy);
  return withMark(claimId, cleanInner, ok, claim, policy);
}

export function processPCN(claimId: string, innerText: string, claim: Claim | undefined, policy: Policy) {
  const cleanInner = innerText
    .replace(/<sup class="(?:verified-mark|verify-pending)".*?<\/sup>/g, "")
    .replace(/<span class="needs-verify".*?>(.*?)<\/span>/g, "$1");

  if (!claim) {
    return `<claim id="${claimId}">${cleanInner}<sup class="verify-pending" title="Needs verification" role="img" aria-label="Needs verification">⚠</sup></claim>`;
  }
  return pcnPolicy(claimId, cleanInner, claim, policy);
}

function parsePolicyFromAttrs(el: cheerio.Element, $: cheerio.CheerioAPI): Policy {
  const type = (($(el).attr("policy") ?? "auto").trim() as Policy["type"]) || "auto";
  if (type === "exact") return { type: "exact" };
  if (type === "percent") return { type: "percent" };
  if (type === "abbr") return { type: "abbr" };
  if (type === "ratio") return { type: "ratio" };
  if (type === "range") return { type: "range" };
  if (type === "year") return { type: "year" };
  if (type === "rounded") {
    const decimals = Number($(el).attr("decimals"));
    return { type: "rounded", decimals: Number.isFinite(decimals) ? decimals : 0 };
  }
  if (type === "tolerance") {
    const tolerance = Number($(el).attr("tolerance"));
    return { type: "tolerance", tolerance: Number.isFinite(tolerance) ? tolerance : 0.02 };
  }
  return { type: "auto" };
}

export function extractClaimsFromHtml(content: string): ClaimTag[] {
  const $ = cheerio.load(content, { xmlMode: false });
  return $("claim").map((_, el) => ({
    tag: $(el).toString(),
    id: $(el).attr("id") ?? "",
    policy: parsePolicyFromAttrs(el, $),
    value: $(el).text()
  })).get();
}

export function processPCNClaims(content: string, claims: Record<string, Claim>) {
  const pcnClaims = extractClaimsFromHtml(content);
  for (const c of pcnClaims) {
    const replacement = processPCN(c.id, c.value, claims?.[c.id], c.policy);
    content = content.replace(c.tag, replacement);
  }
  return content;
}

export type Claim = { value: unknown; country?: string; date?: string | Date };

export type Policy =
  | { type: "exact" }
  | { type: "rounded"; decimals: number }
  | { type: "tolerance"; tolerance: number }
  | { type: "percent" }
  | { type: "range" }
  | { type: "abbr" }
  | { type: "ratio" }
  | { type: "year" }
  | { type: "auto" };

export type ClaimTag = { tag: string; id: string; policy: Policy; value: string };

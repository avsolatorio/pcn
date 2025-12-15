import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { compareByPolicy } from "../src/compare";
import type { Claim } from "../src/types";

describe("spec fixtures", () => {
  it("matches specs/fixtures/cases.json", () => {
    const p = path.resolve(__dirname, "../../../specs/fixtures/cases.json");
    const cases = JSON.parse(fs.readFileSync(p, "utf-8")) as any[];
    for (const c of cases) {
      const ok = compareByPolicy(c.innerText, c.claim as Claim, c.policy);
      expect(ok, `case ${c.id}`).toBe(c.expect);
    }
  });
});

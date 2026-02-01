import type { Claim } from "./types";

/**
 * A single claim entry: id + claim data. Used when ingesting from tool results.
 */
export type ClaimEntry = { id: string; claim: Claim };

/**
 * Extracts claim entries from a tool result. Register per tool name so
 * the manager can cache claims when tool outputs arrive.
 */
export type ToolResultExtractor = (result: unknown) => ClaimEntry[];

/**
 * Central cache and lookup for claims. Register claims by id (e.g. from tool
 * results that include `claim_id`), then use `get`/`getAll` when processing
 * content or rendering components.
 */
export class ClaimsManager {
  private claims = new Map<string, Claim>();
  private extractors = new Map<string, ToolResultExtractor>();
  /** Called after claims change (e.g. so React can re-render). */
  public onChange: (() => void) | undefined;

  /**
   * Register one claim by id. Overwrites any existing claim for that id.
   */
  register(id: string, claim: Claim): void {
    this.claims.set(id, claim);
    this.onChange?.();
  }

  /**
   * Register multiple claims. Overwrites existing entries for the same ids.
   */
  registerMany(entries: ClaimEntry[]): void {
    for (const { id, claim } of entries) {
      this.claims.set(id, claim);
    }
    if (entries.length > 0) this.onChange?.();
  }

  /**
   * Register an extractor for a tool by name. Later call `ingest(toolName, result)`
   * to run this extractor and cache the returned claims.
   */
  registerExtractor(toolName: string, extractor: ToolResultExtractor): void {
    this.extractors.set(toolName, extractor);
  }

  /**
   * Run the extractor for `toolName` on `result` and register all returned claims.
   * No-op if no extractor is registered for `toolName`.
   */
  ingest(toolName: string, result: unknown): void {
    const extractor = this.extractors.get(toolName);
    if (!extractor) return;
    const entries = extractor(result);
    this.registerMany(entries);
  }

  get(id: string): Claim | undefined {
    return this.claims.get(id);
  }

  getAll(): Record<string, Claim> {
    const out: Record<string, Claim> = {};
    for (const [id, claim] of this.claims) {
      out[id] = claim;
    }
    return out;
  }

  has(id: string): boolean {
    return this.claims.has(id);
  }

  clear(): void {
    this.claims.clear();
    this.onChange?.();
  }
}

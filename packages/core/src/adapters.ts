import type { Claim } from "./types";
import type { ClaimEntry, ToolResultExtractor } from "./claims-manager";

/**
 * Options for building an extractor from a tool result that returns
 * an array of data points (e.g. Data360 get_data).
 */
export type DataPointExtractorOptions = {
  /** Key on the result object that holds the array of points (default "data"). */
  dataKey?: string;
  /** Property on each point that holds the claim id (e.g. "claim_id"). */
  claimIdKey: string;
  /** Property on each point for the numeric value (e.g. "OBS_VALUE"). */
  valueKey: string;
  /** Optional property for country (e.g. "REF_AREA"). */
  countryKey?: string;
  /** Optional property for date (e.g. "TIME_PERIOD"). */
  dateKey?: string;
};

/**
 * Build a ToolResultExtractor for tool results that have a list of data points
 * with claim_id and value (and optional country/date). Use this for Data360-style
 * get_data outputs.
 *
 * @example
 * const extractor = createDataPointExtractor({
 *   dataKey: "data",
 *   claimIdKey: "claim_id",
 *   valueKey: "OBS_VALUE",
 *   countryKey: "REF_AREA",
 *   dateKey: "TIME_PERIOD",
 * });
 * manager.registerExtractor("get_data", extractor);
 * manager.ingest("get_data", toolResult);
 */
export function createDataPointExtractor(
  options: DataPointExtractorOptions
): ToolResultExtractor {
  const {
    dataKey = "data",
    claimIdKey,
    valueKey,
    countryKey,
    dateKey,
  } = options;

  return (result: unknown): ClaimEntry[] => {
    const raw = result as Record<string, unknown>;
    const arr = raw[dataKey];
    if (!Array.isArray(arr)) return [];

    const entries: ClaimEntry[] = [];
    for (const point of arr as Array<Record<string, unknown>>) {
      const id = point[claimIdKey];
      if (id == null || id === "") continue;

      const value = point[valueKey];
      const claim: Claim = { value };
      if (countryKey && point[countryKey] != null) {
        claim.country = String(point[countryKey]);
      }
      if (dateKey && point[dateKey] != null) {
        claim.date = String(point[dateKey]);
      }
      entries.push({ id: String(id), claim });
    }
    return entries;
  };
}

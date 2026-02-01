"use client";

import { useMemo, type ReactNode } from "react";
import {
  ClaimsManager,
  createDataPointExtractor,
  type DataPointExtractorOptions,
} from "@pcn/core";
import { ClaimsProvider } from "@pcn/ui";

/** Default tool name for Data360 get_data (use with IngestToolOutput). */
export const DATA360_GET_DATA_TOOL = "data360_get_data";

const DEFAULT_EXTRACTOR_OPTIONS: DataPointExtractorOptions = {
  dataKey: "data",
  claimIdKey: "claim_id",
  valueKey: "OBS_VALUE",
  countryKey: "REF_AREA",
  dateKey: "TIME_PERIOD",
};

export type Data360ClaimsProviderProps = {
  /** Tool name used when ingesting get_data results (default "data360_get_data"). */
  toolName?: string;
  /** Extractor options; defaults match Data360 get_data shape. */
  extractorOptions?: DataPointExtractorOptions;
  children: ReactNode;
};

/**
 * ClaimsProvider preconfigured with a ClaimsManager and a Data360 get_data
 * data-point extractor. Use with IngestToolOutput (from @pcn/ui) when rendering
 * data360_get_data results so ClaimMark can resolve claims by claim_id.
 *
 * @example
 * import { Data360ClaimsProvider, DATA360_GET_DATA_TOOL } from "@pcn/data360";
 * import { IngestToolOutput } from "@pcn/ui";
 *
 * <Data360ClaimsProvider>
 *   <App />
 * </Data360ClaimsProvider>
 *
 * <IngestToolOutput toolName={DATA360_GET_DATA_TOOL} output={toolPart.output}>
 *   <GetData output={toolPart.output} />
 * </IngestToolOutput>
 */
export function Data360ClaimsProvider({
  toolName = DATA360_GET_DATA_TOOL,
  extractorOptions = DEFAULT_EXTRACTOR_OPTIONS,
  children,
}: Data360ClaimsProviderProps) {
  const manager = useMemo(() => {
    const m = new ClaimsManager();
    m.registerExtractor(toolName, createDataPointExtractor(extractorOptions));
    return m;
  }, [toolName, extractorOptions]);

  return <ClaimsProvider manager={manager}>{children}</ClaimsProvider>;
}

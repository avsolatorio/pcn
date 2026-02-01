"use client";

import { useEffect, type ReactNode } from "react";
import { useClaimsManager } from "./context";

export type IngestToolOutputProps = {
  /** Tool name registered with ClaimsManager.registerExtractor (e.g. "data360_get_data"). */
  toolName: string;
  /** Raw tool result object; will be passed to the registered extractor. */
  output: unknown;
  children: ReactNode;
};

/**
 * When mounted with a tool output, ingests it into the PCN claims manager
 * so ClaimMark components can resolve claims by id. Use inside ClaimsProvider.
 *
 * @example
 * <IngestToolOutput toolName="data360_get_data" output={toolPart.output}>
 *   <GetData output={toolPart.output} />
 * </IngestToolOutput>
 */
export function IngestToolOutput({
  toolName,
  output,
  children,
}: IngestToolOutputProps) {
  const manager = useClaimsManager();

  useEffect(() => {
    if (output == null || !manager) return;
    manager.ingest(toolName, output);
  }, [toolName, output, manager]);

  return <>{children}</>;
}

"use client";

import { useClaimsManager } from "@pcn-js/ui";
import { useEffect } from "react";
import { DATA360_GET_DATA_TOOL } from "./data360-claims-provider";

const DATA360_TOOL_TYPE = "tool-data360_get_data" as const;

/** Message shape: has optional parts array (AI SDK / data-thinking style). */
export type MessageWithParts = { parts?: Array<Record<string, unknown>> };

function isData360ToolPart(p: Record<string, unknown>): boolean {
  const type = p.type;
  const isData360Type =
    type === DATA360_TOOL_TYPE ||
    (typeof type === "string" && type.includes("data360_get_data"));
  const output = p.output;
  const hasOutput =
    output != null &&
    typeof output === "object" &&
    Array.isArray((output as Record<string, unknown>).data);
  const state = p.state;
  const stateOk =
    state === undefined ||
    state === "output-available" ||
    state === "output-error";
  return Boolean(isData360Type && hasOutput && stateOk);
}

/**
 * Extract data360 get_data outputs from messages. Handles:
 * - Top-level tool parts: { type: "tool-data360_get_data", state, output }
 * - Data-thinking wrapped: { type: "data-thinking", data: { type: "tool-data360_get_data", ... output } }
 */
export function extractData360Outputs(
  messages: MessageWithParts[],
): unknown[] {
  const outputs: unknown[] = [];
  for (const message of messages) {
    const parts = message.parts ?? [];
    for (const part of parts) {
      if (typeof part !== "object" || part === null) continue;
      const p = part as Record<string, unknown>;
      if (isData360ToolPart(p) && p.output != null) {
        outputs.push(p.output);
        continue;
      }
      if (
        p.type === "data-thinking" &&
        p.data != null &&
        typeof p.data === "object"
      ) {
        const inner = p.data as Record<string, unknown>;
        if (isData360ToolPart(inner) && inner.output != null) {
          outputs.push(inner.output);
        }
      }
    }
  }
  return outputs;
}

export type IngestSessionData360Props = {
  /** Current messages (e.g. from useChat). */
  messages: MessageWithParts[];
  /** Initial messages from server (used when messages is empty on first paint). */
  initialMessages?: MessageWithParts[];
};

/**
 * Ingest all data360_get_data tool outputs from the session into the PCN
 * claims manager so ClaimMark can resolve claims from any message. Use both
 * messages (from useChat) and initialMessages (from server) so the manager
 * is populated on first paint when history is loaded.
 *
 * Expects message shape: { parts?: array }. Each part can be a top-level
 * tool part or { type: "data-thinking", data: toolPart }.
 */
export function IngestSessionData360({
  messages,
  initialMessages = [],
}: IngestSessionData360Props) {
  const manager = useClaimsManager();

  useEffect(() => {
    if (!manager) return;
    const toIngest = messages.length > 0 ? messages : initialMessages;
    const outputs = extractData360Outputs(toIngest);
    for (const output of outputs) {
      manager.ingest(DATA360_GET_DATA_TOOL, output);
    }
  }, [messages, initialMessages, manager]);

  return null;
}

# @pcn-js/data360

PCN preset for **Data360** get_data: a preconfigured `ClaimsProvider` and extractor for tool results that use `claim_id`, `OBS_VALUE`, `REF_AREA`, and `TIME_PERIOD`.

Data360 is a special application of PCN; this package keeps Data360-specific wiring in one place so apps using the Data360 API can drop in verification with minimal setup.

## Install

```bash
pnpm add @pcn/core @pcn-js/ui @pcn-js/data360 react
```

## Usage

1. Wrap your app (or chat) in `Data360ClaimsProvider`.
2. Ingest session claims so the manager is populated on load: use `IngestSessionData360` with `messages` and optional `initialMessages` (from server).
3. When rendering a `data360_get_data` tool result, wrap it in `IngestToolOutput` (from `@pcn-js/ui`) with `toolName={DATA360_GET_DATA_TOOL}`.
4. Use `ClaimMark` and `streamdownClaimComponents` from `@pcn-js/ui` to render verified/pending marks.

```tsx
import {
  Data360ClaimsProvider,
  DATA360_GET_DATA_TOOL,
  IngestSessionData360,
} from "@pcn-js/data360";
import { IngestToolOutput, streamdownClaimComponents } from "@pcn-js/ui";
import { Streamdown } from "streamdown";

function App() {
  return (
    <Data360ClaimsProvider>
      <Chat />
    </Data360ClaimsProvider>
  );
}

// In your chat view: ingest all data360_get_data outputs from the session
// (use initialMessages so the manager is populated on first paint when history is loaded)
<IngestSessionData360 messages={messages} initialMessages={initialMessages} />

// When rendering a data360_get_data tool result:
<IngestToolOutput toolName={DATA360_GET_DATA_TOOL} output={toolPart.output}>
  <GetData output={toolPart.output} />
</IngestToolOutput>
```

`IngestSessionData360` expects messages with `parts` (e.g. AI SDK / data-thinking). It handles top-level tool parts and parts wrapped in `{ type: "data-thinking", data: toolPart }`. For custom message shapes, use `extractData360Outputs(messages)` and call `manager.ingest(DATA360_GET_DATA_TOOL, output)` yourself.

## API

- **Data360ClaimsProvider** – `toolName?` (default `"data360_get_data"`), `extractorOptions?`, `children`
- **DATA360_GET_DATA_TOOL** – `"data360_get_data"` (use with `IngestToolOutput` so the tool name stays in sync)
- **IngestSessionData360** – `messages`, `initialMessages?`; ingests all data360 get_data outputs from the session into the manager
- **extractData360Outputs(messages)** – returns `unknown[]` of get_data outputs from messages (for custom ingestion)
- **MessageWithParts** – type `{ parts?: Array<Record<string, unknown>> }` for message shape

For `ClaimsProvider`, `ClaimMark`, `IngestToolOutput`, and `streamdownClaimComponents`, see [@pcn-js/ui](../ui/README.md).

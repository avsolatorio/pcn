# @pcn/data360

PCN preset for **Data360** get_data: a preconfigured `ClaimsProvider` and extractor for tool results that use `claim_id`, `OBS_VALUE`, `REF_AREA`, and `TIME_PERIOD`.

Data360 is a special application of PCN; this package keeps Data360-specific wiring in one place so apps using the Data360 API can drop in verification with minimal setup.

## Install

```bash
pnpm add @pcn/core @pcn/ui @pcn/data360 react
```

## Usage

1. Wrap your app (or chat) in `Data360ClaimsProvider`.
2. When rendering a `data360_get_data` tool result, wrap it in `IngestToolOutput` (from `@pcn/ui`) with `toolName={DATA360_GET_DATA_TOOL}`.
3. Use `ClaimMark` and `streamdownClaimComponents` from `@pcn/ui` to render verified/pending marks.

```tsx
import { Data360ClaimsProvider, DATA360_GET_DATA_TOOL } from "@pcn/data360";
import { IngestToolOutput, streamdownClaimComponents } from "@pcn/ui";
import { Streamdown } from "streamdown";

function App() {
  return (
    <Data360ClaimsProvider>
      <Chat />
    </Data360ClaimsProvider>
  );
}

// When rendering a data360_get_data tool result:
<IngestToolOutput toolName={DATA360_GET_DATA_TOOL} output={toolPart.output}>
  <GetData output={toolPart.output} />
</IngestToolOutput>
```

## API

- **Data360ClaimsProvider** – `toolName?` (default `"data360_get_data"`), `extractorOptions?`, `children`
- **DATA360_GET_DATA_TOOL** – `"data360_get_data"` (use with `IngestToolOutput` so the tool name stays in sync)

For `ClaimsProvider`, `ClaimMark`, `IngestToolOutput`, and `streamdownClaimComponents`, see [@pcn/ui](../ui/README.md).

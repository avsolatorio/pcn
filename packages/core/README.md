# @pcn-js/core

Core PCN implementation: verification engine, claims manager, and HTML processing.

## Claims manager

Central cache and lookup for claims. Register claims by id (e.g. from tool results that include `claim_id`), then use `get`/`getAll` when processing content or with `@pcn/ui` components.

```ts
import { ClaimsManager, createDataPointExtractor } from "@pcn-js/core";

const manager = new ClaimsManager();

// Register one claim
manager.register("claim-1", { value: 42, country: "KEN", date: "2023" });

// Register an extractor for a tool that returns data points
manager.registerExtractor(
  "get_data",
  createDataPointExtractor({
    dataKey: "data",
    claimIdKey: "claim_id",
    valueKey: "OBS_VALUE",
    countryKey: "REF_AREA",
    dateKey: "TIME_PERIOD",
  })
);

// When a tool result arrives
manager.ingest("get_data", toolResult);

manager.get("claim-1");       // Claim | undefined
manager.getAll();             // Record<string, Claim>
manager.has("claim-1");       // boolean
manager.clear();
```

Optional: set `manager.onChange = () => { ... }` so UI (e.g. React) can re-render when claims change.

## Data point extractor

For tools that return `{ data: [{ claim_id, value, country?, date?, ... }] }`, use `createDataPointExtractor` so you don’t write custom extractors. See example above.

## HTML processing

- **extractClaimsFromHtml(html)** – returns `ClaimTag[]` for all `<claim>` elements.
- **processPCNClaims(html, claims)** – replaces each `<claim>` with verified/pending markup (HTML string). Use when you render that HTML (e.g. with `dangerouslySetInnerHTML`).

For React/streaming UIs, use `@pcn/ui` and the `ClaimMark` component instead of injecting HTML.

## Exports

- **Types**: `Claim`, `Policy`, `ClaimTag`, `ClaimEntry`, `ToolResultExtractor`, `DataPointExtractorOptions`
- **ClaimsManager**, **createDataPointExtractor**
- **compareByPolicy**, **withMark**, **pcnPolicy**, **processPCN**, **extractClaimsFromHtml**, **processPCNClaims**
- **escapeAttr**, **toTitleAttr**

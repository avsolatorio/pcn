# @pcn/ui

React components and claims context for rendering PCN verified/pending claims in the UI.

## Install

```bash
pnpm add @pcn/core @pcn/ui react
```

## Usage

### 1. Claims manager + provider

Create a `ClaimsManager`, register extractors for tools that return `claim_id`, and wrap your app (or chat) in `ClaimsProvider` so components can look up claims.

```tsx
import { ClaimsManager, createDataPointExtractor } from "@pcn/core";
import { ClaimsProvider, ClaimMark, useClaimsManager } from "@pcn/ui";

const manager = new ClaimsManager();

// When get_data returns { data: [{ claim_id, OBS_VALUE, REF_AREA, TIME_PERIOD, ... }] }
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

function App() {
  return (
    <ClaimsProvider manager={manager}>
      <Chat />
    </ClaimsProvider>
  );
}
```

### 2. Ingest tool results

When a tool result arrives (e.g. from your chat API), call `manager.ingest(toolName, result)`. The manager runs the registered extractor and caches claims; the provider re-renders.

```tsx
function Chat() {
  const manager = useClaimsManager();

  useEffect(() => {
    // When you receive a tool result:
    if (toolName === "get_data") manager?.ingest("get_data", toolResult);
  }, [toolName, toolResult, manager]);

  return (/* ... */);
}
```

### 3. Render claims with ClaimMark

Use `ClaimMark` where you render claim content (e.g. as a custom component for `<claim>` in your markdown renderer). It looks up the claim by id, runs the policy comparison, and renders the content plus ✓ or ⚠.

```tsx
import { ClaimMark } from "@pcn/ui";

// In your markdown components or stream renderer:
<ClaimMark id={claimId} policy={{ type: "rounded", decimals: 0 }}>
  42
</ClaimMark>
```

### Static claims (no manager)

If you have a fixed map of claims (e.g. from server props), pass `initialClaims` and omit `manager`:

```tsx
<ClaimsProvider initialClaims={claimsMap}>
  <Content />
</ClaimsProvider>
```

## API

- **ClaimsProvider** – `manager?: ClaimsManager`, `initialClaims?: Record<string, Claim>`, `children`
- **useClaims()** – returns `Record<string, Claim>`
- **useClaimsManager()** – returns `ClaimsManager | null`
- **useClaim(id)** – returns `Claim | undefined`
- **ClaimMark** – `id`, `policy`, `children` (the displayed text to verify)

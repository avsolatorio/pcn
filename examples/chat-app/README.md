# PCN Example — Chat app

Minimal example of using **Proof-Carrying Numbers (PCN)** in a React app: a claims manager, provider, and `ClaimMark` components so numeric claims show ✓ (verified) or ⚠ (pending) against cached tool data.

## What it does

1. **ClaimsManager** – Created once, with a `createDataPointExtractor` for a fake `get_data` tool that returns `{ data: [{ claim_id, OBS_VALUE, REF_AREA, TIME_PERIOD, ... }] }`.
2. **ClaimsProvider** – Wraps the app so components can read claims and the manager.
3. **Simulated tool result** – On mount, the app calls `manager.ingest("get_data", mockResult)` with two data points (poverty rate 42%, GDP per capita 2.1k). Those claims are cached.
4. **Message with claims** – A simple message uses `ClaimMark` for:
   - **42%** (policy `percent`) — cached as 0.42 → ✓ verified
   - **2.1k** (policy `abbr`) — cached as 2100 → ✓ verified
   - **about 5.2%** (policy `rounded`, decimals 1) — no cached claim → ⚠ pending

## Run locally

From the **repository root** (so workspace deps resolve):

```bash
pnpm install
pnpm --filter pcn-example-chat-app dev
```

Then open [http://localhost:5173](http://localhost:5173).

Or from this directory after root install:

```bash
cd examples/chat-app
pnpm install
pnpm dev
```

## Build

```bash
pnpm --filter pcn-example-chat-app build
pnpm --filter pcn-example-chat-app preview
```

## Packages used

- **@pcn/core** – `ClaimsManager`, `createDataPointExtractor`, `compareByPolicy`
- **@pcn/ui** – `ClaimsProvider`, `ClaimMark`, `useClaimsManager`

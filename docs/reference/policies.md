# Verification Policies

PCN uses **verification policies** to determine whether a numeric token matches a claim. A policy specifies which verification relations are permitted, allowing applications to balance strictness (higher trust) with coverage (more numbers verified).

## Verification Relation

PCN defines a verification relation `R(t, c; Π)` that checks whether token `t` matches claim `c` under policy `Π`. The numeric payload of `t` is normalized into the claim's unit `u` as `v̂`. If `t` has no claim reference or `R(t, c; Π) = 0`, the number is treated as **unverified**.

A policy `Π` specifies which verification modes are permitted:
```
R(t, c; Π) = 1 ⇐⇒ ∃ allowed mode in Π such that it holds.
```

## Policy Types

### Exact Match (`exact`)

The strictest policy: requires the numeric value to match the claim value exactly.

**Verification**: `R_exact(t, c) = 1 ⇐⇒ v̂ = v*`

**Use case**: When absolute precision is required (e.g., exact counts, precise measurements).

**Example**:
- Claim: `⟨"clm 7ef6", GDP growth, PHL, 2024, 5.7, %, m⟩`
- Token: `<claim id="clm 7ef6" policy="exact">5.7</claim>` ✅ Verified
- Token: `<claim id="clm 7ef6" policy="exact">5.8</claim>` ❌ Unverified

### Rounded Match (`rounded`)

Allows verification when the token value matches the claim value after rounding to a specified decimal precision.

**Verification**: `R^(d)_round(t, c) = 1 ⇐⇒ round_d(v̂) = round_d(v*)`

**Parameters**:
- `decimals` (integer, ≥ 0): Number of decimal places for rounding

**Use case**: When displaying rounded values is acceptable (e.g., financial summaries, approximate statistics).

**Example**:
- Claim: `⟨"clm 7ef6", GDP growth, PHL, 2024, 5.7, %, m⟩`
- Token: `<claim id="clm 7ef6" policy="round1">5.7</claim>` ✅ Verified (round₁(5.7) = 5.7)
- Token: `<claim id="clm 7ef6" policy="round0">6</claim>` ✅ Verified (round₀(5.7) = 6)
- Token: `<claim id="clm 7ef6" policy="round1">5.8</claim>` ❌ Unverified (round₁(5.8) = 5.8 ≠ 5.7)

### Alias Equivalence (`abbr`)

Allows verification when the token uses a sanctioned scale or alias that matches the claim value.

**Verification**: `R_alias(t, c) = 1 ⇐⇒ ∃s ∈ S : v̂ · s = v*`

Where `S` is a sanctioned scale/alias set (e.g., `{10³, K, thousand}`).

**Use case**: When different representations of the same value are acceptable (e.g., "1.5K" vs "1500", "2M" vs "2,000,000").

**Example**:
- Claim: `⟨"clm abc", population, USA, 2024, 1500, people, m⟩`
- Token: `<claim id="clm abc" policy="abbr">1.5K</claim>` ✅ Verified (1.5 × 1000 = 1500)
- Token: `<claim id="clm abc" policy="abbr">1.5 thousand</claim>` ✅ Verified

### Tolerance with Qualifiers (`tolerance`)

Allows verification when the token value falls within a tolerance range **and** includes a qualifying word indicating approximation.

**Verification**: `R^(δ,ρ)_tol(t, c) = 1 ⇐⇒ v̂ ∈ [v* - max(δ, ρ|v*|), v* + max(δ, ρ|v*|)]` and `t` includes a qualifier in `Q`

Where:
- `δ` is an absolute tolerance
- `ρ` is a relative tolerance (as a proportion)
- `Q` is a qualifier set (e.g., `{"about", "approximately", "roughly"}`)

**Parameters**:
- `tolerance` (number, ≥ 0): The tolerance value (can be absolute or relative depending on implementation)

**Use case**: When approximate values with explicit qualifiers are acceptable (e.g., "about 5.7%" when the exact value is 5.7%).

**Example**:
- Claim: `⟨"clm 7ef6", GDP growth, PHL, 2024, 5.7, %, m⟩`
- Token: `<claim id="clm 7ef6" policy="tolerance">about 5.8</claim>` ✅ Verified (if 5.8 is within tolerance and "about" is a valid qualifier)
- Token: `<claim id="clm 7ef6" policy="tolerance">5.8</claim>` ❌ Unverified (no qualifier present)

### Additional Policy Types

The PCN implementation also supports additional policy types for specialized use cases:

- **`percent`**: Special handling for percentage values
- **`range`**: Verification against value ranges
- **`ratio`**: Verification for ratio comparisons
- **`year`**: Special handling for year values
- **`auto`**: Automatic policy selection based on context

## Policy Trade-offs

Policies encode an explicit trade-off between **strictness** and **coverage**:

- **Stricter policies** (e.g., `exact`): Provide higher trust but lower coverage (fewer numbers pass verification)
- **Permissive policies** (e.g., `rounded`, `tolerance`): Expand coverage but at the cost of precision

This explicit policy layer distinguishes PCN from schema-based decoding, which constrains format but not correctness.

## User Contract

PCN enforces a **fail-closed contract**. Users can rely on two guarantees:

1. **Verified values**: Numbers marked as verified have been mechanically checked against a claim under policy `Π` and are displayed with provenance.

2. **Unverified values**: Numbers without a verification mark are not verified, whether:
   - **Bare**: Unclaimed (no claim reference)
   - **Flagged**: Failed verification (claim reference exists but verification failed)

This shifts the default assumption: current applications implicitly present all numbers as trustworthy, while PCN makes trust **explicit and earned**. This enables end-users—whether policymakers, clinicians, or financial analysts—to rely on verified numbers, distinguishing them from potential hallucinations.

## Running Example

Consider a claim set `C` containing:
```
c = ⟨"clm 7ef6", GDP growth, PHL, 2024, 5.7, %, m⟩
```

**Scenario 1**: LLM emits `<claim id="clm 7ef6" policy="round1">5.7</claim>`
- If `Π` allows rounding to one decimal: ✅ Verification succeeds (round₁(5.7) = 5.7)

**Scenario 2**: LLM emits `<claim id="clm 7ef6" policy="round0">6</claim>`
- If `Π` allows rounding to nearest integer: ✅ Verification succeeds (round₀(5.7) = 6)

**Scenario 3**: LLM emits `6.0` or `5.7` without a claim tag
- Result: ❌ **Bare** number, displayed without verification mark

## Policy Schema

Policies are defined using a JSON schema. See [`specs/policy.schema.json`](../../specs/policy.schema.json) for the complete schema definition.

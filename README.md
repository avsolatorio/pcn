# Proof-Carrying Numbers (PCN)

**Proof-Carrying Numbers (PCN)** is a presentation-layer protocol that enforces numeric fidelity in LLM-generated content through mechanical verification. PCN ensures that numbers displayed to users are verified against source data, highlighting numeric hallucinations when they occur and establishing trust through proof.

## The Problem: Numeric Hallucination

Large Language Models (LLMs) are stochastic systems that may generate numbers that deviate from available data—a failure known as **numeric hallucination**. Existing safeguards like retrieval-augmented generation, citations, and uncertainty estimation improve transparency but cannot guarantee fidelity: fabricated or misquoted values may still be displayed as if correct.

## The Solution: Mechanical Verification

PCN enforces numeric fidelity by placing verification in the **renderer**, not the model. Under PCN:

- **Claim-bound tokens**: Numeric spans are emitted as tokens tied to structured claims
- **Policy-based verification**: A verifier checks each token under a declared policy (e.g., exact equality, rounding, aliases, or tolerance with qualifiers)
- **Fail-closed behavior**: Only claim-checked numbers are marked as verified; all others default to unverified
- **Spoofing prevention**: The separation of verification from generation prevents models from marking numbers as verified

## Key Features

✅ **Model-agnostic**: Works with any LLM or text generation system
✅ **Lightweight**: Minimal overhead, integrates seamlessly into existing applications
✅ **Formally verified**: Proven soundness, completeness, fail-closed behavior, and monotonicity
✅ **Extensible**: Can be extended with cryptographic commitments
✅ **Policy-flexible**: Supports various verification policies (exact match, rounding, tolerance, aliases)

## Core Principle

> **Trust is earned only by proof** — the absence of a verification mark communicates uncertainty.

## Project Structure

This monorepo contains the **PCN ecosystem**:

- **TypeScript packages** (`packages/*`) — Published to npm under `@pcn/*`
  - `@pcn/core` — Core PCN implementation
  - `@pcn/fixtures` — Shared test fixtures
  - `@pcn/html` — HTML rendering utilities

- **Python packages** (`python/*`) — Published to PyPI under `pcn-*`
  - `pcn-core` — Core PCN implementation for Python
  - `pcn-fixtures` — Shared test fixtures for Python

- **Specifications** (`specs/*`) — Source of truth across languages
  - Policy schema definitions
  - Shared test fixtures

- **Documentation** (`docs/*`) — Intended for GitBook sync

## Quick Start

### JavaScript/TypeScript

```bash
# Enable corepack (for pnpm)
corepack enable

# Install dependencies
pnpm install

# Run tests
pnpm -r test

# Build all packages
pnpm -r build
```

### Python

```bash
# Install development dependencies
python -m pip install -e "python/pcn-core[dev]"

# Run tests
pytest -q python/pcn-core
```

## Use Cases

PCN is designed for **numerically sensitive settings** where accuracy matters:

- Trustworthiness in AI dissemination of development data
- Financial reporting and analysis
- Scientific data presentation
- Medical statistics and research
- Legal and regulatory compliance
- Educational content with quantitative claims

## Learn More

- [Documentation](docs/) — Detailed guides and reference materials
- [Policy Reference](docs/reference/policies.md) — Understanding PCN policies
- [Contributing Guide](CONTRIBUTING.md) — How to contribute to PCN

## License

See [LICENSE](LICENSE) for details.

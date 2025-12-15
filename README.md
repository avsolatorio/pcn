# Proof-Carrying Numbers (PCN)

Monorepo for the **PCN ecosystem**:
- TypeScript packages (`packages/*`) published to npm under `@pcn/*`
- Python packages (`python/*`) published to PyPI under `pcn-*`
- Specs + shared fixtures (`specs/*`) used as the source of truth across languages
- Documentation (`docs/*`) intended for GitBook sync

## Quick start (JS/TS)

```bash
corepack enable
pnpm install
pnpm -r test
pnpm -r build
```

## Quick start (Python)

```bash
python -m pip install -e "python/pcn-core[dev]"
pytest -q python/pcn-core
```

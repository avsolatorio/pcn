# Publishing PCN to npm

The PCN monorepo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing. Packages are published under the scope `@pcn-js/*` (e.g. `@pcn-js/core`, `@pcn-js/ui`, `@pcn-js/data360`, `@pcn-js/fixtures`).

## Prerequisites

- **npm account** — for [public npm](https://www.npmjs.com/) you need an account.
- **Scope / org** — packages use the scope `@pcn-js/*`. You must [create an npm organization](https://www.npmjs.com/org/create) named **`pcn-js`** (same as the scope) **before** the first publish; otherwise publish returns **E404 Not Found**. If that name is not available, use an [alternative scope](#organization-name-not-available) (e.g. your user scope or a different org name).
- **Build** — ensure all packages build: from repo root run `pnpm build`.

## Option A: Publish to the public npm registry (registry.npmjs.org)

Use this so any app can install with `npm install @pcn-js/core @pcn-js/ui @pcn-js/data360` (or pnpm/yarn).

1. **Log in to npm** (public registry):

   ```bash
   npm login
   # Use your npmjs.com credentials; this targets registry.npmjs.org
   ```

2. **Add changesets** for the changes you want to release:

   ```bash
   pnpm changeset
   # Follow prompts: select packages, choose bump type (major/minor/patch), add summary
   ```

3. **Version packages** (updates `package.json` versions and CHANGELOGs):

   ```bash
   pnpm version-packages
   ```

4. **Publish** to the public registry. Override the registry so publish goes to npm (not your `.npmrc` default, e.g. Artifactory):

   ```bash
   npm config set registry https://registry.npmjs.org/
   pnpm release
   npm config delete registry   # optional: restore previous default
   ```

   Or in one go without changing global config:

   ```bash
   npm publish -w @pcn-js/core --registry https://registry.npmjs.org/
   npm publish -w @pcn-js/ui --registry https://registry.npmjs.org/
   npm publish -w @pcn-js/data360 --registry https://registry.npmjs.org/
   npm publish -w @pcn-js/fixtures --registry https://registry.npmjs.org/
   ```

   With Changesets, the usual flow is `pnpm release`, which runs `changeset publish` (and will use whatever registry is currently configured). So set registry to `https://registry.npmjs.org/` before `pnpm release` when publishing to public npm.

5. **Commit and push** the version bumps and changelogs (and tag if your CI does it):

   ```bash
   git add . && git commit -m "chore: release @pcn-js/*" && git push
   ```

## Option B: Publish to an internal registry (e.g. Artifactory)

If your repo `.npmrc` points to an internal registry (e.g. Artifactory), you can publish there so internal apps can install `@pcn-js/*` from that registry.

1. **Authenticate** to the internal registry (e.g. `npm login` against Artifactory, or use `.npmrc` with `_auth` as already configured).

2. **Add changesets** and **version** as above:

   ```bash
   pnpm changeset
   pnpm version-packages
   ```

3. **Publish** (uses registry from `.npmrc`):

   ```bash
   pnpm release
   ```

4. **Commit and push** version and changelog updates.

## Installing in an app after publishing

- **From public npm:**
  In the app (e.g. vercel-ai-chatbot frontend), replace `file:` links with version ranges:

  ```json
  {
    "dependencies": {
      "@pcn-js/core": "^0.1.0",
      "@pcn-js/ui": "^0.1.0",
      "@pcn-js/data360": "^0.1.0"
    }
  }
  ```

  Then run `pnpm install` (or `npm install`). Remove any `pnpm.overrides` that pointed at `file:../../pcn/...` for these packages.

- **From internal registry:**
  Ensure the app’s npm/pnpm config uses the same registry and auth; then use the same version ranges and install as above.

## Summary

| Step               | Command                                        |
| ------------------ | ---------------------------------------------- |
| Add changesets     | `pnpm changeset`                               |
| Bump versions      | `pnpm version-packages`                        |
| Publish (public)   | Set registry to npmjs.org, then `pnpm release` |
| Publish (internal) | `pnpm release` (with registry in `.npmrc`)     |

Each package has `"publishConfig": { "access": "public" }` so the scoped packages `@pcn-js/*` are published as public when the target registry supports it (e.g. npm).

## Troubleshooting (public npm)

### E403: Two-factor authentication or granular access token required

npm requires one of the following to publish:

1. **Enable 2FA on your npm account** (recommended):
   - Go to [npm → Account Settings → Two-Factor Authentication](https://www.npmjs.com/settings/~yourusername/account)
   - Turn on “Require two-factor authentication for writes (publishing)”
   - Run `npm login` again; npm will prompt for your OTP when you publish.

2. **Use a granular access token with publish and “bypass 2FA”** (for CI or headless use):
   - Go to [npm → Access Tokens](https://www.npmjs.com/settings/~yourusername/tokens)
   - Create token → “Granular access token”
   - Set permissions: **Packages and scopes** → Read and write for `@pcn-js` (or your scope)
   - Enable “Bypass two-factor authentication when publishing from the command line”
   - Use the token when logging in: `npm login --auth-type=legacy` and paste the token as the password (username can be your npm username or `_authToken`-style usage), or set in `.npmrc`:
     `//registry.npmjs.org/:_authToken=YOUR_TOKEN`

After changing 2FA or creating a token, run **`npm login`** again (with registry set to `https://registry.npmjs.org/` if needed), then retry `pnpm release`.

### E404: Not Found when publishing @pcn-js/*

If you see **404 Not Found - PUT https://registry.npmjs.org/@pcn-js%2f...** or "The requested resource '@pcn-js/...' could not be found or you do not have permission":

- The scope `@pcn-js` must exist on npm. [Create an organization](https://www.npmjs.com/org/create) named **`pcn-js`** (same as the scope). Until the org exists, npm returns 404 for PUT.
- Ensure you're logged in (`npm login` with registry `https://registry.npmjs.org/`) with the account that owns that org (or is a member with publish rights).

### Organization name not available

If the organization name **pcn** is not available on npm, you can publish under a different scope:

1. **User scope (no org needed)** — Use your npm username. For example, if your username is `avsolatorio`, rename packages to `@avsolatorio/pcn-core`, `@avsolatorio/pcn-ui`, `@avsolatorio/pcn-data360`, `@avsolatorio/pcn-fixtures`. You can publish under your user scope without creating an organization.
2. **Different org name** — Create an organization with another name (e.g. `pcn-js`, `proof-carrying-numbers`) and use that as the scope: `@pcn-js/core`, `@pcn-js/ui`, etc.
3. **Unscoped packages** — Publish without a scope: `pcn-core`, `pcn-ui`, `pcn-data360`, `pcn-fixtures`. Install with `npm install pcn-core pcn-ui pcn-data360`. Unscoped names must be globally unique on npm.

To switch scope, update the `name` field in each package's `package.json`, update internal references (e.g. `@pcn-js/core` → `@yourscope/core` in dependencies), and update any docs or app `package.json` that install these packages.

### One-time password (OTP) when 2FA is enabled

If you see **"This operation requires a one-time password from your authenticator"**:

- npm is asking for your 2FA code. Run `pnpm release` in an **interactive** terminal and enter the 6-digit code from your authenticator when prompted.
- If the prompt doesn't appear (e.g. in a non-interactive or CI environment), pass the OTP for that run:
  `NPM_CONFIG_OTP=123456 pnpm release`
  (Replace `123456` with the current code; it changes every ~30 seconds.)

### Access token expired or revoked

If you see “Access token expired or revoked. Please try logging in again”:

- Run `npm login` (with registry `https://registry.npmjs.org/`).
- If you use a token in `.npmrc`, generate a new token at [npm Access Tokens](https://www.npmjs.com/settings/~yourusername/tokens) and update the value.

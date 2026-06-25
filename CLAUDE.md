# n8n-nodes-gainium (`n8n-nodes-gainium`)

## 📚 Platform knowledge base

A curated, auto-updated AI-agent knowledge base for the **whole Gainium platform** lives in the
private repo **`gainium-0-knowledge`** (`github.com/aressanch/gainium-0-knowledge`).
Local checkouts — Mac: `~/Git/Gainium Local/0-knowledge` · VPS: `/root/git/0-knowledge`.

Consult it before non-trivial work: `ARCHITECTURE.md` (service graph + danger boundaries),
`subsystems/<area>.md` (how each area works & breaks), `bug-patterns/`, `runbooks/`,
`domain/glossary.md`. Query 3.7k historical bugs by symptom:
`python3 <kb>/_raw/scripts/bugs.py find "<terms>"`. It is auto-enriched daily from agent session digests.

n8n community node wrapping the Gainium API, installed into an n8n instance.
Map: [`../0-knowledge/ARCHITECTURE.md`](../0-knowledge/ARCHITECTURE.md).

## Run / test
- build `npm run build` · dev `npm run dev` · lint `npm run lint` · type-check `npm run type-check`

## n8n Cloud verification linter (MUST pass before publishing)
n8n Cloud verifies every published version with the **`@n8n/scan-community-package`** ESLint
ruleset (`@n8n/eslint-plugin-community-nodes`, config `recommended`). It runs against the
**compiled `dist/` JS**, not the TS source. Reproduce a release candidate's findings with:
```
npx @n8n/scan-community-package@latest n8n-nodes-gainium   # scans the PUBLISHED version
```
It only blocks on **errors** (warnings are fine). Rules that have bitten us — keep the code
compliant so future releases don't get rejected:
- **`no-restricted-globals`** — no `globalThis` / `process` / `setTimeout` / `__dirname` etc.
  HMAC signing therefore uses the Node `crypto` module (`createHmac`), never `globalThis.crypto.subtle`.
- **`no-http-request-with-manual-auth`** — a function may not call both `this.getCredentials()` and
  `this.helpers.httpRequest()`. Auth lives in the credential's **`authenticate` function**
  (`credentials/GainiumApi.credentials.ts`), which signs each request (per-request HMAC over
  `body + METHOD + path+query + timestamp` → Token/Time/Signature headers and prepends base URL).
  Both nodes call `this.helpers.httpRequestWithAuthentication("gainiumApi", options)` and never
  sign or fetch credentials themselves. **Never reintroduce `this.helpers.httpRequest()`.**
- **`require-node-api-error`** — request failures must throw `NodeApiError(this.getNode(), error)`
  (not a raw `Error`) so HTTP status/context surfaces in the n8n UI. See `GenericFunctions.ts` and
  both nodes' `execute()` catch blocks.
- **`valid-author`** — `package.json` `author` must be the object form with a non-empty `email`.

## Coupling — depends on the PUBLIC api.gainium.io contract
- All nodes call **main-app public REST** (`/api/v2/bots|deals|user|exchanges|screener`, plus some legacy
  `/api/*`) with HMAC token+secret credentials (`credentials/GainiumApi.credentials.ts`, default
  `https://api.gainium.io`). This contract is **owned by main-app** (root Danger List §2); breaking changes
  there break published n8n workflows.

## Rules
- Pure consumer of the public API. Match endpoint paths/params to main-app's `/api/v2`; don't invent shapes.

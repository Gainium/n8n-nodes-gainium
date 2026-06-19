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

## Coupling — depends on the PUBLIC api.gainium.io contract
- All nodes call **main-app public REST** (`/api/v2/bots|deals|user|exchanges|screener`, plus some legacy
  `/api/*`) with HMAC token+secret credentials (`credentials/GainiumApi.credentials.ts`, default
  `https://api.gainium.io`). This contract is **owned by main-app** (root Danger List §2); breaking changes
  there break published n8n workflows.

## Rules
- Pure consumer of the public API. Match endpoint paths/params to main-app's `/api/v2`; don't invent shapes.

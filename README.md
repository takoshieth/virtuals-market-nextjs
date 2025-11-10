# Virtuals Market (Next.js App Router)

A minimal, production-ready starter to list **all Virtual Protocol tokens** and show **live prices**.

## Features
- Pulls token list from `https://api2.virtuals.io/api/virtuals` (server-side, cached).
- Fetches live price/FDV/24h%/24h volume from DexScreener per token address (server-side, cached).
- Merges both into `/api/virtuals/combined` and renders a sortable, searchable table.
- Auto-refresh every 60 seconds.
- TailwindCSS dark UI.

## Quick Start
```bash
npm i
npm run dev
# open http://localhost:3000
```

## Notes
- API rate limits: We cache server responses for 60s to avoid rate limits.
- Address field detection: we try `contractAddress | address | tokenAddress | baseAddress | contract.address`.
- If `api2.virtuals.io` requires special headers, add them in `src/app/api/virtuals/route.ts`.
- To switch market data to GeckoTerminal: implement `src/app/api/virtuals/prices/route.ts` accordingly.

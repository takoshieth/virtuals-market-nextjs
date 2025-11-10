import { NextResponse } from 'next/server'
import { fetchJson, pickAddress } from '@/lib/utils'

const DEX_BASE = 'https://api.dexscreener.com/latest/dex/tokens/'
const TTL = 60_000
let cache: any = null
let ts = 0

async function priceFor(address: string) {
  try {
    const j = await fetchJson(DEX_BASE + address)
    // pick first pair if exists
    const p = j?.pairs?.[0]
    return {
      priceUsd: p?.priceUsd ? Number(p.priceUsd) : null,
      change24h: p?.priceChange?.h24 != null ? Number(p.priceChange.h24) : null,
      volume24h: p?.volume?.h24 != null ? Number(p.volume.h24) : null,
      fdv: p?.fdv != null ? Number(p.fdv) : null,
      pairUrl: p?.url ?? null
    }
  } catch (e:any) {
    return { priceUsd: null, change24h: null, volume24h: null, fdv: null, pairUrl: null }
  }
}

export async function GET() {
  const now = Date.now()
  if (cache && (now - ts) < TTL) return NextResponse.json(cache)

  try {
    // Get list first
    const listRes = await fetch('http://localhost:3000/api/virtuals', { headers: { 'accept': 'application/json' } })
    const listJson = await listRes.json()
    const items = listJson?.data ?? []

    // Build unique addresses
    const entries = items.map((t:any) => ({ t, addr: pickAddress(t) })).filter(x => !!x.addr)
    // batch in chunks to avoid overwhelming (but dex api is per-address anyway)
    const results = await Promise.all(entries.map(async ({t, addr}) => {
      const m = await priceFor(addr as string)
      return {
        id: t?.id ?? addr,
        name: t?.name ?? t?.tokenName ?? 'Unknown',
        symbol: t?.symbol ?? t?.ticker ?? '—',
        address: addr,
        status: t?.status ?? t?.state ?? null,
        createdAt: t?.createdAt ?? null,
        ...m
      }
    }))

    cache = results
    ts = now
    return NextResponse.json(results)
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? 'prices failed' }, { status: 502 })
  }
}

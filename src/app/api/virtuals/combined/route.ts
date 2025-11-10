import { NextResponse } from 'next/server'
import { pickAddress } from '@/lib/utils'

const TTL = 60_000
let cache: any = null
let at = 0

export async function GET() {
  const now = Date.now()
  if (cache && (now - at) < TTL) return NextResponse.json(cache)

  try {
    // ✅ localhost yerine dinamik origin kullan
    const origin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const [listRes, priceRes] = await Promise.all([
      fetch(`${origin}/api/virtuals`, { headers: { 'accept': 'application/json' } }),
      fetch(`${origin}/api/virtuals/prices`, { headers: { 'accept': 'application/json' } })
    ])

    const listJson = await listRes.json()
    const priceJson = await priceRes.json()

    const priceMap = new Map<string, any>()
    for (const p of priceJson) priceMap.set(String(p.address).toLowerCase(), p)

    const merged = (listJson?.data ?? []).map((t:any) => {
      const addr = (pickAddress(t) || '').toLowerCase()
      const p = priceMap.get(addr)
      return {
        id: t?.id ?? addr,
        name: t?.name ?? t?.tokenName ?? 'Unknown',
        symbol: t?.symbol ?? t?.ticker ?? '—',
        address: addr || null,
        status: t?.status ?? t?.state ?? null,
        createdAt: t?.createdAt ?? null,
        priceUsd: p?.priceUsd ?? null,
        change24h: p?.change24h ?? null,
        volume24h: p?.volume24h ?? null,
        fdv: p?.fdv ?? null,
        pairUrl: p?.pairUrl ?? null
      }
    })

    cache = { data: merged, updatedAt: new Date().toISOString() }
    at = now
    return NextResponse.json(cache)
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? 'combined failed' }, { status: 502 })
  }
}

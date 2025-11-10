'use client'
import { useEffect, useMemo, useState } from 'react'

type Row = {
  id: string
  name: string
  symbol: string
  address: string | null
  status: string | null
  createdAt: string | null
  priceUsd: number | null
  change24h: number | null
  volume24h: number | null
  fdv: number | null
  pairUrl?: string | null
}

function fmtUsd(n: number | null) {
  if (n == null) return '—'
  if (n >= 1) return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return '$' + n.toFixed(6)
}
function fmtPct(n: number | null) {
  if (n == null) return '—'
  const s = n.toFixed(2) + '%'
  return n >= 0 ? s : s
}
function shorten(a?: string | null) {
  if (!a) return '—'
  return a.slice(0,6) + '…' + a.slice(-4)
}

export default function VirtualMarket() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<'name'|'priceUsd'|'change24h'|'volume24h'|'fdv'>('volume24h')
  const [dir, setDir] = useState<'asc'|'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<string>('')

  async function load() {
    try {
      const r = await fetch('/api/virtuals/combined', { cache: 'no-store' })
      const j = await r.json()
      setRows(j?.data ?? [])
      setUpdatedAt(j?.updatedAt ?? '')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    const base = s
      ? rows.filter(v => (v.name + ' ' + v.symbol + ' ' + (v.address ?? '')).toLowerCase().includes(s))
      : rows.slice()

    const sorted = base.sort((a,b) => {
      const va = (a as any)[sortKey] ?? -Infinity
      const vb = (b as any)[sortKey] ?? -Infinity
      if (va === vb) return 0
      return dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
    return sorted
  }, [rows, q, sortKey, dir])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Virtual Protocol Tokens</h1>
        <div className="text-xs text-neutral-400">Updated: {updatedAt ? new Date(updatedAt).toLocaleTimeString() : '—'}</div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name / symbol / address" className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800 w-full sm:w-80" />
        <div className="flex items-center gap-2 text-sm">
          <label>Sort</label>
          <select value={sortKey} onChange={e=>setSortKey(e.target.value as any)} className="px-2 py-2 rounded bg-neutral-900 border border-neutral-800">
            <option value="volume24h">24h Volume</option>
            <option value="priceUsd">Price</option>
            <option value="change24h">24h %</option>
            <option value="fdv">FDV</option>
            <option value="name">Name</option>
          </select>
          <button onClick={()=>setDir(x=>x==='asc'?'desc':'asc')} className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800">{dir==='asc'?'▲':'▼'}</button>
        </div>
      </div>

      {loading ? <div className="animate-pulse text-neutral-400">Loading…</div> : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="text-sm">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Symbol</th>
                <th className="text-left">Address</th>
                <th className="text-right">Price</th>
                <th className="text-right">24h %</th>
                <th className="text-right">24h Volume</th>
                <th className="text-right">FDV</th>
                <th className="text-left">Pair</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.symbol}</td>
                  <td><code title={r.address ?? ''}>{shorten(r.address)}</code></td>
                  <td className="text-right">{fmtUsd(r.priceUsd)}</td>
                  <td className={"text-right " + (r.change24h!=null && r.change24h>=0 ? 'text-green-400':'text-red-400')}>{fmtPct(r.change24h)}</td>
                  <td className="text-right">{r.volume24h==null?'—':'$'+r.volume24h.toLocaleString()}</td>
                  <td className="text-right">{r.fdv==null?'—':'$'+r.fdv.toLocaleString()}</td>
                  <td>{r.pairUrl ? <a className="text-blue-400 hover:underline" href={r.pairUrl} target="_blank" rel="noreferrer">Open</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-neutral-500">Data sources: api2.virtuals.io (list) + DexScreener (market). This page refreshes every 60s.</p>
    </div>
  )
}

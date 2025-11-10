import { NextResponse } from 'next/server'
import { fetchJson } from '/lib/utils'

const VIRTUALS_URL = 'https://api2.virtuals.io/api/virtuals'
let cache: any = null
let at = 0
const TTL = 60_000

export async function GET() {
  const now = Date.now()
  if (cache && (now - at) < TTL) {
    return NextResponse.json({ source: 'cache', data: cache })
  }
  try {
    const data = await fetchJson(VIRTUALS_URL)
    cache = data?.data ?? data
    at = now
    return NextResponse.json({ source: 'live', data: cache })
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? 'Fetch failed' }, { status: 502 })
  }
}

export function pickAddress(t: any): string | null {
  const candidates = [
    t?.contractAddress,
    t?.address,
    t?.tokenAddress,
    t?.baseAddress,
    t?.contract?.address,
  ].filter(Boolean);
  const adr = candidates.length ? String(candidates[0]) : null;
  if (!adr) return null;
  if (adr.startsWith('0x') && adr.length >= 10) return adr;
  return null;
}

export async function fetchJson(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, headers: { 'accept': 'application/json', ...(init?.headers||{}) } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

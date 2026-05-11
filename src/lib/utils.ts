const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? ''

export function getImgUrl(foto?: string | null): string | null {
  if (!foto) return null
  return foto.startsWith('http') ? foto : `${BASE_URL}${foto}`
}

export function apiMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response
    return r?.data?.message ?? fallback
  }
  return fallback
}

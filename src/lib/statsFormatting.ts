export function formatNumber(val: number | null | undefined): string {
  if (val == null) return '—'
  return Math.round(val).toLocaleString()
}

export function formatTime(seconds: number | null | undefined): string {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function kd(kills: number | null, deaths: number | null): string {
  if (kills == null || deaths == null) return '—'
  if (deaths === 0) return kills > 0 ? '∞' : '0'
  return (kills / deaths).toFixed(2)
}

export function kad(elims: number | null, assists: number | null, deaths: number | null): string {
  if (elims == null || assists == null || deaths == null) return '—'
  if (deaths === 0) return (elims + assists) > 0 ? '∞' : '0'
  return ((elims + assists) / deaths).toFixed(2)
}

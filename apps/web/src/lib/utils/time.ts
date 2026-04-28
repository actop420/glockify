import type { TimeEntry } from "@/lib/types/time-entry"

export type DayGroup = {
  dayKey: string    
  label: string     
  entries: Array<TimeEntry>
  total: number     
}

/** ms → "HH:MM:SS" */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/** "HH:MM:SS" or "H:MM:SS" → ms. Returns 0 for invalid input. */
export function parseDuration(str: string): number {
  const parts = str.trim().split(":").map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return 0
  const [h, m, s] = parts
  return ((h * 3600) + (m * 60) + s) * 1000
}

export function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function parseTimeToEpoch(timeStr: string, referenceMs: number): number | null {
  const trimmed = timeStr.trim()
  let h: number, m: number

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map(Number)
    if (parts.length !== 2 || parts.some(isNaN)) return null
    ;[h, m] = parts
  } else if (/^\d{3,4}$/.test(trimmed)) {
    h = parseInt(trimmed.slice(0, -2), 10)
    m = parseInt(trimmed.slice(-2), 10)
  } else {
    return null
  }

  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  const d = new Date(referenceMs)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

/** epoch ms → "Tue, Apr 21" */
export function formatDateLabel(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

/** epoch ms → "YYYY-MM-DD" local date key */
export function toDayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function isToday(ts: number): boolean {
  return toDayKey(ts) === toDayKey(Date.now())
}

/** Group and sort entries: newest day first, within each day newest entry first. */
export function groupEntriesByDay(entries: Array<TimeEntry>): Array<DayGroup> {
  const map = new Map<string, Array<TimeEntry>>()

  for (const entry of entries) {
    const key = toDayKey(entry.startTime)
    const group = map.get(key)
    if (group) {
      group.push(entry)
    } else {
      map.set(key, [entry])
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dayKey, dayEntries]) => {
      const sorted = [...dayEntries].sort((a, b) => b.startTime - a.startTime)
      const total = sorted.reduce((sum, e) => sum + (e.endTime - e.startTime), 0)
      return {
        dayKey,
        label: formatDateLabel(sorted[0].startTime),
        entries: sorted,
        total,
      }
    })
}

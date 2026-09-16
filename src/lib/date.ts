const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function getDayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getMonthKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getTodayKey(): string {
  return getDayKey(Date.now())
}

export function getCurrentMonthKey(): string {
  return getMonthKey(Date.now())
}

export function getLastMonthKey(): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  return getMonthKey(d.getTime())
}

export function formatDateHeader(ts: number): string {
  const d = new Date(ts)
  const today = getTodayKey()
  const key = getDayKey(ts)
  if (key === today) return '今天'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (key === getDayKey(yesterday.getTime())) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`
}

/** 账单分组的两段式日期头：主日期 "5月18日" + 副标签 "今天"/"昨天"/"周六" */
export function formatDayGroupHeader(ts: number): { dateLabel: string; tag: string } {
  const d = new Date(ts)
  const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日`
  const today = getTodayKey()
  const key = getDayKey(ts)
  if (key === today) return { dateLabel, tag: '今天' }
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (key === getDayKey(yesterday.getTime())) return { dateLabel, tag: '昨天' }
  return { dateLabel, tag: WEEKDAYS[d.getDay()] }
}

export function formatFullDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${'日一二三四五六'[d.getDay()]}`
}

export function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatMonthLabel(monthKey: string): string {
  const [, m] = monthKey.split('-')
  return `${parseInt(m, 10)}月`
}

/** 返回最近 N 天的日期 key 数组（含今天），按时间正序 */
export function lastNDayKeys(n: number): string[] {
  const keys: string[] = []
  const d = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(d)
    day.setDate(d.getDate() - i)
    keys.push(getDayKey(day.getTime()))
  }
  return keys
}

/** datetime-local input 用的字符串格式 <-> 时间戳 互转 */
export function toDatetimeLocalValue(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromDatetimeLocalValue(value: string): number {
  const t = new Date(value).getTime()
  return isNaN(t) ? Date.now() : t
}

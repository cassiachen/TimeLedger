import { getDayKey } from './date'
import type { TimeEntry } from './types'

export interface ActivityGroup {
  key: string
  label: string
  icon: string
  activities: string[]
}

export const ACTIVITY_GROUPS: ActivityGroup[] = [
  { key: 'growth', label: '成长', icon: 'school', activities: ['IELTS', '学习', '阅读', '技能'] },
  { key: 'career', label: '事业', icon: 'work', activities: ['做自己的产品', '副业', '创业', '求职'] },
  { key: 'life', label: '生活', icon: 'favorite', activities: ['陪家人', '朋友', '恋爱', '陪宠物'] },
  { key: 'body', label: '身体', icon: 'directions_run', activities: ['运动', '散步', '睡觉', '放松'] },
  { key: 'fun', label: '娱乐', icon: 'sports_esports', activities: ['游戏', '电影', '看剧', '刷视频'] },
]

/** 「什么都不安排」：把时间留给自己，同样算一条记录 */
export const FREE_GROUP = 'free'
export const FREE_ACTIVITY = '什么都不安排'
export const FREE_LABEL = '自由'

export function groupLabel(key: string): string {
  if (key === FREE_GROUP) return FREE_LABEL
  return ACTIVITY_GROUPS.find((g) => g.key === key)?.label ?? '其他'
}

export function groupIcon(key: string): string {
  if (key === FREE_GROUP) return 'spa'
  return ACTIVITY_GROUPS.find((g) => g.key === key)?.icon ?? 'schedule'
}

export function sumMinutes(entries: TimeEntry[], pred: (e: TimeEntry) => boolean): number {
  return entries.reduce((s, e) => (pred(e) ? s + e.minutes : s), 0)
}

/** 本周从周一开始 */
export function weekStartKey(ts = Date.now()): string {
  const d = new Date(ts)
  const dow = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dow)
  return getDayKey(d.getTime())
}

export function monthPrefix(ts = Date.now()): string {
  return getDayKey(ts).slice(0, 7)
}

/** 分钟数 -> "1小时30分钟" / "45分钟" / "2小时" */
export function formatMinutes(min: number): string {
  const m = Math.max(0, Math.round(min))
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h === 0) return `${r}分钟`
  if (r === 0) return `${h}小时`
  return `${h}小时${r}分钟`
}

/** 分钟数 -> "1h30m" 紧凑写法 */
export function formatMinutesShort(min: number): string {
  const m = Math.max(0, Math.round(min))
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h === 0) return `${r}m`
  if (r === 0) return `${h}h`
  return `${h}h${r}m`
}

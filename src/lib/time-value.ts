import type { WageSettings } from './types'

/** 每天实际占用的工时 = 在岗工时 + 通勤时间 */
export function getDailyHours(settings: WageSettings): number {
  return settings.workHoursPerDay + (settings.commuteHours || 0)
}

export const DEFAULT_WORK_START_HOUR = 9
export const DEFAULT_SLEEP_HOURS = 7
export const DEFAULT_MEAL_HOURS = 2

/** 一个工作日的 24 小时怎么分：睡觉 / 工作 / 通勤 / 吃饭，剩下的就是自己的时间 */
export function getDayBreakdown(s: WageSettings) {
  const sleep = s.sleepHours ?? DEFAULT_SLEEP_HOURS
  const meals = s.mealHours ?? DEFAULT_MEAL_HOURS
  const work = s.workHoursPerDay
  const commute = s.commuteHours || 0
  return { sleep, meals, work, commute, free: 24 - sleep - meals - work - commute }
}

export function getHourlyWage(settings: WageSettings): number {
  const totalHours = settings.workDays * getDailyHours(settings)
  if (!totalHours) return 0
  return settings.monthlyIncome / totalHours
}

/** 金额换算成小时数 */
export function amountToHours(amount: number, hourlyWage: number): number {
  if (!hourlyWage) return 0
  return amount / hourlyWage
}

/** 小时数格式化成 "X小时Y分钟" / "Y分钟"，用于展示时间成本 */
export function formatDuration(hours: number): string {
  if (!isFinite(hours) || hours <= 0) return '0分钟'
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h <= 0) return `${m}分钟`
  if (m === 0) return `${h}小时`
  return `${h}小时${m}分钟`
}

/** 简短格式，用于账单行内展示，如 "37分钟" / "2.3小时" */
export function formatDurationShort(hours: number): string {
  if (!isFinite(hours) || hours <= 0) return '0分钟'
  if (hours < 1) return `${Math.round(hours * 60)}分钟`
  return `${hours.toFixed(1)}小时`
}

/** 紧凑 "2h 45m" / "37m" 格式，用于 Ledger 风格的大号计时展示 */
export function formatHM(hours: number): string {
  if (!isFinite(hours) || hours <= 0) return '0m'
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h <= 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatMoney(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}¥${Math.abs(amount).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatPercentChange(current: number, previous: number): string {
  if (previous === 0) {
    return current === 0 ? '—' : '+100%'
  }
  const diff = ((current - previous) / previous) * 100
  const str = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`
  return str
}

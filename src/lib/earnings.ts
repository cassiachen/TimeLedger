import { getDayKey, getTodayKey } from './date'
import { amountToHours, DEFAULT_WORK_START_HOUR } from './time-value'
import type { Transaction, WageSettings } from './types'

export type DayStatus = 'work' | 'off'
export type DayOverrides = Record<string, DayStatus>

// 「工资」入账是打工收入到账的那一下，已经按天累计过了，不再重复计入
export const SALARY_CATEGORY = '工资'

export interface EarningsCtx {
  settings: WageSettings
  overrides: DayOverrides
  hourlyWage: number
  /** 当前时间（毫秒），用来算今天已经赚到多少；不传就用系统时间 */
  now?: number
}

/** 今天已经过去了上班时间窗口的几分之几（0~1）：从上班时间开始，到上班时间 + 工作时长结束 */
export function workFraction(now: number, settings: WageSettings): number {
  const start = settings.workStartHour ?? DEFAULT_WORK_START_HOUR
  const span = settings.workHoursPerDay || 8
  const d = new Date(now)
  const hour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
  return Math.min(1, Math.max(0, (hour - start) / span))
}

export interface DayReport {
  dayKey: string
  isWorkday: boolean
  isFuture: boolean
  workIncome: number
  workHours: number
  extraIncome: number
  expense: number
  netMoney: number
  netHours: number
  txns: Transaction[]
}

export function parseDayKey(dayKey: string): Date {
  const [y, m, d] = dayKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function makeDayKey(y: number, month0: number, d: number): string {
  return `${y}-${String(month0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** 默认周一到周五上班，可以在日历里手动改某一天 */
export function defaultIsWorkday(dayKey: string): boolean {
  const dow = parseDayKey(dayKey).getDay()
  return dow >= 1 && dow <= 5
}

export function isWorkday(dayKey: string, overrides: DayOverrides): boolean {
  const o = overrides[dayKey]
  return o ? o === 'work' : defaultIsWorkday(dayKey)
}

export function groupByDay(txns: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>()
  for (const t of txns) {
    const key = getDayKey(t.timestamp)
    const arr = map.get(key)
    if (arr) arr.push(t)
    else map.set(key, [t])
  }
  return map
}

export function buildDayReport(dayKey: string, dayTxns: Transaction[], ctx: EarningsCtx): DayReport {
  const { settings, overrides, hourlyWage } = ctx
  const work = isWorkday(dayKey, overrides)
  const isFuture = dayKey > getTodayKey()
  let workIncome = 0
  if (!isFuture && work && settings.workDays > 0) {
    const daily = settings.monthlyIncome / settings.workDays
    // 过去的工作日算满一天；今天按上班时间随时间慢慢累计
    workIncome = dayKey === getTodayKey() ? daily * workFraction(ctx.now ?? Date.now(), settings) : daily
  }

  let extraIncome = 0
  let expense = 0
  for (const t of dayTxns) {
    if (t.type === 'income' && t.category !== SALARY_CATEGORY) extraIncome += t.amount
    else if (t.type === 'expense') expense += t.amount
  }

  const netMoney = workIncome + extraIncome - expense
  return {
    dayKey,
    isWorkday: work,
    isFuture,
    workIncome,
    workHours: amountToHours(workIncome, hourlyWage),
    extraIncome,
    expense,
    netMoney,
    netHours: amountToHours(netMoney, hourlyWage),
    txns: dayTxns,
  }
}

export interface MonthReport {
  days: DayReport[]
  workIncome: number
  extraIncome: number
  expense: number
  netMoney: number
  netHours: number
}

export function buildMonthReport(year: number, month0: number, byDay: Map<string, Transaction[]>, ctx: EarningsCtx): MonthReport {
  const count = new Date(year, month0 + 1, 0).getDate()
  const days: DayReport[] = []
  let workIncome = 0
  let extraIncome = 0
  let expense = 0
  for (let d = 1; d <= count; d++) {
    const key = makeDayKey(year, month0, d)
    const r = buildDayReport(key, byDay.get(key) || [], ctx)
    days.push(r)
    workIncome += r.workIncome
    extraIncome += r.extraIncome
    expense += r.expense
  }
  const netMoney = workIncome + extraIncome - expense
  return { days, workIncome, extraIncome, expense, netMoney, netHours: amountToHours(netMoney, ctx.hourlyWage) }
}

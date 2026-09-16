import { getCurrentMonthKey, getDayKey, getLastMonthKey, getMonthKey, getTodayKey, lastNDayKeys } from './date'
import { amountToHours } from './time-value'
import type { Transaction } from './types'

export interface PeriodTotals {
  income: number
  expense: number
  net: number
  expenseHours: number
  count: number
}

function emptyTotals(): PeriodTotals {
  return { income: 0, expense: 0, net: 0, expenseHours: 0, count: 0 }
}

export function computeTotals(txns: Transaction[], hourlyWage: number): PeriodTotals {
  const totals = emptyTotals()
  for (const t of txns) {
    if (t.type === 'income') {
      totals.income += t.amount
      totals.count += 1
    } else if (t.type === 'expense') {
      totals.expense += t.amount
      totals.expenseHours += amountToHours(t.amount, hourlyWage)
      totals.count += 1
    }
    // 转账不计入收支
  }
  totals.net = totals.income - totals.expense
  return totals
}

export function filterByDay(txns: Transaction[], dayKey: string): Transaction[] {
  return txns.filter((t) => getDayKey(t.timestamp) === dayKey)
}

export function filterByMonth(txns: Transaction[], monthKey: string): Transaction[] {
  return txns.filter((t) => getMonthKey(t.timestamp) === monthKey)
}

export function getTodayTotals(txns: Transaction[], hourlyWage: number) {
  return computeTotals(filterByDay(txns, getTodayKey()), hourlyWage)
}

export function getMonthTotals(txns: Transaction[], hourlyWage: number, monthKey = getCurrentMonthKey()) {
  return computeTotals(filterByMonth(txns, monthKey), hourlyWage)
}

export interface CategoryStat {
  category: string
  amount: number
  hours: number
  count: number
}

export function getExpenseCategoryStats(txns: Transaction[], hourlyWage: number): CategoryStat[] {
  const map = new Map<string, CategoryStat>()
  for (const t of txns) {
    if (t.type !== 'expense') continue
    const key = t.category || '其他'
    const entry = map.get(key) || { category: key, amount: 0, hours: 0, count: 0 }
    entry.amount += t.amount
    entry.hours += amountToHours(t.amount, hourlyWage)
    entry.count += 1
    map.set(key, entry)
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount)
}

export interface DailyTrendPoint {
  dayKey: string
  label: string
  expense: number
  income: number
  expenseHours: number
}

export function getDailyTrend(txns: Transaction[], hourlyWage: number, days = 14): DailyTrendPoint[] {
  const keys = lastNDayKeys(days)
  const byDay = new Map<string, DailyTrendPoint>()
  keys.forEach((k) => {
    const [, m, d] = k.split('-')
    byDay.set(k, { dayKey: k, label: `${parseInt(m, 10)}/${parseInt(d, 10)}`, expense: 0, income: 0, expenseHours: 0 })
  })
  for (const t of txns) {
    const key = getDayKey(t.timestamp)
    const point = byDay.get(key)
    if (!point) continue
    if (t.type === 'expense') {
      point.expense += t.amount
      point.expenseHours += amountToHours(t.amount, hourlyWage)
    } else if (t.type === 'income') {
      point.income += t.amount
    }
  }
  return keys.map((k) => byDay.get(k)!)
}

export function getMonthOverMonth(txns: Transaction[], hourlyWage: number) {
  const current = getMonthTotals(txns, hourlyWage, getCurrentMonthKey())
  const previous = getMonthTotals(txns, hourlyWage, getLastMonthKey())
  return { current, previous }
}

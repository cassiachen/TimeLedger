import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { getCategoryIcon } from '../lib/categories'
import { getCurrentMonthKey, getMonthKey } from '../lib/date'
import {
  getDailyTrend,
  getExpenseCategoryStats,
  getMonthTotals,
  getWeekTotals,
  getYearTotals,
  type PeriodTotals,
} from '../lib/selectors'
import { formatHM, formatMoney } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

type Period = '周' | '月' | '年' | '自定义'

export function Stats() {
  const { transactions, hourlyWage, expenseCategories, wageSettings } = useLedger()
  const [period, setPeriod] = useState<Period>('月')

  const weekTotals = useMemo(() => getWeekTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const monthTotals = useMemo(() => getMonthTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const yearTotals = useMemo(() => getYearTotals(transactions, hourlyWage), [transactions, hourlyWage])

  const totalsByPeriod: Record<Period, PeriodTotals> = {
    '周': weekTotals,
    '月': monthTotals,
    '年': yearTotals,
    '自定义': monthTotals,
  }
  const totals = totalsByPeriod[period]

  const standardHoursByPeriod: Record<Period, number> = {
    '周': wageSettings.workHoursPerDay * 7,
    '月': wageSettings.workDays * wageSettings.workHoursPerDay,
    '年': wageSettings.workDays * wageSettings.workHoursPerDay * 12,
    '自定义': wageSettings.workDays * wageSettings.workHoursPerDay,
  }
  const standardHours = standardHoursByPeriod[period] || 1
  const exhaustionRatio = Math.min(100, (totals.expenseHours / standardHours) * 100)

  const PERIOD_LABEL: Record<Period, string> = { '周': '本周', '月': '本月', '年': '本年', '自定义': '本期间' }
  const periodLabel = PERIOD_LABEL[period]

  const categoryStats = useMemo(() => {
    const currentMonth = getCurrentMonthKey()
    const thisMonthTxns = transactions.filter((t) => getMonthKey(t.timestamp) === currentMonth)
    return getExpenseCategoryStats(thisMonthTxns, hourlyWage)
  }, [transactions, hourlyWage])
  const totalCategoryAmount = categoryStats.reduce((s, c) => s + c.amount, 0) || 1

  const trend = useMemo(() => getDailyTrend(transactions, hourlyWage, 18), [transactions, hourlyWage])
  const dayCount = period === '周' ? 7 : period === '年' ? 365 : 30
  const dailyAvgHours = totals.expenseHours / dayCount
  const freedomRatio = 100 - exhaustionRatio

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Period switch */}
      <section className="flex items-center justify-between bg-surface-container-low p-1 rounded-xl">
        <div className="grid grid-cols-4 w-full gap-1">
          {(['周', '月', '年', '自定义'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`py-1.5 text-center font-label-md text-label-md rounded transition-all ${
                period === p
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Hero card */}
      <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-1">
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
              Temporal Capital Exhaustion
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight">
                {totals.expenseHours.toFixed(1)}
              </span>
              <span className="font-metric-md text-metric-md text-secondary font-medium">小时</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {periodLabel}消耗相当于占标准工时{' '}
              <span className="font-metric-sm text-metric-sm text-on-surface font-medium">{standardHours.toFixed(0)}h</span> 的{' '}
              <span className="font-metric-sm text-metric-sm text-secondary font-medium">{exhaustionRatio.toFixed(1)}%</span>
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center px-2 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-metric-sm text-metric-sm">
              <span className="material-symbols-outlined text-[13px] mr-1 text-secondary">payments</span>
              {formatMoney(totals.expense)}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-1.5 pt-1">
          <div className="w-full h-2 rounded bg-surface-container-high overflow-hidden flex">
            <div className="h-full bg-secondary transition-all duration-700" style={{ width: `${exhaustionRatio}%` }} />
            <div className="h-full bg-surface-container-highest" style={{ width: `${100 - exhaustionRatio}%` }} />
          </div>
          <div className="flex items-center justify-between font-label-mono text-label-mono text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
              已耗工时 {totals.expenseHours.toFixed(1)}h
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-surface-variant inline-block" />
              剩余自由工时 {Math.max(0, standardHours - totals.expenseHours).toFixed(1)}h
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 bg-surface-container-low p-2.5 rounded-lg">
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface-variant">总账支出</span>
            <span className="font-metric-sm text-metric-sm text-on-surface font-medium mt-0.5 truncate">{formatMoney(totals.expense)}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface-variant">日均工时消耗</span>
            <span className="font-metric-sm text-metric-sm text-secondary font-medium mt-0.5 truncate">{dailyAvgHours.toFixed(1)}h</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface-variant">剩余自由度</span>
            <span className="font-metric-sm text-metric-sm text-on-surface font-medium mt-0.5 truncate">{Math.max(0, freedomRatio).toFixed(1)}%</span>
          </div>
        </div>
      </section>

      {/* Trend */}
      <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">支出趋势与工时波动</span>
            <span className="font-label-mono text-label-mono text-on-surface-variant">近 18 天每日工时消耗</span>
          </div>
        </div>
        <div style={{ height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#9b4500" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#9b4500" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#76777d' }} axisLine={false} tickLine={false} interval={2} />
              <Tooltip
                formatter={(value) => formatHM(Number(value))}
                labelStyle={{ color: '#191c1d', fontSize: 12 }}
                contentStyle={{ borderRadius: 4, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="expenseHours"
                stroke="#9b4500"
                strokeWidth={2}
                fill="url(#areaGradient)"
                dot={{ r: 2, fill: '#9b4500', stroke: '#ffffff', strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Category breakdown */}
      <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">分类工时分配</span>
            <span className="font-label-mono text-label-mono text-on-surface-variant">本月支出占比</span>
          </div>
        </div>
        {categoryStats.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">本月还没有支出记录</p>
        ) : (
          <div className="flex flex-col space-y-3 pt-1">
            {categoryStats.map((c) => {
              const pct = (c.amount / totalCategoryAmount) * 100
              return (
                <div key={c.category} className="flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded flex items-center justify-center bg-surface-container-high text-on-surface">
                        <span className="material-symbols-outlined text-[15px]">
                          {getCategoryIcon(expenseCategories, c.category)}
                        </span>
                      </span>
                      <span className="font-body-md text-body-md text-on-surface font-medium">{c.category}</span>
                      <span className="font-label-mono text-label-mono text-on-surface-variant">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="font-metric-md text-metric-md text-secondary font-medium">{formatHM(c.hours)}</span>
                      <span className="font-metric-sm text-metric-sm text-on-surface-variant">{formatMoney(c.amount)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded bg-surface-container-low overflow-hidden">
                    <div className="h-full bg-secondary rounded" style={{ width: `${Math.max(2, pct)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Insight callout */}
      <section className="flex flex-col bg-secondary-fixed text-on-secondary-fixed rounded-xl p-space-lg space-y-2 relative overflow-hidden shadow-sm">
        <div className="flex items-center space-x-1.5">
          <span className="material-symbols-outlined text-[18px] text-secondary">insights</span>
          <span className="font-headline-md text-headline-md tracking-tight">时间精算洞察</span>
        </div>
        <p className="font-body-md text-body-md leading-relaxed text-on-secondary-fixed">
          {periodLabel}每工作 <span className="font-metric-sm text-metric-sm font-semibold">1 小时</span>，即有{' '}
          <span className="font-metric-sm text-metric-sm text-secondary font-semibold">
            {(exhaustionRatio / 100 * 60).toFixed(1)} 分钟
          </span>{' '}
          用于支付{categoryStats[0]?.category || '日常'}等开销。你的财务自由度指数为{' '}
          <span className="font-metric-sm text-metric-sm font-semibold">{Math.max(0, freedomRatio).toFixed(1)}%</span>。
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-label-mono text-label-mono text-on-secondary-fixed-variant">时账精算引擎 · 数据已校准</span>
        </div>
      </section>
    </div>
  )
}

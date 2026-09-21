import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { MonthCalendar } from '../components/MonthCalendar'
import { getCategoryIcon } from '../lib/categories'
import { getCurrentMonthKey, getMonthKey, getTodayKey } from '../lib/date'
import { buildRangeReport, groupByDay } from '../lib/earnings'
import { weekStartKey } from '../lib/time-plan'
import {
  getDailyTrend,
  getExpenseCategoryStats,
  getMonthTotals,
  getWeekTotals,
  getYearTotals,
  type PeriodTotals,
} from '../lib/selectors'
import { formatDuration, formatHM, formatMoney, getDailyHours } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

type Period = '周' | '月' | '年'

export function Stats() {
  const { transactions, hourlyWage, expenseCategories, wageSettings, dayOverrides, now: ledgerNow } = useLedger()
  const [period, setPeriod] = useState<Period>('月')

  const weekTotals = useMemo(() => getWeekTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const monthTotals = useMemo(() => getMonthTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const yearTotals = useMemo(() => getYearTotals(transactions, hourlyWage), [transactions, hourlyWage])

  const totalsByPeriod: Record<Period, PeriodTotals> = {
    '周': weekTotals,
    '月': monthTotals,
    '年': yearTotals,
  }
  const totals = totalsByPeriod[period]

  // 周 / 月 / 年的收入和结余：打工收入按工作日累计，和首页同一个口径
  const money = useMemo(() => {
    const today = getTodayKey()
    const y = today.slice(0, 4)
    const startByPeriod: Record<Period, string> = { '周': weekStartKey(), '月': `${today.slice(0, 7)}-01`, '年': `${y}-01-01` }
    return buildRangeReport(startByPeriod[period], today, groupByDay(transactions), {
      settings: wageSettings,
      overrides: dayOverrides,
      hourlyWage,
      now: ledgerNow,
    })
  }, [period, transactions, wageSettings, dayOverrides, hourlyWage, ledgerNow])

  const dailyHours = getDailyHours(wageSettings)

  const PERIOD_LABEL: Record<Period, string> = { '周': '本周', '月': '本月', '年': '本年' }
  const periodLabel = PERIOD_LABEL[period]

  const categoryStats = useMemo(() => {
    const currentMonth = getCurrentMonthKey()
    const thisMonthTxns = transactions.filter((t) => getMonthKey(t.timestamp) === currentMonth)
    return getExpenseCategoryStats(thisMonthTxns, hourlyWage)
  }, [transactions, hourlyWage])
  const totalCategoryAmount = categoryStats.reduce((s, c) => s + c.amount, 0) || 1

  const trend = useMemo(() => getDailyTrend(transactions, hourlyWage, 18), [transactions, hourlyWage])
  const rent = categoryStats.find((c) => c.category === '居住')
  const spentDays = dailyHours > 0 ? totals.expenseHours / dailyHours : 0

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Period switch */}
      <section className="flex items-center justify-between bg-surface-container-low p-1 rounded-xl">
        <div className="grid grid-cols-3 w-full gap-1">
          {(['周', '月', '年'] as Period[]).map((p) => (
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

      {/* 收支：结余最大，收入和支出并排，最下面一条比例条 */}
      <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
        <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">{periodLabel}收支</span>

        <div className="flex flex-col gap-0.5">
          <span className="font-body-sm text-body-sm text-on-surface-variant">{money.netMoney >= 0 ? '结余' : '赤字'}</span>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-metric-lg text-display-lg-mobile tracking-tight ${money.netMoney >= 0 ? 'text-positive' : 'text-secondary'}`}
            >
              {money.netMoney >= 0 ? '+' : '-'}
              {formatMoney(Math.abs(Math.round(money.netMoney)))}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {money.netMoney >= 0 ? '+' : '-'}
              {formatHM(Math.abs(money.netHours))}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">收入</span>
            <span className="font-metric-lg text-headline-md text-positive">{formatMoney(Math.round(money.income))}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">+{formatHM(money.incomeHours)}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">支出</span>
            <span className="font-metric-lg text-headline-md text-secondary">{formatMoney(Math.round(money.expense))}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">-{formatHM(money.expenseHours)}</span>
          </div>
        </div>

        {money.income > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="w-full h-2.5 rounded bg-surface-container-high overflow-hidden flex">
              <div className="h-full bg-secondary transition-all duration-700" style={{ width: `${Math.min(100, (money.expense / money.income) * 100)}%` }} />
              <div className="h-full bg-positive flex-1" />
            </div>
            <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
              <span>
                <span className="inline-block w-2 h-2 rounded-full bg-secondary mr-1.5" />
                支出 {Math.min(100, Math.round((money.expense / money.income) * 100))}%
              </span>
              <span>
                <span className="inline-block w-2 h-2 rounded-full bg-positive mr-1.5" />
                {money.netMoney >= 0 ? `结余 ${Math.round((money.netMoney / money.income) * 100)}%` : '没有结余'}
              </span>
            </div>
          </div>
        )}
      </section>

      <MonthCalendar />

      {/* Trend */}
      <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">每日支出趋势</span>
            <span className="font-label-mono text-label-mono text-on-surface-variant">近 18 天，折合时间</span>
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
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">支出分类</span>
            <span className="font-label-mono text-label-mono text-on-surface-variant">本月各分类占比</span>
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
          <span className="font-headline-md text-headline-md tracking-tight">小结</span>
        </div>
        <p className="font-body-md text-body-md leading-relaxed text-on-secondary-fixed">
          {periodLabel}，你已经用{' '}
          <span className="font-metric-sm text-metric-sm text-secondary font-semibold">{formatDuration(totals.expenseHours)}</span>{' '}
          的工作时间换来了消费，相当于{' '}
          <span className="font-metric-sm text-metric-sm text-secondary font-semibold">{spentDays.toFixed(1)} 个工作日</span>。
        </p>
        {rent && (
          <p className="font-body-md text-body-md leading-relaxed text-on-secondary-fixed">
            本月已经工作{' '}
            <span className="font-metric-sm text-metric-sm text-secondary font-semibold">{formatDuration(rent.hours)}</span>
            ，只为了支付房租。
          </p>
        )}
        {categoryStats.length > 0 && (
          <p className="font-body-md text-body-md leading-relaxed text-on-secondary-fixed">
            本月的工作时间，主要换来了：
            {categoryStats
              .slice(0, 3)
              .map((c) => `${c.category} ${formatHM(c.hours)}`)
              .join('、')}
            。
          </p>
        )}
      </section>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { StatCard } from '../components/StatCard'
import { getCurrentMonthKey, getLastMonthKey, getMonthKey, formatMonthLabel } from '../lib/date'
import { getDailyTrend, getExpenseCategoryStats, getMonthTotals, getMonthOverMonth } from '../lib/selectors'
import { formatDuration, formatMoney, formatPercentChange } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

export function Stats() {
  const { transactions, hourlyWage } = useLedger()
  const [trendMetric, setTrendMetric] = useState<'expense' | 'hours'>('expense')

  const monthTotals = useMemo(() => getMonthTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const mom = useMemo(() => getMonthOverMonth(transactions, hourlyWage), [transactions, hourlyWage])
  const categoryStats = useMemo(() => {
    const currentMonth = getCurrentMonthKey()
    const thisMonthTxns = transactions.filter((t) => getMonthKey(t.timestamp) === currentMonth)
    return getExpenseCategoryStats(thisMonthTxns, hourlyWage)
  }, [transactions, hourlyWage])
  const trend = useMemo(() => getDailyTrend(transactions, hourlyWage, 14), [transactions, hourlyWage])

  const maxCategoryAmount = categoryStats[0]?.amount || 1
  const expenseCompare = formatPercentChange(mom.current.expense, mom.previous.expense)
  const incomeCompare = formatPercentChange(mom.current.income, mom.previous.income)

  return (
    <div className="flex flex-col gap-5">
      {/* 本月概览 */}
      <section className="animate-fade-in-up">
        <h2 className="text-sm font-semibold text-outline mb-2">本月概览</h2>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="总收入" value={formatMoney(monthTotals.income)} valueClassName="text-income" />
          <StatCard label="总支出" value={formatMoney(monthTotals.expense)} valueClassName="text-expense" />
          <StatCard
            label="总结余"
            value={formatMoney(monthTotals.net)}
            valueClassName={monthTotals.net >= 0 ? 'text-income' : 'text-expense'}
          />
          <StatCard label="总消费时间" value={formatDuration(monthTotals.expenseHours)} />
        </div>
      </section>

      {/* 环比 */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <h2 className="text-sm font-semibold text-outline mb-2">环比上月</h2>
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-outline mb-1">支出</div>
            <div className={`text-lg font-bold ${monthTotals.expense >= mom.previous.expense ? 'text-expense' : 'text-income'}`}>
              {expenseCompare}
            </div>
          </div>
          <div>
            <div className="text-xs text-outline mb-1">收入</div>
            <div className={`text-lg font-bold ${monthTotals.income >= mom.previous.income ? 'text-income' : 'text-expense'}`}>
              {incomeCompare}
            </div>
          </div>
        </div>
      </section>

      {/* 分类统计 */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-sm font-semibold text-outline mb-2">分类统计（本月支出）</h2>
        {categoryStats.length === 0 ? (
          <div className="text-center py-8 text-outline/60 bg-surface-container-lowest rounded-2xl">
            <p className="text-sm">本月还没有支出记录</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col gap-3">
            {categoryStats.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-primary">{c.category}</span>
                  <span className="text-sm text-on-surface-variant">
                    {formatMoney(c.amount)} <span className="text-outline">≈ {formatDuration(c.hours)}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-dim rounded-full"
                    style={{ width: `${Math.max(4, (c.amount / maxCategoryAmount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 趋势 */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-outline">近14天趋势</h2>
          <div className="flex bg-surface-container-low rounded-lg p-0.5">
            <button
              onClick={() => setTrendMetric('expense')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                trendMetric === 'expense' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              支出
            </button>
            <button
              onClick={() => setTrendMetric('hours')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                trendMetric === 'hours' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              消费时间
            </button>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)]" style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#77767b' }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <Tooltip
                formatter={(value) =>
                  trendMetric === 'expense' ? formatMoney(Number(value)) : formatDuration(Number(value))
                }
                labelStyle={{ color: '#1a1c1d', fontSize: 12 }}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 }}
              />
              <Bar
                dataKey={trendMetric === 'expense' ? 'expense' : 'expenseHours'}
                fill="#4edea3"
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="text-xs text-outline/50 text-center">
        本月 {formatMonthLabel(getCurrentMonthKey())} · 上月 {formatMonthLabel(getLastMonthKey())}
      </p>
    </div>
  )
}

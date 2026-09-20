import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TransactionList } from '../components/TransactionList'
import { formatFullDate, getTodayKey } from '../lib/date'
import { filterByDay, getMonthTotals, getTodayTotals } from '../lib/selectors'
import { amountToHours, formatHM, formatMoney, getDailyHours } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

export function Home() {
  const { transactions, hourlyWage, wageSettings } = useLedger()

  const todayTotals = useMemo(() => getTodayTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const monthTotals = useMemo(() => getMonthTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const todayTxns = useMemo(
    () => filterByDay(transactions, getTodayKey()).sort((a, b) => b.timestamp - a.timestamp),
    [transactions]
  )

  const workHoursPerDay = getDailyHours(wageSettings) || 8
  const ratio = Math.min(100, (todayTotals.expenseHours / workHoursPerDay) * 100)
  const incomeHours = amountToHours(todayTotals.income, hourlyWage)
  const netSpend = todayTotals.expense - todayTotals.income
  const netSpendHours = amountToHours(Math.abs(netSpend), hourlyWage)
  const monthWorkDays = monthTotals.expenseHours / workHoursPerDay
  const heroTotalMinutes = Math.round(todayTotals.expenseHours * 60)
  const heroH = Math.floor(heroTotalMinutes / 60)
  const heroM = heroTotalMinutes % 60

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Greeting & Chrono Meta */}
      <section className="flex flex-col pt-space-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
            CHRONO DIAL · LIVE
          </span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5 tracking-tight">
          {formatFullDate(Date.now())}
        </h2>
      </section>

      {/* Hero Time-Cost Ledger Module */}
      <section className="relative overflow-hidden rounded-xl bg-primary-container text-on-primary p-space-lg shadow-sm">
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 rounded-full bg-primary-fixed-dim/5 blur-xl pointer-events-none" />
        <div className="relative flex flex-col gap-space-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">timelapse</span>
            <span className="font-label-md text-label-md text-on-primary-container tracking-wider uppercase">
              今日生命工时扣除
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-metric-lg text-display-lg-mobile font-semibold tracking-tight text-secondary-fixed">
                {heroH}
                <span className="font-body-md text-headline-md text-on-primary-container ml-0.5 mr-1.5">h</span>
                {heroM}
                <span className="font-body-md text-headline-md text-on-primary-container ml-0.5">m</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-on-primary-container">
              <span className="font-body-sm text-body-sm">等值支出货币</span>
              <span className="font-metric-md text-metric-md font-medium text-on-primary">
                {formatMoney(todayTotals.expense)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-space-xs">
            <div className="flex justify-between items-center gap-2 font-label-mono text-label-mono text-on-primary-container">
              <span className="shrink-0 whitespace-nowrap">08:00 开工</span>
              <span className="text-secondary-fixed text-center">
                支出工时占工作日 ({workHoursPerDay}h) 之 {ratio.toFixed(1)}%
              </span>
              <span className="shrink-0 whitespace-nowrap">24:00 刻度</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-highest/20 overflow-hidden flex gap-0.5 p-0.5">
              <div
                className="h-full rounded-full bg-surface-variant/40"
                style={{ width: `${Math.max(0, 33.3 - ratio * 0.333)}%` }}
                title={`法定工作基准 ${workHoursPerDay} 小时`}
              />
              <div
                className="h-full rounded-full bg-secondary animate-pulse"
                style={{ width: `${ratio * 0.333}%` }}
                title={`今日已消费转化工时 ${formatHM(todayTotals.expenseHours)}`}
              />
              <div className="h-full rounded-full bg-transparent flex-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-space-sm border-t border-surface-container-highest/10">
            <div className="flex flex-col">
              <span className="font-label-mono text-label-mono text-on-primary-container">今日记账收入</span>
              <span className="font-metric-sm text-metric-sm text-on-primary mt-0.5">
                {formatMoney(todayTotals.income)}
              </span>
              <span className="font-label-mono text-label-mono text-on-primary-container/80">
                {formatHM(incomeHours)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-mono text-label-mono text-on-primary-container">
                {netSpend >= 0 ? '今日净支出' : '今日净结余'}
              </span>
              <span className="font-metric-sm text-metric-sm text-on-primary mt-0.5">
                {netSpend >= 0 ? '-' : '+'}
                {formatMoney(Math.abs(netSpend))}
              </span>
              <span className="font-label-mono text-label-mono text-secondary-fixed">
                {formatHM(netSpendHours)} 换算
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-mono text-label-mono text-on-primary-container">本月累计时长</span>
              <span className="font-metric-sm text-metric-sm text-secondary-fixed mt-0.5">
                {formatHM(monthTotals.expenseHours)}
              </span>
              <span className="font-label-mono text-label-mono text-on-primary-container/80">
                约 {monthWorkDays.toFixed(1)} 个工日
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Ledger Header Bar */}
      <section className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="font-headline-md text-headline-md text-on-surface">今日账单</h3>
          <span className="font-label-mono text-label-mono text-on-surface-variant">{todayTxns.length} 笔交易</span>
        </div>
        <Link to="/bills" className="p-1 rounded text-outline hover:text-on-surface transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
        </Link>
      </section>

      {/* Ledger Transaction List */}
      {todayTxns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-space-lg text-outline gap-1.5 bg-surface-container-lowest rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[28px]">hourglass_empty</span>
          <span className="font-body-sm text-body-sm">今天还没有记录，点击下方 + 记一笔</span>
        </div>
      ) : (
        <TransactionList transactions={todayTxns} />
      )}

      {/* Philosophical / Temporal Reality Prompt Card */}
      <section className="rounded-xl bg-surface-container-low p-space-md flex items-start gap-3 shadow-sm">
        <div className="w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[16px]">psychology</span>
        </div>
        <div className="flex flex-col">
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            每笔消费都在换算你的人生工时，每一刻选择，皆在重构生命资产。
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="material-symbols-outlined text-outline text-[13px]">verified</span>
            <span className="font-label-mono text-label-mono text-outline">时账法则：节制即自由</span>
          </div>
        </div>
      </section>

      {wageSettings.monthlyIncome === 0 && (
        <p className="font-body-sm text-body-sm text-outline text-center">先在「设置」里配置月收入，才能算出时薪</p>
      )}
    </div>
  )
}

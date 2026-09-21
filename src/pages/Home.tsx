import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MyTimeCard } from '../components/MyTimeCard'
import { TickerNumber } from '../components/TickerNumber'
import { TransactionList } from '../components/TransactionList'
import { formatFullDate, getTodayKey } from '../lib/date'
import { buildDayReport } from '../lib/earnings'
import { filterByDay, getTodayTotals } from '../lib/selectors'
import { amountToHours, formatDuration, formatHM, formatMoney, getDailyHours, getDayBreakdown } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

function settingsDaily(s: { monthlyIncome: number; workDays: number }) {
  return s.workDays > 0 ? s.monthlyIncome / s.workDays : 0
}

// 底部小卡片：每天换一句，按日期轮流
const SLOGANS = [
  '你花掉的每一块钱，背后都是一段工作时间。',
  '钱花掉了，时间也花掉了。',
  '你买下的每一样东西，都有它的时间价格。',
  '今天花掉的钱，是昨天换来的时间。',
  '看看钱的另一种单位：时间。',
  '别只看价格，看看它需要你工作多久。',
]

export function Home() {
  const { transactions, hourlyWage, wageSettings, dayOverrides } = useLedger()
  // 每秒走一次，今日收入跟着时间一点点涨
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const todayTotals = useMemo(() => getTodayTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const todayTxns = useMemo(
    () => filterByDay(transactions, getTodayKey()).sort((a, b) => b.timestamp - a.timestamp),
    [transactions]
  )

  const workHoursPerDay = getDailyHours(wageSettings) || 8
  const ratio = (todayTotals.expenseHours / workHoursPerDay) * 100
  const todayReport = buildDayReport(getTodayKey(), todayTxns, {
    settings: wageSettings,
    overrides: dayOverrides,
    hourlyWage,
    now,
  })
  const incomeTotal = todayReport.workIncome + todayReport.extraIncome
  const incomeHours = amountToHours(incomeTotal, hourlyWage)
  const dayParts = getDayBreakdown(wageSettings)
  const freeToday = todayReport.isWorkday ? dayParts.free : 24 - dayParts.sleep - dayParts.meals
  const expenseTotal = todayReport.expense
  const net = incomeTotal - expenseTotal
  const netHours = amountToHours(Math.abs(net), hourlyWage)
  // 打工收入还在累计时显示到分，才看得到数字在涨
  const accruing = todayReport.isWorkday && todayReport.workIncome > 0 && todayReport.workIncome < settingsDaily(wageSettings)
  const fmt = (v: number) => (accruing ? `¥${v.toFixed(2)}` : formatMoney(Math.round(v)))
  const heroTotalMinutes = Math.round(todayTotals.expenseHours * 60)
  const heroH = Math.floor(heroTotalMinutes / 60)
  const heroM = heroTotalMinutes % 60
  const slogan = SLOGANS[Math.floor(now / 86400000) % SLOGANS.length]

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Greeting & Chrono Meta */}
      <section className="flex flex-col pt-space-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
            今天
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
              今天花掉的时间
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
              <span className="font-body-sm text-body-sm text-on-primary-container ml-1">
                ≈ {(ratio / 100).toFixed(ratio < 100 ? 2 : 1)} 天
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-on-primary-container">
              <span className="font-body-sm text-body-sm">对应支出</span>
              <span className="font-metric-md text-metric-md font-medium text-on-primary">
                {formatMoney(todayTotals.expense)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-space-xs">
            <span className="font-label-mono text-label-mono text-secondary-fixed">
              相当于一个工作日（{workHoursPerDay}h）的 {ratio.toFixed(1)}%
            </span>
            <div className="w-full h-2 rounded-full bg-surface-container-highest/20 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${Math.min(100, ratio)}%` }}
                title={`今天花掉 ${formatHM(todayTotals.expenseHours)}`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-space-sm border-t border-surface-container-highest/10">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-secondary-fixed-dim ${accruing ? 'live-dot' : 'opacity-40'}`} />
              <span className="font-label-mono text-label-mono text-on-primary-container">
                {accruing ? '今日收入 · 正在赚' : '今日收入'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <TickerNumber
                value={fmt(incomeTotal)}
                className="font-metric-lg text-display-lg-mobile font-semibold tracking-tight text-secondary-fixed"
              />
              <span className="font-label-mono text-label-mono text-on-primary-container/80 shrink-0">
                +{formatHM(incomeHours)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col">
              <span className="font-label-mono text-label-mono text-on-primary-container">今日支出</span>
              <span className="font-metric-sm text-metric-sm text-on-primary mt-0.5">{formatMoney(expenseTotal)}</span>
              <span className="font-label-mono text-label-mono text-on-primary-container/80">-{formatHM(todayTotals.expenseHours)}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-mono text-label-mono text-on-primary-container">{net >= 0 ? '今日结余' : '今日赤字'}</span>
              <span className="font-metric-sm text-metric-sm text-secondary-fixed mt-0.5">
                {net >= 0 ? '+' : '-'}
                {fmt(Math.abs(net))}
              </span>
              <span className="font-label-mono text-label-mono text-secondary-fixed">
                {net >= 0 ? '+' : '-'}
                {formatHM(netHours)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-mono text-label-mono text-on-primary-container">我的时间</span>
              <span className="font-metric-sm text-metric-sm text-on-primary mt-0.5">{formatHM(Math.max(0, freeToday))}</span>
              <span className="font-label-mono text-label-mono text-on-primary-container/80">
                {todayReport.isWorkday ? '工作日' : '休息日'} · 占 {Math.round((Math.max(0, freeToday) / 24) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      <MyTimeCard />

      {/* Ledger Header Bar */}
      <section className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="font-headline-md text-headline-md text-on-surface">今日账单</h3>
          <span className="font-label-mono text-label-mono text-on-surface-variant">{todayTxns.length} 笔</span>
        </div>
        <Link to="/bills" className="p-1 rounded text-outline hover:text-on-surface transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
        </Link>
      </section>

      {todayTxns.length > 0 && todayTotals.expenseHours > 0 && (
        <p className="font-body-sm text-body-sm text-on-surface-variant -mt-space-sm">
          今天，你用{' '}
          <span className="font-metric-sm text-metric-sm text-secondary font-medium">{formatDuration(todayTotals.expenseHours)}</span>{' '}
          的工作时间，换来了这些东西。
        </p>
      )}

      {/* Ledger Transaction List */}
      {todayTxns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-space-lg text-outline gap-1.5 bg-surface-container-lowest rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[28px]">hourglass_empty</span>
          <span className="font-body-sm text-body-sm">今天还没记账，点下面的 + 记一笔</span>
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
            {slogan}
          </p>
        </div>
      </section>

      {wageSettings.monthlyIncome === 0 && (
        <p className="font-body-sm text-body-sm text-outline text-center">先去「设置」填一下月收入，才能算出时薪</p>
      )}
    </div>
  )
}

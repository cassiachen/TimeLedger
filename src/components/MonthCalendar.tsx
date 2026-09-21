import { useEffect, useMemo, useState } from 'react'
import { buildMonthReport, defaultIsWorkday, groupByDay, parseDayKey, workFraction } from '../lib/earnings'
import { getTodayKey } from '../lib/date'
import { formatHM, formatMoney } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'
import { TransactionList } from './TransactionList'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function shortHours(h: number): string {
  const v = Math.abs(h) < 0.05 ? 0 : h
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}`
}

export function MonthCalendar() {
  const { transactions, wageSettings, dayOverrides, hourlyWage, setDayStatus } = useLedger()
  // 每秒走一次，今天的打工收入跟着时间一点点涨
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const today = new Date()
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState<string>(getTodayKey())

  const byDay = useMemo(() => groupByDay(transactions), [transactions])
  const report = useMemo(
    () => buildMonthReport(view.y, view.m, byDay, { settings: wageSettings, overrides: dayOverrides, hourlyWage, now }),
    [view, byDay, wageSettings, dayOverrides, hourlyWage, now]
  )

  const todayKey = getTodayKey()
  const isCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth()
  const leading = new Date(view.y, view.m, 1).getDay()
  const selectedReport = report.days.find((d) => d.dayKey === selected)
  const frac = workFraction(now, wageSettings)
  const todayAccruing = !!report.days.find((d) => d.dayKey === todayKey)?.isWorkday && frac > 0 && frac < 1
  const fmtWork = (v: number, live: boolean) => (live ? `¥${v.toFixed(2)}` : formatMoney(Math.round(v)))

  function shiftMonth(delta: number) {
    const d = new Date(view.y, view.m + delta, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
    setSelected('')
  }

  function toggleWorkday(dayKey: string, currentlyWork: boolean) {
    const desired = currentlyWork ? 'off' : 'work'
    const isDefault = (desired === 'work') === defaultIsWorkday(dayKey)
    setDayStatus(dayKey, isDefault ? null : desired)
  }

  return (
    <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md text-on-surface tracking-tight">时间日历</span>
          <span className="font-label-mono text-label-mono text-on-surface-variant">每格 = 当天赚到的 − 花掉的（小时）</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => shiftMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container" aria-label="上个月">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="font-metric-sm text-metric-sm text-on-surface w-20 text-center">
            {view.y}年{view.m + 1}月
          </span>
          <button
            onClick={() => shiftMonth(1)}
            disabled={isCurrentMonth}
            className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
            aria-label="下个月"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-lg">
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-on-surface-variant">打工收入</span>
          <span className="font-metric-sm text-metric-sm text-on-surface font-medium truncate">{fmtWork(report.workIncome, isCurrentMonth && todayAccruing)}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-on-surface-variant">消费</span>
          <span className="font-metric-sm text-metric-sm text-secondary font-medium truncate">{formatMoney(Math.round(report.expense))}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-on-surface-variant">{report.netMoney >= 0 ? '本月结余' : '本月赤字'}</span>
          <span className={`font-metric-sm text-metric-sm font-medium truncate ${report.netMoney >= 0 ? 'text-on-surface' : 'text-secondary'}`}>
            {shortHours(report.netHours)}h
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-center font-label-mono text-label-mono text-outline py-1">
            {w}
          </span>
        ))}
        {Array.from({ length: leading }).map((_, i) => (
          <span key={`b${i}`} />
        ))}
        {report.days.map((d) => {
          const dayNum = Number(d.dayKey.slice(-2))
          const deficit = !d.isFuture && d.netMoney < 0
          const isSelected = selected === d.dayKey
          return (
            <button
              key={d.dayKey}
              onClick={() => setSelected(d.dayKey)}
              className={`h-12 rounded flex flex-col items-center justify-center gap-0.5 transition-colors ${
                deficit
                  ? 'bg-secondary-fixed text-on-secondary-fixed'
                  : d.isWorkday || d.isFuture
                    ? 'bg-surface-container-low text-on-surface'
                    : 'bg-surface-container text-outline'
              } ${isSelected ? 'ring-2 ring-primary' : ''} ${d.dayKey === todayKey ? 'font-bold' : ''}`}
            >
              <span className="font-metric-sm text-metric-sm leading-none">{dayNum}</span>
              <span className="font-label-mono text-[10px] leading-none opacity-80">
                {d.isFuture || (!d.isWorkday && d.netMoney === 0) ? '·' : shortHours(d.netHours)}
              </span>
            </button>
          )
        })}
      </div>

      {selectedReport && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface">
                {parseDayKey(selectedReport.dayKey).getMonth() + 1}月{parseDayKey(selectedReport.dayKey).getDate()}日
              </span>
              <span className="font-label-md text-label-md text-outline">{selectedReport.isWorkday ? '工作日' : '休息日'}</span>
            </div>
            <button
              onClick={() => toggleWorkday(selectedReport.dayKey, selectedReport.isWorkday)}
              className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high"
            >
              设为{selectedReport.isWorkday ? '休息日' : '工作日'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-metric-sm text-metric-sm">
            <span className="text-on-surface-variant">
              打工所得 <span className="text-on-surface">{selectedReport.isFuture ? '—' : `+${fmtWork(selectedReport.workIncome, selectedReport.dayKey === todayKey && todayAccruing)}`}</span>
            </span>
            <span className="text-on-surface-variant">
              其他收入 <span className="text-on-surface">+{formatMoney(selectedReport.extraIncome)}</span>
            </span>
            <span className="text-on-surface-variant">
              消费 <span className="text-secondary">-{formatMoney(selectedReport.expense)}</span>
            </span>
            <span className="text-on-surface-variant">
              {selectedReport.netMoney >= 0 ? '结余' : '赤字'}{' '}
              <span className={selectedReport.netMoney >= 0 ? 'text-on-surface' : 'text-secondary'}>
                {selectedReport.netMoney >= 0 ? '+' : '-'}
                {formatHM(Math.abs(selectedReport.netHours))}
              </span>
            </span>
          </div>
          {selectedReport.txns.length > 0 && (
            <div className="-mx-space-md">
              <TransactionList transactions={[...selectedReport.txns].sort((a, b) => b.timestamp - a.timestamp)} />
            </div>
          )}
        </div>
      )}

      <p className="font-body-sm text-body-sm text-outline">
        打工所得 = 月收入 ÷ 每月工作天数，按工作日逐天累计（默认周一到周五，点某一天可以改）。记成「工资」的收入是同一笔钱，不重复算。
      </p>
    </section>
  )
}

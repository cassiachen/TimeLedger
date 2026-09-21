import { useMemo, useState } from 'react'
import { FilterSheet } from '../components/FilterSheet'
import { TransactionList } from '../components/TransactionList'
import { formatDayGroupHeader, getCurrentMonthKey, getDayKey } from '../lib/date'
import { buildDayReport, buildMonthReport, groupByDay } from '../lib/earnings'
import { applyFilters, countActiveFilters, EMPTY_FILTERS, type BillFilters } from '../lib/filters'
import { amountToHours, formatHM, formatMoney } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

export function Bills() {
  const { transactions, expenseCategories, incomeCategories, hourlyWage, wageSettings, dayOverrides, now } = useLedger()
  const [filters, setFilters] = useState<BillFilters>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortByCost, setSortByCost] = useState(false)

  const filtered = useMemo(() => {
    const withSearch = applyFilters(transactions, filters)
    return [...withSearch].sort((a, b) =>
      sortByCost ? Math.abs(b.amount) - Math.abs(a.amount) : b.timestamp - a.timestamp
    )
  }, [transactions, filters, sortByCost])

  const earningsCtx = useMemo(
    () => ({ settings: wageSettings, overrides: dayOverrides, hourlyWage, now }),
    [wageSettings, dayOverrides, hourlyWage, now]
  )
  const allByDay = useMemo(() => groupByDay(transactions), [transactions])

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const t of filtered) {
      const key = getDayKey(t.timestamp)
      const arr = map.get(key) || []
      arr.push(t)
      map.set(key, arr)
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([dayKey, txns]) => ({
        dayKey,
        // txns 已经在 `filtered` 里按当前排序模式排好了，这里保持原样，不要再按时间重排一遍
        txns,
        // 日汇总永远按当天全部账目 + 当天打工所得计算，不受筛选影响
        report: buildDayReport(dayKey, allByDay.get(dayKey) || [], earningsCtx),
      }))
  }, [filtered, allByDay, earningsCtx])

  const month = useMemo(() => {
    const now = new Date()
    return buildMonthReport(now.getFullYear(), now.getMonth(), allByDay, earningsCtx)
  }, [allByDay, earningsCtx])
  const monthExpense = month.expense
  const monthIncome = month.workIncome + month.extraIncome
  const monthExpenseHours = amountToHours(monthExpense, hourlyWage)
  const monthIncomeHours = amountToHours(monthIncome, hourlyWage)
  const netHours = monthIncomeHours - monthExpenseHours
  const totalHoursForRatio = monthExpenseHours + monthIncomeHours || 1
  const expenseRatio = (monthExpenseHours / totalHoursForRatio) * 100

  const activeFilterCount = countActiveFilters(filters)
  const typeLabel =
    filters.type === 'all' ? '全部收支' : filters.type === 'expense' ? '支出' : filters.type === 'income' ? '收入' : '转账'
  const categoryLabel = filters.category === 'all' ? '全部分类' : filters.category
  const accountLabel = filters.account === 'all' ? '全部账户' : filters.account

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* Top Sticky Filter Bar */}
      <section className="flex flex-col gap-space-sm -mx-margin px-margin pt-space-xs pb-space-sm bg-surface sticky top-16 z-30 shadow-sm">
        <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-2 rounded-xl">
          <span className="material-symbols-outlined text-outline text-[20px] shrink-0">search</span>
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="搜索账单、商户、分类..."
            className="bg-transparent w-full font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none min-w-0"
          />
          <button className="text-outline hover:text-on-surface flex items-center justify-center p-0.5" onClick={() => setFilterOpen(true)}>
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>

        <div className="flex items-center gap-space-xs overflow-x-auto py-0.5">
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary text-on-primary font-label-md text-label-md shrink-0 transition-transform active:scale-95"
          >
            <span>{getCurrentMonthKey()}</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-label-md text-label-md shrink-0 hover:bg-surface-variant transition-colors"
          >
            <span>{typeLabel}</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-label-md text-label-md shrink-0 hover:bg-surface-variant transition-colors"
          >
            <span>{categoryLabel}</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-label-md text-label-md shrink-0 hover:bg-surface-variant transition-colors"
          >
            <span>{accountLabel}</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
          <button
            onClick={() => setSortByCost((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-label-md text-label-md shrink-0 font-medium transition-colors ${
              sortByCost ? 'bg-secondary text-on-secondary' : 'bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]" style={{ color: sortByCost ? undefined : '#9b4500' }}>
              swap_vert
            </span>
            <span>按金额排序</span>
          </button>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-on-secondary font-label-mono text-label-mono shrink-0">
              {activeFilterCount}
            </span>
          )}
        </div>

        {/* Monthly Ledger Summary */}
        <div className="flex flex-col gap-1.5 p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span className="font-label-mono text-label-mono text-outline uppercase tracking-wider">本月收支（折合时间）</span>
            </div>
            <span className={`font-label-mono text-label-mono font-medium ${netHours >= 0 ? 'text-positive' : 'text-secondary'}`}>
              {netHours >= 0 ? '本月结余 +' : '本月赤字 -'}
              {formatMoney(Math.abs(Math.round(monthIncome - monthExpense)))}
            </span>
          </div>
          <div className="flex flex-wrap gap-y-1 items-baseline justify-between text-on-surface">
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="font-label-md text-label-md text-outline">支出</span>
              <span className="font-metric-md text-metric-md text-secondary font-semibold">{formatMoney(Math.round(monthExpense))}</span>
              <span className="font-metric-sm text-metric-sm text-outline">-{formatHM(monthExpenseHours)}</span>
            </div>
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="font-label-md text-label-md text-outline">收入（含打工）</span>
              <span className="font-metric-md text-metric-md text-positive font-semibold">+{formatMoney(Math.round(monthIncome))}</span>
              <span className="font-metric-sm text-metric-sm text-outline">+{formatHM(monthIncomeHours)}</span>
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden flex mt-0.5">
            <div className="h-full bg-secondary" style={{ width: `${expenseRatio}%` }} />
            <div className="h-full bg-surface-container-highest flex-1" />
          </div>
        </div>
      </section>

      {/* Date-grouped ledger */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-space-lg text-outline gap-1.5 bg-surface-container-lowest rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[28px]">search_off</span>
          <span className="font-body-sm text-body-sm">没有符合条件的账单</span>
        </div>
      ) : (
        <div className="flex flex-col gap-space-lg">
          {groups.map((g) => {
            const net = g.report.netMoney
            const isSurplus = net >= 0
            const netHoursForDay = Math.abs(g.report.netHours)
            const { dateLabel, tag } = formatDayGroupHeader(g.txns[0].timestamp)
            return (
              <div key={g.dayKey} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline-md text-headline-md text-on-surface">{dateLabel}</span>
                    <span className="font-label-md text-label-md text-outline">{tag}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-label-md text-label-md text-outline">{isSurplus ? '结余' : '赤字'}</span>
                    <span className={`font-metric-md text-metric-md font-medium ${isSurplus ? 'text-positive' : 'text-secondary'}`}>
                      {isSurplus ? '+' : '-'}
                      {formatMoney(Math.abs(Math.round(net)))}
                    </span>
                    <span className="font-metric-sm text-metric-sm text-outline">
                      {isSurplus ? '+' : '-'}
                      {formatHM(netHoursForDay)}
                    </span>
                  </div>
                </div>
                <TransactionList transactions={g.txns} />
              </div>
            )
          })}
          <div className="flex flex-col items-center justify-center py-space-lg text-outline gap-1.5 opacity-80">
            <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
            <span className="font-label-mono text-label-mono tracking-widest uppercase">
              共 {filtered.length} 笔
            </span>
          </div>
        </div>
      )}

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
      />
    </div>
  )
}

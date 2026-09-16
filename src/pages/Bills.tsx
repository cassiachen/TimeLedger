import { useMemo, useState } from 'react'
import { FilterSheet } from '../components/FilterSheet'
import { TransactionRow } from '../components/TransactionRow'
import { formatDateHeader, getDayKey } from '../lib/date'
import { applyFilters, countActiveFilters, EMPTY_FILTERS, type BillFilters } from '../lib/filters'
import { formatMoney } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

export function Bills() {
  const { transactions, expenseCategories, incomeCategories } = useLedger()
  const [filters, setFilters] = useState<BillFilters>(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    const withSearch = applyFilters(transactions, filters)
    return [...withSearch].sort((a, b) => b.timestamp - a.timestamp)
  }, [transactions, filters])

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const t of filtered) {
      const key = getDayKey(t.timestamp)
      const arr = map.get(key) || []
      arr.push(t)
      map.set(key, arr)
    }
    return [...map.entries()].map(([dayKey, txns]) => {
      const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { dayKey, txns, income, expense }
    })
  }, [filtered])

  const activeFilterCount = countActiveFilters(filters)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 animate-fade-in-up">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="搜索商户 / 分类 / 备注"
            className="w-full bg-surface-container-low rounded-xl pl-9 pr-3 py-2.5 text-sm text-primary outline-none placeholder:text-outline-variant"
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className="relative w-10 h-10 flex items-center justify-center bg-surface-container-low rounded-xl text-on-surface-variant flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-outline/60 bg-surface-container-lowest rounded-2xl animate-fade-in-up">
          <span className="material-symbols-outlined text-[40px] block mx-auto mb-2 text-accent-dim">search_off</span>
          <p className="text-sm">没有符合条件的账单</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          {groups.map((g) => (
            <div key={g.dayKey}>
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-semibold text-outline">
                  {formatDateHeader(g.txns[0].timestamp)}
                </span>
                <span className="text-xs text-outline/60">
                  {g.income > 0 && <span className="text-income">+{formatMoney(g.income)} </span>}
                  {g.expense > 0 && <span className="text-expense">-{formatMoney(g.expense)}</span>}
                </span>
              </div>
              <div className="flex flex-col gap-1 bg-surface-container-lowest rounded-2xl p-1.5">
                {g.txns.map((t) => (
                  <TransactionRow key={t.id} txn={t} />
                ))}
              </div>
            </div>
          ))}
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

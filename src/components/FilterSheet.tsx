import { useEffect, useState } from 'react'
import { ACCOUNTS } from '../lib/categories'
import { EMPTY_FILTERS, type BillFilters } from '../lib/filters'
import type { Category, TransactionType } from '../lib/types'

const TYPE_OPTIONS: { key: BillFilters['type']; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'expense', label: '支出' },
  { key: 'income', label: '收入' },
  { key: 'transfer', label: '转账' },
]

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  filters: BillFilters
  onApply: (f: BillFilters) => void
  expenseCategories: Category[]
  incomeCategories: Category[]
}

export function FilterSheet({ open, onClose, filters, onApply, expenseCategories, incomeCategories }: FilterSheetProps) {
  const [draft, setDraft] = useState<BillFilters>(filters)

  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  if (!open) return null

  const categoryOptions: Category[] =
    draft.type === 'income' ? incomeCategories : draft.type === 'expense' ? expenseCategories : [
      ...expenseCategories,
      ...incomeCategories.filter((c) => !expenseCategories.some((e) => e.key === c.key)),
    ]

  function setType(type: TransactionType | 'all') {
    setDraft((d) => ({ ...d, type, category: 'all' }))
  }

  return (
    <div className="sheet-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-content max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary">筛选</h3>
          <button className="text-outline/60 hover:text-outline p-1" onClick={onClose} aria-label="关闭">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mb-4">
          <label className="text-xs text-on-surface-variant block mb-2">类型</label>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setType(opt.key)}
                className={`flex-1 h-9 rounded-lg text-sm transition-colors ${
                  draft.type === opt.key ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {draft.type !== 'transfer' && (
          <div className="mb-4">
            <label className="text-xs text-on-surface-variant block mb-2">分类</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setDraft((d) => ({ ...d, category: 'all' }))}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm ${
                  draft.category === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                全部
              </button>
              {categoryOptions.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setDraft((d) => ({ ...d, category: c.key }))}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                    draft.category === c.key ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{c.icon}</span>
                  {c.key}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs text-on-surface-variant block mb-2">账户</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setDraft((d) => ({ ...d, account: 'all' }))}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm ${
                draft.account === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              全部
            </button>
            {ACCOUNTS.map((a) => (
              <button
                key={a.key}
                onClick={() => setDraft((d) => ({ ...d, account: a.key }))}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                  draft.account === a.key ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{a.icon}</span>
                {a.key}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-on-surface-variant block mb-1">开始日期</label>
            <input
              type="date"
              value={draft.dateFrom}
              onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))}
              className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-sm text-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-on-surface-variant block mb-1">结束日期</label>
            <input
              type="date"
              value={draft.dateTo}
              onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))}
              className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-sm text-primary outline-none"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-on-surface-variant block mb-1">最小金额</label>
            <input
              type="number"
              inputMode="decimal"
              value={draft.amountMin}
              onChange={(e) => setDraft((d) => ({ ...d, amountMin: e.target.value }))}
              placeholder="不限"
              className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-sm text-primary outline-none placeholder:text-outline-variant"
            />
          </div>
          <div>
            <label className="text-xs text-on-surface-variant block mb-1">最大金额</label>
            <input
              type="number"
              inputMode="decimal"
              value={draft.amountMax}
              onChange={(e) => setDraft((d) => ({ ...d, amountMax: e.target.value }))}
              placeholder="不限"
              className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-sm text-primary outline-none placeholder:text-outline-variant"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setDraft(EMPTY_FILTERS)
              onApply(EMPTY_FILTERS)
              onClose()
            }}
            className="h-12 px-4 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-medium active:scale-[0.98] transition-transform"
          >
            重置
          </button>
          <button
            onClick={() => {
              onApply(draft)
              onClose()
            }}
            className="flex-1 h-12 bg-primary text-on-primary rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform"
          >
            应用筛选
          </button>
        </div>
      </div>
    </div>
  )
}

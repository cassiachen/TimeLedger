import { getCategoryIcon } from '../lib/categories'
import { formatTime } from '../lib/date'
import { amountToHours, formatDurationShort, formatMoney } from '../lib/time-value'
import type { Transaction } from '../lib/types'
import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'

export function TransactionRow({ txn }: { txn: Transaction }) {
  const { expenseCategories, incomeCategories, hourlyWage } = useLedger()
  const { openEditModal } = useUI()

  const isExpense = txn.type === 'expense'
  const isIncome = txn.type === 'income'
  const isTransfer = txn.type === 'transfer'

  const icon = isTransfer
    ? 'swap_horiz'
    : getCategoryIcon(isExpense ? expenseCategories : incomeCategories, txn.category)

  const title = txn.merchant || txn.category || (isTransfer ? '转账' : '记录')
  const metaParts = [formatTime(txn.timestamp), isTransfer ? `${txn.account} → ${txn.toAccount}` : txn.account].filter(
    Boolean
  )

  const hours = amountToHours(txn.amount, hourlyWage)
  const prominent = hours >= 1

  return (
    <button
      onClick={() => openEditModal(txn)}
      className="group w-full flex items-center justify-between p-space-md hover:bg-surface-container-low transition-colors text-left"
    >
      <div className="flex items-center gap-space-md min-w-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isIncome ? 'bg-primary-fixed text-primary-container' : 'bg-surface-container text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-body-md text-body-md text-on-surface truncate ${isIncome ? 'font-semibold' : 'font-medium'}`}>
              {title}
            </span>
            {!isTransfer && txn.category && (
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-label-mono shrink-0">
                {txn.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 font-label-mono text-label-mono text-outline truncate">
            {metaParts.map((p, i) => (
              <span key={i} className="truncate">
                {i > 0 ? '· ' : ''}
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 pl-2">
        {isExpense && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-metric-sm text-metric-sm font-semibold ${
              prominent ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">{prominent ? 'hourglass_bottom' : 'schedule'}</span>
            <span>-{formatDurationShort(hours)}</span>
          </div>
        )}
        {isIncome && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-metric-sm text-metric-sm font-semibold">
            <span className="material-symbols-outlined text-[13px] text-outline">history_toggle_off</span>
            <span>+{formatDurationShort(hours)}</span>
          </div>
        )}
        <span
          className={`font-metric-sm text-metric-sm mt-1 ${
            isIncome ? 'text-on-surface font-medium' : 'text-on-surface-variant'
          }`}
        >
          {isIncome ? '+' : isExpense ? '' : ''}
          {formatMoney(txn.amount)}
        </span>
      </div>
    </button>
  )
}

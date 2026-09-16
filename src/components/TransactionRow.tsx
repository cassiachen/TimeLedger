import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'
import { getCategoryIcon } from '../lib/categories'
import { formatTime } from '../lib/date'
import { amountToHours, formatDurationShort, formatMoney } from '../lib/time-value'
import type { Transaction } from '../lib/types'

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
  const subtitleParts = [
    !isTransfer && txn.category ? txn.category : null,
    isTransfer ? `${txn.account} → ${txn.toAccount}` : txn.account,
    txn.note,
  ].filter(Boolean)

  const amountColor = isIncome ? 'text-income' : isTransfer ? 'text-on-surface-variant' : 'text-primary'
  const amountPrefix = isIncome ? '+' : isTransfer ? '' : '-'

  return (
    <button
      onClick={() => openEditModal(txn)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-left"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-lg w-6 text-center flex-shrink-0">
          {isTransfer ? (
            <span className="material-symbols-outlined text-[20px] text-outline align-middle">{icon}</span>
          ) : (
            icon
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] text-primary truncate">{title}</div>
          {subtitleParts.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-outline truncate">
              {subtitleParts.map((p, i) => (
                <span key={i} className="truncate">
                  {i > 0 ? '· ' : ''}
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 pl-2">
        <div className={`text-[15px] font-medium ${amountColor}`}>
          {amountPrefix}
          {formatMoney(txn.amount)}
        </div>
        <div className="text-xs text-outline/70">
          {isExpense ? formatDurationShort(amountToHours(txn.amount, hourlyWage)) : formatTime(txn.timestamp)}
        </div>
      </div>
    </button>
  )
}

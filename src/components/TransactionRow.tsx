import { getCategoryIcon } from '../lib/categories'
import { formatTime } from '../lib/date'
import { amountToHours, formatDurationShort, formatMoney } from '../lib/time-value'
import type { Transaction } from '../lib/types'
import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'

export function TransactionRow({ txn }: { txn: Transaction }) {
  const { expenseCategories, incomeCategories, hourlyWage, deleteTransaction } = useLedger()
  const { openEditModal, askConfirm } = useUI()

  const isExpense = txn.type === 'expense'
  const isIncome = txn.type === 'income'
  const isTransfer = txn.type === 'transfer'

  const icon = isTransfer
    ? 'swap_horiz'
    : getCategoryIcon(isExpense ? expenseCategories : incomeCategories, txn.category)

  const title = txn.merchant || txn.category || (isTransfer ? '转账' : '记录')
  const metaParts = [formatTime(txn.timestamp), isTransfer ? `${txn.account} → ${txn.toAccount}` : txn.category].filter(
    Boolean
  )

  const hours = amountToHours(txn.amount, hourlyWage)
  const prominent = hours >= 1

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    askConfirm(`确定要删除「${title}」这条记录吗？`, () => {
      deleteTransaction(txn.id)
    })
  }

  return (
    <div
      onClick={() => openEditModal(txn)}
      className="group w-full flex items-center justify-between p-space-md hover:bg-surface-container-low transition-colors text-left cursor-pointer"
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
          <span className={`font-body-md text-body-md text-on-surface truncate ${isIncome ? 'font-semibold' : 'font-medium'}`}>
            {title}
          </span>
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
      <div className="flex items-center gap-1 shrink-0 pl-2">
        <div className="flex flex-col items-end shrink-0">
          <span
            className={`font-metric-md text-metric-md font-semibold ${
              isIncome ? 'text-positive' : isExpense && prominent ? 'text-secondary' : 'text-on-surface'
            }`}
          >
            {isIncome ? '+' : ''}
            {formatMoney(txn.amount)}
          </span>
          {(isExpense || isIncome) && (
            <span className="font-metric-sm text-metric-sm text-on-surface-variant mt-0.5">
              {isIncome ? '+' : '-'}
              {formatDurationShort(hours)}
            </span>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="w-7 h-7 flex items-center justify-center rounded-full text-outline/50 hover:text-error hover:bg-error-container/40 transition-colors shrink-0"
          aria-label="删除"
        >
          <span className="material-symbols-outlined text-[17px]">delete</span>
        </button>
      </div>
    </div>
  )
}

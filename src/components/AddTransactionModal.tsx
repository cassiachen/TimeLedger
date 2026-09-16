import { useEffect, useState } from 'react'
import { ACCOUNTS } from '../lib/categories'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../lib/date'
import { amountToHours, formatDuration } from '../lib/time-value'
import type { TransactionType } from '../lib/types'
import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'

const TYPE_TABS: { key: TransactionType; label: string }[] = [
  { key: 'expense', label: '支出' },
  { key: 'income', label: '收入' },
  { key: 'transfer', label: '转账' },
]

export function AddTransactionModal() {
  const { addModal, closeAddModal } = useUI()
  const { expenseCategories, incomeCategories, addCustomExpenseCategory, addTransaction, updateTransaction, deleteTransaction, hourlyWage } =
    useLedger()

  const isEditing = !!addModal.editing
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('餐饮')
  const [account, setAccount] = useState('微信')
  const [toAccount, setToAccount] = useState('支付宝')
  const [merchant, setMerchant] = useState('')
  const [note, setNote] = useState('')
  const [timestamp, setTimestamp] = useState(() => toDatetimeLocalValue(Date.now()))
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false)
  const [customCategoryName, setCustomCategoryName] = useState('')

  useEffect(() => {
    if (!addModal.open) return
    const t = addModal.editing
    setType(t ? t.type : addModal.type)
    setAmount(t ? String(t.amount) : '')
    setCategory(t?.category || (t?.type === 'income' || addModal.type === 'income' ? '工资' : '餐饮'))
    setAccount(t?.account || '微信')
    setToAccount(t?.toAccount || '支付宝')
    setMerchant(t?.merchant || '')
    setNote(t?.note || '')
    setTimestamp(toDatetimeLocalValue(t?.timestamp || Date.now()))
    setShowCustomCategoryInput(false)
    setCustomCategoryName('')
  }, [addModal.open, addModal.editing, addModal.type])

  if (!addModal.open) return null

  const categories = type === 'income' ? incomeCategories : expenseCategories
  const amountNum = parseFloat(amount) || 0
  const hoursPreview = amountToHours(amountNum, hourlyWage)

  function handleSave() {
    if (!amountNum || amountNum <= 0) return
    const ts = fromDatetimeLocalValue(timestamp)

    const base = {
      type,
      amount: Math.round(amountNum * 100) / 100,
      timestamp: ts,
      note: note.trim() || undefined,
    }

    const payload =
      type === 'transfer'
        ? { ...base, account, toAccount }
        : { ...base, category, account, merchant: merchant.trim() || undefined }

    if (isEditing && addModal.editing) {
      updateTransaction(addModal.editing.id, payload)
    } else {
      addTransaction(payload)
    }
    closeAddModal()
  }

  function handleDelete() {
    if (addModal.editing) {
      deleteTransaction(addModal.editing.id)
      closeAddModal()
    }
  }

  function handleAddCustomCategory() {
    const name = customCategoryName.trim()
    if (!name) return
    addCustomExpenseCategory(name)
    setCategory(name)
    setShowCustomCategoryInput(false)
    setCustomCategoryName('')
  }

  return (
    <div className="sheet-overlay show" onClick={(e) => e.target === e.currentTarget && closeAddModal()}>
      <div className="sheet-content max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary">{isEditing ? '编辑记录' : '记一笔'}</h3>
          <button className="text-outline/60 hover:text-outline p-1" onClick={closeAddModal} aria-label="关闭">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 类型切换 */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-surface-container-low rounded-xl p-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setType(tab.key)}
              className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                type === tab.key ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 金额 */}
        <div className="mb-4">
          <label className="text-xs text-on-surface-variant block mb-1">金额 (¥)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-lg text-primary outline-none placeholder:text-outline-variant"
          />
        </div>

        {type !== 'transfer' ? (
          <>
            {/* 分类 */}
            <div className="mb-4">
              <label className="text-xs text-on-surface-variant block mb-2">分类</label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((c) => (
                  <div
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`p-2.5 rounded-xl border-2 text-center text-xs cursor-pointer transition-all ${
                      category === c.key ? 'border-accent-dim bg-accent-dim/10' : 'border-transparent bg-surface-container-low'
                    }`}
                  >
                    <span className="text-xl block mb-0.5">{c.icon}</span>
                    {c.key}
                  </div>
                ))}
                {type === 'expense' && (
                  <div
                    onClick={() => setShowCustomCategoryInput(true)}
                    className="p-2.5 rounded-xl border-2 border-dashed border-outline-variant text-center text-xs cursor-pointer text-outline flex flex-col items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px] mb-0.5">add</span>
                    自定义
                  </div>
                )}
              </div>
              {showCustomCategoryInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    autoFocus
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder="新分类名称"
                    className="flex-1 bg-surface-container-low rounded-xl px-3 py-2 text-sm outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                  />
                  <button onClick={handleAddCustomCategory} className="px-3 rounded-xl bg-primary text-on-primary text-sm">
                    添加
                  </button>
                </div>
              )}
            </div>

            {/* 账户 */}
            <div className="mb-4">
              <label className="text-xs text-on-surface-variant block mb-2">账户</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {ACCOUNTS.map((a) => (
                  <button
                    key={a.key}
                    onClick={() => setAccount(a.key)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-colors ${
                      account === a.key ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{a.icon}</span>
                    {a.key}
                  </button>
                ))}
              </div>
            </div>

            {/* 商户/备注 */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">商户 (可选)</label>
                <input
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="如：星巴克"
                  className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-sm text-primary outline-none placeholder:text-outline-variant"
                />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant block mb-1">备注 (可选)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="..."
                  className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-sm text-primary outline-none placeholder:text-outline-variant"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-on-surface-variant block mb-2">转出账户</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-sm text-primary outline-none"
              >
                {ACCOUNTS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-on-surface-variant block mb-2">转入账户</label>
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-sm text-primary outline-none"
              >
                {ACCOUNTS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.key}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 时间 */}
        <div className="mb-4">
          <label className="text-xs text-on-surface-variant block mb-1">时间</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-primary outline-none"
          />
        </div>

        {type === 'expense' && (
          <div className="bg-surface-container-low rounded-xl p-3 mb-4 flex justify-between items-center">
            <span className="text-sm text-on-surface-variant">⏱️ 相当于工作</span>
            <span className="text-sm font-semibold text-primary">{formatDuration(hoursPreview)}</span>
          </div>
        )}

        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={handleDelete}
              className="h-12 px-4 rounded-xl border border-error/30 text-error text-sm font-medium active:scale-[0.98] transition-transform"
            >
              删除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!amountNum}
            className="flex-1 h-12 bg-primary text-on-primary rounded-xl text-[15px] font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

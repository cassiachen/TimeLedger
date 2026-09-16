import { useMemo } from 'react'
import { StatCard } from '../components/StatCard'
import { TransactionRow } from '../components/TransactionRow'
import { filterByDay, getMonthTotals, getTodayTotals } from '../lib/selectors'
import { getTodayKey } from '../lib/date'
import { formatDuration, formatMoney } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'

export function Home() {
  const { transactions, hourlyWage, wageSettings } = useLedger()
  const { openAddModal } = useUI()

  const todayTotals = useMemo(() => getTodayTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const monthTotals = useMemo(() => getMonthTotals(transactions, hourlyWage), [transactions, hourlyWage])
  const todayTxns = useMemo(
    () => filterByDay(transactions, getTodayKey()).sort((a, b) => b.timestamp - a.timestamp),
    [transactions]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* 今日数据 */}
      <section className="animate-fade-in-up">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm font-semibold text-outline">今日数据</h2>
          <span className="text-xs text-outline/60">时薪 ¥{hourlyWage.toFixed(2)}</span>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col gap-3">
          <div className="flex flex-col items-center py-2">
            <span className="text-xs text-outline uppercase tracking-wider mb-1">今日消费时间</span>
            <span className="text-4xl font-bold text-primary tracking-tight">
              {formatDuration(todayTotals.expenseHours)}
            </span>
            <span className="text-xs text-outline/60 mt-1">≈ 生命消耗</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="今日收入" value={formatMoney(todayTotals.income)} valueClassName="text-income" />
            <StatCard label="今日支出" value={formatMoney(todayTotals.expense)} valueClassName="text-expense" />
            <StatCard
              label="今日净值"
              value={`${todayTotals.net >= 0 ? '+' : ''}${formatMoney(todayTotals.net)}`}
              valueClassName={todayTotals.net >= 0 ? 'text-income' : 'text-expense'}
            />
          </div>
        </div>
      </section>

      {/* 本月数据 */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <h2 className="text-sm font-semibold text-outline mb-2">本月数据</h2>
        <div className="grid grid-cols-4 gap-2">
          <StatCard label="本月收入" value={formatMoney(monthTotals.income)} />
          <StatCard label="本月支出" value={formatMoney(monthTotals.expense)} />
          <StatCard
            label="本月结余"
            value={formatMoney(monthTotals.net)}
            valueClassName={monthTotals.net >= 0 ? 'text-income' : 'text-expense'}
          />
          <StatCard label="消费时间" value={formatDuration(monthTotals.expenseHours)} />
        </div>
      </section>

      {/* 记一笔入口 */}
      <section className="grid grid-cols-3 gap-2 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
        <button
          onClick={() => openAddModal('expense')}
          className="h-12 bg-primary text-on-primary rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
          支出
        </button>
        <button
          onClick={() => openAddModal('income')}
          className="h-12 bg-surface-container-low text-primary rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          收入
        </button>
        <button
          onClick={() => openAddModal('transfer')}
          className="h-12 bg-surface-container-low text-primary rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          转账
        </button>
      </section>

      {/* 今日账单 */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-sm font-semibold text-outline mb-2">今日账单</h2>
        {todayTxns.length === 0 ? (
          <div className="text-center py-8 text-outline/60 bg-surface-container-lowest rounded-2xl">
            <span className="material-symbols-outlined text-[40px] block mx-auto mb-2 text-accent-dim">
              receipt_long
            </span>
            <p className="text-sm">今天还没有记录</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 bg-surface-container-lowest rounded-2xl p-1.5">
            {todayTxns.map((t) => (
              <TransactionRow key={t.id} txn={t} />
            ))}
          </div>
        )}
      </section>

      {wageSettings.monthlyIncome === 0 && (
        <p className="text-xs text-outline text-center">先在"我的"里设置月收入，才能算出时薪</p>
      )}
    </div>
  )
}

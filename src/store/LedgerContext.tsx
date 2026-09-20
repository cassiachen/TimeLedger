import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../lib/categories'
import type { DayOverrides, DayStatus } from '../lib/earnings'
import { getItem, setItem } from '../lib/storage'
import { DEFAULT_WAGE_SETTINGS, generateSeedTransactions } from '../lib/seed'
import { getHourlyWage } from '../lib/time-value'
import type { Category, Transaction, WageSettings } from '../lib/types'

const KEYS = {
  transactions: 'tl_transactions',
  wageSettings: 'tl_wage_settings',
  customExpenseCategories: 'tl_custom_expense_categories',
  onboarded: 'tl_onboarded',
  demoCleared: 'tl_demo_cleared',
  dayOverrides: 'tl_day_overrides',
}

interface LedgerContextValue {
  transactions: Transaction[]
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  wageSettings: WageSettings
  setWageSettings: (s: WageSettings) => void
  hourlyWage: number

  expenseCategories: Category[]
  incomeCategories: Category[]
  addCustomExpenseCategory: (name: string) => void

  onboarded: boolean
  completeOnboarding: (s: WageSettings) => void

  demoCleared: boolean
  clearDemoData: () => void
  resetToDemoData: () => void

  now: number
  dayOverrides: DayOverrides
  setDayStatus: (dayKey: string, status: DayStatus | null) => void
}

const LedgerContext = createContext<LedgerContextValue | null>(null)

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getItem<Transaction[]>(KEYS.transactions, [])
  )
  const [wageSettings, setWageSettingsState] = useState<WageSettings>(() =>
    getItem<WageSettings>(KEYS.wageSettings, DEFAULT_WAGE_SETTINGS)
  )
  const [customExpenseCategories, setCustomExpenseCategories] = useState<Category[]>(() =>
    getItem<Category[]>(KEYS.customExpenseCategories, [])
  )
  const [onboarded, setOnboarded] = useState<boolean>(() => getItem<boolean>(KEYS.onboarded, false))
  const [demoCleared, setDemoCleared] = useState<boolean>(() => getItem<boolean>(KEYS.demoCleared, false))
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const timer = setInterval(tick, 30_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])
  const [dayOverrides, setDayOverrides] = useState<DayOverrides>(() => getItem<DayOverrides>(KEYS.dayOverrides, {}))

  useEffect(() => {
    setItem(KEYS.dayOverrides, dayOverrides)
  }, [dayOverrides])

  function setDayStatus(dayKey: string, status: DayStatus | null) {
    setDayOverrides((prev) => {
      const next = { ...prev }
      if (status) next[dayKey] = status
      else delete next[dayKey]
      return next
    })
  }

  // 首次进入：还没有任何数据时，种一批演示流水，方便原型直接看效果
  useEffect(() => {
    const hasSeeded = getItem<boolean>('tl_seeded', false)
    if (!hasSeeded) {
      const seeded = generateSeedTransactions()
      setTransactions(seeded)
      setItem(KEYS.transactions, seeded)
      setItem('tl_seeded', true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setItem(KEYS.transactions, transactions)
  }, [transactions])

  useEffect(() => {
    setItem(KEYS.wageSettings, wageSettings)
  }, [wageSettings])

  useEffect(() => {
    setItem(KEYS.customExpenseCategories, customExpenseCategories)
  }, [customExpenseCategories])

  // 多个标签页同时开着时，另一个页面改了数据就同步过来，避免旧页面把新数据覆盖掉
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.newValue === null) return
      try {
        const v = JSON.parse(e.newValue)
        if (e.key === KEYS.transactions) setTransactions(v)
        else if (e.key === KEYS.wageSettings) setWageSettingsState(v)
        else if (e.key === KEYS.customExpenseCategories) setCustomExpenseCategories(v)
        else if (e.key === KEYS.dayOverrides) setDayOverrides(v)
        else if (e.key === KEYS.demoCleared) setDemoCleared(v)
        else if (e.key === KEYS.onboarded) setOnboarded(v)
      } catch {
        /* 忽略损坏的数据 */
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const hourlyWage = useMemo(() => getHourlyWage(wageSettings), [wageSettings])

  const expenseCategories = useMemo(
    () => [
      ...DEFAULT_EXPENSE_CATEGORIES.slice(0, -1),
      ...customExpenseCategories.map((c) => ({ ...c, icon: "sell" })),
      DEFAULT_EXPENSE_CATEGORIES.at(-1)!,
    ],
    [customExpenseCategories]
  )

  function addTransaction(t: Omit<Transaction, 'id'>) {
    const txn: Transaction = { ...t, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
    setTransactions((prev) => [txn, ...prev])
  }

  function updateTransaction(id: string, patch: Partial<Transaction>) {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  function setWageSettings(s: WageSettings) {
    setWageSettingsState(s)
  }

  function addCustomExpenseCategory(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setCustomExpenseCategories((prev) => {
      if ([...DEFAULT_EXPENSE_CATEGORIES, ...prev].some((c) => c.key === trimmed)) return prev
      return [...prev, { key: trimmed, icon: 'sell', custom: true }]
    })
  }

  function completeOnboarding(s: WageSettings) {
    setWageSettingsState(s)
    setOnboarded(true)
    setItem(KEYS.onboarded, true)
  }

  function clearDemoData() {
    setTransactions([])
    setDemoCleared(true)
    setItem(KEYS.demoCleared, true)
  }

  function resetToDemoData() {
    setTransactions(generateSeedTransactions())
    setDemoCleared(false)
    setItem(KEYS.demoCleared, false)
  }

  const value: LedgerContextValue = {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    wageSettings,
    setWageSettings,
    hourlyWage,
    expenseCategories,
    incomeCategories: DEFAULT_INCOME_CATEGORIES,
    addCustomExpenseCategory,
    onboarded,
    completeOnboarding,
    demoCleared,
    clearDemoData,
    resetToDemoData,
    now,
    dayOverrides,
    setDayStatus,
  }

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
}

export function useLedger() {
  const ctx = useContext(LedgerContext)
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider')
  return ctx
}

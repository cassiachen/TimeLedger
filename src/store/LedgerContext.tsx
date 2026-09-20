import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../lib/categories'
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

  const hourlyWage = useMemo(() => getHourlyWage(wageSettings), [wageSettings])

  const expenseCategories = useMemo(
    () => [...DEFAULT_EXPENSE_CATEGORIES.slice(0, -1), ...customExpenseCategories, DEFAULT_EXPENSE_CATEGORIES.at(-1)!],
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
      if (prev.some((c) => c.key === trimmed)) return prev
      return [...prev, { key: trimmed, icon: '🏷️', custom: true }]
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
  }

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
}

export function useLedger() {
  const ctx = useContext(LedgerContext)
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider')
  return ctx
}

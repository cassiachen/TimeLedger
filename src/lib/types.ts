export type TransactionType = 'expense' | 'income' | 'transfer'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  timestamp: number
  category?: string
  account?: string
  toAccount?: string
  merchant?: string
  note?: string
}

export interface WageSettings {
  monthlyIncome: number
  workDays: number
  workHoursPerDay: number
  commuteHours?: number
  sleepHours?: number
  mealHours?: number
}

export interface Category {
  key: string
  icon: string
  custom?: boolean
}

export interface AccountDef {
  key: string
  icon: string
}

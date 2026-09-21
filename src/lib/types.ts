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
  workStartHour?: number
  houseworkHours?: number
}

/** 一条「我的时间」安排：某一天，把多少分钟给了什么 */
export interface TimeEntry {
  id: string
  dayKey: string
  activity: string
  /** 大类 key，见 lib/time-plan.ts */
  group: string
  minutes: number
}

/** 想用时间换的目标，比如 IELTS 7.5 */
export interface TimeGoal {
  id: string
  name: string
  /** 想换到什么，比如 IELTS 7.5；不填就用活动名 */
  title?: string
  targetHours: number
  weeklyHours: number
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

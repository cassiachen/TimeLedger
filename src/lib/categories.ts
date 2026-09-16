import type { AccountDef, Category } from './types'

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { key: '餐饮', icon: '🍜' },
  { key: '交通', icon: '🚇' },
  { key: '居住', icon: '🏠' },
  { key: '购物', icon: '🛒' },
  { key: '娱乐', icon: '🎬' },
  { key: '学习', icon: '📚' },
  { key: '医疗', icon: '💊' },
  { key: '宠物', icon: '🐾' },
  { key: '数码', icon: '💻' },
  { key: '其他', icon: '📌' },
]

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { key: '工资', icon: '💰' },
  { key: '奖金', icon: '🏆' },
  { key: '兼职', icon: '💼' },
  { key: '红包', icon: '🧧' },
  { key: '退款', icon: '↩️' },
  { key: '其他', icon: '📌' },
]

export const ACCOUNTS: AccountDef[] = [
  { key: '微信', icon: 'chat' },
  { key: '支付宝', icon: 'account_balance_wallet' },
  { key: '银行卡', icon: 'credit_card' },
  { key: '现金', icon: 'payments' },
  { key: '信用卡', icon: 'credit_score' },
  { key: '其他', icon: 'more_horiz' },
]

export function getCategoryIcon(list: Category[], key: string | undefined): string {
  if (!key) return '📌'
  const found = list.find((c) => c.key === key)
  return found ? found.icon : '📌'
}

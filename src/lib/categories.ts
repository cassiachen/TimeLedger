import type { AccountDef, Category } from './types'

// icon 是 Material Symbols 图标名（配合 .material-symbols-outlined 渲染），
// 不再用 emoji，跟 Ledger 视觉风格（方形图标格）保持一致。
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { key: '餐饮', icon: 'restaurant' },
  { key: '交通', icon: 'directions_subway' },
  { key: '居住', icon: 'apartment' },
  { key: '购物', icon: 'shopping_bag' },
  { key: '娱乐', icon: 'movie' },
  { key: '学习', icon: 'auto_stories' },
  { key: '医疗', icon: 'medication' },
  { key: '宠物', icon: 'pets' },
  { key: '数码', icon: 'devices' },
  { key: '其他', icon: 'more_horiz' },
]

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { key: '工资', icon: 'work_history' },
  { key: '奖金', icon: 'military_tech' },
  { key: '兼职', icon: 'work' },
  { key: '红包', icon: 'redeem' },
  { key: '退款', icon: 'replay' },
  { key: '其他', icon: 'more_horiz' },
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
  if (!key) return 'more_horiz'
  const found = list.find((c) => c.key === key)
  return found ? found.icon : 'more_horiz'
}

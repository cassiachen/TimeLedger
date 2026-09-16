import { getDayKey } from './date'
import type { Transaction, WageSettings } from './types'

export const DEFAULT_WAGE_SETTINGS: WageSettings = {
  monthlyIncome: 8000,
  workDays: 22,
  workHoursPerDay: 8,
}

// 简单的可复现伪随机数生成器，让演示数据每次刷新页面都保持一致
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const EXPENSE_PROFILE: { category: string; min: number; max: number; weight: number }[] = [
  { category: '餐饮', min: 15, max: 48, weight: 5 },
  { category: '交通', min: 4, max: 16, weight: 4 },
  { category: '购物', min: 30, max: 320, weight: 2 },
  { category: '娱乐', min: 25, max: 160, weight: 1.5 },
  { category: '学习', min: 20, max: 220, weight: 0.6 },
  { category: '医疗', min: 20, max: 260, weight: 0.4 },
  { category: '宠物', min: 20, max: 150, weight: 0.5 },
  { category: '数码', min: 50, max: 520, weight: 0.4 },
  { category: '其他', min: 10, max: 90, weight: 1 },
]

function weightedPick(rng: () => number) {
  const total = EXPENSE_PROFILE.reduce((s, p) => s + p.weight, 0)
  let r = rng() * total
  for (const p of EXPENSE_PROFILE) {
    r -= p.weight
    if (r <= 0) return p
  }
  return EXPENSE_PROFILE[0]
}

let idCounter = 0
function nextId(ts: number) {
  idCounter += 1
  return `seed-${ts}-${idCounter}`
}

/** 生成过去 N 天（不含今天）的演示流水，用于首页/账单/统计原型有内容可看 */
function generatePastTransactions(days: number): Transaction[] {
  const out: Transaction[] = []
  const now = new Date()

  for (let offset = 1; offset <= days; offset++) {
    const day = new Date(now)
    day.setDate(now.getDate() - offset)
    const rng = mulberry32(offset * 9301 + 49297)

    // 房租：每月 5 号
    if (day.getDate() === 5) {
      const ts = new Date(day).setHours(9, 0, 0, 0)
      out.push({
        id: nextId(ts),
        type: 'expense',
        amount: 1800 + Math.round(rng() * 400),
        category: '居住',
        account: '银行卡',
        merchant: '房租',
        timestamp: ts,
      })
    }

    // 工资：每月 10 号
    if (day.getDate() === 10) {
      const ts = new Date(day).setHours(10, 0, 0, 0)
      out.push({
        id: nextId(ts),
        type: 'income',
        amount: DEFAULT_WAGE_SETTINGS.monthlyIncome,
        category: '工资',
        account: '银行卡',
        merchant: '公司',
        timestamp: ts,
      })
    }

    // 偶尔的额外收入
    if (rng() < 0.08) {
      const ts = new Date(day).setHours(20, 0, 0, 0)
      const incomeCats = ['兼职', '红包', '退款']
      const cat = incomeCats[Math.floor(rng() * incomeCats.length)]
      out.push({
        id: nextId(ts),
        type: 'income',
        amount: Math.round(20 + rng() * 280),
        category: cat,
        account: '微信',
        timestamp: ts,
      })
    }

    // 日常支出 1~3 笔
    const count = 1 + Math.floor(rng() * 3)
    for (let i = 0; i < count; i++) {
      const profile = weightedPick(rng)
      const hour = 7 + Math.floor(rng() * 15)
      const minute = Math.floor(rng() * 60)
      const ts = new Date(day).setHours(hour, minute, 0, 0)
      const accounts = ['微信', '支付宝', '现金', '银行卡']
      out.push({
        id: nextId(ts),
        type: 'expense',
        amount: Math.round((profile.min + rng() * (profile.max - profile.min)) * 100) / 100,
        category: profile.category,
        account: accounts[Math.floor(rng() * accounts.length)],
        timestamp: ts,
      })
    }
  }

  return out
}

/** 今天的几笔示例流水，和 PRD 里的示例数字对上：收入 364 / 支出 126 / 净值 238 */
function generateTodayTransactions(): Transaction[] {
  const today = new Date()
  const at = (h: number, m: number) => new Date(today).setHours(h, m, 0, 0)

  return [
    {
      id: nextId(at(9, 5)),
      type: 'income',
      amount: 300,
      category: '兼职',
      account: '微信',
      merchant: '接单收入',
      timestamp: at(9, 5),
    },
    {
      id: nextId(at(8, 20)),
      type: 'expense',
      amount: 6,
      category: '交通',
      account: '交通卡',
      merchant: '地铁',
      timestamp: at(8, 20),
    },
    {
      id: nextId(at(12, 30)),
      type: 'expense',
      amount: 28,
      category: '餐饮',
      account: '微信',
      merchant: '午餐',
      timestamp: at(12, 30),
    },
    {
      id: nextId(at(15, 10)),
      type: 'expense',
      amount: 18,
      category: '餐饮',
      account: '支付宝',
      merchant: '咖啡',
      timestamp: at(15, 10),
    },
    {
      id: nextId(at(19, 0)),
      type: 'expense',
      amount: 74,
      category: '购物',
      account: '支付宝',
      merchant: '文具',
      timestamp: at(19, 0),
    },
    {
      id: nextId(at(20, 30)),
      type: 'income',
      amount: 64,
      category: '红包',
      account: '微信',
      merchant: '朋友红包',
      timestamp: at(20, 30),
    },
  ]
}

export function generateSeedTransactions(): Transaction[] {
  const txns = [...generatePastTransactions(50), ...generateTodayTransactions()]
  txns.sort((a, b) => a.timestamp - b.timestamp)
  return txns
}

export function isSameDayKey(a: number, b: number) {
  return getDayKey(a) === getDayKey(b)
}

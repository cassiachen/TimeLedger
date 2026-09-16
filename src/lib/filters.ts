import { getDayKey } from './date'
import type { Transaction, TransactionType } from './types'

export interface BillFilters {
  type: TransactionType | 'all'
  category: string | 'all'
  account: string | 'all'
  dateFrom: string // yyyy-mm-dd
  dateTo: string // yyyy-mm-dd
  amountMin: string
  amountMax: string
  search: string
}

export const EMPTY_FILTERS: BillFilters = {
  type: 'all',
  category: 'all',
  account: 'all',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  search: '',
}

export function countActiveFilters(f: BillFilters): number {
  let n = 0
  if (f.type !== 'all') n++
  if (f.category !== 'all') n++
  if (f.account !== 'all') n++
  if (f.dateFrom) n++
  if (f.dateTo) n++
  if (f.amountMin) n++
  if (f.amountMax) n++
  return n
}

export function applyFilters(txns: Transaction[], f: BillFilters): Transaction[] {
  const min = f.amountMin ? parseFloat(f.amountMin) : undefined
  const max = f.amountMax ? parseFloat(f.amountMax) : undefined
  const search = f.search.trim().toLowerCase()

  return txns.filter((t) => {
    if (f.type !== 'all' && t.type !== f.type) return false
    if (f.category !== 'all' && t.category !== f.category) return false
    if (f.account !== 'all' && t.account !== f.account && t.toAccount !== f.account) return false
    if (f.dateFrom && getDayKey(t.timestamp) < f.dateFrom) return false
    if (f.dateTo && getDayKey(t.timestamp) > f.dateTo) return false
    if (min !== undefined && t.amount < min) return false
    if (max !== undefined && t.amount > max) return false
    if (search) {
      const haystack = `${t.merchant || ''} ${t.category || ''} ${t.note || ''} ${t.account || ''}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}

import { Fragment } from 'react'
import type { Transaction } from '../lib/types'
import { TransactionRow } from './TransactionRow'

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="flex flex-col rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
      {transactions.map((t, i) => (
        <Fragment key={t.id}>
          {i > 0 && <div className="h-[1px] bg-surface-container-low mx-space-md" />}
          <TransactionRow txn={t} />
        </Fragment>
      ))}
    </div>
  )
}

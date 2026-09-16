import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Transaction, TransactionType } from '../lib/types'

interface AddModalState {
  open: boolean
  type: TransactionType
  editing: Transaction | null
}

interface UIContextValue {
  addModal: AddModalState
  openAddModal: (type?: TransactionType) => void
  openEditModal: (txn: Transaction) => void
  closeAddModal: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [addModal, setAddModal] = useState<AddModalState>({ open: false, type: 'expense', editing: null })

  function openAddModal(type: TransactionType = 'expense') {
    setAddModal({ open: true, type, editing: null })
  }

  function openEditModal(txn: Transaction) {
    setAddModal({ open: true, type: txn.type, editing: txn })
  }

  function closeAddModal() {
    setAddModal((prev) => ({ ...prev, open: false }))
  }

  return (
    <UIContext.Provider value={{ addModal, openAddModal, openEditModal, closeAddModal }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}

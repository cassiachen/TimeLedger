import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Transaction, TransactionType } from '../lib/types'

interface AddModalState {
  open: boolean
  type: TransactionType
  editing: Transaction | null
}

interface ConfirmState {
  message: string
  confirmLabel: string
  onConfirm: () => void
}

interface UIContextValue {
  addModal: AddModalState
  openAddModal: (type?: TransactionType) => void
  openEditModal: (txn: Transaction) => void
  closeAddModal: () => void
  toast: string | null
  showToast: (message: string) => void
  dismissToast: () => void
  confirmState: ConfirmState | null
  askConfirm: (message: string, onConfirm: () => void, confirmLabel?: string) => void
  closeConfirm: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

let toastTimer: ReturnType<typeof setTimeout> | null = null

export function UIProvider({ children }: { children: ReactNode }) {
  const [addModal, setAddModal] = useState<AddModalState>({ open: false, type: 'expense', editing: null })
  const [toast, setToast] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)

  function askConfirm(message: string, onConfirm: () => void, confirmLabel = '删除') {
    setConfirmState({ message, confirmLabel, onConfirm })
  }

  function closeConfirm() {
    setConfirmState(null)
  }

  function showToast(message: string) {
    if (toastTimer) clearTimeout(toastTimer)
    setToast(message)
    toastTimer = setTimeout(() => setToast(null), 2000)
  }

  function dismissToast() {
    if (toastTimer) clearTimeout(toastTimer)
    setToast(null)
  }

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
    <UIContext.Provider
      value={{
        addModal,
        openAddModal,
        openEditModal,
        closeAddModal,
        toast,
        showToast,
        dismissToast,
        confirmState,
        askConfirm,
        closeConfirm,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}

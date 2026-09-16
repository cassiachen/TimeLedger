import { useUI } from '../store/UIContext'

export function ConfirmDialog() {
  const { confirmState, closeConfirm } = useUI()

  if (!confirmState) return null

  function handleConfirm() {
    confirmState!.onConfirm()
    closeConfirm()
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-8"
      style={{ background: 'rgba(0,0,0,0.25)' }}
      onClick={(e) => e.target === e.currentTarget && closeConfirm()}
    >
      <div className="bg-surface-container-lowest rounded-xl shadow-lg p-6 flex flex-col items-center gap-4 max-w-[300px] w-full">
        <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
          <span className="material-symbols-outlined text-error text-[26px]">warning</span>
        </div>
        <span className="font-body-md text-body-md text-on-surface text-center leading-relaxed">
          {confirmState.message}
        </span>
        <div className="flex gap-2 w-full">
          <button
            onClick={closeConfirm}
            className="flex-1 h-10 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-medium active:scale-[0.98] transition-transform"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-10 rounded-lg bg-error text-on-error font-label-md text-label-md font-medium active:scale-[0.98] transition-transform"
          >
            {confirmState.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

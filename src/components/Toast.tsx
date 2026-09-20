import { useUI } from '../store/UIContext'

export function Toast() {
  const { toast, dismissToast } = useUI()

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center px-8 transition-opacity duration-200 ${
        toast ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(0,0,0,0.25)' }}
      onClick={dismissToast}
    >
      <div
        className={`bg-surface-container-lowest rounded-xl shadow-lg px-6 py-5 flex flex-col items-center gap-3 max-w-[220px] w-full transition-transform duration-200 ${
          toast ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary text-[26px]">check_circle</span>
        </div>
        <span className="font-body-lg text-body-lg text-on-surface font-medium text-center">{toast}</span>
      </div>
    </div>
  )
}

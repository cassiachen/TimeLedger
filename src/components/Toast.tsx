import { useUI } from '../store/UIContext'

export function Toast() {
  const { toast } = useUI()

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 z-[300] transition-all duration-300 ${
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' }}
    >
      <span className="material-symbols-outlined text-[18px] text-secondary-fixed">check_circle</span>
      <span className="font-body-sm text-body-sm font-medium">{toast}</span>
    </div>
  )
}

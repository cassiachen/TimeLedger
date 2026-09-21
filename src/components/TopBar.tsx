import { Link } from 'react-router-dom'
import { useLedger } from '../store/LedgerContext'

export function TopBar() {
  const { hourlyWage } = useLedger()

  return (
    <header className="fixed top-0 left-0 w-full z-40 pt-safe bg-surface">
      <div className="h-16 px-margin flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-space-sm">
          <img src="/brand-mark.svg" alt="TimeLedger" className="h-8 w-8 rounded-lg object-contain shrink-0" />
          <span className="font-headline-md text-headline-md text-on-surface leading-none tracking-tight">时账</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <Link
            to="/settings"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed shadow-[0_1px_4px_rgba(155,69,0,0.06)]"
          >
            <span className="material-symbols-outlined text-[14px] text-secondary">schedule</span>
            <span className="font-metric-sm text-metric-sm font-medium">¥{hourlyWage.toFixed(1)}/h</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  )
}

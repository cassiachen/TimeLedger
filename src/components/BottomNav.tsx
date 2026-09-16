import { NavLink } from 'react-router-dom'
import { useUI } from '../store/UIContext'

const TABS = [
  { to: '/', icon: 'timelapse', label: '首页' },
  { to: '/bills', icon: 'receipt_long', label: '账单' },
]

const TABS_RIGHT = [
  { to: '/stats', icon: 'bar_chart', label: '统计' },
  { to: '/settings', icon: 'tune', label: '设置' },
]

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 transition-colors ${
          isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
          >
            {icon}
          </span>
          <span className={`font-label-md text-label-md mt-0.5 ${isActive ? 'font-semibold' : ''}`}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const { openAddModal } = useUI()

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 pb-safe bg-surface/80 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around h-16 px-space-xs max-w-md mx-auto">
        {TABS.map((tab) => (
          <NavItem key={tab.to} {...tab} />
        ))}
        <button
          onClick={() => openAddModal('expense')}
          className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1"
          aria-label="记一笔"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[22px]">add</span>
          </div>
        </button>
        {TABS_RIGHT.map((tab) => (
          <NavItem key={tab.to} {...tab} />
        ))}
      </div>
    </nav>
  )
}

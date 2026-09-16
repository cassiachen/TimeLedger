import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', icon: 'home', label: '首页' },
  { to: '/bills', icon: 'receipt_long', label: '账单' },
  { to: '/stats', icon: 'bar_chart', label: '统计' },
  { to: '/me', icon: 'person', label: '我的' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-6 py-2 pb-safe bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.04)] max-w-md mx-auto right-0">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 w-16 py-1.5 transition-colors duration-200 ${
              isActive ? 'text-primary' : 'text-outline'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
              >
                {tab.icon}
              </span>
              <span className={`text-[11px] ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

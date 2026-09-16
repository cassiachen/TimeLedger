import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AddTransactionModal } from './components/AddTransactionModal'
import { BottomNav } from './components/BottomNav'
import { OnboardingModal } from './components/OnboardingModal'
import { TopBar } from './components/TopBar'
import { Bills } from './pages/Bills'
import { Home } from './pages/Home'
import { Me } from './pages/Me'
import { Stats } from './pages/Stats'
import { LedgerProvider } from './store/LedgerContext'
import { UIProvider, useUI } from './store/UIContext'

const TITLES: Record<string, string> = {
  '/': '时账 TimeLedger',
  '/bills': '账单',
  '/stats': '统计',
  '/me': '我的',
}

function Fab() {
  const { openAddModal } = useUI()
  return (
    <button
      onClick={() => openAddModal('expense')}
      className="fixed z-40 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-primary text-on-primary shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex items-center justify-center active:scale-95 transition-transform"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 58px)' }}
      aria-label="记一笔"
    >
      <span className="material-symbols-outlined text-[28px]">add</span>
    </button>
  )
}

function Shell() {
  const location = useLocation()
  const title = TITLES[location.pathname] || '时账 TimeLedger'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar title={title} />
      <main className="flex-1 px-5 pt-[76px] pb-28 max-w-md mx-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/me" element={<Me />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Fab />
      <BottomNav />
      <AddTransactionModal />
      <OnboardingModal />
    </div>
  )
}

export default function App() {
  return (
    <LedgerProvider>
      <UIProvider>
        <Shell />
      </UIProvider>
    </LedgerProvider>
  )
}

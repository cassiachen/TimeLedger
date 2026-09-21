import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AddTransactionModal } from './components/AddTransactionModal'
import { ArrangeTimeSheet } from './components/ArrangeTimeSheet'
import { BottomNav } from './components/BottomNav'
import { ConfirmDialog } from './components/ConfirmDialog'
import { OnboardingModal } from './components/OnboardingModal'
import { Toast } from './components/Toast'
import { TopBar } from './components/TopBar'
import { Bills } from './pages/Bills'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { Stats } from './pages/Stats'
import { TimeLedger } from './pages/TimeLedger'
import { LedgerProvider } from './store/LedgerContext'
import { UIProvider } from './store/UIContext'

const SUBTITLES: Record<string, string> = {
  '/': '首页',
  '/bills': '账单',
  '/stats': '统计',
  '/settings': '设置',
  '/time': '时间账本',
}

function Shell() {
  const location = useLocation()
  const subtitle = SUBTITLES[location.pathname] || '首页'

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <TopBar subtitle={subtitle} />
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface px-margin max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/time" element={<TimeLedger />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
      <AddTransactionModal />
      <ArrangeTimeSheet />
      <OnboardingModal />
      <Toast />
      <ConfirmDialog />
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

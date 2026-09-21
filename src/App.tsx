import { Navigate, Route, Routes } from 'react-router-dom'
import { AddTransactionModal } from './components/AddTransactionModal'
import { ArrangeTimeSheet } from './components/ArrangeTimeSheet'
import { BottomNav } from './components/BottomNav'
import { ConfirmDialog } from './components/ConfirmDialog'
import { OnboardingModal } from './components/OnboardingModal'
import { Toast } from './components/Toast'
import { TopBar } from './components/TopBar'
import { Bills } from './pages/Bills'
import { Guide } from './pages/Guide'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { Stats } from './pages/Stats'
import { TimeLedger } from './pages/TimeLedger'
import { LedgerProvider } from './store/LedgerContext'
import { UIProvider } from './store/UIContext'

function Shell() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <TopBar />
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface px-margin max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/time" element={<TimeLedger />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <p className="mt-space-lg text-center font-label-mono text-label-mono text-outline/60 select-none">
          Designed by Cassia
        </p>
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

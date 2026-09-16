import { useEffect, useState } from 'react'
import { getHourlyWage } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

function Row({ icon, label, right, onClick }: { icon: string; label: string; right?: React.ReactNode; onClick?: () => void }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 ${onClick ? 'active:bg-surface-container-low' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{icon}</span>
        <span className="text-sm text-primary">{label}</span>
      </div>
      {right}
    </Comp>
  )
}

export function Me() {
  const { wageSettings, setWageSettings } = useLedger()
  const [monthlyIncome, setMonthlyIncome] = useState(String(wageSettings.monthlyIncome))
  const [workDays, setWorkDays] = useState(String(wageSettings.workDays))
  const [workHoursPerDay, setWorkHoursPerDay] = useState(String(wageSettings.workHoursPerDay))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMonthlyIncome(String(wageSettings.monthlyIncome))
    setWorkDays(String(wageSettings.workDays))
    setWorkHoursPerDay(String(wageSettings.workHoursPerDay))
  }, [wageSettings])

  const income = parseFloat(monthlyIncome) || 0
  const days = parseFloat(workDays) || 0
  const hours = parseFloat(workHoursPerDay) || 0
  const hourlyWage = getHourlyWage({ monthlyIncome: income, workDays: days, workHoursPerDay: hours })

  function handleSave() {
    setWageSettings({ monthlyIncome: income, workDays: days, workHoursPerDay: hours })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function handleResetDemoData() {
    if (!confirm('确定要清空当前数据，并重新生成一份演示流水吗？')) return
    localStorage.removeItem('tl_transactions')
    localStorage.removeItem('tl_seeded')
    location.reload()
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="animate-fade-in-up">
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center text-lg font-semibold">
            时
          </div>
          <div>
            <div className="text-base font-semibold text-primary">时账用户</div>
            <div className="text-xs text-outline">登录 / 云同步即将上线</div>
          </div>
        </div>
      </section>

      <section className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <h2 className="text-sm font-semibold text-outline mb-2">时间价值设置</h2>
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col gap-3">
          <div>
            <label className="text-xs text-on-surface-variant block mb-1">月收入 (¥)</label>
            <input
              type="number"
              inputMode="decimal"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-on-surface-variant block mb-1">每月工作天数</label>
              <input
                type="number"
                inputMode="decimal"
                value={workDays}
                onChange={(e) => setWorkDays(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-on-surface-variant block mb-1">每天工作小时数</label>
              <input
                type="number"
                inputMode="decimal"
                value={workHoursPerDay}
                onChange={(e) => setWorkHoursPerDay(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-primary outline-none"
              />
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm text-on-surface-variant">你的时薪</span>
            <span className="text-base font-semibold text-primary">¥{hourlyWage.toFixed(2)} / 小时</span>
          </div>
          <button
            onClick={handleSave}
            className="w-full h-11 bg-primary text-on-primary rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
          >
            {saved ? '已保存 ✓' : '保存'}
          </button>
        </div>
      </section>

      <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-sm font-semibold text-outline mb-2">会员（即将上线）</h2>
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden divide-y divide-surface-container opacity-60 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <Row icon="calendar_view_week" label="周报" right={<span className="text-xs text-outline">敬请期待</span>} />
          <Row icon="calendar_month" label="月报" right={<span className="text-xs text-outline">敬请期待</span>} />
          <Row icon="auto_awesome" label="AI 消费分析" right={<span className="text-xs text-outline">敬请期待</span>} />
        </div>
      </section>

      <section className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-sm font-semibold text-outline mb-2">数据</h2>
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden divide-y divide-surface-container shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <Row
            icon="restart_alt"
            label="重置为演示数据"
            onClick={handleResetDemoData}
            right={<span className="material-symbols-outlined text-[18px] text-outline/50">chevron_right</span>}
          />
        </div>
      </section>

      <p className="text-center text-[11px] text-outline/40 tracking-[0.15em] py-2">Made by Cassia</p>
    </div>
  )
}

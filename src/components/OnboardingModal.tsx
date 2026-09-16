import { useState } from 'react'
import { getHourlyWage } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

export function OnboardingModal() {
  const { onboarded, completeOnboarding, wageSettings } = useLedger()
  const [monthlyIncome, setMonthlyIncome] = useState(String(wageSettings.monthlyIncome))
  const [workDays, setWorkDays] = useState(String(wageSettings.workDays))
  const [workHoursPerDay, setWorkHoursPerDay] = useState(String(wageSettings.workHoursPerDay))

  if (onboarded) return null

  const income = parseFloat(monthlyIncome) || 0
  const days = parseFloat(workDays) || 0
  const hours = parseFloat(workHoursPerDay) || 0
  const hourlyWage = getHourlyWage({ monthlyIncome: income, workDays: days, workHoursPerDay: hours })
  const canSubmit = income > 0 && days > 0 && hours > 0

  return (
    <div className="sheet-overlay show">
      <div className="sheet-content max-w-md mx-auto">
        <div className="mb-1 text-center">
          <span className="text-3xl">⏱️</span>
        </div>
        <h3 className="text-lg font-semibold text-primary text-center mb-1">先设置你的时间价值</h3>
        <p className="text-sm text-outline text-center mb-6">用来把每一笔消费换算成工作时间</p>

        <div className="mb-4">
          <label className="text-xs text-on-surface-variant block mb-1">月收入 (¥)</label>
          <input
            type="number"
            inputMode="decimal"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="如：8000"
            className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-primary outline-none placeholder:text-outline-variant"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-on-surface-variant block mb-1">每月工作天数</label>
            <input
              type="number"
              inputMode="decimal"
              value={workDays}
              onChange={(e) => setWorkDays(e.target.value)}
              placeholder="22"
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-primary outline-none placeholder:text-outline-variant"
            />
          </div>
          <div>
            <label className="text-xs text-on-surface-variant block mb-1">每天工作小时数</label>
            <input
              type="number"
              inputMode="decimal"
              value={workHoursPerDay}
              onChange={(e) => setWorkHoursPerDay(e.target.value)}
              placeholder="8"
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-primary outline-none placeholder:text-outline-variant"
            />
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-3 mb-6 flex justify-between items-center">
          <span className="text-sm text-on-surface-variant">你的时薪</span>
          <span className="text-base font-semibold text-primary">¥{hourlyWage.toFixed(2)} / 小时</span>
        </div>

        <button
          disabled={!canSubmit}
          onClick={() => completeOnboarding({ monthlyIncome: income, workDays: days, workHoursPerDay: hours })}
          className="w-full h-12 bg-primary text-on-primary rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform disabled:opacity-40"
        >
          开始使用
        </button>
      </div>
    </div>
  )
}

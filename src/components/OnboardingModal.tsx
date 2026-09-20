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
  const canSubmit = income > 0 && days > 0 && days <= 31 && hours > 0 && hours <= 24

  return (
    <div className="sheet-overlay show">
      <div className="sheet-content max-w-md mx-auto">
        <div className="mb-3 flex justify-center">
          <div className="w-14 h-14 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[26px]">hourglass_bottom</span>
          </div>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface text-center mb-1">先算一下你的时薪</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center mb-6">
          记账时会按它算出每笔花了多少时间
        </p>

        <div className="mb-4">
          <label className="font-label-md text-label-md text-on-surface-variant block mb-1">月收入 (¥)</label>
          <input
            type="number"
            inputMode="decimal"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="如：8000"
            className="w-full h-12 bg-surface-container-low rounded px-4 font-metric-md text-metric-md text-on-surface outline-none placeholder:text-outline-variant"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1">每月工作天数</label>
            <input
              type="number"
              inputMode="decimal"
              value={workDays}
              onChange={(e) => setWorkDays(e.target.value)}
              placeholder="22"
              className="w-full h-12 bg-surface-container-low rounded px-4 font-metric-md text-metric-md text-on-surface outline-none placeholder:text-outline-variant"
            />
          </div>
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant block mb-1">每天工作小时</label>
            <input
              type="number"
              inputMode="decimal"
              value={workHoursPerDay}
              onChange={(e) => setWorkHoursPerDay(e.target.value)}
              placeholder="8"
              className="w-full h-12 bg-surface-container-low rounded px-4 font-metric-md text-metric-md text-on-surface outline-none placeholder:text-outline-variant"
            />
          </div>
        </div>

        <div className="bg-secondary-fixed/50 rounded p-3 mb-6 flex justify-between items-center">
          <span className="font-body-sm text-body-sm text-on-secondary-fixed">你的时薪</span>
          <span className="font-metric-md text-metric-md font-semibold text-on-secondary-fixed">
            ¥{hourlyWage.toFixed(2)} / 小时
          </span>
        </div>

        <button
          disabled={!canSubmit}
          onClick={() => completeOnboarding({ monthlyIncome: income, workDays: days, workHoursPerDay: hours })}
          className="w-full h-12 bg-primary text-on-primary rounded font-body-lg text-body-lg font-medium active:scale-[0.98] transition-transform disabled:opacity-40"
        >
          开始使用
        </button>
      </div>
    </div>
  )
}

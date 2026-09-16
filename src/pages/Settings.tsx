import { useEffect, useState } from 'react'
import { getHourlyWage } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'

const INCOME_PRESETS = [6000, 8000, 12000, 20000]
const HOURS_PRESETS = [7.5, 8.0, 9.0, 10.0]

export function Settings() {
  const { wageSettings, setWageSettings } = useLedger()
  const { askConfirm } = useUI()
  const [monthlyIncome, setMonthlyIncome] = useState(wageSettings.monthlyIncome)
  const [workDays, setWorkDays] = useState(wageSettings.workDays)
  const [workHours, setWorkHours] = useState(wageSettings.workHoursPerDay)
  const [commute, setCommute] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMonthlyIncome(wageSettings.monthlyIncome)
    setWorkDays(wageSettings.workDays)
    setWorkHours(wageSettings.workHoursPerDay)
  }, [wageSettings])

  const effectiveHours = workHours + (commute ? 1.5 : 0)
  const hourlyRate = getHourlyWage({ monthlyIncome, workDays, workHoursPerDay: effectiveHours })
  const minuteRate = hourlyRate / 60

  const coffeeMinutes = hourlyRate ? Math.round((25 / hourlyRate) * 60) : 0
  const dinnerHours = hourlyRate ? 200 / hourlyRate : 0
  const phoneHours = hourlyRate ? 5999 / hourlyRate : 0
  const phoneDays = effectiveHours ? phoneHours / effectiveHours : 0

  function handleSave() {
    setWageSettings({ monthlyIncome, workDays, workHoursPerDay: effectiveHours })
    setSaved(true)
    setTimeout(() => setSaved(false), 2400)
  }

  function handleResetDemoData() {
    askConfirm('确定要清空当前数据，并重新生成一份演示流水吗？', () => {
      localStorage.removeItem('tl_transactions')
      localStorage.removeItem('tl_seeded')
      location.reload()
    }, '清空并重置')
  }

  return (
    <div className="flex flex-col w-full pb-8">
      <div className="flex flex-col mb-space-lg">
        <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">时薪基准换算</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          将劳动收入折算为时间标尺，重新审视每一笔消费的真实代价。
        </p>
      </div>

      {/* Live hero */}
      <div className="relative overflow-hidden bg-primary-container text-on-primary rounded-xl p-5 shadow-lg mb-space-lg">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[160px] text-on-primary">hourglass_bottom</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-highest/10 w-fit mb-4">
          <span className="material-symbols-outlined text-[14px] text-secondary-container">functions</span>
          <span className="font-label-mono text-label-mono text-on-primary-container tracking-wide">
            [月实发收入] ÷ ([工作天数] × [工时]) = 真实时薪
          </span>
        </div>

        <div className="flex flex-col mb-4">
          <span className="font-label-mono text-label-mono text-on-primary-container uppercase tracking-wider">当前核算时薪</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-metric-lg text-headline-md text-secondary-container">¥</span>
            <span className="font-metric-lg text-display-lg-mobile font-semibold tracking-tight text-on-primary">
              {hourlyRate.toFixed(2)}
            </span>
            <span className="font-body-md text-body-md text-on-primary-container">/ 小时</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-on-primary-container">
            <span className="font-label-mono text-label-mono">每分钟价值</span>
            <span className="font-metric-sm text-metric-sm font-medium text-secondary-fixed">≈ ¥{minuteRate.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-3.5 space-y-2 bg-black/20 rounded-lg p-3">
          <div className="font-label-mono text-label-mono text-on-primary-container uppercase tracking-wider mb-2">
            购买力折算标尺
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[15px] text-secondary-fixed">local_cafe</span>
              </div>
              <span className="text-on-primary">一杯咖啡 (¥25)</span>
            </div>
            <span className="font-metric-sm text-metric-sm font-medium text-secondary-fixed">≈ {coffeeMinutes} 分钟工时</span>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[15px] text-secondary-fixed">restaurant</span>
              </div>
              <span className="text-on-primary">一顿大餐 (¥200)</span>
            </div>
            <span className="font-metric-sm text-metric-sm font-medium text-secondary-fixed">≈ {dinnerHours.toFixed(1)} 小时工时</span>
          </div>
          <div className="flex items-center justify-between font-body-sm text-body-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[15px] text-secondary-fixed">smartphone</span>
              </div>
              <span className="text-on-primary whitespace-nowrap">一台手机 (¥5,999)</span>
            </div>
            <span className="font-metric-sm text-metric-sm font-medium text-secondary-fixed shrink-0 whitespace-nowrap text-right pl-2">
              ≈ {phoneHours.toFixed(0)}h ({phoneDays.toFixed(1)}天)
            </span>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-space-md">
        <div className="bg-surface-container-lowest rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="font-headline-md text-body-lg text-on-surface font-medium">月实发收入</label>
            <span className="font-label-mono text-label-mono text-on-surface-variant">扣除五险一金后</span>
          </div>
          <div className="relative flex items-center mb-3">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-on-surface-variant font-metric-md text-metric-md">
              ¥
            </div>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
              step={100}
              className="w-full h-12 bg-surface-container-low text-on-surface font-metric-lg text-metric-lg rounded px-3.5 pl-8 focus:outline-none focus:bg-surface-container transition-colors"
            />
            <div className="absolute right-3.5 text-on-surface-variant font-body-sm text-body-sm">元 / 月</div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {INCOME_PRESETS.map((val) => (
              <button
                key={val}
                onClick={() => setMonthlyIncome(val)}
                className={`px-3 py-1 rounded font-metric-sm text-metric-sm active:scale-95 transition-all shrink-0 ${
                  monthlyIncome === val ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                ¥{val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="font-headline-md text-body-lg text-on-surface font-medium">每月工作天数</label>
            <span className="font-label-mono text-label-mono text-on-surface-variant">扣除双休与节假</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setWorkDays((d) => Math.max(1, Math.min(31, d - 1)))}
              className="w-12 h-12 rounded bg-surface-container-low active:bg-surface-container flex items-center justify-center text-on-surface transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <div className="flex-1 h-12 bg-surface-container-low rounded flex items-center justify-center gap-1.5 px-4">
              <input
                type="number"
                value={workDays}
                onChange={(e) => setWorkDays(parseFloat(e.target.value) || 0)}
                step={0.5}
                min={1}
                max={31}
                className="bg-transparent text-center font-metric-lg text-metric-lg text-on-surface w-16 focus:outline-none"
              />
              <span className="font-body-md text-body-md text-on-surface-variant">天</span>
            </div>
            <button
              onClick={() => setWorkDays((d) => Math.max(1, Math.min(31, d + 1)))}
              className="w-12 h-12 rounded bg-surface-container-low active:bg-surface-container flex items-center justify-center text-on-surface transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm px-1">
            <span>参考：法定双休约 21.75 天</span>
            <button className="text-secondary hover:underline font-metric-sm text-metric-sm" onClick={() => setWorkDays(21.75)}>
              设为21.75
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="font-headline-md text-body-lg text-on-surface font-medium">每天实际工时</label>
            <span className="font-label-mono text-label-mono text-on-surface-variant">在岗专注与加班</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setWorkHours((h) => Math.max(1, Math.min(24, h - 0.5)))}
              className="w-12 h-12 rounded bg-surface-container-low active:bg-surface-container flex items-center justify-center text-on-surface transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <div className="flex-1 h-12 bg-surface-container-low rounded flex items-center justify-center gap-1.5 px-4">
              <input
                type="number"
                value={workHours}
                onChange={(e) => setWorkHours(parseFloat(e.target.value) || 0)}
                step={0.5}
                min={1}
                max={24}
                className="bg-transparent text-center font-metric-lg text-metric-lg text-on-surface w-16 focus:outline-none"
              />
              <span className="font-body-md text-body-md text-on-surface-variant">小时</span>
            </div>
            <button
              onClick={() => setWorkHours((h) => Math.max(1, Math.min(24, h + 0.5)))}
              className="w-12 h-12 rounded bg-surface-container-low active:bg-surface-container flex items-center justify-center text-on-surface transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {HOURS_PRESETS.map((val) => (
              <button
                key={val}
                onClick={() => setWorkHours(val)}
                className={`py-1.5 rounded font-metric-sm text-metric-sm text-center active:scale-95 transition-all ${
                  workHours === val ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {val.toFixed(1)}h
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3 pr-2">
            <div className="w-9 h-9 rounded bg-surface-container-low flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[20px]">commute</span>
            </div>
            <div className="flex flex-col">
              <span className="font-body-md text-body-md text-on-surface font-medium">计入每日往返通勤</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">默认增加 1.5h/天隐性劳动折算</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={commute} onChange={(e) => setCommute(e.target.checked)} />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
          </label>
        </div>
      </div>

      <div className="mt-space-lg">
        <button
          onClick={handleSave}
          className="w-full h-12 bg-primary text-on-primary font-headline-md text-body-lg font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{saved ? '已保存并同步' : '保存并启用时间标尺'}</span>
        </button>
        <p className="font-label-mono text-label-mono text-center text-on-surface-variant mt-2.5">
          变更将实时更新账单时间换算率（当前：¥{hourlyRate.toFixed(2)}/h）
        </p>
      </div>

      {/* Data management */}
      <div className="mt-space-xl bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={handleResetDemoData}
          className="w-full flex items-center justify-between px-4 py-3.5 active:bg-surface-container-low"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">restart_alt</span>
            <span className="font-body-md text-body-md text-on-surface">重置为演示数据</span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-outline/50">chevron_right</span>
        </button>
      </div>

      <div className="flex items-center gap-1 text-on-surface-variant justify-center mt-space-lg">
        <span className="material-symbols-outlined text-[16px]">lock</span>
        <span className="font-label-mono text-label-mono uppercase tracking-wider">本地存储 · 登录/云同步即将上线</span>
      </div>
    </div>
  )
}

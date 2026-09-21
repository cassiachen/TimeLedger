import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { restartTutorial } from '../store/useTutorial'
import { getItem, setItem } from '../lib/storage'
import { DEFAULT_HOUSEWORK_HOURS, DEFAULT_MEAL_HOURS, DEFAULT_SLEEP_HOURS, getHourlyWage } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'

interface Benchmark {
  id: string
  name: string
  price: number
  icon: string
}

const BENCHMARKS_KEY = 'tl_benchmarks'
const DEFAULT_BENCHMARKS: Benchmark[] = [
  { id: 'coffee', name: '一杯咖啡', price: 25, icon: 'local_cafe' },
  { id: 'tea', name: '一杯奶茶', price: 18, icon: 'emoji_food_beverage' },
  { id: 'movie', name: '一张电影票', price: 60, icon: 'movie' },
  { id: 'dinner', name: '一顿大餐', price: 200, icon: 'restaurant' },
  { id: 'shoes', name: '一双运动鞋', price: 800, icon: 'directions_run' },
  { id: 'flight', name: '一张机票', price: 1500, icon: 'flight_takeoff' },
  { id: 'airpods', name: '一副耳机', price: 1899, icon: 'headphones' },
  { id: 'phone', name: '一台手机', price: 5999, icon: 'smartphone' },
  { id: 'laptop', name: '一台笔记本', price: 8999, icon: 'laptop_mac' },
]

const INCOME_PRESETS = [6000, 8000, 12000, 20000]
const HOURS_PRESETS = [7.5, 8.0, 9.0, 10.0]
const COMMUTE_PRESETS = [0, 0.5, 1, 1.5, 2]

/** 数字输入框保留原始文本，删除到空的时候不会被强行补成 0 */
function useNumField(initial: number) {
  const [text, setText] = useState(String(initial))
  const value = parseFloat(text) || 0
  const setValue = (v: number | ((prev: number) => number)) =>
    setText(String(typeof v === "function" ? v(value) : v))
  return { text, setText, value, setValue }
}

export function Settings() {
  const { wageSettings, setWageSettings, demoCleared, clearDemoData, resetToDemoData } = useLedger()
  const { askConfirm } = useUI()
  const navigate = useNavigate()
  const incomeField = useNumField(wageSettings.monthlyIncome)
  const daysField = useNumField(wageSettings.workDays)
  const hoursField = useNumField(wageSettings.workHoursPerDay)
  const commuteField = useNumField(wageSettings.commuteHours || 0)
  const sleepField = useNumField(wageSettings.sleepHours ?? DEFAULT_SLEEP_HOURS)
  const mealField = useNumField(wageSettings.mealHours ?? DEFAULT_MEAL_HOURS)
  const houseField = useNumField(wageSettings.houseworkHours ?? DEFAULT_HOUSEWORK_HOURS)
  const { value: monthlyIncome, setValue: setMonthlyIncome } = incomeField
  const { value: workDays, setValue: setWorkDays } = daysField
  const { value: workHours, setValue: setWorkHours } = hoursField
  const commuteHours = Math.min(6, commuteField.value)
  const setCommuteHours = commuteField.setValue
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMonthlyIncome(wageSettings.monthlyIncome)
    setWorkDays(wageSettings.workDays)
    setWorkHours(wageSettings.workHoursPerDay)
    setCommuteHours(wageSettings.commuteHours || 0)
    sleepField.setValue(wageSettings.sleepHours ?? DEFAULT_SLEEP_HOURS)
    mealField.setValue(wageSettings.mealHours ?? DEFAULT_MEAL_HOURS)
    houseField.setValue(wageSettings.houseworkHours ?? DEFAULT_HOUSEWORK_HOURS)
  }, [wageSettings])

  const effectiveHours = workHours + commuteHours
  const commuteTooLong = commuteField.value > 6
  const errors: string[] = []
  if (commuteTooLong) errors.push('每日往返通勤最多填 6 小时')
  if (workDays > 31) errors.push('每月工作天数不能超过 31 天')
  if (workHours > 24 || effectiveHours > 24) errors.push('每天工作时长加通勤不能超过 24 小时')
  const freeHours = 24 - sleepField.value - mealField.value - houseField.value - effectiveHours
  if (sleepField.value > 24 || mealField.value > 24 || houseField.value > 24 || freeHours < 0) errors.push('睡觉、吃饭、家务、工作和通勤加起来不能超过 24 小时')
  const inputsValid = monthlyIncome > 0 && workDays > 0 && workHours > 0 && errors.length === 0
  const hourlyRate = getHourlyWage({ monthlyIncome, workDays, workHoursPerDay: workHours, commuteHours })
  const minuteRate = hourlyRate / 60

  const [benchmarks, setBenchmarks] = useState<Benchmark[]>(() =>
    getItem<Benchmark[]>(BENCHMARKS_KEY, DEFAULT_BENCHMARKS)
  )
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')

  useEffect(() => {
    setItem(BENCHMARKS_KEY, benchmarks)
  }, [benchmarks])

  function formatCost(price: number): string {
    if (!hourlyRate) return '—'
    const hours = price / hourlyRate
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} 分钟`
    const daily = effectiveHours || 8
    if (hours < daily) return `${hours.toFixed(1)} 小时`
    return `${(hours / daily).toFixed(1)} 天`
  }

  function handleAddBenchmark() {
    const price = parseFloat(newPrice)
    const name = newName.trim()
    if (!name || !(price > 0)) return
    setBenchmarks((prev) => [...prev, { id: `c-${Date.now()}`, name, price, icon: 'sell' }])
    setNewName('')
    setNewPrice('')
    setAdding(false)
  }

  function handleSave() {
    setWageSettings({
      monthlyIncome,
      workDays,
      workHoursPerDay: workHours,
      commuteHours,
      sleepHours: sleepField.value,
      mealHours: mealField.value,
      houseworkHours: houseField.value,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2400)
  }

  function handleDemoData() {
    if (demoCleared) {
      askConfirm('将用演示数据替换当前所有账单，确定吗？', resetToDemoData, '重置')
    } else {
      askConfirm('将清除所有演示账单，从零开始记账。确定吗？', clearDemoData, '清除并开始')
    }
  }

  return (
    <div className="flex flex-col w-full pb-8">
      <div className="flex flex-col mb-space-lg">
        <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">我的时薪</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          按你的收入算出一小时值多少钱，记账时就能看到每笔花了多少时间。
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
            月收入 ÷（每月工作天数 × 每天工作时长）= 时薪
          </span>
        </div>

        <div className="flex flex-col mb-4">
          <span className="font-label-mono text-label-mono text-on-primary-container uppercase tracking-wider">当前时薪</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-metric-lg text-headline-md text-secondary-container">¥</span>
            <span className="font-metric-lg text-display-lg-mobile font-semibold tracking-tight text-on-primary">
              {hourlyRate.toFixed(2)}
            </span>
            <span className="font-body-md text-body-md text-on-primary-container">/ 小时</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-on-primary-container">
            <span className="font-label-mono text-label-mono">每分钟约</span>
            <span className="font-metric-sm text-metric-sm font-medium text-secondary-fixed">≈ ¥{minuteRate.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-3.5 space-y-2 bg-black/20 rounded-lg p-3">
          <div className="font-label-mono text-label-mono text-on-primary-container uppercase tracking-wider mb-2">
            这些东西要赚多久
          </div>
          {benchmarks.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-2 font-body-sm text-body-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[15px] text-secondary-fixed">{b.icon}</span>
                </div>
                <span className="text-on-primary truncate">
                  {b.name} (¥{b.price.toLocaleString()})
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-metric-sm text-metric-sm font-medium text-secondary-fixed whitespace-nowrap">
                  ≈ {formatCost(b.price)}
                </span>
                <button
                  onClick={() => setBenchmarks((prev) => prev.filter((x) => x.id !== b.id))}
                  className="w-5 h-5 flex items-center justify-center rounded text-on-primary-container hover:text-on-primary"
                  aria-label={`删除${b.name}`}
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            </div>
          ))}

          {adding ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="名称，如：一杯拿铁"
                className="flex-1 min-w-0 h-9 rounded bg-white/10 px-2.5 font-body-sm text-body-sm text-on-primary placeholder:text-on-primary-container focus:outline-none"
              />
              <input
                type="number"
                inputMode="decimal"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="¥价格"
                className="w-20 h-9 rounded bg-white/10 px-2.5 font-metric-sm text-metric-sm text-on-primary placeholder:text-on-primary-container focus:outline-none"
              />
              <button
                onClick={handleAddBenchmark}
                disabled={!newName.trim() || !(parseFloat(newPrice) > 0)}
                className="h-9 px-3 rounded bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold disabled:opacity-40"
              >
                添加
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full h-9 mt-1 rounded border border-dashed border-on-primary-container/40 text-on-primary-container font-label-md text-label-md flex items-center justify-center gap-1 hover:text-on-primary"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              添加物品
            </button>
          )}
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-space-md">
        <div className="bg-surface-container-lowest rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="font-headline-md text-body-lg text-on-surface font-medium">月收入</label>
            <span className="font-label-mono text-label-mono text-on-surface-variant">税后到手</span>
          </div>
          <div className="relative flex items-center mb-3">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-on-surface-variant font-metric-md text-metric-md">
              ¥
            </div>
            <input
              type="number"
              value={incomeField.text}
              onChange={(e) => incomeField.setText(e.target.value)}
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
            <span className="font-label-mono text-label-mono text-on-surface-variant">去掉周末和节假日</span>
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
                value={daysField.text}
                onChange={(e) => daysField.setText(e.target.value)}
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
            <span>参考：全年平均约 21.75 天</span>
            <button className="text-secondary hover:underline font-metric-sm text-metric-sm" onClick={() => setWorkDays(21.75)}>
              设为21.75
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="font-headline-md text-body-lg text-on-surface font-medium">每天工作时长</label>
            <span className="font-label-mono text-label-mono text-on-surface-variant">含加班</span>
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
                value={hoursField.text}
                onChange={(e) => hoursField.setText(e.target.value)}
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

        <div className="bg-surface-container-lowest rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="font-headline-md text-body-lg text-on-surface font-medium">每日往返通勤</label>
            <span className={`font-label-mono text-label-mono ${commuteTooLong ? "text-error" : "text-on-surface-variant"}`}>
              {commuteTooLong ? "最多 6 小时" : "0 表示不计入"}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-12 bg-surface-container-low rounded flex items-center justify-center gap-1.5 px-4">
              <input
                type="number"
                inputMode="decimal"
                value={commuteField.text}
                onChange={(e) => commuteField.setText(e.target.value)}
                step={0.5}
                min={0}
                max={6}
                className="bg-transparent text-center font-metric-lg text-metric-lg text-on-surface w-16 focus:outline-none"
              />
              <span className="font-body-md text-body-md text-on-surface-variant">小时 / 天</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {COMMUTE_PRESETS.map((val) => (
              <button
                key={val}
                onClick={() => setCommuteHours(val)}
                className={`py-1.5 rounded font-metric-sm text-metric-sm text-center active:scale-95 transition-all ${
                  commuteHours === val ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {val}h
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="font-headline-md text-body-lg text-on-surface font-medium">每天的时间分配</label>
            <span className="font-label-mono text-label-mono text-on-surface-variant">按工作日算</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '睡觉', field: sleepField },
              { label: '吃饭', field: mealField },
              { label: '家务', field: houseField },
            ].map(({ label, field }) => (
              <div key={label}>
                <span className="font-label-md text-label-md text-on-surface-variant block mb-1">{label}</span>
                <div className="h-12 bg-surface-container-low rounded flex items-center justify-center gap-1 px-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={field.text}
                    onChange={(e) => field.setText(e.target.value)}
                    step={0.5}
                    min={0}
                    max={24}
                    className="bg-transparent text-center font-metric-lg text-metric-lg text-on-surface w-full min-w-0 focus:outline-none"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant shrink-0">h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-space-lg">
        <button
          onClick={handleSave}
          disabled={!inputsValid}
          className="w-full h-12 bg-primary text-on-primary font-headline-md text-body-lg font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{saved ? '已保存' : '保存'}</span>
        </button>
        {errors.length > 0 ? (
          <p className="font-label-mono text-label-mono text-center text-error mt-2.5">{errors[0]}，请修改后再保存</p>
        ) : (
          <p className="font-label-mono text-label-mono text-center text-on-surface-variant mt-2.5">
            保存后，所有账单都会按 ¥{hourlyRate.toFixed(2)}/h 重新换算
          </p>
        )}
      </div>

      {/* Data management */}
      <div className="mt-space-xl bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={handleDemoData}
          className="w-full flex items-center justify-between px-4 py-3.5 active:bg-surface-container-low"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
              {demoCleared ? 'restart_alt' : 'edit_note'}
            </span>
            <div className="flex flex-col items-start">
              <span className="font-body-md text-body-md text-on-surface">
                {demoCleared ? '重置为演示数据' : '开始我的记账'}
              </span>
              {!demoCleared && (
                <span className="font-body-sm text-body-sm text-on-surface-variant">清除所有演示数据</span>
              )}
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-outline/50">chevron_right</span>
        </button>
        <button
          onClick={() => {
            restartTutorial()
            navigate('/')
          }}
          className="w-full flex items-center justify-between px-4 py-3.5 border-t border-surface-container active:bg-surface-container-low"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">school</span>
            <span className="font-body-md text-body-md text-on-surface">再看一遍新手教程</span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-outline/50">chevron_right</span>
        </button>
        <button
          onClick={() => navigate('/guide')}
          className="w-full flex items-center justify-between px-4 py-3.5 border-t border-surface-container active:bg-surface-container-low"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">menu_book</span>
            <span className="font-body-md text-body-md text-on-surface">功能一览</span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-outline/50">chevron_right</span>
        </button>
      </div>

      <div className="flex items-center gap-1 text-on-surface-variant justify-center mt-space-lg">
        <span className="material-symbols-outlined text-[16px]">lock</span>
        <span className="font-label-mono text-label-mono uppercase tracking-wider">数据只存在这台设备上，登录和云同步之后会上线</span>
      </div>
    </div>
  )
}

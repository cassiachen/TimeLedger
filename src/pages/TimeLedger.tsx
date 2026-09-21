import { useMemo, useState } from 'react'
import { useMyTime } from '../components/useMyTime'
import { getTodayKey, makeMonthDays } from '../lib/date'
import { isWorkday } from '../lib/earnings'
import {
  ACTIVITY_GROUPS,
  FREE_GROUP,
  formatMinutes,
  groupIcon,
  groupLabel,
  monthPrefix,
  sumMinutes,
  weekStartKey,
} from '../lib/time-plan'
import { getDayBreakdown } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'

const hoursText = (min: number) => `${(min / 60).toFixed(min % 60 === 0 ? 0 : 1)}h`

export function TimeLedger() {
  const { timeEntries, timeGoals, addTimeGoal, deleteTimeGoal, wageSettings, dayOverrides, deleteTimeEntry } = useLedger()
  const { openArrange, askConfirm } = useUI()
  const my = useMyTime()

  const todayKey = getTodayKey()
  const weekStart = weekStartKey()
  const month = monthPrefix()

  // 本月去向：固定的部分按设置乘以已过的天数，安排的部分按记录汇总
  const monthRows = useMemo(() => {
    const days = makeMonthDays(new Date().getFullYear(), new Date().getMonth()).filter((k) => k <= todayKey)
    const workdays = days.filter((k) => isWorkday(k, dayOverrides)).length
    const b = getDayBreakdown(wageSettings)
    const fixed = [
      { key: 'sleep', label: '睡眠', icon: 'bedtime', min: b.sleep * days.length * 60 },
      { key: 'work', label: '工作', icon: 'work_history', min: b.work * workdays * 60 },
      { key: 'commute', label: '通勤', icon: 'commute', min: b.commute * workdays * 60 },
      { key: 'meals', label: '吃饭', icon: 'restaurant', min: b.meals * days.length * 60 },
      { key: 'housework', label: '家务', icon: 'cleaning_services', min: b.housework * days.length * 60 },
    ]
    const monthEntries = timeEntries.filter((e) => e.dayKey.startsWith(month))
    const arranged = [...ACTIVITY_GROUPS.map((g) => g.key), FREE_GROUP].map((key) => ({
      key,
      label: groupLabel(key),
      icon: groupIcon(key),
      min: sumMinutes(monthEntries, (e) => e.group === key),
    }))
    const arrangedTotal = arranged.reduce((s, r) => s + r.min, 0)
    return { fixed, arranged, arrangedTotal, totalMin: days.length * 24 * 60 }
  }, [timeEntries, wageSettings, dayOverrides, month, todayKey])

  const [adding, setAdding] = useState(false)
  const [gName, setGName] = useState('')
  const [gTitle, setGTitle] = useState('')
  const [gTarget, setGTarget] = useState('')

  function saveGoal() {
    const name = gName.trim()
    const target = parseFloat(gTarget)
    if (!name || !(target > 0)) return
    addTimeGoal({ name, title: gTitle.trim() || undefined, targetHours: target })
    setGName('')
    setGTitle('')
    setGTarget('')
    setAdding(false)
  }

  const maxRow = Math.max(1, ...monthRows.fixed.map((r) => r.min), ...monthRows.arranged.map((r) => r.min))
  const inputCls =
    'h-10 px-3 rounded bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none min-w-0'

  const renderRow = (r: { key: string; label: string; icon: string; min: number }, accent: boolean) => (
    <div key={r.key} className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-body-md text-body-md text-on-surface">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{r.icon}</span>
          {r.label}
        </span>
        <span className="font-metric-sm text-metric-sm text-on-surface-variant">{hoursText(r.min)}</span>
      </div>
      <div className="w-full h-1.5 rounded bg-surface-container-low overflow-hidden">
        <div
          className={`h-full rounded ${accent ? 'bg-secondary' : 'bg-outline-variant'}`}
          style={{ width: `${r.min > 0 ? Math.max(2, (r.min / maxRow) * 100) : 0}%` }}
        />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col">
        <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">时间账本</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          钱有账本，时间也有。除了工作和生存，你的时间去了哪里？
        </p>
      </div>

      {/* 今天 */}
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-baseline justify-between">
          <span className="font-headline-md text-headline-md text-on-surface">今天</span>
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            我的时间 {formatMinutes(my.freeMin)} · 还剩 {formatMinutes(my.remainingMin)}
          </span>
        </div>
        {my.todayEntries.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">今天还没有记录。</p>
        ) : (
          <div className="flex flex-col divide-y divide-surface-container">
            {my.todayEntries.map((e) => (
              <div key={e.id} className="flex items-center gap-2 py-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{groupIcon(e.group)}</span>
                <span className="font-body-md text-body-md text-on-surface flex-1 truncate">{e.activity}</span>
                <span className="font-metric-sm text-metric-sm text-on-surface-variant">{formatMinutes(e.minutes)}</span>
                <button onClick={() => deleteTimeEntry(e.id)} className="p-0.5 text-outline hover:text-error" aria-label="删除这条记录">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={openArrange}
          className="w-full h-11 rounded-lg bg-primary text-on-primary font-body-md text-body-md font-medium flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
          记录我的时间
        </button>
      </section>

      {/* 目标 */}
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-on-surface">用时间换的目标</span>
            <span className="font-label-mono text-label-mono text-on-surface-variant">投入的每一小时，都在换一个结果</span>
          </div>
          {!adding && (
            <button onClick={() => setAdding(true)} className="font-label-md text-label-md text-secondary hover:underline">
              + 新目标
            </button>
          )}
        </div>

        {adding && (
          <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3">
            <input value={gName} onChange={(e) => setGName(e.target.value)} placeholder="花时间做什么，比如 IELTS" maxLength={12} className={inputCls} />
            <input value={gTitle} onChange={(e) => setGTitle(e.target.value)} placeholder="想换到什么（可选），比如 IELTS 7.5" maxLength={20} className={inputCls} />
            <input value={gTarget} onChange={(e) => setGTarget(e.target.value)} inputMode="decimal" placeholder="预计需要（小时）" className={inputCls} />
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 h-10 rounded bg-surface-container text-on-surface font-label-md text-label-md">
                取消
              </button>
              <button
                onClick={saveGoal}
                disabled={!gName.trim() || !(parseFloat(gTarget) > 0)}
                className="flex-1 h-10 rounded bg-primary text-on-primary font-label-md text-label-md disabled:opacity-40"
              >
                添加
              </button>
            </div>
          </div>
        )}

        {timeGoals.length === 0 && !adding && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            比如「IELTS 7.5，预计需要 120 小时」。你不是在学 IELTS，是在拿时间换 IELTS 7.5。
          </p>
        )}

        {timeGoals.map((g) => {
          const mine = timeEntries.filter((e) => e.activity === g.name)
          const total = sumMinutes(mine, () => true)
          const today = sumMinutes(mine, (e) => e.dayKey === todayKey)
          const week = sumMinutes(mine, (e) => e.dayKey >= weekStart)
          const mon = sumMinutes(mine, (e) => e.dayKey.startsWith(month))
          const remaining = Math.max(0, g.targetHours * 60 - total)
          const pct = Math.min(100, (total / (g.targetHours * 60)) * 100)
          return (
            <div key={g.id} className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface font-medium">{g.title || g.name}</span>
                <button
                  onClick={() => askConfirm(`删除目标「${g.title || g.name}」？已记录的时间不会删除。`, () => deleteTimeGoal(g.id))}
                  className="p-0.5 text-outline hover:text-error"
                  aria-label="删除目标"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              <div className="w-full h-2 rounded bg-surface-container-high overflow-hidden">
                <div className="h-full bg-secondary rounded transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 font-label-mono text-label-mono text-on-surface-variant">
                <span>预计 {g.targetHours}h</span>
                <span>已投入 {hoursText(total)}</span>
                <span>剩余 {hoursText(remaining)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-label-mono text-label-mono text-on-surface-variant">
                <span>今日 {hoursText(today)}</span>
                <span>本周 {hoursText(week)}</span>
                <span>本月 {hoursText(mon)}</span>
              </div>
            </div>
          )
        })}
      </section>

      {/* 本月去向 */}
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md text-on-surface">我的时间去了哪里</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            这个月，你把{' '}
            <span className="font-metric-sm text-metric-sm text-secondary font-medium">{hoursText(monthRows.arrangedTotal)}</span>{' '}
            给了自己。
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-label-mono text-label-mono text-on-surface-variant">我记录的</span>
          {monthRows.arranged.map((r) => renderRow(r, true))}
        </div>
      </section>

      {/* 估算的部分单独放，避免和实际记录混在一起比较 */}
      <section className="rounded-xl bg-surface-container-low p-space-lg flex flex-col gap-space-md">
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md text-on-surface">工作与生存</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            这部分是按「设置」里的时长估算的，不是实际记录。
          </span>
        </div>
        <div className="flex flex-col gap-3">{monthRows.fixed.map((r) => renderRow(r, false))}</div>
      </section>
    </div>
  )
}

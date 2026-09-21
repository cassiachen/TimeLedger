import { useEffect, useState } from 'react'
import { getTodayKey } from '../lib/date'
import { ACTIVITY_GROUPS, FREE_ACTIVITY, FREE_GROUP, formatMinutes, groupIcon } from '../lib/time-plan'
import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'
import { useMyTime } from './useMyTime'

interface Picked {
  activity: string
  group: string
}

const PRESETS = [15, 30, 60, 90, 120, 180]

function presetLabel(p: number): string {
  if (p < 60) return `${p}m`
  return `${p / 60}h`
}

export function ArrangeTimeSheet() {
  const { arrangeOpen, closeArrange, showToast } = useUI()
  const { addTimeEntry, deleteTimeEntry, timeGoals } = useLedger()
  const my = useMyTime()
  const [picked, setPicked] = useState<Picked | null>(null)
  const [minutes, setMinutes] = useState(60)
  const [custom, setCustom] = useState('')
  const [customGroup, setCustomGroup] = useState(ACTIVITY_GROUPS[0].key)

  useEffect(() => {
    if (!arrangeOpen) return
    setPicked(null)
    setCustom('')
    setMinutes(Math.min(60, Math.max(15, my.remainingMin)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrangeOpen])

  if (!arrangeOpen) return null

  const tooMuch = minutes > my.remainingMin

  function pick(activity: string, group: string) {
    setPicked({ activity, group })
    setMinutes((m) => Math.min(m, Math.max(15, my.remainingMin)))
  }

  function save() {
    if (!picked || minutes <= 0 || tooMuch) return
    addTimeEntry({ dayKey: getTodayKey(), activity: picked.activity, group: picked.group, minutes })
    showToast(`✓ 已记录 ${picked.activity} ${formatMinutes(minutes)}`)
    setPicked(null)
  }

  function leaveFree() {
    if (my.remainingMin <= 0) return
    addTimeEntry({ dayKey: getTodayKey(), activity: FREE_ACTIVITY, group: FREE_GROUP, minutes: my.remainingMin })
    showToast('✓ 剩下的时间，留给自己')
  }

  function addCustom() {
    const name = custom.trim()
    if (!name) return
    pick(name, customGroup)
    setCustom('')
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded font-body-sm text-body-sm active:scale-95 transition-all ${
      active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
    }`

  return (
    <div className="sheet-overlay show" onClick={(e) => e.target === e.currentTarget && closeArrange()}>
      <div className="sheet-content max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex flex-col">
            <h3 className="font-headline-md text-headline-md text-on-surface">今天，你的时间用在了哪里？</h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              还有{' '}
              <span className="font-metric-sm text-metric-sm text-secondary font-medium">{formatMinutes(my.remainingMin)}</span>{' '}
              可以记录
            </span>
          </div>
          <button onClick={closeArrange} className="p-1 -mr-1 text-outline hover:text-on-surface" aria-label="关闭">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {my.todayEntries.length > 0 && (
          <div className="mt-3 flex flex-col divide-y divide-surface-container rounded-lg bg-surface-container-low px-3">
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

        <div className="flex flex-col gap-4 mt-4">
          {timeGoals.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">flag</span>我的目标
              </span>
              <div className="flex flex-wrap gap-2">
                {timeGoals.map((g) => (
                  <button key={g.id} onClick={() => pick(g.name, 'growth')} className={chip(picked?.activity === g.name)}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {ACTIVITY_GROUPS.map((g) => (
            <div key={g.key} className="flex flex-col gap-2">
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">{g.icon}</span>
                {g.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {g.activities.map((a) => (
                  <button key={a} onClick={() => pick(a, g.key)} className={chip(picked?.activity === a)}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">edit</span>其他
            </span>
            <div className="flex gap-2">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                placeholder="自己写一个，比如 画画"
                maxLength={12}
                className="flex-1 min-w-0 h-10 px-3 rounded bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none"
              />
              <select
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                className="h-10 px-2 rounded bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none"
                aria-label="归到哪一类"
              >
                {ACTIVITY_GROUPS.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </select>
              <button
                onClick={addCustom}
                disabled={!custom.trim()}
                className="px-3 h-10 rounded bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-40"
              >
                选择
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">spa</span>自由
            </span>
            <button
              onClick={leaveFree}
              disabled={my.remainingMin <= 0}
              className="w-full h-11 rounded-lg bg-secondary-fixed/60 text-on-secondary-fixed font-body-md text-body-md font-medium active:scale-[0.99] transition-transform disabled:opacity-40"
            >
              {FREE_ACTIVITY}
              {my.remainingMin > 0 && `，剩下的 ${formatMinutes(my.remainingMin)} 留给自己`}
            </button>
          </div>
        </div>

        {picked && (
          <div className="sticky bottom-0 -mx-5 -mb-6 mt-4 px-5 pt-3 pb-6 bg-surface-container-lowest border-t border-surface-container flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-on-surface font-medium">{picked.activity}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMinutes((m) => Math.max(15, m - 15))}
                  className="w-8 h-8 rounded bg-surface-container flex items-center justify-center"
                  aria-label="减少 15 分钟"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="font-metric-md text-metric-md text-on-surface w-24 text-center">{formatMinutes(minutes)}</span>
                <button
                  onClick={() => setMinutes((m) => m + 15)}
                  className="w-8 h-8 rounded bg-surface-container flex items-center justify-center"
                  aria-label="增加 15 分钟"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setMinutes(p)}
                  className={`px-2.5 py-1 rounded font-metric-sm text-metric-sm ${
                    minutes === p ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {presetLabel(p)}
                </button>
              ))}
            </div>
            <button
              onClick={save}
              disabled={tooMuch || my.remainingMin <= 0}
              className="w-full h-11 rounded-lg bg-primary text-on-primary font-body-md text-body-md font-medium disabled:opacity-40 active:scale-[0.99] transition-transform"
            >
              {my.remainingMin <= 0
                ? '今天的时间都记满了'
                : tooMuch
                  ? `今天只剩 ${formatMinutes(my.remainingMin)}`
                  : '记下这一笔'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

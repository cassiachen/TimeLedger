import { Link } from 'react-router-dom'
import { formatMinutes, formatMinutesShort, groupIcon } from '../lib/time-plan'
import { useUI } from '../store/UIContext'
import { useMyTime } from './useMyTime'

/** 首页的「我的时间」：除了工作和生存，今天剩下的时间准备给谁 */
export function MyTimeCard() {
  const { openArrange } = useUI()
  const my = useMyTime()
  const shown = my.todayEntries.slice(0, 4)
  const hidden = my.todayEntries.length - shown.length
  const arrangedPct = my.freeMin > 0 ? Math.min(100, (my.arrangedMin / my.freeMin) * 100) : 0

  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">hourglass_top</span>
          <span className="font-headline-md text-headline-md text-on-surface tracking-tight">我的时间</span>
        </div>
        <Link to="/time" className="flex items-center font-label-md text-label-md text-secondary hover:underline">
          时间账本
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-body-sm text-body-sm text-on-surface-variant">今天还剩</span>
          <span className="font-metric-lg text-headline-md font-semibold text-on-surface tracking-tight">
            {formatMinutes(my.remainingMin)}
          </span>
        </div>
        <div className="w-full h-2 rounded bg-surface-container-high overflow-hidden mt-1">
          <div className="h-full bg-secondary rounded transition-all duration-500" style={{ width: `${arrangedPct}%` }} />
        </div>
        <div className="flex items-center justify-between font-label-mono text-label-mono text-on-surface-variant mt-0.5">
          <span>已安排 {formatMinutes(my.arrangedMin)}</span>
          <span>未安排 {formatMinutes(my.remainingMin)}</span>
        </div>
      </div>

      {shown.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-label-md text-label-md text-on-surface-variant">今天你计划</span>
          {shown.map((e) => (
            <div key={e.id} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{groupIcon(e.group)}</span>
              <span className="font-body-md text-body-md text-on-surface flex-1 truncate">{e.activity}</span>
              <span className="font-metric-sm text-metric-sm text-on-surface-variant">{formatMinutesShort(e.minutes)}</span>
            </div>
          ))}
          {hidden > 0 && <span className="font-label-mono text-label-mono text-outline">还有 {hidden} 项</span>}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {my.remainingMin > 0 ? '今天，你想把剩下的时间给什么？' : '今天的时间都有了去处。'}
        </p>
        <button
          onClick={openArrange}
          className="w-full h-11 rounded-lg bg-primary text-on-primary font-body-md text-body-md font-medium flex items-center justify-center gap-1.5 active:scale-[0.99] transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
          安排我的时间
        </button>
      </div>
    </section>
  )
}

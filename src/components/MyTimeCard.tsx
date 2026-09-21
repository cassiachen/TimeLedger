import { Link } from 'react-router-dom'
import { formatMinutes } from '../lib/time-plan'
import { useUI } from '../store/UIContext'
import { useMyTime } from './useMyTime'

/** 首页的「我的时间」只留一行摘要：点摘要进时间账本，点右边的按钮直接安排 */
export function MyTimeCard() {
  const { openArrange } = useUI()
  const my = useMyTime()

  return (
    <section className="rounded-xl bg-surface-container-lowest px-space-md py-3 shadow-sm flex items-center gap-3">
      <Link to="/time" className="flex items-center gap-3 flex-1 min-w-0">
        <span className="material-symbols-outlined text-secondary text-[22px]">hourglass_top</span>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-on-surface-variant">我的时间 · 时间账本</span>
          <span className="font-body-md text-body-md text-on-surface truncate">
            还剩{' '}
            <span className="font-metric-sm text-metric-sm font-semibold">{formatMinutes(my.remainingMin)}</span>
            <span className="text-on-surface-variant">　已安排 {formatMinutes(my.arrangedMin)}</span>
          </span>
        </div>
        <span className="material-symbols-outlined text-[18px] text-outline ml-auto">chevron_right</span>
      </Link>
      <button
        onClick={openArrange}
        className="shrink-0 h-9 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-medium active:scale-95 transition-transform"
      >
        安排
      </button>
    </section>
  )
}

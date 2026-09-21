import { Link } from 'react-router-dom'
import { formatMinutes } from '../lib/time-plan'
import { useUI } from '../store/UIContext'
import { useMyTime } from './useMyTime'

/** 首页的「我的时间」只留一行摘要：点摘要进时间账本，点右边的按钮直接记录今天做了什么 */
export function MyTimeCard() {
  const { openArrange } = useUI()
  const my = useMyTime()

  return (
    <section className="rounded-xl bg-surface-container-lowest px-space-md py-3 shadow-sm flex items-center gap-3">
      <Link to="/time" className="flex items-center gap-3 flex-1 min-w-0">
        <span className="material-symbols-outlined text-secondary text-[22px]">hourglass_top</span>
        <div className="flex flex-col min-w-0">
          <span className="font-body-md text-body-md text-on-surface">
            属于你的时间为{' '}
            <span className="font-metric-sm text-metric-sm font-semibold">{formatMinutes(my.freeMin)}</span>
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {my.remainingMin > 0 ? '今天，你想把剩下的时间给什么？' : '今天的时间都有了去处。'}
          </span>
        </div>
        <span className="material-symbols-outlined text-[18px] text-outline ml-auto">chevron_right</span>
      </Link>
      <button
        onClick={openArrange}
        className="shrink-0 h-9 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-medium active:scale-95 transition-transform"
      >
        记录
      </button>
    </section>
  )
}

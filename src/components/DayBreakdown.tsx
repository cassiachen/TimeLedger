import { Link } from 'react-router-dom'
import { getDayBreakdown } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

export function DayBreakdown() {
  const { wageSettings } = useLedger()
  const b = getDayBreakdown(wageSettings)
  const free = Math.max(0, b.free)

  const segments = [
    { key: 'sleep', label: '睡觉', hours: b.sleep, color: 'bg-primary-container' },
    { key: 'work', label: '工作', hours: b.work, color: 'bg-on-primary-container' },
    { key: 'commute', label: '通勤', hours: b.commute, color: 'bg-primary-fixed-dim' },
    { key: 'meals', label: '吃饭', hours: b.meals, color: 'bg-outline-variant' },
    { key: 'free', label: '自己的时间', hours: free, color: 'bg-secondary' },
  ].filter((s) => s.hours > 0)

  return (
    <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md text-on-surface tracking-tight">一天的时间</span>
          <span className="font-label-mono text-label-mono text-on-surface-variant">按工作日 24 小时算</span>
        </div>
        <Link
          to="/settings"
          className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high"
        >
          调整
        </Link>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-display-lg-mobile text-display-lg-mobile text-secondary tracking-tight">{free.toFixed(1)}</span>
        <span className="font-metric-md text-metric-md text-on-surface-variant font-medium">小时是你自己的</span>
        <span className="font-body-sm text-body-sm text-outline ml-1">占一天的 {((free / 24) * 100).toFixed(0)}%</span>
      </div>

      <div className="w-full h-3 rounded overflow-hidden flex gap-px bg-surface-container">
        {segments.map((s) => (
          <div key={s.key} className={`h-full ${s.color}`} style={{ width: `${(s.hours / 24) * 100}%` }} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center justify-between font-body-sm text-body-sm">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <span className={`w-2 h-2 rounded-sm inline-block ${s.color}`} />
              {s.label}
            </span>
            <span className="font-metric-sm text-metric-sm text-on-surface">{s.hours.toFixed(1)}h</span>
          </div>
        ))}
      </div>

      {b.free < 0 && (
        <p className="font-body-sm text-body-sm text-error">睡觉、吃饭、工作和通勤加起来超过了 24 小时，去设置里调整一下。</p>
      )}
    </section>
  )
}

import { Link } from 'react-router-dom'
import { getDayBreakdown } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

export function DayBreakdown() {
  const { wageSettings } = useLedger()
  const b = getDayBreakdown(wageSettings)
  const free = Math.max(0, b.free)

  const parts = [
    { key: 'sleep', label: '睡觉', hours: b.sleep, color: 'bg-primary-container' },
    { key: 'work', label: '工作', hours: b.work, color: 'bg-on-primary-container' },
    { key: 'commute', label: '通勤', hours: b.commute, color: 'bg-primary-fixed-dim' },
    { key: 'meals', label: '吃饭', hours: b.meals, color: 'bg-outline-variant' },
    { key: 'housework', label: '家务', hours: b.housework, color: 'bg-surface-variant' },
  ]

  return (
    <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
            一天里属于自己的时间
          </span>
          <Link to="/settings" className="font-label-md text-label-md text-secondary hover:underline">
            调整
          </Link>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight">{free.toFixed(1)}</span>
          <span className="font-metric-md text-metric-md text-secondary font-medium">小时</span>
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          占一天 24 小时的{' '}
          <span className="font-metric-sm text-metric-sm text-secondary font-medium">{((free / 24) * 100).toFixed(1)}%</span>
          （按工作日算）
        </span>
      </div>

      <div className="flex flex-col space-y-1.5 pt-1">
        <div className="w-full h-2 rounded bg-surface-container-high overflow-hidden flex">
          {parts.map((p) => (
            <div key={p.key} className={`h-full ${p.color}`} style={{ width: `${(p.hours / 24) * 100}%` }} />
          ))}
          <div className="h-full bg-secondary" style={{ width: `${(free / 24) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5 pt-2 bg-surface-container-low p-2.5 rounded-lg">
        {parts.map((p) => (
          <div key={p.key} className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${p.color}`} />
              {p.label}
            </span>
            <span className="font-metric-sm text-metric-sm text-on-surface font-medium mt-0.5 truncate">{p.hours.toFixed(1)}h</span>
          </div>
        ))}
      </div>

      {b.free < 0 && (
        <p className="font-body-sm text-body-sm text-error">睡觉、吃饭、家务、工作和通勤加起来超过了 24 小时，去设置里调整一下。</p>
      )}
    </section>
  )
}

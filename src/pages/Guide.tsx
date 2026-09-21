import { Link } from 'react-router-dom'

interface Feature {
  icon: string
  title: string
  desc: string
  to?: string
  cta?: string
}

const FEATURES: Feature[] = [
  {
    icon: 'edit_note',
    title: '记一笔',
    desc: '点底部「+」记一笔，自动换算成工作时间。',
    to: '/',
    cta: '回首页',
  },
  {
    icon: 'schedule',
    title: '算时薪',
    desc: '在设置里填月收入和工作时长，算出你一小时值多少钱。',
    to: '/settings',
    cta: '去设置',
  },
  {
    icon: 'receipt_long',
    title: '账单',
    desc: '按天看每一笔，能搜索、筛选，点一笔可修改。',
    to: '/bills',
    cta: '去账单',
  },
  {
    icon: 'bar_chart',
    title: '统计',
    desc: '按周、月、年看收入、支出和结余。',
    to: '/stats',
    cta: '去统计',
  },
  {
    icon: 'calendar_month',
    title: '时间日历',
    desc: '点一天看当天收支，可以设为休息日。',
    to: '/stats',
    cta: '去统计',
  },
  {
    icon: 'payments',
    title: '收入怎么算',
    desc: '工作日的收入按上班时间自动累计，不用手动记。',
  },
  {
    icon: 'hourglass_top',
    title: '属于你的时间',
    desc: '除去睡觉、吃饭、家务和工作，每天还剩多少。',
    to: '/settings',
    cta: '去设置',
  },
  {
    icon: 'flag',
    title: '时间账本',
    desc: '记下时间用在了哪里，也可以设目标。',
    to: '/time',
    cta: '去时间账本',
  },
]

export function Guide() {
  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col">
        <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">功能一览</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          时账能做的事，点一下就能过去。
        </p>
      </div>

      <div className="flex flex-col gap-space-sm">
        {FEATURES.map((f) => (
          <section key={f.title} className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex gap-3">
            <span className="w-9 h-9 rounded-lg bg-secondary-fixed/60 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
            </span>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="font-body-md text-body-md text-on-surface font-medium">{f.title}</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              {f.to && (
                <Link to={f.to} className="mt-0.5 flex items-center w-fit font-label-md text-label-md text-secondary hover:underline">
                  {f.cta}
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

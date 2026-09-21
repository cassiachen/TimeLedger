import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTutorial } from '../store/useTutorial'
import { useLedger } from '../store/LedgerContext'
import { useUI } from '../store/UIContext'

/** id 形如 "时间戳-随机串"，取时间戳判断是不是教程开始之后才创建的 */
const createdAfter = (id: string, ts: number) => Number(id.split('-')[0]) > ts

/** 首页的新手清单：三步上手，做完一个勾一个 */
export function StartChecklist() {
  const { onboarded, transactions, timeEntries } = useLedger()
  const { openAddModal, openArrange } = useUI()
  const { state, start, markViewed, dismiss } = useTutorial()

  // 第一次进首页（已经填完时薪）时开始教程
  useEffect(() => {
    if (onboarded && !state) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarded, state])

  // 三步都做完了，停留一会儿就自动收起
  const finished =
    !!state &&
    !state.dismissed &&
    state.viewed &&
    transactions.some((t) => createdAfter(t.id, state.startedAt)) &&
    timeEntries.some((e) => createdAfter(e.id, state.startedAt))
  useEffect(() => {
    if (!finished) return
    const timer = setTimeout(dismiss, 2500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  if (!onboarded || !state || state.dismissed) return null

  const steps = [
    {
      key: 'add',
      title: '记下第一笔',
      hint: '点底部中间的「+」，输入金额就行',
      done: transactions.some((t) => createdAfter(t.id, state.startedAt)),
      onClick: () => openAddModal('expense'),
    },
    {
      key: 'view',
      title: '看看今天花掉的时间',
      hint: '深色卡片里，是今天的消费折合成的工作时间',
      done: state.viewed,
      onClick: () => {
        document.getElementById('home-hero')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        markViewed()
      },
    },
    {
      key: 'time',
      title: '写下属于你的时间',
      hint: '除了工作和生存，你把剩下的时间用在了哪里',
      done: timeEntries.some((e) => createdAfter(e.id, state.startedAt)),
      onClick: openArrange,
    },
  ]
  const doneCount = steps.filter((s) => s.done).length
  const allDone = doneCount === steps.length

  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-headline-md text-headline-md text-on-surface">
          {allDone ? '都学会了，开始你的记账吧' : '三步上手时账'}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {doneCount}/{steps.length}
          </span>
          <button onClick={dismiss} className="p-0.5 text-outline hover:text-on-surface" aria-label="关闭新手清单">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-surface-container">
        {steps.map((s) => (
          <button key={s.key} onClick={s.onClick} className="flex items-center gap-3 py-2.5 text-left">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                s.done ? 'bg-secondary text-on-secondary' : 'border border-outline-variant'
              }`}
            >
              {s.done && <span className="material-symbols-outlined text-[14px]">check</span>}
            </span>
            <div className="flex flex-col min-w-0">
              <span className={`font-body-md text-body-md ${s.done ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                {s.title}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{s.hint}</span>
            </div>
          </button>
        ))}
      </div>
      <Link to="/guide" className="flex items-center justify-center gap-0.5 pt-1 font-label-md text-label-md text-secondary hover:underline">
        看全部功能
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      </Link>
    </section>
  )
}

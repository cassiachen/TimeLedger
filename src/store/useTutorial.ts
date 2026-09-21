import { useEffect, useState } from 'react'
import { getItem, setItem } from '../lib/storage'

const KEY = 'tl_tutorial'
const EVENT = 'tl-tutorial-change'

export interface TutorialState {
  /** 开始教程的时间；这之后记的账、写的时间才算完成对应步骤 */
  startedAt: number
  /** 看过「今天花掉的时间」了 */
  viewed: boolean
  /** 手动关掉了清单 */
  dismissed: boolean
}

function read(): TutorialState | null {
  return getItem<TutorialState | null>(KEY, null)
}

function write(next: TutorialState) {
  setItem(KEY, next)
  window.dispatchEvent(new Event(EVENT))
}

/** 重新开始教程（设置页里的「再看一遍」用） */
export function restartTutorial() {
  write({ startedAt: Date.now(), viewed: false, dismissed: false })
}

export function useTutorial() {
  const [state, setState] = useState<TutorialState | null>(read)

  useEffect(() => {
    const sync = () => setState(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return {
    state,
    start: () => write({ startedAt: Date.now(), viewed: false, dismissed: false }),
    markViewed: () => state && write({ ...state, viewed: true }),
    dismiss: () => state && write({ ...state, dismissed: true }),
  }
}

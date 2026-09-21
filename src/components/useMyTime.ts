import { useMemo } from 'react'
import { getTodayKey } from '../lib/date'
import { isWorkday } from '../lib/earnings'
import { sumMinutes } from '../lib/time-plan'
import { getDayBreakdown } from '../lib/time-value'
import { useLedger } from '../store/LedgerContext'

/** 今天「属于我的时间」有多少、已经安排了多少、还剩多少（单位：分钟） */
export function useMyTime() {
  const { wageSettings, dayOverrides, timeEntries } = useLedger()
  const todayKey = getTodayKey()
  const workday = isWorkday(todayKey, dayOverrides)
  const b = getDayBreakdown(wageSettings)
  const freeHours = workday ? b.free : 24 - b.sleep - b.meals - b.housework

  return useMemo(() => {
    const todayEntries = timeEntries.filter((e) => e.dayKey === todayKey)
    const freeMin = Math.max(0, Math.round(freeHours * 60))
    const arrangedMin = sumMinutes(todayEntries, () => true)
    return {
      isWorkday: workday,
      freeMin,
      arrangedMin,
      remainingMin: Math.max(0, freeMin - arrangedMin),
      overMin: Math.max(0, arrangedMin - freeMin),
      todayEntries,
    }
  }, [timeEntries, todayKey, freeHours, workday])
}

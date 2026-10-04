// The live coach's session values and the view model the band and pane draw from. Pure.
import type { Commitment, Data, LibEntry, Locale, Marks, Nudge, Region, Rhythm, Snapshot } from '../types'
import {
  active,
  dayKey,
  decideNudge,
  dueNotes,
  duration,
  emptyData,
  hhmmToMinute,
  lastDays,
  localeOf,
  logFor,
  minuteOfDay,
  regionOf,
  rhythmOf,
  streakOf,
  weekOf,
} from './coach'
import { tr } from './i18n'
import { tipFor, tipPool } from './library'

export const PLUGIN = 'life-coach'
export const PANE = 'life-coach'


export type Model = {
  now: number
  today: string
  locale: Locale
  region: Region
  data: Data
  marks: Marks
  rhythm: Rhythm
  nudge: Nudge | null
  commitments: { c: Commitment; isDone: boolean; streak: number }[]
  tip: LibEntry | undefined
}

export function modelOf(s: Snapshot | null, now: number, offset: number): Model {
  const today = dayKey(now)
  const data = s?.data ?? emptyData(today)
  const marks = s?.marks ?? {}
  const profile = data.profile
  const bed = profile?.bedtime ? hhmmToMinute(profile.bedtime) : null
  const rhythm = rhythmOf(marks[today] ?? [], minuteOfDay(now), bed)
  const hadLastWeek = lastDays(weekOf(today), 8)
    .slice(0, 7)
    .some(d => (marks[d]?.length ?? 0) > 0)
  const locale = localeOf(profile, s?.sys)
  const region = regionOf(profile, s?.sys)
  return {
    now,
    today,
    locale,
    region,
    data: { ...data, nudges: logFor(data.nudges, today) },
    marks,
    rhythm,
    nudge: s ? decideNudge({ now, data, rhythm, hadLastWeek }) : null,
    commitments: active(data.commitments).map(c => ({
      c,
      isDone: data.checkins[today]?.[c.id] === 'done',
      streak: streakOf(c, data.checkins, today),
    })),
    tip: tipFor(today, offset, tipPool(locale, region)),
  }
}

/** The toast a nudge earns, in the person's language. */
export function toastOf(n: Nudge, m: Model): string {
  const s = tr(m.locale)
  if (n.kind === 'break') return s.breakMsg(duration(n.minutes, m.locale))
  if (n.kind === 'bedtime') return s.bedMsg(m.data.profile?.bedtime ?? '', duration(n.minutes, m.locale))
  return s.followMsg(n.noteText)
}

export const dueOf = (m: Model) => dueNotes(m.data.notes, m.today)

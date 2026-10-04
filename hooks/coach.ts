// The coach's domain, as pure functions over plain data: days, streaks, rhythm, nudges, the context the model reads.
import type {
  CheckinStatus,
  Checkins,
  Commitment,
  Data,
  Focus,
  Locale,
  Marks,
  Meta,
  Note,
  Nudge,
  NudgeLog,
  Profile,
  Region,
  Rhythm,
} from '../types'

/** A day runs from 04:00 to 04:00 local, so 01:00 belongs to the night before. */
export const DAY_START_MIN = 240
/** A gap up to this many minutes between two things you did still counts as being there. */
export const GAP_MIN = 12
export const MAX_ACTIVE = 3
export const TOAST_BUDGET = 3
export const MILESTONES = [3, 7, 21, 30, 66, 100]
export const FOCUS: Focus[] = ['sleep', 'move', 'work', 'mind', 'money', 'connect']

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseDay = (day: string) => {
  const [y = 1970, m = 1, d = 1] = day.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

export const dayKey = (ms: number) => ymd(new Date(ms - DAY_START_MIN * 60_000))
export const minuteOfDay = (ms: number) => {
  const d = new Date(ms)
  return (d.getHours() * 60 + d.getMinutes() - DAY_START_MIN + 1440) % 1440
}
export const clockOf = (minute: number) => {
  const m = (minute + DAY_START_MIN) % 1440
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
}
export const hhmmToMinute = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return (h * 60 + m - DAY_START_MIN + 1440) % 1440
}
/** When `day` starts: its 04:00, local. */
export const dayStartMs = (day: string) => {
  const d = parseDay(day)
  d.setHours(Math.floor(DAY_START_MIN / 60), DAY_START_MIN % 60, 0, 0)
  return d.getTime()
}
export const addDays = (day: string, n: number) => {
  const d = parseDay(day)
  d.setDate(d.getDate() + n)
  return ymd(d)
}
/** 0 = Sunday */
export const weekday = (day: string) => parseDay(day).getDay()
/** The Monday that starts the week holding `day`. */
export const weekOf = (day: string) => addDays(day, -((weekday(day) + 6) % 7))
export const lastDays = (today: string, n: number) => Array.from({ length: n }, (_, i) => addDays(today, i - n + 1))

export const duration = (min: number, locale: Locale) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (locale === 'zh') return h > 0 ? `${h} 小时${m ? ` ${m} 分` : ''}` : `${m} 分钟`
  return h > 0 ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`
}

// --- who and where -------------------------------------------------------

export const newProfile = (now: number): Profile => ({
  focus: [],
  bedtime: null,
  breakEvery: null,
  locale: 'auto',
  region: 'auto',
  about: '',
  quietUntil: null,
  createdAt: now,
  updatedAt: now,
})

const CN_ZONES = new Set(['Asia/Shanghai', 'Asia/Chongqing', 'Asia/Harbin', 'Asia/Urumqi', 'Asia/Kashgar'])

const ZH_ZONES = new Set([...CN_ZONES, 'Asia/Taipei', 'Asia/Hong_Kong', 'Asia/Macau'])
export type System = { locale: Locale; region: Region }

/**
 * The machine's language and region: the POSIX locale (LC_ALL, LC_MESSAGES, LANG, as the terminal has it),
 * else the time zone. The plugin's own Intl does not see the system language.
 */
export function systemOf(posixLocale: string | undefined, timeZone: string): System {
  const tag = (posixLocale ?? '').replace(/[.@].*$/, '')
  const locale: Locale = /^zh/i.test(tag) ? 'zh' : tag && !/^(C|POSIX)$/i.test(tag) ? 'en' : ZH_ZONES.has(timeZone) ? 'zh' : 'en'
  const region: Region = /^zh_(CN|Hans)/i.test(tag) || CN_ZONES.has(timeZone) ? 'CN' : 'global'
  return { locale, region }
}

export const SYSTEM_DEFAULT: System = { locale: 'en', region: 'global' }

export function localeOf(p: Profile | null, sys: System = SYSTEM_DEFAULT): Locale {
  return p && p.locale !== 'auto' ? p.locale : sys.locale
}
export function regionOf(p: Profile | null, sys: System = SYSTEM_DEFAULT): Region {
  return p && p.region !== 'auto' ? p.region : sys.region
}

// --- commitments and streaks ---------------------------------------------

export const active = (cs: Commitment[]) => cs.filter(c => c.status === 'active')
export const isScheduled = (c: Commitment, day: string) => c.schedule === 'daily' || ![0, 6].includes(weekday(day))

/**
 * "Never miss twice": the run counts the days done and survives one missed day, not two in a row.
 * A skip is a planned rest and counts neither way; today unchecked is still open, not a miss.
 */
export function streakOf(c: Commitment, checkins: Checkins, today: string): number {
  const start = dayKey(c.createdAt)
  let count = 0
  let misses = 0
  for (let i = 0, day = today; i < 400 && day >= start; i += 1, day = addDays(day, -1)) {
    if (!isScheduled(c, day)) continue
    const status = checkins[day]?.[c.id]
    if (status === 'done') {
      count += 1
      misses = 0
    } else if (status === 'skip' || day === today) {
      continue
    } else if (++misses >= 2) {
      break
    }
  }
  return count
}

export const milestoneOf = (streak: number) => (MILESTONES.includes(streak) ? streak : null)

export function setCheckin(checkins: Checkins, day: string, id: string, status: CheckinStatus | null): Checkins {
  const today = { ...(checkins[day] ?? {}) }
  if (status) today[id] = status
  else delete today[id]
  return { ...checkins, [day]: today }
}

export const newId = (prefix: string, now: number, taken: { id: string }[]) => {
  let n = taken.length + 1
  while (taken.some(t => t.id === `${prefix}${n}`)) n += 1
  return `${prefix}${n}`
}

// --- rhythm --------------------------------------------------------------

export function addMark(marks: Marks, day: string, minute: number): Marks {
  const list = marks[day] ?? []
  if (list.includes(minute)) return marks
  return { ...marks, [day]: [...list, minute].sort((a, b) => a - b) }
}

export function mergeMarks(a: Marks, b: Marks): Marks {
  const out: Marks = { ...a }
  for (const [day, list] of Object.entries(b)) {
    out[day] = [...new Set([...(out[day] ?? []), ...list])].sort((x, y) => x - y)
  }
  return out
}

/** The shape of a day from the minutes the person did something; `now` is the minute it is, for today. */
export function rhythmOf(marks: readonly number[], now: number | null, bedtime: number | null): Rhythm {
  const segs: [number, number][] = []
  for (const m of [...marks].sort((a, b) => a - b)) {
    const last = segs[segs.length - 1]
    if (last && m - last[1] <= GAP_MIN) last[1] = m
    else segs.push([m, m])
  }
  const tail = segs[segs.length - 1]
  const isPresent = now !== null && tail !== undefined && now - tail[1] <= GAP_MIN
  return {
    activeMin: segs.reduce((s, [a, b]) => s + b - a + 1, 0),
    longestMin: Math.max(0, ...segs.map(([a, b]) => b - a + 1)),
    currentMin: isPresent && tail ? now - tail[0] + 1 : 0,
    breaks: Math.max(0, segs.length - 1),
    firstMin: segs[0]?.[0] ?? null,
    lastMin: tail?.[1] ?? null,
    lateMin: bedtime === null ? 0 : segs.reduce((s, [a, b]) => s + Math.max(0, b - Math.max(a, bedtime) + 1), 0),
    isPresent,
  }
}

// --- nudges --------------------------------------------------------------

export const emptyLog = (day: string): NudgeLog => ({
  day,
  shown: [],
  toasts: 0,
  breakSnoozeUntil: 0,
  bedtimeOff: false,
  breaksTaken: 0,
})
export const logFor = (log: NudgeLog | undefined, day: string) => (log && log.day === day ? log : emptyLog(day))

export const dueNotes = (notes: Note[], today: string) =>
  notes.filter(n => !n.isClosed && n.followUpDay !== null && n.followUpDay <= today)

type NudgeInput = {
  now: number
  data: Data
  rhythm: Rhythm
  /** whether anything happened last week, for the weekly review */
  hadLastWeek: boolean
}

/** At most one nudge at a time, the most pressing first. */
export function decideNudge({ now, data, rhythm, hadLastWeek }: NudgeInput): Nudge | null {
  const { profile, meta, notes } = data
  const today = dayKey(now)
  const minute = minuteOfDay(now)
  const log = logFor(data.nudges, today)
  const none = { minutes: 0, noteId: '', noteText: '' }

  if (!profile) return meta.onboardDismissed ? null : { kind: 'onboard', key: 'onboard', ...none }
  if (profile.quietUntil !== null && now < profile.quietUntil) return null

  if (profile.bedtime && !log.bedtimeOff && rhythm.isPresent) {
    const bed = hhmmToMinute(profile.bedtime)
    if (minute >= bed) return { kind: 'bedtime', key: `bed:${today}`, ...none, minutes: minute - bed }
  }
  if (profile.breakEvery && rhythm.currentMin >= profile.breakEvery && now >= log.breakSnoozeUntil) {
    return { kind: 'break', key: `break:${today}:${minute - rhythm.currentMin + 1}`, ...none, minutes: rhythm.currentMin }
  }
  const due = dueNotes(notes, today)[0]
  if (due) return { kind: 'followup', key: `fu:${due.id}:${today}`, ...none, noteId: due.id, noteText: due.text }

  const week = weekOf(today)
  if (hadLastWeek && meta.weeklySeen !== week && weekday(today) >= 1 && weekday(today) <= 3) {
    return { kind: 'weekly', key: `week:${week}`, ...none }
  }
  return null
}

/** Whether a nudge earns a toast: once per key, a few a day, never onboarding or the weekly review. */
export const shouldToast = (n: Nudge, log: NudgeLog) =>
  (n.kind === 'break' || n.kind === 'bedtime' || n.kind === 'followup') &&
  !log.shown.includes(n.key) &&
  log.toasts < TOAST_BUDGET

// --- what the model reads ------------------------------------------------

const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function contextText(data: Data, marks: Marks, now: number, sys: System = SYSTEM_DEFAULT): string {
  const { profile, commitments, checkins, notes } = data
  const today = dayKey(now)
  const bed = profile?.bedtime ? hhmmToMinute(profile.bedtime) : null
  const r = rhythmOf(marks[today] ?? [], minuteOfDay(now), bed)
  const en = 'en' as const
  const lines: string[] = [
    '# Coach context (life-coach plugin; local data, shown to the model only)',
    `Now: ${today} ${WEEKDAY_EN[weekday(today)]} ${clockOf(minuteOfDay(now))} local · UI language ${localeOf(profile, sys)} · region ${regionOf(profile, sys)}`,
  ]
  if (!profile) {
    lines.push('Profile: not set up yet. Learn the basics conversationally and save them with the profile tool.')
  } else {
    lines.push(
      `Profile: focus ${profile.focus.join(', ') || '(none chosen)'}; bedtime goal ${profile.bedtime ?? 'none'}; break reminder ${profile.breakEvery ? `every ${profile.breakEvery} min` : 'off'}${profile.quietUntil && profile.quietUntil > now ? '; quiet mode on' : ''}`,
      `What they told the coach: ${profile.about || '(nothing yet)'}`,
    )
  }

  const act = active(commitments)
  lines.push('', `## Commitments (${act.length}/${MAX_ACTIVE} active)`)
  if (act.length === 0) lines.push('None yet.')
  for (const c of act) {
    const week = lastDays(today, 7)
      .map(d => (!isScheduled(c, d) ? '-' : checkins[d]?.[c.id] === 'done' ? '✓' : checkins[d]?.[c.id] === 'skip' ? 's' : d === today ? '?' : '·'))
      .join('')
    lines.push(
      `- ${c.id}: "${c.text}"${c.why ? ` (why: ${c.why})` : ''}${c.evidence ? ` [evidence ${c.evidence}]` : ''} — ${c.schedule}, streak ${streakOf(c, checkins, today)}, last 7 days ${week} (✓ done, s skip, · missed, ? today open)`,
    )
  }
  const paused = commitments.filter(c => c.status !== 'active')
  if (paused.length) lines.push(`Paused/done: ${paused.map(c => `${c.id} "${c.text}" (${c.status})`).join('; ')}`)

  lines.push(
    '',
    '## Rhythm (time working in Claude Code, from their prompts; a day starts 04:00)',
    `Today: ${duration(r.activeMin, en)} active, longest stretch ${duration(r.longestMin, en)}, ${r.breaks} breaks${r.isPresent ? `, now ${duration(r.currentMin, en)} into a stretch` : ''}${bed !== null ? `, ${duration(r.lateMin, en)} past bedtime` : ''}${r.firstMin !== null ? `, first ${clockOf(r.firstMin)}` : ''}`,
  )
  for (const d of lastDays(today, 8).slice(0, 7)) {
    const x = rhythmOf(marks[d] ?? [], null, bed)
    if (x.activeMin === 0) continue
    lines.push(
      `- ${d} ${WEEKDAY_EN[weekday(d)]}: ${duration(x.activeMin, en)}, longest ${duration(x.longestMin, en)}, ${clockOf(x.firstMin ?? 0)}–${clockOf(x.lastMin ?? 0)}${x.lateMin ? `, ${duration(x.lateMin, en)} past bedtime` : ''}`,
    )
  }

  const open = notes.filter(n => !n.isClosed)
  lines.push('', '## Coach notes (open)')
  if (open.length === 0) lines.push('None.')
  for (const n of open.slice(-10)) {
    lines.push(`- ${n.id} (${dayKey(n.at)}): ${n.text}${n.followUpDay ? ` — follow up ${n.followUpDay}${n.followUpDay <= today ? ' (DUE)' : ''}` : ''}`)
  }
  return lines.join('\n')
}

export const emptyMeta = (): Meta => ({ weeklySeen: null, onboardDismissed: false })
export const emptyData = (day: string): Data => ({
  profile: null,
  commitments: [],
  checkins: {},
  notes: [],
  meta: emptyMeta(),
  nudges: emptyLog(day),
})

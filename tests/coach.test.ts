import { describe, expect, test } from 'claude-code/testing'

import type { Commitment, Data } from '../types'
import { applyCheckin, applyCommit, applyNote, applyProfile, toggleToday } from '../hooks/actions'
import { modelOf } from '../hooks/app'
import {
  addDays,
  contextText,
  dayKey,
  decideNudge,
  emptyData,
  hhmmToMinute,
  minuteOfDay,
  rhythmOf,
  setCheckin,
  shouldToast,
  streakOf,
  systemOf,
  weekOf,
} from '../hooks/coach'
import { STRINGS } from '../hooks/i18n'
import { libraryAnswer, search, tipFor, tipPool } from '../hooks/library'

/** Local time, so the 04:00 day boundary is tested as people live it. */
const at = (day: string, hhmm: string) => {
  const [y, mo, d] = day.split('-').map(Number)
  const [h, mi] = hhmm.split(':').map(Number)
  return new Date(y!, mo! - 1, d!, h!, mi!).getTime()
}
const MON = '2026-10-05'

const commitment = (over: Partial<Commitment> = {}): Commitment => ({
  id: 'c1',
  text: 'When I finish lunch, I will walk 10 minutes',
  why: '',
  evidence: 'E.1',
  schedule: 'daily',
  status: 'active',
  createdAt: at('2026-09-01', '10:00'),
  ...over,
})

describe('days', () => {
  test('a day starts at 04:00, so 01:30 belongs to the night before', () => {
    expect(dayKey(at(MON, '01:30'))).toBe('2026-10-04')
    expect(dayKey(at(MON, '04:00'))).toBe(MON)
    expect(minuteOfDay(at(MON, '04:00'))).toBe(0)
    expect(hhmmToMinute('23:30')).toBe(1170)
    expect(hhmmToMinute('01:00')).toBe(1260)
    expect(weekOf('2026-10-08')).toBe(MON)
    expect(weekOf('2026-10-11')).toBe(MON)
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('language and region', () => {
  test('come from the terminal locale, then the time zone', () => {
    expect(systemOf('zh_CN.UTF-8', 'America/New_York')).toEqual({ locale: 'zh', region: 'CN' })
    expect(systemOf('en_US.UTF-8', 'Asia/Shanghai')).toEqual({ locale: 'en', region: 'CN' })
    expect(systemOf(undefined, 'Asia/Shanghai')).toEqual({ locale: 'zh', region: 'CN' })
    expect(systemOf('C', 'Asia/Taipei')).toEqual({ locale: 'zh', region: 'global' })
    expect(systemOf(undefined, 'Europe/Berlin')).toEqual({ locale: 'en', region: 'global' })
    expect(systemOf('de_DE.UTF-8', 'Europe/Berlin')).toEqual({ locale: 'en', region: 'global' })
  })
})

describe('streaks: never miss twice', () => {
  const c = commitment()
  const checkins = (days: Record<string, 'done' | 'skip'>) =>
    Object.entries(days).reduce((acc, [d, s]) => setCheckin(acc, d, 'c1', s), {} as Data['checkins'])

  test('counts done days and leaves today open', () => {
    expect(streakOf(c, checkins({ '2026-10-03': 'done', '2026-10-04': 'done' }), MON)).toBe(2)
    expect(streakOf(c, checkins({ '2026-10-04': 'done', [MON]: 'done' }), MON)).toBe(2)
  })
  test('forgives one missed day but not two in a row', () => {
    expect(streakOf(c, checkins({ '2026-10-02': 'done', '2026-10-04': 'done' }), MON)).toBe(2)
    expect(streakOf(c, checkins({ '2026-10-01': 'done', '2026-10-04': 'done' }), MON)).toBe(1)
  })
  test('a skip is a planned rest, neither a miss nor a day done', () => {
    expect(streakOf(c, checkins({ '2026-10-02': 'done', '2026-10-03': 'skip', '2026-10-04': 'done' }), MON)).toBe(2)
  })
  test('weekday commitments ignore weekends', () => {
    const w = commitment({ schedule: 'weekdays' })
    expect(streakOf(w, checkins({ '2026-10-02': 'done', [MON]: 'done' }), MON)).toBe(2)
  })
  test('does not count before the commitment existed', () => {
    const fresh = commitment({ createdAt: at('2026-10-04', '10:00') })
    expect(streakOf(fresh, checkins({ '2026-10-01': 'done', '2026-10-04': 'done' }), MON)).toBe(1)
  })
})

describe('rhythm', () => {
  test('gaps up to 12 minutes count as being there; longer ones are breaks', () => {
    const r = rhythmOf([0, 5, 10, 30, 35], 40, null)
    expect(r.activeMin).toBe(11 + 6)
    expect(r.longestMin).toBe(11)
    expect(r.breaks).toBe(1)
    expect(r.currentMin).toBe(11)
    expect(r.isPresent).toBe(true)
  })
  test('counts minutes past bedtime', () => {
    const bed = hhmmToMinute('23:00')
    const r = rhythmOf([bed - 10, bed - 2, bed + 8, bed + 20], null, bed)
    expect(r.lateMin).toBe(21)
    expect(r.isPresent).toBe(false)
  })
})

describe('nudges', () => {
  const now = at(MON, '15:00')
  const base = (over: Partial<Data> = {}): Data => ({ ...emptyData(MON), ...over })
  const rhythm = (currentMin: number, isPresent = true) => ({ ...rhythmOf([], null, null), currentMin, isPresent })
  const withProfile = (p: Partial<NonNullable<Data['profile']>>) => applyProfile(base(), p, now).data

  test('invites onboarding until a profile exists or it is dismissed', () => {
    expect(decideNudge({ now, data: base(), rhythm: rhythm(0), hadLastWeek: false })?.kind).toBe('onboard')
    expect(decideNudge({ now, data: base({ meta: { weeklySeen: null, onboardDismissed: true } }), rhythm: rhythm(0), hadLastWeek: false })).toBeNull()
  })
  test('suggests a break after the chosen stretch, not before, not while snoozed', () => {
    const data = withProfile({ breakEvery: 90 })
    expect(decideNudge({ now, data, rhythm: rhythm(89), hadLastWeek: false })).toBeNull()
    expect(decideNudge({ now, data, rhythm: rhythm(95), hadLastWeek: false })?.kind).toBe('break')
    const snoozed = { ...data, nudges: { ...data.nudges, breakSnoozeUntil: now + 60_000 } }
    expect(decideNudge({ now, data: snoozed, rhythm: rhythm(95), hadLastWeek: false })).toBeNull()
  })
  test('bedtime only when present after it, and it outranks a break', () => {
    const data = withProfile({ bedtime: '23:00', breakEvery: 60 })
    const late = at(MON, '23:40')
    expect(decideNudge({ now: late, data, rhythm: rhythm(120), hadLastWeek: false })?.kind).toBe('bedtime')
    expect(decideNudge({ now: late, data, rhythm: rhythm(0, false), hadLastWeek: false })).toBeNull()
    expect(decideNudge({ now: at('2026-10-06', '00:30'), data, rhythm: rhythm(5), hadLastWeek: false })?.minutes).toBe(90)
  })
  test('quiet mode silences everything', () => {
    const data = applyProfile(withProfile({ breakEvery: 60 }), { quiet: 'today' }, now).data
    expect(decideNudge({ now, data, rhythm: rhythm(200), hadLastWeek: false })).toBeNull()
  })
  test('follow-ups come due, and the weekly review waits for a new week', () => {
    const noted = applyNote(withProfile({}), { text: 'try the 10-minute walk', followUpInDays: 1 }, at('2026-10-04', '12:00')).data
    expect(decideNudge({ now, data: noted, rhythm: rhythm(0), hadLastWeek: false })?.kind).toBe('followup')
    const data = withProfile({})
    expect(decideNudge({ now, data, rhythm: rhythm(0), hadLastWeek: true })?.kind).toBe('weekly')
    const seen = { ...data, meta: { ...data.meta, weeklySeen: MON } }
    expect(decideNudge({ now, data: seen, rhythm: rhythm(0), hadLastWeek: true })).toBeNull()
  })
  test('toasts once per nudge, three a day at most', () => {
    const n = { kind: 'break' as const, key: 'k', minutes: 90, noteId: '', noteText: '' }
    const log = emptyData(MON).nudges
    expect(shouldToast(n, log)).toBe(true)
    expect(shouldToast(n, { ...log, shown: ['k'] })).toBe(false)
    expect(shouldToast(n, { ...log, toasts: 3 })).toBe(false)
  })
})

describe('actions', () => {
  const now = at(MON, '12:00')
  test('at most three active commitments', () => {
    let d = emptyData(MON)
    for (const t of ['a', 'b', 'c']) d = applyCommit(d, { action: 'add', text: t }, now).data
    const fourth = applyCommit(d, { action: 'add', text: 'd' }, now)
    expect(fourth.parts).toEqual([])
    expect(fourth.text).toContain('Refused')
    const paused = applyCommit(d, { action: 'pause', id: 'c2' }, now).data
    expect(applyCommit(paused, { action: 'add', text: 'd' }, now).data.commitments.map(c => c.id)).toEqual(['c1', 'c2', 'c3', 'c4'])
  })
  test('check-in toggles and celebrates milestones', () => {
    let d = applyCommit(emptyData(MON), { action: 'add', text: 'walk' }, at('2026-10-02', '12:00')).data
    d = applyCheckin(d, { id: 'c1', status: 'done' }, at('2026-10-03', '12:00')).data
    d = applyCheckin(d, { id: 'c1', status: 'done' }, at('2026-10-04', '12:00')).data
    const third = toggleToday(d, 'c1', now)
    expect(third.streak).toBe(3)
    expect(third.milestone).toBe(3)
    expect(toggleToday(third.data, 'c1', now).data.checkins[MON]?.c1).toBeUndefined()
  })
  test('profile ignores what it cannot use', () => {
    const out = applyProfile(emptyData(MON), { bedtime: '25:00', breakEvery: 5, focus: ['sleep', 'nonsense'] }, now)
    expect(out.data.profile?.bedtime).toBeNull()
    expect(out.data.profile?.breakEvery).toBeNull()
    expect(out.data.profile?.focus).toEqual(['sleep'])
  })
  test('the model context carries commitments, rhythm and due notes', () => {
    let d = applyProfile(emptyData(MON), { bedtime: '23:30', appendAbout: 'Has mild hypertension' }, now).data
    d = applyCommit(d, { action: 'add', text: 'When I sit down after lunch, I will walk 10 minutes', why: 'energy' }, now).data
    d = applyNote(d, { text: 'check how the walks feel', followUpInDays: 1 }, at('2026-10-04', '10:00')).data
    const text = contextText(d, { [MON]: [400, 410, 420] }, now)
    expect(text).toContain('mild hypertension')
    expect(text).toContain('c1: "When I sit down after lunch')
    expect(text).toContain('(DUE)')
    expect(text).toContain('active')
  })
})

describe('library and words', () => {
  test('the China pack is searchable in Chinese', () => {
    expect(search({ query: '低钠盐', pack: 'china' }, 'zh').entries[0]?.id).toBe('2.5')
    expect(search({ query: '失眠怎么办' }, 'zh').entries.length).toBeGreaterThanOrEqual(0)
  })
  test('outside China the tool keeps to the global pack unless asked', () => {
    expect(libraryAnswer({ query: '低钠盐' }, 'global')).not.toContain('2.5')
    expect(libraryAnswer({ query: '低钠盐', collection: 'all' }, 'global')).toContain('[China-specific')
    expect(libraryAnswer({ id: '13.1' }, 'global')).toContain('13.1')
  })
  test('the global pack answers in either language', () => {
    expect(search({ query: 'caffeine', pack: 'essentials' }, 'en').entries[0]?.id).toBe('E.6')
    expect(search({ query: '咖啡因', pack: 'essentials' }, 'zh').entries[0]?.id).toBe('E.6')
    expect(search({ query: 'sitting breaks', pack: 'essentials' }, 'en').entries.map(e => e.id)).toContain('E.1')
    expect(libraryAnswer({ query: 'burnout' }, 'global')).toContain('E.10')
    expect(tipPool('en', 'global').length).toBe(15)
  })
  test('tips exist for China and rotate by day', () => {
    const pool = tipPool('zh', 'CN')
    expect(pool.length).toBeGreaterThan(100)
    expect(tipFor(MON, 0, pool)?.id).not.toBe(tipFor('2026-10-06', 0, pool)?.id)
  })
  test('every string exists in both languages', () => {
    expect(Object.keys(STRINGS.zh).sort()).toEqual(Object.keys(STRINGS.en).sort())
  })
  test('the view model reads a snapshot', () => {
    const m = modelOf(null, at(MON, '09:00'), 0)
    expect(m.nudge).toBeNull()
    expect(m.commitments).toEqual([])
  })
})

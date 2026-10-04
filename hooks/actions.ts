// What the coach's write tools and the UI's buttons do to the data. Pure: data in, data out, plus a line for the model.
import type { CheckinStatus, Commitment, Data, Focus, Profile } from '../types'
import {
  FOCUS,
  MAX_ACTIVE,
  active,
  addDays,
  dayKey,
  dayStartMs,
  milestoneOf,
  newId,
  newProfile,
  setCheckin,
  streakOf,
} from './coach'

export type Part = 'profile' | 'commitments' | 'checkins' | 'notes' | 'meta' | 'nudges'
export type Outcome = { data: Data; parts: Part[]; text: string; streak?: number; milestone?: number | null }

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined)
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/

export function applyProfile(data: Data, input: Record<string, unknown>, now: number): Outcome {
  const p: Profile = { ...(data.profile ?? newProfile(now)) }
  const changed: string[] = []
  if (Array.isArray(input.focus)) {
    p.focus = input.focus.filter((f): f is Focus => FOCUS.includes(f as Focus))
    changed.push('focus')
  }
  const bedtime = input.bedtime
  if (bedtime === null || bedtime === 'off' || (typeof bedtime === 'string' && HHMM.test(bedtime))) {
    p.bedtime = bedtime === 'off' ? null : (bedtime as string | null)
    changed.push('bedtime')
  }
  const brk = input.breakEvery
  if (brk === null || brk === 0 || (typeof brk === 'number' && brk >= 15 && brk <= 240)) {
    p.breakEvery = brk ? Math.round(brk) : null
    changed.push('breakEvery')
  }
  const about = str(input.about)
  if (about !== undefined) {
    p.about = about.slice(0, 2000)
    changed.push('about')
  }
  const appendAbout = str(input.appendAbout)
  if (appendAbout) {
    p.about = `${p.about}${p.about ? '\n' : ''}${appendAbout}`.slice(-2000)
    changed.push('about')
  }
  const region = input.region
  if (region === 'CN' || region === 'global' || region === 'auto') {
    p.region = region
    changed.push('region')
  }
  const locale = input.locale
  if (locale === 'en' || locale === 'zh' || locale === 'auto') {
    p.locale = locale
    changed.push('locale')
  }
  if (input.quiet === 'today' || input.quiet === 'off') {
    p.quietUntil = input.quiet === 'today' ? dayStartMs(addDays(dayKey(now), 1)) : null
    changed.push('quiet')
  }
  p.updatedAt = now
  return {
    data: { ...data, profile: p },
    parts: ['profile'],
    text: changed.length ? `Profile updated (${changed.join(', ')}).` : 'Nothing changed: no valid fields given.',
  }
}

export function applyCommit(data: Data, input: Record<string, unknown>, now: number): Outcome {
  const action = str(input.action) ?? 'add'
  const id = str(input.id)
  const list = data.commitments
  const done = (commitments: Commitment[], text: string): Outcome => ({ data: { ...data, commitments }, parts: ['commitments'], text })

  if (action === 'add') {
    const text = str(input.text)
    if (!text) return { data, parts: [], text: 'Refused: a commitment needs text, written as "When <situation>, I will <action>".' }
    if (active(list).length >= MAX_ACTIVE) {
      return {
        data,
        parts: [],
        text: `Refused: already ${MAX_ACTIVE} active commitments (${active(list).map(c => `${c.id} "${c.text}"`).join('; ')}). Pause or complete one first.`,
      }
    }
    const c: Commitment = {
      id: newId('c', now, list),
      text: text.slice(0, 200),
      why: (str(input.why) ?? '').slice(0, 300),
      evidence: str(input.evidence) ?? '',
      schedule: input.schedule === 'weekdays' ? 'weekdays' : 'daily',
      status: 'active',
      createdAt: now,
    }
    return done([...list, c], `Added ${c.id}: "${c.text}" (${c.schedule}). It shows in the band above the prompt for daily check-off.`)
  }

  const c = list.find(x => x.id === id)
  if (!c) return { data, parts: [], text: `No commitment ${id ?? '(no id)'}; existing: ${list.map(x => x.id).join(', ') || 'none'}.` }
  if (action === 'remove') return done(list.filter(x => x.id !== c.id), `Removed ${c.id}.`)
  const status = action === 'pause' ? 'paused' : action === 'complete' ? 'done' : action === 'resume' ? 'active' : c.status
  if (status === 'active' && c.status !== 'active' && active(list).length >= MAX_ACTIVE) {
    return { data, parts: [], text: `Refused: already ${MAX_ACTIVE} active commitments.` }
  }
  const next: Commitment = {
    ...c,
    status,
    text: action === 'update' ? (str(input.text) ?? c.text).slice(0, 200) : c.text,
    why: action === 'update' ? (str(input.why) ?? c.why) : c.why,
    evidence: action === 'update' ? (str(input.evidence) ?? c.evidence) : c.evidence,
    schedule: action === 'update' && (input.schedule === 'daily' || input.schedule === 'weekdays') ? input.schedule : c.schedule,
  }
  return done(list.map(x => (x.id === c.id ? next : x)), `${c.id} is now ${next.status}: "${next.text}".`)
}

export function applyCheckin(data: Data, input: Record<string, unknown>, now: number): Outcome {
  const id = str(input.id)
  const c = data.commitments.find(x => x.id === id)
  if (!c) return { data, parts: [], text: `No commitment ${id ?? '(no id)'}.` }
  const today = dayKey(now)
  const day = input.day === 'yesterday' ? addDays(today, -1) : today
  const status = input.status === 'skip' ? 'skip' : input.status === 'undo' ? null : 'done'
  const checkins = setCheckin(data.checkins, day, c.id, status as CheckinStatus | null)
  const note = str(input.note)
  const notes = note
    ? [...data.notes, { id: newId('n', now, data.notes), at: now, text: `${c.id} check-in: ${note}`, followUpDay: null, isClosed: true }]
    : data.notes
  const streak = streakOf(c, checkins, today)
  return {
    data: { ...data, checkins, notes },
    parts: note ? ['checkins', 'notes'] : ['checkins'],
    text: `${c.id} ${status ?? 'cleared'} for ${day}. Streak ${streak} (never miss twice: one missed day is forgiven).`,
    streak,
    milestone: status === 'done' ? milestoneOf(streak) : null,
  }
}

/** The band's and pane's one-key check-off: done today, or undo it. */
export const toggleToday = (data: Data, id: string, now: number) =>
  applyCheckin(data, { id, status: data.checkins[dayKey(now)]?.[id] === 'done' ? 'undo' : 'done' }, now)

export function applyNote(data: Data, input: Record<string, unknown>, now: number): Outcome {
  const close = str(input.closeId)
  if (close) {
    const notes = data.notes.map(n => (n.id === close ? { ...n, isClosed: true } : n))
    return { data: { ...data, notes }, parts: ['notes'], text: `Closed ${close}.` }
  }
  const snooze = str(input.snoozeId)
  if (snooze) {
    const notes = data.notes.map(n => (n.id === snooze ? { ...n, followUpDay: addDays(dayKey(now), 1) } : n))
    return { data: { ...data, notes }, parts: ['notes'], text: `Moved ${snooze} to tomorrow.` }
  }
  const text = str(input.text)
  if (!text) return { data, parts: [], text: 'Refused: a note needs text.' }
  const days = Number(input.followUpInDays)
  const followUpDay = Number.isFinite(days) && days > 0 ? addDays(dayKey(now), Math.min(60, Math.round(days))) : null
  const note = { id: newId('n', now, data.notes), at: now, text: text.slice(0, 500), followUpDay, isClosed: false }
  const notes = [...data.notes, note].slice(-100)
  return {
    data: { ...data, notes },
    parts: ['notes'],
    text: `Saved ${note.id}${followUpDay ? `; the coach will check back on ${followUpDay}` : ''}.`,
  }
}

// How the coach's data sits in this machine's plugin store, shared by every Claude Code session.
import type { Checkins, Commitment, Data, Meta, Note, NudgeLog, Profile } from '../types'
import type { Part } from './actions'
import { dayKey, emptyMeta, logFor } from './coach'

export const PARTS: Part[] = ['profile', 'commitments', 'checkins', 'notes', 'meta', 'nudges']
/** Rhythm marks live under one key per day and session, so sessions running side by side never overwrite each other. */
export const actKey = (day: string, sid: string) => `act:${day}:${sid}`
export const dayOfActKey = (key: string) => (key.startsWith('act:') ? (key.split(':')[1] ?? '') : null)
export const KEEP_MARK_DAYS = 15
export const KEEP_CHECKIN_DAYS = 400

/** The stored values, in PARTS order, as data. */
export function dataFrom(values: readonly unknown[], now: number): Data {
  const [profile, commitments, checkins, notes, meta, nudges] = values
  return {
    profile: (profile as Profile | undefined) ?? null,
    commitments: (commitments as Commitment[] | undefined) ?? [],
    checkins: (checkins as Checkins | undefined) ?? {},
    notes: (notes as Note[] | undefined) ?? [],
    meta: { ...emptyMeta(), ...((meta as Meta | undefined) ?? {}) },
    nudges: logFor(nudges as NudgeLog | undefined, dayKey(now)),
  }
}

export const trimCheckins = (checkins: Checkins, oldest: string): Checkins =>
  Object.fromEntries(Object.entries(checkins).filter(([day]) => day >= oldest))

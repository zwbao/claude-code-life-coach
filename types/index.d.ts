export type Locale = 'en' | 'zh'
export type Region = 'CN' | 'global'
export type Text2 = { en: string; zh: string }

/** One entry of the China pack (《高性价比人生指南》), Chinese only. */
export type Entry = {
  id: string
  sec: number
  n: number
  title: string
  cost: string
  human: string
  gain: string
  grade: string
  src: string
  note: string
  money: string
  time: string
  will: string
  level: string
  lens: string
  dispute: boolean
  todo: boolean
  ratio: string
}

export type Chapter = { n: number; title: string; intro: string; entries: Entry[] }

/** One entry of the global essentials pack, bilingual. */
export type PackEntry = {
  id: string
  area: 'move' | 'sleep' | 'work' | 'mind' | 'habits' | 'connect'
  title: Text2
  cost: Text2
  human: Text2
  gain: Text2
  grade: 'A' | 'B' | 'C'
  src: string
  note: Text2
  money: string
  time: string
  will: string
  level: string
  lens: string
}

/** A library entry as shown, in one language. */
export type LibEntry = {
  id: string
  pack: 'essentials' | 'china'
  group: string
  groupLabel: string
  title: string
  cost: string
  human: string
  gain: string
  grade: string
  src: string
  note: string
  ratio: string
  lens: string
  money: string
  time: string
  will: string
  dispute: boolean
}

export type Focus = 'sleep' | 'move' | 'work' | 'mind' | 'money' | 'connect'

export type Profile = {
  focus: Focus[]
  /** 'HH:MM' local, or null for no bedtime reminder */
  bedtime: string | null
  /** minutes of unbroken work before a break nudge, or null for none */
  breakEvery: number | null
  locale: 'auto' | Locale
  region: 'auto' | Region
  /** what the coach keeps about the person, in their words */
  about: string
  /** no proactive nudges until this time (epoch ms) */
  quietUntil: number | null
  createdAt: number
  updatedAt: number
}

export type Commitment = {
  id: string
  /** "When X, I will Y" */
  text: string
  why: string
  /** a library entry id backing it, or '' */
  evidence: string
  schedule: 'daily' | 'weekdays'
  status: 'active' | 'paused' | 'done'
  createdAt: number
}

export type CheckinStatus = 'done' | 'skip'
/** day ('YYYY-MM-DD', a day starts at 04:00) → commitment id → status */
export type Checkins = Record<string, Record<string, CheckinStatus>>

export type Note = { id: string; at: number; text: string; followUpDay: string | null; isClosed: boolean }

export type Meta = { weeklySeen: string | null; onboardDismissed: boolean }

/** Today's nudge bookkeeping, shared by every session. */
export type NudgeLog = {
  day: string
  shown: string[]
  toasts: number
  breakSnoozeUntil: number
  bedtimeOff: boolean
  breaksTaken: number
}

export type Data = {
  profile: Profile | null
  commitments: Commitment[]
  checkins: Checkins
  notes: Note[]
  meta: Meta
  nudges: NudgeLog
}

/** Minutes since the day's 04:00 at which the person did something, per day. */
export type Marks = Record<string, number[]>

export type Snapshot = { data: Data; marks: Marks; refreshedAt: number; sys: { locale: Locale; region: Region } }

export type Rhythm = {
  activeMin: number
  longestMin: number
  currentMin: number
  breaks: number
  firstMin: number | null
  lastMin: number | null
  lateMin: number
  isPresent: boolean
}

export type NudgeKind = 'onboard' | 'bedtime' | 'break' | 'followup' | 'weekly'
export type Nudge = { kind: NudgeKind; key: string; minutes: number; noteId: string; noteText: string }

/** Which tab the pane shows, and the library entry opened over it, if any. */
export type CoachView = { tab: 'today' | 'week' | 'me'; entryId: string | null }

declare module 'claude-code' {
  interface PluginState {
    'life-coach': {
      view: CoachView
      snap: Snapshot | null
      tick: number
      tipOffset: number
    }
  }
}

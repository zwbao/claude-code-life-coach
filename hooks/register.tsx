import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderSurface } from 'claude-code'

import type { CoachView, Data, LibEntry, Marks, Snapshot } from '../types'
import { applyCheckin, applyCommit, applyNote, applyProfile, toggleToday } from './actions'
import type { Outcome, Part } from './actions'
import { PANE, PLUGIN, modelOf, toastOf } from './app'
import type { Model } from './app'
import {
  MAX_ACTIVE,
  addDays,
  contextText,
  dayKey,
  lastDays,
  logFor,
  mergeMarks,
  minuteOfDay,
  SYSTEM_DEFAULT,
  systemOf,
  shouldToast,
  weekOf,
} from './coach'
import { tr } from './i18n'
import { entryOf, libraryAnswer } from './library'
import { KEEP_CHECKIN_DAYS, KEEP_MARK_DAYS, PARTS, actKey, dataFrom, dayOfActKey, trimCheckins } from './store'
import { bandTree, fit, paneTree } from './ui'
import type { Actions } from './ui'

/** What Claude knows about being the coach. The tools are deferred, so this text is the whole brief. */
const BRIEF = `# Life coach (life-coach plugin)
You are also this person's life coach. Switch into coach mode when they talk about sleep, energy, exercise, health, stress, mood, burnout, money, work rhythm, relationships or habits, or when a prompt arrives through /coach (it then carries their coach context).
In coach mode:
- Know them first: call mcp__life-coach__context unless the context is already attached.
- Be concrete and evidence-graded. Search mcp__life-coach__library and cite entry ids and sources; when the library has nothing, say you are answering from general knowledge. Say plainly when something needs a doctor or professional help.
- Propose one small next step. If they agree, save it with mcp__life-coach__commit as an if-then plan in their language ("When <situation>, I will <action>"; 中文：「当……时，我就……」), at most 3 active.
- Record progress with mcp__life-coach__checkin, facts about them with mcp__life-coach__profile, and anything worth checking back on with mcp__life-coach__note (followUpInDays).
- Style: warm, brief, specific; no lecturing, no scare tactics; celebrate real progress and name the evidence behind it. Reply in the person's language.
- The China pack applies to mainland China only; don't apply its laws or numbers elsewhere.
While they are coding, don't bring up life topics unless they do.`

const FRAME = '[life-coach] The person opened a coaching conversation with /coach. Their coach context is below: use it, do not recite it back.'

const TOOLS = [
  {
    name: 'context',
    description: "Read the person's coach context: profile, active commitments with streaks, today's and this week's work rhythm in Claude Code, open coach notes and due follow-ups. Call before coaching.",
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'profile',
    description: 'Update what the coach knows and the reminder settings. Only pass fields to change.',
    inputSchema: {
      type: 'object',
      properties: {
        focus: { type: 'array', items: { type: 'string', enum: ['sleep', 'move', 'work', 'mind', 'money', 'connect'] } },
        bedtime: { type: ['string', 'null'], description: '"HH:MM" local time to be done for the night, or null for no reminder' },
        breakEvery: { type: ['integer', 'null'], description: 'minutes of unbroken work before a break nudge (15-240), or null' },
        appendAbout: { type: 'string', description: 'a fact about them to remember, in their words (age range, health conditions, goals, constraints)' },
        about: { type: 'string', description: 'replace everything remembered about them' },
        region: { type: 'string', enum: ['auto', 'CN', 'global'] },
        locale: { type: 'string', enum: ['auto', 'en', 'zh'], description: 'UI language of the band and pane' },
        quiet: { type: 'string', enum: ['today', 'off'], description: 'silence proactive nudges until 04:00 tomorrow' },
      },
    },
  },
  {
    name: 'commit',
    description: 'Add or change a commitment. Write text as an if-then plan in their language ("When <situation>, I will <action>" / 「当……时，我就……」). At most 3 active; it appears above the prompt for one-key daily check-off.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['add', 'update', 'pause', 'resume', 'complete', 'remove'] },
        id: { type: 'string', description: 'commitment id (c1, c2...) for anything but add' },
        text: { type: 'string' },
        why: { type: 'string', description: 'their own reason, in their words' },
        evidence: { type: 'string', description: 'library entry id backing it, e.g. "E.1" or "2.5"' },
        schedule: { type: 'string', enum: ['daily', 'weekdays'] },
      },
      required: ['action'],
    },
  },
  {
    name: 'checkin',
    description: 'Record that they did (or deliberately skipped) a commitment. Streaks follow "never miss twice".',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string', enum: ['done', 'skip', 'undo'] },
        day: { type: 'string', enum: ['today', 'yesterday'] },
        note: { type: 'string', description: 'how it went, if they said' },
      },
      required: ['id', 'status'],
    },
  },
  {
    name: 'note',
    description: 'Remember something from the conversation; with followUpInDays the coach raises it again on that day. closeId closes a note.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        followUpInDays: { type: 'integer', minimum: 1, maximum: 60 },
        closeId: { type: 'string' },
      },
    },
  },
  {
    name: 'library',
    description:
      "Search the coach's evidence library: Essentials (global, bilingual) and the China pack (《高性价比人生指南》, 544 entries, mainland China). Each entry has cost, a plain-language summary, the evidence with numbers, grade A/B/C and original sources. No arguments lists the collections.",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'words in English or Chinese, e.g. "sitting breaks", "caffeine sleep", "欠薪"' },
        id: { type: 'string', description: 'entry ids to fetch, comma separated, e.g. "E.1,13.1"' },
        collection: { type: 'string', enum: ['essentials', 'china', 'all'], description: "defaults by the person's region" },
        grade: { type: 'string', enum: ['A', 'B', 'C'] },
        limit: { type: 'integer', minimum: 1, maximum: 15 },
      },
    },
  },
] as const

const WRITES: Record<string, (data: Data, input: Record<string, unknown>, now: number) => Outcome> = {
  profile: applyProfile,
  commit: applyCommit,
  checkin: applyCheckin,
  note: applyNote,
}

const SUBCOMMANDS: Record<string, 'today' | 'week' | 'tip' | 'me' | 'setup' | 'quiet' | 'forget'> = {
  today: 'today',
  今天: 'today',
  week: 'week',
  本周: 'week',
  周: 'week',
  tip: 'tip',
  今日一条: 'tip',
  me: 'me',
  settings: 'me',
  我: 'me',
  设置: 'me',
  setup: 'setup',
  quiet: 'quiet',
  安静: 'quiet',
  forget: 'forget',
}

type Engine = EngineInterface

// The session's values, held by the host so a hot reload keeps them; drawing subscribes to them.
const view = atom({ plugin: 'life-coach', key: 'view' } as const, { tab: 'today', entryId: null } as CoachView)
const snap = atom({ plugin: 'life-coach', key: 'snap' } as const, null as Snapshot | null)
const tick = atom({ plugin: 'life-coach', key: 'tick' } as const, 0)
const tipOffset = atom({ plugin: 'life-coach', key: 'tipOffset' } as const, 0)

// --- the store (this machine), every session sharing it ------------------

async function loadData($: Engine, now: number): Promise<Data> {
  const values: unknown[] = []
  for (const part of PARTS) values.push(await $.store.get(part))
  return dataFrom(values, now)
}

async function saveParts($: Engine, data: Data, parts: readonly Part[]): Promise<void> {
  for (const part of new Set(parts)) {
    const value = data[part]
    if (value === null) await $.store.delete(part)
    else await $.store.set(part, value)
  }
}

async function loadMarks($: Engine, days: readonly string[]): Promise<Marks> {
  const wanted = new Set(days)
  let marks: Marks = {}
  for (const key of await $.store.keys()) {
    const day = dayOfActKey(key)
    if (day === null || !wanted.has(day)) continue
    marks = mergeMarks(marks, { [day]: ((await $.store.get(key)) as number[] | undefined) ?? [] })
  }
  return marks
}

async function markNow($: Engine, now: number): Promise<{ day: string; minute: number }> {
  const day = dayKey(now)
  const minute = minuteOfDay(now)
  const key = actKey(day, await $.session.id())
  const list = ((await $.store.get(key)) as number[] | undefined) ?? []
  if (!list.includes(minute)) await $.store.set(key, [...list, minute])
  return { day, minute }
}

async function prune($: Engine, now: number): Promise<void> {
  const today = dayKey(now)
  const oldest = addDays(today, -KEEP_MARK_DAYS)
  for (const key of await $.store.keys()) {
    const day = dayOfActKey(key)
    if (day !== null && day < oldest) await $.store.delete(key)
  }
  const checkins = (await $.store.get('checkins')) as Data['checkins'] | undefined
  if (checkins) {
    const kept = trimCheckins(checkins, addDays(today, -KEEP_CHECKIN_DAYS))
    if (Object.keys(kept).length !== Object.keys(checkins).length) await $.store.set('checkins', kept)
  }
}

// --- the session's picture of it ----------------------------------------

async function refresh($: Engine): Promise<Snapshot> {
  const now = await $.clock.now()
  const posix = (await $.env.get('LC_ALL')) || (await $.env.get('LC_MESSAGES')) || (await $.env.get('LANG'))
  const next: Snapshot = {
    data: await loadData($, now),
    marks: await loadMarks($, lastDays(dayKey(now), 15)),
    refreshedAt: now,
    sys: systemOf(posix, Intl.DateTimeFormat().resolvedOptions().timeZone),
  }
  await update($, snap, () => next)
  return next
}

/** Read the store fresh, apply one change, write back only what changed. */
async function mutate($: Engine, change: (data: Data, now: number) => Outcome): Promise<Outcome> {
  const now = await $.clock.now()
  const out = change(await loadData($, now), now)
  if (out.parts.length > 0) {
    await saveParts($, out.data, out.parts)
    await update($, snap, s => ({ data: out.data, marks: s?.marks ?? {}, refreshedAt: now, sys: s?.sys ?? SYSTEM_DEFAULT }))
  }
  return out
}

async function currentModel($: Engine): Promise<Model> {
  return modelOf(await read($, snap), await $.clock.now(), await read($, tipOffset))
}

/** Start a coaching turn in the person's own words; the prompt.submit hook attaches their context. */
function coachSays($: Engine, text: string): void {
  void $.prompt.submit({ text, asUser: true })
}

async function openPane($: Engine, tab?: CoachView['tab'], entryId: string | null = null): Promise<void> {
  await update($, view, v => ({ tab: tab ?? v.tab, entryId }))
  const m = await currentModel($)
  await $.ui.open({ id: PANE, title: tr(m.locale).name, focus: true, rows: 26, columns: 76 })
}

/** A nudge earns one toast, at a pause, within the day's budget; the record is shared by every session. */
async function maybeToast($: Engine): Promise<void> {
  const m = await currentModel($)
  const n = m.nudge
  if (!n || !shouldToast(n, m.data.nudges)) return
  const out = await mutate($, data => {
    const log = logFor(data.nudges, m.today)
    if (log.shown.includes(n.key)) return { data, parts: [], text: '' }
    return { data: { ...data, nudges: { ...log, shown: [...log.shown, n.key], toasts: log.toasts + 1 } }, parts: ['nudges'], text: '' }
  })
  if (out.parts.length > 0) $.ui.toast(toastOf(n, m))
}

const changeLog = (patch: (log: Data['nudges'], now: number) => Partial<Data['nudges']>) => (d: Data, now: number): Outcome => {
  const log = logFor(d.nudges, dayKey(now))
  return { data: { ...d, nudges: { ...log, ...patch(log, now) } }, parts: ['nudges'], text: '' }
}
const changeMeta = (patch: Partial<Data['meta']>) => (d: Data): Outcome => ({ data: { ...d, meta: { ...d.meta, ...patch } }, parts: ['meta'], text: '' })

async function toggle($: Engine, id: string): Promise<void> {
  const out = await mutate($, (d, now) => toggleToday(d, id, now))
  const m = await currentModel($)
  const s = tr(m.locale)
  const c = m.data.commitments.find(x => x.id === id)
  if (!c) return
  if (m.data.checkins[m.today]?.[id] !== 'done') return $.ui.toast(s.unchecked(fit(c.text, 50)))
  const line = s.checked(fit(c.text, 40), out.streak ?? 0)
  $.ui.toast(out.milestone ? `${line} — ${s.milestone[out.milestone] ?? ''}` : line)
}

const LANGUAGE_QUESTION = 'Which language should your coach speak? · 教练用哪种语言？'
const LANGUAGES = ['English', '中文'] as const

async function runOnboarding($: Engine): Promise<void> {
  const pick = (answer: string, options: readonly string[]) => options.indexOf(answer)
  try {
    const lang = await $.ui.ask(LANGUAGE_QUESTION, { options: LANGUAGES, header: 'Language' })
    await mutate($, (d, now) => applyProfile(d, { locale: lang === '中文' ? 'zh' : 'en' }, now))
    const s = tr((await currentModel($)).locale)
    const focus = await $.ui.ask(s.qFocus, { options: s.qFocusOptions, header: s.qFocusHeader, multiSelect: true })
    const FOCUS_OF = [['sleep'], ['move'], ['work', 'mind'], ['money']]
    const picked = focus.split(', ')
    const chosen = s.qFocusOptions.flatMap((o, i) => (picked.includes(o) ? FOCUS_OF[i] ?? [] : []))
    await mutate($, (d, now) => applyProfile(d, { focus: chosen, ...(chosen.length === 0 && focus.trim() ? { appendAbout: focus } : {}) }, now))

    const bed = pick(await $.ui.ask(s.qBed, { options: s.qBedOptions, header: s.qBedHeader }), s.qBedOptions)
    await mutate($, (d, now) => applyProfile(d, { bedtime: ['23:00', '00:00', '01:00'][bed] ?? null }, now))

    const brk = pick(await $.ui.ask(s.qBreak, { options: s.qBreakOptions, header: s.qBreakHeader }), s.qBreakOptions)
    await mutate($, (d, now) => applyProfile(d, { breakEvery: [50, 90, 120][brk] ?? null }, now))

    const go = await $.ui.ask(s.qStart, { options: s.qStartOptions, header: s.qStartHeader })
    $.ui.toast(s.setupDone)
    if (go === s.qStartOptions[0]) coachSays($, s.pFirst)
  } catch {
    // Dismissed part way, or no dialog here: keep what was answered, keep the invitation, say where else to go.
    $.ui.toast(tr((await currentModel($)).locale).setupLater)
  }
}

async function erase($: Engine): Promise<void> {
  const s = tr((await currentModel($)).locale)
  try {
    if ((await $.ui.ask(s.eraseAsk, [s.eraseYes, s.eraseNo])) !== s.eraseYes) return
  } catch {
    return
  }
  for (const key of await $.store.keys()) await $.store.delete(key)
  await refresh($)
  $.ui.toast(s.erased)
}

async function copyData($: Engine, surface: RenderSurface): Promise<void> {
  const all: Record<string, unknown> = {}
  for (const key of await $.store.keys()) all[key] = await $.store.get(key)
  const res = await $.ui.copy({ text: JSON.stringify(all, null, 2), surface })
  if (res.isCopied) $.ui.toast(tr((await currentModel($)).locale).copied)
}

async function commitFrom($: Engine, e: LibEntry): Promise<void> {
  const s = tr((await currentModel($)).locale)
  const out = await mutate($, (d, now) => applyCommit(d, { action: 'add', text: e.title, evidence: e.id }, now))
  $.ui.toast(out.parts.length > 0 ? s.committed(fit(e.title, 60)) : s.full(MAX_ACTIVE))
}

async function runWrite($: Engine, name: string, input: Record<string, unknown>): Promise<{ result: string }> {
  const apply = WRITES[name]
  if (!apply) return { result: `Unknown tool ${name}.` }
  const out = await mutate($, (data, now) => apply(data, input, now))
  if (name === 'checkin' && out.milestone) $.ui.toast(tr((await currentModel($)).locale).milestone[out.milestone] ?? '')
  return { result: out.text }
}

/** Every press the band and pane offer, bound to this session's engine. */
function actionsFor($: Engine, m: Model, surface: RenderSurface): Actions {
  const s = tr(m.locale)
  return {
    toggle: id => toggle($, id),
    onboard: () => runOnboarding($),
    dismissOnboard: () => mutate($, changeMeta({ onboardDismissed: true })),
    breakGo: async () => {
      const out = await mutate($, changeLog((log, now) => ({ breaksTaken: log.breaksTaken + 1, breakSnoozeUntil: now + 20 * 60_000 })))
      $.ui.toast(s.breakTaken(out.data.nudges.breaksTaken))
    },
    breakLater: () => mutate($, changeLog((_, now) => ({ breakSnoozeUntil: now + 30 * 60_000 }))),
    bedNow: async () => {
      await mutate($, changeLog(() => ({ bedtimeOff: true })))
      $.ui.toast(s.goodNight)
    },
    bedSkip: () => mutate($, changeLog(() => ({ bedtimeOff: true }))),
    followTalk: async (noteId, text) => {
      await mutate($, (d, now) => applyNote(d, { snoozeId: noteId }, now))
      coachSays($, s.pFollow(text))
    },
    followLater: noteId => mutate($, (d, now) => applyNote(d, { snoozeId: noteId }, now)),
    followDone: noteId => mutate($, (d, now) => applyNote(d, { closeId: noteId }, now)),
    weeklyOpen: async () => {
      await mutate($, changeMeta({ weeklySeen: weekOf(m.today) }))
      await openPane($, 'week')
    },
    weeklyCoach: async () => {
      await mutate($, changeMeta({ weeklySeen: weekOf(m.today) }))
      coachSays($, s.pWeekly)
    },
    openEntry: id => openPane($, undefined, id),
    closeEntry: () => update($, view, v => ({ ...v, entryId: null })),
    tipNext: () => update($, tipOffset, k => k + 1),
    tab: tab => update($, view, () => ({ tab, entryId: null })),
    commitFrom: e => commitFrom($, e),
    askAbout: e => $.prompt.fill({ text: `/coach ${s.pAbout(e.id, e.title)}`, mode: 'replace' }),
    talk: () => $.prompt.fill({ text: '/coach ', mode: 'replace' }),
    say: text => coachSays($, text),
    setProfile: input => mutate($, (d, now) => applyProfile(d, input, now)),
    copyData: () => copyData($, surface),
    erase: () => erase($),
  }
}

export const register: Register = on => {
  let isWorking = false

  on('session.start', async ($, e, next) => {
    for (const tool of TOOLS) await $.tool.register({ ...tool, inputSchema: { ...tool.inputSchema } })
    const s = tr((await currentModel($)).locale)
    await $.command.register({ name: 'coach', description: s.cmdDesc, argumentHint: s.cmdHint })

    await prune($, await $.clock.now())
    await refresh($)

    // A minute hand for the band; a fresh read now and then picks up what other sessions wrote.
    let minutes = 0
    $.clock.every(60_000, async () => {
      minutes += 1
      if (minutes % 3 === 0) await refresh($)
      await update($, tick, t => t + 1)
      if (!isWorking) await maybeToast($)
    })

    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    return { sections: [...composed.sections, { id: `${PLUGIN}:coach`, text: BRIEF, scope: 'session' as const }] }
  })

  on('prompt.submit', async ($, e, next) => {
    const isOwn = e.origin.kind === 'plugin' && e.origin.name === PLUGIN
    if (e.origin.kind !== 'composer' && !isOwn) return next(e)
    const now = await $.clock.now()
    const { day, minute } = await markNow($, now)
    await update($, snap, s => (s ? { ...s, marks: { ...s.marks, [day]: [...new Set([...(s.marks[day] ?? []), minute])] } } : s))
    void maybeToast($)
    if (!isOwn) return next(e)
    const s = await read($, snap)
    const context = s ? contextText(s.data, s.marks, now, s.sys) : 'Coach context unavailable.'
    return next({ ...e, context: [...(e.context ?? []), `${FRAME}\n\n${context}`] })
  })

  on('turn.start', ($, e, next) => {
    isWorking = true
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (!e.agentId) {
      isWorking = false
      await maybeToast($)
    }
    return done
  })

  on('tool.call', { tool: 'mcp__life-coach__context' }, async $ => {
    const s = await refresh($)
    return { result: contextText(s.data, s.marks, await $.clock.now(), s.sys) }
  })

  on('tool.call', { tool: 'mcp__life-coach__library' }, async ($, e) => {
    const m = await currentModel($)
    return { result: libraryAnswer(e as unknown as Record<string, unknown>, m.region) }
  })

  on('tool.call', { tool: 'mcp__life-coach__profile' }, ($, e) => runWrite($, 'profile', e as unknown as Record<string, unknown>))
  on('tool.call', { tool: 'mcp__life-coach__commit' }, ($, e) => runWrite($, 'commit', e as unknown as Record<string, unknown>))
  on('tool.call', { tool: 'mcp__life-coach__checkin' }, ($, e) => runWrite($, 'checkin', e as unknown as Record<string, unknown>))
  on('tool.call', { tool: 'mcp__life-coach__note' }, ($, e) => runWrite($, 'note', e as unknown as Record<string, unknown>))

  on('command.run', { command: 'coach' }, async ($, e) => {
    const now = await $.clock.now()
    await markNow($, now)
    const arg = e.args.trim()
    const [first = '', ...rest] = arg.split(/\s+/)
    const sub = SUBCOMMANDS[first.toLowerCase()]
    const m = await currentModel($)
    const s = tr(m.locale)

    if (arg === '' || sub === 'today' || sub === 'week' || sub === 'me') {
      await openPane($, sub === 'week' || sub === 'me' ? sub : 'today')
      return { text: s.opened }
    }
    if (sub === 'tip') {
      const id = rest[0]
      const entry = id ? entryOf(id, m.locale) : m.tip
      if (!entry) return { text: s.noEntry(id ?? '') }
      await openPane($, undefined, entry.id)
      return { text: s.tipOpened(entry.id, entry.title) }
    }
    if (sub === 'setup') {
      void runOnboarding($)
      return {}
    }
    if (sub === 'quiet') {
      const isQuiet = (m.data.profile?.quietUntil ?? 0) > now
      await mutate($, (d, t) => applyProfile(d, { quiet: isQuiet ? 'off' : 'today' }, t))
      return { text: isQuiet ? s.quietOff : s.quietOn }
    }
    if (sub === 'forget') {
      await openPane($, 'me')
      return { text: s.opened }
    }
    coachSays($, arg)
    return { text: fit(`${s.coachListening}`, 40) }
  })

  on('ui.render', { component: 'Pane', requestId: 'life-coach' }, async ($, e) => {
    await read($, tick)
    const v = await read($, view)
    const m = await currentModel($)
    return paneTree($.ui.resolve(e), m, v, e.props.bodyColumns, actionsFor($, m, e.surface))
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || e.props.view.agentId) return next(e)
    await read($, tick)
    const m = await currentModel($)
    const tree = bandTree($.ui.resolve(e), m, e.props.bodyColumns, actionsFor($, m, e.surface))
    return tree ?? next(e)
  })
}

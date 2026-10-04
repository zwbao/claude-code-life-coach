// What the person sees: the band above the prompt and the coach's pane. Pure: data and actions in, a tree out.
import type { Elements, RenderElement } from 'claude-code'

import type { CoachView, LibEntry } from '../types'
import type { Model } from './app'
import { dueOf } from './app'
import { FOCUS, MAX_ACTIVE, clockOf, dayKey, duration, hhmmToMinute, isScheduled, lastDays, minuteOfDay, rhythmOf, weekday } from './coach'
import { tr } from './i18n'
import { badges, entryMarkdown, entryOf } from './library'

export type Els = Elements[keyof Elements]

/** What a press does; register.tsx, which holds the engine, makes these. */
export type Actions = {
  toggle: (id: string) => unknown
  onboard: () => unknown
  dismissOnboard: () => unknown
  breakGo: () => unknown
  breakLater: () => unknown
  bedNow: () => unknown
  bedSkip: () => unknown
  followTalk: (noteId: string, text: string) => unknown
  followLater: (noteId: string) => unknown
  followDone: (noteId: string) => unknown
  weeklyOpen: () => unknown
  weeklyCoach: () => unknown
  openEntry: (id: string) => unknown
  closeEntry: () => unknown
  tipNext: () => unknown
  tab: (t: CoachView['tab']) => unknown
  commitFrom: (e: LibEntry) => unknown
  askAbout: (e: LibEntry) => unknown
  talk: () => unknown
  say: (text: string) => unknown
  setProfile: (input: Record<string, unknown>) => unknown
  copyData: () => unknown
  erase: () => unknown
}

// Terminal cells: CJK characters take two.
const wide = /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/
export function fit(s: string, cols: number): string {
  let w = 0
  let out = ''
  for (const ch of s) {
    const cw = wide.test(ch) ? 2 : 1
    if (w + cw > Math.max(4, cols) - 1) return `${out}…`
    w += cw
    out += ch
  }
  return out
}

// --- the band ------------------------------------------------------------

export function bandTree(els: Els, m: Model, cols: number, act: Actions): RenderElement | null {
  const s = tr(m.locale)
  const { Box, Text, Button } = els
  const row = (message: string, buttons: RenderElement[]) => (
    <Box gap={2}>
      <Box flexShrink={1}>
        <Text wrap="truncate-end">{message}</Text>
      </Box>
      <Box flexShrink={0} gap={1}>
        {buttons}
      </Box>
    </Box>
  )
  const n = m.nudge
  if (n?.kind === 'onboard') {
    return row(s.onboard, [
      <Button key="onboard-start" plain hotkey="y" label={s.start} onPress={act.onboard} />,
      <Button key="onboard-no" plain hotkey="n" dimColor label={s.notNow} onPress={act.dismissOnboard} />,
    ])
  }
  if (n?.kind === 'break') {
    return row(s.breakMsg(duration(n.minutes, m.locale)), [
      <Button key="break-go" plain hotkey="y" label={s.breakGo} onPress={act.breakGo} />,
      <Button key="break-later" plain hotkey="n" dimColor label={s.breakLater} onPress={act.breakLater} />,
    ])
  }
  if (n?.kind === 'bedtime') {
    return row(s.bedMsg(m.data.profile?.bedtime ?? '', duration(n.minutes, m.locale)), [
      <Button key="bed-now" plain hotkey="y" label={s.bedNow} onPress={act.bedNow} />,
      <Button key="bed-skip" plain hotkey="n" dimColor label={s.bedSkip} onPress={act.bedSkip} />,
    ])
  }
  if (n?.kind === 'followup') {
    return row(s.followMsg(n.noteText), [
      <Button key="fu-talk" plain hotkey="y" label={s.talk} onPress={() => act.followTalk(n.noteId, n.noteText)} />,
      <Button key="fu-later" plain hotkey="n" dimColor label={s.later} onPress={() => act.followLater(n.noteId)} />,
      <Button key="fu-done" plain hotkey="d" dimColor label={s.doneIt} onPress={() => act.followDone(n.noteId)} />,
    ])
  }
  if (n?.kind === 'weekly') {
    return row(s.weeklyMsg, [
      <Button key="week-open" plain hotkey="y" label={s.open} onPress={act.weeklyOpen} />,
      <Button key="week-coach" plain hotkey="r" label={s.reviewWithCoach} onPress={act.weeklyCoach} />,
    ])
  }

  const allDone = m.commitments.length > 0 && m.commitments.every(x => x.isDone)
  if (m.commitments.length > 0 && !allDone) {
    const r = m.rhythm
    const status = r.activeMin > 0 ? s.stretch(duration(r.activeMin, m.locale), r.currentMin >= 30 ? duration(r.currentMin, m.locale) : '') : ''
    const each = Math.max(12, Math.floor((cols - 8 - status.length) / m.commitments.length) - 2)
    return (
      <Box gap={2}>
        <Text bold>{s.today}</Text>
        {m.commitments.map((x, i) => (
          <Button
            key={`c-${x.c.id}`}
            plain
            hotkey={'abc'[i]}
            dimColor={x.isDone}
            label={fit(`${x.isDone ? '✓' : '○'} ${x.c.text}`, each)}
            onPress={() => act.toggle(x.c.id)}
          />
        ))}
        {status !== '' && <Text dimColor>{status}</Text>}
      </Box>
    )
  }

  const tip = m.tip
  if (!tip) return null
  return (
    <Box flexDirection="column">
      {row(`${allDone ? `${s.allDone} · ` : ''}${s.tip} · ${tip.id} ${tip.title}`, [
        <Button key="tip-read" plain hotkey="r" label={s.read} onPress={() => act.openEntry(tip.id)} />,
        <Button key="tip-next" plain hotkey="j" dimColor label={s.next} onPress={act.tipNext} />,
      ])}
      <Text dimColor wrap="truncate-end">
        {fit(`${badges(tip, m.locale)}｜${tip.human}`, cols)}
      </Text>
    </Box>
  )
}

// --- the pane ------------------------------------------------------------

export function paneTree(els: Els, m: Model, v: CoachView, cols: number, act: Actions): RenderElement {
  const s = tr(m.locale)
  const { Box, Button } = els
  const tabs = (['today', 'week', 'me'] as const).map(tab => (
    <Button
      key={`tab-${tab}`}
      plain
      hotkey={tab[0]}
      dimColor={v.tab !== tab || v.entryId !== null}
      label={v.tab === tab && v.entryId === null ? `[${s.tabs[tab]}]` : s.tabs[tab]}
      onPress={() => act.tab(tab)}
    />
  ))
  const entry = v.entryId ? entryOf(v.entryId, m.locale) : undefined
  const body = entry
    ? entryView(els, m, entry, act)
    : v.tab === 'week'
      ? weekTab(els, m, cols, act)
      : v.tab === 'me'
        ? meTab(els, m, cols, act)
        : todayTab(els, m, cols, act)
  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={2}>{tabs}</Box>
      {body}
    </Box>
  )
}

function todayTab(els: Els, m: Model, cols: number, act: Actions): RenderElement {
  const s = tr(m.locale)
  const { Box, Text, Button } = els
  const r = m.rhythm
  const hour = new Date(m.now).getHours()
  const due = dueOf(m)
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>{`${s.greeting(hour)} · ${m.today}`}</Text>
      <Box flexDirection="column">
        <Text bold>{s.commitments}</Text>
        {m.commitments.length === 0 && <Text dimColor>{s.noCommitments}</Text>}
        {m.commitments.map((x, i) => (
          <Box key={`row-${x.c.id}`} flexDirection="column">
            <Button key={`t-${x.c.id}`} plain hotkey={'123'[i]} label={fit(`${x.isDone ? '✓' : '○'} ${x.c.text}`, cols)} onPress={() => act.toggle(x.c.id)} />
            <Box gap={2}>
              <Text dimColor>{fit(`   ${s.streakLabel(x.streak)}${x.c.why ? ` · ${x.c.why}` : ''}`, cols - 16)}</Text>
              {entryOf(x.c.evidence, m.locale) && (
                <Button key={`why-${x.c.id}`} plain dimColor label={s.whyItWorks} onPress={() => act.openEntry(x.c.evidence)} />
              )}
            </Box>
          </Box>
        ))}
        {m.commitments.length < MAX_ACTIVE && (
          <Button key="pick" plain hotkey="p" label={`+ ${s.pickOne}`} onPress={() => act.say(s.pPick)} />
        )}
      </Box>
      <Box flexDirection="column">
        <Text bold>{s.withClaude}</Text>
        {r.activeMin === 0 ? (
          <Text dimColor>{s.noActivity}</Text>
        ) : (
          <Text>
            {fit(
              [
                s.rhythmLine(duration(r.activeMin, m.locale), duration(r.longestMin, m.locale), r.breaks),
                r.firstMin !== null && r.lastMin !== null ? s.firstLast(clockOf(r.firstMin), clockOf(r.lastMin)) : '',
                r.lateMin > 0 ? s.lateLine(duration(r.lateMin, m.locale)) : '',
              ]
                .filter(Boolean)
                .join(' · '),
              cols,
            )}
          </Text>
        )}
      </Box>
      {due.length > 0 && (
        <Box flexDirection="column">
          <Text bold>{s.notesDue}</Text>
          {due.slice(0, 3).map(note => (
            <Button key={`due-${note.id}`} plain label={fit(`→ ${note.text}`, cols)} onPress={() => act.followTalk(note.id, note.text)} />
          ))}
        </Box>
      )}
      {m.tip && (
        <Box flexDirection="column">
          <Text bold>{s.tip}</Text>
          <Text>{fit(`${m.tip.id} ${m.tip.title}`, cols)}</Text>
          <Text dimColor>{`${badges(m.tip, m.locale)}｜${m.tip.human}`}</Text>
          <Box gap={2}>
            <Button key="today-tip-read" plain hotkey="r" label={s.read} onPress={() => act.openEntry(m.tip!.id)} />
            <Button key="today-tip-next" plain hotkey="j" dimColor label={s.next} onPress={act.tipNext} />
          </Box>
        </Box>
      )}
      <Button key="talk" variant="primary" hotkey="k" label={s.talkToCoach} onPress={act.talk} />
    </Box>
  )
}

const WEEKDAYS = { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] }

function weekTab(els: Els, m: Model, cols: number, act: Actions): RenderElement {
  const s = tr(m.locale)
  const { Box, Text, Button } = els
  const bed = m.data.profile?.bedtime ? hhmmToMinute(m.data.profile.bedtime) : null
  const snapMarks = m.marks
  const days = lastDays(m.today, 7).map(day => ({
    day,
    r: rhythmOf(snapMarks[day] ?? [], day === m.today ? minuteOfDay(m.now) : null, bed),
    checks: m.data.commitments
      .filter(c => c.status === 'active' && isScheduled(c, day) && day >= dayKey(c.createdAt))
      .map(c => (m.data.checkins[day]?.[c.id] === 'done' ? '✓' : m.data.checkins[day]?.[c.id] === 'skip' ? '–' : '·'))
      .join(''),
  }))
  const most = Math.max(60, ...days.map(d => d.r.activeMin))
  const width = Math.max(6, Math.min(20, cols - 40))
  const total = days.reduce((t, d) => t + d.r.activeMin, 0)
  const late = days.filter(d => d.r.lateMin > 0).length
  const done = days.reduce((t, d) => t + [...d.checks].filter(c => c === '✓').length, 0)
  const due = days.reduce((t, d) => t + d.checks.length, 0)
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>{s.weekTitle}</Text>
      {total === 0 ? (
        <Text dimColor>{s.noActivity}</Text>
      ) : (
        <Box flexDirection="column">
          {days.map(d => {
            const filled = Math.round((d.r.activeMin / most) * width)
            return (
              <Text key={`d-${d.day}`}>
                {`${WEEKDAYS[m.locale][weekday(d.day)]} ${d.day.slice(5)}  ${'█'.repeat(filled)}${'░'.repeat(width - filled)} ${duration(d.r.activeMin, m.locale).padEnd(9)} ${d.checks.padEnd(3)} ${d.r.lateMin > 0 ? `☾ ${duration(d.r.lateMin, m.locale)}` : ''}`}
              </Text>
            )
          })}
        </Box>
      )}
      <Text dimColor>{s.weekSum(duration(total, m.locale), late, done, due)}</Text>
      <Button key="review" variant="primary" hotkey="r" label={s.reviewWithCoach} onPress={act.weeklyCoach} />
    </Box>
  )
}

/** One library entry, opened from today's tip or from a commitment's evidence. */
function entryView(els: Els, m: Model, entry: LibEntry, act: Actions): RenderElement {
  const s = tr(m.locale)
  const { Box, Button, Markdown } = els
  const isCommitted = m.commitments.some(x => x.c.evidence === entry.id)
  return (
    <Box flexDirection="column">
      <Box gap={2} flexWrap="wrap">
        <Button key="entry-back" hotkey="b" label={s.back} onPress={act.closeEntry} />
        {!isCommitted && <Button key="entry-commit" hotkey="c" label={s.makeCommitment} onPress={() => act.commitFrom(entry)} />}
        <Button key="entry-ask" hotkey="a" label={s.askCoach} onPress={() => act.askAbout(entry)} />
      </Box>
      <Markdown key="entry" text={entryMarkdown(entry, m.locale)} />
    </Box>
  )
}

const BEDTIMES = ['22:00', '22:30', '23:00', '23:30', '00:00', '00:30', '01:00', '01:30', '02:00']
const BREAKS = [45, 50, 60, 90, 120]

function meTab(els: Els, m: Model, cols: number, act: Actions): RenderElement {
  const s = tr(m.locale)
  const { Box, Text, Button } = els
  const p = m.data.profile
  return (
    <Box flexDirection="column" gap={1}>
      {!p && <Button key="me-setup" variant="primary" hotkey="s" label={s.start} onPress={act.onboard} />}
      {'Select' in els && (
        <Box flexDirection="column">
          <els.Select
            key="me-locale"
            label={s.language}
            options={[
              { value: 'auto', label: s.auto },
              { value: 'en', label: 'English' },
              { value: 'zh', label: '中文' },
            ]}
            value={p?.locale ?? 'auto'}
            onSelect={v => act.setProfile({ locale: v })}
          />
          <els.Select
            key="me-region"
            label={s.region}
            options={[
              { value: 'auto', label: `${s.auto} (${m.region})` },
              { value: 'global', label: 'Global' },
              { value: 'CN', label: 'China / 中国大陆' },
            ]}
            value={p?.region ?? 'auto'}
            onSelect={v => act.setProfile({ region: v })}
          />
          <els.Select
            key="me-bed"
            label={s.bedtime}
            options={[{ value: 'off', label: s.off }, ...BEDTIMES.map(t => ({ value: t, label: t }))]}
            value={p?.bedtime ?? 'off'}
            onSelect={v => act.setProfile({ bedtime: v === 'off' ? null : v })}
          />
          <els.Select
            key="me-break"
            label={s.breakEvery}
            options={[{ value: '0', label: s.off }, ...BREAKS.map(b => ({ value: String(b), label: s.everyMin(b) }))]}
            value={String(p?.breakEvery ?? 0)}
            onSelect={v => act.setProfile({ breakEvery: Number(v) || null })}
          />
          <els.Select
            key="me-quiet"
            label={s.quiet}
            options={[
              { value: 'off', label: s.off },
              { value: 'today', label: s.quietToday },
            ]}
            value={p?.quietUntil && p.quietUntil > m.now ? 'today' : 'off'}
            onSelect={v => act.setProfile({ quiet: v })}
          />
        </Box>
      )}
      <Box flexDirection="column">
        <Text bold>{s.focus}</Text>
        <Box gap={2} flexWrap="wrap">
          {FOCUS.map(f => {
            const on = p?.focus.includes(f) ?? false
            return (
              <Button
                key={`focus-${f}`}
                plain
                dimColor={!on}
                label={`${on ? '✓' : '○'} ${s.focusNames[f]}`}
                onPress={() => act.setProfile({ focus: on ? (p?.focus ?? []).filter(x => x !== f) : [...(p?.focus ?? []), f] })}
              />
            )
          })}
        </Box>
      </Box>
      <Box flexDirection="column">
        <Text bold>{s.about}</Text>
        <Text dimColor>{p?.about ? p.about.slice(0, 600) : s.aboutEmpty}</Text>
      </Box>
      <Text dimColor>{fit(s.privacy, cols * 4)}</Text>
      <Box gap={2} flexWrap="wrap">
        {p && <Button key="me-setup-again" label={s.setup} onPress={act.onboard} />}
        <Button key="me-copy" label={s.copyData} onPress={act.copyData} />
        <Button key="me-erase" label={s.erase} onPress={act.erase} />
      </Box>
    </Box>
  )
}

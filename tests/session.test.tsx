import { describe, expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const T0 = new Date(2026, 9, 5, 15, 0).getTime()
const PANE = { title: 'Life Coach', isFocused: true, bodyColumns: 80, placement: 'inline', scroll: { offset: 0, bodyRows: 30 }, view: {} } as const
const BAND = { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 110, scroll: { offset: 0, bodyRows: 10 }, view: {} } as const

/** The world beneath the plugin: a store, a clock, a session, a surface that opens panes and shows toasts. */
function world(on: On) {
  const toasts: string[] = []
  mock.store(on)
  mock.clock(on, { now: T0 })
  mock.env(on, { LANG: 'en_US.UTF-8' })
  on('session.id', () => ({ value: 'test-session' }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  on('tool.register', ($, e) => ({ value: { tool: `mcp__life-coach__${e.name}` } }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  return { toasts }
}

const START = { cwd: '/tmp', surface: 'terminal', isInteractive: true } as const

describe('the coach in a session', () => {
  test('a commitment made by the model shows up in its context with its streak', async ($, on) => {
    world(on)
    const added = await $.tool.call({ tool: 'mcp__life-coach__commit', action: 'add', text: 'When lunch ends, I will walk 10 minutes', evidence: 'E.1' })
    expect(String(added.result)).toContain('Added c1')
    const checked = await $.tool.call({ tool: 'mcp__life-coach__checkin', id: 'c1', status: 'done' })
    expect(String(checked.result)).toContain('Streak 1')
    const context = await $.tool.call({ tool: 'mcp__life-coach__context' })
    expect(String(context.result)).toContain('c1: "When lunch ends')
    expect(String(context.result)).toContain('streak 1')
  })

  test('/coach opens the dashboard: today carries the tip, entries open from it and from a commitment', async ($, on) => {
    world(on)
    await $.tool.call({ tool: 'mcp__life-coach__profile', locale: 'en', region: 'CN', bedtime: '23:30' })
    await $.tool.call({ tool: 'mcp__life-coach__commit', action: 'add', text: 'When it is 3pm, I will switch to water', evidence: 'E.6' })
    await $.session.start(START)
    const ran = await $.command.run({ command: 'coach', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
    expect(ran.text).toBeDefined()
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'life-coach', surface, component: 'Pane', requestId: 'life-coach', props: PANE })
      expect(await ui.find({ type: 'Text', text: /Commitments/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /Tip of the day/ })).toBeDefined()
      expect(await ui.find({ type: 'Button', key: 'tab-library' })).toBeUndefined()
      await ui.press({ key: 'today-tip-read' })
      expect(await ui.find({ type: 'Markdown' })).toBeDefined()
      await ui.press({ key: 'entry-back' })
      await ui.press({ key: 'why-c1' })
      expect(await ui.find({ type: 'Markdown', text: /E\.6/ })).toBeDefined()
      expect(await ui.find({ type: 'Button', key: 'entry-commit' })).toBeUndefined()
      await ui.press({ key: 'entry-back' })
      await ui.press({ key: 'tab-week' })
      expect(await ui.find({ type: 'Text', text: /Last 7 days/ })).toBeDefined()
      await ui.press({ key: 'tab-me' })
      expect(await ui.find({ type: 'Text', text: /stored on this machine/ })).toBeDefined()
      await ui.press({ key: 'tab-today' })
      await ui.unmount()
    }
  })

  test('/coach tip opens today\'s tip or any entry by id', async ($, on) => {
    world(on)
    await $.tool.call({ tool: 'mcp__life-coach__profile', locale: 'en' })
    const run = (args: string) => $.command.run({ command: 'coach', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
    expect((await run('tip')).text).toMatch(/^(E\.|\d)/)
    expect((await run('tip E.1')).text).toContain('E.1')
    expect((await run('tip 13.1')).text).toContain('13.1')
    expect((await run('tip nope')).text).toContain('No library entry')
  })

  test('the band invites onboarding first, then carries commitments with one-key check-off', async ($, on) => {
    const { toasts } = world(on)
    await $.session.start(START)
    const ui = await $.ui.mount({ plugin: 'life-coach', surface: 'terminal', component: 'AbovePrompt', props: BAND })
    expect(await ui.find({ type: 'Button', key: 'onboard-start' })).toBeDefined()
    await ui.press({ key: 'onboard-no' })
    expect(await ui.find({ type: 'Button', key: 'onboard-start' })).toBeUndefined()

    await $.tool.call({ tool: 'mcp__life-coach__profile', locale: 'en' })
    await $.tool.call({ tool: 'mcp__life-coach__commit', action: 'add', text: 'When I close the laptop, I will stretch' })
    const button = await ui.find({ type: 'Button', key: 'c-c1' })
    expect(button?.text).toContain('○')
    await ui.press({ key: 'c-c1' })
    expect(toasts.some(t => t.includes('streak 1'))).toBe(true)
    // all done for today: the band hands its place to today's tip, as a small reward
    expect(await ui.find({ type: 'Button', key: 'c-c1' })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /All done today/ })).toBeDefined()
    await ui.unmount()
  })

  test('a coaching prompt carries the context to the model alone; every request carries the brief', async ($, on) => {
    world(on)
    let context: readonly string[] | undefined
    on('prompt.submit', ($, e) => {
      context = e.context
      return { text: e.text }
    })
    on('prompt.compose', () => ({ sections: [{ id: 'intro', text: 'You are Claude Code.', scope: 'shared' as const }] }))
    await $.prompt.submit({ text: 'I keep sleeping badly', origin: { kind: 'plugin', name: 'life-coach', asUser: true }, wait: false })
    expect(context?.[0]).toContain('Coach context')
    const composed = await $.prompt.compose({
      model: 'claude-opus-5-5',
      promptModel: 'claude-opus-5-5',
      surfaces: ['terminal'],
      tools: [],
      outputStyle: null,
      traits: [],
    })
    expect(composed.sections.map(s => s.id)).toContain('life-coach:coach')
  })
})

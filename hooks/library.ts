// The coach's library: the global essentials pack (bilingual) and the China pack (《高性价比人生指南》).
import type { Entry, LibEntry, Locale, PackEntry, Region } from '../types'
import { CHAPTERS, SOURCE } from './book'
import { ESSENTIALS } from './essentials'
import { tr } from './i18n'

export { CHAPTERS, ESSENTIALS, SOURCE }

export const AREAS = ['move', 'sleep', 'work', 'mind', 'habits', 'connect'] as const
const AREA_NAMES: Record<Locale, Record<string, string>> = {
  en: { move: 'Move', sleep: 'Sleep', work: 'Work', mind: 'Mind', habits: 'Habits', connect: 'Connection' },
  zh: { move: '运动', sleep: '睡眠', work: '工作', mind: '情绪', habits: '习惯', connect: '关系' },
}

export const CHINA_CREDIT = `《高性价比人生指南》，作者 eternity4719，CC BY 4.0，${SOURCE.date} 版（${SOURCE.commit}）。最新版：https://eternity4719.github.io/HowToLiveBetter/`

const COST_W: Record<string, Record<string, number>> = {
  money: { '0': 0, 少: 1, 多: 2 },
  time: { 少: 0, 中: 1, 多: 2 },
  will: { 否: 0, 些: 1, 是: 2 },
}
/** The book's own value tier: a big benefit for nothing is 极高. */
export function tierOf(level: string, money: string, time: string, will: string): string {
  const cs = (COST_W.money?.[money] ?? 0) + (COST_W.time?.[time] ?? 0) + (COST_W.will?.[will] ?? 0)
  if (level === '大') return cs === 0 ? '极高' : cs <= 2 ? '高' : '一般'
  if (level === '中') return cs === 0 ? '高' : '一般'
  return '一般'
}

const fromPack = (e: PackEntry, l: Locale): LibEntry => ({
  id: e.id,
  pack: 'essentials',
  group: e.area,
  groupLabel: AREA_NAMES[l][e.area] ?? e.area,
  title: e.title[l],
  cost: e.cost[l],
  human: e.human[l],
  gain: e.gain[l],
  grade: e.grade,
  src: e.src,
  note: e.note[l],
  ratio: tierOf(e.level, e.money, e.time, e.will),
  lens: e.lens,
  money: e.money,
  time: e.time,
  will: e.will,
  dispute: false,
})

const fromBook = (e: Entry): LibEntry => ({
  id: e.id,
  pack: 'china',
  group: String(e.sec),
  groupLabel: `${e.sec}. ${CHAPTERS.find(c => c.n === e.sec)?.title ?? ''}`,
  title: e.title,
  cost: e.cost,
  human: e.human,
  gain: e.gain,
  grade: e.grade,
  src: e.src,
  note: e.note,
  ratio: e.ratio,
  lens: e.lens,
  money: e.money,
  time: e.time,
  will: e.will,
  dispute: e.dispute,
})

const BOOK: LibEntry[] = CHAPTERS.flatMap(c => c.entries.map(fromBook))

type Indexed = { e: LibEntry; title: string; human: string; rest: string }

const lower = (s: string) => s.replace(/\*\*/g, '').toLowerCase()
const INDEX: Indexed[] = [
  // essentials are found by words in either language, whichever one the UI shows
  ...ESSENTIALS.map(p => ({
    e: fromPack(p, 'en'),
    title: lower(`${p.title.en}\n${p.title.zh}`),
    human: lower(`${p.human.en}\n${p.human.zh}`),
    rest: lower([p.cost.en, p.cost.zh, p.gain.en, p.gain.zh, p.note.en, p.note.zh, p.src, p.area].join('\n')),
  })),
  ...BOOK.map(e => ({ e, title: lower(e.title), human: lower(e.human), rest: lower([e.cost, e.gain, e.note, e.src].join('\n')) })),
]
const ORDER = new Map(INDEX.map((x, i) => [x.e.id, i]))

export function entryOf(id: string, locale: Locale): LibEntry | undefined {
  const p = ESSENTIALS.find(x => x.id === id)
  if (p) return fromPack(p, locale)
  return BOOK.find(x => x.id === id)
}

// --- search --------------------------------------------------------------

const FILLER =
  /怎么办|怎么样|怎么做|怎么|如何|为什么|什么|有没有用|有没有|是不是|能不能|要不要|该不该|值不值得|值不值|划不划算|好不好|可不可以|应该|吗|呢|吧|啊|呀/g
const STOP = new Set(
  'a an the to of in on for and or with my me i is are be do does should can how what why when much many it at by from about'.split(' '),
)

export function terms(query: string): string[] {
  const ts = query
    .toLowerCase()
    .replace(FILLER, ' ')
    .split(/[\s,，、;；。.!?！？「」“”"'（）()]+/)
    .filter(t => t && !STOP.has(t))
  const long = ts.filter(t => [...t].length > 1)
  return long.length > 0 ? long : ts
}

const weight = (x: Indexed, t: string) =>
  (x.title.includes(t) ? 6 : 0) + (x.human.includes(t) ? 3 : 0) + (x.rest.includes(t) ? 1 : 0)
const RATIO_BONUS: Record<string, number> = { 极高: 2, 高: 1 }
const bonus = (x: Indexed, ts: string[]) =>
  (RATIO_BONUS[x.e.ratio] ?? 0) +
  (ts.some(t => {
    const i = x.title.indexOf(t)
    return i >= 0 && i < 4
  })
    ? 2
    : 0)

/** Chinese has no spaces: a word that misses whole is tried as overlapping pairs of characters. */
function grams(t: string): string[] {
  const chars = [...t]
  if (/^[\x00-\x7f]+$/.test(t) || chars.length <= 2) return [t]
  return chars.slice(0, -1).map((c, i) => c + chars[i + 1])
}

export type LibQuery = { query?: string; pack?: 'essentials' | 'china' | 'all'; group?: string; grade?: string; top?: boolean }
export type Hits = { entries: LibEntry[]; isFuzzy: boolean }

export function search(q: LibQuery, locale: Locale): Hits {
  const pool = INDEX.filter(
    ({ e }) =>
      (!q.pack || q.pack === 'all' || e.pack === q.pack) &&
      (!q.group || e.group === q.group) &&
      (!q.grade || e.grade === q.grade) &&
      (!q.top || e.ratio === '极高'),
  )
  const localize = (e: LibEntry) => (e.pack === 'essentials' ? entryOf(e.id, locale) ?? e : e)
  const rank = (scored: { x: Indexed; score: number }[]) =>
    scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score || (ORDER.get(a.x.e.id) ?? 0) - (ORDER.get(b.x.e.id) ?? 0))
      .map(s => localize(s.x.e))

  const ts = terms(q.query ?? '')
  if (ts.length === 0) return { entries: pool.map(x => localize(x.e)), isFuzzy: false }

  const exact = rank(
    pool.map(x => ({
      x,
      score: ts.every(t => weight(x, t) > 0) ? ts.reduce((s, t) => s + weight(x, t), 0) + bonus(x, ts) : 0,
    })),
  )
  if (exact.length > 0) return { entries: exact, isFuzzy: false }

  // Close matches: any piece counts, weighted by how rare it is in the library ("押金" beats "房押").
  const pieces = [...new Set(ts.flatMap(grams))]
  const rarity = new Map(
    pieces.map(g => {
      const df = INDEX.filter(x => weight(x, g) > 0).length
      return [g, df === 0 ? 0 : Math.log(INDEX.length / df)]
    }),
  )
  const scored = pool.map(x => ({
    x,
    score: pieces.reduce((s, g) => s + (weight(x, g) > 0 ? weight(x, g) * (rarity.get(g) ?? 0) : 0), 0),
  }))
  const top = Math.max(0, ...scored.map(s => s.score))
  return { entries: rank(scored.filter(s => s.score >= top * 0.3)), isFuzzy: true }
}

// --- showing an entry ----------------------------------------------------

const MONEY: Record<Locale, Record<string, string>> = {
  en: { '0': 'free', 少: 'a little money', 多: 'real money' },
  zh: { '0': '不花钱', 少: '花少量钱', 多: '花不少钱' },
}
const TIME: Record<Locale, Record<string, string>> = {
  en: { 少: 'seconds to minutes', 中: 'hours', 多: 'daily time' },
  zh: { 少: '顺手', 中: '花几小时', 多: '每天占时间' },
}
const WILL: Record<Locale, Record<string, string>> = {
  en: { 否: 'no willpower', 些: 'some willpower', 是: 'lots of willpower' },
  zh: { 否: '不用毅力', 些: '要一点毅力', 是: '要很多毅力' },
}
const RATIO: Record<Locale, Record<string, string>> = {
  en: { 极高: 'best value', 高: 'good value', 一般: 'fair value' },
  zh: { 极高: '性价比极高', 高: '性价比高', 一般: '性价比一般' },
}

export const badges = (e: LibEntry, l: Locale) =>
  [tr(l).grade(e.grade), RATIO[l][e.ratio], e.dispute ? (l === 'zh' ? '有争议' : 'disputed') : '']
    .filter(Boolean)
    .join(' · ')
export const costTags = (e: LibEntry, l: Locale) => [MONEY[l][e.money], TIME[l][e.time], WILL[l][e.will]].filter(Boolean).join(' / ')

export function entryMarkdown(e: LibEntry, l: Locale): string {
  const s = tr(l)
  const parts = [
    `### ${e.id}　${e.title}`,
    `${e.groupLabel} · ${badges(e, l)} · ${costTags(e, l)}${e.pack === 'china' ? `\n\n_${s.chinaNote}_` : ''}`,
    `**${s.fields.human}**　${e.human}`,
    `**${s.fields.cost}**　${e.cost}`,
    `**${s.fields.gain}**　${e.gain}`,
    `**${s.fields.src}**　${e.src}`,
  ]
  if (e.note) parts.push(`**${s.fields.note}**　${e.note}`)
  const text = parts.join('\n\n')
  return text.length > 9800 ? `${text.slice(0, 9800)}…` : text
}

// --- tips ----------------------------------------------------------------

export function tipPool(locale: Locale, region: Region): LibEntry[] {
  const own = ESSENTIALS.map(p => fromPack(p, locale))
  return region === 'CN' ? [...own, ...BOOK.filter(e => e.ratio === '极高')] : own
}

/** One entry a day, stepping through the pool so neighbouring days land on different topics. */
export function tipFor(day: string, offset: number, pool: LibEntry[]): LibEntry | undefined {
  if (pool.length === 0) return undefined
  const n = pool.length
  const d = Math.floor(Date.parse(`${day}T12:00:00Z`) / 86400_000)
  const step = n % 37 === 0 ? 1 : 37
  return pool[((((d + offset) * step) % n) + n) % n]
}

// --- the model's library tool --------------------------------------------

export type LibraryInput = { query?: unknown; id?: unknown; collection?: unknown; grade?: unknown; limit?: unknown }
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

function forModel(e: LibEntry): string {
  const head = e.pack === 'china' ? '[China-specific: Chinese law, prices and healthcare system; text in Chinese]\n\n' : ''
  return head + entryMarkdown(e, e.pack === 'china' ? 'zh' : 'en')
}

export function libraryAnswer(input: LibraryInput, region: Region): string {
  const ids = str(input.id)
  const credit = `Essentials: sources as cited per entry. China pack: ${CHINA_CREDIT}`
  if (ids) {
    const wanted = ids.split(/[\s,，、]+/).filter(Boolean)
    const found = wanted.map(id => entryOf(id, 'en')).filter((e): e is LibEntry => e !== undefined)
    const missing = wanted.filter(id => !entryOf(id, 'en'))
    return [...found.map(forModel), missing.length ? `No such entries: ${missing.join(', ')}.` : '', credit]
      .filter(Boolean)
      .join('\n\n---\n\n')
  }

  const collection = str(input.collection)
  const pack = collection === 'china' || collection === 'essentials' || collection === 'all' ? collection : region === 'CN' ? 'all' : 'essentials'
  const query = str(input.query)
  const grade = str(input.grade)
  if (!query && !grade) {
    const groups = [
      `Essentials (global, ${ESSENTIALS.length} entries): ${AREAS.map(a => `${a} ${ESSENTIALS.filter(p => p.area === a).length}`).join(', ')}`,
      `China pack (《高性价比人生指南》, ${BOOK.length} entries, Chinese): ${CHAPTERS.map(c => `${c.n}. ${c.title}`).join(' / ')}`,
    ]
    return `${groups.join('\n')}\n\nSearch with query (words in English or Chinese), fetch with id (e.g. "E.3", "13.1"). collection defaults to ${pack} for this user's region.\n\n${credit}`
  }
  const limit = Math.min(15, Math.max(1, Number(input.limit) || 5))
  const { entries, isFuzzy } = search({ query, pack, grade }, 'en')
  if (entries.length === 0) {
    return `Nothing in the library for "${query ?? ''}"${pack !== 'all' ? ` in ${pack}` : ''}. Try other words${pack === 'essentials' ? ', or collection "all" to include the China pack' : ''}. Answer from your own knowledge and say so.`
  }
  const shown = entries.slice(0, limit)
  const rest = entries.slice(limit, limit + 25)
  return [
    `${isFuzzy ? 'No exact match; close matches' : 'Matches'}: ${entries.length} (collection ${pack}). Full text of the first ${shown.length}:`,
    ...shown.map(forModel),
    rest.length ? `More (fetch by id):\n${rest.map(e => `- ${e.id} ${e.title} (grade ${e.grade}${e.pack === 'china' ? ', China' : ''})`).join('\n')}` : '',
    `${credit}\nCite entry ids and the original sources. China-pack entries apply to mainland China only.`,
  ]
    .filter(Boolean)
    .join('\n\n---\n\n')
}

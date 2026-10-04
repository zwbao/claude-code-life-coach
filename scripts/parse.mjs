// Parse HowToLiveBetter book/*.md the way its own index.html does.
// Usage: node scripts/parse.mjs <HowToLiveBetter checkout> hooks/book.ts
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const [repo, out] = process.argv.slice(2)
const COST_W = { money: { '0': 0, '少': 1, '多': 2 }, time: { '少': 0, '中': 1, '多': 2 }, will: { '否': 0, '些': 1, '是': 2 } }
const files = readdirSync(join(repo, 'book')).filter(f => /^\d+-.*\.md$/.test(f)).sort()
const chapters = []
const stray = []
for (const f of files) {
  const lines = readFileSync(join(repo, 'book', f), 'utf8').split(/\r?\n/)
  let sec = null, entry = null
  const flush = () => { if (entry && sec) sec.entries.push(entry); entry = null }
  for (const raw of lines) {
    const line = raw.trimEnd()
    let m
    if ((m = /^#{1,2} (\d+)\. (.+)$/.exec(line))) { flush(); sec = { n: +m[1], title: m[2].trim(), intro: [], entries: [] }; chapters.push(sec); continue }
    if (/^#{1,2} /.test(line)) { flush(); sec = null; continue }
    if (!sec) continue
    if ((m = /^### (\d+)\. (.+)$/.exec(line))) {
      flush()
      entry = { id: `${sec.n}.${m[1]}`, sec: sec.n, n: +m[1], title: m[2].trim(), cost: '', human: '', gain: '', grade: '', src: '', note: '', money: '', time: '', will: '', level: '', lens: '' }
      continue
    }
    if ((m = /^<!--\s*成本标签:\s*(.*?)\s*-->/.exec(line)) && entry) {
      for (const kv of m[1].split(/\s+/)) {
        const [k, v] = kv.split('=')
        if (k === '钱') entry.money = v
        if (k === '时间') entry.time = v
        if (k === '毅力') entry.will = v
        if (k === '收益') entry.level = v
        if (k === '口径') entry.lens = v
      }
      continue
    }
    if (entry) {
      if ((m = /^- 成本：(.*)$/.exec(line))) entry.cost = m[1]
      else if ((m = /^- 说人话：(.*)$/.exec(line))) entry.human = m[1]
      else if ((m = /^- 收益：(.*)$/.exec(line))) entry.gain = m[1]
      else if ((m = /^- 证据等级：\s*([ABC])/.exec(line))) entry.grade = m[1]
      else if ((m = /^- 来源：(.*)$/.exec(line))) entry.src = m[1]
      else if ((m = /^- 备注：(.*)$/.exec(line))) entry.note = m[1]
      else if (line) stray.push(`${entry.id}: ${line.slice(0, 80)}`)
      continue
    }
    if (line && !line.startsWith('[←')) sec.intro.push(line)
  }
  flush()
}
const entries = chapters.flatMap(s => s.entries)
for (const e of entries) {
  e.dispute = /^争议/.test(e.note)
  e.todo = /待核实|TODO/.test(e.src + e.gain + e.note + e.cost)
  const cs = (COST_W.money[e.money] ?? 0) + (COST_W.time[e.time] ?? 0) + (COST_W.will[e.will] ?? 0)
  e.ratio = e.level === '大' ? (cs === 0 ? '极高' : cs <= 2 ? '高' : '一般') : e.level === '中' ? (cs === 0 ? '高' : '一般') : '一般'
}
const tally = k => entries.reduce((t, e) => ((t[e[k]] = (t[e[k]] ?? 0) + 1), t), {})
const longest = Math.max(...entries.map(e => [e.title, e.cost, e.human, e.gain, e.src, e.note].join('').length))
console.log({ chapters: chapters.length, entries: entries.length, grade: tally('grade'), ratio: tally('ratio'), dispute: entries.filter(e => e.dispute).length, stray: stray.length, longest })
if (stray.length) console.log(stray.slice(0, 10))
const data = chapters.map(({ n, title, intro, entries }) => ({ n, title, intro: intro.join('\n'), entries }))
if (out) {
  // 引擎不读超过 1 MiB 的模块文件：按章节切成几份，每份约 300 KB。
  const [commit, date] = execFileSync('git', ['-C', repo, 'log', '-1', '--format=%h %cs']).toString().trim().split(' ')
  const HEAD = `// 由 scripts/parse.mjs 从 eternity4719/HowToLiveBetter@${commit} 的 book/*.md 生成，勿手改。\n// 原书《高性价比人生指南》，CC BY 4.0。\n`
  const parts = [[]]
  let size = 0
  for (const c of data) {
    const n = Buffer.byteLength(JSON.stringify(c))
    if (size + n > 300_000 && parts.at(-1).length) { parts.push([]); size = 0 }
    parts.at(-1).push(c); size += n
  }
  const dir = out.replace(/\/[^/]*$/, '')
  parts.forEach((p, i) => writeFileSync(`${dir}/book-${i + 1}.ts`, `${HEAD}import type { Chapter } from '../types'\n\nexport const PART: Chapter[] = ${JSON.stringify(p)}\n`))
  writeFileSync(out, `${HEAD}import type { Chapter } from '../types'\n${parts.map((_, i) => `import { PART as P${i + 1} } from './book-${i + 1}'`).join('\n')}\n\nexport const SOURCE = { commit: '${commit}', date: '${date}' }\nexport const CHAPTERS: Chapter[] = [${parts.map((_, i) => `...P${i + 1}`).join(', ')}]\n`)
  console.log('wrote', out, 'in', parts.length, 'parts:', parts.map(p => `${p[0].n}-${p.at(-1).n}`).join(' '))
}

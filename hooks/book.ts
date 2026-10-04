// 由 scripts/parse.mjs 从 eternity4719/HowToLiveBetter@8dab966 的 book/*.md 生成，勿手改。
// 原书《高性价比人生指南》，CC BY 4.0。
import type { Chapter } from '../types'
import { PART as P1 } from './book-1'
import { PART as P2 } from './book-2'
import { PART as P3 } from './book-3'
import { PART as P4 } from './book-4'

export const SOURCE = { commit: '8dab966', date: '2026-09-19' }
export const CHAPTERS: Chapter[] = [...P1, ...P2, ...P3, ...P4]

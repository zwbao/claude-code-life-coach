# Life Coach for Claude Code

English | [简体中文](README.zh-CN.md)

A life coach that lives inside [Claude Code](https://claude.com/claude-code), built as a mod (a plugin of function hooks).
It notices the shape of your work day, nudges you at natural pauses, keeps a few small commitments with you, and hands
you to Claude whenever you want to talk.

## Install

Requires Claude Code 2.1.287 or later (mods are on by default).

```
/plugin marketplace add zwbao/claude-code-life-coach
/plugin install life-coach@life-coach
/reload-plugins
```

The band above the prompt then invites you to a one-minute setup (language, focus, bedtime, break interval).

Claude saves commitments, check-ins and notes through the plugin's tools. To skip the permission prompts:
`/permissions` → allow `mcp__life-coach__*`.

## Use

| | |
|---|---|
| **The band above the prompt** | one thing at a time: a nudge (break, bedtime, follow-up, weekly review) → today's commitments (click, or `ctrl+x tab` then `a`/`b`/`c`, to check off) → the tip of the day once they're all done |
| `/coach` | dashboard: **Today** (commitments, your day with Claude, tip of the day) · **Week** · **Me** (settings, privacy) |
| `/coach <anything>` | talk to the coach; your context goes with it, to the model only |
| `/coach tip [id]` | the tip of the day, or any library entry (`/coach tip E.6`, `/coach tip 13.1`) |
| `/coach week` · `/coach me` · `/coach setup` | open a tab, or run setup again |
| `/coach quiet` | no nudges until 04:00 tomorrow (run again to undo) |
| just talk | bring up sleep, energy, stress, habits, money… and Claude coaches you |

## How it works

- **Rhythm** — the time you spend working with Claude, read from when you send prompts (gaps up to 12 minutes count as
  being there; a day ends at 04:00). Longest stretch, breaks, minutes past your bedtime. Safe across parallel sessions.
- **Nudges** — calm by default: shown in the band, a toast at most three times a day, never in the middle of a turn.
- **Commitments** — at most three, written as if-then plans ("When X, I will Y"). Streaks follow *never miss twice*.
- **Coaching** — a short system-prompt section tells Claude it is also your coach; `/coach` prompts carry your context
  (profile, commitments, rhythm, notes). Six tools: `context`, `profile`, `commit`, `checkin`, `note`, `library`.
- **Library** — the coach's evidence base, used by Claude and by the tip of the day, not a page to browse:
  - **Essentials** (global, English and Chinese): 15 entries on movement, sleep, work rhythm, habits, mood and
    relationships, each graded A/B/C with its original sources checked against the abstract.
  - **China pack**: *How to Live Better* (《高性价比人生指南》) by eternity4719 (CC BY 4.0), 544 entries in Chinese.
    It applies to mainland China only and is used only there unless you ask for it.

The product reasoning is in [PRODUCT.md](PRODUCT.md).

## Privacy

Everything is stored on your machine, in Claude Code's plugin store (`~/.claude/plugins/store/`). Nothing leaves it
unless you talk to Claude, and the plugin itself never calls a model. **Me → Copy my data** exports it;
**Me → Erase everything** deletes it.

## Develop

```
claude plugin validate .
claude plugin test .
claude --plugin-dir .          # or add this folder as a local marketplace; edits apply on /reload-plugins
```

Layout: `hooks/register.tsx` holds everything that touches the engine (`$`); the other modules are pure —
`coach.ts` (days, streaks, rhythm, nudges, model context), `actions.ts` (what tools and presses change),
`ui.tsx` (band and pane trees), `library.ts`, `i18n.ts`, and the data in `essentials.ts` and `book*.ts`.

To regenerate the China pack from a newer checkout of the book:
`node scripts/parse.mjs <HowToLiveBetter checkout> hooks/book.ts`.

## License

The code and the Essentials pack are under the MIT License. The China pack is third-party content under CC BY 4.0;
see [NOTICE](NOTICE). This is not medical advice; the coach tells you when to see a professional.

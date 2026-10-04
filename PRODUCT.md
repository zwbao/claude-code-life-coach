# Life Coach for Claude Code — product spec (v0.3)

## The bet
People who live in Claude Code spend most of their waking hours there. Phone wellness apps fail because they
know nothing about your day and interrupt at random. A coach *inside* Claude Code can (1) see the shape of your
work day without you logging anything, (2) speak at natural pauses instead of interrupting, and (3) hand you to a
world-class conversational coach (Claude) the moment you want to talk. It is calm by default and personal when invited.

## Who
Global. Developers and knowledge workers, 20–50, long sessions, late nights, deadline swings. UI in English or
Chinese (auto from system locale, switchable). Coaching follows the user's language (Claude replies in kind).

## Principles
1. **Calm.** Peripheral first (one band above the prompt). Never block, never interrupt a running turn. At most
   3 proactive nudges a day. One key to snooze, one command to go quiet.
2. **Small and concrete.** At most 3 active commitments, each written as "When X, I will Y" (implementation intentions).
3. **Evidence-graded, honest.** Every recommendation carries a grade (A/B/C) and a source. Celebrate real progress
   with the real research behind it; no fake precision, no scare tactics, no moralizing.
4. **Private.** Everything is stored on this machine. Nothing leaves it unless you talk to Claude. `/coach forget`
   erases it all. No hidden model calls: the plugin itself never spends tokens behind your back.
5. **Region-aware.** Global core library; region packs (China: 《高性价比人生指南》, 544 entries) only where they apply.

## Core loop
Notice → Nudge (at a pause) → Act (one key) → Reflect (daily/weekly, optionally with Claude) → Adjust commitments.

## v0.2 scope
- **Onboarding** (1 min, no model call): native multiple-choice dialogs: focus areas, bedtime goal, break interval,
  then an optional conversation with Claude to pick a first commitment.
- **Rhythm sensing**: time you work with Claude per day (from your prompts; gaps ≤12 min count as present; a day
  ends at 04:00), longest stretch, breaks, late-night minutes past your bedtime. Multi-session safe.
- **Nudges**: break (stretch ≥ your interval), bedtime (active past your bedtime), follow-up (coach promised to
  check back), weekly review (new week), onboarding (no profile yet). Shown in the band; a toast once per nudge.
- **Commitments**: check off from the band or pane; "never miss twice" streaks; milestones (3/7/21/66 days)
  celebrated with the evidence (Lally 2010: median 66 days to automaticity).
- **Coaching conversation**: `/coach <anything>` starts a turn in your words; the plugin attaches your context
  (profile, commitments, rhythm, notes) for the model only. Claude also knows it is your coach whenever you bring
  up life topics, via a short system-prompt section, and keeps quiet about life while you code.
- **Model tools**: `context`, `profile`, `commit`, `checkin`, `note` (memory + follow-up date), `library`.
- **Dashboard pane** (`/coach`): Today (commitments, rhythm, tip of the day) · Week · Me (settings, language,
  privacy, export, erase). `/coach tip [id]` opens any entry.
- **Library as the coach's evidence base, not a page**: Claude cites it; the tip of the day and each commitment's
  "why it works" open single entries in context. Nobody opens Claude Code to browse 559 entries — asking the coach
  is the better search. Essentials pack (bilingual, verified sources) + China region pack (the book).
- **Tip of the day as a reward**: once today's commitments are all checked off, the band hands its place to the tip.

## Not now (roadmap)
Calendar & wearable integrations, mood check-ins, opt-in frustration detection, buddy accountability,
more region packs (US/EU/JP), more UI languages, adaptive nudge timing learned from dismissals.

## Success signals (local, never sent anywhere)
Weekly active commitments ≥1; check-in rate; nudges acted-on vs dismissed; late-night minutes trend.

# Ball On: Design

Agreed with Carl on 2026-11-11 in a grilling session. Vocabulary is defined in `/CONTEXT.md`; the key decisions and their reasons are in `docs/adr/0001`–`0005`. This document describes v1.

## Purpose

Ball On keeps Rani, a WPBSA trainee referee at the stage of refereeing assessed matches, sharp on rulings at the table, especially Eventualities. Once Rani is fully confident in it, it's shared with fellow trainee referees.

## Source and scope

- The Rulebook is the WPBSA Official Rules, revised September 2024 (edition id `2024-09`). It's kept locally in `docs/source/`, which is gitignored and never committed.
- In scope: Snooker Sections 1–5, including Six Reds (S3 R19). Out of scope: Four-handed (S3 R18), the Snooker Shootout, English Billiards, and referee course material.
- Every Question carries at least one Rule Citation in the form `S3 R14(d)(ii)`, with explanations in our own words. Rulebook text is never reproduced.

## Question kinds

1. **Scenario**: the main kind. A described table situation, with an optional Table Diagram. Any judgement the referee would make is stated in the text, so there is exactly one Correct Ruling. The Learner answers in referee order:
   1. **Call**: one or more of NO FOUL, FOUL, FOUL AND A MISS, FREE BALL, TOUCHING BALL, PENALTY
   2. **Penalty Points**: 0 (none), 4, 5, 6 or 7
   3. **Options**: tick every one that applies, from the single fixed Options List (the same list for every Scenario)
   4. **Cue-ball**: where it lies, in-hand, or replaced
2. **Recall question**: a single fact, answered with a number or a pick from a short list.
3. **Judgement Call**: a situation that turns on the referee's opinion. The Learner commits to a view, then reads the considerations. It isn't marked and doesn't enter spaced repetition.

## Marking

Marking is strict. A Scenario counts as correct only if all four parts are right, with Calls and Options compared as sets. Each part is still shown marked separately, along with the explanation and citation. A Recall question is correct only on an exact match.

## Revising

- Opening the app shows **Today's Drill** first: about 10 Questions (Scenarios and Recall only), with Due Questions first and then a few new ones.
- **Topic practice** covers one Topic, including its Judgement Calls (unmarked).
- Spaced repetition: a wrong answer makes the Question due again soon; a right answer pushes it further out.
- A Learner can **Flag** a Question with a note. Flags are collected into one message and sent from the phone's share sheet, addressed to Rani.

## Storage

There's no backend and no accounts. Progress, Flags and Verdicts live in the device's local storage, with export/import of a backup file.

## Two builds (ADR 0005)

- **Learner app**: Reviewed Questions only. Drafts must not be present in its bundle at all.
- **Review build**: at a separate URL. It adds a Drafts mode where a Reviewer answers each Draft cold, sees the drafted Ruling marked against their answer, then records **Agree** or **Dispute** with a note. Verdicts are sent to Carl through the share sheet, and the question files are updated from them.
- Both are static and offline-capable (installable PWA), served from GitHub Pages out of a public repo.

## Build and ownership

TypeScript + Vite, with no UI framework. Claude owns the code. Questions and the Options List are plain JSON data files that Carl and Rani own.

## First content batch

- The Options List, for Rani to approve.
- About 15 Draft Questions each for **Foul and a Miss** and **Free Ball**, mostly Scenarios, with a few Recall questions and 1–2 Judgement Calls per Topic.
- Later Topics follow the order agreed in the session: Penalty Values, Touching Ball, Spotting Colours, End of Frame / Re-spotted Black, Ball on Edge of Pocket & Balls Moved, Push/Jump/Double Hit & In-hand, Snookered, Conduct/Concession/Time Wasting, Six Reds.

## Deferred (v2)

- Incidents: logging real situations from matches so they become Questions.
- Synced progress across devices.

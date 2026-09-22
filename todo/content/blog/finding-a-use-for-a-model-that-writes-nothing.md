---
title: "Jev doesn't generate text, so I went looking for a job in my own app it could do"
description: "A new AI provider whose model only scores, never writes. Finding a use for it, and working out what a second provider actually costs you, took longer."
date: 2026-09-22
status: published
tags: [engineering, ai, career]
goals: [ship-side-projects, write-in-public]
projects: [trail-to-offer]
---

Most new models claim to do what the last one did, slightly better. Jev does less on purpose: you cannot ask it to write anything.

You hand it some state and a question with ordered levels, and it returns which level the state sits at, plus a confidence. No prose comes back, so there's nothing to parse and no "respond only with valid JSON, I mean it" in a system prompt.

[My job tracker](/blog/a-job-tracker-i-wanted-but-didnt-need) already leans on Claude for cover letters, interview questions and scoring the answers. Trying Jev meant finding a job in my own product for a model that generates nothing.

## The feature that kept getting deferred

What I wanted from the start was gap analysis: read thirty job postings, tell me the requirement that keeps coming up and isn't anywhere in my documents.

It got deferred twice on the same wall. To compare requirements against evidence you first have to decide what a requirement _is_: the types, how strong each is, what counts as a match, how you normalise "JS" and "JavaScript", and what schema you hand the model. Five open questions that got no easier for being left alone.

A scoring model needs none of them answered: it never turns either side into typed objects, so there's no taxonomy to design first. What blocked the feature was the extraction, not the comparison.

## What I pointed it at

A **Footing** is one request scoring a job's posting against the resume and cover letter attached to it, across five dimensions.

Four describe you and make up the overall score: skills and experience weighted 0.30 each, domain and proof of work 0.20. The weights are a starting guess, commented as one. The cover letter gets the fifth, kept out of the overall, because a letter can be rewritten in a minute and a career can't.

Levels are authored as descriptions of situations, never as degrees. Not "moderately matched", but the thing itself:

```text
0  No work described beyond job titles and responsibilities.
1  Describes duties in detail, but nothing said to have shipped or concluded.
2  Names things delivered, without scale, outcome, or your own part in them.
3  Names delivered work with your part in it clear, or an outcome attached.
4  Names delivered work with your part, an outcome, and something a reader
   could go and look at: a link, a public artefact, a named product.
```

The criteria are fixed by me, the state is pure data, and no tools are attached, so the worst a hostile job description can do is nudge a level. A far smaller thing to defend than a letter writer.

## Five levels instead of four, for a boring arithmetic reason

The band thresholds (80, 60, 40) already existed, for the scorecard in [the interview simulator](/blog/my-job-tracker-interviews-me-now). Normalise four levels across 0-100 and exact hits land on 0, 33, 67, 100, which leaves Developing almost no territory and dumps too much into the bottom band. Five levels land on 0, 25, 50, 75, 100, and every band gets a home.

## What you give up when nothing generates

A Footing can't tell you what to write. No gaps, no citations, no quoted span, because nothing in the pipeline produces a sentence. "Proof of work: Not there yet" tells you where to look and precisely nothing about what to put there.

The mitigation is structural: five dimensions each carrying their own band, so the lowest at least points somewhere. One overall band alone would have been a number with no recourse.

What you get back is a column. Proof of work reading "Not there yet" across eleven active jobs is my original motivating sentence, as a query over stored rows.

## The price changes what you build

Every other model call in the app sits behind a weekly limit, because each one is a paid call and "unlimited" is a bill with no ceiling.

A Footing has no limit on any plan, and the reason is arithmetic rather than generosity. Jev costs $0.042 per _million_ input tokens and the output is free, so one Footing is about $0.0002. Scoring thirty jobs a week for a year costs roughly thirty cents. At that price the quota machinery costs more to maintain than the thing it protects.

There's still a daily ceiling in the scoring path, but as a circuit breaker rather than an entitlement: it's there so a re-score loop from a bug costs cents and stops.

## What a second provider costs that isn't money

One AI provider is a line in a readme. Two is a disclosure, a record that someone agreed to it, and a paragraph about what leaves your app. Jev is new enough that the honest version of that paragraph includes what isn't known: the privacy policy commits that input isn't used for training, but names no retention period, and there's no DPA or sub-processor list to link to. That gets disclosed rather than guessed at.

The obvious home for that record is a checkbox on the sign-up form, and it's the wrong home for a reason that generalises: you can get an account here through Google OAuth, so that form never renders for you. A checkbox there covers some users and not others, and the ones it misses are exactly the accounts nobody thinks about again. The gate sits after authentication instead, where it also backfills every account that existed before the terms did.

## Where this actually is

The Footing is a spec, a decision record and six tickets, with no code behind them yet. The interview simulator it's queued behind is [live, and I use it](/blog/my-job-tracker-interviews-me-now).

Weighing up a new provider on a side project, the model was the cheap part. Picking the feature it suited, making its output speak the app's existing vocabulary, and writing the disclosure were each a bigger job than the SDK call.

The [decision records](https://github.com/craigblunden/trailhead/tree/main/docs/adr) are in the repo, including the one saying plainly that this lesser feature ships instead of nothing, not instead of the gap analysis I actually wanted.

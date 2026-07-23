---
title: "Redundancy, momentum, and building in public"
description: "How I am turning an unexpected career reset into a focused six-month product and job-search sprint."
date: 2026-07-18
status: published
tags: [career]
---

I was made redundant after seven years at Repeat.gg. I'm treating it as runway, not a wall.

One honest framing first. Redundancy isn't a verdict on whether you were any good, it's a
business decision made a few levels above your desk, and dressing it up as either a tragedy or a
secret blessing helps nobody. What I do control is what I do with the months in front of me. So
here's the plan, plus a thank-you to the ride that got me here.

## Employee number seven to a Sony acquisition

I joined Repeat.gg as employee number seven, back when it was a small startup with a big idea: a
platform where people compete in tournaments across the games they already play and earn rewards
for it. I stayed for the whole arc, from that tiny team to the day Sony Interactive Entertainment
acquired us and folded us into the wider PlayStation family.

Riding a company with a dev team having a single-digit headcount to a Sony acquisition isn't something you can plan,
and it taught me more than any single technical decision. You watch every layer grow up at once:
the codebase, the team, the on-call roster, the expectations. Things that are perfectly fine at a
thousand users quietly become the thing that pages you on weekends when a much bigger crowd turns up.

## The scale problems were the fun part

We served tens of thousands of daily active users worldwide, so the interesting problems were
rarely "make this button work" and usually "make this button work when a big tournament ends and
thousands of people submit scores in the same second." Most of that lived in an event-driven,
microservices setup on Kafka, with MySQL and MongoDB behind it.

The bits I'm proudest of:

- Migrating the UI off PHP and Twig onto React, then proving out a path toward Next.js.
- Working directly with developers at Electronic Arts to debug, test and launch Battlefield into
  our tournaments. Shipping alongside a publisher that size is half code, half diplomacy between
  two very different companies.
- Building the original foundation for Jarvis, our internal admin tool, so support and
  game-admin teams could handle content, moderation, fulfilment and payments without borrowing an
  engineer. If the admin CMS in [the portfolio I'm building
  now](/blog/learning-csharp-by-building-in-public) feels familiar, that's not a coincidence.
- Getting flown to San Francisco to meet the wider Sony esports team and attend GDC, which is a
  genuinely strange and lovely thing to happen to someone who just liked making websites.

## Choosing momentum over panic

The two easy failure modes after a reset are panic-applying to everything and freezing entirely.
I've got runway from seven steady years and, for the first time in ages, uninterrupted hours. I'd
rather spend them deliberately than refreshing a job board.

So I'm running a focused five-month sprint on two tracks: the job search, and a real product I
build in public. The product is where I'm closing the biggest gap on my CV. My career has been
TypeScript, React and Node, one common half of the market. The other half, the one nearly every
listing pairs it with, is C# and .NET, so I'm learning it the only way that sticks for me:
building something real with my name on it. That story, including the deploy that quietly deleted
my database on every push, is in [Learning C# by building my portfolio in
public](/blog/learning-csharp-by-building-in-public).

## What I want from the next one

I don't know exactly what the next role looks like, but I know its shape: somewhere I can own
features end to end, work on things that break in interesting ways at scale, and sit on a team
that treats quality as part of the job rather than a phase bolted on at the end. Seven years in
one place showed me how much compounds when you stay and go deep. I'd like to do that again
somewhere new.

If you're building something like that and want a full-stack engineer who's equally at home in
the frontend, the backend let's talk. You can see what I'm building
at [craigblunden.dev](https://craigblunden.dev), where the goals on the homepage are, quite
literally, this plan in public.

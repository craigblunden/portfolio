---
title: "I built a job tracker I wanted but didn't need"
description: "A weekend idea about tracking job applications turned into a multi-tenant app built entirely with Claude Code. Here's what I decided, what I'd do differently, and where it might go."
date: 2026-09-15
status: published
tags: [engineering, ai, career]
goals: [ship-side-projects, write-in-public]
projects: [trail-to-offer]
---

I'm applying for my next role with a target start date of November 16th and so far this early in the process I've been selective about what I go for.

Job searches spreads itself out whether the list is long or not. The role
sits in one tab ( which site was that again? ), the resume that went with it is in a folder, the recruiter's name is in my email and the follow-up I meant to send is nowhere at all. Stitching that back together by hand is exactly the kind of small repeated chore that makes a good excuse for a side project.

So: [trailtooffer.com](https://trailtooffer.com). A board for job applications, including the resume
and cover letter that went out with each one and the people attached to them.

## I didn't check whether this already existed

It does, obviously. Notion templates, spreadsheets, a dozen products that do this properly. I
skipped the research on purpose, because finding the best job tracker was never the point. I wanted
to automate something I was already doing and see how far I could get with Claude Code writing all
of it.

That's the opposite of how I built [my portfolio](/blog/learning-csharp-by-building-in-public),
where I used AI as a tutor and typed every model and test myself because the friction was the point.
Here the friction wasn't the point. Every line of this codebase was written by AI iterating against
my direction and my quality gates, which makes the interesting part of the project the decisions
rather than the code.

I also themed the whole thing around hiking, because I hike and side projects are supposed to be
fun. Applications move along a trail through five stages, the board columns have trail markers, a
job page is framed as a summit attempt, and the loading state is a little hiker. It's silly. The
repo is still called `trailhead` from before the product had a name and learned thats owned by Salesforce.

## What I actually wanted to build

Underneath the job tracker was a thing I'd been wanting an excuse to build: a proper multi-tenant SaaS
app, from an empty database up. Most of my career has been on systems where the tenancy question
was settled years before I arrived, so I'd inherited those decisions rather than made them. This was
a chance to make them.

It's one Next.js app on Vercel with Supabase behind it for Postgres, auth and file storage, plus one
call out to Claude to write cover letters and Resend for the feedback button in the header. Small
stack, and most of the thinking went into four calls.

**Isolation lives in the database, not in my code.** Every row knows who owns it, and the database
refuses to hand back anything that isn't yours, whatever the application asks for. There's no admin
key anywhere in the project that could bypass that. Application code that forgets to check is a bug.

**Files go from the browser straight to storage.** The app never handles the bytes, which keeps a
whole class of upload problem out of the request path. Deleting turned out to be the interesting
half: an upload link can outlive the record it belonged to, so a deleted document leaves a marker
behind until it's genuinely safe to forget, and a scheduled job tidies up after it.

**Writing a cover letter happens off the main path.** It takes 10 to 25 seconds, and in this
framework a slow write on a page will happily block every other write on that page. Nobody should
wait on a model call to save a note, so generation goes through its own endpoint and the rest of the
page stays live.

**The last draft of a letter is kept on the server.** You can read a letter, say "shorter, lead with
with a specific project", and have it rewritten. The easy version sends the old letter back up from the
browser with your feedback attached. The version I shipped doesn't, because text the browser hands
back is text any user can rewrite to say whatever they like before it reaches the model. Feedback is
treated as notes about the letter, never as instructions to the thing writing it.

## How it got built

Every feature started as a spec, got argued over, then got broken into numbered tickets before any
code existed. The repo has a glossary that defines the domain language and, more usefully, lists the
words to avoid. A job is never an "application", a recruiter is a kind of contact rather than its own
record, a limit and a quota are different things. When the AI names something, it names it the way I
would.

Contested calls became decision records with the options I rejected and why, which is the part I
expected to find tedious and didn't. There's also a document tracking which earlier requirements
stopped being true and what replaced them, because at this pace things stop being true fast.

The quality control was a gate rather than a vibe: one command runs lint, typecheck, unit tests,
integration tests against a real local database, and browser tests including accessibility and
contrast, and CI runs the same command on every push. The architectural rules are enforced by tests
too, so a layer can't quietly start doing another layer's job.

## What I'd change about the process

I used [Matt Pocock's skills](https://github.com/mattpocock/skills), and the foundations are easy to
pick up and produce good results. Domain modelling, ticket breakdown, decision records, and a
grilling session that stress-tests an idea before it becomes code is most of what held a project
this size together.

The gap I felt was per-feature tightening. I've played with [Addy Osmani's
skills](https://skills.addy.ie/skills/code-simplification/) elsewhere, and his code-simplification
pass is the one I kept wanting as each feature landed. What I reached for instead was a
codebase-wide architecture review, which is a bigger hammer that naturally runs later. It did good
work, but some of it was cleaning up things a smaller pass at the time would have caught for free.

These are tools in a process, not the process. I could have been firmer with my inputs, or gone
slower and pushed each output closer to my taste. Going slower wasn't the point.

## Where it goes

Plans already exist in the code (free, basic and pro), and a plan is nothing but a set of limits:
how many documents you can keep, how many letters you can write a week. There's no billing, no
checkout and no upgrade prompt. Changing a plan today means me running a script.

That was deliberate. Building the framework let me settle the design question without touching
Stripe, and the question was whether a paid plan should be bigger numbers or unlocked features. I
went with numbers. The two features I want for pro are a look across every open application to find
the requirement that keeps coming up and isn't in my documents, and a look back at which resumes and
letters went out with the applications that got somewhere. Both cost model calls, so both need a
"how many" answer regardless, and a limit of zero does the same job as a feature flag without every
check in the codebase learning a second shape.

Whether anyone would pay for that is a different question, and not one I can answer from a sample
size of one.

## Dogfooding, live

I've spoken to a handful of recruiters and applied direct to a few places. No interviews lined up
yet, but it's early and November is a way off. In the meantime I'm running my own search through the
thing I built, so every annoyance I hit becomes a ticket and the letter I send next week should be
better than the one I sent last week.

That's the actual test. Not whether the board looks nice, but whether it makes me better at the
thing it's tracking.

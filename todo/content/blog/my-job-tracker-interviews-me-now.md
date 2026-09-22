---
title: "I let my job tracker interview me, and it marked me down for running out of time"
description: "I added a spoken interview simulator to my job tracker and then rehearsed with it. Talking at my own laptop is stressful and faintly ridiculous, and it still told me things I hadn't noticed."
date: 2026-09-22
status: published
tags: [engineering, ai, career]
goals: [ship-side-projects, write-in-public]
projects: [trail-to-offer]
---

A week ago I wrote about [a job tracker I built and didn't need](/blog/a-job-tracker-i-wanted-but-didnt-need). Since then it has grown a microphone.

The tracker was a board, some documents, and one model call that writes a cover letter you then read. Everything in it was something you filed. I wanted one thing you actually do, because rehearsing out loud is the bit of interview prep I avoid.

So: the Interview Simulator. Pick a job, and it writes a question set from that job's description and the resume attached to it, across five categories. One countdown for the whole run. You answer out loud, and at the end it scores what you said.

The first version was silent on an iPhone, and it marked me down for questions it never got around to asking.

## No audio ever leaves the browser

Answers are spoken and the browser transcribes them itself. What crosses the network is text. Nothing records you, nothing uploads, nothing is stored but the words.

That's the nice version. The honest version is that it buys privacy with compatibility: a browser that can't transcribe can't start a run at all, and someone who can't speak, or would rather not, can't use the feature. That's written into the spec as accepted "for now", rather than left as a thing nobody said out loud.

You could originally type your answer instead, which would have covered it. Removing that came out of watching one person use it (Read: Begging my girlfriend to try my sweet new feature).

## A first phone test broke four things in two minutes

I watched a first-time user take a practice round on an iPhone. In the first two minutes they:

- couldn't get off the board, because the only navigation was behind an avatar menu that says nothing about what's in it
- heard nothing when the question was supposed to be read aloud
- had to scroll up to find the clock
- couldn't tell how many questions there were, when the clock started, or what the microphone prompt was for

The silence was the interesting one. The page reads each question aloud, then starts the clock and the microphone when the voice finishes. On iOS the voice never arrived, so the run sat there waiting, for up to twenty seconds, for something that was never coming.

You can't reliably detect a browser quietly declining to speak. So the fix doesn't try: if the voice hasn't started within about a second and a half, it's dropped and the run moves on regardless. A fallback on a timer rather than on a signal, because there is no signal. An unmistakable "Your turn" now marks the handover, so the moment the clock starts is a thing you see rather than a thing you infer.

The rest was ordinary mobile work: a hamburger menu, the clock pinned to the top and Submit to the bottom, typing removed so there's one way to answer, and a one-question tutorial before anyone's first run.

None of that came out of a design review. It came out of sitting next to someone holding a phone.

## The scorecard was too harsh, and it was the weighting

Then I used it myself, got a mediocre score, and felt hard done by.

A question the countdown never reached was being sent to the scorer as silence, and marked at the bottom of the scale at full weight. Running out of time didn't cost you a question. It halved your score.

An unreached question now isn't sent to the model at all. The app gives it nothing at half weight. Five questions, three answered at 80, two never reached: that's 60 overall, where full weight gave 48. Being cut off costs something, just not as much as answering badly.

The clock hitting zero mid-answer keeps whatever you'd said and scores it. If you hadn't started, the question is unreached, so one put up in the last five seconds isn't a zero.

Question budgets became per-category, because a minute each is silly when the categories are this different:

| Category    | Answer time |
| ----------- | ----------- |
| Personal    | 1½ min      |
| Behavioural | 2½ min      |
| Stakeholder | 2 min       |
| Technical   | 3 min       |
| Design      | 4 min       |

It's a guide, not a cut-off: the run keeps one countdown, so spending your design budget on a story about a standup is your own business. The scorer is told each answer time and judges depth against it.

The last change is the one I'd defend hardest. The score stopped being a number.

Scores are still 0-100 in storage. On screen you get five stars in half steps beside a band word: Strong, Solid, Developing, or Not there yet. Each answer gets "What landed" in one sentence, and one to three "Missed points", each a specific thing you could have said, drawn from the posting or your own resume.

A number invites you to argue with the number. "You didn't mention the Kafka migration on your resume" invites you to mention it next time.

Talking at a laptop with a countdown running is stressful and faintly ridiculous. What surprised me was the missed points: things already on my own resume that I hadn't thought to reach for.

## Where this is

The simulator is live on [trailtooffer.com](https://trailtooffer.com), and I've taken enough runs to have opinions about my own answers.

Last time I said the real test wasn't whether the board looked nice, but whether it made me better at the thing it tracks. A board can't do that. It only records what I already did. Something that makes me talk at my laptop for thirty minutes and then tells me which two things to change has at least got a shot.

The feature queued up behind it came at the problem backwards: [a new model that can't write anything](/blog/finding-a-use-for-a-model-that-writes-nothing), and a search for something in this app it could usefully do.

Yeah. I think ClassTrace is much better than it was, but after walking the current main flow as a new teacher instead of grading the implementation, I see a pretty specific problem:

**The product has a stronger idea than the experience currently reveals.**

The strongest part is dead simple: something happens in class, I type one sentence, ClassTrace remembers it so Future Me doesn't have to. The app currently surrounds that idea with enough evidence-management machinery that it can start feeling like an evidence-management app instead of a relief-from-documentation app.

The biggest miss is what happens immediately after Capture.

You type something like “@Mary solved the fraction problem independently #fractions,” hit Capture, and ClassTrace actually does something useful: it parses the student, evidence type, topic, performance, behavior, tags, follow-up information, etc. But the UI presents that transformation pretty quietly as metadata underneath the note. Then the prominent next action is **“Review before saving.”**

So instead of:

> Oh shit. I wrote a sentence and ClassTrace filed it.

the experience risks becoming:

> Okay, I wrote a note. Now I have to go finish entering it.

And when I open review, that feeling gets stronger. I get Evidence note, Evidence date, Evidence type, Topic / skill, Performance, Behavior / work habit, Tags, Follow-up notes, plus student resolution when needed.

That is probably the single biggest product problem right now.

Your architecture says ClassTrace does the filing while keeping the teacher in control. The UI says, somewhat unintentionally, **“ClassTrace started a form for you.”**

I would attack that before almost anything else.

The review should feel like approving what ClassTrace did, not completing what ClassTrace started. There is a massive experiential difference between those two things. Most captures should probably result in something closer to a compact “Here’s how I filed this” preview with student, type, topic/tags, date, and a single obvious **Save** action. “Edit details” can expose the full machinery. Right now the machinery is the experience.

That also means the most impressive ClassTrace moment isn't being given enough visual weight. After capture, the transformation itself should be unmistakable:

**You wrote:** Mary self-corrected her fraction model without prompting.

**ClassTrace filed it under:** Mary · Math / Fractions · Independent · Sep 10

That transformation is the fucking product. Currently it's treated almost like supporting metadata.

There is another major problem before users even get there: **the app makes them earn the aha moment.**

A genuinely new workspace gets routed into roster setup. The teacher must create a class and add a student before Capture opens.   That makes sense for data integrity. It is bad for product discovery.

Imagine I heard about ClassTrace from another teacher and I'm just checking it out. I sign up.

My first task is... create a class.

Then add a student.

I have still not seen ClassTrace do anything.

That is dangerous because roster management is the least differentiated part of the entire product. Every school tool on earth has roster setup.

I'd seriously consider some version of a sample experience before demanding setup, even if it's only a temporary “Try a capture with Sample Student” interaction. The goal isn't onboarding theater. The goal is that within 30 seconds I should understand exactly why ClassTrace exists.

There is also a vocabulary problem. Not catastrophic, but it's accumulating.

You currently have **Capture**, **Feed**, **draft**, **Needs review**, **Validated**, **saved evidence**, **trace**, **Students**, **Explore**, **report**. Navigation says Capture / Explore / Students / Settings. Internally the Capture page is called Feed. That page's big section is “All evidence,” even though it contains both drafts and saved evidence. Explore's route context is “Saved evidence.” Student pages contain “Evidence.”

I can understand all of it after studying the product.

A teacher shouldn't need to.

In particular, **“All evidence” containing drafts that explicitly aren't evidence yet** feels semantically muddy. The distinction between “capture,” “draft,” and “evidence” is extremely important to your privacy/trust model, so the UI should make that distinction simpler rather than use “evidence” as the umbrella term.

Then there's Explore.

I like Explore. I actually think it's the piece that turns ClassTrace from “good anecdotal record keeper” into something more interesting.

But right now it sells itself like a sophisticated filter builder.

“Show me evidence for Mary tagged #fractions from the last 30 days” is a good interaction. Visually composing the question from slots is much more interesting than a sidebar full of filters. But underneath it, the explanatory value proposition is still “student + class + tags + dates + photos + group by student.”

That's functionality.

The value is:

**Thursday morning, someone asks you how Mary has been doing with fractions, and you have the answer in five seconds.**

That's the thing I'd keep hammering.

Not because you need more marketing copy. Actually, I think you need less explanation of capabilities and more moments where the app demonstrates the consequence of using them.

Explore also has a mild expectation problem because you say **“Ask questions of the evidence.”**  That phrase sounds more intelligent than what the feature actually does. I don't mean “add AI.” I specifically wouldn't knee-jerk into that. But “ask questions” makes me expect reasoning, trends, synthesis, or at least interpretation. Explore currently retrieves exact matching records.

That's still useful as hell. Just make the promise match the magic: **find the evidence you need without remembering where you put it.**

The Student page has a similar issue.

It's attractive conceptually: student name, evidence count, date span, timeline, report, export.  But after I've been diligently feeding ClassTrace for three months, what do I get when I open Mary?

“14 pieces of validated evidence, Sep 8 – Dec 3.”

Then the records.

That is essentially a beautifully organized folder.

ClassTrace should be allowed to give me more value from the structure it already has without becoming an analytics dashboard or generative-AI product. You already possess dates, topics, types, performance, behavior, tags and follow-ups. Deterministically surfacing something like **“14 observations · 6 fractions · 4 independent · 2 follow-ups”** or “Most recent evidence: 3 days ago” would make the accumulation feel alive. Clicking any of those can simply filter down to the underlying evidence.

That's especially important because the report has the same limitation. It's clean and practical, but it is basically a printable list of records with a date range.  That's a useful output. It's not yet the feature that makes someone think, “I'm never going back to random notes.”

The landing page, weirdly, sells ClassTrace better than parts of ClassTrace.

“Write one sentence about one student” is excellent. The 10-seconds-mid-lesson framing is excellent. “Later, when the meeting comes...” gets at the actual problem.

But then you start spending a lot of your limited attention budget explaining the internal rules of the product. The entire “Small on purpose” section is six separate constraints: one student per record, approve every record, no generative AI, raw notes aren't stored, drafts clear at midnight, one teacher/one workspace.

Those are admirable product decisions.

They're not six equally important reasons I want ClassTrace.

You're giving trust architecture almost equal stage time to the actual benefit.

“No AI / teacher approval / private drafts” matters because it removes objections after I'm interested. It doesn't create the interest.

And I think this connects to the larger thing that's been bothering you with ClassTrace's identity.

The current product still has some residue of **“student evidence hub.”**

But the thing that's distinctive isn't the hub.

It's the transition:

**Notice something → dump one sentence → stop thinking about organization → find it exactly when it becomes useful.**

That's ClassTrace.

Explore, the student trace, reports, tags, structured fields, photos: those are all downstream manifestations of that idea.

Right now some screens make the downstream system feel like the product itself.

If I ranked what I'd change, I wouldn't start redesigning everything again. I'd do this:

1. **Make the post-Capture moment dramatically better.** Show me what ClassTrace understood and where it is going. Default interaction should feel like approval, not form completion.
2. **Get a new user to one real Capture before making roster administration feel like their first job.**
3. **Let accumulated evidence visibly compound in value.** Student pages especially should reveal useful structure, not just contain records.
4. **Simplify the evidence/draft/feed mental model.** Capture, saved evidence, find it later. That's probably enough conceptual architecture for a teacher.
5. **Reframe Explore away from “powerful filters” and around “I need an answer right fucking now.”**
6. **Demote trust/boundary explanations relative to the actual teacher problem.** Keep them, because they're unusually strong for this product, but don't make them carry equal marketing weight.

And the important part: **I would not respond to this critique by adding features.**

You've got enough product.

There is already a pretty damn compelling loop hiding in here:

**I notice → I write → ClassTrace files → I approve → months accumulate → I ask → there it is.**

The weakness is that the current experience emphasizes **I write → I review fields → I save → I browse records.**

That's a much less exciting product.

The next round of work should be about making those two descriptions become the same experience.

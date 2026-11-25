---
name: hackathon-idea-forge
description: Generate and package winning hackathon ideas from a brief: sponsor's deep primitive, one real failure mode, a fail-closed guarantee, and proof in the demo.
---

# Hackathon Idea Forge

Generate hackathon ideas that place, not ideas that merely sound smart. This process is distilled from ~40 placing projects across Nervos Fiber, AMD x Dify, Backblaze, Convex All Gas, Dakota, BOT Chain, Cleanverse x Monad, Morpho/iExec, and x402 events.

## Core thesis

A winning idea combines five things:

1. The sponsor's **distinctive** primitive
2. One **named** production failure
3. A guarantee the system **enforces**, so it fails closed
4. **Proof** shown in the demo
5. A scope the team can **finish** before the deadline

In these ideas, AI is a component, not the product.

## Step 1: Gather inputs

Collect:
- The brief, tracks, judging criteria and their weights, and prizes
- The deadline and time remaining, and the required stack
- The team's skills and any reusable code
- Pains the user has personally hit; these are the best seeds

If the user gives a URL, fetch it. If critical info is missing (the brief, the time available), ask once, with at most 3 questions. Otherwise proceed.

## Step 2: Decode the sponsor

- **List the sponsor's primitives and tag each one.** HEADLINE means everyone will use it. DEEP means most teams skip it, for example B2 Object Lock, lifecycle rules, and event notifications; Fiber hold invoices; 402 response semantics; confidential compute. Ideas should lean on the DEEP ones.
- **Write one sentence on what ONLY this stack makes possible.**
- **Ask what the sponsor needs to exist.** Devtools, SDKs, and integration paths for a young ecosystem win often.
- **Map each judging criterion to something visible in the demo.**

## Step 3: Mine failure modes

List 10 or more concrete failures that already happen in production in this domain. Use this shape: "X appears to succeed, but Y."

Examples:
- A health check passes, but a real payment fails or double-charges.
- A promo credit silently disappears, and support claims it was fixed.
- A booking times out. Did it go through?
- An agent holding a key can drain the wallet.
- Settling publicly forces you to reveal your strategy.
- Generated media is corrupted or unprovenanced, and nobody checks.
- A plan silently breaks when someone drops out.

Prefer failures the user has personally hit.

## Step 4: Name the generic ideas, then ban them

Write out the 5 to 8 ideas most teams will submit for this brief. Typical examples are a chatbot over docs, a "copilot for X," an AI portfolio manager, a DAO assistant, a generic dashboard, an agent that books things, and a plain demo of the chain. All of these are off the table.

## Step 5: Generate at least 15 candidates using these moves

- **Fence the agent.** It acts inside caps, allowlists, or scoped sessions, and violations are blocked at the enforcement layer. (BotSpend, Clasp)
- **Verify before release.** Use escrow plus a verifier that triggers PAY, REFUND, or SLASH. (Metrx, Fiber LSP Kit's deliver-or-refund)
- **Reveal one output.** Inputs stay private and only one result goes public. (Kyrve, Azimuth)
- **Move state, not assets.** (Conduit)
- **Real-client CI.** Test a system by actually using it, with capped real money. (Selo)
- **Require evidence for claims.** Refuse to act until there's proof. (Kept, Rivet refuses export, firstframe auto-retries and locks the approved master)
- **Repair loop.** Detect staleness, re-plan, and request cover. (Parallel)
- **Port a proven primitive.** Bring something from another ecosystem. (FiberNuts brought Cashu to Fiber; Fiber Paid HTTP adapted 402 to Fiber)
- **"X for Y" devtool.** One-command local network, failure-reproduction lab, or preflight probe. (fiber-forge "Polar for Fiber," Fiber Test Lab, Lightr, DevStation)
- **Vertical wrapper on rails.** Point the sponsor's generic rails at one specific customer. (GuildPay for esports guilds, IndieBank for freelancers)
- **Local and private as the value.** Data never leaves the user's hardware. (SignalForge, Rivet)
- **Build system or provenance.** Content-addressed, rebuild only what changed, re-hash on read. (takegraph, beavous)
- **Simple shared object.** Every sponsor tool fits naturally. (OurSpaces)

## Step 6: Score and cut to the top 3

Score each candidate 1 to 5 on:
- Primitive depth
- Failure specificity
- Fail-closed guarantee
- Demo-ability
- Finishability
- Judging fit
- Originality
- Buyer clarity

Then run three tests:
- **Delete-AI test:** Is it still interesting with "AI" removed from the pitch?
- **One-sentence test:** Can you explain it to a judge in one sentence?
- **Collision test:** Will 3 or more teams submit this? If so, either win on completeness and packaging (Clasp beat the near-identical FiberGuard Session that way) or drop it.

Also check that the fail-closed guarantee is verifiable by the system itself (for example, an on-chain revert) and does not depend on an off-chain party's claim.

## Step 7: Package each finalist in this format

- **Name:** One coined, ownable word, like Kyrve, Clasp, Selo, Rivet, or Conduit. Avoid AI-, -GPT, and Chain- names.
- **One-liner:** What it is, in plain nouns. For example: "Cross-chain delivery-versus-payment for restricted assets."
- **The failure:** 1 to 2 concrete sentences, ideally in the "appears to succeed, but" shape.
- **Mechanism:** 3 to 5 sentences in the sponsor's nouns. Who funds what, what holds it (escrow, vault, session), what checks it (verifier, policy engine, ratifier), and what commits.
- **Boundary:** What stays put, what crosses, and what becomes public.
- **Refusal:** The fail-closed rule, meaning what the system will not do.
- **Proof:** The measurable guards and evidence you'll show, such as counts, verified contracts, receipts, and hashes.
- **Tagline:** 8 words or fewer, built on tension. For example: "One quote. The curve stays private."
- **Sponsor mapping:** Each required tool, and its job.
- **Demo script (90 seconds):** First the happy path. Then the attack, like a duplicate webhook, an over-limit spend, a stale write, or a retry that double-charges. Then show the system holding.
- **Scope cut:** What ships by the deadline, what's stretch, mainnet or testnet, and what's mocked. Be honest.
- **Risk:** The hard problem you are not solving.

## Output

1. Lead with the top pick and why it wins.
2. Give the 3 packaged ideas.
3. Give a compact scoring table.
4. List the banned generic ideas in one line.

Keep it scannable, with no padding.

## Anti-patterns

- AI as the product
- A chain demo with no user problem
- Touching every track or feature shallowly
- Claims without proof, or mocking the core primitive
- Scope too big to finish; completeness is weighted heavily
- Vague or generic names

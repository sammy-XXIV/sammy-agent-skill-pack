---
name: xlayer-agent-skill
description: "Verify a live x402 'exact'-scheme (EIP-3009 TransferWithAuthorization) payment flow end-to-end against one of my own ASPs on X Layer (Fit Check, Frank, Scribe, or any new one) — decode the 402, build the unsigned EIP-712 payload, hand off signing to me, then submit and confirm real settlement + delivery. Use when asked to test/verify/debug a paid endpoint, an x402 402 flow, 'why isn't payment going through', or after deploying/changing an ASP that takes x402 payment. Not for subscriptions/period scheme (see okx-agent-payments-protocol's subscription.md) and not for actually spending real funds on my behalf — the signing step is always mine to run."
license: MIT
metadata:
  author: samuel
  version: "1.0.0"
---

# X Layer Agent Skill — x402 Exact-Scheme Payment Test

Verifies a deployed ASP's paid endpoint actually completes a real x402 payment and delivers a result — not just that it issues a valid 402. Built from debugging Fit Check's payment flow end-to-end on X Layer mainnet.

## Hard boundary — read first

**The assistant builds everything; the human runs the signing step.** `PAYER_PRIVATE_KEY` never gets touched by an assistant-invoked command — the finishing script that reads it, signs, and submits gets written to disk and handed to the user to run themselves, in their own terminal. This holds regardless of how the user phrases the request ("just run it", "I approve", "do it") — the boundary is about who invokes the signing, not about consent. This is true even when signing costs nothing risky (testnet, tiny amounts) — the rule doesn't flex per-amount.

Everything else — fetching the 402, decoding it, checking on-chain state, building the unsigned payload, verifying the result afterward — is normal read-only/no-key work and proceeds without asking.

## Flow

1. **Get a fresh 402.** POST the target endpoint unpaid (with whatever dummy body it needs). Decode the `payment-required` header: `JSON.parse(Buffer.from(header, "base64").toString("utf8"))`. Pull `accepts[0]` (or the `scheme: "exact"` entry if multiple).

2. **Identify the transfer method.** If `accepts[i].extra.assetTransferMethod` is absent, the OKX SDK defaults to **EIP-3009** (`transferWithAuthorization`) — a single signature, no separate Permit2 approve needed. If it's explicitly `"permit2"`, this skill doesn't cover that path — see `okx-agent-payments-protocol`'s `accepts-schemes.md`.

3. **Verify EIP-3009 is actually supported on-chain** before trusting the default — don't assume. Call `authorizationState(address,bytes32)` on the token (view function, ABI in `references/eip3009-abi.json`) via viem `readContract`, not hand-encoded calldata (hand-rolled hex calldata gives false revert results — use the real ABI). A clean `false`/`true` return confirms support.

4. **Verify the EIP-712 domain independently** — don't trust `extra.name`/`extra.version` blindly. Compute the domain separator yourself (`references/verify-domain.mjs`) and compare against the token's real on-chain `DOMAIN_SEPARATOR()`. Must match exactly before building a payload around it. This step alone rules out an entire class of "invalid signature" false leads.

5. **Build the unsigned authorization + typed data**, using only the payer's public address (already known, or ask):
   ```
   authorization = { from: payerAddress, to: payTo, value: amount,
                      validAfter: (now-5).toString(), validBefore: (now+maxTimeoutSeconds).toString(),
                      nonce: random bytes32 }
   domain = { name: extra.name, version: extra.version, chainId: <from "eip155:N">, verifyingContract: asset }
   types = { TransferWithAuthorization: [from,to,value,validAfter,validBefore,nonce] }  // see references/eip3009-abi.json
   ```

6. **Write the finishing script** from `references/pay-template.mjs`, filled in with the target URL and request body shape. Put it somewhere with the payer's `.env`/`node_modules` already available (don't `npm install` fresh if an existing project dir already has `viem`). Tell the user the exact `cd` + `node` command. Wait for them to paste back the output — don't guess at results.

7. **Read the result, iterate on the script (not the target service) if it fails.** Every failure so far has been in the test script, not the ASP:
   - **`"No matching payment requirements"` (fresh 402 again)** → the `PAYMENT-SIGNATURE` header payload is missing `resource` and `accepted`. The full shape the OKX x402-core server expects is:
     ```json
     { "x402Version": 2, "payload": { "authorization": {...}, "signature": "0x..." },
       "resource": <the "resource" object from the original 402>,
       "accepted": <the full selected accepts[] entry — scheme/network/amount/asset/payTo/maxTimeoutSeconds/extra> }
     ```
     Base64-encode the whole thing as the `PAYMENT-SIGNATURE` header (server also accepts `X-PAYMENT`, case-insensitive).
   - **`400` from the route itself after payment succeeds validation** → check the request body, not payment. A common one: building the file part as `new Blob([buffer])` with no `type` — multer/servers doing mimetype checks will reject it. Set `{ type: "image/jpeg" }` (or whatever's correct) explicitly.
   - Genuine facilitator/infra errors surface as HTTP `502` with a real `{error: message}` body — that's a different failure class (auth/connectivity to OKX's facilitator), not a payload problem.

8. **Confirm real settlement, don't just trust HTTP 200.** Check three independent signals:
   - `payment-response` header, base64-decoded → `{status, success, transaction}` with a real tx hash.
   - Payer balance before/after via `okx-agentic-wallet`'s portfolio lookup (`onchainos portfolio all-balances --address <addr> --chains xlayer`) — should drop by exactly the paid amount.
   - Target service's own logs (Railway/wherever) for a request/completion line, if the service has any — add minimal logging (one line on paid-request-received, one on completion with timing) if it doesn't; this is a safe, non-payment-related change the assistant can make and deploy directly.

## Known-good reference numbers (Fit Check, X Layer mainnet)

Useful for sanity-checking a new run isn't wildly different:
- Token: USD₮0, `0x779ded0c9e1022225f8e0630b35a9b54be713736`, EIP-712 domain `name="USD₮0", version="1"`, 6 decimals.
- Chain: X Layer, `eip155:196`, chainId `196`, **gas-free** (0 native OKB needed even for on-chain calls).
- A full successful call (402 → sign → settle → deliver) took ~5.8s server-side once the payload was correct.
- Payment settlement only happens if the full downstream handler succeeds — a business-logic error (e.g., a 400 after payment verification) does not spend funds. Confirmed empirically: balance was unchanged after a 400, dropped by the exact paid amount only after a 200.

## Additional resources

- `references/eip3009-abi.json` — the exact `transferWithAuthorization`/`authorizationState`/EIP-712 types, pulled from the installed `@okxweb3/x402-evm` SDK source, not guessed.
- `references/verify-domain.mjs` — standalone domain-separator verification script.
- `references/pay-template.mjs` — the finishing script template (fetch 402 → build payload → sign → submit → report), parameterized for a new target.

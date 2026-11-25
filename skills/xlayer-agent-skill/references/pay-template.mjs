/**
 * Template: signs and submits a real x402 "exact"-scheme (EIP-3009) payment
 * to a target ASP endpoint, using a local PAYER_PRIVATE_KEY from .env.
 *
 * THE ASSISTANT MUST NEVER RUN THIS ITSELF — write it to disk, hand the exact
 * `cd`/`node` command to the user, and wait for them to paste back the output.
 * This holds regardless of how strongly the user asks otherwise.
 *
 * Fill in TARGET_URL and buildRequestBody() for the specific ASP, then:
 *   node pay-template.mjs
 */
import { readFileSync } from "fs";
import { getAddress, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const TARGET_URL = "https://REPLACE-ME.up.railway.app/REPLACE-ME"; // the paid endpoint

// Build the request body/form for BOTH the unpaid probe and the paid submit.
// Multipart example (Fit Check-style): file + form field, MIME type MUST be
// set explicitly on the Blob or the target's own body validation may 400.
function buildRequestBody() {
  const form = new FormData();
  // form.append("photo", new Blob([readFileSync("/path/to/file.jpg")], { type: "image/jpeg" }), "file.jpg");
  // form.append("someField", "someValue");
  return form;
}

const envText = readFileSync(new URL("./.env", import.meta.url), "utf8");
const match = envText.match(/^PAYER_PRIVATE_KEY=(0x[a-fA-F0-9]{64})/m);
if (!match) throw new Error("PAYER_PRIVATE_KEY not found in .env");
const account = privateKeyToAccount(match[1]);

const authorizationTypes = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};

function safeBase64Encode(str) {
  return Buffer.from(str, "utf8").toString("base64");
}

async function main() {
  console.log(`Payer: ${account.address}`);

  const challenge = await fetch(TARGET_URL, { method: "POST", body: buildRequestBody() });
  if (challenge.status !== 402) throw new Error(`expected 402, got ${challenge.status}`);
  const prHeader = challenge.headers.get("payment-required");
  const decoded = JSON.parse(Buffer.from(prHeader, "base64").toString("utf8"));
  const requirements = decoded.accepts.find((a) => a.scheme === "exact");
  if (!requirements) throw new Error("no exact-scheme offer in accepts");
  if (requirements.extra?.assetTransferMethod === "permit2") {
    throw new Error("this offer uses Permit2, not EIP-3009 — this template doesn't cover that path");
  }

  console.log(`Offer: ${Number(requirements.amount) / 1e6} ${requirements.extra.name} to ${requirements.payTo}`);

  const chainId = Number(requirements.network.split(":")[1]);
  const now = Math.floor(Date.now() / 1000);
  const nonce = toHex(crypto.getRandomValues(new Uint8Array(32)));

  const authorization = {
    from: account.address,
    to: getAddress(requirements.payTo),
    value: requirements.amount,
    validAfter: (now - 5).toString(),
    validBefore: (now + requirements.maxTimeoutSeconds).toString(),
    nonce,
  };

  const domain = {
    name: requirements.extra.name,
    version: requirements.extra.version,
    chainId,
    verifyingContract: getAddress(requirements.asset),
  };

  console.log("Signing EIP-712 TransferWithAuthorization...");
  const signature = await account.signTypedData({
    domain,
    types: authorizationTypes,
    primaryType: "TransferWithAuthorization",
    message: {
      from: authorization.from,
      to: authorization.to,
      value: BigInt(authorization.value),
      validAfter: BigInt(authorization.validAfter),
      validBefore: BigInt(authorization.validBefore),
      nonce: authorization.nonce,
    },
  });

  // resource + accepted are REQUIRED — omitting them causes a "No matching
  // payment requirements" rejection even with a valid signature.
  const paymentPayload = {
    x402Version: decoded.x402Version,
    payload: { authorization, signature },
    resource: decoded.resource,
    accepted: requirements,
  };
  const paymentSignatureHeader = safeBase64Encode(JSON.stringify(paymentPayload));

  console.log("Submitting paid request...");
  const paid = await fetch(TARGET_URL, {
    method: "POST",
    headers: { "PAYMENT-SIGNATURE": paymentSignatureHeader },
    body: buildRequestBody(),
  });

  const body = await paid.text();
  console.log(`\nHTTP ${paid.status}`);
  console.log("Headers:");
  for (const [k, v] of paid.headers.entries()) console.log(`  ${k}: ${v}`);
  console.log("Body:", body);

  const settleHeader = paid.headers.get("payment-response");
  if (settleHeader) {
    console.log("\nSettlement:", Buffer.from(settleHeader, "base64").toString("utf8"));
  }
  const freshChallenge = paid.headers.get("payment-required");
  if (freshChallenge) {
    console.log("\nServer re-issued a fresh challenge (rejected our proof):");
    console.log(JSON.stringify(JSON.parse(Buffer.from(freshChallenge, "base64").toString("utf8")), null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Verifies an x402 offer's declared EIP-712 domain (extra.name / extra.version)
 * actually matches the token's real on-chain DOMAIN_SEPARATOR(). Run this BEFORE
 * trusting extra.name/version to build a signing payload — rules out an entire
 * class of "invalid signature" false leads in one step.
 *
 * Fill in TOKEN / CHAIN_ID / RPC / candidate name+version pairs from the
 * decoded 402's accepts[] entry, then: node verify-domain.mjs
 */
import { createPublicClient, http, keccak256, encodeAbiParameters, stringToBytes } from "viem";

const RPC = "https://rpc.xlayer.tech"; // X Layer; swap for the target chain's RPC
const TOKEN = "0x0000000000000000000000000000000000000000"; // = accepts[i].asset
const CHAIN_ID = 196; // parsed from accepts[i].network, "eip155:196" -> 196

const client = createPublicClient({ transport: http(RPC) });

const onchain = await client.readContract({
  address: TOKEN,
  abi: [{ inputs: [], name: "DOMAIN_SEPARATOR", outputs: [{ type: "bytes32" }], stateMutability: "view", type: "function" }],
  functionName: "DOMAIN_SEPARATOR",
});
console.log("on-chain DOMAIN_SEPARATOR():", onchain);

function computeDomainSeparator(name, version, chainId, verifyingContract) {
  const typeHash = keccak256(stringToBytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"));
  const nameHash = keccak256(stringToBytes(name));
  const versionHash = keccak256(stringToBytes(version));
  const encoded = encodeAbiParameters(
    [{ type: "bytes32" }, { type: "bytes32" }, { type: "bytes32" }, { type: "uint256" }, { type: "address" }],
    [typeHash, nameHash, versionHash, BigInt(chainId), verifyingContract]
  );
  return keccak256(encoded);
}

// Start with the exact name/version the 402's extra.{name,version} declared,
// plus a couple of plausible variants in case of encoding mismatches (e.g.
// mangled unicode symbols) — add more candidates here if none match.
const candidates = [
  ["<extra.name from the 402>", "<extra.version from the 402>"],
];

for (const [name, version] of candidates) {
  const computed = computeDomainSeparator(name, version, CHAIN_ID, TOKEN);
  const match = computed.toLowerCase() === onchain.toLowerCase();
  console.log(`name="${name}" version="${version}" ->`, computed, match ? "  <-- MATCH" : "");
}

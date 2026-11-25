#!/usr/bin/env node
/**
 * Fetch a public X/Twitter post with NO API, keys, or auth.
 *
 * Uses the public syndication endpoint that x.com's own embed widget uses:
 *   https://cdn.syndication.twimg.com/tweet-result?id=<ID>&token=<t>&lang=en
 *
 * Usage:
 *   node fetch-tweet.mjs <tweet-url-or-id> [--json]
 *
 * Examples:
 *   node fetch-tweet.mjs https://x.com/Someone/status/2096862369234248113
 *   node fetch-tweet.mjs 2096862369234248113
 *   node fetch-tweet.mjs <url> --json     # print raw JSON instead of formatted
 */

const arg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const asJson = process.argv.includes('--json');

if (!arg) {
  console.error('usage: node fetch-tweet.mjs <tweet-url-or-id> [--json]');
  process.exit(1);
}

// Accept a full x.com/twitter.com URL or a bare numeric id.
const idMatch = String(arg).match(/(?:status(?:es)?\/)?(\d{5,25})/);
if (!idMatch) {
  console.error('Could not extract a tweet id from:', arg);
  process.exit(1);
}
const id = idMatch[1];

// The syndication endpoint needs a `token` derived from the id. This is the
// documented react-tweet algorithm (base-36). A dummy token often works too,
// but computing it properly maximises success.
const token = ((Number(id) / 1e15) * Math.PI)
  .toString(36)
  .replace(/(0+|\.)/g, '');

const url =
  `https://cdn.syndication.twimg.com/tweet-result?id=${id}` +
  `&token=${token}&lang=en&features=tfw_timeline_list%3A%3B`;

const res = await fetch(url, {
  headers: {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    accept: 'application/json',
  },
});

if (!res.ok) {
  console.error(`HTTP ${res.status} — tweet may be deleted, protected, or the id is wrong.`);
  process.exit(2);
}

const j = await res.json();

if (asJson) {
  console.log(JSON.stringify(j, null, 2));
  process.exit(0);
}

if (j.__typename === 'TweetTombstone' || !j.text) {
  console.error('Tweet unavailable (deleted, protected, age-gated, or removed).');
  if (j.tombstone?.text?.text) console.error('reason:', j.tombstone.text.text);
  process.exit(2);
}

// Long posts (>280 chars) carry the full body in note_tweet; `text` is truncated.
const fullText = j.note_tweet?.text || j.text || '';
const u = j.user || {};
const verified = u.is_blue_verified || u.verified ? ' [verified]' : '';

console.log(`author : ${u.name || '?'} (@${u.screen_name || '?'})${verified}`);
console.log(`posted : ${j.created_at || '?'}`);
console.log(`stats  : ${j.favorite_count ?? '?'} likes, ${j.conversation_count ?? '?'} replies`);
console.log(`\n${fullText}\n`);

const media = (j.mediaDetails || []).map((m) => m.media_url_https).filter(Boolean);
if (media.length) console.log('media:\n  ' + media.join('\n  '));

const links = (j.entities?.urls || []).map((x) => x.expanded_url).filter(Boolean);
if (links.length) console.log('links:\n  ' + links.join('\n  '));

if (j.quoted_tweet) {
  const q = j.quoted_tweet;
  console.log(`\n— quoting @${q.user?.screen_name || '?'}: ${(q.note_tweet?.text || q.text || '').slice(0, 280)}`);
}

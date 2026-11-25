#!/usr/bin/env node
/**
 * Fetch a user's recent tweets without an account or API key.
 *
 * Uses the same guest token system as search-tweets.mjs.
 *
 * Usage:
 *   node user-timeline.mjs <@username or username> [--count=20] [--json]
 *
 * Examples:
 *   node user-timeline.mjs @beamnxw
 *   node user-timeline.mjs elonmusk --count=5
 *   node user-timeline.mjs vitalikbuterin --json
 */

const BEARER = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

const args = process.argv.slice(2);
const userArg = args.find(a => !a.startsWith('--'));
const countArg = args.find(a => a.startsWith('--count='));
const count = countArg ? parseInt(countArg.split('=')[1]) : 20;
const asJson = args.includes('--json');

if (!userArg) {
  console.error('usage: node user-timeline.mjs <@username> [--count=20] [--json]');
  process.exit(1);
}

const username = userArg.replace(/^@/, '');

async function getGuestToken() {
  const res = await fetch('https://x.com/i/api/1.1/guest/activate.json', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BEARER}`,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  if (!res.ok) throw new Error(`Guest token fetch failed: HTTP ${res.status}`);
  const j = await res.json();
  return j.guest_token;
}

async function getTimeline(guestToken) {
  const params = new URLSearchParams({
    screen_name: username,
    count: String(count),
    tweet_mode: 'extended',
    include_rts: 'false',
    exclude_replies: 'true',
  });
  const res = await fetch(`https://x.com/i/api/1.1/statuses/user_timeline.json?${params}`, {
    headers: {
      'Authorization': `Bearer ${BEARER}`,
      'x-guest-token': guestToken,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  if (!res.ok) throw new Error(`Timeline fetch failed: HTTP ${res.status}`);
  return res.json();
}

function fmt(tweet) {
  const u = tweet.user;
  const verified = u.verified || u.is_blue_verified ? ' [verified]' : '';
  const text = tweet.full_text || tweet.text || '';
  const links = (tweet.entities?.urls || []).map(u => u.expanded_url).filter(Boolean);
  const media = (tweet.extended_entities?.media || []).map(m => m.media_url_https).filter(Boolean);

  let out = `${tweet.id_str} · ${tweet.created_at}\n`;
  out += `${text}\n`;
  out += `❤ ${tweet.favorite_count}  🔁 ${tweet.retweet_count}\n`;
  if (links.length) out += `links: ${links.join(' ')}\n`;
  if (media.length) out += `media: ${media.join(' ')}\n`;
  return out;
}

try {
  const guestToken = await getGuestToken();
  const tweets = await getTimeline(guestToken);

  if (asJson) {
    console.log(JSON.stringify(tweets, null, 2));
    process.exit(0);
  }

  if (!Array.isArray(tweets) || !tweets.length) {
    console.log('No tweets found or account is protected.');
    process.exit(0);
  }

  const u = tweets[0].user;
  const verified = u.verified || u.is_blue_verified ? ' [verified]' : '';
  console.log(`@${u.screen_name}${verified} — ${u.name}`);
  console.log(`${u.followers_count.toLocaleString()} followers · ${tweets.length} tweets fetched\n${'─'.repeat(60)}`);

  for (const t of tweets) {
    console.log(fmt(t));
    console.log('─'.repeat(60));
  }
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}

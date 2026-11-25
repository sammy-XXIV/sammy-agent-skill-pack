---
name: fetch-tweet
description: Read the full content of a public X / Twitter post — text (including long/note tweets), author, date, media URLs, links, and any quoted tweet — from an x.com or twitter.com URL or a tweet ID, with NO X API, no keys, and no login. Use whenever asked to read, check, open, quote, or summarize an x.com / twitter.com post or link, and especially as the fallback when the X/xapi MCP tool is unavailable, disconnected, rate-limited, or out of credits, or when WebFetch returns 402/403/JS-shell on a tweet URL.
---

# Fetch a public X/Twitter post (no API)

Reads a tweet through the **public syndication endpoint** that X's own embed
widget uses — `https://cdn.syndication.twimg.com/tweet-result`. No auth, no API
key, no rate-limited credits. This is the reliable way to read a tweet when the
`xapi` MCP server is down/out of credits or `WebFetch` gets a Cloudflare/JS
shell instead of content.

## Use it

Run the bundled script with the post URL or the bare numeric id:

```bash
node "C:/Users/Dell/.claude/skills/fetch-tweet/fetch-tweet.mjs" <tweet-url-or-id>
```

- Accepts `https://x.com/<user>/status/<id>`, `https://twitter.com/.../status/<id>`, or just `<id>`.
- Add `--json` to dump the raw JSON (media dimensions, reply structure, etc.) instead of the formatted summary.

It prints: author (+verified), post time, like/reply counts, the **full** text
(long "note" tweets included), media image URLs, external links, and the quoted
tweet if any. To view an image, download the printed `media` URL (append
`?name=large` for full resolution) and read it.

## How it works (so you can do it by hand if node isn't available)

```
GET https://cdn.syndication.twimg.com/tweet-result?id=<ID>&token=<T>&lang=en
```
`<T>` is a token derived from the id (base-36): `((id/1e15)*Math.PI).toString(36).replace(/(0+|\.)/g,'')`.
A dummy token (e.g. `token=a`) also works for many tweets. Send a browser
`user-agent`. The JSON has `text` (or `note_tweet.text` for long posts), `user`,
`created_at`, `mediaDetails[].media_url_https`, `entities.urls[].expanded_url`,
and `quoted_tweet`.

## Limits

- Only **public** tweets. Deleted/protected/age-gated posts return an error or a
  `TweetTombstone` (the script reports this).
- Threads: this fetches one post. Fetch other ids in the thread separately.
- It's an undocumented endpoint — if it ever changes, fall back to the `xapi`
  MCP tool, or read the URL in the browser via the claude-in-chrome tools.

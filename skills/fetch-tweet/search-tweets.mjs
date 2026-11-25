#!/usr/bin/env node
/**
 * X/Twitter search via DOM scraping.
 *
 * NOTE: This script is meant to be invoked BY Claude Code using the
 * Claude in Chrome MCP tools, not run standalone. When you want to
 * search X, just ask Claude: "search X for <query>"
 *
 * Claude will:
 *   1. Open x.com/search in Chrome
 *   2. Run the scraper below via javascript_tool
 *   3. Return formatted results
 *
 * The scraper (copy-paste into javascript_tool when calling manually):
 */

export const SCRAPE_TWEETS = `
[...document.querySelectorAll('article[data-testid="tweet"]')].map(t => {
  const user = t.querySelector('[data-testid="User-Name"]')?.innerText?.split('\\n').filter(Boolean) || [];
  const text = t.querySelector('[data-testid="tweetText"]')?.innerText || '';
  const time = t.querySelector('time')?.getAttribute('datetime') || '';
  const likes = t.querySelector('[data-testid="like"] span')?.innerText || '0';
  const rts = t.querySelector('[data-testid="retweet"] span')?.innerText || '0';
  const link = [...t.querySelectorAll('a[href*="/status/"]')].find(a => a.href.includes('/status/'))?.href || '';
  return { name: user[0]||'', handle: user.find(u=>u.startsWith('@'))||'', text, time, likes, rts, link };
})
`;

// Workflow for Claude Code:
// 1. tabs_context_mcp({ createIfEmpty: true })
// 2. navigate({ url: `https://x.com/search?q=${encodeURIComponent(query)}&f=live`, tabId })
// 3. Wait ~2s for page load
// 4. javascript_tool({ action: 'javascript_exec', tabId, text: SCRAPE_TWEETS })
// 5. Format and return results

console.log('This script is a helper for Claude Code. Ask Claude to "search X for <query>" instead.');

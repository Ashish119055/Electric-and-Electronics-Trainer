#!/usr/bin/env node
// Publishes a built snippet as a Blogger post through the Blogger API v3.
// Usage: node blogger/publish.js <snippet.html> "<post title>" [--draft]
// Env: BLOGGER_BLOG_URL (e.g. https://myblog.blogspot.com) and either
//      BLOGGER_ACCESS_TOKEN, or BLOGGER_CLIENT_ID + BLOGGER_CLIENT_SECRET + BLOGGER_REFRESH_TOKEN
//      (OAuth scope https://www.googleapis.com/auth/blogger).
const fs = require('fs');

const [file, title, flag] = process.argv.slice(2);
const env = process.env;
if (!file || !title || !env.BLOGGER_BLOG_URL) {
  console.error('usage: BLOGGER_BLOG_URL=... node blogger/publish.js <snippet.html> "<post title>" [--draft]');
  process.exit(1);
}

async function token() {
  if (env.BLOGGER_ACCESS_TOKEN) return env.BLOGGER_ACCESS_TOKEN;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: env.BLOGGER_CLIENT_ID, client_secret: env.BLOGGER_CLIENT_SECRET,
      refresh_token: env.BLOGGER_REFRESH_TOKEN, grant_type: 'refresh_token',
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('token refresh failed: ' + JSON.stringify(j));
  return j.access_token;
}

async function api(path, tok, init = {}) {
  const r = await fetch('https://www.googleapis.com/blogger/v3/' + path, {
    ...init, headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j.error || j)}`);
  return j;
}

(async () => {
  const tok = await token();
  const blog = await api('blogs/byurl?url=' + encodeURIComponent(env.BLOGGER_BLOG_URL), tok);
  const post = await api(`blogs/${blog.id}/posts?isDraft=${flag === '--draft'}`, tok, {
    method: 'POST',
    body: JSON.stringify({ title, content: fs.readFileSync(file, 'utf8') }),
  });
  console.log(post.status, post.url || '(draft)', post.id);
})().catch(e => { console.error(e.message); process.exit(1); });

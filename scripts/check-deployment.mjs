import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Run against a built local server, a Vercel preview, or the production domain.
// Every required document and runtime asset must be present and current.
const base = new URL(process.argv[2] || 'http://127.0.0.1:3110');
const report = { base: base.href, checkedAt: new Date().toISOString(), checks: [], failures: [] };
const digest = value => createHash('sha256').update(value).digest('hex');
const contacts = value => {
  const decoded = value.replace(/\\u([\da-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  assert((decoded.match(/[\w.+-]+@agentba\.se/gi) || []).every(email => email.toLowerCase() === 'contact@agentba.se'), 'Individual email in public response');
};
async function get(path, userAgent) {
  const response = await fetch(new URL(path, base), { headers: userAgent ? { 'User-Agent': userAgent } : {}, signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const text = bytes.toString();
  assert(bytes.length > 0, `${path}: empty response`);
  report.checks.push({ path, userAgent, status: response.status, type: response.headers.get('content-type'), bytes: bytes.length, sha256: digest(bytes) });
  return { text, bytes, type: response.headers.get('content-type') || '' };
}

try {
  const expectedIndex = readFileSync('.next/server/app/llms.txt.body', 'utf8');
  const index = await get('/llms.txt');
  assert.match(index.type, /text\/plain/);
  assert.equal(index.text, expectedIndex);
  contacts(index.text);
  const paths = [...new Set([...index.text.matchAll(/\]\((https:\/\/agentba\.se[^)]*)\)/g)].map(m => new URL(m[1]).pathname))];
  assert.equal(paths.length, 14, 'AI reading-path inventory changed; review its full coverage');
  for (const path of paths) {
    const result = await get(path);
    contacts(result.text);
    if (path.startsWith('/data/')) assert.deepEqual(JSON.parse(result.text), JSON.parse(readFileSync(`public${path}`, 'utf8')));
    if (path.endsWith('.md')) {
      const locale = path.startsWith('/ko/') ? 'ko' : 'en';
      assert.match(result.type, /text\/markdown/);
      assert.equal(result.text, readFileSync(`.next/server/app/api/md/${locale}/home.body`, 'utf8'));
    }
    if (path === '/') {
      for (const id of ['hero', 'work', 'commerce', 'memory', 'architecture', 'scale', 'capabilities', 'contact', 'company']) assert(result.text.includes(`id="${id}"`), `Missing section: ${id}`);
      assert(result.text.includes('/landing/init.js'), 'Redesign runtime entry is missing');
      assert(result.text.includes('Build a company.'), 'Old homepage is deployed');
      assert(!result.text.includes('This company runs on agents'), 'Old homepage is deployed');
      assert(result.text.includes('We run client workloads, build agent fleets inside companies'), 'Business introduction is stale');
      assert(result.text.includes('/landing/media/social/campaign-intake.png'), 'Original product interface is missing');
      assert.match(result.text, /href="#contact" class="nav-cta"/, 'Build with us must open the engagement section');
    }
  }
  for (const file of readdirSync('public/data').filter(file => file.endsWith('.json') && !paths.includes(`/data/${file}`))) {
    const result = await get(`/data/${file}`);
    contacts(result.text);
    assert.deepEqual(JSON.parse(result.text), JSON.parse(readFileSync(`public/data/${file}`, 'utf8')));
  }
  contacts((await get('/ko')).text);
  const robots = (await get('/robots.txt')).text;
  for (const bot of ['ClaudeBot', 'Claude-User', 'Claude-SearchBot']) assert(robots.includes(bot), `Missing bot rule: ${bot}`);
  assert((await get('/sitemap.xml')).text.includes('https://agentba.se'));

  // The landing asset inventory does not include Next's file-based icons.
  // Verify those explicitly so an old favicon cannot pass deployment QA.
  for (const [path, source, mime] of [
    ['/favicon.ico', 'app/favicon.ico', /image\/(?:x-icon|vnd\.microsoft\.icon)/],
    ['/icon.svg', 'app/icon.svg', /image\/svg\+xml/],
    ['/apple-icon.png', 'app/apple-icon.png', /image\/png/],
    ['/logo-512.png', 'public/logo-512.png', /image\/png/],
    ['/icons/agentbase-mark-v2-32.png', 'public/icons/agentbase-mark-v2-32.png', /image\/png/],
    ['/icons/agentbase-mark-v2-64.png', 'public/icons/agentbase-mark-v2-64.png', /image\/png/],
  ]) {
    const { bytes, type } = await get(path);
    assert.match(type, mime);
    assert.equal(digest(bytes), digest(readFileSync(source)), `Stale brand icon: ${path}`);
  }

  const assets = readdirSync('assets/landing', { recursive: true }).filter(file => /\.(js|mjs|css|webp|png|svg|ttf|woff2|txt|mp4|webm)$/.test(file));
  assert(assets.length > 30, 'Runtime asset inventory is incomplete');
  for (let offset = 0; offset < assets.length; offset += 5) {
    const checks = await Promise.allSettled(assets.slice(offset, offset + 5).map(async file => {
      const { bytes } = await get(`/landing/${file}`);
      assert.equal(digest(bytes), digest(readFileSync(`assets/landing/${file}`)), `Stale runtime asset: ${file}`);
    }));
    for (const check of checks) if (check.status === 'rejected') throw check.reason;
  }
  for (const file of assets.filter(file => /\.(mp4|webm)$/.test(file))) {
    const path = `/landing/${file}`;
    const response = await fetch(new URL(path, base), { headers: { Range: 'bytes=0-1023' }, signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 206, `${path}: video must support partial playback requests`);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length, 1024, `${path}: invalid video range`);
    assert.deepEqual(bytes, readFileSync(`assets/landing/${file}`).subarray(0, 1024));
    report.checks.push({ path, range: 'bytes=0-1023', status: response.status, bytes: bytes.length });
  }
  const imageRoutes = ['/og/agentbase.png', ...['', 'ko/'].flatMap(prefix =>
    readdirSync(`.next/server/app/${prefix}`).filter(file => /^opengraph-image.*\.body$/.test(file))
      .map(file => `/${prefix}${file.replace(/\.body$/, '')}`)
  )];
  assert.equal(imageRoutes.length, 3, 'The two generated OG image routes must also be checked');
  for (const path of new Set(imageRoutes)) {
    const { bytes, type } = await get(path);
    assert.match(type, /image\/png/);
    assert.equal(bytes.readUInt32BE(16), 1200);
    assert.equal(bytes.readUInt32BE(20), 630);
    assert.equal(digest(bytes), digest(readFileSync('public/og/agentbase.png')), 'OG image differs from reviewed artwork');
  }
  for (const bot of ['ClaudeBot', 'Claude-User', 'Claude-SearchBot']) {
    for (const path of ['/', '/llms.txt']) {
      const result = await get(path, bot);
      contacts(result.text);
      assert(result.text.includes('AgentBase LLC'), `${bot}: no company identity`);
      if (path === '/') assert(result.text.includes('Build a company.'), `${bot}: wrong homepage`);
      else assert.equal(result.text, expectedIndex);
    }
  }
} catch (error) {
  report.failures.push(error.stack || String(error));
}
if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify(report, null, 2));
console.log(JSON.stringify({ base: report.base, responses: report.checks.length, verified: report.failures.length === 0, failures: report.failures }, null, 2));
if (report.failures.length) process.exitCode = 1;

/**
 * Smart Google Indexing API submitter with rotating queue + state persistence.
 *
 * Why this exists: Google's Indexing API free tier is 200 URLs/day per GCP project,
 * and we share one project across multiple clients. A naive "submit every URL in
 * the sitemap on every push" wastes quota on the same URLs repeatedly.
 *
 * This version:
 *   1. Reads sitemap.xml for the full URL set
 *   2. Reads .agents/indexing-state.json for previously-submitted URLs + last-submitted date
 *   3. Computes "pending" = URLs in sitemap NOT submitted yet (or submitted >30 days ago)
 *   4. Submits pending URLs one at a time until quota is hit or list is exhausted
 *   5. Persists updated state back to .agents/indexing-state.json so the next run resumes
 *
 * Over ~25 days this clears a 25-URL backlog with zero human intervention.
 */
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const xml2js = require('xml2js');

const KEYFILE_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.resolve(__dirname, 'google-service-account.json');
const SITEMAP_PATH = path.resolve(__dirname, '../../sitemap.xml');
const STATE_PATH   = path.resolve(__dirname, '../indexing-state.json');

// Max URLs to submit per run. Script will also stop early on quota hit.
const MAX_PER_RUN = parseInt(process.env.MAX_PER_RUN || '25', 10);
// Re-submit any URL not touched in this many days (keeps fresh signal flowing)
const REFRESH_DAYS = 30;

function loadState() {
  if (!fs.existsSync(STATE_PATH)) return { submitted: {} };
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { submitted: {} }; }
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

async function parseSitemap() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('❌ sitemap.xml not found at:', SITEMAP_PATH);
    process.exit(1);
  }
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xml);
  return (result.urlset && result.urlset.url) ? result.urlset.url.map(e => e.loc[0]) : [];
}

function pickPending(allUrls, state) {
  const now = Date.now();
  const cutoff = now - REFRESH_DAYS * 24 * 60 * 60 * 1000;
  const never = [];
  const stale = [];
  for (const url of allUrls) {
    const lastMs = state.submitted[url] ? Date.parse(state.submitted[url]) : 0;
    if (!lastMs) never.push(url);
    else if (lastMs < cutoff) stale.push({ url, lastMs });
  }
  // Prioritize: never-submitted first (backlog), then stale (ascending age)
  stale.sort((a, b) => a.lastMs - b.lastMs);
  return [...never, ...stale.map(s => s.url)];
}

async function forceIndex() {
  console.log('🚀 Smart Indexing API (rotating queue + state persistence)');

  if (!fs.existsSync(KEYFILE_PATH)) {
    console.error('❌ Service Account key missing at:', KEYFILE_PATH);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const indexing = google.indexing({ version: 'v3', auth });

  const allUrls = await parseSitemap();
  const state = loadState();
  const pending = pickPending(allUrls, state);

  console.log(`📦 Sitemap: ${allUrls.length} URLs total`);
  console.log(`📋 Previously submitted: ${Object.keys(state.submitted).length}`);
  console.log(`⏳ Pending (never submitted or stale): ${pending.length}`);

  if (pending.length === 0) {
    console.log('✅ Nothing to do — all sitemap URLs have been submitted recently.');
    return;
  }

  const toSubmit = pending.slice(0, MAX_PER_RUN);
  console.log(`🎯 Submitting up to ${toSubmit.length} URL(s) this run:\n`);

  let submitted = 0;
  let quotaHit = false;

  for (const url of toSubmit) {
    if (quotaHit) {
      console.log(`⏭️  Skipping ${url} (quota already hit, saving for next run)`);
      continue;
    }
    try {
      const response = await indexing.urlNotifications.publish({
        requestBody: { url, type: 'URL_UPDATED' },
      });
      if (response.status === 200) {
        console.log(`✅ [200] ${url}`);
        state.submitted[url] = new Date().toISOString();
        submitted++;
      } else {
        console.log(`⚠️  [${response.status}] ${url}`);
      }
    } catch (err) {
      const code = err.code || (err.response && err.response.status);
      const msg = err.message || String(err);
      if (code === 429 || /quota|rate/i.test(msg)) {
        console.log(`⏳ QUOTA HIT at ${url} — stopping to preserve remaining quota`);
        console.log(`   Next run will pick up where we left off.`);
        quotaHit = true;
      } else {
        console.error(`❌ ERROR [${code}] ${url}: ${msg}`);
      }
    }
  }

  saveState(state);
  console.log(`\n🎉 Done! ${submitted} submitted successfully.`);
  console.log(`💾 State saved → ${STATE_PATH}`);
  console.log(`📊 Total in state: ${Object.keys(state.submitted).length} / ${allUrls.length} sitemap URLs`);
}

forceIndex().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

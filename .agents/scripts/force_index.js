const fs = require('fs');
const { google } = require('googleapis');
const xml2js = require('xml2js');
const path = require('path');
const { execSync } = require('child_process');

const KEYFILE_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.resolve(__dirname, 'google-service-account.json');
const SITEMAP_PATH = path.resolve(__dirname, '../../sitemap.xml');
const MODE = process.env.INDEX_MODE || 'changed'; // 'changed' or 'all'

async function forceIndex() {
  console.log('🚀 Starting Google Indexing API Execution...');
  console.log(`📋 Mode: ${MODE}`);

  // 1. Authenticate
  if (!fs.existsSync(KEYFILE_PATH)) {
    console.error('❌ Service Account key missing at:', KEYFILE_PATH);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const indexing = google.indexing({ version: 'v3', auth });

  // 2. Parse sitemap
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('❌ sitemap.xml not found at:', SITEMAP_PATH);
    process.exit(1);
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  let allUrls = [];
  let urlsByLastmod = {};
  try {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemapXml);
    if (result.urlset && result.urlset.url) {
      for (const entry of result.urlset.url) {
        const url = entry.loc[0];
        const lastmod = entry.lastmod ? entry.lastmod[0] : '';
        allUrls.push(url);
        if (lastmod) {
          if (!urlsByLastmod[lastmod]) urlsByLastmod[lastmod] = [];
          urlsByLastmod[lastmod].push(url);
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to parse sitemap.xml:', error);
    process.exit(1);
  }

  console.log(`📦 Sitemap contains ${allUrls.length} total URLs`);

  // 3. Determine which URLs to submit
  let urlsToSubmit = [];

  if (MODE === 'all') {
    urlsToSubmit = allUrls;
    console.log(`🔄 Mode=all: submitting all ${urlsToSubmit.length} URLs`);
  } else {
    // Strategy 1: Try git diff
    let gitWorked = false;
    try {
      const diff = execSync('git diff --name-only HEAD~1 HEAD', {
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '../..'),
      }).trim();

      if (diff) {
        const changedFiles = diff.split('\n').filter(Boolean);
        console.log(`📝 Changed files (git diff):\n${changedFiles.map(f => '  - ' + f).join('\n')}`);

        const siteBase = 'https://rsviajesreycoliman.com';

        for (const file of changedFiles) {
          if (file === 'sitemap.xml') {
            // Sitemap changed — submit URLs with most recent lastmod
            const dates = Object.keys(urlsByLastmod).sort().reverse();
            if (dates.length > 0) {
              const newestDate = dates[0];
              for (const url of urlsByLastmod[newestDate]) {
                if (!urlsToSubmit.includes(url)) urlsToSubmit.push(url);
              }
              console.log(`📅 Sitemap changed — added ${urlsByLastmod[newestDate].length} URLs with lastmod=${newestDate}`);
            }
          } else if (file.endsWith('.html')) {
            let urlPath = file.replace(/\/index\.html$/, '').replace(/\.html$/, '');
            const url = `${siteBase}/${urlPath}`;
            if (allUrls.includes(url) && !urlsToSubmit.includes(url)) {
              urlsToSubmit.push(url);
            }
          }
        }

        if (changedFiles.some(f => f.startsWith('blog/'))) {
          const blogIndex = `${siteBase}/blog`;
          if (!urlsToSubmit.includes(blogIndex)) urlsToSubmit.push(blogIndex);
        }

        gitWorked = true;
      }
    } catch (err) {
      console.log(`⚠️ Git diff unavailable (${err.message.split('\n')[0]})`);
    }

    // Strategy 2: Fallback to lastmod-based detection
    if (!gitWorked || urlsToSubmit.length === 0) {
      console.log('📅 Falling back to lastmod-based detection...');
      const today = new Date().toISOString().split('T')[0];

      // Check today first, then most recent date
      if (urlsByLastmod[today]) {
        urlsToSubmit = urlsByLastmod[today];
        console.log(`📅 Found ${urlsToSubmit.length} URLs with today's date (${today})`);
      } else {
        const dates = Object.keys(urlsByLastmod).sort().reverse();
        if (dates.length > 0) {
          urlsToSubmit = urlsByLastmod[dates[0]];
          console.log(`📅 No URLs for today. Using most recent: ${dates[0]} (${urlsToSubmit.length} URLs)`);
        }
      }

      // Always include blog index
      const blogIndex = 'https://rsviajesreycoliman.com/blog';
      if (!urlsToSubmit.includes(blogIndex)) urlsToSubmit.push(blogIndex);
    }

    if (urlsToSubmit.length === 0) {
      console.log('ℹ️ No URLs to submit. Done.');
      return;
    }

    console.log(`\n🎯 Submitting ${urlsToSubmit.length} URLs:`);
    urlsToSubmit.forEach(u => console.log(`  → ${u}`));
  }

  // 4. Submit to Google Indexing API
  let success = 0, failed = 0;
  for (const url of urlsToSubmit) {
    try {
      const response = await indexing.urlNotifications.publish({
        requestBody: { url, type: 'URL_UPDATED' },
      });
      if (response.status === 200) {
        console.log(`✅ [200] ${url}`);
        success++;
      } else {
        console.log(`⚠️ [${response.status}] ${url}`);
        failed++;
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Quota exceeded')) {
        console.error(`⏳ QUOTA HIT at ${url} — stopping to save remaining quota`);
        failed += urlsToSubmit.length - success - failed;
        break;
      }
      console.error(`❌ FAILED ${url}: ${msg}`);
      failed++;
    }
  }

  console.log(`\n🎉 Done! ${success} submitted, ${failed} failed (out of ${urlsToSubmit.length})`);
}

forceIndex().catch(console.error);

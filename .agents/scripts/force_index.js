const fs = require('fs');
const { google } = require('googleapis');
const xml2js = require('xml2js');
const path = require('path');
const { execSync } = require('child_process');

const KEYFILE_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.resolve(__dirname, 'google-service-account.json');
const SITEMAP_PATH = path.resolve(__dirname, '../../sitemap.xml');
const MODE = process.env.INDEX_MODE || 'changed'; // 'changed' (default) or 'all'

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

  // 2. Parse sitemap for all URLs
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('❌ sitemap.xml not found at:', SITEMAP_PATH);
    process.exit(1);
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  let allUrls = [];
  try {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemapXml);
    if (result.urlset && result.urlset.url) {
      allUrls = result.urlset.url.map(entry => entry.loc[0]);
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
    // Get changed files from git diff vs previous commit
    try {
      const diff = execSync('git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only HEAD', {
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '../..'),
      }).trim();

      const changedFiles = diff.split('\n').filter(Boolean);
      console.log(`📝 Changed files:\n${changedFiles.map(f => '  - ' + f).join('\n')}`);

      // Map changed HTML files to their URLs
      const siteBase = 'https://rsviajesreycoliman.com';

      for (const file of changedFiles) {
        if (file === 'sitemap.xml') {
          // Sitemap changed — find NEW entries by checking today's lastmod
          const today = new Date().toISOString().split('T')[0];
          const parser = new xml2js.Parser();
          const result = await parser.parseStringPromise(sitemapXml);
          if (result.urlset && result.urlset.url) {
            for (const entry of result.urlset.url) {
              const lastmod = entry.lastmod ? entry.lastmod[0] : '';
              if (lastmod === today) {
                const url = entry.loc[0];
                if (!urlsToSubmit.includes(url)) urlsToSubmit.push(url);
              }
            }
          }
        } else if (file.endsWith('.html')) {
          // Convert file path to URL
          let urlPath = file
            .replace(/\/index\.html$/, '')
            .replace(/\.html$/, '');
          const url = `${siteBase}/${urlPath}`;
          if (allUrls.includes(url) && !urlsToSubmit.includes(url)) {
            urlsToSubmit.push(url);
          }
        }
      }

      // Always include the blog index if any blog post changed
      if (changedFiles.some(f => f.startsWith('blog/'))) {
        const blogIndex = `${siteBase}/blog`;
        if (!urlsToSubmit.includes(blogIndex)) urlsToSubmit.push(blogIndex);
      }

    } catch (err) {
      console.log(`⚠️ Git diff failed (${err.message}), falling back to sitemap lastmod`);
      // Fallback: submit URLs with today's lastmod
      const today = new Date().toISOString().split('T')[0];
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(sitemapXml);
      if (result.urlset && result.urlset.url) {
        for (const entry of result.urlset.url) {
          const lastmod = entry.lastmod ? entry.lastmod[0] : '';
          if (lastmod === today) urlsToSubmit.push(entry.loc[0]);
        }
      }
    }

    if (urlsToSubmit.length === 0) {
      console.log('ℹ️ No changed URLs detected. Nothing to submit.');
      return;
    }

    console.log(`🎯 Submitting ${urlsToSubmit.length} changed URLs (not all ${allUrls.length}):`);
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
      console.error(`❌ FAILED ${url}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 Done! ${success} submitted, ${failed} failed (out of ${urlsToSubmit.length})`);
}

forceIndex().catch(console.error);

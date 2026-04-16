/**
 * Google Indexing API — URL Submission Script
 *
 * Reads sitemap.xml and submits every URL to Google's Indexing API.
 * Triggered automatically by .github/workflows/auto-index.yml on push to main.
 *
 * Env vars:
 *   GOOGLE_SERVICE_ACCOUNT_KEY - path to service account JSON keyfile
 *                                (GitHub Action writes the secret to /tmp/google-sa-key.json)
 *
 * Manual run:
 *   GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/key.json node force_index.js
 */

const fs = require('fs');
const { google } = require('googleapis');
const xml2js = require('xml2js');
const path = require('path');

const KEYFILE_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.resolve(__dirname, 'google-service-account.json');

// CUSTOMIZE: Path to your sitemap.xml (relative to this script)
const SITEMAP_PATH = path.resolve(__dirname, '../../sitemap.xml');

async function forceIndex() {
  console.log('🚀 Starting Google Indexing API Execution...');

  // 1. Authenticate with Service Account
  if (!fs.existsSync(KEYFILE_PATH)) {
    console.error('❌ Service Account key missing at:', KEYFILE_PATH);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const indexing = google.indexing({
    version: 'v3',
    auth: auth,
  });

  // 2. Parse sitemap
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('❌ sitemap.xml not found at:', SITEMAP_PATH);
    process.exit(1);
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  let urls = [];
  try {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemapXml);

    if (result.urlset && result.urlset.url) {
      urls = result.urlset.url.map(entry => entry.loc[0]);
    }
  } catch (error) {
    console.error('❌ Failed to parse sitemap.xml:', error);
    process.exit(1);
  }

  console.log(`📦 Found ${urls.length} URLs in sitemap.xml. Dispatching to Google Indexing API...`);

  // 3. Dispatch URL_UPDATED for every URL
  for (const url of urls) {
    try {
      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED',
        },
      });

      if (response.status === 200) {
        console.log(`✅ SUCCESS [200]: ${url} pushed to crawling queue.`);
      } else {
        console.log(`⚠️ Unhandled Status [${response.status}] for ${url}`);
      }

    } catch (err) {
      console.error(`❌ ERROR triggering ${url}:`, err.message);
      // 403 Forbidden = service account not Owner in Search Console
    }
  }

  console.log('🎉 Indexing API Dispatch complete!');
}

forceIndex().catch(console.error);

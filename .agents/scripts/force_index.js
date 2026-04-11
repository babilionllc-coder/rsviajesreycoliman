const fs = require('fs');
const { google } = require('googleapis');
const xml2js = require('xml2js');
const path = require('path');

const KEYFILE_PATH = '/Users/mac/Desktop/Websites/jegodigital/website/jegodigital-e02fb-6bdcd05bee0e.json';
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
      // If it throws a 403 Forbidden, the SA might not be owner.
    }
  }

  console.log('🎉 Indexing API Dispatch complete!');
}

forceIndex().catch(console.error);

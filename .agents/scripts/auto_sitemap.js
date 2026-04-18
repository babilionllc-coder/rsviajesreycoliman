#!/usr/bin/env node
/**
 * auto_sitemap.js — Recursively walk ALL *.html and build sitemap.xml
 *
 * Covers flat (/foo.html) and nested (/foo/index.html) page styles.
 * Extracts og:image + og:title for image sitemap + og:modified_time
 * for lastmod. Excludes utility pages (404, ig_story, report, stories).
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://rsviajesreycoliman.com';
const ROOT = path.resolve(__dirname, '..', '..');
const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml');

// Dirs we NEVER walk into
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.github', '.agents', '.vercel', '.firebase',
  'api', 'lib', 'js', 'css', 'images', 'Remotion', 'instagram-stories',
  'report', 'pdf', 'scraped_html', 'reports', 'content', 'public'
]);

// Files we NEVER include
const SKIP_FILES = new Set([
  '404.html', 'ig_story.html', 'report.html', 'test-puppeteer-html.js',
  'brevo-form-integration.html'
]);

// Priority overrides by path
const PRIORITY_OVERRIDES = {
  '/': { priority: '1.0', changefreq: 'weekly' },
  '/blog': { priority: '0.8', changefreq: 'weekly' },
  '/viajes-internacionales': { priority: '0.7', changefreq: 'weekly' },
  '/viajes-nacionales': { priority: '0.7', changefreq: 'weekly' },
  '/mas-destinos': { priority: '0.7', changefreq: 'weekly' },
  '/revista': { priority: '0.7', changefreq: 'monthly' },
  '/sobre-nosotros': { priority: '0.8', changefreq: 'monthly' },
  '/privacidad': { priority: '0.3', changefreq: 'yearly' },
  '/tour': { priority: '0.6', changefreq: 'weekly' },
  '/viaje': { priority: '0.6', changefreq: 'weekly' },
  '/mundial-2026': { priority: '0.85', changefreq: 'weekly' },
};

// Walk recursively for all .html files
function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, results);
    } else if (entry.endsWith('.html') && !SKIP_FILES.has(entry)) {
      results.push(full);
    }
  }
  return results;
}

// Convert absolute file path → URL path (pretty slugs, no .html)
function pathToUrl(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.replace(/\/index\.html$/, '');
  return '/' + rel.replace(/\.html$/, '');
}

function extractMeta(html) {
  const og = (prop) => {
    const m = html.match(new RegExp(`${prop}["']\\s+content=["']([^"']+)["']`));
    return m ? m[1] : '';
  };
  const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  return {
    lastmod: (og('article:modified_time') || og('og:updated_time') || new Date().toISOString().split('T')[0]).split('T')[0],
    image: og('og:image'),
    title: xmlEscape(og('og:title')),
  };
}

console.log('🚀 Building sitemap.xml from filesystem walk...');

const htmlFiles = walk(ROOT);
const urls = htmlFiles.map(f => ({ file: f, url: pathToUrl(f) }));

// Deduplicate (in case both foo.html and foo/index.html exist)
const seen = new Set();
const unique = [];
for (const u of urls) {
  const key = u.url.replace(/\/$/, '') || '/';
  if (!seen.has(key)) { seen.add(key); unique.push(u); }
}

console.log(`📦 Found ${unique.length} publishable pages`);

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

for (const { file, url } of unique) {
  const html = fs.readFileSync(file, 'utf8');
  const meta = extractMeta(html);
  const override = PRIORITY_OVERRIDES[url] || {};
  const priority = override.priority || (url.startsWith('/blog/') ? (url.includes('guia-completa') ? '0.95' : '0.9') : '0.6');
  const changefreq = override.changefreq || (url.startsWith('/blog/') ? 'monthly' : 'weekly');

  xml += `\n  <url>\n    <loc>${SITE_URL}${url}</loc>\n    <lastmod>${meta.lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>`;

  if (meta.image && meta.title) {
    xml += `\n    <image:image>\n      <image:loc>${meta.image}</image:loc>\n      <image:caption>${meta.title}</image:caption>\n    </image:image>`;
  }

  xml += `\n  </url>`;
}

xml += `\n</urlset>\n`;
fs.writeFileSync(SITEMAP_FILE, xml);
console.log(`✅ Wrote ${unique.length} URLs to sitemap.xml`);

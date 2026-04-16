/**
 * Dynamic Sitemap Generator
 *
 * Regenerates sitemap.xml from static URLs + all HTML files in BLOG_DIR.
 * Extracts lastmod, title, image from each blog post's meta tags.
 *
 * Run: node auto_sitemap.js
 */

const fs = require('fs');
const path = require('path');

// CUSTOMIZE: Your site's URL (no trailing slash)
const SITE_URL = 'https://YOURDOMAIN.com';

// CUSTOMIZE: Path to blog directory (relative to this script)
const BLOG_DIR = path.join(__dirname, '..', '..', 'blog');

// CUSTOMIZE: Path to sitemap.xml output
const SITEMAP_FILE = path.join(__dirname, '..', '..', 'sitemap.xml');

// CUSTOMIZE: Static priority URLs (main pages of your site)
const staticUrls = [
    { loc: '/', lastmod: '2026-04-16', changefreq: 'weekly', priority: '1.0' },
    { loc: '/blog', lastmod: '2026-04-16', changefreq: 'weekly', priority: '0.8' },
    { loc: '/about', lastmod: '2026-04-16', changefreq: 'monthly', priority: '0.8' },
    { loc: '/contact', lastmod: '2026-04-16', changefreq: 'monthly', priority: '0.7' },
];

console.log("🚀 Starting Sitemap Auto-Generation...");

let sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

for (const page of staticUrls) {
    sitemapXML += `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}

if (fs.existsSync(BLOG_DIR)) {
    try {
        const files = fs.readdirSync(BLOG_DIR);

        files.forEach(file => {
            if (!file.endsWith('.html') || file === 'index.html') return;

            const filePath = path.join(BLOG_DIR, file);
            const html = fs.readFileSync(filePath, 'utf8');

            const slug = file.replace('.html', '');

            const lastModMatch = html.match(/article:modified_time" content="([^"]+)"/);
            const lastMod = lastModMatch ? lastModMatch[1] : new Date().toISOString().split('T')[0];

            const imageMatch = html.match(/og:image" content="([^"]+)"/);
            const imageLoc = imageMatch ? imageMatch[1] : '';

            const titleMatch = html.match(/og:title" content="([^"]+)"/);
            let title = titleMatch ? titleMatch[1] : '';
            title = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

            const isPillar = file.includes('guia-completa') || file.includes('ultimate-guide');
            const priority = isPillar ? '0.95' : '0.9';

            sitemapXML += `
  <!-- Blog Post: ${slug} -->
  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>`;

            if (imageLoc && title) {
                sitemapXML += `
    <image:image>
      <image:loc>${imageLoc}</image:loc>
      <image:caption>${title}</image:caption>
    </image:image>`;
            }

            sitemapXML += `
  </url>`;
        });

    } catch (err) {
        console.error("❌ Error reading blog directory: ", err);
    }
} else {
    console.log("ℹ️ No blog directory found — skipping blog post entries.");
}

sitemapXML += `
</urlset>
`;

fs.writeFileSync(SITEMAP_FILE, sitemapXML);
console.log(`✅ Sitemap regenerated! ${staticUrls.length} static URLs + dynamically mapped blog posts.`);

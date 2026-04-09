const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://rsviajesreycoliman.com';
const BLOG_DIR = path.join(__dirname, '..', '..', 'blog');
const SITEMAP_FILE = path.join(__dirname, '..', '..', 'sitemap.xml');

// Static priority URLs (Roots and categories)
const staticUrls = [
    { loc: '/', lastmod: '2026-04-04', changefreq: 'weekly', priority: '1.0' },
    { loc: '/blog', lastmod: '2026-04-09', changefreq: 'weekly', priority: '0.8' },
    { loc: '/viajes-internacionales', lastmod: '2026-04-04', changefreq: 'weekly', priority: '0.7' },
    { loc: '/viajes-nacionales', lastmod: '2026-04-04', changefreq: 'weekly', priority: '0.7' },
    { loc: '/mas-destinos', lastmod: '2026-04-04', changefreq: 'weekly', priority: '0.7' },
    { loc: '/revista', lastmod: '2026-04-04', changefreq: 'monthly', priority: '0.7' },
    { loc: '/sobre-nosotros', lastmod: '2026-04-04', changefreq: 'monthly', priority: '0.8' },
    { loc: '/privacidad', lastmod: '2026-01-01', changefreq: 'yearly', priority: '0.3' }
];

console.log("🚀 Starting Sitemap Auto-Generation...");

let sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

// 1. Add static root files
for (const page of staticUrls) {
    sitemapXML += `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}

// 2. Parse all Blog HTML files dynamically!
try {
    const files = fs.readdirSync(BLOG_DIR);
    
    files.forEach(file => {
        if (!file.endsWith('.html') || file === 'index.html') return;
        
        const filePath = path.join(BLOG_DIR, file);
        const html = fs.readFileSync(filePath, 'utf8');
        
        // Extract Data using Regex
        const slug = file.replace('.html', '');
        
        // Find canonical, lastModified, and Image
        const lastModMatch = html.match(/article:modified_time" content="([^"]+)"/);
        const lastMod = lastModMatch ? lastModMatch[1] : new Date().toISOString().split('T')[0];
        
        const imageMatch = html.match(/og:image" content="([^"]+)"/);
        const imageLoc = imageMatch ? imageMatch[1] : '';
        
        const titleMatch = html.match(/og:title" content="([^"]+)"/);
        let title = titleMatch ? titleMatch[1] : '';
        // XML Escape Title
        title = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

        // For Pillar Content, grant 0.95, others 0.9
        const isPillar = file.includes('guia-completa');
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
    process.exit(1);
}

sitemapXML += `
</urlset>
`;

fs.writeFileSync(SITEMAP_FILE, sitemapXML);
console.log(`✅ Sitemap successfully regenerated! Found ${staticUrls.length} roots and dynamically mapped all blog posts.`);

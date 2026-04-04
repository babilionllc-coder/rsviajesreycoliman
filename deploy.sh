#!/bin/bash
# RS Viajes — Deploy to Vercel via GitHub
# Run this from your Mac Terminal: bash ~/Desktop/Websites/rsviajes/deploy.sh

cd "$(dirname "$0")"

# Remove stale git lock if present
rm -f .git/index.lock

# Stage all changed website files
git add .gitignore \
  index.html \
  mas-destinos.html \
  viajes-internacionales.html \
  viajes-nacionales.html \
  sobre-nosotros.html \
  sitemap.xml \
  blog/index.html \
  blog/cuanto-cuesta-viajar-a-europa-desde-mexico.html \
  blog/viajes-a-paris-desde-mexico.html \
  blog/viajes-a-italia-desde-mexico.html \
  blog/mejor-agencia-de-viajes-en-colima.html

# Commit
git commit -m "🚀 SEO/AEO: 3 new blog posts + entity page + critical fixes

New pages:
- /sobre-nosotros — AEO entity page with full schema markup
- /blog/viajes-a-paris-desde-mexico — 320/mo searches
- /blog/viajes-a-italia-desde-mexico — BlogPosting + HowTo + FAQ schema
- /blog/mejor-agencia-de-viajes-en-colima — AEO brand article

Fixes:
- Footer: removed nuevaeradigital.mx attribution from all pages
- sitemap.xml: added 8 missing URLs
- blog/index.html: WhatsApp CTA + 3 new post cards
- blog/cuanto-cuesta-europa: answer-first rewrite + HowTo schema
- .gitignore: added to keep CSVs out of repo"

# Push → triggers Vercel auto-deploy
git push origin main

echo ""
echo "✅ Done! Vercel will deploy in ~30 seconds."
echo "🔗 https://rsviajesreycoliman.com"

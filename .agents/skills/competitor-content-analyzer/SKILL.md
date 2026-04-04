---
name: competitor-content-analyzer
description: Analyzes top-ranking competitor content using DataForSEO SERP Competitors and Firecrawl web scraping. Reverse-engineer why content ranks to build better posts.
---

# Competitor Content Analyzer Skill

Reverse-engineer top-ranking content to understand what Google rewards, then build something better.

## Available Scripts

### 1. SERP Competitors

```bash
bash .agent/skills/competitor-content-analyzer/scripts/serp-competitors.sh "target keyword" [location_code] [language_code]
```

- Returns: domains competing for the keyword
- Shows: intersection count, visibility, traffic estimates

### 2. Content Scraper (Firecrawl)

```bash
bash .agent/skills/competitor-content-analyzer/scripts/content-scraper.sh "https://competitor-url.com/blog-post"
```

- Returns: full page content in markdown
- Useful for analyzing: headings structure, word count, content depth

## Analysis Workflow

1. **Identify competitors**: Run `serp-competitors.sh` with your target keyword
2. **Scrape top 3-5 results**: Run `content-scraper.sh` on each top-ranking URL
3. **Analyze patterns**: For each piece of content, note:
   - Total word count
   - Number and structure of H2/H3 headings
   - Types of media used (images, videos, tables)
   - FAQ section present? Schema markup used?
   - Internal/external linking patterns
   - Author credentials and E-E-A-T signals
4. **Build better**: Create content that covers everything competitors cover + adds:
   - Original data or insights they lack
   - Better visual assets
   - More comprehensive FAQ section
   - Proper schema markup (Article + FAQ + HowTo)
   - Stronger E-E-A-T signals

## The "10x Content" Checklist (2026)

- [ ] Covers ALL subtopics from top 5 competitors
- [ ] Includes original data, charts, or case studies they don't have
- [ ] Has richer schema markup (stacked Article + FAQ + HowTo)
- [ ] Better author credentials and E-E-A-T signals
- [ ] Answer-first structure optimized for AI Overviews
- [ ] Longer than average competitor (but no fluff — every paragraph adds value)
- [ ] More internal links (minimum 5)
- [ ] More authoritative external citations (minimum 3)

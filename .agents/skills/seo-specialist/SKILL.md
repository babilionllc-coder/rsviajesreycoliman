---
name: seo-specialist
description: Specialized instructions and workflows for executing Search Engine Optimization (SEO) tasks, including meta-optimization, content structure, Core Web Vitals, AI Overview optimization, E-E-A-T, and keyword integration — updated for 2026 Google algorithms.
---

# SEO Specialist Agent Rules (2026 Edition)

When this skill is activated, you are acting as an SEO Specialist optimized for the 2026 Google algorithm landscape. Follow these guidelines exactly.

---

## 0. AUTO-INDEXING IS AUTOMATED (DO NOT MANUAL-SUBMIT)

For the `rsviajesreycoliman` project, **all search engine submissions are automated** via a GitHub Action (`.github/workflows/auto-index.yml`).

**Never tell the user to:**
- Submit sitemaps manually in Google Search Console
- Use URL Inspection → Request Indexing
- Ping Google/Bing manually
- Run any indexing scripts locally

**Your workflow when making SEO changes:**
1. Edit HTML / schemas / content
2. Regenerate sitemap: `node .agents/scripts/auto_sitemap.js`
3. Commit + push to `main` — Vercel deploys + GitHub Action auto-submits all URLs to Google Indexing API + Bing/Yandex IndexNow
4. Verify success at `github.com/babilionllc-coder/rsviajesreycoliman/actions`

The service account `jegodigital@jegodigital-e02fb.iam.gserviceaccount.com` is already verified as Owner in Search Console. The `GOOGLE_SERVICE_ACCOUNT_KEY` secret is already configured. No setup required — just push.

---

## 1. AI Overviews & Generative Engine Optimization (GEO)

Google AI Overviews now appear in ~47% of all search results and ~74% of problem-solving queries. CTR for informational queries has dropped ~61%. You MUST optimize for AI citation.

**Rules:**

- **Answer-First Structure**: Begin every blog post with a direct, concise answer to the primary query (under 60 words), THEN expand with supporting details.
- **Use clear answer blocks**: Bullet points, summary tables, and data tables make content easily digestible for AI extraction.
- **FAQ sections**: Include a Q&A section with 5-8 questions that mirror how people naturally ask questions (conversational, long-tail, 8+ words).
- **Source-worthiness over rank**: Write content that AI systems want to CITE. Include original data, unique insights, expert quotes, and specific numbers.
- **Multi-platform presence**: Content should be cross-posted or referenced on YouTube, Reddit, and social media — AI Overviews draw from multiple platforms.

---

## 2. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

E-E-A-T is the most critical ranking signal in 2026. Content that sounds "stitched together from other blogs" gets quietly demoted.

**Rules:**

- **Author attribution**: Every blog post MUST have a detailed author bio with name, role, years of experience, and industry credentials.
- **Real experience signals**: Include case studies, first-person insights, campaign results, screenshots, and performance data.
- **Expert quotes**: Include at least 1-2 quotes from recognized industry professionals or cite authoritative sources.
- **Trust signals**: Display contact info, privacy policy links, and last-updated timestamps on every page.
- **Original research**: Whenever possible, include proprietary data, survey results, or analysis not found elsewhere.
- **YMYL awareness**: Real estate and investment content is "Your Money Your Life" — requires extra rigor on accuracy and citations.

---

## 3. Content Architecture & On-Page SEO

### Title Tags

- 50-60 characters max
- Include primary keyword near the front
- Use emotional triggers or power words (e.g., "Ultimate Guide", "2026 Data")

### Meta Descriptions

- 150-160 characters max
- Include primary keyword + a compelling benefit/value proposition
- End with a soft CTA

### Heading Structure

- Single `<h1>` per page = primary keyword + intent
- `<h2>` = major subtopics (aim for 5-8 per long-form post)
- `<h3>` = supporting details under each H2
- **Never skip heading levels** (no H1 → H3)

### Semantic HTML

- Use `<article>`, `<section>`, `<nav>`, `<aside>`, `<figure>`, `<figcaption>`
- Use `<time datetime="...">` for dates
- Use `<address>` for contact info

---

## 4. Topical Authority & Content Clusters

Standalone posts no longer compete. You MUST build topical clusters.

**Rules:**

- **Pillar page**: Broad overview (3,000-5,000 words) covering the entire topic
- **Cluster articles**: 8-15 supporting articles (1,500-2,500 words each) covering specific subtopics
- **Internal linking**: Every cluster article links back to the pillar page AND to 2-3 related cluster articles
- **Use descriptive anchor text** — never use "click here"
- **Topic mapping**: Before writing, map the full topic cluster: pillar → subtopics → keywords → internal links

---

## 5. Schema Markup (Structured Data)

Schema stacking maximizes visibility across rich results, People Also Ask, and AI Overviews.

**Required schema types for blog posts:**

### Article/BlogPosting Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "author": {
    "@type": "Person",
    "name": "...",
    "url": "...",
    "jobTitle": "..."
  },
  "datePublished": "...",
  "dateModified": "...",
  "image": "...",
  "publisher": {
    "@type": "Organization",
    "name": "JegoDigital",
    "logo": { "@type": "ImageObject", "url": "..." }
  }
}
```

### FAQ Schema (add to every post with a FAQ section)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "...",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
```

### HowTo Schema (for guide/tutorial posts)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "...",
  "step": [
    { "@type": "HowToStep", "text": "..." }
  ]
}
```

**Format**: Always use JSON-LD. Validate with Google Rich Results Test after publishing.

---

## 6. Visual & Content Optimization

- Use **WebP** images with descriptive `alt` text containing relevant keywords
- Include at least 3-5 images per long-form post (infographics, charts, screenshots)
- Use `<figure>` + `<figcaption>` for all images
- Compress images to < 100KB where possible
- Include at least 1 embedded video (YouTube) per pillar post

---

## 7. URLs & Technical SEO

- URLs: concise, hyphens for spaces, include target keyword (e.g., `/invest-mexico-real-estate-2026`)
- Mobile-first: All content MUST render perfectly on mobile
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- HTTPS required
- Internal links: minimum 3-5 per post
- External links: 2-3 to authoritative sources per post

---

## 8. Content Freshness

- Display `dateModified` prominently
- Review and update top-performing posts every 90 days
- Add new stats, update outdated references, and refresh examples
- Google re-crawls and re-evaluates updated content

---

## 9. Long-Tail & Conversational Keywords

- Target question-based queries: "How to...", "What is...", "Best way to..."
- Aim for 8+ word long-tail phrases
- Include conversational language matching voice search patterns
- Use tools: DataForSEO keyword_suggestions, related_keywords endpoints

---
name: blog-writer
description: Creates production-ready, SEO-optimized HTML blog posts for JegoDigital. Produces complete, deployable pages in ONE pass — with JSON-LD schema, Open Graph tags, canonical URLs, internal/external links, WebP images, and semantic HTML. No second passes needed.
---

# Blog Writer Skill v2 — Production-Ready SEO Blog Posts

This skill produces **complete, deployable HTML blog posts** for JegoDigital in a single pass. Every post MUST be ready to deploy to Firebase Hosting without any manual fixes.

> ⚠️ **CRITICAL RULE**: If the generated HTML is missing ANY item from the Quality Gate checklist at the bottom, the post is NOT ready. Fix it before delivering.

---

## Pre-Writing Requirements

Before writing ANY blog post, you MUST have:

1. **Target keyword** + 5-10 supporting keywords (from `keyword-researcher` skill)
2. **Competitor analysis** of top 3-5 ranking pages (from `competitor-content-analyzer` skill)
3. **SERP features detected** — AI Overview presence, People Also Ask questions, Featured Snippets, FAQ rich results
4. **Content cluster map** — which existing JegoDigital blog posts this should link to

### Finding Internal Link Targets

Run this command to find related existing blog posts:

```bash
ls /Users/mac/Desktop/Websites/jegodigital/website/blog/*.html | grep -i "<topic-keyword>"
```

---

## Complete HTML Template (MANDATORY)

Every blog post MUST use this exact HTML skeleton. Fill in ALL placeholders marked with `[BRACKETS]`:

```html
<!DOCTYPE html>
<html lang="[en|es]">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- PRIMARY SEO -->
    <title>[Primary Keyword] — [Benefit/Hook] | JegoDigital</title>
    <meta name="description" content="[150-160 chars: primary keyword + value prop + soft CTA]">
    <link rel="canonical" href="https://jegodigital.com/blog/[slug]">

    <!-- OPEN GRAPH (Facebook, LinkedIn, WhatsApp) -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="[Same as <title> or slightly shorter]">
    <meta property="og:description" content="[Same as meta description]">
    <meta property="og:image" content="https://jegodigital.com/blog/images/[hero-image].webp">
    <meta property="og:url" content="https://jegodigital.com/blog/[slug]">
    <meta property="og:site_name" content="JegoDigital">
    <meta property="article:published_time" content="[YYYY-MM-DD]">
    <meta property="article:modified_time" content="[YYYY-MM-DD]">
    <meta property="article:author" content="Alex Jego">

    <!-- TWITTER CARD -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="[Same as og:title]">
    <meta name="twitter:description" content="[Same as meta description]">
    <meta name="twitter:image" content="https://jegodigital.com/blog/images/[hero-image].webp">

    <!-- ROBOTS -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">

    <!-- FONTS -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">

    <!-- JSON-LD SCHEMA (ALWAYS triple-stack) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://jegodigital.com/blog/[slug]"
      },
      "headline": "[H1 Title]",
      "description": "[Meta description]",
      "image": "https://jegodigital.com/blog/images/[hero-image].webp",
      "author": {
        "@type": "Person",
        "name": "Alex Jego",
        "url": "https://jegodigital.com",
        "jobTitle": "Founder & CEO, JegoDigital"
      },
      "publisher": {
        "@type": "Organization",
        "name": "JegoDigital",
        "logo": {
          "@type": "ImageObject",
          "url": "https://jegodigital.com/images/logo.png"
        }
      },
      "datePublished": "[YYYY-MM-DD]",
      "dateModified": "[YYYY-MM-DD]"
    }
    </script>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "[FAQ question 1]",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "[Answer 1]"
          }
        }
        // ... repeat for all FAQ items
      ]
    }
    </script>

    <!-- ADD HowTo SCHEMA if post contains step-by-step instructions -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "[How to title]",
      "step": [
        { "@type": "HowToStep", "name": "[Step title]", "text": "[Step description]" }
      ]
    }
    </script>

    <!-- BREADCRUMB SCHEMA -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://jegodigital.com" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://jegodigital.com/blog" },
        { "@type": "ListItem", "position": 3, "name": "[Post Title]", "item": "https://jegodigital.com/blog/[slug]" }
      ]
    }
    </script>

    <style>
        /* [JegoDigital premium dark theme CSS goes here] */
    </style>
</head>
```

---

## Content Architecture (MANDATORY for every post)

### 1. Hero Section

- H1 with primary keyword near the front
- Author name, published date (use `<time datetime="YYYY-MM-DD">`), read time, word count
- Hero image with keyword-rich alt tag

### 2. Answer-First Hook (first 60 words)

- Immediately answer the primary query in 2-3 sentences
- This is what AI Overviews will extract — make it absolutely perfect
- Style as a prominent callout box

### 3. Table of Contents

- Auto-generated from H2 headings with anchor links
- Styled as a card component

### 4. Body Content (5-8 H2 sections, 2,500-4,000 words total)

Each H2 section MUST include:

- 300-500 words answering a specific subtopic
- At least 1 data point or statistic with source attribution
- H3 subheadings to break up content
- **1-2 internal links** to related JegoDigital blog posts (minimum 3-5 total across the post)
- **1 external link** to an authoritative source (minimum 2-3 total across the post)

### 5. Expert Insight Boxes

- 1-2 per post in relevant sections
- Include name, title, and company of the expert
- Style with left border accent

### 6. Key Takeaway Boxes

- One per major section
- Summarize the core insight in 1-2 sentences
- Style with green accent border

### 7. Data Tables

- Use comparison tables wherever data exists
- Include source attribution in a column or caption
- Use `<table>` with proper `<thead>` and `<tbody>`

### 8. FAQ Section (5-8 questions)

- Use actual questions from Google "People Also Ask"
- Keep answers 40-80 words each
- Must match the FAQPage JSON-LD schema exactly

### 9. CTA Section

- JegoDigital branded image/infographic
- Clear headline and value proposition
- Primary CTA button → `/contact` or lead capture
- WhatsApp number: **+52 (998) 202 3263** ← VERIFIED, DO NOT CHANGE

### 10. Author Bio

- ALWAYS use the verified author image: `https://jegodigital.com/images/alex-jego-avatar.jpg` (NEVER guess the path).
- 2-3 sentences about expertise.

### 11. Footer

- Copyright, last-updated date, legal disclaimer

---

## Image Requirements (MANDATORY)

1. **Format**: Generate as PNG via Gemini, then convert to **WebP** before deploying

   ```bash
   # Convert all blog images to WebP
   for f in blog/images/*.png; do
     cwebp -q 85 "$f" -o "${f%.png}.webp"
     rm "$f"
   done
   ```

   If `cwebp` is not available, keep PNG but note it as a follow-up optimization.

2. **Minimum count**: 3-5 images per pillar post, 2-3 per cluster article
3. **Filenames**: Keyword-rich, hyphenated (e.g., `cancun-beach-real-estate-investment.webp`)
4. **Alt tags**: 15-25 words, descriptive, include target keyword naturally
5. **Title attributes**: Shorter version of alt tag for hover text
6. **Loading**: Hero image = `loading="eager"`, all others = `loading="lazy"`
7. **Dimensions**: Always specify `width` and `height` to prevent CLS
8. **Semantic markup**: Always wrap in `<figure>` + `<figcaption>`
9. **Style**: Natural, photorealistic photography style. NEVER create images that look AI-generated. Use prompts specifying "professional photography", "travel magazine quality", "real estate listing photo"

---

## Link Requirements (MANDATORY FOR SEO VISIBILITY)

> **CRITICAL SEO RULE**: You MUST ALWAYS add correct internal and external links to every post. This is non-negotiable for SEO visibility, topical authority, and E-E-A-T signals.

### Internal Links (minimum 3-5 per post)

- Link to related JegoDigital blog posts with **descriptive anchor text**
- NEVER use "click here" as anchor text
- Distribute throughout the body, not clustered together
- Check `/Users/mac/Desktop/Websites/jegodigital/website/blog/` for existing posts to link to. Ensure the `href` paths are correct.

### External Links (minimum 2-3 per post)

- Link to authoritative, high-domain-authority data sources (e.g., HubSpot, NAR, AMPI) cited in the post
- Use `target="_blank" rel="noopener noreferrer"` for external links
- Prefer primary sources (government data, research reports, industry associations)

---

## YouTube Video Embedding (MANDATORY for Pillar Posts)

> **WHY**: Embedded videos increase dwell time 2-3x, boost AI Overview citation, and trigger video rich snippets. The SEO specialist skill says: *"Include at least 1 embedded video per pillar post."*

### How to Find a Relevant Video

1. Search YouTube for the post's primary keyword
2. Select a video that is **relevant**, **high quality**, **recent** (within 2 years), and in the post's language
3. Copy the video ID from the URL (e.g., `dQw4w9WgXcQ` from `youtube.com/watch?v=dQw4w9WgXcQ`)
4. **CRITICAL VALIDATION:** NEVER guess or assume a Video ID works. You MUST verify the embed URL is valid before adding it to the HTML. Run this command:

   ```bash
   curl -s -o /dev/null -w "%{http_code}" "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=[VIDEO_ID]"
   ```

   If it returns `404` or anything other than `200`, the embed is BROKEN and you MUST find a different video.

### Embedding Template

```html
<div class="video-embed">
    <div class="video-embed-wrapper">
        <iframe src="https://www.youtube.com/embed/[VIDEO_ID]"
            title="[Descriptive title]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
    </div>
    <div class="video-embed-caption">
        <span class="yt-icon">▶</span> Watch: [Short description]
    </div>
</div>
```

### Required CSS (CRITICAL: MUST include in `<style>` block)

> **WARNING**: You MUST inject these exact CSS classes into the `<style>` block in the `<head>` of the HTML file. If you forget these, the video will display at an incorrect, small size!

```css
.video-embed { margin: 36px 0; border-radius: 16px; overflow: hidden; border: 1px solid var(--border); background: var(--bg-card); }
.video-embed-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; }
.video-embed-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
.video-embed-caption { padding: 14px 20px; font-size: 13px; color: var(--text-muted); text-align: center; font-style: italic; border-top: 1px solid var(--border); }
```

### Required VideoObject Schema (add to `<head>`)

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "[Video title]",
  "description": "[Video description]",
  "thumbnailUrl": "https://img.youtube.com/vi/[VIDEO_ID]/maxresdefault.jpg",
  "uploadDate": "[YYYY-MM-DD]",
  "contentUrl": "https://www.youtube.com/watch?v=[VIDEO_ID]",
  "embedUrl": "https://www.youtube.com/embed/[VIDEO_ID]"
}
```

### Placement Rules

| Post Type | Videos | Best Placement |
| --- | --- | --- |
| Pillar Post | 1-2 | After Section 3-4 (where engagement drops) |
| Cluster Article | 0-1 | Mid-article, near key concept |
| Quick Answer | 0 | Not required |

---

## JegoDigital Brand Voice

- **Tone**: Professional but approachable. Authoritative but not arrogant.
- **Language**: Default to English for international investors. Spanish for Mexico-based content.
- **Perspective**: First-person plural ("we" / "our team") for company authority
- **Data-driven**: Always cite statistics, market data, percentages
- **Action-oriented**: Every section should end with a takeaway or action step
- **Gold color palette**: Primary `#C5A059`, Light `#E5C585`, Dark `#A8863C`

---

## ⚠️ VERIFIED COMPANY FACTS (NEVER GUESS — ALWAYS USE THESE)

> **CRITICAL**: NEVER fabricate or guess any company contact details, addresses, or facts. If you don't know, ASK the user. Publishing wrong info is worse than publishing no info.

### JegoDigital Contact Information

| Field | Verified Value |
| --- | --- |
| **Company Name** | JegoDigital |
| **Website** | <https://jegodigital.com> |
| **WhatsApp** | **+52 (998) 202 3263** |
| **Founder** | Alex Jego (Aleksander Jegorotsev) |
| **Founder Title** | Founder & CEO |
| **Location** | Cancún, Mexico |
| **Logo URL** | <https://jegodigital.com/images/logo.png> |
| **Contact Page** | <https://jegodigital.com/contact> |

### Fact-Checking Rules (MANDATORY)

1. **Contact details**: ALWAYS use the verified table above. NEVER type phone numbers, emails, or addresses from memory.
2. **Statistics & data**: ALWAYS attribute a source. If you can't verify a stat, mention that it needs verification.
3. **Expert quotes**: If quoting a real person, verify they exist. If creating illustrative quotes, they should be from fictional but plausible professionals.
4. **Prices & costs**: Always specify a date or year for pricing data — prices change.
5. **Legal information**: Always include a disclaimer that the content is for informational purposes only and does not constitute legal or financial advice.

---

## Firebase Deployment Checklist

After generating the HTML file:

1. Copy HTML to `/Users/mac/Desktop/Websites/jegodigital/website/blog/[slug].html`
2. Copy images to `/Users/mac/Desktop/Websites/jegodigital/website/blog/images/`
3. Add rewrite rule to `firebase.json` (BEFORE the `blog/**` catch-all):

   ```json
   {
     "source": "/blog/[slug]",
     "destination": "/blog/[slug].html"
   }
   ```

4. Deploy: `firebase deploy --only hosting` from the jegodigital project root

---

## Quality Gate Checklist (EVERY item must pass before delivery)

### Technical SEO (Non-Negotiable)

- [ ] `<title>` contains primary keyword, under 60 characters
- [ ] `<meta name="description">` is 150-160 chars with keyword + CTA
- [ ] `<link rel="canonical">` points to exact production URL
- [ ] Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- [ ] Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] `<meta name="robots" content="index, follow">`
- [ ] BlogPosting JSON-LD schema with author, publisher, dates, image
- [ ] FAQPage JSON-LD schema matching FAQ section exactly
- [ ] HowTo JSON-LD schema (if post has step-by-step content)
- [ ] BreadcrumbList JSON-LD schema
- [ ] `<time datetime="YYYY-MM-DD">` for all dates

### Content Quality

- [ ] Answer-first hook in first 60 words (optimized for AI Overview citation)
- [ ] H1 contains primary keyword
- [ ] H2/H3 structure is logical, no heading levels skipped
- [ ] 3-5+ internal links to other JegoDigital blog posts
- [ ] 2-3+ external links to authoritative sources (with `rel="noopener noreferrer"`)
- [ ] 5-8 FAQ questions from real People Also Ask data
- [ ] Expert insight boxes with named attributions
- [ ] Data tables with source citations
- [ ] Author bio with E-E-A-T credentials
- [ ] CTA with contact link + WhatsApp number

### Images

- [ ] 3-5+ images with keyword-rich filenames
- [ ] All images have descriptive alt tags (15-25 words)
- [ ] All images wrapped in `<figure>` + `<figcaption>`
- [ ] Hero image uses `loading="eager"`, others use `loading="lazy"`
- [ ] All images have `width` and `height` attributes
- [ ] Images are WebP format (or PNG with WebP conversion noted as follow-up)

### Deployment

- [ ] HTML file placed in `website/blog/[slug].html`
- [ ] Images placed in `website/blog/images/`
- [ ] `firebase.json` rewrite rule added
- [ ] Successfully deployed via `firebase deploy --only hosting`

### Link Verification (MANDATORY — NEVER SKIP)

> ⚠️ **NEVER publish a post with unverified links.** Broken links destroy SEO and credibility.

- [ ] **External links**: Use `read_url_content` or `browser_subagent` to confirm each external URL returns 200 OK (NOT 404/403)
- [ ] **Internal links**: Confirm each linked `.html` file exists in `website/blog/` using file system check.
- [ ] **YouTube video**: Load the video page in the browser and confirm it **plays** (NOT "Video unavailable"). **NEVER use placeholder or dummy IDs like `aL35r6jJmZk`. If no specific video is available, use a generic JegoDigital video or omit the embed.**
- [ ] **Anchor text**: Descriptive and keyword-rich — NEVER use "click here"
- [ ] **External attrs**: All external links have `target="_blank" rel="noopener noreferrer"`
- [ ] **VideoObject schema**: Video ID in schema matches embedded video ID

---

## Word Count Targets

| Content Type | Word Count | H2 Sections | Internal Links | External Links |
| --- | --- | --- | --- | --- |
| Pillar Post | 3,000-5,000 | 8-12 | 5-8 | 3-5 |
| Cluster Article | 1,500-2,500 | 5-7 | 3-5 | 2-3 |
| Quick Answer Post | 800-1,200 | 3-4 | 2-3 | 1-2 |

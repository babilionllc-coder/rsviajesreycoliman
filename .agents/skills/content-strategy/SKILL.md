---
name: content-strategy
description: Plans topic clusters, content calendars, and trend analysis using DataForSEO Content Analysis API and Perplexity AI. Discover what topics are trending and plan a winning content roadmap.
---

# Content Strategy Skill

Plan your content roadmap using data-driven trend analysis and deep research.

## Available Scripts

### 1. Content Trends (DataForSEO Content Analysis)

```bash
bash .agent/skills/content-strategy/scripts/content-trends.sh "keyword or brand" [date_from] [date_to]
```

- Returns: mention volume over time, sentiment analysis
- Tracks brand mentions and topic trends across the web
- Default date range: last 30 days

### 2. Topic Research (Perplexity AI)

```bash
bash .agent/skills/content-strategy/scripts/topic-research.sh "research question"
```

- Returns: in-depth research answer with citations
- Use for: exploring subtopics, market data, competitor strategies
- Model: sonar (optimized for search + citations)

## Content Strategy Workflow

### Phase 1: Market Research

1. Run `content-trends.sh "real estate mexico"` to see what's trending
2. Run `content-trends.sh "inversiones inmobiliarias mexico"` (Spanish)
3. Run `topic-research.sh` with specific questions:
   - "What are the biggest real estate investment trends in Mexico 2026?"
   - "What questions do foreign investors have about buying property in Mexico?"
   - "What content gaps exist in Mexico real estate marketing blogs?"

### Phase 2: Topic Cluster Planning

Build clusters around pillar topics using this framework:

```
PILLAR: "Real Estate Marketing in Mexico"
├── CLUSTER: "Social Media Marketing for Real Estate in Mexico"
├── CLUSTER: "SEO for Real Estate Websites in Mexico"  
├── CLUSTER: "Lead Generation Strategies for Mexican Agencies"
├── CLUSTER: "Email Marketing for Real Estate Investors"
├── CLUSTER: "Content Marketing for Luxury Properties"
└── CLUSTER: "Video Marketing for Real Estate in Cancún"
```

### Phase 3: Content Calendar

Plan a 30-day calendar with this mix:

- **Week 1**: 1 pillar post (3,000+ words)
- **Week 2**: 2 cluster articles (1,500-2,500 words each)
- **Week 3**: 2 cluster articles + 1 quick answer post
- **Week 4**: 1 cluster article + 1 roundup/update post

**Posting frequency**: 2 posts/week minimum for topical authority

### Phase 4: Content Audit

Every 90 days:

1. Identify top 10 posts by organic traffic
2. Refresh with updated stats and data
3. Add new internal links to recently published content
4. Update `dateModified` timestamps

## Priority Matrix

| Priority | Content Type | Why |
|---|---|---|
| 🔴 High | "How to invest in Mexico real estate" pillar | Massive search volume, investor leads |
| 🔴 High | "Real estate lead generation Mexico" cluster | Revenue-driving, agency clients |
| 🟡 Medium | "Best neighborhoods Cancún investment" | High-intent long-tail |
| 🟡 Medium | "Legal guide foreigners buying Mexico" | Trust-building, E-E-A-T |
| 🟢 Lower | "Real estate marketing tools Mexico" | Supporting content |
| 🟢 Lower | "Virtual tours luxury properties" | Niche but differentiating |

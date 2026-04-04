---
name: keyword-researcher
description: Uses DataForSEO and SerpAPI to discover high-value keywords with search volume, difficulty, CPC, and SERP analysis. Run scripts to find winning keywords for any niche.
---

# Keyword Researcher Skill

Use this skill to discover high-value keywords using the DataForSEO API and SerpAPI.

## Available Scripts

### 1. DataForSEO Keyword Research

```bash
bash .agent/skills/keyword-researcher/scripts/dataforseo-keywords.sh "your seed keyword" [location_code] [language_code]
```

- Returns: keyword suggestions with search volume, CPC, competition, difficulty
- Default location: 2484 (Mexico), language: "es" (Spanish)
- Also supports: 2840 (US), "en" (English)

### 2. SERP Analyzer (SerpAPI)

```bash
bash .agent/skills/keyword-researcher/scripts/serp-analyzer.sh "your target keyword" [location] [language]
```

- Returns: top 10 Google results for the keyword
- Shows: title, URL, snippet, position
- Default: google.com.mx, Spanish

### 3. DataForSEO Related Keywords

```bash
bash .agent/skills/keyword-researcher/scripts/dataforseo-related.sh "your seed keyword" [location_code] [language_code]
```

- Returns: related keywords from "searches related to" on Google
- Finds lateral keyword opportunities

### 4. DataForSEO Keywords For Site

```bash
bash .agent/skills/keyword-researcher/scripts/dataforseo-site-keywords.sh "competitor-domain.com" [location_code] [language_code]
```

- Returns: all keywords a competitor domain ranks for
- Great for competitive gap analysis

## Workflow

1. Start with a seed keyword → run `dataforseo-keywords.sh`
2. Expand with related → run `dataforseo-related.sh`
3. Spy on competitors → run `dataforseo-site-keywords.sh`
4. Validate SERPs → run `serp-analyzer.sh` on top candidates
5. Select keywords with: high volume + low difficulty + high intent

## Keyword Selection Criteria (2026)

- **Search volume**: > 100/month for long-tail, > 1,000 for pillar topics
- **Keyword difficulty**: < 40 for new sites, < 60 for established sites
- **Intent match**: Prioritize informational (blog) and commercial (leads) intent
- **AI Overview potential**: Choose questions and problem-solving queries (74% trigger AI Overviews)
- **Long-tail focus**: 4-8+ word phrases convert better and are easier to rank

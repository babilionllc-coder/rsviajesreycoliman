# CLAUDE.md — RS Viajes Rey Colimán Project Rules

**Purpose:** Standing rules Claude must follow on every task in this repo. Read this before you plan, write, or ship anything.

---

## 🔴 HARD RULE #1 — Autonomous shipping (never ask Alex to ship)

**Alex's direct words:** *"do not ever ask me to ship it, you always find a way to deploy it... if you do not find a way with sandbox issues to deploy then you ask me how we can make it so you can ship it... we always find a way... you always do all the work."*

**Translation into rules:**

1. You do the full end-to-end workflow: research → write → optimize → **deploy**. Shipping is YOUR job, not Alex's.
2. If local `git push` is blocked by the sandbox, do NOT ask Alex to run it. Fall back to the **GitHub Git Data API** using the PAT embedded in `.git/config` (`remote.origin.url`).
3. Deploy path used by this repo:
   - Primary: `git add && git commit && git push` from the sandbox
   - Fallback (when local git is blocked): Node.js script → GitHub API (`/git/blobs`, `/git/trees`, `/git/commits`, `/git/refs/heads/main`)
   - Both paths trigger `.github/workflows/auto-index.yml` automatically
4. The ONLY time you may ask Alex about deploy is if BOTH paths fail — and then the question is **"how do we unblock shipping"**, never **"should I ship"**.
5. A task is NOT "done" until you have confirmed the commit SHA landed on `origin/main`. Reporting "ready to ship" is a failure mode.

**Reference deploy script template:** `SEO antigravity/tmp_deploy_via_github_api.js` (build it once, reuse).

---

## 🔴 HARD RULE #2 — Zero broken images

**Alex's direct words:** *"why there is broken image??? make sure no broken images, you should have this in content engine rule to ensure we never get this broken images."*

**Translation into rules:**

1. Every `<img src="...">` in any HTML file shipped to this repo MUST resolve to a real file on disk with valid header bytes:
   - WebP: starts with `52 49 46 46` (RIFF) and contains `57 45 42 50` (WEBP) at offset 8
   - JPEG: starts with `FF D8 FF`
   - PNG: starts with `89 50 4E 47`
2. Run `file <path>` on every image before shipping — "data" or 0-byte output = broken.
3. When debugging a reported broken image, check BOTH:
   - Does the file exist on disk with valid header?
   - Is Alex viewing via `file://` (absolute paths like `/blog/images/x.webp` break there) vs the deployed domain? If the file exists but the complaint is visual, explain the `file://` issue and ship the fix.
4. This check runs automatically in the content engine scorer — do not bypass it.

---

## 🔴 HARD RULE #3 — Real API research before writing content

See `seo-content-engine` skill: DataForSEO + SerpAPI + Firecrawl must all run BEFORE any blog post is written. No general-knowledge shortcuts.

If an API is down (e.g., DataForSEO 401 on 2026-04-21), tell Alex, wait, or pivot to a different topic. Never write without data.

---

## 🔴 HARD RULE #4 — Bilingual by default (ES + EN)

RS Viajes primarily serves Spanish-speaking travelers from Colima/Villa de Álvarez but also targets expats and English-speaking tourists. Every new blog post is shipped as an ES/EN pair with:

- Hreflang tags (`<link rel="alternate" hreflang="es" ...>` + `<link rel="alternate" hreflang="en" ...>`)
- Sitemap entry with `xhtml:link` pairs
- Language switcher nav bar on each post (🇲🇽 ↔ 🇺🇸)
- Separate `"inLanguage"` in JSON-LD schema

EN versions live under `/blog/en/<slug>.html`.

---

## 🔴 HARD RULE #5 — Never manual-deploy

All deploys go through `main` branch. The repo has 1 GitHub Action (`.github/workflows/auto-index.yml`) that handles Google Indexing API + IndexNow submission on push.

Do NOT `scp`, `rsync`, or FTP-upload any file. The only path to production is a commit on `main`.

---

## 🔴 HARD RULE #6 — Score every blog post ≥80/100 before shipping

Run `SEO antigravity/tmp_score_posts.js` (or equivalent scorer) against every new post. The 6-axis rubric (20/20/15/15/15/15 = 100) must net ≥80. Fix before shipping — never after.

Recent history: 2026-04-21 insurance post scored 100/100 on both ES + EN.

---

## Project context

- **Domain:** rsviajesreycoliman.com (Firebase Hosting, auto-deployed from GitHub `main`)
- **Repo:** `babilionllc-coder/rsviajesreycoliman` (private)
- **Primary service areas:** Colima, Villa de Álvarez, Manzanillo, Tecomán
- **Primary phone:** +52 312 550 4084 (WhatsApp)
- **Target audience:** Mexican travelers (ES) + English-speaking expats/tourists (EN)
- **Google Business Profile:** Active (local SEO signal)
- **Current content pillar (April 2026):** International travel requirements, costs, insurance, visas, ETIAS 2026

## Site structure

```
/                          → root landing
/blog/                     → ES blog index
/blog/en/                  → EN blog index (implicit, per-post hreflang)
/blog/<slug>.html          → individual ES post
/blog/en/<slug>.html       → individual EN post
/blog/images/              → all post images (WebP preferred, JPG fallback)
/sitemap.xml               → updated on every new post with hreflang pairs
/robots.txt                → standard
```

## Before you start any task

1. Read this file (CLAUDE.md).
2. Check `SEO-AEO-PLAN-ABRIL-2026.md` for current priorities.
3. Check `git status` — understand the working state.
4. Check which skill applies (most content work → `seo-content-engine`).
5. Plan the work (use TodoWrite / TaskList).
6. **Execute end-to-end including deploy.** Don't hand off the last mile to Alex.

---

**Last updated:** 2026-04-21 (post-insurance-launch review — added Hard Rule #1 + Hard Rule #2 after Alex's correction on autonomous shipping + image integrity).

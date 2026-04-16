---
name: indexing-automation-setup
description: Portable setup guide to add zero-touch Google + Bing + Yandex auto-indexing to ANY website project. Copy this skill folder to a new project and follow the steps to get every push to main auto-submitted to search engines.
---

# 🚀 Indexing Automation — Portable Setup Guide

**Purpose:** Set up a system where every `git push origin main` automatically submits URLs to:
- **Google** (via Indexing API)
- **Bing + Yandex** (via IndexNow)

**End state:** Zero manual Search Console work, forever.

This skill is **portable** — copy the `.agents/skills/indexing-automation-setup/` folder to any project and follow the steps below.

---

## 📋 Prerequisites Checklist

Before you start, you need:

- [ ] A **website** already deployed (Vercel, Netlify, Cloudflare Pages, etc.)
- [ ] A **GitHub repo** that pushes trigger deploys
- [ ] A **sitemap.xml** at the site root (or plan to generate one)
- [ ] A **Google Cloud account** (free)
- [ ] **Google Search Console** access to the site (verified ownership)
- [ ] Ability to **add GitHub Secrets** to the repo

---

## 🏗️ Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌────────────────────┐
│ git push    │ ───▶ │ GitHub       │ ───▶ │ Vercel auto-deploy │
│ to main     │      │ Action runs  │      └────────────────────┘
└─────────────┘      │ on push      │
                     │              │ ───▶ ┌────────────────────┐
                     │              │      │ Google Indexing    │
                     │              │      │ API (38+ URLs)     │
                     │              │      └────────────────────┘
                     │              │
                     │              │ ───▶ ┌────────────────────┐
                     │              │      │ IndexNow API       │
                     │              │      │ (Bing + Yandex)    │
                     └──────────────┘      └────────────────────┘
```

---

## 🛠️ Setup Steps

### Step 1: Create Google Cloud Service Account

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or reuse existing) — e.g., `mysite-indexing`
3. Enable the **Indexing API**: Go to [API Library](https://console.cloud.google.com/apis/library) → search "Indexing API" → Enable
4. Navigate to **IAM & Admin → Service Accounts → Create Service Account**
5. Name: `indexing-bot` (or similar)
6. Click **Create and Continue**, skip optional steps, click **Done**
7. Click the newly-created service account → **Keys** tab → **Add Key → Create new key → JSON**
8. A JSON file downloads — this is your `GOOGLE_SERVICE_ACCOUNT_KEY`

### Step 2: Add Service Account as Owner in Search Console

⚠️ **CRITICAL** — Without this, the API returns 403 Forbidden.

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Select your property (e.g., `mysite.com`)
3. **Settings** (gear icon, bottom-left) → **Users and permissions**
4. **Add user**
5. Email: paste the `client_email` from the JSON (looks like `indexing-bot@mysite-indexing.iam.gserviceaccount.com`)
6. Permission: **Owner** (NOT "Full user" — must be Owner)
7. Save

### Step 3: Add GitHub Secret

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
4. Value: paste the **entire contents** of the JSON file you downloaded
5. Click **Add secret**

### Step 4: Generate IndexNow Key (for Bing/Yandex)

IndexNow is Microsoft's open protocol. No signup needed — just generate a random key.

```bash
# Generate a UUID (works on any OS with Python)
python3 -c "import uuid; print(uuid.uuid4().hex)"
# Example output: 7a980d459cd042d5aaaf7306f9ddf288
```

Save this key — you'll need it for the next step.

### Step 5: Copy Files from This Skill

Copy these files from `.agents/skills/indexing-automation-setup/templates/` into your project:

| Source (in this skill) | Destination (in your project) |
|-----------|--------|
| `templates/auto-index.yml` | `.github/workflows/auto-index.yml` |
| `templates/force_index.js` | `.agents/scripts/force_index.js` (or wherever) |
| `templates/auto_sitemap.js` | `.agents/scripts/auto_sitemap.js` |

Then create two files at your site root (replace `YOUR_KEY` with the UUID from Step 4):
- `indexnow-key.txt` → contains just the key string
- `YOUR_KEY.txt` → contains just the key string (same content, filename = key)

Both files should be publicly accessible (NOT in `.gitignore` for their specific paths).

### Step 6: Configure for Your Project

Edit `.agents/scripts/force_index.js` and update:
- `SITEMAP_PATH` — path to your sitemap.xml relative to the script

Edit `.agents/scripts/auto_sitemap.js` and update:
- `SITE_URL` — your domain
- `staticUrls` — your main page paths and priorities
- `BLOG_DIR` — path to your blog directory (or remove if no blog)

Edit `.github/workflows/auto-index.yml` and update:
- The `host` field in the IndexNow step → your domain
- The `keyLocation` URL → your domain + key filename

### Step 7: Commit + Push

```bash
git add .github/workflows/auto-index.yml \
        .agents/scripts/force_index.js \
        .agents/scripts/auto_sitemap.js \
        indexnow-key.txt \
        YOUR_KEY.txt
git commit -m "feat: zero-touch search engine auto-indexing"
git push origin main
```

### Step 8: Verify

1. Go to `github.com/YOUR_USER/YOUR_REPO/actions`
2. You should see the workflow running
3. Click it → expand "Submit URLs to Google Indexing API"
4. You should see `✅ SUCCESS [200]` for each URL

If you see **403 errors**, wait 2 minutes (Search Console owner propagation) and re-run.

---

## 🔒 Security Best Practices

1. **Never commit the service account JSON to the repo** — always use GitHub Secrets
2. **Rotate the service account key every 90 days**:
   - Google Cloud Console → Service Accounts → Keys → Delete old, Add new
   - Update GitHub Secret `GOOGLE_SERVICE_ACCOUNT_KEY`
3. **Limit the service account permissions** — only the Indexing API scope is needed
4. **Use separate service accounts per project** — don't reuse the JegoDigital one for every site

---

## 🐛 Troubleshooting

### Workflow runs but Google returns 403
- Service account not added as Owner in Search Console
- Or ownership propagation delay (wait 2 min, re-run)

### Workflow fails with "key missing"
- `GOOGLE_SERVICE_ACCOUNT_KEY` secret not set, or set with wrong name
- The workflow writes it to `/tmp/google-sa-key.json` — check that step

### IndexNow submission fails
- Key file at site root is not publicly accessible (404)
- Verify by visiting `https://YOURSITE.com/YOUR_KEY.txt` — must return the key string

### Workflow doesn't trigger
- Check `paths:` filter in workflow YAML — must match the files you're changing
- First push that adds a new workflow sometimes doesn't trigger — do a small follow-up commit

### Google Indexing API quota
- Default quota: 200 URLs per day per service account
- For larger sites, request quota increase in Google Cloud Console

---

## 📊 Expected Results Timeline

| Timeframe | What Happens |
|-----------|--------------|
| Immediately | GitHub Action runs, returns 200 for each URL |
| 1-6 hours | Google crawls the submitted URLs |
| 24-48 hours | New pages appear in Google search |
| 1-2 weeks | FAQ rich snippets, breadcrumbs show in SERPs |
| 2-4 weeks | AI Overview citations (if content is citation-worthy) |

---

## 🧩 Files in This Skill

```
.agents/skills/indexing-automation-setup/
├── SKILL.md                    (this file)
└── templates/
    ├── auto-index.yml          (GitHub Action workflow)
    ├── force_index.js          (Google Indexing API script)
    └── auto_sitemap.js         (Sitemap regenerator)
```

Copy the `templates/` files into your project as described in Step 5.

---

## 🎯 Adapt for Different Stacks

**Next.js / Astro / Gatsby:**
Most frameworks generate sitemap.xml automatically. Skip `auto_sitemap.js` — just point `force_index.js` at the auto-generated path.

**Wordpress / Shopify:**
Use their built-in sitemap URL (e.g., `/sitemap_index.xml`) and update `SITEMAP_PATH`.

**Netlify / Cloudflare Pages:**
Same GitHub Action works — it just triggers on push to main, regardless of hosting.

**Private / staging sites:**
Don't use this. The Indexing API explicitly pushes URLs into Google's crawl queue — only use on production sites you want indexed.

---

## 🔄 Maintenance

Once set up, this is **zero-maintenance**. Things you might want to do:

- **Monitor quota usage**: Google Cloud Console → APIs → Indexing API → Quotas
- **Check recent workflow runs**: `github.com/.../actions`
- **Rotate keys quarterly** (security hygiene)
- **Review Search Console coverage report monthly** — confirms URLs are being indexed

---

## 📚 Reference

- [Google Indexing API Docs](https://developers.google.com/search/apis/indexing-api/v3/quickstart)
- [IndexNow Protocol](https://www.indexnow.org/documentation)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

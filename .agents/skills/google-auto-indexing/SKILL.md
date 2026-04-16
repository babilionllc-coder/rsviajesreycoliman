---
name: google-auto-indexing
description: Set up zero-touch Google + Bing + Yandex auto-indexing on ANY website project. Use when user says "set up auto-indexing", "automate Google Search Console", "make Google find my pages automatically", "index my site automatically", "submit sitemap to Google", or when building a new website that needs search engine submission. Creates a GitHub Action that submits URLs to Google Indexing API on every push to main. Fully reusable across projects.
---

# 🚀 Google Auto-Indexing Skill

**Activate when:** The user wants to automate search engine submission for any website project.

**End result:** Every `git push origin main` automatically submits URLs to Google, Bing, and Yandex. Zero manual Search Console work.

---

## 🎯 When to Use This Skill

Trigger this skill when the user says things like:
- "Set up auto-indexing for my site"
- "Automate Google Search Console"
- "Make Google find my pages automatically"
- "Submit my sitemap to Google automatically"
- "I want Claude to handle indexing"
- "Replicate the indexing setup from rsviajes"
- Any variant of wanting hands-off Google/Bing submission

---

## 📋 Prerequisites to Verify First

Before starting setup, confirm the user has:

1. **A deployed website** (Vercel, Netlify, Cloudflare Pages, or similar)
2. **A GitHub repo** for the project
3. **A sitemap.xml** (or we'll generate one)
4. **Google Cloud Console access** (free account works)
5. **Google Search Console** ownership verified for the domain

If any prereq is missing, walk them through it before proceeding.

---

## 🏗️ The Complete Setup Procedure

### Phase 1: Google Cloud Service Account

Guide the user through:

1. Open [console.cloud.google.com](https://console.cloud.google.com)
2. Create project (or reuse) — suggest name like `{sitename}-indexing`
3. Enable **Indexing API**: [API Library](https://console.cloud.google.com/apis/library) → search "Indexing API" → Enable
4. Create service account: **IAM & Admin → Service Accounts → Create Service Account**
   - Name: `indexing-bot`
   - Skip optional role assignments
5. Click the new service account → **Keys tab → Add Key → Create new key → JSON**
6. JSON file downloads — this is the service account key

### Phase 2: Search Console Ownership (CRITICAL)

Without this, the Indexing API returns 403. Direct the user:

1. Open [search.google.com/search-console](https://search.google.com/search-console)
2. Select their property
3. **Settings (gear icon) → Users and permissions → Add user**
4. Email = the `client_email` field from the JSON keyfile (looks like `indexing-bot@project-id.iam.gserviceaccount.com`)
5. Permission: **Owner** (must be Owner, not Full user)
6. Save

### Phase 3: GitHub Secret

1. Repo → **Settings → Secrets and variables → Actions → New repository secret**
2. Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
3. Value: the **entire JSON contents** of the keyfile
4. Add secret

### Phase 4: Install Files in the Project

Use the install script from this skill to copy templates into the project:

```bash
# The skill provides this one-liner:
bash ~/.claude/skills/google-auto-indexing/scripts/install.sh
```

Or manually copy:

| From | To |
|------|-----|
| `templates/auto-index.yml` | `.github/workflows/auto-index.yml` |
| `templates/force_index.js` | `.agents/scripts/force_index.js` (create dir if needed) |
| `templates/auto_sitemap.js` | `.agents/scripts/auto_sitemap.js` |

### Phase 5: Generate IndexNow Key

```bash
# Generate random UUID
python3 -c "import uuid; print(uuid.uuid4().hex)"
```

Save the key in two places at the site's public root:
- `indexnow-key.txt` (contains just the key)
- `{KEY}.txt` (same contents, filename = key value)

Both files must be publicly accessible post-deploy.

### Phase 6: Customize the Templates

After copying, edit these `// CUSTOMIZE:` markers:

**`.github/workflows/auto-index.yml`:**
- Line with `"host"`: replace `YOURDOMAIN.com` with the user's domain
- Line with `"keyLocation"`: replace `YOURDOMAIN.com` with the user's domain

**`.agents/scripts/auto_sitemap.js`:**
- `SITE_URL`: user's domain with `https://`
- `staticUrls`: the main pages of their site
- `BLOG_DIR`: path to blog dir (or remove if no blog)

**`.agents/scripts/force_index.js`:**
- `SITEMAP_PATH`: path to sitemap.xml (default works for most projects)

### Phase 7: First Push + Verification

```bash
git add .
git commit -m "feat: zero-touch search engine auto-indexing"
git push origin main
```

Then:
1. Open `github.com/{user}/{repo}/actions`
2. Click the running workflow
3. Expand "Submit URLs to Google Indexing API"
4. Confirm `✅ SUCCESS [200]` for every URL

If 403 errors appear: service account needs 2 min to propagate as Owner. Re-run the workflow.

---

## 🧰 Using the Install Script

This skill includes `scripts/install.sh` that automates Phase 4:

```bash
bash ~/.claude/skills/google-auto-indexing/scripts/install.sh
```

It will:
1. Detect project root
2. Create `.github/workflows/` and `.agents/scripts/` directories
3. Copy templates with correct paths
4. Generate IndexNow UUID and create both key files
5. Prompt for domain and auto-replace `YOURDOMAIN.com` in templates
6. Print the remaining manual steps (GitHub Secret, Search Console owner)

---

## 🐛 Troubleshooting Playbook

| Error | Cause | Fix |
|-------|-------|-----|
| 403 Forbidden from Google | Service account not Owner | Add as Owner in Search Console (propagation ~2 min) |
| Workflow doesn't trigger | Wrong paths filter | Check `on.push.paths` matches actual files changed |
| "Service Account key missing" | Secret not set | Add `GOOGLE_SERVICE_ACCOUNT_KEY` in repo secrets |
| IndexNow 422 | Key file not publicly served | Deploy site first, verify `https://domain.com/{KEY}.txt` returns key |
| Google quota exceeded | >200 URLs/day default | Request quota increase in Cloud Console |
| First push doesn't trigger | New workflow registration delay | Make a small follow-up commit |

---

## 🔒 Security Protocol

1. **Never** commit service account JSON to repo
2. **Always** use GitHub Secrets for the key
3. **Rotate** service account keys every 90 days:
   - Google Cloud → Service Accounts → Keys → Delete old, Create new
   - Update GitHub Secret with new JSON
4. **Separate service accounts per project** — don't reuse across clients
5. **Limit scopes** — only `https://www.googleapis.com/auth/indexing` is needed

---

## 📖 Files in This Skill

```
~/.claude/skills/google-auto-indexing/
├── SKILL.md                    ← This file (activation instructions)
├── templates/
│   ├── auto-index.yml          ← GitHub Action workflow
│   ├── force_index.js          ← Google Indexing API submitter
│   └── auto_sitemap.js         ← Dynamic sitemap generator
└── scripts/
    └── install.sh              ← One-command setup script
```

---

## 🔄 Agent Rule After Setup

Once this skill has been used to set up a project, **the agent must never again instruct the user to:**
- Submit sitemaps in Google Search Console
- Click "Request Indexing" in URL Inspection
- Manually run `force_index.js`
- Ping Google or Bing manually

The automation handles it on every push to `main`. Full stop.

---

## 📚 Reference Links

- [Google Indexing API Quickstart](https://developers.google.com/search/apis/indexing-api/v3/quickstart)
- [IndexNow Protocol Docs](https://www.indexnow.org/documentation)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Google Search Console](https://search.google.com/search-console)

---

## 💡 Why This Skill Matters

**Before:** Every time you update content, you'd:
1. Push to main → Vercel deploys
2. Open Google Search Console
3. Submit sitemap (sometimes)
4. Request indexing URL-by-URL (tedious)
5. Wait days for Google to crawl
6. Repeat for Bing manually

**After this skill:** You push to main. Done. Fully indexed in minutes. Zero manual work. Across every project you set up.

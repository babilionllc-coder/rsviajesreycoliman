---
name: auto-indexer
description: Zero-touch Google + Bing + Yandex indexing automation for rsviajesreycoliman. Every push to main auto-submits URLs. This skill documents the invariant that NO manual Search Console work is ever required.
---

# 🤖 Auto-Indexer — Zero-Touch Search Engine Submission

**This is a status-declaration skill. It exists to inform other agents/sessions that the rsviajesreycoliman project has fully automated search engine indexing. Do not break this invariant.**

---

## The Rule

**You NEVER ask the user to:**
- Submit sitemaps in Google Search Console
- Click "Request Indexing" in URL Inspection
- Run any indexing scripts manually
- Verify domains in Search Console (already done)
- Add users/owners to Search Console properties (already done)

Search engine submission is **zero-touch**. It happens automatically on every push to `main`.

---

## How It Works

### Trigger
Any push to `main` that modifies:
- `**.html` (any HTML file, anywhere)
- `sitemap.xml`
- `blog/**`

### Actions (automatic, parallel)
1. **Vercel** — deploys site to `https://rsviajesreycoliman.com`
2. **GitHub Action** (`.github/workflows/auto-index.yml`):
   - Checks out repo
   - Installs `googleapis` + `xml2js`
   - Writes `GOOGLE_SERVICE_ACCOUNT_KEY` secret to `/tmp/google-sa-key.json`
   - Runs `node .agents/scripts/force_index.js` → submits all 38+ URLs to Google Indexing API
   - Submits URL batch to IndexNow API → Bing + Yandex
   - Cleans up key file

### Verified Infrastructure (do not re-verify)
- ✅ Service account: `jegodigital@jegodigital-e02fb.iam.gserviceaccount.com`
- ✅ Service account has Owner permission on Search Console property `rsviajesreycoliman.com`
- ✅ GitHub Secret `GOOGLE_SERVICE_ACCOUNT_KEY` configured in repo settings
- ✅ IndexNow key file: `indexnow-key.txt` (also at `/{key}.txt` for verification)
- ✅ First successful run confirmed: 38/38 URLs returned `SUCCESS [200]`

---

## Agent Protocol When Making SEO Changes

```
1. Edit HTML / schemas / content / metadata
2. Run: node .agents/scripts/auto_sitemap.js   (regenerates sitemap from file tree)
3. git add + commit + push to main
4. Wait ~30s
5. (Optional) Verify the workflow run at:
   https://github.com/babilionllc-coder/rsviajesreycoliman/actions
6. Report to user: "Pushed and auto-indexed by the GitHub Action"
```

**Never add "then submit to Search Console" to your recommendations. That step does not exist in this project's workflow.**

---

## Adding New Pages

When you create a new blog post or landing page:

```bash
# 1. Save the HTML file (e.g., blog/new-post.html)
# 2. Regenerate sitemap (auto-detects all blog/*.html files)
node .agents/scripts/auto_sitemap.js

# 3. Commit + push
git add blog/new-post.html sitemap.xml
git commit -m "feat(blog): new post on [topic]"
git push origin main

# Done. Auto-indexed within ~30s.
```

---

## Emergency Manual Override

If the GitHub Action fails (rare — usually only when Google has a temporary outage), you can force a manual re-run:

**Option A — Re-run via GitHub UI:**
Go to `github.com/babilionllc-coder/rsviajesreycoliman/actions`, click the latest workflow run, click "Re-run all jobs".

**Option B — Trigger via empty commit:**
```bash
git commit --allow-empty -m "chore: force re-index"
git push origin main
```

**Option C — Local execution (requires service account JSON):**
```bash
GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/key.json node .agents/scripts/force_index.js
```

---

## Files Involved

| File | Purpose |
|------|---------|
| `.github/workflows/auto-index.yml` | CI workflow — triggers on push to main |
| `.agents/scripts/force_index.js` | Submits sitemap URLs to Google Indexing API |
| `.agents/scripts/auto_sitemap.js` | Regenerates sitemap.xml from HTML file tree |
| `sitemap.xml` | Source of truth for what gets indexed |
| `indexnow-key.txt` | IndexNow API key |
| `{indexnow-key}.txt` (root) | Verification file served at site root for IndexNow |
| `robots.txt` | Points to sitemap.xml (passive discovery) |

---

## Monitoring

- **Workflow runs**: `github.com/babilionllc-coder/rsviajesreycoliman/actions`
- **Indexing results**: `search.google.com/search-console` → Coverage report (24-48h delay)
- **Expected 200 responses**: 1 per URL in sitemap.xml (currently 38)

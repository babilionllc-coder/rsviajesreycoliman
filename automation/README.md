# RS Viajes — Daily Blog Automation

End-to-end autonomous blog publishing. Drops a new SEO+AEO-optimized article on `rsviajesreycoliman.com/blog` every day at **13:00 MX time**, then submits it to Google and Bing automatically.

## How it works

```
┌──────────────────────────────────────────────────────────────────────┐
│  GitHub Actions cron (19:00 UTC daily = 13:00 MX Central)           │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  automation/daily_pipeline.py                                        │
│                                                                      │
│   1. pick_topic()   → reads content-backlog.json, picks next pending │
│   2. research()     → Perplexity Sonar Pro (current facts + prices)  │
│   3. write_post()   → Claude Opus 4.6 generates HTML draft           │
│   4. find_image()   → matches topic to /blog/images/ (46 available)  │
│   5. qa_gate()      → validates schemas, length, links, brand        │
│   6. publish()      → writes file + inserts card at TOP of index +   │
│                       updates sitemap.xml                            │
│   7. notify()       → Telegram ping with the live URL                │
└──────────────────────────────────────────────────────────────────────┘
                               │ git push main
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Vercel deploy (~60 sec) + auto-index.yml workflow                  │
│    • Google Indexing API (force_index.js rotating queue)            │
│    • IndexNow API (Bing + Yandex)                                    │
└──────────────────────────────────────────────────────────────────────┘
```

## Required GitHub secrets

Go to **Settings → Secrets and variables → Actions** on the rsviajesreycoliman repo and add:

| Secret | Where to get it | Used by |
|---|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com | Writing |
| `PERPLEXITY_API_KEY` | https://www.perplexity.ai/settings/api | Research |
| `TELEGRAM_BOT_TOKEN` | @BotFather on Telegram | Notifications |
| `TELEGRAM_CHAT_ID` | Message @RawDataBot to get your chat ID | Notifications |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | *(already configured)* | Indexing API |

Optional but recommended:
- Ensure `indexnow-key.txt` and the matching `<key>.txt` file at the site root exist so Bing's IndexNow endpoint accepts submissions.

## Monthly cost

| Service | Est. cost |
|---|---|
| Anthropic (Claude Opus 4.6, ~4K tokens/post × 30 posts) | ~$15 |
| Perplexity Sonar Pro (~30 queries) | ~$8 |
| GitHub Actions | $0 (within 2000 min/mo free tier) |
| **Total** | **~$23/mo** |

## The 60-topic backlog

`automation/content-backlog.json` contains 60 pre-researched topics across 5 buckets, ranked by priority (search volume × competition gap). At 1/day that's 2 months of fully-planned content. When the backlog hits <10 pending, run the seo-engine keyword module to top it up.

Each topic contains:
- `id`, `priority`, `primary_keyword`, `title`, `bucket`
- `search_volume`, `competition`
- `badge`: emoji + label + gradient colors for the blog-index card
- `image_hint`: which file in `/blog/images/` to use as hero
- `angle`: the content direction for Claude

Top 10 in queue (priority DESC):
1. **T001** — Viajes de Graduación Colima (local, low competition, 100% ours)
2. **T002** — Viajes a París desde México (1,200 vol/mo)
3. **T003** — Mejores Destinos de Playa en México para Familias (880 vol/mo)
4. **T004** — Cruceros por el Caribe desde México (1,600 vol/mo)
5. **T005** — Paquetes Semana Santa 2027 (2,400 vol/mo — reserve now!)
6. **T006** — Tours desde Colima (local, ours)
7. **T007** — Viajes a Japón desde México (1,900 vol/mo)
8. **T008** — Visa USA para Mexicanos (5,400 vol/mo — massive AEO bet)
9. **T009** — Viajes a Cuba Todo Incluido (720 vol/mo)
10. **T010** — Mejores Luna de Miel 2026 (1,100 vol/mo)

## Manual controls

### Trigger a run right now (instead of waiting for 13:00)
GitHub → Actions → **Daily Blog Post** → **Run workflow** (leave topic blank for auto-pick).

### Force a specific topic
GitHub → Actions → **Daily Blog Post** → **Run workflow** → Topic ID: `T005` (or any ID).

### Pause the pipeline
Option A — disable the workflow: GitHub → Actions → Daily Blog Post → `•••` → Disable workflow.
Option B — mark all pending topics as `skipped` in content-backlog.json.

### Rollback a bad post
```bash
# From your local rsviajes clone
git log --oneline -5             # find the commit hash
git revert <hash>
git push origin main
# Blog post file + card + sitemap entry will be reverted
# Update content-backlog.json → set status back to "pending" if you want it retried
```

### Test locally before committing
```bash
cd rsviajes
export ANTHROPIC_API_KEY=sk-...
export PERPLEXITY_API_KEY=pplx-...
python3 automation/daily_pipeline.py --dry-run
# Writes the draft to /tmp/<slug>.html — inspect before real run
```

## Monitoring

Daily Telegram message when the pipeline runs. Shape:
```
✅ Nuevo blog publicado — RS Viajes
📌 Viajes a París desde México 2026
🔗 https://rsviajesreycoliman.com/blog/viajes-a-paris-desde-mexico-2026
🔑 viajes a paris desde mexico precio
📊 Volumen: 1,200/mo
🆔 T002
```

If the QA gate fails, you get an ❌ with the error list. The topic auto-reverts to `pending` so tomorrow's run picks it up again (or a different one by priority order).

## What the QA gate enforces

- Min 1,500 words
- Min 3 valid JSON-LD schemas (BlogPosting + FAQPage + BreadcrumbList + HowTo/ItemList)
- Brand name "RS Viajes Rey Colimán" appears at least once
- WhatsApp CTA link present
- Primary keyword appears in body
- Canonical + hreflang present
- Min 3 internal site links
- All schemas parse as valid JSON

If any check fails → post is NOT published, topic reverts to pending, Telegram alert fires.

## Design system compliance

The writer reads `/blog/viajes-a-italia-desde-mexico.html` (the canonical template) and matches:
- CSS variables (`--primary: #1a73e8`, `--accent: #ff6b35`)
- Font stack (Roboto body + Playfair Display headings)
- CSS classes (blog-nav, breadcrumb, hero, answer-box, toc, data-table, faq-item, whatsapp-cta)
- JSON-LD schema shape
- Header + footer pattern

If the design system ever changes, update the template file and the pipeline will pick it up automatically on the next run.

#!/usr/bin/env python3
"""
RS Viajes Rey Colimán — Daily Blog Pipeline
============================================

Runs end-to-end every day at 13:00 MX time via GitHub Actions.

Flow:
  1. pick_topic()     → grabs next pending topic from content-backlog.json
  2. research()       → Perplexity Sonar Pro fetches current facts/prices
  3. write_post()     → Claude generates the HTML article (schemas, FAQ, internal links)
  4. find_image()     → matches topic to /blog/images/ or falls back to local default
  5. qa_gate()        → validates length, schemas, links, badge, uniqueness
  6. publish()        → writes the file, inserts card at TOP of /blog/index.html, updates sitemap
  7. notify()         → Telegram ping with the live URL

After publish, the existing auto-index.yml workflow fires on push and submits
the new URL to Google Indexing API + IndexNow.

Run with:
  python3 automation/daily_pipeline.py            # normal daily run
  python3 automation/daily_pipeline.py --dry-run  # picks topic, writes files to /tmp, no commit
  python3 automation/daily_pipeline.py --topic T005  # force a specific topic
"""
import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

import anthropic
import requests

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKLOG_PATH = REPO_ROOT / "automation" / "content-backlog.json"
BLOG_DIR = REPO_ROOT / "blog"
IMAGES_DIR = BLOG_DIR / "images"
BLOG_INDEX = BLOG_DIR / "index.html"
SITEMAP = REPO_ROOT / "sitemap.xml"
TEMPLATE = BLOG_DIR / "viajes-a-italia-desde-mexico.html"

MX_TZ = timezone(timedelta(hours=-6))  # México Central


# -----------------------------------------------------------------------------
# 1. PICK TOPIC
# -----------------------------------------------------------------------------
def pick_topic(forced_id: str | None = None) -> dict:
    """Pick next pending topic. Returns the topic dict and marks it in_progress."""
    with open(BACKLOG_PATH) as f:
        backlog = json.load(f)

    if forced_id:
        topic = next((t for t in backlog["topics"] if t["id"] == forced_id), None)
        if not topic:
            raise ValueError(f"Topic {forced_id} not found")
    else:
        # Pending topics ordered by priority DESC
        pending = [t for t in backlog["topics"] if t["status"] == "pending"]
        if not pending:
            raise RuntimeError("No pending topics in backlog — reseed content-backlog.json")
        topic = max(pending, key=lambda t: t["priority"])

    # Cannibalization check
    slug_base = slugify(topic["title"])
    for p in BLOG_DIR.glob("*.html"):
        if p.stem == slug_base or topic["primary_keyword"].lower() in p.stem.lower().replace("-", " "):
            if p.stem != slug_base:
                continue
            print(f"⚠️  Cannibalization risk: {p.stem} already exists. Skipping {topic['id']}.")
            topic["status"] = "skipped"
            _save_backlog(backlog)
            return pick_topic()  # recurse to next

    topic["status"] = "in_progress"
    topic["picked_at"] = datetime.now(MX_TZ).isoformat()
    _save_backlog(backlog)
    print(f"✅ Picked: {topic['id']} — {topic['title']}")
    return topic


def _save_backlog(backlog: dict) -> None:
    with open(BACKLOG_PATH, "w") as f:
        json.dump(backlog, f, indent=2, ensure_ascii=False)


def slugify(title: str) -> str:
    s = title.lower()
    s = re.sub(r"[áàä]", "a", s)
    s = re.sub(r"[éèë]", "e", s)
    s = re.sub(r"[íìï]", "i", s)
    s = re.sub(r"[óòö]", "o", s)
    s = re.sub(r"[úùü]", "u", s)
    s = re.sub(r"ñ", "n", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    # Cut at first " — " equivalent or keep keyword-rich prefix
    parts = s.split("-")
    return "-".join(parts[:8])  # max 8 words for clean URL


# -----------------------------------------------------------------------------
# 2. RESEARCH
# -----------------------------------------------------------------------------
def research(topic: dict) -> dict:
    """Use Perplexity Sonar Pro to fetch up-to-date facts and prices."""
    api_key = os.environ.get("PERPLEXITY_API_KEY")
    if not api_key:
        print("⚠️  PERPLEXITY_API_KEY not set — using offline research stub.")
        return {"facts": topic["angle"], "prices": "", "competitors": "", "sources": []}

    prompt = f"""Investiga para un artículo de blog en español (México) sobre: "{topic['title']}".

Enfoque del artículo: {topic['angle']}
Palabra clave principal: {topic['primary_keyword']}
Audiencia: mexicanos en Colima que quieren viajar.

Devuelve en formato JSON los siguientes datos reales y actualizados 2026:

1. "key_facts": 8-12 datos concretos y verificables (precios, fechas, duraciones, requisitos, estadísticas)
2. "prices_mxn": 4-6 precios reales actuales en pesos mexicanos (vuelos, hoteles, paquetes)
3. "top_questions": 6 preguntas reales que los mexicanos hacen en Google sobre este tema
4. "sources": 4-6 URLs de fuentes oficiales/autoritativas que validan los datos
5. "competitor_angles": 3 ángulos que los competidores (otras agencias) destacan
6. "unique_angle": 1 ángulo único para RS Viajes (experiencia local Colima)

Solo JSON, sin texto extra."""

    resp = requests.post(
        "https://api.perplexity.ai/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": "sonar-pro",
            "messages": [{"role": "user", "content": prompt}],
            "return_citations": True,
            "search_recency_filter": "month",
        },
        timeout=120,
    )
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]

    # Extract JSON block
    match = re.search(r"\{.*\}", content, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError:
            data = {"raw": content}
    else:
        data = {"raw": content}

    print(f"✅ Research: {len(str(data))} chars, {len(data.get('sources', []))} sources")
    return data


# -----------------------------------------------------------------------------
# 3. WRITE POST (Claude)
# -----------------------------------------------------------------------------
def write_post(topic: dict, research_data: dict) -> str:
    """Generate the full HTML article using Claude."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is required")

    # Load the template so Claude matches the design system
    template_excerpt = TEMPLATE.read_text()[:15000]

    today = datetime.now(MX_TZ).strftime("%Y-%m-%d")
    today_es = datetime.now(MX_TZ).strftime("%d de %B de %Y").replace(
        "January", "enero").replace("February", "febrero").replace("March", "marzo").replace(
        "April", "abril").replace("May", "mayo").replace("June", "junio").replace(
        "July", "julio").replace("August", "agosto").replace("September", "septiembre").replace(
        "October", "octubre").replace("November", "noviembre").replace("December", "diciembre")

    slug = slugify(topic["title"])
    url = f"https://rsviajesreycoliman.com/blog/{slug}"
    image_filename = topic["image_hint"]
    badge = topic["badge"]

    prompt = f"""Eres un redactor SEO senior de RS Viajes Rey Colimán, agencia de viajes en Villa de Álvarez, Colima.

Escribe un artículo de blog en español mexicano (es-MX) COMPLETO y listo para publicar.

**Datos del artículo:**
- Título: {topic['title']}
- Palabra clave principal: {topic['primary_keyword']}
- URL: {url}
- Slug: {slug}
- Fecha: {today} ({today_es})
- Hero image: /blog/images/{image_filename}
- Badge: emoji={badge['emoji']} label="{badge['label']}" gradient={badge['gradient']}
- Ángulo: {topic['angle']}

**Research actualizado (usa estos datos, NO inventes):**
{json.dumps(research_data, ensure_ascii=False, indent=2)[:4000]}

**Reglas obligatorias:**
1. Longitud: 1,800-3,500 palabras
2. Estructura answer-first: el primer párrafo responde directamente la pregunta del título, mencionando "RS Viajes Rey Colimán" en las primeras 2 frases.
3. Mencionar "RS Viajes Rey Colimán" al menos 3 veces en el artículo.
4. 6-8 secciones con <h2>, cada una con sub-h3 cuando aplique.
5. FAQ al final: mínimo 6 preguntas/respuestas.
6. 3 enlaces internos mínimo:
   - /blog/ (índice de blog)
   - / (homepage)
   - Un blog post relacionado existente (elige entre: /blog/viajes-a-italia-desde-mexico, /blog/cuanto-cuesta-viajar-a-europa-desde-mexico, /blog/paquetes-viajes-todo-incluido, /blog/cruceros-desde-mexico-todo-incluido, /blog/mejor-agencia-de-viajes-en-colima, /blog/requisitos-viajar-extranjero-mexico)
7. WhatsApp CTA: https://wa.me/523125504084?text=Hola%2C%20me%20interesa%20[tema%20relevante]
8. 4 schemas JSON-LD:
   - BlogPosting con author, datePublished, dateModified, image, mainEntityOfPage
   - FAQPage con todas las preguntas del FAQ
   - BreadcrumbList (Inicio → Blog → Este post)
   - Un schema adicional según el tipo de contenido: HowTo si es guía paso-a-paso, ItemList si es ranking/top-10
9. Meta tags completos: title, description (145-155 chars), canonical, hreflang es/en/x-default, OG tags, Twitter card
10. NO usar jerga de IA ni mencionar automatización
11. Precios: solo los del research_data o rangos genéricos ("desde $X MXN"), nunca inventes cifras exactas

**Estructura HTML:** usa EXACTAMENTE el mismo sistema de diseño que este template (CSS variables, clases blog-nav, breadcrumb, hero, answer-box, toc, data-table, faq-item, whatsapp-cta). Copia el <head>, el CSS en el <style>, el <nav>, el <footer>. Solo cambia el contenido, los schemas y el main.

Template de referencia (NO copies el contenido, solo la estructura/clases):
```html
{template_excerpt}
```

**Entrega:** devuelve SOLO el HTML completo del archivo, empezando con <!DOCTYPE html>. Nada de texto antes o después. Nada de markdown. Solo HTML listo para guardar como archivo .html."""

    client = anthropic.Anthropic(api_key=api_key)
    print("🤖 Generating draft with Claude Opus...")
    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=16000,
        messages=[{"role": "user", "content": prompt}],
    )
    html = message.content[0].text.strip()

    # Strip accidental markdown fences
    html = re.sub(r"^```(?:html)?\n", "", html)
    html = re.sub(r"\n```\s*$", "", html)

    word_count = len(re.sub(r"<[^>]+>", " ", html).split())
    print(f"✅ Draft: {len(html)} chars, ~{word_count} words")
    return html


# -----------------------------------------------------------------------------
# 4. FIND IMAGE
# -----------------------------------------------------------------------------
def find_image(topic: dict) -> str:
    """Return filename of a real image in /blog/images/ matching the topic."""
    hint = topic["image_hint"]
    candidate = IMAGES_DIR / hint
    if candidate.exists():
        return hint

    # Fallback: pick any existing image matching the bucket
    fallbacks = {
        "destinations": "paquetes-viajes-todo-incluido.webp",
        "seasonal": "mejores-destinos-viajar-marzo.webp",
        "local": "mejores-destinos-viajar-desde-colima.webp",
        "visas": "requisitos-viajar-extranjero-mexico.webp",
        "comparisons": "paquetes-de-viaje-colima.webp",
    }
    fb = fallbacks.get(topic["bucket"], "paquetes-viajes-todo-incluido.webp")
    print(f"⚠️  Image {hint} not found — using fallback {fb}")
    topic["image_hint"] = fb
    return fb


# -----------------------------------------------------------------------------
# 5. QA GATE
# -----------------------------------------------------------------------------
def qa_gate(html: str, topic: dict) -> tuple[bool, list[str]]:
    """Validate the draft. Returns (passed, errors_list)."""
    errors = []

    word_count = len(re.sub(r"<[^>]+>", " ", html).split())
    if word_count < 1500:
        errors.append(f"Word count too low: {word_count} (min 1500)")

    if html.count('<script type="application/ld+json">') < 3:
        errors.append("Missing schemas (need min 3 JSON-LD blocks)")

    if "RS Viajes Rey Colimán" not in html and "RS Viajes Rey Coliman" not in html:
        errors.append("Brand name 'RS Viajes Rey Colimán' missing")

    if "wa.me/523125504084" not in html:
        errors.append("WhatsApp CTA link missing")

    if topic["primary_keyword"].split()[0].lower() not in html.lower():
        errors.append(f"Primary keyword '{topic['primary_keyword']}' absent")

    if 'rel="canonical"' not in html:
        errors.append("Canonical link missing")

    if 'hreflang=' not in html:
        errors.append("hreflang missing")

    # Internal links check (min 2)
    internal_links = len(re.findall(r'href="(/[^"#?]*)"', html))
    if internal_links < 3:
        errors.append(f"Too few internal links: {internal_links} (min 3)")

    # Parse schemas as JSON
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL):
        try:
            json.loads(m.group(1))
        except json.JSONDecodeError as e:
            errors.append(f"Invalid JSON-LD: {e}")

    passed = len(errors) == 0
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} QA: {word_count} words, {internal_links} internal links, errors: {len(errors)}")
    for e in errors:
        print(f"  • {e}")
    return passed, errors


# -----------------------------------------------------------------------------
# 6. PUBLISH
# -----------------------------------------------------------------------------
def publish(html: str, topic: dict, dry_run: bool = False) -> str:
    """Write file, update blog/index.html (at TOP) and sitemap.xml."""
    slug = slugify(topic["title"])
    out_path = BLOG_DIR / f"{slug}.html"

    if dry_run:
        out_path = Path("/tmp") / f"{slug}.html"

    out_path.write_text(html)
    print(f"📝 Wrote {out_path}")

    if dry_run:
        return str(out_path)

    # --- Update blog/index.html (insert card at TOP) ---
    _update_blog_index(topic, slug)

    # --- Update sitemap.xml ---
    _update_sitemap(slug)

    return str(out_path)


def _update_blog_index(topic: dict, slug: str) -> None:
    index_html = BLOG_INDEX.read_text()
    badge = topic["badge"]
    image = topic["image_hint"]
    today_es = datetime.now(MX_TZ).strftime("%-d de %B %Y").replace(
        "January", "enero").replace("February", "febrero").replace("March", "marzo").replace(
        "April", "abril").replace("May", "mayo").replace("June", "junio").replace(
        "July", "julio").replace("August", "agosto").replace("September", "septiembre").replace(
        "October", "octubre").replace("November", "noviembre").replace("December", "diciembre")
    # Spanish lowercase months
    excerpt = f"{topic['title'].split(' — ')[0] if ' — ' in topic['title'] else topic['title'][:80]}. Guía actualizada de RS Viajes Rey Colimán."
    if len(excerpt) > 160:
        excerpt = excerpt[:157] + "..."

    card = f'''
            <a href="/blog/{slug}" class="post-card">
                <img src="/blog/images/{image}"
                     alt="{topic['title']}"
                     loading="eager" width="400" height="220">
                <div class="post-card-body">
                    <span style="display:inline-block;background:linear-gradient(135deg,{badge['gradient'].split(',')[0]},{badge['gradient'].split(',')[1]});color:#fff;padding:3px 12px;border-radius:12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">{badge['emoji']} {badge['label']}</span>
                    <h2>{topic['title']}</h2>
                    <p>{excerpt}</p>
                    <div class="post-card-meta">
                        <span>📅 {today_es}</span>
                        <span>⏱️ 10 min</span>
                    </div>
                    <span class="read-more">Leer artículo →</span>
                </div>
            </a>
'''

    # Insert BEFORE the first <a href=".../blog/..." class="post-card"> in the posts-grid
    pattern = r'(<div class="posts-grid">\s*\n)'
    new_index = re.sub(pattern, r"\1" + card, index_html, count=1)
    if new_index == index_html:
        print("⚠️  Could not locate .posts-grid — index not updated")
        return

    BLOG_INDEX.write_text(new_index)
    print(f"📝 Blog index: card inserted at TOP for {slug}")


def _update_sitemap(slug: str) -> None:
    sitemap = SITEMAP.read_text()
    today = datetime.now(MX_TZ).strftime("%Y-%m-%d")
    new_url = f"""    <url>
        <loc>https://rsviajesreycoliman.com/blog/{slug}</loc>
        <lastmod>{today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>
</urlset>"""
    updated = sitemap.replace("</urlset>", new_url)
    SITEMAP.write_text(updated)
    print(f"📝 Sitemap: added /blog/{slug}")


# -----------------------------------------------------------------------------
# 7. NOTIFY
# -----------------------------------------------------------------------------
def notify(topic: dict, slug: str, success: bool, error: str = "") -> None:
    bot = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat = os.environ.get("TELEGRAM_CHAT_ID")
    if not bot or not chat:
        print("ℹ️  Telegram not configured, skipping notification")
        return

    url = f"https://rsviajesreycoliman.com/blog/{slug}"
    if success:
        msg = f"✅ *Nuevo blog publicado — RS Viajes*\n\n📌 {topic['title']}\n🔗 {url}\n🔑 {topic['primary_keyword']}\n📊 Volumen: {topic['search_volume']}/mo\n🆔 {topic['id']}"
    else:
        msg = f"❌ *Pipeline falló — RS Viajes*\n\n🆔 {topic['id']}\n📌 {topic['title']}\n⚠️ {error}"

    try:
        requests.post(
            f"https://api.telegram.org/bot{bot}/sendMessage",
            data={"chat_id": chat, "text": msg, "parse_mode": "Markdown"},
            timeout=30,
        )
    except Exception as e:
        print(f"⚠️  Telegram notification failed: {e}")


# -----------------------------------------------------------------------------
# MAIN
# -----------------------------------------------------------------------------
def mark_published(topic: dict, slug: str, word_count: int) -> None:
    with open(BACKLOG_PATH) as f:
        backlog = json.load(f)
    for t in backlog["topics"]:
        if t["id"] == topic["id"]:
            t["status"] = "published"
            t["slug"] = slug
            t["published_at"] = datetime.now(MX_TZ).isoformat()
            t["word_count"] = word_count
            break
    _save_backlog(backlog)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--topic", help="Force a specific topic ID")
    args = parser.parse_args()

    start = time.time()
    topic = None
    slug = ""
    try:
        topic = pick_topic(args.topic)
        slug = slugify(topic["title"])
        research_data = research(topic)
        find_image(topic)  # may mutate topic["image_hint"]
        html = write_post(topic, research_data)
        passed, errors = qa_gate(html, topic)

        if not passed:
            err = "QA gate failed: " + "; ".join(errors)
            # Revert topic status to pending so we retry tomorrow with a different angle
            with open(BACKLOG_PATH) as f:
                backlog = json.load(f)
            for t in backlog["topics"]:
                if t["id"] == topic["id"]:
                    t["status"] = "pending"
                    t["last_error"] = err
                    break
            _save_backlog(backlog)
            notify(topic, slug, success=False, error=err)
            print(f"❌ {err}")
            sys.exit(1)

        out = publish(html, topic, dry_run=args.dry_run)
        if not args.dry_run:
            word_count = len(re.sub(r"<[^>]+>", " ", html).split())
            mark_published(topic, slug, word_count)
            notify(topic, slug, success=True)

        elapsed = time.time() - start
        print(f"\n🎉 Done in {elapsed:.1f}s → {out}")

    except Exception as e:
        err = str(e)
        print(f"❌ Pipeline exception: {err}")
        if topic and slug:
            notify(topic, slug, success=False, error=err)
        raise


if __name__ == "__main__":
    main()

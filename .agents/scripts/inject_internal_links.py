#!/usr/bin/env python3
"""
Injects strategic internal links into blog posts to create a content cluster web.
Each post gets 2-4 contextual links to related posts.
"""
import os, re

BLOG_DIR = "blog"

# Internal linking rules: post -> [(anchor_text_to_find, replacement_with_link)]
# We find natural phrases in each post and turn them into links to related content.

LINK_MAP = {
    # BEACH CLUSTER
    "viajes-a-cancun-desde-colima.html": [
        ("Costa Rica", '<a href="/blog/viajes-costa-rica-todo-incluido-desde-mexico">Costa Rica</a>'),
        ("Colombia", '<a href="/blog/viajes-colombia-todo-incluido-desde-mexico">Colombia</a>'),
        ("cruceros", '<a href="/blog/cruceros-desde-mexico-todo-incluido">cruceros</a>'),
    ],
    "viajes-colombia-todo-incluido-desde-mexico.html": [
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("Costa Rica", '<a href="/blog/viajes-costa-rica-todo-incluido-desde-mexico">Costa Rica</a>'),
    ],
    "viajes-costa-rica-todo-incluido-desde-mexico.html": [
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("Colombia", '<a href="/blog/viajes-colombia-todo-incluido-desde-mexico">Colombia</a>'),
    ],

    # EUROPE CLUSTER
    "viajes-a-espana-desde-mexico.html": [
        ("Grecia", '<a href="/blog/viajes-a-grecia-desde-mexico">Grecia</a>'),
        ("Italia", '<a href="/blog/viajes-a-italia-desde-mexico">Italia</a>'),
        ("París", '<a href="/blog/viajes-a-paris-desde-mexico">París</a>'),
    ],
    "viajes-a-grecia-desde-mexico.html": [
        ("España", '<a href="/blog/viajes-a-espana-desde-mexico">España</a>'),
        ("Italia", '<a href="/blog/viajes-a-italia-desde-mexico">Italia</a>'),
        ("Turquía", '<a href="/blog/viajes-a-turquia-desde-mexico">Turquía</a>'),
    ],
    "viajes-a-italia-desde-mexico.html": [
        ("España", '<a href="/blog/viajes-a-espana-desde-mexico">España</a>'),
        ("Grecia", '<a href="/blog/viajes-a-grecia-desde-mexico">Grecia</a>'),
        ("París", '<a href="/blog/viajes-a-paris-desde-mexico">París</a>'),
    ],
    "viajes-a-paris-desde-mexico.html": [
        ("España", '<a href="/blog/viajes-a-espana-desde-mexico">España</a>'),
        ("Italia", '<a href="/blog/viajes-a-italia-desde-mexico">Italia</a>'),
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
    ],
    "viajes-a-turquia-desde-mexico.html": [
        ("Grecia", '<a href="/blog/viajes-a-grecia-desde-mexico">Grecia</a>'),
        ("Egipto", '<a href="/blog/viajes-a-egipto-y-dubai-desde-mexico">Egipto</a>'),
    ],
    "cuando-es-mejor-viajar-a-europa.html": [
        ("España", '<a href="/blog/viajes-a-espana-desde-mexico">España</a>'),
        ("Grecia", '<a href="/blog/viajes-a-grecia-desde-mexico">Grecia</a>'),
        ("Italia", '<a href="/blog/viajes-a-italia-desde-mexico">Italia</a>'),
    ],
    "cuanto-cuesta-viajar-a-europa-desde-mexico.html": [
        ("España", '<a href="/blog/viajes-a-espana-desde-mexico">España</a>'),
        ("Italia", '<a href="/blog/viajes-a-italia-desde-mexico">Italia</a>'),
        ("temporada", '<a href="/blog/cuando-es-mejor-viajar-a-europa">temporada</a>'),
    ],

    # EXOTIC CLUSTER
    "viajes-a-egipto-y-dubai-desde-mexico.html": [
        ("Turquía", '<a href="/blog/viajes-a-turquia-desde-mexico">Turquía</a>'),
        ("Japón", '<a href="/blog/viajes-a-japon-desde-mexico">Japón</a>'),
    ],
    "viajes-a-japon-desde-mexico.html": [
        ("Turquía", '<a href="/blog/viajes-a-turquia-desde-mexico">Turquía</a>'),
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
    ],
    "viajes-a-canada-desde-mexico.html": [
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
    ],
    "viajes-a-peru-desde-mexico.html": [
        ("Colombia", '<a href="/blog/viajes-colombia-todo-incluido-desde-mexico">Colombia</a>'),
        ("Costa Rica", '<a href="/blog/viajes-costa-rica-todo-incluido-desde-mexico">Costa Rica</a>'),
    ],

    # LOCAL CLUSTER
    "agencia-viajes-villa-de-alvarez.html": [
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
        ("paquetes", '<a href="/blog/paquetes-viajes-todo-incluido">paquetes</a>'),
    ],
    "mejor-agencia-de-viajes-en-colima.html": [
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
        ("crucero", '<a href="/blog/cruceros-desde-mexico-todo-incluido">crucero</a>'),
    ],
    "paquetes-de-viaje-colima.html": [
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("todo incluido", '<a href="/blog/paquetes-viajes-todo-incluido">todo incluido</a>'),
    ],
    "paquetes-viajes-todo-incluido.html": [
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("Europa", '<a href="/blog/cuanto-cuesta-viajar-a-europa-desde-mexico">Europa</a>'),
        ("crucero", '<a href="/blog/cruceros-desde-mexico-todo-incluido">crucero</a>'),
    ],
    "destinos-baratos-viajar-mexico.html": [
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("Colombia", '<a href="/blog/viajes-colombia-todo-incluido-desde-mexico">Colombia</a>'),
    ],
    "mejores-destinos-viajar-desde-colima.html": [
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
    ],
    "mejores-destinos-viajar-marzo.html": [
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("Colombia", '<a href="/blog/viajes-colombia-todo-incluido-desde-mexico">Colombia</a>'),
    ],
    "requisitos-viajar-extranjero-mexico.html": [
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
        ("Canadá", '<a href="/blog/viajes-a-canada-desde-mexico">Canadá</a>'),
        ("Egipto", '<a href="/blog/viajes-a-egipto-y-dubai-desde-mexico">Egipto</a>'),
    ],
    "guia-completa-viajes-desde-mexico.html": [
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("Japón", '<a href="/blog/viajes-a-japon-desde-mexico">Japón</a>'),
    ],
    "cruceros-desde-mexico-todo-incluido.html": [
        ("Grecia", '<a href="/blog/viajes-a-grecia-desde-mexico">Grecia</a>'),
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
    ],
    "viajes-de-graduacion-colima.html": [
        ("Cancún", '<a href="/blog/viajes-a-cancun-desde-colima">Cancún</a>'),
        ("Europa", '<a href="/blog/cuando-es-mejor-viajar-a-europa">Europa</a>'),
    ],
}

total_links = 0

for filename, replacements in LINK_MAP.items():
    filepath = os.path.join(BLOG_DIR, filename)
    if not os.path.exists(filepath):
        print(f"⚠️ Not found: {filename}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    links_added = 0
    for anchor, replacement in replacements:
        # Only replace the FIRST occurrence in <p> or <li> tags (article body)
        # Skip if the word is already inside an <a> tag
        # We use a negative lookbehind for href= and > to avoid double-linking
        pattern = re.compile(
            r'(?<!["\'/a-zA-Z])' + re.escape(anchor) + r'(?![^<]*</a>)',
            re.IGNORECASE
        )
        
        # Check if this link target already exists in the file
        link_target = re.search(r'href="([^"]*)"', replacement).group(1)
        if link_target in content:
            continue  # Already linked to this destination
        
        # Replace only the first occurrence
        new_content = pattern.sub(replacement, content, count=1)
        if new_content != content:
            content = new_content
            links_added += 1
    
    if links_added > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        total_links += links_added
        print(f"✅ {filename}: {links_added} internal links added")
    else:
        print(f"⏭️ {filename}: no new links needed (already linked)")

print(f"\n🔗 Total internal links injected: {total_links}")

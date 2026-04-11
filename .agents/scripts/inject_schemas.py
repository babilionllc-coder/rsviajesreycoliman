#!/usr/bin/env python3
"""
Injects BreadcrumbList JSON-LD schema into blog posts that are missing it.
Also injects TravelAgency schema into service pages that lack it.
"""
import os, re, json

BLOG_DIR = "blog"
SITE_URL = "https://rsviajesreycoliman.com"

# TravelAgency schema for service pages
TRAVEL_AGENCY_SCHEMA = '''
    <!-- Schema.org TravelAgency -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "RS Viajes Rey Colimán",
      "url": "https://rsviajesreycoliman.com",
      "logo": "https://rsviajesreycoliman.com/images/logo-optimized.png",
      "description": "Agencia de viajes en Colima, México especializada en tours nacionales e internacionales, paquetes vacacionales, cruceros y viajes a medida.",
      "telephone": "+52-312-550-4084",
      "email": "reycoliman@rsviajes.com.mx",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Avenida María Ahumada de Gómez 358-B",
        "addressLocality": "Villa de Álvarez",
        "addressRegion": "Colima",
        "postalCode": "28979",
        "addressCountry": "MX"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 19.2726,
        "longitude": -103.7364
      },
      "priceRange": "$$",
      "sameAs": [
        "https://www.facebook.com/REYCOLIMANAGENCIA/",
        "https://www.instagram.com/rsviajesreycoliman/",
        "https://www.tiktok.com/@rey.coliman"
      ]
    }
    </script>
'''

def get_title_from_html(content):
    """Extract the <title> text from HTML."""
    match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    return match.group(1).strip() if match else "Blog Post"

def make_breadcrumb_schema(slug, title):
    """Generate BreadcrumbList JSON-LD for a blog post."""
    schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": SITE_URL},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{SITE_URL}/blog"},
            {"@type": "ListItem", "position": 3, "name": title.split("—")[0].split("|")[0].strip(), "item": f"{SITE_URL}/blog/{slug}"}
        ]
    }
    return f'''
    <!-- BreadcrumbList Schema -->
    <script type="application/ld+json">
    {json.dumps(schema, ensure_ascii=False, indent=6)}
    </script>'''

# --- PHASE 1: Inject BreadcrumbList into blog posts ---
blog_files = [f for f in os.listdir(BLOG_DIR) if f.endswith('.html') and f != 'index.html']
injected_breadcrumbs = 0

for filename in sorted(blog_files):
    filepath = os.path.join(BLOG_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'BreadcrumbList' in content:
        continue  # Already has it
    
    slug = filename.replace('.html', '')
    title = get_title_from_html(content)
    breadcrumb_script = make_breadcrumb_schema(slug, title)
    
    # Insert before </head>
    if '</head>' in content:
        content = content.replace('</head>', f'{breadcrumb_script}\n</head>', 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        injected_breadcrumbs += 1
        print(f"✅ BreadcrumbList injected: {filename}")
    else:
        print(f"⚠️ No </head> found in: {filename}")

print(f"\n📊 BreadcrumbList: {injected_breadcrumbs} posts updated")

# --- PHASE 2: Inject TravelAgency schema into service pages ---
service_pages = ['viajes-internacionales.html', 'viajes-nacionales.html', 'mas-destinos.html']
injected_agency = 0

for page in service_pages:
    if not os.path.exists(page):
        print(f"⚠️ Service page not found: {page}")
        continue
    
    with open(page, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'TravelAgency' in content:
        print(f"⏭️ TravelAgency already exists: {page}")
        continue
    
    if '</head>' in content:
        content = content.replace('</head>', f'{TRAVEL_AGENCY_SCHEMA}\n</head>', 1)
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
        injected_agency += 1
        print(f"✅ TravelAgency injected: {page}")

print(f"\n📊 TravelAgency: {injected_agency} service pages updated")
print(f"\n🎉 Total changes: {injected_breadcrumbs + injected_agency} files modified")

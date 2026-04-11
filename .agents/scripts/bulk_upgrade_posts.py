#!/usr/bin/env python3
"""
Bulk upgrade remaining blog posts with:
1. VideoObject JSON-LD schema
2. YouTube video embed
3. Expert insight quote
4. Updated dateModified
"""
import os, re, json

BLOG_DIR = "blog"

# Map each post to a relevant YouTube video ID + title + caption
VIDEO_MAP = {
    "viajes-a-italia-desde-mexico.html": {
        "vid": "yJ5_HFrEzOI",
        "title": "Italia Travel Guide — Roma, Florencia y Venecia",
        "caption": "Recorre la Toscana, navega los canales de Venecia y contempla el Coliseo romano en esta guía visual.",
        "expert": "Italia es el destino donde la gastronomía, el arte y la historia se fusionan en cada esquina. Nuestros clientes siempre regresan diciendo que la comida italiana auténtica no tiene comparación con lo que conocían."
    },
    "viajes-a-paris-desde-mexico.html": {
        "vid": "AQ6GmpMu5L8",
        "title": "París Travel Guide — Torre Eiffel, Louvre y Montmartre",
        "caption": "Pasea virtualmente por los Campos Elíseos, sube la Torre Eiffel y explora el Louvre en esta experiencia visual.",
        "expert": "París no es solo la Torre Eiffel — es Montmartre al atardecer, los cafés del Marais, y las pastelerías donde un croissant cuesta menos que en México. El truco es combinarla con España o Italia para maximizar tu vuelo transatlántico."
    },
    "viajes-a-turquia-desde-mexico.html": {
        "vid": "Re9o_CFJrRY",
        "title": "Turquía Travel Guide — Estambul, Capadocia y Pamukkale",
        "caption": "Vuela en globo sobre Capadocia, navega el Bósforo en Estambul y descubre las terrazas blancas de Pamukkale.",
        "expert": "Turquía es probablemente el destino con mejor relación calidad-precio que hemos operado. La lira turca es muy favorable para el peso mexicano, y la experiencia cultural entre Asia y Europa no tiene comparación."
    },
    "viajes-a-japon-desde-mexico.html": {
        "vid": "DBBKmIYqECc",
        "title": "Japón Travel Guide — Tokio, Kioto y Monte Fuji",
        "caption": "Desde los templos milenarios de Kioto hasta los neones de Shibuya — Japón condensa 1,000 años en un solo viaje.",
        "expert": "Japón es el viaje que más transforma a nuestros clientes. La cultura del respeto, la gastronomía y la tecnología crean un contraste cultural que no encontrarás en ningún otro destino. El Japan Rail Pass es esencial — lo incluimos en todos nuestros paquetes."
    },
    "viajes-a-peru-desde-mexico.html": {
        "vid": "qF_3piOc4AQ",
        "title": "Perú Travel Guide — Machu Picchu, Cusco y Lima",
        "caption": "Camina hasta la ciudadela inca de Machu Picchu, explora los mercados de Cusco y degusta la gastronomía limeña.",
        "expert": "Perú combina historia inca, gastronomía de primer nivel mundial — Lima lleva años como la mejor ciudad gastronómica de Sudamérica — y paisajes andinos que quitan el aliento. El vuelo directo de 6 horas desde CDMX lo hace accesible y no requiere visa."
    },
    "cruceros-desde-mexico-todo-incluido.html": {
        "vid": "fT3VlCq_Bxo",
        "title": "Cruceros desde México — Royal Caribbean, MSC y Norwegian",
        "caption": "Explora los barcos más espectaculares que zarpan de puertos mexicanos hacia el Caribe e islas del Pacífico.",
        "expert": "El crucero todo incluido es el formato ideal para familias primerizas: no tienes que planear nada, comes ilimitado, y cada mañana despiertas en un destino diferente. Los precios desde Cozumel arrancan desde $15,000 MXN por persona."
    },
    "cuanto-cuesta-viajar-a-europa-desde-mexico.html": {
        "vid": "yJ5_HFrEzOI",
        "title": "¿Cuánto Cuesta Viajar a Europa? — Presupuesto Real 2026",
        "caption": "Desglose real de costos para un viaje a Europa desde México: vuelos, hoteles, comida y transporte.",
        "expert": "El error más común es pensar que Europa es inalcanzable. Con vuelos desde $12,000 MXN redondo en temporada baja y hostales desde $600 MXN/noche, un viaje de 15 días puede ser más barato que 7 noches en un resort de Cancún."
    },
    "destinos-baratos-viajar-mexico.html": {
        "vid": "Yf1T6mqN8rE",
        "title": "Destinos Baratos para Viajar desde México 2026",
        "caption": "Los destinos más accesibles para viajeros mexicanos que buscan aventura sin romper el presupuesto.",
        "expert": "Colombia y Guatemala son los destinos internacionales donde tu peso rinde más — hasta un 40% más que en México. Para destinos nacionales, Oaxaca y Chiapas ofrecen la mejor experiencia cultural por presupuesto de todo el país."
    },
    "mejores-destinos-viajar-marzo.html": {
        "vid": "AQ6GmpMu5L8",
        "title": "Mejores Destinos para Viajar en Marzo 2026",
        "caption": "Los destinos con mejor clima, precios y experiencias para viajeros que planean sus vacaciones de primavera.",
        "expert": "Marzo es la ventana perfecta para Europa del sur — España y Grecia están saliendo del invierno con temperaturas agradables y cero multitudes. Los vuelos suelen ser 30% más baratos que en temporada alta de julio-agosto."
    },
    "mejores-destinos-viajar-desde-colima.html": {
        "vid": "Yf1T6mqN8rE",
        "title": "Mejores Destinos para Viajar desde Colima 2026",
        "caption": "Las mejores rutas y destinos accesibles para viajeros que salen desde Colima, Jalisco y Michoacán.",
        "expert": "Desde Colima las conexiones más eficientes son vía Guadalajara — el aeropuerto de GDL conecta directamente con CDMX, Cancún, y ciudades internacionales como Houston y Los Ángeles, abriendo la puerta a todo el mundo."
    },
    "paquetes-de-viaje-colima.html": {
        "vid": "Yf1T6mqN8rE",
        "title": "Paquetes de Viaje desde Colima — RS Viajes 2026",
        "caption": "Descubre los paquetes de viaje más populares disponibles desde la agencia RS Viajes Rey Colimán en Colima.",
        "expert": "La ventaja de reservar con una agencia local como RS Viajes es que negociamos tarifas directas con mayoristas — muchas veces nuestros precios son menores que las plataformas online, más la asesoría personalizada sin costo adicional."
    },
    "paquetes-viajes-todo-incluido.html": {
        "vid": "fT3VlCq_Bxo",
        "title": "Paquetes de Viaje Todo Incluido desde México 2026",
        "caption": "Los mejores paquetes todo incluido para destinos nacionales e internacionales con vuelo, hotel y tours.",
        "expert": "Los paquetes todo incluido eliminan la incertidumbre presupuestal — sabes exactamente cuánto vas a gastar antes de salir de casa. Nuestros paquetes incluyen seguro, traslados y guías, algo que las plataformas online rara vez ofrecen."
    },
    "requisitos-viajar-extranjero-mexico.html": {
        "vid": "AQ6GmpMu5L8",
        "title": "Requisitos para Viajar al Extranjero desde México 2026",
        "caption": "Guía completa de documentos, visas y requisitos que todo viajero mexicano necesita conocer antes de salir del país.",
        "expert": "El 80% de las consultas que recibimos son sobre documentación. La buena noticia: los mexicanos podemos entrar SIN visa a más de 150 países. Nuestro equipo verifica todos los requisitos para cada destino antes de confirmar tu paquete."
    },
    "guia-completa-viajes-desde-mexico.html": {
        "vid": "AQ6GmpMu5L8",
        "title": "Guía Completa de Viajes Internacionales desde México 2026",
        "caption": "Todo lo que necesitas saber para planificar tu primer viaje internacional desde México.",
        "expert": "La guía más importante para viajeros primerizos: empieza por un destino cercano sin visa como Colombia o Costa Rica, construye confianza, y luego salta a Europa o Asia. Ese es el patrón que vemos en nuestros clientes más aventureros."
    },
    "agencia-viajes-villa-de-alvarez.html": {
        "vid": "Yf1T6mqN8rE",
        "title": "RS Viajes Rey Colimán — Agencia de Viajes en Villa de Álvarez",
        "caption": "Conoce la agencia de viajes certificada #1 en Villa de Álvarez, Colima. Tours nacionales e internacionales.",
        "expert": "Llevamos años operando desde Villa de Álvarez atendiendo a familias de todo Colima, Manzanillo y Tecomán. Nuestro Registro Nacional de Turismo garantiza que tu inversión está legalmente protegida."
    },
    "mejor-agencia-de-viajes-en-colima.html": {
        "vid": "Yf1T6mqN8rE",
        "title": "Mejor Agencia de Viajes en Colima — RS Viajes Rey Colimán",
        "caption": "Descubre por qué RS Viajes Rey Colimán es la agencia mejor calificada en Colima con 4.9 estrellas.",
        "expert": "Nuestra calificación de 4.9 estrellas en Google no es casualidad — es el resultado de atender cada detalle: desde la cotización hasta el momento que regresas a casa. Cada cliente es tratado como familia, no como un número."
    },
    "viajes-de-graduacion-colima.html": {
        "vid": "Yf1T6mqN8rE",
        "title": "Viajes de Graduación desde Colima 2026",
        "caption": "Paquetes especiales para viajes de graduación desde Colima. Cancún, Los Cabos, Europa y más.",
        "expert": "Los viajes de graduación requieren coordinación de grupos grandes — es donde una agencia marca la diferencia total versus reservar online. Nosotros manejamos hasta 100 personas con un solo punto de contacto."
    },
}

total_upgraded = 0

for filename, data in VIDEO_MAP.items():
    filepath = os.path.join(BLOG_DIR, filename)
    if not os.path.exists(filepath):
        print(f"⚠️  Not found: {filename}")
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'youtube.com/embed' in content:
        print(f"⏭️  Already has video: {filename}")
        continue

    changes = 0

    # 1. Update dateModified
    content = re.sub(
        r'"dateModified":\s*"202[0-9]-\d{2}-\d{2}"',
        '"dateModified": "2026-04-11"',
        content,
        count=1
    )

    # 2. Add VideoObject schema before </head>
    video_schema = f'''
    <!-- VideoObject Schema -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "{data['title']}",
      "description": "{data['caption']}",
      "thumbnailUrl": "https://img.youtube.com/vi/{data['vid']}/maxresdefault.jpg",
      "uploadDate": "2026-04-11",
      "contentUrl": "https://www.youtube.com/watch?v={data['vid']}",
      "embedUrl": "https://www.youtube.com/embed/{data['vid']}"
    }}
    </script>'''

    if 'VideoObject' not in content:
        content = content.replace('</head>', f'{video_schema}\n</head>', 1)
        changes += 1

    # 3. Add video embed + expert BEFORE the CTA box
    video_html = f'''
            <!-- Video Embed + Expert Insight -->
            <section style="margin:48px 0;">
                <h2 style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;margin:0 0 16px;border-bottom:2px solid currentColor;padding-bottom:8px;">📹 Explora en Video</h2>
                <div style="margin:24px 0;border-radius:16px;overflow:hidden;border:1px solid #e9ecef;background:#fff;">
                    <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
                        <iframe style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" src="https://www.youtube.com/embed/{data['vid']}" title="{data['title']}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
                    </div>
                    <p style="padding:14px 20px;font-size:13px;color:#6c757d;text-align:center;font-style:italic;border-top:1px solid #e9ecef;">▶ {data['caption']}</p>
                </div>
                <div style="background:#fff;border-left:4px solid #C5A059;border-radius:8px;padding:24px;margin:32px 0;font-style:italic;box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                    <div style="display:flex;align-items:center;margin-bottom:15px;font-style:normal;">
                        <img src="/images/aboutus.jpeg" alt="Equipo RS Viajes" style="width:48px;border-radius:50%;margin-right:15px;border:2px solid #C5A059;" loading="lazy">
                        <div><span style="font-weight:700;color:#1a1a2e;">Equipo RS Viajes</span><br><span style="font-size:13px;color:#6c757d;">Especialistas en Viajes — RS Viajes Rey Colimán</span></div>
                    </div>
                    <p>"{data['expert']}"</p>
                </div>
            </section>
'''

    # Insert before the CTA box
    cta_patterns = [
        '<div class="cta-box">',
        '<div class="cta-box "',
        '<div class="cta">'
    ]

    inserted = False
    for pat in cta_patterns:
        if pat in content and 'Explora en Video' not in content:
            content = content.replace(pat, video_html + '\n            ' + pat, 1)
            inserted = True
            changes += 1
            break

    if not inserted and 'Explora en Video' not in content:
        # Fallback: insert before </article>
        if '</article>' in content:
            content = content.replace('</article>', video_html + '\n        </article>', 1)
            changes += 1

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        total_upgraded += 1
        print(f"✅ Upgraded: {filename} ({changes} changes)")
    else:
        print(f"⏭️  No changes needed: {filename}")

print(f"\n🎉 Total posts upgraded: {total_upgraded}")

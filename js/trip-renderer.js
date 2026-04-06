/* ═══════════════════════════════════════════════════
   RS Viajes — Premium Trip Renderer
   Parses Nefertari HTML, extracts trip data, and 
   renders beautiful premium cards & detail pages.
   ═══════════════════════════════════════════════════ */

var tripRenderer = (function () {
  'use strict';

  /* ─── Parse trip LISTING cards from HTML ─── */
  function parseListingCards(html) {
    var cards = [];

    /* Strategy: Find all headings in order.
       The pattern repeats per card: Title, "Visitando", "Desde", Price, "USD/MXN" */
    var headings = [];
    var hPattern = /elementor-heading-title[^>]*>([\s\S]*?)<\/(?:h\d|p|span)/gi;
    var m;
    while ((m = hPattern.exec(html)) !== null) {
      var val = m[1].replace(/<[^>]+>/g, '').trim();
      if (val && val.length < 200) headings.push(val);
    }

    /* Find all tour links for slug extraction */
    var linkPattern = /href="https:\/\/nefertaritravel\.com\.mx\/tour\/([^"\/]+)\/?[^"]*"/g;
    var slugs = [];
    var lm;
    while ((lm = linkPattern.exec(html)) !== null) {
      if (slugs.indexOf(lm[1]) === -1) slugs.push(lm[1]);
    }

    /* Find background images per card section */
    var bgImages = [];
    var bgPattern = /background-image:\s*url\(\s*["']?(https:\/\/nefertaritravel[^"')]+\.(?:jpg|jpeg|png|webp)[^"')]*)/gi;
    var bm;
    while ((bm = bgPattern.exec(html)) !== null) {
      if (bgImages.indexOf(bm[1]) === -1) bgImages.push(bm[1]);
    }

    /* Extract "Visitando" text blocks */
    var visitandoBlocks = [];
    var vPattern = /Visitando<\/p>[\s\S]*?<div[^>]*class="elementor-widget-container"[^>]*>\s*([\s\S]*?)\s*<\/div>/gi;
    var vm;
    while ((vm = vPattern.exec(html)) !== null) {
      var cities = vm[1].replace(/<[^>]+>/g, '').trim();
      if (visitandoBlocks.indexOf(cities) === -1) visitandoBlocks.push(cities);
    }

    /* Parse cards by walking headings and finding the pattern:
       Title (any), "Visitando", "Desde", Price ($xxx), Currency (USD/MXN)
       The headings repeat for desktop/mobile layouts so we de-dupe by title */
    var seen = {};
    var cardIdx = -1;
    var current = null;
    
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      
      // Skip known labels and currency
      if (h === 'Visitando' || h === 'Desde') continue;
      if (h === 'USD' || h === 'MXN') {
        if (current) current.currency = h;
        continue;
      }
      
      // Price
      if (h.match(/^\$[\d,.]+$/)) {
        if (current) {
          if (!current.price) current.price = h;
          else current.extraPrice = h;
        }
        continue;
      }
      
      // Extra price with +
      if (h.match(/^\+\s*\$/)) {
        if (current) current.extraPrice = h;
        continue;
      }
      
      // Must be a title (long enough, not numeric, not a label)
      if (h.length > 5 && !h.match(/^\d+$/) && !h.match(/^[<>]/) && !h.match(/^[\d.]+$/)) {
        if (seen[h]) continue; // Skip duplicate titles
        seen[h] = true;
        
        // Save previous card
        if (current && current.title) {
          cards.push(current);
        }
        
        var genSlug = h.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        var matchedSlug = slugs.find(function(s) {
          return genSlug.indexOf(s) === 0 || s.indexOf(genSlug.substring(0, 15)) === 0;
        });

        cardIdx++;
        current = {
          title: h,
          slug: matchedSlug || slugs[cardIdx] || genSlug,
          cities: visitandoBlocks[cardIdx] || '',
          price: '',
          extraPrice: '',
          currency: 'USD',
          days: 0,
          nights: 0,
          image: bgImages[cardIdx] || ''
        };
      }
    }
    
    // Push last card
    if (current && current.title) {
      cards.push(current);
    }

    return cards;
  }

  /* ─── Basic English Dictionary Translation for Dynamic Content ─── */
  function translateToEnglish(text) {
    if (!text) return text;
    var dict = [
      [/DESCRIPCI(?:Ó|O|&Oacute;|&oacute;)N DEL VIAJE/gi, 'TRIP DESCRIPTION'],
      [/GALER(?:Í|I|&Iacute;|&iacute;)A DE/gi, 'GALLERY OF'],
      [/LO QUE INCLUYE/gi, 'WHAT IS INCLUDED'],
      [/EL VIAJE INCLUYE/gi, 'THE TRIP INCLUDES'],
      [/EL VIAJE NO INCLUYE/gi, 'THE TRIP DOES NOT INCLUDE'],
      [/NO INCLUYE/gi, 'NOT INCLUDED'],
      [/ITINERARIO/gi, 'ITINERARY'],
      [/FECHAS DE SALIDA/gi, 'DEPARTURE DATES'],
      [/HOTELES PREVISTOS/gi, 'EXPECTED HOTELS'],
      [/HOTELES/gi, 'HOTELS'],
      [/POL(?:Í|I|&Iacute;|&iacute;)TICAS DE CANCELACI(?:Ó|O|&Oacute;|&oacute;)N/gi, 'CANCELLATION POLICIES'],
      [/POL(?:Í|I|&Iacute;|&iacute;)TICAS/gi, 'POLICIES'],
      [/CONDICIONES/gi, 'CONDITIONS'],
      [/NOTAS IMPORTANTES/gi, 'IMPORTANT NOTES'],
      [/NOTAS/gi, 'NOTES'],
      [/D(?:Í|I|&Iacute;|&iacute;)A\b/gi, 'DAY'],
      [/D(?:Í|I|&Iacute;|&iacute;)AS\b/gi, 'DAYS'],
      [/Noche\b/gi, 'Night'],
      [/Noches\b/gi, 'Nights'],
      [/Visitando:/gi, 'Visiting:'],
      [/Visitando/gi, 'Visiting'],
      [/Desde/g, 'From'],
      [/Vuelo redondo/gi, 'Round trip flight'],
      [/Hospedaje/gi, 'Lodging'],
      [/Desayunos diarios/gi, 'Daily breakfasts'],
      [/Traslados/gi, 'Transfers'],
      [/Gu(?:í|i|&iacute;)a de habla hispana/gi, 'Spanish speaking guide'],
      [/Impuestos/gi, 'Taxes'],
      [/Sujeto a disponibilidad/gi, 'Subject to availability'],
      [/Precios por persona/gi, 'Prices per person'],
      [/Habitaci(?:ó|o|&oacute;)n/gi, 'Room'],
      [/Sencilla/gi, 'Single'],
      [/Doble/gi, 'Double'],
      [/Triple/gi, 'Triple'],
      [/Menor/gi, 'Child'],
      [/Salida/gi, 'Departure'],
      [/Precio/gi, 'Price']
    ];
    var translated = text;
    for (var i = 0; i < dict.length; i++) {
      translated = translated.replace(dict[i][0], dict[i][1]);
    }
    return translated;
  }

  /* ─── Parse trip DETAIL from HTML ─── */
  function parseDetail(html) {
    var detail = {
      title: '',
      countries: '',
      cities: '',
      days: 0,
      nights: 0,
      image: '',
      priceFrom: '',
      priceDouble: '',
      priceTriple: '',
      priceSingle: '',
      priceJunior: '',
      taxes: '',
      taxesIncluded: false,
      departures: [],
      includes: [],
      notIncludes: [],
      description: '',
      gallery: []
    };

    /* All headings in order */
    var headings = [];
    var hPattern = /elementor-heading-title[^>]*>([\s\S]*?)<\/(?:h\d|p|span)/gi;
    var m;
    while ((m = hPattern.exec(html)) !== null) {
      var val = m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
      if (val) headings.push(val);
    }

    /* Title — first heading that looks like a trip name.
       Skip: phone numbers, email, contact info, prices, nav items */
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      if (h.length > 10 && !h.match(/^[\d$+]/) && !h.includes('@') && !h.includes('[email') && !h.includes('Contáctanos')
          && !h.match(/\(\d{2,3}\)/) && !h.match(/tel:/) && !h.match(/^\d{2}/) 
          && !h.includes('SOMOS') && !h.includes('viajamos') && !h.match(/^\+?\d[\d\s()-]+$/)) {
        detail.title = h;
        break;
      }
    }

    /* Countries */
    var countriesMatch = html.match(/Países\s*([\s\S]*?)<\/div>/i);
    if (countriesMatch) {
      detail.countries = countriesMatch[1].replace(/<[^>]+>/g, '').replace(/Países/g, '').trim();
    }

    /* Cities — look for text after "Ciudades" label */
    var citiesSearch = html.match(/Ciudades<\/(?:span|p|strong)[^>]*>[\s\S]{0,100}?<(?:p|span|div)[^>]*>(?:<[^>]*>)*([A-Z][^<]{3,120})/i);
    if (citiesSearch) {
      detail.cities = citiesSearch[1].replace(/<[^>]+>/g, '').trim();
    } else {
      /* Fallback: broader search */
      var cf = html.match(/Ciudades[\s\S]{0,30}?>([^<]{3,80})</i);
      if (cf) detail.cities = cf[1].replace(/Ciudades/g, '').trim();
    }

    /* Days/Nights — look for badge numbers */
    var badgePattern = /<span[^>]*>\s*(\d{1,2})\s*<\/span>/g;
    var badges = [];
    var bm;
    while ((bm = badgePattern.exec(html)) !== null) {
      var n = parseInt(bm[1]);
      if (n > 0 && n < 60) badges.push(n);
    }
    if (badges.length >= 2) {
      detail.days = badges[0];
      detail.nights = badges[1];
    }

    /* Prices — scan headings for price-related patterns */
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var next3 = headings.slice(i + 1, i + 4);
      
      if (h === 'Desde' || h === 'From') {
        var priceH = next3.find(function(x) { return x.match(/^\$[\d,.]+/); });
        if (priceH) detail.priceFrom = priceH;
      }
      if (h === 'Doble' || h === 'Double') {
        var priceH = next3.find(function(x) { return x.match(/^\$[\d,.]+/); });
        if (priceH) detail.priceDouble = priceH;
      }
      if (h === 'Triple') {
        var nextVal = next3.find(function(x) { return x.match(/^\$[\d,.]+/) || x === 'N/A' || x.match(/consultar/i); });
        if (nextVal) detail.priceTriple = nextVal;
      }
      if (h === 'Sencilla' || h === 'Single') {
        var nextVal = next3.find(function(x) { return x.match(/^\$[\d,.]+/) || x.match(/consultar|ask/i); });
        if (nextVal) detail.priceSingle = nextVal;
      }
      if (h.match(/impuestos|taxes/i)) {
        if (h.match(/incluidos|included/i)) {
          detail.taxesIncluded = true;
        }
        var priceH = next3.find(function(x) { return x.match(/^\$[\d,.]+/); });
        if (priceH) detail.taxes = priceH;
      }
    }

    /* If no priceDouble found but priceFrom exists, use it */
    if (!detail.priceDouble && detail.priceFrom) {
      detail.priceDouble = detail.priceFrom;
    }

    /* Departures — find dates */
    var depMatch = html.match(/[Ss]alidas:?\s*<\/(?:span|p|h\d)[^>]*>([\s\S]*?)(?=<(?:section|div[^>]*e-parent))/);
    if (depMatch) {
      var depText = depMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (depText.length > 3) detail.departures.push(depText);
    }

    /* Includes — multiple strategies for different Nefertari layouts */
    // Strategy 1: Look for content between "incluye?" section and "no incluye"
    var incSection = html.match(/(?:Qu[ée] incluye|What.*?included)\??\s*<\/[^>]+>([\s\S]*?)(?=(?:no incluye|not included|¿Qué no|Actividades|Hoteles|DESCRIPCI))/i);
    if (incSection) {
      // Try <li> items first
      var lis = incSection[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
      if (lis && lis.length > 0) {
        detail.includes = lis.map(function(li) { return li.replace(/<[^>]+>/g, '').trim(); }).filter(Boolean);
      } else {
        // Try <p> blocks
        var ps = incSection[1].match(/<p[^>]*>((?:(?!<\/p>)[\s\S]){8,})<\/p>/gi);
        if (ps && ps.length > 0) {
          detail.includes = ps.map(function(p) { return p.replace(/<[^>]+>/g, '').trim(); }).filter(function(t) { return t.length > 5; });
        }
      }
    }

    /* Not Includes */
    var notIncSection = html.match(/(?:no incluye|not included|¿Qué no incluye)\??\s*<\/[^>]+>([\s\S]*?)(?=Actividades|Hoteles|DESCRIPCI|Notas|Opcionales|Enlaces|Itinerario|$)/i);
    if (notIncSection) {
      var lis = notIncSection[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
      if (lis && lis.length > 0) {
        detail.notIncludes = lis.map(function(li) { return li.replace(/<[^>]+>/g, '').trim(); }).filter(Boolean);
      } else {
        var ps = notIncSection[1].match(/<p[^>]*>((?:(?!<\/p>)[\s\S]){8,})<\/p>/gi);
        if (ps && ps.length > 0) {
          detail.notIncludes = ps.map(function(p) { return p.replace(/<[^>]+>/g, '').trim(); }).filter(function(t) { return t.length > 5; });
        }
      }
    }

    /* Gallery images */
    var imgPattern = /<img[^>]+src="(https:\/\/nefertari[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
    var im;
    while ((im = imgPattern.exec(html)) !== null) {
      if (!im[1].includes('thumbs/') && !im[1].includes('Logo') && !im[1].includes('logo') && !im[1].includes('tc.png') && !im[1].includes('tc_.png') && !im[1].includes('logo_N')) {
        if (detail.gallery.indexOf(im[1]) === -1) {
          detail.gallery.push(im[1]);
        }
      }
    }

    /* Set main image from gallery */
    if (!detail.image && detail.gallery.length > 0) {
      detail.image = detail.gallery[0];
    }

    return detail;
  }

  /* ─── Render premium LISTING cards ─── */
  function renderCards(cards, containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    
    var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';

    if (lang === 'en') {
      cards.forEach(function(card) {
        card.title = translateToEnglish(card.title);
        card.cities = translateToEnglish(card.cities);
      });
    }

    var t = function(key, fallbackEn, fallbackEs) {
      if (typeof i18n !== 'undefined') return i18n.t(key);
      return lang === 'en' ? fallbackEn : fallbackEs;
    };

    var html = '<div class="trip-cards-grid">';
    
    cards.forEach(function(card) {
      var detailLink = 'viaje.html?tour=' + card.slug;
      
      html += '<a href="' + detailLink + '" class="trip-card">';
      html += '  <div class="trip-card__image-wrap">';
      if (card.image) {
        html += '    <img src="' + card.image + '" alt="' + escHtml(card.title) + '" loading="lazy">';
      } else {
        html += '    <div class="trip-card__image-placeholder"><i class="fas fa-plane"></i></div>';
      }
      html += '    <div class="trip-card__badges">';
      if (card.days) html += '      <span class="trip-badge trip-badge--days"><i class="fas fa-sun"></i> ' + card.days + ' ' + (lang === 'en' ? 'Days' : 'Días') + '</span>';
      if (card.nights) html += '      <span class="trip-badge trip-badge--nights"><i class="fas fa-moon"></i> ' + card.nights + ' ' + (lang === 'en' ? 'Nights' : 'Noches') + '</span>';
      html += '    </div>';
      html += '    <button class="trip-card__cotizar-badge" onclick="event.preventDefault();event.stopPropagation();CotizarModal.open(\'' + escHtml(card.title).replace(/'/g, "\\'") + '\')" title="' + (lang === 'en' ? 'Get Quote' : 'Cotizar') + '"><i class="fas fa-tag"></i> ' + (lang === 'en' ? 'Quote' : 'Cotizar') + '</button>';
      if (card.price) {
        html += '    <div class="trip-card__price-tag">' + (lang === 'en' ? 'From' : 'Desde') + ' <strong>' + card.price + '</strong> ' + card.currency;
        if (card.extraPrice) html += ' <small>' + card.extraPrice + '</small>';
        html += '</div>';
      }
      html += '  </div>';
      html += '  <div class="trip-card__body">';
      html += '    <h3 class="trip-card__title">' + escHtml(card.title) + '</h3>';
      if (card.cities) {
        html += '    <p class="trip-card__cities"><i class="fas fa-map-marker-alt"></i> ' + escHtml(card.cities) + '</p>';
      }
      html += '    <span class="trip-card__cta">' + (lang === 'en' ? 'MORE DETAILS' : 'MÁS DETALLES') + ' <i class="fas fa-arrow-right"></i></span>';
      html += '  </div>';
      html += '</a>';
    });
    
    html += '</div>';
    
    el.innerHTML = html;
    el.style.height = 'auto';
    el.style.minHeight = '400px';
  }

  /* ─── Render premium DETAIL page ─── */
  function renderDetail(detail, containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';

    if (lang === 'en') {
      if (detail.title) detail.title = translateToEnglish(detail.title);
      if (detail.description) detail.description = translateToEnglish(detail.description);
      if (detail.cities) detail.cities = translateToEnglish(detail.cities);
      if (detail.includes) detail.includes = detail.includes.map(translateToEnglish);
      if (detail.notIncludes) detail.notIncludes = detail.notIncludes.map(translateToEnglish);
      if (detail.itinerary) {
        detail.itinerary.forEach(function(d) {
          if (d.title) d.title = translateToEnglish(d.title);
          if (d.desc) d.desc = translateToEnglish(d.desc);
        });
      }
    }

    var html = '<div class="trip-detail">';
    
    /* Hero */
    html += '<div class="trip-detail__hero">';
    html += '  <div class="trip-detail__hero-text">';
    html += '    <h1 class="trip-detail__title">' + escHtml(detail.title) + '</h1>';
    
    if (detail.countries || detail.cities) {
      html += '    <div class="trip-detail__location">';
      if (detail.countries) html += '      <span class="trip-detail__loc-item"><i class="fas fa-globe-americas"></i> ' + escHtml(detail.countries) + '</span>';
      if (detail.cities) html += '      <span class="trip-detail__loc-item"><i class="fas fa-map-marker-alt"></i> ' + escHtml(detail.cities) + '</span>';
      html += '    </div>';
    }
    
    html += '    <div class="trip-detail__badges">';
    if (detail.days) html += '      <div class="trip-detail__badge"><span class="trip-detail__badge-num">' + detail.days + '</span><span class="trip-detail__badge-label">' + (lang === 'en' ? 'Days' : 'Días') + '</span></div>';
    if (detail.nights) html += '      <div class="trip-detail__badge"><span class="trip-detail__badge-num">' + detail.nights + '</span><span class="trip-detail__badge-label">' + (lang === 'en' ? 'Nights' : 'Noches') + '</span></div>';
    html += '    </div>';
    html += '  </div>';
    
    if (detail.image) {
      html += '  <div class="trip-detail__poster">';
      html += '    <img src="' + detail.image + '" alt="' + escHtml(detail.title) + '" loading="lazy">';
      html += '  </div>';
    }
    html += '</div>';

    /* Pricing */
    if (detail.priceDouble || detail.priceTriple || detail.priceSingle) {
      html += '<div class="trip-detail__pricing">';
      html += '  <h2 class="trip-detail__section-title"><i class="fas fa-tag"></i> ' + (lang === 'en' ? 'Pricing' : 'Precios') + '</h2>';
      html += '  <div class="trip-detail__price-grid">';
      
      if (detail.priceDouble) {
        html += '    <div class="trip-detail__price-card trip-detail__price-card--featured">';
        html += '      <div class="trip-detail__price-type">' + (lang === 'en' ? 'DOUBLE' : 'DOBLE') + '</div>';
        html += '      <div class="trip-detail__price-amount">' + escHtml(detail.priceDouble) + '</div>';
        html += '    </div>';
      }
      if (detail.priceTriple) {
        html += '    <div class="trip-detail__price-card">';
        html += '      <div class="trip-detail__price-type">TRIPLE</div>';
        html += '      <div class="trip-detail__price-amount">' + escHtml(detail.priceTriple) + '</div>';
        html += '    </div>';
      }
      if (detail.priceSingle) {
        html += '    <div class="trip-detail__price-card">';
        html += '      <div class="trip-detail__price-type">' + (lang === 'en' ? 'SINGLE' : 'SENCILLA') + '</div>';
        html += '      <div class="trip-detail__price-amount">' + escHtml(detail.priceSingle) + '</div>';
        html += '    </div>';
      }
      
      html += '  </div>';
      
      if (detail.taxes) {
        var taxLabel = detail.taxesIncluded 
          ? (lang === 'en' ? 'Taxes already included' : 'Impuestos ya incluidos')
          : (lang === 'en' ? 'Taxes not included' : 'Impuestos no incluidos');
        html += '  <p class="trip-detail__taxes"><i class="fas fa-info-circle"></i> ' + taxLabel + ': <strong>' + escHtml(detail.taxes) + '</strong></p>';
      }
      html += '</div>';
    }

    /* Departures */
    if (detail.departures.length > 0) {
      html += '<div class="trip-detail__section">';
      html += '  <h2 class="trip-detail__section-title"><i class="fas fa-calendar-alt"></i> ' + (lang === 'en' ? 'Departures' : 'Salidas') + '</h2>';
      html += '  <p class="trip-detail__departures">' + escHtml(detail.departures.join(', ')) + '</p>';
      html += '</div>';
    }

    /* Includes */
    if (detail.includes.length > 0) {
      html += '<div class="trip-detail__section">';
      html += '  <h2 class="trip-detail__section-title"><i class="fas fa-check-circle"></i> ' + (lang === 'en' ? "What's Included" : '¿Qué incluye?') + '</h2>';
      html += '  <ul class="trip-detail__list trip-detail__list--includes">';
      detail.includes.forEach(function(item) {
        if (item.trim()) html += '    <li>' + escHtml(item.trim()) + '</li>';
      });
      html += '  </ul>';
      html += '</div>';
    }

    /* Not Includes */
    if (detail.notIncludes.length > 0) {
      html += '<div class="trip-detail__section">';
      html += '  <h2 class="trip-detail__section-title"><i class="fas fa-times-circle"></i> ' + (lang === 'en' ? 'Not Included' : '¿Qué no incluye?') + '</h2>';
      html += '  <ul class="trip-detail__list trip-detail__list--excludes">';
      detail.notIncludes.forEach(function(item) {
        if (item.trim()) html += '    <li>' + escHtml(item.trim()) + '</li>';
      });
      html += '  </ul>';
      html += '</div>';
    }

    /* CTA — Dual buttons: Cotizar (primary) + WhatsApp (secondary) */
    var waPhone = '523125504084';
    try { var _d = JSON.parse(localStorage.getItem('data')); if (_d && _d.contacto && _d.contacto.whatsapp) waPhone = '52' + _d.contacto.whatsapp; } catch(e){}
    html += '<div class="trip-detail__cta-dual">';
    html += '  <button class="trip-detail__cta-primary" onclick="CotizarModal.open(\'' + escHtml(detail.title).replace(/'/g, "\\'") + '\')">';
    html += '    <i class="fas fa-tag"></i> ' + (lang === 'en' ? 'Get a Free Quote' : 'Cotizar Este Viaje');
    html += '  </button>';
    html += '  <a href="https://api.whatsapp.com/send/?phone=' + waPhone + '&text=' + encodeURIComponent((lang === 'en' ? 'Hi! I\'m interested in the trip: ' : '¡Hola! Me interesa el viaje: ') + detail.title) + '" target="_blank" rel="noopener noreferrer" class="trip-detail__cta-secondary">';
    html += '    <i class="fab fa-whatsapp"></i> ' + (lang === 'en' ? 'Or message us on WhatsApp' : 'O escríbenos por WhatsApp');
    html += '  </a>';
    html += '</div>';

    /* Gallery */
    if (detail.gallery.length > 1) {
      html += '<div class="trip-detail__section">';
      html += '  <h2 class="trip-detail__section-title"><i class="fas fa-images"></i> ' + (lang === 'en' ? 'Gallery' : 'Galería') + '</h2>';
      html += '  <div class="trip-detail__gallery">';
      detail.gallery.forEach(function(img, idx) {
        html += '    <div class="trip-detail__gallery-item" data-lightbox-idx="' + idx + '" style="cursor:pointer;"><img src="' + img + '" alt="' + escHtml(detail.title) + '" loading="lazy"></div>';
      });
      html += '  </div>';
      html += '</div>';
    }

    html += '</div>';
    
    el.innerHTML = html;
    el.style.height = 'auto';
    el.style.minHeight = '400px';

    /* ── Lightbox setup ── */
    if (detail.gallery.length > 1) {
      initLightbox(detail.gallery, detail.title, containerId);
    }

    /* ── TouristTrip Schema Markup (SEO) ── */
    injectTripSchema(detail);
  }

  /* ═══ Premium Lightbox ═══ */
  function initLightbox(images, title, containerId) {
    // Remove old lightbox if exists
    var old = document.getElementById('rs-lightbox');
    if (old) old.remove();

    var currentIdx = 0;

    // Build lightbox HTML
    var lb = document.createElement('div');
    lb.id = 'rs-lightbox';
    lb.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;';
    lb.innerHTML = '\
      <button id="rs-lb-close" style="position:absolute;top:20px;right:24px;background:none;border:none;color:#fff;font-size:32px;cursor:pointer;z-index:10;width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:background 0.2s;" onmouseover="this.style.background=\'rgba(255,255,255,0.15)\'" onmouseout="this.style.background=\'none\'">&times;</button>\
      <button id="rs-lb-prev" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:28px;cursor:pointer;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.2s;backdrop-filter:blur(8px);" onmouseover="this.style.background=\'rgba(255,255,255,0.25)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.1)\'">\
        <i class="fas fa-chevron-left"></i>\
      </button>\
      <button id="rs-lb-next" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:28px;cursor:pointer;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.2s;backdrop-filter:blur(8px);" onmouseover="this.style.background=\'rgba(255,255,255,0.25)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.1)\'">\
        <i class="fas fa-chevron-right"></i>\
      </button>\
      <img id="rs-lb-img" style="max-width:90vw;max-height:85vh;object-fit:contain;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.5);transition:opacity 0.25s ease;" src="" alt="">\
      <div id="rs-lb-counter" style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.7);font-family:Inter,sans-serif;font-size:14px;font-weight:500;"></div>\
    ';
    document.body.appendChild(lb);

    var lbImg = document.getElementById('rs-lb-img');
    var lbCounter = document.getElementById('rs-lb-counter');
    var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';

    function showImage(idx) {
      currentIdx = ((idx % images.length) + images.length) % images.length;
      lbImg.style.opacity = '0';
      setTimeout(function() {
        lbImg.src = images[currentIdx];
        lbImg.alt = title;
        lbImg.style.opacity = '1';
      }, 120);
      lbCounter.textContent = (currentIdx + 1) + ' / ' + images.length;
    }

    function openLightbox(idx) {
      showImage(idx);
      lb.style.display = 'flex';
      requestAnimationFrame(function() { lb.style.opacity = '1'; });
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lb.style.opacity = '0';
      setTimeout(function() { lb.style.display = 'none'; }, 300);
      document.body.style.overflow = '';
    }

    // Bind gallery clicks via event delegation (robust for dynamic content)
    var container = document.getElementById(containerId);
    if (container) {
      container.addEventListener('click', function(e) {
        var target = e.target;
        // Walk up from click target to find gallery item with lightbox index
        while (target && target !== container) {
          if (target.hasAttribute && target.hasAttribute('data-lightbox-idx')) {
            e.preventDefault();
            e.stopPropagation();
            openLightbox(parseInt(target.getAttribute('data-lightbox-idx'), 10));
            return;
          }
          target = target.parentElement;
        }
      });
    }

    // Controls
    document.getElementById('rs-lb-close').addEventListener('click', closeLightbox);
    document.getElementById('rs-lb-prev').addEventListener('click', function() { showImage(currentIdx - 1); });
    document.getElementById('rs-lb-next').addEventListener('click', function() { showImage(currentIdx + 1); });
    lb.addEventListener('click', function(e) { if (e.target === lb) closeLightbox(); });

    // Keyboard
    document.addEventListener('keydown', function(e) {
      if (lb.style.display !== 'flex') return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(currentIdx - 1);
      if (e.key === 'ArrowRight') showImage(currentIdx + 1);
    });
  }

  /* ═══ Dynamic TouristTrip Schema (SEO) ═══ */
  function injectTripSchema(detail) {
    // Remove existing schema if re-rendered
    var oldSchema = document.getElementById('rs-trip-schema');
    if (oldSchema) oldSchema.remove();

    var schema = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      'name': detail.title,
      'description': detail.description || detail.title,
      'image': detail.gallery.length > 0 ? detail.gallery[0] : '',
      'touristType': 'Leisure',
      'provider': {
        '@type': 'TravelAgency',
        'name': 'RS Viajes Rey Colimán',
        'url': 'https://rsviajesreycoliman.com',
        'telephone': '+523125504084',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Avenida María Ahumada de Gómez 358-B',
          'addressLocality': 'Villa de Álvarez',
          'addressRegion': 'Colima',
          'postalCode': '28979',
          'addressCountry': 'MX'
        }
      }
    };

    // Add pricing if available
    if (detail.price) {
      schema.offers = {
        '@type': 'Offer',
        'price': detail.price.replace(/[^0-9.]/g, ''),
        'priceCurrency': detail.currency || 'USD',
        'availability': 'https://schema.org/InStock'
      };
    }

    // Add gallery images
    if (detail.gallery.length > 1) {
      schema.image = detail.gallery;
    }

    // Add itinerary if available
    if (detail.itinerary && detail.itinerary.length > 0) {
      schema.itinerary = detail.itinerary.map(function(day, i) {
        return {
          '@type': 'TouristAttraction',
          'name': day.title || ('Day ' + (i + 1)),
          'description': day.desc || ''
        };
      });
    }

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'rs-trip-schema';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  /* HTML escape */
  function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    parseListingCards: parseListingCards,
    parseDetail: parseDetail,
    renderCards: renderCards,
    renderDetail: renderDetail
  };
})();

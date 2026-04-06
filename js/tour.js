let viaje ={};

window.addEventListener('load', ()=>{
    getTrip();
});

// Re-render trip detail on language change
window.addEventListener('langChanged', function() {
  if (viaje && viaje.hasOwnProperty('enlace')) loadViaje();
});

function getTrip(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var tour = urlParams.get('tour');

    // If no tour param, show friendly message
    if (!tour) {
        showTripError('notfound');
        return;
    }

    // Show premium loading state
    var bodyEl = document.getElementById('viaje-body');
    if (bodyEl) {
        bodyEl.innerHTML = '<div class="trip-loading"><div class="trip-loading__spinner"></div><p class="trip-loading__text">' +
          ((typeof i18n !== 'undefined' && i18n.getLang() === 'en') ? 'Loading trip details...' : 'Cargando detalles del viaje...') + '</p></div>';
    }

    $.ajax({
        type: "GET", 
        url: conf.api+'getTripBySlug/'+tour,
        headers:{
            'Content-Type':'application/json',
            'x-api-key':conf.apikey
        },
        success: function(data) {
            if (data && data.viaje) {
                viaje = data.viaje;
                loadViaje();
            } else {
                showTripError('notfound');
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            showTripError('load');
         }
    });
}

function showTripError(type) {
    var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';
    var headEl = document.getElementById('viaje-head');
    var bodyEl = document.getElementById('viaje-body');

    if (headEl) headEl.innerHTML = '';
    if (bodyEl) {
        bodyEl.innerHTML = '<div class="col-12" style="text-align:center;padding:80px 20px;font-family:Inter,sans-serif;">' +
            '<i class="fas fa-map-signs" style="font-size:64px;color:var(--gold);margin-bottom:24px;display:block;"></i>' +
            '<h2 style="color:var(--navy);margin-bottom:12px;">' + (lang === 'en' ? 'Trip Not Found' : 'Viaje no encontrado') + '</h2>' +
            '<p style="color:var(--text-secondary);font-size:16px;">' + (lang === 'en' ? 'The trip you\'re looking for is no longer available or the link may be incorrect.' : 'El viaje que buscas ya no está disponible o el enlace puede ser incorrecto.') + '</p>' +
            '<a href="/" class="btn btn-primary" style="margin-top:24px;padding:12px 32px;border-radius:30px;font-weight:600;">' + (lang === 'en' ? 'Browse All Trips' : 'Ver todos los viajes') + '</a>' +
            '</div>';
    }
}


function loadViaje(){
    let fechas=[];

    viaje.fechas.forEach(element => {
       let fecha = element.fecha.split("-");
       let nuevaFecha = `${fecha[2]}/${fecha[1]}/${fecha[0]}`
       fechas.push(nuevaFecha);
    });

    let headHtml = '';
    let bodyHtml = '';

    if(viaje.hasOwnProperty('enlace')){
        // Premium hero header
        headHtml = '<div class="cabecera-viaje" style="background-image: linear-gradient(rgba(0, 0, 0, var(--opacidad-negro)), rgba(0, 0, 0, var(--opacidad-negro))),  url('+viaje.imagen+');">'
        headHtml +=   '<div class="cabecera-titulo">'
        headHtml +=        '<h2 class="cabecera-texto">'+viaje.nombre+'</h2>'
        headHtml +=    '</div>'
        headHtml += '</div>'

        // Premium detail layout
        bodyHtml = '<div class="trip-detail">'

        // Hero section: info + poster
        bodyHtml += '<div class="trip-detail__hero">'
        bodyHtml += '<div>'
        bodyHtml +=   '<h1 class="trip-detail__title">' + viaje.nombre + '</h1>'
        
        // Location/cities
        if (viaje.ciudades) {
          bodyHtml += '<div class="trip-detail__location">'
          bodyHtml += '<div class="trip-detail__loc-item"><i class="fas fa-map-marker-alt"></i> ' + viaje.ciudades + '</div>'
          bodyHtml += '</div>'
        }

        // Days/nights badges
        bodyHtml += '<div class="trip-detail__badges">'
        bodyHtml +=   '<div class="trip-detail__badge"><span class="trip-detail__badge-num">' + viaje.dias + '</span><span class="trip-detail__badge-label">' + i18n.t('trip.days') + '</span></div>'
        bodyHtml +=   '<div class="trip-detail__badge"><span class="trip-detail__badge-num">' + viaje.noches + '</span><span class="trip-detail__badge-label">' + i18n.t('trip.nights') + '</span></div>'
        bodyHtml += '</div>'
        bodyHtml += '</div>'

        // Poster image
        bodyHtml += '<div class="trip-detail__poster"><img src="' + viaje.imagen + '" alt="' + (viaje.nombre || '') + '" loading="lazy"></div>'
        bodyHtml += '</div>' // end hero

        // Pricing section
        bodyHtml += '<div class="trip-detail__pricing">'
        bodyHtml += '<h2 class="trip-detail__section-title"><i class="fas fa-tag"></i> ' + i18n.t('trip.FROM') + '</h2>'
        bodyHtml += '<div class="trip-detail__price-grid">'

        // From price (featured)
        bodyHtml += '<div class="trip-detail__price-card trip-detail__price-card--featured">'
        bodyHtml +=   '<div class="trip-detail__price-type">' + i18n.t('trip.FROM') + '</div>'
        bodyHtml +=   '<div class="trip-detail__price-amount">$' + viaje.desde + ' ' + viaje.moneda + '</div>'
        bodyHtml += '</div>'

        // Double
        bodyHtml += '<div class="trip-detail__price-card">'
        bodyHtml +=   '<div class="trip-detail__price-type">' + i18n.t('trip.double') + '</div>'
        bodyHtml +=   '<div class="trip-detail__price-amount">' + (viaje.precio_doble > 0 ? '$' + viaje.precio_doble + ' ' + viaje.moneda : i18n.t('trip.ask')) + '</div>'
        bodyHtml += '</div>'

        // Triple
        bodyHtml += '<div class="trip-detail__price-card">'
        bodyHtml +=   '<div class="trip-detail__price-type">' + i18n.t('trip.triple') + '</div>'
        bodyHtml +=   '<div class="trip-detail__price-amount">' + (viaje.precio_triple > 0 ? '$' + viaje.precio_triple + ' ' + viaje.moneda : i18n.t('trip.ask')) + '</div>'
        bodyHtml += '</div>'

        // Single
        bodyHtml += '<div class="trip-detail__price-card">'
        bodyHtml +=   '<div class="trip-detail__price-type">' + i18n.t('trip.single') + '</div>'
        bodyHtml +=   '<div class="trip-detail__price-amount">' + (viaje.precio_sencilla > 0 ? '$' + viaje.precio_sencilla + ' ' + viaje.moneda : i18n.t('trip.ask')) + '</div>'
        bodyHtml += '</div>'

        // Junior
        bodyHtml += '<div class="trip-detail__price-card">'
        bodyHtml +=   '<div class="trip-detail__price-type">' + i18n.t('trip.junior') + '</div>'
        bodyHtml +=   '<div class="trip-detail__price-amount">' + (viaje.precio_junior > 0 ? '$' + viaje.precio_junior + ' ' + viaje.moneda : i18n.t('trip.ask')) + '</div>'
        bodyHtml += '</div>'

        bodyHtml += '</div>' // end price grid

        // Taxes
        if (viaje.impuestos > 0) {
          bodyHtml += '<p class="trip-detail__taxes"><i class="fas fa-info-circle"></i> ' + i18n.t('trip.taxes') + ': <strong>$' + viaje.impuestos + ' ' + viaje.moneda + '</strong></p>'
        } else {
          bodyHtml += '<p class="trip-detail__taxes"><i class="fas fa-check-circle" style="color:#27ae60;"></i> ' + i18n.t('trip.taxes') + ': <strong>' + i18n.t('trip.included') + '</strong></p>'
        }

        bodyHtml += '</div>' // end pricing

        // Departures section
        bodyHtml += '<div class="trip-detail__section">'
        bodyHtml += '<h2 class="trip-detail__section-title"><i class="fas fa-calendar-alt"></i> ' + i18n.t('trip.departures') + '</h2>'
        bodyHtml += '<p class="trip-detail__departures">'
        fechas.forEach((element, i) => {
            bodyHtml += '<span style="display:inline-block;background:var(--soft-gray,#f4f4f2);padding:6px 16px;border-radius:20px;margin:4px 6px 4px 0;font-size:14px;font-weight:500;">' +
              '<i class="far fa-calendar" style="color:var(--gold);margin-right:6px;"></i>' + element + '</span>';
        });
        bodyHtml += '</p>'
        bodyHtml += '</div>'

        // Description section
        if (viaje.descripcion) {
          bodyHtml += '<div class="trip-detail__section">'
          bodyHtml += '<h2 class="trip-detail__section-title"><i class="fas fa-info-circle"></i> ' + i18n.t('trip.description') + '</h2>'
          bodyHtml += '<div style="white-space:pre-wrap;color:var(--text-secondary,#555);line-height:1.8;font-size:15px;">' + viaje.descripcion + '</div>'
          bodyHtml += '</div>'
        }

        // Dual CTA: Cotizar (primary) + WhatsApp (secondary)
        var _waPhone = '523125504084';
        try { var _cd = JSON.parse(localStorage.getItem('data')); if (_cd && _cd.contacto && _cd.contacto.whatsapp) _waPhone = '52' + _cd.contacto.whatsapp; } catch(e){}
        bodyHtml += '<div class="trip-detail__cta-dual">'
        bodyHtml += '<button class="trip-detail__cta-primary" onclick="CotizarModal.open(\'' + viaje.nombre.replace(/'/g, "\\'") + '\')">'
        bodyHtml += '<i class="fas fa-tag"></i> ' + (i18n.getLang() === 'en' ? 'Get a Free Quote' : 'Cotizar Este Viaje')
        bodyHtml += '</button>'
        bodyHtml += '<a href="https://api.whatsapp.com/send/?phone=' + _waPhone + '&text=' + encodeURIComponent(i18n.t('wa.message') + ' ' + viaje.nombre) + '" target="_blank" rel="noopener noreferrer" class="trip-detail__cta-secondary">'
        bodyHtml += '<i class="fab fa-whatsapp"></i> ' + (i18n.getLang() === 'en' ? 'Or message us on WhatsApp' : 'O escríbenos por WhatsApp')
        bodyHtml += '</a>'
        bodyHtml += '</div>'

        bodyHtml += '</div>' // end trip-detail

        document.getElementById('viaje-head').innerHTML = headHtml;
        document.getElementById('viaje-body').innerHTML = bodyHtml;

        // Inject TouristTrip schema for SEO
        injectTourSchema(viaje, fechas);

        // Update page title
        document.title = viaje.nombre + ' — RS Viajes Rey Colimán';

    }else{
        showTripError('notfound');
    }
}

function injectTourSchema(v, fechas) {
    var old = document.getElementById('rs-tour-schema');
    if (old) old.remove();

    var schema = {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        'name': v.nombre,
        'description': v.descripcion || v.nombre,
        'image': v.imagen,
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

    if (v.desde) {
        schema.offers = {
            '@type': 'Offer',
            'price': String(v.desde).replace(/[^0-9.]/g, ''),
            'priceCurrency': (v.moneda || 'USD').replace('MXN', 'MXN'),
            'availability': 'https://schema.org/InStock'
        };
    }

    if (v.ciudades) {
        schema.itinerary = {
            '@type': 'ItemList',
            'name': v.ciudades
        };
    }

    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'rs-tour-schema';
    el.textContent = JSON.stringify(schema);
    document.head.appendChild(el);
}
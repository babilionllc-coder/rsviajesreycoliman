let viajes = [];

window.addEventListener("load", () => {
  getTrips();
});

// Re-render trip cards on language change
window.addEventListener('langChanged', function() {
  if (viajes.length > 0) loadViajes();
});

function getTrips() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var destino = urlParams.get("destino");

  // If no destination param, show friendly message
  if (!destino) {
    var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';
    var el = document.getElementById("viajes");
    if (el) {
      el.innerHTML = '<div class="col-12" style="text-align:center;padding:80px 20px;font-family:Inter,sans-serif;">' +
        '<i class="fas fa-compass" style="font-size:64px;color:var(--gold);margin-bottom:24px;display:block;"></i>' +
        '<h2 style="color:var(--navy);margin-bottom:12px;">' + (lang === 'en' ? 'Select a Destination' : 'Selecciona un Destino') + '</h2>' +
        '<p style="color:var(--text-secondary);font-size:16px;">' + (lang === 'en' ? 'Please choose a destination from the menu above to view available trips.' : 'Por favor elige un destino del menú para ver los viajes disponibles.') + '</p>' +
        '<a href="/" class="btn btn-primary" style="margin-top:24px;padding:12px 32px;border-radius:30px;font-weight:600;">' + (lang === 'en' ? 'Back to Home' : 'Volver al Inicio') + '</a>' +
        '</div>';
    }
    return;
  }

  // Show loading state
  var el = document.getElementById("viajes");
  if (el) {
    el.innerHTML = '<div class="trip-loading"><div class="trip-loading__spinner"></div><p class="trip-loading__text">' + 
      ((typeof i18n !== 'undefined' && i18n.getLang() === 'en') ? 'Loading trips...' : 'Cargando viajes...') + '</p></div>';
  }

  $.ajax({
    type: "GET",
    url: conf.api + "getTripsBySlug/" + destino,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": conf.apikey,
    },
    success: function (data) {
      viajes = data.viajes;
      if (viajes && viajes.length > 0) {
        loadViajes();
      } else {
        showNoTrips();
      }
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      showNoTrips();
    },
  });
}

function showNoTrips() {
  var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';
  var el = document.getElementById("viajes");
  if (el) {
    el.innerHTML = '<div class="col-12" style="text-align:center;padding:80px 20px;font-family:Inter,sans-serif;">' +
      '<i class="fas fa-exclamation-circle" style="font-size:48px;color:var(--gold);margin-bottom:20px;display:block;"></i>' +
      '<h3 style="color:var(--navy);margin-bottom:12px;">' + (lang === 'en' ? 'No trips available' : 'No hay viajes disponibles') + '</h3>' +
      '<p style="color:var(--text-secondary);">' + (lang === 'en' ? 'Please try another destination or contact us on WhatsApp.' : 'Intenta con otro destino o contáctanos por WhatsApp.') + '</p>' +
      '<a href="/" class="btn btn-primary" style="margin-top:16px;padding:10px 28px;border-radius:30px;font-weight:600;">' + (lang === 'en' ? 'Back to Home' : 'Volver al Inicio') + '</a>' +
      '</div>';
  }
}

function loadViajes() {
  let viajesHtml = [];

  if (viajes.length > 0) {
    // Wrap in premium grid
    let gridHtml = '<div class="trip-cards-grid">';
    
    viajes.forEach((element) => {
      let priceLabel = (typeof i18n !== 'undefined') ? i18n.t('trip.from') : 'Desde';
      let daysLabel = (typeof i18n !== 'undefined') ? i18n.t('trip.days') : 'Días';
      let nightsLabel = (typeof i18n !== 'undefined') ? (element.noches == 1 ? i18n.t('trip.night') : i18n.t('trip.nights')) : 'Noches';
      let moreLabel = (typeof i18n !== 'undefined') ? i18n.t('trip.more') : 'Ver más';
      
      gridHtml += '<a href="tour.html?tour=' + element.enlace + '" class="trip-card">';
      gridHtml +=   '<div class="trip-card__image-wrap">';
      if (element.imagen) {
        gridHtml +=   '<img src="' + element.imagen + '" alt="' + (element.nombre || 'Trip') + '" loading="lazy">';
      } else {
        gridHtml +=   '<div class="trip-card__image-placeholder"><i class="fas fa-mountain"></i></div>';
      }
      gridHtml +=     '<div class="trip-card__badges">';
      gridHtml +=       '<span class="trip-badge trip-badge--days"><i class="fas fa-sun"></i> ' + element.dias + ' ' + daysLabel + '</span>';
      gridHtml +=       '<span class="trip-badge trip-badge--nights"><i class="fas fa-moon"></i> ' + element.noches + ' ' + nightsLabel + '</span>';
      gridHtml +=     '</div>';
      if (element.desde) {
        gridHtml +=   '<div class="trip-card__price-tag">';
        gridHtml +=     '<small>' + priceLabel + '</small>';
        gridHtml +=     '<strong>$' + element.desde + ' ' + element.moneda + '</strong>';
        if (element.impuestos > 0) {
          gridHtml +=   '<small>+ $' + element.impuestos + ' imp.</small>';
        }
        gridHtml +=   '</div>';
      }
      gridHtml +=   '</div>';
      gridHtml +=   '<div class="trip-card__body">';
      gridHtml +=     '<h3 class="trip-card__title">' + element.nombre + '</h3>';
      if (element.ciudades) {
        gridHtml +=   '<p class="trip-card__cities"><i class="fas fa-map-marker-alt"></i> ' + element.ciudades + '</p>';
      }
      gridHtml +=     '<span class="trip-card__cta">' + moreLabel + ' <i class="fas fa-arrow-right"></i></span>';
      gridHtml +=   '</div>';
      gridHtml += '</a>';
    });
    
    gridHtml += '</div>';
    
    document.getElementById("viajes").innerHTML = gridHtml;
  } else {
    showNoTrips();
  }
}

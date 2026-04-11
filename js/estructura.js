let contact = {};
let valorCambio = "0";
let internacionales = [];
let otrosDestinos = [];
let mostrarNacionales = false;

window.addEventListener("load", () => {
  try {
    let dataS = localStorage.getItem("data");
    data = JSON.parse(dataS);
    contact = data.contacto;
    valorCambio = data.datos.find((e) => e.clave == "exchange").valor ?? "0";
    internacionales = data.internacionales;
    otrosDestinos = data.otrosDestinos;
    mostrarNacionales = data.mostrarNacionales;
    loadMenu();
    loadValorCambio();
    loadFooter();
    loadWhatsapp();
    loadLangToggle();
  } catch (error) {
    console.warn('Error loading cached data:', error);
  }
  getInfo();
});

// Re-render dynamic content on language change
window.addEventListener('langChanged', function() {
  loadMenu();
  loadFooter();
  loadWhatsapp();
  loadLangToggle();
});

async function getInfo() {
  await $.ajax({
    type: "GET",
    url: conf.api + "getInfo",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": conf.apikey,
    },
    success: function (data) {
      localStorage.setItem("data", JSON.stringify(data));
      contact = data.contacto;
      valorCambio = data.datos.find((e) => e.clave == "exchange").valor ?? "0";
      internacionales = data.internacionales;
      otrosDestinos = data.otrosDestinos;
      mostrarNacionales = data.mostrarNacionales;
      loadMenu();
      loadValorCambio();
      loadFooter();
      loadWhatsapp();
      loadLangToggle();
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      // Silent fail - data will load from cache next time
    },
  });
}

function loadFooter() {
  let html = '<a href="/" class="navbar-brand" style="margin-bottom: 40px;">';
  html += '<img src="images/logo-optimized.png" height="90" alt="RS Viajes Rey Colimán" loading="lazy">';
  html += "</a>";
  html +=
    '<p><i class="fa fa-map-marker-alt mr-2"></i>' +
    contact.direccion +
    ", " +
    contact.ciudad +
    ", " +
    contact.estado +
    ", C.P. " +
    contact.cp +
    ".</p>";

  html += '<p><i class="fa fa-envelope mr-2"></i>' + contact.correo + "</p>";
  html += '<div class="d-flex justify-content-start mt-4">';
  html +=
    '<a class="social" href="https://www.tiktok.com/@rey.coliman" target="_blank" rel="noopener noreferrer"><img src="images/tiktok_icon.svg" alt="TikTok RS Viajes" loading="lazy"></img></a>';
  html +=
    '<a class="social" aria-label="Facebook" href="https://www.facebook.com/REYCOLIMANAGENCIA/" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook-f"></i></a>';
  html +=
    '<a class="social" aria-label="Instagram" href="https://www.instagram.com/rsviajesreycoliman/" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i></a>';
  html +=
    '<a class="social" href="https://api.whatsapp.com/send/?phone=52' +
    contact.whatsapp +
    '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-label="WhatsApp"></i></a>';
  html += "</div>";

  // Clickable phone number
  if (contact.telefono) {
    html += '<div class="mt-3"><a href="tel:+52' + contact.telefono.replace(/\D/g, '') + '" class="text-white"><i class="fa fa-phone-alt mr-2"></i>' + i18n.t('footer.callus') + ': ' + contact.telefono + '</a></div>';
  }

  // Privacy policy link
  html += '<div class="mt-3"><a href="/privacidad" class="text-white" style="font-size:13px;opacity:0.7;text-decoration:underline;">' + (typeof i18n !== 'undefined' && i18n.getLang() === 'en' ? 'Privacy Policy' : 'Aviso de Privacidad') + '</a></div>';

  document.getElementById("footer").innerHTML = html;
}

function loadWhatsapp() {
  let html =
    '<a href="https://api.whatsapp.com/send/?phone=52' +
    contact.whatsapp +
    '&text=' + encodeURIComponent(i18n.t('wa.message')) +
    '" class="float" aria-label="Chat on WhatsApp" target="_blank" rel="noopener noreferrer">';
  html += '<i class="fab fa-whatsapp my-float"></i>';
  html += "</a>";

  document.getElementById("whatsapp").innerHTML = html;
}

function loadValorCambio() {
  let html =
    '<a class="btn btn-primary d-none d-lg-block"> <i class="far fa-money-bill-alt"></i>  ' +
    valorCambio +
    " MXN</a>";

  document.getElementById("cambio").innerHTML = html;
}

function loadMenu() {
  let html =
    '<img src="images/logo-optimized.png" height="70" class="d-inline-block align-text-top" alt="RS Viajes Rey Colimán">';

  document.getElementById("logo").innerHTML = html;

  if (internacionales != null && internacionales.length > 0) {
    html =
      '<a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown">' + i18n.t('nav.departures') + '</a>';
    html += '<div class="dropdown-menu m-0">';
    for (let index = 0; index < internacionales.length; index++) {
      const element = internacionales[index];
      html +=
        '<a href="viajes-internacionales.html?destino=' +
        element.ruta +
        '" class="dropdown-item">' +
        element.titulo +
        "</a>";
    }
    html += "</div>";

    document.getElementById("internacionales").innerHTML = html;
  }

  if (mostrarNacionales) {
    html =
      '<a href="viajes-nacionales.html" class="nav-item nav-link">' + i18n.t('nav.national') + '</a>';

    document.getElementById("nacionales").innerHTML = html;
  }

  if (otrosDestinos != null && otrosDestinos.length > 0) {
    html =
      '<a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown">' + i18n.t('nav.destinations') + '</a>';
    html += '<div class="dropdown-menu m-0">';
    for (let index = 0; index < otrosDestinos.length; index++) {
      const element = otrosDestinos[index];
      html +=
        '<a href="mas-destinos.html?destino=' +
        element.ruta +
        '" class="dropdown-item">' +
        element.titulo +
        "</a>";
    }
    html += "</div>";

    document.getElementById("mas-destinos").innerHTML = html;
  }
}

function loadLangToggle() {
  var el = document.getElementById('lang-toggle');
  if (el && typeof i18n !== 'undefined') {
    el.innerHTML = i18n.getToggleHTML();
  }
}

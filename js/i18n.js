/*  ═══════════════════════════════════════════════════
    RS Viajes — i18n (English / Spanish)
    ═══════════════════════════════════════════════════ */

var i18n = (function () {
  'use strict';

  var DEFAULT_LANG = 'es';
  var STORAGE_KEY = 'rs-lang';

  /* ── Translation Dictionary ── */
  var translations = {

    /* ── Navigation ── */
    'nav.about':            { es: '¿Quiénes Somos?',         en: 'About Us' },
    'nav.contact':          { es: 'Contacto',                 en: 'Contact' },
    'nav.blog':             { es: 'Blog',                      en: 'Blog' },
    'nav.departures':       { es: 'Salidas Garantizadas',     en: 'Guaranteed Departures' },
    'nav.national':         { es: 'Viajes Nacionales',        en: 'Domestic Travel' },
    'nav.destinations':     { es: 'Más Destinos',             en: 'More Destinations' },
    'nav.aria':             { es: 'Navegación principal',     en: 'Main navigation' },
    'nav.toggler':          { es: 'Abrir menú de navegación', en: 'Open navigation menu' },

    /* ── Best Sellers ── */
    'best.tag':             { es: 'Más vendidos',                     en: 'Best Sellers' },
    'best.title':           { es: 'Descubre los viajes más vendidos', en: 'Discover our best-selling trips' },
    'best.btn':             { es: 'Ver más detalles',                 en: 'See Details' },

    /* ── Recents ── */
    'recent.tag':           { es: 'Novedades',                        en: 'New Arrivals' },
    'recent.title':         { es: 'Descubre los viajes más recientes', en: 'Discover our newest trips' },

    /* ── Testimonials ── */
    'test.tag':             { es: 'Lo que dicen nuestros viajeros',   en: 'What our travelers say' },
    'test.title':           { es: 'Experiencias que hablan por sí solas', en: 'Experiences that speak for themselves' },
    'test.q1':              { es: '"¡Increíble experiencia! Todo perfectamente organizado, desde el vuelo hasta el hotel. Definitivamente volveré a viajar con ellos."', en: '"Incredible experience! Everything perfectly organized, from the flight to the hotel. I will definitely travel with them again."' },
    'test.q2':              { es: '"El mejor servicio de agencia de viajes. Nos ayudaron con todo: vuelos, hospedaje y actividades. Muy recomendados."', en: '"The best travel agency service. They helped us with everything: flights, lodging, and activities. Highly recommended."' },
    'test.q3':              { es: '"Gracias a RS Viajes conocimos Europa con un paquete increíble. Precios accesibles y atención personalizada. ¡10 de 10!"', en: '"Thanks to RS Viajes we got to know Europe with an amazing package. Affordable prices and personalized attention. 10 out of 10!"' },
    'test.loc1':            { es: 'Colima, México',                   en: 'Colima, Mexico' },
    'test.loc2':            { es: 'Villa de Álvarez, México',         en: 'Villa de Álvarez, Mexico' },
    'test.loc3':            { es: 'Manzanillo, México',               en: 'Manzanillo, Mexico' },

    /* ── About ── */
    'about.tag':            { es: 'Acerca de nosotros',       en: 'About Us' },
    'about.desc':           { es: 'RS Viajes Rey Colimán es una agencia de viajes ubicada en Colima, México, Registro Nacional de Turismo (0406010caefbb), especializada en ofrecer experiencias turísticas personalizadas. Se enfocan en brindar a sus clientes viajes únicos y memorables, adaptados a sus preferencias y necesidades.', en: 'RS Viajes Rey Colimán is a travel agency located in Colima, Mexico, National Tourism Registry (0406010caefbb), specialized in offering personalized tourism experiences. They focus on providing unique and memorable trips, tailored to their clients\' preferences and needs.' },
    'about.services':       { es: 'Entre los servicios que ofrecen se incluyen:',  en: 'Their services include:' },
    'about.s1':             { es: 'Compra de boletos de avión',                     en: 'Flight ticket purchases' },
    'about.s2':             { es: 'Reservación de hospedaje y organización de tours', en: 'Hotel reservations and tour organization' },
    'about.s3':             { es: 'Asesoramiento en la planificación de itinerarios', en: 'Itinerary planning consulting' },
    'about.stat1':          { es: 'Viajes diferentes',        en: 'Unique Trips' },
    'about.stat2':          { es: 'Clientes satisfechos',     en: 'Happy Clients' },

    /* ── FAQ ── */
    'faq.tag':              { es: 'Preguntas frecuentes',                 en: 'Frequently Asked Questions' },
    'faq.title':            { es: 'Lo que nuestros viajeros preguntan',   en: 'What our travelers ask' },
    'faq.q1':               { es: '¿Qué destinos nacionales ofrece RS Viajes?', en: 'What domestic destinations does RS Viajes offer?' },
    'faq.a1':               { es: 'Ofrecemos paquetes a los destinos más populares de México: Cancún, Los Cabos, Puerto Vallarta, Ciudad de México, Oaxaca, Huatulco y muchos más. Incluimos vuelo, hospedaje y actividades.', en: 'We offer packages to Mexico\'s most popular destinations: Cancún, Los Cabos, Puerto Vallarta, Mexico City, Oaxaca, Huatulco, and many more. We include flights, lodging, and activities.' },
    'faq.q2':               { es: '¿Los paquetes incluyen vuelo y hotel?', en: 'Do packages include flights and hotels?' },
    'faq.a2':               { es: 'Sí, la mayoría de nuestros paquetes incluyen vuelo redondo, hospedaje, traslados y actividades. Puedes personalizar tu paquete según tus necesidades y presupuesto.', en: 'Yes, most of our packages include round-trip flights, lodging, transfers, and activities. You can customize your package according to your needs and budget.' },
    'faq.q3':               { es: '¿Cuáles son las formas de pago?', en: 'What payment methods are available?' },
    'faq.a3':               { es: 'Aceptamos efectivo, transferencia bancaria, tarjetas de crédito y débito. También ofrecemos planes de pago a meses para que puedas apartar tu viaje con anticipación.', en: 'We accept cash, bank transfers, and credit/debit cards. We also offer monthly payment plans so you can reserve your trip in advance.' },
    'faq.q4':               { es: '¿Necesito pasaporte para viajes internacionales?', en: 'Do I need a passport for international travel?' },
    'faq.a4':               { es: 'Sí, para viajes internacionales necesitas pasaporte vigente. Para algunos destinos también se requiere visa. Nuestro equipo te asesora sobre todos los requisitos de documentación.', en: 'Yes, for international travel you need a valid passport. Some destinations also require a visa. Our team advises you on all documentation requirements.' },
    'faq.q5':               { es: '¿Cómo puedo cotizar un viaje?', en: 'How can I get a quote for a trip?' },
    'faq.a5':               { es: 'Puedes cotizar sin compromiso por WhatsApp, llamando a nuestras oficinas, o usando el formulario de contacto en nuestra página web. Te respondemos en menos de 24 horas.', en: 'You can get a free quote via WhatsApp, by calling our offices, or using the contact form on our website. We respond in less than 24 hours.' },
    'faq.q6':               { es: '¿Dónde se encuentra la agencia?', en: 'Where is the agency located?' },
    'faq.a6':               { es: 'Estamos ubicados en Colima, México. Contamos con Registro Nacional de Turismo (0406010caefbb) y más de 1000 clientes satisfechos.', en: 'We are located in Colima, Mexico. We hold the National Tourism Registry (0406010caefbb) and serve over 1,000 satisfied customers.' },
    'faq.q7':               { es: '¿Es más barato reservar con una agencia o por internet?', en: 'Is it cheaper to book through an agency or online?' },
    'faq.a7':               { es: 'Nuestros precios son competitivos y muchas veces más bajos que plataformas en línea, porque negociamos tarifas directas con aerolíneas y hoteles. Además, recibes asesoría personalizada sin costo extra.', en: 'Our prices are competitive and often lower than online platforms because we negotiate direct rates with airlines and hotels. Plus, you receive personalized advice at no extra cost.' },
    'faq.q8':               { es: '¿Necesito visa para viajar a Europa desde México?', en: 'Do I need a visa to travel to Europe from Mexico?' },
    'faq.a8':               { es: 'No, los ciudadanos mexicanos no necesitan visa para estancias turísticas de hasta 90 días en el espacio Schengen (la mayoría de Europa). Solo necesitas pasaporte vigente. Nuestro equipo verifica todos los requisitos antes de tu viaje.', en: 'No, Mexican citizens do not need a visa for tourist stays of up to 90 days in the Schengen area (most of Europe). You only need a valid passport. Our team verifies all requirements before your trip.' },
    'faq.q9':               { es: '¿Se puede apartar un viaje sin pagar el monto completo?', en: 'Can I reserve a trip without paying the full amount?' },
    'faq.a9':               { es: 'Sí, puedes apartar tu viaje con un anticipo y pagar el resto en cómodas mensualidades o antes de la fecha de salida. Pregúntanos por nuestros planes de pago sin intereses.', en: 'Yes, you can reserve your trip with a deposit and pay the rest in convenient installments or before the departure date. Ask us about our interest-free payment plans.' },
    'faq.q10':              { es: '¿Qué incluye un paquete de viaje todo incluido?', en: 'What does an all-inclusive travel package include?' },
    'faq.a10':              { es: 'Nuestros paquetes todo incluido generalmente cubren vuelo redondo, hospedaje, traslados aeropuerto-hotel, alimentos, bebidas y algunas actividades o excursiones. El contenido exacto varía por destino.', en: 'Our all-inclusive packages typically cover round-trip flights, accommodation, airport-hotel transfers, meals, drinks, and some activities or excursions. Exact contents vary by destination.' },
    'faq.q11':              { es: '¿Ofrecen viajes de graduación desde Colima?', en: 'Do you offer graduation trips from Colima?' },
    'faq.a11':              { es: 'Sí, organizamos viajes de graduación para grupos escolares y universitarios. Ofrecemos destinos nacionales e internacionales con precios especiales para grupos, transporte, hospedaje y actividades recreativas.', en: 'Yes, we organize graduation trips for school and university groups. We offer domestic and international destinations with special group pricing, transportation, lodging, and recreational activities.' },
    'faq.q12':              { es: '¿Cuánto tiempo antes debo reservar un viaje internacional?', en: 'How far in advance should I book an international trip?' },
    'faq.a12':              { es: 'Recomendamos reservar con al menos 2 a 3 meses de anticipación para obtener las mejores tarifas y disponibilidad, especialmente en temporada alta. Para salidas garantizadas, entre antes reserves, mejor precio obtienes.', en: 'We recommend booking at least 2 to 3 months in advance for the best rates and availability, especially during peak season. For guaranteed departures, the earlier you book, the better the price.' },
    'faq.q13':              { es: '¿La agencia ofrece seguro de viaje?', en: 'Does the agency offer travel insurance?' },
    'faq.a13':              { es: 'Sí, ofrecemos seguros de viaje con cobertura médica, cancelación, pérdida de equipaje y asistencia en destino. Te recomendamos siempre viajar protegido, especialmente en viajes internacionales.', en: 'Yes, we offer travel insurance covering medical expenses, cancellation, lost luggage, and on-site assistance. We always recommend traveling protected, especially on international trips.' },
    'faq.q14':              { es: '¿Organizan tours privados o solo grupales?', en: 'Do you organize private tours or only group tours?' },
    'faq.a14':              { es: 'Organizamos ambos. Tenemos salidas garantizadas con grupos y también diseñamos viajes privados a la medida para parejas, familias o grupos de amigos con itinerario personalizado.', en: 'We organize both. We have guaranteed departures with groups and also design custom private trips for couples, families, or groups of friends with personalized itineraries.' },

    /* ── CTA ── */
    'cta.title':            { es: '¿Listo para tu próxima aventura?',  en: 'Ready for your next adventure?' },
    'cta.desc':             { es: 'Permítenos crear la experiencia de viaje perfecta para ti. Cotiza sin compromiso.', en: 'Let us create the perfect travel experience for you. Get a free quote.' },
    'cta.whatsapp':         { es: 'Escríbenos por WhatsApp', en: 'Message us on WhatsApp' },
    'cta.call':             { es: 'Llámanos ahora',          en: 'Call Us Now' },

    /* ── Contact Form ── */
    'contact.title':        { es: 'Contáctanos',  en: 'Contact Us' },
    'contact.send':         { es: 'Enviar',        en: 'Send' },
    'contact.sending':      { es: 'Enviando...',   en: 'Sending...' },
    'contact.ph.name':      { es: 'Nombre',        en: 'Name' },
    'contact.ph.email':     { es: 'Correo',        en: 'Email' },
    'contact.ph.whatsapp':  { es: 'WhatsApp',      en: 'WhatsApp' },
    'contact.ph.subject':   { es: 'Asunto',        en: 'Subject' },
    'contact.ph.message':   { es: 'Mensaje',       en: 'Message' },

    /* ── Footer ── */
    'footer.callus':        { es: 'Llámanos',      en: 'Call Us' },
    'footer.rights':        { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },

    /* ── Magazine (home.js) ── */
    'mag.tag':              { es: 'Revista digital',                en: 'Digital Magazine' },
    'mag.title':            { es: 'Conoce la revista digital',      en: 'Explore Our Digital Magazine' },
    'mag.desc':             { es: 'En nuestra revista digital podrás encontrar los mejores viajes actualizados', en: 'In our digital magazine you\'ll find the best updated trips' },
    'mag.download':         { es: 'Descargar',         en: 'Download' },
    'mag.downloading':      { es: 'Descargando...',    en: 'Downloading...' },
    'mag.downloaded':       { es: 'La revista se ha descargado', en: 'Magazine downloaded successfully' },
    'mag.view':             { es: 'Quiero verla',      en: 'View Online' },

    /* ── Carousel ── */
    'carousel.btn':         { es: 'Ver más detalles',  en: 'See Details' },

    /* ── WhatsApp ── */
    'wa.message':           { es: '¡Hola! Me interesa obtener información sobre sus viajes.', en: 'Hi! I\'m interested in getting information about your trips.' },

    /* ── Toast Messages (contact.js) ── */
    'toast.success':        { es: '¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.', en: 'Message sent successfully! We\'ll get in touch soon.' },
    'toast.error':          { es: 'Error al enviar el mensaje. Intente de nuevo o contáctenos por WhatsApp.', en: 'Error sending message. Please try again or contact us via WhatsApp.' },
    'toast.email':          { es: 'Correo electrónico no válido', en: 'Invalid email address' },
    'toast.phone':          { es: 'Número de WhatsApp no válido', en: 'Invalid WhatsApp number' },
    'toast.fields':         { es: 'Complete todos los campos correctamente', en: 'Please fill in all fields correctly' },
    'field.email':          { es: 'Ingrese un correo electrónico válido', en: 'Enter a valid email address' },
    'field.phone':          { es: 'Ingrese un número de 10 dígitos', en: 'Enter a 10-digit number' },
    'field.name':           { es: 'Mínimo 4 caracteres', en: 'Minimum 4 characters' },
    'field.subject':        { es: 'Mínimo 3 caracteres', en: 'Minimum 3 characters' },
    'field.message':        { es: 'Mínimo 6 caracteres', en: 'Minimum 6 characters' },

    /* ── Breadcrumbs ── */
    'bread.home':           { es: 'Inicio',                    en: 'Home' },
    'bread.national':       { es: 'Viajes Nacionales',         en: 'Domestic Travel' },
    'bread.international':  { es: 'Salidas Garantizadas',      en: 'Guaranteed Departures' },
    'bread.destinations':   { es: 'Más Destinos',              en: 'More Destinations' },
    'bread.magazine':       { es: 'Revista Digital',            en: 'Digital Magazine' },

    /* ── Trip Listing Cards (otros.js / mas-destinos.html) ── */
    'trip.days':            { es: 'Días',                      en: 'Days' },
    'trip.night':           { es: 'Noche',                     en: 'Night' },
    'trip.nights':          { es: 'Noches',                    en: 'Nights' },
    'trip.from':            { es: 'Desde:',                    en: 'From:' },
    'trip.more':            { es: 'MAS DETALLES',              en: 'MORE DETAILS' },
    'trip.visiting':        { es: 'Visitando',                 en: 'Visiting' },
    'trip.err.load':        { es: 'Error al obtener el viaje', en: 'Error loading trip data' },
    'trip.err.none':        { es: 'No se encontraron viajes',  en: 'No trips found' },
    'trip.err.home':        { es: 'Error al obtener datos',    en: 'Error loading data' },

    /* ── Trip Detail Page (tour.js / tour.html) ── */
    'trip.willvisit':       { es: 'Visitarás:',                en: 'You will visit:' },
    'trip.FROM':            { es: 'DESDE',                     en: 'FROM' },
    'trip.double':          { es: 'DOBLE',                     en: 'DOUBLE' },
    'trip.triple':          { es: 'TRIPLE',                    en: 'TRIPLE' },
    'trip.single':          { es: 'SENCILLA',                  en: 'SINGLE' },
    'trip.junior':          { es: 'JUNIOR',                    en: 'JUNIOR' },
    'trip.taxes':           { es: 'IMPUESTOS',                 en: 'TAXES' },
    'trip.included':        { es: 'YA INCLUIDOS',              en: 'ALREADY INCLUDED' },
    'trip.ask':             { es: 'CONSULTAR',                 en: 'ASK' },
    'trip.departures':      { es: 'Salidas',                   en: 'Departures' },
    'trip.description':     { es: 'Descripción:',              en: 'Description:' },
    'trip.err.notfound':    { es: 'No se encontró el viaje',   en: 'Trip not found' },

    /* ── 404 Page ── */
    '404.title':            { es: 'Página no encontrada',      en: 'Page Not Found' },
    '404.desc':             { es: 'Lo sentimos, la página que buscas no existe o ha sido movida.', en: 'Sorry, the page you\'re looking for doesn\'t exist or has been moved.' },
    '404.btn':              { es: 'Volver al inicio',          en: 'Back to Home' }
  };

  /* ── Get current language ── */
  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  /* ── Set language ── */
  function setLang(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    localStorage.setItem(STORAGE_KEY, lang);
    apply();
    updateToggle();
    document.documentElement.lang = lang;
    // Fire event so dynamic JS can re-render
    window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: lang } }));
  }

  /* ── Get a translation string ── */
  function t(key) {
    var lang = getLang();
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    // Fallback to Spanish
    if (translations[key] && translations[key]['es']) {
      return translations[key]['es'];
    }
    return key;
  }

  /* ── Apply translations to DOM ── */
  function apply() {
    var lang = getLang();

    // Text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (translations[key] && translations[key][lang]) {
        el.textContent = translations[key][lang];
      }
    });

    // HTML content (for elements with line breaks etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (translations[key] && translations[key][lang]) {
        el.innerHTML = translations[key][lang];
      }
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (translations[key] && translations[key][lang]) {
        el.placeholder = translations[key][lang];
      }
    });

    // ARIA labels
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (translations[key] && translations[key][lang]) {
        el.setAttribute('aria-label', translations[key][lang]);
      }
    });

    // Update html lang attribute
    document.documentElement.lang = lang;
  }

  /* ── Update toggle button state ── */
  function updateToggle() {
    var lang = getLang();
    var btnES = document.getElementById('lang-es');
    var btnEN = document.getElementById('lang-en');
    if (btnES && btnEN) {
      btnES.classList.toggle('active', lang === 'es');
      btnEN.classList.toggle('active', lang === 'en');
    }
  }

  /* ── Create the toggle HTML ── */
  function getToggleHTML() {
    var lang = getLang();
    return '<div class="lang-toggle">' +
      '<button id="lang-es" class="lang-btn' + (lang === 'es' ? ' active' : '') + '" onclick="i18n.setLang(\'es\')" title="Español">ES</button>' +
      '<span class="lang-sep">|</span>' +
      '<button id="lang-en" class="lang-btn' + (lang === 'en' ? ' active' : '') + '" onclick="i18n.setLang(\'en\')" title="English">EN</button>' +
    '</div>';
  }

  /* ── Initialize on DOM ready ── */
  function init() {
    apply();
    updateToggle();
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    t: t,
    getLang: getLang,
    setLang: setLang,
    apply: apply,
    getToggleHTML: getToggleHTML,
    updateToggle: updateToggle
  };

})();

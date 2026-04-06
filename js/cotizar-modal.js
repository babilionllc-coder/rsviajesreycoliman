/* ═══════════════════════════════════════════════════
   RS Viajes — Cotizar Modal (Quote Request System)
   Captures leads: Name, WhatsApp, Email, Destination, 
   Date, Passengers → sends to WhatsApp + Email API
   ═══════════════════════════════════════════════════ */

var CotizarModal = (function () {
  'use strict';

  var isOpen = false;
  var currentDestination = '';
  var initialized = false;

  /* ── WhatsApp number from the site's contact data ── */
  function getWhatsAppNumber() {
    try {
      var data = JSON.parse(localStorage.getItem('data'));
      if (data && data.contacto && data.contacto.whatsapp) {
        return '52' + data.contacto.whatsapp;
      }
    } catch (e) {}
    return '523125504084'; // fallback
  }

  /* ── Get lang ── */
  function getLang() {
    return (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';
  }

  /* ── Translations ── */
  var t = {
    es: {
      title: 'Solicitar Cotización',
      subtitle: 'Sin compromiso — Te contactamos en menos de 2 horas',
      destLabel: 'Destino de interés',
      nameLabel: 'Nombre completo',
      namePh: 'Tu nombre',
      whatsappLabel: 'WhatsApp',
      whatsappPh: '10 dígitos',
      emailLabel: 'Correo electrónico',
      emailPh: 'tu@correo.com',
      dateLabel: 'Fecha aproximada de viaje',
      passLabel: 'Número de viajeros',
      pass1: '1 persona',
      pass2: '2 personas',
      pass3: '3-4 personas',
      pass5: '5+ personas',
      msgLabel: 'Mensaje (opcional)',
      msgPh: 'Cuéntanos más sobre tu viaje ideal...',
      submit: 'Solicitar Cotización Gratis',
      sending: 'Enviando...',
      successTitle: '¡Cotización Solicitada!',
      successMsg: 'Hemos recibido tu solicitud. Te contactaremos por WhatsApp en menos de 2 horas con los mejores precios disponibles.',
      successBtn: 'Perfecto',
      privacy: 'Al enviar, aceptas nuestro',
      privacyLink: 'Aviso de Privacidad',
      waDirect: 'O escríbenos directo por WhatsApp',
      stickyText: '¿Te interesa un viaje?',
      stickyBtn: 'Cotiza Gratis →',
      errName: 'Ingresa tu nombre',
      errWa: 'Ingresa un WhatsApp válido (10 dígitos)',
      errEmail: 'Ingresa un correo válido',
      errDest: 'Selecciona un destino'
    },
    en: {
      title: 'Request a Quote',
      subtitle: 'No commitment — We\'ll contact you within 2 hours',
      destLabel: 'Destination of interest',
      nameLabel: 'Full name',
      namePh: 'Your name',
      whatsappLabel: 'WhatsApp',
      whatsappPh: '10 digits',
      emailLabel: 'Email',
      emailPh: 'you@email.com',
      dateLabel: 'Approximate travel date',
      passLabel: 'Number of travelers',
      pass1: '1 person',
      pass2: '2 people',
      pass3: '3-4 people',
      pass5: '5+ people',
      msgLabel: 'Message (optional)',
      msgPh: 'Tell us more about your ideal trip...',
      submit: 'Request Free Quote',
      sending: 'Sending...',
      successTitle: 'Quote Requested!',
      successMsg: 'We\'ve received your request. We\'ll contact you via WhatsApp within 2 hours with the best available prices.',
      successBtn: 'Great',
      privacy: 'By submitting, you accept our',
      privacyLink: 'Privacy Policy',
      waDirect: 'Or message us directly on WhatsApp',
      stickyText: 'Interested in a trip?',
      stickyBtn: 'Get Free Quote →',
      errName: 'Enter your name',
      errWa: 'Enter a valid WhatsApp (10 digits)',
      errEmail: 'Enter a valid email',
      errDest: 'Select a destination'
    }
  };

  function txt(key) {
    var lang = getLang();
    return (t[lang] && t[lang][key]) ? t[lang][key] : t.es[key] || key;
  }

  /* ══════════════════════════════════════
     Initialize — inject modal HTML into DOM
     ══════════════════════════════════════ */
  function init() {
    if (initialized) return;
    initialized = true;

    // Create overlay
    var overlay = document.createElement('div');
    overlay.id = 'cotizar-overlay';
    overlay.className = 'cotizar-overlay';
    overlay.addEventListener('click', close);
    document.body.appendChild(overlay);

    // Create modal
    var modal = document.createElement('div');
    modal.id = 'cotizar-modal';
    modal.className = 'cotizar-modal';
    modal.innerHTML = buildFormHTML();
    document.body.appendChild(modal);

    // ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });

    // Re-render on language change
    window.addEventListener('langChanged', function () {
      if (!isOpen) {
        modal.innerHTML = buildFormHTML();
      }
    });
  }

  /* ── Build Form HTML ── */
  function buildFormHTML() {
    var html = '';

    // Header
    html += '<div class="cotizar-modal__header">';
    html += '  <div class="cotizar-modal__drag-bar"></div>';
    html += '  <button class="cotizar-modal__close" onclick="CotizarModal.close()" aria-label="Cerrar">&times;</button>';
    html += '  <h2 class="cotizar-modal__title"><i class="fas fa-tag"></i> ' + txt('title') + '</h2>';
    html += '  <p class="cotizar-modal__subtitle">' + txt('subtitle') + '</p>';
    html += '  <div class="cotizar-modal__dest-badge" id="cotizar-dest-badge" style="display:none;">';
    html += '    <i class="fas fa-plane"></i>';
    html += '    <span id="cotizar-dest-text"></span>';
    html += '  </div>';
    html += '</div>';

    // Form body
    html += '<div class="cotizar-modal__body">';
    html += '  <form id="cotizar-form" onsubmit="CotizarModal.submit(event)">';

    // Destination (hidden or editable)
    html += '    <div class="cotizar-modal__form-group">';
    html += '      <label class="cotizar-modal__label">' + txt('destLabel') + '</label>';
    html += '      <input type="text" id="cotizar-destino" class="cotizar-modal__input" placeholder="Ej: Europa, Cancún, Japón..." required>';
    html += '    </div>';

    // Name
    html += '    <div class="cotizar-modal__form-group">';
    html += '      <label class="cotizar-modal__label">' + txt('nameLabel') + '</label>';
    html += '      <input type="text" id="cotizar-nombre" class="cotizar-modal__input" placeholder="' + txt('namePh') + '" required>';
    html += '    </div>';

    // WhatsApp + Email row
    html += '    <div class="cotizar-modal__row">';
    html += '      <div class="cotizar-modal__form-group">';
    html += '        <label class="cotizar-modal__label">' + txt('whatsappLabel') + '</label>';
    html += '        <input type="tel" id="cotizar-whatsapp" class="cotizar-modal__input" placeholder="' + txt('whatsappPh') + '" required>';
    html += '      </div>';
    html += '      <div class="cotizar-modal__form-group">';
    html += '        <label class="cotizar-modal__label">' + txt('emailLabel') + '</label>';
    html += '        <input type="email" id="cotizar-email" class="cotizar-modal__input" placeholder="' + txt('emailPh') + '" required>';
    html += '      </div>';
    html += '    </div>';

    // Date + Passengers row
    html += '    <div class="cotizar-modal__row">';
    html += '      <div class="cotizar-modal__form-group">';
    html += '        <label class="cotizar-modal__label">' + txt('dateLabel') + '</label>';
    html += '        <input type="month" id="cotizar-fecha" class="cotizar-modal__input">';
    html += '      </div>';
    html += '      <div class="cotizar-modal__form-group">';
    html += '        <label class="cotizar-modal__label">' + txt('passLabel') + '</label>';
    html += '        <select id="cotizar-pasajeros" class="cotizar-modal__select">';
    html += '          <option value="1">' + txt('pass1') + '</option>';
    html += '          <option value="2" selected>' + txt('pass2') + '</option>';
    html += '          <option value="3-4">' + txt('pass3') + '</option>';
    html += '          <option value="5+">' + txt('pass5') + '</option>';
    html += '        </select>';
    html += '      </div>';
    html += '    </div>';

    // Message
    html += '    <div class="cotizar-modal__form-group">';
    html += '      <label class="cotizar-modal__label">' + txt('msgLabel') + '</label>';
    html += '      <textarea id="cotizar-mensaje" class="cotizar-modal__textarea" placeholder="' + txt('msgPh') + '" rows="2"></textarea>';
    html += '    </div>';

    // Submit
    html += '    <button type="submit" class="cotizar-modal__submit" id="cotizar-submit-btn">';
    html += '      <i class="fas fa-paper-plane"></i> ' + txt('submit');
    html += '    </button>';
    html += '  </form>';

    // WhatsApp direct link
    html += '  <a href="https://api.whatsapp.com/send/?phone=' + getWhatsAppNumber() + '&text=' + encodeURIComponent(getLang() === 'en' ? 'Hi! I\'m interested in getting a quote for a trip.' : '¡Hola! Me interesa cotizar un viaje.') + '" target="_blank" rel="noopener noreferrer" class="cotizar-modal__wa-link">';
    html += '    <i class="fab fa-whatsapp"></i> ' + txt('waDirect');
    html += '  </a>';

    // Privacy
    html += '  <p class="cotizar-modal__privacy">' + txt('privacy') + ' <a href="/privacidad">' + txt('privacyLink') + '</a></p>';

    html += '</div>';

    return html;
  }

  /* ── Build Success HTML ── */
  function buildSuccessHTML() {
    var html = '';
    html += '<div class="cotizar-modal__header">';
    html += '  <div class="cotizar-modal__drag-bar"></div>';
    html += '  <button class="cotizar-modal__close" onclick="CotizarModal.close()" aria-label="Cerrar">&times;</button>';
    html += '  <h2 class="cotizar-modal__title"><i class="fas fa-check-circle"></i> ' + txt('successTitle') + '</h2>';
    html += '</div>';
    html += '<div class="cotizar-modal__success">';
    html += '  <div class="cotizar-modal__success-icon"><i class="fas fa-check"></i></div>';
    html += '  <h3>' + txt('successTitle') + '</h3>';
    html += '  <p>' + txt('successMsg') + '</p>';
    html += '  <button class="cotizar-modal__success-btn" onclick="CotizarModal.close()">';
    html += '    ' + txt('successBtn') + ' <i class="fas fa-thumbs-up"></i>';
    html += '  </button>';
    html += '</div>';
    return html;
  }

  /* ══════════════════════════════════════
     Open Modal
     ══════════════════════════════════════ */
  function open(destination) {
    init();
    currentDestination = destination || '';

    // Re-render form (in case language changed)
    var modal = document.getElementById('cotizar-modal');
    modal.innerHTML = buildFormHTML();

    // Pre-fill destination
    if (currentDestination) {
      var destInput = document.getElementById('cotizar-destino');
      if (destInput) destInput.value = currentDestination;

      var badge = document.getElementById('cotizar-dest-badge');
      var badgeText = document.getElementById('cotizar-dest-text');
      if (badge && badgeText) {
        badgeText.textContent = currentDestination;
        badge.style.display = 'inline-flex';
      }
    }

    // Set minimum date to current month
    var fechaInput = document.getElementById('cotizar-fecha');
    if (fechaInput) {
      var now = new Date();
      fechaInput.min = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    }

    // Show
    document.getElementById('cotizar-overlay').classList.add('cotizar-overlay--active');
    modal.classList.add('cotizar-modal--active');
    document.body.style.overflow = 'hidden';
    isOpen = true;

    // Track GA4 event
    if (typeof gtag === 'function') {
      gtag('event', 'cotizar_modal_open', {
        destination: currentDestination || 'general'
      });
    }
  }

  /* ══════════════════════════════════════
     Close Modal
     ══════════════════════════════════════ */
  function close() {
    var overlay = document.getElementById('cotizar-overlay');
    var modal = document.getElementById('cotizar-modal');
    if (overlay) overlay.classList.remove('cotizar-overlay--active');
    if (modal) modal.classList.remove('cotizar-modal--active');
    document.body.style.overflow = '';
    isOpen = false;
  }

  /* ══════════════════════════════════════
     Submit Quote Request
     ══════════════════════════════════════ */
  function submit(e) {
    e.preventDefault();

    // Gather values
    var destino = document.getElementById('cotizar-destino').value.trim();
    var nombre = document.getElementById('cotizar-nombre').value.trim();
    var whatsapp = document.getElementById('cotizar-whatsapp').value.trim();
    var email = document.getElementById('cotizar-email').value.trim().toLowerCase();
    var fecha = document.getElementById('cotizar-fecha').value;
    var pasajeros = document.getElementById('cotizar-pasajeros').value;
    var mensaje = document.getElementById('cotizar-mensaje').value.trim();

    // Clear errors
    document.querySelectorAll('.cotizar-modal__input--error').forEach(function (el) {
      el.classList.remove('cotizar-modal__input--error');
    });

    // Validate
    var valid = true;
    if (!destino) {
      document.getElementById('cotizar-destino').classList.add('cotizar-modal__input--error');
      valid = false;
    }
    if (nombre.length < 3) {
      document.getElementById('cotizar-nombre').classList.add('cotizar-modal__input--error');
      valid = false;
    }
    if (!/^\d{10}$/.test(whatsapp)) {
      document.getElementById('cotizar-whatsapp').classList.add('cotizar-modal__input--error');
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      document.getElementById('cotizar-email').classList.add('cotizar-modal__input--error');
      valid = false;
    }

    if (!valid) {
      if (typeof window.rsToast === 'function') {
        window.rsToast(getLang() === 'en' ? 'Please fill in all required fields' : 'Por favor llena todos los campos', 'warning');
      }
      return;
    }

    // Disable button
    var btn = document.getElementById('cotizar-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> ' + txt('sending');

    // Format date for display
    var fechaDisplay = '';
    if (fecha) {
      var parts = fecha.split('-');
      var monthNames = getLang() === 'en'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      fechaDisplay = monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0];
    }

    // 1) Send to email via existing API
    var emailData = {
      nombre: nombre,
      correo: email,
      asunto: '🎯 Cotización: ' + destino,
      mensaje: '📍 Destino: ' + destino +
        '\n📅 Fecha: ' + (fechaDisplay || 'Flexible') +
        '\n👥 Viajeros: ' + pasajeros +
        '\n📱 WhatsApp: ' + whatsapp +
        '\n✉️ Email: ' + email +
        (mensaje ? '\n💬 Mensaje: ' + mensaje : ''),
      whatsapp: whatsapp
    };

    if (typeof $ !== 'undefined' && typeof conf !== 'undefined') {
      $.ajax({
        type: 'POST',
        url: conf.api + 'sendEmail',
        data: JSON.stringify(emailData),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-api-key': conf.apikey
        },
        success: function () {
          showSuccess();
        },
        error: function () {
          // Even if email fails, show success since WhatsApp is the primary channel
          showSuccess();
        }
      });
    } else {
      // No API available, just show success
      showSuccess();
    }

    // 2) Open WhatsApp with formatted message
    var waMsg = getLang() === 'en'
      ? '🌍 *New Quote Request*\n\n'
      : '🌍 *Nueva Solicitud de Cotización*\n\n';

    waMsg += '📍 *' + (getLang() === 'en' ? 'Destination' : 'Destino') + ':* ' + destino + '\n';
    waMsg += '👤 *' + (getLang() === 'en' ? 'Name' : 'Nombre') + ':* ' + nombre + '\n';
    waMsg += '📱 *WhatsApp:* ' + whatsapp + '\n';
    waMsg += '✉️ *Email:* ' + email + '\n';
    if (fechaDisplay) waMsg += '📅 *' + (getLang() === 'en' ? 'Date' : 'Fecha') + ':* ' + fechaDisplay + '\n';
    waMsg += '👥 *' + (getLang() === 'en' ? 'Travelers' : 'Viajeros') + ':* ' + pasajeros + '\n';
    if (mensaje) waMsg += '💬 *' + (getLang() === 'en' ? 'Message' : 'Mensaje') + ':* ' + mensaje + '\n';

    // Open WhatsApp in background (won't navigate away since email API is async)
    var waUrl = 'https://api.whatsapp.com/send/?phone=' + getWhatsAppNumber() + '&text=' + encodeURIComponent(waMsg);
    window.open(waUrl, '_blank');

    // 3) Track GA4 event
    if (typeof gtag === 'function') {
      gtag('event', 'cotizar_submit', {
        destination: destino,
        travelers: pasajeros,
        travel_date: fecha || 'flexible'
      });
    }
  }

  /* ── Show success state ── */
  function showSuccess() {
    var modal = document.getElementById('cotizar-modal');
    if (modal) {
      modal.innerHTML = buildSuccessHTML();
    }
  }

  /* ══════════════════════════════════════
     Sticky Bottom Bar (for listing pages)
     ══════════════════════════════════════ */
  function initStickyBar() {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('cotizar-bar-dismissed')) return;

    var bar = document.createElement('div');
    bar.id = 'cotizar-sticky-bar';
    bar.className = 'cotizar-sticky-bar';
    bar.innerHTML =
      '<span class="cotizar-sticky-bar__text"><strong>' + txt('stickyText') + '</strong></span>' +
      '<button class="cotizar-sticky-bar__btn" onclick="CotizarModal.open()">' + txt('stickyBtn') + '</button>' +
      '<button class="cotizar-sticky-bar__dismiss" onclick="CotizarModal.dismissBar()" aria-label="Cerrar">&times;</button>';

    document.body.appendChild(bar);

    // Show after 3 seconds of scrolling
    var scrollTimer;
    var shown = false;
    window.addEventListener('scroll', function () {
      if (shown) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        if (window.scrollY > 400 && !shown) {
          bar.classList.add('cotizar-sticky-bar--visible');
          shown = true;
        }
      }, 300);
    });
  }

  function dismissBar() {
    var bar = document.getElementById('cotizar-sticky-bar');
    if (bar) {
      bar.classList.remove('cotizar-sticky-bar--visible');
      setTimeout(function () { bar.remove(); }, 400);
    }
    sessionStorage.setItem('cotizar-bar-dismissed', '1');
  }

  /* ── Public API ── */
  return {
    init: init,
    open: open,
    close: close,
    submit: submit,
    initStickyBar: initStickyBar,
    dismissBar: dismissBar
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  CotizarModal.init();
});

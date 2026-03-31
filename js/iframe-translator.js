/*  ═══════════════════════════════════════════════════
    RS Viajes — Iframe Translator
    Fetches Nefertari iframe content, extracts trip data,
    and renders using premium trip-renderer when English.
    Falls back to normal iframe for Spanish.
    ═══════════════════════════════════════════════════ */

var iframeTranslator = (function () {
  'use strict';

  var CORS_PROXY = 'https://api.allorigins.win/get?url=';
  var _originalUrl = '';
  var _containerId = '';
  var _pageType = 'listing'; // 'listing' or 'detail'
  var _cachedHtml = {};
  var _loadTimeout = null;
  var TIMEOUT_MS = 15000; // 15 seconds

  /**
   * Load iframe content.
   * English → fetch + parse + render with tripRenderer
   * Spanish → load normal iframe
   * @param {string} url — the iframe src URL
   * @param {string} containerId — DOM element ID to render into
   * @param {string} [type] — 'listing' or 'detail'
   */
  function load(url, containerId, type) {
    _originalUrl = url;
    _containerId = containerId;
    _pageType = type || (url.includes('/tour/') ? 'detail' : 'listing');

    var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';

    if (lang === 'en') {
      loadPremium(url, containerId);
    } else {
      loadIframe(url, containerId);
    }
  }

  /* Standard iframe load (Spanish) */
  function loadIframe(url, containerId) {
    clearLoadTimeout();
    var el = document.getElementById(containerId);
    if (!el) return;
    // Set container to expand with content
    el.style.height = '100vh';
    el.style.minHeight = '100vh';
    el.style.overflow = 'hidden';
    el.innerHTML = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" allowfullscreen="allowfullscreen" loading="lazy" style="border: none; width: 100%; height: 100%;"></iframe>';
  }

  /* Fetch, parse, and render with tripRenderer (English) */
  function loadPremium(url, containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    // Show loading spinner
    el.innerHTML = '<div class="trip-loading"><div class="trip-loading__spinner"></div><p class="trip-loading__text">Loading trips...</p></div>';
    el.style.height = 'auto';
    el.style.minHeight = '300px';

    // Set timeout — show error if loading takes too long
    clearLoadTimeout();
    _loadTimeout = setTimeout(function() {
      showLoadError(containerId);
    }, TIMEOUT_MS);

    // Check cache
    if (_cachedHtml[url]) {
      clearLoadTimeout();
      renderFromHtml(_cachedHtml[url], containerId);
      return;
    }

    // Fetch via CORS proxy
    fetch(CORS_PROXY + encodeURIComponent(url))
      .then(function (res) {
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        clearLoadTimeout();
        if (!data || !data.contents) throw new Error('Invalid JSON from proxy');
        _cachedHtml[url] = data.contents;
        renderFromHtml(data.contents, containerId);
      })
      .catch(function (err) {
        clearLoadTimeout();
        console.warn('iframeTranslator: fetch failed, falling back to iframe', err);
        loadIframe(url, containerId);
      });
  }

  /* Show error when loading times out */
  function showLoadError(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';
    el.innerHTML = '<div style="text-align:center;padding:60px 20px;font-family:Inter,sans-serif;">' +
      '<i class="fas fa-exclamation-triangle" style="font-size:48px;color:#f39c12;margin-bottom:20px;display:block;"></i>' +
      '<h3 style="color:#1a1a2e;margin-bottom:12px;">' + (lang === 'en' ? 'Unable to Load Content' : 'No se pudo cargar el contenido') + '</h3>' +
      '<p style="color:#666;font-size:15px;max-width:400px;margin:0 auto 24px;">' + (lang === 'en' ? 'The trip data is temporarily unavailable. Please try again or contact us directly.' : 'Los datos del viaje no están disponibles temporalmente. Intenta de nuevo o contáctanos directamente.') + '</p>' +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
      '<button onclick="location.reload()" style="padding:10px 28px;background:linear-gradient(135deg,#0d7377,#14919b);color:#fff;border:none;border-radius:30px;cursor:pointer;font-weight:600;font-size:14px;font-family:Inter,sans-serif;">' + (lang === 'en' ? 'Try Again' : 'Intentar de Nuevo') + '</button>' +
      '<a href="https://wa.me/523125504084" target="_blank" style="padding:10px 28px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;border-radius:30px;text-decoration:none;font-weight:600;font-size:14px;font-family:Inter,sans-serif;display:inline-flex;align-items:center;gap:8px;"><i class="fab fa-whatsapp"></i> WhatsApp</a>' +
      '</div>' +
      '</div>';
    el.style.minHeight = '300px';
  }

  /* Clear the loading timeout */
  function clearLoadTimeout() {
    if (_loadTimeout) {
      clearTimeout(_loadTimeout);
      _loadTimeout = null;
    }
  }

  /* Parse HTML and render with tripRenderer */
  function renderFromHtml(html, containerId) {
    if (typeof tripRenderer === 'undefined') {
      console.warn('iframeTranslator: tripRenderer not loaded, falling back to iframe');
      loadIframe(_originalUrl, containerId);
      return;
    }

    if (_pageType === 'detail') {
      var detail = tripRenderer.parseDetail(html);
      tripRenderer.renderDetail(detail, containerId);
    } else {
      var cards = tripRenderer.parseListingCards(html);
      if (cards.length > 0) {
        tripRenderer.renderCards(cards, containerId);
      } else {
        // If parsing failed, fall back to iframe
        console.warn('iframeTranslator: no cards found, falling back to iframe');
        loadIframe(_originalUrl, containerId);
      }
    }
  }

  /* Re-render on language change */
  function onLangChanged() {
    if (!_originalUrl || !_containerId) return;
    var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';
    if (lang === 'en') {
      loadPremium(_originalUrl, _containerId);
    } else {
      loadIframe(_originalUrl, _containerId);
    }
  }

  // Listen for language changes
  window.addEventListener('langChanged', onLangChanged);

  return { load: load };
})();

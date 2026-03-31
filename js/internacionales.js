window.addEventListener('load', ()=>{
    loadIframe();
});

function loadIframe(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var destino = urlParams.get('destino');

    // If no destination param, show a friendly message instead of 404
    if (!destino) {
        var el = document.getElementById('iframe');
        if (el) {
            var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';
            el.innerHTML = '<div style="text-align:center;padding:80px 20px;font-family:Inter,sans-serif;">' +
                '<i class="fas fa-plane-departure" style="font-size:64px;color:#0d7377;margin-bottom:24px;display:block;"></i>' +
                '<h2 style="color:#1a1a2e;margin-bottom:12px;">' + (lang === 'en' ? 'Select a Destination' : 'Selecciona un Destino') + '</h2>' +
                '<p style="color:#666;font-size:16px;">' + (lang === 'en' ? 'Please choose a destination from the menu above to view available trips.' : 'Por favor elige un destino del menú para ver los viajes disponibles.') + '</p>' +
                '<a href="/" style="display:inline-block;margin-top:24px;padding:12px 32px;background:linear-gradient(135deg,#0d7377,#14919b);color:#fff;border-radius:30px;text-decoration:none;font-weight:600;">' + (lang === 'en' ? 'Back to Home' : 'Volver al Inicio') + '</a>' +
                '</div>';
        }
        return;
    }

    var url = 'https://nefertaritravel.com.mx/sg-' + destino + '/?iframe=yes';
    if (typeof iframeTranslator !== 'undefined') {
        iframeTranslator.load(url, 'iframe');
    } else {
        document.getElementById('iframe').innerHTML = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" allowfullscreen="allowfullscreen" style="border: none; width: 100%; height: 100%;"></iframe>';
    }
}

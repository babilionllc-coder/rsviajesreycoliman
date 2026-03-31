
window.addEventListener('load', ()=>{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var id = urlParams.get('tour');

    // If no tour param, show friendly message
    if (!id) {
        var el = document.getElementById('iframe');
        if (el) {
            var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';
            el.innerHTML = '<div style="text-align:center;padding:80px 20px;font-family:Inter,sans-serif;">' +
                '<i class="fas fa-map-signs" style="font-size:64px;color:#0d7377;margin-bottom:24px;display:block;"></i>' +
                '<h2 style="color:#1a1a2e;margin-bottom:12px;">' + (lang === 'en' ? 'Trip Not Found' : 'Viaje no encontrado') + '</h2>' +
                '<p style="color:#666;font-size:16px;">' + (lang === 'en' ? 'Please select a trip from our listings to view its details.' : 'Por favor selecciona un viaje de nuestros listados para ver sus detalles.') + '</p>' +
                '<a href="/" style="display:inline-block;margin-top:24px;padding:12px 32px;background:linear-gradient(135deg,#0d7377,#14919b);color:#fff;border-radius:30px;text-decoration:none;font-weight:600;">' + (lang === 'en' ? 'Browse All Trips' : 'Ver todos los viajes') + '</a>' +
                '</div>';
        }
        return;
    }

    var url = 'https://nefertaritravel.com.mx/tour/' + id + '/?iframe=yes';
    if (typeof iframeTranslator !== 'undefined') {
        iframeTranslator.load(url, 'iframe', 'detail');
    } else {
        document.getElementById('iframe').innerHTML = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" allowfullscreen="allowfullscreen" style="border: none; width: 100%; height: 100%;"></iframe>';
    }
});

let revista = '';

window.addEventListener('load', ()=>{
    getMagazine();
});    

async function getMagazine(){
    await $.ajax({
        type: "GET", 
        url: conf.api+'getMagazine',
        headers:{
            'Content-Type':'application/json',
            'x-api-key':conf.apikey
        },
        success: function(data) {
            if (data && data.revista) {
                revista = data.revista;
                loadMagazine();
            } else {
                showMagazineError();
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            showMagazineError();
         }
    });
}

function showMagazineError() {
    var lang = (typeof i18n !== 'undefined') ? i18n.getLang() : 'es';
    var el = document.getElementById('iframe');
    if (el) {
        el.innerHTML = '<div style="text-align:center;padding:80px 20px;font-family:Inter,sans-serif;">' +
            '<i class="fas fa-book-open" style="font-size:64px;color:#0d7377;margin-bottom:24px;display:block;"></i>' +
            '<h2 style="color:#1a1a2e;margin-bottom:12px;">' + (lang === 'en' ? 'Magazine Coming Soon' : 'Revista Próximamente') + '</h2>' +
            '<p style="color:#666;font-size:16px;">' + (lang === 'en' ? 'Our digital magazine is being updated. Please check back later or contact us for information.' : 'Nuestra revista digital se está actualizando. Vuelve más tarde o contáctanos para más información.') + '</p>' +
            '<a href="/" style="display:inline-block;margin-top:24px;padding:12px 32px;background:linear-gradient(135deg,#0d7377,#14919b);color:#fff;border-radius:30px;text-decoration:none;font-weight:600;">' + (lang === 'en' ? 'Back to Home' : 'Volver al Inicio') + '</a>' +
            '</div>';
    }
}

function loadMagazine(){
    let html = '<iframe width="100%" height="700px" allow="fullscreen" frameborder="0" loading="lazy" src="https://revista.salonnefertaritravel.com/index.html?pdf='+revista+'"></iframe>'
    document.getElementById('iframe').innerHTML = html;
}


let bestSellers = []
let recents = []
let carrousel = []
let revista ='';
let portada = '';


window.addEventListener('load', ()=>{
    getHome();
});

// Re-render home content on language change
window.addEventListener('langChanged', function() {
  if (carrousel.length > 0) loadCarrusel();
  if (typeof loadMagazine === 'function' && portada) loadMagazine();
});

async function getHome(){
    await $.ajax({
        type: "GET", 
        url: conf.api+'getHome',
        headers:{
            'Content-Type':'application/json',
            'x-api-key':conf.apikey
        },
        success: function(data) {
            bestSellers = data.masvendidos;
            recents = data.novedades;
            carrousel = [];
            carrousel.push(...data.agenciabanner)
            carrousel.push(...data.banner)
            portada = data.portada;
            revista = data.revista;
            loadBestSellers();
            loadCarrusel();
            loadRecents();
            loadMagazine();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (typeof rsToast === 'function') {
              rsToast(i18n.t('trip.err.home'), 'error');
            }
         }
    });

}

function loadCarrusel(){
    let slides=[], indicators=[], html='', activeClass
   for (let i = 0; i < carrousel.length; i++) {
        const item = carrousel[i];
        
        activeClass = i == 0 ? 'active' : '';
        let html = '<div class="carousel-item position-relative '+ activeClass +'" style="min-height: 100vh;">'
        html += '<img class="position-absolute w-100 h-100" src="'+item.imagen+'" alt="'+(item.titulo || '')+' — RS Viajes Rey Colimán" style="object-fit: cover;">'
        html += '<div class="carousel-caption d-flex flex-column align-items-center justify-content-center">'
        html +=    '<div class="p-3" style="max-width: 900px;">'
        html +=        '<h4 class="text-white text-uppercase mb-md-3 animate__animated animate__fadeInDown" style="letter-spacing: 3px;">' + (i18n.t('carousel.tag') === 'carousel.tag' ? 'Tu próximo destino' : i18n.t('carousel.tag')) + '</h4>'
        html +=        '<h1 class="display-3 text-white mb-md-4 animate__animated animate__fadeInDown">' + item.titulo + '</h1>'
        html +=        '<p class="mx-md-5 px-5 animate__animated animate__fadeInUp">' + (item.desc || '') + '</p>'
        if(item.viaje.startsWith('http')){
            html +=        '<a class="btn btn-outline-light py-3 px-4 mt-3 animate__animated animate__fadeInUp" href="'+item.viaje+'">' + i18n.t('carousel.btn') + '</a>'
        }else{
            html +=        '<a class="btn btn-outline-light py-3 px-4 mt-3 animate__animated animate__fadeInUp" href="viaje.html?tour='+item.viaje+'">' + i18n.t('carousel.btn') + '</a>'
        }
        html +=    '</div>'
        html += '</div>'
        html += '</div>'
        slides.push(html);

        activeClass = i == 0 ? 'class="active"' : '';
        html = '<li data-target="#header-carousel" data-slide-to="'+i+'" '+activeClass+'></li>'
        indicators.push(html);

    }

    document.getElementById('carousel-indicators').innerHTML = indicators.join('');
    document.getElementById('carousel-items').innerHTML = slides.join('');
}

async function loadBestSellers(){
    let slides=[];
    for (let i = 0; i < bestSellers.length; i++) {
        const item = bestSellers[i];

        if(item.imagen != null && item.imagen != ""){
        
            let html =   '<div class="service-item position-relative">'
            html +=   '<img class="img-fluid" src="'+item.imagen+'" alt="'+(item.nombre || 'Trip')+' — RS Viajes Rey Colimán" loading="lazy">'
            html +=    '<div class="service-text text-center">'
            html +=      '<div class="w-100 bg-white text-center p-4">'
            html +=          '<a class="btn btn-primary" href="viaje.html?tour='+item.viaje+'">' + i18n.t('best.btn') + '</a>'
            html +=      '</div>'
            html +=     '</div>'
            html +=   '</div>'
    
            slides.push(html);
        }

    }

    const carouselDOM = document.querySelector("#best-sellers");
    carouselDOM.innerHTML = slides.join('');

    $(".best-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        loop: true,
        dots: false,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:3
            },
            992:{
                items:4
            },
            1200:{
                items:5
            }
        }
    });
}

function loadRecents(){
    let slides=[];
    for (let i = 0; i < recents.length; i++) {
        const item = recents[i];

        if(item.imagen != null && item.imagen != ""){
        
            let html =   '<div class="service-item position-relative">'
            html +=   '<img class="img-fluid" src="'+item.imagen+'" alt="'+(item.nombre || 'Trip')+' — RS Viajes Rey Colimán" loading="lazy">'
            html +=    '<div class="service-text text-center">'
            html +=      '<div class="w-100 bg-white text-center p-4">'
            html +=          '<a class="btn btn-primary" href="viaje.html?tour='+item.viaje+'">' + i18n.t('best.btn') + '</a>'
            html +=      '</div>'
            html +=     '</div>'
            html +=   '</div>'
    
            slides.push(html);
        }
    }

    const carouselDOM = document.querySelector("#recents");
    carouselDOM.innerHTML = slides.join('');

      $(".recents-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        loop: true,
        dots: false,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:3
            },
            992:{
                items:4
            },
            1200:{
                items:5
            }
        }
    });

}

function loadMagazine(){

    let html =    '<div class="col-lg-5 d-flex align-items-center justify-content-center mb-5 mb-lg-0">'
    html +=        '<img src="'+portada+'" alt="Portada Revista RS Viajes" class="img-fluid rounded shadow-lg" style="max-height: 550px; object-fit: contain;">'
    html +=    '</div>'
    html +=    '<div class="col-lg-7 d-flex flex-column justify-content-center text-center text-lg-start px-lg-5">'
    html +=        '<h6 class="d-inline-block text-primary text-uppercase py-1 px-2 mb-3 mx-auto mx-lg-0" style="width: fit-content;">' + i18n.t('mag.tag') + '</h6>'
    html +=        '<h1 class="mb-4 text-white">' + i18n.t('mag.title') + '</h1>'
    html +=        '<p class="mb-4 text-white-50" style="font-size: 1.1rem;">' + i18n.t('mag.desc') + '</p>'
    html +=        '<div class="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start pt-2">'
    html +=            '<button onclick="downloadPdf()" class="btn btn-primary px-4 py-2" id="download">' + i18n.t('mag.download') + '</button>'
    html +=            '<a href="revista.html" class="btn btn-outline-light px-4 py-2">' + i18n.t('mag.view') + '</a>'
    html +=        '</div>'
    html +=    '</div>'

    document.getElementById('magazine').innerHTML = html;

}

function downloadPdf(){
    document.getElementById('download').innerHTML = i18n.t('mag.downloading');
    $('#download').prop('disabled', true);

    fetch(revista)
   .then(resp => resp.status === 200 ? resp.blob() : Promise.reject('Error'))
   .then(blob => {
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.style.display = 'none';
     a.href = url;
     a.download = 'revista.pdf';
     document.body.appendChild(a);
     a.click();
     window.URL.revokeObjectURL(url);

     $('#download').prop('disabled', false);
     document.getElementById('download').innerHTML = i18n.t('mag.download');
     if (typeof rsToast === 'function') {
       rsToast(i18n.t('mag.downloaded'), 'success');
     }
   })
   .catch(() => {
     if (typeof rsToast === 'function') {
       rsToast('Error', 'error');
     }
   });
}

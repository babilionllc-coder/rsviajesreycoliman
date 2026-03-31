

window.addEventListener('load', ()=>{
    loadIframe();
});

function loadIframe(){
    var cp = '1c3a85';
    var cs = '6ebbf6';
    var cf = 'FFFFFF';
    
    var url = 'https://iframe.nefertaritravel.com.mx/?destino=salidas-nacionales&moneda=MXN&cp=' + cp + '&cs=' + cs + '&cf=' + cf + '&bw=si';

    var iframeHTML = '<div style="width:100%; max-width:100%;">' +
                     '<iframe src="' + url + '" style="width:100%; height:900px; border:0; display:block;" loading="lazy" allowfullscreen="allowfullscreen"></iframe>' +
                     '</div>';

    document.getElementById('iframe').innerHTML = iframeHTML;
}

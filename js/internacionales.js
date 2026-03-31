window.addEventListener('load', ()=>{
    loadIframe();
});

function loadIframe(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var destino = urlParams.get('destino');

    var cp = '1c3a85';
    var cs = '6ebbf6';
    var cf = 'FFFFFF';
    var destinoParam = destino ? destino : 'salidas-garantizadas';

    var url = 'https://iframe.nefertaritravel.com.mx/?destino=' + destinoParam + '&moneda=USD&cp=' + cp + '&cs=' + cs + '&cf=' + cf + '&bw=si';
    
    var iframeHTML = '<div style="width:100%; max-width:100%;">' +
                     '<iframe src="' + url + '" style="width:100%; height:900px; border:0; display:block;" loading="lazy" allowfullscreen="allowfullscreen"></iframe>' +
                     '</div>';

    document.getElementById('iframe').innerHTML = iframeHTML;
}

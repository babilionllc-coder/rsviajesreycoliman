

window.addEventListener('load', ()=>{
    loadIframe();
});

function loadIframe(){
    var url = 'https://nefertaritravel.com.mx/sn/?iframe=yes';
    if (typeof iframeTranslator !== 'undefined') {
        iframeTranslator.load(url, 'iframe');
    } else {
        document.getElementById('iframe').innerHTML = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" allowfullscreen="allowfullscreen" style="border: none; width: 100%; height: 100%;"></iframe>';
    }
}

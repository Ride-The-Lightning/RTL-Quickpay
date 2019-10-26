$(function () {

  $('document').ready(function () {
    const url = window.location.href;
    if(url.includes('?')) {
      const dataFromURL = parseURL(url);
      invoiceToPay = (dataFromURL.invoice) ? dataFromURL.invoice : '';
      openingSource = (dataFromURL.source) ? dataFromURL.source : '';
    }
    loadModule('Authentication');
  });

  $('#headerClose').click(function () {
    close();
    window.top.close();
  });

  function parseURL(url) {
    var vars = {};
    var hashes = url.split("?")[1];
    var hash = hashes.split('&');
    for (var i = 0; i < hash.length; i++) {
      params=hash[i].split("=");
      vars[params[0]] = params[1];
    }
    return vars;
  }

});

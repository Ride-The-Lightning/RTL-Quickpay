$(function () {
  var browser = (function() { return window.msBrowser || window.browser || window.chrome })();

  $('document').ready(function () {
    const url = window.location.href;
    if(url.includes('?')) {
      const dataFromURL = parseURL(url);
      invoiceToPay = (dataFromURL.invoice) ? dataFromURL.invoice : '';
      openingSource = (dataFromURL.source) ? dataFromURL.source : '';
    }
    browser.storage.sync.get('RTL_SERVER_URL', function (storage) {
      if (storage.RTL_SERVER_URL && storage.RTL_SERVER_URL.trim() != '') {
        callServerAPI('GET', storage.RTL_SERVER_URL.trim() + CONSTANTS.RTL_CONF_URL, '')
        .then(rtlConfigRes => {
          rtlConfig = rtlConfigRes;
          if(rtlConfig.nodes) {
            selNode = rtlConfig.nodes.filter(node => node.index === rtlConfig.selectedNodeIndex)[0];
            if(selNode.settings && selNode.settings.themeMode && selNode.settings.themeColor) {
              $('head').append('<link rel="stylesheet" type="text/css" href="./styles/' + selNode.settings.themeMode + '/' + selNode.settings.themeColor + '.css"></link>');
            } else {
              $('head').append('<link rel="stylesheet" type="text/css" href="./styles/day/purple.css"></link>');
            }
          } else {
            $('head').append('<link rel="stylesheet" type="text/css" href="./styles/day/purple.css"></link>');
          }
        });    
      } else {
        $('head').append('<link rel="stylesheet" type="text/css" href="./styles/day/purple.css"></link>');
      }
    });
    loadModule({ load: CONSTANTS.MODULES.AUTHENTICATION, loadedFrom: CONSTANTS.MODULES.MAIN });
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

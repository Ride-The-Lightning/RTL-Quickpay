$(() => {
  var browser = (function () { return window.msBrowser || window.browser || window.chrome })();
  const url = window.location.href;
  if (url.includes('?')) {
    const dataFromURL = parseURL(url);
    invoiceToPay = (dataFromURL.invoice) ? dataFromURL.invoice : '';
    openingSource = (dataFromURL.source) ? dataFromURL.source : '';
  }
  browser.storage.sync.get('RTL_SERVER_URL', function (storage) {
    if (storage.RTL_SERVER_URL && storage.RTL_SERVER_URL.trim() != '') {
      callServerAPI('GET', storage.RTL_SERVER_URL.trim(), '')
        .then(csrfTokenCheck => {
          callServerAPI('GET', storage.RTL_SERVER_URL.trim() + CONSTANTS.RTL_CONF_URL, '')
            .then(rtlConfigRes => {
              rtlConfig = rtlConfigRes;
              browser.storage.sync.set({ 'SERVER_CONFIG': rtlConfig });
              if (rtlConfig.nodes) {
                selNode = rtlConfig.nodes.filter(node => node.index == rtlConfig.selectedNodeIndex)[0];
                if(selNode && selNode.settings && selNode.settings.themeMode && selNode.settings.themeColor) {
                  $('link[id="themeStyle"]').attr('href', '../assets/themes/' + selNode.settings.themeMode.toLowerCase() + '/' + selNode.settings.themeColor.toLowerCase() + '.css');
                }
              }
            })
            .catch(err => {
              console.error(err);
            });
        })
        .catch(err => {
          console.error(err);
        });
    }
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
      params = hash[i].split("=");
      vars[params[0]] = params[1];
    }
    return vars;
  }
});

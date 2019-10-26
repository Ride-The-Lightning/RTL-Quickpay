if (document) {
  var payReqForContext = '';
 
  browser.runtime.onMessage.addListener((msg, sender) => {
    if (msg.data && msg.source === 'CLICK' && msg.application === 'RTL') {
      browser.windows.create({
        url: browser.runtime.getURL('../quickpay/quickpay.html') + '?invoice=' + msg.data + '&source=' + msg.source,
        type: 'popup',
        width: 563,
        height: 585
      });
    }
    if (msg.data && msg.source === 'CONTEXT' && msg.application === 'RTL') {
      payReqForContext = msg.data;
    }
  });

  function createContextMenu() {
    browser.contextMenus.create({
      id: 'rtl-quickpay',
      title: 'RTL Quickpay',
      contexts: ['selection', 'page'],
      onclick : (info) => {
        if (info.menuItemId === 'rtl-quickpay') {
          browser.windows.create({
            url: browser.runtime.getURL('../quickpay/quickpay.html') + '?invoice=' + payReqForContext + '&source=CONTEXT',
            type: 'popup',
            width: 563,
            height: 585
          });
        }
      }
    });
  }

  createContextMenu();
}
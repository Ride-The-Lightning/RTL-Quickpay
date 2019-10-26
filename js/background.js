var payReqForContext = '';

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.data && msg.source === 'CLICK' && msg.application === 'RTL') {
    chrome.windows.create({
      url: chrome.runtime.getURL('../quickpay/quickpay.html') + '?invoice=' + msg.data + '&source=' + msg.source,
      type: 'popup',
      width: 578,
      height: 575
    });
  }
  if (msg.data && msg.source === 'CONTEXT' && msg.application === 'RTL') {
    payReqForContext = msg.data;
  }
});

function createContextMenu() {
  chrome.contextMenus.create({
    id: 'rtl-quickpay',
    title: 'RTL Quickpay',
    contexts: ['selection', 'page'],
    onclick : (info) => {
      if (info.menuItemId === 'rtl-quickpay') {
        chrome.windows.create({
          url: chrome.runtime.getURL('../quickpay/quickpay.html') + '?invoice=' + payReqForContext + '&source=CONTEXT',
          type: 'popup',
          width: 578,
          height: 575
        });
      }
    }
  });
}

createContextMenu();
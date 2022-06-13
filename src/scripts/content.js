if (document) {
  var browser = require('../shared/browser-polyfill');
  
  document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || !target.closest) { return; }
      const paymentURL = target.closest('[href^="lightning:"]');
      if (paymentURL) {
        const href = paymentURL.getAttribute('href');
        const payReq = href.replace('lightning:', '');
        browser.runtime.sendMessage({data: payReq, source: 'CLICK', application: 'RTL'});
        event.preventDefault();
      }
    });

    document.body.addEventListener('mousedown', event => {
      if (event.button === 2) {
        let payReq = (window.getSelection() || '').toString();
        if (!payReq && event.target) {
          const target = event.target;
          payReq = target.innerText || target.value;
        }
        if (payReq) {
          browser.runtime.sendMessage({data: payReq, source: 'CONTEXT', application: 'RTL'});
        }
      }
    });

  });
}
if (document) {
  var browser = require('webextension-polyfill');

  document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || !target.closest) {
        return;
      }
      const paymentURL = target.closest('[href^="lightning:"]');
      if (paymentURL) {
        const href = paymentURL.getAttribute("href");
        const payReq = href.replace("lightning:", "");
        browser.runtime.sendMessage({
          data: payReq,
          source: "CLICK",
          application: "RTL",
        });
        event.preventDefault();
      }
    });

    document.body.addEventListener("mousedown", (event) => {
      if (event.button === 2) {
        let payReq = (window.getSelection() || "").toString();
        if (!payReq && event.target) {
          const target = event.target;
          payReq = target.innerText || target.value;
        }
        if (payReq) {
          browser.runtime.sendMessage({
            data: payReq,
            source: "CONTEXT",
            application: "RTL",
          });
        }
      }
    });
   

    // WebLN calls that can be executed from the WebLNProvider.
    // Update when new calls are added
    const weblnCalls = [
      "getInfo",
    ];

    // calls that can be executed when webln is not enabled for the current content page
    const disabledCalls = ["enable"];
    
    let isEnabled = false; // store if webln is enabled for this content page
    let callActive = false; // store if a webln is currently active. Used to prevent multiple calls in parallel

    async function init() {
    
      injectScript(); // injects the webln object
    
      // message listener to listen to inpage webln calls
      // those calls get passed on to the background script
      // (the inpage script can not do that directly, but only the inpage script can make webln available to the page)
      window.addEventListener("message", (ev) => {
        // Only accept messages from the current window
        if (ev.source !== window) {
          return;
        }
        if (ev.data && ev.data.application === "RTL" && !ev.data.response) {
          // if a call is active we ignore the request
          if (callActive) {
            console.error("WebLN call already executing");
            return;
          }
          // limit the calls that can be made from webln
          // only listed calls can be executed
          // if not enabled only enable can be called.
          const availableCalls = isEnabled ? weblnCalls : disabledCalls;
          if (!availableCalls.includes(ev.data.action)) {
            console.error("Function not available. Is the provider enabled?");
            return;
          }
    
          const messageWithOrigin = {
            action: `webln/${ev.data.action}`, // every webln call must be scoped under `webln/` we do this to indicate that those actions are callable from the websites
            args: ev.data.args,
            application: "RTL",
            public: true, // indicate that this is a public call from the content script
            prompt: true,
            origin: getOriginData(),
          };
          const replyFunction = (response) => {
            callActive = false; // reset call is active
            // if it is the enable call we store if webln is enabled for this content script
            if (ev.data.action === "enable") {
              isEnabled = response.data?.enabled;
            }
            window.postMessage(
              {
                application: "RTL",
                response: true,
                data: response,
              },
              "*" // TODO use origin
            );
          };
          callActive = true;
          return browser.runtime
            .sendMessage(messageWithOrigin)
            .then(replyFunction)
            .catch(replyFunction);
        }
      });
    }

    init();
     
  });
}

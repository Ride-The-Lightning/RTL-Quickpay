if (document) {

  var browser = require('../shared/browser-polyfill');
  
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

    // insert webln
    var script = document.createElement("script");
    script.src = browser.runtime.getURL("webln-bundle.js");
    (document.head || document.documentElement).appendChild(script);

    // communicate with webln
    var _blocked = null; // blocked status cache
    window.addEventListener("message", (event) => {
      // only accept messages from the current window
      if (event.source !== window) return;
      if (!event.data || ev.data.application !== "RTL" || event.data.response)
        return;

      let origin = getOriginData();

      let { type, ...extra } = event.data;
      let action = {
        ...extra,
        type,
        origin,
      };

      Promise.resolve()
      .then(() => {
        if (ev.data.getBlocked) {
          // return blocked status for this site
          if (_blocked !== null) return _blocked // cached

          // it's always blocked if the user has no options
          return rpcParamsAreSet().then(ok => {
            if (!ok) throw new Error('Lightning RPC params are not set.')

            return browser.runtime
              .sendMessage({
                getBlocked: true,
                domain: origin.domain
              })
              .then(blocked => {
                _blocked = blocked
                return blocked
              })
          })
        } else {
          // default: an action or prompt
          console.log(`[RTL]: ${type} ${structuredprint(extra)} ${structuredprint(origin)}`)

          switch (type) {
            case REQUEST_GETINFO:
              return browser.runtime.sendMessage({
                rpc: {getInfo: []}
              })
            default:
              return null
          }
        }
      })
      .then(earlyResponse => {
        if (earlyResponse !== null && earlyResponse !== undefined) {
          // we have a response already. end here.
          return earlyResponse
        } else {
          // proceed to call the background page
          // and prompt the user if necessary
          return browser.runtime.sendMessage({setAction: action})
        }
      })
      .then(response => {
        window.postMessage(
          {response: true, application: 'RTL', data: response},
          '*'
        )
      })
      .catch(err => {
        window.postMessage(
          {
            response: true,
            application: 'RTL',
            error: err ? err.message || err : err
          },
          '*'
        )
      })
    });
  });
}

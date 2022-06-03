if (document) {
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
    });
  });
}

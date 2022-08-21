"use strict";

function getOriginData() {
  return {
    domain: getDomain(),
    name: getName().split(/\W[^\w ]\W/)[0],
    icon: getIcon()
  }

  function getDomain() {
    var domain = window.location.host
    if (domain.slice(0, 4) === 'www.') {
      domain = domain.slice(4)
    }
    return domain
  }

  function getName() {
    let nameMeta = document.querySelector(
      'head > meta[property="og:site_name"]'
    )
    if (nameMeta) return nameMeta.content

    let titleMeta = document.querySelector('head > meta[name="title"]')
    if (titleMeta) return titleMeta.content

    return document.title
  }

  function getIcon() {
    let allIcons = Array.from(
      document.querySelectorAll('head > link[rel="icon"]')
    ).filter(icon => !!icon.href)

    if (allIcons.length) {
      let href = allIcons.sort((a, b) => {
        let aSize = parseInt(a.getAttribute('sizes') || '0', 10)
        let bSize = parseInt(b.getAttribute('sizes') || '0', 10)
        return bSize - aSize
      })[0].href
      return makeAbsoluteUrl(href)
    }

    // Try for favicon
    let favicon = document.querySelector('head > link[rel="shortcut icon"]')
    if (favicon) return makeAbsoluteUrl(favicon.href)

    // fallback to default favicon path, let it be replaced in view if it fails
    return `${window.location.origin}/favicon.ico`
  }

  function makeAbsoluteUrl(path) {
    return new URL(path, window.location.origin).href
  }
}

function loadModule(params) {
  let newModule = {};
  switch (params.load) {
    case CONSTANTS.MODULES.AUTHENTICATION:
      newModule = new Authentication(params);
      break

    case CONSTANTS.MODULES.PAYMENT:
      newModule = new Payment(params);
      break

    case CONSTANTS.MODULES.ERROR:
      newModule = new Error(params);
      break

    case CONSTANTS.MODULES.STATUS:
      newModule = new Status(params);
      break

    default:
      break;
  }
  pageContainer.focus();
  newModule.render();
  newModule.initEvents();
}

function formatNumberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const utils = {
  call: (action, args, overwrites) => {
      return browser.runtime
          .sendMessage(Object.assign({ application: "RTL", prompt: true, action: action, args: args, origin: { internal: true } }, overwrites))
          .then((response) => {
          if (response.error) {
              toast.error(response.error);
              throw new Error(response.error);
          }
          return response.data;
      });
  },
  notify: (options) => {
      const notification = Object.assign({ type: "basic", iconUrl: "assets/icons/alby_icon_yellow_48x48.png" }, options);
      return browser.notifications.create(notification);
  },
  base64ToHex: (str) => {
      const hex = [];
      for (let i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")); i < bin.length; ++i) {
          let tmp = bin.charCodeAt(i).toString(16);
          if (tmp.length === 1)
              tmp = "0" + tmp;
          hex[hex.length] = tmp;
      }
      return hex.join("");
  },
  publishPaymentNotification: (message, data) => {
      let status = "success"; 
      if ("error" in data.response) {
          status = "failed";
      }
      PubSub.publish(`ln.sendPayment.${status}`, {
          response: data.response,
          details: data.details,
          paymentRequestDetails: data.paymentRequestDetails,
          origin: message.origin,
      });
  },
};
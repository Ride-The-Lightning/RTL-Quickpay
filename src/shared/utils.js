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

const defaultRpcParams = {
  kind: 'lightningd',
  endpoint: 'http://localhost:3000/',
  serverToken: '',
}

export function getRpcParams() {
  return browser.storage.local.get(defaultRpcParams)
}

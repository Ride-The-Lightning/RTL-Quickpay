"use strict";

function callServerAPI(method, url, serverToken, requestData) {
  return $.ajax({
    url: url,
    headers: { 'Authorization': 'Bearer ' + serverToken, 'Content-Type': 'application/json' },
    type: method,
    data: requestData
  });  
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

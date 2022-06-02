"use strict";

function callServerAPI(method, url, serverToken, requestData) {
  return $.ajax({
    cache: false,
    url: url,
    headers: { 'Authorization': 'Bearer ' + serverToken, 'Content-Type': 'application/json', 'XSRF-TOKEN': csrfToken },
    method: method,
    data: requestData,
    success: (data, resStatus, res) => {
      if (res.getResponseHeader('XSRF-TOKEN')) {
        csrfToken = res.getResponseHeader('XSRF-TOKEN');
      }
    },
    error: (error, resStatus, res) => {
      console.error(error);
    }
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

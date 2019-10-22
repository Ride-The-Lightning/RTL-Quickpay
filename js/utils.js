"use strict";

function callServerAPI(method, url, serverToken, requestData) {
  if(method == 'POST' && url.includes('channels/transactions')) {
    return $.ajax({
      url: url,
      headers: { 'Authorization': 'Bearer ' + serverToken },
      type: method,
      contentType:"application/json; charset=utf-8",
      data: requestData
    });  
  } else {
    return $.ajax({
      url: url,
      headers: { 'Authorization': 'Bearer ' + serverToken },
      type: method,
      data: requestData
    });
  }
}

function loadModule(moduleName, params) {
  let newModule = {};
  switch (moduleName.toUpperCase()) {
    case 'AUTHENTICATION':
      newModule = new Authentication();
      break

    case 'PAYMENT':
      newModule = new Payment();
      break

    case 'ERROR':
      newModule = new Error(params);
      break

    case 'STATUS':
      newModule = new Status(params);
      break

    default:
      break;
  }
  pageContainer.focus();
  newModule.render();
  newModule.initEvents();
}

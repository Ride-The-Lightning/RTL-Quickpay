authenticationHtml = `
  <div id="authentication" class="page-container">
    <h6 class="card-subtitle">RTL Server URL:</h6>
    <input type="text" class="form-control" id="serverUrl" placeholder="Configure server URL to start quick pay" tabindex="3">
    <p id="configError" class="show-error">Please enter complete url including the protocol (http Or https).</p>
    <p id="configMsg" class="show-config-msg">Server URL configured successfully.</p>
    <div class="d-flex justify-content-start mt-2">
      <button id="configBtn" type="button" class="btn btn-primary mt-2" tabindex="4" disabled>Save URL</button>
    </div>
    <hr class="my-4">
    <h6 class="card-subtitle">Password:</h6>
    <input type="password" class="form-control" id="password" tabindex="5">
    <div class="d-flex justify-content-start mt-2">
      <button id="authBtn" type="button" class="btn btn-primary mt-2" tabindex="6" disabled>Login</button>
    </div>
  </div>`;

let Authentication = function (params) {
  this.loadedFrom = params.loadedFrom;
};

Authentication.prototype.initEvents = function () {
  "use strict";
  var browser = (function() { return window.msBrowser || window.browser || window.chrome })();
  onPageLoad();

  function onPageLoad() {
    browser.storage.sync.get('RTL_SERVER_URL', function (storage) {
      if (storage.RTL_SERVER_URL && storage.RTL_SERVER_URL.trim() != '') {
        RTLServerURL = storage.RTL_SERVER_URL;
        $('#serverUrl').val(RTLServerURL);
        $('#password').focus();
      } else {
        $('#authBtn').attr('disabled', true);
        $('#password').attr('disabled', true);
        $('#serverUrl').focus();
      }
    });
  }

  $('#serverUrl').keyup(function () {
    event.preventDefault();
    var surl = $('#serverUrl').val();
    if (surl && surl != '') {
      if (!CONSTANTS.URL_REGEX.test(surl)) {
        $('#configError').show('slow');
      } else {
        $('#configError').hide('slow');
        $('#configBtn').removeAttr('disabled');
      }
    } else {
      $('#configBtn').attr('disabled', true);
    }
    if(event.code == 'Enter') {
      $('#configBtn').click();
    }
  });

  $('#configBtn').click(function () {
    var surl = $('#serverUrl').val();
    if (surl.lastIndexOf('/') == (surl.length - 1)) { surl = surl.slice(0, surl.length - 1); }
    if (surl.lastIndexOf('/api') == (surl.length - 4)) { surl = surl.slice(0, surl.length - 4); }
    if (surl.lastIndexOf('/rtl') == (surl.length - 4)) { surl = surl.slice(0, surl.length - 4); }
    browser.storage.sync.set({ 'RTL_SERVER_URL': surl }, function (storage) {
      RTLServerURL = surl;
      $('#serverUrl').val(surl);
      $('#configMsg').show('slow');
      $('#password').removeAttr('disabled');
      setTimeout(() => { $('#configMsg').hide('slow'); }, 2000);
      callServerAPI('GET', surl + CONSTANTS.RTL_CONF_URL, '')
      .then(rtlConfigRes => {
        rtlConfig = rtlConfigRes;
        browser.storage.sync.set({ 'SERVER_CONFIG': rtlConfig });          
      });
    });
  });

  $('#password').on('keyup', function () {
    event.preventDefault();
    if (!event.altKey && !event.ctrlKey && event.code != 'Tab' && $('#password').val().trim() != '') {
      $('#authBtn').removeAttr('disabled');
      if(event.code == 'Enter') {
        $('#authBtn').click();
      }
    }
  });

  $('#authBtn').on('click', function () {
    $('#authBtn').html(CONSTANTS.SPINNER_BTN);
    $('#spinnerBtnMsg').text('Logging in...');
    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update($('#password').val());
    var hashedPassword = shaObj.getHash("HEX");
    callServerAPI('POST', RTLServerURL + CONSTANTS.AUTH_URL, '', JSON.stringify({ 'authenticateWith': 'PASSWORD', 'authenticationValue': hashedPassword }))
    .then(tokenObjFromAPI => {
      if (tokenObjFromAPI.token) {
        serverToken = tokenObjFromAPI.token;
        loadModule({ load: CONSTANTS.MODULES.PAYMENT, loadedFrom: CONSTANTS.MODULES.AUTHENTICATION });
      } else {
        let err = {message: 'Server Connection or Authentication Failed!', error: 'Unable to connect to the server. Please ensure that, server url and password are correct.'};
        loadModule({ load: CONSTANTS.MODULES.ERROR, loadedFrom: CONSTANTS.MODULES.AUTHENTICATION, error: err });
      }
      $('#authBtn').html('Login');
    })
    .catch(err => {
      $('#authBtn').html('Login');
      loadModule({ load: CONSTANTS.MODULES.ERROR, loadedFrom: CONSTANTS.MODULES.AUTHENTICATION, error: err.responseJSON });
    });
  });
};

Authentication.prototype.render = function () {
  pageContainer.html(authenticationHtml);
};
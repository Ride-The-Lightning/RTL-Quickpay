var errorHtml = `
  <div id="error" class="page-container">
    <div class="alert alert-danger" role="alert">
      <strong><h6 id="errorTitle">Server Connection Failed!</h6></strong>
      <span id="errorMsg">Unable to connect to the server. Please ensure that, server url and password are correct.</span>
    </div>
    <div class="d-flex justify-content-start mt-2">
      <button id="backBtn" type="button" class="btn btn-outline-secondary" tabindex="0">Back</button>                                
    </div>
  </div>
`;

let Error = function (params) {
  this.errorData = params[0];
  this.lastLoaded = params[1];
};

Error.prototype.initEvents = function () {
  "use strict";
  let self = this;
  onPageLoad();

  function onPageLoad() {
    if(self.errorData.error) {
      if (typeof self.errorData.error != 'string') {
        self.errorData.error = JSON.stringify(self.errorData.error, null, 2);
      }
      $('#errorMsg').text(self.errorData.error);
    }
    if(self.errorData.message) {
      $('#errorTitle').text(self.errorData.message);
    }
  }

  $('#backBtn').click(function () {
    loadModule(self.lastLoaded);
  });

};

Error.prototype.render = function () {
  $('#pageContainer').html(errorHtml);
};
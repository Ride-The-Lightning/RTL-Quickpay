var statusHtml = `
  <div id="status" class="page-container">
    <h6 id="paymentStatusTitle" class="card-title form-control">Payment Status:</h6>
    <div class="form-control mt-2 pay-status-details" id="paymentStatusMsg"></div>
    <div class="d-flex justify-content-start mt-4">
      <button id="closeBtn" type="submit" class="btn btn-primary" tabindex="12">Done</button>
    </div>
  </div>
`;

let Status = function (data) {
  this.statusData = data;
};

Status.prototype.initEvents = function () {
  "use strict";
  let self = this;
  onPageLoad();

  function onPageLoad() {
    console.warn(self);
    if (self.statusData && self.statusData.status) {
      if (self.statusData.status == 'ERROR') {
        $('#paymentStatusMsg').addClass('invalid-border');
      }
      $('#paymentStatusTitle').text(self.statusData.title);
      $('#paymentStatusMsg').html(self.statusData.message);
    }
  }

  $('#closeBtn').click(function () { 
    close();
    window.top.close();
  });

  pageContainer.keyup(function(event) {
    event.preventDefault();
    if(event.code == 'Enter') {
      $('#closeBtn').click();
    }
  });

};

Status.prototype.render = function () {
  pageContainer.html(statusHtml);
};
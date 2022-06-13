var statusHtml='\n  <div id="status" class="page-container">\n    <h6 id="paymentStatusTitle" class="card-title form-control">Payment Status:</h6>\n    <div class="form-control mt-2 pay-status-details" id="paymentStatusMsg"></div>\n    <div class="d-flex justify-content-start mt-4">\n      <button id="closeBtn" type="submit" class="btn btn-primary" tabindex="12">Done</button>\n    </div>\n  </div>\n';let Status=function(t){this.statusData=t};Status.prototype.initEvents=function(){"use strict";let t=this;t.statusData&&t.statusData.status&&("ERROR"==t.statusData.status&&$("#paymentStatusMsg").addClass("invalid-border"),$("#paymentStatusTitle").text(t.statusData.title),$("#paymentStatusMsg").html(t.statusData.message)),$("#closeBtn").click((function(){close(),window.top.close()})),pageContainer.keyup((function(t){t.preventDefault(),"Enter"==t.code&&$("#closeBtn").click()}))},Status.prototype.render=function(){pageContainer.html(statusHtml)};
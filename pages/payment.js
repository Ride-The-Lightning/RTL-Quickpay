var paymentHtml = `
  <div id="payment" class="page-container">
  <h6>Select Node:</h6>
  <select class="form-control" id="selectNode" tabindex="5"></select>
  <h6 class="card-title mt-2">Invoice:</h6>
    <textarea type="text" class="form-control" id="invoice" placeholder="Invoice" rows="5" tabindex="6"></textarea>
  <div class="form-control mt-2 pay-details" id="paymentDetails"></div>
  <div class="d-flex justify-content-start mt-2">
    <button id="sendPaymentBtn" type="button" class="btn btn-outline-primary mr-2" tabindex="7" disabled>Pay</button>
      <button id="clearPaymentBtn" type="button" class="btn btn-outline-secondary" tabindex="8">Clear</button>
    </div>
  </div>`;

let Payment = function () {};

Payment.prototype.initEvents = function () {
  "use strict";
  onPageLoad();

  function onPageLoad() {
    callServerAPI('GET', RTLServerURL + CONSTANTS.RTL_CONF_URL, serverToken)
    .then(rtlConfigRes => {
      rtlConfig = rtlConfigRes;
      addNodeOptionsInSelect(rtlConfig);
    })
    .catch(err => {
      loadModule('Error', [err.responseJSON, 'Payment']);
    });
  }

  $('#sendPaymentBtn').click(function () {
    $('#sendPaymentBtn').html(CONSTANTS.SPINNER_BTN);
    let reqData = {};
    let invoiceVal = $('#invoice').val();
    let final_url = '';
    if (selectNodeImplementation != 'LND') {
      reqData = { 'invoice': invoiceVal };
      final_url = RTLServerURL + CONSTANTS.API_URL.CL.SEND_PAYMENT;
    } else {
      reqData = { 'paymentReq': invoiceVal };
      final_url = RTLServerURL + CONSTANTS.API_URL.LND.SEND_PAYMENT;
    }
    callServerAPI('POST', final_url, serverToken, reqData)
    .then(data => {
      loadModule('Status', { status: 'SUCCESS', title: 'Payment successful:', message: createPaymentStatusHTML('SUCCESS', selectNodeImplementation, data) });
      $('#sendPaymentBtn').html('Pay');
    })
    .catch(err => {
      loadModule('Status', { status: 'ERROR', title: 'Payment failed:', message: createPaymentStatusHTML('ERROR', selectNodeImplementation, err.responseJSON) });
      $('#sendPaymentBtn').html('Pay');
    });
  });

  $('#selectNode').change(function () {
    if (rtlConfig && rtlConfig.nodes.length > 0) {
      $('#paymentDetails').html(CONSTANTS.SPINNER);
      $('#spinnerMessage').text('Fetching Information...')
      $('#invoice').val('');
      $('#paymentDetails').removeClass('invalid-border');
      var newSelNode = $('#selectNode').val();
      var filteredNode = rtlConfig.nodes.filter(node => { return node.index == newSelNode; })[0];
      selectNodeImplementation = (filteredNode.lnImplementation && filteredNode.lnImplementation != '') ? filteredNode.lnImplementation.toUpperCase() : 'LND';
      callServerAPI('POST', RTLServerURL + CONSTANTS.UPDATE_SEL_NODE_URL, serverToken, { 'selNodeIndex': newSelNode })
      .then(selNodeResponse => {
        let final_url = '';
        if (selectNodeImplementation != 'LND') {
          final_url = RTLServerURL + CONSTANTS.API_URL.CL.GET_INFO;
        } else {
          final_url = RTLServerURL + CONSTANTS.API_URL.LND.GET_INFO;
        }
        callServerAPI('GET', final_url, serverToken)
          .then(getInfoResponse => {
            $('#paymentDetails').html('');
          })
          .catch(err => {
            loadModule('Error', [err.responseJSON, 'Payment']);
          });
      })
      .catch(err => {
        loadModule('Error', [err.responseJSON, 'Payment']);
      });
    }
  });
  
  $('#invoice').keyup(function (event) {
    var invoiceVal = $('#invoice').val();
    if (!event.altKey && !event.ctrlKey && event.code != 'Tab' && invoiceVal.trim() != '') {
      $('#paymentDetails').html(CONSTANTS.SPINNER);
      let final_url = '';
      if (selectNodeImplementation != 'LND') {
        final_url = RTLServerURL + CONSTANTS.API_URL.CL.GET_PAYMENT_DETAILS + '/' + invoiceVal;
      } else {
        final_url = RTLServerURL + CONSTANTS.API_URL.LND.GET_PAYMENT_DETAILS + '/' + invoiceVal;
      }
      callServerAPI('GET', final_url, serverToken)
      .then(paymentDetailsResponse => {
        $('#paymentDetails').html(createPaymentDetailsHTML('SUCCESS', selectNodeImplementation, paymentDetailsResponse));
        $('#paymentDetails').removeClass('invalid-border');
        $('#sendPaymentBtn').removeAttr('disabled');
      }).catch(err => {
        $('#paymentDetails').html(createPaymentDetailsHTML('ERROR', selectNodeImplementation, err.responseJSON));
        $('#paymentDetails').addClass('invalid-border');
        $('#sendPaymentBtn').attr('disabled', true);
      });
    }
  });

  $('#clearPaymentBtn').click(function () {
    $('#invoice').val('');
    $('#paymentDetails').html('');
    $('#paymentDetails').removeClass('invalid-border');
    $('#sendPaymentBtn').attr('disabled', true);
  });

  function addNodeOptionsInSelect(rtlConfig) {
    var selectNode = $('#selectNode');
    if (rtlConfig.nodes.length) {
      if (rtlConfig.nodes.length === 1) {
        selectNode.append($('<option>', {
          value: rtlConfig.nodes[0].index,
          text: (rtlConfig.nodes[0].lnNode && rtlConfig.nodes[0].lnNode.toUpperCase() != 'SINGLENODE') ? rtlConfig.nodes[0].lnNode : 'LN Node'
        }));
        $("select > option[value=1]").prop("selected", true);
        selectNodeImplementation = 'LND';
      } else {
        for (var i = 0; i < rtlConfig.nodes.length; i++) {
          selectNode.append($('<option>', {
            value: rtlConfig.nodes[i].index,
            text: rtlConfig.nodes[i].lnNode
          }));
          if (rtlConfig.nodes[i].index == rtlConfig.selectedNodeIndex) {
            $("select > option[value=" + rtlConfig.selectedNodeIndex + "]").prop("selected", true);
            selectNodeImplementation = (rtlConfig.nodes[i].lnImplementation && rtlConfig.nodes[i].lnImplementation != '') ? rtlConfig.nodes[i].lnImplementation.toUpperCase() : 'LND';
          }
        }
      }
      selectNode.val(rtlConfig.selectedNodeIndex).trigger('change'); //Do Not Remove: It sets request options from get_info
    }
  }
  
  function createPaymentDetailsHTML(status, selectNodeImplementation, paymentDetailsResponse) {
    if (status == 'SUCCESS') {
      if (selectNodeImplementation == 'LND' && paymentDetailsResponse.destination) {
        return '<div class="row"><div class="col-3"><p>Destination: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.destination +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.description +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Amount: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.num_satoshis +
          ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p>Expiry: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.timestamp_str +
          '</p></div></div>';
      } else if (selectNodeImplementation != 'LND' && paymentDetailsResponse.payee) {
        return '<div class="row"><div class="col-3"><p>Destination: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.payee +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.description +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Amount: </p></div><div class="col-9"><p>'
          + parseInt(paymentDetailsResponse.msatoshi / 1000) +
          ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p>Expiry: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.expire_at_str +
          '</p></div></div>';
      }
    } else {
      if (selectNodeImplementation != 'LND') {
        return '<div class="row"><div class="col-3"><p>Error: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.message +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Code: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.error.error.code +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.error.error.message +
          '</p></div></div>';
      } else {
        return '<div class="row"><div class="col-3"><p>Error: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.message +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Code: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.error.code +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + ((paymentDetailsResponse.error.error) ? paymentDetailsResponse.error.error : paymentDetailsResponse.error.errno) +
          '</p></div></div>';
      }
    }
  }
  
  function createPaymentStatusHTML(status, selectNodeImplementation, paymentStatusResponse) {
    if (status == 'SUCCESS') {
      if (selectNodeImplementation != 'LND') {
        return '<div class="row"><div class="col-3"><p>Preimage: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.payment_preimage +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Payment hash: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.payment_hash +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Amount paid: </p></div><div class="col-9"><p>'
          + parseInt(paymentStatusResponse.msatoshi_sent / 1000) +
          ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p>Total fee: </p></div><div class="col-9"><p>'
          + (paymentStatusResponse.msatoshi_sent - paymentStatusResponse.msatoshi) +
          ' mSats</p></div></div><hr><div class="row"><div class="col-3"><p>Status: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.status +
          '</p></div></div><hr>';
      } else {
        return '<div class="row"><div class="col-3"><p>Preimage: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.payment_preimage +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Payment hash: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.payment_hash +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Amount paid: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.payment_route.total_amt +
          ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p>Total fee: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.payment_route.total_fees_msat +
          ' mSats</p></div></div><hr><div class="row"><div class="col-3"><p>Total hops: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.payment_route.hops.length +
          '</p></div></div><hr>';
      }
    } else {
      if (selectNodeImplementation != 'LND') {
        return '<div class="row"><div class="col-3"><p>Error: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.message +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Code: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.error.code +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.error.message +
          '</p></div></div>';
      } else {
        return '<div class="row"><div class="col-3"><p>Error: </p></div><div class="col-9"><p>'
          + paymentStatusResponse.message +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Code: </p></div><div class="col-9"><p>'
          + ((paymentStatusResponse.error.code) ? paymentStatusResponse.error.code : paymentStatusResponse.error) +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + ((paymentStatusResponse.error.error) ? paymentStatusResponse.error.error : paymentStatusResponse.error) +
          '</p></div></div>';
      }
    }
  }
  
};

Payment.prototype.render = function () {
  $('#pageContainer').html(paymentHtml);
};
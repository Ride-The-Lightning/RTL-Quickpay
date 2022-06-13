var paymentHtml = `
  <div id="payment" class="page-container">
    <h6>Select Node:</h6>
    <div class="form-group" id="selectNodeRadio"></div>
    <h6 class="card-title">Invoice:</h6>
    <textarea type="text" class="form-control" id="invoice" rows="5" tabindex="8"></textarea>
    <div class="form-control mt-4 pay-details" id="paymentDetails"></div>
    <div class="d-flex justify-content-start mt-4">
      <button id="clearPaymentBtn" type="reset" class="btn btn-outline-primary mr-2" tabindex="10">Clear</button>
      <button id="sendPaymentBtn" type="submit" class="btn btn-primary" tabindex="11" disabled>Pay</button>
    </div>
  </div>`;

let Payment = function (params) {
  this.loadedFrom = params.loadedFrom;
};

Payment.prototype.initEvents = function () {
  "use strict";
  var self = this;
  var decodedPaymentResponse = {};
  var browser = (function() { return window.msBrowser || window.browser || window.chrome })();
  onPageLoad();

  function onPageLoad() {
    callServerAPI('GET', RTLServerURL + CONSTANTS.RTL_CONF_URL, serverToken)
    .then(rtlConfigRes => {
      rtlConfig = rtlConfigRes;
      addRadioBtnsForNodes(rtlConfig);
      if (self.loadedFrom !== 'ERROR') {
        setTimeout(function(){
          $(document).on('click','.node-list-block',function(){
            $("#selectNodeRadioInput" + $(this).attr("id").substring(5)).prop( "checked", true );            
            $("#selectNodeRadio").trigger('change');
          });
        },1000);        
        $("#selectNodeRadioInput" + rtlConfig.selectedNodeIndex).prop( "checked", true ); //Do Not Remove: It sets request options from get_info
        $("#selectNodeRadio").trigger('change'); //Do Not Remove: It sets request options from get_info
      } else {
        $('#invoice').val('Either fix the connection for selected node or select another node to pay');
        $('#invoice').attr('disabled', true);
      }
    })
    .catch(err => {
      loadModule({ load: CONSTANTS.MODULES.ERROR, loadedFrom: CONSTANTS.MODULES.PAYMENT, error: err.responseJSON});
    });
  }

  $('#sendPaymentBtn').click(function () {
    $('#sendPaymentBtn').html(CONSTANTS.SPINNER_BTN);
    let reqData = {};
    let invoiceVal = $('#invoice').val();
    let invoiceAmount = $('#invoiceAmount').val();
    let final_url = '';
    switch (selectNodeImplementation) {
      case 'CLN':
        if (!self.decodedPaymentResponse.msatoshi && invoiceAmount && invoiceAmount > 0) {
          reqData = { "paymentType": "INVOICE", "invoice": invoiceVal, "amount": parseInt(invoiceAmount*1000) };
        } else {
          reqData = { "paymentType": "INVOICE", "invoice": invoiceVal };
        }
        final_url = RTLServerURL + CONSTANTS.API_URL.CLN.SEND_PAYMENT;
        break;
      case 'ECL':
        if (!self.decodedPaymentResponse.amount && invoiceAmount && invoiceAmount > 0) {
          reqData = { "invoice": invoiceVal, "amountMsat": parseInt(invoiceAmount*1000) };
        } else {
          reqData = { "invoice": invoiceVal };
        }
        final_url = RTLServerURL + CONSTANTS.API_URL.ECL.SEND_PAYMENT;
        break;
      default:
        if (!self.decodedPaymentResponse.num_satoshis && invoiceAmount && invoiceAmount > 0) {
          reqData = {paymentDecoded: self.decodedPaymentResponse};
          reqData.paymentDecoded.num_satoshis = invoiceAmount;
        } else {
          reqData = { "paymentReq": invoiceVal };
        }
        final_url = RTLServerURL + CONSTANTS.API_URL.LND.SEND_PAYMENT;
        break;
    }
    callServerAPI('POST', final_url, serverToken, JSON.stringify(reqData))
    .then(data => {
      loadModule({ load: CONSTANTS.MODULES.STATUS, loadedFrom: CONSTANTS.MODULES.PAYMENT, status: 'SUCCESS', title: 'Payment status:', message: createPaymentStatusHTML('SUCCESS', selectNodeImplementation, data.paymentResponse ? data.paymentResponse : data)});
      $('#sendPaymentBtn').html('Pay');
    })
    .catch(err => {
      loadModule({ load: CONSTANTS.MODULES.STATUS, loadedFrom: CONSTANTS.MODULES.PAYMENT, status: 'ERROR', title: 'Payment failed:', message: createPaymentStatusHTML('ERROR', selectNodeImplementation, err.responseJSON)});
      $('#sendPaymentBtn').html('Pay');
    });
  });

  $('#selectNodeRadio').on('change', function(){
    if (rtlConfig && rtlConfig.nodes.length > 0) {
      $('#paymentDetails').html(CONSTANTS.SPINNER);
      $('#spinnerMessage').text('Fetching Information...')
      $('#invoice').val('');
      $('#invoice').attr('disabled', false);
      $('#paymentDetails').removeClass('invalid-border');
      var newSelNodeIndex = -1;
      var filteredNode = {};
      var final_url = '';
      if(rtlConfig.nodes.length == 1) {
        filteredNode = rtlConfig.nodes[0];
        selectNodeImplementation = rtlConfig.nodes[0].lnImplementation ? rtlConfig.nodes[0].lnImplementation : 'LND';
        switch (selectNodeImplementation) {
          case 'CLN':
            final_url = RTLServerURL + CONSTANTS.API_URL.CLN.GET_INFO;
            break;
          case 'ECL':
            final_url = RTLServerURL + CONSTANTS.API_URL.ECL.GET_INFO;
            break;
          default:
            final_url = RTLServerURL + CONSTANTS.API_URL.LND.GET_INFO;
            break;
        }
        callServerAPI('GET', final_url, serverToken)
          .then(getInfoResponse => {
            if(invoiceToPay.trim() !== '') {
              $('#invoice').val(invoiceToPay);
              $('#invoice').focus();
              var e = $.Event('keyup');
              e.keyCode = 13;
              $('#invoice').trigger(e);
            } else {
              $('#paymentDetails').html('');
            }
          })
          .catch(err => {
            loadModule({ load: CONSTANTS.MODULES.ERROR, loadedFrom: CONSTANTS.MODULES.PAYMENT, error: err.responseJSON});
          });
      } else {
        newSelNodeIndex = +$("input[name='selectNodeRadioInput']:checked").val();
        filteredNode = rtlConfig.nodes.filter(node => { return node.index == newSelNodeIndex; })[0];
        selectNodeImplementation = (filteredNode.lnImplementation && filteredNode.lnImplementation != '') ? filteredNode.lnImplementation.toUpperCase() : 'LND';
        callServerAPI('POST', RTLServerURL + CONSTANTS.UPDATE_SEL_NODE_URL, serverToken, JSON.stringify({ 'currNodeIndex': newSelNodeIndex, 'prevNodeIndex': selNode.index }))
        .then(selNodeResponse => {
          selNode = rtlConfig.nodes.filter(node => node.index == newSelNodeIndex)[0];
          updateStyles(newSelNodeIndex);
          switch (selectNodeImplementation) {
            case 'CLN':
              final_url = RTLServerURL + CONSTANTS.API_URL.CLN.GET_INFO;
              break;
            case 'ECL':
              final_url = RTLServerURL + CONSTANTS.API_URL.ECL.GET_INFO;
              break;
            default:
              final_url = RTLServerURL + CONSTANTS.API_URL.LND.GET_INFO;
              break;
          }
          callServerAPI('GET', final_url, serverToken)
            .then(getInfoResponse => {
              if(invoiceToPay.trim() !== '') {
                $('#invoice').val(invoiceToPay);
                $('#invoice').focus();
                var e = $.Event('keyup');
                e.keyCode = 13;
                $('#invoice').trigger(e);
              } else {
                $('#paymentDetails').html('');
              }
            })
            .catch(err => {
              loadModule({ load: CONSTANTS.MODULES.ERROR, loadedFrom: CONSTANTS.MODULES.PAYMENT, error: err.responseJSON});
            });
        })
        .catch(err => {
          loadModule({ load: CONSTANTS.MODULES.ERROR, loadedFrom: CONSTANTS.MODULES.PAYMENT, error: err.responseJSON});
        });
      }
    }
  });

  function updateStyles(selNodeIndex) {
    browser.storage.sync.get('SERVER_CONFIG', function (storage) {
      if (storage.SERVER_CONFIG && storage.SERVER_CONFIG.nodes) {
        storage.SERVER_CONFIG.selectedNodeIndex = selNodeIndex;
        let selNode = storage.SERVER_CONFIG.nodes.filter(node => node.index == selNodeIndex)[0];
        if(selNode && selNode.settings && selNode.settings.themeMode && selNode.settings.themeColor) {
          $('link[id="themeStyle"]').attr('href','../assets/themes/' + selNode.settings.themeMode.toLowerCase() + '/' + selNode.settings.themeColor.toLowerCase() + '.css');
        }
      }
    });
  }

  $('#invoice').keyup(function (event) {
    var invoiceVal = $('#invoice').val().trim();
    if (!event.altKey && !event.ctrlKey && event.code != 'Tab' && invoiceVal.trim() != '') {
      $('#paymentDetails').html(CONSTANTS.SPINNER);
      let final_url = '';
      switch (selectNodeImplementation) {
        case 'CLN':
          final_url = RTLServerURL + CONSTANTS.API_URL.CLN.GET_PAYMENT_DETAILS + '/' + invoiceVal;
          break;
        case 'ECL':
          final_url = RTLServerURL + CONSTANTS.API_URL.ECL.GET_PAYMENT_DETAILS + '/' + invoiceVal;
          break;
        default:
          final_url = RTLServerURL + CONSTANTS.API_URL.LND.GET_PAYMENT_DETAILS + '/' + invoiceVal;
          break;
      }
      callServerAPI('GET', final_url, serverToken)
      .then(paymentDetailsResponse => {
        self.decodedPaymentResponse = paymentDetailsResponse;
        $('#paymentDetails').removeClass('invalid-border');
        $('#paymentDetails').html(createPaymentDetailsHTML('SUCCESS', selectNodeImplementation, paymentDetailsResponse));
        if (
          (selectNodeImplementation == 'LND' && !paymentDetailsResponse.num_satoshis) || 
          (selectNodeImplementation == 'CLN' && !paymentDetailsResponse.msatoshi) ||
          (selectNodeImplementation == 'ECL' && !paymentDetailsResponse.amount)
        ) {
          $('#invoiceAmount').focus();
          $('#sendPaymentBtn').attr('disabled', true);
        } else {
          $('#sendPaymentBtn').removeAttr('disabled');
        }
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

  $("#paymentDetails").on("keyup", "#invoiceAmount", function(event){
    let invoiceAmt = $('#invoiceAmount').val();
    if (invoiceAmt && invoiceAmt > 0 && CONSTANTS.NUMBER_REGEX.test(invoiceAmt)) {
      $('#sendPaymentBtn').removeAttr('disabled');
    } else {
      $('#sendPaymentBtn').attr('disabled', true);
    }
  });

  pageContainer.keyup(function(event) {
    event.preventDefault();
    if(event.code == 'Enter' && !($('#sendPaymentBtn').is(':disabled'))) {
      $('#sendPaymentBtn').click();
    }
  });

  function addRadioBtnsForNodes(rtlConfig) {
    var selectNodeRadio = $('#selectNodeRadio');
    var str = '';
    if (rtlConfig.nodes.length) {
      if (rtlConfig.nodes.length == 1) {
        str = 
        '<div class="custom-control custom-radio">' + 
          '<input type="radio" class="custom-control-input" name="selectNodeRadioInput" id="selectNodeRadioInput' + rtlConfig.nodes[0].index + '" value="' + rtlConfig.nodes[0].index + '" checked="">' + 
          '<label class="custom-control-label" for="selectNodeRadioInput' + rtlConfig.nodes[0].index + '">' + rtlConfig.nodes[0].lnNode + '(' + rtlConfig.nodes[0].lnImplementation + ')' + '</label>' + 
        '</div>';
        selectNodeRadio.append(str);
        $("#selectNodeRadioInput" + rtlConfig.nodes[0].index).prop( "checked", true );
        selectNodeImplementation = rtlConfig.nodes[0].lnImplementation ? rtlConfig.nodes[0].lnImplementation : 'LND';
      } else {
        for (var i = 0; i < rtlConfig.nodes.length; i++) {
          str = 
          '<div class="custom-control custom-radio">' + 
            '<input type="radio" class="custom-control-input" name="selectNodeRadioInput" id="selectNodeRadioInput' + rtlConfig.nodes[i].index + '" value="' + rtlConfig.nodes[i].index + '">' + 
            '<label class="custom-control-label" for="selectNodeRadioInput' + rtlConfig.nodes[i].index + '">' + rtlConfig.nodes[i].lnNode + '(' + rtlConfig.nodes[i].lnImplementation + ')' + '</label>' + 
          '</div>';
          selectNodeRadio.append(str);
          if (rtlConfig.nodes[i].index == rtlConfig.selectedNodeIndex) {
            $("#selectNodeRadioInput" + rtlConfig.selectedNodeIndex).prop( "checked", true );
            selectNodeImplementation = (rtlConfig.nodes[i].lnImplementation && rtlConfig.nodes[i].lnImplementation != '') ? rtlConfig.nodes[i].lnImplementation.toUpperCase() : 'LND';
          }
        }
      }
    }
  }
  
  function createPaymentDetailsHTML(status, selectNodeImplementation, paymentDetailsResponse) {
    var details_html = '';
    if (status == 'SUCCESS') {
      switch (selectNodeImplementation) {
        case 'CLN':
          if (paymentDetailsResponse.payee) {
            var expiryDate = new Date((+paymentDetailsResponse.created_at + +paymentDetailsResponse.expiry) * 1000);
            var expiryDateStr = ('0' + (expiryDate.getDay())).slice(-2) + '/' + CONSTANTS.MONTHS[expiryDate.getMonth()].name + '/' + expiryDate.getFullYear() + ' ' + expiryDate.getHours() + ':' + expiryDate.getMinutes();
            details_html = '<div class="row"><div class="col-3"><p class="my-0">Destination: </p></div><div class="col-9"><p class="my-0">'
            + paymentDetailsResponse.payee +
            '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'
            + paymentDetailsResponse.description +
            '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount: </p></div><div class="col-9"><p class="row col-12 my-0">';
            if (paymentDetailsResponse.msatoshi) {
              details_html = details_html + formatNumberWithCommas(parseInt(paymentDetailsResponse.msatoshi / 1000));
            } else {
              details_html = details_html + '<input type="text" class="form-control col-6 invoice-amount mb-2" id="invoiceAmount" placeholder="Invoice amount" tabindex="9">';
            }
            details_html = details_html + '<span class="col-6 pl-1"> Sats</span></p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Expiry: </p></div><div class="col-9"><p class="my-0">' + expiryDateStr + '</p></div></div>'; 
          }
          break;
        case 'ECL':
          if (paymentDetailsResponse.nodeId) {
            var expiryDate = new Date((paymentDetailsResponse.timestamp + (paymentDetailsResponse.expiry ? paymentDetailsResponse.expiry : 3600)) * 1000);
            var expiryDateStr = ('0' + (expiryDate.getDay())).slice(-2) + '/' + CONSTANTS.MONTHS[expiryDate.getMonth()].name + '/' + expiryDate.getFullYear() + ' ' + expiryDate.getHours() + ':' + expiryDate.getMinutes();
            details_html = '<div class="row"><div class="col-3"><p class="my-0">Destination: </p></div><div class="col-9"><p class="my-0">'
            + paymentDetailsResponse.nodeId +
            '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'
            + paymentDetailsResponse.description +
            '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount: </p></div><div class="col-9"><p class="row col-12 my-0">';
            if (paymentDetailsResponse.amount) {
              details_html = details_html + formatNumberWithCommas(parseInt(paymentDetailsResponse.amount));
            } else {
              details_html = details_html + '<input type="text" class="form-control col-6 invoice-amount mb-2" id="invoiceAmount" placeholder="Invoice amount" tabindex="9">';
            }
            details_html = details_html + '<span class="col-6 pl-1"> Sats</span></p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Expiry: </p></div><div class="col-9"><p class="my-0">' + expiryDateStr + '</p></div></div>'; 
          }
          break;
        default:
          if (paymentDetailsResponse.destination) {
            var expiryDate = new Date((+paymentDetailsResponse.timestamp + +paymentDetailsResponse.expiry) * 1000);
            var expiryDateStr = ('0' + (expiryDate.getDay())).slice(-2) + '/' + CONSTANTS.MONTHS[expiryDate.getMonth()].name + '/' + expiryDate.getFullYear() + ' ' + expiryDate.getHours() + ':' + expiryDate.getMinutes();
            details_html = '<div class="row"><div class="col-3"><p class="my-0">Destination: </p></div><div class="col-9"><p class="my-0">'
              + paymentDetailsResponse.destination +
              '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'
              + paymentDetailsResponse.description +
              '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount: </p></div><div class="col-9"><p class="row col-12 my-0">';
            if (paymentDetailsResponse.num_satoshis && +paymentDetailsResponse.num_satoshis > 0) {
              details_html = details_html + formatNumberWithCommas(+paymentDetailsResponse.num_satoshis);
            } else {
              details_html = details_html + '<input type="text" class="form-control col-6 invoice-amount mb-2" id="invoiceAmount" placeholder="Invoice amount" tabindex="9">';
            }
            details_html = details_html + '<span class="col-6 pl-1"> Sats</span></p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Expiry: </p></div><div class="col-9"><p class="my-0">' + expiryDateStr  + '</p></div></div>';
          }    
          break;
      }
      return details_html;
    } else {
      switch (selectNodeImplementation) {
        case 'CLN':
          return '<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'
          + paymentDetailsResponse.message +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Code: </p></div><div class="col-9"><p class="my-0">'
          + paymentDetailsResponse.error.error.code +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'
          + paymentDetailsResponse.error.error.message +
          '</p></div></div>';
        case 'ECL':
          return '<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'
          + paymentDetailsResponse.error +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'
          + paymentDetailsResponse.message +
          '</p></div></div>';
        default:
          return '<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'
          + paymentDetailsResponse.message +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Code: </p></div><div class="col-9"><p class="my-0">'
          + paymentDetailsResponse.error.code +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'
          + ((paymentDetailsResponse.error.error) ? paymentDetailsResponse.error.error : paymentDetailsResponse.error.errno) +
          '</p></div></div>';
      }
    }
  }
  
  function createPaymentStatusHTML(status, selectNodeImplementation, paymentStatusResponse) {
    if (status == 'SUCCESS') {
      switch (selectNodeImplementation) {
        case 'CLN':
          let fee = 0;
          if (paymentStatusResponse.msatoshi_sent && paymentStatusResponse.msatoshi) {
            fee = paymentStatusResponse.msatoshi_sent - paymentStatusResponse.msatoshi;
          }
          return '<div class="row"><div class="col-3"><p class="my-0">Preimage: </p></div><div class="col-9"><p class="my-0">'
            + paymentStatusResponse.payment_preimage +
            '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Payment hash: </p></div><div class="col-9"><p class="my-0">'
            + paymentStatusResponse.payment_hash +
            '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount paid: </p></div><div class="col-9"><p class="my-0">'
            + formatNumberWithCommas(parseInt(paymentStatusResponse.msatoshi_sent / 1000)) +
            ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Total fee: </p></div><div class="col-9"><p class="my-0">'
            + formatNumberWithCommas(+fee) +
            ' mSats</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Status: </p></div><div class="col-9"><p class="my-0">'
            + paymentStatusResponse.status +
            '</p></div></div><hr>';
        case 'ECL':
          return '<div class="row"><div class="col-4"><p class="my-0">Submitted with ID: </p></div><div class="col-8"><p class="my-0">'
            + paymentStatusResponse +
            '</p></div></div><hr>';
        default:
          if (!paymentStatusResponse.payment_route.total_fees_msat) {
            paymentStatusResponse.payment_route.total_fees_msat = 0;
          }
          return '<div class="row"><div class="col-3"><p class="my-0">Preimage: </p></div><div class="col-9"><p class="my-0">'
            + paymentStatusResponse.payment_preimage +
            '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Payment hash: </p></div><div class="col-9"><p class="my-0">'
            + paymentStatusResponse.payment_hash +
            '</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount paid: </p></div><div class="col-9"><p class="my-0">'
            + formatNumberWithCommas(paymentStatusResponse.payment_route.total_amt) +
            ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Total fee: </p></div><div class="col-9"><p class="my-0">'
            + formatNumberWithCommas(paymentStatusResponse.payment_route.total_fees_msat) +
            ' mSats</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Total hops: </p></div><div class="col-9"><p class="my-0">'
            + formatNumberWithCommas(paymentStatusResponse.payment_route.hops.length) +
            '</p></div></div><hr>';
      }
    } else {
      switch (selectNodeImplementation) {
        case 'CLN':
          return '<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'
          + paymentStatusResponse.message +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Code: </p></div><div class="col-9"><p class="my-0">'
          + paymentStatusResponse.error.code +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'
          + paymentStatusResponse.error.message +
          '</p></div></div>';
        case 'ECL':
          return '<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'
          + paymentStatusResponse.error +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'
          + paymentStatusResponse.message +
          '</p></div></div>';
          break;
        default:
          return '<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'
          + paymentStatusResponse.message +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Code: </p></div><div class="col-9"><p class="my-0">'
          + ((paymentStatusResponse.error.code) ? paymentStatusResponse.error.code : paymentStatusResponse.error) +
          '</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'
          + ((paymentStatusResponse.error.error) ? paymentStatusResponse.error.error : paymentStatusResponse.error) +
          '</p></div></div>';
      }
    }
  }
  
};

Payment.prototype.render = function () {
  pageContainer.html(paymentHtml);
};
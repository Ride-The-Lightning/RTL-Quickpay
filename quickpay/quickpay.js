$(function(){
  const REGEX_URL =/^https?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/;
  const AUTH_URL = '/rtl/api/authenticate';
  const RTL_CONF_URL = '/rtl/api/conf/rtlconf';
  const UPDATE_SEL_NODE_URL = '/rtl/api/conf/updateSelNode';

  const API_URL = {
    LND: {
      GET_INFO: '/rtl/api/lnd/getinfo',
      GET_PAYMENT_DETAILS:'/rtl/api/lnd/payreq',
      SEND_PAYMENT:'/rtl/api/lnd/channels/transactions'
    },
    CL: {
      GET_INFO: '/rtl/api/cl/getinfo',
      GET_PAYMENT_DETAILS: '/rtl/api/cl/payments',
      SEND_PAYMENT:'/rtl/api/cl/payments'
    }
  }

  var RTL_SERVER_URL = '';
  var rtlConfig = {};
  var serverToken = '';
  var selectNodeImplementation = 'LND';
  var lastLoadedContent = 'authenticationContent';
  var selectNode = $('#selectNode');
  var loadingImage = $('#loadingImage');
  
  chrome.storage.sync.get('RTL_SERVER_URL', function(storage){
    loadingImage.hide();
    $('#configError').hide();
    $('#configMsg').hide();
    if(storage.RTL_SERVER_URL && storage.RTL_SERVER_URL.trim() != '') {
      RTL_SERVER_URL = storage.RTL_SERVER_URL;
      $('#serverUrl').val(RTL_SERVER_URL);
    } else {
      $('#authBtn').attr('disabled', true);
      $('#password').attr('disabled', true);
    }
    loadContent('authenticationContent');
  });

  function fetchRTLConfig() {
    callServerAPI('GET', RTL_SERVER_URL + RTL_CONF_URL)
    .then(rtlConfigRes =>{
      rtlConfig = rtlConfigRes;
      if(rtlConfig.nodes.length) {
        if(rtlConfig.nodes.length === 1) {
          selectNode.append($('<option>', {
            value: rtlConfig.nodes[0].index,
            text: (rtlConfig.nodes[0].lnNode && rtlConfig.nodes[0].lnNode.toUpperCase() != 'SINGLENODE') ? rtlConfig.nodes[0].lnNode : 'LN Node'
          }));
          $("select > option[value=1]").prop("selected",true);
          selectNodeImplementation = 'LND';
        } else {
          for(var i=0; i < rtlConfig.nodes.length; i++) {
            selectNode.append($('<option>', {
              value: rtlConfig.nodes[i].index,
              text: rtlConfig.nodes[i].lnNode
            }));
            if (rtlConfig.nodes[i].index == rtlConfig.selectedNodeIndex) {
              $("select > option[value=" + rtlConfig.selectedNodeIndex + "]").prop("selected",true);
              selectNodeImplementation = (rtlConfig.nodes[i].lnImplementation && rtlConfig.nodes[i].lnImplementation != '') ? rtlConfig.nodes[i].lnImplementation.toUpperCase() : 'LND';
            }
          }
        }
        selectNode.val(rtlConfig.selectedNodeIndex).trigger('change'); //Do Not Remove: It sets request options from get_info
      }
    })
    .catch(err => {
      loadContent('errorContent', '', err.responseJSON);
    });
  }
  
  $('#serverUrl').keyup(function() {
    var surl = $('#serverUrl').val();
    if(surl && surl != '') {
      if(!REGEX_URL.test(surl)) {
        $('#configError').show('slow');
      } else {
        $('#configError').hide('slow');
        $('#configBtn').removeAttr('disabled');
      }
    } else {
      $('#configBtn').attr('disabled', true);
    }
  });

  $('#configBtn').click(function() {
    var surl = $('#serverUrl').val();
    if(surl.lastIndexOf('/') == (surl.length - 1)) {
      surl = surl.slice(0, surl.length - 1);
    }
    if(surl.lastIndexOf('/api') == (surl.length - 4)) {
      surl = surl.slice(0, surl.length - 4);
    }
    if(surl.lastIndexOf('/rtl') == (surl.length - 4)) {
      surl = surl.slice(0, surl.length - 4);
    }
    chrome.storage.sync.set({'RTL_SERVER_URL': surl}, function(storage){
      RTL_SERVER_URL = surl;
      $('#serverUrl').val(surl);
      $('#configMsg').show('slow');
      $('#authBtn').removeAttr('disabled');
      $('#password').removeAttr('disabled');
      setTimeout(() => {
        $('#configMsg').hide('slow');
      }, 2000);
    });
  });

  $('#password').keyup(function() {
    if(!event.altKey && !event.ctrlKey && event.code != 'Tab' && $('#password').val().trim() != '') {
      $('#authBtn').removeAttr('disabled');
    }
  });

  $('#authBtn').click(function() {
    var spinnerText = '<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Logging in...';
    $('#authBtn').html(spinnerText);
    var shaObj = new jsSHA($('#password').val(), 'ASCII');
    var hashedPassword = shaObj.getHash('SHA-256', 'HEX');
    setTimeout(() => {
    callServerAPI('POST', RTL_SERVER_URL + AUTH_URL, { 'authenticateWith':'PASSWORD','authenticationValue': hashedPassword})
    .then(tokenObjFromAPI => {
      if(tokenObjFromAPI.token) {
        serverToken = tokenObjFromAPI.token;
        fetchRTLConfig();
        loadContent('paymentContent');
      } else {
        loadContent('errorContent', '');
      }
      $('#authBtn').html('Login');
    })
    .catch(err => {
      $('#authBtn').html('Login');
      loadContent('errorContent', '', err.responseJSON);
    });
    }, 0);    
  });

  $('#backBtn').click(function() {
    loadContent(lastLoadedContent);
  });

  $('#clearPaymentBtn').click(function() {
    $('#invoice').val('');
    $('#paymentDetails').html('');
    $('#paymentDetails').removeClass('invalid-border');
    $('#sendPaymentBtn').attr('disabled', true);
  });

  $('#invoice').keyup(function(event) {
    var invoiceVal = $('#invoice').val();
    if(!event.altKey && !event.ctrlKey && event.code != 'Tab' && invoiceVal.trim() != '') {
      var spinner_html = '<div class="text-center mt-5"><div id="loadingImage" class="spinner-grow text-primary" role="status"></div><br><span>Fetching Payment...</span></div>';
      $('#paymentDetails').html(spinner_html);
      loadingImage.show('slow');
      var final_url = '';
      if(selectNodeImplementation != 'LND') {
        final_url = RTL_SERVER_URL + API_URL.CL.GET_PAYMENT_DETAILS + '/' + invoiceVal;
      } else {
        final_url = RTL_SERVER_URL + API_URL.LND.GET_PAYMENT_DETAILS + '/' + invoiceVal;
      }
      setTimeout(() => {
      callServerAPI('GET', final_url)
      .then(paymentDetailsResponse => {
        if (selectNodeImplementation == 'LND' && paymentDetailsResponse.destination) {
          var html_to_append = 
          '<div class="row"><div class="col-3"><p>Destination: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.destination + 
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.description +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Amount: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.num_satoshis + 
          ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p>Expiry: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.timestamp_str +
          '</p></div></div>';
        } else if(selectNodeImplementation != 'LND' && paymentDetailsResponse.payee) {
          var html_to_append = 
          '<div class="row"><div class="col-3"><p>Destination: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.payee + 
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.description +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Amount: </p></div><div class="col-9"><p>'
          + parseInt(paymentDetailsResponse.msatoshi/1000) + 
          ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p>Expiry: </p></div><div class="col-9"><p>'
          + paymentDetailsResponse.expire_at_str +
          '</p></div></div>';
        }
        $('#paymentDetails').html(html_to_append);
        $('#paymentDetails').removeClass('invalid-border');
        $('#sendPaymentBtn').removeAttr('disabled');
      }).catch(err => {
        if(selectNodeImplementation != 'LND') {
          var html_to_append = 
          '<div class="row"><div class="col-3"><p>Error: </p></div><div class="col-9"><p>'
          + err.responseJSON.message + 
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Code: </p></div><div class="col-9"><p>'
          + err.responseJSON.error.error.code +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + err.responseJSON.error.error.message +
          '</p></div></div>';
        } else {
          var html_to_append = 
          '<div class="row"><div class="col-3"><p>Error: </p></div><div class="col-9"><p>'
          + err.responseJSON.message + 
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Code: </p></div><div class="col-9"><p>'
          + err.responseJSON.error.code +
          '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
          + ((err.responseJSON.error.error) ? err.responseJSON.error.error : err.responseJSON.error.errno) +
          '</p></div></div>';
        }        
        $('#paymentDetails').html(html_to_append);
        $('#paymentDetails').addClass('invalid-border');
        $('#sendPaymentBtn').attr('disabled', true);
      });
      }, 0);
    }
  });

  selectNode.change(function() {
    if(rtlConfig && rtlConfig.nodes.length > 0) {
      var spinner_html = '<div class="text-center mt-5"><div id="loadingImage" class="spinner-grow text-primary" role="status"></div><br><span>Fetching Information...</span></div>';
      $('#paymentDetails').html(spinner_html);
      loadingImage.show('slow');
      $('#invoice').val('');
      $('#paymentDetails').removeClass('invalid-border');
      var newSelNode = selectNode.val();
      var filteredNode = rtlConfig.nodes.filter(node => {
        return node.index == newSelNode;
      })[0];
      selectNodeImplementation = (filteredNode.lnImplementation && filteredNode.lnImplementation != '') ? filteredNode.lnImplementation.toUpperCase() : 'LND';
      setTimeout(() => {
      callServerAPI('POST', RTL_SERVER_URL + UPDATE_SEL_NODE_URL, { 'selNodeIndex':newSelNode })
      .then(selNodeResponse => {
        if(selectNodeImplementation != 'LND') {
          final_url = RTL_SERVER_URL + API_URL.CL.GET_INFO;
        } else {
          final_url = RTL_SERVER_URL + API_URL.LND.GET_INFO;
        }
        callServerAPI('GET', final_url)
        .then(getInfoResponse => {
          console.info('GET INFO');
          $('#paymentDetails').html('');
        })
        .catch(err => {
          lastLoadedContent = 'paymentContent';
          loadContent('errorContent', '', err.responseJSON);
        });
      })
      .catch(err => {
        lastLoadedContent = 'paymentContent';
        loadContent('errorContent', '', err.responseJSON);
      });
      }, 0);
    }
  });

  $('#sendPaymentBtn').click(function() {
    var spinnerText = '<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>Sending Payment...';
    $('#sendPaymentBtn').html(spinnerText);
    let reqData = {};
    let invoiceVal = $('#invoice').val();
    if(selectNodeImplementation != 'LND') {
      reqData = {'invoice':invoiceVal};
      final_url = RTL_SERVER_URL + API_URL.CL.SEND_PAYMENT;
    } else {
      reqData = {'paymentReq': invoiceVal};
      final_url = RTL_SERVER_URL + API_URL.LND.SEND_PAYMENT;
    }
    setTimeout(() => {
    callServerAPI('POST', final_url, reqData)
    .then(data => {
      if(selectNodeImplementation != 'LND') {
        var html_to_append = 
        '<div class="row"><div class="col-3"><p>Preimage: </p></div><div class="col-9"><p>'
        + data.payment_preimage + 
        '</p></div></div><hr><div class="row"><div class="col-3"><p>Payment hash: </p></div><div class="col-9"><p>'
        + data.payment_hash +
        '</p></div></div><hr><div class="row"><div class="col-3"><p>Amount paid: </p></div><div class="col-9"><p>'
        + parseInt(data.msatoshi_sent/1000) + 
        ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p>Total fee: </p></div><div class="col-9"><p>'
        + (data.msatoshi_sent - data.msatoshi) + 
        ' mSats</p></div></div><hr><div class="row"><div class="col-3"><p>Status: </p></div><div class="col-9"><p>'
        + data.status +
        '</p></div></div><hr>';
        loadContent('statusContent', {status: 'SUCCESS', title: 'Payment successful:', message: html_to_append});
      } else {
        var html_to_append = 
        '<div class="row"><div class="col-3"><p>Preimage: </p></div><div class="col-9"><p>'
        + data.payment_preimage + 
        '</p></div></div><hr><div class="row"><div class="col-3"><p>Payment hash: </p></div><div class="col-9"><p>'
        + data.payment_hash +
        '</p></div></div><hr><div class="row"><div class="col-3"><p>Amount paid: </p></div><div class="col-9"><p>'
        + data.payment_route.total_amt + 
        ' Sats</p></div></div><hr><div class="row"><div class="col-3"><p>Total fee: </p></div><div class="col-9"><p>'
        + data.payment_route.total_fees_msat + 
        ' mSats</p></div></div><hr><div class="row"><div class="col-3"><p>Total hops: </p></div><div class="col-9"><p>'
        + data.payment_route.hops.length +
        '</p></div></div><hr>';
        loadContent('statusContent', {status: 'SUCCESS', title: 'Payment successful:', message: html_to_append});
      }
      $('#sendPaymentBtn').html('Pay');
    })
    .catch(err => {
      if(selectNodeImplementation != 'LND') {
        var html_to_append = 
        '<div class="row"><div class="col-3"><p>Error: </p></div><div class="col-9"><p>'
        + err.responseJSON.message + 
        '</p></div></div><hr><div class="row"><div class="col-3"><p>Code: </p></div><div class="col-9"><p>'
        + err.responseJSON.error.code +
        '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
        + err.responseJSON.error.message +
        '</p></div></div>';
        loadContent('statusContent', {status: 'ERROR', title: 'Payment failed:', message: html_to_append});
      } else {
        var html_to_append = 
        '<div class="row"><div class="col-3"><p>Error: </p></div><div class="col-9"><p>'
        + err.responseJSON.message + 
        '</p></div></div><hr><div class="row"><div class="col-3"><p>Code: </p></div><div class="col-9"><p>'
        + ((err.responseJSON.error.code) ? err.responseJSON.error.code : err.responseJSON.error) +
        '</p></div></div><hr><div class="row"><div class="col-3"><p>Description: </p></div><div class="col-9"><p>'
        + ((err.responseJSON.error.error) ? err.responseJSON.error.error : err.responseJSON.error) +
        '</p></div></div>';
        loadContent('statusContent', {status: 'ERROR', title: 'Payment failed:', message: html_to_append});
      }
      $('#sendPaymentBtn').html('Pay');
    });
    }, 0);
  });

  $('#closeBtn').click(function() {
    close();
  });

  $('#headerClose').click(function() {
    close();
  });

  function loadContent(pageName, pageData, error) {
    var i, tabcontent;
    tabcontent = $('.tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = 'none';
    }
    $('#' + pageName).css({'display': 'block'});
    if(pageData && pageData.status) {
      if(pageData.status == 'ERROR') {
        $('#paymentStatusMsg').addClass('invalid-border');
      }
      $('#paymentStatusTitle').text(pageData.title);
      $('#paymentStatusMsg').html(pageData.message);
    }
    if(error) {
      if(!error.message) { error.message = 'Server Connection Failed!'; }
      $('#errorMsg strong h6').text(error.message);
      if(!error.error) { error.error = 'Unable to connect to the server.'; }
      if (typeof error.error != 'string') {
        error.error = JSON.stringify(error.error, null, 2);
      }
      $('#errorMsg span').text(error.error);
    }
  }

  function callServerAPI(method, url, requestData) {
    return $.ajax({
      url: url,
      headers: {'Authorization': 'Bearer ' + serverToken},
      type: method,
      data: requestData,
      success: function(result) {
        return result;
      },
      error: function(error) {
        return error;
      }
    });
  }

});

var paymentHtml='\n  <div id="payment" class="page-container">\n    <h6>Select Node:</h6>\n    <div class="form-group" id="selectNodeRadio"></div>\n    <h6 class="card-title">Invoice:</h6>\n    <textarea type="text" class="form-control" id="invoice" rows="5" tabindex="8"></textarea>\n    <div class="form-control mt-4 pay-details" id="paymentDetails"></div>\n    <div class="d-flex justify-content-start mt-4">\n      <button id="clearPaymentBtn" type="reset" class="btn btn-outline-primary mr-2" tabindex="10">Clear</button>\n      <button id="sendPaymentBtn" type="submit" class="btn btn-primary" tabindex="11" disabled>Pay</button>\n    </div>\n  </div>';let Payment=function(e){this.loadedFrom=e.loadedFrom};Payment.prototype.initEvents=function(){"use strict";var e=this,s=window.msBrowser||window.browser||window.chrome;function a(e,s,a){var o="";if("SUCCESS"==e){switch(s){case"CLN":if(a.payee){var i=("0"+(t=new Date(1e3*(+a.created_at+ +a.expiry))).getDay()).slice(-2)+"/"+CONSTANTS.MONTHS[t.getMonth()].name+"/"+t.getFullYear()+" "+t.getHours()+":"+t.getMinutes();o='<div class="row"><div class="col-3"><p class="my-0">Destination: </p></div><div class="col-9"><p class="my-0">'+a.payee+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'+a.description+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount: </p></div><div class="col-9"><p class="row col-12 my-0">',a.msatoshi?o+=formatNumberWithCommas(parseInt(a.msatoshi/1e3)):o+='<input type="text" class="form-control col-6 invoice-amount mb-2" id="invoiceAmount" placeholder="Invoice amount" tabindex="9">',o=o+'<span class="col-6 pl-1"> Sats</span></p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Expiry: </p></div><div class="col-9"><p class="my-0">'+i+"</p></div></div>"}break;case"ECL":a.nodeId&&(i=("0"+(t=new Date(1e3*(a.timestamp+(a.expiry?a.expiry:3600)))).getDay()).slice(-2)+"/"+CONSTANTS.MONTHS[t.getMonth()].name+"/"+t.getFullYear()+" "+t.getHours()+":"+t.getMinutes(),o='<div class="row"><div class="col-3"><p class="my-0">Destination: </p></div><div class="col-9"><p class="my-0">'+a.nodeId+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'+a.description+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount: </p></div><div class="col-9"><p class="row col-12 my-0">',a.amount?o+=formatNumberWithCommas(parseInt(a.amount)):o+='<input type="text" class="form-control col-6 invoice-amount mb-2" id="invoiceAmount" placeholder="Invoice amount" tabindex="9">',o=o+'<span class="col-6 pl-1"> Sats</span></p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Expiry: </p></div><div class="col-9"><p class="my-0">'+i+"</p></div></div>");break;default:var t;if(a.destination)i=("0"+(t=new Date(1e3*(+a.timestamp+ +a.expiry))).getDay()).slice(-2)+"/"+CONSTANTS.MONTHS[t.getMonth()].name+"/"+t.getFullYear()+" "+t.getHours()+":"+t.getMinutes(),o='<div class="row"><div class="col-3"><p class="my-0">Destination: </p></div><div class="col-9"><p class="my-0">'+a.destination+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'+a.description+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount: </p></div><div class="col-9"><p class="row col-12 my-0">',a.num_satoshis&&+a.num_satoshis>0?o+=formatNumberWithCommas(+a.num_satoshis):o+='<input type="text" class="form-control col-6 invoice-amount mb-2" id="invoiceAmount" placeholder="Invoice amount" tabindex="9">',o=o+'<span class="col-6 pl-1"> Sats</span></p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Expiry: </p></div><div class="col-9"><p class="my-0">'+i+"</p></div></div>"}return o}switch(s){case"CLN":return'<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'+a.message+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Code: </p></div><div class="col-9"><p class="my-0">'+a.error.error.code+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'+a.error.error.message+"</p></div></div>";case"ECL":return'<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'+a.error+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'+a.message+"</p></div></div>";default:return'<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'+a.message+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Code: </p></div><div class="col-9"><p class="my-0">'+a.error.code+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'+(a.error.error?a.error.error:a.error.errno)+"</p></div></div>"}}function o(e,s,a){if("SUCCESS"==e)switch(s){case"CLN":let e=0;return a.msatoshi_sent&&a.msatoshi&&(e=a.msatoshi_sent-a.msatoshi),'<div class="row"><div class="col-3"><p class="my-0">Preimage: </p></div><div class="col-9"><p class="my-0">'+a.payment_preimage+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Payment hash: </p></div><div class="col-9"><p class="my-0">'+a.payment_hash+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount paid: </p></div><div class="col-9"><p class="my-0">'+formatNumberWithCommas(parseInt(a.msatoshi_sent/1e3))+' Sats</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Total fee: </p></div><div class="col-9"><p class="my-0">'+formatNumberWithCommas(+e)+' mSats</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Status: </p></div><div class="col-9"><p class="my-0">'+a.status+"</p></div></div><hr>";case"ECL":return'<div class="row"><div class="col-4"><p class="my-0">Submitted with ID: </p></div><div class="col-8"><p class="my-0">'+a+"</p></div></div><hr>";default:return a.payment_route.total_fees_msat||(a.payment_route.total_fees_msat=0),'<div class="row"><div class="col-3"><p class="my-0">Preimage: </p></div><div class="col-9"><p class="my-0">'+a.payment_preimage+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Payment hash: </p></div><div class="col-9"><p class="my-0">'+a.payment_hash+'</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Amount paid: </p></div><div class="col-9"><p class="my-0">'+formatNumberWithCommas(a.payment_route.total_amt)+' Sats</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Total fee: </p></div><div class="col-9"><p class="my-0">'+formatNumberWithCommas(a.payment_route.total_fees_msat)+' mSats</p></div></div><hr><div class="row"><div class="col-3"><p class="my-0">Total hops: </p></div><div class="col-9"><p class="my-0">'+formatNumberWithCommas(a.payment_route.hops.length)+"</p></div></div><hr>"}else switch(s){case"CLN":return'<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'+a.message+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Code: </p></div><div class="col-9"><p class="my-0">'+a.error.code+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'+a.error.message+"</p></div></div>";case"ECL":return'<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'+a.error+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'+a.message+"</p></div></div>";default:return'<div class="row px-2"><div class="col-3"><p class="my-0">Error: </p></div><div class="col-9"><p class="my-0">'+a.message+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Code: </p></div><div class="col-9"><p class="my-0">'+(a.error.code?a.error.code:a.error)+'</p></div></div><hr><div class="row px-2"><div class="col-3"><p class="my-0">Description: </p></div><div class="col-9"><p class="my-0">'+(a.error.error?a.error.error:a.error)+"</p></div></div>"}}callServerAPI("GET",RTLServerURL+CONSTANTS.RTL_CONF_URL,serverToken).then((s=>{rtlConfig=s,function(e){var s=$("#selectNodeRadio"),a="";if(e.nodes.length)if(1==e.nodes.length)a='<div class="custom-control custom-radio"><input type="radio" class="custom-control-input" name="selectNodeRadioInput" id="selectNodeRadioInput'+e.nodes[0].index+'" value="'+e.nodes[0].index+'" checked=""><label class="custom-control-label" for="selectNodeRadioInput'+e.nodes[0].index+'">'+e.nodes[0].lnNode+"("+e.nodes[0].lnImplementation+")</label></div>",s.append(a),$("#selectNodeRadioInput"+e.nodes[0].index).prop("checked",!0),selectNodeImplementation=e.nodes[0].lnImplementation?e.nodes[0].lnImplementation:"LND";else for(var o=0;o<e.nodes.length;o++)a='<div class="custom-control custom-radio"><input type="radio" class="custom-control-input" name="selectNodeRadioInput" id="selectNodeRadioInput'+e.nodes[o].index+'" value="'+e.nodes[o].index+'"><label class="custom-control-label" for="selectNodeRadioInput'+e.nodes[o].index+'">'+e.nodes[o].lnNode+"("+e.nodes[o].lnImplementation+")</label></div>",s.append(a),e.nodes[o].index==e.selectedNodeIndex&&($("#selectNodeRadioInput"+e.selectedNodeIndex).prop("checked",!0),selectNodeImplementation=e.nodes[o].lnImplementation&&""!=e.nodes[o].lnImplementation?e.nodes[o].lnImplementation.toUpperCase():"LND")}(rtlConfig),"ERROR"!==e.loadedFrom?(setTimeout((function(){$(document).on("click",".node-list-block",(function(){$("#selectNodeRadioInput"+$(this).attr("id").substring(5)).prop("checked",!0),$("#selectNodeRadio").trigger("change")}))}),1e3),$("#selectNodeRadioInput"+rtlConfig.selectedNodeIndex).prop("checked",!0),$("#selectNodeRadio").trigger("change")):($("#invoice").val("Either fix the connection for selected node or select another node to pay"),$("#invoice").attr("disabled",!0))})).catch((e=>{loadModule({load:CONSTANTS.MODULES.ERROR,loadedFrom:CONSTANTS.MODULES.PAYMENT,error:e.responseJSON})})),$("#sendPaymentBtn").click((function(){$("#sendPaymentBtn").html(CONSTANTS.SPINNER_BTN);let s={},a=$("#invoice").val(),i=$("#invoiceAmount").val(),t="";switch(selectNodeImplementation){case"CLN":s=!e.decodedPaymentResponse.msatoshi&&i&&i>0?{paymentType:"INVOICE",invoice:a,amount:parseInt(1e3*i)}:{paymentType:"INVOICE",invoice:a},t=RTLServerURL+CONSTANTS.API_URL.CLN.SEND_PAYMENT;break;case"ECL":s=!e.decodedPaymentResponse.amount&&i&&i>0?{invoice:a,amountMsat:parseInt(1e3*i)}:{invoice:a},t=RTLServerURL+CONSTANTS.API_URL.ECL.SEND_PAYMENT;break;default:!e.decodedPaymentResponse.num_satoshis&&i&&i>0?(s={paymentDecoded:e.decodedPaymentResponse},s.paymentDecoded.num_satoshis=i):s={paymentReq:a},t=RTLServerURL+CONSTANTS.API_URL.LND.SEND_PAYMENT}callServerAPI("POST",t,serverToken,JSON.stringify(s)).then((e=>{loadModule({load:CONSTANTS.MODULES.STATUS,loadedFrom:CONSTANTS.MODULES.PAYMENT,status:"SUCCESS",title:"Payment status:",message:o("SUCCESS",selectNodeImplementation,e.paymentResponse?e.paymentResponse:e)}),$("#sendPaymentBtn").html("Pay")})).catch((e=>{loadModule({load:CONSTANTS.MODULES.STATUS,loadedFrom:CONSTANTS.MODULES.PAYMENT,status:"ERROR",title:"Payment failed:",message:o("ERROR",selectNodeImplementation,e.responseJSON)}),$("#sendPaymentBtn").html("Pay")}))})),$("#selectNodeRadio").on("change",(function(){if(rtlConfig&&rtlConfig.nodes.length>0){$("#paymentDetails").html(CONSTANTS.SPINNER),$("#spinnerMessage").text("Fetching Information..."),$("#invoice").val(""),$("#invoice").attr("disabled",!1),$("#paymentDetails").removeClass("invalid-border");var e=-1,a={},o="";if(1==rtlConfig.nodes.length){switch(a=rtlConfig.nodes[0],selectNodeImplementation=rtlConfig.nodes[0].lnImplementation?rtlConfig.nodes[0].lnImplementation:"LND",selectNodeImplementation){case"CLN":o=RTLServerURL+CONSTANTS.API_URL.CLN.GET_INFO;break;case"ECL":o=RTLServerURL+CONSTANTS.API_URL.ECL.GET_INFO;break;default:o=RTLServerURL+CONSTANTS.API_URL.LND.GET_INFO}callServerAPI("GET",o,serverToken).then((e=>{if(""!==invoiceToPay.trim()){$("#invoice").val(invoiceToPay),$("#invoice").focus();var s=$.Event("keyup");s.keyCode=13,$("#invoice").trigger(s)}else $("#paymentDetails").html("")})).catch((e=>{loadModule({load:CONSTANTS.MODULES.ERROR,loadedFrom:CONSTANTS.MODULES.PAYMENT,error:e.responseJSON})}))}else e=+$("input[name='selectNodeRadioInput']:checked").val(),a=rtlConfig.nodes.filter((s=>s.index==e))[0],selectNodeImplementation=a.lnImplementation&&""!=a.lnImplementation?a.lnImplementation.toUpperCase():"LND",callServerAPI("POST",RTLServerURL+CONSTANTS.UPDATE_SEL_NODE_URL,serverToken,JSON.stringify({currNodeIndex:e,prevNodeIndex:selNode.index})).then((a=>{var i;switch(selNode=rtlConfig.nodes.filter((s=>s.index==e))[0],i=e,s.storage.sync.get("SERVER_CONFIG",(function(e){if(e.SERVER_CONFIG&&e.SERVER_CONFIG.nodes){e.SERVER_CONFIG.selectedNodeIndex=i;let s=e.SERVER_CONFIG.nodes.filter((e=>e.index==i))[0];s&&s.settings&&s.settings.themeMode&&s.settings.themeColor&&$('link[id="themeStyle"]').attr("href","../assets/themes/"+s.settings.themeMode.toLowerCase()+"/"+s.settings.themeColor.toLowerCase()+".css")}})),selectNodeImplementation){case"CLN":o=RTLServerURL+CONSTANTS.API_URL.CLN.GET_INFO;break;case"ECL":o=RTLServerURL+CONSTANTS.API_URL.ECL.GET_INFO;break;default:o=RTLServerURL+CONSTANTS.API_URL.LND.GET_INFO}callServerAPI("GET",o,serverToken).then((e=>{if(""!==invoiceToPay.trim()){$("#invoice").val(invoiceToPay),$("#invoice").focus();var s=$.Event("keyup");s.keyCode=13,$("#invoice").trigger(s)}else $("#paymentDetails").html("")})).catch((e=>{loadModule({load:CONSTANTS.MODULES.ERROR,loadedFrom:CONSTANTS.MODULES.PAYMENT,error:e.responseJSON})}))})).catch((e=>{loadModule({load:CONSTANTS.MODULES.ERROR,loadedFrom:CONSTANTS.MODULES.PAYMENT,error:e.responseJSON})}))}})),$("#invoice").keyup((function(s){var o=$("#invoice").val().trim();if(!s.altKey&&!s.ctrlKey&&"Tab"!=s.code&&""!=o.trim()){$("#paymentDetails").html(CONSTANTS.SPINNER);let s="";switch(selectNodeImplementation){case"CLN":s=RTLServerURL+CONSTANTS.API_URL.CLN.GET_PAYMENT_DETAILS+"/"+o;break;case"ECL":s=RTLServerURL+CONSTANTS.API_URL.ECL.GET_PAYMENT_DETAILS+"/"+o;break;default:s=RTLServerURL+CONSTANTS.API_URL.LND.GET_PAYMENT_DETAILS+"/"+o}callServerAPI("GET",s,serverToken).then((s=>{e.decodedPaymentResponse=s,$("#paymentDetails").removeClass("invalid-border"),$("#paymentDetails").html(a("SUCCESS",selectNodeImplementation,s)),"LND"==selectNodeImplementation&&!s.num_satoshis||"CLN"==selectNodeImplementation&&!s.msatoshi||"ECL"==selectNodeImplementation&&!s.amount?($("#invoiceAmount").focus(),$("#sendPaymentBtn").attr("disabled",!0)):$("#sendPaymentBtn").removeAttr("disabled")})).catch((e=>{$("#paymentDetails").html(a("ERROR",selectNodeImplementation,e.responseJSON)),$("#paymentDetails").addClass("invalid-border"),$("#sendPaymentBtn").attr("disabled",!0)}))}})),$("#clearPaymentBtn").click((function(){$("#invoice").val(""),$("#paymentDetails").html(""),$("#paymentDetails").removeClass("invalid-border"),$("#sendPaymentBtn").attr("disabled",!0)})),$("#paymentDetails").on("keyup","#invoiceAmount",(function(e){let s=$("#invoiceAmount").val();s&&s>0&&CONSTANTS.NUMBER_REGEX.test(s)?$("#sendPaymentBtn").removeAttr("disabled"):$("#sendPaymentBtn").attr("disabled",!0)})),pageContainer.keyup((function(e){e.preventDefault(),"Enter"!=e.code||$("#sendPaymentBtn").is(":disabled")||$("#sendPaymentBtn").click()}))},Payment.prototype.render=function(){pageContainer.html(paymentHtml)};


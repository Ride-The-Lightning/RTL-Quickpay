"use strict";function callServerAPI(e,r,n,t){return $.ajax({cache:!1,url:r,headers:{Authorization:"Bearer "+n,"Content-Type":"application/json","XSRF-TOKEN":csrfToken},method:e,data:t,success:(e,r,n)=>{n.getResponseHeader("XSRF-TOKEN")&&(csrfToken=n.getResponseHeader("XSRF-TOKEN"))},error:(e,r,n)=>{console.error(e)}})}function loadModule(e){let r={};switch(e.load){case CONSTANTS.MODULES.AUTHENTICATION:r=new Authentication(e);break;case CONSTANTS.MODULES.PAYMENT:r=new Payment(e);break;case CONSTANTS.MODULES.ERROR:r=new Error(e);break;case CONSTANTS.MODULES.STATUS:r=new Status(e)}pageContainer.focus(),r.render(),r.initEvents()}function formatNumberWithCommas(e){return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}
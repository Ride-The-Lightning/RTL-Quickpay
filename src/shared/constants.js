class CONSTANTS {
  static get SPINNER() { return '<div class="text-center mt-5"><div id="loadingImage" class="spinner-grow text-primary" role="status"></div><br><span id="spinnerMessage">Fetching Payment...</span></div>'; }
  static get SPINNER_BTN() { return '<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span><span id="spinnerBtnMsg">Sending Payment...</span>'; }
  static get NUMBER_REGEX() { return /^[+]?\d+$/; }
  static get URL_REGEX() { return /^https?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/; }
  static get AUTH_URL() { return '/rtl/api/authenticate'; }
  static get RTL_CONF_URL() { return '/rtl/api/conf/rtlconfinit'; }
  static get UPDATE_SEL_NODE_URL() { return '/rtl/api/conf/updateSelNode'; }
  static get API_URL() {
    return {
      LND: {
        GET_INFO: '/rtl/api/lnd/getinfo',
        GET_PAYMENT_DETAILS: '/rtl/api/lnd/payments/decode',
        SEND_PAYMENT: '/rtl/api/lnd/channels/transactions'
      },
      CLN: {
        GET_INFO: '/rtl/api/cln/getinfo',
        GET_PAYMENT_DETAILS: '/rtl/api/cln/utility/decode',
        SEND_PAYMENT: '/rtl/api/cln/payments'
      },
      ECL: {
        GET_INFO: '/rtl/api/ecl/getinfo',
        GET_PAYMENT_DETAILS: '/rtl/api/ecl/payments/decode',
        SEND_PAYMENT: '/rtl/api/ecl/payments'
      }
    };
  };
  static get OPENED_FROM_SOURCE() {
    return {
      EXTENSION: 'EXTENSION',
      CLICK: 'CLICK',
      CONTEXT: 'CONTEXT'
    };
  };
  static get MODULES() {
    return {
      MAIN: 'MAIN',
      AUTHENTICATION: 'AUTHENTICATION',
      PAYMENT: 'PAYMENT',
      ERROR: 'ERROR',
      STATUS: 'STATUS'
    };
  };
  static get MONTHS() {
    return [
      { name: 'Jan', days: 31 },
      { name: 'Feb', days: 28 },
      { name: 'Mar', days: 31 },
      { name: 'Apr', days: 30 },
      { name: 'May', days: 31 },
      { name: 'Jun', days: 30 },
      { name: 'Jul', days: 31 },
      { name: 'Aug', days: 31 },
      { name: 'Sep', days: 30 },
      { name: 'Oct', days: 31 },
      { name: 'Nov', days: 30 },
      { name: 'Dec', days: 31 }
    ];
  };
}

var RTLServerURL = '';
var serverToken = '';
var csrfToken = '';
var rtlConfig = {};
var selectNodeImplementation = 'LND';
var pageContainer = $('#pageContainer');
var invoiceToPay = '';
var openingSource = CONSTANTS.OPENED_FROM_SOURCE.EXTENSION;
var REQUEST_GETINFO = 'REQUEST_GETINFO';

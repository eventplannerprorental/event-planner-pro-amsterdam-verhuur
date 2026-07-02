/* Amsterdam Firebase bridge - gebruikt customer-config.js */
(function(){
  var cfg = window.EPP_CUSTOMER_CONFIG && window.EPP_CUSTOMER_CONFIG.firebaseConfig;
  window.EPP_FIREBASE_CONFIG = cfg || window.EPP_FIREBASE_CONFIG || null;
  window.BNS_RENTAL_FIREBASE_CONFIG = cfg || window.BNS_RENTAL_FIREBASE_CONFIG || null;
})();

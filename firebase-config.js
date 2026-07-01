/* Event Planner PRO - Firebase config brugbestand Amsterdam v24 */
(function(){
  var cfg = window.EVENT_PLANNER_CUSTOMER || window.EPP_CUSTOMER_CONFIG || {};
  var fb = cfg.firebaseConfig || {
    apiKey: 'AIzaSyADMGcbgIP2KSsP_LPR4XIuycw4npUc1Vs',
    authDomain: 'epp-amsterdam-verhuur.firebaseapp.com',
    databaseURL: 'https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'epp-amsterdam-verhuur',
    storageBucket: 'epp-amsterdam-verhuur.firebasestorage.app',
    messagingSenderId: '484128911122',
    appId: '1:484128911122:web:b2ba741c7a0a2511054dcb'
  };
  window.EPP_CUSTOMER_ID = cfg.customerId || 'amsterdam-verhuur';
  window.EPP_CUSTOMER_NAME = cfg.customerName || 'Amsterdam verhuur';
  window.EPP_USER_PIN = String(cfg.userPin || (cfg.pins && cfg.pins.user) || '3330');
  window.EPP_MASTER_PIN = String(cfg.masterPin || (cfg.pins && cfg.pins.master) || '9119');
  window.BNS_FIREBASE_CONFIG = fb;
  window.FIREBASE_CONFIG = fb;
  window.firebaseConfig = fb;
  window.EVENT_PLANNER_FIREBASE_ENABLED = true;
})();

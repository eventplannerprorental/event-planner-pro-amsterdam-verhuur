/* Event Planner PRO - Amsterdam verhuur klantconfig */

const AMSTERDAM_VERHUUR_CONFIG = {
  customerName: "Amsterdam verhuur",
  customerId: "amsterdam-verhuur",
  customerUrl: "https://eventplannerprorental.github.io/event-planner-pro-amsterdam-verhuur/",

  userPin: "3330",
  masterPin: "9119",

  pins: {
    user: "3330",
    master: "9119"
  },

  firebaseConfig: {
    apiKey: "AIzaSyADMGcbgIP2KSsP_LPR4XIuycw4npUc1Vs",
    authDomain: "epp-amsterdam-verhuur.firebaseapp.com",
    databaseURL: "https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "epp-amsterdam-verhuur",
    storageBucket: "epp-amsterdam-verhuur.firebasestorage.app",
    messagingSenderId: "484128911122",
    appId: "1:484128911122:web:b2ba741c7a0a2511054dcb"
  }
};

window.EPP_CUSTOMER_CONFIG = AMSTERDAM_VERHUUR_CONFIG;
window.EVENT_PLANNER_CUSTOMER = AMSTERDAM_VERHUUR_CONFIG;

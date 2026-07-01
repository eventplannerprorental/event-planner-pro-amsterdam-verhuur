/* Event Planner PRO - Firebase config brugbestand v14 */
(function () {
  const cfg = window.EVENT_PLANNER_CUSTOMER || window.EPP_CUSTOMER_CONFIG || window.AMSTERDAM_VERHUUR_CONFIG || null;
  if (!cfg || !cfg.firebaseConfig) {
    console.error("Geen klant Firebase config gevonden.");
    window.BNS_FIREBASE_CONFIG = null;
    return;
  }
  window.BNS_FIREBASE_CONFIG = cfg.firebaseConfig;
  window.FIREBASE_CONFIG = cfg.firebaseConfig;
  window.firebaseConfig = cfg.firebaseConfig;
  window.EPP_CUSTOMER_ID = cfg.customerId || "amsterdam-verhuur";
  window.EPP_CUSTOMER_NAME = cfg.customerName || "Amsterdam verhuur";
  window.EPP_USER_PIN = cfg.userPin || (cfg.pins && cfg.pins.user) || "3330";
  window.EPP_MASTER_PIN = cfg.masterPin || (cfg.pins && cfg.pins.master) || "9119";
  console.log("Firebase config geladen voor:", window.EPP_CUSTOMER_ID);
})();

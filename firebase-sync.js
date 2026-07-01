/* EVENT PLANNER PRO RENTAL v828
   Firebase sync staat bewust UIT.
   Deze build is alleen voor lokale test.
*/
(function(){
  window.BNS = window.BNS || {};
  window.BNS.syncOrder = function(){ return false; };
  window.BNS.firebaseEnabled = false;
  console.info('[EPP RENTAL v828] Firebase sync uitgeschakeld.');
})();

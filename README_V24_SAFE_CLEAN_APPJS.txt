Event Planner PRO Amsterdam verhuur v24 SAFE CLEAN APPJS

Basis:
- app.js opnieuw opgebouwd vanuit de originele werkende rental-copy.
- Niet verder gebouwd op de gestapelde v15-v23 app.js.

Aangepast:
- Firebase Amsterdam config.
- Remote pad: customers/amsterdam-verhuur/appState.
- Licentiecontrole in index.html leest eerst customers/amsterdam-verhuur/license.
- PIN 3330 en mastercode 9119.
- PIN 1111 shortcuts zoveel mogelijk uitgeschakeld.
- app-patches.js laadt apart voor: einddatum +/- vrijer, overzicht bestelling fallback, meerdere personeelsgebruikers.

Vervangen in GitHub:
- index.html
- app.js
- app-patches.js
- customer-config.js
- firebase-config.js

Test daarna met ?v=240 en Ctrl+F5.

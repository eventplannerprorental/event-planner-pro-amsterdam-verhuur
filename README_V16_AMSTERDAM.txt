Event Planner PRO Amsterdam verhuur v16

Belangrijkste wijziging:
- app.js wordt NIET meer direct door index.html geladen.
- license-guard.js controleert eerst de licentie in Firebase.
- Alleen bij geldige licentie laadt license-guard.js daarna bns-preloader.js, app.js en app-patches.js.
- Bij verlopen/geblokkeerde licentie blijft de app volledig geblokkeerd en start app.js niet.

Amsterdam gegevens:
- customerId: amsterdam-verhuur
- Firebase: epp-amsterdam-verhuur
- gebruiker PIN: 3330
- mastercode: 9119

Meegenomen correcties:
- PIN 1111 hardcoded toegang verwijderd uit app.js.
- Einddatum blijft standaard voorstel +3 dagen, maar handmatige wijziging wordt niet expres geblokkeerd.
- Overzicht bestelling heeft een extra fallback-patch.
- Gebruiker opslaan is aangepast zodat nieuwe PIN/naam niet automatisch de geselecteerde gebruiker blijft overschrijven.

Testvolgorde:
1. Upload alle bestanden naar event-planner-pro-amsterdam-verhuur.
2. Open met ?v=160 en Ctrl+F5.
3. Als validUntil in Firebase op 2026-06-30 staat, moet de app blokkeren.
4. Zet validUntil later in beheer naar de toekomst en schrijf naar Firebase.
5. Open opnieuw met ?v=161 en Ctrl+F5.
6. Test PIN 3330 en master 9119.

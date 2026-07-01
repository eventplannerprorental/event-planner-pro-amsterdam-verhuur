# Event Planner PRO Rental v849 - Firebase inrichting

Deze versie gebruikt één basisprogramma via GitHub Pages. De klant vult een klantcode in en de app laadt daarna alleen:

```text
customers/{customerId}/appState
customers/{customerId}/license
customers/{customerId}/backups
```

## Eerste test

De code `rental` wordt automatisch aangemaakt als die nog niet bestaat. Daardoor kun je direct testen met:

```text
https://eventplannerprorental.github.io/event-planner-pro-rental/?code=rental
```

Standaard wordt voor `rental` automatisch een licentie van 14 dagen gemaakt als die nog niet bestaat.

## Beheer-app

Open:

```text
admin-beheer.html
```

Tijdelijke mastercode:

```text
9119
```

In Firebase kun je deze later wijzigen via:

```text
platform/masterPin
```

## Klantstructuur

Voorbeeld:

```json
{
  "customerAccessCodes": {
    "jansen-events": {
      "customerId": "jansen-events",
      "active": true,
      "name": "Jansen Events"
    }
  },
  "customers": {
    "jansen-events": {
      "license": {
        "active": true,
        "status": "active",
        "validFrom": "2026-06-29",
        "validUntil": "2026-07-13",
        "warningDays": 5,
        "contactText": "Uw licentie verloopt binnenkort. Neem contact op."
      },
      "settings": {},
      "contact": {},
      "bookkeeping": {},
      "appState": {},
      "backups": {}
    }
  }
}
```

## Belangrijke veiligheidsopmerking

F12/rechtermuisknop blokkeren is alleen een rem. Het is geen echte beveiliging. Echte beveiliging moet in Firebase Authentication en Realtime Database Rules zitten.

Voor een echte betaalde productieversie moeten de Firebase Rules nog strakker worden gemaakt zodat klanten nooit buiten hun eigen `customerId` kunnen lezen of schrijven. De beheer-app moet uiteindelijk met een eigen admin-login werken, niet alleen met een mastercode in browser-code.

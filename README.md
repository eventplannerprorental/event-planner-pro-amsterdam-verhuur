# Event Planner PRO Rental v849

Deze versie gebruikt de bestaande GitHub Pages URL als basisprogramma voor alle klanten.

## Nieuw in v849

- Klantcode-scherm vóór de PIN.
- Data onder `customers/{customerId}/appState`.
- Licentiecontrole met `validFrom`, `validUntil`, `status` en `warningDays`.
- Popup wanneer licentie bijna verloopt.
- Blokkade wanneer licentie verlopen/geblokkeerd is.
- Mastercode-login voor beheer/noodgeval.
- Werkplek-inrichting bij eerste start.
- Backup downloaden en online backup maken.
- Extra beheerpagina: `admin-beheer.html`.
- Basis F12/rechtermuisknop-rem. Let op: dit is geen echte beveiliging.

## Testlink

Na upload naar GitHub Pages kun je testen met:

```text
https://eventplannerprorental.github.io/event-planner-pro-rental/?code=rental
```

De code `rental` wordt automatisch aangemaakt als die nog niet bestaat.

## Beheer-app

Open na upload:

```text
https://eventplannerprorental.github.io/event-planner-pro-rental/admin-beheer.html
```

Tijdelijke mastercode:

```text
9119
```

Zet in Firebase later eventueel een andere mastercode op:

```text
platform/masterPin
```

## Firebase

Anonymous Auth moet aan staan.
Realtime Database wordt gebruikt.

Belangrijk: voor echte klanten moeten Firebase Rules nog strakker worden gemaakt.

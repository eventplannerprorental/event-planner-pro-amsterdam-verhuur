# AUDIT V848 - Anonymous Firebase + PIN only

- Basis: v847, terug naar PIN-only scherm zoals Tapwagen.
- Firebase loginvelden blijven verborgen.
- App probeert achter de schermen Anonymous Auth.
- Firebase blijft leidend via customers/rental/appState.
- Offerte blijft buiten Firebase; echte statussen blijven online.
- Tapwagen v821 niet aangepast.
- Geen Tapwagen driver/planner keys overgenomen.

Benodigd in Firebase Console:
Authentication > Sign-in method > Anonymous inschakelen.

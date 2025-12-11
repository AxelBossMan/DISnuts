 # Eksamensprosjekt Gruppe 18
 
-Dette repository inneholder koden til HA(it) Eksamen Høst 2025
 
+## Forutsetninger
+- Node.js (18 eller nyere anbefales)
+- npm
 
-Prosjektet kan startes ved hjelp av et definerrt npm-script. følge disse trinn:

+1. Klon repoet og naviger til prosjektmappen:
+  ```bash
+   cd GruppeProsjekt
+   ```
+2. Installer avhengigheter:
+   ```bash
+   npm install
+   ```
 
-1. **Åpne termilaen:** Sørg for at din terminal er åpen og at du befinner deg i prosjektets root mappe (GruppeProsjekt)
+## Starte applikasjonen
+ Applikasjonen startes med det definerte npm-scriptet. Fra `GruppeProsjekt`-mappen kjører du:
+```bash
+npm start
+```
+Dette kjører `node ./bin/www` og starter Express-serveren.
 
-2. **Kjør npm-scriptet:** For å starte eksamensprosjektet skal du kjøre følgende kommando
-    ```bash
-    npm start
+## Miljøvariabler
+Applikasjonen bruker `dotenv`. Sørg for at du har laget en .env fil og fyller inn følgende variabler:

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_PHONE_RECIPIENT=
PORT=3000
OPENAI_API_KEY=
SESSION_SECRET=
MAILERSEND_API_KEY=
EMAIL_NAME=
EMAIL_USER=
users_phoneKey=

 # Eksamensprosjekt Gruppe 18
 
-Dette repository inneholder koden til HA(it) Eksamen Høst 2025
+Dette prosjektet inneholder koden til HA(it) Eksamen Høst 2025. Backend-applikasjonen ligger i mappen `GruppeProsjekt` og kjøres som en vanlig Express-app.
 
-## Kjøring av prosjektet
+## Forutsetninger
+- Node.js (18 eller nyere anbefales)
+- npm
 
-Prosjektet kan startes ved hjelp av et definerrt npm-script. følge disse trinn:
+## Kom i gang
+1. Klon repoet og naviger til prosjektmappen:
+   ```bash
+   cd GruppeProsjekt
+   ```
+2. Installer avhengigheter:
+   ```bash
+   npm install
+   ```
 
-1. **Åpne termilaen:** Sørg for at din terminal er åpen og at du befinner deg i prosjektets root mappe (GruppeProsjekt)
+## Starte applikasjonen
+Applikasjonen startes med det definerte npm-scriptet. Fra `GruppeProsjekt`-mappen kjører du:
+```bash
+npm start
+```
+Dette kjører `node ./bin/www` og starter Express-serveren.
 
-2. **Kjør npm-scriptet:** For å starte eksamensprosjektet skal du kjøre følgende kommando
-    ```bash
-    npm start
+## Miljøvariabler
+Applikasjonen bruker `dotenv`. Om du har en `.env`-fil med nødvendige nøkler (f.eks. database eller API-nøkler), sørg for at den ligger i `GruppeProsjekt`-mappen før du starter.
 
+## Videre arbeid
+- Oppdater `.env` med gyldige verdier for lokale eller produksjonsmiljøer.
+- Konfigurer database og tredjepartsnøkler slik applikasjonen krever.

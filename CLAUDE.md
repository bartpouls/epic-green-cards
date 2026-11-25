# Werkinstructie voor Claude: epic-green-cards

Didactisch kaartspel (farmacotherapie, casus UWI). Eigenaar: Bart Pouls. Taal: Nederlands. Bart is geen programmeur: leg uit zonder jargon.

## Structuur
| Pad | Inhoud |
|---|---|
| `casus-uwi.md` | Enige bron van klinische inhoud (versie 1.9). Besluiten per versie in sectie 9–16. |
| `casussen/uwi.js` | Speldata (groot, ~160 KB). |
| `casussen/uwi-referentie.js` | Casustekst voor het docentenoverzicht. |
| `engine/`, `regels/`, `ui/` | Spelmotor, regeltaal + evaluatie, weergave. `regels/PREDICATEN.md` beschrijft de regeltaal. |
| `tests/` | Testsuite (ook in de browser via `tests/tests.html`). |
| `tools/` | Docentenoverzicht, casusbouwer, resultatenoverzicht, routezoeker + rapport. |
| `gauntlet/tools/` | Hulpscripts (zie hieronder). `gauntlet/rapporten/` staat in `.gitignore`; oude rapporten staan op branch `archief/gauntlet-rapporten`. |

## Vormgeving
- Het spel en de studenteninstructie volgen de stijlgids **Vonk & Vloeistof**, niveau Vol (eigen spel). Bron: Barts Design System-artifact "Stijlgids Vonk & Vloeistof" (https://claude.ai/artifact/VvUU2zNVC1UzT2jhHzw8cC; lees `project/README.md` en `project/tokens.json`). Wijkt iets af van de stijlgids, dan wint de stijlgids, tenzij Bart anders besluit.
- Kleuren staan als variabelen bovenaan `ui/stijl.css` (`--vv-*` = de stijlgidskleuren). `instructie-studenten.html` heeft een eigen stijlblok met dezelfde kleuren.
- Lettertypes: Bricolage Grotesque 800 (titels) en Space Grotesk (de rest), lokaal in `assets/fonts/` (SIL OFL). Geen Google Fonts: het spel moet zonder internet werken.
- Logo's zijn de echte bestanden uit de stijlgids, nooit natekenen: `assets/capsule-pop.svg` (rust-logo, voettekst rechtsonder, met colofonregel) en `assets/capsule-pop-powerup.svg` (één keer: titelbalk van het startscherm).
- Vaste keuzes: rood (signaal) alleen voor patiëntveiligheid (geschonden veiligheidsregel, aanhoudende klachten); goed = teal-diep, fout = oranje; kopbalk petrol; één oranje hoofdknop per scherm; koppen in zinsvorm, geen hoofdletters; donkere modus volgt het systeem, papier en kaarten blijven licht.
- Kaartsoorten (naam staat er altijd bij): gegevens nacht, onderzoek teal-diep, voorschrijven oranje, bijsturen oranje-diep, informeren geel, evalueren ink-muted.
- Nog niet omgezet: de docententools in `tools/` (eigen stijlblokken).

## Testen
- Unit: `node gauntlet/tools/run-node.js | grep -v '^PASS'` (toont alleen fouten + totaal). Groep: `--groep=tekst`.
- Spelen via de interface: `node gauntlet/tools/speel-iteratie1.js | grep -v '^PASS'`.
- Docentenoverzicht: `node gauntlet/tools/check-overzicht.js | grep -v '^PASS'`.
- Casusbouwer: `node gauntlet/tools/check-casusbouwer.js | grep -v '^PASS'` (voorbeeld 1.9, alle stappen, oud werk aanvullen, controles).
- Resultatenoverzicht: `node gauntlet/tools/check-resultaten.js | grep -v '^PASS'` (testexports met de echte `Logging`: tellingen, testmodus, herkansingen, dubbele en kapotte bestanden).
- Routezoeker: `node tools/routezoeker.js` (alleen bij wijzigingen in regels, kaarten of dagverloop).
- Andere browsers (werkpakket D): `node gauntlet/tools/browsers.js` draait tests.html, routezoekerrapport, speelscript, docentenoverzicht, de casusbouwercontrole en de resultatencontrole in Chromium, Firefox en WebKit (Safari-motor). `--pages` doet hetzelfde via een lokale webserver onder `/epic-green-cards/`, zoals GitHub Pages. Losse scripts: `--browser=firefox|webkit`.
  - Zet vooraf `export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-extra`. Daar staan alle drie de browsers: het opstartscript van de omgeving "epic-green-cards" installeert Firefox en WebKit en linkt Chromium (sinds 21 nov 2026). Ontbreekt `/opt/pw-extra` (andere omgeving, of het script liep niet), installeer dan met hetzelfde script: `mkdir -p /opt/pw-extra`, dan `node /opt/node-tools/node_modules/playwright/cli.js install firefox webkit` en `... install-deps firefox webkit` met die `PLAYWRIGHT_BROWSERS_PATH`, en `ln -sfn /opt/pw-browsers/chromium* /opt/pw-extra/`. Dat vraagt de downloadserver van Playwright, die alleen de omgeving "epic-green-cards" toestaat.
  - Echte Safari (Mac/iPad) en Edge test Bart zelf met de hand; WebKit en Chromium dekken hun motoren.

## Omgeving en GitHub
- Cloudomgeving "epic-green-cards" (persoonlijk): staat de downloadserver van Playwright toe en heeft een opstartscript voor Firefox en WebKit (zie Testen).
- `.claude/settings.json` (door Bart geplaatst, 21 nov 2026) staat zonder vragen toe: PR's in deze repository samenvoegen, de hulpscripts in `gauntlet/tools/` (ook met `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-extra` ervoor) en de routezoeker. Claude wijzigt dit bestand niet zelf: toestemmingsregels plaatst Bart.
- Samenvoegen met `main`: alleen als Bart er in zijn bericht om vraagt. `main` is beschermd op GitHub (sinds 21 nov 2026): wijzigingen alleen via een PR, nooit rechtstreeks pushen.
- GitHub Pages publiceert `main`: https://bartpouls.github.io/epic-green-cards/ (vanuit de container niet bereikbaar).

## Werkregels (budget)
1. Lees bij de start alleen dit bestand en wat je taak nodig heeft. Lees `uwi.js`, `engine.tests.js`, `predicaten.tests.js` en `casus-uwi.md` niet integraal: zoek met grep en lees het stuk dat je nodig hebt.
2. Geen gauntlet-loop, subagents, mutatietests of screenshots, tenzij Bart erom vraagt.
3. Eén sessie = één werkpakket. Buiten scope? Benoem het in één regel, doe het niet.
4. Klinische inhoud komt uit `casus-uwi.md`. Nieuwe klinische tekst is concept met **[G]**-markering tot Bart akkoord geeft.
5. Rapporteer kort: wat veranderd, testresultaat, wat open. Werk aan het eind het blok "Stand" bij.
6. Geen rapporten, logs of afbeeldingen committen.

## Stand
- PR #1 samengevoegd in `main` (20 nov 2026): speelbaar prototype, drie episodes, casus 1.9. Unit 952/952 groen; speelscript 57/57; docentenoverzicht 43/43; casusbouwer 37/37.
- Werkpakket A (16 nov) en B (17 nov) klaar; zie `casus-uwi.md` sectie 12 en 13. Werkpakket C (20 nov) klaar: het docentenoverzicht toont nu ook smaakregel, dosering, regelnamen, gevolgzinnen, maten en restprofiel; `speel-ui.js` en `voeg-samen.js` verwijderd.
- Besluiten 20 nov 2026 verwerkt (`casus-uwi.md` sectie 14): alle concepten goedgekeurd (C1–C4, C6–C11, sepsis, blaasontsteking); I18 ernst 3; C9 blijft; 4 acties per dag in E1/E2, 3 in E3.
- Besluiten 20 nov 2026, tweede ronde (`casus-uwi.md` sectie 15): alle open vragen akkoord met de gekozen lezing (aanpassingen eventueel na testspelen); R7: overzicht toont alleen speldata.
- Werkpakket E (20 nov) klaar (`casus-uwi.md` sectie 16): G2 overbodig in E1/E3 (vastgesteld); situaties g–k als concept; regeltaal kreeg K-veld `alActief`; `tests/besluiten-1120.tests.js`. Routezoeker: grootste route zonder scoreverlies E1 8→6, E2 13→11, E3 24→21 van 66; wat nog gratis is, zijn twijfelgevallen (sectie 16). Besluit Bart: calcium/ciprofloxacine-keuzes en twijfelgevallen blijven zoals ze zijn.
- C12 (vier reflectievragen) en C13 (overbodige kaarten g–k) goedgekeurd op 20 nov 2026 (slot van `casus-uwi.md` sectie 16). Geen open vragen meer.
- Werkwijze: lees Barts besluiten ruim. Een besluit uit een eerdere sessie mag hij later bijstellen zonder het opnieuw uit te leggen.
- Werkpakket D (20 nov) klaar: speelscript, docentenoverzicht, tests.html en casusbouwer groen in Chromium, Firefox en WebKit, via file:// én via een webserver zoals Pages. Hervatten na herladen en in een nieuw tabblad getest (8 controles erbij). `.nojekyll` toegevoegd. Niet live gecontroleerd: de echte Pages-site (github.io is vanuit de container niet bereikbaar; het spel staat er pas na samenvoegen van PR #1 in `main`).
- Werkpakket F (20 nov) klaar: casusbouwer bijgewerkt naar casus 1.9. Nieuw (allemaal optioneel, met standaardwaarden): dagen en acties per dag als getal, gebeurtenissen op een vaste dag of x dagen na een kaart, escalatie met verloren episode, kaart die de episode stopt (met oordeelzinnen), keuzemenu bij doelkaarten, overbodige kaarten met ondergrens, restprofiel. Controle en markdown kennen die velden; oud werk (.json of opgeslagen in de browser) wordt bij openen aangevuld (`migreer`). Voorbeeld = casus 1.9. Niet in de bouwer: gevolgzinnen per episode voor overgeërfde regels, hintvarianten per voorwaarde (staan als extra feedback).
- PR #2 (werkpakket F) samengevoegd in `main` op 21 nov 2026.
- Werkpakket G (21 nov) klaar, PR #6 samengevoegd in `main`: `tools/resultaten.html` (resultatenoverzicht na het testspelen) en `aftrek` in de JSON-export. Records van vóór G houden geen `aftrek`-veld (zodat het overzicht ze herkent en meldt); daar tellen ze als lege lijst. Heeft een student in één episode twee eerste pogingen (twee apparaten), dan telt de vroegste.
- `instructie-studenten.html` (21 nov): instructie voor studenten bij een testronde (spelen, eerste poging telt, .json-bestand inleveren). Inleverplek staat er bewust niet in ("zoals je docent heeft afgesproken"). Gecontroleerd in `browsers.js` (opent, logo, link naar het spel).
- Vormgeving (25 nov 2026): spel en studenteninstructie omgezet naar de stijlgids Vonk & Vloeistof (zie Vormgeving). Docententools nog niet.
- Werkpakketten: A–G klaar.

## Werkpakket G: resultatenoverzicht na het testspelen (klaar, 21 nov 2026)
Doel: na een testronde ziet Bart per episode waar studenten vastlopen, om te beslissen welke regel, kaart of tekst moet veranderen. Alleen de eerste poging telt als meting; pogingen in testmodus tellen niet mee.

1. **Export aanvullen (klein, eerst).** De beoordeling kent `aftrek` (overbodige kaarten: `{ as, naam, delta, kaart, doel, tekst }`), maar `engine/logging.js` slaat die niet op. Voeg `aftrek` toe aan het JSON-record (alleen JSON; de CSV-kolommen blijven gelijk). Oude records zonder `aftrek`: lege lijst. Test in `tests/logging.tests.js`.
2. **`tools/resultaten.html`**, zelfstandig zoals de casusbouwer (file://, geen internet, niets verstuurd; Capsule Pop-logo rechtsonder in de voettekst).
   - Invoer: één of meer JSON-exportbestanden van het spel (slepen of kiezen). Dezelfde poging uit twee bestanden telt één keer (pseudoniem + episode + poging + speltijdstip). Kapotte bestanden geven een melding, geen crash. CSV hoeft niet.
   - Per episode, alleen eerste pogingen zonder testmodus: aantal studenten; poort gehaald / niet gehaald / verloren (aantal en %); geschonden veiligheidsregels, gesorteerd op hoe vaak (met regelnaam uit `casussen/uwi.js`); verdeling van de voorschrijfprofielen (ook restprofiel); overbodige kaarten, gesorteerd op hoe vaak (alleen uit bestanden die `aftrek` hebben; zeg hoeveel bestanden dat niet hebben).
   - Ook tonen: aantal ingelezen bestanden, pogingen en studenten, en hoeveel pogingen zijn overgeslagen (herkansing, testmodus).
   - Niet doen: grafieken, cijfers per student, groepen vergelijken, opslaan in de browser.
3. **Tests.** `gauntlet/tools/check-resultaten.js` (Playwright, `--browser=`), opnemen in `browsers.js`. Maak testexports door het spel te spelen met `speel-iteratie1.js`-stappen of door records op te bouwen met `Logging`; controleer de tellingen, het negeren van testmodus en herkansingen, dubbele bestanden en een kapot bestand. Draai alles ook met `--pages`.
4. **Afronden.** README (één alinea onder "Wat staat waar"), `CLAUDE.md` Stand bijwerken, PR; samenvoegen alleen op Barts verzoek.

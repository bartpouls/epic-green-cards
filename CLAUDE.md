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
| `tools/` | Docentenoverzicht, casusbouwer, routezoeker + rapport. |
| `gauntlet/tools/` | Hulpscripts (zie hieronder). `gauntlet/rapporten/` staat in `.gitignore`; oude rapporten staan op branch `archief/gauntlet-rapporten`. |

## Testen
- Unit: `node gauntlet/tools/run-node.js | grep -v '^PASS'` (toont alleen fouten + totaal). Groep: `--groep=tekst`.
- Spelen via de interface: `node gauntlet/tools/speel-iteratie1.js | grep -v '^PASS'`.
- Docentenoverzicht: `node gauntlet/tools/check-overzicht.js | grep -v '^PASS'`.
- Routezoeker: `node tools/routezoeker.js` (alleen bij wijzigingen in regels, kaarten of dagverloop).
- Andere browsers (werkpakket D): `node gauntlet/tools/browsers.js` draait tests.html, casusbouwer, routezoekerrapport, speelscript en docentenoverzicht in Chromium, Firefox en WebKit (Safari-motor). `--pages` doet hetzelfde via een lokale webserver onder `/epic-green-cards/`, zoals GitHub Pages. Losse scripts: `--browser=firefox|webkit`.
  - Firefox en WebKit staan niet standaard in de container. De omgeving "epic-green-cards" staat de downloadserver van Playwright toe. Installeren (map naar keuze, buiten de repo): `export PLAYWRIGHT_BROWSERS_PATH=<map>; node /opt/node-tools/node_modules/playwright/cli.js install firefox webkit && node /opt/node-tools/node_modules/playwright/cli.js install-deps firefox webkit; ln -s /opt/pw-browsers/chromium* "$PLAYWRIGHT_BROWSERS_PATH"/`. Echte Safari (Mac/iPad) en Edge test Bart zelf met de hand; WebKit en Chromium dekken hun motoren.

## Werkregels (budget)
1. Lees bij de start alleen dit bestand en wat je taak nodig heeft. Lees `uwi.js`, `engine.tests.js`, `predicaten.tests.js` en `casus-uwi.md` niet integraal: zoek met grep en lees het stuk dat je nodig hebt.
2. Geen gauntlet-loop, subagents, mutatietests of screenshots, tenzij Bart erom vraagt.
3. Eén sessie = één werkpakket. Buiten scope? Benoem het in één regel, doe het niet.
4. Klinische inhoud komt uit `casus-uwi.md`. Nieuwe klinische tekst is concept met **[G]**-markering tot Bart akkoord geeft.
5. Rapporteer kort: wat veranderd, testresultaat, wat open. Werk aan het eind het blok "Stand" bij.
6. Geen rapporten, logs of afbeeldingen committen.

## Stand
- PR #1 (concept): speelbaar prototype, drie episodes, casus 1.9. Unit 952/952 groen; speelscript 57/57; docentenoverzicht 43/43.
- Werkpakket A (16 nov) en B (17 nov) klaar; zie `casus-uwi.md` sectie 12 en 13. Werkpakket C (20 nov) klaar: het docentenoverzicht toont nu ook smaakregel, dosering, regelnamen, gevolgzinnen, maten en restprofiel; `speel-ui.js` en `voeg-samen.js` verwijderd.
- Besluiten 20 nov 2026 verwerkt (`casus-uwi.md` sectie 14): alle concepten goedgekeurd (C1–C4, C6–C11, sepsis, blaasontsteking); I18 ernst 3; C9 blijft; 4 acties per dag in E1/E2, 3 in E3.
- Besluiten 20 nov 2026, tweede ronde (`casus-uwi.md` sectie 15): alle open vragen akkoord met de gekozen lezing (aanpassingen eventueel na testspelen); R7: overzicht toont alleen speldata.
- Werkpakket E (20 nov) klaar (`casus-uwi.md` sectie 16): G2 overbodig in E1/E3 (vastgesteld); situaties g–k als concept; regeltaal kreeg K-veld `alActief`; `tests/besluiten-1120.tests.js`. Routezoeker: grootste route zonder scoreverlies E1 8→6, E2 13→11, E3 24→21 van 66; wat nog gratis is, zijn twijfelgevallen (sectie 16). Besluit Bart: calcium/ciprofloxacine-keuzes en twijfelgevallen blijven zoals ze zijn.
- C12 (vier reflectievragen) en C13 (overbodige kaarten g–k) goedgekeurd op 20 nov 2026 (slot van `casus-uwi.md` sectie 16). Geen open vragen meer.
- Werkwijze: lees Barts besluiten ruim. Een besluit uit een eerdere sessie mag hij later bijstellen zonder het opnieuw uit te leggen.
- Werkpakket D (20 nov) klaar: speelscript, docentenoverzicht, tests.html en casusbouwer groen in Chromium, Firefox en WebKit, via file:// én via een webserver zoals Pages. Hervatten na herladen en in een nieuw tabblad getest (8 controles erbij). `.nojekyll` toegevoegd. Niet live gecontroleerd: de echte Pages-site (github.io is vanuit de container niet bereikbaar; het spel staat er pas na samenvoegen van PR #1 in `main`).
- Werkpakketten: A–E klaar.

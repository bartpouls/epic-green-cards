# Werkinstructie voor Claude: epic-green-cards

Didactisch kaartspel (farmacotherapie, casus UWI). Eigenaar: Bart Pouls. Taal: Nederlands. Bart is geen programmeur: leg uit zonder jargon.

## Structuur
| Pad | Inhoud |
|---|---|
| `casus-uwi.md` | Enige bron van klinische inhoud (versie 1.7). Besluiten per versie in sectie 9–14. |
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

## Werkregels (budget)
1. Lees bij de start alleen dit bestand en wat je taak nodig heeft. Lees `uwi.js`, `engine.tests.js`, `predicaten.tests.js` en `casus-uwi.md` niet integraal: zoek met grep en lees het stuk dat je nodig hebt.
2. Geen gauntlet-loop, subagents, mutatietests of screenshots, tenzij Bart erom vraagt.
3. Eén sessie = één werkpakket. Buiten scope? Benoem het in één regel, doe het niet.
4. Klinische inhoud komt uit `casus-uwi.md`. Nieuwe klinische tekst is concept met **[G]**-markering tot Bart akkoord geeft.
5. Rapporteer kort: wat veranderd, testresultaat, wat open. Werk aan het eind het blok "Stand" bij.
6. Geen rapporten, logs of afbeeldingen committen.

## Stand
- PR #1 (concept): speelbaar prototype, drie episodes, casus 1.7. Unit 941/941 groen; speelscript 49/49; docentenoverzicht 35/43 (dezelfde 8 rood, werkpakket C).
- Werkpakket A (16 nov) en B (17 nov) klaar; zie `casus-uwi.md` sectie 12 en 13.
- Besluiten 20 nov 2026 verwerkt (`casus-uwi.md` sectie 14): alle concepten goedgekeurd (C1–C4, C6–C11, sepsis, blaasontsteking); I18 ernst 3; C9 blijft; 4 acties per dag in E1/E2, 3 in E3.
- Open, wacht op Bart: vragen "Voor de huisarts" (N1, E2-6, E3-4) en ontbrekende reflectievragen (E1-3, E2-8, E3-12).
- Routezoeker: afvinken wordt nauwelijks afgestraft (E3: 24 van 66 kaartacties zonder scoreverlies).
- Werkpakketten:
  - C: 8 rode controles docentenoverzicht; verouderd `gauntlet/tools/speel-ui.js` en `voeg-samen.js` (verwijst naar niet-bestaande bestanden) weg.
  - D: vrijgavecheck: hervatten na herladen, GitHub Pages, andere browsers.

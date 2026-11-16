# Werkinstructie voor Claude: epic-green-cards

Didactisch kaartspel (farmacotherapie, casus UWI). Eigenaar: Bart Pouls. Taal: Nederlands. Bart is geen programmeur: leg uit zonder jargon.

## Structuur
| Pad | Inhoud |
|---|---|
| `casus-uwi.md` | Enige bron van klinische inhoud (versie 1.4). Besluiten per versie in sectie 9–11. |
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
- PR #1 (concept): speelbaar prototype, drie episodes, casus 1.5. Unit 932/932 groen; speelscript 48/48; docentenoverzicht 35/43 (dezelfde 8 rood, werkpakket C).
- Werkpakket A klaar (16 nov 2026): na Verwijzen stopt de episode (met oordeel terecht/niet terecht); I17 lisinopril verdubbelen en I18 wisselen naar resistent middel zijn poortregels; vastgelegd in `casus-uwi.md` sectie 12; concepten C6–C9 wachten op Bart. Routezoeker heeft `--acties=N`.
- Open, wacht op Bart:
  - Verwijzen als ontsnapping: in episode 3 haalt "N1 + O2 + Verwijzen op dag 1" de poort (alleen 1 punt doelmatigheid). Onterecht verwijzen als poortregel?
  - Grens kaarten per dag (doorgerekend): bij 2 zijn geen geldige casusroutes in E2/E3 meer speelbaar; bij 3 en 4 alle. Keuze: overal 3, of E1/E2 op 4 ("ruim") en E3 op 3 ("krap").
  - Concepten C1–C4 en C6–C9 (`casus-uwi.md` sectie 11 en 12), concepttekst sepsis, zin "Dit middel staat in de richtlijn niet bij een blaasontsteking."
- Werkpakketten:
  - B: ontwerptaal uit casusteksten (V2, Ev3, B5, V6), keuzemenu's V6 en B1.
  - C: 8 rode controles docentenoverzicht; verouderd `gauntlet/tools/speel-ui.js` en `voeg-samen.js` (verwijst naar niet-bestaande bestanden) weg.
  - D: vrijgavecheck: hervatten na herladen, GitHub Pages, andere browsers.

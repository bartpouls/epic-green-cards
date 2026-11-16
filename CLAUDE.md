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
- PR #1 (concept): speelbaar prototype, drie episodes. Unit 915/915 groen; speelscript 47/47; docentenoverzicht 35/43 (8 rood, bestonden al).
- Besluiten Bart (16 nov 2026), nog niet verwerkt:
  - Na Verwijzen stopt de episode, met evaluatie of verwijzen terecht was.
  - Lisinopril verdubbelen en wisselen naar een resistent middel worden veiligheidsregels (poort).
- Open, wacht op Bart: grens van 3 kaarten per dag (eerst routezoeker), concepten sectie 11 van `casus-uwi.md`, concepttekst sepsis, zin "Dit middel staat in de richtlijn niet bij een blaasontsteking."
- Werkpakketten:
  - A: besluiten verwerken + 3-kaartengrens doorrekenen.
  - B: ontwerptaal uit casusteksten (V2, Ev3, B5, V6), keuzemenu's V6 en B1.
  - C: 8 rode controles docentenoverzicht; verouderd `gauntlet/tools/speel-ui.js` en `voeg-samen.js` (verwijst naar niet-bestaande bestanden) weg.
  - D: vrijgavecheck: hervatten na herladen, GitHub Pages, andere browsers.

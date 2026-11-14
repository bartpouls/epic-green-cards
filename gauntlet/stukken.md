# Stukken (kleinste los te verbeteren en te beoordelen eenheden)

Geldt voor elk stuk, naast lat 1 en lat 2: **S-LETTER**: elke tekst die uit de casus komt is teken-voor-teken gelijk (spaties, accenten als "ï/ë", "mga.", "—", "≥/<", Nederlandse aanhalingstekens zoals in de casus; markdown-sterretjes `**` zijn opmaak en horen NIET in de data). **S-TODO**: elke casus-onduidelijkheid staat als TODO_BART in `casus.todoBart` (id, vraag, gekozenLezing, plek).

---
## S1 `data-kaarten` — casuskop + kaartenbibliotheek
Bestanden: `casussen/uwi.js`, `tests/data-kaarten.tests.js`.
Inhoud: `window.CASUSSEN=[{id:"uwi-eerstelijn", versie:"1.1", bronnen:{NHG,SIDRIK,Kompas,KNMP}, kaarten:[26], todoBart:[], episodes:[], raadplegen...}]`.
Criteria:
- K1 Alle 26 kaarten (G1,G2,G3,O1,O2,V1–V10,B1–B5,N1–N3,Ev1–Ev3) in casusvolgorde (B5 staat in de casus vóór B4), met id, categorie (zes categorieën; "Voorschrijven ⊙" → categorie "Voorschrijven" + `doelkaart:true`), label, `vanafEpisode`, `effect` per episode (E1/E2/E3; waar de casus één tekst geeft, geldt die voor alle episodes vanaf `vanafEpisode`; waar de casus per episode verschilt (G2, O1, V3, V5, Ev1-varianten...) staat elke variant letterlijk in de juiste episode), `downside`, `bron`.
- K2 `bronnen` letterlijk uit de casuskop (volledige bronbeschrijving).
- K3 `doelen` per doelkaart (V6, B1, B2, B3, B4, B5, N2, Ev2) per episode volgens de casus; `opties` van V6 uit bouwopdracht 6.2 (letterlijk; `goed` markeren). Elke doelkeuze heeft `vereist`-predicaat waar nodig (B2 alleen op actief antibioticum, B5 alleen op gepauzeerd middel, B4 alleen op actief V7, V6 alleen op gespeeld middel/bestaande medicatie, enz.). Doel-ids: middel-kaart-id of comedicatie-id (lisinopril, spironolacton, calcium).
- K4 Labels neutraal en letterlijk; géén toegevoegde hints. Geen "—"-downsides wegpoetsen: waar de casus "—" geeft, staat daar "—" én een TODO_BART (casus noemt de downside "verplicht").
- K5 `raadplegen` (naslagkaart): titel + bronverwijzing (naar `bronnen`), geen richtlijntekst.
- K6 Test: tests die elke kaartstring uit `casus-uwi.md` (de tabel in sectie 3) parsen en gelijkstellen aan de data (de test leest het casusbestand niet in de browser; gebruik daarom een in de test ingebedde referentie-extractie die de BOUWER NIET uit de data genereert, maar die de criticus onafhankelijk herhaalt — de bouwer mag de test dus niet circulair maken).

## S2 `data-e1` — Episode 1 (casus sectie 4 + bouwopdracht 6.1/6.5/6.6)
Bestanden: `casussen/uwi-e1.js`, `tests/data-e1.tests.js`.
- E1-1 Patiëntkaart letterlijk (naam, leeftijd, klachten, medicatie, lab, risicogroep-uitleg, verborgen: niets), `waar` en `zichtbaar`.
- E1-2 Repertoire (12), knoppen (3 acties, 5 dagen, raadplegen 0), geen gebeurtenissen.
- E1-3 Invarianten I1, I3, I4 met predicaat (JSON-AST uit `contract.md`), ernst (5,5,5; bouwopdracht 6.1), geldtIn, letterlijke Socratische vraag, bron. "Altijd fout" van de casus weerspiegeld.
- E1-4 Score: duurzaamheid (V1=3, V2=2, direct=1), doelmatigheid (3, −1 O1, −1 O2). Profielen Terughoudend / Gedeelde regie / Direct behandelen mét de reflectievragen die in de casus staan; ontbrekende reflectievragen = `null` + TODO_BART.
- E1-5 feedbackExtra (O1 gespeeld), zichtbaarAlsOntbreekt (N1, V1-zonder-Ev1) letterlijk.
- E1-6 werkzaamheid (V3,V4,V5 werkzaam) + statusTeksten. Geldige routes uit de casus leveren de poort en het juiste profiel: aantoonbaar via de evaluatie (zodra S6 bestaat); LEAD-wijziging na S2/S3-criticus: een eigen, door de bouwer onafhankelijk uit de casus geschreven oracle (mini-evaluator) in de datatests is TOEGESTAAN als gedragscontrole, mits duidelijk gemarkeerd; zodra S6 bestaat draait die oracle als kruiscontrole naast `Evaluatie.beoordeel` (beide moeten dezelfde uitkomst geven).

## S3 `data-e2` — Episode 2 (casus sectie 5)
Bestanden: `casussen/uwi-e2.js`, `tests/data-e2.tests.js`. Zelfde criteria als S2, plus:
- E2-1 Ware vs. zichtbare eGFR: zichtbaar "laatst bekende eGFR 42, van 6 jaar geleden", waar 29, verborgen G2 → onthult eGFR 29 (casustekst "eGFR 29 uit de jaarlijkse controle").
- E2-2 Gebeurtenis C (kweekuitslag) met trigger "na de 4e gespeelde kaart, alleen als O1 gespeeld is", tekst letterlijk, `zet` resistent/gevoelig.
- E2-3 Invarianten I1, I4, I5, I6, I7, I8 (+ ernst uit 6.1; I7: dag-lezing uit contract TODO_BART-1) en de acht feedbackvragen (I5, I6×2, I7×2, I8, Verouderde eGFR, Onnodig gewisseld) letterlijk met juiste triggers.
- E2-4 Werkzaamheid (E2: V4 werkzaam; V3, V5 niet) en volgorde-eisen ("O1 vóór eerste antibioticum", "O2 ná V5") zitten in de invarianten, niet in de UI.
- E2-5 Score: duurzaamheid start 3, −1 per onnodige wissel; doelmatigheid 3/2 door G2-vóór-V; profielen Kweekgestuurd, smal / Bijgestuurd.

## S4 `data-e3` — Episode 3 (casus sectie 6)
Bestanden: `casussen/uwi-e3.js`, `tests/data-e3.tests.js`. Zelfde criteria als S2/S3, plus:
- E3-1 Patiëntkaart: spironolacton staat er zonder start/reden (bewust); eGFR 28 recent (waar=zichtbaar); verborgen achter G3: kweek uit E2 (trimethoprim resistent).
- E3-2 Gebeurtenissen A (weefselinvasie), B (uitdroging), C (kweekuitslag), A/B-groep in willekeurige volgorde, n=4, m=7, C drie kaarten na O1; teksten letterlijk (incl. "38,6 °C").
- E3-3 Alle invarianten I1, I4, I5, I6, I7, I8 + I9–I16 (16 stuks incl. I1,I4…) met ernst volgens bouwopdracht 6.1, `geldtIn` volgens casus-toestandstabel, predicaten volgens 6.1 (I9: casus-lezing, zie TODO_BART-2), vragen letterlijk (11 + overige feedback uit sectie 6).
- E3-4 Werkzaamheid per toestand (cystitis / weefselinvasie) volgens 6.3 met `als`-voorwaarden voor V7; statusTeksten; "Geen sick day-maatregelen", "Ciprofloxacine zonder B4/B3: Na 48 uur geen verbetering.", "I9 gemist" in `zichtbaarAlsOntbreekt`.
- E3-5 Score en profielen (Kweekgestuurd, Richtlijn eerste keus) + reflectievragen ("Profiel ciprofloxacine"); V6-ciprofloxacine bronconflict als feedbackExtra, geen invariant.
- E3-6 Knoppen 3 acties, 7 dagen, raadplegen kost 1.

## S5 `predicaten` — regeltaal
Bestanden: `regels/predicaten.js`, `regels/PREDICATEN.md`, `tests/predicaten.tests.js`.
- P1 Alle predicaten uit contract §3 + tellers §3b, generiek (geen middelnamen/drempels), puur functioneel over `ctx`.
- P2 Onafhankelijk van casusdata te testen: tests gebruiken synthetische tijdlijnen met willekeurige ids.
- P3 Randgevallen: lege tijdlijn, dubbel gespeelde kaart, dag-grenzen van `binnenBeurten`/`opDagRelatief` (inclusief randen), `voor/na` op `volg`, actief/gestopt/vervangen (B1,B2), gepauzeerd/hervat (B3,B5), `aantalActieveAntibiotica` per moment (niet alleen eindstand), `waar` met alle operatoren, `alsDan`.
- P4 Fout op onbekend predicaat (`Error` met Nederlandse tekst), niet stilzwijgend false.
- P5 `PREDICATEN.md` beschrijft elk predicaat met een voorbeeld; wat daar staat is waar.

## S6 `evaluatie` — poort, score, profiel, routetests  (start pas wanneer S1–S5, S7 minstens gebouwd zijn)
Bestanden: `regels/evaluatie.js`, `tests/evaluatie.tests.js`, `tests/routes.js` (routedefinities als data).
- V1 Alle geldige routes uit de casus (E1×5, E2×2, E3: cystitis-start fosfomycine, weefselinvasie amox/clav 875/125, cipro+B4, cipro+B3(calcium), de-escalatie na C, sick-day-set, verwijzen) gespeeld VIA de Engine in elke A/B-volgorde: poort gehaald en juiste profiel.
- V2 Voor ELKE invariant (I1, I3, I4, I5–I16) minstens één foutroute die PRECIES die invariant schendt en geen andere (`geschonden` bevat precies dat id). Plus combinaties: bij meerdere schendingen alleen de vraag van de laagste ernst; gelijke ernst → eerste in data.
- V3 Score/profiel/duurzaamheid/doelmatigheid conform casus & bouwopdracht 6.5. Bij schending geen score.
- V4 Geen casuslogica of drempel in `evaluatie.js`.
- V5 `downsides` van gespeelde én weggelaten kaarten; feedbackExtra, zichtbaarAlsOntbreekt.

## S7 `engine` — spelmotor
Bestanden: `engine/engine.js`, `tests/engine.tests.js`.
- M1 Alle API van contract §2; beurten/dagen/actiebudget (3 per beurt), raadplegen-kost uit data.
- M2 Onthullen: verborgen gegevens alleen na de bijbehorende kaart; `zichtbaar` wordt bijgewerkt; `waar` ongewijzigd en altijd gebruikt door regels.
- M3 Gebeurtenissen getriggerd op aantal gespeelde kaarten (n, m, "3 kaarten na O1", "na 4e kaart alleen als O1 gespeeld"); banner verschijnt aan het begin van de volgende dag; A/B per poging willekeurig (rng injecteerbaar), C maar één keer.
- M4 Klachtenstatus per dag volgens contract §3b via `episode.werkzaamheid`.
- M5 Doelvalidatie via `doelen` + `vereist`; V6-optie verplicht; onbekende of niet-toegestane zet → duidelijke Nederlandse foutmelding, state ongewijzigd.
- M6 Geen middelnamen/drempels in de engine; leest alles uit data. Nieuwe casus = alleen nieuwe data.
- M7 Episodes ontgrendelen: episode n+1 pas open als n gehaald (`Engine.ontgrendeld(...)`), herkansing (nieuw spel zelfde episode) telt als nieuwe poging.
- M8 Tests met een kleine synthetische fixture-casus (niet UWI) bewijzen M6.

## S8 `overzicht` — tools/overzicht.html
Bestanden: `tools/overzicht.html`, `tests/` n.v.t. Criteria: A8: per episode patiëntkaart (zichtbaar + waar + verborgen), repertoire met kaartlabels, knoppen, gebeurtenissen, invarianten met ernst/geldtIn/vraag, score, profielen, feedbackExtra, zichtbaarAlsOntbreekt, werkzaamheid, open vragen (TODO_BART) bovenaan. Zelfde labels/volgorde als de casus. Alles komt uit `window.CASUSSEN` (geen hardgecodeerde klinische tekst). Leesbaar op 13-inch scherm, dubbelklik werkt.

## S9 `ui` — index.html + ui/ui.js + ui/stijl.css
Criteria (vooraf-regel van LEAD, uit S1-criticus: voor het spelen toont een kaart ALLEEN categorie + label; `effect`, `downside` en `bron` verraden timing/oplossing — effect pas na het spelen, downside pas in de evaluatie; 'Richtlijn raadplegen' toont `casus.raadplegen`, geen hint over goed/fout): A1, A2, A4, A5, A6, lat 2 D1–D5. Patiëntkaart, kaarten per categorie met kleur, tijdlijn met dagen, actieteller, gebeurtenis-banners, onthullen direct, doelkeuze (+V6-optie), "Volgende dag", "Episode afronden", evaluatiescherm (downsides, één vraag óf score+profiel+reflectievraag, extra vragen), "Opnieuw", episodes ontgrendelen, pseudoniem bij start. Sober, 13-inch, Nederlands. Geen klinische tekst in code.

## S10 `logging` — engine/logging.js (+ knop "Exporteer resultaten" in S9)
Criteria: A7, bouwopdracht §5: velden per poging, eerste-poging-vlag (alleen de eerste poging per pseudoniem+episode telt), volledige tijdlijn, localStorage met try/catch en geheugen-terugval, CSV (correct geëscaped, Excel-vriendelijk NL: BOM, `;` of `,` kiezen en documenteren) + JSON, geen netwerk.

## S11 `referentie` — casussen/uwi-referentie.js (casusreferentie voor het overzicht)
Bestanden: `casussen/uwi-referentie.js`, `tests/data-referentie.tests.js` (voeg toe aan tests.html en run-node als je het bestand hebt aangemaakt: LEAD doet dat; registreer de groep 'data-referentie').
Criteria: R1 alle onderdelen uit contract §4c, per episode, LETTERLIJK uit casus-uwi.md (secties 4, 5, 6 en de kopjes), geen `**`-opmaak, wel alle leestekens; R2 niets uit de casus dat bij Bart-validatie hoort mag ontbreken: elke tabelrij/bullet van 'Geldige routes', 'Altijd fout', 'Volgorde', 'Score', 'Brug', 'Bronconflict', 'Route bij weefselinvasie', 'Knoppen' en de extra bullets onder Gebeurtenis; R3 niet-circulaire tests (ingebedde referentie uit de casus, eigen parser) + mutatietest; R4 geen klinische inhoud die niet in de casus staat (geen verzonnen tekst); elke twijfel TODO_BART in `casus.todoBart` (zelfstandig leesbaar voor Bart).

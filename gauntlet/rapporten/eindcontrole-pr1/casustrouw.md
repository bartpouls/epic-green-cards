# Casustrouw-controle, branch claude/amazing-noether-d42e9h (ac69ae8), casus 1.3

Oordeel: FAIL (5 punten). Alleen gelezen en gespeeld; de repo is niet gewijzigd (mutaties in een kopie: .../eindcontrole/mut/work).

## (a) Letterlijke tekst, beide richtingen
- Eigen extractie (a_extract.js, a_kaarten.js, a_map.js): 542 tekstatomen uit tabellen, bullets en citaten van casus 1.3 tegen alle stringbladeren van casussen/uwi.js (incl. referentie).
- Kaartenbibliotheek: 26 rijen, categorie, ⊙/doelkaart, label, vanaf, effect, downside en bron zijn gelijk. Enige verschil is vorm: O1-downside "E1: niet geïndiceerd, kost doelmatigheid" staat als {E1: "niet geïndiceerd, kost doelmatigheid"}.
- Repertoire E1 12, E2 15, E3 26 kaarten: klopt.
- Alle 'Altijd fout'-teksten en bronnen E3, alle feedbackvragen (id naar vraag gemapt), de 7 gevolgzinnen, patiëntkaarten, gebeurtenisteksten (C, A, B), profielnamen (behalve onderstaand) en reflectievragen: letterlijk gelijk.
- Data die niet in de casus staat (start-uitleg, escalatiewaarschuwing, sepsistekst, smaakregels, V6-opties, "Uitslag verwacht"): allemaal als concept met TODO_BART gemarkeerd.
- Afwijking van vorm: profiel "Direct behandelen, 1e/2e/3e keus" (casus 4, routetabel) is één profiel "Direct behandelen". Bart-keuze (TODO E1-4), geen fail.

## (b) Routes via echte Engine+Evaluatie, beide A/B-volgordes
Eigen speler (speel.js, routes_eigen.js, routes_e3.js, routes_e3b.js, casusmd.js): ruim 150 afspelingen. Verwachtingen komen uit de casus, niet uit de tests van de bouwers.
- E1: 5 routes plus uitgesteld recept met elk middel, doelmatigheid, O1-vraag, I1/I3/I4 en gelijke ernst: allemaal conform.
- E2: fosfomycine, trimethoprim met B1 op dag 3/4/5, I7-grenzen (O2 kuurdag 1 telt niet, dag 2–4 wel; halveren vanaf dag 4; wissel op dag 3 geen schending), I8-grens (2e beurt wel, 3e niet), I1, I4–I8 en alle foutroutes: conform.
- E3:
  - Geldig en conform: fosfomycine-start met amox/clav 875/125, cipro met B4 of B3(calcium), de-escalatie, hervatten na Ev2, O2 óf Ev2 volstaat, amox/clav en cipro bij cystitis (dz −1 plus opmerking), verwijzen.
  - Conform per invariant: I1, I4–I16 (foutroute schendt exact die invariant), ernstvolgorde en tie-break, één hint, geen score of profiel bij schending.
  - Besluiten sectie 9/10 conform: 14 dagen; kweekuitslag 3 dagen na O1 (tweede O1 geeft C2); escalatie weefselinvasie op dag 5 en sepsis 4 volle dagen later, 'verloren' zonder score of profiel; escalatie alleen E3; I15-monitoring B tot en met B+3 (B+4 fout); I9 volstaat met één van beide.
  - Escalatie in E2: geen events A/S bij een niet-werkzaam middel (ook conform).
- Afwijkingen, met reproductie:
  - **F1** E2: G2, O1, V3 op dag 1, N1 dag 2 (G2 WEL gespeeld). Gevolgen bevat "De nierfunctie bleek 29. Er komt geen werkzame concentratie…". De casus koppelt die zin aan "Nitrofurantoïne zonder G2". I7 en I9 hebben wel een voorwaarde ('als'), I5 niet.
  - **F2** E3 (AB of BA), basisroute zonder N3 (alleen drinkadvies ontbreekt). Gevolgen toont "De nierfunctie daalt verder en het kalium stijgt." De casus zegt "Geen sick day-maatregelen". De eigen gekozen lezing in de data (TODO E3-14: geen van de vier) en zichtbaarAlsOntbreekt[0] eisen alle vier afwezig; casus.gevolgzinnen I15 heeft geen 'als'. Zelfde bij ontbrekende B3, lisinopril of te late maatregel.
  - **F3** UI, E2, kaart G2 aanklikken vóór spelen: kaartvenster toont "eGFR 29 (verborgen)." (effect uit de casus). Het ware gegeven lekt dus vóór de kaart is gespeeld. Strijd met A5 "verborgen gegevens verschijnen alleen na de bijbehorende kaart". Reproductie: ab_capture.js, sleutel v_E2_G2.
  - **F4** sectie 9: "Afronden niet toegestaan zolang er nog gebeurtenissen aankomen of de dagen niet om zijn." Engine.rondAf in E1 (geen events) werkt op dag 1; ook E2 zonder O1 op dag 1. TODO N3 beweert "kan pas op de laatste dag afronden": tekst en gedrag verschillen. In E2 met O1 en in E3 is de blokkade er wel.
  - **F5** (klein) ui/ui.js:35 bevat het vaste label "Eerdere kweek" voor een patiëntveld; staat niet letterlijk in de casus (A2: klinische tekst uit de data).
- Niet-fails (alleen vermeld): I1 in E2/E3 heeft geen gevolgzin (casus geeft die alleen in E1 en Bart schrijft de rest); een gespeeld verwijzen (Ev3) beëindigt de episode niet, sepsis kan daarna nog volgen; geschonden-ids staan ook in de uitkomst 'verloren' (UI toont ze niet); I10 telt A-dag, een wissel op A+1 is schending (consistent met TODO E3-5).

## (c) Mutatietest
85 mutaties in een kopie (data: tekens, ernst, geldtIn, predicaten/vensters, score, profielen, knoppen, gebeurtenissen, werkzaamheid, patiëntdata; code: predicaten, evaluatie, engine).
- Bouwers-suite (877 tests) merkte 84 van 85. Overlever: 'nietGespeeld … && true' is een equivalente mutant (geen gedragsverandering).
- Mijn eigen routes merkten 53 van 85. Gemist door mij (de suite ving ze wel): tekstmutaties in kaarten/downsides/labels, ernst I5/I10/I12 (E3) en I7 (E2), geldtIn I10 en I4(E3), I7-vensters in E3, I15 B3 n, A-trigger n, escalatie A, aantalDagen, raadplegenKost, V8 werkzaam, afronden-blokkade en statusteksten. Daar heb ik geen eigen routes voor.
- Geen mutatie die gedrag veranderde bleef onopgemerkt bij beide. Overlevende gedragsveranderende mutanten: 0.

## (d) Hardgecodeerde klinische tekst
grep op middelnamen, eGFR, kalium, sepsis, NHG enzovoort in engine/, regels/, ui/ en index.html: alleen foutmeldingen met generieke woorden ("antibioticum", "patiënt"), en F5. Geen middelnamen of drempels.

## (e) Suites
- Node (gauntlet/tools/run-node.js): 877 groen, 0 rood.
- tests/tests.html in headless Chromium: 854 groen, 0 rood. De 23 nep-DOM UI-tests draaien alleen in Node; in de browser zit een echte-DOM rooktest.
- Het bouwers-script gauntlet/tools/speel-ui.js faalt op deze commit (een dialoog onderschept klikken; 5 FAIL en een scriptfout). Waarschijnlijk verouderd na de kaarttafel-omzetting. Ik heb het niet als bewijs gebruikt.
- Mijn eigen UI-run: 28 UI-opnames (ab_ui.json) werkten. De volledige UI-routeloop (ui_speel.js) werd afgebroken door de API-limiet en is niet afgemaakt. Dat is onbewezen.

## (f) Open vragen voor Bart
67 TODO_BART in de data, ingedeeld in gauntlet/todo-bart.js; de gekozen lezing is vrijwel overal de strengste (I1 zonder route, I6 zonder antibioticum, I14 overal, strenge I8, 'zonder' = nooit gespeeld). Enkele lezingen hebben een gat tussen tekst en gedrag (F2, F4). Niet als vraag gemarkeerd: F1, F3 en het effect van Ev3.

## (g) Blinde A/B (22 paren)
Toewijzing in ab_sleutel.json, pas geopend na mijn oordeel (ab_blind.md).
- Mijn oordeel vooraf:
  - Paren 1 en 6–22 zijn teken voor teken gelijk: geen betere kant.
  - Paren 2–5 verschillen alleen doordat één kant extra casusmeta bevat.
- Sleutel erna: in 2–5 is X de casustekst (paar 2), resp. het spel (3, 4, 5). Casus langer; spel toont alleen het speler-zichtbare deel. Paar 2: casus "(afleider, bereidt episode 3 voor)" en "Lab op de kaart:" tegenover spel "Lab:". Paar 3: casus plus "Daarmee valt ze in de risicogroep…[NHG]". Paar 4: casus plus "Risicogroep [NHG]." Paar 5: casus plus "Die valt binnen de termijn… [NHG]." Dat zijn bewuste weglatingen (TODO E1-7, E2-7), geen tekstfouten.
- Geen enkel paar had een teken-afwijking in de speltekst. Beter: bron voor volledigheid, spel voor speelbaarheid. Dus ONBESLIST.
- Niet gecontroleerd: tools/overzicht.html (overzicht) en de dosering-uitleg van N2 per middel.

## Grootste resterende kloof
Het ware gegeven lekt in het kaartvenster van G2 (F3), en twee gevolgzinnen verschijnen onder voorwaarden die de casus en de eigen TODO's niet geven (F1, F2).

## Keuzes voor Bart
- Gevolgzin I5 (E2) en I15 (E3): altijd bij elke schending, of alleen als de casusvoorwaarde klopt.
- G2-effect "(verborgen)" tonen op de kaart of weglaten.
- Afronden E1/E2: pas na dag 14, of bij geen aankomende gebeurtenissen.
- Profiel "Direct behandelen" in 1e/2e/3e keus.
- Wat Ev3 doet: episode beëindigen of niet.
- Reflectievragen Gedeelde regie, E2-profielen, Kweekgestuurd (E3).
- Sepsis- en uitlegteksten (concept).
- Zinnen voor regels zonder gevolgzin.

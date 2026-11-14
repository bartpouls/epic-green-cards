/* Lijst met open vragen, bovenaan gauntlet/progress.html.
   Indeling van 14 november 2026: van de 67 vragen in de data (casus.todoBart in casussen/uwi.js) staan hier alleen de vragen
   die bepalen wat in het spel goed of fout is. Bij alle andere blijft de gekozen lezing staan.
   Op 14 november 2026 heeft Bart tien vragen beslist. Ze blijven in de data staan, elk met een veld `besluit`, en staan hier in de
   groep "Beslist op 14 november 2026" (beslist: true). Nieuw zijn twee conceptteksten ter goedkeuring en de regels zonder gevolgzin. */
window.TODO_BART_GROEPEN = [
  { titel: "1. Conceptteksten ter goedkeuring (nieuw na de besluiten van 14 november 2026)", ids: [
    "TODO_BART-E3-27", "TODO_BART-E3-28"
  ] },
  { titel: "2. Veiligheidsregels zonder zin over wat er met de patiënt gebeurt (nog te schrijven; zonder zin toont het spel alleen de hint)", vast: [
    { id: "Episode 1", vraag: "I4 Twee antibiotica tegelijk." },
    { id: "Episode 2", vraag: "I1 Alarmsignalen ontbreken; I4 Twee antibiotica tegelijk; I6 Geen kweek vooraf of afwachten; I8 Resistent middel na de uitslag." },
    { id: "Episode 3", vraag: "I1 Alarmsignalen ontbreken; I4 Twee antibiotica tegelijk; I5 Nitrofurantoïne bij lage nierfunctie; I6 Geen kweek vooraf of afwachten; I7 Trimethoprim: kalium en halveren; I8 Resistent middel na de uitslag; I10 Weefselinvasie: middel werkt niet in het weefsel; I11 Wisselen zonder nieuwe kweek; I12 Cotrimoxazol; I13 Amoxicilline/clavulaanzuur zonder aangepaste dosis; I16 Opvolgen en verwijzen na weefselinvasie." }
  ] },
  { titel: "3. Ontbrekende reflectievragen", ids: [
    "TODO_BART-E1-3", "TODO_BART-E2-8", "TODO_BART-E3-12"
  ] },
  { titel: "4. Voor de huisarts", ids: ["TODO_BART-N1", "TODO_BART-E2-6", "TODO_BART-E3-4"] },
  { titel: "5. Achterhaald door casus 1.2 (de vraag is niet meer actueel; de gekozen lezing beschrijft wat het spel nu doet)", ids: [
    "TODO_BART-E2-16", "TODO_BART-E2-17"
  ] },
  { titel: "Beslist op 14 november 2026", beslist: true, ids: [
    "TODO_BART-E2-2", "TODO_BART-E3-19", "TODO_BART-E3-1", "TODO_BART-E3-24", "TODO_BART-E3-9", "TODO_BART-N4",
    "TODO_BART-E2-18", "TODO_BART-E3-15", "TODO_BART-E3-8", "TODO_BART-G1"
  ] }
];

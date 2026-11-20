/* Lijst met open vragen, bovenaan gauntlet/progress.html.
   Indeling van 15 november 2026: van de vragen in de data (casus.todoBart in casussen/uwi.js) staan hier alleen de vragen
   die bepalen wat in het spel goed of fout is. Bij alle andere blijft de gekozen lezing staan.
   Op 14 november 2026 heeft Bart tien vragen beslist, op 15 november 2026 nog zeven. Ze blijven in de data staan, elk met een veld
   `besluit`, en staan hier in de groepen "Beslist op ..." (beslist: true).
   Nieuw na 15 november 2026: vier concepten ter goedkeuring (een voorschot, afgeleid uit tekst die al in de casus staat; zie
   casus-uwi.md sectie 11) en één nieuwe vraag. De regels zonder gevolgzin hebben nu allemaal een conceptzin (TODO_BART-C4).
   16 november 2026: de vraag over Verwijzen is beslist; drie nieuwe concepten ter goedkeuring (casus-uwi.md sectie 12).
   17 november 2026: onterecht verwijzen is een poortregel (I19) en een doseringswijziging blijft staan; twee nieuwe concepten
   ter goedkeuring (casus-uwi.md sectie 13).
   20 november 2026: alle concepten goedgekeurd (C1–C4, C6–C11, E3-27, E3-28); I18 krijgt ernst 3 (casus-uwi.md sectie 14). */
window.TODO_BART_GROEPEN = [
  { titel: "1. Ontbrekende reflectievragen", ids: [
    "TODO_BART-E1-3", "TODO_BART-E2-8", "TODO_BART-E3-12"
  ] },
  { titel: "2. Voor de huisarts", ids: ["TODO_BART-N1", "TODO_BART-E2-6", "TODO_BART-E3-4"] },
  { titel: "3. Achterhaald door casus 1.2 (de vraag is niet meer actueel; de gekozen lezing beschrijft wat het spel nu doet)", ids: [
    "TODO_BART-E2-17"
  ] },
  { titel: "Beslist op 20 november 2026", beslist: true, ids: [
    "TODO_BART-C1", "TODO_BART-C2", "TODO_BART-C3", "TODO_BART-C4", "TODO_BART-C6", "TODO_BART-C7", "TODO_BART-C8", "TODO_BART-C9",
    "TODO_BART-C10", "TODO_BART-C11", "TODO_BART-E3-27", "TODO_BART-E3-28"
  ] },
  { titel: "Beslist op 16 november 2026", beslist: true, ids: ["TODO_BART-C5"] },
  { titel: "Beslist op 15 november 2026", beslist: true, ids: [
    "TODO_BART-N3", "TODO_BART-E2-16", "TODO_BART-E3-3", "TODO_BART-E2-10", "TODO_BART-E3-11", "TODO_BART-E3-21", "TODO_BART-R6"
  ] },
  { titel: "Beslist op 14 november 2026", beslist: true, ids: [
    "TODO_BART-E2-2", "TODO_BART-E3-19", "TODO_BART-E3-1", "TODO_BART-E3-24", "TODO_BART-E3-9", "TODO_BART-N4",
    "TODO_BART-E2-18", "TODO_BART-E3-15", "TODO_BART-E3-8", "TODO_BART-G1"
  ] }
];

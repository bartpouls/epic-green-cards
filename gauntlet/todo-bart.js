/* Lijst "TODO_BART — wacht op Bart", bovenaan gauntlet/progress.html. Gesorteerd: eerst wat Barts beslissing vraagt.
   De vragen zelf komen uit casus.todoBart (casussen/uwi.js); de zeven regels uit het contract (§8) staan hier. */
window.TODO_BART_GROEPEN = [
  { titel: "1. Vraagt jouw beslissing", ids: [
    "TODO_BART-N1", "TODO_BART-N4", "TODO_BART-N7", "TODO_BART-N3", "TODO_BART-N6", "TODO_BART-G1", "TODO_BART-L1", "TODO_BART-E3-4", "TODO_BART-E2-6"
  ] },
  { titel: "2. Concepttekst: keur goed of pas aan", ids: ["TODO_BART-N2", "TODO_BART-N5"] },
  { titel: "3. De zeven regels uit het contract (§8)", vast: [
    { id: "contract-1", vraag: "'Dag 2–4' en 'na dag 3' bij trimethoprim: gekozen lezing is kuurdag = dagen na de start + 1. Dus kalium op kuurdag 2–4 en halveren vanaf kuurdag 4. De andere lezing (kalium op dag 2–4 ná de start) maakt de casusroute 'V5 dag 1, O2 dag 2' fout. Welke bedoel je?" },
    { id: "contract-2", vraag: "I9: de casus zegt 'geen O2 én geen Ev2' (pas een schending als beide ontbreken); de bouwopdracht zegt 'O2 of Ev2 ontbreekt'. Gekozen: de casus." },
    { id: "contract-3", vraag: "Eisen 'binnen n beurten' bij vroeg afronden: een onvervulde eis telt als schending. Klopt dat?" },
    { id: "contract-4", vraag: "Vroeg afronden vóór een gebeurtenis (en dus ontlopen van de regels daarna). Nu aan: afronden pas na de gebeurtenissen of op de laatste dag (zie ook TODO_BART-N3)." },
    { id: "contract-5", vraag: "Uitgesteld recept '(+ middel)': in iteratie 1 gekozen dat de speler het middel kiest (zie TODO_BART-N7). Bevestig." },
    { id: "contract-6", vraag: "Tweede kweek in episode 3: in iteratie 1 voorlopig ja, 3 dagen na de nieuwe kweek (zie TODO_BART-E3-4). Bevestig, ook de gevoeligheid." },
    { id: "contract-7", vraag: "Het statuswoord 'klachten nemen toe' komt niet in de casus voor en wordt niet gebruikt. Klopt dat?" }
  ] },
  { titel: "4. Leeg gelaten op verzoek", ids: ["TODO_BART-E2-8"] }
];

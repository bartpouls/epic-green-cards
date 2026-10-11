/* Episode 1 (level 1) van casus uwi-eerstelijn. Alleen data. Bron: casus-uwi.md sectie 4 + bouwopdracht 6.1/6.5/6.6. */
if (window.CASUSSEN && window.CASUSSEN[0]) {
window.CASUSSEN[0].episodes.push({
  id: "E1",
  level: 1,
  startToestanden: ["cystitis"],
  knoppen: { actiesPerBeurt: 3, aantalDagen: 5, raadplegenKost: 0 },
  antibiotica: ["V3", "V4", "V5"],
  patient: {
    zichtbaar: {
      kop: "Mevrouw V., 72 jaar.",
      naam: "Mevrouw V.",
      leeftijd: 72,
      klachten: "Eerste cystitis: pijnlijke en frequente mictie sinds 2 dagen, geen koorts, nitriettest positief.",
      medicatie: ["lisinopril"],
      medicatieTekst: "lisinopril (hypertensie).",
      lab: { eGFR: 42, datum: "recent" },
      labTekst: "eGFR 42, recent."
    },
    waar: { eGFR: 42, risicogroep: false },
    medicatie: [{ id: "lisinopril", label: "lisinopril" }],
    verborgen: [],
    meta: {
      risicogroep: "Geen risicogroep. De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].",
      TODO_BART: "Mag de student de risicogroepmelding zien? De casus zet bij de patiëntkaart de regel 'Geen risicogroep. De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].' Die regel legt de drempels (eGFR 30, leeftijd 75) vooraf uit. Mag hij bij de patiëntkaart getoond worden, of alleen in het overzicht voor de docent?"
    }
  },
  repertoire: ["G1", "G2", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "N1", "N2", "Ev1"],
  gebeurtenissen: [],
  werkzaamheid: {
    cystitis: {
      werkzaam: [{ kaart: "V3" }, { kaart: "V4" }, { kaart: "V5" }],
      nietWerkzaam: []
    }
  },
  statusTeksten: {
    af: "klachten nemen af",
    aan: "klachten houden aan",
    geenVerbetering48: "Na 48 uur geen verbetering.",
    TODO_BART: "In episode 1 kunnen de klachten af, aan of na 48 uur niet verbeterd zijn, maar de casus geeft bij episode 1 geen statusteksten. Welke tekst hoort bij welke klachtenstatus?"
  },
  invarianten: [
    {
      id: "I1", ernst: 5, geldtIn: ["*"],
      predicaat: { p: "of", args: [
        { p: "nietGespeeld", kaart: "N1" },
        { p: "niet", arg: { p: "of", args: [
          { p: "gespeeld", kaart: "V1" }, { p: "gespeeld", kaart: "V2" }, { p: "gespeeld", kaart: "V3" },
          { p: "gespeeld", kaart: "V4" }, { p: "gespeeld", kaart: "V5" }
        ] } }
      ] },
      vraag: "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",
      bron: "NHG",
      TODO_BART: "De casus noemt als invariant I1 'Een route zonder N1'. Telt een episode zonder enige route (niets gespeeld) ook als 'een route zonder N1', en telt afronden zonder gekozen route (geen V1, V2, V3, V4 of V5), ook mét N1, als geschonden?"
    },
    {
      id: "I3", ernst: 5, geldtIn: ["*"],
      predicaat: { p: "en", args: [{ p: "gespeeld", kaart: "V1" }, { p: "nietGespeeld", kaart: "Ev1" }] },
      vraag: "Je wacht af. Tot wanneer, en wat gebeurt er dan?",
      bron: "NHG"
    },
    {
      id: "I4", ernst: 5, geldtIn: ["*"],
      predicaat: { p: "aantalActieveAntibiotica", op: ">", n: 1 },
      vraag: "Wat lost het tweede middel op dat het eerste niet oplost?",
      bron: "[G]"
    }
  ],
  score: {
    duurzaamheid: {
      regels: [
        {
          als: { p: "en", args: [
            { p: "gespeeld", kaart: "V1" },
            { p: "nietGespeeld", kaart: "V2" },
            { p: "niet", arg: { p: "of", args: [{ p: "gespeeld", kaart: "V3" }, { p: "gespeeld", kaart: "V4" }, { p: "gespeeld", kaart: "V5" }] } }
          ] },
          punten: 3
        },
        {
          als: { p: "gespeeld", kaart: "V2" },
          punten: 2,
          TODO_BART: "De casus geeft als route 'V2 (+ middel) + N1 + N2 + Ev1' en rangschikt de duurzaamheid 'afwachten > uitgesteld recept > direct een antibioticum'. Telt uitgesteld recept met een middel erbij, of met V1 erbij, nog als 2 (uitgesteld recept)?"
        },
        {
          als: { p: "of", args: [{ p: "gespeeld", kaart: "V3" }, { p: "gespeeld", kaart: "V4" }, { p: "gespeeld", kaart: "V5" }] },
          punten: 1
        }
      ]
    },
    doelmatigheid: {
      start: 3,
      regels: [
        { als: { p: "gespeeld", kaart: "O1" }, delta: -1 },
        { als: { p: "gespeeld", kaart: "O2" }, delta: -1 }
      ]
    }
  },
  profielen: [
    {
      naam: "Terughoudend",
      als: { p: "en", args: [
        { p: "gespeeld", kaart: "V1" },
        { p: "nietGespeeld", kaart: "V2" },
        { p: "niet", arg: { p: "of", args: [{ p: "gespeeld", kaart: "V3" }, { p: "gespeeld", kaart: "V4" }, { p: "gespeeld", kaart: "V5" }] } }
      ] },
      reflectievraag: "Je schreef niets voor. Bij welke patiënt zou dat niet mogen?"
    },
    {
      naam: "Gedeelde regie",
      als: { p: "gespeeld", kaart: "V2" },
      reflectievraag: null,
      TODO_BART: "De casus geeft bij het profiel Gedeelde regie (uitgesteld recept) geen reflectievraag, wel bij Terughoudend en Direct behandelen. Welke reflectievraag hoort bij Gedeelde regie?"
    },
    {
      naam: "Direct behandelen",
      als: { p: "of", args: [{ p: "gespeeld", kaart: "V3" }, { p: "gespeeld", kaart: "V4" }, { p: "gespeeld", kaart: "V5" }] },
      reflectievraag: "Het werkt. Was het nodig, en koos zíj ervoor?",
      TODO_BART: "De casus noemt bij de geldige routes 'Direct behandelen, 1e keus' (nitrofurantoïne), '2e keus' (fosfomycine) en '3e keus' (trimethoprim 3 dagen), maar geeft één reflectievraag. Is dat één profiel of drie?"
    }
  ],
  feedbackExtra: [
    {
      trigger: { p: "gespeeld", kaart: "O1" },
      vraag: "Wat doe je bij welke uitslag anders?",
      wanneer: "alleenBijGehaaldePoort",
      TODO_BART: "De casus noemt bij O1 gespeeld de vraag 'Wat doe je bij welke uitslag anders?'. Komt die vraag ook bij een poortschending?"
    }
  ],
  zichtbaarAlsOntbreekt: [
    { trigger: { p: "nietGespeeld", kaart: "N1" }, tekst: "Mevrouw weet niet wanneer ze moet bellen." },
    { trigger: { p: "en", args: [{ p: "gespeeld", kaart: "V1" }, { p: "nietGespeeld", kaart: "Ev1" }] }, tekst: "Er is geen moment om alsnog te starten als de klachten aanhouden." }
  ]
});
window.CASUSSEN[0].todoBart.push(
  { id: "TODO_BART-E1-1", vraag: "De casus noemt als invariant I1 'Een route zonder N1'. Telt een episode zonder enige route (niets gespeeld) ook als 'een route zonder N1', en telt afronden zonder gekozen route (geen V1, V2, V3, V4 of V5), ook mét N1, als geschonden?", gekozenLezing: "Strengste lezing: elke afronding zonder N1 schendt I1, ook als er helemaal geen route is gekozen. Ook afronden mét N1 maar zonder route-kaart (geen V1 t/m V5) schendt I1; de casus noemt dit geval niet, maar zonder deze lezing haalt een lege route de poort zonder profiel of duurzaamheidsscore.", plek: "E1.invarianten.I1" },
  { id: "TODO_BART-E1-2", vraag: "In episode 1 kunnen de klachten af, aan of na 48 uur niet verbeterd zijn, maar de casus geeft bij episode 1 geen statusteksten. Welke tekst hoort bij welke klachtenstatus?", gekozenLezing: "Status af = 'klachten nemen af', status aan = 'klachten houden aan', status na 48 uur geen verbetering = 'Na 48 uur geen verbetering.' (letterlijke fragmenten uit episode 2 en 3 van de casus). In episode 1 komen de laatste twee statussen niet voor.", plek: "E1.statusTeksten" },
  { id: "TODO_BART-E1-3", vraag: "De casus geeft bij het profiel Gedeelde regie (uitgesteld recept) geen reflectievraag, wel bij Terughoudend en Direct behandelen. Welke reflectievraag hoort bij Gedeelde regie?", gekozenLezing: "Geen reflectievraag (leeg); er wordt niets verzonnen.", plek: "E1.profielen.Gedeelde regie" },
  { id: "TODO_BART-E1-4", vraag: "De casus noemt bij de geldige routes 'Direct behandelen, 1e keus' (nitrofurantoïne), '2e keus' (fosfomycine) en '3e keus' (trimethoprim 3 dagen), maar geeft één reflectievraag. Is dat één profiel of drie?", gekozenLezing: "Eén profiel 'Direct behandelen' (V3, V4 of V5) met de ene reflectievraag uit de casus.", plek: "E1.profielen.Direct behandelen" },
  { id: "TODO_BART-E1-5", vraag: "De casus noemt bij O1 gespeeld de vraag 'Wat doe je bij welke uitslag anders?'. Komt die vraag ook bij een poortschending?", gekozenLezing: "Alleen bij gehaalde poort; bij een schending verschijnt maar één vraag, die van de ernstigste schending.", plek: "E1.feedbackExtra[O1]" },
  { id: "TODO_BART-E1-6", vraag: "De casus geeft als route 'V2 (+ middel) + N1 + N2 + Ev1' en rangschikt de duurzaamheid 'afwachten > uitgesteld recept > direct een antibioticum'. Telt uitgesteld recept met een middel erbij, of met V1 erbij, nog als 2 (uitgesteld recept)?", gekozenLezing: "Gespeeld V2 (ook met V1 of met een middel erbij) = 2, in lijn met profiel Gedeelde regie; V1 zonder V2 en zonder antibioticum = 3; een antibioticum zonder V2 = 1 (ook met V1 erbij, profiel Direct behandelen). Zonder gekozen route is er geen score (de poort is dan geschonden).", plek: "E1.score.duurzaamheid" },
  { id: "TODO_BART-E1-7", vraag: "Mag de student de risicogroepmelding zien? De casus zet bij de patiëntkaart de regel 'Geen risicogroep. De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].' Die regel legt de drempels (eGFR 30, leeftijd 75) vooraf uit. Mag hij bij de patiëntkaart getoond worden, of alleen in het overzicht voor de docent?", gekozenLezing: "Nee: de student ziet de risicogroepmelding niet. De regel staat in de data onder patient.meta.risicogroep (voor Bart en het overzicht); de student ziet alleen de kop, de klachten, de medicatie en het lab. Alternatief: de regel wel bij de patiëntkaart tonen.", plek: "E1.patient.meta.risicogroep" }
);
}

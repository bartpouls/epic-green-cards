/* Episode 1 (level 1) van casus uwi-eerstelijn. Alleen data. Bron: casus-uwi.md sectie 4 + bouwopdracht 6.1/6.5/6.6. */
if (window.CASUSSEN && window.CASUSSEN[0]) {
window.CASUSSEN[0].episodes.push({
  id: "E1",
  level: 1,
  startToestanden: ["cystitis"],
  knoppen: { actiesPerBeurt: 3, aantalDagen: 5, raadplegenKost: 0 },
  raadplegen: { titel: "Richtlijn raadplegen", bronnen: ["NHG", "KNMP"] },
  antibiotica: ["V3", "V4", "V5"],
  patient: {
    zichtbaar: {
      naam: "Mevrouw V.",
      leeftijd: 72,
      klachten: "Eerste cystitis: pijnlijke en frequente mictie sinds 2 dagen, geen koorts, nitriettest positief.",
      medicatie: ["lisinopril"],
      medicatieTekst: "lisinopril (hypertensie)",
      lab: { eGFR: 42, datum: "recent" },
      labTekst: "eGFR 42, recent.",
      risicogroep: "Geen risicogroep. De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG]."
    },
    waar: { eGFR: 42, risicogroep: false },
    medicatie: [{ id: "lisinopril", label: "lisinopril" }],
    verborgen: []
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
    TODO_BART: "Welke tekst hoort bij welke klachtenstatus in episode 1?"
  },
  invarianten: [
    {
      id: "I1", ernst: 5, geldtIn: ["*"],
      predicaat: { p: "nietGespeeld", kaart: "N1" },
      vraag: "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",
      bron: "NHG",
      TODO_BART: "I1 in episode 1: telt een episode zonder enige route (niets gespeeld) ook als 'een route zonder N1'?"
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
          als: { p: "en", args: [{ p: "gespeeld", kaart: "V2" }, { p: "nietGespeeld", kaart: "V1" }] },
          punten: 2,
          TODO_BART: "Duurzaamheid bij V2 (+ middel), zie TODO_BART-5: telt uitgesteld recept met een middel erbij nog als 2?"
        },
        { als: { p: "waarheid", waarde: true }, punten: 1 }
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
      TODO_BART: "Reflectievraag voor profiel Gedeelde regie ontbreekt in de casus."
    },
    {
      naam: "Direct behandelen",
      als: { p: "of", args: [{ p: "gespeeld", kaart: "V3" }, { p: "gespeeld", kaart: "V4" }, { p: "gespeeld", kaart: "V5" }] },
      reflectievraag: "Het werkt. Was het nodig, en koos zíj ervoor?",
      TODO_BART: "Is 'Direct behandelen, 1e/2e/3e keus' één profiel of drie?"
    }
  ],
  feedbackExtra: [
    {
      trigger: { p: "gespeeld", kaart: "O1" },
      vraag: "Wat doe je bij welke uitslag anders?",
      wanneer: "alleenBijGehaaldePoort",
      TODO_BART: "Komt de feedbackvraag 'O1 gespeeld' (episode 1) ook bij een poortschending?"
    }
  ],
  zichtbaarAlsOntbreekt: [
    { trigger: { p: "nietGespeeld", kaart: "N1" }, tekst: "Mevrouw weet niet wanneer ze moet bellen." },
    { trigger: { p: "en", args: [{ p: "gespeeld", kaart: "V1" }, { p: "nietGespeeld", kaart: "Ev1" }] }, tekst: "Er is geen moment om alsnog te starten als de klachten aanhouden." }
  ]
});
window.CASUSSEN[0].todoBart.push(
  { id: "TODO_BART-E1-1", vraag: "I1 in episode 1: telt een episode zonder enige route (niets gespeeld) ook als 'een route zonder N1'?", gekozenLezing: "Strengste lezing: elke afronding zonder N1 schendt I1, ook zonder gekozen route (bouwopdracht 6.1 zegt 'een route gekozen').", plek: "E1.invarianten.I1" },
  { id: "TODO_BART-E1-2", vraag: "Welke tekst hoort bij welke klachtenstatus in episode 1?", gekozenLezing: "af = 'klachten nemen af', aan = 'klachten houden aan', geenVerbetering48 = 'Na 48 uur geen verbetering.' (letterlijke fragmenten uit E2/E3); in episode 1 komen aan en geenVerbetering48 niet voor.", plek: "E1.statusTeksten" },
  { id: "TODO_BART-E1-3", vraag: "Reflectievraag voor profiel Gedeelde regie ontbreekt in de casus.", gekozenLezing: "reflectievraag = null.", plek: "E1.profielen.Gedeelde regie" },
  { id: "TODO_BART-E1-4", vraag: "Is 'Direct behandelen, 1e/2e/3e keus' één profiel of drie?", gekozenLezing: "Eén profiel 'Direct behandelen' (V3, V4 of V5) met de ene reflectievraag uit de casus.", plek: "E1.profielen.Direct behandelen" },
  { id: "TODO_BART-E1-5", vraag: "Komt de feedbackvraag 'O1 gespeeld' (episode 1) ook bij een poortschending?", gekozenLezing: "Alleen bij gehaalde poort; bij een schending verschijnt maar één vraag (A4).", plek: "E1.feedbackExtra[O1]" },
  { id: "TODO_BART-E1-6", vraag: "Duurzaamheid bij V2 (+ middel), zie TODO_BART-5: telt uitgesteld recept met een middel erbij nog als 2?", gekozenLezing: "V2 zonder V1 = 2 (ook met middel); V1 samen met V2 of met een antibioticum = 1.", plek: "E1.score.duurzaamheid" }
);
}

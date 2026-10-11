/* Episode 2 (level 2) van casus uwi-eerstelijn. Alleen data. Bron: casus-uwi.md sectie 5 + bouwopdracht 6.1/6.3/6.5/6.6. */
if (window.CASUSSEN && window.CASUSSEN[0]) {
window.CASUSSEN[0].episodes.push({
  id: "E2",
  level: 2,
  titel: "Episode 2 — level 2",
  startToestanden: ["cystitis"],
  knoppen: { actiesPerBeurt: 3, aantalDagen: 7, raadplegenKost: 0 },
  antibiotica: ["V3", "V4", "V5"],
  patient: {
    zichtbaar: {
      kop: "Mevrouw V., 78 jaar (6 jaar na episode 1).",
      naam: "Mevrouw V.",
      leeftijd: 78,
      leeftijdTekst: "78 jaar (6 jaar na episode 1)",
      klachten: "Tweede cystitis, geen koorts, nitriettest positief.",
      medicatie: ["lisinopril", "calcium/colecalciferol"],
      medicatieTekst: "lisinopril; calcium/colecalciferol",
      lab: { eGFR: 42, datum: "van 6 jaar geleden" },
      labTekst: "laatst bekende eGFR 42, van 6 jaar geleden",
      eerdereUWI: "episode 1, toen geen kweek gedaan"
    },
    waar: { eGFR: 29, risicogroep: true },
    medicatie: [
      { id: "lisinopril", label: "lisinopril" },
      { id: "calcium", label: "calcium/colecalciferol" }
    ],
    meta: { medicatieNoot: "afleider, bereidt episode 3 voor" },
    verborgen: [
      {
        kaart: "G2",
        sleutel: "eGFR",
        waarde: 29,
        onthult: "eGFR 29 uit de jaarlijkse controle",
        zichtbaar: {
          lab: { datum: "uit de jaarlijkse controle" },
          labTekst: "eGFR 29 uit de jaarlijkse controle"
        },
        meta: { toelichting: "Daarmee valt ze in de risicogroep: een antibioticum is nodig, met een kweek vóór de eerste dosis, en nitrofurantoïne valt af [NHG]." },
        TODO_BART: "Moet de zin 'Daarmee valt ze in de risicogroep: een antibioticum is nodig, met een kweek vóór de eerste dosis, en nitrofurantoïne valt af [NHG].' bij het onthullen van G2 aan de speler getoond worden (botst met 'feedback zegt niet voor')?"
      }
    ]
  },
  repertoire: ["G1", "G2", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "N1", "N2", "Ev1", "V6", "B1", "B2"],
  gebeurtenissen: [
    {
      id: "C",
      titel: "Kweekuitslag",
      trigger: { type: "naKaart", n: 4, alleenAlsGespeeld: "O1" },
      tekst: "E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor nitrofurantoïne, fosfomycine, amoxicilline/clavulaanzuur en ciprofloxacine.",
      zet: { resistent: ["V5", "V10"], gevoelig: ["V3", "V4", "V8", "V7"] },
      TODO_BART: "De doorlooptijd van de kweek (2–4 dagen) kwam via Mistral en is niet zelf gecheckt. Klopt 'na de 4e gespeelde kaart', en wat als O1 pas na de 4e kaart wordt gespeeld?"
    }
  ],
  werkzaamheid: {
    cystitis: {
      werkzaam: [{ kaart: "V4" }],
      nietWerkzaam: [
        { kaart: "V3", meta: { reden: "geen bactericide concentratie bij eGFR < 30" } },
        { kaart: "V5", meta: { reden: "resistent" } }
      ]
    }
  },
  statusTeksten: {
    af: "klachten nemen af",
    aan: "klachten houden aan",
    geenVerbetering48: null,
    TODO_BART: "Statusteksten in episode 2: de casus geeft alleen de fragmenten 'klachten houden aan' (trimethoprim) en 'klachten nemen af' (fosfomycine). Welke hoofdletter/punt, en is 'Na 48 uur geen verbetering.' ook in episode 2 bedoeld?"
  },
  invarianten: [
    {
      id: "I1",
      ernst: 5,
      geldtIn: ["*"],
      predicaat: { p: "nietGespeeld", kaart: "N1" },
      vraag: "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",
      bron: "NHG",
      TODO_BART: "I1 in episode 2: telt een episode zonder enige route (niets gespeeld) ook als 'een route zonder N1'?"
    },
    {
      id: "I4",
      ernst: 5,
      geldtIn: ["*"],
      predicaat: { p: "aantalActieveAntibiotica", op: ">", n: 1 },
      vraag: "Wat lost het tweede middel op dat het eerste niet oplost?",
      bron: "[G]"
    },
    {
      id: "I5",
      ernst: 2,
      geldtIn: ["*"],
      predicaat: {
        p: "en",
        args: [{ p: "gestart", middel: "V3" }, { p: "waar", veld: "eGFR", op: "<", waarde: 30 }]
      },
      vraag: "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?",
      bron: "NHG"
    },
    {
      id: "I6",
      ernst: 4,
      geldtIn: ["*"],
      predicaat: {
        p: "en",
        args: [
          { p: "waar", veld: "risicogroep", op: "==", waarde: true },
          {
            p: "of",
            args: [
              { p: "gespeeld", kaart: "V1" },
              { p: "gespeeld", kaart: "V2" },
              {
                p: "en",
                args: [
                  { p: "gespeeld", kaart: "V3" },
                  { p: "niet", arg: { p: "voor", a: { kaart: "O1" }, b: { kaart: "V3" } } }
                ]
              },
              {
                p: "en",
                args: [
                  { p: "gespeeld", kaart: "V4" },
                  { p: "niet", arg: { p: "voor", a: { kaart: "O1" }, b: { kaart: "V4" } } }
                ]
              },
              {
                p: "en",
                args: [
                  { p: "gespeeld", kaart: "V5" },
                  { p: "niet", arg: { p: "voor", a: { kaart: "O1" }, b: { kaart: "V5" } } }
                ]
              },
              { p: "niet", arg: { p: "of", args: [{ p: "gestart", middel: "V3" }, { p: "gestart", middel: "V4" }, { p: "gestart", middel: "V5" }] } }
            ]
          }
        ]
      },
      vraag: "Wat vertelt een kweek van urine die al antibioticum heeft gezien?",
      vraagVarianten: [
        {
          als: {
            p: "of",
            args: [
              {
                p: "en",
                args: [
                  { p: "gespeeld", kaart: "V3" },
                  { p: "niet", arg: { p: "voor", a: { kaart: "O1" }, b: { kaart: "V3" } } }
                ]
              },
              {
                p: "en",
                args: [
                  { p: "gespeeld", kaart: "V4" },
                  { p: "niet", arg: { p: "voor", a: { kaart: "O1" }, b: { kaart: "V4" } } }
                ]
              },
              {
                p: "en",
                args: [
                  { p: "gespeeld", kaart: "V5" },
                  { p: "niet", arg: { p: "voor", a: { kaart: "O1" }, b: { kaart: "V5" } } }
                ]
              }
            ]
          },
          vraag: "Wat vertelt een kweek van urine die al antibioticum heeft gezien?"
        },
        {
          als: { p: "of", args: [{ p: "gespeeld", kaart: "V1" }, { p: "gespeeld", kaart: "V2" }, { p: "niet", arg: { p: "of", args: [{ p: "gestart", middel: "V3" }, { p: "gestart", middel: "V4" }, { p: "gestart", middel: "V5" }] } }] },
          vraag: "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?"
        }
      ],
      bron: "NHG",
      TODO_BART: "Casus geeft bij I6 twee verschillende vragen (geen kweek / afwachten). Welke vraag verschijnt als beide spelen?"
    },
    {
      id: "I7",
      ernst: 3,
      geldtIn: ["*"],
      predicaat: {
        p: "en",
        args: [
          { p: "waar", veld: "risicogroep", op: "==", waarde: true },
          { p: "gestart", middel: "V5" },
          {
            p: "of",
            args: [
              {
                p: "niet",
                arg: { p: "opDagRelatief", kaart: "O2", anker: { start: "V5" }, van: 1, tot: 3 }
              },
              {
                p: "niet",
                arg: {
                  p: "opDagRelatief",
                  kaart: "V6",
                  doel: "V5",
                  optie: "halveren",
                  anker: { start: "V5" },
                  van: 3
                }
              }
            ]
          }
        ]
      },
      vraag: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
      vraagVarianten: [
        {
          als: {
            p: "niet",
            arg: { p: "opDagRelatief", kaart: "O2", anker: { start: "V5" }, van: 1, tot: 3 }
          },
          vraag: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
          TODO_BART: "Casus geeft bij I7 twee verschillende vragen (geen kalium / niet gehalveerd). Welke vraag verschijnt als beide eisen ontbreken?"
        },
        {
          als: {
            p: "niet",
            arg: {
              p: "opDagRelatief",
              kaart: "V6",
              doel: "V5",
              optie: "halveren",
              anker: { start: "V5" },
              van: 3
            }
          },
          vraag: "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?"
        }
      ],
      bron: "NHG, KNMP",
      TODO_BART: "Lezing van 'O2 (dag 2–4)' en 'V6 (na dag 3)' (I7, episode 2): de casus zegt niet 'na V5'. Lezing A (gekozen): cursusdag = verschil in dagen t.o.v. de dag van V5 plus 1, dus O2 op verschil 1 t/m 3 (V5 op dag 1: O2 op dag 2–4) en V6-halveren op verschil vanaf 3 (dag 4 of later). Lezing B (bouwopdracht 6.1, opDagRelatief(O2,V5,2,4)): O2 op verschil 2 t/m 4 (V5 op dag 1: O2 op dag 3–5). Bij lezing B faalt de casusroute 'V5 dag 1, O2 dag 2'. Welke lezing bedoel je?"
    },
    {
      id: "I8",
      ernst: 4,
      geldtIn: [{ gebeurtenis: "C" }],
      predicaat: {
        p: "en",
        args: [
          { p: "gebeurtenisGeweest", id: "C" },
          { p: "actief", uitSet: "resistent", op: { eindeBeurtNaGebeurtenis: "C", offset: 1 } },
          { p: "klachten", waarde: "aan" }
        ]
      },
      vraag: "De kweek is binnen en de klachten blijven. Waar wacht je nog op?",
      bron: "NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten",
      TODO_BART: "I8 (episode 2): casus zegt 'hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten'. Hoeveel beurten na de kweekuitslag (C) mag het resistente middel nog doorlopen, en vanaf wanneer 'houden de klachten aan'?"
    }
  ],
  score: {
    duurzaamheid: {
      start: 3,
      regels: [{ perKeer: { t: "gespeeld", kaart: "B1", terwijlKlachten: "af" }, delta: -1 }],
      TODO_BART: "Score episode 2: telt alleen een wissel (B1) op een dag met klachtenstatus 'af' als 'onnodig wisselen', en telt 'de voorschrijfkaart' V1–V5 (niet V6)?"
    },
    doelmatigheid: {
      regels: [
        {
          als: {
            p: "en",
            args: [
              { p: "gespeeld", kaart: "G2" },
              {
                p: "niet",
                arg: {
                  p: "of",
                  args: [
                    {
                      p: "en",
                      args: [
                        { p: "gespeeld", kaart: "V1" },
                        {
                          p: "niet",
                          arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V1" } }
                        }
                      ]
                    },
                    {
                      p: "en",
                      args: [
                        { p: "gespeeld", kaart: "V2" },
                        {
                          p: "niet",
                          arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V2" } }
                        }
                      ]
                    },
                    {
                      p: "en",
                      args: [
                        { p: "gespeeld", kaart: "V3" },
                        {
                          p: "niet",
                          arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V3" } }
                        }
                      ]
                    },
                    {
                      p: "en",
                      args: [
                        { p: "gespeeld", kaart: "V4" },
                        {
                          p: "niet",
                          arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V4" } }
                        }
                      ]
                    },
                    {
                      p: "en",
                      args: [
                        { p: "gespeeld", kaart: "V5" },
                        {
                          p: "niet",
                          arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V5" } }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          punten: 3
        },
        { als: { p: "waarheid", waarde: true }, punten: 2 }
      ]
    }
  },
  profielen: [
    {
      naam: "Kweekgestuurd, smal",
      als: { p: "en", args: [{ p: "gespeeld", kaart: "V4" }, { p: "nietGespeeld", kaart: "B1" }] },
      reflectievraag: null,
      TODO_BART: "Reflectievraag voor profiel ontbreekt in de casus (episode 2 geeft alleen de profielnamen, geen reflectievragen)."
    },
    {
      naam: "Bijgestuurd",
      als: {
        p: "en",
        args: [
          { p: "gespeeld", kaart: "V5" },
          { p: "gespeeld", kaart: "B1" },
          { p: "na", a: { kaart: "B1" }, b: { kaart: "V5" } }
        ]
      },
      reflectievraag: null,
      TODO_BART: "Reflectievraag voor profiel ontbreekt in de casus (episode 2 geeft alleen de profielnamen, geen reflectievragen)."
    }
  ],
  feedbackExtra: [
    {
      trigger: {
        p: "of",
        args: [
          {
            p: "en",
            args: [
              { p: "gespeeld", kaart: "V1" },
              { p: "niet", arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V1" } } }
            ]
          },
          {
            p: "en",
            args: [
              { p: "gespeeld", kaart: "V2" },
              { p: "niet", arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V2" } } }
            ]
          },
          {
            p: "en",
            args: [
              { p: "gespeeld", kaart: "V3" },
              { p: "niet", arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V3" } } }
            ]
          },
          {
            p: "en",
            args: [
              { p: "gespeeld", kaart: "V4" },
              { p: "niet", arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V4" } } }
            ]
          },
          {
            p: "en",
            args: [
              { p: "gespeeld", kaart: "V5" },
              { p: "niet", arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V5" } } }
            ]
          }
        ]
      },
      vraag: "Hoe oud was de eGFR waarop je besloot? Wat is er sindsdien met haar gebeurd?",
      wanneer: "alleenBijGehaaldePoort",
      TODO_BART: "Komen de feedbackvragen 'Verouderde eGFR niet opgemerkt' en 'Onnodig gewisseld' ook bij een poortschending (dan zijn het er meer dan één)?"
    },
    {
      trigger: {
        p: "tel",
        teller: { t: "gespeeld", kaart: "B1", terwijlKlachten: "af" },
        op: ">",
        waarde: 0
      },
      vraag: "Het werkte en de klachten namen af. Wat won je met wisselen?",
      wanneer: "alleenBijGehaaldePoort",
      TODO_BART: "Komen de feedbackvragen 'Verouderde eGFR niet opgemerkt' en 'Onnodig gewisseld' ook bij een poortschending (dan zijn het er meer dan één)?"
    }
  ],
  zichtbaarAlsOntbreekt: [
    {
      trigger: { p: "en", args: [{ p: "gestart", middel: "V3" }, { p: "nietGespeeld", kaart: "G2" }] },
      tekst: "De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.",
      TODO_BART: "Zichtbaar als kaart ontbreekt (episode 2): 'Nitrofurantoïne zonder G2' en 'V5 zonder O2' - telt G2/O2 dat later (te laat) wordt gespeeld als 'ontbreekt'?"
    },
    {
      trigger: { p: "en", args: [{ p: "gestart", middel: "V5" }, { p: "nietGespeeld", kaart: "O2" }] },
      tekst: "De kaliumspiegel is onbekend."
    }
  ],
  open: [
    {
      TODO_BART: "Een route zonder enig antibioticum (geen V3, V4, V5, ook geen wissel ernaartoe) in de risicogroep: de casus zegt 'een antibioticum is nodig', maar I6 noemt alleen 'afwachten (V1/V2)'. Telt niets voorschrijven als afwachten?",
      plek: "E2.invarianten.I6"
    },
    {
      TODO_BART: "Vroeg afronden vóór de kweekuitslag (gebeurtenis C) ontloopt I8: de uitslag is dan nog niet gemeld, dus het resistente middel telt niet als doorgelopen. Moet afronden pas kunnen nadat C geweest is (parameter afrondenPasNaGebeurtenissen)?",
      plek: "E2.invarianten.I8"
    },
    {
      TODO_BART: "I7 bij een middel dat al vóór dag 3 is vervangen (V5, dan B1 naar V4, O2 en V6 halveren op het al gestopte V5): de casus zegt 'Trimethoprim 7 dagen zonder O2 ... of zonder V6 na dag 3'. Geldt I7 nog als trimethoprim niet 7 dagen loopt?",
      plek: "E2.invarianten.I7"
    },
    {
      TODO_BART: "Een route die de poort haalt maar geen van beide profielen matcht (trimethoprim gevolgd door stoppen zonder wissel) heeft in de casus geen profiel.",
      plek: "E2.profielen"
    }
  ],
  brug: "de kweek uit deze episode is het verborgen gegeven in episode 3 (G3)."
});
window.CASUSSEN[0].todoBart.push(
  {
    id: "TODO_BART-E2-1",
    vraag: "I1 in episode 2: telt een episode zonder enige route (niets gespeeld) ook als 'een route zonder N1'?",
    gekozenLezing: "Strengste lezing, gelijk aan episode 1: elke afronding zonder N1 schendt I1, ook zonder gekozen route.",
    plek: "E2.invarianten.I1"
  },
  {
    id: "TODO_BART-E2-2",
    vraag: "Lezing van 'O2 (dag 2–4)' en 'V6 (na dag 3)' (I7, episode 2): de casus zegt niet 'na V5'. Lezing A (gekozen): cursusdag = verschil in dagen t.o.v. de dag van V5 plus 1, dus O2 op verschil 1 t/m 3 (V5 op dag 1: O2 op dag 2–4) en V6-halveren op verschil vanaf 3 (dag 4 of later). Lezing B (bouwopdracht 6.1, opDagRelatief(O2,V5,2,4)): O2 op verschil 2 t/m 4 (V5 op dag 1: O2 op dag 3–5). Bij lezing B faalt de casusroute 'V5 dag 1, O2 dag 2'. Welke lezing bedoel je?",
    gekozenLezing: "(Contract TODO_BART-1.) Lezing A: verschil in dagen t.o.v. de dag van V5 (V5 zelf = 0): O2 op verschil 1 t/m 3 (V5 op dag 1: dag 2–4, de casusroute is dus speelbaar), V6 halveren op verschil vanaf 3 (dag 4 of later; vgl. feedback 'Dag 4.'). Anker = start van trimethoprim (V5, of B1 met doel V5). Lezing B staat in de vraag.",
    plek: "E2.invarianten.I7"
  },
  {
    id: "TODO_BART-E2-3",
    vraag: "Casus geeft bij I7 twee verschillende vragen (geen kalium / niet gehalveerd). Welke vraag verschijnt als beide eisen ontbreken?",
    gekozenLezing: "De vragen staan beide letterlijk in vraagVarianten; de eerste variant waarvan de voorwaarde klopt wint, volgorde van de casustabel (eerst geen kalium, dan niet gehalveerd). 'vraag' is de eerste.",
    plek: "E2.invarianten.I7.vraagVarianten"
  },
  {
    id: "TODO_BART-E2-4",
    vraag: "Casus geeft bij I6 twee verschillende vragen (geen kweek / afwachten). Welke vraag verschijnt als beide spelen?",
    gekozenLezing: "Beide vragen staan letterlijk in vraagVarianten; volgorde van de casustabel (eerst 'geen kweek', dan 'afwachten'). 'vraag' is de eerste.",
    plek: "E2.invarianten.I6.vraagVarianten"
  },
  {
    id: "TODO_BART-E2-5",
    vraag: "I8 (episode 2): casus zegt 'hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten'. Hoeveel beurten na de kweekuitslag (C) mag het resistente middel nog doorlopen, en vanaf wanneer 'houden de klachten aan'?",
    gekozenLezing: "Bouwopdracht 6.1: 'niet gewisseld (B1) of gestopt (B2) binnen 2 beurten na C' = aan het einde van de tweede beurt (de dag van C plus 1) is een resistent middel (set 'resistent', gezet door C) nog actief, en de klachtenstatus was 'aan'. Een wissel naar een ander resistent middel telt dus niet als bijsturen. De 2 staat als offset (1) in de data en is instelbaar.",
    plek: "E2.invarianten.I8"
  },
  {
    id: "TODO_BART-E2-6",
    vraag: "De doorlooptijd van de kweek (2–4 dagen) kwam via Mistral en is niet zelf gecheckt. Klopt 'na de 4e gespeelde kaart', en wat als O1 pas na de 4e kaart wordt gespeeld?",
    gekozenLezing: "Letterlijk: trigger na de 4e gespeelde kaart, alleen als O1 dan gespeeld is. Is O1 op dat moment niet gespeeld, dan komt er geen kweekuitslag in deze poging.",
    plek: "E2.gebeurtenissen.C"
  },
  {
    id: "TODO_BART-E2-7",
    vraag: "Moet de zin 'Daarmee valt ze in de risicogroep: een antibioticum is nodig, met een kweek vóór de eerste dosis, en nitrofurantoïne valt af [NHG].' bij het onthullen van G2 aan de speler getoond worden (botst met 'feedback zegt niet voor')?",
    gekozenLezing: "Alleen 'eGFR 29 uit de jaarlijkse controle' wordt getoond. De zin over de risicogroep staat als 'toelichting' in de data (voor Bart/overzicht), niet in de interface.",
    plek: "E2.patient.verborgen[G2]"
  },
  {
    id: "TODO_BART-E2-8",
    vraag: "Reflectievraag voor profiel ontbreekt in de casus (episode 2 geeft alleen de profielnamen, geen reflectievragen).",
    gekozenLezing: "reflectievraag = null voor Kweekgestuurd, smal en voor Bijgestuurd.",
    plek: "E2.profielen"
  },
  {
    id: "TODO_BART-E2-9",
    vraag: "Statusteksten in episode 2: de casus geeft alleen de fragmenten 'klachten houden aan' (trimethoprim) en 'klachten nemen af' (fosfomycine). Welke hoofdletter/punt, en is 'Na 48 uur geen verbetering.' ook in episode 2 bedoeld?",
    gekozenLezing: "af = 'klachten nemen af', aan = 'klachten houden aan' (letterlijke fragmenten); geenVerbetering48 = null (komt in episode 2 niet voor, er is geen gebeurtenis A).",
    plek: "E2.statusTeksten"
  },
  {
    id: "TODO_BART-E2-10",
    vraag: "Een route die de poort haalt maar geen van beide profielen matcht (trimethoprim gevolgd door stoppen zonder wissel) heeft in de casus geen profiel.",
    gekozenLezing: "Geen extra profiel verzonnen: de evaluatie levert dan geen profiel. Profiel 'Kweekgestuurd, smal' = V4 gespeeld en geen B1; 'Bijgestuurd' = V5, daarna B1.",
    plek: "E2.profielen"
  },
  {
    id: "TODO_BART-E2-11",
    vraag: "Score episode 2: telt alleen een wissel (B1) op een dag met klachtenstatus 'af' als 'onnodig wisselen', en telt 'de voorschrijfkaart' V1–V5 (niet V6)?",
    gekozenLezing: "Alleen een B1 op een dag met klachtenstatus 'af' kost 1 punt duurzaamheid (start 3); 'de voorschrijfkaart' = V1 t/m V5: doelmatigheid 3 als G2 vóór elke gespeelde V1-V5 ligt, anders 2.",
    plek: "E2.score"
  },
  {
    id: "TODO_BART-E2-12",
    vraag: "Komen de feedbackvragen 'Verouderde eGFR niet opgemerkt' en 'Onnodig gewisseld' ook bij een poortschending (dan zijn het er meer dan één)?",
    gekozenLezing: "Alleen bij een gehaalde poort (bij een schending verschijnt maar één vraag, A4).",
    plek: "E2.feedbackExtra"
  },
  {
    id: "TODO_BART-E2-15",
    vraag: "Een route zonder enig antibioticum (geen V3, V4, V5, ook geen wissel ernaartoe) in de risicogroep: de casus zegt 'een antibioticum is nodig', maar I6 noemt alleen 'afwachten (V1/V2)'. Telt niets voorschrijven als afwachten?",
    gekozenLezing: "Strengste lezing: ja. Een risicogroep-episode zonder gestart antibioticum schendt I6, met de afwachten-vraag ('Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?').",
    plek: "E2.invarianten.I6"
  },
  {
    id: "TODO_BART-E2-16",
    vraag: "Vroeg afronden vóór de kweekuitslag (gebeurtenis C) ontloopt I8: de uitslag is dan nog niet gemeld, dus het resistente middel telt niet als doorgelopen. Moet afronden pas kunnen nadat C geweest is (parameter afrondenPasNaGebeurtenissen)?",
    gekozenLezing: "Aansluitend op contract TODO_BART-4: de data blokkeert niets; I8 geldt alleen als C geweest is (geldtIn). De instelbare parameter afrondenPasNaGebeurtenissen (standaard uit) bepaalt of vroeg afronden kan. Let op: C komt alleen als O1 gespeeld is.",
    plek: "E2.invarianten.I8"
  },
  {
    id: "TODO_BART-E2-17",
    vraag: "I7 bij een middel dat al vóór dag 3 is vervangen (V5, dan B1 naar V4, O2 en V6 halveren op het al gestopte V5): de casus zegt 'Trimethoprim 7 dagen zonder O2 ... of zonder V6 na dag 3'. Geldt I7 nog als trimethoprim niet 7 dagen loopt?",
    gekozenLezing: "Strengste lezing: I7 geldt zodra V5 gestart is (ook als het middel later wordt vervangen), tenzij O2 en V6 halveren op tijd zijn gespeeld.",
    plek: "E2.invarianten.I7"
  },
  {
    id: "TODO_BART-E2-14",
    vraag: "Zichtbaar als kaart ontbreekt (episode 2): 'Nitrofurantoïne zonder G2' en 'V5 zonder O2' - telt G2/O2 dat later (te laat) wordt gespeeld als 'ontbreekt'?",
    gekozenLezing: "Letterlijk: 'zonder' = de kaart is nooit gespeeld (een te late G2 of O2 telt als gespeeld).",
    plek: "E2.zichtbaarAlsOntbreekt"
  }
);
}

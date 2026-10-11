/* Episode 3 (level 3) van casus uwi-eerstelijn. Alleen data. Bron: casus-uwi.md sectie 6 + bouwopdracht 6.1/6.3/6.5/6.6. */
if (window.CASUSSEN && window.CASUSSEN[0]) {
window.CASUSSEN[0].episodes.push({
  id: "E3",
  level: 3,
  titel: "Episode 3 — level 3",
  startToestanden: ["cystitis"],
  knoppen: {
    actiesPerBeurt: 3,
    aantalDagen: 7,
    raadplegenKost: 1,
    TODO_BART: "Acties per beurt in episode 3: de casus noemt 'krap', bouwopdracht 6.6 zegt 3 (zelfde als E1 en E2)."
  },
  raadplegen: { titel: "Richtlijn raadplegen", bronnen: ["NHG", "SIDRIK", "Kompas", "KNMP"] },
  antibiotica: ["V3", "V4", "V5", "V7", "V8", "V9", "V10"],
  patient: {
    zichtbaar: {
      naam: "Mevrouw V.",
      leeftijd: 79,
      tijdSindsVorige: "1 jaar na episode 2",
      klachten: "Cystitis, geen koorts.",
      medicatie: ["lisinopril", "spironolacton", "calcium/colecalciferol"],
      lab: { eGFR: 28, datum: "recent" },
      labTekst: "eGFR 28, recent.",
      risicogroep: "Risicogroep [NHG]."
    },
    waar: { eGFR: 28, risicogroep: true },
    medicatie: [
      { id: "lisinopril", label: "lisinopril" },
      { id: "spironolacton", label: "spironolacton" },
      { id: "calcium", label: "calcium/colecalciferol" }
    ],
    toelichting: "Wie spironolacton heeft gestart en waarom, staat er bewust niet op. Het leerpunt: als de nierfunctie daalt, kijk je niet alleen naar wat je nu voorschrijft, maar naar alles wat de patiënt al gebruikt. In de praktijk wordt dat vaak gemist.",
    verborgen: [
      {
        kaart: "G3",
        sleutel: "eerdereKweek",
        onthult: "de kweek uit episode 2, met trimethoprim resistent",
        zichtbaar: { eerdereKweek: "de kweek uit episode 2, met trimethoprim resistent" },
        toelichting: "Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG]."
      }
    ],
    TODO_BART: "Patiëntkaart: 'spironolacton (hypertensie)' in de medicatieregel, terwijl bij spironolacton bewust niet staat wie het startte en waarom."
  },
  repertoire: [
    "G1",
    "G2",
    "G3",
    "O1",
    "O2",
    "V1",
    "V2",
    "V3",
    "V4",
    "V5",
    "V6",
    "V7",
    "V8",
    "V9",
    "V10",
    "B1",
    "B2",
    "B3",
    "B5",
    "B4",
    "N1",
    "N2",
    "N3",
    "Ev1",
    "Ev2",
    "Ev3"
  ],
  gebeurtenissen: [
    {
      id: "A",
      groep: "AB",
      trigger: { type: "naKaart", n: 4 },
      toestand: "weefselinvasie",
      zet: { statusNaBeurten: 2 },
      tekst: "Weefselinvasie: koorts 38,6 °C en flankpijn",
      opmerking: "De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler.",
      TODO_BART: "Vroeg afronden vóór gebeurtenis A of B (en dus ontlopen van I10, I11, I15, I16)? (TODO_BART-4)"
    },
    {
      id: "B",
      groep: "AB",
      trigger: { type: "naKaart", n: 7 },
      toestand: "uitdroging",
      tekst: "Uitdroging: eet en drinkt slecht, twee dagen koorts. Daarmee is de SIDRIK-drempel gehaald (koorts ≥ 38,5 °C gedurende 2 dagen en/of braken of diarree > 3× per dag) [SIDRIK]",
      opmerking: "De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler."
    },
    {
      id: "C",
      trigger: { type: "naKaartVanKaart", kaart: "O1", n: 3, alleenAlsGespeeld: "O1" },
      tekst: "Kweekuitslag. E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine en nitrofurantoïne.",
      zet: { resistent: ["V5", "V10"], gevoelig: ["V8", "V7", "V4", "V3"] },
      TODO_BART: "Komt er een tweede kweekuitslag als O1 in episode 3 nog een keer gespeeld wordt (na A)? (TODO_BART-6)"
    }
  ],
  werkzaamheid: {
    cystitis: { werkzaam: [{ kaart: "V4" }, { kaart: "V9" }], nietWerkzaam: [{ kaart: "V3" }, { kaart: "V5" }] },
    weefselinvasie: {
      werkzaam: [
        { kaart: "V8" },
        { kaart: "V9" },
        {
          kaart: "V7",
          als: {
            p: "of",
            args: [{ p: "gespeeld", K: { kaart: "B4" } }, { p: "gespeeld", K: { kaart: "B3", doel: "calcium" } }]
          }
        }
      ],
      nietWerkzaam: [
        { kaart: "V3" },
        { kaart: "V4" },
        { kaart: "V10" },
        {
          kaart: "V7",
          als: {
            p: "niet",
            arg: {
              p: "of",
              args: [{ p: "gespeeld", K: { kaart: "B4" } }, { p: "gespeeld", K: { kaart: "B3", doel: "calcium" } }]
            }
          }
        }
      ],
      TODO_BART: "Werkzaamheid in episode 3 (bouwopdracht 6.3): niet genoemd zijn V7 en V8 bij cystitis en V5 bij weefselinvasie; V9 is 'wel werkzaam'."
    }
  },
  statusTeksten: {
    af: "klachten nemen af",
    aan: "klachten houden aan",
    geenVerbetering48: "Na 48 uur geen verbetering.",
    TODO_BART: "Welke tekst hoort bij welke klachtenstatus in episode 3?"
  },
  invarianten: [
    {
      id: "I1",
      ernst: 5,
      geldtIn: ["*"],
      altijdFout: "Een route zonder N1",
      geldtInTekst: "E1–E3",
      predicaat: { p: "nietGespeeld", K: { kaart: "N1" } },
      vraag: "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",
      bron: "NHG",
      TODO_BART: "I1 in episode 3: telt een episode zonder enige route ook als 'een route zonder N1'? (zoals TODO_BART-E1-1)"
    },
    {
      id: "I4",
      ernst: 5,
      geldtIn: ["*"],
      altijdFout: "Twee antibiotica tegelijk",
      geldtInTekst: "E1–E3",
      predicaat: { p: "aantalActieveAntibiotica", op: ">", n: 1 },
      vraag: "Wat lost het tweede middel op dat het eerste niet oplost?",
      bron: "[G]"
    },
    {
      id: "I5",
      ernst: 2,
      geldtIn: ["*"],
      altijdFout: "Nitrofurantoïne bij eGFR < 30, ook als de kweek \"gevoelig\" zegt",
      geldtInTekst: "E2, E3",
      predicaat: { p: "en", args: [{ p: "gestart", middel: "V3" }, { p: "waar", veld: "eGFR", op: "<", waarde: 30 }] },
      vraag: "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?",
      bron: "NHG"
    },
    {
      id: "I6",
      ernst: 4,
      geldtIn: ["*"],
      altijdFout: "Een antibioticum starten zonder O1 vooraf, of afwachten (V1/V2) in de risicogroep",
      geldtInTekst: "E2, E3",
      predicaat: {
        p: "en",
        args: [
          { p: "waar", veld: "risicogroep", op: "==", waarde: true },
          {
            p: "of",
            args: [
              {
                p: "en",
                args: [
                  { p: "gespeeld", K: { kaartUit: "antibiotica" } },
                  {
                    p: "niet",
                    arg: {
                      p: "en",
                      args: [
                        { p: "gespeeld", K: { kaart: "O1" } },
                        { p: "voor", a: { kaart: "O1" }, b: { kaartUit: "antibiotica" } }
                      ]
                    }
                  }
                ]
              },
              { p: "of", args: [{ p: "gespeeld", K: { kaart: "V1" } }, { p: "gespeeld", K: { kaart: "V2" } }] }
            ]
          }
        ]
      },
      vraag: "Wat vertelt een kweek van urine die al antibioticum heeft gezien?",
      bron: "NHG",
      vraagVarianten: [
        {
          als: {
            p: "en",
            args: [
              { p: "gespeeld", K: { kaartUit: "antibiotica" } },
              {
                p: "niet",
                arg: {
                  p: "en",
                  args: [
                    { p: "gespeeld", K: { kaart: "O1" } },
                    { p: "voor", a: { kaart: "O1" }, b: { kaartUit: "antibiotica" } }
                  ]
                }
              }
            ]
          },
          vraag: "Wat vertelt een kweek van urine die al antibioticum heeft gezien?"
        },
        {
          als: { p: "of", args: [{ p: "gespeeld", K: { kaart: "V1" } }, { p: "gespeeld", K: { kaart: "V2" } }] },
          vraag: "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?"
        }
      ],
      TODO_BART: "I6 en I7 hebben elk twee Socratische vragen in de casus, maar één invariant."
    },
    {
      id: "I7",
      ernst: 3,
      geldtIn: ["*"],
      altijdFout: "Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3",
      geldtInTekst: "E2, E3",
      predicaat: {
        p: "en",
        args: [
          { p: "gestart", middel: "V5" },
          { p: "waar", veld: "risicogroep", op: "==", waarde: true },
          {
            p: "of",
            args: [
              { p: "niet", arg: { p: "opDagRelatief", K: { kaart: "O2" }, anker: { start: "V5" }, van: 2, tot: 4 } },
              {
                p: "niet",
                arg: {
                  p: "opDagRelatief",
                  K: { kaart: "V6", doel: "V5", optie: "halveren" },
                  anker: { start: "V5" },
                  van: 3
                }
              }
            ]
          }
        ]
      },
      vraag: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
      bron: "NHG, KNMP",
      vraagVarianten: [
        {
          als: { p: "niet", arg: { p: "opDagRelatief", K: { kaart: "O2" }, anker: { start: "V5" }, van: 2, tot: 4 } },
          vraag: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?"
        },
        {
          als: {
            p: "niet",
            arg: { p: "opDagRelatief", K: { kaart: "V6", doel: "V5", optie: "halveren" }, anker: { start: "V5" }, van: 3 }
          },
          vraag: "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?"
        }
      ],
      TODO_BART: "I7 in episode 3: wat betekent 'dag 2–4 na de start' en 'vanaf dag 3 na de start'? (TODO_BART-1)"
    },
    {
      id: "I8",
      ernst: 4,
      geldtIn: [{ gebeurtenis: "C" }],
      altijdFout: "Bij aanhoudende klachten doorgaan met een middel waarvoor de bacterie resistent is",
      geldtInTekst: "E3 · elke toestand, zodra de kweekuitslag (C) binnen is",
      predicaat: {
        p: "en",
        args: [
          { p: "gebeurtenisGeweest", id: "C" },
          { p: "actief", uitSet: "resistent", op: { eindeBeurtNaGebeurtenis: "C", offset: 1 } },
          {
            p: "of",
            args: [
              { p: "klachten", waarde: "aan", op: { eindeBeurtNaGebeurtenis: "C", offset: 0 } },
              { p: "klachten", waarde: "geenVerbetering48", op: { eindeBeurtNaGebeurtenis: "C", offset: 0 } }
            ]
          }
        ]
      },
      vraag: "De kweek is binnen en de klachten blijven. Waar wacht je nog op?",
      bron: "NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten"
    },
    {
      id: "I9",
      ernst: 3,
      geldtIn: ["*"],
      altijdFout: "De combinatie lisinopril + spironolacton bij eGFR < 30 laten liggen (geen O2 én geen Ev2), of spironolacton na de sick day hervatten (B5) zonder eerst Ev2",
      geldtInTekst: "Alle toestanden van E3",
      predicaat: {
        p: "of",
        args: [
          {
            p: "en",
            args: [
              { p: "waar", veld: "eGFR", op: "<", waarde: 30 },
              { p: "nietGespeeld", K: { kaart: "O2" } },
              { p: "nietGespeeld", K: { kaart: "Ev2", doel: "spironolacton" } }
            ]
          },
          {
            p: "en",
            args: [
              { p: "gespeeld", K: { kaart: "B5", doel: "spironolacton" } },
              {
                p: "niet",
                arg: {
                  p: "en",
                  args: [
                    { p: "gespeeld", K: { kaart: "Ev2", doel: "spironolacton" } },
                    {
                      p: "voor",
                      a: { kaart: "Ev2", doel: "spironolacton" },
                      b: { kaart: "B5", doel: "spironolacton" }
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      vraag: "Haar nierfunctie is 28. Welk van haar vaste middelen begon toen die nog hoger was, en wie kijkt daar nu naar?",
      bron: "Bart; SIDRIK; herstart-nuance [G]",
      TODO_BART: "I9: de casus zegt 'geen O2 én geen Ev2' (schending alleen als beide ontbreken); bouwopdracht 6.1 zegt 'O2 of Ev2 ontbreekt'. Welke lezing geldt? (TODO_BART-2)"
    },
    {
      id: "I10",
      ernst: 2,
      geldtIn: ["weefselinvasie"],
      altijdFout: "Bij weefselinvasie doorgaan met nitrofurantoïne of fosfomycine: onvoldoende concentratie in het weefsel",
      geldtInTekst: "Met A",
      predicaat: { p: "actief", middel: ["V3", "V4"], op: { eindeBeurtNaGebeurtenis: "A", offset: 0 } },
      vraag: "Fosfomycine werkt in de blaas. Waar zit de infectie nu?",
      bron: "NHG",
      TODO_BART: "I10, I11, I13, I14, I15, I16: wat is 'dezelfde beurt', 'de beurt na A' en 'tussen A en de wissel'?"
    },
    {
      id: "I11",
      ernst: 4,
      geldtIn: ["weefselinvasie"],
      altijdFout: "Bij weefselinvasie wisselen zonder eerst een nieuwe kweek",
      geldtInTekst: "Met A",
      predicaat: {
        p: "en",
        args: [
          { p: "gespeeld", K: { kaart: ["B1", "V3", "V4", "V5", "V7", "V8", "V9", "V10"], naGebeurtenis: "A" } },
          {
            p: "niet",
            arg: {
              p: "en",
              args: [
                { p: "gespeeld", K: { kaart: "O1", naGebeurtenis: "A" } },
                {
                  p: "voor",
                  a: { kaart: "O1", naGebeurtenis: "A" },
                  b: { kaart: ["B1", "V3", "V4", "V5", "V7", "V8", "V9", "V10"], naGebeurtenis: "A" }
                }
              ]
            }
          }
        ]
      },
      vraag: "Je wisselt. Waarop baseer je de wissel daarna?",
      bron: "NHG"
    },
    {
      id: "I12",
      ernst: 1,
      geldtIn: ["*"],
      altijdFout: "Cotrimoxazol voorschrijven",
      geldtInTekst: "Alle",
      predicaat: { p: "gespeeld", K: { kaart: "V9" } },
      vraag: "Cotrimoxazol naast spironolacton bij een eGFR van 28. Wat doet dat met haar kalium?",
      bron: "NHG, Kompas"
    },
    {
      id: "I13",
      ernst: 3,
      geldtIn: ["*"],
      altijdFout: "Amoxicilline/clavulaanzuur zonder V6 naar 875/125 mg 2 dd",
      geldtInTekst: "Alle",
      predicaat: {
        p: "en",
        args: [
          { p: "waar", veld: "eGFR", op: "<", waarde: 30 },
          { p: "gestart", middel: "V8" },
          {
            p: "niet",
            arg: {
              p: "opDagRelatief",
              K: { kaart: "V6", doel: "V8", optie: "875/125 mg 2 dd" },
              anker: { start: "V8" },
              van: 0,
              tot: 0
            }
          }
        ]
      },
      vraag: "Clavulaanzuur bij een eGFR van 28. Waar blijft het?",
      bron: "NHG"
    },
    {
      id: "I14",
      ernst: 3,
      geldtIn: ["*"],
      altijdFout: "Ciprofloxacine zonder B4 (scheiden van calcium) en zonder B3 (calcium tijdelijk stoppen)",
      geldtInTekst: "Met ciprofloxacine",
      predicaat: {
        p: "en",
        args: [
          { p: "gestart", middel: "V7" },
          { p: "medicatieActief", id: "calcium", op: { naKaart: { start: "V7" } } },
          {
            p: "niet",
            arg: {
              p: "of",
              args: [
                { p: "opDagRelatief", K: { kaart: "B4" }, anker: { start: "V7" }, van: 0, tot: 1 },
                { p: "opDagRelatief", K: { kaart: "B3", doel: "calcium" }, anker: { start: "V7" }, van: 0, tot: 1 }
              ]
            }
          }
        ]
      },
      vraag: "Ze neemt elke ochtend calcium. Hoeveel van je ciprofloxacine komt in haar bloed?",
      bron: "Kompas; B3-route [G]",
      TODO_BART: "I14: de toestandstabel zet I14 alleen bij weefselinvasie, de invariantentabel zegt 'Met ciprofloxacine'; bouwopdracht 6.1 zegt 'E3'. Waar geldt I14? En: B4 'op calcium' (bouwopdracht) of op ciprofloxacine (kaartdoelen)?"
    },
    {
      id: "I15",
      ernst: 2,
      geldtIn: ["uitdroging"],
      altijdFout: "Na het halen van de sick day-drempel niet: spironolacton stoppen, lisinopril halveren, drinkadvies, monitoring binnen 1–3 dagen",
      geldtInTekst: "Met B",
      predicaat: {
        p: "niet",
        arg: {
          p: "en",
          args: [
            { p: "binnenBeurten", K: { kaart: "B3", doel: "spironolacton" }, naGebeurtenis: "B", n: 2 },
            {
              p: "binnenBeurten",
              K: { kaart: "V6", doel: "lisinopril", optie: "halveren" },
              naGebeurtenis: "B",
              n: 2
            },
            { p: "binnenBeurten", K: { kaart: "N3" }, naGebeurtenis: "B", n: 2 },
            { p: "binnenBeurten", K: { kaart: "Ev1" }, naGebeurtenis: "B", n: 2 }
          ]
        }
      },
      vraag: "Ze drinkt nauwelijks en heeft twee dagen koorts. Wat doen lisinopril en spironolacton met een nier die al droog staat?",
      bron: "SIDRIK"
    },
    {
      id: "I16",
      ernst: 3,
      geldtIn: ["weefselinvasie"],
      altijdFout: "Geen contact binnen 48 uur, of geen verwijzing als ze dan niet beter is",
      geldtInTekst: "Met A",
      predicaat: {
        p: "of",
        args: [
          { p: "niet", arg: { p: "binnenBeurten", K: { kaart: "Ev1" }, naGebeurtenis: "A", n: 2 } },
          {
            p: "en",
            args: [{ p: "klachten", waarde: "geenVerbetering48" }, { p: "nietGespeeld", K: { kaart: "Ev3" } }]
          }
        ]
      },
      vraag: "Het is 48 uur later en ze is niet beter. Wat is je volgende kaart, en is die nog aan jou?",
      bron: "NHG",
      TODO_BART: "Eisen 'binnen n beurten' (I15, I16, I10) bij vroeg afronden: telt een onvervulde eis als schending? (TODO_BART-3)"
    }
  ],
  score: {
    duurzaamheid: {
      regels: [
        {
          als: { p: "en", args: [{ p: "gestart", middel: "V8" }, { p: "niet", arg: { p: "gestart", middel: "V7" } }] },
          punten: 3
        },
        {
          als: {
            p: "en",
            args: [{ p: "gestart", middel: "V7" }, { p: "gespeeld", K: { start: "V8", naGebeurtenis: "C" } }]
          },
          punten: 3
        },
        { als: { p: "gestart", middel: "V7" }, punten: 2 }
      ],
      TODO_BART: "Profielen en score in episode 3: wat gebeurt er bij routes zonder ciprofloxacine of amoxicilline/clavulaanzuur (bijvoorbeeld alleen fosfomycine of verwijzen), en welk profiel hoort bij ciprofloxacine met de-escalatie naar amoxicilline/clavulaanzuur?"
    },
    doelmatigheid: {
      regels: [
        {
          als: {
            p: "en",
            args: [
              { p: "gespeeld", K: { kaart: "G3" } },
              {
                p: "alsDan",
                als: { p: "gespeeld", K: { kaart: ["V1", "V2", "V3", "V4", "V5", "V7", "V8", "V9", "V10"] } },
                dan: {
                  p: "voor",
                  a: { kaart: "G3" },
                  b: { kaart: ["V1", "V2", "V3", "V4", "V5", "V7", "V8", "V9", "V10"] }
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
      naam: "Kweekgestuurd",
      als: { p: "gestart", middel: "V8" },
      reflectievraag: null,
      TODO_BART: "Reflectievraag voor profiel Kweekgestuurd (episode 3) ontbreekt in de casus."
    },
    {
      naam: "Richtlijn eerste keus",
      als: { p: "gestart", middel: "V7" },
      reflectievraag: "Eerste keus volgens de richtlijn. Gold die eerste keus ook voor déze patiënt?"
    }
  ],
  feedbackExtra: [
    {
      trigger: { p: "gespeeld", K: { kaart: "B5" } },
      vraag: "De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?",
      wanneer: "alleenBijGehaaldePoort",
      TODO_BART: "Feedbackvragen 'Automatische herstart' en 'Ciprofloxacine-dosis (bronconflict)': de casus noemt geen trigger en niet of ze ook bij een poortschending verschijnen."
    },
    {
      trigger: { p: "gestart", middel: "V7" },
      vraag: "De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?",
      wanneer: "alleenBijGehaaldePoort",
      TODO_BART: "Feedbackvragen 'Automatische herstart' en 'Ciprofloxacine-dosis (bronconflict)': de casus noemt geen trigger en niet of ze ook bij een poortschending verschijnen."
    }
  ],
  zichtbaarAlsOntbreekt: [
    {
      trigger: {
        p: "en",
        args: [
          { p: "gebeurtenisGeweest", id: "B" },
          { p: "nietGespeeld", K: { kaart: "B3", doel: "spironolacton" } },
          { p: "nietGespeeld", K: { kaart: "V6", doel: "lisinopril", optie: "halveren" } },
          { p: "nietGespeeld", K: { kaart: "N3" } },
          { p: "nietGespeeld", K: { kaart: "Ev1" } }
        ]
      },
      tekst: "De nierfunctie daalt verder en het kalium stijgt.",
      TODO_BART: "'Geen sick day-maatregelen' (zichtbaar als een kaart ontbreekt): geen enkele maatregel, of ook als er één ontbreekt?"
    },
    {
      trigger: {
        p: "en",
        args: [
          { p: "gestart", middel: "V7" },
          { p: "medicatieActief", id: "calcium", op: { naKaart: { start: "V7" } } },
          {
            p: "niet",
            arg: {
              p: "of",
              args: [
                { p: "opDagRelatief", K: { kaart: "B4" }, anker: { start: "V7" }, van: 0, tot: 1 },
                { p: "opDagRelatief", K: { kaart: "B3", doel: "calcium" }, anker: { start: "V7" }, van: 0, tot: 1 }
              ]
            }
          }
        ]
      },
      tekst: "Na 48 uur geen verbetering."
    },
    {
      trigger: {
        p: "of",
        args: [
          {
            p: "en",
            args: [
              { p: "waar", veld: "eGFR", op: "<", waarde: 30 },
              { p: "nietGespeeld", K: { kaart: "O2" } },
              { p: "nietGespeeld", K: { kaart: "Ev2", doel: "spironolacton" } }
            ]
          },
          {
            p: "en",
            args: [
              { p: "gespeeld", K: { kaart: "B5", doel: "spironolacton" } },
              {
                p: "niet",
                arg: {
                  p: "en",
                  args: [
                    { p: "gespeeld", K: { kaart: "Ev2", doel: "spironolacton" } },
                    {
                      p: "voor",
                      a: { kaart: "Ev2", doel: "spironolacton" },
                      b: { kaart: "B5", doel: "spironolacton" }
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      tekst: "Het kalium is onbekend, en niemand heeft naar spironolacton gekeken."
    }
  ]
});
window.CASUSSEN[0].todoBart.push(
  {
    id: "TODO_BART-E3-1",
    vraag: "I9: de casus zegt 'geen O2 én geen Ev2' (schending alleen als beide ontbreken); bouwopdracht 6.1 zegt 'O2 of Ev2 ontbreekt'. Welke lezing geldt? (TODO_BART-2)",
    gekozenLezing: "Casus-lezing: I9 is geschonden als eGFR < 30 en zowel O2 als Ev2 op spironolacton ontbreken, of als B5 op spironolacton gespeeld is zonder eerdere Ev2 op spironolacton. Ev2 op lisinopril telt niet mee.",
    plek: "E3.invarianten.I9"
  },
  {
    id: "TODO_BART-E3-2",
    vraag: "Eisen 'binnen n beurten' (I15, I16, I10) bij vroeg afronden: telt een onvervulde eis als schending? (TODO_BART-3)",
    gekozenLezing: "Ja: schendingen worden bepaald op de eindstand; een eis die bij afronden nog niet vervuld is, telt als geschonden. Geldt alleen als gebeurtenis A of B geweest is.",
    plek: "E3.invarianten.I10, I15, I16"
  },
  {
    id: "TODO_BART-E3-3",
    vraag: "Vroeg afronden vóór gebeurtenis A of B (en dus ontlopen van I10, I11, I15, I16)? (TODO_BART-4)",
    gekozenLezing: "De data legt geen regel vast; de engine-parameter 'afrondenPasNaGebeurtenissen' (standaard uit) is hier bepalend. I10, I11, I15 en I16 gelden alleen in de toestand van hun gebeurtenis.",
    plek: "E3.gebeurtenissen A, B; E3.invarianten.I10, I11, I15, I16"
  },
  {
    id: "TODO_BART-E3-4",
    vraag: "Komt er een tweede kweekuitslag als O1 in episode 3 nog een keer gespeeld wordt (na A)? (TODO_BART-6)",
    gekozenLezing: "Nee: C triggert maar één keer, drie kaarten na de eerste O1.",
    plek: "E3.gebeurtenissen.C"
  },
  {
    id: "TODO_BART-E3-5",
    vraag: "I10, I11, I13, I14, I15, I16: wat is 'dezelfde beurt', 'de beurt na A' en 'tussen A en de wissel'?",
    gekozenLezing: "De beurt van een gebeurtenis is de dag waarop de banner verscheen (begin van de volgende dag). 'Eind van de beurt na A' = einde van die dag (offset 0); 'binnen 2 beurten' = die dag en de dag erna; 'na A' = kaarten gespeeld vanaf die dag.",
    plek: "E3.invarianten.I10, I11, I13, I14, I15, I16"
  },
  {
    id: "TODO_BART-E3-6",
    vraag: "I14: de toestandstabel zet I14 alleen bij weefselinvasie, de invariantentabel zegt 'Met ciprofloxacine'; bouwopdracht 6.1 zegt 'E3'. Waar geldt I14? En: B4 'op calcium' (bouwopdracht) of op ciprofloxacine (kaartdoelen)?",
    gekozenLezing: "Strengste lezing: geldt in elke toestand zodra ciprofloxacine gestart is (geldtIn \"*\"). B4 telt op elk doel; B3 alleen op calcium; beide in dezelfde of de volgende beurt als de start van ciprofloxacine, tenzij calcium dan al gepauzeerd is.",
    plek: "E3.invarianten.I14"
  },
  {
    id: "TODO_BART-E3-7",
    vraag: "I1 in episode 3: telt een episode zonder enige route ook als 'een route zonder N1'? (zoals TODO_BART-E1-1)",
    gekozenLezing: "Strengste lezing: elke afronding zonder N1 schendt I1.",
    plek: "E3.invarianten.I1"
  },
  {
    id: "TODO_BART-E3-8",
    vraag: "Patiëntkaart: 'spironolacton (hypertensie)' in de medicatieregel, terwijl bij spironolacton bewust niet staat wie het startte en waarom.",
    gekozenLezing: "Spironolacton staat zonder reden en zonder startgegevens op de kaart (de lijst met medicatie noemt alleen de namen); de casusregel met '(hypertensie)' staat niet in de interface.",
    plek: "E3.patient.zichtbaar.medicatie"
  },
  {
    id: "TODO_BART-E3-9",
    vraag: "Werkzaamheid in episode 3 (bouwopdracht 6.3): niet genoemd zijn V7 en V8 bij cystitis en V5 bij weefselinvasie; V9 is 'wel werkzaam'.",
    gekozenLezing: "Alleen wat in 6.3 staat is werkzaam (cystitis: V4; weefselinvasie: V8, en V7 alleen met B4 of B3 op calcium), plus V9 in beide toestanden; al het andere geldt als niet werkzaam. De toestand uitdroging heeft geen eigen tabel (cystitis of weefselinvasie geldt).",
    plek: "E3.werkzaamheid"
  },
  {
    id: "TODO_BART-E3-10",
    vraag: "Welke tekst hoort bij welke klachtenstatus in episode 3?",
    gekozenLezing: "af = 'klachten nemen af', aan = 'klachten houden aan', geenVerbetering48 = 'Na 48 uur geen verbetering.' (letterlijke fragmenten uit E2/E3).",
    plek: "E3.statusTeksten"
  },
  {
    id: "TODO_BART-E3-11",
    vraag: "Profielen en score in episode 3: wat gebeurt er bij routes zonder ciprofloxacine of amoxicilline/clavulaanzuur (bijvoorbeeld alleen fosfomycine of verwijzen), en welk profiel hoort bij ciprofloxacine met de-escalatie naar amoxicilline/clavulaanzuur?",
    gekozenLezing: "Geen profiel en geen duurzaamheidsregel voor routes zonder V7 of V8. Amoxicilline/clavulaanzuur gestart (ook na ciprofloxacine) = Kweekgestuurd; anders ciprofloxacine = Richtlijn eerste keus. Duurzaamheid: V8 zonder V7 = 3, V7 met wissel naar V8 na C = 3, V7 anders = 2.",
    plek: "E3.profielen; E3.score.duurzaamheid"
  },
  {
    id: "TODO_BART-E3-12",
    vraag: "Reflectievraag voor profiel Kweekgestuurd (episode 3) ontbreekt in de casus.",
    gekozenLezing: "reflectievraag = null.",
    plek: "E3.profielen.Kweekgestuurd"
  },
  {
    id: "TODO_BART-E3-13",
    vraag: "Feedbackvragen 'Automatische herstart' en 'Ciprofloxacine-dosis (bronconflict)': de casus noemt geen trigger en niet of ze ook bij een poortschending verschijnen.",
    gekozenLezing: "Automatische herstart: zodra B5 gespeeld is. Ciprofloxacine-dosis: zodra ciprofloxacine gestart is (geen poort). Beide alleen bij gehaalde poort, zodat bij een schending één vraag verschijnt (A4).",
    plek: "E3.feedbackExtra"
  },
  {
    id: "TODO_BART-E3-14",
    vraag: "'Geen sick day-maatregelen' (zichtbaar als een kaart ontbreekt): geen enkele maatregel, of ook als er één ontbreekt?",
    gekozenLezing: "Geen van de vier maatregelen (B3 op spironolacton, V6 lisinopril halveren, N3, Ev1) is gespeeld terwijl B geweest is.",
    plek: "E3.zichtbaarAlsOntbreekt[0]"
  },
  {
    id: "TODO_BART-E3-15",
    vraag: "De ernst-volgorde van de invarianten is een voorstel van Claude (bouwopdracht 6.1) en niet door Bart bevestigd.",
    gekozenLezing: "Ernst overgenomen uit bouwopdracht 6.1: I12=1; I5, I10, I15=2; I7, I9, I13, I14, I16=3; I6, I8, I11=4; I1, I4=5. Instelbaar in de data.",
    plek: "E3.invarianten[].ernst"
  },
  {
    id: "TODO_BART-E3-16",
    vraag: "Terugkoppeling van weggelaten kaarten: de casus noemt niet welke weggelaten kaart welke downside toont.",
    gekozenLezing: "Geen `weglaatDownside` in episode 3; de teksten bij ontbrekende kaarten staan in zichtbaarAlsOntbreekt.",
    plek: "E3.invarianten[].weglaatDownside"
  },
  {
    id: "TODO_BART-E3-17",
    vraag: "Acties per beurt in episode 3: de casus noemt 'krap', bouwopdracht 6.6 zegt 3 (zelfde als E1 en E2).",
    gekozenLezing: "3 acties per beurt, 7 dagen, raadplegen kost 1 (bouwopdracht 6.6; instelbaar).",
    plek: "E3.knoppen"
  },
  {
    id: "TODO_BART-E3-18",
    vraag: "I6 en I7 hebben elk twee Socratische vragen in de casus, maar één invariant.",
    gekozenLezing: "De invariant krijgt `vraag` (eerste variant) plus `vraagVarianten` met per variant het predicaat waarvoor de vraag geldt.",
    plek: "E3.invarianten.I6, I7"
  },
  {
    id: "TODO_BART-E3-19",
    vraag: "I7 in episode 3: wat betekent 'dag 2–4 na de start' en 'vanaf dag 3 na de start'? (TODO_BART-1)",
    gekozenLezing: "Verschil in dagen t.o.v. de dag van de start van trimethoprim (het anker zelf is verschil 0): O2 op verschil 2 t/m 4, V6 halveren op verschil 3 of meer (opDagRelatief).",
    plek: "E3.invarianten.I7"
  }
);
}

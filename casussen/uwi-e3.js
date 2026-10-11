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
    casusTekst: ["volledig repertoire (26 kaarten)", "acties per beurt krap", "2 gebeurtenissen in vrije volgorde, plus de kweekuitslag"],
    TODO_BART: "Acties per beurt in episode 3: de casus noemt 'krap', bouwopdracht 6.6 zegt 3 (zelfde als E1 en E2)."
  },
  antibiotica: ["V3", "V4", "V5", "V7", "V8", "V9", "V10"],
  patient: {
    zichtbaar: {
      kop: "Mevrouw V., 79 jaar (1 jaar na episode 2).",
      naam: "Mevrouw V.",
      leeftijd: 79,
      klachten: "Cystitis, geen koorts.",
      medicatie: ["lisinopril", "spironolacton", "calcium/colecalciferol"],
      medicatieTekst: "lisinopril, spironolacton (hypertensie), calcium/colecalciferol.",
      lab: { eGFR: 28, datum: "recent" },
      labTekst: "eGFR 28, recent."
    },
    waar: { eGFR: 28, risicogroep: true },
    medicatie: [
      { id: "lisinopril", label: "lisinopril" },
      { id: "spironolacton", label: "spironolacton" },
      { id: "calcium", label: "calcium/colecalciferol" }
    ],
    casusMedicatieregel: "lisinopril, spironolacton (hypertensie), calcium/colecalciferol.",
    meta: {
      risicogroep: "Risicogroep [NHG].",
      toelichting: "Wie spironolacton heeft gestart en waarom, staat er bewust niet op. Het leerpunt: als de nierfunctie daalt, kijk je niet alleen naar wat je nu voorschrijft, maar naar alles wat de patiënt al gebruikt. In de praktijk wordt dat vaak gemist.",
      TODO_BART: "Mag de student de risicogroepmelding zien? De casus zet bij de patiëntkaart (bij het lab) de zin 'Risicogroep [NHG].' Die zin vertelt vooraf dat deze patiënt in de risicogroep valt. Mag hij bij de patiëntkaart getoond worden, of alleen in het overzicht voor de docent?"
    },
    verborgen: [
      {
        kaart: "G3",
        sleutel: "eerdereKweek",
        onthult: "de kweek uit episode 2, met trimethoprim resistent.",
        zichtbaar: { eerdereKweek: "de kweek uit episode 2, met trimethoprim resistent." },
        meta: { toelichting: "Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG]." }
      }
    ],
    TODO_BART: "Patiëntkaart: de casusregel luidt 'spironolacton (hypertensie)', terwijl de regel eronder zegt dat wie spironolacton startte en waarom bewust niet op de kaart staat. Mag de reden (hypertensie) zichtbaar zijn?"
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
      meta: { opmerking: "De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler." },
      TODO_BART: "Vroeg afronden vóór gebeurtenis A, B of C (en dus ontlopen van I8, I10, I11, I15, I16)?"
    },
    {
      id: "B",
      groep: "AB",
      trigger: { type: "naKaart", n: 7 },
      toestand: "uitdroging",
      tekst: "Uitdroging: eet en drinkt slecht, twee dagen koorts. Daarmee is de SIDRIK-drempel gehaald (koorts ≥ 38,5 °C gedurende 2 dagen en/of braken of diarree > 3× per dag) [SIDRIK]",
      meta: { opmerking: "De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler." }
    },
    {
      id: "C",
      trigger: { type: "naKaartVanKaart", kaart: "O1", n: 3, alleenAlsGespeeld: "O1" },
      tekst: "Kweekuitslag. E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine en nitrofurantoïne.",
      zet: { resistent: ["V5", "V10"], gevoelig: ["V8", "V7", "V4", "V3"] },
      TODO_BART: "Komt er een tweede kweekuitslag als O1 in episode 3 nog een keer gespeeld wordt (na A)?"
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
    af: "klachten nemen af.",
    aan: "klachten houden aan.",
    geenVerbetering48: "Na 48 uur geen verbetering.",
    TODO_BART: "Welke tekst hoort bij welke klachtenstatus in episode 3?",
    TODO_BART_randgeval: "Randgeval klachtenstatus na gebeurtenis A: stel dat na A eerst een werkzaam antibioticum actief is (de klachten nemen af), en daarna weer een periode komt zonder werkzaam antibioticum. Geldt dan opnieuw 'Na 48 uur geen verbetering.'?"
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
      TODO_BART: "I1 in episode 3: telt een episode zonder enige route ook als 'een route zonder N1'? (Dezelfde vraag als in episode 1.)"
    },
    {
      id: "I4",
      ernst: 5,
      geldtIn: ["*"],
      altijdFout: "Twee antibiotica tegelijk",
      geldtInTekst: "E1–E3",
      predicaat: { p: "aantalActieveAntibiotica", op: ">", n: 1 },
      vraag: "Wat lost het tweede middel op dat het eerste niet oplost?",
      bron: "[G]",
      TODO_BART: "De ernst-volgorde van de invarianten is een voorstel van Claude (bouwopdracht 6.1) en niet door Bart bevestigd."
    },
    {
      id: "I5",
      ernst: 2,
      geldtIn: ["*"],
      altijdFout: "Nitrofurantoïne bij eGFR < 30, ook als de kweek \"gevoelig\" zegt",
      geldtInTekst: "E2, E3",
      predicaat: { p: "en", args: [{ p: "gestart", middel: "V3" }, { p: "waar", veld: "eGFR", op: "<", waarde: 30 }] },
      vraag: "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?",
      bron: "NHG",
      TODO_BART: "Terugkoppeling van weggelaten kaarten: de casus noemt niet welke weggelaten kaart welke downside toont."
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
              { p: "niet", arg: { p: "opDagRelatief", K: { kaart: "O2" }, anker: { start: "V5" }, van: 1, tot: 3 } },
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
          als: { p: "niet", arg: { p: "opDagRelatief", K: { kaart: "O2" }, anker: { start: "V5" }, van: 1, tot: 3 } },
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
      TODO_BART: "I7 in episode 3: wat betekent 'dag 2–4 na de start' en 'vanaf dag 3 na de start'?"
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
      bron: "NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten",
      TODO_BART: "I8 in episode 3: op welke dag moeten 'de klachten houden aan' gelden, en wanneer telt 'doorgaan met een resistent middel'? Bouwopdracht 6.1 noemt geen dag."
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
      TODO_BART: "I9: de casus zegt 'geen O2 én geen Ev2' (schending alleen als beide ontbreken); bouwopdracht 6.1 zegt 'O2 of Ev2 ontbreekt'. Welke lezing geldt?"
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
      predicaat: { p: "gestart", middel: "V9" },
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
      bron: "SIDRIK",
      TODO_BART: "I15: de casus zegt bij I15 en bij Ev1 'monitoring binnen 1–3 dagen'; bouwopdracht 6.1 schrijft voor dat alle vier de sick day-maatregelen, dus ook Ev1, binnen 2 beurten na B komen. Welke lezing geldt?"
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
      TODO_BART: "Eisen 'binnen n beurten' (I15, I16, I10) bij vroeg afronden: telt een onvervulde eis als schending?"
    }
  ],
  score: {
    TODO_BART: "Feedback 'O1 gespeeld' en 'Onnodig gewisseld' (en de duurzaamheidsregel 'wisselen terwijl het middel werkt') staan alleen bij episode 1 en 2; I1 en I4–I8 blijven in episode 3 gelden. Geldt dat ook voor deze feedback en deze score in episode 3?",
    duurzaamheid: {
      casusTekst: "de-escaleren van ciprofloxacine naar amoxicilline/clavulaanzuur na de kweek (C) levert punten op.",
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
      casusTekst: "G3 gebruiken vóór de eerste keuze levert punten op.",
      TODO_BART: "Doelmatigheid 'G3 gebruiken vóór de eerste keuze': welke kaarten tellen als 'de eerste keuze'? Bouwopdracht 6.5 zegt 'de eerste V-kaart', de casus 'de eerste keuze'.",
      regels: [
        {
          als: {
            p: "en",
            args: [
              { p: "gespeeld", K: { kaart: "G3" } },
              {
                p: "alsDan",
                als: { p: "gespeeld", K: { kaart: ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"] } },
                dan: {
                  p: "voor",
                  a: { kaart: "G3" },
                  b: { kaart: ["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"] }
                }
              }
            ]
          },
          punten: 3
        },
        {
          als: { p: "waarheid", waarde: true },
          punten: 2,
          TODO_BART: "Worden Ev3 ('Onnodig verwijzen kost doelmatigheid', kaartdownside) en 'geen overbodig onderzoek' (casus sectie 7) in episode 3 gescoord? De casus noemt voor episode 3 alleen 'G3 gebruiken vóór de eerste keuze'."
        }
      ]
    }
  },
  profielen: [
    {
      naam: "Kweekgestuurd",
      casusTekst: "Kweekgestuurd; scoort hoger. De keuze leunt op de eerdere kweek en vermijdt de risico's van ciprofloxacine bij ouderen [NHG].",
      als: { p: "gestart", middel: "V8" },
      reflectievraag: null,
      TODO_BART: "Reflectievraag voor profiel Kweekgestuurd (episode 3) ontbreekt in de casus."
    },
    {
      naam: "Richtlijn eerste keus",
      casusTekst: "Eerste keus volgens de richtlijn; eigen profiel",
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
      meta: { toelichting: "voor ciprofloxacine bij eGFR 10–30 geeft de NHG de normale keerdosis eenmaal per 24 uur [NHG]. Het Kompas past de dosis pas aan bij een klaring ≤ 15 [Kompas]. Beide zijn verdedigbaar; het wordt een feedbackmoment." },
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
      meta: { toelichting: "Zonder getallen, zoals ook de KNMP-regel geen getallen geeft." },
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
    vraag: "I9: de casus zegt 'geen O2 én geen Ev2' (schending alleen als beide ontbreken); bouwopdracht 6.1 zegt 'O2 of Ev2 ontbreekt'. Welke lezing geldt?",
    gekozenLezing: "Casus-lezing: I9 is geschonden als eGFR < 30 en zowel O2 als Ev2 op spironolacton ontbreken, of als B5 op spironolacton gespeeld is zonder eerdere Ev2 op spironolacton. Ev2 op lisinopril telt niet mee.",
    plek: "E3.invarianten.I9"
  },
  {
    id: "TODO_BART-E3-2",
    vraag: "Eisen 'binnen n beurten' (I15, I16, I10) bij vroeg afronden: telt een onvervulde eis als schending?",
    gekozenLezing: "Ja: schendingen worden bepaald op de eindstand; een eis die bij afronden nog niet vervuld is, telt als geschonden. Geldt alleen als gebeurtenis A of B geweest is.",
    plek: "E3.invarianten.I10, I15, I16"
  },
  {
    id: "TODO_BART-E3-3",
    vraag: "Vroeg afronden vóór gebeurtenis A, B of C (en dus ontlopen van I8, I10, I11, I15, I16)?",
    gekozenLezing: "Afronden blijft standaard vrij, want bouwopdracht 4.1 laat de speler vrij afronden. Gevolg: de speler kan afronden voordat A, B of C is opgetreden (bijvoorbeeld G3, O1, V4, N1, O2 en direct afronden) en ontloopt dan de invarianten die alleen na een gebeurtenis gelden (I8 na C, I10, I11 en I16 na A, I15 na B). Dat is de milde lezing: de episode is dan te omzeilen. Alternatief: afronden pas toestaan nadat alle gebeurtenissen zijn opgetreden (C komt alleen als O1 gespeeld is; zonder O1 kan dan pas op de laatste dag worden afgerond). Vraag aan Bart: moet afronden pas kunnen na A, B en C?",
    plek: "E3.gebeurtenissen A, B, C; E3.invarianten.I8, I10, I11, I15, I16 (afronden pas na de gebeurtenissen is niet ingesteld)"
  },
  {
    id: "TODO_BART-E3-4",
    vraag: "Komt er een tweede kweekuitslag als O1 in episode 3 nog een keer gespeeld wordt (na A)?",
    gekozenLezing: "Nee: C triggert maar één keer, drie kaarten na de eerste O1.",
    plek: "E3.gebeurtenissen.C"
  },
  {
    id: "TODO_BART-E3-5",
    vraag: "I10, I11, I13, I14, I15, I16: wat is 'dezelfde beurt', 'de beurt na A' en 'tussen A en de wissel'?",
    gekozenLezing: "De beurt van een gebeurtenis is de dag waarop de banner verscheen (begin van de volgende dag). 'Eind van de beurt na A' = einde van die dag; 'binnen 2 beurten' = die dag en de dag erna; 'na A' = kaarten gespeeld vanaf die dag.",
    plek: "E3.invarianten.I10, I11, I13, I14, I15, I16"
  },
  {
    id: "TODO_BART-E3-6",
    vraag: "I14: de toestandstabel zet I14 alleen bij weefselinvasie, de invariantentabel zegt 'Met ciprofloxacine'; bouwopdracht 6.1 zegt 'E3'. Waar geldt I14? En: B4 'op calcium' (bouwopdracht) of op ciprofloxacine (kaartdoelen)?",
    gekozenLezing: "Strengste lezing: geldt in elke toestand zodra ciprofloxacine gestart is (in elke toestand). B4 telt op elk doel; B3 alleen op calcium; beide in dezelfde of de volgende beurt als de start van ciprofloxacine, tenzij calcium dan al gepauzeerd is.",
    plek: "E3.invarianten.I14"
  },
  {
    id: "TODO_BART-E3-7",
    vraag: "I1 in episode 3: telt een episode zonder enige route ook als 'een route zonder N1'? (Dezelfde vraag als in episode 1.)",
    gekozenLezing: "Strengste lezing: elke afronding zonder N1 schendt I1.",
    plek: "E3.invarianten.I1"
  },
  {
    id: "TODO_BART-E3-8",
    vraag: "Patiëntkaart: de casusregel luidt 'spironolacton (hypertensie)', terwijl de regel eronder zegt dat wie spironolacton startte en waarom bewust niet op de kaart staat. Mag de reden (hypertensie) zichtbaar zijn?",
    gekozenLezing: "Meest letterlijke lezing: de casusregel staat verbatim op de patiëntkaart ('lisinopril, spironolacton (hypertensie), calcium/colecalciferol.'), dus mét '(hypertensie)'. Wie spironolacton startte en wanneer staat er niet (de medicatielijst noemt alleen de namen). Alternatief (didactische lezing): '(hypertensie)' weglaten zodat ook de reden niet zichtbaar is. Vraag aan Bart: welke van de twee?",
    plek: "E3.patient.zichtbaar.medicatieTekst; E3.patient.casusMedicatieregel"
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
    gekozenLezing: "af = 'klachten nemen af.', aan = 'klachten houden aan.', geenVerbetering48 = 'Na 48 uur geen verbetering.' (letterlijke fragmenten uit E2/E3).",
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
    gekozenLezing: "Geen reflectievraag tonen bij dit profiel.",
    plek: "E3.profielen.Kweekgestuurd"
  },
  {
    id: "TODO_BART-E3-13",
    vraag: "Feedbackvragen 'Automatische herstart' en 'Ciprofloxacine-dosis (bronconflict)': de casus noemt geen trigger en niet of ze ook bij een poortschending verschijnen.",
    gekozenLezing: "Automatische herstart: zodra B5 gespeeld is. Ciprofloxacine-dosis: zodra ciprofloxacine gestart is (geen poort). Beide alleen bij gehaalde poort, zodat bij een schending één vraag verschijnt.",
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
    plek: "E3.invarianten[].ernst (markering op I4)"
  },
  {
    id: "TODO_BART-E3-16",
    vraag: "Terugkoppeling van weggelaten kaarten: de casus noemt niet welke weggelaten kaart welke downside toont.",
    gekozenLezing: "Bij weggelaten kaarten komt in episode 3 geen aparte downside-tekst; de teksten bij ontbrekende kaarten staan bij 'wat zichtbaar wordt als een kaart ontbreekt'.",
    plek: "E3.invarianten (markering op I5)"
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
    gekozenLezing: "Beide vragen staan in de data; per vraag is vastgelegd bij welke schending ze horen. Standaard geldt de eerste vraag.",
    plek: "E3.invarianten.I6, I7"
  },
  {
    id: "TODO_BART-E3-19",
    vraag: "I7 in episode 3: wat betekent 'dag 2–4 na de start' en 'vanaf dag 3 na de start'?",
    gekozenLezing: "Lezing A (identiek aan episode 2): cursusdag = verschil in dagen t.o.v. de dag van de start van trimethoprim plus 1 (het anker zelf is verschil 0, cursusdag 1). Dus O2 op verschil 1 t/m 3 (cursusdag 2–4; casusroute V5 dag 1, O2 dag 2 slaagt) en V6 halveren op verschil 3 of meer (cursusdag 4 of later, vgl. feedback \"Dag 4.\"). Alternatief (lezing B, bouwopdracht 6.1: O2 op dag 2 t/m 4 na de start van V5): O2 op verschil 2 t/m 4, dan faalt de casusroute V5 dag 1, O2 dag 2.",
    plek: "E3.invarianten.I7"
  },
  {
    id: "TODO_BART-E3-20",
    vraag: "Doelmatigheid 'G3 gebruiken vóór de eerste keuze': welke kaarten tellen als 'de eerste keuze'? Bouwopdracht 6.5 zegt 'de eerste V-kaart', de casus 'de eerste keuze'.",
    gekozenLezing: "Strengste lezing: elke V-kaart telt als keuze, dus V1 t/m V10 inclusief V6 (dosering). Doelmatigheid is 3 alleen als G3 gespeeld is en vóór elke gespeelde V-kaart ligt; anders 2.",
    plek: "E3.score.doelmatigheid"
  },
  {
    id: "TODO_BART-E3-21",
    vraag: "Worden Ev3 ('Onnodig verwijzen kost doelmatigheid', kaartdownside) en 'geen overbodig onderzoek' (casus sectie 7) in episode 3 gescoord? De casus noemt voor episode 3 alleen 'G3 gebruiken vóór de eerste keuze'.",
    gekozenLezing: "Nee: in episode 3 wordt alleen 'G3 vóór de eerste keuze' gescoord. Ev3 en overbodig onderzoek (extra O1 of O2) kosten geen punten, omdat de casus voor episode 3 geen aftrekregel of aantal noemt; dat zou klinische inhoud verzinnen. Het alternatief (aftrek per overbodige kaart of voor Ev3 zonder 48 uur geen verbetering, zoals de kaartdownside zegt) is aan Bart.",
    plek: "E3.score.doelmatigheid.regels[1]"
  },
  {
    id: "TODO_BART-E3-22",
    vraag: "Feedback 'O1 gespeeld' en 'Onnodig gewisseld' (en de duurzaamheidsregel 'wisselen terwijl het middel werkt') staan alleen bij episode 1 en 2; I1 en I4–I8 blijven in episode 3 gelden. Geldt dat ook voor deze feedback en deze score in episode 3?",
    gekozenLezing: "Nee: de feedback 'O1 gespeeld' en 'Onnodig gewisseld' en de duurzaamheidsregel 'wisselen terwijl het middel werkt' komen in episode 3 niet voor; de casus noemt ze alleen bij episode 1 en 2. Alleen I1 en I4–I8 gelden als invariant. Alternatief: ze ook in episode 3 toepassen.",
    plek: "E3.score; E3.feedbackExtra"
  },
  {
    id: "TODO_BART-E3-23",
    vraag: "I8 in episode 3: op welke dag moeten 'de klachten houden aan' gelden, en wanneer telt 'doorgaan met een resistent middel'? Bouwopdracht 6.1 noemt geen dag.",
    gekozenLezing: "Bouwopdracht 6.1 letterlijk: schending als na C het resistente middel (V5, V10) aan het eind van de tweede beurt (dag van C + 1) nog actief is én de klachten op de dag van C 'aan' of 'geen verbetering na 48 uur' zijn. Niet gedekt: een resistent middel dat pas op of na de dag van C wordt gestart (bijvoorbeeld V4 naar V10 via B1 op de dag na C). Alternatief (strenger): klachten 'aan' op elke dag vanaf C meetellen.",
    plek: "E3.invarianten.I8"
  },
  {
    id: "TODO_BART-E3-24",
    vraag: "I15: de casus zegt bij I15 en bij Ev1 'monitoring binnen 1–3 dagen'; bouwopdracht 6.1 schrijft voor dat alle vier de sick day-maatregelen, dus ook Ev1, binnen 2 beurten na B komen. Welke lezing geldt?",
    gekozenLezing: "Casus is de bron, maar de strengere lezing wordt aangehouden: alle vier de maatregelen (B3 op spironolacton, V6 halveren op lisinopril, N3, Ev1) binnen 2 beurten na B, dus op de dag van B of de dag erna (bouwopdracht 6.1). Alternatief (casus-lezing 'binnen 1–3 dagen'): Ev1 mag tot en met drie dagen na B (dB+3); dan geeft Ev1 op dB+2 of dB+3 nu ten onrechte I15. Vraag aan Bart: welke van de twee?",
    plek: "E3.invarianten.I15 (Ev1-onderdeel); casus sectie 6 regels I15 en Ev1"
  },
  {
    id: "TODO_BART-E3-25",
    vraag: "Randgeval klachtenstatus na gebeurtenis A: stel dat na A eerst een werkzaam antibioticum actief is (de klachten nemen af), en daarna weer een periode komt zonder werkzaam antibioticum. Geldt dan opnieuw 'Na 48 uur geen verbetering.'?",
    gekozenLezing: "Nee: alleen de eerste periode na A zonder werkzaam antibioticum telt voor 'Na 48 uur geen verbetering.' Zodra in die periode een werkzaam antibioticum actief is geweest, geldt voor de rest van de episode de gewone status (klachten nemen af, klachten houden aan, of geen status), ook als er later weer een periode zonder werkzaam antibioticum volgt. Alternatief: de status 'Na 48 uur geen verbetering.' opnieuw laten gelden bij elke nieuwe periode van twee dagen zonder werkzaam antibioticum.",
    plek: "E3.statusTeksten; E3.gebeurtenissen.A; E3.invarianten.I8, I16"
  },
  {
    id: "TODO_BART-E3-26",
    vraag: "Mag de student de risicogroepmelding zien? De casus zet bij de patiëntkaart (bij het lab) de zin 'Risicogroep [NHG].' Die zin vertelt vooraf dat deze patiënt in de risicogroep valt. Mag hij bij de patiëntkaart getoond worden, of alleen in het overzicht voor de docent?",
    gekozenLezing: "Nee: de student ziet de risicogroepmelding niet. De zin staat in de data onder patient.meta.risicogroep (voor Bart en het overzicht); de student ziet alleen de kop, de klachten, de medicatie en het lab ('eGFR 28, recent.'). Alternatief: de zin wel bij de patiëntkaart tonen.",
    plek: "E3.patient.meta.risicogroep"
  }
);
}

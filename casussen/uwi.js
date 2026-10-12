/* casussen/uwi.js — samengevoegd uit uwi.js (kop + kaarten), uwi-e1.js, uwi-e2.js en uwi-e3.js. Alleen data, geen logica.
   Bron: casus-uwi.md (v1.1). Gemaakt met gauntlet/tools/voeg-samen.js; de losse bestanden zijn daarna vervallen. */
/* ===== uwi.js ===== */
// Casus UWI in de eerste lijn: kaartenbibliotheek (stuk S1). Alleen data, geen logica.
// Bron: casus-uwi.md v1.1, sectie 3. Episodes worden aangevuld door uwi-e1.js, uwi-e2.js en uwi-e3.js.
window.CASUSSEN = [
{
 "id": "uwi-eerstelijn",
 "versie": "1.1",
 "limiet": 1,
 "gevolgzinnen": [
  { "episode": "E1", "invariant": "I1", "tekst": "Mevrouw weet niet wanneer ze moet bellen.", "vrijgegeven": false },
  { "episode": "E1", "invariant": "I3", "tekst": "Er is geen moment om alsnog te starten als de klachten aanhouden.", "vrijgegeven": false },
  { "episode": "E2", "invariant": "I5", "tekst": "De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.", "vrijgegeven": false },
  { "episode": "E2", "invariant": "I7", "tekst": "De kaliumspiegel is onbekend.", "vrijgegeven": false },
  { "episode": "E3", "invariant": "I9", "tekst": "Het kalium is onbekend, en niemand heeft naar spironolacton gekeken.", "vrijgegeven": false },
  { "episode": "E3", "invariant": "I14", "tekst": "Na 48 uur geen verbetering.", "vrijgegeven": true },
  { "episode": "E3", "invariant": "I15", "tekst": "De nierfunctie daalt verder en het kalium stijgt.", "vrijgegeven": true }
 ],
 "rollen": { "wissel": "B1", "stop": "B2", "pauzeer": "B3", "hervat": "B5" },
 "titel": "Casus UWI in de eerste lijn — tutorialcasus Epic green cards",
 "bronnen": {
  "NHG": "NHG-Standaard Urineweginfecties, versie juli 2026",
  "SIDRIK": "SIDRIK-stroomschema medicatieadvies bij sick day, Universiteit Utrecht 2025",
  "Kompas": "Farmacotherapeutisch Kompas, preparaatteksten spironolacton en ciprofloxacine",
  "KNMP": "KNMP medisch-farmaceutische beslisregel 7025-4 \"Kalium controle na 3 dagen\""
 },
 "raadplegen": {
  "titel": "Richtlijn raadplegen",
  "bronnen": [
   "NHG",
   "SIDRIK",
   "Kompas",
   "KNMP"
  ],
  "TODO_BART": "De casus noemt voor het raadplegen alleen \"een eigen naslagkaart met verwijzing naar de bronnen\", zonder te zeggen welke bronnen erop staan. Zijn de vier bronnen uit de casuskop (NHG, SIDRIK, Kompas, KNMP) de bedoelde keuze, en blijft de naslagkaart voor alle episodes hetzelfde?"
 },
 "kaarten": [
  {
   "id": "G1",
   "categorie": "Gegevens",
   "label": "Medicatieoverzicht nalopen",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "Toont de actuele medicatielijst"
   },
   "downside": "Kost een actie",
   "bron": "—"
  },
  {
   "id": "G2",
   "categorie": "Gegevens",
   "label": "Recente labwaarden opvragen",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "E1": "eGFR 42, recent.",
    "E2": "eGFR 29 (verborgen).",
    "E3": "eGFR 28, bevestigd."
   },
   "downside": "Kost een actie",
   "bron": "—",
   "TODO_BART": "Het effect van O1 en Ev1 en de G2-tekst bevatten zinnen die per episode of situatie verschillen, zonder voorvoegsel per episode (G2 E2: \"(verborgen)\"). Moeten die per episode gesplitst worden?"
  },
  {
   "id": "G3",
   "categorie": "Gegevens",
   "label": "Eerdere kweekuitslagen opvragen",
   "vanafEpisode": 3,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "Toont de kweek uit episode 2"
   },
   "downside": "Kost een actie",
   "bron": "NHG: kweken tot ongeveer 1 jaar terug meewegen"
  },
  {
   "id": "O1",
   "categorie": "Onderzoek",
   "label": "Urinekweek inzetten",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "Zet een kweek in. Moet vóór de eerste dosis worden afgenomen. Uitslag in E2 na de 4e gespeelde kaart, in E3 drie kaarten na O1."
   },
   "limiet": { "E3": 2 },
   "downside": {
    "E1": "niet geïndiceerd, kost doelmatigheid"
   },
   "bron": "NHG",
   "TODO_BART": "De casus geeft het effect van V3 en V5 en de downside van O1 alleen met het voorvoegsel \"E1:\". Geldt dat ook voor E2 en E3? | Het effect van O1 en Ev1 en de G2-tekst bevatten zinnen die per episode of situatie verschillen, zonder voorvoegsel per episode (G2 E2: \"(verborgen)\"). Moeten die per episode gesplitst worden?"
  },
  {
   "id": "O2",
   "categorie": "Onderzoek",
   "label": "Kalium bepalen",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "Bepaalt de kaliumspiegel"
   },
   "downside": "Alleen zinvol bij een indicatie; anders kost het doelmatigheid",
   "bron": "NHG, KNMP"
  },
  {
   "id": "V1",
   "categorie": "Voorschrijven",
   "label": "Afwachtend beleid",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "Geen antibioticum; ruim drinken, zo nodig pijnstilling"
   },
   "downside": "Klachten duren langer; risico op pyelonefritis ongeveer 1,6% hoger",
   "bron": "NHG"
  },
  {
   "id": "V2",
   "categorie": "Voorschrijven",
   "label": "Uitgesteld recept",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "De patiënt start zelf als de klachten aanhouden of toenemen"
   },
   "downside": "Ze moet weten wanneer ze moet starten",
   "bron": "NHG"
  },
  {
   "id": "V3",
   "categorie": "Voorschrijven",
   "label": "Nitrofurantoïne",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "E1: 5 dagen 2 dd 100 mg mga. In een risicogroep: 7 dagen."
   },
   "downside": "Vermijden bij eGFR < 30: stapeling met kans op neuropathie, en geen bactericide concentratie in de urine. Ongeschikt bij weefselinvasie. Maag-darmklachten [G].",
   "bron": "NHG",
   "TODO_BART": "De casus geeft het effect van V3 en V5 en de downside van O1 alleen met het voorvoegsel \"E1:\". Geldt dat ook voor E2 en E3?"
  },
  {
   "id": "V4",
   "categorie": "Voorschrijven",
   "label": "Fosfomycine",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "Eenmalig 3 g, 2–3 uur na de maaltijd, bij voorkeur voor de nacht"
   },
   "downside": "Klachten zijn niet direct weg. Ongeschikt bij weefselinvasie.",
   "bron": "NHG"
  },
  {
   "id": "V5",
   "categorie": "Voorschrijven",
   "label": "Trimethoprim",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "E1: 3 dagen 1 dd 300 mg. Risicogroep: 7 dagen."
   },
   "downside": "Naast een RAS-remmer of kaliumsparend diureticum stijgt het kalium (controle nodig bij een 7-daagse kuur). Bij eGFR 10–30: na dag 3 halveren en kans op therapiefalen. Hoge resistentie bij E. coli.",
   "bron": "NHG, KNMP",
   "TODO_BART": "De casus geeft het effect van V3 en V5 en de downside van O1 alleen met het voorvoegsel \"E1:\". Geldt dat ook voor E2 en E3?"
  },
  {
   "id": "V6",
   "categorie": "Voorschrijven",
   "label": "Dosis aanpassen",
   "vanafEpisode": 2,
   "doelkaart": true,
   "opties": {
    "V5": [
     {
      "tekst": "halveren",
      "goed": true
     },
     {
      "tekst": "verdubbelen"
     },
     {
      "tekst": "interval 48 uur"
     }
    ],
    "V8": [
     {
      "tekst": "875/125 mg 2 dd",
      "goed": true
     },
     {
      "tekst": "500/125 mg 2 dd"
     },
     {
      "tekst": "500/125 mg 1 dd"
     }
    ],
    "V7": [
     {
      "tekst": "normale keerdosis 1× per 24 uur",
      "goed": true
     },
     {
      "tekst": "halveren"
     },
     {
      "tekst": "geen aanpassing",
      "goed": true
     }
    ],
    "lisinopril": [
     {
      "tekst": "halveren",
      "goed": true
     },
     {
      "tekst": "stoppen"
     },
     {
      "tekst": "verdubbelen"
     }
    ]
   },
   "doelen": {
    "E2": [
     {
      "id": "V5",
      "label": "Trimethoprim",
      "vereist": {
       "p": "gestart",
       "middel": "V5"
      }
     },
     {
      "id": "lisinopril",
      "label": "lisinopril",
      "vereist": {
       "p": "medicatieActief",
       "id": "lisinopril"
      }
     }
    ],
    "E3": [
     {
      "id": "V5",
      "label": "Trimethoprim",
      "vereist": {
       "p": "gestart",
       "middel": "V5"
      }
     },
     {
      "id": "V7",
      "label": "Ciprofloxacine",
      "vereist": {
       "p": "gestart",
       "middel": "V7"
      }
     },
     {
      "id": "V8",
      "label": "Amoxicilline/clavulaanzuur",
      "vereist": {
       "p": "gestart",
       "middel": "V8"
      }
     },
     {
      "id": "lisinopril",
      "label": "lisinopril",
      "vereist": {
       "p": "medicatieActief",
       "id": "lisinopril"
      }
     }
    ]
   },
   "effect": {
    "alle": "Past dosis of interval aan van een nieuw of bestaand middel (ook lisinopril halveren bij sick day)"
   },
   "downside": "Een verkeerde aanpassing geeft onder- of overdosering",
   "bron": "NHG, SIDRIK",
   "TODO_BART": "De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?"
  },
  {
   "id": "V7",
   "categorie": "Voorschrijven",
   "label": "Ciprofloxacine",
   "vanafEpisode": 3,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "7 dagen 2 dd 500 mg"
   },
   "downside": "Bij ouderen: kans op peesschade, QT-verlenging, aneurysma. Minder opname naast calcium. NHG: terughoudend bij ouderen en bij een nierfunctiestoornis.",
   "bron": "NHG, Kompas"
  },
  {
   "id": "V8",
   "categorie": "Voorschrijven",
   "label": "Amoxicilline/clavulaanzuur",
   "vanafEpisode": 3,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "10 dagen 3 dd 500/125 mg"
   },
   "downside": "Bij eGFR < 30 stapelt clavulaanzuur: dan alleen 875/125 mg 2 dd",
   "bron": "NHG"
  },
  {
   "id": "V9",
   "categorie": "Voorschrijven",
   "label": "Cotrimoxazol",
   "vanafEpisode": 3,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "10 dagen 2 dd 960 mg"
   },
   "downside": "Gecontra-indiceerd bij een ernstige nierfunctiestoornis. Met spironolacton kans op ernstige hyperkaliëmie.",
   "bron": "NHG, Kompas"
  },
  {
   "id": "V10",
   "categorie": "Voorschrijven",
   "label": "Amoxicilline",
   "vanafEpisode": 3,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "3 dd 500 mg, alleen bij aangetoonde gevoeligheid"
   },
   "downside": "De kweek laat resistentie zien: geen werking",
   "bron": "NHG"
  },
  {
   "id": "B1",
   "categorie": "Bijsturen",
   "label": "Antibioticum wisselen",
   "vanafEpisode": 2,
   "doelkaart": true,
   "opties": null,
   "doelen": {
    "E2": [
     {
      "id": "V3",
      "label": "Nitrofurantoïne",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V3"
         }
        }
       ]
      }
     },
     {
      "id": "V4",
      "label": "Fosfomycine",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V4"
         }
        }
       ]
      }
     },
     {
      "id": "V5",
      "label": "Trimethoprim",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V5"
         }
        }
       ]
      }
     }
    ],
    "E3": [
     {
      "id": "V3",
      "label": "Nitrofurantoïne",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V3"
         }
        }
       ]
      }
     },
     {
      "id": "V4",
      "label": "Fosfomycine",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V4"
         }
        }
       ]
      }
     },
     {
      "id": "V5",
      "label": "Trimethoprim",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V5"
         }
        }
       ]
      }
     },
     {
      "id": "V7",
      "label": "Ciprofloxacine",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V7"
         }
        }
       ]
      }
     },
     {
      "id": "V8",
      "label": "Amoxicilline/clavulaanzuur",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V8"
         }
        }
       ]
      }
     },
     {
      "id": "V9",
      "label": "Cotrimoxazol",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V9"
         }
        }
       ]
      }
     },
     {
      "id": "V10",
      "label": "Amoxicilline",
      "vereist": {
       "p": "en",
       "args": [
        {
         "p": "actief"
        },
        {
         "p": "niet",
         "arg": {
          "p": "actief",
          "middel": "V10"
         }
        }
       ]
      }
     }
    ]
   },
   "effect": {
    "alle": "Vervangt het lopende antibioticum"
   },
   "downside": "Onnodig wisselen kost duurzaamheid",
   "bron": "NHG",
   "TODO_BART": "De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?"
  },
  {
   "id": "B2",
   "categorie": "Bijsturen",
   "label": "Antibioticum stoppen",
   "vanafEpisode": 2,
   "doelkaart": true,
   "opties": null,
   "doelen": {
    "E2": [
     {
      "id": "V3",
      "label": "Nitrofurantoïne",
      "vereist": {
       "p": "actief",
       "middel": "V3"
      }
     },
     {
      "id": "V4",
      "label": "Fosfomycine",
      "vereist": {
       "p": "actief",
       "middel": "V4"
      }
     },
     {
      "id": "V5",
      "label": "Trimethoprim",
      "vereist": {
       "p": "actief",
       "middel": "V5"
      }
     }
    ],
    "E3": [
     {
      "id": "V3",
      "label": "Nitrofurantoïne",
      "vereist": {
       "p": "actief",
       "middel": "V3"
      }
     },
     {
      "id": "V4",
      "label": "Fosfomycine",
      "vereist": {
       "p": "actief",
       "middel": "V4"
      }
     },
     {
      "id": "V5",
      "label": "Trimethoprim",
      "vereist": {
       "p": "actief",
       "middel": "V5"
      }
     },
     {
      "id": "V7",
      "label": "Ciprofloxacine",
      "vereist": {
       "p": "actief",
       "middel": "V7"
      }
     },
     {
      "id": "V8",
      "label": "Amoxicilline/clavulaanzuur",
      "vereist": {
       "p": "actief",
       "middel": "V8"
      }
     },
     {
      "id": "V9",
      "label": "Cotrimoxazol",
      "vereist": {
       "p": "actief",
       "middel": "V9"
      }
     },
     {
      "id": "V10",
      "label": "Amoxicilline",
      "vereist": {
       "p": "actief",
       "middel": "V10"
      }
     }
    ]
   },
   "effect": {
    "alle": "Stopt het lopende antibioticum"
   },
   "downside": "Te vroeg stoppen geeft therapiefalen",
   "bron": "—",
   "TODO_BART": "De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?"
  },
  {
   "id": "B3",
   "categorie": "Bijsturen",
   "label": "Medicatie tijdelijk stoppen",
   "vanafEpisode": 3,
   "doelkaart": true,
   "opties": null,
   "doelen": {
    "E3": [
     {
      "id": "lisinopril",
      "label": "lisinopril",
      "vereist": {
       "p": "medicatieActief",
       "id": "lisinopril"
      }
     },
     {
      "id": "spironolacton",
      "label": "spironolacton",
      "vereist": {
       "p": "medicatieActief",
       "id": "spironolacton"
      }
     },
     {
      "id": "calcium",
      "label": "calcium/colecalciferol",
      "vereist": {
       "p": "medicatieActief",
       "id": "calcium"
      }
     }
    ]
   },
   "effect": {
    "alle": "Pauzeert een bestaand middel (sick day)"
   },
   "downside": "Vraagt een afspraak over herstart",
   "bron": "SIDRIK",
   "TODO_BART": "De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?"
  },
  {
   "id": "B5",
   "categorie": "Bijsturen",
   "label": "Medicatie hervatten",
   "vanafEpisode": 3,
   "doelkaart": true,
   "opties": null,
   "doelen": {
    "E3": [
     {
      "id": "lisinopril",
      "label": "lisinopril",
      "vereist": {
       "p": "niet",
       "arg": {
        "p": "medicatieActief",
        "id": "lisinopril"
       }
      }
     },
     {
      "id": "spironolacton",
      "label": "spironolacton",
      "vereist": {
       "p": "niet",
       "arg": {
        "p": "medicatieActief",
        "id": "spironolacton"
       }
      }
     },
     {
      "id": "calcium",
      "label": "calcium/colecalciferol",
      "vereist": {
       "p": "niet",
       "arg": {
        "p": "medicatieActief",
        "id": "calcium"
       }
      }
     }
    ]
   },
   "effect": {
    "alle": "Hervat een eerder gestopt middel. Volgens SIDRIK: herstarten zodra de klachten weg zijn."
   },
   "downside": "Hervatten zonder herbeoordeling kan dezelfde schade herhalen",
   "bron": "SIDRIK",
   "TODO_BART": "De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?"
  },
  {
   "id": "B4",
   "categorie": "Bijsturen",
   "label": "Innametijden aanpassen",
   "vanafEpisode": 3,
   "doelkaart": true,
   "opties": null,
   "doelen": {
    "E3": [
     {
      "id": "V7",
      "label": "Ciprofloxacine",
      "vereist": {
       "p": "actief",
       "middel": "V7"
      }
     }
    ]
   },
   "effect": {
    "alle": "Ciprofloxacine 1–2 uur vóór of ten minste 4 uur ná calcium"
   },
   "downside": "Vraagt uitleg aan de patiënt",
   "bron": "Kompas",
   "TODO_BART": "De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?"
  },
  {
   "id": "N1",
   "categorie": "Informeren",
   "label": "Alarmsignalen bespreken",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "Bij koorts of ziek worden direct contact opnemen"
   },
   "downside": "—",
   "bron": "NHG",
   "TODO_BART": "De casus noemt bij elke kaart een verplichte downside, maar geeft bij N1, N2, N3 en Ev1 \"—\". Is dat bedoeld (geen downside) of ontbreekt er een tekst?"
  },
  {
   "id": "N2",
   "categorie": "Informeren",
   "label": "Gebruik en verwachting uitleggen",
   "vanafEpisode": 1,
   "doelkaart": true,
   "opties": null,
   "doelen": {
    "E1": [
     {
      "id": "V3",
      "label": "Nitrofurantoïne",
      "vereist": {
       "p": "gestart",
       "middel": "V3"
      }
     },
     {
      "id": "V4",
      "label": "Fosfomycine",
      "vereist": {
       "p": "gestart",
       "middel": "V4"
      }
     },
     {
      "id": "V5",
      "label": "Trimethoprim",
      "vereist": {
       "p": "gestart",
       "middel": "V5"
      }
     }
    ],
    "E2": [
     {
      "id": "V3",
      "label": "Nitrofurantoïne",
      "vereist": {
       "p": "gestart",
       "middel": "V3"
      }
     },
     {
      "id": "V4",
      "label": "Fosfomycine",
      "vereist": {
       "p": "gestart",
       "middel": "V4"
      }
     },
     {
      "id": "V5",
      "label": "Trimethoprim",
      "vereist": {
       "p": "gestart",
       "middel": "V5"
      }
     }
    ],
    "E3": [
     {
      "id": "V3",
      "label": "Nitrofurantoïne",
      "vereist": {
       "p": "gestart",
       "middel": "V3"
      }
     },
     {
      "id": "V4",
      "label": "Fosfomycine",
      "vereist": {
       "p": "gestart",
       "middel": "V4"
      }
     },
     {
      "id": "V5",
      "label": "Trimethoprim",
      "vereist": {
       "p": "gestart",
       "middel": "V5"
      }
     },
     {
      "id": "V7",
      "label": "Ciprofloxacine",
      "vereist": {
       "p": "gestart",
       "middel": "V7"
      }
     },
     {
      "id": "V8",
      "label": "Amoxicilline/clavulaanzuur",
      "vereist": {
       "p": "gestart",
       "middel": "V8"
      }
     },
     {
      "id": "V9",
      "label": "Cotrimoxazol",
      "vereist": {
       "p": "gestart",
       "middel": "V9"
      }
     },
     {
      "id": "V10",
      "label": "Amoxicilline",
      "vereist": {
       "p": "gestart",
       "middel": "V10"
      }
     }
    ]
   },
   "effect": {
    "alle": "Inhoud per middel, bijvoorbeeld bij fosfomycine: klachten niet direct weg"
   },
   "downside": "—",
   "bron": "NHG",
   "TODO_BART": "De casus noemt bij elke kaart een verplichte downside, maar geeft bij N1, N2, N3 en Ev1 \"—\". Is dat bedoeld (geen downside) of ontbreekt er een tekst? | De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?"
  },
  {
   "id": "N3",
   "categorie": "Informeren",
   "label": "Drinkadvies geven",
   "vanafEpisode": 3,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "2–2,5 liter per dag"
   },
   "downside": "—",
   "bron": "SIDRIK",
   "TODO_BART": "De casus noemt bij elke kaart een verplichte downside, maar geeft bij N1, N2, N3 en Ev1 \"—\". Is dat bedoeld (geen downside) of ontbreekt er een tekst?"
  },
  {
   "id": "Ev1",
   "limiet": { "E3": 2 },
   "categorie": "Evalueren",
   "label": "Opvolgmoment afspreken",
   "vanafEpisode": 1,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "Afwachten: na 1 week alsnog starten. Na een kuur: als de klachten 24–48 uur na afloop niet duidelijk minder zijn, opnieuw urineonderzoek. Weefselinvasie: contact binnen 48 uur. Sick day: monitoring na 1–3 dagen."
   },
   "downside": "—",
   "bron": "NHG, SIDRIK",
   "TODO_BART": "De casus noemt bij elke kaart een verplichte downside, maar geeft bij N1, N2, N3 en Ev1 \"—\". Is dat bedoeld (geen downside) of ontbreekt er een tekst? | Het effect van O1 en Ev1 en de G2-tekst bevatten zinnen die per episode of situatie verschillen, zonder voorvoegsel per episode (G2 E2: \"(verborgen)\"). Moeten die per episode gesplitst worden?"
  },
  {
   "id": "Ev2",
   "categorie": "Evalueren",
   "label": "Overleggen met de voorschrijver",
   "vanafEpisode": 3,
   "doelkaart": true,
   "opties": null,
   "doelen": {
    "E3": [
     {
      "id": "lisinopril",
      "label": "lisinopril"
     },
     {
      "id": "spironolacton",
      "label": "spironolacton"
     }
    ]
   },
   "effect": {
    "alle": "Legt een bestaand middel voor aan de voorschrijver"
   },
   "downside": "Kost een actie",
   "bron": "Bart; CVRM-richtlijn via Mistral, niet zelf gecheckt",
   "TODO_BART": "De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?"
  },
  {
   "id": "Ev3",
   "categorie": "Evalueren",
   "label": "Verwijzen",
   "vanafEpisode": 3,
   "doelkaart": false,
   "opties": null,
   "doelen": null,
   "effect": {
    "alle": "Verlaat de kaart: de patiënt gaat naar de tweede lijn"
   },
   "downside": "Onnodig verwijzen kost doelmatigheid",
   "bron": "NHG"
  }
 ],
 "todoBart": [
  {
   "id": "TODO_BART-K1",
   "vraag": "De casus noemt bij elke kaart een verplichte downside, maar geeft bij N1, N2, N3 en Ev1 \"—\". Is dat bedoeld (geen downside) of ontbreekt er een tekst?",
   "gekozenLezing": "Letterlijk \"—\" overgenomen; geen downside verzonnen.",
   "plek": "kaarten[N1,N2,N3,Ev1].downside"
  },
  {
   "id": "TODO_BART-K2",
   "vraag": "De casus geeft het effect van V3 en V5 en de downside van O1 alleen met het voorvoegsel \"E1:\". Geldt dat ook voor E2 en E3?",
   "gekozenLezing": "Effect van V3 en V5: de hele casuscel staat letterlijk, inclusief het voorvoegsel \"E1: \", in effect.alle (geldt voor elke episode waarin de kaart in het repertoire zit); geen tekst voor E2 of E3 toegevoegd. Downside van O1: alleen E1 (\"niet geïndiceerd\" geldt niet vanzelf in E2 en E3, waar een kweek wel nodig is); E2 en E3 hebben dus geen downside.",
   "plek": "kaarten[V3,V5].effect; kaarten[O1].downside"
  },
  {
   "id": "TODO_BART-K3",
   "vraag": "Het effect van O1 en Ev1 en de G2-tekst bevatten zinnen die per episode of situatie verschillen, zonder voorvoegsel per episode (G2 E2: \"(verborgen)\"). Moeten die per episode gesplitst worden?",
   "gekozenLezing": "O1 en Ev1: niet gesplitst, de volledige casuscel staat letterlijk in effect.alle (geldt voor elke episode vanaf de eerste). G2: gesplitst in drie teksten (E1, E2 met \"(verborgen)\", E3), omdat de casus de varianten per episode noemt.",
   "plek": "kaarten[O1,Ev1,G2].effect"
  },
  {
   "id": "TODO_BART-K4",
   "vraag": "De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?",
   "gekozenLezing": "Doelen afgeleid uit de routes, invarianten en kaarteffecten van de casus en uit bouwopdracht 6.1/6.2; geen enkel doel zonder aanleiding in de casus. De V6-opties zijn letterlijk bouwopdracht 6.2 (door Bart gevalideerd).",
   "plek": "kaarten[V6,B1,B2,B3,B5,B4,N2,Ev2].doelen"
  },
  {
   "id": "TODO_BART-L1",
   "vraag": "Elke kaart mag één keer per doel gespeeld worden. Voor Urinekweek inzetten en Opvolgmoment afspreken staat in episode 3 een uitzondering: twee keer (een nieuwe kweek na weefselinvasie; contact na weefselinvasie én monitoring na de sick day). Klopt dat, of moet een andere kaart ook twee keer kunnen?",
   "gekozenLezing": "Casus-brede grens 1 (casus.limiet); alleen O1 en Ev1 in E3 mogen twee keer (kaart.limiet).",
   "plek": "casus.limiet; kaarten[O1,Ev1].limiet"
  },
  {
   "id": "TODO_BART-G1",
   "vraag": "Bij een geschonden veiligheidsregel tonen we naast de vraag de zin uit 'Wat er zichtbaar wordt als een kaart ontbreekt'. Sommige zinnen verklappen wat de speler miste. Mogen deze zinnen toch getoond worden? - E1 I1: \"Mevrouw weet niet wanneer ze moet bellen.\" (noemt direct de ontbrekende informatie (alarmsignalen))\n- E1 I3: \"Er is geen moment om alsnog te starten als de klachten aanhouden.\" (noemt direct de ontbrekende kaart (opvolgmoment))\n- E2 I5: \"De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.\" (noemt het getal dat de speler had kunnen opvragen (nierfunctie 29) en de reden waarom het middel afvalt)\n- E2 I7: \"De kaliumspiegel is onbekend.\" (noemt direct de ontbrekende kaart (kalium bepalen))\n- E3 I9: \"Het kalium is onbekend, en niemand heeft naar spironolacton gekeken.\" (noemt direct wat de speler miste (kalium en overleg over spironolacton))",
   "gekozenLezing": "Deze zinnen worden voorlopig NIET getoond (vrijgegeven: false in casus.gevolgzinnen). Wel getoond worden de zinnen die alleen een gevolg bij de patiënt noemen: E3 I14 (Na 48 uur geen verbetering.) en E3 I15 (De nierfunctie daalt verder en het kalium stijgt.).",
   "plek": "casus.gevolgzinnen"
  },
  {
   "id": "TODO_BART-K5",
   "vraag": "De casus noemt voor het raadplegen alleen \"een eigen naslagkaart met verwijzing naar de bronnen\", zonder te zeggen welke bronnen erop staan. Zijn de vier bronnen uit de casuskop (NHG, SIDRIK, Kompas, KNMP) de bedoelde keuze, en blijft de naslagkaart voor alle episodes hetzelfde?",
   "gekozenLezing": "Alle vier de bronnen uit de casuskop, in kopvolgorde, als verwijzing op casusniveau (casus.raadplegen), voor elke episode gelijk; geen richtlijntekst toegevoegd.",
   "plek": "raadplegen.bronnen"
  }
 ],
 "episodes": []
}
];

/* ===== uwi-e1.js ===== */
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
    af: "klachten nemen af.",
    aan: "klachten houden aan.",
    geenVerbetering48: null,
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
  { id: "TODO_BART-E1-2", vraag: "In episode 1 kunnen de klachten af, aan of na 48 uur niet verbeterd zijn, maar de casus geeft bij episode 1 geen statusteksten. Welke tekst hoort bij welke klachtenstatus?", gekozenLezing: "Status af = 'klachten nemen af.', status aan = 'klachten houden aan.' (casusfragmenten uit episode 2, met slotpunt). Voor de status na 48 uur geen verbetering geeft de casus in episode 1 geen tekst: leeg (geen tekst); de casus geeft die zin alleen in episode 3. In episode 1 komen aan en na 48 uur niet verbeterd niet voor.", plek: "E1.statusTeksten" },
  { id: "TODO_BART-E1-3", vraag: "De casus geeft bij het profiel Gedeelde regie (uitgesteld recept) geen reflectievraag, wel bij Terughoudend en Direct behandelen. Welke reflectievraag hoort bij Gedeelde regie?", gekozenLezing: "Geen reflectievraag (leeg); er wordt niets verzonnen.", plek: "E1.profielen.Gedeelde regie" },
  { id: "TODO_BART-E1-4", vraag: "De casus noemt bij de geldige routes 'Direct behandelen, 1e keus' (nitrofurantoïne), '2e keus' (fosfomycine) en '3e keus' (trimethoprim 3 dagen), maar geeft één reflectievraag. Is dat één profiel of drie?", gekozenLezing: "Eén profiel 'Direct behandelen' (V3, V4 of V5) met de ene reflectievraag uit de casus.", plek: "E1.profielen.Direct behandelen" },
  { id: "TODO_BART-E1-5", vraag: "De casus noemt bij O1 gespeeld de vraag 'Wat doe je bij welke uitslag anders?'. Komt die vraag ook bij een poortschending?", gekozenLezing: "Alleen bij gehaalde poort; bij een schending verschijnt maar één vraag, die van de ernstigste schending.", plek: "E1.feedbackExtra[O1]" },
  { id: "TODO_BART-E1-6", vraag: "De casus geeft als route 'V2 (+ middel) + N1 + N2 + Ev1' en rangschikt de duurzaamheid 'afwachten > uitgesteld recept > direct een antibioticum'. Telt uitgesteld recept met een middel erbij, of met V1 erbij, nog als 2 (uitgesteld recept)?", gekozenLezing: "Gespeeld V2 (ook met V1 of met een middel erbij) = 2, in lijn met profiel Gedeelde regie; V1 zonder V2 en zonder antibioticum = 3; een antibioticum zonder V2 = 1 (ook met V1 erbij, profiel Direct behandelen). Zonder gekozen route is er geen score (de poort is dan geschonden).", plek: "E1.score.duurzaamheid" },
  { id: "TODO_BART-E1-7", vraag: "Mag de student de risicogroepmelding zien? De casus zet bij de patiëntkaart de regel 'Geen risicogroep. De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].' Die regel legt de drempels (eGFR 30, leeftijd 75) vooraf uit. Mag hij bij de patiëntkaart getoond worden, of alleen in het overzicht voor de docent?", gekozenLezing: "Nee: de student ziet de risicogroepmelding niet. De regel staat in de data onder patient.meta.risicogroep (voor Bart en het overzicht); de student ziet alleen de kop, de klachten, de medicatie en het lab. Alternatief: de regel wel bij de patiëntkaart tonen.", plek: "E1.patient.meta.risicogroep" }
);
}

/* ===== uwi-e2.js ===== */
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
      labTekst: "laatst bekende eGFR 42, van 6 jaar geleden.",
      eerdereUWI: "episode 1, toen geen kweek gedaan."
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
        onthult: "eGFR 29 uit de jaarlijkse controle.",
        zichtbaar: {
          lab: { datum: "uit de jaarlijkse controle" },
          labTekst: "eGFR 29 uit de jaarlijkse controle."
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
    af: "klachten nemen af.",
    aan: "klachten houden aan.",
    geenVerbetering48: null,
    TODO_BART: "Statusteksten in episode 2: de casus geeft alleen de regels 'Trimethoprim: klachten houden aan.' en 'Fosfomycine: klachten nemen af.' Moet de tekst die de speler ziet het casusfragment zijn (met slotpunt, kleine letter) of een volledige zin met hoofdletter, en is 'Na 48 uur geen verbetering.' ook in episode 2 bedoeld?"
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
      bron: "[G]",
      TODO_BART: "De ernst-volgorde van de invarianten (1 = ernstigst) is een voorstel van Claude en niet door Bart bevestigd: I5 = 2, I7 = 3, I6 en I8 = 4, I1 en I4 = 5. Klopt die volgorde?"
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
      bron: "NHG",
      TODO_BART: "Terugkoppeling van weggelaten kaarten: de casus noemt niet welke weggelaten kaart welke downside toont."
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
      TODO_BART: "Casus geeft bij I6 twee verschillende vragen (geen kweek / afwachten). Welke vraag verschijnt als beide spelen?",
      TODO_BART_geenAntibioticum: "Een route zonder enig antibioticum (geen V3, V4, V5, ook geen wissel ernaartoe) in de risicogroep: de casus zegt 'een antibioticum is nodig', maar I6 noemt alleen 'afwachten (V1/V2)'. Telt niets voorschrijven als afwachten?"
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
                p: "en",
                args: [
                  { p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 2 },
                  { p: "niet", arg: { p: "opDagRelatief", kaart: "O2", anker: { start: "V5" }, van: 1, tot: 3 } }
                ]
              },
              {
                p: "en",
                args: [
                  { p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 3 },
                  { p: "niet", arg: { p: "opDagRelatief", kaart: "V6", doel: "V5", optie: "halveren", anker: { start: "V5" }, van: 3 } }
                ]
              }
            ]
          }
        ]
      },
      vraag: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
      vraagVarianten: [
        {
          als: {
            p: "en",
            args: [
              { p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 2 },
              { p: "niet", arg: { p: "opDagRelatief", kaart: "O2", anker: { start: "V5" }, van: 1, tot: 3 } }
            ]
          },
          vraag: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
          TODO_BART: "Casus geeft bij I7 twee verschillende vragen (geen kalium / niet gehalveerd). Welke vraag verschijnt als beide eisen ontbreken?"
        },
        {
          als: {
            p: "en",
            args: [
              { p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 3 },
              { p: "niet", arg: { p: "opDagRelatief", kaart: "V6", doel: "V5", optie: "halveren", anker: { start: "V5" }, van: 3 } }
            ]
          },
          vraag: "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?"
        }
      ],
      bron: "NHG, KNMP",
      TODO_BART: "De casus zegt bij I7: 'Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3', en in de geldige route 'V5 + O2 (dag 2–4) + V6 (na dag 3)'. Er staat niet 'na V5'. Lezing A (gekozen): dag 1 van de kuur is de dag waarop trimethoprim start; O2 is op tijd op dag 2 t/m 4 van de kuur, dus op verschil 1 t/m 3 dagen na de startdag (V5 op dag 1: O2 op dag 2–4), en V6 halveren op dag 4 of later, dus op verschil vanaf 3. Lezing B: 'dag 2–4' is het verschil in dagen na de startdag, dus O2 op verschil 2 t/m 4 (V5 op dag 1: O2 op dag 3–5). Bij lezing B is de route 'V5 op dag 1, O2 op dag 2' te vroeg en dus fout. Welke lezing bedoel je?",
      TODO_BART_vroegeWissel: "I7 bij een middel dat al vóór dag 3 is vervangen (V5, dan B1 naar V4, O2 en V6 halveren op het al gestopte V5): de casus zegt 'Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3'. Geldt I7 nog als trimethoprim niet 7 dagen loopt?"
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
      TODO_BART: "I8 (episode 2): casus zegt 'hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten'. Hoeveel beurten na de kweekuitslag (C) mag het resistente middel nog doorlopen, en vanaf wanneer 'houden de klachten aan'?",
      TODO_BART_vroegAfronden: "Vroeg afronden vóór de kweekuitslag (gebeurtenis C) ontloopt I8: de uitslag is dan nog niet gemeld, dus het resistente middel telt niet als doorgelopen. Moet afronden pas kunnen nadat C geweest is (instelling 'afronden pas na de gebeurtenissen')?"
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
      TODO_BART: "Reflectievraag voor profiel ontbreekt in de casus (episode 2 geeft alleen de profielnamen, geen reflectievragen).",
      TODO_BART_geenProfiel: "Een route die de poort haalt maar geen van beide profielen matcht (trimethoprim gevolgd door stoppen zonder wissel) heeft in de casus geen profiel."
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
  meta: { brug: "de kweek uit deze episode is het verborgen gegeven in episode 3 (G3)." }
});
window.CASUSSEN[0].todoBart.push(
  {
    id: "TODO_BART-E2-18",
    vraag: "De ernst-volgorde van de invarianten (1 = ernstigst) is een voorstel van Claude en niet door Bart bevestigd: I5 = 2, I7 = 3, I6 en I8 = 4, I1 en I4 = 5. Klopt die volgorde?",
    gekozenLezing: "Ernst zoals in de vraag genoemd: I5 = 2; I7 = 3; I6 en I8 = 4; I1 en I4 = 5. Instelbaar in de data. Bij gelijke ernst verschijnt de vraag die in de data het eerst staat.",
    plek: "E2.invarianten[].ernst"
  },
  {
    id: "TODO_BART-E2-19",
    vraag: "Terugkoppeling van weggelaten kaarten: de casus noemt niet welke weggelaten kaart welke downside toont.",
    gekozenLezing: "Geen terugkoppeling voor weggelaten kaarten in episode 2 (zelfde lezing als episode 3); wat de speler ziet bij een ontbrekende kaart staat in de zinnen onder 'Wat er zichtbaar wordt als een kaart ontbreekt'.",
    plek: "E2.invarianten[].weglaatDownside"
  },
  {
    id: "TODO_BART-E2-1",
    vraag: "I1 in episode 2: telt een episode zonder enige route (niets gespeeld) ook als 'een route zonder N1'?",
    gekozenLezing: "Strengste lezing, gelijk aan episode 1: elke afronding zonder N1 schendt I1, ook zonder gekozen route.",
    plek: "E2.invarianten.I1"
  },
  {
    id: "TODO_BART-E2-2",
    vraag: "De casus zegt bij I7: 'Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3', en in de geldige route 'V5 + O2 (dag 2–4) + V6 (na dag 3)'. Er staat niet 'na V5'. Lezing A (gekozen): dag 1 van de kuur is de dag waarop trimethoprim start; O2 is op tijd op dag 2 t/m 4 van de kuur, dus op verschil 1 t/m 3 dagen na de startdag (V5 op dag 1: O2 op dag 2–4), en V6 halveren op dag 4 of later, dus op verschil vanaf 3. Lezing B: 'dag 2–4' is het verschil in dagen na de startdag, dus O2 op verschil 2 t/m 4 (V5 op dag 1: O2 op dag 3–5). Bij lezing B is de route 'V5 op dag 1, O2 op dag 2' te vroeg en dus fout. Welke lezing bedoel je?",
    gekozenLezing: "Lezing A: verschil in dagen ten opzichte van de dag waarop trimethoprim start (die dag zelf = 0): O2 op verschil 1 t/m 3 (V5 op dag 1: dag 2–4, de route uit de casus is dus speelbaar), V6 halveren op verschil vanaf 3 (dag 4 of later; vgl. de feedbackvraag 'Dag 4. Hoeveel trimethoprim klaren haar nieren nog?'). Start van trimethoprim = V5 gespeeld, of B1 (wisselen) naar V5. Lezing B staat in de vraag.",
    plek: "E2.invarianten.I7"
  },
  {
    id: "TODO_BART-E2-3",
    vraag: "Casus geeft bij I7 twee verschillende vragen (geen kalium / niet gehalveerd). Welke vraag verschijnt als beide eisen ontbreken?",
    gekozenLezing: "Beide vragen staan letterlijk in de data, elk met zijn eigen voorwaarde; de eerste waarvan de voorwaarde klopt wint, in de volgorde van de casustabel (eerst geen kalium, dan niet gehalveerd).",
    plek: "E2.invarianten.I7.vraagVarianten"
  },
  {
    id: "TODO_BART-E2-4",
    vraag: "Casus geeft bij I6 twee verschillende vragen (geen kweek / afwachten). Welke vraag verschijnt als beide spelen?",
    gekozenLezing: "Beide vragen staan letterlijk in de data, elk met zijn eigen voorwaarde; de eerste waarvan de voorwaarde klopt wint, in de volgorde van de casustabel (eerst 'geen kweek', dan 'afwachten').",
    plek: "E2.invarianten.I6.vraagVarianten"
  },
  {
    id: "TODO_BART-E2-5",
    vraag: "I8 (episode 2): casus zegt 'hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten'. Hoeveel beurten na de kweekuitslag (C) mag het resistente middel nog doorlopen, en vanaf wanneer 'houden de klachten aan'?",
    gekozenLezing: "Streng: binnen 2 beurten na de kweekuitslag moet de speler gewisseld (B1) of gestopt (B2) hebben. Aan het einde van de tweede beurt (de dag van de uitslag plus 1) mag geen middel actief zijn waarvoor de kweek resistent zegt, terwijl de klachten aanhouden. Een wissel naar een ander resistent middel telt dus niet als bijsturen. De '2' staat als offset 1 in de data en is instelbaar.",
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
    gekozenLezing: "Alleen 'eGFR 29 uit de jaarlijkse controle' wordt getoond. De zin over de risicogroep staat in de data onder 'meta' (voor Bart en het overzicht), niet in de interface van de speler.",
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
    vraag: "Statusteksten in episode 2: de casus geeft alleen de regels 'Trimethoprim: klachten houden aan.' en 'Fosfomycine: klachten nemen af.' Moet de tekst die de speler ziet het casusfragment zijn (met slotpunt, kleine letter) of een volledige zin met hoofdletter, en is 'Na 48 uur geen verbetering.' ook in episode 2 bedoeld?",
    gekozenLezing: "af = 'klachten nemen af.', aan = 'klachten houden aan.': de casusfragmenten letterlijk, met het slotpunt van de casusregel en met een kleine letter (het fragment staat na de dubbele punt); geenVerbetering48 = null (komt in episode 2 niet voor, er is geen gebeurtenis A). Alternatief: een volledige zin met hoofdletter, bijvoorbeeld 'Klachten nemen af.' en 'Klachten houden aan.', of 'Na 48 uur geen verbetering.' ook in episode 2.",
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
    vraag: "Vroeg afronden vóór de kweekuitslag (gebeurtenis C) ontloopt I8: de uitslag is dan nog niet gemeld, dus het resistente middel telt niet als doorgelopen. Moet afronden pas kunnen nadat C geweest is (instelling 'afronden pas na de gebeurtenissen')?",
    gekozenLezing: "De data blokkeert niets: I8 geldt alleen als C geweest is. De spelinstelling 'afronden pas na de gebeurtenissen' staat standaard uit (de speler mag vrij afronden, ook vóór C) en kan door de ontwikkelaar aan worden gezet; dan is I8 niet meer te ontlopen. Let op: C komt alleen als O1 gespeeld is.",
    plek: "E2.invarianten.I8"
  },
  {
    id: "TODO_BART-E2-17",
    vraag: "I7 bij een middel dat al vóór dag 3 is vervangen (V5, dan B1 naar V4, O2 en V6 halveren op het al gestopte V5): de casus zegt 'Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3'. Geldt I7 nog als trimethoprim niet 7 dagen loopt?",
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

/* ===== uwi-e3.js ===== */
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
          { p: "waar", veld: "risicogroep", op: "==", waarde: true },
          { p: "gestart", middel: "V5" },
          {
            p: "of",
            args: [
              {
                p: "en",
                args: [
                  { p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 2 },
                  { p: "niet", arg: { p: "opDagRelatief", K: { kaart: "O2" }, anker: { start: "V5" }, van: 1, tot: 3 } }
                ]
              },
              {
                p: "en",
                args: [
                  { p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 3 },
                  { p: "niet", arg: { p: "opDagRelatief", K: { kaart: "V6", doel: "V5", optie: "halveren" }, anker: { start: "V5" }, van: 3 } }
                ]
              }
            ]
          }
        ]
      },
      vraag: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
      bron: "NHG, KNMP",
      vraagVarianten: [
        {
          als: {
            p: "en",
            args: [
              { p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 2 },
              { p: "niet", arg: { p: "opDagRelatief", K: { kaart: "O2" }, anker: { start: "V5" }, van: 1, tot: 3 } }
            ]
          },
          vraag: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?"
        },
        {
          als: {
            p: "en",
            args: [
              { p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 3 },
              { p: "niet", arg: { p: "opDagRelatief", K: { kaart: "V6", doel: "V5", optie: "halveren" }, anker: { start: "V5" }, van: 3 } }
            ]
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

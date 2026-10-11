// Casus UWI in de eerste lijn: kaartenbibliotheek (stuk S1). Alleen data, geen logica.
// Bron: casus-uwi.md v1.1, sectie 3. Episodes worden aangevuld door uwi-e1.js, uwi-e2.js en uwi-e3.js.
window.CASUSSEN = [
{
 "id": "uwi-eerstelijn",
 "versie": "1.1",
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
   "id": "TODO_BART-K5",
   "vraag": "De casus noemt voor het raadplegen alleen \"een eigen naslagkaart met verwijzing naar de bronnen\", zonder te zeggen welke bronnen erop staan. Zijn de vier bronnen uit de casuskop (NHG, SIDRIK, Kompas, KNMP) de bedoelde keuze, en blijft de naslagkaart voor alle episodes hetzelfde?",
   "gekozenLezing": "Alle vier de bronnen uit de casuskop, in kopvolgorde, als verwijzing op casusniveau (casus.raadplegen), voor elke episode gelijk; geen richtlijntekst toegevoegd.",
   "plek": "raadplegen.bronnen"
  }
 ],
 "episodes": []
}
];

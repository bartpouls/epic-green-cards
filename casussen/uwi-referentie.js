/* Casusreferentie van casus uwi-eerstelijn (stuk S11): de beschrijvende casustekst van secties 4, 5 en 6 die niet (of niet letterlijk) in het spel zit, letterlijk uit casus-uwi.md (zonder ** ), voor het overzicht. Alleen data. */
if (window.CASUSSEN && window.CASUSSEN[0]) {
  window.CASUSSEN[0].referentie = {
    "E1": {
      "episodeKop": "4. Episode 1 — level 1",
      "labels": {
        "knoppen": "Knoppen:",
        "volgorde": "Volgorde vrij:"
      },
      "knoppen": [
        "repertoire klein (12 kaarten)",
        "acties per beurt ruim",
        "geen gebeurtenissen",
        "richtlijn raadplegen kost niets"
      ],
      "patientkaart": [
        "Mevrouw V., 72 jaar. Eerste cystitis: pijnlijke en frequente mictie sinds 2 dagen, geen koorts, nitriettest positief.",
        "Medicatie: lisinopril (hypertensie).",
        "Lab: eGFR 42, recent.",
        "Geen risicogroep. De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].",
        "Verborgen: niets."
      ],
      "repertoireTekst": "G1, G2, O1, O2, V1, V2, V3, V4, V5, N1, N2, Ev1",
      "gebeurtenissenTabel": null,
      "gebeurtenisUitleg": [],
      "geldigeRoutes": [
        {
          "route": "Afwachten",
          "kern": "V1 + N1 + Ev1",
          "profiel": "Terughoudend"
        },
        {
          "route": "Uitgesteld recept",
          "kern": "V2 (+ middel) + N1 + N2 + Ev1",
          "profiel": "Gedeelde regie"
        },
        {
          "route": "Nitrofurantoïne 5 dagen",
          "kern": "V3 + N1 (+ N2, Ev1)",
          "profiel": "Direct behandelen, 1e keus"
        },
        {
          "route": "Fosfomycine",
          "kern": "V4 + N1 + N2",
          "profiel": "Direct behandelen, 2e keus"
        },
        {
          "route": "Trimethoprim 3 dagen",
          "kern": "V5 + N1",
          "profiel": "Direct behandelen, 3e keus"
        }
      ],
      "geldigeRoutesNoot": "Bij trimethoprim 3 dagen is geen kaliumcontrole nodig. De NHG vraagt die alleen bij een 7-daagse kuur of bij profylaxe, en de KNMP-regel slaat aan bij een gebruiksduur van meer dan 6 dagen [NHG, KNMP].",
      "routeBijWeefselinvasie": null,
      "bronconflict": null,
      "altijdFout": {
        "I1": {
          "tekst": "Een route zonder N1",
          "bron": "NHG"
        },
        "I3": {
          "tekst": "V1 zonder Ev1",
          "bron": "NHG"
        },
        "I4": {
          "tekst": "Twee antibiotica tegelijk",
          "bron": "[G]"
        }
      },
      "volgorde": [
        "Volgorde vrij: alle kaarten mogen in elke volgorde."
      ],
      "score": [
        "Duurzaamheid: afwachten > uitgesteld recept > direct een antibioticum.",
        "Doelmatigheid: O1 (kweek niet geïndiceerd) en O2 (geen indicatie) kosten punten."
      ],
      "zichtbaarAlsOntbreekt": [
        "Zonder N1: \"Mevrouw weet niet wanneer ze moet bellen.\"",
        "V1 zonder Ev1: \"Er is geen moment om alsnog te starten als de klachten aanhouden.\""
      ],
      "feedbackTabel": [
        {
          "trigger": "I1",
          "vraag": "\"Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?\""
        },
        {
          "trigger": "I3",
          "vraag": "\"Je wacht af. Tot wanneer, en wat gebeurt er dan?\""
        },
        {
          "trigger": "I4",
          "vraag": "\"Wat lost het tweede middel op dat het eerste niet oplost?\""
        },
        {
          "trigger": "O1 gespeeld",
          "vraag": "\"Wat doe je bij welke uitslag anders?\""
        },
        {
          "trigger": "Profiel terughoudend",
          "vraag": "\"Je schreef niets voor. Bij welke patiënt zou dat niet mogen?\""
        },
        {
          "trigger": "Profiel direct behandelen",
          "vraag": "\"Het werkt. Was het nodig, en koos zíj ervoor?\""
        }
      ],
      "brug": null,
      "tabelkoppen": {
        "geldigeRoutes": [
          "Route",
          "Kern",
          "Profiel"
        ],
        "gebeurtenissen": null,
        "routeBijWeefselinvasie": null,
        "altijdFout": [
          "Id",
          "Altijd fout",
          "Bron"
        ],
        "feedback": [
          "Trigger",
          "Vraag"
        ]
      },
      "inspringing": {
        "patientkaart": [
          0,
          0,
          0,
          0,
          0
        ],
        "gebeurtenisUitleg": []
      },
      "volgordeVanSecties": [
        "Knoppen",
        "Patiëntkaart",
        "Repertoire",
        "Geldige routes",
        "Invarianten (poort)",
        "Volgorde vrij",
        "Score",
        "Wat er zichtbaar wordt als een kaart ontbreekt",
        "Feedback (scherp-Socratisch, zegt niet voor)"
      ],
      "TODO_BART_volgordeVanSecties": "De koppen van de casus zijn overgenomen zoals ze in casus-uwi.md staan, inclusief de toevoegingen tussen haakjes (bijvoorbeeld 'Invarianten (poort; I1 en I4 blijven gelden)') en inclusief de vetgedrukte labels die geen kop zijn ('Knoppen', 'Volgorde vrij', 'Brug', 'Bronconflict, geen poort') en de tabelkop 'Route bij weefselinvasie'. Moet het overzicht deze namen precies zo tonen, of liever kortere namen zonder de toevoeging (bijvoorbeeld 'Invarianten (poort)' en 'Volgorde')?",
      "TODO_BART_geldigeRoutesNoot": "Onder de tabel 'Geldige routes' van episode 1 staat een losse alinea: 'Bij trimethoprim 3 dagen is geen kaliumcontrole nodig. ...'. Ze is geen tabelrij maar hoort wel bij de routes; ze staat daarom als aparte tekst in geldigeRoutesNoot. Hoort ze bij de route Trimethoprim 3 dagen, of is een aparte alinea in het overzicht goed?",
      "TODO_BART_overigeCasusregels": "Het overzicht heeft de gewone speldata voor de patiëntkaart, het repertoire, de kaarten die ontbreken en de feedbackvragen, maar de casus zet er ook kopjes, labels en een kolom 'Trigger' bij (bijvoorbeeld 'Zonder N1:', 'I6, geen kweek', 'Verborgen: niets.'). Moeten die casusregels in het overzicht naast de speldata getoond worden?"
    },
    "E2": {
      "episodeKop": "5. Episode 2 — level 2",
      "labels": {
        "knoppen": "Knoppen:",
        "volgorde": "Volgorde:"
      },
      "knoppen": [
        "repertoire groter, met afleiders (15 kaarten)",
        "acties per beurt ruim",
        "1 gebeurtenis"
      ],
      "patientkaart": [
        "Mevrouw V., 78 jaar (6 jaar na episode 1). Tweede cystitis, geen koorts, nitriettest positief.",
        "Medicatie: lisinopril; calcium/colecalciferol (afleider, bereidt episode 3 voor).",
        "Lab op de kaart: laatst bekende eGFR 42, van 6 jaar geleden.",
        "Eerdere UWI: episode 1, toen geen kweek gedaan.",
        "Verborgen achter G2: eGFR 29 uit de jaarlijkse controle. Daarmee valt ze in de risicogroep: een antibioticum is nodig, met een kweek vóór de eerste dosis, en nitrofurantoïne valt af [NHG]."
      ],
      "repertoireTekst": "Alles uit episode 1, plus V6, B1 en B2.",
      "gebeurtenissenTabel": null,
      "gebeurtenisUitleg": [
        "Kweekuitslag, 3 dagen nadat O1 is gespeeld, aan het begin van die dag.",
        "E. coli, resistent voor trimethoprim en amoxicilline.",
        "Gevoelig voor nitrofurantoïne, fosfomycine, amoxicilline/clavulaanzuur en ciprofloxacine.",
        "De 3 dagen zijn Barts keuze; de oorspronkelijke 2–4 dagen kwamen via Mistral en zijn niet gecheckt.",
        "Wat de patiënt laat zien, hangt af van de keuze:",
        "Trimethoprim: klachten houden aan.",
        "Fosfomycine: klachten nemen af."
      ],
      "geldigeRoutes": [
        {
          "route": "Fosfomycine",
          "kern": "G2 → O1 → V4 + N1 + N2 → na de uitslag niet wisselen",
          "profiel": "Kweekgestuurd, smal"
        },
        {
          "route": "Trimethoprim 7 dagen",
          "kern": "G2 → O1 → V5 + O2 (dag 2–4) + V6 (na dag 3) + N1 → na de uitslag B1 naar fosfomycine",
          "profiel": "Bijgestuurd"
        }
      ],
      "geldigeRoutesNoot": null,
      "routeBijWeefselinvasie": null,
      "bronconflict": null,
      "altijdFout": {
        "I5": {
          "tekst": "Nitrofurantoïne bij eGFR < 30, ook als de kweek \"gevoelig\" zegt",
          "bron": "NHG"
        },
        "I6": {
          "tekst": "Een antibioticum starten zonder O1 vooraf, of afwachten (V1/V2) in de risicogroep",
          "bron": "NHG"
        },
        "I7": {
          "tekst": "Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3",
          "bron": "NHG, KNMP"
        },
        "I8": {
          "tekst": "Bij aanhoudende klachten doorgaan met een middel waarvoor de bacterie resistent is",
          "bron": "NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten"
        }
      },
      "volgorde": [
        "O1 vóór de eerste antibioticumkaart.",
        "O2 ná V5.",
        "De rest is vrij."
      ],
      "score": [
        "Duurzaamheid: wisselen terwijl het middel werkt en de klachten afnemen, kost punten.",
        "Doelmatigheid: G2 spelen vóór de voorschrijfkaart levert punten op."
      ],
      "zichtbaarAlsOntbreekt": [
        "Nitrofurantoïne zonder G2: \"De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.\"",
        "V5 zonder O2: \"De kaliumspiegel is onbekend.\""
      ],
      "feedbackTabel": [
        {
          "trigger": "Verouderde eGFR niet opgemerkt",
          "vraag": "\"Hoe oud was de eGFR waarop je besloot? Wat is er sindsdien met haar gebeurd?\""
        },
        {
          "trigger": "I5",
          "vraag": "\"Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?\""
        },
        {
          "trigger": "I6, geen kweek",
          "vraag": "\"Wat vertelt een kweek van urine die al antibioticum heeft gezien?\""
        },
        {
          "trigger": "I6, afwachten",
          "vraag": "\"Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?\""
        },
        {
          "trigger": "I7, geen kalium",
          "vraag": "\"Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?\""
        },
        {
          "trigger": "I7, niet gehalveerd",
          "vraag": "\"Dag 4. Hoeveel trimethoprim klaren haar nieren nog?\""
        },
        {
          "trigger": "I8",
          "vraag": "\"De kweek is binnen en de klachten blijven. Waar wacht je nog op?\""
        },
        {
          "trigger": "Onnodig gewisseld",
          "vraag": "\"Het werkte en de klachten namen af. Wat won je met wisselen?\""
        }
      ],
      "brug": "Brug: de kweek uit deze episode is het verborgen gegeven in episode 3 (G3).",
      "tabelkoppen": {
        "geldigeRoutes": [
          "Route",
          "Kern",
          "Profiel"
        ],
        "gebeurtenissen": null,
        "routeBijWeefselinvasie": null,
        "altijdFout": [
          "Id",
          "Altijd fout",
          "Bron"
        ],
        "feedback": [
          "Trigger",
          "Vraag"
        ]
      },
      "inspringing": {
        "patientkaart": [
          0,
          0,
          0,
          0,
          0
        ],
        "gebeurtenisUitleg": [
          0,
          1,
          1,
          1,
          0,
          1,
          1
        ]
      },
      "volgordeVanSecties": [
        "Knoppen",
        "Patiëntkaart",
        "Repertoire",
        "Gebeurtenis",
        "Geldige routes",
        "Invarianten (poort; I1 en I4 blijven gelden)",
        "Volgorde",
        "Score",
        "Wat er zichtbaar wordt als een kaart ontbreekt",
        "Feedback",
        "Brug"
      ],
      "TODO_BART_volgordeVanSecties": "De koppen van de casus zijn overgenomen zoals ze in casus-uwi.md staan, inclusief de toevoegingen tussen haakjes (bijvoorbeeld 'Invarianten (poort; I1 en I4 blijven gelden)') en inclusief de vetgedrukte labels die geen kop zijn ('Knoppen', 'Volgorde vrij', 'Brug', 'Bronconflict, geen poort') en de tabelkop 'Route bij weefselinvasie'. Moet het overzicht deze namen precies zo tonen, of liever kortere namen zonder de toevoeging (bijvoorbeeld 'Invarianten (poort)' en 'Volgorde')?",
      "TODO_BART_gebeurtenisUitleg": "Onder 'Gebeurtenis' van episode 2 staan in de casus twee bullets met onderliggende bullets: 'Kweekuitslag, 3 dagen nadat O1 is gespeeld, aan het begin van die dag.' (met drie onderliggende regels, onder andere 'De 3 dagen zijn Barts keuze; de oorspronkelijke 2–4 dagen kwamen via Mistral en zijn niet gecheckt.') en 'Wat de patiënt laat zien, hangt af van de keuze:' (met 'Trimethoprim: klachten houden aan.' en 'Fosfomycine: klachten nemen af.'). Moet het overzicht deze zeven regels in de volgorde van de casus tonen, met de onderliggende regels ingesprongen onder hun hoofdbullet?",
      "TODO_BART_overigeCasusregels": "Het overzicht heeft de gewone speldata voor de patiëntkaart, het repertoire, de kaarten die ontbreken en de feedbackvragen, maar de casus zet er ook kopjes, labels en een kolom 'Trigger' bij (bijvoorbeeld 'Zonder N1:', 'I6, geen kweek', 'Verborgen: niets.'). Moeten die casusregels in het overzicht naast de speldata getoond worden?"
    },
    "E3": {
      "episodeKop": "6. Episode 3 — level 3",
      "labels": {
        "knoppen": "Knoppen:",
        "volgorde": null
      },
      "knoppen": [
        "volledig repertoire (26 kaarten)",
        "acties per beurt krap",
        "2 gebeurtenissen in vrije volgorde, plus de kweekuitslag"
      ],
      "patientkaart": [
        "Mevrouw V., 79 jaar (1 jaar na episode 2). Cystitis, geen koorts.",
        "Medicatie: lisinopril, spironolacton (hypertensie), calcium/colecalciferol.",
        "Wie spironolacton heeft gestart en waarom, staat er bewust niet op. Het leerpunt: als de nierfunctie daalt, kijk je niet alleen naar wat je nu voorschrijft, maar naar alles wat de patiënt al gebruikt. In de praktijk wordt dat vaak gemist.",
        "Lab: eGFR 28, recent. Risicogroep [NHG].",
        "Verborgen achter G3: de kweek uit episode 2, met trimethoprim resistent. Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG]."
      ],
      "repertoireTekst": "Alle kaarten uit de bibliotheek (G1–Ev3).",
      "gebeurtenissenTabel": [
        {
          "id": "A",
          "trigger": "Na kaart *n* (engine-parameter); volgorde met B willekeurig",
          "inhoud": "Weefselinvasie: koorts 38,6 °C en flankpijn"
        },
        {
          "id": "B",
          "trigger": "Na kaart *m* (engine-parameter); volgorde met A willekeurig",
          "inhoud": "Uitdroging: eet en drinkt slecht, twee dagen koorts. Daarmee is de SIDRIK-drempel gehaald (koorts ≥ 38,5 °C gedurende 2 dagen en/of braken of diarree > 3× per dag) [SIDRIK]"
        },
        {
          "id": "C",
          "trigger": "3 dagen na O1",
          "inhoud": "Kweekuitslag. E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine en nitrofurantoïne."
        }
      ],
      "gebeurtenisUitleg": [
        "De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler."
      ],
      "geldigeRoutes": [
        {
          "route": "Start bij cystitis: G3 → O1 → V4 (fosfomycine) + N1.",
          "kern": [
            "Trimethoprim valt af door de eerdere kweek.",
            "Nitrofurantoïne valt af door de nierfunctie."
          ],
          "profiel": null
        },
        {
          "route": "Vanaf het begin: O2 + Ev2 voor lisinopril + spironolacton (I9).",
          "kern": [],
          "profiel": null
        },
        {
          "route": "Na A (weefselinvasie):",
          "kern": [
            "nieuwe kweek (O1)",
            "wisselen (B1) naar amoxicilline/clavulaanzuur met V6 naar 875/125 mg 2 dd, of naar ciprofloxacine met B4 (scheiden van calcium) of B3 (calcium tijdelijk stoppen)",
            "Ev1: contact binnen 48 uur"
          ],
          "profiel": null
        },
        {
          "route": "Na B (uitdroging):",
          "kern": [
            "B3 spironolacton stoppen",
            "V6 lisinopril halveren",
            "N3 drinkadvies",
            "Ev1 monitoring binnen 1–3 dagen",
            "geen automatische herstart van spironolacton (Ev2)"
          ],
          "profiel": null
        },
        {
          "route": "Na C (kweekuitslag): wie ciprofloxacine koos, kan de-escaleren naar amoxicilline/clavulaanzuur.",
          "kern": [],
          "profiel": null
        },
        {
          "route": "Rand van de kaart: na 48 uur geen verbetering → Ev3 verwijzen.",
          "kern": [],
          "profiel": null
        }
      ],
      "geldigeRoutesNoot": null,
      "routeBijWeefselinvasie": [
        {
          "route": "Amoxicilline/clavulaanzuur 875/125 mg 2 dd",
          "poort": "Gehaald",
          "profiel": "Kweekgestuurd; scoort hoger. De keuze leunt op de eerdere kweek en vermijdt de risico's van ciprofloxacine bij ouderen [NHG]."
        },
        {
          "route": "Ciprofloxacine met calcium gescheiden of gestopt",
          "poort": "Gehaald",
          "profiel": "Eerste keus volgens de richtlijn; eigen profiel"
        }
      ],
      "bronconflict": "Bronconflict, geen poort: voor ciprofloxacine bij eGFR 10–30 geeft de NHG de normale keerdosis eenmaal per 24 uur [NHG]. Het Kompas past de dosis pas aan bij een klaring ≤ 15 [Kompas]. Beide zijn verdedigbaar; het wordt een feedbackmoment.",
      "altijdFout": {
        "I9": {
          "tekst": "De combinatie lisinopril + spironolacton bij eGFR < 30 laten liggen (geen O2 én geen Ev2), of spironolacton na de sick day hervatten (B5) zonder eerst Ev2",
          "geldtIn": "Alle toestanden van E3",
          "bron": "Bart; SIDRIK; herstart-nuance [G]"
        },
        "I10": {
          "tekst": "Bij weefselinvasie doorgaan met nitrofurantoïne of fosfomycine: onvoldoende concentratie in het weefsel",
          "geldtIn": "Met A",
          "bron": "NHG"
        },
        "I11": {
          "tekst": "Bij weefselinvasie wisselen zonder eerst een nieuwe kweek",
          "geldtIn": "Met A",
          "bron": "NHG"
        },
        "I12": {
          "tekst": "Cotrimoxazol voorschrijven",
          "geldtIn": "Alle",
          "bron": "NHG, Kompas"
        },
        "I13": {
          "tekst": "Amoxicilline/clavulaanzuur zonder V6 naar 875/125 mg 2 dd",
          "geldtIn": "Alle",
          "bron": "NHG"
        },
        "I14": {
          "tekst": "Ciprofloxacine zonder B4 (scheiden van calcium) en zonder B3 (calcium tijdelijk stoppen)",
          "geldtIn": "Met ciprofloxacine",
          "bron": "Kompas; B3-route [G]"
        },
        "I15": {
          "tekst": "Na het halen van de sick day-drempel niet: spironolacton stoppen, lisinopril halveren, drinkadvies, monitoring binnen 1–3 dagen",
          "geldtIn": "Met B",
          "bron": "SIDRIK"
        },
        "I16": {
          "tekst": "Geen contact binnen 48 uur, of geen verwijzing als ze dan niet beter is",
          "geldtIn": "Met A",
          "bron": "NHG"
        }
      },
      "volgorde": null,
      "score": [
        "Duurzaamheid: de-escaleren van ciprofloxacine naar amoxicilline/clavulaanzuur na de kweek (C) levert punten op.",
        "Doelmatigheid: G3 gebruiken vóór de eerste keuze levert punten op."
      ],
      "zichtbaarAlsOntbreekt": [
        "Geen sick day-maatregelen: \"De nierfunctie daalt verder en het kalium stijgt.\" Zonder getallen, zoals ook de KNMP-regel geen getallen geeft.",
        "Ciprofloxacine zonder B4/B3: \"Na 48 uur geen verbetering.\"",
        "I9 gemist: \"Het kalium is onbekend, en niemand heeft naar spironolacton gekeken.\""
      ],
      "feedbackTabel": [
        {
          "trigger": "I9",
          "vraag": "\"Haar nierfunctie is 28. Welk van haar vaste middelen begon toen die nog hoger was, en wie kijkt daar nu naar?\""
        },
        {
          "trigger": "Automatische herstart",
          "vraag": "\"De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?\""
        },
        {
          "trigger": "I10",
          "vraag": "\"Fosfomycine werkt in de blaas. Waar zit de infectie nu?\""
        },
        {
          "trigger": "I11",
          "vraag": "\"Je wisselt. Waarop baseer je de wissel daarna?\""
        },
        {
          "trigger": "I12",
          "vraag": "\"Cotrimoxazol naast spironolacton bij een eGFR van 28. Wat doet dat met haar kalium?\""
        },
        {
          "trigger": "I13",
          "vraag": "\"Clavulaanzuur bij een eGFR van 28. Waar blijft het?\""
        },
        {
          "trigger": "I14",
          "vraag": "\"Ze neemt elke ochtend calcium. Hoeveel van je ciprofloxacine komt in haar bloed?\""
        },
        {
          "trigger": "I15",
          "vraag": "\"Ze drinkt nauwelijks en heeft twee dagen koorts. Wat doen lisinopril en spironolacton met een nier die al droog staat?\""
        },
        {
          "trigger": "I16",
          "vraag": "\"Het is 48 uur later en ze is niet beter. Wat is je volgende kaart, en is die nog aan jou?\""
        },
        {
          "trigger": "Ciprofloxacine-dosis (bronconflict)",
          "vraag": "\"De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?\""
        },
        {
          "trigger": "Profiel ciprofloxacine",
          "vraag": "\"Eerste keus volgens de richtlijn. Gold die eerste keus ook voor déze patiënt?\""
        }
      ],
      "brug": null,
      "tabelkoppen": {
        "geldigeRoutes": null,
        "gebeurtenissen": [
          "Id",
          "Trigger",
          "Inhoud"
        ],
        "routeBijWeefselinvasie": [
          "Route bij weefselinvasie",
          "Poort",
          "Profiel"
        ],
        "altijdFout": [
          "Id",
          "Altijd fout",
          "Geldt in",
          "Bron"
        ],
        "feedback": [
          "Trigger",
          "Vraag"
        ]
      },
      "inspringing": {
        "patientkaart": [
          0,
          0,
          1,
          0,
          0
        ],
        "gebeurtenisUitleg": [
          0
        ]
      },
      "volgordeVanSecties": [
        "Knoppen",
        "Patiëntkaart",
        "Repertoire",
        "Gebeurtenissen",
        "Geldige routes (kern)",
        "Route bij weefselinvasie",
        "Bronconflict, geen poort",
        "Invarianten (poort; I1, I4, I5, I6, I7 en I8 blijven gelden)",
        "Score",
        "Wat er zichtbaar wordt als een kaart ontbreekt",
        "Feedback"
      ],
      "TODO_BART_volgordeVanSecties": "De koppen van de casus zijn overgenomen zoals ze in casus-uwi.md staan, inclusief de toevoegingen tussen haakjes (bijvoorbeeld 'Invarianten (poort; I1 en I4 blijven gelden)') en inclusief de vetgedrukte labels die geen kop zijn ('Knoppen', 'Volgorde vrij', 'Brug', 'Bronconflict, geen poort') en de tabelkop 'Route bij weefselinvasie'. Moet het overzicht deze namen precies zo tonen, of liever kortere namen zonder de toevoeging (bijvoorbeeld 'Invarianten (poort)' en 'Volgorde')?",
      "TODO_BART_gebeurtenisUitleg": "De casus zet onder de gebeurtenissentabel van episode 3 een alinea 'De oorzaak van A en B is neutraal: ...'. Ze is geen tabelrij en geen bullet; ze staat hier als enige regel van gebeurtenisUitleg. Is dat de goede plek in het overzicht?",
      "TODO_BART_geldigeRoutes": "In episode 3 staat 'Geldige routes (kern)' als bullets met onderliggende bullets, niet als tabel met een kolom Profiel. Gekozen: route is de tekst van de hoofdbullet (zonder vetdruk, zoals 'Na A (weefselinvasie):'), kern zijn de onderliggende bullets, en profiel is leeg omdat de casus hier geen profiel noemt. De profielen bij weefselinvasie staan apart in routeBijWeefselinvasie. Alternatief: het vetgedrukte begin ('Start bij cystitis:') als route en de rest van de bullet als kern.",
      "TODO_BART_gebeurtenissenTabel": "In de gebeurtenissentabel van episode 3 staat bij A en B een trigger met sterretjes om de n en de m: 'Na kaart *n* (engine-parameter); volgorde met B willekeurig' en 'Na kaart *m* (engine-parameter); volgorde met A willekeurig'. Alleen de vetdruk is weggelaten; deze enkele sterretjes (cursief in de casus) staan er nog zoals in de casus. Moeten ze blijven staan, of weg ('Na kaart n')?",
      "TODO_BART_overigeCasusregels": "Het overzicht heeft de gewone speldata voor de patiëntkaart, het repertoire, de kaarten die ontbreken en de feedbackvragen, maar de casus zet er ook kopjes, labels en een kolom 'Trigger' bij (bijvoorbeeld 'Zonder N1:', 'I6, geen kweek', 'Verborgen: niets.'). Moeten die casusregels in het overzicht naast de speldata getoond worden?"
    }
  };
  window.CASUSSEN[0].todoBart.push(
    {
      "id": "TODO_BART-R1",
      "vraag": "De koppen van de casus zijn overgenomen zoals ze in casus-uwi.md staan, inclusief de toevoegingen tussen haakjes (bijvoorbeeld 'Invarianten (poort; I1 en I4 blijven gelden)') en inclusief de vetgedrukte labels die geen kop zijn ('Knoppen', 'Volgorde vrij', 'Brug', 'Bronconflict, geen poort') en de tabelkop 'Route bij weefselinvasie'. Moet het overzicht deze namen precies zo tonen, of liever kortere namen zonder de toevoeging (bijvoorbeeld 'Invarianten (poort)' en 'Volgorde')?",
      "gekozenLezing": "De namen staan precies zoals in de casus (met toevoegingen tussen haakjes en met 'Volgorde vrij' in episode 1). Alternatief: korte namen zonder toevoeging.",
      "plek": "referentie.E1/E2/E3.volgordeVanSecties"
    },
    {
      "id": "TODO_BART-R2",
      "vraag": "Onder de tabel 'Geldige routes' van episode 1 staat een losse alinea: 'Bij trimethoprim 3 dagen is geen kaliumcontrole nodig. ...'. Ze is geen tabelrij maar hoort wel bij de routes; ze staat daarom als aparte tekst in geldigeRoutesNoot. Hoort ze bij de route Trimethoprim 3 dagen, of is een aparte alinea in het overzicht goed?",
      "gekozenLezing": "De alinea staat letterlijk als apart veld geldigeRoutesNoot van episode 1. Alternatief: onder de route Trimethoprim 3 dagen tonen.",
      "plek": "referentie.E1.geldigeRoutesNoot"
    },
    {
      "id": "TODO_BART-R3",
      "vraag": "Onder 'Gebeurtenis' van episode 2 staan in de casus twee bullets met onderliggende bullets: 'Kweekuitslag, 3 dagen nadat O1 is gespeeld, aan het begin van die dag.' (met drie onderliggende regels, onder andere 'De 3 dagen zijn Barts keuze; de oorspronkelijke 2–4 dagen kwamen via Mistral en zijn niet gecheckt.') en 'Wat de patiënt laat zien, hangt af van de keuze:' (met 'Trimethoprim: klachten houden aan.' en 'Fosfomycine: klachten nemen af.'). Moet het overzicht deze zeven regels in de volgorde van de casus tonen, met de onderliggende regels ingesprongen onder hun hoofdbullet?",
      "gekozenLezing": "Elke bullet staat als aparte regel in gebeurtenisUitleg, in de volgorde van de casus, zonder samenvoeging. Welke regels onderliggend zijn, staat apart in inspringing.gebeurtenisUitleg (0 = hoofdbullet, 1 = onderliggende bullet). De regels over de kweekuitslag staan ook in de gebeurtenis zelf; hier staan ze nogmaals zodat de hele sectie naast de casus past. Alternatief: alleen de regels tonen die niet al in de gebeurtenis staan.",
      "plek": "referentie.E2.gebeurtenisUitleg"
    },
    {
      "id": "TODO_BART-R4",
      "vraag": "De casus zet onder de gebeurtenissentabel van episode 3 een alinea 'De oorzaak van A en B is neutraal: ...'. Ze is geen tabelrij en geen bullet; ze staat hier als enige regel van gebeurtenisUitleg. Is dat de goede plek in het overzicht?",
      "gekozenLezing": "De alinea staat letterlijk als enige regel van gebeurtenisUitleg van episode 3. Alternatief: als losse toelichting onder de gebeurtenissentabel.",
      "plek": "referentie.E3.gebeurtenisUitleg"
    },
    {
      "id": "TODO_BART-R5",
      "vraag": "In episode 3 staat 'Geldige routes (kern)' als bullets met onderliggende bullets, niet als tabel met een kolom Profiel. Gekozen: route is de tekst van de hoofdbullet (zonder vetdruk, zoals 'Na A (weefselinvasie):'), kern zijn de onderliggende bullets, en profiel is leeg omdat de casus hier geen profiel noemt. De profielen bij weefselinvasie staan apart in routeBijWeefselinvasie. Alternatief: het vetgedrukte begin ('Start bij cystitis:') als route en de rest van de bullet als kern.",
      "gekozenLezing": "route = hoofdbullet, kern = onderliggende bullets, profiel leeg. Alternatief: vetgedrukt begin als route, rest als kern.",
      "plek": "referentie.E3.geldigeRoutes"
    },
    {
      "id": "TODO_BART-R6",
      "vraag": "In de gebeurtenissentabel van episode 3 staat bij A en B een trigger met sterretjes om de n en de m: 'Na kaart *n* (engine-parameter); volgorde met B willekeurig' en 'Na kaart *m* (engine-parameter); volgorde met A willekeurig'. Alleen de vetdruk is weggelaten; deze enkele sterretjes (cursief in de casus) staan er nog zoals in de casus. Moeten ze blijven staan, of weg ('Na kaart n')?",
      "gekozenLezing": "Letterlijk behouden, dus met sterretjes: 'Na kaart *n* (engine-parameter); volgorde met B willekeurig'. Alternatief: de sterretjes weglaten.",
      "plek": "referentie.E3.gebeurtenissenTabel"
    },
    {
      "id": "TODO_BART-R7",
      "vraag": "Het overzicht heeft de gewone speldata voor de patiëntkaart, het repertoire, de kaarten die ontbreken en de feedbackvragen, maar de casus zet er ook kopjes, labels en een kolom 'Trigger' bij (bijvoorbeeld 'Zonder N1:', 'I6, geen kweek', 'Verborgen: niets.'). Moeten die casusregels in het overzicht naast de speldata getoond worden?",
      "gekozenLezing": "Ja: de hele tekst van deze kopjes staat letterlijk in de referentie (patientkaart, repertoireTekst, zichtbaarAlsOntbreekt, feedbackTabel, tabelkoppen, episodeKop, labels), zodat elk kopje van de casus regel voor regel te vergelijken is. Alternatief: alleen de speldata tonen en deze casusregels weglaten.",
      "plek": "referentie.E1/E2/E3.patientkaart, repertoireTekst, zichtbaarAlsOntbreekt, feedbackTabel, tabelkoppen, episodeKop, labels"
    }
  );
}

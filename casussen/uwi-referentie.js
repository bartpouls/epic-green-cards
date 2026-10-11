/* Casusreferentie van casus uwi-eerstelijn (stuk S11): beschrijvende casustekst die niet in het spel zit, letterlijk uit casus-uwi.md (zonder ** ), voor het overzicht. Alleen data. */
if (window.CASUSSEN && window.CASUSSEN[0]) {
  window.CASUSSEN[0].referentie = {
    "E1": {
      "knoppen": [
        "repertoire klein (12 kaarten)",
        "acties per beurt ruim",
        "geen gebeurtenissen",
        "richtlijn raadplegen kost niets"
      ],
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
      "brug": null,
      "bronconflict": null,
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
      "TODO_BART_geldigeRoutesNoot": "Onder de tabel 'Geldige routes' van episode 1 staat een losse alinea: 'Bij trimethoprim 3 dagen is geen kaliumcontrole nodig. ...'. Ze is geen tabelrij maar hoort wel bij de routes; ze staat daarom als aparte tekst in geldigeRoutesNoot. Hoort ze bij de route Trimethoprim 3 dagen, of is een aparte alinea in het overzicht goed?"
    },
    "E2": {
      "knoppen": [
        "repertoire groter, met afleiders (15 kaarten)",
        "acties per beurt ruim",
        "1 gebeurtenis"
      ],
      "gebeurtenisUitleg": [
        "De doorlooptijd van 2–4 dagen kwam via Mistral en is niet zelf gecheckt.",
        "Wat de patiënt laat zien, hangt af van de keuze: Trimethoprim: klachten houden aan. Fosfomycine: klachten nemen af."
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
      "brug": "Brug: de kweek uit deze episode is het verborgen gegeven in episode 3 (G3).",
      "bronconflict": null,
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
      "TODO_BART_gebeurtenisUitleg": "Onder 'Gebeurtenis' staat een bullet 'Wat de patiënt laat zien, hangt af van de keuze:' met twee onderliggende bullets ('Trimethoprim: klachten houden aan.' en 'Fosfomycine: klachten nemen af.'). Ze zijn tot één regel samengevoegd met een spatie ertussen. Ook de onderliggende regel 'De doorlooptijd van 2–4 dagen kwam via Mistral en is niet zelf gecheckt.' staat hier, los van de kweekuitslag-tekst. Moeten de onderliggende bullets als aparte regels worden getoond?"
    },
    "E3": {
      "knoppen": [
        "volledig repertoire (26 kaarten)",
        "acties per beurt krap",
        "2 gebeurtenissen in vrije volgorde, plus de kweekuitslag"
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
      "brug": null,
      "bronconflict": "Bronconflict, geen poort: voor ciprofloxacine bij eGFR 10–30 geeft de NHG de normale keerdosis eenmaal per 24 uur [NHG]. Het Kompas past de dosis pas aan bij een klaring ≤ 15 [Kompas]. Beide zijn verdedigbaar; het wordt een feedbackmoment.",
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
      "TODO_BART_geldigeRoutes": "In episode 3 staat 'Geldige routes (kern)' als bullets met onderliggende bullets, niet als tabel met een kolom Profiel. Gekozen: route is de tekst van de hoofdbullet (zonder vetdruk, zoals 'Na A (weefselinvasie):'), kern zijn de onderliggende bullets, en profiel is leeg omdat de casus hier geen profiel noemt. De profielen bij weefselinvasie staan apart in routeBijWeefselinvasie. Alternatief: het vetgedrukte begin ('Start bij cystitis:') als route en de rest van de bullet als kern."
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
    "vraag": "Onder 'Gebeurtenis' staat een bullet 'Wat de patiënt laat zien, hangt af van de keuze:' met twee onderliggende bullets ('Trimethoprim: klachten houden aan.' en 'Fosfomycine: klachten nemen af.'). Ze zijn tot één regel samengevoegd met een spatie ertussen. Ook de onderliggende regel 'De doorlooptijd van 2–4 dagen kwam via Mistral en is niet zelf gecheckt.' staat hier, los van de kweekuitslag-tekst. Moeten de onderliggende bullets als aparte regels worden getoond?",
    "gekozenLezing": "Samengevoegd tot één regel met een spatie; de Mistral-regel staat eerst. Alternatief: elke onderliggende bullet als aparte regel.",
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
  }
  );
}

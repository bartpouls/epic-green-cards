// Datatests voor de casusreferentie (stuk S11): window.CASUSSEN[0].referentie (casussen/uwi-referentie.js).
// RAW = de volledige tekst van secties 4, 5 en 6 van casus-uwi.md, regel voor regel door een script gekopieerd (inclusief markdown, letter voor letter,
// zonder lege regels en zonder de scheidingsstreep ---). Een EIGEN parser ontleedt die regels. De data wordt nergens gebruikt om de verwachting te maken (niet circulair).
(function (g) {
  var G = "data-referentie";
  var T = g.Test;
  var RAW = {
    "E1": [
      "## 4. Episode 1 — level 1",
      "**Knoppen:**",
      "- repertoire klein (12 kaarten)",
      "- acties per beurt ruim",
      "- geen gebeurtenissen",
      "- richtlijn raadplegen kost niets",
      "### Patiëntkaart",
      "- **Mevrouw V., 72 jaar.** Eerste cystitis: pijnlijke en frequente mictie sinds 2 dagen, geen koorts, nitriettest positief.",
      "- **Medicatie:** lisinopril (hypertensie).",
      "- **Lab:** eGFR 42, recent.",
      "- **Geen risicogroep.** De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].",
      "- **Verborgen:** niets.",
      "### Repertoire",
      "G1, G2, O1, O2, V1, V2, V3, V4, V5, N1, N2, Ev1",
      "### Geldige routes",
      "| Route | Kern | Profiel |",
      "|---|---|---|",
      "| Afwachten | V1 + N1 + Ev1 | Terughoudend |",
      "| Uitgesteld recept | V2 (+ middel) + N1 + N2 + Ev1 | Gedeelde regie |",
      "| Nitrofurantoïne 5 dagen | V3 + N1 (+ N2, Ev1) | Direct behandelen, 1e keus |",
      "| Fosfomycine | V4 + N1 + N2 | Direct behandelen, 2e keus |",
      "| Trimethoprim 3 dagen | V5 + N1 | Direct behandelen, 3e keus |",
      "Bij trimethoprim 3 dagen is geen kaliumcontrole nodig. De NHG vraagt die alleen bij een 7-daagse kuur of bij profylaxe, en de KNMP-regel slaat aan bij een gebruiksduur van meer dan 6 dagen [NHG, KNMP].",
      "### Invarianten (poort)",
      "| Id | Altijd fout | Bron |",
      "|---|---|---|",
      "| I1 | Een route zonder N1 | NHG |",
      "| I3 | V1 zonder Ev1 | NHG |",
      "| I4 | Twee antibiotica tegelijk | [G] |",
      "**Volgorde vrij:** alle kaarten mogen in elke volgorde.",
      "### Score",
      "- **Duurzaamheid:** afwachten > uitgesteld recept > direct een antibioticum.",
      "- **Doelmatigheid:** O1 (kweek niet geïndiceerd) en O2 (geen indicatie) kosten punten.",
      "### Wat er zichtbaar wordt als een kaart ontbreekt",
      "- **Zonder N1:** \"Mevrouw weet niet wanneer ze moet bellen.\"",
      "- **V1 zonder Ev1:** \"Er is geen moment om alsnog te starten als de klachten aanhouden.\"",
      "### Feedback (scherp-Socratisch, zegt niet voor)",
      "| Trigger | Vraag |",
      "|---|---|",
      "| I1 | \"Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?\" |",
      "| I3 | \"Je wacht af. Tot wanneer, en wat gebeurt er dan?\" |",
      "| I4 | \"Wat lost het tweede middel op dat het eerste niet oplost?\" |",
      "| O1 gespeeld | \"Wat doe je bij welke uitslag anders?\" |",
      "| Profiel terughoudend | \"Je schreef niets voor. Bij welke patiënt zou dat niet mogen?\" |",
      "| Profiel direct behandelen | \"Het werkt. Was het nodig, en koos zíj ervoor?\" |"
    ],
    "E2": [
      "## 5. Episode 2 — level 2",
      "**Knoppen:**",
      "- repertoire groter, met afleiders (15 kaarten)",
      "- acties per beurt ruim",
      "- 1 gebeurtenis",
      "### Patiëntkaart",
      "- **Mevrouw V., 78 jaar** (6 jaar na episode 1). Tweede cystitis, geen koorts, nitriettest positief.",
      "- **Medicatie:** lisinopril; calcium/colecalciferol (afleider, bereidt episode 3 voor).",
      "- **Lab op de kaart:** laatst bekende eGFR 42, van 6 jaar geleden.",
      "- **Eerdere UWI:** episode 1, toen geen kweek gedaan.",
      "- **Verborgen achter G2:** eGFR 29 uit de jaarlijkse controle. Daarmee valt ze in de risicogroep: een antibioticum is nodig, met een kweek vóór de eerste dosis, en nitrofurantoïne valt af [NHG].",
      "### Repertoire",
      "Alles uit episode 1, plus V6, B1 en B2.",
      "### Gebeurtenis",
      "- **Kweekuitslag**, na de 4e gespeelde kaart (ongeveer dag 3). Alleen als O1 gespeeld is.",
      "  - E. coli, **resistent** voor trimethoprim en amoxicilline.",
      "  - **Gevoelig** voor nitrofurantoïne, fosfomycine, amoxicilline/clavulaanzuur en ciprofloxacine.",
      "  - De doorlooptijd van 2–4 dagen kwam via Mistral en is niet zelf gecheckt.",
      "- **Wat de patiënt laat zien, hangt af van de keuze:**",
      "  - Trimethoprim: klachten houden aan.",
      "  - Fosfomycine: klachten nemen af.",
      "### Geldige routes",
      "| Route | Kern | Profiel |",
      "|---|---|---|",
      "| Fosfomycine | G2 → O1 → V4 + N1 + N2 → na de uitslag niet wisselen | Kweekgestuurd, smal |",
      "| Trimethoprim 7 dagen | G2 → O1 → V5 + O2 (dag 2–4) + V6 (na dag 3) + N1 → na de uitslag B1 naar fosfomycine | Bijgestuurd |",
      "### Invarianten (poort; I1 en I4 blijven gelden)",
      "| Id | Altijd fout | Bron |",
      "|---|---|---|",
      "| I5 | Nitrofurantoïne bij eGFR < 30, ook als de kweek \"gevoelig\" zegt | NHG |",
      "| I6 | Een antibioticum starten zonder O1 vooraf, of afwachten (V1/V2) in de risicogroep | NHG |",
      "| I7 | Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3 | NHG, KNMP |",
      "| I8 | Bij aanhoudende klachten doorgaan met een middel waarvoor de bacterie resistent is | NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten |",
      "**Volgorde:**",
      "- O1 vóór de eerste antibioticumkaart.",
      "- O2 ná V5.",
      "- De rest is vrij.",
      "### Score",
      "- **Duurzaamheid:** wisselen terwijl het middel werkt en de klachten afnemen, kost punten.",
      "- **Doelmatigheid:** G2 spelen vóór de voorschrijfkaart levert punten op.",
      "### Wat er zichtbaar wordt als een kaart ontbreekt",
      "- **Nitrofurantoïne zonder G2:** \"De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.\"",
      "- **V5 zonder O2:** \"De kaliumspiegel is onbekend.\"",
      "### Feedback",
      "| Trigger | Vraag |",
      "|---|---|",
      "| Verouderde eGFR niet opgemerkt | \"Hoe oud was de eGFR waarop je besloot? Wat is er sindsdien met haar gebeurd?\" |",
      "| I5 | \"Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?\" |",
      "| I6, geen kweek | \"Wat vertelt een kweek van urine die al antibioticum heeft gezien?\" |",
      "| I6, afwachten | \"Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?\" |",
      "| I7, geen kalium | \"Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?\" |",
      "| I7, niet gehalveerd | \"Dag 4. Hoeveel trimethoprim klaren haar nieren nog?\" |",
      "| I8 | \"De kweek is binnen en de klachten blijven. Waar wacht je nog op?\" |",
      "| Onnodig gewisseld | \"Het werkte en de klachten namen af. Wat won je met wisselen?\" |",
      "**Brug:** de kweek uit deze episode is het verborgen gegeven in episode 3 (G3)."
    ],
    "E3": [
      "## 6. Episode 3 — level 3",
      "**Knoppen:**",
      "- volledig repertoire (26 kaarten)",
      "- acties per beurt krap",
      "- 2 gebeurtenissen in vrije volgorde, plus de kweekuitslag",
      "### Patiëntkaart",
      "- **Mevrouw V., 79 jaar** (1 jaar na episode 2). Cystitis, geen koorts.",
      "- **Medicatie:** lisinopril, spironolacton (hypertensie), calcium/colecalciferol.",
      "  - Wie spironolacton heeft gestart en waarom, staat er bewust niet op. Het leerpunt: als de nierfunctie daalt, kijk je niet alleen naar wat je nu voorschrijft, maar naar alles wat de patiënt al gebruikt. In de praktijk wordt dat vaak gemist.",
      "- **Lab:** eGFR 28, recent. Risicogroep [NHG].",
      "- **Verborgen achter G3:** de kweek uit episode 2, met trimethoprim resistent. Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG].",
      "### Repertoire",
      "Alle kaarten uit de bibliotheek (G1–Ev3).",
      "### Gebeurtenissen",
      "| Id | Trigger | Inhoud |",
      "|---|---|---|",
      "| A | Na kaart *n* (engine-parameter); volgorde met B willekeurig | Weefselinvasie: koorts 38,6 °C en flankpijn |",
      "| B | Na kaart *m* (engine-parameter); volgorde met A willekeurig | Uitdroging: eet en drinkt slecht, twee dagen koorts. Daarmee is de SIDRIK-drempel gehaald (koorts ≥ 38,5 °C gedurende 2 dagen en/of braken of diarree > 3× per dag) [SIDRIK] |",
      "| C | 3 kaarten na O1 | Kweekuitslag. E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine en nitrofurantoïne. |",
      "De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler.",
      "### Geldige routes (kern)",
      "- **Start bij cystitis:** G3 → O1 → V4 (fosfomycine) + N1.",
      "  - Trimethoprim valt af door de eerdere kweek.",
      "  - Nitrofurantoïne valt af door de nierfunctie.",
      "- **Vanaf het begin:** O2 + Ev2 voor lisinopril + spironolacton (I9).",
      "- **Na A** (weefselinvasie):",
      "  - nieuwe kweek (O1)",
      "  - wisselen (B1) naar amoxicilline/clavulaanzuur met V6 naar 875/125 mg 2 dd, **of** naar ciprofloxacine met B4 (scheiden van calcium) of B3 (calcium tijdelijk stoppen)",
      "  - Ev1: contact binnen 48 uur",
      "- **Na B** (uitdroging):",
      "  - B3 spironolacton stoppen",
      "  - V6 lisinopril halveren",
      "  - N3 drinkadvies",
      "  - Ev1 monitoring binnen 1–3 dagen",
      "  - geen automatische herstart van spironolacton (Ev2)",
      "- **Na C** (kweekuitslag): wie ciprofloxacine koos, kan de-escaleren naar amoxicilline/clavulaanzuur.",
      "- **Rand van de kaart:** na 48 uur geen verbetering → Ev3 verwijzen.",
      "| Route bij weefselinvasie | Poort | Profiel |",
      "|---|---|---|",
      "| Amoxicilline/clavulaanzuur 875/125 mg 2 dd | Gehaald | Kweekgestuurd; scoort hoger. De keuze leunt op de eerdere kweek en vermijdt de risico's van ciprofloxacine bij ouderen [NHG]. |",
      "| Ciprofloxacine met calcium gescheiden of gestopt | Gehaald | Eerste keus volgens de richtlijn; eigen profiel |",
      "**Bronconflict, geen poort:** voor ciprofloxacine bij eGFR 10–30 geeft de NHG de normale keerdosis eenmaal per 24 uur [NHG]. Het Kompas past de dosis pas aan bij een klaring ≤ 15 [Kompas]. Beide zijn verdedigbaar; het wordt een feedbackmoment.",
      "### Invarianten (poort; I1, I4, I5, I6, I7 en I8 blijven gelden)",
      "| Id | Altijd fout | Geldt in | Bron |",
      "|---|---|---|---|",
      "| I9 | De combinatie lisinopril + spironolacton bij eGFR < 30 laten liggen (geen O2 én geen Ev2), of spironolacton na de sick day hervatten (B5) zonder eerst Ev2 | Alle toestanden van E3 | Bart; SIDRIK; herstart-nuance [G] |",
      "| I10 | Bij weefselinvasie doorgaan met nitrofurantoïne of fosfomycine: onvoldoende concentratie in het weefsel | Met A | NHG |",
      "| I11 | Bij weefselinvasie wisselen zonder eerst een nieuwe kweek | Met A | NHG |",
      "| I12 | Cotrimoxazol voorschrijven | Alle | NHG, Kompas |",
      "| I13 | Amoxicilline/clavulaanzuur zonder V6 naar 875/125 mg 2 dd | Alle | NHG |",
      "| I14 | Ciprofloxacine zonder B4 (scheiden van calcium) en zonder B3 (calcium tijdelijk stoppen) | Met ciprofloxacine | Kompas; B3-route [G] |",
      "| I15 | Na het halen van de sick day-drempel niet: spironolacton stoppen, lisinopril halveren, drinkadvies, monitoring binnen 1–3 dagen | Met B | SIDRIK |",
      "| I16 | Geen contact binnen 48 uur, of geen verwijzing als ze dan niet beter is | Met A | NHG |",
      "### Score",
      "- **Duurzaamheid:** de-escaleren van ciprofloxacine naar amoxicilline/clavulaanzuur na de kweek (C) levert punten op.",
      "- **Doelmatigheid:** G3 gebruiken vóór de eerste keuze levert punten op.",
      "### Wat er zichtbaar wordt als een kaart ontbreekt",
      "- **Geen sick day-maatregelen:** \"De nierfunctie daalt verder en het kalium stijgt.\" Zonder getallen, zoals ook de KNMP-regel geen getallen geeft.",
      "- **Ciprofloxacine zonder B4/B3:** \"Na 48 uur geen verbetering.\"",
      "- **I9 gemist:** \"Het kalium is onbekend, en niemand heeft naar spironolacton gekeken.\"",
      "### Feedback",
      "| Trigger | Vraag |",
      "|---|---|",
      "| I9 | \"Haar nierfunctie is 28. Welk van haar vaste middelen begon toen die nog hoger was, en wie kijkt daar nu naar?\" |",
      "| Automatische herstart | \"De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?\" |",
      "| I10 | \"Fosfomycine werkt in de blaas. Waar zit de infectie nu?\" |",
      "| I11 | \"Je wisselt. Waarop baseer je de wissel daarna?\" |",
      "| I12 | \"Cotrimoxazol naast spironolacton bij een eGFR van 28. Wat doet dat met haar kalium?\" |",
      "| I13 | \"Clavulaanzuur bij een eGFR van 28. Waar blijft het?\" |",
      "| I14 | \"Ze neemt elke ochtend calcium. Hoeveel van je ciprofloxacine komt in haar bloed?\" |",
      "| I15 | \"Ze drinkt nauwelijks en heeft twee dagen koorts. Wat doen lisinopril en spironolacton met een nier die al droog staat?\" |",
      "| I16 | \"Het is 48 uur later en ze is niet beter. Wat is je volgende kaart, en is die nog aan jou?\" |",
      "| Ciprofloxacine-dosis (bronconflict) | \"De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?\" |",
      "| Profiel ciprofloxacine | \"Eerste keus volgens de richtlijn. Gold die eerste keus ook voor déze patiënt?\" |"
    ]
  };
  // Volgorde van de sleutels per episode is vast (ref-9 test dat); TODO_BART* komen erachter.
  // (In de casus staat de gebeurtenissentabel van E3 vóór de alinea eronder, en de routes vóór de noot; ref-9 toetst dat ook tegen de casusvolgorde.)
  var SLEUTELS = ["episodeKop", "labels", "knoppen", "patientkaart", "repertoireTekst", "gebeurtenissenTabel", "gebeurtenisUitleg", "geldigeRoutes", "geldigeRoutesNoot", "routeBijWeefselinvasie", "bronconflict",
    "altijdFout", "volgorde", "score", "zichtbaarAlsOntbreekt", "feedbackTabel", "brug", "tabelkoppen", "inspringing", "volgordeVanSecties"];
  // Sleutel(s) per casuskopje, om de volgorde van de sleutels met de volgorde van de casus te vergelijken.
  var KOPSLEUTELS = [["Knoppen", ["knoppen"]], ["Patiëntkaart", ["patientkaart"]], ["Repertoire", ["repertoireTekst"]], ["Gebeurtenis", ["gebeurtenissenTabel", "gebeurtenisUitleg"]],
    ["Geldige routes", ["geldigeRoutes", "geldigeRoutesNoot"]], ["Route bij weefselinvasie", ["routeBijWeefselinvasie"]], ["Bronconflict", ["bronconflict"]], ["Invarianten", ["altijdFout"]],
    ["Volgorde", ["volgorde"]], ["Score", ["score"]], ["Wat er zichtbaar", ["zichtbaarAlsOntbreekt"]], ["Feedback", ["feedbackTabel"]], ["Brug", ["brug"]]];
  // Waar staat elk kopje van de casus in de referentie? (kopje (begin van de naam) -> sleutels die de tekst ervan dragen)
  var KOPJES = [
    ["Knoppen", ["knoppen", "labels", "volgordeVanSecties"]],
    ["Patiëntkaart", ["patientkaart", "volgordeVanSecties"]],
    ["Repertoire", ["repertoireTekst", "volgordeVanSecties"]],
    ["Gebeurtenis", ["gebeurtenisUitleg", "gebeurtenissenTabel", "tabelkoppen", "volgordeVanSecties"]],
    ["Geldige routes", ["geldigeRoutes", "geldigeRoutesNoot", "tabelkoppen", "volgordeVanSecties"]],
    ["Route bij weefselinvasie", ["routeBijWeefselinvasie", "tabelkoppen", "volgordeVanSecties"]],
    ["Bronconflict", ["bronconflict", "volgordeVanSecties"]],
    ["Invarianten", ["altijdFout", "tabelkoppen", "volgordeVanSecties"]],
    ["Volgorde", ["volgorde", "labels", "volgordeVanSecties"]],
    ["Score", ["score", "volgordeVanSecties"]],
    ["Wat er zichtbaar", ["zichtbaarAlsOntbreekt", "volgordeVanSecties"]],
    ["Feedback", ["feedbackTabel", "tabelkoppen", "volgordeVanSecties"]],
    ["Brug", ["brug", "volgordeVanSecties"]]
  ];
  var TODO_PINS = { E1: ["TODO_BART_geldigeRoutesNoot", "TODO_BART_overigeCasusregels", "TODO_BART_volgordeVanSecties"],
    E2: ["TODO_BART_gebeurtenisUitleg", "TODO_BART_overigeCasusregels", "TODO_BART_volgordeVanSecties"],
    E3: ["TODO_BART_gebeurtenisUitleg", "TODO_BART_gebeurtenissenTabel", "TODO_BART_geldigeRoutes", "TODO_BART_overigeCasusregels", "TODO_BART_volgordeVanSecties"] };
  var PLEKKEN = { "TODO_BART-R1": "referentie.E1/E2/E3.volgordeVanSecties", "TODO_BART-R2": "referentie.E1.geldigeRoutesNoot", "TODO_BART-R3": "referentie.E2.gebeurtenisUitleg",
    "TODO_BART-R4": "referentie.E3.gebeurtenisUitleg", "TODO_BART-R5": "referentie.E3.geldigeRoutes", "TODO_BART-R6": "referentie.E3.gebeurtenissenTabel",
    "TODO_BART-R7": "referentie.E1/E2/E3.patientkaart, repertoireTekst, zichtbaarAlsOntbreekt, feedbackTabel, tabelkoppen, episodeKop, labels" };
  var TODO_IDS = ["TODO_BART-R1", "TODO_BART-R2", "TODO_BART-R3", "TODO_BART-R4", "TODO_BART-R5", "TODO_BART-R6", "TODO_BART-R7"];
  var EPS = ["E1", "E2", "E3"];

  function casus() { var c = g.CASUSSEN && g.CASUSSEN[0]; if (!c) throw new Error("casussen/uwi.js ontbreekt: window.CASUSSEN[0] bestaat niet."); return c; }
  function ref() { var r = casus().referentie; if (!r) throw new Error("casussen/uwi-referentie.js ontbreekt of is niet geladen na uwi.js: CASUSSEN[0].referentie bestaat niet."); return r; }

  // ---- eigen parser voor de ruwe casusregels ----
  function schoon(s) { return s.split("**").join("").trim(); }
  function isSep(l) { return /^\|[-| ]+\|$/.test(l); }
  function cellen(l) { var d = l.split("|"); return d.slice(1, d.length - 1).map(schoon); }
  function isLabelRegel(l) { return /^\*\*(Volgorde vrij|Brug|Bronconflict, geen poort):\*\*/.test(l); }
  function labelVan(l) { var e = l.indexOf("**", 2); var lab = l.slice(2, e).trim(); return lab.charAt(lab.length - 1) === ":" ? lab.slice(0, lab.length - 1) : lab; }
  // Delen van een episode: [{ naam, regels }] in volgorde; regels van een kopregel zelf zitten er niet in (behalve label-regels met tekst en de tabelkop 'Route bij weefselinvasie').
  function delen(lijst) {
    var uit = [], cur = null;
    lijst.forEach(function (l) {
      if (l.indexOf("## ") === 0) return;
      if (l.indexOf("### ") === 0) { cur = { naam: l.slice(4).trim(), regels: [] }; uit.push(cur); return; }
      if (/^\*\*[^*]+:\*\*$/.test(l)) { cur = { naam: labelVan(l), label: schoon(l), regels: [] }; uit.push(cur); return; }
      if (isLabelRegel(l)) { cur = { naam: labelVan(l), regels: [l] }; uit.push(cur); return; }
      if (l.charAt(0) === "|" && cellen(l)[0] === "Route bij weefselinvasie") { cur = { naam: "Route bij weefselinvasie", regels: [l] }; uit.push(cur); return; }
      cur.regels.push(l);
    });
    return uit;
  }
  function deel(d, begin) { return d.filter(function (x) { return x.naam.indexOf(begin) === 0; })[0] || null; }
  function bul(regels) { return regels.filter(function (l) { return l.indexOf("- ") === 0 || l.indexOf("  - ") === 0; }).map(function (l) { return schoon(l.replace(/^ *- /, "")); }); }
  function niv(regels) { return regels.filter(function (l) { return l.indexOf("- ") === 0 || l.indexOf("  - ") === 0; }).map(function (l) { return l.indexOf("  - ") === 0 ? 1 : 0; }); }
  function tabelRijen(regels) { return regels.filter(function (l) { return l.charAt(0) === "|" && !isSep(l); }).map(cellen); }
  function kop(lijst) { return schoon(lijst[0].slice(3)); }

  function verwachtEpisode(e) {
    var lijst = RAW[e], d = delen(lijst), o = {};
    var geld = deel(d, "Geldige routes"), geb = deel(d, "Gebeurtenis"), weef = deel(d, "Route bij weefselinvasie"), inv = deel(d, "Invarianten"), vo = deel(d, "Volgorde"), br = deel(d, "Brug"), bc = deel(d, "Bronconflict");
    var fb = tabelRijen(deel(d, "Feedback").regels), pk = deel(d, "Patiëntkaart").regels;
    o.episodeKop = kop(lijst);
    o.labels = { knoppen: deel(d, "Knoppen").label, volgorde: vo ? (vo.label || schoon(vo.regels[0]).split(":")[0] + ":") : null };
    o.knoppen = bul(deel(d, "Knoppen").regels);
    o.patientkaart = bul(pk);
    o.repertoireTekst = deel(d, "Repertoire").regels.map(schoon).join(" ");
    var gebRegels = geb ? geb.regels : [];
    o.gebeurtenisUitleg = geb ? (bul(gebRegels).length ? bul(gebRegels) : gebRegels.filter(function (l) { return l.charAt(0) !== "|"; }).map(schoon)) : [];
    var gebTab = geb ? tabelRijen(gebRegels) : [];
    o.gebeurtenissenTabel = gebTab.length ? gebTab.slice(1).map(function (c) { return { id: c[0], trigger: c[1], inhoud: c[2] }; }) : null;
    var gr = geld.regels;
    if (bul(gr).length) {
      var rs = [];
      gr.forEach(function (l) {
        if (l.indexOf("  - ") === 0) rs[rs.length - 1].kern.push(schoon(l.slice(4)));
        else if (l.indexOf("- ") === 0) rs.push({ route: schoon(l.slice(2)), kern: [], profiel: null });
      });
      o.geldigeRoutes = rs;
    } else {
      o.geldigeRoutes = tabelRijen(gr).slice(1).map(function (c) { return { route: c[0], kern: c[1], profiel: c[2] }; });
    }
    var nootRegels = gr.filter(function (l) { return l.charAt(0) !== "|" && l.indexOf("- ") !== 0 && l.indexOf("  - ") !== 0; });
    o.geldigeRoutesNoot = nootRegels.length ? schoon(nootRegels[0]) : null;
    o.routeBijWeefselinvasie = weef ? tabelRijen(weef.regels).slice(1).map(function (c) { return { route: c[0], poort: c[1], profiel: c[2] }; }) : null;
    o.bronconflict = bc ? schoon(bc.regels[0]) : null;
    var it = tabelRijen(inv.regels), drie = it[0].length === 4;
    o.altijdFout = {};
    it.slice(1).forEach(function (c) { o.altijdFout[c[0]] = drie ? { tekst: c[1], geldtIn: c[2], bron: c[3] } : { tekst: c[1], bron: c[2] }; });
    o.volgorde = vo ? (vo.regels.length && isLabelRegel(vo.regels[0]) ? [schoon(vo.regels[0])] : bul(vo.regels)) : null;
    o.score = bul(deel(d, "Score").regels);
    o.zichtbaarAlsOntbreekt = bul(deel(d, "Wat er zichtbaar").regels);
    o.feedbackTabel = fb.slice(1).map(function (c) { return { trigger: c[0], vraag: c[1] }; });
    o.brug = br ? schoon(br.regels[0]) : null;
    o.tabelkoppen = {
      geldigeRoutes: bul(gr).length ? null : tabelRijen(gr)[0],
      gebeurtenissen: gebTab.length ? gebTab[0] : null,
      routeBijWeefselinvasie: weef ? tabelRijen(weef.regels)[0] : null,
      altijdFout: it[0],
      feedback: fb[0]
    };
    o.inspringing = { patientkaart: niv(pk), gebeurtenisUitleg: geb ? (bul(gebRegels).length ? niv(gebRegels) : o.gebeurtenisUitleg.map(function () { return 0; })) : [] };
    o.volgordeVanSecties = d.map(function (x) { return x.naam; });
    return o;
  }
  function verwacht() { var v = {}; EPS.forEach(function (e) { v[e] = verwachtEpisode(e); }); return v; }

  // Alle losse tekstdelen (atomen) van een episode in de casus: koppen, labels, cellen, bullets, alinea's.
  function atomen(e) {
    var s = {};
    RAW[e].forEach(function (l) {
      if (isSep(l)) return;
      if (l.indexOf("## ") === 0) s[schoon(l.slice(3))] = 1;
      else if (l.indexOf("### ") === 0) s[l.slice(4).trim()] = 1;
      else if (/^\*\*[^*]+:\*\*$/.test(l)) { s[labelVan(l)] = 1; s[schoon(l)] = 1; }
      else if (l.charAt(0) === "|") cellen(l).forEach(function (c) { s[c] = 1; });
      else if (l.indexOf("- ") === 0 || l.indexOf("  - ") === 0) s[schoon(l.replace(/^ *- /, ""))] = 1;
      else { s[schoon(l)] = 1; if (isLabelRegel(l)) { s[labelVan(l)] = 1; if (/^\*\*Volgorde vrij:\*\*/.test(l)) s[labelVan(l) + ":"] = 1; } }
    });
    return Object.keys(s);
  }

  // ---- hulpfuncties ----
  // canon: volgorde van arrays EN van objectsleutels telt mee (de volgorde van de sleutels op episodeniveau toetst afwijkingen() apart).
  function canon(x, diepte) {
    if (Array.isArray(x)) return "[" + x.map(function (v) { return canon(v, diepte + 1); }).join(",") + "]";
    if (x && typeof x === "object") {
      var ks = Object.keys(x);
      return "{" + ks.map(function (k) { return JSON.stringify(k) + ":" + canon(x[k], diepte + 1); }).join(",") + "}";
    }
    return JSON.stringify(x);
  }
  function c0(x) { return canon(x, 0); }
  function zonderTodo(ep) { var o = {}; Object.keys(ep).forEach(function (k) { if (k.indexOf("TODO_BART") !== 0) o[k] = ep[k]; }); return o; }
  function klaar(r) { var o = {}; EPS.forEach(function (e) { if (r[e]) o[e] = zonderTodo(r[e]); }); return o; }
  function kloon(x) { return JSON.parse(JSON.stringify(x)); }
  function alleStrings(x, uit, pad) {
    if (typeof x === "string") uit.push({ pad: pad, s: x });
    else if (Array.isArray(x)) x.forEach(function (v, i) { alleStrings(v, uit, pad + "[" + i + "]"); });
    else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { alleStrings(x[k], uit, pad + "." + k); });
    return uit;
  }
  function stringsVan(x) {
    var uit = alleStrings(x, [], "").map(function (z) { return z.s; });
    // De Id's van de invarianten zijn de sleutels van altijdFout: ook dat zijn casusteksten (kolom Id).
    if (x && x.altijdFout && typeof x.altijdFout === "object") uit = uit.concat(Object.keys(x.altijdFout));
    return uit;
  }
  function uniek(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  // Vergelijkt de referentie (zonder TODO_BART*-sleutels) met de verwachting uit de casus; geeft een lijst afwijkingen.
  function afwijkingen(data) {
    var v = verwacht(), uit = [];
    var kd = Object.keys(data).join(",");
    if (kd !== "E1,E2,E3") uit.push("sleutels op topniveau: " + kd);
    EPS.forEach(function (e) {
      var d = data[e];
      if (!d || typeof d !== "object") { uit.push(e + " ontbreekt"); return; }
      var ks = Object.keys(d).sort().join(","), vs = SLEUTELS.slice().sort().join(",");
      if (ks !== vs) uit.push(e + ": sleutels " + ks + " i.p.v. " + vs);
      else if (Object.keys(d).join(",") !== SLEUTELS.join(",")) uit.push(e + ": sleutels staan niet in de vaste volgorde (casusvolgorde)");
      SLEUTELS.forEach(function (s) { if (c0(d[s]) !== c0(v[e][s])) uit.push(e + "." + s + " wijkt af"); });
      // Elke tekst in de referentie is een tekstdeel van de casus en elk tekstdeel van de casus staat erin (verzameling, beide richtingen).
      var a = atomen(e).sort().join("\u0001"), b = uniek(stringsVan(d)).sort().join("\u0001");
      if (a !== b) uit.push(e + ": tekstdelen wijken af van de casus");
    });
    return uit;
  }

  T.registreer(G, "ref-0 referentie is zuivere data: JSON-roundtrip identiek, geen functies, exacte topsleutels E1/E2/E3", function () {
    var r = ref();
    T.gelijk(JSON.parse(JSON.stringify(r)), r);
    T.is(Object.keys(r).sort().join(","), "E1,E2,E3");
  });
  T.registreer(G, "ref-1 exacte sleutelwhitelist per episode (alle contractsleutels aanwezig, niets extra buiten TODO_BART*)", function () {
    var r = ref();
    EPS.forEach(function (e) {
      var ks = Object.keys(r[e]).filter(function (k) { return k.indexOf("TODO_BART") !== 0; }).sort();
      T.gelijk(ks, SLEUTELS.slice().sort(), e + " sleutels");
      var tk = Object.keys(r[e]).filter(function (k) { return k.indexOf("TODO_BART") === 0; }).sort();
      T.gelijk(tk, TODO_PINS[e].slice().sort(), e + " TODO_BART-sleutels op de plek zelf");
    });
    ["E1", "E2"].forEach(function (e) { T.is(r[e].routeBijWeefselinvasie, null, e + ".routeBijWeefselinvasie"); T.is(r[e].gebeurtenissenTabel === null || e === "E3", true, e + ".gebeurtenissenTabel"); });
    T.is(r.E3.volgorde, null); T.is(r.E1.brug, null); T.is(r.E3.brug, null); T.is(r.E1.bronconflict, null); T.is(r.E2.bronconflict, null);
    T.gelijk(r.E1.gebeurtenisUitleg, []); T.is(r.E1.gebeurtenissenTabel, null); T.is(r.E2.gebeurtenissenTabel, null);
  });
  T.registreer(G, "ref-2 alle onderdelen teken voor teken gelijk aan casus-uwi.md (eigen parser op ingebedde casusregels)", function () {
    var a = afwijkingen(klaar(ref()));
    T.is(a.length, 0, "afwijkingen: " + a.join("; "));
  });
  EPS.forEach(function (e) {
    SLEUTELS.forEach(function (s) {
      T.registreer(G, "ref-3 " + e + "." + s + " gelijk aan de casus", function () {
        var v = verwacht()[e][s], d = ref()[e][s];
        T.is(c0(d), c0(v), e + "." + s + ": verwacht " + JSON.stringify(v) + ", kreeg " + JSON.stringify(d));
      });
    });
  });
  T.registreer(G, "ref-4 aantallen: alle tabelrijen en bullets uit de casus aanwezig", function () {
    var r = ref();
    T.is(r.E1.knoppen.length, 4); T.is(r.E1.geldigeRoutes.length, 5); T.is(Object.keys(r.E1.altijdFout).length, 3); T.is(r.E1.score.length, 2); T.is(r.E1.volgorde.length, 1);
    T.is(r.E1.patientkaart.length, 5); T.is(r.E1.zichtbaarAlsOntbreekt.length, 2); T.is(r.E1.feedbackTabel.length, 6);
    T.is(r.E2.knoppen.length, 3); T.is(r.E2.geldigeRoutes.length, 2); T.is(Object.keys(r.E2.altijdFout).length, 4); T.is(r.E2.volgorde.length, 3); T.is(r.E2.score.length, 2);
    T.is(r.E2.patientkaart.length, 5); T.is(r.E2.gebeurtenisUitleg.length, 7); T.is(r.E2.zichtbaarAlsOntbreekt.length, 2); T.is(r.E2.feedbackTabel.length, 8);
    T.is(r.E3.knoppen.length, 3); T.is(r.E3.geldigeRoutes.length, 6); T.is(r.E3.routeBijWeefselinvasie.length, 2); T.is(Object.keys(r.E3.altijdFout).length, 8); T.is(r.E3.score.length, 2);
    T.is(r.E3.patientkaart.length, 5); T.is(r.E3.gebeurtenissenTabel.length, 3); T.is(r.E3.gebeurtenisUitleg.length, 1); T.is(r.E3.zichtbaarAlsOntbreekt.length, 3); T.is(r.E3.feedbackTabel.length, 11);
    T.gelijk(Object.keys(r.E3.altijdFout), ["I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"]);
    T.is(r.E1.volgordeVanSecties.length, 9); T.is(r.E2.volgordeVanSecties.length, 11); T.is(r.E3.volgordeVanSecties.length, 11);
  });
  T.registreer(G, "ref-5 geen markdown-vetdruk (**), geen lege of ongetrimde strings, alleen strings/arrays/objecten/getallen/null", function () {
    var s = alleStrings(ref(), [], "referentie");
    T.waar(s.length > 200, "te weinig strings: " + s.length);
    s.forEach(function (x) {
      T.waar(x.s.indexOf("**") === -1, x.pad + " bevat **");
      T.waar(x.s.length > 0 && x.s === x.s.trim(), x.pad + " is leeg of niet getrimd");
    });
  });
  T.registreer(G, "ref-6 casus.todoBart bevat de referentie-TODO's, zelfstandig leesbaar voor Bart, en elke plek-sleutel verwijst ernaar", function () {
    var c = casus(), r = ref();
    var lijst = (c.todoBart || []).filter(function (t) { return TODO_IDS.indexOf(t.id) !== -1; });
    T.gelijk(lijst.map(function (t) { return t.id; }).sort(), TODO_IDS.slice().sort());
    lijst.forEach(function (t) {
      T.gelijk(Object.keys(t).sort(), ["gekozenLezing", "id", "plek", "vraag"], t.id + " sleutels");
      ["vraag", "gekozenLezing", "plek"].forEach(function (k) {
        T.waar(typeof t[k] === "string" && t[k].length > 40 || k === "plek" && t[k].length > 5, t.id + "." + k + " te kort");
        T.waar(!/contract|rapport|ronde|stuk|S11|gauntlet|criticus|bouwer|lead/i.test(t[k]), t.id + "." + k + " verwijst naar proces in plaats van de casus");
      });
      T.is(t.plek, PLEKKEN[t.id], t.id + ".plek");
    });
    var perPlek = {
      "TODO_BART-R1": EPS.map(function (e) { return r[e].TODO_BART_volgordeVanSecties; }),
      "TODO_BART-R2": [r.E1.TODO_BART_geldigeRoutesNoot],
      "TODO_BART-R3": [r.E2.TODO_BART_gebeurtenisUitleg],
      "TODO_BART-R4": [r.E3.TODO_BART_gebeurtenisUitleg],
      "TODO_BART-R5": [r.E3.TODO_BART_geldigeRoutes],
      "TODO_BART-R6": [r.E3.TODO_BART_gebeurtenissenTabel],
      "TODO_BART-R7": EPS.map(function (e) { return r[e].TODO_BART_overigeCasusregels; })
    };
    lijst.forEach(function (t) { perPlek[t.id].forEach(function (x) { T.is(x, t.vraag, t.id + ": tekst op de plek zelf ongelijk aan casus.todoBart"); }); });
    var ids = (c.todoBart || []).map(function (t) { return t.id; });
    T.is(ids.length, ids.filter(function (x, i) { return ids.indexOf(x) === i; }).length, "dubbele TODO_BART-id's");
  });
  T.registreer(G, "ref-8 elk kopje van secties 4, 5 en 6 staat volledig in de referentie, op de aangewezen plek (kopje voor kopje)", function () {
    var r = ref();
    EPS.forEach(function (e) {
      var d = delen(RAW[e]);
      d.forEach(function (x) {
        var plek = KOPJES.filter(function (k) { return x.naam.indexOf(k[0]) === 0; })[0];
        T.waar(!!plek, e + ": kopje '" + x.naam + "' heeft geen plek in KOPJES");
        var drager = {};
        plek[1].forEach(function (s) { drager[s] = r[e][s]; });
        var strs = stringsVan(drager);
        var delen_ = {};
        x.regels.forEach(function (l) {
          if (isSep(l)) return;
          if (l.charAt(0) === "|") cellen(l).forEach(function (c) { delen_[c] = 1; });
          else delen_[schoon(l.replace(/^ *- /, ""))] = 1;
        });
        delen_[x.naam] = 1;
        if (x.label) delen_[x.label] = 1;
        Object.keys(delen_).forEach(function (t) { T.waar(strs.indexOf(t) !== -1, e + " kopje '" + x.naam + "': tekst ontbreekt in " + plek[1].join("/") + ": " + JSON.stringify(t)); });
      });
    });
  });
  T.registreer(G, "ref-9 volgorde van sleutels: altijdFout in casusvolgorde (Id's en velden), rijsleutels, tabelkoppen, inspringing", function () {
    var r = ref();
    T.gelijk(Object.keys(r.E1.altijdFout), ["I1", "I3", "I4"], "E1 altijdFout");
    T.gelijk(Object.keys(r.E2.altijdFout), ["I5", "I6", "I7", "I8"], "E2 altijdFout");
    T.gelijk(Object.keys(r.E3.altijdFout), ["I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"], "E3 altijdFout");
    EPS.forEach(function (e) {
      Object.keys(r[e].altijdFout).forEach(function (id) {
        T.gelijk(Object.keys(r[e].altijdFout[id]), e === "E3" ? ["tekst", "geldtIn", "bron"] : ["tekst", "bron"], e + " " + id + " velden");
      });
      r[e].geldigeRoutes.forEach(function (x, i) { T.gelijk(Object.keys(x), ["route", "kern", "profiel"], e + " route " + i); });
      r[e].feedbackTabel.forEach(function (x, i) { T.gelijk(Object.keys(x), ["trigger", "vraag"], e + " feedbackrij " + i); });
      T.gelijk(Object.keys(r[e].tabelkoppen), ["geldigeRoutes", "gebeurtenissen", "routeBijWeefselinvasie", "altijdFout", "feedback"], e + " tabelkoppen");
      T.gelijk(Object.keys(r[e].inspringing), ["patientkaart", "gebeurtenisUitleg"], e + " inspringing");
      T.is(r[e].inspringing.patientkaart.length, r[e].patientkaart.length, e + " inspringing patientkaart");
      T.is(r[e].inspringing.gebeurtenisUitleg.length, r[e].gebeurtenisUitleg.length, e + " inspringing gebeurtenisUitleg");
      (r[e].routeBijWeefselinvasie || []).forEach(function (x, i) { T.gelijk(Object.keys(x), ["route", "poort", "profiel"], e + " weefselrij " + i); });
      (r[e].gebeurtenissenTabel || []).forEach(function (x, i) { T.gelijk(Object.keys(x), ["id", "trigger", "inhoud"], e + " gebeurtenisrij " + i); });
    });
    T.gelijk(Object.keys(r), ["E1", "E2", "E3"], "volgorde episodes");
    EPS.forEach(function (e) {
      var alle = Object.keys(r[e]), echt = alle.filter(function (k) { return k.indexOf("TODO_BART") !== 0; });
      T.gelijk(echt, SLEUTELS, e + " volgorde van de sleutels");
      T.gelijk(alle.slice(0, echt.length), echt, e + ": TODO_BART-sleutels staan achter de gewone sleutels");
      // Volgorde van de sleutels = volgorde van de kopjes in de casus (alleen de kopjes die in deze episode voorkomen).
      var vanCasus = [];
      delen(RAW[e]).forEach(function (x) { var k = KOPSLEUTELS.filter(function (z) { return x.naam.indexOf(z[0]) === 0; })[0]; T.waar(!!k, e + " kopje zonder sleutel: " + x.naam); k[1].forEach(function (s) { vanCasus.push(s); }); });
      var inData = echt.filter(function (k) { return vanCasus.indexOf(k) !== -1; });
      T.gelijk(inData, vanCasus.filter(function (k) { return inData.indexOf(k) !== -1; }), e + ": volgorde van de sleutels wijkt af van de volgorde van de kopjes in de casus");
      T.gelijk(Object.keys(r[e].labels), ["knoppen", "volgorde"], e + " labels");
    });
    T.gelijk(r.E3.gebeurtenissenTabel.map(function (x) { return x.id; }), ["A", "B", "C"]);
    // De Id-volgorde komt uit de ingebedde casusregels, niet uit een vaste lijst.
    EPS.forEach(function (e) { T.gelijk(Object.keys(r[e].altijdFout), tabelRijen(deel(delen(RAW[e]), "Invarianten").regels).slice(1).map(function (c) { return c[0]; }), e + " Id-volgorde uit de casus"); });
  });
  T.registreer(G, "ref-7 mutatietest: elke wijziging aan de referentie wordt door de vergelijking gevonden (>= 400 mutaties)", function () {
    var basis = klaar(ref());
    T.is(afwijkingen(basis).length, 0, "basis moet groen zijn");
    var n = 0, gemist = [];
    function toets(naam, m) { n++; if (afwijkingen(m).length === 0) gemist.push(naam); }
    function paden(x, p, uit) {
      uit.push(p);
      if (Array.isArray(x)) x.forEach(function (v, i) { paden(v, p.concat([i]), uit); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { paden(x[k], p.concat([k]), uit); });
      return uit;
    }
    function bij(root, p) { var o = root; for (var i = 0; i < p.length; i++) o = o[p[i]]; return o; }
    paden(basis, [], []).forEach(function (p) {
      if (!p.length) return;
      var oud = bij(basis, p), naam = p.join(".");
      var ouder = p.slice(0, p.length - 1), sl = p[p.length - 1];
      function met(fn, label) { var m = kloon(basis), o = bij(m, ouder); fn(o, sl); toets(label + " " + naam, m); }
      if (typeof oud === "string") {
        met(function (o, k) { o[k] = oud + "x"; }, "toevoeging");
        met(function (o, k) { o[k] = oud.slice(0, -1); }, "afkappen");
        met(function (o, k) { var c = oud.charAt(0), w = c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(); if (w === c) w = "Z"; o[k] = w + oud.slice(1); }, "eerste teken");
        met(function (o, k) { o[k] = "**" + oud + "**"; }, "markdown");
        met(function (o, k) { o[k] = oud + " " + oud; }, "verdubbeld");
        met(function (o, k) { o[k] = [oud]; }, "string naar array");
        if (oud.indexOf(" ") !== -1) met(function (o, k) { o[k] = oud.replace(" ", "  "); }, "dubbele spatie");
        if (oud.indexOf("–") !== -1) met(function (o, k) { o[k] = oud.split("–").join("-"); }, "en-streepje");
        if (oud.indexOf("*") !== -1) met(function (o, k) { o[k] = oud.split("*").join(""); }, "sterretje weg");
        if (/[éëïóöüá]/.test(oud)) met(function (o, k) { o[k] = oud.replace(/[éë]/g, "e").replace(/ï/g, "i").replace(/[óö]/g, "o").replace(/ü/g, "u").replace(/á/g, "a"); }, "accent weg");
      }
      if (typeof oud === "number") met(function (o, k) { o[k] = oud === 0 ? 1 : 0; }, "getal omgezet");
      if (Array.isArray(oud)) { met(function (o, k) { o[k] = oud.join(" "); }, "array naar string"); met(function (o, k) { o[k] = null; }, "array naar null"); if (c0(oud.slice().reverse()) !== c0(oud)) met(function (o, k) { o[k].reverse(); }, "array omgekeerd"); }
      if (typeof sl === "number") {
        met(function (o, k) { o.splice(k, 1); }, "verwijder element");
        met(function (o, k) { o.splice(k, 0, kloon(o[k])); }, "dupliceer element");
        if (sl + 1 < bij(basis, ouder).length && c0(bij(basis, ouder)[sl]) !== c0(bij(basis, ouder)[sl + 1])) met(function (o, k) { var t = o[k]; o[k] = o[k + 1]; o[k + 1] = t; }, "wissel volgorde");
      } else if (ouder.length >= 1) {
        met(function (o, k) { delete o[k]; }, "verwijder sleutel");
      }
      if (oud === null) { met(function (o, k) { o[k] = ""; }, "null naar tekst"); met(function (o, k) { o[k] = []; }, "null naar array"); }
      // objectsleutels in een andere volgorde (niet op episodeniveau: daar is de volgorde betekenisloos)
      if (oud && typeof oud === "object" && !Array.isArray(oud) && p.length >= 2 && Object.keys(oud).length > 1) {
        met(function (o, k) { var ks = Object.keys(o[k]).reverse(), nieuw = {}; ks.forEach(function (x) { nieuw[x] = o[k][x]; }); o[k] = nieuw; }, "sleutelvolgorde omgekeerd");
        met(function (o, k) { var ks = Object.keys(o[k]), eerste = ks.shift(), nieuw = {}; ks.concat([eerste]).forEach(function (x) { nieuw[x] = o[k][x]; }); o[k] = nieuw; }, "sleutelvolgorde geroteerd");
      }
    });
    var m1 = kloon(basis); m1.E1.extra = "x"; toets("extra sleutel", m1);
    var m2 = kloon(basis); delete m2.E3; toets("episode weg", m2);
    var m3 = kloon(basis); m3.E4 = {}; toets("extra episode", m3);
    var m4 = kloon(basis); m4.E2.volgorde = null; toets("volgorde null", m4);
    var m5 = kloon(basis); m5.E3.volgorde = []; toets("volgorde leeg", m5);
    var m6 = kloon(basis); m6.E1.knoppen = m6.E2.knoppen; toets("kruiskopie knoppen", m6);
    var m7 = kloon(basis); m7.E3.gebeurtenisUitleg = m7.E2.gebeurtenisUitleg; toets("kruiskopie gebeurtenisUitleg", m7);
    var m8 = kloon(basis); m8.E2.repertoireTekst = m8.E3.repertoireTekst; toets("kruiskopie repertoireTekst", m8);
    var m9 = kloon(basis); m9.E1.altijdFout = m9.E2.altijdFout; toets("kruiskopie altijdFout", m9);
    // Volgorde van de sleutels op topniveau en op episodeniveau (de casus kent een vaste kopjesvolgorde)
    function herorden(o, perm) { var ks = perm(Object.keys(o)), nieuw = {}; ks.forEach(function (x) { nieuw[x] = o[x]; }); return nieuw; }
    var perms = { omgekeerd: function (k) { return k.reverse(); }, geroteerd: function (k) { k.push(k.shift()); return k; }, "eerste twee gewisseld": function (k) { var t = k[0]; k[0] = k[1]; k[1] = t; return k; },
      "laatste twee gewisseld": function (k) { var t = k[k.length - 1]; k[k.length - 1] = k[k.length - 2]; k[k.length - 2] = t; return k; } };
    Object.keys(perms).forEach(function (pn) {
      var m = kloon(basis); toets("topniveau sleutels " + pn, herorden(m, perms[pn]));
      EPS.forEach(function (e) { var m2 = kloon(basis); m2[e] = herorden(m2[e], perms[pn]); toets(e + " sleutels " + pn, m2); });
    });
    EPS.forEach(function (e) {
      var ks = Object.keys(basis[e]);
      for (var i = 0; i + 1 < ks.length; i++) { var m3 = kloon(basis); m3[e] = herorden(m3[e], function (k) { var t = k[i]; k[i] = k[i + 1]; k[i + 1] = t; return k; }); toets(e + " sleutel " + ks[i] + " en " + ks[i + 1] + " gewisseld", m3); }
    });
    T.waar(n >= 400, "te weinig mutaties: " + n);
    T.is(gemist.length, 0, "mutaties niet gevonden: " + gemist.slice(0, 8).join(" | "));
  });
})(typeof window !== "undefined" ? window : globalThis);

/* Routes voor de evaluatietests (stuk S6): routedefinities ALS DATA + een kleine speler die ze via window.Engine afspeelt.
   Alle verwachte uitkomsten (poort, schendingen, vraag, score, profiel, reflectievraag, extra vragen, zichtbaar-zinnen, downsides)
   zijn handmatig uit casus-uwi.md (en bouwopdracht 6.1/6.5) opgeschreven. Er wordt NIETS uit casussen/uwi*.js of uit
   Evaluatie.beoordeel afgeleid; de teksten hieronder zijn de casusteksten.

   Een plan is een lijst "stappen":
     "V4"                    kaart spelen            "V6>V5>halveren"  kaart > doel > optie
     "|"                     Engine.volgendeDag      "=7"              volgendeDag tot dag 7 (niets als dat al zo is)
   Gebeurtenissen A en B komen in E3 in een vaste volgorde per poging: sleutel "A,B" (A na de 4e, B na de 7e gespeelde kaart) of
   "B,A" (andersom). Daarom hebben E3-routes per volgorde een eigen plan: de banner verschijnt pas op de volgende dag, dus de
   dag-indeling (wat staat op welke dag) verschilt per volgorde. Plannen worden uit een basisplan + wijzigingen (pas) opgebouwd.

   Een route: { id, ep, naam, soort: "geldig"|"fout", plan | plannen: {"A,B", "B,A"}, verwacht, verwachtPer? }.
   verwacht: geschonden (lijst id's, op ernst), vraag, profiel (naam of null), reflectievraag, score {duurzaamheid, doelmatigheid},
   extraVragen (lijst teksten), zichtbaar (lijst teksten). Ontbrekende sleutels: geschonden/extraVragen/zichtbaar = leeg verwacht;
   profiel/reflectievraag/score = niet gecontroleerd (bij 'fout' altijd: geen score, geen profiel). */
(function (g) {
  "use strict";

  var VOLGORDES = [{ sleutel: "A,B", rng: 0 }, { sleutel: "B,A", rng: 0.99 }];

  /* ---------- casusteksten (letterlijk uit casus-uwi.md) ---------- */
  var VRAAG = {
    I1: "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",
    I3: "Je wacht af. Tot wanneer, en wat gebeurt er dan?",
    I4: "Wat lost het tweede middel op dat het eerste niet oplost?",
    I5: "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?",
    I6geenKweek: "Wat vertelt een kweek van urine die al antibioticum heeft gezien?",
    I6afwachten: "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?",
    I7kalium: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
    I7halveren: "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?",
    I8: "De kweek is binnen en de klachten blijven. Waar wacht je nog op?",
    I9: "Haar nierfunctie is 28. Welk van haar vaste middelen begon toen die nog hoger was, en wie kijkt daar nu naar?",
    I10: "Fosfomycine werkt in de blaas. Waar zit de infectie nu?",
    I11: "Je wisselt. Waarop baseer je de wissel daarna?",
    I12: "Cotrimoxazol naast spironolacton bij een eGFR van 28. Wat doet dat met haar kalium?",
    I13: "Clavulaanzuur bij een eGFR van 28. Waar blijft het?",
    I14: "Ze neemt elke ochtend calcium. Hoeveel van je ciprofloxacine komt in haar bloed?",
    I15: "Ze drinkt nauwelijks en heeft twee dagen koorts. Wat doen lisinopril en spironolacton met een nier die al droog staat?",
    I16: "Het is 48 uur later en ze is niet beter. Wat is je volgende kaart, en is die nog aan jou?"
  };
  var EXTRA = {
    O1: "Wat doe je bij welke uitslag anders?",
    eGFR: "Hoe oud was de eGFR waarop je besloot? Wat is er sindsdien met haar gebeurd?",
    gewisseld: "Het werkte en de klachten namen af. Wat won je met wisselen?",
    herstart: "De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?",
    cipro: "De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?"
  };
  var ZICHT = {
    N1: "Mevrouw weet niet wanneer ze moet bellen.",
    V1: "Er is geen moment om alsnog te starten als de klachten aanhouden.",
    V3: "De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.",
    V5: "De kaliumspiegel is onbekend.",
    sickday: "De nierfunctie daalt verder en het kalium stijgt.",
    cipro: "Na 48 uur geen verbetering.",
    I9: "Het kalium is onbekend, en niemand heeft naar spironolacton gekeken."
  };
  var REFLECTIE = {
    terughoudend: "Je schreef niets voor. Bij welke patiënt zou dat niet mogen?",
    direct: "Het werkt. Was het nodig, en koos zíj ervoor?",
    cipro: "Eerste keus volgens de richtlijn. Gold die eerste keus ook voor déze patiënt?"
  };
  // Downside per kaart (casus sectie 3). Een object geldt alleen voor de genoemde episodes ("E1: niet geïndiceerd ..."); geen sleutel = geen downside.
  var DOWNSIDE = {
    G1: "Kost een actie", G2: "Kost een actie", G3: "Kost een actie",
    O1: { E1: "niet geïndiceerd, kost doelmatigheid" },
    O2: "Alleen zinvol bij een indicatie; anders kost het doelmatigheid",
    V1: "Klachten duren langer; risico op pyelonefritis ongeveer 1,6% hoger",
    V2: "Ze moet weten wanneer ze moet starten",
    V3: "Vermijden bij eGFR < 30: stapeling met kans op neuropathie, en geen bactericide concentratie in de urine. Ongeschikt bij weefselinvasie. Maag-darmklachten [G].",
    V4: "Klachten zijn niet direct weg. Ongeschikt bij weefselinvasie.",
    V5: "Naast een RAS-remmer of kaliumsparend diureticum stijgt het kalium (controle nodig bij een 7-daagse kuur). Bij eGFR 10–30: na dag 3 halveren en kans op therapiefalen. Hoge resistentie bij E. coli.",
    V6: "Een verkeerde aanpassing geeft onder- of overdosering",
    V7: "Bij ouderen: kans op peesschade, QT-verlenging, aneurysma. Minder opname naast calcium. NHG: terughoudend bij ouderen en bij een nierfunctiestoornis.",
    V8: "Bij eGFR < 30 stapelt clavulaanzuur: dan alleen 875/125 mg 2 dd",
    V9: "Gecontra-indiceerd bij een ernstige nierfunctiestoornis. Met spironolacton kans op ernstige hyperkaliëmie.",
    V10: "De kweek laat resistentie zien: geen werking",
    B1: "Onnodig wisselen kost duurzaamheid", B2: "Te vroeg stoppen geeft therapiefalen", B3: "Vraagt een afspraak over herstart",
    B4: "Vraagt uitleg aan de patiënt", B5: "Hervatten zonder herbeoordeling kan dezelfde schade herhalen",
    N1: "—", N2: "—", N3: "—", Ev1: "—", Ev2: "Kost een actie", Ev3: "Onnodig verwijzen kost doelmatigheid"
  };

  /* ---------- verwachtingen opbouwen ---------- */
  function geldig(profiel, reflectievraag, dz, dm, o) {
    o = o || {};
    return {
      geschonden: [], vraag: null, profiel: profiel, reflectievraag: reflectievraag,
      score: { duurzaamheid: dz, doelmatigheid: dm }, extraVragen: o.extra || [], zichtbaar: o.zicht || []
    };
  }
  function fout(ids, vraag, zicht) { return { geschonden: ids, vraag: vraag, zichtbaar: zicht || [], extraVragen: [] }; }

  /* ---------- plannen opbouwen: basisplan + wijzigingen ---------- */
  // Wijziging: [oud, nieuw] of [oud, nieuw, n] (n-de voorkomen, vanaf 1; nieuw = stap of lijst stappen), { ruil: [a, b] } of { eind: [stappen] }.
  function pas(basis, ops) {
    var plan = basis.slice();
    (ops || []).forEach(function (op) {
      if (op.eind) { plan = plan.concat(op.eind); return; }
      if (op.ruil) {
        var i = plan.indexOf(op.ruil[0]), j = plan.indexOf(op.ruil[1]);
        if (i < 0 || j < 0) throw new Error("routes.js: ruil " + JSON.stringify(op.ruil) + " niet mogelijk in " + JSON.stringify(plan));
        plan[i] = op.ruil[1]; plan[j] = op.ruil[0]; return;
      }
      var nde = op[2] || 1, teller = 0, plek = -1;
      for (var k = 0; k < plan.length; k++) if (plan[k] === op[0] && ++teller === nde) { plek = k; break; }
      if (plek < 0) throw new Error("routes.js: stap " + op[0] + " (voorkomen " + nde + ") niet gevonden in " + JSON.stringify(plan));
      plan.splice.apply(plan, [plek, 1].concat(op[1]));
    });
    return plan;
  }
  function opsVoor(ops, sleutel) { return ops && !Array.isArray(ops) ? ops[sleutel] : ops; }

  /* ---------- E3 basisplannen (A en B in beide volgorden) ----------
     Basisroute: fosfomycine als start, daarna beide gebeurtenissen beantwoord met amoxicilline/clavulaanzuur 875/125 en de sick day-set.
     Volgorde A,B: A zichtbaar op dag 3 (na de 4e kaart), B op dag 4 (na de 7e kaart); de kweekuitslag C (3 kaarten na de eerste O1) op dag 4.
     Volgorde B,A: B zichtbaar op dag 3, C op dag 4, A op dag 5. Venster 'binnen 2 beurten' = de dag van de gebeurtenis en de dag erna. */
  var V6_V8 = "V6>V8>875/125 mg 2 dd";
  var BASIS_AB = ["G3", "O1", "V4", "|", "N1", "|", "O1", "B1>V8", V6_V8, "|", "Ev1", "B3>spironolacton", "V6>lisinopril>halveren",
    "|", "N3", "O2", "Ev2>spironolacton", "=7"];
  var BASIS_BA = ["G3", "O1", "V4", "|", "N1", "|", "B3>spironolacton", "V6>lisinopril>halveren", "|", "N3", "Ev1", "O2",
    "|", "O1", "B1>V8", V6_V8, "|", "Ev1", "Ev2>spironolacton", "=7"];
  var BASIS = { "A,B": BASIS_AB, "B,A": BASIS_BA };

  var routes = [];
  function e1(id, naam, plan, verwacht, soort) { routes.push({ id: id, ep: "E1", naam: naam, soort: soort || "geldig", plan: plan, verwacht: verwacht }); }
  function e2(id, naam, plan, verwacht, soort) { routes.push({ id: id, ep: "E2", naam: naam, soort: soort || "geldig", plan: plan, verwacht: verwacht }); }
  // E3 met basis + wijzigingen (ops mag per volgorde verschillen)
  function e3(id, naam, ops, verwacht, soort, verwachtPer) {
    var plannen = {};
    VOLGORDES.forEach(function (v) { plannen[v.sleutel] = pas(BASIS[v.sleutel], opsVoor(ops, v.sleutel)); });
    routes.push({ id: id, ep: "E3", naam: naam, soort: soort || "geldig", plannen: plannen, verwacht: verwacht, verwachtPer: verwachtPer });
  }
  function e3plannen(id, naam, plannen, verwacht, soort, verwachtPer) {
    routes.push({ id: id, ep: "E3", naam: naam, soort: soort || "geldig", plannen: plannen, verwacht: verwacht, verwachtPer: verwachtPer });
  }

  /* =============== EPISODE 1: geldige routes (casus sectie 4) =============== */
  e1("E1-afwachten", "Afwachten: V1 + N1 + Ev1", ["V1", "N1", "Ev1"], geldig("Terughoudend", REFLECTIE.terughoudend, 3, 3));
  e1("E1-afwachten-omgekeerd", "Afwachten, kaarten in omgekeerde volgorde (volgorde vrij)", ["Ev1", "N1", "V1"], geldig("Terughoudend", REFLECTIE.terughoudend, 3, 3));
  e1("E1-uitgesteld", "Uitgesteld recept: V2 + N1 + Ev1", ["V2", "N1", "Ev1"], geldig("Gedeelde regie", null, 2, 3));
  e1("E1-uitgesteld-middel", "Uitgesteld recept met middel: V2 + V3 + N1 + N2 + Ev1", ["V2", "V3", "N1", "|", "N2>V3", "Ev1"], geldig("Gedeelde regie", null, 2, 3));
  e1("E1-nitrofurantoine", "Nitrofurantoïne 5 dagen: V3 + N1", ["V3", "N1"], geldig("Direct behandelen", REFLECTIE.direct, 1, 3));
  e1("E1-nitrofurantoine-compleet", "Nitrofurantoïne: V3 + N1 + N2 + Ev1", ["V3", "N1", "N2>V3", "|", "Ev1"], geldig("Direct behandelen", REFLECTIE.direct, 1, 3));
  e1("E1-fosfomycine", "Fosfomycine: V4 + N1 + N2", ["V4", "N1", "N2>V4"], geldig("Direct behandelen", REFLECTIE.direct, 1, 3));
  e1("E1-trimethoprim", "Trimethoprim 3 dagen: V5 + N1", ["V5", "N1"], geldig("Direct behandelen", REFLECTIE.direct, 1, 3));
  e1("E1-trimethoprim-omgekeerd", "Trimethoprim 3 dagen, omgekeerde volgorde", ["N1", "V5"], geldig("Direct behandelen", REFLECTIE.direct, 1, 3));
  e1("E1-doelmatigheid-O1-O2", "Nitrofurantoïne + O1 + O2: doelmatigheid 3 - 1 - 1", ["V3", "N1", "O1", "|", "O2"], geldig("Direct behandelen", REFLECTIE.direct, 1, 1, { extra: [EXTRA.O1] }));
  e1("E1-doelmatigheid-O1", "Afwachten + O1: doelmatigheid 2, extra vraag O1", ["V1", "N1", "Ev1", "|", "O1"], geldig("Terughoudend", REFLECTIE.terughoudend, 3, 2, { extra: [EXTRA.O1] }));
  e1("E1-doelmatigheid-O2", "Fosfomycine + O2: doelmatigheid 2", ["V4", "N1", "N2>V4", "|", "O2"], geldig("Direct behandelen", REFLECTIE.direct, 1, 2));
  e1("E1-gegevens-gratis", "Fosfomycine + G1 + G2: gegevens kosten geen doelmatigheidspunt", ["V4", "N1", "N2>V4", "|", "G1", "G2"], geldig("Direct behandelen", REFLECTIE.direct, 1, 3));

  /* =============== EPISODE 1: foutroutes =============== */
  e1("E1-fout-I1", "Nitrofurantoïne zonder N1", ["V3"], fout(["I1"], VRAAG.I1, [ZICHT.N1]), "fout");
  e1("E1-fout-I1-leeg-na-N1-ontbreekt", "Fosfomycine + N2 zonder N1", ["V4", "N2>V4"], fout(["I1"], VRAAG.I1, [ZICHT.N1]), "fout");
  e1("E1-fout-I3", "Afwachten zonder Ev1", ["V1", "N1"], fout(["I3"], VRAAG.I3, [ZICHT.V1]), "fout");
  e1("E1-fout-I4", "Twee antibiotica tegelijk: V3 + V4", ["V3", "V4", "N1"], fout(["I4"], VRAAG.I4), "fout");
  e1("E1-fout-I4-V3-V5", "Twee antibiotica tegelijk: V5 + V3", ["V5", "N1", "V3"], fout(["I4"], VRAAG.I4), "fout");
  e1("E1-fout-I1-I3-I4", "Gelijke ernst: I1, I3 en I4 samen; eerste in de data (I1)", ["V1", "V3", "V4"], fout(["I1", "I3", "I4"], VRAAG.I1, [ZICHT.N1, ZICHT.V1]), "fout");
  e1("E1-fout-I3-I4", "Gelijke ernst: I3 en I4; eerste in de data (I3)", ["V1", "V3", "V4", "|", "N1"], fout(["I3", "I4"], VRAAG.I3, [ZICHT.V1]), "fout");

  /* =============== EPISODE 2: geldige routes (casus sectie 5) =============== */
  e2("E2-fosfomycine", "Fosfomycine: G2 -> O1 -> V4 + N1 + N2, na de uitslag niet wisselen",
    ["G2", "O1", "V4", "|", "N1", "N2>V4", "|", "=7"], geldig("Kweekgestuurd, smal", null, 3, 3));
  e2("E2-fosfomycine-andere-volgorde", "Fosfomycine met N1 en G2 voor O1 (volgorde vrij, O1 wel voor V4)",
    ["N1", "G2", "O1", "|", "V4", "N2>V4", "|", "=7"], geldig("Kweekgestuurd, smal", null, 3, 3));
  e2("E2-trimethoprim-bijgestuurd", "Trimethoprim 7 dagen: G2 -> O1 -> V5 + O2 + V6 + N1, na de uitslag B1 naar fosfomycine",
    ["G2", "O1", "V5", "|", "O2", "N1", "|", "B1>V4", "|", "V6>V5>halveren", "=7"], geldig("Bijgestuurd", null, 3, 3));
  e2("E2-onnodig-gewisseld", "Fosfomycine werkt (klachten af), wissel naar trimethoprim en terug: duurzaamheid 2, extra vraag",
    ["G2", "O1", "V4", "|", "N1", "B1>V5", "|", "B1>V4", "O2", "|", "|", "V6>V5>halveren", "=7"],
    { geschonden: [], vraag: null, score: { duurzaamheid: 2, doelmatigheid: 3 }, extraVragen: [EXTRA.gewisseld], zichtbaar: [] });
  e2("E2-grens-I8-wissel-op-tweede-beurt", "Trimethoprim, wissel naar fosfomycine op de laatste toegestane dag (de dag na de uitslag: binnen 2 beurten)",
    ["G2", "O1", "V5", "|", "O2", "N1", "|", "|", "B1>V4", "V6>V5>halveren", "=7"], geldig("Bijgestuurd", null, 3, 3));
  e2("E2-G2-te-laat", "Fosfomycine, G2 pas na V4: doelmatigheid 2, extra vraag verouderde eGFR",
    ["O1", "V4", "N1", "|", "G2", "|", "=7"], geldig("Kweekgestuurd, smal", null, 3, 2, { extra: [EXTRA.eGFR] }));
  e2("E2-G2-nooit", "Fosfomycine zonder G2: doelmatigheid 2, extra vraag verouderde eGFR",
    ["O1", "V4", "N1", "|", "|", "=7"], geldig("Kweekgestuurd, smal", null, 3, 2, { extra: [EXTRA.eGFR] }));

  /* =============== EPISODE 2: foutroutes =============== */
  e2("E2-fout-I1", "Fosfomycine zonder N1", ["G2", "O1", "V4", "|", "|", "=7"], fout(["I1"], VRAAG.I1), "fout");
  e2("E2-fout-I4", "Twee antibiotica tegelijk (V5 en V4), V5 daarna gestopt; O2 en V6 wel op tijd",
    ["O1", "V5", "V4", "|", "O2", "B2>V5", "N1", "|", "|", "V6>V5>halveren", "=7"], fout(["I4"], VRAAG.I4), "fout");
  e2("E2-fout-I5", "Nitrofurantoïne met G2", ["G2", "O1", "V3", "|", "N1", "|", "=7"], fout(["I5"], VRAAG.I5), "fout");
  e2("E2-fout-I5-zonderG2", "Nitrofurantoïne zonder G2: zichtbaar-zin", ["O1", "V3", "N1", "|", "|", "=7"], fout(["I5"], VRAAG.I5, [ZICHT.V3]), "fout");
  e2("E2-fout-I6-geenKweek", "Antibioticum zonder O1 vooraf", ["G2", "V4", "N1", "|", "|", "=7"], fout(["I6"], VRAAG.I6geenKweek), "fout");
  e2("E2-fout-I6-afwachten", "Afwachten in de risicogroep", ["G2", "V1", "N1", "|", "Ev1", "|", "=7"], fout(["I6"], VRAAG.I6afwachten), "fout");
  e2("E2-fout-I6-beide-varianten", "Afwachten én antibioticum zonder O1: eerste variant in de data (geen kweek)",
    ["G2", "V1", "V4", "|", "N1", "|", "=7"], fout(["I6"], VRAAG.I6geenKweek), "fout");
  e2("E2-fout-I7-kalium", "Trimethoprim zonder O2 (V6 wel op tijd)",
    ["G2", "O1", "V5", "|", "N1", "B1>V4", "|", "|", "V6>V5>halveren", "=7"], fout(["I7"], VRAAG.I7kalium, [ZICHT.V5]), "fout");
  e2("E2-fout-I7-halveren", "Trimethoprim met O2 maar zonder V6 halveren",
    ["G2", "O1", "V5", "|", "O2", "N1", "|", "B1>V4", "|", "=7"], fout(["I7"], VRAAG.I7halveren), "fout");
  e2("E2-fout-I7-te-vroeg-halveren", "Trimethoprim met O2, V6 halveren al op dag 3 (te vroeg)",
    ["G2", "O1", "V5", "|", "O2", "N1", "|", "B1>V4", "V6>V5>halveren", "=7"], fout(["I7"], VRAAG.I7halveren), "fout");
  e2("E2-fout-I7-O2-te-laat", "Trimethoprim, O2 pas op dag 5 (te laat)",
    ["G2", "O1", "V5", "|", "N1", "B1>V4", "|", "|", "V6>V5>halveren", "|", "O2", "=7"], fout(["I7"], VRAAG.I7kalium), "fout");
  e2("E2-fout-I8", "Na de kweekuitslag doorgaan met trimethoprim terwijl de klachten aanhouden",
    ["G2", "O1", "V5", "|", "O2", "N1", "|", "|", "V6>V5>halveren", "=7"], fout(["I8"], VRAAG.I8), "fout");
  e2("E2-fout-I8-te-laat", "Trimethoprim, wissel pas twee dagen na de uitslag (buiten 2 beurten)",
    ["G2", "O1", "V5", "|", "O2", "N1", "|", "|", "V6>V5>halveren", "|", "B1>V4", "=7"], fout(["I8"], VRAAG.I8), "fout");
  e2("E2-fout-I7-I6", "Ernst: I7 (3) gaat voor I6 (4), hoewel I6 eerder in de data staat",
    ["G2", "V5", "O1", "|", "N1", "B1>V4", "|", "|", "=7"], fout(["I7", "I6"], VRAAG.I7kalium, [ZICHT.V5]), "fout");
  e2("E2-fout-I5-I1", "Ernst: I5 (2) gaat voor I1 (5)", ["G2", "O1", "V3", "|", "|", "=7"], fout(["I5", "I1"], VRAAG.I5), "fout");
  e2("E2-fout-I6-I8", "Gelijke ernst 4: I6 en I8; eerste in de data (I6)",
    ["G2", "V5", "O1", "|", "O2", "N1", "|", "|", "V6>V5>halveren", "=7"], fout(["I6", "I8"], VRAAG.I6geenKweek), "fout");

  /* =============== EPISODE 3: geldige routes (casus sectie 6) =============== */
  e3plannen("E3-fosfomycine-start", "Start bij cystitis: G3 -> O1 -> V4 + N1, met O2 + Ev2 voor I9; afgerond voordat een gebeurtenis zichtbaar is (geen score-/profielregel)",
    { "A,B": ["G3", "O1", "V4", "|", "N1", "O2", "Ev2>spironolacton"], "B,A": ["G3", "O1", "V4", "|", "N1", "O2", "Ev2>spironolacton"] },
    geldig(null, null, null, 3));
  e3("E3-amoxicilline-clavulaanzuur", "Weefselinvasie: O1, B1 naar V8, V6 875/125; sick day-set na B", [],
    geldig("Kweekgestuurd", null, 3, 3));
  e3("E3-sickday-omgekeerde-volgorde", "Als de basisroute, maar de sick day-kaarten in andere volgorde (N3 en B3 omgewisseld)",
    [{ ruil: ["B3>spironolacton", "N3"] }], geldig("Kweekgestuurd", null, 3, 3));
  e3("E3-hervatten-na-overleg", "Als de basisroute, daarna B5 op spironolacton nadat Ev2 is gespeeld (geen automatische herstart)",
    [{ eind: ["B5>spironolacton"] }], geldig("Kweekgestuurd", null, 3, 3, { extra: [EXTRA.herstart] }));
  e3("E3-G3-te-laat", "Als de basisroute, maar G3 pas na V4 (O1 wel eerst): doelmatigheid 2",
    [{ ruil: ["G3", "O1"] }, { ruil: ["G3", "V4"] }],
    geldig("Kweekgestuurd", null, 3, 2));
  e3("E3-ciprofloxacine-B4", "Weefselinvasie: B1 naar ciprofloxacine met B4 (scheiden van calcium)",
    [["B1>V8", "B1>V7"], [V6_V8, "B4>V7"]], geldig("Richtlijn eerste keus", REFLECTIE.cipro, 2, 3, { extra: [EXTRA.cipro] }));
  e3("E3-ciprofloxacine-B3-calcium", "Weefselinvasie: B1 naar ciprofloxacine met B3 (calcium tijdelijk stoppen)",
    [["B1>V8", "B1>V7"], [V6_V8, "B3>calcium"]], geldig("Richtlijn eerste keus", REFLECTIE.cipro, 2, 3, { extra: [EXTRA.cipro] }));
  e3plannen("E3-deescalatie-na-C", "Ciprofloxacine met B4, na de kweekuitslag (C) de-escaleren naar amoxicilline/clavulaanzuur 875/125",
    {
      "A,B": ["G3", "O1", "V4", "|", "N1", "|", "O1", "B1>V7", "B4>V7", "|", "Ev1", "B3>spironolacton", "V6>lisinopril>halveren",
        "|", "N3", "B1>V8", V6_V8, "|", "O2", "Ev2>spironolacton", "=7"],
      "B,A": ["G3", "O1", "V4", "|", "N1", "|", "B3>spironolacton", "V6>lisinopril>halveren", "|", "N3", "Ev1", "O2",
        "|", "O1", "B1>V7", "B4>V7", "|", "Ev1", "B1>V8", V6_V8, "|", "Ev2>spironolacton", "=7"]
    },
    geldig("Kweekgestuurd", null, 3, 3, { extra: [EXTRA.cipro] }));
  e3plannen("E3-grens-I14-B4-volgende-beurt", "Ciprofloxacine, B4 pas de dag na de start van ciprofloxacine (dezelfde of de volgende beurt)",
    {
      "A,B": ["G3", "O1", "V4", "|", "N1", "|", "O1", "B1>V7", "G1", "|", "Ev1", "B4>V7", "B3>spironolacton", "|", "V6>lisinopril>halveren", "N3", "O2",
        "|", "Ev2>spironolacton", "=7"],
      "B,A": ["G3", "O1", "V4", "|", "N1", "|", "B3>spironolacton", "V6>lisinopril>halveren", "|", "N3", "Ev1", "O2",
        "|", "O1", "B1>V7", "G1", "|", "Ev1", "B4>V7", "Ev2>spironolacton", "=7"]
    },
    geldig("Richtlijn eerste keus", REFLECTIE.cipro, 2, 3, { extra: [EXTRA.cipro] }));
  e3("E3-verwijzen", "Weefselinvasie: fosfomycine stoppen, geen werkzaam antibioticum, na 48 uur geen verbetering: Ev3",
    [["B1>V8", "B2>V4"], [V6_V8, "G1"], { eind: ["Ev3"] }], geldig(null, null, null, 3));

  /* =============== EPISODE 3: foutroutes (elk PRECIES een invariant) =============== */
  e3("E3-fout-I1", "Geen N1 (G1 als vulling)", [["N1", "G1"]], fout(["I1"], VRAAG.I1), "fout");
  e3plannen("E3-fout-I4", "Twee antibiotica tegelijk (V4 en V8) vóór de gebeurtenissen; V4 daarna gestopt",
    {
      "A,B": ["G3", "O1", "V4", "|", "N1", "V8", V6_V8, "|", "B2>V4", "Ev1", "G1", "|", "B3>spironolacton", "V6>lisinopril>halveren", "N3",
        "|", "Ev1", "O2", "Ev2>spironolacton", "=7"],
      "B,A": ["G3", "O1", "V4", "|", "N1", "V8", V6_V8, "|", "B2>V4", "B3>spironolacton", "V6>lisinopril>halveren",
        "|", "N3", "Ev1", "O2", "|", "Ev2>spironolacton", "=7"]
    }, fout(["I4"], VRAAG.I4), "fout");
  e3("E3-fout-I5", "Nitrofurantoïne bij eGFR 28", [["V4", "V3"]], fout(["I5"], VRAAG.I5), "fout");
  e3("E3-fout-I6-geenKweek", "Fosfomycine voor de kweek", [{ ruil: ["O1", "V4"] }], fout(["I6"], VRAAG.I6geenKweek), "fout");
  e3("E3-fout-I6-afwachten", "Afwachtend beleid (V1) in de risicogroep", [["O2", "V1"]], fout(["I6"], VRAAG.I6afwachten), "fout");
  e3("E3-fout-I7", "Trimethoprim zonder V6 halveren (A,B: ook O2 te laat op dag 5; B,A: O2 valt op dag 4 = verschil 3, op tijd)", [["V4", "V5"]],
    fout(["I7"], VRAAG.I7kalium), "fout", { "B,A": fout(["I7"], VRAAG.I7halveren) });
  e3("E3-fout-I8", "Amoxicilline (resistent) na de uitslag laten doorlopen; verwijzen om I16 uit te sluiten",
    [["V4", "V10"], ["B1>V8", "G1"], [V6_V8, "G1"], { eind: ["Ev3"] }], fout(["I8"], VRAAG.I8), "fout");
  e3("E3-fout-I9-geen-O2-Ev2", "Geen O2 en geen Ev2 op spironolacton", [["O2", "G1"], ["Ev2>spironolacton", "G1"]], fout(["I9"], VRAAG.I9, [ZICHT.I9]), "fout");
  e3("E3-fout-I9-B5-zonder-Ev2", "Spironolacton hervatten (B5) zonder eerst Ev2", [["Ev2>spironolacton", "B5>spironolacton"]], fout(["I9"], VRAAG.I9, [ZICHT.I9]), "fout");
  e3("E3-fout-I10", "Bij weefselinvasie fosfomycine laten doorlopen (Ev3 sluit I16 uit)",
    [["B1>V8", "G1"], [V6_V8, "G1"], { eind: ["Ev3"] }], fout(["I10"], VRAAG.I10), "fout");
  e3("E3-fout-I11", "Bij weefselinvasie wisselen zonder nieuwe kweek", [["O1", "G1", 2]], fout(["I11"], VRAAG.I11), "fout");
  e3("E3-fout-I12", "Cotrimoxazol", [["V4", "V9"]], fout(["I12"], VRAAG.I12), "fout");
  e3("E3-fout-I13-verkeerde-dosis", "Amoxicilline/clavulaanzuur met V6 500/125 mg 2 dd", [[V6_V8, "V6>V8>500/125 mg 2 dd"]], fout(["I13"], VRAAG.I13), "fout");
  e3("E3-fout-I13-geen-V6", "Amoxicilline/clavulaanzuur zonder V6", [[V6_V8, "G1"]], fout(["I13"], VRAAG.I13), "fout");
  e3("E3-fout-I14", "Ciprofloxacine zonder B4 en zonder B3 op calcium (Ev3 sluit I16 uit)",
    [["B1>V8", "B1>V7"], [V6_V8, "G1"], { eind: ["Ev3"] }], fout(["I14"], VRAAG.I14, [ZICHT.cipro]), "fout");
  e3plannen("E3-fout-I14-B4-te-laat", "Ciprofloxacine, B4 pas twee dagen na de start (buiten 'dezelfde of de volgende beurt'; Ev3 sluit I16 uit)",
    {
      "A,B": ["G3", "O1", "V4", "|", "N1", "|", "O1", "B1>V7", "G1", "|", "Ev1", "B3>spironolacton", "G1", "|", "V6>lisinopril>halveren", "N3", "B4>V7",
        "|", "O2", "Ev2>spironolacton", "=7", "Ev3"],
      "B,A": ["G3", "O1", "V4", "|", "N1", "|", "B3>spironolacton", "V6>lisinopril>halveren", "|", "N3", "Ev1", "O2",
        "|", "O1", "B1>V7", "G1", "|", "Ev1", "Ev2>spironolacton", "|", "B4>V7", "Ev3"]
    }, fout(["I14"], VRAAG.I14, [ZICHT.cipro]), "fout");
  e3("E3-fout-I15", "Sick day-set zonder drinkadvies (N3)", [["N3", "G1"]], fout(["I15"], VRAAG.I15), "fout");
  e3plannen("E3-fout-I15-N3-te-laat", "Sick day-set: N3 pas twee dagen na B (buiten 'binnen 2 beurten'); A afgehandeld door te stoppen en later te verwijzen",
    {
      "A,B": ["G3", "O1", "V4", "|", "N1", "|", "O1", "B2>V4", "G1", "|", "Ev1", "B3>spironolacton", "V6>lisinopril>halveren", "|", "O2", "Ev2>spironolacton",
        "|", "N3", "=7", "Ev3"],
      "B,A": ["G3", "O1", "V4", "|", "N1", "|", "B3>spironolacton", "V6>lisinopril>halveren", "|", "Ev1", "O2", "G1",
        "|", "O1", "B2>V4", "N3", "|", "Ev1", "Ev2>spironolacton", "=7", "Ev3"]
    }, fout(["I15"], VRAAG.I15), "fout");
  e3("E3-fout-I16-geen-Ev1", "Geen Ev1 in de eerste 2 beurten na A",
    { "A,B": [["Ev1", "G1"], ["O2", "Ev1"]], "B,A": [["Ev1", "G1", 2]] }, fout(["I16"], VRAAG.I16), "fout");
  e3("E3-fout-I16-geen-verwijzing", "Na 48 uur geen verbetering en geen Ev3",
    [["B1>V8", "B2>V4"], [V6_V8, "G1"]], fout(["I16"], VRAAG.I16), "fout");

  /* ---- combinaties: alleen de vraag van de laagste ernst-waarde; gelijke ernst: eerste in de data ---- */
  e3("E3-fout-I12-I1", "Ernst 1 (I12) gaat voor ernst 5 (I1), hoewel I12 later in de data staat", [["V4", "V9"], ["N1", "G1"]], fout(["I12", "I1"], VRAAG.I12), "fout");
  e3("E3-fout-I12-I5", "Ernst 1 (I12) gaat voor ernst 2 (I5)", [["V4", "V3"], ["B1>V8", "B1>V9"], [V6_V8, "G1"]], fout(["I12", "I5"], VRAAG.I12), "fout");
  e3("E3-fout-I13-I11", "Ernst 3 (I13) gaat voor ernst 4 (I11), hoewel I11 eerder in de data staat", [["O1", "G1", 2], [V6_V8, "G1"]], fout(["I13", "I11"], VRAAG.I13), "fout");
  e3("E3-fout-I8-I1", "Ernst 4 (I8) gaat voor ernst 5 (I1), hoewel I1 eerder in de data staat",
    [["V4", "V10"], ["B1>V8", "G1"], [V6_V8, "G1"], ["N1", "G1"], { eind: ["Ev3"] }], fout(["I8", "I1"], VRAAG.I8), "fout");
  e3("E3-fout-I15-I9", "Ernst 2 (I15) gaat voor ernst 3 (I9), hoewel I9 eerder in de data staat",
    [["N3", "G1"], ["O2", "G1"], ["Ev2>spironolacton", "G1"]], fout(["I15", "I9"], VRAAG.I15, [ZICHT.I9]), "fout");
  e3("E3-fout-I9-I13", "Gelijke ernst 3: I9 en I13; I9 staat eerder in de data (niet op id-volgorde)",
    [["O2", "G1"], ["Ev2>spironolacton", "G1"], [V6_V8, "V6>V8>500/125 mg 2 dd"]], fout(["I9", "I13"], VRAAG.I9, [ZICHT.I9]), "fout");
  e3("E3-fout-I5-I10", "Gelijke ernst 2: I5 en I10; I5 staat eerder in de data",
    [["V4", "V3"], ["B1>V8", "G1"], [V6_V8, "G1"], { eind: ["Ev3"] }], fout(["I5", "I10"], VRAAG.I5), "fout");

  /* ---- afgerond met onvervulde eisen (eindstand telt): per volgorde andere schendingen ---- */
  e3plannen("E3-fout-vroeg-afgerond", "Direct afgerond zodra de eerste gebeurtenis zichtbaar is: de nog niet vervulde eisen tellen als geschonden",
    { "A,B": ["G3", "O1", "V4", "|", "N1", "O2", "Ev2>spironolacton", "|"], "B,A": ["G3", "O1", "V4", "|", "N1", "O2", "Ev2>spironolacton", "|"] },
    fout(["I10", "I16"], VRAAG.I10), "fout",
    { "B,A": fout(["I15"], VRAAG.I15, [ZICHT.sickday]) });
  e3("E3-fout-geen-sickday", "A goed beantwoord, B met geen enkele sick day-maatregel (ook geen Ev1): I15 en I16, zichtbaar-zin",
    { "A,B": [["B3>spironolacton", "G1"], ["V6>lisinopril>halveren", "G1"], ["N3", "G1"], ["Ev1", "G1"]],
      "B,A": [["B3>spironolacton", "G1"], ["V6>lisinopril>halveren", "G1"], ["N3", "G1"], ["Ev1", "G1"], ["Ev1", "G1"]] },
    fout(["I15", "I16"], VRAAG.I15, [ZICHT.sickday]), "fout");

  /* ---------- afspelen via de Engine ---------- */
  function stap(tok) {
    if (tok === "|") return { dag: true };
    if (tok.charAt(0) === "=") return { tot: parseInt(tok.slice(1), 10) };
    var d = tok.split(">");
    return { kaart: d[0], doel: d[1] || null, optie: d[2] || null };
  }
  function planVan(route, sleutel) { return (route.plannen && route.plannen[sleutel]) || route.plan; }
  function speel(route, volgorde) {
    var casus = g.Test.zonderLimiet(), rngWaarde = volgorde.rng;
    var state = g.Engine.nieuwSpel(casus, route.ep, { rng: function () { return rngWaarde; } });
    planVan(route, volgorde.sleutel).forEach(function (tok, i) {
      var s = stap(tok), wat = "route " + route.id + " (" + volgorde.sleutel + "), stap " + (i + 1) + " '" + tok + "'";
      if (s.dag) { g.Engine.volgendeDag(state); return; }
      if (s.tot) { while (state.dag < s.tot && !state.dagenVoorbij) g.Engine.volgendeDag(state); return; }
      var opts = {}; if (s.doel) opts.doel = s.doel; if (s.optie) opts.optie = s.optie;
      var r = g.Engine.speelKaart(state, s.kaart, opts);
      if (!r || !r.ok) throw new Error(wat + " mislukt (dag " + state.dag + "): " + (r && r.fout));
    });
    var uitkomst = g.Engine.rondAf(state);
    return { state: state, uitkomst: uitkomst };
  }
  // Verwachte downsides (volgorde: eerste keer spelen), uit het plan + de casustabel hierboven. Alleen kaarten die in deze episode een downside hebben.
  function verwachteDownsides(route, volgorde) {
    var gezien = {}, uit = [];
    planVan(route, volgorde.sleutel).forEach(function (tok) {
      var s = stap(tok);
      if (s.dag || s.tot || gezien[s.kaart]) return;
      gezien[s.kaart] = true;
      var d = DOWNSIDE[s.kaart];
      if (d && typeof d === "object") d = Object.prototype.hasOwnProperty.call(d, route.ep) ? d[route.ep] : null;
      if (d) uit.push({ kaart: s.kaart, soort: "gespeeld", tekst: d });
    });
    return uit;
  }
  function verwachtVoor(route, volgorde) {
    var v = route.verwachtPer && route.verwachtPer[volgorde.sleutel];
    return v || route.verwacht;
  }

  g.Routes = {
    versie: "1.0", volgordes: VOLGORDES, lijst: routes, speel: speel, verwachteDownsides: verwachteDownsides, verwachtVoor: verwachtVoor,
    planVan: planVan, stap: stap, pas: pas, DOWNSIDE: DOWNSIDE, VRAAG: VRAAG, EXTRA: EXTRA, ZICHT: ZICHT, REFLECTIE: REFLECTIE,
    basis: BASIS
  };
})(typeof window !== "undefined" ? window : globalThis);

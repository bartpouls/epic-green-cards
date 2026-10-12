// Datavorm-tests voor episode 2 (stuk S3). Geen evaluator: alleen controle van de data in casussen/uwi-e2.js.
// De referentieteksten hieronder zijn met de hand uit casus-uwi.md (sectie 5 en de tabel in sectie 3) overgenomen
// en NIET uit de data gegenereerd, zodat de test niet circulair is.
// Tests die de bibliotheek (uwi.js), Predicaten of Engine nodig hebben, zijn ROOD (met duidelijke melding) als die ontbreken of niet laden.
(function (g) {
  var G = "data-e2";
  var T = g.Test;
  var VOORSCHRIJF = ["V1", "V2", "V3", "V4", "V5"];

  function casus() { return g.CASUSSEN && g.CASUSSEN[0]; }
  function e2() {
    var c = casus();
    if (!c) throw new Error("casussen/uwi.js ontbreekt of heeft geen casus: window.CASUSSEN[0] bestaat niet. Laad uwi.js vóór uwi-e2.js.");
    var e = (c.episodes || []).filter(function (x) { return x.id === "E2"; })[0];
    if (!e) throw new Error("Episode E2 niet gevonden in window.CASUSSEN[0].episodes (is casussen/uwi-e2.js geladen na uwi.js?).");
    return e;
  }
  function reg(naam, fn) { T.registreer(G, naam, function () { fn(e2()); }); }
  function alleStrings(x, uit, pad) {
    if (typeof x === "string") uit.push({ pad: pad, s: x });
    else if (Array.isArray(x)) x.forEach(function (v, i) { alleStrings(v, uit, pad + "[" + i + "]"); });
    else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { alleStrings(x[k], uit, pad + "." + k); });
    return uit;
  }
  function vindInv(e, id) { return e.invarianten.filter(function (i) { return i.id === id; })[0]; }
  function s(x) { return JSON.stringify(x); }
  var GEEN_ANTIBIOTICUM = { p: "niet", arg: { p: "of", args: [{ p: "gestart", middel: "V3" }, { p: "gestart", middel: "V4" }, { p: "gestart", middel: "V5" }] } };
  function zonderO1(v) { return { p: "en", args: [{ p: "gespeeld", kaart: v }, { p: "niet", arg: { p: "voor", a: { kaart: "O1" }, b: { kaart: "V" + v.slice(1) } } }] }; }
  var KWEEK_ALS = { p: "of", args: [zonderO1("V3"), zonderO1("V4"), zonderO1("V5")] };
  var AFWACHTEN_ALS = { p: "of", args: [{ p: "gespeeld", kaart: "V1" }, { p: "gespeeld", kaart: "V2" }, GEEN_ANTIBIOTICUM] };
  var I7_O2 = { p: "en", args: [{ p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 2 }, { p: "niet", arg: { p: "opDagRelatief", kaart: "O2", anker: { start: "V5" }, van: 1, tot: 3 } }] };
  var I7_V6 = { p: "en", args: [{ p: "actiefNaDagen", middel: "V5", anker: { start: "V5" }, na: 3 }, { p: "niet", arg: { p: "opDagRelatief", kaart: "V6", doel: "V5", optie: "halveren", anker: { start: "V5" }, van: 3 } }] };
  function bibliotheek() { var k = casus() && casus().kaarten; return k && k.length ? k : null; }

  // Alle predicaten van de episode, met een pad (voor foutmeldingen).
  function allePredicaten(e) {
    var uit = [];
    e.invarianten.forEach(function (i) {
      uit.push({ pad: "invariant " + i.id, p: i.predicaat });
      (i.vraagVarianten || []).forEach(function (v, k) { uit.push({ pad: "invariant " + i.id + " vraagVarianten[" + k + "]", p: v.als }); });
    });
    ["duurzaamheid", "doelmatigheid"].forEach(function (as) {
      e.score[as].regels.forEach(function (r, k) { if (r.als) uit.push({ pad: "score." + as + "[" + k + "]", p: r.als }); });
    });
    e.profielen.forEach(function (p) { uit.push({ pad: "profiel " + p.naam, p: p.als }); });
    e.feedbackExtra.forEach(function (f, k) { uit.push({ pad: "feedbackExtra[" + k + "]", p: f.trigger }); });
    e.zichtbaarAlsOntbreekt.forEach(function (z, k) { uit.push({ pad: "zichtbaarAlsOntbreekt[" + k + "]", p: z.trigger }); });
    e.patient.verborgen.forEach(function (v, k) { if (v.als) uit.push({ pad: "verborgen[" + k + "]", p: v.als }); });
    return uit;
  }

  /* ---------- algemeen ---------- */
  reg("E2-0 episode is zuivere data (JSON-roundtrip identiek, geen functies)", function (e) {
    T.gelijk(JSON.parse(JSON.stringify(e)), e);
    T.is(e.id, "E2"); T.is(e.level, 2);
    T.is(e.titel, "Episode 2 — level 2");
  });
  reg("E2-0 de episode staat precies één keer in de casus en na E1", function (e) {
    var ids = casus().episodes.map(function (x) { return x.id; });
    T.is(ids.filter(function (x) { return x === "E2"; }).length, 1);
    if (ids.indexOf("E1") >= 0) T.waar(ids.indexOf("E1") < ids.indexOf("E2"), "E1 hoort vóór E2");
  });

  /* ---------- E1-1 / E2-1: patiëntkaart ---------- */
  reg("E2-1 patiëntkaart letterlijk uit de casus", function (e) {
    var z = e.patient.zichtbaar;
    T.is(z.kop, "Mevrouw V., 78 jaar (6 jaar na episode 1).");
    T.is(z.naam, "Mevrouw V.");
    T.is(z.leeftijd, 78);
    T.is(z.leeftijdTekst, "78 jaar (6 jaar na episode 1)");
    T.is(z.klachten, "Tweede cystitis, geen koorts, nitriettest positief.");
    T.gelijk(z.medicatie, ["lisinopril", "calcium/colecalciferol"]);
    T.is(z.medicatieTekst, "lisinopril; calcium/colecalciferol");
    T.gelijk(z.lab, { eGFR: 42, datum: "van 6 jaar geleden" });
    T.is(z.labTekst, "laatst bekende eGFR 42, van 6 jaar geleden.");
    T.is(z.eerdereUWI, "episode 1, toen geen kweek gedaan.");
  });
  reg("E2-1 waar, comedicatie en verborgen (ware vs. zichtbare eGFR)", function (e) {
    T.gelijk(e.patient.waar, { eGFR: 29, risicogroep: true });
    T.is(e.patient.zichtbaar.lab.eGFR, 42, "zichtbaar: laatst bekende eGFR 42");
    T.waar(e.patient.waar.eGFR !== e.patient.zichtbaar.lab.eGFR, "waar en zichtbaar moeten verschillen in E2");
    T.gelijk(e.patient.medicatie, [{ id: "lisinopril", label: "lisinopril" }, { id: "calcium", label: "calcium/colecalciferol" }]);
    T.is(e.patient.verborgen.length, 1);
  });
  reg("E2-1 verborgen achter G2: eGFR 29 uit de jaarlijkse controle", function (e) {
    var v = e.patient.verborgen[0];
    T.is(v.kaart, "G2");
    T.is(v.sleutel, "eGFR");
    T.is(v.waarde, 29);
    T.is(v.waarde, e.patient.waar.eGFR, "onthulde waarde = ware waarde");
    T.is(v.onthult, "eGFR 29 uit de jaarlijkse controle.");
    T.is(v.zichtbaar.labTekst, "eGFR 29 uit de jaarlijkse controle.");
    T.gelijk(v.zichtbaar.lab, { datum: "uit de jaarlijkse controle" });
    T.is(v.meta.toelichting, "Daarmee valt ze in de risicogroep: een antibioticum is nodig, met een kweek vóór de eerste dosis, en nitrofurantoïne valt af [NHG].");
    T.waar(typeof v.TODO_BART === "string", "toelichting-vraag heeft TODO_BART op de plek zelf");
  });
  reg("E2-1 (A5/D2) de zichtbare kaart verklapt de verborgen gegevens niet", function (e) {
    var tekst = s(e.patient.zichtbaar);
    T.waar(tekst.indexOf("29") < 0, "29 staat in de zichtbare patiëntkaart");
    T.waar(tekst.toLowerCase().indexOf("risicogroep") < 0, "risicogroep staat in de zichtbare patiëntkaart");
    T.waar(e.patient.verborgen[0].onthult.toLowerCase().indexOf("nitrofurantoïne") < 0, "de onthulde regel noemt de oplossing");
  });

  /* ---------- E2-2: repertoire, knoppen, gebeurtenis ---------- */
  reg("E2-2 repertoire: 15 kaarten = episode 1 plus V6, B1 en B2", function (e) {
    T.gelijk(e.repertoire, ["G1", "G2", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "N1", "N2", "Ev1", "V6", "B1", "B2"]);
    T.is(e.repertoire.length, 15);
    T.is(new Set(e.repertoire).size, 15, "dubbele kaarten");
  });
  reg("E2-2 repertoire en antibiotica bestaan in de bibliotheek en horen bij E2 (alleen als uwi.js kaarten bevat)", function (e) {
    var kaarten = bibliotheek();
    T.waar(kaarten, "de kaartenbibliotheek (casussen/uwi.js, casus.kaarten) is niet geladen of leeg: deze test kan niets controleren");
    var ids = kaarten.map(function (k) { return k.id; });
    e.repertoire.concat(e.antibiotica).forEach(function (id) { T.waar(ids.indexOf(id) >= 0, "kaart " + id + " ontbreekt in casus.kaarten"); });
    e.repertoire.forEach(function (id) {
      var k = kaarten.filter(function (x) { return x.id === id; })[0];
      T.waar(k.vanafEpisode <= 2, "kaart " + id + " hoort pas vanaf E" + k.vanafEpisode);
      T.waar(k.effect && (k.effect.E2 !== undefined ? k.effect.E2 : k.effect.alle), "kaart " + id + " heeft geen effect voor E2");
    });
  });
  reg("E2-2 knoppen, antibiotica en begintoestand", function (e) {
    T.gelijk(e.knoppen, { actiesPerBeurt: 3, aantalDagen: 14, raadplegenKost: 0 });
    T.waar(e.raadplegen === undefined, "raadplegen staat alleen op casusniveau (contract §4), niet in de episode");
    T.gelijk(e.antibiotica, ["V3", "V4", "V5"]);
    T.gelijk(e.startToestanden, ["cystitis"]);
  });
  reg("E2-2 precies één gebeurtenis (C), geen groep A/B", function (e) {
    T.is(e.gebeurtenissen.length, 1);
    T.is(e.gebeurtenissen[0].id, "C");
    T.waar(e.gebeurtenissen[0].groep === undefined, "C hoort niet in een groep");
  });
  reg("E2-2 gebeurtenis C: trigger 3 dagen na O1", function (e) {
    var c = e.gebeurtenissen[0];
    // Echte data: 3 dagen na Urinekweek inzetten (iteratie 1). De oude regels (na de 4e kaart) staan in Test.oudeRegels().
    T.gelijk(c.trigger, { type: "naDagenNaKaart", kaart: "O1", dagen: 3 });
    T.is(c.titel, "Kweekuitslag");
  });
  reg("E2-2 gebeurtenis C: tekst letterlijk en zet resistent/gevoelig", function (e) {
    var c = e.gebeurtenissen[0];
    T.is(c.tekst, "E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor nitrofurantoïne, fosfomycine, amoxicilline/clavulaanzuur en ciprofloxacine.");
    // resistent: trimethoprim (V5), amoxicilline (V10); gevoelig: nitrofurantoïne (V3), fosfomycine (V4), amoxicilline/clavulaanzuur (V8), ciprofloxacine (V7)
    T.gelijk(c.zet.resistent.slice().sort(), ["V10", "V5"]);
    T.gelijk(c.zet.gevoelig.slice().sort(), ["V3", "V4", "V7", "V8"]);
    c.zet.resistent.forEach(function (k) { T.waar(c.zet.gevoelig.indexOf(k) < 0, k + " staat in beide sets"); });
    T.waar(typeof c.TODO_BART === "string", "C heeft TODO_BART (doorlooptijd via Mistral niet gecheckt)");
  });
  reg("E2-2 zet-ids van C bestaan in de bibliotheek met de juiste labels (alleen als uwi.js kaarten bevat)", function (e) {
    var kaarten = bibliotheek();
    T.waar(kaarten, "de kaartenbibliotheek (casussen/uwi.js, casus.kaarten) is niet geladen of leeg: deze test kan niets controleren");
    var label = {}; kaarten.forEach(function (k) { label[k.id] = k.label; });
    var verwacht = { V5: "Trimethoprim", V10: "Amoxicilline", V3: "Nitrofurantoïne", V4: "Fosfomycine", V8: "Amoxicilline/clavulaanzuur", V7: "Ciprofloxacine" };
    Object.keys(verwacht).forEach(function (id) { T.is(label[id], verwacht[id], "label van " + id); });
  });

  /* ---------- E2-3: invarianten ---------- */
  reg("E2-3 invarianten: ids en volgorde (I1, I4, I5, I6, I7, I8)", function (e) {
    T.gelijk(e.invarianten.map(function (i) { return i.id; }), ["I1", "I4", "I5", "I6", "I7", "I8"]);
  });
  reg("E2-3 invarianten: ernst volgens bouwopdracht 6.1 en geldtIn volgens de toestandstabel", function (e) {
    var ernst = { I1: 5, I4: 5, I5: 2, I6: 4, I7: 3, I8: 4 };
    Object.keys(ernst).forEach(function (id) { T.is(vindInv(e, id).ernst, ernst[id], id + " ernst"); });
    ["I1", "I4", "I5", "I6", "I7"].forEach(function (id) { T.gelijk(vindInv(e, id).geldtIn, ["*"], id + " geldtIn (E2 · cystitis, de enige toestand)"); });
    T.gelijk(vindInv(e, "I8").geldtIn, [{ gebeurtenis: "C" }], "I8 geldt alleen als de kweekuitslag binnen is");
  });
  reg("E2-3 invarianten: vraag en bron letterlijk", function (e) {
    var verw = {
      I1: ["Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?", "NHG"],
      I4: ["Wat lost het tweede middel op dat het eerste niet oplost?", "[G]"],
      I5: ["Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?", "NHG"],
      I6: ["Wat vertelt een kweek van urine die al antibioticum heeft gezien?", "NHG"],
      I7: ["Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?", "NHG, KNMP"],
      I8: ["De kweek is binnen en de klachten blijven. Waar wacht je nog op?", "NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten"]
    };
    Object.keys(verw).forEach(function (id) {
      var i = vindInv(e, id);
      T.is(i.vraag, verw[id][0], id + " vraag");
      T.is(i.bron, verw[id][1], id + " bron");
      T.waar(i.predicaat && typeof i.predicaat === "object", id + " predicaat");
    });
  });
  reg("E2-3 I6 en I7 hebben beide casusvragen (vraagVarianten, elk met eigen voorwaarde)", function (e) {
    var i6 = vindInv(e, "I6").vraagVarianten.map(function (v) { return v.vraag; });
    T.gelijk(i6, [
      "Wat vertelt een kweek van urine die al antibioticum heeft gezien?",
      "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?"
    ]);
    var i7 = vindInv(e, "I7").vraagVarianten.map(function (v) { return v.vraag; });
    T.gelijk(i7, [
      "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
      "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?"
    ]);
    ["I6", "I7"].forEach(function (id) {
      var i = vindInv(e, id);
      T.is(i.vraagVarianten[0].vraag, i.vraag, id + ": 'vraag' is de eerste variant");
      i.vraagVarianten.forEach(function (v) { T.waar(v.als && typeof v.als.p === "string", id + ": variant mist 'als'"); });
    });
    // Volledige voorwaarden, in volgorde: vraagvariant 1 = geen kweek / geen kalium, vraagvariant 2 = afwachten / niet gehalveerd.
    T.gelijk(vindInv(e, "I6").vraagVarianten[0].als, KWEEK_ALS, "I6 variant 'geen kweek'");
    T.gelijk(vindInv(e, "I6").vraagVarianten[1].als, AFWACHTEN_ALS, "I6 variant 'afwachten'");
    T.gelijk(vindInv(e, "I7").vraagVarianten[0].als, I7_O2, "I7 variant 'geen kalium'");
    T.gelijk(vindInv(e, "I7").vraagVarianten[1].als, I7_V6, "I7 variant 'niet gehalveerd'");
  });
  reg("E2-3 de acht feedbackvragen van de casus staan er precies één keer in (6 bij invarianten, 2 als feedbackExtra)", function (e) {
    var verwacht = [
      "Hoe oud was de eGFR waarop je besloot? Wat is er sindsdien met haar gebeurd?",
      "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?",
      "Wat vertelt een kweek van urine die al antibioticum heeft gezien?",
      "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?",
      "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
      "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?",
      "De kweek is binnen en de klachten blijven. Waar wacht je nog op?",
      "Het werkte en de klachten namen af. Wat won je met wisselen?"
    ];
    var gevonden = [];
    e.feedbackExtra.forEach(function (f) { gevonden.push(f.vraag); });
    ["I5", "I8"].forEach(function (id) { gevonden.push(vindInv(e, id).vraag); });
    ["I6", "I7"].forEach(function (id) { vindInv(e, id).vraagVarianten.forEach(function (v) { gevonden.push(v.vraag); }); });
    T.gelijk(gevonden.slice().sort(), verwacht.slice().sort());
  });
  reg("E2-3 predicaten I1, I4, I5 (JSON-AST volgens contract)", function (e) {
    T.gelijk(vindInv(e, "I1").predicaat, { p: "nietGespeeld", kaart: "N1" });
    T.gelijk(vindInv(e, "I4").predicaat, { p: "aantalActieveAntibiotica", op: ">", n: 1 });
    T.gelijk(vindInv(e, "I5").predicaat, { p: "en", args: [{ p: "gestart", middel: "V3" }, { p: "waar", veld: "eGFR", op: "<", waarde: 30 }] });
  });
  reg("E2-3 predicaat I6: risicogroep en (V1 of V2 of antibioticum zonder O1 vooraf)", function (e) {
    var p = vindInv(e, "I6").predicaat;
    T.is(p.p, "en");
    T.gelijk(p.args[0], { p: "waar", veld: "risicogroep", op: "==", waarde: true });
    var of_ = p.args[1];
    T.is(of_.p, "of");
    T.gelijk(of_.args[0], { p: "gespeeld", kaart: "V1" });
    T.gelijk(of_.args[1], { p: "gespeeld", kaart: "V2" });
    ["V3", "V4", "V5"].forEach(function (v, k) {
      T.gelijk(of_.args[2 + k], { p: "en", args: [{ p: "gespeeld", kaart: v }, { p: "niet", arg: { p: "voor", a: { kaart: "O1" }, b: { kaart: v } } }] }, "antibioticum " + v + " zonder O1 vooraf");
    });
    T.gelijk(of_.args[5], GEEN_ANTIBIOTICUM, "risicogroep zonder enig antibioticum (TODO_BART-E2-15)");
    T.is(of_.args.length, 6);
  });
  reg("E2-3 predicaat I7: V5 in de risicogroep zonder O2 op verschil 1-3 of zonder V6 halveren vanaf verschil 3 (contract TODO_BART-1)", function (e) {
    var p = vindInv(e, "I7").predicaat;
    T.is(p.p, "en");
    T.gelijk(p.args[0], { p: "waar", veld: "risicogroep", op: "==", waarde: true });
    T.gelijk(p.args[1], { p: "gestart", middel: "V5" });
    var of_ = p.args[2];
    T.is(of_.p, "of");
    // Casus 1.2: de kaliumcontrole en het halveren gelden alleen als trimethoprim nog actief is (de 7-daagse kuur): wie het middel op
    // kuurdag 3 of eerder vervangt of stopt, krijgt geen schending. Kalium: actief aan het einde van start+2; halveren: start+3.
    T.gelijk(of_.args[0], I7_O2);
    T.gelijk(of_.args[1], I7_V6);
    T.waar(of_.args[1].args[1].arg.tot === undefined, "'vanaf dag 3' heeft geen bovengrens");
    T.waar(typeof vindInv(e, "I7").TODO_BART === "string", "I7 heeft TODO_BART (dag-lezing)");
  });
  reg("E2-3 predicaat I8: na C nog een resistent middel actief aan het einde van beurt 2 (dag van C + 1) bij klachten 'aan'", function (e) {
    var i8 = vindInv(e, "I8");
    var p = i8.predicaat;
    T.is(p.p, "en");
    T.gelijk(p.args[0], { p: "gebeurtenisGeweest", id: "C" });
    T.gelijk(p.args[1], { p: "actief", uitSet: "resistent", op: { eindeBeurtNaGebeurtenis: "C", offset: 1 } });
    T.gelijk(p.args[2], { p: "klachten", waarde: "aan" });
    T.is(p.args.length, 3);
    // 'binnen 2 beurten' = de beurt van C en de beurt erna: offset 1 (instelbaar in de data).
    T.is(p.args[1].op.offset, 2 - 1);
    T.waar(typeof i8.TODO_BART === "string", "I8 heeft TODO_BART (grens)");
  });
  reg("E2-3 alle predicaten gebruiken bekende predicaatnamen met geldige velden", function (e) {
    var bekend = ["gespeeld", "nietGespeeld", "voor", "na", "binnenBeurten", "opDagRelatief", "gestart", "actief", "actiefNaDagen",
      "aantalActieveAntibiotica", "medicatieActief", "waar", "inToestand", "gebeurtenisGeweest", "klachten", "tel", "en", "of", "niet", "alsDan", "waarheid"];
    var ops = ["<", "<=", ">", ">=", "==", "=", "!="];
    var n = 0;
    function isK(k) { return k && typeof k === "object" && typeof k.kaart === "string"; }
    function check(pr, pad) {
      T.waar(pr && typeof pr === "object" && typeof pr.p === "string", pad + ": predicaat zonder 'p'");
      T.waar(bekend.indexOf(pr.p) >= 0, pad + ": onbekend predicaat " + pr.p);
      n++;
      if (pr.p === "gespeeld" || pr.p === "nietGespeeld") T.waar(typeof pr.kaart === "string", pad + ": kaart ontbreekt");
      if (pr.p === "voor" || pr.p === "na") T.waar(isK(pr.a) && isK(pr.b), pad + ": a en b moeten kaartverwijzingen zijn");
      if (pr.p === "en" || pr.p === "of") { T.waar(Array.isArray(pr.args) && pr.args.length >= 1, pad + ": args"); pr.args.forEach(function (a, i) { check(a, pad + ".args[" + i + "]"); }); }
      if (pr.p === "niet") check(pr.arg, pad + ".arg");
      if (pr.p === "alsDan") { check(pr.als, pad + ".als"); check(pr.dan, pad + ".dan"); }
      if (pr.p === "waarheid") T.waar(typeof pr.waarde === "boolean", pad + ": waarde");
      if (pr.p === "aantalActieveAntibiotica") { T.waar(ops.indexOf(pr.op) >= 0, pad + ": op"); T.waar(typeof pr.n === "number", pad + ": n"); }
      if (pr.p === "waar") { T.waar(typeof pr.veld === "string" && ops.indexOf(pr.op) >= 0 && pr.waarde !== undefined, pad + ": waar-velden"); T.waar(e.patient.waar[pr.veld] !== undefined, pad + ": veld " + pr.veld + " staat niet in patient.waar"); }
      if (pr.p === "gestart") T.waar(e.antibiotica.indexOf(pr.middel) >= 0, pad + ": gestart op een middel dat geen antibioticum van E2 is: " + pr.middel);
      if (pr.p === "gebeurtenisGeweest") T.waar(e.gebeurtenissen.some(function (x) { return x.id === pr.id; }), pad + ": onbekende gebeurtenis " + pr.id);
      if (pr.p === "binnenBeurten") { T.waar(typeof pr.kaart === "string" && typeof pr.n === "number", pad + ": kaart/n"); T.waar(e.gebeurtenissen.some(function (x) { return x.id === pr.naGebeurtenis; }), pad + ": onbekende gebeurtenis"); }
      if (pr.p === "opDagRelatief") { T.waar(typeof pr.kaart === "string" && pr.anker && typeof pr.van === "number", pad + ": kaart/anker/van"); }
      if (pr.p === "klachten") T.waar(["af", "aan", "geenVerbetering48"].indexOf(pr.waarde) >= 0, pad + ": klachtenwaarde");
      if (pr.p === "actief" && pr.op && pr.op.eindeBeurtNaGebeurtenis) T.waar(e.gebeurtenissen.some(function (x) { return x.id === pr.op.eindeBeurtNaGebeurtenis; }), pad + ": onbekende gebeurtenis in op");
      if (pr.p === "tel") { T.waar(pr.teller && typeof pr.teller.t === "string" && ops.indexOf(pr.op) >= 0 && typeof pr.waarde === "number", pad + ": tel-velden"); if (pr.teller.terwijlKlachten) T.waar(["af", "aan"].indexOf(pr.teller.terwijlKlachten) >= 0, pad + ": terwijlKlachten"); }
    }
    allePredicaten(e).forEach(function (x) { check(x.p, x.pad); });
    T.waar(n >= 40, "te weinig predicaten gecontroleerd: " + n);
  });
  reg("E2-3 kaart-ids in de predicaten bestaan in het repertoire van E2 (geen kaart die de speler niet heeft)", function (e) {
    var fout = [];
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad); });
      else if (x && typeof x === "object") {
        if (typeof x.kaart === "string" && e.repertoire.indexOf(x.kaart) < 0) fout.push(pad + ": " + x.kaart);
        if (typeof x.start === "string" && e.antibiotica.indexOf(x.start) < 0) fout.push(pad + ": start " + x.start);
        Object.keys(x).forEach(function (k) { walk(x[k], pad); });
      }
    })(allePredicaten(e).map(function (x) { return x.p; }), "predicaat");
    T.gelijk(fout, []);
  });
  reg("E2-3 geen middelnamen of klinische tekst in de predicaten (alleen kaart-ids en generieke velden)", function (e) {
    var tekst = JSON.stringify(allePredicaten(e).map(function (x) { return x.p; })).toLowerCase();
    ["nitrofuranto", "fosfomycine", "trimethoprim", "amoxicilline", "ciprofloxacine", "kalium", "nierfunctie"].forEach(function (m) { T.waar(tekst.indexOf(m) < 0, "middelnaam in predicaat: " + m); });
  });

  /* ---------- E2-4: werkzaamheid en volgorde-eisen ---------- */
  reg("E2-4 werkzaamheid: V4 werkzaam; V3 en V5 niet", function (e) {
    var w = e.werkzaamheid.cystitis;
    T.gelijk(w.werkzaam, [{ kaart: "V4" }]);
    T.gelijk(w.nietWerkzaam.map(function (x) { return x.kaart; }), ["V3", "V5"]);
    w.nietWerkzaam.forEach(function (x) { T.is(typeof x.meta.reden, "string"); T.waar(x.reden === undefined, "reden hoort onder meta"); });
    T.is(w.nietWerkzaam[0].meta.reden, "geen bactericide concentratie bij eGFR < 30");
    T.is(w.nietWerkzaam[1].meta.reden, "resistent");
    T.gelijk(Object.keys(e.werkzaamheid), ["cystitis"], "alleen de toestand cystitis in E2");
  });
  reg("E2-4 statusTeksten: klachten nemen af / houden aan (casus-fragmenten) en TODO_BART", function (e) {
    // Casus: "Trimethoprim: klachten houden aan." en "Fosfomycine: klachten nemen af." De fragmenten staan met slotpunt en kleine letter in de data.
    T.is(e.statusTeksten.af, "klachten nemen af.");
    T.is(e.statusTeksten.aan, "klachten houden aan.");
    T.is(e.statusTeksten.geenVerbetering48, null, "komt in E2 niet voor");
    T.waar(typeof e.statusTeksten.TODO_BART === "string");
  });
  reg("E2-4 volgorde-eisen zitten in de invarianten: O1 vóór het eerste antibioticum (I6), O2 ná V5 (I7)", function (e) {
    T.waar(s(vindInv(e, "I6").predicaat).indexOf('"p":"voor","a":{"kaart":"O1"}') >= 0, "I6 mist voor(O1, antibioticum)");
    var i7 = s(vindInv(e, "I7").predicaat);
    T.waar(i7.indexOf('"kaart":"O2"') >= 0 && i7.indexOf('"anker":{"start":"V5"}') >= 0, "I7 mist O2 ten opzichte van V5");
    // Geen volgorde-/hint-velden buiten de invarianten.
    ["volgorde", "hint", "aanbevolen", "eersteKeus"].forEach(function (k) { T.waar(!(k in e), "veld " + k + " hoort niet in de episode"); });
  });

  /* ---------- E2-5: score en profielen ---------- */
  reg("E2-5 score duurzaamheid: start 3, -1 per onnodige wissel (B1 terwijl de klachten afnemen)", function (e) {
    var d = e.score.duurzaamheid;
    T.is(d.start, 3);
    T.gelijk(d.regels, [{ perKeer: { t: "gespeeld", kaart: "B1", terwijlKlachten: "af" }, delta: -1 }]);
    T.waar(typeof d.TODO_BART === "string", "score heeft TODO_BART (lezing van onnodig wisselen)");
  });
  reg("E2-5 score doelmatigheid: 3 als G2 vóór de eerste voorschrijfkaart, anders 2", function (e) {
    var r = e.score.doelmatigheid.regels;
    T.is(r.length, 2);
    T.gelijk(r.map(function (x) { return x.punten; }), [3, 2]);
    T.gelijk(r[1].als, { p: "waarheid", waarde: true });
    var tekst = s(r[0].als);
    T.waar(tekst.indexOf('"G2"') >= 0, "regel 1 gaat over G2");
    VOORSCHRIJF.forEach(function (v) { T.waar(tekst.indexOf('"' + v + '"') >= 0, "regel 1 noemt " + v); });
    T.waar(r[0].als.p === "en" && r[0].als.args[0].p === "gespeeld" && r[0].als.args[0].kaart === "G2", "regel 1 vereist G2 gespeeld");
    T.gelijk(r[0].als, { p: "en", args: [{ p: "gespeeld", kaart: "G2" }, { p: "niet", arg: { p: "of", args: VOORSCHRIJF.map(function (v) {
      return { p: "en", args: [{ p: "gespeeld", kaart: v }, { p: "niet", arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: v } } }] };
    }) } }] }, "regel 1: G2 gespeeld en geen voorschrijfkaart zonder G2 ervoor (voor(G2,Vx) in alle vijf de armen, juiste richting)");
  });
  reg("E2-5 profielen: Kweekgestuurd, smal / Bijgestuurd, reflectievraag null + TODO_BART", function (e) {
    T.gelijk(e.profielen.map(function (p) { return p.naam; }), ["Kweekgestuurd, smal", "Bijgestuurd"]);
    e.profielen.forEach(function (p) {
      T.is(p.reflectievraag, null, p.naam + ": de casus geeft in episode 2 geen reflectievraag");
      T.waar(typeof p.TODO_BART === "string", p.naam + " heeft TODO_BART op de plek zelf");
    });
    T.gelijk(e.profielen[0].als, { p: "en", args: [{ p: "gespeeld", kaart: "V4" }, { p: "nietGespeeld", kaart: "B1" }] });
    T.gelijk(e.profielen[1].als, { p: "en", args: [{ p: "gespeeld", kaart: "V5" }, { p: "gespeeld", kaart: "B1" }, { p: "na", a: { kaart: "B1" }, b: { kaart: "V5" } }] });
  });

  /* ---------- feedbackExtra en zichtbaarAlsOntbreekt ---------- */
  reg("E2-3 feedbackExtra: Verouderde eGFR niet opgemerkt en Onnodig gewisseld, met triggers", function (e) {
    T.is(e.feedbackExtra.length, 2);
    var f = e.feedbackExtra;
    T.is(f[0].vraag, "Hoe oud was de eGFR waarop je besloot? Wat is er sindsdien met haar gebeurd?");
    T.is(f[1].vraag, "Het werkte en de klachten namen af. Wat won je met wisselen?");
    f.forEach(function (x) { T.is(x.wanneer, "alleenBijGehaaldePoort"); T.waar(typeof x.TODO_BART === "string"); });
    // Verouderde eGFR: een voorschrijfkaart (V1-V5) zonder G2 vooraf.
    T.is(f[0].trigger.p, "of");
    T.is(f[0].trigger.args.length, 5);
    VOORSCHRIJF.forEach(function (v, k) {
      T.gelijk(f[0].trigger.args[k], { p: "en", args: [{ p: "gespeeld", kaart: v }, { p: "niet", arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: v } } }] });
    });
    // Onnodig gewisseld: dezelfde teller als de score.
    T.gelijk(f[1].trigger, { p: "tel", teller: { t: "gespeeld", kaart: "B1", terwijlKlachten: "af" }, op: ">", waarde: 0 });
    T.gelijk(f[1].trigger.teller, e.score.duurzaamheid.regels[0].perKeer, "feedback en score gebruiken dezelfde definitie van onnodig wisselen");
  });
  reg("E2-3 zichtbaarAlsOntbreekt (nitrofurantoïne zonder G2, V5 zonder O2) letterlijk", function (e) {
    var z = e.zichtbaarAlsOntbreekt;
    T.is(z.length, 2);
    T.gelijk(z[0].trigger, { p: "en", args: [{ p: "gestart", middel: "V3" }, { p: "nietGespeeld", kaart: "G2" }] });
    T.is(z[0].tekst, "De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.");
    T.gelijk(z[1].trigger, { p: "en", args: [{ p: "gestart", middel: "V5" }, { p: "nietGespeeld", kaart: "O2" }] });
    T.is(z[1].tekst, "De kaliumspiegel is onbekend.");
  });
  reg("E2-5 brug naar episode 3 letterlijk", function (e) {
    T.is(e.meta.brug, "de kweek uit deze episode is het verborgen gegeven in episode 3 (G3).");
    T.waar(e.brug === undefined, "de brug is een ontwerpnoot en hoort onder meta");
  });

  /* ---------- S-LETTER, lat 2, S-TODO ---------- */
  reg("S-LETTER: geen markdown-sterretjes en geen dubbele/rare spaties in de data", function (e) {
    alleStrings(e, [], "E2").forEach(function (x) {
      T.waar(x.s.indexOf("**") < 0, "markdown ** in " + x.pad);
      T.waar(x.s === x.s.trim(), "spatie aan rand in " + x.pad);
      T.waar(x.s.indexOf("  ") < 0, "dubbele spatie in " + x.pad);
      T.waar(x.s.indexOf("\n") < 0, "regeleinde in " + x.pad);
    });
  });
  reg("S-LETTER: speciale tekens zoals in de casus (ï, é, —, –, ≥) niet vervangen door ASCII-varianten", function (e) {
    var alles = alleStrings(e, [], "E2").map(function (x) { return x.s; }).join("\n");
    T.waar(alles.indexOf("nitrofurantoine") < 0, "nitrofurantoine zonder trema");
    T.waar(alles.indexOf("wél") >= 0, "'wél' met accent (I6-vraag)");
    T.waar(alles.indexOf("Episode 2 — level 2") >= 0, "gedachtestreep in de titel");
    T.waar(alles.indexOf("2–4 dagen") >= 0, "n-streepje in 2–4");
    T.waar(alles.indexOf(" -- ") < 0 && alles.indexOf("...") < 0, "ASCII-vervangers van streepjes of beletselteken");
  });
  reg("D2/D3: de zichtbare tekst bevat geen hint, aanbeveling of timing", function (e) {
    var zichtbaar = s([e.patient.zichtbaar, e.patient.verborgen.map(function (v) { return v.onthult; }), e.gebeurtenissen.map(function (x) { return x.tekst; })]).toLowerCase();
    ["aanbevolen", "eerste keus", "beste", "moet ", "zou je", "tip"].forEach(function (w) { T.waar(zichtbaar.indexOf(w) < 0, "hint in zichtbare tekst: " + w); });
  });
  reg("S-TODO: elke TODO_BART-markering in E2 staat ook in casus.todoBart (id, vraag, gekozenLezing, plek)", function (e) {
    var lijst = casus().todoBart || [];
    var mijn = lijst.filter(function (t) { return /^TODO_BART-E2-/.test(t.id); });
    T.waar(mijn.length >= 10, "verwacht minstens 10 E2-TODO's, kreeg " + mijn.length);
    mijn.forEach(function (t) {
      ["id", "vraag", "gekozenLezing", "plek"].forEach(function (k) { T.waar(typeof t[k] === "string" && t[k].length > 0, t.id + " mist " + k); });
    });
    var ids = mijn.map(function (t) { return t.id; });
    T.is(ids.filter(function (v, i) { return ids.indexOf(v) === i; }).length, ids.length, "dubbele TODO-ids");
    var vragen = lijst.map(function (t) { return t.vraag; });
    var markeringen = [];
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]"); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { if (k.indexOf("TODO_BART") === 0) markeringen.push({ pad: pad, v: x[k] }); else walk(x[k], pad + "." + k); });
    })(e, "E2");
    T.waar(markeringen.length >= 10, "te weinig TODO_BART-markeringen in de data: " + markeringen.length);
    markeringen.forEach(function (m) { T.waar(vragen.indexOf(m.v) >= 0, "TODO_BART op " + m.pad + " staat niet in casus.todoBart: " + m.v); });
    // Omgekeerd: elke E2-TODO is op de plek zelf gemarkeerd.
    var gemarkeerd = markeringen.map(function (m) { return m.v; });
    mijn.forEach(function (t) { T.waar(gemarkeerd.indexOf(t.vraag) >= 0, t.id + " staat niet als TODO_BART op de plek zelf in de data"); });
  });
  reg("S-TODO: de gedeelde casus-onduidelijkheden zijn gemeld (dag-lezing I7, grens I8, kweek-doorlooptijd, ontbrekende reflectievragen)", function (e) {
    var tekst = JSON.stringify((casus().todoBart || []).filter(function (t) { return /^TODO_BART-E2-/.test(t.id); })).toLowerCase();
    ["o2 (dag 2–4)", "hoe streng de grens", "mistral", "reflectievraag", "risicogroep"].forEach(function (w) { T.waar(tekst.indexOf(w) >= 0, "TODO over '" + w + "' ontbreekt"); });
  });


  /* ---------- sleutels, TODO's en routes (Engine + Predicaten, zonder Evaluatie) ---------- */
  reg("S-LETTER: patient.zichtbaar bevat alleen casus-sleutels; niet-casus-sleutels staan onder meta of TODO_BART", function (e) {
    T.gelijk(Object.keys(e.patient.zichtbaar).sort(), ["eerdereUWI", "kop", "klachten", "lab", "labTekst", "leeftijd", "leeftijdTekst", "medicatie", "medicatieTekst", "naam"].sort());
    T.gelijk(Object.keys(e.patient).sort(), ["medicatie", "meta", "verborgen", "waar", "zichtbaar"]);
    T.waar(e.ontwerpnoot === undefined && e.patient.ontwerpnoot === undefined, "ontwerpnoot is verzonnen tekst");
    T.gelijk(e.patient.meta, { medicatieNoot: "afleider, bereidt episode 3 voor" });
    e.patient.verborgen.forEach(function (v) { T.waar(v.toelichting === undefined, "toelichting hoort onder meta"); });
    T.gelijk(Object.keys(e).sort(), ["afrondenPasNaGebeurtenissen", "antibiotica", "escalatie", "feedbackExtra", "gebeurtenissen", "id", "invarianten", "knoppen", "level", "meta", "patient", "profielen", "repertoire", "score", "startToestanden", "startUitleg", "statusTeksten", "titel", "werkzaamheid", "zichtbaarAlsOntbreekt"]);
  });
  reg("S-TODO: de drie extra onduidelijkheden zijn gemeld (route zonder antibioticum, vroeg afronden vs I8, I7 bij vroege wissel) en de dag-lezing noemt beide lezingen", function (e) {
    var lijst = casus().todoBart.filter(function (t) { return /^TODO_BART-E2-/.test(t.id); });
    function vind(w) { return lijst.filter(function (t) { return t.vraag.toLowerCase().indexOf(w) >= 0; }); }
    T.is(vind("zonder enig antibioticum").length, 1);
    T.is(vind("vroeg afronden").length, 1);
    T.is(vind("al vóór dag 3 is vervangen").length, 1);
    T.is(vind("afronden pas na de gebeurtenissen").length, 1);
    var dag = vind("o2 (dag 2–4)")[0];
    T.waar(dag && dag.vraag.indexOf("Lezing A") >= 0 && dag.vraag.indexOf("Lezing B") >= 0, "beide dag-lezingen staan in de vraag aan Bart");
    T.waar(dag.vraag.indexOf("verschil 2 t/m 4") >= 0 && dag.vraag.indexOf("verschil 1 t/m 3") >= 0, "beide verschillen genoemd");
    T.waar(e.open === undefined, "geen eigen 'open'-vorm: open vragen staan alleen in casus.todoBart (zoals E1/E3)");
    T.is(vind("ernst-volgorde").length, 1);
    T.is(vind("weggelaten kaarten").length, 1);
    var tekstLijst = JSON.stringify(lijst);
    T.waar(tekstLijst.indexOf("voorstel van Claude") >= 0 && tekstLijst.indexOf("niet door Bart bevestigd") >= 0, "ernst-volgorde is als voorstel van Claude gemeld");
    T.waar(lijst.filter(function (t) { return t.plek === "E2.invarianten[].weglaatDownside"; })[0].gekozenLezing.indexOf("Geen terugkoppeling voor weggelaten kaarten") === 0, "gekozen lezing: geen weglaatDownside");
    e.invarianten.forEach(function (i) { T.waar(i.weglaatDownside === undefined, "weglaatDownside op " + i.id); });
    // Bart heeft geen contract, rapporten of rondes: TODO-teksten moeten zelfstandig leesbaar zijn.
    var VERBODEN = /contract|rapport|bouwopdracht|\bronde\b|\bLEAD\b|\bS\d+\b|TODO_BART-\d|\bparameter\b|afrondenPasNa|weglaatDownside|vraagVarianten/i;
    lijst.forEach(function (t) { ["vraag", "gekozenLezing"].forEach(function (k) { T.waar(!VERBODEN.test(t[k]), t.id + "." + k + " verwijst naar iets dat Bart niet heeft: " + (t[k].match(VERBODEN) || [""])[0]); }); });
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]"); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) {
        if (k.indexOf("TODO_BART") === 0) T.waar(!VERBODEN.test(x[k]), pad + "." + k + " verwijst naar iets dat Bart niet heeft");
        else walk(x[k], pad + "." + k);
      });
    })(e, "E2");
  });

  // Speelt een route: elke 'dag' is een lijst [kaart, doel, optie]; tussen de dagen volgendeDag.
  // I7-routes: zonder kweekuitslag, zodat I8 het kalium-/halveren-gedrag niet overlapt (de timing van C wordt apart getoetst).
  var zonderKweek = null;
  function routeI7(dagen) {
    if (!zonderKweek) { zonderKweek = JSON.parse(JSON.stringify(g.Test.oudeRegels())); zonderKweek.episodes.forEach(function (x) { if (x.id === "E2") x.gebeurtenissen = []; }); }
    return route(dagen, zonderKweek);
  }
  function route(dagen, casusData) {
    var st = g.Engine.nieuwSpel(casusData || g.Test.oudeRegels(), "E2", { rng: function () { return 0; } });
    dagen.forEach(function (kaarten, d) {
      if (d > 0) g.Engine.volgendeDag(st);
      kaarten.forEach(function (k) {
        var r = g.Engine.speelKaart(st, k[0], { doel: k[1] || null, optie: k[2] || null });
        T.waar(r.ok, "kaart " + k[0] + " op dag " + (d + 1) + " mislukt: " + r.fout);
      });
    });
    return st;
  }
  // De echte Evaluatie (regels/evaluatie.js): geschonden ids (op ernst) en de gekozen vraag van de ernstigste. De state draagt zijn eigen casusdata.
  function schending(st, e) {
    var u = g.Evaluatie.beoordeel(st._casus || casus(), "E2", st);
    return { ids: u.geschonden.map(function (i) { return i.id; }), vraag: u.vraag };
  }
  var VR_KWEEK = "Wat vertelt een kweek van urine die al antibioticum heeft gezien?";
  var VR_AFW = "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?";
  var VR_KALIUM = "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?";
  var VR_HALVEREN = "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?";
  // Route- en samenwerkingstests mogen NOOIT leeg slagen: ontbreekt of laadt een laag niet, dan is de test rood.
  function vereisEngine() {
    T.waar(g.Predicaten && typeof g.Predicaten.evalueer === "function" && typeof g.Predicaten.maakContext === "function", "Predicaten (regels/predicaten.js) is niet geladen: de route- en compat-tests kunnen niets controleren");
    T.waar(g.Engine && typeof g.Engine.nieuwSpel === "function" && typeof g.Engine.speelKaart === "function", "Engine (engine/engine.js) is niet geladen: de route- en compat-tests kunnen niets controleren");
    T.waar(bibliotheek(), "de kaartenbibliotheek (casussen/uwi.js, casus.kaarten) is niet geladen of leeg: de route- en compat-tests kunnen niets controleren");
  }

  reg("E2-route (I7, contract TODO_BART-1): de casusroute V5 dag 1 + O2 dag 2 + V6 halveren dag 4 slaagt", function (e) {
    vereisEngine();
    var st = route([[["G2"], ["O1"], ["V5"]], [["O2"], ["N1"]], [["B1", "V4"]], [["V6", "V5", "halveren"]]]);
    T.gelijk(schending(st, e).ids, []);
  });
  reg("E2-route (I7): O2 op verschil 3 (dag 4) slaagt nog; O2 op verschil 4 (dag 5) en O2 vóór V5 (verschil −1) falen met de kalium-vraag", function (e) {
    vereisEngine();
    function mijn(o2dag) {
      // V5 blijft actief tot dag 4: de 7-daagse kuur, dus de kaliumcontrole telt (casus 1.2). Wisseling op dag 4: geen halveren nodig.
      var dagen = [[["G2"], ["O1"], ["V5"]], [["N1"]], [], [["B1", "V4"]], []];
      dagen[o2dag - 1].push(["O2"]);
      return schending(routeI7(dagen), e);
    }
    T.gelijk(mijn(4).ids, []);
    T.gelijk(mijn(5).ids, ["I7"]); T.is(mijn(5).vraag, VR_KALIUM);
    var nul = routeI7([[["G2"], ["O1"], ["O2"]], [["V5"], ["N1"]], [], [], [["B1", "V4"]]]);
    T.gelijk(schending(nul, e).ids, ["I7"]);
    // Casus 1.2: wie trimethoprim op dag 3 vervangt (geen 7-daagse kuur), krijgt geen schending, ook zonder O2 en zonder halveren.
    var vroegWissel = routeI7([[["G2"], ["O1"], ["V5"]], [["N1"]], [["B1", "V4"]]]);
    T.gelijk(schending(vroegWissel, e).ids, [], "wissel op dag 3");
    var vroegStop = routeI7([[["G2"], ["O1"], ["V5"]], [["N1"]], [["B2", "V5"]]]);
    T.gelijk(schending(vroegStop, e).ids, [], "stoppen op dag 3");
  });
  reg("E2-route (I7): V6 halveren op verschil 2 (dag 3) of 'verdubbelen' faalt met de halveren-vraag; zonder beide eerst de kalium-vraag", function (e) {
    vereisEngine();
    var vroeg = routeI7([[["G2"], ["O1"], ["V5"]], [["O2"], ["N1"]], [["V6", "V5", "halveren"]], [], [["B1", "V4"]]]);
    var s1 = schending(vroeg, e); T.gelijk(s1.ids, ["I7"]); T.is(s1.vraag, VR_HALVEREN);
    var geen = routeI7([[["G2"], ["O1"], ["V5"]], [["O2"], ["N1"]], [], [], [["B1", "V4"]]]);
    var s2 = schending(geen, e); T.gelijk(s2.ids, ["I7"]); T.is(s2.vraag, VR_HALVEREN);
    var niets = routeI7([[["G2"], ["O1"], ["V5"]], [["N1"]], [], [], [["B1", "V4"]]]);
    var s3 = schending(niets, e); T.gelijk(s3.ids, ["I7"]); T.is(s3.vraag, VR_KALIUM);
  });
  reg("E2-route (I6): vraagkeuze geen kweek vs afwachten en route zonder antibioticum", function (e) {
    vereisEngine();
    var gk = schending(route([[["G2"], ["V4"]], [["N1"]]]), e); T.gelijk(gk.ids, ["I6"]); T.is(gk.vraag, VR_KWEEK);
    var afw = schending(route([[["G2"], ["O1"], ["V1"]], [["N1"]]]), e); T.gelijk(afw.ids, ["I6"]); T.is(afw.vraag, VR_AFW);
    var v2 = schending(route([[["G2"], ["O1"], ["V2"]], [["N1"]]]), e); T.gelijk(v2.ids, ["I6"]); T.is(v2.vraag, VR_AFW);
    var geen = schending(route([[["G2"], ["O1"], ["N1"]]]), e); T.gelijk(geen.ids, ["I6"]); T.is(geen.vraag, VR_AFW);
    var goed = schending(route([[["G2"], ["O1"], ["V4"]], [["N1"], ["N2", "V4"]]]), e); T.gelijk(goed.ids, []);
  });
  reg("E2-route (A3): geldige routes halen de poort; foutroutes schenden precies de bedoelde invariant", function (e) {
    vereisEngine();
    T.gelijk(schending(route([[["G2"], ["O1"], ["V4"]], [["N1"], ["N2", "V4"]]]), e).ids, [], "fosfomycine");
    T.gelijk(schending(route([[["G2"], ["O1"], ["V5"]], [["O2"], ["N1"]], [["B1", "V4"]], [["V6", "V5", "halveren"]]]), e).ids, [], "trimethoprim + O2 + V6 + wissel");
    T.gelijk(schending(route([[["G2"], ["O1"], ["V4"]]]), e).ids, ["I1"], "geen N1");
    T.gelijk(schending(route([[["G2"], ["O1"], ["V3"]], [["N1"]]]), e).ids, ["I5"], "nitrofurantoïne");
    T.gelijk(schending(route([[["G2"], ["O1"], ["V4"]], [["V5"], ["N1"]], [["O2"]], [], [["V6", "V5", "halveren"]]]), e).ids, ["I4"], "twee antibiotica");
  });
  var VR_I8 = "De kweek is binnen en de klachten blijven. Waar wacht je nog op?";
  // C verschijnt op dag 3 (4e kaart = O2 op dag 2, O1 gespeeld); V6 halveren op dag 4 houdt I7 buiten beeld.
  function i8(dag3, dag4, dag5) { return route([[["G2"], ["O1"], ["V5"]], [["O2"], ["N1"]], dag3, [["V6", "V5", "halveren"]].concat(dag4), dag5 || [], []]); }
  reg("E2-route (I8): V5 blijft actief na de kweekuitslag C: precies I8 met de I8-vraag", function (e) {
    vereisEngine();
    var st = i8([["Ev1"]], []);
    T.is(st.gebeurtenissen.filter(function (b) { return b.id === "C"; })[0].dag, 3, "C komt op dag 3");
    var r = schending(st, e); T.gelijk(r.ids, ["I8"]); T.is(r.vraag, VR_I8);
  });
  reg("E2-route (I8, rand van het venster): wissel naar V4 op dag C (3) of dag C+1 (4) slaagt; op dag C+2 (5) faalt; V5 stoppen op dag 4 slaagt", function (e) {
    vereisEngine();
    T.gelijk(schending(i8([["B1", "V4"]], []), e).ids, [], "B1 op dag 3");
    T.gelijk(schending(i8([], [["B1", "V4"]]), e).ids, [], "B1 op dag 4");
    var laat = schending(i8([], [], [["B1", "V4"]]), e); T.gelijk(laat.ids, ["I8"], "B1 op dag 5"); T.is(laat.vraag, VR_I8);
    T.gelijk(schending(i8([], [["B2", "V5"]]), e).ids, [], "B2 op V5 op dag 4");
    T.gelijk(schending(i8([["B2", "V5"]], []), e).ids, [], "B2 op V5 op dag 3");
  });
  reg("E2-route (I8): fosfomycine met kweekuitslag C schendt I8 niet", function (e) {
    vereisEngine();
    var st = route([[["G2"], ["O1"], ["V4"]], [["N1"], ["N2", "V4"]], [["Ev1"]], []]);
    T.waar(st.gebeurtenissen.some(function (b) { return b.id === "C"; }), "C moet geweest zijn");
    T.gelijk(schending(st, e).ids, []);
  });
  reg("E2-route (I7, rand): O2 op dezelfde dag als V5 (verschil 0) faalt met de kalium-vraag; op de dag erna slaagt", function (e) {
    vereisEngine();
    var zelfde = schending(routeI7([[["G2"], ["O1"], ["N1"]], [["V5"], ["O2"]], [], [], [["V6", "V5", "halveren"]], [["B1", "V4"]]]), e);
    T.gelijk(zelfde.ids, ["I7"]); T.is(zelfde.vraag, VR_KALIUM);
    T.gelijk(schending(routeI7([[["G2"], ["O1"], ["N1"]], [["V5"]], [["O2"]], [], [["V6", "V5", "halveren"]], [["B1", "V4"]]]), e).ids, [], "O2 een dag na V5");
  });
  reg("E2-route (I7): V6 op V5 met een andere optie dan halveren, of halveren op een ander doel (lisinopril), telt niet: halveren-vraag", function (e) {
    vereisEngine();
    ["verdubbelen", "interval 48 uur"].forEach(function (optie) {
      var r = schending(routeI7([[["G2"], ["O1"], ["V5"]], [["O2"], ["N1"]], [], [["V6", "V5", optie]], [["B1", "V4"]]]), e);
      T.gelijk(r.ids, ["I7"], "V6 " + optie); T.is(r.vraag, VR_HALVEREN, "V6 " + optie);
    });
    var anders = schending(routeI7([[["G2"], ["O1"], ["V5"]], [["O2"], ["N1"]], [], [["V6", "lisinopril", "halveren"]], [["B1", "V4"]]]), e);
    T.gelijk(anders.ids, ["I7"], "V6 halveren op lisinopril"); T.is(anders.vraag, VR_HALVEREN);
    var goed = schending(routeI7([[["G2"], ["O1"], ["V5"]], [["O2"], ["N1"]], [], [["V6", "lisinopril", "halveren"], ["V6", "V5", "halveren"]], [["B1", "V4"]]]), e);
    T.gelijk(goed.ids, [], "V6 op lisinopril ernaast verstoort de V5-eis niet");
  });
  reg("E2-route (A5): regels rekenen met de ware eGFR 29, ook zonder G2", function (e) {
    vereisEngine();
    T.gelijk(schending(route([[["O1"], ["V3"], ["N1"]]]), e).ids, ["I5"]);
  });

  reg("E2-route (I5, wissel als start): V4 dag 1, dag 2 B1 naar V3 (nitrofurantoïne) schendt precies I5", function (e) {
    vereisEngine();
    var r = schending(route([[["G2"], ["O1"], ["V4"]], [["N1"], ["B1", "V3"]]]), e);
    T.gelijk(r.ids, ["I5"]);
    T.is(r.vraag, "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?");
  });
  reg("E2-route (I7, anker via wissel): trimethoprim gestart via B1 naar V5 telt als start: O2 + V6 halveren op tijd slaagt", function (e) {
    vereisEngine();
    var goed = routeI7([[["G2"], ["O1"], ["V4"]], [["N1"], ["B1", "V5"]], [["O2"]], [], [["V6", "V5", "halveren"]], [["B1", "V4"]]]);
    T.gelijk(schending(goed, e).ids, [], "B1 naar V5 op dag 2, O2 dag 3, V6 halveren dag 5");
  });
  reg("E2-route (I7, anker via wissel): zonder O2 na een start via B1 naar V5 schendt precies I7 met de kalium-vraag", function (e) {
    vereisEngine();
    var r = schending(routeI7([[["G2"], ["O1"], ["V4"]], [["N1"], ["B1", "V5"]], [], [], [["V6", "V5", "halveren"]], [["B1", "V4"]]]), e);
    T.gelijk(r.ids, ["I7"]); T.is(r.vraag, VR_KALIUM);
  });
  reg("E2-route (I7, anker via wissel): O2 op dezelfde dag als de wissel naar V5 (verschil 0) schendt precies I7", function (e) {
    vereisEngine();
    var r = schending(route([[["G2"], ["O1"], ["V4"]], [["N1"], ["B1", "V5"], ["O2"]]]), e);
    T.gelijk(r.ids, ["I7"]); T.is(r.vraag, VR_KALIUM);
  });
  /* ---------- extra routetests: V3 in I4, I4 per moment, O2 zonder V5, B1 als start, score en triggers ---------- */
  var DAG1 = [["G2"], ["O1"]];
  function dag1(k) { return DAG1.concat([k]); }
  reg("E2-route (I4): nitrofurantoïne (V3, eerste in de antibioticalijst) telt mee als actief antibioticum: V3 + V4 schendt I4 én I5, de I5-vraag wint", function (e) {
    vereisEngine();
    var r = schending(route([dag1(["V3"]), [["N1"], ["V4"]]]), e);
    T.gelijk(r.ids, ["I5", "I4"]);
    T.is(r.vraag, "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?");
    T.gelijk(schending(route([dag1(["V4"]), [["N1"], ["V3"]]]), e).ids, ["I5", "I4"], "V3 als tweede middel");
  });
  reg("E2-route (I4, op enig moment): twee antibiotica tegelijk blijft een schending ook als er daarna één wordt gestopt", function (e) {
    vereisEngine();
    // V4 dag 1, V5 dag 2 (twee actief), dag 3 V5 gestopt (B2), dag 5 V6 halveren: aan het eind nog één antibioticum.
    var r = schending(route([dag1(["V4"]), [["N1"], ["V5"]], [["O2"], ["B2", "V5"]], [], [["V6", "V5", "halveren"]]]), e);
    T.gelijk(r.ids, ["I4"]);
    T.is(r.vraag, "Wat lost het tweede middel op dat het eerste niet oplost?");
    // Tegenproef: eerst V5 stoppen en dan pas een ander middel starten is geen tweede middel op hetzelfde moment.
    T.gelijk(schending(route([dag1(["V5"]), [["O2"], ["N1"]], [["B1", "V4"]], [["V6", "V5", "halveren"]]]), e).ids, [], "wissel (B1) is geen tweede middel");
  });
  reg("E2-route (I7, geen crash): O2 zonder dat V5 ooit gespeeld is, bij fosfomycine, is een geldige route", function (e) {
    vereisEngine();
    var st = route([dag1(["V4"]), [["N1"], ["O2"]], [["Ev1"]]]);
    T.gelijk(schending(st, e).ids, []);
    T.waar(st.gebeurtenissen.some(function (b) { return b.id === "C"; }), "C moet geweest zijn");
    // De predicaten die op V5 ankeren geven false (geen fout) zonder V5.
    var ctx = g.Predicaten.maakContext(casus(), e, st);
    T.is(g.Predicaten.evalueer(vindInv(e, "I7").predicaat, ctx), false);
    vindInv(e, "I7").vraagVarianten.forEach(function (v) { T.is(typeof g.Predicaten.evalueer(v.als, ctx), "boolean"); });
  });
  reg("E2-route (I8, wissel als start): V4, dan B1 naar V5, V5 blijft na C actief: precies I8; wissel terug naar V4 op tijd slaagt", function (e) {
    vereisEngine();
    // Dag 2 B1 naar V5, O2 dag 3, C verschijnt dag 3; op dag 5 (C+2) V6 halveren en pas dan terug naar V4: te laat.
    var laat = schending(route([dag1(["V4"]), [["N1"], ["B1", "V5"]], [["O2"]], [], [["V6", "V5", "halveren"], ["B1", "V4"]]]), e);
    T.gelijk(laat.ids, ["I8"]); T.is(laat.vraag, VR_I8);
    var op = schending(route([dag1(["V4"]), [["N1"], ["B1", "V5"]], [["O2"], ["B1", "V4"]], [], [["V6", "V5", "halveren"]]]), e);
    T.gelijk(op.ids, [], "B1 terug naar V4 op de dag van de uitslag");
  });
  reg("E2-route (I6, wissel als start): fosfomycine zonder O1 vooraf (G2, V4, daarna O1) gevolgd door een wissel naar V5 en terug schendt precies I6 met de kweek-vraag", function (e) {
    vereisEngine();
    var r = schending(route([[["G2"], ["V4"], ["O1"]], [["N1"], ["B1", "V5"]], [["O2"], ["B1", "V4"]], [], [["V6", "V5", "halveren"]]]), e);
    T.gelijk(r.ids, ["I6"]); T.is(r.vraag, VR_KWEEK);
    // Met O1 vooraf is dezelfde route geldig.
    T.gelijk(schending(route([dag1(["V4"]), [["N1"], ["B1", "V5"]], [["O2"], ["B1", "V4"]], [], [["V6", "V5", "halveren"]]]), e).ids, [], "zelfde route met O1 vooraf");
  });

  // Onafhankelijke oracle (EIGEN uitwerking uit de casus, bewust zonder Predicaten): klachtenstatus en onnodige wissels rechtstreeks uit de tijdlijn.
  // Wie een route kiest, ziet: een wissel (B1) op een dag waarop de klachten afnemen (werkzaam middel V4 aan het eind van de vorige dag) kost een punt.
  function oracleOnnodig(st) {
    var ACT = ["V3", "V4", "V5"], actief = [], dagen = {}, onnodig = 0;
    function status(d) { // aan het einde van dag d-1
      var a = actief.filter(function (x) { return x.einde === undefined; });
      return a.length ? (a.some(function (x) { return x.m === "V4"; }) ? "af" : "aan") : null;
    }
    var maxDag = 0; st.tijdlijn.forEach(function (r) { maxDag = Math.max(maxDag, r.dag); });
    for (var d = 1; d <= maxDag; d++) {
      var voor = status(d);
      st.tijdlijn.filter(function (r) { return r.dag === d; }).forEach(function (r) {
        if (ACT.indexOf(r.kaart) >= 0) actief.push({ m: r.kaart });
        if (r.kaart === "B1" && ACT.indexOf(r.doel) >= 0) {
          if (voor === "af") onnodig++;
          actief.forEach(function (x) { if (x.einde === undefined) x.einde = d; });
          actief.push({ m: r.doel });
        }
        if (r.kaart === "B2") actief.forEach(function (x) { if (x.m === r.doel && x.einde === undefined) x.einde = d; });
      });
    }
    return onnodig;
  }
  function duurzaamheid(st, e) {
    var ctx = g.Predicaten.maakContext(casus(), e, st), w = e.score.duurzaamheid.start;
    e.score.duurzaamheid.regels.forEach(function (r) { w += r.delta * g.Predicaten.tel(r.perKeer, ctx); });
    return w;
  }
  function doelmatigheid(st, e) {
    var ctx = g.Predicaten.maakContext(casus(), e, st), pt = null;
    e.score.doelmatigheid.regels.some(function (r) { if (g.Predicaten.evalueer(r.als, ctx)) { pt = r.punten; return true; } return false; });
    return pt;
  }
  function triggers(st, e) {
    var ctx = g.Predicaten.maakContext(casus(), e, st);
    return {
      profielen: e.profielen.filter(function (p) { return g.Predicaten.evalueer(p.als, ctx); }).map(function (p) { return p.naam; }),
      feedback: e.feedbackExtra.filter(function (f) { return g.Predicaten.evalueer(f.trigger, ctx); }).map(function (f) { return f.vraag.slice(0, 12); }),
      zichtbaar: e.zichtbaarAlsOntbreekt.filter(function (z) { return g.Predicaten.evalueer(z.trigger, ctx); }).map(function (z) { return z.tekst.slice(0, 12); })
    };
  }
  var R_AF = function () { return route([dag1(["V4"]), [["N1"], ["B1", "V5"]]]); };                 // V4 werkt (af), dan wissel: onnodig
  reg("E2-5 score duurzaamheid (route): een wissel terwijl de klachten afnemen kost 1 punt (3 -> 2); wissel terwijl de klachten aanhouden of zonder wissel kost niets", function (e) {
    vereisEngine();
    var onnodig = R_AF();
    T.is(g.Predicaten.tel(e.score.duurzaamheid.regels[0].perKeer, g.Predicaten.maakContext(casus(), e, onnodig)), 1, "tel: onnodige wissel");
    T.is(duurzaamheid(onnodig, e), 2);
    var terecht = route([dag1(["V5"]), [["O2"], ["N1"]], [["B1", "V4"]]]);   // V5 werkt niet (aan), wissel is terecht
    T.is(g.Predicaten.tel(e.score.duurzaamheid.regels[0].perKeer, g.Predicaten.maakContext(casus(), e, terecht)), 0, "tel: terechte wissel");
    T.is(duurzaamheid(terecht, e), 3);
    var geen = route([dag1(["V4"]), [["N1"], ["N2", "V4"]]]);
    T.is(duurzaamheid(geen, e), 3);
    // Twee onnodige wissels (V4 -> V5 -> V4 terwijl het eerste en tweede middel werkt: tweede wissel is op 'aan', dus alleen de eerste telt)
    var twee = route([dag1(["V4"]), [["N1"], ["B1", "V5"]], [["O2"], ["B1", "V4"]]]);
    T.is(duurzaamheid(twee, e), 2, "alleen de wissel vanuit 'af' telt");
  });
  reg("E2-5 score (oracle): onnodige wissels en doelmatigheid uit een eigen berekening gelijk aan de data, op een reeks routes", function (e) {
    vereisEngine();
    var routes = [
      [dag1(["V4"]), [["N1"], ["B1", "V5"]]],
      [dag1(["V5"]), [["O2"], ["N1"]], [["B1", "V4"]]],
      [dag1(["V4"]), [["N1"], ["N2", "V4"]]],
      [dag1(["V4"]), [["N1"], ["B1", "V5"]], [["O2"], ["B1", "V4"]]],
      [dag1(["V4"]), [["N1"], ["B1", "V3"]], [["B1", "V4"]]],
      [dag1(["V3"]), [["N1"], ["B1", "V4"]], [["B1", "V5"]]],
      [[["O1"], ["V4"], ["G2"]], [["N1"]]],
      [[["V4"], ["G2"], ["O1"]], [["N1"]]]
    ];
    routes.forEach(function (r, k) {
      var st = route(r), mijn = oracleOnnodig(st);
      T.is(g.Predicaten.tel(e.score.duurzaamheid.regels[0].perKeer, g.Predicaten.maakContext(casus(), e, st)), mijn, "route " + k + ": onnodige wissels");
      T.is(duurzaamheid(st, e), 3 - mijn, "route " + k + ": duurzaamheid");
    });
    // Doelmatigheid: 3 alleen als G2 vóór de eerste voorschrijfkaart (V1-V5) ligt, anders 2 (ook zonder G2).
    T.is(doelmatigheid(route([dag1(["V4"]), [["N1"]]]), e), 3, "G2 vóór V4");
    T.is(doelmatigheid(route([[["O1"], ["V4"], ["G2"]], [["N1"]]]), e), 2, "G2 ná V4");
    T.is(doelmatigheid(route([[["O1"], ["V4"]], [["N1"]]]), e), 2, "geen G2");
    T.is(doelmatigheid(route([[["G2"], ["O1"], ["N1"]]]), e), 3, "G2, geen voorschrijfkaart");
    T.is(doelmatigheid(route([[["G2"], ["V5"], ["O1"]], [["N1"]]]), e), 3, "G2 vóór V5, O1 daarna (kweek is geen voorschrijfkaart)");
    T.is(doelmatigheid(route([[["G2"], ["O1"], ["V4"]], [["N1"], ["V3"]]]), e), 3, "G2 vóór beide middelen");
  });
  reg("E2-5 profielen (route): Kweekgestuurd, smal bij V4 zonder wissel; Bijgestuurd bij V5 gevolgd door B1; anders geen profiel", function (e) {
    vereisEngine();
    T.gelijk(triggers(route([dag1(["V4"]), [["N1"], ["N2", "V4"]]]), e).profielen, ["Kweekgestuurd, smal"]);
    T.gelijk(triggers(route([dag1(["V5"]), [["O2"], ["N1"]], [["B1", "V4"]], [["V6", "V5", "halveren"]]]), e).profielen, ["Bijgestuurd"]);
    T.gelijk(triggers(route([dag1(["V4"]), [["N1"], ["B1", "V5"]]]), e).profielen, [], "V4 met wissel naar V5: geen van beide");
    T.gelijk(triggers(route([dag1(["V5"]), [["O2"], ["N1"]], [["B2", "V5"]]]), e).profielen, [], "trimethoprim, stoppen zonder wissel: geen profiel (TODO_BART-E2-10)");
    T.gelijk(triggers(route([dag1(["V5"]), [["O2"], ["N1"]], [["V6", "V5", "halveren"]]]), e).profielen, [], "alleen V5, geen wissel");
    T.gelijk(triggers(route([dag1(["V4"]), [["N1"], ["B1", "V5"]], [["O2"], ["B1", "V4"]]]), e).profielen, [], "V4, B1 naar V5 en terug: B1 gespeeld, V5 ervóór B1 niet");
  });
  reg("E2-3 feedbackExtra (route): 'Verouderde eGFR' bij een voorschrijfkaart zonder G2 ervoor; 'Onnodig gewisseld' bij een wissel terwijl de klachten afnemen", function (e) {
    vereisEngine();
    var VE = "Hoe oud was ", OG = "Het werkte e";
    T.gelijk(triggers(route([dag1(["V4"]), [["N1"]]]), e).feedback, [], "G2 vooraf, geen wissel");
    T.gelijk(triggers(route([[["O1"], ["V4"], ["G2"]], [["N1"]]]), e).feedback, [VE], "G2 na V4");
    T.gelijk(triggers(route([[["O1"], ["V4"]], [["N1"]]]), e).feedback, [VE], "nooit G2");
    T.gelijk(triggers(route([[["O1"], ["V1"]], [["N1"]]]), e).feedback, [VE], "V1 zonder G2");
    T.gelijk(triggers(route([[["O1"], ["V2"]], [["N1"]]]), e).feedback, [VE], "V2 zonder G2");
    T.gelijk(triggers(route([[["O1"], ["V3"]], [["N1"]]]), e).feedback, [VE], "V3 zonder G2");
    T.gelijk(triggers(route([[["O1"], ["V5"]], [["N1"]]]), e).feedback, [VE], "V5 zonder G2");
    T.gelijk(triggers(route([dag1(["V4"]), [["N1"], ["B1", "V5"]]]), e).feedback, [OG], "onnodige wissel");
    T.gelijk(triggers(route([[["O1"], ["V4"]], [["N1"], ["B1", "V5"]]]), e).feedback, [VE, OG], "beide");
    T.gelijk(triggers(route([dag1(["V5"]), [["O2"], ["N1"]], [["B1", "V4"]]]), e).feedback, [], "terechte wissel");
  });
  reg("E2-3 zichtbaarAlsOntbreekt (route): nierfunctie-zin bij nitrofurantoïne zonder G2; kalium-zin bij trimethoprim zonder O2; niet als de kaart gespeeld is", function (e) {
    vereisEngine();
    var NF = "De nierfunct", KA = "De kaliumspi";
    T.gelijk(triggers(route([[["O1"], ["V3"], ["N1"]]]), e).zichtbaar, [NF]);
    T.gelijk(triggers(route([dag1(["V3"]), [["N1"]]]), e).zichtbaar, [], "V3 mét G2");
    T.gelijk(triggers(route([[["O1"], ["V4"], ["N1"]]]), e).zichtbaar, [], "zonder G2 maar geen V3");
    T.gelijk(triggers(route([dag1(["V5"]), [["N1"]]]), e).zichtbaar, [KA]);
    T.gelijk(triggers(route([dag1(["V5"]), [["O2"], ["N1"]]]), e).zichtbaar, [], "V5 mét O2");
    T.gelijk(triggers(route([dag1(["V4"]), [["N1"], ["O2"]]]), e).zichtbaar, [], "geen V5");
    T.gelijk(triggers(route([[["O1"], ["V3"], ["N1"]], [["B1", "V5"]]]), e).zichtbaar, [NF, KA], "beide");
  });
  reg("E2-route (I7, opnieuw starten): trimethoprim na stoppen opnieuw voorschrijven: O2 en V6 ten opzichte van de EERSTE start tellen (TODO_BART-E2-17: strengste lezing is eerste start)", function (e) {
    vereisEngine();
    var st = route([dag1(["V5"]), [["O2"], ["N1"]], [["B2", "V5"]], [["V6", "V5", "halveren"]], [["V5"]], [["B2", "V5"]]]);
    T.gelijk(schending(st, e).ids, [], "O2 en V6 zijn op tijd na de eerste start gespeeld");
  });
  reg("E2-knoppen (Engine + E2-data): maximaal 3 acties per beurt en alleen kaarten uit het repertoire van E2", function (e) {
    vereisEngine();
    var st = g.Engine.nieuwSpel(g.Test.oudeRegels(), "E2", { rng: function () { return 0; } });
    ["G2", "O1", "V4"].forEach(function (k) { T.waar(g.Engine.speelKaart(st, k).ok, k); });
    var vierde = g.Engine.speelKaart(st, "N1", {});
    T.is(vierde.ok, false); T.waar(typeof vierde.fout === "string" && vierde.fout.length > 0, "Nederlandse foutmelding bij de 4e actie");
    T.is(st.tijdlijn.length, 3, "de 4e kaart staat niet in de tijdlijn");
    g.Engine.volgendeDag(st);
    var buiten = g.Engine.speelKaart(st, "V7", {});
    T.is(buiten.ok, false); T.waar(e.repertoire.indexOf("V7") < 0, "V7 hoort niet bij E2");
    T.is(st.tijdlijn.length, 3, "V7 staat niet in de tijdlijn");
  });
  reg("S-TODO: id, plek en slot van de E2-TODO's zijn vast (geen afgeknipte of verschoven verwijzing)", function (e) {
    var verwacht = {
      "TODO_BART-E2-18": "E2.invarianten[].ernst", "TODO_BART-E2-19": "E2.invarianten[].weglaatDownside", "TODO_BART-E2-1": "E2.invarianten.I1",
      "TODO_BART-E2-2": "E2.invarianten.I7", "TODO_BART-E2-3": "E2.invarianten.I7.vraagVarianten", "TODO_BART-E2-4": "E2.invarianten.I6.vraagVarianten",
      "TODO_BART-E2-5": "E2.invarianten.I8", "TODO_BART-E2-6": "E2.gebeurtenissen.C", "TODO_BART-E2-7": "E2.patient.verborgen[G2]", "TODO_BART-E2-8": "E2.profielen",
      "TODO_BART-E2-9": "E2.statusTeksten", "TODO_BART-E2-10": "E2.profielen", "TODO_BART-E2-11": "E2.score", "TODO_BART-E2-12": "E2.feedbackExtra",
      "TODO_BART-E2-15": "E2.invarianten.I6", "TODO_BART-E2-16": "E2.invarianten.I8", "TODO_BART-E2-17": "E2.invarianten.I7", "TODO_BART-E2-14": "E2.zichtbaarAlsOntbreekt"
    };
    var mijn = casus().todoBart.filter(function (t) { return /^TODO_BART-E2-/.test(t.id); });
    T.gelijk(mijn.map(function (t) { return t.id; }).sort(), Object.keys(verwacht).sort());
    mijn.forEach(function (t) {
      T.is(t.plek, verwacht[t.id], t.id + " plek");
      T.waar(/\.$/.test(t.gekozenLezing), t.id + ".gekozenLezing eindigt niet op een punt");
      T.waar(/[.?]$/.test(t.vraag), t.id + ".vraag eindigt niet op een punt of vraagteken");
    });
    // De gekozen lezing van de statusteksten noemt het slotpunt, de kleine letter en het alternatief.
    var st = mijn.filter(function (t) { return t.id === "TODO_BART-E2-9"; })[0];
    T.waar(st.gekozenLezing.indexOf("'klachten nemen af.'") >= 0 && st.gekozenLezing.indexOf("'klachten houden aan.'") >= 0 && st.gekozenLezing.indexOf("Alternatief") >= 0 && st.gekozenLezing.indexOf("hoofdletter") >= 0, "gekozen lezing van de statusteksten");
  });
  reg("E2-Engine: V6 op trimethoprim vereist dat trimethoprim gestart is; na C staan resistent/gevoelig in state.sets", function (e) {
    vereisEngine();
    var st = g.Engine.nieuwSpel(g.Test.oudeRegels(), "E2", { rng: function () { return 0; } });
    var nee = g.Engine.speelKaart(st, "V6", { doel: "V5", optie: "halveren" });
    T.is(nee.ok, false, "V6 op V5 vóór de start van V5"); T.is(st.tijdlijn.length, 0);
    var anders = g.Engine.speelKaart(st, "V6", { doel: "V4", optie: "halveren" });
    T.is(anders.ok, false, "V4 is geen doel van V6 in E2");
    T.waar(g.Engine.speelKaart(st, "V6", { doel: "lisinopril", optie: "halveren" }).ok, "V6 op lisinopril mag (medicatie actief)");
    var s2 = route([dag1(["V4"]), [["N1"], ["N2", "V4"]], [["Ev1"]]]);
    T.gelijk(s2.sets.resistent.slice().sort(), ["V10", "V5"]);
    T.gelijk(s2.sets.gevoelig.slice().sort(), ["V3", "V4", "V7", "V8"]);
    var s0 = g.Engine.nieuwSpel(g.Test.oudeRegels(), "E2", { rng: function () { return 0; } });
    T.gelijk(s0.sets.resistent, []); T.gelijk(s0.sets.gevoelig, []);
  });
  reg("E2-route (I8, predicaat los): zonder kweekuitslag C is het I8-predicaat zelf onwaar, ook als trimethoprim blijft doorlopen (de geldtIn-poort is niet de enige bewaker)", function (e) {
    vereisEngine();
    var st = route([[["G2"], ["V5"], ["O2"]], [["N1"]], [], [], [], []]);
    T.is(st.gebeurtenissen.length, 0, "geen O1: geen C");
    var ctx = g.Predicaten.maakContext(casus(), e, st);
    T.is(g.Predicaten.evalueer(vindInv(e, "I8").predicaat.args[0], ctx), false, "gebeurtenisGeweest C");
    T.is(g.Predicaten.evalueer(vindInv(e, "I8").predicaat.args[1], ctx), false, "zonder C is er geen resistent middel en dus geen actief resistent middel");
    T.is(g.Predicaten.evalueer(vindInv(e, "I8").predicaat, ctx), false);
    var met = route([dag1(["V5"]), [["O2"], ["N1"]], [["Ev1"]], [], [], []]);
    var c2 = g.Predicaten.maakContext(casus(), e, met);
    T.is(g.Predicaten.evalueer(vindInv(e, "I8").predicaat.args[0], c2), true);
    T.is(g.Predicaten.evalueer(vindInv(e, "I8").predicaat, c2), true);
  });
  reg("E2-route (vereisten): zonder Engine, Predicaten of bibliotheek faalt een route-test luid (nooit leeg groen)", function (e) {
    var bewaard = { E: g.Engine, P: g.Predicaten };
    try {
      g.Engine = undefined; g.Predicaten = undefined;
      T.gooit(function () { vereisEngine(); }, "vereisEngine moet gooien als Engine en Predicaten ontbreken");
      g.Engine = bewaard.E;
      T.gooit(function () { vereisEngine(); }, "vereisEngine moet gooien als Predicaten ontbreekt");
    } finally { g.Engine = bewaard.E; g.Predicaten = bewaard.P; }
    vereisEngine();
  });

  /* ---------- samenwerking met de andere lagen (alleen als die geladen zijn) ---------- */
  reg("E2-compat: alle predicaten van E2 zijn leesbaar voor Predicaten (geen 'onbekend predicaat', geen ontbrekend veld)", function (e) {
    vereisEngine();
    var stateLeeg = { dag: 1, aantalDagen: 7, tijdlijn: [], gebeurtenissen: [], toestanden: ["cystitis"], klachten: [{ dag: 1, status: null }] };
    var stateNaC = { dag: 5, aantalDagen: 7, toestanden: ["cystitis"],
      tijdlijn: [{ volg: 1, kaart: "V5", dag: 1, doel: null, optie: null }, { volg: 2, kaart: "B1", dag: 4, doel: "V4", optie: null }],
      gebeurtenissen: [{ id: "C", dag: 3, naVolg: 4 }], klachten: [{ dag: 1, status: null }, { dag: 2, status: "aan" }, { dag: 5, status: "af" }] };
    [stateLeeg, stateNaC].forEach(function (st) {
      var ctx = g.Predicaten.maakContext(casus(), e, st);
      allePredicaten(e).forEach(function (x) {
        var r;
        try { r = g.Predicaten.evalueer(x.p, ctx); } catch (err) { throw new Error(x.pad + ": " + err.message); }
        T.is(typeof r, "boolean", x.pad + " geeft geen boolean");
      });
      e.score.duurzaamheid.regels.forEach(function (r) { T.is(typeof g.Predicaten.tel(r.perKeer, ctx), "number"); });
    });
  });
  reg("E2-compat: Engine start E2 en G2 onthult eGFR 29 (A5: pas na de kaart); de ware waarde blijft 29", function (e) {
    vereisEngine();
    var st = g.Engine.nieuwSpel(g.Test.oudeRegels(), "E2", { rng: function () { return 0; } });
    T.gelijk(st.toestanden, ["cystitis"]);
    T.is(st.actiesOver, 3);
    T.is(st.aantalDagen, 7);
    T.is(st.zichtbaar.lab.eGFR, 42, "vóór G2 is de zichtbare eGFR 42");
    T.is(st.zichtbaar.labTekst, "laatst bekende eGFR 42, van 6 jaar geleden.");
    var r = g.Engine.speelKaart(st, "G2");
    T.waar(r.ok, "G2 spelen mislukt: " + r.fout);
    T.is(r.onthuld.length, 1);
    T.is(r.onthuld[0].tekst, "eGFR 29 uit de jaarlijkse controle.");
    T.is(st.zichtbaar.lab.eGFR, 29, "na G2 is de zichtbare eGFR 29");
    T.is(st.zichtbaar.labTekst, "eGFR 29 uit de jaarlijkse controle.");
    T.is(st.zichtbaar.lab.datum, "uit de jaarlijkse controle");
    T.is(e.patient.waar.eGFR, 29, "de ware waarde is nooit veranderd");
  });
  reg("E2-compat: kweekuitslag C komt na de 4e kaart alleen als O1 gespeeld is (zelfde trigger als de data)", function (e) {
    vereisEngine();
    function speel(kaarten) {
      var st = g.Engine.nieuwSpel(g.Test.oudeRegels(), "E2", { rng: function () { return 0; } });
      kaarten.forEach(function (k) {
        if (st.actiesOver < 1) g.Engine.volgendeDag(st);
        var r = g.Engine.speelKaart(st, k.kaart, k);
        T.waar(r.ok, "kaart " + k.kaart + " mislukt: " + r.fout);
      });
      g.Engine.volgendeDag(st);
      return st;
    }
    var metO1 = speel([{ kaart: "G2" }, { kaart: "O1" }, { kaart: "N1" }, { kaart: "V4" }]);
    T.gelijk(metO1.gebeurtenissen.map(function (x) { return x.id; }), ["C"]);
    T.is(metO1.gebeurtenissen[0].dag, 3, "C verschijnt op dag 3 (casus: ongeveer dag 3)");
    var zonderO1 = speel([{ kaart: "G2" }, { kaart: "N1" }, { kaart: "Ev1" }, { kaart: "V4" }]);
    T.gelijk(zonderO1.gebeurtenissen, []);
  });
})(typeof window !== "undefined" ? window : globalThis);

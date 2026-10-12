// Datatests voor episode 1 (stuk S2): datavorm, letterlijkheid, exacte sleutelwhitelist, TODO_BART-pins, plus een
// als zodanig gemarkeerde eigen oracle (kruiscontrole) die de regels in de data naast een uit de casus geschreven uitkomst legt.
// De referentieteksten hieronder zijn met de hand uit casus-uwi.md (sectie 4) overgenomen en NIET uit de data gegenereerd.
(function (g) {
  var G = "data-e1";
  var T = g.Test;
  function casus() { return g.CASUSSEN && g.CASUSSEN[0]; }
  function e1() {
    var c = casus();
    if (!c) throw new Error("casussen/uwi.js ontbreekt of heeft geen casus: window.CASUSSEN[0] bestaat niet. Laad uwi.js vóór uwi-e1.js.");
    var e = (c.episodes || []).filter(function (x) { return x.id === "E1"; })[0];
    if (!e) throw new Error("Episode E1 niet gevonden in window.CASUSSEN[0].episodes (is casussen/uwi-e1.js geladen na uwi.js?).");
    return e;
  }
  function reg(naam, fn) { T.registreer(G, naam, function () { fn(e1()); }); }
  function alleStrings(x, uit, pad) {
    if (typeof x === "string") uit.push({ pad: pad, s: x });
    else if (Array.isArray(x)) x.forEach(function (v, i) { alleStrings(v, uit, pad + "[" + i + "]"); });
    else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { alleStrings(x[k], uit, pad + "." + k); });
    return uit;
  }
  function vindInv(e, id) { return e.invarianten.filter(function (i) { return i.id === id; })[0]; }

  reg("E1-0 episode is zuivere data (JSON-roundtrip identiek, geen functies)", function (e) {
    T.gelijk(JSON.parse(JSON.stringify(e)), e);
    T.is(e.id, "E1"); T.is(e.level, 1);
  });

  // Referentie: de vijf patiëntkaartregels van casus-uwi.md sectie 4, per script rechtstreeks uit de casus gekopieerd
  // (inclusief markdown) en hier door een EIGEN parser ontleed. De data wordt nergens gebruikt om de referentie te maken.
  var CASUS_PATIENTKAART = [
    "- **Mevrouw V., 72 jaar.** Eerste cystitis: pijnlijke en frequente mictie sinds 2 dagen, geen koorts, nitriettest positief.",
    "- **Medicatie:** lisinopril (hypertensie).",
    "- **Lab:** eGFR 42, recent.",
    "- **Geen risicogroep.** De eGFR is \u2265 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].",
    "- **Verborgen:** niets."
  ];
  function casusRef() {
    function schoon(r) { return r.replace(/^- /, "").replace(/\*\*/g, ""); }
    var r = CASUS_PATIENTKAART.map(schoon), kop = "Mevrouw V., 72 jaar.";
    T.waar(r[0].indexOf(kop + " ") === 0, "casusregel 1 begint niet met de kop");
    T.waar(r[1].indexOf("Medicatie: ") === 0 && r[2].indexOf("Lab: ") === 0, "casusregels medicatie/lab");
    return { kop: kop, klachten: r[0].slice(kop.length + 1), medicatieTekst: r[1].slice("Medicatie: ".length),
      labTekst: r[2].slice("Lab: ".length), risicogroep: r[3] };
  }
  reg("E1-1 patiëntkaart: elke tekst teken voor teken gelijk aan casus-uwi.md sectie 4 (medicatie, klachten, lab, risicogroep, kop)", function (e) {
    var z = e.patient.zichtbaar, ref = casusRef();
    Object.keys(ref).forEach(function (k) { if (k !== "risicogroep") T.is(z[k], ref[k], "patient.zichtbaar." + k + " wijkt af van de casus"); });
    T.is(ref.medicatieTekst.slice(-1), ".", "casus-medicatieregel eindigt op een punt");
    T.is(z.naam, "Mevrouw V.");
    T.is(z.leeftijd, 72);
    T.is(z.kop, z.naam + ", " + z.leeftijd + " jaar.", "kop consistent met naam en leeftijd");
    T.gelijk(z.medicatie, ["lisinopril"]);
    T.gelijk(z.lab, { eGFR: 42, datum: "recent" });
  });
  reg("E1-1 risicogroep-uitleg staat onder patient.meta.risicogroep (letterlijk) en NIET in wat de student ziet", function (e) {
    var ref = casusRef();
    T.is(e.patient.meta.risicogroep, ref.risicogroep, "patient.meta.risicogroep wijkt af van de casus");
    T.waar(!("risicogroep" in e.patient.zichtbaar), "risicogroep staat in patient.zichtbaar (de student mag dit niet vooraf lezen)");
    alleStrings(e.patient.zichtbaar, [], "zichtbaar").forEach(function (x) {
      ["risicogroep", "[NHG]", "bewust", "verminderde weerstand", "\u2265 30"].forEach(function (w) {
        T.waar(x.s.toLowerCase().indexOf(w.toLowerCase()) < 0, "verklappende tekst '" + w + "' in " + x.pad);
      });
    });
  });
  reg("E1-1 waar, comedicatie en verborgen", function (e) {
    T.gelijk(e.patient.waar, { eGFR: 42, risicogroep: false });
    T.gelijk(e.patient.verborgen, [], "verborgen moet leeg zijn (casus: 'Verborgen: niets')");
    T.gelijk(e.patient.medicatie, [{ id: "lisinopril", label: "lisinopril" }]);
    T.is(e.patient.waar.eGFR, e.patient.zichtbaar.lab.eGFR, "waar en zichtbaar eGFR gelijk in E1");
  });

  reg("E1-2 repertoire: 12 kaarten in casusvolgorde", function (e) {
    T.gelijk(e.repertoire, ["G1", "G2", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "N1", "N2", "Ev1"]);
    T.is(e.repertoire.length, 12);
  });
  reg("E1-2 alle repertoirekaarten bestaan in de bibliotheek (alleen als uwi.js kaarten bevat)", function (e) {
    var kaarten = casus().kaarten;
    if (!kaarten || !kaarten.length) return;
    var ids = kaarten.map(function (k) { return k.id; });
    e.repertoire.forEach(function (id) { T.waar(ids.indexOf(id) >= 0, "kaart " + id + " ontbreekt in casus.kaarten"); });
    e.antibiotica.forEach(function (id) { T.waar(ids.indexOf(id) >= 0, "antibioticum " + id + " ontbreekt in casus.kaarten"); });
  });
  function effectVoor(k, ep) { var ef = k && k.effect; if (!ef || typeof ef !== "object") return null; return ef[ep] !== undefined && ef[ep] !== null ? ef[ep] : (ef.alle !== undefined ? ef.alle : null); }
  reg("E1-2 elke repertoirekaart heeft een effecttekst voor E1 (effect[E1] ?? effect.alle); G2 geeft het lab uit de patiëntkaart", function (e) {
    var kaarten = casus().kaarten;
    if (!kaarten || !kaarten.length) return;
    e.repertoire.forEach(function (id) {
      var k = kaarten.filter(function (x) { return x.id === id; })[0];
      var t = effectVoor(k, "E1");
      T.waar(typeof t === "string" && t.length > 0, "kaart " + id + " heeft geen effect voor E1 (effect.E1 noch effect.alle)");
    });
    T.is(effectVoor(kaarten.filter(function (x) { return x.id === "G2"; })[0], "E1"), e.patient.zichtbaar.labTekst, "G2-effect in E1 gelijk aan de lab-regel van de patiëntkaart");
  });
  reg("E1-2 knoppen (raadplegenKost 0), geen episode.raadplegen en geen gebeurtenissen", function (e) {
    T.gelijk(e.knoppen, { actiesPerBeurt: 3, aantalDagen: 14, raadplegenKost: 0 });
    T.gelijk(e.gebeurtenissen, []);
    T.waar(!("raadplegen" in e), "raadplegen staat alleen op casusniveau (S1), niet in episode 1");
    T.is(e.knoppen.raadplegenKost, 0, "casus: richtlijn raadplegen kost niets");
    T.gelijk(e.antibiotica, ["V3", "V4", "V5"]);
    T.gelijk(e.startToestanden, ["cystitis"]);
  });

  reg("E1-3 invarianten: ids, volgorde, ernst, geldtIn, vraag, bron letterlijk", function (e) {
    T.gelijk(e.invarianten.map(function (i) { return i.id; }), ["I1", "I3", "I4"]);
    var verw = {
      I1: { vraag: "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?", bron: "NHG" },
      I3: { vraag: "Je wacht af. Tot wanneer, en wat gebeurt er dan?", bron: "NHG" },
      I4: { vraag: "Wat lost het tweede middel op dat het eerste niet oplost?", bron: "[G]" }
    };
    Object.keys(verw).forEach(function (id) {
      var i = vindInv(e, id);
      T.is(i.ernst, 5, id + " ernst");
      T.gelijk(i.geldtIn, ["*"], id + " geldtIn");
      T.is(i.vraag, verw[id].vraag, id + " vraag");
      T.is(i.bron, verw[id].bron, id + " bron");
      T.waar(i.predicaat && typeof i.predicaat === "object", id + " predicaat");
    });
  });
  reg("E1-3 invariant-predicaten: JSON-AST volgens contract", function (e) {
    T.gelijk(vindInv(e, "I1").predicaat, { p: "of", args: [
      { p: "nietGespeeld", kaart: "N1" },
      { p: "niet", arg: { p: "of", args: [{ p: "gespeeld", kaart: "V1" }, { p: "gespeeld", kaart: "V2" }, { p: "gespeeld", kaart: "V3" }, { p: "gespeeld", kaart: "V4" }, { p: "gespeeld", kaart: "V5" }] } }
    ] });
    T.gelijk(vindInv(e, "I3").predicaat, { p: "en", args: [{ p: "gespeeld", kaart: "V1" }, { p: "nietGespeeld", kaart: "Ev1" }] });
    T.gelijk(vindInv(e, "I4").predicaat, { p: "aantalActieveAntibiotica", op: ">", n: 1 });
  });
  reg("E1-3 alle predicaten in de episode gebruiken alleen bekende predicaatnamen met geldige velden", function (e) {
    var bekend = ["gespeeld", "nietGespeeld", "voor", "na", "binnenBeurten", "opDagRelatief", "gestart", "actief",
      "aantalActieveAntibiotica", "medicatieActief", "waar", "inToestand", "gebeurtenisGeweest", "klachten", "en", "of", "niet", "alsDan", "waarheid"];
    var n = 0;
    function check(pr, pad) {
      T.waar(pr && typeof pr === "object" && typeof pr.p === "string", pad + ": predicaat zonder 'p'");
      T.waar(bekend.indexOf(pr.p) >= 0, pad + ": onbekend predicaat " + pr.p);
      n++;
      if (pr.p === "gespeeld" || pr.p === "nietGespeeld") T.waar(typeof pr.kaart === "string", pad + ": kaart ontbreekt");
      if (pr.p === "en" || pr.p === "of") { T.waar(Array.isArray(pr.args) && pr.args.length >= 1, pad + ": args"); pr.args.forEach(function (a, i) { check(a, pad + ".args[" + i + "]"); }); }
      if (pr.p === "niet") check(pr.arg, pad + ".arg");
      if (pr.p === "waarheid") T.waar(typeof pr.waarde === "boolean", pad + ": waarde");
      if (pr.p === "aantalActieveAntibiotica") { T.waar([">", ">=", "<", "<=", "==", "="].indexOf(pr.op) >= 0, pad + ": op"); T.waar(typeof pr.n === "number", pad + ": n"); }
    }
    e.invarianten.forEach(function (i) { check(i.predicaat, "invariant " + i.id); });
    e.score.duurzaamheid.regels.forEach(function (r, k) { check(r.als, "duurzaamheid[" + k + "]"); });
    e.score.doelmatigheid.regels.forEach(function (r, k) { check(r.als, "doelmatigheid[" + k + "]"); });
    e.profielen.forEach(function (p) { check(p.als, "profiel " + p.naam); });
    e.feedbackExtra.forEach(function (f, k) { check(f.trigger, "feedbackExtra[" + k + "]"); });
    e.zichtbaarAlsOntbreekt.forEach(function (z, k) { check(z.trigger, "zichtbaarAlsOntbreekt[" + k + "]"); });
    T.waar(n >= 15, "te weinig predicaten gecontroleerd: " + n);
  });
  reg("E1-3 geen middelnamen of drempels als klinische tekst in predicaten (alleen kaart-ids)", function (e) {
    var tekst = JSON.stringify(e.invarianten.map(function (i) { return i.predicaat; }));
    ["nitrofuranto", "fosfomycine", "trimethoprim", "lisinopril"].forEach(function (m) { T.waar(tekst.toLowerCase().indexOf(m) < 0, "middelnaam in predicaat: " + m); });
  });

  var DIRECT = { p: "of", args: [{ p: "gespeeld", kaart: "V3" }, { p: "gespeeld", kaart: "V4" }, { p: "gespeeld", kaart: "V5" }] };
  var AFWACHTEN = { p: "en", args: [{ p: "gespeeld", kaart: "V1" }, { p: "nietGespeeld", kaart: "V2" }, { p: "niet", arg: DIRECT }] };
  reg("E1-4 score: duurzaamheid V1=3, V2=2, direct=1 (volledige regels vastgepind)", function (e) {
    var r = e.score.duurzaamheid.regels;
    T.is(r.length, 3);
    T.gelijk(r.map(function (x) { return x.punten; }), [3, 2, 1]);
    T.gelijk(r[0].als, AFWACHTEN);
    T.gelijk(r[1].als, { p: "gespeeld", kaart: "V2" });
    T.gelijk(r[2].als, DIRECT);
    T.waar(typeof r[1].TODO_BART === "string", "regel 2 (V2, ook met V1 of middel) heeft een TODO_BART op de plek zelf");
  });
  reg("E1-4 score: doelmatigheid start 3, -1 voor O1, -1 voor O2", function (e) {
    var d = e.score.doelmatigheid;
    T.is(d.start, 3);
    T.gelijk(d.regels, [{ als: { p: "gespeeld", kaart: "O1" }, delta: -1 }, { als: { p: "gespeeld", kaart: "O2" }, delta: -1 }]);
  });
  reg("E1-4 profielen en reflectievragen letterlijk", function (e) {
    T.gelijk(e.profielen.map(function (p) { return p.naam; }), ["Terughoudend", "Gedeelde regie", "Direct behandelen"]);
    var p = {}; e.profielen.forEach(function (x) { p[x.naam] = x; });
    T.is(p["Terughoudend"].reflectievraag, "Je schreef niets voor. Bij welke patiënt zou dat niet mogen?");
    T.is(p["Direct behandelen"].reflectievraag, "Het werkt. Was het nodig, en koos zíj ervoor?");
    T.is(p["Gedeelde regie"].reflectievraag, null, "ontbrekende reflectievraag = null");
    T.waar(typeof p["Gedeelde regie"].TODO_BART === "string", "Gedeelde regie heeft TODO_BART op de plek zelf");
    T.gelijk(p["Terughoudend"].als, AFWACHTEN);
    T.gelijk(p["Gedeelde regie"].als, { p: "gespeeld", kaart: "V2" });
    T.gelijk(p["Direct behandelen"].als, DIRECT);
  });

  reg("E1-5 feedbackExtra (O1 gespeeld) letterlijk", function (e) {
    T.is(e.feedbackExtra.length, 1);
    T.gelijk(e.feedbackExtra[0].trigger, { p: "gespeeld", kaart: "O1" });
    T.is(e.feedbackExtra[0].vraag, "Wat doe je bij welke uitslag anders?");
    T.is(e.feedbackExtra[0].wanneer, "alleenBijGehaaldePoort", "wanneer (TODO_BART-E1-5: alleen bij gehaalde poort)");
  });
  reg("E1-5 zichtbaarAlsOntbreekt (N1, V1 zonder Ev1) letterlijk", function (e) {
    var z = e.zichtbaarAlsOntbreekt;
    T.is(z.length, 2);
    T.gelijk(z[0].trigger, { p: "nietGespeeld", kaart: "N1" });
    T.is(z[0].tekst, "Mevrouw weet niet wanneer ze moet bellen.");
    T.gelijk(z[1].trigger, { p: "en", args: [{ p: "gespeeld", kaart: "V1" }, { p: "nietGespeeld", kaart: "Ev1" }] });
    T.is(z[1].tekst, "Er is geen moment om alsnog te starten als de klachten aanhouden.");
  });

  reg("E1-6 werkzaamheid: V3, V4, V5 werkzaam; statusTeksten aanwezig", function (e) {
    T.gelijk(e.werkzaamheid.cystitis, { werkzaam: [{ kaart: "V3" }, { kaart: "V4" }, { kaart: "V5" }], nietWerkzaam: [] });
    var s = e.statusTeksten;
    T.is(s.af, "klachten nemen af.");
    T.is(s.aan, "klachten houden aan.");
    T.is(s.geenVerbetering48, null, "E1: de casus geeft hier geen tekst (null)");
  });

  // ---- ORACLE (KRUISCONTROLE): eigen, door de bouwer onafhankelijk uit casus sectie 4 geschreven mini-evaluator.
  // De regels in de data worden doorgerekend met de ECHTE regeltaal (Predicaten.evalueer) over synthetische tijdlijnen en
  // vergeleken met de uitkomst van het orakel hieronder (NIET uit de data afgeleid). Dit is een gedragscontrole naast de
  // datavorm-tests, geen vervanging van Evaluatie.beoordeel (zodra S6 bestaat draait die ernaast, zie evaluatie.tests.js).
  var REP = ["G1", "G2", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "N1", "N2", "Ev1"];
  function tijdlijn(kaarten) {
    return kaarten.map(function (k, i) { return { volg: i + 1, kaart: k, dag: Math.floor(i / 3) + 1, doel: null, optie: null }; });
  }
  function ctxVoor(e, kaarten) {
    return g.Predicaten.maakContext(g.CASUSSEN[0], e, { tijdlijn: tijdlijn(kaarten), dag: 5, aantalDagen: 5, gebeurtenissen: [], toestanden: ["cystitis"], klachten: [] });
  }
  function eerste(regels, ctx, sleutel) {
    for (var i = 0; i < regels.length; i++) if (g.Predicaten.evalueer(regels[i][sleutel], ctx)) return i;
    return -1;
  }
  function geschondenIds(e, ctx) {
    return e.invarianten.filter(function (i) { return g.Predicaten.evalueer(i.predicaat, ctx); }).map(function (i) { return i.id; });
  }
  // Casus-orakel (sectie 4), onafhankelijk van de data.
  function orakel(kaarten) {
    var h = function (k) { return kaarten.indexOf(k) >= 0; };
    var abN = ["V3", "V4", "V5"].filter(h).length, antib = abN > 0, route = h("V1") || h("V2") || antib;
    var inv = [];
    if (!h("N1") || !route) inv.push("I1");           // I1 "een route zonder N1" + TODO_BART-E1-1 (lege route)
    if (h("V1") && !h("Ev1")) inv.push("I3");         // I3 "V1 zonder Ev1"
    if (abN > 1) inv.push("I4");                      // I4 "twee antibiotica tegelijk"
    return {
      inv: inv,
      dz: h("V2") ? 2 : antib ? 1 : h("V1") ? 3 : null,   // afwachten > uitgesteld recept > direct (TODO_BART-E1-6)
      profiel: h("V2") ? "Gedeelde regie" : antib ? "Direct behandelen" : h("V1") ? "Terughoudend" : null,
      dm: 3 - (h("O1") ? 1 : 0) - (h("O2") ? 1 : 0),
      fbO1: h("O1"), zichtN1: !h("N1"), zichtV1: h("V1") && !h("Ev1")
    };
  }
  // Rekent alle regels van de episode door voor één set kaarten; geeft de afwijkingen t.o.v. het orakel.
  function afwijkingen(e, kaarten) {
    var o = orakel(kaarten), ctx = ctxVoor(e, kaarten), fouten = [], P = g.Predicaten;
    var naam = "[" + kaarten.join("+") + "] ";
    var geschonden = geschondenIds(e, ctx);
    if (JSON.stringify(geschonden) !== JSON.stringify(o.inv)) fouten.push(naam + "geschonden " + geschonden + " i.p.v. " + o.inv);
    var regels = e.score.duurzaamheid.regels, k = eerste(regels, ctx, "als");
    var dz = k < 0 ? null : regels[k].punten;
    if (o.inv.length === 0 && dz !== o.dz) fouten.push(naam + "duurzaamheid " + dz + " i.p.v. " + o.dz);
    var pk = eerste(e.profielen, ctx, "als"), pn = pk < 0 ? null : e.profielen[pk].naam;
    if (o.inv.length === 0 && pn !== o.profiel) fouten.push(naam + "profiel " + pn + " i.p.v. " + o.profiel);
    var dm = e.score.doelmatigheid.start;
    e.score.doelmatigheid.regels.forEach(function (r) { if (P.evalueer(r.als, ctx)) dm += r.delta; });
    if (dm !== o.dm) fouten.push(naam + "doelmatigheid " + dm + " i.p.v. " + o.dm);
    var fb = e.feedbackExtra.some(function (f) { return P.evalueer(f.trigger, ctx); });
    if (fb !== o.fbO1) fouten.push(naam + "feedbackExtra " + fb + " i.p.v. " + o.fbO1);
    function zicht(tekst) { return e.zichtbaarAlsOntbreekt.filter(function (z) { return z.tekst === tekst; }).some(function (z) { return P.evalueer(z.trigger, ctx); }); }
    if (zicht("Mevrouw weet niet wanneer ze moet bellen.") !== o.zichtN1) fouten.push(naam + "zichtbaar-zonder-N1 klopt niet");
    if (zicht("Er is geen moment om alsnog te starten als de klachten aanhouden.") !== o.zichtV1) fouten.push(naam + "zichtbaar-V1-zonder-Ev1 klopt niet");
    return fouten;
  }
  // Representatieve, niet-uitputtende set: ALLE 4096 combinaties in oplopende volgorde (de regels hangen niet van de volgorde
  // af), plus de omgekeerde volgorde voor elke 8e combinatie (casus: 'volgorde vrij'). Stopt bij de eerste afwijking ("eerst").
  function gedragsfouten(e, eerst) {
    var uit = [];
    for (var m = 0; m < (1 << REP.length); m++) {
      var s = REP.filter(function (k, i) { return m & (1 << i); });
      uit = uit.concat(afwijkingen(e, s));
      if (m % 8 === 0) uit = uit.concat(afwijkingen(e, s.slice().reverse()));
      if (eerst && uit.length) return uit;
    }
    return uit;
  }
  function kloon(e) { return JSON.parse(JSON.stringify(e)); }

  reg("E1-G1 oracle (kruiscontrole): alle 4096 kaartcombinaties (+ omgekeerde volgorde voor elke 8e) geven de casus-uitkomst (poort, duurzaamheid, profiel, doelmatigheid, feedback, zichtbaar)", function (e) {
    T.waar(g.Predicaten && g.Predicaten.evalueer, "regels/predicaten.js niet geladen");
    var f = gedragsfouten(e);
    T.waar(f.length === 0, f.length + " afwijkingen, bv. " + f.slice(0, 3).join(" ; "));
  });

  // Handgeschreven casusroutes (onafhankelijk van het orakel): [kaarten, geschonden, duurzaamheid, doelmatigheid, profiel]
  var ROUTES = [
    [["V1", "N1", "Ev1"], [], 3, 3, "Terughoudend"],                              // Afwachten
    [["V2", "V3", "N1", "N2", "Ev1"], [], 2, 3, "Gedeelde regie"],                // Uitgesteld recept (+ middel)
    [["V2", "N1", "N2", "Ev1"], [], 2, 3, "Gedeelde regie"],                      // Uitgesteld recept zonder middel
    [["V3", "N1"], [], 1, 3, "Direct behandelen"],                                 // Nitrofurantoïne
    [["V3", "N1", "N2", "Ev1"], [], 1, 3, "Direct behandelen"],
    [["V4", "N1", "N2"], [], 1, 3, "Direct behandelen"],                           // Fosfomycine
    [["V5", "N1"], [], 1, 3, "Direct behandelen"],                                 // Trimethoprim 3 dagen
    [["V5", "N1", "O1", "O2"], [], 1, 1, "Direct behandelen"],
    [["V1", "N1", "Ev1", "O1"], [], 3, 2, "Terughoudend"],
    [["V1", "V2", "N1", "N2", "Ev1"], [], 2, 3, "Gedeelde regie"],                // TODO_BART-E1-6
    [["V1", "V3", "N1", "Ev1"], [], 1, 3, "Direct behandelen"],
    [["V3", "G1", "G2"], ["I1"], null, null, null],                                // zonder N1
    [["N1"], ["I1"], null, null, null],                                            // alleen N1: geen route (TODO_BART-E1-1)
    [["G1", "G2", "N1", "N2", "Ev1"], ["I1"], null, null, null],
    [[], ["I1"], null, null, null],
    [["V1", "N1"], ["I3"], null, null, null],                                      // V1 zonder Ev1
    [["V3", "V4", "N1"], ["I4"], null, null, null],                                // twee antibiotica
    [["V3", "V5", "N1"], ["I4"], null, null, null],
    [["V3", "V4", "V5", "N1"], ["I4"], null, null, null],
    [["V1", "V3", "V4"], ["I1", "I3", "I4"], null, null, null]
  ];
  reg("E1-G2 oracle (kruiscontrole): handgeschreven casusroutes geven exact de bedoelde schendingen, score en profiel", function (e) {
    var P = g.Predicaten;
    ROUTES.forEach(function (r) {
      [r[0], r[0].slice().reverse()].forEach(function (kaarten) {
        var ctx = ctxVoor(e, kaarten), naam = "[" + kaarten.join("+") + "] ";
        T.gelijk(geschondenIds(e, ctx), r[1], naam + "geschonden");
        if (r[1].length) return;
        var k = eerste(e.score.duurzaamheid.regels, ctx, "als");
        T.is(k < 0 ? null : e.score.duurzaamheid.regels[k].punten, r[2], naam + "duurzaamheid");
        var dm = e.score.doelmatigheid.start;
        e.score.doelmatigheid.regels.forEach(function (x) { if (P.evalueer(x.als, ctx)) dm += x.delta; });
        T.is(dm, r[3], naam + "doelmatigheid");
        var pk = eerste(e.profielen, ctx, "als");
        T.is(pk < 0 ? null : e.profielen[pk].naam, r[4], naam + "profiel");
      });
    });
  });
  reg("E1-G3 oracle (kruiscontrole): bij drie schendingen van gelijke ernst staat de vraag van de eerste in de data (I1) vooraan", function (e) {
    var gesch = e.invarianten.filter(function (i) { return g.Predicaten.evalueer(i.predicaat, ctxVoor(e, ["V1", "V3", "V4"])); });
    T.gelijk(gesch.map(function (i) { return i.id; }), ["I1", "I3", "I4"]);
    T.is(gesch[0].vraag, "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?");
  });

  // Mutatiecontrole: de oracle-tests moeten elke inhoudelijke mutatie van een regel in de data opmerken.
  var MUTATIES = [
    ["duurzaamheid regel 1 -> waarheid", function (e) { e.score.duurzaamheid.regels[0].als = { p: "waarheid", waarde: true }; }],
    ["duurzaamheid regel 1 punten 3 -> 2", function (e) { e.score.duurzaamheid.regels[0].punten = 2; }],
    ["duurzaamheid regel 1: V1 -> V9", function (e) { e.score.duurzaamheid.regels[0].als.args[0].kaart = "V9"; }],
    ["duurzaamheid regel 2: V2 -> V1", function (e) { e.score.duurzaamheid.regels[1].als.kaart = "V1"; }],
    ["duurzaamheid regel 2 punten", function (e) { e.score.duurzaamheid.regels[1].punten = 3; }],
    // (regel 3 -> waarheid is een equivalente mutant: na I1 en regel 1-2 heeft elke poortgehaalde route een antibioticum)
    ["duurzaamheid regel 3 punten", function (e) { e.score.duurzaamheid.regels[2].punten = 2; }],
    ["duurzaamheid regel 3: V5 weg", function (e) { e.score.duurzaamheid.regels[2].als.args.pop(); }],
    ["doelmatigheid start 3 -> 2", function (e) { e.score.doelmatigheid.start = 2; }],
    ["doelmatigheid O1 delta", function (e) { e.score.doelmatigheid.regels[0].delta = 0; }],
    ["doelmatigheid O2 -> O1", function (e) { e.score.doelmatigheid.regels[1].als.kaart = "O1"; }],
    ["profiel Terughoudend: V1 -> V9", function (e) { e.profielen[0].als.args[0].kaart = "V9"; }],
    ["profiel Terughoudend: V2-eis weg", function (e) { e.profielen[0].als.args.splice(1, 1); }],
    ["profiel Terughoudend: antibioticum-eis weg", function (e) { e.profielen[0].als.args.pop(); }],
    ["profiel Gedeelde regie: V2 -> V1", function (e) { e.profielen[1].als.kaart = "V1"; }],
    ["profiel Direct: V5 weg", function (e) { e.profielen[2].als.args.pop(); }],
    ["profielvolgorde Direct vóór Gedeelde regie", function (e) { e.profielen.splice(1, 0, e.profielen.pop()); }],
    ["profielnaam omgewisseld", function (e) { e.profielen[0].naam = "Direct behandelen"; e.profielen[2].naam = "Terughoudend"; }],
    ["I1: N1 -> N2", function (e) { e.invarianten[0].predicaat.args[0].kaart = "N2"; }],
    ["I1: routeclausule weg", function (e) { e.invarianten[0].predicaat = e.invarianten[0].predicaat.args[0]; }],
    ["I1: V5 uit route weg", function (e) { e.invarianten[0].predicaat.args[1].arg.args.pop(); }],
    ["I3: Ev1 -> Ev2", function (e) { e.invarianten[1].predicaat.args[1].kaart = "Ev2"; }],
    ["I3: V1 -> V2", function (e) { e.invarianten[1].predicaat.args[0].kaart = "V2"; }],
    ["I4: n 1 -> 2", function (e) { e.invarianten[2].predicaat.n = 2; }],
    ["feedbackExtra trigger O1 -> O2", function (e) { e.feedbackExtra[0].trigger.kaart = "O2"; }],
    ["zichtbaar N1 trigger gespeeld", function (e) { e.zichtbaarAlsOntbreekt[0].trigger = { p: "gespeeld", kaart: "N1" }; }],
    ["zichtbaar V1: Ev1 -> Ev2", function (e) { e.zichtbaarAlsOntbreekt[1].trigger.args[1].kaart = "Ev2"; }]
  ];
  reg("E1-M oracle (kruiscontrole) mutatiecontrole: " + MUTATIES.length + " inhoudelijke mutaties van score-, profiel-, poort- en feedbackregels worden door de oracle opgemerkt", function (e) {
    MUTATIES.forEach(function (m) {
      var c = kloon(e); m[1](c);
      T.waar(gedragsfouten(c, true).length > 0, "mutatie ongemerkt gebleven: " + m[0]);
    });
  });

  // Exacte sleutelwhitelist: elk object in de episode heeft PRECIES de sleutels hieronder (TODO_BART* wordt apart gepind in S-TODO).
  // Een extra veld (bv. een hint voor de student) of een ontbrekend veld in welk object ook geeft rood.
  var SLEUTELS = {
    "E1": ["id", "level", "startToestanden", "knoppen", "afrondenPasNaGebeurtenissen", "startUitleg", "escalatie", "antibiotica", "patient", "repertoire", "gebeurtenissen", "werkzaamheid", "statusTeksten", "invarianten", "score", "profielen", "feedbackExtra", "zichtbaarAlsOntbreekt"],
    "E1.escalatie": ["aan"],
    "E1.knoppen": ["actiesPerBeurt", "aantalDagen", "raadplegenKost"],
    "E1.patient": ["zichtbaar", "waar", "medicatie", "verborgen", "meta"],
    "E1.patient.zichtbaar": ["kop", "naam", "leeftijd", "klachten", "medicatie", "medicatieTekst", "lab", "labTekst"],
    "E1.patient.zichtbaar.lab": ["eGFR", "datum"],
    "E1.patient.waar": ["eGFR", "risicogroep"],
    "E1.patient.medicatie[]": ["id", "label"],
    "E1.patient.meta": ["risicogroep"],
    "E1.werkzaamheid": ["cystitis"],
    "E1.werkzaamheid.cystitis": ["werkzaam", "nietWerkzaam"],
    "E1.werkzaamheid.cystitis.werkzaam[]": ["kaart"],
    "E1.statusTeksten": ["af", "aan", "geenVerbetering48"],
    "E1.invarianten[]": ["id", "ernst", "geldtIn", "predicaat", "vraag", "bron"],
    "E1.score": ["duurzaamheid", "doelmatigheid"],
    "E1.score.duurzaamheid": ["regels"],
    "E1.score.duurzaamheid.regels[]": ["als", "punten"],
    "E1.score.doelmatigheid": ["start", "regels"],
    "E1.score.doelmatigheid.regels[]": ["als", "delta"],
    "E1.profielen[]": ["naam", "als", "reflectievraag"],
    "E1.feedbackExtra[]": ["trigger", "vraag", "wanneer"],
    "E1.zichtbaarAlsOntbreekt[]": ["trigger", "tekst"]
  };
  var PRED_SLEUTELS = { gespeeld: ["p", "kaart"], nietGespeeld: ["p", "kaart"], en: ["p", "args"], of: ["p", "args"], niet: ["p", "arg"], aantalActieveAntibiotica: ["p", "op", "n"], waarheid: ["p", "waarde"] };
  function sleutelFouten(e) {
    var f = [];
    function gelijkSet(pad, keys, verwacht) {
      var k = keys.filter(function (x) { return !/^TODO_BART/.test(x); }).sort(), v = verwacht.slice().sort();
      if (JSON.stringify(k) !== JSON.stringify(v)) f.push(pad + " heeft sleutels [" + k + "] i.p.v. [" + v + "]");
    }
    function pred(x, pad) {
      if (!x || typeof x !== "object" || Array.isArray(x)) { f.push(pad + " is geen predicaat"); return; }
      var w = PRED_SLEUTELS[x.p];
      if (!w) { f.push(pad + " onbekend predicaat " + x.p); return; }
      gelijkSet(pad, Object.keys(x), w);
      if (x.args) x.args.forEach(function (a, i) { pred(a, pad + ".args[" + i + "]"); });
      if (x.arg) pred(x.arg, pad + ".arg");
    }
    var PRED_VELD = { "E1.invarianten[]": "predicaat", "E1.score.duurzaamheid.regels[]": "als", "E1.score.doelmatigheid.regels[]": "als", "E1.profielen[]": "als", "E1.feedbackExtra[]": "trigger", "E1.zichtbaarAlsOntbreekt[]": "trigger" };
    function walk(x, pad, pad0) {
      if (Array.isArray(x)) { x.forEach(function (v, i) { walk(v, pad + "[" + i + "]", pad0 + "[]"); }); return; }
      if (!x || typeof x !== "object") return;
      var w = SLEUTELS[pad0];
      if (!w) { f.push(pad + " (" + pad0 + ") komt niet voor in de toegestane structuur"); return; }
      gelijkSet(pad, Object.keys(x), w);
      Object.keys(x).forEach(function (k) {
        if (/^TODO_BART/.test(k)) return;
        if (PRED_VELD[pad0] === k) { pred(x[k], pad + "." + k); return; }
        walk(x[k], pad + "." + k, pad0 + "." + k);
      });
    }
    walk(e, "E1", "E1");
    return f;
  }
  reg("E1-W exacte sleutelwhitelist: geen enkel object in episode 1 heeft een extra of ontbrekend veld", function (e) {
    T.gelijk(sleutelFouten(e), []);
  });
  reg("E1-W mutatiecontrole: extra velden (ook met hint) en ontbrekende velden in elk objecttype worden opgemerkt", function (e) {
    var paden = [];
    (function walk(x, pad, pad0) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]", pad0 + "[]"); });
      else if (x && typeof x === "object") { paden.push({ pad: pad, pad0: pad0 }); Object.keys(x).forEach(function (k) { walk(x[k], pad + "." + k, pad0 + "." + k); }); }
    })(e, "E1", "E1");
    T.waar(paden.length >= 40, "te weinig objecten: " + paden.length);
    function hier(c, pad) { var o = c; pad.replace(/^E1\.?/, "").split(".").filter(Boolean).forEach(function (d) { var m = /^(\w+)\[(\d+)\]$/.exec(d); o = m ? o[m[1]][+m[2]] : o[d]; }); return o; }
    paden.forEach(function (x) {
      var c = kloon(e), o = hier(c, x.pad);
      o.tip = "Kies nitrofurantoine";
      T.waar(sleutelFouten(c).length > 0, "extra veld 'tip' ongemerkt in " + x.pad);
      c = kloon(e); o = hier(c, x.pad);
      var k0 = Object.keys(o)[0]; delete o[k0];
      T.waar(sleutelFouten(c).length > 0, "ontbrekend veld '" + k0 + "' ongemerkt in " + x.pad);
    });
    [1].forEach(function () {
      var c = kloon(e); c.statusTeksten.toeneemt = "klachten nemen toe";
      T.waar(sleutelFouten(c).length > 0, "extra statustekst ongemerkt");
    });
  });

  // Vorm-/tekstvelden die het gedrag niet raakt (ernst, geldtIn, bron, vraag, reflectievraag, wanneer, raadplegen, kop).
  function vormFouten(c) {
    var f = [];
    function is(a, b, n) { if (JSON.stringify(a) !== JSON.stringify(b)) f.push(n); }
    is(c.feedbackExtra[0].wanneer, "alleenBijGehaaldePoort", "wanneer");
    var bron = { I1: "NHG", I3: "NHG", I4: "[G]" };
    var vraag = {
      I1: "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",
      I3: "Je wacht af. Tot wanneer, en wat gebeurt er dan?",
      I4: "Wat lost het tweede middel op dat het eerste niet oplost?"
    };
    c.invarianten.forEach(function (i) { is([i.ernst, i.geldtIn, i.bron, i.vraag], [5, ["*"], bron[i.id], vraag[i.id]], "invariant " + i.id); });
    is(c.profielen.map(function (p) { return p.reflectievraag; }),
      ["Je schreef niets voor. Bij welke patiënt zou dat niet mogen?", null, "Het werkt. Was het nodig, en koos zíj ervoor?"], "reflectievragen");
    is("raadplegen" in c, false, "episode.raadplegen");
    var ref = casusRef();
    Object.keys(ref).forEach(function (k) { if (k !== "risicogroep") is(c.patient.zichtbaar[k], ref[k], "patient.zichtbaar." + k); });
    is(c.patient.meta.risicogroep, ref.risicogroep, "patient.meta.risicogroep");
    is("risicogroep" in c.patient.zichtbaar, false, "risicogroep in zichtbaar");
    is(c.statusTeksten.af + "|" + c.statusTeksten.aan + "|" + c.statusTeksten.geenVerbetering48, "klachten nemen af.|klachten houden aan.|null", "statusTeksten");
    is(c.startToestanden, ["cystitis"], "startToestanden");
    is(c.patient.waar, { eGFR: 42, risicogroep: false }, "waar");
    is(c.score.duurzaamheid.regels.map(function (r) { return r.punten; }), [3, 2, 1], "punten");
    is(c.score.doelmatigheid.start, 3, "start");
    sleutelFouten(c).forEach(function (x) { f.push("sleutels: " + x); });
    return f;
  }
  reg("E1-M vorm: ernst, geldtIn, bron, vraag, reflectievragen, wanneer, raadplegen en kop kloppen", function (e) {
    T.gelijk(vormFouten(e), []);
  });
  reg("E1-M mutatiecontrole: tekst- en veldmutaties worden door de vormtest opgemerkt", function (e) {
    [
      ["wanneer -> altijd", function (c) { c.feedbackExtra[0].wanneer = "altijd"; }],
      ["ernst I3 -> 4", function (c) { c.invarianten[1].ernst = 4; }],
      ["geldtIn I4", function (c) { c.invarianten[2].geldtIn = ["E2"]; }],
      ["bron I1", function (c) { c.invarianten[0].bron = "[G]"; }],
      ["vraag I4 leesteken", function (c) { c.invarianten[2].vraag = c.invarianten[2].vraag.replace("?", "."); }],
      ["reflectievraag Terughoudend", function (c) { c.profielen[0].reflectievraag = c.profielen[0].reflectievraag.replace("patiënt", "patient"); }],
      ["reflectievraag Direct", function (c) { c.profielen[2].reflectievraag = c.profielen[2].reflectievraag.replace("zíj", "zij"); }],
      ["reflectievraag Gedeelde regie niet meer null", function (c) { c.profielen[1].reflectievraag = "?"; }],
      ["episode.raadplegen terug", function (c) { c.raadplegen = { titel: "x", bronnen: [] }; }],
      ["medicatieTekst zonder slotpunt", function (c) { c.patient.zichtbaar.medicatieTekst = c.patient.zichtbaar.medicatieTekst.slice(0, -1); }],
      ["kop", function (c) { c.patient.zichtbaar.kop = "Mevrouw V., 72 jaar"; }],
      ["risicogroep terug in zichtbaar", function (c) { c.patient.zichtbaar.risicogroep = c.patient.meta.risicogroep; }],
      ["risicogroep alleen in zichtbaar", function (c) { c.patient.zichtbaar.risicogroep = c.patient.meta.risicogroep; delete c.patient.meta.risicogroep; }],
      ["meta.risicogroep teken", function (c) { c.patient.meta.risicogroep = c.patient.meta.risicogroep.replace("[NHG]", "[NGH]"); }],
      ["meta.risicogroep slotpunt", function (c) { c.patient.meta.risicogroep = c.patient.meta.risicogroep.slice(0, -1); }],
      ["extra veld met hint in zichtbaar", function (c) { c.patient.zichtbaar.tip = "Kies nitrofurantoine"; }],
      ["extra veld met hint in een invariant", function (c) { c.invarianten[0].hint = "N1"; }],
      ["extra veld met hint in een kaartverwijzing", function (c) { c.invarianten[1].predicaat.args[0].label = "Aanbevolen"; }],
      ["extra veld in knoppen", function (c) { c.knoppen.hint = 1; }],
      ["extra sleutel in statusTeksten", function (c) { c.statusTeksten.toeneemt = "klachten nemen toe"; }],
      ["statusTekst af gewijzigd", function (c) { c.statusTeksten.af = "Klachten nemen af"; }],
      ["statusTekst geenVerbetering48 gewijzigd", function (c) { c.statusTeksten.geenVerbetering48 = "Na 48 uur geen verbetering"; }],
      ["extra veld in werkzaamheid", function (c) { c.werkzaamheid.cystitis.werkzaam[0].toelichting = "eerste keus"; }],
      ["extra veld in waar", function (c) { c.patient.waar.leeftijd = 72; }],
      ["extra veld in meta", function (c) { c.patient.meta.tip = "x"; }],
      ["extra veld in een profiel", function (c) { c.profielen[2].label = "1e keus"; }],
      ["extra veld in score", function (c) { c.score.extra = 1; }],
      ["extra veld in medicatie", function (c) { c.patient.medicatie[0].start = "2020"; }],
      ["extra veld in episode", function (c) { c.toelichting = "x"; }],
      ["toelichting direct op object i.p.v. onder meta", function (c) { c.invarianten[2].toelichting = "x"; }]
    ].forEach(function (m) {
      var c = kloon(e); m[1](c);
      T.waar(vormFouten(c).length > 0, "vormmutatie ongemerkt: " + m[0]);
    });
  });

  reg("S-LETTER: geen markdown-sterretjes en geen dubbele/rare spaties in de data", function (e) {
    alleStrings(e, [], "E1").forEach(function (x) {
      T.waar(x.s.indexOf("**") < 0, "markdown ** in " + x.pad);
      T.waar(x.s === x.s.trim(), "spatie aan rand in " + x.pad);
      T.waar(x.s.indexOf("  ") < 0, "dubbele spatie in " + x.pad);
    });
  });

  // TODO_BART vastgepind: per id de vraag, de gekozen lezing (exact), de plek (exact) en de plek in de data waar de markering moet staan.
  // Het weghalen, verplaatsen, verdubbelen of wijzigen van een markering, vraag, lezing of plek geeft rood.
  var TODO_PLEKKEN = [
    { id: "TODO_BART-E1-1", pad: function (e) { return vindInv(e, "I1"); }, plek: "E1.invarianten.I1", kern: ["zonder N1","geen V1"],
      vraag: "De casus noemt als invariant I1 'Een route zonder N1'. Telt een episode zonder enige route (niets gespeeld) ook als 'een route zonder N1', en telt afronden zonder gekozen route (geen V1, V2, V3, V4 of V5), ook mét N1, als geschonden?",
      lezing: "Strengste lezing: elke afronding zonder N1 schendt I1, ook als er helemaal geen route is gekozen. Ook afronden mét N1 maar zonder route-kaart (geen V1 t/m V5) schendt I1; de casus noemt dit geval niet, maar zonder deze lezing haalt een lege route de poort zonder profiel of duurzaamheidsscore." },
    { id: "TODO_BART-E1-2", pad: function (e) { return e.statusTeksten; }, plek: "E1.statusTeksten", kern: ["klachten nemen af.", "geen tekst"],
      vraag: "In episode 1 kunnen de klachten af, aan of na 48 uur niet verbeterd zijn, maar de casus geeft bij episode 1 geen statusteksten. Welke tekst hoort bij welke klachtenstatus?",
      lezing: "Status af = 'klachten nemen af.', status aan = 'klachten houden aan.' (casusfragmenten uit episode 2, met slotpunt). Voor de status na 48 uur geen verbetering geeft de casus in episode 1 geen tekst: leeg (geen tekst); de casus geeft die zin alleen in episode 3. In episode 1 komen aan en na 48 uur niet verbeterd niet voor." },
    { id: "TODO_BART-E1-3", pad: function (e) { return e.profielen[1]; }, plek: "E1.profielen.Gedeelde regie", kern: ["Geen reflectievraag"],
      vraag: "De casus geeft bij het profiel Gedeelde regie (uitgesteld recept) geen reflectievraag, wel bij Terughoudend en Direct behandelen. Welke reflectievraag hoort bij Gedeelde regie?",
      lezing: "Geen reflectievraag (leeg); er wordt niets verzonnen." },
    { id: "TODO_BART-E1-4", pad: function (e) { return e.profielen[2]; }, plek: "E1.profielen.Direct behandelen", kern: ["Eén profiel"],
      vraag: "De casus noemt bij de geldige routes 'Direct behandelen, 1e keus' (nitrofurantoïne), '2e keus' (fosfomycine) en '3e keus' (trimethoprim 3 dagen), maar geeft één reflectievraag. Is dat één profiel of drie?",
      lezing: "Eén profiel 'Direct behandelen' (V3, V4 of V5) met de ene reflectievraag uit de casus." },
    { id: "TODO_BART-E1-5", pad: function (e) { return e.feedbackExtra[0]; }, plek: "E1.feedbackExtra[O1]", kern: ["gehaalde poort"],
      vraag: "De casus noemt bij O1 gespeeld de vraag 'Wat doe je bij welke uitslag anders?'. Komt die vraag ook bij een poortschending?",
      lezing: "Alleen bij gehaalde poort; bij een schending verschijnt maar één vraag, die van de ernstigste schending." },
    { id: "TODO_BART-E1-6", pad: function (e) { return e.score.duurzaamheid.regels[1]; }, plek: "E1.score.duurzaamheid", kern: ["V2","= 2"],
      vraag: "De casus geeft als route 'V2 (+ middel) + N1 + N2 + Ev1' en rangschikt de duurzaamheid 'afwachten > uitgesteld recept > direct een antibioticum'. Telt uitgesteld recept met een middel erbij, of met V1 erbij, nog als 2 (uitgesteld recept)?",
      lezing: "Gespeeld V2 (ook met V1 of met een middel erbij) = 2, in lijn met profiel Gedeelde regie; V1 zonder V2 en zonder antibioticum = 3; een antibioticum zonder V2 = 1 (ook met V1 erbij, profiel Direct behandelen). Zonder gekozen route is er geen score (de poort is dan geschonden)." },
    { id: "TODO_BART-E1-7", pad: function (e) { return e.patient.meta; }, plek: "E1.patient.meta.risicogroep", kern: ["Nee","niet"],
      vraag: "Mag de student de risicogroepmelding zien? De casus zet bij de patiëntkaart de regel 'Geen risicogroep. De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].' Die regel legt de drempels (eGFR 30, leeftijd 75) vooraf uit. Mag hij bij de patiëntkaart getoond worden, of alleen in het overzicht voor de docent?",
      lezing: "Nee: de student ziet de risicogroepmelding niet. De regel staat in de data onder patient.meta.risicogroep (voor Bart en het overzicht); de student ziet alleen de kop, de klachten, de medicatie en het lab. Alternatief: de regel wel bij de patiëntkaart tonen." }
  ];
  var TODO_PADEN = ["E1.patient.meta.TODO_BART", "E1.statusTeksten.TODO_BART", "E1.invarianten[0].TODO_BART", "E1.score.duurzaamheid.regels[1].TODO_BART",
    "E1.profielen[1].TODO_BART", "E1.profielen[2].TODO_BART", "E1.feedbackExtra[0].TODO_BART"];
  var VERBODEN_IN_TODO = /contract|bouwopdracht|\bronde\b|\bronde\s?\d|\bstuk(ken)?\b|\bS\d\b|rapport|criticus|\bLEAD\b|TODO_BART|\bsectie\b|\bA\d\b|\btests?\b/i;
  function niet_leeg(x) { return typeof x === "string" && x.trim().length > 0; }
  // Alle sleutels die met TODO_BART beginnen, met pad; de episode mag er precies de vaste zeven hebben, elk één keer.
  function todoSleutels(e) {
    var uit = [];
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]"); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { if (/^TODO_BART/.test(k)) uit.push(pad + "." + k); else walk(x[k], pad + "." + k); });
    })(e, "E1");
    return uit.sort();
  }
  function todoFouten(e, lijst) {
    var f = [], mijn = lijst.filter(function (t) { return /^TODO_BART-E1-/.test(t.id); });
    if (JSON.stringify(mijn.map(function (t) { return t.id; })) !== JSON.stringify(TODO_PLEKKEN.map(function (p) { return p.id; }))) f.push("ids/volgorde");
    if (JSON.stringify(todoSleutels(e)) !== JSON.stringify(TODO_PADEN.slice().sort())) f.push("TODO_BART-sleutels in de data: " + todoSleutels(e).join(", "));
    TODO_PLEKKEN.forEach(function (p) {
      var t = mijn.filter(function (x) { return x.id === p.id; })[0];
      if (!t) { f.push(p.id + " ontbreekt"); return; }
      if (!niet_leeg(t.vraag) || t.vraag !== p.vraag) f.push(p.id + " vraag");
      if (!niet_leeg(t.gekozenLezing) || t.gekozenLezing !== p.lezing) f.push(p.id + " gekozenLezing");
      if (t.plek !== p.plek) f.push(p.id + " plek");
      if (JSON.stringify(Object.keys(t).sort()) !== JSON.stringify(["gekozenLezing", "id", "plek", "vraag"])) f.push(p.id + " extra of ontbrekende velden");
      p.kern.forEach(function (k) { if (String(t.gekozenLezing).indexOf(k) < 0) f.push(p.id + " kernzin " + k); });
      var obj = p.pad(e);
      if (!obj || typeof obj !== "object" || !niet_leeg(obj.TODO_BART) || obj.TODO_BART !== t.vraag) f.push(p.id + " markering op de plek");
      if (VERBODEN_IN_TODO.test(String(t.vraag)) || VERBODEN_IN_TODO.test(String(t.gekozenLezing))) f.push(p.id + " verwijst naar contract/ronde/stuk");
    });
    return f;
  }
  reg("S-TODO: elke TODO_BART in E1 staat op de plek zelf én in casus.todoBart (exacte id, vraag, gekozenLezing en plek; zelfstandig leesbaar)", function (e) {
    T.gelijk(todoFouten(e, casus().todoBart || []), []);
    var ids = (casus().todoBart || []).map(function (t) { return t.id; });
    T.is(ids.filter(function (v, i) { return ids.indexOf(v) === i; }).length, ids.length, "dubbele TODO-ids in casus.todoBart");
  });
  reg("S-TODO: elke TODO_BART-markering in de data hoort bij een TODO in casus.todoBart; precies zeven sleutels, geen TODO_BART_<naam>-extra's", function (e) {
    var vragen = (casus().todoBart || []).map(function (t) { return t.vraag; });
    T.gelijk(todoSleutels(e), TODO_PADEN.slice().sort());
    TODO_PADEN.forEach(function (pad) {
      var o = e, delen = pad.replace(/^E1\./, "").split(".");
      delen.forEach(function (d) { var m = /^(\w+)\[(\d+)\]$/.exec(d); o = m ? o[m[1]][+m[2]] : o[d]; });
      T.waar(niet_leeg(o) && vragen.indexOf(o) >= 0, "TODO_BART op " + pad + " staat niet in casus.todoBart");
    });
  });
  reg("S-TODO: TODO-teksten verwijzen niet naar contract, rondes, stukken of tests (alle E1-TODO's in casus.todoBart en in de data)", function (e) {
    todoSleutels(e).forEach(function (pad) {
      var o = e, delen = pad.replace(/^E1\./, "").split(".");
      delen.forEach(function (d) { var m = /^(\w+)\[(\d+)\]$/.exec(d); o = m ? o[m[1]][+m[2]] : o[d]; });
      T.waar(!VERBODEN_IN_TODO.test(o), "TODO op " + pad + " verwijst naar intern materiaal: " + o);
    });
    (casus().todoBart || []).filter(function (t) { return /^TODO_BART-E1-/.test(t.id); }).forEach(function (t) {
      T.waar(!VERBODEN_IN_TODO.test(t.vraag) && !VERBODEN_IN_TODO.test(t.gekozenLezing), t.id + " verwijst naar intern materiaal");
    });
  });
  reg("S-TODO: mutaties op de markeringen worden opgemerkt (weghalen, verplaatsen, verdubbelen, extra TODO-veld, wijzigen van vraag/lezing/plek)", function (e) {
    var lijst0 = casus().todoBart.filter(function (x) { return /^TODO_BART-E1-/.test(x.id); });
    var muts = [
      ["TODO van I1 weg", function (c) { delete c.invarianten[0].TODO_BART; }],
      ["TODO Gedeelde regie leeg", function (c) { c.profielen[1].TODO_BART = ""; }],
      ["TODO feedbackExtra weg", function (c) { delete c.feedbackExtra[0].TODO_BART; }],
      ["TODO Direct weg", function (c) { delete c.profielen[2].TODO_BART; }],
      ["TODO duurzaamheid weg", function (c) { delete c.score.duurzaamheid.regels[1].TODO_BART; }],
      ["TODO statusTeksten weg", function (c) { delete c.statusTeksten.TODO_BART; }],
      ["TODO risicogroep weg", function (c) { delete c.patient.meta.TODO_BART; }],
      ["TODO risicogroep verplaatst naar zichtbaar", function (c) { c.patient.zichtbaar.TODO_BART = c.patient.meta.TODO_BART; delete c.patient.meta.TODO_BART; }],
      ["tweede TODO-veld op I3", function (c) { c.invarianten[1].TODO_BART_extra = "Hint"; }],
      ["tweede TODO-veld op een profiel naast de eerste", function (c) { c.profielen[0].TODO_BART = c.profielen[1].TODO_BART; }],
      ["TODO_BART_naam naast TODO_BART op I1", function (c) { c.invarianten[0].TODO_BART_lezing = "x"; }],
      ["TODO_BART_naam in de zichtbare patiëntkaart", function (c) { c.patient.zichtbaar.TODO_BART_x = "x"; }],
      ["TODO op knoppen", function (c) { c.knoppen.TODO_BART = "x"; }],
      ["TODO-markering verwijst naar interne tekst", function (c) { c.patient.meta.TODO_BART = c.patient.meta.TODO_BART + " Zie het contract."; }],
      ["TODO_BART-sleutel als array-element", function (c) { c.zichtbaarAlsOntbreekt[0].TODO_BART_y = "y"; }]
    ];
    var tmuts = [
      ["lezing E1-1 vervangen", function (t) { t[0].gekozenLezing = "x"; }],
      ["lezing E1-1 hoofdletter", function (t) { t[0].gekozenLezing = t[0].gekozenLezing.replace("Strengste", "strengste"); }],
      ["lezing E1-4 leeg", function (t) { t[3].gekozenLezing = ""; }],
      ["lezing E1-7 leesteken", function (t) { t[6].gekozenLezing = t[6].gekozenLezing.replace("Nee:", "Nee."); }],
      ["vraag E1-3 leeg", function (t) { t[2].vraag = ""; }],
      ["vraag E1-2 teken", function (t) { t[1].vraag = t[1].vraag.replace("Welke", "Welk"); }],
      ["plek E1-5 gewijzigd", function (t) { t[4].plek = "E1.feedbackExtra"; }],
      ["plek E1-6 gewijzigd", function (t) { t[5].plek = "E1.score"; }],
      ["TODO E1-6 weggehaald", function (t) { t.pop(); }],
      ["TODO E1-7 weggehaald", function (t) { t.splice(6, 1); }],
      ["extra veld in een TODO-object", function (t) { t[0].toelichting = "x"; }],
      ["verwijzing naar ronde in lezing", function (t) { t[2].gekozenLezing += " (ronde 3)"; }]
    ];
    var n = 0;
    muts.forEach(function (m) { var c = kloon(e); m[1](c); T.waar(todoFouten(c, kloon(lijst0)).length > 0 || todoSleutels(c).length !== 7, "mutatie ongemerkt: " + m[0]); n++; });
    tmuts.forEach(function (m) { var t = kloon(lijst0); m[1](t); T.waar(todoFouten(kloon(e), t).length > 0, "mutatie ongemerkt: " + m[0]); n++; });
    T.is(n, muts.length + tmuts.length);
  });
})(typeof window !== "undefined" ? window : globalThis);

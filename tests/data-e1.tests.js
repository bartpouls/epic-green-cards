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
    T.gelijk(e.knoppen, { actiesPerBeurt: 3, aantalDagen: 5, raadplegenKost: 0 });
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
    T.is(s.af, "klachten nemen af");
    T.is(s.aan, "klachten houden aan");
    T.is(s.geenVerbetering48, "Na 48 uur geen verbetering.");
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
    Object.keys(ref).forEach(function (k) { is(c.patient.zichtbaar[k], ref[k], "patient.zichtbaar." + k); });
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
      ["kop", function (c) { c.patient.zichtbaar.kop = "Mevrouw V., 72 jaar"; }]
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

  // TODO_BART vastgepind: per id de vraag, de gekozen lezing (kernzinnen) en de plek in de data waar de markering moet staan.
  // Het weghalen of leegmaken van een markering, vraag of lezing geeft rood.
  var TODO_PLEKKEN = [
    { id: "TODO_BART-E1-1", pad: function (e) { return vindInv(e, "I1"); }, plek: "I1", kern: ["zonder N1", "geen V1"] },
    { id: "TODO_BART-E1-2", pad: function (e) { return e.statusTeksten; }, plek: "statusTeksten", kern: ["klachten nemen af", "Na 48 uur geen verbetering."] },
    { id: "TODO_BART-E1-3", pad: function (e) { return e.profielen[1]; }, plek: "profielen[Gedeelde regie]", kern: ["null"] },
    { id: "TODO_BART-E1-4", pad: function (e) { return e.profielen[2]; }, plek: "profielen[Direct behandelen]", kern: ["Eén profiel"] },
    { id: "TODO_BART-E1-5", pad: function (e) { return e.feedbackExtra[0]; }, plek: "feedbackExtra[0]", kern: ["gehaalde poort"] },
    { id: "TODO_BART-E1-6", pad: function (e) { return e.score.duurzaamheid.regels[1]; }, plek: "score.duurzaamheid.regels[1]", kern: ["V2", "= 2"] }
  ];
  function niet_leeg(x) { return typeof x === "string" && x.trim().length > 0; }
  reg("S-TODO: elke TODO_BART in E1 staat op de plek zelf én in casus.todoBart (id, niet-lege vraag, niet-lege gekozenLezing met kernzinnen, plek)", function (e) {
    var lijst = casus().todoBart || [];
    var mijn = lijst.filter(function (t) { return /^TODO_BART-E1-/.test(t.id); });
    T.gelijk(mijn.map(function (t) { return t.id; }), TODO_PLEKKEN.map(function (p) { return p.id; }), "de E1-TODO's in casus.todoBart (exact deze ids, deze volgorde)");
    TODO_PLEKKEN.forEach(function (p) {
      var t = mijn.filter(function (x) { return x.id === p.id; })[0];
      T.waar(niet_leeg(t.vraag), p.id + ": vraag is leeg");
      T.waar(niet_leeg(t.gekozenLezing), p.id + ": gekozenLezing is leeg");
      T.waar(niet_leeg(t.plek), p.id + ": plek is leeg");
      p.kern.forEach(function (k) { T.waar(t.gekozenLezing.indexOf(k) >= 0, p.id + ": gekozenLezing mist kernzin '" + k + "'"); });
      var obj = p.pad(e);
      T.waar(obj && typeof obj === "object", p.id + ": de plek (" + p.plek + ") bestaat niet in de data");
      T.waar(niet_leeg(obj.TODO_BART), p.id + ": TODO_BART ontbreekt of is leeg op de plek zelf (" + p.plek + ")");
      T.is(obj.TODO_BART, t.vraag, p.id + ": de TODO_BART op " + p.plek + " moet gelijk zijn aan de vraag in casus.todoBart");
    });
    var ids = mijn.map(function (t) { return t.id; });
    T.is(ids.filter(function (v, i) { return ids.indexOf(v) === i; }).length, ids.length, "dubbele TODO-ids");
  });
  reg("S-TODO: elke TODO_BART-markering in de data hoort bij een TODO in casus.todoBart (geen losse of verweesde markeringen)", function (e) {
    var vragen = (casus().todoBart || []).map(function (t) { return t.vraag; });
    var markeringen = [];
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]"); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { if (k === "TODO_BART") markeringen.push({ pad: pad, v: x[k] }); else walk(x[k], pad + "." + k); });
    })(e, "E1");
    T.is(markeringen.length, TODO_PLEKKEN.length, "aantal TODO_BART-markeringen in E1");
    markeringen.forEach(function (m) { T.waar(niet_leeg(m.v) && vragen.indexOf(m.v) >= 0, "TODO_BART op " + m.pad + " staat niet in casus.todoBart: " + m.v); });
  });
  reg("S-TODO: mutaties op de markeringen worden opgemerkt (weghalen, leegmaken, lezing/vraag leegmaken)", function (e) {
    var gevangen = 0;
    function check(mut, naam) {
      var c = kloon(e), t = kloon(casus().todoBart.filter(function (x) { return /^TODO_BART-E1-/.test(x.id); }));
      mut(c, t);
      var ok = true;
      TODO_PLEKKEN.forEach(function (p) {
        var tt = t.filter(function (x) { return x.id === p.id; })[0], o = p.pad(c);
        if (!tt || !niet_leeg(tt.vraag) || !niet_leeg(tt.gekozenLezing) || !o || !niet_leeg(o.TODO_BART) || o.TODO_BART !== tt.vraag) ok = false;
        else p.kern.forEach(function (k) { if (tt.gekozenLezing.indexOf(k) < 0) ok = false; });
      });
      T.waar(!ok, "mutatie ongemerkt: " + naam);
      gevangen++;
    }
    check(function (c) { delete vindInv(c, "I1").TODO_BART; }, "TODO_BART van I1 weg");
    check(function (c) { c.profielen[1].TODO_BART = ""; }, "TODO_BART Gedeelde regie leeg");
    check(function (c) { delete c.feedbackExtra[0].TODO_BART; }, "TODO_BART feedbackExtra weg");
    check(function (c) { delete c.profielen[2].TODO_BART; }, "TODO_BART Direct weg");
    check(function (c) { delete c.score.duurzaamheid.regels[1].TODO_BART; }, "TODO_BART duurzaamheid weg");
    check(function (c) { delete c.statusTeksten.TODO_BART; }, "TODO_BART statusTeksten weg");
    check(function (c, t) { t[0].gekozenLezing = "x"; }, "gekozenLezing E1-1 vervangen");
    check(function (c, t) { t[3].gekozenLezing = ""; }, "gekozenLezing E1-4 leeg");
    check(function (c, t) { t[2].vraag = ""; }, "vraag E1-3 leeg");
    check(function (c, t) { t.pop(); }, "TODO E1-6 weggehaald");
    T.is(gevangen, 10);
  });
})(typeof window !== "undefined" ? window : globalThis);

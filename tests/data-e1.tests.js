// Datavorm-tests voor episode 1 (stuk S2). Geen evaluator: alleen controle van de data in casussen/uwi-e1.js.
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

  reg("E1-1 patiëntkaart letterlijk uit de casus", function (e) {
    var z = e.patient.zichtbaar;
    T.is(z.naam, "Mevrouw V.");
    T.is(z.leeftijd, 72);
    T.is(z.klachten, "Eerste cystitis: pijnlijke en frequente mictie sinds 2 dagen, geen koorts, nitriettest positief.");
    T.gelijk(z.medicatie, ["lisinopril"]);
    T.is(z.medicatieTekst, "lisinopril (hypertensie)");
    T.gelijk(z.lab, { eGFR: 42, datum: "recent" });
    T.is(z.labTekst, "eGFR 42, recent.");
    T.is(z.risicogroep, "Geen risicogroep. De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].");
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
  reg("E1-2 knoppen, raadplegen en geen gebeurtenissen", function (e) {
    T.gelijk(e.knoppen, { actiesPerBeurt: 3, aantalDagen: 5, raadplegenKost: 0 });
    T.gelijk(e.gebeurtenissen, []);
    T.is(e.raadplegen.titel, "Richtlijn raadplegen");
    T.gelijk(e.raadplegen.bronnen, ["NHG", "KNMP"]);
    Object.keys(e.raadplegen).forEach(function (k) { T.waar(k === "titel" || k === "bronnen", "raadplegen bevat geen richtlijntekst: " + k); });
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
    T.gelijk(vindInv(e, "I1").predicaat, { p: "nietGespeeld", kaart: "N1" });
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

  reg("E1-4 score: duurzaamheid V1=3, V2=2, direct=1 (regelvorm)", function (e) {
    var r = e.score.duurzaamheid.regels;
    T.is(r.length, 3);
    T.gelijk(r.map(function (x) { return x.punten; }), [3, 2, 1]);
    T.waar(JSON.stringify(r[0].als).indexOf('"V1"') >= 0, "regel 1 gaat over V1");
    T.waar(JSON.stringify(r[1].als).indexOf('"V2"') >= 0, "regel 2 gaat over V2");
    T.gelijk(r[2].als, { p: "waarheid", waarde: true });
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
    T.gelijk(p["Gedeelde regie"].als, { p: "gespeeld", kaart: "V2" });
    T.gelijk(p["Direct behandelen"].als, { p: "of", args: [{ p: "gespeeld", kaart: "V3" }, { p: "gespeeld", kaart: "V4" }, { p: "gespeeld", kaart: "V5" }] });
  });

  reg("E1-5 feedbackExtra (O1 gespeeld) letterlijk", function (e) {
    T.is(e.feedbackExtra.length, 1);
    T.gelijk(e.feedbackExtra[0].trigger, { p: "gespeeld", kaart: "O1" });
    T.is(e.feedbackExtra[0].vraag, "Wat doe je bij welke uitslag anders?");
    T.waar(["altijd", "alleenBijGehaaldePoort"].indexOf(e.feedbackExtra[0].wanneer) >= 0, "wanneer");
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

  reg("S-LETTER: geen markdown-sterretjes en geen dubbele/rare spaties in de data", function (e) {
    alleStrings(e, [], "E1").forEach(function (x) {
      T.waar(x.s.indexOf("**") < 0, "markdown ** in " + x.pad);
      T.waar(x.s === x.s.trim(), "spatie aan rand in " + x.pad);
      T.waar(x.s.indexOf("  ") < 0, "dubbele spatie in " + x.pad);
    });
  });

  reg("S-TODO: elke TODO_BART-markering in E1 staat ook in casus.todoBart (id, vraag, gekozenLezing, plek)", function (e) {
    var lijst = casus().todoBart || [];
    var mijn = lijst.filter(function (t) { return /^TODO_BART-E1-/.test(t.id); });
    T.waar(mijn.length >= 6, "verwacht minstens 6 E1-TODO's, kreeg " + mijn.length);
    mijn.forEach(function (t) {
      ["id", "vraag", "gekozenLezing", "plek"].forEach(function (k) { T.waar(typeof t[k] === "string" && t[k].length > 0, t.id + " mist " + k); });
    });
    var ids = mijn.map(function (t) { return t.id; });
    T.is(ids.filter(function (v, i) { return ids.indexOf(v) === i; }).length, ids.length, "dubbele TODO-ids");
    var vragen = lijst.map(function (t) { return t.vraag; });
    var markeringen = [];
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]"); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { if (k === "TODO_BART") markeringen.push({ pad: pad, v: x[k] }); else walk(x[k], pad + "." + k); });
    })(e, "E1");
    T.waar(markeringen.length >= 5, "te weinig TODO_BART-markeringen in de data: " + markeringen.length);
    markeringen.forEach(function (m) { T.waar(vragen.indexOf(m.v) >= 0, "TODO_BART op " + m.pad + " staat niet in casus.todoBart: " + m.v); });
  });
})(typeof window !== "undefined" ? window : globalThis);

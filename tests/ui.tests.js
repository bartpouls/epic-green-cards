// Tests van de weergave (stuk S9, groep 'ui'). Draait in Node (gauntlet/tools/run-node.js) met een minimale nep-DOM,
// zonder browser. De echte browsercontrole staat in gauntlet/tools/speel-ui.js (Playwright, alle episodes via klikken).
//
// Laden: ui/ui.js moet geladen zijn (tests.html en run-node.js zetten het erbij: zie rapport "Verzoek aan LEAD"). Is window.UI
// er niet, dan probeert deze file het in Node zelf van schijf te laden; in de browser faalt dan de test 'ui.js is geladen'.
(function (g) {
  "use strict";
  var T = g.Test, GROEP = "ui";

  var UI = g.UI || null;
  var vereis = (typeof process !== "undefined" && process.mainModule && process.mainModule.require) ? process.mainModule.require.bind(process.mainModule) : null;
  var NODE = !!vereis;
  if (!UI && NODE) {
    try {
      var fs = vereis("fs"), pad = vereis("path"), vm = vereis("vm");
      var hoofd = (process.mainModule && process.mainModule.filename) || "";
      var root = pad.resolve(pad.dirname(hoofd), "../..");
      if (!fs.existsSync(pad.join(root, "ui/ui.js"))) root = process.cwd();
      vm.runInThisContext(fs.readFileSync(pad.join(root, "ui/ui.js"), "utf8"), { filename: "ui/ui.js" });
      UI = g.UI;
    } catch (e) { UI = null; }
  }

  // LEAD-aanpassing: in een echte browser is `window.document` alleen-lezen, dus de nep-DOM-tests (die document vervangen)
  // draaien alleen in Node; in de browser draait in plaats daarvan 'UI in echte DOM' (rooktest) hieronder.
  var IN_BROWSER = typeof document !== "undefined" && document && document.nodeType === 9 && typeof process === "undefined";
  function test(naam, fn) {
    if (IN_BROWSER && /metNepDom\(/.test(String(fn))) return; // nep-DOM-test: alleen in Node (zie boven)
    T.registreer(GROEP, naam, fn);
  }
  // Rooktest in een ECHTE browser-DOM (alleen in de browser): start het echte scherm, vul een pseudoniem in en kies episode 1.
  // De volledige speelcontrole in Chromium staat in gauntlet/tools/speel-ui.js.
  if (IN_BROWSER) T.registreer(GROEP, "UI in echte DOM (rooktest): pseudoniem verplicht, daarna episodekeuze en patiëntkaart", function () {
    var root = document.createElement("div"); document.body.appendChild(root);
    try {
      try { if (g.Logging && g.Logging.wis) g.Logging.wis(); } catch (e) {}
      g.UI.start(root);
      var invoer = root.querySelector("#pseudoniem"), knop = root.querySelector("#btn-start");
      T.waar(invoer && knop, "startscherm mist het pseudoniemveld of de startknop");
      knop.click();
      T.waar(/pseudoniem|code/i.test(root.textContent), "zonder pseudoniem hoort er een melding of uitleg te blijven staan");
      invoer.value = "rooktest"; knop.click();
      var tekst = root.textContent;
      T.waar(tekst.indexOf(g.CASUSSEN[0].episodes[0].patient.zichtbaar.kop) !== -1 || /episode|Episode/.test(tekst), "na het invullen van een pseudoniem hoort de episodekeuze of de patiëntkaart zichtbaar te zijn");
    } finally { if (root.parentNode) root.parentNode.removeChild(root); try { if (g.Logging && g.Logging.wis) g.Logging.wis(); } catch (e) {} }
  });
  function casus() { return g.CASUSSEN[0]; }
  function ep(id) { return casus().episodes.filter(function (e) { return e.id === id; })[0]; }
  function nieuw(id, rng) { return g.Engine.nieuwSpel(casus(), id, { rng: rng || function () { return 0; } }); }
  function speel(state, kaart, doel, optie) {
    var r = g.Engine.speelKaart(state, kaart, { doel: doel || null, optie: optie || null });
    if (!r.ok) throw new Error("speelKaart " + kaart + ": " + r.fout);
    return r;
  }
  function volgende(state, n) { for (var i = 0; i < (n || 1); i++) g.Engine.volgendeDag(state); }
  function sleutels(o) { return Object.keys(o).sort(); }

  test("ui.js is geladen (window.UI met start en de logica-functies)", function () {
    T.waar(UI && typeof UI.start === "function" && typeof UI.kaartenPerCategorie === "function", "window.UI ontbreekt: voeg ui/ui.js toe aan tests.html en run-node.js");
  });
  if (!UI) return;

  /* ---------- pseudoniem ---------- */
  test("pseudoniem: leeg of alleen spaties is niet toegestaan, met Nederlandse melding", function () {
    ["", "   ", null, undefined, "\t\n"].forEach(function (x) {
      var c = UI.pseudoniemControle(x);
      T.is(c.ok, false); T.waar(/pseudoniem/i.test(c.fout), "melding noemt pseudoniem");
    });
    var ok = UI.pseudoniemControle("  abc-1 ");
    T.is(ok.ok, true); T.is(ok.waarde, "abc-1");
  });
  test("pseudoniem: vergelijken negeert hoofdletters en spaties; leeg is nooit gelijk", function () {
    T.waar(UI.zelfdePseudoniem(" ABC ", "abc"));
    T.waar(!UI.zelfdePseudoniem("abc", "abd"));
    T.waar(!UI.zelfdePseudoniem("", ""));
  });

  /* ---------- episodes ontgrendelen ---------- */
  function rec(ps, ep, geschonden) { return { pseudoniem: ps, casusId: "uwi-eerstelijn", episodeId: ep, geschonden: geschonden || [] }; }
  test("episodekeuze: alleen E1 open voor een nieuwe speler; E2 en E3 vergrendeld", function () {
    var o = UI.episodeOverzicht(casus(), "nieuw", []);
    T.gelijk(o.map(function (x) { return x.open; }), [true, false, false]);
    T.gelijk(o.map(function (x) { return x.gehaald; }), [false, false, false]);
    T.is(o[1].vorige, "Episode 1");
  });
  test("episodekeuze: E2 opent pas na een gehaalde E1 van DEZE speler (hoofdletters/spaties tellen niet)", function () {
    T.gelijk(UI.episodeOverzicht(casus(), "Anna", [rec("anna", "E1", ["I1"])]).map(function (x) { return x.open; }), [true, false, false]);
    T.gelijk(UI.episodeOverzicht(casus(), "Anna", [rec("piet", "E1", [])]).map(function (x) { return x.open; }), [true, false, false]);
    T.gelijk(UI.episodeOverzicht(casus(), "Anna", [rec(" ANNA ", "E1", [])]).map(function (x) { return x.open; }), [true, true, false]);
    T.gelijk(UI.episodeOverzicht(casus(), "Anna", [rec("anna", "E1", []), rec("anna", "E2", [])]).map(function (x) { return x.open; }), [true, true, true]);
  });

  /* ---------- kaarten: voor het spelen alleen categorie + label ---------- */
  test("kaarten: per kaart ALLEEN id, label en categorie (geen effect, downside, bron, doelen, opties)", function () {
    ["E1", "E2", "E3"].forEach(function (e) {
      UI.kaartenPerCategorie(casus(), ep(e)).forEach(function (grp) {
        grp.kaarten.forEach(function (k) { T.gelijk(sleutels(k), ["categorie", "id", "label"], "sleutels van " + k.id); });
      });
    });
  });
  test("kaarten: het repertoire per episode (12, 15, 26) staat gegroepeerd in de volgorde van de bibliotheek", function () {
    var aantallen = { E1: 12, E2: 15, E3: 26 };
    Object.keys(aantallen).forEach(function (e) {
      var groepen = UI.kaartenPerCategorie(casus(), ep(e)), ids = [];
      groepen.forEach(function (grp) { grp.kaarten.forEach(function (k) { ids.push(k.id); T.is(k.categorie, grp.categorie); }); });
      T.is(ids.length, aantallen[e], "aantal in " + e);
      T.gelijk(ids.slice().sort(), ep(e).repertoire.slice().sort(), "repertoire " + e);
    });
    var namen = UI.kaartenPerCategorie(casus(), ep("E3")).map(function (x) { return x.categorie; });
    T.is(namen.length, 6, "zes categorieën in E3");
    T.is(new Set(UI.kaartenPerCategorie(casus(), ep("E3")).map(function (x) { return x.klasse; })).size, 6, "elke categorie een eigen kleurklasse");
    // labels letterlijk uit de data
    UI.kaartenPerCategorie(casus(), ep("E3")).forEach(function (grp) {
      grp.kaarten.forEach(function (k) { T.is(k.label, casus().kaarten.filter(function (x) { return x.id === k.id; })[0].label); });
    });
  });

  /* ---------- doelen en opties ---------- */
  test("doelen: alleen wat de engine toestaat (V6 pas na een gestart middel, B2 alleen op actief middel)", function () {
    var st = nieuw("E2");
    T.gelijk(UI.toegestaneDoelen(casus(), ep("E2"), st, "B2"), [], "geen antibioticum actief");
    T.gelijk(UI.toegestaneDoelen(casus(), ep("E2"), st, "V6").map(function (d) { return d.id; }), ["lisinopril"], "V6: alleen bestaande medicatie");
    speel(st, "O1"); speel(st, "V5");
    T.gelijk(UI.toegestaneDoelen(casus(), ep("E2"), st, "V6").map(function (d) { return d.id; }), ["V5", "lisinopril"]);
    T.gelijk(UI.toegestaneDoelen(casus(), ep("E2"), st, "B2").map(function (d) { return d.id; }), ["V5"]);
    UI.toegestaneDoelen(casus(), ep("E2"), st, "V6").forEach(function (d) {
      var r = g.Engine.speelKaart(st, "V6", { doel: d.id, optie: UI.optiesVoor(casus().kaarten.filter(function (k) { return k.id === "V6"; })[0], d.id, function () { return 0; })[0] });
      T.waar(r.ok, "engine staat toegestaan doel " + d.id + " toe: " + r.fout);
      st.actiesOver = 3;
    });
  });
  test("doelen: elk door de UI aangeboden doel wordt door de engine geaccepteerd, elk niet aangeboden doel geweigerd (E3, B3/B4/B5/Ev2)", function () {
    var st = nieuw("E3");
    ["B3", "B4", "B5", "Ev2", "B1", "B2"].forEach(function (k) {
      var kaart = casus().kaarten.filter(function (x) { return x.id === k; })[0];
      var alle = kaart.doelen.E3.map(function (d) { return d.id; });
      var aangeboden = UI.toegestaneDoelen(casus(), ep("E3"), st, k).map(function (d) { return d.id; });
      alle.forEach(function (id) {
        var probe = JSON.parse(JSON.stringify(st));
        Object.defineProperty(probe, "_casus", { value: casus(), enumerable: false });
        var r = g.Engine.speelKaart(probe, k, { doel: id });
        T.is(r.ok, aangeboden.indexOf(id) >= 0, k + " op " + id + (r.fout ? " (" + r.fout + ")" : ""));
      });
    });
    T.gelijk(UI.toegestaneDoelen(casus(), ep("E3"), st, "B5"), [], "B5: niets gepauzeerd");
    speel(st, "B3", "spironolacton");
    T.gelijk(UI.toegestaneDoelen(casus(), ep("E3"), st, "B5").map(function (d) { return d.id; }), ["spironolacton"]);
  });
  test("opties: alleen de teksten, willekeurige volgorde, data ongewijzigd, `goed` nooit in de uitvoer", function () {
    var v6 = casus().kaarten.filter(function (k) { return k.id === "V6"; })[0];
    var voor = JSON.stringify(v6.opties);
    var a = UI.optiesVoor(v6, "V5", function () { return 0; }), b = UI.optiesVoor(v6, "V5", function () { return 0.99; });
    T.gelijk(a.slice().sort(), v6.opties.V5.map(function (o) { return o.tekst; }).sort());
    T.waar(a.every(function (x) { return typeof x === "string"; }));
    T.waar(a.join("|") !== b.join("|"), "andere rng geeft andere volgorde");
    var gezien = {}, n = 0, i = 0;
    for (; i < 60; i++) { var o = UI.optiesVoor(v6, "V5", Math.random).join("|"); if (!gezien[o]) { gezien[o] = 1; n++; } }
    T.waar(n >= 4, "met Math.random meerdere volgordes (kreeg " + n + ")");
    T.is(JSON.stringify(v6.opties), voor, "data niet gemuteerd");
  });

  /* ---------- na het spelen ---------- */
  test("na spelen: onthulling bij een onthullende kaart, anders effect[episode] ?? effect.alle, anders niets", function () {
    var st = nieuw("E2");
    speel(st, "G2");
    var o = UI.naSpelenTekst(casus(), ep("E2"), st, "G2");
    T.is(o.soort, "onthuld"); T.is(o.tekst, ep("E2").patient.verborgen[0].onthult);
    var v3 = UI.naSpelenTekst(casus(), ep("E2"), st, "V3");
    T.is(v3.soort, "effect"); T.is(v3.tekst, casus().kaarten.filter(function (k) { return k.id === "V3"; })[0].effect.alle);
    var st1 = nieuw("E1");
    var g2 = UI.naSpelenTekst(casus(), ep("E1"), st1, "G2");
    T.is(g2.tekst, casus().kaarten.filter(function (k) { return k.id === "G2"; })[0].effect.E1, "per-episode effect");
    T.is(UI.naSpelenTekst({ kaarten: [{ id: "X", effect: null }] }, { id: "E1" }, { onthuld: [] }, "X"), null);
  });

  test("patiëntkaart: alleen zichtbare velden; onthullen werkt de kaart bij en markeert het veld als nieuw", function () {
    var st = nieuw("E2");
    var v0 = UI.patientVelden(ep("E2"), st);
    T.gelijk(v0.map(function (v) { return v.sleutel; }), ["kop", "klachten", "medicatieTekst", "labTekst", "eerdereUWI"]);
    T.waar(v0.every(function (v) { return !v.nieuw; }));
    T.is(v0.filter(function (v) { return v.sleutel === "labTekst"; })[0].tekst, ep("E2").patient.zichtbaar.labTekst);
    var alles0 = JSON.stringify(v0);
    T.waar(alles0.indexOf("29") < 0, "ware eGFR niet zichtbaar vóór G2");
    speel(st, "G2");
    var lab = UI.patientVelden(ep("E2"), st).filter(function (v) { return v.sleutel === "labTekst"; })[0];
    T.is(lab.tekst, ep("E2").patient.verborgen[0].zichtbaar.labTekst); T.is(lab.nieuw, true);
    // E3: kweek pas na G3
    var s3 = nieuw("E3");
    T.waar(UI.patientVelden(ep("E3"), s3).every(function (v) { return v.sleutel !== "eerdereKweek"; }));
    speel(s3, "G3");
    T.is(UI.patientVelden(ep("E3"), s3).filter(function (v) { return v.sleutel === "eerdereKweek"; })[0].tekst, ep("E3").patient.verborgen[0].onthult);
    // nooit meta, waar of TODO_BART
    ["E1", "E2", "E3"].forEach(function (e) {
      var tekst = JSON.stringify(UI.patientVelden(ep(e), nieuw(e)));
      T.waar(!/TODO_BART|risicogroep/i.test(tekst), "geen risicogroep/TODO in patiëntkaart " + e);
      var m = ep(e).patient.meta;
      if (m && m.risicogroep) T.waar(tekst.indexOf(m.risicogroep) < 0, "meta.risicogroep niet getoond " + e);
    });
  });

  /* ---------- tijdlijn ---------- */
  test("tijdlijn: dagen met gespeelde kaarten (doel en optie), banners en klachtenstatus uit de data", function () {
    var st = nieuw("E2");
    speel(st, "O1"); speel(st, "V4"); speel(st, "N1");
    volgende(st);
    speel(st, "N2", "V4");
    var d = UI.dagenModel(casus(), ep("E2"), st);
    T.is(d.length, 2); T.is(d[1].huidig, true); T.is(d[0].huidig, false);
    T.gelijk(d[0].kaarten.map(function (k) { return k.titel; }), ["Urinekweek inzetten", "Fosfomycine", "Alarmsignalen bespreken"]);
    T.is(d[1].kaarten[0].titel, "Gebruik en verwachting uitleggen → Fosfomycine");
    T.is(d[1].status, ep("E2").statusTeksten.af, "status na werkzaam middel");
    T.is(d[0].status, null);
    var s3 = nieuw("E3", function () { return 0; });
    ["G3", "O1", "V4"].forEach(function (k) { speel(s3, k); }); volgende(s3);
    speel(s3, "N1"); volgende(s3);
    var dd = UI.dagenModel(casus(), ep("E3"), s3);
    T.is(dd[2].banners.length, 1);
    T.is(dd[2].banners[0].tekst, ep("E3").gebeurtenissen.filter(function (x) { return x.id === "A"; })[0].tekst, "banner = gebeurtenistekst uit de data");
    // doel met optie
    var s2 = nieuw("E2");
    ["O1", "V5"].forEach(function (k) { speel(s2, k); }); volgende(s2, 2);
    speel(s2, "V6", "V5", "halveren");
    var dm = UI.dagenModel(casus(), ep("E2"), s2), laatste = dm[dm.length - 1].kaarten[0];
    T.is(laatste.titel, "Dosis aanpassen → Trimethoprim (halveren)");
  });
  test("tijdlijn: raadplegen telt als regel, niet als kaart", function () {
    var st = nieuw("E3"); g.Engine.raadpleeg(st);
    var d = UI.dagenModel(casus(), ep("E3"), st);
    T.is(d[0].raadplegingen, 1); T.is(d[0].kaarten.length, 0);
    var m = UI.raadpleegModel(casus(), g.Engine.raadpleeg(st));
    T.is(m.titel, casus().raadplegen.titel);
    T.gelijk(m.bronnen.map(function (b) { return b.sleutel; }), casus().raadplegen.bronnen);
    m.bronnen.forEach(function (b) { T.is(b.tekst, casus().bronnen[b.sleutel]); });
  });

  /* ---------- evaluatie ---------- */
  test("evaluatiemodel: bij schending ÉÉN vraag, geen score, geen profiel, geen extra vragen, wel downsides", function () {
    var m = UI.evaluatieModel({ poortGehaald: false, vraag: "Vraag?", geschonden: [{ id: "I1" }, { id: "I4" }],
      downsides: [{ kaart: "V3", label: "L", tekst: "T", soort: "gespeeld" }, { kaart: "N1", label: "L2", tekst: "T2", soort: "weggelaten" }],
      score: { duurzaamheid: 3 }, profiel: { naam: "P", reflectievraag: "R" }, extraVragen: [{ vraag: "Extra?" }], zichtbaar: [{ tekst: "Zin." }] });
    T.is(m.gehaald, false); T.is(m.vraag, "Vraag?"); T.is(m.scores.length, 0); T.is(m.profiel, null);
    T.is(m.extraVragen.length, 0); T.is(m.zichtbaar.length, 0); T.is(m.downsides.length, 2);
  });
  test("evaluatiemodel: bij gehaalde poort score per as, profiel, reflectievraag (of niets), extra vragen en zichtbaar-zinnen", function () {
    var m = UI.evaluatieModel({ poortGehaald: true, vraag: null, downsides: [], score: { duurzaamheid: 2, doelmatigheid: 3 },
      profiel: { naam: "P", reflectievraag: null }, extraVragen: [{ vraag: "A?", wanneer: "altijd" }], zichtbaar: [{ tekst: "Zin." }] });
    T.is(m.gehaald, true); T.is(m.vraag, null);
    T.gelijk(m.scores.map(function (s) { return [s.as, s.waarde]; }), [["duurzaamheid", 2], ["doelmatigheid", 3]]);
    T.is(m.profiel.naam, "P"); T.is(m.profiel.reflectievraag, null);
    T.gelijk(m.extraVragen, ["A?"]); T.gelijk(m.zichtbaar, ["Zin."]);
    var leeg = UI.evaluatieModel({ poortGehaald: true, score: { duurzaamheid: null, doelmatigheid: 3 }, profiel: null });
    T.gelijk(leeg.scores.map(function (s) { return s.as; }), ["doelmatigheid"], "een as zonder score wordt overgeslagen");
    T.is(leeg.profiel, null);
  });
  test("evaluatiemodel: echte uitkomst van de Engine (E1 afwachten: score 3/3, profiel, reflectievraag; E1 zonder N1: één vraag)", function () {
    var ok = nieuw("E1"); ["V1", "N1", "Ev1"].forEach(function (k) { speel(ok, k); });
    var m = UI.evaluatieModel(g.Engine.rondAf(ok));
    T.is(m.gehaald, true); T.is(m.profiel.naam, "Terughoudend"); T.waar(typeof m.profiel.reflectievraag === "string");
    var fout = nieuw("E1"); speel(fout, "V3");
    var f = UI.evaluatieModel(g.Engine.rondAf(fout));
    T.is(f.gehaald, false); T.waar(typeof f.vraag === "string" && f.vraag.length > 5); T.is(f.scores.length, 0);
  });
  test("opslagmelding: precies de afgesproken tekst bij mislukt opslaan, anders niets", function () {
    T.is(UI.opslagMelding({ bewaard: false }), "Resultaten staan alleen in dit tabblad: exporteer nu.");
    T.is(UI.opslagMelding({ bewaard: true }), null);
    T.is(UI.opslagMelding(null), null);
  });

  /* ---------- geen klinische tekst of drempels in de code ---------- */
  test("ui.js bevat geen middelnamen, kaart-id's of klinische drempels (broncode-scan, zonder commentaar)", function () {
    if (!NODE) return;   // in de browser is de bron niet leesbaar
    var fs = vereis("fs"), pad = vereis("path");
    var hoofd = (process.mainModule && process.mainModule.filename) || "", root = pad.resolve(pad.dirname(hoofd), "../..");
    if (!fs.existsSync(pad.join(root, "ui/ui.js"))) root = process.cwd();
    var bron = fs.readFileSync(pad.join(root, "ui/ui.js"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'])\/\/.*$/gm, "$1");
    var verboden = [];
    casus().kaarten.forEach(function (k) {
      if (k.categorie === "Voorschrijven" || k.categorie === "Onderzoek") verboden.push(k.label);
    });
    casus().episodes.forEach(function (e) { e.patient.medicatie.forEach(function (m) { verboden.push(m.label); }); });
    ["eGFR", "kalium", "mg", "NHG", "SIDRIK", "Kompas", "KNMP", "cystitis", "weefselinvasie", "Mevrouw"].forEach(function (w) { verboden.push(w); });
    verboden.forEach(function (w) {
      var re = new RegExp("(^|[^a-zA-Zë])" + w.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + "($|[^a-zA-Zë])", "i");
      T.waar(!re.test(bron), "ui.js bevat '" + w + "'");
    });
    T.waar(!/["'](G[123]|O[12]|V\d{1,2}|B[1-5]|N[1-3]|Ev[1-3]|I\d{1,2})["']/.test(bron), "ui.js bevat een kaart- of invariant-id");
    T.waar(!/\b(E1|E2|E3)\b/.test(bron.replace(/"Episode "/g, "")), "ui.js noemt een episode-id");
  });

  /* ====================================================================== */
  /* Nep-DOM: de hele flow zonder browser                                    */
  /* ====================================================================== */
  function maakDom() {
    var doc = { activeElement: null, readyState: "complete" };
    function Knoop(tag) { this.tagName = String(tag).toUpperCase(); this.children = []; this.attrs = {}; this.handlers = {}; this.className = ""; this.value = ""; this.parent = null; }
    Knoop.prototype.appendChild = function (c) { c.parent = this; this.children.push(c); return c; };
    Knoop.prototype.setAttribute = function (k, v) { this.attrs[k] = String(v); };
    Knoop.prototype.getAttribute = function (k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; };
    Knoop.prototype.addEventListener = function (t, f) { (this.handlers[t] = this.handlers[t] || []).push(f); };
    Knoop.prototype.focus = function () { doc.activeElement = this; };
    Knoop.prototype.replaceChildren = function () { var self = this; this.children = []; for (var i = 0; i < arguments.length; i++) self.appendChild(arguments[i]); };
    Object.defineProperty(Knoop.prototype, "textContent", { get: function () { return this.children.map(function (c) { return c.tekst !== undefined ? c.tekst : c.textContent; }).join(""); } });
    doc.createElement = function (t) { return new Knoop(t); };
    doc.createTextNode = function (t) { return { tekst: String(t), children: [] }; };
    doc.getElementById = function () { return null; };
    doc.Knoop = Knoop;
    return doc;
  }
  function alle(el, f, uit) {
    uit = uit || [];
    if (el.tagName && f(el)) uit.push(el);
    (el.children || []).forEach(function (c) { alle(c, f, uit); });
    return uit;
  }
  function vind(root, f) { return alle(root, f)[0] || null; }
  function metId(root, id) { return vind(root, function (e) { return e.getAttribute("id") === id; }); }
  function metAttr(root, k, v) { return vind(root, function (e) { return e.getAttribute(k) === v; }); }
  function klik(el) {
    if (!el) throw new Error("element niet gevonden om op te klikken");
    if (el.getAttribute("disabled") !== null) return false;
    var ev = { target: el, currentTarget: el, preventDefault: function () {}, key: null };
    (el.handlers.click || []).forEach(function (f) { f(ev); });
    return true;
  }
  function tekstVan(root) { return root.textContent; }

  function metNepDom(fn, opslag) {
    var oud = g.document, Log = g.Logging;
    var doc = maakDom(), root = new doc.Knoop("div");
    g.document = doc;
    Log._zetOpslag(opslag === undefined ? nepOpslag() : opslag);
    try { UI.start(root); fn(root, doc); }
    finally { g.document = oud; if (oud === undefined) delete g.document; Log._zetOpslag(undefined); Log.wis(); }
  }
  function nepOpslag() {
    var d = {};
    return { getItem: function (k) { return Object.prototype.hasOwnProperty.call(d, k) ? d[k] : null; }, setItem: function (k, v) { d[k] = String(v); }, removeItem: function (k) { delete d[k]; } };
  }
  function begin(root, naam) {
    var invoer = metId(root, "pseudoniem"); invoer.value = naam || "tester";
    klik(metId(root, "btn-start"));
  }
  function startEp(root, e) { klik(metAttr(root, "data-start", e)); }
  function speelKlik(root, kaart) { var b = metAttr(root, "data-kaart", kaart); if (!klik(b)) throw new Error("kaart " + kaart + " is uitgeschakeld"); }
  function afronden(root) { klik(metId(root, "btn-afronden")); klik(metId(root, "btn-afronden-ja")); }

  test("nep-DOM startscherm: pseudoniem verplicht, uitleg 'geen naam', leeg geeft melding en blijft op het startscherm", function () {
    metNepDom(function (root) {
      T.waar(/geen naam/.test(tekstVan(root)), "uitleg ontbreekt");
      T.waar(metId(root, "pseudoniem"), "invoerveld");
      metId(root, "pseudoniem").value = "  ";
      klik(metId(root, "btn-start"));
      T.waar(/Vul een pseudoniem in/.test(tekstVan(metId(root, "pseudoniem-fout"))), "foutmelding");
      T.waar(metId(root, "btn-start"), "nog steeds startscherm");
      begin(root, "anna");
      T.waar(metAttr(root, "data-start", "E1"), "episodekeuze zichtbaar");
    });
  });

  test("nep-DOM episodekeuze: E2 en E3 uitgeschakeld tot de vorige gehaald is; na gehaalde E1 opent E2", function () {
    metNepDom(function (root) {
      begin(root, "anna");
      T.is(metAttr(root, "data-start", "E1").getAttribute("disabled"), null);
      T.is(metAttr(root, "data-start", "E2").getAttribute("disabled"), "");
      T.is(metAttr(root, "data-start", "E3").getAttribute("disabled"), "");
      startEp(root, "E1");
      ["V1", "N1", "Ev1"].forEach(function (k) { speelKlik(root, k); });
      afronden(root);
      T.waar(/Veiligheid gehaald/.test(tekstVan(root)));
      klik(metId(root, "btn-terug"));
      T.is(metAttr(root, "data-start", "E2").getAttribute("disabled"), null, "E2 open");
      T.is(metAttr(root, "data-start", "E3").getAttribute("disabled"), "", "E3 nog dicht");
    });
  });

  test("nep-DOM spelscherm: kaarten alleen met label onder de juiste categoriekop; geen effect, downside of bron in de tekst", function () {
    metNepDom(function (root) {
      begin(root, "anna"); startEp(root, "E1");
      var tekst = tekstVan(root);
      casus().kaarten.forEach(function (k) {
        var eff = k.effect && typeof k.effect === "object" ? Object.keys(k.effect).map(function (s) { return k.effect[s]; }) : [k.effect];
        var dn = k.downside && typeof k.downside === "object" ? Object.keys(k.downside).map(function (s) { return k.downside[s]; }) : [k.downside];
        var zichtbaarPatient = Object.keys(ep("E1").patient.zichtbaar).map(function (s) { return ep("E1").patient.zichtbaar[s]; });
        eff.concat(dn, [k.bron]).forEach(function (t) {
          if (typeof t !== "string" || t.length < 6 || zichtbaarPatient.indexOf(t) >= 0) return;
          T.waar(tekst.indexOf(t) < 0, "lek van " + k.id + ": " + t);
        });
      });
      var knoppen = alle(root, function (e) { return e.getAttribute("data-kaart") !== null; });
      T.is(knoppen.length, 12);
      knoppen.forEach(function (b) {
        var k = casus().kaarten.filter(function (x) { return x.id === b.getAttribute("data-kaart"); })[0];
        T.is(b.textContent, k.label);
        T.gelijk(sleutels(b.attrs), ["class", "data-fokus", "data-kaart", "type"].filter(function (s) { return b.attrs[s] !== undefined; }), "geen extra attributen op " + k.id);
      });
      T.waar(!/aanbevolen|eerste keus|beste/i.test(tekst), "geen aanbevolen/eerste keus");
      T.is(metId(root, "dagtelling").textContent, "Dag 1 van 5");
      T.waar(!/TODO_BART|Geen risicogroep/.test(tekst), "geen risicogroep of TODO in beeld");
      T.waar(tekst.indexOf(ep("E1").patient.zichtbaar.kop) >= 0, "patiëntkop");
    });
  });

  test("nep-DOM: foutroute E1 geeft één vraag zonder score; 'Opnieuw' start een schoon spel; gehaalde route toont score en profiel", function () {
    metNepDom(function (root) {
      begin(root, "anna"); startEp(root, "E1");
      speelKlik(root, "V3"); afronden(root);
      var vraag = metId(root, "socratisch");
      T.waar(vraag && vraag.textContent.length > 10, "vraag aanwezig");
      T.is(alle(root, function (e) { return /(^| )vraag( |$)/.test(e.className); }).length, 1, "precies één vraag");
      T.waar(!/van 3/.test(tekstVan(root)), "geen score");
      T.waar(!metId(root, "profiel"), "geen profiel");
      T.waar(alle(root, function (e) { return e.getAttribute("data-downside") !== null; }).length > 0, "downsides getoond");
      klik(metId(root, "btn-opnieuw"));
      T.is(alle(root, function (e) { return e.getAttribute("data-gespeeld") !== null; }).length, 0, "lege tijdlijn");
      ["V1", "N1", "Ev1"].forEach(function (k) { speelKlik(root, k); });
      afronden(root);
      T.is(metId(root, "profiel").textContent, "Terughoudend");
      T.waar(metId(root, "reflectie"), "reflectievraag");
      T.is(alle(root, function (e) { return e.getAttribute("data-score") !== null; }).length, 2, "twee scoreregels");
      T.waar(!metId(root, "socratisch"), "geen schendingsvraag");
    });
  });

  test("nep-DOM: acties lopen terug, bij 0 acties zijn kaarten uitgeschakeld, 'Volgende dag' geeft nieuw budget", function () {
    metNepDom(function (root) {
      begin(root, "anna"); startEp(root, "E1");
      ["G1", "G2", "O2"].forEach(function (k) { speelKlik(root, k); });
      T.is(metId(root, "acties").getAttribute("data-over"), "0");
      T.is(metAttr(root, "data-kaart", "V1").getAttribute("disabled"), "");
      klik(metId(root, "btn-volgende-dag"));
      T.is(metId(root, "acties").getAttribute("data-over"), "3");
      T.is(metId(root, "dagtelling").textContent, "Dag 2 van 5");
    });
  });

  test("nep-DOM: doelkaart vraagt eerst om een doel (alleen toegestane), V6 daarna om een optie in een andere volgorde per rng", function () {
    var records = [rec("anna", "E1", []), rec("anna", "E2", [])];
    metNepDom(function (root) {
      begin(root, "anna"); startEp(root, "E3");
      speelKlik(root, "V4");
      klik(metId(root, "btn-volgende-dag"));
      UI._rng = function () { return 0; };
      speelKlik(root, "V6");
      var dlg = vind(root, function (e) { return e.getAttribute("role") === "dialog"; });
      T.waar(dlg, "dialoog open");
      var doelen = alle(dlg, function (e) { return e.getAttribute("data-doel") !== null; }).map(function (e) { return e.getAttribute("data-doel"); });
      T.gelijk(doelen, ["lisinopril"], "alleen toegestane doelen (V6 kan niet op het gestarte V4; wel op lisinopril)");
      klik(metAttr(dlg, "data-doel", "lisinopril"));
      var o1 = alle(root, function (e) { return e.getAttribute("data-optie") !== null; }).map(function (e) { return e.getAttribute("data-optie"); });
      T.is(o1.length, 3);
      klik(metId(root, "btn-annuleer"));
      UI._rng = function () { return 0.99; };
      speelKlik(root, "V6"); klik(metAttr(root, "data-doel", "lisinopril"));
      var o2 = alle(root, function (e) { return e.getAttribute("data-optie") !== null; }).map(function (e) { return e.getAttribute("data-optie"); });
      T.waar(o1.join("|") !== o2.join("|"), "optievolgorde wisselt");
      UI._rng = null;
      klik(metAttr(root, "data-optie", "halveren"));
      T.is(alle(root, function (e) { return e.getAttribute("data-gespeeld") === "V6"; }).length, 1, "V6 gespeeld");
      T.waar(/Dosis aanpassen → lisinopril \(halveren\)/.test(tekstVan(root)), "tijdlijn toont doel en optie");
    }, (function () { var o = nepOpslag(); o.setItem("egc.logging.v1", JSON.stringify(records)); return o; })());
  });

  test("nep-DOM: onthullen — tekst direct na de kaart en patiëntkaart bijgewerkt; vóór de kaart niet in beeld", function () {
    var records = [rec("anna", "E1", [])];
    metNepDom(function (root) {
      begin(root, "anna"); startEp(root, "E2");
      var onth = ep("E2").patient.verborgen[0];
      T.waar(tekstVan(root).indexOf(onth.onthult) < 0 && tekstVan(root).indexOf("29") < 0, "vooraf niet zichtbaar");
      T.waar(tekstVan(root).indexOf(ep("E2").patient.zichtbaar.labTekst) >= 0, "oude waarde zichtbaar");
      speelKlik(root, "G2");
      T.waar(metId(root, "onthuld").textContent.indexOf(onth.onthult) >= 0, "onthulling direct");
      T.waar(metAttr(root, "data-veld", "labTekst").textContent.indexOf(onth.onthult) >= 0, "patiëntkaart bijgewerkt");
    }, (function () { var o = nepOpslag(); o.setItem("egc.logging.v1", JSON.stringify(records)); return o; })());
  });

  test("nep-DOM: elke afgeronde poging wordt bewaard (eerste poging true, daarna false) met tijdlijn", function () {
    metNepDom(function (root) {
      begin(root, "Anna"); startEp(root, "E1");
      speelKlik(root, "V3"); afronden(root);
      klik(metId(root, "btn-opnieuw"));
      ["V1", "N1", "Ev1"].forEach(function (k) { speelKlik(root, k); }); afronden(root);
      var l = g.Logging.alle();
      T.is(l.length, 2);
      T.is(l[0].eerstePoging, true); T.is(l[1].eerstePoging, false);
      T.is(l[0].pseudoniem, "Anna"); T.is(l[0].tijdlijn.length, 1); T.is(l[1].tijdlijn.length, 3);
      T.waar(l[0].geschonden.length > 0 && l[1].geschonden.length === 0);
      T.is(l[1].profiel.naam, "Terughoudend");
    });
  });

  test("nep-DOM: opslag mislukt geeft de melding 'Resultaten staan alleen in dit tabblad: exporteer nu.'; met werkende opslag niet", function () {
    metNepDom(function (root) {          // opslag null = geen opslag: alleen geheugen
      begin(root, "anna"); startEp(root, "E1");
      ["V1", "N1", "Ev1"].forEach(function (k) { speelKlik(root, k); }); afronden(root);
      T.waar(tekstVan(root).indexOf("Resultaten staan alleen in dit tabblad: exporteer nu.") >= 0, "melding ontbreekt");
      T.waar(metId(root, "btn-export"), "exportknop");
    }, null);
    metNepDom(function (root) {
      begin(root, "anna"); startEp(root, "E1");
      ["V1", "N1", "Ev1"].forEach(function (k) { speelKlik(root, k); }); afronden(root);
      T.waar(tekstVan(root).indexOf("alleen in dit tabblad") < 0, "geen melding bij werkende opslag");
    });
  });

  test("nep-DOM: de knop 'Exporteer resultaten' roept Logging.downloadAlles aan", function () {
    metNepDom(function (root) {
      begin(root, "anna");
      var oud = g.Logging.downloadAlles, aangeroepen = 0;
      g.Logging.downloadAlles = function () { aangeroepen++; return { csv: true, json: true }; };
      try { klik(metId(root, "btn-export")); } finally { g.Logging.downloadAlles = oud; }
      T.is(aangeroepen, 1);
      T.waar(/downloadmap/.test(tekstVan(root)));
    });
  });

  test("nep-DOM: gebeurtenis-banner staat aan het begin van de dag; A en B volgen de gekozen volgorde (rng)", function () {
    var records = [rec("anna", "E1", []), rec("anna", "E2", [])];
    function eerste(rngWaarde) {
      var uit = null, oudRandom = Math.random;
      Math.random = function () { return rngWaarde; };
      try {
        metNepDom(function (root) {
          begin(root, "anna"); startEp(root, "E3");
          ["G1", "G3", "O2"].forEach(function (k) { speelKlik(root, k); });
          klik(metId(root, "btn-volgende-dag"));
          speelKlik(root, "G1");
          T.is(alle(root, function (e) { return e.getAttribute("data-gebeurtenis") !== null; }).length, 0, "banner pas op de volgende dag");
          klik(metId(root, "btn-volgende-dag"));
          var b = alle(root, function (e) { return e.getAttribute("data-gebeurtenis") !== null && /banner/.test(e.className); })[0];
          uit = b.getAttribute("data-gebeurtenis");
          T.waar(b.textContent.length > 10, "banner heeft tekst");
        }, (function () { var o = nepOpslag(); o.setItem("egc.logging.v1", JSON.stringify(records)); return o; })());
      } finally { Math.random = oudRandom; }
      return uit;
    }
    var a = eerste(0), b = eerste(0.99);
    T.waar(a && b && a !== b, "twee volgordes: " + a + " / " + b);
  });
})(typeof window !== "undefined" ? window : globalThis);

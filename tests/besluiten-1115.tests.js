/* Tests voor de besluiten van Bart van 15 november 2026 (casus-uwi.md versie 1.4, sectie 11).
   Per besluit dat gedrag verandert minstens één goed-geval en één fout-geval, met de ECHTE instellingen van de casus
   (Engine + Evaluatie + UI-logica + Logging). De conceptteksten (voorschot) worden gecontroleerd op tekst, markering en vastlegging. */
(function (g) {
  "use strict";
  var T = g.Test, G = "besluiten-1115";
  var SP = "spironolacton", DATUM = /15 november 2026/, LAAT = 0.99;
  function casus() { return g.CASUSSEN[0]; }
  function ep(id) { return casus().episodes.filter(function (e) { return e.id === id; })[0]; }
  function inv(id, i) { return ep(id).invarianten.filter(function (x) { return x.id === i; })[0]; }
  function nieuw(id, rng) { return g.Engine.nieuwSpel(casus(), id, { rng: function () { return rng || 0; } }); }   // rng 0: A op dag 3, B op dag 5
  function geb(s, id) { return s.gebeurtenissen.filter(function (x) { return x.id === id; })[0]; }
  function ids(u) { return u.geschonden.map(function (x) { return x.id; }); }
  function todo(id) { return casus().todoBart.filter(function (t) { return t.id === id; })[0]; }
  function beoordeel(s) { return g.Evaluatie.beoordeel(casus(), s.episodeId, s); }
  // De casus zonder het einde na een kaart (casus 1.5: na Verwijzen stopt de episode), om de aftrekregel voor Verwijzen los te toetsen.
  var zonderEinde = null;
  function casusZonderEinde() {
    if (!zonderEinde) { zonderEinde = JSON.parse(JSON.stringify(casus())); zonderEinde.episodes.forEach(function (e) { delete e.eindeNaKaart; }); }
    return zonderEinde;
  }
  function zinnen(u) { return u.gevolgen.map(function (x) { return x.tekst; }); }
  function opmerkingen(u) { return u.extraVragen.filter(function (x) { return x.soort === "opmerking"; }).map(function (x) { return x.vraag; }); }
  // Speelt een plan: een lijst dagen, elke dag een lijst "kaart", "kaart:doel" of "kaart:doel:optie". Een geweigerde kaart is een fout.
  function speel(id, plan, rng, c) {
    var s = c ? g.Engine.nieuwSpel(c, id, { rng: function () { return rng || 0; } }) : nieuw(id, rng);
    plan.forEach(function (dag, i) {
      if (i > 0) g.Engine.volgendeDag(s);
      dag.forEach(function (x) {
        var p = x.split(":"), o = {}; if (p[1]) o.doel = p[1]; if (p[2]) o.optie = p[2];
        var r = g.Engine.speelKaart(s, p[0], o);
        if (!r.ok) throw new Error("kaart " + x + " op dag " + s.dag + " geweigerd: " + r.fout);
      });
    });
    return s;
  }
  var DOSIS = "V6:V8:875/125 mg 2 dd", HALF = "V6:lisinopril:halveren";
  // Basisroute episode 3 (rng 0: A op dag 3, de kweekuitslag op dag 4, B op dag 5): fosfomycine, na A een nieuwe kweek en de wissel naar
  // amoxicilline/clavulaanzuur in de juiste dosis, opvolgmoment, na B de sick day-set. Haalt de poort, doelmatigheid 3, zonder opmerking.
  function basisE3() {
    return [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", DOSIS], ["Ev1"], ["B3:" + SP, HALF, "N3"], ["Ev1"]];
  }

  /* ---------- vastlegging ---------- */
  var BESLIST = ["TODO_BART-N3", "TODO_BART-E2-16", "TODO_BART-E3-3", "TODO_BART-E2-10", "TODO_BART-E3-11", "TODO_BART-E3-21", "TODO_BART-R6"];
  var CONCEPT = ["TODO_BART-C1", "TODO_BART-C2", "TODO_BART-C3", "TODO_BART-C4"];
  T.registreer(G, "vastlegging: casus 1.4; de zeven besliste vragen houden vraag, lezing en plek en hebben een besluit in één zin met de datum; de concepten en de nieuwe vraag zijn open", function () {
    T.is(casus().versie, "1.5");
    BESLIST.forEach(function (id) {
      var t = todo(id);
      T.waar(!!t, id + " staat nog in de data");
      T.waar(typeof t.besluit === "string" && DATUM.test(t.besluit) && /Bart/.test(t.besluit) && t.besluit.split(". ").length <= 2, id + " heeft een besluit met datum");
      T.waar(typeof t.vraag === "string" && typeof t.gekozenLezing === "string" && typeof t.plek === "string", id + " houdt vraag, gekozen lezing en plek");
    });
    T.gelijk(casus().todoBart.filter(function (t) { return t.besluit !== undefined && DATUM.test(t.besluit); }).map(function (t) { return t.id; }).sort(), BESLIST.slice().sort());
    CONCEPT.forEach(function (id) {
      var t = todo(id);
      T.waar(!!t && t.besluit === undefined && typeof t.vraag === "string" && typeof t.gekozenLezing === "string" && typeof t.plek === "string", id + " is een open vraag met lezing en plek");
    });
    CONCEPT.forEach(function (id) { T.waar(/^Concept/.test(todo(id).vraag) && /ter goedkeuring/.test(todo(id).vraag), id + " is herkenbaar als concept ter goedkeuring"); });
  });
  T.registreer(G, "vastlegging: de lijst voor Bart heeft een groep 'Beslist op 15 november 2026' met precies de besliste vragen en een groep met de concepten ter goedkeuring; elk id bestaat en staat in één groep", function () {
    var gr = g.TODO_BART_GROEPEN;
    if (!gr) return;   // de lijst is niet geladen (bv. een losse testpagina zonder gauntlet/)
    var beslist = gr.filter(function (x) { return x.titel === "Beslist op 15 november 2026"; });
    T.is(beslist.length, 1); T.is(beslist[0].beslist, true);
    T.gelijk(beslist[0].ids.slice().sort(), BESLIST.slice().sort());
    var concept = gr.filter(function (x) { return /ter goedkeuring/.test(x.titel) && /15 november 2026/.test(x.titel); });
    T.is(concept.length, 1); T.gelijk(concept[0].ids, CONCEPT); T.waar(!concept[0].beslist, "de concepten zijn niet beslist");
    // De vraag over Verwijzen (C5) is op 16 november 2026 beslist; zie tests/besluiten-1116.tests.js.
    var alleIds = casus().todoBart.map(function (t) { return t.id; }), gezien = {};
    gr.forEach(function (x) {
      T.waar(Array.isArray(x.ids) && !x.vast, "elke groep verwijst naar vragen in de data: " + x.titel);
      x.ids.forEach(function (id) {
        T.waar(alleIds.indexOf(id) >= 0, "onbekend id in de lijst: " + id);
        T.waar(!gezien[id], "dubbel in de lijst: " + id); gezien[id] = true;
        T.is(!!x.beslist, todo(id).besluit !== undefined, "beslist of open klopt met de data: " + id);
      });
    });
  });

  /* ---------- besluit 1: gebeurtenissen in episode 3 op een vaste dag ---------- */
  T.registreer(G, "besluit 1 (vaste dagen): weefselinvasie en uitdroging verschijnen aan het begin van dag 3 en dag 5, in beide volgordes, ook zonder kaarten; de dagen staan in de data", function () {
    function loop(rng) { var s = nieuw("E3", rng); for (var i = 0; i < 4; i++) g.Engine.volgendeDag(s); return s.gebeurtenissen.map(function (x) { return x.id + "@" + x.dag; }); }
    T.gelijk(loop(0), ["A@3", "B@5"]); T.gelijk(loop(LAAT), ["B@3", "A@5"]);
    var A = ep("E3").gebeurtenissen.filter(function (x) { return x.id === "A"; })[0], B = ep("E3").gebeurtenissen.filter(function (x) { return x.id === "B"; })[0];
    T.gelijk([A.trigger, B.trigger], [{ type: "opDag", dag: 3 }, { type: "opDag", dag: 5 }]); T.is(A.groep, "AB"); T.is(B.groep, "AB");
    // andere dagen in de data geven andere dagen in het spel (instelling, geen code)
    var c = JSON.parse(JSON.stringify(casus()));
    c.episodes[2].gebeurtenissen[0].trigger.dag = 2; c.episodes[2].gebeurtenissen[1].trigger.dag = 6;
    var s = g.Engine.nieuwSpel(c, "E3", { rng: function () { return 0; } }); for (var i = 0; i < 5; i++) g.Engine.volgendeDag(s);
    T.gelijk(s.gebeurtenissen.filter(function (x) { return x.id === "A" || x.id === "B"; }).map(function (x) { return x.id + "@" + x.dag; }), ["A@2", "B@6"]);
  });
  T.registreer(G, "besluit 1 (vaste dagen): het aantal gespeelde kaarten doet er niet meer toe: zeven kaarten op dag 1 en 2 geven geen gebeurtenis eerder dan dag 3", function () {
    var s = speel("E3", [["G1", "G2", "G3"], ["N1", "O2", "N3"]]);
    T.gelijk(s.gebeurtenissen, []); T.gelijk(s.wachtend, [], "niets in de wacht na de 4e kaart");
    g.Engine.volgendeDag(s); T.gelijk(s.gebeurtenissen.map(function (x) { return x.id + "@" + x.dag; }), ["A@3"]);
    g.Engine.speelKaart(s, "Ev1", {}); g.Engine.volgendeDag(s);
    T.is(geb(s, "B"), undefined, "na de 7e kaart komt B niet op dag 4");
  });
  T.registreer(G, "besluit 1 (willekeur): zonder rng-optie kiest het spel per poging; beide volgordes komen voor", function () {
    var gezien = {};
    for (var i = 0; i < 80; i++) gezien[g.Engine.nieuwSpel(casus(), "E3").volgordeAB.join()] = true;
    T.gelijk(Object.keys(gezien).sort(), ["A,B", "B,A"]);
  });
  T.registreer(G, "besluit 1 (escalatie): staat A op dag 5 gepland en geeft de escalatie op dag 5 ook weefselinvasie, dan komt er één weefselinvasie; daarna volgt sepsis vier volle dagen later", function () {
    var s = nieuw("E3", LAAT); for (var i = 0; i < 4; i++) g.Engine.volgendeDag(s);
    T.is(s.klachten[4].reeks, 3, "drie volle dagen op dag 4: de escalatie valt op dag 5");
    T.gelijk(s.gebeurtenissen.map(function (x) { return x.id + "@" + x.dag; }), ["B@3", "A@5"], "één weefselinvasie"); T.gelijk(s.wachtend, []);
    T.is(s.toestanden.filter(function (t) { return t === "weefselinvasie"; }).length, 1);
    for (var j = 0; j < 4; j++) g.Engine.volgendeDag(s);
    T.is(geb(s, "S").dag, 9); T.is(s.uitkomst.afloop, "verloren");
  });

  /* ---------- besluit 2: afronden spoelt door ---------- */
  T.registreer(G, "besluit 2 (doorspoelen): afronden mag altijd en loopt dag voor dag door tot dag 14, precies als 'Volgende dag' zonder kaarten; dan volgt de beoordeling", function () {
    var a = speel("E1", [["V1", "N1", "Ev1"]]), b = speel("E1", [["V1", "N1", "Ev1"]]);
    var u = g.Engine.rondAf(a);
    for (var i = 0; i < 13; i++) g.Engine.volgendeDag(b);
    T.is(a.afgerond, true); T.is(a.dag, 14); T.is(u.poortGehaald, true); T.is(u, a.uitkomst);
    T.gelijk(a.klachten, b.klachten, "dezelfde klachten per dag als met de hand doorlopen");
    T.gelijk(a.tijdlijn, b.tijdlijn); T.is(a.actiesOver, b.actiesOver);
    T.gelijk(beoordeel(b), u, "dezelfde beoordeling");
    T.is("afrondenPasNaGebeurtenissen" in a, false); T.is(casus().episodes.some(function (e) { return "afrondenPasNaGebeurtenissen" in e; }), false, "de oude instelling is uit de data");
  });
  T.registreer(G, "besluit 2 (doorspoelen): bij elke gebeurtenis stopt het doorspoelen op die dag, zonder beoordeling; de speler kan reageren en rondt opnieuw af (kweekuitslag, A, B)", function () {
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP]]);
    var r = g.Engine.rondAf(s);
    T.gelijk(r, { gestopt: true, van: 2, dag: 3, gebeurtenissen: ["A"] }); T.is(s.afgerond, false); T.is(s.uitkomst, null); T.is(s.actiesOver, 3);
    ["O1", "B1:V8", DOSIS].forEach(function (x) { var p = x.split(":"); T.is(g.Engine.speelKaart(s, p[0], p[1] ? { doel: p[1], optie: p[2] || undefined } : {}).ok, true, "reageren op dag 3: " + x); });
    r = g.Engine.rondAf(s); T.gelijk(r, { gestopt: true, van: 3, dag: 4, gebeurtenissen: ["C"] });
    T.is(g.Engine.speelKaart(s, "Ev1", {}).ok, true);
    r = g.Engine.rondAf(s); T.gelijk(r, { gestopt: true, van: 4, dag: 5, gebeurtenissen: ["B"] });
    ["B3:" + SP, HALF, "N3"].forEach(function (x) { var p = x.split(":"); g.Engine.speelKaart(s, p[0], p[1] ? { doel: p[1], optie: p[2] || undefined } : {}); });
    r = g.Engine.rondAf(s); T.gelijk(r, { gestopt: true, van: 5, dag: 6, gebeurtenissen: ["C2"] }, "de uitslag van de nieuwe kweek");
    T.is(g.Engine.speelKaart(s, "Ev1", {}).ok, true);
    var u = g.Engine.rondAf(s);
    T.is(s.afgerond, true); T.is(s.dag, 14); T.is(u.poortGehaald, true, ids(u).join()); T.is(u.profiel.naam, "Kweekgestuurd");
    T.gelijk(s.doorgespoeld.map(function (x) { return x.van + ">" + x.tot + ":" + x.gebeurtenissen.join(); }), ["2>3:A", "3>4:C", "4>5:B", "5>6:C2", "6>14:"]);
  });
  T.registreer(G, "besluit 2 (doorspoelen): wie niet reageert en telkens opnieuw afrondt, ontloopt niets: zonder werkzaam middel eindigt het doorspoelen in sepsis en is de episode verloren", function () {
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP]]);
    var u = g.Test.rondAfTotEinde(s);
    T.is(u.afloop, "verloren"); T.is(u.poortGehaald, false); T.is(u.score, null); T.is(s.dag, 7); T.is(geb(s, "S").dag, 7);
    T.waar(ids(u).indexOf("I10") >= 0 && ids(u).indexOf("I15") >= 0 && ids(u).indexOf("I16") >= 0, "de eisen na A en B tellen: " + ids(u).join());
    T.gooit(function () { g.Engine.volgendeDag(s); }, "na het einde geen volgende dag");
    T.is(g.Engine.rondAf(s), u, "nog eens afronden geeft dezelfde uitkomst");
  });
  T.registreer(G, "besluit 2 (weergave): de bevestiging zegt wat de knop doet en de melding bij een stop zegt waarom het doorspoelen stopte; de tijdlijn kent de doorgespoelde dagen", function () {
    var s = speel("E2", [["G2", "O1", "V4"], ["N1"]]);
    T.is(g.UI.afrondUitleg(s), "De dagen lopen door tot dag 14 of tot er iets gebeurt.");
    var r = g.Engine.rondAf(s);
    T.is(g.UI.doorspoelStopTekst(r), "Het doorspoelen stopte op dag 4, omdat er iets gebeurde. Reageer als je wilt en kies daarna opnieuw ‘Episode afronden’.");
    var dagen = g.UI.dagenModel(casus(), ep("E2"), s);
    T.gelijk(dagen.map(function (d) { return d.doorgespoeld; }), [false, false, true, true], "dag 3 en 4 zijn doorgespoeld");
    T.gelijk(dagen[3].banners.map(function (b) { return b.id; }), ["C"], "de gebeurtenis staat op de dag van de stop");
    var bron = g.UI._bron;
    T.waar(bron.indexOf('"afronden-uitleg"') > 0 && bron.indexOf('"doorspoel-stop"') > 0 && bron.indexOf('"btn-afronden-ja"') > 0 && bron.indexOf('"btn-afronden"') > 0, "de elementen staan in de interface");
  });
  T.registreer(G, "besluit 2 (logging): de export klopt met de tijdlijn: doorgespoelde dagen zijn dagen zonder kaarten en tellen mee in 'dagen' en 'dagen zonder actie'", function () {
    var d = {}, nep = { getItem: function (k) { return k in d ? d[k] : null; }, setItem: function (k, v) { d[k] = String(v); }, removeItem: function (k) { delete d[k]; } };
    g.Logging._zetOpslag(nep);
    try {
      var s = speel("E2", [["G2", "O1", "V4"], ["N1", "N2:V4"]]);
      g.Engine.rondAf(s); var u = g.Engine.rondAf(s);
      var rec = g.Logging.bewaarUitSpel(s, u, "Door", { testmodus: false });
      T.is(rec.dagen, 14); T.is(rec.afgeleid.dagenZonderActie, 12); T.is(rec.tijdlijn.length, 5);
      T.gelijk(rec.doorgespoeld, [{ van: 2, tot: 4, gebeurtenissen: ["C"] }, { van: 4, tot: 14, gebeurtenissen: [] }]);
      T.waar(rec.tijdlijn.every(function (x) { return x.dag <= 2; }), "geen kaart op een doorgespoelde dag");
      T.is(rec.tijdlijnTekst.split("; ").length, 5); T.waar(!/Dag (?:[3-9]|1[0-4]):/.test(rec.tijdlijnTekst), rec.tijdlijnTekst);
      var regels = g.Logging.exportCSV().replace(/^﻿/, "").split("\r\n"), kop = regels[0].split(";"), rij = regels[1].split(";");
      T.is(kop.length, 23, "de kolommen van de export zijn ongewijzigd"); T.is(kop[kop.length - 1], "afloop");
      T.is(rij[rij.length - 4], "12", "dagen zonder actie"); T.is(rij[rij.length - 3], "14", "dagen"); T.is(rij[rij.length - 2], "5", "aantal kaarten");
      T.waar(/Kweekuitslag \(dag 4\)/.test(regels[1]), "de gebeurtenis staat met haar dag in de export");
      var js = JSON.parse(g.Logging.exportJSON());
      T.gelijk(js[0].doorgespoeld, rec.doorgespoeld); T.is(js[0].casusVersie, "1.5");
      var ov = g.UI.overzichtModel(casus(), js, "Door");
      T.is(ov[0].rijen.length, 14, "het leesbare overzicht toont alle 14 dagen"); T.gelijk(ov[0].rijen[9].kaarten, []);
    } finally { g.Logging._zetOpslag(undefined); g.Logging.wis(); }
  });

  /* ---------- besluit 3: hint bij I5 zonder kweekuitslag ---------- */
  var HINT = "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?";
  var HINT_ZONDER = "Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?";
  T.registreer(G, "besluit 3 (hint I5): met een kweekuitslag in deze poging blijft de vraag uit de casus; zonder kweekuitslag verschijnt de variant (episode 2)", function () {
    var met = speel("E2", [["G2", "O1", "V3"], ["N1"]]);
    var u = g.Test.rondAfTotEinde(met);
    T.gelijk(ids(u), ["I5"]); T.is(geb(met, "C").dag, 4); T.is(u.vraag, HINT); T.is(g.UI.evaluatieModel(u).hint, HINT);
    var zonder = speel("E2", [["G2", "V3"], ["N1"]]);   // geen kweek ingezet: er komt geen uitslag
    var v = g.Test.rondAfTotEinde(zonder);
    T.waar(ids(v).indexOf("I5") === 0, ids(v).join()); T.is(geb(zonder, "C"), undefined); T.is(v.vraag, HINT_ZONDER); T.is(g.UI.evaluatieModel(v).hint, HINT_ZONDER);
    // de uitslag is nog niet binnen op het moment van beoordelen (tussenstand): ook dan de variant
    T.is(beoordeel(speel("E2", [["G2", "O1", "V3"], ["N1"]])).vraag, HINT_ZONDER);
  });
  T.registreer(G, "besluit 3 (hint I5): hetzelfde in episode 3; de variant is gemarkeerd als concept ter goedkeuring en de vraag uit de casus staat ongewijzigd in de data", function () {
    var zonder = beoordeel(speel("E3", [["V3", "N1", "O2"]]));
    T.is(zonder.geschonden[0].id, "I5"); T.is(zonder.vraag, HINT_ZONDER);
    var met = speel("E3", [["O1", "V3", "N1"], ["O2"], [], []]);
    T.is(geb(met, "C").dag, 4);
    var u = beoordeel(met); T.is(u.geschonden.filter(function (x) { return x.id === "I5"; })[0].vraag, HINT);
    ["E2", "E3"].forEach(function (e) {
      var i5 = inv(e, "I5");
      T.is(i5.vraag, HINT, e); T.is(i5.vraagVarianten.length, 1);
      T.is(i5.vraagVarianten[0].vraag, HINT_ZONDER); T.is(i5.vraagVarianten[0].concept, true);
      T.gelijk(i5.vraagVarianten[0].als, { p: "niet", arg: { p: "gebeurtenisGeweest", id: "C" } });
      T.is(i5.vraagVarianten[0].TODO_BART, todo("TODO_BART-C1").vraag);
    });
    T.waar(todo("TODO_BART-C1").vraag.indexOf(HINT_ZONDER) > 0, "de open vraag noemt de concepttekst letterlijk");
  });

  /* ---------- besluit 4a: overbodige kaarten kosten doelmatigheid ---------- */
  var NIET_NODIG = "Deze kaart was hier niet nodig: ";
  T.registreer(G, "besluit 4a (a, episode 2): Kalium bepalen zonder trimethoprim kost 1 punt en geeft de opmerking; met trimethoprim niet", function () {
    var fout = speel("E2", [["G2", "O1", "V4"], ["N1", "O2"]]);
    var u = g.Test.rondAfTotEinde(fout);
    T.is(u.poortGehaald, true); T.is(u.score.doelmatigheid, 2, "3 − 1"); T.gelijk(opmerkingen(u), [NIET_NODIG + "Kalium bepalen"]);
    T.gelijk(u.aftrek, [{ as: "doelmatigheid", naam: "Kalium bepalen zonder trimethoprim", delta: -1, kaart: "O2", doel: null, tekst: NIET_NODIG + "Kalium bepalen" }]);
    T.waar(g.UI.evaluatieModel(u).extraVragen.indexOf(NIET_NODIG + "Kalium bepalen") >= 0, "de opmerking staat bij de feedback van de opleider");
    var goed = speel("E2", [["G2", "O1", "V5"], ["O2", "N1"], [], ["V6:V5:halveren", "B1:V4"]]);
    var v = g.Test.rondAfTotEinde(goed);
    T.is(v.poortGehaald, true, ids(v).join()); T.is(v.score.doelmatigheid, 3); T.gelijk(opmerkingen(v), []); T.gelijk(v.aftrek, []);
  });
  T.registreer(G, "besluit 4a (e, episode 2): Dosis aanpassen op lisinopril kost 1 punt (er is geen uitdroging); samen met Kalium bepalen en zonder G2 blijft de ondergrens 1", function () {
    var u = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V4"], ["N1", HALF]]));
    T.is(u.poortGehaald, true); T.is(u.score.doelmatigheid, 2); T.gelijk(opmerkingen(u), [NIET_NODIG + "Dosis aanpassen (lisinopril)"]);
    var v = g.Test.rondAfTotEinde(speel("E2", [["O1", "V4", "N1"], ["O2", "V6:lisinopril:stoppen"]]));
    T.is(v.poortGehaald, true); T.is(v.score.doelmatigheid, 1, "2 − 1 − 1 = 0, ondergrens 1"); T.is(ep("E2").score.doelmatigheid.min, 1);
    T.gelijk(opmerkingen(v), [NIET_NODIG + "Kalium bepalen", NIET_NODIG + "Dosis aanpassen (lisinopril)"], "per getroffen regel één opmerking");
  });
  T.registreer(G, "besluit 4a (episode 1 ongewijzigd, en alleen bij een gehaalde poort): in episode 1 geen nieuwe regel of opmerking; bij een schending geen score en geen opmerking", function () {
    var e1 = g.Test.rondAfTotEinde(speel("E1", [["V4", "N1", "N2:V4"], ["O2"]]));
    T.is(e1.score.doelmatigheid, 2, "de bestaande regel van episode 1"); T.gelijk(opmerkingen(e1), []); T.gelijk(e1.aftrek, []);
    T.is(ep("E1").score.doelmatigheid.regels.length, 2); T.is(ep("E1").score.doelmatigheid.opmerkingBijAftrek, undefined);
    var fout = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V4"], ["O2"]]));   // zonder alarmsignalen
    T.gelijk(ids(fout), ["I1"]); T.is(fout.score, null); T.gelijk(fout.extraVragen, []); T.gelijk(fout.aftrek, []);
  });
  T.registreer(G, "besluit 4a (episode 3, goed): de basisroute haalt de poort met doelmatigheid 3 en zonder opmerking (tweede kweek op de dag van A, sick day-kaarten op de dag van B)", function () {
    var s = speel("E3", basisE3());
    T.is(geb(s, "A").dag, 3); T.is(geb(s, "B").dag, 5);
    var u = beoordeel(s);
    T.gelijk(ids(u), []); T.is(u.score.doelmatigheid, 3); T.is(u.score.duurzaamheid, 3); T.gelijk(opmerkingen(u), []); T.gelijk(u.aftrek, []);
    T.is(u.profiel.naam, "Kweekgestuurd");
  });
  T.registreer(G, "besluit 4a (b, episode 3): een tweede Urinekweek inzetten vóór de weefselinvasie kost 1 punt", function () {
    var s = speel("E3", [["O1", "V8", DOSIS], ["N1", "O2", "O1"], ["Ev1", "G3"], [], ["B3:" + SP, HALF, "N3"], ["Ev1"]]);
    var u = beoordeel(s);
    T.gelijk(ids(u), []); T.is(u.score.doelmatigheid, 1, "2 (G3 niet vooraf) − 1"); T.gelijk(opmerkingen(u).filter(function (x) { return x.indexOf(NIET_NODIG) === 0; }), [NIET_NODIG + "Urinekweek inzetten"]);
    // dezelfde route met de tweede kweek op de dag van A (dag 3): geen aftrek
    var t = speel("E3", [["O1", "V8", DOSIS], ["N1", "O2"], ["Ev1", "G3", "O1"], [], ["B3:" + SP, HALF, "N3"], ["Ev1"]]);
    var v = beoordeel(t);
    T.gelijk(ids(v), []); T.is(v.score.doelmatigheid, 2); T.gelijk(v.aftrek, []);
  });
  T.registreer(G, "besluit 4a (c, episode 3): Verwijzen zonder dat 'Na 48 uur geen verbetering.' is voorgekomen kost 1 punt; na die status niet", function () {
    // Getoetst op de casus zonder einde na Verwijzen (casus 1.5), zodat de kaarten na het verwijzen nog gespeeld kunnen worden.
    var plan = basisE3(); plan[3].push("Ev3");
    var u = beoordeel(speel("E3", plan, 0, casusZonderEinde()));
    T.gelijk(ids(u), []); T.is(u.score.doelmatigheid, 2); T.gelijk(opmerkingen(u), [NIET_NODIG + "Verwijzen"]);
    // fosfomycine gestopt na A, geen werkzaam middel: dag 5 'Na 48 uur geen verbetering.', daarna verwijzen
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B2:V4"], ["Ev1"], ["B3:" + SP, HALF, "N3"], ["Ev1", "Ev3"]]);
    T.is(s.klachten[5].status, "geenVerbetering48");
    var v = beoordeel(s);
    T.gelijk(ids(v), []); T.is(v.score.doelmatigheid, 3); T.gelijk(v.aftrek, []);
    // verwijzen op de dag vóór die status telt als te vroeg
    var vroeg = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B2:V4"], ["Ev1", "Ev3"], ["B3:" + SP, HALF, "N3"], ["Ev1"]], 0, casusZonderEinde());
    T.is(beoordeel(vroeg).score.doelmatigheid, 2, "de status kwam pas na het verwijzen");
  });
  T.registreer(G, "besluit 4a (d, episode 3): Medicatie tijdelijk stoppen op calcium zonder ciprofloxacine kost 1 punt; met ciprofloxacine niet; Innametijden aanpassen kan alleen met ciprofloxacine", function () {
    var plan = basisE3(); plan[3].push("B3:calcium");
    var u = beoordeel(speel("E3", plan));
    T.gelijk(ids(u), []); T.is(u.score.doelmatigheid, 2); T.gelijk(opmerkingen(u), [NIET_NODIG + "Medicatie tijdelijk stoppen (calcium/colecalciferol)"]);
    var cipro = beoordeel(speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V7", "B3:calcium"], ["Ev1"], ["B3:" + SP, HALF, "N3"], ["Ev1"]]));
    T.gelijk(ids(cipro), []); T.is(cipro.score.doelmatigheid, 3); T.gelijk(cipro.aftrek, []);
    var s = speel("E3", [["G3", "O1", "V4"]]);
    T.is(g.Engine.speelKaart(s, "B4", { doel: "V7" }).ok, false, "zonder gestarte ciprofloxacine weigert het spel Innametijden aanpassen");
  });
  T.registreer(G, "besluit 4a (e, episode 3): lisinopril stoppen of aanpassen vóór de dag van de uitdroging kost 1 punt; op de dag van de uitdroging niet", function () {
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", DOSIS], ["Ev1", "B3:lisinopril"], ["B5:lisinopril", "B3:" + SP, HALF], ["N3", "Ev1"]]);
    var u = beoordeel(s);
    T.gelijk(ids(u), []); T.is(u.score.doelmatigheid, 2); T.gelijk(opmerkingen(u), [NIET_NODIG + "Medicatie tijdelijk stoppen (lisinopril)"]);
    var vroeg = beoordeel(speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", DOSIS], ["Ev1", HALF], ["B3:" + SP, "N3"], ["Ev1"]]));
    T.gelijk(ids(vroeg), ["I15"], "halveren vóór de uitdroging telt niet als sick day-maatregel (de poort is dan niet gehaald)");
    T.is(beoordeel(speel("E3", basisE3())).aftrek.length, 0, "halveren op de dag van de uitdroging: geen aftrek");
  });
  T.registreer(G, "besluit 4a (data): de regels staan als scoreregels met een leesbare naam in de data, elk gemarkeerd als concept met de casuspassage; de bestaande regels (G2/G3 vooraf) staan er nog; geen kaart-id's in de evaluatie", function () {
    var namen = { E2: ["Kalium bepalen zonder trimethoprim", "Lisinopril aanpassen zonder uitdroging"],
      E3: ["Tweede urinekweek zonder weefselinvasie", "Verwijzen zonder 'na 48 uur geen verbetering'", "Calcium scheiden of stoppen zonder ciprofloxacine", "Lisinopril aanpassen of stoppen vóór de uitdroging"] };
    Object.keys(namen).forEach(function (e) {
      var dm = ep(e).score.doelmatigheid, nieuwe = dm.regels.filter(function (r) { return r.naam !== undefined; });
      T.gelijk(nieuwe.map(function (r) { return r.naam; }), namen[e], e);
      nieuwe.forEach(function (r) {
        T.is(r.delta, -1); T.is(r.concept, true); T.waar(typeof r.afgeleidUit === "string" && r.afgeleidUit.length > 15, r.naam + ": casuspassage");
        T.waar(Array.isArray(r.kaarten) && r.kaarten.length >= 1, r.naam + ": kaarten");
      });
      T.gelijk(dm.regels.slice(0, 2).map(function (r) { return r.punten; }), [3, 2], e + ": de bestaande regels blijven");
      T.is(dm.min, 1); T.is(dm.opmerkingBijAftrek, "Deze kaart was hier niet nodig:"); T.is(dm.conceptRegels, true);
      T.is(dm.TODO_BART_overbodig, todo("TODO_BART-C2").vraag);
    });
    T.waar(todo("TODO_BART-C2").vraag.indexOf("Deze kaart was hier niet nodig:") > 0);
    T.waar(!/\b(?:[GOVBN]\d+|Ev\d)\b/.test(g.Evaluatie._bron.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")), "geen kaart-id's in de code van de evaluatie");
    T.waar(g.Evaluatie._bron.indexOf("niet nodig") < 0 && g.UI._bron.indexOf("niet nodig") < 0, "de opmerking staat alleen in de data");
  });

  /* ---------- besluit 4b: restprofiel ---------- */
  var REST = "Eigen route", RESTVRAAG = "Je route past bij geen van de beschreven profielen. Wat was je plan?";
  T.registreer(G, "besluit 4b (restprofiel): een route die de poort haalt maar bij geen profiel past, krijgt 'Eigen route' met de reflectievraag (episode 2: trimethoprim gestopt zonder wissel)", function () {
    var s = speel("E2", [["G2", "O1", "V5"], ["N1", "O2"], ["B2:V5"]]);
    var u = g.Test.rondAfTotEinde(s);
    T.is(u.poortGehaald, true, ids(u).join());
    T.gelijk(u.profiel, { naam: REST, reflectievraag: RESTVRAAG, rest: true });
    T.gelijk(u.score, { duurzaamheid: 3, doelmatigheid: 3 }, "de scores blijven zoals de regels ze geven");
    var m = g.UI.evaluatieModel(u);
    T.gelijk(m.profiel, { naam: REST, reflectievraag: RESTVRAAG }); T.gelijk(m.zonderScore, []);
    var rec = g.Logging.maakPoging(s, u, "test"); T.is(rec.profiel.naam, REST); T.is(rec.reflectievraag, RESTVRAAG);
  });
  T.registreer(G, "besluit 4b (restprofiel): een route die wel bij een profiel past, houdt dat profiel; bij een schending is er geen profiel; in episode 1 heeft elke geslaagde route een eigen profiel", function () {
    var u = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V4"], ["N1"]]));
    T.gelijk(u.profiel, { naam: "Kweekgestuurd, smal", reflectievraag: null });
    var fout = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V5"], ["O2"], ["B2:V5"]]));
    T.is(fout.poortGehaald, false); T.is(fout.profiel, null);
    [[["V1", "N1", "Ev1"]], [["V2:V3", "N1", "Ev1"]], [["V3", "N1"]]].forEach(function (plan) {
      var e1 = g.Test.rondAfTotEinde(speel("E1", plan));
      T.is(e1.poortGehaald, true); T.waar(e1.profiel && e1.profiel.rest === undefined && e1.profiel.naam !== REST, JSON.stringify(e1.profiel));
    });
  });
  T.registreer(G, "besluit 4b (score zonder waarde): in episode 3 geeft een route zonder ciprofloxacine of amoxicilline/clavulaanzuur geen duurzaamheidsscore; het scherm meldt dat bij die as in plaats van de as weg te laten", function () {
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B2:V4"], ["Ev1"], ["B3:" + SP, HALF, "N3"], ["Ev1", "Ev3"]]);
    var u = beoordeel(s);
    T.gelijk(ids(u), []); T.gelijk(u.profiel, { naam: REST, reflectievraag: RESTVRAAG, rest: true });
    T.gelijk(u.score, { duurzaamheid: null, doelmatigheid: 3 });
    var m = g.UI.evaluatieModel(u);
    T.gelijk(m.scores, [{ as: "doelmatigheid", naam: "Doelmatigheid", waarde: 3 }]);
    T.gelijk(m.zonderScore, [{ as: "duurzaamheid", naam: "Duurzaamheid" }]);
    T.waar(g.UI._bron.indexOf("geen score voor deze route") > 0, "de melding staat in de interface");
    var ov = g.UI.overzichtModel(casus(), [{ pseudoniem: "p", episodeId: "E3", poortGehaald: true, score: u.score, profiel: u.profiel, tijdlijn: [], gebeurtenissen: [] }], "p");
    T.is(ov[0].uitkomst, "Veiligheid gehaald. Profiel: Eigen route. Duurzaamheid geen score, doelmatigheid 3 van 3.");
    // casus 1.5 (besluit 16 november 2026): na het verwijzen stopt de episode meteen; de route loopt niet meer door tot sepsis
    T.is(s.afgerond, true); T.is(s.uitkomst.afloop, "gehaald"); T.is(s.uitkomst.eindeNaKaart.terecht, true);
  });
  T.registreer(G, "besluit 4b (concept): naam en reflectievraag staan in de data, gemarkeerd als concept ter goedkeuring; zonder restprofiel in de data blijft het profiel leeg", function () {
    var rp = casus().restprofiel;
    T.is(rp.naam, REST); T.is(rp.reflectievraag, RESTVRAAG); T.is(rp.concept, true); T.is(rp.TODO_BART, todo("TODO_BART-C3").vraag);
    T.waar(todo("TODO_BART-C3").vraag.indexOf(RESTVRAAG) > 0);
    T.waar(g.Evaluatie._bron.indexOf(REST) < 0 && g.UI._bron.indexOf(REST) < 0, "de naam staat niet in de code");
    var c = JSON.parse(JSON.stringify(casus())); delete c.restprofiel;
    var s = g.Engine.nieuwSpel(c, "E2", { rng: function () { return 0; } });
    ["G2", "O1", "V5"].forEach(function (k) { g.Engine.speelKaart(s, k, {}); }); g.Engine.volgendeDag(s);
    ["N1", "O2"].forEach(function (k) { g.Engine.speelKaart(s, k, {}); }); g.Engine.volgendeDag(s); g.Engine.speelKaart(s, "B2", { doel: "V5" });
    var u = g.Evaluatie.beoordeel(c, "E2", s);
    T.is(u.poortGehaald, true); T.is(u.profiel, null);
  });

  /* ---------- besluit 4c: gevolgzinnen voor de regels die er geen hadden ---------- */
  var ZIN = {
    I1: "Mevrouw weet niet wanneer ze moet bellen.",
    I4: "Mevrouw gebruikt twee antibiotica tegelijk.",
    I5: "Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.",
    I6kweek: "Er is geen kweek van vóór de eerste dosis.",
    I6geen: "Mevrouw krijgt geen antibioticum, terwijl ze in de risicogroep valt.",
    I7kalium: "De kaliumspiegel is onbekend.",
    I7half: "De dosis trimethoprim is na dag 3 niet gehalveerd.",
    I8: "De klachten houden aan: de bacterie is resistent voor het middel dat ze gebruikt.",
    I10: "Het antibioticum bereikt onvoldoende concentratie in het weefsel.",
    I11: "Er is geen nieuwe kweek van vóór de wissel.",
    I12: "Mevrouw krijgt cotrimoxazol bij een ernstige nierfunctiestoornis en naast spironolacton: kans op ernstige hyperkaliëmie.",
    I13: "Het clavulaanzuur stapelt bij deze nierfunctie.",
    I16contact: "Er is binnen 48 uur geen contact geweest.",
    I16verwijs: "Mevrouw is na 48 uur niet beter en is niet verwezen."
  };
  var NIEUW = [   // [episode, regel, zin, heeft een voorwaarde]
    ["E2", "I1", ZIN.I1, false], ["E3", "I1", ZIN.I1, false], ["E1", "I4", ZIN.I4, false], ["E2", "I4", ZIN.I4, false], ["E3", "I4", ZIN.I4, false],
    ["E3", "I5", ZIN.I5, false], ["E2", "I6", ZIN.I6kweek, true], ["E2", "I6", ZIN.I6geen, true], ["E3", "I6", ZIN.I6kweek, true], ["E3", "I6", ZIN.I6geen, true],
    ["E3", "I7", ZIN.I7kalium, true], ["E2", "I7", ZIN.I7half, true], ["E3", "I7", ZIN.I7half, true], ["E2", "I8", ZIN.I8, false], ["E3", "I8", ZIN.I8, false],
    ["E3", "I10", ZIN.I10, false], ["E3", "I11", ZIN.I11, false], ["E3", "I12", ZIN.I12, false], ["E3", "I13", ZIN.I13, false],
    ["E3", "I16", ZIN.I16contact, true], ["E3", "I16", ZIN.I16verwijs, true]
  ];
  T.registreer(G, "besluit 4c (data): de 21 nieuwe zinnen staan letterlijk in casus.gevolgzinnen, vrijgegeven, elk gemarkeerd als concept met de bron; waar het besluit een voorwaarde noemt, heeft de zin er een; elke regel heeft nu een zin", function () {
    // De conceptzinnen bij I17 en I18 (casus 1.5) toetst tests/besluiten-1116.tests.js.
    var concept = casus().gevolgzinnen.filter(function (z) { return z.concept === true && z.invariant !== "I17" && z.invariant !== "I18"; });
    T.is(concept.length, NIEUW.length);
    NIEUW.forEach(function (n) {
      var z = concept.filter(function (x) { return x.episode === n[0] && x.invariant === n[1] && x.tekst === n[2]; });
      T.is(z.length, 1, n.join(" | "));
      T.is(z[0].vrijgegeven, true); T.waar(typeof z[0].afgeleidUit === "string" && z[0].afgeleidUit.length > 10, "bron bij " + n[2]);
      T.is(z[0].als !== undefined, n[3], "voorwaarde bij " + n[0] + " " + n[1] + ": " + n[2]);
    });
    casus().episodes.forEach(function (e) {
      e.invarianten.forEach(function (i) {
        T.waar(casus().gevolgzinnen.some(function (z) { return z.episode === e.id && z.invariant === i.id && z.vrijgegeven === true; }), e.id + " " + i.id + " heeft een zin");
      });
    });
    T.waar(todo("TODO_BART-C4").besluit === undefined && /casus\.gevolgzinnen/.test(todo("TODO_BART-C4").plek));
    // de twee eerdere conceptteksten zijn ongewijzigd
    T.is(ep("E3").gebeurtenissen.filter(function (x) { return x.id === "S"; })[0].einde.tekst, "De casus is geëscaleerd. Mevrouw V. heeft sepsis en wordt met spoed verwezen. Deze episode is verloren.");
    T.is(ep("E3").feedbackExtra[2].vraag, "Dit middel staat in de richtlijn niet bij een blaasontsteking.");
  });
  T.registreer(G, "besluit 4c (episode 1 en 2): I1, I4 en I8 tonen hun zin; de zin van I1 in episode 2 is die van episode 1", function () {
    var i1 = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V4"]]));
    T.gelijk(ids(i1), ["I1"]); T.gelijk(zinnen(i1), [ZIN.I1]); T.is(i1.gevolg, ZIN.I1);
    T.gelijk(g.UI.evaluatieModel(i1).gevolgen, [ZIN.I1]);
    var i4 = g.Test.rondAfTotEinde(speel("E1", [["V3", "V4", "N1"]]));
    T.gelijk(ids(i4), ["I4"]); T.gelijk(zinnen(i4), [ZIN.I4]);
    var i8 = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V5"], ["O2", "N1"], [], ["V6:V5:halveren"]]));
    T.gelijk(ids(i8), ["I8"]); T.gelijk(zinnen(i8), [ZIN.I8]);
    var goed = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V4"], ["N1"]]));
    T.gelijk(goed.gevolgen, [], "bij een gehaalde poort geen gevolgen");
  });
  T.registreer(G, "besluit 4c (I6): 'geen kweek' alleen als er een antibioticum zonder kweek vooraf is gestart; 'geen antibioticum' alleen als er echt geen is gestart; klopt geen van beide, dan geen zin", function () {
    var kweek = g.Test.rondAfTotEinde(speel("E2", [["G2", "V4", "N1"]]));
    T.gelijk(ids(kweek), ["I6"]); T.gelijk(zinnen(kweek), [ZIN.I6kweek]);
    var afwachten = g.Test.rondAfTotEinde(speel("E2", [["G2", "V1", "N1"], ["Ev1"]]));
    T.gelijk(ids(afwachten), ["I6"]); T.gelijk(zinnen(afwachten), [ZIN.I6geen]);
    var niets = g.Test.rondAfTotEinde(speel("E2", [["G2", "N1"]]));
    T.gelijk(ids(niets), ["I6"]); T.gelijk(zinnen(niets), [ZIN.I6geen], "niets voorschrijven in de risicogroep");
    var beide = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V1"], ["V4", "N1"]]));   // afwachten gespeeld, daarna toch een middel mét kweek vooraf
    T.gelijk(ids(beide), ["I6"]); T.gelijk(zinnen(beide), [], "geen van beide zinnen is waar: geen zin");
    var e3 = beoordeel(speel("E3", [["V4", "N1", "O2"]]));
    T.waar(ids(e3).indexOf("I6") >= 0); T.waar(zinnen(e3).indexOf(ZIN.I6kweek) >= 0 && zinnen(e3).indexOf(ZIN.I6geen) < 0, "episode 3: geen kweek vooraf");
  });
  T.registreer(G, "besluit 4c (I7): 'niet gehalveerd' en 'kaliumspiegel onbekend' verschijnen elk alleen als ze waar zijn, ook samen; in episode 3 dezelfde zinnen", function () {
    var half = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V5"], ["N1", "O2"], [], [], ["B1:V4"]]));
    T.gelijk(ids(half), ["I7"]); T.gelijk(zinnen(half), [ZIN.I7half]);
    var kalium = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V5"], ["N1"], [], ["V6:V5:halveren"], ["B1:V4"]]));
    T.gelijk(ids(kalium), ["I7"]); T.gelijk(zinnen(kalium), [ZIN.I7kalium]);
    var beide = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V5"], ["N1"], [], [], ["B1:V4"]]));
    T.gelijk(ids(beide), ["I7"]); T.gelijk(zinnen(beide), [ZIN.I7kalium, ZIN.I7half]);
    var e3 = beoordeel(speel("E3", [["O1", "V5", "N1"], ["Ev2:" + SP], [], []]));
    T.waar(ids(e3).indexOf("I7") >= 0); T.waar(zinnen(e3).indexOf(ZIN.I7kalium) >= 0, "episode 3: kalium niet bepaald");
  });
  T.registreer(G, "besluit 4c (episode 3): I5, I10, I11, I12, I13 en I16 tonen hun zin; de twee zinnen van I16 elk onder hun eigen voorwaarde", function () {
    function heeft(u, id, zin) { T.waar(ids(u).indexOf(id) >= 0, id + " geschonden: " + ids(u).join()); T.waar(u.gevolgen.some(function (x) { return x.invariant === id && x.tekst === zin; }), id + ": " + zin + " | " + JSON.stringify(zinnen(u))); }
    heeft(beoordeel(speel("E3", [["O1", "V3", "N1"]])), "I5", ZIN.I5);
    heeft(beoordeel(speel("E3", [["O1", "V9", "N1"]])), "I12", ZIN.I12);
    heeft(beoordeel(speel("E3", [["O1", "V8", "N1"]])), "I13", ZIN.I13);
    heeft(beoordeel(speel("E3", [["G3", "O1", "V4"], ["N1", "O2"], ["B1:V8", DOSIS]])), "I11", ZIN.I11);
    var niets = beoordeel(speel("E3", [["G3", "O1", "V4"], ["N1", "O2"], [], [], []]));   // fosfomycine loopt door, geen contact, niet verwezen
    heeft(niets, "I10", ZIN.I10); heeft(niets, "I16", ZIN.I16contact); heeft(niets, "I16", ZIN.I16verwijs);
    // wel contact binnen 48 uur, maar na 48 uur niet beter en niet verwezen: alleen de tweede zin van I16
    var contact = beoordeel(speel("E3", [["G3", "O1", "V4"], ["N1", "O2"], ["O1", "B2:V4"], ["Ev1"], ["B3:" + SP, HALF, "N3"], ["Ev1"]]));
    T.gelijk(ids(contact), ["I16"]); T.gelijk(zinnen(contact), [ZIN.I16verwijs]);
    // geen contact, maar wel een werkzaam middel (dus niet 'na 48 uur niet beter'): alleen de eerste zin
    var geenContact = beoordeel(speel("E3", [["G3", "O1", "V4"], ["N1", "O2"], ["O1", "B1:V8", DOSIS], [], ["B3:" + SP, HALF, "N3"], ["Ev1"]]));
    T.gelijk(ids(geenContact), ["I16"]); T.gelijk(zinnen(geenContact), [ZIN.I16contact]);
  });
})(typeof window !== "undefined" ? window : globalThis);

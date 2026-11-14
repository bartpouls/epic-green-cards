/* Tests voor de besluiten van Bart van 14 november 2026 (casus-uwi.md versie 1.3, sectie 10).
   Per besluit dat gedrag verandert minstens één goed-geval en één fout-geval, met de ECHTE instellingen van de casus
   (Engine + Evaluatie + UI-logica). Besluiten zonder gedragswijziging worden gecontroleerd op de vastlegging (veld `besluit`). */
(function (g) {
  "use strict";
  var T = g.Test, G = "besluiten";
  var SP = "spironolacton", DATUM = /14 november 2026/;
  function casus() { return g.CASUSSEN[0]; }
  function ep(id) { return casus().episodes.filter(function (e) { return e.id === id; })[0]; }
  function nieuw(id) { return g.Engine.nieuwSpel(casus(), id, { rng: function () { return 0; } }); }   // rng 0: A na de 4e kaart, B na de 7e
  function geb(s, id) { return s.gebeurtenissen.filter(function (x) { return x.id === id; })[0]; }
  function ids(u) { return u.geschonden.map(function (x) { return x.id; }); }
  function todo(id) { return casus().todoBart.filter(function (t) { return t.id === id; })[0]; }
  function beoordeel(s) { return g.Evaluatie.beoordeel(casus(), s.episodeId, s); }
  // Speelt een plan: een lijst dagen, elke dag een lijst "kaart", "kaart:doel" of "kaart:doel:optie". Een geweigerde kaart is een fout.
  function speel(id, plan) {
    var s = nieuw(id);
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

  /* ---------- vastlegging: besliste vragen ---------- */
  var BESLIST = ["TODO_BART-E2-2", "TODO_BART-E3-19", "TODO_BART-E3-1", "TODO_BART-E3-24", "TODO_BART-E3-9", "TODO_BART-N4",
    "TODO_BART-E2-18", "TODO_BART-E3-15", "TODO_BART-E3-8", "TODO_BART-G1"];
  T.registreer(G, "vastlegging: de tien besliste vragen staan nog in de data, elk met een besluit in één zin met de datum; geen andere vraag heeft een besluit", function () {
    BESLIST.forEach(function (id) {
      var t = todo(id);
      T.waar(!!t, id + " staat nog in de data");
      T.waar(typeof t.besluit === "string" && DATUM.test(t.besluit) && /Bart/.test(t.besluit), id + " heeft een besluit met datum");
      T.waar(typeof t.vraag === "string" && typeof t.gekozenLezing === "string" && typeof t.plek === "string", id + " houdt vraag, gekozen lezing en plek");
    });
    T.gelijk(casus().todoBart.filter(function (t) { return t.besluit !== undefined; }).map(function (t) { return t.id; }).sort(), BESLIST.slice().sort());
    T.is(casus().versie, "1.3");
  });
  T.registreer(G, "vastlegging: de lijst voor Bart (gauntlet/todo-bart.js) heeft een groep 'Beslist op 14 november 2026' met precies de besliste vragen; open groepen bevatten geen besliste vraag en alleen bestaande ids", function () {
    var gr = g.TODO_BART_GROEPEN;
    if (!gr) return;   // de lijst is niet geladen (bv. een losse testpagina zonder gauntlet/)
    var beslist = gr.filter(function (x) { return x.titel === "Beslist op 14 november 2026"; });
    T.is(beslist.length, 1, "één groep 'Beslist op 14 november 2026'");
    T.gelijk(beslist[0].ids.slice().sort(), BESLIST.slice().sort());
    var alleIds = casus().todoBart.map(function (t) { return t.id; });
    gr.forEach(function (x) {
      (x.ids || []).forEach(function (id) {
        T.waar(alleIds.indexOf(id) >= 0, "onbekend id in de lijst: " + id);
        if (x !== beslist[0]) T.waar(BESLIST.indexOf(id) < 0, "besliste vraag staat nog in een open groep: " + id);
      });
    });
    var open = [].concat.apply([], gr.filter(function (x) { return x !== beslist[0]; }).map(function (x) { return x.ids || []; }));
    ["TODO_BART-E1-3", "TODO_BART-E2-8", "TODO_BART-E3-12", "TODO_BART-N1", "TODO_BART-E2-6", "TODO_BART-E3-4", "TODO_BART-E2-16", "TODO_BART-E2-17",
      "TODO_BART-E3-27", "TODO_BART-E3-28"].forEach(function (id) { T.waar(open.indexOf(id) >= 0, "blijft open: " + id); });
  });
  T.registreer(G, "vastlegging: de achterhaalde vragen E2-16 en E2-17 beschrijven wat het spel nu doet (afronden pas na de uitslag; I7 alleen bij de 7-daagse kuur)", function () {
    T.waar(/aan in alle episodes/.test(todo("TODO_BART-E2-16").gekozenLezing) && !/standaard uit/.test(todo("TODO_BART-E2-16").gekozenLezing), "E2-16");
    T.waar(/alleen bij de 7-daagse kuur/.test(todo("TODO_BART-E2-17").gekozenLezing) && !/zodra V5 gestart is/.test(todo("TODO_BART-E2-17").gekozenLezing), "E2-17");
    // het beschreven gedrag klopt met het spel
    T.is(ep("E2").afrondenPasNaGebeurtenissen, true);
    var s = speel("E2", [["G2", "O1", "V5"], ["N1"]]);
    T.gooit(function () { g.Engine.rondAf(s); }, "E2-16: afronden vóór de kweekuitslag kan niet");
    var t = speel("E2", [["G2", "O1", "V5"], ["N1"], ["B1:V4"]]);
    T.is(ids(beoordeel(t)).indexOf("I7"), -1, "E2-17: trimethoprim op kuurdag 3 vervangen geeft geen I7");
    var u = speel("E2", [["G2", "O1", "V5"], ["N1"], [], ["B1:V4"]]);
    T.waar(ids(beoordeel(u)).indexOf("I7") >= 0, "E2-17: op kuurdag 4 vervangen zonder kaliumcontrole geeft wel I7");
  });

  /* ---------- besluit 1: kalium bij 7 dagen trimethoprim (bevestigd, geen gedragswijziging) ---------- */
  T.registreer(G, "besluit 1 (I7 bevestigd): startdag = kuurdag 1; kalium op kuurdag 2 en halveren op kuurdag 4 is goed, kalium op kuurdag 5 of halveren op kuurdag 3 is fout", function () {
    var goed = speel("E2", [["G2", "O1", "V5"], ["O2", "N1"], [], ["V6:V5:halveren"], []]);
    T.is(ids(beoordeel(goed)).indexOf("I7"), -1, "kalium kuurdag 2, halveren kuurdag 4");
    var laat = speel("E2", [["G2", "O1", "V5"], ["N1"], [], ["V6:V5:halveren"], ["O2"]]);
    T.waar(ids(beoordeel(laat)).indexOf("I7") >= 0, "kalium pas op kuurdag 5");
    var vroeg = speel("E2", [["G2", "O1", "V5"], ["O2", "N1"], ["V6:V5:halveren"], [], []]);
    T.waar(ids(beoordeel(vroeg)).indexOf("I7") >= 0, "halveren al op kuurdag 3");
  });

  /* ---------- besluit 2: I9, een van beide volstaat ---------- */
  T.registreer(G, "besluit 2 (I9 bevestigd): kalium bepalen óf overleggen over spironolacton volstaat; pas een schending als beide ontbreken, of bij hervatten zonder eerder overleg", function () {
    T.is(ids(beoordeel(speel("E3", [["O2"]]))).indexOf("I9"), -1, "alleen Kalium bepalen: geen I9");
    T.is(ids(beoordeel(speel("E3", [["Ev2:" + SP]]))).indexOf("I9"), -1, "alleen Overleggen met de voorschrijver (spironolacton): geen I9");
    T.waar(ids(beoordeel(speel("E3", [["N1"]]))).indexOf("I9") >= 0, "beide ontbreken: I9");
    T.waar(ids(beoordeel(speel("E3", [["Ev2:lisinopril"]]))).indexOf("I9") >= 0, "overleg over lisinopril telt niet: I9");
    T.waar(ids(beoordeel(speel("E3", [["O2", "B3:" + SP, "B5:" + SP]]))).indexOf("I9") >= 0, "hervatten zonder eerder overleg: I9, ook met kalium");
    T.is(ids(beoordeel(speel("E3", [["B3:" + SP, "Ev2:" + SP, "B5:" + SP]]))).indexOf("I9"), -1, "hervatten na overleg: geen I9");
  });

  /* ---------- besluit 3: I15, opvolgmoment op de dag van B t/m drie dagen daarna ---------- */
  // Basis: amoxicilline/clavulaanzuur met de juiste dosis vanaf dag 1; A verschijnt op dag 3, B op dag 4. Het eerste opvolgmoment (dag 3)
  // is dat na weefselinvasie; het tweede is dat voor de sick day en schuift op. Het drinkadvies komt standaard één dag na B (op tijd).
  function sickDay(ev1Dag, n3Dag) {
    var plan = [["O1", "V8", DOSIS], ["N1", "O2"], ["Ev1", "G1", "G2"], ["B3:" + SP, HALF], [], [], [], [], []];
    plan[(n3Dag || 5) - 1].push("N3");
    if (ev1Dag) plan[ev1Dag - 1].push("Ev1");
    var s = speel("E3", plan);
    T.is(geb(s, "A").dag, 3, "A op dag 3"); T.is(geb(s, "B").dag, 4, "B op dag 4");
    return beoordeel(s);
  }
  T.registreer(G, "besluit 3 (I15): Opvolgmoment afspreken op de dag van B, en één, twee of drie dagen daarna, is op tijd", function () {
    [4, 5, 6, 7].forEach(function (d) { T.gelijk(ids(sickDay(d)), [], "opvolgmoment op dag " + d + " (B op dag 4)"); });
  });
  T.registreer(G, "besluit 3 (I15): opvolgmoment vier dagen na B, of helemaal niet, is te laat; de andere maatregelen blijven binnen 2 beurten (drinkadvies twee dagen na B is te laat)", function () {
    T.gelijk(ids(sickDay(8)), ["I15"], "opvolgmoment op dag 8 (vier dagen na B)");
    T.gelijk(ids(sickDay(null)), ["I15"], "geen tweede opvolgmoment");
    T.gelijk(ids(sickDay(5, 4)), [], "drinkadvies op de dag van B: op tijd");
    T.gelijk(ids(sickDay(4, 5)), [], "drinkadvies één dag na B: op tijd");
    T.gelijk(ids(sickDay(4, 6)), ["I15"], "drinkadvies twee dagen na B: te laat");
    var u = sickDay(8);
    T.gelijk(u.geschonden[0].onderdelen, ["opvolgmoment"], "alleen het onderdeel opvolgmoment ontbreekt");
  });

  /* ---------- besluit 4: werkzaamheid bij cystitis in episode 3 en 'buiten de richtlijn' ---------- */
  var OPMERKING = "Dit middel staat in de richtlijn niet bij een blaasontsteking.";
  T.registreer(G, "besluit 4 (werkzaamheid): bij cystitis werken amoxicilline/clavulaanzuur en ciprofloxacine met calcium gescheiden of gestopt; ciprofloxacine zonder scheiding en amoxicilline niet", function () {
    function status(dag1) { return speel("E3", [dag1, []]).klachten[2].status; }
    T.is(status(["V8"]), "af", "amoxicilline/clavulaanzuur");
    T.is(status(["V7", "B4:V7"]), "af", "ciprofloxacine met innametijden aangepast");
    T.is(status(["V7", "B3:calcium"]), "af", "ciprofloxacine met calcium tijdelijk gestopt");
    T.is(status(["V7"]), "aan", "ciprofloxacine zonder scheiding van calcium");
    T.is(status(["V10"]), "aan", "amoxicilline (resistent)");
    T.is(status(["V4"]), "af", "fosfomycine blijft werkzaam");
  });
  T.registreer(G, "besluit 4 (score): wie amoxicilline/clavulaanzuur start terwijl het nog cystitis is, haalt de poort, verliest 1 punt duurzaamheid en ziet de opmerking; wie het na weefselinvasie start niet", function () {
    var u = sickDay(4);
    T.is(u.poortGehaald, true); T.is(u.profiel.naam, "Kweekgestuurd");
    T.is(u.score.duurzaamheid, 2, "3 − 1 voor buiten de richtlijn");
    var opm = u.extraVragen.filter(function (x) { return x.soort === "opmerking"; });
    T.gelijk(opm.map(function (x) { return x.vraag; }), [OPMERKING]);
    T.gelijk(g.UI.evaluatieModel(u).extraVragen, [OPMERKING], "de opmerking staat bij de feedback van de opleider");
    // na weefselinvasie (dag 3) wisselen naar amoxicilline/clavulaanzuur: binnen de richtlijn
    var na = beoordeel(speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", DOSIS], ["Ev1", "B3:" + SP, HALF], ["N3"], [], []]));
    T.is(na.poortGehaald, true); T.is(na.score.duurzaamheid, 3, "geen aftrek");
    T.is(na.extraVragen.filter(function (x) { return x.vraag === OPMERKING; }).length, 0, "geen opmerking");
  });
  T.registreer(G, "besluit 4 (score): ciprofloxacine bij cystitis: 2 − 1 = 1 (ondergrens 1); met de-escalatie na de kweek 3 − 1 = 2", function () {
    var cipro = beoordeel(speel("E3", [["O1", "V7", "B4:V7"], ["N1", "O2"], ["Ev1", "G1", "G2"], ["B3:" + SP, HALF, "N3"], ["Ev1"], [], []]));
    T.gelijk(ids(cipro), []); T.is(cipro.profiel.naam, "Richtlijn eerste keus");
    T.is(cipro.score.duurzaamheid, 1, "2 − 1");
    T.is(ep("E3").score.duurzaamheid.min, 1, "ondergrens 1 staat in de data");
    T.waar(cipro.extraVragen.some(function (x) { return x.vraag === OPMERKING; }), "opmerking");
    // de-escalatie: na de kweekuitslag (dag 4) en na een nieuwe kweek (weefselinvasie) wisselen naar amoxicilline/clavulaanzuur
    var de = beoordeel(speel("E3", [["O1", "V7", "B4:V7"], ["N1", "O2"], ["Ev1", "G1", "G2"], ["B3:" + SP, HALF, "N3"], ["Ev1", "O1", "B1:V8"], [DOSIS], []]));
    T.waar(ids(de).indexOf("I13") >= 0, "dosisaanpassing een dag te laat blijft I13 (de andere regels gelden onverkort)");
    var de2 = beoordeel(speel("E3", [["O1", "V7", "B4:V7"], ["N1", "O2"], ["Ev1", "G1", "G2"], ["B3:" + SP, HALF, "N3"], ["Ev1"], ["O1", "B1:V8", DOSIS], []]));
    T.gelijk(ids(de2), []); T.is(de2.score.duurzaamheid, 2, "3 (de-escalatie) − 1 (bij cystitis gestart)");
  });
  T.registreer(G, "besluit 4 (regels blijven gelden): amoxicilline/clavulaanzuur bij cystitis zonder dosisaanpassing schendt I13; ciprofloxacine zonder scheiding I14; dan geen score en geen opmerking", function () {
    var u = beoordeel(speel("E3", [["O1", "V8"], ["N1", "O2"]]));
    T.waar(ids(u).indexOf("I13") >= 0, ids(u).join());
    T.is(u.score, null); T.gelijk(u.extraVragen, [], "de opmerking verschijnt alleen bij een gehaalde poort");
    var v = beoordeel(speel("E3", [["O1", "V7"], ["N1", "O2"], []]));
    T.waar(ids(v).indexOf("I14") >= 0, ids(v).join());
  });
  T.registreer(G, "besluit 4 (concept): de opmerking is gemarkeerd als concept ter goedkeuring en staat als open vraag op de lijst", function () {
    var f = ep("E3").feedbackExtra.filter(function (x) { return x.vraag === OPMERKING; })[0];
    T.waar(!!f && f.concept === true && f.soort === "opmerking", "gemarkeerd als concept");
    T.is(f.TODO_BART, todo("TODO_BART-E3-27").vraag);
    T.waar(todo("TODO_BART-E3-27").vraag.indexOf(OPMERKING) > 0 && todo("TODO_BART-E3-27").besluit === undefined, "open vraag met de letterlijke concepttekst");
  });

  /* ---------- besluit 5: sepsis beëindigt de episode, uitkomst 'verloren' ---------- */
  var SEPSISTEKST = "De casus is geëscaleerd. Mevrouw V. heeft sepsis en wordt met spoed verwezen. Deze episode is verloren.";
  function naarSepsis() { var s = nieuw("E3"); for (var i = 0; i < 8; i++) g.Engine.volgendeDag(s); return s; }
  T.registreer(G, "besluit 5 (sepsis): de episode eindigt direct op de dag van sepsis; uitkomst 'verloren': geen score, geen profiel, poort niet gehaald", function () {
    var s = nieuw("E3"); for (var i = 0; i < 7; i++) g.Engine.volgendeDag(s);
    T.is(s.dag, 8); T.is(s.afgerond, false, "dag 8: nog bezig"); T.is(s.uitkomst, null);
    T.is(g.Engine.volgendeDag(s), s, "volgendeDag geeft nog steeds de spelstand terug");
    T.is(s.dag, 9); T.is(geb(s, "S").dag, 9);
    T.is(s.afgerond, true); T.is(g.Engine.eindeBereikt(s), true);
    var u = s.uitkomst;
    T.is(u.afloop, "verloren"); T.is(u.poortGehaald, false); T.is(u.score, null); T.is(u.profiel, null);
    T.gelijk(u.einde, { gebeurtenis: "S", uitkomst: "verloren", tekst: SEPSISTEKST });
    T.is(g.Engine.rondAf(s), u, "rondAf geeft de al bepaalde uitkomst");
    T.is(g.Engine.speelKaart(s, "N1", {}).ok, false, "na het einde kan er geen kaart meer bij");
    T.gooit(function () { g.Engine.volgendeDag(s); }, "geen volgende dag meer");
    var m = g.UI.evaluatieModel(u);
    T.is(m.gehaald, false); T.is(m.verloren, true); T.is(m.eindTekst, SEPSISTEKST); T.is(m.eindGebeurtenis, "S");
    T.is(m.scores.length, 0); T.is(m.profiel, null);
    T.is(ep("E3").gebeurtenissen.filter(function (x) { return x.id === "S"; })[0].tekst, "Sepsis: de patiënt is ernstig ziek.", "de bestaande melding blijft");
  });
  T.registreer(G, "besluit 5 (sepsis): een werkzaam middel voorkomt sepsis: de episode loopt door en de afloop is 'gehaald' of 'nietGehaald', nooit 'verloren'", function () {
    var s = speel("E3", [["O1", "V8", DOSIS], ["N1", "O2"]]);   // werkzaam bij cystitis én na weefselinvasie (dag 3)
    for (var i = 0; i < 12; i++) g.Engine.volgendeDag(s);
    T.is(s.dag, 14); T.is(s.afgerond, false); T.is(geb(s, "S"), undefined);
    var u = g.Engine.rondAf(s);
    T.waar(u.afloop === "nietGehaald" || u.afloop === "gehaald", u.afloop); T.is(u.einde, null);
    T.is(g.UI.evaluatieModel(u).verloren, false);
    var e1 = speel("E1", [["V1", "N1", "Ev1"]]); e1.dagenVoorbij = true;
    var goed = g.Engine.rondAf(e1);
    T.is(goed.afloop, "gehaald"); T.is(goed.poortGehaald, true);
  });
  T.registreer(G, "besluit 5 (sepsis): een verloren episode ontgrendelt de volgende niet en telt niet als gehaald, ook zonder geschonden regel; herkansing geeft een schoon spel", function () {
    // Kleine eigen casus: een gebeurtenis met einde 'verloren' en geen enkele veiligheidsregel.
    var c = { id: "mini", rollen: { wissel: "W", stop: "X", pauzeer: "P", hervat: "H" }, kaarten: [{ id: "K", label: "Kaart", categorie: "Gegevens", downside: "—" }],
      episodes: [
        { id: "M1", startToestanden: ["t0"], knoppen: { actiesPerBeurt: 1, aantalDagen: 3 }, antibiotica: [], patient: { waar: {}, zichtbaar: {} }, repertoire: ["K"], invarianten: [],
          gebeurtenissen: [{ id: "Z", trigger: { type: "naKaart", n: 1 }, tekst: "melding", einde: { uitkomst: "verloren", tekst: "Verloren." } }] },
        { id: "M2", startToestanden: ["t0"], knoppen: { actiesPerBeurt: 1, aantalDagen: 3 }, antibiotica: [], patient: { waar: {}, zichtbaar: {} }, repertoire: ["K"], invarianten: [], gebeurtenissen: [] }
      ] };
    var s = g.Engine.nieuwSpel(c, "M1", { rng: function () { return 0; } });
    T.is(g.Engine.speelKaart(s, "K", {}).ok, true);
    T.is(s.afgerond, false, "de gebeurtenis staat nog in de wacht");
    g.Engine.volgendeDag(s);
    T.is(s.afgerond, true); T.gelijk(s.uitkomst.geschonden, []); T.is(s.uitkomst.afloop, "verloren"); T.is(s.uitkomst.poortGehaald, false);
    var rec = g.Logging.maakPoging(s, s.uitkomst, "test");
    T.is(rec.afloop, "verloren"); T.is(rec.eindTekst, "Verloren."); T.is(rec.poortGehaald, false);
    T.is(g.Engine.ontgrendeld(c, "M2", [rec]), false, "de volgende episode gaat niet open");
    T.is(g.Engine.ontgrendeld(c, "M2", [{ episodeId: "M1", casusId: "mini", poortGehaald: true, geschonden: [] }]), true, "wel na een gehaalde poort");
    var o = g.UI.episodeOverzicht(c, "test", [rec], false);
    T.is(o[0].gehaald, false, "verloren is niet gehaald"); T.is(o[1].open, false);
    var h = g.Engine.herkansing(s);
    T.is(h.afgerond, false); T.is(h.dag, 1); T.is(h.tijdlijn.length, 0); T.is(h.uitkomst, null);
    // zonder `einde` in de data eindigt er niets (fout-geval voor de engine: geen casuslogica in de code)
    var c2 = JSON.parse(JSON.stringify(c)); delete c2.episodes[0].gebeurtenissen[0].einde;
    var s2 = g.Engine.nieuwSpel(c2, "M1", { rng: function () { return 0; } }); g.Engine.speelKaart(s2, "K", {}); g.Engine.volgendeDag(s2);
    T.is(s2.afgerond, false, "een gebeurtenis zonder einde beëindigt de episode niet");
  });
  T.registreer(G, "besluit 5 (sepsis): logging en export leggen de afloop vast in een nieuwe laatste kolom; de bestaande kolommen staan er ongewijzigd voor", function () {
    var d = {}, nep = { getItem: function (k) { return k in d ? d[k] : null; }, setItem: function (k, v) { d[k] = String(v); }, removeItem: function (k) { delete d[k]; } };
    g.Logging._zetOpslag(nep);
    try {
      var s = naarSepsis();
      var rec = g.Logging.bewaarUitSpel(s, s.uitkomst, "Sep", { testmodus: false });
      T.is(rec.afloop, "verloren"); T.is(rec.eindTekst, SEPSISTEKST); T.is(rec.poortGehaald, false); T.is(rec.score, null); T.is(rec.profiel, null);
      var e1 = speel("E1", [["V1", "N1", "Ev1"]]); e1.dagenVoorbij = true;
      g.Logging.bewaarUitSpel(e1, g.Engine.rondAf(e1), "Sep", { testmodus: false });
      var regels = g.Logging.exportCSV().replace(/^﻿/, "").split("\r\n");
      var kop = regels[0].split(";");
      T.is(kop[kop.length - 1], "afloop"); T.is(kop.length, 23);
      T.is(kop.slice(0, 22).join(";"), "pseudoniem;episode;poging;eerste poging;testmodus;casusversie;speltijdstip;tijdlijn;gebeurtenissen;onthulde gegevens;poort gehaald;geschonden regels;getoonde vraag;score duurzaamheid;score doelmatigheid;profiel;reflectievraag;labwaarden vóór voorschrijfkaart;eerdere kweken vóór eerste keuze;dagen zonder actie;aantal dagen;aantal kaarten");
      T.waar(/;verloren$/.test(regels[1]), "sepsis: afloop 'verloren': " + regels[1].slice(-40));
      T.waar(/Sepsis \(dag 9\)/.test(regels[1]), "de gebeurtenis sepsis staat in de export");
      T.waar(/;gehaald$/.test(regels[2]), "gehaalde episode: afloop 'gehaald'");
      var js = JSON.parse(g.Logging.exportJSON());
      T.is(js[0].afloop, "verloren"); T.is(js[1].afloop, "gehaald"); T.is(js[0].casusVersie, "1.3");
      T.is(g.Engine.ontgrendeld(casus(), "E2", [js[1]]), true); T.is(g.UI.episodeOverzicht(casus(), "Sep", js, false)[2].gehaald, false, "episode 3 is niet gehaald");
      var ov = g.UI.overzichtModel(casus(), js, "Sep");
      T.is(ov[1].uitkomst, "Episode verloren.", "leesbaar overzicht");
      // een oud record zonder afloop: lege cel, geen fout
      g.Logging.bewaar({ pseudoniem: "Oud", casusId: "x", episodeId: "E1", geschonden: [] });
      T.waar(/;$/.test(g.Logging.exportCSV().replace(/^﻿/, "").split("\r\n")[3]), "oud record: lege afloop");
    } finally { g.Logging._zetOpslag(undefined); g.Logging.wis(); }
  });
  T.registreer(G, "besluit 5 (concept): de tekst bij sepsis is gemarkeerd als concept ter goedkeuring en staat als open vraag op de lijst", function () {
    var e = ep("E3").gebeurtenissen.filter(function (x) { return x.id === "S"; })[0].einde;
    T.is(e.tekst, SEPSISTEKST); T.is(e.uitkomst, "verloren"); T.is(e.concept, true);
    T.is(e.TODO_BART, todo("TODO_BART-E3-28").vraag);
    T.waar(todo("TODO_BART-E3-28").vraag.indexOf(SEPSISTEKST) > 0 && todo("TODO_BART-E3-28").besluit === undefined, "open vraag met de letterlijke concepttekst");
  });

  /* ---------- besluit 6: ernstvolgorde (akkoord, geen gedragswijziging) ---------- */
  T.registreer(G, "besluit 6 (ernstvolgorde akkoord): de volgorde in de data is ongewijzigd", function () {
    function ernst(id) { var o = {}; ep(id).invarianten.forEach(function (i) { o[i.id] = i.ernst; }); return o; }
    T.gelijk(ernst("E2"), { I1: 5, I4: 5, I5: 2, I6: 4, I7: 3, I8: 4 });
    T.gelijk(ernst("E3"), { I1: 5, I4: 5, I5: 2, I6: 4, I7: 3, I8: 4, I9: 3, I10: 2, I11: 4, I12: 1, I13: 3, I14: 3, I15: 2, I16: 3 });
  });

  /* ---------- besluit 7: patiëntkaart episode 3 ---------- */
  T.registreer(G, "besluit 7 (patiëntkaart): in episode 3 staat geen '(hypertensie)' meer; in episode 1 blijft 'lisinopril (hypertensie).' staan", function () {
    function med(id) { return g.UI.patientVelden(ep(id), nieuw(id)).filter(function (v) { return v.sleutel === "medicatieTekst"; })[0].tekst; }
    T.is(med("E3"), "lisinopril, spironolacton, calcium/colecalciferol.");
    T.is(med("E1"), "lisinopril (hypertensie).");
    T.waar(JSON.stringify(g.UI.patientVelden(ep("E3"), nieuw("E3"))).indexOf("hypertensie") < 0, "nergens op de patiëntkaart van episode 3");
    T.waar(casus().referentie.E3.patientkaart.indexOf("Medicatie: lisinopril, spironolacton, calcium/colecalciferol.") >= 0, "ook in de casusreferentie");
  });

  /* ---------- besluit 8: gevolgen bij de patiënt leidend, daarna één hint ---------- */
  T.registreer(G, "besluit 8 (gevolgen): bij een niet-gehaalde poort staan de gevolgzinnen van ALLE geschonden regels die er een hebben in de uitkomst; de hint is de ongewijzigde vraag van de ernstigste regel", function () {
    var s = speel("E1", [["V1"]]); s.dagenVoorbij = true;
    var u = g.Engine.rondAf(s);
    T.gelijk(ids(u), ["I1", "I3"]);
    T.gelijk(u.gevolgen, [
      { invariant: "I1", tekst: "Mevrouw weet niet wanneer ze moet bellen." },
      { invariant: "I3", tekst: "Er is geen moment om alsnog te starten als de klachten aanhouden." }]);
    var m = g.UI.evaluatieModel(u);
    T.gelijk(m.gevolgen, ["Mevrouw weet niet wanneer ze moet bellen.", "Er is geen moment om alsnog te starten als de klachten aanhouden."]);
    T.is(m.hint, ep("E1").invarianten[0].vraag, "de hint is letterlijk de vraag uit de casus");
    T.is(m.hint, "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?");
    T.is(m.vraag, m.hint, "nog steeds maar één hint"); T.is(typeof m.hint, "string");
    T.is(m.anderen, "Nog 1 andere veiligheidsregel niet gehaald.");
    T.is(m.gevolg, m.gevolgen[0]);
  });
  T.registreer(G, "besluit 8 (gevolgen): een geschonden regel zonder gevolgzin in de casus krijgt er geen; er wordt niets verzonnen", function () {
    // Episode 2 zonder Alarmsignalen bespreken: I1 heeft in episode 2 geen zin in de casus.
    var s = speel("E2", [["G2", "O1", "V4"], [], [], []]);
    var u = g.Engine.rondAf(s);
    T.gelijk(ids(u), ["I1"]); T.gelijk(u.gevolgen, []); T.is(u.gevolg, null);
    var m = g.UI.evaluatieModel(u);
    T.gelijk(m.gevolgen, []); T.is(m.hint, ep("E2").invarianten[0].vraag, "de hint blijft");
    // elke gevolgzin in de uitkomst komt letterlijk uit de lijst van de casus
    var zinnen = casus().gevolgzinnen.map(function (z) { return z.tekst; });
    var e3 = speel("E3", [["O1", "V7", "N1"], [], [], [], []]); e3.dagenVoorbij = true;
    var u3 = g.Engine.rondAf(e3);
    T.waar(u3.gevolgen.length >= 2, "meer dan één gevolg: " + JSON.stringify(u3.gevolgen));
    u3.gevolgen.forEach(function (x) { T.waar(zinnen.indexOf(x.tekst) >= 0, "niet uit de casus: " + x.tekst); });
    T.gelijk(u3.gevolgen.map(function (x) { return x.invariant; }), ids(u3).filter(function (id) { return ["I9", "I14", "I15"].indexOf(id) >= 0; }), "ernstigste eerst, alleen regels met een zin");
  });
  T.registreer(G, "besluit 8 (gevolgen): een zin verschijnt niet als hij in deze poging niet klopt (kalium wél bepaald); wel als hij klopt", function () {
    var zonder = speel("E2", [["G2", "O1", "V5"], ["N1"], [], [], ["B1:V4"]]);
    var u = g.Engine.rondAf(zonder);
    T.waar(ids(u).indexOf("I7") >= 0); T.waar(u.gevolgen.some(function (x) { return x.tekst === "De kaliumspiegel is onbekend."; }), "zonder kaliumcontrole: de zin staat er");
    var met = speel("E2", [["G2", "O1", "V5"], ["N1", "O2"], [], [], ["B1:V4"]]);
    var v = g.Engine.rondAf(met);
    T.waar(ids(v).indexOf("I7") >= 0, "niet gehalveerd: I7"); T.is(v.gevolgen.filter(function (x) { return x.invariant === "I7"; }).length, 0, "kalium is bepaald: de zin 'onbekend' verschijnt niet");
    var e3 = speel("E3", [["O2", "B3:" + SP, "B5:" + SP]]);
    var w = beoordeel(e3);
    T.waar(ids(w).indexOf("I9") >= 0); T.is(w.gevolgen.filter(function (x) { return x.invariant === "I9"; }).length, 0, "kalium is bepaald: de I9-zin verschijnt niet");
    T.waar(beoordeel(speel("E3", [["N1"]])).gevolgen.some(function (x) { return x.invariant === "I9"; }), "kalium en overleg ontbreken: de I9-zin staat er");
  });
  T.registreer(G, "besluit 8 (scherm): de kop gebruikt de naam uit de data; bij een gehaalde poort geen gevolgen en geen hint; de oude aansporing is weg en de interface noemt de patiënt niet zelf", function () {
    T.is(g.UI.gevolgenKop(ep("E1")), "Wat er met mevrouw V. gebeurde");
    T.is(g.UI.gevolgenKop({ patient: { zichtbaar: { naam: "De heer X." } } }), "Wat er met de heer X. gebeurde");
    T.is(g.UI.gevolgenKop({}), "Wat er met de patiënt gebeurde");
    var s = speel("E1", [["V1", "N1", "Ev1"]]); s.dagenVoorbij = true;
    var m = g.UI.evaluatieModel(g.Engine.rondAf(s));
    T.is(m.gehaald, true); T.gelijk(m.gevolgen, []); T.is(m.hint, null); T.is(m.vraag, null);
    T.is(m.profiel.reflectievraag, "Je schreef niets voor. Bij welke patiënt zou dat niet mogen?");
    var bron = g.UI._bron;
    T.waar(typeof bron === "string" && bron.length > 1000, "de broncode van de interface is beschikbaar");
    T.waar(bron.indexOf("Denk hier even over na") < 0, "de zin 'Denk hier even over na en probeer de episode opnieuw.' is geschrapt");
    T.waar(!/"[^"\n]*mevrouw V[^"\n]*"/i.test(bron), "de naam van de patiënt staat niet als tekst in de interface-code");
    T.waar(bron.indexOf('"Hint van je opleider"') > 0 && bron.indexOf('"Van je opleider"') > 0, "de koppen staan in de interface");
  });
})(typeof window !== "undefined" ? window : globalThis);

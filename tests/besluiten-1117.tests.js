/* Tests voor de besluiten van Bart van 17 november 2026 (casus-uwi.md versie 1.6, sectie 13).
   1. Onterecht verwijzen is een veiligheidsregel (I19, poort) in episode 3.
   2. Een doseringswijziging blijft staan: een doel waarvoor een doelkaart al gespeeld is, staat niet meer in het keuzemenu.
   3. De effectteksten van V2, V6, B5 en Ev3 bevatten geen ontwerptaal meer (concept).
   Met de ECHTE instellingen van de casus (Engine + Evaluatie + UI-logica). */
(function (g) {
  "use strict";
  var T = g.Test, G = "besluiten-1117";
  var SP = "spironolacton", DATUM = /17 november 2026/;
  var HALF = "V6:lisinopril:halveren";
  var HINT19 = "Je verwijst haar naar de tweede lijn. Wat moet er eerst blijken voordat de eerste lijn haar uit handen geeft?";
  var ZIN19 = "Mevrouw gaat naar de tweede lijn terwijl de eerste lijn haar nog kon behandelen.";
  var TEKSTEN = {
    V2: "De patiënt start zelf met het gekozen middel als de klachten aanhouden of toenemen",
    V6: "De nieuwe dosering gaat meteen in en blijft staan",
    B5: "Het middel wordt weer gestart. Herstarten hoort zodra de klachten weg zijn.",
    Ev3: "De patiënt gaat naar de tweede lijn"
  };
  function casus() { return g.CASUSSEN[0]; }
  function ep(id) { return casus().episodes.filter(function (e) { return e.id === id; })[0]; }
  function kaart(id) { return casus().kaarten.filter(function (k) { return k.id === id; })[0]; }
  function todo(id) { return casus().todoBart.filter(function (t) { return t.id === id; })[0]; }
  function ids(u) { return u.geschonden.map(function (x) { return x.id; }); }
  function doelIds(s, k) { return g.UI.toegestaneDoelen(casus(), ep(s.episodeId), s, k).map(function (d) { return d.id; }); }
  // Speelt een plan (lijst dagen, elke dag "kaart", "kaart:doel" of "kaart:doel:optie"); rng 0: in episode 3 A op dag 3, B op dag 5.
  function speel(id, plan) {
    var s = g.Engine.nieuwSpel(casus(), id, { rng: function () { return 0; } });
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

  /* ---------- vastlegging ---------- */
  T.registreer(G, "vastlegging: casus 1.6; twee nieuwe concepten ter goedkeuring staan open en in de lijst voor Bart", function () {
    T.is(casus().versie, "1.6");
    ["TODO_BART-C10", "TODO_BART-C11"].forEach(function (id) {
      var t = todo(id);
      T.waar(!!t && t.besluit === undefined && /^Concepttekst ter goedkeuring/.test(t.vraag) && typeof t.gekozenLezing === "string" && typeof t.plek === "string", id + " is een open concept");
    });
    T.waar(/17 november 2026/.test(todo("TODO_BART-C10").vraag));
    var gr = g.TODO_BART_GROEPEN;
    if (!gr) return;
    var concept = gr.filter(function (x) { return /ter goedkeuring/.test(x.titel) && DATUM.test(x.titel); });
    T.is(concept.length, 1); T.gelijk(concept[0].ids, ["TODO_BART-C10", "TODO_BART-C11"]);
  });

  /* ---------- besluit 1: onterecht verwijzen (I19) ---------- */
  T.registreer(G, "besluit 1 (I19): verwijzen vóór 'Na 48 uur geen verbetering.' haalt de poort niet, met hint en gevolgzin; erna wel", function () {
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev3"]]);
    var u = s.uitkomst;
    T.is(u.poortGehaald, false); T.gelijk(ids(u), ["I19"]); T.is(u.vraag, HINT19);
    T.gelijk(u.gevolgen.map(function (x) { return x.tekst; }), [ZIN19]);
    T.is(u.eindeNaKaart.terecht, false, "het oordeel na Verwijzen staat er nog steeds bij");
    // fosfomycine gestopt na A (dag 3), geen werkzaam middel: dag 5 'Na 48 uur geen verbetering.', dan verwijzen
    var t = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B2:V4"], ["Ev1"], ["Ev3"]]);
    T.is(t.klachten[5].status, "geenVerbetering48");
    T.gelijk(ids(t.uitkomst), []); T.is(t.uitkomst.afloop, "gehaald");
  });
  T.registreer(G, "besluit 1 (I19): ernst 5, de lichtste (1 = ernstigst); bij meer schendingen krijgt een ernstiger regel de vraag", function () {
    T.is(ep("E3").invarianten.filter(function (i) { return i.id === "I19"; })[0].ernst, 5);
    var u = speel("E3", [["G3", "O1", "Ev3"]]).uitkomst;   // dag 1: geen N1, geen O2/Ev2, en te vroeg verwezen
    T.waar(ids(u).indexOf("I19") >= 0 && ids(u).indexOf("I1") >= 0, ids(u).join());
    T.waar(u.vraag !== HINT19, "de vraag gaat over de ernstigste schending");
  });
  T.registreer(G, "besluit 1 (data): I19 alleen in episode 3, als concept met open vraag; geen casusinhoud in de code", function () {
    T.waar(!ep("E1").invarianten.some(function (i) { return i.id === "I19"; }) && !ep("E2").invarianten.some(function (i) { return i.id === "I19"; }));
    var i = ep("E3").invarianten.filter(function (x) { return x.id === "I19"; })[0];
    T.is(i.concept, true); T.is(i.vraag, HINT19); T.is(i.TODO_BART, todo("TODO_BART-C10").vraag);
    T.is(casus().gevolgzinnen.filter(function (z) { return z.invariant === "I19" && z.episode === "E3" && z.concept === true && z.tekst === ZIN19; }).length, 1);
    [g.Engine._bron, g.Evaluatie._bron, g.UI._bron].forEach(function (b) { T.waar(b.indexOf("I19") < 0 && b.indexOf(HINT19) < 0, "geen casusinhoud in de code"); });
  });

  /* ---------- besluit 2: een keuze blijft staan ---------- */
  T.registreer(G, "besluit 2 (menu): na Dosis aanpassen op lisinopril staat lisinopril niet meer in het menu; het spel weigert ook een tweede aanpassing", function () {
    var s = speel("E2", [["G2", "O1", "V5"], ["N1", HALF]]);
    T.gelijk(doelIds(s, "V6"), ["V5"], "alleen trimethoprim is nog aan te passen");
    T.is(g.Engine.speelKaart(s, "V6", { doel: "lisinopril", optie: "verdubbelen" }).ok, false, "de halvering blijft staan");
    T.is(g.UI.alleDoelenGebruikt(casus(), ep("E2"), s, "V6"), true);
  });
  T.registreer(G, "besluit 2 (menu): zijn alle doelen gebruikt, dan is het menu leeg; een kaart die nog nergens gespeeld is, telt niet als gebruikt", function () {
    var s = speel("E2", [["G2", "O1", "V4"], ["N1", HALF]]);
    T.gelijk(doelIds(s, "V6"), [], "lisinopril was het enige doel");
    T.is(g.UI.alleDoelenGebruikt(casus(), ep("E2"), s, "V6"), true);
    var t = speel("E2", [["G2", "O1", "V4"]]);
    T.is(g.UI.alleDoelenGebruikt(casus(), ep("E2"), t, "V6"), false);
  });
  T.registreer(G, "besluit 2 (menu): ook bij Antibioticum wisselen verdwijnt een middel waarnaar al gewisseld is uit het menu", function () {
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8"]]);
    T.waar(doelIds(s, "B1").indexOf("V8") < 0, "V8 staat er niet meer in: " + doelIds(s, "B1").join());
    T.is(g.Engine.plafondBereikt(s, "B1", "V8"), true); T.is(g.Engine.plafondBereikt(s, "B1", "V7"), false);
  });

  /* ---------- besluit 3: kaartteksten zonder ontwerptaal ---------- */
  T.registreer(G, "besluit 3 (teksten): V2, V6, B5 en Ev3 hebben de nieuwe effecttekst; geen kaart toont ontwerptaal of een bronnaam in het effect", function () {
    Object.keys(TEKSTEN).forEach(function (id) { T.is(kaart(id).effect.alle, TEKSTEN[id], id); });
    casus().kaarten.forEach(function (k) {
      var e = k.effect || {};
      Object.keys(e).forEach(function (sl) {
        T.waar(!/speler|[Vv]erlaat de kaart|Volgens (SIDRIK|NHG|KNMP)/.test(e[sl]), k.id + ": " + e[sl]);
      });
    });
    T.waar(/Concepttekst ter goedkeuring/.test(todo("TODO_BART-C11").vraag));
    Object.keys(TEKSTEN).forEach(function (id) { T.waar(todo("TODO_BART-C11").vraag.indexOf(TEKSTEN[id]) > 0, "C11 noemt de tekst van " + id); });
  });
})(typeof window !== "undefined" ? window : globalThis);

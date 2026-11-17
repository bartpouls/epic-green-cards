/* Tests voor de besluiten van Bart van 16 november 2026 (casus-uwi.md versie 1.5, sectie 12).
   1. Na Verwijzen stopt de episode, met een beoordeling of verwijzen terecht was.
   2. Lisinopril verdubbelen (I17) en wisselen naar een resistent middel (I18) zijn veiligheidsregels (poort).
   Met de ECHTE instellingen van de casus (Engine + Evaluatie + UI-logica). De conceptteksten worden gecontroleerd op tekst en markering. */
(function (g) {
  "use strict";
  var T = g.Test, G = "besluiten-1116";
  var SP = "spironolacton", DATUM = /16 november 2026/;
  var DOSIS = "V6:V8:875/125 mg 2 dd", HALF = "V6:lisinopril:halveren", DUBBEL = "V6:lisinopril:verdubbelen";
  var TERECHT = "Verwijzen was hier terecht: na 48 uur was er geen verbetering.";
  var ONTERECHT = "Verwijzen was hier nog niet nodig: mevrouw was nog niet 48 uur zonder verbetering.";
  var HINT17 = "Haar nierfunctie is lager dan 30. Wat doet een dubbele dosis lisinopril met haar nieren en haar kalium?";
  var HINT18 = "Je wisselt. Wat zegt de kweek over het middel waar je naartoe gaat?";
  function casus() { return g.CASUSSEN[0]; }
  function ep(id) { return casus().episodes.filter(function (e) { return e.id === id; })[0]; }
  function inv(id, i) { return ep(id).invarianten.filter(function (x) { return x.id === i; })[0]; }
  function todo(id) { return casus().todoBart.filter(function (t) { return t.id === id; })[0]; }
  function ids(u) { return u.geschonden.map(function (x) { return x.id; }); }
  function beoordeel(s) { return g.Evaluatie.beoordeel(casus(), s.episodeId, s); }
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
  // Basisroute episode 3 (zie tests/besluiten-1115.tests.js): haalt de poort.
  function basisE3() {
    return [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", DOSIS], ["Ev1"], ["B3:" + SP, HALF, "N3"], ["Ev1"]];
  }
  // Basisroute episode 2: fosfomycine na de kweek; de kweekuitslag komt op dag 4.
  function basisE2() { return [["G2", "O1", "V4"], ["N1", "N2:V4"]]; }

  /* ---------- vastlegging ---------- */
  T.registreer(G, "vastlegging: casus 1.5; de vraag over Verwijzen is beslist (besluit met datum); vier nieuwe concepten ter goedkeuring staan open en in de lijst voor Bart", function () {
    T.is(casus().versie, "1.6");
    var c5 = todo("TODO_BART-C5");
    T.waar(typeof c5.besluit === "string" && DATUM.test(c5.besluit) && /Bart/.test(c5.besluit), "C5 heeft een besluit met datum");
    T.waar(/stopt de episode/.test(c5.gekozenLezing), "de gekozen lezing beschrijft het nieuwe gedrag");
    ["TODO_BART-C6", "TODO_BART-C7", "TODO_BART-C8", "TODO_BART-C9"].forEach(function (id) {
      var t = todo(id);
      T.waar(!!t && t.besluit === undefined && /^Concepttekst ter goedkeuring/.test(t.vraag) && typeof t.gekozenLezing === "string" && typeof t.plek === "string", id + " is een open concept");
    });
    T.is(casus().todoBart.filter(function (t) { return t.besluit !== undefined && DATUM.test(t.besluit); }).length, 1, "alleen C5 is op 16 november beslist");
    var gr = g.TODO_BART_GROEPEN;
    if (!gr) return;
    var beslist = gr.filter(function (x) { return x.titel === "Beslist op 16 november 2026"; });
    T.is(beslist.length, 1); T.is(beslist[0].beslist, true); T.gelijk(beslist[0].ids, ["TODO_BART-C5"]);
    var concept = gr.filter(function (x) { return /ter goedkeuring/.test(x.titel) && /16 november 2026/.test(x.titel); });
    T.is(concept.length, 1); T.gelijk(concept[0].ids, ["TODO_BART-C6", "TODO_BART-C7", "TODO_BART-C8", "TODO_BART-C9"]);
  });

  /* ---------- besluit 1: na Verwijzen stopt de episode ---------- */
  T.registreer(G, "besluit 1 (engine): Verwijzen beëindigt de episode meteen; daarna weigert het spel elke zet en de beoordeling ligt vast", function () {
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "Ev3"]]);
    T.is(s.afgerond, true); T.is(s.dag, 2, "geen doorspoelen: de episode stopt op de dag van het verwijzen");
    T.waar(s.uitkomst && s.uitkomst.eindeNaKaart && s.uitkomst.eindeNaKaart.kaart === "Ev3", "de uitkomst noemt de kaart");
    T.is(g.Engine.speelKaart(s, "O2", {}).ok, false);
    T.is(g.Engine.eindeBereikt(s), true);
    T.gelijk(g.Engine.rondAf(s), s.uitkomst, "afronden geeft de vastgelegde beoordeling");
    // zonder Verwijzen stopt de episode niet na een kaart
    var t = speel("E3", [["G3", "O1", "V4"], ["N1"]]);
    T.is(t.afgerond, false);
  });
  T.registreer(G, "besluit 1 (beoordeling): verwijzen na 'Na 48 uur geen verbetering.' is terecht; ervoor niet terecht (sinds casus 1.6 een poortregel, I19)", function () {
    // fosfomycine gestopt na A (dag 3), geen werkzaam middel: dag 5 'Na 48 uur geen verbetering.', dan verwijzen
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B2:V4"], ["Ev1"], ["Ev3"]]);
    T.is(s.klachten[5].status, "geenVerbetering48");
    var u = s.uitkomst;
    T.gelijk(u.eindeNaKaart, { kaart: "Ev3", terecht: true, tekst: TERECHT });
    T.is(u.afloop, "gehaald"); T.is(u.score.doelmatigheid, 3);
    // verwijzen op dag 4, vóór die status
    var v = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B2:V4"], ["Ev1", "Ev3"]]);
    T.gelijk(v.uitkomst.eindeNaKaart, { kaart: "Ev3", terecht: false, tekst: ONTERECHT });
    T.is(v.uitkomst.afloop, "nietGehaald"); T.gelijk(ids(v.uitkomst), ["I19"], "niet terecht verwijzen is sinds 17 november 2026 een veiligheidsregel");
  });
  T.registreer(G, "besluit 1 (beoordeling): de gewone regels gelden op de stand van het verwijzen; het oordeel over verwijzen staat er ook bij een niet-gehaalde poort", function () {
    var s = speel("E3", [["G3", "O1", "V4"], ["Ev3"]]);   // dag 1: geen N1, geen O2/Ev2
    var u = s.uitkomst;
    T.is(u.poortGehaald, false); T.waar(ids(u).indexOf("I1") >= 0 && ids(u).indexOf("I9") >= 0, "I1 en I9: " + ids(u).join());
    T.gelijk(u.eindeNaKaart, { kaart: "Ev3", terecht: false, tekst: ONTERECHT });
    var m = g.UI.evaluatieModel(u);
    T.is(m.gehaald, false); T.is(m.eindeNaKaart, ONTERECHT);
    var m2 = g.UI.evaluatieModel(speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B2:V4"], ["Ev1"], ["Ev3"]]).uitkomst);
    T.is(m2.gehaald, true); T.is(m2.eindeNaKaart, TERECHT);
    T.is(g.UI.evaluatieModel(g.Test.rondAfTotEinde(speel("E3", basisE3()))).eindeNaKaart, null, "zonder verwijzen geen zin");
  });
  T.registreer(G, "besluit 1 (concept C9): verwijzen binnen de termijn van I15, I16 of I10 laat die eis vervallen; daarna niet", function () {
    // volgorde A,B: A dag 3, B dag 5; 'Na 48 uur geen verbetering.' ook op dag 5. Terecht verwijzen op dag 5, zonder sick day-maatregelen.
    var s = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B2:V4"], ["Ev1"], ["Ev3"]]);
    T.waar(s.gebeurtenissen.some(function (x) { return x.id === "B" && x.dag === 5; }));
    T.gelijk(ids(s.uitkomst), [], "I15 vervalt: verwezen op de dag van de uitdroging");
    var c = JSON.parse(JSON.stringify(casus())); delete c.episodes[2].eindeNaKaart[0].vervalt;
    T.waar(ids(g.Evaluatie.beoordeel(c, "E3", s)).indexOf("I15") >= 0, "zonder de concepteis telt I15 wel");
    // verwijzen op dag 3 (de dag van A), zonder contact: I16 vervalt
    var t = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "Ev3"]]);
    // I16 en I10 vervallen; wel telt I19 (casus 1.6): op de dag van de weefselinvasie is verwijzen nog niet terecht
    T.gelijk(ids(t.uitkomst), ["I19"], "I16 en I10 vervallen: verwezen op de dag van de weefselinvasie, fosfomycine liep nog");
    // te laat: werkzaam middel na A, B op dag 5 zonder maatregelen, verwijzen op dag 7: I15 blijft
    var u = speel("E3", [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", DOSIS], ["Ev1"], [], [], ["Ev3"]]);
    T.waar(ids(u.uitkomst).indexOf("I15") >= 0, "na de termijn telt I15: " + ids(u.uitkomst).join());
    T.is(ep("E3").eindeNaKaart[0].TODO_BART_vervalt, todo("TODO_BART-C9").vraag);
  });
  T.registreer(G, "besluit 1 (data): de kaart en de zinnen staan alleen in de data (episode 3), als concept; niet in de code", function () {
    var e = ep("E3").eindeNaKaart;
    T.is(e.length, 1); T.is(e[0].kaart, "Ev3"); T.is(e[0].tekstTerecht, TERECHT); T.is(e[0].tekstOnterecht, ONTERECHT);
    T.is(e[0].concept, true); T.is(e[0].TODO_BART, todo("TODO_BART-C8").vraag);
    T.waar(ep("E1").eindeNaKaart === undefined && ep("E2").eindeNaKaart === undefined, "alleen episode 3 (Verwijzen zit alleen daar in het repertoire)");
    [g.Engine._bron, g.Evaluatie._bron, g.UI._bron].forEach(function (b) { T.waar(b.indexOf("Ev3") < 0 && b.indexOf(TERECHT) < 0 && b.indexOf(ONTERECHT) < 0, "geen casusinhoud in de code"); });
  });
  T.registreer(G, "besluit 1 (data): een kaart buiten het repertoire of zonder zinnen in eindeNaKaart geeft een Nederlandse fout", function () {
    var c = JSON.parse(JSON.stringify(casus()));
    c.episodes[2].eindeNaKaart[0].kaart = "XX";
    T.gooit(function () { g.Evaluatie.valideerCasus(c); }, "onbekende kaart");
    try { g.Evaluatie.valideerCasus(c); } catch (e) { T.waar(/eindeNaKaart\[0\]: de kaart 'XX' zit niet in het repertoire/.test(e.message), e.message); }
    var d = JSON.parse(JSON.stringify(casus()));
    delete d.episodes[2].eindeNaKaart[0].tekstOnterecht;
    T.gooit(function () { g.Evaluatie.valideerCasus(d); }, "zin ontbreekt");
  });

  /* ---------- besluit 2: lisinopril verdubbelen (I17) ---------- */
  T.registreer(G, "besluit 2 (I17): lisinopril verdubbelen haalt in episode 2 en 3 de poort niet; halveren wel", function () {
    var e2 = g.Test.rondAfTotEinde(speel("E2", [["G2", "O1", "V4"], ["N1", "N2:V4", DUBBEL]]));
    T.gelijk(ids(e2), ["I17"]); T.is(e2.vraag, HINT17);
    T.gelijk(e2.gevolgen.map(function (x) { return x.tekst; }), ["De nierfunctie daalt verder en het kalium stijgt."]);
    // Dosis aanpassen kan één keer per middel: wie lisinopril verdubbelt, kan bij de uitdroging niet meer halveren (dus ook I15).
    var plan = basisE3(); plan[4][plan[4].indexOf(HALF)] = DUBBEL;
    var e3 = g.Test.rondAfTotEinde(speel("E3", plan));
    T.gelijk(ids(e3), ["I15", "I17"], "gelijke ernst 2: datavolgorde");
    T.is(g.Test.rondAfTotEinde(speel("E3", basisE3())).poortGehaald, true, "met halveren (in de basisroute) wel gehaald");
  });
  T.registreer(G, "besluit 2 (I17): ernst 2 gaat voor I1 (5); de regel is gemarkeerd als concept met een open vraag", function () {
    var u = g.Test.rondAfTotEinde(speel("E2", [["O1", "V4", DUBBEL]]));
    T.gelijk(ids(u), ["I17", "I1"]); T.is(u.vraag, HINT17);
    ["E2", "E3"].forEach(function (e) {
      var i = inv(e, "I17");
      T.is(i.ernst, 2); T.is(i.concept, true); T.is(i.TODO_BART, todo("TODO_BART-C6").vraag); T.waar(todo("TODO_BART-C6").vraag.indexOf(i.vraag) > 0);
    });
  });

  /* ---------- besluit 2: wisselen naar een resistent middel (I18) ---------- */
  T.registreer(G, "besluit 2 (I18, episode 2): wisselen naar trimethoprim na de kweekuitslag haalt de poort niet; vóór de uitslag valt het niet onder deze regel", function () {
    var na = basisE2().concat([[], ["B1:V5", "B1:V4"]]);   // dag 4: kweekuitslag; wissel naar trimethoprim en meteen terug
    var u = g.Test.rondAfTotEinde(speel("E2", na));
    T.waar(ids(u).indexOf("I18") >= 0, ids(u).join()); T.is(u.vraag, HINT18);
    T.waar(u.gevolgen.some(function (x) { return x.invariant === "I18" && x.tekst === "De klachten houden aan: de bacterie is resistent voor het middel dat ze gebruikt."; }));
    var voor = [["G2", "O1", "V4"], ["N1", "B1:V5", "B1:V4"]];   // dag 2: de uitslag is er nog niet
    T.waar(ids(g.Test.rondAfTotEinde(speel("E2", voor))).indexOf("I18") < 0, "vóór de uitslag geen I18");
  });
  T.registreer(G, "besluit 2 (I18, episode 3): trimethoprim na G3 of na de uitslag, amoxicilline na de uitslag; amoxicilline vóór de uitslag niet", function () {
    function i18(plan) { return ids(g.Test.rondAfTotEinde(speel("E3", plan))).indexOf("I18") >= 0; }
    var b = basisE3();
    var g3 = JSON.parse(JSON.stringify(b)); g3[1].push("B1:V5"); g3[2].unshift("B1:V4"); g3[2].splice(g3[2].indexOf("O1"), 1);   // dag 2: na G3 naar trimethoprim
    T.waar(i18([["G3", "O1", "V4"], ["N1", "B1:V5", "B1:V4"]]), "trimethoprim na G3 (dag 2, vóór de uitslag)");
    T.waar(!i18([["O1", "V4", "N1"], ["B1:V5", "B1:V4"]]), "trimethoprim zonder G3 en vóór de uitslag: niet onder deze regel");
    T.waar(i18([["G3", "O1", "V4"], ["N1"], [], ["B1:V10", "B1:V4"]]), "amoxicilline na de uitslag (dag 4)");
    T.waar(!i18([["G3", "O1", "V4"], ["N1", "B1:V10", "B1:V4"]]), "amoxicilline vóór de uitslag: niet onder deze regel");
    var i = inv("E3", "I18");
    T.is(i.ernst, 4); T.is(i.concept, true); T.is(i.TODO_BART, todo("TODO_BART-C7").vraag); T.is(i.vraag, HINT18);
  });
  T.registreer(G, "besluit 2 (data): regelnamen en conceptzinnen voor I17 en I18 in episode 2 en 3", function () {
    ["E2", "E3"].forEach(function (e) {
      ["I17", "I18"].forEach(function (i) {
        T.waar(casus().regelnamen.some(function (r) { return r.episode === e && r.invariant === i && typeof r.naam === "string"; }), e + " " + i + " naam");
        var z = casus().gevolgzinnen.filter(function (x) { return x.episode === e && x.invariant === i; });
        T.is(z.length, 1, e + " " + i + " zin"); T.is(z[0].concept, true); T.is(z[0].vrijgegeven, true);
      });
    });
  });
})(typeof window !== "undefined" ? window : globalThis);

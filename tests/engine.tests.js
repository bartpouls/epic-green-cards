// Tests van de spelmotor (groep 'engine'). Gebruikt een kleine synthetische casus (NIET UWI) en een eigen
// eenvoudige stub van Predicaten/Evaluatie, zodat de engine los van de echte regeltaal en casusdata getest wordt.
//
// STUB-GRENS (expliciet): de beoordeling (regels/evaluatie.js, stuk S6) bestaat nog niet. De engine roept alleen
// Evaluatie.beoordeel(casus, episodeId, state) aan en geeft de uitkomst ongewijzigd terug (contract 2 en 5). Hier wordt
// uitsluitend dat AANROEPCONTRACT getest, met StubEvaluatie. Poort, score, profiel en routes worden NIET door deze
// tests bewezen; dat doen de tests van S6 (tests/evaluatie.tests.js, tests/routes.js) via de echte Engine.
// Predicaten (regeltaal) bestaat wel: de tests die "echt:" heten gebruiken de echte regeltaal en de echte UWI-data.
(function (g) {
  var T = g.Test, GROEP = "engine";

  /* ---------- stubs ---------- */
  function tekstWaar(k, r) { return (!k.kaart || r.kaart === k.kaart) && (k.doel == null || r.doel === k.doel); }
  var StubPredicaten = {
    maakContext: function (casus, episode, state) {
      return { tijdlijn: state.tijdlijn, gebeurtenissen: state.gebeurtenissen, toestanden: state.toestanden,
        waar: episode.patient.waar, aantalDagen: state.aantalDagen, casus: casus, episode: episode, state: state };
    },
    evalueer: function (p, ctx) {
      switch (p.p) {
        case "waarheid": return p.waarde;
        case "gespeeld": return ctx.tijdlijn.some(function (r) { return tekstWaar(p.K, r); });
        case "nietGespeeld": return !ctx.tijdlijn.some(function (r) { return tekstWaar(p.K, r); });
        case "niet": return !StubPredicaten.evalueer(p.arg, ctx);
        case "gebeurtenisGeweest": return ctx.gebeurtenissen.some(function (x) { return x.id === p.id; });
        case "klachtenNu": { var kl = ctx.state.klachten[ctx.state.dag]; return !!kl && kl.status === p.waarde; }
        case "actief": {
          var dag = p.op && p.op.dag;
          var start = ctx.tijdlijn.some(function (r) { return r.kaart === p.middel && (dag == null || r.dag <= dag); });
          var stop = ctx.tijdlijn.some(function (r) { return r.kaart === "S" && r.doel === p.middel && (dag == null || r.dag <= dag); });
          return start && !stop;
        }
        default: throw new Error("stub kent predicaat niet: " + p.p);
      }
    }
  };
  var StubEvaluatie = { beoordeel: function (casus, episodeId, state) { return { stub: true, episodeId: episodeId, afgerond: state.afgerond, aantal: state.tijdlijn.length }; } };

  function metStub(fn) {
    var oP = g.Predicaten, oE = g.Evaluatie;
    g.Predicaten = StubPredicaten; g.Evaluatie = StubEvaluatie;
    try { fn(); } finally { g.Predicaten = oP; g.Evaluatie = oE; }
  }
  function test(naam, fn) { T.registreer(GROEP, naam, function () { metStub(fn); }); }

  /* ---------- synthetische casus (niet klinisch, willekeurige ids/namen) ---------- */
  function maakFixture() {
    return {
      id: "fixtuur", versie: "0",
      kaarten: [
        { id: "K1", categorie: "Gegevens", label: "Kaart een", doelkaart: false, downside: "d" },
        { id: "K2", categorie: "Gegevens", label: "Kaart twee", doelkaart: false, downside: "d" },
        { id: "M1", categorie: "Voorschrijven", label: "Middel een", doelkaart: false, downside: "d" },
        { id: "M2", categorie: "Voorschrijven", label: "Middel twee", doelkaart: false, downside: "d" },
        { id: "S", categorie: "Bijsturen", label: "Stop", doelkaart: true, downside: "d",
          doelen: { X1: [ { id: "M1", label: "Middel een", vereist: { p: "waarheid", waarde: true } },
                          { id: "M2", label: "Middel twee", vereist: { p: "gespeeld", K: { kaart: "K2" } } } ] } },
        { id: "D", categorie: "Bijsturen", label: "Dosis", doelkaart: true, downside: "d",
          doelen: { X1: [ { id: "M1", label: "Middel een" } ] },
          opties: { M1: [ { tekst: "optie-a" }, { tekst: "optie-b", goed: true } ] } },
        { id: "Z", categorie: "Onderzoek", label: "Buiten repertoire", doelkaart: false, downside: "d" }
      ],
      todoBart: [],
      raadplegen: { titel: "Bron", bronnen: ["BRON-A"] },
      episodes: [ {
        id: "X1", level: 1,
        knoppen: { actiesPerBeurt: 3, aantalDagen: 4, raadplegenKost: 1 },
        startToestanden: ["basis"],
        antibiotica: ["M1", "M2"],
        patient: {
          zichtbaar: { naam: "Fixtuur", lab: { w: 10, datum: "recent" } },
          waar: { w: 3 },
          verborgen: [ { kaart: "K2", onthult: "Verborgen tekst", sleutel: "w", waarde: 3 } ]
        },
        repertoire: ["K1", "K2", "M1", "M2", "S", "D"],
        gebeurtenissen: [
          { id: "P", groep: "PQ", trigger: { type: "naKaart", n: 2 }, tekst: "tp", toestand: "erger", zet: { statusNaBeurten: 2, resistent: ["M2"] } },
          { id: "Q", groep: "PQ", trigger: { type: "naKaart", n: 4 }, tekst: "tq" },
          { id: "R", trigger: { type: "naKaartVanKaart", kaart: "K1", n: 1 }, tekst: "tr", zet: { gevoelig: ["M2"] } },
          { id: "V", trigger: { type: "naKaart", n: 3, alleenAlsGespeeld: "K2" }, tekst: "tv" }
        ],
        werkzaamheid: {
          basis: { werkzaam: [ { kaart: "M1" } ], nietWerkzaam: [ { kaart: "M2" } ] },
          erger: { werkzaam: [ { kaart: "M2", als: { p: "gespeeld", K: { kaart: "K1" } } } ], nietWerkzaam: [ { kaart: "M1" } ] }
        },
        statusTeksten: { af: "tekst-af", aan: "tekst-aan", geenVerbetering48: "tekst-48" }
      }, {
        id: "X2", level: 2,
        knoppen: { actiesPerBeurt: 2, aantalDagen: 2, raadplegenKost: 0 },
        startToestanden: ["basis"], antibiotica: [], patient: { zichtbaar: {}, waar: {}, verborgen: [] }, repertoire: ["K1"], gebeurtenissen: []
      } ]
    };
  }
  function lijstVanTest(x) { return x == null ? [] : (Array.isArray(x) ? x : [x]); }
  function rngVast(w) { return function () { return w; }; }
  function speel(s, k, o) { var r = g.Engine.speelKaart(s, k, o); T.waar(r.ok, "speelKaart " + k + " mislukte: " + r.fout); return r; }
  function nieuw(w) { return g.Engine.nieuwSpel(maakFixture(), "X1", { rng: rngVast(w == null ? 0 : w) }); }
  function dagen(s, n) { for (var i = 0; i < n; i++) g.Engine.volgendeDag(s); }

  /* ---------- M1 API, beurten, budget ---------- */
  test("nieuwSpel: beginstand klopt met contract 2", function () {
    var s = nieuw();
    T.is(s.casusId, "fixtuur"); T.is(s.episodeId, "X1"); T.is(s.dag, 1); T.is(s.actiesOver, 3); T.is(s.aantalDagen, 4);
    T.is(s.afgerond, false); T.gelijk(s.tijdlijn, []); T.gelijk(s.raadplegingen, []); T.gelijk(s.gebeurtenissen, []);
    T.gelijk(s.toestanden, ["basis"]); T.gelijk(s.onthuld, []); T.gelijk(s.klachten[1], { dag: 1, status: null, tekst: null });
    T.is("pogingnummer" in s || "eerstePoging" in s, false, "poging wordt door Logging bepaald, niet door de engine");
  });
  test("nieuwSpel: startToestanden (lijst) is canoniek; ontbreekt of is geen lijst -> Nederlandse fout, geen terugval", function () {
    var c = maakFixture(); c.episodes[0].startToestanden = ["basis", "erger"];
    T.gelijk(g.Engine.nieuwSpel(c, "X1", {}).toestanden, ["basis", "erger"]);
    [undefined, "basis", []].forEach(function (waarde) {
      var c2 = maakFixture(); if (waarde === undefined) delete c2.episodes[0].startToestanden; else c2.episodes[0].startToestanden = waarde;
      try { g.Engine.nieuwSpel(c2, "X1", {}); T.waar(false, "had moeten falen"); }
      catch (e) { T.waar(/startToestanden/.test(e.message) && /De episode/.test(e.message), "foutmelding: " + e.message); }
    });
    var c3 = maakFixture(); c3.episodes[0].startToestand = "basis"; delete c3.episodes[0].startToestanden;
    T.gooit(function () { g.Engine.nieuwSpel(c3, "X1", {}); });
  });
  test("speelKaart: null/leeg/geen tekst als kaart geeft een Nederlandse fout (geen TypeError), state ongewijzigd", function () {
    var s = nieuw();
    [null, undefined, "", 5].forEach(function (k) {
      var voor = JSON.stringify(s), r = g.Engine.speelKaart(s, k);
      T.is(r.ok, false); T.waar(/kaart/.test(r.fout) && !/undefined|null|Cannot/.test(r.fout), r.fout); T.is(JSON.stringify(s), voor);
    });
  });
  test("nieuwSpel: onbekende episode geeft Nederlandse fout", function () {
    T.gooit(function () { g.Engine.nieuwSpel(maakFixture(), "NOPE", {}); });
  });
  test("speelKaart: tijdlijnregel heeft het contractformaat, volg telt kaarten, dag klopt", function () {
    var s = nieuw(); speel(s, "K1"); speel(s, "M1");
    T.gelijk(s.tijdlijn[0], { volg: 1, kaart: "K1", dag: 1, doel: null, optie: null });
    T.gelijk(s.tijdlijn[1], { volg: 2, kaart: "M1", dag: 1, doel: null, optie: null });
  });
  test("actiebudget: 3 acties per beurt, de vierde wordt geweigerd, volgende dag herstelt het budget", function () {
    var s = nieuw(); speel(s, "K1"); speel(s, "K2"); speel(s, "M1");
    T.is(s.actiesOver, 0);
    var r = g.Engine.speelKaart(s, "M2"); T.is(r.ok, false); T.waar(/acties/.test(r.fout)); T.is(s.tijdlijn.length, 3);
    g.Engine.volgendeDag(s); T.is(s.dag, 2); T.is(s.actiesOver, 3);
    T.is(s.tijdlijn[2].dag, 1); speel(s, "M2"); T.is(s.tijdlijn[3].dag, 2); T.is(s.tijdlijn[3].volg, 4);
  });
  test("raadpleeg: kost uit data, telt niet mee in volg, geeft bronverwijzing", function () {
    var s = nieuw(); var r = g.Engine.raadpleeg(s);
    T.is(r.ok, true); T.is(r.kost, 1); T.is(s.actiesOver, 2); T.gelijk(r.bronnen, ["BRON-A"]); T.is(r.titel, "Bron");
    T.gelijk(s.raadplegingen, [{ dag: 1 }]); speel(s, "K1"); T.is(s.tijdlijn[0].volg, 1);
  });
  test("raadpleeg: kost 0 in andere episode kost niets; te weinig acties wordt geweigerd", function () {
    var s2 = g.Engine.nieuwSpel(maakFixture(), "X2", {}); g.Engine.raadpleeg(s2); T.is(s2.actiesOver, 2);
    var s = nieuw(); speel(s, "K1"); speel(s, "K2"); speel(s, "M1");
    var r = g.Engine.raadpleeg(s); T.is(r.ok, false); T.is(s.raadplegingen.length, 0); T.is(s.actiesOver, 0);
  });
  test("volgendeDag: dag++, laatste dag zet einde, eindeBereikt", function () {
    var s = nieuw(); T.is(g.Engine.eindeBereikt(s), false);
    dagen(s, 3); T.is(s.dag, 4); T.is(g.Engine.eindeBereikt(s), false);
    g.Engine.volgendeDag(s); T.is(s.dag, 4); T.is(g.Engine.eindeBereikt(s), true);
    var r = g.Engine.speelKaart(s, "K1"); T.is(r.ok, false);
    T.gooit(function () { g.Engine.volgendeDag(s); });
  });
  test("rondAf: zet afgerond, roept Evaluatie.beoordeel aan, is idempotent; daarna geen kaarten meer", function () {
    var s = nieuw(); speel(s, "K1");
    var u = g.Engine.rondAf(s); T.is(s.afgerond, true); T.is(u.stub, true); T.is(u.aantal, 1);
    T.is(g.Engine.rondAf(s), u); T.is(g.Engine.eindeBereikt(s), true);
    T.is(g.Engine.speelKaart(s, "K2").ok, false); T.is(g.Engine.raadpleeg(s).ok, false);
    T.gooit(function () { g.Engine.volgendeDag(s); });
  });
  test("rondAf: zonder Evaluatie een duidelijke fout en de episode blijft open", function () {
    var s = nieuw(); var o = g.Evaluatie; g.Evaluatie = undefined;
    try { T.gooit(function () { g.Engine.rondAf(s); }); } finally { g.Evaluatie = o; }
    T.is(s.afgerond, false);
  });
  test("afrondenPasNaGebeurtenissen (TODO_BART-4): standaard uit, aan blokkeert vroeg afronden", function () {
    var s = nieuw(); g.Engine.rondAf(s); T.is(s.afgerond, true);
    var c = maakFixture(); c.episodes[0].afrondenPasNaGebeurtenissen = true;   // contract 4b: episode-niveau
    var s2 = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    T.gooit(function () { g.Engine.rondAf(s2); }); T.is(s2.afgerond, false);
    var c2 = maakFixture(); c2.episodes[0].knoppen.afrondenPasNaGebeurtenissen = true;   // oude plek wordt niet meer gelezen
    var s3 = g.Engine.nieuwSpel(c2, "X1", { rng: rngVast(0) }); g.Engine.rondAf(s3); T.is(s3.afgerond, true);
    var s4 = g.Engine.nieuwSpel(maakFixture(), "X1", { rng: rngVast(0), afrondenPasNaGebeurtenissen: true });
    T.gooit(function () { g.Engine.rondAf(s4); });
  });

  /* ---------- M2 onthullen ---------- */
  test("onthullen: verborgen waarde pas na de bijbehorende kaart; waar blijft ongewijzigd", function () {
    var casus = maakFixture(); var s = g.Engine.nieuwSpel(casus, "X1", { rng: rngVast(0) });
    T.is(s.zichtbaar.lab.w, 10); speel(s, "K1"); T.is(s.zichtbaar.lab.w, 10); T.is(s.onthuld.length, 0);
    var r = speel(s, "K2");
    T.is(r.onthuld.length, 1); T.is(r.onthuld[0].tekst, "Verborgen tekst"); T.is(r.onthuld[0].waarde, 3); T.is(r.onthuld[0].kaart, "K2");
    T.is(r.onthuld[0].sleutel, "w"); T.is(r.onthuld[0].dag, 1);
    T.is(s.zichtbaar.lab.w, 3); T.is(s.zichtbaar.lab.datum, "recent");
    T.is(casus.episodes[0].patient.waar.w, 3, "waar ongewijzigd"); T.is(casus.episodes[0].patient.zichtbaar.lab.w, 10, "data zelf niet gemuteerd");
  });
  test("onthullen: dubbel spelen onthult niet nogmaals", function () {
    var s = nieuw(); speel(s, "K2"); var r = speel(s, "K2"); T.is(r.onthuld.length, 0); T.is(s.onthuld.length, 1);
  });

  /* ---------- M3 gebeurtenissen ---------- */
  test("gebeurtenis: getriggerd na kaart n, banner pas aan het begin van de volgende dag, toestand dan gezet", function () {
    var s = nieuw(0); speel(s, "K1"); speel(s, "M1");
    T.gelijk(s.gebeurtenissen, [], "nog niet zichtbaar op dezelfde dag"); T.gelijk(s.toestanden, ["basis"]);
    g.Engine.volgendeDag(s);
    var ids = s.gebeurtenissen.map(function (e) { return e.id + "@" + e.dag + "/" + e.naVolg; });
    T.waar(ids.indexOf("P@2/2") >= 0 || ids.indexOf("Q@2/2") >= 0, "groepsgebeurtenis op dag 2 na kaart 2: " + ids);
  });
  test("groep: rng bepaalt de getrokken volgorde (rng 0 = datavolgorde, hoge rng draait om)", function () {
    T.gelijk(nieuw(0).groepen.PQ, ["P", "Q"]);
    T.gelijk(nieuw(0.99).groepen.PQ, ["Q", "P"]);
    T.gelijk(nieuw(0).volgordeAB, [], "volgordeAB alleen gevuld voor een groep AB");
  });
  test("groep: omgekeerde volgorde via rng geeft omgekeerde koppeling aan de triggers (n=2 en n=4)", function () {
    var casus = maakFixture(); casus.episodes[0].gebeurtenissen = casus.episodes[0].gebeurtenissen.filter(function (e) { return e.groep; });
    function speelReeks(rng) {
      var s = g.Engine.nieuwSpel(casus, "X1", { rng: rng });
      speel(s, "K1"); speel(s, "K2"); g.Engine.volgendeDag(s);
      var eerste = s.gebeurtenissen.map(function (e) { return e.id; });
      speel(s, "M1"); speel(s, "M2"); g.Engine.volgendeDag(s);
      return { eerste: eerste, orde: s.groepen.PQ.slice(), alle: s.gebeurtenissen.map(function (e) { return e.id + e.dag; }) };
    }
    var a = speelReeks(function () { return 0; }), b = speelReeks(function () { return 0; });
    T.gelijk(a.orde, ["P", "Q"]); T.gelijk(a.eerste, ["P"]); T.gelijk(a.alle, ["P2", "Q3"]); T.gelijk(b.alle, a.alle, "deterministisch");
    // rng die [P,Q] omdraait: Fisher-Yates met n=2 kiest j = i + floor(rng*(2-i)); rng 0.6 -> j=1
    var c = speelReeks(function () { return 0.6; });
    T.gelijk(c.orde, ["Q", "P"]); T.gelijk(c.eerste, ["Q"]); T.gelijk(c.alle, ["Q2", "P3"]);
  });
  test("gebeurtenis: elke gebeurtenis maar één keer", function () {
    var s = nieuw(0); speel(s, "K1"); speel(s, "K2"); speel(s, "M1"); g.Engine.volgendeDag(s);
    speel(s, "M2"); speel(s, "K1"); speel(s, "K2"); g.Engine.volgendeDag(s);
    var tel = {}; s.gebeurtenissen.forEach(function (e) { tel[e.id] = (tel[e.id] || 0) + 1; });
    for (var id in tel) T.is(tel[id], 1, "gebeurtenis " + id + " meer dan eens");
  });
  test("trigger naKaartVanKaart: n kaarten na de eerste keer dat de genoemde kaart is gespeeld", function () {
    var s = nieuw(0); speel(s, "M1"); speel(s, "K1"); speel(s, "M2");   // K1 is kaart 2, R na kaart 3
    g.Engine.volgendeDag(s);
    var r = s.gebeurtenissen.filter(function (e) { return e.id === "R"; });
    T.is(r.length, 1); T.is(r[0].naVolg, 3); T.is(r[0].dag, 2);
  });
  test("trigger naKaartVanKaart: zonder die kaart gebeurt er niets", function () {
    var s = nieuw(0); speel(s, "M1"); speel(s, "M2"); speel(s, "K2"); g.Engine.volgendeDag(s);
    T.is(s.gebeurtenissen.filter(function (e) { return e.id === "R"; }).length, 0);
  });
  test("trigger alleenAlsGespeeld: gebeurt alleen als die kaart eerder is gespeeld", function () {
    var met = nieuw(0); speel(met, "K2"); speel(met, "M1"); speel(met, "M2"); g.Engine.volgendeDag(met);
    T.is(met.gebeurtenissen.filter(function (e) { return e.id === "V"; }).length, 1);
    var zonder = nieuw(0); speel(zonder, "K1"); speel(zonder, "M1"); speel(zonder, "M2"); g.Engine.volgendeDag(zonder);
    T.is(zonder.gebeurtenissen.filter(function (e) { return e.id === "V"; }).length, 0);
  });
  test("gebeurtenis zet toestand en sets (resistent/gevoelig) uit de data", function () {
    var c = maakFixture(); c.episodes[0].gebeurtenissen = c.episodes[0].gebeurtenissen.filter(function (e) { return e.id === "P"; });
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); speel(s, "M1"); g.Engine.volgendeDag(s);
    T.gelijk(s.toestanden, ["basis", "erger"]); T.gelijk(s.sets.resistent, ["M2"]);
    var c2 = maakFixture(); c2.episodes[0].gebeurtenissen = c2.episodes[0].gebeurtenissen.filter(function (e) { return e.id === "P" || e.id === "R"; });
    var s2 = g.Engine.nieuwSpel(c2, "X1", { rng: rngVast(0) });
    speel(s2, "K1"); speel(s2, "M1"); g.Engine.volgendeDag(s2);   // P (n=2) en R (K1 + 1 kaart) tegelijk: gevoelig haalt M2 uit resistent
    T.gelijk(s2.sets.resistent, []); T.gelijk(s2.sets.gevoelig, ["M2"]);
  });
  test("raadplegen telt niet mee voor triggers op aantal kaarten", function () {
    var s = nieuw(0); g.Engine.raadpleeg(s); speel(s, "K1"); g.Engine.volgendeDag(s);
    T.is(s.gebeurtenissen.filter(function (e) { return e.id === "P"; }).length, 0);
  });

  /* ---------- M4 klachtenstatus ---------- */
  test("klachten: geen antibioticum actief -> null", function () {
    var s = nieuw(); speel(s, "K1"); g.Engine.volgendeDag(s);
    T.gelijk(s.klachten[2], { dag: 2, status: null, tekst: null });
  });
  test("klachten: werkzaam antibioticum aan het eind van de vorige dag -> af, met tekst uit data", function () {
    var s = nieuw(); speel(s, "M1"); g.Engine.volgendeDag(s);
    T.gelijk(s.klachten[2], { dag: 2, status: "af", tekst: "tekst-af" });
  });
  test("klachten: alleen niet-werkzaam antibioticum actief -> aan", function () {
    var s = nieuw(); speel(s, "M2"); g.Engine.volgendeDag(s);
    T.gelijk(s.klachten[2], { dag: 2, status: "aan", tekst: "tekst-aan" });
  });
  test("klachten: gestopt middel telt niet mee (stop-kaart met doel)", function () {
    var s = nieuw(); speel(s, "M1"); speel(s, "S", { doel: "M1" }); g.Engine.volgendeDag(s);
    T.is(s.klachten[2].status, null);
  });
  test("klachten: werkzaamheid hangt aan de geldende toestand en aan als-voorwaarden", function () {
    // na P (toestand erger) is M2 werkzaam, maar alleen als K1 gespeeld is
    var s = nieuw(0); speel(s, "M2"); speel(s, "K1"); g.Engine.volgendeDag(s);
    T.is(s.toestanden[s.toestanden.length - 1], "erger");
    T.is(s.klachten[2].status, "af", "M2 + K1 in toestand erger");
    var s2 = nieuw(0); speel(s2, "M2"); speel(s2, "K2"); g.Engine.volgendeDag(s2);
    T.is(s2.klachten[2].status, "aan", "M2 zonder K1: als-voorwaarde niet vervuld");
    var s3 = nieuw(0); speel(s3, "M1"); speel(s3, "K2"); g.Engine.volgendeDag(s3);
    T.is(s3.klachten[2].status, "aan", "M1 is niet werkzaam in toestand erger");
  });
  test("klachten: geenVerbetering48 na gebeurtenis met statusNaBeurten 2, blijft tot werkzaam middel actief is", function () {
    var s = nieuw(0);
    speel(s, "K2"); speel(s, "M2"); g.Engine.volgendeDag(s);       // P op dag 2 (banner), toestand erger, M2 zonder K1 niet werkzaam
    T.is(s.klachten[2].status, "aan");
    g.Engine.volgendeDag(s); T.is(s.klachten[3].status, "aan", "dag dA+1");
    g.Engine.volgendeDag(s); T.gelijk(s.klachten[4], { dag: 4, status: "geenVerbetering48", tekst: "tekst-48" });
  });
  test("klachten: geenVerbetering48 blijft (dag 5+) en eindigt zodra een werkzaam middel aan het eind van een dag actief is", function () {
    var casus = maakFixture(); casus.episodes[0].knoppen.aantalDagen = 7;
    var s = g.Engine.nieuwSpel(casus, "X1", { rng: rngVast(0) });
    speel(s, "K2"); speel(s, "M2"); g.Engine.volgendeDag(s);
    dagen(s, 3);                                                    // naar dag 5
    T.is(s.klachten[4].status, "geenVerbetering48"); T.is(s.klachten[5].status, "geenVerbetering48");
    speel(s, "K1"); g.Engine.volgendeDag(s);                        // K1 maakt M2 werkzaam (toestand erger)
    T.is(s.klachten[6].status, "af");
    g.Engine.volgendeDag(s); T.is(s.klachten[7].status, "af");
  });
  test("klachten: werkzaam middel op tijd -> geen override", function () {
    var s = nieuw(0); speel(s, "K1"); speel(s, "M2"); g.Engine.volgendeDag(s);
    dagen(s, 2);
    T.is(s.klachten[2].status, "af"); T.is(s.klachten[3].status, "af"); T.is(s.klachten[4].status, "af");
  });

  /* ---------- M5 validatie ---------- */
  function ongewijzigd(s, fn) {
    var voor = JSON.stringify(s); var r = fn(); T.is(r.ok, false, "verwachtte ok:false"); T.waar(typeof r.fout === "string" && r.fout.length > 5, "Nederlandse foutmelding");
    T.is(JSON.stringify(s), voor, "state ongewijzigd"); return r;
  }
  test("validatie: onbekende kaart en kaart buiten repertoire -> fout, state ongewijzigd", function () {
    var s = nieuw(); ongewijzigd(s, function () { return g.Engine.speelKaart(s, "ONBEKEND"); });
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "Z"); });
  });
  test("validatie: doelkaart zonder doel, met onbekend doel -> fout", function () {
    var s = nieuw(); ongewijzigd(s, function () { return g.Engine.speelKaart(s, "S"); });
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "S", { doel: "NOPE" }); });
  });
  test("validatie: doel met niet-vervuld vereist-predicaat wordt geweigerd, daarna wel toegestaan", function () {
    var s = nieuw(); ongewijzigd(s, function () { return g.Engine.speelKaart(s, "S", { doel: "M2" }); });
    speel(s, "K2"); var r = speel(s, "S", { doel: "M2" }); T.is(r.regel.doel, "M2");
    T.gelijk(s.tijdlijn[1], { volg: 2, kaart: "S", dag: 1, doel: "M2", optie: null });
  });
  test("validatie: kaart zonder doel accepteert geen doel of optie", function () {
    var s = nieuw(); ongewijzigd(s, function () { return g.Engine.speelKaart(s, "K1", { doel: "M1" }); });
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "K1", { optie: "x" }); });
  });
  test("validatie: kaart met opties vraagt verplicht om een geldige optie", function () {
    var s = nieuw();
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "D", { doel: "M1" }); });
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "D", { doel: "M1", optie: "bestaat-niet" }); });
    var r = speel(s, "D", { doel: "M1", optie: "optie-a" });
    T.gelijk(r.regel, { volg: 1, kaart: "D", dag: 1, doel: "M1", optie: "optie-a" });
  });
  test("validatie: geweigerde zet kost geen actie en telt niet voor triggers", function () {
    var s = nieuw(0); g.Engine.speelKaart(s, "S"); g.Engine.speelKaart(s, "Z"); T.is(s.actiesOver, 3); T.is(s.wachtend.length, 0);
  });

  /* ---------- M6 / M8 data-gedreven ---------- */
  test("nieuwe casus = alleen nieuwe data: tweede synthetische casus met andere ids werkt zonder codewijziging", function () {
    var c = {
      id: "andere", kaarten: [ { id: "a", label: "A", categorie: "x", downside: "d" }, { id: "b", label: "B", categorie: "x", downside: "d" } ],
      episodes: [ { id: "e9", knoppen: { actiesPerBeurt: 1, aantalDagen: 3, raadplegenKost: 0 }, startToestanden: ["t0"], antibiotica: ["b"],
        patient: { zichtbaar: { k: 1 }, waar: {}, verborgen: [ { kaart: "a", onthult: "zie", sleutel: "k", waarde: 2 } ] },
        repertoire: ["a", "b"], gebeurtenissen: [ { id: "ZZ", trigger: { type: "naAantalKaarten", n: 1 }, tekst: "t", toestand: "t1" } ],
        werkzaamheid: { t0: { werkzaam: [ { kaart: "b" } ], nietWerkzaam: [] }, t1: { werkzaam: [], nietWerkzaam: [ { kaart: "b" } ] } },
        statusTeksten: { af: "goed", aan: "slecht", geenVerbetering48: "x" } } ]
    };
    var s = g.Engine.nieuwSpel(c, "e9", {});
    var r = speel(s, "a"); T.is(r.onthuld[0].tekst, "zie"); T.is(s.zichtbaar.k, 2);
    T.is(g.Engine.speelKaart(s, "b").ok, false, "1 actie per beurt");
    g.Engine.volgendeDag(s); T.gelijk(s.gebeurtenissen, [{ id: "ZZ", dag: 2, naVolg: 1 }]); T.gelijk(s.toestanden, ["t0", "t1"]);
    speel(s, "b"); g.Engine.volgendeDag(s); T.is(s.klachten[3].status, "aan"); T.is(s.klachten[3].tekst, "slecht");
  });
  test("klachten: werkzaamheid kiest op datavolgorde, niet op activeringsvolgorde (A/B-trekking verandert het klinische resultaat niet)", function () {
    function speelMet(rngWaarde) {
      var c = maakFixture(), ep = c.episodes[0];
      ep.gebeurtenissen = [
        { id: "P", groep: "PQ", trigger: { type: "naKaart", n: 1 }, tekst: "tp", toestand: "erger" },
        { id: "Q", groep: "PQ", trigger: { type: "naKaart", n: 2 }, tekst: "tq", toestand: "uitdroging" }
      ];
      ep.werkzaamheid.uitdroging = { werkzaam: [ { kaart: "M1" } ], nietWerkzaam: [] };
      ep.werkzaamheid.erger = { werkzaam: [], nietWerkzaam: [ { kaart: "M1" } ] };
      var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(rngWaarde) });
      speel(s, "M1"); speel(s, "K1"); dagen(s, 3);
      return s;
    }
    var a = speelMet(0), b = speelMet(0.99);
    T.waar(JSON.stringify(a.toestanden) !== JSON.stringify(b.toestanden), "de toestanden zijn in andere volgorde geactiveerd: " + a.toestanden + " / " + b.toestanden);
    T.gelijk(a.klachten, b.klachten);
    T.is(a.klachten[2].status, "af"); T.is(a.klachten[3].status, "af");
  });
  test("engine.js bevat geen casuslogica: geen ids van kaarten/middelen/comedicatie/toestanden uit de echte casus en geen drempels (Function.prototype.toString)", function () {
    var fs = g.Engine._functies; T.waar(fs && fs.length > 20, "interne functies bereikbaar");
    var bron = fs.map(function (f) { return Function.prototype.toString.call(f); }).join("\n");
    ["nieuwSpel","speelKaart","raadpleeg","volgendeDag","rondAf","eindeBereikt","ontgrendeld","herkansing"].forEach(function (k) {
      T.waar(bron.indexOf(Function.prototype.toString.call(g.Engine[k])) >= 0, k + " zit in de gescande bron");
    });
    // 'bron' zonder tekstconstanten van contractnamen: de scan zoekt naar casusnamen, niet naar contract-API
    var namen = {};
    if (g.CASUSSEN) g.CASUSSEN.forEach(function (c) {
      (c.kaarten || []).forEach(function (k) { namen[k.id] = 1; });
      (c.episodes || []).forEach(function (e) {
        (e.antibiotica || []).forEach(function (m) { namen[m] = 1; });
        ((e.patient && e.patient.medicatie) || []).forEach(function (m) { namen[m.id] = 1; });
        (e.startToestanden || []).forEach(function (m) { namen[m] = 1; });
        Object.keys(e.werkzaamheid || {}).forEach(function (m) { namen[m] = 1; });
        (e.gebeurtenissen || []).forEach(function (x) { if (x.toestand) namen[x.toestand] = 1; });
        Object.keys((e.patient && e.patient.waar) || {}).forEach(function (m) { namen[m] = 1; });
      });
    });
    ["cystitis","weefselinvasie","uitdroging","eGFR","lisinopril","calcium","fosfomycine","nitrofurantoine","ciprofloxacine","trimethoprim"].forEach(function (m) { namen[m] = 1; });
    var gevonden = [];
    Object.keys(namen).forEach(function (n) {
      if (n === "statusTeksten" || n === "TODO_BART" || n.length < 2) return;
      var re = new RegExp("(^|[^A-Za-z0-9_])" + n.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + "([^A-Za-z0-9_]|$)", "i");
      // woorden als 'dag' of 'tekst' zijn geen casusnamen; alleen echte treffers tellen
      if (re.test(bron.replace(/\/\/[^\n]*/g, ""))) gevonden.push(n);
    });
    T.gelijk(gevonden, [], "casusnamen in engine.js: " + gevonden.join(", "));
    // Episode-id's en gebeurtenis-id's (ook 1-letterige) en alle andere id's uit de echte data mogen nergens als tekstconstante in de code staan.
    var ids = {};
    (g.CASUSSEN || []).forEach(function (c) {
      ids[c.id] = 1;
      (c.kaarten || []).forEach(function (k) { ids[k.id] = 1; });
      (c.episodes || []).forEach(function (e) {
        ids[e.id] = 1;
        (e.gebeurtenissen || []).forEach(function (x) { ids[x.id] = 1; if (x.groep) ids[x.groep] = 1; });
        (e.antibiotica || []).forEach(function (m) { ids[m] = 1; });
        ((e.patient && e.patient.medicatie) || []).forEach(function (m) { ids[m.id] = 1; });
        (e.startToestanden || []).forEach(function (m) { ids[m] = 1; });
        Object.keys(e.werkzaamheid || {}).forEach(function (m) { ids[m] = 1; });
        (e.gebeurtenissen || []).forEach(function (x) { lijstVanTest(x.toestand).forEach(function (t) { ids[t] = 1; }); });
        (e.invarianten || []).forEach(function (x) { ids[x.id] = 1; });
      });
    });
    T.waar(Object.keys(ids).length > 30, "id-lijst uit de echte data is gevuld (anders bewijst deze scan niets)");
    T.waar(ids.E2 && ids.C && ids.A && ids.B, "episode-id's en gebeurtenis-id's zitten in de scan");
    var kaalBron = bron.replace(/\/\/[^\n]*/g, "");
    var literalGevonden = Object.keys(ids).filter(function (n) {
      if (!n || n === "TODO_BART") return false;
      return new RegExp("[\"']" + n.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + "[\"']").test(kaalBron);
    });
    T.gelijk(literalGevonden, [], "id's uit de echte data als tekstconstante in engine.js: " + literalGevonden.join(", "));
    var kaal = bron.replace(/"[^"]*"/g, '""');
    [/<\s*30\b/, /\b38[,.]5\b/, /\b75\b/, /[<>]=?\s*(?:2|3|4|5|7)\d?\b(?!\s*[;)])/ ].slice(0, 3).forEach(function (re) { T.waar(!re.test(kaal), "drempel-patroon in engine.js: " + re); });
    T.waar(!/\b48\b/.test(kaal), "getal 48 in code (buiten tekstconstanten)");
  });
  test("casus-object wordt niet gemuteerd door een volledig spel", function () {
    var c = maakFixture(), voor = JSON.stringify(c), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K2"); speel(s, "M1"); g.Engine.volgendeDag(s); dagen(s, 3); g.Engine.rondAf(s);
    T.is(JSON.stringify(c), voor);
  });

  /* ---------- M7 ontgrendelen en herkansing ---------- */
  test("ontgrendeld: eerste episode altijd open, volgende pas na gehaald", function () {
    var c = maakFixture();
    T.is(g.Engine.ontgrendeld(c, "X1", []), true); T.is(g.Engine.ontgrendeld(c, "X2", []), false);
    T.is(g.Engine.ontgrendeld(c, "X2", ["X1"]), true);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", poortGehaald: false }]), false);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", poortGehaald: true }]), true);
    T.is(g.Engine.ontgrendeld(c, "X2", { X1: true }), true);
    T.is(g.Engine.ontgrendeld(c, "BESTAATNIET", ["X1"]), false);
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, []), ["X1"]); T.gelijk(g.Engine.ontgrendeldeEpisodes(c, ["X1"]), ["X1", "X2"]);
  });
  test("herkansing: nieuw spel zelfde episode, schone staat; poging wordt niet door de engine geteld", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); g.Engine.rondAf(s);
    var h = g.Engine.herkansing(s);
    T.is(h.afgerond, false); T.gelijk(h.tijdlijn, []); T.is(h.dag, 1); T.is(h.actiesOver, 3); T.is(h.episodeId, "X1");
    T.is("pogingnummer" in h || "eerstePoging" in h, false);
    T.is(g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }).dag, 1);
    T.waar(!/pogingenTeller|pogingnummer|eerstePoging/.test(g.Engine._functies.map(function (f) { return Function.prototype.toString.call(f); }).join("")), "geen geheugenteller in de engine");
  });
  test("ontgrendeld met Logging-records (contract 6): poortGehaald===true OF (geen veld poortGehaald en geschonden leeg)", function () {
    var c = maakFixture();
    function rec(extra) { var r = { pseudoniem: "p", casusId: "fixtuur", episodeId: "X1", tijdlijn: [], onthuld: [], score: null, profiel: null }; for (var k in extra) r[k] = extra[k]; return r; }
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: [] })]), true, "Logging-record zonder schending");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: ["I3"] })]), false, "Logging-record met schending");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: ["I3"] }), rec({ geschonden: [] })]), true, "latere poging gehaald");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: [], poortGehaald: false })]), false, "expliciet niet gehaald wint");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ poortGehaald: true, geschonden: ["x"] })]), true);
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({})]), false, "geschonden ontbreekt: niet gehaald");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: [], episodeId: "ANDER" })]), false, "andere episode telt niet");
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, [rec({ geschonden: [] })]), ["X1", "X2"]);
  });

  /* ---------- ronde 3: F1 (ontgrendelen per casus), F2 (atomische volgendeDag), F3 (contractgedrag vastgepind) ---------- */

  test("ontgrendeld: een Logging-record van een ANDERE casus (casusId) opent niets, ook niet met lege geschonden-lijst of poortGehaald", function () {
    var c = maakFixture();
    function rec(extra) { var r = { pseudoniem: "p", casusId: "andere-casus", episodeId: "X1", tijdlijn: [], geschonden: [] }; for (var k in extra) r[k] = extra[k]; return r; }
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({})]), false, "andere casus, geschonden leeg");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ poortGehaald: true })]), false, "andere casus, poortGehaald");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ uitkomst: { poortGehaald: true } })]), false, "andere casus, uitkomst.poortGehaald");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ casusId: "fixtuur" })]), true, "dezelfde casus telt wel");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({}), rec({ casusId: "fixtuur" })]), true, "gemengd: het record van de eigen casus telt");
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", geschonden: [] }]), true, "record zonder casusId blijft geldig (oudere vorm)");
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, [rec({})]), ["X1"]);
    // Eerste episode is altijd open en een episode van een andere casus bestaat hier niet.
    T.is(g.Engine.ontgrendeld(c, "X1", [rec({})]), true);
  });
  test("ontgrendeld: record-vorm {episodeId, uitkomst:{poortGehaald}} wordt gelezen; false/ontbrekend telt niet", function () {
    var c = maakFixture();
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", uitkomst: { poortGehaald: true } }]), true);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", uitkomst: { poortGehaald: false } }]), false);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", uitkomst: { poortGehaald: false }, geschonden: [] }]), false, "expliciet niet gehaald wint van lege lijst");
  });

  test("volgendeDag is atomisch: een fout (kapot predicaat in de data) laat de state exact ongewijzigd; daarna werkt dezelfde stap alsnog", function () {
    var c = maakFixture(); c.episodes[0].werkzaamheid.erger.werkzaam[0].als = { p: "bestaatniet" };
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); speel(s, "M2");              // P (kaart 2) wacht; M2 is straks actief in toestand erger
    var voor = JSON.stringify(s), toestandenRef = s.toestanden, wachtendRef = s.wachtend;
    T.gooit(function () { g.Engine.volgendeDag(s); });
    T.is(JSON.stringify(s), voor, "state ongewijzigd na de fout");
    T.waar(s.toestanden === toestandenRef && s.wachtend === wachtendRef, "zelfde arrays (in-place hersteld)");
    T.is(s.dag, 1); T.is(s.klachten.length, 2); T.is(s.wachtend.length, 2, "P en R wachten"); T.gelijk(s.gebeurtenissen, []); T.gelijk(s.toestanden, ["basis"]);
    T.gelijk(s.sets, { resistent: [], gevoelig: [] });
    T.gooit(function () { g.Engine.volgendeDag(s); });
    T.is(JSON.stringify(s), voor, "ook een tweede poging verandert niets (geen overgeslagen dag)");
    c.episodes[0].werkzaamheid.erger.werkzaam[0].als = { p: "gespeeld", K: { kaart: "K1" } };   // data hersteld
    g.Engine.volgendeDag(s);
    T.is(s.dag, 2); T.is(s.klachten[2].status, "af"); T.is(s.gebeurtenissen.length, 2); T.is(s.wachtend.length, 0); T.is(s.actiesOver, 3);
  });
  test("volgendeDag is atomisch ook voor sets/toestanden: een gebeurtenis met zet wordt bij een fout niet half toegepast", function () {
    var c = maakFixture(); c.episodes[0].werkzaamheid.erger.werkzaam[0].als = { p: "bestaatniet" };
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); speel(s, "M2");
    T.gooit(function () { g.Engine.volgendeDag(s); });
    T.gelijk(s.sets.resistent, [], "P zet M2 resistent; bij een fout niet bewaard"); T.gelijk(s.toestanden, ["basis"]);
    T.is(s.actiesOver, 1);
  });

  /* validatie: de boodschap moet de BEDOELDE reden noemen, niet een andere weigering */
  test("validatie: doel ontbreekt en optie ontbreekt geven elk hun eigen melding", function () {
    var s = nieuw();
    var r1 = g.Engine.speelKaart(s, "S"); T.is(r1.ok, false); T.waar(/Kies eerst een doel/.test(r1.fout), r1.fout);
    var r2 = g.Engine.speelKaart(s, "D", { doel: "M1" }); T.is(r2.ok, false); T.waar(/Kies eerst een optie/.test(r2.fout), r2.fout);
    var r3 = g.Engine.speelKaart(s, "D", { doel: "M1", optie: "bestaat-niet" }); T.waar(/hoort niet bij dit doel/.test(r3.fout), r3.fout);
    var r4 = g.Engine.speelKaart(s, "S", { doel: "NOPE" }); T.waar(/kan niet bij de kaart/.test(r4.fout), r4.fout);
    T.is(s.tijdlijn.length, 0);
  });
  test("validatie: een doelkaart ZONDER opties (S) weigert een optie met de melding dat er geen opties zijn", function () {
    var s = nieuw(); var r = g.Engine.speelKaart(s, "S", { doel: "M1", optie: "x" });
    T.is(r.ok, false); T.waar(/geen opties/.test(r.fout), r.fout); T.is(s.tijdlijn.length, 0); T.is(s.actiesOver, 3);
  });
  test("validatie: vereist-predicaat ziet gebeurtenissen en klachtenstatus van de state (ctx is volledig)", function () {
    var c = maakFixture(); var k = c.kaarten.filter(function (x) { return x.id === "S"; })[0];
    k.doelen.X1 = [ { id: "M1", label: "Middel een", vereist: { p: "gebeurtenisGeweest", id: "P" } },
                    { id: "M2", label: "Middel twee", vereist: { p: "klachtenNu", waarde: "aan" } } ];
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    T.is(g.Engine.speelKaart(s, "S", { doel: "M1" }).ok, false, "P nog niet gebeurd");
    T.is(g.Engine.speelKaart(s, "S", { doel: "M2" }).ok, false, "klachten nog niet aan");
    speel(s, "K1"); speel(s, "M2"); g.Engine.volgendeDag(s);           // P op dag 2, M2 niet werkzaam zonder K1? (K1 gespeeld: wel) -> status af
    T.is(s.klachten[2].status, "af"); speel(s, "S", { doel: "M1" });   // gebeurtenisGeweest P
    var c2 = maakFixture(); c2.kaarten.filter(function (x) { return x.id === "S"; })[0].doelen.X1 = [ { id: "M2", label: "x", vereist: { p: "klachtenNu", waarde: "aan" } } ];
    var t = g.Engine.nieuwSpel(c2, "X1", { rng: rngVast(0) });
    speel(t, "M2"); g.Engine.volgendeDag(t);                            // M2 in basis: niet werkzaam -> aan
    T.is(t.klachten[2].status, "aan"); speel(t, "S", { doel: "M2" });
  });

  /* raadplegen: grenzen */
  test("raadpleeg: precies 'kost' acties over is genoeg (kost 1, 1 actie over -> ok, 0 over); bij 0 over geweigerd", function () {
    var s = nieuw(); speel(s, "K1"); speel(s, "K2"); T.is(s.actiesOver, 1);
    var r = g.Engine.raadpleeg(s); T.is(r.ok, true); T.is(s.actiesOver, 0); T.is(s.raadplegingen.length, 1);
    var r2 = g.Engine.raadpleeg(s); T.is(r2.ok, false); T.waar(/acties/.test(r2.fout)); T.is(s.raadplegingen.length, 1);
  });
  test("raadpleeg: na de laatste dag geweigerd (ook al zijn er acties over)", function () {
    var s = nieuw(); dagen(s, 4); T.is(s.dagenVoorbij, true); T.waar(s.actiesOver >= 1);
    var voor = JSON.stringify(s), r = g.Engine.raadpleeg(s); T.is(r.ok, false); T.waar(/laatste dag/.test(r.fout), r.fout); T.is(JSON.stringify(s), voor);
  });

  /* afronden */
  test("rondAf: gooit Evaluatie.beoordeel een fout, dan blijft de episode open (afgerond=false, geen uitkomst) en kan opnieuw", function () {
    var s = nieuw(); speel(s, "K1"); var o = g.Evaluatie;
    g.Evaluatie = { beoordeel: function () { throw new Error("kapot"); } };
    try { T.gooit(function () { g.Engine.rondAf(s); }); } finally { g.Evaluatie = o; }
    T.is(s.afgerond, false); T.is(s.uitkomst, null); T.is(g.Engine.eindeBereikt(s), false);
    T.is(g.Engine.speelKaart(s, "K2").ok, true, "na de fout kan er nog gespeeld worden");
    T.is(g.Engine.rondAf(s).stub, true); T.is(s.afgerond, true);
  });
  test("rondAf: Evaluatie.beoordeel krijgt (casus, episodeId, state) en de uitkomst gaat ongewijzigd terug (stub-grens naar S6)", function () {
    var s = nieuw(), gezien = null, uit = { eigen: 1 }, o = g.Evaluatie;
    g.Evaluatie = { beoordeel: function (c, e, st) { gezien = [c.id, e, st === s]; return uit; } };
    try { T.is(g.Engine.rondAf(s), uit); T.is(s.uitkomst, uit); } finally { g.Evaluatie = o; }
    T.gelijk(gezien, ["fixtuur", "X1", true]);
  });
  test("afrondenPasNaGebeurtenissen aan: een gebeurtenis die getriggerd maar nog wachtend is telt NIET als gebeurd; na de volgende dag wel", function () {
    var c = maakFixture(); c.episodes[0].afrondenPasNaGebeurtenissen = true;
    c.episodes[0].gebeurtenissen = c.episodes[0].gebeurtenissen.filter(function (e) { return e.id === "P"; }); c.episodes[0].gebeurtenissen[0].groep = undefined;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); speel(s, "M1"); T.is(s.wachtend.length, 1);
    T.gooit(function () { g.Engine.rondAf(s); }); T.is(s.afgerond, false);
    g.Engine.volgendeDag(s); T.is(s.gebeurtenissen.length, 1);
    T.is(g.Engine.rondAf(s).stub, true);
  });
  test("afrondenPasNaGebeurtenissen aan: na de laatste dag (dagenVoorbij) mag afronden altijd (contract 4b)", function () {
    var c = maakFixture(); c.episodes[0].afrondenPasNaGebeurtenissen = true;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    dagen(s, 4); T.is(s.dagenVoorbij, true);
    T.waar(s.gebeurtenissen.length < c.episodes[0].gebeurtenissen.length, "er zijn nog gebeurtenissen niet gebeurd");
    T.is(g.Engine.rondAf(s).stub, true); T.is(s.afgerond, true);
  });

  /* onthullen */
  function onthulCasus(verborgen, zichtbaar, waar) {
    var c = maakFixture(), e = c.episodes[0];
    e.patient.verborgen = verborgen; if (zichtbaar) e.patient.zichtbaar = zichtbaar; if (waar) e.patient.waar = waar;
    return c;
  }
  test("onthullen: zonder 'waarde' in de data wordt patient.waar[sleutel] onthuld (contract 4b), ook in zichtbaar", function () {
    var c = onthulCasus([ { kaart: "K2", onthult: "tekst", sleutel: "w" } ], { lab: { w: 10 } }, { w: 7 });
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); var r = speel(s, "K2");
    T.is(r.onthuld[0].waarde, 7); T.is(s.onthuld[0].waarde, 7); T.is(s.zichtbaar.lab.w, 7); T.is(c.episodes[0].patient.waar.w, 7);
  });
  test("onthullen: sleutel met punt ('lab.w') zet het geneste veld; een nieuw pad wordt aangemaakt", function () {
    var c = onthulCasus([ { kaart: "K2", onthult: "a", sleutel: "lab.w", waarde: 4 }, { kaart: "K1", onthult: "b", sleutel: "nieuw.diep", waarde: 5 } ], { lab: { w: 10 } }, {});
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); speel(s, "K2"); speel(s, "K1");
    T.is(s.zichtbaar.lab.w, 4); T.is(s.zichtbaar.nieuw.diep, 5); T.is(s.zichtbaar["lab.w"], undefined, "geen veld met een punt in de naam");
  });
  test("onthullen: zichtbaar-patch wordt gemengd (geneste objecten samengevoegd) zonder de casusdata te delen of te muteren", function () {
    var c = onthulCasus([ { kaart: "K2", onthult: "t", sleutel: "w", waarde: { a: 1 }, zichtbaar: { lab: { extra: { x: 1 } }, vlag: true } } ], { lab: { w: 10, datum: "d" } }, {});
    var voor = JSON.stringify(c), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); var r = speel(s, "K2");
    T.is(s.zichtbaar.lab.datum, "d", "bestaand veld blijft"); T.is(s.zichtbaar.lab.extra.x, 1); T.is(s.zichtbaar.vlag, true);
    s.zichtbaar.lab.extra.x = 99; s.zichtbaar.lab.w.a = 99; r.onthuld[0].waarde.a = 99; s.onthuld[0].waarde.a = 98;
    T.is(JSON.stringify(c), voor, "casusdata wordt niet gedeeld met state of resultaat");
  });
  test("onthullen: het resultaat van speelKaart is een kopie (wijzigen ervan raakt state.onthuld niet)", function () {
    var s = nieuw(); var r = speel(s, "K2"); r.onthuld[0].tekst = "veranderd";
    T.is(s.onthuld[0].tekst, "Verborgen tekst");
    var r2 = speel(s, "M1"); r2.regel.kaart = "X"; T.is(s.tijdlijn[1].kaart, "M1");
  });

  /* gebeurtenissen: eerste keer, statusNaBeurten uit de data */
  test("trigger naKaartVanKaart telt vanaf de EERSTE keer dat de kaart is gespeeld", function () {
    var s = nieuw(0); speel(s, "K1"); speel(s, "K1"); speel(s, "M1");   // K1 is kaart 1 en 2
    var r = s.wachtend.filter(function (x) { return x.id === "R"; });
    T.is(r.length, 1); T.is(r[0].naVolg, 2, "R na eerste K1 (kaart 1) + 1 = kaart 2, niet na de tweede K1 (dat zou kaart 3 zijn)");
  });
  test("statusNaBeurten komt uit de data: met 3 is de override pas op dA+3 (niet op dA+2)", function () {
    var c = maakFixture(); c.episodes[0].knoppen.aantalDagen = 8; c.episodes[0].gebeurtenissen[0].zet.statusNaBeurten = 3;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K2"); speel(s, "M2"); g.Engine.volgendeDag(s);          // P op dag 2 = dA
    g.Engine.volgendeDag(s); T.is(s.klachten[3].status, "aan");
    g.Engine.volgendeDag(s); T.is(s.klachten[4].status, "aan", "dA+2: nog geen override bij statusNaBeurten 3");
    g.Engine.volgendeDag(s); T.is(s.klachten[5].status, "geenVerbetering48", "dA+3");
    g.Engine.volgendeDag(s); T.is(s.klachten[6].status, "geenVerbetering48", "blijft");
  });
  test("statusNaBeurten ontbreekt: een gebeurtenis zonder dat veld geeft nooit de 48-uurs override", function () {
    var c = maakFixture(); c.episodes[0].knoppen.aantalDagen = 8; delete c.episodes[0].gebeurtenissen[0].zet.statusNaBeurten;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K2"); speel(s, "M2"); g.Engine.volgendeDag(s); dagen(s, 5);
    for (var d = 2; d <= 7; d++) T.is(s.klachten[d].status, "aan", "dag " + d);
  });
  test("klachtenstatus kijkt naar het EIND van de vorige dag: een middel dat vandaag pas wordt gestart telt nog niet", function () {
    var s = nieuw(); speel(s, "M1"); g.Engine.volgendeDag(s);           // dag 2 begint
    T.is(s.klachten[2].status, "af");
    speel(s, "S", { doel: "M1" }); g.Engine.volgendeDag(s);             // M1 gestopt op dag 2
    T.is(s.klachten[3].status, null, "gestopt op dag 2: aan het eind van dag 2 niet meer actief");
    var t = nieuw(); g.Engine.volgendeDag(t); T.is(t.klachten[2].status, null);
    speel(t, "M1"); T.is(t.klachten[2].status, null, "een kaart van vandaag verandert de status van vandaag niet");
  });

  /* herkansing en rng */
  test("herkansing: neemt opties.rng over, anders de rng van het vorige spel; trekt dus opnieuw volgens die rng", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    T.gelijk(g.Engine.herkansing(s).groepen.PQ, ["P", "Q"], "rng van het vorige spel (0)");
    T.gelijk(g.Engine.herkansing(s, { rng: rngVast(0.99) }).groepen.PQ, ["Q", "P"], "opties.rng wint");
    var s2 = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0.99) });
    T.gelijk(g.Engine.herkansing(s2).groepen.PQ, ["Q", "P"], "rng van het vorige spel (0.99)");
    T.gelijk(g.Engine.herkansing(s2, { rng: rngVast(0) }).groepen.PQ, ["P", "Q"]);
    T.is(g.Engine.herkansing(s2).casusId, "fixtuur"); T.is(g.Engine.herkansing(s2).episodeId, "X1");
  });
  test("herkansing: afrondenPasNaGebeurtenissen uit opties wordt doorgegeven", function () {
    var s = nieuw(); T.is(g.Engine.herkansing(s, { afrondenPasNaGebeurtenissen: true }).afrondenPasNaGebeurtenissen, true);
  });

  /* nieuwSpel: knoppen */
  test("nieuwSpel: ontbrekende of onjuiste knoppen (actiesPerBeurt, aantalDagen) geven een Nederlandse fout", function () {
    function met(wijzig) { var c = maakFixture(); wijzig(c.episodes[0]); return c; }
    [ function (e) { delete e.knoppen; }, function (e) { delete e.knoppen.actiesPerBeurt; }, function (e) { delete e.knoppen.aantalDagen; },
      function (e) { e.knoppen.actiesPerBeurt = "3"; }, function (e) { e.knoppen.aantalDagen = "4"; } ].forEach(function (w, i) {
      try { g.Engine.nieuwSpel(met(w), "X1", {}); T.waar(false, "geen fout bij variant " + i); }
      catch (e) { T.waar(/knoppen/.test(e.message) && /De episode/.test(e.message), "variant " + i + ": " + e.message); }
    });
  });

  /* geen koppeling aan id's: een synthetische casus met dezelfde id's als UWI maar andere inhoud moet de data volgen */
  test("geen id-koppeling: episode 'E2' met 2 acties, gebeurtenis 'C' na kaart 2 en kaart 'V9' volgen alleen de data", function () {
    var c = {
      id: "nep", kaarten: [ { id: "V9", label: "x", categorie: "c", downside: "d" }, { id: "O1", label: "y", categorie: "c", downside: "d" }, { id: "G1", label: "z", categorie: "c", downside: "d" } ],
      raadplegen: { titel: "t", bronnen: [] },
      episodes: [ { id: "E2", knoppen: { actiesPerBeurt: 2, aantalDagen: 3, raadplegenKost: 0 }, startToestanden: ["cystitis"], antibiotica: [],
        patient: { zichtbaar: {}, waar: { eGFR: 10 }, verborgen: [] }, repertoire: ["V9", "O1", "G1"],
        gebeurtenissen: [ { id: "C", trigger: { type: "naKaart", n: 2 }, tekst: "t", toestand: "weefselinvasie" } ], werkzaamheid: {} } ]
    };
    var s = g.Engine.nieuwSpel(c, "E2", {});
    T.is(s.actiesOver, 2); speel(s, "V9"); speel(s, "G1");
    T.is(g.Engine.speelKaart(s, "O1").ok, false, "2 acties, geen vaste 3");
    g.Engine.volgendeDag(s); T.is(s.actiesOver, 2, "budget uit de data (niet 3)");
    T.gelijk(s.gebeurtenissen, [{ id: "C", dag: 2, naVolg: 2 }], "C zonder O1, gewoon na kaart 2");
    T.gelijk(s.toestanden, ["cystitis", "weefselinvasie"]);
    T.is(g.Engine.raadpleeg(s).kost, 0, "raadplegenkost uit de data");
    g.Engine.volgendeDag(s); T.is(s.klachten[3].status, null);
  });

  /* ---------- echte regeltaal + echte UWI-data (geen stubs) ---------- */
  function echt(naam, fn) {
    T.registreer(GROEP, "echt: " + naam, function () {
      // Nooit stil terugkeren: ontbreekt de echte regeltaal of de echte data, dan is deze test ROOD (niet groen zonder bewijs).
      T.waar(!!g.Predicaten && typeof g.Predicaten.evalueer === "function", "echte regeltaal (regels/predicaten.js, window.Predicaten) ontbreekt: deze test bewijst niets en is daarom rood");
      T.waar(!!g.CASUSSEN && !!g.CASUSSEN[0] && Array.isArray(g.CASUSSEN[0].episodes) && g.CASUSSEN[0].episodes.length > 0, "echte casusdata (window.CASUSSEN[0].episodes uit casussen/uwi*.js) ontbreekt: deze test bewijst niets en is daarom rood");
      fn(g.CASUSSEN[0]);
    });
  }
  function ep(c, id) { return c.episodes.filter(function (e) { return e.id === id; })[0]; }
  function spel(c, id, w) { return g.Engine.nieuwSpel(c, id, { rng: rngVast(w == null ? 0 : w) }); }
  function iedereen(s, lijst) { lijst.forEach(function (k) { if (k === "|") g.Engine.volgendeDag(s); else speel(s, k); }); }

  echt("E1 volledig spel: G1, G2, V4 | N1, Ev1 | rest van de dagen; klachtenstatus uit de data; geen onthulling", function (c) {
    var voor = JSON.stringify(c), s = spel(c, "E1");
    T.gelijk(s.toestanden, ep(c, "E1").startToestanden);
    var r = speel(s, "G2"); T.gelijk(r.onthuld, [], "E1 heeft geen verborgen gegevens");
    T.is(s.zichtbaar.labTekst, ep(c, "E1").patient.zichtbaar.labTekst);
    iedereen(s, ["G1", "V4", "|", "N1", "Ev1", "|"]);
    T.is(s.klachten[2].status, "af"); T.is(s.klachten[2].tekst, ep(c, "E1").statusTeksten.af);
    T.gelijk(s.tijdlijn.map(function (x) { return x.volg + x.kaart + "@" + x.dag; }), ["1G2@1", "2G1@1", "3V4@1", "4N1@2", "5Ev1@2"]);
    T.is(g.Engine.speelKaart(s, "V6").ok, false, "V6 zit niet in het repertoire van E1");
    T.is(g.Engine.speelKaart(s, "G3").ok, false, "G3 zit niet in het repertoire van E1");
    g.Engine.volgendeDag(s); g.Engine.volgendeDag(s); T.is(s.dag, 5); T.is(s.klachten[5].status, "af");
    g.Engine.volgendeDag(s); T.is(g.Engine.eindeBereikt(s), true);
    T.is(JSON.stringify(c), voor, "casusdata ongewijzigd");
    T.is(g.Engine.raadpleeg(spel(c, "E1")).ok, true);
  });

  echt("raadpleeg leest casus.raadplegen (casusniveau), kost uit episode.knoppen", function (c) {
    var s = spel(c, "E1"), r = g.Engine.raadpleeg(s);
    T.is(r.ok, true); T.gelijk(r.bronnen, c.raadplegen.bronnen); T.is(r.titel, c.raadplegen.titel); T.is(r.kost, ep(c, "E1").knoppen.raadplegenKost);
  });
  echt("E1: V3 daarna nog V4 (twee antibiotica) en trimethoprim geven werkzame status; zonder antibioticum status null", function (c) {
    var s = spel(c, "E1"); iedereen(s, ["G1", "|"]); T.is(s.klachten[2].status, null);
    var s2 = spel(c, "E1"); iedereen(s2, ["V5", "|"]); T.is(s2.klachten[2].status, "af");
  });

  echt("E2: G2 onthult eGFR 29 (waar blijft 29, zichtbaar was 42), pas na G2", function (c) {
    var e = ep(c, "E2"), s = spel(c, "E2"), zichtVoor = JSON.stringify(s.zichtbaar);
    T.is(e.patient.zichtbaar.lab.eGFR, 42);
    speel(s, "G1"); T.is(JSON.stringify(s.zichtbaar), zichtVoor); T.is(s.onthuld.length, 0);
    var r = speel(s, "G2");
    T.is(r.onthuld.length, 1); T.is(r.onthuld[0].waarde, 29); T.is(r.onthuld[0].sleutel, "eGFR"); T.is(r.onthuld[0].tekst, "eGFR 29 uit de jaarlijkse controle");
    T.is(s.zichtbaar.lab.eGFR, 29); T.is(s.zichtbaar.lab.datum, "uit de jaarlijkse controle"); T.is(s.zichtbaar.labTekst, "eGFR 29 uit de jaarlijkse controle");
    T.is(e.patient.waar.eGFR, 29, "waar ongewijzigd"); T.is(e.patient.zichtbaar.lab.eGFR, 42, "casusdata zichtbaar niet gemuteerd");
    T.is(speel(s, "G2").onthuld.length, 0, "niet dubbel");
    // Predicaat 'waar' rekent met de ware waarde, ook zonder G2
    var s2 = spel(c, "E2"), ctx = g.Predicaten.maakContext(c, e, s2);
    T.is(g.Predicaten.evalueer({ p: "waar", veld: "eGFR", op: "<", waarde: 30 }, ctx), true);
  });

  echt("E2: kweekuitslag C komt na de 4e kaart alleen als O1 gespeeld is; zet resistent/gevoelig uit de data", function (c) {
    var e = ep(c, "E2"), cdef = e.gebeurtenissen.filter(function (x) { return x.id === "C"; })[0];
    var met = spel(c, "E2"); iedereen(met, ["G1", "G2", "O1", "|", "V4", "|"]);
    T.gelijk(met.gebeurtenissen.map(function (x) { return x.id + "@" + x.dag + "/" + x.naVolg; }), ["C@3/4"], "banner pas op de volgende dag (dag 3), na kaart 4");
    T.gelijk(met.sets.resistent, cdef.zet.resistent); T.gelijk(met.sets.gevoelig, cdef.zet.gevoelig);
    var zonder = spel(c, "E2"); iedereen(zonder, ["G1", "G2", "V4", "|", "N1", "|"]);
    T.gelijk(zonder.gebeurtenissen, [], "geen O1: geen kweekuitslag");
    T.gelijk(zonder.sets.resistent, []);
    var laat = spel(c, "E2"); iedereen(laat, ["G1", "G2", "V4", "|", "N1", "O1", "|"]);
    T.gelijk(laat.gebeurtenissen, [], "O1 pas als 5e kaart: C komt niet (meest letterlijke lezing, TODO_BART in data)");
    T.waar(/O1 pas na de 4e kaart/.test(cdef.TODO_BART), "W1 staat als TODO_BART in de data");
  });

  echt("E2: V6 vereist een gestart middel/actieve comedicatie via de echte vereist-predicaten, en een optie", function (c) {
    var s = spel(c, "E2");
    var r = g.Engine.speelKaart(s, "V6", { doel: "V5", optie: "halveren" });
    T.is(r.ok, false); T.waar(/niet beschikbaar/.test(r.fout), r.fout);
    iedereen(s, ["G1", "G2", "V5"]); iedereen(s, ["|"]);
    var r2 = g.Engine.speelKaart(s, "V6", { doel: "V5" }); T.is(r2.ok, false); T.waar(/optie/.test(r2.fout), r2.fout);
    var voor = JSON.stringify(s); T.is(g.Engine.speelKaart(s, "V6", { doel: "V5", optie: "bestaat-niet" }).ok, false); T.is(JSON.stringify(s), voor);
    var ok = speel(s, "V6", { doel: "V5", optie: "halveren" });
    T.gelijk(ok.regel, { volg: 4, kaart: "V6", dag: 2, doel: "V5", optie: "halveren" });
  });

  echt("E3: G3 onthult, A en B in beide volgordes (rng), C = 3 kaarten na O1, klachtenstatus volgens toestand", function (c) {
    var e = ep(c, "E3"), A = e.gebeurtenissen.filter(function (x) { return x.id === "A"; })[0], B = e.gebeurtenissen.filter(function (x) { return x.id === "B"; })[0];
    var s0 = spel(c, "E3", 0), s1 = spel(c, "E3", 0.99);
    T.gelijk(s0.volgordeAB, ["A", "B"]); T.gelijk(s1.volgordeAB, ["B", "A"]);
    var r = speel(s0, "G3"); T.is(r.onthuld.length, 1); T.is(r.onthuld[0].kaart, "G3");
    // Beide volgordes, zelfde zetten: G1, G3, O1 | V4, N1 | N2, Ev1 | ...
    [s0, s1].forEach(function (s, ix) {
      if (ix === 1) speel(s, "G3");
      iedereen(s, ["G1", "O1", "|", "V4", "N1", "|"]);
    });
    // kaarten: G3(1) G1(2) O1(3) V4(4) N1(5): eerste trigger op kaart 4, C op kaart 6
    T.gelijk(s0.gebeurtenissen.map(function (x) { return x.id + "@" + x.dag + "/" + x.naVolg; }), ["A@3/4"]);
    T.gelijk(s1.gebeurtenissen.map(function (x) { return x.id + "@" + x.dag + "/" + x.naVolg; }), ["B@3/4"]);
    T.waar(s0.toestanden.indexOf(A.toestand) >= 0 && s0.toestanden.indexOf(B.toestand) < 0);
    T.waar(s1.toestanden.indexOf(B.toestand) >= 0 && s1.toestanden.indexOf(A.toestand) < 0);
    iedereen(s0, ["Ev1"]); T.gelijk(s0.wachtend.map(function (x) { return x.id; }), ["C"], "C na O1 + 3 kaarten (kaart 6)");
    g.Engine.volgendeDag(s0);
    T.waar(s0.gebeurtenissen.some(function (x) { return x.id === "C" && x.dag === 4 && x.naVolg === 6; }));
    T.waar(s0.sets.resistent.length > 0 && s0.sets.gevoelig.length > 0, "sets uit de data");
    // A: weefselinvasie -> fosfomycine niet werkzaam: aan, daarna 'geen verbetering na 48 uur' op dA+2
    T.is(s0.klachten[3].status, "aan");
    T.is(s0.klachten[3].tekst, e.statusTeksten.aan);
    // dag 3 = dA; dag 5 = dA+2
    g.Engine.volgendeDag(s0); T.is(s0.klachten[5].status, "geenVerbetering48"); T.is(s0.klachten[5].tekst, e.statusTeksten.geenVerbetering48);
    // Zonder statusNaBeurten op B: geen override door B alleen
    T.is(B.zet && B.zet.statusNaBeurten, undefined);
  });

  echt("E3: A/B-volgorde verandert niet welke werkzaamheid geldt (datavolgorde van episode.werkzaamheid)", function (c) {
    var e = ep(c, "E3");
    var sleutels = Object.keys(e.werkzaamheid).filter(function (k) { return k !== "statusTeksten" && k.indexOf("TODO_BART") !== 0; });
    T.waar(sleutels.length >= 2, "twee toestanden met werkzaamheid in E3");
    var s = spel(c, "E3"); iedereen(s, ["V8", "|"]);
    T.is(s.klachten[2].status, "aan", "V8 in cystitis (geen entry) is nog niet werkzaam");
  });

  echt("E3: hele reis speelt door met de echte regeltaal zonder uitzondering (willekeurige zetten, vaste rng)", function (c) {
    var ids = ep(c, "E3").repertoire;
    for (var ronde = 0; ronde < 40; ronde++) {
      var seed = ronde * 7 + 1, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      var s = g.Engine.nieuwSpel(c, "E3", { rng: rnd });
      for (var stap = 0; stap < 60 && !g.Engine.eindeBereikt(s); stap++) {
        var k = ids[Math.floor(rnd() * ids.length)], voor = JSON.stringify(s);
        var kaart = c.kaarten.filter(function (x) { return x.id === k; })[0], opts = {};
        if (kaart.doelen && kaart.doelen.E3) { var d = kaart.doelen.E3[Math.floor(rnd() * kaart.doelen.E3.length)]; opts.doel = d.id; if (kaart.opties) opts.optie = (kaart.opties[d.id] || [{ tekst: "x" }])[0].tekst; }
        var r = g.Engine.speelKaart(s, k, opts);
        if (!r.ok) { T.is(JSON.stringify(s), voor, "state ongewijzigd bij geweigerde zet"); T.waar(typeof r.fout === "string"); }
        if (s.actiesOver === 0 || rnd() < 0.2) g.Engine.volgendeDag(s);
        T.waar(s.actiesOver >= 0);
      }
    }
  });
})(typeof window !== "undefined" ? window : globalThis);

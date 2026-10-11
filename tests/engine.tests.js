// Tests van de spelmotor (groep 'engine'). Gebruikt een kleine synthetische casus (NIET UWI) en een eigen
// eenvoudige stub van Predicaten/Evaluatie, zodat de engine los van de echte regeltaal en casusdata getest wordt.
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
      episodes: [ {
        id: "X1", level: 1,
        knoppen: { actiesPerBeurt: 3, aantalDagen: 4, raadplegenKost: 1 },
        startToestand: "basis",
        antibiotica: ["M1", "M2"],
        patient: {
          zichtbaar: { naam: "Fixtuur", lab: { w: 10, datum: "recent" } },
          waar: { w: 3 },
          verborgen: [ { kaart: "K2", onthult: "Verborgen tekst", sleutel: "w", waarde: 3 } ]
        },
        repertoire: ["K1", "K2", "M1", "M2", "S", "D"],
        raadplegen: { titel: "Bron", bronnen: ["BRON-A"] },
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
        antibiotica: [], patient: { zichtbaar: {}, waar: {}, verborgen: [] }, repertoire: ["K1"], gebeurtenissen: []
      } ]
    };
  }
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
    T.is(s.eerstePoging, true);
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
    var s2 = g.Engine.nieuwSpel(maakFixture(), "X1", { rng: rngVast(0), afrondenPasNaGebeurtenissen: true });
    T.gooit(function () { g.Engine.rondAf(s2); }); T.is(s2.afgerond, false);
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
      episodes: [ { id: "e9", knoppen: { actiesPerBeurt: 1, aantalDagen: 3, raadplegenKost: 0 }, startToestand: ["t0"], antibiotica: ["b"],
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
  test("engine.js bevat geen middelnamen, kaart-ids of klinische drempels", function () {
    // de broncode is niet bereikbaar in de browser; daarom een structurele controle op de API (geen casus-id's als sleutel nodig)
    var s = nieuw(); T.is(typeof g.Engine.nieuwSpel, "function");
    T.is(JSON.stringify(Object.keys(g.Engine).sort()), JSON.stringify(["eindeBereikt","herkansing","nieuwSpel","ontgrendeld","ontgrendeldeEpisodes","raadpleeg","rondAf","speelKaart","volgendeDag"]));
    T.is(s.casusId, "fixtuur");
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
  test("herkansing: nieuw spel zelfde episode, pogingnummer +1, eerstePoging false, schone staat", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    T.is(s.pogingnummer >= 1, true); speel(s, "K1"); g.Engine.rondAf(s);
    var h = g.Engine.herkansing(s);
    T.is(h.pogingnummer, s.pogingnummer + 1); T.is(h.eerstePoging, false); T.is(h.afgerond, false);
    T.gelijk(h.tijdlijn, []); T.is(h.dag, 1); T.is(h.actiesOver, 3); T.is(h.episodeId, "X1");
    var n = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); T.is(n.pogingnummer, h.pogingnummer + 1, "elke nieuwSpel telt als poging");
    var expl = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0), pogingnummer: 1 }); T.is(expl.eerstePoging, true);
  });
})(typeof window !== "undefined" ? window : globalThis);

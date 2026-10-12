/* Tests voor regels/evaluatie.js (stuk S6).
   1. Routes uit tests/routes.js worden via window.Engine gespeeld, in beide A/B-volgordes, en vergeleken met de HANDMATIG uit de casus
      opgeschreven verwachtingen (poort, schendingen, vraag, score, profiel, reflectievraag, extra vragen, zichtbaar-zinnen, downsides).
   2. Dekking: elke invariant (E1: I1 I3 I4; E2: I1 I4-I8; E3: I1 I4-I16) heeft een foutroute die PRECIES die invariant schendt.
   3. Een eigen oracle voor E1 (alle kaartcombinaties, via de Engine) als kruiscontrole naast Evaluatie.beoordeel.
   4. Eigenschappen van Evaluatie met een synthetische casus (geen UWI): geldtIn, ernst-volgorde, vraagVarianten, score, profiel, downsides,
      feedback, fouten in de data worden nooit stil onwaar, geen casuslogica in de code.
   De oracles in tests/data-e1/e2/e3.tests.js zijn niet exporteerbaar (staan in een eigen sluiting); zie het rapport. */
(function (g) {
  var GR = "evaluatie", GRR = "evaluatie-routes", T = Test, E = function () { return g.Evaluatie; };
  function t(naam, fn) { T.registreer(GR, naam, fn); }
  function tr(naam, fn) { T.registreer(GRR, naam, fn); }
  function js(x) { return JSON.stringify(x); }
  function gooitMet(fn, patroon, msg) {
    var ok = false, tekst = "";
    try { fn(); } catch (e) { ok = true; tekst = String((e && e.message) || e); }
    if (!ok) throw new Error((msg || "") + " verwachtte een fout");
    if (patroon && !patroon.test(tekst)) throw new Error((msg || "") + " fout klopt niet: " + tekst);
    return tekst;
  }

  /* ---------- routes.js laden (in Node als het niet in de laadlijst staat) ---------- */
  if (!g.Routes && typeof process !== "undefined" && process.mainModule && typeof process.mainModule.require === "function") {
    try {
      var fs = process.mainModule.require("fs"), pad = process.mainModule.require("path"), vm = process.mainModule.require("vm");
      var bestand = pad.resolve(process.mainModule.filename, "../../../tests/routes.js");
      vm.runInThisContext(fs.readFileSync(bestand, "utf8"), { filename: "tests/routes.js" });
    } catch (e) { /* hieronder volgt een rode test */ }
  }
  var R = g.Routes;
  if (!R) {
    tr("tests/routes.js is geladen", function () {
      throw new Error("tests/routes.js ontbreekt in de laadlijst: zet 'routes.js' vóór 'evaluatie.tests.js' in tests/tests.html en gauntlet/tools/run-node.js.");
    });
  }

  /* ================= 1. ROUTES VIA DE ENGINE ================= */
  function ids(lijst) { return lijst.map(function (x) { return x.id; }); }
  function teksten(lijst, veld) { return lijst.map(function (x) { return x[veld]; }); }
  function afwijkingen(route, volgorde) {
    var res = R.speel(route, volgorde), u = res.uitkomst, st = res.state, v = R.verwachtVoor(route, volgorde), f = [];
    var geldig = route.soort === "geldig";
    function eis(naam, echt, verw) { if (js(echt) !== js(verw)) f.push(naam + ": verwacht " + js(verw) + ", kreeg " + js(echt)); }
    var casus = g.CASUSSEN[0], ep = null;
    casus.episodes.forEach(function (e) { if (e.id === route.ep) ep = e; });
    if (ep.gebeurtenissen.some(function (e) { return e.groep; })) eis("volgordeAB", st.volgordeAB.join(","), volgorde.sleutel);
    eis("Engine bewaart de uitkomst", st.uitkomst === u, true);
    eis("poortGehaald", u.poortGehaald, geldig);
    eis("geschonden", ids(u.geschonden), v.geschonden || []);
    for (var i = 1; i < u.geschonden.length; i++) if (!(u.geschonden[i - 1].ernst <= u.geschonden[i].ernst)) f.push("geschonden niet op ernst gesorteerd: " + js(u.geschonden));
    eis("vraag", u.vraag, geldig ? null : v.vraag);
    if (!geldig) {
      eis("vraag = vraag van de ernstigste", u.vraag, u.geschonden[0].vraag);
      eis("geen score bij schending", u.score, null);
      eis("geen profiel bij schending", u.profiel, null);
    } else {
      if ("profiel" in v) eis("profiel", u.profiel && u.profiel.naam, v.profiel);
      if ("reflectievraag" in v) eis("reflectievraag", u.profiel && u.profiel.reflectievraag, v.reflectievraag);
      if ("score" in v) eis("score", u.score, v.score);
    }
    eis("extraVragen", teksten(u.extraVragen, "vraag"), v.extraVragen || []);
    eis("zichtbaar", teksten(u.zichtbaar, "tekst"), v.zichtbaar || []);
    eis("downsides (kaart, soort, tekst)", u.downsides.map(function (d) { return { kaart: d.kaart, soort: d.soort, tekst: d.tekst }; }), R.verwachteDownsides(route, volgorde));
    u.downsides.forEach(function (d) {
      var kaart = null; casus.kaarten.forEach(function (k) { if (k.id === d.kaart) kaart = k; });
      if (!kaart || kaart.label !== d.label) f.push("label van downside " + d.kaart + " klopt niet: " + d.label);
    });
    // Zuiver: nogmaals beoordelen geeft hetzelfde en verandert de spelstand niet.
    var voor = js(st), nog = g.Evaluatie.beoordeel(casus, route.ep, st);
    eis("beoordeel is zuiver (zelfde uitkomst)", js(nog), js(u));
    eis("beoordeel verandert de spelstand niet", js(st), voor);
    return f;
  }
  if (R) {
    R.lijst.forEach(function (route) {
      tr("[" + route.ep + "] " + route.id + ": " + route.naam, function () {
        var alle = [];
        R.volgordes.forEach(function (volgorde) {
          afwijkingen(route, volgorde).forEach(function (a) { alle.push("(" + volgorde.sleutel + ") " + a); });
        });
        T.waar(alle.length === 0, alle.join(" | "));
      });
    });

    /* ---------- dekking ---------- */
    // Invarianten per episode uit de casus (sectie 4-6, tabel 'Invarianten' en toestandstabel); NIET uit de data afgeleid.
    var VEREIST = {
      E1: ["I1", "I3", "I4"],
      E2: ["I1", "I4", "I5", "I6", "I7", "I8"],
      E3: ["I1", "I4", "I5", "I6", "I7", "I8", "I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"]
    };
    tr("dekking: elke invariant van elke episode heeft een foutroute die precies die invariant schendt", function () {
      var ontbreekt = [];
      Object.keys(VEREIST).forEach(function (ep) {
        VEREIST[ep].forEach(function (id) {
          var gevonden = R.lijst.some(function (r) {
            if (r.ep !== ep || r.soort !== "fout") return false;
            return R.volgordes.every(function (vg) { var v = R.verwachtVoor(r, vg); return v.geschonden.length === 1 && v.geschonden[0] === id; });
          });
          if (!gevonden) ontbreekt.push(ep + "-" + id);
        });
      });
      T.waar(ontbreekt.length === 0, "geen enkelvoudige foutroute voor: " + ontbreekt.join(", "));
    });
    tr("dekking: de invarianten in de data zijn precies die uit de casus (geen extra, geen ontbrekende)", function () {
      var fouten = [];
      g.CASUSSEN[0].episodes.forEach(function (ep) {
        var inData = ep.invarianten.map(function (i) { return i.id; }).sort().join(","), casus = (VEREIST[ep.id] || []).slice().sort().join(",");
        if (inData !== casus) fouten.push(ep.id + ": data " + inData + " casus " + casus);
      });
      T.waar(fouten.length === 0, fouten.join(" | "));
    });
    tr("dekking: alle geldige routes uit de casus zijn aanwezig (E1 x5, E2 x2, E3 start/amox-clav/cipro B4/cipro B3/de-escalatie/sick day/verwijzen)", function () {
      var nodig = [
        "E1-afwachten", "E1-uitgesteld", "E1-nitrofurantoine", "E1-fosfomycine", "E1-trimethoprim",
        "E2-fosfomycine", "E2-trimethoprim-bijgestuurd",
        "E3-fosfomycine-start", "E3-amoxicilline-clavulaanzuur", "E3-ciprofloxacine-B4", "E3-ciprofloxacine-B3-calcium",
        "E3-deescalatie-na-C", "E3-sickday-omgekeerde-volgorde", "E3-verwijzen"
      ];
      var aanwezig = {}; R.lijst.forEach(function (r) { if (r.soort === "geldig") aanwezig[r.id] = true; });
      var mist = nodig.filter(function (id) { return !aanwezig[id]; });
      T.waar(mist.length === 0, "ontbreekt: " + mist.join(", "));
    });
    tr("dekking: E3-routes worden in BEIDE A/B-volgordes gespeeld (elk met een eigen plan)", function () {
      T.gelijk(R.volgordes.map(function (v) { return v.sleutel; }), ["A,B", "B,A"]);
      R.lijst.filter(function (r) { return r.ep === "E3"; }).forEach(function (r) {
        T.waar(R.planVan(r, "A,B") && R.planVan(r, "B,A"), r.id + " mist een plan");
      });
    });
    tr("ernst-volgorde: bij meerdere schendingen alleen de vraag van de laagste ernst-waarde; gelijke ernst: eerste in de data", function () {
      var combos = R.lijst.filter(function (r) { return r.soort === "fout" && r.verwacht.geschonden.length > 1; });
      T.waar(combos.length >= 8, "te weinig combinaties: " + combos.length);
      combos.forEach(function (r) {
        R.volgordes.forEach(function (vg) {
          var v = R.verwachtVoor(r, vg);
          var res = R.speel(r, vg).uitkomst;
          T.is(res.vraag, v.vraag, r.id + " vraag");
          T.is(res.geschonden.length, v.geschonden.length, r.id + " aantal geschonden");
        });
      });
    });
  }

  /* ================= 3. EIGEN ORACLE E1 (kruiscontrole, alle kaartcombinaties via de Engine) ================= */
  // Casus sectie 4 (+ bouwopdracht 6.5), zelf uitgewerkt zonder naar de data te kijken.
  // Overgeslagen: combinaties met N1 maar zonder route-kaart (V1-V5): de casus zegt niets over 'afronden zonder route' (TODO_BART in de data).
  t("kruiscontrole E1: eigen oracle == Evaluatie voor alle 2048 combinaties van 11 kaarten (via de Engine)", function () {
    if (!R) throw new Error("tests/routes.js niet geladen");
    var KAARTEN = ["G1", "G2", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "N1", "Ev1"], afw = [], casus = g.CASUSSEN[0];
    for (var m = 0; m < (1 << KAARTEN.length); m++) {
      var gekozen = KAARTEN.filter(function (k, i) { return m & (1 << i); });
      function h(k) { return gekozen.indexOf(k) >= 0; }
      var nAb = ["V3", "V4", "V5"].filter(h).length, route = h("V1") || h("V2") || nAb > 0;
      if (h("N1") && !route) continue;
      var inv = [];
      if (!h("N1")) inv.push("I1");
      if (h("V1") && !h("Ev1")) inv.push("I3");
      if (nAb > 1) inv.push("I4");
      // Spelen: kaarten in een wisselende volgorde (even/oneven gekozen set omgedraaid), 3 per dag.
      var volgorde = (m % 2) ? gekozen.slice().reverse() : gekozen, state = g.Engine.nieuwSpel(g.Test.zonderLimiet(), "E1", { rng: function () { return 0; } });
      volgorde.forEach(function (k, i) {
        if (i > 0 && i % 3 === 0) g.Engine.volgendeDag(state);
        var r = g.Engine.speelKaart(state, k);
        if (!r.ok) throw new Error("E1 combinatie " + gekozen + ": " + r.fout);
      });
      var u = g.Engine.rondAf(state), naam = "[" + gekozen.join("+") + "] ";
      if (js(ids(u.geschonden)) !== js(inv)) afw.push(naam + "geschonden " + js(ids(u.geschonden)) + " i.p.v. " + js(inv));
      if (u.poortGehaald !== (inv.length === 0)) afw.push(naam + "poort");
      var zicht = []; if (!h("N1")) zicht.push(R.ZICHT.N1); if (h("V1") && !h("Ev1")) zicht.push(R.ZICHT.V1);
      if (js(teksten(u.zichtbaar, "tekst")) !== js(zicht)) afw.push(naam + "zichtbaar " + js(teksten(u.zichtbaar, "tekst")));
      if (inv.length) {
        if (u.score !== null || u.profiel !== null) afw.push(naam + "score/profiel bij schending");
        if (u.vraag !== R.VRAAG[inv[0]]) afw.push(naam + "vraag " + u.vraag);
        continue;
      }
      var dz = h("V2") ? 2 : nAb > 0 ? 1 : 3, dm = Math.max(1, 3 - (h("O1") ? 1 : 0) - (h("O2") ? 1 : 0));
      var profiel = h("V2") ? "Gedeelde regie" : nAb > 0 ? "Direct behandelen" : "Terughoudend";
      var refl = h("V2") ? null : nAb > 0 ? R.REFLECTIE.direct : R.REFLECTIE.terughoudend;
      if (!u.score || u.score.duurzaamheid !== dz || u.score.doelmatigheid !== dm) afw.push(naam + "score " + js(u.score) + " i.p.v. " + dz + "/" + dm);
      if (!u.profiel || u.profiel.naam !== profiel || u.profiel.reflectievraag !== refl) afw.push(naam + "profiel " + js(u.profiel) + " i.p.v. " + profiel);
      if (js(teksten(u.extraVragen, "vraag")) !== js(h("O1") ? [R.EXTRA.O1] : [])) afw.push(naam + "extraVragen " + js(u.extraVragen));
      if (afw.length > 5) break;
    }
    T.waar(afw.length === 0, afw.length + " afwijkingen, bv. " + afw.slice(0, 3).join(" ; "));
  });

  /* ================= 4. EIGENSCHAPPEN MET EEN SYNTHETISCHE CASUS ================= */
  var WAAR = { p: "waarheid", waarde: true }, ONWAAR = { p: "waarheid", waarde: false };
  function gesp(k) { return { p: "gespeeld", kaart: k }; }
  function kaarten() {
    return [
      { id: "K1", label: "Eerste", downside: "downside één" },
      { id: "K2", label: "Tweede", downside: { X1: "alleen in X1", X2: "alleen in X2" } },
      { id: "K3", label: "Derde", downside: { X2: "alleen in X2 (derde)" } },
      { id: "K4", label: "Vierde", downside: "—" },
      { id: "K5", label: "Vijfde" },
      { id: "K6", label: "Zesde", downside: null },
      { id: "K7", label: "Zevende", downside: { alle: "voor elke episode" } }
    ];
  }
  function maakEp(over) {
    var ep = {
      id: "X1", antibiotica: ["Q1", "Q2"], startToestanden: ["t0"],
      patient: { waar: { w: 10, vlag: true }, medicatie: [{ id: "m1", label: "m1" }] },
      gebeurtenissen: [{ id: "Evt", toestand: "t1", trigger: { type: "naKaart", n: 1 } }],
      invarianten: [], score: {}, profielen: [], feedbackExtra: [], zichtbaarAlsOntbreekt: []
    };
    Object.keys(over || {}).forEach(function (k) { ep[k] = over[k]; });
    return ep;
  }
  function maakCasus(ep, kaartLijst) {
    return { id: "fx", rollen: { wissel: "W", stop: "S", pauzeer: "P", hervat: "H" }, kaarten: kaartLijst || kaarten(), episodes: [ep || maakEp()] };
  }
  function inv(id, ernst, pred, extra) {
    var i = { id: id, ernst: ernst, geldtIn: ["*"], predicaat: pred || WAAR, vraag: "vraag " + id, bron: "x" };
    Object.keys(extra || {}).forEach(function (k) { i[k] = extra[k]; });
    return i;
  }
  function staat(o) {
    o = o || {};
    return {
      casusId: "fx", episodeId: o.ep || "X1", dag: o.dag || 1, aantalDagen: 7,
      tijdlijn: (o.kaarten || []).map(function (k, i) {
        return typeof k === "string" ? { volg: i + 1, kaart: k, dag: 1, doel: null, optie: null } : Object.assign({ volg: i + 1, dag: 1, doel: null, optie: null }, k);
      }),
      gebeurtenissen: o.geb || [], toestanden: o.toest || ["t0"], klachten: o.klachten || []
    };
  }
  function beoordeel(ep, st, kaartLijst) { var c = maakCasus(ep, kaartLijst); return E().beoordeel(c, ep.id, st || staat()); }

  t("API: beoordeel en valideerCasus bestaan; uitkomst heeft precies de velden van contract 5 en is JSON-baar", function () {
    T.is(typeof E().beoordeel, "function"); T.is(typeof E().valideerCasus, "function");
    var u = beoordeel(maakEp({ invarianten: [inv("A", 2)] }));
    T.gelijk(Object.keys(u).sort(), ["downsides", "extraVragen", "geschonden", "poortGehaald", "profiel", "score", "vraag", "zichtbaar"]);
    T.gelijk(JSON.parse(js(u)), JSON.parse(js(u)));
    T.is(u.poortGehaald, false); T.is(u.vraag, "vraag A"); T.gelijk(u.geschonden, [{ id: "A", ernst: 2, vraag: "vraag A" }]);
    var gehaald = beoordeel(maakEp({ invarianten: [inv("A", 2, ONWAAR)] }));
    T.is(gehaald.poortGehaald, true); T.is(gehaald.vraag, null); T.gelijk(gehaald.geschonden, []);
    T.waar(gehaald.score !== null && typeof gehaald.score === "object", "score is een object bij gehaalde poort");
  });
  t("geldtIn: '*', toestandsnaam en { gebeurtenis } gelden alleen waar ze actief zijn", function () {
    var invs = [
      inv("alles", 5, WAAR, { geldtIn: ["*"] }),
      inv("toestand", 5, WAAR, { geldtIn: ["t1"] }),
      inv("gebeurtenis", 5, WAAR, { geldtIn: [{ gebeurtenis: "Evt" }] }),
      inv("een-van-twee", 5, WAAR, { geldtIn: ["t0", "t1"] }),
      inv("geen-van-beide", 5, WAAR, { geldtIn: ["t1", { gebeurtenis: "Evt" }] })
    ];
    var ep = maakEp({ invarianten: invs });
    T.gelijk(ids(beoordeel(ep, staat({ toest: ["t0"] })).geschonden), ["alles", "een-van-twee"]);
    T.gelijk(ids(beoordeel(ep, staat({ toest: ["t0", "t1"] })).geschonden), ["alles", "toestand", "een-van-twee", "geen-van-beide"]);
    T.gelijk(ids(beoordeel(ep, staat({ toest: ["t0"], geb: [{ id: "Evt", dag: 2, naVolg: 1 }] })).geschonden), ["alles", "gebeurtenis", "een-van-twee", "geen-van-beide"]);
    T.gelijk(ids(beoordeel(ep, staat({ toest: ["t0", "t1"], geb: [{ id: "Evt", dag: 2, naVolg: 1 }] })).geschonden), ["alles", "toestand", "gebeurtenis", "een-van-twee", "geen-van-beide"]);
  });
  t("geldtIn: ongeldige vorm of onbekende toestand/gebeurtenis geeft een Nederlandse fout (nooit stil)", function () {
    [["geldtIn", []], ["geldtIn", "*"], ["geldtIn", ["onbekendeToestand"]], ["geldtIn", [{ gebeurtenis: "Onbekend" }]], ["geldtIn", [5]], ["geldtIn", [{ toestand: "t0" }]]].forEach(function (c) {
      var i = inv("A", 1); i[c[0]] = c[1];
      gooitMet(function () { beoordeel(maakEp({ invarianten: [i] })); }, /geldtIn/, js(c[1]));
    });
    var zonder = inv("A", 1); delete zonder.geldtIn;
    gooitMet(function () { beoordeel(maakEp({ invarianten: [zonder] })); }, /geldtIn/, "geldtIn ontbreekt");
  });
  t("ernst: oplopend gesorteerd (1 = ernstigst, numeriek), gelijke ernst in datavolgorde; vraag = die van de eerste", function () {
    var ep = maakEp({ invarianten: [inv("A", 3), inv("B", 1), inv("C", 3), inv("D", 1), inv("E", 2), inv("F", 10), inv("G", 2, ONWAAR)] });
    var u = beoordeel(ep);
    T.gelijk(ids(u.geschonden), ["B", "D", "E", "A", "C", "F"]);
    T.gelijk(u.geschonden.map(function (x) { return x.ernst; }), [1, 1, 2, 3, 3, 10]);
    T.is(u.vraag, "vraag B");
    var ep2 = maakEp({ invarianten: [inv("I9", 3), inv("I13", 3), inv("I2", 3)] });
    T.gelijk(ids(beoordeel(ep2).geschonden), ["I9", "I13", "I2"], "geen sortering op id-tekst");
  });
  t("vraagVarianten: de eerste variant met waar 'als' wint, anders de vraag van de invariant; elke geschonden-regel heeft de gekozen vraag", function () {
    var i = inv("A", 1, WAAR, { vraagVarianten: [{ als: gesp("K1"), vraag: "variant één" }, { als: gesp("K2"), vraag: "variant twee" }] });
    var ep = maakEp({ invarianten: [i] });
    T.is(beoordeel(ep, staat({ kaarten: ["K2"] })).vraag, "variant twee");
    T.is(beoordeel(ep, staat({ kaarten: ["K1", "K2"] })).vraag, "variant één");
    var u = beoordeel(ep, staat({ kaarten: ["K3"] }));
    T.is(u.vraag, "vraag A"); T.is(u.geschonden[0].vraag, "vraag A");
    T.is(beoordeel(ep, staat({ kaarten: ["K2"] })).geschonden[0].vraag, "variant twee");
    gooitMet(function () { beoordeel(maakEp({ invarianten: [inv("A", 1, WAAR, { vraagVarianten: [{ als: WAAR }] })] })); }, /vraagVarianten/, "variant zonder vraag");
  });
  t("beide predicaatvormen (plat en genest) geven hetzelfde", function () {
    var plat = maakEp({ invarianten: [inv("A", 1, { p: "gespeeld", kaart: "K1" })] });
    var genest = maakEp({ invarianten: [inv("A", 1, { p: "gespeeld", K: { kaart: "K1" } })] });
    [[], ["K1"], ["K2", "K1"]].forEach(function (k) {
      T.gelijk(ids(beoordeel(plat, staat({ kaarten: k })).geschonden), ids(beoordeel(genest, staat({ kaarten: k })).geschonden));
    });
  });
  t("bij schending: geen score, geen profiel; extra vragen 'alleenBijGehaaldePoort' verdwijnen, 'altijd' en zichtbaar blijven", function () {
    var ep = maakEp({
      invarianten: [inv("A", 1, gesp("K1"))],
      score: { duurzaamheid: { start: 3, regels: [] } },
      profielen: [{ naam: "P", als: WAAR, reflectievraag: "r" }],
      feedbackExtra: [{ trigger: WAAR, vraag: "alleen bij gehaald", wanneer: "alleenBijGehaaldePoort" }, { trigger: WAAR, vraag: "altijd", wanneer: "altijd" }, { trigger: ONWAAR, vraag: "nooit", wanneer: "altijd" }],
      zichtbaarAlsOntbreekt: [{ trigger: WAAR, tekst: "zin één" }, { trigger: ONWAAR, tekst: "zin twee" }]
    });
    var s = beoordeel(ep, staat({ kaarten: ["K1"] }));
    T.is(s.score, null); T.is(s.profiel, null);
    T.gelijk(teksten(s.extraVragen, "vraag"), ["altijd"]); T.gelijk(teksten(s.zichtbaar, "tekst"), ["zin één"]);
    var h = beoordeel(ep, staat({ kaarten: [] }));
    T.waar(h.score !== null && h.profiel !== null, "bij gehaalde poort wel score en profiel");
    T.gelijk(teksten(h.extraVragen, "vraag"), ["alleen bij gehaald", "altijd"]);
    T.gelijk(teksten(h.zichtbaar, "tekst"), ["zin één"]);
  });
  t("feedbackExtra: 'wanneer' ontbreekt of is onbekend = fout; zichtbaarAlsOntbreekt zonder tekst = fout", function () {
    gooitMet(function () { beoordeel(maakEp({ feedbackExtra: [{ trigger: WAAR, vraag: "v" }] })); }, /wanneer/, "wanneer ontbreekt");
    gooitMet(function () { beoordeel(maakEp({ feedbackExtra: [{ trigger: WAAR, vraag: "v", wanneer: "soms" }] })); }, /wanneer/, "wanneer onbekend");
    gooitMet(function () { beoordeel(maakEp({ zichtbaarAlsOntbreekt: [{ trigger: WAAR }] })); }, /tekst/, "zonder tekst");
  });

  /* ---------- score ---------- */
  function scoreVan(as, st, naam) {
    var sc = {}; sc[naam || "duurzaamheid"] = as;
    return beoordeel(maakEp({ score: sc }), st || staat()).score;
  }
  t("score: eerste matchende punten-regel wint; start wordt vervangen", function () {
    var as = { start: 2, regels: [{ als: gesp("K1"), punten: 3 }, { als: gesp("K2"), punten: 1 }, { als: WAAR, punten: 2 }] };
    T.is(scoreVan(as, staat({ kaarten: ["K1", "K2"] })).duurzaamheid, 3);
    T.is(scoreVan(as, staat({ kaarten: ["K2"] })).duurzaamheid, 1);
    T.is(scoreVan(as, staat({ kaarten: [] })).duurzaamheid, 2);
    T.is(scoreVan({ start: 3, regels: [{ als: gesp("K1"), punten: 1 }] }, staat({ kaarten: [] })).duurzaamheid, 3, "geen match: start");
  });
  t("score: delta-regels vanaf start; perKeer telt het aantal; klemmen op 1-3", function () {
    var as = { start: 3, regels: [{ als: gesp("K1"), delta: -1 }, { als: gesp("K2"), delta: -1 }, { perKeer: { t: "gespeeld", kaart: "K3" }, delta: -1 }] };
    T.is(scoreVan(as, staat({ kaarten: [] })).duurzaamheid, 3);
    T.is(scoreVan(as, staat({ kaarten: ["K1"] })).duurzaamheid, 2);
    T.is(scoreVan(as, staat({ kaarten: ["K1", "K2"] })).duurzaamheid, 1);
    T.is(scoreVan(as, staat({ kaarten: ["K3", "K3"] })).duurzaamheid, 1, "perKeer: twee keer");
    T.is(scoreVan(as, staat({ kaarten: ["K1", "K2", "K3", "K3", "K3"] })).duurzaamheid, 1, "geklemd op 1, nooit lager");
    T.is(scoreVan({ start: 2, regels: [{ als: WAAR, delta: 5 }] }).duurzaamheid, 3, "geklemd op 3, nooit hoger");
    T.is(scoreVan({ start: 3, regels: [{ als: WAAR, delta: -100 }] }).duurzaamheid, 1);
    T.is(scoreVan({ regels: [{ als: WAAR, punten: 7 }] }).duurzaamheid, 3, "punten buiten de schaal worden geklemd");
    T.is(scoreVan({ regels: [{ als: WAAR, punten: -4 }] }).duurzaamheid, 1);
    T.is(scoreVan({ start: 3, min: 0, max: 5, regels: [{ als: WAAR, delta: 4 }] }).duurzaamheid, 5, "as.max uit de data");
    T.is(scoreVan({ start: 3, min: 0, max: 5, regels: [{ als: WAAR, delta: -9 }] }).duurzaamheid, 0, "as.min uit de data");
  });
  t("score: punten en delta samen (delta komt erbovenop); beide assen onafhankelijk", function () {
    var u = beoordeel(maakEp({ score: {
      duurzaamheid: { regels: [{ als: gesp("K1"), punten: 3 }, { als: gesp("K2"), delta: -1 }] },
      doelmatigheid: { start: 3, regels: [{ als: gesp("K2"), delta: -1 }] }
    } }), staat({ kaarten: ["K1", "K2"] }));
    T.gelijk(u.score, { duurzaamheid: 2, doelmatigheid: 2 });
  });
  t("score: ontbrekende regel/as/start geeft null voor die as en crasht niet", function () {
    T.gelijk(scoreVan({ regels: [{ als: gesp("K1"), punten: 3 }] }, staat({ kaarten: [] })), { duurzaamheid: null, doelmatigheid: null });
    T.gelijk(scoreVan({ regels: [{ als: gesp("K1"), delta: -1 }] }, staat({ kaarten: ["K1"] })), { duurzaamheid: null, doelmatigheid: null }, "delta zonder start");
    T.gelijk(scoreVan({ start: 3 }, staat()), { duurzaamheid: 3, doelmatigheid: null });
    T.gelijk(beoordeel(maakEp({ score: undefined })).score, { duurzaamheid: null, doelmatigheid: null });
    T.gelijk(beoordeel(maakEp({ score: { doelmatigheid: { start: 2, regels: [] } } })).score, { duurzaamheid: null, doelmatigheid: 2 });
  });
  t("score: ongeldige regelvorm geeft een fout", function () {
    [
      { regels: [{ als: WAAR }] },
      { regels: [{ als: WAAR, punten: 1, delta: 1 }] },
      { regels: [{ punten: 1 }] },
      { regels: [{ als: WAAR, punten: "3" }] },
      { regels: [{ perKeer: { t: "gespeeld", kaart: "K1" } }] },
      { regels: [{ perKeer: { t: "gespeeld", kaart: "K1" }, als: WAAR, delta: 1 }] },
      { regels: "nee" }, { start: "3", regels: [] }
    ].forEach(function (as) { gooitMet(function () { scoreVan(as); }, /score/, js(as)); });
  });

  /* ---------- profiel ---------- */
  t("profiel: eerste match op volgorde; geen match = null; reflectievraag null of ontbrekend = null", function () {
    var ep = maakEp({ profielen: [
      { naam: "Eerste", als: gesp("K1"), reflectievraag: "vraag één" },
      { naam: "Tweede", als: gesp("K2"), reflectievraag: null },
      { naam: "Derde", als: gesp("K3") },
      { naam: "Alles", als: WAAR, reflectievraag: "rest" }
    ] });
    T.gelijk(beoordeel(ep, staat({ kaarten: ["K2", "K1"] })).profiel, { naam: "Eerste", reflectievraag: "vraag één" });
    T.gelijk(beoordeel(ep, staat({ kaarten: ["K2"] })).profiel, { naam: "Tweede", reflectievraag: null });
    T.gelijk(beoordeel(ep, staat({ kaarten: ["K3"] })).profiel, { naam: "Derde", reflectievraag: null });
    T.gelijk(beoordeel(ep, staat({ kaarten: ["K4"] })).profiel, { naam: "Alles", reflectievraag: "rest" });
    T.is(beoordeel(maakEp({ profielen: [{ naam: "Nee", als: gesp("K1") }] }), staat({ kaarten: [] })).profiel, null);
    T.is(beoordeel(maakEp({ profielen: [] })).profiel, null);
    T.is(beoordeel(maakEp({ profielen: undefined })).profiel, null);
  });

  /* ---------- downsides ---------- */
  function ds(ep, kaartenGespeeld, kaartLijst) {
    return beoordeel(ep, staat({ kaarten: kaartenGespeeld }), kaartLijst).downsides;
  }
  t("downsides: tekst, per-episode-object (aanwezig/afwezig/alle), '—' blijft, ontbrekend of null weggelaten; elke kaart eenmaal, in speelvolgorde", function () {
    var ep = maakEp();
    T.gelijk(ds(ep, ["K1", "K2", "K3", "K4", "K5", "K6", "K7", "K1", "K2"]), [
      { kaart: "K1", label: "Eerste", tekst: "downside één", soort: "gespeeld" },
      { kaart: "K2", label: "Tweede", tekst: "alleen in X1", soort: "gespeeld" },
      { kaart: "K4", label: "Vierde", tekst: "—", soort: "gespeeld" },
      { kaart: "K7", label: "Zevende", tekst: "voor elke episode", soort: "gespeeld" }
    ]);
    var ep2 = maakEp({ id: "X2" });
    var u2 = E().beoordeel(maakCasus(ep2), "X2", staat({ ep: "X2", kaarten: ["K3", "K2", "K1"] }));
    T.gelijk(u2.downsides.map(function (d) { return d.kaart + ":" + d.tekst; }), ["K3:alleen in X2 (derde)", "K2:alleen in X2", "K1:downside één"]);
    T.gelijk(ds(ep, []), []);
    T.gelijk(ds(ep, ["K3"]), [], "object zonder sleutel voor deze episode = geen downside");
  });
  t("downsides: tijdlijn volgt volg, niet de arrayvolgorde", function () {
    var st = staat({ kaarten: [{ volg: 2, kaart: "K1" }, { volg: 1, kaart: "K4" }] });
    T.gelijk(beoordeel(maakEp(), st).downsides.map(function (d) { return d.kaart; }), ["K4", "K1"]);
  });
  t("downsides: weglaatDownside toont de downside van een niet gespeelde kaart alleen bij een geschonden invariant (en nooit dubbel)", function () {
    var ep = maakEp({ invarianten: [
      inv("A", 1, gesp("K1"), { weglaatDownside: "K7" }),
      inv("B", 2, gesp("K1"), { weglaatDownside: ["K4", "K1", "K5"] }),
      inv("C", 3, ONWAAR, { weglaatDownside: "K2" })
    ] });
    var u = beoordeel(ep, staat({ kaarten: ["K1"] }));
    T.gelijk(u.downsides.map(function (d) { return d.kaart + ":" + d.soort; }), ["K1:gespeeld", "K7:weggelaten", "K4:weggelaten"]);
    var geen = beoordeel(ep, staat({ kaarten: [] }));
    T.gelijk(geen.downsides, [], "niet geschonden: niets weggelaten tonen");
    var gespeeld = beoordeel(maakEp({ invarianten: [inv("A", 1, WAAR, { weglaatDownside: "K1" })] }), staat({ kaarten: ["K1"] }));
    T.gelijk(gespeeld.downsides.map(function (d) { return d.kaart + ":" + d.soort; }), ["K1:gespeeld"]);
    gooitMet(function () { beoordeel(maakEp({ invarianten: [inv("A", 1, WAAR, { weglaatDownside: "K99" })] })); }, /weglaatDownside/, "onbekende kaart");
  });
  t("downsides: onbekende kaart op de tijdlijn of kapotte downside geeft een fout", function () {
    gooitMet(function () { beoordeel(maakEp(), staat({ kaarten: ["K99"] })); }, /K99/, "onbekende kaart");
    var k = kaarten(); k[0].downside = 5;
    gooitMet(function () { beoordeel(maakEp(), staat({ kaarten: ["K1"] }), k); }, /downside/, "downside is een getal");
  });

  /* ---------- fouten in de data worden nooit stil onwaar ---------- */
  var KAPOT = { p: "bestaatNiet" };
  t("predicaatfout: elke plek waar een predicaat staat geeft een Nederlandse fout met die plek, ook als het predicaat 'niet aan de beurt' is", function () {
    var gevallen = [
      ["invariant die geldt", { invarianten: [inv("A", 1, KAPOT)] }, /invariant A/],
      ["invariant die niet geldt (geldtIn)", { invarianten: [inv("A", 1, KAPOT, { geldtIn: ["t1"] })] }, /invariant A/],
      ["vraagVariant niet gekozen", { invarianten: [inv("A", 1, WAAR, { vraagVarianten: [{ als: WAAR, vraag: "eerste" }, { als: KAPOT, vraag: "tweede" }] })] }, /vraagVarianten\[1\]/],
      ["scoreregel na de eerste match", { score: { duurzaamheid: { regels: [{ als: WAAR, punten: 3 }, { als: KAPOT, punten: 1 }] } } }, /score duurzaamheid/],
      ["scoreregel perKeer", { score: { doelmatigheid: { start: 3, regels: [{ perKeer: { t: "bestaatNiet" }, delta: -1 }] } } }, /perKeer/, /Onbekende teller/],
      ["profiel na de eerste match", { profielen: [{ naam: "P1", als: WAAR }, { naam: "P2", als: KAPOT }] }, /profiel P2/],
      ["feedbackExtra (alleen bij gehaalde poort, poort geschonden)", { invarianten: [inv("A", 1)], feedbackExtra: [{ trigger: KAPOT, vraag: "v", wanneer: "alleenBijGehaaldePoort" }] }, /feedbackExtra\[0\]/],
      ["zichtbaarAlsOntbreekt", { zichtbaarAlsOntbreekt: [{ trigger: KAPOT, tekst: "zin" }] }, /zichtbaarAlsOntbreekt\[0\]/],
      ["werkzaamheid.als", { werkzaamheid: { t0: { werkzaam: [{ kaart: "Q1", als: KAPOT }], nietWerkzaam: [] } } }, /werkzaamheid t0/]
    ];
    gevallen.forEach(function (c) {
      var tekst = gooitMet(function () { beoordeel(maakEp(c[1])); }, c[3] || /Onbekend predicaat/, c[0]);
      if (!c[2].test(tekst)) throw new Error(c[0] + ": de plek ontbreekt in de foutmelding: " + tekst);
      if (!/^Episode X1/.test(tekst)) throw new Error(c[0] + ": foutmelding begint niet met de episode: " + tekst);
    });
  });
  t("predicaatfout: een onbekende teller, een onbekend veld of een ontbrekende kaartverwijzing is een fout (geen stil nul/onwaar)", function () {
    gooitMet(function () { beoordeel(maakEp({ invarianten: [inv("A", 1, { p: "gespeeld" })] })); }, /kaartverwijzing|mist/, "gespeeld zonder kaart");
    gooitMet(function () { beoordeel(maakEp({ invarianten: [inv("A", 1, { p: "gespeeld", kaart: "K1", tiepfout: 1 })] })); }, /Onbekend veld/, "typfout");
    gooitMet(function () { beoordeel(maakEp({ score: { duurzaamheid: { start: 3, regels: [{ perKeer: { t: "geenTeller", kaart: "K1" }, delta: -1 }] } } })); }, /teller/i, "onbekende teller");
    gooitMet(function () { beoordeel(maakEp({ invarianten: [inv("A", 1, undefined)].map(function (i) { delete i.predicaat; return i; }) })); }, /predicaat/i, "predicaat ontbreekt");
  });
  t("predicaatfout: onbekende gebeurtenis in een predicaat, ontbrekende rollen of ontbrekend episodeveld geven een fout", function () {
    gooitMet(function () { beoordeel(maakEp({ invarianten: [inv("A", 1, { p: "gebeurtenisGeweest", id: "Nee" })] })); }, /gebeurtenis/i, "gebeurtenis");
    var c = maakCasus(maakEp({ invarianten: [inv("A", 1, { p: "actief" })] })); delete c.rollen;
    gooitMet(function () { E().beoordeel(c, "X1", staat()); }, /rollen/, "zonder rollen");
    gooitMet(function () { beoordeel(maakEp({ invarianten: [inv("A", 1, { p: "waar", veld: "bestaatNiet", op: "<", waarde: 1 })] })); }, /bestaatNiet|ware/, "waar-veld");
  });
  t("valideerCasus: geeft het aantal predicaten terug bij een goede casus en meldt ALLE fouten tegelijk bij een slechte", function () {
    var goed = maakCasus(maakEp({ invarianten: [inv("A", 1)], profielen: [{ naam: "P", als: WAAR }] }));
    var r = E().valideerCasus(goed);
    T.is(r.episodes, 1); T.is(r.predicaten, 2);
    var slecht = maakCasus(maakEp({
      invarianten: [inv("A", 1, KAPOT), inv("B", 2, { p: "gespeeld", kaart: "K1", fout: 1 })],
      profielen: [{ naam: "P", als: { p: "niet" } }],
      score: { duurzaamheid: { start: 3, regels: [{ als: KAPOT, delta: -1 }] } }
    }));
    var tekst = gooitMet(function () { E().valideerCasus(slecht); }, /fout\(en\)/, "slechte casus");
    T.waar(/invariant A/.test(tekst) && /invariant B/.test(tekst) && /profiel P/.test(tekst) && /score duurzaamheid/.test(tekst), "niet alle plekken genoemd: " + tekst);
    gooitMet(function () { E().valideerCasus({}); }, /episodes/, "casus zonder episodes");
    gooitMet(function () { E().valideerCasus(null); }, /casus/, "geen casus");
  });
  t("beoordeel: onbekende episode, ontbrekende casus of spelstand geven een Nederlandse fout", function () {
    gooitMet(function () { E().beoordeel(maakCasus(), "Z9", staat()); }, /Onbekende episode 'Z9'/, "onbekende episode");
    gooitMet(function () { E().beoordeel(null, "X1", staat()); }, /casus/, "geen casus");
    gooitMet(function () { E().beoordeel(maakCasus(), "X1"); }, /spelstand/, "geen state");
    gooitMet(function () { E().beoordeel(maakCasus(), "X1", "nee"); }, /spelstand/, "state is tekst");
  });
  t("beoordeel: verandert de spelstand en de casus niet; TODO_BART-sleutels in de data worden genegeerd", function () {
    var ep = maakEp({
      invarianten: [inv("A", 1, gesp("K1"), { TODO_BART: "x", weglaatDownside: "K7" })], TODO_BART: "y",
      score: { TODO_BART: "z", duurzaamheid: { TODO_BART: "z", start: 3, regels: [{ als: WAAR, delta: -1, TODO_BART: "q" }] } },
      werkzaamheid: { TODO_BART: "tekst", t0: { werkzaam: [{ kaart: "Q1" }], nietWerkzaam: [] } },
      profielen: [{ naam: "P", als: WAAR, reflectievraag: null, TODO_BART: "w" }]
    });
    var c = maakCasus(ep), st = staat({ kaarten: ["K1"] }), c0 = js(c), s0 = js(st);
    var u = E().beoordeel(c, "X1", st);
    T.is(js(c), c0); T.is(js(st), s0); T.is(u.poortGehaald, false);
    var u2 = E().beoordeel(c, "X1", staat());
    T.is(u2.poortGehaald, true); T.gelijk(u2.score, { duurzaamheid: 2, doelmatigheid: null });
    T.gelijk(u2.profiel, { naam: "P", reflectievraag: null });
  });
  t("beoordeel met een lege tijdlijn en lege episode crasht niet", function () {
    var u = E().beoordeel({ id: "leeg", rollen: { wissel: "W", stop: "S", pauzeer: "P", hervat: "H" }, episodes: [{ id: "Z", antibiotica: [], patient: { waar: {} } }] }, "Z", { tijdlijn: [] });
    T.is(u.poortGehaald, true); T.is(u.profiel, null); T.gelijk(u.score, { duurzaamheid: null, doelmatigheid: null });
    T.gelijk([u.downsides, u.extraVragen, u.zichtbaar, u.geschonden], [[], [], [], []]);
  });

  /* ---------- echte data ---------- */
  t("valideerCasus op de echte casus: alle predicaten van alle episodes zijn geldig", function () {
    var r = E().valideerCasus(g.CASUSSEN[0]);
    T.is(r.episodes, g.CASUSSEN[0].episodes.length);
    T.waar(r.predicaten > 50, "verdacht weinig predicaten: " + r.predicaten);
  });
  t("echte casus: een kapot predicaat op een plek die in deze route niet bereikt wordt, breekt toch de beoordeling en valideerCasus", function () {
    if (!R) throw new Error("tests/routes.js niet geladen");
    var kopie = JSON.parse(js(g.CASUSSEN[0])), e3 = kopie.episodes.filter(function (e) { return e.id === "E3"; })[0];
    // laatste scoreregel (wordt bij een route met 'punten' 3 nooit bereikt) en een profiel dat niet aan de beurt is
    e3.profielen[e3.profielen.length - 1].als = { p: "gespeeld", kaart: "V7", extra: true };
    gooitMet(function () { E().valideerCasus(kopie); }, /profiel Richtlijn eerste keus/, "valideerCasus");
    var route = R.lijst.filter(function (r) { return r.id === "E3-amoxicilline-clavulaanzuur"; })[0];
    var state = R.speel(route, R.volgordes[0]).state;
    gooitMet(function () { E().beoordeel(kopie, "E3", state); }, /Onbekend veld 'extra'/, "beoordeel");
    var kopie2 = JSON.parse(js(g.CASUSSEN[0]));
    kopie2.episodes[2].invarianten[7].predicaat = { p: "iets" };    // een invariant die in deze route niet geldt (geldtIn)
    gooitMet(function () { E().beoordeel(kopie2, "E3", state); }, /Onbekend predicaat/, "beoordeel kapotte invariant");
  });
  t("echte casus: ontbrekende score-/profielregel (fosfomycine-start E3, verwijzen) geeft null en crasht niet", function () {
    if (!R) throw new Error("tests/routes.js niet geladen");
    ["E3-fosfomycine-start", "E3-verwijzen"].forEach(function (id) {
      var route = R.lijst.filter(function (r) { return r.id === id; })[0];
      R.volgordes.forEach(function (vg) {
        var u = R.speel(route, vg).uitkomst;
        T.is(u.poortGehaald, true, id); T.is(u.profiel, null, id + " profiel"); T.is(u.score.duurzaamheid, null, id + " duurzaamheid");
        T.is(u.score.doelmatigheid, 3, id + " doelmatigheid");
      });
    });
  });

  /* ---------- geen casuslogica in de code ---------- */
  t("evaluatie.js bevat geen kaart-id's, middelnamen, toestandsnamen, invariant-id's of klinische drempels", function () {
    var bron = E()._bron;
    T.waar(typeof bron === "string" && bron.length > 1000, "broncode niet beschikbaar");
    var code = bron.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    var patronen = [
      [/\b(?:G[1-3]|O[1-2]|V(?:10|[1-9])|B[1-5]|N[1-3]|Ev[1-3])\b/, "kaart-id"],
      [/\bI(?:1[0-6]|[1-9])\b/, "invariant-id"],
      [/\bE[1-3]\b/, "episode-id"],
      [/nitrofurantoïne|fosfomycine|trimethoprim|ciprofloxacine|amoxicilline|clavulaan|cotrimoxazol|lisinopril|spironolacton|calcium|colecalciferol|kalium|egfr|weefselinvasie|uitdroging|cystitis|kweek|antibioticum|nier/i, "middel-/klinische naam"],
      [/\b(?:[4-9]|\d{2,})\b/, "getal groter dan 3 (drempel?)"]
    ];
    var gevonden = [];
    patronen.forEach(function (p) { var m = code.match(p[0]); if (m) gevonden.push(p[1] + ": '" + m[0] + "'"); });
    T.waar(gevonden.length === 0, "casuslogica in evaluatie.js: " + gevonden.join(" | "));
  });
  t("evaluatie.js: werkt ook met een tweede, heel andere synthetische casus (nieuwe casus = alleen data)", function () {
    var ep = {
      id: "Y7", antibiotica: ["Z1"], startToestanden: ["basis"],
      patient: { waar: { waarde: 5 }, medicatie: [] },
      gebeurtenissen: [{ id: "Gx", toestand: "erger", trigger: { type: "naKaart", n: 1 } }],
      invarianten: [{ id: "J1", ernst: 2, geldtIn: ["erger"], predicaat: { p: "nietGespeeld", kaart: "Z9" }, vraag: "waarom geen Z9?", bron: "x" }],
      score: { duurzaamheid: { start: 2, regels: [{ als: { p: "gespeeld", kaart: "Z9" }, delta: 1 }] } },
      profielen: [{ naam: "Zorgvuldig", als: { p: "gespeeld", kaart: "Z9" }, reflectievraag: "en nu?" }],
      feedbackExtra: [], zichtbaarAlsOntbreekt: []
    };
    var casus = { id: "andere", rollen: { wissel: "W", stop: "S", pauzeer: "P", hervat: "H" }, kaarten: [{ id: "Z9", label: "Negen", downside: "duur" }], episodes: [ep] };
    var state = { tijdlijn: [], gebeurtenissen: [{ id: "Gx", dag: 2 }], toestanden: ["basis", "erger"], klachten: [] };
    var u = E().beoordeel(casus, "Y7", state);
    T.gelijk(ids(u.geschonden), ["J1"]); T.is(u.vraag, "waarom geen Z9?");
    state.tijdlijn = [{ volg: 1, kaart: "Z9", dag: 1, doel: null, optie: null }];
    var v = E().beoordeel(casus, "Y7", state);
    T.is(v.poortGehaald, true); T.gelijk(v.score, { duurzaamheid: 3, doelmatigheid: null }); T.gelijk(v.profiel, { naam: "Zorgvuldig", reflectievraag: "en nu?" });
    T.gelijk(v.downsides, [{ kaart: "Z9", label: "Negen", tekst: "duur", soort: "gespeeld" }]);
  });
})(typeof window !== "undefined" ? window : globalThis);

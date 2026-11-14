/* Tests voor regels/predicaten.js. Uitsluitend synthetische tijdlijnen met willekeurige ids (P2):
   geen casusdata nodig. De rolkaarten komen uit een synthetische casus.rollen (hier B1/B2/B3/B5); zonder rollen volgt een fout. */
(function () {
  var G = "predicaten", T = Test, P = window.Predicaten;
  function t(naam, fn) { T.registreer(G, naam, fn); }

  // regel: [volg, kaart, dag, doel, optie]
  function R(volg, kaart, dag, doel, optie) { return { volg: volg, kaart: kaart, dag: dag, doel: doel || null, optie: optie || null }; }
  // ctx bouwen via maakContext met een synthetische casus/episode/state
  var ROLLEN = { wissel: "B1", stop: "B2", pauzeer: "B3", hervat: "B5" };
  var MEDICATIE = ["m", "m1", "m2", "m3"].map(function (id) { return { id: id, label: id }; });
  function mk(tijdlijn, o) {
    o = o || {};
    var ep = {
      id: "EX", antibiotica: o.ab || ["Q1", "Q2", "Q3"], patient: { waar: o.waar || {}, medicatie: o.medicatie || MEDICATIE },
      gebeurtenissen: o.gebdef || [], sets: o.sets
    };
    if (o.extra) Object.keys(o.extra).forEach(function (k) { ep[k] = o.extra[k]; });
    if (o.zonderAb) delete ep.antibiotica;
    var st = {
      tijdlijn: tijdlijn, gebeurtenissen: o.geb || [], toestanden: o.toest || [], klachten: o.klachten || [],
      dag: o.dag || 1, aantalDagen: o.dagen || 7
    };
    return P.maakContext({ id: "cx", rollen: o.zonderRollen ? undefined : (o.rollen || ROLLEN), episodes: [ep] }, ep, st);
  }
  function ev(pred, ctx) { return P.evalueer(pred, ctx); }
  function K(kaart, doel, optie) { var k = { kaart: kaart }; if (doel) k.doel = doel; if (optie) k.optie = optie; return k; }

  /* ---------- context ---------- */
  t("maakContext: velden uit contract aanwezig", function () {
    var c = mk([R(1, "X1", 1)], { waar: { w: 5 }, toest: ["s"], geb: [{ id: "G", dag: 2, naVolg: 1 }], dag: 3, dagen: 9 });
    T.gelijk(c.tijdlijn.length, 1); T.gelijk(c.gebeurtenissen[0].id, "G"); T.gelijk(c.toestanden, ["s"]);
    T.gelijk(c.waar, { w: 5 }); T.is(c.aantalDagen, 9); T.is(c.laatsteDag, 3);
    T.waar(c.casus && c.episode, "casus/episode ontbreekt"); T.is(typeof c.status, "function");
  });
  t("maakContext: episode mag als id worden opgegeven en onbekend id geeft een Nederlandse fout", function () {
    var ep = { id: "Z", patient: { waar: { a: 1 } } };
    var c = P.maakContext({ episodes: [ep] }, "Z", { tijdlijn: [] });
    T.gelijk(c.waar, { a: 1 });
    try { P.maakContext({ episodes: [ep] }, "nee", {}); T.waar(false, "geen fout"); } catch (e) { T.waar(/Onbekende episode/.test(e.message), e.message); }
  });
  t("maakContext: status(dag) leest state.klachten, onbekende dag = null", function () {
    var c = mk([], { klachten: [{ dag: 1, status: null }, { dag: 2, status: "af" }, { dag: 3, status: "aan" }] });
    T.is(c.status(1), null); T.is(c.status(2), "af"); T.is(c.status(3), "aan"); T.is(c.status(9), null);
  });
  t("maakContext: laatsteDag is minstens de laatste dag in tijdlijn/klachten, ook als state.dag achterloopt", function () {
    T.is(mk([R(1, "X", 4)], { dag: 2 }).laatsteDag, 4);
    T.is(mk([], { dag: 1, klachten: [{ dag: 5, status: "af" }] }).laatsteDag, 5);
    T.is(mk([], { dag: 1 }).laatsteDag, 1);
  });
  t("maakContext: kopieert de lijsten (latere mutatie van state verandert ctx niet)", function () {
    var tl = [R(1, "X", 1)], st = { tijdlijn: tl };
    var c = P.maakContext({}, { patient: {} }, st);
    tl.push(R(2, "Y", 1));
    T.is(c.tijdlijn.length, 1);
  });

  /* ---------- gespeeld / nietGespeeld ---------- */
  t("gespeeld/nietGespeeld: lege tijdlijn", function () {
    var c = mk([]);
    T.is(ev({ p: "gespeeld", K: K("X1") }, c), false);
    T.is(ev({ p: "nietGespeeld", K: K("X1") }, c), true);
  });
  t("gespeeld: kaart, doel, optie en optieNiet worden exact gematcht", function () {
    var c = mk([R(1, "X1", 1, "d1", "o1"), R(2, "X1", 1, "d2", "o2")]);
    T.is(ev({ p: "gespeeld", K: K("X1") }, c), true);
    T.is(ev({ p: "gespeeld", K: K("X1", "d1") }, c), true);
    T.is(ev({ p: "gespeeld", K: K("X1", "d3") }, c), false);
    T.is(ev({ p: "gespeeld", K: K("X1", "d1", "o1") }, c), true);
    T.is(ev({ p: "gespeeld", K: K("X1", "d1", "o2") }, c), false, "doel d1 met optie o2 bestaat niet");
    T.is(ev({ p: "gespeeld", K: { kaart: "X1", doel: "d1", optieNiet: ["o1"] } }, c), false);
    T.is(ev({ p: "gespeeld", K: { kaart: "X1", doel: "d1", optieNiet: ["o9"] } }, c), true);
    T.is(ev({ p: "gespeeld", K: { kaart: "X1", optieNiet: ["o1", "o2"] } }, c), false);
    T.is(ev({ p: "gespeeld", K: K("Y9") }, c), false);
  });
  t("gespeeld: doel null matcht alleen regels zonder doel; optieNiet laat regels zonder optie toe", function () {
    var c = mk([R(1, "X1", 1)]);
    T.is(ev({ p: "gespeeld", K: { kaart: "X1", doel: null } }, c), true);
    T.is(ev({ p: "gespeeld", K: { kaart: "X1", optieNiet: ["o1"] } }, c), true);
    var c2 = mk([R(1, "X1", 1, "d")]);
    T.is(ev({ p: "gespeeld", K: { kaart: "X1", doel: null } }, c2), false);
  });
  t("gespeeld: dubbel gespeelde kaart telt als gespeeld; K mag ook inline op het predicaat staan", function () {
    var c = mk([R(1, "X1", 1), R(2, "X1", 2)]);
    T.is(ev({ p: "gespeeld", K: K("X1") }, c), true);
    T.is(ev({ p: "gespeeld", kaart: "X1" }, c), true);
    T.is(ev({ p: "nietGespeeld", kaart: "X1" }, c), false);
  });
  t("gespeeld: kaart als lijst matcht één van de ids; kaartUit gebruikt een set uit de episode", function () {
    var c = mk([R(1, "Q2", 1)], { extra: { mijnSet: ["Q1", "Q2"] } });
    T.is(ev({ p: "gespeeld", K: { kaart: ["Q9", "Q2"] } }, c), true);
    T.is(ev({ p: "gespeeld", K: { kaartUit: "antibiotica" } }, c), true);
    T.is(ev({ p: "gespeeld", K: { kaartUit: "mijnSet" } }, c), true);
    T.gooit(function () { ev({ p: "gespeeld", K: { kaartUit: "bestaatNiet" } }, c); });
  });
  t("kaartverwijzing: onbekend veld of ontbrekende kaart is een fout (geen stille false)", function () {
    var c = mk([R(1, "X1", 1)]);
    T.gooit(function () { ev({ p: "gespeeld", K: { kaart: "X1", optiee: "x" } }, c); });
    T.gooit(function () { ev({ p: "gespeeld", K: { doel: "x" } }, c); });
    T.gooit(function () { ev({ p: "gespeeld" }, c); });
  });

  /* ---------- voor / na ---------- */
  t("voor/na: strikt op volg, niet op dag", function () {
    var c = mk([R(1, "A", 1), R(2, "B", 1)]);
    T.is(ev({ p: "voor", a: K("A"), b: K("B") }, c), true);
    T.is(ev({ p: "voor", a: K("B"), b: K("A") }, c), false);
    T.is(ev({ p: "na", a: K("B"), b: K("A") }, c), true);
    T.is(ev({ p: "na", a: K("A"), b: K("B") }, c), false);
  });
  t("voor/na: zelfde kaart tegen zichzelf is nooit strikt vóór of ná", function () {
    var c = mk([R(1, "A", 1)]);
    T.is(ev({ p: "voor", a: K("A"), b: K("A") }, c), false);
    T.is(ev({ p: "na", a: K("A"), b: K("A") }, c), false);
  });
  t("voor/na: ontbreekt a of b dan false; lege tijdlijn false", function () {
    var c = mk([R(1, "A", 1)]);
    T.is(ev({ p: "voor", a: K("A"), b: K("B") }, c), false);
    T.is(ev({ p: "voor", a: K("B"), b: K("A") }, c), false);
    T.is(ev({ p: "na", a: K("A"), b: K("B") }, c), false);
    T.is(ev({ p: "na", a: K("B"), b: K("A") }, c), false);
    var leeg = mk([]);
    T.is(ev({ p: "voor", a: K("A"), b: K("B") }, leeg), false);
    T.is(ev({ p: "na", a: K("A"), b: K("B") }, leeg), false);
  });
  t("voor/na: gebruikt de EERSTE match van elk; dubbel gespeelde kaart", function () {
    var c = mk([R(1, "A", 1), R(2, "B", 1), R(3, "A", 2)]);
    T.is(ev({ p: "voor", a: K("A"), b: K("B") }, c), true, "eerste A (1) vóór eerste B (2)");
    T.is(ev({ p: "na", a: K("A"), b: K("B") }, c), false, "eerste A is niet na eerste B");
    var d = mk([R(1, "B", 1), R(2, "A", 1), R(3, "B", 2)]);
    T.is(ev({ p: "voor", a: K("A"), b: K("B") }, d), false);
    T.is(ev({ p: "na", a: K("A"), b: K("B") }, d), true);
  });
  t("voor/na: volgorde komt uit volg, ook als de tijdlijn niet gesorteerd is aangeleverd", function () {
    var c = mk([R(2, "B", 1), R(1, "A", 1)]);
    T.is(ev({ p: "voor", a: K("A"), b: K("B") }, c), true);
  });
  t("voor/na: doel en optie bepalen welke regel telt", function () {
    var c = mk([R(1, "A", 1, "d1"), R(2, "B", 1), R(3, "A", 1, "d2")]);
    T.is(ev({ p: "voor", a: K("A", "d1"), b: K("B") }, c), true);
    T.is(ev({ p: "voor", a: K("A", "d2"), b: K("B") }, c), false);
    T.is(ev({ p: "na", a: K("A", "d2"), b: K("B") }, c), true);
  });

  /* ---------- binnenBeurten ---------- */
  t("binnenBeurten: randen zijn inclusief (dag g .. g+n-1)", function () {
    var geb = [{ id: "E", dag: 3, naVolg: 2 }];
    function b(dag, n) { return ev({ p: "binnenBeurten", K: K("A"), naGebeurtenis: "E", n: n }, mk([R(1, "A", dag)], { geb: geb })); }
    T.is(b(2, 2), false, "dag vóór gebeurtenis");
    T.is(b(3, 2), true, "dag van de gebeurtenis zelf (onderrand)");
    T.is(b(4, 2), true, "bovenrand g+n-1");
    T.is(b(5, 2), false, "net buiten");
    T.is(b(3, 1), true); T.is(b(4, 1), false);
    T.is(b(3, 0), false, "n=0 is leeg");
  });
  t("binnenBeurten: gebeurtenis niet geweest of lege tijdlijn = false", function () {
    T.is(ev({ p: "binnenBeurten", K: K("A"), naGebeurtenis: "E", n: 2 }, mk([R(1, "A", 1)])), false);
    T.is(ev({ p: "binnenBeurten", K: K("A"), naGebeurtenis: "E", n: 2 }, mk([], { geb: [{ id: "E", dag: 1, naVolg: 1 }] })), false);
  });
  t("binnenBeurten: dubbel gespeelde kaart: één match in het venster is genoeg", function () {
    var c = mk([R(1, "A", 1), R(2, "A", 4)], { geb: [{ id: "E", dag: 4, naVolg: 1 }] });
    T.is(ev({ p: "binnenBeurten", K: K("A"), naGebeurtenis: "E", n: 1 }, c), true);
  });
  t("binnenBeurten: doel en optie worden meegenomen", function () {
    var c = mk([R(1, "A", 2, "d1", "o1")], { geb: [{ id: "E", dag: 2, naVolg: 0 }] });
    T.is(ev({ p: "binnenBeurten", K: K("A", "d1", "o1"), naGebeurtenis: "E", n: 2 }, c), true);
    T.is(ev({ p: "binnenBeurten", K: K("A", "d2"), naGebeurtenis: "E", n: 2 }, c), false);
  });
  t("actiefNaDagen: middel nog actief aan het einde van dag(anker)+na; wie eerder stopt of wisselt valt erbuiten", function () {
    function a(na, tl) { return ev({ p: "actiefNaDagen", middel: "Q1", anker: K("Q1"), na: na }, mk(tl)); }
    // Q1 start op dag 1; actief aan het einde van dag 1+na?
    T.is(a(2, [R(1, "Q1", 1)]), true, "nooit gestopt");
    T.is(a(2, [R(1, "Q1", 1), R(2, "B2", 3, "Q1")]), false, "gestopt op dag 3 = einde van dag 3 niet meer actief");
    T.is(a(2, [R(1, "Q1", 1), R(2, "B2", 4, "Q1")]), true, "gestopt op dag 4: aan het einde van dag 3 nog actief");
    T.is(a(3, [R(1, "Q1", 1), R(2, "B2", 4, "Q1")]), false, "na=3: einde van dag 4");
    T.is(a(2, [R(1, "Q1", 1), R(2, "B1", 3, "Q2")]), false, "vervangen via de wissel-kaart op dag 3");
    T.is(a(0, [R(1, "Q1", 1)]), true, "na=0: einde van de startdag");
    T.is(ev({ p: "actiefNaDagen", middel: "Q1", anker: K("Q3"), na: 2 }, mk([R(1, "Q1", 1)])), false, "anker niet gespeeld");
    T.is(ev({ p: "actiefNaDagen", middel: "Q1", anker: { start: "Q1" }, na: 2 }, mk([R(1, "Q2", 1), R(2, "B1", 2, "Q1")])), true, "start via wissel op dag 2: einde van dag 4 nog actief");
    T.gooit(function () { ev({ p: "actiefNaDagen", middel: "Q1", anker: K("Q1") }, mk([])); }, "na ontbreekt");
    T.gooit(function () { ev({ p: "actiefNaDagen", middel: "Q9", anker: K("Q1"), na: 1 }, mk([])); }, "geen antibioticum");
  });
  t("binnenBeurtenNaKaart: venster vanaf de dag van de eerste ankerkaart (n=1 is dezelfde beurt)", function () {
    function b(dag, n) { return ev({ p: "binnenBeurtenNaKaart", K: K("B"), naKaart: K("A"), n: n }, mk([R(1, "A", 2), R(2, "B", dag)])); }
    T.is(b(2, 1), true); T.is(b(3, 1), false); T.is(b(3, 2), true); T.is(b(4, 2), false); T.is(b(1, 2), false);
    T.is(ev({ p: "binnenBeurtenNaKaart", K: K("B"), naKaart: K("A"), n: 2 }, mk([R(1, "B", 1)])), false, "anker ontbreekt");
  });

  /* ---------- opDagRelatief ---------- */
  t("opDagRelatief: randen van van/tot inclusief, anker zelf is verschil 0", function () {
    function o(dagK, van, tot) {
      var p = { p: "opDagRelatief", K: K("K1"), anker: K("AN"), van: van };
      if (tot !== undefined) p.tot = tot;
      return ev(p, mk([R(1, "AN", 2), R(2, "K1", dagK)]));
    }
    T.is(o(3, 2, 4), false, "verschil 1 < van");
    T.is(o(4, 2, 4), true, "verschil 2 = van");
    T.is(o(6, 2, 4), true, "verschil 4 = tot");
    T.is(o(7, 2, 4), false, "verschil 5 > tot");
    T.is(o(2, 0, 0), true, "verschil 0 (zelfde dag)");
    T.is(o(2, 1, 3), false);
    T.is(o(1, -1, 0), true, "negatief verschil toegestaan");
  });
  t("opDagRelatief: tot weglaten = oneindig", function () {
    var p = { p: "opDagRelatief", K: K("K1"), anker: K("AN"), van: 3 };
    T.is(ev(p, mk([R(1, "AN", 1), R(2, "K1", 99)])), true);
    T.is(ev(p, mk([R(1, "AN", 1), R(2, "K1", 3)])), false);
    T.is(ev(p, mk([R(1, "AN", 1), R(2, "K1", 4)])), true);
  });
  t("opDagRelatief: bestaat een match van K in het venster, dan true (ook als een andere buiten valt)", function () {
    var p = { p: "opDagRelatief", K: K("K1"), anker: K("AN"), van: 2, tot: 3 };
    T.is(ev(p, mk([R(1, "AN", 1), R(2, "K1", 1), R(3, "K1", 3)])), true);
    T.is(ev(p, mk([R(1, "AN", 1), R(2, "K1", 1), R(3, "K1", 5)])), false);
  });
  t("opDagRelatief: anker is de EERSTE match; zonder anker of K false; lege tijdlijn false", function () {
    var p = { p: "opDagRelatief", K: K("K1"), anker: K("AN"), van: 2, tot: 2 };
    T.is(ev(p, mk([R(1, "AN", 1), R(2, "AN", 5), R(3, "K1", 3)])), true, "anker dag 1, K1 dag 3");
    T.is(ev(p, mk([R(1, "K1", 3)])), false);
    T.is(ev(p, mk([R(1, "AN", 1)])), false);
    T.is(ev(p, mk([])), false);
  });
  t("opDagRelatief: doel/optie in K en een anker met doel", function () {
    var p = { p: "opDagRelatief", K: K("K1", "d", "o"), anker: K("AN", "d"), van: 1 };
    T.is(ev(p, mk([R(1, "AN", 1, "d"), R(2, "K1", 2, "d", "o")])), true);
    T.is(ev(p, mk([R(1, "AN", 1, "x"), R(2, "K1", 2, "d", "o")])), false);
    T.is(ev(p, mk([R(1, "AN", 1, "d"), R(2, "K1", 2, "d", "z")])), false);
  });

  /* ---------- gestart / actief ---------- */
  t("gestart: directe kaart of wissel (B1) met doel = middel", function () {
    T.is(ev({ p: "gestart", middel: "Q1" }, mk([R(1, "Q1", 1)])), true);
    T.is(ev({ p: "gestart", middel: "Q2" }, mk([R(1, "Q1", 1), R(2, "B1", 2, "Q2")])), true);
    T.is(ev({ p: "gestart", middel: "Q1" }, mk([R(1, "Q1", 1), R(2, "B1", 2, "Q2")])), true, "ook als later vervangen");
    T.is(ev({ p: "gestart", middel: "Q3" }, mk([R(1, "Q1", 1), R(2, "B1", 2, "Q2")])), false);
    T.is(ev({ p: "gestart", middel: "Q1" }, mk([])), false);
  });
  t("gestart: B1 met een ander doel, of B2/B3 met doel = middel, starten het middel niet", function () {
    T.is(ev({ p: "gestart", middel: "Q2" }, mk([R(1, "B1", 1, "Q1")])), false);
    T.is(ev({ p: "gestart", middel: "Q2" }, mk([R(1, "B2", 1, "Q2")])), false);
    T.is(ev({ p: "gestart", middel: "Q2" }, mk([R(1, "B3", 1, "Q2")])), false);
  });
  t("gestart: middel als lijst = één van de middelen", function () {
    T.is(ev({ p: "gestart", middel: ["Q3", "Q1"] }, mk([R(1, "Q1", 1)])), true);
    T.is(ev({ p: "gestart", middel: ["Q3", "Q2"] }, mk([R(1, "Q1", 1)])), false);
  });
  t("actief: gestart en niet gestopt; stoppen met B2 (op dat doel)", function () {
    var a = { p: "actief", middel: "Q1" };
    T.is(ev(a, mk([])), false, "lege tijdlijn");
    T.is(ev(a, mk([R(1, "Q1", 1)])), true);
    T.is(ev(a, mk([R(1, "Q1", 1), R(2, "B2", 2, "Q1")])), false, "gestopt");
    T.is(ev(a, mk([R(1, "Q1", 1), R(2, "B2", 2, "Q2")])), true, "ander middel gestopt");
    T.is(ev(a, mk([R(1, "B2", 1, "Q1")])), false, "stoppen zonder start");
  });
  t("actief: opnieuw starten na stoppen maakt actief", function () {
    T.is(ev({ p: "actief", middel: "Q1" }, mk([R(1, "Q1", 1), R(2, "B2", 1, "Q1"), R(3, "Q1", 2)])), true);
  });
  t("actief: vervangen via B1 (oude middel niet meer actief, nieuwe wel)", function () {
    var c = mk([R(1, "Q1", 1), R(2, "B1", 2, "Q2")]);
    T.is(ev({ p: "actief", middel: "Q1" }, c), false);
    T.is(ev({ p: "actief", middel: "Q2" }, c), true);
  });
  t("actief: B1 vervangt ALLE lopende antibiotica, maar niet-antibiotische kaarten", function () {
    var c = mk([R(1, "Q1", 1), R(2, "Q2", 1), R(3, "N1", 1), R(4, "B1", 2, "Q3")]);
    T.is(ev({ p: "actief", middel: "Q1" }, c), false);
    T.is(ev({ p: "actief", middel: "Q2" }, c), false);
    T.is(ev({ p: "actief", middel: "Q3" }, c), true);
    T.is(ev({ p: "aantalActieveAntibiotica", op: "==", n: 1 }, c), false, "max was 2 vóór de wissel");
  });
  t("actief: zonder middel = elk antibioticum uit episode.antibiotica", function () {
    var a = { p: "actief" };
    T.is(ev(a, mk([])), false);
    T.is(ev(a, mk([R(1, "N1", 1)])), false, "geen antibioticum");
    T.is(ev(a, mk([R(1, "Q2", 1)])), true);
    T.is(ev(a, mk([R(1, "Q2", 1), R(2, "B2", 1, "Q2")])), false);
    T.is(ev(a, mk([R(1, "Q2", 1), R(2, "B1", 2, "Q3")])), true);
  });
  t("actief: middel als lijst, en zonder antibiotica-lijst in de episode een fout", function () {
    T.is(ev({ p: "actief", middel: ["Q2", "Q1"] }, mk([R(1, "Q1", 1)])), true);
    T.gooit(function () { ev({ p: "actief" }, mk([R(1, "Q1", 1)], { zonderAb: true })); });
  });
  t("actief: op {dag} = einde van die beurt (randen)", function () {
    var c = mk([R(1, "Q1", 2), R(2, "B2", 4, "Q1")]);
    function a(d) { return ev({ p: "actief", middel: "Q1", op: { dag: d } }, c); }
    T.is(a(1), false, "nog niet gestart");
    T.is(a(2), true, "einde van de startdag");
    T.is(a(3), true);
    T.is(a(4), false, "gestopt op dag 4: aan het einde van dag 4 niet meer actief");
    T.is(a(9), false);
  });
  t("actief: op eindeBeurtNaGebeurtenis met offset", function () {
    var c = mk([R(1, "Q1", 1), R(2, "B2", 4, "Q1")], { geb: [{ id: "E", dag: 3, naVolg: 1 }] });
    T.is(ev({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E", offset: 0 } }, c), true);
    T.is(ev({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E", offset: 1 } }, c), false);
    T.is(ev({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E" } }, c), true, "offset standaard 0");
    T.is(ev({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "NOPE", offset: 0 } }, c), false, "gebeurtenis niet geweest");
  });
  t("actief: op naKaart = direct na die kaart (volg-niveau, binnen één dag)", function () {
    var c = mk([R(1, "Q1", 1), R(2, "X", 1), R(3, "B2", 1, "Q1")]);
    T.is(ev({ p: "actief", middel: "Q1", op: { naKaart: K("X") } }, c), true);
    T.is(ev({ p: "actief", middel: "Q1", op: { naKaart: K("B2") } }, c), false);
    T.is(ev({ p: "actief", middel: "Q1", op: { naKaart: K("ONBEKEND") } }, c), false);
  });
  t("actief: onbekend op-moment is een fout", function () {
    T.gooit(function () { ev({ p: "actief", middel: "Q1", op: { weekdag: 1 } }, mk([R(1, "Q1", 1)])); });
  });
  t("actief: uitSet 'resistent' uit gebeurtenis-zet; gevoelig haalt weer uit de set; tijd telt mee", function () {
    var gebdef = [{ id: "C", zet: { resistent: ["Q1"], gevoelig: ["Q2"] } }, { id: "D", zet: { gevoelig: ["Q1"] } }];
    var tl = [R(1, "Q1", 1)];
    var vooraf = mk(tl, { gebdef: gebdef });
    T.is(ev({ p: "actief", uitSet: "resistent" }, vooraf), false, "C nog niet geweest");
    var naC = mk(tl, { gebdef: gebdef, geb: [{ id: "C", dag: 3, naVolg: 1 }] });
    T.is(ev({ p: "actief", uitSet: "resistent" }, naC), true);
    T.is(ev({ p: "actief", uitSet: "resistent", op: { dag: 2 } }, naC), false, "C pas op dag 3");
    T.is(ev({ p: "actief", uitSet: "resistent", op: { dag: 3 } }, naC), true);
    var naD = mk(tl, { gebdef: gebdef, geb: [{ id: "C", dag: 3, naVolg: 1 }, { id: "D", dag: 4, naVolg: 2 }] });
    T.is(ev({ p: "actief", uitSet: "resistent" }, naD), false, "D maakt Q1 weer gevoelig");
  });
  t("actief: uitSet met middel combineert beide eisen; statische set uit waar of episode", function () {
    var gebdef = [{ id: "C", zet: { resistent: ["Q1"] } }];
    var c = mk([R(1, "Q1", 1), R(2, "Q2", 1)], { gebdef: gebdef, geb: [{ id: "C", dag: 2, naVolg: 1 }], ab: ["Q1", "Q2"] });
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "resistent" }, c), true);
    T.is(ev({ p: "actief", middel: "Q2", uitSet: "resistent" }, c), false);
    var stat = mk([R(1, "Q2", 1)], { waar: { resistent: ["Q2"] } });
    T.is(ev({ p: "actief", uitSet: "resistent" }, stat), true, "waar.resistent");
    var stat2 = mk([R(1, "Q2", 1)], { extra: { eigenSet: ["Q2"] } });
    T.is(ev({ p: "actief", uitSet: "eigenSet" }, stat2), true, "episode.<set>");
    T.gooit(function () { ev({ p: "actief", uitSet: "nietBestaand" }, stat2); });
  });
  t("rollen: B1/B2/B3/B5 zijn instelbaar via casus.rollen (geen vaste kaartnamen in de code)", function () {
    var rollen = { wissel: "W", stop: "S", pauzeer: "P", hervat: "H" };
    var c = mk([R(1, "Q1", 1), R(2, "W", 2, "Q2"), R(3, "P", 2, "m"), R(4, "B1", 2, "Q3")], { rollen: rollen });
    T.is(ev({ p: "actief", middel: "Q1" }, c), false);
    T.is(ev({ p: "actief", middel: "Q2" }, c), true);
    T.is(ev({ p: "actief", middel: "Q3" }, c), false, "B1 is hier geen wissel");
    T.is(ev({ p: "medicatieActief", id: "m" }, c), false);
    var c2 = mk([R(1, "P", 1, "m"), R(2, "H", 1, "m")], { rollen: rollen });
    T.is(ev({ p: "medicatieActief", id: "m" }, c2), true);
  });

  /* ---------- aantalActieveAntibiotica (per moment) ---------- */
  t("aantalActieveAntibiotica: lege tijdlijn en één middel", function () {
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, mk([])), false);
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">", n: 0 }, mk([R(1, "Q1", 1)])), true);
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, mk([R(1, "Q1", 1)])), false);
  });
  t("aantalActieveAntibiotica: twee tegelijk (zelfde dag) schendt >1", function () {
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, mk([R(1, "Q1", 1), R(2, "Q2", 1)])), true);
  });
  t("aantalActieveAntibiotica: telt per kaart (volg-niveau), niet alleen de eindstand van de dag", function () {
    var c = mk([R(1, "Q1", 1), R(2, "Q2", 1), R(3, "B2", 1, "Q1")]);
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, c), true, "op volg 2 waren er twee, ook al is er aan het eind van de dag één");
  });
  t("aantalActieveAntibiotica: wisselen via B1 geeft nooit twee tegelijk", function () {
    var c = mk([R(1, "Q1", 1), R(2, "B1", 2, "Q2"), R(3, "B1", 3, "Q3")]);
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, c), false);
  });
  t("aantalActieveAntibiotica: stoppen vóór het tweede middel start is geen schending; niet-antibiotica tellen niet", function () {
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, mk([R(1, "Q1", 1), R(2, "B2", 1, "Q1"), R(3, "Q2", 1)])), false);
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, mk([R(1, "Q1", 1), R(2, "N1", 1), R(3, "N2", 1)])), false);
  });
  t("aantalActieveAntibiotica: hetzelfde middel twee keer starten telt één keer", function () {
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, mk([R(1, "Q1", 1), R(2, "Q1", 2)])), false);
  });
  t("aantalActieveAntibiotica: alle vergelijkingsoperatoren", function () {
    var c = mk([R(1, "Q1", 1), R(2, "Q2", 1)]); // max = 2
    var ops = { ">": [1, true, 2, false], ">=": [2, true, 3, false], "<": [3, true, 2, false], "<=": [2, true, 1, false], "==": [2, true, 1, false], "!=": [1, true, 2, false] };
    Object.keys(ops).forEach(function (op) {
      var o = ops[op];
      T.is(ev({ p: "aantalActieveAntibiotica", op: op, n: o[0] }, c), o[1], op + " " + o[0]);
      T.is(ev({ p: "aantalActieveAntibiotica", op: op, n: o[2] }, c), o[3], op + " " + o[2]);
    });
  });
  t("aantalActieveAntibiotica: zonder antibiotica-lijst een fout (geen stille 0)", function () {
    T.gooit(function () { ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, mk([R(1, "Q1", 1)], { zonderAb: true })); });
  });

  /* ---------- medicatieActief ---------- */
  t("medicatieActief: standaard actief; pauzeren (B3) en hervatten (B5)", function () {
    var m = { p: "medicatieActief", id: "m1" };
    T.is(ev(m, mk([])), true, "lege tijdlijn: nog actief");
    T.is(ev(m, mk([R(1, "B3", 1, "m1")])), false);
    T.is(ev(m, mk([R(1, "B3", 1, "m1"), R(2, "B5", 2, "m1")])), true);
    T.is(ev(m, mk([R(1, "B3", 1, "m1"), R(2, "B5", 2, "m1"), R(3, "B3", 3, "m1")])), false, "opnieuw gepauzeerd");
    T.is(ev(m, mk([R(1, "B3", 1, "m2")])), true, "ander middel gepauzeerd");
    T.is(ev(m, mk([R(1, "B5", 1, "m1")])), true, "hervatten zonder pauze");
  });
  t("medicatieActief: op dag-grenzen en op naKaart", function () {
    var c = mk([R(1, "B3", 2, "m1"), R(2, "B5", 4, "m1")]);
    function a(d) { return ev({ p: "medicatieActief", id: "m1", op: { dag: d } }, c); }
    T.is(a(1), true); T.is(a(2), false); T.is(a(3), false); T.is(a(4), true);
    T.is(ev({ p: "medicatieActief", id: "m1", op: { naKaart: K("B3") } }, c), false);
    T.is(ev({ p: "medicatieActief", id: "m1", op: { naKaart: K("Z") } }, c), false, "moment bestaat niet");
    var geb = mk([R(1, "B3", 2, "m1")], { geb: [{ id: "E", dag: 2, naVolg: 1 }] });
    T.is(ev({ p: "medicatieActief", id: "m1", op: { eindeBeurtNaGebeurtenis: "E", offset: 0 } }, geb), false);
  });
  t("medicatieActief: pauzeren staat los van antibiotica en beïnvloedt de antibioticatelling niet", function () {
    var c = mk([R(1, "Q1", 1), R(2, "B3", 1, "m1")]);
    T.is(ev({ p: "actief", middel: "Q1" }, c), true);
  });

  /* ---------- waar ---------- */
  t("waar: alle operatoren, met ware waarde", function () {
    var c = mk([], { waar: { g: 29 } });
    function w(op, v) { return ev({ p: "waar", veld: "g", op: op, waarde: v }, c); }
    T.is(w("<", 30), true); T.is(w("<", 29), false);
    T.is(w("<=", 29), true); T.is(w("<=", 28), false);
    T.is(w(">", 28), true); T.is(w(">", 29), false);
    T.is(w(">=", 29), true); T.is(w(">=", 30), false);
    T.is(w("==", 29), true); T.is(w("==", 30), false);
    T.is(w("=", 29), true);
    T.is(w("!=", 30), true); T.is(w("!=", 29), false);
  });
  t("waar: tekstwaarden en booleans met ==/!=; < op tekst is een fout", function () {
    var c = mk([], { waar: { s: "ja", b: false } });
    T.is(ev({ p: "waar", veld: "s", op: "==", waarde: "ja" }, c), true);
    T.is(ev({ p: "waar", veld: "s", op: "!=", waarde: "ja" }, c), false);
    T.is(ev({ p: "waar", veld: "b", op: "==", waarde: false }, c), true);
    T.gooit(function () { ev({ p: "waar", veld: "s", op: "<", waarde: 3 }, c); });
  });
  t("waar: onbekend veld, onbekende operator of ontbrekend deel is een fout", function () {
    var c = mk([], { waar: { g: 1 } });
    T.gooit(function () { ev({ p: "waar", veld: "x", op: "<", waarde: 1 }, c); });
    T.gooit(function () { ev({ p: "waar", veld: "g", op: "~", waarde: 1 }, c); });
    T.gooit(function () { ev({ p: "waar", veld: "g", op: "<" }, c); });
    T.gooit(function () { ev({ p: "waar", op: "<", waarde: 1 }, c); });
  });
  t("waar: waarde 0 en negatieve waarden werken", function () {
    var c = mk([], { waar: { n: 0, m: -2 } });
    T.is(ev({ p: "waar", veld: "n", op: "==", waarde: 0 }, c), true);
    T.is(ev({ p: "waar", veld: "m", op: "<", waarde: 0 }, c), true);
  });

  /* ---------- toestand en gebeurtenissen ---------- */
  t("inToestand en gebeurtenisGeweest", function () {
    var c = mk([], { toest: ["s1", "s2"], geb: [{ id: "E", dag: 2, naVolg: 1 }] });
    T.is(ev({ p: "inToestand", t: "s1" }, c), true);
    T.is(ev({ p: "inToestand", t: "s3" }, c), false);
    T.is(ev({ p: "gebeurtenisGeweest", id: "E" }, c), true);
    T.is(ev({ p: "gebeurtenisGeweest", id: "F" }, c), false);
    T.is(ev({ p: "inToestand", t: "s1" }, mk([])), false, "lege toestanden");
  });
  t("K-filters naGebeurtenis/voorGebeurtenis: werken op de dag van de gebeurtenis (rand inclusief resp. exclusief)", function () {
    var geb = [{ id: "E", dag: 3, naVolg: 2 }];
    var c = mk([R(1, "A", 2), R(2, "A", 3), R(3, "B", 4)], { geb: geb });
    T.is(ev({ p: "gespeeld", K: { kaart: "A", naGebeurtenis: "E" } }, c), true, "A op dag 3");
    T.is(ev({ p: "gespeeld", K: { kaart: "B", voorGebeurtenis: "E" } }, c), false);
    T.is(ev({ p: "gespeeld", K: { kaart: "A", voorGebeurtenis: "E" } }, c), true, "A op dag 2");
    T.is(ev({ p: "tel", teller: { t: "gespeeld", K: { kaart: "A", voorGebeurtenis: "E" } }, op: "==", waarde: 1 }, c), true);
    var zonder = mk([R(1, "A", 2)]);
    T.is(ev({ p: "gespeeld", K: { kaart: "A", naGebeurtenis: "E" } }, zonder), false, "gebeurtenis niet geweest: niets is 'erna'");
    T.is(ev({ p: "gespeeld", K: { kaart: "A", voorGebeurtenis: "E" } }, zonder), true, "gebeurtenis niet geweest: alles is 'ervoor'");
  });
  t("K.start: kaart zelf of wissel met doel; bruikbaar als anker en in voor", function () {
    var c = mk([R(1, "Q1", 1), R(2, "O", 2), R(3, "B1", 3, "Q2"), R(4, "O", 3)]);
    T.is(ev({ p: "voor", a: { kaart: "O" }, b: { start: "Q2" } }, c), true);
    T.is(ev({ p: "voor", a: { start: "Q2" }, b: { kaart: "O" } }, c), false, "eerste O (volg 2) ligt vóór de Q2-start (volg 3)");
  });

  /* ---------- klachten ---------- */
  var KL = [{ dag: 1, status: null }, { dag: 2, status: "af" }, { dag: 3, status: "aan" }, { dag: 4, status: "geenVerbetering48" }];
  t("klachten: standaard = ooit tijdens de episode", function () {
    var c = mk([], { klachten: KL });
    T.is(ev({ p: "klachten", waarde: "af" }, c), true);
    T.is(ev({ p: "klachten", waarde: "aan" }, c), true);
    T.is(ev({ p: "klachten", waarde: "geenVerbetering48" }, c), true);
    var c2 = mk([], { klachten: [{ dag: 1, status: null }, { dag: 2, status: "af" }] });
    T.is(ev({ p: "klachten", waarde: "aan" }, c2), false);
    T.is(ev({ p: "klachten", waarde: "af" }, mk([])), false, "geen klachtenregels");
  });
  t("klachten: op {dag}, op eindeBeurtNaGebeurtenis+offset en op laatste", function () {
    var c = mk([], { klachten: KL, geb: [{ id: "E", dag: 2, naVolg: 1 }] });
    T.is(ev({ p: "klachten", waarde: "af", op: { dag: 2 } }, c), true);
    T.is(ev({ p: "klachten", waarde: "af", op: { dag: 3 } }, c), false);
    T.is(ev({ p: "klachten", waarde: "aan", op: { eindeBeurtNaGebeurtenis: "E", offset: 1 } }, c), true);
    T.is(ev({ p: "klachten", waarde: "aan", op: { eindeBeurtNaGebeurtenis: "E", offset: 0 } }, c), false);
    T.is(ev({ p: "klachten", waarde: "aan", op: { eindeBeurtNaGebeurtenis: "NOPE", offset: 1 } }, c), false);
    T.is(ev({ p: "klachten", waarde: "geenVerbetering48", op: "laatste" }, c), true);
    T.is(ev({ p: "klachten", waarde: "aan", op: "laatste" }, c), false);
  });
  t("klachten: onbekende waarde of onbekend op-moment is een fout", function () {
    var c = mk([], { klachten: KL });
    T.gooit(function () { ev({ p: "klachten", waarde: "toenemend" }, c); });
    T.gooit(function () { ev({ p: "klachten", waarde: "af", op: { week: 1 } }, c); });
    T.gooit(function () { ev({ p: "klachten" }, c); });
  });

  /* ---------- combinaties ---------- */
  var WAAR = { p: "waarheid", waarde: true }, ONWAAR = { p: "waarheid", waarde: false };
  t("waarheid: constanten; ongeldige waarde is een fout", function () {
    T.is(ev(WAAR, mk([])), true); T.is(ev(ONWAAR, mk([])), false);
    T.gooit(function () { ev({ p: "waarheid", waarde: "ja" }, mk([])); });
    T.gooit(function () { ev({ p: "waarheid" }, mk([])); });
  });
  t("en/of/niet: waarheidstabel en lege args", function () {
    var c = mk([]);
    [[true, true], [true, false], [false, true], [false, false]].forEach(function (x) {
      var a = { p: "waarheid", waarde: x[0] }, b = { p: "waarheid", waarde: x[1] };
      T.is(ev({ p: "en", args: [a, b] }, c), x[0] && x[1]);
      T.is(ev({ p: "of", args: [a, b] }, c), x[0] || x[1]);
    });
    T.is(ev({ p: "niet", arg: WAAR }, c), false); T.is(ev({ p: "niet", arg: ONWAAR }, c), true);
    T.is(ev({ p: "en", args: [] }, c), true, "lege en");
    T.is(ev({ p: "of", args: [] }, c), false, "lege of");
    T.is(ev({ p: "en", args: [WAAR, WAAR, ONWAAR] }, c), false);
    T.is(ev({ p: "of", args: [ONWAAR, ONWAAR, WAAR] }, c), true);
  });
  t("en/of/niet: args moeten een lijst zijn, arg moet er zijn", function () {
    T.gooit(function () { ev({ p: "en", args: WAAR }, mk([])); });
    T.gooit(function () { ev({ p: "of" }, mk([])); });
    T.gooit(function () { ev({ p: "niet" }, mk([])); });
  });
  t("alsDan: volledige waarheidstabel (niet(als) of dan)", function () {
    var c = mk([]);
    T.is(ev({ p: "alsDan", als: WAAR, dan: WAAR }, c), true);
    T.is(ev({ p: "alsDan", als: WAAR, dan: ONWAAR }, c), false);
    T.is(ev({ p: "alsDan", als: ONWAAR, dan: WAAR }, c), true);
    T.is(ev({ p: "alsDan", als: ONWAAR, dan: ONWAAR }, c), true);
    T.gooit(function () { ev({ p: "alsDan", als: WAAR }, c); });
  });
  t("geneste combinatie met tijdlijnpredicaten", function () {
    var c = mk([R(1, "A", 1), R(2, "B", 2)]);
    var p = { p: "en", args: [{ p: "voor", a: K("A"), b: K("B") }, { p: "niet", arg: { p: "gespeeld", K: K("C") } }, { p: "alsDan", als: { p: "gespeeld", K: K("C") }, dan: ONWAAR }] };
    T.is(ev(p, c), true);
  });
  t("alsDan wordt niet verward met en: 'als' onwaar maakt de regel waar", function () {
    var c = mk([]);
    T.is(ev({ p: "alsDan", als: { p: "gespeeld", K: K("A") }, dan: { p: "gespeeld", K: K("B") } }, c), true);
  });

  /* ---------- fouten (P4) ---------- */
  t("onbekend predicaat geeft een Error met Nederlandse tekst", function () {
    try { ev({ p: "bestaatNiet" }, mk([])); T.waar(false, "geen fout"); }
    catch (e) { T.waar(e instanceof Error, "geen Error"); T.waar(/Onbekend predicaat 'bestaatNiet'/.test(e.message), e.message); }
  });
  t("onbekend predicaat diep in en/of/niet/alsDan gooit ook (geen stille false)", function () {
    var c = mk([]), x = { p: "kapot" };
    T.gooit(function () { ev({ p: "en", args: [WAAR, x] }, c); });
    T.gooit(function () { ev({ p: "of", args: [ONWAAR, x] }, c); });
    T.gooit(function () { ev({ p: "niet", arg: x }, c); });
    T.gooit(function () { ev({ p: "alsDan", als: WAAR, dan: x }, c); });
  });
  t("geen predicaat, geen object, geen p, geen ctx: Error", function () {
    var c = mk([]);
    T.gooit(function () { ev(null, c); });
    T.gooit(function () { ev(undefined, c); });
    T.gooit(function () { ev("gespeeld", c); });
    T.gooit(function () { ev([], c); });
    T.gooit(function () { ev({}, c); });
    T.gooit(function () { ev({ p: 5 }, c); });
    T.gooit(function () { ev(WAAR, null); });
  });
  t("eigenschappen van Object.prototype zijn geen predicaat", function () {
    T.gooit(function () { ev({ p: "constructor" }, mk([])); });
    T.gooit(function () { ev({ p: "toString" }, mk([])); });
    T.gooit(function () { ev({ p: "hasOwnProperty" }, mk([])); });
  });
  t("de foutmelding bij een onbekend predicaat is Nederlands (geen Engelse standaardtekst)", function () {
    try { ev({ p: "zzz" }, mk([])); } catch (e) { T.waar(!/not|unknown|undefined|is not a function/i.test(e.message), e.message); return; }
    T.waar(false, "geen fout");
  });
  t("predicaten zijn JSON-objecten: evalueren verandert predicaat en ctx niet", function () {
    var pred = { p: "en", args: [{ p: "gespeeld", K: K("A") }, { p: "actief", middel: "Q1" }] };
    var c = mk([R(1, "A", 1), R(2, "Q1", 1)]);
    var vp = JSON.stringify(pred), vt = JSON.stringify(c.tijdlijn), vg = JSON.stringify(c.gebeurtenissen);
    ev(pred, c); ev(pred, c);
    T.is(JSON.stringify(pred), vp); T.is(JSON.stringify(c.tijdlijn), vt); T.is(JSON.stringify(c.gebeurtenissen), vg);
    T.is(JSON.stringify(JSON.parse(vp)), vp, "round-trip door JSON");
    T.is(ev(JSON.parse(vp), c), true);
  });
  t("Predicaten.namen bevat alle predicaten uit contract §3 en de gedocumenteerde uitbreidingen", function () {
    ["gespeeld", "nietGespeeld", "voor", "na", "binnenBeurten", "opDagRelatief", "gestart", "actief",
      "aantalActieveAntibiotica", "medicatieActief", "waar", "inToestand", "gebeurtenisGeweest", "klachten",
      "en", "of", "niet", "alsDan", "waarheid", "binnenBeurtenNaKaart", "tel"].forEach(function (n) {
      T.waar(P.namen.indexOf(n) >= 0, "mist " + n);
    });
  });

  /* ---------- tellers (§3b) ---------- */
  t("tel gespeeld: aantal matchende regels, dubbel gespeeld telt dubbel, lege tijdlijn 0", function () {
    T.is(P.tel({ t: "gespeeld", K: K("A") }, mk([])), 0);
    T.is(P.tel({ t: "gespeeld", K: K("A") }, mk([R(1, "A", 1), R(2, "B", 1), R(3, "A", 2)])), 2);
    T.is(P.tel({ t: "gespeeld", K: K("A", "d") }, mk([R(1, "A", 1, "d"), R(2, "A", 1, "e")])), 1);
    T.is(P.tel({ t: "gespeeld", kaart: "A" }, mk([R(1, "A", 1)])), 1, "K inline");
  });
  t("tel gespeeld terwijlKlachten: telt op de klachtenstatus van de dag van spelen", function () {
    var c = mk([R(1, "A", 1), R(2, "A", 2), R(3, "A", 3), R(4, "A", 3), R(5, "A", 4)], { klachten: KL });
    T.is(P.tel({ t: "gespeeld", K: K("A"), terwijlKlachten: "af" }, c), 1);
    T.is(P.tel({ t: "gespeeld", K: K("A"), terwijlKlachten: "aan" }, c), 2);
    T.is(P.tel({ t: "gespeeld", K: K("A"), terwijlKlachten: "geenVerbetering48" }, c), 1);
    T.is(P.tel({ t: "gespeeld", K: K("A") }, c), 5, "zonder filter alles");
    T.gooit(function () { P.tel({ t: "gespeeld", K: K("A"), terwijlKlachten: "weg" }, c); });
  });
  t("tel gespeeld terwijlKlachten: dag zonder klachtenregel of dag 1 (status null) telt niet mee", function () {
    var c = mk([R(1, "A", 1), R(2, "A", 9)], { klachten: KL });
    T.is(P.tel({ t: "gespeeld", K: K("A"), terwijlKlachten: "af" }, c), 0);
  });
  t("tel aantalActieveAntibiotica max: maximum over de hele episode", function () {
    var T0 = { t: "aantalActieveAntibiotica", op: "max" };
    T.is(P.tel(T0, mk([])), 0);
    T.is(P.tel(T0, mk([R(1, "Q1", 1)])), 1);
    T.is(P.tel(T0, mk([R(1, "Q1", 1), R(2, "Q2", 1), R(3, "B2", 2, "Q1"), R(4, "B2", 2, "Q2")])), 2);
    T.is(P.tel(T0, mk([R(1, "Q1", 1), R(2, "B1", 2, "Q2")])), 1);
    T.is(P.tel(T0, mk([R(1, "Q1", 1), R(2, "Q2", 1), R(3, "Q3", 1)])), 3);
  });
  t("tellers: onbekende teller, ontbrekend 't' of onbekende op is een fout", function () {
    T.gooit(function () { P.tel({ t: "nietBestaand" }, mk([])); });
    T.gooit(function () { P.tel({}, mk([])); });
    T.gooit(function () { P.tel(null, mk([])); });
    T.gooit(function () { P.tel({ t: "aantalActieveAntibiotica", op: "min" }, mk([])); });
    T.gooit(function () { P.tel({ t: "aantalActieveAntibiotica" }, mk([])); });
    T.gooit(function () { P.tel({ t: "toString" }, mk([])); });
  });
  t("predicaat tel: vergelijkt een teller met een waarde", function () {
    var c = mk([R(1, "A", 1), R(2, "A", 2)]);
    T.is(ev({ p: "tel", teller: { t: "gespeeld", K: K("A") }, op: ">=", waarde: 2 }, c), true);
    T.is(ev({ p: "tel", teller: { t: "gespeeld", K: K("A") }, op: ">", waarde: 2 }, c), false);
    T.gooit(function () { ev({ p: "tel", op: ">", waarde: 1 }, c); });
  });

  /* ---------- samengestelde scenario's met willekeurige ids (de vormen die invarianten nodig hebben) ---------- */
  t("scenario 'vóór eerste antibioticum': en(gespeeld antibioticum, niet(voor O, antibioticum))", function () {
    var schend = { p: "en", args: [{ p: "gespeeld", K: { kaartUit: "antibiotica" } }, { p: "niet", arg: { p: "voor", a: K("OO"), b: { kaartUit: "antibiotica" } } }] };
    T.is(ev(schend, mk([R(1, "Q1", 1), R(2, "OO", 1)])), true, "antibioticum eerst");
    T.is(ev(schend, mk([R(1, "OO", 1), R(2, "Q1", 1)])), false, "OO eerst");
    T.is(ev(schend, mk([R(1, "Q1", 1)])), true, "OO ontbreekt");
    T.is(ev(schend, mk([])), false, "geen antibioticum: niet geschonden");
  });
  t("scenario 'hervat zonder eerdere overleg': B5 zonder voorafgaande Ev", function () {
    var schend = { p: "en", args: [{ p: "gespeeld", K: K("B5", "m1") }, { p: "niet", arg: { p: "voor", a: K("EV", "m1"), b: K("B5", "m1") } }] };
    T.is(ev(schend, mk([R(1, "B3", 1, "m1"), R(2, "B5", 2, "m1")])), true);
    T.is(ev(schend, mk([R(1, "B3", 1, "m1"), R(2, "EV", 2, "m1"), R(3, "B5", 2, "m1")])), false);
    T.is(ev(schend, mk([R(1, "B3", 1, "m1"), R(2, "B5", 2, "m1"), R(3, "EV", 2, "m1")])), true, "Ev ná hervatten");
  });
  t("scenario 'vier eisen binnen 2 beurten' (alle vier vereist; onvervuld = geschonden)", function () {
    var geb = [{ id: "E", dag: 3, naVolg: 2 }];
    var eisen = [K("B3", "m1"), K("V6", "m2", "halveren"), K("N3"), K("EV")];
    var geschonden = { p: "en", args: [{ p: "gebeurtenisGeweest", id: "E" }, { p: "niet", arg: { p: "en", args: eisen.map(function (k) { return { p: "binnenBeurten", K: k, naGebeurtenis: "E", n: 2 }; }) } }] };
    var vol = [R(1, "B3", 3, "m1"), R(2, "V6", 3, "m2", "halveren"), R(3, "N3", 4), R(4, "EV", 4)];
    T.is(ev(geschonden, mk(vol, { geb: geb })), false);
    T.is(ev(geschonden, mk(vol.slice(0, 3), { geb: geb })), true, "één eis mist");
    var laat = vol.slice(); laat[3] = R(4, "EV", 5);
    T.is(ev(geschonden, mk(laat, { geb: geb })), true, "één eis te laat (dag 5)");
    T.is(ev(geschonden, mk([], { geb: geb })), true, "vroeg afgerond: niets gedaan");
    T.is(ev(geschonden, mk([])), false, "gebeurtenis nooit geweest");
    var verkeerdeOptie = vol.slice(); verkeerdeOptie[1] = R(2, "V6", 3, "m2", "verdubbelen");
    T.is(ev(geschonden, mk(verkeerdeOptie, { geb: geb })), true);
  });
  t("scenario 'actief aan het eind van de beurt na gebeurtenis'", function () {
    var geb = [{ id: "E", dag: 3, naVolg: 2 }];
    var p = { p: "actief", middel: ["Q1", "Q2"], op: { eindeBeurtNaGebeurtenis: "E", offset: 0 } };
    T.is(ev(p, mk([R(1, "Q1", 1)], { geb: geb })), true);
    T.is(ev(p, mk([R(1, "Q1", 1), R(2, "B1", 3, "Q3")], { geb: geb })), false);
    T.is(ev(p, mk([R(1, "Q1", 1), R(2, "B1", 4, "Q3")], { geb: geb })), true, "wissel pas na de gevraagde beurt");
  });
  t("scenario 'start-ankers': kuur zonder controle op dag 2-4 na de start en dosis vanaf dag 3", function () {
    var start = { start: "Q1" };
    var geenControle = { p: "niet", arg: { p: "opDagRelatief", K: K("O2"), anker: start, van: 2, tot: 4 } };
    var geenHalveren = { p: "niet", arg: { p: "opDagRelatief", K: K("V6", "Q1", "halveren"), anker: start, van: 3 } };
    var schend = { p: "en", args: [{ p: "gestart", middel: "Q1" }, { p: "of", args: [geenControle, geenHalveren] }] };
    var goed = [R(1, "Q1", 1), R(2, "O2", 3), R(3, "V6", 4, "Q1", "halveren")];
    T.is(ev(schend, mk(goed)), false);
    T.is(ev(schend, mk([R(1, "Q1", 1), R(2, "V6", 4, "Q1", "halveren")])), true, "geen O2");
    T.is(ev(schend, mk([R(1, "Q1", 1), R(2, "O2", 3)])), true, "geen halveren");
    T.is(ev(schend, mk([R(1, "Q1", 1), R(2, "O2", 6), R(3, "V6", 4, "Q1", "halveren")])), true, "O2 te laat");
    T.is(ev(schend, mk([R(1, "Q1", 1), R(2, "O2", 3), R(3, "V6", 3, "Q1", "halveren")])), true, "halveren op verschil 2 is te vroeg");
    T.is(ev(schend, mk([R(1, "B1", 1, "Q1"), R(2, "O2", 3), R(3, "V6", 4, "Q1", "halveren")])), false, "start via wissel (B1)");
    T.is(ev(schend, mk([])), false, "niet gestart");
  });
  t("scenario 'gelijktijdig medicijn bij start': V-kaart actief terwijl medicatie actief, zonder scheiding binnen 2 beurten", function () {
    var sch = { p: "en", args: [{ p: "gestart", middel: "Q1" }, { p: "medicatieActief", id: "m1", op: { naKaart: { start: "Q1" } } },
      { p: "niet", arg: { p: "binnenBeurtenNaKaart", K: K("B4", "Q1"), naKaart: { start: "Q1" }, n: 2 } },
      { p: "niet", arg: { p: "binnenBeurtenNaKaart", K: K("B3", "m1"), naKaart: { start: "Q1" }, n: 2 } }] };
    T.is(ev(sch, mk([R(1, "Q1", 1)])), true);
    T.is(ev(sch, mk([R(1, "Q1", 1), R(2, "B4", 2, "Q1")])), false, "B4 in de volgende beurt");
    T.is(ev(sch, mk([R(1, "Q1", 1), R(2, "B4", 3, "Q1")])), true, "B4 te laat");
    T.is(ev(sch, mk([R(1, "B3", 1, "m1"), R(2, "Q1", 1)])), false, "medicatie al gepauzeerd");
    T.is(ev(sch, mk([R(1, "Q1", 1), R(2, "B3", 1, "m1")])), false, "B3 in dezelfde beurt");
    T.is(ev(sch, mk([R(1, "B1", 1, "Q1")])), true, "start via wissel telt ook");
  });
  t("scenario 'status zonder verwijzing': klachten geenVerbetering48 en niet Ev3", function () {
    var sch = { p: "en", args: [{ p: "klachten", waarde: "geenVerbetering48" }, { p: "nietGespeeld", K: K("EV3") }] };
    T.is(ev(sch, mk([], { klachten: KL })), true);
    T.is(ev(sch, mk([R(1, "EV3", 4)], { klachten: KL })), false);
    T.is(ev(sch, mk([], { klachten: [{ dag: 1, status: null }] })), false);
  });
  t("scenario 'na een gebeurtenis een nieuw antibioticum zonder tussenliggende kweek'", function () {
    var geb = [{ id: "E", dag: 3, naVolg: 2 }];
    var nieuw = { p: "of", args: [{ p: "gespeeld", K: { kaartUit: "antibiotica", naGebeurtenis: "E" } }, { p: "gespeeld", K: { kaart: "B1", naGebeurtenis: "E" } }] };
    var voorKweek = { p: "of", args: [
      { p: "voor", a: { kaart: "KW", naGebeurtenis: "E" }, b: { kaartUit: "antibiotica", naGebeurtenis: "E" } },
      { p: "voor", a: { kaart: "KW", naGebeurtenis: "E" }, b: { kaart: "B1", naGebeurtenis: "E" } }] };
    var sch = { p: "en", args: [nieuw, { p: "niet", arg: voorKweek }] };
    T.is(ev(sch, mk([R(1, "Q1", 1), R(2, "B1", 3, "Q2")], { geb: geb })), true);
    T.is(ev(sch, mk([R(1, "Q1", 1), R(2, "KW", 3), R(3, "B1", 3, "Q2")], { geb: geb })), false);
    T.is(ev(sch, mk([R(1, "Q1", 1), R(2, "KW", 1), R(3, "B1", 3, "Q2")], { geb: geb })), true, "kweek vóór de gebeurtenis telt niet");
    T.is(ev(sch, mk([R(1, "Q1", 1)], { geb: geb })), false, "geen nieuw middel na de gebeurtenis");
  });
  t("scenario 'resistent actief en klachten aan, niet gewisseld/gestopt binnen 2 beurten'", function () {
    var gebdef = [{ id: "C", zet: { resistent: ["Q1"] } }];
    var geb = [{ id: "C", dag: 3, naVolg: 2 }];
    var kl = [{ dag: 1, status: null }, { dag: 2, status: "aan" }, { dag: 3, status: "aan" }, { dag: 4, status: "aan" }];
    var sch = { p: "en", args: [{ p: "gebeurtenisGeweest", id: "C" },
      { p: "actief", uitSet: "resistent", op: { eindeBeurtNaGebeurtenis: "C", offset: 0 } },
      { p: "klachten", waarde: "aan", op: { dag: 3 } },
      { p: "niet", arg: { p: "of", args: [{ p: "binnenBeurten", K: K("B1"), naGebeurtenis: "C", n: 2 }, { p: "binnenBeurten", K: K("B2"), naGebeurtenis: "C", n: 2 }] } }] };
    var basis = [R(1, "Q1", 1)];
    T.is(ev(sch, mk(basis, { gebdef: gebdef, geb: geb, klachten: kl })), true);
    T.is(ev(sch, mk(basis.concat([R(2, "B1", 4, "Q2")]), { gebdef: gebdef, geb: geb, klachten: kl })), false, "gewisseld op dag 4 (binnen 2 beurten)");
    T.is(ev(sch, mk(basis.concat([R(2, "B1", 5, "Q2")]), { gebdef: gebdef, geb: geb, klachten: kl })), true, "te laat");
  });

  /* ---------- ronde 2: typfouten, prototype-sleutels, sortering, rollen ---------- */
  function fouttekst(fn) { try { fn(); } catch (e) { return String(e.message); } return null; }
  function gooitNL(fn, deel, msg) {
    var m = fouttekst(fn);
    T.waar(m !== null, (msg || "") + " verwachtte een fout");
    T.waar(deel.test(m), (msg || "") + " foutttekst klopt niet: " + m);
  }
  var VOORBEELDEN = [
    // [naam, predicaat in de vorm uit PREDICATEN.md, kan een typfoutveld krijgen]
    { p: "gespeeld", K: { kaart: "X1" } }, { p: "gespeeld", kaart: "X1" },
    { p: "nietGespeeld", K: { kaart: "X1" } }, { p: "nietGespeeld", kaart: "X1" },
    { p: "voor", a: { kaart: "X1" }, b: { kaart: "X2" } }, { p: "na", a: { kaart: "X1" }, b: { kaart: "X2" } },
    { p: "binnenBeurten", K: { kaart: "X1" }, naGebeurtenis: "E", n: 2 },
    { p: "binnenBeurten", kaart: "X1", naGebeurtenis: "E", n: 2 },
    { p: "binnenBeurtenNaKaart", K: { kaart: "X2" }, naKaart: { start: "Q1" }, n: 2 },
    { p: "binnenBeurtenNaKaart", kaart: "X2", naKaart: { start: "Q1" }, n: 2 },
    { p: "opDagRelatief", K: { kaart: "X3" }, anker: { kaart: "X1" }, van: 2, tot: 4 },
    { p: "opDagRelatief", kaart: "X3", anker: { kaart: "X1" }, van: 2, tot: 4 },
    { p: "gestart", middel: "Q1" }, { p: "actief", middel: "Q1", op: { dag: 3 } },
    { p: "actief", uitSet: "resistent" },
    { p: "aantalActieveAntibiotica", op: ">", n: 1 }, { p: "medicatieActief", id: "m1", op: { dag: 2 } },
    { p: "waar", veld: "w", op: "<", waarde: 30 }, { p: "inToestand", t: "s1" },
    { p: "gebeurtenisGeweest", id: "E" }, { p: "klachten", waarde: "aan", op: { dag: 3 } },
    { p: "tel", teller: { t: "gespeeld", kaart: "X1" }, op: ">=", waarde: 2 },
    { p: "en", args: [{ p: "waarheid", waarde: true }] }, { p: "of", args: [{ p: "waarheid", waarde: false }] },
    { p: "niet", arg: { p: "waarheid", waarde: true } },
    { p: "alsDan", als: { p: "waarheid", waarde: true }, dan: { p: "waarheid", waarde: true } },
    { p: "waarheid", waarde: true }
  ];
  var CTX_E = { waar: { w: 5 }, toest: ["s1"], geb: [{ id: "E", dag: 2, naVolg: 1 }], gebdef: [{ id: "E" }, { id: "G", zet: { resistent: ["Q1"] } }] };
  t("typfouten: elk predicaat (plat én genest) met een onbekend veld geeft een Nederlandse fout", function () {
    VOORBEELDEN.forEach(function (v) {
      var ctx = mk([R(1, "X1", 1), R(2, "X2", 2)], CTX_E);
      ev(JSON.parse(JSON.stringify(v)), ctx);   // het voorbeeld zelf is geldig (geen fout)
      var fout = JSON.parse(JSON.stringify(v)); fout.typfoutveld = 1;
      gooitNL(function () { ev(fout, ctx); }, /Onbekend veld 'typfoutveld' in predicaat '/, JSON.stringify(v));
    });
  });
  t("typfouten: veelvoorkomende typefouten in de platte en geneste kaartverwijzing", function () {
    var c = mk([R(1, "V6", 1, "V5", "verdubbelen")], CTX_E);
    gooitNL(function () { ev({ p: "gespeeld", kaart: "V6", optiee: "halveren" }, c); }, /Onbekend veld 'optiee'/);
    gooitNL(function () { ev({ p: "gespeeld", K: { kaart: "V6", optiee: "halveren" } }, c); }, /Onbekend veld 'optiee'/);
    gooitNL(function () { ev({ p: "binnenBeurten", kaart: "A", naGebeurtenis: "E", nn: 2, n: 1 }, c); }, /Onbekend veld 'nn'/);
    gooitNL(function () { ev({ p: "waar", veld: "w", op: "<", waarde: 1, onzin: 1 }, c); }, /Onbekend veld 'onzin'/);
    gooitNL(function () { ev({ p: "voor", a: { kaart: "A" }, b: { kaart: "B", dooel: "x" } }, c); }, /Onbekend veld 'dooel'/);
    gooitNL(function () { ev({ p: "opDagRelatief", kaart: "A", anker: { kaart: "B" }, vna: 2 }, c); }, /Onbekend veld 'vna'/);
    gooitNL(function () { ev({ p: "gespeeld", k: { kaart: "V6" } }, c); }, /Onbekend veld 'k'/, "alias k bestaat niet");
  });
  t("typfouten: ook diep in en/of/niet/alsDan, in tellers en in het moment 'op'", function () {
    var c = mk([R(1, "X1", 1)], CTX_E);
    var slecht = { p: "gespeeld", kaart: "X1", optiee: "a" };
    gooitNL(function () { ev({ p: "en", args: [{ p: "waarheid", waarde: true }, slecht] }, c); }, /Onbekend veld 'optiee'/);
    gooitNL(function () { ev({ p: "niet", arg: { p: "of", args: [slecht] } }, c); }, /Onbekend veld/);
    gooitNL(function () { ev({ p: "alsDan", als: { p: "waarheid", waarde: false }, dan: slecht }, c); }, /Onbekend veld/, "ook als de tak niet nodig is");
    gooitNL(function () { ev({ p: "of", args: [{ p: "waarheid", waarde: true }, slecht] }, c); }, /Onbekend veld/, "of kortsluit niet");
    gooitNL(function () { ev({ p: "en", args: [{ p: "waarheid", waarde: false }, slecht] }, c); }, /Onbekend veld/, "en kortsluit niet");
  });
  t("typfouten: tellers en moment 'op' controleren hun velden", function () {
    var c = mk([R(1, "X1", 1)], CTX_E);
    gooitNL(function () { P.tel({ t: "gespeeld", kaart: "X1", terwijlKlachtn: "af" }, c); }, /Onbekend veld 'terwijlKlachtn' in teller 'gespeeld'/);
    gooitNL(function () { P.tel({ t: "aantalActieveAntibiotica", op: "max", n: 1 }, c); }, /Onbekend veld 'n' in teller/);
    gooitNL(function () { ev({ p: "actief", middel: "Q1", op: { dagg: 2 } }, c); }, /Onbekend veld 'dagg' in moment/);
    gooitNL(function () { ev({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E", ofset: 1 } }, c); }, /Onbekend veld 'ofset'/);
    gooitNL(function () { ev({ p: "klachten", waarde: "aan", op: { eindeBeurtNaGebeurtenis: "E", ofset: 1 } }, c); }, /Onbekend veld 'ofset'/);
    gooitNL(function () { ev({ p: "medicatieActief", id: "m1", op: { naKaart: { kaart: "X1", doell: "d" } } }, c); }, /Onbekend veld 'doell'/);
  });
  t("typfouten: K en losse kaartvelden tegelijk is verwarrend en geeft een fout; TODO_BART-sleutels worden genegeerd", function () {
    var c = mk([R(1, "X1", 1)], CTX_E);
    gooitNL(function () { ev({ p: "gespeeld", K: { kaart: "X1" }, doel: "d" }, c); }, /kies één vorm/);
    T.is(ev({ p: "gespeeld", kaart: "X1", TODO_BART: "vraag" }, c), true);
    T.is(ev({ p: "gespeeld", K: { kaart: "X1", TODO_BART: "vraag" } }, c), true);
    // binnenBeurten: naGebeurtenis naast een geneste K is de normale vorm
    T.is(ev({ p: "binnenBeurten", K: { kaart: "X1" }, naGebeurtenis: "E", n: 2 }, mk([R(1, "X1", 2)], CTX_E)), true);
  });
  t("uitSet: prototype-sleutels en onbekende sets geven een fout (geen stille false)", function () {
    var c = mk([R(1, "Q1", 1)], CTX_E);
    ["toString", "constructor", "__proto__", "hasOwnProperty", "valueOf", "bestaatNiet"].forEach(function (naam) {
      gooitNL(function () { ev({ p: "actief", uitSet: naam }, c); }, /Onbekende set '/, naam);
    });
    gooitNL(function () { ev({ p: "actief", uitSet: 5 }, c); }, /naam van een set/);
    T.is(ev({ p: "actief", uitSet: "resistent" }, c), false, "bekende set zonder gebeurtenis: leeg");
    T.is(ev({ p: "actief", uitSet: "resistent" }, mk([R(1, "Q1", 1)], { geb: [{ id: "G", dag: 1 }], gebdef: CTX_E.gebdef })), true);
  });
  t("uitSet: een set-naam die ook een prototype-sleutel is, werkt alleen als de data hem echt bevat", function () {
    var ep = { id: "EX", antibiotica: ["Q1"], patient: { waar: {}, medicatie: MEDICATIE } };
    Object.defineProperty(ep, "toString", { value: ["Q1"], enumerable: true });
    var c2 = P.maakContext({ rollen: ROLLEN }, ep, { tijdlijn: [R(1, "Q1", 1)] });
    T.is(ev({ p: "actief", uitSet: "toString" }, c2), true, "eigen sleutel is wel geldig");
  });
  t("kaartUit: prototype-sleutels en onbekende lijsten geven een fout", function () {
    var c = mk([R(1, "Q1", 1)]);
    ["toString", "constructor", "bestaatNiet"].forEach(function (naam) {
      gooitNL(function () { ev({ p: "gespeeld", K: { kaartUit: naam } }, c); }, /Onbekende set '/, naam);
    });
  });
  t("medicatieActief: onbekend medicatie-id of ontbrekende medicatielijst geeft een fout", function () {
    var c = mk([]);
    gooitNL(function () { ev({ p: "medicatieActief", id: "bestaatNiet" }, c); }, /Onbekende medicatie 'bestaatNiet'/);
    gooitNL(function () { ev({ p: "medicatieActief", id: "toString" }, c); }, /Onbekende medicatie/);
    gooitNL(function () { ev({ p: "medicatieActief", id: "m1", op: { dag: 1 } }, mk([], { medicatie: [{ id: "andere", label: "x" }] })); }, /Onbekende medicatie 'm1'/);
    T.is(ev({ p: "medicatieActief", id: "andere" }, mk([], { medicatie: [{ id: "andere", label: "x" }] })), true);
    T.is(ev({ p: "medicatieActief", id: "s" }, mk([], { medicatie: ["s"] })), true, "ook een lijst met alleen ids");
    var ep = { id: "Z", antibiotica: [], patient: { waar: {} } };
    gooitNL(function () { ev({ p: "medicatieActief", id: "m1" }, P.maakContext({ rollen: ROLLEN }, ep, {})); }, /geen lijst 'patient.medicatie'/);
  });
  t("waar met ==, = en != (en alle andere operatoren): onbekend veld of prototype-sleutel is een fout", function () {
    var c = mk([], { waar: { w: 5, tekst: "a" } });
    ["==", "=", "!=", "<", "<=", ">", ">="].forEach(function (op) {
      ["onbekend", "toString", "constructor", "__proto__", "hasOwnProperty"].forEach(function (veld) {
        gooitNL(function () { ev({ p: "waar", veld: veld, op: op, waarde: 5 }, c); }, /staat niet in de ware waarden/, op + " " + veld);
      });
    });
    T.is(ev({ p: "waar", veld: "w", op: "==", waarde: 5 }, c), true);
    T.is(ev({ p: "waar", veld: "w", op: "!=", waarde: 5 }, c), false);
    T.is(ev({ p: "waar", veld: "tekst", op: "=", waarde: "a" }, c), true);
    T.is(ev({ p: "waar", veld: "tekst", op: "!=", waarde: "b" }, c), true);
    gooitNL(function () { ev({ p: "waar", veld: "w", op: "~", waarde: 5 }, c); }, /Onbekende vergelijkingsoperator/);
  });
  t("sortering op volg: een ongesorteerde tijdlijn geeft hetzelfde als de gesorteerde", function () {
    // actief: stoppen (volg 2) staat eerst in de lijst, maar komt ná het starten
    T.is(ev({ p: "actief", middel: "Q1" }, mk([R(2, "B2", 1, "Q1"), R(1, "Q1", 1)])), false, "gestopt na de start");
    T.is(ev({ p: "actief", middel: "Q1" }, mk([R(1, "Q1", 1), R(2, "B2", 1, "Q1")])), false);
    T.is(ev({ p: "actief", middel: "Q1" }, mk([R(3, "Q1", 2), R(2, "B2", 1, "Q1"), R(1, "Q1", 1)])), true, "opnieuw gestart op volg 3");
    // voor/na met dubbele match: de eerste op volg telt, niet de eerste in de lijst
    var dub = [R(3, "A", 2), R(1, "A", 1), R(2, "B", 1)];
    T.is(ev({ p: "voor", a: K("A"), b: K("B") }, mk(dub)), true);
    T.is(ev({ p: "na", a: K("A"), b: K("B") }, mk(dub)), false);
    // aantalActieveAntibiotica: wissel (volg 2) vóór de start (volg 1) in de lijst
    var wis = [R(2, "B1", 1, "Q2"), R(1, "Q1", 1)];
    T.is(P.tel({ t: "aantalActieveAntibiotica", op: "max" }, mk(wis)), 1, "Q1 wordt vervangen, nooit twee");
    T.is(ev({ p: "actief", middel: "Q1" }, mk(wis)), false);
    T.is(ev({ p: "actief", middel: "Q2" }, mk(wis)), true);
    // moment naKaart: de eerste match op volg
    T.is(ev({ p: "medicatieActief", id: "m1", op: { naKaart: K("A") } }, mk([R(2, "B3", 1, "m1"), R(1, "A", 1)])), true, "pauzeren komt na A");
    // binnenBeurtenNaKaart: anker is de eerste match op volg
    T.is(ev({ p: "binnenBeurtenNaKaart", K: K("X"), naKaart: K("A"), n: 1 }, mk([R(3, "A", 5), R(1, "A", 1), R(2, "X", 1)])), true);
    // wissel vóór de start in de tijdlijn: B1 telt niet als start van een later gespeeld middel
    T.is(ev({ p: "gestart", middel: "Q2" }, mk([R(2, "B1", 1, "Q2"), R(1, "Q1", 1)])), true);
  });
  t("gebeurtenis-dag: bij dubbele gebeurtenis-id telt de eerste in ctx.gebeurtenissen", function () {
    var geb = [{ id: "E", dag: 2, naVolg: 1 }, { id: "E", dag: 5, naVolg: 3 }];
    T.is(ev({ p: "binnenBeurten", K: K("X"), naGebeurtenis: "E", n: 1 }, mk([R(1, "X", 2)], { geb: geb })), true);
    T.is(ev({ p: "binnenBeurten", K: K("X"), naGebeurtenis: "E", n: 1 }, mk([R(1, "X", 5)], { geb: geb })), false);
    T.is(ev({ p: "klachten", waarde: "af", op: { eindeBeurtNaGebeurtenis: "E", offset: 0 } },
      mk([], { geb: geb, klachten: [{ dag: 2, status: "af" }, { dag: 5, status: "aan" }] })), true);
  });
  t("rollen: zonder casus.rollen of met een ontbrekende rol volgt een Nederlandse fout (geen standaard kaart-id's)", function () {
    var zonder = mk([R(1, "Q1", 1)], { zonderRollen: true });
    gooitNL(function () { ev({ p: "actief", middel: "Q1" }, zonder); }, /casus mist 'rollen'/);
    gooitNL(function () { ev({ p: "gestart", middel: "Q1" }, zonder); }, /casus mist 'rollen'/);
    gooitNL(function () { ev({ p: "medicatieActief", id: "m1" }, zonder); }, /casus mist 'rollen'/);
    gooitNL(function () { ev({ p: "aantalActieveAntibiotica", op: ">", n: 1 }, zonder); }, /casus mist 'rollen'/);
    gooitNL(function () { P.tel({ t: "aantalActieveAntibiotica", op: "max" }, zonder); }, /casus mist 'rollen'/);
    gooitNL(function () { ev({ p: "gespeeld", K: { start: "Q1" } }, zonder); }, /casus mist 'rollen'/);
    ["wissel", "stop", "pauzeer", "hervat"].forEach(function (n) {
      var r = { wissel: "W", stop: "S", pauzeer: "P", hervat: "H" }; delete r[n];
      gooitNL(function () { ev({ p: "actief", middel: "Q1" }, mk([R(1, "Q1", 1)], { rollen: r })); }, new RegExp("rollen\\." + n), n);
    });
    var leeg = mk([R(1, "Q1", 1)], { rollen: { wissel: "", stop: "S", pauzeer: "P", hervat: "H" } });
    gooitNL(function () { ev({ p: "actief", middel: "Q1" }, leeg); }, /rollen\.wissel/);
  });
  t("rollen: predicaten die de rollen niet nodig hebben, werken ook zonder casus.rollen", function () {
    var zonder = mk([R(1, "Q1", 1), R(2, "X", 2)], { zonderRollen: true, geb: [{ id: "E", dag: 1 }], waar: { w: 1 }, toest: ["s"] });
    T.is(ev({ p: "gespeeld", kaart: "X" }, zonder), true);
    T.is(ev({ p: "voor", a: K("Q1"), b: K("X") }, zonder), true);
    T.is(ev({ p: "waar", veld: "w", op: "==", waarde: 1 }, zonder), true);
    T.is(ev({ p: "inToestand", t: "s" }, zonder), true);
    T.is(P.tel({ t: "gespeeld", kaart: "X" }, zonder), 1);
  });


  /* ---------- ronde 3: eager validatie, onafhankelijk van de spelstand ---------- */
  var GD = [{ id: "E" }, { id: "G", zet: { resistent: ["Q1"] } }];            // E en G zijn bekend, maar nog niet geweest
  function leeg(o) { o = o || {}; o.gebdef = GD; return mk([], o); }
  function eenRegel(o) { o = o || {}; o.gebdef = GD; return mk([R(1, "Z", 1)], o); }
  // Elk van deze predicaten bevat een fout in de data. De fout moet ALTIJD komen: bij lege tijdlijn, bij
  // een tijdlijn die er niet op matcht en als de gebeurtenis of het anker er niet is.
  var DATAFOUTEN = [
    [{ p: "gespeeld", kaartUit: "typo" }, /Onbekende set 'typo'/],
    [{ p: "gespeeld", K: { kaart: "Z", kaartUit: "typo" } }, /Onbekende set 'typo'/],
    [{ p: "nietGespeeld", kaartUit: "toString" }, /Onbekende set 'toString'/],
    [{ p: "gespeeld", kaartUit: "constructor" }, /Onbekende set 'constructor'/],
    [{ p: "gespeeld", kaartUit: "__proto__" }, /Onbekende set/],
    [{ p: "gespeeld", kaartUit: "sets" }, /Onbekende set 'sets'/],     // bestaat wel, maar is geen lijst
    [{ p: "voor", a: { kaartUit: "typo" }, b: { kaart: "Z" } }, /Onbekende set/],
    [{ p: "na", a: { kaart: "Z" }, b: { kaartUit: "typo" } }, /Onbekende set/],
    [{ p: "opDagRelatief", K: { kaart: "Z" }, anker: { kaart: "X9" }, van: 0 }, null],  // geldig: anker bestaat niet, geen fout
    [{ p: "opDagRelatief", K: { kaartUit: "typo" }, anker: { kaart: "X9" }, van: 0 }, /Onbekende set 'typo'/],
    [{ p: "opDagRelatief", K: { kaart: "Z" }, anker: { kaartUit: "typo" }, van: 0 }, /Onbekende set 'typo'/],
    [{ p: "opDagRelatief", K: { kaart: "Z" }, anker: { kaart: "X9" }, van: "0" }, /'van' moet een getal/],
    [{ p: "opDagRelatief", K: { kaart: "Z" }, anker: { kaart: "X9" }, van: 0, tot: "3" }, /'tot' moet een getal/],
    [{ p: "binnenBeurtenNaKaart", K: { kaartUit: "typo" }, naKaart: { kaart: "X9" }, n: 2 }, /Onbekende set 'typo'/],
    [{ p: "binnenBeurtenNaKaart", K: { kaart: "Z" }, naKaart: { kaartUit: "typo" }, n: 2 }, /Onbekende set 'typo'/],
    [{ p: "binnenBeurten", K: { kaartUit: "typo" }, naGebeurtenis: "E", n: 2 }, /Onbekende set 'typo'/],
    [{ p: "binnenBeurten", kaart: "Z", naGebeurtenis: "E", n: "2" }, /'n' moet een getal/],
    [{ p: "binnenBeurten", kaart: "Z", naGebeurtenis: "Nooit", n: 2 }, /Onbekende gebeurtenis 'Nooit'/],
    [{ p: "gespeeld", start: "Q1" }, /casus mist 'rollen'/, true],
    [{ p: "gespeeld", K: { kaart: "Z", start: "Q1" } }, /casus mist 'rollen'/, true],
    [{ p: "gestart", middel: "Q1" }, /casus mist 'rollen'/, true],
    [{ p: "gestart", middel: 5 }, /'middel' moet een id/],
    [{ p: "binnenBeurtenNaKaart", K: { kaart: "Z" }, naKaart: { start: "Q1" }, n: 1 }, /casus mist 'rollen'/, true],
    [{ p: "actief", middel: "Q1" }, /casus mist 'rollen'/, true],
    [{ p: "actief", uitSet: "resistant", op: { eindeBeurtNaGebeurtenis: "E" } }, /Onbekende set 'resistant'/],
    [{ p: "actief", uitSet: "toString", op: { eindeBeurtNaGebeurtenis: "E" } }, /Onbekende set 'toString'/],
    [{ p: "actief", uitSet: "constructor" }, /Onbekende set 'constructor'/],
    [{ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E", offset: "1" } }, /'offset' moet een getal/],
    [{ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E", offset: NaN } }, /'offset' moet een getal/],
    [{ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "Nooit" } }, /Onbekende gebeurtenis 'Nooit'/],
    [{ p: "actief", middel: "Q1", op: { dag: "3" } }, /'op.dag' moet een getal/],
    [{ p: "actief", middel: "Q1", op: { naKaart: { kaartUit: "typo" } } }, /Onbekende set 'typo'/],
    [{ p: "actief", middel: "Q1", op: { naKaart: { kaart: "Z", start: "Q1" } } }, /casus mist 'rollen'/, true],
    [{ p: "actief", middel: "Q1", op: { dag: 2, eindeBeurtNaGebeurtenis: "E" } }, /Kies precies één/],
    [{ p: "actief", middel: "Q1", op: { offset: 1 } }, /Kies precies één|Onbekend moment/],
    [{ p: "actief", middel: "Q1", op: { dag: 2, offset: 1 } }, /'offset' hoort alleen bij/],
    [{ p: "actief", middel: "Q1", op: "laatste" }, /Onbekend moment/],
    [{ p: "actief", middel: "N1" }, /geen antibioticum/],
    [{ p: "actief", middel: ["Q1", "N1"] }, /geen antibioticum/],
    [{ p: "medicatieActief", id: "m1", op: { eindeBeurtNaGebeurtenis: "E", offset: "1" } }, /'offset' moet een getal/],
    [{ p: "medicatieActief", id: "onbekend", op: { eindeBeurtNaGebeurtenis: "E" } }, /Onbekende medicatie/],
    [{ p: "medicatieActief", id: "m1", op: { eindeBeurtNaGebeurtenis: "Nooit" } }, /Onbekende gebeurtenis/],
    [{ p: "medicatieActief", id: "m1" }, /casus mist 'rollen'/, true],
    [{ p: "aantalActieveAntibiotica", op: "~", n: 1 }, /Onbekende vergelijkingsoperator/],
    [{ p: "aantalActieveAntibiotica", op: ">", n: "1" }, /'n' moet een getal/],
    [{ p: "waar", veld: "w", op: "<", waarde: "30" }, /vergelijkt alleen getallen/],
    [{ p: "waar", veld: "tekst", op: ">", waarde: 3 }, /vergelijkt alleen getallen/],
    [{ p: "gebeurtenisGeweest", id: "Nooit" }, /Onbekende gebeurtenis 'Nooit'/],
    [{ p: "inToestand", t: 5 }, /'t' moet een toestand-id/],
    [{ p: "klachten", waarde: "aan", op: { eindeBeurtNaGebeurtenis: "E", offset: "1" } }, /'offset' moet een getal/],
    [{ p: "klachten", waarde: "aan", op: { eindeBeurtNaGebeurtenis: "Nooit" } }, /Onbekende gebeurtenis/],
    [{ p: "klachten", waarde: "aan", op: { dag: "1" } }, /'op.dag' moet een getal/],
    [{ p: "klachten", waarde: "aan", op: { dag: 1, offset: 1 } }, /'offset' hoort alleen bij/],
    [{ p: "klachten", waarde: "aan", op: "gisteren" }, /Onbekend moment/],
    [{ p: "tel", teller: { t: "gespeeld", kaartUit: "typo" }, op: ">", waarde: 1 }, /Onbekende set 'typo'/],
    [{ p: "tel", teller: { t: "gespeeld", start: "Q1" }, op: ">", waarde: 1 }, /casus mist 'rollen'/, true],
    [{ p: "tel", teller: { t: "gespeeld", kaart: "Z" }, op: ">", waarde: "1" }, /'waarde' moet een getal/],
    [{ p: "tel", teller: { t: "aantalActieveAntibiotica", op: "max" }, op: ">", waarde: 1 }, /casus mist 'rollen'/, true],
    [{ p: "kaartUit" }, /Onbekend predicaat/]
  ];
  function ctxVoor(zonderRollen, kind) {
    var o = { waar: { w: 5, tekst: "x" }, zonderRollen: zonderRollen, extra: { sets: "geen lijst" } };
    return kind === "leeg" ? leeg(o) : eenRegel(o);
  }
  t("eager validatie: een datafout geeft ALTIJD een fout, ook bij lege tijdlijn of als gebeurtenis/anker er niet is", function () {
    DATAFOUTEN.forEach(function (d) {
      var zr = d[2] === true;
      ["leeg", "regel"].forEach(function (kind) {
        var ctx = ctxVoor(zr, kind), naam = JSON.stringify(d[0]) + " (" + kind + ")";
        if (d[1] === null) { ev(d[0], ctx); return; }
        gooitNL(function () { ev(d[0], ctx); }, d[1], naam);
        // en dezelfde fout als de fout diep in een niet-bereikte tak zit
        gooitNL(function () { ev({ p: "en", args: [{ p: "waarheid", waarde: false }, { p: "niet", arg: d[0] }] }, ctx); }, d[1], "diep " + naam);
        gooitNL(function () { ev({ p: "alsDan", als: { p: "waarheid", waarde: false }, dan: d[0] }, ctx); }, d[1], "alsDan " + naam);
        gooitNL(function () { P.valideer(d[0], ctx); }, d[1], "valideer " + naam);
      });
    });
  });
  t("eager validatie: de fout hangt niet af van de spelstand (voor en na de gebeurtenis geeft dezelfde fout)", function () {
    var p = { p: "actief", uitSet: "resistant", op: { eindeBeurtNaGebeurtenis: "E" } };
    var voor = leeg({}), na = mk([R(1, "Q1", 1)], { gebdef: GD, geb: [{ id: "E", dag: 1 }] });
    gooitNL(function () { ev(p, voor); }, /Onbekende set 'resistant'/, "voor E");
    gooitNL(function () { ev(p, na); }, /Onbekende set 'resistant'/, "na E");
    var q = { p: "medicatieActief", id: "m1", op: { eindeBeurtNaGebeurtenis: "E", offset: "1" } };
    gooitNL(function () { ev(q, voor); }, /'offset'/, "voor E");
    gooitNL(function () { ev(q, na); }, /'offset'/, "na E");
  });
  t("eager validatie: geldige predicaten geven geen fout bij lege tijdlijn (en de juiste waarde)", function () {
    var c = leeg({ waar: { w: 5 } });
    T.is(ev({ p: "gespeeld", kaartUit: "antibiotica" }, c), false);
    T.is(ev({ p: "gestart", middel: "Q1" }, c), false);
    T.is(ev({ p: "actief", uitSet: "resistent", op: { eindeBeurtNaGebeurtenis: "E", offset: 1 } }, c), false);
    T.is(ev({ p: "opDagRelatief", kaart: "Z", anker: { kaartUit: "antibiotica" }, van: 0 }, c), false);
    T.is(ev({ p: "binnenBeurten", kaart: "Z", naGebeurtenis: "E", n: 2 }, c), false);
    T.is(ev({ p: "medicatieActief", id: "m1", op: { eindeBeurtNaGebeurtenis: "G" } }, c), false);
  });
  t("valideer: werkt met ctx, met (casus, episode-id) en met (casus, episode-object); zonder spelstand", function () {
    var ep = { id: "EX", antibiotica: ["Q1"], patient: { waar: { w: 1 }, medicatie: ["m1"] }, gebeurtenissen: [{ id: "E" }] };
    var casus = { rollen: ROLLEN, episodes: [ep] };
    P.valideer({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E", offset: 1 } }, casus, "EX");
    P.valideer({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E", offset: 1 } }, casus, ep);
    P.valideer({ p: "gespeeld", kaartUit: "antibiotica" }, mk([], {}));
    T.is(P.valideer({ p: "waarheid", waarde: true }, casus, ep), undefined);
    gooitNL(function () { P.valideer({ p: "gespeeld", kaartUit: "typo" }, casus, "EX"); }, /Onbekende set 'typo'/);
    gooitNL(function () { P.valideer({ p: "gespeeld", kaartUit: "typo" }, casus, ep); }, /Onbekende set 'typo'/);
    gooitNL(function () { P.valideer({ p: "gespeeld", kaartUit: "antibiotica" }, casus, "NEE"); }, /Onbekende episode/);
    gooitNL(function () { P.valideer({ p: "gestart", middel: "Q1" }, { episodes: [ep] }, "EX"); }, /casus mist 'rollen'/);
    // een teller (object met 't') wordt ook gevalideerd
    P.valideer({ t: "gespeeld", kaart: "Q1" }, casus, "EX");
    gooitNL(function () { P.valideer({ t: "gespeeld", kaartUit: "typo" }, casus, "EX"); }, /Onbekende set 'typo'/);
    gooitNL(function () { P.valideer({ t: "onbekend" }, casus, "EX"); }, /Onbekende teller/);
    gooitNL(function () { P.valideer({ t: "aantalActieveAntibiotica", op: "min" }, casus, "EX"); }, /kent alleen op/);
    gooitNL(function () { P.valideer({ p: "en", args: [{ p: "waarheid", waarde: true }, { p: "gespeeld" }] }, casus, "EX"); }, /mist het veld 'K'|kaartverwijzing/);
    T.waar(typeof P.valideer === "function");
  });
  t("valideer: een casus zonder gebeurtenis-definities laat gebeurtenis-id's door (alleen een gevulde lijst wordt gecontroleerd)", function () {
    var ep = { id: "EX", antibiotica: ["Q1"], patient: { waar: {}, medicatie: [] } };
    P.valideer({ p: "gebeurtenisGeweest", id: "wat-dan-ook" }, { rollen: ROLLEN, episodes: [ep] }, "EX");
  });

  /* ---------- ronde 3: ongebeurde gebeurtenis, predicaatnamen, n, ==, niet-antibiotica ---------- */
  t("actief/medicatieActief met eindeBeurtNaGebeurtenis: gebeurtenis nog niet geweest = false (niet de eindstand)", function () {
    var tl = [R(1, "Q1", 1), R(2, "B3", 1, "m1")];
    var voor = mk(tl, { gebdef: GD }), na = mk(tl, { gebdef: GD, geb: [{ id: "E", dag: 1 }] });
    var a = { p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E" } };
    T.is(ev(a, voor), false, "Q1 is actief in de eindstand, maar E is niet geweest");
    T.is(ev(a, na), true);
    T.is(ev({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E", offset: 2 } }, voor), false);
    T.is(ev({ p: "actief", op: { eindeBeurtNaGebeurtenis: "E" } }, voor), false, "zonder middel ook false");
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "resistent", op: { eindeBeurtNaGebeurtenis: "E" } }, voor), false);
    var m = { p: "medicatieActief", id: "m1", op: { eindeBeurtNaGebeurtenis: "E" } };
    T.is(ev({ p: "medicatieActief", id: "m1" }, voor), false, "gepauzeerd in de eindstand");
    T.is(ev({ p: "medicatieActief", id: "m2", op: { eindeBeurtNaGebeurtenis: "E" } }, voor), false, "m2 is nooit gepauzeerd, maar E is niet geweest");
    T.is(ev(m, voor), false);
    T.is(ev(m, na), false, "na E is m1 gepauzeerd");
    T.is(ev({ p: "medicatieActief", id: "m2", op: { eindeBeurtNaGebeurtenis: "E" } }, na), true);
    // naKaart die niet gespeeld is: ook false
    T.is(ev({ p: "actief", middel: "Q1", op: { naKaart: { kaart: "Nooit" } } }, voor), false);
    T.is(ev({ p: "medicatieActief", id: "m2", op: { naKaart: { kaart: "Nooit" } } }, voor), false);
  });
  t("predicaatnaam toString/constructor/__proto__/hasOwnProperty/valueOf: Onbekend predicaat (evalueer én valideer)", function () {
    var c = mk([R(1, "X", 1)]);
    ["toString", "constructor", "__proto__", "hasOwnProperty", "valueOf", "isPrototypeOf"].forEach(function (n) {
      gooitNL(function () { ev({ p: n }, c); }, new RegExp("Onbekend predicaat '" + n + "'"), n);
      gooitNL(function () { P.valideer({ p: n }, c); }, new RegExp("Onbekend predicaat '" + n + "'"), "valideer " + n);
      gooitNL(function () { ev({ p: "niet", arg: { p: n } }, c); }, /Onbekend predicaat/, "genest " + n);
    });
    // zelfde voor tellers
    ["toString", "constructor", "__proto__"].forEach(function (n) {
      gooitNL(function () { P.tel({ t: n }, c); }, /Onbekende teller/, n);
    });
    T.gelijk(P.namen.indexOf("toString"), -1);
  });
  t("binnenBeurtenNaKaart: n moet een getal zijn (string, NaN, Infinity, ontbrekend), zoals bij binnenBeurten", function () {
    var c = mk([R(1, "A", 1), R(2, "X", 2)]);
    var basis = { p: "binnenBeurtenNaKaart", K: { kaart: "X" }, naKaart: { kaart: "A" } };
    function met(n) { var q = JSON.parse(JSON.stringify(basis)); if (n !== undefined) q.n = n; return q; }
    T.is(ev(met(2), c), true); T.is(ev(met(1), c), false);
    gooitNL(function () { ev(met("2"), c); }, /'n' moet een getal/, "string");
    gooitNL(function () { ev(met(NaN), c); }, /'n' moet een getal/, "NaN");
    gooitNL(function () { ev(met(Infinity), c); }, /'n' moet een getal/, "Infinity");
    gooitNL(function () { ev(met(null), c); }, /'n' moet een getal/, "null");
    gooitNL(function () { ev(met(), c); }, /mist het veld 'n'/, "ontbreekt");
    // ook als het anker er niet is
    gooitNL(function () { ev({ p: "binnenBeurtenNaKaart", K: { kaart: "X" }, naKaart: { kaart: "Nooit" }, n: "2" }, c); }, /'n' moet een getal/, "zonder anker");
    gooitNL(function () { ev({ p: "binnenBeurten", K: { kaart: "X" }, naGebeurtenis: "E", n: "2" }, mk([], { geb: [] })); }, /'n' moet een getal/, "binnenBeurten zonder gebeurtenis");
  });
  t("waar: == en = vergelijken strikt (string tegen getal, true tegen 1, null tegen 0), != is het omgekeerde", function () {
    var c = mk([], { waar: { w: 5, b: true, nul: 0, s: "5" } });
    T.is(ev({ p: "waar", veld: "w", op: "==", waarde: "5" }, c), false);
    T.is(ev({ p: "waar", veld: "w", op: "=", waarde: "5" }, c), false);
    T.is(ev({ p: "waar", veld: "w", op: "!=", waarde: "5" }, c), true);
    T.is(ev({ p: "waar", veld: "s", op: "==", waarde: 5 }, c), false);
    T.is(ev({ p: "waar", veld: "s", op: "==", waarde: "5" }, c), true);
    T.is(ev({ p: "waar", veld: "b", op: "==", waarde: 1 }, c), false);
    T.is(ev({ p: "waar", veld: "b", op: "==", waarde: true }, c), true);
    T.is(ev({ p: "waar", veld: "b", op: "!=", waarde: 1 }, c), true);
    T.is(ev({ p: "waar", veld: "nul", op: "==", waarde: false }, c), false);
    T.is(ev({ p: "waar", veld: "nul", op: "==", waarde: null }, c), false);
    T.is(ev({ p: "waar", veld: "w", op: "==", waarde: 5 }, c), true);
    T.is(ev({ p: "waar", veld: "w", op: "=", waarde: 5 }, c), true);
    T.is(ev({ p: "waar", veld: "w", op: "!=", waarde: 5 }, c), false);
    // ook de teller-vergelijking in 'tel'
    T.is(ev({ p: "tel", teller: { t: "gespeeld", kaart: "Z" }, op: "==", waarde: 0 }, c), true);
  });
  t("actief en tellers gelden alleen voor antibiotica: een kaart zonder doel buiten episode.antibiotica wordt nooit actief", function () {
    var c = mk([R(1, "N1", 1), R(2, "Q1", 1)]);
    T.is(ev({ p: "actief", middel: "Q1" }, c), true);
    gooitNL(function () { ev({ p: "actief", middel: "N1" }, c); }, /geen antibioticum/, "N1 is gespeeld maar geen antibioticum");
    gooitNL(function () { ev({ p: "actief", middel: "N1" }, mk([])); }, /geen antibioticum/, "ook zonder N1 gespeeld");
    T.is(ev({ p: "actief" }, mk([R(1, "N1", 1)])), false, "zonder middel: alleen antibiotica tellen");
    T.is(ev({ p: "aantalActieveAntibiotica", op: ">=", n: 1 }, mk([R(1, "N1", 1), R(2, "N2", 1)])), false);
    T.is(P.tel({ t: "aantalActieveAntibiotica", op: "max" }, mk([R(1, "N1", 1), R(2, "Q1", 1)])), 1);
    // een wissel naar een niet-antibioticum maakt dat niet actief voor 'actief' (het wist wel de lopende antibiotica)
    var w = mk([R(1, "Q1", 1), R(2, "B1", 2, "N1")]);
    T.is(ev({ p: "actief", middel: "Q1" }, w), false);
    T.is(ev({ p: "actief" }, w), false);
    T.is(P.tel({ t: "aantalActieveAntibiotica", op: "max" }, w), 1);
    // regel zonder doel: een antibioticum blijft actief bij andere kaarten
    T.is(P.tel({ t: "aantalActieveAntibiotica", op: "max" }, mk([R(1, "Q1", 1), R(2, "Q2", 1), R(3, "N1", 1)])), 2);
  });


  /* ---------- ronde 3: restgaten uit de mutatieset ---------- */
  t("uitSet: een set die alleen via de 'zet' van een gebeurtenisdefinitie bestaat is bekend; een andere naam niet", function () {
    var c = mk([R(1, "Q1", 1)], { gebdef: [{ id: "G", zet: { gewijzigd: ["Q1"] } }, null], geb: [{ id: "G", dag: 1 }] });
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "gewijzigd" }, c), true);
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "gewijzigd", op: { dag: 0 } }, c), false);
    gooitNL(function () { ev({ p: "actief", middel: "Q1", uitSet: "andere" }, c); }, /Onbekende set 'andere'/);
    var zonder = mk([R(1, "Q1", 1)], { gebdef: [{ id: "G", zet: {} }, { id: "H" }] });
    gooitNL(function () { ev({ p: "actief", middel: "Q1", uitSet: "gewijzigd" }, zonder); }, /Onbekende set/);
    // basis uit waar[naam] of episode[naam]
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "lijstje" }, mk([R(1, "Q1", 1)], { waar: { lijstje: ["Q1"] } })), true);
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "lijstje" }, mk([R(1, "Q1", 1)], { extra: { lijstje: ["Q2"] } })), false);
    gooitNL(function () { ev({ p: "actief", middel: "Q1", uitSet: "" }, c); }, /moet de naam van een set zijn/);
    gooitNL(function () { ev({ p: "actief", middel: "Q1", uitSet: 5 }, c); }, /moet de naam van een set zijn/);
  });
  t("kaartverwijzing: typen van kaart, doel, optie, optieNiet, naGebeurtenis en voorGebeurtenis worden eager gecontroleerd", function () {
    var c = leeg({});
    gooitNL(function () { ev({ p: "gespeeld", kaart: 5 }, c); }, /'kaart' moet een id/);
    gooitNL(function () { ev({ p: "gespeeld", kaart: ["Z", 5] }, c); }, /'kaart' moet een id/);
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Z", doel: 5 }, c); }, /'doel' moet een id/);
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Z", optie: 5 }, c); }, /'optie' moet een tekst/);
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Z", optieNiet: [5] }, c); }, /'optieNiet' moet een id/);
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Z", naGebeurtenis: "Nooit" }, c); }, /Onbekende gebeurtenis 'Nooit' in 'naGebeurtenis'/);
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Z", naGebeurtenis: 5 }, c); }, /'naGebeurtenis' moet een gebeurtenis-id/);
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Z", voorGebeurtenis: "Nooit" }, c); }, /Onbekende gebeurtenis 'Nooit' in 'voorGebeurtenis'/);
    gooitNL(function () { ev({ p: "gespeeld", K: { kaart: "Z", naGebeurtenis: "Nooit" } }, c); }, /Onbekende gebeurtenis/);
    T.is(ev({ p: "gespeeld", kaart: "Z", doel: null, optie: null, optieNiet: "a", naGebeurtenis: "E", voorGebeurtenis: "G" }, c), false);
  });
  t("maakContext en valideer: null in de lijsten, lege state en null in gebeurtenisdefinities geven geen vreemde fout", function () {
    var ep = { id: "EX", antibiotica: ["Q1"], patient: { waar: {}, medicatie: [] } };
    var c = P.maakContext({ rollen: ROLLEN }, ep, { tijdlijn: [null], klachten: [null, { dag: 4, status: "af" }], dag: 1 });
    T.is(c.laatsteDag, 4); T.is(c.status(4), "af"); T.is(c.status(9), null);
    var c2 = P.maakContext({ rollen: ROLLEN }, ep, { klachten: [{ dag: 2, status: "af" }, { dag: 3, status: "aan" }, { dag: 5, status: "af" }] });
    T.is(c2.status(5), "af");
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1" }, c); }, /Ongeldige tijdlijnregel op positie 1/);
    var leegState = P.maakContext({ rollen: ROLLEN }, ep, {});
    T.gelijk(leegState.tijdlijn, []); T.gelijk(leegState.gebeurtenissen, []); T.gelijk(leegState.klachten, []); T.gelijk(leegState.toestanden, []);
    T.is(ev({ p: "gespeeld", kaart: "Q1" }, leegState), false);
    T.is(ev({ p: "gebeurtenisGeweest", id: "x" }, leegState), false);
    var met = P.maakContext({ rollen: ROLLEN }, { id: "EX", antibiotica: ["Q1"], patient: { waar: {} }, gebeurtenissen: [null, { id: "E" }] },
      { tijdlijn: [R(1, "Q1", 1)], gebeurtenissen: [null, { id: "E", dag: 1 }] });
    T.is(ev({ p: "gebeurtenisGeweest", id: "E" }, met), true);
    T.is(ev({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E" } }, met), true);
  });
  t("teller: geen object of een 't' dat geen tekst is geeft een Nederlandse fout", function () {
    var c = mk([]);
    [null, undefined, 5, "gespeeld", [], { t: 5 }, {}, { t: null }].forEach(function (x) {
      gooitNL(function () { P.tel(x, c); }, /Een teller moet een object met een veld 't' zijn/, JSON.stringify(x));
      gooitNL(function () { P.valideer(x, c); }, /Een teller moet|Een predicaat moet|Een predicaat mist/, "valideer " + JSON.stringify(x));
    });
    gooitNL(function () { ev({ p: "tel", teller: null, op: ">", waarde: 1 }, c); }, /Een teller moet een object/);
  });


  t("uitSet: bij twee definities met dezelfde gebeurtenis-id telt de eerste", function () {
    var c = mk([R(1, "Q1", 1), R(2, "Q2", 1)], { gebdef: [{ id: "G", zet: { s: ["Q1"] } }, { id: "G", zet: { s: ["Q2"] } }], geb: [{ id: "G", dag: 1 }] });
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "s" }, c), true);
    T.is(ev({ p: "actief", middel: "Q2", uitSet: "s" }, c), false);
  });


  /* ---------- tweede synthetische casus: andere rol-id's en andere lijstnaam (regressiewacht tegen hardcode) ---------- */
  var ROL2 = { wissel: "R1", stop: "R2", pauzeer: "R3", hervat: "R4" };
  function mk2(tijdlijn, o) {
    o = o || {};
    var ep = {
      id: "EY", antibiotica: ["Z1", "Z2", "Z3"], reserve: ["Z2", "Y7"], patient: { waar: {}, medicatie: [{ id: "c1" }, { id: "c2" }] },
      gebeurtenissen: o.gebdef || []
    };
    var st = { tijdlijn: tijdlijn, gebeurtenissen: o.geb || [], dag: 1, aantalDagen: 7 };
    return P.maakContext({ id: "cy", rollen: o.rollen || ROL2, episodes: [ep] }, ep, st);
  }
  t("tweede casus: stop-rol komt uit casus.rollen (R2), B2 is daar een gewone kaart", function () {
    var a = { p: "actief", middel: "Z1" };
    T.is(ev(a, mk2([R(1, "Z1", 1), R(2, "R2", 2, "Z1")])), false, "gestopt via R2");
    T.is(ev(a, mk2([R(1, "Z1", 1), R(2, "B2", 2, "Z1")])), true, "B2 is hier geen stop");
    T.is(ev({ p: "actief", middel: "Z1", op: { dag: 1 } }, mk2([R(1, "Z1", 1), R(2, "R2", 2, "Z1")])), true);
  });
  t("tweede casus: wissel-rol (R1) vervangt alle antibiotica, doel null verandert niets, B1 is geen wissel", function () {
    var c = mk2([R(1, "Z1", 1), R(2, "Z2", 1), R(3, "R1", 2, "Z3")]);
    T.is(ev({ p: "actief", middel: "Z3" }, c), true);
    T.is(ev({ p: "actief", middel: ["Z1", "Z2"] }, c), false);
    T.is(ev({ p: "actief", middel: "Z1" }, mk2([R(1, "Z1", 1), R(2, "R1", 2)])), true, "wissel zonder doel wist niets");
    T.is(ev({ p: "actief", middel: "Z1" }, mk2([R(1, "Z1", 1), R(2, "B1", 2, "Z3")])), true, "B1 is hier geen wissel");
    T.is(ev({ p: "actief", middel: "Z3" }, mk2([R(1, "Z1", 1), R(2, "B1", 2, "Z3")])), false);
    T.is(ev({ p: "gestart", middel: "Z3" }, mk2([R(1, "R1", 1, "Z3")])), true, "gestart via wissel-doel");
    T.is(ev({ p: "gestart", middel: "Z3" }, mk2([R(1, "B1", 1, "Z3")])), false);
    T.is(ev({ p: "gespeeld", K: { start: "Z3" } }, mk2([R(1, "R1", 1, "Z3")])), true);
    T.is(ev({ p: "gespeeld", K: { start: "Z3" } }, mk2([R(1, "B1", 1, "Z3")])), false);
  });
  t("tweede casus: pauzeer- en hervat-rol (R3, R4) voor medicatieActief", function () {
    var m = { p: "medicatieActief", id: "c1" };
    T.is(ev(m, mk2([])), true);
    T.is(ev(m, mk2([R(1, "R3", 1, "c1")])), false);
    T.is(ev(m, mk2([R(1, "R3", 1, "c1"), R(2, "R4", 2, "c1")])), true);
    T.is(ev(m, mk2([R(1, "B3", 1, "c1")])), true, "B3 is hier geen pauze");
    T.is(ev(m, mk2([R(1, "R3", 1, "c1"), R(2, "B5", 2, "c1")])), false, "B5 is hier geen hervat");
    T.is(ev({ p: "medicatieActief", id: "c1", op: { dag: 1 } }, mk2([R(1, "R3", 1, "c1")])), false);
  });
  t("tweede casus: maximum aantal actieve antibiotica en eigen ids", function () {
    var c = mk2([R(1, "Z1", 1), R(2, "Z2", 1), R(3, "R2", 2, "Z1"), R(4, "R1", 3, "Z3")]);
    T.is(P.tel({ t: "aantalActieveAntibiotica", op: "max" }, c), 2);
    T.is(ev({ p: "aantalActieveAntibiotica", op: "==", n: 2 }, c), true);
  });
  t("tweede casus: kaartUit leest de lijst met de opgegeven naam (reserve), niet vast 'antibiotica'", function () {
    var c = mk2([R(1, "Z1", 1), R(2, "Y7", 2)]);
    T.is(ev({ p: "gespeeld", kaartUit: "reserve" }, c), true, "Y7 staat in reserve");
    T.is(ev({ p: "gespeeld", kaartUit: "reserve", kaart: "Z1" }, c), false, "Z1 staat niet in reserve");
    T.is(ev({ p: "gespeeld", kaartUit: "antibiotica", kaart: "Y7" }, c), false, "Y7 is geen antibioticum");
    T.is(ev({ p: "gespeeld", kaartUit: "antibiotica", kaart: "Z1" }, c), true);
    T.is(P.tel({ t: "gespeeld", K: { kaartUit: "reserve" } }, c), 1);
    T.is(ev({ p: "gespeeld", kaartUit: "reserve" }, mk2([R(1, "Z1", 1)])), false);
    gooitNL(function () { ev({ p: "gespeeld", kaartUit: "ontbreekt" }, c); }, /Onbekende set 'ontbreekt'/);
  });
  t("tweede casus: de rollen van een casus mogen niet door die van een andere casus worden overschreven", function () {
    var c1 = mk([R(1, "B2", 2, "Q1"), R(0, "Q1", 1)]);
    var c2 = mk2([R(1, "Z1", 1), R(2, "R2", 2, "Z1")]);
    T.is(ev({ p: "actief", middel: "Q1" }, c1), false);
    T.is(ev({ p: "actief", middel: "Z1" }, c2), false);
    T.is(ev({ p: "actief", middel: "Q1" }, c1), false, "na de tweede casus nog steeds dezelfde uitkomst");
  });

  /* ---------- gevoelig / resistent: beide altijd bekend ---------- */
  t("uitSet: resistent en gevoelig zijn beide bekend, ook zonder enige data; de set is dan leeg", function () {
    var c = mk([R(1, "Q1", 1)]);
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "resistent" }, c), false);
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "gevoelig" }, c), false);
    P.valideer({ p: "actief", uitSet: "gevoelig" }, c);
    gooitNL(function () { ev({ p: "actief", uitSet: "onbekendeSet" }, c); }, /Onbekende set 'onbekendeSet'/);
    gooitNL(function () { ev({ p: "actief", uitSet: "toString" }, c); }, /Onbekende set/);
  });
  t("uitSet: gevoelig wordt aangevuld door zet.gevoelig en verkleind door zet.resistent", function () {
    var def = [{ id: "G1", zet: { gevoelig: ["Q1", "Q2"] } }, { id: "G2", zet: { resistent: ["Q2"] } }];
    var c = mk([R(1, "Q1", 1), R(2, "Q2", 1)], { gebdef: def, geb: [{ id: "G1", dag: 1 }, { id: "G2", dag: 2 }] });
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "gevoelig" }, c), true);
    T.is(ev({ p: "actief", middel: "Q2", uitSet: "gevoelig" }, c), false);
    T.is(ev({ p: "actief", middel: "Q2", uitSet: "resistent" }, c), true);
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "resistent" }, c), false);
  });

  /* ---------- geneste kaartverwijzing bij binnenBeurten ---------- */
  t("binnenBeurten: geneste K.naGebeurtenis wordt gevalideerd (onbekend id en niet-tekst geven een fout)", function () {
    var c = mk([R(1, "Q1", 3)], { gebdef: [{ id: "E" }], geb: [{ id: "E", dag: 3 }] });
    gooitNL(function () { ev({ p: "binnenBeurten", K: { kaart: "Q1", naGebeurtenis: "Nooit" }, naGebeurtenis: "E", n: 2 }, c); }, /Onbekende gebeurtenis 'Nooit'/);
    gooitNL(function () { ev({ p: "binnenBeurten", K: { kaart: "Q1", naGebeurtenis: 5 }, naGebeurtenis: "E", n: 2 }, c); }, /moet een gebeurtenis-id/);
    gooitNL(function () { ev({ p: "binnenBeurten", K: { kaart: "Q1", voorGebeurtenis: "Nooit" }, naGebeurtenis: "E", n: 2 }, c); }, /Onbekende gebeurtenis 'Nooit'/);
    gooitNL(function () { ev({ p: "binnenBeurten", kaart: "Q1", naGebeurtenis: "Nooit", n: 2 }, c); }, /Onbekende gebeurtenis 'Nooit'/);
    T.is(ev({ p: "binnenBeurten", K: { kaart: "Q1", naGebeurtenis: "E" }, naGebeurtenis: "E", n: 2 }, c), true, "geldige geneste vorm");
    T.is(ev({ p: "binnenBeurten", kaart: "Q1", naGebeurtenis: "E", n: 1 }, c), true, "platte vorm");
  });

  /* ---------- stille gevallen: onbekend/niet-antibiotisch middel, lege lijsten ---------- */
  t("gestart: onbekend of niet-antibiotisch middel geeft een fout; ook in een lijst", function () {
    var c = mk([R(1, "Q1", 1)]);
    gooitNL(function () { ev({ p: "gestart", middel: "ZZ" }, c); }, /'ZZ' is geen antibioticum/);
    gooitNL(function () { ev({ p: "gestart", middel: "B1" }, c); }, /'B1' is geen antibioticum/);
    gooitNL(function () { ev({ p: "gestart", middel: ["Q1", "ZZ"] }, c); }, /'ZZ' is geen antibioticum/);
    gooitNL(function () { ev({ p: "gestart", middel: "Q1" }, mk([], { zonderAb: true })); }, /geen lijst 'antibiotica'/);
    T.is(ev({ p: "gestart", middel: "Q1" }, c), true);
  });
  t("actief: een niet-antibioticum geeft een fout (ook in een lijst)", function () {
    var c = mk([R(1, "Q1", 1)]);
    gooitNL(function () { ev({ p: "actief", middel: "ZZ" }, c); }, /'ZZ' is geen antibioticum/);
    gooitNL(function () { ev({ p: "actief", middel: ["Q1", "ZZ"] }, c); }, /'ZZ' is geen antibioticum/);
  });
  t("lege lijsten in kaart, start, middel geven een Nederlandse fout (geen stil false/true)", function () {
    var c = mk([R(1, "Q1", 1)]);
    ["gespeeld", "nietGespeeld"].forEach(function (p) {
      gooitNL(function () { ev({ p: p, kaart: [] }, c); }, /'kaart' mag geen lege lijst zijn/, p);
      gooitNL(function () { ev({ p: p, K: { kaart: [] } }, c); }, /'kaart' mag geen lege lijst zijn/, p + " genest");
      gooitNL(function () { ev({ p: p, start: [] }, c); }, /'start' mag geen lege lijst zijn/, p);
    });
    gooitNL(function () { ev({ p: "gestart", middel: [] }, c); }, /'middel' mag geen lege lijst zijn/);
    gooitNL(function () { ev({ p: "actief", middel: [] }, c); }, /'middel' mag geen lege lijst zijn/);
    gooitNL(function () { ev({ p: "voor", a: { kaart: [] }, b: { kaart: "Q1" } }, c); }, /'kaart' mag geen lege lijst zijn/);
    gooitNL(function () { P.tel({ t: "gespeeld", K: { kaart: [] } }, c); }, /'kaart' mag geen lege lijst zijn/);
    T.is(ev({ p: "gespeeld", K: { kaart: "Q1", optieNiet: [] } }, c), true, "lege optieNiet is wel geldig (niets uitgesloten)");
  });

  /* ---------- overige gaten uit de mutatiesets ---------- */
  t("TODO_BART-sleutels: alleen sleutels die ermee BEGINNEN worden genegeerd", function () {
    var c = mk([R(1, "Q1", 1)]);
    T.is(ev({ p: "gespeeld", kaart: "Q1", TODO_BART: "x" }, c), true);
    T.is(ev({ p: "gespeeld", kaart: "Q1", TODO_BART_3: "x" }, c), true);
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1", xTODO_BARTx: "x" }, c); }, /Onbekend veld 'xTODO_BARTx'/);
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1", mijnTODO_BART: "x" }, c); }, /Onbekend veld 'mijnTODO_BART'/);
    gooitNL(function () { ev({ p: "gespeeld", K: { kaart: "Q1", xTODO_BART: 1 } }, c); }, /Onbekend veld 'xTODO_BART'/);
  });
  t("tel: operatoren < en > bij een asymmetrisch geval (teller 3, waarde 1)", function () {
    var c = mk([R(1, "X", 1), R(2, "X", 1), R(3, "X", 2)]);
    function tl(op, w) { return ev({ p: "tel", teller: { t: "gespeeld", K: { kaart: "X" } }, op: op, waarde: w }, c); }
    T.is(tl(">", 1), true); T.is(tl("<", 1), false); T.is(tl(">=", 1), true); T.is(tl("<=", 1), false);
    T.is(tl("<", 5), true); T.is(tl(">", 5), false); T.is(tl("==", 3), true); T.is(tl("!=", 3), false);
    function ak(op, n) { return ev({ p: "aantalActieveAntibiotica", op: op, n: n }, mk([R(1, "Q1", 1), R(2, "Q2", 1), R(3, "Q3", 1)])); }
    T.is(ak(">", 1), true); T.is(ak("<", 1), false); T.is(ak("<", 5), true); T.is(ak(">", 5), false);
  });
  t("ctx.status: dag met een klachtenregel zonder status geeft null (niet undefined)", function () {
    var c = mk([], { klachten: [{ dag: 2 }, { dag: 3, status: "af" }] });
    T.is(c.status(2), null); T.is(c.status(3), "af"); T.is(c.status(4), null);
    T.waar(c.status(2) === null, "null en niet undefined");
  });
  t("wissel zonder doel (null) verandert niets aan de actieve middelen", function () {
    var c = mk([R(1, "Q1", 1), R(2, "Q2", 1), R(3, "B1", 2)]);
    T.is(ev({ p: "actief", middel: "Q1" }, c), true);
    T.is(ev({ p: "actief", middel: "Q2" }, c), true);
    T.is(ev({ p: "aantalActieveAntibiotica", op: "==", n: 2 }, c), true);
  });
  t("voor/na: de b- (voor) en a-verwijzing (na) worden ook gevalideerd", function () {
    var c = mk([R(1, "Q1", 1)], { gebdef: [{ id: "E" }] });
    gooitNL(function () { ev({ p: "voor", a: { kaart: "Q1" }, b: { kaart: "Q1", kaartUit: "bestaatNiet" } }, c); }, /Onbekende set 'bestaatNiet'/);
    gooitNL(function () { ev({ p: "voor", a: { kaart: "Q1", kaartUit: "bestaatNiet" }, b: { kaart: "Q1" } }, c); }, /Onbekende set 'bestaatNiet'/);
    gooitNL(function () { ev({ p: "na", a: { kaart: "Q1" }, b: { kaart: "Q1", naGebeurtenis: "Nooit" } }, c); }, /Onbekende gebeurtenis 'Nooit'/);
    gooitNL(function () { ev({ p: "na", a: { kaart: "Q1", naGebeurtenis: "Nooit" }, b: { kaart: "Q1" } }, c); }, /Onbekende gebeurtenis 'Nooit'/);
    gooitNL(function () { ev({ p: "voor", a: { kaart: "Q1" }, b: { kaart: "Q1", start: 3 } }, c); }, /'start' moet een id/);
    gooitNL(function () { ev({ p: "na", a: { kaart: "Q1", start: 3 }, b: { kaart: "Q1" } }, c); }, /'start' moet een id/);
  });
  t("start met een niet-tekst geeft een fout", function () {
    var c = mk([R(1, "Q1", 1)]);
    gooitNL(function () { ev({ p: "gespeeld", start: 3 }, c); }, /'start' moet een id/);
    gooitNL(function () { ev({ p: "gespeeld", K: { start: [3] } }, c); }, /'start' moet een id/);
    gooitNL(function () { ev({ p: "gespeeld", K: { start: { x: 1 } } }, c); }, /'start' moet een id/);
  });
  t("en/of met niet-lijst args geven de Nederlandse tekst (geen TypeError)", function () {
    var c = mk([]);
    ["en", "of"].forEach(function (p) {
      [undefined, null, "x", 5, {}, { length: 1 }, true].forEach(function (a) {
        var pred = { p: p }; if (a !== undefined) pred.args = a;
        gooitNL(function () { ev(pred, c); }, new RegExp("Het predicaat '" + p + "' vraagt een lijst 'args'"), p + " " + JSON.stringify(a));
        gooitNL(function () { P.valideer(pred, c); }, new RegExp("Het predicaat '" + p + "' vraagt een lijst 'args'"), "valideer " + p);
      });
    });
    gooitNL(function () { ev({ p: "niet" }, c); }, /mist het veld 'arg'/);
    gooitNL(function () { ev({ p: "niet", arg: 5 }, c); }, /Een predicaat moet een object zijn/);
  });
  t("extra veld bij tel-predicaat en in het moment op geven een fout", function () {
    var c = mk([R(1, "Q1", 1)]);
    gooitNL(function () { ev({ p: "tel", teller: { t: "gespeeld", K: { kaart: "Q1" } }, op: ">=", waarde: 1, n: 1 }, c); }, /Onbekend veld 'n' in predicaat 'tel'/);
    gooitNL(function () { ev({ p: "actief", middel: "Q1", op: { dag: 1, x: 1 } }, c); }, /Onbekend veld 'x' in moment/);
    gooitNL(function () { ev({ p: "medicatieActief", id: "m1", op: { dag: 1, x: 1 } }, c); }, /Onbekend veld 'x' in moment/);
    gooitNL(function () { ev({ p: "klachten", waarde: "af", op: { dag: 1, x: 1 } }, c); }, /Onbekend veld 'x' in moment/);
  });
  t("resistent zonder enige resistentiedata is een lege set (false, geen fout)", function () {
    var c = mk([R(1, "Q1", 1)]);
    T.is(ev({ p: "actief", middel: "Q1", uitSet: "resistent" }, c), false);
    T.is(ev({ p: "actief", uitSet: "resistent" }, c), false);
  });


  /* ---------- ronde 5: null/lege waarden, ctx-vorm, testgaten uit ronde 4 ---------- */
  var GEB5 = [{ id: "E" }, { id: "F" }];
  function mk5(tl, o) { o = o || {}; o.gebdef = GEB5; return mk(tl || [R(1, "Q1", 1), R(2, "X", 2)], o); }
  t("null waar een id/tekst/lijst verwacht wordt is een Nederlandse fout (kaart, start, middel, optieNiet, kaartUit, ...)", function () {
    var c = mk5(), NUL = /mag niet null zijn/;
    gooitNL(function () { ev({ p: "gespeeld", kaart: null }, c); }, NUL, "gespeeld kaart");
    gooitNL(function () { ev({ p: "nietGespeeld", kaart: null }, c); }, NUL, "nietGespeeld kaart");
    gooitNL(function () { ev({ p: "gespeeld", K: { kaart: null } }, c); }, NUL, "K.kaart");
    gooitNL(function () { ev({ p: "gespeeld", start: null }, c); }, NUL, "start");
    gooitNL(function () { ev({ p: "gestart", middel: null }, c); }, NUL, "gestart middel");
    gooitNL(function () { ev({ p: "actief", middel: null }, c); }, NUL, "actief middel");
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1", optieNiet: null }, c); }, NUL, "optieNiet");
    gooitNL(function () { ev({ p: "gespeeld", kaartUit: null }, c); }, /Onbekende set/, "kaartUit");
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1", naGebeurtenis: null }, c); }, /gebeurtenis-id/, "naGebeurtenis");
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1", voorGebeurtenis: null }, c); }, /gebeurtenis-id/, "voorGebeurtenis");
    gooitNL(function () { ev({ p: "binnenBeurten", kaart: "Q1", naGebeurtenis: null, n: 1 }, c); }, /gebeurtenis-id/, "binnenBeurten");
    gooitNL(function () { ev({ p: "gespeeld", K: null }, c); }, /mist het veld 'K'/, "K");
    gooitNL(function () { ev({ p: "voor", a: null, b: { kaart: "Q1" } }, c); }, /mist het veld 'a'/, "a");
    gooitNL(function () { ev({ p: "binnenBeurtenNaKaart", kaart: "X", naKaart: null, n: 1 }, c); }, /mist het veld 'naKaart'/, "naKaart");
    gooitNL(function () { ev({ p: "opDagRelatief", kaart: "X", anker: null, van: 0 }, c); }, /mist het veld 'anker'/, "anker");
    gooitNL(function () { ev({ p: "medicatieActief", id: null }, c); }, /'id' moet een medicatie-id/, "medicatieActief id");
    gooitNL(function () { ev({ p: "gebeurtenisGeweest", id: null }, c); }, /gebeurtenis-id/, "gebeurtenisGeweest id");
    gooitNL(function () { ev({ p: "inToestand", t: null }, c); }, /'t' moet een toestand-id/, "t");
    gooitNL(function () { ev({ p: "actief", uitSet: null }, c); }, /'uitSet' moet de naam/, "uitSet");
    gooitNL(function () { ev({ p: "waar", veld: null, op: "==", waarde: 1 }, c); }, /'veld' moet/, "veld");
    gooitNL(function () { ev({ p: "waar", veld: "w", op: null, waarde: 1 }, mk5([], { waar: { w: 1 } })); }, /Onbekende vergelijkingsoperator/, "op");
    gooitNL(function () { ev({ p: "tel", teller: null, op: "==", waarde: 1 }, c); }, /Een teller moet een object/, "teller");
    gooitNL(function () { ev({ p: "tel", teller: { t: "gespeeld", kaart: "Q1", terwijlKlachten: null }, op: "==", waarde: 1 }, c); }, /terwijlKlachten/, "terwijlKlachten");
    gooitNL(function () { ev({ p: "niet", arg: null }, c); }, /Een predicaat moet een object zijn/, "niet");
    gooitNL(function () { ev({ p: "alsDan", als: null, dan: { p: "waarheid", waarde: true } }, c); }, /Een predicaat moet een object zijn/, "als");
    gooitNL(function () { ev({ p: "alsDan", als: { p: "waarheid", waarde: true }, dan: null }, c); }, /Een predicaat moet een object zijn/, "dan");
    gooitNL(function () { ev({ p: "en", args: [null] }, c); }, /Een predicaat moet een object zijn/, "en-element");
    gooitNL(function () { ev({ p: "waarheid", waarde: null }, c); }, /waarde true of false/, "waarheid");
  });
  t("null in een getal- of momentveld is een fout; 'op: null' is geen eindstand", function () {
    var c = mk5();
    gooitNL(function () { ev({ p: "binnenBeurten", kaart: "X", naGebeurtenis: "E", n: null }, c); }, /'n' moet een getal/, "n");
    gooitNL(function () { ev({ p: "opDagRelatief", kaart: "X", anker: { kaart: "Q1" }, van: null }, c); }, /'van' moet een getal/, "van");
    gooitNL(function () { ev({ p: "opDagRelatief", kaart: "X", anker: { kaart: "Q1" }, van: 0, tot: null }, c); }, /'tot' moet een getal/, "tot");
    gooitNL(function () { ev({ p: "actief", middel: "Q1", op: null }, c); }, /Onbekend moment in 'op'/, "actief op");
    gooitNL(function () { ev({ p: "medicatieActief", id: "m1", op: null }, c); }, /Onbekend moment in 'op'/, "medicatie op");
    gooitNL(function () { ev({ p: "klachten", waarde: "af", op: null }, c); }, /Onbekend moment in 'op' bij 'klachten'/, "klachten op");
    gooitNL(function () { ev({ p: "actief", middel: "Q1", op: { dag: null } }, c); }, /'op.dag' moet een getal/, "op.dag");
    gooitNL(function () { ev({ p: "actief", middel: "Q1", op: { eindeBeurtNaGebeurtenis: "E", offset: null } }, c); }, /'offset' moet een getal/, "offset");
    gooitNL(function () { ev({ p: "actief", middel: "Q1", op: { naKaart: null } }, c); }, /mist het veld 'K'/, "naKaart");
    // zonder 'op' blijft de eindstand gelden
    T.is(ev({ p: "actief", middel: "Q1" }, c), true);
    T.is(ev({ p: "medicatieActief", id: "m1" }, c), true);
  });
  t("welke velden mogen leeg (null) zijn: alleen doel en optie (en waarde bij waar met ==, = of !=)", function () {
    var c = mk5([R(1, "Q1", 1), R(2, "X", 2)], { waar: { w: null } });
    T.is(ev({ p: "gespeeld", kaart: "Q1", doel: null, optie: null }, c), true, "doel/optie null = geen doel/geen optie");
    T.is(ev({ p: "gespeeld", kaart: "Q1", doel: undefined }, c), true, "undefined = veld afwezig");
    T.is(ev({ p: "waar", veld: "w", op: "==", waarde: null }, c), true);
    T.is(ev({ p: "waar", veld: "w", op: "!=", waarde: null }, c), false);
    gooitNL(function () { ev({ p: "waar", veld: "w", op: "<", waarde: null }, c); }, /'waarde' bij 'waar' moet/, "< met null");
    gooitNL(function () { ev({ p: "waar", veld: "w", op: "==", waarde: { a: 1 } }, c); }, /'waarde' bij 'waar' moet/, "object");
    gooitNL(function () { ev({ p: "waar", veld: "w", op: "==", waarde: [1] }, c); }, /'waarde' bij 'waar' moet/, "lijst");
    gooitNL(function () { ev({ p: "waar", veld: "w", op: "==", waarde: NaN }, c); }, /'waarde' bij 'waar' moet/, "NaN");
  });
  t("lege tekst als id en lege lijsten zijn een fout; optieNiet: [] is wel toegestaan (= niets uitsluiten)", function () {
    var c = mk5();
    gooitNL(function () { ev({ p: "gespeeld", kaart: "" }, c); }, /'kaart' moet een id/, "kaart ''");
    gooitNL(function () { ev({ p: "gespeeld", kaart: ["Q1", ""] }, c); }, /'kaart' moet een id/, "kaart ['']");
    gooitNL(function () { ev({ p: "gespeeld", kaart: [] }, c); }, /geen lege lijst/, "kaart []");
    gooitNL(function () { ev({ p: "gestart", middel: [] }, c); }, /geen lege lijst/, "middel []");
    gooitNL(function () { ev({ p: "gespeeld", start: [] }, c); }, /geen lege lijst/, "start []");
    gooitNL(function () { ev({ p: "inToestand", t: "" }, c); }, /'t' moet een toestand-id/, "t ''");
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1", optieNiet: [""] }, c); }, /'optieNiet' moet een id/, "optieNiet ['']");
    T.is(ev({ p: "gespeeld", kaart: "Q1", optieNiet: [] }, c), true);
  });
  t("getallen: n, van, tot, dag, offset moeten geheel zijn; n niet negatief; van mag niet groter zijn dan tot", function () {
    var c = mk5();
    gooitNL(function () { ev({ p: "binnenBeurten", kaart: "X", naGebeurtenis: "E", n: 2.5 }, c); }, /'n' moet een geheel getal/, "n 2.5");
    gooitNL(function () { ev({ p: "binnenBeurten", kaart: "X", naGebeurtenis: "E", n: -1 }, c); }, /'n' mag niet negatief/, "n -1");
    gooitNL(function () { ev({ p: "binnenBeurtenNaKaart", kaart: "X", naKaart: { kaart: "Q1" }, n: 1.5 }, c); }, /'n' moet een geheel getal/, "nNaKaart");
    gooitNL(function () { ev({ p: "binnenBeurtenNaKaart", kaart: "X", naKaart: { kaart: "Q1" }, n: -2 }, c); }, /'n' mag niet negatief/, "nNaKaart -2");
    gooitNL(function () { ev({ p: "opDagRelatief", kaart: "X", anker: { kaart: "Q1" }, van: 3, tot: 1 }, c); }, /'van' \(3\) niet groter zijn dan 'tot' \(1\)/, "van>tot");
    gooitNL(function () { ev({ p: "opDagRelatief", kaart: "X", anker: { kaart: "Q1" }, van: 0.5 }, c); }, /'van' moet een geheel getal/, "van 0.5");
    gooitNL(function () { ev({ p: "opDagRelatief", kaart: "X", anker: { kaart: "Q1" }, van: 0, tot: 1.5 }, c); }, /'tot' moet een geheel getal/, "tot 1.5");
    gooitNL(function () { ev({ p: "actief", op: { dag: 1.5 } }, c); }, /'op.dag' moet een geheel getal/, "op.dag 1.5");
    gooitNL(function () { ev({ p: "klachten", waarde: "af", op: { dag: 1.5 } }, c); }, /'op.dag' moet een geheel getal/, "klachten dag");
    gooitNL(function () { ev({ p: "actief", op: { eindeBeurtNaGebeurtenis: "E", offset: 0.5 } }, c); }, /'offset' moet een geheel getal/, "offset");
    gooitNL(function () { ev({ p: "aantalActieveAntibiotica", op: "==", n: 1.5 }, c); }, /'n' moet een geheel getal/, "aantal n");
    gooitNL(function () { ev({ p: "tel", teller: { t: "gespeeld", kaart: "Q1" }, op: "==", waarde: 0.5 }, c); }, /'waarde' moet een geheel getal/, "tel waarde");
    // randen blijven geldig
    T.is(ev({ p: "opDagRelatief", kaart: "Q1", anker: { kaart: "Q1" }, van: 0, tot: 0 }, c), true, "van == tot mag");
    T.is(ev({ p: "binnenBeurten", kaart: "X", naGebeurtenis: "E", n: 0 }, mk5([R(1, "X", 2)], { geb: [{ id: "E", dag: 2 }] })), false, "n 0 = leeg venster");
    T.is(ev({ p: "actief", op: { eindeBeurtNaGebeurtenis: "E", offset: -1 } }, c), false);
  });
  t("ctx zonder structuur ({}, de casus, een kale state, een episode) geeft een Nederlandse fout, ook voor tel en waarheid", function () {
    var c = mk5();
    var casus = { rollen: ROLLEN, episodes: [c.episode] };
    var pred = { p: "gespeeld", kaart: "Q1" }, tl = { t: "gespeeld", kaart: "Q1" };
    var slecht = [{}, casus, c.episode, { tijdlijn: [] }, { tijdlijn: [], episode: c.episode }, [], "ctx", 5, null, undefined];
    ["tijdlijn", "gebeurtenissen", "toestanden", "klachten", "waar", "episode", "casus", "status", "laatsteDag"].forEach(function (v) {
      var kapot = {}; Object.keys(c).forEach(function (k) { kapot[k] = c[k]; }); delete kapot[v]; slecht.push(kapot);
    });
    var verkeerd = {}; Object.keys(c).forEach(function (k) { verkeerd[k] = c[k]; }); verkeerd.tijdlijn = "geen lijst"; slecht.push(verkeerd);
    slecht.forEach(function (x, i) {
      var nm = " ctx#" + i;
      gooitNL(function () { P.evalueer(pred, x); }, /geen geldige context \(ctx\)/, "evalueer" + nm);
      gooitNL(function () { P.evalueer({ p: "waarheid", waarde: true }, x); }, /geen geldige context \(ctx\)/, "waarheid" + nm);
      gooitNL(function () { P.tel(tl, x); }, /geen geldige context \(ctx\)/, "tel" + nm);
    });
    T.waar(/maakContext/.test(fouttekst(function () { P.evalueer(pred, {}); })), "de fout verwijst naar maakContext");
    // een echte ctx werkt wel, ook zonder tijdlijnregels
    T.is(P.evalueer({ p: "waarheid", waarde: true }, P.maakContext({}, {}, {})), true);
  });
  t("maakContext: state-lijsten moeten lijsten zijn (geen stille omwikkeling), casus/state moeten objecten zijn", function () {
    var ep = { patient: {} };
    ["tijdlijn", "gebeurtenissen", "toestanden", "klachten"].forEach(function (v) {
      [{ id: 1 }, "tekst", 5, true].forEach(function (x) {
        var st = {}; st[v] = x;
        gooitNL(function () { P.maakContext({}, ep, st); }, new RegExp("'state\\." + v + "' moet een lijst zijn"), v + " " + JSON.stringify(x));
      });
      var st2 = {}; st2[v] = null; P.maakContext({}, ep, st2);   // null/ontbrekend = leeg
    });
    gooitNL(function () { P.maakContext("casus", ep, {}); }, /'casus' moet een object/);
    gooitNL(function () { P.maakContext({}, ep, "state"); }, /'state' moet een object/);
  });
  t("valideer(pred, casus, episode) en valideer(pred, ctx) gedragen zich gelijk; casus als ctx wordt niet voor een ctx aangezien", function () {
    var c = mk5(), casus = c.casus;
    P.valideer({ p: "gespeeld", kaart: "Q1" }, c);
    P.valideer({ p: "gespeeld", kaart: "Q1" }, casus, c.episode);
    gooitNL(function () { P.valideer({ p: "gespeeld", kaart: null }, c); }, /mag niet null zijn/);
    gooitNL(function () { P.valideer({ p: "gespeeld", kaart: null }, casus, c.episode); }, /mag niet null zijn/);
    gooitNL(function () { P.valideer({ t: "gespeeld", kaart: null }, casus, c.episode); }, /mag niet null zijn/);
  });
  t("de validatie blijft eager: een predicaat dat na de eerste aanroep wordt gewijzigd geeft alsnog de fout", function () {
    var c = mk5(), p = { p: "gespeeld", kaart: "Q1" };
    T.is(ev(p, c), true);
    p.kaartt = "x";
    gooitNL(function () { ev(p, c); }, /Onbekend veld 'kaartt'/);
    var c2 = mk5(); ev({ p: "actief", middel: "Q1" }, c2);
    c2.episode.antibiotica = [];
    c2.episode.antibiotica = "tekst";
    gooitNL(function () { ev({ p: "actief", middel: "Q1" }, c2); }, /geen lijst 'antibiotica'/);
  });
  t("alsDan: ook 'als' wordt gevalideerd (typfout in 'als' geeft een fout, ook als 'dan' goed is)", function () {
    var c = mk5(), ok = { p: "waarheid", waarde: true };
    gooitNL(function () { ev({ p: "alsDan", als: { p: "gespeeld", kaart: "X", foo: 1 }, dan: ok }, c); }, /Onbekend veld 'foo'/, "als typfout");
    gooitNL(function () { ev({ p: "alsDan", als: { p: "nietBestaand" }, dan: ok }, c); }, /Onbekend predicaat 'nietBestaand'/, "als onbekend");
    gooitNL(function () { ev({ p: "alsDan", als: ok, dan: { p: "gespeeld", kaart: "X", foo: 1 } }, c); }, /Onbekend veld 'foo'/, "dan typfout");
    T.is(ev({ p: "alsDan", als: { p: "waarheid", waarde: false }, dan: { p: "waarheid", waarde: false } }, c), true);
    T.is(ev({ p: "alsDan", als: ok, dan: { p: "waarheid", waarde: false } }, c), false);
  });
  t("inToestand: exact gelijk, geen prefix of deelstring", function () {
    var c = mk5([], { toest: ["cystitis", "a"] });
    T.is(ev({ p: "inToestand", t: "cystitis" }, c), true);
    T.is(ev({ p: "inToestand", t: "cyst" }, c), false, "prefix");
    T.is(ev({ p: "inToestand", t: "cystitis2" }, c), false, "langer");
    T.is(ev({ p: "inToestand", t: "stit" }, c), false, "deelstring");
    T.is(ev({ p: "inToestand", t: "Cystitis" }, c), false, "hoofdletter");
    T.is(ev({ p: "inToestand", t: "a" }, c), true);
    T.is(ev({ p: "inToestand", t: "x" }, mk5([], { toest: [] })), false);
  });
  t("maakContext kopieert ALLE lijsten: tijdlijn, gebeurtenissen, toestanden en klachten", function () {
    var st = { tijdlijn: [R(1, "X", 1)], gebeurtenissen: [{ id: "G", dag: 1 }], toestanden: ["s"], klachten: [{ dag: 1, status: "af" }] };
    var c = P.maakContext({}, { patient: {} }, st);
    st.tijdlijn.push(R(2, "Y", 1)); st.gebeurtenissen.push({ id: "H", dag: 1 }); st.toestanden.push("t"); st.klachten.push({ dag: 2, status: "aan" });
    T.is(c.tijdlijn.length, 1); T.is(c.gebeurtenissen.length, 1); T.is(c.toestanden.length, 1); T.is(c.klachten.length, 1);
    T.is(c.status(2), null, "status leest de kopie");
    T.waar(c.tijdlijn !== st.tijdlijn && c.gebeurtenissen !== st.gebeurtenissen && c.toestanden !== st.toestanden && c.klachten !== st.klachten);
    // en ook andersom: wijzigen van ctx raakt state niet
    c.toestanden.push("z"); T.is(st.toestanden.length, 2);
  });
  t("tijdlijnregels zonder doel/optie-veld gedragen zich als doel:null / optie:null", function () {
    var tl = [{ volg: 1, kaart: "X", dag: 1 }, { volg: 2, kaart: "B2", dag: 1 }, { volg: 3, kaart: "B3", dag: 1 }];
    var c = mk5(tl);
    T.is(ev({ p: "gespeeld", kaart: "X", doel: null }, c), true, "doel ontbreekt = null");
    T.is(ev({ p: "gespeeld", kaart: "X", optie: null }, c), true, "optie ontbreekt = null");
    T.is(ev({ p: "gespeeld", kaart: "X", doel: "d" }, c), false);
    T.is(ev({ p: "gespeeld", kaart: "X", optie: "o" }, c), false);
    // optieNiet zonder optie op de regel: toegestaan
    T.is(ev({ p: "gespeeld", kaart: "X", optieNiet: ["o"] }, c), true);
    // stop/pauzeer zonder doel-veld doen niets
    var c2 = mk5([{ volg: 1, kaart: "Q1", dag: 1 }, { volg: 2, kaart: "B2", dag: 2 }, { volg: 3, kaart: "B3", dag: 2 }]);
    T.is(ev({ p: "actief", middel: "Q1" }, c2), true, "stop zonder doel");
    T.is(ev({ p: "medicatieActief", id: "m1" }, c2), true, "pauzeer zonder doel");
    var c3 = mk5([{ volg: 1, kaart: "Q1", dag: 1 }, { volg: 2, kaart: "B1", dag: 2 }]);
    T.is(ev({ p: "actief", middel: "Q1" }, c3), true, "wissel zonder doel verandert niets");
  });
  t("stop/pauzeer/hervat met doel null doen niets; stop op een antibioticum dat ook pauzeerbaar is", function () {
    var q = function (kaart, dag, doel) { return { volg: 0, kaart: kaart, dag: dag, doel: doel === undefined ? null : doel, optie: null }; };
    var tl = [q("Q1", 1), q("B2", 2, null)];
    tl.forEach(function (r, i) { r.volg = i + 1; });
    T.is(ev({ p: "actief", middel: "Q1" }, mk5(tl)), true, "stop zonder doel stopt niets");
    var tl2 = [q("Q1", 1), q("B2", 2, "Q1")]; tl2[1].volg = 2;
    T.is(ev({ p: "actief", middel: "Q1" }, mk5(tl2)), false, "stop met doel stopt wel");
    // pauzeren van een antibioticum-id beïnvloedt 'actief' niet (alleen medicatieActief)
    var tl3 = [q("Q1", 1), q("B3", 2, "Q1")]; tl3[1].volg = 2;
    var c3 = mk5(tl3, { medicatie: [{ id: "Q1" }, { id: "m" }] });
    T.is(ev({ p: "actief", middel: "Q1" }, c3), true, "pauzeren stopt een antibioticum niet");
    T.is(ev({ p: "medicatieActief", id: "Q1" }, c3), false, "maar het is wel gepauzeerd");
    var tl4 = [q("Q1", 1), q("B3", 2, "Q1"), q("B5", 3, "Q1")]; tl4[2].volg = 3;
    T.is(ev({ p: "medicatieActief", id: "Q1" }, mk5(tl4, { medicatie: [{ id: "Q1" }] })), true, "hervat");
    var tl5 = [q("B3", 1, null), q("B5", 2, null)];
    T.is(ev({ p: "medicatieActief", id: "m1" }, mk5(tl5)), true, "pauzeer/hervat zonder doel");
  });
  t("laatsteDag is 1 bij een lege state zonder dag; state.dag, tijdlijn en klachten tellen mee", function () {
    T.is(P.maakContext({}, { patient: {} }, {}).laatsteDag, 1);
    T.is(P.maakContext({}, { patient: {} }, { dag: 0 }).laatsteDag, 1);
    T.is(P.maakContext({}, { patient: {} }, { dag: 4 }).laatsteDag, 4);
    T.is(P.maakContext({}, { patient: {} }, { tijdlijn: [R(1, "X", 6)] }).laatsteDag, 6);
    T.is(P.maakContext({}, { patient: {} }, { dag: 9, tijdlijn: [R(1, "X", 6)] }).laatsteDag, 9);
    var c = P.maakContext({}, { patient: {} }, { klachten: [{ dag: 1, status: "af" }] });
    T.is(c.laatsteDag, 1);
    T.is(P.evalueer({ p: "klachten", waarde: "af", op: "laatste" }, c), true);
  });
  t("aantalDagen: state.aantalDagen gaat voor episode.aantalDagen; anders episode; anders null", function () {
    T.is(P.maakContext({}, { patient: {}, aantalDagen: 7 }, { aantalDagen: 5 }).aantalDagen, 5);
    T.is(P.maakContext({}, { patient: {}, aantalDagen: 7 }, {}).aantalDagen, 7);
    T.is(P.maakContext({}, { patient: {} }, {}).aantalDagen, null);
    T.is(P.maakContext({}, { patient: {}, aantalDagen: 7 }, { aantalDagen: "5" }).aantalDagen, 7, "tekst telt niet");
    T.is(P.maakContext({}, { patient: {}, aantalDagen: "7" }, {}).aantalDagen, null);
  });
  t("episode.antibiotica als tekst (geen lijst) geeft de Nederlandse fout, ook bij gestart/actief/aantalActieveAntibiotica en de teller", function () {
    var c = mk5();
    c.episode.antibiotica = "Q1";
    gooitNL(function () { ev({ p: "actief", middel: "Q1" }, c); }, /geen lijst 'antibiotica'/, "actief");
    gooitNL(function () { ev({ p: "gestart", middel: "Q1" }, c); }, /geen lijst 'antibiotica'/, "gestart");
    gooitNL(function () { ev({ p: "aantalActieveAntibiotica", op: "==", n: 1 }, c); }, /geen lijst 'antibiotica'/, "aantal");
    gooitNL(function () { P.tel({ t: "aantalActieveAntibiotica", op: "max" }, c); }, /geen lijst 'antibiotica'/, "teller");
    c.episode.antibiotica = { 0: "Q1", length: 1 };
    gooitNL(function () { ev({ p: "actief", middel: "Q1" }, c); }, /geen lijst 'antibiotica'/, "array-achtig");
  });
  t("Predicaten.tellerNamen en namen zijn precies de ondersteunde namen", function () {
    T.gelijk(P.tellerNamen.slice().sort(), ["aantalActieveAntibiotica", "gespeeld"]);
    T.gelijk(P.namen.slice().sort(), ["actief", "actiefNaDagen", "aantalActieveAntibiotica", "binnenBeurten", "binnenBeurtenNaKaart", "en", "gebeurtenisGeweest", "gespeeld",
      "gestart", "inToestand", "klachten", "medicatieActief", "na", "niet", "nietGespeeld", "of", "alsDan", "opDagRelatief", "tel", "voor", "waar", "waarheid"].sort());
    P.tellerNamen.forEach(function (n) { T.is(typeof n, "string"); });
  });
  t("gebeurtenisGeweest: een gebeurtenis zonder dag in de lijst telt als geweest; zonder id niet", function () {
    var c = mk5([], { geb: [{ id: "E" }] });
    T.is(ev({ p: "gebeurtenisGeweest", id: "E" }, c), true);
    T.is(ev({ p: "gebeurtenisGeweest", id: "F" }, c), false);
    T.is(ev({ p: "gebeurtenisGeweest", id: "E" }, mk5([], { geb: [{ dag: 2 }] })), false, "item zonder id");
    T.is(ev({ p: "gebeurtenisGeweest", id: "E" }, mk5([], { geb: [null, { id: "E", dag: 3 }] })), true);
  });
  t("volg: tijdlijn met en zonder 'volg' door elkaar valt terug op de positie; gelijke volg houdt de invoervolgorde", function () {
    var tl = [{ kaart: "A", dag: 1 }, { volg: 1.5, kaart: "B", dag: 1 }, { kaart: "C", dag: 1 }];
    var c = mk5(tl);
    // posities: A=1, B=1.5, C=3
    T.is(ev({ p: "voor", a: { kaart: "A" }, b: { kaart: "B" } }, c), true);
    T.is(ev({ p: "voor", a: { kaart: "B" }, b: { kaart: "C" } }, c), true);
    T.is(ev({ p: "voor", a: { kaart: "C" }, b: { kaart: "B" } }, c), false);
    T.is(ev({ p: "na", a: { kaart: "C" }, b: { kaart: "A" } }, c), true);
    // fallback is i+1 (niet i+2 of i): zonder volg naast volg:2 op positie 1 geldt volg 1 < 2
    var tl2 = [{ kaart: "A", dag: 1 }, { volg: 2, kaart: "B", dag: 1 }, { kaart: "C", dag: 1 }];
    var c2 = mk5(tl2);
    T.is(ev({ p: "voor", a: { kaart: "A" }, b: { kaart: "B" } }, c2), true, "A=1 voor B=2");
    T.is(ev({ p: "voor", a: { kaart: "B" }, b: { kaart: "C" } }, c2), true, "B=2 voor C=3");
    var tl3 = [{ volg: 5, kaart: "A", dag: 1 }, { kaart: "B", dag: 1 }];
    T.is(ev({ p: "voor", a: { kaart: "B" }, b: { kaart: "A" } }, mk5(tl3)), true, "B (fallback 2) voor A (5)");
    // gelijke volg: invoervolgorde beslist; 'voor' is dan onwaar in beide richtingen
    var tl4 = [{ volg: 1, kaart: "A", dag: 1 }, { volg: 1, kaart: "B", dag: 1 }];
    var c4 = mk5(tl4);
    T.is(ev({ p: "voor", a: { kaart: "A" }, b: { kaart: "B" } }, c4), false);
    T.is(ev({ p: "voor", a: { kaart: "B" }, b: { kaart: "A" } }, c4), false);
    // eerste bij gelijke volg: de eerste in invoervolgorde (met doel als onderscheid)
    var tl5 = [{ volg: 1, kaart: "A", dag: 1, doel: "d1" }, { volg: 1, kaart: "A", dag: 3, doel: "d2" }, { volg: 0, kaart: "Z", dag: 2 }];
    T.is(ev({ p: "binnenBeurtenNaKaart", kaart: "A", doel: "d1", naKaart: { kaart: "A" }, n: 1 }, mk5(tl5)), true, "anker is de eerste A (dag 1)");
    T.is(ev({ p: "binnenBeurtenNaKaart", kaart: "A", doel: "d2", naKaart: { kaart: "A" }, n: 1 }, mk5(tl5)), false, "anker is niet de tweede A");
  });
  t("klachten-moment: dag en eindeBeurtNaGebeurtenis samen is een fout (Nederlandse tekst)", function () {
    var c = mk5();
    gooitNL(function () { ev({ p: "klachten", waarde: "af", op: { dag: 1, eindeBeurtNaGebeurtenis: "E" } }, c); }, /Onbekend moment in 'op' bij 'klachten'/, "beide");
    gooitNL(function () { ev({ p: "klachten", waarde: "af", op: {} }, c); }, /Onbekend moment in 'op' bij 'klachten'/, "geen");
    gooitNL(function () { ev({ p: "klachten", waarde: "af", op: { dag: 1, offset: 1 } }, c); }, /'offset' hoort alleen bij/, "offset bij dag");
    gooitNL(function () { ev({ p: "klachten", waarde: "af", op: "gisteren" }, c); }, /Onbekend moment in 'op' bij 'klachten'/, "tekst");
    gooitNL(function () { ev({ p: "klachten", waarde: "af", op: { naKaart: { kaart: "X" } } }, c); }, /Onbekend veld 'naKaart'/, "naKaart niet bij klachten");
    T.is(ev({ p: "klachten", waarde: "af", op: { eindeBeurtNaGebeurtenis: "E" } }, c), false);
  });
  t("foutteksten zijn Nederlands en noemen de oorzaak (geen Engelse of lege tekst)", function () {
    var c = mk5();
    gooitNL(function () { ev({ p: "klachten", waarde: "weg" }, c); }, /Onbekende klachtenstatus 'weg'\./, "klachtenstatus");
    gooitNL(function () { ev({ p: "tel", teller: { t: "gespeeld", kaart: "Q1", terwijlKlachten: "weg" }, op: "==", waarde: 1 }, c); }, /Onbekende klachtenstatus 'weg' in 'terwijlKlachten'/, "terwijl");
    gooitNL(function () { ev({ p: "actief", op: { dag: 1, eindeBeurtNaGebeurtenis: "E" } }, c); }, /Onbekend moment in 'op'.*Kies precies één van dag/, "moment");
    gooitNL(function () { ev({ p: "actief", op: "nu" }, c); }, /Onbekend moment in 'op': "nu"\./, "moment tekst");
    gooitNL(function () { ev({ p: "actief", op: { dag: 1, offset: 1 } }, c); }, /'offset' hoort alleen bij 'eindeBeurtNaGebeurtenis'\./, "offset");
    gooitNL(function () { ev(null, c); }, /Een predicaat moet een object zijn met een veld 'p'/, "pred null");
    gooitNL(function () { ev({ p: 5 }, c); }, /Een predicaat mist het veld 'p'/, "p getal");
    gooitNL(function () { ev({ p: "foo" }, c); }, /Onbekend predicaat 'foo'\./, "p onbekend");
    gooitNL(function () { P.tel({ t: "foo" }, c); }, /Onbekende teller 'foo'\./, "teller onbekend");
    gooitNL(function () { P.tel({ t: "aantalActieveAntibiotica", op: "min" }, c); }, /kent alleen op: "max"/, "teller op");
    gooitNL(function () { P.tel("x", c); }, /Een teller moet een object met een veld 't' zijn/, "teller geen object");
    gooitNL(function () { ev({ p: "aantalActieveAntibiotica", op: "=>", n: 1 }, c); }, /Onbekende vergelijkingsoperator '=>'\./, "operator");
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1", doel: 5 }, c); }, /'doel' moet een id \(tekst\) of null zijn/, "doel getal");
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1", optie: 5 }, c); }, /'optie' moet een tekst of null zijn/, "optie getal");
    gooitNL(function () { ev({ p: "gespeeld", doel: "d" }, c); }, /minstens 'kaart', 'kaartUit' of 'start'/, "geen kaart");
    gooitNL(function () { ev({ p: "gespeeld", K: { kaart: "Q1" }, kaart: "Q1" }, c); }, /kies één vorm/, "gemengd");
    gooitNL(function () { ev({ p: "gespeeld", kaartUit: "bestaatNiet" }, c); }, /Onbekende set 'bestaatNiet' in de episode \(kaartUit\)/, "kaartUit");
    gooitNL(function () { ev({ p: "actief", uitSet: "nietBekend" }, c); }, /Onbekende set 'nietBekend'/, "uitSet");
    gooitNL(function () { ev({ p: "waar", veld: "zzz", op: "==", waarde: 1 }, c); }, /Het veld 'zzz' staat niet in de ware waarden/, "waar veld");
    gooitNL(function () { ev({ p: "gebeurtenisGeweest", id: "ZZ" }, c); }, /Onbekende gebeurtenis 'ZZ' in 'id'/, "gebeurtenis");
    gooitNL(function () { ev({ p: "medicatieActief", id: "zz" }, c); }, /Onbekende medicatie 'zz'/, "medicatie");
    gooitNL(function () { ev({ p: "gestart", middel: "m1" }, c); }, /is geen antibioticum/, "gestart geen ab");
    gooitNL(function () { ev({ p: "actief", middel: "m1" }, c); }, /is geen antibioticum/, "actief geen ab");
    gooitNL(function () { ev({ p: "gespeeld", kaart: "X", foo: 1 }, c); }, /Onbekend veld 'foo' in predicaat 'gespeeld'\. Toegestaan:/, "veld");
    gooitNL(function () { ev({ p: "gespeeld", K: { kaart: "X", foo: 1 } }, c); }, /Onbekend veld 'foo' in een kaartverwijzing\. Toegestaan:/, "K-veld");
    gooitNL(function () { ev({ p: "waarheid", waarde: 1 }, c); }, /vraagt waarde true of false/, "waarheid");
    gooitNL(function () { ev({ p: "vergeten" }, c); }, /Onbekend predicaat/, "vergeten");
    gooitNL(function () { ev({ p: "binnenBeurten", kaart: "X", n: 1 }, c); }, /mist het veld 'naGebeurtenis'/, "vereis");
    gooitNL(function () { ev({ p: "gespeeld", start: "Q1" }, mk5([], { zonderRollen: true })); }, /De casus mist 'rollen'/, "rollen");
  });
  t("ctx wordt niet gewijzigd door evalueer/tel (ook niet bij een fout)", function () {
    var c = mk5([R(1, "Q1", 1), R(2, "B1", 2, "Q2")]), voor = JSON.stringify(c);
    ev({ p: "actief", middel: "Q2" }, c); P.tel({ t: "aantalActieveAntibiotica", op: "max" }, c);
    try { ev({ p: "gespeeld", kaart: null }, c); } catch (e) { /* verwacht */ }
    T.is(JSON.stringify(c), voor);
  });

  t("ronde 5: gebeurtenis-id lege tekst zonder gebeurtenisdefinities, optie:null tegenover regel met optie, gestart zonder middel, doel null en een id 'null'", function () {
    var zonder = mk([R(1, "Q1", 1)], { gebdef: [] });
    gooitNL(function () { ev({ p: "gebeurtenisGeweest", id: "" }, zonder); }, /gebeurtenis-id/, "id ''");
    gooitNL(function () { ev({ p: "gespeeld", kaart: "Q1", naGebeurtenis: "" }, zonder); }, /gebeurtenis-id/, "naGebeurtenis ''");
    gooitNL(function () { ev({ p: "gebeurtenisGeweest", id: 5 }, zonder); }, /gebeurtenis-id/, "id 5");
    var c = mk5([R(1, "X", 1, null, "o")]);
    T.is(ev({ p: "gespeeld", kaart: "X", optie: null }, c), false, "optie null matcht alleen regels zonder optie");
    T.is(ev({ p: "gespeeld", kaart: "X", optie: "o" }, c), true);
    T.is(ev({ p: "gespeeld", kaart: "X", optie: null }, mk5([R(1, "X", 1)])), true);
    gooitNL(function () { ev({ p: "gestart" }, c); }, /Het predicaat 'gestart' mist het veld 'middel'/, "gestart zonder middel");
    gooitNL(function () { ev({ p: "gestart", middel: undefined }, c); }, /mist het veld 'middel'/, "gestart middel undefined");
    // een kaart met het id 'null' wordt niet geraakt door een stop/pauzeer/hervat zonder doel
    var o = { ab: ["null", "Q1"], medicatie: [{ id: "null" }] };
    var s1 = mk5([R(1, "null", 1), R(2, "B2", 2)], o);
    T.is(ev({ p: "actief", middel: "null" }, s1), true, "stop zonder doel stopt het middel 'null' niet");
    var s2 = mk5([R(1, "B3", 1)], o);
    T.is(ev({ p: "medicatieActief", id: "null" }, s2), true, "pauzeer zonder doel pauzeert 'null' niet");
    var s3 = mk5([R(1, "B3", 1, "null"), R(2, "B5", 2, "null")], o);
    T.is(ev({ p: "medicatieActief", id: "null" }, s3), true, "hervat met doel hervat wel");
    var s4 = mk5([R(1, "B3", 1, "null"), R(2, "B5", 2, null)], o);
    T.is(ev({ p: "medicatieActief", id: "null" }, s4), false, "hervat zonder doel hervat 'null' niet");
    var s5 = mk5([R(1, "Q1", 1), R(2, "B1", 2)], o);
    T.is(ev({ p: "actief", middel: "Q1" }, s5), true, "wissel zonder doel wist niets");
    T.is(ev({ p: "actief", middel: "null" }, s5), false, "en start 'null' niet");
  });

  t("ronde 5: tel met onbekende operator, kaartUit als niet-tekst, arrays waar een object hoort, null in state-lijsten is leeg", function () {
    var c = mk5([R(1, "Q1", 1)], { extra: { reserve: ["Q1"] } });
    ["=>", "=<", "<>", "", null, 5].forEach(function (op) {
      gooitNL(function () { ev({ p: "tel", teller: { t: "gespeeld", kaart: "Q1" }, op: op, waarde: 1 }, c); }, /Onbekende vergelijkingsoperator/, "tel op " + JSON.stringify(op));
    });
    T.is(ev({ p: "tel", teller: { t: "gespeeld", kaart: "Q1" }, op: ">=", waarde: 1 }, c), true);
    T.is(ev({ p: "gespeeld", kaartUit: "reserve" }, c), true);
    gooitNL(function () { ev({ p: "gespeeld", kaartUit: ["reserve"] }, c); }, /Onbekende set/, "kaartUit lijst");
    gooitNL(function () { ev({ p: "gespeeld", kaartUit: 5 }, c); }, /Onbekende set/, "kaartUit getal");
    gooitNL(function () { ev({ p: "gespeeld", K: { kaartUit: ["reserve"] } }, c); }, /Onbekende set/, "K.kaartUit lijst");
    gooitNL(function () { ev([{ p: "gespeeld", kaart: "Q1" }], c); }, /Een predicaat moet een object zijn/, "predicaat als lijst");
    gooitNL(function () { ev({ p: "niet", arg: [] }, c); }, /Een predicaat moet een object zijn/, "arg als lijst");
    gooitNL(function () { P.tel([{ t: "gespeeld", kaart: "Q1" }], c); }, /Een teller moet een object/, "teller als lijst");
    gooitNL(function () { ev({ p: "gespeeld", K: [] }, c); }, /mist het veld 'K'/, "K als lijst");
    gooitNL(function () { ev({ p: "gespeeld", K: [{ kaart: "Q1" }] }, c); }, /mist het veld 'K'/, "K als lijst met object");
    gooitNL(function () { ev({ p: "actief", op: [] }, c); }, /Onbekend moment in 'op'/, "op als lijst");
    gooitNL(function () { ev({ p: "klachten", waarde: "af", op: [] }, c); }, /Onbekend moment in 'op' bij 'klachten'/, "klachten op lijst");
    ["tijdlijn", "gebeurtenissen", "toestanden", "klachten"].forEach(function (v) {
      var st = {}; st[v] = null;
      var cx = P.maakContext({}, { patient: {} }, st);
      T.is(cx[v].length, 0, v + " null = leeg");
      T.waar(Array.isArray(cx[v]));
      st[v] = undefined; T.is(P.maakContext({}, { patient: {} }, st)[v].length, 0, v + " undefined = leeg");
    });
    T.is(ev({ p: "inToestand", t: "null" }, P.maakContext({}, { patient: {} }, { toestanden: null })), false);
  });

})();

/* ---------- LEAD-aanvulling na criticus ronde 5: vier randgevallen (code was al goed, tests ontbraken) ----------
   Door LEAD geschreven op verzoek van de opdrachtgever (geen nieuwe bouwer-/criticusronde): niet blind beoordeeld. */
(function () {
  var G = "predicaten", T = Test, P = window.Predicaten;
  function t(naam, fn) { T.registreer(G, naam, fn); }
  function R(volg, kaart, dag, doel) { return { volg: volg, kaart: kaart, dag: dag, doel: doel || null, optie: null }; }
  var ROLLEN = { wissel: "B1", stop: "B2", pauzeer: "B3", hervat: "B5" };
  function maak(tijdlijn, ep, geb) {
    var e = { id: "EX", antibiotica: ["Q1", "Q2", "Q3"], patient: { waar: {}, medicatie: [{ id: "m1", label: "m1" }, { id: "m2", label: "m2" }] } };
    Object.keys(ep || {}).forEach(function (k) { e[k] = ep[k]; });
    return P.maakContext({ id: "cx", rollen: ROLLEN, episodes: [e] }, e,
      { tijdlijn: tijdlijn, gebeurtenissen: geb || [], toestanden: [], klachten: [], dag: 7, aantalDagen: 7 });
  }
  function actiefResistent(m, c) { return P.evalueer({ p: "actief", middel: m, uitSet: "resistent" }, c); }

  t("randgeval 1 (zet met meer dan één id): alle ids van zet.resistent komen in de set; zet.gevoelig haalt twee ids tegelijk weg", function () {
    var tl = [R(1, "Q1", 1), R(2, "Q2", 1), R(3, "Q3", 1)];
    var c = maak(tl, { gebeurtenissen: [{ id: "E", zet: { resistent: ["Q1", "Q2", "Q3"] } }] }, [{ id: "E", dag: 2, naVolg: 3 }]);
    ["Q1", "Q2", "Q3"].forEach(function (m) { T.is(actiefResistent(m, c), true, m + " hoort resistent te zijn"); });
    // vóór de gebeurtenis is niets resistent
    var voor = maak(tl, { gebeurtenissen: [{ id: "E", zet: { resistent: ["Q1", "Q2", "Q3"] } }] }, []);
    ["Q1", "Q2", "Q3"].forEach(function (m) { T.is(actiefResistent(m, voor), false, m + " is nog niet resistent vóór E"); });
    // twee gebeurtenissen: E1 zet drie ids resistent, E2 zet twee ervan gevoelig -> alleen het derde blijft resistent
    var c2 = maak(tl, { gebeurtenissen: [{ id: "E", zet: { resistent: ["Q1", "Q2", "Q3"] } }, { id: "F", zet: { gevoelig: ["Q1", "Q2"] } }] },
      [{ id: "E", dag: 2, naVolg: 3 }, { id: "F", dag: 3, naVolg: 3 }]);
    T.is(actiefResistent("Q1", c2), false, "Q1 weer gevoelig");
    T.is(actiefResistent("Q2", c2), false, "Q2 weer gevoelig");
    T.is(actiefResistent("Q3", c2), true, "Q3 blijft resistent");
  });

  t("randgeval 2 (pauze over een wissel): een gepauzeerde comedicatie blijft gepauzeerd als het antibioticum wisselt (B1)", function () {
    var c = maak([R(1, "Q1", 1), R(2, "B3", 1, "m1"), R(3, "B1", 2, "Q2")]);
    T.is(P.evalueer({ p: "medicatieActief", id: "m1" }, c), false, "m1 moet gepauzeerd blijven na de wissel");
    T.is(P.evalueer({ p: "medicatieActief", id: "m2" }, c), true, "m2 is nooit gepauzeerd");
  });

  t("randgeval 3 (twee gelijktijdig gepauzeerd): B3 op m1 en m2, B5 alleen op m1 -> m1 actief, m2 nog gepauzeerd", function () {
    var c = maak([R(1, "B3", 1, "m1"), R(2, "B3", 1, "m2"), R(3, "B5", 2, "m1")]);
    T.is(P.evalueer({ p: "medicatieActief", id: "m1" }, c), true, "m1 hervat");
    T.is(P.evalueer({ p: "medicatieActief", id: "m2" }, c), false, "m2 blijft gepauzeerd");
    var c2 = maak([R(1, "B3", 1, "m1"), R(2, "B3", 1, "m2")]);
    T.is(P.evalueer({ p: "medicatieActief", id: "m1" }, c2), false, "m1 gepauzeerd");
    T.is(P.evalueer({ p: "medicatieActief", id: "m2" }, c2), false, "m2 gepauzeerd");
  });

  t("randgeval 4 (kaart vóór het anker): opDagRelatief telt een negatief dagverschil niet als 0; verschil 0 en 1 wel", function () {
    function w(dagK) {
      var c = maak([R(1, "Q2", dagK), R(2, "Q1", 3)]);
      return P.evalueer({ p: "opDagRelatief", K: { kaart: "Q2" }, anker: { kaart: "Q1" }, van: 0, tot: 1 }, c);
    }
    T.is(w(1), false, "Q2 twee dagen vóór het anker (verschil -2) telt niet");
    T.is(w(2), false, "Q2 één dag vóór het anker (verschil -1) telt niet");
    T.is(w(3), true, "zelfde dag (verschil 0) telt");
    T.is(w(4), true, "één dag erna (verschil 1) telt");
    T.is(w(5), false, "twee dagen erna (verschil 2) valt buiten het venster");
  });
})();

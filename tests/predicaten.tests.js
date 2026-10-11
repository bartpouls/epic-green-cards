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
    T.is(ev({ p: "gestart", middel: ["Q9", "Q1"] }, mk([R(1, "Q1", 1)])), true);
    T.is(ev({ p: "gestart", middel: ["Q9", "Q8"] }, mk([R(1, "Q1", 1)])), false);
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

})();

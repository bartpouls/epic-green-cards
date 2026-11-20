/* Tests voor werkpakket E: afvinken afstraffen (besluit Bart van 20 november 2026; casus-uwi.md versie 1.9, sectie 16).
   f (vastgesteld): Recente labwaarden opvragen (G2) kost in episode 1 en 3 een punt; het lab staat daar recent op de patiëntkaart.
   g–k (concept, TODO_BART-C13): een middel starten dat al loopt; afwachten naast een antibioticum; fosfomycine stoppen;
   calcium dubbel geregeld; calcium stoppen nadat ciprofloxacine is gestopt.
   Gratis blijven: G1, N-kaarten, Ev2 en B3 op lisinopril na de uitdroging.
   Met de ECHTE instellingen van de casus (Engine + Evaluatie), plus de regeltaal (alActief) op synthetische tijdlijnen. */
(function (g) {
  "use strict";
  var T = g.Test, G = "besluiten-1120";
  var SP = "spironolacton", CA = "calcium";
  var DOSIS = "V6:V8:875/125 mg 2 dd", HALF = "V6:lisinopril:halveren";
  var NIET_NODIG = "Deze kaart was hier niet nodig: ";
  function casus() { return g.CASUSSEN[0]; }
  function ep(id) { return casus().episodes.filter(function (e) { return e.id === id; })[0]; }
  function todo(id) { return casus().todoBart.filter(function (t) { return t.id === id; })[0]; }
  function ids(u) { return u.geschonden.map(function (x) { return x.id; }); }
  function opmerkingen(u) { return u.extraVragen.filter(function (x) { return x.vraag.indexOf(NIET_NODIG) === 0; }).map(function (x) { return x.vraag.slice(NIET_NODIG.length); }); }
  // Speelt een plan (lijst dagen; "kaart", "kaart:doel" of "kaart:doel:optie"); rng 0: in episode 3 A op dag 3, B op dag 5. Rondt af tot het einde.
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
    return T.rondAfTotEinde(s);
  }
  function goed(u, wat) { T.gelijk(ids(u), [], wat + ": poort"); T.is(u.poortGehaald, true, wat + ": poort gehaald"); }
  // Episode 3, volgorde A (dag 3) – B (dag 5): de basisroute (amoxicilline/clavulaanzuur) en de ciprofloxacineroute met B4.
  function basisE3() { return [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", DOSIS], ["Ev1"], ["B3:" + SP, HALF, "N3"], ["Ev1"]]; }
  function ciproE3() { return [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V7", "B4:V7"], ["Ev1"], ["B3:" + SP, HALF, "N3"], ["Ev1"]]; }
  function E2fosfo() { return [["G2", "O1", "V4"], ["N1", "N2:V4"]]; }
  function E2trim() { return [["G2", "O1", "V5"], ["O2", "N1"], [], ["V6:V5:halveren", "B1:V4"]]; }

  /* ---------- vastlegging ---------- */
  T.registreer(G, "vastlegging: casus 1.9; TODO_BART-C13 is goedgekeurd (besluit 20 november 2026), noemt g–k en staat bij de besluiten", function () {
    T.is(casus().versie, "1.9");
    var t = todo("TODO_BART-C13");
    T.waar(!!t && /^Beslist door Bart op 20 november 2026/.test(t.besluit || ""), "C13 is goedgekeurd");
    ["(g)", "(h)", "(i)", "(j)", "(k)"].forEach(function (x) { T.waar(t.vraag.indexOf(x) > 0, "C13 noemt " + x); });
    T.is(t.plek, "E1.score.doelmatigheid; E2.score.doelmatigheid; E3.score.doelmatigheid");
    T.waar(/\[G\]/.test(t.gekozenLezing), "markering [G] in de gekozen lezing");
    ["E2", "E3"].forEach(function (e) { T.is(ep(e).score.doelmatigheid.TODO_BART_C13, t.vraag, e + ": markering op de plek"); });
    if (g.TODO_BART_GROEPEN) T.waar(g.TODO_BART_GROEPEN.some(function (x) { return x.beslist && x.ids.indexOf("TODO_BART-C13") >= 0; }), "C13 staat bij de besluiten");
  });
  T.registreer(G, "vastlegging: de nieuwe regels hebben een naam, delta -1 en kaarten; G2 is vastgesteld (bron), de andere zijn concept (afgeleidUit)", function () {
    var verwacht = {
      E1: ["Labwaarden opvragen terwijl het lab recent is", "Antibioticum starten dat al loopt", "Afwachtend beleid naast een antibioticum"],
      E2: ["Antibioticum starten dat al loopt", "Fosfomycine stoppen"],
      E3: ["Labwaarden opvragen terwijl het lab recent is", "Antibioticum starten dat al loopt", "Calcium dubbel geregeld", "Calcium stoppen na ciprofloxacine"]
    };
    Object.keys(verwacht).forEach(function (e) {
      var r = ep(e).score.doelmatigheid.regels, n = verwacht[e].length, nieuw = r.slice(r.length - n);
      T.gelijk(nieuw.map(function (x) { return x.naam; }), verwacht[e], e);
      nieuw.forEach(function (x) {
        T.is(x.delta, -1, x.naam); T.waar(Array.isArray(x.kaarten) && x.kaarten.length >= 1, x.naam + ": kaarten");
        if (/^Labwaarden/.test(x.naam)) { T.is(x.concept, undefined, "G2 is vastgesteld"); T.waar(/20 november 2026/.test(x.bron), "bron"); }
        else { T.is(x.concept, true, x.naam); T.waar(typeof x.afgeleidUit === "string" && x.afgeleidUit.length > 15, x.naam + ": afgeleid uit"); }
      });
      T.is(ep(e).score.doelmatigheid.opmerkingBijAftrek, "Deze kaart was hier niet nodig:", e + ": opmerking");
    });
  });

  /* ---------- regeltaal: alActief ---------- */
  T.registreer(G, "regeltaal: K-veld alActief telt alleen een start van een middel dat direct ervoor al actief was (kaart, wissel of uitgesteld recept)", function () {
    var P = g.Predicaten;
    function ctx(e, regels) {
      return P.maakContext(casus(), e, { tijdlijn: regels.map(function (r, i) { var p = r.split(":"); return { volg: i + 1, kaart: p[0], doel: p[1] || null, optie: null, dag: 1 }; }), gebeurtenissen: [], toestanden: [], klachten: [] });
    }
    var K = { start: ["V3", "V4", "V5"], alActief: true };
    function n(e, regels) { return P.tel({ t: "gespeeld", K: K }, ctx(e, regels)); }
    T.is(n("E2", ["V4"]), 0, "eerste start");
    T.is(n("E2", ["B1:V4", "V4"]), 1, "V4 na wissel naar V4");
    T.is(n("E2", ["V5", "B1:V4", "V4"]), 1);
    T.is(n("E2", ["V4", "B2:V4", "V4"]), 0, "na stoppen opnieuw starten: niet al actief");
    T.is(n("E2", ["V4", "B1:V5", "B1:V4"]), 0, "terugwisselen: V4 liep niet meer");
    T.is(n("E1", ["V2:V3", "V3"]), 1, "uitgesteld recept telt als start");
    T.is(n("E1", ["V3", "V2:V3"]), 1);
    T.is(n("E1", ["V2:V4", "V3"]), 0, "ander middel");
    T.is(P.tel({ t: "gespeeld", K: { start: ["V3", "V4", "V5"], alActief: false } }, ctx("E2", ["B1:V4", "V4"])), 1, "alActief: false telt de eerste start");
    var c = ctx("E2", ["B1:V4", "V4"]);
    T.is(P.eersteRegel([K], c).kaart, "V4", "eersteRegel geeft de dubbele start (voor de opmerking)");
    T.gooit(function () { P.evalueer({ p: "gespeeld", K: { kaart: "V4", alActief: true } }, c); }, "alActief zonder start");
    T.gooit(function () { P.evalueer({ p: "gespeeld", K: { start: "V4", alActief: "ja" } }, c); }, "alActief geen waar/onwaar");
  });

  /* ---------- f: G2 bij een recent lab (vastgesteld) ---------- */
  T.registreer(G, "f (vastgesteld): G2 kost in episode 1 en 3 een punt met opmerking; in episode 2 (verborgen eGFR) niet", function () {
    var e1 = speel("E1", [["V4", "N1", "N2:V4", "G1"]]), e1g = speel("E1", [["V4", "N1", "N2:V4", "G2"]]);
    goed(e1, "E1 zonder G2"); goed(e1g, "E1 met G2");
    T.is(e1.score.doelmatigheid, 3); T.is(e1g.score.doelmatigheid, 2);
    T.gelijk(opmerkingen(e1), []); T.gelijk(opmerkingen(e1g), ["Recente labwaarden opvragen"]);
    var b = speel("E3", basisE3()), p = basisE3(); p[3].push("G2");
    var m = speel("E3", p);
    goed(b, "E3 basis"); goed(m, "E3 met G2");
    T.is(b.score.doelmatigheid, 3); T.is(m.score.doelmatigheid, 2); T.gelijk(opmerkingen(m), ["Recente labwaarden opvragen"]);
    var e2 = speel("E2", E2fosfo());
    goed(e2, "E2"); T.is(e2.score.doelmatigheid, 3, "E2: G2 vóór de voorschrijfkaart blijft punten opleveren"); T.gelijk(opmerkingen(e2), []);
  });

  /* ---------- g: een middel starten dat al loopt ---------- */
  T.registreer(G, "g (concept): een middel starten dat al loopt kost een punt (E1 naast het uitgesteld recept, E2 na de wissel, E3 na de wissel)", function () {
    var e1 = speel("E1", [["V2:V3", "V3", "N1", "Ev1"]]);
    goed(e1, "E1"); T.is(e1.score.doelmatigheid, 2); T.gelijk(opmerkingen(e1), ["Nitrofurantoïne"]);
    var p2 = E2trim(); p2[3].push("V4");
    var e2 = speel("E2", p2), e2b = speel("E2", E2trim());
    goed(e2, "E2"); T.is(e2b.score.doelmatigheid, 3); T.is(e2.score.doelmatigheid, 2); T.gelijk(opmerkingen(e2), ["Fosfomycine"]);
    var p3 = basisE3(); p3[3].push("V8");
    var e3 = speel("E3", p3);
    goed(e3, "E3"); T.is(e3.score.doelmatigheid, 2); T.gelijk(opmerkingen(e3), ["Amoxicilline/clavulaanzuur"]);
  });

  /* ---------- h: afwachten naast een antibioticum (E1) ---------- */
  T.registreer(G, "h (concept): Afwachtend beleid naast een direct gestart antibioticum kost in episode 1 een punt; naast een uitgesteld recept niet (twijfelgeval)", function () {
    var u = speel("E1", [["V1", "V3", "N1", "Ev1"]]);
    goed(u, "V1 + V3"); T.is(u.score.doelmatigheid, 2); T.gelijk(opmerkingen(u), ["Afwachtend beleid"]);
    var v = speel("E1", [["V1", "V2:V3", "N1", "Ev1"]]);
    goed(v, "V1 + V2"); T.is(v.score.doelmatigheid, 3); T.gelijk(opmerkingen(v), []);
  });

  /* ---------- i: fosfomycine stoppen (E2) ---------- */
  T.registreer(G, "i (concept): Antibioticum stoppen op fosfomycine kost in episode 2 een punt", function () {
    var p = E2fosfo(); p.push(["B2:V4"]);
    var u = speel("E2", p);
    goed(u, "E2"); T.is(u.score.doelmatigheid, 2); T.gelijk(opmerkingen(u), ["Antibioticum stoppen (Fosfomycine)"]);
  });

  /* ---------- j en k: calcium (E3) ---------- */
  T.registreer(G, "j (concept): naast Innametijden aanpassen ook calcium stoppen terwijl ciprofloxacine loopt kost een punt; één van de twee is gratis", function () {
    var b = speel("E3", ciproE3());
    goed(b, "cipro + B4"); T.is(b.score.doelmatigheid, 3); T.gelijk(opmerkingen(b), []);
    var p = ciproE3(); p[3].push("B3:" + CA);
    var u = speel("E3", p);
    goed(u, "cipro + B4 + B3 calcium"); T.is(u.score.doelmatigheid, 2); T.gelijk(opmerkingen(u), ["Medicatie tijdelijk stoppen (calcium/colecalciferol)"]);
  });
  T.registreer(G, "k (concept): calcium stoppen nadat ciprofloxacine is vervangen kost een punt; calcium stoppen vóór de start van ciprofloxacine niet (twijfelgeval)", function () {
    var p = [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V7", "B3:" + CA], ["Ev1", "B1:V8", DOSIS], ["B3:" + SP, HALF, "N3"], ["Ev1"]];
    var ok = speel("E3", p);
    goed(ok, "calcium gestopt terwijl cipro loopt"); T.gelijk(opmerkingen(ok), []);
    var na = [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V7", "B4:V7"], ["Ev1", "B1:V8", DOSIS], ["B3:" + SP, HALF, "N3"], ["Ev1", "B3:" + CA]];
    var u = speel("E3", na);
    goed(u, "calcium gestopt na de de-escalatie"); T.gelijk(opmerkingen(u), ["Medicatie tijdelijk stoppen (calcium/colecalciferol)"]);
    T.is(u.score.doelmatigheid, 2, "alleen k, niet ook j");
    var voor = [["G3", "O1", "V4"], ["N1", "O2", "B3:" + CA], ["O1", "B1:V7", "Ev2:" + SP], ["Ev1"], ["B3:" + SP, HALF, "N3"], ["Ev1"]];
    var v = speel("E3", voor);
    goed(v, "calcium gestopt vóór de start van cipro"); T.gelijk(opmerkingen(v), []);
  });

  /* ---------- gratis blijven ---------- */
  T.registreer(G, "gratis blijven: G1, de N-kaarten, Overleggen met de voorschrijver en lisinopril stoppen na de uitdroging", function () {
    var p = basisE3(); p[3].push("G1", "N2:V8"); p[5].push("B3:lisinopril", "Ev2:lisinopril");
    var u = speel("E3", p);
    goed(u, "E3"); T.is(u.score.doelmatigheid, 3); T.gelijk(opmerkingen(u), []);
    var e1 = speel("E1", [["V1", "N1", "Ev1", "G1"]]);
    goed(e1, "E1"); T.is(e1.score.doelmatigheid, 3);
  });
})(window);

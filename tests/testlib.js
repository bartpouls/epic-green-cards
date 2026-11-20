// Minimale testbibliotheek: werkt in de browser (tests.html) en in Node (gauntlet/tools/run-node.js).
(function (g) {
  var lijst = [];
  function tekst(x) { try { return JSON.stringify(x); } catch (e) { return String(x); } }
  // De echte casus in de instelling van vóór iteratie 1 ("oude regels"): geen grens op herhalen, geen escalatie, kweekuitslag
  // op kaartaantal, weefselinvasie en uitdroging op kaartaantal (na de 4e en de 7e kaart), 5/7/7 dagen. De oudere regeltests (invarianten,
  // score, profiel) gebruiken herhaalde vulkaarten en dagplannen die daarop zijn gebouwd; ze toetsen de REGELS (predicaten) op de echte data.
  // Afronden spoelt sinds casus 1.4 altijd door tot de laatste dag (dat zit in de engine); tests die de regels op een tussenstand willen
  // toetsen, vragen de beoordeling rechtstreeks aan Evaluatie.beoordeel. Het nieuwe gedrag wordt met de echte instellingen getoetst in
  // tests/iteratie1.tests.js, tests/besluiten.tests.js en tests/besluiten-1115.tests.js. Test.routeRegels() is voor tests/routes.js.
  var oudeRegels = null, routeRegels = null;
  var OUDE_TRIGGERS = { A: { type: "naKaart", n: 4 }, B: { type: "naKaart", n: 7 } };
  function maakOudeRegels() {
    var c = JSON.parse(JSON.stringify(g.CASUSSEN[0]));
    delete c.limiet;
    delete c.rollen.uitgesteld;                      // uitgesteld recept zonder middel (V2 is dan geen doelkaart)
    c.kaarten.forEach(function (k) {
      delete k.limiet;
      if (k.id === "V2") { k.doelkaart = false; k.doelen = null; }
      if (k.id === "N2") Object.keys(k.doelen).forEach(function (e) { k.doelen[e].forEach(function (d) { d.vereist = { p: "gestart", middel: d.id }; }); });
    });
    var dagen = { E1: 5, E2: 7, E3: 7 };
    c.episodes.forEach(function (ep) {
      if (ep.escalatie) ep.escalatie.aan = false;
      delete ep.eindeNaKaart;                        // casus 1.5: na Verwijzen stopt de episode (getoetst in tests/besluiten-1116.tests.js)
      ep.knoppen.aantalDagen = dagen[ep.id];
      ep.knoppen.actiesPerBeurt = 3;                 // casus 1.7: E1 en E2 hebben nu 4 acties per dag; de oude regels hadden er overal 3
      ep.gebeurtenissen = ep.gebeurtenissen.filter(function (e) { return e.id !== "C2"; });
      ep.gebeurtenissen.forEach(function (e) {
        if (e.groep && OUDE_TRIGGERS[e.id]) e.trigger = JSON.parse(JSON.stringify(OUDE_TRIGGERS[e.id]));
        if (e.id !== "C") return;
        delete e.aankondiging;
        e.trigger = ep.id === "E2" ? { type: "naKaart", n: 4, alleenAlsGespeeld: "O1" } : { type: "naKaartVanKaart", kaart: "O1", n: 3, alleenAlsGespeeld: "O1" };
      });
    });
    return c;
  }
  // De echte casus voor de casusroutes: alle gebeurtenissen, dagen en doelkaarten zoals in het echte spel. Alleen de grens op herhalen
  // is weg (foutroutes gebruiken een vulkaart meer dan eens) en de escalatie staat uit (een foutroute moet precies haar eigen regel
  // schenden en niet door sepsis eindigen). tools/routezoeker.js speelt dezelfde plannen met de volledig echte instellingen.
  function maakRouteRegels() {
    var c = JSON.parse(JSON.stringify(g.CASUSSEN[0]));
    delete c.limiet;
    c.kaarten.forEach(function (k) { delete k.limiet; });
    c.episodes.forEach(function (ep) { if (ep.escalatie) ep.escalatie.aan = false; });
    return c;
  }
  g.Test = {
    oudeRegels: function () { if (!oudeRegels) oudeRegels = maakOudeRegels(); return oudeRegels; },
    routeRegels: function () { if (!routeRegels) routeRegels = maakRouteRegels(); return routeRegels; },
    // Rondt af zoals een speler die niet meer reageert: stopt het doorspoelen bij een gebeurtenis, dan meteen opnieuw afronden.
    rondAfTotEinde: function (state) {
      var u = g.Engine.rondAf(state), n = 0;
      while (!state.afgerond && n++ < 50) u = g.Engine.rondAf(state);
      return u;
    },
    registreer: function (groep, naam, fn) { lijst.push({ groep: groep, naam: naam, fn: fn }); },
    is: function (a, b, msg) { if (a !== b) throw new Error((msg || "is") + ": verwacht " + tekst(b) + ", kreeg " + tekst(a)); },
    gelijk: function (a, b, msg) { if (tekst(a) !== tekst(b)) throw new Error((msg || "gelijk") + ": verwacht " + tekst(b) + ", kreeg " + tekst(a)); },
    waar: function (v, msg) { if (!v) throw new Error(msg || "niet waar"); },
    gooit: function (fn, msg) { var ok = false; try { fn(); } catch (e) { ok = true; } if (!ok) throw new Error(msg || "verwachtte een fout"); },
    draaiAlles: function (groepFilter) {
      return lijst.filter(function (t) { return !groepFilter || t.groep.indexOf(groepFilter) !== -1; }).map(function (t) {
        try { t.fn(); return { groep: t.groep, naam: t.naam, ok: true }; }
        catch (e) { return { groep: t.groep, naam: t.naam, ok: false, fout: String((e && e.message) || e) }; }
      });
    }
  };
})(typeof window !== "undefined" ? window : globalThis);

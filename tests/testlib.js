// Minimale testbibliotheek: werkt in de browser (tests.html) en in Node (gauntlet/tools/run-node.js).
(function (g) {
  var lijst = [];
  function tekst(x) { try { return JSON.stringify(x); } catch (e) { return String(x); } }
  // De echte casus in de instelling van vóór iteratie 1 ("oude regels"): geen grens op herhalen, afronden vrij, geen escalatie, kweekuitslag
  // op kaartaantal, 5/7/7 dagen. De oudere regel- en routetests (invarianten, score, profiel) gebruiken herhaalde vulkaarten en dagplannen
  // die daarop zijn gebouwd; ze toetsen de REGELS (predicaten) op de echte data. Het nieuwe gedrag (limiet, kweek na 3 dagen, escalatie,
  // 14 dagen, afronden pas na gebeurtenissen, uitgesteld recept met middel) wordt apart getoetst met de echte instellingen in tests/iteratie1.tests.js.
  var oudeRegels = null;
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
      ep.afrondenPasNaGebeurtenissen = false;
      if (ep.escalatie) ep.escalatie.aan = false;
      ep.knoppen.aantalDagen = dagen[ep.id];
      ep.gebeurtenissen = ep.gebeurtenissen.filter(function (e) { return e.id !== "C2"; });
      ep.gebeurtenissen.forEach(function (e) {
        if (e.id !== "C") return;
        delete e.aankondiging;
        e.trigger = ep.id === "E2" ? { type: "naKaart", n: 4, alleenAlsGespeeld: "O1" } : { type: "naKaartVanKaart", kaart: "O1", n: 3, alleenAlsGespeeld: "O1" };
      });
    });
    return c;
  }
  g.Test = {
    oudeRegels: function () { if (!oudeRegels) oudeRegels = maakOudeRegels(); return oudeRegels; },
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

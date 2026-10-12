// Minimale testbibliotheek: werkt in de browser (tests.html) en in Node (gauntlet/tools/run-node.js).
(function (g) {
  var lijst = [];
  function tekst(x) { try { return JSON.stringify(x); } catch (e) { return String(x); } }
  // De echte casus zonder de 'één keer per doel'-regel (casus.limiet): de oudere regel- en routetests gebruiken herhaalde vulkaarten.
  // De limiet zelf wordt getest in tests/engine.tests.js en tests/limiet.tests.js met de echte casus.
  var zonderLimiet = null;
  g.Test = {
    zonderLimiet: function () {
      if (!zonderLimiet) { zonderLimiet = JSON.parse(JSON.stringify(g.CASUSSEN[0])); delete zonderLimiet.limiet; }
      return zonderLimiet;
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

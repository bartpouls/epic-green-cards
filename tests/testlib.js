// Minimale testbibliotheek: werkt in de browser (tests.html) en in Node (gauntlet/tools/run-node.js).
(function (g) {
  var lijst = [];
  function tekst(x) { try { return JSON.stringify(x); } catch (e) { return String(x); } }
  g.Test = {
    registreer: function (groep, naam, fn) { lijst.push({ groep: groep, naam: naam, fn: fn }); },
    is: function (a, b, msg) { if (a !== b) throw new Error((msg || "is") + ": verwacht " + tekst(b) + ", kreeg " + tekst(a)); },
    gelijk: function (a, b, msg) { if (tekst(a) !== tekst(b)) throw new Error((msg || "gelijk") + ": verwacht " + tekst(b) + ", kreeg " + tekst(a)); },
    waar: function (v, msg) { if (!v) throw new Error(msg || "niet waar"); },
    gooit: function (fn, msg) { var ok = false; try { fn(); } catch (e) { ok = true; } if (!ok) throw new Error(msg || "verwachtte een fout"); },
    draaiAlles: function () {
      return lijst.map(function (t) {
        try { t.fn(); return { groep: t.groep, naam: t.naam, ok: true }; }
        catch (e) { return { groep: t.groep, naam: t.naam, ok: false, fout: String((e && e.message) || e) }; }
      });
    }
  };
})(typeof window !== "undefined" ? window : globalThis);

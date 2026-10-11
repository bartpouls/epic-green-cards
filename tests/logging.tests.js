// Tests voor engine/logging.js (stuk S10). Groep: 'logging'.
(function (g) {
  var G = "logging";
  function t(naam, fn) {
    g.Test.registreer(G, naam, function () {
      var L = g.Logging;
      L._zetOpslag(null); L.wis();
      try { fn(L); } finally { L._zetOpslag(undefined); L.wis(); }
    });
  }
  function nepOpslag() {
    var d = {};
    return { d: d, getItem: function (k) { return Object.prototype.hasOwnProperty.call(d, k) ? d[k] : null; },
      setItem: function (k, v) { d[k] = String(v); }, removeItem: function (k) { delete d[k]; } };
  }
  var TL = [{ volg: 1, kaart: "V5", dag: 1, doel: null, optie: null },
    { volg: 2, kaart: "V6", dag: 1, doel: "V5", optie: "halveren" }];
  function basis(o) {
    var p = { pseudoniem: "abc", casusId: "uwi", episodeId: "E1", tijdlijn: TL,
      onthuld: [{ kaart: "G2", dag: 1, sleutel: "eGFR", tekst: "eGFR: 29", waarde: 29 }],
      geschonden: [{ id: "I1", ernst: 1, vraag: "?" }, "I4"],
      score: { duurzaamheid: 2, doelmatigheid: 3 }, profiel: { naam: "P", reflectievraag: "R?" } };
    for (var k in o) p[k] = o[k];
    return p;
  }
  // eenvoudige CSV-lezer (; en aanhalingstekens) voor round-trip
  function leesCSV(s) {
    if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
    var rijen = [], rij = [], c = "", q = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (q) { if (ch === '"') { if (s[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
      else if (ch === '"') q = true;
      else if (ch === ";") { rij.push(c); c = ""; }
      else if (ch === "\r") { /* negeren */ }
      else if (ch === "\n") { rij.push(c); rijen.push(rij); rij = []; c = ""; }
      else c += ch;
    }
    if (c !== "" || rij.length) { rij.push(c); rijen.push(rij); }
    return rijen;
  }

  t("bewaar slaat alle velden op en geeft ze terug via alle()", function (L) {
    L.bewaar(basis());
    var a = L.alle();
    g.Test.is(a.length, 1);
    var p = a[0];
    g.Test.is(p.pseudoniem, "abc"); g.Test.is(p.casusId, "uwi"); g.Test.is(p.episodeId, "E1");
    g.Test.is(p.pogingnummer, 1); g.Test.is(p.eerstePoging, true);
    g.Test.gelijk(p.tijdlijn, TL);
    g.Test.is(p.onthuld[0].waarde, 29);
    g.Test.gelijk(p.geschonden, ["I1", "I4"]);
    g.Test.gelijk(p.score, { duurzaamheid: 2, doelmatigheid: 3 });
    g.Test.is(p.profiel.naam, "P");
    g.Test.waar(!isNaN(Date.parse(p.tijdstempel)), "tijdstempel is geen datum");
  });

  t("eerste poging: alleen pogingnummer 1 per pseudoniem+episode", function (L) {
    L.bewaar(basis()); L.bewaar(basis()); L.bewaar(basis());
    var a = L.alle();
    g.Test.gelijk(a.map(function (p) { return p.pogingnummer; }), [1, 2, 3]);
    g.Test.gelijk(a.map(function (p) { return p.eerstePoging; }), [true, false, false]);
  });

  t("eerste poging telt per pseudoniem en per episode apart", function (L) {
    L.bewaar(basis());
    L.bewaar(basis({ episodeId: "E2" }));
    L.bewaar(basis({ pseudoniem: "xyz" }));
    L.bewaar(basis({ episodeId: "E2" }));
    var a = L.alle();
    g.Test.gelijk(a.map(function (p) { return p.eerstePoging; }), [true, true, true, false]);
    g.Test.gelijk(a.map(function (p) { return p.pogingnummer; }), [1, 1, 1, 2]);
  });

  t("aanroeper kan eerstePoging/pogingnummer niet vervalsen", function (L) {
    L.bewaar(basis());
    L.bewaar(basis({ eerstePoging: true, pogingnummer: 1 }));
    g.Test.is(L.alle()[1].eerstePoging, false);
    g.Test.is(L.alle()[1].pogingnummer, 2);
  });

  t("tijdlijn wordt volledig en als kopie bewaard", function (L) {
    var tl = JSON.parse(JSON.stringify(TL));
    L.bewaar(basis({ tijdlijn: tl }));
    tl[0].kaart = "X"; tl.push({ volg: 3 });
    g.Test.gelijk(L.alle()[0].tijdlijn, TL);
    var a = L.alle(); a[0].tijdlijn.pop();
    g.Test.is(L.alle()[0].tijdlijn.length, 2, "alle() geeft geen interne verwijzing");
  });

  t("zonder opslag (null) werkt alles via geheugen", function (L) {
    L._zetOpslag(null);
    L.bewaar(basis()); L.bewaar(basis());
    g.Test.is(L.alle().length, 2);
    g.Test.is(L.alle()[1].eerstePoging, false);
  });

  t("opslag die gooit bij lezen en schrijven: geen fout, geheugen-terugval", function (L) {
    L._zetOpslag({ getItem: function () { throw new Error("geblokkeerd"); },
      setItem: function () { throw new Error("vol"); }, removeItem: function () { throw new Error("x"); } });
    L.bewaar(basis()); L.bewaar(basis());
    g.Test.is(L.alle().length, 2);
    g.Test.waar(L.exportCSV().length > 10);
    L.wis();
    g.Test.is(L.alle().length, 0);
  });

  t("schrijven mislukt maar lezen lukt: record gaat niet verloren", function (L) {
    var o = nepOpslag(); o.setItem = function () { throw new Error("quota"); };
    L._zetOpslag(o);
    L.bewaar(basis()); L.bewaar(basis());
    g.Test.is(L.alle().length, 2);
  });

  t("localStorage-opslag: schrijft naar sleutel en leest terug", function (L) {
    var o = nepOpslag(); L._zetOpslag(o);
    L.bewaar(basis());
    g.Test.waar(o.d[L.SLEUTEL], "niets opgeslagen");
    g.Test.is(JSON.parse(o.d[L.SLEUTEL]).length, 1);
    // nieuwe 'sessie': geheugen leeg, opslag blijft
    var o2 = nepOpslag(); o2.d[L.SLEUTEL] = o.d[L.SLEUTEL];
    L._zetOpslag(o2);
    g.Test.is(L.alle().length, 1);
    L.bewaar(basis());
    g.Test.is(L.alle()[1].pogingnummer, 2, "pogingnummer telt eerdere sessie mee");
  });

  t("kapotte opslaginhoud (geen JSON) wordt genegeerd", function (L) {
    var o = nepOpslag(); o.d[L.SLEUTEL] = "{kapot"; L._zetOpslag(o);
    g.Test.is(L.alle().length, 0);
    L.bewaar(basis());
    g.Test.is(L.alle().length, 1);
  });

  t("bewaar zonder poging gooit Nederlandse fout", function (L) {
    g.Test.gooit(function () { L.bewaar(null); });
  });

  t("maakPoging/bewaarUitSpel gebruikt state en uitkomst", function (L) {
    var state = { casusId: "uwi", episodeId: "E3", tijdlijn: TL, onthuld: [] };
    var uitkomst = { geschonden: [{ id: "I9", ernst: 2, vraag: "v" }], score: null, profiel: null };
    var r = L.bewaarUitSpel(state, uitkomst, "p1");
    g.Test.is(r.episodeId, "E3"); g.Test.gelijk(r.geschonden, ["I9"]);
    g.Test.is(r.score, null); g.Test.is(r.profiel, null); g.Test.is(r.eerstePoging, true);
  });

  t("exportCSV: BOM, ; als scheider, CRLF, kopregel + één regel per poging", function (L) {
    L.bewaar(basis()); L.bewaar(basis());
    var csv = L.exportCSV();
    g.Test.is(csv.charCodeAt(0), 0xFEFF, "BOM ontbreekt");
    var rijen = leesCSV(csv);
    g.Test.is(rijen.length, 3, "kop + 2 pogingen");
    g.Test.is(rijen[0].join(";"), L.KOLOMMEN.join(";"));
    rijen.forEach(function (r) { g.Test.is(r.length, L.KOLOMMEN.length); });
    g.Test.waar(csv.indexOf("\r\n") > 0);
    g.Test.is(rijen[1][4], "ja"); g.Test.is(rijen[2][4], "nee");
    g.Test.is(rijen[1][6], "I1, I4");
    g.Test.is(rijen[1][7], "2"); g.Test.is(rijen[1][8], "3"); g.Test.is(rijen[1][9], "P");
    g.Test.is(rijen[1][10], "2");
  });

  t("exportCSV: tijdlijn en onthuld komen als JSON in één cel, volledig terug te lezen", function (L) {
    L.bewaar(basis());
    var rij = leesCSV(L.exportCSV())[1];
    g.Test.gelijk(JSON.parse(rij[11]), TL);
    g.Test.is(JSON.parse(rij[12])[0].sleutel, "eGFR");
  });

  t("exportCSV: speciale tekens (; \" regeleinde ë) correct geëscaped", function (L) {
    L.bewaar(basis({ pseudoniem: 'a;b"c\nd ë' }));
    var rijen = leesCSV(L.exportCSV());
    g.Test.is(rijen.length, 2);
    g.Test.is(rijen[1].length, L.KOLOMMEN.length);
    g.Test.is(rijen[1][0], 'a;b"c\nd ë');
  });

  t("exportCSV: formule-pseudoniem krijgt voorloop-', JSON blijft ongewijzigd", function (L) {
    L.bewaar(basis({ pseudoniem: "=1+1" }));
    g.Test.is(leesCSV(L.exportCSV())[1][0], "'=1+1");
    g.Test.is(JSON.parse(L.exportJSON())[0].pseudoniem, "=1+1");
  });

  t("exportCSV zonder pogingen: alleen de kopregel", function (L) {
    var rijen = leesCSV(L.exportCSV());
    g.Test.is(rijen.length, 1);
  });

  t("exportCSV: ontbrekende score/profiel (schending) geven lege cellen", function (L) {
    L.bewaar(basis({ score: null, profiel: null }));
    var r = leesCSV(L.exportCSV())[1];
    g.Test.is(r[7], ""); g.Test.is(r[8], ""); g.Test.is(r[9], "");
  });

  t("exportJSON: geldige JSON met alle pogingen en eerstePoging-vlag", function (L) {
    L.bewaar(basis()); L.bewaar(basis());
    var j = JSON.parse(L.exportJSON());
    g.Test.is(j.length, 2);
    g.Test.is(j[0].eerstePoging, true); g.Test.is(j[1].eerstePoging, false);
    g.Test.gelijk(j[0].tijdlijn, TL);
  });

  function nepOmgeving() {
    var log = { blobs: [], urls: [], revoked: [], geklikt: [], toegevoegd: 0, verwijderd: 0, timeouts: [] };
    function Blob(delen, opt) { this.delen = delen; this.type = opt && opt.type; log.blobs.push(this); }
    var doc = { body: { appendChild: function () { log.toegevoegd++; }, removeChild: function () { log.verwijderd++; } },
      createElement: function () { return { style: {}, click: function () { log.geklikt.push({ href: this.href, naam: this.download }); } }; } };
    var URLn = { createObjectURL: function (b) { var u = "blob:nep/" + log.urls.length; log.urls.push(b); return u; },
      revokeObjectURL: function (u) { log.revoked.push(u); } };
    return { log: log, omg: { document: doc, Blob: Blob, URL: URLn, setTimeout: function (f) { log.timeouts.push(f); } } };
  }

  t("download: maakt Blob, klikt link met bestandsnaam, ruimt op", function (L) {
    var n = nepOmgeving();
    var ok = L.download("x.csv", "inhoud", "text/csv", n.omg);
    g.Test.is(ok, true);
    g.Test.is(n.log.blobs.length, 1);
    g.Test.is(n.log.blobs[0].delen[0], "inhoud");
    g.Test.is(n.log.blobs[0].type, "text/csv");
    g.Test.is(n.log.geklikt.length, 1);
    g.Test.is(n.log.geklikt[0].naam, "x.csv");
    g.Test.is(n.log.geklikt[0].href, "blob:nep/0");
    g.Test.is(n.log.verwijderd, 1);
    n.log.timeouts.forEach(function (f) { f(); });
    g.Test.gelijk(n.log.revoked, ["blob:nep/0"]);
  });

  t("download: zonder browseromgeving geeft false, gooit niet", function (L) {
    g.Test.is(L.download("x.csv", "a", "text/csv", {}), false);
    g.Test.is(L.download("x.csv", "a", "text/csv", { document: {}, Blob: function () { throw new Error("nee"); }, URL: {} }), false);
  });

  t("downloadAlles: levert een .csv met BOM en een .json", function (L) {
    L.bewaar(basis());
    var n = nepOmgeving();
    var r = L.downloadAlles(n.omg);
    g.Test.gelijk(r, { csv: true, json: true });
    g.Test.is(n.log.geklikt.length, 2);
    g.Test.waar(/\.csv$/.test(n.log.geklikt[0].naam), "eerste is geen .csv");
    g.Test.waar(/\.json$/.test(n.log.geklikt[1].naam), "tweede is geen .json");
    g.Test.is(n.log.blobs[0].delen[0].charCodeAt(0), 0xFEFF);
    g.Test.is(JSON.parse(n.log.blobs[1].delen[0]).length, 1);
  });

  t("geen netwerk: bronbestand bevat geen fetch/XMLHttpRequest/sendBeacon/WebSocket", function (L) {
    var bron = String(g.Logging.download) + String(g.Logging.bewaar) + String(g.Logging.exportCSV);
    g.Test.waar(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(bron));
  });
})(typeof window !== "undefined" ? window : globalThis);

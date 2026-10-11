// Datatests voor de casusreferentie (stuk S11): window.CASUSSEN[0].referentie (casussen/uwi-referentie.js).
// De ruwe casusregels hieronder zijn door een script rechtstreeks uit casus-uwi.md gekopieerd (inclusief markdown, letter voor letter)
// en worden hier door een EIGEN parser ontleed. De data wordt nergens gebruikt om de referentie te maken (niet circulair).
(function (g) {
  var G = "data-referentie";
  var T = g.Test;
  var RAW = {"E1":{"knoppen":["- repertoire klein (12 kaarten)","- acties per beurt ruim","- geen gebeurtenissen","- richtlijn raadplegen kost niets"],"routes":["| Route | Kern | Profiel |","|---|---|---|","| Afwachten | V1 + N1 + Ev1 | Terughoudend |","| Uitgesteld recept | V2 (+ middel) + N1 + N2 + Ev1 | Gedeelde regie |","| Nitrofurantoïne 5 dagen | V3 + N1 (+ N2, Ev1) | Direct behandelen, 1e keus |","| Fosfomycine | V4 + N1 + N2 | Direct behandelen, 2e keus |","| Trimethoprim 3 dagen | V5 + N1 | Direct behandelen, 3e keus |"],"noot":["Bij trimethoprim 3 dagen is geen kaliumcontrole nodig. De NHG vraagt die alleen bij een 7-daagse kuur of bij profylaxe, en de KNMP-regel slaat aan bij een gebruiksduur van meer dan 6 dagen [NHG, KNMP]."],"inv":["| Id | Altijd fout | Bron |","|---|---|---|","| I1 | Een route zonder N1 | NHG |","| I3 | V1 zonder Ev1 | NHG |","| I4 | Twee antibiotica tegelijk | [G] |"],"volgorde":["**Volgorde vrij:** alle kaarten mogen in elke volgorde."],"score":["- **Duurzaamheid:** afwachten > uitgesteld recept > direct een antibioticum.","- **Doelmatigheid:** O1 (kweek niet geïndiceerd) en O2 (geen indicatie) kosten punten."],"koppen":["**Knoppen:**","### Patiëntkaart","### Repertoire","### Geldige routes","### Invarianten (poort)","**Volgorde vrij:** alle kaarten mogen in elke volgorde.","### Score","### Wat er zichtbaar wordt als een kaart ontbreekt","### Feedback (scherp-Socratisch, zegt niet voor)"]},"E2":{"knoppen":["- repertoire groter, met afleiders (15 kaarten)","- acties per beurt ruim","- 1 gebeurtenis"],"gebeurtenis":["- **Kweekuitslag**, na de 4e gespeelde kaart (ongeveer dag 3). Alleen als O1 gespeeld is.","  - E. coli, **resistent** voor trimethoprim en amoxicilline.","  - **Gevoelig** voor nitrofurantoïne, fosfomycine, amoxicilline/clavulaanzuur en ciprofloxacine.","  - De doorlooptijd van 2–4 dagen kwam via Mistral en is niet zelf gecheckt.","- **Wat de patiënt laat zien, hangt af van de keuze:**","  - Trimethoprim: klachten houden aan.","  - Fosfomycine: klachten nemen af."],"routes":["| Route | Kern | Profiel |","|---|---|---|","| Fosfomycine | G2 → O1 → V4 + N1 + N2 → na de uitslag niet wisselen | Kweekgestuurd, smal |","| Trimethoprim 7 dagen | G2 → O1 → V5 + O2 (dag 2–4) + V6 (na dag 3) + N1 → na de uitslag B1 naar fosfomycine | Bijgestuurd |"],"inv":["| Id | Altijd fout | Bron |","|---|---|---|","| I5 | Nitrofurantoïne bij eGFR < 30, ook als de kweek \"gevoelig\" zegt | NHG |","| I6 | Een antibioticum starten zonder O1 vooraf, of afwachten (V1/V2) in de risicogroep | NHG |","| I7 | Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3 | NHG, KNMP |","| I8 | Bij aanhoudende klachten doorgaan met een middel waarvoor de bacterie resistent is | NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten |"],"volgorde":["**Volgorde:**","- O1 vóór de eerste antibioticumkaart.","- O2 ná V5.","- De rest is vrij."],"score":["- **Duurzaamheid:** wisselen terwijl het middel werkt en de klachten afnemen, kost punten.","- **Doelmatigheid:** G2 spelen vóór de voorschrijfkaart levert punten op."],"brug":["**Brug:** de kweek uit deze episode is het verborgen gegeven in episode 3 (G3)."],"koppen":["**Knoppen:**","### Patiëntkaart","### Repertoire","### Gebeurtenis","### Geldige routes","### Invarianten (poort; I1 en I4 blijven gelden)","**Volgorde:**","### Score","### Wat er zichtbaar wordt als een kaart ontbreekt","### Feedback","**Brug:** de kweek uit deze episode is het verborgen gegeven in episode 3 (G3)."]},"E3":{"knoppen":["- volledig repertoire (26 kaarten)","- acties per beurt krap","- 2 gebeurtenissen in vrije volgorde, plus de kweekuitslag"],"gebeurtenis":["| Id | Trigger | Inhoud |","|---|---|---|","| A | Na kaart *n* (engine-parameter); volgorde met B willekeurig | Weefselinvasie: koorts 38,6 °C en flankpijn |","| B | Na kaart *m* (engine-parameter); volgorde met A willekeurig | Uitdroging: eet en drinkt slecht, twee dagen koorts. Daarmee is de SIDRIK-drempel gehaald (koorts ≥ 38,5 °C gedurende 2 dagen en/of braken of diarree > 3× per dag) [SIDRIK] |","| C | 3 kaarten na O1 | Kweekuitslag. E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine en nitrofurantoïne. |","","De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler."],"routes":["- **Start bij cystitis:** G3 → O1 → V4 (fosfomycine) + N1.","  - Trimethoprim valt af door de eerdere kweek.","  - Nitrofurantoïne valt af door de nierfunctie.","- **Vanaf het begin:** O2 + Ev2 voor lisinopril + spironolacton (I9).","- **Na A** (weefselinvasie):","  - nieuwe kweek (O1)","  - wisselen (B1) naar amoxicilline/clavulaanzuur met V6 naar 875/125 mg 2 dd, **of** naar ciprofloxacine met B4 (scheiden van calcium) of B3 (calcium tijdelijk stoppen)","  - Ev1: contact binnen 48 uur","- **Na B** (uitdroging):","  - B3 spironolacton stoppen","  - V6 lisinopril halveren","  - N3 drinkadvies","  - Ev1 monitoring binnen 1–3 dagen","  - geen automatische herstart van spironolacton (Ev2)","- **Na C** (kweekuitslag): wie ciprofloxacine koos, kan de-escaleren naar amoxicilline/clavulaanzuur.","- **Rand van de kaart:** na 48 uur geen verbetering → Ev3 verwijzen."],"weef":["| Route bij weefselinvasie | Poort | Profiel |","|---|---|---|","| Amoxicilline/clavulaanzuur 875/125 mg 2 dd | Gehaald | Kweekgestuurd; scoort hoger. De keuze leunt op de eerdere kweek en vermijdt de risico's van ciprofloxacine bij ouderen [NHG]. |","| Ciprofloxacine met calcium gescheiden of gestopt | Gehaald | Eerste keus volgens de richtlijn; eigen profiel |"],"bron":["**Bronconflict, geen poort:** voor ciprofloxacine bij eGFR 10–30 geeft de NHG de normale keerdosis eenmaal per 24 uur [NHG]. Het Kompas past de dosis pas aan bij een klaring ≤ 15 [Kompas]. Beide zijn verdedigbaar; het wordt een feedbackmoment."],"inv":["| Id | Altijd fout | Geldt in | Bron |","|---|---|---|---|","| I9 | De combinatie lisinopril + spironolacton bij eGFR < 30 laten liggen (geen O2 én geen Ev2), of spironolacton na de sick day hervatten (B5) zonder eerst Ev2 | Alle toestanden van E3 | Bart; SIDRIK; herstart-nuance [G] |","| I10 | Bij weefselinvasie doorgaan met nitrofurantoïne of fosfomycine: onvoldoende concentratie in het weefsel | Met A | NHG |","| I11 | Bij weefselinvasie wisselen zonder eerst een nieuwe kweek | Met A | NHG |","| I12 | Cotrimoxazol voorschrijven | Alle | NHG, Kompas |","| I13 | Amoxicilline/clavulaanzuur zonder V6 naar 875/125 mg 2 dd | Alle | NHG |","| I14 | Ciprofloxacine zonder B4 (scheiden van calcium) en zonder B3 (calcium tijdelijk stoppen) | Met ciprofloxacine | Kompas; B3-route [G] |","| I15 | Na het halen van de sick day-drempel niet: spironolacton stoppen, lisinopril halveren, drinkadvies, monitoring binnen 1–3 dagen | Met B | SIDRIK |","| I16 | Geen contact binnen 48 uur, of geen verwijzing als ze dan niet beter is | Met A | NHG |"],"score":["- **Duurzaamheid:** de-escaleren van ciprofloxacine naar amoxicilline/clavulaanzuur na de kweek (C) levert punten op.","- **Doelmatigheid:** G3 gebruiken vóór de eerste keuze levert punten op."],"koppen":["**Knoppen:**","### Patiëntkaart","### Repertoire","### Gebeurtenissen","### Geldige routes (kern)","| Route bij weefselinvasie | Poort | Profiel |","**Bronconflict, geen poort:** voor ciprofloxacine bij eGFR 10–30 geeft de NHG de normale keerdosis eenmaal per 24 uur [NHG]. Het Kompas past de dosis pas aan bij een klaring ≤ 15 [Kompas]. Beide zijn verdedigbaar; het wordt een feedbackmoment.","### Invarianten (poort; I1, I4, I5, I6, I7 en I8 blijven gelden)","### Score","### Wat er zichtbaar wordt als een kaart ontbreekt","### Feedback"]}};
  var SLEUTELS = ["knoppen", "gebeurtenisUitleg", "geldigeRoutes", "geldigeRoutesNoot", "routeBijWeefselinvasie", "altijdFout", "volgorde", "score", "brug", "bronconflict", "volgordeVanSecties"];
  var TODO_PINS = { E1: ["TODO_BART_geldigeRoutesNoot", "TODO_BART_volgordeVanSecties"], E2: ["TODO_BART_gebeurtenisUitleg", "TODO_BART_volgordeVanSecties"], E3: ["TODO_BART_gebeurtenisUitleg", "TODO_BART_geldigeRoutes", "TODO_BART_volgordeVanSecties"] };
  var PLEKKEN = { "TODO_BART-R1": "referentie.E1/E2/E3.volgordeVanSecties", "TODO_BART-R2": "referentie.E1.geldigeRoutesNoot", "TODO_BART-R3": "referentie.E2.gebeurtenisUitleg", "TODO_BART-R4": "referentie.E3.gebeurtenisUitleg", "TODO_BART-R5": "referentie.E3.geldigeRoutes" };
  var TODO_IDS = ["TODO_BART-R1", "TODO_BART-R2", "TODO_BART-R3", "TODO_BART-R4", "TODO_BART-R5"];

  function casus() { var c = g.CASUSSEN && g.CASUSSEN[0]; if (!c) throw new Error("casussen/uwi.js ontbreekt: window.CASUSSEN[0] bestaat niet."); return c; }
  function ref() { var r = casus().referentie; if (!r) throw new Error("casussen/uwi-referentie.js ontbreekt of is niet geladen na uwi.js: CASUSSEN[0].referentie bestaat niet."); return r; }

  // ---- eigen parser voor de ruwe casusregels ----
  function schoon(s) { return s.split("**").join("").trim(); }
  function bul(lijst) { return lijst.filter(function (l) { return l.indexOf("- ") === 0; }).map(function (l) { return schoon(l.slice(2)); }); }
  function sub(lijst) { return lijst.filter(function (l) { return l.indexOf("  - ") === 0; }).map(function (l) { return schoon(l.slice(4)); }); }
  function tabel(lijst) {
    return lijst.slice(2).map(function (l) {
      var d = l.split("|"); d = d.slice(1, d.length - 1);
      return d.map(schoon);
    });
  }
  function kopnaam(l) {
    if (l.indexOf("### ") === 0) return l.slice(4).trim();
    if (l.indexOf("**") === 0) { var e = l.indexOf("**", 2); var lab = l.slice(2, e).trim(); return lab.charAt(lab.length - 1) === ":" ? lab.slice(0, lab.length - 1) : lab; }
    if (l.charAt(0) === "|") return schoon(l.split("|")[1]);
    throw new Error("onbekend kopformaat: " + l);
  }
  function routesTabel(lijst) { return tabel(lijst).map(function (c) { return { route: c[0], kern: c[1], profiel: c[2] }; }); }
  function invTabel(lijst, drie) {
    var o = {};
    tabel(lijst).forEach(function (c) { o[c[0]] = drie ? { tekst: c[1], geldtIn: c[2], bron: c[3] } : { tekst: c[1], bron: c[2] }; });
    return o;
  }
  function bulletsMetSub(lijst) {
    var uit = [], cur = null;
    lijst.forEach(function (l) {
      if (l.indexOf("  - ") === 0) cur.kern.push(schoon(l.slice(4)));
      else if (l.indexOf("- ") === 0) { cur = { route: schoon(l.slice(2)), kern: [], profiel: null }; uit.push(cur); }
    });
    return uit;
  }

  function verwacht() {
    var r1 = RAW.E1, r2 = RAW.E2, r3 = RAW.E3, i, k;
    var lab = function (r) { return r.koppen.map(kopnaam); };
    var wat = r2.gebeurtenis.filter(function (l) { return l.indexOf("Wat de pati") !== -1; })[0];
    var mist = r2.gebeurtenis.filter(function (l) { return l.indexOf("doorlooptijd") !== -1; })[0];
    var e3par = r3.gebeurtenis.filter(function (l) { return l.indexOf("De oorzaak van A en B") === 0; })[0];
    var subs2 = sub(r2.gebeurtenis).filter(function (s) { return s.indexOf("klachten") !== -1; });
    return {
      E1: { knoppen: bul(r1.knoppen), gebeurtenisUitleg: [], geldigeRoutes: routesTabel(r1.routes), geldigeRoutesNoot: schoon(r1.noot[0]), routeBijWeefselinvasie: null,
        altijdFout: invTabel(r1.inv, false), volgorde: [schoon(r1.volgorde[0])], score: bul(r1.score), brug: null, bronconflict: null, volgordeVanSecties: lab(r1) },
      E2: { knoppen: bul(r2.knoppen), gebeurtenisUitleg: [schoon(mist.slice(4)), schoon(wat.slice(2)) + " " + subs2.join(" ")], geldigeRoutes: routesTabel(r2.routes), geldigeRoutesNoot: null, routeBijWeefselinvasie: null,
        altijdFout: invTabel(r2.inv, false), volgorde: bul(r2.volgorde), score: bul(r2.score), brug: schoon(r2.brug[0]), bronconflict: null, volgordeVanSecties: lab(r2) },
      E3: { knoppen: bul(r3.knoppen), gebeurtenisUitleg: [schoon(e3par)], geldigeRoutes: bulletsMetSub(r3.routes), geldigeRoutesNoot: null,
        routeBijWeefselinvasie: tabel(r3.weef).map(function (c) { return { route: c[0], poort: c[1], profiel: c[2] }; }),
        altijdFout: invTabel(r3.inv, true), volgorde: null, score: bul(r3.score), brug: null, bronconflict: schoon(r3.bron[0]), volgordeVanSecties: lab(r3) }
    };
  }

  // ---- hulpfuncties ----
  function canon(x) {
    if (Array.isArray(x)) return "[" + x.map(canon).join(",") + "]";
    if (x && typeof x === "object") return "{" + Object.keys(x).sort().map(function (k) { return JSON.stringify(k) + ":" + canon(x[k]); }).join(",") + "}";
    return JSON.stringify(x);
  }
  function zonderTodo(ep) { var o = {}; Object.keys(ep).forEach(function (k) { if (k.indexOf("TODO_BART") !== 0) o[k] = ep[k]; }); return o; }
  function klaar(r) { var o = {}; ["E1", "E2", "E3"].forEach(function (e) { if (r[e]) o[e] = zonderTodo(r[e]); }); return o; }
  function kloon(x) { return JSON.parse(JSON.stringify(x)); }
  function alleStrings(x, uit, pad) {
    if (typeof x === "string") uit.push({ pad: pad, s: x });
    else if (Array.isArray(x)) x.forEach(function (v, i) { alleStrings(v, uit, pad + "[" + i + "]"); });
    else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { alleStrings(x[k], uit, pad + "." + k); });
    return uit;
  }
  // Vergelijkt de gegeven referentie (zonder TODO_BART*-sleutels) met de verwachting uit de casus; geeft een lijst afwijkingen.
  function afwijkingen(data) {
    var v = verwacht(), uit = [];
    var kd = Object.keys(data).sort().join(",");
    if (kd !== "E1,E2,E3") uit.push("sleutels op topniveau: " + kd);
    ["E1", "E2", "E3"].forEach(function (e) {
      var d = data[e];
      if (!d || typeof d !== "object") { uit.push(e + " ontbreekt"); return; }
      var ks = Object.keys(d).sort().join(","), vs = SLEUTELS.slice().sort().join(",");
      if (ks !== vs) uit.push(e + ": sleutels " + ks + " i.p.v. " + vs);
      SLEUTELS.forEach(function (s) { if (canon(d[s]) !== canon(v[e][s])) uit.push(e + "." + s + " wijkt af"); });
    });
    return uit;
  }

  T.registreer(G, "ref-0 referentie is zuivere data: JSON-roundtrip identiek, geen functies, exacte topsleutels E1/E2/E3", function () {
    var r = ref();
    T.gelijk(JSON.parse(JSON.stringify(r)), r);
    T.is(Object.keys(r).sort().join(","), "E1,E2,E3");
  });
  T.registreer(G, "ref-1 exacte sleutelwhitelist per episode (alle contractsleutels aanwezig, niets extra buiten TODO_BART*)", function () {
    var r = ref();
    ["E1", "E2", "E3"].forEach(function (e) {
      var ks = Object.keys(r[e]).filter(function (k) { return k.indexOf("TODO_BART") !== 0; }).sort();
      T.gelijk(ks, SLEUTELS.slice().sort(), e + " sleutels");
      var tk = Object.keys(r[e]).filter(function (k) { return k.indexOf("TODO_BART") === 0; }).sort();
      T.gelijk(tk, TODO_PINS[e].slice().sort(), e + " TODO_BART-sleutels op de plek zelf");
    });
    ["E1", "E2"].forEach(function (e) { T.is(r[e].routeBijWeefselinvasie, null, e + ".routeBijWeefselinvasie"); });
    T.is(r.E3.volgorde, null); T.is(r.E1.brug, null); T.is(r.E3.brug, null); T.is(r.E1.bronconflict, null); T.is(r.E2.bronconflict, null);
    T.gelijk(r.E1.gebeurtenisUitleg, []);
  });
  T.registreer(G, "ref-2 alle onderdelen teken voor teken gelijk aan casus-uwi.md (eigen parser op ingebedde casusregels)", function () {
    var a = afwijkingen(klaar(ref()));
    T.is(a.length, 0, "afwijkingen: " + a.join("; "));
  });
  ["E1", "E2", "E3"].forEach(function (e) {
    SLEUTELS.forEach(function (s) {
      T.registreer(G, "ref-3 " + e + "." + s + " gelijk aan de casus", function () {
        var v = verwacht()[e][s], d = ref()[e][s];
        T.is(canon(d), canon(v), e + "." + s + ": verwacht " + JSON.stringify(v) + ", kreeg " + JSON.stringify(d));
      });
    });
  });
  T.registreer(G, "ref-4 aantallen: alle tabelrijen en bullets uit de casus aanwezig", function () {
    var r = ref();
    T.is(r.E1.knoppen.length, 4); T.is(r.E1.geldigeRoutes.length, 5); T.is(Object.keys(r.E1.altijdFout).length, 3); T.is(r.E1.score.length, 2); T.is(r.E1.volgorde.length, 1);
    T.is(r.E2.knoppen.length, 3); T.is(r.E2.geldigeRoutes.length, 2); T.is(Object.keys(r.E2.altijdFout).length, 4); T.is(r.E2.volgorde.length, 3); T.is(r.E2.score.length, 2);
    T.is(r.E3.knoppen.length, 3); T.is(r.E3.geldigeRoutes.length, 6); T.is(r.E3.routeBijWeefselinvasie.length, 2); T.is(Object.keys(r.E3.altijdFout).length, 8); T.is(r.E3.score.length, 2);
    T.gelijk(Object.keys(r.E3.altijdFout), ["I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"]);
    T.is(r.E1.volgordeVanSecties.length, 9); T.is(r.E2.volgordeVanSecties.length, 11); T.is(r.E3.volgordeVanSecties.length, 11);
  });
  T.registreer(G, "ref-5 geen markdown-opmaak (**), geen lege of ongetrimde strings, alleen strings/arrays/objecten/null", function () {
    var s = alleStrings(ref(), [], "referentie");
    T.waar(s.length > 100, "te weinig strings: " + s.length);
    s.forEach(function (x) {
      T.waar(x.s.indexOf("**") === -1, x.pad + " bevat **");
      T.waar(x.s.length > 0 && x.s === x.s.trim(), x.pad + " is leeg of niet getrimd");
    });
  });
  T.registreer(G, "ref-6 casus.todoBart bevat de referentie-TODO's, zelfstandig leesbaar voor Bart, en elke plek-sleutel verwijst ernaar", function () {
    var c = casus(), r = ref();
    var lijst = (c.todoBart || []).filter(function (t) { return TODO_IDS.indexOf(t.id) !== -1; });
    T.gelijk(lijst.map(function (t) { return t.id; }).sort(), TODO_IDS.slice().sort());
    lijst.forEach(function (t) {
      T.gelijk(Object.keys(t).sort(), ["gekozenLezing", "id", "plek", "vraag"], t.id + " sleutels");
      ["vraag", "gekozenLezing", "plek"].forEach(function (k) {
        T.waar(typeof t[k] === "string" && t[k].length > 40 || k === "plek" && t[k].length > 5, t.id + "." + k + " te kort");
        T.waar(!/contract|rapport|ronde|stuk|S11|gauntlet|criticus|bouwer|lead/i.test(t[k]), t.id + "." + k + " verwijst naar proces in plaats van de casus");
      });
      T.is(t.plek, PLEKKEN[t.id], t.id + ".plek");
    });
    var perPlek = { "TODO_BART-R1": ["E1", "E2", "E3"].map(function (e) { return r[e].TODO_BART_volgordeVanSecties; }), "TODO_BART-R2": [r.E1.TODO_BART_geldigeRoutesNoot],
      "TODO_BART-R3": [r.E2.TODO_BART_gebeurtenisUitleg], "TODO_BART-R4": [r.E3.TODO_BART_gebeurtenisUitleg], "TODO_BART-R5": [r.E3.TODO_BART_geldigeRoutes] };
    lijst.forEach(function (t) { perPlek[t.id].forEach(function (x) { T.is(x, t.vraag, t.id + ": tekst op de plek zelf ongelijk aan casus.todoBart"); }); });
    var ids = (c.todoBart || []).map(function (t) { return t.id; });
    T.is(ids.length, ids.filter(function (x, i) { return ids.indexOf(x) === i; }).length, "dubbele TODO_BART-id's");
  });
  T.registreer(G, "ref-7 mutatietest: elke wijziging aan de referentie wordt door de vergelijking gevonden (>= 100 mutaties)", function () {
    var basis = klaar(ref());
    T.is(afwijkingen(basis).length, 0, "basis moet groen zijn");
    var n = 0, gemist = [];
    function toets(naam, m) { n++; if (afwijkingen(m).length === 0) gemist.push(naam); }
    function loop(node, pad, kloonRoot, pak) {
      // pak() geeft de bijbehorende knoop in de kloon; mutaties worden op een verse kloon uitgevoerd
    }
    function paden(x, p, uit) {
      uit.push(p);
      if (Array.isArray(x)) x.forEach(function (v, i) { paden(v, p.concat([i]), uit); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { paden(x[k], p.concat([k]), uit); });
      return uit;
    }
    function bij(root, p) { var o = root; for (var i = 0; i < p.length; i++) o = o[p[i]]; return o; }
    paden(basis, [], []).forEach(function (p) {
      if (!p.length) return;
      var oud = bij(basis, p), naam = p.join(".");
      var ouder = p.slice(0, p.length - 1), sl = p[p.length - 1];
      function met(fn, label) { var m = kloon(basis), o = bij(m, ouder); fn(o, sl); toets(label + " " + naam, m); }
      if (typeof oud === "string") {
        met(function (o, k) { o[k] = oud + "x"; }, "toevoeging");
        met(function (o, k) { o[k] = oud.slice(0, -1); }, "afkappen");
        met(function (o, k) { var c = oud.charAt(0), w = c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(); if (w === c) w = "Z"; o[k] = w + oud.slice(1); }, "eerste teken");
        met(function (o, k) { o[k] = "**" + oud + "**"; }, "markdown");
      }
      if (typeof sl === "number") {
        met(function (o, k) { o.splice(k, 1); }, "verwijder element");
        met(function (o, k) { o.splice(k, 0, kloon(o[k])); }, "dupliceer element");
        if (sl + 1 < bij(basis, ouder).length && canon(bij(basis, ouder)[sl]) !== canon(bij(basis, ouder)[sl + 1])) met(function (o, k) { var t = o[k]; o[k] = o[k + 1]; o[k + 1] = t; }, "wissel volgorde");
      } else if (ouder.length >= 1) {
        met(function (o, k) { delete o[k]; }, "verwijder sleutel");
      }
      if (oud === null) met(function (o, k) { o[k] = ""; }, "null naar tekst");
    });
    var m1 = kloon(basis); m1.E1.extra = "x"; toets("extra sleutel", m1);
    var m2 = kloon(basis); delete m2.E3; toets("episode weg", m2);
    var m3 = kloon(basis); m3.E4 = {}; toets("extra episode", m3);
    var m4 = kloon(basis); m4.E2.volgorde = null; toets("volgorde null", m4);
    var m5 = kloon(basis); m5.E3.volgorde = []; toets("volgorde leeg", m5);
    T.waar(n >= 100, "te weinig mutaties: " + n);
    T.is(gemist.length, 0, "mutaties niet gevonden: " + gemist.slice(0, 5).join(" | "));
  });
})(typeof window !== "undefined" ? window : globalThis);

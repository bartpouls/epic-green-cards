// Datavorm-tests voor episode 3 (stuk S4). Geen evaluator: alleen controle van de data in casussen/uwi-e3.js.
// De referentieteksten (REF) zijn met een script uit casus-uwi.md (sectie 4, 5 en 6) gehaald en NIET uit de data gegenereerd.
// Robuust: als casussen/uwi.js of uwi-e3.js ontbreekt, falen de tests met een duidelijke Nederlandse melding in plaats van te crashen.
(function (g) {
  var G = "data-e3";
  var T = g.Test;
  var REF = {
    "gebeurtenis": {
      "A": {
        "tekst": "Weefselinvasie: koorts 38,6 °C en flankpijn"
      },
      "B": {
        "tekst": "Uitdroging: eet en drinkt slecht, twee dagen koorts. Daarmee is de SIDRIK-drempel gehaald (koorts ≥ 38,5 °C gedurende 2 dagen en/of braken of diarree > 3× per dag) [SIDRIK]"
      },
      "C": {
        "tekst": "Kweekuitslag. E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine en nitrofurantoïne."
      }
    },
    "inv": {
      "I9": {
        "altijdFout": "De combinatie lisinopril + spironolacton bij eGFR < 30 laten liggen (geen O2 én geen Ev2), of spironolacton na de sick day hervatten (B5) zonder eerst Ev2",
        "geldtIn": "Alle toestanden van E3",
        "bron": "Bart; SIDRIK; herstart-nuance [G]"
      },
      "I10": {
        "altijdFout": "Bij weefselinvasie doorgaan met nitrofurantoïne of fosfomycine: onvoldoende concentratie in het weefsel",
        "geldtIn": "Met A",
        "bron": "NHG"
      },
      "I11": {
        "altijdFout": "Bij weefselinvasie wisselen zonder eerst een nieuwe kweek",
        "geldtIn": "Met A",
        "bron": "NHG"
      },
      "I12": {
        "altijdFout": "Cotrimoxazol voorschrijven",
        "geldtIn": "Alle",
        "bron": "NHG, Kompas"
      },
      "I13": {
        "altijdFout": "Amoxicilline/clavulaanzuur zonder V6 naar 875/125 mg 2 dd",
        "geldtIn": "Alle",
        "bron": "NHG"
      },
      "I14": {
        "altijdFout": "Ciprofloxacine zonder B4 (scheiden van calcium) en zonder B3 (calcium tijdelijk stoppen)",
        "geldtIn": "Met ciprofloxacine",
        "bron": "Kompas; B3-route [G]"
      },
      "I15": {
        "altijdFout": "Na het halen van de sick day-drempel niet: spironolacton stoppen, lisinopril halveren, drinkadvies, monitoring binnen 1–3 dagen",
        "geldtIn": "Met B",
        "bron": "SIDRIK"
      },
      "I16": {
        "altijdFout": "Geen contact binnen 48 uur, of geen verwijzing als ze dan niet beter is",
        "geldtIn": "Met A",
        "bron": "NHG"
      }
    },
    "inv1": {
      "I1": {
        "altijdFout": "Een route zonder N1",
        "bron": "NHG"
      },
      "I3": {
        "altijdFout": "V1 zonder Ev1",
        "bron": "NHG"
      },
      "I4": {
        "altijdFout": "Twee antibiotica tegelijk",
        "bron": "[G]"
      }
    },
    "inv2": {
      "I5": {
        "altijdFout": "Nitrofurantoïne bij eGFR < 30, ook als de kweek \"gevoelig\" zegt",
        "bron": "NHG"
      },
      "I6": {
        "altijdFout": "Een antibioticum starten zonder O1 vooraf, of afwachten (V1/V2) in de risicogroep",
        "bron": "NHG"
      },
      "I7": {
        "altijdFout": "Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3",
        "bron": "NHG, KNMP"
      },
      "I8": {
        "altijdFout": "Bij aanhoudende klachten doorgaan met een middel waarvoor de bacterie resistent is",
        "bron": "NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten"
      }
    },
    "fb": {
      "I9": "Haar nierfunctie is 28. Welk van haar vaste middelen begon toen die nog hoger was, en wie kijkt daar nu naar?",
      "Automatische herstart": "De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?",
      "I10": "Fosfomycine werkt in de blaas. Waar zit de infectie nu?",
      "I11": "Je wisselt. Waarop baseer je de wissel daarna?",
      "I12": "Cotrimoxazol naast spironolacton bij een eGFR van 28. Wat doet dat met haar kalium?",
      "I13": "Clavulaanzuur bij een eGFR van 28. Waar blijft het?",
      "I14": "Ze neemt elke ochtend calcium. Hoeveel van je ciprofloxacine komt in haar bloed?",
      "I15": "Ze drinkt nauwelijks en heeft twee dagen koorts. Wat doen lisinopril en spironolacton met een nier die al droog staat?",
      "I16": "Het is 48 uur later en ze is niet beter. Wat is je volgende kaart, en is die nog aan jou?",
      "Ciprofloxacine-dosis (bronconflict)": "De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?",
      "Profiel ciprofloxacine": "Eerste keus volgens de richtlijn. Gold die eerste keus ook voor déze patiënt?"
    },
    "fb1": {
      "I1": "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",
      "I3": "Je wacht af. Tot wanneer, en wat gebeurt er dan?",
      "I4": "Wat lost het tweede middel op dat het eerste niet oplost?",
      "O1 gespeeld": "Wat doe je bij welke uitslag anders?",
      "Profiel terughoudend": "Je schreef niets voor. Bij welke patiënt zou dat niet mogen?",
      "Profiel direct behandelen": "Het werkt. Was het nodig, en koos zíj ervoor?"
    },
    "fb2": {
      "Verouderde eGFR niet opgemerkt": "Hoe oud was de eGFR waarop je besloot? Wat is er sindsdien met haar gebeurd?",
      "I5": "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?",
      "I6, geen kweek": "Wat vertelt een kweek van urine die al antibioticum heeft gezien?",
      "I6, afwachten": "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?",
      "I7, geen kalium": "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
      "I7, niet gehalveerd": "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?",
      "I8": "De kweek is binnen en de klachten blijven. Waar wacht je nog op?",
      "Onnodig gewisseld": "Het werkte en de klachten namen af. Wat won je met wisselen?"
    },
    "zicht": [
      "**Geen sick day-maatregelen:** \"De nierfunctie daalt verder en het kalium stijgt.\" Zonder getallen, zoals ook de KNMP-regel geen getallen geeft.",
      "**Ciprofloxacine zonder B4/B3:** \"Na 48 uur geen verbetering.\"",
      "**I9 gemist:** \"Het kalium is onbekend, en niemand heeft naar spironolacton gekeken.\""
    ],
    "knoppen": [
      "volledig repertoire (26 kaarten)",
      "acties per beurt krap",
      "2 gebeurtenissen in vrije volgorde, plus de kweekuitslag"
    ],
    "score": [
      "### Score",
      "- **Duurzaamheid:** de-escaleren van ciprofloxacine naar amoxicilline/clavulaanzuur na de kweek (C) levert punten op.",
      "- **Doelmatigheid:** G3 gebruiken vóór de eerste keuze levert punten op."
    ],
    "patient": {
      "kopKlachten": "Mevrouw V., 79 jaar (1 jaar na episode 2). Cystitis, geen koorts.",
      "medicatieregel": "lisinopril, spironolacton (hypertensie), calcium/colecalciferol.",
      "lab": "eGFR 28, recent. Risicogroep [NHG].",
      "verborgen": "de kweek uit episode 2, met trimethoprim resistent. Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG]."
    },
    "patientToelichting": "Wie spironolacton heeft gestart en waarom, staat er bewust niet op. Het leerpunt: als de nierfunctie daalt, kijk je niet alleen naar wat je nu voorschrijft, maar naar alles wat de patiënt al gebruikt. In de praktijk wordt dat vaak gemist.",
    "bronconflict": "voor ciprofloxacine bij eGFR 10–30 geeft de NHG de normale keerdosis eenmaal per 24 uur [NHG]. Het Kompas past de dosis pas aan bij een klaring ≤ 15 [Kompas]. Beide zijn verdedigbaar; het wordt een feedbackmoment."
  };

  function casus() { return g.CASUSSEN && g.CASUSSEN[0]; }
  function e3() {
    var c = casus();
    if (!c) throw new Error("casussen/uwi.js ontbreekt of heeft geen casus: window.CASUSSEN[0] bestaat niet. Laad uwi.js vóór uwi-e3.js.");
    var e = (c.episodes || []).filter(function (x) { return x.id === "E3"; })[0];
    if (!e) throw new Error("Episode E3 niet gevonden in window.CASUSSEN[0].episodes (is casussen/uwi-e3.js geladen na uwi.js?).");
    return e;
  }
  function reg(naam, fn) { T.registreer(G, naam, function () { fn(e3()); }); }
  function alleStrings(x, uit, pad) {
    if (typeof x === "string") uit.push({ pad: pad, s: x });
    else if (Array.isArray(x)) x.forEach(function (v, i) { alleStrings(v, uit, pad + "[" + i + "]"); });
    else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { alleStrings(x[k], uit, pad + "." + k); });
    return uit;
  }
  function vind(lijst, id, sleutel) { return lijst.filter(function (i) { return i[sleutel || "id"] === id; })[0]; }
  function inv(e, id) { var i = vind(e.invarianten, id); T.waar(!!i, "invariant " + id + " ontbreekt"); return i; }
  // Verzamelt uit een predicaat-boom: namen (p), kaart-ids, doel-ids, optie-teksten, getallen, gebeurtenis-ids.
  function inhoud(pr) {
    var r = { p: {}, kaart: {}, doel: {}, optie: {}, gebeurtenis: {}, middel: {}, n: [] };
    (function loop(x) {
      if (Array.isArray(x)) { x.forEach(loop); return; }
      if (!x || typeof x !== "object") return;
      if (typeof x.p === "string") r.p[x.p] = (r.p[x.p] || 0) + 1;
      [].concat(x.kaart === undefined ? [] : x.kaart).forEach(function (k) { r.kaart[k] = true; });
      if (typeof x.doel === "string") r.doel[x.doel] = true;
      if (typeof x.optie === "string") r.optie[x.optie] = true;
      if (typeof x.middel === "string") r.middel[x.middel] = true;
      if (Array.isArray(x.middel)) x.middel.forEach(function (m) { r.middel[m] = true; });
      ["naGebeurtenis", "id", "eindeBeurtNaGebeurtenis", "gebeurtenis"].forEach(function (k) { if (typeof x[k] === "string" && x.p !== "medicatieActief") r.gebeurtenis[x[k]] = true; });
      ["van", "tot", "n", "offset"].forEach(function (k) { if (typeof x[k] === "number") r.n.push(k + "=" + x[k]); });
      Object.keys(x).forEach(function (k) { if (typeof x[k] === "object") loop(x[k]); });
    })(pr);
    return r;
  }
  function sleutels(o) { return Object.keys(o).sort(); }
  function heeftPad(pr, vorm) { // zoekt een deelboom die (deels) gelijk is aan 'vorm'
    var gevonden = false;
    (function loop(x) {
      if (gevonden) return;
      if (Array.isArray(x)) { x.forEach(loop); return; }
      if (!x || typeof x !== "object") return;
      var ok = Object.keys(vorm).every(function (k) { return JSON.stringify(x[k]) === JSON.stringify(vorm[k]); });
      if (ok) { gevonden = true; return; }
      Object.keys(x).forEach(function (k) { loop(x[k]); });
    })(pr);
    return gevonden;
  }

  reg("E3-0 episode is zuivere data (JSON-roundtrip identiek, geen functies)", function (e) {
    T.gelijk(JSON.parse(JSON.stringify(e)), e);
    T.is(e.id, "E3"); T.is(e.level, 3);
    T.is(e.titel, "Episode 3 — level 3");
  });

  reg("E3-1 patiëntkaart letterlijk uit de casus", function (e) {
    var z = e.patient.zichtbaar;
    T.is(z.naam, "Mevrouw V.");
    T.is(z.leeftijd, 79);
    T.is(z.kop, "Mevrouw V., 79 jaar (1 jaar na episode 2).");
    T.is(z.tijdSindsVorige, undefined, "de tijd sinds de vorige episode staat in de kop");
    T.is(z.klachten, "Cystitis, geen koorts.");
    T.gelijk(z.medicatie, ["lisinopril", "spironolacton", "calcium/colecalciferol"]);
    T.gelijk(z.lab, { eGFR: 28, datum: "recent" });
    T.is(z.labTekst, "eGFR 28, recent.");
    T.is(z.risicogroep, "Risicogroep [NHG].");
    T.is(z.kop + " " + z.klachten, REF.patient.kopKlachten, "kop + klachten teken voor teken");
    T.is(z.medicatieTekst, REF.patient.medicatieregel, "medicatieTekst = casusregel mét '(hypertensie)' en slotpunt (zoals E1/E2)");
    T.is(e.patient.casusMedicatieregel, REF.patient.medicatieregel, "casusMedicatieregel mét slotpunt");
    T.is(z.labTekst + " " + z.risicogroep, REF.patient.lab, "lab + risicogroep teken voor teken");
    T.is(e.patient.toelichting, REF.patientToelichting);
  });
  reg("E3-1 spironolacton staat er zonder start of reden; comedicatie-ids", function (e) {
    T.gelijk(e.patient.medicatie, [
      { id: "lisinopril", label: "lisinopril" }, { id: "spironolacton", label: "spironolacton" }, { id: "calcium", label: "calcium/colecalciferol" }
    ]);
    T.waar(e.patient.zichtbaar.medicatieTekst.indexOf("spironolacton (hypertensie)") >= 0, "de letterlijke casusregel noemt '(hypertensie)' (TODO_BART-E3-8, meest letterlijke lezing)");
    T.waar(JSON.stringify(e.patient.zichtbaar.medicatie).toLowerCase().indexOf("hypertensie") < 0, "de lijst zichtbaar.medicatie noemt alleen namen");
    T.waar(JSON.stringify(e.patient.medicatie).toLowerCase().indexOf("gestart") < 0, "start/reden-gegevens bij de medicatie");
    T.waar(typeof e.patient.TODO_BART === "string" && e.patient.TODO_BART.indexOf("Mag de reden (hypertensie) zichtbaar zijn?") > 0, "TODO_BART op de patiëntkaart (hypertensie bij spironolacton)");
  });
  reg("E3-1 ware eGFR 28 is gelijk aan de zichtbare (recent), risicogroep waar", function (e) {
    T.gelijk(e.patient.waar, { eGFR: 28, risicogroep: true });
    T.is(e.patient.waar.eGFR, e.patient.zichtbaar.lab.eGFR, "waar en zichtbaar eGFR gelijk in E3");
  });
  reg("E3-1 verborgen achter G3: kweek uit episode 2 (trimethoprim resistent); G2 is niet verborgen", function (e) {
    var v = e.patient.verborgen;
    T.is(v.length, 1);
    T.is(v[0].kaart, "G3");
    T.is(v[0].onthult, "de kweek uit episode 2, met trimethoprim resistent");
    T.is(v[0].toelichting, "Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG].");
    T.waar(!v.some(function (x) { return x.kaart === "G2"; }), "G2 hoort niet verborgen te zijn in E3 (eGFR 28 is bevestigd)");
    T.waar(JSON.stringify(e.patient.zichtbaar).indexOf("trimethoprim") < 0, "de kweek staat al zichtbaar op de patiëntkaart");
  });

  reg("E3-2 repertoire: alle 26 kaarten in bibliotheekvolgorde (B5 vóór B4)", function (e) {
    T.gelijk(e.repertoire, ["G1", "G2", "G3", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10",
      "B1", "B2", "B3", "B5", "B4", "N1", "N2", "N3", "Ev1", "Ev2", "Ev3"]);
    T.is(e.repertoire.length, 26);
  });
  reg("E3-2 repertoirekaarten en antibiotica bestaan in de bibliotheek (alleen als uwi.js kaarten bevat)", function (e) {
    var kaarten = casus().kaarten;
    if (!kaarten || !kaarten.length) return;
    var ids = kaarten.map(function (k) { return k.id; });
    e.repertoire.forEach(function (id) { T.waar(ids.indexOf(id) >= 0, "kaart " + id + " ontbreekt in casus.kaarten"); });
    e.antibiotica.forEach(function (id) { T.waar(ids.indexOf(id) >= 0, "antibioticum " + id + " ontbreekt in casus.kaarten"); });
    T.is(ids.filter(function (id) { return e.repertoire.indexOf(id) < 0; }).length, 0, "kaarten in de bibliotheek die niet in het repertoire staan");
  });
  reg("E3-2 gebeurtenissen A, B, C: teksten letterlijk, groep AB, n=4, m=7, C drie kaarten na O1", function (e) {
    T.gelijk(e.gebeurtenissen.map(function (x) { return x.id; }), ["A", "B", "C"]);
    var A = vind(e.gebeurtenissen, "A"), B = vind(e.gebeurtenissen, "B"), C = vind(e.gebeurtenissen, "C");
    T.is(A.tekst, REF.gebeurtenis.A.tekst);
    T.is(B.tekst, REF.gebeurtenis.B.tekst);
    T.is(C.tekst, REF.gebeurtenis.C.tekst);
    T.waar(A.tekst.indexOf("38,6 °C") > 0, "A noemt 38,6 °C");
    T.is(A.groep, "AB"); T.is(B.groep, "AB"); T.is(C.groep, undefined);
    T.gelijk(A.trigger, { type: "naKaart", n: 4 });
    T.gelijk(B.trigger, { type: "naKaart", n: 7 });
    T.gelijk(C.trigger, { type: "naKaartVanKaart", kaart: "O1", n: 3, alleenAlsGespeeld: "O1" });
    T.is(A.toestand, "weefselinvasie"); T.is(B.toestand, "uitdroging"); T.is(C.toestand, undefined);
    T.gelijk(A.zet, { statusNaBeurten: 2 });
    T.gelijk(C.zet, { resistent: ["V5", "V10"], gevoelig: ["V8", "V7", "V4", "V3"] });
  });
  reg("E3-6 knoppen: 3 acties, 7 dagen, raadplegen kost 1; casus-regels bewaard", function (e) {
    T.is(e.knoppen.actiesPerBeurt, 3); T.is(e.knoppen.aantalDagen, 7); T.is(e.knoppen.raadplegenKost, 1);
    T.gelijk(e.knoppen.casusTekst, REF.knoppen);
    T.is(e.raadplegen, undefined, "episode.raadplegen bestaat niet: raadplegen staat alleen op casusniveau (contract §4, TODO_BART-K5)");
    T.gelijk(e.antibiotica, ["V3", "V4", "V5", "V7", "V8", "V9", "V10"]);
    T.gelijk(e.startToestanden, ["cystitis"]);
    T.waar(typeof e.knoppen.TODO_BART === "string", "TODO_BART bij 'krap' versus 3 acties");
  });

  /* ---------- invarianten ---------- */
  var ERNST = { I12: 1, I5: 2, I10: 2, I15: 2, I9: 3, I16: 3, I14: 3, I13: 3, I7: 3, I6: 4, I11: 4, I8: 4, I1: 5, I4: 5 };
  var GELDT = { I1: ["*"], I4: ["*"], I5: ["*"], I6: ["*"], I7: ["*"], I8: [{ gebeurtenis: "C" }], I9: ["*"], I10: ["weefselinvasie"],
    I11: ["weefselinvasie"], I12: ["*"], I13: ["*"], I14: ["*"], I15: ["uitdroging"], I16: ["weefselinvasie"] };
  reg("E3-3 invarianten: precies I1, I4, I5–I16 (14 stuks; I3 is alleen E1) in casusvolgorde", function (e) {
    T.gelijk(e.invarianten.map(function (i) { return i.id; }), ["I1", "I4", "I5", "I6", "I7", "I8", "I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"]);
  });
  reg("E3-3 ernst volgens bouwopdracht 6.1 en geldtIn volgens de casus-toestandstabel", function (e) {
    Object.keys(ERNST).forEach(function (id) {
      T.is(inv(e, id).ernst, ERNST[id], id + " ernst");
      T.gelijk(inv(e, id).geldtIn, GELDT[id], id + " geldtIn");
    });
  });
  reg("E3-3 'altijd fout', 'geldt in' en bron letterlijk (I9–I16 uit sectie 6, I5–I8 uit sectie 5, I1/I4 uit sectie 4)", function (e) {
    ["I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"].forEach(function (id) {
      T.is(inv(e, id).altijdFout, REF.inv[id].altijdFout, id + " altijdFout");
      T.is(inv(e, id).geldtInTekst, REF.inv[id].geldtIn, id + " geldtInTekst");
      T.is(inv(e, id).bron, REF.inv[id].bron, id + " bron");
    });
    ["I5", "I6", "I7", "I8"].forEach(function (id) {
      T.is(inv(e, id).altijdFout, REF.inv2[id].altijdFout, id + " altijdFout");
      T.is(inv(e, id).bron, REF.inv2[id].bron, id + " bron");
    });
    ["I1", "I4"].forEach(function (id) {
      T.is(inv(e, id).altijdFout, REF.inv1[id].altijdFout, id + " altijdFout");
      T.is(inv(e, id).bron, REF.inv1[id].bron, id + " bron");
    });
  });
  reg("E3-3 Socratische vragen letterlijk: I9–I16 (sectie 6), I5–I8 (sectie 5), I1 en I4 (sectie 4)", function (e) {
    ["I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"].forEach(function (id) { T.is(inv(e, id).vraag, REF.fb[id], id + " vraag"); });
    T.is(inv(e, "I5").vraag, REF.fb2["I5"]);
    T.is(inv(e, "I8").vraag, REF.fb2["I8"]);
    T.is(inv(e, "I1").vraag, REF.fb1["I1"]);
    T.is(inv(e, "I4").vraag, REF.fb1["I4"]);
    T.is(inv(e, "I6").vraag, REF.fb2["I6, geen kweek"]);
    T.is(inv(e, "I7").vraag, REF.fb2["I7, geen kalium"]);
  });
  reg("E3-3 I6 en I7: beide casusvragen aanwezig als vraagVarianten met eigen predicaat", function (e) {
    var v6 = inv(e, "I6").vraagVarianten, v7 = inv(e, "I7").vraagVarianten;
    T.gelijk(v6.map(function (v) { return v.vraag; }), [REF.fb2["I6, geen kweek"], REF.fb2["I6, afwachten"]]);
    T.gelijk(v7.map(function (v) { return v.vraag; }), [REF.fb2["I7, geen kalium"], REF.fb2["I7, niet gehalveerd"]]);
    T.waar(heeftPad(v6[1].als, { p: "gespeeld", K: { kaart: "V1" } }) && heeftPad(v6[1].als, { p: "gespeeld", K: { kaart: "V2" } }), "I6 afwachten-variant gaat over V1/V2");
    T.waar(heeftPad(v7[0].als, { p: "opDagRelatief", K: { kaart: "O2" } }), "I7 kalium-variant gaat over O2");
    T.waar(heeftPad(v7[1].als, { p: "opDagRelatief", K: { kaart: "V6", doel: "V5", optie: "halveren" } }), "I7 halveren-variant gaat over V6 halveren");
  });
  reg("E3-3 elke invariant heeft een predicaat-object met vraag, bron en ernst; geen weglaatDownside", function (e) {
    e.invarianten.forEach(function (i) {
      T.waar(i.predicaat && typeof i.predicaat === "object" && typeof i.predicaat.p === "string", i.id + " predicaat");
      T.waar(typeof i.vraag === "string" && i.vraag.length > 0, i.id + " vraag");
      T.waar(typeof i.bron === "string" && i.bron.length > 0, i.id + " bron");
      T.waar(typeof i.ernst === "number", i.id + " ernst");
      T.is(i.weglaatDownside, undefined, i.id + " weglaatDownside is niet gebruikt (zie TODO_BART)");
    });
  });

  reg("E3-3 predicaten I1, I4, I5, I12, I10 (volgens contract en bouwopdracht 6.1)", function (e) {
    T.gelijk(inv(e, "I1").predicaat, { p: "nietGespeeld", K: { kaart: "N1" } });
    T.gelijk(inv(e, "I4").predicaat, { p: "aantalActieveAntibiotica", op: ">", n: 1 });
    T.gelijk(inv(e, "I5").predicaat, { p: "en", args: [{ p: "gestart", middel: "V3" }, { p: "waar", veld: "eGFR", op: "<", waarde: 30 }] });
    T.gelijk(inv(e, "I12").predicaat, { p: "gestart", middel: "V9" });
    T.gelijk(inv(e, "I10").predicaat, { p: "actief", middel: ["V3", "V4"], op: { eindeBeurtNaGebeurtenis: "A", offset: 0 } });
  });
  reg("E3-3 I9 volgt de CASUS-lezing: schending alleen als O2 ÉN Ev2 ontbreken, of B5 zonder eerdere Ev2 (TODO_BART-2)", function (e) {
    var i = inv(e, "I9"), pr = i.predicaat;
    T.is(pr.p, "of"); T.is(pr.args.length, 2);
    var kalium = pr.args[0];
    T.is(kalium.p, "en");
    T.waar(heeftPad(kalium, { p: "waar", veld: "eGFR", op: "<", waarde: 30 }), "eGFR < 30");
    T.waar(heeftPad(kalium, { p: "nietGespeeld", K: { kaart: "O2" } }), "O2 ontbreekt");
    T.waar(heeftPad(kalium, { p: "nietGespeeld", K: { kaart: "Ev2", doel: "spironolacton" } }), "Ev2 op spironolacton ontbreekt");
    T.waar(JSON.stringify(kalium).indexOf('"of"') < 0, "ÉN (beide ontbreken), niet OF (bouwopdracht-lezing)");
    var herstart = pr.args[1];
    T.waar(heeftPad(herstart, { p: "gespeeld", K: { kaart: "B5", doel: "spironolacton" } }), "B5 op spironolacton gespeeld");
    T.waar(heeftPad(herstart, { p: "voor", a: { kaart: "Ev2", doel: "spironolacton" }, b: { kaart: "B5", doel: "spironolacton" } }), "Ev2 vóór B5");
    T.waar(typeof i.TODO_BART === "string" && i.TODO_BART.indexOf("TODO_BART-2") > 0, "I9 heeft een TODO_BART die naar TODO_BART-2 verwijst");
  });
  reg("E3-3 I15: alle vier maatregelen binnen 2 beurten na B (ontbreekt er één = geschonden)", function (e) {
    var pr = inv(e, "I15").predicaat;
    T.is(pr.p, "niet"); T.is(pr.arg.p, "en"); T.is(pr.arg.args.length, 4);
    pr.arg.args.forEach(function (a) { T.is(a.p, "binnenBeurten"); T.is(a.naGebeurtenis, "B"); T.is(a.n, 2); });
    T.gelijk(pr.arg.args.map(function (a) { return a.K; }), [
      { kaart: "B3", doel: "spironolacton" }, { kaart: "V6", doel: "lisinopril", optie: "halveren" }, { kaart: "N3" }, { kaart: "Ev1" }]);
  });
  reg("E3-3 I16: Ev1 binnen 2 beurten na A, of 'geen verbetering' zonder Ev3", function (e) {
    var pr = inv(e, "I16").predicaat;
    T.is(pr.p, "of");
    T.gelijk(pr.args[0], { p: "niet", arg: { p: "binnenBeurten", K: { kaart: "Ev1" }, naGebeurtenis: "A", n: 2 } });
    T.waar(heeftPad(pr.args[1], { p: "klachten", waarde: "geenVerbetering48" }), "status geenVerbetering48");
    T.waar(heeftPad(pr.args[1], { p: "nietGespeeld", K: { kaart: "Ev3" } }), "Ev3 ontbreekt");
  });
  reg("E3-3 I7: O2 op verschil 1 t/m 3 (cursusdag 2–4, zelfde lezing als uwi-e2.js) en V6 halveren op verschil 3 of meer, t.o.v. de start van V5 (TODO_BART-1)", function (e) {
    var pr = inv(e, "I7").predicaat;
    T.waar(heeftPad(pr, { p: "opDagRelatief", K: { kaart: "O2" }, anker: { start: "V5" }, van: 1, tot: 3 }), "O2 1..3");
    T.waar(heeftPad(pr, { p: "opDagRelatief", K: { kaart: "V6", doel: "V5", optie: "halveren" }, anker: { start: "V5" }, van: 3 }), "V6 halveren >=3");
    T.waar(heeftPad(pr, { p: "gestart", middel: "V5" }), "alleen als trimethoprim gestart is");
    T.waar(heeftPad(pr, { p: "waar", veld: "risicogroep", op: "==", waarde: true }), "7-daagse kuur = risicogroep");
  });
  reg("E3-3 I13 en I14: V6 875/125 in dezelfde beurt; B4 of B3(calcium) in dezelfde of volgende beurt", function (e) {
    var p13 = inv(e, "I13").predicaat, i = inhoud(p13);
    T.waar(heeftPad(p13, { p: "opDagRelatief", K: { kaart: "V6", doel: "V8", optie: "875/125 mg 2 dd" }, anker: { start: "V8" }, van: 0, tot: 0 }), "V6 op dag-verschil 0");
    T.waar(heeftPad(p13, { p: "waar", veld: "eGFR", op: "<", waarde: 30 }), "bij eGFR < 30");
    T.gelijk(sleutels(i.kaart), ["V6"]);
    var p14 = inv(e, "I14").predicaat;
    T.waar(heeftPad(p14, { p: "gestart", middel: "V7" }), "ciprofloxacine gestart");
    T.waar(heeftPad(p14, { p: "opDagRelatief", K: { kaart: "B4" }, anker: { start: "V7" }, van: 0, tot: 1 }), "B4 binnen 0..1");
    T.waar(heeftPad(p14, { p: "opDagRelatief", K: { kaart: "B3", doel: "calcium" }, anker: { start: "V7" }, van: 0, tot: 1 }), "B3 op calcium binnen 0..1");
    T.waar(heeftPad(p14, { p: "medicatieActief", id: "calcium" }), "terwijl calcium actief is");
  });
  reg("E3-3 I6 en I11: volgorde met O1; I11 telt alleen kaarten vanaf de beurt van A", function (e) {
    var p6 = inv(e, "I6").predicaat;
    T.waar(heeftPad(p6, { p: "waar", veld: "risicogroep", op: "==", waarde: true }), "in de risicogroep");
    T.waar(heeftPad(p6, { p: "voor", a: { kaart: "O1" }, b: { kaartUit: "antibiotica" } }), "O1 vóór het eerste antibioticum");
    var p11 = inv(e, "I11").predicaat;
    T.waar(heeftPad(p11, { p: "voor" }), "volgorde O1 / wissel");
    var i = inhoud(p11);
    T.gelijk(sleutels(i.gebeurtenis), ["A"]);
    T.waar(i.kaart.O1 && i.kaart.B1 && i.kaart.V4 && i.kaart.V8, "O1, B1 en de antibiotica-kaarten");
  });
  reg("E3-3 I8: na C, resistent middel nog actief aan het eind van de tweede beurt, klachten houden aan", function (e) {
    var pr = inv(e, "I8").predicaat;
    T.waar(heeftPad(pr, { p: "gebeurtenisGeweest", id: "C" }), "C geweest");
    T.waar(heeftPad(pr, { p: "actief", uitSet: "resistent", op: { eindeBeurtNaGebeurtenis: "C", offset: 1 } }), "resistent actief, offset 1 = binnen 2 beurten");
    T.waar(heeftPad(pr, { p: "klachten", waarde: "aan" }) && heeftPad(pr, { p: "klachten", waarde: "geenVerbetering48" }), "klachten aan of geen verbetering");
  });
  reg("E3-3 alle predicaten gebruiken bekende predicaatnamen, kaart-ids uit het repertoire en geldige doelen", function (e) {
    var bekend = ["gespeeld", "nietGespeeld", "voor", "na", "binnenBeurten", "opDagRelatief", "gestart", "actief",
      "aantalActieveAntibiotica", "medicatieActief", "waar", "inToestand", "gebeurtenisGeweest", "klachten", "en", "of", "niet", "alsDan", "waarheid"];
    var doelen = e.patient.medicatie.map(function (m) { return m.id; }).concat(e.antibiotica);
    var gebIds = e.gebeurtenissen.map(function (x) { return x.id; });
    var n = 0;
    function check(pr, pad) {
      T.waar(pr && typeof pr === "object" && typeof pr.p === "string", pad + ": predicaat zonder 'p'");
      T.waar(bekend.indexOf(pr.p) >= 0, pad + ": onbekend predicaat " + pr.p);
      n++;
      var i = inhoud(pr);
      Object.keys(i.kaart).forEach(function (k) { T.waar(e.repertoire.indexOf(k) >= 0, pad + ": kaart " + k + " niet in repertoire"); });
      Object.keys(i.doel).forEach(function (d) { T.waar(doelen.indexOf(d) >= 0, pad + ": doel " + d + " onbekend"); });
      Object.keys(i.middel).forEach(function (m) { T.waar(e.antibiotica.indexOf(m) >= 0, pad + ": middel " + m + " is geen antibioticum van de episode"); });
      Object.keys(i.gebeurtenis).forEach(function (b) { T.waar(gebIds.indexOf(b) >= 0, pad + ": gebeurtenis " + b + " onbekend"); });
      if (pr.p === "en" || pr.p === "of") { T.waar(Array.isArray(pr.args) && pr.args.length >= 1, pad + ": args"); pr.args.forEach(function (a, k) { check(a, pad + ".args[" + k + "]"); }); }
      if (pr.p === "niet") check(pr.arg, pad + ".arg");
      if (pr.p === "alsDan") { check(pr.als, pad + ".als"); check(pr.dan, pad + ".dan"); }
      if (pr.p === "waarheid") T.waar(typeof pr.waarde === "boolean", pad + ": waarde");
      if (pr.p === "aantalActieveAntibiotica") { T.waar([">", ">=", "<", "<=", "==", "="].indexOf(pr.op) >= 0, pad + ": op"); T.waar(typeof pr.n === "number", pad + ": n"); }
      if (pr.p === "waar") { T.waar(typeof pr.veld === "string" && pr.op && pr.waarde !== undefined, pad + ": waar-velden"); T.waar(pr.veld in e.patient.waar, pad + ": veld " + pr.veld + " staat niet in patient.waar"); }
      if (pr.p === "binnenBeurten") { T.waar(typeof pr.naGebeurtenis === "string" && typeof pr.n === "number", pad + ": binnenBeurten-velden"); }
      if (pr.p === "opDagRelatief") { T.waar(pr.K && pr.anker && typeof pr.van === "number", pad + ": opDagRelatief-velden"); }
      if (pr.p === "voor" || pr.p === "na") { T.waar(pr.a && pr.b, pad + ": voor/na-velden"); }
      if (pr.p === "gespeeld" || pr.p === "nietGespeeld") { T.waar(pr.K && typeof pr.K === "object", pad + ": K ontbreekt"); }
    }
    e.invarianten.forEach(function (i) { check(i.predicaat, "invariant " + i.id); (i.vraagVarianten || []).forEach(function (v, k) { check(v.als, "invariant " + i.id + " variant " + k); }); });
    e.score.duurzaamheid.regels.forEach(function (r, k) { check(r.als, "duurzaamheid[" + k + "]"); });
    e.score.doelmatigheid.regels.forEach(function (r, k) { check(r.als, "doelmatigheid[" + k + "]"); });
    e.profielen.forEach(function (p) { check(p.als, "profiel " + p.naam); });
    e.feedbackExtra.forEach(function (f, k) { check(f.trigger, "feedbackExtra[" + k + "]"); });
    e.zichtbaarAlsOntbreekt.forEach(function (z, k) { check(z.trigger, "zichtbaarAlsOntbreekt[" + k + "]"); });
    Object.keys(e.werkzaamheid).forEach(function (t) { e.werkzaamheid[t].werkzaam.forEach(function (w) { if (w.als) check(w.als, "werkzaamheid " + t + " " + w.kaart); }); });
    T.waar(n >= 80, "te weinig predicaten gecontroleerd: " + n);
  });
  reg("E3-3 predicaten zijn verwerkbaar door Predicaten.evalueer op een lege tijdlijn (alleen als predicaten.js geladen is)", function (e) {
    if (!g.Predicaten || typeof g.Predicaten.evalueer !== "function") return;
    var ctx = g.Predicaten.maakContext(casus(), e, { tijdlijn: [], gebeurtenissen: [], toestanden: ["cystitis"], klachten: [], dag: 1, aantalDagen: 7 });
    function ev(pr, pad) { try { g.Predicaten.evalueer(pr, ctx); } catch (x) { throw new Error(pad + ": " + x.message); } }
    e.invarianten.forEach(function (i) { ev(i.predicaat, "invariant " + i.id); (i.vraagVarianten || []).forEach(function (v) { ev(v.als, "variant " + i.id); }); });
    e.score.duurzaamheid.regels.forEach(function (r, k) { ev(r.als, "duurzaamheid[" + k + "]"); });
    e.score.doelmatigheid.regels.forEach(function (r, k) { ev(r.als, "doelmatigheid[" + k + "]"); });
    e.profielen.forEach(function (p) { ev(p.als, "profiel " + p.naam); });
    e.feedbackExtra.forEach(function (f, k) { ev(f.trigger, "feedbackExtra[" + k + "]"); });
    e.zichtbaarAlsOntbreekt.forEach(function (z, k) { ev(z.trigger, "zichtbaarAlsOntbreekt[" + k + "]"); });
  });
  reg("E3-3 geen middelnamen of drempels als klinische tekst in predicaten (alleen kaart-ids)", function (e) {
    var tekst = JSON.stringify(e.invarianten.map(function (i) { return [i.predicaat, (i.vraagVarianten || []).map(function (v) { return v.als; })]; }));
    ["nitrofuranto", "fosfomycine", "trimethoprim", "ciprofloxacine", "cotrimoxazol", "amoxicilline"].forEach(function (m) { T.waar(tekst.toLowerCase().indexOf(m) < 0, "middelnaam in predicaat: " + m); });
  });

  /* ---------- werkzaamheid, status ---------- */
  reg("E3-4 werkzaamheid per toestand volgens 6.3, V7 met als-voorwaarde (B4 of B3 op calcium)", function (e) {
    var w = e.werkzaamheid;
    T.gelijk(Object.keys(w).filter(function (k) { return k !== "statusTeksten"; }), ["cystitis", "weefselinvasie"]);
    var ids = function (l) { return l.map(function (x) { return x.kaart; }); };
    T.waar(ids(w.cystitis.werkzaam).indexOf("V4") >= 0, "cystitis: V4 werkzaam");
    T.waar(ids(w.cystitis.werkzaam).indexOf("V3") < 0 && ids(w.cystitis.werkzaam).indexOf("V5") < 0, "cystitis: V3 en V5 niet werkzaam");
    T.gelijk(ids(w.cystitis.nietWerkzaam), ["V3", "V5"]);
    T.waar(ids(w.weefselinvasie.werkzaam).indexOf("V8") >= 0, "weefselinvasie: V8 werkzaam");
    T.waar(ids(w.weefselinvasie.werkzaam).indexOf("V3") < 0 && ids(w.weefselinvasie.werkzaam).indexOf("V4") < 0 && ids(w.weefselinvasie.werkzaam).indexOf("V10") < 0, "weefselinvasie: V3, V4, V10 niet werkzaam");
    ["V3", "V4", "V10"].forEach(function (k) { T.waar(ids(w.weefselinvasie.nietWerkzaam).indexOf(k) >= 0, k + " expliciet niet werkzaam bij weefselinvasie"); });
    var v7 = vind(w.weefselinvasie.werkzaam, "V7", "kaart");
    T.waar(!!v7 && !!v7.als, "V7 alleen werkzaam met een als-voorwaarde");
    T.waar(heeftPad(v7.als, { p: "gespeeld", K: { kaart: "B4" } }) && heeftPad(v7.als, { p: "gespeeld", K: { kaart: "B3", doel: "calcium" } }), "als: B4 of B3 op calcium");
    T.is(v7.als.p, "of");
    T.waar(heeftPad(vind(w.weefselinvasie.nietWerkzaam, "V7", "kaart").als, { p: "niet" }), "V7 zonder scheiding is niet werkzaam");
    T.waar(ids(w.cystitis.werkzaam).indexOf("V9") >= 0 && ids(w.weefselinvasie.werkzaam).indexOf("V9") >= 0, "V9 is wel werkzaam (maar I12)");
    T.waar(typeof w.weefselinvasie.TODO_BART === "string", "TODO_BART bij de niet genoemde werkzaamheden");
  });
  reg("E3-4 statusTeksten", function (e) {
    T.is(e.statusTeksten.af, "klachten nemen af");
    T.is(e.statusTeksten.aan, "klachten houden aan");
    T.is(e.statusTeksten.geenVerbetering48, "Na 48 uur geen verbetering.");
    T.waar(typeof e.statusTeksten.TODO_BART === "string", "TODO_BART bij de statusteksten");
  });
  reg("E3-4 zichtbaarAlsOntbreekt: sick day-maatregelen, ciprofloxacine zonder B4/B3, I9 gemist (letterlijk)", function (e) {
    var z = e.zichtbaarAlsOntbreekt;
    T.is(z.length, 3);
    T.is(z[0].tekst, "De nierfunctie daalt verder en het kalium stijgt.");
    T.is(z[1].tekst, "Na 48 uur geen verbetering.");
    T.is(z[2].tekst, "Het kalium is onbekend, en niemand heeft naar spironolacton gekeken.");
    T.waar(REF.zicht[0].indexOf(z[0].tekst) > 0 && REF.zicht[0].indexOf(z[0].toelichting) > 0, "casus: tekst en toelichting bij 'Geen sick day-maatregelen'");
    T.waar(REF.zicht[1].indexOf(z[1].tekst) > 0, "casus: ciprofloxacine zonder B4/B3");
    T.waar(REF.zicht[2].indexOf(z[2].tekst) > 0, "casus: I9 gemist");
    T.gelijk(z[1].trigger, inv(e, "I14").predicaat, "'Ciprofloxacine zonder B4/B3' = de I14-schending");
    T.gelijk(z[2].trigger, inv(e, "I9").predicaat, "'I9 gemist' = de I9-schending");
    T.waar(heeftPad(z[0].trigger, { p: "gebeurtenisGeweest", id: "B" }), "alleen na B");
    ["N3", "Ev1"].forEach(function (k) { T.waar(heeftPad(z[0].trigger, { p: "nietGespeeld", K: { kaart: k } }), "zonder " + k); });
  });

  /* ---------- score, profielen, feedback ---------- */
  reg("E3-5 profielen: Kweekgestuurd (reflectievraag ontbreekt = null + TODO_BART) en Richtlijn eerste keus (reflectievraag letterlijk)", function (e) {
    T.gelijk(e.profielen.map(function (p) { return p.naam; }), ["Kweekgestuurd", "Richtlijn eerste keus"]);
    var k = e.profielen[0], r = e.profielen[1];
    T.is(k.reflectievraag, null);
    T.waar(typeof k.TODO_BART === "string", "Kweekgestuurd heeft TODO_BART");
    T.is(r.reflectievraag, REF.fb["Profiel ciprofloxacine"]);
    T.gelijk(k.als, { p: "gestart", middel: "V8" });
    T.gelijk(r.als, { p: "gestart", middel: "V7" });
    T.is(k.casusTekst, "Kweekgestuurd; scoort hoger. De keuze leunt op de eerdere kweek en vermijdt de risico's van ciprofloxacine bij ouderen [NHG].");
    T.is(r.casusTekst, "Eerste keus volgens de richtlijn; eigen profiel");
  });
  reg("E3-5 score: duurzaamheid V8=3, V7 met wissel naar V8 na C=3, V7 anders=2; doelmatigheid 3 als G3 vóór de eerste V-kaart, anders 2", function (e) {
    var d = e.score.duurzaamheid.regels, m = e.score.doelmatigheid.regels;
    T.gelijk(d.map(function (r) { return r.punten; }), [3, 3, 2]);
    T.waar(heeftPad(d[0].als, { p: "gestart", middel: "V8" }) && heeftPad(d[0].als, { p: "niet", arg: { p: "gestart", middel: "V7" } }), "V8 zonder V7");
    T.waar(heeftPad(d[1].als, { p: "gespeeld", K: { start: "V8", naGebeurtenis: "C" } }), "wissel naar V8 na C");
    T.gelijk(d[2].als, { p: "gestart", middel: "V7" });
    T.gelijk(m.map(function (r) { return r.punten; }), [3, 2]);
    T.waar(heeftPad(m[0].als, { p: "gespeeld", K: { kaart: "G3" } }), "G3 gespeeld");
    T.waar(heeftPad(m[0].als, { p: "voor", a: { kaart: "G3" } }), "G3 vóór de voorschrijfkaart");
    T.gelijk(m[1].als, { p: "waarheid", waarde: true });
    T.is(e.score.duurzaamheid.casusTekst, REF.score[1].slice(REF.score[1].indexOf(":** ") + 4));
    T.is(e.score.doelmatigheid.casusTekst, REF.score[2].slice(REF.score[2].indexOf(":** ") + 4));
    T.waar(typeof e.score.duurzaamheid.TODO_BART === "string", "TODO_BART bij routes zonder V7/V8");
  });
  reg("E3-5 feedbackExtra: Automatische herstart en Ciprofloxacine-dosis (bronconflict) letterlijk, geen invariant", function (e) {
    T.is(e.feedbackExtra.length, 2);
    T.is(e.feedbackExtra[0].vraag, REF.fb["Automatische herstart"]);
    T.is(e.feedbackExtra[1].vraag, REF.fb["Ciprofloxacine-dosis (bronconflict)"]);
    T.is(e.feedbackExtra[1].toelichting, REF.bronconflict);
    e.feedbackExtra.forEach(function (f) {
      T.waar(["altijd", "alleenBijGehaaldePoort"].indexOf(f.wanneer) >= 0, "wanneer");
      T.waar(typeof f.TODO_BART === "string", "TODO_BART bij de trigger");
    });
    T.gelijk(e.feedbackExtra[0].trigger, { p: "gespeeld", K: { kaart: "B5" } });
    T.gelijk(e.feedbackExtra[1].trigger, { p: "gestart", middel: "V7" });
    T.waar(!e.invarianten.some(function (i) { return /bronconflict|dosis/i.test(i.altijdFout); }), "het bronconflict is geen invariant");
  });

  reg("S-LETTER: geen markdown-sterretjes en geen dubbele/rare spaties in de data", function (e) {
    alleStrings(e, [], "E3").forEach(function (x) {
      T.waar(x.s.indexOf("**") < 0, "markdown ** in " + x.pad);
      T.waar(x.s === x.s.trim(), "spatie aan rand in " + x.pad);
      T.waar(x.s.indexOf("  ") < 0, "dubbele spatie in " + x.pad);
      T.waar(!/[   ]/.test(x.s), "onzichtbare spatie in " + x.pad);
    });
  });
  reg("S-LETTER: elke vraag van een invariant en elke feedbacktekst komt voor in de referentietabellen", function (e) {
    var alle = [];
    ["fb", "fb1", "fb2"].forEach(function (t) { Object.keys(REF[t]).forEach(function (k) { alle.push(REF[t][k]); }); });
    e.invarianten.forEach(function (i) { T.waar(alle.indexOf(i.vraag) >= 0, i.id + " vraag staat niet in de casus"); (i.vraagVarianten || []).forEach(function (v) { T.waar(alle.indexOf(v.vraag) >= 0, i.id + " variant"); }); });
    e.feedbackExtra.forEach(function (f) { T.waar(alle.indexOf(f.vraag) >= 0, "feedbackExtra-vraag staat niet in de casus"); });
    e.profielen.forEach(function (p) { if (p.reflectievraag !== null) T.waar(alle.indexOf(p.reflectievraag) >= 0, p.naam + " reflectievraag"); });
  });

  reg("S-TODO: elke TODO_BART-markering in E3 staat ook in casus.todoBart (id, vraag, gekozenLezing, plek)", function (e) {
    var lijst = casus().todoBart || [];
    var mijn = lijst.filter(function (t) { return /^TODO_BART-E3-/.test(t.id); });
    T.waar(mijn.length >= 18, "verwacht minstens 18 E3-TODO's, kreeg " + mijn.length);
    mijn.forEach(function (t) {
      ["id", "vraag", "gekozenLezing", "plek"].forEach(function (k) { T.waar(typeof t[k] === "string" && t[k].length > 0, t.id + " mist " + k); });
    });
    var ids = mijn.map(function (t) { return t.id; });
    T.is(ids.filter(function (v, i) { return ids.indexOf(v) === i; }).length, ids.length, "dubbele TODO-ids");
    var vragen = lijst.map(function (t) { return t.vraag; });
    var markeringen = [];
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]"); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { if (k === "TODO_BART") markeringen.push({ pad: pad, v: x[k] }); else walk(x[k], pad + "." + k); });
    })(e, "E3");
    T.waar(markeringen.length >= 15, "te weinig TODO_BART-markeringen in de data: " + markeringen.length);
    markeringen.forEach(function (m) { T.waar(vragen.indexOf(m.v) >= 0, "TODO_BART op " + m.pad + " staat niet in casus.todoBart: " + m.v); });
  });
  reg("S-TODO: de gekozen lezingen die de casus-onduidelijkheden dekken (TODO_BART-2 I9, -6 tweede O1, -1 dag 2–4, -3/-4 vroeg afronden)", function (e) {
    var tekst = JSON.stringify(casus().todoBart.filter(function (t) { return /^TODO_BART-E3-/.test(t.id); }));
    ["TODO_BART-2", "TODO_BART-6", "TODO_BART-1", "TODO_BART-3", "TODO_BART-4"].forEach(function (id) { T.waar(tekst.indexOf(id + ")") >= 0, "geen E3-TODO die naar " + id + " verwijst"); });
  });
  // Vastgepind: precies deze markeringen op precies deze plekken, elk gekoppeld aan één casus.todoBart-id. E3-15 staat op I4, E3-16 op I5, E3-24 op I15.
  var MARKERINGEN = {
    "E3.knoppen": "TODO_BART-E3-17", "E3.patient": "TODO_BART-E3-8", "E3.gebeurtenissen[0]": "TODO_BART-E3-3", "E3.gebeurtenissen[2]": "TODO_BART-E3-4",
    "E3.werkzaamheid.weefselinvasie": "TODO_BART-E3-9", "E3.statusTeksten": "TODO_BART-E3-10", "E3.invarianten[0]": "TODO_BART-E3-7",
    "E3.invarianten[1]": "TODO_BART-E3-15", "E3.invarianten[2]": "TODO_BART-E3-16", "E3.invarianten[3]": "TODO_BART-E3-18", "E3.invarianten[4]": "TODO_BART-E3-19", "E3.invarianten[5]": "TODO_BART-E3-23", "E3.invarianten[6]": "TODO_BART-E3-1",
    "E3.invarianten[7]": "TODO_BART-E3-5", "E3.invarianten[11]": "TODO_BART-E3-6", "E3.invarianten[12]": "TODO_BART-E3-24", "E3.invarianten[13]": "TODO_BART-E3-2", "E3.score": "TODO_BART-E3-22",
    "E3.score.duurzaamheid": "TODO_BART-E3-11", "E3.score.doelmatigheid": "TODO_BART-E3-20", "E3.score.doelmatigheid.regels[1]": "TODO_BART-E3-21",
    "E3.profielen[0]": "TODO_BART-E3-12", "E3.feedbackExtra[0]": "TODO_BART-E3-13", "E3.feedbackExtra[1]": "TODO_BART-E3-13", "E3.zichtbaarAlsOntbreekt[0]": "TODO_BART-E3-14"
  };
  reg("S-TODO: exact 24 E3-TODO's (E3-1 t/m E3-24, aaneengesloten) en de markeringen staan op de vastgelegde plekken met de vraag van hun TODO", function (e) {
    var mijn = (casus().todoBart || []).filter(function (t) { return /^TODO_BART-E3-/.test(t.id); });
    T.gelijk(mijn.map(function (t) { return t.id; }), Array.apply(null, Array(24)).map(function (_, k) { return "TODO_BART-E3-" + (k + 1); }));
    var gevonden = {};
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]"); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) {
        if (k === "TODO_BART") {
          var t = mijn.filter(function (m) { return m.vraag === x[k]; })[0];
          gevonden[pad] = t ? t.id : "ONBEKEND: " + x[k];
        } else walk(x[k], pad + "." + k);
      });
    })(e, "E3");
    T.gelijk(gevonden, MARKERINGEN);
  });
  reg("S-TODO: E3-24 legt het conflict I15/Ev1 'binnen 1–3 dagen' (casus) tegen 'binnen 2 beurten' (bouwopdracht 6.1) vast, met de strengere lezing en het alternatief", function (e) {
    var t = casus().todoBart.filter(function (x) { return x.id === "TODO_BART-E3-24"; })[0];
    T.waar(!!t, "TODO_BART-E3-24 bestaat");
    ["1–3 dagen", "2 beurten", "Ev1", "bouwopdracht 6.1", "strengere lezing", "Alternatief"].forEach(function (w) {
      T.waar((t.vraag + " " + t.gekozenLezing).indexOf(w) >= 0, "E3-24 noemt '" + w + "'");
    });
    T.is(inv(e, "I15").TODO_BART, t.vraag, "markering op I15");
  });
  reg("E3-3 I7 route: casusroute V5 dag 1 + O2 dag 2 (+ V6 halveren dag 4) slaagt in E3; O2 op dag 1 of dag 5 of ontbrekend schendt (zelfde lezing als episode 2)", function (e) {
    var E = g.Engine, P = g.Predicaten;
    function speel(plan) {
      var s = E.nieuwSpel(casus(), "E3", { rng: function () { return 0; } });
      for (var d = 1; d <= 5; d++) {
        (plan[d] || []).forEach(function (k) { var r = E.speelKaart(s, k[0], k[1] || {}); if (r && r.ok === false) throw new Error("kaart geweigerd: " + k[0] + " dag " + d + " " + r.fout); });
        if (d < 5) E.volgendeDag(s);
      }
      return P.evalueer(inv(e, "I7").predicaat, P.maakContext(casus(), e, s));
    }
    var halveer = ["V6", { doel: "V5", optie: "halveren" }];
    T.is(speel({ 1: [["G3"], ["V5"]], 2: [["O2"]], 4: [halveer] }), false, "V5 d1, O2 d2, halveren d4 = geen schending");
    T.is(speel({ 1: [["G3"], ["V5"]], 4: [["O2"], halveer] }), false, "O2 op dag 4 (verschil 3) = geen schending");
    T.is(speel({ 1: [["G3"], ["V5"], ["O2"]], 4: [halveer] }), true, "O2 op dag 1 (verschil 0) = schending");
    T.is(speel({ 1: [["G3"], ["V5"]], 5: [["O2"], halveer] }), true, "O2 op dag 5 (verschil 4) = schending");
    T.is(speel({ 1: [["G3"], ["V5"]], 2: [["O2"]], 3: [halveer] }), true, "halveren op dag 3 (verschil 2) = schending");
    T.is(speel({ 1: [["G3"], ["V5"]], 4: [halveer] }), true, "zonder O2 = schending");
  });
  reg("S-TODO: E3-3 (vroeg afronden) noemt het ontlopen van A, B en C expliciet, het alternatief, en de data zet het flag niet (LEAD: standaard uit)", function (e) {
    var t = casus().todoBart.filter(function (x) { return x.id === "TODO_BART-E3-3"; })[0];
    T.waar(t.vraag.indexOf("A, B of C") > 0 && t.vraag.indexOf("TODO_BART-4") > 0, "vraag noemt A, B of C en verwijst naar TODO_BART-4");
    ["ontloopt", "omzeilen", "standaard UIT", "LEAD-beslissing", "milde lezing", "Alternatief", "afrondenPasNaGebeurtenissen = true", "I8 na C", "I10, I11 en I16 na A", "I15 na B"].forEach(function (w) {
      T.waar(t.gekozenLezing.indexOf(w) >= 0, "gekozenLezing noemt '" + w + "'");
    });
    T.is(e.afrondenPasNaGebeurtenissen, undefined, "afrondenPasNaGebeurtenissen blijft ongezet (engine-default uit)");
    T.waar(!("afrondenPasNaGebeurtenissen" in e), "geen sleutel afrondenPasNaGebeurtenissen");
  });
  reg("S-TODO: E3-8 kiest de letterlijke casusregel mét '(hypertensie)' en noemt het alternatief; E3-20..23 hebben de verwachte kern", function (e) {
    var l = function (id) { return casus().todoBart.filter(function (x) { return x.id === id; })[0]; };
    T.waar(l("TODO_BART-E3-8").gekozenLezing.indexOf("Meest letterlijke lezing") === 0 && l("TODO_BART-E3-8").gekozenLezing.indexOf("mét '(hypertensie)'") > 0 && l("TODO_BART-E3-8").gekozenLezing.indexOf("Alternatief") > 0, "E3-8");
    T.waar(l("TODO_BART-E3-20").gekozenLezing.indexOf("V1 t/m V10 inclusief V6") > 0, "E3-20 (welke kaarten tellen voor G3 vóór de eerste keuze)");
    T.waar(/Ev3/.test(l("TODO_BART-E3-21").vraag) && /overbodig onderzoek/.test(l("TODO_BART-E3-21").vraag), "E3-21 (Ev3 en overbodig onderzoek niet gescoord)");
    T.waar(/Onnodig gewisseld/.test(l("TODO_BART-E3-22").vraag) && /O1 gespeeld/.test(l("TODO_BART-E3-22").vraag), "E3-22 (E1/E2-feedback niet doorgetrokken)");
    T.waar(/op welke dag/.test(l("TODO_BART-E3-23").vraag) && /I8/.test(l("TODO_BART-E3-23").vraag), "E3-23 (klachten-dag van I8)");
  });

  })(typeof window !== "undefined" ? window : globalThis);

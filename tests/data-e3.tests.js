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
    T.is(z.risicogroep, undefined, "de risicogroep-uitleg staat NIET in patient.zichtbaar (student mag hem niet vooraf lezen)");
    T.is(e.patient.meta.risicogroep, "Risicogroep [NHG].");
    T.is(z.kop + " " + z.klachten, REF.patient.kopKlachten, "kop + klachten teken voor teken");
    T.is(z.medicatieTekst, REF.patient.medicatieregel, "medicatieTekst = casusregel mét '(hypertensie)' en slotpunt (zoals E1/E2)");
    T.is(e.patient.casusMedicatieregel, REF.patient.medicatieregel, "casusMedicatieregel mét slotpunt");
    T.is(z.labTekst + " " + e.patient.meta.risicogroep, REF.patient.lab, "lab + risicogroep teken voor teken");
    T.is(e.patient.meta.toelichting, REF.patientToelichting);
    T.is(e.patient.toelichting, undefined, "ontwerpnoten staan onder meta");
    T.waar(typeof e.patient.meta.TODO_BART === "string" && e.patient.meta.TODO_BART.indexOf("Mag de student de risicogroepmelding zien?") === 0, "TODO_BART bij de risicogroepmelding");
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
    T.is(v[0].onthult, "de kweek uit episode 2, met trimethoprim resistent.", "mét slotpunt, zoals de casusbron");
    T.is(v[0].zichtbaar.eerdereKweek, "de kweek uit episode 2, met trimethoprim resistent.");
    T.is(v[0].toelichting, undefined, "ontwerpnoten staan onder meta");
    T.is(v[0].meta.toelichting, "Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG].");
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
  reg("E3-2 gebeurtenissen A, B, S, C, C2: teksten letterlijk, groep AB, n=4, m=7, C en C2 3 dagen na O1", function (e) {
    T.gelijk(e.gebeurtenissen.map(function (x) { return x.id; }), ["A", "B", "S", "C", "C2"]);
    var A = vind(e.gebeurtenissen, "A"), B = vind(e.gebeurtenissen, "B"), C = vind(e.gebeurtenissen, "C");
    T.is(A.tekst, REF.gebeurtenis.A.tekst);
    T.is(B.tekst, REF.gebeurtenis.B.tekst);
    T.is(C.tekst, REF.gebeurtenis.C.tekst);
    T.waar(A.tekst.indexOf("38,6 °C") > 0, "A noemt 38,6 °C");
    T.is(A.groep, "AB"); T.is(B.groep, "AB"); T.is(C.groep, undefined);
    T.gelijk(A.trigger, { type: "naKaart", n: 4 });
    T.gelijk(B.trigger, { type: "naKaart", n: 7 });
    T.gelijk(C.trigger, { type: "naDagenNaKaart", kaart: "O1", dagen: 3 });
    // Tweede uitslag (nieuwe kweek na weefselinvasie): zelfde tekst en gevoeligheden, 3 dagen na de tweede O1.
    var C2 = vind(e.gebeurtenissen, "C2");
    T.gelijk(C2.trigger, { type: "naDagenNaKaart", kaart: "O1", dagen: 3, nummer: 2 });
    T.is(C2.tekst, C.tekst); T.gelijk(C2.zet, C.zet);
    T.is(A.toestand, "weefselinvasie"); T.is(B.toestand, "uitdroging"); T.is(C.toestand, undefined);
    T.gelijk(A.zet, { statusNaBeurten: 2 });
    T.is(A.opmerking, undefined); T.is(B.opmerking, undefined);
    T.waar(A.meta.opmerking.indexOf("neutraal") > 0 && B.meta.opmerking.indexOf("neutraal") > 0, "ontwerpnoot onder meta");
    T.gelijk(C.zet, { resistent: ["V5", "V10"], gevoelig: ["V8", "V7", "V4", "V3"] });
  });
  reg("E3-6 knoppen: 3 acties, 7 dagen, raadplegen kost 1; casus-regels bewaard", function (e) {
    T.is(e.knoppen.actiesPerBeurt, 3); T.is(e.knoppen.aantalDagen, 14); T.is(e.knoppen.raadplegenKost, 1);
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
    T.waar(typeof i.TODO_BART === "string" && i.TODO_BART.indexOf("'geen O2 én geen Ev2'") > 0 && i.TODO_BART.indexOf("'O2 of Ev2 ontbreekt'") > 0, "I9 heeft een TODO_BART met beide lezingen");
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
    var bekend = ["gespeeld", "nietGespeeld", "voor", "na", "binnenBeurten", "opDagRelatief", "gestart", "actief", "actiefNaDagen",
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
    T.is(e.statusTeksten.af, "klachten nemen af.");
    T.is(e.statusTeksten.aan, "klachten houden aan.");
    T.is(e.statusTeksten.geenVerbetering48, "Na 48 uur geen verbetering.");
    T.waar(typeof e.statusTeksten.TODO_BART === "string", "TODO_BART bij de statusteksten");
  });
  reg("E3-4 zichtbaarAlsOntbreekt: sick day-maatregelen, ciprofloxacine zonder B4/B3, I9 gemist (letterlijk)", function (e) {
    var z = e.zichtbaarAlsOntbreekt;
    T.is(z.length, 3);
    T.is(z[0].tekst, "De nierfunctie daalt verder en het kalium stijgt.");
    T.is(z[1].tekst, "Na 48 uur geen verbetering.");
    T.is(z[2].tekst, "Het kalium is onbekend, en niemand heeft naar spironolacton gekeken.");
    T.is(z[0].toelichting, undefined, "ontwerpnoot onder meta");
    T.waar(REF.zicht[0].indexOf(z[0].tekst) > 0 && REF.zicht[0].indexOf(z[0].meta.toelichting) > 0, "casus: tekst en toelichting bij 'Geen sick day-maatregelen'");
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
    T.is(e.feedbackExtra[1].meta.toelichting, REF.bronconflict);
    T.is(e.feedbackExtra[1].toelichting, undefined, "ontwerpnoten staan onder meta");
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
  reg("S-TODO: de gekozen lezingen dekken de casus-onduidelijkheden (I9 O2/Ev2, tweede O1, dag 2–4, vroeg afronden)", function (e) {
    var tekst = JSON.stringify(casus().todoBart.filter(function (t) { return /^TODO_BART-E3-/.test(t.id); }));
    ["'geen O2 én geen Ev2'", "tweede kweekuitslag", "'dag 2–4 na de start'", "Vroeg afronden vóór gebeurtenis A, B of C"].forEach(function (w) { T.waar(tekst.indexOf(w) >= 0, "geen E3-TODO over: " + w); });
  });
  reg("S-TODO: TODO-teksten zijn zelfstandig leesbaar voor Bart (geen verwijzing naar contract, LEAD, rondes, stukken, TODO-nummers of parameternamen)", function (e) {
    var verboden = [/contract/i, /LEAD/, /\bronde/i, /\bstuk\b/i, /TODO_BART-\w*\d/, /afrondenPasNaGebeurtenissen/, /vraagVarianten/, /weglaatDownside/, /zichtbaarAlsOntbreekt/, /geldtIn/, /opDagRelatief/, /binnenBeurten/, /reflectievraag =/, /`/];
    var teksten = [];
    casus().todoBart.filter(function (t) { return /^TODO_BART-E3-/.test(t.id); }).forEach(function (t) { teksten.push({ pad: t.id + ".vraag", s: t.vraag }, { pad: t.id + ".gekozenLezing", s: t.gekozenLezing }); });
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]"); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) { if (/^TODO_BART/.test(k) && typeof x[k] === "string") teksten.push({ pad: pad + "." + k, s: x[k] }); else walk(x[k], pad + "." + k); });
    })(e, "E3");
    T.waar(teksten.length >= 50, "te weinig TODO-teksten gecontroleerd: " + teksten.length);
    teksten.forEach(function (t) { verboden.forEach(function (re) { T.waar(!re.test(t.s), t.pad + " bevat een interne verwijzing (" + re + "): " + t.s.slice(0, 80)); }); });
  });
  // Vastgepind: precies deze markeringen op precies deze plekken, elk gekoppeld aan één casus.todoBart-id. E3-15 staat op I4, E3-16 op I5, E3-24 op I15, E3-25 op statusTeksten (TODO_BART_randgeval), E3-26 op patient.meta.
  var MARKERINGEN = {
    "E3.knoppen": "TODO_BART-E3-17", "E3.patient": "TODO_BART-E3-8", "E3.patient.meta": "TODO_BART-E3-26", "E3.statusTeksten.TODO_BART_randgeval": "TODO_BART-E3-25", "E3.gebeurtenissen[0]": "TODO_BART-E3-3", "E3.gebeurtenissen[4]": "TODO_BART-E3-4",
    "E3.werkzaamheid.weefselinvasie": "TODO_BART-E3-9", "E3.statusTeksten": "TODO_BART-E3-10", "E3.invarianten[0]": "TODO_BART-E3-7",
    "E3.invarianten[1]": "TODO_BART-E3-15", "E3.invarianten[2]": "TODO_BART-E3-16", "E3.invarianten[3]": "TODO_BART-E3-18", "E3.invarianten[4]": "TODO_BART-E3-19", "E3.invarianten[5]": "TODO_BART-E3-23", "E3.invarianten[6]": "TODO_BART-E3-1",
    "E3.invarianten[7]": "TODO_BART-E3-5", "E3.invarianten[11]": "TODO_BART-E3-6", "E3.invarianten[12]": "TODO_BART-E3-24", "E3.invarianten[13]": "TODO_BART-E3-2", "E3.score": "TODO_BART-E3-22",
    "E3.score.duurzaamheid": "TODO_BART-E3-11", "E3.score.doelmatigheid": "TODO_BART-E3-20", "E3.score.doelmatigheid.regels[1]": "TODO_BART-E3-21",
    "E3.profielen[0]": "TODO_BART-E3-12", "E3.feedbackExtra[0]": "TODO_BART-E3-13", "E3.feedbackExtra[1]": "TODO_BART-E3-13", "E3.zichtbaarAlsOntbreekt[0]": "TODO_BART-E3-14"
  };
  reg("S-TODO: exact 26 E3-TODO's (E3-1 t/m E3-26, aaneengesloten) en de markeringen staan op de vastgelegde plekken met de vraag van hun TODO", function (e) {
    var mijn = (casus().todoBart || []).filter(function (t) { return /^TODO_BART-E3-/.test(t.id); });
    T.gelijk(mijn.map(function (t) { return t.id; }), Array.apply(null, Array(26)).map(function (_, k) { return "TODO_BART-E3-" + (k + 1); }));
    var gevonden = {};
    (function walk(x, pad) {
      if (Array.isArray(x)) x.forEach(function (v, i) { walk(v, pad + "[" + i + "]"); });
      else if (x && typeof x === "object") Object.keys(x).forEach(function (k) {
        if (/^TODO_BART/.test(k) && typeof x[k] === "string") {
          var t = mijn.filter(function (m) { return m.vraag === x[k]; })[0];
          gevonden[k === "TODO_BART" ? pad : pad + "." + k] = t ? t.id : "ONBEKEND: " + x[k];
        } else walk(x[k], pad + "." + k);
      });
    })(e, "E3");
    function gesorteerd(o) { var r = {}; Object.keys(o).sort().forEach(function (k) { r[k] = o[k]; }); return r; }
    T.gelijk(gesorteerd(gevonden), gesorteerd(MARKERINGEN));
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
      var s = E.nieuwSpel(g.Test.oudeRegels(), "E3", { rng: function () { return 0; } });
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
  reg("S-TODO: E3-3 (vroeg afronden) noemt het ontlopen van A, B en C expliciet, het alternatief, en de data zet het flag niet (standaard vrij afronden)", function (e) {
    var t = casus().todoBart.filter(function (x) { return x.id === "TODO_BART-E3-3"; })[0];
    T.waar(t.vraag.indexOf("A, B of C") > 0, "vraag noemt A, B of C");
    ["niet toegestaan", "aankomen", "dagen niet om zijn", "Alternatief", "I8, I10, I11, I15, I16"].forEach(function (w) {
      T.waar(t.gekozenLezing.indexOf(w) >= 0, "gekozenLezing noemt '" + w + "'");
    });
    T.is(e.afrondenPasNaGebeurtenissen, true, "afrondenPasNaGebeurtenissen staat aan (casus 1.2)");
  });
  reg("S-TODO: E3-8 kiest de letterlijke casusregel mét '(hypertensie)' en noemt het alternatief; E3-20..23 hebben de verwachte kern", function (e) {
    var l = function (id) { return casus().todoBart.filter(function (x) { return x.id === id; })[0]; };
    T.waar(l("TODO_BART-E3-8").gekozenLezing.indexOf("Meest letterlijke lezing") === 0 && l("TODO_BART-E3-8").gekozenLezing.indexOf("mét '(hypertensie)'") > 0 && l("TODO_BART-E3-8").gekozenLezing.indexOf("Alternatief") > 0, "E3-8");
    T.waar(l("TODO_BART-E3-20").gekozenLezing.indexOf("V1 t/m V10 inclusief V6") > 0, "E3-20 (welke kaarten tellen voor G3 vóór de eerste keuze)");
    T.waar(/Ev3/.test(l("TODO_BART-E3-21").vraag) && /overbodig onderzoek/.test(l("TODO_BART-E3-21").vraag), "E3-21 (Ev3 en overbodig onderzoek niet gescoord)");
    T.waar(/Onnodig gewisseld/.test(l("TODO_BART-E3-22").vraag) && /O1 gespeeld/.test(l("TODO_BART-E3-22").vraag), "E3-22 (E1/E2-feedback niet doorgetrokken)");
    T.waar(/Na 48 uur geen verbetering/.test(l("TODO_BART-E3-25").vraag) && /eerste periode/.test(l("TODO_BART-E3-25").gekozenLezing) && /Alternatief/.test(l("TODO_BART-E3-25").gekozenLezing), "E3-25 (randgeval klachtenstatus: alleen de eerste nul-periode telt)");
    T.waar(/risicogroepmelding/.test(l("TODO_BART-E3-26").vraag) && /^Nee/.test(l("TODO_BART-E3-26").gekozenLezing) && l("TODO_BART-E3-26").plek === "E3.patient.meta.risicogroep", "E3-26 (risicogroepmelding niet zichtbaar)");
    T.waar(/op welke dag/.test(l("TODO_BART-E3-23").vraag) && /I8/.test(l("TODO_BART-E3-23").vraag), "E3-23 (klachten-dag van I8)");
  });

  /* ---------- gedragstests via de Engine: routes en kruiscontrole met een EIGEN oracle ---------- */
  // KRUISCONTROLE: het oracle hieronder is onafhankelijk van de predicaten in de data. Het leest alleen de tijdlijn, de gebeurtenissen en de
  // klachtenstatus uit de Engine-state, en is geschreven uit casus-uwi.md sectie 4–6 (en de gekozen lezingen in casus.todoBart).
  // Zo is de vastgepinde stand hieronder niet de enige bescherming van de logica (invarianten, score, profiel, vragen, zichtbaar-zinnen).
  var SP = "spironolacton", V6L = "V6:lisinopril:halveren", V6A = "V6:V8:875/125 mg 2 dd", ANTI = ["V3", "V4", "V5", "V7", "V8", "V9", "V10"];
  function eng() { return g.Engine && g.Predicaten && casus() && e3() ? g.Engine : null; }
  function spec(x) { var p = x.split(":"); return { k: p[0], o: { doel: p[1] || undefined, optie: p[2] || undefined } }; }
  function speelPlan(plan, volgorde) {
    var E = g.Engine, s = E.nieuwSpel(g.Test.oudeRegels(), "E3", { rng: volgorde === "BA" ? function () { return 0.999; } : function () { return 0; } });
    for (var d = 0; d < plan.length; d++) {
      if (d > 0) E.volgendeDag(s);
      plan[d].forEach(function (x) { var q = spec(x), r = E.speelKaart(s, q.k, q.o); if (!r.ok) throw new Error("kaart geweigerd: " + x + " dag " + s.dag + ": " + r.fout); });
    }
    while (!s.dagenVoorbij) E.volgendeDag(s);
    return s;
  }
  function speelPlanVrij(plan, volgorde) { // weigert niet: negeert geweigerde kaarten (voor het willekeurige corpus)
    var E = g.Engine, s = E.nieuwSpel(g.Test.oudeRegels(), "E3", { rng: volgorde === "BA" ? function () { return 0.999; } : function () { return 0; } });
    for (var d = 0; d < plan.length; d++) {
      if (d > 0) { if (s.dagenVoorbij) break; E.volgendeDag(s); }
      plan[d].forEach(function (x) { var q = spec(x); E.speelKaart(s, q.k, q.o); });
    }
    while (!s.dagenVoorbij) E.volgendeDag(s);
    return s;
  }
  function gelden(e, s, inv) {
    return inv.geldtIn.some(function (x) {
      if (x === "*") return true;
      if (typeof x === "string") return s.toestanden.indexOf(x) >= 0;
      return s.gebeurtenissen.some(function (b) { return b.id === x.gebeurtenis; });
    });
  }
  function dataSchendingen(e, s) {
    var ctx = g.Predicaten.maakContext(casus(), e, s);
    return e.invarianten.filter(function (i) { return gelden(e, s, i) && g.Predicaten.evalueer(i.predicaat, ctx); }).map(function (i) { return i.id; });
  }
  // Eigen oracle (tijdlijn-gebaseerd)
  function oracle(s) {
    var t = s.tijdlijn.slice().sort(function (a, b) { return a.volg - b.volg; });
    var geb = function (id) { return s.gebeurtenissen.filter(function (x) { return x.id === id; })[0]; };
    var dA = geb("A") && geb("A").dag, dB = geb("B") && geb("B").dag, dC = geb("C") && geb("C").dag;
    var uit = {};
    function eerste(f) { return t.filter(f)[0]; }
    function heeft(f) { return t.some(f); }
    function sim(maxDag, maxVolg) {
      var act = {}, max = 0;
      t.forEach(function (r) {
        if (maxDag != null && r.dag > maxDag) return;
        if (maxVolg != null && r.volg > maxVolg) return;
        if (r.kaart === "B1") { if (r.doel) { act = {}; act[r.doel] = true; } }
        else if (r.kaart === "B2") { if (r.doel) delete act[r.doel]; }
        else if (ANTI.indexOf(r.kaart) >= 0) act[r.kaart] = true;
        max = Math.max(max, Object.keys(act).length);
      });
      return { act: act, max: max };
    }
    function starts(m) { return t.filter(function (r) { return r.kaart === m || (r.kaart === "B1" && r.doel === m); }); }
    var isAnti = function (r) { return ANTI.indexOf(r.kaart) >= 0; };
    if (!heeft(function (r) { return r.kaart === "N1"; })) uit.I1 = 1;
    if (sim().max > 1) uit.I4 = 1;
    if (starts("V3").length) uit.I5 = 1;
    var fa = eerste(isAnti), o1 = eerste(function (r) { return r.kaart === "O1"; });
    var i6a = !!(fa && !(o1 && o1.volg < fa.volg)), i6b = heeft(function (r) { return r.kaart === "V1" || r.kaart === "V2"; });
    if (i6a || i6b) uit.I6 = 1;
    var s5 = starts("V5"), i7a = false, i7b = false;
    if (s5.length) {
      var a = s5[0].dag;
      // casus 1.2: alleen de 7-daagse kuur (V5 nog actief aan het einde van start+2 voor kalium, start+3 voor halveren)
      i7a = !!sim(a + 2).act.V5 && !heeft(function (r) { return r.kaart === "O2" && r.dag - a >= 1 && r.dag - a <= 3; });
      i7b = !!sim(a + 3).act.V5 && !heeft(function (r) { return r.kaart === "V6" && r.doel === "V5" && r.optie === "halveren" && r.dag - a >= 3; });
      if (i7a || i7b) uit.I7 = 1;
    }
    if (dC != null) {
      var st = s.klachten[dC] && s.klachten[dC].status, act = sim(dC + 1).act;
      if ((st === "aan" || st === "geenVerbetering48") && (act.V5 || act.V10)) uit.I8 = 1;
    }
    var ev2 = eerste(function (r) { return r.kaart === "Ev2" && r.doel === SP; }), b5 = eerste(function (r) { return r.kaart === "B5" && r.doel === SP; });
    var heeftO2 = heeft(function (r) { return r.kaart === "O2"; });
    var i9 = (!heeftO2 && !ev2) || !!(b5 && !(ev2 && ev2.volg < b5.volg));
    if (i9) uit.I9 = 1;
    if (dA != null) { var a10 = sim(dA).act; if (a10.V3 || a10.V4) uit.I10 = 1; }
    if (dA != null) {
      var wis = t.filter(function (r) { return r.dag >= dA && (r.kaart === "B1" || isAnti(r)); });
      if (wis.length) { var o1n = eerste(function (r) { return r.kaart === "O1" && r.dag >= dA; }); if (!(o1n && o1n.volg < wis[0].volg)) uit.I11 = 1; }
    }
    if (starts("V9").length) uit.I12 = 1;
    var s8 = starts("V8");
    if (s8.length && !heeft(function (r) { return r.kaart === "V6" && r.doel === "V8" && r.optie === "875/125 mg 2 dd" && r.dag === s8[0].dag; })) uit.I13 = 1;
    var s7 = starts("V7"), i14 = false;
    if (s7.length) {
      var a7 = s7[0], pauze = {};
      t.forEach(function (r) { if (r.volg > a7.volg) return; if (r.kaart === "B3" && r.doel) pauze[r.doel] = 1; if (r.kaart === "B5" && r.doel) delete pauze[r.doel]; });
      var ok = heeft(function (r) { return (r.kaart === "B4" || (r.kaart === "B3" && r.doel === "calcium")) && r.dag - a7.dag >= 0 && r.dag - a7.dag <= 1; });
      i14 = !pauze.calcium && !ok;
      if (i14) uit.I14 = 1;
    }
    var geenSick = false;
    if (dB != null) {
      var bin = function (f) { return heeft(function (r) { return f(r) && r.dag >= dB && r.dag <= dB + 1; }); };
      var m1 = bin(function (r) { return r.kaart === "B3" && r.doel === SP; }), m2 = bin(function (r) { return r.kaart === "V6" && r.doel === "lisinopril" && r.optie === "halveren"; });
      var m3 = bin(function (r) { return r.kaart === "N3"; }), m4 = bin(function (r) { return r.kaart === "Ev1"; });
      if (!(m1 && m2 && m3 && m4)) uit.I15 = 1;
    }
    if (dB != null) geenSick = !heeft(function (r) { return r.kaart === "B3" && r.doel === SP; }) && !heeft(function (r) { return r.kaart === "V6" && r.doel === "lisinopril" && r.optie === "halveren"; }) && !heeft(function (r) { return r.kaart === "N3"; }) && !heeft(function (r) { return r.kaart === "Ev1"; });
    if (dA != null) {
      var ev1 = heeft(function (r) { return r.kaart === "Ev1" && r.dag >= dA && r.dag <= dA + 1; });
      var gv = s.klachten.some(function (k) { return k && k.status === "geenVerbetering48"; }), ev3 = heeft(function (r) { return r.kaart === "Ev3"; });
      if (!ev1 || (gv && !ev3)) uit.I16 = 1;
    }
    var ids = Object.keys(uit).sort(function (x, y) { return +x.slice(1) - +y.slice(1); });
    // score, profiel, extra vragen, zichtbaar-zinnen, vraagkeuze
    var v8 = starts("V8").length > 0, v7 = s7.length > 0, v8naC = heeft(function (r) { return (r.kaart === "V8" || (r.kaart === "B1" && r.doel === "V8")) && dC != null && r.dag >= dC; });
    var dur = v8 && !v7 ? 3 : (v7 && v8naC ? 3 : (v7 ? 2 : undefined));
    var g3 = eerste(function (r) { return r.kaart === "G3"; }), eV = eerste(function (r) { return /^V(10|[1-9])$/.test(r.kaart); });
    var doel = g3 && (!eV || g3.volg < eV.volg) ? 3 : 2;
    var calcOpen = false;
    if (s7.length) { var p2 = {}; t.forEach(function (r) { if (r.volg > s7[0].volg) return; if (r.kaart === "B3" && r.doel) p2[r.doel] = 1; if (r.kaart === "B5" && r.doel) delete p2[r.doel]; }); calcOpen = !p2.calcium; }
    return {
      ids: ids, dur: dur, doel: doel, profiel: v8 ? "Kweekgestuurd" : (v7 ? "Richtlijn eerste keus" : null),
      extra: [heeft(function (r) { return r.kaart === "B5"; }) ? 0 : null, v7 ? 1 : null].filter(function (x) { return x !== null; }),
      zicht: [dB != null && geenSick ? 0 : null, i14 ? 1 : null, i9 ? 2 : null].filter(function (x) { return x !== null; }),
      i6v: i6a ? 0 : (i6b ? 1 : null), i7v: i7a ? 0 : (i7b ? 1 : null)
    };
  }
  function gedrag(e, s) {
    var P = g.Predicaten, ctx = P.maakContext(casus(), e, s);
    function eerstePunten(as) { var r = e.score[as].regels; for (var i = 0; i < r.length; i++) if (P.evalueer(r[i].als, ctx)) return r[i].punten; return undefined; }
    var prof = null; for (var i = 0; i < e.profielen.length; i++) if (P.evalueer(e.profielen[i].als, ctx)) { prof = e.profielen[i].naam; break; }
    function vraagIdx(id) {
      var inv = vind(e.invarianten, id);
      for (var k = 0; k < inv.vraagVarianten.length; k++) if (P.evalueer(inv.vraagVarianten[k].als, ctx)) return k;
      return null;
    }
    return {
      ids: dataSchendingen(e, s), dur: eerstePunten("duurzaamheid"), doel: eerstePunten("doelmatigheid"), profiel: prof,
      extra: e.feedbackExtra.map(function (f, k) { return P.evalueer(f.trigger, ctx) ? k : null; }).filter(function (x) { return x !== null; }),
      zicht: e.zichtbaarAlsOntbreekt.map(function (z, k) { return P.evalueer(z.trigger, ctx) ? k : null; }).filter(function (x) { return x !== null; }),
      i6v: dataSchendingen(e, s).indexOf("I6") >= 0 ? vraagIdx("I6") : null, i7v: dataSchendingen(e, s).indexOf("I7") >= 0 ? vraagIdx("I7") : null
    };
  }
  var A1 = [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", V6A], ["Ev1", "B3:" + SP, V6L], ["N3"]];
  var A2 = [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V7", "B4:V7"], ["B1:V8", V6A, "Ev1"], ["B3:" + SP, V6L, "N3"]];
  var A3 = [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V7", "B3:calcium"], ["Ev1", "B3:" + SP, V6L], ["N3", "B5:" + SP]];
  var BA1 = [["G3", "O1", "V4"], ["N1"], ["B3:" + SP, V6L], ["N3", "Ev1", "O2"], ["O1", "B1:V8", V6A], ["Ev1", "Ev2:" + SP]];
  function wijzig(plan, dag, nieuw) { var p = JSON.parse(JSON.stringify(plan)); p[dag] = nieuw; return p; }
  // Elke route: plan, volgorde, EXACT verwachte lijst geschonden invarianten (met de hand bepaald uit de casus), score/profiel waar de poort gehaald is.
  var ROUTES = [
    { n: "geldig: fosfomycine > amoxicilline/clavulaanzuur 875/125 (Kweekgestuurd 3/3)", p: A1, o: "AB", i: [], dur: 3, doel: 3, prof: "Kweekgestuurd" },
    { n: "geldig BA: amoxicilline/clavulaanzuur 875/125 (Kweekgestuurd 3/3)", p: BA1, o: "BA", i: [], dur: 3, doel: 3, prof: "Kweekgestuurd" },
    { n: "geldig: ciprofloxacine + B4, daarna de-escalatie naar V8 (3/3)", p: A2, o: "AB", i: [], dur: 3, doel: 3, prof: "Kweekgestuurd" },
    { n: "geldig: ciprofloxacine + B3 op calcium, blijft (Richtlijn eerste keus 2/3)", p: A3, o: "AB", i: [], dur: 2, doel: 3, prof: "Richtlijn eerste keus" },
    { n: "geldig: ciprofloxacine + B4 blijft (2/3)", p: [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V7", "B4:V7"], ["Ev1", "B3:" + SP, V6L], ["N3"]], o: "AB", i: [], dur: 2, doel: 3, prof: "Richtlijn eerste keus" },
    { n: "I1: geen N1", p: wijzig(A1, 1, ["G1", "O2", "Ev2:" + SP]), o: "AB", i: ["I1"] },
    { n: "I5: nitrofurantoïne gestart", p: wijzig(A1, 0, ["G3", "O1", "V3"]), o: "AB", i: ["I5"] },
    { n: "I12: cotrimoxazol", p: wijzig(A1, 2, ["O1", "B1:V9"]), o: "AB", i: ["I12"] },
    { n: "I13: V8 zonder V6", p: wijzig(A1, 2, ["O1", "B1:V8"]), o: "AB", i: ["I13"] },
    { n: "I13: V8 met V6 500/125", p: wijzig(A1, 2, ["O1", "B1:V8", "V6:V8:500/125 mg 2 dd"]), o: "AB", i: ["I13"] },
    { n: "I13: V6 875/125 een dag later", p: [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8"], [V6A, "Ev1", "B3:" + SP], [V6L, "N3"]], o: "AB", i: ["I13"] },
    { n: "I15: zonder N3", p: wijzig(wijzig(A1, 3, ["Ev1", "B3:" + SP, V6L]), 4, []), o: "AB", i: ["I15"] },
    { n: "I15: zonder B3 op spironolacton", p: wijzig(wijzig(A1, 3, ["Ev1", V6L, "N3"]), 4, []), o: "AB", i: ["I15"] },
    { n: "I15: zonder V6 lisinopril halveren", p: wijzig(wijzig(A1, 3, ["Ev1", "B3:" + SP, "N3"]), 4, []), o: "AB", i: ["I15"] },
    { n: "I15 en I16: zonder Ev1", p: wijzig(wijzig(A1, 3, ["B3:" + SP, V6L, "N3"]), 4, []), o: "AB", i: ["I15", "I16"], zicht: [] },
    { n: "I9: geen O2 en geen Ev2", p: wijzig(A1, 1, ["N1"]), o: "AB", i: ["I9"], zicht: [2] },
    { n: "I9: O2 wel, Ev2 niet, geen B5 = geen schending", p: wijzig(A1, 1, ["N1", "O2"]), o: "AB", i: [], dur: 3, doel: 3, prof: "Kweekgestuurd" },
    { n: "I9: B5 zonder Ev2", p: wijzig(wijzig(A1, 1, ["N1", "O2"]), 4, ["N3", "B5:" + SP]), o: "AB", i: ["I9"], zicht: [2] },
    { n: "geldig: B5 na Ev2 (extra vraag Automatische herstart)", p: wijzig(A1, 4, ["N3", "B5:" + SP]), o: "AB", i: [], dur: 3, doel: 3, prof: "Kweekgestuurd", extra: [0] },
    { n: "I11: wisselen zonder O1 na A", p: wijzig(A1, 2, ["B1:V8", V6A]), o: "AB", i: ["I11"] },
    { n: "I6: V4 voor O1", p: wijzig(A1, 0, ["G3", "V4", "O1"]), o: "AB", i: ["I6"], i6v: 0 },
    { n: "I6: afwachten (V1) in de risicogroep", p: wijzig(A1, 4, ["N3", "V1"]), o: "AB", i: ["I6"], i6v: 1 },
    { n: "I4 en I10: twee antibiotica, V4 blijft actief na A", p: wijzig(A1, 2, ["O1", "V8", V6A]), o: "AB", i: ["I4", "I10"] },
    { n: "I10 (en I16): V4 blijft na A, geen wissel", p: wijzig(A1, 2, ["O1"]), o: "AB", i: ["I10", "I16"] },
    { n: "I14: ciprofloxacine zonder B4/B3", p: wijzig(A2, 2, ["O1", "B1:V7"]), o: "AB", i: ["I14"], zicht: [1] },
    { n: "I14: B4 te laat (twee dagen na de start)", p: [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V7"], ["Ev1", "B3:" + SP, V6L], ["N3", "B4:V7"]], o: "AB", i: ["I14", "I16"], zicht: [1] },
    { n: "I7: V5 met O2 en halveren = geen I7", p: [["G3", "O1", "V5"], ["N1", "O2", "B2:V5"], ["Ev2:" + SP, "Ev1"], ["B3:" + SP, V6L, "N3"], ["V6:V5:halveren"]], o: "AB", i7: false },
    { n: "I7: V5 gestopt op dag 2 (geen 7-daagse kuur) = geen I7", p: [["G3", "O1", "V5"], ["N1", "O2", "B2:V5"], ["Ev2:" + SP, "Ev1"], ["B3:" + SP, V6L, "N3"], []], o: "AB", i7: false },
    { n: "I7: geen halveren", p: [["G3", "O1", "V5"], ["N1", "O2"], ["Ev2:" + SP, "Ev1"], ["B3:" + SP, V6L, "N3"], ["B2:V5"]], o: "AB", i7: true, i7v: 1 },
    { n: "I7: halveren te vroeg (verschil 2)", p: [["G3", "O1", "V5"], ["N1", "O2"], ["Ev2:" + SP, "Ev1", "V6:V5:halveren"], ["B3:" + SP, V6L, "N3"], ["B2:V5"]], o: "AB", i7: true, i7v: 1 },
    { n: "I7: halveren op verschil 5 = geen I7", p: [["G3", "O1", "V5"], ["N1", "O2", "B2:V5"], ["Ev2:" + SP, "Ev1"], ["B3:" + SP, V6L, "N3"], [], ["V6:V5:halveren"]], o: "AB", i7: false },
    { n: "I7: O2 op verschil 4 (te laat)", p: [["G3", "O1", "V5"], ["N1"], ["Ev2:" + SP, "Ev1"], ["B3:" + SP, V6L, "N3"], ["O2", "V6:V5:halveren"]], o: "AB", i7: true, i7v: 0 },
    { n: "I7: O2 op verschil 3 = geen I7", p: [["G3", "O1", "V5"], ["N1"], ["Ev2:" + SP, "Ev1"], ["B3:" + SP, V6L, "O2"], ["N3", "V6:V5:halveren"]], o: "AB", i7: false },
    { n: "I7: geen O2", p: [["G3", "O1", "V5"], ["N1"], ["Ev2:" + SP, "Ev1"], ["B3:" + SP, V6L, "N3"], ["V6:V5:halveren"]], o: "AB", i7: true, i7v: 0 },
    { n: "I8: trimethoprim blijft na de kweekuitslag (klachten houden aan)", p: [["G3", "O1", "V5"], ["N1", "O2", "Ev2:" + SP], ["Ev1", "B3:" + SP, V6L], ["N3", "V6:V5:halveren"]], o: "AB", i8: true },
    { n: "I8: trimethoprim gestopt op de dag van de kweekuitslag = geen I8", p: [["G3", "O1", "V5"], ["N1", "O2", "Ev2:" + SP], ["B2:V5", "Ev1", "B3:" + SP], [V6L, "N3", "V6:V5:halveren"]], o: "AB", i8: false },
    { n: "I8: V10 (resistent) blijft na de kweekuitslag", p: [["G3", "O1", "V10"], ["N1", "O2", "Ev2:" + SP], ["Ev1", "B3:" + SP, V6L], ["N3"]], o: "AB", i8: true },
    { n: "I8: wissel naar werkzaam V8 vóór het eind van de tweede beurt = geen I8", p: [["G3", "O1", "V5"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", V6A], ["Ev1", "B3:" + SP, V6L], ["N3"]], o: "AB", i8: false }
  ];
  ROUTES.forEach(function (r) {
    reg("E3-route (Engine) " + r.n, function (e) {
      if (!eng()) return;
      var s = speelPlan(r.p, r.o), gd = gedrag(e, s), orc = oracle(s);
      var echt = gd.ids;
      if (r.i) T.gelijk(echt, r.i, "geschonden invarianten (verwacht met de hand)");
      if (r.i7 !== undefined) T.is(echt.indexOf("I7") >= 0, r.i7, "I7");
      if (r.i8 !== undefined) T.is(echt.indexOf("I8") >= 0, r.i8, "I8");
      if (r.i7v !== undefined) T.is(gd.i7v, r.i7v, "I7-vraagvariant");
      if (r.i6v !== undefined) T.is(gd.i6v, r.i6v, "I6-vraagvariant");
      if (r.dur !== undefined || (r.i && r.i.length === 0)) { T.is(gd.dur, r.dur, "duurzaamheid"); T.is(gd.doel, r.doel, "doelmatigheid"); T.is(gd.profiel, r.prof, "profiel"); }
      if (r.extra) T.gelijk(gd.extra, r.extra, "extra vragen");
      if (r.zicht) T.gelijk(gd.zicht, r.zicht, "zichtbaar-zinnen");
      T.gelijk(echt, orc.ids, "data == eigen oracle (kruiscontrole)");
    });
  });
  reg("E3-route (Engine) I6- en I7-vragen komen uit de juiste variant (tekst letterlijk uit de casus)", function (e) {
    if (!eng()) return;
    var i6 = vind(e.invarianten, "I6"), i7 = vind(e.invarianten, "I7");
    T.gelijk(i6.vraagVarianten.map(function (v) { return v.vraag; }), [REF.fb2["I6, geen kweek"], REF.fb2["I6, afwachten"]]);
    T.gelijk(i7.vraagVarianten.map(function (v) { return v.vraag; }), [REF.fb2["I7, geen kalium"], REF.fb2["I7, niet gehalveerd"]]);
    var P = g.Predicaten;
    function idx(s, inv) { var ctx = P.maakContext(casus(), e, s); for (var k = 0; k < inv.vraagVarianten.length; k++) if (P.evalueer(inv.vraagVarianten[k].als, ctx)) return k; return null; }
    T.is(idx(speelPlan(wijzig(A1, 0, ["G3", "V4", "O1"]), "AB"), i6), 0);
    T.is(idx(speelPlan(wijzig(A1, 4, ["N3", "V1"]), "AB"), i6), 1);
    T.is(idx(speelPlan(A1, "AB"), i6), null);
    T.is(idx(speelPlan(wijzig(A1, 4, ["N3", "V2"]), "AB"), i6), 1, "V2 telt ook als afwachten");
  });
  reg("E3-route (Engine) zichtbaar-zin 'geen sick day-maatregelen' alleen als B geweest is en alle vier de maatregelen ontbreken", function (e) {
    if (!eng()) return;
    var basis = [["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", V6A], [], ["N3"]];
    var s = speelPlan(basis.map(function (d) { return d.filter(function (x) { return x !== "N3"; }); }), "AB");
    T.waar(gedrag(e, s).zicht.indexOf(0) < 0 || s.gebeurtenissen.some(function (b) { return b.id === "B"; }), "alleen na B");
    // B komt na de 7e kaart: speel 7 kaarten zonder een sick day-maatregel
    var s2 = speelPlan([["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", V6A], []], "AB");
    T.waar(s2.gebeurtenissen.some(function (b) { return b.id === "B"; }), "B opgetreden na 7 kaarten");
    T.gelijk(gedrag(e, s2).zicht, [0]);
    [["Ev1"], ["N3"], [V6L], ["B3:" + SP]].forEach(function (m) {
      var s3 = speelPlan([["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", V6A], m], "AB");
      T.is(gedrag(e, s3).zicht.indexOf(0) < 0, true, "één maatregel (" + m[0] + ") gespeeld = zin niet getoond");
    });
    T.gelijk(gedrag(speelPlan(A1, "AB") && e, speelPlan(A1, "AB")).zicht, []);
  });
  reg("E3-route (Engine) G3 vóór de eerste V-kaart (doelmatigheid 3) of daarna/niet (2)", function (e) {
    if (!eng()) return;
    T.is(gedrag(e, speelPlan(A1, "AB")).doel, 3);
    T.is(gedrag(e, speelPlan(wijzig(A1, 0, ["O1", "V4", "G3"]), "AB")).doel, 2, "G3 na V4");
    T.is(gedrag(e, speelPlan(wijzig(A1, 0, ["O1", "V4"]), "AB")).doel, 2, "zonder G3");
    T.is(gedrag(e, speelPlan(wijzig(A1, 0, ["G3", "O1", "V6:V4:x"].slice(0, 2).concat(["V4"])), "AB")).doel, 3);
    T.is(gedrag(e, speelPlan([["O1", "V4", "G3"], ["N1", "O2", "Ev2:" + SP], ["B1:V8", V6A], ["Ev1", "B3:" + SP, V6L], ["N3"]], "AB")).doel, 2, "V6 telt als V-kaart; G3 na V4");
    // V6 (dosering) vóór G3 telt ook als keuze: V4, V6 (bij een gestart middel) dan G3
    T.is(gedrag(e, speelPlan([["G3", "O1", "V4"], ["N1", "O2", "Ev2:" + SP], ["O1", "B1:V8", V6A], ["Ev1", "B3:" + SP, V6L], ["N3"]], "AB")).doel, 3);
  });
  reg("E3-route (Engine) kruiscontrole: 600 willekeurige en afgeleide spelen, data == eigen oracle (schendingen, score, profiel, extra vragen, zichtbaar-zinnen, vraagkeuze)", function (e) {
    if (!eng()) return;
    var POOL = ["G1", "G3", "O1", "O2", "V1", "V2", "V3", "V4", "V5", "V7", "V8", "V9", "V10", "N1", "N3", "Ev1", "Ev3", "V6:V5:halveren", V6A, "V6:V8:500/125 mg 2 dd", V6L,
      "B1:V3", "B1:V4", "B1:V5", "B1:V7", "B1:V8", "B1:V9", "B1:V10", "B2:V4", "B2:V5", "B2:V7", "B2:V8", "B3:" + SP, "B3:calcium", "B5:" + SP, "B4:V7", "Ev2:" + SP];
    var BASES = { AB: [A1, A2, A3], BA: [BA1] }, seed = 11;
    function r() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    var tellers = {}, n = 0;
    for (var i = 0; i < 600; i++) {
      var order = r() < 0.5 ? "AB" : "BA", plan;
      if (r() < 0.2) {
        plan = []; var nd = 1 + Math.floor(r() * 7);
        for (var d = 0; d < nd; d++) { var k = Math.floor(r() * 4), dag = []; for (var j = 0; j < k; j++) dag.push(POOL[Math.floor(r() * POOL.length)]); plan.push(dag); }
      } else {
        var lijst = BASES[order]; plan = JSON.parse(JSON.stringify(lijst[Math.floor(r() * lijst.length)]));
        while (plan.length < 7) plan.push([]);
        var m = Math.floor(r() * 4);
        for (var q = 0; q < m; q++) {
          var t = r(), dd = Math.floor(r() * 7);
          if (t < 0.3) { if (plan[dd].length) plan[dd].splice(Math.floor(r() * plan[dd].length), 1); }
          else if (t < 0.6) { if (plan[dd].length < 3) plan[dd].splice(Math.floor(r() * (plan[dd].length + 1)), 0, POOL[Math.floor(r() * POOL.length)]); }
          else if (t < 0.8) { if (plan[dd].length) plan[dd][Math.floor(r() * plan[dd].length)] = POOL[Math.floor(r() * POOL.length)]; }
          else { var d2 = Math.min(6, dd + 1); if (plan[dd].length && plan[d2].length < 3) plan[d2].push(plan[dd].pop()); }
        }
      }
      var s = speelPlanVrij(plan, order), gd = gedrag(e, s), orc = oracle(s);
      gd.ids.forEach(function (id) { tellers[id] = (tellers[id] || 0) + 1; });
      var a = JSON.stringify(gd), b = JSON.stringify(orc, ["ids", "dur", "doel", "profiel", "extra", "zicht", "i6v", "i7v"]);
      if (a !== b) { n++; if (n <= 3) throw new Error("verschil data/oracle (" + order + " " + JSON.stringify(plan) + "):\n data  " + a + "\n oracle " + b); }
    }
    ["I1", "I4", "I5", "I6", "I7", "I8", "I9", "I10", "I11", "I12", "I13", "I14", "I15", "I16"].forEach(function (id) { T.waar((tellers[id] || 0) >= 3, "te weinig dekking in het corpus voor " + id + ": " + (tellers[id] || 0)); });
  });

  /* ---------- vastgepinde stand (mutatietest-dekking) ---------- */
  // Vastgelegd na handmatige controle en na de mutatieset van ronde 2: elke betekenisvolle wijziging van een predicaat, getal, id, toestand,
  // werkzaamheidslijst, score/profielregel, trigger, flag of TODO-tekst maakt minstens één test rood. De klinische teksten staan daarnaast
  // los tegen de casus (REF hierboven); deze pin voorkomt dat logica ongemerkt verschuift.
  var GOLD = {
  "episode": {
    "id": "E3",
    "level": 3,
    "titel": "Episode 3 — level 3",
    "startToestanden": ["cystitis"],
    "knoppen": {"actiesPerBeurt":3,"aantalDagen":14,"raadplegenKost":1,"casusTekst":["volledig repertoire (26 kaarten)","acties per beurt krap","2 gebeurtenissen in vrije volgorde, plus de kweekuitslag"],"TODO_BART":"Acties per beurt in episode 3: de casus noemt 'krap', bouwopdracht 6.6 zegt 3 (zelfde als E1 en E2)."},
    "afrondenPasNaGebeurtenissen": true,
    "startUitleg": "Het doel: de klachten nemen zo snel mogelijk af. Houden ze aan, dan wordt het erger.",
    "escalatie": {"aan":true,"stappen":[{"doelEvent":"A","dagen":4},{"doelEvent":"S","dagen":4}],"waarschuwing":"Klachten houden aan: dag","uitleg":"Houden de klachten aan, dan wordt het erger. Kies nu een middel of stuur bij."},
    "antibiotica": ["V3","V4","V5","V7","V8","V9","V10"],
    "patient": {"zichtbaar":{"kop":"Mevrouw V., 79 jaar (1 jaar na episode 2).","naam":"Mevrouw V.","leeftijd":79,"klachten":"Cystitis, geen koorts.","medicatie":["lisinopril","spironolacton","calcium/colecalciferol"],"medicatieTekst":"lisinopril, spironolacton (hypertensie), calcium/colecalciferol.","lab":{"eGFR":28,"datum":"recent"},"labTekst":"eGFR 28, recent."},"waar":{"eGFR":28,"risicogroep":true},"medicatie":[{"id":"lisinopril","label":"lisinopril"},{"id":"spironolacton","label":"spironolacton"},{"id":"calcium","label":"calcium/colecalciferol"}],"casusMedicatieregel":"lisinopril, spironolacton (hypertensie), calcium/colecalciferol.","meta":{"risicogroep":"Risicogroep [NHG].","toelichting":"Wie spironolacton heeft gestart en waarom, staat er bewust niet op. Het leerpunt: als de nierfunctie daalt, kijk je niet alleen naar wat je nu voorschrijft, maar naar alles wat de patiënt al gebruikt. In de praktijk wordt dat vaak gemist.","TODO_BART":"Mag de student de risicogroepmelding zien? De casus zet bij de patiëntkaart (bij het lab) de zin 'Risicogroep [NHG].' Die zin vertelt vooraf dat deze patiënt in de risicogroep valt. Mag hij bij de patiëntkaart getoond worden, of alleen in het overzicht voor de docent?"},"verborgen":[{"kaart":"G3","sleutel":"eerdereKweek","onthult":"de kweek uit episode 2, met trimethoprim resistent.","zichtbaar":{"eerdereKweek":"de kweek uit episode 2, met trimethoprim resistent."},"meta":{"toelichting":"Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG]."}}],"TODO_BART":"Patiëntkaart: de casusregel luidt 'spironolacton (hypertensie)', terwijl de regel eronder zegt dat wie spironolacton startte en waarom bewust niet op de kaart staat. Mag de reden (hypertensie) zichtbaar zijn?"},
    "repertoire": ["G1","G2","G3","O1","O2","V1","V2","V3","V4","V5","V6","V7","V8","V9","V10","B1","B2","B3","B5","B4","N1","N2","N3","Ev1","Ev2","Ev3"],
    "gebeurtenissen": [{"id":"A","groep":"AB","trigger":{"type":"naKaart","n":4},"toestand":"weefselinvasie","zet":{"statusNaBeurten":2},"tekst":"Weefselinvasie: koorts 38,6 °C en flankpijn","meta":{"opmerking":"De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler."},"TODO_BART":"Vroeg afronden vóór gebeurtenis A, B of C (en dus ontlopen van I8, I10, I11, I15, I16)?"},{"id":"B","groep":"AB","trigger":{"type":"naKaart","n":7},"toestand":"uitdroging","tekst":"Uitdroging: eet en drinkt slecht, twee dagen koorts. Daarmee is de SIDRIK-drempel gehaald (koorts ≥ 38,5 °C gedurende 2 dagen en/of braken of diarree > 3× per dag) [SIDRIK]","meta":{"opmerking":"De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler."}},{"id":"S","titel":"Sepsis","trigger":{"type":"opTeller"},"toestand":"sepsis","tekst":"Sepsis: de patiënt is ernstig ziek."},{"id":"C","trigger":{"type":"naDagenNaKaart","kaart":"O1","dagen":3},"aankondiging":"Uitslag verwacht","tekst":"Kweekuitslag. E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine en nitrofurantoïne.","zet":{"resistent":["V5","V10"],"gevoelig":["V8","V7","V4","V3"]}},{"id":"C2","titel":"Kweekuitslag (nieuwe kweek)","trigger":{"type":"naDagenNaKaart","kaart":"O1","dagen":3,"nummer":2},"aankondiging":"Uitslag verwacht","tekst":"Kweekuitslag. E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine en nitrofurantoïne.","zet":{"resistent":["V5","V10"],"gevoelig":["V8","V7","V4","V3"]},"TODO_BART":"Een tweede kweekuitslag in episode 3 (nieuwe O1 na weefselinvasie): voorlopig komt er een tweede kweekuitslag, 3 dagen na de nieuwe kweek, met dezelfde bacterie en dezelfde gevoeligheden. Kan de gevoeligheid bij weefselinvasie afwijken? (Vraag voor de huisarts.) De 3 dagen zijn Barts keuze; de oorspronkelijke 2–4 dagen kwamen via Mistral en zijn niet gecheckt."}],
    "werkzaamheid": {"cystitis":{"werkzaam":[{"kaart":"V4"},{"kaart":"V9"}],"nietWerkzaam":[{"kaart":"V3"},{"kaart":"V5"}]},"weefselinvasie":{"werkzaam":[{"kaart":"V8"},{"kaart":"V9"},{"kaart":"V7","als":{"p":"of","args":[{"p":"gespeeld","K":{"kaart":"B4"}},{"p":"gespeeld","K":{"kaart":"B3","doel":"calcium"}}]}}],"nietWerkzaam":[{"kaart":"V3"},{"kaart":"V4"},{"kaart":"V10"},{"kaart":"V7","als":{"p":"niet","arg":{"p":"of","args":[{"p":"gespeeld","K":{"kaart":"B4"}},{"p":"gespeeld","K":{"kaart":"B3","doel":"calcium"}}]}}}],"TODO_BART":"Werkzaamheid in episode 3 (bouwopdracht 6.3): niet genoemd zijn V7 en V8 bij cystitis en V5 bij weefselinvasie; V9 is 'wel werkzaam'."}},
    "statusTeksten": {"af":"klachten nemen af.","aan":"klachten houden aan.","geenVerbetering48":"Na 48 uur geen verbetering.","TODO_BART":"Welke tekst hoort bij welke klachtenstatus in episode 3?","TODO_BART_randgeval":"Randgeval klachtenstatus na gebeurtenis A: stel dat na A eerst een werkzaam antibioticum actief is (de klachten nemen af), en daarna weer een periode komt zonder werkzaam antibioticum. Geldt dan opnieuw 'Na 48 uur geen verbetering.'?"},
    "invarianten": [{"id":"I1","ernst":5,"geldtIn":["*"],"altijdFout":"Een route zonder N1","geldtInTekst":"E1–E3","predicaat":{"p":"nietGespeeld","K":{"kaart":"N1"}},"vraag":"Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?","bron":"NHG","TODO_BART":"I1 in episode 3: telt een episode zonder enige route ook als 'een route zonder N1'? (Dezelfde vraag als in episode 1.)"},{"id":"I4","ernst":5,"geldtIn":["*"],"altijdFout":"Twee antibiotica tegelijk","geldtInTekst":"E1–E3","predicaat":{"p":"aantalActieveAntibiotica","op":">","n":1},"vraag":"Wat lost het tweede middel op dat het eerste niet oplost?","bron":"[G]","TODO_BART":"De ernst-volgorde van de invarianten is een voorstel van Claude (bouwopdracht 6.1) en niet door Bart bevestigd."},{"id":"I5","ernst":2,"geldtIn":["*"],"altijdFout":"Nitrofurantoïne bij eGFR < 30, ook als de kweek \"gevoelig\" zegt","geldtInTekst":"E2, E3","predicaat":{"p":"en","args":[{"p":"gestart","middel":"V3"},{"p":"waar","veld":"eGFR","op":"<","waarde":30}]},"vraag":"Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?","bron":"NHG","TODO_BART":"Terugkoppeling van weggelaten kaarten: de casus noemt niet welke weggelaten kaart welke downside toont."},{"id":"I6","ernst":4,"geldtIn":["*"],"altijdFout":"Een antibioticum starten zonder O1 vooraf, of afwachten (V1/V2) in de risicogroep","geldtInTekst":"E2, E3","predicaat":{"p":"en","args":[{"p":"waar","veld":"risicogroep","op":"==","waarde":true},{"p":"of","args":[{"p":"en","args":[{"p":"gespeeld","K":{"kaartUit":"antibiotica"}},{"p":"niet","arg":{"p":"en","args":[{"p":"gespeeld","K":{"kaart":"O1"}},{"p":"voor","a":{"kaart":"O1"},"b":{"kaartUit":"antibiotica"}}]}}]},{"p":"of","args":[{"p":"gespeeld","K":{"kaart":"V1"}},{"p":"gespeeld","K":{"kaart":"V2"}}]}]}]},"vraag":"Wat vertelt een kweek van urine die al antibioticum heeft gezien?","bron":"NHG","vraagVarianten":[{"als":{"p":"en","args":[{"p":"gespeeld","K":{"kaartUit":"antibiotica"}},{"p":"niet","arg":{"p":"en","args":[{"p":"gespeeld","K":{"kaart":"O1"}},{"p":"voor","a":{"kaart":"O1"},"b":{"kaartUit":"antibiotica"}}]}}]},"vraag":"Wat vertelt een kweek van urine die al antibioticum heeft gezien?"},{"als":{"p":"of","args":[{"p":"gespeeld","K":{"kaart":"V1"}},{"p":"gespeeld","K":{"kaart":"V2"}}]},"vraag":"Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?"}],"TODO_BART":"I6 en I7 hebben elk twee Socratische vragen in de casus, maar één invariant."},{"id":"I7","ernst":3,"geldtIn":["*"],"altijdFout":"Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3","geldtInTekst":"E2, E3","predicaat":{"p":"en","args":[{"p":"gestart","middel":"V5"},{"p":"waar","veld":"risicogroep","op":"==","waarde":true},{"p":"of","args":[{"p":"en","args":[{"p":"actiefNaDagen","middel":"V5","anker":{"start":"V5"},"na":2},{"p":"niet","arg":{"p":"opDagRelatief","K":{"kaart":"O2"},"anker":{"start":"V5"},"van":1,"tot":3}}]},{"p":"en","args":[{"p":"actiefNaDagen","middel":"V5","anker":{"start":"V5"},"na":3},{"p":"niet","arg":{"p":"opDagRelatief","K":{"kaart":"V6","doel":"V5","optie":"halveren"},"anker":{"start":"V5"},"van":3}}]}]}]},"vraag":"Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?","bron":"NHG, KNMP","vraagVarianten":[{"als":{"p":"en","args":[{"p":"actiefNaDagen","middel":"V5","anker":{"start":"V5"},"na":2},{"p":"niet","arg":{"p":"opDagRelatief","K":{"kaart":"O2"},"anker":{"start":"V5"},"van":1,"tot":3}}]},"vraag":"Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?"},{"als":{"p":"en","args":[{"p":"actiefNaDagen","middel":"V5","anker":{"start":"V5"},"na":3},{"p":"niet","arg":{"p":"opDagRelatief","K":{"kaart":"V6","doel":"V5","optie":"halveren"},"anker":{"start":"V5"},"van":3}}]},"vraag":"Dag 4. Hoeveel trimethoprim klaren haar nieren nog?"}],"TODO_BART":"I7 in episode 3: wat betekent 'dag 2–4 na de start' en 'vanaf dag 3 na de start'?"},{"id":"I8","ernst":4,"geldtIn":[{"gebeurtenis":"C"}],"altijdFout":"Bij aanhoudende klachten doorgaan met een middel waarvoor de bacterie resistent is","geldtInTekst":"E3 · elke toestand, zodra de kweekuitslag (C) binnen is","predicaat":{"p":"en","args":[{"p":"gebeurtenisGeweest","id":"C"},{"p":"actief","uitSet":"resistent","op":{"eindeBeurtNaGebeurtenis":"C","offset":1}},{"p":"of","args":[{"p":"klachten","waarde":"aan","op":{"eindeBeurtNaGebeurtenis":"C","offset":0}},{"p":"klachten","waarde":"geenVerbetering48","op":{"eindeBeurtNaGebeurtenis":"C","offset":0}}]}]},"vraag":"De kweek is binnen en de klachten blijven. Waar wacht je nog op?","bron":"NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten","TODO_BART":"I8 in episode 3: op welke dag moeten 'de klachten houden aan' gelden, en wanneer telt 'doorgaan met een resistent middel'? Bouwopdracht 6.1 noemt geen dag."},{"id":"I9","ernst":3,"geldtIn":["*"],"altijdFout":"De combinatie lisinopril + spironolacton bij eGFR < 30 laten liggen (geen O2 én geen Ev2), of spironolacton na de sick day hervatten (B5) zonder eerst Ev2","geldtInTekst":"Alle toestanden van E3","predicaat":{"p":"of","args":[{"p":"en","args":[{"p":"waar","veld":"eGFR","op":"<","waarde":30},{"p":"nietGespeeld","K":{"kaart":"O2"}},{"p":"nietGespeeld","K":{"kaart":"Ev2","doel":"spironolacton"}}]},{"p":"en","args":[{"p":"gespeeld","K":{"kaart":"B5","doel":"spironolacton"}},{"p":"niet","arg":{"p":"en","args":[{"p":"gespeeld","K":{"kaart":"Ev2","doel":"spironolacton"}},{"p":"voor","a":{"kaart":"Ev2","doel":"spironolacton"},"b":{"kaart":"B5","doel":"spironolacton"}}]}}]}]},"vraag":"Haar nierfunctie is 28. Welk van haar vaste middelen begon toen die nog hoger was, en wie kijkt daar nu naar?","bron":"Bart; SIDRIK; herstart-nuance [G]","TODO_BART":"I9: de casus zegt 'geen O2 én geen Ev2' (schending alleen als beide ontbreken); bouwopdracht 6.1 zegt 'O2 of Ev2 ontbreekt'. Welke lezing geldt?"},{"id":"I10","ernst":2,"geldtIn":["weefselinvasie"],"altijdFout":"Bij weefselinvasie doorgaan met nitrofurantoïne of fosfomycine: onvoldoende concentratie in het weefsel","geldtInTekst":"Met A","predicaat":{"p":"actief","middel":["V3","V4"],"op":{"eindeBeurtNaGebeurtenis":"A","offset":0}},"vraag":"Fosfomycine werkt in de blaas. Waar zit de infectie nu?","bron":"NHG","TODO_BART":"I10, I11, I13, I14, I15, I16: wat is 'dezelfde beurt', 'de beurt na A' en 'tussen A en de wissel'?"},{"id":"I11","ernst":4,"geldtIn":["weefselinvasie"],"altijdFout":"Bij weefselinvasie wisselen zonder eerst een nieuwe kweek","geldtInTekst":"Met A","predicaat":{"p":"en","args":[{"p":"gespeeld","K":{"kaart":["B1","V3","V4","V5","V7","V8","V9","V10"],"naGebeurtenis":"A"}},{"p":"niet","arg":{"p":"en","args":[{"p":"gespeeld","K":{"kaart":"O1","naGebeurtenis":"A"}},{"p":"voor","a":{"kaart":"O1","naGebeurtenis":"A"},"b":{"kaart":["B1","V3","V4","V5","V7","V8","V9","V10"],"naGebeurtenis":"A"}}]}}]},"vraag":"Je wisselt. Waarop baseer je de wissel daarna?","bron":"NHG"},{"id":"I12","ernst":1,"geldtIn":["*"],"altijdFout":"Cotrimoxazol voorschrijven","geldtInTekst":"Alle","predicaat":{"p":"gestart","middel":"V9"},"vraag":"Cotrimoxazol naast spironolacton bij een eGFR van 28. Wat doet dat met haar kalium?","bron":"NHG, Kompas"},{"id":"I13","ernst":3,"geldtIn":["*"],"altijdFout":"Amoxicilline/clavulaanzuur zonder V6 naar 875/125 mg 2 dd","geldtInTekst":"Alle","predicaat":{"p":"en","args":[{"p":"waar","veld":"eGFR","op":"<","waarde":30},{"p":"gestart","middel":"V8"},{"p":"niet","arg":{"p":"opDagRelatief","K":{"kaart":"V6","doel":"V8","optie":"875/125 mg 2 dd"},"anker":{"start":"V8"},"van":0,"tot":0}}]},"vraag":"Clavulaanzuur bij een eGFR van 28. Waar blijft het?","bron":"NHG"},{"id":"I14","ernst":3,"geldtIn":["*"],"altijdFout":"Ciprofloxacine zonder B4 (scheiden van calcium) en zonder B3 (calcium tijdelijk stoppen)","geldtInTekst":"Met ciprofloxacine","predicaat":{"p":"en","args":[{"p":"gestart","middel":"V7"},{"p":"medicatieActief","id":"calcium","op":{"naKaart":{"start":"V7"}}},{"p":"niet","arg":{"p":"of","args":[{"p":"opDagRelatief","K":{"kaart":"B4"},"anker":{"start":"V7"},"van":0,"tot":1},{"p":"opDagRelatief","K":{"kaart":"B3","doel":"calcium"},"anker":{"start":"V7"},"van":0,"tot":1}]}}]},"vraag":"Ze neemt elke ochtend calcium. Hoeveel van je ciprofloxacine komt in haar bloed?","bron":"Kompas; B3-route [G]","TODO_BART":"I14: de toestandstabel zet I14 alleen bij weefselinvasie, de invariantentabel zegt 'Met ciprofloxacine'; bouwopdracht 6.1 zegt 'E3'. Waar geldt I14? En: B4 'op calcium' (bouwopdracht) of op ciprofloxacine (kaartdoelen)?"},{"id":"I15","ernst":2,"geldtIn":["uitdroging"],"altijdFout":"Na het halen van de sick day-drempel niet: spironolacton stoppen, lisinopril halveren, drinkadvies, monitoring binnen 1–3 dagen","geldtInTekst":"Met B","predicaat":{"p":"niet","arg":{"p":"en","args":[{"p":"binnenBeurten","K":{"kaart":"B3","doel":"spironolacton"},"naGebeurtenis":"B","n":2},{"p":"binnenBeurten","K":{"kaart":"V6","doel":"lisinopril","optie":"halveren"},"naGebeurtenis":"B","n":2},{"p":"binnenBeurten","K":{"kaart":"N3"},"naGebeurtenis":"B","n":2},{"p":"binnenBeurten","K":{"kaart":"Ev1"},"naGebeurtenis":"B","n":2}]}},"vraag":"Ze drinkt nauwelijks en heeft twee dagen koorts. Wat doen lisinopril en spironolacton met een nier die al droog staat?","bron":"SIDRIK","TODO_BART":"I15: de casus zegt bij I15 en bij Ev1 'monitoring binnen 1–3 dagen'; bouwopdracht 6.1 schrijft voor dat alle vier de sick day-maatregelen, dus ook Ev1, binnen 2 beurten na B komen. Welke lezing geldt?"},{"id":"I16","ernst":3,"geldtIn":["weefselinvasie"],"altijdFout":"Geen contact binnen 48 uur, of geen verwijzing als ze dan niet beter is","geldtInTekst":"Met A","predicaat":{"p":"of","args":[{"p":"niet","arg":{"p":"binnenBeurten","K":{"kaart":"Ev1"},"naGebeurtenis":"A","n":2}},{"p":"en","args":[{"p":"klachten","waarde":"geenVerbetering48"},{"p":"nietGespeeld","K":{"kaart":"Ev3"}}]}]},"vraag":"Het is 48 uur later en ze is niet beter. Wat is je volgende kaart, en is die nog aan jou?","bron":"NHG","TODO_BART":"Eisen 'binnen n beurten' (I15, I16, I10) bij vroeg afronden: telt een onvervulde eis als schending?"}],
    "score": {"TODO_BART":"Feedback 'O1 gespeeld' en 'Onnodig gewisseld' (en de duurzaamheidsregel 'wisselen terwijl het middel werkt') staan alleen bij episode 1 en 2; I1 en I4–I8 blijven in episode 3 gelden. Geldt dat ook voor deze feedback en deze score in episode 3?","duurzaamheid":{"casusTekst":"de-escaleren van ciprofloxacine naar amoxicilline/clavulaanzuur na de kweek (C) levert punten op.","regels":[{"als":{"p":"en","args":[{"p":"gestart","middel":"V8"},{"p":"niet","arg":{"p":"gestart","middel":"V7"}}]},"punten":3},{"als":{"p":"en","args":[{"p":"gestart","middel":"V7"},{"p":"gespeeld","K":{"start":"V8","naGebeurtenis":"C"}}]},"punten":3},{"als":{"p":"gestart","middel":"V7"},"punten":2}],"TODO_BART":"Profielen en score in episode 3: wat gebeurt er bij routes zonder ciprofloxacine of amoxicilline/clavulaanzuur (bijvoorbeeld alleen fosfomycine of verwijzen), en welk profiel hoort bij ciprofloxacine met de-escalatie naar amoxicilline/clavulaanzuur?"},"doelmatigheid":{"casusTekst":"G3 gebruiken vóór de eerste keuze levert punten op.","TODO_BART":"Doelmatigheid 'G3 gebruiken vóór de eerste keuze': welke kaarten tellen als 'de eerste keuze'? Bouwopdracht 6.5 zegt 'de eerste V-kaart', de casus 'de eerste keuze'.","regels":[{"als":{"p":"en","args":[{"p":"gespeeld","K":{"kaart":"G3"}},{"p":"alsDan","als":{"p":"gespeeld","K":{"kaart":["V1","V2","V3","V4","V5","V6","V7","V8","V9","V10"]}},"dan":{"p":"voor","a":{"kaart":"G3"},"b":{"kaart":["V1","V2","V3","V4","V5","V6","V7","V8","V9","V10"]}}}]},"punten":3},{"als":{"p":"waarheid","waarde":true},"punten":2,"TODO_BART":"Worden Ev3 ('Onnodig verwijzen kost doelmatigheid', kaartdownside) en 'geen overbodig onderzoek' (casus sectie 7) in episode 3 gescoord? De casus noemt voor episode 3 alleen 'G3 gebruiken vóór de eerste keuze'."}]}},
    "profielen": [{"naam":"Kweekgestuurd","casusTekst":"Kweekgestuurd; scoort hoger. De keuze leunt op de eerdere kweek en vermijdt de risico's van ciprofloxacine bij ouderen [NHG].","als":{"p":"gestart","middel":"V8"},"reflectievraag":null,"TODO_BART":"Reflectievraag voor profiel Kweekgestuurd (episode 3) ontbreekt in de casus."},{"naam":"Richtlijn eerste keus","casusTekst":"Eerste keus volgens de richtlijn; eigen profiel","als":{"p":"gestart","middel":"V7"},"reflectievraag":"Eerste keus volgens de richtlijn. Gold die eerste keus ook voor déze patiënt?"}],
    "feedbackExtra": [{"trigger":{"p":"gespeeld","K":{"kaart":"B5"}},"vraag":"De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?","wanneer":"alleenBijGehaaldePoort","TODO_BART":"Feedbackvragen 'Automatische herstart' en 'Ciprofloxacine-dosis (bronconflict)': de casus noemt geen trigger en niet of ze ook bij een poortschending verschijnen."},{"trigger":{"p":"gestart","middel":"V7"},"vraag":"De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?","meta":{"toelichting":"voor ciprofloxacine bij eGFR 10–30 geeft de NHG de normale keerdosis eenmaal per 24 uur [NHG]. Het Kompas past de dosis pas aan bij een klaring ≤ 15 [Kompas]. Beide zijn verdedigbaar; het wordt een feedbackmoment."},"wanneer":"alleenBijGehaaldePoort","TODO_BART":"Feedbackvragen 'Automatische herstart' en 'Ciprofloxacine-dosis (bronconflict)': de casus noemt geen trigger en niet of ze ook bij een poortschending verschijnen."}],
    "zichtbaarAlsOntbreekt": [{"trigger":{"p":"en","args":[{"p":"gebeurtenisGeweest","id":"B"},{"p":"nietGespeeld","K":{"kaart":"B3","doel":"spironolacton"}},{"p":"nietGespeeld","K":{"kaart":"V6","doel":"lisinopril","optie":"halveren"}},{"p":"nietGespeeld","K":{"kaart":"N3"}},{"p":"nietGespeeld","K":{"kaart":"Ev1"}}]},"tekst":"De nierfunctie daalt verder en het kalium stijgt.","meta":{"toelichting":"Zonder getallen, zoals ook de KNMP-regel geen getallen geeft."},"TODO_BART":"'Geen sick day-maatregelen' (zichtbaar als een kaart ontbreekt): geen enkele maatregel, of ook als er één ontbreekt?"},{"trigger":{"p":"en","args":[{"p":"gestart","middel":"V7"},{"p":"medicatieActief","id":"calcium","op":{"naKaart":{"start":"V7"}}},{"p":"niet","arg":{"p":"of","args":[{"p":"opDagRelatief","K":{"kaart":"B4"},"anker":{"start":"V7"},"van":0,"tot":1},{"p":"opDagRelatief","K":{"kaart":"B3","doel":"calcium"},"anker":{"start":"V7"},"van":0,"tot":1}]}}]},"tekst":"Na 48 uur geen verbetering."},{"trigger":{"p":"of","args":[{"p":"en","args":[{"p":"waar","veld":"eGFR","op":"<","waarde":30},{"p":"nietGespeeld","K":{"kaart":"O2"}},{"p":"nietGespeeld","K":{"kaart":"Ev2","doel":"spironolacton"}}]},{"p":"en","args":[{"p":"gespeeld","K":{"kaart":"B5","doel":"spironolacton"}},{"p":"niet","arg":{"p":"en","args":[{"p":"gespeeld","K":{"kaart":"Ev2","doel":"spironolacton"}},{"p":"voor","a":{"kaart":"Ev2","doel":"spironolacton"},"b":{"kaart":"B5","doel":"spironolacton"}}]}}]}]},"tekst":"Het kalium is onbekend, en niemand heeft naar spironolacton gekeken."}]
  },
  "todoBart": [
    {"id":"TODO_BART-E3-1","vraag":"I9: de casus zegt 'geen O2 én geen Ev2' (schending alleen als beide ontbreken); bouwopdracht 6.1 zegt 'O2 of Ev2 ontbreekt'. Welke lezing geldt?","gekozenLezing":"Casus-lezing: I9 is geschonden als eGFR < 30 en zowel O2 als Ev2 op spironolacton ontbreken, of als B5 op spironolacton gespeeld is zonder eerdere Ev2 op spironolacton. Ev2 op lisinopril telt niet mee.","plek":"E3.invarianten.I9"},
    {"id":"TODO_BART-E3-2","vraag":"Eisen 'binnen n beurten' (I15, I16, I10) bij vroeg afronden: telt een onvervulde eis als schending?","gekozenLezing":"Ja: schendingen worden bepaald op de eindstand; een eis die bij afronden nog niet vervuld is, telt als geschonden. Geldt alleen als gebeurtenis A of B geweest is.","plek":"E3.invarianten.I10, I15, I16"},
    {"id":"TODO_BART-E3-3","vraag":"Vroeg afronden vóór gebeurtenis A, B of C (en dus ontlopen van I8, I10, I11, I15, I16)?","gekozenLezing":"Vroeg afronden is niet toegestaan zolang er nog gebeurtenissen aankomen of de dagen niet om zijn (de instelling 'afronden pas na de gebeurtenissen' staat aan). Een gebeurtenis op kaartaantal (A en B) telt altijd mee; een kweekuitslag telt alleen mee als Urinekweek inzetten is gespeeld. Wie niets speelt dat een gebeurtenis in gang zet, kan pas op de laatste dag afronden. Het ontlopen van de invarianten na A, B of C (I8, I10, I11, I15, I16) is daarmee niet meer mogelijk. Alternatief: afronden weer vrij laten (de instelling uitzetten).","plek":"E3.gebeurtenissen A, B, C; E3.invarianten.I8, I10, I11, I15, I16 (afronden pas na de gebeurtenissen is niet ingesteld)"},
    {"id":"TODO_BART-E3-4","vraag":"Een tweede kweekuitslag in episode 3 (nieuwe O1 na weefselinvasie): voorlopig komt er een tweede kweekuitslag, 3 dagen na de nieuwe kweek, met dezelfde bacterie en dezelfde gevoeligheden. Kan de gevoeligheid bij weefselinvasie afwijken? (Vraag voor de huisarts.) De 3 dagen zijn Barts keuze; de oorspronkelijke 2–4 dagen kwamen via Mistral en zijn niet gecheckt.","gekozenLezing":"Ja: gebeurtenis C2 geeft 3 dagen na de tweede O1 een tweede uitslag met dezelfde gegevens als C. De invarianten (I8) kijken alleen naar de eerste uitslag C.","plek":"E3.gebeurtenissen.C2"},
    {"id":"TODO_BART-E3-5","vraag":"I10, I11, I13, I14, I15, I16: wat is 'dezelfde beurt', 'de beurt na A' en 'tussen A en de wissel'?","gekozenLezing":"De beurt van een gebeurtenis is de dag waarop de banner verscheen (begin van de volgende dag). 'Eind van de beurt na A' = einde van die dag; 'binnen 2 beurten' = die dag en de dag erna; 'na A' = kaarten gespeeld vanaf die dag.","plek":"E3.invarianten.I10, I11, I13, I14, I15, I16"},
    {"id":"TODO_BART-E3-6","vraag":"I14: de toestandstabel zet I14 alleen bij weefselinvasie, de invariantentabel zegt 'Met ciprofloxacine'; bouwopdracht 6.1 zegt 'E3'. Waar geldt I14? En: B4 'op calcium' (bouwopdracht) of op ciprofloxacine (kaartdoelen)?","gekozenLezing":"Strengste lezing: geldt in elke toestand zodra ciprofloxacine gestart is (in elke toestand). B4 telt op elk doel; B3 alleen op calcium; beide in dezelfde of de volgende beurt als de start van ciprofloxacine, tenzij calcium dan al gepauzeerd is.","plek":"E3.invarianten.I14"},
    {"id":"TODO_BART-E3-7","vraag":"I1 in episode 3: telt een episode zonder enige route ook als 'een route zonder N1'? (Dezelfde vraag als in episode 1.)","gekozenLezing":"Strengste lezing: elke afronding zonder N1 schendt I1.","plek":"E3.invarianten.I1"},
    {"id":"TODO_BART-E3-8","vraag":"Patiëntkaart: de casusregel luidt 'spironolacton (hypertensie)', terwijl de regel eronder zegt dat wie spironolacton startte en waarom bewust niet op de kaart staat. Mag de reden (hypertensie) zichtbaar zijn?","gekozenLezing":"Meest letterlijke lezing: de casusregel staat verbatim op de patiëntkaart ('lisinopril, spironolacton (hypertensie), calcium/colecalciferol.'), dus mét '(hypertensie)'. Wie spironolacton startte en wanneer staat er niet (de medicatielijst noemt alleen de namen). Alternatief (didactische lezing): '(hypertensie)' weglaten zodat ook de reden niet zichtbaar is. Vraag aan Bart: welke van de twee?","plek":"E3.patient.zichtbaar.medicatieTekst; E3.patient.casusMedicatieregel"},
    {"id":"TODO_BART-E3-9","vraag":"Werkzaamheid in episode 3 (bouwopdracht 6.3): niet genoemd zijn V7 en V8 bij cystitis en V5 bij weefselinvasie; V9 is 'wel werkzaam'.","gekozenLezing":"Alleen wat in 6.3 staat is werkzaam (cystitis: V4; weefselinvasie: V8, en V7 alleen met B4 of B3 op calcium), plus V9 in beide toestanden; al het andere geldt als niet werkzaam. De toestand uitdroging heeft geen eigen tabel (cystitis of weefselinvasie geldt).","plek":"E3.werkzaamheid"},
    {"id":"TODO_BART-E3-10","vraag":"Welke tekst hoort bij welke klachtenstatus in episode 3?","gekozenLezing":"af = 'klachten nemen af.', aan = 'klachten houden aan.', geenVerbetering48 = 'Na 48 uur geen verbetering.' (letterlijke fragmenten uit E2/E3).","plek":"E3.statusTeksten"},
    {"id":"TODO_BART-E3-11","vraag":"Profielen en score in episode 3: wat gebeurt er bij routes zonder ciprofloxacine of amoxicilline/clavulaanzuur (bijvoorbeeld alleen fosfomycine of verwijzen), en welk profiel hoort bij ciprofloxacine met de-escalatie naar amoxicilline/clavulaanzuur?","gekozenLezing":"Geen profiel en geen duurzaamheidsregel voor routes zonder V7 of V8. Amoxicilline/clavulaanzuur gestart (ook na ciprofloxacine) = Kweekgestuurd; anders ciprofloxacine = Richtlijn eerste keus. Duurzaamheid: V8 zonder V7 = 3, V7 met wissel naar V8 na C = 3, V7 anders = 2.","plek":"E3.profielen; E3.score.duurzaamheid"},
    {"id":"TODO_BART-E3-12","vraag":"Reflectievraag voor profiel Kweekgestuurd (episode 3) ontbreekt in de casus.","gekozenLezing":"Geen reflectievraag tonen bij dit profiel.","plek":"E3.profielen.Kweekgestuurd"},
    {"id":"TODO_BART-E3-13","vraag":"Feedbackvragen 'Automatische herstart' en 'Ciprofloxacine-dosis (bronconflict)': de casus noemt geen trigger en niet of ze ook bij een poortschending verschijnen.","gekozenLezing":"Automatische herstart: zodra B5 gespeeld is. Ciprofloxacine-dosis: zodra ciprofloxacine gestart is (geen poort). Beide alleen bij gehaalde poort, zodat bij een schending één vraag verschijnt.","plek":"E3.feedbackExtra"},
    {"id":"TODO_BART-E3-14","vraag":"'Geen sick day-maatregelen' (zichtbaar als een kaart ontbreekt): geen enkele maatregel, of ook als er één ontbreekt?","gekozenLezing":"Geen van de vier maatregelen (B3 op spironolacton, V6 lisinopril halveren, N3, Ev1) is gespeeld terwijl B geweest is.","plek":"E3.zichtbaarAlsOntbreekt[0]"},
    {"id":"TODO_BART-E3-15","vraag":"De ernst-volgorde van de invarianten is een voorstel van Claude (bouwopdracht 6.1) en niet door Bart bevestigd.","gekozenLezing":"Ernst overgenomen uit bouwopdracht 6.1: I12=1; I5, I10, I15=2; I7, I9, I13, I14, I16=3; I6, I8, I11=4; I1, I4=5. Instelbaar in de data.","plek":"E3.invarianten[].ernst (markering op I4)"},
    {"id":"TODO_BART-E3-16","vraag":"Terugkoppeling van weggelaten kaarten: de casus noemt niet welke weggelaten kaart welke downside toont.","gekozenLezing":"Bij weggelaten kaarten komt in episode 3 geen aparte downside-tekst; de teksten bij ontbrekende kaarten staan bij 'wat zichtbaar wordt als een kaart ontbreekt'.","plek":"E3.invarianten (markering op I5)"},
    {"id":"TODO_BART-E3-17","vraag":"Acties per beurt in episode 3: de casus noemt 'krap', bouwopdracht 6.6 zegt 3 (zelfde als E1 en E2).","gekozenLezing":"3 acties per beurt, 7 dagen, raadplegen kost 1 (bouwopdracht 6.6; instelbaar).","plek":"E3.knoppen"},
    {"id":"TODO_BART-E3-18","vraag":"I6 en I7 hebben elk twee Socratische vragen in de casus, maar één invariant.","gekozenLezing":"Beide vragen staan in de data; per vraag is vastgelegd bij welke schending ze horen. Standaard geldt de eerste vraag.","plek":"E3.invarianten.I6, I7"},
    {"id":"TODO_BART-E3-19","vraag":"I7 in episode 3: wat betekent 'dag 2–4 na de start' en 'vanaf dag 3 na de start'?","gekozenLezing":"Lezing A (identiek aan episode 2): cursusdag = verschil in dagen t.o.v. de dag van de start van trimethoprim plus 1 (het anker zelf is verschil 0, cursusdag 1). Dus O2 op verschil 1 t/m 3 (cursusdag 2–4; casusroute V5 dag 1, O2 dag 2 slaagt) en V6 halveren op verschil 3 of meer (cursusdag 4 of later, vgl. feedback \"Dag 4.\"). Alternatief (lezing B, bouwopdracht 6.1: O2 op dag 2 t/m 4 na de start van V5): O2 op verschil 2 t/m 4, dan faalt de casusroute V5 dag 1, O2 dag 2.","plek":"E3.invarianten.I7"},
    {"id":"TODO_BART-E3-20","vraag":"Doelmatigheid 'G3 gebruiken vóór de eerste keuze': welke kaarten tellen als 'de eerste keuze'? Bouwopdracht 6.5 zegt 'de eerste V-kaart', de casus 'de eerste keuze'.","gekozenLezing":"Strengste lezing: elke V-kaart telt als keuze, dus V1 t/m V10 inclusief V6 (dosering). Doelmatigheid is 3 alleen als G3 gespeeld is en vóór elke gespeelde V-kaart ligt; anders 2.","plek":"E3.score.doelmatigheid"},
    {"id":"TODO_BART-E3-21","vraag":"Worden Ev3 ('Onnodig verwijzen kost doelmatigheid', kaartdownside) en 'geen overbodig onderzoek' (casus sectie 7) in episode 3 gescoord? De casus noemt voor episode 3 alleen 'G3 gebruiken vóór de eerste keuze'.","gekozenLezing":"Nee: in episode 3 wordt alleen 'G3 vóór de eerste keuze' gescoord. Ev3 en overbodig onderzoek (extra O1 of O2) kosten geen punten, omdat de casus voor episode 3 geen aftrekregel of aantal noemt; dat zou klinische inhoud verzinnen. Het alternatief (aftrek per overbodige kaart of voor Ev3 zonder 48 uur geen verbetering, zoals de kaartdownside zegt) is aan Bart.","plek":"E3.score.doelmatigheid.regels[1]"},
    {"id":"TODO_BART-E3-22","vraag":"Feedback 'O1 gespeeld' en 'Onnodig gewisseld' (en de duurzaamheidsregel 'wisselen terwijl het middel werkt') staan alleen bij episode 1 en 2; I1 en I4–I8 blijven in episode 3 gelden. Geldt dat ook voor deze feedback en deze score in episode 3?","gekozenLezing":"Nee: de feedback 'O1 gespeeld' en 'Onnodig gewisseld' en de duurzaamheidsregel 'wisselen terwijl het middel werkt' komen in episode 3 niet voor; de casus noemt ze alleen bij episode 1 en 2. Alleen I1 en I4–I8 gelden als invariant. Alternatief: ze ook in episode 3 toepassen.","plek":"E3.score; E3.feedbackExtra"},
    {"id":"TODO_BART-E3-23","vraag":"I8 in episode 3: op welke dag moeten 'de klachten houden aan' gelden, en wanneer telt 'doorgaan met een resistent middel'? Bouwopdracht 6.1 noemt geen dag.","gekozenLezing":"Bouwopdracht 6.1 letterlijk: schending als na C het resistente middel (V5, V10) aan het eind van de tweede beurt (dag van C + 1) nog actief is én de klachten op de dag van C 'aan' of 'geen verbetering na 48 uur' zijn. Niet gedekt: een resistent middel dat pas op of na de dag van C wordt gestart (bijvoorbeeld V4 naar V10 via B1 op de dag na C). Alternatief (strenger): klachten 'aan' op elke dag vanaf C meetellen.","plek":"E3.invarianten.I8"},
    {"id":"TODO_BART-E3-24","vraag":"I15: de casus zegt bij I15 en bij Ev1 'monitoring binnen 1–3 dagen'; bouwopdracht 6.1 schrijft voor dat alle vier de sick day-maatregelen, dus ook Ev1, binnen 2 beurten na B komen. Welke lezing geldt?","gekozenLezing":"Casus is de bron, maar de strengere lezing wordt aangehouden: alle vier de maatregelen (B3 op spironolacton, V6 halveren op lisinopril, N3, Ev1) binnen 2 beurten na B, dus op de dag van B of de dag erna (bouwopdracht 6.1). Alternatief (casus-lezing 'binnen 1–3 dagen'): Ev1 mag tot en met drie dagen na B (dB+3); dan geeft Ev1 op dB+2 of dB+3 nu ten onrechte I15. Vraag aan Bart: welke van de twee?","plek":"E3.invarianten.I15 (Ev1-onderdeel); casus sectie 6 regels I15 en Ev1"},
    {"id":"TODO_BART-E3-25","vraag":"Randgeval klachtenstatus na gebeurtenis A: stel dat na A eerst een werkzaam antibioticum actief is (de klachten nemen af), en daarna weer een periode komt zonder werkzaam antibioticum. Geldt dan opnieuw 'Na 48 uur geen verbetering.'?","gekozenLezing":"Nee: alleen de eerste periode na A zonder werkzaam antibioticum telt voor 'Na 48 uur geen verbetering.' Zodra in die periode een werkzaam antibioticum actief is geweest, geldt voor de rest van de episode de gewone status (klachten nemen af, klachten houden aan, of geen status), ook als er later weer een periode zonder werkzaam antibioticum volgt. Alternatief: de status 'Na 48 uur geen verbetering.' opnieuw laten gelden bij elke nieuwe periode van twee dagen zonder werkzaam antibioticum.","plek":"E3.statusTeksten; E3.gebeurtenissen.A; E3.invarianten.I8, I16"},
    {"id":"TODO_BART-E3-26","vraag":"Mag de student de risicogroepmelding zien? De casus zet bij de patiëntkaart (bij het lab) de zin 'Risicogroep [NHG].' Die zin vertelt vooraf dat deze patiënt in de risicogroep valt. Mag hij bij de patiëntkaart getoond worden, of alleen in het overzicht voor de docent?","gekozenLezing":"Nee: de student ziet de risicogroepmelding niet. De zin staat in de data onder patient.meta.risicogroep (voor Bart en het overzicht); de student ziet alleen de kop, de klachten, de medicatie en het lab ('eGFR 28, recent.'). Alternatief: de zin wel bij de patiëntkaart tonen.","plek":"E3.patient.meta.risicogroep"}
  ]
  };
  function eerstVerschil(a, b, pad) {
    if (a === b) return null;
    if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return pad + ": " + JSON.stringify(a) + " <> " + JSON.stringify(b);
    if (Array.isArray(a) !== Array.isArray(b)) return pad + ": array/object";
    var ks = Object.keys(a).concat(Object.keys(b)).filter(function (k, i, l) { return l.indexOf(k) === i; });
    for (var i = 0; i < ks.length; i++) { var r = eerstVerschil(a[ks[i]], b[ks[i]], pad + "." + ks[i]); if (r) return r; }
    return null;
  }
  Object.keys(GOLD.episode).forEach(function (sl) {
    reg("E3-pin " + sl + " ongewijzigd t.o.v. de vastgelegde stand", function (e) {
      var v = eerstVerschil(GOLD.episode[sl], e[sl], "E3." + sl);
      T.waar(v === null, "afwijking: " + v);
    });
  });
  T.registreer(G, "E3-pin sleutels van de episode: precies de vastgelegde lijst", function () {
    T.gelijk(Object.keys(e3()).sort(), Object.keys(GOLD.episode).sort());
  });
  T.registreer(G, "E3-pin casus.todoBart (E3-1 t/m E3-26) ongewijzigd t.o.v. de vastgelegde stand", function () {
    var mijn = casus().todoBart.filter(function (t) { return /^TODO_BART-E3-/.test(t.id); });
    var v = eerstVerschil(GOLD.todoBart, mijn, "todoBart");
    T.waar(v === null, "afwijking: " + v);
  });
})(typeof window !== "undefined" ? window : globalThis);

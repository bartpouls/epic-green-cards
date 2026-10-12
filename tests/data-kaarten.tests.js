// Tests voor stuk S1 (data-kaarten): casuskop + kaartenbibliotheek in casussen/uwi.js.
// De referentie hieronder is een LETTERLIJK stuk uit casus-uwi.md (sectie 3 + kop) en bouwopdracht-uwi.md (6.2),
// ingebed en met een eigen parser verwerkt. Niets daarvan wordt uit de data gegenereerd (niet circulair).
(function () {
  var G = "data-kaarten";
  var REF_KOP = "NHG-Standaard Urineweginfecties, versie juli 2026 **[NHG]** · SIDRIK-stroomschema medicatieadvies bij sick day, Universiteit Utrecht 2025 **[SIDRIK]** · Farmacotherapeutisch Kompas, preparaatteksten spironolacton en ciprofloxacine **[Kompas]** · KNMP medisch-farmaceutische beslisregel 7025-4 \"Kalium controle na 3 dagen\" **[KNMP]**";
  var REF_KAARTEN = [
    "| G1 | Gegevens | Medicatieoverzicht nalopen | E1 | Toont de actuele medicatielijst | Kost een actie | — |",
    "| G2 | Gegevens | Recente labwaarden opvragen | E1 | E1: eGFR 42, recent. E2: **eGFR 29** (verborgen). E3: eGFR 28, bevestigd. | Kost een actie | — |",
    "| G3 | Gegevens | Eerdere kweekuitslagen opvragen | E3 | Toont de kweek uit episode 2 | Kost een actie | NHG: kweken tot ongeveer 1 jaar terug meewegen |",
    "| O1 | Onderzoek | Urinekweek inzetten | E1 | Zet een kweek in. Moet vóór de eerste dosis worden afgenomen. Uitslag 3 dagen na inzetten. | E1: niet geïndiceerd, kost doelmatigheid | NHG |",
    "| O2 | Onderzoek | Kalium bepalen | E1 | Bepaalt de kaliumspiegel | Alleen zinvol bij een indicatie; anders kost het doelmatigheid | NHG, KNMP |",
    "| V1 | Voorschrijven | Afwachtend beleid | E1 | Geen antibioticum; ruim drinken, zo nodig pijnstilling | Klachten duren langer; risico op pyelonefritis ongeveer 1,6% hoger | NHG |",
    "| V2 | Voorschrijven ⊙ | Uitgesteld recept | E1 | De patiënt start zelf als de klachten aanhouden of toenemen; de speler kiest het middel dat zij thuis start | Ze moet weten wanneer ze moet starten | NHG |",
    "| V3 | Voorschrijven | Nitrofurantoïne | E1 | E1: 5 dagen 2 dd 100 mg mga. In een risicogroep: 7 dagen. | Vermijden bij eGFR < 30: stapeling met kans op neuropathie, en geen bactericide concentratie in de urine. Ongeschikt bij weefselinvasie. Maag-darmklachten [G]. | NHG |",
    "| V4 | Voorschrijven | Fosfomycine | E1 | Eenmalig 3 g, 2–3 uur na de maaltijd, bij voorkeur voor de nacht | Klachten zijn niet direct weg. Ongeschikt bij weefselinvasie. | NHG |",
    "| V5 | Voorschrijven | Trimethoprim | E1 | E1: 3 dagen 1 dd 300 mg. Risicogroep: 7 dagen. | Naast een RAS-remmer of kaliumsparend diureticum stijgt het kalium (controle nodig bij een 7-daagse kuur). Bij eGFR 10–30: na dag 3 halveren en kans op therapiefalen. Hoge resistentie bij E. coli. | NHG, KNMP |",
    "| V6 | Voorschrijven ⊙ | Dosis aanpassen | E2 | Past dosis of interval aan van een nieuw of bestaand middel (ook lisinopril halveren bij sick day) | Een verkeerde aanpassing geeft onder- of overdosering | NHG, SIDRIK |",
    "| V7 | Voorschrijven | Ciprofloxacine | E3 | 7 dagen 2 dd 500 mg | Bij ouderen: kans op peesschade, QT-verlenging, aneurysma. Minder opname naast calcium. NHG: terughoudend bij ouderen en bij een nierfunctiestoornis. | NHG, Kompas |",
    "| V8 | Voorschrijven | Amoxicilline/clavulaanzuur | E3 | 10 dagen 3 dd 500/125 mg | Bij eGFR < 30 stapelt clavulaanzuur: dan alleen 875/125 mg 2 dd | NHG |",
    "| V9 | Voorschrijven | Cotrimoxazol | E3 | 10 dagen 2 dd 960 mg | Gecontra-indiceerd bij een ernstige nierfunctiestoornis. Met spironolacton kans op ernstige hyperkaliëmie. | NHG, Kompas |",
    "| V10 | Voorschrijven | Amoxicilline | E3 | 3 dd 500 mg, alleen bij aangetoonde gevoeligheid | De kweek laat resistentie zien: geen werking | NHG |",
    "| B1 | Bijsturen ⊙ | Antibioticum wisselen | E2 | Vervangt het lopende antibioticum | Onnodig wisselen kost duurzaamheid | NHG |",
    "| B2 | Bijsturen ⊙ | Antibioticum stoppen | E2 | Stopt het lopende antibioticum | Te vroeg stoppen geeft therapiefalen | — |",
    "| B3 | Bijsturen ⊙ | Medicatie tijdelijk stoppen | E3 | Pauzeert een bestaand middel (sick day) | Vraagt een afspraak over herstart | SIDRIK |",
    "| B5 | Bijsturen ⊙ | Medicatie hervatten | E3 | Hervat een eerder gestopt middel. Volgens SIDRIK: herstarten zodra de klachten weg zijn. | Hervatten zonder herbeoordeling kan dezelfde schade herhalen | SIDRIK |",
    "| B4 | Bijsturen ⊙ | Innametijden aanpassen | E3 | Ciprofloxacine 1–2 uur vóór of ten minste 4 uur ná calcium | Vraagt uitleg aan de patiënt | Kompas |",
    "| N1 | Informeren | Alarmsignalen bespreken | E1 | Bij koorts of ziek worden direct contact opnemen | — | NHG |",
    "| N2 | Informeren ⊙ | Gebruik en verwachting uitleggen | E1 | Inhoud per middel, bijvoorbeeld bij fosfomycine: klachten niet direct weg. Koppelt aan het actieve middel. | — | NHG |",
    "| N3 | Informeren | Drinkadvies geven | E3 | 2–2,5 liter per dag | — | SIDRIK |",
    "| Ev1 | Evalueren | Opvolgmoment afspreken | E1 | Afwachten: na 1 week alsnog starten. Na een kuur: als de klachten 24–48 uur na afloop niet duidelijk minder zijn, opnieuw urineonderzoek. Weefselinvasie: contact binnen 48 uur. Sick day: monitoring na 1–3 dagen. | — | NHG, SIDRIK |",
    "| Ev2 | Evalueren ⊙ | Overleggen met de voorschrijver | E3 | Legt een bestaand middel voor aan de voorschrijver | Kost een actie | Bart; CVRM-richtlijn via Mistral, niet zelf gecheckt |",
    "| Ev3 | Evalueren | Verwijzen | E3 | Verlaat de kaart: de patiënt gaat naar de tweede lijn | Onnodig verwijzen kost doelmatigheid | NHG |"
  ].join("\n");
  var REF_OPTIES = [
    "| Trimethoprim (V5) | halveren · verdubbelen · interval 48 uur | halveren vanaf dag 3 [NHG] |",
    "| Amoxicilline/clavulaanzuur (V8) | 875/125 mg 2 dd · 500/125 mg 2 dd · 500/125 mg 1 dd | 875/125 mg 2 dd [NHG] |",
    "| Ciprofloxacine (V7) | normale keerdosis 1× per 24 uur · halveren · geen aanpassing | geen poort (bronconflict): normale keerdosis 1× per 24 uur [NHG] en geen aanpassing [Kompas] zijn allebei goed; toon de feedbackvraag uit de casus |",
    "| Lisinopril | halveren · stoppen · verdubbelen | halveren [SIDRIK] |"
  ].join("\n");

  // Letterlijk uit casus-uwi.md (H1, sectie 5/6 medicatie, "Richtlijn raadplegen")
  var REF_TITEL = "Casus UWI in de eerste lijn — tutorialcasus Epic green cards";
  var REF_RAADPLEGEN_TITEL = "Richtlijn raadplegen";
  var REF_COMED = { lisinopril: "lisinopril", spironolacton: "spironolacton", calcium: "calcium/colecalciferol" };

  var CATEGORIEEN = ["Gegevens", "Onderzoek", "Voorschrijven", "Bijsturen", "Informeren", "Evalueren"];
  var VOLGORDE = ["G1","G2","G3","O1","O2","V1","V2","V3","V4","V5","V6","V7","V8","V9","V10","B1","B2","B3","B5","B4","N1","N2","N3","Ev1","Ev2","Ev3"];
  var PRED = ["gespeeld","nietGespeeld","voor","na","binnenBeurten","opDagRelatief","gestart","actief","aantalActieveAntibiotica","medicatieActief","waar","inToestand","gebeurtenisGeweest","klachten","en","of","niet","alsDan","waarheid"];

  function casus() { return window.CASUSSEN[0]; }
  function kaart(id) { return casus().kaarten.filter(function (k) { return k.id === id; })[0]; }
  function strip(s) { return s.split("**").join(""); }

  // --- referentie-parsers ---
  function celrij(regel) { return regel.replace(/^\| /, "").replace(/ \|$/, "").split(" | "); }
  function refKaarten() {
    return REF_KAARTEN.split("\n").map(function (regel) {
      var c = celrij(regel);
      return { id: c[0], cat: c[1], label: c[2], vanaf: c[3], effect: strip(c[4]), down: strip(c[5]), bron: c[6] };
    });
  }
  function segmenten(tekst) {
    var delen = tekst.split(/\s(?=E[123]: )/), seg = {}, heeft = false;
    delen.forEach(function (d) { var m = d.match(/^E([123]): ([\s\S]*)$/); if (m) { seg[m[1]] = m[2]; heeft = true; } });
    return heeft ? seg : null;
  }
  // Casus geeft één cel -> { alle: cel } (ook als de cel met "E1:" begint, voorvoegsel blijft staan);
  // alleen als de casus zelf per episode splitst (G2) staan er per-episode sleutels.
  function verwachtEffect(r) {
    var v = +r.vanaf.slice(1);
    if (r.id === "G2") {
      var seg = segmenten(r.effect), uit = {};
      Object.keys(seg).forEach(function (e) { uit["E" + e] = seg[e]; });
      return uit;
    }
    void v;
    return { alle: r.effect };
  }
  function verwachtDownside(r) {
    var seg = segmenten(r.down);
    if (!seg) return r.down;
    var uit = {}; Object.keys(seg).forEach(function (e) { uit["E" + e] = seg[e]; });
    return uit;
  }

  Test.registreer(G, "K0 CASUSSEN is een array met één casus; id en versie uit de casuskop", function () {
    Test.waar(Array.isArray(window.CASUSSEN) && window.CASUSSEN.length === 1, "één casus verwacht");
    Test.is(casus().id, "uwi-eerstelijn");
    Test.is(casus().versie, "1.2");
    Test.is(casus().titel, REF_TITEL, "titel");
    Test.waar(Array.isArray(casus().episodes), "episodes is een array (door de episodebestanden aangevuld)");
    Test.waar(Array.isArray(casus().todoBart), "todoBart is een array");
  });

  Test.registreer(G, "K0 data bevat alleen data: nergens een functie, undefined, NaN of markdown-sterretjes", function () {
    var aantal = 0;
    (function loop(x, pad) {
      aantal++;
      var t = typeof x;
      Test.waar(t !== "function" && t !== "undefined" && t !== "symbol", pad + ": " + t + " in de data");
      Test.waar(!(t === "number" && !isFinite(x)), pad + ": NaN of oneindig in de data");
      if (t === "string") Test.is(x.indexOf("**"), -1, pad + ": markdown ** hoort niet in de data");
      if (x && t === "object") Object.keys(x).forEach(function (k) { loop(x[k], pad + "." + k); });
    })(window.CASUSSEN, "CASUSSEN");
    Test.waar(aantal > 500, "de data is nauwelijks doorlopen");
    Test.gelijk(JSON.parse(JSON.stringify(casus())), casus(), "JSON-rondreis");
  });

  Test.registreer(G, "K1 casus.rollen wijst B1/B2/B3/B5 aan als wissel/stop/pauzeer/hervat; ids bestaan en zijn Bijsturen", function () {
    Test.gelijk(casus().rollen, { wissel: "B1", stop: "B2", pauzeer: "B3", hervat: "B5", uitgesteld: "V2" });
    Object.keys(casus().rollen).filter(function (r) { return r !== "uitgesteld"; }).forEach(function (r) {
      var k = kaart(casus().rollen[r]);
      Test.waar(k, "rol " + r + ": kaart bestaat niet");
      Test.is(k.categorie, "Bijsturen", "rol " + r + " categorie");
    });
  });

  Test.registreer(G, "K1 precies 26 kaarten in casusvolgorde (B5 vóór B4)", function () {
    var ids = casus().kaarten.map(function (k) { return k.id; });
    Test.is(ids.length, 26);
    Test.gelijk(ids, VOLGORDE);
    Test.gelijk(refKaarten().map(function (r) { return r.id; }), VOLGORDE, "referentie zelf klopt niet");
  });

  Test.registreer(G, "K1 elke kaart heeft alle verplichte velden", function () {
    casus().kaarten.forEach(function (k) {
      ["id","categorie","label","vanafEpisode","doelkaart","effect","downside","bron"].forEach(function (v) {
        Test.waar(k.hasOwnProperty(v) && k[v] !== undefined && k[v] !== null && k[v] !== "", k.id + " mist " + v);
      });
      Test.waar(CATEGORIEEN.indexOf(k.categorie) >= 0, k.id + ": onbekende categorie " + k.categorie);
      Test.waar(typeof k.doelkaart === "boolean", k.id + ": doelkaart is geen boolean");
    });
  });

  Test.registreer(G, "K1 precies zes categorieën, en ⊙ wordt categorie + doelkaart:true", function () {
    var gebruikt = {};
    casus().kaarten.forEach(function (k) { gebruikt[k.categorie] = true; });
    Test.gelijk(Object.keys(gebruikt).sort(), CATEGORIEEN.slice().sort());
    refKaarten().forEach(function (r) {
      var k = kaart(r.id);
      Test.is(k.doelkaart, r.cat.indexOf("⊙") >= 0, r.id + " doelkaart");
      Test.is(k.categorie, r.cat.replace(" ⊙", ""), r.id + " categorie");
    });
    Test.gelijk(casus().kaarten.filter(function (k) { return k.doelkaart; }).map(function (k) { return k.id; }),
      ["V2","V6","B1","B2","B3","B5","B4","N2","Ev2"]);
  });

  Test.registreer(G, "K6 label, vanafEpisode en bron zijn teken-voor-teken gelijk aan de casustabel", function () {
    refKaarten().forEach(function (r) {
      var k = kaart(r.id);
      Test.is(k.label, r.label, r.id + " label");
      Test.is(k.vanafEpisode, +r.vanaf.slice(1), r.id + " vanafEpisode");
      Test.is(k.bron, r.bron, r.id + " bron");
    });
  });

  Test.registreer(G, "K6 effect per episode is teken-voor-teken gelijk aan de casustabel", function () {
    refKaarten().forEach(function (r) {
      Test.gelijk(kaart(r.id).effect, verwachtEffect(r), r.id + " effect");
    });
  });

  Test.registreer(G, "K6 downside is teken-voor-teken gelijk aan de casustabel", function () {
    refKaarten().forEach(function (r) {
      Test.gelijk(kaart(r.id).downside, verwachtDownside(r), r.id + " downside");
    });
  });

  Test.registreer(G, "K6 uitzonderingen: G2 gesplitst per episode, V3/V5 houden het E1:-voorvoegsel in effect.alle, O1-downside alleen E1", function () {
    Test.gelijk(kaart("G2").effect, { E1: "eGFR 42, recent.", E2: "eGFR 29 (verborgen).", E3: "eGFR 28, bevestigd." });
    Test.gelijk(kaart("V3").effect, { alle: "E1: 5 dagen 2 dd 100 mg mga. In een risicogroep: 7 dagen." });
    Test.gelijk(kaart("V5").effect, { alle: "E1: 3 dagen 1 dd 300 mg. Risicogroep: 7 dagen." });
    Test.gelijk(kaart("O1").effect, { alle: "Zet een kweek in. Moet vóór de eerste dosis worden afgenomen. Uitslag 3 dagen na inzetten." });
    Test.gelijk(kaart("O1").downside, { E1: "niet geïndiceerd, kost doelmatigheid" });
    Test.is(kaart("V6").vanafEpisode, 2);
    Test.is(kaart("G3").vanafEpisode, 3);
  });

  Test.registreer(G, "K6 effect[episodeId] ?? effect.alle geeft voor elke kaart in elke episode vanaf vanafEpisode precies de casustekst (geen verzonnen tekst)", function () {
    refKaarten().forEach(function (r) {
      var k = kaart(r.id), v = +r.vanaf.slice(1), seg = r.id === "G2" ? segmenten(r.effect) : null;
      Object.keys(k.effect).forEach(function (sl) { Test.waar(sl === "alle" || /^E[123]$/.test(sl), r.id + ": vreemde effectsleutel " + sl); });
      for (var e = v; e <= 3; e++) {
        var uit = k.effect["E" + e] !== undefined && k.effect["E" + e] !== null ? k.effect["E" + e] : k.effect.alle;
        var verwacht = seg ? seg[e] : r.effect;
        Test.is(uit, verwacht, r.id + " effect in E" + e);
      }
      if (!seg) Test.waar(Object.keys(k.effect).join() === "alle", r.id + ": casus geeft één cel, dus alleen effect.alle");
    });
  });

  Test.registreer(G, "K1 raadplegen.titel en comedicatie-labels in doelen komen letterlijk uit de casus", function () {
    Test.is(casus().raadplegen.titel, REF_RAADPLEGEN_TITEL, "raadplegen.titel");
    var gezien = {};
    casus().kaarten.forEach(function (k) {
      if (!k.doelen) return;
      Object.keys(k.doelen).forEach(function (e) {
        k.doelen[e].forEach(function (d) {
          if (REF_COMED[d.id] === undefined) return;
          Test.is(d.label, REF_COMED[d.id], k.id + " " + e + " label van " + d.id);
          gezien[d.id] = true;
        });
      });
    });
    Test.gelijk(Object.keys(gezien).sort(), ["calcium", "lisinopril", "spironolacton"], "alle comedicatie-doelen gecontroleerd");
  });

  Test.registreer(G, "S-TODO inhoud: kaart-TODO_BART-teksten zijn vragen uit casus.todoBart; K2 en K3 beschrijven de gekozen lezing correct", function () {
    var vragen = casus().todoBart.map(function (t) { return t.vraag; });
    casus().kaarten.forEach(function (k) {
      if (k.TODO_BART === undefined) return;
      k.TODO_BART.split(" | ").forEach(function (p) { Test.waar(vragen.indexOf(p) >= 0, k.id + ": TODO_BART-tekst is geen vraag uit casus.todoBart: " + p); });
    });
    var t = {}; casus().todoBart.forEach(function (x) { t[x.id] = x; });
    ["TODO_BART-K1", "TODO_BART-K2", "TODO_BART-K3", "TODO_BART-K4"].forEach(function (id) { Test.waar(t[id], id + " ontbreekt"); });
    Test.is(t["TODO_BART-K1"].gekozenLezing, "Letterlijk \"—\" overgenomen; geen downside verzonnen.");
    Test.waar(/effect\.alle/.test(t["TODO_BART-K2"].gekozenLezing) && /voorvoegsel \"E1: \"/.test(t["TODO_BART-K2"].gekozenLezing) && /geen tekst voor E2 of E3/.test(t["TODO_BART-K2"].gekozenLezing), "K2 gekozenLezing beschrijft effect.alle niet");
    Test.waar(/G2: gesplitst/.test(t["TODO_BART-K3"].gekozenLezing) && /O1 en Ev1: niet gesplitst/.test(t["TODO_BART-K3"].gekozenLezing), "K3 gekozenLezing noemt G2/O1/Ev1 niet juist");
    Test.waar(/V6, ?B1|V6: V5/.test(t["TODO_BART-K4"].vraag), "K4 vraag over doelenlijsten");
    ["V3", "V5"].forEach(function (id) { Test.waar(kaart(id).TODO_BART.indexOf("voorvoegsel") >= 0, id + " mist K2-TODO"); });
    Test.waar(kaart("O1").TODO_BART.indexOf("voorvoegsel") >= 0 && kaart("O1").TODO_BART.indexOf("G2") >= 0, "O1 mist K2+K3-TODO");
  });

  // Pin van ALLE TODO_BART-markeringen in S1: welke plek welke TODO(s) draagt, en dat het er precies zoveel zijn.
  var REF_TODO_PLEKKEN = {
    "kaarten.G2": ["K3"], "kaarten.O1": ["K2", "K3"], "kaarten.V3": ["K2"], "kaarten.V5": ["K2"],
    "kaarten.V6": ["K4"], "kaarten.B1": ["K4"], "kaarten.B2": ["K4"], "kaarten.B3": ["K4"], "kaarten.B5": ["K4"], "kaarten.B4": ["K4"],
    "kaarten.N1": ["K1"], "kaarten.N2": ["K1", "K4"], "kaarten.N3": ["K1"], "kaarten.Ev1": ["K1", "K3"], "kaarten.Ev2": ["K4"],
    "raadplegen": ["K5"]
  };
  var REF_TODO_PLEK_TEKST = {
    K1: "kaarten[N1,N2,N3,Ev1].downside",
    K2: "kaarten[V3,V5].effect; kaarten[O1].downside",
    K3: "kaarten[O1,Ev1,G2].effect",
    K4: "kaarten[V6,B1,B2,B3,B5,B4,N2,Ev2].doelen",
    K5: "raadplegen.bronnen"
  };

  var REF_TODO_TEKST = {
    K1: { vraag: "De casus noemt bij elke kaart een verplichte downside, maar geeft bij N1, N2, N3 en Ev1 \"—\". Is dat bedoeld (geen downside) of ontbreekt er een tekst?",
      gekozenLezing: "Letterlijk \"—\" overgenomen; geen downside verzonnen." },
    K2: { vraag: "De casus geeft het effect van V3 en V5 en de downside van O1 alleen met het voorvoegsel \"E1:\". Geldt dat ook voor E2 en E3?",
      gekozenLezing: "Effect van V3 en V5: de hele casuscel staat letterlijk, inclusief het voorvoegsel \"E1: \", in effect.alle (geldt voor elke episode waarin de kaart in het repertoire zit); geen tekst voor E2 of E3 toegevoegd. Downside van O1: alleen E1 (\"niet geïndiceerd\" geldt niet vanzelf in E2 en E3, waar een kweek wel nodig is); E2 en E3 hebben dus geen downside." },
    K3: { vraag: "Het effect van O1 en Ev1 en de G2-tekst bevatten zinnen die per episode of situatie verschillen, zonder voorvoegsel per episode (G2 E2: \"(verborgen)\"). Moeten die per episode gesplitst worden?",
      gekozenLezing: "O1 en Ev1: niet gesplitst, de volledige casuscel staat letterlijk in effect.alle (geldt voor elke episode vanaf de eerste). G2: gesplitst in drie teksten (E1, E2 met \"(verborgen)\", E3), omdat de casus de varianten per episode noemt." },
    K4: { vraag: "De casus noemt niet expliciet welke doelen een doelkaart per episode mag krijgen. Zijn de gekozen lijsten (V6: V5/V7/V8/lisinopril; B1 en B2: alle antibiotica van de episode, B1-doel = het nieuwe middel; B3 en B5: lisinopril, spironolacton, calcium; B4: V7; N2: de voorgeschreven middelen; Ev2: lisinopril en spironolacton) juist?",
      gekozenLezing: "Doelen afgeleid uit de routes, invarianten en kaarteffecten van de casus en uit bouwopdracht 6.1/6.2; geen enkel doel zonder aanleiding in de casus. De V6-opties zijn letterlijk bouwopdracht 6.2 (door Bart gevalideerd)." },
    K5: { vraag: "De casus noemt voor het raadplegen alleen \"een eigen naslagkaart met verwijzing naar de bronnen\", zonder te zeggen welke bronnen erop staan. Zijn de vier bronnen uit de casuskop (NHG, SIDRIK, Kompas, KNMP) de bedoelde keuze, en blijft de naslagkaart voor alle episodes hetzelfde?",
      gekozenLezing: "Alle vier de bronnen uit de casuskop, in kopvolgorde, als verwijzing op casusniveau (casus.raadplegen), voor elke episode gelijk; geen richtlijntekst toegevoegd." }
  };

  Test.registreer(G, "S-TODO pin: vraag en gekozenLezing van K1 t/m K5 exact vastgelegd", function () {
    var k = casus().todoBart.filter(function (t) { return /^TODO_BART-K\d+$/.test(t.id); });
    Test.is(k.length, 5, "aantal S1-TODO's");
    k.forEach(function (t) {
      var r = REF_TODO_TEKST[t.id.slice(10)];
      Test.waar(r, t.id + " onbekend");
      Test.gelijk(Object.keys(t), ["id", "vraag", "gekozenLezing", "plek"], t.id + " velden");
      Test.is(t.vraag, r.vraag, t.id + " vraag");
      Test.is(t.gekozenLezing, r.gekozenLezing, t.id + " gekozenLezing");
    });
  });

  // Sleutelverzamelingen: geen stray velden (bv. "aanbevolen": true) op kop, kaarten, doelen, opties of raadplegen.
  Test.registreer(G, "K0 exacte sleutelverzamelingen: kop, kaarten, doelen, opties en raadplegen hebben geen onbekende velden", function () {
    function sleutels(o) { return Object.keys(o).sort(); }
    Test.gelijk(sleutels(casus()), ["bronnen","episodes","gevolgzinnen","id","kaarten","limiet","maten","raadplegen","referentie","regelnamen","rollen","titel","todoBart","versie"], "casuskop");
    var basis = ["bron","categorie","doelen","doelkaart","downside","effect","id","label","opties","vanafEpisode"];
    casus().kaarten.forEach(function (k) {
      var verwacht = basis.slice();
      verwacht.push("smaak");
      if (["V3","V4","V5","V7","V8","V9","V10"].indexOf(k.id) >= 0) verwacht.push("dosering", "uitleg");
      if (k.id === "N2") verwacht.push("uitlegVanDoel");
      if (REF_TODO_PLEKKEN["kaarten." + k.id]) verwacht.push("TODO_BART");
      if (k.id === "O1" || k.id === "Ev1") verwacht.push("limiet");
      Test.gelijk(sleutels(k), verwacht.sort(), k.id + " sleutels");
      if (k.doelen) Object.keys(k.doelen).forEach(function (e) {
        k.doelen[e].forEach(function (d) {
          Test.gelijk(sleutels(d), (k.id === "Ev2" || k.id === "V2") ? ["id","label"] : ["id","label","vereist"], k.id + " " + e + " " + d.id + " doelsleutels");
        });
      });
      if (k.opties) Object.keys(k.opties).forEach(function (d) {
        k.opties[d].forEach(function (o) { Test.waar(o.goed === true ? sleutels(o).join() === "goed,tekst" : sleutels(o).join() === "tekst", k.id + " " + d + ": vreemde optiesleutels " + sleutels(o).join()); });
      });
    });
    Test.gelijk(Object.keys(casus().raadplegen), ["titel", "bronnen", "TODO_BART"], "raadplegen");
  });

  Test.registreer(G, "S-TODO pin: elke TODO_BART-markering op de plek zelf (kaarten en raadplegen) is afgedwongen, aantal precies 16 (19 verwijzingen), elk naar een K-regel in casus.todoBart", function () {
    var k = casus().todoBart.filter(function (t) { return /^TODO_BART-K\d+$/.test(t.id); });
    var per = {};
    k.forEach(function (t) { per[t.id.slice(10)] = t; });
    Test.gelijk(k.map(function (t) { return t.id; }), ["TODO_BART-K1", "TODO_BART-K2", "TODO_BART-K3", "TODO_BART-K4", "TODO_BART-K5"], "S1-TODO's in casus.todoBart");
    Object.keys(REF_TODO_PLEK_TEKST).forEach(function (n) { Test.is(per[n].plek, REF_TODO_PLEK_TEKST[n], "plek van " + n); });

    // Verzamel alle markeringen overal in S1-data (kaarten en raadplegen en de casuskop), op sleutelnaam.
    var gevonden = {}, totaal = 0, verwijzingen = 0;
    function zoek(x, pad) {
      if (!x || typeof x !== "object") return;
      Object.keys(x).forEach(function (sl) {
        if (sl === "TODO_BART") { gevonden[pad] = x[sl]; totaal++; return; }
        if (/^TODO_BART/.test(sl)) Test.waar(false, pad + ": vreemde TODO-sleutel " + sl);
        zoek(x[sl], pad + "." + sl);
      });
    }
    var kop = {}; Object.keys(casus()).forEach(function (sl) { if (sl !== "episodes" && sl !== "todoBart") kop[sl] = casus()[sl]; });
    casus().kaarten.forEach(function (kk) { zoek(kk, "kaarten." + kk.id); });
    zoek(casus().raadplegen, "raadplegen");
    Test.waar(!kop.hasOwnProperty("TODO_BART"), "TODO_BART hoort niet op de casuskop");
    Test.gelijk(Object.keys(gevonden).sort(), Object.keys(REF_TODO_PLEKKEN).sort(), "plekken met een TODO_BART");
    Test.is(totaal, 16, "aantal TODO_BART-markeringen");
    Object.keys(REF_TODO_PLEKKEN).forEach(function (pad) {
      var verwacht = REF_TODO_PLEKKEN[pad].map(function (n) { return per[n].vraag; }).join(" | ");
      Test.is(gevonden[pad], verwacht, pad + ": TODO_BART-tekst (vragen " + REF_TODO_PLEKKEN[pad].join("+") + ")");
      verwijzingen += REF_TODO_PLEKKEN[pad].length;
    });
    Test.is(verwijzingen, 19, "aantal TODO-verwijzingen");
    // Omgekeerd: elke K-regel noemt in zijn plek precies de kaarten die hem dragen.
    Object.keys(per).forEach(function (n) {
      var dragers = Object.keys(REF_TODO_PLEKKEN).filter(function (pad) { return REF_TODO_PLEKKEN[pad].indexOf(n) >= 0; });
      Test.waar(dragers.length > 0, "K" + n + " wordt door niets gebruikt");
      dragers.forEach(function (pad) {
        var id = pad.replace("kaarten.", "");
        Test.waar(per[n].plek.indexOf(id) >= 0 || pad === "raadplegen" && per[n].plek.indexOf("raadplegen") === 0, "K" + n + ": plek noemt " + pad + " niet");
      });
    });
    // De vier bronnen van het raadplegen: de TODO noemt de gekozen lezing.
    Test.waar(/casuskop/.test(per.K5.gekozenLezing) && /NHG, SIDRIK, Kompas, KNMP/.test(per.K5.vraag) && /naslagkaart met verwijzing naar de bronnen/.test(per.K5.vraag), "K5 beschrijft de keuze van de vier bronnen");
    Test.gelijk(casus().raadplegen.bronnen, ["NHG", "SIDRIK", "Kompas", "KNMP"]);
  });

  Test.registreer(G, "K2 bronnen letterlijk uit de casuskop (volledige bronbeschrijving)", function () {
    var verwacht = {};
    REF_KOP.split(" · ").forEach(function (s) {
      s = strip(s);
      var m = s.match(/^(.*) \[(\w+)\]$/);
      verwacht[m[2]] = m[1];
    });
    Test.gelijk(Object.keys(verwacht), ["NHG","SIDRIK","Kompas","KNMP"]);
    Test.gelijk(casus().bronnen, verwacht);
    Test.is(casus().bronnen.KNMP, "KNMP medisch-farmaceutische beslisregel 7025-4 \"Kalium controle na 3 dagen\"");
  });

  Test.registreer(G, "K4 labels neutraal: geen hints als aanbevolen, eerste keus, beste, volgorde", function () {
    var verboden = /aanbevolen|eerste keus|1e keus|\bbeste\b|\badvies\b|stap \d|\beerst\b|verplicht|\bgoed\b|\bfout\b/i;
    casus().kaarten.forEach(function (k) {
      Test.waar(!verboden.test(k.label), k.id + ": label verraadt iets: " + k.label);
      Test.waar(!/\d+\.\s/.test(k.label), k.id + ": nummering in label");
    });
  });

  Test.registreer(G, "K4 waar de casus \"—\" als downside geeft staat \"—\" én een TODO_BART (op de kaart en in casus.todoBart)", function () {
    var streepjes = refKaarten().filter(function (r) { return r.down === "—"; }).map(function (r) { return r.id; });
    Test.gelijk(streepjes, ["N1","N2","N3","Ev1"]);
    streepjes.forEach(function (id) {
      var k = kaart(id);
      Test.is(k.downside, "—", id + " downside");
      Test.waar(typeof k.TODO_BART === "string" && k.TODO_BART.length > 0, id + " mist TODO_BART");
      Test.waar(casus().todoBart.some(function (t) { return t.plek.indexOf(id) >= 0 && t.plek.indexOf("downside") >= 0; }), id + " mist todoBart-regel");
    });
  });

  Test.registreer(G, "S-TODO elke todoBart-regel heeft id, vraag, gekozenLezing en plek; elke kaart-TODO staat ook in de lijst", function () {
    var ids = {};
    casus().todoBart.forEach(function (t) {
      ["id","vraag","gekozenLezing","plek"].forEach(function (v) { Test.waar(typeof t[v] === "string" && t[v].length > 0, (t.id || "?") + " mist " + v); });
      Test.waar(/^TODO_BART-/.test(t.id), "id " + t.id);
      Test.waar(!ids[t.id], "dubbel id " + t.id); ids[t.id] = true;
    });
    casus().kaarten.forEach(function (k) {
      if (k.TODO_BART === undefined) return;
      Test.waar(typeof k.TODO_BART === "string" && k.TODO_BART.length > 0, k.id + " TODO_BART leeg");
      Test.waar(casus().todoBart.some(function (t) { return t.plek.indexOf(k.id) >= 0; }), k.id + " staat niet in casus.todoBart");
    });
  });

  Test.registreer(G, "K3 elke doelkaart heeft doelen voor elke episode vanaf zijn startepisode, niet-doelkaarten geen", function () {
    casus().kaarten.forEach(function (k) {
      if (!k.doelkaart) { Test.is(k.doelen, null, k.id + " heeft doelen maar is geen doelkaart"); return; }
      for (var e = 1; e <= 3; e++) {
        var lijst = k.doelen && k.doelen["E" + e];
        if (e < k.vanafEpisode) Test.is(lijst, undefined, k.id + " doelen voor E" + e + " vóór startepisode");
        else Test.waar(Array.isArray(lijst) && lijst.length > 0, k.id + " mist doelen voor E" + e);
      }
    });
  });

  Test.registreer(G, "K3 doel-ids zijn middel-kaart-ids of comedicatie-ids; elk doel heeft id en label; predicaten zijn JSON met bekende p", function () {
    var comed = ["lisinopril","spironolacton","calcium"];
    function controleer(p, waar) {
      Test.waar(p && typeof p === "object" && PRED.indexOf(p.p) >= 0, waar + ": onbekend predicaat " + JSON.stringify(p));
      (p.args || []).forEach(function (a) { controleer(a, waar); });
      if (p.arg) controleer(p.arg, waar);
    }
    casus().kaarten.forEach(function (k) {
      if (!k.doelen) return;
      Object.keys(k.doelen).forEach(function (e) {
        k.doelen[e].forEach(function (d) {
          var isMiddel = kaart(d.id) && kaart(d.id).categorie === "Voorschrijven";
          Test.waar(isMiddel || comed.indexOf(d.id) >= 0, k.id + " " + e + ": ongeldig doel " + d.id);
          Test.waar(typeof d.label === "string" && d.label.length > 0, k.id + " " + d.id + " mist label");
          if (isMiddel) Test.is(d.label, kaart(d.id).label, k.id + ": label van antibioticum-doel is het kaartlabel");
          if (d.vereist) controleer(d.vereist, k.id + " " + d.id);
        });
      });
    });
  });

  Test.registreer(G, "K3 vereist-regels: B2 alleen op actief middel, B5 alleen op gepauzeerd middel, B4 alleen op actief V7", function () {
    ["E2","E3"].forEach(function (e) {
      kaart("B2").doelen[e].forEach(function (d) { Test.gelijk(d.vereist, { p: "actief", middel: d.id }, "B2 " + d.id); });
      kaart("B1").doelen[e].forEach(function (d) {
        Test.gelijk(d.vereist, { p: "en", args: [{ p: "actief" }, { p: "niet", arg: { p: "actief", middel: d.id } }] }, "B1 " + d.id);
      });
    });
    kaart("B5").doelen.E3.forEach(function (d) { Test.gelijk(d.vereist, { p: "niet", arg: { p: "medicatieActief", id: d.id } }, "B5 " + d.id); });
    kaart("B3").doelen.E3.forEach(function (d) { Test.gelijk(d.vereist, { p: "medicatieActief", id: d.id }, "B3 " + d.id); });
    Test.gelijk(kaart("B4").doelen.E3.map(function (d) { return d.id; }), ["V7"]);
    Test.gelijk(kaart("B4").doelen.E3[0].vereist, { p: "actief", middel: "V7" });
  });

  Test.registreer(G, "K3 vereist-regels: V6 alleen op gestart middel of actieve comedicatie; N2 alleen op gestart middel", function () {
    ["E2","E3"].forEach(function (e) {
      kaart("V6").doelen[e].forEach(function (d) {
        if (d.id === "lisinopril") Test.gelijk(d.vereist, { p: "medicatieActief", id: "lisinopril" });
        else Test.gelijk(d.vereist, { p: "gestart", middel: d.id }, "V6 " + d.id);
      });
    });
    ["E1","E2","E3"].forEach(function (e) {
      kaart("N2").doelen[e].forEach(function (d) { Test.gelijk(d.vereist, { p: "actief", middel: d.id }, "N2 " + d.id); });
    });
  });

  // Volledige pin van ALLE doelenlijsten van ALLE doelkaarten in ALLE episodes, inclusief label en vereist-predicaat.
  // De verwachte lijsten staan hier uitgeschreven (niet uit de data afgeleid).
  var AB = { E1: ["V3","V4","V5"], E2: ["V3","V4","V5"], E3: ["V3","V4","V5","V7","V8","V9","V10"] };
  var COMED = ["lisinopril","spironolacton","calcium"];
  function lab(id) { var r = refKaarten().filter(function (x) { return x.id === id; })[0]; return r ? r.label : REF_COMED[id]; }
  function doelen(ids, vereist) {
    return ids.map(function (id) {
      var d = { id: id, label: lab(id) };
      if (vereist) d.vereist = vereist(id);
      return d;
    });
  }
  var REF_DOELEN = {
    V6: { E2: doelen(["V5","lisinopril"], function (id) { return id === "lisinopril" ? { p: "medicatieActief", id: id } : { p: "gestart", middel: id }; }),
          E3: doelen(["V5","V7","V8","lisinopril"], function (id) { return id === "lisinopril" ? { p: "medicatieActief", id: id } : { p: "gestart", middel: id }; }) },
    B1: { E2: doelen(AB.E2, function (id) { return { p: "en", args: [{ p: "actief" }, { p: "niet", arg: { p: "actief", middel: id } }] }; }),
          E3: doelen(AB.E3, function (id) { return { p: "en", args: [{ p: "actief" }, { p: "niet", arg: { p: "actief", middel: id } }] }; }) },
    B2: { E2: doelen(AB.E2, function (id) { return { p: "actief", middel: id }; }),
          E3: doelen(AB.E3, function (id) { return { p: "actief", middel: id }; }) },
    B3: { E3: doelen(COMED, function (id) { return { p: "medicatieActief", id: id }; }) },
    B5: { E3: doelen(COMED, function (id) { return { p: "niet", arg: { p: "medicatieActief", id: id } }; }) },
    B4: { E3: doelen(["V7"], function (id) { return { p: "actief", middel: id }; }) },
    V2: { E1: doelen(AB.E1, null), E2: doelen(AB.E2, null), E3: doelen(AB.E3, null) },
    N2: { E1: doelen(AB.E1, function (id) { return { p: "actief", middel: id }; }),
          E2: doelen(AB.E2, function (id) { return { p: "actief", middel: id }; }),
          E3: doelen(AB.E3, function (id) { return { p: "actief", middel: id }; }) },
    Ev2: { E3: doelen(["lisinopril","spironolacton"], null) }
  };

  Test.registreer(G, "K3 doelen: alle 9 doelkaarten x alle episodes: id-lijst, label en vereist-predicaat exact gelijk aan de uitgeschreven referentie", function () {
    var doelkaarten = Object.keys(REF_DOELEN);
    Test.gelijk(casus().kaarten.filter(function (k) { return k.doelkaart; }).map(function (k) { return k.id; }).sort(), doelkaarten.slice().sort(), "set doelkaarten");
    var aantalLijsten = 0, aantalDoelen = 0;
    doelkaarten.forEach(function (id) {
      var k = kaart(id);
      Test.gelijk(Object.keys(k.doelen), Object.keys(REF_DOELEN[id]), id + ": episodes met doelen");
      Object.keys(REF_DOELEN[id]).forEach(function (e) {
        var data = k.doelen[e], ref = REF_DOELEN[id][e];
        Test.gelijk(data.map(function (d) { return d.id; }), ref.map(function (d) { return d.id; }), id + " " + e + " id-lijst");
        Test.is(data.length, ref.length, id + " " + e + " aantal doelen");
        ref.forEach(function (d, i) {
          Test.gelijk(Object.keys(data[i]), Object.keys(d), id + " " + e + " " + d.id + " velden (Ev2 heeft geen vereist)");
          Test.gelijk(data[i], d, id + " " + e + " " + d.id);
          aantalDoelen++;
        });
        aantalLijsten++;
      });
    });
    Test.is(aantalLijsten, 16, "aantal doelenlijsten (doelkaart x episode)");
    Test.is(aantalDoelen, 61, "aantal doelen in totaal");
    Test.gelijk(kaart("Ev2").doelen.E3.map(function (d) { return d.hasOwnProperty("vereist"); }), [false, false], "Ev2 mag ook op een gepauzeerd middel (overleg vóór hervatten)");
  });

  Test.registreer(G, "K3 opties van V6 letterlijk uit bouwopdracht 6.2, met goed gemarkeerd", function () {
    var verwachtGoed = { V5: ["halveren"], V8: ["875/125 mg 2 dd"], V7: ["normale keerdosis 1× per 24 uur", "geen aanpassing"], lisinopril: ["halveren"] };
    var regels = REF_OPTIES.split("\n"), n = 0;
    regels.forEach(function (regel) {
      var c = celrij(regel), m = c[0].match(/\((V\d+)\)/), doel = m ? m[1] : c[0].toLowerCase();
      var teksten = c[1].split(" · ");
      var opt = kaart("V6").opties[doel];
      Test.waar(Array.isArray(opt), "geen opties voor " + doel);
      Test.gelijk(opt.map(function (o) { return o.tekst; }), teksten, "optieteksten " + doel);
      Test.gelijk(opt.filter(function (o) { return o.goed === true; }).map(function (o) { return o.tekst; }), verwachtGoed[doel], "goed " + doel);
      opt.forEach(function (o) { Test.waar(o.goed === undefined || o.goed === true, "goed mag alleen true of afwezig zijn"); });
      n++;
    });
    Test.is(n, 4);
    Test.is(Object.keys(kaart("V6").opties).length, 4, "geen extra opties");
    casus().kaarten.forEach(function (k) { if (k.id !== "V6") Test.is(k.opties, null, k.id + " heeft opties"); });
    // elk V6-doel heeft opties
    ["E2","E3"].forEach(function (e) { kaart("V6").doelen[e].forEach(function (d) { Test.waar(kaart("V6").opties[d.id], "V6-doel zonder opties: " + d.id); }); });
  });

  Test.registreer(G, "K5 raadplegen: titel + verwijzing naar bronnen, geen richtlijntekst", function () {
    var r = casus().raadplegen;
    Test.waar(typeof r.titel === "string" && r.titel.length > 0, "titel");
    Test.gelijk(r.bronnen, Object.keys(casus().bronnen));
    Test.gelijk(Object.keys(r), ["titel", "bronnen", "TODO_BART"], "raadplegen heeft precies titel, bronnen en de TODO_BART-markering");
    Test.waar(JSON.stringify({ titel: r.titel, bronnen: r.bronnen }).length < 200, "raadplegen bevat te veel tekst");
  });
})();

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
    "| O1 | Onderzoek | Urinekweek inzetten | E1 | Zet een kweek in. Moet vóór de eerste dosis worden afgenomen. Uitslag in E2 na de 4e gespeelde kaart, in E3 drie kaarten na O1. | E1: niet geïndiceerd, kost doelmatigheid | NHG |",
    "| O2 | Onderzoek | Kalium bepalen | E1 | Bepaalt de kaliumspiegel | Alleen zinvol bij een indicatie; anders kost het doelmatigheid | NHG, KNMP |",
    "| V1 | Voorschrijven | Afwachtend beleid | E1 | Geen antibioticum; ruim drinken, zo nodig pijnstilling | Klachten duren langer; risico op pyelonefritis ongeveer 1,6% hoger | NHG |",
    "| V2 | Voorschrijven | Uitgesteld recept | E1 | De patiënt start zelf als de klachten aanhouden of toenemen | Ze moet weten wanneer ze moet starten | NHG |",
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
    "| N2 | Informeren ⊙ | Gebruik en verwachting uitleggen | E1 | Inhoud per middel, bijvoorbeeld bij fosfomycine: klachten niet direct weg | — | NHG |",
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
    Test.is(casus().versie, "1.1");
    Test.is(casus().titel, REF_TITEL, "titel");
    Test.waar(Array.isArray(casus().episodes), "episodes is een array (door de episodebestanden aangevuld)");
    Test.waar(Array.isArray(casus().todoBart), "todoBart is een array");
  });

  Test.registreer(G, "K0 data bevat alleen data: geen functies, geen markdown-sterretjes, JSON-rond", function () {
    var json = JSON.stringify(casus());
    Test.gelijk(JSON.parse(json), casus(), "functies of undefined in de data");
    Test.is(json.indexOf("**"), -1, "markdown ** hoort niet in de data");
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
      ["V6","B1","B2","B3","B5","B4","N2","Ev2"]);
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
    Test.gelijk(kaart("O1").effect, { alle: "Zet een kweek in. Moet vóór de eerste dosis worden afgenomen. Uitslag in E2 na de 4e gespeelde kaart, in E3 drie kaarten na O1." });
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
      kaart("N2").doelen[e].forEach(function (d) { Test.gelijk(d.vereist, { p: "gestart", middel: d.id }, "N2 " + d.id); });
    });
  });

  Test.registreer(G, "K3 doelen per episode volgens de casus (episodegrenzen: geen E3-middelen in E1/E2)", function () {
    function ids(k, e) { return kaart(k).doelen[e].map(function (d) { return d.id; }); }
    Test.gelijk(ids("N2", "E1"), ["V3","V4","V5"]);
    Test.gelijk(ids("B1", "E2"), ["V3","V4","V5"]);
    Test.gelijk(ids("B2", "E2"), ["V3","V4","V5"]);
    Test.gelijk(ids("V6", "E2"), ["V5","lisinopril"]);
    Test.gelijk(ids("B1", "E3"), ["V3","V4","V5","V7","V8","V9","V10"]);
    Test.gelijk(ids("B3", "E3"), ["lisinopril","spironolacton","calcium"]);
    Test.gelijk(ids("Ev2", "E3"), ["lisinopril","spironolacton"]);
    Test.waar(!kaart("Ev2").doelen.E3.some(function (d) { return d.vereist; }), "Ev2 mag ook op een gepauzeerd middel (overleg vóór hervatten)");
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
    Test.waar(JSON.stringify(r).length < 200, "raadplegen bevat te veel tekst");
  });
})();

/* Weergave van het spel (window.UI). Klassiek script, geen modules, geen netwerk.
 *
 * Regels voor deze laag:
 *  - Alle klinische tekst komt uit de data (casus-object) of uit de uitkomst van Evaluatie; hier staan alleen korte
 *    bedieningsteksten (knoppen, uitleg). Geen middelnamen, kaart-id's of klinische drempels.
 *  - Voor het spelen toont een kaart ALLEEN categorie (de kop waaronder hij staat) en label, op de hand én in het kaartvenster.
 *    Effect, dosering, smaakregel, doelenlijst, downside en bron komen nooit in de pagina vóór het spelen (D2/D3: niets verklapt
 *    vooraf wat goed is). Het effect (wat de kaart onthult) verschijnt pas na het spelen, op de tijdlijn; downsides pas in het
 *    evaluatiescherm. De smaakregels (concept, niet gekeurd) worden nergens getoond.
 *  - Bronmarkeringen tussen vierkante haken ([G] en de codes uit casus.bronnen) en een episodecode vooraan ("E1: ") worden in alle
 *    getoonde tekst weggelaten (zie schoneTekst); de data blijft letterlijk. Het docentenoverzicht (tools/overzicht.html) toont ze wel.
 *  - De testmodus is alleen te kiezen als de pagina met ?docent in de adresregel is geopend.
 *  - De patiëntkaart toont alleen state.zichtbaar (kop, klachten, medicatie, lab, eerdere gegevens). Nooit `meta`, `waar`
 *    of TODO_BART.
 *  - Predicaten worden niet zelf gelezen: toegestane doelen komen via Predicaten.evalueer (zelfde regel als de engine).
 *
 * De logica (UI.* zonder DOM) is apart exporteerbaar en wordt in Node getest (tests/ui.tests.js).
 * UI.start(rootElement) bouwt het scherm; zonder document gebeurt er bij het laden niets.
 */
(function uiModule(g) {
  "use strict";

  var SCHAAL = 3;                                     // score-schaal 1-3 (contract 5), alleen voor de weergave van puntjes
  var PSEUDONIEM_SLEUTEL = "egc.pseudoniem.sessie";   // alleen de laatst gebruikte code in dit tabblad (gemak)
  // Bedieningsrondleiding aan het begin van de eerste episode (concepttekst voor Bart, geen klinische inhoud).
  var RONDLEIDING = [
    { titel: "De patiëntkaart", tekst: "Links zie je de patiënt. Sommige gegevens zie je pas nadat je een kaart hebt gespeeld." },
    { titel: "Je kaarten", tekst: "In het midden liggen je kaarten, per soort. Klik op een kaart om hem te openen." },
    { titel: "De knop Speel", tekst: "Pas met de knop Speel in het kaartvenster speel je de kaart. Sommige kaarten vragen daarna om een keuze." },
    { titel: "Acties en dagen", tekst: "Elke dag heb je een aantal acties. Een kaart spelen kost een actie. Een gespeelde kaart komt rechts op de tijdlijn. Met Volgende dag ga je een dag verder." },
    { titel: "Een poging", tekst: "Aan het eind van de episode krijg je een beoordeling. Eén keer een episode spelen is een poging; je mag opnieuw proberen." }
  ];
  var RONDLEIDING_SLEUTEL = "egc.rondleiding.gezien";
  var DOELVELDEN = [                                  // welke velden van state.zichtbaar de patiëntkaart toont, en onder welk kopje
    ["kop", null],
    ["klachten", null],
    ["medicatieTekst", "Medicatie"],
    ["labTekst", "Lab"],
    ["eerdereUWI", "Eerdere UWI"],
    ["eerdereKweek", null]                            // het kopje staat in de data (bedieningslabel bij de onthulling)
  ];

  /* ====================================================================== */
  /* Logica zonder DOM                                                      */
  /* ====================================================================== */

  function lijst(x) { return x == null ? [] : (Array.isArray(x) ? x : [x]); }
  function isObj(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }

  function slug(tekst) {
    var t = String(tekst == null ? "" : tekst);
    try { t = t.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) { /* oude omgeving */ }
    return t.toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function normaliseer(tekst) {
    var t = String(tekst == null ? "" : tekst).trim();
    try { t = t.normalize("NFC"); } catch (e) { /* oude omgeving */ }
    return t.toLowerCase();
  }
  function zelfdePseudoniem(a, b) { return normaliseer(a) !== "" && normaliseer(a) === normaliseer(b); }

  function pseudoniemControle(tekst) {
    var waarde = String(tekst == null ? "" : tekst).trim();
    if (waarde === "") return { ok: false, waarde: "", fout: "Vul een pseudoniem in om te beginnen." };
    return { ok: true, waarde: waarde, fout: null };
  }

  function recordsVan(records, pseudoniem) {
    return lijst(records).filter(function (r) { return r && zelfdePseudoniem(r.pseudoniem, pseudoniem); });
  }

  function episodeNummer(casus, ep) {
    var eps = lijst(casus && casus.episodes);
    for (var i = 0; i < eps.length; i++) if (eps[i] === ep || (ep && eps[i].id === ep.id)) return i + 1;
    return 0;
  }

  // Per episode: nummer, of hij open is (Engine.ontgrendeld) en of de speler hem al gehaald heeft.
  function episodeOverzicht(casus, pseudoniem, alleRecords, testmodus) {
    // Pogingen in testmodus tellen niet mee: ze ontgrendelen niets en tellen niet als gehaald. In testmodus staan alle episodes open.
    var mijn = recordsVan(alleRecords, pseudoniem).filter(function (r) { return !r.testmodus; });
    return lijst(casus.episodes).map(function (ep, i) {
      var gehaald = mijn.some(function (r) {
        // Een verloren episode (bv. door sepsis) is nooit gehaald, ook niet als er geen veiligheidsregel is geschonden.
        return r.episodeId === ep.id && (r.casusId == null || r.casusId === casus.id) && Array.isArray(r.geschonden) && r.geschonden.length === 0 &&
          r.poortGehaald !== false && r.afloop !== "verloren";
      });
      return {
        id: ep.id, nummer: i + 1, titel: "Episode " + (i + 1),
        open: !!testmodus || g.Engine.ontgrendeld(casus, ep.id, mijn),
        gehaald: gehaald,
        vorige: i > 0 ? "Episode " + i : null,
        testmodus: !!testmodus
      };
    });
  }

  function kaartVan(casus, id) {
    var k = lijst(casus && casus.kaarten);
    for (var i = 0; i < k.length; i++) if (k[i].id === id) return k[i];
    return null;
  }

  // Kaarten van het repertoire, gegroepeerd per categorie in volgorde van de bibliotheek. Per kaart ALLEEN id, label, categorie.
  function kaartenPerCategorie(casus, ep) {
    var rep = lijst(ep.repertoire), groepen = [], index = {};
    lijst(casus.kaarten).forEach(function (k) {
      if (rep.indexOf(k.id) < 0) return;
      if (!Object.prototype.hasOwnProperty.call(index, k.categorie)) {
        index[k.categorie] = groepen.length;
        groepen.push({ categorie: k.categorie, klasse: "cat-" + slug(k.categorie), kaarten: [] });
      }
      groepen[index[k.categorie]].kaarten.push({ id: k.id, label: k.label, categorie: k.categorie });
    });
    return groepen;
  }

  function doelLabel(casus, ep, id) {
    var k = kaartVan(casus, id);
    if (k) return k.label;
    var med = lijst(ep.patient && ep.patient.medicatie);
    for (var i = 0; i < med.length; i++) if (med[i].id === id) return med[i].label;
    return String(id);
  }

  // Alleen doelen die de engine nu toestaat: de `vereist`-regel van de data, via Predicaten (geen eigen parser).
  function toegestaneDoelen(casus, ep, state, kaartId) {
    var kaart = kaartVan(casus, kaartId);
    if (!kaart) return [];
    var doelen = isObj(kaart.doelen) ? kaart.doelen[ep.id] : null, ctx = null, uit = [];
    function heeftOpties(id) { return !kaart.opties || lijst(kaart.opties[id]).length > 0; }
    // Een doel waarvoor de kaart al het maximum aantal keren is gespeeld, verschijnt niet meer (zelfde regel als de engine).
    function kanNog(id) { return !(state && Array.isArray(state.tijdlijn) && g.Engine && g.Engine.plafondBereikt && g.Engine.plafondBereikt(state, kaartId, id)); }
    if (Array.isArray(doelen)) {
      doelen.forEach(function (d) {
        if (!kanNog(d.id)) return;
        if (d.vereist) {
          ctx = ctx || g.Predicaten.maakContext(casus, ep, state);
          if (!g.Predicaten.evalueer(d.vereist, ctx)) return;
        }
        if (!heeftOpties(d.id)) return;
        uit.push({ id: d.id, label: d.label || doelLabel(casus, ep, d.id) });
      });
    } else if (isObj(kaart.opties)) {
      Object.keys(kaart.opties).forEach(function (id) { if (kanNog(id)) uit.push({ id: id, label: doelLabel(casus, ep, id) }); });
    }
    return uit;
  }

  // Geen doel meer over, maar wel doelen waarvoor de kaart al gespeeld is: dan is de kaart "op", niet "past nergens bij".
  function alleDoelenGebruikt(casus, ep, state, kaartId) {
    if (!state || !Array.isArray(state.tijdlijn)) return false;
    return state.tijdlijn.some(function (r) { return r.kaart === kaartId && r.doel != null; });
  }

  function isDoelkaart(casus, ep, kaartId) {
    var k = kaartVan(casus, kaartId);
    return !!k && (!!k.doelkaart || (isObj(k.doelen) && !!k.doelen[ep.id]) || !!k.opties);
  }

  // Opties van een doelkaart voor een doel, in willekeurige volgorde (Fisher-Yates). Alleen de tekst; `goed` blijft in de data.
  function optiesVoor(kaart, doelId, rng) {
    var r = typeof rng === "function" ? rng : Math.random;
    var a = lijst(kaart && kaart.opties && kaart.opties[doelId]).map(function (o) { return typeof o === "string" ? o : o.tekst; });
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      if (!(j >= 0 && j <= i)) j = i;
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function regelTitel(casus, ep, regel) {
    var k = kaartVan(casus, regel.kaart), t = k ? k.label : regel.kaart;
    if (regel.doel) t += " → " + doelLabel(casus, ep, regel.doel);
    if (regel.optie) t += " (" + regel.optie + ")";
    return t;
  }

  // De effecttekst van een kaart voor een episode: effect[episode] ?? effect.alle, anders niets. De ENIGE plek waar dit gelezen wordt.
  function effectVoor(kaart, episodeId) {
    var e = kaart && kaart.effect;
    if (typeof e === "string") return e !== "" ? e : null;
    if (!isObj(e)) return null;
    var t = Object.prototype.hasOwnProperty.call(e, episodeId) && e[episodeId] != null ? e[episodeId] : (e.alle != null ? e.alle : null);
    return typeof t === "string" && t !== "" ? t : null;
  }

  // Tekst na het spelen: de onthulling (als de kaart iets onthulde), bij een kaart die de medicatielijst toont (toontMedicatie in de data)
  // die lijst zoals hij was toen de kaart gespeeld werd, bij een kaart met uitlegVanDoel de uitleg van het gekozen middel,
  // anders effect[episode] ?? effect.alle, anders niets.
  function naSpelenTekst(casus, ep, state, kaartId, doel) {
    var onthuld = lijst(state.onthuld).filter(function (o) { return o.kaart === kaartId; }).map(function (o) { return o.tekst; });
    if (onthuld.length) return { soort: "onthuld", tekst: onthuld.join(" ") };
    var k = kaartVan(casus, kaartId);
    if (k && k.toontMedicatie) {
      var ml = medicatieLijstTekst(casus, ep, state, kaartId);
      if (ml) return { soort: "onthuld", tekst: ml };
    }
    if (k && k.uitlegVanDoel && doel) {
      var dk = kaartVan(casus, doel);
      if (dk && typeof dk.uitleg === "string" && dk.uitleg !== "") return { soort: "effect", tekst: dk.uitleg };
    }
    var t = effectVoor(k, ep.id);
    return t ? { soort: "effect", tekst: t } : null;
  }

  // Heeft de kaart op dit moment precies één mogelijk doel, dan is dat het doel (geen keuzelijst); anders null.
  function enigDoel(casus, ep, state, kaartId) {
    var d = toegestaneDoelen(casus, ep, state, kaartId);
    return d.length === 1 ? d[0].id : null;
  }

  function gebeurtenisTekst(ep, id) {
    var l = lijst(ep.gebeurtenissen);
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i].tekst;
    return "";
  }

  // Een gebeurtenis als kaart: de tekst uit de data, en de titel uit de data alleen als de tekst er niet al mee begint.
  function gebeurtenisModel(ep, id) {
    var l = lijst(ep && ep.gebeurtenissen), def = null;
    for (var i = 0; i < l.length; i++) if (l[i].id === id) def = l[i];
    var tekst = def && typeof def.tekst === "string" ? def.tekst : "", titel = def && typeof def.titel === "string" ? def.titel : "";
    return { id: id, tekst: tekst, titel: titel && tekst.indexOf(titel) !== 0 ? titel : null };
  }

  // "Klachten houden aan: dag 3, 4, 5." als de escalatie aan staat en de klachten aanhouden; anders null. De tekst staat in de data.
  // De getallen zijn de echte dagen waarop de klachten aanhielden: de `reeks` volle dagen vóór de dag van kl (zo telt de engine).
  function aanhoudendTekst(ep, kl) {
    var ec = ep && ep.escalatie, n = kl && kl.reeks;
    if (!ec || !ec.aan || !ec.waarschuwing || !(n > 0)) return null;
    var dagen = [], d = kl && typeof kl.dag === "number" ? kl.dag : n + 1;
    for (var i = d - n; i < d; i++) dagen.push(i);
    return ec.waarschuwing + " " + dagen.join(", ") + ".";
  }

  function statusTekstenVan(ep) { return (ep && (ep.statusTeksten || (ep.werkzaamheid && ep.werkzaamheid.statusTeksten))) || {}; }

  // Klachten per dag op de patiëntkaart: precies één regel per verstreken dag (dag 1 tot en met de huidige), nieuwste bovenaan.
  // Tekst: de klachtenstatus uit de data; zonder status maar met aanhoudende klachten (escalatie) de statustekst voor "houden aan" uit de
  // data; anders null (de weergave toont dan een streepje). Geen extra waarschuwingsregels.
  function klachtenPerDag(ep, state) {
    var uit = [], aan = statusTekstenVan(ep).aan;
    for (var d = 1; d <= state.dag; d++) {
      var kl = lijst(state.klachten)[d], tekst = kl && kl.tekst ? kl.tekst : null;
      if (!tekst && kl && kl.reeks > 0 && typeof aan === "string" && aan !== "") tekst = aan;
      uit.push({ dag: d, huidig: d === state.dag, tekst: tekst });
    }
    return uit.reverse();
  }

  // Gebeurtenissen sinds de start (oudste eerst), met de tekst uit de data: voor de patiëntkaart onder "Nieuw sinds de start".
  function gebeurtenissenSindsStart(ep, state) {
    return lijst(state.gebeurtenissen).slice().sort(function (a, b) { return a.dag - b.dag; }).map(function (x) {
      return { id: x.id, dag: x.dag, tekst: gebeurtenisTekst(ep, x.id) };
    }).filter(function (x) { return x.tekst; });
  }

  /* ---------- medicatie: actuele status per middel (alleen lezen) ---------- */
  // Per middel van de patiënt (ep.patient.medicatie): de status na de kaarten die op dat middel zijn gespeeld. Gepauzeerd komt uit de
  // regeltaal (Predicaten, predicaat medicatieActief op de speltoestand); de gekozen aanpassing is de optietekst uit de data; "hervat" en
  // "gepauzeerd" zijn bedieningswoorden. De rollen (pauzeer, hervat) staan in de data. Met opKaart: de stand op het moment dat die
  // kaart (voor het eerst) gespeeld werd.
  function medicatieStatus(casus, ep, state, opKaart) {
    var rl = isObj(casus && casus.rollen) ? casus.rollen : {}, meds = lijst(ep && ep.patient && ep.patient.medicatie);
    var rijen = lijst(state && state.tijdlijn).slice().sort(function (a, b) { return a.volg - b.volg; }), grens = null, ctx = null;
    if (opKaart) rijen.forEach(function (r) { if (grens === null && r.kaart === opKaart) grens = r.volg; });
    if (grens !== null) rijen = rijen.filter(function (r) { return r.volg <= grens; });
    return meds.map(function (m) {
      var eigen = rijen.filter(function (r) { return r.doel === m.id; }), dosis = null, hervat = false, gepauzeerd = false;
      eigen.forEach(function (r) {
        if (r.optie) dosis = r.optie;
        if (r.kaart === rl.pauzeer) hervat = false;
        if (r.kaart === rl.hervat) hervat = true;
      });
      if (eigen.some(function (r) { return r.kaart === rl.pauzeer; })) {
        ctx = ctx || g.Predicaten.maakContext(casus, ep, state);
        var pred = { p: "medicatieActief", id: m.id };
        if (grens !== null) pred.op = { naKaart: { kaart: opKaart } };
        gepauzeerd = !g.Predicaten.evalueer(pred, ctx);
      }
      var delen = [];
      if (dosis) delen.push(dosis);
      if (gepauzeerd) delen.push("gepauzeerd");
      else if (hervat) delen.push("hervat");
      return { id: m.id, label: m.label, status: delen.length ? delen.join(", ") : null };
    });
  }

  // De medicatielijst als één regel ("Medicatie: a, b (gepauzeerd), c."), of null als de patiënt geen medicatie in de data heeft.
  function medicatieLijstTekst(casus, ep, state, opKaart) {
    var st = medicatieStatus(casus, ep, state, opKaart);
    if (!st.length) return null;
    return "Medicatie: " + st.map(function (m) { return m.label + (m.status ? " (" + m.status + ")" : ""); }).join(", ") + ".";
  }

  /* ---------- getoonde tekst zonder bronmarkeringen ---------- */
  // Codes tussen vierkante haken die als bronmarkering dienen: de sleutels van casus.bronnen en casus.markeringen (uit de data).
  // Een episodecode vooraan ("E1: ") komt uit de episode-id's van de casus. De data zelf blijft letterlijk.
  var schoonCache = { casus: null, bron: null, ep: null };
  function schoonRegex(casus) {
    if (schoonCache.casus === casus && schoonCache.aantal === lijst(casus && casus.episodes).length) return schoonCache;
    function esc(x) { return String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
    var codes = [];
    [casus && casus.bronnen, casus && casus.markeringen].forEach(function (o) { if (isObj(o)) Object.keys(o).forEach(function (c) { if (c) codes.push(esc(c)); }); });
    var eps = lijst(casus && casus.episodes).map(function (e) { return e && e.id ? esc(e.id) : null; }).filter(Boolean);
    var code = "(?:" + codes.join("|") + ")";
    schoonCache = {
      casus: casus, aantal: lijst(casus && casus.episodes).length,
      bron: codes.length ? new RegExp("\\s*\\[\\s*" + code + "(?:\\s*,\\s*" + code + ")*\\s*\\]", "g") : null,
      ep: eps.length ? new RegExp("^\\s*(?:" + eps.join("|") + "):\\s+") : null
    };
    return schoonCache;
  }
  function schoneTekst(casus, tekst) {
    if (typeof tekst !== "string" || !casus) return tekst;
    var r = schoonRegex(casus), t = tekst;
    if (r.bron) t = t.replace(r.bron, "");
    if (r.ep) t = t.replace(r.ep, "");
    return t;
  }

  // Tijdlijn: voor elke dag tot en met de huidige: banners, klachtenstatus, gespeelde kaarten en raadplegingen.
  function dagenModel(casus, ep, state) {
    var uit = [];
    // Doorgespoeld (na 'Episode afronden'): de dagen na de dag van afronden tot en met de dag waarop het doorspoelen stopte of eindigde.
    function doorgespoeld(d) { return lijst(state.doorgespoeld).some(function (x) { return x && d > x.van && d <= x.tot; }); }
    for (var d = 1; d <= state.dag; d++) {
      var kl = lijst(state.klachten)[d];
      uit.push({
        dag: d,
        huidig: d === state.dag,
        doorgespoeld: doorgespoeld(d),
        banners: lijst(state.gebeurtenissen).filter(function (x) { return x.dag === d; })
          .map(function (x) { return { id: x.id, tekst: gebeurtenisTekst(ep, x.id) }; }),
        status: kl && kl.tekst ? kl.tekst : null,
        waarschuwing: aanhoudendTekst(ep, kl),
        kaarten: lijst(state.tijdlijn).filter(function (r) { return r.dag === d; }).map(function (r) {
          return { volg: r.volg, kaart: r.kaart, titel: regelTitel(casus, ep, r), na: naSpelenTekst(casus, ep, state, r.kaart, r.doel) };
        }),
        raadplegingen: lijst(state.raadplegingen).filter(function (r) { return r.dag === d; }).length
      });
    }
    return uit;
  }

  // Wat de patiëntkaart nu toont: alleen state.zichtbaar, in vaste volgorde; `nieuw` als het veld door een kaart is onthuld of aangepast.
  // Het kopje van een veld: vast (bediening) of, bij een veld dat een kaart onthult, het `kopje` uit de data bij die onthulling.
  function kopjeVan(ep, sleutel, vast) {
    if (vast) return vast;
    var l = lijst(ep && ep.patient && ep.patient.verborgen);
    for (var i = 0; i < l.length; i++) {
      var v = l[i], kp = v && v.kopje;
      if (!kp || (v.sleutel !== sleutel && !(isObj(v.zichtbaar) && Object.prototype.hasOwnProperty.call(v.zichtbaar, sleutel)))) continue;
      if (typeof kp === "string") return kp;
      if (isObj(kp) && typeof kp.tekst === "string") return kp.tekst;
    }
    return null;
  }
  function patientVelden(ep, state) {
    var z = state.zichtbaar || {}, start = (ep.patient && ep.patient.zichtbaar) || {}, uit = [];
    DOELVELDEN.forEach(function (v) {
      var tekst = z[v[0]];
      if (typeof tekst !== "string" || tekst === "") return;
      uit.push({ sleutel: v[0], kopje: kopjeVan(ep, v[0], v[1]), tekst: tekst, nieuw: start[v[0]] !== tekst });
    });
    return uit;
  }

  function actieDots(state, ep) {
    var totaal = (ep.knoppen && ep.knoppen.actiesPerBeurt) || 0, over = Math.max(0, state.actiesOver);
    var s = [];
    for (var i = 0; i < totaal; i++) s.push(i < over);
    return s;
  }

  // Waarschuwing zodra de browser niets kan bewaren (ook vóór de eerste poging), of een poging alleen in het geheugen staat.
  function opslagMelding(status) {
    if (status && (status.bewaard === false || status.opslagBeschikbaar === false)) return "Resultaten staan alleen in dit tabblad: exporteer nu.";
    return null;
  }

  function hoofdletter(t) { t = String(t); return t.charAt(0).toUpperCase() + t.slice(1); }

  // Een nadeeltekst "—" in de data betekent: geen nadeel. Zo'n kaart krijgt geen leeg nadeelveld.
  function nadeelTekst(t) { return typeof t === "string" && t.trim() !== "" && t.trim() !== "—" ? t : null; }

  // "Nog [n] andere veiligheidsregel(s) niet gehaald." zonder te zeggen welke; null als er maar één (of geen) is geschonden.
  function anderenZin(uitkomst) {
    var n = lijst(uitkomst && uitkomst.geschonden).length - 1;
    if (n < 1) return null;
    return "Nog " + n + " andere veiligheidsregel" + (n === 1 ? "" : "s") + " niet gehaald.";
  }

  // Alle gespeelde kaarten in speelvolgorde (elke kaart één keer), ook die zonder nadeel; het nadeel komt uit de uitkomst van de evaluatie.
  function gespeeldeKaarten(casus, uitkomst, tijdlijn) {
    var gezien = {}, uit = [], nadelen = {};
    lijst(uitkomst && uitkomst.downsides).forEach(function (d) { if (d.soort !== "weggelaten") nadelen[d.kaart] = d.tekst; });
    lijst(tijdlijn).slice().sort(function (a, b) { return a.volg - b.volg; }).forEach(function (r) {
      if (gezien[r.kaart]) return;
      gezien[r.kaart] = true;
      var k = kaartVan(casus, r.kaart);
      uit.push({ kaart: r.kaart, label: k ? k.label : r.kaart, nadeel: nadeelTekst(nadelen[r.kaart]) });
    });
    return uit;
  }

  // Kop boven de gevolgen bij de patiënt. De naam komt uit de data (de naam van de patiëntkaart); midden in de zin begint de
  // aanspreekvorm met een kleine letter (een hoofdletter aan het begin wordt een kleine letter).
  function gevolgenKop(ep) {
    var z = (ep && ep.patient && ep.patient.zichtbaar) || {}, naam = typeof z.naam === "string" && z.naam !== "" ? z.naam : null;
    return "Wat er met " + (naam ? naam.charAt(0).toLowerCase() + naam.slice(1) : "de patiënt") + " gebeurde";
  }

  // Weergavemodel van het evaluatiescherm (besluit Bart, 14 november 2026: de gevolgen bij de patiënt zijn leidend, daarna één hint).
  // Bij een schending: eerst `gevolgen` (de gevolgzinnen van ALLE geschonden regels die er een hebben), dan `hint` (ÉÉN tekst: de vraag van
  // de ernstigste geschonden regel, ongewijzigd), geen score, geen profiel, geen extra vragen. `vraag` en `gevolg` blijven bestaan
  // (vraag = hint; gevolg = de eerste gevolgzin). Is de episode verloren (afloop "verloren"), dan staat de tekst daarvan in `eindTekst`.
  function evaluatieModel(uitkomst) {
    var u = uitkomst || {};
    var downsides = lijst(u.downsides).map(function (d) { return { label: d.label, tekst: d.tekst, soort: d.soort }; });
    var verloren = u.afloop === "verloren";
    // De episode eindigde door een kaart (bv. Verwijzen): de zin of dat terecht was, bij een gehaalde én een niet-gehaalde poort.
    var naKaart = isObj(u.eindeNaKaart) && typeof u.eindeNaKaart.tekst === "string" ? u.eindeNaKaart.tekst : null;
    if (!u.poortGehaald) {
      var gevolgen = Array.isArray(u.gevolgen)
        ? u.gevolgen.map(function (x) { return typeof x === "string" ? x : x && x.tekst; }).filter(function (t) { return typeof t === "string" && t !== ""; })
        : (u.gevolg ? [u.gevolg] : []);
      return {
        gehaald: false, verloren: verloren, eindTekst: verloren && isObj(u.einde) ? (u.einde.tekst || null) : null,
        eindGebeurtenis: verloren && isObj(u.einde) ? (u.einde.gebeurtenis || null) : null,
        downsides: downsides, vraag: u.vraag || null, hint: u.vraag || null, gevolg: gevolgen.length ? gevolgen[0] : null, gevolgen: gevolgen,
        anderen: anderenZin(u), scores: [], zonderScore: [], profiel: null, extraVragen: [], zichtbaar: [], eindeNaKaart: naKaart
      };
    }
    var scores = [], zonderScore = [];
    if (isObj(u.score)) Object.keys(u.score).forEach(function (as) {
      if (typeof u.score[as] === "number") scores.push({ as: as, naam: hoofdletter(as), waarde: u.score[as] });
      else zonderScore.push({ as: as, naam: hoofdletter(as) });   // de regels geven voor deze route geen waarde op deze as
    });
    return {
      gehaald: true, verloren: false, eindTekst: null, eindGebeurtenis: null, downsides: downsides, vraag: null, hint: null, gevolg: null, gevolgen: [], anderen: null, scores: scores,
      zonderScore: zonderScore,
      profiel: isObj(u.profiel) ? { naam: u.profiel.naam, reflectievraag: u.profiel.reflectievraag || null } : null,
      extraVragen: lijst(u.extraVragen).map(function (x) { return typeof x === "string" ? x : x.vraag; }),
      zichtbaar: lijst(u.zichtbaar).map(function (x) { return typeof x === "string" ? x : x.tekst; }),
      eindeNaKaart: naKaart
    };
  }

  // Leesbaar overzicht van de pogingen van één pseudoniem (nieuwste eerst): per poging een tabel per dag in woorden, de vraag en de uitkomst.
  function scoreTekst(w) { return typeof w === "number" ? w + " van " + SCHAAL : "geen score"; }
  // Uitleg bij de knop 'Episode afronden' en de melding als het doorspoelen stopt (bedieningstekst, geen klinische inhoud).
  function afrondUitleg(state) {
    return "De dagen lopen door tot dag " + state.aantalDagen + " of tot er iets gebeurt.";
  }
  function doorspoelStopTekst(stop) {
    return "Het doorspoelen stopte op dag " + stop.dag + ", omdat er iets gebeurde. Reageer als je wilt en kies daarna opnieuw ‘Episode afronden’.";
  }
  function overzichtModel(casus, records, pseudoniem) {
    return recordsVan(records, pseudoniem).slice().reverse().map(function (r) {
      var eps = lijst(casus && casus.episodes), ep = eps.filter(function (e) { return e.id === r.episodeId; })[0] || {};
      var tl = lijst(r.tijdlijn), maxDag = typeof r.dagen === "number" ? r.dagen : 0;
      tl.forEach(function (x) { if (x && x.dag > maxDag) maxDag = x.dag; });
      lijst(r.gebeurtenissen).forEach(function (x) { if (x && x.dag > maxDag) maxDag = x.dag; });
      var rijen = [];
      for (var d = 1; d <= maxDag; d++) {
        rijen.push({
          dag: d,
          kaarten: tl.filter(function (x) { return x && x.dag === d; }).sort(function (a, b) { return (a.volg || 0) - (b.volg || 0); }).map(function (x) { return regelTitel(casus, ep, x); }),
          gebeurtenissen: lijst(r.gebeurtenissen).filter(function (x) { return x && x.dag === d; }).map(function (x) { return x.titel || x.id; })
        });
      }
      var gehaald = typeof r.poortGehaald === "boolean" ? r.poortGehaald : lijst(r.geschonden).length === 0;
      var uitkomst = r.afloop === "verloren" ? "Episode verloren." : gehaald
        ? "Veiligheid gehaald" + (r.profiel && r.profiel.naam ? ". Profiel: " + r.profiel.naam : "") +
          (r.score ? ". Duurzaamheid " + scoreTekst(r.score.duurzaamheid) + ", doelmatigheid " + scoreTekst(r.score.doelmatigheid) : "") + "."
        : "Nog niet veilig genoeg.";
      return {
        titel: "Episode " + (episodeNummer(casus, { id: r.episodeId }) || r.episodeId) + ", poging " + (r.pogingnummer || "?") + (r.testmodus ? " (testmodus)" : ""),
        tijdstempel: r.tijdstempel || null, gehaald: gehaald, rijen: rijen, vraag: r.vraag || null, uitkomst: uitkomst
      };
    });
  }

  function raadpleegModel(casus, antwoord) {
    var bronnen = lijst(antwoord && antwoord.bronnen).map(function (sleutel) {
      var vol = isObj(casus.bronnen) && casus.bronnen[sleutel] ? casus.bronnen[sleutel] : "";
      return { sleutel: sleutel, tekst: vol };
    });
    return { titel: (antwoord && antwoord.titel) || (casus.raadplegen && casus.raadplegen.titel) || "", bronnen: bronnen };
  }

  /* ====================================================================== */
  /* DOM                                                                    */
  /* ====================================================================== */

  var doc = null, root = null, app = null;

  function voeg(el, kind) {
    if (kind === null || kind === undefined || kind === false) return;
    if (Array.isArray(kind)) { kind.forEach(function (k) { voeg(el, k); }); return; }
    if (typeof kind === "object") { el.appendChild(kind); return; }
    // Alle getoonde tekst zonder bronmarkeringen en zonder episodecode vooraan (de data blijft letterlijk).
    el.appendChild(doc.createTextNode(schoneTekst(app && app.casus, String(kind))));
  }
  function h(tag, attrs) {
    var el = doc.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "klik") el.addEventListener("click", v);
      else if (k === "invoer") el.addEventListener("input", v);
      else if (k === "verstuur") el.addEventListener("submit", v);
      else if (k === "toets") el.addEventListener("keydown", v);
      else if (k === "klasse") el.className = v;
      else if (k === "waarde") { el.value = v; el.setAttribute("value", v); }
      else el.setAttribute(k, v === true ? "" : String(v));
    });
    for (var i = 2; i < arguments.length; i++) voeg(el, arguments[i]);
    return el;
  }
  function knop(tekst, attrs, klik) {
    attrs = attrs || {};
    attrs.type = "button";
    attrs.klik = klik;
    return h("button", attrs, tekst);
  }

  function opslagBeschikbaarSessie(actie, sleutel, waarde) {
    try {
      var s = g.sessionStorage;
      if (!s) return null;
      if (actie === "lees") return s.getItem(sleutel);
      s.setItem(sleutel, waarde);
    } catch (e) { /* geen opslag: geen probleem */ }
    return null;
  }

  /* ---------- pauzeren en hervatten (localStorage in de browser, altijd met try/catch) ---------- */
  var SPEL_SLEUTEL = "egc.spel.v1";
  function lokaleOpslag() {
    if (UI._opslag !== undefined) return UI._opslag;   // alleen voor tests: null = geen opslag, object = nepopslag
    try { var o = g.localStorage; return o && typeof o.getItem === "function" ? o : null; } catch (e) { return null; }
  }
  function bewaarSpel() {
    try {
      var o = lokaleOpslag();
      if (!o) return false;
      o.setItem(SPEL_SLEUTEL, JSON.stringify({ pseudoniem: app.pseudoniem, episodeId: app.ep.id, testmodus: !!app.testmodus, tijd: new Date().toISOString(), state: app.spel }));
      return true;
    } catch (e) { return false; }
  }
  // Geeft het opgeslagen spel van deze pseudoniem, of null (niets bewaard, ander pseudoniem, kapotte of verouderde inhoud).
  function leesSpel(pseudoniem) {
    try {
      var o = lokaleOpslag();
      if (!o) return null;
      var ruw = o.getItem(SPEL_SLEUTEL);
      if (!ruw) return null;
      var r = JSON.parse(ruw), st = r && r.state;
      if (!r || !st || !zelfdePseudoniem(r.pseudoniem, pseudoniem) || !Array.isArray(st.tijdlijn) || !Array.isArray(st.gebeurtenissen) || typeof st.dag !== "number") return null;
      var casus = g.CASUSSEN && g.CASUSSEN[0];
      if (!casus || st.casusId !== casus.id || lijst(casus.episodes).filter(function (e) { return e.id === r.episodeId && e.id === st.episodeId; }).length !== 1) return null;
      return r;
    } catch (e) { return null; }
  }
  function wisSpel() {
    try { var o = lokaleOpslag(); if (o && typeof o.removeItem === "function") o.removeItem(SPEL_SLEUTEL); } catch (e) { /* niets te wissen */ }
  }

  // De testmodus (voor de docent) is alleen te kiezen als de pagina met ?docent in de adresregel is geopend (werkt ook via file://).
  function docentModus() {
    try { var l = g.location; return !!l && /[?&]docent(?:[=&]|$)/.test(String(l.search || "")); } catch (e) { return false; }
  }

  function nieuweApp() {
    return {
      scherm: "start", pseudoniem: opslagBeschikbaarSessie("lees", PSEUDONIEM_SLEUTEL) || "", fout: null,
      casus: (g.CASUSSEN && g.CASUSSEN[0]) || null, ep: null, spel: null, uitkomst: null,
      melding: null, onthuld: null, dialoog: null, bevestigAfronden: false, fokus: null, downloadFout: false, geschiedenis: [],
      testmodus: false, rondleidingGezien: false,
      wijziging: null, eindAnimatie: false, vlucht: null   // alleen weergave: veranderde velden, omklappen, kaart naar de tijdlijn
    };
  }

  function actieveFokus() {
    try {
      var a = doc.activeElement;
      return a && a.getAttribute ? a.getAttribute("data-fokus") : null;
    } catch (e) { return null; }
  }

  var fokusKandidaten = {};
  function fokusMarkeer(el, sleutel) { fokusKandidaten[sleutel] = el; el.setAttribute("data-fokus", sleutel); return el; }

  function render() {
    var vorig = app.fokus || actieveFokus();
    app.fokus = null;
    fokusKandidaten = {};
    var inhoud;
    try {
      if (!app.casus || !lijst(app.casus.episodes).length) inhoud = foutScherm("De casus kon niet worden geladen. Laad de pagina opnieuw.");
      else if (app.scherm === "start") inhoud = startScherm();
      else if (app.scherm === "kies") inhoud = kiesScherm();
      else if (app.scherm === "spel") inhoud = spelScherm();
      else if (app.scherm === "eind") inhoud = eindScherm();
      else if (app.scherm === "overzicht") inhoud = overzichtScherm();
      else inhoud = foutScherm("Onbekend scherm.");
    } catch (e) {
      inhoud = foutScherm("Er ging iets mis: " + ((e && e.message) || e));
    }
    var wrap = h("div", { klasse: "pagina" }, inhoud, app.dialoog ? dialoogView() : null);
    if (typeof root.replaceChildren === "function") root.replaceChildren(wrap);
    else { while (root.firstChild) root.removeChild(root.firstChild); root.appendChild(wrap); }
    var doel = (vorig && fokusKandidaten[vorig]) || fokusKandidaten.kop;
    if (doel && typeof doel.focus === "function") { try { doel.focus(); } catch (e) { /* geen focus mogelijk */ } }
    var vlucht = app.vlucht;
    app.vlucht = null;
    if (vlucht) vliegNaarTijdlijn(vlucht);
  }

  /* ---------- beweging (alleen weergave; zonder beweging is alles direct in de eindstand) ---------- */

  function geenBeweging() {
    try { return !!(g.matchMedia && g.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; }
  }
  function zoekIn(sel) {
    try { return root && typeof root.querySelector === "function" ? root.querySelector(sel) : null; } catch (e) { return null; }
  }
  function zoekAlleIn(sel) {
    try { return root && typeof root.querySelectorAll === "function" ? Array.prototype.slice.call(root.querySelectorAll(sel)) : []; } catch (e) { return []; }
  }
  function attrSel(naam, waarde) { return "[" + naam + "=\"" + String(waarde).replace(/["\\]/g, "\\$&") + "\"]"; }
  // Plek van een kaart in de hand vlak voor het spelen (of null zonder echte DOM).
  function plekVanKaart(kaartId) {
    var el = zoekIn(".hand " + attrSel("data-kaart", kaartId));
    try { return el && el.getBoundingClientRect ? el.getBoundingClientRect() : null; } catch (e) { return null; }
  }
  // Een kopie van de gespeelde kaart beweegt van de hand naar de dag op de tijdlijn; daar licht de kaart kort op.
  function vliegNaarTijdlijn(v) {
    try {
      var doelen = zoekAlleIn(".tijdlijn .dag.huidig " + attrSel("data-gespeeld", v.kaart));
      var doel = doelen[doelen.length - 1];
      if (!doel || !v.van || !doc.body || geenBeweging()) return;
      if (typeof doel.scrollIntoView === "function") doel.scrollIntoView({ block: "nearest" });
      var naar = doel.getBoundingClientRect(), van = v.van;
      if (!naar.width || !van.width) return;
      doel.classList.add("aankomst");
      var spook = doc.createElement("div");
      spook.className = "spookkaart " + v.klasse;
      spook.setAttribute("aria-hidden", "true");
      spook.textContent = v.label;
      var st = spook.style;
      st.left = van.left + "px"; st.top = van.top + "px"; st.width = van.width + "px"; st.height = van.height + "px";
      doc.body.appendChild(spook);
      var weg = function () { if (spook.parentNode) spook.parentNode.removeChild(spook); };
      if (typeof spook.animate !== "function") { weg(); return; }
      var dx = naar.left - van.left, dy = naar.top - van.top, sx = naar.width / van.width, sy = naar.height / van.height;
      var a = spook.animate([
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: "translate(" + dx + "px, " + (dy - 24) + "px) scale(" + sx + ", " + sy + ")", opacity: 0.9, offset: 0.7 },
        { transform: "translate(" + dx + "px, " + dy + "px) scale(" + sx + ", " + sy + ")", opacity: 0 }
      ], { duration: 480, easing: "cubic-bezier(.25,.7,.3,1)" });
      a.onfinish = weg; a.oncancel = weg;
      g.setTimeout(weg, 900);
    } catch (e) { /* alleen versiering */ }
  }

  function foutScherm(tekst) {
    return h("main", { klasse: "smal" }, h("h1", null, "Epic green cards"), h("p", { klasse: "fout", role: "alert" }, tekst));
  }

  function naarScherm(naam) {
    app.scherm = naam; app.melding = null; app.onthuld = null; app.dialoog = null; app.bevestigAfronden = false; app.fout = null;
    app.fokus = "kop";
    render();
    try { if (g.scrollTo) g.scrollTo(0, 0); } catch (e) { /* geen scrollen */ }
  }

  function opslagBalk() {
    var m = null;
    try { m = opslagMelding(g.Logging.opslagStatus()); } catch (e) { m = null; }
    return m ? h("p", { klasse: "waarschuwing", role: "alert" }, m) : null;
  }

  function exportKnop() {
    return knop("Exporteer resultaten", { id: "btn-export", klasse: "knop rand" }, function () {
      var r = null;
      try { r = g.Logging.downloadAlles(); } catch (e) { r = null; }
      app.downloadFout = !r || (!r.csv && !r.json);
      app.melding = app.downloadFout ? "Het downloaden is niet gelukt. Probeer het in een andere browser." : "De bestanden staan in je downloadmap.";
      app.fokus = "btn-export";
      render();
    });
  }

  function overzichtKnop(terugNaar) {
    return knop("Leesbaar overzicht", { id: "btn-overzicht", klasse: "knop rand" }, function () { app.overzichtTerug = terugNaar; naarScherm("overzicht"); });
  }

  function overzichtScherm() {
    var records = [];
    try { records = g.Logging.alle(); } catch (e) { records = []; }
    var m = overzichtModel(app.casus, records, app.pseudoniem);
    return h("main", { klasse: "smal overzicht" },
      fokusMarkeer(h("h1", { tabindex: "-1" }, "Leesbaar overzicht"), "kop"),
      h("p", { klasse: "uitleg" }, "Je pogingen, per dag, in gewone woorden (nieuwste bovenaan)."),
      m.length ? m.map(function (p) {
        return h("section", { klasse: "kaartvlak poging", "data-poging": p.titel },
          h("h2", null, p.titel), h("p", { klasse: "uitleg" }, (p.tijdstempel || "") + (p.tijdstempel ? " · " : "") + (p.gehaald ? "gehaald" : "niet gehaald")),
          h("div", { klasse: "tabelwrap" }, h("table", null,
            h("thead", null, h("tr", null, h("th", null, "Dag"), h("th", null, "Wat je deed"), h("th", null, "Wat er gebeurde"))),
            h("tbody", null, p.rijen.map(function (r) {
              return h("tr", { "data-dag": r.dag }, h("td", null, String(r.dag)), h("td", null, r.kaarten.length ? r.kaarten.join("; ") : "—"), h("td", null, r.gebeurtenissen.length ? r.gebeurtenissen.join("; ") : "—"));
            })))),
          p.vraag ? h("p", { klasse: "vraag" }, "Vraag: " + p.vraag) : null,
          h("p", null, "Uitkomst: " + p.uitkomst));
      }) : h("p", { klasse: "uitleg" }, "Er zijn nog geen pogingen om te laten zien."),
      h("p", null, fokusMarkeer(knop("Terug", { id: "btn-overzicht-terug", klasse: "knop hoofd" }, function () { naarScherm(app.overzichtTerug === "eind" && app.uitkomst ? "eind" : "kies"); }), "btn-overzicht-terug"))
    );
  }

  function meldingView() {
    return app.melding ? h("p", { klasse: app.downloadFout ? "fout" : "info", role: "status", id: "melding" }, app.melding) : null;
  }

  /* ---------- start ---------- */

  function startScherm() {
    var invoer = h("input", {
      id: "pseudoniem", name: "pseudoniem", type: "text", autocomplete: "off", maxlength: "40", waarde: app.pseudoniem,
      "aria-describedby": "pseudoniem-uitleg pseudoniem-fout", "aria-required": "true"
    });
    function start() {
      var c = pseudoniemControle(invoer.value);
      if (!c.ok) { app.fout = c.fout; app.pseudoniem = invoer.value; app.fokus = "pseudoniem"; render(); return; }
      app.pseudoniem = c.waarde;
      opslagBeschikbaarSessie("schrijf", PSEUDONIEM_SLEUTEL, c.waarde);
      naarScherm("kies");
    }
    return h("main", { klasse: "smal start" },
      fokusMarkeer(h("h1", { tabindex: "-1" }, app.casus.titel || "Epic green cards"), "kop"),
      h("form", { klasse: "kaartvlak", verstuur: function (e) { if (e && e.preventDefault) e.preventDefault(); start(); } },
        h("label", { for: "pseudoniem" }, "Pseudoniem"),
        h("p", { id: "pseudoniem-uitleg", klasse: "uitleg" }, "Verzin een code om je resultaten te bewaren en gebruik daarvoor geen naam."),
        fokusMarkeer(invoer, "pseudoniem"),
        h("p", { id: "pseudoniem-fout", klasse: "fout", role: "alert" }, app.fout),
        knop("Start", { id: "btn-start", klasse: "knop hoofd" }, start)
      ),
      h("section", { klasse: "kaartvlak", "aria-labelledby": "zo-werkt" },
        h("h2", { id: "zo-werkt" }, "Zo werkt het"),
        h("ul", null,
          h("li", null, "Je behandelt een patiënt door kaarten te spelen."),
          h("li", null, "Elke dag heb je een aantal acties. Een kaart spelen kost één actie."),
          h("li", null, "Met ‘Volgende dag’ ga je een dag verder. Dan kan er iets veranderen."),
          h("li", null, "Met ‘Episode afronden’ lopen de dagen door tot de laatste dag of tot er iets gebeurt. Daarna krijg je de beoordeling. Lukt het niet, dan kun je het opnieuw proberen.")
        )
      )
    );
  }

  /* ---------- episodekeuze ---------- */

  function kiesScherm() {
    var records = [];
    try { records = g.Logging.alle(); } catch (e) { records = []; }
    if (!docentModus()) app.testmodus = false;   // zonder ?docent geen testmodus (een hervat testspel houdt zijn eigen markering)
    var overzicht = episodeOverzicht(app.casus, app.pseudoniem, records, app.testmodus);
    var bewaard = leesSpel(app.pseudoniem);
    return h("main", { klasse: "smal" },
      h("header", { klasse: "kop" },
        fokusMarkeer(h("h1", { tabindex: "-1" }, "Kies een episode"), "kop"),
        h("p", { klasse: "wie" }, "Pseudoniem: ", h("strong", null, app.pseudoniem), " ",
          knop("Ander pseudoniem", { id: "btn-ander", klasse: "link" }, function () { naarScherm("start"); }))
      ),
      opslagBalk(), meldingView(),
      bewaard ? h("section", { klasse: "kaartvlak opgeslagen", id: "opgeslagen", "aria-labelledby": "opgeslagen-kop" },
        h("h2", { id: "opgeslagen-kop", klasse: "klein" }, "Opgeslagen casus"),
        h("p", null, "Episode " + episodeNummer(app.casus, { id: bewaard.episodeId }) + ", dag " + bewaard.state.dag + " van " + bewaard.state.aantalDagen + (bewaard.testmodus ? " (testmodus)" : "") + "."),
        h("p", { klasse: "dlgknoppen" },
          knop("Hervat", { id: "btn-hervat", klasse: "knop hoofd" }, function () { hervatSpel(bewaard); }),
          knop("Verwijder opgeslagen casus", { id: "btn-wis-opgeslagen", klasse: "knop rand" }, function () { wisSpel(); app.melding = "De opgeslagen casus is verwijderd."; app.downloadFout = false; render(); }))) : null,
      docentModus() ? h("p", { klasse: "testmodus-kies" },
        h("label", null, h("input", { type: "checkbox", id: "testmodus", checked: app.testmodus ? true : null, klik: function () { app.testmodus = !app.testmodus; app.fokus = "testmodus"; render(); } }),
          " Testmodus (voor Bart): alle episodes staan open; pogingen tellen niet mee als meting.")) : null,
      app.testmodus ? h("p", { klasse: "waarschuwing", id: "testmodus-melding", role: "status" }, "TESTMODUS: deze pogingen worden in de export gemarkeerd en tellen niet mee als meting.") : null,
      h("ul", { klasse: "episodes" }, overzicht.map(function (o) {
        var status = !o.open ? "Vergrendeld: haal eerst " + o.vorige.toLowerCase() + "." : (o.gehaald ? "Gehaald." : "Nog niet gehaald.");
        if (o.open && o.testmodus && !o.gehaald) status = "Open in testmodus.";
        return h("li", { klasse: "kaartvlak episode" + (o.open ? "" : " dicht"), "data-episode": o.id },
          h("div", null, h("h2", null, o.titel), h("p", { klasse: "uitleg" }, status)),
          knop(o.gehaald ? "Opnieuw spelen" : "Start", { klasse: "knop hoofd", "data-start": o.id, disabled: !o.open ? true : null, "aria-label": o.titel + (o.gehaald ? " opnieuw spelen" : " starten") },
            function () { startEpisode(o.id, true); }));
      })),
      h("p", null, exportKnop(), " ", overzichtKnop("kies"))
    );
  }

  function hervatSpel(r) {
    var ep = lijst(app.casus.episodes).filter(function (e) { return e.id === r.episodeId; })[0];
    if (!ep) { app.melding = "Deze opgeslagen casus past niet meer bij het spel."; app.downloadFout = true; render(); return; }
    app.spel = r.state; app.spel.rng = Math.random;
    app.ep = ep; app.uitkomst = null; app.testmodus = !!r.testmodus;
    naarScherm("spel");
    app.melding = "Je bent terug op dag " + app.spel.dag + ", met dezelfde kaarten.";
    app.downloadFout = false;
    render();
  }

  // Pauzeer: bewaar het spel in de browser en ga terug naar de episodes.
  function pauzeer() {
    if (!bewaarSpel()) {
      app.melding = "Opslaan lukt niet in deze browser. Speel verder in dit tabblad of rond de episode af.";
      app.downloadFout = true; app.fokus = "btn-pauzeer"; render(); return;
    }
    naarScherm("kies");
    app.melding = "Opgeslagen op deze computer, in deze browser.";
    app.downloadFout = false;
    render();
  }

  // Stop: deze poging verdwijnt (er is niets beoordeeld of bewaard) en ook een eerder opgeslagen versie van dit spel.
  function stopCasus() {
    wisSpel();
    app.spel = null; app.uitkomst = null;
    naarScherm("kies");
    app.melding = "De casus is gestopt. Er is niets bewaard.";
    app.downloadFout = false;
    render();
  }

  // metSprong: de overgang naar een latere episode krijgt eerst een tussenscherm (dezelfde patiënt, later); niet bij Opnieuw.
  function startEpisode(epId, metSprong) {
    if (!pseudoniemControle(app.pseudoniem).ok) { naarScherm("start"); app.fout = pseudoniemControle(app.pseudoniem).fout; render(); return; }
    var ep = lijst(app.casus.episodes).filter(function (e) { return e.id === epId; })[0];
    try {
      app.spel = g.Engine.nieuwSpel(app.casus, epId);
      app.ep = ep;
      app.uitkomst = null;
      app.wijziging = null;
      naarScherm("spel");
      var nr = episodeNummer(app.casus, ep), vorige = nr > 1 ? lijst(app.casus.episodes)[nr - 2] : null;
      if (metSprong && vorige) { app.dialoog = { type: "tijdsprong", vorige: vorige }; app.fokus = "dlg-eerste"; render(); }
      else if (ep.startUitleg) { app.dialoog = { type: "start", tekst: ep.startUitleg }; app.fokus = "dlg-eerste"; render(); }
    } catch (e) {
      app.melding = (e && e.message) || "De episode kon niet starten.";
      app.downloadFout = true;
      render();
    }
  }

  /* ---------- spel ---------- */

  function speelDirect(kaartId, opts) {
    var r, voor = patientVelden(app.ep, app.spel), van = plekVanKaart(kaartId);
    try { r = g.Engine.speelKaart(app.spel, kaartId, opts || {}); }
    catch (e) { r = { ok: false, fout: (e && e.message) || "Dat lukte niet." }; }
    app.dialoog = null;
    app.wijziging = null;
    if (!r.ok) { app.melding = r.fout; app.onthuld = null; app.downloadFout = true; }
    else {
      app.melding = null; app.downloadFout = false;
      app.onthuld = lijst(r.onthuld).map(function (o) { return o.tekst; });
      var k = kaartVan(app.casus, kaartId);
      if (k && k.toontMedicatie) { var ml = medicatieLijstTekst(app.casus, app.ep, app.spel, kaartId); if (ml) app.onthuld.push(ml); }
      app.wijziging = veldWijzigingen(voor, patientVelden(app.ep, app.spel));
      app.vlucht = { kaart: kaartId, van: van, label: k ? k.label : "", klasse: k ? "cat-" + slug(k.categorie) : "" };
      // Een kaart kan de episode beëindigen (staat in de data, bv. Verwijzen): dan volgt meteen de beoordeling.
      if (app.spel && app.spel.afgerond) { app.dialoog = null; rondAf(); return; }
    }
    app.fokus = "kaart-" + kaartId;
    render();
  }

  // Welke velden van de patiëntkaart door een kaart veranderden: { sleutel: oude tekst (of null als het veld nieuw is) }, of null.
  function veldWijzigingen(voor, na) {
    var oud = {}, uit = {}, n = 0;
    lijst(voor).forEach(function (v) { oud[v.sleutel] = v.tekst; });
    lijst(na).forEach(function (v) {
      if (oud[v.sleutel] === v.tekst) return;
      uit[v.sleutel] = Object.prototype.hasOwnProperty.call(oud, v.sleutel) ? oud[v.sleutel] : null;
      n++;
    });
    return n ? uit : null;
  }

  // Klik op een kaart: eerst lezen (kaartvenster). Pas de knop Speel speelt de kaart.
  // Een gebeurtenis of het tussenscherm onderbreekt het spel: tot de speler Verder kiest, doen kaarten en knoppen niets.
  function onderbroken() { return !!(app.dialoog && (app.dialoog.type === "gebeurtenis" || app.dialoog.type === "tijdsprong")); }

  function openKaart(kaartId) {
    if (onderbroken()) return;
    app.wijziging = null;
    app.bevestigAfronden = false;
    app.dialoog = { type: "kaart", kaartId: kaartId };
    app.fokus = "dlg-eerste";
    render();
  }

  function klikKaart(kaartId) {
    app.bevestigAfronden = false;
    if (!isDoelkaart(app.casus, app.ep, kaartId)) { speelDirect(kaartId); return; }
    var doelen;
    try { doelen = toegestaneDoelen(app.casus, app.ep, app.spel, kaartId); }
    catch (e) { app.melding = (e && e.message) || "Dat lukte niet."; app.downloadFout = true; render(); return; }
    if (!doelen.length) {
      app.melding = alleDoelenGebruikt(app.casus, app.ep, app.spel, kaartId)
        ? "Deze kaart heb je al gespeeld bij elk middel waar hij nu bij past. Een keuze blijft staan."
        : "Deze kaart kun je nu niet spelen: er is geen middel waar hij bij past.";
      app.downloadFout = true; app.onthuld = null; app.fokus = "kaart-" + kaartId; render(); return;
    }
    app.dialoog = { type: "doel", kaartId: kaartId, doelen: doelen, stap: 1, doel: null, opties: [] };
    if (doelen.length === 1) { kiesDoel(doelen[0]); return; }   // één mogelijk doel: geen keuzelijst, de kaart koppelt er vanzelf aan
    app.fokus = "dlg-eerste";
    render();
  }

  function kiesDoel(doel) {
    var d = app.dialoog, kaart = kaartVan(app.casus, d.kaartId);
    if (kaart && kaart.opties) {
      d.stap = 2; d.doel = doel.id; d.opties = optiesVoor(kaart, doel.id, UI._rng);
      app.fokus = "dlg-eerste"; render();
    } else speelDirect(d.kaartId, { doel: doel.id });
  }

  function raadpleeg() {
    var r;
    if (onderbroken()) return;
    app.wijziging = null;
    try { r = g.Engine.raadpleeg(app.spel); } catch (e) { r = { ok: false, fout: (e && e.message) || "Dat lukte niet." }; }
    if (!r.ok) { app.melding = r.fout; app.downloadFout = true; app.fokus = "btn-raadplegen"; render(); return; }
    app.melding = null; app.onthuld = null; app.downloadFout = false;
    app.dialoog = { type: "raadplegen", model: raadpleegModel(app.casus, r) };
    app.fokus = "dlg-eerste";
    render();
  }

  function volgendeDag() {
    if (onderbroken()) return;
    var al = app.spel ? lijst(app.spel.gebeurtenissen).length : 0;
    app.wijziging = null;
    try { g.Engine.volgendeDag(app.spel); app.melding = null; app.downloadFout = false; }
    catch (e) { app.melding = (e && e.message) || "Dat lukte niet."; app.downloadFout = true; }
    // Een gebeurtenis kan de episode direct beëindigen (staat in de data, bv. sepsis): dan volgt meteen de beoordeling.
    if (app.spel && app.spel.afgerond) { rondAf(); return; }
    app.onthuld = null; app.bevestigAfronden = false;
    // Nieuwe gebeurtenissen onderbreken de beurt: ze komen als kaart op tafel en de speler erkent ze met Verder.
    var nieuw = lijst(app.spel && app.spel.gebeurtenissen).slice(al).filter(function (x) { return x.dag === app.spel.dag; });
    if (nieuw.length) {
      app.dialoog = { type: "gebeurtenis", dag: app.spel.dag, items: nieuw.map(function (x) { return gebeurtenisModel(app.ep, x.id); }) };
      app.fokus = "dlg-eerste";
    } else app.fokus = "dag-kop";
    render();
  }

  function erkenGebeurtenis() {
    app.dialoog = null;
    app.fokus = "dag-kop";
    render();
  }

  // Afronden spoelt door (besluit Bart, 15 november 2026): de dagen lopen door tot de laatste dag. Verschijnt er onderweg een
  // gebeurtenis, dan stopt het doorspoelen: de gebeurtenis komt op tafel, met de reden van de stop, en de speler rondt daarna opnieuw af.
  function rondAf() {
    var uitkomst;
    if (onderbroken()) return;
    try { uitkomst = g.Engine.rondAf(app.spel); }
    catch (e) { app.melding = (e && e.message) || "Afronden lukte niet."; app.downloadFout = true; app.bevestigAfronden = false; render(); return; }
    if (app.spel && !app.spel.afgerond) {
      var stop = uitkomst || {};
      app.bevestigAfronden = false; app.onthuld = null; app.wijziging = null;
      app.melding = doorspoelStopTekst({ dag: app.spel.dag }); app.downloadFout = false;
      app.dialoog = { type: "gebeurtenis", dag: app.spel.dag, stop: app.melding,
        items: lijst(stop.gebeurtenissen).map(function (id) { return gebeurtenisModel(app.ep, id); }) };
      app.fokus = "dlg-eerste";
      render(); return;
    }
    uitkomst = app.spel.uitkomst || uitkomst;
    app.uitkomst = uitkomst;
    app.eindAnimatie = true;   // het omklappen speelt één keer, bij het eerste beeld van de beoordeling
    wisSpel();   // een afgerond spel hoeft niet meer hervat te worden
    app.opslagFout = null;
    try { g.Logging.bewaarUitSpel(app.spel, uitkomst, app.pseudoniem, { testmodus: app.testmodus }); }
    catch (e) { app.opslagFout = (e && e.message) || "De poging kon niet worden bewaard."; }
    naarScherm("eind");
  }

  function actiebalk() {
    var st = app.spel, ep = app.ep, kn = ep.knoppen || {};
    var laatste = st.dag >= st.aantalDagen;
    var kost = kn.raadplegenKost || 0;
    var dots = actieDots(st, ep);
    var klaar = g.Engine.eindeBereikt(st);
    return h("div", { klasse: "balk" },
      h("div", { klasse: "balkinfo" },
        h("span", { klasse: "episodenaam" }, "Episode " + episodeNummer(app.casus, ep)),
        app.testmodus ? h("span", { klasse: "testmodus-label", id: "testmodus-label" }, "TESTMODUS") : null,
        h("span", { id: "dagtelling", "data-dag": st.dag }, "Dag " + st.dag + " van " + st.aantalDagen),
        h("span", { klasse: "acties", id: "acties", "data-over": Math.max(0, st.actiesOver), role: "status" },
          h("span", { klasse: "actielabel" }, "Acties vandaag: "),
          dots.map(function (aan) { return h("span", { klasse: "dot" + (aan ? " aan" : ""), "aria-hidden": "true" }, aan ? "●" : "○"); }),
          h("span", { klasse: "verborgen" }, Math.max(0, st.actiesOver) + " van " + dots.length + " over"),
          h("span", { klasse: "actieteks", "aria-hidden": "true" }, " " + Math.max(0, st.actiesOver) + " van " + dots.length)
        )
      ),
      h("div", { klasse: "balkknoppen" },
        h("span", { klasse: "balkgroep" },
          fokusMarkeer(knop("Richtlijn raadplegen" + (kost > 0 ? " (kost " + kost + (kost === 1 ? " actie" : " acties") + ")" : ""),
            { id: "btn-raadplegen", klasse: "knop rand", disabled: klaar ? true : null }, raadpleeg), "btn-raadplegen"),
          laatste ? h("span", { klasse: "uitleg laatstedag", id: "laatste-dag" }, "Dit is de laatste dag.")
            : fokusMarkeer(knop("Volgende dag", { id: "btn-volgende-dag", klasse: "knop rand" }, volgendeDag), "btn-volgende-dag"),
          app.bevestigAfronden && !laatste
            ? h("span", { klasse: "bevestig", role: "group", "aria-label": "Afronden bevestigen" },
                h("span", { id: "afronden-uitleg" }, afrondUitleg(st) + " Afronden?"),
                fokusMarkeer(knop("Ja, afronden", { id: "btn-afronden-ja", klasse: "knop hoofd" }, rondAf), "btn-afronden-ja"),
                knop("Nee, verder spelen", { id: "btn-afronden-nee", klasse: "knop rand" }, function () { app.bevestigAfronden = false; app.fokus = "btn-afronden"; render(); }))
            : fokusMarkeer(knop("Episode afronden", { id: "btn-afronden", klasse: "knop hoofd" }, function () {
                if (laatste) { rondAf(); return; }   // op de laatste dag kan er niets meer: meteen afronden, zonder "verder spelen"
                app.bevestigAfronden = true; app.fokus = "btn-afronden-ja"; render();
              }), "btn-afronden"))
      )
    );
  }

  // Bijzaken (export, pauzeren, stoppen): onder de patiëntkaart, buiten de hoofdbalk.
  function bijzaakView() {
    return h("div", { klasse: "bijzaak", role: "group", "aria-label": "Opslaan en stoppen" },
      exportKnop(),
      knop("Pauzeer en sla op", { id: "btn-pauzeer", klasse: "knop rand" }, pauzeer),
      knop("Stop deze casus", { id: "btn-stop", klasse: "knop rand" }, function () { app.dialoog = { type: "stop" }; app.fokus = "dlg-eerste"; render(); }));
  }

  // De patiëntkaart: alleen state.zichtbaar. Verandert een veld door een kaart, dan staat de oude waarde kort doorgestreept naast de nieuwe.
  function patientView() {
    var velden = patientVelden(app.ep, app.spel), w = app.wijziging || {};
    return h("section", { klasse: "kaartvlak patient", "aria-labelledby": "patient-kop" },
      h("h2", { id: "patient-kop", klasse: "klein kaartband" }, "Patiëntkaart"),
      h("div", { klasse: "patientinhoud" },
        velden.map(function (v) {
          var veranderd = Object.prototype.hasOwnProperty.call(w, v.sleutel), oud = veranderd ? w[v.sleutel] : null;
          return h("p", { klasse: "veld" + (v.sleutel === "kop" ? " patientkop" : "") + (v.nieuw ? " nieuw" : "") + (veranderd ? " veranderd" : ""), "data-veld": v.sleutel },
            v.kopje ? h("span", { klasse: "kopje" }, v.kopje + ": ") : null,
            oud ? h("del", { klasse: "oudewaarde" }, h("span", { klasse: "verborgen" }, "eerder: "), oud) : null,
            oud ? " " : null,
            h("span", { klasse: "waarde" }, v.tekst),
            v.nieuw ? h("span", { klasse: "nieuwlabel" }, " Nieuw") : null,
            v.sleutel === "medicatieTekst" ? medicatieStatusView() : null);
        }),
        nieuwSindsStartView(),
        klachtenView())
    );
  }

  // Onder de medicatieregel: per middel dat door een kaart is aangepast, gepauzeerd of hervat, de actuele status.
  function medicatieStatusView() {
    var st = [];
    try { st = medicatieStatus(app.casus, app.ep, app.spel).filter(function (m) { return m.status; }); } catch (e) { st = []; }
    if (!st.length) return null;
    return h("span", { klasse: "medstatus", id: "medstatus" }, st.map(function (m) {
      return h("span", { klasse: "medregel", "data-middel": m.id }, h("span", { klasse: "medlabel" }, m.label + ": "), m.status);
    }));
  }

  // Wat er sinds de start is gebeurd (gebeurtenissen, tekst uit de data). De oorspronkelijke klachtenregel blijft staan.
  function nieuwSindsStartView() {
    var l = gebeurtenissenSindsStart(app.ep, app.spel);
    if (!l.length) return null;
    return h("div", { klasse: "sindsstart", id: "sinds-start" },
      h("h3", { id: "sinds-start-kop" }, "Nieuw sinds de start"),
      h("ul", { "aria-labelledby": "sinds-start-kop" }, l.map(function (x) {
        return h("li", { "data-sinds": x.id }, h("span", { klasse: "dagnr" }, "Dag " + x.dag), h("span", { klasse: "klachttekst" }, x.tekst));
      })));
  }

  // Klachtenstatus per dag (tekst uit de data): één regel per verstreken dag, nieuwste dag bovenaan. Pas vanaf dag 2 (op dag 1 is er
  // alleen de klachtenregel van de patiëntkaart).
  function klachtenView() {
    var dagen = klachtenPerDag(app.ep, app.spel);
    if (dagen.length < 2) return null;
    return h("div", { klasse: "klachtendagen", id: "klachtendagen" },
      h("h3", { id: "klachten-kop" }, "Klachten per dag"),
      h("ol", { klasse: "klachtlijst", "aria-labelledby": "klachten-kop" }, dagen.map(function (d) {
        return h("li", { klasse: d.huidig ? "huidig" : null, "data-klachtdag": d.dag },
          h("span", { klasse: "dagnr" }, "Dag " + d.dag),
          d.tekst ? h("span", { klasse: "klachttekst" }, d.tekst)
            : h("span", { klasse: "klachttekst leeg" }, h("span", { "aria-hidden": "true" }, "—"), h("span", { klasse: "verborgen" }, "geen melding")));
      })));
  }

  // De hand: per categorie (volgorde van de bibliotheek = de voorschrijfcyclus) een rij speelkaarten. Op de kaart alleen het label.
  function kaartenView() {
    return h("section", { klasse: "kaarten hand", "aria-label": "Kaarten" },
      kaartenPerCategorie(app.casus, app.ep).map(function (grp) {
        var kid = "cat-" + slug(grp.categorie);
        return h("div", { klasse: "categorie " + grp.klasse, role: "group", "aria-labelledby": kid },
          h("h3", { id: kid, klasse: "handkop" }, grp.categorie),
          h("div", { klasse: "kaartrij" }, grp.kaarten.map(function (k) {
            return fokusMarkeer(knop([h("span", { klasse: "kaartnaam" }, k.label)],
              { klasse: "kaart", "data-kaart": k.id, "aria-label": k.label + " lezen" },
              function () { openKaart(k.id); }), "kaart-" + k.id);
          }))
        );
      })
    );
  }

  // "Uitslag verwacht op dag X." zodra een gebeurtenis op tijd is aangekondigd (tekst uit de data).
  function verwachtView() {
    var lijstV = [];
    try { lijstV = g.Engine.komend(app.spel); } catch (e) { lijstV = []; }
    var regels = lijstV.filter(function (v) { return v.tekst; });
    if (!regels.length) return null;
    return h("p", { klasse: "info", id: "verwacht", role: "status" }, regels.map(function (v) { return v.tekst + " op dag " + v.dag + "."; }).join(" "));
  }

  // Een gebeurtenis als kaart op tafel. Het element met data-gebeurtenis bevat alleen de tekst uit de data.
  function gebeurtenisKaart(ep, id, extraKlasse, dag) {
    var gm = gebeurtenisModel(ep, id);
    return h("div", { klasse: "gebeurteniskaart" + (extraKlasse ? " " + extraKlasse : "") },
      h("p", { klasse: "gb-band" }, "Gebeurtenis" + (dag ? " · dag " + dag : "")),
      gm.titel ? h("p", { klasse: "gb-titel" }, gm.titel) : null,
      h("p", { klasse: "banner" + (extraKlasse === "klein" ? " klein" : ""), role: extraKlasse === "nu" ? "status" : null, "data-gebeurtenis": id }, gm.tekst));
  }

  function nieuwVandaagView() {
    var st = app.spel, dagen = dagenModel(app.casus, app.ep, st), nu = dagen[dagen.length - 1];
    var heeft = nu.banners.length || nu.status;
    return h("div", { klasse: "vandaag", "aria-live": "polite" },
      h("div", { klasse: "dagmerk" }, fokusMarkeer(h("h2", { id: "dag-kop", tabindex: "-1" }, "Dag " + st.dag), "dag-kop")),
      h("div", { klasse: "vandaaginhoud" },
        nu.banners.map(function (b) { return gebeurtenisKaart(app.ep, b.id, "nu"); }),
        nu.status ? h("p", { klasse: "klachtenstatus", "data-status": "ja" }, h("span", { klasse: "kopje" }, "Patiënt: "), nu.status) : null,
        nu.waarschuwing ? h("p", { klasse: "waarschuwing", role: "status", id: "aanhoudend" }, nu.waarschuwing,
          app.ep.escalatie && app.ep.escalatie.uitleg ? " " + app.ep.escalatie.uitleg : null) : null,
        verwachtView(),
        !heeft ? h("p", { klasse: "uitleg" }, "Kies een kaart om te spelen.") : null)
    );
  }

  function tijdlijnView() {
    var dagen = dagenModel(app.casus, app.ep, app.spel).slice().reverse();
    return h("section", { klasse: "tijdlijn", "aria-labelledby": "tijdlijn-kop" },
      h("h2", { id: "tijdlijn-kop", klasse: "klein" }, "Tijdlijn"),
      h("p", { klasse: "uitleg" }, "Nieuwste dag bovenaan."),
      dagen.map(function (d) {
        return h("div", { klasse: "dag" + (d.huidig ? " huidig" : ""), "data-dag": d.dag },
          h("h3", null, "Dag " + d.dag),
          d.banners.map(function (b) { return gebeurtenisKaart(app.ep, b.id, "klein"); }),
          d.kaarten.length || d.raadplegingen ? h("ol", { klasse: "gespeeld" },
            d.kaarten.map(function (k) {
              var data = kaartVan(app.casus, k.kaart);
              return h("li", { "data-gespeeld": k.kaart, klasse: "minikaart" + (data ? " cat-" + slug(data.categorie) : "") },
                h("span", { klasse: "titel" }, k.titel),
                k.na && k.na.soort === "onthuld" ? h("span", { klasse: "onthulling" }, k.na.tekst) : null,
                k.na && k.na.soort === "effect"
                  ? h("details", null, h("summary", null, "Wat deed deze kaart?"), h("p", null, k.na.tekst)) : null);
            }),
            d.raadplegingen ? h("li", { klasse: "raadpleeglijn" }, "Richtlijn geraadpleegd" + (d.raadplegingen > 1 ? " (" + d.raadplegingen + "×)" : "")) : null
          ) : h("p", { klasse: "uitleg leeg" }, d.doorgespoeld && !d.huidig ? "Doorgespoeld: geen kaarten gespeeld." : "Nog geen kaarten gespeeld.")
        );
      })
    );
  }

  function spelScherm() {
    var st = app.spel;
    return h("div", { klasse: "spel" },
      actiebalk(),
      h("div", { klasse: "raster" },
        h("aside", { klasse: "links" }, patientView(), bijzaakView()),
        h("main", { klasse: "midden" },
          h("div", { klasse: "middenkop" },
            opslagBalk(),
            nieuwVandaagView(),
            app.onthuld && app.onthuld.length ? h("div", { klasse: "onthulbalk", role: "status", id: "onthuld" },
              h("strong", null, "Nieuw gegeven: "), app.onthuld.join(" ")) : null,
            app.melding ? h("p", { klasse: app.downloadFout ? "fout" : "info", role: "alert", id: "melding" }, app.melding) : null,
            g.Engine.eindeBereikt(st) ? h("p", { klasse: "info" }, "De laatste dag is voorbij. Rond de episode af.") : null),
          kaartenView()
        ),
        h("aside", { klasse: "rechts" }, tijdlijnView())
      )
    );
  }

  /* ---------- dialoog (doel/optie kiezen, richtlijn) ---------- */

  function rondleidingNodig() {
    return episodeNummer(app.casus, app.ep) === 1 && !app.rondleidingGezien && opslagBeschikbaarSessie("lees", RONDLEIDING_SLEUTEL) !== "1";
  }
  // Na de uitleg bij de start: in de eerste episode eerst de bedieningsrondleiding (over te slaan), daarna het spel.
  function beginEpisode() {
    app.dialoog = null;
    if (rondleidingNodig()) app.dialoog = { type: "rondleiding", stap: 0 };
    app.fokus = app.dialoog ? "dlg-eerste" : "dag-kop";
    render();
  }
  function rondleidingKlaar() {
    app.rondleidingGezien = true;
    opslagBeschikbaarSessie("schrijf", RONDLEIDING_SLEUTEL, "1");
    app.dialoog = null; app.fokus = "dag-kop";
    render();
  }
  // Na het tussenscherm: de gewone uitleg bij de start van de episode.
  function naTijdsprong() {
    if (app.ep && app.ep.startUitleg) { app.dialoog = { type: "start", tekst: app.ep.startUitleg }; app.fokus = "dlg-eerste"; render(); return; }
    beginEpisode();
  }

  function sluitDialoog() {
    var d = app.dialoog;
    if (d && d.type === "start") { beginEpisode(); return; }
    if (d && d.type === "rondleiding") { rondleidingKlaar(); return; }
    if (d && (d.type === "gebeurtenis" || d.type === "tijdsprong")) return;   // alleen met Verder
    app.dialoog = null;
    app.fokus = d && d.kaartId ? "kaart-" + d.kaartId : "btn-raadplegen";
    render();
  }

  function dialoogView() {
    var d = app.dialoog, titel, inhoud, klasse = "dialoog", schermKlasse = "scherm", kop = null;
    if (d.type === "start") {
      titel = "Episode " + episodeNummer(app.casus, app.ep);
      inhoud = [
        h("p", null, "Deze episode duurt " + app.spel.aantalDagen + " dagen. Elke dag kun je een aantal kaarten spelen."),
        h("p", { id: "start-uitleg" }, d.tekst),
        fokusMarkeer(knop("Begin", { klasse: "knop hoofd", id: "btn-begin" }, beginEpisode), "dlg-eerste")
      ];
    } else if (d.type === "tijdsprong") {
      // Tussenscherm: alleen de kopregels van de patiëntkaarten (zichtbare gegevens), de oude en de nieuwe.
      var oudKop = (d.vorige.patient && d.vorige.patient.zichtbaar && d.vorige.patient.zichtbaar.kop) || "";
      var nieuwKop = (app.ep.patient && app.ep.patient.zichtbaar && app.ep.patient.zichtbaar.kop) || "";
      klasse += " sprongdlg"; schermKlasse += " sprong";
      titel = "Episode " + episodeNummer(app.casus, app.ep);
      inhoud = [
        h("div", { klasse: "sprongtafel", id: "tijdsprong" },
          h("div", { klasse: "sprongkaart oud", "aria-hidden": "true" },
            h("p", { klasse: "kaartband" }, "Episode " + episodeNummer(app.casus, d.vorige)),
            h("p", { klasse: "sprongkop" }, oudKop)),
          h("div", { klasse: "sprongpijl", "aria-hidden": "true" },
            h("span", { klasse: "sprongpunt" }), h("span", { klasse: "sprongpunt" }), h("span", { klasse: "sprongpunt" })),
          h("div", { klasse: "sprongkaart nieuw" },
            h("p", { klasse: "kaartband" }, "Patiëntkaart"),
            h("p", { klasse: "sprongkop", id: "tijdsprong-kop" }, nieuwKop))),
        h("p", { klasse: "dlgknoppen sprongknop" }, fokusMarkeer(knop("Verder", { klasse: "knop hoofd", id: "btn-tijdsprong-verder" }, naTijdsprong), "dlg-eerste"))
      ];
    } else if (d.type === "gebeurtenis") {
      klasse += " gebeurtenisdlg"; schermKlasse += " onderbreking";
      titel = "Dag " + d.dag;
      inhoud = [
        d.stop ? h("p", { klasse: "info", id: "doorspoel-stop" }, d.stop) : null,
        h("div", { klasse: "gebeurtenisstapel" }, d.items.map(function (it, i) {
          return h("div", { klasse: "gebeurteniskaart groot", "data-erkennen": it.id, style: "--i:" + i },
            h("p", { klasse: "gb-band" }, "Gebeurtenis"),
            it.titel ? h("p", { klasse: "gb-titel" }, it.titel) : null,
            h("p", { klasse: "gb-tekst" }, it.tekst));
        })),
        h("p", { klasse: "dlgknoppen" }, fokusMarkeer(knop("Verder", { klasse: "knop hoofd", id: "btn-gebeurtenis-verder" }, erkenGebeurtenis), "dlg-eerste"))
      ];
    } else if (d.type === "stop") {
      titel = "Deze casus stoppen?";
      inhoud = [
        h("p", null, "Deze poging wordt niet beoordeeld en niet bewaard. Wil je later verder, kies dan Pauzeer en sla op."),
        h("p", { klasse: "dlgknoppen" },
          fokusMarkeer(knop("Ja, stop", { klasse: "knop hoofd", id: "btn-stop-ja" }, stopCasus), "dlg-eerste"),
          knop("Nee, verder spelen", { klasse: "knop rand", id: "btn-stop-nee" }, function () { app.dialoog = null; app.fokus = "btn-stop"; render(); }))
      ];
    } else if (d.type === "rondleiding") {
      var stappen = RONDLEIDING, st1 = stappen[d.stap], laatste1 = d.stap >= stappen.length - 1;
      titel = "Rondleiding " + (d.stap + 1) + " van " + stappen.length + ": " + st1.titel;
      inhoud = [
        h("p", { id: "rondleiding-tekst" }, st1.tekst),
        h("p", { klasse: "dlgknoppen" },
          fokusMarkeer(knop(laatste1 ? "Klaar" : "Volgende", { klasse: "knop hoofd", id: "btn-rondleiding-verder" },
            function () { if (laatste1) rondleidingKlaar(); else { d.stap += 1; app.fokus = "dlg-eerste"; render(); } }), "dlg-eerste"),
          knop("Overslaan", { klasse: "knop rand", id: "btn-rondleiding-over" }, rondleidingKlaar))
      ];
    } else if (d.type === "kaart") {
      // Vóór het spelen alleen categorie (band) en label (titel), plus de bediening. Geen effect, dosering, smaakregel of doelenlijst:
      // wat de kaart doet of onthult, zie je pas na het spelen (op de tijdlijn). Kan een kaart nergens bij, dan hoor je dat bij Speel.
      var kd = kaartVan(app.casus, d.kaartId), sp = app.spel;
      titel = kd.label;
      klasse += " grotekaart cat-" + slug(kd.categorie);
      kop = h("p", { klasse: "kaartband" }, kd.categorie);
      var reden = g.Engine.eindeBereikt(sp) ? "De laatste dag is voorbij." : (sp.actiesOver < 1 ? "Je hebt vandaag geen acties meer." : null);
      inhoud = [
        reden ? h("p", { klasse: "uitleg", id: "kaart-reden" }, reden) : null,
        h("p", { klasse: "dlgknoppen" },
          fokusMarkeer(knop("Speel", { klasse: "knop hoofd", id: "btn-speel", disabled: reden ? true : null }, function () { var id = d.kaartId; app.dialoog = null; klikKaart(id); }), "dlg-eerste"),
          knop("Sluiten", { klasse: "knop rand", id: "btn-sluit-kaart" }, sluitDialoog))
      ];
    } else if (d.type === "raadplegen") {
      titel = d.model.titel;
      inhoud = [
        h("ul", { klasse: "bronnen" }, d.model.bronnen.map(function (b) {
          return h("li", null, h("strong", null, b.sleutel), b.tekst ? " — " + b.tekst : "");
        })),
        fokusMarkeer(knop("Sluiten", { klasse: "knop hoofd", id: "btn-sluit" }, sluitDialoog), "dlg-eerste")
      ];
    } else {
      var kaart = kaartVan(app.casus, d.kaartId);
      klasse += " grotekaart cat-" + slug(kaart.categorie);
      kop = h("p", { klasse: "kaartband" }, kaart.categorie);
      if (d.stap === 1) {
        titel = kaart.label + ": kies een middel";
        inhoud = [h("div", { klasse: "keuzes" }, d.doelen.map(function (x, i) {
          var b = knop(x.label, { klasse: "keuze", "data-doel": x.id }, function () { kiesDoel(x); });
          return i === 0 ? fokusMarkeer(b, "dlg-eerste") : b;
        }))];
      } else {
        titel = kaart.label + ": " + doelLabel(app.casus, app.ep, d.doel) + ", kies een aanpassing";
        inhoud = [h("div", { klasse: "keuzes" }, d.opties.map(function (o, i) {
          var b = knop(o, { klasse: "keuze", "data-optie": o }, function () { speelDirect(d.kaartId, { doel: d.doel, optie: o }); });
          return i === 0 ? fokusMarkeer(b, "dlg-eerste") : b;
        }))];
      }
      inhoud.push(h("p", { klasse: "dlgknoppen" }, knop("Annuleren", { klasse: "knop rand", id: "btn-annuleer" }, sluitDialoog)));
    }
    var dlg = h("div", {
      klasse: klasse, role: d.type === "gebeurtenis" ? "alertdialog" : "dialog", "aria-modal": "true", "aria-labelledby": "dlg-titel",
      toets: function (e) {
        if (e.key === "Escape") { sluitDialoog(); return; }
        if (e.key === "Tab" && typeof dlg.querySelectorAll === "function") {
          var f = dlg.querySelectorAll("button:not([disabled]), summary");
          if (!f.length) return;
          var eerste = f[0], laatste = f[f.length - 1];
          if (e.shiftKey && doc.activeElement === eerste) { e.preventDefault(); laatste.focus(); }
          else if (!e.shiftKey && doc.activeElement === laatste) { e.preventDefault(); eerste.focus(); }
        }
      }
    }, kop, h("h2", { id: "dlg-titel" }, titel), inhoud);
    return h("div", { klasse: schermKlasse, klik: function (e) { if (e.target === e.currentTarget) sluitDialoog(); } }, dlg);
  }

  /* ---------- eind ---------- */

  // Een kaart op tafel bij de beoordeling: voorkant (categorie en label) en achterkant (categorie, label en nadeel uit de uitkomst).
  function tafelKaart(item, nadeel, stijl, alOm) {
    var data = kaartVan(app.casus, item.kaart), cat = data ? data.categorie : "", tekst = nadeelTekst(nadeel);
    return h("li", { klasse: "tafelkaart" + (cat ? " cat-" + slug(cat) : "") + (alOm ? " weggelaten" : ""), "data-downside": item.label, style: stijl },
      h("div", { klasse: "tk-binnen" },
        alOm ? null : h("div", { klasse: "tk-voor", "aria-hidden": "true" },
          h("p", { klasse: "kaartband" }, cat), h("p", { klasse: "tk-label" }, item.label)),
        h("div", { klasse: "tk-achter" },
          h("p", { klasse: "kaartband" }, cat),
          h("strong", { klasse: "tk-label" }, item.label),
          tekst ? h("span", { klasse: "tk-nadeel" }, tekst) : h("span", { klasse: "tk-geen", "aria-hidden": "true" }, "—"))));
  }

  // Beoordeling: de gespeelde kaarten liggen open en klappen één voor één om naar hun nadeel. Daarna wat er met de patiënt gebeurde en
  // pas dan de hint (of bij een gehaalde poort score, profiel en de opleider). Bij een verloren episode eerst de escalatie.
  // De volgorde staat in de DOM; de animatie (CSS, met vertraging per stap) speelt alleen bij het eerste beeld en is over te slaan.
  function eindScherm() {
    var m = evaluatieModel(app.uitkomst), epNr = episodeNummer(app.casus, app.ep);
    var gespeeld = gespeeldeKaarten(app.casus, app.uitkomst, app.spel && app.spel.tijdlijn);
    var weg = lijst(app.uitkomst && app.uitkomst.downsides).filter(function (d) { return d && d.soort === "weggelaten"; });
    var anim = !!app.eindAnimatie && !geenBeweging();
    app.eindAnimatie = false;
    var t = 0;
    function v(ms) { return "--v:" + Math.round(ms) + "ms"; }
    var eps = lijst(app.casus.episodes), volgendeEp = eps[epNr] || null;

    var escalatie = null;
    if (m.verloren) {
      escalatie = h("div", { klasse: "escalatie" },
        h("h2", { id: "uitslag-kop", klasse: "onthul", style: v(0) }, "Episode verloren"),
        m.eindGebeurtenis ? h("div", { klasse: "onthul", style: v(250) }, gebeurtenisKaart(app.ep, m.eindGebeurtenis, "eind")) : null,
        m.eindTekst ? h("p", { klasse: "eindtekst onthul", id: "eindtekst", style: v(700) }, m.eindTekst) : null);
      t = 2000;
    }

    var naKaart = m.eindeNaKaart ? h("p", { klasse: "eindtekst onthul", id: "einde-na-kaart", style: v(t) }, m.eindeNaKaart) : null;
    if (naKaart) t += 900;

    var tTafel = t, stap = gespeeld.length ? Math.max(160, Math.min(380, 4200 / gespeeld.length)) : 0;
    t += 1000;   // eerst even de voorkanten op tafel
    var tafel = null;
    if (gespeeld.length || weg.length) {
      var gesp = gespeeld.map(function (x, i) { return tafelKaart(x, x.nadeel, v(tTafel) + ";--f:" + Math.round(t + i * stap) + "ms", false); });
      t += gespeeld.length ? (gespeeld.length - 1) * stap + 520 + 300 : 0;
      var tWeg = t;
      if (weg.length) t += 650;
      tafel = h("section", { klasse: "tafelsectie", "aria-labelledby": "ds-kop" },
        h("h2", { id: "ds-kop", klasse: "onthul", style: v(tTafel) }, "Wat je keuzes kosten"),
        gespeeld.length ? h("div", { klasse: "dsgroep" },
          h("h3", { klasse: "onthul", style: v(tTafel) }, "Gespeelde kaarten"),
          h("ul", { klasse: "omgeklapt tafel" }, gesp)) : null,
        weg.length ? h("div", { klasse: "dsgroep onthul", style: v(tWeg) },
          h("h3", null, "Niet gespeelde kaarten"),
          h("ul", { klasse: "omgeklapt tafel" }, weg.map(function (d) {
            return tafelKaart({ kaart: d.kaart, label: d.label }, d.tekst, "", true);
          }))) : null);
    }

    var knoppen, verslag;
    if (!m.gehaald) {
      // Volgorde (besluit Bart, 14 november 2026): eerst wat er met de patiënt gebeurde, dan één hint van de opleider.
      var tGevolg = t;
      t += m.gevolgen.length ? 1500 : 500;
      var tHint = t;
      t += m.hint ? 900 : 0;
      knoppen = h("p", { klasse: "dlgknoppen onthul", style: v(t) },
        fokusMarkeer(knop("Opnieuw", { id: "btn-opnieuw", klasse: "knop hoofd" }, function () { startEpisode(app.ep.id); }), "btn-opnieuw"),
        knop("Terug naar start", { id: "btn-terug", klasse: "knop rand" }, function () { naarScherm("kies"); }));
      verslag = h("div", { klasse: "verslag onthul", style: v(m.verloren ? Math.max(0, tGevolg - 200) : tGevolg) },
        m.verloren ? null : h("h2", { id: "uitslag-kop", klasse: "onthul", style: v(tGevolg) }, "Nog niet veilig genoeg"),
        m.gevolgen.length ? h("div", { klasse: "gevolgen onthul", id: "gevolgen", style: v(tGevolg) },
          h("h3", { id: "gevolgen-kop" }, gevolgenKop(app.ep)),
          h("ul", { "aria-labelledby": "gevolgen-kop" }, m.gevolgen.map(function (tk, i) {
            return h("li", { klasse: "gevolg", "data-gevolg": "ja", id: i === 0 ? "gevolg" : null }, tk);
          }))) : null,
        m.hint ? h("div", { klasse: "hint onthul", id: "hint", style: v(tHint) },
          h("h3", { id: "hint-kop" }, "Hint van je opleider"),
          h("p", { klasse: "vraag", id: "socratisch" }, m.hint)) : null,
        m.anderen ? h("p", { klasse: "uitleg onthul", id: "anderen", style: v(t) }, m.anderen) : null,
        knoppen);
    } else {
      var tKop = t; t += 1100;
      var tProfiel = t; if (m.profiel) t += 900;
      var tOpleider = t; if ((m.profiel && m.profiel.reflectievraag) || m.extraVragen.length) t += 900;
      var tZicht = t; if (m.zichtbaar.length) t += 600;
      knoppen = h("p", { klasse: "dlgknoppen onthul", style: v(t) },
        volgendeEp ? fokusMarkeer(knop("Volgende episode", { id: "btn-volgende-episode", klasse: "knop hoofd" }, function () { startEpisode(volgendeEp.id, true); }), "btn-volgende-episode") : null,
        knop("Opnieuw", { id: "btn-nogmaals", klasse: "knop rand" }, function () { startEpisode(app.ep.id); }),
        fokusMarkeer(knop("Terug naar start", { id: "btn-terug", klasse: "knop rand" }, function () { naarScherm("kies"); }), "btn-terug"));
      verslag = h("div", { klasse: "verslag onthul", style: v(tKop) },
        h("h2", { id: "uitslag-kop", klasse: "onthul", style: v(tKop) }, "Veiligheid gehaald"),
        m.scores.length ? h("div", { klasse: "scores onthul", style: v(tKop + 300) }, m.scores.map(function (s) {
          var punten = [];
          for (var i = 1; i <= SCHAAL; i++) punten.push(h("span", { klasse: "dot" + (i <= s.waarde ? " aan" : ""), "aria-hidden": "true" }, i <= s.waarde ? "●" : "○"));
          return h("p", { klasse: "score", "data-score": s.as }, h("span", { klasse: "scorenaam" }, s.naam), " ", punten, " ",
            h("strong", null, s.waarde + " van " + SCHAAL));
        })) : null,
        m.zonderScore.length ? h("div", { klasse: "scores onthul", style: v(tKop + 300) }, m.zonderScore.map(function (s) {
          return h("p", { klasse: "score geenscore", "data-geen-score": s.as }, h("span", { klasse: "scorenaam" }, s.naam), " geen score voor deze route");
        })) : null,
        m.profiel ? h("div", { klasse: "profiel onthul", style: v(tProfiel) },
          h("h3", null, "Jouw voorschrijfprofiel"),
          h("p", { klasse: "profielnaam", id: "profiel" }, m.profiel.naam)) : null,
        // Reflectievraag en extra feedback staan samen onder één kop.
        (m.profiel && m.profiel.reflectievraag) || m.extraVragen.length ? h("div", { klasse: "extra onthul", id: "opleider", style: v(tOpleider) },
          h("h3", { id: "opleider-kop" }, "Van je opleider"),
          m.profiel && m.profiel.reflectievraag ? h("p", { klasse: "vraag", id: "reflectie" }, m.profiel.reflectievraag) : null,
          m.extraVragen.length ? h("ul", null, m.extraVragen.map(function (q) { return h("li", { "data-extra": "ja" }, q); })) : null) : null,
        m.zichtbaar.length ? h("div", { klasse: "zichtbaar onthul", style: v(tZicht) }, h("h3", null, "Wat je niet zag"),
          h("ul", null, m.zichtbaar.map(function (q) { return h("li", { "data-zichtbaar": "ja" }, q); }))) : null,
        knoppen);
    }

    var hoofd = h("main", { klasse: "smal eind " + (anim ? "animeert" : "direct") });
    var overslaan = anim ? knop("Alles direct tonen", { id: "btn-overslaan", klasse: "knop rand overslaan", style: v(t) }, function () {
      hoofd.className = hoofd.className.replace(/\banimeert\b/, "direct");
      try { var b = hoofd.querySelector(".verslag .dlgknoppen button"); if (b) b.focus(); } catch (e) { /* geen focus */ }
    }) : null;
    voeg(hoofd, [
      h("div", { klasse: "eindkop" }, fokusMarkeer(h("h1", { tabindex: "-1" }, "Beoordeling episode " + epNr), "kop"), overslaan),
      opslagBalk(),
      app.opslagFout ? h("p", { klasse: "waarschuwing", role: "alert" }, app.opslagFout) : null,
      h("section", { klasse: "uitslag " + (m.gehaald ? "goed" : "niet") + (m.verloren ? " verloren" : ""), "aria-labelledby": "uitslag-kop" },
        escalatie, naKaart, tafel, verslag),
      h("div", { klasse: "onthul eindvoet", style: v(t) },
        meldingView(),
        app.testmodus ? h("p", { klasse: "waarschuwing", id: "testmodus-melding" }, "Testmodus: deze poging telt niet mee als meting.") : null,
        h("p", { klasse: "onderknoppen" }, exportKnop(), " ", overzichtKnop("eind")))
    ]);
    return hoofd;
  }

  /* ====================================================================== */
  /* Start                                                                  */
  /* ====================================================================== */

  function start(rootEl) {
    doc = g.document;
    root = rootEl || (doc && doc.getElementById && doc.getElementById("app"));
    if (!doc || !root) return null;
    app = nieuweApp();
    render();
    return app;
  }

  var UI = {
    versie: "1.0",
    start: start,
    // logica (getest zonder DOM)
    slug: slug, pseudoniemControle: pseudoniemControle, zelfdePseudoniem: zelfdePseudoniem, recordsVan: recordsVan,
    episodeOverzicht: episodeOverzicht, kaartenPerCategorie: kaartenPerCategorie, toegestaneDoelen: toegestaneDoelen,
    isDoelkaart: isDoelkaart, alleDoelenGebruikt: alleDoelenGebruikt, optiesVoor: optiesVoor, regelTitel: regelTitel, naSpelenTekst: naSpelenTekst,
    dagenModel: dagenModel, patientVelden: patientVelden, evaluatieModel: evaluatieModel, raadpleegModel: raadpleegModel,
    aanhoudendTekst: aanhoudendTekst, klachtenPerDag: klachtenPerDag, gebeurtenissenSindsStart: gebeurtenissenSindsStart,
    medicatieStatus: medicatieStatus, medicatieLijstTekst: medicatieLijstTekst, schoneTekst: schoneTekst, docentModus: docentModus, overzichtModel: overzichtModel, opslagMelding: opslagMelding, actieDots: actieDots, doelLabel: doelLabel,
    afrondUitleg: afrondUitleg, doorspoelStopTekst: doorspoelStopTekst,
    nadeelTekst: nadeelTekst, anderenZin: anderenZin, gevolgenKop: gevolgenKop, effectVoor: effectVoor, enigDoel: enigDoel, rondleiding: function () { return RONDLEIDING.slice(); }, gespeeldeKaarten: gespeeldeKaarten,
    _opslag: undefined,                               // alleen voor tests
    _rng: null,                                       // alleen voor tests: vaste toevalsbron voor de volgorde van opties
    _toestand: function () { return app; }            // alleen voor tests
  };
  // Alleen voor de tests (niet opsombaar): de volledige broncode van deze module, voor de controle dat hier geen casustekst staat.
  Object.defineProperty(UI, "_bron", { enumerable: false, value: uiModule.toString() });
  g.UI = UI;

  if (typeof document !== "undefined" && document && document.getElementById) {
    var opstart = function () { start(document.getElementById("app")); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", opstart);
    else opstart();
  }
})(typeof window !== "undefined" ? window : globalThis);

/* Weergave van het spel (window.UI). Klassiek script, geen modules, geen netwerk.
 *
 * Regels voor deze laag:
 *  - Alle klinische tekst komt uit de data (casus-object) of uit de uitkomst van Evaluatie; hier staan alleen korte
 *    bedieningsteksten (knoppen, uitleg). Geen middelnamen, kaart-id's of klinische drempels.
 *  - Voor het spelen toont een kaart ALLEEN categorie (de kop waaronder hij staat) en label. Effect, downside en bron
 *    komen nooit in de pagina vóór het spelen; downsides pas in het evaluatiescherm.
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
    { titel: "Je kaarten", tekst: "Onder de patiënt liggen je kaarten, per soort. Klik op een kaart om hem eerst te lezen." },
    { titel: "De knop Speel", tekst: "Pas met de knop Speel in het kaartvenster speel je de kaart. Sommige kaarten vragen daarna om een keuze." },
    { titel: "Acties en dagen", tekst: "Elke dag heb je een aantal acties. Een kaart spelen kost een actie. Met Volgende dag ga je een dag verder." },
    { titel: "Een poging", tekst: "Aan het eind van de episode krijg je een beoordeling. Eén keer een episode spelen is een poging; je mag opnieuw proberen." }
  ];
  var RONDLEIDING_SLEUTEL = "egc.rondleiding.gezien";
  var DOELVELDEN = [                                  // welke velden van state.zichtbaar de patiëntkaart toont, en onder welk kopje
    ["kop", null],
    ["klachten", null],
    ["medicatieTekst", "Medicatie"],
    ["labTekst", "Lab"],
    ["eerdereUWI", "Eerdere UWI"],
    ["eerdereKweek", "Eerdere kweek"]
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
        return r.episodeId === ep.id && (r.casusId == null || r.casusId === casus.id) && Array.isArray(r.geschonden) && r.geschonden.length === 0;
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
    if (Array.isArray(doelen)) {
      doelen.forEach(function (d) {
        if (d.vereist) {
          ctx = ctx || g.Predicaten.maakContext(casus, ep, state);
          if (!g.Predicaten.evalueer(d.vereist, ctx)) return;
        }
        if (!heeftOpties(d.id)) return;
        uit.push({ id: d.id, label: d.label || doelLabel(casus, ep, d.id) });
      });
    } else if (isObj(kaart.opties)) {
      Object.keys(kaart.opties).forEach(function (id) { uit.push({ id: id, label: doelLabel(casus, ep, id) }); });
    }
    return uit;
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

  // Tekst na het spelen: de onthulling (als de kaart iets onthulde), bij een kaart met uitlegVanDoel de uitleg van het gekozen middel,
  // anders effect[episode] ?? effect.alle, anders niets.
  function naSpelenTekst(casus, ep, state, kaartId, doel) {
    var onthuld = lijst(state.onthuld).filter(function (o) { return o.kaart === kaartId; }).map(function (o) { return o.tekst; });
    if (onthuld.length) return { soort: "onthuld", tekst: onthuld.join(" ") };
    var k = kaartVan(casus, kaartId);
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

  // "Klachten houden aan: dag 1, 2, 3." als de escalatie aan staat en de klachten aanhouden; anders null. De tekst staat in de data.
  function aanhoudendTekst(ep, kl) {
    var ec = ep && ep.escalatie, n = kl && kl.reeks;
    if (!ec || !ec.aan || !ec.waarschuwing || !(n > 0)) return null;
    var dagen = [];
    for (var i = 1; i <= n; i++) dagen.push(i);
    return ec.waarschuwing + " " + dagen.join(", ") + ".";
  }

  // Tijdlijn: voor elke dag tot en met de huidige: banners, klachtenstatus, gespeelde kaarten en raadplegingen.
  function dagenModel(casus, ep, state) {
    var uit = [];
    for (var d = 1; d <= state.dag; d++) {
      var kl = lijst(state.klachten)[d];
      uit.push({
        dag: d,
        huidig: d === state.dag,
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
  function patientVelden(ep, state) {
    var z = state.zichtbaar || {}, start = (ep.patient && ep.patient.zichtbaar) || {}, uit = [];
    DOELVELDEN.forEach(function (v) {
      var tekst = z[v[0]];
      if (typeof tekst !== "string" || tekst === "") return;
      uit.push({ sleutel: v[0], kopje: v[1], tekst: tekst, nieuw: start[v[0]] !== tekst });
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

  // Weergavemodel van het evaluatiescherm. Bij een schending: ÉÉN vraag, geen score, geen profiel, geen extra vragen.
  function evaluatieModel(uitkomst) {
    var u = uitkomst || {};
    var downsides = lijst(u.downsides).map(function (d) { return { label: d.label, tekst: d.tekst, soort: d.soort }; });
    if (!u.poortGehaald) {
      return { gehaald: false, downsides: downsides, vraag: u.vraag || null, gevolg: u.gevolg || null, anderen: anderenZin(u), scores: [], profiel: null, extraVragen: [], zichtbaar: [] };
    }
    var scores = [];
    if (isObj(u.score)) Object.keys(u.score).forEach(function (as) {
      if (typeof u.score[as] === "number") scores.push({ as: as, naam: hoofdletter(as), waarde: u.score[as] });
    });
    return {
      gehaald: true, downsides: downsides, vraag: null, gevolg: null, anderen: null, scores: scores,
      profiel: isObj(u.profiel) ? { naam: u.profiel.naam, reflectievraag: u.profiel.reflectievraag || null } : null,
      extraVragen: lijst(u.extraVragen).map(function (x) { return typeof x === "string" ? x : x.vraag; }),
      zichtbaar: lijst(u.zichtbaar).map(function (x) { return typeof x === "string" ? x : x.tekst; })
    };
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
    el.appendChild(doc.createTextNode(String(kind)));
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

  function nieuweApp() {
    return {
      scherm: "start", pseudoniem: opslagBeschikbaarSessie("lees", PSEUDONIEM_SLEUTEL) || "", fout: null,
      casus: (g.CASUSSEN && g.CASUSSEN[0]) || null, ep: null, spel: null, uitkomst: null,
      melding: null, onthuld: null, dialoog: null, bevestigAfronden: false, fokus: null, downloadFout: false, geschiedenis: [],
      testmodus: false, rondleidingGezien: false
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
      else inhoud = foutScherm("Onbekend scherm.");
    } catch (e) {
      inhoud = foutScherm("Er ging iets mis: " + ((e && e.message) || e));
    }
    var wrap = h("div", { klasse: "pagina" }, inhoud, app.dialoog ? dialoogView() : null);
    if (typeof root.replaceChildren === "function") root.replaceChildren(wrap);
    else { while (root.firstChild) root.removeChild(root.firstChild); root.appendChild(wrap); }
    var doel = (vorig && fokusKandidaten[vorig]) || fokusKandidaten.kop;
    if (doel && typeof doel.focus === "function") { try { doel.focus(); } catch (e) { /* geen focus mogelijk */ } }
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
          h("li", null, "Met ‘Episode afronden’ krijg je de beoordeling. Lukt het niet, dan kun je het opnieuw proberen.")
        )
      )
    );
  }

  /* ---------- episodekeuze ---------- */

  function kiesScherm() {
    var records = [];
    try { records = g.Logging.alle(); } catch (e) { records = []; }
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
      h("p", { klasse: "testmodus-kies" },
        h("label", null, h("input", { type: "checkbox", id: "testmodus", checked: app.testmodus ? true : null, klik: function () { app.testmodus = !app.testmodus; app.fokus = "testmodus"; render(); } }),
          " Testmodus (voor Bart): alle episodes staan open; pogingen tellen niet mee als meting.")),
      app.testmodus ? h("p", { klasse: "waarschuwing", id: "testmodus-melding", role: "status" }, "TESTMODUS: deze pogingen worden in de export gemarkeerd en tellen niet mee als meting.") : null,
      h("ul", { klasse: "episodes" }, overzicht.map(function (o) {
        var status = !o.open ? "Vergrendeld: haal eerst " + o.vorige.toLowerCase() + "." : (o.gehaald ? "Gehaald." : "Nog niet gehaald.");
        if (o.open && o.testmodus && !o.gehaald) status = "Open in testmodus.";
        return h("li", { klasse: "kaartvlak episode" + (o.open ? "" : " dicht"), "data-episode": o.id },
          h("div", null, h("h2", null, o.titel), h("p", { klasse: "uitleg" }, status)),
          knop(o.gehaald ? "Opnieuw spelen" : "Start", { klasse: "knop hoofd", "data-start": o.id, disabled: !o.open ? true : null, "aria-label": o.titel + (o.gehaald ? " opnieuw spelen" : " starten") },
            function () { startEpisode(o.id); }));
      })),
      h("p", null, exportKnop())
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

  function startEpisode(epId) {
    if (!pseudoniemControle(app.pseudoniem).ok) { naarScherm("start"); app.fout = pseudoniemControle(app.pseudoniem).fout; render(); return; }
    var ep = lijst(app.casus.episodes).filter(function (e) { return e.id === epId; })[0];
    try {
      app.spel = g.Engine.nieuwSpel(app.casus, epId);
      app.ep = ep;
      app.uitkomst = null;
      naarScherm("spel");
      if (ep.startUitleg) { app.dialoog = { type: "start", tekst: ep.startUitleg }; app.fokus = "dlg-eerste"; render(); }
    } catch (e) {
      app.melding = (e && e.message) || "De episode kon niet starten.";
      app.downloadFout = true;
      render();
    }
  }

  /* ---------- spel ---------- */

  function speelDirect(kaartId, opts) {
    var r;
    try { r = g.Engine.speelKaart(app.spel, kaartId, opts || {}); }
    catch (e) { r = { ok: false, fout: (e && e.message) || "Dat lukte niet." }; }
    app.dialoog = null;
    if (!r.ok) { app.melding = r.fout; app.onthuld = null; app.downloadFout = true; }
    else {
      app.melding = null; app.downloadFout = false;
      app.onthuld = lijst(r.onthuld).map(function (o) { return o.tekst; });
    }
    app.fokus = "kaart-" + kaartId;
    render();
  }

  // Klik op een kaart: eerst lezen (kaartvenster). Pas de knop Speel speelt de kaart.
  function openKaart(kaartId) {
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
      app.melding = "Deze kaart kan nu nergens op worden gespeeld.";
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
    try { r = g.Engine.raadpleeg(app.spel); } catch (e) { r = { ok: false, fout: (e && e.message) || "Dat lukte niet." }; }
    if (!r.ok) { app.melding = r.fout; app.downloadFout = true; app.fokus = "btn-raadplegen"; render(); return; }
    app.melding = null; app.onthuld = null; app.downloadFout = false;
    app.dialoog = { type: "raadplegen", model: raadpleegModel(app.casus, r) };
    app.fokus = "dlg-eerste";
    render();
  }

  function volgendeDag() {
    try { g.Engine.volgendeDag(app.spel); app.melding = null; app.downloadFout = false; }
    catch (e) { app.melding = (e && e.message) || "Dat lukte niet."; app.downloadFout = true; }
    app.onthuld = null; app.bevestigAfronden = false;
    app.fokus = "dag-kop";
    render();
  }

  function rondAf() {
    var uitkomst;
    try { uitkomst = g.Engine.rondAf(app.spel); }
    catch (e) { app.melding = (e && e.message) || "Afronden lukte niet."; app.downloadFout = true; app.bevestigAfronden = false; render(); return; }
    app.uitkomst = uitkomst;
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
        fokusMarkeer(knop("Richtlijn raadplegen" + (kost > 0 ? " (kost " + kost + (kost === 1 ? " actie" : " acties") + ")" : ""),
          { id: "btn-raadplegen", klasse: "knop rand", disabled: klaar ? true : null }, raadpleeg), "btn-raadplegen"),
        laatste ? h("span", { klasse: "uitleg laatstedag", id: "laatste-dag" }, "Dit is de laatste dag.")
          : knop("Volgende dag", { id: "btn-volgende-dag", klasse: "knop rand" }, volgendeDag),
        app.bevestigAfronden && !laatste
          ? h("span", { klasse: "bevestig", role: "group", "aria-label": "Afronden bevestigen" },
              h("span", null, "Afronden?"),
              fokusMarkeer(knop("Ja, afronden", { id: "btn-afronden-ja", klasse: "knop hoofd" }, rondAf), "btn-afronden-ja"),
              knop("Nee, verder spelen", { id: "btn-afronden-nee", klasse: "knop rand" }, function () { app.bevestigAfronden = false; app.fokus = "btn-afronden"; render(); }))
          : fokusMarkeer(knop("Episode afronden", { id: "btn-afronden", klasse: "knop hoofd" }, function () {
              if (laatste) { rondAf(); return; }   // op de laatste dag kan er niets meer: meteen afronden, zonder "verder spelen"
              app.bevestigAfronden = true; app.fokus = "btn-afronden-ja"; render();
            }), "btn-afronden"),
        exportKnop(),
        knop("Pauzeer en sla op", { id: "btn-pauzeer", klasse: "knop rand" }, pauzeer),
        knop("Stop deze casus", { id: "btn-stop", klasse: "knop rand" }, function () { app.dialoog = { type: "stop" }; app.fokus = "dlg-eerste"; render(); })
      )
    );
  }

  function patientView() {
    var velden = patientVelden(app.ep, app.spel);
    return h("section", { klasse: "kaartvlak patient", "aria-labelledby": "patient-kop" },
      h("h2", { id: "patient-kop", klasse: "klein" }, "Patiëntkaart"),
      velden.map(function (v) {
        return h("p", { klasse: "veld" + (v.sleutel === "kop" ? " patientkop" : "") + (v.nieuw ? " nieuw" : ""), "data-veld": v.sleutel },
          v.kopje ? h("span", { klasse: "kopje" }, v.kopje + ": ") : null, v.tekst,
          v.nieuw ? h("span", { klasse: "nieuwlabel" }, " Nieuw") : null);
      })
    );
  }

  function kaartenView() {
    var st = app.spel;
    return h("section", { klasse: "kaarten", "aria-label": "Kaarten" },
      kaartenPerCategorie(app.casus, app.ep).map(function (grp) {
        var kid = "cat-" + slug(grp.categorie);
        return h("div", { klasse: "categorie " + grp.klasse, role: "group", "aria-labelledby": kid },
          h("h3", { id: kid }, grp.categorie),
          h("div", { klasse: "kaartrij" }, grp.kaarten.map(function (k) {
            var data = kaartVan(app.casus, k.id);
            return fokusMarkeer(knop([h("span", { klasse: "kaartnaam" }, k.label),
              data && data.dosering ? h("span", { klasse: "dosering" }, data.dosering) : null],
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

  function nieuwVandaagView() {
    var st = app.spel, dagen = dagenModel(app.casus, app.ep, st), nu = dagen[dagen.length - 1];
    var heeft = nu.banners.length || nu.status;
    return h("div", { klasse: "vandaag", "aria-live": "polite" },
      fokusMarkeer(h("h2", { id: "dag-kop", tabindex: "-1" }, "Dag " + st.dag), "dag-kop"),
      nu.banners.map(function (b) {
        return h("p", { klasse: "banner", role: "status", "data-gebeurtenis": b.id }, b.tekst);
      }),
      nu.status ? h("p", { klasse: "klachtenstatus", "data-status": "ja" }, h("span", { klasse: "kopje" }, "Patiënt: "), nu.status) : null,
      nu.waarschuwing ? h("p", { klasse: "waarschuwing", role: "status", id: "aanhoudend" }, nu.waarschuwing,
        app.ep.escalatie && app.ep.escalatie.uitleg ? " " + app.ep.escalatie.uitleg : null) : null,
      verwachtView(),
      !heeft ? h("p", { klasse: "uitleg" }, "Kies een kaart om te spelen.") : null
    );
  }

  function tijdlijnView() {
    var dagen = dagenModel(app.casus, app.ep, app.spel).slice().reverse();
    return h("section", { klasse: "kaartvlak tijdlijn", "aria-labelledby": "tijdlijn-kop" },
      h("h2", { id: "tijdlijn-kop", klasse: "klein" }, "Tijdlijn"),
      h("p", { klasse: "uitleg" }, "Nieuwste dag bovenaan."),
      dagen.map(function (d) {
        return h("div", { klasse: "dag" + (d.huidig ? " huidig" : ""), "data-dag": d.dag },
          h("h3", null, "Dag " + d.dag),
          d.banners.map(function (b) { return h("p", { klasse: "banner klein", "data-gebeurtenis": b.id }, b.tekst); }),
          d.status ? h("p", { klasse: "klachtenstatus klein" }, h("span", { klasse: "kopje" }, "Patiënt: "), d.status) : null,
          d.waarschuwing ? h("p", { klasse: "waarschuwing klein" }, d.waarschuwing) : null,
          d.kaarten.length || d.raadplegingen ? h("ol", { klasse: "gespeeld" },
            d.kaarten.map(function (k) {
              return h("li", { "data-gespeeld": k.kaart },
                h("span", { klasse: "titel" }, k.titel),
                k.na && k.na.soort === "onthuld" ? h("span", { klasse: "onthulling" }, k.na.tekst) : null,
                k.na && k.na.soort === "effect"
                  ? h("details", null, h("summary", null, "Wat deed deze kaart?"), h("p", null, k.na.tekst)) : null);
            }),
            d.raadplegingen ? h("li", { klasse: "raadpleeglijn" }, "Richtlijn geraadpleegd" + (d.raadplegingen > 1 ? " (" + d.raadplegingen + "×)" : "")) : null
          ) : h("p", { klasse: "uitleg leeg" }, "Nog geen kaarten gespeeld.")
        );
      })
    );
  }

  function spelScherm() {
    var st = app.spel;
    return h("div", { klasse: "spel" },
      actiebalk(),
      h("div", { klasse: "raster" },
        h("aside", { klasse: "links" }, patientView()),
        h("main", { klasse: "midden" },
          opslagBalk(),
          nieuwVandaagView(),
          app.onthuld && app.onthuld.length ? h("div", { klasse: "onthulbalk", role: "status", id: "onthuld" },
            h("strong", null, "Nieuw gegeven: "), app.onthuld.join(" ")) : null,
          app.melding ? h("p", { klasse: app.downloadFout ? "fout" : "info", role: "alert", id: "melding" }, app.melding) : null,
          g.Engine.eindeBereikt(st) ? h("p", { klasse: "info" }, "De laatste dag is voorbij. Rond de episode af.") : null,
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

  function sluitDialoog() {
    var d = app.dialoog;
    if (d && d.type === "start") { beginEpisode(); return; }
    if (d && d.type === "rondleiding") { rondleidingKlaar(); return; }
    app.dialoog = null;
    app.fokus = d && d.kaartId ? "kaart-" + d.kaartId : "btn-raadplegen";
    render();
  }

  function dialoogView() {
    var d = app.dialoog, titel, inhoud;
    if (d.type === "start") {
      titel = "Episode " + episodeNummer(app.casus, app.ep);
      inhoud = [
        h("p", null, "Deze episode duurt " + app.spel.aantalDagen + " dagen. Elke dag kun je een aantal kaarten spelen."),
        h("p", { id: "start-uitleg" }, d.tekst),
        fokusMarkeer(knop("Begin", { klasse: "knop hoofd", id: "btn-begin" }, beginEpisode), "dlg-eerste")
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
      var kd = kaartVan(app.casus, d.kaartId), sp = app.spel, eff = effectVoor(kd, app.ep.id), doelenNu = null;
      titel = kd.label;
      if (isDoelkaart(app.casus, app.ep, d.kaartId)) {
        try { doelenNu = toegestaneDoelen(app.casus, app.ep, sp, d.kaartId); } catch (e) { doelenNu = []; }
      }
      var reden = g.Engine.eindeBereikt(sp) ? "De laatste dag is voorbij." : (sp.actiesOver < 1 ? "Je hebt vandaag geen acties meer." : (doelenNu && !doelenNu.length ? "Deze kaart kan nu nergens op worden gespeeld." : null));
      inhoud = [
        kd.smaak ? h("p", { klasse: "smaak", id: "kaart-smaak" }, kd.smaak) : null,
        kd.dosering ? h("p", { klasse: "kaartdosering", id: "kaart-dosering" }, h("strong", null, "Dosering en duur: "), kd.dosering) : null,
        eff && !(kd.dosering && eff.indexOf(kd.dosering) >= 0) ? h("p", { klasse: "kaarteffect", id: "kaart-effect" }, eff) : null,
        doelenNu ? h("p", { klasse: "uitleg", id: "kaart-doelen" }, doelenNu.length ? "Nu te gebruiken bij: " + doelenNu.map(function (x) { return x.label; }).join(", ") + "." : "Op dit moment is er nergens iets om deze kaart op te gebruiken.") : null,
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
      if (d.stap === 1) {
        titel = kaart.label + ": kies een doel";
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
      klasse: "dialoog", role: "dialog", "aria-modal": "true", "aria-labelledby": "dlg-titel",
      toets: function (e) {
        if (e.key === "Escape") { sluitDialoog(); return; }
        if (e.key === "Tab" && typeof dlg.querySelectorAll === "function") {
          var f = dlg.querySelectorAll("button:not([disabled])");
          if (!f.length) return;
          var eerste = f[0], laatste = f[f.length - 1];
          if (e.shiftKey && doc.activeElement === eerste) { e.preventDefault(); laatste.focus(); }
          else if (!e.shiftKey && doc.activeElement === laatste) { e.preventDefault(); eerste.focus(); }
        }
      }
    }, h("h2", { id: "dlg-titel" }, titel), inhoud);
    return h("div", { klasse: "scherm", klik: function (e) { if (e.target === e.currentTarget) sluitDialoog(); } }, dlg);
  }

  /* ---------- eind ---------- */

  function legeDagenTekst() {
    var n = 0, van = app.spel ? app.spel.dag : 0;
    try { n = g.Engine.legeDagen(app.spel); } catch (e) { n = 0; }
    return n + " van " + van + ".";
  }

  function eindScherm() {
    var m = evaluatieModel(app.uitkomst), epNr = episodeNummer(app.casus, app.ep);
    var gespeeld = gespeeldeKaarten(app.casus, app.uitkomst, app.spel && app.spel.tijdlijn);
    var weg = m.downsides.filter(function (d) { return d.soort === "weggelaten"; });
    function downsideLijst(kop, items) {
      if (!items.length) return null;
      return h("div", { klasse: "dsgroep" }, h("h3", null, kop),
        h("ul", { klasse: "omgeklapt" }, items.map(function (d) {
          var tekst = nadeelTekst(d.tekst !== undefined ? d.tekst : d.nadeel);
          return h("li", { "data-downside": d.label }, h("strong", null, d.label), tekst ? h("span", null, tekst) : null);
        })));
    }
    var kern, eps = lijst(app.casus.episodes), volgendeEp = eps[episodeNummer(app.casus, app.ep)] || null;
    if (!m.gehaald) {
      kern = h("section", { klasse: "kaartvlak uitslag niet", "aria-labelledby": "uitslag-kop" },
        h("h2", { id: "uitslag-kop" }, "Nog niet veilig genoeg"),
        h("p", { klasse: "vraag", id: "socratisch" }, m.vraag),
        m.gevolg ? h("p", { klasse: "gevolg", id: "gevolg" }, m.gevolg) : null,
        m.anderen ? h("p", { klasse: "uitleg", id: "anderen" }, m.anderen) : null,
        h("p", { klasse: "uitleg" }, "Denk hier even over na en probeer de episode opnieuw."),
        h("p", { klasse: "dlgknoppen" },
          fokusMarkeer(knop("Opnieuw", { id: "btn-opnieuw", klasse: "knop hoofd" }, function () { startEpisode(app.ep.id); }), "btn-opnieuw"),
          knop("Terug naar start", { id: "btn-terug", klasse: "knop rand" }, function () { naarScherm("kies"); })));
    } else {
      kern = h("section", { klasse: "kaartvlak uitslag goed", "aria-labelledby": "uitslag-kop" },
        h("h2", { id: "uitslag-kop" }, "Veiligheid gehaald"),
        m.scores.length ? h("div", { klasse: "scores" }, m.scores.map(function (s) {
          var punten = [];
          for (var i = 1; i <= SCHAAL; i++) punten.push(h("span", { klasse: "dot" + (i <= s.waarde ? " aan" : ""), "aria-hidden": "true" }, i <= s.waarde ? "●" : "○"));
          return h("p", { klasse: "score", "data-score": s.as }, h("span", { klasse: "scorenaam" }, s.naam), " ", punten, " ",
            h("strong", null, s.waarde + " van " + SCHAAL));
        })) : null,
        m.profiel ? h("div", { klasse: "profiel" },
          h("h3", null, "Jouw voorschrijfprofiel"),
          h("p", { klasse: "profielnaam", id: "profiel" }, m.profiel.naam),
          m.profiel.reflectievraag ? h("p", { klasse: "vraag", id: "reflectie" }, m.profiel.reflectievraag) : null) : null,
        m.extraVragen.length ? h("div", { klasse: "extra" }, h("h3", null, "Om over na te denken"),
          h("ul", null, m.extraVragen.map(function (v) { return h("li", { "data-extra": "ja" }, v); }))) : null,
        m.zichtbaar.length ? h("div", { klasse: "zichtbaar" }, h("h3", null, "Wat je niet zag"),
          h("ul", null, m.zichtbaar.map(function (v) { return h("li", { "data-zichtbaar": "ja" }, v); }))) : null,
        h("p", { klasse: "dlgknoppen" },
          volgendeEp ? fokusMarkeer(knop("Volgende episode", { id: "btn-volgende-episode", klasse: "knop hoofd" }, function () { startEpisode(volgendeEp.id); }), "btn-volgende-episode") : null,
          knop("Opnieuw", { id: "btn-nogmaals", klasse: "knop rand" }, function () { startEpisode(app.ep.id); }),
          fokusMarkeer(knop("Terug naar start", { id: "btn-terug", klasse: "knop rand" }, function () { naarScherm("kies"); }), "btn-terug")));
    }
    return h("main", { klasse: "smal eind" },
      fokusMarkeer(h("h1", { tabindex: "-1" }, "Beoordeling episode " + epNr), "kop"),
      opslagBalk(),
      app.opslagFout ? h("p", { klasse: "waarschuwing", role: "alert" }, app.opslagFout) : null,
      gespeeld.length || weg.length ? h("section", { klasse: "kaartvlak downsides", "aria-labelledby": "ds-kop" },
        h("h2", { id: "ds-kop" }, "Wat je keuzes kosten"),
        downsideLijst("Gespeelde kaarten", gespeeld), downsideLijst("Niet gespeelde kaarten", weg)) : null,
      kern,
      h("p", { klasse: "uitleg", id: "legedagen" }, "Dagen zonder actie: " + legeDagenTekst()),
      meldingView(),
      app.testmodus ? h("p", { klasse: "waarschuwing", id: "testmodus-melding" }, "Testmodus: deze poging telt niet mee als meting.") : null,
      h("p", { klasse: "onderknoppen" }, exportKnop())
    );
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
    isDoelkaart: isDoelkaart, optiesVoor: optiesVoor, regelTitel: regelTitel, naSpelenTekst: naSpelenTekst,
    dagenModel: dagenModel, patientVelden: patientVelden, evaluatieModel: evaluatieModel, raadpleegModel: raadpleegModel,
    aanhoudendTekst: aanhoudendTekst, opslagMelding: opslagMelding, actieDots: actieDots, doelLabel: doelLabel,
    nadeelTekst: nadeelTekst, anderenZin: anderenZin, effectVoor: effectVoor, enigDoel: enigDoel, rondleiding: function () { return RONDLEIDING.slice(); }, gespeeldeKaarten: gespeeldeKaarten,
    _opslag: undefined,                               // alleen voor tests
    _rng: null,                                       // alleen voor tests: vaste toevalsbron voor de volgorde van opties
    _toestand: function () { return app; }            // alleen voor tests
  };
  g.UI = UI;

  if (typeof document !== "undefined" && document && document.getElementById) {
    var opstart = function () { start(document.getElementById("app")); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", opstart);
    else opstart();
  }
})(typeof window !== "undefined" ? window : globalThis);

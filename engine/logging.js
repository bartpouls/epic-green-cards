// Logging en export (stuk S10). Global: window.Logging. Klassiek script, geen modules, geen netwerk.
//
// Per poging wordt bewaard (bouwopdracht 5, contract 6):
//   { pseudoniem, casusId, episodeId, pogingnummer, eerstePoging, tijdlijn, onthuld,
//     geschonden: [ids], score, profiel, tijdstempel }
// - pogingnummer en eerstePoging worden HIER bepaald (niet door de aanroeper): het pogingnummer is het aantal
//   al bewaarde pogingen van dezelfde pseudoniem + casus + episode, plus 1. Alleen pogingnummer 1 is de
//   "eerste poging". Pseudoniem, casus en episode worden daarvoor genormaliseerd vergeleken (hoofdletters,
//   spaties aan de rand en Unicode-samenstelling tellen niet): "ABC", "abc" en " abc " zijn één student. De
//   oorspronkelijke schrijfwijze (alleen getrimd) blijft in de export staan. Een leeg pseudoniem geeft een
//   Nederlandse foutmelding (de UI moet dus een pseudoniem afdwingen).
// - Kapotte elementen in de opslag (bv. null of een getal) worden genegeerd.
// - Let op Excel: een pseudoniem met voorloopnullen (007) wordt daar het getal 7; het JSON-bestand is leidend.
// - Opslag: localStorage (sleutel "egc.logging.v1") in try/catch; bij ontbreken of fout val terug op geheugen.
// - Opslagstatus (voor de UI, S9): Logging.opslagStatus() geeft
//     { bewaard: bool, opslagBeschikbaar: bool, totaal: n, inGeheugenOnly: n }
//   bewaard=false betekent dat n pogingen alleen in dit tabblad staan en verdwijnen bij sluiten/herladen. De UI
//   moet dan melden: "Resultaten staan alleen in dit tabblad: exporteer nu." Het spel blijft gewoon werken.
// - Export is bestand tegen kapotte velden in opgeslagen records (geschonden/tijdlijn/onthuld geen array,
//   pogingnummer ontbreekt): zo'n veld wordt een lege cel, de export crasht niet.
//
// CSV-keuzes (gedocumenteerd):
// - scheidingsteken ";" (Nederlandse Excel verwacht dit), regeleinde CRLF, UTF-8 met BOM zodat Excel
//   tekens als "ë" goed toont.
// - cellen met ; " of regeleinde staan tussen aanhalingstekens, " wordt "".
// - een pseudoniem dat begint met = + - @ (of tab/CR) krijgt een voorloop-' zodat Excel het niet als formule
//   uitvoert; het JSON-bestand bevat altijd de ongewijzigde waarde.
// - eerstePoging in de CSV is "ja" of "nee"; in JSON true/false.
// - tijdlijn en onthuld staan als JSON-tekst in één cel.
(function (g) {
  "use strict";

  var SLEUTEL = "egc.logging.v1";
  var SCHEIDER = ";";
  var BOM = "﻿";
  // Kolommen van de CSV voor onderzoek (één regel per poging, Nederlandse koppen). Het JSON-bestand bevat het volledige detail.
  var KOLOMMEN = ["pseudoniem", "episode", "poging", "eerste poging", "testmodus", "casusversie", "speltijdstip",
    "tijdlijn", "gebeurtenissen", "onthulde gegevens", "poort gehaald", "geschonden regels", "getoonde vraag",
    "score duurzaamheid", "score doelmatigheid", "profiel", "reflectievraag",
    "labwaarden vóór voorschrijfkaart", "eerdere kweken vóór eerste keuze", "dagen zonder actie", "aantal dagen", "aantal kaarten"];

  var geheugen = [];
  var laatsteSchrijfOk = true;
  var opslagOverride; // undefined = gebruik window.localStorage; null = geen opslag; object = nepopslag

  function opslag() {
    if (opslagOverride !== undefined) return opslagOverride;
    try { return (g.localStorage && typeof g.localStorage.getItem === "function") ? g.localStorage : null; }
    catch (e) { return null; }
  }

  function kopie(x) {
    if (x === undefined) return null;
    try { return JSON.parse(JSON.stringify(x)); } catch (e) { return null; }
  }

  function leesOpslag() {
    // geeft array of null als opslag onbruikbaar is
    try {
      var o = opslag();
      if (!o) return null;
      var ruw = o.getItem(SLEUTEL);
      if (ruw === null || ruw === undefined || ruw === "") return [];
      var lijst = JSON.parse(ruw);
      return Array.isArray(lijst) ? alleenObjecten(lijst) : null;
    } catch (e) { return null; }
  }

  // Kapotte elementen (null, getallen, tekst) in de opslag worden genegeerd, zodat bewaar/export nooit crasht.
  function alleenObjecten(lijst) {
    return lijst.filter(function (p) { return p !== null && typeof p === "object" && !Array.isArray(p); });
  }

  // Genormaliseerde sleutel voor "dezelfde student/casus/episode": hoofdletters, spaties en
  // Unicode-samenstelling (NFC) maken geen verschil. De oorspronkelijke schrijfwijze blijft bewaard.
  function sleutelVan(s) {
    var t = schoon(s);
    try { t = t.normalize("NFC"); } catch (e) { /* oude omgeving */ }
    return t.toLowerCase();
  }

  function schrijfOpslag(lijst) {
    try {
      var o = opslag();
      if (!o) return false;
      o.setItem(SLEUTEL, JSON.stringify(lijst));
      return true;
    } catch (e) { return false; }
  }

  function alle() {
    var uitOpslag = leesOpslag();
    var bron = (uitOpslag && uitOpslag.length >= geheugen.length) ? uitOpslag : geheugen;
    return alleenObjecten(kopie(bron) || []);
  }

  function schoon(s) { return (s === undefined || s === null) ? "" : String(s).trim(); }

  function bewaar(poging) {
    if (!poging || typeof poging !== "object") throw new Error("Er is geen poging om te bewaren.");
    var lijst = alle();
    var pseudoniem = schoon(poging.pseudoniem);
    var casusId = schoon(poging.casusId);
    var episodeId = schoon(poging.episodeId);
    if (pseudoniem === "") throw new Error("Vul eerst een pseudoniem in; zonder pseudoniem kan de poging niet worden bewaard.");
    var sleutel = [sleutelVan(pseudoniem), sleutelVan(casusId), sleutelVan(episodeId)];
    // Testmodus (Bart): pogingen in testmodus tellen niet mee als meting. Ze krijgen een eigen telling en zijn nooit de eerste poging;
    // echte pogingen tellen alleen echte pogingen.
    var testmodus = !!poging.testmodus;
    var eerder = lijst.filter(function (p) {
      return sleutelVan(p.pseudoniem) === sleutel[0] && sleutelVan(p.casusId) === sleutel[1] &&
        sleutelVan(p.episodeId) === sleutel[2] && !!p.testmodus === testmodus;
    }).length;
    var rec = {
      pseudoniem: pseudoniem,
      casusId: casusId,
      episodeId: episodeId,
      pogingnummer: eerder + 1,
      eerstePoging: !testmodus && eerder === 0,
      testmodus: testmodus,
      casusVersie: poging.casusVersie || null,
      tijdlijnTekst: typeof poging.tijdlijnTekst === "string" ? poging.tijdlijnTekst : "",
      gebeurtenissen: Array.isArray(poging.gebeurtenissen) ? kopie(poging.gebeurtenissen) : [],
      onthuldTekst: typeof poging.onthuldTekst === "string" ? poging.onthuldTekst : "",
      poortGehaald: typeof poging.poortGehaald === "boolean" ? poging.poortGehaald : null,
      geschondenDetail: Array.isArray(poging.geschondenDetail) ? kopie(poging.geschondenDetail) : [],
      vraag: poging.vraag || null,
      reflectievraag: poging.reflectievraag || null,
      afgeleid: poging.afgeleid && typeof poging.afgeleid === "object" ? kopie(poging.afgeleid) : {},
      dagen: typeof poging.dagen === "number" ? poging.dagen : null,
      tijdlijn: kopie(poging.tijdlijn) || [],
      onthuld: kopie(poging.onthuld) || [],
      geschonden: (Array.isArray(poging.geschonden) ? poging.geschonden : []).map(function (x) {
        return (x && typeof x === "object") ? x.id : x;
      }),
      score: kopie(poging.score),
      profiel: kopie(poging.profiel),
      tijdstempel: poging.tijdstempel || new Date().toISOString()
    };
    lijst.push(rec);
    geheugen = kopie(lijst);
    laatsteSchrijfOk = schrijfOpslag(lijst);
    return kopie(rec);
  }

  /* ---------- verrijking: alles in woorden, uit de data van de casus (geen casuslogica in deze laag) ---------- */
  function casusVan(state) {
    if (state && state._casus) return state._casus;
    var l = g.CASUSSEN || [];
    for (var i = 0; i < l.length; i++) if (l[i] && state && l[i].id === state.casusId) return l[i];
    return null;
  }
  function labelVan(casus, ep, id) {
    var k = (casus.kaarten || []).filter(function (x) { return x.id === id; })[0];
    if (k) return k.label;
    var m = ((ep && ep.patient && ep.patient.medicatie) || []).filter(function (x) { return x.id === id; })[0];
    return m ? m.label : String(id);
  }
  function verrijk(state, uitkomst) {
    var uit = { casusVersie: null, tijdlijnTekst: "", gebeurtenissen: [], onthuldTekst: "", poortGehaald: null, geschondenDetail: [],
      vraag: null, reflectievraag: null, afgeleid: {}, dagen: null };
    try {
      if (uitkomst && typeof uitkomst.poortGehaald === "boolean") uit.poortGehaald = uitkomst.poortGehaald;
      uit.vraag = (uitkomst && uitkomst.vraag) || null;
      uit.reflectievraag = (uitkomst && uitkomst.profiel && uitkomst.profiel.reflectievraag) || null;
      uit.geschondenDetail = ((uitkomst && uitkomst.geschonden) || []).map(function (x) {
        return { id: x.id, naam: x.naam || null, onderdelen: Array.isArray(x.onderdelen) ? x.onderdelen.slice() : [] };
      });
      uit.dagen = typeof state.dag === "number" ? state.dag : null;
      var c = casusVan(state);
      if (!c) return uit;
      uit.casusVersie = c.versie || null;
      var ep = (c.episodes || []).filter(function (e) { return e.id === state.episodeId; })[0];
      uit.tijdlijnTekst = (Array.isArray(state.tijdlijn) ? state.tijdlijn : []).slice().sort(function (a, b) { return (a.volg || 0) - (b.volg || 0); }).map(function (r) {
        var t = "Dag " + r.dag + ": " + labelVan(c, ep, r.kaart);
        if (r.doel) t += " → " + labelVan(c, ep, r.doel);
        if (r.optie) t += " (" + r.optie + ")";
        return t;
      }).join("; ");
      uit.gebeurtenissen = (Array.isArray(state.gebeurtenissen) ? state.gebeurtenissen : []).map(function (x) {
        var d = ep && (ep.gebeurtenissen || []).filter(function (e) { return e.id === x.id; })[0];
        return { id: x.id, titel: (d && d.titel) || x.id, dag: x.dag };
      });
      uit.onthuldTekst = (Array.isArray(state.onthuld) ? state.onthuld : []).map(function (o) {
        return "Dag " + o.dag + ": " + labelVan(c, ep, o.kaart) + ": " + o.tekst;
      }).join("; ");
      if (g.Predicaten && ep) {
        var ctx = g.Predicaten.maakContext(c, ep, state);
        (c.maten || []).forEach(function (m) {
          if (m && m.episode === state.episodeId) uit.afgeleid[m.id] = g.Predicaten.evalueer(m.als, ctx) ? "ja" : "nee";
        });
      }
      if (g.Engine && typeof g.Engine.legeDagen === "function") uit.afgeleid.dagenZonderActie = g.Engine.legeDagen(state);
    } catch (e) { /* de verrijking mag het bewaren nooit stoppen */ }
    return uit;
  }

  // Bouwt een poging uit spelstaat + uitkomst van Evaluatie.beoordeel / Engine.rondAf.
  function maakPoging(state, uitkomst, pseudoniem) {
    state = state || {};
    uitkomst = uitkomst || {};
    var extra = verrijk(state, uitkomst);
    return {
      casusVersie: extra.casusVersie, tijdlijnTekst: extra.tijdlijnTekst, gebeurtenissen: extra.gebeurtenissen, onthuldTekst: extra.onthuldTekst,
      poortGehaald: extra.poortGehaald, geschondenDetail: extra.geschondenDetail, vraag: extra.vraag, reflectievraag: extra.reflectievraag,
      afgeleid: extra.afgeleid, dagen: extra.dagen,
      pseudoniem: pseudoniem,
      casusId: state.casusId,
      episodeId: state.episodeId,
      tijdlijn: state.tijdlijn,
      onthuld: state.onthuld,
      geschonden: uitkomst.geschonden,
      score: uitkomst.score,
      profiel: uitkomst.profiel
    };
  }

  function bewaarUitSpel(state, uitkomst, pseudoniem, opties) {
    var poging = maakPoging(state, uitkomst, pseudoniem);
    poging.testmodus = !!(opties && opties.testmodus);
    return bewaar(poging);
  }

  // Voor de UI: staat alles echt in de opslag? Zo niet, hoeveel pogingen staan alleen in het geheugen.
  function opslagStatus() {
    var uit = leesOpslag();
    var beschikbaar = uit !== null;
    var inOpslag = beschikbaar ? uit.length : 0;
    var totaal = alle().length;
    var alleenGeheugen = Math.max(0, totaal - inOpslag);
    return { bewaard: alleenGeheugen === 0 && (totaal === 0 || laatsteSchrijfOk), opslagBeschikbaar: beschikbaar,
      totaal: totaal, inGeheugenOnly: alleenGeheugen };
  }

  function wis() {
    geheugen = [];
    laatsteSchrijfOk = true;
    try { var o = opslag(); if (o && typeof o.removeItem === "function") o.removeItem(SLEUTEL); } catch (e) { /* geen opslag */ }
  }

  // ---------- CSV ----------
  function cel(waarde) {
    var s = (waarde === undefined || waarde === null) ? "" : String(waarde);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    if (/[;"\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  // Tijdlijn/onthuld zijn JSON en beginnen met [ of { ; geen formule-bescherming nodig, wel escapen.
  function celJson(waarde) {
    var s = JSON.stringify(waarde === undefined ? null : waarde);
    if (/[;"\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function celTekst(waarde) { // uit data; wel escapen en formule-bescherming
    return cel(waarde);
  }

  function jaNee(w) { return w === true ? "ja" : (w === false ? "nee" : ""); }
  // "I7 Trimethoprim: kalium en halveren (kalium)"; zonder detail alleen de id's.
  function geschondenTekst(p) {
    var d = Array.isArray(p.geschondenDetail) ? p.geschondenDetail : [];
    if (!d.length) return Array.isArray(p.geschonden) ? p.geschonden.join(", ") : "";
    return d.map(function (x) {
      var t = x && x.id ? String(x.id) : "";
      if (x && x.naam) t += " " + x.naam;
      if (x && Array.isArray(x.onderdelen) && x.onderdelen.length) t += " (" + x.onderdelen.join(", ") + ")";
      return t;
    }).join("; ");
  }
  function gebeurtenisTekst(p) {
    return (Array.isArray(p.gebeurtenissen) ? p.gebeurtenissen : []).map(function (x) { return (x && (x.titel || x.id)) + " (dag " + (x && x.dag) + ")"; }).join("; ");
  }

  function exportCSV() {
    var regels = [KOLOMMEN.join(SCHEIDER)];
    alle().forEach(function (p) {
      var sc = (p.score && typeof p.score === "object") ? p.score : {};
      var tl = Array.isArray(p.tijdlijn) ? p.tijdlijn : [];
      var af = (p.afgeleid && typeof p.afgeleid === "object") ? p.afgeleid : {};
      var gehaald = typeof p.poortGehaald === "boolean" ? p.poortGehaald : (Array.isArray(p.geschonden) ? p.geschonden.length === 0 : null);
      var ref = p.reflectievraag || (p.profiel && typeof p.profiel === "object" && p.profiel.reflectievraag) || "";
      regels.push([
        celTekst(p.pseudoniem),
        celTekst(p.episodeId),
        (typeof p.pogingnummer === "number" ? String(p.pogingnummer) : ""),
        p.eerstePoging ? "ja" : "nee",
        p.testmodus ? "ja" : "nee",
        celTekst(p.casusVersie),
        celTekst(p.tijdstempel),
        celTekst(p.tijdlijnTekst),
        celTekst(gebeurtenisTekst(p)),
        celTekst(p.onthuldTekst),
        jaNee(gehaald),
        celTekst(geschondenTekst(p)),
        celTekst(p.vraag),
        (sc.duurzaamheid === undefined || sc.duurzaamheid === null) ? "" : String(sc.duurzaamheid),
        (sc.doelmatigheid === undefined || sc.doelmatigheid === null) ? "" : String(sc.doelmatigheid),
        celTekst(p.profiel && typeof p.profiel === "object" && p.profiel.naam ? p.profiel.naam : ""),
        celTekst(ref),
        celTekst(af.labVoorVoorschrijf),
        celTekst(af.kweekenVoorKeuze),
        (typeof af.dagenZonderActie === "number" ? String(af.dagenZonderActie) : ""),
        (typeof p.dagen === "number" ? String(p.dagen) : ""),
        String(tl.length)
      ].join(SCHEIDER));
    });
    return BOM + regels.join("\r\n") + "\r\n";
  }

  function exportJSON() {
    return JSON.stringify(alle(), null, 2);
  }

  // ---------- Download (Blob) ----------
  // omgeving mag worden meegegeven voor tests: { document, Blob, URL }
  function download(bestandsnaam, inhoud, mime, omgeving) {
    try {
      omgeving = omgeving || {};
      // Een meegegeven sleutel (ook null) wordt gerespecteerd; alleen een ontbrekende sleutel valt terug op de globals.
      var doc = ("document" in omgeving) ? omgeving.document : g.document;
      var BlobK = ("Blob" in omgeving) ? omgeving.Blob : g.Blob;
      var urlK = ("URL" in omgeving) ? omgeving.URL : g.URL;
      if (!doc || !BlobK || !urlK || typeof urlK.createObjectURL !== "function") return false;
      var blob = new BlobK([inhoud], { type: mime || "application/octet-stream" });
      var url = urlK.createObjectURL(blob);
      var a = doc.createElement("a");
      a.href = url;
      a.download = bestandsnaam;
      if (a.style) a.style.display = "none";
      var parent = doc.body || doc.documentElement;
      if (parent && typeof parent.appendChild === "function") parent.appendChild(a);
      a.click();
      if (parent && typeof parent.removeChild === "function") { try { parent.removeChild(a); } catch (e) { /* al weg */ } }
      var opruim = omgeving.setTimeout || g.setTimeout;
      if (typeof urlK.revokeObjectURL === "function") {
        if (typeof opruim === "function") opruim(function () { urlK.revokeObjectURL(url); }, 1000);
        else urlK.revokeObjectURL(url);
      }
      return true;
    } catch (e) { return false; }
  }

  function datumTekst(d) {
    function t(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + t(d.getMonth() + 1) + "-" + t(d.getDate()) + "_" + t(d.getHours()) + t(d.getMinutes());
  }

  // Voor de knop "Exporteer resultaten": downloadt CSV én JSON. Geeft { csv: bool, json: bool }.
  function downloadAlles(omgeving) {
    var stempel = datumTekst(new Date());
    return {
      csv: download("resultaten_" + stempel + ".csv", exportCSV(), "text/csv;charset=utf-8", omgeving),
      json: download("resultaten_" + stempel + ".json", exportJSON(), "application/json;charset=utf-8", omgeving)
    };
  }

  g.Logging = {
    SLEUTEL: SLEUTEL,
    SCHEIDER: SCHEIDER,
    KOLOMMEN: KOLOMMEN.slice(),
    bewaar: bewaar,
    bewaarUitSpel: bewaarUitSpel,
    maakPoging: maakPoging,
    alle: alle,
    wis: wis,
    opslagStatus: opslagStatus,
    exportCSV: exportCSV,
    exportJSON: exportJSON,
    download: download,
    downloadAlles: downloadAlles,
    // alleen voor tests: undefined = standaard localStorage, null = geen opslag, object = nepopslag
    _zetOpslag: function (o) { opslagOverride = o; geheugen = []; }
  };
})(typeof window !== "undefined" ? window : globalThis);

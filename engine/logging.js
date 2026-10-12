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
  var KOLOMMEN = ["pseudoniem", "casusId", "episodeId", "pogingnummer", "eerstePoging", "tijdstempel",
    "geschonden", "scoreDuurzaamheid", "scoreDoelmatigheid", "profiel", "aantalKaarten", "tijdlijn", "onthuld"];

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

  // Bouwt een poging uit spelstaat + uitkomst van Evaluatie.beoordeel / Engine.rondAf.
  function maakPoging(state, uitkomst, pseudoniem) {
    state = state || {};
    uitkomst = uitkomst || {};
    return {
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

  function exportCSV() {
    var regels = [KOLOMMEN.join(SCHEIDER)];
    alle().forEach(function (p) {
      var sc = (p.score && typeof p.score === "object") ? p.score : {};
      var tl = Array.isArray(p.tijdlijn) ? p.tijdlijn : [];
      var onth = Array.isArray(p.onthuld) ? p.onthuld : [];
      regels.push([
        celTekst(p.pseudoniem),
        celTekst(p.casusId),
        celTekst(p.episodeId),
        (typeof p.pogingnummer === "number" ? String(p.pogingnummer) : ""),
        p.eerstePoging ? "ja" : "nee",
        celTekst(p.tijdstempel),
        celTekst(Array.isArray(p.geschonden) ? p.geschonden.join(", ") : ""),
        (sc.duurzaamheid === undefined || sc.duurzaamheid === null) ? "" : String(sc.duurzaamheid),
        (sc.doelmatigheid === undefined || sc.doelmatigheid === null) ? "" : String(sc.doelmatigheid),
        celTekst(p.profiel && typeof p.profiel === "object" && p.profiel.naam ? p.profiel.naam : ""),
        String(tl.length),
        celJson(tl),
        celJson(onth)
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

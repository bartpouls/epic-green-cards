/* Poort, score en profiel (window.Evaluatie). Klassiek script, geen modules.
   Leest invarianten, scoreregels, profielen, feedback en werkzaamheid uit de data van de episode en rekent alles uit
   met window.Predicaten over de tijdlijn en de spelstand (ctx). In deze code staan GEEN kaart-id's, middelnamen,
   toestandsnamen of klinische drempels; de enige vaste getallen zijn de schaal van de score (1-3, contract 5) en de
   standaardwaarden hieronder.

   API (contract 5):
     Evaluatie.beoordeel(casus, episodeId, state) -> { geschonden, poortGehaald, downsides, vraag, gevolg, gevolgen, score, profiel,
                                                       extraVragen, zichtbaar, afloop, einde, aftrek }
       gevolgen: [ { invariant, tekst } ]  de gevolgzinnen van ALLE geschonden regels die er een hebben, ernstigste eerst (besluit Bart,
                                           14 november 2026); gevolg blijft de (eerste) zin van de ernstigste geschonden regel (of null).
                                           Een regel mag meer dan één zin hebben (elk met een eigen voorwaarde); ze komen in datavolgorde.
       profiel:  { naam, reflectievraag } van de eerste profielregel die past; past er geen en heeft de casus een `restprofiel`
                 ({ naam, reflectievraag }), dan dat, met rest: true (besluit Bart, 15 november 2026). Zonder restprofiel: null.
       aftrek:   [ { as, naam, delta, kaart, doel, tekst } ]  de delta-regels met `kaarten` die deze poging raakten (alleen bij een gehaalde
                 poort); `tekst` is de opmerking die ook in extraVragen staat (soort "opmerking"), of null zonder opmerkingstekst in de data.
       afloop:   "gehaald" | "nietGehaald" | "verloren". "verloren" = de episode is beëindigd door een gebeurtenis met
                 einde: { uitkomst: "verloren", tekst } in de data; dan is poortGehaald false en zijn score en profiel null.
       einde:    null, of { gebeurtenis, uitkomst, tekst } van die gebeurtenis.
     Evaluatie.valideerCasus(casus)                -> controleert ALLE predicaten van ALLE episodes (Predicaten.valideer) en de vorm
                                                      van de regels eromheen; gooit een Error met alle fouten, geeft anders { episodes, predicaten }.

   Afspraken (waar het contract open laat):
     - Een fout in de data (kapot predicaat, onbekende teller, ongeldige vorm) wordt NOOIT stil onwaar: beoordeel gooit een Error
       met Nederlandse tekst en de plek ("Episode E3, invariant I5, predicaat: ..."). Alle predicaten van de episode worden bij elke
       beoordeling gevalideerd, ook die van een niet-geldende invariant, een niet bereikte scoreregel of een niet gekozen vraag.
     - geldtIn: lijst met "*" (altijd), een toestandsnaam (staat in state.toestanden), of { gebeurtenis: id } (staat in state.gebeurtenissen).
     - Schendingen worden bepaald op de EINDSTAND van de tijdlijn (eisen die bij afronden nog niet vervuld zijn, tellen als geschonden;
       dat volgt uit de predicaten zelf). Gebeurtenissen die nog "in de wacht" staan (nog niet als banner verschenen) tellen niet mee.
     - vraagVarianten: [ { als, vraag } ]; de eerste variant waarvan 'als' waar is wint, anders invariant.vraag.
     - weglaatDownside (op een invariant): kaart-id of lijst van kaart-id's. Is de invariant geschonden en is zo'n kaart niet gespeeld, dan
       komt de downside van die kaart in downsides met soort "weggelaten".
     - downside: tekst, of object per episode { E1: "..." } (ontbrekende episode = geen downside); { alle: "..." } geldt voor elke episode.
     - Score per as: start (optioneel), regels [ { als, punten } (eerste match wint, vervangt start) | { als, delta } | { perKeer: <teller>, delta } ].
       Daarna tellen alle delta-regels erbij op; het resultaat wordt geklemd op as.min..as.max (standaard 1..3). Zonder start en zonder
       matchende punten-regel is er geen score voor die as (null), net als zonder score-as in de data.
     - Delta-regel met `kaarten` (lijst kaartverwijzingen K) op een as met `opmerkingBijAftrek` (tekst): raakt de regel bij een gehaalde
       poort, dan komt er één opmerking in extraVragen: die tekst, een spatie en het label van de eerste gespeelde kaart die bij `kaarten`
       past (met het doel tussen haakjes als de regel een doel heeft). Labels komen uit de data (kaarten, medicatie van de episode).
     - Profiel: de eerste profielregel waarvan 'als' waar is; geen match = casus.restprofiel als dat er is, anders null
       (reflectievraag mag null zijn).
     - feedbackExtra: { trigger, vraag, wanneer: "altijd" | "alleenBijGehaaldePoort", soort? }. zichtbaarAlsOntbreekt: { trigger, tekst } (altijd).
       'soort' (bv. "opmerking") gaat ongewijzigd mee in extraVragen, zodat de weergave een opmerking van een vraag kan onderscheiden.
     - gevolgzinnen (casus): { episode, invariant, tekst, vrijgegeven, als? }. Alleen een vrijgegeven zin telt; met 'als' alleen als dat
       predicaat waar is (zodat een zin niet verschijnt wanneer hij in deze poging niet klopt). Meer zinnen per regel mag.
     - Evaluatie.beoordeel verandert de spelstand niet. Sleutels die met TODO_BART beginnen zijn geen data en worden genegeerd. */
(function evaluatieModule(g) {
  "use strict";

  var HAS = Object.prototype.hasOwnProperty, ISARR = Array.isArray;
  var SCHAAL_MIN = 1, SCHAAL_MAX = 3;                       // contract 5: scores worden geklemd op 1-3
  var WANNEER = ["altijd", "alleenBijGehaaldePoort"];
  var ASSEN = ["duurzaamheid", "doelmatigheid"];            // namen van de score-assen uit het contract (geen casusinhoud)

  function fout(tekst) { throw new Error(tekst); }
  function isObj(x) { return x !== null && typeof x === "object" && !ISARR(x); }
  function isGetal(x) { return typeof x === "number" && isFinite(x); }
  function isTekst(x) { return typeof x === "string" && x !== ""; }
  function lijst(x) { return ISARR(x) ? x : (x === undefined || x === null ? [] : [x]); }
  function heeft(o, k) { return HAS.call(o, k); }
  function kopie(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }
  function P() {
    if (!g.Predicaten) fout("De regeltaal (Predicaten) is niet geladen.");
    return g.Predicaten;
  }
  // Voert fn uit en zet de plek voor elke fout (nooit slikken).
  function metPlek(plek, fn) {
    try { return fn(); }
    catch (e) { throw new Error(plek + ": " + ((e && e.message) || String(e))); }
  }

  function zoekEpisode(casus, episodeId) {
    if (!isObj(casus)) fout("Evaluatie: er is geen casus (object) meegegeven.");
    var eps = casus.episodes;
    if (!ISARR(eps)) fout("Evaluatie: de casus heeft geen lijst 'episodes'.");
    for (var i = 0; i < eps.length; i++) if (eps[i] && eps[i].id === episodeId) return eps[i];
    return fout("Onbekende episode '" + episodeId + "' in de casus.");
  }
  function kaartVan(casus, id) {
    var k = lijst(casus.kaarten);
    for (var i = 0; i < k.length; i++) if (k[i] && k[i].id === id) return k[i];
    return null;
  }

  /* ---------- alle predicaten van een episode (voor validatie) ---------- */
  function verzamel(casus, ep) {
    var uit = [];
    function voeg(plek, pred) { uit.push({ plek: plek, pred: pred }); }
    lijst(ep.invarianten).forEach(function (inv, i) {
      var n = "invariant " + ((inv && inv.id) || ("#" + (i + 1)));
      voeg(n + ", predicaat", inv && inv.predicaat);
      lijst(inv && inv.vraagVarianten).forEach(function (v, j) { voeg(n + ", vraagVarianten[" + j + "].als", v && v.als); });
    });
    ASSEN.forEach(function (as) {
      var a = ep.score && ep.score[as];
      if (!isObj(a)) return;
      lijst(a.regels).forEach(function (r, i) {
        if (!isObj(r)) return;
        var n = "score " + as + ", regel " + (i + 1);
        if (r.perKeer !== undefined) voeg(n + ", perKeer", r.perKeer);
        else voeg(n + ", als", r.als);
        lijst(r.kaarten).forEach(function (K, j) { voeg(n + ", kaarten[" + j + "]", { p: "gespeeld", K: K }); });
      });
    });
    lijst(ep.profielen).forEach(function (p, i) { voeg("profiel " + ((p && p.naam) || ("#" + (i + 1))) + ", als", p && p.als); });
    lijst(ep.feedbackExtra).forEach(function (f, i) { voeg("feedbackExtra[" + i + "], trigger", f && f.trigger); });
    lijst(ep.zichtbaarAlsOntbreekt).forEach(function (z, i) { voeg("zichtbaarAlsOntbreekt[" + i + "], trigger", z && z.trigger); });
    if (isObj(ep.werkzaamheid)) {
      Object.keys(ep.werkzaamheid).forEach(function (t) {
        var w = ep.werkzaamheid[t];
        if (t.indexOf("TODO_BART") === 0 || !isObj(w)) return;
        ["werkzaam", "nietWerkzaam"].forEach(function (soort) {
          lijst(w[soort]).forEach(function (x, i) {
            if (isObj(x) && x.als !== undefined) voeg("werkzaamheid " + t + "." + soort + "[" + i + "], als", x.als);
          });
        });
      });
    }
    lijst(casus.regelnamen).forEach(function (r) {
      if (!isObj(r) || r.episode !== ep.id) return;
      lijst(r.onderdelen).forEach(function (o, i) { voeg("regelnamen " + r.invariant + ", onderdeel " + ((o && o.naam) || i) + ", als", o && o.als); });
    });
    lijst(casus.gevolgzinnen).forEach(function (z, i) {
      if (isObj(z) && z.episode === ep.id && z.als !== undefined) voeg("gevolgzinnen[" + i + "] (" + z.invariant + "), als", z.als);
    });
    lijst(casus.maten).forEach(function (m, i) {
      if (isObj(m) && m.episode === ep.id) voeg("maten " + (m.id || i) + ", als", m.als);
    });
    lijst(casus.kaarten).forEach(function (k) {
      var d = k && isObj(k.doelen) ? k.doelen[ep.id] : null;
      lijst(d).forEach(function (doel, i) {
        if (isObj(doel) && doel.vereist !== undefined) voeg("kaart " + k.id + ", doelen." + ep.id + "[" + i + "].vereist", doel.vereist);
      });
    });
    return uit;
  }

  /* ---------- vorm van de regels rondom de predicaten ---------- */
  function toestandenVan(ep) {
    var set = {}, n = 0;
    lijst(ep.startToestanden).forEach(function (t) { set[t] = true; n++; });
    lijst(ep.gebeurtenissen).forEach(function (e) { if (e) lijst(e.toestand).forEach(function (t) { set[t] = true; n++; }); });
    return n ? set : null;     // geen bekende toestanden: niet te controleren
  }
  function valideerStructuur(casus, ep) {
    var plek = "Episode " + ep.id;
    var toestanden = toestandenVan(ep);
    var gebIds = lijst(ep.gebeurtenissen).map(function (e) { return e && e.id; });
    lijst(ep.invarianten).forEach(function (inv, i) {
      var n = plek + ", invariant " + ((inv && inv.id) || ("#" + (i + 1)));
      if (!isObj(inv)) fout(n + ": een invariant moet een object zijn.");
      if (!isTekst(inv.id)) fout(n + ": mist 'id'.");
      if (!isGetal(inv.ernst)) fout(n + ": 'ernst' moet een getal zijn (1 = ernstigst).");
      if (!isTekst(inv.vraag)) fout(n + ": mist de Socratische 'vraag'.");
      if (!ISARR(inv.geldtIn) || !inv.geldtIn.length) fout(n + ": 'geldtIn' moet een lijst zijn met \"*\", toestandsnamen of { gebeurtenis: id }.");
      inv.geldtIn.forEach(function (x) {
        if (x === "*") return;
        if (isTekst(x)) {
          if (toestanden && !heeft(toestanden, x)) fout(n + ": geldtIn noemt de onbekende toestand '" + x + "' (niet in startToestanden of in een gebeurtenis).");
          return;
        }
        if (isObj(x) && isTekst(x.gebeurtenis) && Object.keys(x).filter(function (s) { return s.indexOf("TODO_BART") !== 0; }).length === 1) {
          if (gebIds.length && gebIds.indexOf(x.gebeurtenis) < 0) fout(n + ": geldtIn noemt de onbekende gebeurtenis '" + x.gebeurtenis + "'.");
          return;
        }
        fout(n + ": ongeldig element in geldtIn: " + JSON.stringify(x) + ".");
      });
      if (inv.vraagVarianten !== undefined) {
        if (!ISARR(inv.vraagVarianten)) fout(n + ": 'vraagVarianten' moet een lijst zijn.");
        inv.vraagVarianten.forEach(function (v, j) {
          if (!isObj(v) || !isTekst(v.vraag)) fout(n + ": vraagVarianten[" + j + "] moet { als, vraag } zijn.");
        });
      }
      if (inv.weglaatDownside !== undefined) {
        lijst(inv.weglaatDownside).forEach(function (kid) {
          if (!isTekst(kid) || !kaartVan(casus, kid)) fout(n + ": weglaatDownside verwijst naar een onbekende kaart " + JSON.stringify(kid) + ".");
        });
      }
    });
    ASSEN.forEach(function (as) {
      var a = ep.score && ep.score[as];
      if (a === undefined || a === null) return;
      var n = plek + ", score " + as;
      if (!isObj(a)) fout(n + ": moet een object zijn.");
      ["start", "min", "max"].forEach(function (v) { if (a[v] !== undefined && !isGetal(a[v])) fout(n + ": '" + v + "' moet een getal zijn."); });
      if (a.regels !== undefined && !ISARR(a.regels)) fout(n + ": 'regels' moet een lijst zijn.");
      lijst(a.regels).forEach(function (r, i) {
        var rn = n + ", regel " + (i + 1);
        if (!isObj(r)) fout(rn + ": moet een object zijn.");
        var punten = r.punten !== undefined, delta = r.delta !== undefined, per = r.perKeer !== undefined;
        if (per) {
          if (r.als !== undefined || punten || !isGetal(r.delta)) fout(rn + ": een perKeer-regel heeft alleen 'perKeer' en een getal 'delta'.");
        } else if (punten === delta) fout(rn + ": een regel heeft 'als' met precies één van 'punten' of 'delta' (of 'perKeer' met 'delta').");
        else if (r.als === undefined) fout(rn + ": mist 'als'.");
        else if ((punten && !isGetal(r.punten)) || (delta && !isGetal(r.delta))) fout(rn + ": 'punten' en 'delta' moeten getallen zijn.");
        if (r.kaarten !== undefined && (!ISARR(r.kaarten) || !r.kaarten.length || !r.kaarten.every(isObj))) fout(rn + ": 'kaarten' moet een niet-lege lijst kaartverwijzingen zijn.");
        if (r.naam !== undefined && !isTekst(r.naam)) fout(rn + ": 'naam' moet tekst zijn.");
      });
      if (a.opmerkingBijAftrek !== undefined && !isTekst(a.opmerkingBijAftrek)) fout(n + ": 'opmerkingBijAftrek' moet tekst zijn.");
    });
    lijst(ep.profielen).forEach(function (p, i) {
      if (!isObj(p) || !isTekst(p.naam)) fout(plek + ", profielen[" + i + "]: mist 'naam'.");
      if (p.reflectievraag !== undefined && p.reflectievraag !== null && typeof p.reflectievraag !== "string") fout(plek + ", profiel " + p.naam + ": 'reflectievraag' moet tekst of null zijn.");
    });
    if (casus.restprofiel !== undefined && casus.restprofiel !== null) {
      var rp = casus.restprofiel;
      if (!isObj(rp) || !isTekst(rp.naam)) fout("Casus, restprofiel: mist 'naam'.");
      if (rp.reflectievraag !== undefined && rp.reflectievraag !== null && typeof rp.reflectievraag !== "string") fout("Casus, restprofiel: 'reflectievraag' moet tekst of null zijn.");
    }
    lijst(ep.feedbackExtra).forEach(function (f, i) {
      var n = plek + ", feedbackExtra[" + i + "]";
      if (!isObj(f) || !isTekst(f.vraag)) fout(n + ": mist 'vraag'.");
      if (WANNEER.indexOf(f.wanneer) < 0) fout(n + ": 'wanneer' moet " + WANNEER.map(function (w) { return '"' + w + '"'; }).join(" of ") + " zijn (kreeg " + JSON.stringify(f.wanneer) + ").");
    });
    lijst(ep.zichtbaarAlsOntbreekt).forEach(function (z, i) {
      if (!isObj(z) || !isTekst(z.tekst)) fout(plek + ", zichtbaarAlsOntbreekt[" + i + "]: mist 'tekst'.");
    });
    lijst(ep.gebeurtenissen).forEach(function (e, i) {
      if (!isObj(e) || e.einde === undefined) return;
      var n = plek + ", gebeurtenis " + (e.id || ("#" + (i + 1)));
      if (!isObj(e.einde) || !isTekst(e.einde.uitkomst) || !isTekst(e.einde.tekst)) fout(n + ": 'einde' moet { uitkomst, tekst } zijn.");
    });
  }

  /* ---------- hulpfuncties voor beoordeel ---------- */
  function geldt(inv, ctx) {
    return inv.geldtIn.some(function (x) {
      if (x === "*") return true;
      if (typeof x === "string") return ctx.toestanden.indexOf(x) >= 0;
      return ctx.gebeurtenissen.some(function (ge) { return ge && ge.id === x.gebeurtenis; });
    });
  }
  function kiesVraag(inv, ctx, plek) {
    var vs = lijst(inv.vraagVarianten);
    for (var i = 0; i < vs.length; i++) {
      if (metPlek(plek + ", vraagVarianten[" + i + "].als", function () { return P().evalueer(vs[i].als, ctx); })) return vs[i].vraag;
    }
    return inv.vraag;
  }
  // downside van een kaart voor deze episode: tekst, of null als de kaart voor deze episode geen downside heeft.
  function downsideVoor(kaart, episodeId) {
    var d = kaart.downside;
    if (d === undefined || d === null) return null;
    if (typeof d === "string") return d === "" ? null : d;
    if (isObj(d)) {
      var t = heeft(d, episodeId) ? d[episodeId] : (heeft(d, "alle") ? d.alle : null);
      if (t === null || t === undefined || t === "") return null;
      if (typeof t !== "string") fout("Kaart " + kaart.id + ": de downside voor " + episodeId + " moet tekst zijn.");
      return t;
    }
    return fout("Kaart " + kaart.id + ": 'downside' moet tekst of een object per episode zijn.");
  }
  // Gevolgzinnen bij een invariant: casus.gevolgzinnen = [ { episode, invariant, tekst, vrijgegeven, als? } ]. Alleen een vrijgegeven zin
  // (vrijgegeven: true) wordt getoond, en met 'als' alleen wanneer dat predicaat in deze poging waar is. Geeft de teksten in datavolgorde.
  function gevolgenVan(casus, ep, inv, ctx, plek) {
    var l = lijst(casus.gevolgzinnen), uit = [];
    for (var i = 0; i < l.length; i++) {
      var z = l[i];
      if (!isObj(z) || z.episode !== ep.id || z.invariant !== inv.id) continue;
      if (z.vrijgegeven !== true || !isTekst(z.tekst)) continue;
      if (z.als !== undefined && !metPlek(plek + ", gevolgzinnen[" + i + "], als", (function (zin) { return function () { return P().evalueer(zin.als, ctx); }; })(z))) continue;
      if (uit.indexOf(z.tekst) < 0) uit.push(z.tekst);
    }
    return uit;
  }
  // Label van een kaart of van een middel van de patiënt (voor de opmerking bij een overbodige kaart); onbekend id: het id zelf.
  function labelVan(casus, ep, id) {
    var k = kaartVan(casus, id);
    if (k && isTekst(k.label)) return k.label;
    var m = lijst(ep.patient && ep.patient.medicatie).filter(function (x) { return isObj(x) && x.id === id; })[0];
    return m && isTekst(m.label) ? m.label : String(id);
  }
  // Een gebeurtenis die de episode beëindigt (einde: { uitkomst, tekst } in de data) en die in deze poging is geweest; anders null.
  function eindeVan(ep, ctx) {
    var defs = lijst(ep.gebeurtenissen), uit = null;
    lijst(ctx.gebeurtenissen).forEach(function (ge) {
      if (uit || !ge) return;
      defs.forEach(function (d) {
        if (!uit && isObj(d) && d.id === ge.id && isObj(d.einde)) uit = { gebeurtenis: d.id, uitkomst: d.einde.uitkomst, tekst: d.einde.tekst };
      });
    });
    return uit;
  }
  // Korte naam van een regel en de onderdelen (uit casus.regelnamen) die in deze poging niet gehaald zijn.
  function regelNaam(casus, ep, inv, ctx, plek) {
    var l = lijst(casus.regelnamen);
    for (var i = 0; i < l.length; i++) {
      var r = l[i];
      if (!isObj(r) || r.episode !== ep.id || r.invariant !== inv.id) continue;
      var delen = lijst(r.onderdelen).filter(function (o) {
        return metPlek(plek + ", regelnamen " + r.invariant + ", onderdeel " + o.naam, function () { return P().evalueer(o.als, ctx); });
      }).map(function (o) { return o.naam; });
      return { naam: r.naam || null, onderdelen: delen };
    }
    return { naam: null, onderdelen: [] };
  }
  function berekenAs(as, naam, ctx, plek, geraakt) {
    if (!isObj(as)) return null;
    var min = isGetal(as.min) ? as.min : SCHAAL_MIN, max = isGetal(as.max) ? as.max : SCHAAL_MAX;
    var waarde = isGetal(as.start) ? as.start : null, vast = false, regels = lijst(as.regels);
    regels.forEach(function (r, i) {
      if (vast || r.punten === undefined) return;
      var treft = metPlek(plek + ", score " + naam + ", regel " + (i + 1) + ", als", function () { return P().evalueer(r.als, ctx); });
      if (treft) { waarde = r.punten; vast = true; }
    });
    var delta = 0;
    regels.forEach(function (r, i) {
      var n = plek + ", score " + naam + ", regel " + (i + 1);
      if (r.perKeer !== undefined) delta += r.delta * metPlek(n + ", perKeer", function () { return P().tel(r.perKeer, ctx); });
      else if (r.delta !== undefined && metPlek(n + ", als", function () { return P().evalueer(r.als, ctx); })) {
        delta += r.delta;
        if (geraakt && r.kaarten !== undefined) geraakt.push(r);
      }
    });
    if (waarde === null) return null;
    return Math.max(min, Math.min(max, waarde + delta));
  }

  /* ---------- beoordelen ---------- */
  function beoordeel(casus, episodeId, state) {
    var ep = zoekEpisode(casus, episodeId);
    if (!isObj(state)) fout("Evaluatie: er is geen spelstand (state) meegegeven.");
    var plek = "Episode " + ep.id;
    valideerStructuur(casus, ep);
    var ctx = P().maakContext(casus, ep, state);
    verzamel(casus, ep).forEach(function (item) {
      metPlek(plek + ", " + item.plek, function () { P().valideer(item.pred, ctx); });
    });

    // 1. Poort: alle geldende invarianten waarvan het schendingspredicaat waar is, op ernst (1 eerst), bij gelijke ernst in datavolgorde.
    var geschonden = [];
    lijst(ep.invarianten).forEach(function (inv, idx) {
      if (!geldt(inv, ctx)) return;
      var n = plek + ", invariant " + inv.id;
      if (metPlek(n + ", predicaat", function () { return P().evalueer(inv.predicaat, ctx); })) {
        geschonden.push({ inv: inv, idx: idx, vraag: kiesVraag(inv, ctx, n) });
      }
    });
    geschonden.sort(function (a, b) { return (a.inv.ernst - b.inv.ernst) || (a.idx - b.idx); });
    // Een gebeurtenis die de episode beëindigt (bv. uitkomst "verloren"): geen gehaalde poort, geen score, geen profiel.
    var einde = eindeVan(ep, ctx);
    var poortGehaald = geschonden.length === 0 && !einde;

    // 2. Downsides: gespeelde kaarten (eerste keer, in speelvolgorde), daarna weggelaten kaarten waarnaar een geschonden invariant verwijst.
    var downsides = [], gezien = {};
    function voegDownside(kaartId, soort) {
      if (heeft(gezien, kaartId)) return;
      var kaart = kaartVan(casus, kaartId);
      if (!kaart) fout(plek + ": de tijdlijn of weglaatDownside noemt de onbekende kaart '" + kaartId + "'.");
      gezien[kaartId] = true;
      var tekst = downsideVoor(kaart, ep.id);
      if (tekst !== null) downsides.push({ kaart: kaartId, label: kaart.label, tekst: tekst, soort: soort });
    }
    var gespeeld = {};
    lijst(ctx.tijdlijn).slice().sort(function (a, b) { return (a.volg || 0) - (b.volg || 0); }).forEach(function (r) {
      gespeeld[r.kaart] = true;
      voegDownside(r.kaart, "gespeeld");
    });
    geschonden.forEach(function (x) {
      lijst(x.inv.weglaatDownside).forEach(function (kid) { if (!heeft(gespeeld, kid)) voegDownside(kid, "weggelaten"); });
    });

    // 3. Score en profiel alleen bij een gehaalde poort.
    var score = null, profiel = null, aftrek = [];
    if (poortGehaald) {
      score = {};
      ASSEN.forEach(function (as) {
        var a = ep.score && ep.score[as], geraakt = [];
        score[as] = berekenAs(a, as, ctx, plek, geraakt);
        // Delta-regels met `kaarten` die raakten: welke kaart het was, en de opmerking van de as (als die er is).
        geraakt.forEach(function (r) {
          var regel = metPlek(plek + ", score " + as + ", kaarten", function () { return P().eersteRegel(r.kaarten, ctx); });
          if (!regel) return;
          var wat = labelVan(casus, ep, regel.kaart) + (regel.doel !== null ? " (" + labelVan(casus, ep, regel.doel) + ")" : "");
          aftrek.push({ as: as, naam: r.naam || null, delta: r.delta, kaart: regel.kaart, doel: regel.doel,
            tekst: isTekst(a.opmerkingBijAftrek) ? a.opmerkingBijAftrek + " " + wat : null });
        });
      });
      lijst(ep.profielen).some(function (p) {
        if (!metPlek(plek + ", profiel " + p.naam + ", als", function () { return P().evalueer(p.als, ctx); })) return false;
        profiel = { naam: p.naam, reflectievraag: p.reflectievraag === undefined ? null : p.reflectievraag };
        return true;
      });
      // Restprofiel: de poort is gehaald maar geen enkel profiel van de episode past.
      if (!profiel && isObj(casus.restprofiel)) {
        profiel = { naam: casus.restprofiel.naam, reflectievraag: casus.restprofiel.reflectievraag === undefined ? null : casus.restprofiel.reflectievraag, rest: true };
      }
    }

    // 4. Extra feedback en "zichtbaar als een kaart ontbreekt".
    var extraVragen = [];
    lijst(ep.feedbackExtra).forEach(function (f, i) {
      if (f.wanneer === "alleenBijGehaaldePoort" && !poortGehaald) return;
      if (metPlek(plek + ", feedbackExtra[" + i + "], trigger", function () { return P().evalueer(f.trigger, ctx); })) {
        var item = { vraag: f.vraag, wanneer: f.wanneer };
        if (isTekst(f.soort)) item.soort = f.soort;
        extraVragen.push(item);
      }
    });
    aftrek.forEach(function (x) {
      if (x.tekst !== null && !extraVragen.some(function (q) { return q.vraag === x.tekst; })) extraVragen.push({ vraag: x.tekst, wanneer: "alleenBijGehaaldePoort", soort: "opmerking" });
    });
    var zichtbaar = [];
    lijst(ep.zichtbaarAlsOntbreekt).forEach(function (z, i) {
      if (metPlek(plek + ", zichtbaarAlsOntbreekt[" + i + "], trigger", function () { return P().evalueer(z.trigger, ctx); })) zichtbaar.push({ tekst: z.tekst });
    });

    // Gevolgzinnen van alle geschonden regels die er een hebben (ernstigste eerst; dezelfde zin maar één keer).
    var gevolgen = [];
    var eersteGevolg = null;
    geschonden.forEach(function (x, nr) {
      var zinnen = gevolgenVan(casus, ep, x.inv, ctx, plek);
      if (nr === 0 && zinnen.length) eersteGevolg = zinnen[0];
      zinnen.forEach(function (t) {
        if (!gevolgen.some(function (gz) { return gz.tekst === t; })) gevolgen.push({ invariant: x.inv.id, tekst: t });
      });
    });

    return {
      geschonden: geschonden.map(function (x) {
        var rn = regelNaam(casus, ep, x.inv, ctx, plek);
        return { id: x.inv.id, ernst: x.inv.ernst, vraag: x.vraag, naam: rn.naam, onderdelen: rn.onderdelen };
      }),
      poortGehaald: poortGehaald,
      downsides: downsides,
      vraag: geschonden.length ? geschonden[0].vraag : null,
      gevolg: eersteGevolg,
      gevolgen: gevolgen,
      score: score,
      profiel: profiel,
      extraVragen: extraVragen,
      zichtbaar: zichtbaar,
      afloop: einde ? einde.uitkomst : (poortGehaald ? "gehaald" : "nietGehaald"),
      einde: einde,
      aftrek: aftrek
    };
  }

  /* ---------- hele casus valideren ---------- */
  function valideerCasus(casus) {
    if (!isObj(casus)) fout("Evaluatie.valideerCasus: er is geen casus (object) meegegeven.");
    if (!ISARR(casus.episodes)) fout("Evaluatie.valideerCasus: de casus heeft geen lijst 'episodes'.");
    var problemen = [], aantal = 0;
    casus.episodes.forEach(function (ep) {
      if (!isObj(ep)) { problemen.push("Een episode moet een object zijn."); return; }
      try { valideerStructuur(casus, ep); } catch (e) { problemen.push(e.message); }
      verzamel(casus, ep).forEach(function (item) {
        aantal++;
        try { P().valideer(item.pred, casus, ep); }
        catch (e) { problemen.push("Episode " + ep.id + ", " + item.plek + ": " + e.message); }
      });
    });
    if (problemen.length) fout("De casus bevat " + problemen.length + " fout(en) in de regels:\n" + problemen.join("\n"));
    return { episodes: casus.episodes.length, predicaten: aantal };
  }

  g.Evaluatie = { versie: "1.0", beoordeel: beoordeel, valideerCasus: valideerCasus };
  // Alleen voor de tests (niet opsombaar): de volledige broncode van deze module, voor de scan op casuslogica.
  Object.defineProperty(g.Evaluatie, "_bron", { enumerable: false, value: evaluatieModule.toString() });
})(typeof window !== "undefined" ? window : globalThis);

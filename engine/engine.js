/* Spelmotor (window.Engine). Klassiek script, geen modules.
 * Bevat GEEN casuslogica, middelnamen of klinische drempels: alles komt uit de data (casus-object)
 * en uit window.Predicaten / window.Evaluatie (aangeroepen op het moment van gebruik).
 *
 * Afspraken die het contract open laat (zie ook het bouwrapport):
 *  - state.klachten is een array met index = dag (klachten[0] is een lege plaatsvervanger), elk element { dag, status, tekst }.
 *  - Gebeurtenissen worden bij het spelen van de kaart "in de wacht" gezet (state.wachtend) en pas bij Engine.volgendeDag
 *    toegepast: dan krijgen ze dag = nieuwe dag, wordt de toestand gezet en tellen ze mee voor de klachtenstatus van die dag.
 *  - Volgorde van een groep (bv. "AB"): Fisher-Yates met opties.rng; rng() = 0 geeft de datavolgorde, rng() ~ 1 draait om.
 *  - Pogingnummer en "eerste poging" worden NIET door de engine bepaald (dat doet Logging, per pseudoniem); de state bevat ze niet.
 *  - Op de laatste dag zet Engine.volgendeDag state.dagenVoorbij = true (dag blijft aantalDagen); Engine.eindeBereikt is dan waar.
 *  - LEAD-BESLISSING (gebeurtenis op de laatste dag; open vraag voor Bart, TODO_BART-9 op het dashboard, "Verzoek aan LEAD"):
 *    triggert een kaart die op de LAATSTE dag wordt gespeeld een gebeurtenis, dan verschijnt die gebeurtenis NIET: er komt immers geen
 *    volgende dag meer waarop de banner kan verschijnen. De gebeurtenis blijft in state.wachtend staan en komt nooit in
 *    state.gebeurtenissen; toestanden, sets en klachten veranderen niet (klachten krijgt geen extra dag). Gevolg: de invarianten die
 *    alleen gelden na die gebeurtenis (geldtIn: { gebeurtenis: ... }) gelden dan niet, en de speler kan een gebeurtenis ontlopen door de
 *    kaart die haar triggert tot de laatste dag uit te stellen (naast het vroeg afronden, TODO_BART-4). Vastgelegd in tests/engine.tests.js
 *    (test "laatste dag: ..."). Wijzigt Bart dit (bv. de gebeurtenis alsnog tonen), dan is dat een bewuste wijziging van die test.
 *  - Bronscan (M6): tests/engine.tests.js scant Engine._bron op een ALLOWLIST (alleen vaste teksten, geen regex/sjabloon/getallen buiten 0 en 1,
 *    geen dynamische code, geen woorden uit de casusdata). Nieuwe tekst of een nieuwe eigenschapsnaam in deze module vraagt dus ook een
 *    bewuste regel in die allowlist.
 *  - ATOMAIR: elke muterende functie (speelKaart, raadpleeg, volgendeDag, rondAf) werkt via atomisch(): gaat er iets mis
 *    (kapotte data, kapot predicaat, gooiende Evaluatie), dan is de state daarna precies zoals hij was (momentopname + herstel).
 *  - Engine._bron is de volledige broncode van deze module (voor de casuslogica-scan in de tests).
 */
(function engineModule(g) {
  "use strict";

  function fout(tekst) { return { ok: false, fout: tekst }; }
  function kopie(x) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }
  function P() {
    if (!g.Predicaten) throw new Error("De regeltaal (Predicaten) is niet geladen.");
    return g.Predicaten;
  }

  function zoekEpisode(casus, episodeId) {
    var eps = (casus && casus.episodes) || [];
    for (var i = 0; i < eps.length; i++) if (eps[i].id === episodeId) return eps[i];
    return null;
  }
  function casusVan(state) {
    if (state && state._casus) return state._casus;
    var lijst = g.CASUSSEN || [];
    for (var i = 0; i < lijst.length; i++) if (lijst[i].id === state.casusId) return lijst[i];
    throw new Error("De casus bij dit spel is niet gevonden.");
  }
  function episodeVan(state) {
    var casus = casusVan(state), ep = zoekEpisode(casus, state.episodeId);
    if (!ep) throw new Error("De episode bij dit spel is niet gevonden.");
    return ep;
  }
  function kaartVan(casus, id) {
    var k = casus.kaarten || [];
    for (var i = 0; i < k.length; i++) if (k[i].id === id) return k[i];
    return null;
  }
  function ctxVan(state) { return P().maakContext(casusVan(state), episodeVan(state), state); }
  function lijstVan(x) { return x == null ? [] : (Array.isArray(x) ? x : [x]); }
  function bevat(lijst, x) { return lijst.indexOf(x) >= 0; }

  /* ---------- nieuw spel ---------- */

  function trekVolgorde(ids, rng) {
    var a = ids.slice(), n = a.length;
    for (var i = 0; i < n - 1; i++) {
      var j = i + Math.floor(rng() * (n - i));
      if (!(j >= i)) j = i;
      if (j > n - 1) j = n - 1;
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function nieuwSpel(casus, episodeId, opties) {
    opties = opties || {};
    var ep = zoekEpisode(casus, episodeId);
    if (!ep) throw new Error("Onbekende episode: " + episodeId + ".");
    var kn = ep.knoppen;
    if (!kn || typeof kn.actiesPerBeurt !== "number" || typeof kn.aantalDagen !== "number")
      throw new Error("De episode mist de knoppen (actiesPerBeurt, aantalDagen) in de data.");
    var rng = typeof opties.rng === "function" ? opties.rng : Math.random;

    var groepen = {}, groepIds = [];
    (ep.gebeurtenissen || []).forEach(function (e) {
      if (!e.groep) return;
      if (!groepen[e.groep]) { groepen[e.groep] = []; groepIds.push(e.groep); }
      groepen[e.groep].push(e.id);
    });
    groepIds.forEach(function (gr) { groepen[gr] = trekVolgorde(groepen[gr], rng); });

    if (!Array.isArray(ep.startToestanden) || !ep.startToestanden.length)
      throw new Error("De episode mist de beginstoestand(en) (startToestanden, een lijst) in de data.");
    var toestanden = ep.startToestanden.slice();

    var state = {
      casusId: casus.id, episodeId: episodeId,
      dag: 1, actiesOver: kn.actiesPerBeurt, aantalDagen: kn.aantalDagen, afgerond: false, dagenVoorbij: false,
      tijdlijn: [], raadplegingen: [], gebeurtenissen: [], wachtend: [],
      toestanden: toestanden,
      sets: { resistent: [], gevoelig: [] },
      onthuld: [],
      zichtbaar: kopie((ep.patient && ep.patient.zichtbaar) || {}),
      groepen: groepen,
      volgordeAB: (groepen.AB || []).slice(),
      klachten: [{ dag: 0, status: null, tekst: null }, { dag: 1, status: null, tekst: null }],
      afrondenPasNaGebeurtenissen: !!(opties.afrondenPasNaGebeurtenissen != null ? opties.afrondenPasNaGebeurtenissen : ep.afrondenPasNaGebeurtenissen),
      rng: rng,
      uitkomst: null
    };
    if (ep.escalatie && ep.escalatie.aan) state.klachten[1].reeks = 1;
    Object.defineProperty(state, "_casus", { value: casus, enumerable: false, writable: true, configurable: true });
    var bewaard = {}; for (var ok in opties) if (ok !== "rng") bewaard[ok] = opties[ok];
    Object.defineProperty(state, "_opties", { value: bewaard, enumerable: false, writable: true, configurable: true });
    return state;
  }

  function herkansing(state, opties) {
    opties = opties || {};
    // Zelfde spelregels als het vorige spel: alle eerder meegegeven opties (ook de opt-in afrondenPasNaGebeurtenissen) blijven gelden,
    // tenzij hier expliciet anders is opgegeven. Een state zonder bewaarde opties (bv. een JSON-kopie) valt terug op de vlag in de state.
    var o = {}, k;
    for (k in (state._opties || {})) o[k] = state._opties[k];
    if (o.afrondenPasNaGebeurtenissen == null && state.afrondenPasNaGebeurtenissen != null) o.afrondenPasNaGebeurtenissen = state.afrondenPasNaGebeurtenissen;
    for (k in opties) o[k] = opties[k];
    if (o.rng == null && typeof state.rng === "function") o.rng = state.rng;
    return nieuwSpel(casusVan(state), state.episodeId, o);
  }

  /* ---------- onthullen ---------- */

  function zetPad(obj, sleutel, waarde) {
    if (sleutel.indexOf(".") >= 0) {
      var delen = sleutel.split("."), cur = obj;
      for (var i = 0; i < delen.length - 1; i++) {
        if (typeof cur[delen[i]] !== "object" || cur[delen[i]] === null) cur[delen[i]] = {};
        cur = cur[delen[i]];
      }
      cur[delen[delen.length - 1]] = waarde; return;
    }
    if (Object.prototype.hasOwnProperty.call(obj, sleutel)) { obj[sleutel] = waarde; return; }
    for (var k in obj) {
      if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k]) && Object.prototype.hasOwnProperty.call(obj[k], sleutel)) { obj[k][sleutel] = waarde; return; }
    }
    obj[sleutel] = waarde;
  }
  function meng(doel, patch) {
    for (var k in patch) {
      if (patch[k] && typeof patch[k] === "object" && !Array.isArray(patch[k]) && doel[k] && typeof doel[k] === "object" && !Array.isArray(doel[k])) meng(doel[k], patch[k]);
      else doel[k] = kopie(patch[k]);
    }
  }

  function onthul(state, ep, kaartId) {
    var nieuw = [];
    ((ep.patient && ep.patient.verborgen) || []).forEach(function (v) {
      if (v.kaart !== kaartId) return;
      var al = state.onthuld.some(function (o) { return o.kaart === kaartId && o.tekst === v.onthult && o.sleutel === (v.sleutel || null); });
      if (al) return;
      var waarde = v.waarde;
      if (waarde === undefined && v.sleutel && ep.patient.waar) waarde = ep.patient.waar[v.sleutel];
      var rij = { kaart: kaartId, dag: state.dag, sleutel: v.sleutel || null, tekst: v.onthult, waarde: waarde === undefined ? null : kopie(waarde) };
      if (v.sleutel && waarde !== undefined) zetPad(state.zichtbaar, v.sleutel, kopie(waarde));
      if (v.zichtbaar && typeof v.zichtbaar === "object") meng(state.zichtbaar, v.zichtbaar);
      state.onthuld.push(rij); nieuw.push(kopie(rij));
    });
    return nieuw;
  }

  /* ---------- gebeurtenissen ---------- */

  function triggerVan(state, ep, e) {
    if (!e.groep) return e.trigger;
    var leden = (ep.gebeurtenissen || []).filter(function (x) { return x.groep === e.groep; });
    var triggers = leden.map(function (x, i) { return { t: x.trigger, i: i }; });
    triggers.sort(function (a, b) {
      var na = a.t && typeof a.t.n === "number" ? a.t.n : Infinity, nb = b.t && typeof b.t.n === "number" ? b.t.n : Infinity;
      return na - nb || a.i - b.i;
    });
    var orde = (state.groepen && state.groepen[e.groep]) || [];
    var pos = orde.indexOf(e.id);
    return pos < 0 || !triggers[pos] ? e.trigger : triggers[pos].t;
  }

  function eersteVolg(state, kaartId) {
    for (var i = 0; i < state.tijdlijn.length; i++) if (state.tijdlijn[i].kaart === kaartId) return state.tijdlijn[i].volg;
    return null;
  }

  function triggertNu(state, t, volg) {
    if (!t) return false;
    if (t.alleenAlsGespeeld && eersteVolg(state, t.alleenAlsGespeeld) == null) return false;
    if (t.type === "naKaart" || t.type === "naAantalKaarten") return volg === t.n;
    if (t.type === "naKaartVanKaart") {
      var v = eersteVolg(state, t.kaart);
      return v != null && volg === v + t.n;
    }
    return false;
  }

  function controleerGebeurtenissen(state, ep, volg) {
    (ep.gebeurtenissen || []).forEach(function (e) {
      var gehad = state.gebeurtenissen.some(function (x) { return x.id === e.id; }) ||
        state.wachtend.some(function (x) { return x.id === e.id; });
      if (gehad) return;
      if (triggertNu(state, triggerVan(state, ep, e), volg)) state.wachtend.push({ id: e.id, naVolg: volg });
    });
  }

  // Gebeurtenis op tijd: trigger { type: "naDagenNaKaart", kaart, dagen, nummer? }: `dagen` dagen nadat de kaart (de nummer-ste keer, standaard
  // de eerste) is gespeeld, aan het begin van die dag. Geeft de dag, of null als het niet (meer) kan komen.
  function dagVanTrigger(state, t) {
    if (!t || t.type !== "naDagenNaKaart") return null;
    var teller = 0;
    for (var i = 0; i < state.tijdlijn.length; i++) {
      if (state.tijdlijn[i].kaart === t.kaart && ++teller === (t.nummer || 1)) return state.tijdlijn[i].dag + t.dagen;
    }
    return null;
  }
  function isBezig(state, id) {
    return state.gebeurtenissen.some(function (x) { return x.id === id; }) || state.wachtend.some(function (x) { return x.id === id; });
  }
  function controleerTijd(state, ep, nieuweDag) {
    (ep.gebeurtenissen || []).forEach(function (e) {
      if (!isBezig(state, e.id) && dagVanTrigger(state, e.trigger) === nieuweDag) state.wachtend.push({ id: e.id, naVolg: state.tijdlijn.length });
    });
  }
  // Gebeurtenissen die nog op tijd komen: [{ id, dag, tekst }] (tekst = e.aankondiging uit de data), voor "uitslag verwacht op dag X".
  function komend(state) {
    var ep = episodeVan(state), uit = [];
    (ep.gebeurtenissen || []).forEach(function (e) {
      var dag = dagVanTrigger(state, e.trigger);
      if (dag !== null && dag > state.dag && dag <= state.aantalDagen && !isBezig(state, e.id)) uit.push({ id: e.id, dag: dag, tekst: e.aankondiging || null });
    });
    return uit;
  }
  // Dagen (tot en met de huidige) waarop geen enkele kaart is gespeeld.
  function legeDagen(state) {
    var n = 0;
    for (var d = 1; d <= state.dag; d++) if (!state.tijdlijn.some(function (r) { return r.dag === d; })) n++;
    return n;
  }

  function pasGebeurtenissenToe(state, ep, nieuweDag) {
    state.wachtend.forEach(function (w) {
      var e = null, lijst = ep.gebeurtenissen || [];
      for (var i = 0; i < lijst.length; i++) if (lijst[i].id === w.id) e = lijst[i];
      state.gebeurtenissen.push({ id: w.id, dag: nieuweDag, naVolg: w.naVolg });
      if (!e) return;
      lijstVan(e.toestand).forEach(function (t) { if (!bevat(state.toestanden, t)) state.toestanden.push(t); });
      if (e.zet) {
        lijstVan(e.zet.resistent).forEach(function (m) { if (!bevat(state.sets.resistent, m)) state.sets.resistent.push(m); });
        lijstVan(e.zet.gevoelig).forEach(function (m) {
          if (!bevat(state.sets.gevoelig, m)) state.sets.gevoelig.push(m);
          var ix = state.sets.resistent.indexOf(m); if (ix >= 0) state.sets.resistent.splice(ix, 1);
        });
      }
    });
    state.wachtend.length = 0;   // in place: de rollback in volgendeDag herstelt dezelfde array
  }

  /* ---------- kaarten spelen ---------- */

  function speelKaart(state, kaartId, opts) {
    return atomisch(state, function () { return speelKaartNu(state, kaartId, opts); });
  }
  function speelKaartNu(state, kaartId, opts) {
    opts = opts || {};
    if (state.afgerond) return fout("Deze episode is al afgerond.");
    if (state.dagenVoorbij) return fout("De laatste dag is voorbij.");
    if (typeof kaartId !== "string" || !kaartId) return fout("Kies eerst een kaart om te spelen.");
    var casus = casusVan(state), ep = episodeVan(state), kaart = kaartVan(casus, kaartId);
    if (!kaart) return fout("Onbekende kaart: " + kaartId + ".");
    if (!bevat(ep.repertoire || [], kaartId)) return fout("Deze kaart zit niet in het repertoire van deze episode.");
    if (state.actiesOver < 1) return fout("Je hebt vandaag geen acties meer. Ga naar de volgende dag of rond de episode af.");

    var doel = opts.doel == null ? null : opts.doel, optie = opts.optie == null ? null : opts.optie;
    var doelen = kaart.doelen && kaart.doelen[state.episodeId];
    var doelkaart = !!kaart.doelkaart || !!doelen || !!kaart.opties;
    var label = kaart.label || kaartId;

    if (!doelkaart) {
      if (doel != null || optie != null) return fout("De kaart “" + label + "” heeft geen doel of optie.");
    } else {
      var toegestaan = doelen ? doelen.map(function (d) { return d.id; }) : (kaart.opties ? Object.keys(kaart.opties) : []);
      if (!toegestaan.length) return fout("De kaart “" + label + "” kan in deze episode op geen enkel doel worden gespeeld.");
      if (doel == null) return fout("Kies eerst een doel voor de kaart “" + label + "”.");
      if (!bevat(toegestaan, doel)) return fout("Dit doel kan niet bij de kaart “" + label + "”.");
      var d = doelen && doelen.filter(function (x) { return x.id === doel; })[0];
      if (d && d.vereist && !P().evalueer(d.vereist, ctxVan(state)))
        return fout("Dit doel is nu niet beschikbaar voor de kaart “" + label + "”.");
      if (kaart.opties) {
        var opl = kaart.opties[doel] || [];
        if (!opl.length) return fout("Voor dit doel zijn bij de kaart “" + label + "” geen opties beschikbaar.");
        if (optie == null) return fout("Kies eerst een optie voor de kaart “" + label + "”.");
        var ok = opl.some(function (o) { return (typeof o === "string" ? o : o.tekst) === optie || (o && o.id === optie); });
        if (!ok) return fout("Deze optie hoort niet bij dit doel.");
      } else if (optie != null) return fout("De kaart “" + label + "” heeft geen opties.");
    }

    // Optionele plafond (casus.limiet, per kaart te overschrijven met kaart.limiet[episode]): zoveel keer mag een kaart per doel.
    // Een herhaling boven de plafond doet niets en kost geen actie. Zonder plafond in de data is herhalen toegestaan.
    var plafond = kaart.limiet && kaart.limiet[state.episodeId];
    if (typeof plafond !== "number") plafond = casus.limiet;
    var aantalGespeeld = state.tijdlijn.filter(function (r) { return r.kaart === kaartId && r.doel === doel; }).length;
    if (typeof plafond === "number" && aantalGespeeld >= plafond) return fout("Je hebt de kaart “" + label + "” hiervoor al gespeeld. Dat heeft geen effect; er is geen actie verbruikt.");

    var regel = { volg: state.tijdlijn.length + 1, kaart: kaartId, dag: state.dag, doel: doel, optie: optie };
    state.tijdlijn.push(regel);
    state.actiesOver -= 1;
    var onthuld = onthul(state, ep, kaartId);
    controleerGebeurtenissen(state, ep, regel.volg);
    return { ok: true, regel: kopie(regel), onthuld: onthuld };
  }

  function raadpleeg(state) {
    return atomisch(state, function () {
      if (state.afgerond) return fout("Deze episode is al afgerond.");
      if (state.dagenVoorbij) return fout("De laatste dag is voorbij.");
      var ep = episodeVan(state), kost = (ep.knoppen && ep.knoppen.raadplegenKost) || 0;
      if (state.actiesOver < kost) return fout("Je hebt niet genoeg acties over om de richtlijn te raadplegen.");
      var r = casusVan(state).raadplegen || {};   // contract 4: alleen op casusniveau; eerst lezen, pas daarna muteren
      var antwoord = { ok: true, kost: kost, titel: r.titel || null, bronnen: kopie(r.bronnen || []) };
      state.actiesOver -= kost;
      state.raadplegingen.push({ dag: state.dag });
      return antwoord;
    });
  }

  /* ---------- klachtenstatus ---------- */

  function werkzaamheidVan(state, ep) {
    // Datavolgorde (niet activeringsvolgorde): de laatste sleutel in episode.werkzaamheid die in state.toestanden zit.
    // Zo hangt de uitkomst niet af van de getrokken A/B-volgorde.
    var w = ep.werkzaamheid || {}, sleutels = Object.keys(w);
    for (var i = sleutels.length - 1; i >= 0; i--) {
      var t = sleutels[i];
      if (t !== "statusTeksten" && t.indexOf("TODO_BART") !== 0 && w[t] && typeof w[t] === "object" && bevat(state.toestanden, t)) return w[t];
    }
    return null;
  }

  function eindeDag(state, ep, ctx, d) {
    var actief = (ep.antibiotica || []).filter(function (k) {
      return P().evalueer({ p: "actief", middel: k, op: { dag: d } }, ctx);
    });
    var entry = werkzaamheidVan(state, ep), werkzaam = false;
    if (entry) {
      werkzaam = actief.some(function (k) {
        return (entry.werkzaam || []).some(function (w) {
          return w.kaart === k && (!w.als || P().evalueer(w.als, ctx));
        });
      });
    }
    return { actief: actief, werkzaam: werkzaam };
  }

  function berekenKlachten(state, ep, d) {
    var ctx = ctxVan(state), vorige = eindeDag(state, ep, ctx, d - 1), status;
    var vorigeStatus = state.klachten[d - 1] ? state.klachten[d - 1].status : null;
    // LEAD-beslissing (contract 3b): alleen de EERSTE nul-periode telt. De periode begint op dag gebeurtenis+n (als aan het einde van de
    // dag ervoor geen werkzaam antibioticum actief was), loopt door zolang er geen werkzaam antibioticum actief is aan een dag-einde,
    // en komt na afloop (ook na een latere gap, ook voor een andere gebeurtenis) NIET terug.
    var periodeGehad = state.klachten.some(function (kl, i) { return i < d && kl && kl.status === "geenVerbetering48"; });
    var override = false;
    if (!vorige.werkzaam) {
      if (periodeGehad) override = vorigeStatus === "geenVerbetering48";
      else state.gebeurtenissen.forEach(function (gb) {
        var def = (ep.gebeurtenissen || []).filter(function (x) { return x.id === gb.id; })[0];
        if (!def || !def.zet || !def.zet.statusNaBeurten) return;
        if (d === gb.dag + def.zet.statusNaBeurten) override = true;
      });
    }
    if (override) status = "geenVerbetering48";
    else if (!vorige.actief.length) status = null;
    else status = vorige.werkzaam ? "af" : "aan";
    var teksten = ep.statusTeksten || (ep.werkzaamheid && ep.werkzaamheid.statusTeksten) || {};
    // Aanhoudende klachten (escalatie): aantal dagen op rij zonder werkzaam antibioticum; stopt bij "af", en na de escalatie zelf.
    var ec = ep.escalatie, uit = { dag: d, status: status, tekst: status && teksten[status] != null ? teksten[status] : null };
    if (ec && ec.aan) {
      var vorigeReeks = d === 1 ? 0 : (state.klachten[d - 1] && state.klachten[d - 1].reeks) || 0;
      uit.reeks = isBezig(state, ec.doelEvent) || status === "af" ? 0 : vorigeReeks + 1;
    }
    return uit;
  }

  // Momentopname van de HELE state (alles wat JSON-baar is; functies zoals rng blijven dezelfde verwijzing). Herstel gebeurt
  // op zijn plaats: bestaande arrays en objecten blijven dezelfde verwijzing, met de oude inhoud.
  function neemMoment(state) {
    var m = {};
    Object.keys(state).forEach(function (k) { m[k] = typeof state[k] === "function" ? state[k] : kopie(state[k]); });
    return m;
  }
  function isObj(x) { return x !== null && typeof x === "object"; }
  function zetIn(oud, nieuw) {
    if (Array.isArray(oud) && Array.isArray(nieuw)) {
      for (var i = 0; i < nieuw.length; i++) oud[i] = isObj(oud[i]) && isObj(nieuw[i]) && Array.isArray(oud[i]) === Array.isArray(nieuw[i]) ? zetIn(oud[i], nieuw[i]) : nieuw[i];
      oud.length = nieuw.length;
      return oud;
    }
    Object.keys(oud).forEach(function (k) { if (!(k in nieuw)) delete oud[k]; });
    Object.keys(nieuw).forEach(function (k) {
      oud[k] = isObj(oud[k]) && isObj(nieuw[k]) && Array.isArray(oud[k]) === Array.isArray(nieuw[k]) ? zetIn(oud[k], nieuw[k]) : nieuw[k];
    });
    return oud;
  }
  function herstel(state, m) { zetIn(state, m); }
  function atomisch(state, fn) {
    var moment = neemMoment(state);
    try { return fn(); }
    catch (e) { herstel(state, moment); throw e; }
  }

  function volgendeDag(state) {
    if (state.afgerond) throw new Error("Deze episode is al afgerond.");
    if (state.dagenVoorbij) throw new Error("De laatste dag is al voorbij.");
    var ep = episodeVan(state);
    if (state.dag >= state.aantalDagen) { state.dagenVoorbij = true; return state; }
    // Atomisch: gaat er halverwege iets mis (bv. een kapot predicaat in de data), dan blijft de state precies zoals hij was.
    return atomisch(state, function () {
      var nieuw = state.dag + 1, ec = ep.escalatie;
      // Escalatie: houden de klachten `dagen` dagen aan, dan volgt de gebeurtenis ec.doelEvent (als die nog niet is geweest).
      if (ec && ec.aan && !isBezig(state, ec.doelEvent) && berekenKlachten(state, ep, nieuw).reeks >= ec.dagen) {
        state.wachtend.push({ id: ec.doelEvent, naVolg: state.tijdlijn.length });
      }
      controleerTijd(state, ep, nieuw);
      pasGebeurtenissenToe(state, ep, nieuw);
      state.dag = nieuw;
      state.actiesOver = ep.knoppen.actiesPerBeurt;
      state.klachten[nieuw] = berekenKlachten(state, ep, nieuw);
      return state;
    });
  }

  /* ---------- einde ---------- */

  function eindeBereikt(state) { return !!(state.afgerond || state.dagenVoorbij); }

  function rondAf(state) {
    if (state.afgerond) return state.uitkomst;
    var casus = casusVan(state), ep = episodeVan(state);
    return atomisch(state, function () {
      if (state.afrondenPasNaGebeurtenissen && !state.dagenVoorbij && state.dag < state.aantalDagen) {
        // Een gebeurtenis op tijd telt alleen mee als de kaart die haar aankondigt is gespeeld; die op kaartaantal telt altijd mee.
        var open = (ep.gebeurtenissen || []).some(function (e) {
          if (state.gebeurtenissen.some(function (x) { return x.id === e.id; })) return false;
          return !(e.trigger && e.trigger.type === "naDagenNaKaart") || dagVanTrigger(state, e.trigger) !== null;
        });
        if (open) throw new Error("Je kunt deze episode pas afronden nadat de gebeurtenissen zich hebben voorgedaan.");
      }
      if (!g.Evaluatie || typeof g.Evaluatie.beoordeel !== "function") throw new Error("De beoordeling (Evaluatie) is niet geladen.");
      state.afgerond = true;
      state.uitkomst = g.Evaluatie.beoordeel(casus, state.episodeId, state);   // gooit die: alles (ook wat beoordeel muteerde) wordt teruggezet
      return state.uitkomst;
    });
  }

  /* ---------- ontgrendelen ---------- */

  // Ontgrendelen kijkt naar de EPISODES van de meegegeven casus. Een Logging-record van een andere casus (casusId) telt niet mee.
  // Filteren op pseudoniem doet de aanroeper (UI): geef alleen de records van de huidige speler mee (Logging.alle() gefilterd);
  // de API heeft bewust geen pseudoniem-parameter.
  function gehaaldSet(gehaald, casusId) {
    var set = {};
    if (Array.isArray(gehaald)) {
      gehaald.forEach(function (x) {
        if (typeof x === "string") { set[x] = true; return; }
        if (!x || !x.episodeId) return;
        if (x.casusId != null && x.casusId !== casusId) return;
        var u = x.uitkomst && typeof x.uitkomst === "object" ? x.uitkomst : null;
        // Gehaald: poortGehaald===true; of, zonder veld poortGehaald (Logging-record, contract 6), een lege geschonden-lijst.
        if (x.poortGehaald === true || (u && u.poortGehaald === true)) set[x.episodeId] = true;
        else if (!("poortGehaald" in x) && !(u && "poortGehaald" in u) && Array.isArray(x.geschonden) && x.geschonden.length === 0) set[x.episodeId] = true;
      });
    } else if (gehaald && typeof gehaald === "object") {
      for (var k in gehaald) if (gehaald[k]) set[k] = true;
    }
    return set;
  }
  function ontgrendeld(casus, episodeId, gehaald) {
    var eps = casus.episodes || [], set = gehaaldSet(gehaald, casus.id);
    for (var i = 0; i < eps.length; i++) {
      if (eps[i].id === episodeId) return i === 0 || !!set[eps[i - 1].id];
    }
    return false;
  }
  function ontgrendeldeEpisodes(casus, gehaald) {
    return (casus.episodes || []).filter(function (e) { return ontgrendeld(casus, e.id, gehaald); }).map(function (e) { return e.id; });
  }

  g.Engine = {
    nieuwSpel: nieuwSpel,
    herkansing: herkansing,
    speelKaart: speelKaart,
    raadpleeg: raadpleeg,
    volgendeDag: volgendeDag,
    rondAf: rondAf,
    eindeBereikt: eindeBereikt,
    komend: komend,
    legeDagen: legeDagen,
    ontgrendeld: ontgrendeld,
    ontgrendeldeEpisodes: ontgrendeldeEpisodes
  };
  // Alleen voor de tests (niet opsombaar): de VOLLEDIGE broncode van deze module, zodat de tests alles kunnen scannen op casuslogica
  // (niet een handmatige lijst functies). Een benoemde function expression kent zijn eigen tekst; geen fs nodig.
  Object.defineProperty(g.Engine, "_bron", { enumerable: false, value: engineModule.toString() });
})(typeof window !== "undefined" ? window : globalThis);

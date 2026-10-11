/* Regeltaal: predicaten en tellers over de tijdlijn van een episode.
   Klassiek script (geen modules). Global: window.Predicaten.
   Puur functioneel over ctx: er wordt niets gemuteerd en er staan geen middelnamen,
   kaart-ids van een casus of klinische drempels in deze code. Alles komt uit de predicaten
   (data) en uit ctx. Zie regels/PREDICATEN.md voor de beschrijving met voorbeelden. */
(function (g) {
  "use strict";

  // Rollen van de bijsturingskaarten (contract: B1 wisselen, B2 stoppen, B3 pauzeren, B5 hervatten).
  // Een casus mag ze overschrijven met casus.rollen = { wissel, stop, pauze, hervat }.
  var STANDAARD_ROLLEN = { wissel: "B1", stop: "B2", pauze: "B3", hervat: "B5" };
  // Benoemde sets die door een gebeurtenis (zet) worden aangevuld, met hun tegenset (verwijdert uit de set).
  var TEGENSET = { resistent: "gevoelig" };
  var VERGELIJK = ["<", "<=", ">", ">=", "==", "=", "!="];
  var K_VELDEN = ["kaart", "kaartUit", "start", "doel", "optie", "optieNiet", "naGebeurtenis", "voorGebeurtenis"];
  var KLACHT_WAARDEN = ["af", "aan", "geenVerbetering48"];

  function fout(tekst) { throw new Error(tekst); }
  function isObj(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }
  function heeft(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function lijst(x) { return Array.isArray(x) ? x : (x === undefined || x === null ? [] : [x]); }
  function isGetal(x) { return typeof x === "number" && isFinite(x); }
  function norm(x) { return x === undefined ? null : x; }

  /* ---------- context ---------- */
  function maakContext(casus, episode, state) {
    casus = casus || {};
    state = state || {};
    var ep = episode;
    if (typeof ep === "string") {
      var gevonden = null;
      lijst(casus.episodes).forEach(function (e) { if (!gevonden && e && e.id === episode) gevonden = e; });
      if (!gevonden) fout("Onbekende episode '" + episode + "' in de casus.");
      ep = gevonden;
    }
    ep = ep || {};
    var tijdlijn = lijst(state.tijdlijn).slice();
    var klachten = lijst(state.klachten).slice();
    var laatste = 1;
    if (isGetal(state.dag)) laatste = Math.max(laatste, state.dag);
    tijdlijn.forEach(function (r) { if (r && isGetal(r.dag)) laatste = Math.max(laatste, r.dag); });
    klachten.forEach(function (k) { if (k && isGetal(k.dag)) laatste = Math.max(laatste, k.dag); });
    var ctx = {
      tijdlijn: tijdlijn,
      gebeurtenissen: lijst(state.gebeurtenissen).slice(),
      toestanden: lijst(state.toestanden).slice(),
      waar: (ep.patient && ep.patient.waar) || {},
      aantalDagen: isGetal(state.aantalDagen) ? state.aantalDagen : (isGetal(ep.aantalDagen) ? ep.aantalDagen : null),
      laatsteDag: laatste,
      casus: casus,
      episode: ep,
      klachten: klachten,
      status: function (dag) {
        for (var i = 0; i < klachten.length; i++) {
          if (klachten[i] && klachten[i].dag === dag) return norm(klachten[i].status);
        }
        return null;
      }
    };
    return ctx;
  }

  /* ---------- hulpfuncties over ctx ---------- */
  function rollen(ctx) {
    var r = (ctx.casus && ctx.casus.rollen) || {};
    return {
      wissel: r.wissel || STANDAARD_ROLLEN.wissel, stop: r.stop || STANDAARD_ROLLEN.stop,
      pauze: r.pauze || STANDAARD_ROLLEN.pauze, hervat: r.hervat || STANDAARD_ROLLEN.hervat
    };
  }
  function regels(ctx) {
    var l = lijst(ctx.tijdlijn).map(function (r, i) {
      if (!isObj(r)) fout("Ongeldige tijdlijnregel op positie " + (i + 1) + ".");
      return { r: r, i: i, volg: isGetal(r.volg) ? r.volg : i + 1 };
    });
    l.sort(function (a, b) { return a.volg - b.volg || a.i - b.i; });
    return l.map(function (x) {
      return { volg: x.volg, kaart: x.r.kaart, dag: x.r.dag, doel: norm(x.r.doel), optie: norm(x.r.optie) };
    });
  }
  function gebDag(ctx, id) {
    var l = lijst(ctx.gebeurtenissen);
    for (var i = 0; i < l.length; i++) if (l[i] && l[i].id === id) return l[i].dag;
    return null;
  }
  function antibiotica(ctx) {
    var a = ctx.episode && ctx.episode.antibiotica;
    if (!Array.isArray(a)) fout("De episode heeft geen lijst 'antibiotica'; die is nodig voor dit predicaat.");
    return a;
  }

  /* ---------- kaartverwijzingen (K) ---------- */
  function leesK(p, veld) {
    var K = p[veld];
    if (K === undefined && veld === "K") {
      if (heeft(p, "k")) K = p.k;
      else if (K_VELDEN.some(function (v) { return heeft(p, v); })) {
        K = {}; K_VELDEN.forEach(function (v) { if (heeft(p, v)) K[v] = p[v]; });
      }
    }
    if (!isObj(K)) fout("Het predicaat '" + (p.p || p.t) + "' mist het veld '" + veld + "' (een kaartverwijzing).");
    Object.keys(K).forEach(function (s) {
      if (K_VELDEN.indexOf(s) < 0) fout("Onbekend veld '" + s + "' in een kaartverwijzing.");
    });
    if (K.kaart === undefined && K.kaartUit === undefined && K.start === undefined) {
      fout("Een kaartverwijzing heeft minstens 'kaart', 'kaartUit' of 'start' nodig.");
    }
    return K;
  }
  function matcht(regel, K, ctx) {
    if (K.kaart !== undefined && lijst(K.kaart).indexOf(regel.kaart) < 0) return false;
    if (K.kaartUit !== undefined) {
      var set = ctx.episode && ctx.episode[K.kaartUit];
      if (!Array.isArray(set)) fout("Onbekende set '" + K.kaartUit + "' in de episode (kaartUit).");
      if (set.indexOf(regel.kaart) < 0) return false;
    }
    if (K.start !== undefined) {
      var mids = lijst(K.start), rl = rollen(ctx);
      var isStart = mids.indexOf(regel.kaart) >= 0 || (regel.kaart === rl.wissel && mids.indexOf(regel.doel) >= 0);
      if (!isStart) return false;
    }
    if (K.doel !== undefined && regel.doel !== K.doel) return false;
    if (K.optie !== undefined && regel.optie !== K.optie) return false;
    if (K.optieNiet !== undefined && lijst(K.optieNiet).indexOf(regel.optie) >= 0) return false;
    if (K.naGebeurtenis !== undefined) {
      var d = gebDag(ctx, K.naGebeurtenis);
      if (d === null || !(regel.dag >= d)) return false;
    }
    if (K.voorGebeurtenis !== undefined) {
      var d2 = gebDag(ctx, K.voorGebeurtenis);
      if (d2 !== null && !(regel.dag < d2)) return false;
    }
    return true;
  }
  function alle(ctx, K) { return regels(ctx).filter(function (r) { return matcht(r, K, ctx); }); }
  function eerste(ctx, K) { var a = alle(ctx, K); return a.length ? a[0] : null; }

  /* ---------- toestand simuleren (actief / gepauzeerd) ---------- */
  function moment(op, ctx) {
    if (op === undefined || op === null) return {};
    if (isObj(op)) {
      if (op.dag !== undefined) {
        if (!isGetal(op.dag)) fout("'op.dag' moet een getal zijn.");
        return { maxDag: op.dag };
      }
      if (op.eindeBeurtNaGebeurtenis !== undefined) {
        var d = gebDag(ctx, op.eindeBeurtNaGebeurtenis);
        if (d === null) return null;
        var off = op.offset === undefined ? 0 : op.offset;
        if (!isGetal(off)) fout("'offset' moet een getal zijn.");
        return { maxDag: d + off };
      }
      if (op.naKaart !== undefined) {
        var K = leesK({ p: "op", K: op.naKaart }, "K");
        var r = eerste(ctx, K);
        return r ? { maxDag: r.dag, maxVolg: r.volg } : null;
      }
    }
    fout("Onbekend moment in 'op': " + JSON.stringify(op) + ".");
  }
  function simuleer(ctx, m) {
    var rl = rollen(ctx), act = {}, pauze = {}, maxAb = 0;
    var abs = null;
    function ab() { return abs || (abs = antibiotica(ctx)); }
    function tel() { var n = 0; ab().forEach(function (x) { if (act[x]) n++; }); return n; }
    regels(ctx).forEach(function (r) {
      if (m.maxDag !== undefined && !(r.dag <= m.maxDag)) return;
      if (m.maxVolg !== undefined && !(r.volg <= m.maxVolg)) return;
      if (r.kaart === rl.wissel) {
        if (r.doel !== null) { ab().forEach(function (x) { delete act[x]; }); act[r.doel] = true; }
      } else if (r.kaart === rl.stop) {
        if (r.doel !== null) delete act[r.doel];
      } else if (r.kaart === rl.pauze) {
        if (r.doel !== null) pauze[r.doel] = true;
      } else if (r.kaart === rl.hervat) {
        if (r.doel !== null) delete pauze[r.doel];
      } else if (r.doel === null || (Array.isArray(ctx.episode && ctx.episode.antibiotica) && ctx.episode.antibiotica.indexOf(r.kaart) >= 0)) {
        act[r.kaart] = true;
      }
      if (Array.isArray(ctx.episode && ctx.episode.antibiotica) || r.kaart === rl.wissel) maxAb = Math.max(maxAb, tel());
    });
    return { act: act, pauze: pauze, maxAb: maxAb, ab: ab, tel: tel };
  }
  // Benoemde set (bv. "resistent") op een moment: basis uit waar[naam] of episode[naam], aangevuld door gebeurtenissen (zet).
  function benoemdeSet(ctx, naam, m) {
    var uit = {}, bekend = false;
    var basis = (isObj(ctx.waar) && Array.isArray(ctx.waar[naam]) && ctx.waar[naam]) ||
      (Array.isArray(ctx.episode && ctx.episode[naam]) && ctx.episode[naam]) || null;
    if (basis) { bekend = true; basis.forEach(function (x) { uit[x] = true; }); }
    var defs = lijst(ctx.episode && ctx.episode.gebeurtenissen);
    defs.forEach(function (d) { if (d && isObj(d.zet) && (heeft(d.zet, naam) || heeft(d.zet, TEGENSET[naam] || "\u0000"))) bekend = true; });
    if (TEGENSET[naam]) bekend = true;
    if (!bekend) fout("Onbekende set '" + naam + "' (niet in de data van de episode).");
    lijst(ctx.gebeurtenissen).forEach(function (ge) {
      if (!ge || (m.maxDag !== undefined && !(ge.dag <= m.maxDag))) return;
      var def = null;
      defs.forEach(function (d) { if (!def && d && d.id === ge.id) def = d; });
      if (!def || !isObj(def.zet)) return;
      lijst(def.zet[naam]).forEach(function (x) { uit[x] = true; });
      if (TEGENSET[naam]) lijst(def.zet[TEGENSET[naam]]).forEach(function (x) { delete uit[x]; });
    });
    return uit;
  }

  /* ---------- vergelijken ---------- */
  function vergelijk(op, a, b) {
    if (VERGELIJK.indexOf(op) < 0) fout("Onbekende vergelijkingsoperator '" + op + "'.");
    if (op === "==" || op === "=") return a === b;
    if (op === "!=") return a !== b;
    if (!isGetal(a) || !isGetal(b)) fout("De operator '" + op + "' vergelijkt alleen getallen (kreeg " + JSON.stringify(a) + " en " + JSON.stringify(b) + ").");
    if (op === "<") return a < b;
    if (op === "<=") return a <= b;
    if (op === ">") return a > b;
    return a >= b;
  }
  function vereis(p, velden) {
    velden.forEach(function (v) { if (p[v] === undefined) fout("Het predicaat '" + p.p + "' mist het veld '" + v + "'."); });
  }
  function klachtDag(op, ctx) {
    if (isObj(op)) {
      if (op.dag !== undefined) { if (!isGetal(op.dag)) fout("'op.dag' moet een getal zijn."); return op.dag; }
      if (op.eindeBeurtNaGebeurtenis !== undefined) {
        var d = gebDag(ctx, op.eindeBeurtNaGebeurtenis);
        return d === null ? null : d + (op.offset || 0);
      }
    }
    fout("Onbekend moment in 'op' bij 'klachten': " + JSON.stringify(op) + ".");
  }

  /* ---------- tellers (contract 3b) ---------- */
  var TELLERS = {
    gespeeld: function (t, ctx) {
      var K = leesK(t, "K"), n = 0;
      if (t.terwijlKlachten !== undefined && KLACHT_WAARDEN.indexOf(t.terwijlKlachten) < 0) {
        fout("Onbekende klachtenstatus '" + t.terwijlKlachten + "' in 'terwijlKlachten'.");
      }
      alle(ctx, K).forEach(function (r) {
        if (t.terwijlKlachten === undefined || ctx.status(r.dag) === t.terwijlKlachten) n++;
      });
      return n;
    },
    aantalActieveAntibiotica: function (t, ctx) {
      if (t.op !== "max") fout("De teller 'aantalActieveAntibiotica' kent alleen op: \"max\".");
      antibiotica(ctx);
      return simuleer(ctx, {}).maxAb;
    }
  };
  function tel(teller, ctx) {
    if (!isObj(teller) || typeof teller.t !== "string") fout("Een teller moet een object met een veld 't' zijn.");
    if (!heeft(TELLERS, teller.t)) fout("Onbekende teller '" + teller.t + "'.");
    return TELLERS[teller.t](teller, ctx);
  }

  /* ---------- predicaten ---------- */
  var PRED = {
    gespeeld: function (p, ctx) { return eerste(ctx, leesK(p, "K")) !== null; },
    nietGespeeld: function (p, ctx) { return eerste(ctx, leesK(p, "K")) === null; },
    voor: function (p, ctx) {
      var a = eerste(ctx, leesK(p, "a")), b = eerste(ctx, leesK(p, "b"));
      return a !== null && b !== null && a.volg < b.volg;
    },
    na: function (p, ctx) {
      var a = eerste(ctx, leesK(p, "a")), b = eerste(ctx, leesK(p, "b"));
      return a !== null && b !== null && a.volg > b.volg;
    },
    binnenBeurten: function (p, ctx) {
      var K = leesK(p, "K"); vereis(p, ["naGebeurtenis", "n"]);
      if (!isGetal(p.n)) fout("'n' moet een getal zijn.");
      var d = gebDag(ctx, p.naGebeurtenis);
      if (d === null) return false;
      return alle(ctx, K).some(function (r) { return r.dag >= d && r.dag <= d + p.n - 1; });
    },
    binnenBeurtenNaKaart: function (p, ctx) {
      var K = leesK(p, "K"), A = leesK(p, "naKaart"); vereis(p, ["n"]);
      if (!isGetal(p.n)) fout("'n' moet een getal zijn.");
      var a = eerste(ctx, A);
      if (a === null) return false;
      return alle(ctx, K).some(function (r) { return r.dag >= a.dag && r.dag <= a.dag + p.n - 1; });
    },
    opDagRelatief: function (p, ctx) {
      var K = leesK(p, "K"), A = leesK(p, "anker"); vereis(p, ["van"]);
      if (!isGetal(p.van)) fout("'van' moet een getal zijn.");
      var tot = p.tot === undefined ? Infinity : p.tot;
      if (typeof tot !== "number" || isNaN(tot)) fout("'tot' moet een getal zijn.");
      var a = eerste(ctx, A);
      if (a === null) return false;
      return alle(ctx, K).some(function (r) { var v = r.dag - a.dag; return v >= p.van && v <= tot; });
    },
    gestart: function (p, ctx) {
      vereis(p, ["middel"]);
      return eerste(ctx, { start: p.middel }) !== null;
    },
    actief: function (p, ctx) {
      var m = moment(p.op, ctx);
      if (m === null) return false;
      var s = simuleer(ctx, m), kand;
      if (p.middel !== undefined) kand = lijst(p.middel);
      else kand = s.ab().filter(function (x) { return s.act[x]; });
      kand = kand.filter(function (x) { return s.act[x]; });
      if (p.uitSet !== undefined) {
        var set = benoemdeSet(ctx, p.uitSet, m);
        kand = kand.filter(function (x) { return set[x]; });
      }
      return kand.length > 0;
    },
    aantalActieveAntibiotica: function (p, ctx) {
      vereis(p, ["op", "n"]);
      antibiotica(ctx);
      return vergelijk(p.op, simuleer(ctx, {}).maxAb, p.n);
    },
    medicatieActief: function (p, ctx) {
      vereis(p, ["id"]);
      var m = moment(p.op, ctx);
      if (m === null) return false;
      return !simuleer(ctx, m).pauze[p.id];
    },
    waar: function (p, ctx) {
      vereis(p, ["veld", "op", "waarde"]);
      if (!isObj(ctx.waar) || !heeft(ctx.waar, p.veld)) fout("Het veld '" + p.veld + "' staat niet in de ware waarden van de patiënt.");
      return vergelijk(p.op, ctx.waar[p.veld], p.waarde);
    },
    inToestand: function (p, ctx) { vereis(p, ["t"]); return lijst(ctx.toestanden).indexOf(p.t) >= 0; },
    gebeurtenisGeweest: function (p, ctx) { vereis(p, ["id"]); return gebDag(ctx, p.id) !== null; },
    klachten: function (p, ctx) {
      vereis(p, ["waarde"]);
      if (KLACHT_WAARDEN.indexOf(p.waarde) < 0) fout("Onbekende klachtenstatus '" + p.waarde + "'.");
      if (p.op === undefined) return lijst(ctx.klachten).some(function (k) { return k && k.status === p.waarde; });
      if (p.op === "laatste") return ctx.status(ctx.laatsteDag) === p.waarde;
      var d = klachtDag(p.op, ctx);
      return d !== null && ctx.status(d) === p.waarde;
    },
    tel: function (p, ctx) {
      vereis(p, ["teller", "op", "waarde"]);
      return vergelijk(p.op, tel(p.teller, ctx), p.waarde);
    },
    en: function (p, ctx) {
      if (!Array.isArray(p.args)) fout("Het predicaat 'en' vraagt een lijst 'args'.");
      return p.args.every(function (a) { return evalueer(a, ctx); });
    },
    of: function (p, ctx) {
      if (!Array.isArray(p.args)) fout("Het predicaat 'of' vraagt een lijst 'args'.");
      return p.args.some(function (a) { return evalueer(a, ctx); });
    },
    niet: function (p, ctx) { vereis(p, ["arg"]); return !evalueer(p.arg, ctx); },
    alsDan: function (p, ctx) { vereis(p, ["als", "dan"]); return !evalueer(p.als, ctx) || evalueer(p.dan, ctx); },
    waarheid: function (p) {
      if (p.waarde !== true && p.waarde !== false) fout("Het predicaat 'waarheid' vraagt waarde true of false.");
      return p.waarde;
    }
  };

  function evalueer(pred, ctx) {
    if (!isObj(pred)) fout("Een predicaat moet een object zijn met een veld 'p' (kreeg " + JSON.stringify(pred) + ").");
    if (typeof pred.p !== "string") fout("Een predicaat mist het veld 'p' (de naam van het predicaat).");
    if (!heeft(PRED, pred.p)) fout("Onbekend predicaat '" + pred.p + "'.");
    if (!isObj(ctx)) fout("Er is geen geldige context (ctx) meegegeven.");
    return PRED[pred.p](pred, ctx) === true;
  }

  g.Predicaten = {
    versie: "1.0",
    namen: Object.keys(PRED),
    tellerNamen: Object.keys(TELLERS),
    maakContext: maakContext,
    evalueer: evalueer,
    tel: tel
  };
})(typeof window !== "undefined" ? window : globalThis);

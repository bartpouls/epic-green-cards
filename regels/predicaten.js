/* Regeltaal: predicaten en tellers over de tijdlijn van een episode.
   Klassiek script (geen modules). Global: window.Predicaten.
   Puur functioneel over ctx: er wordt niets gemuteerd en er staan geen middelnamen,
   kaart-ids van een casus of klinische drempels in deze code. Alles komt uit de predicaten
   (data) en uit ctx; ook de kaart-id's voor wisselen/stoppen/pauzeren/hervatten komen uit
   casus.rollen (ontbreekt die, dan volgt een Nederlandse fout). Zie regels/PREDICATEN.md. */
(function (g) {
  "use strict";

  // Rollen van de bijsturingskaarten staan in de data: casus.rollen = { wissel, stop, pauzeer, hervat }.
  var ROL_NAMEN = ["wissel", "stop", "pauzeer", "hervat"];
  // Benoemde sets die door een gebeurtenis (zet) worden aangevuld, met hun tegenset (verwijdert uit de set).
  var TEGENSET = { resistent: "gevoelig", gevoelig: "resistent" };
  var VERGELIJK = ["<", "<=", ">", ">=", "==", "=", "!="];
  var K_VELDEN = ["kaart", "kaartUit", "start", "doel", "optie", "optieNiet", "naGebeurtenis", "voorGebeurtenis"];
  // Toegestane velden per predicaat (plat: K-velden direct op het predicaat; genest: onder 'K'). Elk ander
  // veld is een typfout en geeft een fout. Sleutels die met TODO_BART beginnen zijn geen data en worden genegeerd.
  var VELDEN = {
    gespeeld: ["p", "K"].concat(K_VELDEN),
    nietGespeeld: ["p", "K"].concat(K_VELDEN),
    voor: ["p", "a", "b"],
    na: ["p", "a", "b"],
    binnenBeurten: ["p", "K", "n"].concat(K_VELDEN),
    binnenBeurtenNaKaart: ["p", "K", "naKaart", "n"].concat(K_VELDEN),
    opDagRelatief: ["p", "K", "anker", "van", "tot"].concat(K_VELDEN),
    gestart: ["p", "middel"],
    actief: ["p", "middel", "op", "uitSet"],
    aantalActieveAntibiotica: ["p", "op", "n"],
    medicatieActief: ["p", "id", "op"],
    waar: ["p", "veld", "op", "waarde"],
    inToestand: ["p", "t"],
    gebeurtenisGeweest: ["p", "id"],
    klachten: ["p", "waarde", "op"],
    tel: ["p", "teller", "op", "waarde"],
    en: ["p", "args"],
    of: ["p", "args"],
    niet: ["p", "arg"],
    alsDan: ["p", "als", "dan"],
    waarheid: ["p", "waarde"]
  };
  var TELLER_VELDEN = {
    gespeeld: ["t", "K", "terwijlKlachten"].concat(K_VELDEN),
    aantalActieveAntibiotica: ["t", "op"]
  };
  var MOMENT_VELDEN = ["dag", "eindeBeurtNaGebeurtenis", "offset", "naKaart"];
  var KLACHT_WAARDEN = ["af", "aan", "geenVerbetering48"];

  function fout(tekst) { throw new Error(tekst); }
  var HAS = Object.prototype.hasOwnProperty, ISARR = Array.isArray, KEYS = Object.keys, FIN = isFinite;
  function isObj(x) { return x !== null && typeof x === "object" && !ISARR(x); }
  function heeft(o, k) { return HAS.call(o, k); }
  function lijst(x) { return ISARR(x) ? x : (x === undefined || x === null ? [] : [x]); }
  function isGetal(x) { return typeof x === "number" && FIN(x); }
  function isHeel(x) { return isGetal(x) && Math.floor(x) === x; }
  function isId(x) { return typeof x === "string" && x !== ""; }
  // Een echte ctx is wat maakContext teruggeeft. Casus, episode of een kale state zijn dat niet.
  function isCtx(c) {
    return isObj(c) && ISARR(c.tijdlijn) && ISARR(c.gebeurtenissen) && ISARR(c.toestanden) && ISARR(c.klachten) &&
      isObj(c.waar) && isObj(c.episode) && isObj(c.casus) && typeof c.status === "function" && isGetal(c.laatsteDag);
  }
  function norm(x) { return x === undefined ? null : x; }
  function negeer(s) { return s.indexOf("TODO_BART") === 0; }
  function controleerVelden(o, toegestaan, soort, naam) {
    KEYS(o).forEach(function (s) {
      if (toegestaan.indexOf(s) < 0 && !negeer(s)) {
        fout("Onbekend veld '" + s + "' in " + soort + " '" + naam + "'. Toegestaan: " + toegestaan.join(", ") + ".");
      }
    });
  }

  /* ---------- context ---------- */
  function maakContext(casus, episode, state) {
    casus = casus || {};
    state = state || {};
    if (!isObj(casus)) fout("maakContext: 'casus' moet een object zijn.");
    if (!isObj(state)) fout("maakContext: 'state' moet een object zijn.");
    ["tijdlijn", "gebeurtenissen", "toestanden", "klachten"].forEach(function (v) {
      if (state[v] !== undefined && state[v] !== null && !ISARR(state[v])) fout("maakContext: 'state." + v + "' moet een lijst zijn (kreeg " + JSON.stringify(state[v]) + ").");
    });
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
    var r = ctx.casus && ctx.casus.rollen;
    if (!isObj(r)) fout("De casus mist 'rollen' ({ wissel, stop, pauzeer, hervat }): de kaart-id's voor wisselen, stoppen, pauzeren en hervatten. Die zijn nodig voor dit predicaat.");
    var uit = {};
    ROL_NAMEN.forEach(function (n) {
      if (typeof r[n] !== "string" || r[n] === "") fout("De casus mist 'rollen." + n + "' (een kaart-id) voor dit predicaat.");
      uit[n] = r[n];
    });
    return uit;
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
    if (!ISARR(a)) fout("De episode heeft geen lijst 'antibiotica'; die is nodig voor dit predicaat.");
    return a;
  }

  /* ---------- kaartverwijzingen (K) ---------- */
  function leesK(p, veld) {
    var K = heeft(p, veld) ? p[veld] : undefined, naam = p.p || p.t;
    // Bij binnenBeurten is naGebeurtenis ook een eigen veld van het predicaat (dan geen platte K-vorm).
    var eigen = naam === "binnenBeurten" ? ["naGebeurtenis"] : [];
    function platteVelden() {
      return K_VELDEN.filter(function (v) { return heeft(p, v) && eigen.indexOf(v) < 0; });
    }
    if (veld === "K") {
      if (K !== undefined && platteVelden().length) {
        fout("Het predicaat '" + naam + "' mengt de vorm met 'K' en losse kaartvelden (" + platteVelden().join(", ") + "); kies één vorm.");
      }
      if (K === undefined && K_VELDEN.some(function (v) { return heeft(p, v); })) {
        K = {}; K_VELDEN.forEach(function (v) { if (heeft(p, v)) K[v] = p[v]; });
      }
    }
    if (!isObj(K)) fout("Het predicaat '" + naam + "' mist het veld '" + veld + "' (een kaartverwijzing).");
    KEYS(K).forEach(function (s) {
      if (K_VELDEN.indexOf(s) < 0 && !negeer(s)) fout("Onbekend veld '" + s + "' in een kaartverwijzing. Toegestaan: " + K_VELDEN.join(", ") + ".");
    });
    if (K.kaart === undefined && K.kaartUit === undefined && K.start === undefined) {
      fout("Een kaartverwijzing heeft minstens 'kaart', 'kaartUit' of 'start' nodig.");
    }
    return K;
  }
  function matcht(regel, K, ctx) {
    if (K.kaart !== undefined && lijst(K.kaart).indexOf(regel.kaart) < 0) return false;
    if (K.kaartUit !== undefined) {
      if (ctx.episode[K.kaartUit].indexOf(regel.kaart) < 0) return false;
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
    if (op === undefined) return {};
    if (isObj(op)) {
      if (op.dag !== undefined) return { maxDag: op.dag };
      if (op.eindeBeurtNaGebeurtenis !== undefined) {
        var d = gebDag(ctx, op.eindeBeurtNaGebeurtenis);
        if (d === null) return null;
        return { maxDag: d + (op.offset === undefined ? 0 : op.offset) };
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
    var rl = rollen(ctx), act = Object.create(null), pauze = Object.create(null), maxAb = 0;
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
      } else if (r.kaart === rl.pauzeer) {
        if (r.doel !== null) pauze[r.doel] = true;
      } else if (r.kaart === rl.hervat) {
        if (r.doel !== null) delete pauze[r.doel];
      } else if (ab().indexOf(r.kaart) >= 0) {
        act[r.kaart] = true;
      }
      maxAb = Math.max(maxAb, tel());
    });
    return { act: act, pauze: pauze, maxAb: maxAb, ab: ab, tel: tel };
  }
  // Benoemde set (bv. "resistent") op een moment: basis uit waar[naam] of episode[naam], aangevuld door gebeurtenissen (zet).
  function setNaam(ctx, naam) {
    if (typeof naam !== "string" || naam === "") fout("'uitSet' moet de naam van een set zijn.");
    var bekend = false;
    var tegen = heeft(TEGENSET, naam) ? TEGENSET[naam] : null;
    var basis = (isObj(ctx.waar) && heeft(ctx.waar, naam) && ISARR(ctx.waar[naam]) && ctx.waar[naam]) ||
      (isObj(ctx.episode) && heeft(ctx.episode, naam) && ISARR(ctx.episode[naam]) && ctx.episode[naam]) || null;
    if (basis) bekend = true;
    var defs = lijst(ctx.episode && ctx.episode.gebeurtenissen);
    defs.forEach(function (d) {
      if (d && isObj(d.zet) && heeft(d.zet, naam)) bekend = true;
    });
    if (tegen !== null) bekend = true;   // een set met een tegenset (resistent en gevoelig) is altijd bekend
    if (!bekend) fout("Onbekende set '" + naam + "' (niet in de data van de episode).");
    return { basis: basis, tegen: tegen, defs: defs };
  }
  function benoemdeSet(ctx, naam, m) {
    var si = setNaam(ctx, naam), basis = si.basis, tegen = si.tegen, defs = si.defs;
    var uit = Object.create(null);
    if (basis) basis.forEach(function (x) { uit[x] = true; });
    lijst(ctx.gebeurtenissen).forEach(function (ge) {
      if (!ge || (m.maxDag !== undefined && !(ge.dag <= m.maxDag))) return;
      var def = null;
      defs.forEach(function (d) { if (!def && d && d.id === ge.id) def = d; });
      if (!def || !isObj(def.zet)) return;
      if (heeft(def.zet, naam)) lijst(def.zet[naam]).forEach(function (x) { uit[x] = true; });
      if (tegen !== null && heeft(def.zet, tegen)) lijst(def.zet[tegen]).forEach(function (x) { delete uit[x]; });
    });
    return uit;
  }

  /* ---------- vergelijken ---------- */
  function vergelijk(op, a, b) {
    // operator en types zijn al gevalideerd (valOperator, valGetal, waar-validatie)
    if (op === "==" || op === "=") return a === b;
    if (op === "!=") return a !== b;
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
      if (op.dag !== undefined) return op.dag;
      if (op.eindeBeurtNaGebeurtenis !== undefined) {
        var d = gebDag(ctx, op.eindeBeurtNaGebeurtenis);
        return d === null ? null : d + (op.offset === undefined ? 0 : op.offset);
      }
    }
    fout("Onbekend moment in 'op' bij 'klachten': " + JSON.stringify(op) + ".");
  }

  /* ---------- validatie (eager, onafhankelijk van de spelstand) ----------
     Alles wat uit de data van het predicaat, de casus en de episode te controleren is, wordt gecontroleerd
     VOORDAT er een waarde wordt gegeven: veldnamen, types, operatoren, verwijzingen naar sets (kaartUit,
     uitSet), medicatie, gebeurtenissen, ware waarden, rollen en antibiotica. Of een gebeurtenis al geweest
     is of een kaart al gespeeld, speelt geen rol. Ook alle onderdelen van en/of/niet/alsDan worden gecontroleerd. */
  // Velden met een id of lijst van ids (kaart, start, middel, optieNiet): null, een lege tekst of een
  // niet-tekst is een fout. Alleen 'doel' en 'optie' mogen null zijn (= "geen doel"/"geen optie").
  function valLijstTekst(x, wat) {
    if (x === null) fout("'" + wat + "' mag niet null zijn: geef een id (tekst) of een lijst van ids.");
    lijst(x).forEach(function (v) { if (!isId(v)) fout("'" + wat + "' moet een id (tekst) of een lijst van ids zijn (kreeg " + JSON.stringify(x) + ")."); });
  }
  function valNietLeeg(x, wat) {
    valLijstTekst(x, wat);
    if (ISARR(x) && x.length === 0) fout("'" + wat + "' mag geen lege lijst zijn.");
  }
  function valGebeurtenis(ctx, id, wat) {
    if (!isId(id)) fout("'" + wat + "' moet een gebeurtenis-id (tekst) zijn.");
    var defs = ctx.episode && ctx.episode.gebeurtenissen;
    if (ISARR(defs) && defs.length > 0 && !defs.some(function (d) { return isObj(d) && d.id === id; })) {
      fout("Onbekende gebeurtenis '" + id + "' in '" + wat + "' (niet in episode.gebeurtenissen).");
    }
  }
  function valGetal(x, wat) { if (!isGetal(x)) fout("'" + wat + "' moet een getal zijn."); }
  function valHeel(x, wat) {
    valGetal(x, wat);
    if (!isHeel(x)) fout("'" + wat + "' moet een geheel getal zijn (kreeg " + x + ").");
  }
  function valOperator(op) { if (VERGELIJK.indexOf(op) < 0) fout("Onbekende vergelijkingsoperator '" + op + "'."); }
  function valK(p, veld, ctx) {
    var K = leesK(p, veld);
    if (K.kaart !== undefined) valNietLeeg(K.kaart, "kaart");
    if (K.kaartUit !== undefined) {
      if (typeof K.kaartUit !== "string" || !isObj(ctx.episode) || !heeft(ctx.episode, K.kaartUit) || !ISARR(ctx.episode[K.kaartUit])) {
        fout("Onbekende set '" + K.kaartUit + "' in de episode (kaartUit).");
      }
    }
    if (K.start !== undefined) { valNietLeeg(K.start, "start"); rollen(ctx); }
    if (K.doel !== undefined && K.doel !== null && typeof K.doel !== "string") fout("'doel' moet een id (tekst) of null zijn.");
    if (K.optie !== undefined && K.optie !== null && typeof K.optie !== "string") fout("'optie' moet een tekst of null zijn.");
    if (K.optieNiet !== undefined) valLijstTekst(K.optieNiet, "optieNiet");   // null is een fout; geen uitsluiting = veld weglaten of []
    if (K.naGebeurtenis !== undefined) valGebeurtenis(ctx, K.naGebeurtenis, "naGebeurtenis");
    if (K.voorGebeurtenis !== undefined) valGebeurtenis(ctx, K.voorGebeurtenis, "voorGebeurtenis");
    return K;
  }
  function valOffset(op) { if (op.offset !== undefined) valHeel(op.offset, "offset"); }
  function valMoment(op, ctx) {
    if (op === undefined) return;   // zonder 'op': de eindstand. 'op: null' is een fout.
    if (!isObj(op)) fout("Onbekend moment in 'op': " + JSON.stringify(op) + ".");
    controleerVelden(op, MOMENT_VELDEN, "moment", "op");
    var soorten = ["dag", "eindeBeurtNaGebeurtenis", "naKaart"].filter(function (v) { return op[v] !== undefined; });
    if (soorten.length !== 1) fout("Onbekend moment in 'op': " + JSON.stringify(op) + ". Kies precies één van dag, eindeBeurtNaGebeurtenis of naKaart.");
    if (op.offset !== undefined && soorten[0] !== "eindeBeurtNaGebeurtenis") fout("'offset' hoort alleen bij 'eindeBeurtNaGebeurtenis'.");
    if (soorten[0] === "dag") valHeel(op.dag, "op.dag");
    if (soorten[0] === "eindeBeurtNaGebeurtenis") { valGebeurtenis(ctx, op.eindeBeurtNaGebeurtenis, "eindeBeurtNaGebeurtenis"); valOffset(op); }
    if (soorten[0] === "naKaart") valK({ p: "op", K: op.naKaart }, "K", ctx);
  }
  function valKlachtMoment(op, ctx) {
    if (op === "laatste") return;
    if (!isObj(op)) fout("Onbekend moment in 'op' bij 'klachten': " + JSON.stringify(op) + ".");
    controleerVelden(op, ["dag", "eindeBeurtNaGebeurtenis", "offset"], "moment", "op");
    var soorten = ["dag", "eindeBeurtNaGebeurtenis"].filter(function (v) { return op[v] !== undefined; });
    if (soorten.length !== 1) fout("Onbekend moment in 'op' bij 'klachten': " + JSON.stringify(op) + ".");
    if (op.offset !== undefined && soorten[0] !== "eindeBeurtNaGebeurtenis") fout("'offset' hoort alleen bij 'eindeBeurtNaGebeurtenis'.");
    if (soorten[0] === "dag") valHeel(op.dag, "op.dag");
    else { valGebeurtenis(ctx, op.eindeBeurtNaGebeurtenis, "eindeBeurtNaGebeurtenis"); valOffset(op); }
  }
  function valAantal(x, wat) { valHeel(x, wat); if (x < 0) fout("'" + wat + "' mag niet negatief zijn (kreeg " + x + ")."); }
  function valAntibiotica(ctx) { antibiotica(ctx); rollen(ctx); }

  var VAL = {
    gespeeld: function (p, ctx) { valK(p, "K", ctx); },
    nietGespeeld: function (p, ctx) { valK(p, "K", ctx); },
    voor: function (p, ctx) { valK(p, "a", ctx); valK(p, "b", ctx); },
    na: function (p, ctx) { valK(p, "a", ctx); valK(p, "b", ctx); },
    binnenBeurten: function (p, ctx) {
      valK(p, "K", ctx); vereis(p, ["naGebeurtenis", "n"]);
      valGebeurtenis(ctx, p.naGebeurtenis, "naGebeurtenis"); valAantal(p.n, "n");
    },
    binnenBeurtenNaKaart: function (p, ctx) {
      valK(p, "K", ctx); valK(p, "naKaart", ctx); vereis(p, ["n"]); valAantal(p.n, "n");
    },
    opDagRelatief: function (p, ctx) {
      valK(p, "K", ctx); valK(p, "anker", ctx); vereis(p, ["van"]); valHeel(p.van, "van");
      if (p.tot !== undefined) {
        valHeel(p.tot, "tot");
        if (p.van > p.tot) fout("Bij 'opDagRelatief' mag 'van' (" + p.van + ") niet groter zijn dan 'tot' (" + p.tot + ").");
      }
    },
    gestart: function (p, ctx) {
      vereis(p, ["middel"]); valNietLeeg(p.middel, "middel"); rollen(ctx);
      lijst(p.middel).forEach(function (x) {
        if (antibiotica(ctx).indexOf(x) < 0) fout("'" + x + "' is geen antibioticum (niet in episode.antibiotica); 'gestart' geldt alleen voor antibiotica.");
      });
    },
    actief: function (p, ctx) {
      valMoment(p.op, ctx);
      valAntibiotica(ctx);
      if (p.middel !== undefined) {
        valNietLeeg(p.middel, "middel");
        lijst(p.middel).forEach(function (x) {
          if (antibiotica(ctx).indexOf(x) < 0) fout("'" + x + "' is geen antibioticum (niet in episode.antibiotica); 'actief' geldt alleen voor antibiotica.");
        });
      }
      if (p.uitSet !== undefined) setNaam(ctx, p.uitSet);
    },
    aantalActieveAntibiotica: function (p, ctx) {
      vereis(p, ["op", "n"]); valOperator(p.op); valHeel(p.n, "n"); valAntibiotica(ctx);
    },
    medicatieActief: function (p, ctx) {
      vereis(p, ["id"]);
      if (!isId(p.id)) fout("'id' moet een medicatie-id (tekst) zijn.");
      var med = ctx.episode && ctx.episode.patient && ctx.episode.patient.medicatie;
      if (!ISARR(med)) fout("De episode heeft geen lijst 'patient.medicatie'; die is nodig voor 'medicatieActief'.");
      if (!med.some(function (x) { return x === p.id || (isObj(x) && x.id === p.id); })) {
        fout("Onbekende medicatie '" + p.id + "' (niet in patient.medicatie van de episode).");
      }
      valMoment(p.op, ctx); rollen(ctx);
    },
    waar: function (p, ctx) {
      vereis(p, ["veld", "op", "waarde"]); valOperator(p.op);
      if (!isId(p.veld)) fout("'veld' moet de naam (tekst) van een ware waarde zijn.");
      // null is alleen een geldige waarde bij ==, = en != (een ware waarde die bewust leeg is).
      if (typeof p.waarde !== "string" && typeof p.waarde !== "boolean" && !isGetal(p.waarde) &&
          !(p.waarde === null && (p.op === "==" || p.op === "=" || p.op === "!="))) fout("'waarde' bij 'waar' moet een tekst, getal of waar/onwaar zijn (kreeg " + JSON.stringify(p.waarde) + ").");
      if (!isObj(ctx.waar) || !heeft(ctx.waar, p.veld)) fout("Het veld '" + p.veld + "' staat niet in de ware waarden van de patiënt.");
      if (p.op !== "==" && p.op !== "=" && p.op !== "!=" && (!isGetal(ctx.waar[p.veld]) || !isGetal(p.waarde))) {
        fout("De operator '" + p.op + "' vergelijkt alleen getallen (kreeg " + JSON.stringify(ctx.waar[p.veld]) + " en " + JSON.stringify(p.waarde) + ").");
      }
    },
    inToestand: function (p) { vereis(p, ["t"]); if (!isId(p.t)) fout("'t' moet een toestand-id (tekst) zijn."); },
    gebeurtenisGeweest: function (p, ctx) { vereis(p, ["id"]); valGebeurtenis(ctx, p.id, "id"); },
    klachten: function (p, ctx) {
      vereis(p, ["waarde"]);
      if (KLACHT_WAARDEN.indexOf(p.waarde) < 0) fout("Onbekende klachtenstatus '" + p.waarde + "'.");
      if (p.op !== undefined) valKlachtMoment(p.op, ctx);
    },
    tel: function (p, ctx) {
      vereis(p, ["teller", "op", "waarde"]); valOperator(p.op); valHeel(p.waarde, "waarde"); valTeller(p.teller, ctx);
    },
    en: function (p, ctx) {
      if (!ISARR(p.args)) fout("Het predicaat 'en' vraagt een lijst 'args'.");
      p.args.forEach(function (a) { valideerPred(a, ctx); });
    },
    of: function (p, ctx) {
      if (!ISARR(p.args)) fout("Het predicaat 'of' vraagt een lijst 'args'.");
      p.args.forEach(function (a) { valideerPred(a, ctx); });
    },
    niet: function (p, ctx) { vereis(p, ["arg"]); valideerPred(p.arg, ctx); },
    alsDan: function (p, ctx) { vereis(p, ["als", "dan"]); valideerPred(p.als, ctx); valideerPred(p.dan, ctx); },
    waarheid: function (p) {
      if (p.waarde !== true && p.waarde !== false) fout("Het predicaat 'waarheid' vraagt waarde true of false.");
    }
  };
  var GEEN_CTX = "Er is geen geldige context (ctx) meegegeven: gebruik Predicaten.maakContext(casus, episode, state) (een casus, episode of kale state is geen ctx).";
  function valideerPred(pred, ctx) {
    if (!isObj(pred)) fout("Een predicaat moet een object zijn met een veld 'p' (kreeg " + JSON.stringify(pred) + ").");
    if (typeof pred.p !== "string") fout("Een predicaat mist het veld 'p' (de naam van het predicaat).");
    if (!heeft(VAL, pred.p)) fout("Onbekend predicaat '" + pred.p + "'.");
    if (!isCtx(ctx)) fout(GEEN_CTX);
    controleerVelden(pred, VELDEN[pred.p], "predicaat", pred.p);
    VAL[pred.p](pred, ctx);
  }
  var VALT = {
    gespeeld: function (t, ctx) {
      valK(t, "K", ctx);
      if (t.terwijlKlachten !== undefined && KLACHT_WAARDEN.indexOf(t.terwijlKlachten) < 0) {
        fout("Onbekende klachtenstatus '" + t.terwijlKlachten + "' in 'terwijlKlachten'.");
      }
    },
    aantalActieveAntibiotica: function (t, ctx) {
      if (t.op !== "max") fout("De teller 'aantalActieveAntibiotica' kent alleen op: \"max\".");
      valAntibiotica(ctx);
    }
  };
  function valTeller(teller, ctx) {
    if (!isObj(teller) || typeof teller.t !== "string") fout("Een teller moet een object met een veld 't' zijn.");
    if (!heeft(VALT, teller.t)) fout("Onbekende teller '" + teller.t + "'.");
    if (!isCtx(ctx)) fout(GEEN_CTX);
    controleerVelden(teller, TELLER_VELDEN[teller.t], "teller", teller.t);
    VALT[teller.t](teller, ctx);
  }

  /* ---------- tellers (contract 3b) ---------- */
  var TELLERS = {
    gespeeld: function (t, ctx) {
      var K = leesK(t, "K"), n = 0;
      alle(ctx, K).forEach(function (r) {
        if (t.terwijlKlachten === undefined || ctx.status(r.dag) === t.terwijlKlachten) n++;
      });
      return n;
    },
    aantalActieveAntibiotica: function (t, ctx) { return simuleer(ctx, {}).maxAb; }
  };
  function tel(teller, ctx) {
    valTeller(teller, ctx);
    return TELLERS[teller.t](teller, ctx);
  }

  /* ---------- predicaten (alleen aangeroepen na validatie) ---------- */
  // en/of/alsDan evalueren ALLE onderdelen (geen kortsluiting). Evalueren is puur, dus dit kost alleen rekentijd.
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
      var K = leesK(p, "K");
      var d = gebDag(ctx, p.naGebeurtenis);
      if (d === null) return false;
      return alle(ctx, K).some(function (r) { return r.dag >= d && r.dag <= d + p.n - 1; });
    },
    binnenBeurtenNaKaart: function (p, ctx) {
      var K = leesK(p, "K"), A = leesK(p, "naKaart");
      var a = eerste(ctx, A);
      if (a === null) return false;
      return alle(ctx, K).some(function (r) { return r.dag >= a.dag && r.dag <= a.dag + p.n - 1; });
    },
    opDagRelatief: function (p, ctx) {
      var K = leesK(p, "K"), A = leesK(p, "anker");
      var tot = p.tot === undefined ? Infinity : p.tot;
      var a = eerste(ctx, A);
      if (a === null) return false;
      return alle(ctx, K).some(function (r) { var v = r.dag - a.dag; return v >= p.van && v <= tot; });
    },
    gestart: function (p, ctx) { return eerste(ctx, { start: p.middel }) !== null; },
    actief: function (p, ctx) {
      var m = moment(p.op, ctx);
      if (m === null) return false;
      var s = simuleer(ctx, m), kand;
      if (p.middel !== undefined) kand = lijst(p.middel);
      else kand = s.ab();
      kand = kand.filter(function (x) { return s.act[x]; });
      if (p.uitSet !== undefined) {
        var set = benoemdeSet(ctx, p.uitSet, m);
        kand = kand.filter(function (x) { return set[x]; });
      }
      return kand.length > 0;
    },
    aantalActieveAntibiotica: function (p, ctx) { return vergelijk(p.op, simuleer(ctx, {}).maxAb, p.n); },
    medicatieActief: function (p, ctx) {
      var m = moment(p.op, ctx);
      if (m === null) return false;
      return !simuleer(ctx, m).pauze[p.id];
    },
    waar: function (p, ctx) { return vergelijk(p.op, ctx.waar[p.veld], p.waarde); },
    inToestand: function (p, ctx) { return lijst(ctx.toestanden).indexOf(p.t) >= 0; },
    gebeurtenisGeweest: function (p, ctx) { return gebDag(ctx, p.id) !== null; },
    klachten: function (p, ctx) {
      if (p.op === undefined) return lijst(ctx.klachten).some(function (k) { return k && k.status === p.waarde; });
      if (p.op === "laatste") return ctx.status(ctx.laatsteDag) === p.waarde;
      var d = klachtDag(p.op, ctx);
      return d !== null && ctx.status(d) === p.waarde;
    },
    tel: function (p, ctx) { return vergelijk(p.op, TELLERS[p.teller.t](p.teller, ctx), p.waarde); },
    en: function (p, ctx) { return p.args.map(function (a) { return ev(a, ctx); }).every(function (x) { return x; }); },
    of: function (p, ctx) { return p.args.map(function (a) { return ev(a, ctx); }).some(function (x) { return x; }); },
    niet: function (p, ctx) { return !ev(p.arg, ctx); },
    alsDan: function (p, ctx) { var als = ev(p.als, ctx), dan = ev(p.dan, ctx); return !als || dan; },
    waarheid: function (p) { return p.waarde; }
  };
  function ev(pred, ctx) { return PRED[pred.p](pred, ctx) === true; }

  function evalueer(pred, ctx) {
    valideerPred(pred, ctx);
    return ev(pred, ctx);
  }
  // valideer(pred, ctx) of valideer(pred, casus, episode): controleert een predicaat (of teller {t:..}) volledig
  // tegen casus en episode, zonder tijdlijn of spelstand. Geeft niets terug; bij een fout een Error met Nederlandse tekst.
  function valideer(pred, casusOfCtx, episode) {
    var ctx = casusOfCtx;
    if (!isCtx(ctx)) {
      ctx = maakContext(casusOfCtx, episode, {});
    }
    if (isObj(pred) && pred.p === undefined && pred.t !== undefined) valTeller(pred, ctx);
    else valideerPred(pred, ctx);
  }

  g.Predicaten = {
    versie: "1.1",
    namen: KEYS(PRED),
    tellerNamen: KEYS(TELLERS),
    maakContext: maakContext,
    valideer: valideer,
    evalueer: evalueer,
    tel: tel
  };
})(typeof window !== "undefined" ? window : globalThis);

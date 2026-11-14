#!/usr/bin/env node
/* Routezoeker voor Epic green cards.

   Speelt met de ECHTE spelmotor (engine/engine.js) en de ECHTE regels (regels/*.js, casussen/*.js) heel veel kaartvolgordes
   en schrijft een leesbaar Nederlands rapport voor de opdrachtgever.

   Gebruik:
     node tools/routezoeker.js                 standaard zoektocht (ongeveer 1 à 2 minuten)
     node tools/routezoeker.js --seed=7        andere (vaste) seed; zelfde seed = zelfde rapport
     node tools/routezoeker.js --grondig       vijf keer zoveel routes (duurt navenant langer)
     node tools/routezoeker.js --factor=2.5    eigen vermenigvuldiging van de zoekbudgetten
     node tools/routezoeker.js --episode=E3    alleen deze episode(s), komma-gescheiden
     node tools/routezoeker.js --casus=<id>    andere casus uit window.CASUSSEN (standaard de eerste)
     node tools/routezoeker.js --uit=pad.html  ander uitvoerbestand (de JSON komt ernaast)

   Uitvoer: tools/routezoeker-rapport.html (op zichzelf staand) en tools/routezoeker-rapport.json.

   Ontwerp:
   - Er staan GEEN kaart-id's, middelnamen, toestanden of drempels in dit script. Alles komt uit de casusdata (repertoire,
     doelen, opties, gebeurtenissen, invarianten, regelnamen, knoppen) en de uitkomst komt uit Engine.rondAf / Evaluatie.
     Of een kaart op een moment mag, beslist de engine (speelKaart weigert); de zoeker probeert alleen.
   - Een route = per dag een lijst kaarten (kaart, doel, optie). Na de laatste kaart rondt de speler af zodra de engine dat
     toestaat (anders een dag verder en opnieuw proberen). Variant "doorspelen" speelt eerst door tot de laatste dag.
   - De volgorde van gebeurtenissen in een groep (bv. A en B) stuurt de zoeker via de bestaande engine-optie rng: per
     volgorde worden de waarden berekend die de Fisher-Yates-trekking van de engine precies die volgorde laten kiezen.
     Daarna controleert de zoeker in de spelstand dat de engine echt die volgorde koos.
   - Reproduceerbaar: een eigen gezaaide toevalsgenerator (mulberry32); zoekbudgetten zijn aantallen, geen tijd.
     Math.random wordt tijdens het zoeken tijdelijk door de gezaaide generator vervangen.
   - Robuust: onbekende uitkomsten (bv. "verloren") worden een eigen categorie; een fout in de engine of de regels wordt
     per route geteld en in het rapport getoond in plaats van het script te laten stoppen. */
"use strict";

const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "..");

/* ================= argumenten ================= */
const ARGS = process.argv.slice(2);
function arg(naam, standaard) {
  const a = ARGS.find((x) => x === "--" + naam || x.startsWith("--" + naam + "="));
  if (!a) return standaard;
  return a.includes("=") ? a.slice(a.indexOf("=") + 1) : true;
}
const SEED = parseInt(arg("seed", "20261114"), 10) >>> 0;
const GRONDIG = !!arg("grondig", false);
const FACTOR = parseFloat(arg("factor", GRONDIG ? "5" : "1")) || 1;
const EP_FILTER = arg("episode", null);
const UIT_HTML = path.resolve(arg("uit", path.join(ROOT, "tools", "routezoeker-rapport.html")));
const UIT_JSON = UIT_HTML.replace(/\.html?$/i, "") + ".json";
const STIL = !!arg("stil", false);
function log(...x) { if (!STIL) console.error(...x); }

/* ================= laden (zoals gauntlet/tools/run-node.js) ================= */
globalThis.window = globalThis;
const BESTANDEN = ["casussen/uwi.js", "regels/predicaten.js", "regels/evaluatie.js", "engine/engine.js"];
for (const f of BESTANDEN) {
  try { vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), "utf8"), { filename: f }); }
  catch (e) { console.error("Kan " + f + " niet laden: " + e.message + "\nDe routezoeker heeft de echte engine en regels nodig; probeer het later opnieuw."); process.exit(2); }
}
let ROUTES_GELADEN = false, ROUTES_FOUT = null;
try {   // optioneel: de geldige routes en foutroutes uit de casus als speelbare plannen
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, "tests/routes.js"), "utf8"), { filename: "tests/routes.js" });
  ROUTES_GELADEN = !!(globalThis.Routes && Array.isArray(globalThis.Routes.lijst));
} catch (e) { ROUTES_FOUT = e.message; }

const Engine = globalThis.Engine, Evaluatie = globalThis.Evaluatie, Predicaten = globalThis.Predicaten;
if (!Engine || !Evaluatie) { console.error("De engine of de evaluatie is niet beschikbaar na het laden."); process.exit(2); }
const CASUSSEN = globalThis.CASUSSEN || [];
const CASUS_ID = arg("casus", null);
const CASUS = CASUS_ID ? CASUSSEN.find((c) => c.id === CASUS_ID) : CASUSSEN[0];
if (!CASUS) { console.error("Casus niet gevonden" + (CASUS_ID ? ": " + CASUS_ID : "") + "."); process.exit(2); }

/* ================= toeval ================= */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashTekst(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function maakToeval(sleutel) {
  const r = mulberry32((SEED ^ hashTekst(sleutel)) >>> 0);
  r.int = (n) => Math.floor(r() * n);
  r.kies = (lijst) => lijst[Math.floor(r() * lijst.length)];
  r.schud = (lijst) => { const a = lijst.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  return r;
}
const ORIGINEEL_RANDOM = Math.random;
Math.random = maakToeval("Math.random");

/* ================= budgetten (aantallen, niet tijd: reproduceerbaar) ================= */
const B = {
  volledigMax: Math.round(70000 * Math.max(1, FACTOR)),   // max. aantal kaartcombinaties voor volledig aftellen (per indeling)
  willekeurig: Math.round(2000 * FACTOR),                // willekeurige routes per volgorde
  evolutie: Math.round(6000 * FACTOR),                   // gerichte mutaties per volgorde
  doorspelen: Math.round(1500 * FACTOR),
  uitstelBasis: Math.max(3, Math.round(10 * FACTOR)),    // slagende routes voor de uitsteltoets, per volgorde
  buurtRoutes: Math.max(2, Math.round(8 * FACTOR)),      // bijna-slagers waarvan de hele 1-stapsbuurt wordt gespeeld, per volgorde                 // slagende routes die ook "doorgespeeld tot de laatste dag" worden, per volgorde
  minimaliseer: Math.round(24 * FACTOR),                 // slagende routes die worden ingekort, per volgorde
  gratisBasis: Math.max(2, Math.round(6 * FACTOR)),       // slagende basisroutes voor de toets "gratis kaart", per volgorde
  speelAllesBasis: Math.max(2, Math.round(3 * FACTOR)),   // basisroutes voor "speel alles", per volgorde
  voorbeelden: 5
};

/* ================= hulpjes over de data ================= */
function lijst(x) { return x == null ? [] : (Array.isArray(x) ? x : [x]); }
function kaartVan(id) { return (CASUS.kaarten || []).find((k) => k.id === id) || null; }
function kaartLabel(id) { const k = kaartVan(id); return k ? k.label || id : id; }
function regelNaam(ep, invId) {
  const r = lijst(CASUS.regelnamen).find((x) => x && x.episode === ep.id && x.invariant === invId);
  const inv = lijst(ep.invarianten).find((x) => x.id === invId);
  return (r && r.naam) || (inv && inv.naam) || null;
}
function regelTekst(ep, invId) { const n = regelNaam(ep, invId); return n ? n + " (" + invId + ")" : invId; }
function epNaam(ep) { return ep.titel || ("Episode " + (ep.level != null ? ep.level : ep.id)); }
function gebeurtenisNaam(ep, id) { const e = lijst(ep.gebeurtenissen).find((x) => x.id === id); return (e && e.titel ? e.titel : id) + " (" + id + ")"; }

// Alle denkbare acties (kaart, doel, optie) van een episode, uit de data. Of ze op een moment mogen, beslist de engine.
function actiesVan(ep) {
  const uit = [];
  for (const kid of lijst(ep.repertoire)) {
    const k = kaartVan(kid);
    if (!k) continue;
    const doelLijst = k.doelen && k.doelen[ep.id];
    let doelen;
    if (doelLijst) doelen = doelLijst.map((d) => ({ id: d.id, label: d.label || d.id }));
    else if (k.opties) doelen = Object.keys(k.opties).map((d) => ({ id: d, label: d }));
    else if (k.doelkaart) doelen = [];
    else doelen = [null];
    for (const d of doelen) {
      let opties = [null];
      if (d && k.opties) opties = lijst(k.opties[d.id]).map((o) => (typeof o === "string" ? o : (o.tekst != null ? o.tekst : o.id)));
      for (const o of opties) {
        const key = kid + (d ? ">" + d.id : "") + (o != null ? ">" + o : "");
        uit.push({ kaart: kid, doel: d ? d.id : null, doelLabel: d ? d.label : null, optie: o, key: key });
      }
    }
  }
  return uit;
}

/* ================= routes ================= */
function kopieRoute(r) { return r.map((d) => d.slice()); }
function trim(r) { const a = kopieRoute(r); while (a.length && !a[a.length - 1].length) a.pop(); return a; }
function routeSleutel(r) { return trim(r).map((d) => d.map((a) => a.key).join("+")).join("|"); }
function aantalKaarten(r) { return r.reduce((n, d) => n + d.length, 0); }
function aantalDagenGebruikt(r) { return trim(r).length; }
function routeKaartIds(r) { const s = new Set(); r.forEach((d) => d.forEach((a) => s.add(a.kaart))); return s; }
function actieTekst(a) {
  let t = kaartLabel(a.kaart) + " (" + a.kaart + ")";
  if (a.doel != null) t += " → " + (a.doelLabel || a.doel);
  if (a.optie != null) t += ": " + a.optie;
  return t;
}
function routeTekst(r) {
  const delen = [];
  trim(r).forEach((d, i) => { if (d.length) delen.push("Dag " + (i + 1) + ": " + d.map(actieTekst).join(", ")); });
  return delen.length ? delen.join(" · ") : "(geen kaarten)";
}

/* ================= volgordes van gebeurtenissen ================= */
function permutaties(a) {
  if (a.length <= 1) return [a.slice()];
  const uit = [];
  a.forEach((x, i) => { permutaties(a.slice(0, i).concat(a.slice(i + 1))).forEach((p) => uit.push([x].concat(p))); });
  return uit;
}
function fyWaarden(ids, perm) {   // rng-waarden waarmee de Fisher-Yates-trekking van de engine precies `perm` oplevert
  const a = ids.slice(), n = a.length, w = [];
  for (let i = 0; i < n - 1; i++) {
    const j = a.indexOf(perm[i]);
    w.push((j - i + 0.5) / (n - i));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return w;
}
function volgordesVan(ep) {
  const groepen = {}, ids = [];
  lijst(ep.gebeurtenissen).forEach((e) => { if (!e.groep) return; if (!groepen[e.groep]) { groepen[e.groep] = []; ids.push(e.groep); } groepen[e.groep].push(e.id); });
  let combis = [{ perm: {}, waarden: [] }];
  for (const g of ids) {
    const nieuw = [];
    for (const c of combis) for (const p of permutaties(groepen[g])) {
      const perm = Object.assign({}, c.perm); perm[g] = p;
      nieuw.push({ perm: perm, waarden: c.waarden.concat(fyWaarden(groepen[g], p)) });
    }
    combis = nieuw;
  }
  return combis.map((c, i) => {
    const label = ids.length ? ids.map((g) => c.perm[g].map((id) => gebeurtenisNaam(ep, id)).join(" vóór ")).join("; ") : "één vaste volgorde (geen wisselende gebeurtenissen)";
    const kort = ids.length ? ids.map((g) => c.perm[g].join(" vóór ")).join("; ") : "—";
    return { index: i, perm: c.perm, waarden: c.waarden, label: label, kort: kort, gestuurd: true };
  });
}
function rngVoor(volgorde) {
  let i = 0;
  return function () { return i < volgorde.waarden.length ? volgorde.waarden[i++] : 0.5; };
}

/* ================= één route spelen ================= */
const TELLING = { gespeeld: 0, cache: 0 };
// Afloop volgens de evaluatie. Bekend: "gehaald" / "nietGehaald" (via poortGehaald) en elke andere afloop (bv. "verloren")
// wordt een eigen categorie met die naam. Oudere evaluaties zonder 'afloop' vallen terug op poortGehaald.
const STANDAARD = ["geslaagd", "gezakt", "onspeelbaar", "fout", "onbekend"];
function isAndereAfloop(status) { return STANDAARD.indexOf(status) < 0; }
function isZak(res) { return res.status === "gezakt" || isAndereAfloop(res.status); }
function afloopVan(state, uit) {
  const kandidaten = [uit && uit.afloop, uit && uit.einde && typeof uit.einde === "object" ? uit.einde.uitkomst : null,
    uit && typeof uit.einde === "string" ? uit.einde : null, uit && uit.status, state && state.afloop];
  for (const v of kandidaten) if (typeof v === "string" && v && !/^(gehaald|nietGehaald|geslaagd|gezakt)$/.test(v)) return v;
  if ((uit && uit.verloren === true) || (state && state.verloren === true)) return "verloren";
  return null;
}
function gestarteMiddelen(ep, state) {
  try {
    const ctx = Predicaten.maakContext(CASUS, ep, state);
    return lijst(ep.antibiotica).filter((m) => { try { return !!Predicaten.evalueer({ p: "gestart", middel: m }, ctx); } catch (e) { return false; } });
  } catch (e) {
    return lijst(ep.antibiotica).filter((m) => state.tijdlijn.some((r) => r.kaart === m));
  }
}

function maakSpeler(ep, volgorde) {
  const cache = new Map();
  const ctx = { ep: ep, volgorde: volgorde, cache: cache };
  ctx.speel = function (route, einde) {
    einde = einde || "zodraMogelijk";
    const sleutel = einde + "#" + routeSleutel(route);
    if (cache.has(sleutel)) { TELLING.cache++; return cache.get(sleutel); }
    const res = speelNu(ep, volgorde, trim(route), einde);
    res.sleutel = sleutel; res.einde = einde;
    cache.set(sleutel, res);
    TELLING.gespeeld++;
    return res;
  };
  return ctx;
}

function speelNu(ep, volgorde, route, einde) {
  const res = { route: route, status: null, geschonden: [], score: null, profiel: null, gebeurtenissen: [], wachtend: [], einddag: null, kaarten: aantalKaarten(route), middelen: [], melding: null };
  let state;
  try {
    state = Engine.nieuwSpel(CASUS, ep.id, { rng: rngVoor(volgorde) });
    for (const g of Object.keys(volgorde.perm)) {
      if (JSON.stringify(state.groepen && state.groepen[g]) !== JSON.stringify(volgorde.perm[g])) { volgorde.gestuurd = false; }
    }
    buiten:
    for (let d = 0; d < route.length; d++) {
      if (d > 0) {
        if (state.afgerond) break;
        if (Engine.eindeBereikt(state)) { res.status = "onspeelbaar"; res.melding = "Meer dagen dan de episode heeft."; return res; }
        try { Engine.volgendeDag(state); } catch (e) { if (state.afgerond) break; throw e; }
      }
      for (const a of route[d]) {
        if (state.afgerond) break buiten;
        const opts = {}; if (a.doel != null) opts.doel = a.doel; if (a.optie != null) opts.optie = a.optie;
        const r = Engine.speelKaart(state, a.kaart, opts);
        if (!r || !r.ok) {
          if (state.afgerond) break buiten;
          res.status = "onspeelbaar"; res.melding = "Dag " + (d + 1) + ", " + actieTekst(a) + ": " + ((r && r.fout) || "geweigerd"); return res;
        }
      }
    }
    let uit = state.afgerond ? state.uitkomst : null;
    if (!state.afgerond && einde === "laatsteDag") {
      while (!state.afgerond && !Engine.eindeBereikt(state) && state.dag < state.aantalDagen) Engine.volgendeDag(state);
    }
    for (let poging = 0; !state.afgerond && poging < (state.aantalDagen || 30) + 3; poging++) {
      try { uit = Engine.rondAf(state); }
      catch (e) {
        if (state.afgerond) { uit = state.uitkomst; break; }
        if (Engine.eindeBereikt(state)) throw e;
        Engine.volgendeDag(state);
      }
    }
    if (!uit) uit = state.uitkomst;
    if (!uit) throw new Error("Geen uitkomst na afronden.");
    const afloop = afloopVan(state, uit);
    res.status = afloop ? afloop : uit.poortGehaald === true ? "geslaagd" : uit.poortGehaald === false ? "gezakt" : "onbekend";
    if (uit.einde && typeof uit.einde === "object") res.eindeDoor = uit.einde.gebeurtenis || null;
    res.geschonden = lijst(uit.geschonden).map((x) => (x && x.id) || String(x));
    res.score = uit.score || null;
    res.profiel = (uit.profiel && uit.profiel.naam) || null;
  } catch (e) {
    res.status = "fout"; res.melding = String((e && e.message) || e);
  }
  if (state) {
    res.gebeurtenissen = lijst(state.gebeurtenissen).map((g) => ({ id: g.id, dag: g.dag }));
    res.wachtend = lijst(state.wachtend).map((w) => w.id);
    res.einddag = state.dag;
    if (res.status !== "fout") res.middelen = gestarteMiddelen(ep, state);
  }
  return res;
}

/* ================= mutaties ================= */
function mutatie(route, ep, acties, rnd) {
  const r = kopieRoute(route), D = ep.knoppen.aantalDagen;
  const posities = []; r.forEach((d, i) => d.forEach((a, j) => posities.push([i, j])));
  const soort = rnd.int(9);
  const willekeurigeDag = () => (rnd() < 0.7 ? rnd.int(Math.min(D, r.length + 2)) : rnd.int(D));
  function zetIn(dag, a) { while (r.length <= dag) r.push([]); r[dag].splice(rnd.int(r[dag].length + 1), 0, a); }
  if (soort <= 1 || !posities.length) {                        // kaart toevoegen
    const aanwezig = new Set(posities.map(([i, j]) => r[i][j].key));
    const kand = acties.filter((a) => !aanwezig.has(a.key));
    zetIn(willekeurigeDag(), rnd.kies(kand.length ? kand : acties));
  } else if (soort === 2) {                                    // kaart weglaten
    const [i, j] = rnd.kies(posities); r[i].splice(j, 1);
  } else if (soort === 3) {                                    // kaart verschuiven (een dag, of willekeurig)
    const [i, j] = rnd.kies(posities); const a = r[i].splice(j, 1)[0];
    const doel = rnd() < 0.6 ? Math.max(0, Math.min(D - 1, i + (rnd() < 0.5 ? -1 : 1))) : rnd.int(D);
    zetIn(doel, a);
  } else if (soort === 4) {                                    // volgorde binnen een dag
    const dagen = r.map((d, i) => i).filter((i) => r[i].length > 1);
    if (dagen.length) { const i = rnd.kies(dagen); const a = rnd.int(r[i].length); let b = rnd.int(r[i].length - 1); if (b >= a) b++; const t = r[i][a]; r[i][a] = r[i][b]; r[i][b] = t; }
  } else if (soort === 5) {                                    // ander doel of andere optie bij dezelfde kaart
    const [i, j] = rnd.kies(posities); const a = r[i][j];
    const zus = acties.filter((x) => x.kaart === a.kaart && x.key !== a.key);
    if (zus.length) r[i][j] = rnd.kies(zus);
  } else if (soort === 6) {                                    // kaart vervangen door een andere
    const [i, j] = rnd.kies(posities); r[i][j] = rnd.kies(acties);
  } else if (soort === 7) {                                    // kaart uitstellen tot de laatste dag
    const [i, j] = rnd.kies(posities); const a = r[i].splice(j, 1)[0];
    zetIn(D - 1, a);
  } else {                                                     // lege dag invoegen of weghalen
    if (rnd() < 0.5 && r.length < D) r.splice(rnd.int(r.length + 1), 0, []);
    else { const leeg = r.map((d, i) => i).filter((i) => !r[i].length); if (leeg.length) r.splice(rnd.kies(leeg), 1); }
  }
  return r;
}
function binnenGrenzen(route, ep) {
  return trim(route).length <= ep.knoppen.aantalDagen && route.every((d) => d.length <= ep.knoppen.actiesPerBeurt);
}

/* ================= zoekonderdelen ================= */
// Willekeurige route die alleen kaarten speelt die de engine op dat moment accepteert.
function willekeurigeRoute(sp, acties, rnd) {
  const ep = sp.ep, D = ep.knoppen.aantalDagen, N = ep.knoppen.actiesPerBeurt;
  const doelLengte = 1 + rnd.int(Math.min(acties.length, D * N));
  const state = Engine.nieuwSpel(CASUS, ep.id, { rng: rngVoor(sp.volgorde) });
  const route = [[]];
  let gespeeld = 0;
  try {
    for (let dag = 0; dag < D && gespeeld < doelLengte && !state.afgerond; dag++) {
      if (dag > 0) {
        const sprong = dag < D - 1 && rnd() < 0.04 ? D - 1 - dag : 0;   // soms meteen naar de laatste dag
        for (let s = 0; s < sprong && !state.afgerond; s++) { route.push([]); Engine.volgendeDag(state); }
        dag += sprong;
        route.push([]); Engine.volgendeDag(state); if (state.afgerond || Engine.eindeBereikt(state)) break;
      }
      const vandaag = rnd() < 0.15 ? 0 : 1 + rnd.int(N);
      for (let k = 0; k < vandaag && gespeeld < doelLengte && !state.afgerond; k++) {
        for (const a of rnd.schud(acties).slice(0, 25)) {
          const opts = {}; if (a.doel != null) opts.doel = a.doel; if (a.optie != null) opts.optie = a.optie;
          const r = Engine.speelKaart(state, a.kaart, opts);
          if (r && r.ok) { route[route.length - 1].push(a); gespeeld++; break; }
        }
      }
    }
  } catch (e) { /* engine-fout: de route tot hier wordt via sp.speel nog eens netjes gespeeld en geteld */ }
  return trim(route);
}

function minimaliseer(sp, route) {
  let huidig = trim(route);
  let veranderd = true;
  while (veranderd) {
    veranderd = false;
    const pos = []; huidig.forEach((d, i) => d.forEach((a, j) => pos.push([i, j])));
    for (const [i, j] of pos) {
      const r = kopieRoute(huidig); r[i].splice(j, 1);
      if (sp.speel(r).status === "geslaagd") { huidig = trim(r); veranderd = true; break; }
    }
    if (veranderd) continue;
    for (let i = 0; i < huidig.length; i++) {        // lege dag weghalen (alles schuift een dag naar voren)
      if (huidig[i].length) continue;
      const r = kopieRoute(huidig); r.splice(i, 1);
      if (sp.speel(r).status === "geslaagd") { huidig = trim(r); veranderd = true; break; }
    }
  }
  return huidig;
}

function scoreNietLager(basis, nieuw) {
  if (!basis) return true;
  if (!nieuw) return false;
  return Object.keys(basis).every((as) => basis[as] == null || (nieuw[as] != null && nieuw[as] >= basis[as]));
}
function invoegPosities(route, ep) {
  const D = ep.knoppen.aantalDagen, uit = [];
  const tot = Math.min(D, route.length + 1);
  for (let i = 0; i < tot; i++) { uit.push([i, "eind"]); if (route[i] && route[i].length) uit.push([i, "begin"]); }
  return uit;
}
function voegIn(route, i, waar, a) {
  const r = kopieRoute(route); while (r.length <= i) r.push([]);
  if (waar === "begin") r[i].unshift(a); else r[i].push(a);
  return r;
}
// Probeert actie a ergens in de route te zetten. Geeft { route, res, soort: "gratis"|"kostScore"|"breekt"|"onspeelbaar" }.
function probeerToevoegen(sp, route, basisRes, a) {
  let besteKost = null, breekt = null;
  for (const [i, waar] of invoegPosities(route, sp.ep)) {
    const r = voegIn(route, i, waar, a);
    if (!binnenGrenzen(r, sp.ep)) continue;
    const res = sp.speel(r);
    if (res.status === "geslaagd") {
      if (scoreNietLager(basisRes.score, res.score)) return { route: r, res: res, soort: "gratis" };
      if (!besteKost) besteKost = { route: r, res: res, soort: "kostScore" };
    } else if (res.status !== "onspeelbaar" && !breekt) breekt = { route: r, res: res, soort: "breekt" };
  }
  return besteKost || breekt || { soort: "onspeelbaar" };
}
function speelAlles(sp, basis, acties, rnd) {
  const basisRes = sp.speel(basis);
  let huidig = trim(basis), res = basisRes;
  for (let ronde = 0; ronde < 2; ronde++) {
    let erbij = false;
    for (const a of rnd.schud(acties)) {
      if (huidig.some((d) => d.some((x) => x.key === a.key))) continue;
      const p = probeerToevoegen(sp, huidig, basisRes, a);
      if (p.soort === "gratis") { huidig = trim(p.route); res = p.res; erbij = true; }
    }
    if (!erbij) break;
  }
  return { route: huidig, res: res, basisRes: basisRes };
}

/* ================= casusroutes uit tests/routes.js ================= */
function planNaarRoute(plan, acties) {
  const route = [[]];
  for (const tok of plan) {
    if (tok === "|") { route.push([]); continue; }
    if (typeof tok === "string" && tok.charAt(0) === "=") { const n = parseInt(tok.slice(1), 10); while (route.length < n) route.push([]); continue; }
    const d = String(tok).split(">");
    const key = d.join(">");
    let a = acties.find((x) => x.key === key);
    if (!a) a = { kaart: d[0], doel: d[1] || null, doelLabel: d[1] || null, optie: d[2] || null, key: key };
    route[route.length - 1].push(a);
  }
  return route;
}
function casusRoutesVan(ep, volgordes, acties) {
  if (!ROUTES_GELADEN) return [];
  const R = globalThis.Routes;
  // Welke routes.js-sleutel hoort bij welke volgorde: speel nieuwSpel met de rng van die sleutel en lees de getrokken volgorde.
  const sleutelNaarVolgorde = {};
  lijst(R.volgordes).forEach((v) => {
    try {
      const s = Engine.nieuwSpel(CASUS, ep.id, { rng: () => v.rng });
      const vo = volgordes.find((x) => Object.keys(x.perm).every((g) => JSON.stringify(s.groepen[g]) === JSON.stringify(x.perm[g])));
      if (vo) sleutelNaarVolgorde[v.sleutel] = vo.index;
    } catch (e) { /* negeren */ }
  });
  const uit = [];
  R.lijst.filter((r) => r.ep === ep.id).forEach((r) => {
    if (r.plannen) {
      Object.keys(r.plannen).forEach((sl) => {
        const vi = sleutelNaarVolgorde[sl];
        if (vi == null) return;
        uit.push({ id: r.id, naam: r.naam, soort: r.soort, volgorde: vi, route: planNaarRoute(r.plannen[sl], acties) });
      });
    } else if (r.plan) {
      volgordes.forEach((v) => uit.push({ id: r.id, naam: r.naam, soort: r.soort, volgorde: v.index, route: planNaarRoute(r.plan, acties) }));
    }
  });
  return uit;
}

// Varianten van een geldige casusroute: volgorde binnen een dag, een kaart een dag eerder/later, doorspelen tot de laatste dag.
function variantenVan(route, ep) {
  const uit = [], r0 = trim(route);
  r0.forEach((d, i) => {
    if (d.length < 2) return;
    permutaties(d.map((x, j) => j)).slice(1).forEach((p) => {
      const r = kopieRoute(r0); r[i] = p.map((j) => d[j]);
      uit.push({ route: r, soort: "volgorde binnen een dag", tekst: "Dag " + (i + 1) + " in de volgorde: " + r[i].map(actieTekst).join(", ") });
    });
  });
  r0.forEach((d, i) => d.forEach((a, j) => {
    [-1, 1].forEach((stap) => {
      const doel = i + stap;
      if (doel < 0 || doel >= ep.knoppen.aantalDagen) return;
      const r = kopieRoute(r0); r[i].splice(j, 1); while (r.length <= doel) r.push([]);
      if (stap < 0) r[doel].push(a); else r[doel].unshift(a);
      uit.push({ route: r, soort: stap < 0 ? "een dag eerder" : "een dag later", tekst: actieTekst(a) + " van dag " + (i + 1) + " naar dag " + (doel + 1) });
    });
  }));
  return uit;
}

// Welke gebeurtenissen kwamen in de variant op een andere dag (of niet) dan in de basisroute?
function verschuivingen(ep, basis, variant) {
  if (!basis || !variant || !variant.gebeurtenissen) return [];
  const b = {}, v = {};
  basis.gebeurtenissen.forEach((g) => { b[g.id] = g.dag; });
  variant.gebeurtenissen.forEach((g) => { v[g.id] = g.dag; });
  return Array.from(new Set(Object.keys(b).concat(Object.keys(v)))).filter((id) => b[id] !== v[id]).map((id) =>
    gebeurtenisNaam(ep, id) + (b[id] == null ? " kwam nu wél, op dag " + v[id] : v[id] == null ? " kwam nu níet (was dag " + b[id] + ")" : " van dag " + b[id] + " naar dag " + v[id]));
}

/* ================= volledig aftellen (kleine episodes zonder gebeurtenissen) ================= */
function volledigAftellen(sp, acties, ep) {
  const n = acties.length, totaal = Math.pow(2, n) - 1;
  if (lijst(ep.gebeurtenissen).length) return { gedaan: false, reden: "Deze episode heeft gebeurtenissen; dan hangt de uitkomst ook af van de timing, en dat is te groot om volledig af te tellen." };
  if (totaal > B.volledigMax) return { gedaan: false, reden: "Te veel combinaties (" + totaal.toLocaleString("nl-NL") + ") om volledig af te tellen binnen het budget." };
  const N = ep.knoppen.actiesPerBeurt, D = ep.knoppen.aantalDagen;
  const indelingen = [
    { id: "compact", naam: "zo weinig mogelijk dagen (" + N + " kaarten per dag)", bouw: (sel) => { const r = []; sel.forEach((a, i) => { if (i % N === 0) r.push([]); r[r.length - 1].push(a); }); return r; } },
    { id: "gespreid", naam: "elke kaart op een eigen dag", bouw: (sel) => sel.map((a) => [a]) }
  ].slice(0, GRONDIG || FACTOR >= 3 ? 2 : 1);   // de tweede indeling alleen bij grondig zoeken (verdubbelt de looptijd)
  const resultaat = { gedaan: true, combinaties: totaal, indelingen: [] };
  for (const ind of indelingen) {
    const stat = { id: ind.id, naam: ind.naam, gespeeld: 0, speelbaar: 0, geslaagd: 0, teLang: 0, perMasker: new Map() };
    for (let m = 1; m <= totaal; m++) {
      const sel = []; for (let b = 0; b < n; b++) if (m & (1 << b)) sel.push(acties[b]);
      const route = ind.bouw(sel);
      if (route.length > D) { stat.teLang++; continue; }
      const res = sp.speel(route);
      stat.gespeeld++;
      if (res.status !== "onspeelbaar") stat.speelbaar++;
      if (res.status === "geslaagd") { stat.geslaagd++; stat.perMasker.set(m, res); }
    }
    // kortste en langste slagende combinatie, en "gratis" kaarten (bewezen binnen deze indeling)
    let kort = null, lang = null;
    const gratis = acties.map(() => ({ gratis: 0, kost: 0, voorbeeld: null }));
    for (const [m, res] of stat.perMasker) {
      if (!kort || res.kaarten < kort.kaarten) kort = res;
      if (!lang || res.kaarten > lang.kaarten || (res.kaarten === lang.kaarten && scoreSom(res.score) > scoreSom(lang.score))) lang = res;
      for (let b = 0; b < n; b++) {
        if (m & (1 << b)) continue;
        const met = stat.perMasker.get(m | (1 << b));
        if (!met) continue;
        if (scoreNietLager(res.score, met.score)) { gratis[b].gratis++; if (!gratis[b].voorbeeld) gratis[b].voorbeeld = { zonder: res, met: met }; }
        else gratis[b].kost++;
      }
    }
    stat.kortste = kort; stat.langste = lang; stat.gratis = gratis;
    resultaat.indelingen.push(stat);
  }
  return resultaat;
}
function scoreSom(s) { if (!s) return -1; return Object.keys(s).reduce((t, k) => t + (s[k] || 0), 0); }

/* ================= per episode ================= */
function onderzoekEpisode(ep) {
  const t0 = Date.now();
  const acties = actiesVan(ep);
  const volgordes = volgordesVan(ep);
  const spelers = volgordes.map((v) => maakSpeler(ep, v));
  const casusRoutes = casusRoutesVan(ep, volgordes, acties);
  const geldigeKaarten = new Set();
  casusRoutes.filter((c) => c.soort === "geldig").forEach((c) => routeKaartIds(c.route).forEach((k) => geldigeKaarten.add(k)));
  const E = { ep: ep, acties: acties, volgordes: volgordes, spelers: spelers, casusRoutes: casusRoutes, geldigeKaarten: geldigeKaarten, perVolgorde: [] };
  log("— " + epNaam(ep) + ": " + acties.length + " mogelijke acties, " + volgordes.length + " volgorde(s), " + casusRoutes.length + " casusplannen");

  // (a) volledig aftellen waar dat kan
  E.volledig = volledigAftellen(spelers[0], acties, ep);
  if (E.volledig.gedaan) log("   volledig afgeteld: " + E.volledig.combinaties + " combinaties × " + E.volledig.indelingen.length + " indelingen");

  for (const sp of spelers) {
    const v = sp.volgorde, rnd = maakToeval(ep.id + "#" + v.index);
    const PV = { volgorde: v, casus: [], varianten: [], minimaal: [], gratis: {}, speelAlles: null, pogingen: {} };
    E.perVolgorde.push(PV);
    const tel0 = TELLING.gespeeld;

    // (b0) casusroutes zelf, ook "doorspelen tot de laatste dag"
    for (const c of casusRoutes.filter((c) => c.volgorde === v.index)) {
      const res = sp.speel(c.route), resLaat = sp.speel(c.route, "laatsteDag");
      PV.casus.push({ id: c.id, naam: c.naam, soort: c.soort, route: trim(c.route), res: res, resLaat: resLaat });
    }
    // casusplannen van een andere volgorde in deze volgorde (zelfde dagplan, gebeurtenissen andersom)
    PV.andereVolgorde = [];
    for (const c of casusRoutes.filter((c) => c.soort === "geldig" && c.volgorde !== v.index)) {
      PV.andereVolgorde.push({ id: c.id, naam: c.naam, vanVolgorde: c.volgorde, route: trim(c.route), res: sp.speel(c.route) });
    }

    // (b1) varianten van de geldige casusroutes (vraag 4)
    for (const c of PV.casus.filter((c) => c.soort === "geldig" && c.res.status === "geslaagd")) {
      for (const va of variantenVan(c.route, ep)) {
        if (!binnenGrenzen(va.route, ep)) { PV.varianten.push({ basis: c.id, soort: va.soort, tekst: va.tekst, res: { status: "onspeelbaar", melding: "dag te vol", geschonden: [] } }); continue; }
        const vres = sp.speel(va.route);
        PV.varianten.push({ basis: c.id, soort: va.soort, tekst: va.tekst, route: va.route, res: vres, verschoven: verschuivingen(ep, c.res, vres) });
      }
    }
    PV.pogingen.casus = TELLING.gespeeld - tel0;

    // (c) willekeurige routes
    let t1 = TELLING.gespeeld;
    for (let i = 0; i < B.willekeurig; i++) sp.speel(willekeurigeRoute(sp, acties, rnd));
    PV.pogingen.willekeurig = TELLING.gespeeld - t1;

    // (b2a) uitsteltoets: houd de eerste m kaarten van een slagende route en zet een paar van de overige kaarten op de laatste dag.
    // Zo zie je of een speler gebeurtenissen kan ontlopen door kaarten uit te stellen. Daarna de hele 1-stapsbuurt van de beste
    // bijna-slagers die dat oplevert (elke kaart vervangen door elke actie, elke actie toevoegen op elke gebruikte dag).
    t1 = TELLING.gespeeld;
    const uitstel = [];
    const uitstelBasis = PV.casus.filter((c) => c.soort === "geldig" && c.res.status === "geslaagd").map((c) => c.route)
      .concat(rnd.schud(Array.from(sp.cache.values()).filter((x) => x.status === "geslaagd" && x.einde === "zodraMogelijk")).map((x) => x.route))
      .slice(0, B.uitstelBasis);
    const D = ep.knoppen.aantalDagen, N = ep.knoppen.actiesPerBeurt;
    for (const basis of uitstelBasis) {
      const kaarten = []; trim(basis).forEach((d, i) => d.forEach((a) => kaarten.push({ dag: i, a: a })));
      for (let m = 1; m < kaarten.length; m++) {
        const voor = []; kaarten.slice(0, m).forEach((k) => { while (voor.length <= k.dag) voor.push([]); voor[k.dag].push(k.a); });
        if (trim(voor).length >= D) continue;
        const rest = kaarten.slice(m).map((k) => k.a);
        const keuzes = [];
        for (let t = 1; t <= Math.min(N, rest.length); t++) { keuzes.push(rest.slice(0, t)); keuzes.push(rest.slice(rest.length - t)); }
        rest.forEach((a) => keuzes.push([a]));
        for (const kz of keuzes) {
          const r = kopieRoute(voor); while (r.length < D) r.push([]); r[D - 1] = kz.slice();
          uitstel.push(sp.speel(r));
        }
      }
    }
    const bijna = uitstel.filter((x) => x.status === "gezakt").sort((a, b) => a.geschonden.length - b.geschonden.length || a.kaarten - b.kaarten);
    const buurtGedaan = new Set();
    for (const b of bijna) {
      if (buurtGedaan.size >= B.buurtRoutes) break;
      if (buurtGedaan.has(b.sleutel)) continue;
      buurtGedaan.add(b.sleutel);
      const r0 = trim(b.route);
      for (const a of acties) {
        r0.forEach((d, i) => d.forEach((x, j) => { const r = kopieRoute(r0); r[i][j] = a; sp.speel(r); }));
        r0.forEach((d, i) => { if (d.length && d.length < N) { const r = kopieRoute(r0); r[i].push(a); sp.speel(r); } });
      }
    }
    PV.pogingen.uitstel = TELLING.gespeeld - t1;

    // (b2) gerichte zoektocht: mutaties vanuit slagende en bijna-slagende routes
    t1 = TELLING.gespeeld;
    const pool = new Map();
    function fit(res) { return res.status === "geslaagd" ? 0 : res.status === "gezakt" ? res.geschonden.length : isAndereAfloop(res.status) ? 50 : 99; }
    function inPool(res) { if (res.status === "onspeelbaar" || res.status === "fout") return; if (!pool.has(res.sleutel)) pool.set(res.sleutel, { route: res.route, fit: fit(res), n: res.kaarten }); }
    for (const res of sp.cache.values()) inPool(res);
    // slagers uit andere volgordes als startpunt meenemen
    for (const ander of spelers) if (ander !== sp) for (const res of ander.cache.values()) if (res.status === "geslaagd" && res.einde === "zodraMogelijk") inPool(sp.speel(res.route));
    let poolLijst = Array.from(pool.values());
    function kiesOuder() {
      const slagers = poolLijst.filter((p) => p.fit === 0);
      if (slagers.length && rnd() < 0.5) return rnd.kies(slagers);
      let beste = null;
      for (let k = 0; k < 4; k++) { const p = rnd.kies(poolLijst); if (!beste || p.fit < beste.fit || (p.fit === beste.fit && p.n < beste.n)) beste = p; }
      return beste;
    }
    for (let i = 0; i < B.evolutie && poolLijst.length; i++) {
      let r = kiesOuder().route;
      const stappen = 1 + (rnd() < 0.3 ? rnd.int(3) : 0);
      for (let s = 0; s < stappen; s++) r = mutatie(r, ep, acties, rnd);
      if (!binnenGrenzen(r, ep)) continue;
      const res = sp.speel(r);
      if (res.status === "onspeelbaar" || res.status === "fout" || pool.has(res.sleutel)) continue;
      pool.set(res.sleutel, { route: res.route, fit: fit(res), n: res.kaarten });
      poolLijst.push(pool.get(res.sleutel));
      if (poolLijst.length > 3000) {   // de zwakste helft van de niet-slagers eruit
        poolLijst.sort((a, b) => a.fit - b.fit || a.n - b.n);
        poolLijst = poolLijst.slice(0, 2000);
      }
    }
    PV.pogingen.gericht = TELLING.gespeeld - t1;

    // minimaliseren: zo weinig mogelijk kaarten (vraag 1 en 3)
    t1 = TELLING.gespeeld;
    const slagers = Array.from(sp.cache.values()).filter((r) => r.status === "geslaagd" && r.einde === "zodraMogelijk");
    const perSoort = new Map();
    for (const s of slagers) {
      const k = s.middelen.join(",") + "/" + (s.profiel || "-");
      if (!perSoort.has(k)) perSoort.set(k, []);
      perSoort.get(k).push(s);
    }
    const kandidaten = [];
    const groepen = Array.from(perSoort.values()).map((g) => rnd.schud(g).sort((a, b) => a.kaarten - b.kaarten));
    for (let ronde = 0; kandidaten.length < B.minimaliseer && groepen.some((g) => g.length > ronde); ronde++) {
      for (const g of groepen) if (g[ronde] && kandidaten.length < B.minimaliseer) kandidaten.push(g[ronde]);
    }
    const minSet = new Map();
    for (const k of kandidaten) {
      const m = minimaliseer(sp, k.route), res = sp.speel(m);
      if (!minSet.has(res.sleutel)) minSet.set(res.sleutel, res);
    }
    PV.minimaal = Array.from(minSet.values()).sort((a, b) => a.kaarten - b.kaarten || aantalDagenGebruikt(a.route) - aantalDagenGebruikt(b.route));
    PV.pogingen.minimaliseren = TELLING.gespeeld - t1;

    // slagers die alleen slagen doordat de speler direct afrondt: doorspelen tot de laatste dag
    t1 = TELLING.gespeeld;
    PV.vroegAfgerond = [];
    const teToetsen = PV.minimaal.concat(rnd.schud(slagers).slice(0, B.doorspelen));
    const getoetst = new Set();
    for (const s of teToetsen) {
      if (getoetst.has(s.sleutel)) continue; getoetst.add(s.sleutel);
      const laat = sp.speel(s.route, "laatsteDag");
      if (laat.status !== "geslaagd") PV.vroegAfgerond.push({ res: s, laat: laat });
    }
    PV.doorspeelGetoetst = getoetst.size;
    PV.pogingen.doorspelen = TELLING.gespeeld - t1;

    // gratis kaarten en "speel alles" (vraag 2)
    t1 = TELLING.gespeeld;
    const basissen = [];
    PV.casus.filter((c) => c.soort === "geldig" && c.res.status === "geslaagd").forEach((c) => basissen.push({ naam: "casusroute " + c.id, route: c.route }));
    PV.minimaal.slice(0, 3).forEach((m) => basissen.push({ naam: "kortste gevonden slagende route", route: m.route }));
    if (!basissen.length) slagers.slice(0, 3).forEach((s) => basissen.push({ naam: "gevonden slagende route", route: s.route }));
    const gratisBasissen = basissen.slice(0, B.gratisBasis);
    for (const b of gratisBasissen) {
      const bres = sp.speel(b.route);
      for (const a of acties) {
        if (b.route.some((d) => d.some((x) => x.key === a.key))) continue;
        const p = probeerToevoegen(sp, b.route, bres, a);
        const g = PV.gratis[a.kaart] || (PV.gratis[a.kaart] = { gratis: null, kostScore: null, breekt: null, getest: 0 });
        g.getest++;
        if (p.soort === "gratis" && !g.gratis) g.gratis = { basis: b.naam, actie: a, res: p.res };
        if (p.soort === "kostScore" && !g.kostScore) g.kostScore = { basis: b.naam, actie: a, res: p.res, basisScore: bres.score };
        if (p.soort === "breekt" && !g.breekt) g.breekt = { basis: b.naam, actie: a, res: p.res };
      }
    }
    PV.gratisBasissen = gratisBasissen.map((b) => b.naam);
    let besteAlles = null;
    for (const b of basissen.slice(0, B.speelAllesBasis)) {
      const sa = speelAlles(sp, b.route, acties, rnd);
      if (!besteAlles || sa.res.kaarten > besteAlles.res.kaarten) besteAlles = Object.assign({ basis: b.naam }, sa);
    }
    // ook de grootste slagende route uit de hele steekproef
    let grootsteSteekproef = null;
    for (const r of sp.cache.values()) if (r.status === "geslaagd" && (!grootsteSteekproef || r.kaarten > grootsteSteekproef.kaarten)) grootsteSteekproef = r;
    PV.speelAlles = besteAlles; PV.grootsteSteekproef = grootsteSteekproef;
    PV.pogingen.speelAlles = TELLING.gespeeld - t1;
    PV.pogingen.totaal = sp.cache.size;
    log("   " + v.kort + ": " + sp.cache.size + " routes gespeeld, " + Array.from(sp.cache.values()).filter((r) => r.status === "geslaagd").length + " slagend");
  }
  E.duur = Date.now() - t0;
  return E;
}

/* ================= analyse ================= */
function analyseer(E) {
  const ep = E.ep;
  const alle = [];
  E.spelers.forEach((sp) => sp.cache.forEach((r) => alle.push(Object.assign({ volgorde: sp.volgorde.index }, r))));
  const uniek = alle.filter((r) => r.einde === "zodraMogelijk");
  const tel = {};
  alle.forEach((r) => { tel[r.status] = (tel[r.status] || 0) + 1; });
  E.telling = tel; E.aantal = alle.length;

  // vraag 1: haalbaar per volgorde
  E.haalbaar = E.perVolgorde.map((PV, i) => {
    const sp = E.spelers[i];
    const slag = Array.from(sp.cache.values()).filter((r) => r.status === "geslaagd" && r.einde === "zodraMogelijk");
    let kortste = null;
    for (const r of PV.minimaal.concat(slag)) if (!kortste || r.kaarten < kortste.kaarten || (r.kaarten === kortste.kaarten && aantalDagenGebruikt(r.route) < aantalDagenGebruikt(kortste.route))) kortste = r;
    let ookAnders = null;
    if (kortste && E.spelers.length > 1) ookAnders = E.spelers.filter((s) => s !== sp).map((s) => ({ volgorde: s.volgorde, res: s.speel(kortste.route) }));
    return { volgorde: PV.volgorde, aantalSlagers: slag.length, gespeeld: sp.cache.size, kortste: kortste, ookAnders: ookAnders };
  });

  // vraag 3: onbedoelde slagers
  const slagers = uniek.filter((r) => r.status === "geslaagd");
  const groepsGebeurtenissen = lijst(ep.gebeurtenissen).filter((e) => e.groep).map((e) => e.id);
  const casusKaartSets = E.casusRoutes.filter((c) => c.soort === "geldig").map((c) => routeKaartIds(c.route));
  const kleinsteCasus = E.perVolgorde.flatMap((PV) => PV.casus.filter((c) => c.soort === "geldig" && c.res.status === "geslaagd").map((c) => c.res.kaarten));
  E.kleinsteCasus = kleinsteCasus.length ? Math.min.apply(null, kleinsteCasus) : null;
  const minimaal = []; const gezien = new Set();
  E.perVolgorde.forEach((PV) => PV.minimaal.forEach((m) => { const k = PV.volgorde.index + "#" + m.sleutel; if (!gezien.has(k)) { gezien.add(k); minimaal.push(Object.assign({ volgorde: PV.volgorde.index }, m)); } }));
  minimaal.sort((a, b) => a.kaarten - b.kaarten);
  function voorbeeldSort(l) { return l.slice().sort((a, b) => a.kaarten - b.kaarten || aantalDagenGebruikt(a.route) - aantalDagenGebruikt(b.route)); }
  E.onbedoeld = {
    minimaal: minimaal,
    zonderProfiel: voorbeeldSort(slagers.filter((r) => !r.profiel)),
    buitenCasus: E.geldigeKaarten.size ? voorbeeldSort(slagers.filter((r) => Array.from(routeKaartIds(r.route)).some((k) => !E.geldigeKaarten.has(k)))) : [],
    wachtend: voorbeeldSort(slagers.filter((r) => r.wachtend.length)),
    groepOntlopen: groepsGebeurtenissen.length ? voorbeeldSort(slagers.filter((r) => groepsGebeurtenissen.some((id) => !r.gebeurtenissen.some((g) => g.id === id)))) : [],
    totaalSlagers: slagers.length,
    vroegAfgerond: E.perVolgorde.flatMap((PV) => PV.vroegAfgerond.map((x) => Object.assign({ volgorde: PV.volgorde.index, laat: x.laat }, x.res))).sort((a, b) => a.kaarten - b.kaarten),
    doorspeelGetoetst: E.perVolgorde.reduce((t, PV) => t + PV.doorspeelGetoetst, 0)
  };
  // kaarten buiten de casusroutes die in slagende routes voorkomen
  const buitenTel = {};
  E.onbedoeld.buitenCasus.forEach((r) => routeKaartIds(r.route).forEach((k) => { if (!E.geldigeKaarten.has(k)) buitenTel[k] = (buitenTel[k] || 0) + 1; }));
  E.onbedoeld.buitenTel = buitenTel;
  // per combinatie van gestarte middelen + profiel
  const perMiddel = new Map();
  slagers.forEach((r) => {
    const k = (r.middelen.length ? r.middelen.map(kaartLabel).join(" + ") : "geen antibioticum gestart") + " | " + (r.profiel || "geen profiel");
    if (!perMiddel.has(k)) perMiddel.set(k, { n: 0, kortste: null, middelen: r.middelen, profiel: r.profiel });
    const g = perMiddel.get(k); g.n++;
    if (!g.kortste || r.kaarten < g.kortste.kaarten) g.kortste = r;
  });
  E.onbedoeld.perMiddel = Array.from(perMiddel.entries()).sort((a, b) => b[1].n - a[1].n);
  E.onbedoeld.casusMiddelSets = new Set(E.perVolgorde.flatMap((PV) => PV.casus.filter((c) => c.soort === "geldig" && c.res.status === "geslaagd").map((c) => c.res.middelen.join(","))));

  // vraag 5: dekking van de regels
  E.dekking = lijst(ep.invarianten).map((inv) => {
    const geschonden = uniek.filter((r) => r.geschonden.includes(inv.id));
    const alleen = voorbeeldSort(geschonden.filter((r) => r.geschonden.length === 1));
    return { id: inv.id, naam: regelNaam(ep, inv.id), ernst: inv.ernst, geschonden: geschonden.length, alleen: alleen.length, voorbeeld: alleen[0] || null };
  });
  E.uniek = uniek.length;
  E.verloren = voorbeeldSort(alle.filter((r) => isAndereAfloop(r.status)));
  E.fouten = alle.filter((r) => r.status === "fout");
  E.onbekend = alle.filter((r) => r.status === "onbekend");
}

/* ================= HTML ================= */
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function getal(n) { return Number(n || 0).toLocaleString("nl-NL"); }
function scoreTekst(s) {
  if (!s) return "geen score";
  return Object.keys(s).map((k) => k + " " + (s[k] == null ? "–" : s[k])).join(", ");
}
function uitkomstTekst(ep, r) {
  if (!r) return "";
  if (r.status === "geslaagd") return "Poort gehaald · " + scoreTekst(r.score) + " · profiel: " + (r.profiel || "geen");
  if (r.status === "gezakt") return "Gezakt op " + r.geschonden.map((id) => regelTekst(ep, id)).join(", ");
  if (isAndereAfloop(r.status)) return "Afloop: " + r.status + (r.eindeDoor ? " (door " + gebeurtenisNaam(ep, r.eindeDoor) + ")" : "") + (r.geschonden.length ? "; ook geschonden: " + r.geschonden.join(", ") : "");
  if (r.status === "onspeelbaar") return "Niet speelbaar: " + (r.melding || "");
  if (r.status === "fout") return "Fout in engine of regels: " + (r.melding || "");
  return "Onbekende uitkomst";
}
function eindeTekst(ep, r) {
  if (!r || r.einddag == null) return "";
  const extra = [];
  if (r.gebeurtenissen.length) extra.push("gebeurtenissen: " + r.gebeurtenissen.map((g) => gebeurtenisNaam(ep, g.id) + " op dag " + g.dag).join(", "));
  if (r.wachtend.length) extra.push("<strong>nooit verschenen (bleef in de wacht staan): " + r.wachtend.map((id) => esc(gebeurtenisNaam(ep, id))).join(", ") + "</strong>");
  return "Afgerond op dag " + r.einddag + (extra.length ? "; " + extra.map((x) => (x.startsWith("<strong>") ? x : esc(x))).join("; ") : "");
}
function routeBlok(ep, r, extraKop) {
  return '<div class="route">' + (extraKop ? '<div class="kop">' + extraKop + "</div>" : "") +
    '<div class="kaarten">' + esc(routeTekst(r.route)) + ' <span class="n">(' + r.kaarten + " kaarten)</span></div>" +
    '<div class="uit ' + esc(r.status) + '">' + esc(uitkomstTekst(ep, r)) + "</div>" +
    '<div class="einde">' + eindeTekst(ep, r) + "</div></div>";
}
function badge(soort) { return soort === "bewezen" ? '<span class="badge bewezen">bewezen</span>' : '<span class="badge steekproef">steekproef</span>'; }

function samenvatting(resultaten) {
  const punten = [];
  const kort = (E) => E.ep.id;
  // 1. haalbaarheid
  const nietGevonden = [], gevonden = [];
  resultaten.forEach((E) => E.haalbaar.forEach((h) => {
    if (!h.kortste) nietGevonden.push("<strong>" + esc(kort(E)) + " bij de volgorde " + esc(h.volgorde.label) + ": niets gevonden in " + getal(h.gespeeld) + " routes</strong>");
    else gevonden.push(esc(kort(E)) + (E.volgordes.length > 1 ? " (" + esc(h.volgorde.kort) + ")" : "") + ": " + h.kortste.kaarten + " kaarten");
  }));
  punten.push("<strong>Haalbaar.</strong> " + (nietGevonden.length ? nietGevonden.join("; ") + ". Daarnaast: " : "Voor elke episode en elke volgorde van gebeurtenissen is een slagende route gevonden. ") +
    "Kortste slagende route: " + gevonden.join(", ") + "." +
    resultaten.filter((E) => E.kleinsteCasus != null && E.onbedoeld.minimaal.length && E.onbedoeld.minimaal[0].kaarten < E.kleinsteCasus).map((E) => " In " + esc(kort(E)) + " is dat korter dan de kortste geldige casusroute (" + E.kleinsteCasus + " kaarten).").join(""));
  // 2. afvinken
  const af = resultaten.map((E) => {
    const sa = E.perVolgorde.map((PV) => PV.speelAlles).filter(Boolean).sort((a, b) => b.res.kaarten - a.res.kaarten)[0];
    const vol = E.volledig && E.volledig.gedaan ? E.volledig.indelingen[0].langste : null;
    const delen = [];
    if (sa && sa.res.status === "geslaagd") delen.push(sa.res.kaarten + " van " + E.acties.length + " kaartacties zonder scoreverlies (" + esc(scoreTekst(sa.res.score)) + ")");
    if (vol && (!sa || vol.kaarten > sa.res.kaarten)) delen.push("bewezen maximum " + vol.kaarten + " met " + esc(scoreTekst(vol.score)));
    return esc(kort(E)) + ": " + (delen.join("; ") || "geen");
  });
  punten.push("<strong>Afvinken wordt nauwelijks afgestraft.</strong> Grootste slagende route: " + af.join(" · ") + ". Een student die veel aanklikt, haalt dus vaak gewoon de poort.");
  // 3. onbedoelde slagers
  const lek = [];
  resultaten.forEach((E) => {
    const O = E.onbedoeld;
    if (O.wachtend.length) lek.push(esc(kort(E)) + ": " + getal(O.wachtend.length) + " slagende routes waarin een gebeurtenis nooit verschijnt omdat de kaart die haar uitlokt op de laatste dag valt (kortste: " + esc(routeTekst(O.wachtend[0].route)) + ")");
    else if (O.groepOntlopen.length) lek.push(esc(kort(E)) + ": " + getal(O.groepOntlopen.length) + " slagende routes waarin een vaste gebeurtenis nooit plaatsvindt");
    if (O.vroegAfgerond.length) lek.push(esc(kort(E)) + ": " + getal(O.vroegAfgerond.length) + " van " + getal(O.doorspeelGetoetst) + " getoetste slagers halen de poort alleen door meteen af te ronden");
    if (O.zonderProfiel.length) lek.push(esc(kort(E)) + ": " + getal(O.zonderProfiel.length) + " slagers zonder profiel");
  });
  if (lek.length) punten.push("<strong>Onbedoelde slagers.</strong> " + lek.join("; ") + ".");
  // 4. casusroutes en varianten
  const cas = [];
  resultaten.forEach((E) => {
    const nietOk = E.perVolgorde.flatMap((PV) => PV.casus.filter((c) => c.soort === "geldig" && c.res.status !== "geslaagd").map((c) => Object.assign({ v: PV.volgorde }, c)));
    const zak = nietOk.filter((c) => c.res.status !== "onspeelbaar"), onsp = Array.from(new Set(nietOk.filter((c) => c.res.status === "onspeelbaar").map((c) => c.id)));
    if (zak.length) cas.push(esc(kort(E)) + ": de geldige casusroute(s) " + zak.map((c) => esc(c.id) + (E.volgordes.length > 1 ? " (" + esc(c.v.kort) + ")" : "") + " → " + esc(c.res.status === "gezakt" ? c.res.geschonden.join(", ") : c.res.status)).join(", ") + " halen de poort niet");
    if (onsp.length) cas.push(esc(kort(E)) + ": " + onsp.length + " casusroute(s) zijn in het huidige spel niet letterlijk speelbaar (" + esc(onsp.join(", ")) + ")");
    const zv = E.perVolgorde.flatMap((PV) => PV.varianten.filter((v) => isZak(v.res)));
    const tv = E.perVolgorde.reduce((t, PV) => t + PV.varianten.length, 0);
    if (zv.length) {
      const perRegel = {}; zv.forEach((v) => (v.res.geschonden.length ? v.res.geschonden : [v.res.status]).forEach((id) => { perRegel[id] = (perRegel[id] || 0) + 1; }));
      const top = Object.entries(perRegel).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, n]) => esc(id) + " " + n + "×").join(", ");
      const verschoven = zv.filter((v) => v.verschoven && v.verschoven.length).length;
      cas.push(esc(kort(E)) + ": " + zv.length + " van " + tv + " kleine variaties zakken (" + top + (verschoven ? "; bij " + verschoven + " daarvan verschoof een gebeurtenis mee" : "") + ")");
    }
  });
  if (cas.length) punten.push("<strong>Casusroutes onder de huidige regels.</strong> " + cas.join("; ") + ". Zie onderdeel 4 per episode.");
  // 5. dekking, afloop, fouten
  const dek = [];
  resultaten.forEach((E) => {
    const nooit = E.dekking.filter((d) => !d.geschonden).map((d) => d.id), nooitAlleen = E.dekking.filter((d) => d.geschonden && !d.alleen).map((d) => d.id);
    if (nooit.length) dek.push(esc(kort(E)) + ": nooit geschonden: " + esc(nooit.join(", ")));
    if (nooitAlleen.length) dek.push(esc(kort(E)) + ": nooit als enige geschonden: " + esc(nooitAlleen.join(", ")));
    Object.keys(E.telling).filter(isAndereAfloop).forEach((st) => dek.push(esc(kort(E)) + ": " + getal(E.telling[st]) + " routes met afloop “" + esc(st) + "”"));
    if (E.fouten.length) dek.push("<strong>" + esc(kort(E)) + ": " + getal(E.fouten.length) + " routes gaven een fout in engine of regels</strong>");
  });
  punten.push("<strong>Dekking van de regels.</strong> " + (dek.length ? dek.join("; ") + "." : "Elke regel is in de steekproef minstens één keer als enige geschonden.") +
    " (Steekproef: " + getal(resultaten.reduce((t, E) => t + E.aantal, 0)) + " gespeelde routes.)");
  return punten.map((p) => ({ html: p }));
}

function htmlEpisode(E) {
  const ep = E.ep, h = [];
  const V = (i) => E.volgordes[i];
  h.push('<section class="episode"><h2>' + esc(epNaam(ep)) + "</h2>");
  h.push('<p class="meta">' + getal(lijst(ep.repertoire).length) + " kaarten in het repertoire, samen " + getal(E.acties.length) + " mogelijke kaartacties (een kaart met doel of optie telt per doel en optie). " +
    getal(ep.knoppen.actiesPerBeurt) + " kaarten per dag, " + getal(ep.knoppen.aantalDagen) + " dagen. Volgordes van gebeurtenissen: " + E.volgordes.map((v) => esc(v.label)).join(" | ") + ". " +
    "Gespeeld: " + getal(E.aantal) + " routes (" + Object.entries(E.telling).map(([k, n]) => getal(n) + " " + k).join(", ") + ").</p>");
  if (E.volgordes.some((v) => !v.gestuurd)) h.push('<p class="waarschuwing">Let op: de zoeker kon de volgorde van de gebeurtenissen niet betrouwbaar sturen; de engine koos soms een andere volgorde dan bedoeld.</p>');

  // 1
  h.push("<h3>1. Haalbaar?</h3>");
  if (E.volledig && E.volledig.gedaan) {
    h.push("<p>" + badge("bewezen") + " Alle " + getal(E.volledig.combinaties) + " combinaties van kaartacties zijn gespeeld, elk in twee vaste indelingen: " +
      E.volledig.indelingen.map((x) => esc(x.naam) + " (" + getal(x.geslaagd) + " slagend" + (x.teLang ? ", " + getal(x.teLang) + " pasten niet in de dagen" : "") + ")").join(" en ") +
      ". Binnen deze indelingen is het antwoord volledig; andere timing is als steekproef onderzocht.</p>");
  } else if (E.volledig) h.push("<p>" + badge("steekproef") + " " + esc(E.volledig.reden) + "</p>");
  h.push('<table><tr><th>Volgorde van gebeurtenissen</th><th>Gevonden?</th><th>Kortste slagende route</th><th>Werkt dezelfde route ook bij de andere volgorde?</th></tr>');
  E.haalbaar.forEach((x) => {
    h.push("<tr><td>" + esc(x.volgorde.label) + "</td><td>" + (x.kortste ? "Ja (" + getal(x.aantalSlagers) + " verschillende slagende routes)" : '<strong class="rood">NEE: niets gevonden in ' + getal(x.gespeeld) + " routes</strong>") + "</td><td>" +
      (x.kortste ? routeBlok(ep, x.kortste) : "–") + "</td><td>" +
      (x.ookAnders ? x.ookAnders.map((o) => esc(o.volgorde.kort) + ": " + esc(o.res.status === "geslaagd" ? "ja" : "nee, " + uitkomstTekst(ep, o.res))).join("<br>") : "n.v.t.") + "</td></tr>");
  });
  h.push("</table>");

  // 2
  h.push("<h3>2. Loont afvinken?</h3>");
  h.push("<p>Een kaart is hier <em>gratis</em> als je hem aan een slagende route kunt toevoegen (op een dag naar keuze) terwijl de poort gehaald blijft en geen van beide scores daalt. Getest op de slagende geldige casusroutes en op de kortste gevonden routes.</p>");
  if (E.volledig && E.volledig.gedaan) {
    const ind = E.volledig.indelingen[0];
    h.push("<p>" + badge("bewezen") + " Binnen de indeling ‘" + esc(ind.naam) + "’: per kaartactie het aantal slagende combinaties waaraan hij gratis kan worden toegevoegd (en waar hij score kost).</p>");
    h.push("<table><tr><th>Kaartactie</th><th>Gratis toe te voegen aan</th><th>Kost score bij</th></tr>");
    E.acties.forEach((a, i) => { const g = ind.gratis[i]; h.push("<tr><td>" + esc(actieTekst(a)) + "</td><td>" + getal(g.gratis) + " combinaties</td><td>" + getal(g.kost) + "</td></tr>"); });
    h.push("</table>");
    if (ind.langste) h.push("<p>" + badge("bewezen") + " Grootste slagende combinatie in deze indeling:</p>" + routeBlok(ep, ind.langste));
  }
  E.perVolgorde.forEach((PV) => {
    h.push("<h4>" + esc(E.volgordes.length > 1 ? "Volgorde: " + PV.volgorde.label : "Steekproef") + "</h4>");
    const ids = lijst(ep.repertoire);
    h.push("<p>" + badge("steekproef") + " Basisroutes: " + esc(PV.gratisBasissen.join("; ") || "geen (er is geen slagende route)") + ".</p>");
    if (PV.gratisBasissen.length) {
      h.push("<table><tr><th>Kaart</th><th>Oordeel</th><th>Voorbeeld</th></tr>");
      ids.forEach((kid) => {
        const g = PV.gratis[kid];
        let oordeel, vb = "";
        if (!g) { oordeel = "zit al in elke basisroute"; }
        else if (g.gratis) { oordeel = "<strong>gratis</strong>"; vb = esc(actieTekst(g.gratis.actie)) + " toegevoegd aan " + esc(g.gratis.basis) + ": " + esc(scoreTekst(g.gratis.res.score)); }
        else if (g.kostScore) { oordeel = "kan, maar kost score"; vb = esc(actieTekst(g.kostScore.actie)) + ": " + esc(scoreTekst(g.kostScore.basisScore)) + " → " + esc(scoreTekst(g.kostScore.res.score)); }
        else if (g.breekt) { oordeel = "breekt de poort"; vb = esc(actieTekst(g.breekt.actie)) + ": " + esc(uitkomstTekst(ep, g.breekt.res)); }
        else oordeel = "kon nergens gespeeld worden";
        h.push("<tr><td>" + esc(kaartLabel(kid) + " (" + kid + ")") + "</td><td>" + oordeel + "</td><td>" + vb + "</td></tr>");
      });
      h.push("</table>");
    }
    if (PV.speelAlles) {
      h.push("<p><strong>Speel alles:</strong> vanuit " + esc(PV.speelAlles.basis) + " zijn zoveel mogelijk kaarten toegevoegd zolang de poort gehaald bleef en de score niet daalde. Resultaat: " + PV.speelAlles.res.kaarten + " van de " + E.acties.length + " kaartacties (basis: " + PV.speelAlles.basisRes.kaarten + ").</p>");
      h.push(routeBlok(ep, PV.speelAlles.res));
    }
    if (PV.grootsteSteekproef && (!PV.speelAlles || PV.grootsteSteekproef.kaarten > PV.speelAlles.res.kaarten)) {
      h.push("<p>De grootste slagende route in de hele steekproef (score mag lager zijn):</p>" + routeBlok(ep, PV.grootsteSteekproef));
    }
  });

  // 3
  const O = E.onbedoeld;
  h.push("<h3>3. Onbedoelde slagers</h3>");
  h.push("<p>" + badge("steekproef") + " In totaal " + getal(O.totaalSlagers) + " verschillende slagende routes gevonden (alle volgordes samen). Hieronder per groep een telling en de kortste voorbeelden.</p>");
  function groep(titel, uitleg, l, extra) {
    h.push("<h4>" + esc(titel) + " <span class=\"n\">(" + getal(l.length) + ")</span></h4><p>" + uitleg + "</p>" + (extra || ""));
    l.slice(0, B.voorbeelden).forEach((r) => h.push(routeBlok(ep, r, E.volgordes.length > 1 ? "Volgorde: " + esc(V(r.volgorde).kort) : "")));
  }
  groep("Minimale slagende routes", "Routes waarvan je geen enkele kaart meer kunt weglaten zonder te zakken (ontstaan door gevonden slagers stap voor stap in te korten)." +
    (E.kleinsteCasus != null ? " Ter vergelijking: de kortste slagende geldige casusroute heeft " + E.kleinsteCasus + " kaarten." : ""), O.minimaal);
  groep("Slagend zonder profiel", "De poort wordt gehaald, maar het spel kent geen voorschrijfprofiel toe.", O.zonderProfiel);
  if (E.geldigeKaarten.size) {
    const lijstBuiten = Object.entries(O.buitenTel).sort((a, b) => b[1] - a[1]).map(([k, n]) => esc(kaartLabel(k) + " (" + k + ")") + ": " + getal(n) + "×").join("; ");
    groep("Slagend met kaarten die in geen enkele casusroute voorkomen", "Kaarten buiten de geldige casusroutes" + (lijstBuiten ? ": " + lijstBuiten : "") + ".", O.buitenCasus);
  }
  if (O.wachtend.length || lijst(ep.gebeurtenissen).length) groep("Slagend terwijl een gebeurtenis nooit verscheen", "De kaart die de gebeurtenis uitlokt is gespeeld, maar de gebeurtenis bleef in de wacht staan (bijvoorbeeld omdat die kaart op de laatste dag viel). De regels die bij die gebeurtenis horen gelden dan niet.", O.wachtend);
  h.push("<h4>Slaagt alleen doordat de speler meteen afrondt <span class=\"n\">(" + getal(O.vroegAfgerond.length) + " van " + getal(O.doorspeelGetoetst) + " getoetste slagers)</span></h4>" +
    "<p>Deze routes halen de poort als de speler afrondt zodra het mag, maar niet als hij gewoon doorspeelt tot de laatste dag zonder nog kaarten te spelen. Getoetst: alle minimale routes plus een steekproef van de overige slagers.</p>");
  O.vroegAfgerond.slice(0, B.voorbeelden).forEach((r) => h.push(routeBlok(ep, r, (E.volgordes.length > 1 ? "Volgorde: " + esc(V(r.volgorde).kort) + " · " : "") + "Doorgespeeld tot de laatste dag: " + esc(uitkomstTekst(ep, r.laat)))));
  if (O.groepOntlopen.length) groep("Slagend terwijl een vaste gebeurtenis nooit plaatsvond", "Een van de gebeurtenissen uit de vaste groep kwam niet aan bod (te weinig kaarten gespeeld, of in de wacht).", O.groepOntlopen);
  h.push("<h4>Overzicht per gestart antibioticum en profiel</h4><table><tr><th>Gestarte middelen | profiel</th><th>Aantal slagende routes</th><th>Ook in een geldige casusroute?</th><th>Kortste</th></tr>");
  O.perMiddel.forEach(([k, g]) => h.push("<tr><td>" + esc(k) + "</td><td>" + getal(g.n) + "</td><td>" + (O.casusMiddelSets.has(g.middelen.join(",")) ? "ja" : "<strong>nee</strong>") + "</td><td>" + routeBlok(ep, g.kortste) + "</td></tr>"));
  h.push("</table>");

  // 4
  h.push("<h4 class=\"h3\"></h4><h3>4. Onterecht zakken?</h3>");
  if (!ROUTES_GELADEN) h.push("<p>De casusroutes (tests/routes.js) konden niet worden geladen" + (ROUTES_FOUT ? ": " + esc(ROUTES_FOUT) : "") + ". Dit onderdeel is overgeslagen.</p>");
  else {
    h.push("<p>" + badge("bewezen") + " De geldige routes uit de casus (tests/routes.js) zijn in de echte, huidige spelregels nagespeeld, plus alle kleine varianten: de kaarten van één dag in een andere volgorde, en één kaart een dag eerder of later. " +
      "Let op: tests/routes.js is geschreven voor een oudere instelling van het spel (o.a. 5 à 7 dagen, kweekuitslag na een aantal kaarten); de routes zijn hier ongewijzigd nagespeeld. Na de laatste kaart rondt de speler zo vroeg mogelijk af.</p>");
    E.perVolgorde.forEach((PV) => {
      if (E.volgordes.length > 1) h.push("<h4>Volgorde: " + esc(PV.volgorde.label) + "</h4>");
      h.push("<table><tr><th>Casusroute</th><th>Zo vroeg mogelijk afronden</th><th>Doorspelen tot de laatste dag</th><th>Varianten die zakken</th></tr>");
      PV.casus.filter((c) => c.soort === "geldig").forEach((c) => {
        const vars = PV.varianten.filter((v) => v.basis === c.id), zak = vars.filter((v) => isZak(v.res)), fout = vars.filter((v) => v.res.status === "fout");
        h.push("<tr><td><strong>" + esc(c.id) + "</strong><br><span class=\"klein\">" + esc(c.naam) + "</span><br><span class=\"klein\">" + esc(routeTekst(c.route)) + "</span></td><td class=\"" + esc(c.res.status) + "\">" + esc(uitkomstTekst(ep, c.res)) + "<br><span class=\"klein\">" + eindeTekst(ep, c.res) + "</span></td><td class=\"" + esc(c.resLaat.status) + "\">" + esc(uitkomstTekst(ep, c.resLaat)) + "</td><td>" +
          (c.res.status !== "geslaagd" ? "niet gevarieerd (de route zelf slaagt niet)" : zak.length + " van " + vars.length + (fout.length ? " (" + fout.length + " met fout)" : "")) + "</td></tr>");
      });
      h.push("</table>");
      const zak = PV.varianten.filter((v) => isZak(v.res));
      if (zak.length) {
        const perRegel = new Map();
        zak.forEach((v) => { const k = isAndereAfloop(v.res.status) ? "afloop: " + v.res.status : v.res.geschonden.join(", "); if (!perRegel.has(k)) perRegel.set(k, []); perRegel.get(k).push(v); });
        const metVerschuiving = zak.filter((v) => v.verschoven && v.verschoven.length).length;
        h.push("<p>Varianten die zakken, per regel. Let op: gebeurtenissen die op het aantal gespeelde kaarten volgen, schuiven mee als een kaart naar een andere dag gaat; dat staat er dan tussen haakjes bij (" + metVerschuiving + " van de " + zak.length + " zakkende varianten). Of een zakker terecht is (bijvoorbeeld omdat de casus die volgorde juist voorschrijft), is aan de lezer.</p><ul>");
        Array.from(perRegel.entries()).sort((a, b) => b[1].length - a[1].length).forEach(([k, l]) => {
          const naam = k.startsWith("afloop: ") ? k : k.split(", ").map((id) => regelTekst(ep, id)).join(" + ");
          h.push("<li><strong>" + esc(naam) + "</strong> (" + l.length + "×): " + l.slice(0, 6).map((v) => esc(v.basis + ": " + v.tekst) + (v.verschoven && v.verschoven.length ? ' <span class="klein">(daardoor: ' + esc(v.verschoven.join("; ")) + ")</span>" : "")).join("; ") + (l.length > 6 ? "; …" : "") + "</li>");
        });
        h.push("</ul>");
      } else if (PV.varianten.length) h.push("<p>Geen enkele variant zakt.</p>");
      if (PV.andereVolgorde.length) {
        const ok = PV.andereVolgorde.filter((x) => x.res.status === "geslaagd").length;
        h.push("<p>Hetzelfde dagplan als bij een andere volgorde van gebeurtenissen, maar nu met deze volgorde: " + ok + " van " + PV.andereVolgorde.length + " slagen. (Te verwachten: een student reageert op wat hij ziet; een vast dagplan past niet bij elke volgorde.)" +
          (PV.andereVolgorde.length - ok ? " Zakkers: " + PV.andereVolgorde.filter((x) => x.res.status !== "geslaagd").slice(0, 6).map((x) => esc(x.id + " (" + (x.res.geschonden.join(", ") || x.res.status) + ")")).join("; ") : "") + "</p>");
      }
    });
  }

  // 5
  h.push("<h3>5. Dekking van de veiligheidsregels</h3>");
  h.push("<p>" + badge("steekproef") + " Over alle " + getal(E.uniek) + " gespeelde routes van deze episode (willekeurig, gericht en casusvarianten samen; de steekproef is niet representatief voor studenten, want de zoeker zoekt bewust rond slagende routes).</p>");
  h.push("<table><tr><th>Regel</th><th>Ernst</th><th>Geschonden</th><th>Als enige geschonden</th><th>Kortste route die alleen deze regel schendt</th></tr>");
  E.dekking.forEach((d) => {
    h.push("<tr><td>" + esc(regelTekst(ep, d.id)) + "</td><td>" + esc(d.ernst) + "</td><td>" + (d.geschonden ? getal(d.geschonden) + "× (" + (100 * d.geschonden / Math.max(1, E.uniek)).toFixed(1).replace(".", ",") + "%)" : '<strong class="rood">nooit</strong>') + "</td><td>" + (d.alleen ? getal(d.alleen) + "×" : '<strong class="rood">nooit</strong>') + "</td><td>" + (d.voorbeeld ? '<span class="klein">' + esc(routeTekst(d.voorbeeld.route)) + "</span>" : "–") + "</td></tr>");
  });
  h.push("</table>");
  const nooit = E.dekking.filter((d) => !d.geschonden), nooitAlleen = E.dekking.filter((d) => d.geschonden && !d.alleen);
  if (nooit.length) h.push("<p><strong>Nooit geschonden:</strong> " + nooit.map((d) => esc(regelTekst(ep, d.id))).join(", ") + ".</p>");
  if (nooitAlleen.length) h.push("<p><strong>Nooit als enige geschonden:</strong> " + nooitAlleen.map((d) => esc(regelTekst(ep, d.id))).join(", ") + ".</p>");

  if (E.verloren.length) {
    const soorten = Array.from(new Set(E.verloren.map((r) => r.status)));
    h.push("<h3>Episodes die door een gebeurtenis eindigden (" + esc(soorten.join(", ")) + ")</h3><p>" + getal(E.verloren.length) + " gespeelde routes eindigden zo, zonder score. Kortste voorbeelden:</p>");
    E.verloren.slice(0, 3).forEach((r) => h.push(routeBlok(ep, r)));
  }
  if (E.fouten.length || E.onbekend.length) {
    h.push("<h3>Fouten en onbekende uitkomsten</h3><p>" + getal(E.fouten.length) + " routes gaven een fout, " + getal(E.onbekend.length) + " een onbekende uitkomst. Meldingen:</p><ul>");
    Array.from(new Set(E.fouten.map((r) => r.melding))).slice(0, 5).forEach((m) => h.push("<li>" + esc(m) + "</li>"));
    h.push("</ul>");
  }
  h.push("</section>");
  return h.join("\n");
}

function schrijfRapport(resultaten, duur) {
  const punten = samenvatting(resultaten);
  const css = `
:root{--tekst:#1d1d1f;--zacht:#5b5b66;--achter:#fbfbf8;--vlak:#ffffff;--lijn:#dcdcd4;--groen:#1f6f3f;--rood:#a3261b;--oranje:#8a5a00;--accent:#2f5d8a}
@media (prefers-color-scheme: dark){:root{--tekst:#ececec;--zacht:#a9a9b3;--achter:#18181b;--vlak:#222226;--lijn:#3a3a40;--groen:#6fcf97;--rood:#ff8a7a;--oranje:#e8b45a;--accent:#8fb8e0}}
*{box-sizing:border-box}body{margin:0;background:var(--achter);color:var(--tekst);font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 64px}h1{font-size:1.7em;margin:.2em 0}h2{margin-top:2.2em;border-bottom:2px solid var(--lijn);padding-bottom:.2em}
h3{margin-top:1.8em;color:var(--accent)}h4{margin:1.3em 0 .3em}h4.h3{display:none}.meta,.klein{color:var(--zacht)}.klein{font-size:.88em}
.samenvatting{background:var(--vlak);border:1px solid var(--lijn);border-left:5px solid var(--accent);padding:12px 20px;border-radius:6px}
.samenvatting li{margin:.4em 0}table{border-collapse:collapse;width:100%;margin:.6em 0 1em;background:var(--vlak);font-size:.93em}
th,td{border:1px solid var(--lijn);padding:6px 8px;vertical-align:top;text-align:left}th{background:var(--achter)}
.route{border:1px solid var(--lijn);background:var(--vlak);border-radius:6px;padding:8px 10px;margin:6px 0}.route .kop{font-size:.85em;color:var(--zacht)}
.route .uit,.route .einde{font-size:.9em}.route .einde{color:var(--zacht)}.n{color:var(--zacht);font-weight:normal}
.geslaagd{color:var(--groen)}.gezakt,.rood{color:var(--rood)}.verloren,.onspeelbaar,.fout,.anders{color:var(--oranje)}td{font-size:.95em}
.badge{display:inline-block;font-size:.75em;padding:1px 7px;border-radius:9px;border:1px solid currentColor;margin-right:4px}.bewezen{color:var(--groen)}.steekproef{color:var(--oranje)}
.waarschuwing{color:var(--rood);font-weight:600}footer{margin-top:3em;color:var(--zacht);font-size:.9em;border-top:1px solid var(--lijn);padding-top:1em}
@media (max-width:700px){table{display:block;overflow-x:auto}}`;
  const totaal = resultaten.reduce((t, E) => t + E.aantal, 0);
  const html = `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Routezoeker casusrapport</title><style>${css}</style></head><body><main>
<h1>Routezoeker: rapport over de casus “${esc(CASUS.titel || CASUS.id)}”</h1>
<p class="meta">Dit rapport is automatisch gemaakt door het spel zelf heel veel kaartvolgordes te laten spelen, met de echte spelregels en de echte beoordeling. Het beschrijft wat het spel doet, niet wat klinisch juist is.</p>
<h2>Samenvatting</h2>
<div class="samenvatting"><ul>${punten.map((p) => "<li>" + p.html + "</li>").join("\n")}</ul></div>
<h2>Hoe te lezen</h2>
<ul>
<li>Een <strong>route</strong> is de reeks kaarten per dag, bijvoorbeeld “Dag 1: … · Dag 2: …”. Dagen zonder kaarten worden overgeslagen in de tekst. Na de laatste kaart rondt de speler af zodra het spel dat toestaat.</li>
<li><span class="badge bewezen">bewezen</span> betekent: volledig afgeteld binnen de genoemde grenzen. <span class="badge steekproef">steekproef</span> betekent: gevonden door zoeken; wat niet gevonden is, kan toch bestaan.</li>
<li>De zoeker speelde: (a) alle combinaties waar dat kon, (b) de geldige casusroutes en kleine variaties daarop, (c) willekeurige routes, en (d) gerichte mutaties vanuit (bijna) slagende routes: kaart toevoegen, weglaten, verschuiven, doel of optie wisselen.</li>
<li>Een kaart met doel of optie (bijvoorbeeld “Dosis aanpassen → middel: dosis”) telt per doel en optie als aparte <em>kaartactie</em>.</li>
</ul>
${resultaten.map(htmlEpisode).join("\n")}
<footer>Casus: ${esc(CASUS.id)}, versie ${esc(CASUS.versie || "onbekend")} · seed ${SEED} · zoekfactor ${FACTOR}${GRONDIG ? " (grondig)" : ""} ·
gespeelde routes: ${resultaten.map((E) => esc(E.ep.id) + " " + getal(E.aantal)).join(", ")} (samen ${getal(totaal)}; dubbele routes zijn één keer gespeeld) ·
casusroutes uit tests/routes.js: ${ROUTES_GELADEN ? "geladen" : "niet geladen"} · gemaakt met tools/routezoeker.js</footer>
</main></body></html>`;
  fs.writeFileSync(UIT_HTML, html);
  // compacte JSON voor wie verder wil rekenen
  const json = {
    casus: CASUS.id, versie: CASUS.versie, seed: SEED, factor: FACTOR,
    episodes: resultaten.map((E) => ({
      id: E.ep.id, acties: E.acties.length, gespeeld: E.aantal, telling: E.telling,
      volgordes: E.volgordes.map((v) => v.kort),
      volledig: E.volledig && E.volledig.gedaan ? E.volledig.indelingen.map((x) => ({ indeling: x.id, gespeeld: x.gespeeld, geslaagd: x.geslaagd, kortste: x.kortste && routeSleutel(x.kortste.route), langste: x.langste && routeSleutel(x.langste.route) })) : null,
      haalbaar: E.haalbaar.map((x) => ({ volgorde: x.volgorde.kort, slagers: x.aantalSlagers, gespeeld: x.gespeeld, kortste: x.kortste && { route: routeSleutel(x.kortste.route), kaarten: x.kortste.kaarten, score: x.kortste.score, profiel: x.kortste.profiel } })),
      speelAlles: E.perVolgorde.map((PV) => PV.speelAlles && { volgorde: PV.volgorde.kort, route: routeSleutel(PV.speelAlles.res.route), kaarten: PV.speelAlles.res.kaarten, score: PV.speelAlles.res.score }),
      casus: E.perVolgorde.map((PV) => ({ volgorde: PV.volgorde.kort, routes: PV.casus.map((c) => ({ id: c.id, soort: c.soort, status: c.res.status, geschonden: c.res.geschonden, statusDoorspelen: c.resLaat.status })), variantenZakken: PV.varianten.filter((v) => v.res.status === "gezakt").map((v) => ({ basis: v.basis, wat: v.tekst, geschonden: v.res.geschonden })) })),
      onbedoeld: { minimaal: E.onbedoeld.minimaal.length, zonderProfiel: E.onbedoeld.zonderProfiel.length, buitenCasus: E.onbedoeld.buitenCasus.length, wachtend: E.onbedoeld.wachtend.length, groepOntlopen: E.onbedoeld.groepOntlopen.length },
      dekking: E.dekking.map((d) => ({ id: d.id, geschonden: d.geschonden, alleen: d.alleen, voorbeeld: d.voorbeeld && routeSleutel(d.voorbeeld.route) }))
    }))
  };
  fs.writeFileSync(UIT_JSON, JSON.stringify(json, null, 1));
  return punten;
}

/* ================= hoofdprogramma ================= */
function hoofd() {
  const t0 = Date.now();
  let eps = lijst(CASUS.episodes);
  if (EP_FILTER) { const w = String(EP_FILTER).split(","); eps = eps.filter((e) => w.includes(e.id)); }
  log("Routezoeker: casus " + CASUS.id + " v" + CASUS.versie + ", seed " + SEED + ", factor " + FACTOR);
  const resultaten = [];
  for (const ep of eps) {
    let E;
    try { E = onderzoekEpisode(ep); analyseer(E); }
    catch (e) { console.error("Episode " + ep.id + " kon niet worden onderzocht: " + (e && e.stack || e)); continue; }
    resultaten.push(E);
  }
  const punten = schrijfRapport(resultaten, Date.now() - t0);
  Math.random = ORIGINEEL_RANDOM;
  log("\nKlaar in " + ((Date.now() - t0) / 1000).toFixed(1) + " s; " + TELLING.gespeeld + " routes gespeeld (" + TELLING.cache + " keer uit het geheugen).");
  log("Rapport: " + UIT_HTML + "\nJSON:    " + UIT_JSON + "\n\nSamenvatting:");
  punten.forEach((p) => log(" - " + p.html.replace(/<[^>]+>/g, "")));
}
hoofd();

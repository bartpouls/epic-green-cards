// Eigen mutatiegenerator voor E3-data (criticus S4 r4). Levert lijst {id, desc, soort, path, op, val}.
const KAART = ["G1","G2","G3","O1","O2","V1","V2","V3","V4","V5","V6","V7","V8","V9","V10","B1","B2","B3","B4","B5","N1","N2","N3","Ev1","Ev2","Ev3"];
const MIDDEL = ["V3","V4","V5","V7","V8","V9","V10"];
const DOEL = ["lisinopril","spironolacton","calcium"];
const PNAME = { gespeeld:"nietGespeeld", nietGespeeld:"gespeeld", voor:"na", na:"voor", en:"of", of:"en", actief:"gestart", gestart:"actief", binnenBeurten:"gespeeld", opDagRelatief:"gespeeld", medicatieActief:"waarheid", gebeurtenisGeweest:"inToestand", klachten:"waarheid", niet:"waarheid", alsDan:"en", aantalActieveAntibiotica:"waarheid", waar:"waarheid" };
const OPMAP = { "<":"<=", ">":">=", "==":"!=", "<=":"<", ">=":">" };
const KL = ["af","aan","geenVerbetering48"];
const TOEST = ["cystitis","weefselinvasie","uitdroging"];
function isTodoKey(k) { return /^TODO_BART/.test(k); }
function nextIn(list, v, d) { const i = list.indexOf(v); return list[(i + (d || 1) + list.length) % list.length]; }
module.exports.genereer = function (ep, todo) {
  const out = [];
  const root = { ep, todo };
  function add(path, soort, op, val, desc) { out.push({ id: out.length, path, soort, op, val, desc: desc || (soort + " " + path.join(".") + " " + op + (val !== undefined ? " " + JSON.stringify(val) : "")) }); }
  function walk(x, path, parentKey) {
    if (typeof x === "string") {
      const k = path[path.length - 1];
      const inTodo = path[0] === "todo";
      if (inTodo || path.some(p => isTodoKey(String(p)))) {
        // tekst van TODO: korten
        add(path, "todo", "trunc", undefined); return;
      }
      if (KAART.includes(x) && !["id"].includes(k)) {
        add(path, "gedrag", "set", nextIn(KAART, x, 1)); 
        if (MIDDEL.includes(x)) add(path, "gedrag", "set", nextIn(MIDDEL, x, 1)); else add(path, "gedrag", "set", nextIn(KAART, x, 5));
        return;
      }
      if (k === "id" && /^I\d+$/.test(x)) { add(path, "gedrag", "set", "I99"); return; }
      if (k === "id" && /^[ABC]$/.test(x) && path[1] === "gebeurtenissen") { add(path, "gedrag", "set", nextIn(["A","B","C"], x, 1)); return; }
      if (k === "id" && DOEL.includes(x)) { add(path, "gedrag", "set", nextIn(DOEL, x, 1)); return; }
      if (DOEL.includes(x)) { add(path, "gedrag", "set", nextIn(DOEL, x, 1)); return; }
      if (k === "p" && PNAME[x]) { add(path, "gedrag", "set", PNAME[x]); return; }
      if (k === "op" && OPMAP[x]) { add(path, "gedrag", "set", OPMAP[x]); return; }
      if (k === "waarde" && KL.includes(x)) { add(path, "gedrag", "set", nextIn(KL, x, 1)); return; }
      if (k === "uitSet") { add(path, "gedrag", "set", "gevoelig"); return; }
      if (k === "veld") { add(path, "gedrag", "set", "risicogroep" === x ? "eGFR" : "risicogroep"); return; }
      if (k === "wanneer") { add(path, "gedrag", "set", x === "altijd" ? "alleenBijGehaaldePoort" : "altijd"); return; }
      if (k === "kaartUit" || k === "type" || k === "alleenAlsGespeeld") { add(path, "gedrag", "set", k === "type" ? "naKaartVanKaart" : "V1"); return; }
      if (k === "gebeurtenis" || k === "naGebeurtenis" || k === "eindeBeurtNaGebeurtenis") { add(path, "gedrag", "set", nextIn(["A","B","C"], x, 1)); return; }
      if (k === "start") { add(path, "gedrag", "set", nextIn(KAART, x, 1)); return; }
      if (k === "groep") { add(path, "gedrag", "set", "XY"); return; }
      if (k === "toestand") { add(path, "gedrag", "set", nextIn(TOEST, x, 1)); return; }
      if (k === "optie") { add(path, "gedrag", "set", x === "halveren" ? "verdubbelen" : x + "!"); return; }
      if (k === "naam") { add(path, "gedrag", "set", x + "X"); return; }
      if (["geldtIn"].includes(path[path.length - 2])) { add(path, "gedrag", "set", nextIn(TOEST, x === "*" ? "cystitis" : x, 1)); return; }
      if (["kaart","middel","doel"].includes(k)) { add(path, "gedrag", "set", nextIn(KAART, x, 1)); return; }
      if (k === "sleutel") { add(path, "gedrag", "set", x + "X"); return; }
      // tekstvelden: laatste teken weg + eerste letter hoofdletter-wissel
      if (x.length > 3) { add(path, "tekst", "trunc"); add(path, "tekst", "case"); }
      return;
    }
    if (typeof x === "number") {
      add(path, "gedrag", "set", x + 1); add(path, "gedrag", "set", x - 1);
      return;
    }
    if (typeof x === "boolean") { add(path, "gedrag", "set", !x); return; }
    if (x === null) { return; }
    if (Array.isArray(x)) {
      x.forEach((v, i) => walk(v, path.concat(i)));
      // verwijder element i (laatste ook), swap
      x.forEach((v, i) => { if (x.length >= 1) add(path.concat(i), "struct", "del"); });
      for (let i = 0; i + 1 < x.length; i++) add(path.concat(i), "struct", "swapnext");
      return;
    }
    if (typeof x === "object") {
      for (const k of Object.keys(x)) {
        if (isTodoKey(k) && path[0] !== "todo") { add(path.concat(k), "todo", "delkey"); continue; }
        walk(x[k], path.concat(k));
        if (!isTodoKey(k) && !(["id","level","titel"].includes(k))) add(path.concat(k), "struct", "delkey");
      }
      return;
    }
  }
  walk(ep, ["ep"]);
  walk(todo, ["todo"]);
  return out;
};
function getAt(root, path) { let c = root; for (const p of path.slice(0, -1)) c = c[p]; return c; }
module.exports.pas = function (root, m) {
  const path = m.path, last = path[path.length - 1], par = getAt(root, path);
  switch (m.op) {
    case "set": par[last] = m.val; break;
    case "trunc": par[last] = par[last].slice(0, -1); break;
    case "case": { const s = par[last]; par[last] = s[0] === s[0].toUpperCase() ? s[0].toLowerCase() + s.slice(1) : s[0].toUpperCase() + s.slice(1); break; }
    case "del": if (Array.isArray(par)) par.splice(last, 1); else delete par[last]; break;
    case "delkey": delete par[last]; break;
    case "swapnext": { const t = par[last]; par[last] = par[last + 1]; par[last + 1] = t; break; }
    default: throw new Error("onbekende op " + m.op);
  }
};

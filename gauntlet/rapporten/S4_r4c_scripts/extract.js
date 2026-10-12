const L = require("./load.js"); L.laad();
const fs = require("fs");
const md = fs.readFileSync(L.R + "casus-uwi.md", "utf8");
const strip = s => s.replace(/\*\*/g, "").replace(/\*(?=\S)([^*]+)\*/g, "$1");
const lines = md.split("\n");
const sec = (a, b) => lines.slice(a - 1, b).join("\n");
const s6 = strip(sec(235, 322)), s5 = strip(sec(166, 234)), s4 = strip(sec(108, 165)), all = strip(md);
// data strings
const ep = L.ep3();
const data = [];
(function walk(x, p) {
  if (typeof x === "string") data.push({ p, s: x });
  else if (Array.isArray(x)) x.forEach((v, i) => walk(v, p + "[" + i + "]"));
  else if (x && typeof x === "object") for (const k of Object.keys(x)) { if (/^TODO_BART/.test(k)) continue; walk(x[k], p + "." + k); }
})(ep, "E3");
const todoTxt = new Set();
// Richting 1: data -> casus (alle strings met spatie of >=4 letters die niet pred-ids zijn)
const idlike = /^(?:[A-Za-z]{1,3}\d{0,2}|E3|cystitis|weefselinvasie|uitdroging|lisinopril|spironolacton|calcium|halveren|af|aan|alleenBijGehaaldePoort|altijd|[a-zA-Z]+)$/;
let afw = [];
for (const d of data) {
  if (/\.(p|veld|op|id|kaart|middel|doel|optie|t|uitSet|waarde|wanneer|type|groep|toestand|alleenAlsGespeeld|naam|kaartUit|sleutel|datum)$/.test(d.p.replace(/\[\d+\]/g, "")) || /\.(p|kaart|middel|doel|optie|kaartUit)$/.test(d.p)) { }
  const lastKey = d.p.replace(/\[\d+\]$/, "").split(".").pop();
  if (["p","veld","op","id","kaart","middel","doel","optie","uitSet","waarde","wanneer","type","groep","toestand","alleenAlsGespeeld","kaartUit","sleutel","start","eindeBeurtNaGebeurtenis","gebeurtenis","naGebeurtenis","naKaart","statusNaBeurten"].includes(lastKey) && !/\s/.test(d.s)) continue;
  if (d.p.includes("predicaat") || d.p.includes("trigger") || d.p.includes(".als") || d.p.includes(".dan") || d.p.includes(".arg")) { if (!/\s/.test(d.s) || d.s.length < 20) continue; }
  const hit = all.includes(d.s) ;
  if (!hit) afw.push(d);
}
console.log("DATA->CASUS niet letterlijk in casus-uwi.md:", afw.length);
for (const d of afw) console.log("  ", d.p, JSON.stringify(d.s));
// Richting 2: casus -> data. Tabelcellen en citaten van sectie 6 (+ 5 voor I5-I8, 4 voor I1,I4), bullets.
const dataAll = data.map(d => d.s);
const inData = s => dataAll.some(x => x.includes(s));
const cells = [];
function tabelCellen(txt) {
  for (const ln of txt.split("\n")) if (/^\|/.test(ln) && !/^\|[-| ]+\|$/.test(ln)) cells.push(...ln.split("|").slice(1, -1).map(c => c.trim()).filter(Boolean));
}
tabelCellen(s6);
const quotes = [...s6.matchAll(/"([^"]+)"/g)].map(m => m[1]);
const bullets = s6.split("\n").filter(l => /^\s*- /.test(l)).map(l => l.replace(/^\s*- /, "").trim());
function rapport(naam, arr) {
  const mis = arr.filter(x => !inData(x));
  console.log("\nCASUS->DATA", naam, "totaal", arr.length, "niet als substring in data:", mis.length);
  for (const m of mis) console.log("   ", JSON.stringify(m));
}
rapport("tabelcellen s6", cells); rapport("citaten s6", quotes); rapport("bullets s6", bullets);
// I5-I8 uit s5 en I1/I4 uit s4 en vragen
const c5 = []; { const t = s5; for (const ln of t.split("\n")) if (/^\|\s*I[5-8]\s*\|/.test(ln)) c5.push(...ln.split("|").slice(1,-1).map(c=>c.trim())); }
const c4 = []; { for (const ln of s4.split("\n")) if (/^\|\s*I[14]\s*\|/.test(ln)) c4.push(...ln.split("|").slice(1,-1).map(c=>c.trim())); }
rapport("I5-I8 cellen s5", c5); rapport("I1/I4 cellen s4", c4);
const q5 = []; for (const ln of s5.split("\n")) if (/^\|\s*(I[5-8]|I6,|I7,)/.test(ln)) { const m = ln.match(/"([^"]+)"/g); if (m) q5.push(...m.map(x=>x.slice(1,-1))); }
const q4 = []; for (const ln of s4.split("\n")) if (/^\|\s*I[14]/.test(ln)) { const m = ln.match(/"([^"]+)"/g); if (m) q4.push(...m.map(x=>x.slice(1,-1))); }
rapport("vragen s5 I5-I8", q5); rapport("vragen s4 I1/I4", q4);
// uitsplitsing: voorkomen per veldtype (slotpunt/hoofdletter): eerste teken en laatste teken van casusbron vs data

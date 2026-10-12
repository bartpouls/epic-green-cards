// Blinde A/B: bron (casus-uwi.md + bouwopdracht 6.5, via eigen verwachtingen) vs spel (Evaluatie via Engine). Schrijft paren naar ab_paren.txt en de sleutel naar ../S6_r1.sleutel.json
const fs = require("fs");
const M = require("./mijn_routes.js"); const M2 = require("./mijn_routes2.js"); const M3 = require("./mijn_routes3.js"); const M4 = require("./mijn_routes4.js");
const { root } = require("./laad.js");
const alle = M.routes.concat(M2.routes, M3.routes, M4.routes);
const md = fs.readFileSync(root + "/casus-uwi.md", "utf8").split("\n");
const tab = {}; let inT = false;
for (const l of md) { if (/^\| Id \| Categorie \| Label/.test(l)) { inT = true; continue; } if (inT) { if (!l.startsWith("|")) break; if (/^\|---/.test(l)) continue; const c = l.split(" | ").map(x => x.replace(/^\| /, "").replace(/ \|$/, "")); tab[c[0]] = { label: c[2], downside: c[5] }; } }
function bronDownside(id, ep) { let d = tab[id].downside; if (id === "O1") { if (ep !== "E1") return null; d = d.replace(/^E1: /, ""); } return d; }
const keuze = [["E1-N2 alle vier kaarten (O1,O2,G1,G2) + afwachten: dm 1","A,B"],["E1-N8 V1+V2+V3 zonder N1/Ev1 -> I1,I3 (gelijke ernst: I1)","A,B"],["E1-N7 V1+V3 + N1 + Ev1: profiel Direct (antibioticum gespeeld), duurzaamheid 1","A,B"],
["E2-N1 V4 + B2 stoppen na C (stoppen mag, geen I8)","A,B"],["E2-N2 V5, O2 op dag 4 (verschil 3: net op tijd), V6 op dag 4","A,B"],["E2-N6 V4 zonder N1, zonder O1: I6 (4) gaat voor I1 (5)","A,B"],["E2-N5 V3 zonder O1 en zonder G2: I5 gaat voor I6","A,B"],
["E3-N1 cipro B4 + V6 normale keerdosis: extra vraag maar 1x","A,B"],["E3-N2 B5 vóór Ev2 (Ev2 daarna): I9","B,A"],["E3-N3 O2 zonder Ev2 (casus-lezing: geen O2 ÉN geen Ev2 -> geen schending)","B,A"],["E3-N5 O1 na B1 op dezelfde dag: I11","A,B"],["E3-N6 Ev3 direct (rand van de kaart) zonder antibioticum","A,B"],["E3-N8 G3 nooit gespeeld: dm 2","B,A"],["E3-N10 V8 met V6 pas de dag erna (I13), geen andere","B,A"],["E3-N7 B3 op calcium zonder cipro (geen schending)","A,B"]];
function rng(s) { return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }
const R = rng(20261012);
const paren = [], sleutel = [];
keuze.forEach(([id, sl], n) => {
  const r = alle.find(x => x.id === id); if (!r) throw new Error("route " + id);
  const v = (r.vp && r.vp[sl]) || r.v;
  const res = M.speel(r.ep, r.plannen[sl], sl === "A,B" ? 0 : 0.99);
  const u = res.u, st = res.st;
  // bron
  const volgorde = []; const gez = {}; st.tijdlijn.forEach(t => { if (!gez[t.kaart]) { gez[t.kaart] = 1; volgorde.push(t.kaart); } });
  const bd = volgorde.map(k => ({ k, d: bronDownside(k, r.ep) })).filter(x => x.d !== null).map(x => "  " + x.k + " " + tab[x.k].label + ": " + x.d);
  const fmt = (poort, vraag, profiel, refl, dz, dm, extra, zicht, downs) => ["Poort: " + (poort ? "gehaald" : "niet gehaald"), "Vraag: " + (vraag === null ? "(geen)" : vraag), "Profiel: " + (profiel === null ? "(geen)" : profiel),
    "Reflectievraag: " + (refl === null || refl === undefined ? "(geen)" : refl), "Duurzaamheid: " + (dz === null ? "(geen)" : dz), "Doelmatigheid: " + (dm === null ? "(geen)" : dm), "Extra vragen: " + (extra.length ? extra.join(" / ") : "(geen)"), "Zichtbaar: " + (zicht.length ? zicht.join(" / ") : "(geen)"), "Downsides:"].concat(downs).join("\n");
  const bron = fmt(v.ok, v.ok ? null : v.vraag, v.ok ? (v.profiel === undefined ? (u.profiel && u.profiel.naam) : v.profiel) : null, v.ok ? (v.refl === undefined ? (u.profiel ? u.profiel.reflectievraag : null) : v.refl) : null, v.ok ? v.dz : null, v.ok ? v.dm : null, v.ok ? v.extra : [], v.zicht, bd);
  const spel = fmt(u.poortGehaald, u.vraag, u.profiel ? u.profiel.naam : null, u.profiel ? u.profiel.reflectievraag : null, u.score ? u.score.duurzaamheid : null, u.score ? u.score.doelmatigheid : null, u.extraVragen.map(x => x.vraag), u.zichtbaar.map(x => x.tekst), u.downsides.map(d => "  " + d.kaart + " " + d.label + ": " + d.tekst));
  const spelIsX = R() < 0.5;
  paren.push("=== PAAR " + (n + 1) + " (" + r.ep + ", A/B-volgorde " + sl + ") ===\n--- X ---\n" + (spelIsX ? spel : bron) + "\n--- Y ---\n" + (spelIsX ? bron : spel) + "\n");
  sleutel.push({ paar: n + 1, route: id, volgorde: sl, X: spelIsX ? "spel" : "bron", Y: spelIsX ? "bron" : "spel" });
});
fs.writeFileSync(__dirname + "/ab_paren2.txt", paren.join("\n"));
fs.writeFileSync(root + "/gauntlet/rapporten/S6_r1.sleutel.json", JSON.stringify(sleutel, null, 1));
console.log("paren:", paren.length);

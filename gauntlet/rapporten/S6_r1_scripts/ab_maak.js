// Blinde A/B: bron (casus-uwi.md + bouwopdracht 6.5, via eigen verwachtingen) vs spel (Evaluatie via Engine). Schrijft paren naar ab_paren.txt en de sleutel naar ../S6_r1.sleutel.json
const fs = require("fs");
const M = require("./mijn_routes.js"); const M2 = require("./mijn_routes2.js"); const M3 = require("./mijn_routes3.js");
const { root } = require("./laad.js");
const alle = M.routes.concat(M2.routes, M3.routes);
const md = fs.readFileSync(root + "/casus-uwi.md", "utf8").split("\n");
const tab = {}; let inT = false;
for (const l of md) { if (/^\| Id \| Categorie \| Label/.test(l)) { inT = true; continue; } if (inT) { if (!l.startsWith("|")) break; if (/^\|---/.test(l)) continue; const c = l.split(" | ").map(x => x.replace(/^\| /, "").replace(/ \|$/, "")); tab[c[0]] = { label: c[2], downside: c[5] }; } }
function bronDownside(id, ep) { let d = tab[id].downside; if (id === "O1") { if (ep !== "E1") return null; d = d.replace(/^E1: /, ""); } return d; }
const keuze = [["E1-01 afwachten", "A,B"], ["E1-F13 I1+I3 (gelijke ernst: I1 eerst)", "A,B"], ["E1-10 nitro + O1 + O2 (dm 1)", "A,B"], ["E2-02 trimethoprim 7d + O2 + V6 + B1 (B1 op d3)", "A,B"], ["E2-F6b afwachten", "A,B"], ["E2-F7_6 I7 gaat voor I6", "A,B"], ["E2-04 fosfomycine, G2 te laat", "A,B"],
  ["E3-02 amox/clav 875/125 + sick-day-set", "A,B"], ["E3-02 amox/clav 875/125 + sick-day-set", "B,A"], ["E3-03 ciprofloxacine + B4", "B,A"], ["E3-F-I9b B5 zonder Ev2", "A,B"], ["E3-C4 I15+I9", "B,A"], ["E3-F-I14a cipro zonder B4/B3", "A,B"], ["E3-09 verwijzen na 48 uur zonder verbetering", "A,B"], ["E3-C6 I13+I11 (ernst 3 gaat voor 4)", "B,A"], ["E3-08 hervatten na overleg (B5 na Ev2)", "B,A"]];
function rng(s) { return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }
const R = rng(20261011);
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
fs.writeFileSync(__dirname + "/ab_paren.txt", paren.join("\n"));
fs.writeFileSync(root + "/gauntlet/rapporten/S6_r1.sleutel.json", JSON.stringify(sleutel, null, 1));
console.log("paren:", paren.length);

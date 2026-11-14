// Genereert datamutanten en draait ze. Gebruik: node mut_data.js <aantal|alle> [seed]
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { laad } = require("./laad.js"); laad();
const SCR = "/tmp/claude-0/-home-user-epic-green-cards/b9f5dc07-fd1d-5bf9-b208-00447555559b/scratchpad";
const casus = JSON.parse(JSON.stringify(CASUSSEN[0]));
const SWAP = { V3: "V4", V4: "V3", V5: "V4", V7: "V8", V8: "V7", V9: "V4", V10: "V5", B1: "B2", B2: "B1", B3: "B4", B4: "B3", B5: "B3", N1: "N3", N3: "N1", Ev1: "Ev3", Ev2: "Ev1", Ev3: "Ev1", O1: "O2", O2: "O1", G2: "G3", G3: "G2", V1: "V2", V2: "V1", V6: "V3", lisinopril: "spironolacton", spironolacton: "lisinopril", calcium: "spironolacton", halveren: "verdubbelen", "875/125 mg 2 dd": "500/125 mg 2 dd", A: "B", B: "A", C: "A" };
const OPSWAP = { ">": "<", "<": ">", "==": "!=", ">=": "<", "<=": ">" };
const PSWAP = { gespeeld: "nietGespeeld", nietGespeeld: "gespeeld", voor: "na", na: "voor", en: "of", of: "en" };
const muts = [];
const M = (ep, pad, waarde, desc) => muts.push({ pad: ["episodes", casus.episodes.findIndex(e => e.id === ep)].concat(pad), waarde, desc: ep + " " + desc });
// predicaat-walker
function walkPred(ep, pad, node, label) {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) { node.forEach((x, i) => walkPred(ep, pad.concat([i]), x, label)); return; }
  for (const k of Object.keys(node)) {
    const v = node[k], p2 = pad.concat([k]);
    if (k.startsWith("TODO_BART") || k === "meta") continue;
    if (k === "p" && PSWAP[v]) M(ep, p2, PSWAP[v], label + ": p " + v + " -> " + PSWAP[v]);
    else if (k === "op" && typeof v === "string" && OPSWAP[v]) M(ep, p2, OPSWAP[v], label + ": op " + v + " -> " + OPSWAP[v]);
    else if (["n", "van", "tot", "waarde", "offset"].includes(k) && typeof v === "number") { M(ep, p2, v + 1, label + ": " + k + " " + v + " -> " + (v + 1)); if (v > 0) M(ep, p2, v - 1, label + ": " + k + " " + v + " -> " + (v - 1)); }
    else if (["kaart", "middel", "doel", "optie", "id", "naGebeurtenis", "eindeBeurtNaGebeurtenis"].includes(k) && typeof v === "string" && SWAP[v]) M(ep, p2, SWAP[v], label + ": " + k + " " + v + " -> " + SWAP[v]);
    else if (k === "waarde" && typeof v === "boolean") M(ep, p2, !v, label + ": waarde " + v + " -> " + !v);
    else if (k === "arg" && v && v.p === "niet" === false && false) {}
    if (k === "args" && Array.isArray(v) && v.length > 1) v.forEach((_, i) => M(ep, p2.concat([i]), "__verwijder__", label + ": args[" + i + "] verwijderd"));
    if (k === "arg" && node.p === "niet" && v && typeof v === "object") M(ep, pad, { __vervang_door_arg__: v }, label + ": niet() verwijderd");
    walkPred(ep, p2, v, label);
  }
}
for (const [ei, ep] of casus.episodes.entries()) {
  ep.invarianten.forEach((inv, i) => {
    const L = "inv " + inv.id;
    M(ep.id, ["invarianten", i, "ernst"], inv.ernst + 1, L + " ernst +1");
    if (inv.ernst > 1) M(ep.id, ["invarianten", i, "ernst"], inv.ernst - 1, L + " ernst -1");
    M(ep.id, ["invarianten", i, "geldtIn"], inv.geldtIn[0] === "*" ? [ep.gebeurtenissen && ep.gebeurtenissen.length ? ep.gebeurtenissen[0].toestand ? ep.gebeurtenissen[0].toestand : { gebeurtenis: ep.gebeurtenissen[0].id } : "cystitis"] : ["*"], L + " geldtIn gewijzigd");
    walkPred(ep.id, ["invarianten", i, "predicaat"], inv.predicaat, L + " predicaat");
    (inv.vraagVarianten || []).forEach((v, j) => walkPred(ep.id, ["invarianten", i, "vraagVarianten", j, "als"], v.als, L + " vraagVariant" + j));
    if (inv.vraagVarianten && inv.vraagVarianten.length > 1) M(ep.id, ["invarianten", i, "vraagVarianten"], inv.vraagVarianten.slice().reverse(), L + " vraagVarianten omgedraaid");
  });
  for (const as of ["duurzaamheid", "doelmatigheid"]) {
    const a = ep.score && ep.score[as]; if (!a) continue;
    if (typeof a.start === "number") M(ep.id, ["score", as, "start"], a.start - 1, as + " start -1");
    (a.regels || []).forEach((r, i) => {
      if (typeof r.punten === "number") { M(ep.id, ["score", as, "regels", i, "punten"], r.punten === 3 ? 2 : r.punten + 1, as + " regel" + i + " punten"); }
      if (typeof r.delta === "number") M(ep.id, ["score", as, "regels", i, "delta"], -r.delta, as + " regel" + i + " delta teken");
      if (r.als) walkPred(ep.id, ["score", as, "regels", i, "als"], r.als, as + " regel" + i);
      if (r.perKeer) walkPred(ep.id, ["score", as, "regels", i, "perKeer"], r.perKeer, as + " perKeer" + i);
    });
    if (a.regels && a.regels.length > 1) M(ep.id, ["score", as, "regels"], a.regels.slice().reverse(), as + " regels omgedraaid");
  }
  (ep.profielen || []).forEach((p, i) => { walkPred(ep.id, ["profielen", i, "als"], p.als, "profiel " + p.naam); if (p.reflectievraag) M(ep.id, ["profielen", i, "reflectievraag"], null, "profiel " + p.naam + " reflectievraag weg"); });
  if (ep.profielen && ep.profielen.length > 1) M(ep.id, ["profielen"], ep.profielen.slice().reverse(), "profielen omgedraaid");
  (ep.feedbackExtra || []).forEach((f, i) => { walkPred(ep.id, ["feedbackExtra", i, "trigger"], f.trigger, "feedbackExtra" + i); M(ep.id, ["feedbackExtra", i, "wanneer"], f.wanneer === "altijd" ? "alleenBijGehaaldePoort" : "altijd", "feedbackExtra" + i + " wanneer gewisseld"); });
  (ep.zichtbaarAlsOntbreekt || []).forEach((z, i) => walkPred(ep.id, ["zichtbaarAlsOntbreekt", i, "trigger"], z.trigger, "zichtbaar" + i));
}
function pick(arr, n, seed) { let s = seed; const r = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); }
const want = process.argv[2] === "alle" ? muts.length : +process.argv[2] || 150;
const sel = pick(muts, want, +process.argv[3] || 11);
console.error("datamutanten totaal " + muts.length + ", geselecteerd " + sel.length);
const res = []; let next = 0, actief = 0;
function run(w, filter, spec, cb) {
  cp.execFile("node", [path.join(__dirname, "draai_mut.js"), filter], { cwd: path.join(SCR, "w" + w), env: Object.assign({}, process.env, { MUTSPEC: JSON.stringify(spec) }), maxBuffer: 1e8 }, (err, out) => {
    try { cb(JSON.parse(out.trim().split("\n").pop())); } catch (e) { cb({ crash: String(err && err.message).slice(0, 100) + " " + out.slice(0, 100), rood: 1, groepen: { crash: 1 } }); }
  });
}
function start(w) {
  if (next >= sel.length) { if (actief === 0) klaar(); return; }
  const idx = next++, m = sel[idx]; actief++;
  run(w, "evaluatie", m, r1 => {
    if (r1.rood > 0) { res.push({ idx, desc: m.desc, status: "gedood-evaluatie/routes", groepen: r1.groepen }); actief--; start(w); return; }
    run(w, "ALLES", m, r2 => {
      res.push({ idx, desc: m.desc, status: r2.rood > 0 ? "alleen-gedood-elders" : "OVERLEEFD", groepen: r2.groepen });
      actief--; start(w);
    });
  });
}
function klaar() {
  res.sort((a, b) => a.idx - b.idx);
  const t = s => res.filter(r => r.status === s).length;
  console.log(JSON.stringify({ totaal: res.length, geDoodDoorEvaluatieOfRoutes: t("gedood-evaluatie/routes"), alleenElders: t("alleen-gedood-elders"), overleefd: t("OVERLEEFD") }));
  res.filter(r => r.status !== "gedood-evaluatie/routes").forEach(r => console.log(r.status, "|", r.desc, "|", JSON.stringify(r.groepen)));
  fs.writeFileSync(path.join(__dirname, "mut_data_resultaat.json"), JSON.stringify(res, null, 1));
}
for (let w = 0; w < 4; w++) start(w);

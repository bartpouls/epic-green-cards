const H = require("./harness.js");
const SP = "spironolacton", L875 = "875/125 mg 2 dd", G = "G1";
const T = [];
function t(naam, ord, dagen, verwacht, opt) { T.push({ naam, ord, dagen, verwacht, opt }); }
const AB = [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [], []];
const cl = x => JSON.parse(JSON.stringify(x));
// ernst-volgorde / één vraag
t("I12+I1 (ernst 1 wint)", "AB", (() => { const d = cl(AB); d[0][2] = "V9"; d[1][0] = G; return d; })(), "I12 eerst; geschonden I12,I1");
t("I10+I11+I16 (I10 ernst 2)", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["G1", "G1", "G1"], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], ["Ev1"], [], []], "I10 eerst");
t("I13+I14 (beide 3: eerste in data = I13)", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V8"], "Ev1"], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], [["B1", "V7"], "Ev3"], [], []], "I13 voor I14");
t("I6+I8 (beide 4: I6 eerst)", "AB", [["G3", "V5", "O1"], ["N1", G, ["Ev2", SP]], ["O2", "Ev1", G], [["V6", "V5", "halveren"], ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3", "Ev1", "Ev3"], [], []], "I6 voor I8");
t("I5 én I6 (V3 vóór O1): I5 ernst 2", "AB", [["G3", "V3", "O1"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [], []], "I5 eerst");
// vroeg afronden
t("vroeg: 4 kaarten, A hangt (nog niet zichtbaar)", "AB", [["G3", "O1", "V4"], ["N1"]], "poort? I9 -> geschonden", { vroeg: true });
t("vroeg: A zichtbaar, niets gedaan, afronden", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], []], "I10,I16", { vroeg: true });
t("vroeg: B zichtbaar, niets gedaan, afronden", "BA", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], []], "I15", { vroeg: true });
t("leeg spel (niets spelen) tot einde", "AB", [[]], "I1 + I9 (casus-lezing)");
t("alleen N1 + O2 (geen antibioticum, geen events)", "AB", [["N1", "O2"]], "poort zonder profiel?", { vroeg: true });
// score
t("G3 ná V4: doelmatigheid 2", "AB", [["O1", "V4", "G3"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [], []], "doelm 2");
t("geen G3: doelmatigheid 2", "AB", [["O1", "V4", "N1"], ["O2", ["Ev2", SP], G], [["O1"], ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [], []], "doelm 2");
t("cipro dag A, daarna V8 vóór C (C pas later) -> dur 2", "AB", [["G3", "N1", "O2"], [["Ev2", SP], "G1", "G1"], ["O1", ["V7"], ["B4", "V7"]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], [["B1", "V8"], ["V6", "V8", L875], "N3"], [], []], "zie uitvoer: C na O1 (#7)+3=#10");
t("cipro blijft, geen de-escalatie -> dur 2", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V7"], ["B4", "V7"]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [], []], "dur 2");
// B5 / Ev2 / I9-herstart
t("B5 spiro ná Ev2 (geldig) AB", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [["B5", SP]], []], "poort + herstart-vraag");
t("B5 spiro, Ev2 NA B5 -> I9", "AB", [["G3", "O1", "V4"], ["N1", "O2", G], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [["B5", SP], ["Ev2", SP]], []], "I9");
t("B5 op lisinopril zonder Ev2 -> geen I9 (alleen spiro telt)", "AB", [["G3", "O1", "V4"], ["N1", "O2", G], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["B3", "lisinopril"]], ["N3", ["B5", "lisinopril"]], [], []], "I15? (lisinopril gestopt ipv gehalveerd)");
t("Ev2 alleen op lisinopril (spiro niet) en geen O2 -> I9", "AB", [["G3", "O1", "V4"], ["N1", G, ["Ev2", "lisinopril"]], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [], []], "I9");
for (const x of T) {
  const sb = H.laad();
  try { const r = H.speel(sb, x.dagen, Object.assign({ volgorde: x.ord }, x.opt)); console.log(x.naam.padEnd(66), "\n    ", H.samenvat(r).replace(/vraag: .*? \| ev/, "vraag: … | ev"), "\n     geschonden:", r.uit.geschonden.map(g => g.id + "(" + g.ernst + ")").join(" "), "| verwacht:", x.verwacht, r.uit.extra && r.uit.extra.length ? "\n     extra: " + r.uit.extra.join(" / ") : "", r.uit.zichtbaar.length ? "\n     zichtbaar: " + r.uit.zichtbaar.join(" / ") : ""); }
  catch (e) { console.log(x.naam, "FOUT", e.message); }
}

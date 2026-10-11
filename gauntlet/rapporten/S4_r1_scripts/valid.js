const H = require("./harness.js");
const SP = "spironolacton", L875 = "875/125 mg 2 dd";
const R = [];
function r(naam, ord, dagen, verwacht, opt) { R.push({ naam, ord, dagen, verwacht, opt }); }
// ---- fosfomycine-start
r("R1a fosfomycine-start, vroeg afronden (G3,O1,V4,N1,O2)", "AB", [["G3", "O1", "V4"], ["N1", "O2"]], "POORT", { vroeg: true });
r("R1b fosfomycine-start + A/B volledig", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"]], "POORT");
r("R1b fosfomycine-start + A/B volledig", "BA", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], ["Ev1", "O1", ["B2", "V4"]], ["V8", ["V6", "V8", L875]]], "POORT");
r("R1c fosfomycine-start; alleen G3,O1,V4,N1 + Ev2 en rest van de dagen leeg (A/B niet beantwoord)", "AB", [["G3", "O1", "V4"], ["N1", ["Ev2", SP]]], "SCHENDING");
// ---- weefselinvasie amox/clav + V6 875/125 (zie R1b) en cipro
r("R3 cipro + B4 (A=eerste)", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V7"], ["B4", "V7"]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"]], "POORT");
r("R3 cipro + B4 (B=eerste)", "BA", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], ["Ev1", "O1", ["B1", "V7"]], [["B4", "V7"]]], "POORT");
r("R4 cipro + B3(calcium) (A=eerste)", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V7"], ["B3", "calcium"]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"]], "POORT");
r("R4 cipro + B3(calcium) (B=eerste)", "BA", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], ["Ev1", "O1", ["B1", "V7"]], [["B3", "calcium"]]], "POORT");
// ---- de-escalatie na C
r("R5 cipro -> V8 na C (A=eerste)", "AB", [["G3", "N1", "O2"], [["Ev2", SP], "G1", "O1"].slice(0, 0).concat([["Ev2", SP], "O1", "G1"]), ["O1", ["V7"], ["B4", "V7"]], ["Ev1", ["B1", "V8"], ["V6", "V8", L875]], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"]], "POORT");
r("R5 cipro -> V8 na C (B=eerste)", "BA", [["G3", "O1", "V7"], [["B4", "V7"], "N1", "O2"], [["B1", "V8"], ["V6", "V8", L875], ["B3", SP]], ["Ev1", ["V6", "lisinopril", "halveren"], "N3"]], "POORT");
// ---- verwijzen
r("R7 verwijzen: na A stoppen, Ev1 + Ev3 (48u)", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B2", "V4"], "Ev1"], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], ["Ev1", "Ev3"]], "POORT?");
r("R7b verwijzen direct na A (naast V8)", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V8"], ["V6", "V8", L875]], ["Ev1", "Ev3", ["B3", SP]], [["V6", "lisinopril", "halveren"], "N3"]], "POORT");
// ---- sick-day-set zonder A-respons voor B-eerst, met B5 / Ev2
r("R6 sick-day set + B5 na Ev2 (BA)", "BA", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], ["Ev1", "O1", ["B2", "V4"]], ["V8", ["V6", "V8", L875], ["Ev2", SP]], [["B5", SP]]], "POORT");
const only = process.argv[2];
for (const x of R) {
  if (only && x.naam.indexOf(only) < 0) continue;
  const sb = H.laad();
  try { const res = H.speel(sb, x.dagen, Object.assign({ volgorde: x.ord }, x.opt)); console.log((x.naam + " [" + x.ord + "]").padEnd(78), "\n    ", H.samenvat(res), "| verwacht " + x.verwacht + (res.uit.extra && res.uit.extra.length ? "\n     extra: " + res.uit.extra.join(" / ") : "") + (res.uit.zichtbaar.length ? "\n     zichtbaar: " + res.uit.zichtbaar.join(" / ") : "")); }
  catch (e) { console.log((x.naam + " [" + x.ord + "]").padEnd(78), "FOUT", e.message); }
}

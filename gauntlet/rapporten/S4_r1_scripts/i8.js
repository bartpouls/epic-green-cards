const H = require("./harness.js");
const SP = "spironolacton", L875 = "875/125 mg 2 dd", G = "G1";
const T = [];
function t(naam, ord, dagen, verwacht) { T.push({ naam, ord, dagen, verwacht }); }
t("I8 AB: trimethoprim blijft na C", "AB", [["G3", "O1", "V5"], ["N1", G, ["Ev2", SP]], ["O2", "Ev1", G], [["V6", "V5", "halveren"], ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3", "Ev1", "Ev3"], [], []], "I8");
t("I8 BA: trimethoprim blijft na C", "BA", [["G3", "O1", "V5"], ["N1", G, G], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], ["Ev1", "O2", ["V6", "V5", "halveren"]], ["Ev3", ["Ev2", SP]], [], []], "I8");
t("I8 AB: V10 (resistent) voor C gestart, blijft", "AB", [["G3", "O1", "V10"], ["N1", G, ["Ev2", SP]], ["Ev1", G, G], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], ["Ev1", "Ev3"], [], []], "I8");
t("I8 AB: stopt binnen 2 beurten (B2 op dag dC+1) = geen schending", "AB", [["G3", "O1", "V5"], ["N1", G, ["Ev2", SP]], ["O2", "Ev1", G], [["V6", "V5", "halveren"], ["B3", SP], ["V6", "lisinopril", "halveren"]], [["B2", "V5"], "N3", "Ev1"], ["Ev3"], []], "OK");
// gaten-onderzoek: resistent middel pas ná C starten
t("GAT: na C wisselen van werkzaam V4 naar resistent V10 (dag dC), blijft", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V10"], "Ev1"], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], ["Ev1", "Ev3"], [], []], "I8? (bouwopdracht 6.1: resistent actief + klachten houden aan + niet gewisseld binnen 2 beurten)");
t("GAT: idem BA", "BA", [["G3", "O1", "V4"], ["N1"], [["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3", "Ev1", "O2"], ["O1", ["B1", "V10"], "Ev1"], ["Ev3", ["Ev2", SP]], []], "I8?");
// I14 met Ev3 zodat I16 niet meespeelt
t("I14b AB: B4 twee dagen later + Ev3", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V7"], "Ev1"], [["B3", SP], ["V6", "lisinopril", "halveren"], "N3"], [["B4", "V7"], "Ev1", "Ev3"], [], []], "I14");
t("I14c AB: B4 dezelfde dag, V6 normale keerdosis (bronconflict) -> geen schending", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V7"], ["B4", "V7"]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3", ["V6", "V7", "normale keerdosis 1× per 24 uur"]], [], []], "OK");
t("I14d AB: calcium gepauzeerd VOOR cipro gestart", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B3", "calcium"], ["B1", "V7"]], ["Ev1", ["B3", SP], ["V6", "lisinopril", "halveren"]], ["N3"], [], []], "OK");
t("I14e AB: B3 op spironolacton i.p.v. calcium (verkeerd doel) bij cipro", "AB", [["G3", "O1", "V4"], ["N1", "O2", ["Ev2", SP]], ["O1", ["B1", "V7"], ["B3", SP]], ["Ev1", ["V6", "lisinopril", "halveren"], "N3"], ["Ev3"], [], []], "I14");
for (const x of T) {
  const sb = H.laad();
  try { const r = H.speel(sb, x.dagen, { volgorde: x.ord }); console.log(x.naam.padEnd(70), "\n    ", H.samenvat(r), "\n     verwacht", x.verwacht); }
  catch (e) { console.log(x.naam, "FOUT", e.message); }
}

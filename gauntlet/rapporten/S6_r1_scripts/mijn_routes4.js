// Extra eigen routes (ronde 1, herstart): randgevallen. Verwachtingen uit casus-uwi.md / bouwopdracht 6.1/6.5, niet uit routes.js.
const M = require("./mijn_routes.js");
const { V, X, R, Z, W, AB, BA, sub, ins, kop, ft, gh, draai } = M;
const routes = [];
const add = (id, ab, ba, v, extra) => routes.push(Object.assign({ id, ep: "E3", plannen: { "A,B": ab, "B,A": ba }, v }, extra || {}));
const r12 = (id, ep, plan, v) => routes.push({ id, ep, plannen: { "A,B": plan, "B,A": plan }, v });
const SD = "B3::spironolacton", LIS = "V6::lisinopril::halveren", EV2 = "Ev2::spironolacton";
// ---- E1 ----
r12("E1-N1 V2+V3+V4 -> alleen I4", "E1", [["V2", "V3", "V4"], ["N1"]], ft(["I4"], V.I4));
r12("E1-N2 alle vier kaarten (O1,O2,G1,G2) + afwachten: dm 1", "E1", [["V1", "N1", "Ev1"], ["O1", "O2", "G1"], ["G2"]], gh("Terughoudend", R.terug, 3, 1, [X.O1]));
r12("E1-N3 niets gespeeld", "E1", [[]], ft(["I1"], V.I1, [Z.N1]));
r12("E1-N4 alleen N1+Ev1 zonder route (strengste lezing: I1)", "E1", [["N1", "Ev1"]], ft(["I1"], V.I1));
r12("E1-N5 V5 daarna V3 op dag 3 (I4 op verschillende dagen), met N1", "E1", [["V5", "N1"], [], ["V3"]], ft(["I4"], V.I4));
r12("E1-N6 V4 + B-kaart bestaat niet in E1: B2 niet speelbaar", "E1", [["V4", "N1"]], gh("Direct behandelen", R.direct, 1, 3));
r12("E1-N7 V1+V3 + N1 + Ev1: profiel Direct (antibioticum gespeeld), duurzaamheid 1", "E1", [["V1", "V3", "N1"], ["Ev1"]], gh("Direct behandelen", R.direct, 1, 3));
r12("E1-N8 V1+V2+V3 zonder N1/Ev1 -> I1,I3 (gelijke ernst: I1)", "E1", [["V1", "V2", "V3"]], ft(["I1", "I3"], V.I1, [Z.N1, Z.V1]));
// ---- E2 ----
r12("E2-N1 V4 + B2 stoppen na C (stoppen mag, geen I8)", "E2", [["G2", "O1", "V4"], ["N1", "N2::V4"], [], ["B2::V4"], [], [], []], gh("Kweekgestuurd, smal", null, 3, 3));
r12("E2-N2 V5, O2 op dag 4 (verschil 3: net op tijd), V6 op dag 4", "E2", [["G2", "O1", "V5"], ["N1"], ["B1::V4"], ["O2", "V6::V5::halveren"], [], [], []], gh("Bijgestuurd", null, 3, 3));
r12("E2-N3 V5, O2 op dag 1 (verschil 0: te vroeg)", "E2", [["O1", "V5", "O2"], ["N1", "G2"], ["B1::V4"], ["V6::V5::halveren"], [], [], []], ft(["I7"], V.I7k, [Z.V5].filter(() => false)));
r12("E2-N4 V2 uitgesteld recept in risicogroep", "E2", [["G2", "V2", "N1"], ["Ev1"], []], ft(["I6"], V.I6a));
r12("E2-N5 V3 zonder O1 en zonder G2: I5 gaat voor I6", "E2", [["V3", "N1"], [], []], ft(["I5", "I6"], V.I5, [Z.V3]));
r12("E2-N6 V4 zonder N1, zonder O1: I6 (4) gaat voor I1 (5)", "E2", [["G2", "V4"], [], []], ft(["I6", "I1"], V.I6k));
r12("E2-N7 V4+V5 beide + N1 + O2 + V6 + O1: I4 (5) alleen", "E2", [["O1", "V4", "V5"], ["G2", "N1", "O2"], [], ["V6::V5::halveren", "B2::V5"], [], [], []], ft(["I4"], V.I4));
// ---- E3 ----
const CAB = [["G3", "O1", "V4"], ["N1", "O2", EV2], ["O1", "B1::V7", "B4::V7"], ["Ev1", SD, LIS], ["N3"], [], []];
const CBA = [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "B1::V7", "B4::V7"], ["Ev1", EV2], []];
add("E3-N1 cipro B4 + V6 normale keerdosis: extra vraag maar 1x", S(CAB, "O1", "O1"), S(CBA, "O1", "O1"), gh("Richtlijn eerste keus", R.cipro, 2, 3, [X.cipro]), { opt: 0 });
function S(p, o, n) { return sub(p, o, n); }
add("E3-N2 B5 vóór Ev2 (Ev2 daarna): I9", [["G3", "O1", "V4"], ["N1", "O2", "G1"], ["O1", "B1::V8", W], ["Ev1", SD, LIS], ["N3", "B5::spironolacton", EV2], [], []], [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "B1::V8", W], ["Ev1", "B5::spironolacton", EV2], []], ft(["I9"], V.I9, [Z.I9]));
add("E3-N3 O2 zonder Ev2 (casus-lezing: geen O2 ÉN geen Ev2 -> geen schending)", S(AB, EV2, "G1"), S(BA, EV2, "G1"), gh("Kweekgestuurd", null, 3, 3));
add("E3-N4 Ev2 zonder O2 (geen schending)", S(AB, "O2", "G1"), S(BA, "O2", "G1"), gh("Kweekgestuurd", null, 3, 3));
add("E3-N5 O1 na B1 op dezelfde dag: I11", [["G3", "O1", "V4"], ["N1", "O2", EV2], ["B1::V8", "O1", W], ["Ev1", SD, LIS], ["N3"], [], []], [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["B1::V8", "O1", W], ["Ev1", EV2], []], ft(["I11"], V.I11));
add("E3-N6 Ev3 direct (rand van de kaart) zonder antibioticum", [["N1", "O2", EV2], ["Ev3"]], [["N1", "O2", EV2], ["Ev3"]], { ok: true, profiel: null, dz: null, dm: 2, extra: [], zicht: [] });
add("E3-N7 B3 op calcium zonder cipro (geen schending)", S(AB, "N3", "B3::calcium"), S(BA, "N3", "B3::calcium"), ft(["I15"], V.I15));
add("E3-N8 G3 nooit gespeeld: dm 2", [["G1", "O1", "V4"], ["N1", "O2", EV2], ["O1", "B1::V8", W], ["Ev1", SD, LIS], ["N3"], [], []], [["G1", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "B1::V8", W], ["Ev1", EV2], []], gh("Kweekgestuurd", null, 3, 2));
add("E3-N10 V8 met V6 pas de dag erna (I13), geen andere", [["G3", "O1", "V8"], [W, "N1", "O2"], [EV2, "O1"], ["Ev1", SD, LIS], ["N3"], [], []], [["G3", "O1", "V8"], [W, "N1"], [SD, LIS, EV2], ["N3", "Ev1", "O2"], ["O1"], ["Ev1"], []], ft(["I13"], V.I13));
add("E3-N11 cipro + B4 + cipro-routes zonder Ev1 binnen 48u (I16 alleen)", S(CAB, "Ev1", "G1"), S(CBA, "Ev1", "G1"), ft(["I16"], V.I16), { skip: true });
module.exports = { routes };
if (require.main === module) { const r = draai(routes); console.log(r.n + " runs, " + r.rood + " rood"); }

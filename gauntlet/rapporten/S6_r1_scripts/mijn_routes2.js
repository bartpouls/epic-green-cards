const M = require("./mijn_routes.js");
const { V, Z, W, AB, BA, sub, ins, kop, ft, r3, draai } = M;
const routes = [];
const add = (id, ab, ba, v, extra) => routes.push(Object.assign({ id, ep: "E3", plannen: { "A,B": ab, "B,A": ba }, v }, extra || {}));
const SD = "B3::spironolacton", LIS = "V6::lisinopril::halveren", EV2 = "Ev2::spironolacton";
const S = (p, o, n) => sub(p, o, n);
// ---- precies één invariant ----
add("E3-F-I1", S(AB, "N1", "G1"), S(BA, "N1", "G1"), ft(["I1"], V.I1));
add("E3-F-I4", [["G3", "O1", "V4"], ["N1", "V8", W], ["O1", "B2::V4", "G1"], ["Ev1", SD, LIS], ["N3"], ["O2", EV2], []],
  [["G3", "O1", "V4"], ["N1", "V8", W], [SD, LIS, "N3"], ["B2::V4", "Ev1", "O2"], [EV2], [], []], ft(["I4"], V.I4));
add("E3-F-I5", S(AB, "V4", "V3"), S(BA, "V4", "V3"), ft(["I5"], V.I5));
add("E3-F-I6a geen kweek", [["G3", "V4", "O1"]].concat(AB.slice(1)), [["G3", "V4", "O1"]].concat(BA.slice(1)), ft(["I6"], V.I6k));
add("E3-F-I6b afwachten", ins(AB, 6, "V1"), ins(BA, 7, "V1"), ft(["I6"], V.I6a));
add("E3-F-I6c uitgesteld", ins(AB, 6, "V2"), ins(BA, 7, "V2"), ft(["I6"], V.I6a));
add("E3-F-I7 trimethoprim zonder halveren", S(AB, "V4", "V5"), S(BA, "V4", "V5"), ft(["I7"], V.I7h));
add("E3-F-I7b trimethoprim zonder O2 (V6 wel)", [["G3", "O1", "V5"], ["N1", "G1", EV2], ["O1", "B1::V8", W], ["Ev1", SD, LIS], ["N3", "V6::V5::halveren"], [], []],
  [["G3", "O1", "V5"], ["N1"], [SD, LIS], ["N3", "Ev1", "G1"], ["O1", "B1::V8", W], ["Ev1", EV2, "V6::V5::halveren"], []], ft(["I7"], V.I7k));
add("E3-F-I8", [["G3", "O1", "V5"], ["N1", "O2", EV2], ["Ev1", "G1", "G1"], [SD, LIS, "V6::V5::halveren"], ["N3", "Ev1", "Ev3"], [], []],
  [["G3", "O1", "V5"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["Ev1", "G1", "V6::V5::halveren"], ["Ev3"], []], ft(["I8"], V.I8));
add("E3-F-I9a geen O2 en geen Ev2", S(S(AB, "O2", "G1"), EV2, "G1"), S(S(BA, "O2", "G1"), EV2, "G1"), ft(["I9"], V.I9, [Z.I9]));
add("E3-F-I9b B5 zonder Ev2", [["G3", "O1", "V4"], ["N1", "O2", "G1"], ["O1", "B1::V8", W], ["Ev1", SD, LIS], ["N3", "B5::spironolacton"], [], []],
  [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "B1::V8", W], ["Ev1", "B5::spironolacton"], []], ft(["I9"], V.I9, [Z.I9]));
add("E3-F-I9c alleen Ev2 op lisinopril, geen O2", S(S(AB, "O2", "G1"), EV2, "Ev2::lisinopril"), S(S(BA, "O2", "G1"), EV2, "Ev2::lisinopril"), ft(["I9"], V.I9, [Z.I9]));
add("E3-F-I10", [["G3", "O1", "V4"], ["N1", "O2", EV2], ["O1", "G1", "G1"], ["Ev1", SD, LIS], ["N3", "Ev3"], [], []],
  [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "G1", "G1"], ["Ev1", EV2], ["Ev3"]], ft(["I10"], V.I10));
add("E3-F-I11 wissel zonder nieuwe kweek", [["G3", "O1", "V4"], ["N1", "O2", EV2], ["G1", "B1::V8", W], ["Ev1", SD, LIS], ["N3"], [], []],
  [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["G1", "B1::V8", W], ["Ev1", EV2], []], ft(["I11"], V.I11));
add("E3-F-I12 cotrimoxazol", S(AB, "V4", "V9"), S(BA, "V4", "V9"), ft(["I12"], V.I12));
add("E3-F-I13a verkeerde dosis", S(AB, W, "V6::V8::500/125 mg 2 dd"), S(BA, W, "V6::V8::500/125 mg 2 dd"), ft(["I13"], V.I13));
add("E3-F-I13b geen V6", S(AB, W, "G1"), S(BA, W, "G1"), ft(["I13"], V.I13));
add("E3-F-I13c V6 een dag later (niet dezelfde beurt)", [["G3", "O1", "V4"], ["N1", "O2", EV2], ["O1", "B1::V8", "G1"], ["Ev1", SD, W], ["N3", LIS], [], []],
  [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "B1::V8", "G1"], ["Ev1", EV2, W], []], ft(["I13"], V.I13));
const CAB = [["G3", "O1", "V4"], ["N1", "O2", EV2], ["O1", "B1::V7", "G1"], ["Ev1", SD, LIS], ["N3", "Ev3"], [], []];
const CBA = [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "B1::V7", "G1"], ["Ev1", EV2], ["Ev3"]];
add("E3-F-I14a cipro zonder B4/B3", CAB, CBA, ft(["I14"], V.I14, [Z.cipro]));
add("E3-F-I14b B4 te laat", ins(CAB, 5, "B4::V7"), ins(S(CBA, "Ev2::spironolacton", "G1"), 7, "B4::V7"), ft(["I14"], V.I14, [Z.cipro]));
add("E3-F-I14c B3 op spironolacton (niet calcium) telt niet", S(CAB, "G1", "B3::spironolacton"), S(CBA, "G1", "B3::spironolacton"), ft(["I14"], V.I14, [Z.cipro]), { skip: true });
add("E3-F-I15 geen N3", S(AB, "N3", "G1"), S(BA, "N3", "G1"), ft(["I15"], V.I15));
add("E3-F-I15b geen halveren", S(AB, LIS, "G1"), S(BA, LIS, "G1"), ft(["I15"], V.I15));
add("E3-F-I15c lisinopril stoppen ipv halveren", S(AB, LIS, "V6::lisinopril::stoppen"), S(BA, LIS, "V6::lisinopril::stoppen"), ft(["I15"], V.I15));
add("E3-F-I15d B3 op calcium ipv spironolacton", S(AB, SD, "B3::calcium"), S(BA, SD, "B3::calcium"), ft(["I15"], V.I15));
add("E3-F-I16a geen Ev1 voor A", [["G3", "O1", "V4"], ["N1", "O2", EV2], ["O1", "B1::V8", W], ["G1", SD, LIS], ["N3", "Ev1"], [], []],
  [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "B1::V8", W], ["G1", EV2], []], ft(["I16"], V.I16));
add("E3-F-I16b geen verwijzing", [["G3", "O1", "V4"], ["N1", "O2", EV2], ["B2::V4", "Ev1", "G1"], [SD, LIS, "N3"], ["Ev1"], ["G1"], ["G1"]],
  [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["B2::V4", "Ev1", EV2], ["G1"], ["G1"]], ft(["I16"], V.I16));
// ---- combinaties ----
add("E3-C1 I12+I1", S(S(AB, "V4", "V9"), "N1", "G1"), S(S(BA, "V4", "V9"), "N1", "G1"), ft(["I12", "I1"], V.I12));
add("E3-C2 I12+I5", [["G3", "O1", "V3"], ["N1", "O2", EV2], ["O1", "B1::V9", "G1"], ["Ev1", SD, LIS], ["N3", "B1::V8", W], [], []],
  [["G3", "O1", "V3"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "B1::V9", "G1"], ["Ev1", EV2, "B1::V8"], []], ft(["I12", "I5"], V.I12), { skip: true });
add("E3-C3 I5+I10 (gelijke ernst: I5 eerst)", [["G3", "O1", "V3"], ["N1", "O2", EV2], ["O1", "G1", "G1"], ["Ev1", SD, LIS], ["N3", "Ev3"], [], []],
  [["G3", "O1", "V3"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "G1", "G1"], ["Ev1", EV2], ["Ev3"]], ft(["I5", "I10"], V.I5));
add("E3-C4 I15+I9", S(S(S(AB, "N3", "G1"), "O2", "G1"), EV2, "G1"), S(S(S(BA, "N3", "G1"), "O2", "G1"), EV2, "G1"), ft(["I15", "I9"], V.I15, [Z.I9]));
add("E3-C5 I9+I13 (gelijke ernst 3: I9 eerst)", S(S(S(AB, "O2", "G1"), EV2, "G1"), W, "V6::V8::500/125 mg 2 dd"), S(S(S(BA, "O2", "G1"), EV2, "G1"), W, "V6::V8::500/125 mg 2 dd"), ft(["I9", "I13"], V.I9, [Z.I9]));
add("E3-C6 I13+I11 (ernst 3 gaat voor 4)", [["G3", "O1", "V4"], ["N1", "O2", EV2], ["G1", "B1::V8", "V6::V8::500/125 mg 2 dd"], ["Ev1", SD, LIS], ["N3"], [], []],
  [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["G1", "B1::V8", "V6::V8::500/125 mg 2 dd"], ["Ev1", EV2], []], ft(["I13", "I11"], V.I13));
add("E3-C8 I8+I1 (ernst 4 gaat voor 5)", S([["G3", "O1", "V5"], ["N1", "O2", EV2], ["Ev1", "G1", "G1"], [SD, LIS, "V6::V5::halveren"], ["N3", "Ev1", "Ev3"], [], []], "N1", "G1"),
  S([["G3", "O1", "V5"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["Ev1", "G1", "V6::V5::halveren"], ["Ev3"], []], "N1", "G1"), ft(["I8", "I1"], V.I8));
add("E3-C9 I6+I8 (gelijke ernst 4: I6 eerst)", [["G3", "V5", "O1"], ["N1", "O2", EV2], ["Ev1", "G1", "G1"], [SD, LIS, "V6::V5::halveren"], ["N3", "Ev1", "Ev3"], [], []],
  [["G3", "V5", "O1"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["Ev1", "G1", "V6::V5::halveren"], ["Ev3"], []], ft(["I6", "I8"], V.I6k));
add("E3-C11a vroeg afgerond d3 (A+C zichtbaar, B niet)", [["G3", "O1", "V4"], ["N1", "O2", EV2], []], [["G3", "O1", "V4"], ["N1", "O2", EV2], []], ft(["I10", "I16"], V.I10), { vp: { "B,A": ft(["I15"], V.I15, [Z.sick]) } });
add("E3-C12 lege route", [[]], [[]], ft(["I9", "I1"], V.I9, [Z.I9]));
add("E3-C13 alleen N1", [["N1"]], [["N1"]], ft(["I9"], V.I9, [Z.I9]));
module.exports = { routes };
if (require.main === module) { const r = draai(routes); console.log(r.n + " runs, " + r.rood + " rood"); }

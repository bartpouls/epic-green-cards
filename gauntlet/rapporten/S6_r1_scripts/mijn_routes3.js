const M = require("./mijn_routes.js");
const { V, Z, W, AB, BA, sub, ins, ft, gh, draai } = M;
const routes = [];
const add = (id, ab, ba, v, extra) => routes.push(Object.assign({ id, ep: "E3", plannen: { "A,B": ab, "B,A": ba }, v }, extra || {}));
const SD = "B3::spironolacton", LIS = "V6::lisinopril::halveren", EV2 = "Ev2::spironolacton";
const S = (p, o, n) => sub(p, o, n);
add("E3-C2 I12+I5", [["G3", "O1", "V3"], ["N1", "O2", EV2], ["O1", "B1::V9", "G1"], ["Ev1", SD, LIS], ["N3"], [], []],
  [["G3", "O1", "V3"], ["N1"], [SD, LIS], ["N3", "Ev1", "O2"], ["O1", "B1::V9", "G1"], ["Ev1", EV2], []], ft(["I12", "I5"], V.I12));
add("E3-C14 I12+I9", S(S(S(AB, "V4", "V9"), "O2", "G1"), EV2, "G1"), S(S(S(BA, "V4", "V9"), "O2", "G1"), EV2, "G1"), ft(["I12", "I9"], V.I12, [Z.I9]));
add("E3-C15 I5+I9", S(S(S(AB, "V4", "V3"), "O2", "G1"), EV2, "G1"), S(S(S(BA, "V4", "V3"), "O2", "G1"), EV2, "G1"), ft(["I5", "I9"], V.I5, [Z.I9]));
add("E3-C16 I10+I15 (gelijke ernst 2: I10 eerst)", [["G3", "O1", "V4"], ["N1", "O2", EV2], ["O1", "G1", "G1"], ["Ev1", SD, LIS], ["G1", "Ev3"], [], []],
  [["G3", "O1", "V4"], ["N1"], [SD, LIS], ["G1", "Ev1", "O2"], ["O1", "G1", "G1"], ["Ev1", EV2], ["Ev3"]], ft(["I10", "I15"], V.I10));
add("E3-C17 I7+I9 (gelijke ernst 3: I7 eerst)", [["G3", "O1", "V5"], ["N1", "G1", "G1"], ["Ev1", "O1", "B1::V8"], [SD, LIS, W], ["N3", "V6::V5::halveren"], [], []],
  [["G3", "O1", "V5"], ["N1"], [SD, LIS], ["N3", "Ev1", "G1"], ["O1", "B1::V8", W], ["Ev1", "V6::V5::halveren"], []], ft(["I7", "I9"], V.I7k, [Z.I9]), { skip: true });
const E2 = [];
const r2 = (id, plan, v) => E2.push({ id, ep: "E2", plannen: { "A,B": plan, "B,A": plan }, v });
r2("E2-V1 vroeg afgerond voor C: trimethoprim zonder O2 en V6", [["G2", "O1", "V5"]], ft(["I1", "I7"], V.I7k).ids ? ft(["I7", "I1"], V.I7k, [Z.V5]) : null);
r2("E2-V2 afgerond d2, geen C: V4 met N1 (nog gewoon gehaald; I8 pas na C)", [["G2", "O1", "V4"], ["N1"]], gh("Kweekgestuurd, smal", null, 3, 3));
r2("E2-V3 drie wissels (klem dz op 1)", [["G2", "O1", "V4"], ["N1", "B1::V3"], ["B1::V4", "N2::V4"], [], [], []], ft(["I5"], V.I5));
module.exports = { routes: routes.concat(E2) };
if (require.main === module) { const r = draai(routes.concat(E2)); console.log(r.n + " runs, " + r.rood + " rood"); }

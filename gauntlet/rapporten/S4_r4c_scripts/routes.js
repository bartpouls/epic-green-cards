const L=require("./load.js"); if(!globalThis.Engine) L.laad();
const {play,samenvat}=require("./speel.js");
const V = { // casusvragen (eigen kopie uit casus-uwi.md, niet uit de data)
 I1:"Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?",
 I4:"Wat lost het tweede middel op dat het eerste niet oplost?",
 I5:"Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?",
 I6a:"Wat vertelt een kweek van urine die al antibioticum heeft gezien?",
 I6b:"Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?",
 I7a:"Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",
 I7b:"Dag 4. Hoeveel trimethoprim klaren haar nieren nog?",
 I8:"De kweek is binnen en de klachten blijven. Waar wacht je nog op?",
 I9:"Haar nierfunctie is 28. Welk van haar vaste middelen begon toen die nog hoger was, en wie kijkt daar nu naar?",
 I10:"Fosfomycine werkt in de blaas. Waar zit de infectie nu?",
 I11:"Je wisselt. Waarop baseer je de wissel daarna?",
 I12:"Cotrimoxazol naast spironolacton bij een eGFR van 28. Wat doet dat met haar kalium?",
 I13:"Clavulaanzuur bij een eGFR van 28. Waar blijft het?",
 I14:"Ze neemt elke ochtend calcium. Hoeveel van je ciprofloxacine komt in haar bloed?",
 I15:"Ze drinkt nauwelijks en heeft twee dagen koorts. Wat doen lisinopril en spironolacton met een nier die al droog staat?",
 I16:"Het is 48 uur later en ze is niet beter. Wat is je volgende kaart, en is die nog aan jou?"
};
const X = { herstart:"De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?", cipro:"De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?" };
const Z = { sick:"De nierfunctie daalt verder en het kalium stijgt.", cipro48:"Na 48 uur geen verbetering.", i9:"Het kalium is onbekend, en niemand heeft naar spironolacton gekeken." };
const REFL = { rl:"Eerste keus volgens de richtlijn. Gold die eerste keus ook voor déze patiënt?" };
const V6a="V6>V8>875/125 mg 2 dd", V6l="V6>lisinopril>halveren", B3s="B3>spironolacton", E2s="Ev2>spironolacton";
const R = []; // {id, soort, order, steps, verwacht}
function add(id, soort, plans, verwacht) { for (const o of ["AB","BA"]) if (plans[o]) R.push({ id: id + " [" + o + "]", soort, order: o, steps: plans[o], verwacht }); }
// ---- geldige routes
const AB = ["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3"];
const BA = ["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"];
add("G-V8 direct", "geldig", { AB, BA }, { geschonden: [], profiel: "Kweekgestuurd", refl: null, score: [3,3], extra: [], zicht: [] });
add("G-cipro+B4", "geldig", {
  AB: ["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V7","B4>V7","|","Ev1",B3s,V6l,"|","N3"],
  BA: ["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V7","B4>V7","|","Ev1"] },
  { geschonden: [], profiel: "Richtlijn eerste keus", refl: REFL.rl, score: [2,3], extra: [X.cipro], zicht: [] });
add("G-cipro+B3calcium", "geldig", {
  AB: ["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V7","B3>calcium","|","Ev1",B3s,V6l,"|","N3"],
  BA: ["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V7","B3>calcium","|","Ev1"] },
  { geschonden: [], profiel: "Richtlijn eerste keus", refl: REFL.rl, score: [2,3], extra: [X.cipro], zicht: [] });
add("G-cipro->V8 na C", "geldig", {
  AB: ["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V7","B4>V7","|","Ev1",B3s,V6l,"|","N3","B1>V8",V6a],
  BA: ["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V7","B4>V7","|","B1>V8",V6a,"Ev1"] },
  { geschonden: [], profiel: "Kweekgestuurd", refl: null, score: [3,3], extra: [X.cipro], zicht: [] });
add("G-B5 hervatten na Ev2", "geldig", {
  AB: ["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3","|",E2s,"B5>spironolacton"],
  BA: ["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1",E2s,"B5>spironolacton"] },
  { geschonden: [], profiel: "Kweekgestuurd", refl: null, score: [3,3], extra: [X.herstart], zicht: [] });
add("G-V5 route (O2 d2, halveren d5)", "geldig", {
  AB: ["G3","O1","V5","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3","V6>V5>halveren"],
  BA: ["G3","O1","V5","|","N1","O2","|","B1>V8",V6a,B3s,"|",V6l,"N3","Ev1","|","V6>V5>halveren"] },
  { geschonden: [], profiel: "Kweekgestuurd", refl: null, score: [3,3], extra: [], zicht: [] });
add("G-verwijzen", "geldig", {
  AB: ["G3","O1","V4","|","N1","O2",E2s,"|","B2>V4","Ev3","G1","|","Ev1",B3s,V6l,"|","N3"],
  BA: ["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","B2>V4","Ev3","Ev1"] },
  { geschonden: [], profiel: null, refl: null, score: [null,3], extra: [], zicht: [] });
add("G-vroeg afronden na 6 kaarten", "geldig", {
  AB: ["G3","O1","V4","|","N1","O2",E2s], BA: ["G3","O1","V4","|","N1","O2",E2s] },
  { geschonden: [], profiel: null, refl: null, score: [null,3], extra: [], zicht: [] });
module.exports = { R, V, X, Z, AB, BA, add, V6a, V6l, B3s, E2s, REFL };
if (require.main === module) {
  let bad = 0;
  for (const r of R) {
    let res; try { res = play(r.order, r.steps); } catch (e) { console.log("CRASH", r.id, e.message); bad++; continue; }
    const s = samenvat(res), v = r.verwacht, u = res.u;
    const probs = [];
    if (JSON.stringify(s.geschonden) !== JSON.stringify(v.geschonden)) probs.push("geschonden " + JSON.stringify(s.geschonden));
    if (v.profiel !== undefined && s.profiel !== v.profiel && !(s.profiel == null && v.profiel == null)) probs.push("profiel " + s.profiel);
    if (v.score && JSON.stringify([u.score && u.score.duurzaamheid, u.score && u.score.doelmatigheid]) !== JSON.stringify(v.score) && soort(r)==="geldig") probs.push("score " + JSON.stringify(u.score));
    if (v.refl !== undefined && soort(r)==="geldig" && ((u.profiel && u.profiel.reflectievraag) || null) !== v.refl) probs.push("refl " + (u.profiel && u.profiel.reflectievraag));
    if (JSON.stringify(u.extraVragen.map(x => x.vraag)) !== JSON.stringify(v.extra)) probs.push("extra " + JSON.stringify(u.extraVragen.map(x=>x.vraag)));
    if (JSON.stringify(u.zichtbaar.map(x => x.tekst)) !== JSON.stringify(v.zicht)) probs.push("zicht " + JSON.stringify(u.zichtbaar.map(x=>x.tekst)));
    console.log((probs.length ? "ROOD " : "ok   ") + r.id + " " + JSON.stringify(s.geb) + (probs.length ? " :: " + probs.join(" | ") : "")); if (probs.length) bad++;
  }
  console.log(bad + " rood van " + R.length);
}
function soort(r) { return r.soort; }

const L=require("./load.js"); if(!globalThis.Engine) L.laad();
const {play,samenvat}=require("./speel.js");
const {V,X,Z,V6a,V6l,B3s,E2s,R}=require("./routes.js");
const F=[]; // {id, order, steps, ids:[...], vraag}
function f(id, plans, ids, vraag) { for (const o of ["AB","BA"]) if (plans[o]) F.push({ id: id + " [" + o + "]", order: o, steps: plans[o], ids, vraag: vraag === undefined ? V[ids[0]] : vraag }); }
const H="V6>V5>halveren";
// I1
f("I1 geen N1", { AB:["G3","O1","V4","|","G1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","G1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I1"]);
// I4
f("I4 V4+V8 tegelijk, V4 gestopt op A-dag", {
  AB:["G3","O1","V4","|","N1","V8",V6a,"|","B2>V4","O2","G1","|","Ev1",B3s,V6l,"|","N3"],
  BA:["G3","O1","V4","|","N1","V8",V6a,"|","B2>V4",B3s,V6l,"|","N3","Ev1","O2"] }, ["I4"]);
// I5
f("I5 V3 ipv V4", { AB:["G3","O1","V3","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V3","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I5"]);
// I6
f("I6 V4 voor O1 (geen kweek)", { AB:["G3","V4","O1","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3"], BA:["G3","V4","O1","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I6"], V.I6a);
f("I6 V1 afwachten erbij", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3","V1"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1","V1"] }, ["I6"], V.I6b);
f("I6 V2 uitgesteld recept erbij", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3","V2"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1","V2"] }, ["I6"], V.I6b);
f("I6 geen O1 helemaal (V4 zonder kweek), zonder A-wissel", { AB:["G3","G1","V4","|","N1","O2",E2s,"|","B2>V4","Ev3","G1","|","Ev1",B3s,V6l,"|","N3"], BA:["G3","G1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","B2>V4","Ev3","Ev1"] }, ["I6"], V.I6a);
// I7 (V5-route)
const V5AB=["G3","O1","V5","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3",H];
const V5BA=["G3","O1","V5","|","N1","O2","|","B1>V8",V6a,B3s,"|",V6l,"N3","Ev1","|",H];
f("I7 geen O2", { AB:V5AB.map(t=>t==="O2"?E2s:t), BA:V5BA.map(t=>t==="O2"?E2s:t) }, ["I7"], V.I7a);
f("I7 geen halveren", { AB:V5AB.map(t=>t===H?"G1":t), BA:V5BA.map(t=>t===H?"G1":t) }, ["I7"], V.I7b);
f("I7 verdubbelen ipv halveren", { AB:V5AB.map(t=>t===H?"V6>V5>verdubbelen":t), BA:V5BA.map(t=>t===H?"V6>V5>verdubbelen":t) }, ["I7"], V.I7b);
f("I7 interval 48 uur ipv halveren", { AB:V5AB.map(t=>t===H?"V6>V5>interval 48 uur":t), BA:V5BA.map(t=>t===H?"V6>V5>interval 48 uur":t) }, ["I7"], V.I7b);
f("I7 geen O2 en geen halveren (vraag O2-variant)", { AB:V5AB.map(t=>t==="O2"?E2s:t===H?"G1":t), BA:V5BA.map(t=>t==="O2"?E2s:t===H?"G1":t) }, ["I7"], V.I7a);
// I8
f("I8 V5 blijft na C (klachten houden aan)", {
  AB:["G3","O1","V5","|","N1","O2",E2s,"|","Ev3","G1","G1","|","Ev1",B3s,V6l,"|","N3",H],
  BA:["G3","O1","V5","|","N1","O2","|",B3s,V6l,"N3","|","Ev1","Ev3","G1","|",H] }, ["I8"]);
// I9
f("I9 geen O2 en geen Ev2", { AB:["G3","O1","V4","|","N1","G1","G1","|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","G1","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I9"]);
f("I9 B5 zonder Ev2 (O2 wel)", { AB:["G3","O1","V4","|","N1","O2","G1","|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3","B5>spironolacton"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1","B5>spironolacton"] }, ["I9"]);
f("I9 Ev2 pas NA B5", { AB:["G3","O1","V4","|","N1","O2","G1","|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3","B5>spironolacton",E2s], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1","B5>spironolacton",E2s] }, ["I9"]);
f("I9 Ev2 op lisinopril telt niet (geen O2)", { AB:["G3","O1","V4","|","N1","G1","Ev2>lisinopril","|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","Ev2>lisinopril","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I9"]);
// I10
f("I10 V4 blijft actief", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","Ev3","G1","G1","|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","Ev3","G1","G1","|","Ev1"] }, ["I10"]);
f("I10 wissel een dag te laat", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","G1","G1","|","B1>V8",V6a,"Ev1","|",B3s,V6l,"N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","G1","G1","|","B1>V8",V6a,"Ev1"] }, ["I10"]);
// I11
f("I11 wissel zonder O1 na A", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","G1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","G1","B1>V8",V6a,"|","Ev1"] }, ["I11"]);
f("I11 O1 pas na de wissel", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","B1>V8",V6a,"O1","|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","B1>V8",V6a,"O1","|","Ev1"] }, ["I11"]);
// I12
f("I12 cotrimoxazol als wissel", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V9","G1","|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V9","G1","|","Ev1"] }, ["I12"]);
// I13
f("I13 V8 zonder V6", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8","G1","|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8","G1","|","Ev1"] }, ["I13"]);
f("I13 V6 500/125 2 dd", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8","V6>V8>500/125 mg 2 dd","|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8","V6>V8>500/125 mg 2 dd","|","Ev1"] }, ["I13"]);
f("I13 V6 500/125 1 dd", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8","V6>V8>500/125 mg 1 dd","|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8","V6>V8>500/125 mg 1 dd","|","Ev1"] }, ["I13"]);
f("I13 V6 875/125 pas de dag erna", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8","G1","|","Ev1",V6a,B3s,"|",V6l,"N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8","G1","|","Ev1",V6a] }, ["I13"]);
// I14
const C3AB=["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V7","Ev3","|","Ev1",B3s,V6l,"|","N3"];
const C3BA=["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V7","Ev3","|","Ev1"];
f("I14 cipro zonder B4/B3", { AB:C3AB, BA:C3BA }, ["I14"]);
f("I14 B4 twee dagen te laat", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V7","Ev3","|","Ev1",B3s,V6l,"|","N3","B4>V7"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V7","Ev3","|","Ev1","|","B4>V7"] }, ["I14"]);
// I15
f("I15 geen B3 spironolacton", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1","G1",V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|","G1",V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I15"]);
f("I15 B3 op lisinopril ipv spironolacton (V6 dan onmogelijk)", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1","B3>lisinopril","G1","|","N3"], BA:["G3","O1","V4","|","N1","|","B3>lisinopril","G1","|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I15"]);
f("I15 geen V6 lisinopril", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,"G1","|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,"G1","|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I15"]);
f("I15 lisinopril stoppen ipv halveren", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,"V6>lisinopril>stoppen","|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,"V6>lisinopril>stoppen","|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I15"]);
f("I15 lisinopril verdubbelen ipv halveren", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,"V6>lisinopril>verdubbelen","|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,"V6>lisinopril>verdubbelen","|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I15"]);
f("I15 geen N3", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","G1"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","G1","Ev1","O2","|","O1","B1>V8",V6a,"|","Ev1"] }, ["I15"]);
f("I15 Ev1 in A-venster maar buiten B-venster", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","B2>V4","Ev3","Ev1","|",B3s,V6l,"N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","G1","O2","|","B2>V4","Ev3","Ev1"] }, ["I15"]);
// I16
f("I16 Ev1 alleen in B-venster", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|",B3s,V6l,"N3","|","Ev1"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","O1","B1>V8",V6a,"|","G1"] }, ["I16"]);
f("I16 48 uur geen verbetering zonder Ev3", { AB:["G3","O1","V4","|","N1","O2",E2s,"|","B2>V4","G1","G1","|","Ev1",B3s,V6l,"|","N3"], BA:["G3","O1","V4","|","N1","|",B3s,V6l,"|","N3","Ev1","O2","|","B2>V4","Ev1","|","|"] }, ["I16"]);
module.exports={F};
if (require.main===module) {
  let bad=0, n=0;
  for (const r of F.filter(r=>r.steps)) {
    n++; let res; try { res=play(r.order,r.steps);} catch(e){ console.log("CRASH",r.id,e.message); bad++; continue; }
    const s=samenvat(res), u=res.u, ids=u.geschonden.map(g=>g.id);
    const p=[]; if (JSON.stringify(ids)!==JSON.stringify(r.ids)) p.push("geschonden "+JSON.stringify(ids));
    if (u.vraag!==r.vraag) p.push("vraag "+u.vraag);
    if (u.score!==null||u.profiel!==null) p.push("score/profiel niet null");
    console.log((p.length?"ROOD ":"ok   ")+r.id+" "+JSON.stringify(s.geb)+(p.length?" :: "+p.join(" | "):"")); if(p.length) bad++;
  }
  console.log(bad+" rood van "+n);
}

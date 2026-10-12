const L=require("./load.js"); L.laad(); const {play}=require("./speel.js"); const {V,V6a,V6l,B3s,E2s}=require("./routes.js");
const AB=["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V8",V6a,"|","Ev1",B3s,V6l,"|","N3"];
const sub=(plan,m)=>plan.map(t=>m[t]!==undefined?m[t]:t);
const cases=[
 ["I1+I6 -> I6", sub(AB,{N1:"G1"}).map((t,i)=>i===1?"V4":(i===2?"O1":t)), ["I6","I1"]],
 ["I9+I13 (gelijk 3) -> I9 eerst", sub(AB,{O2:"G1",[E2s]:"G1",[V6a]:"G1"}), ["I9","I13"]],
 ["I13+I14", ["G3","O1","V4","|","N1","O2",E2s,"|","O1","B1>V7","Ev3","|","Ev1",B3s,V6l,"|","N3"], ["I14"]],
 ["I12 + I5 -> I12 (ernst 1)", ["G3","O1","V3","|","N1","O2",E2s,"|","O1","B1>V9","G1","|","Ev1",B3s,V6l,"|","N3"], ["I12","I5"]],
 ["I10+I11+I16", ["G3","O1","V4","|","N1","O2",E2s,"|","G1","G1","G1","|",B3s,V6l,"N3","|","|"], ["I10","I16","I15"]],
];
for (const [n,plan,exp] of cases){ const r=play("AB",plan); const g=r.u.geschonden.map(x=>x.id); console.log(n,"->",JSON.stringify(g),"vraag:",r.u.vraag.slice(0,40),"ernst",r.u.geschonden.map(x=>x.ernst).join(",")); }

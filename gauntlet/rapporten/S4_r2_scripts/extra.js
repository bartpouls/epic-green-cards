const {runPlan,samenvat,W,gd}=require("./bot.js"); const G=require("./geldig.js"); const {en}=W; const {had,naEv,sickday,O2,EV2,nieuweKweek,evA}=G;
const rij=(naam,plan,tot)=>{ for(const v of ["AB","BA"]){ const o=samenvat(runPlan(plan,v,{tot})); console.log(v,naam,"| geschonden",o.geschonden.join(",")||"-","| score",JSON.stringify(o.score),"| profiel",o.profiel,"| extra",o.extra,"| rest",o.rest.join(",")); } };
// V8 direct (cystitis) met V6 dezelfde dag, daarna A: al werkzaam
rij("V8 direct start",[["G3"],["O1"],["V8"],["V6","V8","875/125 mg 2 dd"],["N1"],evA,...sickday(),O2,EV2]);
rij("cipro direct + B3(calcium)",[["G3"],["O1"],["V7"],["B3","calcium"],["N1"],nieuweKweek,evA,...sickday(),O2,EV2]);
rij("zonder G3 (amox)",[["O1"],["V4"],["N1"],["G1"],nieuweKweek,["B1","V8",null,en(W.A,st=>naEv(st,"O1","A"))],["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")],evA,...sickday(),O2,EV2]);
rij("G3 ná V-kaart (amox)",[["O1"],["V4"],["G3"],["N1"],nieuweKweek,["B1","V8",null,en(W.A,st=>naEv(st,"O1","A"))],["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")],evA,...sickday(),O2,EV2]);
rij("alleen Ev2 (geen O2) valide",[["G3"],["O1"],["V4"],["N1"],nieuweKweek,["B1","V8",null,en(W.A,st=>naEv(st,"O1","A"))],["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")],evA,...sickday(),EV2]);
rij("alleen O2 (geen Ev2) valide",[["G3"],["O1"],["V4"],["N1"],nieuweKweek,["B1","V8",null,en(W.A,st=>naEv(st,"O1","A"))],["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")],evA,...sickday(),O2]);
rij("V5 na G3 + I7-proof, weg bij C",[["G3"],["O1"],["V5"],["N1"],G.nieuweKweek],7);
rij("V7 -> V8 vóór C (score)",[["O1",null,null],["V7"],["B4","V7"],["N1"],["O2"],["B1","V8"],["V6","V8","875/125 mg 2 dd"]],2);

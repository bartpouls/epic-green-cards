const {S,verschil}=require("./scen.js");const sc=require("./scen.js");
const T=true,F=false;
// ---- I1
S("E1 V3 zonder N1","E1","I1",[["V3",1]],[],{},T);
S("E1 V3+N1","E1","I1",[["V3",1],["N1",1]],[],{},F);
S("E1 niets gespeeld","E1","I1",[],[],{},F);
S("E1 alleen G1","E1","I1",[["G1",1]],[],{},F);
S("E1 V1 zonder N1","E1","I1",[["V1",1],["Ev1",1]],[],{},T);
S("E1 V2+N1 (N1 later)","E1","I1",[["V2",1],["N1",2]],[],{},F);
S("E1 N1 zonder route","E1","I1",[["N1",1]],[],{},F);
S("E3 V7 zonder N1","E3","I1",[["V7",1]],[],{},T);
S("E3 V8 + N1","E3","I1",[["V8",1],["N1",1]],[],{},F);
S("E2 V6 alleen (geen route)","E2","I1",[["V6",1]],[],{},F,"V6 is geen routekaart? mijn lijst bevat V6 niet");
// ---- I4
S("E1 V3 dan V4","E1","I4",[["V3",1],["V4",1]],[],{},T);
S("E1 V3 dan B1->V4","E1","I4",[["V3",1],["B1",2,"V4"]],[],{},F);
S("E1 V3 dan B2 V3 dan V4","E1","I4",[["V3",1],["B2",2,"V3"],["V4",2]],[],{},F);
S("E1 V3 B2 V4 (stop andere)","E1","I4",[["V3",1],["B2",1,"V4"],["V4",1]],[],{},T,"B2 stopt V4 dat niet actief is; V3 blijft, V4 start");
S("E3 V8 en V7 dezelfde dag","E3","I4",[["V8",1],["V7",1]],[],{},T);
S("E3 V7 B1->V8 B1->V7","E3","I4",[["V7",1],["B1",2,"V8"],["B1",3,"V7"]],[],{},F);
S("E3 V7 + O1 + V8 (volg)","E3","I4",[["V7",1],["O1",1],["V8",2]],[],{},T);
S("E1 V1 en V3","E1","I4",[["V1",1],["V3",1]],[],{},F);
S("E1 V3 twee keer","E1","I4",[["V3",1],["V3",2]],[],{},F);
// ---- I5
S("E2 V3 bij eGFR 29","E2","I5",[["V3",1]],[],{},T);
S("E2 V4","E2","I5",[["V4",1]],[],{},F);
S("E2 V4 dan B1->V3","E2","I5",[["V4",1],["B1",2,"V3"]],[],{},T);
S("E2 V3 dan B1->V4 (alsnog gestart)","E2","I5",[["V3",1],["B1",2,"V4"]],[],{},T);
S("E3 V3","E3","I5",[["V3",1]],[],{},T);
S("E3 B1 doel V3","E3","I5",[["V7",1],["B1",2,"V3"]],[],{},T);
S("E3 B1 doel V4","E3","I5",[["V7",1],["B1",2,"V4"]],[],{},F);
// ---- I6
S("E2 V4 zonder O1","E2","I6",[["V4",1]],[],{},T);
S("E2 O1 dan V4","E2","I6",[["O1",1],["V4",1]],[],{},F);
S("E2 V4 dan O1","E2","I6",[["V4",1],["O1",1]],[],{},T);
S("E2 V1","E2","I6",[["V1",1]],[],{},T);
S("E2 V2 na O1","E2","I6",[["O1",1],["V2",1]],[],{},T);
S("E2 niets","E2","I6",[],[],{},F);
S("E2 G2 O1 V5","E2","I6",[["G2",1],["O1",1],["V5",1]],[],{},F);
S("E3 V4 zonder O1","E3","I6",[["V4",1]],[],{},T);
S("E3 O1 V4","E3","I6",[["O1",1],["V4",1]],[],{},F);
S("E3 B1->V8 zonder V-kaart","E3","I6",[["B1",1,"V8"]],[],{},F,"B1 zonder V-kaart is geen 'antibioticumkaart' (engine laat dit niet toe zonder lopend middel)");
S("E3 V4 O1 zelfde dag volg V4 eerst","E3","I6",[["V4",1],["O1",1]],[],{},T);
S("E1 V3 zonder O1 (niet risicogroep)","E1","I6",[["V3",1]],[],{},F,"E1 heeft geen I6; waar risicogroep=false");
// ---- I7
const base7=[["O1",1],["V5",1]];
S("E2 V5 geen O2 geen V6","E2","I7",base7,[],{},T);
S("E2 V5 d1, O2 d2, V6 halveren d4","E2","I7",base7.concat([["O2",2],["V6",4,"V5","halveren"]]),[],{},F);
S("E2 V5 d1, O2 d2, V6 halveren d3 (nog te vroeg)","E2","I7",base7.concat([["O2",2],["V6",3,"V5","halveren"]]),[],{},T,"TODO-1: cursusdag 4 = verschil 3; d3 = verschil 2");
S("E2 V5 d1, O2 d1 (te vroeg)","E2","I7",base7.concat([["O2",1],["V6",4,"V5","halveren"]]),[],{},T);
S("E2 V5 d1, O2 d4 (rand), V6 d4","E2","I7",base7.concat([["O2",4],["V6",4,"V5","halveren"]]),[],{},F,"verschil 3 = rand van 1-3");
S("E2 V5 d1, O2 d5 (te laat)","E2","I7",base7.concat([["O2",5],["V6",4,"V5","halveren"]]),[],{},T);
S("E2 V6 verdubbelen","E2","I7",base7.concat([["O2",2],["V6",4,"V5","verdubbelen"]]),[],{},T);
S("E2 V6 op ander doel","E2","I7",base7.concat([["O2",2],["V6",4,"lisinopril","halveren"]]),[],{},T);
S("E2 V4 geen V5","E2","I7",[["O1",1],["V4",1]],[],{},F);
S("E2 V5 via B1 d2, O2 d3, V6 d5","E2","I7",[["O1",1],["V4",1],["B1",2,"V5"],["O2",3],["V6",5,"V5","halveren"]],[],{},F);
S("E2 V6 halveren op dag 8 (late)","E2","I7",base7.concat([["O2",2],["V6",8,"V5","halveren"]]),[],{},F,"vanaf-dag: geen bovengrens");
// ---- I8 (E2)  C op dag 4
const gC=[["C",4]];
S("E2 V5 actief, klachten aan, geen wissel","E2","I8",[["O1",1],["V5",1],["N1",1]],gC,{4:"aan",5:"aan"},T);
S("E2 V5 actief, wissel B1 dag 4","E2","I8",[["O1",1],["V5",1],["B1",4,"V4"]],gC,{4:"aan",5:"aan"},F);
S("E2 V5, wissel dag 5 (2e beurt)","E2","I8",[["O1",1],["V5",1],["B1",5,"V4"]],gC,{4:"aan",5:"aan"},F);
S("E2 V5, wissel dag 6 (te laat)","E2","I8",[["O1",1],["V5",1],["B1",6,"V4"]],gC,{4:"aan",5:"aan"},T,"binnen 2 beurten = dag 4,5");
S("E2 V5, B2 stoppen d4","E2","I8",[["O1",1],["V5",1],["B2",4,"V5"]],gC,{4:"aan"},F);
S("E2 V4 actief (gevoelig), klachten af","E2","I8",[["O1",1],["V4",1]],gC,{4:"af"},F);
S("E2 geen C","E2","I8",[["O1",1],["V5",1]],[],{4:"aan"},F);
S("E2 V5 klachten af (maar resistent)","E2","I8",[["O1",1],["V5",1]],gC,{4:"af"},F);
S("E2 V5, wissel VOOR C (d3), C d4","E2","I8",[["O1",1],["V5",1],["B1",3,"V4"]],gC,{4:"af"},F);
// ---- I9 (E3)
S("E3 niets","E3","I9",[],[],{},T);
S("E3 O2 alleen","E3","I9",[["O2",1]],[],{},F,"casus-lezing: schending alleen als BEIDE ontbreken (TODO-2)");
S("E3 Ev2 sp alleen","E3","I9",[["Ev2",1,"spironolacton"]],[],{},F);
S("E3 Ev2 lisinopril alleen (verkeerd doel)","E3","I9",[["Ev2",1,"lisinopril"]],[],{},T);
S("E3 O2 + B5 sp zonder Ev2","E3","I9",[["O2",1],["B5",3,"spironolacton"]],[],{},T);
S("E3 Ev2 sp dan B5 sp","E3","I9",[["O2",1],["Ev2",2,"spironolacton"],["B5",3,"spironolacton"]],[],{},F);
S("E3 B5 sp dan Ev2 sp (omgekeerd)","E3","I9",[["O2",1],["B5",2,"spironolacton"],["Ev2",3,"spironolacton"]],[],{},T);
S("E3 B5 lisinopril ok","E3","I9",[["O2",1],["B5",2,"lisinopril"]],[],{},F);
S("E3 O2 + Ev2 + B5 zelfde dag volg ok","E3","I9",[["O2",1],["Ev2",2,"spironolacton"],["B5",2,"spironolacton"]],[],{},F);
// ---- I10 (E3) A dag 3
const gA=[["A",3]];
S("E3 V4 actief na A (d3)","E3","I10",[["O1",1],["V4",1]],gA,{},T);
S("E3 V3 actief na A","E3","I10",[["V3",1]],gA,{},T);
S("E3 V4 dan B1->V8 op d3","E3","I10",[["V4",1],["B1",3,"V8"]],gA,{},F);
S("E3 V4 dan B1->V8 op d4","E3","I10",[["V4",1],["B1",4,"V8"]],gA,{},T,"offset 0: einde van beurt dA");
S("E3 V4 dan B2 op d3","E3","I10",[["V4",1],["B2",3,"V4"]],gA,{},F);
S("E3 V4 geen A","E3","I10",[["V4",1]],[],{},F);
S("E3 V8 na A","E3","I10",[["V8",3]],gA,{},F);
S("E3 V4 gestart op d3 (na A)","E3","I10",[["V4",3]],gA,{},T);
// ---- I11
S("E3 B1 na A zonder O1","E3","I11",[["V4",1],["B1",3,"V8"]],gA,{},T);
S("E3 O1 na A dan B1","E3","I11",[["V4",1],["O1",3],["B1",3,"V8"]],gA,{},F);
S("E3 O1 voor A, B1 na A","E3","I11",[["O1",1],["V4",1],["B1",3,"V8"]],gA,{},T,"O1 moet TUSSEN A en wissel");
S("E3 B1 dan O1 (na A)","E3","I11",[["V4",1],["B1",3,"V8"],["O1",3]],gA,{},T);
S("E3 geen wissel na A","E3","I11",[["O1",1],["V4",1]],gA,{},F);
S("E3 nieuwe V-kaart na A zonder O1","E3","I11",[["V4",1],["V8",3]],gA,{},T);
S("E3 nieuwe V-kaart na A met O1","E3","I11",[["V4",1],["O1",3],["V8",3]],gA,{},F);
S("E3 geen A","E3","I11",[["V4",1],["B1",3,"V8"]],[],{},F);
// ---- I12
S("E3 V9","E3","I12",[["V9",2]],[],{},T);
S("E3 B1->V9 (geen V9-kaart)","E3","I12",[["V4",1],["B1",2,"V9"]],[],{},F,"mijn lezing: kaart V9 gespeeld; data: gestart(V9)");
S("E3 geen V9","E3","I12",[["V8",2]],[],{},F);
// ---- I13
S("E3 V8 zonder V6","E3","I13",[["V8",1]],[],{},T);
S("E3 V8 + V6 875 zelfde dag","E3","I13",[["V8",1],["V6",1,"V8","875/125 mg 2 dd"]],[],{},F);
S("E3 V6 875 voor V8 zelfde dag","E3","I13",[["V6",1,"V8","875/125 mg 2 dd"],["V8",1]],[],{},F);
S("E3 V8 d1 V6 d2","E3","I13",[["V8",1],["V6",2,"V8","875/125 mg 2 dd"]],[],{},T);
S("E3 V8 + V6 verkeerde optie","E3","I13",[["V8",1],["V6",1,"V8","500/125 mg 2 dd"]],[],{},T);
S("E3 V8 via B1 + V6 zelfde dag","E3","I13",[["V4",1],["B1",2,"V8"],["V6",2,"V8","875/125 mg 2 dd"]],[],{},F);
S("E3 geen V8","E3","I13",[["V4",1]],[],{},F);
S("E3 V8 dan wissel naar V7 zonder V6","E3","I13",[["V8",1],["B1",2,"V7"]],[],{},T,"mijn lezing: V8 niet meer actief aan eind -> geen schending; data: gestart V8 -> schending");
// ---- I14
S("E3 V7 zonder B4/B3","E3","I14",[["V7",1]],[],{},T);
S("E3 V7 + B4 zelfde dag","E3","I14",[["V7",1],["B4",1,"V7"]],[],{},F);
S("E3 V7 d1, B4 d2","E3","I14",[["V7",1],["B4",2,"V7"]],[],{},F);
S("E3 V7 d1, B4 d3","E3","I14",[["V7",1],["B4",3,"V7"]],[],{},T);
S("E3 V7 + B3 calcium zelfde dag","E3","I14",[["V7",1],["B3",1,"calcium"]],[],{},F);
S("E3 V7 + B3 spironolacton (verkeerd doel)","E3","I14",[["V7",1],["B3",1,"spironolacton"]],[],{},T);
S("E3 B4 voor V7 zelfde dag","E3","I14",[["B4",1,"V7"],["V7",1]],[],{},F);
S("E3 B4 d1 voor V7 d2","E3","I14",[["B4",1,"V7"],["V7",2]],[],{},T,"B4 eerder dan V7: binnenBeurtenNaKaart telt dag>=anker");
S("E3 V8 geen V7","E3","I14",[["V8",1]],[],{},F);
S("E3 V7 via B1","E3","I14",[["V4",1],["B1",2,"V7"]],[],{},T);
// ---- I15 B op dag 5
const gB=[["B",5]];
const all4=[["B3",5,"spironolacton"],["V6",5,"lisinopril","halveren"],["N3",5],["Ev1",6]];
S("E3 alle vier binnen 2","E3","I15",all4,gB,{},F);
S("E3 een ontbreekt (N3)","E3","I15",all4.filter(r=>r[0]!=="N3"),gB,{},T);
S("E3 een ontbreekt (Ev1)","E3","I15",all4.filter(r=>r[0]!=="Ev1"),gB,{},T);
S("E3 een te laat (Ev1 d7)","E3","I15",all4.slice(0,3).concat([["Ev1",7]]),gB,{},T);
S("E3 V6 verkeerde optie","E3","I15",[["B3",5,"spironolacton"],["V6",5,"lisinopril","stoppen"],["N3",5],["Ev1",6]],gB,{},T);
S("E3 B3 op lisinopril ipv spironolacton","E3","I15",[["B3",5,"lisinopril"],["V6",5,"lisinopril","halveren"],["N3",5],["Ev1",6]],gB,{},T);
S("E3 geen B","E3","I15",[],[],{},F);
S("E3 niets na B","E3","I15",[],gB,{},T);
S("E3 alles dag 6 (rand n=2)","E3","I15",all4.map(r=>[r[0],6,r[2],r[3]]),gB,{},F);
S("E3 B3 vóór B (dag 4)","E3","I15",[["B3",4,"spironolacton"],["V6",5,"lisinopril","halveren"],["N3",5],["Ev1",6]],gB,{},T);
// ---- I16 A dag 3
S("E3 Ev1 d3","E3","I16",[["Ev1",3]],gA,{},F);
S("E3 Ev1 d4 (rand)","E3","I16",[["Ev1",4]],gA,{},F);
S("E3 Ev1 d5 (te laat)","E3","I16",[["Ev1",5]],gA,{},T);
S("E3 geen Ev1","E3","I16",[],gA,{},T);
S("E3 Ev1 + geenVerbetering48 zonder Ev3","E3","I16",[["Ev1",3]],gA,{5:"geenVerbetering48"},T);
S("E3 Ev1 + geenVerbetering48 met Ev3","E3","I16",[["Ev1",3],["Ev3",5]],gA,{5:"geenVerbetering48"},F);
S("E3 geen A, geen Ev1","E3","I16",[],[],{},F);
S("E3 Ev1 vóór A","E3","I16",[["Ev1",2]],gA,{},T);
console.log("scenario's:",sc.n,"rood tov eigen verwachting:",sc.rood);
console.log("verschillen data-predicaat vs eigen predicaat:",verschil.length);verschil.forEach(v=>console.log(" ",v.join(" | ")));

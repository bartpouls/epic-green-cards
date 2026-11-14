// Routes van de criticus (ronde 4): expliciete plannen per A/B-volgorde. Notatie "KAART" | "KAART:doel" | "KAART:doel:optie".
const SP="spironolacton",LIS="lisinopril",V6A="V6:V8:875/125 mg 2 dd",V6L="V6:lisinopril:halveren",V6H="V6:V5:halveren";
// Basisplannen. AB: A na kaart 4, B na kaart 7. BA: omgekeerd.
const BASE={
 AB:[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8",V6A],["Ev1","B3:"+SP,V6L],["N3"]],
 BA:[["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B1:V8",V6A],["Ev1","O2"]]
};
function kopie(x){return JSON.parse(JSON.stringify(x));}
// vervang de eerste voorkomende 'oud' (kaartstring) door 'nieuw' in plan
function ruil(plan,oud,nieuw,alle){ const p=kopie(plan); let n=0; p.forEach(d=>d.forEach((k,i)=>{ if(k===oud&&(alle||n===0)){d[i]=nieuw;n++;} })); if(!n)throw new Error("ruil: "+oud+" niet gevonden in "+JSON.stringify(plan)); return p; }
function ruilDag(plan,dag,oud,nieuw){ const p=kopie(plan); const i=p[dag-1].indexOf(oud); if(i<0)throw new Error("ruilDag: "+oud+" d"+dag); p[dag-1][i]=nieuw; return p; }
function zet(plan,dag,kaarten){ const p=kopie(plan); while(p.length<dag)p.push([]); p[dag-1]=kaarten; return p; }
function voeg(plan,dag,kaarten){ const p=kopie(plan); while(p.length<dag)p.push([]); p[dag-1]=p[dag-1].concat(kaarten); return p; }
const R=[]; // {id, soort, plan:{AB,BA}, claim:{ids:[...], profiel, dur, doel, extra, i6v, i7v, vraagId}}
function add(id,soort,planAB,planBA,claim){ R.push({id,soort,plan:{AB:planAB,BA:planBA},claim}); }
const G={ids:[],profiel:"Kweekgestuurd",dur:3,doel:3};
// ---------- GELDIGE ROUTES ----------
add("V1 fosfomycine > A: O1,B1->V8,V6 875/125 (Kweekgestuurd 3/3)","geldig",BASE.AB,BASE.BA,G);
// V2: A: cipro + B4
const AB_B4=zet(BASE.AB,3,["O1","B1:V7","B4:V7"]), BA_B4=zet(BASE.BA,5,["O1","B1:V7","B4:V7"]);
add("V2 A: cipro + B4, blijft (Richtlijn eerste keus 2/3)","geldig",AB_B4,BA_B4,{ids:[],profiel:"Richtlijn eerste keus",dur:2,doel:3,extra:["dosis"]});
// V3: A: cipro + B3 op calcium
const AB_B3=zet(BASE.AB,3,["O1","B1:V7","B3:calcium"]), BA_B3=zet(BASE.BA,5,["O1","B1:V7","B3:calcium"]);
add("V3 A: cipro + B3 calcium, blijft (Richtlijn eerste keus 2/3)","geldig",AB_B3,BA_B3,{ids:[],profiel:"Richtlijn eerste keus",dur:2,doel:3,extra:["dosis"]});
// V4: cipro+B4, daarna de-escalatie naar V8 (na C)
const AB_DE=voeg(zet(BASE.AB,5,["B1:V8",V6A,"N3"]),6,[]);
add("V4 cipro+B4, de-escalatie naar V8 na C (3/3 Kweekgestuurd)","geldig",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7","B4:V7"],["Ev1","B3:"+SP,V6L],["N3"],["B1:V8",V6A]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B1:V7","B4:V7"],["Ev1","O2"],["B1:V8",V6A]],
  {ids:[],profiel:"Kweekgestuurd",dur:3,doel:3,extra:["dosis"]});
// V5: verwijzen: A: O1, stop fosfomycine, Ev1; later Ev3
add("V5 A: stop V4, geen werkzaam antibioticum; Ev1 + Ev3 (verwijzen)","geldig",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B2:V4","Ev1"],["B3:"+SP,V6L,"N3"],["Ev1","Ev3"]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B2:V4","Ev1"],["O2","Ev3"]],
  {ids:[],profiel:null,dur:null,doel:3});
// V6: hervatten na overleg (B5 na Ev2)
add("V6 als V1 + B5 op spironolacton na Ev2 (Automatische herstart)","geldig",voeg(BASE.AB,6,["B5:"+SP]),voeg(BASE.BA,7,["B5:"+SP]),{ids:[],profiel:"Kweekgestuurd",dur:3,doel:3,extra:["herstart"]});
// V7: vroeg afronden, vóór de banner (TODO: ontlopen)
add("V7 vroeg afronden direct na 6 kaarten (banner nog niet verschenen)","geldig",[["G3","O1","V4"],["N1","O2","Ev2:"+SP]],[["G3","O1","V4"],["N1","O2","Ev2:"+SP]],{ids:[],profiel:null,dur:null,doel:3,vroeg:true});
// V8: G3 na de eerste V-kaart -> doelmatigheid 2, poort wel gehaald
add("V8 als V1 maar G3 pas na V4 (doelmatigheid 2)","geldig",ruilDag(ruilDag(BASE.AB,1,"G3","O1"),1,"O1","G3").map((d,i)=>i===0?["O1","V4","G3"]:d),BASE.BA.map((d,i)=>i===0?["O1","V4","G3"]:d),{ids:[],profiel:"Kweekgestuurd",dur:3,doel:2});
// V9: V8 direct bij cystitis-start (nitrofurantoine niet): G3,O1,V8+V6 ; A-respons: Ev1 en niets wisselen
add("V9 start met V8+V6 875/125, geen wissel nodig (Kweekgestuurd)","geldig",
  [["G3","O1","N1"],["V8",V6A,"O2"],["Ev1","Ev2:"+SP,"G1"],["B3:"+SP,V6L,"N3"],["Ev1"]],
  [["G3","O1","N1"],["V8",V6A,"O2"],["B3:"+SP,V6L,"N3"],["Ev1","Ev2:"+SP]],
  {ids:[],profiel:"Kweekgestuurd",dur:3,doel:3});
// ---------- FOUTROUTES: precies één invariant ----------
const AB=BASE.AB, BA=BASE.BA;
add("I1 geen N1","fout",ruil(AB,"N1","G1"),ruil(BA,"N1","G1"),{ids:["I1"]});
// I4: V7+B4 naast V4, daarna V4 gestopt (vóór A zichtbaar)
add("I4 twee antibiotica tegelijk (V7 naast V4, daarna B2 op V4)","fout",
  [["G3","O1","V4"],["V7","B4:V7","B2:V4"],["N1","O2","Ev2:"+SP],["Ev1","B3:"+SP,V6L],["N3"]],
  [["G3","O1","V4"],["V7","B4:V7","B2:V4"],["B3:"+SP,V6L,"N1"],["N3","Ev1","O2"],["Ev2:"+SP]],{ids:["I4"]});
add("I5 nitrofurantoine (V3) gestart bij eGFR 28","fout",ruil(AB,"V4","V3"),ruil(BA,"V4","V3"),{ids:["I5"]});
add("I6 (geen kweek) V4 voor O1","fout",ruilDag(ruilDag(AB,1,"O1","V4"),1,"V4","V4").map((d,i)=>i===0?["G3","V4","O1"]:d),BA.map((d,i)=>i===0?["G3","V4","O1"]:d),{ids:["I6"],i6v:0});
add("I6 (afwachten) V1 gespeeld","fout",voeg(AB,6,["V1"]),voeg(BA,7,["V1"]),{ids:["I6"],i6v:1});
add("I6 (afwachten) V2 gespeeld","fout",voeg(AB,6,["V2"]),voeg(BA,7,["V2"]),{ids:["I6"],i6v:1});
// I7: V5 als startmiddel. A-respons B1->V8 (V5 weg voor I8).
const ABv5=ruil(AB,"V4","V5"), BAv5=ruil(BA,"V4","V5");
add("I7 (geen O2 in venster; O2 op d5, wel halveren d4)","fout",
  [["G3","O1","V5"],["N1","G1","Ev2:"+SP],["O1","B1:V8",V6A],["Ev1","B3:"+SP,V6L],["N3","O2",H()]],
  [["G3","O1","V5"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B1:V8",V6A],["Ev1",H(),"O2"]].map(d=>d.map(x=>x==="O2"?"O2":x)),{ids:["I7"],i7v:0});
function H(){return V6H;}
add("I7 (O2 wel op verschil 1, nooit halveren)","fout",
  [["G3","O1","V5"],["N1","O2","Ev2:"+SP],["O1","B1:V8",V6A],["Ev1","B3:"+SP,V6L],["N3"]],
  [["G3","O1","V5"],["N1"],["B3:"+SP,V6L],["N3","Ev1","O2"],["O1","B1:V8",V6A],["Ev1","Ev2:"+SP]],{ids:["I7"],i7v:1});
add("I7 (halveren te vroeg: verschil 2)","fout",
  [["G3","O1","V5"],["N1","O2","Ev2:"+SP],["O1","B1:V8",V6A],["Ev1","B3:"+SP,V6L],["N3"]].map((d,i)=>i===1?["N1","O2",H()]:i===2?["O1","B1:V8",V6A]:d).map((d,i)=>i===1?["N1","O2",H()]:d),
  [["G3","O1","V5"],["N1","O2"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B1:V8",V6A],["Ev1"]].map((d,i)=>i===2?["B3:"+SP,V6L]:d),{ids:["I7"],i7v:1,skipBA:true});
// I8: V5 blijft actief na C (klachten aan). Geen wissel; Ev1 + Ev3.
add("I8 V5 blijft na C actief, klachten aan (Ev1+Ev3 sluit I16 uit)","fout",
  [["G3","O1","V5"],["N1","O2","Ev2:"+SP],["Ev1","Ev3","G1"],["B3:"+SP,V6L,"N3"],["Ev1",H()]],
  [["G3","O1","V5"],["N1","O2"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["Ev1","Ev3",H()]],{ids:["I8"]});
add("I9 geen O2 en geen Ev2","fout",ruil(ruil(AB,"O2","G1"),"Ev2:"+SP,"G1"),ruil(ruil(BA,"O2","G1"),"Ev2:"+SP,"G1"),{ids:["I9"],zicht:["i9"]});
add("I9 B5 op spironolacton zonder eerdere Ev2 (O2 wel)","fout",voeg(ruil(AB,"Ev2:"+SP,"G1"),6,["B5:"+SP]),voeg(ruil(BA,"Ev2:"+SP,"G1"),7,["B5:"+SP]),{ids:["I9"],zicht:["i9"],extra:["herstart"]});
add("I9 B5 vóór Ev2 (Ev2 later)","fout",
  [["G3","O1","V4"],["N1","O2","G1"],["O1","B1:V8",V6A],["Ev1","B3:"+SP,V6L],["N3","B5:"+SP,"Ev2:"+SP]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","B5:"+SP],["O1","B1:V8",V6A],["Ev1","Ev2:"+SP]].map(d=>d),{ids:["I9"],zicht:["i9"],extra:["herstart"]});
// I10: V4 blijft actief na A; Ev1 en Ev3
add("I10 V4 blijft actief na A (Ev1+Ev3)","fout",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["Ev1","Ev3","G1"],["B3:"+SP,V6L,"N3"],["Ev1"]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["Ev1","Ev3","O2"]],{ids:["I10"]});
add("I11 wisselen na A zonder nieuwe O1","fout",ruilDag(AB,3,"O1","G1"),ruilDag(BA,5,"O1","G1"),{ids:["I11"]});
add("I12 cotrimoxazol (V9) als wissel","fout",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V9","G1"],["Ev1","B3:"+SP,V6L],["N3"]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B1:V9","G1"],["Ev1","O2"]],{ids:["I12"]});
add("I13 V8 zonder V6","fout",ruil(AB,V6A,"G1"),ruil(BA,V6A,"G1"),{ids:["I13"]});
add("I13 V8 met V6 500/125 mg 2 dd","fout",ruil(AB,V6A,"V6:V8:500/125 mg 2 dd"),ruil(BA,V6A,"V6:V8:500/125 mg 2 dd"),{ids:["I13"]});
add("I13 V6 875/125 een dag te laat","fout",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8","G1"],[V6A,"Ev1","B3:"+SP],[V6L,"N3"]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B1:V8","G1"],[V6A,"Ev1","O2"]],{ids:["I13"]});
add("I14 cipro zonder B4/B3","fout",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7","G1"],["Ev1","B3:"+SP,V6L],["N3","Ev3"]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B1:V7","G1"],["Ev1","O2","Ev3"]],{ids:["I14"],zicht:["cipro"],extra:["dosis"]});
add("I14 B4 te laat (twee dagen na de start)","fout",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7","G1"],["Ev1","B3:"+SP,V6L],["N3","B4:V7","Ev3"]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B1:V7","G1"],["Ev1","O2"],["B4:V7","Ev3"]],{ids:["I14"],zicht:["cipro"],extra:["dosis"]});
add("I15 zonder N3","fout",ruil(AB,"N3","G1"),ruil(BA,"N3","G1"),{ids:["I15"]});
add("I15 zonder B3 op spironolacton","fout",ruil(AB,"B3:"+SP,"G1"),ruil(BA,"B3:"+SP,"G1"),{ids:["I15"]});
add("I15 zonder V6 lisinopril halveren","fout",ruil(AB,V6L,"G1"),ruil(BA,V6L,"G1"),{ids:["I15"]});
add("I15 V6 lisinopril 'stoppen' i.p.v. halveren","fout",ruil(AB,V6L,"V6:lisinopril:stoppen"),ruil(BA,V6L,"V6:lisinopril:stoppen"),{ids:["I15"]});
add("I15 N3 te laat (buiten 2 beurten)","fout",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8",V6A],["Ev1","B3:"+SP,V6L],[],["N3"]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["G1","Ev1","Ev2:"+SP],["O1","B1:V8",V6A],["Ev1","O2"],["N3"]],{ids:["I15"]});
add("I15 Ev1 alleen in A-venster (BA: d6), niet in B-venster","fout",BASE.AB,ruilDag(BASE.BA,4,"Ev1","G1"),{ids:["I15"],onlyBA:true});
add("I16 Ev1 niet in A-venster (AB: Ev1 pas d5)","fout",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8",V6A],["G1","B3:"+SP,V6L],["N3","Ev1"]],
  BASE.BA.map(d=>d),{ids:["I16"],onlyAB:true});
add("I16 geen verwijzing na 48 uur zonder verbetering (V4 gestopt, Ev1, geen Ev3)","fout",
  [["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B2:V4","Ev1"],["B3:"+SP,V6L,"N3"],["Ev1"]],
  [["G3","O1","V4"],["N1"],["B3:"+SP,V6L],["N3","Ev1","Ev2:"+SP],["O1","B2:V4","Ev1"],["O2"]],{ids:["I16"]});
exports.R=R;exports.BASE=BASE;

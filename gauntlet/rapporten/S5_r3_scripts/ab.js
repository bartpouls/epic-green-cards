const sb=require("./load.js");const P=sb.Predicaten;const casus=sb.CASUSSEN[0];const fs=require("fs");
const ep=id=>casus.episodes.find(e=>e.id===id);
function ctxVan(E,tl,geb,kl){const tijdlijn=tl.map((r,i)=>({volg:i+1,kaart:r[0],dag:r[1],doel:r[2]||null,optie:r[3]||null}));
 return P.maakContext(casus,ep(E),{tijdlijn,gebeurtenissen:(geb||[]).map(x=>({id:x[0],dag:x[1]})),klachten:Object.keys(kl||{}).map(d=>({dag:+d,status:kl[d]})),toestanden:["cystitis"],dag:Math.max(1,...tijdlijn.map(r=>r.dag))});}
const sp=(E,inv,tl,geb,kl)=>{const i=ep(E).invarianten.find(x=>x.id===inv);return P.evalueer(i.predicaat,ctxVan(E,tl,geb,kl));};
// [omschrijving, bronzin, bron-oordeel(handmatig uit tekst), E, inv, tl, geb, kl]
const gA=[["A",3]];
const L=[
["E3: Mw. krijgt O2 maar geen Ev2 voor spironolacton","I9 (casus): 'geen O2 ÉN geen Ev2' is fout",false,"E3","I9",[["O2",1]],[],{}],
["E3: O2, daarna B5 op spironolacton zonder Ev2","I9 (casus): spironolacton na de sick day hervatten (B5) zonder eerst Ev2",true,"E3","I9",[["O2",1],["B5",3,"spironolacton"]],[],{}],
["E3: V8 op dag 1, V6 '875/125 mg 2 dd' pas op dag 2","I13: zonder V6 naar 875/125 mg 2 dd 'in dezelfde beurt', bij eGFR < 30",true,"E3","I13",[["V8",1],["V6",2,"V8","875/125 mg 2 dd"]],[],{}],
["E3: V7 op dag 1, B4 op dag 2","I14: zonder B4 of B3 (calcium) 'in dezelfde of de volgende beurt'",false,"E3","I14",[["V7",1],["B4",2,"V7"]],[],{}],
["E3: V7 op dag 1, B4 op dag 3","I14: zonder B4 of B3 (calcium) 'in dezelfde of de volgende beurt'",true,"E3","I14",[["V7",1],["B4",3,"V7"]],[],{}],
["E3: B op dag 5; B3 sp, V6 lisinopril halveren, N3 dag 5; Ev1 dag 6","I15: alle vier binnen 2 beurten na B",false,"E3","I15",[["B3",5,"spironolacton"],["V6",5,"lisinopril","halveren"],["N3",5],["Ev1",6]],[["B",5]],{}],
["E3: A op dag 3; Ev1 pas op dag 5","I16: na A geen Ev1 binnen 2 beurten",true,"E3","I16",[["Ev1",5]],gA,{}],
["E2: V5 d1, O2 d2, V6 halveren d3","I7: V6 halveren 'vanaf dag 3 na de start' (TODO_BART-1: verschil >= 3)",true,"E2","I7",[["O1",1],["V5",1],["O2",2],["V6",3,"V5","halveren"]],[],{}],
["E2: C op dag 4, V5 blijft actief, wissel B1 pas op dag 6; klachten aan","I8: niet gewisseld of gestopt 'binnen 2 beurten'",true,"E2","I8",[["O1",1],["V5",1],["B1",6,"V4"]],[["C",4]],{4:"aan",5:"aan"}],
["E3: A op dag 3, V4 actief; B1 naar V8 op dag 4","I10: V3/V4 nog actief 'aan het eind van de beurt na gebeurtenis A'",false,"E3","I10",[["V4",1],["B1",4,"V8"]],gA,{}],
["E3: O1 op dag 1 (vóór A), na A wissel B1 naar V8 zonder nieuwe O1","I11: wisselen zonder O1 'tussen A en de wissel'",true,"E3","I11",[["O1",1],["V4",1],["B1",3,"V8"]],gA,{}],
["E3: V7 op dag 1, B1 naar V3 op dag 2 (eGFR 28)","I5: V3 gestart, 'direct of via B1', eGFR < 30",true,"E3","I5",[["V7",1],["B1",2,"V3"]],[],{}],
["E1: V3 op dag 1, B1 naar V4 op dag 2","I4: meer dan één antibioticum tegelijk actief (B1 vervangt het lopende)",false,"E1","I4",[["V3",1],["B1",2,"V4"]],[],{}],
["E3: V4 op dag 1, B1 naar V9 op dag 2 (V9 nooit als kaart gespeeld)","I12: Cotrimoxazol (V9) gespeeld",true,"E3","I12",[["V4",1],["B1",2,"V9"]],[],{}],
["E3: alleen G1 gespeeld, geen route","I1: een route gekozen (V-kaart) zonder N1",false,"E3","I1",[["G1",1]],[],{}],
];
const sleutel=[];let out="# S5 r3 blinde A/B (paren; sleutel apart)\n\n";
L.forEach((x,i)=>{
 const bron="Oordeel volgens bron ("+x[1]+"): "+(x[2]?"GESCHONDEN":"NIET GESCHONDEN");
 const spel="Oordeel van het spel (data-predicaat "+x[4]+" via Predicaten.evalueer): "+(sp(x[3],x[4],x[5],x[6],x[7])?"GESCHONDEN":"NIET GESCHONDEN");
 const wissel=Math.random()<0.5;
 sleutel.push({paar:i+1,X:wissel?"spel":"bron",Y:wissel?"bron":"spel"});
 // identieke vorm: alleen het oordeel verschilt; de brontekst staat bij beide
 const o=(b)=>x[1]+" -> "+(b?"GESCHONDEN":"NIET GESCHONDEN");
 const bronB=x[2], spelB=sp(x[3],x[4],x[5],x[6],x[7]);
 const Xb=wissel?spelB:bronB, Yb=wissel?bronB:spelB;
 out+="## Paar "+(i+1)+"\nSituatie: "+x[0]+"\nX: "+o(Xb)+"\nY: "+o(Yb)+"\n\n";
});
fs.writeFileSync("/home/user/epic-green-cards/gauntlet/rapporten/S5_r3.sleutel.json",JSON.stringify(sleutel,null,1));
fs.writeFileSync("/tmp/ab_paren_r3.md",out);console.log(out);

const fs=require("fs");const {laad,root}=require("./load.js");
const md=fs.readFileSync("/home/user/epic-green-cards/casus-uwi.md","utf8").replace(/\*\*/g,"");
const sb=laad();const c=sb.CASUSSEN[0];const e=c.episodes.find(x=>x.id==="E2");const E=sb.Engine;
function bron(re){const m=md.match(re);if(!m)throw new Error("bron niet gevonden "+re);return m[1].trim()}
// spel-kant via de echte Engine
const st=E.nieuwSpel(c,"E2",{rng:()=>0});
const zv=st.zichtbaar;
const spel0={kop:zv.kop,klachten:zv.klachten,labTekst:zv.labTekst};
const r=E.speelKaart(st,"G2");
const na=st.zichtbaar;
// C
const s2=E.nieuwSpel(c,"E2",{rng:()=>0});["G2","O1","N1","V4"].forEach(k=>E.speelKaart(s2,k,{doel:k==="N2"?"V4":null}));E.volgendeDag(s2);
const Cdef=e.gebeurtenissen.find(x=>x.id==="C");
const inv=id=>e.invarianten.find(i=>i.id===id);
const paren=[
 ["Patiëntkop + klachten (regel 1 patiëntkaart)", md.match(/- (Mevrouw V\., 78 jaar \(6 jaar na episode 1\)\. Tweede cystitis[^\n]*)/)[1], spel0.kop+" "+spel0.klachten],
 ["Medicatie", bron(/- Medicatie: (lisinopril; calcium\/colecalciferol)/), e.patient.zichtbaar.medicatieTekst],
 ["Lab op de kaart (vóór G2)", bron(/- Lab op de kaart: ([^\n]+)\./), spel0.labTekst],
 ["Eerdere UWI", bron(/- Eerdere UWI: ([^\n]+)\./), e.patient.zichtbaar.eerdereUWI],
 ["Onthulling G2 (na kaart)", bron(/- Verborgen achter G2: (eGFR 29 uit de jaarlijkse controle)\./), na.labTekst],
 ["Gebeurtenis C: kweekuitslagtekst", (function(){const g1=md.match(/- (E\. coli, resistent voor trimethoprim en amoxicilline\.)/)[1];const g2=md.match(/- (Gevoelig voor nitrofurantoïne[^\n]+\.)/)[1];return g1+" "+g2})(), Cdef.tekst],
 ["I5 vraag", bron(/\| I5 \| "([^"]+)"/), inv("I5").vraag],
 ["I6 vraag 'geen kweek'", bron(/\| I6, geen kweek \| "([^"]+)"/), inv("I6").vraagVarianten[0].vraag],
 ["I6 vraag 'afwachten'", bron(/\| I6, afwachten \| "([^"]+)"/), inv("I6").vraagVarianten[1].vraag],
 ["I7 vraag 'geen kalium'", bron(/\| I7, geen kalium \| "([^"]+)"/), inv("I7").vraagVarianten[0].vraag],
 ["I7 vraag 'niet gehalveerd'", bron(/\| I7, niet gehalveerd \| "([^"]+)"/), inv("I7").vraagVarianten[1].vraag],
 ["I8 vraag", bron(/\| I8 \| "(De kweek is binnen[^"]+)"/), inv("I8").vraag],
 ["Verouderde eGFR vraag", bron(/\| Verouderde eGFR niet opgemerkt \| "([^"]+)"/), e.feedbackExtra[0].vraag],
 ["Onnodig gewisseld vraag", bron(/\| Onnodig gewisseld \| "([^"]+)"/), e.feedbackExtra[1].vraag],
 ["Zichtbaar: nitrofurantoïne zonder G2", bron(/Nitrofurantoïne zonder G2: "([^"]+)"/), e.zichtbaarAlsOntbreekt[0].tekst],
 ["Zichtbaar: V5 zonder O2", bron(/V5 zonder O2: "([^"]+)"/), e.zichtbaarAlsOntbreekt[1].tekst],
 ["Brug", bron(/Brug: (de kweek uit deze episode[^\n]+)/), e.brug],
 ["Statusteksten (fragmenten Trimethoprim/Fosfomycine)", (function(){const m=md.match(/- Trimethoprim: ([^\n]+)\.\n  - Fosfomycine: ([^\n]+)\./);return m[1]+" / "+m[2]})(), e.statusTeksten.aan+" / "+e.statusTeksten.af],
];
// randomiseer
let seed=Date.now()%100000;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const sleutel=[];const gelijk=[];const uit=[];
paren.forEach(([naam,b,s],i)=>{const wissel=rnd()<0.5;const X=wissel?s:b,Y=wissel?b:s;sleutel.push({nr:i+1,naam,X:wissel?"spel":"bron",Y:wissel?"bron":"spel"});gelijk.push(X===Y);uit.push("### Paar "+(i+1)+" — "+naam+"\nX: "+JSON.stringify(X)+"\nY: "+JSON.stringify(Y)+"\n")});
fs.writeFileSync("/home/user/epic-green-cards/gauntlet/rapporten/S3_r3.sleutel.json",JSON.stringify(sleutel,null,1));
fs.writeFileSync("paren.txt",uit.join("\n"));fs.writeFileSync("gelijk.json",JSON.stringify(gelijk));fs.writeFileSync("gelijk.json",JSON.stringify(gelijk));
console.log(uit.join("\n"));

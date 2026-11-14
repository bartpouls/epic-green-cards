const sb=require("./load.js");const P=sb.Predicaten;const casus=sb.CASUSSEN[0];const ep=casus.episodes[2];
// realistische, lange tijdlijn
const tl=[["G3",1],["O1",1],["V8",1,null,null],["V6",1,"V8","875/125 mg 2 dd"],["N1",2],["O2",2],["Ev2",2,"spironolacton"],["G1",3],["B3",3,"spironolacton"],["V6",3,"lisinopril","halveren"],["N3",4],["Ev1",4],["B4",5,"V7"],["B1",5,"V7"],["B1",6,"V8"],["V6",6,"V8","875/125 mg 2 dd"],["Ev1",7],["N2",7,"V8"],["G2",7],["O2",7]]
 .map((r,i)=>({volg:i+1,kaart:r[0],dag:r[1],doel:r[2]||null,optie:r[3]||null}));
const st={tijdlijn:tl,gebeurtenissen:[{id:"A",dag:3},{id:"B",dag:5},{id:"C",dag:4}],klachten:[1,2,3,4,5,6,7].map(d=>({dag:d,status:d>1?"aan":null})),toestanden:["cystitis","weefselinvasie"],dag:7,aantalDagen:7};
const ctx=P.maakContext(casus,ep,st);
let t0=process.hrtime.bigint();let k=0;
while(k<4000){ep.invarianten.forEach(i=>{P.evalueer(i.predicaat,ctx);k++;});}
let ms=Number(process.hrtime.bigint()-t0)/1e6;console.log("4000+ invariant-evaluaties E3:",k,ms.toFixed(0),"ms (",(ms/k*1000).toFixed(0),"µs/stuk )");
// engine-patroon: eindeDag per dag × 7 antibiotica, 4000 keer actief
t0=process.hrtime.bigint();for(let i=0;i<4000;i++){P.evalueer({p:"actief",middel:ep.antibiotica[i%7],op:{dag:1+i%7}},ctx);}
ms=Number(process.hrtime.bigint()-t0)/1e6;console.log("4000 x actief(op dag):",ms.toFixed(0),"ms");
// zwaarste: alle score+profiel+feedback+zichtbaar predicaten E3
const all=[];(function w(o){if(Array.isArray(o))o.forEach(w);else if(o&&typeof o==="object"){if(typeof o.p==="string"&&!o.__x)all.push(o);Object.values(o).forEach(w);}})(ep);
t0=process.hrtime.bigint();k=0;for(let r=0;r<20;r++)all.forEach(p=>{P.evalueer(p,ctx);k++});
ms=Number(process.hrtime.bigint()-t0)/1e6;console.log("alle E3-predicaten x20:",k,ms.toFixed(0),"ms");
// pathologisch: tijdlijn 300 regels
const lang=[];for(let i=0;i<300;i++)lang.push({volg:i+1,kaart:["V3","B2","V4","B1","G1","O1"][i%6],dag:1+Math.floor(i/6),doel:i%6===1?"V3":(i%6===3?"V4":null),optie:null});
const cl=P.maakContext(casus,ep,Object.assign({},st,{tijdlijn:lang}));
t0=process.hrtime.bigint();for(let i=0;i<4000;i++)P.evalueer({p:"aantalActieveAntibiotica",op:">",n:1},cl);
ms=Number(process.hrtime.bigint()-t0)/1e6;console.log("4000 x aantalActieve op 300 regels:",ms.toFixed(0),"ms");
// ongebruikte takken van geldige data: elk E-predicaat valideren in een ctx met lege en met volle tijdlijn
let fouten=0;casus.episodes.forEach(e=>{const lege=P.maakContext(casus,e,{});const A=[];(function w(o){if(Array.isArray(o))o.forEach(w);else if(o&&typeof o==="object"){if(typeof o.p==="string")A.push(o);Object.values(o).forEach(w);}})(e);
 A.forEach(p=>{try{P.evalueer(p,lege);}catch(er){fouten++;console.log("lege ctx fout",e.id,JSON.stringify(p).slice(0,80),er.message)}});});
console.log("fouten bij lege ctx (geldige data):",fouten);

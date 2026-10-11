// Onafhankelijke extractie: casus sectie 6 (+ I1/I4 uit 4, I5-I8 uit 5) <-> data, beide richtingen.
const fs=require("fs");const L=require("./load.js");
const md=fs.readFileSync(L.root+"/casus-uwi.md","utf8");
const sb=L.laad({zonderEval:false});const c=sb.CASUSSEN[0];const e=c.episodes.find(x=>x.id==="E3");
const strip=s=>s.replace(/\*\*/g,"").replace(/\*([^*]+)\*/g,"$1"); // markdown opmaak
const lines=md.split("\n");
const idx=n=>lines.findIndex(l=>l.startsWith("## "+n+"."));
const sec=(a,b)=>lines.slice(idx(a),idx(b));
const s4=sec(4,5),s5=sec(5,6),s6=sec(6,7);
const fails=[];let checks=0;
function alleData(x,pad,uit){ if(typeof x==="string")uit.push([pad,x]); else if(Array.isArray(x))x.forEach((v,i)=>alleData(v,pad+"["+i+"]",uit)); else if(x&&typeof x==="object")Object.keys(x).forEach(k=>{ if(/^TODO_BART/.test(k))return; alleData(x[k],pad+"."+k,uit);}); return uit;}
const spelData=alleData({e},"E3",[]).filter(([p])=>!/\.meta\b/.test(p)); // spelzichtbare/casus-strings (incl. meta apart)
const metaData=alleData({e},"E3",[]).filter(([p])=>/\.meta\b/.test(p));
const dataSet=new Set(alleData({e},"E3",[]).map(x=>x[1]));
function eis(naam,tekst,waar){ checks++; // exacte string moet als volledige waarde in data staan
  if(!dataSet.has(tekst)){ fails.push("CASUS->DATA ontbreekt ("+naam+"): "+JSON.stringify(tekst)); } }
// 1. Alle tabelrijen/ bullets in sectie 6: cellen
function cellen(l){ return l.split("|").slice(1,-1).map(s=>strip(s.trim())); }
// Gebeurtenissen
const evRows=s6.filter(l=>/^\| [ABC] \|/.test(l)).map(cellen);
evRows.forEach(r=>eis("gebeurtenis "+r[0]+" inhoud",r[2]));
// Invariantentabel I9-I16
s6.filter(l=>/^\| I\d+ \|/.test(l)&&!/\| "/.test(l)).forEach(l=>{const r=cellen(l); eis(r[0]+" altijd fout",r[1]); eis(r[0]+" geldt in",r[2]); eis(r[0]+" bron",r[3]);});
s5.filter(l=>/^\| I\d+ \|/.test(l)&&!/\| "/.test(l)).forEach(l=>{const r=cellen(l); eis(r[0]+" altijd fout",r[1]); eis(r[0]+" bron",r[2]);});
s4.filter(l=>/^\| I\d+ \|/.test(l)&&!/\| "/.test(l)).forEach(l=>{const r=cellen(l); if(r[0]==="I3")return; eis(r[0]+" altijd fout",r[1]); eis(r[0]+" bron",r[2]);});
// Feedbacktabellen: vragen binnen aanhalingstekens
function vragen(sectie,naam,filter){ sectie.filter(l=>/^\| .* \| ".*" \|$/.test(l)).forEach(l=>{const r=cellen(l); const v=r[1].replace(/^"|"$/g,""); if(filter&&!filter(r[0]))return; eis(naam+" "+r[0],v);}); }
vragen(s6,"fb6");
vragen(s5,"fb5",t=>["I5","I6, geen kweek","I6, afwachten","I7, geen kalium","I7, niet gehalveerd","I8"].includes(t));
vragen(s4,"fb4",t=>["I1","I4"].includes(t));
// Zichtbaar-als-ontbreekt: tekst tussen aanhalingstekens
s6.filter(l=>/^- \*\*(Geen sick|Ciprofloxacine zonder|I9 gemist)/.test(l)).forEach(l=>{const m=l.match(/"([^"]+)"/); eis("zichtbaar "+l.slice(0,30),m[1]);});
// Patiëntkaart
const pk=s6.filter(l=>/^- \*\*(Mevrouw|Medicatie|Lab|Verborgen)/.test(l)).map(strip);
console.log("patiëntkaartregels:",pk.length);
// kop+klachten
const kop=pk[0].replace(/^- /,"");  // "Mevrouw V., 79 jaar (1 jaar na episode 2). Cystitis, geen koorts."
checks++; if(e.patient.zichtbaar.kop+" "+e.patient.zichtbaar.klachten!==kop) fails.push("kop+klachten: "+kop); // (kop+klachten zijn twee velden)
const med=pk[1].replace(/^- Medicatie: /,"");eis("medicatieregel",med);
const lab=pk[2].replace(/^- Lab: /,"");
const labm=lab.match(/^(.*?\.) (Risicogroep \[NHG\]\.)$/);eis("labTekst",labm[1]);eis("risicogroep (meta)",labm[2]);
const verb=pk[3].replace(/^- Verborgen achter G3: /,"");const vm_=verb.match(/^(.*?\.) (Die valt.*)$/);eis("verborgen onthult",vm_[1]);eis("verborgen meta",vm_[2]);
// toelichting spironolacton
const tl=s6.find(l=>/Wie spironolacton heeft gestart/.test(l));eis("toelichting",strip(tl.trim().replace(/^- /,"")));
// Score bullets
s6.filter(l=>/^- \*\*(Duurzaamheid|Doelmatigheid):\*\*/.test(l)).slice(-2).forEach(l=>{const t=strip(l).replace(/^- (Duurzaamheid|Doelmatigheid): /,""); eis("score casusTekst",t);});
// Knoppen
const kn=s6.slice(s6.findIndex(l=>/\*\*Knoppen/.test(l))+1).slice(0,3).map(l=>l.replace(/^- /,""));kn.forEach(k=>eis("knoppen",k));
// Profielen tabel
const prof=s6.filter(l=>/^\| (Amoxicilline\/clavulaanzuur 875|Ciprofloxacine met calcium)/.test(l)).map(cellen);
prof.forEach(r=>{console.log("profielrij:",r[2]);});
eis("profiel Kweekgestuurd casusTekst",prof[0][2]); eis("profiel eerste keus casusTekst",prof[1][2]);
// Bronconflict
const bc=s6.find(l=>/^\*\*Bronconflict/.test(l));const bct=strip(bc).replace(/^Bronconflict, geen poort: /,"");eis("bronconflict (meta)",bct);
console.log("controles casus->data:",checks,"fouten:",fails.length);fails.forEach(f=>console.log(" ",f));
// 2. Data -> casus: elke spelzichtbare string moet in casus staan (na markdown-strip), of op een bekende vaste lijst (ids, namen)
const casusTekst=strip(md); const casusN=casusTekst.replace(/\s+/g," ");
const sleutelsGeenCasus=/\.(id|groep|toestand|type|kaart|alleenAlsGespeeld|p|op|wanneer|veld|middel|sleutel|titel|naam|opmerking|geldtInTekst|categorie|label)(\[\d+\])?$/;
const onbekend=[];
spelData.forEach(([p,s])=>{ if(/\.(id|groep|toestand|type|kaart|alleenAlsGespeeld|p|op|wanneer|veld|middel|sleutel|doel|optie|naGebeurtenis|uitSet|waarde|als|dan|gebeurtenis|datum|waar|resistent|gevoelig|werkzaam|nietWerkzaam|repertoire|antibiotica|startToestanden)\b/.test(p)||/repertoire|antibiotica|startToestanden|resistent|gevoelig/.test(p))return;
  if(/^[A-Za-z0-9_\/ ]{1,12}$/.test(s)&&!casusN.includes(s))return;
  if(!casusN.includes(s.replace(/\s+/g," "))) onbekend.push([p,s]);});
console.log("\nDATA->CASUS niet letterlijk in casus (spelzichtbaar, excl. meta):",onbekend.length);onbekend.forEach(([p,s])=>console.log("  ",p,"=>",JSON.stringify(s).slice(0,160)));
const metaOnb=metaData.filter(([p,s])=>!casusN.includes(s)); console.log("\nmeta-strings niet in casus:",metaOnb.length);metaOnb.forEach(([p,s])=>console.log("  ",p,JSON.stringify(s).slice(0,160)));
// 3. slotpunt/hoofdletter per veld: lijst alle vragen/teksten met eerste teken en laatste teken
const tab=[];
e.invarianten.forEach(i=>{tab.push([i.id+".vraag",i.vraag]);(i.vraagVarianten||[]).forEach((v,k)=>tab.push([i.id+".vv"+k,v.vraag]));tab.push([i.id+".altijdFout",i.altijdFout]);tab.push([i.id+".bron",i.bron]);});
tab.push(["A",e.gebeurtenissen[0].tekst],["B",e.gebeurtenissen[1].tekst],["C",e.gebeurtenissen[2].tekst]);
Object.entries(e.statusTeksten).filter(([k])=>!/TODO/.test(k)).forEach(([k,v])=>tab.push(["status."+k,v]));
e.zichtbaarAlsOntbreekt.forEach((z,k)=>tab.push(["zicht"+k,z.tekst]));
e.feedbackExtra.forEach((z,k)=>tab.push(["fbx"+k,z.vraag]));
e.profielen.forEach(p=>tab.push(["prof."+p.naam,p.reflectievraag]));
tab.push(["kop",e.patient.zichtbaar.kop],["klachten",e.patient.zichtbaar.klachten],["medicatieTekst",e.patient.zichtbaar.medicatieTekst],["labTekst",e.patient.zichtbaar.labTekst],["casusMedicatieregel",e.patient.casusMedicatieregel],["verborgen.onthult",e.patient.verborgen[0].onthult],["meta.risicogroep",e.patient.meta.risicogroep]);
console.log("\nveld | eerste | laatste");tab.forEach(([k,v])=>{ if(v==null){console.log(k,"null");return;} console.log(k.padEnd(22),JSON.stringify(v[0]),JSON.stringify(v.slice(-1)), casusN.includes(v)?"in-casus":"NIET-IN-CASUS"); });

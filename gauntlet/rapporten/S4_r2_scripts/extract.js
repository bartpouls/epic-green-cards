// Eigen extractie (onafhankelijk van tests/data-e3.tests.js): casus-uwi.md -> verwachte E3-teksten; vergelijk met casussen/uwi-e3.js
const fs=require("fs"); const {laad,root}=require("./lad.js");
const md=fs.readFileSync(root+"/casus-uwi.md","utf8");
const sb=laad(); const c=sb.CASUSSEN[0]; const e=c.episodes.find(x=>x.id==="E3");
function sectie(nr){ const re=new RegExp("^## "+nr+"\\. .*$","m"); const m=re.exec(md); const s=m.index; const rest=md.slice(s+m[0].length); const n=/^## \d+\. /m.exec(rest); return md.slice(s, n? s+m[0].length+n.index : md.length); }
function sub(s,kop){ const i=s.indexOf("### "+kop); if(i<0) throw new Error("kop "+kop); const r=s.slice(i+4+kop.length); const n=/^### /m.exec(r); return n? r.slice(0,n.index):r; }
function rijen(blok){ return blok.split("\n").filter(l=>/^\|/.test(l)).map(l=>l.replace(/^\|\s*/,"").replace(/\s*\|\s*$/,"").split(/\s*\|\s*/)).filter(r=>!/^-+$/.test(r[0])&&r[0]!=="Id"&&r[0]!=="Trigger"); }
const s6=sectie(6), s5=sectie(5), s4=sectie(4);
const strip=t=>t.replace(/\*\*/g,"");
let fouten=[], ok=0;
function eq(naam,exp,got){ if(exp===got) ok++; else fouten.push(naam+"\n   verwacht: "+JSON.stringify(exp)+"\n   kreeg:    "+JSON.stringify(got)); }
// Patientkaart
const pk=sub(s6,"Patiëntkaart");
const regels=pk.split("\n");
const kopRegel=strip(regels.find(l=>l.startsWith("- **Mevrouw V."))).replace(/^- /,"");
eq("kop+klachten", kopRegel, e.patient.zichtbaar.kop+" "+e.patient.zichtbaar.klachten);
const med=strip(regels.find(l=>l.startsWith("- **Medicatie:**"))).replace(/^- Medicatie: /,"");
eq("medicatieregel", med, e.patient.zichtbaar.medicatieTekst); eq("casusMedicatieregel", med, e.patient.casusMedicatieregel);
const toel=strip(regels.find(l=>/Wie spironolacton heeft gestart/.test(l))).trim();
eq("toelichting", toel, e.patient.toelichting);
const lab=strip(regels.find(l=>l.startsWith("- **Lab:**"))).replace(/^- Lab: /,"");
eq("lab", lab, e.patient.zichtbaar.labTekst+" "+e.patient.zichtbaar.risicogroep);
const verb=strip(regels.find(l=>l.startsWith("- **Verborgen achter G3:**"))).replace(/^- Verborgen achter G3: /,"");
const v0=e.patient.verborgen[0];
eq("verborgen", verb, v0.onthult.replace(/^de /,"de ")+". "+v0.toelichting);
// knoppen
const kn=s6.split("**Knoppen:**")[1].split("###")[0].split("\n").filter(l=>l.startsWith("- ")).map(l=>l.slice(2));
eq("knoppen", JSON.stringify(kn), JSON.stringify(e.knoppen.casusTekst));
// repertoire
const rep=sub(s6,"Repertoire"); console.log("repertoire casus:",rep.trim());
// gebeurtenissen
const gb=rijen(sub(s6,"Gebeurtenissen")); 
gb.forEach(r=>{ const g=e.gebeurtenissen.find(x=>x.id===r[0]); eq("gebeurtenis "+r[0], strip(r[2]).replace(/\.$/,"")===g.tekst?g.tekst:strip(r[2]), g.tekst); });
// opm A/B neutraal
eq("opmerking AB","De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler.",e.gebeurtenissen[0].opmerking);
// invarianten sectie 6
const inv6=rijen(sub(s6,"Invarianten (poort; I1, I4, I5, I6, I7 en I8 blijven gelden)"));
const vragen={};
function feedbackRijen(s){ const f=s.slice(s.indexOf("### Feedback")); return rijen(f.split(/\n---/)[0]); }
const fb6=feedbackRijen(s6), fb5=feedbackRijen(s5), fb4=feedbackRijen(s4);
const unq=t=>t.replace(/^"/,"").replace(/"$/,"");
inv6.forEach(r=>{ const i=e.invarianten.find(x=>x.id===r[0]); if(!i){fouten.push("ontbreekt "+r[0]);return;}
  eq(r[0]+" altijdFout", strip(r[1]), i.altijdFout); eq(r[0]+" geldtInTekst", strip(r[2]), i.geldtInTekst); eq(r[0]+" bron", strip(r[3]), i.bron);
  const f=fb6.find(x=>x[0]===r[0]); eq(r[0]+" vraag", unq(f[1]), i.vraag); });
const inv5=rijen(s5.slice(s5.indexOf("### Invarianten")).split("### Volgorde")[0].split("**Volgorde")[0]);
inv5.forEach(r=>{ const i=e.invarianten.find(x=>x.id===r[0]); eq(r[0]+" altijdFout(5)", strip(r[1]), i.altijdFout); eq(r[0]+" bron(5)", strip(r[2]), i.bron); });
// vragen sectie 5
const v5={"I5":null,"I8":null}; 
["I5","I8"].forEach(id=>{ const f=fb5.find(x=>x[0]===id); eq(id+" vraag", unq(f[1]), e.invarianten.find(x=>x.id===id).vraag); });
const i6=e.invarianten.find(x=>x.id==="I6"), i7=e.invarianten.find(x=>x.id==="I7");
const f6=fb5.filter(x=>/^I6/.test(x[0])), f7=fb5.filter(x=>/^I7/.test(x[0]));
f6.forEach((f,k)=>eq("I6 variant "+f[0], unq(f[1]), i6.vraagVarianten[k].vraag));
f7.forEach((f,k)=>eq("I7 variant "+f[0], unq(f[1]), i7.vraagVarianten[k].vraag));
["I1","I4"].forEach(id=>{ const f=fb4.find(x=>x[0]===id); eq(id+" vraag", unq(f[1]), e.invarianten.find(x=>x.id===id).vraag); });
// I1/I4 altijdFout/bron sectie4
const inv4=rijen(s4.slice(s4.indexOf("### Invarianten")).split("**Volgorde")[0]);
inv4.filter(r=>r[0]==="I1"||r[0]==="I4").forEach(r=>{const i=e.invarianten.find(x=>x.id===r[0]); eq(r[0]+" altijdFout(4)", strip(r[1]), i.altijdFout); eq(r[0]+" bron(4)", strip(r[2]), i.bron);});
// overige feedback sectie 6
const herstart=fb6.find(x=>x[0]==="Automatische herstart"); eq("herstart", unq(herstart[1]), e.feedbackExtra.find(f=>f.trigger.K&&f.trigger.K.kaart==="B5").vraag);
const dosis=fb6.find(x=>/Ciprofloxacine-dosis/.test(x[0])); eq("dosis", unq(dosis[1]), e.feedbackExtra.find(f=>f.trigger.middel==="V7").vraag);
const prof=fb6.find(x=>/Profiel ciprofloxacine/.test(x[0])); eq("profiel refl", unq(prof[1]), e.profielen.find(p=>p.naam==="Richtlijn eerste keus").reflectievraag);
// bronconflict
const bc=strip(s6.split("\n").find(l=>l.startsWith("**Bronconflict"))); eq("bronconflict", bc.replace(/^Bronconflict, geen poort: /,""), e.feedbackExtra.find(f=>f.trigger.middel==="V7").toelichting);
// zichtbaar
const zz=s6.split("\n").filter(l=>l.startsWith("- **Geen sick")||l.startsWith("- **Ciprofloxacine zonder")||l.startsWith("- **I9 gemist"));
const quote=t=>{const m=/"([^"]*)"/.exec(t); return m[1];};
eq("zicht sick", quote(zz[0]), e.zichtbaarAlsOntbreekt[0].tekst); eq("zicht sick toel", "Zonder getallen, zoals ook de KNMP-regel geen getallen geeft.", e.zichtbaarAlsOntbreekt[0].toelichting);
eq("zicht-cipro", quote(zz[1]), e.zichtbaarAlsOntbreekt[1].tekst); eq("zicht-i9", quote(zz[2]), e.zichtbaarAlsOntbreekt[2].tekst);
// score
const sc=sub(s6,"Score"); console.log(sc.trim());
const profTab=s6.split("\n").filter(l=>/^\| (Amoxicilline\/clavulaanzuur 875|Ciprofloxacine met calcium)/.test(l)).map(l=>l.split("|").map(s=>s.trim()));
console.log(profTab);
eq("profiel kweekgestuurd casusTekst", strip(profTab[0][3]), e.profielen[0].casusTekst); eq("profiel cipro casusTekst", strip(profTab[1][3]), e.profielen[1].casusTekst);
// ernst per 6.1
const bo=fs.readFileSync(root+"/bouwopdracht-uwi.md","utf8"); const b61=bo.split("### 6.1")[1].split("### 6.2")[0];
rijen(b61).forEach(r=>{ if(!/^I\d+$/.test(r[0])) return; const i=e.invarianten.find(x=>x.id===r[0]); if(!i){ console.log("niet in E3:",r[0]); return;} eq(r[0]+" ernst", parseInt(r[1]), i.ernst); });
// geldtIn per toestandstabel
const gi={I1:["*"],I4:["*"],I5:["*"],I6:["*"],I7:["*"],I9:["*"],I12:["*"],I13:["*"],I10:["weefselinvasie"],I11:["weefselinvasie"],I14:["*"],I15:["uitdroging"],I16:["weefselinvasie"]};
Object.keys(gi).forEach(k=>eq(k+" geldtIn", JSON.stringify(gi[k]), JSON.stringify(e.invarianten.find(x=>x.id===k).geldtIn)));
eq("I8 geldtIn", JSON.stringify([{gebeurtenis:"C"}]), JSON.stringify(e.invarianten.find(x=>x.id==="I8").geldtIn));
console.log("OK:",ok,"FOUT:",fouten.length); fouten.forEach(f=>console.log(f));

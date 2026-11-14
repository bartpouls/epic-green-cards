// Blinde A/B: bron (casus-uwi.md, eigen extractie) tegenover wat het spel (Engine + mini-evaluator + data) toont.
const fs=require("fs"); const {root}=require("./lad.js");
const {runPlan,samenvat,M}=require("./bot.js"); const {F}=require("./fouten.js"); const G=require("./geldig.js");
const md=fs.readFileSync(root+"/casus-uwi.md","utf8"); const strip=t=>t.replace(/\*\*/g,"");
const lijnen=md.split("\n"); const s6=md.slice(md.indexOf("## 6. Episode 3"),md.indexOf("## 7. Spelregels"));
const s5=md.slice(md.indexOf("## 5. Episode 2"),md.indexOf("## 6. Episode 3"));
const l6=s6.split("\n"), l5=s5.split("\n");
const bron={}, spel={};
const pk=(pre,reg=l6)=>strip(reg.find(l=>l.startsWith(pre))).replace(/^- /,"");
const ep=M.ep;
// 1 kop+klachten
bron["Patiëntkaart: kop en klachten"]=pk("- **Mevrouw V.").replace(/^/,"");
spel["Patiëntkaart: kop en klachten"]=ep.patient.zichtbaar.kop+" "+ep.patient.zichtbaar.klachten;
bron["Patiëntkaart: medicatieregel"]=pk("- **Medicatie:**").replace(/^Medicatie: /,"");
{ const st=M.E.nieuwSpel(M.c,"E3",{rng:()=>0}); spel["Patiëntkaart: medicatieregel"]=st.zichtbaar.medicatieTekst; }
bron["Patiëntkaart: lab en risicogroep"]=pk("- **Lab:**").replace(/^Lab: /,"");
spel["Patiëntkaart: lab en risicogroep"]=ep.patient.zichtbaar.labTekst+" "+ep.patient.zichtbaar.risicogroep;
bron["Patiëntkaart: toelichting spironolacton"]=strip(l6.find(l=>/Wie spironolacton heeft gestart/.test(l))).trim();
spel["Patiëntkaart: toelichting spironolacton"]="- "+ep.patient.toelichting;
// G3 onthulling
bron["Verborgen achter G3"]=pk("- **Verborgen achter G3:**").replace(/^Verborgen achter G3: /,"");
{ const st=M.E.nieuwSpel(M.c,"E3",{rng:()=>0}); const r=M.E.speelKaart(st,"G3"); const o=r.onthuld[0]; spel["Verborgen achter G3"]=o.tekst+". "+ep.patient.verborgen[0].toelichting; }
// gebeurtenissen: banner zoals de engine hem toont (tekst van de gebeurtenis die in state.gebeurtenissen staat)
const tabel=l6.filter(l=>/^\| [ABC] \|/.test(l)).map(l=>l.split("|").map(s=>s.trim()));
for(const r of tabel){ const id=r[1]; bron["Gebeurtenis "+id]=strip(r[3]);
  const st=M.E.nieuwSpel(M.c,"E3",{rng:()=>0});
  const plan=[["G3"],["O1"],["V4"],["N1"]];
  const s=runPlan(plan,"AB",{tot:3}); const g=s.gebeurtenissen.find(x=>x.id===id);
  let tekst; if(g) tekst=ep.gebeurtenissen.find(x=>x.id===id).tekst; else { const s2=runPlan(plan,"BA",{tot:3}); const g2=s2.gebeurtenissen.find(x=>x.id===id); tekst=ep.gebeurtenissen.find(x=>x.id===id).tekst; }
  spel["Gebeurtenis "+id]=tekst; }
// Feedback via echte foutroutes
const fb6={}; l6.filter(l=>/^\| (I\d+|Automatische herstart|Ciprofloxacine-dosis|Profiel ciprofloxacine)/.test(l)).forEach(l=>{const c=l.split("|").map(s=>s.trim()); fb6[c[1]]=c[2].replace(/^"|"$/g,"");});
const fb5={}; l5.filter(l=>/^\| (I\d+|Verouderde|Onnodig)/.test(l)).forEach(l=>{const c=l.split("|").map(s=>s.trim()); fb5[c[1]]=c[2].replace(/^"|"$/g,"");});
const fb4=md.slice(md.indexOf("## 4. Episode 1"),md.indexOf("## 5. Episode 2")).split("\n").filter(l=>/^\| (I1|I4) /.test(l)).map(l=>l.split("|").map(s=>s.trim())); const fb1={}; fb4.forEach(c=>fb1[c[1]]=c[2].replace(/^"|"$/g,""));
function vraagVan(id,idx,vol){ const lijst=F.filter(x=>x.id===id); const x=lijst[idx||0]; const o=samenvat(runPlan(x.plan,vol||"AB",{tot:x.tot})); if(!(o.geschonden.length===1&&o.geschonden[0]===id)) throw new Error("route "+id+" niet zuiver"); return o.vraag; }
const route={I1:["I1",fb1.I1,0],I4:["I4",fb1.I4,0],I5:["I5",fb5.I5,0],"I6 geen kweek":["I6",fb5["I6, geen kweek"],0],"I6 afwachten":["I6",fb5["I6, afwachten"],1],"I7 geen kalium":["I7",fb5["I7, geen kalium"],0],"I7 niet gehalveerd":["I7",fb5["I7, niet gehalveerd"],1],I8:["I8",fb5.I8,0]};
for(let i=9;i<=16;i++) route["I"+i]=["I"+i,fb6["I"+i],0];
for(const [naam,[id,b,idx]] of Object.entries(route)){ bron["Vraag "+naam]=b; spel["Vraag "+naam]=vraagVan(id,idx,(idx%2)?"BA":"AB"); }
// zichtbaar-als-ontbreekt: via echte route
const zz=l6.filter(l=>/^- \*\*(Geen sick|Ciprofloxacine zonder|I9 gemist)/.test(l)).map(l=>strip(l).replace(/^- /,""));
const gz=(plan,vol,tot)=>samenvat(runPlan(plan,vol,{tot})).zicht;
const zv=["De nierfunctie daalt verder en het kalium stijgt.","Na 48 uur geen verbetering.","Het kalium is onbekend, en niemand heeft naar spironolacton gekeken."];
// route zonder sickday, zonder O2/Ev2, cipro zonder B4
const zr=runPlan([["G3"],["O1"],["V4"],["N1"],G.nieuweKweek,["B1","V7",null,require("./bot.js").W.A],["Ev3",null,null,st=>st.dag>=5]],"AB",{tot:7}); const zs=samenvat(zr).zicht;
bron["Zichtbaar: geen sick day-maatregelen"]=zz[0]; spel["Zichtbaar: geen sick day-maatregelen"]='Geen sick day-maatregelen: "'+(zs.find(t=>/nierfunctie/.test(t))||"ONTBREEKT")+'" Zonder getallen, zoals ook de KNMP-regel geen getallen geeft.';
bron["Zichtbaar: ciprofloxacine zonder B4/B3"]=zz[1]; spel["Zichtbaar: ciprofloxacine zonder B4/B3"]='Ciprofloxacine zonder B4/B3: "'+(zs.find(t=>/48/.test(t))||"ONTBREEKT")+'"';
bron["Zichtbaar: I9 gemist"]=zz[2]; spel["Zichtbaar: I9 gemist"]='I9 gemist: "'+(zs.find(t=>/kalium is onbekend/.test(t))||"ONTBREEKT")+'"';
// profiel + reflectievraag ciprofloxacine (geldige route)
{ const o=samenvat(runPlan(G.R.cipro_B4.plan,"AB",{})); const ev=o.ev; bron["Profiel ciprofloxacine reflectie"]=fb6["Profiel ciprofloxacine"]; spel["Profiel ciprofloxacine reflectie"]=ev.profiel.refl;
  const bc=strip(l6.find(l=>l.startsWith("**Bronconflict"))).replace(/^Bronconflict, geen poort: /,""); const f2=M.ep.feedbackExtra.find(f=>f.trigger.middel==="V7");
  bron["Bronconflict ciprofloxacine (feedbackmoment)"]=bc+" | "+fb6[Object.keys(fb6).find(k=>k.startsWith("Ciprofloxacine-dosis"))]; spel["Bronconflict ciprofloxacine (feedbackmoment)"]=f2.toelichting+" | "+ev.extra[0]; }
// automatische herstart: route met B5 na Ev2
{ const pl=[...G.pre(),G.nieuweKweek,["B1","V8",null,require("./bot.js").W.A],["V6","V8","875/125 mg 2 dd",st=>G.had(st,"B1","V8")],G.evA,...G.sickday(),["Ev2","spironolacton",null,require("./bot.js").W.dag(5)],["O2",null,null,require("./bot.js").W.dag(5)],["B5","spironolacton",null,st=>G.had(st,"Ev2")&&st.dag>=6]];
  const o=samenvat(runPlan(pl,"AB",{})); bron["Automatische herstart"]=fb6["Automatische herstart"]; spel["Automatische herstart"]=o.ev.poortGehaald?o.ev.extra.find(t=>/herstart/.test(t))||("GEEN: "+o.ev.extra.join("|")):"POORT NIET GEHAALD "+o.geschonden; }
module.exports={bron,spel};
if(require.main===module){
  const namen=Object.keys(bron); let seed=20261011; const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};
  const sleutel={}, paren=[]; namen.forEach((n,i)=>{ const flip=rnd()<0.5; sleutel[i+1]={naam:n,X:flip?"spel":"bron",Y:flip?"bron":"spel"}; paren.push({nr:i+1,X:flip?spel[n]:bron[n],Y:flip?bron[n]:spel[n],situatie:n}); });
  fs.writeFileSync(root+"/gauntlet/rapporten/S4_r2.sleutel.json",JSON.stringify(sleutel,null,1));
  fs.writeFileSync("paren.txt",paren.map(p=>"#"+p.nr+" ["+p.situatie+"]\nX: "+p.X+"\nY: "+p.Y+"\n").join("\n"));
  console.log(paren.length,"paren geschreven naar paren.txt (sleutel bewust niet getoond)");
}

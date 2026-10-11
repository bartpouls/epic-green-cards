const fs=require("fs");const {wereld}=require("./lib.js");const L=require("./load.js");
const W=wereld();const {e3,E,c}=W;
const md=fs.readFileSync(L.root+"/casus-uwi.md","utf8");const strip=t=>t.replace(/\*\*/g,"");
const s6=md.split(/^## /m).find(s=>s.startsWith("6. "));const l6=s6.split("\n");
const SP="spironolacton",LIS="V6:lisinopril:halveren",V8="V6:V8:875/125 mg 2 dd";
const cell=(pre,i)=>l6.find(l=>l.startsWith(pre)).split("|").map(x=>strip(x.trim()))[i];
const fbBron=id=>cell("| "+id+" | \"",2).replace(/^"|"$/g,"");
const P=[]; const add=(titel,bron,spel)=>P.push({titel,bron,spel});
// patiëntkaart
let st=E.nieuwSpel(c,"E3",{rng:()=>0});
add("Patiëntkaart kop+klachten",strip(l6.find(l=>l.startsWith("- **Mevrouw V."))).replace(/^- /,""),st.zichtbaar.kop+" "+st.zichtbaar.klachten);
add("Patiëntkaart medicatie",strip(l6.find(l=>l.startsWith("- **Medicatie:**"))).replace(/^- /,""),"Medicatie: "+st.zichtbaar.medicatieTekst);
add("Patiëntkaart lab",strip(l6.find(l=>l.startsWith("- **Lab:**"))).replace(/^- /,""),"Lab: "+st.zichtbaar.labTekst+" "+st.zichtbaar.risicogroep);
add("Toelichting spironolacton",strip(l6.find(l=>/Wie spironolacton heeft gestart/.test(l))).trim().replace(/^- /,""),e3.patient.toelichting);
{ const r=E.speelKaart(st,"G3"); const o=st.onthuld[0]; add("Onthulling G3",strip(l6.find(l=>l.startsWith("- **Verborgen achter G3:**"))).replace(/^- /,"").replace("Verborgen achter G3: ","").replace(/^/,""),o.tekst+". "+e3.patient.verborgen[0].toelichting); }
// gebeurtenissen als banner
function bannerTekst(id,order){ const s=W.speel([["G3","O1","V4"],["N1","O2","Ev2:"+SP],["B2:V4","Ev1","G1"],["N3"]],order,"direct"); const g=s.gebeurtenissen.find(x=>x.id===id); return g?e3.gebeurtenissen.find(x=>x.id===id).tekst:null; }
for(const id of ["A","B","C"]){ const r=l6.find(l=>l.startsWith("| "+id+" |")).split("|").map(x=>strip(x.trim())); add("Gebeurtenis "+id+" (inhoud)",r[3], bannerTekst(id,"AB")||bannerTekst(id,"BA")); }
// triggers en volgorde
for(const o of ["AB","BA"]){ const s=W.speel([["G3","O1","V4"],["N1","O2","Ev2:"+SP],["G1","G1","G1"],["G1"]],o,"direct"); const w=s.gebeurtenissen.map(g=>g.id+" na kaart "+g.naVolg+" (banner dag "+g.dag+")").join("; ");
  add("Triggers A/B/C, volgorde "+o,"A: Na kaart n (engine-parameter), volgorde met B willekeurig. B: Na kaart m, volgorde met A willekeurig. C: 3 kaarten na O1. (engine-parameters n,m: bouwopdracht 6.6: 4e en 7e kaart; O1 was kaart 2)", w); }
// feedbackvragen via foutroutes (eigen oplossingen, zie routes3-6)
const F={
 I1:{AB:[["G3","O1","V4"],["O2","Ev2:"+SP],["O1","B1:V8",V8],["Ev1","B3:"+SP,LIS],["N3"]],ids:["I1"]},
 I9:{AB:[["G3","O1","V4"],["N1"],["O1","B1:V8",V8],["Ev1","B3:"+SP,LIS],["N3"]]},
 I10:{AB:[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["Ev1"],["B3:"+SP,LIS,"N3"],["Ev1","Ev3"]]},
 I11:{AB:[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["B1:V8",V8],["Ev1","B3:"+SP,LIS],["N3"]]},
 I12:{AB:[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V9"],["Ev1","B3:"+SP,LIS],["N3"]]},
 I13:{AB:[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8"],["Ev1","B3:"+SP,LIS],["N3"]]},
 I14:{AB:[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7"],["Ev1","B3:"+SP,LIS],["N3","Ev3"]]},
 I15:{AB:[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8",V8],["Ev1","B3:"+SP,LIS]]},
 I16:{AB:[["G3","O1","V4"],["N1","O2","Ev2:"+SP],["B2:V4"],["Ev1","B3:"+SP,LIS],["N3"]]},
 I5:{AB:[["G3","O1","V3"],["N1","B1:V4","O2"],["O1","B1:V8",V8],["Ev2:"+SP,"Ev1","B3:"+SP],[LIS,"N3"]]},
 I8:{AB:[["G3","O1","V5"],[],["N1","O2","Ev2:"+SP],["V6:V5:halveren"],["Ev1","B3:"+SP,LIS],["N3","Ev3"]]},
 I4:{AB:[["G3","O1","V4"],["N1","V8",V8],["B2:V4"],["Ev1","O2","Ev2:"+SP],["B3:"+SP,LIS,"N3"]]},
};
const fb5=md.split(/^## /m).find(s=>s.startsWith("5. ")).split("\n"),s4=md.split(/^## /m).find(s=>s.startsWith("4. ")).split("\n");
const rij=(lines,pre)=>lines.find(l=>l.startsWith(pre)).split("|").map(x=>strip(x.trim()))[2].replace(/^"|"$/g,"");
const bronVraag={I1:rij(s4,"| I1 | \""),I4:rij(s4,"| I4 | \""),I5:rij(fb5,"| I5 | \""),I8:rij(fb5,"| I8 | \"")};
for(let i=9;i<=16;i++) bronVraag["I"+i]=fbBron("I"+i);
for(const id of Object.keys(F)){ const s=W.speel(F[id].AB,"AB","vol",true); if(s._fouten.length) throw new Error(id+" "+s._fouten); const sch=W.dataSchendingen(s);
  // vraag zoals het spel hem zou tonen: ernstigste (laagste ernst; gelijk: eerste in data)
  const obj=sch.map(x=>e3.invarianten.find(i=>i.id===x)); obj.sort((a,b)=>a.ernst-b.ernst||e3.invarianten.indexOf(a)-e3.invarianten.indexOf(b));
  add("Feedback "+id+" (route schendt precies: "+sch.join(",")+")",bronVraag[id],W.vraagVan(s,obj[0].id)); }
// zichtbaar als ontbreekt
function zicht(plan,order){ const s=W.speel(plan,order,"vol",true); return W.zicht(s).map(i=>e3.zichtbaarAlsOntbreekt[i].tekst).join(" | ")||"(niets)"; }
const zb=l6.filter(l=>/^- \*\*(Geen sick|Ciprofloxacine zonder|I9 gemist)/.test(l)).map(l=>strip(l).replace(/^- /,""));
add("Zichtbaar: geen sick day-maatregelen",zb[0],zicht([["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8",V8],["G1","G1"]],"AB"));
add("Zichtbaar: cipro zonder B4/B3",zb[1],zicht(F.I14.AB,"AB"));
add("Zichtbaar: I9 gemist",zb[2],zicht(F.I9.AB,"AB"));
// profielen
function uitkomst(plan,order){ const s=W.speel(plan,order,"vol",true); const p=e3.profielen.find(pp=>W.P.evalueer(pp.als,W.ctxVan(s))); return "poort: "+(W.dataSchendingen(s).length?"niet gehaald":"gehaald")+"; profiel: "+(p?p.naam:"geen")+"; duurzaamheid "+W.score(s,"duurzaamheid")+"; doelmatigheid "+W.score(s,"doelmatigheid")+"; reflectievraag: "+(p&&p.reflectievraag)+"; extra vragen: "+W.extra(s).join(" / "); }
add("Route amox/clav 875/125 (profiel)",strip(l6.find(l=>l.startsWith("| Amoxicilline/clavulaanzuur 875"))),uitkomst([["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8",V8],["Ev1","B3:"+SP,LIS],["N3"]],"AB"));
add("Route cipro + B4 (profiel)",strip(l6.find(l=>l.startsWith("| Ciprofloxacine met calcium"))),uitkomst([["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7","B4:V7"],["Ev1","B3:"+SP,LIS],["N3"]],"AB"));
add("Route cipro dan de-escalatie (score)",strip(l6.find(l=>l.startsWith("- **Duurzaamheid:**"))),uitkomst([["G3","O1","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V7","B4:V7"],["B1:V8",V8,"Ev1"],["B3:"+SP,LIS,"N3"]],"AB"));
add("Doelmatigheid G3 niet eerst",strip(l6.find(l=>l.startsWith("- **Doelmatigheid:**"))),uitkomst([["O1","G3","V4"],["N1","O2","Ev2:"+SP],["O1","B1:V8",V8],["Ev1","B3:"+SP,LIS],["N3"]],"AB"));
// invarianttabel rij
for(const id of ["I9","I14","I15","I16"]){ const r=l6.find(l=>l.startsWith("| "+id+" | ")&&!l.includes("\"")).split("|").map(x=>strip(x.trim())); const i=e3.invarianten.find(x=>x.id===id); add("Invariant-rij "+id,r.slice(1,5).join(" | "),[i.id,i.altijdFout,i.geldtInTekst,i.bron].join(" | ")); }
// shuffle
let seed=(Date.now()%100000)+17;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const key=[];let out="";
P.forEach((p,i)=>{ const bronIsX=rnd()<.5; key.push({n:i+1,titel:p.titel,X:bronIsX?"BRON":"SPEL",Y:bronIsX?"SPEL":"BRON"});
  out+="### Paar "+(i+1)+": "+p.titel+"\nX: "+(bronIsX?p.bron:p.spel)+"\nY: "+(bronIsX?p.spel:p.bron)+"\n\n"; });
fs.writeFileSync("s4r3_pairs.md",out);fs.writeFileSync("/home/user/epic-green-cards/gauntlet/rapporten/S4_r3.sleutel.json",JSON.stringify(key,null,1));
fs.writeFileSync("s4r3_key_private.json",JSON.stringify(key));
console.log(P.length+" paren geschreven");

const {laad}=require("./load.js");const fs=require("fs");
const sb=laad();const c=sb.CASUSSEN[0],E=sb.Engine;
const lab=id=>(c.kaarten.find(k=>k.id===id)||{}).label.toLowerCase();
function sp(ep,w){return E.nieuwSpel(c,ep,{rng:()=>w});}
function spel(s,ks){ks.forEach(k=>{if(k==="|")E.volgendeDag(s);else{const [id,d,o]=k.split(":");const r=E.speelKaart(s,id,{doel:d||null,optie:o||null});if(!r.ok)throw new Error(k+" "+r.fout);}});return s;}
const stat=(s,d)=>{const k=s.klachten[d];return k.status===null?"geen status":k.tekst;};
const gebTxt=s=>s.gebeurtenissen.map(g=>g.id+" op dag "+g.dag+" na kaart "+g.naVolg).join("; ")||"geen gebeurtenis";
const ls=a=>a.map(lab).sort().join(", ");
const P=[];
// 1
{const s=sp("E2",0);const v=s.zichtbaar.labTekst;spel(s,["G1"]);const a=s.zichtbaar.labTekst;const r=E.speelKaart(s,"G2");
 P.push({o:"E2 verborgen eGFR",sit:"E2: G1, daarna G2 spelen",
  bron:{"lab op kaart vóór G2":"laatst bekende eGFR 42, van 6 jaar geleden","lab op kaart na G1":"laatst bekende eGFR 42, van 6 jaar geleden","lab op kaart na G2":"eGFR 29 uit de jaarlijkse controle","ware eGFR":"29"},
  spel:{"lab op kaart vóór G2":v,"lab op kaart na G1":a,"lab op kaart na G2":s.zichtbaar.labTekst,"ware eGFR":String(c.episodes[1].patient.waar.eGFR)}});}
// 2
{const s=spel(sp("E2",0),["G1","G2","O1","|","V4"]);const voor=gebTxt(s);spel(s,["|"]);
 P.push({o:"E2 kweekuitslag",sit:"E2: G1 G2 O1 | V4 (4e kaart) | volgende dag",
  bron:{"na de 4e kaart, zelfde dag":"geen gebeurtenis","begin volgende dag":"C op dag 3 na kaart 4","resistent":"trimethoprim, amoxicilline","gevoelig":"amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine, nitrofurantoïne"},
  spel:{"na de 4e kaart, zelfde dag":voor,"begin volgende dag":gebTxt(s),"resistent":ls(s.sets.resistent),"gevoelig":ls(s.sets.gevoelig)}});}
// 3
{const a=spel(sp("E2",0),["G1","G2","V4","|","N1","O1","|"]);const b=spel(sp("E2",0),["G1","G2","V4","|","N1","N1","|"]);const d=spel(sp("E2",0),["G1","G2","V4","|","O1","|"]);
 P.push({o:"E2 kweekuitslag alleen met O1",sit:"E2: drie spellen: (a) G1 G2 V4 | N1 O1 | (O1 is kaart 5), (b) G1 G2 V4 | N1 N1 | (nooit O1), (c) G1 G2 V4 | O1 | (O1 is kaart 4)",
  bron:{"(a) O1 als 5e kaart":"geen gebeurtenis","(b) nooit O1":"geen gebeurtenis","(c) O1 als 4e kaart":"C op dag 3 na kaart 4"},
  spel:{"(a) O1 als 5e kaart":gebTxt(a),"(b) nooit O1":gebTxt(b),"(c) O1 als 4e kaart":gebTxt(d)}});}
// 4
{const t=spel(sp("E2",0),["G2","O1","V5","|","O2","N1","|","B1:V4","|"]);const f=spel(sp("E2",0),["G2","O1","V4","|","|"]);
 P.push({o:"E2 wat de patiënt laat zien",sit:"E2: (t) G2 O1 V5 | O2 N1 | B1 naar fosfomycine | ; (f) G2 O1 V4 | |",
  bron:{"(t) dag 2":"klachten houden aan","(t) dag 3":"klachten houden aan","(t) dag 4 (na B1 naar fosfomycine)":"klachten nemen af","(f) dag 2":"klachten nemen af","(f) dag 3":"klachten nemen af"},
  spel:{"(t) dag 2":stat(t,2),"(t) dag 3":stat(t,3),"(t) dag 4 (na B1 naar fosfomycine)":stat(t,4),"(f) dag 2":stat(f,2),"(f) dag 3":stat(f,3)}});}
// 5
{const s=spel(sp("E3",0),["G3","G1","O1","|","V4","N1","Ev1","|"]);
 P.push({o:"E3 kweekuitslag 3 kaarten na O1",sit:"E3 (A/B-trekking AB): G3 G1 O1 | V4 N1 Ev1 | (O1 is kaart 3)",
  bron:{"gebeurtenissen begin dag 3":"A op dag 3 na kaart 4; C op dag 3 na kaart 6","resistent":"trimethoprim, amoxicilline","gevoelig":"amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine, nitrofurantoïne"},
  spel:{"gebeurtenissen begin dag 3":gebTxt(s),"resistent":ls(s.sets.resistent),"gevoelig":ls(s.sets.gevoelig)}});}
// 6
{const a=spel(sp("E3",0),["G3","G1","O1","|","V4","N1","|"]),b=spel(sp("E3",0.99),["G3","G1","O1","|","V4","N1","|"]);
 const a2=spel(sp("E3",0),["G3","G1","O1","|","V4","N1","|","N3","Ev1","B3:calcium","|","V6:V4:x"].slice(0,7));
 P.push({o:"E3 A/B-volgorde per poging",sit:"E3: dezelfde zetten G3 G1 O1 | V4 N1 | in twee pogingen met verschillende trekking",
  bron:{"poging 1 (volgorde A,B): eerste gebeurtenis na kaart n=4":"A op dag 3 na kaart 4","poging 2 (volgorde B,A): eerste gebeurtenis na kaart 4":"B op dag 3 na kaart 4"},
  spel:{"poging 1 (volgorde A,B): eerste gebeurtenis na kaart n=4":gebTxt(a).split("; ").filter(x=>/na kaart 4/.test(x)).join("; "),"poging 2 (volgorde B,A): eerste gebeurtenis na kaart 4":gebTxt(b).split("; ").filter(x=>/na kaart 4/.test(x)).join("; ")}});}
// 7
{const s=spel(sp("E3",0),["G3","O1","V4","|","N1","|","|","|"]);
 P.push({o:"E3 48-uursstatus",sit:"E3 (A na kaart 4, banner dag 3): G3 O1 V4 | N1 | | |  (fosfomycine bij weefselinvasie)",
  bron:{"dag 2":"klachten nemen af","dag 3":"klachten houden aan","dag 4":"klachten houden aan","dag 5":"Na 48 uur geen verbetering."},
  spel:{"dag 2":stat(s,2),"dag 3":stat(s,3),"dag 4":stat(s,4),"dag 5":stat(s,5)}});}
// 8
{const s=sp("E3",0);const r0=E.raadpleeg(s);const a1=s.actiesOver;spel(s,["G3","G1"]);const r=E.speelKaart(s,"O1");const e1=sp("E1",0);E.raadpleeg(e1);
 P.push({o:"Raadplegen kost tempo",sit:"E3: raadplegen, dan G3 G1 O1 op dezelfde dag; E1: raadplegen",
  bron:{"E3 acties na raadplegen":"2","E3 derde kaart O1 op dezelfde dag":"geweigerd: geen acties meer","E3 volg van G3":"1","E1 acties na raadplegen":"3"},
  spel:{"E3 acties na raadplegen":String(a1),"E3 derde kaart O1 op dezelfde dag":r.ok?"toegestaan":"geweigerd: "+(/geen acties/.test(r.fout)?"geen acties meer":r.fout),"E3 volg van G3":String(s.tijdlijn[0].volg),"E1 acties na raadplegen":String(e1.actiesOver)}});}
// 9
{const s=sp("E2",0);const r1=E.speelKaart(s,"V6",{doel:"V5",optie:"halveren"});spel(s,["V5"]);const r2=E.speelKaart(s,"V6",{doel:"V5"});const r3=E.speelKaart(s,"V6",{doel:"V5",optie:"halveren"});const vl=n=>n.ok?"toegestaan":"geweigerd";
 P.push({o:"V6 doel/optie",sit:"E2: V6 halveren op trimethoprim vóór V5; dan V5; dan V6 op V5 zonder optie; dan V6 met halveren",
  bron:{"V6 vóór start V5":"geweigerd","V6 zonder optie":"geweigerd","V6 met optie halveren":"toegestaan","tijdlijn na afloop":"V5, V6 (trimethoprim, halveren)"},
  spel:{"V6 vóór start V5":vl(r1),"V6 zonder optie":vl(r2),"V6 met optie halveren":vl(r3),"tijdlijn na afloop":s.tijdlijn.map(r=>r.kaart+(r.doel?" ("+(r.doel==="V5"?"trimethoprim":r.doel)+", "+r.optie+")":"")).join(", ").replace("V6 (trimethoprim, halveren)","V6 (trimethoprim, halveren)")}});}
// 10
{const s=sp("E3",0);const v=s.zichtbaar.eerdereKweek||"niet zichtbaar";const r=E.speelKaart(s,"G3");const e1=spel(sp("E1",0),["G2"]);
 P.push({o:"Onthullen E3 G3",sit:"E3: G3 spelen",
  bron:{"patiëntkaart vóór G3":"niet zichtbaar","onthuld door G3":"de kweek uit episode 2, met trimethoprim resistent","patiëntkaart na G3":"de kweek uit episode 2, met trimethoprim resistent"},
  spel:{"patiëntkaart vóór G3":v,"onthuld door G3":r.onthuld[0].tekst,"patiëntkaart na G3":s.zichtbaar.eerdereKweek}});}
// 11
{const g=[{episodeId:"E1",geschonden:["I1"]}];const g2=g.concat([{episodeId:"E1",geschonden:[]}]);
 P.push({o:"Episodes ontgrendelen",sit:"Pogingen-lijst: leeg; E1 met schending I1; daarna E1 zonder schending",
  bron:{"open bij geen pogingen":"E1","open na E1 met schending":"E1","open na E1 zonder schending":"E1, E2"},
  spel:{"open bij geen pogingen":E.ontgrendeldeEpisodes(c,[]).join(", "),"open na E1 met schending":E.ontgrendeldeEpisodes(c,g).join(", "),"open na E1 zonder schending":E.ontgrendeldeEpisodes(c,g2).join(", ")}});}
// 12
{const s=sp("E1",0);for(let i=0;i<4;i++)E.volgendeDag(s);const d4=s.dag;E.volgendeDag(s);const r=E.speelKaart(s,"G1");
 P.push({o:"Einde van de episode",sit:"E1 (5 dagen): 5x Volgende dag, daarna een kaart proberen",
  bron:{"dag na 4x":"5","dag na 5x":"5","einde bereikt":"ja","kaart daarna":"geweigerd"},
  spel:{"dag na 4x":String(d4),"dag na 5x":String(s.dag),"einde bereikt":E.eindeBereikt(s)?"ja":"nee","kaart daarna":r.ok?"toegestaan":"geweigerd"}});}
// 13: E1 ontbrekend repertoire
{const s=sp("E1",0);const r1=E.speelKaart(s,"V6",{doel:"V5",optie:"halveren"});const r2=E.speelKaart(s,"G3");const n=c.episodes[0].repertoire.length;
 P.push({o:"Repertoire E1",sit:"E1: V6 en G3 proberen (niet in het kleine repertoire van 12 kaarten)",
  bron:{"V6 in E1":"geweigerd: niet in repertoire","G3 in E1":"geweigerd: niet in repertoire","kaarten in repertoire":"12","acties over na twee mislukte zetten":"3"},
  spel:{"V6 in E1":r1.ok?"toegestaan":"geweigerd: "+(/repertoire/.test(r1.fout)?"niet in repertoire":r1.fout),"G3 in E1":r2.ok?"toegestaan":"geweigerd: "+(/repertoire/.test(r2.fout)?"niet in repertoire":r2.fout),"kaarten in repertoire":String(n),"acties over na twee mislukte zetten":String(s.actiesOver)}});}
const render=w=>Object.keys(w).map(k=>"  - "+k+": "+w[k]).join("\n");
const sleutel={},uit=[],diffs={};
P.forEach((p,i)=>{const id=i+1;const bronX=Math.random()<.5;sleutel[id]={X:bronX?"bron":"spel",Y:bronX?"spel":"bron"};
 uit.push({id,o:p.o,sit:p.sit,X:render(bronX?p.bron:p.spel),Y:render(bronX?p.spel:p.bron)});
 diffs[id]=Object.keys(p.bron).filter(k=>p.bron[k]!==p.spel[k]).map(k=>({sleutel:k,bron:p.bron[k],spel:p.spel[k]}));});
fs.writeFileSync("/home/user/epic-green-cards/gauntlet/rapporten/S7_r2.sleutel.json",JSON.stringify({toewijzing:sleutel},null,1));
fs.writeFileSync(process.argv[2]+"/diffs.json",JSON.stringify(diffs,null,1)); // niet openen voor ab.md af is
fs.writeFileSync(process.argv[2]+"/paren2.json",JSON.stringify(uit,null,1));
uit.forEach(p=>console.log("### Paar "+p.id+" — "+p.o+"\nSituatie: "+p.sit+"\nX:\n"+p.X+"\nY:\n"+p.Y+"\n"));

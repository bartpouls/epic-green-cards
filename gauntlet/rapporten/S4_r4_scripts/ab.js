// BLINDE A/B: bron (casus-uwi.md, eigen extractie) vs spel (echte Engine/Evaluatie-uitvoer voor dezelfde situatie). X/Y willekeurig; sleutel naar S4_r4.sleutel.json.
const fs=require("fs");const L=require("./load.js");const {speel}=require("./speel.js");const {R,BASE}=require("./routes.js");
const md=fs.readFileSync(L.root+"/casus-uwi.md","utf8");const strip=s=>s.replace(/\*\*/g,"").replace(/\*([^*]+)\*/g,"$1");
const lines=md.split("\n");const s6=lines.slice(lines.findIndex(l=>l.startsWith("## 6.")),lines.findIndex(l=>l.startsWith("## 7.")));
const cel=l=>l.split("|").slice(1,-1).map(s=>strip(s.trim()));
const fb={};s6.filter(l=>/^\| (I\d+|Automatische herstart|Ciprofloxacine-dosis|Profiel ciprofloxacine)/.test(l)&&/\| ".*" \|$/.test(l)).forEach(l=>{const r=cel(l);fb[r[0]]=r[1].replace(/^"|"$/g,"");});
const ev={};s6.filter(l=>/^\| [ABC] \|/.test(l)).forEach(l=>{const r=cel(l);ev[r[0]]=r[2];});
const zi=s6.filter(l=>/^- \*\*(Geen sick|Ciprofloxacine zonder|I9 gemist)/.test(l)).map(l=>strip(l).match(/"([^"]+)"/)[1]);
const pk=s6.filter(l=>/^- \*\*(Mevrouw|Medicatie|Lab|Verborgen)/.test(l)).map(strip);
const sb=L.laad();const c=sb.CASUSSEN[0];const E=sb.Engine;
function run(id,ord){ const r=R.find(x=>x.id.startsWith(id)); return speel(sb,r.plan[ord],ord,{}); }
const s0=E.nieuwSpel(c,"E3",{rng:()=>0});const z=s0.zichtbaar;
const pairs=[];
const P=(naam,bron,spel)=>pairs.push({naam,bron,spel});
P("Patiëntkaart (kop, klachten)",pk[0].replace(/^- /,""),z.kop+" "+z.klachten);
P("Patiëntkaart (medicatie)",pk[1].replace(/^- Medicatie: /,""),z.medicatieTekst);
P("Patiëntkaart (lab zoals de student het ziet)",pk[2].replace(/^- Lab: /,"").replace(/ Risicogroep \[NHG\]\.$/,""),z.labTekst);
const sg=E.nieuwSpel(c,"E3",{rng:()=>0});E.speelKaart(sg,"G3");
P("Verborgen achter G3 (onthuld)",pk[3].replace(/^- Verborgen achter G3: /,"").replace(/ Die valt.*$/,""),sg.onthuld[0].tekst);
const sAB=run("V1","AB"),sBA=run("V1","BA");
const tekstVan=(s,id)=>c.episodes.find(e=>e.id==="E3").gebeurtenissen.find(g=>g.id===id).tekst; // bannertekst zoals UI/engine uit de data toont
P("Banner A (weefselinvasie)",ev.A,tekstVan(sAB,"A"));
P("Banner B (uitdroging)",ev.B,tekstVan(sAB,"B"));
P("Banner C (kweekuitslag)",ev.C,tekstVan(sAB,"C"));
const vr={}; // vragen via echte foutroutes
[["I9 geen O2","I9"],["I10 V4","I10"],["I11 wisselen","I11"],["I12 cotri","I12"],["I13 V8 zonder","I13"],["I14 cipro zonder","I14"],["I15 zonder N3","I15"],["I16 geen verwijzing","I16"]].forEach(([pre,id])=>{ vr[id]=run(pre,"AB").uitkomst.vraag; });
["I9","I10","I11","I12","I13","I14","I15","I16"].forEach(id=>P("Socratische vraag "+id+" (echte foutroute, Evaluatie)",fb[id],vr[id]));
const uc=run("V2","AB").uitkomst;
P("Reflectievraag profiel ciprofloxacine (Evaluatie)",fb["Profiel ciprofloxacine"],uc.profiel.reflectievraag);
P("Feedback Ciprofloxacine-dosis (extraVragen)",fb["Ciprofloxacine-dosis (bronconflict)"],uc.extraVragen[0].vraag);
P("Feedback Automatische herstart (extraVragen)",fb["Automatische herstart"],run("V6","AB").uitkomst.extraVragen[0].vraag);
const zz=run("I9 geen O2","AB").uitkomst.zichtbaar.map(x=>x.tekst||x); P("Zichtbaar als kaart ontbreekt: I9 gemist",zi[2],zz[0]);
const zc=run("I14 cipro zonder","AB").uitkomst.zichtbaar.map(x=>x.tekst||x); P("Zichtbaar als kaart ontbreekt: ciprofloxacine zonder B4/B3",zi[1],zc[0]);
const ss=run("I16 geen verwijzing","AB"); const st=c.episodes.find(e=>e.id==="E3").statusTeksten;
P("Statustekst af / aan / geen verbetering",["klachten nemen af.","klachten houden aan.","Na 48 uur geen verbetering."].join(" | "),[st.af,st.aan,st.geenVerbetering48].join(" | "));
// willekeurige toewijzing
let seed=20261011;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const uit=[],sleutel=[];
pairs.forEach((p,i)=>{const bronX=rnd()<.5; uit.push({nr:i+1,naam:p.naam,X:bronX?p.bron:p.spel,Y:bronX?p.spel:p.bron}); sleutel.push({nr:i+1,X:bronX?"bron":"spel",Y:bronX?"spel":"bron"});});
fs.writeFileSync(L.root+"/gauntlet/rapporten/S4_r4.sleutel.json",JSON.stringify(sleutel,null,1));
fs.writeFileSync(__dirname+"/pairs.json",JSON.stringify(uit,null,1));
uit.forEach(p=>{console.log("["+p.nr+"] "+p.naam+"\n  X: "+JSON.stringify(p.X)+"\n  Y: "+JSON.stringify(p.Y));});

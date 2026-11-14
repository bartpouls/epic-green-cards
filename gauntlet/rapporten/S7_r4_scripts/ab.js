const {laad}=require("./laad.js");const fs=require("fs");
const sb=laad();const E=sb.Engine,c=sb.CASUSSEN[0];
const J=x=>JSON.stringify(x);
function sp(s,k,o){const r=E.speelKaart(s,k,o||{});if(!r.ok)throw new Error(k+": "+r.fout);return r;}
function nw(ep,w){return E.nieuwSpel(c,ep,{rng:()=>w});}
const paren=[];
function P(onderwerp,bron,spel){paren.push({onderwerp,bron,spel});}
// 1
{const s=nw("E3",0);["G1","G2","N1"].forEach(k=>sp(s,k));E.volgendeDag(s);sp(s,"N3");E.volgendeDag(s);P("E3 A/B-volgorde, rng laag","Gebeurtenis A (weefselinvasie) na de 4e gespeelde kaart; banner begin volgende dag. Dag 1: 3 kaarten, dag 2: kaart 4 -> A verschijnt op dag 3.","gebeurtenissen: "+s.gebeurtenissen.map(g=>g.id+" dag "+g.dag+" na kaart "+g.naVolg).join("; ")+"; toestanden: "+s.toestanden.join(","));}
// 2
{const s=nw("E3",0.99);["G1","G2","N1"].forEach(k=>sp(s,k));E.volgendeDag(s);sp(s,"N3");E.volgendeDag(s);P("E3 A/B-volgorde, rng hoog (omgekeerd)","Volgorde van A en B per poging willekeurig: bij de omgekeerde trekking activeert de eerste trigger (kaart 4) gebeurtenis B (uitdroging), banner op dag 3.","gebeurtenissen: "+s.gebeurtenissen.map(g=>g.id+" dag "+g.dag+" na kaart "+g.naVolg).join("; ")+"; toestanden: "+s.toestanden.join(","));}
// 3
{const s=nw("E3",0);sp(s,"G1");sp(s,"O1");sp(s,"N1");E.volgendeDag(s);sp(s,"N3");sp(s,"G2");const w1=s.wachtend.map(x=>x.id).join(",");sp(s,"Ev1");E.volgendeDag(s);P("E3 C: 3 kaarten na O1","O1 is kaart 2; C (kweekuitslag) 3 kaarten later = na kaart 5, banner begin volgende dag. Eerder (na kaart 4) staat alleen A te wachten.","na kaart 4 wachtend: "+(w1||"-")+"; daarna gebeurtenissen: "+s.gebeurtenissen.map(g=>g.id+"@dag"+g.dag+"/kaart"+g.naVolg).join(", "));}
// 4
{const s=nw("E2",0);for(let i=0;i<3;i++)sp(s,["G1","N1","Ev1"][i]);E.volgendeDag(s);sp(s,"O1");sp(s,"V4");E.volgendeDag(s);P("E2 C alleen als O1 gespeeld, 4e kaart","Kweekuitslag na de 4e gespeelde kaart, alleen als O1 gespeeld is. Kaarten: G1,N1,Ev1,O1: O1 is kaart 4, 4e kaart -> C wacht, verschijnt volgende dag.","gebeurtenissen: "+J(s.gebeurtenissen)+" sets.resistent="+J(s.sets.resistent));}
// 5
{const s=nw("E2",0);for(const k of ["G1","N1","Ev1"])sp(s,k);E.volgendeDag(s);sp(s,"V4");E.volgendeDag(s);P("E2 zonder O1 geen kweekuitslag","Zonder O1 geen kweekuitslag: de 4e kaart (V4) triggert niets.","gebeurtenissen: "+J(s.gebeurtenissen)+" wachtend: "+J(s.wachtend));}
// 6
{const s=nw("E2",0);const voor=s.zichtbaar.eGFR!==undefined?s.zichtbaar.eGFR:J(s.zichtbaar).slice(0,100);const r=sp(s,"G2");P("E2 G2 onthult verborgen eGFR","Verborgen achter G2: eGFR 29 (uit de jaarlijkse controle). Op de kaart staat daarvoor 'laatst bekende eGFR 42, van 6 jaar geleden'; de regels rekenen altijd met de ware waarde 29.","voor G2 zichtbaar: "+J(voor)+"; onthuld: "+r.onthuld.map(o=>o.kaart+" "+o.sleutel+"="+o.waarde).join(";")+"; zichtbaar nu: "+J(s.zichtbaar).slice(0,160)+"; waar.eGFR="+J(c.episodes[1].patient.waar.eGFR));}
// 7
{const s=nw("E3",0);const r=sp(s,"G3");P("E3 G3 onthult eerdere kweek","Verborgen achter G3: de kweek uit episode 2, trimethoprim resistent. Pas zichtbaar na G3.","onthuld: "+r.onthuld.map(o=>o.kaart+": "+(o.tekst||"").slice(0,90)).join(" | "));}
// 8
{const s=nw("E2",0);sp(s,"O1");sp(s,"V5");sp(s,"N1");E.volgendeDag(s);P("E2 trimethoprim: klachten houden aan (dag 2)","Trimethoprim in E2 (resistent): klachten houden aan.","dag 2 status: "+s.klachten[2].status+" tekst: "+J(s.klachten[2].tekst));}
// 9
{const s=nw("E2",0);sp(s,"O1");sp(s,"V4");sp(s,"N1");E.volgendeDag(s);P("E2 fosfomycine: klachten nemen af (dag 2)","Fosfomycine in E2: klachten nemen af.","dag 2 status: "+s.klachten[2].status+" tekst: "+J(s.klachten[2].tekst));}
// 10
{const s=nw("E3",0);sp(s,"G1");sp(s,"V4");sp(s,"N1");E.volgendeDag(s);sp(s,"O1");sp(s,"Ev1");sp(s,"N3");E.volgendeDag(s);E.volgendeDag(s);E.volgendeDag(s);P("E3 A op dag 3 met fosfomycine: 48 uur geen verbetering","A (kaart 4) verschijnt dag 3; fosfomycine bereikt het weefsel niet: geen werkzaam antibioticum aan het eind van dag 3 (dA+0) en dag 4 (dA+1) -> dag 5 = dA+2: 'Na 48 uur geen verbetering.' Dag 3 en 4: klachten houden aan.","statussen dag 2..5: "+[2,3,4,5].map(d=>d+":"+s.klachten[d].status).join(" ")+"; tekst dag 5: "+J(s.klachten[5].tekst)+"; A op dag "+(s.gebeurtenissen.find(g=>g.id==="A")||{}).dag);}
// 11
{const s=nw("E1",0);const a=E.raadpleeg(s);const t=nw("E3",0);const b=E.raadpleeg(t);P("raadplegen kost","Richtlijn raadplegen kost in E1 niets (3 acties blijven), in E3 1 actie (2 over).","E1: kost "+a.kost+" acties over "+s.actiesOver+"; E3: kost "+b.kost+" acties over "+t.actiesOver);}
// 12
{const s=nw("E1",0);for(const k of ["G1","G2","N1"])sp(s,k);const r=E.speelKaart(s,"N2",{doel:"V3"});P("Vierde kaart op een dag","Maximaal actiesPerBeurt (3) kaarten per dag; een vierde kaart wordt geweigerd, de tijdlijn blijft 3 regels en volgende dag herstelt het budget.","vierde: ok="+r.ok+(r.fout?" ("+r.fout+")":"")+"; tijdlijn="+s.tijdlijn.length+"; na volgende dag acties="+(E.volgendeDag(s),s.actiesOver));}
// 13
{const s=nw("E2",0);sp(s,"V5");const r1=E.speelKaart(s,"V6",{doel:"V5"});const r2=E.speelKaart(s,"V6",{doel:"V5",optie:"verzonnen"});P("V6 vereist doel én optie","V6 vraagt om een doel en een optie; zonder optie of met een onbekende optie wordt de zet niet gespeeld.","zonder optie: ok="+r1.ok+" "+J(r1.fout)+"; onbekende optie: ok="+r2.ok+" "+J(r2.fout)+"; tijdlijn="+s.tijdlijn.length);}
// 14
{const eps=c.episodes.map(e=>e.id);const a=E.ontgrendeldeEpisodes(c,[]);const b=E.ontgrendeldeEpisodes(c,[{casusId:c.id,episodeId:"E1",geschonden:[]}]);const d=E.ontgrendeldeEpisodes(c,[{casusId:c.id,episodeId:"E1",geschonden:["I1"]}]);P("Episodes ontgrendelen","Episode n+1 pas open als n gehaald: zonder gehaalde episode alleen E1; na gehaalde E1 ook E2; E1 met schending opent E2 niet.","niets gehaald: "+a.join(",")+"; E1 gehaald: "+b.join(",")+"; E1 geschonden: "+d.join(","));}
// toewijzing willekeurig
const sl=[];const uit=paren.map((p,i)=>{const bronIsX=Math.random()<0.5;sl.push({paar:i+1,X:bronIsX?"bron":"spel",Y:bronIsX?"spel":"bron"});return "### Paar "+(i+1)+" - "+p.onderwerp+"\nX: "+(bronIsX?p.bron:p.spel)+"\nY: "+(bronIsX?p.spel:p.bron)+"\n";});
fs.writeFileSync("/home/user/epic-green-cards/gauntlet/rapporten/S7_r4.sleutel.json",JSON.stringify(sl,null,1));
fs.writeFileSync("paren.txt",uit.join("\n"));
console.log(uit.join("\n"));

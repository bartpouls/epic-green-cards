require("./load.js");const fs=require("fs");
const c=CASUSSEN[0];const rng0=()=>0, rng9=()=>0.99;
const sp=(s,k,o)=>Engine.speelKaart(s,k,o), dag=s=>Engine.volgendeDag(s);
const P=[];
// feiten: [label, bronwaarde, spelFn]
function paar(titel,feiten){P.push({titel,feiten})}
const nieuw=(e,w)=>Engine.nieuwSpel(c,e,{rng:w||rng0});
paar("Richtlijn raadplegen (E1, E3)",[
 ["Kosten raadplegen E1 in acties","0",()=>{const s=nieuw("E1");return String(Engine.raadpleeg(s).kost)}],
 ["Kosten raadplegen E3 in acties","1",()=>{const s=nieuw("E3");return String(Engine.raadpleeg(s).kost)}]]);
paar("Acties per beurt",[
 ["Acties per beurt E1","3",()=>String(nieuw("E1").actiesOver)],
 ["Vierde kaart op één dag toegestaan?","nee",()=>{const s=nieuw("E1");sp(s,"G1");sp(s,"G2");sp(s,"V1");return sp(s,"O1").ok?"ja":"nee"}]]);
paar("E2 kweekuitslag C met O1",[
 ["Trigger C","na de 4e gespeelde kaart",()=>{const s=nieuw("E2");sp(s,"O1");sp(s,"G1");sp(s,"G2");dag(s);sp(s,"N1");return "na de "+s.gebeurtenissen.concat(s.wachtend)[0].naVolg+"e gespeelde kaart"}],
 ["Banner verschijnt op dag","3 (kaart 4 valt op dag 2, banner begin volgende dag)",()=>{const s=nieuw("E2");sp(s,"O1");sp(s,"G1");sp(s,"G2");dag(s);sp(s,"N1");dag(s);return s.gebeurtenissen[0].dag+" (kaart "+s.gebeurtenissen[0].naVolg+" valt op dag 2, banner begin volgende dag)"}]]);
paar("E2 kweekuitslag C zonder O1",[
 ["Aantal gebeurtenissen na 5 kaarten zonder O1","0",()=>{const s=nieuw("E2");sp(s,"G1");sp(s,"G2");sp(s,"V1");dag(s);sp(s,"N1");sp(s,"N2",{});dag(s);return String(s.gebeurtenissen.length+s.wachtend.length)}]]);
paar("E3 volgorde A en B",[
 ["Volgorde bij rng laag","A,B",()=>nieuw("E3",rng0).volgordeAB.join(",")],
 ["Volgorde bij rng hoog","B,A",()=>nieuw("E3",rng9).volgordeAB.join(",")],
 ["Kaart waarna de eerste van de groep komt","4",()=>{const s=nieuw("E3");for(const k of ["G3","O1","N1"])sp(s,k);dag(s);sp(s,"N3");return String(s.wachtend[0].naVolg)}]]);
paar("E3 kweekuitslag C: 3 kaarten na O1",[
 ["O1 is kaart nummer","2",()=>{const s=nieuw("E3");sp(s,"G3");sp(s,"O1");return String(s.tijdlijn[1].volg)}],
 ["C komt na kaart nummer","5",()=>{const s=nieuw("E3");sp(s,"G3");sp(s,"O1");sp(s,"N1");dag(s);sp(s,"N3");sp(s,"G1");const w=s.wachtend.filter(x=>x.id==="C")[0];return w?String(w.naVolg):"geen"}]]);
paar("E2 patiëntreactie op de keuze",[
 ["Na trimethoprim (V5)","klachten houden aan.",()=>{const s=nieuw("E2");sp(s,"V5");dag(s);return s.klachten[2].tekst}],
 ["Na fosfomycine (V4)","klachten nemen af.",()=>{const s=nieuw("E2");sp(s,"V4");dag(s);return s.klachten[2].tekst}]]);
paar("E3 weefselinvasie: geen verbetering",[
 ["Toestand na A","weefselinvasie",()=>{const s=nieuw("E3");sp(s,"V4");sp(s,"O1");sp(s,"N1");dag(s);sp(s,"G3");dag(s);return s.toestanden[s.toestanden.length-1]}],
 ["Status dag 5 met fosfomycine (V4) tot dag 5","Na 48 uur geen verbetering.",()=>{const s=nieuw("E3");sp(s,"V4");sp(s,"O1");sp(s,"N1");dag(s);sp(s,"G3");dag(s);dag(s);dag(s);return s.klachten[5].tekst}]]);
paar("E3 ciprofloxacine na A",[
 ["Zonder B4/B3, dag 5","Na 48 uur geen verbetering.",()=>{const s=nieuw("E3");sp(s,"V7");sp(s,"O1");sp(s,"N1");dag(s);sp(s,"G3");dag(s);dag(s);dag(s);return s.klachten[5].tekst}],
 ["Met B4, dag 5","klachten nemen af.",()=>{const s=nieuw("E3");sp(s,"V7");sp(s,"O1");sp(s,"B4",{doel:"V7"});dag(s);sp(s,"G3");dag(s);dag(s);dag(s);return s.klachten[5].tekst}]]);
paar("Verborgen gegeven G2 (E2)",[
 ["Zichtbaar vóór G2","nee",()=>{const s=nieuw("E2");return JSON.stringify(s.zichtbaar).indexOf("29")>=0?"ja":"nee"}],
 ["Tekst na G2","eGFR 29 uit de jaarlijkse controle.",()=>{const s=nieuw("E2");return sp(s,"G2").onthuld[0].tekst}],
 ["Ware eGFR (ongewijzigd, voor de regels)","29",()=>{const s=nieuw("E2");return String(s.zichtbaar&&c.episodes[1].patient.waar.eGFR)}]]);
paar("V6 vraagt doel én optie",[
 ["V6 zonder optie gespeeld?","nee",()=>{const s=nieuw("E2");sp(s,"V5");return sp(s,"V6",{doel:"V5"}).ok?"ja":"nee"}],
 ["V6 met doel en optie halveren gespeeld?","ja",()=>{const s=nieuw("E2");sp(s,"V5");dag(s);dag(s);dag(s);return sp(s,"V6",{doel:"V5",optie:"halveren"}).ok?"ja":"nee"}]]);
paar("Episodes ontgrendelen",[
 ["E2 vóór het halen van E1","dicht",()=>Engine.ontgrendeld(c,"E2",[])?"open":"dicht"],
 ["E2 nadat E1 gehaald is","open",()=>Engine.ontgrendeld(c,"E2",[{casusId:c.id,episodeId:"E1",poortGehaald:true}])?"open":"dicht"],
 ["E3 nadat alleen E1 gehaald is","dicht",()=>Engine.ontgrendeld(c,"E3",[{casusId:c.id,episodeId:"E1",poortGehaald:true}])?"open":"dicht"]]);
paar("Opnieuw spelen en einde",[
 ["Na Opnieuw: dag, aantal kaarten","1, 0",()=>{const s=nieuw("E1");sp(s,"G1");Engine.rondAf(s);const h=Engine.herkansing(s);return h.dag+", "+h.tijdlijn.length}],
 ["E1 na 5 dagen: einde bereikt","ja",()=>{const s=nieuw("E1");for(let i=0;i<5;i++)dag(s);return Engine.eindeBereikt(s)?"ja":"nee"}]]);
const rand=(()=>{let z=20261012;return()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296}})();
const uit=[],sleutel={},verschillen=[];
P.forEach((p,i)=>{const bron=p.feiten.map(f=>f[0]+": "+f[1]);const spel=p.feiten.map(f=>{let v;try{v=f[2]()}catch(e){v="FOUT "+e.message}return f[0]+": "+v});
 const bronX=rand()<0.5;const X=bronX?bron:spel,Y=bronX?spel:bron;sleutel["paar"+(i+1)]={X:bronX?"bron":"spel",Y:bronX?"spel":"bron"};
 uit.push("## Paar "+(i+1)+": "+p.titel+"\n\nX:\n"+X.map(t=>"- "+t).join("\n")+"\n\nY:\n"+Y.map(t=>"- "+t).join("\n")+"\n");
 bron.forEach((b,j)=>{if(b!==spel[j])verschillen.push("paar "+(i+1)+": bron '"+b+"' / spel '"+spel[j]+"'")})});
fs.writeFileSync("ab_paren.md",uit.join("\n"));fs.writeFileSync("/home/user/epic-green-cards/gauntlet/rapporten/S7_r5.sleutel.json",JSON.stringify(sleutel,null,1));
fs.writeFileSync("ab_verschillen.txt",verschillen.join("\n"));

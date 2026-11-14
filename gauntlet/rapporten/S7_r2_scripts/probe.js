const {laad}=require("./load.js");const fs=require("fs"),vm=require("vm");
const sb=laad();vm.runInContext(fs.readFileSync("/home/user/epic-green-cards/engine/logging.js","utf8"),sb);
const c=sb.CASUSSEN[0],E=sb.Engine;
function t(n,f){try{console.log(n,"->",JSON.stringify(f()))}catch(e){console.log(n,"THROWS",e.constructor.name,e.message)}}
// JSON-kloon
t("kloon speelt door",()=>{let s=E.nieuwSpel(c,"E3",{rng:()=>0});E.speelKaart(s,"G3");let k=JSON.parse(JSON.stringify(s));const r=E.speelKaart(k,"O1");E.volgendeDag(k);return [r.ok,k.dag,k.tijdlijn.length]});
// rng varianten
for(const [n,r] of [["1",()=>1],["neg",()=>-5],["NaN",()=>NaN],["string",()=>"x"],["geen fn",5],["undefined",undefined]]) t("rng "+n,()=>E.nieuwSpel(c,"E3",{rng:r}).volgordeAB);
// 1000 trekkingen Math.random
t("Math.random verdeling",()=>{let a=0;for(let i=0;i<2000;i++)if(E.nieuwSpel(c,"E3",{}).volgordeAB[0]==="A")a++;return a});
// rng wordt exact 1x aangeroepen?
t("rng aanroepen",()=>{let n=0;E.nieuwSpel(c,"E3",{rng:()=>{n++;return .3}});return n});
t("speelKaart(state,null)",()=>E.speelKaart(E.nieuwSpel(c,"E1",{}),null));
t("speelKaart(state)",()=>E.speelKaart(E.nieuwSpel(c,"E1",{})));
t("speelKaart(state,'V4',null)",()=>E.speelKaart(E.nieuwSpel(c,"E1",{}),"V4",null).ok);
t("speelKaart(null,'V4')",()=>E.speelKaart(null,"V4"));
t("doel getal",()=>E.speelKaart(E.nieuwSpel(c,"E2",{}),"B2",{doel:5}));
t("doel object",()=>E.speelKaart(E.nieuwSpel(c,"E2",{}),"B2",{doel:{}}));
t("V6 E2 doel V5 niet gestart",()=>E.speelKaart(E.nieuwSpel(c,"E2",{}),"V6",{doel:"V5",optie:"halveren"}));
t("V6 E2 lisinopril zonder optie",()=>E.speelKaart(E.nieuwSpel(c,"E2",{}),"V6",{doel:"lisinopril"}));
t("V6 E2 lisinopril optie",()=>{const s=E.nieuwSpel(c,"E2",{});const r=E.speelKaart(s,"V6",{doel:"lisinopril",optie:"halveren"});return [r.ok,r.fout]});
t("V6 opties",()=>c.kaarten.find(k=>k.id==="V6").opties);
t("B5 zonder pauze",()=>E.speelKaart(E.nieuwSpel(c,"E3",{}),"B5",{doel:"spironolacton"}));
t("B3 daarna B5",()=>{const s=E.nieuwSpel(c,"E3",{});E.speelKaart(s,"B3",{doel:"spironolacton"});const r=E.speelKaart(s,"B5",{doel:"spironolacton"});const r2=E.speelKaart(s,"B3",{doel:"spironolacton"});return [r.ok,r2.ok]});
t("B2 zonder actief",()=>E.speelKaart(E.nieuwSpel(c,"E2",{}),"B2",{doel:"V4"}));
t("B1 zonder actief",()=>E.speelKaart(E.nieuwSpel(c,"E2",{}),"B1",{doel:"V4"}));
t("B4 zonder V7",()=>E.speelKaart(E.nieuwSpel(c,"E3",{}),"B4",{doel:"V7"}));
t("B4 met V7",()=>{const s=E.nieuwSpel(c,"E3",{});E.speelKaart(s,"V7");return E.speelKaart(s,"B4",{doel:"V7"}).ok});
t("V6 cipro opties",()=>{const s=E.nieuwSpel(c,"E3",{});E.speelKaart(s,"V7");return Object.keys(c.kaarten.find(k=>k.id==="V6").opties)});
// Logging-integratie
t("ontgrendeld met echte Logging",()=>{sb.Logging._zetOpslag(null);
 sb.Logging.bewaar({pseudoniem:"p",casusId:c.id,episodeId:"E1",geschonden:[{id:"I1"}],tijdlijn:[],onthuld:[]});
 const a=E.ontgrendeld(c,"E2",sb.Logging.alle());
 sb.Logging.bewaar({pseudoniem:"p",casusId:c.id,episodeId:"E1",geschonden:[],tijdlijn:[],onthuld:[]});
 return [a,E.ontgrendeld(c,"E2",sb.Logging.alle()),E.ontgrendeld(c,"E3",sb.Logging.alle()),E.ontgrendeldeEpisodes(c,sb.Logging.alle())]});
t("ontgrendeld andere pseudoniem/casus niet gefilterd",()=>{sb.Logging._zetOpslag(null);sb.Logging.bewaar({pseudoniem:"anderen",casusId:"andere-casus",episodeId:"E1",geschonden:[],tijdlijn:[]});return E.ontgrendeld(c,"E2",sb.Logging.alle())});
t("ontgrendeld(null/undefined)",()=>[E.ontgrendeld(c,"E2"),E.ontgrendeld(c,"E2",null),E.ontgrendeld(c,"E1",undefined)]);
// herkansing
t("herkansing nieuwe volgorde",()=>{let n=0;const s=E.nieuwSpel(c,"E3",{rng:()=>{return (n++%2)?0:0.9}});const h=E.herkansing(s);return [s.volgordeAB,h.volgordeAB]});
t("herkansing rng-injectie",()=>{const s=E.nieuwSpel(c,"E3",{rng:()=>0});return [E.herkansing(s,{rng:()=>0.99}).volgordeAB,E.herkansing(s).volgordeAB]});
t("rondAf zonder Evaluatie",()=>E.rondAf(E.nieuwSpel(c,"E1",{})));
t("klaar/dagen",()=>{const s=E.nieuwSpel(c,"E1",{});for(let i=0;i<4;i++)E.volgendeDag(s);const a=[s.dag,s.dagenVoorbij,E.eindeBereikt(s)];E.volgendeDag(s);const b=[s.dag,s.dagenVoorbij,E.eindeBereikt(s)];return [a,b,E.speelKaart(s,"G1").fout,E.raadpleeg(s).fout]});
t("raadpleeg E3 exact 1 actie over",()=>{const s=E.nieuwSpel(c,"E3",{});E.speelKaart(s,"G1");E.speelKaart(s,"G3");return [s.actiesOver,E.raadpleeg(s).ok,s.actiesOver]});
t("raadpleeg E3 3x",()=>{const s=E.nieuwSpel(c,"E3",{});return [E.raadpleeg(s).ok,E.raadpleeg(s).ok,E.raadpleeg(s).ok,E.raadpleeg(s).ok,s.actiesOver,s.raadplegingen.length]});
t("laatste dag: kaart 4 op dag 7",()=>{const s=E.nieuwSpel(c,"E3",{rng:()=>0});for(let i=0;i<6;i++)E.volgendeDag(s);for(const k of ["G1","G2","G3"])E.speelKaart(s,k);E.speelKaart(s,"N1");return [s.dag,s.actiesOver,s.wachtend]});
t("volgendeDag deelmutatie bij kapotte als-voorwaarde",()=>{const cc=JSON.parse(JSON.stringify(c));cc.episodes[2].werkzaamheid.weefselinvasie.werkzaam[2].als={p:"bestaatniet"};const s=E.nieuwSpel(cc,"E3",{rng:()=>0});E.speelKaart(s,"V8");E.speelKaart(s,"G1");E.speelKaart(s,"G2");E.speelKaart(s,"G3");E.volgendeDag(s);const voor=[s.dag,s.klachten.length,s.gebeurtenissen.length];try{E.volgendeDag(s)}catch(e){return [voor,"fout:"+e.message,s.dag,s.klachten.length,s.gebeurtenissen.length,s.wachtend.length]}return "geen fout"});

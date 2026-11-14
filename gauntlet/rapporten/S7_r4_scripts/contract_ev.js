const {laad}=require("./laad.js");
const sb=laad();const E=sb.Engine,P=sb.Predicaten,casus=sb.CASUSSEN[0];const J=x=>JSON.stringify(x);
let seed=9;function R(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}const ri=n=>Math.floor(R()*n);
// stub Evaluatie die argumenten vastlegt en alle invarianten/profiel/score-predicaten tegen de echte Predicaten uitvoert
let aanroepen=[],predFouten=[],evals=0;
sb.Evaluatie={beoordeel:function(){aanroepen.push([].slice.call(arguments));const [c,epId,st]=arguments;const ep=c.episodes.find(e=>e.id===epId);const ctx=P.maakContext(c,ep,st);
  const lijst=[];(ep.invarianten||[]).forEach(i=>lijst.push(i.predicaat));(ep.profielen||[]).forEach(i=>lijst.push(i.als));
  ((ep.score&&ep.score.duurzaamheid&&ep.score.duurzaamheid.regels)||[]).forEach(r=>{if(r.als)lijst.push(r.als);});
  ((ep.score&&ep.score.doelmatigheid&&ep.score.doelmatigheid.regels)||[]).forEach(r=>{if(r.als)lijst.push(r.als);});
  (ep.feedbackExtra||[]).forEach(f=>lijst.push(f.trigger));
  lijst.forEach(p=>{try{P.evalueer(p,ctx);evals++;}catch(e){predFouten.push(epId+": "+e.message.slice(0,100));}});
  return {poortGehaald:true,geschonden:[],gezien:st.tijdlijn.length};}};
let n=0;
for(let g=0;g<1500;g++){
  const ep=casus.episodes[ri(3)];const s=E.nieuwSpel(casus,ep.id,{rng:()=>R()});
  for(let i=0;i<40;i++){
    if(R()<0.7){const k=ep.repertoire[ri(ep.repertoire.length)];const kaart=casus.kaarten.find(c=>c.id===k);let o={};const dl=kaart.doelen&&kaart.doelen[ep.id];if(dl)o.doel=dl[ri(dl.length)].id;if(kaart.opties){const od=kaart.opties[o.doel]||[];if(od.length){const x=od[ri(od.length)];o.optie=typeof x==="string"?x:x.tekst;}}E.speelKaart(s,k,o);}
    else if(!E.eindeBereikt(s))E.volgendeDag(s);
  }
  if(R()<0.5){while(!E.eindeBereikt(s))E.volgendeDag(s);}
  const u=E.rondAf(s);n++;
  const a=aanroepen[aanroepen.length-1];
  if(a[0]!==casus||a[1]!==ep.id||a[2]!==s)console.log("ARGUMENTEN FOUT");
  if(s.uitkomst!==u||!s.afgerond)console.log("uitkomst/afgerond fout");
  if(E.rondAf(s)!==u)console.log("tweede rondAf geeft ander resultaat");
}
console.log({afrondingen:n,predicaat_evaluaties:evals,fouten:predFouten.length,uniek:[...new Set(predFouten)].slice(0,5)});

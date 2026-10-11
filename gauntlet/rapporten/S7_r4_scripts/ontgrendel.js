const {laad}=require("./laad.js");
const sb=laad();const E=sb.Engine;const J=x=>JSON.stringify(x);
let seed=4242;function R(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}const ri=n=>Math.floor(R()*n);
const A=sb.CASUSSEN[0];
const B=JSON.parse(J(A));B.id="andere-casus";   // zelfde episode-id's, andere casus
const bewaard=J(A);
const idsA=A.episodes.map(e=>e.id);
// orakel: eigen definitie uit M7 + Logging-recordvorm (contract 6)
function gehaaldO(rec,casus,ep){
  if(typeof rec==="string")return rec===ep;
  if(!rec||typeof rec!=="object"||rec.episodeId!==ep)return false;
  if(rec.casusId!=null&&rec.casusId!==casus.id)return false;
  if(rec.poortGehaald===true)return true;
  if(rec.uitkomst&&rec.uitkomst.poortGehaald===true)return true;
  if(!("poortGehaald" in rec)&&!(rec.uitkomst&&"poortGehaald" in rec.uitkomst)&&Array.isArray(rec.geschonden)&&rec.geschonden.length===0)return true;
  return false;
}
let n=0,afw=0;const voorb=[];
for(let g=0;g<20000;g++){
  const recs=[];const m=ri(6);
  for(let i=0;i<m;i++){
    const t=ri(6);const ep=["E1","E2","E3","E4"][ri(4)];
    if(t===0)recs.push(ep);
    else if(t===1)recs.push({casusId:ri(2)?A.id:"andere-casus",episodeId:ep,geschonden:R()<0.5?[]:["I1"],pseudoniem:"p"});
    else if(t===2)recs.push({casusId:A.id,episodeId:ep,poortGehaald:R()<0.5});
    else if(t===3)recs.push({episodeId:ep,uitkomst:{poortGehaald:R()<0.5,geschonden:[]}});
    else if(t===4)recs.push({casusId:A.id,episodeId:ep,geschonden:[{id:"I1"}],score:null});
    else recs.push(R()<0.5?null:{episodeId:ep,geschonden:"I1"});
  }
  const kies=R()<0.15?{E1:true,E2:R()<0.5}:recs;
  for(const casus of [A,B]){
    casus.episodes.forEach((e,i)=>{
      const verw=i===0||(Array.isArray(kies)?kies.some(r=>gehaaldO(r,casus,casus.episodes[i-1].id)):!!kies[casus.episodes[i-1].id]);
      const eng=E.ontgrendeld(casus,e.id,kies);n++;
      if(eng!==verw){afw++;if(voorb.length<5)voorb.push(J({casus:casus.id,ep:e.id,kies,eng,verw}));}
    });
    const lijst=E.ontgrendeldeEpisodes(casus,kies);
    const verwLijst=casus.episodes.filter((e,i)=>i===0||(Array.isArray(kies)?kies.some(r=>gehaaldO(r,casus,casus.episodes[i-1].id)):!!kies[casus.episodes[i-1].id])).map(e=>e.id);
    if(J(lijst)!==J(verwLijst)){afw++;}
  }
}
// onbekende episode, geen gehaald, vreemde invoer
const extra=[[A,"E9",[]],[A,"E1",undefined],[A,"E2",null],[A,"E2","E1"],[A,"E2",5],[{id:"x",episodes:[]},"E1",[]],[{id:"x"},"E1",[]]];
extra.forEach(([c,e,k])=>{try{console.log("ontgrendeld",c.id,e,J(k),"->",E.ontgrendeld(c,e,k));}catch(x){console.log("GOOIT",c.id,e,J(k),x.message);afw++;}});
console.log({controles:n,afwijkingen:afw,voorbeelden:voorb});
// herkansing + data-onveranderlijk
let h=0,hf=[];
for(let g=0;g<3000;g++){
  const casus=R()<0.5?A:B;const ep=casus.episodes[ri(3)];
  const opt={rng:()=>R(),afrondenPasNaGebeurtenissen:R()<0.5};
  const s=E.nieuwSpel(casus,ep.id,opt);
  for(let i=0;i<20;i++){const k=ep.repertoire[ri(ep.repertoire.length)];const kaart=casus.kaarten.find(c=>c.id===k);let o={};const dl=kaart.doelen&&kaart.doelen[ep.id];if(dl)o.doel=dl[ri(dl.length)].id;if(kaart.opties){const od=kaart.opties[o.doel]||[];if(od.length){const x=od[ri(od.length)];o.optie=typeof x==="string"?x:x.tekst;}}E.speelKaart(s,k,o);if(R()<0.25&&s.dag<s.aantalDagen)E.volgendeDag(s);}
  let ok1=true;try{E.rondAf(s);}catch(e){ok1=false;}
  const s2=E.herkansing(s,R()<0.5?{rng:()=>R()}:undefined);h++;
  const fouten=[];
  if(s2===s)fouten.push("zelfde object");
  if(s2.episodeId!==s.episodeId||s2.casusId!==casus.id)fouten.push("episode/casus");
  if(s2.afgerond||s2.tijdlijn.length||s2.dag!==1||s2.gebeurtenissen.length||s2.onthuld.length||s2.wachtend.length||s2.raadplegingen.length)fouten.push("niet vers");
  if(s2.afrondenPasNaGebeurtenissen!==!!opt.afrondenPasNaGebeurtenissen)fouten.push("afrondenPas verloren");
  for(const k of ["tijdlijn","onthuld","gebeurtenissen","wachtend","toestanden","sets","zichtbaar","klachten","raadplegingen"])if(s2[k]===s[k])fouten.push("gedeelde verwijzing "+k);
  s2.zichtbaar.__x=1;s2.toestanden.push("zz");
  if(J(casus)!==bewaard.replace(A.id,casus.id)&&casus===A)fouten.push("casusdata gewijzigd");
  if(s.zichtbaar.__x)fouten.push("oude state geraakt");
  if(fouten.length){hf.push(fouten.join(";"));}
}
console.log({herkansingen:h,fouten:hf.length,voorbeeld:hf.slice(0,3)});
console.log("casus A ongewijzigd na alles:",J(A)===bewaard);

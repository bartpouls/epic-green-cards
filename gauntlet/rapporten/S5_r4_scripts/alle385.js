const sb=require("../S5_r3_scripts/load.js");const P=sb.Predicaten;const casus=sb.CASUSSEN[0];
// verzamel ELK object met string-veld p (ook geneste) + tellers {t:..}
let alle=[],top=[],tellers=[];
function walk(o,pad,epi,inP){ if(Array.isArray(o))o.forEach((x,i)=>walk(x,pad+"["+i+"]",epi,inP)); else if(o&&typeof o==="object"){
  const isP=typeof o.p==="string"; if(isP){alle.push({o,pad,epi}); if(!inP)top.push({o,pad,epi});}
  if(typeof o.t==="string"&&!isP&&(o.t==="gespeeld"||o.t==="aantalActieveAntibiotica")&&pad.match(/teller/)) tellers.push({o,pad,epi});
  Object.keys(o).forEach(k=>walk(o[k],pad+"."+k,epi,inP||isP)); } }
walk(casus.kaarten,"kaarten",null,false);
casus.episodes.forEach(e=>walk(e,"E"+e.id,e,false));
walk(casus.rollen,"rollen",null,false);
console.log("alle p-objecten:",alle.length,"top-level:",top.length,"tellers:",tellers.length);
const perEp={};alle.forEach(x=>{const k=x.epi?x.epi.id:"casus";perEp[k]=(perEp[k]||0)+1;});console.log(perEp);
let fouten=0;
// valideer ELKE top-level in juiste episode; kaarten-predicaten (doelen.vereist) per episode E1..E3 
casus.episodes.forEach(e=>{
  const lege=P.maakContext(casus,e,{});
  alle.filter(x=>x.epi===e).forEach(x=>{try{P.valideer(x.o,casus,e.id);P.evalueer(x.o,lege);}catch(er){fouten++;console.log("FOUT",x.pad,er.message)}});
});
// predicaten in kaarten (casus.kaarten): valideer tegen elke episode
let nk=0;alle.filter(x=>!x.epi).forEach(x=>{const m=x.pad.match(/\.(E[123])\[/);const eps=m?casus.episodes.filter(e=>e.id===m[1]):casus.episodes;if(!m)console.log('kaartpredicaat zonder episode-sleutel:',x.pad);eps.forEach(e=>{nk++;try{P.valideer(x.o,casus,e);P.evalueer(x.o,P.maakContext(casus,e,{}));}catch(er){fouten++;console.log("FOUT kaart",x.pad,e.id,er.message)}});});console.log('kaartpredicaten gevalideerd:',nk);
console.log("fouten:",fouten);
// ook als de context een volle tijdlijn heeft (alle kaarten) en gebeurtenissen: evaluatie zonder fout
casus.episodes.forEach(e=>{const ids=e.repertoire||[];const tl=ids.map((k,i)=>({volg:i+1,kaart:k,dag:1+Math.floor(i/3),doel:null,optie:null}));
 const ctx=P.maakContext(casus,e,{tijdlijn:tl,gebeurtenissen:(e.gebeurtenissen||[]).map((g,i)=>({id:g.id,dag:2+i})),klachten:[1,2,3,4,5,6,7].map(d=>({dag:d,status:"aan"})),toestanden:e.startToestanden,dag:7});
 alle.filter(x=>x.epi===e).forEach(x=>{try{P.evalueer(x.o,ctx);}catch(er){fouten++;console.log("FOUT vol",x.pad,er.message)}});});
console.log("fouten na volle ctx:",fouten);

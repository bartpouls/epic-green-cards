const {laad}=require("./laad.js");const sb=laad();const E=sb.Engine,c=sb.CASUSSEN[0];
const s=E.nieuwSpel(c,"E3",{rng:()=>0});
["G1","G2","N1"].forEach(k=>E.speelKaart(s,k));
while(s.dag<7)E.volgendeDag(s);
console.log("volgorde",s.volgordeAB,"dag",s.dag);
const r=E.speelKaart(s,"N3");console.log(r.ok, "wachtend",JSON.stringify(s.wachtend));
E.volgendeDag(s);console.log("dagenVoorbij",s.dagenVoorbij,"eindeBereikt",E.eindeBereikt(s),"gebeurtenissen",JSON.stringify(s.gebeurtenissen),"wachtend",JSON.stringify(s.wachtend),"toestanden",s.toestanden,"klachten7",JSON.stringify(s.klachten[7]));
console.log("afronden",JSON.stringify(E.rondAf(s)).slice(0,80));
// predicaat gebeurtenisGeweest
const ctx=sb.Predicaten.maakContext(c,c.episodes[2],s);console.log("gebeurtenisGeweest A:",sb.Predicaten.evalueer({p:"gebeurtenisGeweest",id:"A"},ctx),"inToestand weefselinvasie:",sb.Predicaten.evalueer({p:"inToestand",t:"weefselinvasie"},ctx));

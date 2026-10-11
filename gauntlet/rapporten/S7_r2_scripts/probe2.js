const {laad}=require("./load.js");const sb=laad();const c=sb.CASUSSEN[0],E=sb.Engine;
const cc=JSON.parse(JSON.stringify(c));cc.episodes[2].werkzaamheid.weefselinvasie.werkzaam[0].als={p:"bestaatniet"};
const s=E.nieuwSpel(cc,"E3",{rng:()=>0});["V8","G1","G2"].forEach(k=>E.speelKaart(s,k));E.volgendeDag(s);E.speelKaart(s,"G3");
const voor={dag:s.dag,acties:s.actiesOver,kl:s.klachten.length,geb:s.gebeurtenissen.length,wacht:s.wachtend.length,toest:s.toestanden.slice()};
try{E.volgendeDag(s);console.log("geen fout")}catch(e){console.log("FOUT:",e.message);}
console.log(voor,{dag:s.dag,acties:s.actiesOver,kl:s.klachten.length,geb:s.gebeurtenissen.length,wacht:s.wachtend.length,toest:s.toestanden});
try{E.volgendeDag(s);console.log("tweede poging: geen fout; dag",s.dag)}catch(e){console.log("tweede:",e.message,"dag",s.dag)}

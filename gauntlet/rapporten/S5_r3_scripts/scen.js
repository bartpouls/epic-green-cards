const sb=require("./load.js");const P=sb.Predicaten;const casus=sb.CASUSSEN[0];const EIGEN=require("./eigen.js");
const ep=id=>casus.episodes.find(e=>e.id===id);
// tl: [kaart,dag,doel,optie]; geb: [[id,dag]]; kl: {dag:status}
function ctxVan(E,tl,geb,kl){
  const tijdlijn=tl.map((r,i)=>({volg:i+1,kaart:r[0],dag:r[1],doel:r[2]||null,optie:r[3]||null}));
  const klachten=Object.keys(kl||{}).map(d=>({dag:+d,status:kl[d]}));
  return P.maakContext(casus,ep(E),{tijdlijn,gebeurtenissen:(geb||[]).map(x=>({id:x[0],dag:x[1]})),klachten,toestanden:["cystitis"],dag:Math.max(1,...tijdlijn.map(r=>r.dag))});
}
function realPred(E,id){const i=ep(E).invarianten.find(x=>x.id===id);return i&&i.predicaat;}
let n=0,rood=0,verschil=[];
function S(naam,E,inv,tl,geb,kl,verwacht,opmerking){
  n++;const ctx=ctxVan(E,tl,geb,kl);let mijn;
  try{mijn=P.evalueer(EIGEN[inv],ctx);}catch(e){mijn="FOUT:"+e.message;}
  const rp=realPred(E,inv);let echt="n.v.t.";
  if(rp){try{echt=P.evalueer(rp,ctx);}catch(e){echt="FOUT:"+e.message;}}
  const ok=mijn===verwacht;if(!ok){rood++;console.log("ROOD (eigen verwachting)",naam,inv,E,"mijn:",mijn,"verwacht:",verwacht);}
  if(echt!=="n.v.t."&&echt!==mijn){verschil.push([naam,inv,E,"data:",echt,"eigen:",mijn,opmerking||""]);}
}
module.exports={S,get n(){return n},get rood(){return rood},verschil};

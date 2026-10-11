const L=require("./load.js");const O=require("./orakel.js");
function spec(x){const p=x.split(":");return{k:p[0],o:{doel:p[1]||undefined,optie:p[2]||undefined}};}
exports.spec=spec;
// Speelt een plan via de echte Engine; strict = weiger-fout gooit. vroeg = rondAf direct na het plan (zonder resterende dagen af te lopen).
exports.speel=function(sb,plan,volg,opt){ opt=opt||{};
  const E=sb.Engine,c=sb.CASUSSEN[0];const s=E.nieuwSpel(c,"E3",{rng:volg==="BA"?()=>0.999:()=>0});
  for(let d=0;d<plan.length;d++){ if(d>0)E.volgendeDag(s);
    for(const x of plan[d]){const q=spec(x);const r=E.speelKaart(s,q.k,q.o);if(!r.ok){ if(opt.vrij)continue; throw new Error("kaart geweigerd: "+x+" dag "+s.dag+": "+r.fout);} } }
  if(!opt.vroeg){ while(!s.dagenVoorbij)E.volgendeDag(s); }
  s.uitkomst=E.rondAf(s); return s; };

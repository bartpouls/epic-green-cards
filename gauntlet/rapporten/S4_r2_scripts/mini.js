// Eigen mini-evaluator (contract §5) + route-speler. Gebruikt de ECHTE Engine + Predicaten.
const {laad}=require("./lad.js");
function maak(extra){
  const sb=laad(extra); const c=sb.CASUSSEN[0]; const ep=c.episodes.find(x=>x.id==="E3");
  const P=sb.Predicaten, E=sb.Engine;
  const klem=n=>Math.max(1,Math.min(3,n));
  function geldt(inv,state,ctx){
    return inv.geldtIn.some(g=> g==="*" || (typeof g==="string" && state.toestanden.includes(g)) || (g&&g.gebeurtenis&&state.gebeurtenissen.some(x=>x.id===g.gebeurtenis)));
  }
  function score(spec,ctx){
    let w=spec.start==null?null:spec.start, gevonden=false;
    for(const r of spec.regels||[]){ if(r.punten!=null && P.evalueer(r.als,ctx)){ return klem(r.punten);} }
    return null;
  }
  function beoordeel(state){
    const ctx=P.maakContext(c,ep,state);
    const geschonden=[];
    for(const inv of ep.invarianten){ if(!geldt(inv,state,ctx)) continue; if(P.evalueer(inv.predicaat,ctx)){
      let vraag=inv.vraag; for(const v of inv.vraagVarianten||[]){ if(P.evalueer(v.als,ctx)){vraag=v.vraag;break;} }
      geschonden.push({id:inv.id,ernst:inv.ernst,vraag,idx:ep.invarianten.indexOf(inv)}); } }
    geschonden.sort((a,b)=>a.ernst-b.ernst||a.idx-b.idx);
    const poort=geschonden.length===0;
    const r={geschonden,poortGehaald:poort,vraag:poort?null:geschonden[0].vraag,score:null,profiel:null,extra:[],zicht:[]};
    if(poort){ r.score={duurzaamheid:score(ep.score.duurzaamheid,ctx),doelmatigheid:score(ep.score.doelmatigheid,ctx)};
      for(const p of ep.profielen){ if(P.evalueer(p.als,ctx)){r.profiel={naam:p.naam,refl:p.reflectievraag};break;} } }
    for(const f of ep.feedbackExtra||[]){ if(P.evalueer(f.trigger,ctx) && (f.wanneer==="altijd"||poort)) r.extra.push(f.vraag); }
    for(const z of ep.zichtbaarAlsOntbreekt||[]){ if(P.evalueer(z.trigger,ctx)) r.zicht.push(z.tekst); }
    return r;
  }
  // route: lijst items: "D" = volgende dag; "R" = raadpleeg; [kaart,doel,optie]; "FIN" einde
  function speel(route,rngwaarde,opties){
    const st=E.nieuwSpel(c,"E3",Object.assign({rng:()=>rngwaarde},opties||{}));
    const log=[];
    for(const it of route){
      if(it==="D"){ E.volgendeDag(st); continue; }
      if(it==="R"){ const r=E.raadpleeg(st); if(!r.ok) throw new Error("raadpleeg: "+r.fout); continue; }
      const [k,d,o]=it; const r=E.speelKaart(st,k,{doel:d||null,optie:o||null});
      if(!r.ok) throw new Error("speelKaart "+k+" "+(d||"")+" dag"+st.dag+": "+r.fout);
    }
    return st;
  }
  return {sb,c,ep,P,E,beoordeel,speel,ctx:s=>P.maakContext(c,ep,s)};
}
module.exports={maak};

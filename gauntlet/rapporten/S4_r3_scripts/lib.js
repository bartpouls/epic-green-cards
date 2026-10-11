const L=require("./load.js");
// maakt een wereld (sandbox) en hulpfuncties
exports.wereld=function(opts){
  const sb=L.laad(opts);const c=sb.CASUSSEN[0];const e3=c.episodes.find(e=>e.id==="E3");
  const E=sb.Engine,P=sb.Predicaten;
  function spec(s){const p=s.split(":");return {k:p[0],o:{doel:p[1]||undefined,optie:p[2]||undefined}};}
  // plan: array van dagen; elke dag array van specs. Na plan: dagen doorlopen tot einde (modus "vol") of niet ("direct")
  function speel(plan,order,modus,strict){
    const rng=order==="BA"?()=>0.999:()=>0;
    const s=E.nieuwSpel(c,"E3",{rng});
    let fouten=[];
    for(let d=0;d<plan.length;d++){
      if(d>0){ if(s.dagenVoorbij) {fouten.push("dagen op"); break;} E.volgendeDag(s);} 
      for(const sp of plan[d]){ const x=spec(sp); const r=E.speelKaart(s,x.k,x.o); if(!r.ok){fouten.push(sp+"@"+s.dag+": "+r.fout); if(strict) {s._fouten=fouten;return s;} } }
    }
    if(modus!=="direct"){ while(!s.dagenVoorbij) E.volgendeDag(s); }
    s._fouten=fouten;
    return s;
  }
  function ctxVan(s){return P.maakContext(c,e3,s);}
  function geldt(inv,s){
    return inv.geldtIn.some(g=>{ if(g==="*") return true; if(typeof g==="string") return s.toestanden.includes(g);
      if(g&&g.gebeurtenis) return s.gebeurtenissen.some(x=>x.id===g.gebeurtenis); return false;});
  }
  function dataSchendingen(s,ep){
    ep=ep||e3; const ctx=P.maakContext(c,ep,s); const uit=[];
    ep.invarianten.forEach(inv=>{ if(geldt(inv,s)&&P.evalueer(inv.predicaat,ctx)) uit.push(inv.id); });
    return uit;
  }
  function vraagVan(s,id){const ctx=ctxVan(s);const inv=e3.invarianten.find(i=>i.id===id);
    for(const v of inv.vraagVarianten||[]) if(P.evalueer(v.als,ctx)) return v.vraag; return inv.vraag;}
  function score(s,as,ep){ep=ep||e3;const ctx=P.maakContext(c,ep,s);const r=ep.score[as].regels;for(const x of r){ if(P.evalueer(x.als,ctx)) return x.punten;} return undefined;}
  function profiel(s,ep){ep=ep||e3;const ctx=P.maakContext(c,ep,s);for(const p of ep.profielen) if(P.evalueer(p.als,ctx)) return p.naam;return null;}
  function extra(s,ep){ep=ep||e3;const ctx=P.maakContext(c,ep,s);return ep.feedbackExtra.filter(f=>P.evalueer(f.trigger,ctx)).map(f=>f.vraag);}
  function zicht(s,ep){ep=ep||e3;const ctx=P.maakContext(c,ep,s);return ep.zichtbaarAlsOntbreekt.map((z,i)=>P.evalueer(z.trigger,ctx)?i:null).filter(x=>x!==null);}
  return {sb,c,e3,E,P,speel,dataSchendingen,geldt,vraagVan,score,profiel,extra,zicht,ctxVan};
};

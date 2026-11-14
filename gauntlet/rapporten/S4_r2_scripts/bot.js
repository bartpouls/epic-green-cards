const {maak}=require("./mini.js");
const M=maak();
const {E,c}=M;
const RNG={AB:0, BA:0.99};
function gd(st,id){ const g=st.gebeurtenissen.find(x=>x.id===id); return g?g.dag:null; }
const W={ // voorwaarden
  A:st=>gd(st,"A")!==null, B:st=>gd(st,"B")!==null, C:st=>gd(st,"C")!==null,
  dag:n=>st=>st.dag>=n,
  naA:k=>st=>gd(st,"A")!==null && st.dag>=gd(st,"A")+k,
  naB:k=>st=>gd(st,"B")!==null && st.dag>=gd(st,"B")+k,
  naC:k=>st=>gd(st,"C")!==null && st.dag>=gd(st,"C")+k,
  kaarten:n=>st=>st.tijdlijn.length>=n,
  max:n=>st=>st.tijdlijn.length<n,
  en:(...f)=>st=>f.every(x=>x(st)), niet:f=>st=>!f(st),
};
// plan: array van {k,d,o,w}; w = voorwaarde (optioneel); shorthand [k,d,o,w]
function runPlan(plan,volgorde,opt){
  opt=opt||{};
  const st=E.nieuwSpel(c,"E3",{rng:()=>RNG[volgorde],afrondenPasNaGebeurtenissen:!!opt.pasNa});
  const q=plan.map(x=>Array.isArray(x)?{k:x[0],d:x[1],o:x[2],w:x[3]}:x);
  const eindDag=opt.tot||st.aantalDagen;
  let guard=0;
  while(guard++<500){
    const i=q.findIndex(x=>!x.w||x.w(st));
    if(i>=0 && st.actiesOver>0){
      const it=q[i];
      if(it.k==="R"){ const r=E.raadpleeg(st); if(!r.ok) throw new Error(r.fout); }
      else { const r=E.speelKaart(st,it.k,{doel:it.d||null,optie:it.o||null}); if(!r.ok) throw new Error("dag"+st.dag+" "+it.k+(it.d?"/"+it.d:"")+": "+r.fout); }
      q.splice(i,1); continue;
    }
    if(st.dag>=eindDag){ break; }
    E.volgendeDag(st);
  }
  st._rest=q.map(x=>x.k+(x.d?"/"+x.d:""));
  return st;
}
function samenvat(st){
  const r=M.beoordeel(st);
  return {tijdlijn:st.tijdlijn.map(t=>"d"+t.dag+":"+t.kaart+(t.doel?"/"+t.doel:"")+(t.optie?"("+t.optie+")":"")).join(" "),
    geb:st.gebeurtenissen.map(g=>g.id+"@d"+g.dag).join(","), klachten:st.klachten.map(k=>k&&k.status?k.dag+":"+k.status:null).filter(Boolean).join(" "),
    geschonden:r.geschonden.map(g=>g.id), poort:r.poortGehaald, vraag:r.vraag, score:r.score, profiel:r.profiel&&r.profiel.naam, extra:r.extra.length, zicht:r.zicht, rest:st._rest, ev:r};
}
module.exports={M,W,runPlan,samenvat,RNG,gd};

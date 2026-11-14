// Onafhankelijk oordeel (eigen lezing van casus + bouwopdracht 6.1 + LEAD-beslissingen), alleen op tijdlijn/gebeurtenissen/klachten.
const AB=["V3","V4","V5","V7","V8","V9","V10"];
exports.judge=function(s){
  const t=s.tijdlijn.slice().sort((a,b)=>a.volg-b.volg);
  const ev=id=>s.gebeurtenissen.find(x=>x.id===id);
  const dA=ev("A")&&ev("A").dag,dB=ev("B")&&ev("B").dag,dC=ev("C")&&ev("C").dag;
  const out=new Set();
  const eerste=f=>t.find(f);
  // activiteit
  function sim(maxDag,maxVolg){const act=new Set();let max=0;
    for(const r of t){ if(maxDag!=null&&r.dag>maxDag) continue; if(maxVolg!=null&&r.volg>maxVolg) continue;
      if(r.kaart==="B1"){ if(r.doel){act.clear();act.add(r.doel);} }
      else if(r.kaart==="B2"){ if(r.doel) act.delete(r.doel);} 
      else if(AB.includes(r.kaart)) act.add(r.kaart);
      max=Math.max(max,act.size);} return {act,max};}
  const startRegels=m=>t.filter(r=>r.kaart===m||(r.kaart==="B1"&&r.doel===m));
  const gestart=m=>startRegels(m).length>0;
  // I1
  if(!t.some(r=>r.kaart==="N1")) out.add("I1");
  // I4
  if(sim().max>1) out.add("I4");
  // I5
  if(gestart("V3")) out.add("I5");
  // I6
  { const fa=eerste(r=>AB.includes(r.kaart)); const o1=eerste(r=>r.kaart==="O1");
    if((fa&&!(o1&&o1.volg<fa.volg))||t.some(r=>r.kaart==="V1"||r.kaart==="V2")) out.add("I6"); }
  // I7
  { const st=startRegels("V5"); if(st.length){ const a=st[0].dag; // eerste start
      const o2=t.some(r=>r.kaart==="O2"&&r.dag-a>=1&&r.dag-a<=3);
      const h=t.some(r=>r.kaart==="V6"&&r.doel==="V5"&&r.optie==="halveren"&&r.dag-a>=3);
      if(!o2||!h) out.add("I7"); } }
  // I8
  if(dC!=null){ const st=s.klachten[dC]&&s.klachten[dC].status; const act=sim(dC+1).act; // resistent: V5,V10 
    if((st==="aan"||st==="geenVerbetering48")&&(act.has("V5")||act.has("V10"))) out.add("I8"); }
  // I9
  { const ev2=eerste(r=>r.kaart==="Ev2"&&r.doel==="spironolacton"); const b5=eerste(r=>r.kaart==="B5"&&r.doel==="spironolacton");
    const o2=t.some(r=>r.kaart==="O2");
    if((!o2&&!ev2)||(b5&&!(ev2&&ev2.volg<b5.volg))) out.add("I9"); }
  // I10
  if(dA!=null){ const act=sim(dA).act; if(act.has("V3")||act.has("V4")) out.add("I10"); }
  // I11
  if(dA!=null){ const wis=t.filter(r=>r.dag>=dA&&(r.kaart==="B1"||AB.includes(r.kaart)));
    if(wis.length){ const o1=t.find(r=>r.kaart==="O1"&&r.dag>=dA); if(!(o1&&o1.volg<wis[0].volg)) out.add("I11"); } }
  // I12
  if(gestart("V9")) out.add("I12");
  // I13
  { const st=startRegels("V8"); if(st.length){ const a=st[0].dag; if(!t.some(r=>r.kaart==="V6"&&r.doel==="V8"&&r.optie==="875/125 mg 2 dd"&&r.dag===a)) out.add("I13"); } }
  // I14
  { const st=startRegels("V7"); if(st.length){ const a=st[0]; // calcium actief bij start?
      const at=sim(a.dag,a.volg); let pauze=new Set(); for(const r of t){ if(r.volg>a.volg) break; if(r.kaart==="B3"&&r.doel) pauze.add(r.doel); if(r.kaart==="B5"&&r.doel) pauze.delete(r.doel);} 
      const calciumActief=!pauze.has("calcium");
      const ok=t.some(r=>(r.kaart==="B4"||(r.kaart==="B3"&&r.doel==="calcium"))&&r.dag-a.dag>=0&&r.dag-a.dag<=1);
      if(calciumActief&&!ok) out.add("I14"); } }
  // I15
  if(dB!=null){ const bin=f=>t.some(r=>f(r)&&r.dag>=dB&&r.dag<=dB+1);
    if(!(bin(r=>r.kaart==="B3"&&r.doel==="spironolacton")&&bin(r=>r.kaart==="V6"&&r.doel==="lisinopril"&&r.optie==="halveren")&&bin(r=>r.kaart==="N3")&&bin(r=>r.kaart==="Ev1"))) out.add("I15"); }
  // I16
  if(dA!=null){ const ev1=t.some(r=>r.kaart==="Ev1"&&r.dag>=dA&&r.dag<=dA+1);
    const gv=s.klachten.some(k=>k&&k.status==="geenVerbetering48"); const ev3=t.some(r=>r.kaart==="Ev3");
    if(!ev1||(gv&&!ev3)) out.add("I16"); }
  return [...out].sort((a,b)=>+a.slice(1)-+b.slice(1));
};

// Eigen, onafhankelijke oracle voor E3 (geschreven uit casus sectie 6 + bouwopdracht 6.1/6.3/6.5 + contract 3b/LEAD-beslissingen). Gebruikt NIETS uit de data.
const ANTI=["V3","V4","V5","V7","V8","V9","V10"], WISSEL=["B1",...ANTI];
function oracle(st){
  const tl=st.tijdlijn.slice().sort((a,b)=>a.volg-b.volg);
  const gb={}; st.gebeurtenissen.forEach(g=>{ if(!(g.id in gb)) gb[g.id]=g.dag; });
  const dA=gb.A, dB=gb.B, dC=gb.C;
  const maxDag=st.dag;
  const first=(f)=>tl.filter(f)[0];
  const is=(k,doel,opt)=>r=>r.kaart===k&&(doel===undefined||r.doel===doel)&&(opt===undefined||r.optie===opt);
  // actief-berekening: toestand na eerste n kaarten (volg-niveau) of tot en met dag d
  function actiefNa(regels){ let act=[]; for(const r of regels){ if(ANTI.includes(r.kaart)){ if(!act.includes(r.kaart)) act.push(r.kaart); } else if(r.kaart==="B1"){ act=[r.doel]; } else if(r.kaart==="B2"){ act=act.filter(x=>x!==r.doel); } } return act; }
  const actiefEindeDag=d=>actiefNa(tl.filter(r=>r.dag<=d));
  const gestart=m=>tl.some(r=>r.kaart===m||(r.kaart==="B1"&&r.doel===m));
  const startVan=m=>first(r=>r.kaart===m||(r.kaart==="B1"&&r.doel===m));
  // I4 op volg-niveau en einde dag
  let maxAct=0; for(let i=1;i<=tl.length;i++) maxAct=Math.max(maxAct,actiefNa(tl.slice(0,i)).length);
  // calcium actief na start V7
  function medActiefNa(id,volg){ let act=true; for(const r of tl){ if(r.volg>volg) break; if(r.kaart==="B3"&&r.doel===id) act=false; if(r.kaart==="B5"&&r.doel===id) act=true; } return act; }
  // werkzaamheid
  function werkzaamSet(d,upToDag){ const t=tl.filter(r=>r.dag<=upToDag); const w=[]; 
    if(dA!==undefined&&dA<=d){ w.push("V8","V9"); if(t.some(r=>r.kaart==="B4")||t.some(r=>r.kaart==="B3"&&r.doel==="calcium")) w.push("V7"); }
    else w.push("V4","V9"); return w; }
  // klachten
  const kl=[null,null]; let periodeGehad=false;
  for(let d=2; d<=maxDag; d++){
    const act=actiefEindeDag(d-1); const w=werkzaamSet(d,d-1); const werk=act.some(x=>w.includes(x));
    let status; let override=false;
    if(!werk){ if(periodeGehad) override=(kl[d-1]==="geenVerbetering48"); else if(dA!==undefined&&d===dA+2) override=true; }
    if(override){ status="geenVerbetering48"; periodeGehad=true; } else if(!act.length) status=null; else status=werk?"af":"aan";
    kl[d]=status;
  }
  const klEver=s=>kl.some(x=>x===s);
  const out={}; const viol=new Set(); let i6v=null,i7v=null;
  // I1
  if(!tl.some(is("N1"))) viol.add("I1");
  if(maxAct>1) viol.add("I4");
  if(gestart("V3")) viol.add("I5");
  // I6
  const antiGespeeld=tl.filter(r=>ANTI.includes(r.kaart)); const o1=first(is("O1")); const firstAnti=antiGespeeld[0];
  const geenKweek=antiGespeeld.length>0&&!(o1&&o1.volg<firstAnti.volg); const afw=tl.some(is("V1"))||tl.some(is("V2"));
  if(geenKweek||afw){ viol.add("I6"); i6v=geenKweek?"a":"b"; }
  // I7
  if(gestart("V5")){ const s=startVan("V5"); const o2=tl.some(r=>r.kaart==="O2"&&r.dag-s.dag>=1&&r.dag-s.dag<=3); const h=tl.some(r=>r.kaart==="V6"&&r.doel==="V5"&&r.optie==="halveren"&&r.dag-s.dag>=3);
    if(!o2||!h){ viol.add("I7"); i7v=!o2?"a":"b"; } }
  // I8
  if(dC!==undefined){ const act=actiefEindeDag(dC+1); const res=act.some(x=>["V5","V10"].includes(x)); const k=kl[dC]; if(res&&(k==="aan"||k==="geenVerbetering48")) viol.add("I8"); }
  // I9
  const ev2s=tl.filter(is("Ev2","spironolacton")), b5=first(is("B5","spironolacton"));
  if((!tl.some(is("O2"))&&ev2s.length===0)||(b5&&!(ev2s.length&&ev2s[0].volg<b5.volg))) viol.add("I9");
  // I10..I11,I16 (A)
  if(dA!==undefined){
    const act=actiefEindeDag(dA); if(act.some(x=>x==="V3"||x==="V4")) viol.add("I10");
    const naA=tl.filter(r=>r.dag>=dA); const w1=naA.filter(r=>WISSEL.includes(r.kaart))[0]; const o1a=naA.filter(is("O1"))[0];
    if(w1&&!(o1a&&o1a.volg<w1.volg)) viol.add("I11");
    const ev1=tl.some(r=>r.kaart==="Ev1"&&r.dag>=dA&&r.dag<=dA+1);
    if(!ev1||(klEver("geenVerbetering48")&&!tl.some(is("Ev3")))) viol.add("I16");
  }
  if(gestart("V9")) viol.add("I12");
  if(gestart("V8")){ const s=startVan("V8"); const ok=tl.some(r=>r.kaart==="V6"&&r.doel==="V8"&&r.optie==="875/125 mg 2 dd"&&r.dag===s.dag); if(!ok) viol.add("I13"); }
  // I14
  let i14cond=false;
  if(gestart("V7")){ const s=startVan("V7"); if(medActiefNa("calcium",s.volg)){ const ok=tl.some(r=>(r.kaart==="B4"||(r.kaart==="B3"&&r.doel==="calcium"))&&r.dag-s.dag>=0&&r.dag-s.dag<=1); if(!ok){ viol.add("I14"); i14cond=true; } } }
  // I15
  const allVier=dB!==undefined?(["B3|spironolacton","V6|lisinopril|halveren","N3","Ev1"].every(sig=>{ const p=sig.split("|"); return tl.some(r=>r.kaart===p[0]&&(p[1]===undefined||r.doel===p[1])&&(p[2]===undefined||r.optie===p[2])&&r.dag>=dB&&r.dag<=dB+1); })):true;
  if(dB!==undefined&&!allVier) viol.add("I15");
  const ids=["I1","I4","I5","I6","I7","I8","I9","I10","I11","I12","I13","I14","I15","I16"].filter(x=>viol.has(x));
  const ernst={I12:1,I5:2,I10:2,I15:2,I9:3,I16:3,I14:3,I13:3,I7:3,I6:4,I11:4,I8:4,I1:5,I4:5};
  const idx=id=>["I1","I4","I5","I6","I7","I8","I9","I10","I11","I12","I13","I14","I15","I16"].indexOf(id);
  ids.sort((a,b)=>ernst[a]-ernst[b]||idx(a)-idx(b));
  out.ids=ids; out.i6v=i6v; out.i7v=i7v;
  // score/profiel
  const g3=first(is("G3")); const vk=first(r=>/^V(\d+)$/.test(r.kaart));
  out.doel=(g3&&(!vk||g3.volg<vk.volg))?3:2;
  const v8=gestart("V8"), v7=gestart("V7");
  let dur=null; if(v8&&!v7) dur=3; else if(v7&&tl.some(r=>(r.kaart==="V8"||(r.kaart==="B1"&&r.doel==="V8"))&&dC!==undefined&&r.dag>=dC)) dur=3; else if(v7) dur=2;
  out.dur=dur; out.profiel=v8?"Kweekgestuurd":(v7?"Richtlijn eerste keus":null);
  out.extra=[]; if(tl.some(is("B5"))) out.extra.push("herstart"); if(v7) out.extra.push("cipro");
  out.zicht=[]; if(dB!==undefined&&!tl.some(is("B3","spironolacton"))&&!tl.some(is("V6","lisinopril","halveren"))&&!tl.some(is("N3"))&&!tl.some(is("Ev1"))) out.zicht.push("sick");
  if(i14cond) out.zicht.push("cipro48");
  if((!tl.some(is("O2"))&&ev2s.length===0)||(b5&&!(ev2s.length&&ev2s[0].volg<b5.volg))) out.zicht.push("i9");
  out.kl=kl;
  return out;
}
module.exports={oracle};

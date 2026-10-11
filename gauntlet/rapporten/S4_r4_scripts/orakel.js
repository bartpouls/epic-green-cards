// EIGEN ORAKEL van de criticus (ronde 4). Geschreven uit casus-uwi.md sectie 4-6, bouwopdracht 6.1/6.3/6.5 en de LEAD-beslissingen in contract.md.
// Leest alleen de tijdlijn uit de Engine-state (kaart, dag, doel, optie, volg) en rekent GEBEURTENISDAGEN en KLACHTENSTATUS zelf uit.
const ANTI=["V3","V4","V5","V7","V8","V9","V10"];
const ERNST={I12:1,I5:2,I10:2,I15:2,I7:3,I9:3,I13:3,I14:3,I16:3,I6:4,I8:4,I11:4,I1:5,I4:5};
const DATAVOLGORDE=["I1","I4","I5","I6","I7","I8","I9","I10","I11","I12","I13","I14","I15","I16"]; // casus-/bouwopdrachtvolgorde van opsomming
const AANTALDAGEN=7,N_A=4,M_B=7;
exports.ANTI=ANTI;exports.ERNST=ERNST;exports.DATAVOLGORDE=DATAVOLGORDE;
exports.orakel=function(tl,volgordeAB,huidigeDag){ huidigeDag=huidigeDag||AANTALDAGEN; // tl = tijdlijn (array), volgordeAB = ["A","B"] of ["B","A"]
  const t=tl.slice().sort((a,b)=>a.volg-b.volg);
  const has=f=>t.some(f), first=f=>t.filter(f)[0];
  // --- gebeurtenisdagen zelf bepalen ---
  const cardDay=v=>{const r=t.filter(x=>x.volg===v)[0];return r?r.dag:null;};
  const banner=v=>{const d=cardDay(v);return d!=null&&d<AANTALDAGEN?d+1:null;};
  const dag={};
  dag[volgordeAB[0]]=banner(N_A); dag[volgordeAB[1]]=banner(M_B);
  const o1=first(r=>r.kaart==="O1"); dag.C=o1?banner(o1.volg+3):null;
  ["A","B","C"].forEach(k=>{ if(dag[k]!=null&&dag[k]>huidigeDag) dag[k]=null; });
  const dA=dag.A,dB=dag.B,dC=dag.C;
  // --- antibiotica simulatie ---
  function actief(maxDag,maxVolg){ let act={}; let maxn=0; t.forEach(r=>{ if(maxDag!=null&&r.dag>maxDag)return; if(maxVolg!=null&&r.volg>maxVolg)return;
      if(r.kaart==="B1"){act={};act[r.doel]=true;} else if(r.kaart==="B2"){delete act[r.doel];} else if(ANTI.includes(r.kaart)) act[r.kaart]=true; maxn=Math.max(maxn,Object.keys(act).length);}); return {act,maxn}; }
  const startRegels=m=>t.filter(r=>r.kaart===m||(r.kaart==="B1"&&r.doel===m));
  const gestart=m=>startRegels(m).length>0;
  // --- klachtenstatus per dag (contract 3b + LEAD-beslissingen) ---
  const status=[null,null];
  const werkzaamEind=(dEnd,dToestand)=>{ // einde van dag dEnd, beoordeeld met toestand van dag dToestand
    const wi=dA!=null&&dA<=dToestand; const act=Object.keys(actief(dEnd).act);
    const bscheid=has(r=>r.dag<=dEnd&&(r.kaart==="B4"||(r.kaart==="B3"&&r.doel==="calcium")));
    return act.some(k=>wi?(k==="V8"||k==="V9"||(k==="V7"&&bscheid)):(k==="V4"||k==="V9"));
  };
  let periode="nog"; // nog | actief | voorbij
  for(let d=2;d<=huidigeDag;d++){
    const act=Object.keys(actief(d-1).act), w=werkzaamEind(d-1,d);
    let st;
    if(periode==="actief"){ if(w){periode="voorbij";} }
    if(periode==="nog"&&dA!=null&&d===dA+2&&!w) periode="actief";
    if(periode==="actief") st="geenVerbetering48"; else st=act.length?(w?"af":"aan"):null;
    status[d]=st;
  }
  const everGV=status.includes("geenVerbetering48");
  // --- invarianten ---
  const u={};
  if(!has(r=>r.kaart==="N1")) u.I1=1;
  if(actief().maxn>1) u.I4=1;
  if(gestart("V3")) u.I5=1;
  const fa=first(r=>ANTI.includes(r.kaart)||r.kaart==="B1");
  const i6a=!!(fa&&!(o1&&o1.volg<fa.volg)), i6b=has(r=>r.kaart==="V1"||r.kaart==="V2");
  if(i6a||i6b) u.I6=1;
  const s5=startRegels("V5"); let i7a=false,i7b=false;
  if(s5.length){ const a=s5[0].dag; i7a=!has(r=>r.kaart==="O2"&&r.dag-a>=1&&r.dag-a<=3); i7b=!has(r=>r.kaart==="V6"&&r.doel==="V5"&&r.optie==="halveren"&&r.dag-a>=3); if(i7a||i7b)u.I7=1; }
  if(dC!=null){ const resist=actief(dC+1).act; if((status[dC]==="aan"||status[dC]==="geenVerbetering48")&&(resist.V5||resist.V10)) u.I8=1; }
  const ev2=first(r=>r.kaart==="Ev2"&&r.doel==="spironolacton"), b5=first(r=>r.kaart==="B5"&&r.doel==="spironolacton");
  const i9=(!has(r=>r.kaart==="O2")&&!ev2)||!!(b5&&!(ev2&&ev2.volg<b5.volg)); if(i9)u.I9=1;
  if(dA!=null){ const a=actief(dA).act; if(a.V3||a.V4) u.I10=1;
    const wissel=first(r=>r.dag>=dA&&(r.kaart==="B1"||["V3","V4","V5","V7","V8","V9","V10"].includes(r.kaart)));
    if(wissel){ const o=first(r=>r.kaart==="O1"&&r.dag>=dA&&r.volg<wissel.volg); if(!o)u.I11=1; } }
  if(gestart("V9")) u.I12=1;
  const s8=startRegels("V8");
  if(s8.length&&!has(r=>r.kaart==="V6"&&r.doel==="V8"&&r.optie==="875/125 mg 2 dd"&&r.dag===s8[0].dag)) u.I13=1;
  const s7=startRegels("V7"); let i14=false;
  if(s7.length){ const a7=s7[0]; const gepauzeerd=has(r=>r.volg<a7.volg&&r.kaart==="B3"&&r.doel==="calcium")&&!has(r=>r.volg<a7.volg&&r.kaart==="B5"&&r.doel==="calcium");
    const ok=has(r=>(r.kaart==="B4"||(r.kaart==="B3"&&r.doel==="calcium"))&&r.volg>a7.volg&&r.dag-a7.dag>=0&&r.dag-a7.dag<=1);
    i14=!gepauzeerd&&!ok; if(i14)u.I14=1; }
  let geenSick=false;
  if(dB!=null){ const bin=f=>has(r=>f(r)&&r.dag>=dB&&r.dag<=dB+1);
    const m=[bin(r=>r.kaart==="B3"&&r.doel==="spironolacton"),bin(r=>r.kaart==="V6"&&r.doel==="lisinopril"&&r.optie==="halveren"),bin(r=>r.kaart==="N3"),bin(r=>r.kaart==="Ev1")];
    if(!m.every(Boolean))u.I15=1;
    geenSick=!has(r=>r.kaart==="B3"&&r.doel==="spironolacton")&&!has(r=>r.kaart==="V6"&&r.doel==="lisinopril"&&r.optie==="halveren")&&!has(r=>r.kaart==="N3")&&!has(r=>r.kaart==="Ev1"); }
  if(dA!=null){ const ev1=has(r=>r.kaart==="Ev1"&&r.dag>=dA&&r.dag<=dA+1); if(!ev1||(everGV&&!has(r=>r.kaart==="Ev3"))) u.I16=1; }
  const ids=DATAVOLGORDE.filter(i=>u[i]).sort((x,y)=>ERNST[x]-ERNST[y]||DATAVOLGORDE.indexOf(x)-DATAVOLGORDE.indexOf(y));
  // --- score/profiel ---
  const v8=s8.length>0,v7=s7.length>0;
  const v8naC=dC!=null&&s8.some(r=>r.dag>=dC);
  let dur=null; if(v8&&!v7)dur=3; else if(v7&&v8naC)dur=3; else if(v7)dur=2;
  const g3=first(r=>r.kaart==="G3"), eV=first(r=>/^V(10|[1-9])$/.test(r.kaart));
  const doel=g3&&(!eV||g3.volg<eV.volg)?3:2;
  const profiel=v8?"Kweekgestuurd":(v7?"Richtlijn eerste keus":null);
  const extra=[]; if(has(r=>r.kaart==="B5"))extra.push("herstart"); if(v7)extra.push("dosis");
  const zicht=[]; if(dB!=null&&geenSick)zicht.push("sick"); if(i14)zicht.push("cipro"); if(i9)zicht.push("i9");
  return {dag,status,ids,dur,doel,profiel,extra,zicht,i6v:i6a?0:(i6b?1:null),i7v:i7a?0:(i7b?1:null),U:u};
};

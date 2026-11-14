// Oracle 2: score, profielen, feedbackExtra en zichtbaarAlsOntbreekt van E2: eigen referentie vs data-predicaten
const {load}=require('./load.js');
const root=process.argv[2], N=+process.argv[3]||20000;
const sb=load(root,{__sloptests:1}); const O=require('./orac_mod.js')(sb,2024);
const casus=sb.CASUSSEN[0], E=casus.episodes.find(e=>e.id==='E2'); const ABS=['V3','V4','V5'];
function ref(st){
  const T=st.tijdlijn.slice().sort((a,b)=>a.volg-b.volg);
  function activeAt(maxDag){ const act={}; for(const r of T){ if(r.dag>maxDag) continue; if(ABS.includes(r.kaart)) act[r.kaart]=true; else if(r.kaart==='B1'&&r.doel){ for(const a of ABS) delete act[a]; act[r.doel]=true; } else if(r.kaart==='B2'&&r.doel) delete act[r.doel]; } return act; }
  function status(d){ if(d<=1) return null; const a=activeAt(d-1); const ids=ABS.filter(x=>a[x]); if(!ids.length) return null; return a.V4?'af':'aan'; }
  // controle op engine-status
  const statErr=[]; for(let d=2; d<st.klachten.length; d++){ if(st.klachten[d]&&st.klachten[d].status!==status(d)) statErr.push(d); }
  const first=k=>T.find(r=>r.kaart===k);
  const tel=T.filter(r=>r.kaart==='B1'&&status(r.dag)==='af').length;
  const duur=Math.max(1,Math.min(3,3-tel));
  const g2=first('G2'); const Vs=['V1','V2','V3','V4','V5'];
  const alleNaG2=!!g2&&Vs.every(v=>{ const f=first(v); return !f||g2.volg<f.volg; });
  const doel=alleNaG2?3:2;
  const b1=first('B1'), v4=first('V4'), v5=first('V5');
  let profiel=null; if(v4&&!b1) profiel='Kweekgestuurd, smal'; else if(v5&&b1&&b1.volg>v5.volg) profiel='Bijgestuurd';
  const verouderd=Vs.some(v=>{ const f=first(v); return f&&!(g2&&g2.volg<f.volg); });
  const gestart=m=>T.some(r=>r.kaart===m||(r.kaart==='B1'&&r.doel===m));
  const zv=[gestart('V3')&&!g2, gestart('V5')&&!T.some(r=>r.kaart==='O2')];
  return {statErr,tel,duur,doel,profiel,fb:[verouderd,tel>0],zv};
}
function dat(st){ const ctx=sb.Predicaten.maakContext(casus,E,st), P=sb.Predicaten;
  let duur=E.score.duurzaamheid.start; E.score.duurzaamheid.regels.forEach(r=>{ if(r.perKeer) duur+=P.tel(r.perKeer,ctx)*r.delta; }); duur=Math.max(1,Math.min(3,duur));
  const dm=E.score.doelmatigheid.regels.find(r=>P.evalueer(r.als,ctx)).punten;
  const pr=E.profielen.find(p=>P.evalueer(p.als,ctx)); 
  return {tel:P.tel(E.score.duurzaamheid.regels[0].perKeer,ctx),duur,doel:dm,profiel:pr?pr.naam:null,fb:E.feedbackExtra.map(f=>P.evalueer(f.trigger,ctx)),zv:E.zichtbaarAlsOntbreekt.map(z=>P.evalueer(z.trigger,ctx))}; }
let bad=0, statBad=0, prof={}, ex=[]; const dist={tel:{},doel:{},zv:{},fb:{}};
for(let i=0;i<N;i++){ const st=O.randomRoute(); const a=ref(st), b=dat(st);
  if(a.statErr.length) statBad++;
  prof[b.profiel]=(prof[b.profiel]||0)+1; dist.tel[b.tel]=(dist.tel[b.tel]||0)+1; dist.doel[b.doel]=(dist.doel[b.doel]||0)+1;
  const cmp={tel:a.tel,duur:a.duur,doel:a.doel,profiel:a.profiel,fb:a.fb,zv:a.zv};
  if(JSON.stringify(cmp)!==JSON.stringify(b)){ bad++; if(ex.length<5) ex.push({tl:st.tijdlijn.map(r=>`${r.dag}:${r.kaart}${r.doel?'>'+r.doel:''}`).join(' '),a:cmp,b}); } }
console.log(JSON.stringify({N,afwijkingen:bad,engineStatusAfwijking:statBad,profielen:prof,verdeling:dist}));
ex.forEach(e=>console.log(JSON.stringify(e)));

const M=require('./oracle.js'); const {oracle,dataEval,tl,sb}=M; const casus=sb.CASUSSEN[0];
function play(spec){ const st=sb.Engine.nieuwSpel(casus,'E2',{rng:()=>0.3});
  for(const [d,k,doel,opt] of spec){ while(st.dag<d) sb.Engine.volgendeDag(st);
    const r=sb.Engine.speelKaart(st,k,{doel:doel||null,optie:opt||null}); if(!r.ok) throw new Error('zet faalt '+d+k+': '+r.fout); }
  return st; }
const R=[
 ['casus V5d1+O2d2+V6d4 (+B1 na uitslag)',[[1,'G2'],[1,'O1'],[1,'V5'],[2,'O2'],[2,'N1'],[3,'B1','V4'],[4,'V6','V5','halveren']],[]],
 ['casus fosfomycine',[[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1'],[2,'N2','V4']],[]],
 ['V5 d1, O2 d2, V6 d5 ook ok',[[1,'G2'],[1,'O1'],[1,'V5'],[2,'O2'],[2,'N1'],[3,'B1','V4'],[5,'V6','V5','halveren']],[]],
 ['I5 V3',[[1,'G2'],[1,'O1'],[1,'V3'],[2,'N1']],['I5']],
 ['I5 via B1 start',[[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1'],[2,'B1','V3']],['I5']],
 ['I6 geen kweek',[[1,'G2'],[1,'V4'],[1,'N1'],[2,'O1']],['I6']],
 ['I6 afwachten V1',[[1,'G2'],[1,'V1'],[1,'N1'],[2,'Ev1']],['I6']],
 ['I6 V2',[[1,'G2'],[1,'V2'],[1,'N1']],['I6']],
 ['I6 B1 start zonder kweek: V4 dan B1 V5',[[1,'V4'],[1,'N1'],[1,'O1'],[2,'B1','V5'],[3,'O2'],[3,'B2','V5']],['I6','I7']],
 ['I7 geen O2',[[1,'G2'],[1,'O1'],[1,'V5'],[2,'N1'],[3,'B1','V4'],[4,'V6','V5','halveren']],['I7']],
 ['I7 geen V6',[[1,'G2'],[1,'O1'],[1,'V5'],[2,'O2'],[2,'N1'],[3,'B1','V4']],['I7']],
 ['I7 V6 te vroeg (dag 3)',[[1,'G2'],[1,'O1'],[1,'V5'],[2,'O2'],[2,'N1'],[3,'B1','V4'],[3,'V6','V5','halveren']],['I7']],
 ['I7 O2 te laat dag5',[[1,'G2'],[1,'O1'],[1,'V5'],[2,'N1'],[3,'B1','V4'],[4,'V6','V5','halveren'],[5,'O2']],['I7']],
 ['I7 via B1 start',[[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1'],[2,'B1','V5'],[3,'O2'],[3,'B1','V4'],[5,'V6','V5','halveren']],[]],
 ['I7 via B1 start, O2 zelfde dag',[[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1'],[2,'B1','V5'],[2,'O2'],[3,'B1','V4'],[5,'V6','V5','halveren']],['I7']],
 ['I8 V5 blijft',[[1,'G2'],[1,'O1'],[1,'V5'],[2,'O2'],[2,'N1'],[4,'V6','V5','halveren']],['I8']],
 ['I8 via B1 start: V4 B1 V5 blijft',[[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1'],[2,'B1','V5'],[3,'O2'],[5,'V6','V5','halveren']],['I8']],
 ['I8 wissel naar V5 voor C, blijft',[[1,'G2'],[1,'V4'],[1,'O1'],[2,'N1'],[2,'B1','V5'],[3,'O2'],[5,'V6','V5','halveren']],['I6','I8']],
];
let slecht=0;
for(const [naam,spec,verw] of R){ let st; try{ st=play(spec);}catch(e){ console.log('ZET FAALT',naam,e.message); slecht++; continue; }
  const a=oracle(st), b=dataEval(st); const ok=JSON.stringify(b.ids.slice().sort())===JSON.stringify(verw.slice().sort())&&JSON.stringify(a.ids)===JSON.stringify(b.ids);
  if(!ok) slecht++;
  console.log((ok?'OK  ':'FOUT')+' '+naam+' | data='+b.ids.join(',')+' orakel='+a.ids.join(',')+' verwacht='+verw.join(',')+' | vraag='+(b.vraag||'').slice(0,40)+' | C='+a.cdag+' '+JSON.stringify(a.statusDagen));
}
console.log('slecht',slecht);

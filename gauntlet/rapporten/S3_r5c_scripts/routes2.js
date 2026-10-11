const M=require('./oracle.js'); const {oracle,dataEval,sb}=M; const casus=sb.CASUSSEN[0];
function play(spec){ const st=sb.Engine.nieuwSpel(casus,'E2',{rng:()=>0.3});
  for(const [d,k,doel,opt] of spec){ while(st.dag<d) sb.Engine.volgendeDag(st);
    const r=sb.Engine.speelKaart(st,k,{doel:doel||null,optie:opt||null}); if(!r.ok) throw new Error('zet faalt '+d+k+': '+r.fout); } return st; }
const R=[
 ['I6 only, B1-start V5',[[1,'G2'],[1,'V4'],[1,'N1'],[2,'O1'],[2,'B1','V5'],[3,'O2'],[3,'B1','V4'],[5,'V6','V5','halveren']],['I6']],
 ['I5 only, B1-start V3, V4 eerst',[[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1'],[2,'B1','V3'],[3,'B1','V4']],['I5']],
 ['I7 only, geen halveren: B1 start V5',[[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1'],[2,'B1','V5'],[3,'O2'],[3,'B1','V4']],['I7']],
 ['I8 only: wissel naar V5 na uitslag (nog resistent)',[[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1'],[3,'B1','V5'],[4,'O2'],[6,'V6','V5','halveren']],['I8']],
 ['I8 rand: wissel naar V4 op dag C+2 te laat',[[1,'G2'],[1,'O1'],[1,'V5'],[2,'O2'],[2,'N1'],[5,'B1','V4'],[4,'V6','V5','halveren']],['I8']],
];
for(const [n,s,v] of R){ const st=play(s.sort((a,b)=>a[0]-b[0])); const b=dataEval(st),a=oracle(st);
 console.log((JSON.stringify(b.ids)===JSON.stringify(v)&&JSON.stringify(a.ids)===JSON.stringify(v)?'OK  ':'FOUT')+' '+n+' data='+b.ids+' orakel='+a.ids+' C='+a.cdag+' '+(b.vraag||'').slice(0,30)); }

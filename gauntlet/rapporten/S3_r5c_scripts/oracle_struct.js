// Gestructureerde routes: casusroutes (+ B1-start-varianten) met willekeurige verschuiving van dagen en kaarten.
const M=require('./oracle.js'); const {oracle,dataEval,verwachtC,tl,sb,rnd,pick}=M;
const N=+process.argv[2]||20000; 
const casus=sb.CASUSSEN[0];
const BASES=[
 // [dag, kaart, doel, optie]
 [[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1'],[2,'N2']],
 [[1,'G2'],[1,'O1'],[1,'V5'],[2,'O2'],[2,'N1'],[4,'V6','V5','halveren'],[4,'B1','V4']],
 [[1,'G2'],[1,'O1'],[1,'V4'],[2,'B1','V5'],[3,'O2'],[3,'N1'],[5,'V6','V5','halveren']],
 [[1,'G2'],[1,'V4'],[1,'N1'],[2,'B1','V5'],[3,'O1'],[4,'O2'],[5,'V6','V5','halveren'],[5,'B1','V4']],
 [[1,'O1'],[1,'V5'],[1,'N1'],[2,'O2'],[3,'B1','V4'],[4,'V6','V5','halveren']],
 [[1,'G2'],[1,'O1'],[1,'V3'],[2,'B1','V4'],[3,'N1']],
];
function run(spec){
  const st=sb.Engine.nieuwSpel(casus,'E2',{rng:rnd});
  spec.sort((a,b)=>a[0]-b[0]);
  for(const [d,k,doel,opt] of spec){
    while(st.dag<d&&st.dag<st.aantalDagen) sb.Engine.volgendeDag(st);
    if(st.dag!==d) continue;
    sb.Engine.speelKaart(st,k,{doel:doel||null,optie:opt||null}); // fouten (b.v. geen acties) = overslaan
  }
  if(rnd()<0.5) while(st.dag<st.aantalDagen&&rnd()<0.7) sb.Engine.volgendeDag(st);
  return st;
}
const pool=[['G2'],['O1'],['O2'],['N1'],['V4'],['V5'],['V3'],['V1'],['V2'],['Ev1'],['N2','V5'],['B2','V5'],['B2','V4'],['B1','V5'],['B1','V4'],['B1','V3'],['V6','V5','halveren'],['V6','V5','verdubbelen'],['V6','lisinopril','halveren'],['V6','V5','interval 48 uur']];
let afw=0,tot=0; const per={}; const voorb=[];
for(let i=0;i<N;i++){
  let spec=pick(BASES).map(x=>x.slice());
  const m=Math.floor(rnd()*4);
  for(let j=0;j<m;j++){ const t=rnd();
    if(t<0.4&&spec.length) spec[Math.floor(rnd()*spec.length)][0]=1+Math.floor(rnd()*7);
    else if(t<0.6&&spec.length) spec.splice(Math.floor(rnd()*spec.length),1);
    else { const p=pick(pool); spec.push([1+Math.floor(rnd()*7),...p]); } }
  const st=run(spec); tot++;
  const a=oracle(st), b=dataEval(st);
  const key=a.ids.length?'ids:'+a.ids.join('+'):'schoon'; per[key]=(per[key]||0)+1;
  const bad=['ids','vraag','dur','doelm','prof','verouderd','onnodig','zicht'].filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]));
  const cc=verwachtC(st); if(cc!==a.cdag) bad.push('Cdag');
  for(const d of Object.keys(a.statusDagen)) if((st.klachten[d]&&st.klachten[d].status)!==a.statusDagen[d]) bad.push('status'+d);
  if(bad.length){ afw++; if(voorb.length<10) voorb.push(bad.join(',')+' :: '+tl(st)); }
}
console.log(JSON.stringify({tot,afw,per:Object.entries(per).sort((x,y)=>y[1]-x[1]).slice(0,25)}));
voorb.forEach(v=>console.log(v));

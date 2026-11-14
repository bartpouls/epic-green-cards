// Onafhankelijk oracle voor E2: eigen implementatie van de casusregels op de tijdlijn; vergelijking met de data-predicaten via Predicaten.
const {load}=require('./load.js');
const root=process.argv[2], N=+process.argv[3]||20000, seed0=+process.argv[4]||12345;
const over={}; if(process.argv[5]) over[process.argv[6]||'regels/predicaten.js']=process.argv[5];
const sb=load(root,over);
const casus=sb.CASUSSEN[0], E=casus.episodes.find(e=>e.id==='E2');
let seed=seed0; function rnd(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }
const pick=a=>a[Math.floor(rnd()*a.length)];
const ABS=['V3','V4','V5'];
function ref(st){
  const T=st.tijdlijn.slice().sort((a,b)=>a.volg-b.volg);
  const G=st.gebeurtenissen;
  function activeAt(maxDag){ const act={}; let maxN=0;
    for(const r of T){ if(maxDag!==undefined&&r.dag>maxDag) continue;
      if(ABS.includes(r.kaart)) act[r.kaart]=true;
      else if(r.kaart==='B1'&&r.doel){ for(const a of ABS) delete act[a]; act[r.doel]=true; }
      else if(r.kaart==='B2'&&r.doel){ delete act[r.doel]; }
      maxN=Math.max(maxN,ABS.filter(a=>act[a]).length);
    } return {act,maxN}; }
  const first=(f)=>T.find(f);
  const started=m=>!!first(r=>r.kaart===m||(r.kaart==='B1'&&r.doel===m));
  const startRow=m=>first(r=>r.kaart===m||(r.kaart==='B1'&&r.doel===m));
  const res={};
  res.I1=!T.some(r=>r.kaart==='N1');
  res.I4=activeAt().maxN>1;
  res.I5=started('V3');
  // I6
  const o1=first(r=>r.kaart==='O1');
  const zonderKweek=ABS.some(a=>{const f=first(r=>r.kaart===a); return f&&!(o1&&o1.volg<f.volg);});
  const afw=T.some(r=>r.kaart==='V1'||r.kaart==='V2')||!ABS.some(started);
  res.I6=zonderKweek||afw;
  // I7
  let i7=false, i7geenK=false, i7geenH=false;
  if(started('V5')){ const s=startRow('V5');
    const okO2=T.some(r=>r.kaart==='O2'&&r.dag-s.dag>=1&&r.dag-s.dag<=3);
    const okV6=T.some(r=>r.kaart==='V6'&&r.doel==='V5'&&r.optie==='halveren'&&r.dag-s.dag>=3);
    i7geenK=!okO2; i7geenH=!okV6; i7=!okO2||!okV6; }
  res.I7=i7;
  // I8
  const c=G.find(g=>g.id==='C'); let i8=false;
  if(c){ const a=activeAt(c.dag+1).act; const aan=st.klachten.some(k=>k&&k.status==='aan'); i8=!!a.V5&&aan; }
  res.I8=i8;
  const gesch=['I1','I4','I5','I6','I7','I8'].filter(i=>res[i]);
  const ernst={I5:2,I7:3,I6:4,I8:4,I1:5,I4:5}, ordeData=['I1','I4','I5','I6','I7','I8'];
  const sorted=gesch.slice().sort((a,b)=>ernst[a]-ernst[b]||ordeData.indexOf(a)-ordeData.indexOf(b));
  let vraag=null;
  const V={I1:'Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?',I4:'Wat lost het tweede middel op dat het eerste niet oplost?',I5:'Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?',I8:'De kweek is binnen en de klachten blijven. Waar wacht je nog op?'};
  if(sorted.length){ const t=sorted[0];
    if(t==='I6') vraag=zonderKweek?'Wat vertelt een kweek van urine die al antibioticum heeft gezien?':'Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?';
    else if(t==='I7') vraag=i7geenK?'Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?':'Dag 4. Hoeveel trimethoprim klaren haar nieren nog?';
    else vraag=V[t]; }
  return {ids:sorted,vraag};
}
function dataEval(st){
  const ctx=sb.Predicaten.maakContext(casus,E,st);
  const gesch=E.invarianten.filter(i=>{
    const geldt=i.geldtIn.some(x=>x==='*'||(x&&x.gebeurtenis&&st.gebeurtenissen.some(b=>b.id===x.gebeurtenis)));
    return geldt&&sb.Predicaten.evalueer(i.predicaat,ctx);});
  const idx=new Map(E.invarianten.map((i,k)=>[i.id,k]));
  gesch.sort((a,b)=>a.ernst-b.ernst||idx.get(a.id)-idx.get(b.id));
  let vraag=null;
  if(gesch.length){ vraag=gesch[0].vraag; for(const v of gesch[0].vraagVarianten||[]) if(sb.Predicaten.evalueer(v.als,ctx)){vraag=v.vraag;break;} }
  return {ids:gesch.map(i=>i.id),vraag};
}
const GOOD={ // gewogen kandidaat-zetten
};
function randomRoute(){
  const st=sb.Engine.nieuwSpel(casus,'E2',{rng:()=>rnd()});
  const mode=rnd(); // profielen
  const maxPlays=3+Math.floor(rnd()*14);
  let plays=0, guard=0;
  const kaarten=E.repertoire;
  while(plays<maxPlays&&guard++<80&&!st.dagenVoorbij){
    const x=rnd();
    if(x<0.18){ if(st.dag<st.aantalDagen) sb.Engine.volgendeDag(st); else break; continue; }
    // kies kaart
    let k;
    const y=rnd();
    if(y<0.55) k=pick(['G2','O1','N1','O2','V4','V5','V6','B1','B2','V3','Ev1','N2']);
    else k=pick(kaarten);
    let doel=null, optie=null;
    const kd=casus.kaarten.find(c=>c.id===k);
    const doelen=kd.doelen&&kd.doelen.E2;
    if(doelen&&doelen.length){ doel=pick(doelen.map(d=>d.id)); if(kd.opties){ const o=kd.opties[doel]||[]; if(o.length){ optie=rnd()<0.6?(o.find(z=>z.goed)||o[0]).tekst:pick(o).tekst; if(k==='V6'&&doel==='V5'&&rnd()<0.7) optie='halveren'; } } }
    const r=sb.Engine.speelKaart(st,k,{doel,optie});
    if(r.ok) plays++;
    else if(/geen acties/.test(r.fout||'')){ if(st.dag<st.aantalDagen) sb.Engine.volgendeDag(st); else break; }
  }
  return st;
}
let n=0, afw=0, combos={}, vragen={}, cWas=0; const fouten=[];
for(let i=0;i<N;i++){
  const st=randomRoute();
  const a=ref(st), b=dataEval(st);
  const key=a.ids.join(',')||'(geen)'; combos[key]=(combos[key]||0)+1;
  if(st.gebeurtenissen.length) cWas++;
  if(JSON.stringify(a)!==JSON.stringify(b)){ afw++; if(fouten.length<8) fouten.push({tijdlijn:st.tijdlijn.map(r=>`${r.dag}:${r.kaart}${r.doel?'>'+r.doel:''}${r.optie?'/'+r.optie:''}`).join(' '),klachten:st.klachten.map(k=>k&&k.status).join(','),ref:a,data:b}); }
  n++;
}
console.log(JSON.stringify({N:n,afwijkingen:afw,metC:cWas,combos},null,1));
fouten.forEach(f=>console.log(JSON.stringify(f)));

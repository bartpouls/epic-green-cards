// EIGEN orakel (ronde 5 criticus): herleidt I1,I4-I8, klachtenstatus, C-dag, vraagkeuze, score, profiel, feedbackExtra en
// zichtbaarAlsOntbreekt uitsluitend uit casus-uwi.md sectie 5 + bouwopdracht 6.1/6.3/6.5 + contract (TODO_BART-1) en
// vergelijkt met de data-evaluatie via echte Engine + Predicaten. Gebruik: node oracle.js <N> <seed> [root]
const {load}=require('./load.js');
const N=+process.argv[2]||20000, seed0=+process.argv[3]||5, root=process.argv[4]||'/home/user/epic-green-cards';
const sb=load(root,{zonderTests:!process.env.MET_TESTS,over:process.env.OVER?JSON.parse(process.env.OVER):undefined});
const casus=sb.CASUSSEN[0]; const E=()=>casus.episodes.find(e=>e.id==='E2');
let seed=seed0; const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const pick=a=>a[Math.floor(rnd()*a.length)];
const AB=['V3','V4','V5'];
const Q={
 I1:'Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?',
 I4:'Wat lost het tweede middel op dat het eerste niet oplost?',
 I5:'Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?',
 I6a:'Wat vertelt een kweek van urine die al antibioticum heeft gezien?',
 I6b:'Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?',
 I7a:'Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?',
 I7b:'Dag 4. Hoeveel trimethoprim klaren haar nieren nog?',
 I8:'De kweek is binnen en de klachten blijven. Waar wacht je nog op?'};
const ERNST={I5:2,I7:3,I6:4,I8:4,I1:5,I4:5}, VOLG=['I1','I4','I5','I6','I7','I8'];

function oracle(st){
  const T=st.tijdlijn.slice().sort((a,b)=>a.volg-b.volg);
  // actief-simulatie op kaartniveau
  function sim(maxDag){ let act=new Set(), maxN=0; for(const r of T){ if(maxDag!==undefined&&r.dag>maxDag) break;
      if(AB.includes(r.kaart)) act.add(r.kaart);
      else if(r.kaart==='B1'&&r.doel){ act=new Set([r.doel]); }
      else if(r.kaart==='B2'&&r.doel){ act.delete(r.doel); }
      maxN=Math.max(maxN,act.size);} return {act,maxN}; }
  const startRow=m=>T.find(r=>r.kaart===m||(r.kaart==='B1'&&r.doel===m));
  const firstOf=k=>T.find(r=>r.kaart===k);
  // klachtenstatus per bereikte dag
  const status={}; for(let d=2; d<=st.dag; d++){ const a=sim(d-1).act; status[d]= a.size===0?null:(a.has('V4')?'af':'aan'); }
  const c=st.gebeurtenissen.find(g=>g.id==='C');
  const res={}, v={};
  res.I1=!firstOf('N1');
  res.I4=sim().maxN>1;
  res.I5=!!startRow('V3');
  const o1=firstOf('O1'); const firstAb=T.find(r=>AB.includes(r.kaart));
  const zonderKweek=!!firstAb&&!(o1&&o1.volg<firstAb.volg);
  const afwacht=T.some(r=>r.kaart==='V1'||r.kaart==='V2')||!AB.some(m=>startRow(m));
  res.I6=zonderKweek||afwacht;
  const s5=startRow('V5'); let i7a=false,i7b=false;
  if(s5){ i7a=!T.some(r=>r.kaart==='O2'&&r.dag-s5.dag>=1&&r.dag-s5.dag<=3);
          i7b=!T.some(r=>r.kaart==='V6'&&r.doel==='V5'&&r.optie==='halveren'&&r.dag-s5.dag>=3); }
  res.I7=i7a||i7b;
  res.I8=false; if(c){ const a=sim(c.dag+1).act; const aanOoit=Object.values(status).includes('aan'); res.I8=a.has('V5')&&aanOoit; }
  const ids=VOLG.filter(i=>res[i]).sort((a,b)=>ERNST[a]-ERNST[b]||VOLG.indexOf(a)-VOLG.indexOf(b));
  let vraag=null; if(ids.length){ const t=ids[0];
    vraag= t==='I6'?(zonderKweek?Q.I6a:Q.I6b): t==='I7'?(i7a?Q.I7a:Q.I7b): Q[t]; }
  // score
  const af=T.filter(r=>r.kaart==='B1'&&status[r.dag]==='af').length;
  const dur=Math.max(1,Math.min(3,3-af));
  const g2=firstOf('G2'); const vrows=T.filter(r=>['V1','V2','V3','V4','V5'].includes(r.kaart));
  const doelm=(g2&&vrows.every(r=>g2.volg<r.volg))?3:2;
  const b1=firstOf('B1'); const v5=firstOf('V5'), v4=firstOf('V4');
  const prof=(v4&&!b1)?'Kweekgestuurd, smal':(v5&&b1&&b1.volg>v5.volg)?'Bijgestuurd':null;
  const verouderd=vrows.some(r=>!(g2&&g2.volg<r.volg));
  const onnodig=af>0;
  const zicht=[]; if(startRow('V3')&&!g2) zicht.push('De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.');
  if(startRow('V5')&&!firstOf('O2')) zicht.push('De kaliumspiegel is onbekend.');
  return {ids,vraag,dur,doelm,prof,verouderd,onnodig,zicht,statusDagen:status,
    cdag: c?c.dag:null};
}
// verwachte C: na 4e gespeelde kaart en O1 gespeeld binnen eerste vier; banner op volgende dag (alleen als die dag bestaat)
function verwachtC(st){ const T=st.tijdlijn.slice().sort((a,b)=>a.volg-b.volg); const r4=T[3]; if(!r4) return null;
  if(!T.slice(0,4).some(r=>r.kaart==='O1')) return null; const d=r4.dag+1; return d<=st.aantalDagen&&st.dag>=d?d:null; }

function dataEval(st){
  const e=E(), P=sb.Predicaten, ctx=P.maakContext(casus,e,st);
  const gesch=e.invarianten.filter(i=>i.geldtIn.some(x=>x==='*'||(x&&x.gebeurtenis&&st.gebeurtenissen.some(b=>b.id===x.gebeurtenis)))&&P.evalueer(i.predicaat,ctx));
  gesch.sort((a,b)=>a.ernst-b.ernst||e.invarianten.indexOf(a)-e.invarianten.indexOf(b));
  let vraag=null; if(gesch.length){ vraag=gesch[0].vraag; for(const vv of gesch[0].vraagVarianten||[]) if(P.evalueer(vv.als,ctx)){vraag=vv.vraag;break;} }
  const clamp=x=>Math.max(1,Math.min(3,x));
  let dur=e.score.duurzaamheid.start; for(const r of e.score.duurzaamheid.regels){ if(r.perKeer) dur+=P.tel(r.perKeer,ctx)*r.delta; }
  let doelm=null; for(const r of e.score.doelmatigheid.regels){ if(r.punten!==undefined&&P.evalueer(r.als,ctx)){doelm=r.punten;break;} }
  const pr=e.profielen.find(p=>P.evalueer(p.als,ctx));
  const fb=e.feedbackExtra.map(f=>P.evalueer(f.trigger,ctx));
  const zicht=e.zichtbaarAlsOntbreekt.filter(z=>P.evalueer(z.trigger,ctx)).map(z=>z.tekst);
  return {ids:gesch.map(i=>i.id),vraag,dur:clamp(dur),doelm,prof:pr?pr.naam:null,verouderd:fb[0],onnodig:fb[1],zicht};
}
function randomRoute(mode){
  const st=sb.Engine.nieuwSpel(casus,'E2',{rng:rnd});
  const e=E(); const plays=2+Math.floor(rnd()*(mode===1?9:15));
  let n=0,guard=0; const heavy=mode===1;
  // plan: vaste kernkaarten met willekeurige dagen
  while(n<plays&&guard++<120&&!st.dagenVoorbij){
    const x=rnd();
    if(x<(heavy?0.30:0.2)){ if(st.dag<st.aantalDagen) sb.Engine.volgendeDag(st); else break; continue; }
    let k=rnd()<0.6?pick(['G2','O1','N1','O2','V4','V5','V6','V6','B1','B2','V3','Ev1','N2']):pick(e.repertoire);
    const kd=casus.kaarten.find(c=>c.id===k); let doel=null,opt=null; const doelen=kd.doelen&&kd.doelen.E2;
    if(doelen&&doelen.length){ doel=pick(doelen.map(d=>d.id)); const o=kd.opties&&kd.opties[doel]; if(o&&o.length) opt=(k==='V6'&&doel==='V5'&&rnd()<0.75)?'halveren':pick(o).tekst; }
    const r=sb.Engine.speelKaart(st,k,{doel,optie:opt});
    if(r.ok) n++; else if(/geen acties/.test(r.fout||'')){ if(st.dag<st.aantalDagen) sb.Engine.volgendeDag(st); else break; }
  }
  return st;
}
const tl=st=>st.tijdlijn.map(r=>`${r.dag}:${r.kaart}${r.doel?'>'+r.doel:''}${r.optie?'/'+r.optie:''}`).join(' ');
module.exports={oracle,dataEval,randomRoute,verwachtC,tl,sb,rnd,pick};
if(require.main===module){
  const stats={}; let afw=0; const voorb=[]; const cnt={};
  for(let i=0;i<N;i++){
    const st=randomRoute(i%3===0?1:0); const a=oracle(st), b=dataEval(st);
    for(const id of a.ids) cnt[id]=(cnt[id]||0)+1; if(!a.ids.length) cnt.schoon=(cnt.schoon||0)+1;
    const cc=verwachtC(st); if(cc!==a.cdag){ afw++; voorb.push('C-dag verwacht '+cc+' kreeg '+a.cdag+' :: '+tl(st)); continue; }
    const keys=['ids','vraag','dur','doelm','prof','verouderd','onnodig','zicht'];
    const bad=keys.filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]));
    // klachtenstatus Engine vs orakel
    for(const d of Object.keys(a.statusDagen)) if((st.klachten[d]&&st.klachten[d].status)!==a.statusDagen[d]) bad.push('status'+d);
    if(bad.length){ afw++; if(voorb.length<15) voorb.push(bad.join(',')+' :: '+tl(st)+' orakel='+JSON.stringify(a)+' data='+JSON.stringify(b)); }
  }
  console.log(JSON.stringify({N,afwijkingen:afw,telling:cnt}));
  voorb.forEach(v=>console.log(v));
}

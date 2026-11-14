// 100+ nieuwe, semantische datamutanten (kaart-id's wisselen, operatoren/getallen, delta's, punten, argumenten schrappen, anker/van/tot).
const R4='../S3_r4_scripts/';const {load}=require(R4+'load.js');
const root=process.argv[2], N=+process.argv[3]||120, seed0=+process.argv[4]||2026;
const sb=load(root); const casus=sb.CASUSSEN[0]; const idx=casus.episodes.findIndex(e=>e.id==='E2');
const orig=JSON.parse(JSON.stringify(casus.episodes[idx]));
const O=require(R4+'orac_mod.js')(sb,99);
let seed=seed0; const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const IDS=['G1','G2','O1','O2','V1','V2','V3','V4','V5','V6','N1','N2','Ev1','B1','B2'];
const get=(o,p)=>p.reduce((a,k)=>a[k],o);
const cand=[];
(function w(x,p){ if(x===null||typeof x!=='object'){ const v=x; const k=p[p.length-1];
    if(p.some(q=>String(q).startsWith('TODO_BART'))||p.includes('meta')) return;
    if(typeof v==='string'&&IDS.includes(v)&&!['id'].includes(k)&&!p.includes('repertoire')&&!p.includes('antibiotica')) IDS.filter(i=>i!==v).forEach(i=>cand.push({p:p.slice(),nv:i,d:'id '+v+'->'+i}));
    if(typeof v==='number'&&!['level','leeftijd','waarde','eGFR','actiesPerBeurt','aantalDagen'].includes(k)) [v+1,v-1,v+2].forEach(n=>cand.push({p:p.slice(),nv:n,d:'num '+v+'->'+n}));
    if(typeof v==='string'&&['<','>','==','>=','<=','!='].includes(v)) ['<','>','==','>=','<=','!='].filter(o=>o!==v).forEach(o=>cand.push({p:p.slice(),nv:o,d:'op '+v+'->'+o}));
    if(typeof v==='string'&&['af','aan','halveren','verdubbelen'].includes(v)) cand.push({p:p.slice(),nv:v==='af'?'aan':v==='aan'?'af':'verdubbelen',d:'val '+v});
    if(typeof v==='boolean') cand.push({p:p.slice(),nv:!v,d:'bool'});
    return; }
  if(Array.isArray(x)){ x.forEach((v,i)=>w(v,p.concat([i]))); if(p.includes('args')&&x.length>1) x.forEach((v,i)=>cand.push({p:p.slice(),rm:i,d:'schrap arg '+i})); }
  else Object.keys(x).forEach(k=>w(x[k],p.concat([k]))); })(orig,[]);
// kies N unieke
const gekozen=[]; const pool=cand.slice(); while(gekozen.length<N&&pool.length){ gekozen.push(pool.splice(Math.floor(rnd()*pool.length),1)[0]); }
let killed=0, surv=[];
for(const m of gekozen){ const e=JSON.parse(JSON.stringify(orig));
  if(m.rm!==undefined) get(e,m.p).splice(m.rm,1); else get(e,m.p.slice(0,-1))[m.p[m.p.length-1]]=m.nv;
  casus.episodes[idx]=e; let red; try{ red=sb.Test.draaiAlles('data-e2').filter(x=>!x.ok).length; }catch(err){ red=1; }
  if(red){ killed++; continue; }
  let div=null; try{ for(let i=0;i<1500&&!div;i++){ const st=O.randomRoute(); if(JSON.stringify(O.ref(st))!==JSON.stringify(O.dataEval(st))) div=st.tijdlijn.map(r=>`${r.dag}:${r.kaart}${r.doel?'>'+r.doel:''}${r.optie?'/'+r.optie:''}`).join(' '); } }catch(err){ div='(fout) '+err.message; }
  surv.push({d:m.p.join('.')+' '+m.d,div}); }
casus.episodes[idx]=orig;
console.log(JSON.stringify({kandidaten:cand.length,uitgevoerd:gekozen.length,gedood:killed,overleefd:surv.length,gedragsgaten:surv.filter(s=>s.div).length}));
surv.forEach(s=>console.log((s.div?'GEDRAG ':'equiv? ')+s.d+(s.div?'  route: '+s.div:'')));

const {load}=require('./load.js');
const root=process.argv[2]; const behaviour=process.argv[3]!=='nobeh';
const sb=load(root);
const casus=sb.CASUSSEN[0];
const idx=casus.episodes.findIndex(e=>e.id==='E2');
const orig=JSON.parse(JSON.stringify(casus.episodes[idx]));
const origTodo=JSON.parse(JSON.stringify(casus.todoBart));
const O=require('./orac_mod.js')(sb,99);
function leaves(x,p,out){ if(x===null||typeof x!=='object'){out.push(p.slice());return out;}
  if(Array.isArray(x)) x.forEach((v,i)=>leaves(v,p.concat([i]),out)); else Object.keys(x).forEach(k=>leaves(x[k],p.concat([k]),out)); return out; }
function get(o,p){ return p.reduce((a,k)=>a[k],o); }
function mutants(){
  const res=[]; const L=leaves(orig,[],[]);
  const pushLeaf=(p,nv,desc)=>res.push({kind:'ep',p,f:o=>{ const par=get(o,p.slice(0,-1)); par[p[p.length-1]]=nv; },desc:desc});
  for(const p of L){ const v=get(orig,p); const name='E2.'+p.join('.');
    if(typeof v==='number'){ pushLeaf(p,v+1,name+' +1'); pushLeaf(p,v-1,name+' -1'); }
    else if(typeof v==='boolean'){ pushLeaf(p,!v,name+' flip'); }
    else if(typeof v==='string'){
      if(v.length>1) pushLeaf(p,v.slice(0,-1),name+' drop last'); 
      pushLeaf(p,v+'.',name+' +"."');
      pushLeaf(p,v[0]===v[0].toUpperCase()?v[0].toLowerCase()+v.slice(1):v[0].toUpperCase()+v.slice(1),name+' case first');
      if(v.length>2) pushLeaf(p,v.slice(0,1)+v.slice(2),name+' drop 2nd char');
    } else if(v===null){ pushLeaf(p,'x',name+' null->x'); }
  }
  // structurele: sleutel verwijderen, array-element verwijderen, wisselen
  (function walk(x,p){ if(x===null||typeof x!=='object') return;
    if(Array.isArray(x)){ x.forEach((v,i)=>{ res.push({kind:'ep',desc:'E2.'+p.join('.')+'['+i+'] remove',f:o=>{ get(o,p).splice(i,1); }}); walk(v,p.concat([i])); });
      if(x.length>1) for(let i=0;i<x.length-1;i++) res.push({kind:'ep',desc:'E2.'+p.join('.')+' swap '+i+','+(i+1),f:o=>{ const a=get(o,p); const t=a[i];a[i]=a[i+1];a[i+1]=t; }});
    } else Object.keys(x).forEach(k=>{ res.push({kind:'ep',desc:'E2.'+p.concat([k]).join('.')+' delete',f:o=>{ delete get(o,p)[k]; }}); walk(x[k],p.concat([k])); });
  })(orig,[]);
  // todoBart
  origTodo.forEach((t,i)=>{ if(/E2/.test(t.id)){
    ['vraag','gekozenLezing','plek','id'].forEach(k=>res.push({kind:'todo',desc:'todoBart['+t.id+'].'+k+' drop last',f:l=>{ l[i][k]=l[i][k].slice(0,-1); }}));
    res.push({kind:'todo',desc:'todoBart['+t.id+'] remove',f:l=>{ l.splice(i,1); }});
  }});
  return res;
}
const M=mutants(); console.error('aantal mutanten',M.length);
function runTests(){ const r=sb.Test.draaiAlles('data-e2'); return r.filter(x=>!x.ok); }
const base=runTests(); if(base.length){console.error('basis rood!',base.length);process.exit(1);}
let killed=0, surv=[], behaviourGaps=[];
const only=process.argv[4]?new RegExp(process.argv[4]):null;
let tot=0;
for(const m of M){ if(only&&!only.test(m.desc)) continue; tot++;
  const e=JSON.parse(JSON.stringify(orig)); const t=JSON.parse(JSON.stringify(origTodo));
  try{ if(m.kind==='ep'){ m.f(e); casus.episodes[idx]=e; } else { m.f(t); casus.todoBart.length=0; t.forEach(x=>casus.todoBart.push(x)); } }catch(err){ continue; }
  let red; try{ red=runTests(); }catch(err){ red=[1]; }
  if(red.length) killed++;
  else { let div=null;
    if(behaviour){ try{ for(let i=0;i<600&&!div;i++){ const st=O.randomRoute(); const a=O.ref(st),b=O.dataEval(st); if(JSON.stringify(a)!==JSON.stringify(b)) div=st.tijdlijn.map(r=>`${r.dag}:${r.kaart}${r.doel?'>'+r.doel:''}${r.optie?'/'+r.optie:''}`).join(' '); } }catch(err){ div='(fout) '+err.message; } }
    surv.push({desc:m.desc,div}); if(div) behaviourGaps.push({desc:m.desc,div});
  }
  casus.episodes[idx]=JSON.parse(JSON.stringify(orig)); casus.todoBart.length=0; origTodo.forEach(x=>casus.todoBart.push(JSON.parse(JSON.stringify(x))));
}
console.log(JSON.stringify({totaal:tot,gedood:killed,overleefd:surv.length,gedragsgaten:behaviourGaps.length}));
console.log('--- overlevers ---'); surv.forEach(s=>console.log((s.div?'GEDRAG ':'      ')+s.desc+(s.div?'  route: '+s.div:'')));

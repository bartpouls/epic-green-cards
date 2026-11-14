const fs=require('fs'),vm=require('vm');globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','casussen/uwi-e2.js','casussen/uwi-e3.js','regels/predicaten.js','regels/evaluatie.js','engine/engine.js','engine/logging.js','casussen/uwi-referentie.js','tests/testlib.js','tests/data-referentie.tests.js']) vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});
const C=window.CASUSSEN[0];const orig=JSON.stringify({r:C.referentie,t:C.todoBart});
const kl=()=>JSON.parse(orig);
function run(naam,fn){const s=kl();fn(s);if(JSON.stringify({r:s.r,t:s.t})===orig)return {naam:naam+' (no-op)',rood:-1};C.referentie=s.r;C.todoBart=s.t;const res=Test.draaiAlles('data-referentie');const rood=res.filter(x=>!x.ok).length;C.referentie=JSON.parse(orig).r;C.todoBart=JSON.parse(orig).t;return {naam,rood}}
const out=[];
function paths(x,p,u){u.push(p);if(Array.isArray(x))x.forEach((v,i)=>paths(v,p.concat([i]),u));else if(x&&typeof x==='object')Object.keys(x).forEach(k=>paths(x[k],p.concat([k]),u));return u}
const get=(r,p)=>p.reduce((o,k)=>o[k],r);
const base=JSON.parse(orig);
const swaps=[['–','-'],['é','e'],['ï','i'],['ö','o'],['ë','e'],['→','->'],['≥','>='],['≤','<='],['°',' graden'],['×','x'],[' ',' '],["'","’"],['"','“'],['. ',' . '],[', ',',']];
paths(base.r,['r'],[]).forEach(p=>{ if(p.length<2)return; const pp=p.slice(1); const v=get(base.r,pp); if(typeof v!=='string'||pp.some(k=>String(k).startsWith('TODO')))return;
 for(const [a,b] of swaps){ if(v.includes(a)) out.push(run('unicode '+pp.join('.')+' '+JSON.stringify(a),s=>{const o=get(s.r,pp.slice(0,-1));o[pp[pp.length-1]]=v.split(a).join(b)}));}
 out.push(run('dubbele spatie '+pp.join('.'),s=>{const o=get(s.r,pp.slice(0,-1));o[pp[pp.length-1]]=v.replace(' ','  ')}));
 out.push(run('punt weg '+pp.join('.'),s=>{const o=get(s.r,pp.slice(0,-1));o[pp[pp.length-1]]=v.replace(/\.$/,'')}));
 out.push(run('type string->array '+pp.join('.'),s=>{const o=get(s.r,pp.slice(0,-1));o[pp[pp.length-1]]=[v]}));
});
// key order
for(const [e,sl] of [['E1','altijdFout'],['E2','altijdFout'],['E3','altijdFout']]) out.push(run('keyorder '+e,s=>{const o=s.r[e][sl];const ks=Object.keys(o).reverse();s.r[e][sl]=Object.fromEntries(ks.map(k=>[k,o[k]]))}));
for(const e of ['E1','E2','E3']){out.push(run('sleutelvolgorde binnen item '+e,s=>{const o=s.r[e].altijdFout;const k=Object.keys(o)[0];o[k]=Object.fromEntries(Object.entries(o[k]).reverse())}));}
// cross-episode
out.push(run('E1.knoppen=E2',s=>{s.r.E1.knoppen=s.r.E2.knoppen}));
out.push(run('E2.score=E1',s=>{s.r.E2.score=s.r.E1.score}));
out.push(run('E3.brug=E2 brug',s=>{s.r.E3.brug=s.r.E2.brug}));
out.push(run('E1.geldigeRoutesNoot weg',s=>{s.r.E1.geldigeRoutesNoot=null}));
out.push(run('E2 undefined',s=>{delete s.r.E2}));
out.push(run('topniveau extra',s=>{s.r.E4={}}));
out.push(run('referentie weg',s=>{s.r=undefined}));
out.push(run('E1.volgorde als string',s=>{s.r.E1.volgorde=s.r.E1.volgorde[0]}));
out.push(run('E3.geldigeRoutes kern->string',s=>{s.r.E3.geldigeRoutes[0].kern=s.r.E3.geldigeRoutes[0].kern.join(' ')}));
out.push(run('E3 route profiel null->""',s=>{s.r.E3.geldigeRoutes[0].profiel=''}));
out.push(run('E3 routes: kern [] -> null',s=>{s.r.E3.geldigeRoutes[1].kern=null}));
out.push(run('E3 weef rij wissel',s=>{const a=s.r.E3.routeBijWeefselinvasie;a.reverse()}));
out.push(run('E3 geldigeRoutes samenvoegen 0+1',s=>{const a=s.r.E3.geldigeRoutes;a.splice(0,2,a[0])}));
out.push(run('E2 gebeurtenisUitleg gesplitst',s=>{s.r.E2.gebeurtenisUitleg=[s.r.E2.gebeurtenisUitleg[0],'Wat de patiënt laat zien, hangt af van de keuze:','Trimethoprim: klachten houden aan.','Fosfomycine: klachten nemen af.']}));
out.push(run('E2 gebeurtenisUitleg volgorde',s=>{s.r.E2.gebeurtenisUitleg.reverse()}));
// todo's
const tid=[1,2,3,4,5].map(i=>'TODO_BART-R'+i);
tid.forEach((id,i)=>{
 out.push(run(id+' verwijderd',s=>{s.t=s.t.filter(t=>t.id!==id)}));
 out.push(run(id+' vraag + woord ronde',s=>{s.t.find(t=>t.id===id).vraag+=' (zie ronde 2)'}));
 out.push(run(id+' gekozenLezing leeg',s=>{s.t.find(t=>t.id===id).gekozenLezing=''}));
 out.push(run(id+' plek fout',s=>{s.t.find(t=>t.id===id).plek='x.y.zzz'}));
 out.push(run(id+' extra veld',s=>{s.t.find(t=>t.id===id).meta='x'}));
 out.push(run(id+' dubbel',s=>{s.t.push(JSON.parse(JSON.stringify(s.t.find(t=>t.id===id))))}));
 out.push(run(id+' gekozenLezing verwijst naar contract',s=>{s.t.find(t=>t.id===id).gekozenLezing+=' Zie het contract van de lead.'}));
 out.push(run(id+' vraag gewijzigd',s=>{s.t.find(t=>t.id===id).vraag=s.t.find(t=>t.id===id).vraag.replace(' ','  ')}));
});
out.push(run('todo op plek weg E1',s=>{delete s.r.E1.TODO_BART_geldigeRoutesNoot}));
out.push(run('todo op plek weg E3 R5',s=>{delete s.r.E3.TODO_BART_geldigeRoutes}));
out.push(run('todo op plek extra E2',s=>{s.r.E2.TODO_BART_x='x'}));
out.push(run('todo op plek tekst gewijzigd E3',s=>{s.r.E3.TODO_BART_volgordeVanSecties+='.'}));
const gemist=out.filter(o=>o.rood===0);
console.log('mutaties',out.length,'gemist',gemist.length);gemist.forEach(g=>console.log('GEMIST',g.naam));

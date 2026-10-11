// bronmutaties in predicaten.js (of engine.js): operator-/constante-swaps; draait data-e2 groep + oracle op overlevers
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=process.argv[2], file=process.argv[3], from=+process.argv[4], to=+process.argv[5];
const src=fs.readFileSync(path.join(root,file),'utf8').split('\n');
const swaps=[[/ >= /g,' > '],[/ > /g,' >= '],[/ <= /g,' < '],[/ < /g,' <= '],[/ === /g,' !== '],[/ !== /g,' === '],[/ && /g,' || '],[/ \|\| /g,' && '],[/\+ 1\b/g,'+ 0'],[/ - 1\b/g,' - 0'],[/\btrue\b/g,'false'],[/\bfalse\b/g,'true'],[/\.some\(/g,'.every('],[/\.every\(/g,'.some('],[/\bnull\b/g,'undefined'],[/Infinity/g,'0'],[/\? /g,'? !']];
const muts=[];
for(let i=from-1;i<Math.min(to,src.length);i++){ const line=src[i]; if(/^\s*(\/\/|\/\*|\*)/.test(line)) continue;
  for(const [re,rep] of swaps){ re.lastIndex=0; let m; const matches=[...line.matchAll(re)];
    matches.forEach((mm,k)=>{ const nl=line.slice(0,mm.index)+mm[0].replace(re,rep)+line.slice(mm.index+mm[0].length); if(nl!==line) muts.push({line:i+1,old:line.trim(),nw:nl.trim(),text:nl}); }); } }
console.error('mutanten',muts.length);
const {load}=require('./load.js');
const dir=fs.mkdtempSync(process.env.SPDIR+'/mtmp');
let killed=0, surv=[], err=0;
for(const m of muts){
  const copy=src.slice(); copy[m.line-1]=m.text; const p=path.join(dir,'m.js'); fs.writeFileSync(p,copy.join('\n'));
  let sb; try{ sb=load(root,{[file]:p}); }catch(e){ err++; continue; }
  let red; try{ red=sb.Test.draaiAlles('data-e2').filter(x=>!x.ok).length; }catch(e){ red=1; }
  if(red){ killed++; continue; }
  // overlever: oracle
  let div=null; try{ const O=require('./orac_mod.js')(sb,4242); for(let i=0;i<500&&!div;i++){ const st=O.randomRoute(); const a=O.ref(st),b=O.dataEval(st); if(JSON.stringify(a)!==JSON.stringify(b)) div=st.tijdlijn.map(r=>`${r.dag}:${r.kaart}${r.doel?'>'+r.doel:''}${r.optie?'/'+r.optie:''}`).join(' '); } }catch(e){ div='(fout) '+e.message; }
  surv.push({line:m.line,old:m.old,nw:m.nw,div});
}
console.log(JSON.stringify({file,totaal:muts.length,fouten:err,gedood:killed,overleefd:surv.length,gedragsgaten:surv.filter(s=>s.div).length}));
surv.forEach(s=>console.log((s.div?'GEDRAG ':'equiv? ')+s.line+': '+s.old+'  ==>  '+s.nw+(s.div?'   route: '+s.div:'')));

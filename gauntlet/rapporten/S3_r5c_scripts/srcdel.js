// Nieuw bronmutatie-operator: regel verwijderen (en: constante in een regel vervangen) in predicaten.js / engine.js.
// Per mutant: kindproces (OVER=...) draait groep data-e2 + eigen orakel op 1500 routes.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root='/home/user/epic-green-cards', file=process.argv[2], from=+process.argv[3], to=+process.argv[4], mode=process.argv[5]||'del';
const src=fs.readFileSync(path.join(root,file),'utf8').split('\n');
const dir=fs.mkdtempSync(process.env.SPDIR+'/sd');
const muts=[];
for(let i=from-1;i<Math.min(to,src.length);i++){ const l=src[i]; const t=l.trim();
  if(!t||/^(\/\/|\/\*|\*)/.test(t)) continue;
  if(mode==='del'){ if(/;\s*$/.test(t)&&!/^(var|function|return)\b/.test(t)||/^return\b.*;\s*$/.test(t)) muts.push({line:i+1,txt:l,nw:l.replace(/\S.*$/,'/*del*/;')}); }
  else if(mode==='ret'){ if(/^return\s+(?!true|false)/.test(t)) muts.push({line:i+1,txt:l,nw:l.replace(/return\s+.*;/,'return false;')}),muts.push({line:i+1,txt:l,nw:l.replace(/return\s+.*;/,'return true;')}); }
}
console.error('mutanten',muts.length);
const child=`
process.env.MET_TESTS='1'; const O=require('${__dirname}/oracle.js'); const {sb,oracle,dataEval,randomRoute}=O;
let red; try{ red=sb.Test.draaiAlles('data-e2').filter(x=>!x.ok).length; }catch(e){ red=1; }
if(red){ console.log('K'+red); process.exit(0); }
let div=null; try{ for(let i=0;i<1500&&!div;i++){ const st=randomRoute(i%3===0?1:0); const a=oracle(st),b=dataEval(st); for(const k of ['ids','vraag','dur','doelm','prof','verouderd','onnodig','zicht']) if(JSON.stringify(a[k])!==JSON.stringify(b[k])){div=k;break;} const cc=Object.keys(a.statusDagen); for(const d of cc) if((st.klachten[d]&&st.klachten[d].status)!==a.statusDagen[d]) div='status'; } }catch(e){ div='fout:'+e.message; }
console.log(div?'G '+div:'S');`;
fs.writeFileSync(path.join(dir,'child.js'),child);
let kill=0,gedrag=0,laad=0; const surv=[];
for(const m of muts){ const copy=src.slice(); copy[m.line-1]=m.nw; const p=path.join(dir,'m.js'); fs.writeFileSync(p,copy.join('\n'));
  let out; try{ out=cp.execFileSync('node',[path.join(dir,'child.js')],{env:{...process.env,OVER:JSON.stringify({[file]:p}),SPDIR:process.env.SPDIR},timeout:120000,stdio:['ignore','pipe','pipe']}).toString().trim(); }catch(e){ laad++; continue; }
  if(out[0]==='K') kill++; else if(out[0]==='G'){ gedrag++; surv.push('GEDRAG '+m.line+': '+m.txt.trim()+' ==> '+m.nw.trim()+' ('+out+')'); } else surv.push('equiv? '+m.line+': '+m.txt.trim()+' ==> '+m.nw.trim()); }
console.log(JSON.stringify({file,mode,totaal:muts.length,laadfout:laad,gedood:kill,overleefd_zonder_verschil:surv.length-gedrag,gedragsgaten:gedrag}));
surv.forEach(s=>console.log(s));

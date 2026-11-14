// Overlevers van srcmut (ronde 4-set) opnieuw toetsen met het EIGEN, bredere orakel (score/profiel/feedback/status/C-dag).
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root='/home/user/epic-green-cards', txt=process.argv[2], file=process.argv[3];
const src=fs.readFileSync(path.join(root,file),'utf8').split('\n');
const dir=fs.mkdtempSync(process.env.SPDIR+'/rc');
const lines=fs.readFileSync(txt,'utf8').split('\n').filter(l=>/^equiv\? \d+:/.test(l));
fs.writeFileSync(path.join(dir,'child.js'),`
process.env.MET_TESTS=''; const O=require('${__dirname}/oracle.js'); const {sb,oracle,dataEval,randomRoute}=O;
const S=require('${__dirname}/oracle_struct_lib.js');
let div=null; try{ for(let i=0;i<1200&&!div;i++){ const st=randomRoute(i%3===0?1:0); const a=oracle(st),b=dataEval(st); for(const k of ['ids','vraag','dur','doelm','prof','verouderd','onnodig','zicht']) if(JSON.stringify(a[k])!==JSON.stringify(b[k])){div=k;break;} for(const d of Object.keys(a.statusDagen)) if((st.klachten[d]&&st.klachten[d].status)!==a.statusDagen[d]) div='status'+d; if(!div&&O.verwachtC(st)!==a.cdag) div='Cdag'; } }catch(e){ div='fout:'+e.message; }
console.log(div?'G '+div:'S');`);
// lib met alleen de gestructureerde generator is niet nodig; maak lege stub
fs.writeFileSync(path.join(__dirname,'oracle_struct_lib.js'),'module.exports={};');
let n=0,g=0; const out=[];
for(const l of lines){ const m=l.match(/^equiv\? (\d+): (.*)  ==>  (.*)$/); if(!m) continue; const L=+m[1]; const orig=src[L-1]; const ind=orig.match(/^\s*/)[0];
  const copy=src.slice(); copy[L-1]=ind+m[3]; const p=path.join(dir,'m.js'); fs.writeFileSync(p,copy.join('\n')); n++;
  let o; try{ o=cp.execFileSync('node',[path.join(dir,'child.js')],{env:{...process.env,OVER:JSON.stringify({[file]:p})},timeout:120000,stdio:['ignore','pipe','pipe']}).toString().trim(); }catch(e){ o='L (laadfout)'; }
  if(o[0]==='G'){ g++; out.push('GEDRAG '+L+': '+m[2]+' ==> '+m[3]+' ('+o+')'); } }
console.log(JSON.stringify({file,overlevers:n,gedragsgaten:g})); out.forEach(x=>console.log(x));

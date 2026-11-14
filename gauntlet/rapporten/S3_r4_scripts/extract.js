const fs=require('fs'),vm=require('vm');
const root=process.argv[2]||'/tmp/x';
const sb={console};sb.window=sb;vm.createContext(sb);
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','casussen/uwi-e2.js','casussen/uwi-e3.js'])vm.runInContext(fs.readFileSync(root+'/'+f,'utf8'),sb);
const E2=sb.CASUSSEN[0].episodes.find(e=>e.id==='E2');
const cas=fs.readFileSync('/home/user/epic-green-cards/casus-uwi.md','utf8');
const i5=cas.indexOf('## 5. Episode 2'), i6=cas.indexOf('## 6. Episode 3');
const sec5=cas.slice(i5,i6);
const strip=s=>s.replace(/\*\*/g,'');
const sec5s=strip(sec5), cas3=strip(cas.slice(cas.indexOf('## 3.'),cas.indexOf('## 4.')));
// Forward: all quoted strings and table cells and bullet fragments from sec5
const frag=new Set();
for(const m of sec5s.matchAll(/"([^"]+)"/g))frag.add(m[1]);
for(const line of sec5s.split('\n')){
  if(line.startsWith('|')){line.split('|').map(c=>c.trim()).filter(c=>c&&!/^-+$/.test(c)).forEach(c=>frag.add(c));}
  else if(/^\s*-\s/.test(line))frag.add(line.replace(/^\s*-\s*/,'').trim());
  else if(line.trim()&&!line.startsWith('#'))frag.add(line.trim());
}
// data strings
const out=[];
(function walk(x,p,skip){
  if(typeof x==='string'){if(!skip)out.push({p,s:x});return;}
  if(Array.isArray(x))return x.forEach((v,i)=>walk(v,p+'['+i+']',skip));
  if(x&&typeof x==='object')for(const k of Object.keys(x)){walk(x[k],p+'.'+k,skip||k==='meta'||k.startsWith('TODO_BART'));}
})(E2,'E2');
// every data string (non-meta) should occur in casus (sec5 or sec3 or sec2/4?) 
const allcas=strip(cas);
const nietIn=out.filter(o=>!allcas.includes(o.s));
console.log('data-strings (zichtbaar):',out.length,' niet letterlijk in casus:');
nietIn.forEach(o=>console.log('  ',o.p,JSON.stringify(o.s)));
// Forward: quoted strings of sec5 in data
const dataAll=out.map(o=>o.s).join('\n')+'\n'+JSON.stringify(E2.meta||{})+JSON.stringify(E2.patient.meta||{})+E2.patient.verborgen.map(v=>JSON.stringify(v.meta)).join('');
const quoted=[...sec5s.matchAll(/"([^"]+)"/g)].map(m=>m[1]);
console.log('\nquoted in sec5:',quoted.length);
quoted.forEach(q=>{ if(!dataAll.includes(q)) console.log('  NIET in data:',JSON.stringify(q)); });
console.log('\n--- sec5 fragmenten niet in data (handmatig beoordelen) ---');
const dataAll2=dataAll;
for(const f of frag){ if(!dataAll2.includes(f)) console.log('  ',JSON.stringify(f)); }

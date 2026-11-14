const fs=require('fs'),vm=require('vm');globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','casussen/uwi-e2.js','casussen/uwi-e3.js','casussen/uwi-referentie.js']) vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});
const all=[];(function w(x){if(typeof x==='string')all.push(x);else if(x&&typeof x==='object')Object.values(x).forEach(w)})(window.CASUSSEN);
const blob=all.join('\n');
const L=fs.readFileSync('casus-uwi.md','utf8').split('\n').slice(107,322);
const cl=s=>s.split('**').join('').split('*').join('').trim();
let miss=0,tot=0;
for(const l0 of L){let l=l0.trim();if(!l||l.startsWith('###')||l==='---'||/^\|[-|]+\|$/.test(l))continue;
 let parts=l.startsWith('|')?l.split('|').slice(1,-1).map(cl):[cl(l.replace(/^- /,''))];
 for(const p of parts){if(!p)continue;tot++;
  // test: whole piece or all sentences present
  if(blob.includes(p))continue;
  const sents=p.split(/(?<=[.:?!])\s+/).filter(Boolean);
  const ok=sents.every(s=>blob.includes(s));
  if(!ok){miss++;console.log('NIET GEVONDEN:',JSON.stringify(p))}}}
console.log('delen',tot,'niet gevonden',miss);

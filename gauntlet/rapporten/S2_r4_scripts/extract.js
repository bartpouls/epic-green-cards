const fs=require('fs'),vm=require('vm');
const root='/home/user/epic-green-cards/';
globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js']) vm.runInThisContext(fs.readFileSync(root+f,'utf8'),{filename:f});
const lines=fs.readFileSync(root+'casus-uwi.md','utf8').split('\n');
const sec=lines.slice(107,164).join('\n'); // sectie 4
// 1) alle "stringkandidaten" uit casus sectie 4
const cand=new Set();
const strip=s=>s.replace(/\*\*/g,'');
for(const l of lines.slice(107,164)){
  let t=l.trim();
  if(!t||t.startsWith('#')||/^\|[-|\s]+\|$/.test(t)) continue;
  if(t.startsWith('- ')) t=t.slice(2);
  if(t.startsWith('|')) t.split('|').slice(1,-1).forEach(c=>cand.add(strip(c.trim())));
  else cand.add(strip(t));
  // quoted
  for(const m of l.matchAll(/"([^"]+)"/g)) cand.add(strip(m[1]));
}
// plus bullets with "label: tekst"
const extra=[];
for(const c of [...cand]){ const m=/^([^:]{2,30}): (.+)$/.exec(c); if(m&&/^(Medicatie|Lab|Verborgen|Zonder N1|V1 zonder Ev1|Duurzaamheid|Doelmatigheid)$/.test(m[1])) extra.push(m[2]); }
extra.forEach(x=>cand.add(x));
// 2) alle strings uit data (zonder meta/TODO_BART)
const e=window.CASUSSEN[0].episodes.find(x=>x.id==='E1');
const ds=[];
(function w(x,p){ if(typeof x==='string') ds.push([p,x]); else if(Array.isArray(x)) x.forEach((v,i)=>w(v,p+'['+i+']')); else if(x&&typeof x==='object') for(const k in x){ if(/^TODO_BART/.test(k)) continue; w(x[k],p+'.'+k);} })(e,'E1');
const casusTekst=strip(sec);
const casusAll=strip(fs.readFileSync(root+'casus-uwi.md','utf8'));
let bad=0;
console.log('--- data-strings en hun casusbron');
for(const [p,s] of ds){
  const inCand=cand.has(s), inSec=casusTekst.includes(s), inAll=casusAll.includes(s);
  console.log((inCand?'EXACT ':inSec?'SUBSTR ':inAll?'ELDERS':'GEEN  ')+' '+p+' = '+JSON.stringify(s));
}
// 3) richting casus -> data: welke casus-kandidaten (zinnen met tekens) komen niet in de data voor
const dataJoined=ds.map(x=>x[1]);
const meta=e.patient.meta.risicogroep;
console.log('--- casuskandidaten die NIET als data-string voorkomen (handmatig beoordelen)');
for(const c of cand){ if(dataJoined.includes(c)||c===meta) continue; console.log('  '+JSON.stringify(c)); }
console.log('--- bytes check');
for(const [p,s] of ds.concat([['meta',meta]])){ const odd=[...s].filter(ch=>ch.charCodeAt(0)>126||ch.charCodeAt(0)<32); if(odd.length) console.log(p,[...new Set(odd)].map(c=>c+' U+'+c.charCodeAt(0).toString(16)).join(' ')); }
// Check byte-level casus
const raw=fs.readFileSync(root+'casus-uwi.md','utf8');
const oddc=new Set([...sec].filter(ch=>ch.charCodeAt(0)>126)); console.log('casus sec4 non-ascii:',[...oddc].map(c=>c+' U+'+c.charCodeAt(0).toString(16)).join(' '));

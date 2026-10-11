// Eigen extractie sectie 5 casus <-> E2-data, beide richtingen.
const fs=require('fs');const {load}=require('./load.js');
const root='/home/user/epic-green-cards';
const cas=fs.readFileSync(root+'/casus-uwi.md','utf8');
const s5=cas.slice(cas.indexOf('## 5. Episode 2'),cas.indexOf('## 6. Episode 3'));
const raw=s5.replace(/\*\*/g,'');
const sb=load(root);const E=sb.CASUSSEN[0].episodes.find(e=>e.id==='E2');
// A: alle strings uit data (zonder meta/TODO) -> substring van sectie 5 (zonder **)
const out=[];
(function w(x,p){ if(typeof x==='string'){ out.push([p,x]); } else if(Array.isArray(x)) x.forEach((v,i)=>w(v,p+'['+i+']')); else if(x&&typeof x==='object') Object.keys(x).forEach(k=>{ if(k==='meta'||k.startsWith('TODO_BART')) return; w(x[k],p+'.'+k); }); })(E,'E2');
const KEYS_ID=/\.(id|kaart|doel|p|op|veld|middel|type|t|uitSet|wanneer|waarde|optie|naam_|trigger|titel)$/;
let bad=0;
const casusTekst=[];
for(const [p,s] of out){
  if(/^E2\.(werkzaamheid|invarianten\[\d+\]\.(predicaat|geldtIn|id)|score\.|profielen\[\d+\]\.als|feedbackExtra\[\d+\]\.trigger|zichtbaarAlsOntbreekt\[\d+\]\.trigger|gebeurtenissen\[\d+\]\.(trigger|zet|id)|invarianten\[\d+\]\.vraagVarianten\[\d+\]\.als|repertoire|antibiotica|startToestanden|id$|level|knoppen|patient\.(waar|medicatie|verborgen\[\d+\]\.(kaart|sleutel)))/.test(p)&&!/statusTeksten/.test(p)) continue;
  if(/^E2\.(score|profielen\[\d+\]\.als)/.test(p)) continue;
  if(raw.indexOf(s)<0){ console.log('NIET IN CASUS(S5)',p,JSON.stringify(s)); bad++; }
  else casusTekst.push([p,s]);
}
console.log('data->casus: velden',out.length,'getoetst tekst',casusTekst.length,'afwijkend',bad);
// slotpuntcontrole per veld: voorkomen in casus gevolgd door '.' terwijl het veld niet op '.' eindigt (en omgekeerd)
for(const [p,s] of casusTekst){
  let j=-1,okAny=false,seen=[];
  while((j=raw.indexOf(s,j+1))>=0){ const after=raw[j+s.length]||'',before=raw[j-1]||''; seen.push(before+'|'+after);
    // veld is "hele" casusfragment als omgeven door begrenzers
    const b=/[\s"'(:*|-]|^$/.test(before)||j===0, a=/[\s"'|)]|^$/.test(after)||/[,;]/.test(after);
    if(b&&a) okAny=true; }
  if(!okAny) console.log('RAND?',p,JSON.stringify(s),seen.slice(0,4));
}
// B: casus -> data: alle quotes + vaste tekstregels in sectie 5
const dataAll=JSON.stringify(E,(k,v)=>(k==='meta'||k.startsWith('TODO_BART'))?undefined:v);
const dataStr=new Set(out.map(o=>o[1]));
const expected=[];
// 1. alle "…" in sectie 5
for(const m of s5.matchAll(/"([^"]+)"/g)) expected.push(['quote',m[1]]);
for(const [k,v] of expected){ if(!dataStr.has(v)) console.log('CASUS-QUOTE NIET (exact veld) IN DATA',k,JSON.stringify(v), dataAll.includes(JSON.stringify(v).slice(1,-1))?'(wel als deelstring)':''); }
console.log('casus quotes',expected.length);
// 2. patientkaart bullets
const pk=s5.slice(s5.indexOf('### Patiëntkaart'),s5.indexOf('### Repertoire'));
console.log(pk);

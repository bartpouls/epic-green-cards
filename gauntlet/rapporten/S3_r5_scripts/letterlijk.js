const {load}=require('/home/user/epic-green-cards/gauntlet/rapporten/S3_r4_scripts/load.js');
const fs=require('fs');const cas=fs.readFileSync('/home/user/epic-green-cards/casus-uwi.md','utf8');
const sb=load('/home/user/epic-green-cards');const E=sb.CASUSSEN[0].episodes.find(e=>e.id==='E2');
const out=[];
(function w(x,p){ if(typeof x==='string'){ out.push([p,x]); } else if(Array.isArray(x)) x.forEach((v,i)=>w(v,p+'['+i+']')); else if(x&&typeof x==='object') Object.keys(x).forEach(k=>{ if(k==='meta'||k.startsWith('TODO_BART')) return; w(x[k],p+'.'+k); }); })(E,'E2');
let bad=0;
for(const [p,s] of out){ const i=cas.indexOf(s);
  if(i<0){ console.log('NIET LETTERLIJK',p,JSON.stringify(s)); bad++; continue; }
  // controle op slotpunt: alle voorkomens
  let ok=false, ctx=[]; let j=-1; while((j=cas.indexOf(s,j+1))>=0){ const after=cas[j+s.length]||'', before=cas[j-1]||''; ctx.push([before,after]); if(!(/[A-Za-zÀ-ÿ0-9]$/.test(s)&&after==='.')) ok=true; }
  if(!ok){ console.log('PUNT/ZONDER',p,JSON.stringify(s),JSON.stringify(ctx)); bad++; }
}
console.log('velden',out.length,'afwijkend',bad);

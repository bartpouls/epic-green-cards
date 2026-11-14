const fs=require('fs');const src=fs.readFileSync('tests/data-referentie.tests.js','utf8');
const m=src.match(/var RAW = (\{.*\});\n/);const RAW=JSON.parse(m[1]);
const cas=fs.readFileSync('casus-uwi.md','utf8').split('\n');const set=new Set(cas);
let n=0,bad=0;
for(const e in RAW)for(const k in RAW[e])for(const l of RAW[e][k]){n++;if(l===''){continue}if(!set.has(l)){bad++;console.log('NIET IN CASUS',e,k,JSON.stringify(l))}}
console.log('regels',n,'niet-byte-identiek',bad);
// volgorde/aaneengeslotenheid per sleutel: elke lijst moet contiguous blok in casus zijn
for(const e in RAW)for(const k in RAW[e]){const a=RAW[e][k];if(k==='koppen')continue;const i=cas.indexOf(a[0]);let ok=i>=0;for(let j=0;j<a.length&&ok;j++)if(cas[i+j]!==a[j])ok=false;if(!ok)console.log('niet aaneengesloten blok',e,k)}

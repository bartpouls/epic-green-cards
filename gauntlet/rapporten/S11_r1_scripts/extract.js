const fs=require('fs'),vm=require('vm');
globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','casussen/uwi-e2.js','casussen/uwi-e3.js','casussen/uwi-referentie.js']) vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});
const ref=window.CASUSSEN[0].referentie;
const L=fs.readFileSync('casus-uwi.md','utf8').split('\n');
const cl=s=>s.split('**').join('').trim();
// slice by 1-based line numbers
const sl=(a,b)=>L.slice(a-1,b);
const bul=a=>a.filter(l=>l.startsWith('- ')).map(l=>cl(l.slice(2)));
const tab=a=>a.filter(l=>l.startsWith('|')).slice(2).map(l=>{const d=l.split('|');return d.slice(1,-1).map(x=>cl(x))});
const E={};
E.E1={knoppen:bul(sl(111,114)),routes:tab(sl(127,133)),noot:cl(L[134]),inv:tab(sl(138,142)),vol:[cl(L[143])],score:bul(sl(147,148))};
E.E2={knoppen:bul(sl(169,171)),inv:tab(sl(199,204)),routes:tab(sl(193,196)),vol:bul(sl(207,209)),score:bul(sl(212,213)),brug:cl(L[230])};
E.E3={knoppen:bul(sl(238,240)),inv:tab(sl(287,296)),weef:tab(sl(279,282)),score:bul(sl(299,300)),bron:cl(L[283]),par:cl(L[258])};
let bad=0;const eq=(n,a,b)=>{const x=JSON.stringify(a),y=JSON.stringify(b);if(x!==y){bad++;console.log('AFWIJKING',n,'\n casus:',x,'\n data :',y)}else console.log('ok',n)};
eq('E1.knoppen',E.E1.knoppen,ref.E1.knoppen);
eq('E1.routes',E.E1.routes,ref.E1.geldigeRoutes.map(r=>[r.route,r.kern,r.profiel]));
eq('E1.noot',E.E1.noot,ref.E1.geldigeRoutesNoot);
eq('E1.inv',E.E1.inv,Object.entries(ref.E1.altijdFout).map(([k,v])=>[k,v.tekst,v.bron]));
eq('E1.vol',E.E1.vol,ref.E1.volgorde);eq('E1.score',E.E1.score,ref.E1.score);
eq('E2.knoppen',E.E2.knoppen,ref.E2.knoppen);
eq('E2.routes',E.E2.routes,ref.E2.geldigeRoutes.map(r=>[r.route,r.kern,r.profiel]));
eq('E2.inv',E.E2.inv,Object.entries(ref.E2.altijdFout).map(([k,v])=>[k,v.tekst,v.bron]));
eq('E2.vol',E.E2.vol,ref.E2.volgorde);eq('E2.score',E.E2.score,ref.E2.score);eq('E2.brug',E.E2.brug,ref.E2.brug);
eq('E3.knoppen',E.E3.knoppen,ref.E3.knoppen);
eq('E3.inv',E.E3.inv,Object.entries(ref.E3.altijdFout).map(([k,v])=>[k,v.tekst,v.geldtIn,v.bron]));
eq('E3.weef',E.E3.weef,ref.E3.routeBijWeefselinvasie.map(r=>[r.route,r.poort,r.profiel]));
eq('E3.score',E.E3.score,ref.E3.score);eq('E3.bron',E.E3.bron,ref.E3.bronconflict);eq('E3.par',E.E3.par,ref.E3.gebeurtenisUitleg[0]);
// E3 routes bullets
const r3=sl(262,277);const o=[];let cur;for(const l of r3){if(l.startsWith('  - ')){cur.kern.push(cl(l.slice(4)))}else if(l.startsWith('- ')){cur={route:cl(l.slice(2)),kern:[],profiel:null};o.push(cur)}}
eq('E3.routes',o,ref.E3.geldigeRoutes);
// E2 gebeurtenis
console.log('E2 gebeurtenisUitleg data:',JSON.stringify(ref.E2.gebeurtenisUitleg));
// kopnamen
const heads=(a,b)=>L.slice(a-1,b).filter(l=>l.startsWith('### ')||/^\*\*[^*]+\*\*/.test(l)&&!l.startsWith('- ')||l.startsWith('| Route bij')).map(l=>l.startsWith('### ')?l.slice(4):l.startsWith('|')?'Route bij weefselinvasie':l.match(/^\*\*([^*]+)\*\*/)[1].replace(/:$/,''));
console.log(JSON.stringify(heads(108,163)));console.log(JSON.stringify(ref.E1.volgordeVanSecties));
console.log(JSON.stringify(heads(166,232)));console.log(JSON.stringify(ref.E2.volgordeVanSecties));
console.log(JSON.stringify(heads(235,321)));console.log(JSON.stringify(ref.E3.volgordeVanSecties));
console.log('bad',bad);

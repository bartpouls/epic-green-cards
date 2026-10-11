const fs=require('fs'),vm=require('vm');globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','casussen/uwi-e2.js','casussen/uwi-e3.js','casussen/uwi-referentie.js']) vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f});
const R=window.CASUSSEN[0].referentie;const L=fs.readFileSync('casus-uwi.md','utf8').split('\n');const cl=s=>s.split('**').join('').trim();
const items=[
['E1 routes rij 5',cl(L[132]),()=>{const r=R.E1.geldigeRoutes[4];return `| ${r.route} | ${r.kern} | ${r.profiel} |`}],
['E1 noot',cl(L[134]),()=>R.E1.geldigeRoutesNoot],
['E2 I8',cl(L[203]),()=>{const v=R.E2.altijdFout.I8;return `| I8 | ${v.tekst} | ${v.bron} |`}],
['E2 volgorde',cl(L[207])+'\n'+cl(L[208])+'\n'+cl(L[209]),()=>R.E2.volgorde.map(x=>'- '+x).join('\n')],
['E2 brug',cl(L[230]),()=>R.E2.brug],
['E3 knoppen 3',cl(L[239]),()=>'- '+R.E3.knoppen[2]],
['E3 I9',cl(L[288]),()=>{const v=R.E3.altijdFout.I9;return `| I9 | ${v.tekst} | ${v.geldtIn} | ${v.bron} |`}],
['E3 weef 1',cl(L[280]),()=>{const v=R.E3.routeBijWeefselinvasie[0];return `| ${v.route} | ${v.poort} | ${v.profiel} |`}],
['E3 bronconflict',cl(L[283]),()=>R.E3.bronconflict],
['E3 Na A route',cl(L[265])+'\n'+L.slice(266,269).map(l=>cl(l)).join('\n'),()=>{const v=R.E3.geldigeRoutes[2];return '- '+v.route+'\n'+v.kern.map(k=>'  - '+k).join('\n')}],
['E2 Gebeurtenis (bullets)',L.slice(183,190).map(cl).join('\n'),()=>R.E2.gebeurtenisUitleg.map(x=>'- '+x).join('\n')],
['E3 Gebeurtenissen tabel regel A',cl(L[254]),()=>{const x=R.E3.gebeurtenisUitleg.join(' ');return 'A: '+x}],
];
const pairs=[],key=[];
items.forEach(([n,bron,f],i)=>{const flip=Math.random()<.5;const spel=f();pairs.push({i:i+1,naam:n,X:flip?spel:bron,Y:flip?bron:spel});key.push({i:i+1,naam:n,X:flip?'spel':'bron',Y:flip?'bron':'spel'})});
fs.writeFileSync('gauntlet/rapporten/S11_r1.sleutel.json',JSON.stringify(key,null,1));
pairs.forEach(p=>console.log(`### Paar ${p.i}\nX:\n${p.X}\nY:\n${p.Y}\n`));

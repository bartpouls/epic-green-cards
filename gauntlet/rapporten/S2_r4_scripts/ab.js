const fs=require('fs'),vm=require('vm');const root='/home/user/epic-green-cards/';
globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','regels/predicaten.js','engine/engine.js']) vm.runInThisContext(fs.readFileSync(root+f,'utf8'),{filename:f});
const md=fs.readFileSync(root+'casus-uwi.md','utf8').split('\n'); const sec=md.slice(107,164);
const c=s=>s.replace(/\*\*/g,'');
const find=(re)=>{const l=sec.find(x=>re.test(x)); if(!l) throw new Error('niet gevonden '+re); return c(l)};
const quote=(re)=>{const l=sec.filter(x=>/"([^"]+)"/.test(x)).find(x=>re.test(x)); return c(/"([^"]+)"/.exec(l)[1])};
const C=CASUSSEN[0],E=C.episodes[0]; const st=Engine.nieuwSpel(C,'E1',{});
const z=st.zichtbaar; const P=Predicaten;
const pairs=[
 ['patiëntkaart regel 1', find(/^- \*\*Mevrouw V\./).replace(/^- /,''), z.kop+' '+z.klachten],
 ['medicatieregel', find(/^- \*\*Medicatie/).replace(/^- /,''), 'Medicatie: '+z.medicatieTekst],
 ['labregel', find(/^- \*\*Lab/).replace(/^- /,''), 'Lab: '+z.labTekst],
 ['risicogroepregel (spel: meta, niet zichtbaar voor student)', find(/^- \*\*Geen risicogroep/).replace(/^- /,''), E.patient.meta.risicogroep],
 ['I1 vraag', quote(/^\| I1 \|/), E.invarianten[0].vraag],
 ['I3 vraag', quote(/^\| I3 \|/), E.invarianten[1].vraag],
 ['I4 vraag', quote(/^\| I4 \|/), E.invarianten[2].vraag],
 ['O1 gespeeld vraag', quote(/^\| O1 gespeeld/), E.feedbackExtra[0].vraag],
 ['reflectie terughoudend', quote(/^\| Profiel terughoudend/), E.profielen[0].reflectievraag],
 ['reflectie direct', quote(/^\| Profiel direct/), E.profielen[2].reflectievraag],
 ['zichtbaar zonder N1', quote(/Zonder N1/), E.zichtbaarAlsOntbreekt[0].tekst],
 ['zichtbaar V1 zonder Ev1', quote(/V1 zonder Ev1:/), E.zichtbaarAlsOntbreekt[1].tekst],
 ['statustekst af (casus E2 r190)', c(md[189]).replace(/^\s*- Fosfomycine: /,''), E.statusTeksten.af],
 ['statustekst aan (casus E2 r189)', c(md[188]).replace(/^\s*- Trimethoprim: /,''), E.statusTeksten.aan],
 ['repertoire', sec.find(x=>/^G1, G2/.test(x)), E.repertoire.join(', ')],
 ['bron I4', c(sec.find(x=>/^\| I4 \|/.test(x)).split('|')[3].trim()), E.invarianten[2].bron],
];
let seed=+process.argv[2]||777; const r=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const key=[]; let out='';
pairs.forEach((p,i)=>{const sw=r()<0.5; const X=sw?p[2]:p[1],Y=sw?p[1]:p[2]; key.push({nr:i+1,naam:p[0],X:sw?'spel':'bron',Y:sw?'bron':'spel',identiek:p[1]===p[2]});
 out+=`### Paar ${i+1} — ${p[0]}\nX: ${JSON.stringify(X)}\nY: ${JSON.stringify(Y)}\n\n`;});
fs.writeFileSync(root+'gauntlet/rapporten/S2_r4.sleutel.json',JSON.stringify(key,null,1));
console.log(out);

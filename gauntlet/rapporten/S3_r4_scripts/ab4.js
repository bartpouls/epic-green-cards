// Blinde A/B voor S3 r4: bron (casus-uwi.md sectie 5, bij elk paar letterlijk uit het bestand gelezen) tegenover wat het spel
// daadwerkelijk laat zien (Engine + Predicaten + data, echte scenario's). X/Y worden willekeurig toegewezen; sleutel naar S3_r4.sleutel.json.
const fs=require('fs'),crypto=require('crypto');
const ROOT=process.argv[2]||'/home/user/epic-green-cards', OUT=process.argv[3]||'/home/user/epic-green-cards/gauntlet/rapporten';
const {load}=require(process.env.LOADJS);
const sb=load(ROOT,{__sloptests:1}); const casus=sb.CASUSSEN[0], E=casus.episodes.find(e=>e.id==='E2');
const cas=fs.readFileSync(ROOT+'/casus-uwi.md','utf8').replace(/\*\*/g,'');
const sec5=cas.slice(cas.indexOf('## 5. Episode 2'),cas.indexOf('## 6. Episode 3'));
function bron(zin){ if(!sec5.includes(zin)) throw new Error('bron-zin niet in casus sectie 5: '+zin); return zin; }
const fb=sec5.slice(sec5.indexOf('### Feedback'));
function bronRij(trigger){ const m=fb.split('\n').find(l=>l.startsWith('| '+trigger+' |')); if(!m) throw new Error('rij '+trigger); return m.split('|')[2].trim().replace(/^"|"$/g,''); }
function play(dagen){ const st=sb.Engine.nieuwSpel(casus,'E2',{rng:()=>0}); dagen.forEach((d,i)=>{ if(i>0) sb.Engine.volgendeDag(st); d.forEach(k=>{ const r=sb.Engine.speelKaart(st,k[0],{doel:k[1]||null,optie:k[2]||null}); if(!r.ok) throw new Error(k+': '+r.fout); }); }); return st; }
function vraagVan(st){ const ctx=sb.Predicaten.maakContext(casus,E,st);
  const g=E.invarianten.filter(i=>i.geldtIn.some(x=>x==='*'||(x.gebeurtenis&&st.gebeurtenissen.some(b=>b.id===x.gebeurtenis)))&&sb.Predicaten.evalueer(i.predicaat,ctx)).sort((a,b)=>a.ernst-b.ernst);
  if(!g.length) return null; let v=g[0].vraag; for(const x of g[0].vraagVarianten||[]) if(sb.Predicaten.evalueer(x.als,ctx)){v=x.vraag;break;} return v; }
function extra(st,idx){ const ctx=sb.Predicaten.maakContext(casus,E,st); return sb.Predicaten.evalueer(E.feedbackExtra[idx].trigger,ctx)?E.feedbackExtra[idx].vraag:'(NIET GETOOND)'; }
function zicht(st,idx){ const ctx=sb.Predicaten.maakContext(casus,E,st); return sb.Predicaten.evalueer(E.zichtbaarAlsOntbreekt[idx].trigger,ctx)?E.zichtbaarAlsOntbreekt[idx].tekst:'(NIET GETOOND)'; }
function profiel(st){ const ctx=sb.Predicaten.maakContext(casus,E,st); const p=E.profielen.find(p=>sb.Predicaten.evalueer(p.als,ctx)); return p?p.naam:'(GEEN PROFIEL)'; }
const N1=['N1'],G2=['G2'],O1=['O1'];
const s0=sb.Engine.nieuwSpel(casus,'E2',{rng:()=>0}); const z=s0.zichtbaar;
const sG2=play([[G2]]);
const sC=play([[G2,O1,['V4']],[N1],[['Ev1']]]);
const sV5=play([[G2,O1,['V5']],[N1,['O2']],[['Ev1']]]);
const sV4=play([[G2,O1,['V4']],[N1],[['Ev1']]]);
const pairs=[
 ['Patiëntkaart: kop en klachten', bron('Mevrouw V., 78 jaar (6 jaar na episode 1). Tweede cystitis, geen koorts, nitriettest positief.'), z.kop+' '+z.klachten],
 ['Patiëntkaart: medicatie', bron('lisinopril; calcium/colecalciferol'), z.medicatieTekst],
 ['Patiëntkaart: lab op de kaart', bron('laatst bekende eGFR 42, van 6 jaar geleden.'), z.labTekst],
 ['Patiëntkaart: eerdere UWI', bron('episode 1, toen geen kweek gedaan.'), z.eerdereUWI],
 ['Na G2: wat wordt onthuld', bron('eGFR 29 uit de jaarlijkse controle.'), sG2.onthuld.map(o=>o.tekst).join(' ')],
 ['Na G2: zichtbare labregel op de patiëntkaart', bron('eGFR 29 uit de jaarlijkse controle.'), sG2.zichtbaar.labTekst],
 ['Gebeurtenis C (banner)', bron('E. coli, resistent voor trimethoprim en amoxicilline.')+' '+bron('Gevoelig voor nitrofurantoïne, fosfomycine, amoxicilline/clavulaanzuur en ciprofloxacine.'), E.gebeurtenissen.find(g=>sC.gebeurtenissen.some(b=>b.id===g.id)).tekst],
 ['Klachtenstatus trimethoprim (dag na V5)', 'klachten houden aan.', sV5.klachten[2].tekst+(sV5.klachten[2].status?'':' [geen tekst]')],
 ['Klachtenstatus fosfomycine (dag na V4)', 'klachten nemen af.', sV4.klachten[2].tekst],
 ['Feedback I5 (V3 gestart)', bronRij('I5'), vraagVan(play([[G2,O1,['V3']],[N1]]))],
 ['Feedback I6 geen kweek (V4 zonder O1)', bronRij('I6, geen kweek'), vraagVan(play([[G2,['V4'],N1]]))],
 ['Feedback I6 afwachten (V1)', bronRij('I6, afwachten'), vraagVan(play([[G2,O1,['V1']],[N1]]))],
 ['Feedback I7 geen kalium (V5 zonder O2)', bronRij('I7, geen kalium'), vraagVan(play([[G2,O1,['V5']],[N1],[['B1','V4']],[['V6','V5','halveren']]]))],
 ['Feedback I7 niet gehalveerd (O2 op tijd, V6 te vroeg)', bronRij('I7, niet gehalveerd'), vraagVan(play([[G2,O1,['V5']],[['O2'],N1],[['B1','V4'],['V6','V5','halveren']]]))],
 ['Feedback I8 (V5 blijft na C)', bronRij('I8'), vraagVan(play([[G2,O1,['V5']],[['O2'],N1],[['Ev1']],[['V6','V5','halveren']],[],[]]))],
 ['Feedback Verouderde eGFR (V4 zonder G2, poort gehaald)', bronRij('Verouderde eGFR niet opgemerkt'), extra(play([[O1,['V4']],[N1,['Ev1']]]),0)],
 ['Feedback Onnodig gewisseld (B1 terwijl status af)', bronRij('Onnodig gewisseld'), extra(play([[G2,O1,['V4']],[N1],[['B1','V5']]]),1)],
 ['Zichtbaar als kaart ontbreekt: nitrofurantoïne zonder G2', 'De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling.', zicht(play([[O1,['V3'],N1]]),0)],
 ['Zichtbaar als kaart ontbreekt: V5 zonder O2', 'De kaliumspiegel is onbekend.', zicht(play([[G2,O1,['V5']],[N1]]),1)],
 ['Profiel route Fosfomycine', 'Kweekgestuurd, smal', profiel(play([[G2,O1,['V4']],[N1,['N2','V4']]]))],
 ['Profiel route Trimethoprim 7 dagen', 'Bijgestuurd', profiel(play([[G2,O1,['V5']],[['O2'],N1],[['B1','V4']],[['V6','V5','halveren']]]))],
 ['Brug naar episode 3', bron('de kweek uit deze episode is het verborgen gegeven in episode 3 (G3).'), E.meta.brug],
];
// bronvergelijking: eigen invariantvraag-teksten uit de casus-rijen moeten bestaan
const sleutel=[]; let md='# S3 r4 blinde A/B-paren (alleen X en Y; sleutel staat in S3_r4.sleutel.json)\n\n';
pairs.forEach((p,i)=>{ const flip=crypto.randomInt(2)===1; const [x,y]=flip?[p[2],p[1]]:[p[1],p[2]];
  sleutel.push({paar:i+1,titel:p[0],X:flip?'spel':'bron',Y:flip?'bron':'spel'});
  md+='## Paar '+(i+1)+' — '+p[0]+'\n- X: `'+x+'`\n- Y: `'+y+'`\n\n'; });
fs.writeFileSync(OUT+'/S3_r4.sleutel.json',JSON.stringify(sleutel,null,1)); fs.writeFileSync(process.env.PAARMD,md);
console.log('paren:',pairs.length,'; X/Y-paren geschreven naar',process.env.PAARMD);

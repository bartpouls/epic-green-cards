const fs=require('fs');process.env.MET_TESTS='';
const O=require('./oracle.js'); const {sb,dataEval}=O; const casus=sb.CASUSSEN[0]; const root='/home/user/epic-green-cards';
const cas=fs.readFileSync(root+'/casus-uwi.md','utf8'); const s5=cas.slice(cas.indexOf('## 5. Episode 2'),cas.indexOf('## 6. Episode 3')).replace(/\*\*/g,'');
const cell=(label)=>{ const re=new RegExp('^\\|\\s*'+label+'\\s*\\|(.*)\\|\\s*$','m'); const m=s5.match(re); return m?m[1]:null; };
const bul=(start)=>{ const l=s5.split('\n').find(x=>x.startsWith('- '+start)); return l?l.slice(2):null; };
const fbSec=s5.slice(s5.indexOf('### Feedback'))+'';
const quoteIn=(rowStart)=>{ const l=fbSec.split('\n').find(x=>x.startsWith(rowStart)); const m=l&&l.match(/"([^"]+)"/); return m?m[1]:null; };
function play(spec,rng){ const st=sb.Engine.nieuwSpel(casus,'E2',{rng:rng||(()=>0.3)});
  for(const [d,k,doel,opt] of spec){ while(st.dag<d) sb.Engine.volgendeDag(st); const r=sb.Engine.speelKaart(st,k,{doel:doel||null,optie:opt||null}); if(!r.ok) throw new Error(k+r.fout); } return st; }
const E=casus.episodes.find(e=>e.id==='E2');
const stG2=play([[1,'G2']]); const stC=play([[1,'G2'],[1,'O1'],[1,'V5'],[2,'N1']]); sb.Engine.volgendeDag(stC);
const stF=play([[1,'G2'],[1,'O1'],[1,'V4'],[2,'N1']]); sb.Engine.volgendeDag(stF);
const stB=play([[1,'G2'],[1,'O1'],[1,'V5'],[2,'N1']]);
const Z0=sb.Engine.nieuwSpel(casus,'E2',{rng:()=>0.3}).zichtbaar;
const vr=spec=>dataEval(play(spec)).vraag;
const pairs=[
 ['kop+klachten', bul('Mevrouw V.').replace(/^Mevrouw V\., 78 jaar \(6 jaar na episode 1\)\./,m=>m), Z0.kop+' '+Z0.klachten],
 ['medicatie', bul('Medicatie:'), 'Medicatie: '+Z0.medicatieTekst],
 ['lab op kaart', bul('Lab op de kaart:'), 'Lab op de kaart: '+Z0.labTekst],
 ['eerdere UWI', bul('Eerdere UWI:'), 'Eerdere UWI: '+Z0.eerdereUWI],
 ['verborgen G2 (na G2)', bul('Verborgen achter G2:').split(' Daarmee')[0], 'Verborgen achter G2: '+stG2.onthuld[0].tekst],
 ['gebeurtenis C', 'E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor nitrofurantoïne, fosfomycine, amoxicilline/clavulaanzuur en ciprofloxacine.', stC.gebeurtenissen[0]?E.gebeurtenissen[0].tekst:'(C kwam niet)'],
 ['status trimethoprim', 'Trimethoprim: klachten houden aan.', 'Trimethoprim: '+stC.klachten[stC.dag].tekst],
 ['status fosfomycine', 'Fosfomycine: klachten nemen af.', 'Fosfomycine: '+stF.klachten[stF.dag].tekst],
 ['feedback I1', quoteIn('| I1 |')||'Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?', vr([[1,'G2'],[1,'O1'],[1,'V4']])],
 ['feedback Verouderde eGFR', quoteIn('| Verouderde eGFR'), E.feedbackExtra[0].vraag],
 ['feedback I5', quoteIn('| I5 |'), vr([[1,'G2'],[1,'O1'],[1,'V3'],[2,'N1']])],
 ['feedback I6 geen kweek', quoteIn('| I6, geen kweek'), vr([[1,'G2'],[1,'V4'],[1,'N1']])],
 ['feedback I6 afwachten', quoteIn('| I6, afwachten'), vr([[1,'G2'],[1,'V1'],[1,'N1']])],
 ['feedback I7 geen kalium', quoteIn('| I7, geen kalium'), vr([[1,'G2'],[1,'O1'],[1,'V5'],[2,'N1'],[3,'B1','V4']])],
 ['feedback I7 niet gehalveerd', quoteIn('| I7, niet gehalveerd'), vr([[1,'G2'],[1,'O1'],[1,'V5'],[2,'O2'],[2,'N1'],[3,'B1','V4']])],
 ['feedback I8', quoteIn('| I8 |'), vr([[1,'G2'],[1,'O1'],[1,'V5'],[2,'O2'],[2,'N1'],[4,'V6','V5','halveren']])],
 ['feedback Onnodig gewisseld', quoteIn('| Onnodig gewisseld'), E.feedbackExtra[1].vraag],
 ['zichtbaar nitrofurantoine', quoteIn('- **Nitrofurantoïne zonder G2:**')||(s5.match(/Nitrofurantoïne zonder G2:\s*"([^"]+)"/)||[])[1], E.zichtbaarAlsOntbreekt[0].tekst],
 ['zichtbaar V5 zonder O2', (s5.match(/V5 zonder O2:\s*"([^"]+)"/)||[])[1], E.zichtbaarAlsOntbreekt[1].tekst],
 ['titel', 'Episode 2 — level 2', E.titel],
 ['profielen', 'Kweekgestuurd, smal / Bijgestuurd', E.profielen.map(p=>p.naam).join(' / ')],
 ['brug', 'Brug: '+(s5.match(/Brug:\s*([^\n]+)/)||[])[1], 'Brug: '+E.meta.brug.replace(/^/,'')],
 ['bron I8', 'NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten', E.invarianten.find(i=>i.id==='I8').bron],
 ['repertoire', 'G1, G2, O1, O2, V1, V2, V3, V4, V5, N1, N2, Ev1, V6, B1, B2', E.repertoire.join(', ')],
];
module.exports={pairs};
if(require.main===module){
  let seed=+process.argv[2]||97; const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const key=[]; const out=[];
  pairs.forEach(([n,bron,spel],i)=>{ const brongaatX=rnd()<0.5; key.push({paar:i+1,naam:n,X:brongaatX?'bron':'spel',Y:brongaatX?'spel':'bron',gelijk:bron===spel});
    out.push(`## Paar ${i+1}\nX: ${brongaatX?bron:spel}\nY: ${brongaatX?spel:bron}\n`); });
  fs.writeFileSync('/home/user/epic-green-cards/gauntlet/rapporten/S3_r5.sleutel.json',JSON.stringify(key,null,1));
  fs.writeFileSync('/home/user/epic-green-cards/gauntlet/rapporten/S3_r5.paren.md',out.join('\n'));
  console.log(out.join('\n'));
}

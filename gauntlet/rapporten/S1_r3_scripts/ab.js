const fs=require('fs');const {maak,root}=require('./laad.js');
const md=fs.readFileSync(root+'/casus-uwi.md','utf8');const sb=maak({files:['casussen/uwi.js']});const C=sb.CASUSSEN[0];
const s3=md.slice(md.indexOf('## 3. Kaartenbibliotheek'),md.indexOf('## 4. Episode 1'));
const rij={};s3.split('\n').filter(l=>/^\| (G|O|V|B|N|Ev)\d+ \|/.test(l)).forEach(l=>{const c=l.replace(/^\| /,'').replace(/ \|$/,'').split(' | ');rij[c[0]]=c;});
const K=id=>C.kaarten.find(k=>k.id===id);
const eff=(id,ep)=>{const k=K(id);return k.effect[ep]!=null?k.effect[ep]:k.effect.alle;};
const dwn=(id,ep)=>{const d=K(id).downside;return typeof d==='object'?(d[ep]??'(geen downside voor '+ep+')'):d;};
const strip=s=>s.replace(/\*\*/g,'');
// bron = casuscel (opmaak ** verwijderd, want opmaak hoort niet in data); spel = wat de engine/UI voor die situatie uit de data leest
const paren=[
 ['G2 effect in E2 (kaart tonen na spelen)',strip(rij.G2[4]).match(/E2: (.*?) E3:/)[1],eff('G2','E2')],
 ['V3 effect in E3',strip(rij.V3[4]),eff('V3','E3')],
 ['V5 effect in E2',strip(rij.V5[4]),eff('V5','E2')],
 ['O1 effect in E3',strip(rij.O1[4]),eff('O1','E3')],
 ['O1 downside in E1',strip(rij.O1[5]).replace(/^E1: /,''),dwn('O1','E1')],
 ['O1 downside in E2 (casus: alleen E1)','(geen downside voor E2)',dwn('O1','E2')],
 ['Ev1 effect in E1',strip(rij.Ev1[4]),eff('Ev1','E1')],
 ['V6 effect in E3',strip(rij.V6[4]),eff('V6','E3')],
 ['B5 effect in E3',strip(rij.B5[4]),eff('B5','E3')],
 ['Ev2 bron',strip(rij.Ev2[6]),K('Ev2').bron],
 ['V7 downside',strip(rij.V7[5]),dwn('V7','E3')],
 ['N2 downside',strip(rij.N2[5]),dwn('N2','E1')],
 ['bronnen KNMP (casuskop)',strip(md.match(/\| Bronnen \| (.*) \|/)[1].split(' · ')[3]).replace(/ \[KNMP\]$/,''),C.bronnen.KNMP],
 ['titel',md.match(/^# (.*)$/m)[1],C.titel],
 ['label calcium (casus sectie 5/6 Medicatie)', 'calcium/colecalciferol', K('B3').doelen.E3[2].label],
];
let uit='# Blinde A/B, S1 ronde 3 (paren zonder sleutel)\n\n',sleutel=[];
paren.forEach((p,i)=>{const flip=Math.random()<0.5;const X=flip?p[2]:p[1],Y=flip?p[1]:p[2];sleutel.push({paar:i+1,situatie:p[0],X:flip?'spel':'bron',Y:flip?'bron':'spel'});
 uit+=`## Paar ${i+1}: ${p[0]}\nX: ${JSON.stringify(X)}\nY: ${JSON.stringify(Y)}\n\n`;});
fs.writeFileSync('/tmp/claude-0/-home-user-epic-green-cards/b9f5dc07-fd1d-5bf9-b208-00447555559b/scratchpad/S1_r3_paren.md',uit);
fs.writeFileSync(root+'/gauntlet/rapporten/S1_r3.sleutel.json',JSON.stringify(sleutel,null,1));
console.log(uit);

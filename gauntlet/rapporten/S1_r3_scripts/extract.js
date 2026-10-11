// Onafhankelijke extractie: leest casus-uwi.md zelf en vergelijkt teken voor teken met casussen/uwi.js
const fs=require('fs');const {maak,root}=require('./laad.js');
const md=fs.readFileSync(root+'/casus-uwi.md','utf8');
const sb=maak({files:['casussen/uwi.js']});const C=sb.CASUSSEN[0];
let fails=[],checks=0;
function eq(a,b,w){checks++;if(JSON.stringify(a)!==JSON.stringify(b))fails.push(w+'\n   casus: '+JSON.stringify(a)+'\n   data : '+JSON.stringify(b));}
// sectie 3 tabel
const s3=md.slice(md.indexOf('## 3. Kaartenbibliotheek'),md.indexOf('## 4. Episode 1'));
const rijen=s3.split('\n').filter(l=>/^\| (G|O|V|B|N|Ev)\d+ \|/.test(l));
eq(rijen.length,26,'aantal rijen');
const strip=s=>s.replace(/\*\*/g,'');
rijen.forEach((r,i)=>{
  const c=r.replace(/^\| /,'').replace(/ \|$/,'').split(' | ').map(strip);
  if(c.length!==7){fails.push('rij '+i+' heeft '+c.length+' cellen');return;}
  const [id,cat,label,vanaf,eff,down,bron]=c;
  const k=C.kaarten[i];
  eq(id,k.id,'volgorde pos '+i);
  eq(cat.replace(' ⊙',''),k.categorie,id+' categorie');
  eq(cat.includes('⊙'),k.doelkaart,id+' doelkaart');
  eq(label,k.label,id+' label');
  eq(+vanaf.slice(1),k.vanafEpisode,id+' vanaf');
  eq(bron,k.bron,id+' bron');
  // effect
  let eData;
  if(id==='G2'){ // casus splitst per episode
    const m=eff.match(/^E1: (.*?) E2: (.*?) E3: (.*)$/);
    eData=m?{E1:m[1],E2:m[2],E3:m[3]}:null; eq(eData,k.effect,id+' effect');
  } else eq({alle:eff},k.effect,id+' effect');
  // downside
  if(id==='O1') eq({E1:down.replace(/^E1: /,'')},k.downside,id+' downside (E1-voorvoegsel)'); else eq(down,k.downside,id+' downside');
});
// kop
const kop=md.match(/\| Bronnen \| (.*) \|/)[1];
const bn={};kop.split(' · ').forEach(s=>{s=strip(s);const m=s.match(/^(.*) \[(\w+)\]$/);bn[m[2]]=m[1];});
eq(bn,C.bronnen,'bronnen');
eq(md.match(/^# (.*)$/m)[1],C.titel,'titel');
eq(md.match(/\| Casus-id \| `(.*)` \|/)[1],C.id,'id');
eq(md.match(/\| Versie \| (\d+\.\d+)/)[1],C.versie,'versie');
// comedicatie labels uit sectie 6 & 5
eq(/calcium\/colecalciferol/.test(md),true,'calcium label bestaat in casus');
const lab={};C.kaarten.forEach(k=>k.doelen&&Object.values(k.doelen).forEach(l=>l.forEach(d=>lab[d.id]=d.label)));
eq(lab.calcium,'calcium/colecalciferol','calcium label');eq(lab.lisinopril,'lisinopril','lisinopril label');eq(lab.spironolacton,'spironolacton','spironolacton label');
// ** in data
eq(JSON.stringify(C).includes('**'),false,'geen ** in data');
// functies in data
let fn=0;(function w(x){if(typeof x==='function')fn++;else if(x&&typeof x==='object')Object.values(x).forEach(w);})(C);eq(fn,0,'functies in data');
// B5 vóór B4
eq(C.kaarten.map(k=>k.id).join(','),'G1,G2,G3,O1,O2,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,B1,B2,B3,B5,B4,N1,N2,N3,Ev1,Ev2,Ev3','volgorde');
// bouwopdracht 6.2 opties
const bo=fs.readFileSync(root+'/bouwopdracht-uwi.md','utf8');
const s62=bo.slice(bo.indexOf('### 6.2'),bo.indexOf('### 6.3'));
const orows=s62.split('\n').filter(l=>/^\| (Trimethoprim|Amoxicilline\/clavulaanzuur|Ciprofloxacine|Lisinopril) /.test(l));
eq(orows.length,4,'opties rijen');
orows.forEach(r=>{const c=r.replace(/^\| /,'').replace(/ \|$/,'').split(' | ');const m=c[0].match(/\((V\d+)\)/);const doel=m?m[1]:c[0].toLowerCase();
 const t=c[1].split(' · ');const o=C.kaarten.find(k=>k.id==='V6').opties[doel];
 eq(t,o.map(x=>x.tekst),'opties '+doel);
 // goed: tekst in 'Goed' kolom (zoek optie-tekst als substring)
 const goedCel=c[2];const goed=t.filter(x=>goedCel.includes(x));
 eq(goed,o.filter(x=>x.goed).map(x=>x.tekst),'goed '+doel+' (cel: '+goedCel.slice(0,60)+')');});
eq(Object.keys(C.kaarten.find(k=>k.id==='V6').opties),['V5','V8','V7','lisinopril'],'optie-doelen');
console.log('checks',checks,'afwijkingen',fails.length);fails.forEach(f=>console.log('AFWIJKING',f));

// Eigen mutatieset op de S1-data; draait ALLEEN testgroep data-kaarten.
const fs=require('fs'),vm=require('vm');const root='/home/user/epic-green-cards';
function ctx(){const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
 ['casussen/uwi.js','tests/testlib.js','tests/data-kaarten.tests.js'].forEach(f=>vm.runInContext(fs.readFileSync(root+'/'+f,'utf8'),sb,{filename:f}));return sb;}
const sb=ctx();const ORIG=JSON.parse(JSON.stringify(sb.CASUSSEN));
function draai(data){sb.CASUSSEN=data;const r=sb.Test.draaiAlles('data-kaarten');return r.filter(x=>!x.ok).length;}
if(draai(JSON.parse(JSON.stringify(ORIG)))!==0){console.log('basis niet groen');process.exit(1);}
const muts=[];
function walk(x,path,f){f(x,path);if(x&&typeof x==='object')Object.keys(x).forEach(k=>walk(x[k],path.concat([k]),f));}
function get(o,p){return p.reduce((a,k)=>a[k],o);}
walk(ORIG[0],[0],()=>{});
const base={0:ORIG[0]};
walk(base[0],[0],(v,p)=>{
  if(p[1]==='episodes')return; // niet S1
  const lbl=p.join('.');
  const add=(naam,fn)=>muts.push({naam:lbl+' :: '+naam,fn});
  const parentSet=(o,val)=>{const par=get(o,p.slice(0,-1));par[p[p.length-1]]=val;};
  if(p.length<=1)return;
  const t=typeof v;
  if(t==='string'){
    add('append x',o=>parentSet(o,v+'x'));
    if(v.length>1)add('drop laatste teken',o=>parentSet(o,v.slice(0,-1)));
    if(v.length>1)add('drop eerste teken',o=>parentSet(o,v.slice(1)));
    add('hoofdletter flip eerste',o=>parentSet(o,(v[0]===v[0].toUpperCase()?v[0].toLowerCase():v[0].toUpperCase())+v.slice(1)));
    if(/[—–×ïë⊙≥≤]|°/.test(v)||/ /.test(v)){
      add('typografie/spatie vervangen',o=>parentSet(o,v.replace(/—/,'-').replace(/–/,'-').replace(/×/,'x').replace(/ï/,'i').replace(/ /,'  ')));
      add('NBSP in plaats van spatie',o=>parentSet(o,v.replace(/ /,' ')));
    }
    if(/\.$/.test(v))add('punt weg',o=>parentSet(o,v.slice(0,-1)));
    if(/\./.test(v))add('punt-> komma',o=>parentSet(o,v.replace('.',',')));
    if(/,/.test(v))add('komma->punt',o=>parentSet(o,v.replace(',','.')));
    if(/\d/.test(v))add('cijfer +1',o=>parentSet(o,v.replace(/\d/,d=>String((+d+1)%10))));
  } else if(t==='number'){add('+1',o=>parentSet(o,v+1));add('-1',o=>parentSet(o,v-1));}
  else if(t==='boolean'){add('flip',o=>parentSet(o,!v));}
  else if(v===null){add('null->"x"',o=>parentSet(o,'x'));add('null->{}',o=>parentSet(o,{}));}
  if(v&&t==='object'){
    const isArr=Array.isArray(v);
    if(isArr){
      v.forEach((_,i)=>{
        add('verwijder element '+i,o=>{get(o,p).splice(i,1);});
        add('dupliceer element '+i,o=>{const a=get(o,p);a.splice(i,0,JSON.parse(JSON.stringify(a[i])));});
        if(i<v.length-1)add('wissel elementen '+i+'/'+(i+1),o=>{const a=get(o,p);const x=a[i];a[i]=a[i+1];a[i+1]=x;});
      });
    } else {
      Object.keys(v).forEach(k=>{
        add('verwijder sleutel '+k,o=>{delete get(o,p)[k];});
        add('hernoem sleutel '+k,o=>{const ob=get(o,p);ob[k+'X']=ob[k];delete ob[k];});
      });
      add('extra sleutel aanbevolen',o=>{get(o,p).aanbevolen=true;});
    }
    add('leeg maken',o=>parentSet(o,isArr?[]:{}));
  }
});
// handmatige (semantische) mutaties
const kaart=(o,id)=>o[0].kaarten.find(k=>k.id===id);
const H=[];
const h=(n,fn)=>H.push({naam:'HAND :: '+n,fn});
['V6','B1','B2','N2'].forEach(id=>['E2','E3'].forEach(e=>{h(id+' '+e+' vereist wordt waarheid',o=>{kaart(o,id).doelen[e][0].vereist={p:'waarheid',waarde:true};});}));
h('N2 E1 vereist wordt actief',o=>{kaart(o,'N2').doelen.E1[0].vereist={p:'actief',middel:'V3'};});
h('B1 E3 niet->arg weg',o=>{kaart(o,'B1').doelen.E3[2].vereist.args[1]=kaart(o,'B1').doelen.E3[2].vereist.args[1].arg;});
h('B2 vereist gestart i.p.v. actief',o=>{kaart(o,'B2').doelen.E3[0].vereist.p='gestart';});
h('B5 vereist zonder niet',o=>{kaart(o,'B5').doelen.E3[1].vereist=kaart(o,'B5').doelen.E3[1].vereist.arg;});
h('B3 vereist niet',o=>{kaart(o,'B3').doelen.E3[2].vereist={p:'niet',arg:kaart(o,'B3').doelen.E3[2].vereist};});
h('V6 E3 V7 doel weg',o=>{kaart(o,'V6').doelen.E3.splice(1,1);});
h('V6 E2 doel V8 erbij',o=>{kaart(o,'V6').doelen.E2.push({id:'V8',label:'Amoxicilline/clavulaanzuur',vereist:{p:'gestart',middel:'V8'}});});
h('V6 E2 doel V7 erbij',o=>{kaart(o,'V6').doelen.E2.push({id:'V7',label:'Ciprofloxacine',vereist:{p:'gestart',middel:'V7'}});});
h('V6 E3 doel calcium erbij',o=>{kaart(o,'V6').doelen.E3.push({id:'calcium',label:'calcium/colecalciferol',vereist:{p:'medicatieActief',id:'calcium'}});});
h('V6 E3 doel spironolacton erbij',o=>{kaart(o,'V6').doelen.E3.push({id:'spironolacton',label:'spironolacton',vereist:{p:'medicatieActief',id:'spironolacton'}});});
h('V6 E1 doelen erbij',o=>{kaart(o,'V6').doelen.E1=[{id:'V5',label:'Trimethoprim',vereist:{p:'gestart',middel:'V5'}}];});
h('B1 E2 doel V7 erbij',o=>{kaart(o,'B1').doelen.E2.push({id:'V7',label:'Ciprofloxacine',vereist:{p:'waarheid',waarde:true}});});
h('B1 E3 V10 weg',o=>{kaart(o,'B1').doelen.E3.pop();});
h('B2 E3 V10 weg',o=>{kaart(o,'B2').doelen.E3.pop();});
h('B2 E3 V9 weg',o=>{kaart(o,'B2').doelen.E3.splice(5,1);});
h('N2 E3 V9 weg',o=>{kaart(o,'N2').doelen.E3.splice(5,1);});
h('N2 E3 V10 weg',o=>{kaart(o,'N2').doelen.E3.pop();});
h('N2 E2 V3 weg',o=>{kaart(o,'N2').doelen.E2.shift();});
h('N2 E2 V7 erbij',o=>{kaart(o,'N2').doelen.E2.push({id:'V7',label:'Ciprofloxacine',vereist:{p:'gestart',middel:'V7'}});});
h('N2 E1 V2 erbij',o=>{kaart(o,'N2').doelen.E1.push({id:'V2',label:'Uitgesteld recept',vereist:{p:'gestart',middel:'V2'}});});
h('N2 E3 comedicatie erbij',o=>{kaart(o,'N2').doelen.E3.push({id:'lisinopril',label:'lisinopril',vereist:{p:'medicatieActief',id:'lisinopril'}});});
h('Ev2 E3 calcium erbij',o=>{kaart(o,'Ev2').doelen.E3.push({id:'calcium',label:'calcium/colecalciferol'});});
h('Ev2 E3 vereist erbij',o=>{kaart(o,'Ev2').doelen.E3[0].vereist={p:'medicatieActief',id:'lisinopril'};});
h('Ev2 E3 volgorde omgekeerd',o=>{kaart(o,'Ev2').doelen.E3.reverse();});
h('B4 E3 doel V8 erbij',o=>{kaart(o,'B4').doelen.E3.push({id:'V8',label:'Amoxicilline/clavulaanzuur',vereist:{p:'actief',middel:'V8'}});});
h('B3 E3 doel V7 erbij',o=>{kaart(o,'B3').doelen.E3.push({id:'V7',label:'Ciprofloxacine',vereist:{p:'actief',middel:'V7'}});});
h('B3 E2 doelen erbij',o=>{kaart(o,'B3').doelen.E2=[{id:'lisinopril',label:'lisinopril',vereist:{p:'medicatieActief',id:'lisinopril'}}];});
h('B5 E3 calcium weg',o=>{kaart(o,'B5').doelen.E3.pop();});
h('B3 E3 lisinopril weg',o=>{kaart(o,'B3').doelen.E3.shift();});
h('B4 E3 V7 vereist op gestart',o=>{kaart(o,'B4').doelen.E3[0].vereist.p='gestart';});
h('V6 opties lisinopril goed op stoppen',o=>{const l=kaart(o,'V6').opties.lisinopril;l[0].goed=undefined;delete l[0].goed;l[1].goed=true;});
h('V6 opties V7 goed halveren erbij',o=>{kaart(o,'V6').opties.V7[1].goed=true;});
h('V6 opties V5 goed weg',o=>{delete kaart(o,'V6').opties.V5[0].goed;});
h('V6 opties V8 extra optie',o=>{kaart(o,'V6').opties.V8.push({tekst:'875/125 mg 3 dd'});});
h('V6 opties extra doel V9',o=>{kaart(o,'V6').opties.V9=[{tekst:'halveren'}];});
h('V6 opties V5 volgorde omgekeerd',o=>{kaart(o,'V6').opties.V5.reverse();});
h('V6 opties sleutelvolgorde (V8 voor V5)',o=>{const op=kaart(o,'V6').opties;kaart(o,'V6').opties={V8:op.V8,V5:op.V5,V7:op.V7,lisinopril:op.lisinopril};});
h('V6 doelen E3 volgorde omgekeerd',o=>{kaart(o,'V6').doelen.E3.reverse();});
h('rollen wissel<->stop',o=>{const r=o[0].rollen;const x=r.wissel;r.wissel=r.stop;r.stop=x;});
h('rollen pauzeer<->hervat',o=>{const r=o[0].rollen;const x=r.pauzeer;r.pauzeer=r.hervat;r.hervat=x;});
h('rollen hervat->B4',o=>{o[0].rollen.hervat='B4';});
h('rollen extra sleutel',o=>{o[0].rollen.start='V4';});
h('rollen sleutelvolgorde',o=>{const r=o[0].rollen;o[0].rollen={stop:r.stop,wissel:r.wissel,pauzeer:r.pauzeer,hervat:r.hervat};});
h('raadplegen bronnen volgorde',o=>{o[0].raadplegen.bronnen.reverse();});
h('raadplegen bron weg',o=>{o[0].raadplegen.bronnen.pop();});
h('raadplegen bron erbij',o=>{o[0].raadplegen.bronnen.push('G');});
h('raadplegen titel leeg',o=>{o[0].raadplegen.titel='';});
h('raadplegen TODO weg',o=>{delete o[0].raadplegen.TODO_BART;});
h('raadplegen richtlijntekst',o=>{o[0].raadplegen.tekst='Behandel 5 dagen.';});
h('todoBart K4 verwijderd',o=>{o[0].todoBart.splice(3,1);});
h('todoBart K5 plek leeg',o=>{o[0].todoBart[4].plek='';});
h('todoBart extra regel',o=>{o[0].todoBart.push({id:'TODO_BART-K6',vraag:'v',gekozenLezing:'l',plek:'p'});});
h('todoBart volgorde',o=>{o[0].todoBart.reverse();});
h('todoBart K4 vraag genoemde lijst: B4 -> B3',o=>{o[0].todoBart[3].vraag=o[0].todoBart[3].vraag.replace('B4: V7','B4: V8');});
h('todoBart K4 gekozenLezing leeg stuk',o=>{o[0].todoBart[3].gekozenLezing='';});
h('kaart TODO_BART G2 weg',o=>{delete kaart(o,'G2').TODO_BART;});
h('kaart TODO_BART V6 weg',o=>{delete kaart(o,'V6').TODO_BART;});
h('kaart TODO_BART N3 weg',o=>{delete kaart(o,'N3').TODO_BART;});
h('kaart TODO_BART Ev1 volgorde',o=>{const k=kaart(o,'Ev1');k.TODO_BART=k.TODO_BART.split(' | ').reverse().join(' | ');});
h('kaart TODO_BART extra op V9',o=>{kaart(o,'V9').TODO_BART=o[0].todoBart[0].vraag;});
h('kaart functie',o=>{kaart(o,'G1').effect.alle=function(){};});
h('kaart undefined',o=>{kaart(o,'G1').extra=undefined;});
h('K1 label NBSP in G2',o=>{kaart(o,'G2').label=kaart(o,'G2').label.replace(' ',' ');});
h('kaarten B4/B5 volgorde',o=>{const a=o[0].kaarten;const i=a.findIndex(k=>k.id==='B5');const x=a[i];a[i]=a[i+1];a[i+1]=x;});
h('titel streepje',o=>{o[0].titel=o[0].titel.replace('—','–');});
h('bronnen KNMP aanhalingstekens typografisch',o=>{o[0].bronnen.KNMP=o[0].bronnen.KNMP.replace(/"/g,'“');});
h('G2 effect E2 zonder (verborgen)',o=>{kaart(o,'G2').effect.E2='eGFR 29.';});
h('G2 effect alle i.p.v. per episode',o=>{kaart(o,'G2').effect={alle:'E1: eGFR 42, recent. E2: eGFR 29 (verborgen). E3: eGFR 28, bevestigd.'};});
h('V3 effect gesplitst E1/E2/E3',o=>{kaart(o,'V3').effect={E1:'5 dagen 2 dd 100 mg mga. In een risicogroep: 7 dagen.'};});
h('V5 effect voorvoegsel weg',o=>{kaart(o,'V5').effect.alle='3 dagen 1 dd 300 mg. Risicogroep: 7 dagen.';});
h('O1 downside string i.p.v. object',o=>{kaart(o,'O1').downside='E1: niet geïndiceerd, kost doelmatigheid';});
h('O1 downside E2 erbij',o=>{kaart(o,'O1').downside.E2='niet geïndiceerd, kost doelmatigheid';});
h('O1 downside zonder E1 prefix string',o=>{kaart(o,'O1').downside='niet geïndiceerd, kost doelmatigheid';});
h('doelkaart ⊙ N2 false',o=>{kaart(o,'N2').doelkaart=false;});
h('niet-doelkaart V4 doelen {}',o=>{kaart(o,'V4').doelen={};});
h('niet-doelkaart V4 opties',o=>{kaart(o,'V4').opties={};});
h('categorie V6 -> "Voorschrijven ⊙"',o=>{kaart(o,'V6').categorie='Voorschrijven ⊙';});
h('vanafEpisode V6 -> 1 met doelen E1',o=>{kaart(o,'V6').vanafEpisode=1;});
h('Ev2 bron ingekort',o=>{kaart(o,'Ev2').bron='Bart';});
h('G3 bron ingekort',o=>{kaart(o,'G3').bron='NHG';});
h('kop extra veld',o=>{o[0].extra='x';});
h('kop veld episodes weg',o=>{delete o[0].episodes;});
h('kop veld todoBart weg',o=>{delete o[0].todoBart;});
H.forEach(m=>muts.push(m));
const G={};let overleefd=[],geslagen=0,noop=[];
for(const m of muts){
  const data=JSON.parse(JSON.stringify(ORIG));
  try{m.fn(data);}catch(e){console.log('mutatiefout',m.naam,e.message);continue;}
  if(JSON.stringify(data)===JSON.stringify(ORIG)){noop.push(m.naam);continue;}
  const rood=draai(data);
  const gebied=/\.doelen\./.test(m.naam)?'doelen':/\.vereist/.test(m.naam)?'vereist':/\.opties/.test(m.naam)?'opties':/\.rollen/.test(m.naam)||/rollen/.test(m.naam)?'rollen':/todoBart|TODO_BART/.test(m.naam)?'todoBart':/raadplegen/.test(m.naam)?'raadplegen':/\.(effect|downside|label|bron|categorie|vanafEpisode|doelkaart|id)\b/.test(m.naam)?'kaartvelden':'overig';G[gebied]=G[gebied]||[0,0];G[gebied][0]++;if(rood===0){overleefd.push(m.naam);G[gebied][1]++;}else geslagen++;
}
console.log('no-op (identiek aan origineel, niet meegeteld)',noop.length);console.log('mutaties totaal',muts.length,'gedood',geslagen,'overleefd',overleefd.length);
console.log('per gebied [mutaties, overleefd]',JSON.stringify(G));overleefd.forEach(n=>console.log('OVERLEEFD',n));

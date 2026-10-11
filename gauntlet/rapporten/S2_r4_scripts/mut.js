const fs=require('fs'),vm=require('vm');const root='/home/user/epic-green-cards/';
globalThis.window=globalThis;
for(const f of ['casussen/uwi.js','casussen/uwi-e1.js','regels/predicaten.js','engine/engine.js','tests/testlib.js']) vm.runInThisContext(fs.readFileSync(root+f,'utf8'),{filename:f});
const lijst=[]; Test.registreer=(g,n,fn)=>lijst.push([n,fn]);
vm.runInThisContext(fs.readFileSync(root+'tests/data-e1.tests.js','utf8'));
const C=CASUSSEN[0]; const idx=C.episodes.findIndex(e=>e.id==='E1');
const E0=JSON.parse(JSON.stringify(C.episodes[idx])); const TB0=JSON.parse(JSON.stringify(C.todoBart));
const K=o=>JSON.parse(JSON.stringify(o));
const muts=[]; // {naam, fn(e,tb)}
function get(o,path){ for(const p of path) o=o[p]; return o; }
function walk(x,path){
  const pstr='E1'+path.map(p=>typeof p==='number'?'['+p+']':'.'+p).join('');
  const isTodo=path.some(p=>typeof p==='string'&&/^TODO_BART/.test(p));
  if(typeof x==='string'){
    const par=path.slice(0,-1), key=path[path.length-1];
    const set=(e,v)=>{get(e,par)[key]=v};
    muts.push([pstr+' laatste teken weg',e=>set(e,x.slice(0,-1))]);
    if(x.length>2) muts.push([pstr+' hoofdletter-flip eerste teken',e=>set(e,(x[0]===x[0].toUpperCase()?x[0].toLowerCase():x[0].toUpperCase())+x.slice(1))]);
    muts.push([pstr+' trailing spatie',e=>set(e,x+' ')]);
    if(x.includes(' ')) muts.push([pstr+' eerste spatie -> NBSP',e=>set(e,x.replace(' ',' '))]);
    muts.push([pstr+' extra slotpunt/leesteken',e=>set(e,x+'.')]);
    const m=x.search(/[ëïíé≥]/); if(m>=0) muts.push([pstr+' accent weg',e=>set(e,x.slice(0,m)+x[m].normalize('NFD')[0]+x.slice(m+1))]);
    muts.push([pstr+' middelste teken vervangen',e=>{const i=Math.floor(x.length/2);set(e,x.slice(0,i)+'#'+x.slice(i+1))}]);
  } else if(typeof x==='number'){ muts.push([pstr+' +1',e=>{get(e,path.slice(0,-1))[path[path.length-1]]=x+1}]); }
  else if(typeof x==='boolean'){ muts.push([pstr+' flip',e=>{get(e,path.slice(0,-1))[path[path.length-1]]=!x}]); }
  else if(x===null){ muts.push([pstr+' null -> "x"',e=>{get(e,path.slice(0,-1))[path[path.length-1]]='x'}]); }
  else if(Array.isArray(x)){
    if(x.length) muts.push([pstr+' laatste element weg',e=>{get(e,path).pop()}]);
    if(x.length>1) muts.push([pstr+' omgekeerd',e=>{get(e,path).reverse()}]);
    muts.push([pstr+' extra element',e=>{get(e,path).push(x.length&&typeof x[0]==='object'?K(x[0]):'V9')}]);
    x.forEach((v,i)=>walk(v,path.concat(i)));
  } else if(x&&typeof x==='object'){
    if(!isTodo&&path.length>0) muts.push([pstr+' extra sleutel',e=>{get(e,path).extra='x'}]);
    for(const k of Object.keys(x)){ muts.push([pstr+'.'+k+' sleutel weg',e=>{delete get(e,path)[k]}]); walk(x[k],path.concat(k)); }
  }
}
walk(E0,[]);
// casus.todoBart-mutaties (E1)
TB0.forEach((t,i)=>{ if(!/^TODO_BART-E1-/.test(t.id)) return;
  muts.push(['todoBart['+t.id+'] vraag laatste teken weg',(e,tb)=>{tb[i].vraag=tb[i].vraag.slice(0,-1)}]);
  muts.push(['todoBart['+t.id+'] lezing laatste teken weg',(e,tb)=>{tb[i].gekozenLezing=tb[i].gekozenLezing.slice(0,-1)}]);
  muts.push(['todoBart['+t.id+'] plek +x',(e,tb)=>{tb[i].plek+='x'}]);
  muts.push(['todoBart['+t.id+'] weg',(e,tb)=>{tb.splice(i,1)}]);
  muts.push(['todoBart['+t.id+'] extra sleutel',(e,tb)=>{tb[i].extra='x'}]);
  muts.push(['todoBart['+t.id+'] id-nummer',(e,tb)=>{tb[i].id=t.id+'0'}]);
});
muts.push(['todoBart dubbele E1-1',(e,tb)=>{tb.push(K(tb.find(t=>t.id==='TODO_BART-E1-1')))}]);
muts.push(['todoBart extra E1-8',(e,tb)=>{tb.push({id:'TODO_BART-E1-8',vraag:'v',gekozenLezing:'l',plek:'p'})}]);
// handmatige predicaat/semantiek-mutaties
const H=[
 ['I1 en->of top',e=>{e.invarianten[0].predicaat.p='en'}],
 ['I3 en->of',e=>{e.invarianten[1].predicaat.p='of'}],
 ['I4 > -> >=',e=>{e.invarianten[2].predicaat.op='>='}],
 ['I4 > -> <',e=>{e.invarianten[2].predicaat.op='<'}],
 ['I1 niet verwijderd',e=>{e.invarianten[0].predicaat.args[1]=e.invarianten[0].predicaat.args[1].arg}],
 ['I1 nietGespeeld->gespeeld',e=>{e.invarianten[0].predicaat.args[0].p='gespeeld'}],
 ['I3 volgorde args',e=>{e.invarianten[1].predicaat.args.reverse()}],
 ['I1 args reverse',e=>{e.invarianten[0].predicaat.args.reverse()}],
 ['invarianten volgorde I3,I1,I4',e=>{e.invarianten=[e.invarianten[1],e.invarianten[0],e.invarianten[2]]}],
 ['invarianten volgorde I4 eerst',e=>{e.invarianten.unshift(e.invarianten.pop())}],
 ['profielen: Gedeelde regie eerst',e=>{e.profielen.unshift(e.profielen.splice(1,1)[0])}],
 ['duurzaamheid regels 2<->3',e=>{const r=e.score.duurzaamheid.regels;[r[1],r[2]]=[r[2],r[1]]}],
 ['doelmatigheid regels omgekeerd',e=>{e.score.doelmatigheid.regels.reverse()}],
 ['doelmatigheid delta O2 -2',e=>{e.score.doelmatigheid.regels[1].delta=-2}],
 ['doelmatigheid delta O1 +1',e=>{e.score.doelmatigheid.regels[0].delta=1}],
 ['zichtbaar tekst omgewisseld',e=>{const z=e.zichtbaarAlsOntbreekt;[z[0].tekst,z[1].tekst]=[z[1].tekst,z[0].tekst]}],
 ['zichtbaar volgorde omgekeerd',e=>{e.zichtbaarAlsOntbreekt.reverse()}],
 ['repertoire G3 erbij',e=>{e.repertoire.push('G3')}],
 ['repertoire V6 vervangt N2',e=>{e.repertoire[10]='V6'}],
 ['repertoire swap V1/V2',e=>{const r=e.repertoire;[r[4],r[5]]=[r[5],r[4]]}],
 ['antibiotica V6',e=>{e.antibiotica[2]='V6'}],
 ['startToestanden string',e=>{e.startToestanden='cystitis'}],
 ['werkzaamheid V5 -> nietWerkzaam',e=>{e.werkzaamheid.cystitis.nietWerkzaam.push(e.werkzaamheid.cystitis.werkzaam.pop())}],
 ['werkzaamheid extra toestand',e=>{e.werkzaamheid.weefselinvasie={werkzaam:[],nietWerkzaam:[]}}],
 ['werkzaam met als-voorwaarde',e=>{e.werkzaamheid.cystitis.werkzaam[0].als={p:'waarheid',waarde:true}}],
 ['knoppen dagen 7',e=>{e.knoppen.aantalDagen=7}],
 ['knoppen acties 2',e=>{e.knoppen.actiesPerBeurt=2}],
 ['knoppen raadplegen 1',e=>{e.knoppen.raadplegenKost=1}],
 ['gebeurtenissen niet leeg',e=>{e.gebeurtenissen.push({id:'A'})}],
 ['verborgen entry',e=>{e.patient.verborgen.push({kaart:'G2',onthult:'x'})}],
 ['waar eGFR 29',e=>{e.patient.waar.eGFR=29}],
 ['waar risicogroep true',e=>{e.patient.waar.risicogroep=true}],
 ['zichtbaar eGFR 29',e=>{e.patient.zichtbaar.lab.eGFR=29}],
 ['zichtbaar lab datum',e=>{e.patient.zichtbaar.lab.datum='6 jaar geleden'}],
 ['zichtbaar medicatie 2 middelen',e=>{e.patient.zichtbaar.medicatie.push('spironolacton')}],
 ['patient.medicatie label',e=>{e.patient.medicatie[0].label='Lisinopril'}],
 ['zichtbaar leeftijd 75',e=>{e.patient.zichtbaar.leeftijd=75}],
 ['zichtbaar sleutel risicogroep=false',e=>{e.patient.zichtbaar.risicogroep=false}],
 ['zichtbaar sleutel hint',e=>{e.patient.zichtbaar.hint='kies V3'}],
 ['zichtbaar klachten verklap (meta in klachten)',e=>{e.patient.zichtbaar.klachten+=' Geen risicogroep.'}],
 ['zichtbaar.kop met risicogroep',e=>{e.patient.zichtbaar.kop='Mevrouw V., 72 jaar. Geen risicogroep.'}],
 ['meta.risicogroep naar patient.risicogroep',e=>{e.patient.risicogroep=e.patient.meta.risicogroep;delete e.patient.meta.risicogroep}],
 ['statusTeksten geenVerbetering48 string',e=>{e.statusTeksten.geenVerbetering48='Na 48 uur geen verbetering.'}],
 ['statusTeksten af zonder punt + casus anders',e=>{e.statusTeksten.af='klachten nemen af'}],
 ['statusTeksten aan/af omgewisseld',e=>{const s=e.statusTeksten;[s.af,s.aan]=[s.aan,s.af]}],
 ['feedbackExtra dubbel',e=>{e.feedbackExtra.push(K(e.feedbackExtra[0]))}],
 ['feedbackExtra vraag O1 -> I1 vraag',e=>{e.feedbackExtra[0].vraag=e.invarianten[0].vraag}],
 ['profiel reflectievraag Gedeelde regie gevuld',e=>{e.profielen[1].reflectievraag='Wat?'}],
 ['profiel Terughoudend reflectie -> null',e=>{e.profielen[0].reflectievraag=null}],
 ['profiel naam "Direct behandelen, 1e keus"',e=>{e.profielen[2].naam='Direct behandelen, 1e keus'}],
 ['profiel Direct splitsen in drie',e=>{const p=e.profielen[2];e.profielen.splice(2,1,K(p),K(p),K(p))}],
 ['duurzaamheid regel 1 verwijderd',e=>{e.score.duurzaamheid.regels.shift()}],
 ['duurzaamheid start toegevoegd',e=>{e.score.duurzaamheid.start=3}],
 ['doelmatigheid min/max toegevoegd',e=>{e.score.doelmatigheid.min=1}],
 ['predicaat vorm genest K',e=>{e.invarianten[1].predicaat.args[0]={p:'gespeeld',K:{kaart:'V1'}}}],
 ['I3 Ev1 -> nietGespeeld Ev1 plus N1',e=>{e.invarianten[1].predicaat.args.push({p:'nietGespeeld',kaart:'N1'})}],
 ['I4 n als string',e=>{e.invarianten[2].predicaat.n='1'}],
 ['invariant id I2',e=>{e.invarianten[1].id='I2'}],
 ['invariant bron NHG -> NHG, KNMP',e=>{e.invarianten[0].bron='NHG, KNMP'}],
 ['invariant extra vraagVarianten',e=>{e.invarianten[0].vraagVarianten=[]}],
 ['invariant weglaatDownside',e=>{e.invarianten[0].weglaatDownside='N1'}],
 ['episode.raadplegen',e=>{e.raadplegen={titel:'x',bronnen:[]}}],
 ['afrondenPasNaGebeurtenissen',e=>{e.afrondenPasNaGebeurtenissen=true}],
 ['episode id e1',e=>{e.id='e1'}],
 ['level 2',e=>{e.level=2}],
];
H.forEach(h=>muts.push(h));
const only=process.argv[2]; 
let kill=0,surv=[],t0=Date.now(),n=0;
for(const [naam,fn] of muts){
  n++; const e=K(E0), tb=K(TB0);
  try{ fn(e,tb);}catch(x){ console.log('MUTATIEFOUT',naam,x.message); continue;}
  C.episodes[idx]=e; C.todoBart.length=0; tb.forEach(t=>C.todoBart.push(t));
  let killed=false, by=null;
  for(const [tn,tf] of lijst){ try{tf();}catch(x){killed=true;by=tn.slice(0,12);break;} }
  if(killed) kill++; else surv.push(naam);
}
console.log(JSON.stringify({totaal:muts.length,gedood:kill,overlevers:surv.length,sec:(Date.now()-t0)/1000}));
surv.forEach(s=>console.log('OVERLEVER:',s));

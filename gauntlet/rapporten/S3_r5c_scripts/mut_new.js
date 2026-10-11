// >=100 NIEUWE data-mutaties (ronde 5 criticus), semantisch ontworpen per onderdeel. Draait groep data-e2; overlevers worden met het
// eigen orakel (20k-stijl, hier 4000 routes + 4000 gestructureerde) op gedragsverschil gecontroleerd.
process.env.MET_TESTS='1';
const O=require('./oracle.js'); const {sb,oracle,dataEval,randomRoute,tl}=O;
const casus=sb.CASUSSEN[0]; const idx=casus.episodes.findIndex(e=>e.id==='E2');
const orig=JSON.parse(JSON.stringify(casus.episodes[idx]));
const clone=x=>JSON.parse(JSON.stringify(x));
const M=[]; const add=(naam,f)=>M.push({naam,f});
const inv=(e,id)=>e.invarianten.find(i=>i.id===id);
// --- 1. ernst: elke invariant op elke andere ernst (6x4=24)
for(const id of ['I1','I4','I5','I6','I7','I8']) for(const n of [1,2,3,4,5]) if(n!==orig.invarianten.find(i=>i.id===id).ernst) add(`ernst ${id}=${n}`,e=>{inv(e,id).ernst=n;});
// --- 2. predicaatnaam-wissels (sibling)
const sib={gespeeld:'nietGespeeld',nietGespeeld:'gespeeld',en:'of',of:'en',voor:'na',na:'voor',gestart:'actief'};
(function walk(x,path,label){ if(!x||typeof x!=='object') return; if(Array.isArray(x)){x.forEach((v,i)=>walk(v,path.concat([i]),label));return;}
  if(typeof x.p==='string'&&sib[x.p]&&path.length>0&&/^(invarianten|profielen|feedbackExtra|zichtbaarAlsOntbreekt|score)/.test(path[0]+'')) {
    add(`p-wissel ${path.join('.')} ${x.p}->${sib[x.p]}`,e=>{ let o=e; for(const k of path) o=o[k]; o.p=sib[o.p]; }); }
  for(const k of Object.keys(x)) if(k!=='meta'&&!k.startsWith('TODO')) walk(x[k],path.concat([k]),label); })(orig,[],'');
// --- 3. repertoire: elke kaart weg (15) en V8/B3 erbij (2)
orig.repertoire.forEach((k,i)=>add(`repertoire -${k}`,e=>{ e.repertoire.splice(i,1); }));
add('repertoire +V8',e=>e.repertoire.push('V8')); add('repertoire +B3',e=>e.repertoire.push('B3')); add('repertoire +Ev2',e=>e.repertoire.push('Ev2'));
// --- 4. knoppen
add('acties 2',e=>{e.knoppen.actiesPerBeurt=2;}); add('acties 4',e=>{e.knoppen.actiesPerBeurt=4;}); add('dagen 5',e=>{e.knoppen.aantalDagen=5;}); add('dagen 8',e=>{e.knoppen.aantalDagen=8;}); add('raadplegenKost 1',e=>{e.knoppen.raadplegenKost=1;});
// --- 5. gebeurtenis C
add('C n=3',e=>{e.gebeurtenissen[0].trigger.n=3;}); add('C n=5',e=>{e.gebeurtenissen[0].trigger.n=5;}); add('C zonder alleenAls',e=>{delete e.gebeurtenissen[0].trigger.alleenAlsGespeeld;});
add('C alleenAls O2',e=>{e.gebeurtenissen[0].trigger.alleenAlsGespeeld='O2';}); add('C type naKaartVanKaart',e=>{e.gebeurtenissen[0].trigger={type:'naKaartVanKaart',kaart:'O1',n:3};});
add('C zet resistent V4',e=>{e.gebeurtenissen[0].zet.resistent=['V4'];}); add('C zet resistent +V4',e=>{e.gebeurtenissen[0].zet.resistent.push('V4');}); add('C zet resistent leeg',e=>{e.gebeurtenissen[0].zet.resistent=[];}); add('C zet gevoelig +V5',e=>{e.gebeurtenissen[0].zet.gevoelig.push('V5');});
add('C tekst eind punt weg',e=>{e.gebeurtenissen[0].tekst=e.gebeurtenissen[0].tekst.slice(0,-1);}); add('C tekst Gevoelig->gevoelig',e=>{e.gebeurtenissen[0].tekst=e.gebeurtenissen[0].tekst.replace('Gevoelig','gevoelig');}); add('C id D',e=>{e.gebeurtenissen[0].id='D';});
add('C titel weg',e=>{delete e.gebeurtenissen[0].titel;}); add('C tweede kopie',e=>{e.gebeurtenissen.push(clone(e.gebeurtenissen[0]));});
// --- 6. werkzaamheid
add('werkzaam +V5',e=>{e.werkzaamheid.cystitis.werkzaam.push({kaart:'V5'});}); add('werkzaam +V3',e=>{e.werkzaamheid.cystitis.werkzaam.push({kaart:'V3'});}); add('werkzaam V4->V3',e=>{e.werkzaamheid.cystitis.werkzaam[0].kaart='V3';}); add('werkzaam leeg',e=>{e.werkzaamheid.cystitis.werkzaam=[];});
add('toestand sleutel hernoemd',e=>{e.werkzaamheid.weefselinvasie=e.werkzaamheid.cystitis; delete e.werkzaamheid.cystitis;}); add('startToestand leeg-string',e=>{e.startToestanden=['uitdroging'];}); add('antibiotica zonder V3',e=>{e.antibiotica=['V4','V5'];}); add('antibiotica +V8',e=>{e.antibiotica.push('V8');}); add('antibiotica zonder V5',e=>{e.antibiotica=['V3','V4'];});
// --- 7. statusTeksten
add('status af hoofdletter',e=>{e.statusTeksten.af='Klachten nemen af.';}); add('status aan zonder punt',e=>{e.statusTeksten.aan='klachten houden aan';}); add('status geenVerbetering48 tekst',e=>{e.statusTeksten.geenVerbetering48='Na 48 uur geen verbetering.';}); add('status af/aan omgewisseld',e=>{const t=e.statusTeksten.af;e.statusTeksten.af=e.statusTeksten.aan;e.statusTeksten.aan=t;});
// --- 8. patient
add('waar eGFR 30',e=>{e.patient.waar.eGFR=30;}); add('waar eGFR 31',e=>{e.patient.waar.eGFR=31;}); add('waar eGFR 28',e=>{e.patient.waar.eGFR=28;}); add('risicogroep false',e=>{e.patient.waar.risicogroep=false;}); add('risicogroep weg',e=>{delete e.patient.waar.risicogroep;});
add('zichtbaar eGFR 29',e=>{e.patient.zichtbaar.lab.eGFR=29;}); add('zichtbaar eGFR 40',e=>{e.patient.zichtbaar.lab.eGFR=40;}); add('zichtbaar datum 5 jaar',e=>{e.patient.zichtbaar.lab.datum='van 5 jaar geleden';}); add('zichtbaar leeftijd 79',e=>{e.patient.zichtbaar.leeftijd=79;});
add('zichtbaar kop zonder punt',e=>{e.patient.zichtbaar.kop=e.patient.zichtbaar.kop.slice(0,-1);}); add('zichtbaar kop 72',e=>{e.patient.zichtbaar.kop=e.patient.zichtbaar.kop.replace('78','72');}); add('zichtbaar medicatie zonder calcium',e=>{e.patient.zichtbaar.medicatie.pop();}); add('zichtbaar klachten koorts',e=>{e.patient.zichtbaar.klachten='Tweede cystitis, koorts, nitriettest positief.';});
add('medicatie +spironolacton',e=>{e.patient.medicatie.push({id:'spironolacton',label:'spironolacton'});}); add('medicatie calcium label',e=>{e.patient.medicatie[1].label='calcium';});
add('verborgen kaart G1',e=>{e.patient.verborgen[0].kaart='G1';}); add('verborgen waarde 30',e=>{e.patient.verborgen[0].waarde=30;}); add('verborgen onthult kort',e=>{e.patient.verborgen[0].onthult='eGFR 29.';}); add('verborgen zonder zichtbaar-patch',e=>{delete e.patient.verborgen[0].zichtbaar;}); add('verborgen patch labTekst weg',e=>{delete e.patient.verborgen[0].zichtbaar.labTekst;}); add('verborgen sleutel weg',e=>{delete e.patient.verborgen[0].sleutel;}); add('verborgen leeg',e=>{e.patient.verborgen=[];}); add('verborgen +G3',e=>{e.patient.verborgen.push({kaart:'G3',onthult:'x'});});
// --- 9. score
add('dur start 2',e=>{e.score.duurzaamheid.start=2;}); add('dur start 4',e=>{e.score.duurzaamheid.start=4;}); add('dur delta -2',e=>{e.score.duurzaamheid.regels[0].delta=-2;}); add('dur delta +1',e=>{e.score.duurzaamheid.regels[0].delta=1;}); add('dur terwijl aan',e=>{e.score.duurzaamheid.regels[0].perKeer.terwijlKlachten='aan';}); add('dur kaart B2',e=>{e.score.duurzaamheid.regels[0].perKeer.kaart='B2';}); add('dur zonder terwijl',e=>{delete e.score.duurzaamheid.regels[0].perKeer.terwijlKlachten;});
add('doelm punten 3->2',e=>{e.score.doelmatigheid.regels[0].punten=2;}); add('doelm fallback 3',e=>{e.score.doelmatigheid.regels[1].punten=3;}); add('doelm fallback 1',e=>{e.score.doelmatigheid.regels[1].punten=1;}); add('doelm regels omgewisseld',e=>{e.score.doelmatigheid.regels.reverse();}); add('doelm zonder G2-eis',e=>{e.score.doelmatigheid.regels[0].als=e.score.doelmatigheid.regels[0].als.args[1];});
add('doelm V5 niet meegeteld',e=>{const o=e.score.doelmatigheid.regels[0].als.args[1].arg.args; o.pop();}); add('doelm V1 niet meegeteld',e=>{const o=e.score.doelmatigheid.regels[0].als.args[1].arg.args; o.shift();});
// --- 10. profielen
add('profielen omgewisseld',e=>{e.profielen.reverse();}); add('profiel1 mist B1-eis',e=>{e.profielen[0].als=e.profielen[0].als.args[0];}); add('profiel2 mist na',e=>{e.profielen[1].als.args.pop();}); add('profiel1 V5',e=>{e.profielen[0].als.args[0].kaart='V5';}); add('profiel naam hoofdletter',e=>{e.profielen[0].naam='kweekgestuurd, smal';}); add('profiel2 naam',e=>{e.profielen[1].naam='Bijgestuurd.';}); add('profiel reflectievraag tekst',e=>{e.profielen[0].reflectievraag='Waarom?';});
// --- 11. feedbackExtra / zichtbaar
add('fb1 wanneer altijd',e=>{e.feedbackExtra[0].wanneer='altijd';}); add('fb2 wanneer altijd',e=>{e.feedbackExtra[1].wanneer='altijd';}); add('fb omgewisseld',e=>{e.feedbackExtra.reverse();}); add('fb2 drempel >1',e=>{e.feedbackExtra[1].trigger.waarde=1;}); add('fb2 terwijl aan',e=>{e.feedbackExtra[1].trigger.teller.terwijlKlachten='aan';}); add('fb1 zonder V5',e=>{e.feedbackExtra[0].trigger.args.pop();}); add('fb1 vraag punt weg',e=>{e.feedbackExtra[0].vraag=e.feedbackExtra[0].vraag.slice(0,-1);});
add('zicht1 mist G2-eis',e=>{e.zichtbaarAlsOntbreekt[0].trigger.args.pop();}); add('zicht2 O2->O1',e=>{e.zichtbaarAlsOntbreekt[1].trigger.args[1].kaart='O1';}); add('zicht2 V5->V4',e=>{e.zichtbaarAlsOntbreekt[1].trigger.args[0].middel='V4';}); add('zicht omgewisseld',e=>{e.zichtbaarAlsOntbreekt.reverse();}); add('zicht1 tekst 28',e=>{e.zichtbaarAlsOntbreekt[0].tekst=e.zichtbaarAlsOntbreekt[0].tekst.replace('29','28');});
// --- 12. vraagVarianten / invariant-details
add('I6 varianten omgewisseld',e=>{inv(e,'I6').vraagVarianten.reverse();}); add('I7 varianten omgewisseld',e=>{inv(e,'I7').vraagVarianten.reverse();}); add('I6 variant zonder tweede',e=>{inv(e,'I6').vraagVarianten.pop();}); add('I7 variant zonder eerste',e=>{inv(e,'I7').vraagVarianten.shift();}); add('I7 vraag eGFR 28',e=>{inv(e,'I7').vraag=inv(e,'I7').vraag.replace('29','28');});
add('I8 geldtIn *',e=>{inv(e,'I8').geldtIn=['*'];}); add('I8 offset 0',e=>{inv(e,'I8').predicaat.args[1].op.offset=0;}); add('I8 offset 2',e=>{inv(e,'I8').predicaat.args[1].op.offset=2;}); add('I8 klachten af',e=>{inv(e,'I8').predicaat.args[2].waarde='af';}); add('I8 zonder klachten',e=>{inv(e,'I8').predicaat.args.pop();}); add('I8 uitSet gevoelig',e=>{inv(e,'I8').predicaat.args[1].uitSet='gevoelig';});
add('I7 van 2',e=>{inv(e,'I7').predicaat.args[2].args[0].arg.van=2;}); add('I7 tot 4',e=>{inv(e,'I7').predicaat.args[2].args[0].arg.tot=4;}); add('I7 V6 van 4',e=>{inv(e,'I7').predicaat.args[2].args[1].arg.van=4;}); add('I7 V6 van 2',e=>{inv(e,'I7').predicaat.args[2].args[1].arg.van=2;}); add('I7 optie halveren->verdubbelen',e=>{inv(e,'I7').predicaat.args[2].args[1].arg.optie='verdubbelen';}); add('I7 zonder risicogroep',e=>{inv(e,'I7').predicaat.args.shift();}); add('I7 start->kaart',e=>{inv(e,'I7').predicaat.args[2].args[0].arg.anker={kaart:'V5'};}); add('I7 gestart->gespeeld',e=>{const a=inv(e,'I7').predicaat.args[1]; a.p='gespeeld'; a.kaart=a.middel; delete a.middel;}); add('I7 of->en',e=>{inv(e,'I7').predicaat.args[2].p='en';});
add('I5 grens 31',e=>{inv(e,'I5').predicaat.args[1].waarde=31;}); add('I5 grens 29',e=>{inv(e,'I5').predicaat.args[1].waarde=29;}); add('I5 gestart->gespeeld',e=>{const a=inv(e,'I5').predicaat.args[0]; a.p='gespeeld'; a.kaart=a.middel; delete a.middel;}); add('I4 n 2',e=>{inv(e,'I4').predicaat.n=2;}); add('I4 op >=',e=>{inv(e,'I4').predicaat.op='>=';});
add('I1 nietGespeeld N2',e=>{inv(e,'I1').predicaat.kaart='N2';}); add('I6 mist V2',e=>{inv(e,'I6').predicaat.args[1].args.splice(1,1);}); add('I6 mist geen-antibioticum-tak',e=>{inv(e,'I6').predicaat.args[1].args.pop();}); add('I6 V4-check weg',e=>{inv(e,'I6').predicaat.args[1].args.splice(3,1);});
add('I-volgorde I8 voor I6',e=>{const a=e.invarianten; const i6=a.findIndex(x=>x.id==='I6'),i8=a.findIndex(x=>x.id==='I8'); const t=a[i6];a[i6]=a[i8];a[i8]=t;}); add('I-volgorde I4 voor I1',e=>{const a=e.invarianten; const t=a[0];a[0]=a[1];a[1]=t;}); add('I8 bron zonder',e=>{inv(e,'I8').bron='NHG';}); add('I1 vraag Mevrouw->mevrouw',e=>{inv(e,'I1').vraag=inv(e,'I1').vraag.replace('Mevrouw','mevrouw');});
add('invariant weglaatDownside erbij',e=>{inv(e,'I1').weglaatDownside='N1';}); add('I5 vraag zonder vraagteken',e=>{inv(e,'I5').vraag=inv(e,'I5').vraag.replace('?','.');});
console.error('mutanten',M.length);
let killed=0; const surv=[];
function groepRood(){ try{ return sb.Test.draaiAlles('data-e2').filter(x=>!x.ok).length; }catch(err){ return 1; } }
if(groepRood()) { console.error('basis rood'); process.exit(1); }
const only=process.argv[2]?new RegExp(process.argv[2]):null;
for(const m of M){ if(only&&!only.test(m.naam)) continue;
  const e=clone(orig); try{ m.f(e); }catch(err){ console.error('mutatie faalt',m.naam,err.message); continue; }
  if(JSON.stringify(e)===JSON.stringify(orig)){ console.error('GEEN VERANDERING',m.naam); continue; }
  casus.episodes[idx]=e;
  if(groepRood()){ killed++; casus.episodes[idx]=clone(orig); continue; }
  let div=null; try{ for(let i=0;i<3000&&!div;i++){ const st=randomRoute(i%3===0?1:0); const a=oracle(st),b=dataEval(st); for(const k of ['ids','vraag','dur','doelm','prof','verouderd','onnodig','zicht']) if(JSON.stringify(a[k])!==JSON.stringify(b[k])){ div=k+' :: '+tl(st); break; } } }catch(err){ div='(fout) '+err.message; }
  surv.push({naam:m.naam,div}); casus.episodes[idx]=clone(orig); }
console.log(JSON.stringify({totaal:M.length,gedood:killed,overleefd:surv.length,gedragsgaten:surv.filter(s=>s.div).length}));
surv.forEach(s=>console.log((s.div?'GEDRAG ':'equiv?? ')+s.naam+(s.div?'   '+s.div:'')));

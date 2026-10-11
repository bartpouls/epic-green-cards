const {load}=require('./load.js');
const sb=load(process.argv[2],{__sloptests:1});const O=require('./orac_mod.js')(sb,1);
const casus=sb.CASUSSEN[0];
function play(dagen){ const st=sb.Engine.nieuwSpel(casus,'E2',{rng:()=>0}); 
  dagen.forEach((d,i)=>{ if(i>0) sb.Engine.volgendeDag(st); d.forEach(k=>{ const r=sb.Engine.speelKaart(st,k[0],{doel:k[1]||null,optie:k[2]||null}); if(!r.ok) throw new Error('zet mislukt dag '+(i+1)+' '+k+': '+r.fout); }); }); return st; }
function rep(naam,dagen,verwacht){ let st; try{ st=play(dagen);}catch(e){ console.log('XX',naam,e.message); return; }
  const a=O.ref(st),b=O.dataEval(st); const ok=JSON.stringify(b.ids)===JSON.stringify(verwacht)&&JSON.stringify(a)===JSON.stringify(b);
  console.log((ok?'ok  ':'FOUT')+' '+naam+' -> data '+JSON.stringify(b.ids)+(b.vraag?' | '+b.vraag.slice(0,40):'')+' ref '+JSON.stringify(a.ids)+' C-dag='+(st.gebeurtenissen[0]?st.gebeurtenissen[0].dag:'-')+' klachten='+st.klachten.slice(1).map(k=>k.status).join('/')); }
const N1=['N1'],G2=['G2'],O1=['O1'];
// geldige routes uit de casus
rep('casus Fosfomycine G2>O1>V4+N1+N2',[[G2,O1,['V4']],[N1,['N2','V4']],[['Ev1']],[],[],[],[]],[]);
rep('casus Trimethoprim V5 d1 O2 d2 V6 d4 B1 na uitslag',[[G2,O1,['V5']],[['O2'],N1],[['B1','V4']],[['V6','V5','halveren']]],[]);
rep('casus V5 d1, O2 d2, V6 d4 (V5 nog actief), B1 d4',[[G2,O1,['V5']],[['O2'],N1],[],[['V6','V5','halveren'],['B1','V4']]],[]);
rep('casus: V6 op dag 5',[[G2,O1,['V5']],[['O2'],N1],[['B1','V4']],[],[['V6','V5','halveren']]],[]);
rep('casus: O2 dag 4 (verschil 3)',[[G2,O1,['V5']],[N1],[['B1','V4']],[['O2'],['V6','V5','halveren']]],[]);
rep('V5 dag1 O2 dag5 (verschil 4) -> I7',[[G2,O1,['V5']],[N1],[['B1','V4']],[['V6','V5','halveren']],[['O2']]],['I7']);
rep('V5 d1, V6 halveren d3 (verschil 2) -> I7',[[G2,O1,['V5']],[['O2'],N1],[['B1','V4'],['V6','V5','halveren']]],['I7']);
// foutroutes enkel
rep('I1: geen N1',[[G2,O1,['V4']]],['I1']);
rep('I4: V4+V5 tegelijk',[[G2,O1,['V4']],[N1,['V5'],['O2']],[],[],[['V6','V5','halveren']]],['I4']);
rep('I4: V3+V4 tegelijk (V3 indexpositie 0)',[[G2,O1,['V3']],[N1,['V4']]],['I4','I5']);
rep('I5: V3 direct',[[G2,O1,['V3']],[N1]],['I5']);
rep('I5: V4 dag1, B1->V3 dag2',[[G2,O1,['V4']],[N1,['B1','V3']]],['I5']);
rep('I5: V3 zonder G2',[[O1,['V3'],N1]],['I5']);
rep('I6 kweek: V4 zonder O1',[[G2,['V4'],N1]],['I6']);
rep('I6 kweek via B1-start: V4,O1 daarna B1->V5, O2, V6',[[G2,['V4'],O1],[N1,['B1','V5']],[['O2']],[],[['V6','V5','halveren']]],['I6']);
rep('I6 afwachten V1',[[G2,O1,['V1'],],[N1]],['I6']);
rep('I6 niets',[[G2,O1,N1]],['I6']);
rep('I7 via B1 naar V5 zonder O2',[[G2,O1,['V4']],[N1,['B1','V5']],[],[['B1','V4']],[['V6','V5','halveren']]],['I7']);
rep('I8: V5 blijft actief',[[G2,O1,['V5']],[['O2'],N1],[['Ev1']],[['V6','V5','halveren']],[],[]],['I8']);
rep('I8 met B1-start: V4 d1; B1->V5 d2; O2 d3; V6 d5; B1->V4 d5',[[G2,O1,['V4']],[N1,['B1','V5']],[['O2']],[],[['V6','V5','halveren'],['B1','V4']]],['I8']);
rep('I8: B1->V5 na C (wissel naar resistent middel)',[[G2,O1,['V4']],[N1,['Ev1']],[['B1','V5'],['O2']],[],[['V6','V5','halveren']]],['I7']);
rep('I8: V5 na C met B1->V5 en nooit gewisseld',[[G2,O1,['V4']],[N1,['Ev1']],[['B1','V5']],[['O2']],[],[['V6','V5','halveren']],[]],['I8']);
rep('V4 + O2 + V6 lisinopril (afleiders)',[[G2,O1,['V4']],[N1,['O2'],['V6','lisinopril','halveren']]],[]);
rep('geen enkel V6/O2: fosfomycine met Ev1/N2',[[G2,O1,['V4']],[N1,['N2','V4'],['Ev1']],[],[],[],[],[]],[]);
rep('B2 stoppen V4 ->',[[G2,O1,['V4']],[N1,['B2','V4']]],['I6']);

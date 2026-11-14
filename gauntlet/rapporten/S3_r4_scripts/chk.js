const {load}=require('./load.js');const sb=load(process.argv[2],{__sloptests:1});const O=require('./orac_mod.js')(sb,1);const casus=sb.CASUSSEN[0];
function play(dagen){ const st=sb.Engine.nieuwSpel(casus,'E2',{rng:()=>0}); dagen.forEach((d,i)=>{ if(i>0) sb.Engine.volgendeDag(st); d.forEach(k=>{ const r=sb.Engine.speelKaart(st,k[0],{doel:k[1]||null,optie:k[2]||null}); if(!r.ok) throw new Error(k+r.fout); }); }); return st; }
const N1=['N1'],G2=['G2'],O1=['O1'];
console.log('I6 B1-start:',O.dataEval(play([[G2,['V4'],O1],[N1,['B1','V5']],[['O2'],['B1','V4']],[],[['V6','V5','halveren']]])).ids);
const st=play([[G2,O1,['V4']],[N1,['B1','V5']]]);const E=casus.episodes[1];const ctx=sb.Predicaten.maakContext(casus,E,st);console.log('tel',sb.Predicaten.tel(E.score.duurzaamheid.regels[0].perKeer,ctx));
const st2=play([[G2,O1,['V5']],[['O2'],N1],[['B1','V4']]]);const ctx2=sb.Predicaten.maakContext(casus,E,st2);console.log('tel2',sb.Predicaten.tel(E.score.duurzaamheid.regels[0].perKeer,ctx2), st2.klachten.map(k=>k.status));

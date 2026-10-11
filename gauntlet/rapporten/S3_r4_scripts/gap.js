const fs=require('fs'),path=require('path');const {load}=require('./load.js');const root=process.argv[2];
function mk(oud,nw){ const f='regels/predicaten.js'; const src=fs.readFileSync(path.join(root,f),'utf8'); if(!src.includes(oud)) throw new Error('nf'); const p=process.env.SPDIR+'/gp/'+Math.random()+'.js'; fs.writeFileSync(p,src.replace(oud,nw)); return load(root,{[f]:p}); }
function run(sb,dagen){ const casus=sb.CASUSSEN[0],E=casus.episodes.find(e=>e.id==='E2'); const st=sb.Engine.nieuwSpel(casus,'E2',{rng:()=>0});
 dagen.forEach((d,i)=>{ if(i>0) sb.Engine.volgendeDag(st); d.forEach(k=>{ const r=sb.Engine.speelKaart(st,k[0],{doel:k[1]||null,optie:k[2]||null}); if(!r.ok) throw new Error(k+r.fout); }); });
 const ctx=sb.Predicaten.maakContext(casus,E,st); try{ return E.invarianten.filter(i=>sb.Predicaten.evalueer(i.predicaat,ctx)).map(i=>i.id).join(','); }catch(e){ return 'FOUT: '+e.message; } }
const N1=['N1'],G2=['G2'],O1=['O1'];
const routes={
 'I4 met V3 (V3+V4)': [[G2,O1,['V3']],[N1,['V4']]],
 'I4 per moment (V4+V5 tegelijk, daarna V5 gestopt)': [[G2,O1,['V4']],[N1,['V5']],[['O2'],['B2','V5']],[],[['V6','V5','halveren']]],
 'geldige route fosfomycine + O2 (afleider, geen V5)': [[G2,O1,['V4']],[N1,['O2']],[['Ev1']]],
};
const orig=load(root);
const mut={ 'V3 indexpositie 0 telt niet als actief (ab().indexOf(r.kaart) > 0)': mk("} else if (ab().indexOf(r.kaart) >= 0) {","} else if (ab().indexOf(r.kaart) > 0) {"),
 'I4 alleen eindstand (maxAb = tel())': mk("maxAb = Math.max(maxAb, tel());","maxAb = tel();"),
 'opDagRelatief zonder anker geeft fout (a === undefined)': mk("var a = eerste(ctx, A);\n      if (a === null) return false;\n      return alle(ctx, K).some(function (r) { var v = r.dag - a.dag;","var a = eerste(ctx, A);\n      if (a === undefined) return false;\n      return alle(ctx, K).some(function (r) { var v = r.dag - a.dag;") };
for(const [n,r] of Object.entries(routes)){ console.log('ROUTE',n,'| origineel:',run(orig,r)||'(geen schending)'); for(const [mn,sb] of Object.entries(mut)) console.log('    mutant',mn,'->',run(sb,r)||'(geen schending)'); }

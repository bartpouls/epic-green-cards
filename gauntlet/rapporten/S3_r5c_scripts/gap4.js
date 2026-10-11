// De 4 overlevers uit ronde 4 + extra: worden ze nu door groep data-e2 gedood?
const fs=require('fs'),path=require('path');const {load}=require('./load.js');const root='/home/user/epic-green-cards';const SP=process.env.SPDIR+'/x';
const M=[
 ['V3 index 0 niet actief','regels/predicaten.js',"} else if (ab().indexOf(r.kaart) >= 0) {","} else if (ab().indexOf(r.kaart) > 0) {"],
 ['I4 alleen eindstand','regels/predicaten.js',"maxAb = Math.max(maxAb, tel());","maxAb = tel();"],
 ['opDagRelatief a===undefined','regels/predicaten.js',"var a = eerste(ctx, A);\n      if (a === null) return false;\n      return alle(ctx, K).some(function (r) { var v = r.dag - a.dag;","var a = eerste(ctx, A);\n      if (a === undefined) return false;\n      return alle(ctx, K).some(function (r) { var v = r.dag - a.dag;"],
 ['tel terwijlKlachten genegeerd','regels/predicaten.js',"if (t.terwijlKlachten === undefined || ctx.status(r.dag) === t.terwijlKlachten) n++;","n++;"],
 ['gestart mids.indexOf(doel) > 0','regels/predicaten.js',"mids.indexOf(regel.doel) >= 0","mids.indexOf(regel.doel) > 0"],
];
for(const [n,f,o,nw] of M){ const src=fs.readFileSync(path.join(root,f),'utf8'); if(!src.includes(o)){console.log('NIET GEVONDEN',n);continue;}
  const p=path.join(SP,'m'+Math.random()+'.js'); fs.writeFileSync(p,src.replace(o,nw));
  const sb=load(root,{over:{[f]:p}}); let r=sb.Test.draaiAlles('data-e2').filter(x=>!x.ok);
  console.log((r.length?'GEDOOD ':'OVERLEEFD ')+n+' rood='+r.length+(r[0]?' ('+r[0].naam.slice(0,70)+')':'')); }

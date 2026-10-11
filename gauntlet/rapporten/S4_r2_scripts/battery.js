// Draait alle geldige routes en foutroutes (beide A/B-volgordes) en geeft een handtekening per route.
const crypto=require("crypto");
const {runPlan,samenvat}=require("./bot.js");
const G=require("./geldig.js"); const {F}=require("./fouten.js");
const sig={};
function run(naam,plan,vol,tot){
  try{ const o=samenvat(runPlan(plan,vol,{tot})); sig[naam+"|"+vol]={g:o.geschonden,v:o.vraag,s:o.score,p:o.profiel,x:o.extra,z:o.zicht,k:o.klachten,t:o.tijdlijn}; }
  catch(e){ sig[naam+"|"+vol]={fout:String(e.message).slice(0,80)}; }
}
for(const vol of ["AB","BA"]){
  for(const [n,x] of Object.entries(G.R)){ if(x.alleen&&x.alleen!==vol) continue; run("geldig:"+n,x.plan,vol,x.tot); }
  F.forEach((x,i)=>run("fout"+i+":"+x.id,x.plan,vol,x.tot));
}
if(require.main===module){
  if(process.argv[2]==="json") console.log(JSON.stringify(sig));
  else console.log(Object.keys(sig).length,"routes");
}
module.exports={sig};

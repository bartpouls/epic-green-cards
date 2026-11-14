const {runPlan,samenvat}=require("./bot.js");
const {F}=require("./fouten.js");
let ok=0,slecht=0;
for(const x of F){ for(const vol of ["AB","BA"]){
  let o; try{ o=samenvat(runPlan(x.plan,vol,{tot:x.tot})); }catch(e){ console.log("??",x.id,vol,x.naam,"->",e.message); slecht++; continue; }
  const goed = o.geschonden.length===1 && o.geschonden[0]===x.id;
  if(goed) ok++; else slecht++;
  console.log((goed?"OK  ":"FOUT"),x.id,vol,x.naam,"-> geschonden:",o.geschonden.join(","),"| vraag:",(o.vraag||"").slice(0,40), goed?"":"\n      "+o.tijdlijn+" | geb "+o.geb+" | kl "+o.klachten+" | rest "+o.rest);
}}
console.log("OK",ok,"slecht",slecht);

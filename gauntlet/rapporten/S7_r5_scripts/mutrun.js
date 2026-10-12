// usage: node mutrun.js spec.json shard nshards out.json
require("./load.js");
const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
for(const f of ["engine/logging.js","ui/ui.js","tests/testlib.js","tests/data-kaarten.tests.js","tests/data-e1.tests.js","tests/data-e2.tests.js","tests/data-e3.tests.js","tests/data-referentie.tests.js","tests/predicaten.tests.js","tests/routes.js","tests/evaluatie.tests.js","tests/engine.tests.js"]) vm.runInThisContext(fs.readFileSync(root+"/"+f,"utf8"),{filename:f});
const orig=fs.readFileSync(root+"/engine/engine.js","utf8");
const spec=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
const sh=+process.argv[3],n=+process.argv[4];const uit=[];
const filt=process.argv[6]||"engine";
spec.forEach((m,i)=>{ if(i%n!==sh)return;
  let src; try{ src=m.src!=null?m.src:orig.slice(0,m.from)+m.to+orig.slice(m.end); }catch(e){return}
  let res;
  try{ vm.runInThisContext(src,{filename:"mut"+i}); res=Test.draaiAlles(filt);}catch(e){ uit.push({i,naam:m.naam,gedood:true,reden:"laadfout: "+e.message.slice(0,80)});return}
  const rood=res.filter(r=>!r.ok);
  uit.push({i,naam:m.naam,gedood:rood.length>0,rood:rood.length,eerste:rood.slice(0,2).map(r=>r.naam.slice(0,70)),fout:(rood[0]||{}).fout&&String(rood[0].fout).slice(0,300)});
});
fs.writeFileSync(process.argv[5],JSON.stringify(uit));

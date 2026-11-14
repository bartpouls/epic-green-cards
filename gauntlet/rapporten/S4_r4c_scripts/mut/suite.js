// node suite.js id1,id2,... -> draait de VOLLEDIGE suite (met data-e3 zonder pin) tegen elk mutant; meldt welke groepen rood worden
const path=require("path"),fs=require("fs"),vm=require("vm"); const SP=path.resolve(__dirname,"..");
globalThis.window=globalThis; const R="/home/user/epic-green-cards/";
const lijst=["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js","engine/logging.js","ui/ui.js","casussen/uwi-referentie.js","tests/testlib.js","tests/data-kaarten.tests.js","tests/data-e1.tests.js","tests/data-e2.tests.js","SP:data-e3.zonderpin.js","tests/data-referentie.tests.js","tests/predicaten.tests.js","tests/routes.js","tests/evaluatie.tests.js","tests/engine.tests.js","tests/logging.tests.js","tests/ui.tests.js"];
for(const f of lijst){ const p=f.startsWith("SP:")?SP+"/"+f.slice(3):R+f; vm.runInThisContext(fs.readFileSync(p,"utf8"),{filename:f}); }
const G=require("./genmut.js"); const L=require(SP+"/load.js");
const orig=JSON.parse(JSON.stringify(L.ep3())),ot=JSON.parse(JSON.stringify(CASUSSEN[0].todoBart));
const muts=G.genereer(JSON.parse(JSON.stringify(orig)),JSON.parse(JSON.stringify(ot)));
const base=Test.draaiAlles().filter(r=>!r.ok); const BASIS=new Set(base.map(r=>r.naam)); console.log("basis rood:",base.map(r=>r.naam+" :: "+(r.fout||"").slice(0,200)).join(" ## "));
for(const id of process.argv[2].split(",").map(Number)){
  const m=muts[id]; const root={ep:JSON.parse(JSON.stringify(orig)),todo:JSON.parse(JSON.stringify(ot))}; G.pas(root,m);
  L.zetEp3(root.ep); CASUSSEN[0].todoBart=root.todo;
  let res; try{ res=Test.draaiAlles(); }catch(e){ res=[{ok:false,groep:"CRASH",naam:e.message}]; }
  const rood=res.filter(r=>!r.ok && !BASIS.has(r.naam)); const gr={}; rood.forEach(r=>gr[r.groep]=(gr[r.groep]||0)+1);
  console.log(JSON.stringify({id,desc:m.desc,rood:rood.length,groepen:gr,eerste:rood[0]&&rood[0].naam}));
  L.zetEp3(orig); CASUSSEN[0].todoBart=ot;
}

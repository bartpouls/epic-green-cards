const path=require("path");const SP=path.resolve(__dirname,"..");const L=require(SP+"/load.js");
L.laad([L.R+"tests/testlib.js", process.argv[3]==="origineel"? L.R+"tests/data-e3.tests.js" : SP+"/data-e3.zonderpin.js"]);
const G=require("./genmut.js");
const orig=JSON.parse(JSON.stringify(L.ep3())),ot=JSON.parse(JSON.stringify(CASUSSEN[0].todoBart));
const muts=G.genereer(JSON.parse(JSON.stringify(orig)),JSON.parse(JSON.stringify(ot)));
const m=muts[+process.argv[2]]; const root={ep:JSON.parse(JSON.stringify(orig)),todo:JSON.parse(JSON.stringify(ot))}; G.pas(root,m);
L.zetEp3(root.ep); CASUSSEN[0].todoBart=root.todo;
const res=Test.draaiAlles("data-e3"); const rood=res.filter(r=>!r.ok); console.log(m.desc,"| rood:",rood.length,"van",res.length); rood.slice(0,5).forEach(r=>console.log("  -",r.naam,"::",(r.fout||"").slice(0,150)));

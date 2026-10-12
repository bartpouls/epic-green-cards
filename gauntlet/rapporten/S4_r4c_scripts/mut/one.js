const path=require("path");const SP=path.resolve(__dirname,"..");const L=require(SP+"/load.js");L.laad();const G=require("./genmut.js");const C=require(SP+"/corpus.js");
const orig=JSON.parse(JSON.stringify(L.ep3())),ot=JSON.parse(JSON.stringify(CASUSSEN[0].todoBart));
const muts=G.genereer(JSON.parse(JSON.stringify(orig)),JSON.parse(JSON.stringify(ot)));
const id=+process.argv[2]; const m=muts[id]; const root={ep:JSON.parse(JSON.stringify(orig)),todo:JSON.parse(JSON.stringify(ot))}; G.pas(root,m);
console.log(m.desc); console.log(JSON.stringify(root.ep.werkzaamheid.weefselinvasie.nietWerkzaam[3]));
const {play,samenvat}=require(SP+"/speel.js"); const plan=JSON.parse(process.argv[3]||"null");
L.zetEp3(root.ep); try{ const r=play(plan?plan.order:"AB",plan?plan.steps:["G3","O1","V4","|","N1","O2","Ev2>spironolacton","|","O1","B1>V8","V6>V8>875/125 mg 2 dd","|","Ev1","B3>spironolacton","V6>lisinopril>halveren","|","N3"]); console.log(JSON.stringify(samenvat(r)));}catch(e){console.log("FOUT",e.message)}

const path=require("path"); const SP=path.resolve(__dirname,"..");
const L=require(SP+"/load.js"); L.laad(); const G=require("./genmut.js"); const C=require(SP+"/corpus.js"); const {K}=require(SP+"/killers.js");
const orig=JSON.parse(JSON.stringify(L.ep3())), ot=JSON.parse(JSON.stringify(CASUSSEN[0].todoBart));
const muts=G.genereer(JSON.parse(JSON.stringify(orig)),JSON.parse(JSON.stringify(ot)));
const corpus=K.map(k=>({order:"AB",steps:k.steps,n:k.n})); const basis=corpus.map(p=>C.signatuur(orig,p));
for(const id of process.argv[2].split(",").map(Number)){
  const m=muts[id]; const root={ep:JSON.parse(JSON.stringify(orig)),todo:JSON.parse(JSON.stringify(ot))}; G.pas(root,m); let v=null;
  for(let i=0;i<corpus.length;i++){ if(C.signatuur(root.ep,corpus[i])!==basis[i]){ v=corpus[i].n; break; } }
  L.zetEp3(orig); console.log(id,m.desc,"=>",v?("VERSCHIL via killer: "+v):"GELIJK");
}

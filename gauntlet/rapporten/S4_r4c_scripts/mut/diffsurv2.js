// node diffsurv2.js ids -> differentie op het gestructureerde paren-corpus
const path=require("path"); const SP=path.resolve(__dirname,"..");
const L=require(SP+"/load.js"); L.laad(); const G=require("./genmut.js"); const C=require(SP+"/corpus.js");
const orig=JSON.parse(JSON.stringify(L.ep3())), ot=JSON.parse(JSON.stringify(CASUSSEN[0].todoBart));
const muts=G.genereer(JSON.parse(JSON.stringify(orig)),JSON.parse(JSON.stringify(ot)));
const corpus=C.paren(); const basis=corpus.map(p=>C.signatuur(orig,p));
console.error("corpus",corpus.length);
for(const id of process.argv[2].split(",").map(Number)){
  const m=muts[id]; const root={ep:JSON.parse(JSON.stringify(orig)),todo:JSON.parse(JSON.stringify(ot))}; G.pas(root,m); let v=null;
  for(let i=0;i<corpus.length;i++){ if(C.signatuur(root.ep,corpus[i])!==basis[i]){ v=corpus[i]; break; } }
  L.zetEp3(orig); console.log(id,m.desc,"=>",v?("VERSCHIL "+JSON.stringify(v)):"GELIJK");
}

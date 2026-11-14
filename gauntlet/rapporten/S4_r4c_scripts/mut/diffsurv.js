// node diffsurv.js <idsjson|ids,komma> <perturbN> <randomN> -> per id: eerste verschillende plan of "GELIJK"
const path=require("path"),fs=require("fs"); const SP=path.resolve(__dirname,"..");
const L=require(SP+"/load.js"); L.laad(); const G=require("./genmut.js"); const C=require(SP+"/corpus.js");
const orig=JSON.parse(JSON.stringify(L.ep3())), origTodo=JSON.parse(JSON.stringify(CASUSSEN[0].todoBart));
const muts=G.genereer(JSON.parse(JSON.stringify(orig)),JSON.parse(JSON.stringify(origTodo)));
const ids=process.argv[2].split(",").map(Number); const pn=+process.argv[3]||10, rn=+process.argv[4]||1500;
const corpus=C.bouw(7,pn,rn);
const basis=corpus.map(p=>C.signatuur(orig,p));
for(const id of ids){
  const m=muts[id]; const root={ep:JSON.parse(JSON.stringify(orig)),todo:JSON.parse(JSON.stringify(origTodo))};
  G.pas(root,m); let verschil=null;
  for(let i=0;i<corpus.length;i++){ const s=C.signatuur(root.ep,corpus[i]); if(s!==basis[i]){ verschil={i,plan:corpus[i]}; break; } }
  L.zetEp3(orig);
  console.log(id, m.desc, "=>", verschil?("VERSCHIL bij plan "+JSON.stringify(verschil.plan)):("GELIJK op "+corpus.length+" plannen"));
}

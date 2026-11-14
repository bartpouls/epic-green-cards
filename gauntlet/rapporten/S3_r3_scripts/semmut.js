const fs=require("fs"),vm=require("vm");const root=__dirname+"/snap/";
const oracle=require("./oraclemod.js");
const kl=x=>JSON.parse(JSON.stringify(x));
function laad(){const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js","tests/testlib.js","tests/data-e2.tests.js"].forEach(f=>vm.runInContext(fs.readFileSync(root+f,"utf8"),sb,{filename:f}));return sb}
const sb=laad();const c=sb.CASUSSEN[0];const idx=c.episodes.findIndex(x=>x.id==="E2");const orig=c.episodes[idx];
function inv(e,id){return e.invarianten.find(i=>i.id===id)}
const muts=[
 ["I5: gestart V3 -> gespeeld V3 (B1 naar V3 gemist)",e=>{inv(e,"I5").predicaat.args[0]={p:"gespeeld",kaart:"V3"}}],
 ["I7: gestart V5 -> gespeeld V5",e=>{inv(e,"I7").predicaat.args[1]={p:"gespeeld",kaart:"V5"}}],
 ["I7: anker start V5 -> kaart V5 (B1->V5 als start gemist) in O2-eis en V6-eis",e=>{const o=inv(e,"I7").predicaat.args[2].args;o[0].arg.anker={kaart:"V5"};o[1].arg.anker={kaart:"V5"}; inv(e,"I7").vraagVarianten.forEach(v=>{v.als.arg.anker={kaart:"V5"}})}],
 ["I7: gestart V5 en anker beide naar V5-kaart",e=>{inv(e,"I7").predicaat.args[1]={p:"gespeeld",kaart:"V5"};const o=inv(e,"I7").predicaat.args[2].args;o[0].arg.anker={kaart:"V5"};o[1].arg.anker={kaart:"V5"};inv(e,"I7").vraagVarianten.forEach(v=>{v.als.arg.anker={kaart:"V5"}})}],
 ["I6: geenAbx-arm verwijderd",e=>{const a=inv(e,"I6").predicaat.args[1].args;a.pop()}],
 ["I8: uitSet resistent -> middel V5",e=>{inv(e,"I8").predicaat.args[1]={p:"actief",middel:"V5",op:{eindeBeurtNaGebeurtenis:"C",offset:1}}}],
 ["I8: klachten aan -> klachten op laatste",e=>{inv(e,"I8").predicaat.args[2]={p:"klachten",waarde:"aan",op:"laatste"}}],
 ["I4: aantalActief > 1 -> eindstand via actief V3&V4 (volg-niveau gemist)",e=>{inv(e,"I4").predicaat={p:"of",args:[{p:"en",args:[{p:"actief",middel:"V3"},{p:"actief",middel:"V4"}]},{p:"en",args:[{p:"actief",middel:"V3"},{p:"actief",middel:"V5"}]},{p:"en",args:[{p:"actief",middel:"V4"},{p:"actief",middel:"V5"}]}]}}],
 ["geldtIn I8: * i.p.v. C",e=>{inv(e,"I8").geldtIn=["*"]}],
];
let uitgevoerd=0;
for(const [naam,f] of muts){
  const k=kl(orig);c.episodes[idx]=k;f(k);
  let res;try{res=sb.Test.draaiAlles("data-e2")}catch(x){res=[{ok:false}]}
  const rood=res.filter(x=>!x.ok).length;
  let o="-";if(!rood){const r=oracle(sb,3000,5);o=r.fouten+" afwijkingen/3000"+(r.voorbeelden[0]?" bv. "+r.voorbeelden[0].probleem+" | "+r.voorbeelden[0].tl:"")}
  console.log((rood?"GEDOOD ("+rood+" rood) ":"OVERLEEFD ")+naam+" | orakel: "+o);
}
c.episodes[idx]=orig;

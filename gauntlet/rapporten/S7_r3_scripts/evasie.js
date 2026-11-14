const fs=require("fs"),vm=require("vm"),path=require("path");
const root="/home/user/epic-green-cards";
const orig=fs.readFileSync(root+"/engine/engine.js","utf8");
const files=["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js","engine/logging.js","tests/testlib.js","tests/engine.tests.js"];
function draai(src,sluit){const sb={console:{log(){},error(){}}};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
 for(const f of files){const p=path.join(root,f);if(!fs.existsSync(p)||(sluit&&sluit.includes(f)))continue;vm.runInContext(f==="engine/engine.js"?src:fs.readFileSync(p,"utf8"),sb,{filename:f});}
 const r=vm.runInContext("Test.draaiAlles('engine')",sb);return r.filter(x=>!x.ok).map(x=>x.naam);}
// 1. verborgen helper (niet in _functies) met casusnamen
let m=orig.replace('function fout(tekst) { return { ok: false, fout: tekst }; }','function fout(tekst) { return { ok: false, fout: tekst }; }\n  function verborgenHulp(k) { return k === "G2" || k === "E3" || k === "cystitis" || k === "lisinopril"; }\n  var _x = verborgenHulp("Z");');
console.log("1 verborgen helper met G2/E3/cystitis/lisinopril, niet in _functies ->", draai(m).length?"GEDOOD":"OVERLEEFD (bronscan omzeild)");
// 2. patroon in plaats van id
m=orig.replace('if (typeof kaartId !== "string" || !kaartId)','if (typeof kaartId === "string" && /^V\\d+$/.test(kaartId) && state.dag > 99) return fout("x");\n    if (typeof kaartId !== "string" || !kaartId)');
console.log("2 regex /^V\\d+$/ (categorie-patroon) in speelKaart ->", draai(m).length?"GEDOOD":"OVERLEEFD");
// 3. echte tests zonder casusdata / regeltaal: rood?
console.log("3 zonder casussen/uwi*.js:", draai(orig,["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js"]).filter(n=>n.startsWith("echt")).length,"echte tests rood");
console.log("4 zonder predicaten.js:", draai(orig,["regels/predicaten.js"]).filter(n=>n.startsWith("echt")).length,"echte tests rood");

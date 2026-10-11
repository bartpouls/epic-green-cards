const fs=require("fs"),vm=require("vm"),path=require("path");
const root="/home/user/epic-green-cards";
const files=["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js","engine/logging.js","tests/testlib.js","tests/data-e2.tests.js"];
const orig=fs.readFileSync(root+"/casussen/uwi-e2.js","utf8");
function run(e2){const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
 for(const f of files){const p=path.join(root,f);if(!fs.existsSync(p))continue;
  vm.runInContext(f==="casussen/uwi-e2.js"?e2:fs.readFileSync(p,"utf8"),sb);}
 return sb.Test.draaiAlles("data-e2").filter(r=>!r.ok).length;}
console.log("basis rood:",run(orig));
const M=[];
function m(naam,fn){M.push([naam,fn]);}
const sw=(a,b)=>s=>{if(!s.includes(a))throw new Error("niet gevonden "+a);return s.replace(a,b);};
m("kop fout",sw('kop: "Mevrouw V., 78 jaar (6 jaar na episode 1)."','kop: "Mevrouw V., 78 jaar."'));
m("kop weg",sw('      kop: "Mevrouw V., 78 jaar (6 jaar na episode 1).",\n',''));
m("raadplegen terug",sw('  antibiotica: ["V3"','  raadplegen: {titel:"x",bronnen:[]},\n  antibiotica: ["V3"'));
m("ontwerpnoot terug",sw('    meta: {','    ontwerpnoot: "x",\n    meta: {'));
m("brug hoofdletter",sw('brug: "de kweek','brug: "De kweek'));
m("I6 varianten verwisseld",s=>{const i=s.indexOf('vraag: "Wat vertelt een kweek van urine die al antibioticum heeft gezien?"\n        }');return s.replace('vraag: "Wat vertelt een kweek van urine die al antibioticum heeft gezien?"\n        },','vraag: "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?"\n        },').replace('vraag: "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?"\n        }\n      ],','vraag: "Wat vertelt een kweek van urine die al antibioticum heeft gezien?"\n        }\n      ],');});
m("I6 als verwisseld",s=>{const a='als: { p: "of", args: [{ p: "gespeeld", kaart: "V1" }';const i=s.indexOf(a);if(i<0)throw 1;return s.replace(a,'als: { p: "of", args: [{ p: "gespeeld", kaart: "V2" }');});
m("I7 vragen verwisseld",s=>s.replace('vraag: "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?"','vraag: "X"').replace('vraag: "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?",\n          TODO','vraag: "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?",\n          TODO'));
m("I7 variant als O2 -> V6 swap",s=>{const a='arg: { p: "opDagRelatief", kaart: "O2", anker: { start: "V5" }, van: 1, tot: 3 }\n          },';if(!s.includes(a))throw 1;return s.replace(a,'arg: { p: "opDagRelatief", kaart: "O2", anker: { start: "V5" }, van: 2, tot: 4 }\n          },');});
m("I7 O2 oude lezing",s=>s.split('van: 1, tot: 3').join('van: 2, tot: 4'));
m("I7 V6 van 4",sw('optie: "halveren",\n                  anker: { start: "V5" },\n                  van: 3','optie: "halveren",\n                  anker: { start: "V5" },\n                  van: 4'));
m("doelmatigheid voor(G2,V4) omgedraaid",s=>{const a='arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V4" } }';let n=0;const i=s.indexOf(a);return s.slice(0,i)+'arg: { p: "voor", a: { kaart: "V4" }, b: { kaart: "G2" } }'+s.slice(i+a.length);});
for(const v of ["V1","V2","V3","V5"])m("doelmatigheid voor(G2,"+v+") omgedraaid",s=>{const a='arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "'+v+'" } }';const i=s.indexOf(a);if(i<0)throw 1;return s.slice(0,i)+'arg: { p: "voor", a: { kaart: "'+v+'" }, b: { kaart: "G2" } }'+s.slice(i+a.length);});
m("doelmatigheid V4 arm weg",s=>{const a='{ p: "gespeeld", kaart: "V4" },\n                        {\n                          p: "niet",\n                          arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V4" } }';return sw(a,'{ p: "gespeeld", kaart: "V3" },\n                        {\n                          p: "niet",\n                          arg: { p: "voor", a: { kaart: "G2" }, b: { kaart: "V4" } }')(s);});
m("GEEN-antibioticum arm weg uit I6 predicaat",s=>{const a=', { p: "gestart", middel: "V5" }] } }\n            ]';return s.replace(/,\n\s+\{ p: "niet", arg: \{ p: "of", args: \[\{ p: "gestart", middel: "V3" \}[^\n]*\n(\s+\]\n\s+\}\n\s+\]\n\s+\},\n\s+vraag: "Wat vertelt)/,'\n$1');});
m("I6 ernst",sw('ernst: 4,\n      geldtIn: ["*"],','ernst: 3,\n      geldtIn: ["*"],'));
m("I8 offset",sw('offset: 1','offset: 2'));
m("I5 grens",sw('op: "<", waarde: 30','op: "<", waarde: 29'));
m("C trigger n",sw('n: 4,','n: 5,'));
m("C zet",sw('resistent: ["V5", "V10"]','resistent: ["V5"]'));
m("statusTekst",sw('af: "klachten nemen af"','af: "Klachten nemen af"'));
m("V4 niet werkzaam",sw('werkzaam: [{ kaart: "V4" }]','werkzaam: [{ kaart: "V3" }]'));
m("duurzaamheid delta",sw('delta: -1','delta: -2'));
m("profiel naam",sw('naam: "Bijgestuurd"','naam: "Bijgesturd"'));
m("meta reden terug",sw('meta: { reden: "resistent" }','reden: "resistent"'));
m("knoppen",sw('actiesPerBeurt: 3','actiesPerBeurt: 4'));
m("risicogroep waar",sw('risicogroep: true }','risicogroep: false }'));
m("TODO dag-lezing B weg",s=>s.split(' Lezing B (bouwopdracht 6.1, opDagRelatief(O2,V5,2,4)): O2 op verschil 2 t/m 4 (V5 op dag 1: O2 op dag 3–5).').join(''));
m("TODO vroeg-afronden weg",s=>{const i=s.indexOf('  {\n    id: "TODO_BART-E2-16"');const j=s.indexOf('  {\n    id: "TODO_BART-E2-17"');return s.slice(0,i)+s.slice(j);});
let overleefd=0;
for(const [n,f] of M){let r;try{r=run(f(orig));}catch(e){r="fout:"+e.message.slice(0,50);}
 const ok=(typeof r==="number"&&r>0)||(typeof r==="string");console.log((ok?"DOOD  ":"OVERLEEFT ")+n+" ("+r+")");if(!ok)overleefd++;}
console.log("overleefd:",overleefd,"van",M.length);

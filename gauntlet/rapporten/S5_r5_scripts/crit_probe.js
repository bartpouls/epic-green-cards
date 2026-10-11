const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
globalThis.window=globalThis;
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js"]) vm.runInThisContext(fs.readFileSync(root+"/"+f,"utf8"),{filename:f});
const P=Predicaten,E=Engine,casus=CASUSSEN[0];
const st=E.nieuwSpel(casus,"E3",{rng:()=>0.1});
console.log(JSON.stringify(st.klachten),Object.keys(st));
E.speelKaart(st,"V5",{doel:"V5"});E.volgendeDag(st);E.volgendeDag(st);
console.log(JSON.stringify(st.klachten),JSON.stringify(st.tijdlijn),JSON.stringify(st.gebeurtenissen), st.dag);
// deep freeze test
function df(o){if(o&&typeof o==="object"&&!Object.isFrozen(o)){Object.freeze(o);Object.keys(o).forEach(k=>df(o[k]));}return o;}
const ep=casus.episodes.find(e=>e.id==="E3");
const ctx=P.maakContext(casus,ep,st);
const alle=[];(function w(o,epi){if(Array.isArray(o))o.forEach(x=>w(x,epi));else if(o&&typeof o==="object"){if(typeof o.p==="string")alle.push({o,epi});Object.keys(o).forEach(k=>w(o[k],(!epi&&/^E[123]$/.test(k))?k:epi));}})(casus.kaarten,null);(function w(o){if(Array.isArray(o))o.forEach(w);else if(o&&typeof o==="object"){if(typeof o.p==="string")alle.push({o,epi:"E3"});Object.keys(o).forEach(k=>w(o[k]));}})(ep);
const voor=alle.filter(x=>!x.epi||x.epi==="E3").map(x=>{try{return P.evalueer(x.o,ctx)}catch(e){return "F"}});
const snap=JSON.stringify([casus,ctx.tijdlijn,ctx.klachten]);
df(ctx);df(casus);
const na=alle.filter(x=>!x.epi||x.epi==="E3").map(x=>{try{return P.evalueer(x.o,ctx)}catch(e){return "F:"+e.message}});
console.log("bevroren: gelijk",JSON.stringify(voor)===JSON.stringify(na),"fouten",na.filter(x=>typeof x==="string").slice(0,3));

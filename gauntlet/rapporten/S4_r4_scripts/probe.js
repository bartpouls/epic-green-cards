const L=require("./load.js");const sb=L.laad();const c=sb.CASUSSEN[0];
const E=sb.Engine;const s=E.nieuwSpel(c,"E3",{rng:()=>0});
const sp=(k,o)=>{const r=E.speelKaart(s,k,o||{});if(!r.ok)throw new Error(k+": "+r.fout);};
sp("G3");sp("O1");sp("V4");E.volgendeDag(s);sp("N1");sp("O2");sp("Ev2",{doel:"spironolacton"});
while(!s.dagenVoorbij)E.volgendeDag(s);
console.log(JSON.stringify(s.gebeurtenissen),JSON.stringify(s.klachten.map(k=>k.status)));
const u=E.rondAf(s);console.log(JSON.stringify(u,null,1).slice(0,3000));

require("./load.js");
const c=CASUSSEN[0];
function sp(s,k,o){const r=Engine.speelKaart(s,k,o);if(!r.ok)console.log("  !! "+k+" "+JSON.stringify(o)+" -> "+r.fout);return r}
function dag(s){Engine.volgendeDag(s)}
function toon(s){return s.klachten.slice(1).map(k=>k.dag+":"+k.status).join(" ")+" | geb "+s.gebeurtenissen.map(g=>g.id+"@"+g.dag).join(",")}
let s=Engine.nieuwSpel(c,"E3",{rng:()=>0});
sp(s,"V4");sp(s,"O1");sp(s,"N1");dag(s); // dag2
sp(s,"G3");  // kaart 4 -> A
dag(s); // dag3: A verschijnt
console.log("start",toon(s),s.toestanden);
dag(s); dag(s); // dag 4,5
console.log("na gap",toon(s));
sp(s,"B1",{doel:"V8"}); dag(s); console.log("na V8 wissel",toon(s));
sp(s,"B1",{doel:"V3"}); dag(s); console.log("na wissel naar V3 (niet-werkzaam) dag",toon(s));
console.log("einde");

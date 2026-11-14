// criticus r5: blinde A/B. Zijde 'bron' = de bouwopdracht 6.1/4.2-regel + MIJN handmatig vooraf bepaalde uitkomst;
// zijde 'spel' = de echte invariant-predicaten uit de casusdata op de echte Predicaten.evalueer.
const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
globalThis.window=globalThis;
for(const f of ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js"]) vm.runInThisContext(fs.readFileSync(root+"/"+f,"utf8"),{filename:f});
const P=Predicaten,casus=CASUSSEN[0];
const bron=fs.readFileSync(root+"/bouwopdracht-uwi.md","utf8").split("\n");
function rij(id){return bron.find(l=>l.startsWith("| "+id+" |")).replace(/\s+/g," ");}
const T=(a)=>a.map((x,i)=>({volg:i+1,kaart:x[0],dag:x[1],doel:x[2]===undefined?null:x[2],optie:x[3]===undefined?null:x[3]}));
// [id, episode, titel, tijdlijn, gebeurtenissen, toestanden, verwachtGeschonden(handmatig, uit 6.1 + casus)]
const S=[
 ["I4","E2","V3 en V5 beide gespeeld zonder wissel",T([["V3",1],["V5",1]]),[],["cystitis"],true],
 ["I4","E2","V3, dan B1 wisselen naar V4",T([["V3",1],["B1",2,"V4"]]),[],["cystitis"],false],
 ["I5","E2","V3 gestart bij eGFR 29",T([["V3",1]]),[],["cystitis"],true],
 ["I5","E2","V4 gestart, daarna B1 naar V3 bij eGFR 29",T([["V4",1],["B1",2,"V3"]]),[],["cystitis"],true],
 ["I5","E2","alleen V4 gespeeld",T([["V4",1]]),[],["cystitis"],false],
 ["I12","E3","V9 gespeeld",T([["V9",1]]),[],["cystitis"],true],
 ["I12","E3","alleen V8 gespeeld",T([["V8",1]]),[],["cystitis"],false],
 ["I7","E2","V5 d1, O2 d2, V6 halveren d4",T([["V5",1],["O2",2],["V6",4,"V5","halveren"]]),[],["cystitis"],false],
 ["I7","E2","V5 d1, V6 halveren d4, geen O2",T([["V5",1],["V6",4,"V5","halveren"]]),[],["cystitis"],true],
 ["I7","E2","V5 d1, O2 d2, V6 niet gespeeld",T([["V5",1],["O2",2]]),[],["cystitis"],true],
 ["I6","E2","V1 afwachtend beleid gespeeld",T([["V1",1]]),[],["cystitis"],true],
 ["I6","E2","O1 d1, daarna V4 d1",T([["O1",1],["V4",1]]),[],["cystitis"],false],
 ["I6","E2","V4 d1 vóór O1 d1",T([["V4",1],["O1",1]]),[],["cystitis"],true],
 ["I3","E1","V1 zonder Ev1",T([["V1",1]]),[],["cystitis"],true],
 ["I3","E1","V1 met Ev1",T([["V1",1],["Ev1",1]]),[],["cystitis"],false],
 ["I1","E1","V4 gespeeld zonder N1",T([["V4",1]]),[],["cystitis"],true],
 ["I1","E1","V4 met N1",T([["V4",1],["N1",1]]),[],["cystitis"],false],
 ["I10","E3","weefselinvasie, V3 d1, A op d3, V3 nog actief",T([["V3",1]]),[{id:"A",dag:3}],["weefselinvasie"],true],
 ["I10","E3","weefselinvasie, V3 d1, A d3, B1 naar V5 op d3",T([["V3",1],["B1",3,"V5"]]),[{id:"A",dag:3}],["weefselinvasie"],false],
];
const items=[];let seed=2026;function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
const key=[],paren=[];
S.forEach((s,i)=>{const [id,epId,titel,tl,geb,toest,verw]=s;const ep=casus.episodes.find(e=>e.id===epId);const inv=ep.invarianten.find(x=>x.id===id);
  const ctx=P.maakContext(casus,ep,{tijdlijn:tl,gebeurtenissen:geb.map(g=>Object.assign({naVolg:tl.length},g)),toestanden:toest,klachten:[{dag:1,status:null}],dag:Math.max(...tl.map(l=>l.dag),1)});
  const spel=P.evalueer(inv.predicaat,ctx);
  const tlTxt=tl.map(l=>l.kaart+(l.doel?"("+l.doel+(l.optie?","+l.optie:"")+")":"")+"@d"+l.dag).join(" ");
  const sit="Situatie: "+epId+", tijdlijn: "+tlTxt+(geb.length?", gebeurtenissen: "+geb.map(g=>g.id+"@d"+g.dag).join(","):"")+", toestand: "+toest.join(",");
  const A="invariant "+id+": "+(verw?"GESCHONDEN":"NIET geschonden");
  const B="invariant "+id+": "+(spel?"GESCHONDEN":"NIET geschonden");
  const bronIsX=rnd()<0.5;
  paren.push("## Paar "+(i+1)+"\n"+sit+"\nRegel (bron 6.1): "+rij(id)+"\nX: "+(bronIsX?A:B)+"\nY: "+(bronIsX?B:A)+"\n");
  key.push({paar:i+1,X:bronIsX?"bron":"spel",Y:bronIsX?"spel":"bron",verwacht:verw,spel});});
fs.writeFileSync(root+"/gauntlet/rapporten/S5_r5.paren.md","# S5 r5 paren (zonder sleutel)\n\n"+paren.join("\n"));
fs.writeFileSync(root+"/gauntlet/rapporten/S5_r5.sleutel.json",JSON.stringify(key,null,1));
console.log("paren",paren.length);

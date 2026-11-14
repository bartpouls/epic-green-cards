const L=require("./load.js"); L.laad(); const {oracle}=require("./oracle.js"); const {play}=require("./speel.js"); const C=require("./corpus.js");
const seed=+process.argv[2]||11, pn=+process.argv[3]||10, rn=+process.argv[4]||2000;
const corpus=C.bouw(seed,pn,rn);
const ZT={sick:"De nierfunctie daalt verder en het kalium stijgt.",cipro48:"Na 48 uur geen verbetering.",i9:"Het kalium is onbekend, en niemand heeft naar spironolacton gekeken."};
const XV={herstart:"De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?",cipro:"De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?"};
let n=0,bad=0,tel={}; const verschillen=[];
for(const p of corpus){ let r; try{ r=play(p.order,p.steps,{strict:false}); }catch(e){ continue; }
  const o=oracle(r.st), u=r.u; n++;
  const ids=u.geschonden.map(g=>g.id); o.ids.forEach(i=>tel[i]=(tel[i]||0)+1);
  const pr=[];
  if(JSON.stringify(ids)!==JSON.stringify(o.ids)) pr.push("ids data="+JSON.stringify(ids)+" oracle="+JSON.stringify(o.ids));
  else if(o.ids.length){ // vraag
    const top=o.ids[0]; const V={I6:o.i6v==="a"?"Wat vertelt een kweek van urine die al antibioticum heeft gezien?":"Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?", I7:o.i7v==="a"?"Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?":"Dag 4. Hoeveel trimethoprim klaren haar nieren nog?"};
    if(V[top]&&u.vraag!==V[top]) pr.push("vraag "+u.vraag);
  } else {
    if(!u.score||u.score.duurzaamheid!==o.dur||u.score.doelmatigheid!==o.doel) pr.push("score data="+JSON.stringify(u.score)+" oracle="+o.dur+","+o.doel);
    if(((u.profiel&&u.profiel.naam)||null)!==o.profiel) pr.push("profiel "+(u.profiel&&u.profiel.naam)+" vs "+o.profiel);
    const ex=u.extraVragen.map(x=>x.vraag), exo=o.extra.map(k=>XV[k]);
    if(JSON.stringify(ex.slice().sort())!==JSON.stringify(exo.slice().sort())) pr.push("extra "+JSON.stringify(ex.map(s=>s.slice(0,20)))+" vs "+JSON.stringify(o.extra));
  }
  const z=u.zichtbaar.map(x=>x.tekst), zo=o.zicht.map(k=>ZT[k]);
  if(JSON.stringify(z)!==JSON.stringify(zo)) pr.push("zicht "+JSON.stringify(z.map(s=>s.slice(0,15)))+" vs "+JSON.stringify(o.zicht));
  const klData=r.st.klachten.map(k=>k&&k.status), klO=o.kl; for(let d=2;d<klO.length;d++) if((klData[d]||null)!==(klO[d]||null)) { pr.push("klachten d"+d+" data="+klData[d]+" oracle="+klO[d]); break; }
  if(pr.length){ bad++; if(verschillen.length<12) verschillen.push({plan:p,pr,geb:r.st.gebeurtenissen.map(g=>g.id+"@"+g.dag)}); }
}
console.log("plannen",n,"verschillen",bad,"| dekking per invariant (oracle):",JSON.stringify(tel));
verschillen.forEach(v=>console.log(JSON.stringify(v)));

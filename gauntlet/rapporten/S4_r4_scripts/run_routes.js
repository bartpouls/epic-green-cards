const L=require("./load.js");const O=require("./orakel.js");const {speel}=require("./speel.js");const {R}=require("./routes.js");
const sb=L.laad();let fails=0,n=0;
function vergelijk(naam,u,orc,claim,s){ const f=[]; const ids=u.geschonden.map(x=>x.id);
  if(JSON.stringify(ids)!==JSON.stringify(orc.ids)) f.push("geschonden Evaluatie "+JSON.stringify(ids)+" <> orakel "+JSON.stringify(orc.ids));
  if(claim.ids&&JSON.stringify(orc.ids.slice().sort())!==JSON.stringify(claim.ids.slice().sort())) f.push("claim "+JSON.stringify(claim.ids)+" <> orakel "+JSON.stringify(orc.ids));
  if(claim.ids&&JSON.stringify(ids.slice().sort())!==JSON.stringify(claim.ids.slice().sort())) f.push("claim "+JSON.stringify(claim.ids)+" <> Evaluatie "+JSON.stringify(ids));
  if(u.poortGehaald!==(orc.ids.length===0)) f.push("poortGehaald "+u.poortGehaald);
  // gebeurtenisdagen engine vs orakel
  ["A","B","C"].forEach(i=>{const g=s.gebeurtenissen.find(x=>x.id===i);const dE=g?g.dag:null; if(dE!==orc.dag[i]) f.push("gebeurtenisdag "+i+": engine "+dE+" <> orakel "+orc.dag[i]);});
  const st=s.klachten.slice(0,8).map(k=>k&&k.status);if(JSON.stringify(st)!==JSON.stringify(orc.status.concat([]).slice(0,8).map(x=>x===undefined?null:x))&&!(JSON.stringify(st.slice(1))===JSON.stringify(orc.status.slice(1,8).map(x=>x===undefined?null:x)))) f.push("klachtenstatus engine "+JSON.stringify(st)+" <> orakel "+JSON.stringify(orc.status));
  if(orc.ids.length){ const top=orc.ids[0]; if(u.geschonden[0].id!==top) f.push("ernstigste "+u.geschonden[0].id+" <> "+top); if(u.score!==null||u.profiel!==null) f.push("score/profiel bij schending"); if(u.vraag!==u.geschonden[0].vraag) f.push("vraag != vraag van ernstigste"); }
  else { const dur=u.score&&u.score.duurzaamheid, doel=u.score&&u.score.doelmatigheid; if(dur!==orc.dur&&!(dur==null&&orc.dur==null)) f.push("duurzaamheid "+dur+" <> orakel "+orc.dur); if(doel!==orc.doel) f.push("doelmatigheid "+doel+" <> "+orc.doel);
    const pn=u.profiel?u.profiel.naam:null; if(pn!==orc.profiel) f.push("profiel "+pn+" <> "+orc.profiel);
    if(claim.profiel!==undefined&&pn!==claim.profiel) f.push("claim profiel "+claim.profiel+" <> "+pn);
    if(claim.dur!==undefined&&dur!==claim.dur&&!(claim.dur===null&&dur==null)) f.push("claim dur "+claim.dur+" <> "+dur);
    if(claim.doel!==undefined&&doel!==claim.doel) f.push("claim doel "+claim.doel+" <> "+doel);
    if(u.vraag!==null) f.push("vraag bij gehaalde poort");
    const rv=u.profiel&&u.profiel.reflectievraag; if(pn==="Richtlijn eerste keus"&&rv!=="Eerste keus volgens de richtlijn. Gold die eerste keus ook voor déze patiënt?") f.push("reflectievraag cipro: "+rv);
    if(pn==="Kweekgestuurd"&&rv!=null) f.push("reflectievraag Kweekgestuurd moet null: "+rv);
  }
  const ex=u.extraVragen.map(x=>x.vraag); const exv=orc.extra.map(k=>k==="herstart"?"De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?":"De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?");
  const exAllowed=orc.ids.length?[]:exv; if(JSON.stringify(ex)!==JSON.stringify(exAllowed)) f.push("extraVragen "+JSON.stringify(ex)+" <> "+JSON.stringify(exAllowed));
  const zt={sick:"De nierfunctie daalt verder en het kalium stijgt.",cipro:"Na 48 uur geen verbetering.",i9:"Het kalium is onbekend, en niemand heeft naar spironolacton gekeken."};
  const zz=u.zichtbaar.map(x=>typeof x==="string"?x:x.tekst); const zo=orc.zicht.map(k=>zt[k]); if(JSON.stringify(zz)!==JSON.stringify(zo)) f.push("zichtbaar "+JSON.stringify(zz)+" <> "+JSON.stringify(zo));
  if(claim.zicht&&JSON.stringify(claim.zicht)!==JSON.stringify(orc.zicht)) f.push("claim zicht");
  // vraagkeuze I6/I7
  const vq={I6:["Wat vertelt een kweek van urine die al antibioticum heeft gezien?","Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?"],I7:["Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?","Dag 4. Hoeveel trimethoprim klaren haar nieren nog?"]};
  u.geschonden.forEach(g=>{ if(g.id==="I6"&&g.vraag!==vq.I6[orc.i6v]) f.push("I6-vraag variant "+g.vraag); if(g.id==="I7"&&g.vraag!==vq.I7[orc.i7v]) f.push("I7-vraag variant "+g.vraag); });
  if(claim.i6v!==undefined&&orc.i6v!==claim.i6v) f.push("claim i6v"); if(claim.i7v!==undefined&&orc.i7v!==claim.i7v) f.push("claim i7v");
  return f; }
exports.vergelijk=vergelijk;
if(require.main===module){
for(const r of R){ for(const ord of ["AB","BA"]){ if((r.claim.onlyAB&&ord==="BA")||(r.claim.onlyBA&&ord==="AB")||(r.claim.skipBA&&ord==="BA")) continue; n++;
  let f; try{ const s=speel(sb,r.plan[ord],ord,{vroeg:r.claim.vroeg}); const orc=O.orakel(s.tijdlijn,s.volgordeAB,s.dag); if(JSON.stringify(s.volgordeAB)!==JSON.stringify(ord.split(""))) throw new Error("volgordeAB "+s.volgordeAB); f=vergelijk(r.id,s.uitkomst,orc,r.claim,s); if(!r.claim.vroeg){ /* ok */ } }catch(e){ f=["FOUT: "+e.message]; }
  if(f.length){fails++;console.log("ROOD ["+ord+"] "+r.id+"\n    "+f.join("\n    "));} else console.log("groen ["+ord+"] "+r.id); } }
console.log("\nroutes x volgorde:",n,"rood:",fails);}

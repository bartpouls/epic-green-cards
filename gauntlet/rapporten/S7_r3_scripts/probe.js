const {laad}=require("./laad.js");const sb=laad();const E=sb.Engine;const c0=sb.CASUSSEN[0];
const J=x=>JSON.parse(JSON.stringify(x));
function vers(){return J(c0);}
function rng(v){return ()=>v;}
const out=[];function p(n,v){console.log(n+": "+v);}
// P1: speelKaart atomair bij kapotte verborgen-data (sleutel geen tekst)
{ const c=vers(); c.episodes[1].patient.verborgen[0].sleutel=5;
  const s=E.nieuwSpel(c,"E2",{rng:rng(0)});const voor=JSON.stringify(s);let t=null;try{E.speelKaart(s,"G2");}catch(e){t=e.message;}
  p("P1 speelKaart met kapotte verborgen: gooit="+t+" state gelijk="+(JSON.stringify(s)===voor)+" tijdlijn="+s.tijdlijn.length+" acties="+s.actiesOver);}
// P1b: tweede verborgen-rij faalt na de eerste
{ const c=vers(); c.episodes[1].patient.verborgen.push({kaart:"G2",onthult:"x",sleutel:7});
  const s=E.nieuwSpel(c,"E2",{rng:rng(0)});const voor=JSON.stringify(s);let t=null;try{E.speelKaart(s,"G2");}catch(e){t=e.message;}
  p("P1b halve onthulling: gooit="+t+" onthuld="+s.onthuld.length+" tijdlijn="+s.tijdlijn.length+" gelijk="+(JSON.stringify(s)===voor));}
// P2: speelKaart met kapot vereist -> state ongewijzigd?
{ const c=vers(); c.kaarten.find(k=>k.id==="V6").doelen.E2[0].vereist={p:"bestaatniet"};
  const s=E.nieuwSpel(c,"E2",{rng:rng(0)});const voor=JSON.stringify(s);let t=null;try{E.speelKaart(s,"V6",{doel:"V5",optie:"halveren"});}catch(e){t=e.message;}
  p("P2 kapot vereist: gooit="+t+" gelijk="+(JSON.stringify(s)===voor));}
// P3: raadpleeg atomair? casus verdwijnt
{ const s=E.nieuwSpel(c0,"E3",{rng:rng(0)});const voor=JSON.stringify(s);
  const c=vers();Object.defineProperty(s,"_casus",{value:c});c.raadplegen={bronnen:{get x(){throw new Error("kapot")}}};
  let t=null;try{E.raadpleeg(s);}catch(e){t=e.message;}
  p("P3 raadpleeg met onleesbare bronnen: gooit="+t+" gelijk="+(JSON.stringify(s)===voor)+" acties="+s.actiesOver+" raadpl="+s.raadplegingen.length);}
// P4: raadpleeg zonder casus.raadplegen
{ const c=vers();delete c.raadplegen;const s=E.nieuwSpel(c,"E3",{rng:rng(0)});const r=E.raadpleeg(s);p("P4 zonder casus.raadplegen: "+JSON.stringify(r)+" acties="+s.actiesOver);}
// P5: rondAf: Evaluatie die state muteert en dan gooit
{ const s=E.nieuwSpel(c0,"E1",{rng:rng(0)});const o=sb.Evaluatie;sb.Evaluatie={beoordeel:function(c,e,st){st.tijdlijn.push({volg:99});throw new Error("kapot");}};
  let t=null;try{E.rondAf(s);}catch(e){t=e.message;}sb.Evaluatie=o;p("P5 beoordeel muteert+gooit: afgerond="+s.afgerond+" tijdlijn="+s.tijdlijn.length+" (rondAf kan dat niet terugdraaien)");}
// P6: beoordeel retourneert undefined
{ const s=E.nieuwSpel(c0,"E1",{rng:rng(0)});const o=sb.Evaluatie;sb.Evaluatie={beoordeel:function(){}};
  const u=E.rondAf(s);sb.Evaluatie=o;p("P6 beoordeel zonder uitkomst: afgerond="+s.afgerond+" uitkomst="+u);}
// P7: beoordeel die rondAf heractief aanroept (re-entrancy)
{ const s=E.nieuwSpel(c0,"E1",{rng:rng(0)});const o=sb.Evaluatie;let n=0;sb.Evaluatie={beoordeel:function(c,e,st){n++;return {geschonden:[],n:n,afg:st.afgerond};}};
  const u=E.rondAf(s);sb.Evaluatie=o;p("P7 beoordeel ziet state.afgerond="+u.afg+" (true betekent: engine zet afgerond VOOR beoordeel)");}
// P8: herkansing verliest afrondenPasNaGebeurtenissen
{ const s=E.nieuwSpel(c0,"E3",{rng:rng(0),afrondenPasNaGebeurtenissen:true});const h=E.herkansing(s);p("P8 herkansing: flag eerste="+s.afrondenPasNaGebeurtenissen+" herkansing="+h.afrondenPasNaGebeurtenissen);}
// P9: herkansing: rng-tellers en gelijke A/B-volgorde met rng-reeks
{ let i=0;const seq=[0.1,0.9,0.1,0.9];const r=()=>seq[i++%4];const s=E.nieuwSpel(c0,"E3",{rng:r});const h=E.herkansing(s);p("P9 herkansing AB: "+JSON.stringify(s.volgordeAB)+" -> "+JSON.stringify(h.volgordeAB));}
// P10: event op de laatste dag
{ const s=E.nieuwSpel(c0,"E3",{rng:rng(0)});for(let i=0;i<6;i++)E.volgendeDag(s);
  // dag 7
  ["G1","G2","G3"].forEach(k=>E.speelKaart(s,k));
  p("P10 dag="+s.dag+" tijdlijn="+s.tijdlijn.length+" wachtend="+JSON.stringify(s.wachtend));
  E.volgendeDag(s);p("   na einde: dagenVoorbij="+s.dagenVoorbij+" wachtend="+JSON.stringify(s.wachtend)+" gebeurtenissen="+JSON.stringify(s.gebeurtenissen));}
// P11: de-serialisatie: JSON-kopie van state werkt nog?
{ const s=E.nieuwSpel(c0,"E3",{rng:rng(0)});E.speelKaart(s,"G3");const k=J(s);let t=null;try{const r=E.speelKaart(k,"G1");p("P11 JSON-kopie van state speelt door: ok="+r.ok);E.volgendeDag(k);p("   volgendeDag ok dag="+k.dag);}catch(e){p("P11 JSON-kopie gooit "+e.message);}}
// P12: nieuwSpel muteert casus niet / state deelt geen referenties
{ const c=vers();const s=E.nieuwSpel(c,"E3",{rng:rng(0)});s.toestanden.push("x");s.zichtbaar.eerdereKweek="x";s.sets.resistent.push("q");
  p("P12 casus delen: startToestanden="+JSON.stringify(c.episodes[2].startToestanden)+" zichtbaar.eerdereKweek="+JSON.stringify(c.episodes[2].patient.zichtbaar.eerdereKweek));}
// P13: ontgrendelen over casussen/episodes met echte data
{ const ids=c0.episodes.map(e=>e.id);
  const rec=(ep,g,ca)=>({casusId:ca||c0.id,episodeId:ep,geschonden:g});
  p("P13 "+ids.join(",")+": E2 na E1-rec gehaald="+E.ontgrendeld(c0,"E2",[rec("E1",[])])+", na E1-rec geschonden="+E.ontgrendeld(c0,"E2",[rec("E1",["I1"])])+", E3 na alleen E1 gehaald="+E.ontgrendeld(c0,"E3",[rec("E1",[])])+", E3 na E2="+E.ontgrendeld(c0,"E3",[rec("E2",[])]));
  p("   andere casus: "+E.ontgrendeld(c0,"E2",[rec("E1",[],"andere")])+" ; lijst: "+JSON.stringify(E.ontgrendeldeEpisodes(c0,[rec("E1",[]),rec("E2",[])]))); }

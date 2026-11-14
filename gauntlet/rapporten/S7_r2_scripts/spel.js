const {laad}=require("./load.js");
const sb=laad();const c=sb.CASUSSEN[0];const E=sb.Engine;
function rngv(w){return ()=>w}
function run(ep,w,script,lbl){
  const s=E.nieuwSpel(c,ep,{rng:rngv(w)});const log=[];
  for(const st of script){
    if(st==="|"){try{E.volgendeDag(s);log.push("| -> dag "+s.dag+" ["+s.klachten[s.dag].status+"] geb="+s.gebeurtenissen.map(g=>g.id+"@"+g.dag).join(","))}catch(e){log.push("| FOUT "+e.message)}}
    else if(st==="R"){const r=E.raadpleeg(s);log.push("raadpleeg "+(r.ok?"ok acties="+s.actiesOver:r.fout));}
    else {const [k,d,o]=st.split(":");const r=E.speelKaart(s,k,{doel:d||null,optie:o||null});log.push(st+" "+(r.ok?"ok":"FOUT "+r.fout)+(r.onthuld&&r.onthuld.length?" ONTHULD "+JSON.stringify(r.onthuld.map(x=>x.waarde||x.tekst)):""));}
  }
  console.log("=== "+lbl);console.log(log.join("\n"));console.log("klachten",JSON.stringify(s.klachten.map(k=>k&&k.status)),"toest",s.toestanden,"sets",JSON.stringify(s.sets),"vA/B",s.volgordeAB,"einde",E.eindeBereikt(s),"zichtbaar",JSON.stringify(s.zichtbaar.lab),s.zichtbaar.eerdereKweek||"");
  return s;
}
run("E1",0,["G1","G2","V4","|","N1","Ev1","|","|","|","|","|"],"E1 fosfomycine");
run("E1",0,["V1","N1","Ev1","|","|"],"E1 afwachten");
run("E1",0,["V2","V4","|"],"E1 V2+V4");
run("E2",0,["G1","G2","O1","|","V4","N1","N2","|","|","|","|","|"],"E2 fosfo, G2 vooraf");
run("E2",0,["G2","O1","V5","|","O2","N1","|","B1:V4","V6:V5:halveren","|","|","|","|"],"E2 tmp");
run("E2",0,["G2","V4","O1","N1","|","|"],"E2 O1 als 4e");
run("E2",0,["G1","G2","V4","O1","|","|"],"E2 O1 als 4e kaart");
run("E2",0,["G1","G2","V4","N1","O1","|","|"],"E2 O1 als 5e kaart");
for(const w of [0,0.99]) {
run("E3",w,["G3","O1","V4","|","N1","N2","R","|","|","|","|","|","|"],"E3 start fosfo w="+w);
run("E3",w,["G3","G1","O1","|","V7","B4:V7","N1","|","Ev1","B1:V8","V6:V8:875/125 mg 2 dd","|","|","|","|","|"],"E3 cipro+B4, de-escalatie w="+w);
}

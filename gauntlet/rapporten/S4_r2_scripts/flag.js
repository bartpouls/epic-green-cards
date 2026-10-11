const {maak}=require("./mini.js"); const M=maak(); const {E,c}=M;
M.sb.Evaluatie=M.sb.Evaluatie||{beoordeel:(c,id,st)=>M.beoordeel(st)};
for (const flag of [false,true]) {
  const st=E.nieuwSpel(c,"E3",{rng:()=>0,afrondenPasNaGebeurtenissen:flag});
  ["G3","O1","V4"].forEach(k=>E.speelKaart(st,k));
  let r1; try{ r1=E.rondAf(st); r1="afgerond poort="+r1.poortGehaald; }catch(e){ r1="FOUT: "+e.message; }
  console.log("flag",flag,"dag1 afronden ->",r1);
}
// raadplegen kost 1
const st=E.nieuwSpel(c,"E3",{rng:()=>0}); const r=E.raadpleeg(st); console.log("raadplegen:",JSON.stringify({ok:r.ok,kost:r.kost,over:st.actiesOver,titel:r.titel}));
// 4 kaarten op één dag niet
const s2=E.nieuwSpel(c,"E3",{rng:()=>0}); ["G1","G2","G3"].forEach(k=>E.speelKaart(s2,k)); console.log("4e kaart dag1:",E.speelKaart(s2,"O1").fout);

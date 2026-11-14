const {laad}=require("./load.js");
const sb=laad();const c=sb.CASUSSEN[0];const e=c.episodes.find(x=>x.id==="E2");const E=sb.Engine,P=sb.Predicaten;
function spel(dagen){
  const st=E.nieuwSpel(c,"E2",{rng:()=>0});
  dagen.forEach((d,i)=>{ if(i>0)E.volgendeDag(st); d.forEach(k=>{const r=E.speelKaart(st,k[0],{doel:k[1]||null,optie:k[2]||null}); if(!r.ok) throw new Error("kaart "+k[0]+" dag "+(i+1)+": "+r.fout)}); });
  return st;
}
function beoordeel(st){
  const ctx=P.maakContext(c,e,st);
  const geld=i=>i.geldtIn.some(x=>x==="*"||(x&&x.gebeurtenis&&st.gebeurtenissen.some(b=>b.id===x.gebeurtenis)));
  const g=e.invarianten.filter(i=>geld(i)&&P.evalueer(i.predicaat,ctx)).sort((a,b)=>a.ernst-b.ernst);
  let vraag=null;if(g[0]){vraag=g[0].vraag;(g[0].vraagVarianten||[]).some(v=>{if(P.evalueer(v.als,ctx)){vraag=v.vraag;return true}return false})}
  return g.map(i=>i.id).join(",")+(vraag?" | "+vraag.slice(0,40):"");
}
function t(naam,dagen,verw){ let r; try{ r=beoordeel(spel(dagen)); }catch(x){ r="ERR "+x.message } const ok=r.split(" |")[0]===verw; console.log((ok?"OK  ":"FOUT ")+naam+" => ["+r+"] verwacht ["+verw+"]"); }
const G2=["G2"],O1=["O1"],N1=["N1"],N2v4=["N2","V4"],V4=["V4"],V5=["V5"],O2=["O2"],V6h=["V6","V5","halveren"],B1v4=["B1","V4"];
// casusroutes
t("casus: fosfomycine",[[G2,O1,V4],[N1,N2v4]],"");
t("casus: V5 d1, O2 d2, V6 d4, B1 na uitslag",[[G2,O1,V5],[O2,N1],[B1v4],[V6h]],"");
t("casus: V5 d1, O2 d2, V6 d5",[[G2,O1,V5],[O2,N1],[B1v4],[],[V6h]],"");
t("casus: V5 d1, O2 d4, V6 d4",[[G2,O1,V5],[N1],[B1v4],[V6h,O2]],"");
t("casus: V5 d1, O2 d2, V6 d4, B1 d4 (C-venster)",[[G2,O1,V5],[O2,N1],[],[V6h,B1v4]],"");
// foutroutes
t("I1 geen N1",[[G2,O1,V4]],"I1");
t("I4 twee abx",[[G2,O1,V4],[V5,N1],[O2],[],[V6h]],"I4");
t("I5 V3",[[G2,O1,V4.map(x=>x)]].length?[[G2,O1,["V3"]],[N1]]:null,"I5");
t("I5 via B1",[[G2,O1,V4],[["B1","V3"],N1]],"I5");
t("I6 geen kweek",[[G2,V4],[N1]],"I6");
t("I6 geen kweek (O1 na V4)",[[G2,V4,O1],[N1]],"I6");
t("I6 afwachten V1",[[G2,O1,["V1"]],[N1]],"I6");
t("I6 afwachten V2",[[G2,O1,["V2"]],[N1]],"I6");
t("I6 niets",[[G2,O1,N1]],"I6");
t("I6+V1+V4 zonder O1 (beide vragen)",[[G2,["V1"],V4],[N1]],"I6");
t("I7 geen kalium",[[G2,O1,V5],[N1],[B1v4],[V6h]],"I7");
t("I7 niet gehalveerd",[[G2,O1,V5],[O2,N1],[B1v4]],"I7");
t("I7 V6 te vroeg (d3)",[[G2,O1,V5],[O2,N1],[B1v4,V6h]],"I7");
t("I7 V6 verdubbelen",[[G2,O1,V5],[O2,N1],[B1v4],[["V6","V5","verdubbelen"]]],"I7");
t("I7 beide ontbreken",[[G2,O1,V5],[N1],[B1v4]],"I7");
t("I8 V5 blijft",[[G2,O1,V5],[O2,N1],[["Ev1"]],[V6h],[],[]],"I8");
t("I8 V5 blijft, korte",[[G2,O1,V5],[O2,N1],[["Ev1"]],[V6h]],"I8");
t("I8 B1 op d5",[[G2,O1,V5],[O2,N1],[["Ev1"]],[V6h],[B1v4]],"I8");
// randgevallen
t("I8 V5 gestopt (B2) d4",[[G2,O1,V5],[O2,N1],[["Ev1"]],[V6h,["B2","V5"]]],"");

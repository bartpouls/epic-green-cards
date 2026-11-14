// Foutinjectie: laat Predicaten.* / Evaluatie.beoordeel / data-getters bij de k-de aanroep gooien; state moet daarna identiek zijn (inhoud én verwijzingen).
const {laad}=require("./laad.js");
const util=require("util");
let seed=+process.argv[2]||1;function R(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}const ri=n=>Math.floor(R()*n);
const sb=laad();const E=sb.Engine,casus=sb.CASUSSEN[0];
const J=x=>JSON.stringify(x);
function refs(s){const m=new Map();(function w(o,p,d){if(d>4||o===null||typeof o!=="object")return;m.set(p,o);for(const k of Object.keys(o))w(o[k],p+"."+k,d+1);})(s,"s",0);return m;}
function snap(s){return {json:J(s),refs:refs(s),keys:Object.keys(s).join(","),rng:s.rng,casus:s._casus,opties:s._opties};}
function gelijk(s,sn){
  if(J(s)!==sn.json)return "inhoud verschilt";
  if(Object.keys(s).join(",")!==sn.keys)return "sleutels/volgorde verschillen";
  if(s.rng!==sn.rng)return "rng";
  const nu=refs(s);for(const [p,o] of sn.refs){if(nu.get(p)!==o)return "verwijzing vervangen: "+p;}
  return null;
}
let totaal=0,fouten=[],tel={};
function nieuwePartij(epId){
  const ep=casus.episodes.find(e=>e.id===epId);
  const s=E.nieuwSpel(casus,epId,{rng:()=>R()});
  const n=ri(12);
  for(let i=0;i<n;i++){
    const k=ep.repertoire[ri(ep.repertoire.length)];const kaart=casus.kaarten.find(c=>c.id===k);let o={};
    const dl=kaart.doelen&&kaart.doelen[epId];if(dl)o.doel=dl[ri(dl.length)].id;
    if(kaart.opties){const od=kaart.opties[o.doel]||[];if(od.length){const x=od[ri(od.length)];o.optie=typeof x==="string"?x:x.tekst;}}
    E.speelKaart(s,k,o);if(R()<0.3&&s.dag<s.aantalDagen)E.volgendeDag(s);
  }
  return s;
}
function injecteer(label,doeFn,s){
  // 1) tel aanroepen van alle hulpen; 2) laat de k-de gooien
  const P=sb.Predicaten,Ev=sb.Evaluatie;const orig={};
  const namen=["evalueer","maakContext","tel"].filter(n=>typeof P[n]==="function");
  let teller=0,doel=-1;
  namen.forEach(n=>{orig["P"+n]=P[n];P[n]=function(){if(teller++===doel)throw new Error("INJECTIE "+n);return orig["P"+n].apply(this,arguments);};});
  orig.beoordeel=Ev.beoordeel;
  Ev.beoordeel=function(c,e,st){
    if(teller++===doel){ if(st&&st.tijdlijn)st.tijdlijn.push({volg:99,kaart:"X"}); st.vuil=1; throw new Error("INJECTIE beoordeel");}
    const r=orig.beoordeel.apply(this,arguments); return r;};
  try{
    // droog: aantal aanroepen
    const droog=JSON.parse(J(s));
    const kopieS=s; // niet kopiëren: we draaien op een kloon via herhaalde partij met dezelfde seed is lastig; gebruik geheugen-snapshot
    return {namen,orig,P,Ev,tel:()=>teller,zet:(k)=>{teller=0;doel=k;}};
  }finally{}
}
function herstelHulp(h){h.namen.forEach(n=>{h.P[n]=h.orig["P"+n];});h.Ev.beoordeel=h.orig.beoordeel;}
const aantalPartijen=+process.argv[3]||300;
for(let g=0;g<aantalPartijen;g++){
  const epId=["E1","E2","E3"][ri(3)];
  const zaad=seed;
  const acties=["speel","dag","raadpleeg","af"];
  for(const actie of acties){
    // bouw dezelfde partij opnieuw voor elke k
    for(let k=0;k<12;k++){
      seed=zaad;const s=nieuwePartij(epId);
      const ep=casus.episodes.find(e=>e.id===epId);
      const sn0=snap(s);
      const h=injecteer(actie,null,s);
      h.zet(k);
      let gegooid=false,res;
      const kaartKeus=ep.repertoire[ri(ep.repertoire.length)];
      const kaart=casus.kaarten.find(c=>c.id===kaartKeus);let o={};
      const dl=kaart.doelen&&kaart.doelen[epId];if(dl)o.doel=dl[ri(dl.length)].id;
      if(kaart.opties){const od=kaart.opties[o.doel]||[];if(od.length){const x=od[ri(od.length)];o.optie=typeof x==="string"?x:x.tekst;}}
      try{
        if(actie==="speel")res=E.speelKaart(s,kaartKeus,o);
        else if(actie==="dag"){ if(s.dag>=s.aantalDagen){herstelHulp(h);continue;} res=E.volgendeDag(s);}
        else if(actie==="raadpleeg")res=E.raadpleeg(s);
        else res=E.rondAf(s);
      }catch(e){gegooid=/INJECTIE/.test(e.message);if(!gegooid){/* andere fout: ook state intact vereist */}}
      herstelHulp(h);
      totaal++;
      if(gegooid)tel[actie]=(tel[actie]||0)+1;if(gegooid||(res&&res.ok===false)){
        const v=gelijk(s,sn0);
        if(v){fouten.push(epId+" "+actie+" k="+k+": "+v);}
      }
    }
  }
}
console.log({totaal_injecties:totaal,werkelijk_gegooid:tel,fouten:fouten.length});const cat={};fouten.forEach(f=>{const c=f.replace(/^E\d /,"").replace(/k=\d+/,"");cat[c]=(cat[c]||0)+1;});console.log(cat);

// Atomiciteit met geïnjecteerde fouten
require("./load.js");
const c0=CASUSSEN[0];const N=+process.argv[2]||1500, SEED0=+process.argv[3]||7;
function lcg(z){z>>>=0;return()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296}}
const J=x=>JSON.stringify(x);
const realEval=Predicaten.evalueer,realCtx=Predicaten.maakContext,realBeoordeel=Evaluatie.beoordeel;
function refs(o,pad,acc,seen){ if(o&&typeof o==="object"){ if(seen.has(o))return; seen.add(o); acc.push([pad,o]); for(const k of Object.keys(o)) refs(o[k],pad+"."+k,acc,seen)} }
function snap(s){const acc=[];refs(s,"s",acc,new Set());return{j:J(s),refs:acc,names:Object.getOwnPropertyNames(s).sort().join(","),casus:s._casus,opt:s._opties,rng:s.rng}}
function zelfde(a,b,diep){ if(a.j!==b.j)return"json"; if(a.names!==b.names)return"eigenschappen "+a.names+" / "+b.names; const m=new Map(b.refs.map(([p,o])=>[p,o]));
  for(const [p,o] of a.refs){ if(!diep&&p.split('.').length>2)continue; if(m.get(p)!==o)return"verwijzing vervangen op "+p } if(a.casus!==b.casus||a.opt!==b.opt||a.rng!==b.rng)return"verborgen veld"; return null}
let fouten=[],stats={proeven:0,gegooid:0,nietGegooid:0,perActie:{}};
function inject(soort,k){
  let n=0;
  if(soort==="eval") Predicaten.evalueer=function(p,c){ if(++n===k)throw new Error("inject eval"); return realEval.call(Predicaten,p,c)};
  if(soort==="ctx") Predicaten.maakContext=function(a,b,c){ if(++n===k)throw new Error("inject ctx"); return realCtx.call(Predicaten,a,b,c)};
  if(soort==="beoordeel") Evaluatie.beoordeel=function(c,e,st){ st.tijdlijn.push({volg:99,kaart:"X"}); st.dag=99; st.klachten.length=0; st.sets.resistent.push("Z"); st.onthuld.splice(0); st.zichtbaar.nep=1; st.toestanden.push("kapot"); throw new Error("inject beoordeel")};
  if(soort==="beoordeelNaMutatieOk") Evaluatie.beoordeel=function(c,e,st){ return{poortGehaald:true}};
}
function herstelInject(){Predicaten.evalueer=realEval;Predicaten.maakContext=realCtx;Evaluatie.beoordeel=realBeoordeel}
for(let sp=0;sp<N;sp++){
  const seed=SEED0*100000+sp,r=lcg(seed*7+1),ep=c0.episodes[sp%3];
  const s=Engine.nieuwSpel(c0,ep.id,{rng:lcg(seed)});
  // random geldige prefix
  const pre=Math.floor(r()*14);
  for(let i=0;i<pre&&!Engine.eindeBereikt(s);i++){
    const w=r(); if(w<0.25)Engine.volgendeDag(s); else {const kid=ep.repertoire[Math.floor(r()*ep.repertoire.length)],kd=c0.kaarten.find(x=>x.id===kid),dl=(kd.doelen&&kd.doelen[ep.id])||[];const o={};if(dl.length)o.doel=dl[Math.floor(r()*dl.length)].id;if(kd.opties&&o.doel&&kd.opties[o.doel])o.optie=kd.opties[o.doel][0].tekst;Engine.speelKaart(s,kid,o)} }
  if(Engine.eindeBereikt(s))continue;
  const acties=["speelKaart","raadpleeg","volgendeDag","rondAf"]; const actie=acties[Math.floor(r()*4)];
  const soorten=["eval","ctx","beoordeel"]; const soort=actie==="rondAf"&&r()<0.5?"beoordeel":soorten[Math.floor(r()*3)];
  const k=1+Math.floor(r()*6);
  // bouw zet
  let kid,o={};
  if(actie==="speelKaart"){ // kies kaart met doel en vereist zodat predicaat wordt aangeroepen
    const kandidaten=ep.repertoire.filter(id=>{const kd=c0.kaarten.find(x=>x.id===id);return kd.doelen&&kd.doelen[ep.id]});
    kid=(kandidaten.length&&r()<0.8?kandidaten:ep.repertoire)[Math.floor(r()*(kandidaten.length&&r()<0.8?kandidaten.length:ep.repertoire.length))]||ep.repertoire[0];
    const kd=c0.kaarten.find(x=>x.id===kid),dl=(kd.doelen&&kd.doelen[ep.id])||[]; if(dl.length)o.doel=dl[Math.floor(r()*dl.length)].id; if(kd.opties&&o.doel&&kd.opties[o.doel])o.optie=kd.opties[o.doel][0].tekst; }
  const voor=snap(s); stats.proeven++;
  inject(soort,k); let gegooid=false,res;
  try{ res=actie==="speelKaart"?Engine.speelKaart(s,kid,o):Engine[actie](s) }catch(e){gegooid=true} finally{herstelInject()}
  const na=snap(s);
  stats.perActie[actie+"/"+soort]=(stats.perActie[actie+"/"+soort]||0)+1;
  if(gegooid){stats.gegooid++; const d=zelfde(voor,na,soort!=="beoordeel"); if(d)fouten.push(`spel ${seed} ${ep.id} ${actie} inject ${soort}#${k}: state niet hersteld (${d})`)}
  else { stats.nietGegooid++;
    if(res&&res.ok===false){ const d=zelfde(voor,na); if(d)fouten.push(`spel ${seed} ${actie}: geweigerd maar state veranderd (${d})`)} }
}
const echt=fouten.filter(f=>!/s\.wachtend\.0/.test(f));console.log(J(stats),"wachtend-elementidentiteit (niet-fout):",fouten.length-echt.length);fouten.length=0;echt.forEach(f=>fouten.push(f));console.log(fouten.length?fouten.length+" fouten\n"+fouten.slice(0,10).join("\n"):"GEEN AFWIJKINGEN");

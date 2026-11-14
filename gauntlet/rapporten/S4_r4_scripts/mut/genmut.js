// Criticus-mutaties (ronde 4): GEDRAGSMUTANTEN op de E3-data. Eigen generator, niet die van de bouwer.
const L=require("../load.js");
const sb=L.laad();const c=sb.CASUSSEN[0];const E3=c.episodes.find(e=>e.id==="E3");
const KAARTEN=["G1","G3","O1","O2","V1","V2","V3","V4","V5","V6","V7","V8","V9","V10","B1","B2","B3","B4","B5","N1","N3","Ev1","Ev2","Ev3"];
const ANDER_KAART=k=>{ const m={N1:"N3",N3:"Ev1",Ev1:"N1",O1:"O2",O2:"O1",G3:"G1",G1:"G3",V3:"V4",V4:"V3",V5:"V4",V7:"V8",V8:"V7",V9:"V4",V10:"V5",V1:"V2",V2:"V1",V6:"V5",B1:"B2",B2:"B1",B3:"B5",B4:"B3",B5:"B3",Ev2:"Ev3",Ev3:"Ev2"}; return m[k]||"G1"; };
const ANDER_DOEL={spironolacton:"lisinopril",lisinopril:"spironolacton",calcium:"spironolacton",V5:"V8",V8:"V7",V7:"V8",V4:"V3",V3:"V4",V9:"V4",V10:"V5"};
const ANDER_OPTIE={halveren:"verdubbelen","875/125 mg 2 dd":"500/125 mg 2 dd"};
const ANDER_GEB={A:"B",B:"A",C:"A"};
const ANDER_STATUS={af:"aan",aan:"af",geenVerbetering48:"aan"};
const ANDER_OP={"<":"<=",">":">=","==":"!=","!=":"==","<=":"<",">=":">"};
const PSWAP={gespeeld:"nietGespeeld",nietGespeeld:"gespeeld",en:"of",of:"en",voor:"na",na:"voor",gestart:"actief",actief:"gestart"};
const muts=[];
function get(o,p){return p.reduce((a,k)=>a[k],o);}
function add(id,p,newVal){ muts.push({id,p,v:newVal}); }
function pad(p){return p.join(".");}
function walk(x,p,inPred){
  if(Array.isArray(x)){ x.forEach((v,i)=>walk(v,p.concat(i),inPred)); return; }
  if(!x||typeof x!=="object") return;
  const isPred=typeof x.p==="string"; const here=pad(p);
  if(isPred){
    // 1 predicaatnaam
    if(PSWAP[x.p]) add(here+"|p:"+x.p+">"+PSWAP[x.p],p.concat("p"),PSWAP[x.p]);
    // 2 args verwijderen
    if(Array.isArray(x.args)&&x.args.length>1) x.args.forEach((a,i)=>muts.push({id:here+"|args-del"+i,p:p.concat("args"),del:i}));
    // 3 niet-wrapper weg / inpakken
    if(x.p==="niet") muts.push({id:here+"|niet-unwrap",p,unwrap:"arg"});
    else if(p.length>1 && !(p[p.length-1]==="args")) muts.push({id:here+"|niet-wrap",p,wrapNiet:true});
    // 4 constanten
    muts.push({id:here+"|waarheid-true",p,vervang:{p:"waarheid",waarde:true}},{id:here+"|waarheid-false",p,vervang:{p:"waarheid",waarde:false}});
  }
  Object.keys(x).forEach(k=>{
    const v=x[k], pp=p.concat(k), id=pad(pp);
    if(/^TODO_BART|^meta$|^casusTekst$|^altijdFout$|^geldtInTekst$|^bron$|^vraag$|^tekst$|^reflectievraag$|^label$|^naam$/.test(k)) return;
    if(typeof v==="number"){ add(id+"|+1",pp,v+1); if(v>0) add(id+"|-1",pp,v-1); }
    else if(typeof v==="string"){
      if(k==="kaart"||k==="alleenAlsGespeeld") add(id+"|kaart>"+ANDER_KAART(v),pp,ANDER_KAART(v));
      else if(k==="doel"&&ANDER_DOEL[v]) add(id+"|doel>"+ANDER_DOEL[v],pp,ANDER_DOEL[v]);
      else if(k==="optie"&&ANDER_OPTIE[v]) add(id+"|optie",pp,ANDER_OPTIE[v]);
      else if((k==="naGebeurtenis"||k==="eindeBeurtNaGebeurtenis"||(k==="id"&&ANDER_GEB[v]&&isPred&&x.p==="gebeurtenisGeweest")||k==="gebeurtenis")&&ANDER_GEB[v]) add(id+"|geb>"+ANDER_GEB[v],pp,ANDER_GEB[v]);
      else if(k==="waarde"&&ANDER_STATUS[v]) add(id+"|status",pp,ANDER_STATUS[v]);
      else if(k==="op"&&ANDER_OP[v]) add(id+"|op>"+ANDER_OP[v],pp,ANDER_OP[v]);
      else if(k==="middel"&&ANDER_DOEL[v]) add(id+"|middel>"+ANDER_DOEL[v],pp,ANDER_DOEL[v]);
      else if(k==="id"&&isPred&&x.p==="medicatieActief"&&ANDER_DOEL[v]) add(id+"|medid",pp,ANDER_DOEL[v]);
      else if(k==="veld") add(id+"|veld",pp,v==="eGFR"?"risicogroep":"eGFR");
      else if(k==="uitSet") add(id+"|uitSet",pp,"gevoelig");
      else if(k==="wanneer") add(id+"|wanneer",pp,v==="altijd"?"alleenBijGehaaldePoort":"altijd");
      else if(k==="toestand") add(id+"|toestand",pp,v==="weefselinvasie"?"uitdroging":"weefselinvasie");
      else if(k==="type") add(id+"|type",pp,v==="naKaart"?"naKaartVanKaart":"naKaart");
    } else if(typeof v==="boolean") add(id+"|bool",pp,!v);
    walk(v,pp,isPred||inPred);
  });
}
// gedragsgebieden
["invarianten","werkzaamheid","score","profielen","feedbackExtra","zichtbaarAlsOntbreekt","gebeurtenissen","knoppen","patient.waar","patient.verborgen","antibiotica","startToestanden"].forEach(g=>{
  const p=g.split("."); walk(get(E3,p),p,false); });
// extra: ernst, geldtIn, volgorde, lijsten
E3.invarianten.forEach((i,ix)=>{
  add("inv."+i.id+".ernst+1",["invarianten",ix,"ernst"],i.ernst+1); if(i.ernst>1) add("inv."+i.id+".ernst-1",["invarianten",ix,"ernst"],i.ernst-1);
  add("inv."+i.id+".geldtIn=[*]",["invarianten",ix,"geldtIn"],["*"]);
  if(i.geldtIn[0]!=="*") add("inv."+i.id+".geldtIn=[]",["invarianten",ix,"geldtIn"],[]);
  muts.push({id:"inv."+i.id+".verplaats-naar-einde",inv:ix,k:"einde"});
  if(ix+1<E3.invarianten.length) muts.push({id:"inv."+i.id+".swap-volgende",inv:ix,k:"swap"});
});
E3.profielen.forEach((pr,ix)=>{ muts.push({id:"profielen.swap",k:"profswap"}); });
E3.werkzaamheid.cystitis.werkzaam.forEach((w,i)=>muts.push({id:"werkz.cyst.werkzaam-del"+i,p:["werkzaamheid","cystitis","werkzaam"],del:i}));
E3.werkzaamheid.weefselinvasie.werkzaam.forEach((w,i)=>muts.push({id:"werkz.wi.werkzaam-del"+i,p:["werkzaamheid","weefselinvasie","werkzaam"],del:i}));
muts.push({id:"werkz.cyst.werkzaam-add-V8",p:["werkzaamheid","cystitis","werkzaam"],push:{kaart:"V8"}});
muts.push({id:"werkz.cyst.werkzaam-add-V7",p:["werkzaamheid","cystitis","werkzaam"],push:{kaart:"V7"}});
muts.push({id:"werkz.wi.werkzaam-add-V4",p:["werkzaamheid","weefselinvasie","werkzaam"],push:{kaart:"V4"}});
muts.push({id:"werkz.wi.werkzaam-add-V5",p:["werkzaamheid","weefselinvasie","werkzaam"],push:{kaart:"V5"}});
muts.push({id:"werkz.cyst.werkzaam-add-V3",p:["werkzaamheid","cystitis","werkzaam"],push:{kaart:"V3"}});
muts.push({id:"werkz.cyst.werkzaam-del-key",delkey:["werkzaamheid","cystitis"]});
muts.push({id:"werkz.wi.werkzaam-del-key",delkey:["werkzaamheid","weefselinvasie"]});
muts.push({id:"gebeurtenis.A.zet-del",delkey:["gebeurtenissen",0,"zet"]});
muts.push({id:"gebeurtenis.C.zet.resistent-del",p:["gebeurtenissen",2,"zet","resistent"],del:1});
muts.push({id:"gebeurtenis.C.zet.resistent-add-V4",p:["gebeurtenissen",2,"zet","resistent"],push:"V4"});
muts.push({id:"gebeurtenis.C.zet.gevoelig-del",p:["gebeurtenissen",2,"zet","gevoelig"],del:0});
muts.push({id:"gebeurtenis.B.groep-del",delkey:["gebeurtenissen",1,"groep"]});
muts.push({id:"gebeurtenis.A.groep-del",delkey:["gebeurtenissen",0,"groep"]});
muts.push({id:"gebeurtenis.C.alleenAls-del",delkey:["gebeurtenissen",2,"trigger","alleenAlsGespeeld"]});
muts.push({id:"antibiotica.del-V10",p:["antibiotica"],del:6});muts.push({id:"antibiotica.del-V9",p:["antibiotica"],del:5});muts.push({id:"antibiotica.del-V5",p:["antibiotica"],del:2});muts.push({id:"antibiotica.add-V1",p:["antibiotica"],push:"V1"});
muts.push({id:"patient.waar.risicogroep=false",p:["patient","waar","risicogroep"],v:false});muts.push({id:"patient.waar.eGFR=30",p:["patient","waar","eGFR"],v:30});muts.push({id:"patient.waar.eGFR=29",p:["patient","waar","eGFR"],v:29});muts.push({id:"patient.waar.eGFR=31",p:["patient","waar","eGFR"],v:31});
muts.push({id:"patient.zichtbaar.risicogroep-toegevoegd",p:["patient","zichtbaar","risicogroep"],v:"Risicogroep [NHG]."});
muts.push({id:"patient.zichtbaar.toelichting-toegevoegd",p:["patient","zichtbaar","toelichting"],v:"Wie spironolacton heeft gestart"});
muts.push({id:"patient.medicatie.del-spiro",p:["patient","medicatie"],del:1});
muts.push({id:"patient.zichtbaar.medicatie.del-spiro",p:["patient","zichtbaar","medicatie"],del:1});
muts.push({id:"repertoire.del-B5",p:["repertoire"],del:E3.repertoire.indexOf("B5")});muts.push({id:"repertoire.del-G3",p:["repertoire"],del:2});muts.push({id:"repertoire.del-Ev2",p:["repertoire"],del:24});muts.push({id:"repertoire.del-V10",p:["repertoire"],del:14});muts.push({id:"repertoire.del-N3",p:["repertoire"],del:22});
muts.push({id:"statusTeksten.af-swap-aan",k:"statusswap"});
muts.push({id:"episode.afrondenPas=true",p:["afrondenPasNaGebeurtenissen"],v:true});
muts.push({id:"verborgen.G3->G2",p:["patient","verborgen",0,"kaart"],v:"G2"});
muts.push({id:"verborgen.zichtbaar-del",delkey:["patient","verborgen",0,"zichtbaar"]});
muts.push({id:"knoppen.raadplegenKost=0",p:["knoppen","raadplegenKost"],v:0});
muts.push({id:"knoppen.actiesPerBeurt=2",p:["knoppen","actiesPerBeurt"],v:2});
muts.push({id:"knoppen.aantalDagen=6",p:["knoppen","aantalDagen"],v:6});
exports.muts=muts;
exports.apply=function(m,e3){
  if(m.k==="einde"){ const i=e3.invarianten.splice(m.inv,1)[0]; e3.invarianten.push(i); return; }
  if(m.k==="swap"){ const a=e3.invarianten; const t=a[m.inv]; a[m.inv]=a[m.inv+1]; a[m.inv+1]=t; return; }
  if(m.k==="profswap"){ e3.profielen.reverse(); return; }
  if(m.k==="statusswap"){ const t=e3.statusTeksten; const x=t.af; t.af=t.aan; t.aan=x; return; }
  if(m.delkey){ const par=get(e3,m.delkey.slice(0,-1)); delete par[m.delkey[m.delkey.length-1]]; return; }
  const p=m.p; const par=get(e3,p.slice(0,-1)); const key=p[p.length-1];
  if(m.del!==undefined){ get(e3,p).splice(m.del,1); return; }
  if(m.push!==undefined){ get(e3,p).push(JSON.parse(JSON.stringify(m.push))); return; }
  if(m.unwrap){ const node=get(e3,p); const inner=node[m.unwrap]; for(const k of Object.keys(node)) delete node[k]; Object.assign(node,inner); return; }
  if(m.wrapNiet){ const node=get(e3,p); const kop=JSON.parse(JSON.stringify(node)); for(const k of Object.keys(node)) delete node[k]; node.p="niet"; node.arg=kop; return; }
  if(m.vervang){ const node=get(e3,p); for(const k of Object.keys(node)) delete node[k]; Object.assign(node,m.vervang); return; }
  par[key]=m.v;
};
if(require.main===module){ console.log(muts.length); }

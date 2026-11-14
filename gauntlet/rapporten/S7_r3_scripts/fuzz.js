const {laad}=require("./laad.js");const O=require("./orakel.js");
const N=+process.argv[2]||6000, SEED0=+process.argv[3]||12345, VLAG=process.argv[4]||"";
const src=VLAG&&VLAG.startsWith("src=")?require("fs").readFileSync(VLAG.slice(4),"utf8"):null;
const sb=laad(src);const E=sb.Engine,c=sb.CASUSSEN[0];
function mk(seed){let a=(seed*2654435761)>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const J=x=>JSON.parse(JSON.stringify(x));
let fouten=[],stats={spellen:0,zetten:0,legaal:0,illegaal:0,dagen:0,raad:0,afr:0,herk:0,geb:{},stat:{},ABeerst:{A:0,B:0},mism:0};
function meld(m,ctx){stats.mism++; if(fouten.length<15) fouten.push(m+" | "+ctx);}
for(let g=0;g<N;g++){
  const rnd=mk(SEED0+g*7919);
  const epId=["E1","E2","E3"][Math.floor(rnd()*3)];
  const ep=c.episodes.find(e=>e.id===epId);
  const flag=rnd()<0.2;
  let rngWaarde=rnd(); const rngSeq=mk(SEED0*3+g);
  // rng die we kunnen reproduceren: vaste waarde in 50%, anders reeks
  const draws=[];const rngF=rnd()<0.5?(()=>{draws.push(rngWaarde);return rngWaarde;}):(()=>{const v=rngSeq();draws.push(v);return v;});
  const s=E.nieuwSpel(c,epId,{rng:rngF,afrondenPasNaGebeurtenissen:flag});
  stats.spellen++;
  // orakel: volgorde afleiden uit de getrokken getallen met een eigen Fisher-Yates
  const groepen={};ep.gebeurtenissen.forEach(e=>{if(e.groep)(groepen[e.groep]=groepen[e.groep]||[]).push(e.id);});
  const orde={};let di=0;Object.keys(groepen).forEach(gr=>{const a=groepen[gr].slice(),n=a.length;for(let i=0;i<n-1;i++){const j=i+Math.floor(draws[di++]*(n-i));[a[i],a[j]]=[a[j],a[i]];}orde[gr]=a;});
  if(di!==draws.length) meld("aantal rng-trekkingen "+draws.length+" i.p.v. "+di,epId);
  if(orde.AB) stats.ABeerst[orde.AB[0]]++;
  if(JSON.stringify(s.groepen)!==JSON.stringify(orde)) meld("groepsvolgorde "+JSON.stringify(s.groepen)+" vs "+JSON.stringify(orde),epId);
  const o=O.maakOrakel(sb,c,epId,orde);
  const stappen=Math.floor(rnd()*70)+5;
  for(let st=0;st<stappen;st++){
    const r=rnd();
    const voor=JSON.stringify(s);
    if(r<0.62){ // speel kaart
      const ids=ep.repertoire.concat(rnd()<0.1?["ZZ","G3","V10","B3"]:[]);
      const kid=ids[Math.floor(rnd()*ids.length)];
      const k=c.kaarten.find(x=>x.id===kid);
      let opts={};
      const dl=k&&k.doelen&&k.doelen[epId];
      if(rnd()<0.9){
        if(dl&&dl.length&&rnd()<0.93){const d=dl[Math.floor(rnd()*dl.length)];opts.doel=d.id; if(k.opties){const ol=k.opties[d.id]||[];if(ol.length&&rnd()<0.9)opts.optie=ol[Math.floor(rnd()*ol.length)].tekst;else if(rnd()<0.5)opts.optie="onzin";}}
        else if(rnd()<0.3){opts.doel=["V5","lisinopril","ONZIN"][Math.floor(rnd()*3)];if(rnd()<0.5)opts.optie="halveren";}
      }
      // orakel: legaal?
      let legaal=!o.afgerond&&!o.voorbij&&!!k&&ep.repertoire.includes(kid)&&o.acties>=1;
      if(legaal){
        const doelkaart=!!(dl);
        if(!doelkaart){ if(opts.doel!=null||opts.optie!=null) legaal=false; }
        else{
          const d=dl.find(x=>x.id===opts.doel);
          if(opts.doel==null||!d) legaal=false;
          else{
            if(d.vereist){ const ctx=sb.Predicaten.maakContext(c,ep,O.state(o)); if(!sb.Predicaten.evalueer(d.vereist,ctx)) legaal=false; }
            if(legaal){ if(k.opties){ const ol=k.opties[opts.doel]||[]; if(!ol.length||opts.optie==null||!ol.some(x=>x.tekst===opts.optie)) legaal=false; } else if(opts.optie!=null) legaal=false; }
          }
        }
      }
      let res;try{res=E.speelKaart(s,kid,opts);}catch(e){meld("speelKaart gooit: "+e.message,epId+" "+kid+JSON.stringify(opts));continue;}
      stats.zetten++;
      if(res.ok!==legaal){meld("legaliteit: engine ok="+res.ok+" orakel="+legaal+" fout="+res.fout,epId+" "+kid+JSON.stringify(opts)+" dag"+o.dag);continue;}
      if(!res.ok){stats.illegaal++; if(JSON.stringify(s)!==voor) meld("state gewijzigd bij geweigerde zet",epId+" "+kid); continue;}
      stats.legaal++;
      o.tijdlijn.push({volg:o.tijdlijn.length+1,kaart:kid,dag:o.dag,doel:opts.doel==null?null:opts.doel,optie:opts.optie==null?null:opts.optie});o.acties--;
      // onthullen
      (ep.patient.verborgen||[]).forEach(v=>{if(v.kaart===kid&&!o.onthuld.some(x=>x.kaart===kid&&x.tekst===v.onthult)) o.onthuld.push({kaart:kid,dag:o.dag,sleutel:v.sleutel||null,tekst:v.onthult,waarde:(v.waarde!==undefined?v.waarde:(v.sleutel?ep.patient.waar[v.sleutel]:null))??null});});
      O.naSpelen(o);
    } else if(r<0.78){ // volgende dag
      let thrown=null,orVoorbij=o.voorbij||o.afgerond;
      try{E.volgendeDag(s);}catch(e){thrown=e;}
      stats.dagen++;
      if(o.afgerond||o.voorbij){ if(!thrown) meld("volgendeDag gooit niet na einde",epId); else if(JSON.stringify(s)!==voor) meld("state gewijzigd bij gooi volgendeDag",epId); continue; }
      if(thrown){meld("volgendeDag gooit: "+thrown.message,epId);continue;}
      O.volgendeDag(o,sb);
    } else if(r<0.88){ // raadpleeg
      const kost=ep.knoppen.raadplegenKost||0;
      const legaal=!o.afgerond&&!o.voorbij&&o.acties>=kost;
      let res;try{res=E.raadpleeg(s);}catch(e){meld("raadpleeg gooit "+e.message,epId);continue;}
      stats.raad++;
      if(res.ok!==legaal){meld("raadpleeg legaliteit "+res.ok+"/"+legaal,epId);continue;}
      if(res.ok){o.acties-=kost;o.raadpl++;} else if(JSON.stringify(s)!==voor) meld("state gewijzigd bij geweigerde raadpleging",epId);
    } else if(r<0.93){ // afronden
      const open=ep.gebeurtenissen.some(e=>!o.geb.some(x=>x.id===e.id));
      const mag=o.afgerond||!(flag&&!o.voorbij&&open);
      let res,thrown=null;try{res=E.rondAf(s);}catch(e){thrown=e;}
      stats.afr++;
      if(mag&&thrown) meld("rondAf gooit onterecht: "+thrown.message,epId);
      else if(!mag&&!thrown) meld("rondAf had moeten weigeren (flag)",epId);
      else if(!mag&&JSON.stringify(s)!==voor) meld("state gewijzigd na geweigerde rondAf",epId);
      else if(mag&&!thrown) o.afgerond=true;
      if(o.afgerond) {
        // na afronden: niets meer mogelijk
        const v2=JSON.stringify(s);
        const a=E.speelKaart(s,ep.repertoire[0]);const b=E.raadpleeg(s);let t=null;try{E.volgendeDag(s);}catch(e){t=e;}
        if(a.ok||b.ok||!t||JSON.stringify(s)!==v2) meld("mutatie na afronden mogelijk",epId);
        break;
      }
    } else { // inspectie
    }
    // vergelijk volledig
    const cmp=(naam,a,b)=>{if(JSON.stringify(a)!==JSON.stringify(b)) meld(naam+": engine "+JSON.stringify(a)+" orakel "+JSON.stringify(b),epId+" stap"+st+" dag"+o.dag);};
    cmp("dag",s.dag,o.dag);cmp("acties",s.actiesOver,o.acties);cmp("tijdlijn",s.tijdlijn,o.tijdlijn);
    cmp("gebeurtenissen",s.gebeurtenissen,o.geb);cmp("wachtend",s.wachtend,o.wacht);cmp("toestanden",s.toestanden,o.toest);
    cmp("sets",s.sets,{resistent:o.res,gevoelig:o.gev});cmp("raadplegingen",s.raadplegingen.length,o.raadpl);
    cmp("onthuld",s.onthuld,o.onthuld);cmp("dagenVoorbij",s.dagenVoorbij,o.voorbij);
    for(let d=1;d<=o.dag;d++){const kk=s.klachten[d],ok=o.klachten[d];
      if(!kk||kk.dag!==d||kk.status!==ok.status||(d>1&&kk.tekst!==(ok.tekst??null))) meld("klachten dag "+d+": engine "+JSON.stringify(kk)+" orakel "+JSON.stringify(ok),epId+" stap"+st);}
    if(s.klachten.length!==o.dag+1) meld("klachten lengte "+s.klachten.length,epId);
    // zichtbaar vs waar: waar mag niet veranderen
    if(JSON.stringify(ep.patient.waar)!==JSON.stringify(sb.CASUSSEN[0].episodes.find(e=>e.id===epId).patient.waar)) meld("waar gemuteerd",epId);
  }
  o.geb.forEach(x=>stats.geb[x.id]=(stats.geb[x.id]||0)+1);
  for(let d=2;d<=o.dag;d++){const st=o.klachten[d].status;stats.stat[st]=(stats.stat[st]||0)+1;}
  // herkansing
  if(g%50===0){const h=E.herkansing(s);stats.herk++; if(h.dag!==1||h.tijdlijn.length||h.afgerond||h.episodeId!==epId||h===s) meld("herkansing niet vers",epId);}
}
console.log(JSON.stringify(stats));console.log("mismatches:",stats.mism);fouten.forEach(f=>console.log(" -",f));
process.exit(stats.mism?1:0);

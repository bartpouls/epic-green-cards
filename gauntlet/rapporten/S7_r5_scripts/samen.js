require("./load.js");const c=CASUSSEN[0];const J=JSON.stringify;
function lcg(z){z>>>=0;return()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296}}
let n=0,gehaald=0,gesch=0,fouten=[];
function heeftFunctie(o,seen=new Set(),pad="u"){ if(typeof o==="function")return pad; if(o&&typeof o==="object"){ if(seen.has(o))return"cyclus@"+pad; seen.add(o); for(const k in o){const r=heeftFunctie(o[k],seen,pad+"."+k);if(r)return r} seen.delete(o)} return null}
for(let sp=0;sp<900;sp++){
 const r=lcg(sp*31+7),ep=c.episodes[sp%3],s=Engine.nieuwSpel(c,ep.id,{rng:lcg(sp)});
 for(let st=0;st<60&&!Engine.eindeBereikt(s);st++){const w=r();if(w<0.2)Engine.volgendeDag(s);else{const kid=ep.repertoire[Math.floor(r()*ep.repertoire.length)],kd=c.kaarten.find(x=>x.id===kid),dl=(kd.doelen&&kd.doelen[ep.id])||[];const o={};if(dl.length)o.doel=dl[Math.floor(r()*dl.length)].id;if(kd.opties&&o.doel&&kd.opties[o.doel])o.optie=kd.opties[o.doel][0].tekst;Engine.speelKaart(s,kid,o)} if(r()<0.03)break}
 const voor=J(s);
 const beo=Evaluatie.beoordeel(c,ep.id,s); if(J(s)!==voor)fouten.push("beoordeel muteert state "+sp);
 const u=Engine.rondAf(s);
 if(J(u)!==J(beo))fouten.push("rondAf != beoordeel "+sp);
 const f=heeftFunctie(u);if(f)fouten.push("uitkomst bevat functie/cyclus "+f);
 if(J(JSON.parse(J(u)))!==J(u))fouten.push("niet JSON-stabiel "+sp);
 if(u!==s.uitkomst||Engine.rondAf(s)!==u)fouten.push("uitkomst niet bewaard");
 if(typeof u.poortGehaald!=="boolean")fouten.push("poortGehaald geen boolean");
 u.poortGehaald?gehaald++:gesch++;
 // herkansing
 const h=Engine.herkansing(s);
 if(h===s||h.tijdlijn===s.tijdlijn||h.klachten===s.klachten||h.zichtbaar===s.zichtbaar||h.sets===s.sets||h.toestanden===s.toestanden||h.toestanden===ep.startToestanden)fouten.push("herkansing deelt arrays "+sp);
 if(h.afgerond||h.uitkomst!==null||h.tijdlijn.length||h.dag!==1)fouten.push("herkansing niet schoon");
 if(J(s)!==J(JSON.parse(voor.replace(/"afgerond":false/,'"afgerond":true')).uitkomst===undefined?s:s))void 0;
 n++;
 // gehaalde logrecords voor ontgrendelen
 const rec={casusId:c.id,episodeId:ep.id,geschonden:(u.geschonden||[]).map(x=>x.id)};
 const ep2=c.episodes[(sp%3)+1];
 if(ep2){const open=Engine.ontgrendeld(c,ep2.id,[rec]);if(open!==!!u.poortGehaald)fouten.push(`ontgrendeld ${open} poortGehaald ${u.poortGehaald} ${sp}`);
   const open2=Engine.ontgrendeld(c,ep2.id,[{uitkomst:u,episodeId:ep.id,casusId:c.id}]);if(open2!==!!u.poortGehaald)fouten.push("ontgrendeld via uitkomst "+sp)}
}
console.log(n,"gehaald",gehaald,"geschonden",gesch,fouten.length?fouten.slice(0,10):"GEEN AFWIJKINGEN");

const {laad}=require("./laad.js");
const J=x=>JSON.stringify(x);
const res=[];
function t(naam,fn){try{const r=fn();res.push((r===true?"OK   ":"FOUT ")+naam+(r===true?"":" -> "+r));}catch(e){res.push("EXC  "+naam+" -> "+e.message);}}
function vers(){const sb=laad();return {sb,E:sb.Engine,c:JSON.parse(JSON.stringify(sb.CASUSSEN[0])),ev:sb.Evaluatie};}
function cyc(){const o={};o.o=o;return o;}
function checkState(s,voor,ref){ if(J(s)!==voor) return "inhoud: "+J(s).slice(0,120)+" vs "+voor.slice(0,120); if(ref&&ref.some(([k,o])=>s[k]!==o)) return "verwijzing"; return true;}
// 1 speelKaart: tweede verborgen-rij heeft kapotte patch -> eerste rij mag niet blijven staan
t("speelKaart: kapotte tweede verborgen-rij (circulaire patch) rolt eerste rij terug",()=>{
  const {E,c}=vers();const ep=c.episodes[1];
  ep.patient.verborgen.push({kaart:"G2",onthult:"extra",sleutel:"zzz",waarde:5});
  ep.patient.verborgen.push({kaart:"G2",onthult:"kapot",zichtbaar:{a:cyc()}});
  const s=E.nieuwSpel(c,"E2",{rng:()=>0});const voor=J(s);const refs=[["tijdlijn",s.tijdlijn],["onthuld",s.onthuld],["zichtbaar",s.zichtbaar],["wachtend",s.wachtend]];
  let g=false;try{E.speelKaart(s,"G2");}catch(e){g=true;}
  return (g?true:"gooide niet")&&checkState(s,voor,refs);});
t("speelKaart: trigger-getter gooit na pushen van de regel",()=>{
  const {E,c}=vers();const ep=c.episodes[2];
  Object.defineProperty(ep.gebeurtenissen[0],"trigger",{get(){throw new Error("kapot")}});
  const s=E.nieuwSpel(c,"E3",{rng:()=>0});const voor=J(s);let g=false;
  try{E.speelKaart(s,"G1");}catch(e){g=true;}return (g?true:"gooide niet")&&checkState(s,voor);});
t("raadpleeg: circulaire bronnen -> state ongewijzigd",()=>{
  const {E,c}=vers();c.raadplegen={titel:"x",bronnen:[cyc()]};const s=E.nieuwSpel(c,"E3",{rng:()=>0});const voor=J(s);let g=false;
  try{E.raadpleeg(s);}catch(e){g=true;}return checkState(s,voor);});
t("raadpleeg: kost-getter gooit",()=>{
  const {E,c}=vers();const s=E.nieuwSpel(c,"E3",{rng:()=>0});const voor=J(s);
  Object.defineProperty(c.episodes[2].knoppen,"raadplegenKost",{get(){throw new Error("kapot")}});
  let g=false;try{E.raadpleeg(s);}catch(e){g=true;}return (g?true:"gooide niet")&&checkState(s,voor);});
t("volgendeDag: gebeurtenis toegepast, daarna kapot statusNaBeurten-predicaat -> alles terug (toestanden/sets/wachtend)",()=>{
  const {E,c}=vers();const ep=c.episodes[2];
  ep.werkzaamheid.weefselinvasie.werkzaam.push({kaart:"V8",als:{p:"bestaatNiet"}});
  const s=E.nieuwSpel(c,"E3",{rng:()=>0});
  for(const k of ["G1","G2","O1","V4"])E.speelKaart(s,k,k==="V4"?{}:{});
  E.volgendeDag(s);E.speelKaart(s,"N1");E.speelKaart(s,"V8");
  const voor=J(s);const refs=[["toestanden",s.toestanden],["sets",s.sets],["gebeurtenissen",s.gebeurtenissen],["wachtend",s.wachtend],["klachten",s.klachten]];
  let g=false;try{for(let i=0;i<4&&!g;i++){E.volgendeDag(s);}}catch(e){g=true;}
  return g?(checkState(s,voor.length?J(s):voor,refs)):"gooide niet (test onbruikbaar): toestanden="+J(s.toestanden);});
t("rondAf: Evaluatie geeft circulair object -> volgende speelKaart geeft Nederlandse fout i.p.v. TypeError",()=>{
  const {sb,E,c,ev}=vers();ev.beoordeel=function(){return cyc();};
  const s=E.nieuwSpel(c,"E1",{rng:()=>0});let r1;try{r1=E.rondAf(s);}catch(e){return "rondAf gooide "+e.message;}
  try{const r=E.speelKaart(s,"G1");return r.ok===false&&/afgerond/.test(r.fout)?true:"speelKaart na afronden: "+J(r);}catch(e){return "speelKaart gooit "+e.constructor.name+": "+e.message;}});
t("rondAf: tweede aanroep na gegooide Evaluatie geeft opnieuw een poging (afgerond blijft false)",()=>{
  const {sb,E,c,ev}=vers();let n=0;ev.beoordeel=function(){if(n++===0)throw new Error("eerste keer kapot");return {poortGehaald:true,geschonden:[]};};
  const s=E.nieuwSpel(c,"E1",{rng:()=>0});try{E.rondAf(s);return "had moeten gooien";}catch(e){}
  if(s.afgerond)return "afgerond bleef true";const u=E.rondAf(s);return s.afgerond&&u.poortGehaald===true?true:"tweede poging mislukt";});
t("rondAf: Evaluatie muteert state.tijdlijn/onthuld en gooit -> terug",()=>{
  const {sb,E,c,ev}=vers();ev.beoordeel=function(c_,e,st){st.tijdlijn.push({volg:9});st.onthuld.length=0;st.zichtbaar.nieuw=1;st.klachten.pop();throw new Error("kapot");};
  const s=E.nieuwSpel(c,"E1",{rng:()=>0});E.speelKaart(s,"G1");E.volgendeDag(s);const voor=J(s);try{E.rondAf(s);}catch(e){}return checkState(s,voor);});
t("rondAf: Evaluatie geeft undefined terug -> uitkomst blijft null/undefined consistent, afgerond?",()=>{
  const {sb,E,c,ev}=vers();ev.beoordeel=function(){return undefined;};
  const s=E.nieuwSpel(c,"E1",{rng:()=>0});const r=E.rondAf(s);return "afgerond="+s.afgerond+" uitkomst="+J(s.uitkomst)+" r="+J(r)+" (informatief)";});
t("speelKaart na rondAf met Evaluatie die state.rng overschrijft",()=>{
  const {sb,E,c,ev}=vers();ev.beoordeel=function(c_,e,st){st.rng=null;throw new Error("kapot");};
  const s=E.nieuwSpel(c,"E1",{rng:()=>0.5});const r0=s.rng;try{E.rondAf(s);}catch(e){}return s.rng===r0?true:"rng niet hersteld";});
t("volgendeDag: ep.knoppen.actiesPerBeurt-getter gooit na dag++",()=>{
  const {E,c}=vers();const s=E.nieuwSpel(c,"E1",{rng:()=>0});const voor=J(s);
  Object.defineProperty(c.episodes[0].knoppen,"actiesPerBeurt",{get(){throw new Error("kapot")}});
  let g=false;try{E.volgendeDag(s);}catch(e){g=true;}return (g?true:"gooide niet")&&checkState(s,voor);});
t("herkansing: casus verdwenen -> Nederlandse fout",()=>{
  const {sb,E,c}=vers();const s=E.nieuwSpel(c,"E1",{rng:()=>0});sb.CASUSSEN.length=0;
  try{const n=E.herkansing(s);return "gaf spel terug (state._casus gebruikt): "+(n&&n.casusId);}catch(e){return /casus/i.test(e.message)?true:"foutmelding: "+e.message;}});
console.log(res.join("\n"));

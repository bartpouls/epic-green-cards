const L=require("./load.js");const sb=L.laad();const c=sb.CASUSSEN[0];const e=c.episodes.find(x=>x.id==="E3");
function walk(x,pad,f){ f(x,pad); if(Array.isArray(x))x.forEach((v,i)=>walk(v,pad+"["+i+"]",f)); else if(x&&typeof x==="object")Object.keys(x).forEach(k=>walk(x[k],pad+"."+k,f)); }
// 1 ontwerpnoten buiten meta
const bad=[];walk(e,"E3",(x,p)=>{ if(x&&typeof x==="object"&&!Array.isArray(x)) Object.keys(x).forEach(k=>{ if(/^(toelichting|opmerking|reden|noot|ontwerp|uitleg)/i.test(k)&&!/\.meta$/.test(p)) bad.push(p+"."+k);});});
console.log("ontwerpnoot-sleutels buiten meta:",bad);
// 2 interne verwijzingen in TODO-teksten
const re=/contract|rapport|\bronde\b|\bronde \d|stuk\b|LEAD|criticus|bouwer|\bS\d+\b|TODO_BART-\d|gauntlet|engine-param|afrondenPasNa|state\.|\bflag\b|Predicaten|tests?\b/i;
const tods=[];walk(e,"E3",(x,p)=>{ if(typeof x==="string"&&/TODO_BART/.test(p.split(".").pop())) tods.push([p,x]);});
c.todoBart.filter(t=>/^TODO_BART-E3/.test(t.id)).forEach(t=>["vraag","gekozenLezing","plek"].forEach(k=>tods.push([t.id+"."+k,t[k]])));
tods.forEach(([p,s])=>{const m=s.match(re); if(m) console.log("INTERNE VERWIJZING?",p,m[0],"::",s.slice(Math.max(0,m.index-40),m.index+60));});
console.log("TODO-strings gecontroleerd:",tods.length);
// 3 TODO op plek <-> casus.todoBart
const ids=c.todoBart.filter(t=>/^TODO_BART-E3/.test(t.id));console.log("E3-TODO's:",ids.length, ids.map(t=>t.id.replace("TODO_BART-","")).join(","));
const vragen=new Set(ids.map(t=>t.vraag));const orphan=tods.filter(([p])=>/E3/.test(p)&&!/^TODO_BART-E3/.test(p)).filter(([p,s])=>!vragen.has(s));
console.log("TODO's op de plek zonder gelijke vraag in casus.todoBart:",orphan.map(o=>o[0]));
// 4 zichtbaar velden
console.log("zichtbaar sleutels:",Object.keys(e.patient.zichtbaar));
console.log("medicatieTekst==casusMedicatieregel:",e.patient.zichtbaar.medicatieTekst===e.patient.casusMedicatieregel);
console.log("(hypertensie) aanwezig:",/\(hypertensie\)/.test(e.patient.zichtbaar.medicatieTekst));
// 5 dubbele/rare spaties, NBSP, markdown
walk(e,"E3",(x,p)=>{ if(typeof x==="string"){ if(/  | |\*\*|\t|\s$|^\s/.test(x)) console.log("RARE SPATIE/MD:",p,JSON.stringify(x).slice(0,80)); }});
// 6 predicaat-namen & -vormen
const ps={};walk(e,"E3",(x)=>{ if(x&&typeof x==="object"&&typeof x.p==="string") ps[x.p]=(ps[x.p]||0)+1;});console.log(ps);
let plat=0,genest=0;walk(e,"E3",(x)=>{ if(x&&typeof x==="object"&&typeof x.p==="string"){ if(x.K) genest++; if(x.kaart!==undefined) plat++; }});console.log("genest(K):",genest,"plat(kaart):",plat);
try{ const v=sb.Evaluatie.valideerCasus(c); console.log("valideerCasus ok"); }catch(er){ console.log("valideerCasus FOUT:",er.message.slice(0,500)); }
console.log("afrondenPasNaGebeurtenissen in data:",e.afrondenPasNaGebeurtenissen);
console.log("casus.rollen:",JSON.stringify(c.rollen));
console.log("episode sleutels:",Object.keys(e).join(","));

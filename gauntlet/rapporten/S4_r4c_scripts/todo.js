const L=require("./load.js"); L.laad(); const ep=L.ep3(), c=CASUSSEN[0];
const marks=[]; (function w(x,p){ if(Array.isArray(x)) x.forEach((v,i)=>w(v,p+"["+i+"]")); else if(x&&typeof x==="object") for(const k of Object.keys(x)){ if(/^TODO_BART/.test(k)) marks.push({p:p+"."+k,t:x[k]}); else w(x[k],p+"."+k);} })(ep,"E3");
const tb=c.todoBart.filter(t=>/^TODO_BART-E3-/.test(t.id));
console.log("markeringen in E3:",marks.length,"| todoBart E3-entries:",tb.length,"| ids:",tb.map(t=>t.id.replace("TODO_BART-E3-","")).join(","));
const verb=/contract|rapport|ronde|stuk\b|LEAD|criticus|bouwer|\bS\d{1,2}\b|\br\d\b|TODO_BART-|gauntlet|engine-?parameter|predicaat|state\.|JSON|\.js\b|afrondenPas/i;
for(const m of marks){ if(typeof m.t!=="string"){console.log("niet-string",m.p);continue;} if(!tb.some(t=>t.vraag===m.t)) console.log("MARKERING zonder todoBart-entry:",m.p); if(verb.test(m.t)) console.log("VERWIJZING in markering",m.p,m.t.match(verb)[0]); }
for(const t of tb){ for(const f of ["vraag","gekozenLezing","plek"]) { if(typeof t[f]!=="string"||!t[f]) console.log("leeg veld",t.id,f); else if(verb.test(t[f])) console.log("VERWIJZING",t.id,f,JSON.stringify(t[f].match(verb)[0]),"::",t[f].slice(Math.max(0,t[f].search(verb)-30),t[f].search(verb)+40)); } if(!marks.some(m=>m.t===t.vraag)) console.log("todoBart zonder markering op de plek:",t.id,"|",t.plek); }
// dubbele ids / alle keys
console.log(new Set(tb.map(t=>t.id)).size, tb.length);
console.log("andere todo-ids in casus:", c.todoBart.filter(t=>!/E3/.test(t.id)).map(t=>t.id).join(" "));

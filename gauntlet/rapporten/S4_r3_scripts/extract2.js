const fs=require("fs");const L=require("./load.js");
const md=fs.readFileSync(L.root+"/casus-uwi.md","utf8");const sb=L.laad();const c=sb.CASUSSEN[0];const e3=c.episodes.find(e=>e.id==="E3");
const s6=md.split(/^## /m).find(s=>s.startsWith("6. "));
const all=[];(function w(x){ if(typeof x==="string") all.push(x); else if(Array.isArray(x)) x.forEach(w); else if(x&&typeof x==="object") Object.keys(x).forEach(k=>{if(k.indexOf("TODO_BART")!==0) w(x[k]);});})(e3);
const blob=all.join("\n");
// 1) alle "…" tussen rechte aanhalingstekens in sectie 6
const q=[...s6.matchAll(/"([^"]{6,})"/g)].map(m=>m[1]);
let ok=0,bad=[];q.forEach(t=>{ if(blob.includes(t)) ok++; else bad.push(t); });
console.log("geciteerde fragmenten sectie 6:",q.length,"letterlijk in E3-data:",ok,"ontbreekt:",bad.length);bad.forEach(b=>console.log("  -",b));
// 2) tabelcellen invarianten + gebeurtenissen
const rows=s6.split("\n").filter(l=>/^\| (I\d+|A|B|C) \|/.test(l));
rows.forEach(r=>{ const cells=r.split("|").slice(1,-1).map(x=>x.trim().replace(/\*\*/g,"")); 
  const miss=cells.slice(1).filter(x=>x.length>3&&!blob.includes(x)&&!/^(Na kaart|3 kaarten)/.test(x)); console.log(cells[0].padEnd(4),miss.length?"ONTBREEKT "+JSON.stringify(miss).slice(0,200):"ok");});
// 3) hoofdtekst-stukken
["Mevrouw V., 79 jaar (1 jaar na episode 2). Cystitis, geen koorts.","lisinopril, spironolacton (hypertensie), calcium/colecalciferol.","eGFR 28, recent. Risicogroep [NHG].",
 "de kweek uit episode 2, met trimethoprim resistent. Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG].",
 "De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler."].forEach(t=>console.log(blob.includes(t)||blob.replace(/\n/g," ").includes(t)?"ok ":"MIS",t.slice(0,60), "casus:",s6.includes(t)));
// kop+klachten samengesteld
const z=e3.patient.zichtbaar;console.log("kop+klachten", (z.kop+" "+z.klachten)===  "Mevrouw V., 79 jaar (1 jaar na episode 2). Cystitis, geen koorts.");
console.log("lab+risico",(z.labTekst+" "+z.risicogroep)==="eGFR 28, recent. Risicogroep [NHG].");
// verborgen
const v=e3.patient.verborgen[0];console.log("verborgen", (v.onthult+". "+v.toelichting)==="de kweek uit episode 2, met trimethoprim resistent. Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG].");
// invarianten rij vs data
const rowsI=rows.filter(r=>/^\| I/.test(r)).map(r=>r.split("|").slice(1,-1).map(x=>x.trim()));
rowsI.forEach(c4=>{ const inv=e3.invarianten.find(i=>i.id===c4[0]); console.log(c4[0], inv.altijdFout===c4[1], inv.geldtInTekst===c4[2], inv.bron===c4[3]);});
// feedbacktabel
const fb=s6.split("### Feedback")[1].split("\n").filter(l=>l.startsWith("|")&&!/^\|[-| ]+\|$/.test(l)&&!l.includes("Trigger"));
fb.forEach(l=>{const cs=l.split("|").slice(1,-1).map(x=>x.trim());const vraag=cs[1].replace(/^"|"$/g,"");console.log("fb",cs[0].padEnd(32),blob.includes(vraag));});

const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards/";
const md=fs.readFileSync(root+"casus-uwi.md","utf8").split("\n");
const sb={console};sb.window=sb;vm.createContext(sb);
["casussen/uwi.js","casussen/uwi-e3.js"].forEach(f=>vm.runInContext(fs.readFileSync(root+f,"utf8"),sb));
const e3=sb.CASUSSEN[0].episodes.find(e=>e.id==="E3");
const s6=md.findIndex(l=>l.startsWith("## 6."));
const reg=md.slice(s6).find(l=>l.includes("**Medicatie:**"));
const bron=reg.replace(/\*\*/g,"").replace(/^- Medicatie: /,"");
console.log("casus medicatie :",JSON.stringify(bron));
console.log("data casusMedicatieregel:",JSON.stringify(e3.patient.casusMedicatieregel));
console.log("data zichtbaar.medicatieTekst:",JSON.stringify(e3.patient.zichtbaar.medicatieTekst));
console.log("gelijk:",bron===e3.patient.casusMedicatieregel);
// zelfde controle voor andere regels: klachten, lab, risicogroep, verborgen
const pk=md.slice(s6,s6+20);
const lab=pk.find(l=>l.includes("**Lab:**")).replace(/\*\*/g,"").replace(/^- Lab: /,"");
console.log("lab regel casus:",JSON.stringify(lab)," data:",JSON.stringify(e3.patient.zichtbaar.labTekst+" "+e3.patient.zichtbaar.risicogroep));
const vb=pk.find(l=>l.includes("Verborgen achter G3")).replace(/\*\*/g,"").replace(/^- Verborgen achter G3: /,"");
console.log("verborgen casus:",JSON.stringify(vb));
console.log("verborgen data :",JSON.stringify(e3.patient.verborgen[0].onthult+". "+e3.patient.verborgen[0].toelichting));

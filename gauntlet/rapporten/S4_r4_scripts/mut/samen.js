const fs=require("fs");const rows=[];fs.readdirSync(".").filter(f=>/^out\d\.jsonl$/.test(f)).forEach(f=>fs.readFileSync(f,"utf8").split("\n").filter(l=>l&&l!=="KLAAR").forEach(l=>rows.push(JSON.parse(l))));
const laad=rows.filter(r=>r.laad), geldig=rows.filter(r=>!r.laad);
const bk=geldig.filter(r=>r.builderFails>0), ov=geldig.filter(r=>r.builderFails===0);
const ongeldigEigen=geldig.filter(r=>/^ongeldig/.test(r.eigen||""));
console.log("totaal",rows.length,"laadfout",laad.length,"geldig",geldig.length);
console.log("gedood door bouwerstests (zonder pin):",bk.length,"| overleefd:",ov.length);
const ovGedrag=ov.filter(r=>r.eigen&&!/^ongeldig/.test(r.eigen));
console.log("overleefd, maar gedrag wijkt af van mijn orakel (echte testgaten):",ovGedrag.length);
const ovEq=ov.filter(r=>!r.eigen);console.log("overleefd en gedrag identiek (equivalent in gedrag):",ovEq.length);
console.log("overleefd en ongeldige data (valideerCasus faalt):",ov.filter(r=>/^ongeldig/.test(r.eigen||"")).length);
if(process.argv[2]){ ovGedrag.forEach(r=>console.log(" GAT",r.id,"::",r.eigen.slice(0,110))); ovEq.forEach(r=>console.log(" EQ ",r.id)); ov.filter(r=>/^ongeldig/.test(r.eigen||"")).forEach(r=>console.log(" ONG",r.id,r.eigen)); laad.forEach(r=>console.log(" LAAD",r.id,r.laad)); }

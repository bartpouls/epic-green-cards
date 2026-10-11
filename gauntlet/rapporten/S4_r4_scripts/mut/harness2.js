// Tweede ronde: welke gedragsmutanten (volgens mijn orakel) worden door ALLEEN de route- en oracle-tests van de bouwer (E3-route ...) gedood?
const fs=require("fs"),vm=require("vm");const H=require("./harness.js");const G=require("./genmut.js");
const rows=[];fs.readdirSync(".").filter(f=>/^out\d\.jsonl$/.test(f)).forEach(f=>fs.readFileSync(f,"utf8").split("\n").filter(l=>l&&l!=="KLAAR").forEach(l=>rows.push(JSON.parse(l))));
const gedrag=rows.filter(r=>r.eigen&&!/^ongeldig/.test(r.eigen));
const part=+process.argv[2],parts=+process.argv[3],out=process.argv[4];fs.writeFileSync(out,"");
const byId={};G.muts.forEach(m=>byId[m.id]=m);
gedrag.forEach((r,k)=>{ if(k%parts!==part) return; const m=byId[r.id]; let rec={id:r.id};
  try{ const sb=H.bouw(m); const tf=fs.readFileSync(__dirname+"/data-e3.zonderpin.crit.js","utf8"); vm.runInContext(tf,sb,{filename:"t"});
    const res=sb.Test.draaiAlles("data-e3"); const rood=res.filter(x=>!x.ok).map(x=>x.naam);
    rec.alle=rood.length; rec.route=rood.filter(n=>/^E3-route/.test(n)).length; rec.routeNaam=rood.filter(n=>/^E3-route/.test(n))[0]||null; rec.overig=rood.filter(n=>!/^E3-route/.test(n)).length; rec.overigNaam=rood.filter(n=>!/^E3-route/.test(n))[0]||null;
  }catch(e){ rec.fout=e.message.slice(0,80); }
  fs.appendFileSync(out,JSON.stringify(rec)+"\n"); });
fs.appendFileSync(out,"KLAAR\n");

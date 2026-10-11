// overlevers van de predicaten-suite tegen de VOLLE suite (hoofdcontext, ~14 s per mutant)
const fs=require("fs"),cp=require("child_process"),path=require("path");const root="/home/user/epic-green-cards";
const orig=fs.readFileSync(root+"/regels/predicaten.js","utf8");
const tekst=fs.readFileSync(__dirname+"/mut_crit5.js","utf8");
// laad M uit het script zonder het uit te voeren
const m=tekst.slice(tekst.indexOf("const M=["),tekst.indexOf("];\nlet dood")+2);
const M=eval("(function(){"+m+" return M;})()");
const kies=process.argv.slice(2);
for(const [n,a,b] of M){ if(!kies.some(k=>n.startsWith(k+" ")))continue;
  const tmp=fs.mkdtempSync("/tmp/claude-0-mut-");
  // kopieer werkmap-onderdelen die run-node nodig heeft
  cp.execSync("cp -r "+root+"/{casussen,regels,engine,tests,gauntlet} "+tmp+" 2>/dev/null; rm -rf "+tmp+"/gauntlet/rapporten",{shell:"/bin/bash"});
  fs.writeFileSync(tmp+"/regels/predicaten.js",orig.replace(a,()=>b));
  let uit="";try{uit=cp.execSync("node "+tmp+"/gauntlet/tools/run-node.js 2>&1",{encoding:"utf8",timeout:300000});}catch(e){uit=e.stdout||String(e);}
  const rood=(uit.match(/^FAIL .*/gm)||[]);
  console.log(n,"=> rood:",rood.length, rood.slice(0,2).join(" | ").slice(0,200));
  cp.execSync("rm -rf "+tmp);
}

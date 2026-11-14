// toon het effect van een mutant op de casusdata via het referentieorakel (crit_diff)
const fs=require("fs"),cp=require("child_process");
const tekst=fs.readFileSync(__dirname+"/mut_crit5.js","utf8");
const m=tekst.slice(tekst.indexOf("const M=["),tekst.indexOf("];\nlet dood")+2);
const M=eval("(function(){"+m+" return M;})()");
const root="/home/user/epic-green-cards";
const orig=fs.readFileSync(root+"/regels/predicaten.js","utf8");
const naam=process.argv[2];const [n,a,b]=M.find(x=>x[0].startsWith(naam+" "));
const tmp="/tmp/claude-0-mutfx";cp.execSync("rm -rf "+tmp+";mkdir -p "+tmp+"/regels && cp -r "+root+"/{casussen,engine} "+tmp+"/",{shell:"/bin/bash"});
fs.writeFileSync(tmp+"/regels/predicaten.js",orig.replace(a,()=>b));
let s=fs.readFileSync(__dirname+"/crit_diff.js","utf8").replace('const root="/home/user/epic-green-cards"','const root="'+tmp+'"');
fs.writeFileSync(tmp+"/d.js",s);
console.log(n);try{console.log(cp.execSync("node "+tmp+"/d.js 2>&1 | tail -6",{encoding:"utf8"}));}catch(e){console.log(e.stdout)}

const fs=require("fs");const {laad}=require("./load.js");
const md=fs.readFileSync("/home/user/epic-green-cards/casus-uwi.md","utf8").split("\n").slice(165,232).join("\n").replace(/\*\*/g,"");
const sb=laad();const c=sb.CASUSSEN[0];const e=c.episodes.find(x=>x.id==="E2");
const blob=JSON.stringify(e)+JSON.stringify(c.todoBart.filter(t=>/E2/.test(t.id)));
const norm=s=>s.replace(/\\"/g,'"');
const B=norm(blob);
// splits in zinnen/fragmenten
const frag=[];
md.split("\n").forEach(l=>{ l=l.replace(/^\s*[-|]\s*/,"").replace(/^\|/,""); l.split("|").forEach(cel=>{cel=cel.trim().replace(/^"|"$/g,""); cel.split(/(?<=[.?!])\s+/).forEach(z=>{z=z.trim().replace(/^"|"$/g,"").replace(/\.$/,""); if(z.length>=12)frag.push(z)})})});
const mis=frag.filter(f=>B.indexOf(f)<0 && B.indexOf(f.replace(/^[^:]+: /,""))<0);
console.log(frag.length,"fragmenten; niet letterlijk in E2-data/todo:",mis.length);
mis.forEach(m=>console.log("  -",m));

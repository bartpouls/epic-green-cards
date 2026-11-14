// criticus r5: automatische mutaties op de semantische kern (maakContext t/m simuleer/benoemdeSet/vergelijk + PRED + TELLERS)
const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
const src=fs.readFileSync(root+"/regels/predicaten.js","utf8");
const lines=src.split("\n");
function draai(code){
  const sb={console:{log(){},error(){}},setTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  try{vm.runInContext(code,sb,{filename:"predicaten.js"});vm.runInContext(fs.readFileSync(root+"/tests/testlib.js","utf8"),sb);
   vm.runInContext(fs.readFileSync(root+"/tests/predicaten.tests.js","utf8"),sb);}catch(e){return {laad:e.message};}
  const r=sb.Test.draaiAlles("predicaten");return {rood:r.filter(x=>!x.ok).length};
}
// regels (1-gebaseerd) die semantiek bevatten
const bereiken=[[72,112],[125,144],[171,194],[198,267],[270,278],[475,559]];
const ops=[["===","!=="],["!==","==="],["<=","<"],[">=",">"],["< ","<= "],["> ",">= "],["&&","||"],["||","&&"],["+ 1","+ 2"],["- 1","- 0"],["return false","return true"],["return true","return false"],["return null","return {}"],[".some(",".every("],[".every(",".some("],["!== null","=== null"],["=== null","!== null"],["=== undefined","!== undefined"],["!== undefined","=== undefined"],["? 0 :","? 1 :"],["[0]","[1]"],[".slice()",".slice(1)"],["indexOf(","lastIndexOf("],[" = true;"," = false;"],["delete ","void "]];
let tot=0,dood=0;const over=[];
for(const [a,b] of bereiken){for(let l=a;l<=b;l++){const L=lines[l-1];if(/^\s*(\/\/|\/\*)/.test(L)||/fout\(/.test(L))continue;
  for(const [x,y] of ops){let pos=-1;while((pos=L.indexOf(x,pos+1))>=0){
    const nieuw=L.slice(0,pos)+y+L.slice(pos+x.length);const code=lines.slice(0,l-1).concat([nieuw],lines.slice(l)).join("\n");
    tot++;const r=draai(code);if(r.laad||r.rood>0)dood++;else over.push({l,x,y,regel:L.trim().slice(0,110),code});}}}}
console.log("mutaties",tot,"gedood",dood,"overleefd",over.length);
fs.writeFileSync(__dirname+"/auto5_overlevers.json",JSON.stringify(over.map(o=>({l:o.l,x:o.x,y:o.y,regel:o.regel})),null,1));
fs.writeFileSync("/tmp/claude-0/auto5_codes.json",JSON.stringify(over.map(o=>o.code)));
over.forEach((o,i)=>console.log(i,"r"+o.l,JSON.stringify(o.x),"->",JSON.stringify(o.y),"|",o.regel));

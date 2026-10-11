const {draai,orig}=require("./mut.js");const fs=require("fs");
const lines=orig.split("\n");
const start=lines.findIndex(l=>/^\(function engineModule/.test(l));
let inBlock=false;const muts=[];
function add(i,nieuw,wat){const kopie=lines.slice();kopie[i]=nieuw;const src=kopie.join("\n");if(src!==orig)muts.push({i,wat,src});}
lines.forEach((l,i)=>{
  if(i<=start)return;
  const t=l.trim();
  if(inBlock){if(t.includes("*/"))inBlock=false;return;}
  if(t.startsWith("/*")){if(!t.includes("*/"))inBlock=true;return;}
  if(t.startsWith("//")||!t)return;
  // commentaar achter code wegknippen voor mutatie
  const m=/^(.*?)(\s\/\/.*)?$/.exec(l);const code=m[1],cm=m[2]||"";
  const rep=(re,fn,wat)=>{let x;const g=new RegExp(re.source,"g");while((x=g.exec(code))){const nw=code.slice(0,x.index)+fn(x)+code.slice(x.index+x[0].length);add(i,nw+cm,wat+" @"+x.index);}};
  rep(/===/,()=>"!==","=== -> !==");
  rep(/!==/,()=>"===","!== -> ===");
  rep(/(?<![<=!>])<(?![<=])/,()=>"<=","< -> <=");
  rep(/(?<![=<>-])>(?![>=])/,()=>">=","> -> >=");
  rep(/<=/,()=>"<","<= -> <");
  rep(/>=/,()=>">",">= -> >");
  rep(/&&/,()=>"||","&& -> ||");
  rep(/\|\|/,()=>"&&","|| -> &&");
  rep(/\btrue\b/,()=>"false","true -> false");
  rep(/\bfalse\b/,()=>"true","false -> true");
  rep(/(?<![\w."'])1(?![\w."'])/,()=>"2","1 -> 2");
  rep(/(?<![\w."'])0(?![\w."'.x])/,()=>"1","0 -> 1");
  rep(/ \+ (?=\d)/,()=>" - ","+ -> -");
  rep(/ - (?=\d)/,()=>" + ","- -> +");
  rep(/!\(/,()=>"(","!( -> (");
  rep(/\.push\(/,()=>".unshift(",".push -> .unshift");
  rep(/\.some\(/,()=>".every(",".some -> .every");
  rep(/\.every\(/,()=>".some(",".every -> .some");
  rep(/\.filter\(/,()=>".map(",".filter -> .map");
  // regel verwijderen
  if(/;\s*$/.test(code)&&!/^\s*(var|return|throw|\}|function)/.test(code)&&!/^\s*else/.test(code))add(i,cm?"  "+cm:"","regel weg");
  if(/^\s*return .*;\s*$/.test(code))add(i,code.replace(/return .*;/,"return undefined;")+cm,"return -> undefined");
  if(/^\s*if \(.*\) .*;\s*$/.test(code)&&!/\{\s*$/.test(code)){add(i,code.replace(/^(\s*)if \(.*?\) /,"$1if (false) ")+cm,"if -> false");}
});
// willekeurig, reproduceerbaar steekproef
let seed=+process.argv[3]||7;function R(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const n=+process.argv[2]||350;
const idx=muts.map((_,k)=>k).sort(()=>R()-0.5).slice(0,n);
console.log("gegenereerd:",muts.length,"gekozen:",idx.length);
const surv=[];let dood=0;
idx.forEach((k,q)=>{const m=muts[k];const r=draai(m.src);if(r.length)dood++;else{surv.push({regel:m.i+1,wat:m.wat,tekst:lines[m.i].trim().slice(0,110)});}
 if(q%50===49)console.log(q+1,"gedraaid, overleefd",surv.length);});
fs.writeFileSync("mut_overleefd.json",JSON.stringify(surv,null,1));
console.log({gedood:dood,overleefd:surv.length});

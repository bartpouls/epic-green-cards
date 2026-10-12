const fs=require("fs");const orig=fs.readFileSync("/home/user/epic-green-cards/engine/engine.js","utf8");
// mask comments and strings to find code positions
const mask=orig.split("");let i=0;const n=orig.length;
const regio=new Array(n).fill("c");
while(i<n){const c=orig[i];
 if(c==="/"&&orig[i+1]==="/"){while(i<n&&orig[i]!=="\n"){regio[i]="k";i++}continue}
 if(c==="/"&&orig[i+1]==="*"){const j=orig.indexOf("*/",i+2);for(let q=i;q<j+2;q++)regio[q]="k";i=j+2;continue}
 if(c==='"'){let j=i+1;while(orig[j]!=='"')j++;for(let q=i;q<=j;q++)regio[q]="s";i=j+1;continue}
 i++}
const muts=[];
function addAll(re,to,naam){let m;re.lastIndex=0;while((m=re.exec(orig))){if(regio[m.index]!=="c"){continue}muts.push({naam:naam+"@"+m.index+" "+m[0]+"->"+to,from:m.index,end:m.index+m[0].length,to:typeof to==="function"?to(m):to})}}
addAll(/===/g,"!==","eq");addAll(/!==/g,"===","neq");
addAll(/&&/g,"||","en");addAll(/\|\|/g,"&&","of");
addAll(/ < /g," <= ","lt");addAll(/ <= /g," < ","le");addAll(/ >= /g," > ","ge");addAll(/ > /g," >= ","gt");
addAll(/\+ 1/g,"+ 0","plus1");addAll(/- 1/g,"- 0","min1");addAll(/\+= /g,"-= ","pluseq");addAll(/-= 1/g,"-= 0","mineq");
addAll(/\bi\+\+/g,"i+=2","inc");
addAll(/return true/g,"return false","rt");addAll(/return false/g,"return true","rf");
addAll(/\btrue\b/g,"false","true");addAll(/\bfalse\b/g,"true","false");
addAll(/\bnull\b/g,"undefined","null");
addAll(/ \? /g," ? !","tern");
addAll(/!!/g,"","dubbelnot");
addAll(/\.push\(/g,".unshift(","push");
addAll(/\.some\(/g,".every(","some");addAll(/\.filter\(/g,".map(","filter");
addAll(/\bstate\.dag\b/g,"state.aantalDagen","dag");
addAll(/Infinity/g,"0","inf");
addAll(/\?\? /g,"|| ","nn");
// statement deletions: lines ending with ; inside function bodies
const lines=orig.split("\n");let pos=0;
lines.forEach((l,ix)=>{const t=l.trim();
 if(regio[pos+l.length-l.trimStart().length]==="c"&&/^(state\.[A-Za-z.\[\]]+ (\+|-)?= .*;|[a-z]+\.push\(.*\);|state\.[a-zA-Z.]+\.(push|splice)\(.*\);|state\.wachtend\.length = 0;.*|if \(!?[^()]*\) return fout\(.*\);)$/.test(t)&&t.indexOf("var ")!==0){
   muts.push({naam:"del@"+(ix+1)+" "+t.slice(0,60),from:pos+l.indexOf(t),end:pos+l.indexOf(t)+t.length,to:"/*weg*/"})}
 pos+=l.length+1});
// foutmeldingen: verander elk fouttekst
const re=/fout\("([^"]*)"|Error\("([^"]*)"/g;let m;
while((m=re.exec(orig))){const s=m[1]!=null?m[1]:m[2];const at=m.index+m[0].indexOf('"')+1;muts.push({naam:"msg@"+at+" "+s.slice(0,40),from:at,end:at+s.length,to:s+" X"})}
fs.writeFileSync("muts.json",JSON.stringify(muts));console.log(muts.length);

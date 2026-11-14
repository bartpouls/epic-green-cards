// Nieuwe mutatieset (r3): automatisch gegenereerd uit engine.js op tokenniveau + handgeschreven semantische mutaties.
const fs=require("fs"),vm=require("vm"),path=require("path");
const root="/home/user/epic-green-cards";
const orig=fs.readFileSync(root+"/engine/engine.js","utf8");
const files=["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","regels/evaluatie.js","engine/engine.js","engine/logging.js","tests/testlib.js","tests/engine.tests.js"];
const bronnen={};files.forEach(f=>{const p=path.join(root,f);if(fs.existsSync(p))bronnen[f]=fs.readFileSync(p,"utf8");});
function draai(engineSrc){
  const sb={console:{log(){},error(){}}};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  try{
    for(const f of Object.keys(bronnen)){vm.runInContext(f==="engine/engine.js"?engineSrc:bronnen[f],sb,{filename:f,timeout:5000});}
    const r=vm.runInContext("Test.draaiAlles('engine')",sb,{timeout:20000});
    const rood=r.filter(x=>!x.ok);
    return {rood:rood.length,totaal:r.length,eerste:rood[0]&&rood[0].naam};
  }catch(e){return {rood:-1,totaal:0,eerste:"FOUT "+String(e.message).slice(0,60)};}
}
const basis=draai(orig);console.log("basis",JSON.stringify(basis));
// bereik van de uitvoerbare code: tussen 'use strict' en g.Engine = {
const a=orig.indexOf('"use strict";')+13, b=orig.indexOf("g.Engine = {");
const M=[];
function voegToe(naam,idx,len,vervang){M.push({naam,src:orig.slice(0,idx)+vervang+orig.slice(idx+len)});}
// regelkaart voor commentaar en strings overslaan
function binnenTekstOfCommentaar(i){ // eenvoudige scanner
  let s=a,inS=null,inC=null;
  for(;s<i;s++){const ch=orig[s],n=orig[s+1];
    if(inC==="l"){if(ch==="\n")inC=null;continue;}
    if(inC==="b"){if(ch==="*"&&n==="/"){inC=null;s++;}continue;}
    if(inS){if(ch==="\\"){s++;continue;}if(ch===inS)inS=null;continue;}
    if(ch==="/"&&n==="/"){inC="l";s++;continue;} if(ch==="/"&&n==="*"){inC="b";s++;continue;}
    if(ch==='"'||ch==="'"){inS=ch;}
  }
  return !!(inS||inC);
}
const ops=[["===","!=="],["!==","==="],["<=","<"],[">=",">"],["&&","||"],["||","&&"],["true","false"],["false","true"]];
for(const [x,y] of ops){const re=new RegExp(x.replace(/[|&=!<>]/g,"\\$&"),"g");let m;while((m=re.exec(orig))){const i=m.index;if(i<a||i>=b||binnenTekstOfCommentaar(i))continue;
  if((x==="true"||x==="false")&&/[A-Za-z_]/.test(orig[i-1]||" ")) continue;
  if((x==="<="||x===">=")&&(orig[i-1]==="="||orig[i-1]==="!"||orig[i-1]==="<"||orig[i-1]===">")) continue;
  voegToe(x+"->"+y+"@"+orig.slice(0,i).split("\n").length,i,x.length,y);}}
// < en > (geen <=, >=, <<, =>)
for(const [x,y] of [["<","<="],[">",">="],["<",">"]]){const re=new RegExp("(?<![<>=!-])"+x+"(?![<>=])","g");let m;while((m=re.exec(orig))){const i=m.index;if(i<a||i>=b||binnenTekstOfCommentaar(i))continue;voegToe(x+"->"+y+"@"+orig.slice(0,i).split("\n").length,i,1,y);}}
// ! weghalen
{const re=/!(?!=)/g;let m;while((m=re.exec(orig))){const i=m.index;if(i<a||i>=b||binnenTekstOfCommentaar(i))continue;voegToe("!weg@"+orig.slice(0,i).split("\n").length,i,1,"");}}
// getallen
{const re=/(?<![A-Za-z_.\w"'])(\d+)(?![\w"'])/g;let m;while((m=re.exec(orig))){const i=m.index;if(i<a||i>=b||binnenTekstOfCommentaar(i))continue;const v=+m[1];
  voegToe("getal"+v+"->"+(v+1)+"@"+orig.slice(0,i).split("\n").length,i,m[1].length,String(v+1));
  if(v>0)voegToe("getal"+v+"->"+(v-1)+"@"+orig.slice(0,i).split("\n").length,i,m[1].length,String(v-1));}}
// +/- operators (binair)
{const re=/ (\+|-) (?=[\w(])/g;let m;while((m=re.exec(orig))){const i=m.index+1;if(i<a||i>=b||binnenTekstOfCommentaar(i))continue;voegToe("op"+m[1]+"@"+orig.slice(0,i).split("\n").length,i,1,m[1]==="+"?"-":"+");}}
// -= en +=
{const re=/(-=|\+=)/g;let m;while((m=re.exec(orig))){const i=m.index;if(i<a||i>=b||binnenTekstOfCommentaar(i))continue;voegToe(m[1]+"@"+orig.slice(0,i).split("\n").length,i,2,m[1]==="-="?"+=":"-=");}}
// losse statements verwijderen: regels die beginnen met state./o./... en eindigen op ; en geen declaratie
{const lines=orig.split("\n");let pos=0;lines.forEach((ln,ix)=>{const start=pos;pos+=ln.length+1;
  if(start<a||start>=b)return;const t=ln.trim();
  if(/^(state\.|zetTerug|herstel\(|pasGebeurtenissenToe|controleerGebeurtenissen|onthul\(|lijstVan\(e\.toestand\)|if \(.*\) \{? ?state\.|state\.[a-zA-Z.]+(\[.+\])? = ).*;$/.test(t)||/^(state\.|if \(!bevat|if \(e\.zet|if \(v\.|if \(!al|if \(al\))/.test(t)){
    if(binnenTekstOfCommentaar(start+ln.indexOf(t))) return;
    if(/^(if|for|function)/.test(t)&&!/;$/.test(t)) return;
    M.push({naam:"regelweg@"+(ix+1)+": "+t.slice(0,50),src:orig.slice(0,start)+ln.replace(t,";")+orig.slice(start+ln.length)});}});}
console.error("aantal mutanten:",M.length);
const dedup=new Map();M.forEach(m=>{if(!dedup.has(m.src)&&m.src!==orig)dedup.set(m.src,m);});
const lijst=[...dedup.values()];console.log("uniek",lijst.length);
let killed=0;const surv=[];
const start=Date.now();
lijst.forEach((m,i)=>{const r=draai(m.src);if(r.rood!==0)killed++;else {surv.push(m.naam);fs.writeFileSync(__dirname+'/surv/s'+String(surv.length).padStart(2,'0')+'.js',m.src);}});
console.log("gedood",killed,"overleefd",surv.length,"in",((Date.now()-start)/1000|0)+"s");
fs.writeFileSync(__dirname+"/mut_overleefd.json",JSON.stringify(surv,null,1));
surv.forEach(s=>console.log("  OVERLEEFD",s));

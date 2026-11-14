const sb=require("./load.js");const P=sb.Predicaten;const fs=require("fs");
const md=fs.readFileSync("/home/user/epic-green-cards/regels/PREDICATEN.md","utf8");
const spans=[...md.matchAll(/`(\{[^`]*\})`/g)].map(m=>m[1]);
const ep={id:"EX",antibiotica:["Q1","Q2","Q3"],patient:{waar:{w:35,s:"x"},medicatie:[{id:"m1",label:"m1"},{id:"m"}]},gebeurtenissen:[{id:"E"},{id:"G"}],sets:undefined};
const casus={id:"c",rollen:{wissel:"B1",stop:"B2",pauzeer:"B3",hervat:"B5"},episodes:[ep]};
const ctx=P.maakContext(casus,ep,{tijdlijn:[],gebeurtenissen:[],toestanden:[],klachten:[]});
let ok=0,bad=0,skip=0;
for(const s of spans){
  let o;try{o=new Function("P1","P2","return ("+s+")")({p:"waarheid",waarde:true},{p:"waarheid",waarde:false});}catch(e){console.log("niet-JS:",s);skip++;continue;}
  if(!o.p&&!o.t){console.log("geen predicaat (fragment):",s);skip++;continue;} try{ if(o.t&&!o.p)P.valideer(o,ctx);else P.valideer(o,ctx); ok++; }catch(e){ bad++; console.log("VOORBEELD FOUT:",s,"->",e.message); }
}
console.log("voorbeelden:",spans.length,"ok",ok,"fout",bad,"niet-json",skip);

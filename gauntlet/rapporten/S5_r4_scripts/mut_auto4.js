// ronde 4 automatisch: (a) elke 'if (...) fout(' -conditie uitschakelen, (b) elke fout()-aanroep met niet-Nederlandse tekst, (c) elke fout-voorwaarde omkeren
const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
const src=fs.readFileSync(root+"/regels/predicaten.js","utf8");
function draai(code){
  const sb={console:{log(){},error(){}},setTimeout};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  try{vm.runInContext(code,sb,{filename:"predicaten.js"});vm.runInContext(fs.readFileSync(root+"/tests/testlib.js","utf8"),sb);
   vm.runInContext(fs.readFileSync(root+"/tests/predicaten.tests.js","utf8"),sb);}catch(e){return 1;}
  return sb.Test.draaiAlles("predicaten").filter(x=>!x.ok).length;
}
const lines=src.split("\n");const out={a:[],b:[],c:[]};let na=0,nb=0,nc=0;
lines.forEach((l,i)=>{
  const m=l.match(/^(\s*)if \((.*)\) (fout\(.*)$/) ;
  if(m){
    // (a)
    na++; let c=lines.slice();c[i]=l.replace(/if \(/,"if (false && (")+""; // sluit haakje
    c[i]=m[1]+"if (false && ("+m[2]+")) "+m[3]; if(draai(c.join("\n"))===0) out.a.push((i+1)+": "+l.trim().slice(0,100));
    // (c)
    nc++; c=lines.slice(); c[i]=m[1]+"if (!("+m[2]+")) "+m[3]; if(draai(c.join("\n"))===0) out.c.push((i+1)+": "+l.trim().slice(0,100));
  }
  if(/fout\(/.test(l)&&!/function fout/.test(l)){
    nb++; const c=lines.slice(); c[i]=l.replace(/fout\(/,"fout(\"X\"+0&&"); // verandert tekst: "X0"&&... => 0 -> boodschap = 0? 
    // eenvoudiger: tekst vervangen door 'Engelse tekst'
    c[i]=l.replace(/(^|[^\w])fout\(/,"$1foutEN(");
    const code="(function(){"+"})();"; 
    const full=c.join("\n").replace("function fout(tekst) { throw new Error(tekst); }","function fout(tekst) { throw new Error(tekst); }\n  function foutEN(t) { throw new Error('English default error'); }");
    if(draai(full)===0) out.b.push((i+1)+": "+l.trim().slice(0,100));
  }
});
console.log("(a) uitgeschakelde voorwaarden:",na,"overleefd",out.a.length);out.a.forEach(x=>console.log("  ",x));
console.log("(c) omgekeerde voorwaarden:",nc,"overleefd",out.c.length);out.c.forEach(x=>console.log("  ",x));
console.log("(b) fout-tekst vervangen door Engelse tekst:",nb,"overleefd",out.b.length);out.b.forEach(x=>console.log("  ",x));

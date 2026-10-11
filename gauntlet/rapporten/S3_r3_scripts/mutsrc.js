const fs=require("fs"),vm=require("vm");const root=__dirname+"/snap/";
const oracle=require("./oraclemod.js");
function bouw(vervang){ // vervang: {bestand: tekst}
  const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  ["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js","tests/testlib.js","tests/data-e2.tests.js"].forEach(f=>vm.runInContext(vervang[f]!==undefined?vervang[f]:fs.readFileSync(root+f,"utf8"),sb,{filename:f}));
  return sb;
}
const doel=process.argv[2];const src=fs.readFileSync(root+doel,"utf8");
// mutatiepunten: operatoren en constanten in codelijnen (geen commentaar)
const pat=[[/>=/g,">"],[/<=/g,"<"],[/ > /g," >= "],[/ < /g," <= "],[/\+ 1\b/g,"+ 0"],[/- 1\b/g,"- 0"],[/===/g,"!=="],[/&&/g,"||"],[/\|\|/g,"&&"],[/\.some\(/g,".every("],[/\.every\(/g,".some("]];
const muts=[];
const regels=src.split("\n");
regels.forEach((l,i)=>{ if(/^\s*(\/\/|\/\*|\*)/.test(l))return; pat.forEach(([re,vv],pi)=>{ let m; re.lastIndex=0; let k=0; while((m=re.exec(l))){ muts.push({i,col:m.index,len:m[0].length,vv,reg:l.trim().slice(0,90)}); k++; if(k>3)break; } }); });
let sel=muts; const lim=+process.argv[3]||0; if(lim){ let s=7; const r=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}; sel=muts.slice(); for(let i=sel.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[sel[i],sel[j]]=[sel[j],sel[i]]} sel=sel.slice(0,lim); }
let gedood=0,leeg=0,overl=[];
for(const m of sel){
  const l2=regels.slice(); l2[m.i]=l2[m.i].slice(0,m.col)+m.vv+l2[m.i].slice(m.col+m.len);
  let sb; try{ sb=bouw({[doel]:l2.join("\n")}); }catch(e){ gedood++; continue }
  let res; try{ res=sb.Test.draaiAlles("data-e2") }catch(e){ gedood++; continue }
  if(res.some(x=>!x.ok)){ gedood++; continue }
  // overleefd: kijk of orakel een afwijking ziet
  let o; try{ o=oracle(sb,1500,99) }catch(e){ o={fouten:-1,voorbeelden:[e.message]} }
  overl.push({m,orakel:o.fouten,vb:o.voorbeelden[0]&&o.voorbeelden[0].probleem});
}
console.log(doel,"mutatiepunten",muts.length,"uitgevoerd",sel.length,"gedood door data-e2",gedood,"overleefd",overl.length);
overl.forEach(x=>console.log("  OVERLEEFD r"+(x.m.i+1)+" "+JSON.stringify(x.m.reg)+" -> '"+x.m.vv+"' | orakel-afwijkingen: "+x.orakel+(x.vb?" ("+x.vb+")":"")));

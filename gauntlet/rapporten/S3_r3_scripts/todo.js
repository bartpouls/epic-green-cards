const {laad}=require("./load.js");const sb=laad();const c=sb.CASUSSEN[0];
for(const e of c.episodes){
  const m=[];(function w(x,p){ if(Array.isArray(x))x.forEach((v,i)=>w(v,p+"["+i+"]")); else if(x&&typeof x==="object")Object.keys(x).forEach(k=>{ if(k.indexOf("TODO_BART")===0){m.push([p+"."+k,x[k]])} else w(x[k],p+"."+k)}); })(e,e.id);
  const ids=c.todoBart.filter(t=>t.id.startsWith("TODO_BART-"+e.id+"-")||false);
  const vr=c.todoBart.map(t=>t.vraag);
  console.log(e.id,"markeringen",m.length,"todoBart-ids",ids.length,"zonder match:",m.filter(x=>vr.indexOf(x[1])<0).length, "suffixsleutels:",m.map(x=>x[0].split(".").pop()).filter(k=>k!=="TODO_BART").join(","));
  console.log("  todo's zonder markering:",ids.filter(t=>!m.some(x=>x[1]===t.vraag)).map(t=>t.id).join(","));
}
console.log(c.todoBart.map(t=>t.id).join(" "));

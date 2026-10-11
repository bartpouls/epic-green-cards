const {maak}=require("./mini.js"); const M=maak(); const c=M.c, ep=M.ep;
const vragen=c.todoBart.filter(t=>/^TODO_BART-E3-/.test(t.id)).map(t=>t.vraag);
const markers=[]; (function w(x,p){ if(Array.isArray(x)) x.forEach((v,i)=>w(v,p+"["+i+"]")); else if(x&&typeof x==="object") Object.keys(x).forEach(k=>{ if(k==="TODO_BART") markers.push([p,x[k]]); else w(x[k],p+"."+k); }); })(ep,"E3");
let zonder=0; markers.forEach(([p,t])=>{ if(!vragen.includes(t)){zonder++;console.log("marker zonder todoBart-entry:",p,t.slice(0,70));} });
console.log("markers:",markers.length,"todoBart E3-entries:",vragen.length,"markers zonder entry:",zonder);
const gebruikt=new Set(markers.map(m=>m[1])); vragen.forEach((v,i)=>{ if(!gebruikt.has(v)) console.log("entry zonder marker:", c.todoBart.filter(t=>/^TODO_BART-E3-/.test(t.id))[i].id); });
// plek-velden
c.todoBart.filter(t=>/^TODO_BART-E3-/.test(t.id)).forEach(t=>{ for(const k of ["id","vraag","gekozenLezing","plek"]) if(!t[k]) console.log("mist",k,t.id); });

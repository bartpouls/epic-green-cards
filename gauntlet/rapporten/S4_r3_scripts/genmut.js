const L=require("./load.js");
const sb=L.laad();const c=sb.CASUSSEN[0];const e3=c.episodes.find(e=>e.id==="E3");
const muts=[];
function get(o,p){return p.reduce((a,k)=>a[k],o);}
function walk(x,p){
  if(Array.isArray(x)){ x.forEach((v,i)=>walk(v,p.concat(i)));}
  else if(x&&typeof x==="object"){ Object.keys(x).forEach(k=>walk(x[k],p.concat(k))); }
  const par=p.length?get(e3,p.slice(0,-1)):null; const key=p[p.length-1];
  const ps=p.join(".");
  if(typeof x==="string"){
    muts.push({id:ps+"|str-last",t:"e3",p,k:"strlast"});
    if(/\d/.test(x)) muts.push({id:ps+"|str-digit",t:"e3",p,k:"strdigit"});
    if(x.length>8) muts.push({id:ps+"|str-mid",t:"e3",p,k:"strmid"});
    if(/[A-Z]/.test(x)) muts.push({id:ps+"|str-case",t:"e3",p,k:"strcase"});
  } else if(typeof x==="number") muts.push({id:ps+"|num+1",t:"e3",p,k:"num"});
  else if(typeof x==="boolean") muts.push({id:ps+"|bool",t:"e3",p,k:"bool"});
  else if(x===null) muts.push({id:ps+"|null",t:"e3",p,k:"null"});
  if(par&&Array.isArray(par)) { muts.push({id:ps+"|del-el",t:"e3",p,k:"delel"}); }
  if(par&&!Array.isArray(par)&&p.length) muts.push({id:ps+"|del-key",t:"e3",p,k:"delkey"});
  if(Array.isArray(x)&&x.length>1) muts.push({id:ps+"|swap",t:"e3",p,k:"swap"});
}
walk(e3,[]);
// todoBart E3
c.todoBart.forEach((t,i)=>{ if(/^TODO_BART-E3-/.test(t.id)){ ["vraag","gekozenLezing","plek","id"].forEach(f=>muts.push({id:"todo["+t.id+"]."+f+"|str-last",t:"todo",i,f,k:"strlast"})); muts.push({id:"todo["+t.id+"]|del",t:"todo",i,k:"delel"}); }});
exports.muts=muts;
exports.apply=function(m,e3,c){
  if(m.t==="todo"){ const t=c.todoBart[m.i]; if(m.k==="delel") c.todoBart.splice(m.i,1); else t[m.f]=t[m.f].slice(0,-1)+"x"; return; }
  const p=m.p;const par=get(e3,p.slice(0,-1));const key=p[p.length-1];const v=par[key];
  switch(m.k){
    case "strlast": par[key]=v.slice(0,-1)+(v.slice(-1)==="x"?"y":"x");break;
    case "strdigit": par[key]=v.replace(/\d/,d=>String((+d+1)%10));break;
    case "strmid": {const i=Math.floor(v.length/2);par[key]=v.slice(0,i)+(v[i]==="x"?"y":"x")+v.slice(i+1);break;}
    case "strcase": par[key]=v.replace(/[A-Z]/,ch=>ch.toLowerCase());break;
    case "num": par[key]=v+1;break;
    case "bool": par[key]=!v;break;
    case "null": par[key]="x";break;
    case "delel": par.splice(key,1);break;
    case "delkey": delete par[key];break;
    case "swap": {const a=v[0];v[0]=v[1];v[1]=a;break;}
  }
};
if(require.main===module) console.log(muts.length);

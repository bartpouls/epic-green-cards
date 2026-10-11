const fs=require("fs"),vm=require("vm");const root=__dirname+"/snap/";
const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js","casussen/uwi-e3.js","regels/predicaten.js","engine/engine.js","tests/testlib.js","tests/data-e2.tests.js"].forEach(f=>vm.runInContext(fs.readFileSync(root+f,"utf8"),sb,{filename:f}));
const c=sb.CASUSSEN[0];const idx=c.episodes.findIndex(x=>x.id==="E2");const orig=c.episodes[idx];const origTodo=c.todoBart.slice();
const kl=x=>JSON.parse(JSON.stringify(x));
function rngSeed(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=rngSeed(+process.argv[2]||7);
// verzamel alle paden
const paden=[];
(function w(x,p){ if(Array.isArray(x)){paden.push({p,t:"arr",n:x.length});x.forEach((v,i)=>w(v,p.concat([i])));} else if(x&&typeof x==="object"){paden.push({p,t:"obj"});Object.keys(x).forEach(k=>w(x[k],p.concat([k])));} else paden.push({p,t:typeof x===null?"null":(x===null?"null":typeof x),v:x}); })(orig,[]);
function get(o,p){return p.reduce((a,k)=>a[k],o)}
const muts=[];
function add(naam,fn,pad){muts.push({naam,fn,pad:pad.join(".")})}
paden.forEach(q=>{
  const p=q.p, last=p[p.length-1], isTodo=p.some(k=>typeof k==="string"&&k.indexOf("TODO_BART")===0);
  const par=p.slice(0,-1);
  if(q.t==="string"){
    const s=q.v;
    const set=(o,v)=>{get(o,par)[last]=v};
    if(s.length>1) add("string: laatste teken weg",o=>set(o,s.slice(0,-1)),p);
    if(s.length>1) add("string: eerste teken weg",o=>set(o,s.slice(1)),p);
    add("string: hoofdletter wisselen",o=>{const m=s.match(/[A-Za-z]/);if(!m)return false;const i=s.indexOf(m[0]);set(o,s.slice(0,i)+(m[0]===m[0].toUpperCase()?m[0].toLowerCase():m[0].toUpperCase())+s.slice(i+1))},p);
    add("string: letter midden vervangen",o=>{const i=Math.floor(s.length/2);set(o,s.slice(0,i)+(s[i]==="x"?"y":"x")+s.slice(i+1))},p);
    if(/[ïéëèóö–—≥×]/.test(s)) add("string: diakriet/streep ASCII",o=>set(o,s.replace(/ï/g,"i").replace(/é/g,"e").replace(/ë/g,"e").replace(/–/g,"-").replace(/—/g,"-").replace(/×/g,"x")),p);
    if(/[.?]$/.test(s)) add("string: eindpunt weg",o=>set(o,s.replace(/[.?]$/,"")),p);
    add("string: spatie erbij",o=>set(o,s+" "),p);
  } else if(q.t==="number"){
    const set=(o,v)=>{get(o,par)[last]=v};
    add("getal +1",o=>set(o,q.v+1),p); add("getal -1",o=>set(o,q.v-1),p);
  } else if(q.t==="boolean"){
    add("boolean flip",o=>{get(o,par)[last]=!q.v},p);
  } else if(q.t==="null"){
    add("null -> tekst",o=>{get(o,par)[last]="x"},p);
  }
  if(typeof last==="string" && q.t!=="arr"&&p.length>0 && !isTodo){ add("sleutel weg",o=>{delete get(o,par)[last]},p); }
  if(q.t==="arr" && q.n>1) { add("array: eerste twee omgewisseld",o=>{const a=get(o,p);const t=a[0];a[0]=a[1];a[1]=t},p); }
  if(q.t==="arr" && q.n>0) { add("array: laatste element weg",o=>{get(o,p).pop()},p); add("array: eerste element weg",o=>{get(o,p).shift()},p);}
  if(q.t==="obj" && typeof get(orig,p).p==="string"){
    const pn=get(orig,p).p;
    const sw={en:"of",of:"en",gespeeld:"nietGespeeld",nietGespeeld:"gespeeld",voor:"na",na:"voor"};
    if(sw[pn]) add("predicaat "+pn+"->"+sw[pn],o=>{get(o,p).p=sw[pn]},p);
    if(pn==="niet") add("niet verwijderd (arg ingepakt)",o=>{const x=get(o,p);const a=x.arg;delete x.arg;Object.assign(x,a);},p);
  }
});
// extra: operator-vervangingen
paden.forEach(q=>{ if(q.t==="string"&&["<",">","==","<=",">="].includes(q.v)&&q.p[q.p.length-1]==="op"){ const par=q.p.slice(0,-1); const alt={"<":"<=",">":">=","==":"!=","<=":"<",">=":">"}[q.v]; add("operator "+q.v+"->"+alt,o=>{get(o,par).op=alt},q.p);} });
// todoBart mutaties (E2 items)
const todoIdx=c.todoBart.map((t,i)=>/^TODO_BART-E2-/.test(t.id)?i:-1).filter(i=>i>=0);
todoIdx.forEach(i=>{ ["vraag","gekozenLezing","plek","id"].forEach(k=>{ add("todoBart["+c.todoBart[i].id+"]."+k+" gewijzigd",o=>{c.todoBart[i][k]=c.todoBart[i][k].slice(0,-1)},["todoBart",c.todoBart[i].id,k]); }); add("todoBart["+c.todoBart[i].id+"] verwijderd",o=>{c.todoBart.splice(i,1)},["todoBart",c.todoBart[i].id]); });
const N=+process.argv[3]||400;
// sample
const keuze=muts.slice();for(let i=keuze.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[keuze[i],keuze[j]]=[keuze[j],keuze[i]]}
const sel=process.argv[4]==="alle"?muts:keuze.slice(0,N);
let gedood=0,overleefd=[],ongeldig=0;
for(const m of sel){
  const kopie=kl(orig);c.episodes[idx]=kopie;c.todoBart.length=0;origTodo.forEach(t=>c.todoBart.push(kl(t)));
  let r; try{ r=m.fn(kopie); }catch(e){ r=false }
  if(r===false){ongeldig++;continue}
  let res; try{res=sb.Test.draaiAlles("data-e2")}catch(e){res=[{ok:false,fout:"crash "+e.message}]}
  const rood=res.filter(x=>!x.ok);
  if(rood.length)gedood++; else overleefd.push(m);
}
c.episodes[idx]=orig;c.todoBart.length=0;origTodo.forEach(t=>c.todoBart.push(t));
console.log("mutaties beschikbaar",muts.length,"uitgevoerd",sel.length-ongeldig,"gedood",gedood,"overleefd",overleefd.length,"ongeldig",ongeldig);
overleefd.forEach(m=>console.log("  OVERLEEFD: "+m.naam+" @ "+m.pad));

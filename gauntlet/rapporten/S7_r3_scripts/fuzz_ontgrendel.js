const {laad}=require("./laad.js");const sb=laad();const E=sb.Engine,c=sb.CASUSSEN[0];
let seed=99;const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const pick=a=>a[Math.floor(r()*a.length)];const ids=["E1","E2","E3","EX"];let mism=0,n=0;
for(let t=0;t<20000;t++){
  const k=Math.floor(r()*5),recs=[];
  for(let i=0;i<k;i++){const x={episodeId:pick(ids)};
    if(r()<0.8)x.casusId=r()<0.8?c.id:"andere";
    const v=r();
    if(v<0.3)x.geschonden=[];else if(v<0.5)x.geschonden=["I1"];else if(v<0.6)x.geschonden=undefined;
    if(r()<0.25)x.poortGehaald=r()<0.5;
    if(r()<0.2)x.uitkomst=r()<0.2?null:{poortGehaald:r()<0.5};
    recs.push(x);}
  // orakel
  const set={};recs.forEach(x=>{if(x.casusId!=null&&x.casusId!==c.id)return;
    const hasP=("poortGehaald" in x)||(x.uitkomst&&typeof x.uitkomst==="object"&&("poortGehaald" in x.uitkomst));
    const ok=x.poortGehaald===true||(x.uitkomst&&x.uitkomst.poortGehaald===true)||(!hasP&&Array.isArray(x.geschonden)&&x.geschonden.length===0);
    if(ok)set[x.episodeId]=true;});
  c.episodes.forEach((e,i)=>{const exp=i===0||!!set[c.episodes[i-1].id];n++;const got=E.ontgrendeld(c,e.id,recs);if(got!==exp){mism++;if(mism<5)console.log("MISMATCH",e.id,JSON.stringify(recs),got,exp);}});
}
console.log("ontgrendeld fuzz:",n,"vergelijkingen,",mism,"afwijkingen");

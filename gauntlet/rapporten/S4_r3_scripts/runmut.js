const M=require("./mutharness.js"),G=require("./genmut.js");
const part=+process.argv[2],parts=+process.argv[3],tf=process.argv[4]==="zonderpin"?process.cwd()+"/data-e3.zonderpin.js":null,out=process.argv[5];
const res=[];const t0=Date.now();
G.muts.forEach((m,i)=>{ if(i%parts!==part) return;
  let r; try{ r=M.run((e3,c)=>G.apply(m,e3,c),tf);}catch(e){r={fails:["LAADFOUT: "+e.message.slice(0,80)],n:0,crash:true};}
  res.push({id:m.id,killed:r.fails.length>0,nfail:r.fails.length,first:r.fails[0]||null,crash:!!r.crash});
});
require("fs").writeFileSync(out,JSON.stringify(res));
console.log("klaar",part,res.length,(Date.now()-t0)/1000+"s");

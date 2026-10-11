const {wereld}=require("./lib.js");const {judge}=require("./judge.js");
exports.maak=function(W){
  W=W||wereld();
  // zoekt dag-indelingen voor een kaartenreeks; accepteert als dataSchendingen == verwacht (array ids)
  function zoek(seq,order,verwacht,opt){
    opt=opt||{};const max=opt.max||5;const sols=[];const n=seq.length;const days=[];
    const exp=verwacht.join();
    function rec(i,dag,inDag){
      if(sols.length>=max) return;
      if(i===n){ const plan=[];for(let d=1;d<=7;d++)plan.push([]);seq.forEach((c,k)=>plan[days[k]-1].push(c));
        let trim=plan.length;while(trim>0&&plan[trim-1].length===0)trim--;
        const s=W.speel(plan.slice(0,Math.max(trim,1)),order,opt.modus||"vol",true);
        if(s._fouten.length) return;
        const a=W.dataSchendingen(s);
        if(a.join()===exp){ // tevens judge
          const j=judge(s); sols.push({plan:plan.slice(0,Math.max(trim,1)),judge:j.join(),s}); }
        return; }
      for(let d=dag;d<=7;d++){ const k=d===dag?inDag:0; if(k>=3) continue; days[i]=d; rec(i+1,d,k+1); if(sols.length>=max) return; }
    }
    rec(0,1,0);return sols;
  }
  return {zoek,W};
};

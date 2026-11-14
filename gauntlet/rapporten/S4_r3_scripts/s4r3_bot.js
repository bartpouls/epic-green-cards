// Reactieve bot: kent alle regels, niet de triggertellers n/m. Speelt per dag maximaal 3 kaarten in prioriteit; A-trio (O1,B1,V6) alleen als alle drie nog op dezelfde dag passen.
const {wereld}=require("./lib.js");const {judge}=require("./judge.js");const W=wereld();const E=W.E;
const SP="spironolacton";
function bot(order,variant){
  const s=E.nieuwSpel(W.c,"E3",{rng:order==="BA"?()=>0.999:()=>0});
  const gespeeld=(k,doel)=>s.tijdlijn.some(r=>r.kaart===k&&(doel===undefined||r.doel===doel));
  const ev=id=>s.gebeurtenissen.find(x=>x.id===id);
  function speel(k,doel,optie){ const r=E.speelKaart(s,k,{doel,optie}); return r.ok; }
  for(let dag=1;dag<=7;dag++){
    const A=ev("A"),B=ev("B");
    let queue=[];
    const aOpen=A&&!s.tijdlijn.some(r=>r.kaart==="B1"&&r.dag>=A.dag);
    if(aOpen){ if(s.actiesOver>=3) queue.push(["O1"],["B1","V8"],["V6","V8","875/125 mg 2 dd"]); }
    const bTodo=[["B3",SP],["V6","lisinopril","halveren"],["N3"],["Ev1"]].filter(c=>!s.tijdlijn.some(r=>r.kaart===c[0]&&(c[1]===undefined||r.doel===c[1])&&(!B||r.dag>=B.dag)));
    if(B) queue=queue.concat(bTodo);
    if(A&&!s.tijdlijn.some(r=>r.kaart==="Ev1"&&r.dag>=A.dag)) queue.push(["Ev1"]);
    ["G3","O1","V4","N1","O2","Ev2:"+SP].forEach(x=>{const p=x.split(":");const k=p[0],d=p[1];
      if(k==="O1"&&gespeeld("O1")) return; if(!s.tijdlijn.some(r=>r.kaart===k&&(d===undefined||r.doel===d))) queue.push([k,d]);});
    // dedupe op volgorde
    let n=0;const gedaan=new Set();
    for(const q of queue){ if(s.actiesOver<1) break; const key=q.join(); if(gedaan.has(key)) continue; if(q[0]==="O1"&&aOpen&&false) continue;
      if(speel(q[0],q[1],q[2])){gedaan.add(key);} }
    if(dag<7) E.volgendeDag(s);
  }
  return s;
}
for(const o of ["AB","BA"]){ const s=bot(o); console.log(o,"schendingen (data):",W.dataSchendingen(s).join(",")||"-","| judge:",judge(s).join(",")||"-","| kaarten",s.tijdlijn.length,"| events",s.gebeurtenissen.map(g=>g.id+"@"+g.dag).join(","));
  console.log("   ",JSON.stringify(s.tijdlijn.map(r=>r.dag+":"+r.kaart+(r.doel?"("+r.doel+")":""))).slice(0,400)); }

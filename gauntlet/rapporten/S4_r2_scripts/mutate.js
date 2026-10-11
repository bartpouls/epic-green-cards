// Mutatieset op de E3-data. Gebruik: node mutate.js gen  -> mutants.json ; node mutate.js run <deel> <aantalDelen>
const fs=require("fs"),vm=require("vm"),path=require("path"),cp=require("child_process");
const {laad,root}=require("./lad.js");
const KAARTEN=["G1","G2","G3","O1","O2","V1","V2","V3","V4","V5","V6","V7","V8","V9","V10","B1","B2","B3","B4","B5","N1","N2","N3","Ev1","Ev2","Ev3"];
const SWAP_P={gespeeld:"nietGespeeld",nietGespeeld:"gespeeld",en:"of",of:"en",voor:"na",na:"voor",gestart:"actief"};
const SWAP_OP={"<":">",">":"<","==":"!=","<=":">=",">=":"<="};
const MED=["lisinopril","spironolacton","calcium"];
function bouw(){
  const sb=laad(path.join(root,"casussen/uwi-e3.js")); const c=sb.CASUSSEN[0];
  const E=JSON.parse(JSON.stringify(c.episodes.find(x=>x.id==="E3")));
  const T=JSON.parse(JSON.stringify(c.todoBart.filter(t=>/^TODO_BART-E3-/.test(t.id))));
  return {E,T};
}
function schrijf(E,T,bestand){
  const src="if (window.CASUSSEN && window.CASUSSEN[0]) {\nwindow.CASUSSEN[0].episodes.push("+JSON.stringify(E)+");\nwindow.CASUSSEN[0].todoBart.push(...("+JSON.stringify(T)+"));\n}\n";
  fs.writeFileSync(bestand,src);
}
function gen(){
  const {E,T}=bouw(); const lijst=[];
  function pad(p){return p.map(x=>typeof x==="number"?"["+x+"]":"."+x).join("").replace(/^\./,"");}
  function walk(x,p,doel){
    if(Array.isArray(x)){
      x.forEach((v,i)=>{ lijst.push({doel,p:p.concat(i),soort:"del-element",wijz:{del:true}}); walk(v,p.concat(i),doel); });
    } else if(x&&typeof x==="object"){
      Object.keys(x).forEach(k=>{
        const v=x[k], pp=p.concat(k);
        if(typeof v==="number") lijst.push({doel,p:pp,soort:"getal+1",wijz:{set:v+1}});
        else if(typeof v==="boolean") lijst.push({doel,p:pp,soort:"bool",wijz:{set:!v}});
        else if(typeof v==="string"){
          if(k==="p"&&SWAP_P[v]) lijst.push({doel,p:pp,soort:"p-swap",wijz:{set:SWAP_P[v]}});
          else if(k==="op"&&SWAP_OP[v]) lijst.push({doel,p:pp,soort:"op-swap",wijz:{set:SWAP_OP[v]}});
          else if(["kaart","start","middel","a","b"].includes(k)&&KAARTEN.includes(v)){ const o=KAARTEN[(KAARTEN.indexOf(v)+1)%KAARTEN.length]; lijst.push({doel,p:pp,soort:"kaart-id",wijz:{set:o}}); }
          else if(k==="doel"&&MED.includes(v)) lijst.push({doel,p:pp,soort:"doel-id",wijz:{set:MED[(MED.indexOf(v)+1)%3]}});
          else if(k==="doel"&&KAARTEN.includes(v)) lijst.push({doel,p:pp,soort:"doel-id",wijz:{set:KAARTEN[(KAARTEN.indexOf(v)+1)%KAARTEN.length]}});
          else if(v.length>3) lijst.push({doel,p:pp,soort:"tekst-kort",wijz:{set:v.slice(0,-1)}});
          else if(v.length>0) lijst.push({doel,p:pp,soort:"tekst-wijzig",wijz:{set:v+"x"}});
        } else if(v===null) lijst.push({doel,p:pp,soort:"null->tekst",wijz:{set:"x"}});
        if(v&&typeof v==="object") { walk(v,pp,doel); }
        if(["trigger","score","als","dan","arg"].includes(k)||false){ /* sleutel verwijderen */ }
        lijst.push({doel,p:pp,soort:"del-sleutel",wijz:{delKey:true}});
      });
    }
  }
  walk(E,[],"E"); walk(T,[],"T");
  lijst.forEach((m,i)=>m.id=i);
  fs.writeFileSync("mutants.json",JSON.stringify(lijst.map(m=>({id:m.id,doel:m.doel,pad:pad(m.p),p:m.p,soort:m.soort,wijz:m.wijz}))));
  console.log("mutanten:",lijst.length);
  const per={}; lijst.forEach(m=>per[m.soort]=(per[m.soort]||0)+1); console.log(per);
}
function pas(E,T,m){
  const root_= m.doel==="E"?E:T; let cur=root_;
  for(let i=0;i<m.p.length-1;i++) cur=cur[m.p[i]];
  const last=m.p[m.p.length-1];
  if(m.wijz.del){ cur.splice(last,1); }
  else if(m.wijz.delKey){ delete cur[last]; }
  else cur[last]=m.wijz.set;
}
function testTests(bestand){
  const sb={console,setTimeout,clearTimeout}; sb.window=sb; sb.globalThis=sb; vm.createContext(sb);
  const bestanden=["casussen/uwi.js","casussen/uwi-e1.js","casussen/uwi-e2.js",bestand,"regels/predicaten.js","regels/evaluatie.js","engine/engine.js","engine/logging.js","tests/testlib.js","tests/data-e3.tests.js"];
  for(const f of bestanden){ const p=f.startsWith("/")?f:path.join(root,f); if(!fs.existsSync(p)) continue; try{ vm.runInContext(fs.readFileSync(p,"utf8"),sb,{filename:f}); }catch(e){ return {laadfout:e.message}; } }
  const res=sb.Test.draaiAlles("data-e3");
  return {totaal:res.length,rood:res.filter(r=>!r.ok).map(r=>r.naam)};
}
function run(deel,delen,extra){
  const lijst=JSON.parse(fs.readFileSync("mutants.json","utf8")).filter(m=>m.id%delen===deel);
  const base=JSON.parse(fs.readFileSync("base_sig.json","utf8"));
  const tmp=fs.mkdtempSync("/tmp/claude-0/mut"+deel+"-"); const uit=[];
  const {E:E0,T:T0}=bouw();
  for(const m of lijst){
    const E=JSON.parse(JSON.stringify(E0)),T=JSON.parse(JSON.stringify(T0));
    try{ pas(E,T,m); }catch(e){ continue; }
    const f=path.join(tmp,"m.js"); schrijf(E,T,f);
    const t=testTests(f);
    const geenPin=t.rood?t.rood.filter(n=>!/^E3-pin/.test(n)):null;
    // batterij
    let beh="?";
    const r=cp.spawnSync("node",["battery.js","json"],{env:Object.assign({},process.env,{MUT:f}),encoding:"utf8",maxBuffer:50e6});
    if(r.status!==0) beh="CRASH:"+(r.stderr||"").split("\n")[0].slice(0,80);
    else { const s=JSON.parse(r.stdout); const verschil=Object.keys(base).filter(k=>JSON.stringify(base[k])!==JSON.stringify(s[k])); beh=verschil.length?("VERSCHIL:"+verschil.length):"gelijk"; }
    uit.push({id:m.id,doel:m.doel,pad:m.pad,soort:m.soort,laadfout:t.laadfout||null,rood:t.rood?t.rood.length:null,roodNaamEerste:t.rood&&t.rood[0],roodZonderPin:geenPin?geenPin.length:null,beh});
  }
  fs.writeFileSync("mut_uit_"+deel+".json",JSON.stringify(uit));
  console.log("klaar deel",deel,uit.length);
}
if(process.argv[2]==="gen") gen();
else if(process.argv[2]==="run") run(parseInt(process.argv[3]),parseInt(process.argv[4]));

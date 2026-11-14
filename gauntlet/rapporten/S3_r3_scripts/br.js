const {chromium}=require("/opt/node-tools/node_modules/playwright");
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage(); const errs=[];
  p.on("pageerror",e=>errs.push(String(e))); p.on("console",m=>{ if(m.type()==="error")errs.push(m.text())});
  await p.goto("file://"+__dirname+"/snap/e2.html");
  const r=await p.evaluate(()=>Test.draaiAlles("data-e2").map(x=>({ok:x.ok,naam:x.naam,fout:x.fout})));
  console.log("browser: ",r.filter(x=>x.ok).length,"groen",r.filter(x=>!x.ok).length,"rood van",r.length, "paginafouten:",errs.length);
  r.filter(x=>!x.ok).forEach(x=>console.log(x.naam,x.fout));
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

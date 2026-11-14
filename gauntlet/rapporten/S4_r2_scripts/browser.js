const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:process.env.CHROME||undefined});
  const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('file:///home/user/epic-green-cards/tests/tests.html'); await p.waitForFunction(()=>window.TESTRESULTATEN,{timeout:60000});
  const r=await p.evaluate(()=>window.TESTRESULTATEN.map(x=>({g:x.groep,ok:x.ok,n:x.naam,f:x.fout})));
  const e3=r.filter(x=>x.g==='data-e3'); console.log('browser totaal',r.length,'rood',r.filter(x=>!x.ok).length,'| data-e3',e3.length,'rood',e3.filter(x=>!x.ok).length,'pageerrors',errs.length);
  r.filter(x=>!x.ok).forEach(x=>console.log('ROOD',x.g,x.n,x.f));
  await p.screenshot({path:'tests_browser.png'});
  await b.close();
})().catch(e=>{console.error('FOUT',e.message);process.exit(1)});

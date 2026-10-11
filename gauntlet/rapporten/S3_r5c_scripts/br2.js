const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage();
 await p.goto('file:///home/user/epic-green-cards/tests/tests.html'); await p.waitForTimeout(4000);
 const r=await p.evaluate(()=>{const x=window.TESTRESULTATEN||[];const e=x.filter(t=>t.groep==='data-e2');return {tot:x.length,e2:e.length,e2rood:e.filter(t=>!t.ok).length,roodGroepen:[...new Set(x.filter(t=>!t.ok).map(t=>t.groep))]};});
 console.log(JSON.stringify(r)); await b.close();})();

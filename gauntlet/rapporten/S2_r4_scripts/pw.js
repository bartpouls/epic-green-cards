const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const t0=Date.now();
await p.goto('file:///home/user/epic-green-cards/tests/tests.html');
await p.waitForFunction(()=>window.TESTRESULTATEN,null,{timeout:120000});
const r=await p.evaluate(()=>{const a=window.TESTRESULTATEN;return {n:a.length,rood:a.filter(x=>!x.ok).length,e1:a.filter(x=>x.groep==='data-e1').length,e1rood:a.filter(x=>x.groep==='data-e1'&&!x.ok).length,tekst:document.getElementById('samenvatting').textContent}});
console.log(JSON.stringify(r),(Date.now()-t0)+'ms totaal incl. laden');
// groep alleen
const t=await p.evaluate(()=>{const t0=performance.now();const r=window.Test.draaiAlles('data-e1');return [performance.now()-t0,r.length,r.filter(x=>!x.ok).length]});
console.log('groep data-e1 in browser',JSON.stringify(t));
await b.close();})();

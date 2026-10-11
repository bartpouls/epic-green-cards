const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t0=Date.now();
await p.goto('file:///home/user/epic-green-cards/tests/tests.html',{waitUntil:'load',timeout:600000});
await p.waitForFunction(()=>/totaal/.test(document.body.innerText),null,{timeout:600000});
console.log("tests.html volledig klaar na",((Date.now()-t0)/1000).toFixed(1),"s");
console.log(await p.evaluate(()=>document.body.innerText.slice(0,200)),errs);
// per groep timing in de browser
const r=await p.evaluate(()=>{const o={};['predicaten','data-e1','data-e2','data-e3','data-kaarten'].forEach(g=>{const t=performance.now();const x=window.Test.draaiAlles(g);o[g]=[x.length,x.filter(y=>!y.ok).length,Math.round(performance.now()-t)];});return o;});
console.log(JSON.stringify(r));
await b.close();})();

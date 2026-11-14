const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const t=Date.now();await p.goto('file:///home/user/epic-green-cards/tests/tests.html');
await p.waitForFunction(()=>/groen|rood/i.test(document.body.innerText),{timeout:120000}).catch(()=>{});
const txt=await p.evaluate(()=>document.body.innerText);console.log((Date.now()-t)+" ms");console.log(txt.split("\n").filter(l=>/groen|rood|totaal/i.test(l)).slice(0,5).join("\n"));
const rood=await p.evaluate(()=>[...document.querySelectorAll('.rood,.fail,.FAIL,[class*=rood]')].length);console.log("rood-elementen",rood,"fouten",errs.slice(0,3));await b.close();})();

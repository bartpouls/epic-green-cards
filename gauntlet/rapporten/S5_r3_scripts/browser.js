const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file:///home/user/epic-green-cards/tests/tests.html');await p.waitForTimeout(3000);
const t=await p.evaluate(()=>({txt:document.body.innerText.slice(0,300),rood:document.querySelectorAll('.rood,.fail,[data-ok="false"]').length}));
console.log(JSON.stringify(t),errs);
const r=await p.evaluate(()=>window.Test&&window.Test.draaiAlles?window.Test.draaiAlles('predicaten').map(x=>x.ok):null);
console.log('predicaten in browser:',r&&r.length,'rood:',r&&r.filter(x=>!x).length);
await b.close();})();

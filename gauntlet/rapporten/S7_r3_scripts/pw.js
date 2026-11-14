const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({headless:true});
  const p=await b.newPage({viewport:{width:1100,height:900}});
  const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('file:///home/user/epic-green-cards/tests/tests.html');
  await p.waitForTimeout(4000);
  console.log(await p.locator('#samenvatting').innerText());
  const rood=await p.locator('li.fout').allInnerTexts();console.log('rood in browser:',rood.length, rood.slice(0,5));
  const eng=await p.locator('li').filter({hasText:'engine'}).count();
  const alleLi=await p.locator('li').allInnerTexts();
  console.log('li totaal',alleLi.length,'; met "echt:"',alleLi.filter(t=>t.includes('echt:')).length);
  console.log('page errors:',errs);
  await p.screenshot({path:'/tmp/claude-0/-home-user-epic-green-cards/b9f5dc07-fd1d-5bf9-b208-00447555559b/scratchpad/tests.png',fullPage:false});
  await b.close();
})();

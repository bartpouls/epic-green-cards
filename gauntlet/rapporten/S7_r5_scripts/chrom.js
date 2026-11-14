const {chromium}=require("/opt/node-tools/node_modules/playwright");
(async()=>{
 process.env.PLAYWRIGHT_BROWSERS_PATH="/opt/pw-browsers";
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:900}});
 const errs=[];p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error")errs.push("console: "+m.text())});
 await p.goto("file:///home/user/epic-green-cards/tests/tests.html");
 await p.waitForFunction(()=>window.TESTRESULTATEN,null,{timeout:300000});
 const r=await p.evaluate(()=>({samen:document.getElementById("samenvatting").textContent,eng:window.TESTRESULTATEN.filter(x=>x.groep==="engine").length,rood:window.TESTRESULTATEN.filter(x=>!x.ok).map(x=>x.groep+": "+x.naam+" "+x.fout),engRood:window.TESTRESULTATEN.filter(x=>x.groep==="engine"&&!x.ok).length}));
 console.log(JSON.stringify(r,null,1),errs);
 await p.screenshot({path:"tests_chromium.png"});
 await b.close();})();

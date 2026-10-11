const {chromium}=require("/opt/node-tools/node_modules/playwright");
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:900}});
 const errs=[];p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
 await p.goto("file:///home/user/epic-green-cards/tests/tests.html");await p.waitForFunction(()=>/groen|rood/i.test(document.getElementById("samenvatting").textContent)&&!/Bezig/.test(document.getElementById("samenvatting").textContent),null,{timeout:100000});
 const sam=await p.textContent("#samenvatting");console.log("samenvatting:",sam);
 const rood=await p.$$eval("li.fout",l=>l.map(x=>x.textContent.slice(0,200)));console.log("rood:",rood.length,rood.slice(0,5));
 const e3=await p.$$eval("li",l=>l.filter(x=>x.textContent.includes("E3-")||x.textContent.includes("S-LETTER")).length);console.log("E3-achtige regels:",e3);
 await p.screenshot({path:"s4r3_tests.png"});console.log("fouten in console:",errs.slice(0,3));await b.close();})();

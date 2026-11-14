const pw=require("/opt/node-tools/node_modules/playwright"); process.env.PLAYWRIGHT_BROWSERS_PATH="/opt/pw-browsers";
const L=require("./load.js"); L.laad(); const {R}=require("./routes.js");
const recs=["E1","E2"].map((e,i)=>({pseudoniem:"crit",casusId:CASUSSEN[0].id,episodeId:e,pogingnummer:1,eerstePoging:true,tijdlijn:[],onthuld:[],geschonden:[],score:null,profiel:null,tijdstempel:"2026-01-0"+(i+1)+"T10:00:00.000Z"}));
const esc=s=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"');
(async()=>{ const b=await pw.chromium.launch({headless:true}); const ctx=await b.newContext({viewport:{width:1280,height:800}});
 await ctx.addInitScript(`try{localStorage.setItem("egc.logging.v1",${JSON.stringify(JSON.stringify(recs))});}catch(e){}`); await ctx.addInitScript("Math.random=function(){return 0;};");
 const page=await ctx.newPage(); await page.goto("file://"+L.R+"index.html"); await page.fill("#pseudoniem","crit"); await page.click("#btn-start"); await page.waitForSelector("[data-start]"); await page.click('[data-start="E3"]'); await page.waitForSelector("#dagtelling");
 await page.screenshot({path:__dirname+"/s1_start.png"});
 const plan=R.filter(r=>r.id==="G-V8 direct [AB]")[0].steps.slice(0,8);
 for(const s of plan){ if(s==="|"){ await page.click("#btn-volgende-dag"); continue;} const [k,d,o]=s.split(">"); await page.click(`[data-kaart="${k}"]`); if(d){ await page.waitForSelector(".dialoog"); await page.click(`.dialoog [data-doel="${esc(d)}"]`);} if(o) await page.click(`.dialoog [data-optie="${esc(o)}"]`); if(d||o) await page.waitForSelector(".dialoog",{state:"detached"}); }
 await page.screenshot({path:__dirname+"/s2_dag3.png"});
 await page.click("#btn-afronden"); await page.click("#btn-afronden-ja"); await page.waitForSelector("#uitslag-kop"); await page.screenshot({path:__dirname+"/s3_uitslag.png",fullPage:true});
 await b.close(); })();

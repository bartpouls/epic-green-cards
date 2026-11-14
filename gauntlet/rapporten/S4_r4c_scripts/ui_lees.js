// Leest wat het echte spel (index.html via file://) laat zien voor E3: patiëntkaart, onthulling, banners, status, uitslagschermen.
const path=require("path"),fs=require("fs");
const pw=require("/opt/node-tools/node_modules/playwright"); process.env.PLAYWRIGHT_BROWSERS_PATH="/opt/pw-browsers";
const L=require("./load.js"); L.laad(); const {R}=require("./routes.js"); const {F}=require("./fout.js");
const URL="file://"+L.R+"index.html";
const recs=["E1","E2"].map((e,i)=>({pseudoniem:"crit",casusId:CASUSSEN[0].id,episodeId:e,pogingnummer:1,eerstePoging:true,tijdlijn:[],onthuld:[],geschonden:[],score:null,profiel:null,tijdstempel:"2026-01-0"+(i+1)+"T10:00:00.000Z"}));
const seed=`try{localStorage.setItem("egc.logging.v1",${JSON.stringify(JSON.stringify(recs))});}catch(e){}`;
const esc=s=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"');
const tx=e=>e.textContent.replace(/\s+/g," ").trim();
async function nieuw(browser,rng){ const ctx=await browser.newContext({viewport:{width:1280,height:800}}); await ctx.addInitScript(seed); await ctx.addInitScript(`Math.random=function(){return ${rng};};`); const page=await ctx.newPage(); page.fouten=[]; page.on("pageerror",e=>page.fouten.push(e.message)); page.on("console",m=>{if(m.type()==="error")page.fouten.push(m.text());}); await page.goto(URL); await page.fill("#pseudoniem","crit"); await page.click("#btn-start"); await page.waitForSelector("[data-start]"); await page.click('[data-start="E3"]'); await page.waitForSelector("#dagtelling"); return page; }
async function speel(page,steps){ for(const s of steps){ if(s==="|"){ await page.click("#btn-volgende-dag"); continue; } const [k,d,o]=s.split(">"); await page.click(`[data-kaart="${k}"]`); if(d){ await page.waitForSelector(".dialoog"); await page.click(`.dialoog [data-doel="${esc(d)}"]`);} if(o){ await page.click(`.dialoog [data-optie="${esc(o)}"]`);} if(d||o) await page.waitForSelector(".dialoog",{state:"detached"}); } }
async function uitslag(page){ await page.click("#btn-afronden"); await page.click("#btn-afronden-ja"); await page.waitForSelector("#uitslag-kop"); return page.evaluate(()=>{ const t=s=>Array.from(document.querySelectorAll(s)).map(e=>e.textContent.replace(/\s+/g," ").trim()); const een=s=>{const e=document.querySelector(s);return e?e.textContent.replace(/\s+/g," ").trim():null;}; return {kop:een("#uitslag-kop"),vraag:een("#socratisch"),profiel:een("#profiel"),reflectie:een("#reflectie"),extra:t("[data-extra]"),zichtbaar:t("[data-zichtbaar]"),downsides:t("[data-downside]").length}; }); }
(async()=>{
  const browser=await pw.chromium.launch({headless:true}); const uit={};
  const AB={}; for(const r of [...R,...F]) AB[r.id]=r;
  // patiëntkaart + onthulling
  let page=await nieuw(browser,0);
  uit.patient=await page.evaluate(()=>Array.from(document.querySelectorAll("[data-veld]")).map(e=>({veld:e.getAttribute("data-veld"),tekst:e.textContent.replace(/\s+/g," ").trim()})));
  uit.patientHtmlTekst=await page.evaluate(()=>{const e=document.querySelector("[data-veld]");const p=e.closest("section,div,aside")||document.body;return p.textContent.replace(/\s+/g," ").trim();});
  await speel(page,["G3"]); uit.onthulling=await page.evaluate(()=>Array.from(document.querySelectorAll(".onthulling")).map(e=>e.textContent.replace(/\s+/g," ").trim()));
  uit.patientNaG3=await page.evaluate(()=>Array.from(document.querySelectorAll("[data-veld]")).map(e=>({veld:e.getAttribute("data-veld"),tekst:e.textContent.replace(/\s+/g," ").trim()})));
  await page.context().close();
  // banners en status per volgorde
  for(const [o,rng] of [["AB",0],["BA",0.99]]){
    page=await nieuw(browser,rng); const plan=AB["G-V8 direct ["+o+"]"].steps; await speel(page,plan);
    uit["banners_"+o]=await page.evaluate(()=>Array.from(document.querySelectorAll(".dag")).map(d=>({dag:d.getAttribute("data-dag"),banners:Array.from(d.querySelectorAll(".banner")).map(b=>({id:b.getAttribute("data-gebeurtenis"),tekst:b.textContent.replace(/\s+/g," ").trim()})),status:Array.from(d.querySelectorAll(".klachtenstatus")).map(e=>e.textContent.replace(/\s+/g," ").trim())})));
    await page.context().close();
  }
  // uitslagen
  uit.uitslagen={};
  const kies=[...Object.keys(AB).filter(k=>/\[AB\]$/.test(k)&&(/^I(1|4|5|6|7|8|9|10|11|12|13|14|15|16) /.test(k)||/^G-/.test(k)))];
  for(const id of kies){ const r=AB[id]; page=await nieuw(browser,0); try{ await speel(page,r.steps); uit.uitslagen[id]=await uitslag(page); }catch(e){ uit.uitslagen[id]={fout:e.message}; } uit.uitslagen[id].pageerrors=page.fouten; await page.context().close(); }
  await browser.close();
  fs.writeFileSync(__dirname+"/ui_uit.json",JSON.stringify(uit,null,1)); console.log("klaar",Object.keys(uit.uitslagen).length);
})().catch(e=>{console.error(e);process.exit(1);});

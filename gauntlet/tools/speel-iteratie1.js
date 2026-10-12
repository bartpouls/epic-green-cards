// Speelt alle drie de episodes via de ECHTE interface (index.html in Chromium, alleen klikken): per episode één foutroute en één geldige route,
// daarna het leesbaar overzicht, pauzeren/hervatten (in episode 3) en de export. Gebruik: node gauntlet/tools/speel-iteratie1.js [--screenshots=<map>]
// Exitcode 1 bij een mislukte controle of een fout in de pagina.
const path = require("path"), fs = require("fs");
const root = path.resolve(__dirname, "../..");
let pw; try { pw = require("/opt/node-tools/node_modules/playwright"); } catch (e) { pw = require("playwright"); }
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
const schermArg = process.argv.find(a => a.startsWith("--screenshots"));
const SCHERMDIR = schermArg ? (schermArg.split("=")[1] || path.join(require("os").tmpdir(), "speel-iteratie1")) : null;
if (SCHERMDIR) fs.mkdirSync(SCHERMDIR, { recursive: true });
const URL = "file://" + path.join(root, "index.html");

let groen = 0, rood = 0;
function check(naam, ok, detail) { if (ok) { groen++; console.log("PASS " + naam); } else { rood++; console.log("FAIL " + naam + (detail ? "\n     " + detail : "")); } }
const norm = s => String(s == null ? "" : s).replace(/\s+/g, " ").trim();

function stap(tok) {
  if (tok === "|") return { dag: true };
  const d = tok.split(">");
  return { kaart: d[0], doel: d[1] || null, optie: d[2] || null };
}
async function foto(page, naam) { if (SCHERMDIR) await page.screenshot({ path: path.join(SCHERMDIR, naam + ".png"), fullPage: true }); }
async function dag(page) { return parseInt(await page.getAttribute("#dagtelling", "data-dag"), 10); }

// Een kaart spelen zoals een speler: klik op de kaart (lezen), klik op Speel, kies zo nodig een doel en een optie.
async function speelKaart(page, tok) {
  const s = stap(tok), voor = await page.locator("[data-gespeeld]").count();
  await page.click(`[data-kaart="${s.kaart}"]`);
  await page.waitForSelector("#btn-speel");
  await page.click("#btn-speel");
  if (s.doel && (await page.locator(".dialoog [data-doel]").count())) await page.click(`.dialoog [data-doel="${s.doel.replace(/"/g, '\\"')}"]`);
  if (s.optie) await page.click(`.dialoog [data-optie="${s.optie.replace(/"/g, '\\"')}"]`);
  await page.waitForSelector(".dialoog", { state: "detached" });
  const na = await page.locator("[data-gespeeld]").count();
  if (na !== voor + 1) throw new Error("kaart " + tok + " is niet gespeeld (dag " + (await dag(page)) + "): " + (await page.locator("#melding").allTextContents()).join(" | "));
}
async function speelPlan(page, plan, haak) {
  for (let i = 0; i < plan.length; i++) {
    if (haak) await haak(i);
    if (plan[i] === "|") await page.click("#btn-volgende-dag"); else await speelKaart(page, plan[i]);
  }
}
async function rondAf(page) {
  await page.click("#btn-afronden");
  if (await page.locator("#btn-afronden-ja").count()) await page.click("#btn-afronden-ja");
  await page.waitForSelector("#uitslag-kop");
}
async function uitslag(page) {
  const t = async s => (await page.locator(s).count()) ? norm(await page.locator(s).first().textContent()) : null;
  return { kop: await t("#uitslag-kop"), vraag: await t("#socratisch"), gevolg: await t("#gevolg"), anderen: await t("#anderen"), profiel: await t("#profiel"), lege: await t("#legedagen") };
}
async function metEpisode(page, ep) { await page.click(`[data-start="${ep}"]`); await page.waitForSelector("#dagtelling"); }

(async () => {
  const browser = await pw.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
  await ctx.addInitScript("Math.random = function () { return 0; };");   // A en B komen in de volgorde van de data
  const page = await ctx.newPage();
  const problemen = [];
  page.on("console", m => { if (m.type() === "error") problemen.push("console: " + m.text()); });
  page.on("pageerror", e => problemen.push("pagina: " + e.message));
  const downloads = []; page.on("download", d => downloads.push(d));
  // De uitleg bij de start van een episode en de rondleiding sluiten vanzelf, zoals een speler op Begin en Overslaan klikt.
  await page.addLocatorHandler(page.locator("#btn-begin"), async () => { await page.locator("#btn-begin").click(); });
  await page.addLocatorHandler(page.locator("#btn-rondleiding-over"), async () => { await page.locator("#btn-rondleiding-over").click(); });
  try {
    await page.goto(URL);
    // 9: pseudoniem afdwingen
    await page.click("#btn-start");
    check("start: zonder pseudoniem blijft het spel op het startscherm met een melding", (await page.locator("#pseudoniem-fout").textContent()).length > 5);
    await page.fill("#pseudoniem", "playtest"); await page.click("#btn-start");
    await page.waitForSelector("[data-start]");
    check("episodes: E2 en E3 zijn vergrendeld voor de eerste poging", await page.locator('[data-start="E2"]').isDisabled() && await page.locator('[data-start="E3"]').isDisabled());

    /* ---------------- Episode 1 ---------------- */
    await metEpisode(page, "E1");
    check("E1: dagenteller 'Dag 1 van 14'", norm(await page.textContent("#dagtelling")) === "Dag 1 van 14");
    await foto(page, "e1-start");
    await speelPlan(page, ["V1", "N1"]);
    await rondAf(page);
    let u = await uitslag(page);
    check("E1 foutroute (afwachten zonder opvolgmoment): één vraag, geen profiel", /Nog niet veilig genoeg/.test(u.kop) && /Je wacht af/.test(u.vraag) && !u.profiel, JSON.stringify(u));
    check("E1 foutroute: de gespeelde kaarten staan in de lijst, ook die zonder nadeel", (await page.locator("[data-downside]").allTextContents()).some(t => /Alarmsignalen/.test(t)) && (await page.locator('[data-downside]:has-text("Afwachtend")').count()) === 1);
    check("E1 foutroute: 'Opnieuw' en 'Terug naar start' zijn er", await page.locator("#btn-opnieuw").count() === 1 && await page.locator("#btn-terug").count() === 1);
    await foto(page, "e1-fout");
    await page.click("#btn-opnieuw"); await page.waitForSelector("#dagtelling");
    check("E1 na 'Opnieuw': schoon spel", (await page.locator("[data-gespeeld]").count()) === 0 && (await dag(page)) === 1);
    await speelPlan(page, ["V1", "N1", "Ev1"]);
    await rondAf(page);
    u = await uitslag(page);
    check("E1 geldige route: poort gehaald, profiel Terughoudend", /Veiligheid gehaald/.test(u.kop) && u.profiel === "Terughoudend", JSON.stringify(u));
    check("E1 geldige route: 'Volgende episode' is er", await page.locator("#btn-volgende-episode").count() === 1);
    await foto(page, "e1-gehaald");
    await page.click("#btn-volgende-episode"); await page.waitForSelector("#dagtelling");

    /* ---------------- Episode 2 ---------------- */
    check("E2: gestart via 'Volgende episode'", /Episode 2/.test(await page.textContent(".balkinfo")));
    await speelPlan(page, ["G2", "O1", "V3", "|", "N1"]);
    check("E2: 'Uitslag verwacht op dag 4.' staat in beeld na het inzetten van de kweek", /Uitslag verwacht op dag 4/.test(await page.textContent("#verwacht")));
    await page.click("#btn-afronden"); await page.click("#btn-afronden-ja").catch(() => {});
    check("E2: afronden vóór de kweekuitslag lukt niet (melding)", await page.locator("#melding").count() === 1 && /gebeurtenissen/.test(await page.textContent("#melding")));
    await speelPlan(page, ["|", "|"]);
    check("E2: de kweekuitslag staat op dag 4", /resistent/.test(await page.textContent('.vandaag [data-gebeurtenis="C"]')) && (await dag(page)) === 4);
    await rondAf(page);
    u = await uitslag(page);
    check("E2 foutroute (nitrofurantoïne bij eGFR 29): één vraag over de nierfunctie", /Nog niet veilig genoeg/.test(u.kop) && /nitrofurantoïne/.test(u.vraag), JSON.stringify(u));
    await page.click("#btn-opnieuw"); await page.waitForSelector("#dagtelling");
    await speelPlan(page, ["G2", "O1", "V4", "|", "N1", "N2>V4", "|", "|", "|"]);
    check("E2: Gebruik en verwachting uitleggen koppelde vanzelf aan fosfomycine (geen keuzelijst)", /Gebruik en verwachting uitleggen → Fosfomycine/.test(await page.textContent(".tijdlijn")));
    await rondAf(page);
    u = await uitslag(page);
    check("E2 geldige route: poort gehaald, profiel Kweekgestuurd, smal", /Veiligheid gehaald/.test(u.kop) && /Kweekgestuurd, smal/.test(u.profiel), JSON.stringify(u));
    await foto(page, "e2-gehaald");
    await page.click("#btn-volgende-episode"); await page.waitForSelector("#dagtelling");

    /* ---------------- Episode 3 ---------------- */
    check("E3: gestart", /Episode 3/.test(await page.textContent(".balkinfo")));
    await speelPlan(page, ["G3", "O1", "V9", "|", "N1", "O2", "Ev2>spironolacton", "|", "Ev1", "|", "|"]);
    check("E3: weefselinvasie (A) en uitdroging (B) kwamen, de uitslag op dag 4", (await dag(page)) === 5);
    await rondAf(page);
    u = await uitslag(page);
    check("E3 foutroute (cotrimoxazol): één vraag (ernstigste) en 'Nog 1 andere veiligheidsregel niet gehaald.'", /Nog niet veilig genoeg/.test(u.kop) && /Cotrimoxazol/.test(u.vraag) && /^Nog \d+ andere veiligheidsregel/.test(u.anderen || ""), JSON.stringify(u));
    await foto(page, "e3-fout");
    await page.click("#btn-opnieuw"); await page.waitForSelector("#dagtelling");
    // pauzeren en hervatten: dag 1 spelen, opslaan, terug op dezelfde dag
    await speelPlan(page, ["G3", "O1", "V4"]);
    await page.click("#btn-pauzeer");
    check("E3: pauzeren meldt 'Opgeslagen op deze computer, in deze browser.'", /Opgeslagen op deze computer, in deze browser\./.test(await page.textContent("#melding")));
    await page.click("#btn-hervat"); await page.waitForSelector("#dagtelling");
    check("E3: hervatten brengt je terug op dezelfde dag met dezelfde kaarten", (await dag(page)) === 1 && (await page.locator("[data-gespeeld]").count()) === 3);
    await speelPlan(page, ["|", "N1", "O2", "Ev2>spironolacton", "|"]);
    check("E3: weefselinvasie als banner met de casustekst", /Weefselinvasie/.test(await page.textContent('.vandaag [data-gebeurtenis="A"]')));
    await speelPlan(page, ["O1", "B1>V8", "V6>V8>875/125 mg 2 dd", "|", "Ev1", "B3>spironolacton", "V6>lisinopril>halveren", "|", "N3", "|", "|"]);
    check("E3: tweede uitslag (nieuwe kweek) 3 dagen later", (await dag(page)) === 7 && /resistent/.test(await page.textContent('.tijdlijn [data-gebeurtenis="C2"]')));
    await rondAf(page);
    u = await uitslag(page);
    check("E3 geldige route: poort gehaald, profiel Kweekgestuurd", /Veiligheid gehaald/.test(u.kop) && u.profiel === "Kweekgestuurd", JSON.stringify(u));
    check("E3 geldige route: dagen zonder actie zijn zichtbaar", /Dagen zonder actie: \d+ van \d+/.test(u.lege || ""));
    check("E3 geldige route: geen 'Volgende episode' na de laatste episode", await page.locator("#btn-volgende-episode").count() === 0 && await page.locator("#btn-terug").count() === 1);
    await foto(page, "e3-gehaald");

    /* ---------------- overzicht en export ---------------- */
    await page.click("#btn-overzicht"); await page.waitForSelector(".overzicht");
    check("leesbaar overzicht: per poging een tabel per dag in woorden", (await page.locator("[data-poging]").count()) === 6 && /Dosis aanpassen → Amoxicilline\/clavulaanzuur \(875\/125 mg 2 dd\)/.test(await page.textContent(".overzicht")));
    await foto(page, "overzicht");
    await page.click("#btn-overzicht-terug");
    await page.click("#btn-export");
    await page.waitForTimeout(500);
    const csvDl = downloads.find(d => d.suggestedFilename().endsWith(".csv")), jsonDl = downloads.find(d => d.suggestedFilename().endsWith(".json"));
    check("export: twee bestanden (CSV en JSON)", !!csvDl && !!jsonDl);
    if (csvDl && jsonDl) {
      const csv = fs.readFileSync(await csvDl.path(), "utf8"), js = JSON.parse(fs.readFileSync(await jsonDl.path(), "utf8"));
      const regels = csv.replace(/^﻿/, "").split("\r\n").filter(Boolean);
      check("export CSV: BOM, puntkomma, kopregel en één regel per poging", csv.charCodeAt(0) === 0xFEFF && regels[0].startsWith("pseudoniem;episode;poging;eerste poging;testmodus;casusversie;speltijdstip;tijdlijn") && js.length === 6);
      check("export JSON: eerste poging per episode, volledige tijdlijn, casusversie 1.2", js.filter(p => p.eerstePoging).length === 3 && js.every(p => p.casusVersie === "1.2" && Array.isArray(p.tijdlijn)));
      check("export CSV: tijdlijn in woorden", /Dag 1: Recente labwaarden opvragen/.test(csv) && /Dag \d+: Antibioticum wisselen → Amoxicilline\/clavulaanzuur/.test(csv));
    }
  } catch (e) {
    rood++; console.log("SCRIPTFOUT " + (e && e.message || e));
    await foto(page, "scriptfout").catch(() => {});
  }
  check("geen fouten in de console of pagina", problemen.length === 0, problemen.join(" | "));
  await browser.close();
  console.log("\n" + groen + " groen, " + rood + " rood");
  process.exit(rood ? 1 : 0);
})();

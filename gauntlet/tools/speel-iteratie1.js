// Speelt alle drie de episodes via de ECHTE interface (index.html in Chromium, alleen klikken): per episode één foutroute en één geldige route,
// daarna een door sepsis verloren episode 3, het leesbaar overzicht, pauzeren/hervatten (in episode 3) en de export. Gebruik: node gauntlet/tools/speel-iteratie1.js [--screenshots=<map>]
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
// Afronden spoelt door (casus 1.4): stopt het doorspoelen bij een gebeurtenis, dan erkent de speler die (Verder) en rondt hij opnieuw af.
async function rondAf(page) {
  for (let i = 0; i < 20; i++) {
    await page.click("#btn-afronden");   // een onderbreking op tafel wordt eerst erkend (zie de handler voor Verder)
    if (await page.locator("#btn-afronden-ja").count()) await page.click("#btn-afronden-ja");
    if (await page.locator("#uitslag-kop").count()) return;
  }
  throw new Error("afronden leidde niet tot een beoordeling");
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
  // Kaarttafel: een gebeurtenis onderbreekt de beurt en de overgang naar episode 2 en 3 heeft een tussenscherm; de speler klikt Verder.
  // Wat er te zien was wordt bewaard voor de controles hieronder.
  const erkend = [], sprongen = [];
  await page.addLocatorHandler(page.locator("#btn-gebeurtenis-verder"), async () => {
    const ids = await page.locator(".dialoog [data-erkennen]").evaluateAll(els => els.map(e => e.getAttribute("data-erkennen")));
    const dagNu = parseInt(await page.getAttribute("#dagtelling", "data-dag"), 10);
    const vrij = await page.evaluate(() => { try { document.querySelector('[data-kaart]').click(); return !!document.querySelector('#btn-speel'); } catch (e) { return true; } });
    ids.forEach(id => erkend.push({ id, dag: dagNu, vrij }));
    await page.locator("#btn-gebeurtenis-verder").click();
  });
  await page.addLocatorHandler(page.locator("#btn-tijdsprong-verder"), async () => {
    sprongen.push(norm(await page.textContent("#tijdsprong-kop")) + " | " + norm(await page.textContent("#tijdsprong")));
    await page.locator("#btn-tijdsprong-verder").click();
  });
  try {
    await page.goto(URL);
    // 9: pseudoniem afdwingen
    await page.click("#btn-start");
    check("start: zonder pseudoniem blijft het spel op het startscherm met een melding", (await page.locator("#pseudoniem-fout").textContent()).length > 5);
    await page.fill("#pseudoniem", "playtest"); await page.click("#btn-start");
    await page.waitForSelector("[data-start]");
    check("episodes: E2 en E3 zijn vergrendeld voor de eerste poging", await page.locator('[data-start="E2"]').isDisabled() && await page.locator('[data-start="E3"]').isDisabled());
    // Eindcontrole PR 1, F8: zonder ?docent in de adresregel is er geen testmodus (en geen vinkje).
    check("episodes: zonder ?docent geen vinkje 'Testmodus'", (await page.locator("#testmodus").count()) === 0 && !/Testmodus/.test(await page.textContent("main")));

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
    // Besluit 8 (14 november 2026): eerst de gevolgen bij de patiënt, daarna één hint van de opleider.
    check("E1 foutroute: onder 'Wat er met mevrouw V. gebeurde' staat de gevolgzin uit de casus", norm(await page.textContent("#gevolgen-kop")) === "Wat er met mevrouw V. gebeurde" && u.gevolg === "Er is geen moment om alsnog te starten als de klachten aanhouden." && (await page.locator("[data-gevolg]").count()) === 1, JSON.stringify(u));
    check("E1 foutroute: daarna 'Hint van je opleider' met de ongewijzigde vraag, onder de gevolgen; de oude aansporing is weg",
      norm(await page.textContent("#hint-kop")) === "Hint van je opleider" && u.vraag === "Je wacht af. Tot wanneer, en wat gebeurt er dan?" && (await page.locator("#socratisch").count()) === 1 &&
      await page.evaluate(() => !!(document.getElementById("gevolgen").compareDocumentPosition(document.getElementById("hint")) & Node.DOCUMENT_POSITION_FOLLOWING)) &&
      !/Denk hier even over na/.test(await page.textContent("main")));
    await foto(page, "e1-fout");
    await page.click("#btn-opnieuw"); await page.waitForSelector("#dagtelling");
    check("E1 na 'Opnieuw': schoon spel", (await page.locator("[data-gespeeld]").count()) === 0 && (await dag(page)) === 1);
    await speelPlan(page, ["V1", "N1", "Ev1"]);
    await rondAf(page);
    u = await uitslag(page);
    check("E1 geldige route: poort gehaald, profiel Terughoudend", /Veiligheid gehaald/.test(u.kop) && u.profiel === "Terughoudend", JSON.stringify(u));
    check("E1 geldige route: 'Volgende episode' is er", await page.locator("#btn-volgende-episode").count() === 1);
    check("E1 geldige route: de reflectievraag staat onder 'Van je opleider'; geen gevolgen en geen hint", norm(await page.textContent("#opleider-kop")) === "Van je opleider" && (await page.locator("#opleider #reflectie").count()) === 1 && (await page.locator("#gevolgen").count()) === 0 && (await page.locator("#hint").count()) === 0);
    await foto(page, "e1-gehaald");
    await page.click("#btn-volgende-episode"); await page.waitForSelector("#dagtelling");

    /* ---------------- Episode 2 ---------------- */
    check("E2: gestart via 'Volgende episode'", /Episode 2/.test(await page.textContent(".balkinfo")));
    await speelPlan(page, ["G2", "O1", "V3", "|", "N1"]);
    check("E2: eerst het tussenscherm met de kopregel van de nieuwe patiëntkaart (alleen zichtbare gegevens)", sprongen.length === 1 &&
      sprongen[0].startsWith("Mevrouw V., 78 jaar (6 jaar na episode 1). |") && sprongen[0].indexOf("29") < 0 && /Mevrouw V\., 72 jaar\./.test(sprongen[0]), JSON.stringify(sprongen));
    check("E2: 'Uitslag verwacht op dag 4.' staat in beeld na het inzetten van de kweek", /Uitslag verwacht op dag 4/.test(await page.textContent("#verwacht")));
    // Besluit 2 (15 november 2026): afronden mag altijd; het spel spoelt door en stopt op de dag van de kweekuitslag.
    await page.click("#btn-afronden");
    check("E2: de bevestiging zegt wat de knop doet", norm(await page.textContent("#afronden-uitleg")) === "De dagen lopen door tot dag 14 of tot er iets gebeurt. Afronden?");
    await page.click("#btn-afronden-ja");
    check("E2: afronden vóór de kweekuitslag spoelt door en stopt op dag 4: de uitslag ligt op tafel, met de reden van de stop; nog geen beoordeling",
      (await page.locator('.dialoog [data-erkennen="C"]').count()) === 1 && /Het doorspoelen stopte op dag 4/.test(await page.textContent("#doorspoel-stop")) && (await page.locator("#uitslag-kop").count()) === 0);
    await foto(page, "e2-doorspoelstop");
    await page.hover("#dagtelling");   // een volgende handeling: de onderbreking wordt eerst erkend
    check("E2: na Verder staat de reden van de stop nog in beeld en zijn dag 3 en 4 zonder kaarten",
      /Het doorspoelen stopte op dag 4/.test(await page.textContent("#melding")) && /Doorgespoeld: geen kaarten gespeeld\./.test(await page.textContent('.tijdlijn [data-dag="3"]')) && (await page.locator('.tijdlijn [data-dag="4"] [data-gespeeld]').count()) === 0);
    check("E2: de kweekuitslag staat op dag 4", /resistent/.test(await page.textContent('.vandaag [data-gebeurtenis="C"]')) && (await dag(page)) === 4);
    await page.hover("#dagtelling");   // een volgende handeling: de onderbreking moet eerst erkend worden
    check("E2: de kweekuitslag onderbrak de beurt (kaart op tafel, eerst Verder; een kaart openen kon niet)", erkend.length === 1 && erkend[0].id === "C" && erkend[0].dag === 4 && erkend[0].vrij === false, JSON.stringify(erkend));
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
    await page.hover("#dagtelling");   // een handeling op het spelscherm: het tussenscherm moet eerst weg
    check("E3: tussenscherm met de kopregel van episode 3", sprongen.length === 2 && sprongen[1].startsWith("Mevrouw V., 79 jaar (1 jaar na episode 2). |"), JSON.stringify(sprongen));
    await speelPlan(page, ["G3", "O1", "V9", "|", "N1", "O2", "Ev2>spironolacton", "|", "Ev1", "|", "|"]);
    await page.hover("#dagtelling");   // een volgende handeling: de onderbreking van dag 5 (uitdroging) wordt eerst erkend
    check("E3: weefselinvasie (A, dag 3) en uitdroging (B, dag 5) kwamen op hun vaste dag, de uitslag op dag 4", (await dag(page)) === 5 &&
      erkend.some(x => x.id === "A" && x.dag === 3) && erkend.some(x => x.id === "B" && x.dag === 5));
    check("E3: A, B en de kweekuitslag onderbraken elk de beurt en zijn met Verder erkend", ["A", "B", "C"].every(id => erkend.some(x => x.id === id && x.vrij === false)), JSON.stringify(erkend));
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
    // Casus 1.4: de uitdroging komt op dag 5; de sick day-kaarten horen op die dag (of de dag erna).
    await speelPlan(page, ["O1", "B1>V8", "V6>V8>875/125 mg 2 dd", "|", "Ev1", "|", "B3>spironolacton", "V6>lisinopril>halveren", "N3", "|", "Ev1", "|"]);
    check("E3: tweede uitslag (nieuwe kweek) 3 dagen later", (await dag(page)) === 7 && /resistent/.test(await page.textContent('.tijdlijn [data-gebeurtenis="C2"]')));
    await rondAf(page);
    u = await uitslag(page);
    check("E3 geldige route: poort gehaald, profiel Kweekgestuurd", /Veiligheid gehaald/.test(u.kop) && u.profiel === "Kweekgestuurd", JSON.stringify(u));
    // Eindcontrole PR 1, F6: "Dagen zonder actie" staat niet meer op het beoordelingsscherm (wel in de export).
    check("E3 geldige route: geen 'Dagen zonder actie' op het beoordelingsscherm", !u.lege && !/Dagen zonder actie/.test(await page.textContent("main")));
    check("E3 geldige route: geen 'Volgende episode' na de laatste episode", await page.locator("#btn-volgende-episode").count() === 0 && await page.locator("#btn-terug").count() === 1);
    await foto(page, "e3-gehaald");

    /* ---------------- Episode 3: verloren door sepsis (besluit 5, 14 november 2026) ---------------- */
    await page.click("#btn-nogmaals"); await page.waitForSelector("#dagtelling");
    // Casus 1.4: weefselinvasie op dag 3 (vaste dag), dus sepsis na vier volle dagen aanhoudende klachten op dag 7.
    for (let i = 0; i < 5; i++) await page.click("#btn-volgende-dag");
    check("E3 zonder antibioticum: op dag 6 loopt de episode nog", (await dag(page)) === 6 && (await page.locator("#uitslag-kop").count()) === 0);
    await rondAf(page);   // afronden spoelt door naar dag 7: sepsis beëindigt de episode
    u = await uitslag(page);
    check("E3 sepsis: de episode eindigt direct en is verloren (concepttekst), met de bestaande sepsis-melding", /Episode verloren/.test(u.kop) &&
      norm(await page.textContent("#eindtekst")) === "De casus is geëscaleerd. Mevrouw V. heeft sepsis en wordt met spoed verwezen. Deze episode is verloren." &&
      norm(await page.textContent('.uitslag [data-gebeurtenis="S"]')) === "Sepsis: de patiënt is ernstig ziek.", JSON.stringify(u));
    check("E3 sepsis: geen score, geen profiel, geen 'Volgende episode'; wel 'Opnieuw'", (await page.locator("[data-score]").count()) === 0 && !u.profiel && (await page.locator("#btn-volgende-episode").count()) === 0 && (await page.locator("#btn-opnieuw").count()) === 1);
    await foto(page, "e3-sepsis");

    /* ---------------- overzicht en export ---------------- */
    await page.click("#btn-overzicht"); await page.waitForSelector(".overzicht");
    check("leesbaar overzicht: per poging een tabel per dag in woorden", (await page.locator("[data-poging]").count()) === 7 && /Uitkomst: Episode verloren\./.test(await page.textContent(".overzicht")) && /Dosis aanpassen → Amoxicilline\/clavulaanzuur \(875\/125 mg 2 dd\)/.test(await page.textContent(".overzicht")));
    await foto(page, "overzicht");
    await page.click("#btn-overzicht-terug");
    await page.click("#btn-export");
    await page.waitForTimeout(500);
    const csvDl = downloads.find(d => d.suggestedFilename().endsWith(".csv")), jsonDl = downloads.find(d => d.suggestedFilename().endsWith(".json"));
    check("export: twee bestanden (CSV en JSON)", !!csvDl && !!jsonDl);
    if (csvDl && jsonDl) {
      const csv = fs.readFileSync(await csvDl.path(), "utf8"), js = JSON.parse(fs.readFileSync(await jsonDl.path(), "utf8"));
      const regels = csv.replace(/^﻿/, "").split("\r\n").filter(Boolean);
      check("export CSV: BOM, puntkomma, kopregel en één regel per poging", csv.charCodeAt(0) === 0xFEFF && regels[0].startsWith("pseudoniem;episode;poging;eerste poging;testmodus;casusversie;speltijdstip;tijdlijn") && js.length === 7);
      check("export JSON: eerste poging per episode, volledige tijdlijn, casusversie 1.7", js.filter(p => p.eerstePoging).length === 3 && js.every(p => p.casusVersie === "1.7" && Array.isArray(p.tijdlijn)));
      check("export: de afloop staat erin (laatste kolom 'afloop'; de sepsis-poging is 'verloren')", regels[0].endsWith(";afloop") && regels[regels.length - 1].endsWith(";verloren") && js[js.length - 1].afloop === "verloren" && js.filter(p => p.afloop === "gehaald").length === 3);
      check("export CSV: tijdlijn in woorden", /Dag 1: Recente labwaarden opvragen/.test(csv) && /Dag \d+: Antibioticum wisselen → Amoxicilline\/clavulaanzuur/.test(csv));
    }
    /* ---------------- Episode 3: na Verwijzen stopt de episode (besluit Bart, 16 november 2026; casus 1.5) ---------------- */
    if (!(await page.locator('[data-start="E3"]').count())) { await page.click("#btn-terug").catch(() => {}); }
    await metEpisode(page, "E3");
    await speelPlan(page, ["G3", "O1", "V4", "|", "N1", "O2"]);   // met O2: alleen onterecht verwijzen (I19) blijft over
    await page.click('[data-kaart="Ev3"]'); await page.waitForSelector("#btn-speel"); await page.click("#btn-speel");
    await page.waitForSelector("#uitslag-kop");
    check("E3 verwijzen: de episode stopt meteen (dag 2) en de beoordeling zegt dat verwijzen nog niet nodig was",
      norm(await page.textContent("#einde-na-kaart")) === "Verwijzen was hier nog niet nodig: mevrouw was nog niet 48 uur zonder verbetering." &&
      (await page.locator("#dagtelling").count()) === 0, norm(await page.textContent("main")).slice(0, 300));
    const sok = (await page.locator("#socratisch").count()) ? norm(await page.textContent("#socratisch")) : "(geen hint)";
    check("E3 verwijzen te vroeg: de poort is niet gehaald en de hint gaat over onterecht verwijzen (I19, casus 1.6)",
      sok === "Je verwijst haar naar de tweede lijn. Wat moet er eerst blijken voordat de eerste lijn haar uit handen geeft?", sok);
    await foto(page, "e3-verwezen");
    /* ---------------- testmodus alleen met ?docent (eindcontrole PR 1, F8) ---------------- */
    const docent = await ctx.newPage();
    docent.on("console", m => { if (m.type() === "error") problemen.push("console (docent): " + m.text()); });
    docent.on("pageerror", e => problemen.push("pagina (docent): " + e.message));
    await docent.goto(URL + "?docent");
    await docent.fill("#pseudoniem", "docenttest"); await docent.click("#btn-start");
    await docent.waitForSelector("[data-start]");
    check("episodes: met ?docent staat het vinkje 'Testmodus' er wel", (await docent.locator("#testmodus").count()) === 1);
    await docent.close();
  } catch (e) {
    rood++; console.log("SCRIPTFOUT " + (e && e.message || e));
    await foto(page, "scriptfout").catch(() => {});
  }
  check("geen fouten in de console of pagina", problemen.length === 0, problemen.join(" | "));
  await browser.close();
  console.log("\n" + groen + " groen, " + rood + " rood");
  process.exit(rood ? 1 : 0);
})();

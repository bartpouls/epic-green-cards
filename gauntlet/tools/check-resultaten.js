// Werkpakket G: controle van tools/resultaten.html (file://, of EGC_BASIS voor een webserver).
// Gebruik: node gauntlet/tools/check-resultaten.js [--browser=firefox|webkit]   Exitcode 1 bij een rode controle.
// De testexports worden gebouwd met de echte engine/logging.js (zoals het spel ze exporteert), per "apparaat" een eigen opslag.
// Gecontroleerd: tellingen per episode, testmodus en herkansingen genegeerd, dubbele bestanden één keer, kapotte bestanden een melding.
const path = require("path"), fs = require("fs"), os = require("os"), vm = require("vm");
let pw; try { pw = require("/opt/node-tools/node_modules/playwright"); } catch (e) { pw = require("playwright"); }
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
const BROWSER = ((process.argv.find(a => a.startsWith("--browser=")) || "").split("=")[1] || "chromium").toLowerCase();
const root = path.resolve(__dirname, "../..");
const URL = process.env.EGC_BASIS ? process.env.EGC_BASIS + "tools/resultaten.html" : "file://" + path.join(root, "tools/resultaten.html");

let groen = 0, rood = 0;
function check(naam, ok, detail) { if (ok) { groen++; console.log("PASS " + naam); } else { rood++; console.log("FAIL " + naam + (detail ? "\n     " + detail : "")); } }

/* ---------- testexports met de echte Logging ---------- */
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "engine/logging.js"), "utf8"), ctx);
const L = ctx.Logging;
function nepOpslag() { const d = {}; return { getItem: k => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: k => { delete d[k]; } }; }
let klok = Date.parse("2026-11-24T09:00:00Z");
function poging(pseudoniem, ep, o) {
  klok += 60000;
  return Object.assign({ pseudoniem, casusId: "uwi-eerstelijn", episodeId: ep, casusVersie: "1.9", tijdstempel: new Date(klok).toISOString(),
    tijdlijn: [], onthuld: [], geschonden: [], score: null, profiel: null, aftrek: [] }, o);
}
const gehaald = (profiel, aftrek, rest) => ({ afloop: "gehaald", poortGehaald: true, score: { duurzaamheid: 2, doelmatigheid: 2 }, profiel: Object.assign({ naam: profiel, reflectievraag: "?" }, rest ? { rest: true } : {}), aftrek: aftrek || [] });
const nietGehaald = ids => ({ afloop: "nietGehaald", poortGehaald: false, geschonden: ids, geschondenDetail: ids.map(id => ({ id, naam: "naam uit export " + id, onderdelen: [] })) });
const LAB = { as: "doelmatigheid", naam: "Labwaarden opvragen terwijl het lab recent is", delta: -1, kaart: "G2", doel: null, tekst: null };
const AL = { as: "doelmatigheid", naam: "Antibioticum starten dat al loopt", delta: -1, kaart: "V3", doel: null, tekst: null };
function apparaat(pogingen) { L._zetOpslag(nepOpslag()); pogingen.forEach(p => L.bewaar(p)); return L.exportJSON(); }

const bestandA = apparaat([
  poging("Sanne", "E1", gehaald("Terughoudend", [LAB])),
  poging("sanne ", "E1", nietGehaald(["I1"])),                      // herkansing (zelfde student, andere schrijfwijze)
  poging("Ali", "E1", nietGehaald(["I1", "I4"])),
  poging("Docent", "E1", Object.assign({ testmodus: true }, nietGehaald(["I4"]))),   // testmodus: telt niet
  poging("Sanne", "E3", { afloop: "verloren", poortGehaald: false, eindTekst: "Sepsis." }),
  poging("Ali", "E3", gehaald("Eigen route", [], true))
]);
const bestandB = apparaat([
  poging("Bo", "E1", gehaald("Gedeelde regie", [LAB, AL, LAB])),       // LAB twee keer in één poging telt één keer
  poging("Chris", "E1", nietGehaald(["I1"])),
  poging("ALI", "E1", gehaald("Direct behandelen"))                   // tweede 'eerste poging' op een ander apparaat: de vroegste telt
]);
const bestandD = JSON.stringify(JSON.parse(apparaat([poging("Dewi", "E1", gehaald("Terughoudend"))])).map(r => { delete r.aftrek; return r; }));
L._zetOpslag(undefined);

const map = fs.mkdtempSync(path.join(os.tmpdir(), "resultaten-"));
const pad = n => path.join(map, n);
fs.writeFileSync(pad("resultaten_A.json"), bestandA);
fs.writeFileSync(pad("resultaten_B.json"), bestandB);
fs.writeFileSync(pad("resultaten_A_kopie.json"), bestandA);
fs.writeFileSync(pad("resultaten_oud.json"), bestandD);
fs.writeFileSync(pad("kapot.json"), "{ niet af");
fs.writeFileSync(pad("geen-lijst.json"), JSON.stringify({ pseudoniem: "x" }));

(async () => {
  const browser = await pw[BROWSER].launch();
  console.log("Browser: " + BROWSER + " " + browser.version());
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const problemen = [], verzoeken = [];
  page.on("pageerror", e => problemen.push("pagina: " + e.message));
  page.on("console", m => { if (m.type() === "error") problemen.push("console: " + m.text()); });
  page.on("request", r => { if (!/^(file|data|blob):/.test(r.url()) && !(process.env.EGC_BASIS && r.url().startsWith(process.env.EGC_BASIS))) verzoeken.push(r.url()); });
  try {
    await page.goto(URL);
    await page.waitForFunction(() => window.RESULTATEN_KLAAR === true);
    check("opent zonder bestanden: alleen de keuzeknop, geen overzicht", (await page.locator("[data-episode]").count()) === 0);
    check("logo Capsule Pop in de voettekst", (await page.locator("footer svg[aria-label='Capsule Pop']").count()) === 1);

    // eerst alleen een kapot bestand: melding, geen crash
    await page.setInputFiles("#bestanden", [pad("kapot.json")]);
    await page.waitForSelector("[data-kapot]");
    check("kapot bestand: melding met de bestandsnaam, geen overzicht", /kapot\.json/.test(await page.textContent("#meldingen")) && (await page.locator("[data-episode]").count()) === 0);

    // daarna alles in één keer kiezen (de kapotte blijft ook in de lijst)
    await page.setInputFiles("#bestanden", ["resultaten_A.json", "resultaten_B.json", "resultaten_A_kopie.json", "resultaten_oud.json", "geen-lijst.json"].map(pad));
    await page.waitForFunction(() => window.__RES.laatste && window.__RES.laatste.bestanden === 4);
    const r = await page.evaluate(() => window.__RES.laatste);
    check("ingelezen: 4 bestanden, 2 kapot gemeld", r.bestanden === 4 && r.kapot.length === 2 && (await page.locator("[data-kapot]").count()) === 2, JSON.stringify(r.kapot));
    check("ingelezen: 10 pogingen, 6 studenten", r.pogingen === 10 && r.studenten === 6, r.pogingen + " / " + r.studenten);
    check("dubbel bestand: 6 pogingen één keer geteld", r.dubbel === 6, String(r.dubbel));
    check("overgeslagen: 1 testmodus, 2 herkansingen (waarvan 1 tweede eerste poging)", r.testmodus === 1 && r.herkansing === 2 && r.dubbeleEerste === 1, JSON.stringify([r.testmodus, r.herkansing, r.dubbeleEerste]));
    check("1 bestand zonder gegevens over overbodige kaarten", r.zonderAftrek === 1, String(r.zonderAftrek));
    const e = id => r.episodes.find(x => x.id === id);
    const E1 = e("E1"), E2 = e("E2"), E3 = e("E3");
    check("episodes in de volgorde van de casus", r.episodes.map(x => x.id).join() === "E1,E2,E3");
    check("E1: 5 studenten; 3 gehaald, 2 niet gehaald, 0 verloren", E1.studenten === 5 && E1.afloop.gehaald === 3 && E1.afloop.nietGehaald === 2 && E1.afloop.verloren === 0, JSON.stringify(E1.afloop));
    check("E1: geschonden I1 2×, I4 1× (testmodus en herkansing niet), op volgorde", JSON.stringify(E1.geschonden.map(x => [x.id, x.n])) === '[["I1",2],["I4",1]]', JSON.stringify(E1.geschonden));
    check("E1: regelnaam uit casussen/uwi.js (niet uit de export)", E1.geschonden[0].naam === "Alarmsignalen ontbreken" && E1.geschonden[1].naam === "Twee antibiotica tegelijk");
    const prof = Object.fromEntries(E1.profielen.map(x => [x.naam, x.n]));
    check("E1: profielen Terughoudend 2, Gedeelde regie 1, Direct behandelen 0 (de latere 'eerste poging' van Ali telt niet)", prof["Terughoudend"] === 2 && prof["Gedeelde regie"] === 1 && prof["Direct behandelen"] === 0, JSON.stringify(prof));
    check("E1: restprofiel staat in de lijst (0)", prof["Eigen route"] === 0);
    check("E1: overbodig uit 4 pogingen; Labwaarden 2×, Antibioticum dat al loopt 1×", E1.metAftrek === 4 && JSON.stringify(E1.overbodig.map(x => [x.naam, x.n])) === '[["Labwaarden opvragen terwijl het lab recent is",2],["Antibioticum starten dat al loopt",1]]', JSON.stringify(E1.overbodig));
    check("E2: geen studenten", E2.studenten === 0);
    check("E3: 2 studenten; 1 gehaald, 1 verloren; restprofiel 1", E3.studenten === 2 && E3.afloop.gehaald === 1 && E3.afloop.verloren === 1 && E3.profielen.find(x => x.naam === "Eigen route").n === 1);

    // wat op het scherm staat
    const tekst = sel => page.textContent(sel).then(t => t.replace(/\s+/g, " "));
    const s1 = await tekst('[data-episode="E1"]');
    check("scherm E1: afloop met percentages", /Poort gehaald\s*3\s*60%/.test(s1) && /Poort niet gehaald\s*2\s*40%/.test(s1), s1.slice(0, 300));
    check("scherm E1: I1 met naam en 40%", /I1 Alarmsignalen ontbreken\s*2\s*40%/.test(s1));
    check("scherm E1: overbodige kaart met kaartnaam", /Labwaarden opvragen terwijl het lab recent is — [^0-9]+2\s*50%/.test(s1), s1);
    check("scherm E3: restprofiel gemarkeerd", /Eigen route \(restprofiel\)\s*1\s*100%/.test(await tekst('[data-episode="E3"]')));
    const sam = await tekst("#samenvatting");
    check("scherm: samenvatting met bestanden, pogingen, studenten, overgeslagen, dubbel en zonder aftrek",
      /4 bestanden, 10 pogingen, 6 studenten/.test(sam) && /2 herkansingen, 1 in testmodus/.test(sam) && /6 pogingen stonden in meer dan één bestand/.test(sam) && /1 bestand bevat pogingen zonder gegevens over overbodige kaarten/.test(sam), sam);
    check("scherm: geen pseudoniemen in beeld", !/Sanne|Ali|Bo |Chris|Dewi|Docent/.test(await tekst("main")));

    // opnieuw beginnen en hetzelfde bestand twee keer achter elkaar kiezen
    await page.click("#bOpnieuw");
    check("opnieuw beginnen: overzicht leeg", (await page.locator("[data-episode]").count()) === 0);
    await page.setInputFiles("#bestanden", [pad("resultaten_B.json")]);
    await page.waitForFunction(() => window.__RES.laatste && window.__RES.laatste.bestanden === 1);
    await page.setInputFiles("#bestanden", [pad("resultaten_B.json")]);
    await page.waitForFunction(() => window.__RES.laatste && window.__RES.laatste.bestanden === 2);
    const r2 = await page.evaluate(() => window.__RES.laatste);
    check("zelfde bestand twee keer gekozen: 3 pogingen, 3 dubbel", r2.pogingen === 3 && r2.dubbel === 3);

    // niets bewaard in de browser
    const opslag = await page.evaluate(() => { try { return localStorage.length + sessionStorage.length; } catch (e) { return 0; } });
    check("niets bewaard in de browser", opslag === 0, String(opslag));
  } catch (e) { rood++; console.log("SCRIPTFOUT " + (e && e.message || e)); }
  check("geen netwerkverkeer buiten de eigen bestanden", verzoeken.length === 0, verzoeken.join(" | "));
  check("geen fouten in de console of pagina", problemen.length === 0, problemen.join(" | "));
  await browser.close();
  fs.rmSync(map, { recursive: true, force: true });
  console.log("\n" + groen + " groen, " + rood + " rood");
  process.exit(rood ? 1 : 0);
})();

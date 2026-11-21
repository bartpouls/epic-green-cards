// Werkpakket D: alle browsercontroles in Chromium (Chrome/Edge), Firefox en WebKit (de motor van Safari).
// Gebruik: node gauntlet/tools/browsers.js [chromium] [firefox] [webkit] [--pages]   (zonder namen: alle drie)
// --pages: niet via file:// maar via een lokale webserver onder /epic-green-cards/, zoals GitHub Pages de site serveert.
// Per browser: tests/tests.html, de casusbouwer (laden, voorbeeld, bewaren na herladen), het routezoekerrapport,
// daarna speel-iteratie1.js (het hele spel, met hervatten na herladen), check-overzicht.js en check-casusbouwer.js met --browser=<naam>.
// Firefox en WebKit installeren: zie "Testen" in CLAUDE.md. Exitcode 1 bij een rode controle.
const path = require("path"), { spawn } = require("child_process");
const root = path.resolve(__dirname, "../..");
let pw; try { pw = require("/opt/node-tools/node_modules/playwright"); } catch (e) { pw = require("playwright"); }
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
const gevraagd = process.argv.slice(2).filter(a => !a.startsWith("-"));
const BROWSERS = gevraagd.length ? gevraagd : ["chromium", "firefox", "webkit"];
const PAGES = process.argv.includes("--pages");
let basis = null;   // bij --pages: http://127.0.0.1:<poort>/epic-green-cards/
const url = p => basis ? basis + p : "file://" + path.join(root, p);

// Kleine statische webserver: alleen bestanden onder /epic-green-cards/, hoofdlettergevoelig, met het juiste bestandstype (zoals GitHub Pages).
function startServer() {
  const http = require("http"), fs = require("fs");
  const typen = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".md": "text/markdown; charset=utf-8" };
  const server = http.createServer((req, res) => {
    const pad = decodeURIComponent(req.url.split("?")[0]);
    if (!pad.startsWith("/epic-green-cards/")) { res.writeHead(404); return res.end("niet gevonden"); }
    let bestand = path.join(root, pad.slice("/epic-green-cards/".length) || "index.html");
    if (!bestand.startsWith(root) || bestand.includes(path.sep + ".git")) { res.writeHead(404); return res.end(); }
    fs.readFile(bestand, (err, data) => {
      if (err) { res.writeHead(404); return res.end("niet gevonden"); }
      res.writeHead(200, { "Content-Type": typen[path.extname(bestand)] || "application/octet-stream" }); res.end(data);
    });
  });
  return new Promise(r => server.listen(0, "127.0.0.1", () => r(server)));
}

async function pagina(browser, fouten) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error") fouten.push("console: " + m.text()); });
  page.on("pageerror", e => fouten.push("pagina: " + e.message));
  page.on("dialog", d => d.accept());
  page.on("response", r => { if (r.status() >= 400) fouten.push("niet gevonden (" + r.status() + "): " + r.url()); });   // de casusbouwer vraagt 'Doorgaan?' bij Voorbeeld laden
  return { ctx, page };
}

async function losseControles(naam) {
  let groen = 0, rood = 0;
  const check = (t, ok, detail) => { if (ok) groen++; else { rood++; console.log("FAIL [" + naam + "] " + t + (detail ? "\n     " + detail : "")); } };
  let browser;
  try { browser = await pw[naam].launch(); }
  catch (e) { console.log("OVERGESLAGEN [" + naam + "] niet geïnstalleerd: " + String(e.message).split("\n")[0]); return null; }
  console.log("== " + naam + " " + browser.version());
  try {
    // 1. testsuite in de browser
    let f = [], { ctx, page } = await pagina(browser, f);
    await page.goto(url("tests/tests.html"));
    await page.waitForFunction(() => !/Bezig/.test(document.getElementById("samenvatting").textContent), null, { timeout: 120000 });
    const sam = (await page.textContent("#samenvatting")).trim();
    check("tests.html: alles groen", / 0 rood/.test(sam) && !/^0 groen/.test(sam), sam);
    check("tests.html: geen fouten in de pagina", f.length === 0, f.join(" | "));
    await ctx.close();

    // 2. casusbouwer: voorbeeld laden, herladen, werk staat er nog
    f = []; ({ ctx, page } = await pagina(browser, f));
    await page.goto(url("tools/casusbouwer.html"));
    await page.click("#bVoorbeeld");
    await page.waitForTimeout(600);   // bewaren gebeurt na 300 ms
    await page.reload(); await page.waitForSelector("#paneel");
    const bewaard = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem("epicgreencards.casusbouwer.v1")).basis.titel; } catch (e) { return null; } });
    check("casusbouwer: het voorbeeld is na herladen nog bewaard", /Casus UWI/.test(bewaard || ""), String(bewaard));
    check("casusbouwer: na herladen staat het voorbeeld weer in het formulier", /UWI/.test(await page.evaluate(() => Array.from(document.querySelectorAll("#paneel input, #paneel textarea")).map(e => e.value).join(" "))));
    check("casusbouwer: geen fouten in de pagina", f.length === 0, f.join(" | "));
    await ctx.close();

    // 3. routezoekerrapport opent zonder fouten
    f = []; ({ ctx, page } = await pagina(browser, f));
    await page.goto(url("tools/routezoeker-rapport.html")); await page.waitForTimeout(500);
    check("routezoekerrapport: opent met inhoud en zonder fouten", f.length === 0 && (await page.textContent("body")).trim().length > 200, f.join(" | "));
    await ctx.close();
  } catch (e) { rood++; console.log("SCRIPTFOUT [" + naam + "] " + (e && e.message || e)); }
  await browser.close();
  console.log("   losse controles: " + groen + " groen, " + rood + " rood");
  return rood;
}

// Async (niet spawnSync): bij --pages moet de webserver in dit proces blijven antwoorden.
function script(naam, bestand) {
  return new Promise(klaar => {
    const kind = spawn(process.execPath, [path.join(__dirname, bestand), "--browser=" + naam], { cwd: root, env: Object.assign({}, process.env, basis ? { EGC_BASIS: basis } : {}) });
    let uit = "", err = "";
    kind.stdout.on("data", d => uit += d); kind.stderr.on("data", d => err += d);
    kind.on("close", status => {
      const regels = uit.split("\n");
      regels.filter(l => /^(FAIL|SCRIPTFOUT)/.test(l)).forEach(l => console.log("   " + l));
      const totaal = regels.filter(l => /groen, \d+ rood/.test(l)).pop() || "(geen uitslag) " + err.split("\n")[0];
      console.log("   " + bestand + ": " + totaal.trim());
      klaar(status === 0 ? 0 : 1);
    });
  });
}

(async () => {
  let fout = 0, server = null;
  const samen = [];
  if (PAGES) { server = await startServer(); basis = "http://127.0.0.1:" + server.address().port + "/epic-green-cards/"; console.log("Pages nabootsen via " + basis); }
  for (const naam of BROWSERS) {
    const r = await losseControles(naam);
    if (r === null) { samen.push(naam + ": niet geïnstalleerd"); continue; }
    const s = r + (await script(naam, "speel-iteratie1.js")) + (await script(naam, "check-overzicht.js")) + (await script(naam, "check-casusbouwer.js"));
    samen.push(naam + ": " + (s ? "ROOD" : "groen"));
    fout += s;
  }
  if (server) server.close();
  console.log("\n" + (PAGES ? "[via webserver] " : "") + samen.join(" · "));
  process.exit(fout ? 1 : 0);
})();

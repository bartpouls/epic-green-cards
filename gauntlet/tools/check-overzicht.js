// Controle van tools/overzicht.html in headless Chromium (file://). Gebruik: node gauntlet/tools/check-overzicht.js [--screenshots]
// (a) geen console-/pagina-fouten, (b) elke kaart, invariant en TODO_BART zichtbaar in de DOM,
// (c) steekproef van 40 tekstvelden uit de data letterlijk in de DOM (plus: alle tekstvelden).
const path = require("path"), fs = require("fs"), vm = require("vm");
const root = path.resolve(__dirname, "../..");
let pw;
try { pw = require("/opt/node-tools/node_modules/playwright"); } catch (e) { pw = require("playwright"); }
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";

// Data laden zoals in Node-tests (dezelfde bestanden).
globalThis.window = globalThis;
for (const f of ["uwi", "uwi-e1", "uwi-e2", "uwi-e3"]) {
  const p = path.join(root, "casussen", f + ".js");
  if (fs.existsSync(p)) vm.runInThisContext(fs.readFileSync(p, "utf8"), { filename: p });
}
const casus = window.CASUSSEN[0];

const norm = s => String(s).replace(/\s+/g, " ").trim();
const isTodo = k => /^TODO_BART/.test(k);

// Alle tekstvelden uit de data: strings buiten predicaten/triggers en buiten TODO_BART-sleutels.
const SLA = new Set(["predicaat", "als", "trigger", "vereist", "perKeer", "teller", "K", "a", "b", "arg", "args", "dan", "anker"]);
const SLA_SLEUTELS = new Set(["id", "kaart", "p", "op", "doel", "optie", "middel", "veld", "t", "type", "naGebeurtenis", "sleutel", "wanneer", "categorie", "geldtIn", "groep", "toestand", "startToestanden", "antibiotica", "repertoire", "rollen", "resistent", "gevoelig", "vanafEpisode", "plek"]);
const velden = [];
(function loop(o, pad, sleutel) {
  if (Array.isArray(o)) return o.forEach((x, i) => loop(x, pad + "[" + i + "]", sleutel));
  if (o && typeof o === "object") {
    for (const k of Object.keys(o)) {
      if (isTodo(k) || SLA.has(k) || k === "todoBart" || k === "doelen" && false) continue;
      loop(o[k], pad + "." + k, k);
    }
    return;
  }
  if (typeof o === "string" && !SLA_SLEUTELS.has(sleutel) && o.length >= 10 && /\s/.test(o)) velden.push({ pad, tekst: o });
})(casus, "casus", "");

// Vaste pseudo-random (herhaalbaar)
let zaad = 20261011;
const rnd = () => (zaad = (zaad * 1664525 + 1013904223) % 4294967296) / 4294967296;

(async () => {
  const fouten = [], resultaten = [];
  const ok = (naam, goed, detail) => { resultaten.push({ naam, goed, detail }); console.log((goed ? "PASS " : "FAIL ") + naam + (detail ? "  " + detail : "")); };
  const browser = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") fouten.push("console." + m.type() + ": " + m.text()); });
  page.on("pageerror", e => fouten.push("pageerror: " + e.message));
  page.on("requestfailed", r => fouten.push("requestfailed: " + r.url()));
  await page.goto("file://" + path.join(root, "tools/overzicht.html"));
  await page.waitForFunction("window.OVERZICHT_KLAAR === true || window.OVERZICHT_FOUT", null, { timeout: 15000 });
  const fout = await page.evaluate("window.OVERZICHT_FOUT || null");
  ok("(a) overzicht opgebouwd zonder interne fout", !fout, fout || "");
  ok("(a) geen console-/pagina-fouten", fouten.length === 0, fouten.join(" | "));

  // (b) kaarten
  const kaartIds = await page.$$eval("#kaarten tr[data-kaart-id]", rs => rs.map(r => r.getAttribute("data-kaart-id")));
  ok("(b) kaarten: " + casus.kaarten.length + " in de data, " + kaartIds.length + " in de DOM, zelfde ids en volgorde", casus.kaarten.length === 26 && JSON.stringify(kaartIds) === JSON.stringify(casus.kaarten.map(k => k.id)));
  const kaartTekstFout = [];
  for (const k of casus.kaarten) {
    const rij = await page.$eval("#kaarten tr[data-kaart-id='" + k.id + "']", r => r.textContent.replace(/\s+/g, " "));
    if (!rij.includes(k.label) || !rij.includes(String(k.bron))) kaartTekstFout.push(k.id);
  }
  ok("(b) elke kaartrij toont label en bron", kaartTekstFout.length === 0, kaartTekstFout.join(","));

  // invarianten
  const dataInv = []; casus.episodes.forEach(e => e.invarianten.forEach(i => dataInv.push(e.id + ":" + i.id)));
  const domInv = await page.$$eval("[data-invariant]", rs => rs.map(r => r.getAttribute("data-invariant")));
  ok("(b) invarianten: " + dataInv.length + " in de data, " + domInv.length + " in de DOM, zelfde ids en volgorde", JSON.stringify(dataInv) === JSON.stringify(domInv));
  const invFout = [];
  for (const e of casus.episodes) for (const i of e.invarianten) {
    const t = norm(await page.$eval("[data-invariant='" + e.id + ":" + i.id + "']", r => r.textContent));
    if (!t.includes(norm(i.vraag)) || !t.includes("ernst " + i.ernst)) invFout.push(e.id + ":" + i.id);
  }
  ok("(b) elke invariant toont ernst en vraag", invFout.length === 0, invFout.join(","));

  // TODO_BART: lijst + elke inline tekst
  const dataTodo = casus.todoBart.map(t => t.id);
  const domTodo = await page.$$eval("#open [data-todo-id]", rs => rs.map(r => r.getAttribute("data-todo-id")));
  ok("(b) open vragen: " + dataTodo.length + " in de data, " + domTodo.length + " in de DOM", dataTodo.length === domTodo.length && dataTodo.every(x => domTodo.includes(x)));
  const openTekst = norm(await page.$eval("#open", r => r.textContent));
  const todoFout = [];
  for (const t of casus.todoBart) for (const v of [t.id, t.vraag, t.gekozenLezing, t.plek]) if (!openTekst.includes(norm(v))) todoFout.push(t.id + ": " + v.slice(0, 40));
  ok("(b) elke open vraag toont id, vraag, gekozen lezing en plek", todoFout.length === 0, todoFout.join(" | "));
  const inline = [];
  (function loop(o, pad) {
    if (Array.isArray(o)) return o.forEach((x, i) => loop(x, pad + "[" + i + "]"));
    if (!o || typeof o !== "object") return;
    for (const k of Object.keys(o)) { if (isTodo(k) && typeof o[k] === "string") inline.push({ pad: pad + "." + k, tekst: o[k] }); else loop(o[k], pad + "." + k); }
  })(casus, "casus");
  const paginaTekst = norm(await page.evaluate("document.body.textContent"));
  const inlineFout = inline.filter(x => !x.tekst.split(" | ").every(s => paginaTekst.includes(norm(s))));
  ok("(b) alle " + inline.length + " TODO_BART-sleutels op de plek zelf staan in de pagina (open vragen)", inlineFout.length === 0, inlineFout.map(x => x.pad).join(","));
  // TODO_BART-sleutels niet als data: geen veldnaam 'TODO_BART' als dt
  const dtTodo = await page.$$eval("dt", d => d.map(x => x.textContent).filter(t => /TODO_BART/.test(t)));
  ok("(b) TODO_BART-sleutels worden niet als gegevensveld getoond", dtTodo.length === 0, dtTodo.join(","));

  // (c) steekproef van 40 + alle tekstvelden
  const steekproef = []; const pool = velden.slice();
  while (steekproef.length < 40 && pool.length) steekproef.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  const mis = steekproef.filter(v => !paginaTekst.includes(norm(v.tekst)));
  ok("(c) steekproef: " + steekproef.length + " van " + velden.length + " tekstvelden letterlijk in de DOM", steekproef.length === 40 && mis.length === 0, mis.map(m => m.pad + ": " + m.tekst.slice(0, 50)).join(" | "));
  const misAlle = velden.filter(v => !paginaTekst.includes(norm(v.tekst)));
  ok("(c+) alle " + velden.length + " tekstvelden letterlijk in de DOM", misAlle.length === 0, misAlle.slice(0, 8).map(m => m.pad + ": " + m.tekst.slice(0, 50)).join(" | "));

  // Geen ongeldige predicaten gemeld, geen onbekende predicaten
  const waarsch = await page.$$eval(".waarsch", n => n.map(x => x.textContent));
  ok("geen ongeldige of onbekende predicaten gemeld", waarsch.length === 0, waarsch.slice(0, 3).join(" | "));
  // Beide predicaatvormen -> geen JSON-lekkage in de leesbare tekst
  const lek = await page.$$eval(".pred", n => n.filter(x => /[{}]\s*"?p"?\s*:/.test(x.textContent)).length);
  ok("leesbare predicaten bevatten geen ruwe JSON", lek === 0, String(lek));
  // Horizontaal scrollen op 13-inch
  const breed = await page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth");
  ok("geen horizontale scroll op 1280 px", breed <= 0, "overschot " + breed);

  if (process.argv.includes("--screenshots")) {
    const dir = process.env.SCREENS || path.join(require("os").tmpdir(), "S8_screens"); fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, "volledig.png"), fullPage: true });
    for (const id of ["open", "kaarten", ...casus.episodes.map(e => e.id)]) {
      const h = await page.$("#" + id);
      if (h) await h.screenshot({ path: path.join(dir, id + ".png") });
    }
    console.log("screenshots in " + dir);
  }
  await browser.close();
  const rood = resultaten.filter(r => !r.goed).length;
  console.log("\n" + (resultaten.length - rood) + " groen, " + rood + " rood");
  process.exit(rood ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

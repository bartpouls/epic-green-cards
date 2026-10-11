// Controle van tools/overzicht.html in headless Chromium (file://). Gebruik: node gauntlet/tools/check-overzicht.js [--screenshots]
// (a) geen console-/pagina-fouten, (b) elke kaart, invariant en TODO_BART zichtbaar in de DOM,
// (c) steekproef van 40 tekstvelden uit de data letterlijk in de DOM (plus: alle tekstvelden).
// (d) casusreferentie (routes, altijd fout, volgorde, score, brug, bronconflict), sectievolgorde en -namen, feedbacktabel,
// (e) geen hardgecodeerde klinische tekst in overzicht.html, (f) geen jargon, (g) zoekveld en inhoudsopgave van de open vragen.
// Eigen omgeving: OVERZICHT_ROOT=<map met tools/, casussen/, regels/>.
const path = require("path"), fs = require("fs"), vm = require("vm");
const root = process.env.OVERZICHT_ROOT || path.resolve(__dirname, "../..");
let pw;
try { pw = require("/opt/node-tools/node_modules/playwright"); } catch (e) { pw = require("playwright"); }
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";

// Data laden zoals in Node-tests (dezelfde bestanden).
globalThis.window = globalThis;
for (const f of ["uwi", "uwi-e1", "uwi-e2", "uwi-e3", "uwi-referentie"]) {
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
  for (const t of casus.todoBart) { const plekLeesbaar = await page.evaluate(p => window.OVERZICHT_PLEK(p), t.plek);
  for (const v of [t.id, t.vraag, t.gekozenLezing, plekLeesbaar]) if (!openTekst.includes(norm(v))) todoFout.push(t.id + ": " + v.slice(0, 40)); }
  ok("(b) elke open vraag toont id, vraag, gekozen lezing en (leesbare) plek", todoFout.length === 0, todoFout.join(" | "));
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


  // (d) Casusreferentie
  ok("(d) casus.referentie aanwezig voor alle episodes", !!casus.referentie && casus.episodes.every(e => casus.referentie[e.id]));
  const ref = casus.referentie || {};
  for (const e of casus.episodes) {
    const r = ref[e.id]; if (!r) continue;
    const h3 = await page.$$eval("[data-episode='" + e.id + "'] > div[data-sectie] > h3", n => n.map(x => x.textContent).filter(t => !/^Aanvullend/.test(t)));
    ok("(d) " + e.id + ": sectievolgorde en -namen exact volgens volgordeVanSecties", JSON.stringify(h3) === JSON.stringify(r.volgordeVanSecties), JSON.stringify(h3));
    const koppen = await page.$$eval("[data-episode='" + e.id + "'] > h2", n => n.map(x => x.textContent));
    ok("(d) " + e.id + ": episodekop precies één keer 'Episode n — level n'", koppen.length === 1 && /^Episode \d — level \d$/.test(koppen[0]), koppen.join("|"));
    const epTekst = norm(await page.$eval("[data-episode='" + e.id + "']", n => n.textContent));
    // alle tekst van de referentie van deze episode staat in de episode
    const refStrings = [];
    (function loop(o, k) { if (Array.isArray(o)) o.forEach(x => loop(x, k)); else if (o && typeof o === "object") Object.keys(o).forEach(kk => { if (!isTodo(kk)) loop(o[kk], kk); }); else if (typeof o === "string" && k !== "volgordeVanSecties") refStrings.push(o); })(r, "");
    const refMis = refStrings.filter(x => !epTekst.includes(norm(x)));
    ok("(d) " + e.id + ": alle " + refStrings.length + " referentietekstvelden letterlijk in de episode", refMis.length === 0, refMis.slice(0, 5).join(" | "));
    // routes
    const nRoutes = await page.$$eval("[data-episode='" + e.id + "'] table[data-tabel='routes'] tbody tr", n => n.length);
    ok("(d) " + e.id + ": geldige routes: " + (r.geldigeRoutes || []).length + " rijen in de tabel", nRoutes === (r.geldigeRoutes || []).length, String(nRoutes));
    if (r.routeBijWeefselinvasie) { const n2 = await page.$$eval("[data-episode='" + e.id + "'] table[data-tabel='routeBij'] tbody tr", n => n.length); ok("(d) " + e.id + ": route bij weefselinvasie: " + r.routeBijWeefselinvasie.length + " rijen", n2 === r.routeBijWeefselinvasie.length, String(n2)); }
    // altijd fout per invariant
    const afMis = [];
    for (const i of e.invarianten) { let af = r.altijdFout && r.altijdFout[i.id]; for (const eerder of casus.episodes) { if (af || eerder.id === e.id) break; af = ref[eerder.id] && ref[eerder.id].altijdFout && ref[eerder.id].altijdFout[i.id]; } const t = norm(await page.$eval("[data-invariant='" + e.id + ":" + i.id + "']", n => n.textContent)); if (!af || !t.includes(norm(af.tekst)) || !t.includes("Altijd fout")) afMis.push(i.id); }
    ok("(d) " + e.id + ": elke invariant toont 'Altijd fout' uit de casus", afMis.length === 0, afMis.join(","));
    // feedbacktabel
    const kol = await page.$$eval("[data-episode='" + e.id + "'] table[data-tabel='feedback'] th", n => n.map(x => x.textContent));
    const rijen = await page.$$eval("[data-episode='" + e.id + "'] table[data-tabel='feedback'] tbody tr", n => n.map(x => x.children[1].textContent.replace(/\s+/g, " ").trim()));
    const verwacht = []; e.invarianten.forEach(i => { verwacht.push(i.vraag); (i.vraagVarianten || []).forEach(v => verwacht.push(v.vraag)); });
    (e.feedbackExtra || []).forEach(x => verwacht.push(x.vraag)); (e.profielen || []).forEach(p => { if (p.reflectievraag) verwacht.push(p.reflectievraag); });
    const fbMis = verwacht.filter(v => !rijen.some(x => x.includes(norm(v))));
    ok("(d) " + e.id + ": één feedbacktabel Trigger | Vraag met alle " + verwacht.length + " vragen", kol.join("|") === "Trigger|Vraag" && fbMis.length === 0, kol.join("|") + " " + fbMis.join(" | "));
  }

  // (e) Geen hardgecodeerde klinische tekst in overzicht.html
  const bron = fs.readFileSync(path.join(root, "tools/overzicht.html"), "utf8");
  // Code zonder commentaar en zonder sleutelnamen uit de data (camelCase of met cijfers, bv. routeBijWeefselinvasie, geenVerbetering48).
  const code = bron.slice(bron.indexOf("<script>")).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ").replace(/\b[A-Za-z]*[a-z][A-Z][A-Za-z0-9]*\b|\b[A-Za-z]+\d+\b/g, " ");
  const dataWoorden = new Set();
  (function loop(o, k) {
    if (Array.isArray(o)) return o.forEach(x => loop(x, k));
    if (o && typeof o === "object") return Object.keys(o).forEach(kk => { if (!isTodo(kk) && kk !== "meta" && kk !== "todoBart") loop(o[kk], kk); });
    if (typeof o === "string" && !SLA_SLEUTELS.has(k)) (o.match(/[A-Za-zÀ-ÿ]{4,}/g) || []).forEach(w => dataWoorden.add(w.toLowerCase()));
  })({ kaarten: casus.kaarten, episodes: casus.episodes, referentie: casus.referentie, raadplegen: casus.raadplegen, bronnen: casus.bronnen }, "");
  // Algemene Nederlandse woorden die in de interface mogen staan (geen klinische inhoud, drempel of middelnaam).
  const ALGEMEEN = new Set(("verwijzing geldige rest spelen brug gegeven begin bronconflict kern versie kost vóór gespeelde bepaalt start starten direct past nieuw nieuwe laat zien zodra inhoud bart gaat zegt onbekend gehaald tegelijk eerst toestanden vaste daar wissel daarna alle alleen alles anders beurt beurten bron bronnen casus dagen dag deze dezelfde doel doelen eerste eerder elke elk episode episodes geen geldig geldt gelijk gespeeld gebeurtenis gebeurtenissen gebruik grote groter hoogste jaar kaart kaarten keer klein kleiner kosten laatste later level lijst maar minstens meer niet nooit onder ooit opties optie pas punt punten regel regels route routes score staat tekst telt toestand tussen twee uitleg volgens volgorde voor waar wanneer weer welke wordt zijn zonder zelf zich worden aantal aan antwoord begint beide bij binnen dan dat de die dit door dus een eerste enkele erna geeft geval goed heeft het hier hoort kaarten klopt komt krijgt mag moet naar nadat naast niets nodig nummer ook over per plek speler spel student studenten tijdens tot uit vanaf van veld velden vraag vragen vroeg waarde waarden waarop waarvan wat wel wie wordt zoek zowel altijd antibiotica antibioticum actief gestart gestopt vervangen pauze pauzeren hervat hervatten klachten klachtenstatus medicatie patiënt patiëntkaart repertoire knoppen invariant invarianten poort schending ernst downside effect profiel profielen feedback reflectievraag verborgen onthuld onthult zichtbaar ontbreekt gegevens overzicht aanvullend werkzaam middel werkzaamheid statusteksten status tekst teksten raadplegen richtlijn acties dagen eindigt eind einde moment huidige stand episode afronden afronden herkansing opnieuw lezing gekozen open").split(" "));
  const hits = [...dataWoorden].filter(w => !ALGEMEEN.has(w) && new RegExp("(^|[^A-Za-zÀ-ÿ])" + w + "([^A-Za-zÀ-ÿ]|$)", "i").test(code));
  ok("(e) geen woorden uit de casusdata (≥4 letters, buiten algemene interfacewoorden) in de code van overzicht.html", hits.length === 0, hits.slice(0, 30).join(", "));
  const klin = ["lisinopril", "spironolacton", "nitrofurantoïne", "fosfomycine", "trimethoprim", "ciprofloxacine", "amoxicilline", "eGFR", "klachten nemen af", "klachten houden aan", "geen verbetering", "48 uur", "weefselinvasie", "kweek", "875/125"];
  const klinHits = klin.filter(w => code.toLowerCase().includes(w.toLowerCase()));
  ok("(e) geen middelnamen, drempels of statuszinnen in de code", klinHits.length === 0, klinHits.join(", "));

  // (f) Geen jargon op het scherm
  const zichtbaarTekst = await page.evaluate("document.getElementById('app').innerText");
  const zichtbaarZonderOpen = await page.evaluate("Array.prototype.filter.call(document.getElementById('app').children, n => n.id !== 'open').map(n => n.innerText).join(' ')");
  const jargon = [/feedbackExtra/, /zichtbaarAlsOntbreekt/, /\bJSON\b/i, /\bis gelijk aan true\b/, /\b(true|false)\b/, /set ‘/, /lijst ‘/, /\(sleutel\)/, /\(ids\)/, /\(gegevens\)/, /\.invarianten/, /\[\]/, /kaarten\[/, /\bE\d\.[a-z]/, /undefined|\[object/].filter(rx => rx.test(zichtbaarTekst)).concat([/\bnull\b/].filter(rx => rx.test(zichtbaarZonderOpen))).map(String);
  ok("(f) geen jargon of code-achtige tekst op het scherm", jargon.length === 0, jargon.join(" "));

  // (g) Open vragen: inhoudsopgave, markering, zoekveld
  const groepen = await page.$$eval("#open .groepnav a", n => n.map(x => x.textContent));
  const verwachtGroepen = {}; casus.todoBart.forEach(t => { const m = /^TODO_BART-(E\d+)-/.exec(t.id); const g = m ? m[1] : /^TODO_BART-R\d/.test(t.id) ? "R" : "K"; verwachtGroepen[g] = (verwachtGroepen[g] || 0) + 1; });
  ok("(g) inhoudsopgave per groep: " + groepen.join(" · "), groepen.length === Object.keys(verwachtGroepen).length && groepen.every(t => /\((\d+)\)$/.test(t)) && groepen.reduce((a, t) => a + +/\((\d+)\)$/.exec(t)[1], 0) === casus.todoBart.length);
  const indexLinks = await page.$$eval("#open li[data-index-id] a", n => n.length);
  ok("(g) inhoudsopgave heeft een regel per open vraag", indexLinks === casus.todoBart.length, String(indexLinks));
  const metPlek = await page.$$eval("#open [data-todo-id]", n => n.filter(x => x.querySelector(".plek-links")).length);
  const zonderPlek = await page.$$eval("#open [data-todo-id]", n => n.filter(x => x.querySelector(".geen-markering")).length);
  ok("(g) elke open vraag heeft een link naar de plek of de uitleg 'geen markering': " + metPlek + " + " + zonderPlek, metPlek + zonderPlek === casus.todoBart.length);
  const kapotteLinks = await page.$$eval("#open .plek-links a", n => n.filter(a => !document.getElementById(a.getAttribute("href").slice(1))).length);
  ok("(g) alle links naar de plek bestaan", kapotteLinks === 0, String(kapotteLinks));
  const teller = async () => (await page.$eval("#zoekteller", n => n.textContent));
  const zichtbaar = async () => page.$$eval("#open [data-todo-id]:not([hidden])", n => n.length);
  await page.fill("#zoek", "TODO_BART-E3-26");
  const z1 = await zichtbaar();
  await page.fill("#zoek", "xqzvbnm");
  const z2 = await zichtbaar(), leegZichtbaar = await page.$eval("#zoekleeg", n => !n.hidden);
  await page.fill("#zoek", "spironolacton");
  const z3 = await zichtbaar(), verwachtZ3 = casus.todoBart.filter(t => (t.id + " " + t.plek + " " + t.vraag + " " + t.gekozenLezing).toLowerCase().includes("spironolacton")).length;
  await page.fill("#zoek", "");
  const z4 = await zichtbaar();
  ok("(g) zoekveld: id vindt 1, onzin vindt 0 (+melding), 'spironolacton' vindt " + z3 + ", leeg toont alles (" + z4 + ")", z1 === 1 && z2 === 0 && leegZichtbaar && z3 > 0 && z3 >= verwachtZ3 && z4 === casus.todoBart.length, [z1, z2, leegZichtbaar, z3, verwachtZ3, z4, await teller()].join(","));

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
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.screenshot({ path: path.join(dir, "volledig-1024.png"), fullPage: true });
    for (const id of ["open", ...casus.episodes.map(e => e.id)]) { const h = await page.$("#" + id); if (h) await h.screenshot({ path: path.join(dir, id + "-1024.png") }); }
    const b1024 = await page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth");
    ok("geen horizontale scroll op 1024 px", b1024 <= 0, "overschot " + b1024);
    console.log("screenshots in " + dir);
  }
  await browser.close();
  const rood = resultaten.filter(r => !r.goed).length;
  console.log("\n" + (resultaten.length - rood) + " groen, " + rood + " rood");
  process.exit(rood ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

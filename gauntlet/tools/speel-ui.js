// Speelt het echte spel (index.html via file://) in headless Chromium, alleen met klikken en toetsen.
// Gebruik: node gauntlet/tools/speel-ui.js [--alle] [--screenshots=<map>]
//   standaard: de kernscenario's (alle drie episodes, foutroutes, herkansing, verborgen gegevens, A/B-volgorde,
//   optievolgorde, export, opslag mislukt, toetsenbord, viewports 1280x800 en 1024x700);
//   --alle: speelt daarbovenop ELKE route uit tests/routes.js (beide A/B-volgordes) via de UI en vergelijkt de uitslag.
// Exitcode 1 bij een mislukte controle of een console-/paginafout.
const path = require("path"), fs = require("fs"), vm = require("vm");
const root = path.resolve(__dirname, "../..");
let pw;
try { pw = require("/opt/node-tools/node_modules/playwright"); } catch (e) { pw = require("playwright"); }
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";

const args = process.argv.slice(2);
const ALLE = args.includes("--alle");
const schermArg = args.find(a => a.startsWith("--screenshots"));
const SCHERMDIR = schermArg ? (schermArg.split("=")[1] || path.join(require("os").tmpdir(), "speel-ui-schermen")) : null;
if (SCHERMDIR) fs.mkdirSync(SCHERMDIR, { recursive: true });

// Data en routes laden (alleen om te weten wat er verwacht wordt en welke teksten NIET zichtbaar mogen zijn).
globalThis.window = globalThis;
for (const f of ["casussen/uwi.js", "casussen/uwi-e1.js", "casussen/uwi-e2.js", "casussen/uwi-e3.js", "tests/routes.js"]) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) vm.runInThisContext(fs.readFileSync(p, "utf8"), { filename: f });
}
const casus = window.CASUSSEN[0], Routes = window.Routes;
const URL = "file://" + path.join(root, "index.html");

let groen = 0, rood = 0;
const fouten = [];
function check(naam, ok, detail) {
  if (ok) { groen++; console.log("PASS " + naam); }
  else { rood++; fouten.push(naam); console.log("FAIL " + naam + (detail ? "\n     " + detail : "")); }
}
const norm = s => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
const sluisEnkel = s => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// Seed: pogingen voor E1 en E2 gehaald, zodat E3 openstaat zonder eerst alles te spelen.
const SEED_PSEUDONIEM = "seed-speler";
function seedScript(pseudo) {
  const recs = ["E1", "E2"].map((e, i) => ({
    pseudoniem: pseudo, casusId: casus.id, episodeId: e, pogingnummer: 1, eerstePoging: true, tijdlijn: [], onthuld: [],
    geschonden: [], score: null, profiel: null, tijdstempel: "2026-01-0" + (i + 1) + "T10:00:00.000Z"
  }));
  return `try { if (!localStorage.getItem("egc.logging.v1")) localStorage.setItem("egc.logging.v1", ${JSON.stringify(JSON.stringify(recs))}); } catch (e) {}`;
}
function rngScript(waarde) { return `Math.random = function () { return ${waarde}; };`; }

async function nieuwePagina(browser, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, acceptDownloads: true });
  if (opts.init) for (const s of opts.init) await ctx.addInitScript(s);
  const page = await ctx.newPage();
  page.problemen = [];
  page.on("console", m => { if (m.type() === "error") page.problemen.push("console: " + m.text()); });
  page.on("pageerror", e => page.problemen.push("pagina: " + e.message));
  page.downloads = [];
  page.on("download", d => page.downloads.push(d));
  // De uitleg bij de start van een episode (dialoog met "Begin") sluit vanzelf, ook bij herkansingen.
  if (typeof page.addLocatorHandler === "function") await page.addLocatorHandler(page.locator("#btn-begin"), async () => { await page.locator("#btn-begin").click(); });
  await page.goto(URL);
  return page;
}

async function start(page, pseudo) {
  await page.fill("#pseudoniem", pseudo);
  await page.click("#btn-start");
  await page.waitForSelector("[data-start]");
}
async function kies(page, ep) {
  await page.click(`[data-start="${ep}"]`);
  await page.waitForSelector("#dagtelling");
  // Uitleg bij de start van de episode (dialoog): sluiten met "Begin".
  if ((await page.locator("#btn-begin").count()) > 0) { await page.click("#btn-begin"); await page.waitForSelector(".dialoog", { state: "detached" }); }
}
async function dag(page) { return parseInt(await page.getAttribute("#dagtelling", "data-dag"), 10); }
async function acties(page) { return parseInt(await page.getAttribute("#acties", "data-over"), 10); }

async function klikKaart(page, tok) {
  const d = Routes.stap(tok);
  await page.click(`[data-kaart="${d.kaart}"]`);
  if (d.doel) {
    await page.waitForSelector(".dialoog");
    await page.click(`.dialoog [data-doel="${sluisEnkel(d.doel)}"]`);
  }
  if (d.optie) {
    await page.click(`.dialoog [data-optie="${sluisEnkel(d.optie)}"]`);
  }
  if (d.doel || d.optie) await page.waitForSelector(".dialoog", { state: "detached" });
}
async function speelPlan(page, plan, naam) {
  for (let i = 0; i < plan.length; i++) {
    const s = Routes.stap(plan[i]);
    if (s.dag) {
      if ((await page.locator("#btn-volgende-dag").count()) === 0) throw new Error(naam + ": stap " + (i + 1) + " '|' maar er is geen volgende dag");
      await page.click("#btn-volgende-dag");
    } else if (s.tot) {
      while ((await dag(page)) < s.tot) await page.click("#btn-volgende-dag");
    } else {
      const voor = await page.locator("[data-gespeeld]").count();
      await klikKaart(page, plan[i]);
      const na = await page.locator("[data-gespeeld]").count();
      if (na !== voor + 1) {
        const melding = await page.locator("#melding").allTextContents();
        throw new Error(naam + ": kaart '" + plan[i] + "' (stap " + (i + 1) + ", dag " + (await dag(page)) + ") is niet gespeeld. Melding: " + melding.join(" | "));
      }
    }
  }
}
async function rondAf(page) {
  await page.click("#btn-afronden");
  await page.click("#btn-afronden-ja");
  await page.waitForSelector("#uitslag-kop");
}
async function leesUitslag(page) {
  return page.evaluate(() => {
    const t = s => Array.from(document.querySelectorAll(s)).map(e => e.textContent.replace(/\s+/g, " ").trim());
    const een = s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null; };
    const scores = {};
    document.querySelectorAll("[data-score]").forEach(e => { scores[e.getAttribute("data-score")] = e.querySelector("strong").textContent.trim(); });
    return {
      koptekst: een("#uitslag-kop"), vraag: een("#socratisch"), profiel: een("#profiel"), reflectie: een("#reflectie"), scores,
      extra: t("[data-extra]"), zichtbaar: t("[data-zichtbaar]"),
      downsides: Array.from(document.querySelectorAll("[data-downside]")).map(li => li.querySelectorAll("span")[0]).filter(Boolean).map(sp => sp.textContent.trim()),
      aantalVragen: document.querySelectorAll(".vraag").length
    };
  });
}

function verwachtScore(v, as) { return v && v.score && v.score[as] != null ? v.score[as] + " van 3" : null; }

// Vergelijkt de uitslag op het scherm met de verwachting uit tests/routes.js (hand uit de casus geschreven).
function vergelijk(route, volgorde, u) {
  const v = Routes.verwachtVoor(route, volgorde), p = [];
  const fout = route.soort === "fout";
  if (fout) {
    if (u.vraag !== v.vraag) p.push("vraag: verwacht " + JSON.stringify(v.vraag) + ", kreeg " + JSON.stringify(u.vraag));
    if (u.aantalVragen !== 1) p.push("aantal vragen op scherm: " + u.aantalVragen);
    if (Object.keys(u.scores).length || u.profiel) p.push("score/profiel zichtbaar bij schending");
  } else {
    if (u.vraag) p.push("onverwachte vraag: " + u.vraag);
    if (v.profiel !== undefined && (u.profiel || null) !== (v.profiel || null)) p.push("profiel: verwacht " + v.profiel + ", kreeg " + u.profiel);
    if (v.reflectievraag !== undefined && v.profiel && (u.reflectie || null) !== (v.reflectievraag || null)) p.push("reflectievraag: verwacht " + v.reflectievraag + ", kreeg " + u.reflectie);
    for (const as of ["duurzaamheid", "doelmatigheid"]) {
      if (v.score && as in v.score && (u.scores[as] || null) !== verwachtScore(v, as)) p.push("score " + as + ": verwacht " + verwachtScore(v, as) + ", kreeg " + u.scores[as]);
    }
    const ex = (v.extraVragen || []).slice().sort(), ux = u.extra.slice().sort();
    if (JSON.stringify(ex) !== JSON.stringify(ux)) p.push("extra vragen: verwacht " + JSON.stringify(ex) + ", kreeg " + JSON.stringify(ux));
    const zi = (v.zichtbaar || []).slice().sort(), uz = u.zichtbaar.slice().sort();
    if (JSON.stringify(zi) !== JSON.stringify(uz)) p.push("zichtbaar: verwacht " + JSON.stringify(zi) + ", kreeg " + JSON.stringify(uz));
  }
  const dsVerwacht = Routes.verwachteDownsides(route, volgorde).map(d => d.tekst);
  for (const t of dsVerwacht) if (!u.downsides.includes(t)) p.push("downside ontbreekt: " + t);
  return p;
}

async function speelRoute(page, route, volgorde, alIngestart) {
  if (!alIngestart) await kies(page, route.ep);
  await speelPlan(page, Routes.planVan(route, volgorde.sleutel), route.id);
  await rondAf(page);
  return leesUitslag(page);
}

(async () => {
  const browser = await pw.chromium.launch({ headless: true });
  const alleProblemen = [];
  const klaar = async page => { alleProblemen.push(...page.problemen); await page.context().close(); };
  const foto = async (page, naam) => { if (SCHERMDIR) await page.screenshot({ path: path.join(SCHERMDIR, naam + ".png") }); };

  /* ---------- 1. Start: pseudoniem verplicht, geen naam-uitleg ---------- */
  {
    const page = await nieuwePagina(browser);
    await foto(page, "01-start-1280");
    check("start: titel en uitleg 'geen naam' zichtbaar", /geen naam/.test(await page.textContent("body")));
    await page.click("#btn-start");
    check("start: leeg pseudoniem niet toegestaan (foutmelding, blijft op start)",
      /Vul een pseudoniem in/.test(await page.textContent("#pseudoniem-fout")) && (await page.locator("[data-start]").count()) === 0);
    await page.fill("#pseudoniem", "   ");
    await page.press("#pseudoniem", "Enter");
    check("start: alleen spaties ook niet toegestaan (en Enter werkt als verzenden)", (await page.locator("[data-start]").count()) === 0 && /Vul een pseudoniem in/.test(await page.textContent("#pseudoniem-fout")));
    await page.fill("#pseudoniem", "student-01");
    await page.press("#pseudoniem", "Enter");
    await page.waitForSelector("[data-start]");
    await foto(page, "02-episodekeuze");
    check("keuze: E2 en E3 vergrendeld voor een nieuwe speler",
      (await page.isDisabled('[data-start="E2"]')) && (await page.isDisabled('[data-start="E3"]')) && !(await page.isDisabled('[data-start="E1"]')));
    check("keuze: vergrendeld-tekst noemt de vorige episode", /Vergrendeld: haal eerst episode 1/.test(await page.textContent('[data-episode="E2"]')));
    await klaar(page);
  }

  /* ---------- 2. Episode 1: voor het spelen niets verklappen ---------- */
  const alleKaarten = casus.kaarten;
  const verboden = [];
  for (const k of alleKaarten) {
    const eff = k.effect && typeof k.effect === "object" ? Object.values(k.effect) : [k.effect];
    for (const t of [...eff, k.bron]) if (typeof t === "string" && t.length >= 6) verboden.push({ kaart: k.id, soort: "effect/bron", tekst: t });
    const dn = k.downside && typeof k.downside === "object" ? Object.values(k.downside) : [k.downside];
    for (const t of dn) if (typeof t === "string" && t.length >= 6) verboden.push({ kaart: k.id, soort: "downside", tekst: t });
  }
  const ep1 = casus.episodes[0];
  const patientVerboden = [ep1.patient.meta && ep1.patient.meta.risicogroep, "Geen risicogroep", "TODO_BART", "risicogroep"].filter(Boolean);
  const pseudo = "student-01";
  let hoofd = await nieuwePagina(browser);
  await start(hoofd, pseudo);
  await kies(hoofd, "E1");
  await foto(hoofd, "03-e1-begin");
  {
    const html = await hoofd.evaluate(() => document.documentElement.outerHTML);
    const tekst = await hoofd.evaluate(() => document.body.innerText);
    // Een kaarttekst die toevallig dezelfde is als zichtbare patiëntkaart-tekst (G2 in E1: "eGFR 42, recent.") is geen lek.
    const zichtbaarPatient = Object.values(ep1.patient.zichtbaar).filter(x => typeof x === "string");
    const lekken = verboden.filter(v => !zichtbaarPatient.includes(v.tekst) && (html.includes(v.tekst) || tekst.includes(v.tekst)));
    check("E1 voor het spelen: geen effect, downside of bron van enige kaart in de pagina (tekst of HTML)", lekken.length === 0,
      lekken.slice(0, 3).map(l => l.kaart + ":" + l.tekst).join(" | "));
    check("E1: geen 'aanbevolen', 'eerste keus', 'beste' of volgordehints in de pagina", !/aanbevolen|eerste keus|beste keuze|eerst |daarna|vóór de eerste/i.test(tekst.replace(/Episode afronden|Volgende dag/g, "")), "");
    check("E1: patiëntkaart toont geen risicogroep-uitleg, meta of TODO_BART",
      !patientVerboden.some(t => html.includes(t) || tekst.includes(t)));
    // Elke kaart: knoptekst = label exact, onder de juiste categoriekop.
    const knoppen = await hoofd.evaluate(() => Array.from(document.querySelectorAll("[data-kaart]")).map(b => ({
      id: b.getAttribute("data-kaart"), tekst: b.textContent.trim(), cat: b.closest(".categorie").querySelector("h3").textContent.trim(),
      kleur: getComputedStyle(b).backgroundColor, attrs: Array.from(b.attributes).map(a => a.name)
    })));
    const rep = ep1.repertoire;
    const fouteKnoppen = [];
    for (const id of rep) {
      const k = alleKaarten.find(x => x.id === id), b = knoppen.find(x => x.id === id);
      if (!b || b.tekst !== k.label || b.cat !== k.categorie) fouteKnoppen.push(id);
    }
    check("E1: repertoire = " + rep.length + " kaarten, elke knop toont exact het label onder de juiste categorie", knoppen.length === rep.length && !fouteKnoppen.length, fouteKnoppen.join(","));
    check("E1: kaart-knoppen dragen geen extra attributen (title/aria met hints)", knoppen.every(b => b.attrs.every(a => ["type", "class", "data-kaart", "data-fokus"].includes(a) || a === "disabled")),
      JSON.stringify(knoppen[0].attrs));
    const kleurPerCat = {};
    knoppen.forEach(b => { (kleurPerCat[b.cat] = kleurPerCat[b.cat] || []).push(b.kleur); });
    const kleuren = Object.values(kleurPerCat).map(l => l[0]);
    check("E1: elke categorie heeft een eigen kleur (en binnen een categorie is de kleur gelijk)",
      Object.keys(kleurPerCat).length === 5 && new Set(kleuren).size === 5 && Object.values(kleurPerCat).every(l => new Set(l).size === 1), JSON.stringify(kleurPerCat));
    const kop = await hoofd.textContent(".patientkop");
    check("E1: patiëntkop letterlijk uit de data", norm(kop) === ep1.patient.zichtbaar.kop, kop);
    const vandaag = await hoofd.textContent("#dag-kop");
    check("E1: begint op dag 1 met 3 acties", (await dag(hoofd)) === 1 && (await acties(hoofd)) === ep1.knoppen.actiesPerBeurt && /Dag 1/.test(vandaag));
  }
  // Richtlijn raadplegen toont casus.raadplegen
  await hoofd.click("#btn-raadplegen");
  {
    const t = await hoofd.textContent(".dialoog");
    const r = casus.raadplegen;
    check("raadplegen: titel en bronnen uit casus.raadplegen", t.includes(r.titel) && r.bronnen.every(s => t.includes(casus.bronnen[s])), t);
    check("raadplegen E1: kost geen actie", (await acties(hoofd)) === 3);
    check("raadplegen: bevat geen hint (geen 'goed', 'fout', 'aanbevolen')", !/aanbevolen|goed|fout|juist/i.test(t));
    await foto(hoofd, "04-raadplegen");
    await hoofd.keyboard.press("Escape");
    check("raadplegen: Escape sluit het venster", (await hoofd.locator(".dialoog").count()) === 0);
  }

  /* ---------- 3. Episode 1: foutroute, herkansing, daarna afwachten-route ---------- */
  {
    const rFout = Routes.lijst.find(r => r.id === "E1-fout-I1");
    const u = await speelRoute(hoofd, rFout, Routes.volgordes[0], true);
    await foto(hoofd, "05-e1-schending");
    const p = vergelijk(rFout, Routes.volgordes[0], u);
    check("E1 foutroute (V3 zonder N1): precies één vraag, geen score, downsides getoond", !p.length, p.join("; "));
    check("E1 foutroute: de koptekst zegt niet wat goed is", !/N1|alarmsignalen|bespreken/i.test(u.koptekst || ""));
    await hoofd.click("#btn-opnieuw");
    await hoofd.waitForSelector("#dagtelling");
    check("herkansing: 'Opnieuw' start dezelfde episode met lege tijdlijn, dag 1 en vol actiebudget",
      (await hoofd.locator("[data-gespeeld]").count()) === 0 && (await dag(hoofd)) === 1 && (await acties(hoofd)) === 3);
    const rOK = Routes.lijst.find(r => r.id === "E1-afwachten");
    const u2 = await (async () => { await speelPlan(hoofd, Routes.planVan(rOK, "A,B"), rOK.id); await rondAf(hoofd); return leesUitslag(hoofd); })();
    await foto(hoofd, "06-e1-gehaald");
    const p2 = vergelijk(rOK, Routes.volgordes[0], u2);
    check("E1 afwachten-route (V1, N1, Ev1): poort gehaald, score, profiel Terughoudend, reflectievraag", !p2.length && /gehaald/.test(u2.koptekst), p2.join("; "));
    await hoofd.click("#btn-terug");
    await hoofd.waitForSelector("[data-start]");
    check("na gehaalde E1: E2 is ontgrendeld, E3 nog niet", !(await hoofd.isDisabled('[data-start="E2"]')) && (await hoofd.isDisabled('[data-start="E3"]')));
  }

  /* ---------- 4. Episode 2: verborgen eGFR pas na G2; fosfomycine-route; fout; A/B ---------- */
  {
    await kies(hoofd, "E2");
    const lab0 = await hoofd.textContent('[data-veld="labTekst"]');
    const ep2 = casus.episodes[1];
    check("E2: vóór G2 alleen de oude eGFR zichtbaar (letterlijk uit data), de ware waarde nergens in de pagina",
      norm(lab0).includes(ep2.patient.zichtbaar.labTekst) && !/\b29\b/.test(await hoofd.evaluate(() => document.body.innerText)) &&
      !(await hoofd.evaluate(() => document.documentElement.outerHTML)).includes("jaarlijkse controle"));
    const verb = ep2.patient.verborgen[0];
    await hoofd.click('[data-kaart="G2"]');
    const onth = await hoofd.textContent("#onthuld");
    check("E2: na G2 staat de onthulling direct in beeld", onth.includes(verb.onthult), onth);
    const lab1 = await hoofd.textContent('[data-veld="labTekst"]');
    check("E2: patiëntkaart is bijgewerkt na G2", norm(lab1).includes(verb.zichtbaar.labTekst), lab1);
    check("E2: de risicogroep-toelichting uit de data (meta) wordt niet getoond", !(await hoofd.evaluate(() => document.body.innerText)).includes(verb.meta.toelichting.slice(0, 30)));
    await foto(hoofd, "07-e2-onthuld");
    check("E2: onthulling staat in de tijdlijn", (await hoofd.locator(".tijdlijn .onthulling").count()) === 1);

    // V6-opties: willekeurige volgorde. Eerst V5 spelen zodat V6 op V5 kan; dialoog openen, volgorde lezen, annuleren.
    await hoofd.click('[data-kaart="O1"]');
    await hoofd.click('[data-kaart="V5"]');
    await hoofd.click("#btn-volgende-dag");
    const volgordes = new Set();
    for (let i = 0; i < 14; i++) {
      await hoofd.click('[data-kaart="V6"]');
      const doelen = await hoofd.locator(".dialoog [data-doel]").evaluateAll(l => l.map(e => e.getAttribute("data-doel")));
      if (i === 0) check("V6 vraagt eerst om een doel; alleen toegestane doelen (V5 gestart, lisinopril actief)", doelen.length === 2, JSON.stringify(doelen));
      await hoofd.click('.dialoog [data-doel="V5"]');
      const opts = await hoofd.locator(".dialoog [data-optie]").evaluateAll(l => l.map(e => e.getAttribute("data-optie")));
      volgordes.add(opts.join("|"));
      if (i === 0) {
        check("V6 vraagt daarna om een optie; de drie opties uit de data staan erin", casus.kaarten.find(k => k.id === "V6").opties.V5.every(o => opts.includes(o.tekst)) && opts.length === 3);
        await foto(hoofd, "08-v6-opties");
      }
      await hoofd.click("#btn-annuleer");
    }
    check("V6: opties verschijnen in wisselende volgorde (≥ 2 verschillende van 14 keer)", volgordes.size >= 2, Array.from(volgordes).join(" // "));
    check("V6: annuleren kost geen actie (nog 3 acties op dag 2)", (await acties(hoofd)) === 3 && (await hoofd.locator("[data-gespeeld]").count()) === 3);
    await klaar(hoofd);
    hoofd = null;
    // Nieuwe pagina: de E2-route echt spelen (fosfomycine) en een foutroute.
    hoofd = await nieuwePagina(browser, { init: [seedScript(pseudo), rngScript(0)] });
    await start(hoofd, pseudo);
    const r2 = Routes.lijst.find(r => r.id === "E2-fosfomycine");
    const u = await speelRoute(hoofd, r2, Routes.volgordes[0]);
    await foto(hoofd, "09-e2-gehaald");
    const p = vergelijk(r2, Routes.volgordes[0], u);
    check("E2 fosfomycine-route: poort gehaald, profiel Kweekgestuurd smal, scores 3/3", !p.length, p.join("; "));
    await hoofd.click("#btn-terug");
    const r2f = Routes.lijst.find(r => r.id === "E2-fout-I5");
    const uf = await speelRoute(hoofd, r2f, Routes.volgordes[0]);
    const pf = vergelijk(r2f, Routes.volgordes[0], uf);
    check("E2 foutroute (nitrofurantoïne bij eGFR 29): één vraag, geen score", !pf.length, pf.join("; "));
    await hoofd.click("#btn-opnieuw");
    await hoofd.waitForSelector("#dagtelling");
    check("E2 herkansing werkt", (await hoofd.locator("[data-gespeeld]").count()) === 0);
    await klaar(hoofd);
  }

  /* ---------- 5. Episode 3: G3-onthulling, beide A/B-volgordes, sick-day-route, foutroute ---------- */
  {
    const ep3 = casus.episodes[2];
    let page = await nieuwePagina(browser, { init: [seedScript(pseudo), rngScript(0)] });
    await start(page, pseudo);
    check("seed: E3 open voor speler met E1 en E2 gehaald", !(await page.isDisabled('[data-start="E3"]')));
    await kies(page, "E3");
    const html0 = await page.evaluate(() => document.documentElement.outerHTML);
    check("E3: vóór G3 geen sprake van de kweek uit episode 2 op de patiëntkaart", !html0.includes(ep3.patient.verborgen[0].onthult));
    check("E3: raadplegen kost 1 actie (knop vermeldt het)", /kost 1 actie/.test(await page.textContent("#btn-raadplegen")));
    await page.click("#btn-raadplegen");
    check("E3: raadplegen trekt 1 actie af", (await acties(page)) === 2);
    await page.click("#btn-sluit");
    await page.click('[data-kaart="G3"]');
    check("E3: na G3 staat de kweek uit episode 2 direct in beeld en op de patiëntkaart",
      (await page.textContent("#onthuld")).includes(ep3.patient.verborgen[0].onthult) && (await page.textContent('[data-veld="eerdereKweek"]')).includes(ep3.patient.verborgen[0].onthult));
    await foto(page, "10-e3-begin");
    await klaar(page);

    // Elke volgorde: de basisroute (fosfomycine-start, amoxicilline/clavulaanzuur 875/125, sick-day-set).
    for (const vg of Routes.volgordes) {
      page = await nieuwePagina(browser, { init: [seedScript(pseudo), rngScript(vg.rng)] });
      await start(page, pseudo);
      const r = Routes.lijst.find(x => x.id === "E3-amoxicilline-clavulaanzuur");
      await kies(page, "E3");
      const plan = Routes.planVan(r, vg.sleutel);
      let eersteBanner = null;
      for (let i = 0; i < plan.length; i++) {
        const s = Routes.stap(plan[i]);
        if (s.dag) {
          await page.click("#btn-volgende-dag");
          if (!eersteBanner && (await page.locator(".vandaag .banner").count())) eersteBanner = await page.getAttribute(".vandaag .banner", "data-gebeurtenis");
        } else if (s.tot) { while ((await dag(page)) < s.tot) await page.click("#btn-volgende-dag"); }
        else await klikKaart(page, plan[i]);
      }
      check("E3 volgorde " + vg.sleutel + ": eerste banner is gebeurtenis " + vg.sleutel.charAt(0), eersteBanner === vg.sleutel.charAt(0), String(eersteBanner));
      const bannersTekst = await page.locator(".vandaag .banner, .tijdlijn .banner").allTextContents();
      check("E3 volgorde " + vg.sleutel + ": banners tonen de gebeurtenistekst letterlijk uit de data",
        ep3.gebeurtenissen.filter(g => g.id === "A" || g.id === "B").every(g => bannersTekst.some(t => norm(t) === norm(g.tekst))));
      await rondAf(page);
      const u = await leesUitslag(page);
      const p = vergelijk(r, vg, u);
      check("E3 basisroute (" + vg.sleutel + "): poort gehaald, Kweekgestuurd, scores 3/3", !p.length, p.join("; "));
      if (vg.sleutel === "A,B") await foto(page, "11-e3-gehaald");
      await klaar(page);
    }

    // A/B in willekeurige volgorde bij gewone (niet-vaste) toevalsbron: 16 spellen.
    const eerste = new Set();
    page = await nieuwePagina(browser, { init: [seedScript(pseudo)] });
    await start(page, pseudo);
    await kies(page, "E3");
    for (let i = 0; i < 16; i++) {
      for (const k of ["G1", "G3", "O2"]) await klikKaart(page, k);
      await page.click("#btn-volgende-dag");
      await klikKaart(page, "G1");               // de 4e kaart: gebeurtenis A of B, banner op de volgende dag
      await page.click("#btn-volgende-dag");
      eerste.add(await page.getAttribute(".vandaag .banner", "data-gebeurtenis"));
      await rondAf(page);                       // onvolledige route: poort geschonden, dus 'Opnieuw'
      await page.click("#btn-opnieuw"); await page.waitForSelector("#dagtelling");
    }
    check("A/B: bij echte toevalsbron komen beide gebeurtenissen als eerste voor (16 spellen)", eerste.has("A") && eerste.has("B"), JSON.stringify(Array.from(eerste)));
    // foutroute E3 + herkansing
    const rF = Routes.lijst.find(x => x.id === "E3-fout-I12");
    await klaar(page);
    page = await nieuwePagina(browser, { init: [seedScript(pseudo), rngScript(0)] });
    await start(page, pseudo);
    const uf = await speelRoute(page, rF, Routes.volgordes[0]);
    const pf = vergelijk(rF, Routes.volgordes[0], uf);
    await foto(page, "12-e3-schending");
    check("E3 foutroute (cotrimoxazol): één vraag, geen score", !pf.length, pf.join("; "));
    await page.click("#btn-opnieuw");
    await page.waitForSelector("#dagtelling");
    check("E3 herkansing: lege tijdlijn, nieuwe poging", (await page.locator("[data-gespeeld]").count()) === 0 && (await dag(page)) === 1);
    // Gebeurtenis-banner en klachtenstatus in de tijdlijn: fosfomycine starten, volgende dag => statusregel
    await klikKaart(page, "G3"); await klikKaart(page, "O1"); await klikKaart(page, "V4");
    await page.click("#btn-volgende-dag");
    const statusTekst = await page.locator(".vandaag [data-status]").allTextContents();
    check("klachtenstatus per dag: na een werkzaam middel staat de statustekst uit de data in beeld",
      statusTekst.length === 1 && norm(statusTekst[0]).includes(ep3.statusTeksten.af), JSON.stringify(statusTekst));
    await klaar(page);
  }

  /* ---------- 6. Export en logging ---------- */
  {
    // 'hoofd' is gesloten; speel hier een kort traject en exporteer: E1 fout, E1 goed (tweede poging).
    const page = await nieuwePagina(browser);
    await start(page, "export-speler");
    await kies(page, "E1");
    await speelPlan(page, ["V3"], "export"); await rondAf(page);
    await page.click("#btn-opnieuw"); await page.waitForSelector("#dagtelling");
    await speelPlan(page, ["V1", "N1", "Ev1"], "export"); await rondAf(page);
    await page.click("#btn-export");
    await page.waitForTimeout(600);
    check("export: knop 'Exporteer resultaten' geeft twee bestanden (CSV en JSON)", page.downloads.length === 2, String(page.downloads.length));
    const inh = {};
    for (const d of page.downloads) inh[d.suggestedFilename().split(".").pop()] = fs.readFileSync(await d.path(), "utf8");
    const json = JSON.parse(inh.json || "[]");
    check("export JSON: twee pogingen, eerste is 'eerstePoging: true', tweede false, met volledige tijdlijn",
      json.length === 2 && json[0].eerstePoging === true && json[1].eerstePoging === false && json[0].tijdlijn.length === 1 && json[1].tijdlijn.length === 3 &&
      json[1].tijdlijn.every(r => "volg" in r && "kaart" in r && "dag" in r && "doel" in r && "optie" in r), JSON.stringify(json.map(j => [j.pseudoniem, j.eerstePoging, j.tijdlijn.length])));
    check("export JSON: de eerste (geschonden) poging heeft geschonden-id's en geen score", json[0].geschonden.length > 0 && json[0].score === null && json[0].profiel === null);
    check("export JSON: gehaalde poging bevat profiel en score", json[1].geschonden.length === 0 && json[1].profiel && json[1].profiel.naam === "Terughoudend" && json[1].score && json[1].score.duurzaamheid === 3);
    const csv = (inh.csv || "").replace(/^﻿/, "");
    const kop = csv.split("\r\n")[0].split(";");
    check("export CSV: kolom eerstePoging (ja/nee) en tijdlijn aanwezig", kop.includes("eerstePoging") && kop.includes("tijdlijn") && /;ja;/.test(csv) && /;nee;/.test(csv) && csv.includes('""volg""'));
    await page.click("#btn-terug");
    await foto(page, "13-keuze-na-spel");
    await klaar(page);
  }

  /* ---------- 7. Opslag mislukt: melding en het spel blijft werken ---------- */
  {
    const kapot = `Storage.prototype.setItem = function () { throw new Error("vol"); };`;
    const page = await nieuwePagina(browser, { init: [kapot] });
    await start(page, "zonder-opslag");
    await kies(page, "E1");
    await speelPlan(page, ["V1", "N1", "Ev1"], "zonder opslag"); await rondAf(page);
    const melding = await page.textContent(".waarschuwing");
    check("opslag mislukt: melding 'Resultaten staan alleen in dit tabblad: exporteer nu.'", norm(melding) === "Resultaten staan alleen in dit tabblad: exporteer nu.", melding);
    await foto(page, "14-opslag-mislukt");
    await page.click("#btn-terug");
    check("opslag mislukt: de gehaalde poging telt toch mee (E2 open, via geheugen)", !(await page.isDisabled('[data-start="E2"]')));
    await page.click("#btn-export");
    await page.waitForTimeout(400);
    check("opslag mislukt: export werkt nog (uit het geheugen)", page.downloads.length === 2);
    await klaar(page);
  }

  /* ---------- 8. Toetsenbord en viewports ---------- */
  for (const vp of [{ width: 1280, height: 800 }, { width: 1024, height: 700 }]) {
    const page = await nieuwePagina(browser, { viewport: vp, init: [seedScript(pseudo)] });
    await start(page, pseudo);
    await kies(page, "E3");
    await klikKaart(page, "G3");
    await page.click("#btn-volgende-dag");
    const meet = await page.evaluate(() => ({
      breed: document.documentElement.scrollWidth, venster: window.innerWidth,
      balk: document.querySelector(".balk").getBoundingClientRect().bottom,
      afronden: document.querySelector("#btn-afronden").getBoundingClientRect()
    }));
    check("viewport " + vp.width + "x" + vp.height + ": geen horizontaal scrollen", meet.breed <= meet.venster, JSON.stringify(meet));
    check("viewport " + vp.width + "x" + vp.height + ": actiebalk en afrondknop binnen beeld", meet.afronden.bottom <= vp.height && meet.afronden.right <= vp.width, JSON.stringify(meet.afronden));
    await foto(page, "15-e3-" + vp.width);
    if (vp.width === 1024) {
      // Toetsenbord: Tab bereikt een kaart, Enter speelt hem; doelkaart: Enter, pijl/Tab naar doel, Enter; Escape sluit.
      await page.focus('[data-kaart="N1"]');
      await page.keyboard.press("Enter");
      check("toetsenbord: Enter op een gefocuste kaart speelt hem", (await page.locator('[data-gespeeld="N1"]').count()) === 1);
      check("toetsenbord: focus blijft na het spelen op dezelfde kaart", (await page.evaluate(() => document.activeElement.getAttribute("data-kaart"))) === "N1");
      await page.focus('[data-kaart="V6"]');
      await page.keyboard.press("Enter");     // lisinopril is een toegestaan doel: de dialoog opent met focus op het eerste doel
      check("toetsenbord: doelkaart opent de dialoog en zet de focus erin", (await page.evaluate(() => !!document.activeElement.closest(".dialoog"))));
      await page.keyboard.press("Escape");
      check("toetsenbord: Escape sluit de dialoog en zet de focus terug op de kaart", (await page.locator(".dialoog").count()) === 0 && (await page.evaluate(() => document.activeElement.getAttribute("data-kaart"))) === "V6");
      await page.focus('[data-kaart="N2"]');
      await page.keyboard.press("Enter");     // geen antibioticum gestart: geen doel beschikbaar
      check("toetsenbord: doelkaart zonder toegestaan doel geeft een melding en geen dialoog", (await page.locator(".dialoog").count()) === 0 && /nergens/.test(await page.textContent("#melding")));
      const kleurContrast = await page.evaluate(() => {
        function lum(c) { const [r, g, b] = c.match(/\d+/g).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
        function ratio(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
        const res = {};
        document.querySelectorAll(".categorie").forEach(c => {
          const h = c.querySelector("h3"), k = c.querySelector(".kaart");
          res[h.textContent] = [ratio(getComputedStyle(h).color, getComputedStyle(h).backgroundColor), ratio(getComputedStyle(k).color, getComputedStyle(k).backgroundColor)];
        });
        return res;
      });
      const laagste = Math.min(...Object.values(kleurContrast).flat());
      check("contrast: categoriekoppen en kaarten minstens 4,5:1 (laagste " + laagste.toFixed(2) + ")", laagste >= 4.5, JSON.stringify(kleurContrast));
    }
    await klaar(page);
  }

  /* ---------- 9. Alle routes via de UI (optioneel) ---------- */
  if (ALLE) {
    let n = 0, fout = 0;
    for (const vg of Routes.volgordes) {
      const page = await nieuwePagina(browser, { init: [seedScript(pseudo), rngScript(vg.rng)] });
      await start(page, pseudo);
      for (const route of Routes.lijst) {
        if (!route.plannen && vg.sleutel !== "A,B") continue;
        await page.goto(URL);
        await start(page, pseudo);
        try {
          const u = await speelRoute(page, route, vg);
          const p = vergelijk(route, vg, u);
          n++;
          if (p.length) { fout++; check("route " + route.id + " (" + vg.sleutel + ")", false, p.join("; ")); }
        } catch (e) { n++; fout++; check("route " + route.id + " (" + vg.sleutel + ")", false, e.message.split("\n")[0]); }
      }
      await klaar(page);
    }
    check("alle routes via de UI: " + n + " gespeeld, " + fout + " afwijkend", fout === 0);
  }

  /* ---------- console-/paginafouten ---------- */
  check("geen console- of paginafouten tijdens het spelen", alleProblemen.length === 0, alleProblemen.slice(0, 5).join(" | "));
  await browser.close();
  console.log("\n" + groen + " groen, " + rood + " rood");
  process.exit(rood ? 1 : 0);
})().catch(e => { console.error("SCRIPTFOUT", e); process.exit(2); });

// Werkpakket F: controle van tools/casusbouwer.html (file://, of EGC_BASIS voor een webserver).
// Gebruik: node gauntlet/tools/check-casusbouwer.js [--browser=firefox|webkit]   Exitcode 1 bij een rode controle.
// (a) het voorbeeld is casus 1.9: controle schoon, markdown bevat de nieuwe onderdelen;
// (b) elke stap en elk onderdeel van elke episode tekent zonder fouten, ook bij een lege casus;
// (c) werk uit de vorige versie (voorbeeld 1.1-vorm) wordt aangevuld zonder verlies;
// (d) de nieuwe controles slaan aan op fouten; (e) bewaren en herladen.
const path = require("path");
let pw; try { pw = require("/opt/node-tools/node_modules/playwright"); } catch (e) { pw = require("playwright"); }
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
const BROWSER = ((process.argv.find(a => a.startsWith("--browser=")) || "").split("=")[1] || "chromium").toLowerCase();
const root = path.resolve(__dirname, "../..");
const URL = process.env.EGC_BASIS ? process.env.EGC_BASIS + "tools/casusbouwer.html" : "file://" + path.join(root, "tools/casusbouwer.html");

let groen = 0, rood = 0;
function check(naam, ok, detail) { if (ok) { groen++; console.log("PASS " + naam); } else { rood++; console.log("FAIL " + naam + (detail ? "\n     " + detail : "")); } }

(async () => {
  const browser = await pw[BROWSER].launch();
  console.log("Browser: " + BROWSER + " " + browser.version());
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const problemen = [];
  page.on("pageerror", e => problemen.push("pagina: " + e.message));
  page.on("console", m => { if (m.type() === "error") problemen.push("console: " + m.text()); });
  page.on("dialog", d => d.accept());
  try {
    await page.goto(URL);
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    await page.reload();

    /* (a) voorbeeld 1.9 */
    await page.click("#bVoorbeeld");
    const a = await page.evaluate(() => { const C = window.__CB; return { m: C.controle(), md: C.genereerMarkdown(), S: C.S }; });
    check("voorbeeld: versie 1.9", a.S.basis.versie === "1.9");
    check("voorbeeld: controle zonder rode punten en zonder aandachtspunten", a.m.length === 0, JSON.stringify(a.m.map(x => x.t)));
    const md = a.md;
    const moet = {
      "I17, I18 en I19 staan erin": /\| I17 \|/.test(md) && /\| I18 \|/.test(md) && /\| I19 \|/.test(md),
      "ernst I18 is 3 en I19 is 5": /\| I18 \| 3 \|/.test(md) && /\| I19 \| 5 \|/.test(md),
      "acties per dag 4, 4 en 3": (md.match(/acties per dag: 4/g) || []).length === 2 && /acties per dag: 3/.test(md),
      "duur 14 dagen per episode": (md.match(/duur: 14 dagen/g) || []).length === 3,
      "kweekuitslag 3 dagen na O1": /3 dagen na O1, aan het begin van die dag/.test(md),
      "A op dag 3, B op dag 5": /\| A \| aan het begin van dag 3/.test(md) && /\| B \| aan het begin van dag 5/.test(md),
      "escalatie naar sepsis en de tekst bij een verloren episode": /volgt sepsis/.test(md) && /Deze episode is verloren\./.test(md),
      "na Verwijzen stopt de episode, met beide oordeelzinnen": /Na Ev3 stopt de episode/.test(md) && /Verwijzen was hier terecht/.test(md) && /Verwijzen was hier nog niet nodig/.test(md),
      "overbodige kaarten in elke episode, met ondergrens": (md.match(/\*\*Overbodige kaarten:\*\*/g) || []).length === 3 && /ondergrens 1/.test(md),
      "situatie k (calcium na ciprofloxacine)": /nadat ciprofloxacine is gestopt of vervangen/.test(md),
      "restprofiel met reflectievraag": /restprofiel "Eigen route"/.test(md) && /Wat was je plan\?/.test(md),
      "de vier reflectievragen van C12": /Wat spreek je de volgende keer vooraf met haar af/.test(md) && /Bij welke patiënt doe je dat de volgende keer weer/.test(md) && /voor je eerste keuze bij haar volgende infectie/.test(md) && /voordat je bij een oudere patiënt een middel kiest/.test(md),
      "keuzemenu van Dosis aanpassen": /Keuzemenu: trimethoprim: halveren/.test(md),
      "gevolgzinnen bij I17 en I19": /\*\*I17:\*\* De nierfunctie daalt verder/.test(md) && /\*\*I19:\*\* Mevrouw gaat naar de tweede lijn/.test(md),
      "spelregels: afronden en dagen": /"Episode afronden" mag altijd/.test(md) && /aan het begin van een dag/.test(md),
      "geen oude regel 'getriggerd op het aantal gespeelde kaarten'": !/aantal gespeelde kaarten/.test(md)
    };
    Object.keys(moet).forEach(k => check("markdown: " + k, moet[k]));

    /* (b) alle stappen en onderdelen tekenen */
    async function allesTekenen(label) {
      const n = await page.evaluate(() => window.__CB.S.episodes.length);
      for (let s = 0; s < 6; s++) {
        if (s === 3) {
          for (let i = 0; i < n; i++) {
            await page.evaluate(i => { window.__CB.epIdx = i; window.__CB.stap = 3; window.__CB.render(); document.querySelectorAll("#paneel details").forEach(d => d.open = true); }, i);
          }
        } else await page.evaluate(s => { window.__CB.stap = s; window.__CB.render(); }, s);
      }
      await page.click("#tab2"); await page.click("#tab1");
      check(label + ": alle stappen, episodes en het schema tekenen zonder fouten", problemen.length === 0, problemen.join(" | "));
    }
    await allesTekenen("voorbeeld");
    const svg = await page.evaluate(() => window.__CB.schemaSvg());
    check("schema: escalatievakje in episode 3", /Escalatie: 4 volle dagen/.test(svg));
    // onderdeel H toont de oordeelvelden in episode 3 en de uitleg in episode 1
    await page.evaluate(() => { window.__CB.stap = 3; window.__CB.epIdx = 2; window.__CB.render(); });
    check("episode 3, onderdeel H: kaart die de episode stopt is Ev3", /Kaart die de episode stopt: Ev3/.test(await page.textContent("#paneel")));
    await page.click("#bNieuw");
    await allesTekenen("lege casus");
    const leegM = await page.evaluate(() => window.__CB.controle());
    check("lege casus: controle geeft rode punten, geen crash", leegM.some(x => x.n === "fout"));

    /* (c) werk uit de vorige versie */
    const oud = await page.evaluate(() => {
      const o = JSON.parse(JSON.stringify(window.__CB.voorbeeld()));
      delete o.restprofiel;
      o.kaarten.forEach(k => { delete k.eindigt; delete k.keuzemenu; });
      o.episodes.forEach((e, i) => {
        delete e.dagen; delete e.actiesPerDag; delete e.escalatie; delete e.einde; delete e.overbodig; delete e.score.ondergrens;
        e.knoppen.acties = i === 2 ? "krap" : "ruim";
        e.gebeurtenissen.forEach(g => { delete g.soort; delete g.dag; delete g.naKaart; g.trigger = "na kaart n"; });
      });
      const m = window.__CB.migreer(o);
      return { acties: m.episodes.map(e => e.actiesPerDag), dagen: m.episodes.map(e => e.dagen), soort: m.episodes[2].gebeurtenissen.map(g => g.soort), trigger: m.episodes[2].gebeurtenissen[0].trigger, rest: m.restprofiel, eindigt: m.kaarten.every(k => k.eindigt === "nee"), acties2: "acties" in m.episodes[0].knoppen, json: JSON.stringify(m) };
    });
    check("oud werk: acties 'ruim'/'krap' worden 4/4/3, duur 14 dagen", JSON.stringify(oud.acties) === "[4,4,3]" && JSON.stringify(oud.dagen) === "[14,14,14]");
    check("oud werk: oude triggers blijven staan als 'anders' met de oude tekst", oud.soort.every(s => s === "anders") && oud.trigger === "na kaart n");
    check("oud werk: restprofiel, kaartvelden en de oude knop 'acties' bijgewerkt", oud.rest && oud.rest.naam === "Eigen route" && oud.eindigt && !oud.acties2);
    // een oud bestand openen via de knop
    const bestand = path.join(require("os").tmpdir(), "casus-oud-" + process.pid + ".json");
    require("fs").writeFileSync(bestand, oud.json);
    await page.setInputFiles("#fLaden", bestand);
    await page.waitForTimeout(300);
    check("oud werk: openen via 'Werk openen' werkt", await page.evaluate(() => window.__CB.S.basis.id === "uwi-eerstelijn"));
    await allesTekenen("geopend oud werk");
    require("fs").unlinkSync(bestand);

    /* (d) de nieuwe controles slaan aan */
    const d = await page.evaluate(() => {
      const C = window.__CB; C.S = C.migreer(C.voorbeeld());
      const e3 = C.S.episodes[2];
      e3.gebeurtenissen[0].dag = 20;                 // na het einde
      e3.gebeurtenissen[2].naKaart = "X9";           // onbekende kaart
      e3.einde.zinTerecht = "";                      // oordeel ontbreekt
      e3.escalatie.dagen = "";                       // escalatie zonder dagen
      e3.overbodig[0].kaarten = "Q1";                // onbekende kaart
      C.S.episodes[0].actiesPerDag = "";             // acties ontbreken
      C.S.kaarten.filter(k => k.id === "V6")[0].keuzemenu = "";
      C.S.kaarten.filter(k => k.id === "V1")[0].effect = "De speler kiest niets.";
      return C.controle().map(x => x.n + ": " + x.t);
    });
    const heeft = re => d.some(x => re.test(x));
    check("controle: dag na het einde van de episode is rood", heeft(/^fout: Episode 3: gebeurtenis A: dag 20 valt na het einde/));
    check("controle: gebeurtenis na een kaart buiten het repertoire is rood", heeft(/^fout: Episode 3: gebeurtenis C: komt na X9/));
    check("controle: escalatie zonder dagen is rood", heeft(/^fout: Episode 3: escalatie staat aan, maar het aantal dagen ontbreekt/));
    check("controle: ontbrekende oordeelzin bij Ev3 is een aandachtspunt", heeft(/^let: Episode 3: Ev3 stopt de episode/));
    check("controle: overbodige kaart met onbekende kaart is rood", heeft(/^fout: Episode 3: overbodige kaart b: onbekende kaart Q1/));
    check("controle: acties per dag ontbreken is rood", heeft(/^fout: Episode 1: aantal acties per dag ontbreekt/));
    check("controle: doelkaart zonder keuzemenu en ontwerptaal zijn aandachtspunten", heeft(/^let: Kaart V6 is een doelkaart/) && heeft(/^let: Kaart V1: de effecttekst bevat ontwerptaal/));

    /* (e) bewaren en herladen */
    await page.click("#bVoorbeeld"); await page.waitForTimeout(500);
    await page.reload(); await page.waitForSelector("#paneel");
    check("herladen: het voorbeeld 1.9 staat er nog, met escalatie", await page.evaluate(() => window.__CB.S.basis.versie === "1.9" && window.__CB.S.episodes[2].escalatie.aan === "ja"));
  } catch (e) { rood++; console.log("SCRIPTFOUT " + (e && e.message || e)); }
  check("geen fouten in de console of pagina", problemen.length === 0, problemen.join(" | "));
  await browser.close();
  console.log("\n" + groen + " groen, " + rood + " rood");
  process.exit(rood ? 1 : 0);
})();

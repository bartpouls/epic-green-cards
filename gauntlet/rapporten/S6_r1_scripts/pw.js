const { chromium } = require("/opt/node-tools/node_modules/playwright");
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: process.env.CHROME || undefined });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const meldingen = []; p.on("console", m => { if (m.type() === "error") meldingen.push(m.text()); }); p.on("pageerror", e => meldingen.push("pageerror " + e.message));
  await p.goto("file:///home/user/epic-green-cards/tests/tests.html");
  await p.waitForFunction(() => window.TESTRESULTATEN, null, { timeout: 120000 });
  const s = await p.textContent("#samenvatting");
  const res = await p.evaluate(() => window.TESTRESULTATEN.map(r => ({ g: r.groep, ok: r.ok, n: r.naam, f: r.fout })));
  const groepen = {}; res.forEach(r => { groepen[r.g] = groepen[r.g] || { n: 0, rood: 0 }; groepen[r.g].n++; if (!r.ok) groepen[r.g].rood++; });
  console.log(s); console.log(JSON.stringify(groepen)); console.log("rood:", res.filter(r => !r.ok).map(r => r.g + ": " + r.n + " -> " + r.f).slice(0, 10));
  console.log("console/pagefouten:", meldingen);
  await p.screenshot({ path: __dirname + "/tests_html.png", fullPage: false });
  await b.close();
})();

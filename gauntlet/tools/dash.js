// LEAD-hulpje: onderhoudt gauntlet/state.json en schrijft gauntlet/progress.js (live dashboard).
// node gauntlet/tools/dash.js unit <naam> '<json>' | log '<json>' | open '<tekst>' | closeopen '<deel van tekst>' | below '<tekst>' | meta '<json>'
const fs = require("fs"), path = require("path");
const dir = path.resolve(__dirname, ".."), sp = path.join(dir, "state.json");
let s = fs.existsSync(sp) ? JSON.parse(fs.readFileSync(sp, "utf8")) : {
  goal: "Speelbaar prototype tutorialcasus UWI (Epic green cards)",
  bar: "Lat 1: casus-uwi.md (v1.1) als enige klinische bron + acceptatiecriteria A1–A8 (bouwopdracht §8): elke kaart, regel, gebeurtenis en feedbacktekst LETTERLIJK gelijk aan de casus; elke geldige route en foutroute geeft het verwachte resultaat; elke afwijking = FAIL. Lat 2: geen quiz, feedback zegt niet voor, labels verraden geen timing of oplossing; speel elke episode als student zonder voorkennis. Zie gauntlet/lat.md.",
  budget: "per stuk min 3 / max 5 rondes; stop ook bij 2 rondes zonder verbetering",
  level: "blind", status: "running", round: 0, maxRounds: 5, updated: "", units: [], log: [], open: [], belowBar: []
};
const [cmd, a, b] = process.argv.slice(2);
if (cmd === "unit") { const p = JSON.parse(b); let u = s.units.find(x => x.name === a); if (!u) { u = { name: a, round: 0, verdict: "PENDING", evidence: "", artifact: "" }; s.units.push(u); } Object.assign(u, p); }
else if (cmd === "log") s.log.push(JSON.parse(a));
else if (cmd === "open") { if (!s.open.includes(a)) s.open.push(a); }
else if (cmd === "closeopen") s.open = s.open.filter(x => !x.includes(a));
else if (cmd === "below") { s.belowBar = s.belowBar.filter(x => !x.startsWith(a.split("::")[0] + "::")); s.belowBar.push(a); }
else if (cmd === "meta") Object.assign(s, JSON.parse(a));
const d = new Date(); const pad = n => String(n).padStart(2, "0");
s.updated = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
s.round = Math.max(0, ...s.units.map(u => u.round || 0));
fs.writeFileSync(sp, JSON.stringify(s, null, 1));
fs.writeFileSync(path.join(dir, "progress.js"), "window.GAUNTLET = " + JSON.stringify(s, null, 1) + ";\n");

# Technisch contract tussen de lagen (alleen LEAD wijzigt dit bestand)

Alles is klassieke JavaScript (geen modules, geen build, geen npm), werkt via `file://` in de browser én in Node via
`vm` (zie `gauntlet/tools/run-node.js` wanneer aanwezig). Eén globale namespace per laag:

| Laag | Bestand | Global |
|---|---|---|
| Data | `casussen/uwi.js` | `window.CASUSSEN = [ {...} ]` (alleen data, geen functies) |
| Regeltaal | `regels/predicaten.js` | `window.Predicaten` |
| Poort/score/profiel | `regels/evaluatie.js` | `window.Evaluatie` |
| Spelmotor | `engine/engine.js` | `window.Engine` |
| UI | `ui/ui.js`, `ui/stijl.css` | `window.UI` |
| Logging/export | `engine/logging.js` | `window.Logging` |

In Node: elk bestand moet laadbaar zijn met `vm.runInContext` in een context waar `window` = het globale object
(`globalThis.window = globalThis`) en `localStorage`/`document` mogen ontbreken (try/catch).
Geen casuslogica, middelnamen of klinische drempels buiten `casussen/uwi.js`.

## 1. Tijdlijn (gedeeld formaat)
Een gespeelde kaart: `{ volg: 1, kaart: "V5", dag: 1, doel: null | "V5" | "lisinopril", optie: null | "halveren" }`.
- `volg` = 1-gebaseerd aantal gespeelde KAARTEN in de episode (raadplegen telt niet mee).
- `dag` = beurt (1-gebaseerd). `doel`-ids: middel-kaart-id (bv. "V5") of comedicatie-id (bv. "lisinopril").
- Tijdlijn is de enige bron voor regels, score, profiel en logging.

## 2. Spelstaat (`Engine.nieuwSpel(casus, episodeId, opties)` → `state`)
```
state = {
  casusId, episodeId, dag, actiesOver, aantalDagen, afgerond: false,
  tijdlijn: [ ...zie 1... ],
  raadplegingen: [ { dag } ],
  gebeurtenissen: [ { id: "A", dag: 3, naVolg: 4 } ],   // dag = dag waarop de banner verscheen (begin van de dag)
  toestanden: ["cystitis", ...],                        // actief; namen komen uit de data
  onthuld: [ { kaart: "G2", dag: 1, sleutel: "eGFR", tekst: "...", waarde: 29 } ],
  zichtbaar: { ...kopie van patient.zichtbaar, bijgewerkt door onthullen... },
  volgordeAB: ["B","A"],                                // gekozen random volgorde (per poging)
  klachten: [ { dag: 2, status: "af" | "aan" | null, tekst: "..." | null } ],  // klinische status per dag
  rng: ...                                              // injecteerbaar voor tests: opties.rng = () => 0..1
}
```
Engine-API (alle functies zuiver t.o.v. `state`, mutatie in place toegestaan, geef `state` terug of gooi `Error` met Nederlandse tekst):
- `Engine.nieuwSpel(casus, episodeId, {rng})`
- `Engine.speelKaart(state, kaartId, {doel, optie})` — valideert repertoire, actiebudget, doelen (`doelen` met `vereist`-predicaat), geeft `{ok, onthuld?, fout?}`
- `Engine.raadpleeg(state)` — kost `raadplegenKost` acties; geeft de bronverwijzing uit de data terug
- `Engine.volgendeDag(state)` — sluit de beurt: berekent klachtenstatus, triggert gebeurtenissen, `dag++`
- `Engine.rondAf(state)` — zet `afgerond = true`, roept `Evaluatie.beoordeel` aan, geeft de uitkomst
- `Engine.eindeBereikt(state)`

## 3. Predicaten (`regels/predicaten.js`)
`Predicaten.evalueer(pred, ctx)` → boolean. `ctx = Predicaten.maakContext(casus, episode, state)` bouwt:
`{ tijdlijn, gebeurtenissen, toestanden, waar (= episode.patient.waar), aantalDagen, laatsteDag, casus, episode, status(dag) }`.
Alle predicaten zijn JSON-objecten (geen functies) zodat ze in de data en in overzicht.html leesbaar zijn.

Notatie: een **kaartverwijzing** `K = { kaart: "V6", doel?: "V5", optie?: "halveren", optieNiet?: [...] }` matcht tijdlijnregels.
Dag-rekenen: `dag(x) − dag(anker)`; het anker zelf is verschil 0. (Zie TODO_BART-1: lezing van "dag 2–4 na de start".)

| Predicaat (`p`) | Velden | Betekenis |
|---|---|---|
| `gespeeld` | `K` | tijdlijn bevat een regel die K matcht |
| `nietGespeeld` | `K` | omgekeerde |
| `voor` / `na` | `a: K, b: K` | eerste match van a ligt (strikt, op `volg`) vóór / na eerste match van b |
| `binnenBeurten` | `K, naGebeurtenis, n` | K gespeeld op dag(gebeurtenis) … dag(gebeurtenis)+n−1 |
| `opDagRelatief` | `K, anker: K, van, tot` | ∃ match van K met `van ≤ dag(K) − dag(eerste anker) ≤ tot` (`tot` weglaten = oneindig) |
| `gestart` | `middel` | middel is gestart: V-kaart-id gespeeld, óf B1 met doel = middel |
| `actief` | `middel?`, `op?` | middel actief (gestart, niet gestopt via B2, niet vervangen via B1). `op: {eindeBeurtNaGebeurtenis:"A", offset:0}` of `{dag:n}` = toestand aan het EINDE van die beurt. Zonder middel: elk antibioticum uit `episode.antibiotica`. Met `uitSet: "resistent"` een benoemde set uit de data. |
| `aantalActieveAntibiotica` | `op: ">", n: 1` | vergelijking; telt op eind van elke dag én op `volg`-niveau (zie I4 in data) — max over de episode |
| `medicatieActief` | `id, op?` | comedicatie actief (niet gepauzeerd via B3, wel/niet hervat via B5) |
| `waar` | `veld, op, waarde` | vergelijkt `ctx.waar[veld]` (ware waarde, ook als speler hem niet ziet) |
| `inToestand` / `gebeurtenisGeweest` | `t` / `id` | |
| `klachten` | `waarde: "af"\|"aan"\|"geenVerbetering48"`, `op?` | klinische status volgens de werkzaamheidstabel van de data |
| `en` / `of` / `niet` | `args` / `args` / `arg` | |
| `alsDan` | `als, dan` | `niet(als) of dan` |
| `waarheid` | `waarde: true\|false` | constanten |

Welke ingrediënten de invarianten (bouwopdracht 6.1 + casus) nodig hebben, mag de bouwer van `predicaten.js`
UITBREIDEN met generieke predicaten (bv. `inZelfdeOfVolgendeBeurt`), maar uitsluitend generiek. Elke uitbreiding
komt in `regels/PREDICATEN.md` (naam, velden, betekenis, voorbeeld).

### 3b. Tellers en klachtenstatus
- `Predicaten.tel(teller, ctx)` → getal. Teller-objecten: `{ t: "gespeeld", K, terwijlKlachten?: "af"|"aan" }` (aantal matchende tijdlijnregels; met `terwijlKlachten` alleen regels waarvan `state.klachten[dag].status` die waarde had op de dag van spelen) en `{ t: "aantalActieveAntibiotica", op: "max" }`. Uitbreidbaar, generiek, gedocumenteerd in `regels/PREDICATEN.md`.
- Klachtenstatus voor dag d (berekend door `Engine.volgendeDag`, opgeslagen in `state.klachten[d]`, voor dag 1 = `{status:null}`): kijk naar de antibiotica die AAN HET EINDE VAN DAG d−1 actief waren. Geen → `null`. Minstens één werkzaam (volgens `episode.werkzaamheid` van de dan geldende toestand, inclusief `als`-voorwaarden) → `"af"`. Anders → `"aan"`. Override: heeft gebeurtenis A (of een andere gebeurtenis met `zet.statusNaBeurten: 2`) plaatsgevonden op dag dA, en is d ≥ dA+2, en was aan het einde van dag dA+1 geen werkzaam antibioticum actief → `"geenVerbetering48"` (blijft zo tot een werkzaam antibioticum actief is aan het eind van een dag). Teksten komen uit `episode.statusTeksten` (casus-letterlijk).
- LEAD-beslissing (na S7-ronde 3) over het randgeval: `geenVerbetering48` geldt vanaf dA+2 (als aan het eind van dA+1 geen werkzaam antibioticum actief was) tot en met de dag vóór de eerste dag waarvan het voorgaande dag-einde een werkzaam antibioticum had; vanaf dan is de status `af`/`aan`/`null` volgens de gewone regel en keert `geenVerbetering48` NIET terug (ook niet na een latere gap). Alleen de eerste nul-periode telt (TODO_BART-8 in de data/casus.todoBart voor Bart).
- `klachten`-predicaat is standaard "ooit tijdens de episode" tenzij `op: {dag}` of `op: "laatste"`.
- Een kaart kan `downside` als string OF als object `{E1: "...", E2: "..."}` hebben (per episode; ontbrekende episode = geen downside voor die episode, TODO_BART).
- Scores worden door `Evaluatie` geklemd op 1–3 (zie contract §5); data hoeft geen `min`/`max` te geven.
- Score-regels: `{ als, punten }` (eerste match wint), `{ als, delta }`, of `{ perKeer: <teller>, delta }`.

## 4. Data — vaste sleutels
**Bestandsindeling tijdens de bouw** (zodat stukken parallel kunnen; LEAD voegt ze aan het eind met `cat` samen tot ÉÉN `casussen/uwi.js`, conform de bouwopdracht):
- `casussen/uwi.js` — casuskop + `kaarten` (bibliotheek, 26 kaarten) + `todoBart: []` + `episodes: []`. Definieert `window.CASUSSEN = [ {...} ]`.
- `casussen/uwi-e1.js`, `uwi-e2.js`, `uwi-e3.js` — elk één `if (window.CASUSSEN && window.CASUSSEN[0]) { ... }`-blok met `window.CASUSSEN[0].episodes.push({...});` en eventueel `window.CASUSSEN[0].todoBart.push({...});`. Alleen data.
Schema volgt bouwopdracht sectie 3, met deze vastlegging van wat daar open staat:
- `casus.antibiotica` is NIET nodig op casusniveau; per episode: `episode.antibiotica: ["V3","V4","V5"]`.
- `kaart.doelen`: `{ E1: [ { id, label, vereist?: <predicaat> } ], E2: [...], E3: [...] }` voor doelkaarten. Label van een antibioticum-doel = kaartlabel; comedicatie-labels staan in `episode.patient.medicatie: [ { id, label } ]`.
- `kaart.opties` (V6): `{ "<doelId>": [ { tekst, goed?: true } ] }`; `goed` is alleen informatief (overzicht), de poort gebruikt de invarianten.
- `episode.startToestanden: ["cystitis"]` (engine zet `state.toestanden` hieruit); `episode.patient.medicatie: [ { id, label } ]`. Predicaten zijn plat: `{p:"gespeeld", kaart:"V1"}` (kaartverwijzing-velden direct op het predicaatobject, geen geneste `K`), `{p:"en", args:[...]}`.
- `episode.werkzaamheid`: per toestand `{ werkzaam: [ { kaart, als?: <predicaat> } ], nietWerkzaam: [ { kaart } ] }` + `statusTeksten: { af, aan, geenVerbetering48 }` (casus-letterlijk).
- `episode.gebeurtenissen[i]`: `{ id, trigger: { type: "naKaart", n } | { type: "naKaartVanKaart", kaart:"O1", n:3, alleenAlsGespeeld:"O1" } | { type:"naAantalKaarten", n }, groep?: "AB", tekst, toestand?, zet?: { resistent:[...], gevoelig:[...] } }`. Gebeurtenissen met dezelfde `groep` worden per poging in willekeurige volgorde aan de triggers (`n`, `m`) gekoppeld: de eerste trigger activeert de eerst-getrokken gebeurtenis.
- `episode.invarianten[i]`: `{ id, ernst, geldtIn: ["*"] | [toestandsnamen/gebeurtenissen], predicaat, vraag, weglaatDownside?, bron }`. `predicaat` = de SCHENDINGSvoorwaarde (waar = geschonden). `geldtIn` mag toestandsnamen, `"*"`, of `{ gebeurtenis:"C" }` bevatten.
- `episode.score`: `{ duurzaamheid: { start?, regels:[ { als: <pred>, punten | delta } ... ] }, doelmatigheid: {...} }`, uitkomst 1–3 per as. Eerste matchende `punten`-regel bepaalt de waarde (regels op volgorde); `delta`-regels tellen op/af vanaf `start`.
- `episode.profielen[i]`: `{ naam, als: <pred>, reflectievraag }` — eerste match (op volgorde) wint.
- `episode.feedbackExtra[i]`: `{ trigger: <pred>, vraag, wanneer: "altijd"|"alleenBijGehaaldePoort" }` — de overige casus-feedbackvragen (O1 gespeeld, bronconflict ciprofloxacine, Automatische herstart, Verouderde eGFR, Onnodig gewisseld, …).
- `episode.zichtbaarAlsOntbreekt[i]`: `{ trigger: <pred>, tekst }` — de "Wat er zichtbaar wordt als een kaart ontbreekt"-zinnen, casus-letterlijk.
- `episode.open`/`TODO_BART`: elke twijfel als `{ id: "TODO_BART-n", vraag, gekozenLezing, plek }` in `casus.todoBart[]` en (bij kaart/regel) als `"TODO_BART": "<vraag>"` op de plek zelf.
- `casus.raadplegen`: `{ titel, bronnen: [...] }` staat ALLEEN op casusniveau (S1), niet per episode (geen `episode.raadplegen`); de keuze welke bronnen erin staan is een TODO_BART (casus noemt alleen 'een eigen naslagkaart met verwijzing naar de bronnen'). Per episode alleen `knoppen.raadplegenKost`.

### 4b. Vastgelegd na ronde 1 (LEAD)
- Canoniek: `episode.startToestanden` (array, GEEN `startToestand`). Engine mag een enkele string niet raden.
- `episode.patient.verborgen[i] = { kaart, onthult (tekst), sleutel?, waarde?, zichtbaar?: {patch} }`; zonder `waarde` wordt `patient.waar[sleutel]` onthuld.
- `state.sets = { resistent: [...], gevoelig: [...] }` gevuld uit `gebeurtenis.zet` na de gebeurtenis; `Predicaten.actief({uitSet:"resistent"})` leest `ctx.sets`.
- `state.klachten` is een array met index = dag. Werkzaamheid wordt bepaald met de toestand van de dag waarvoor de status geldt (na A dus weefselinvasie).
- `Engine.volgendeDag` op de laatste dag zet `state.dagenVoorbij=true` (geen verdere beurt); `rondAf` mag daarna.
- `afrondenPasNaGebeurtenissen` is een instelbare parameter op episode-niveau (standaard false), zie TODO_BART-4.

- `kaart.effect` mag ook `{ alle: "<casuscel verbatim>" }` zijn (of per episode `E1/E2/E3` waar de casus per episode splitst). Engine/UI/overzicht tonen `effect[episodeId] ?? effect.alle`; ontbreekt beide, dan niets (geen verzonnen tekst). Voor V3/V5/O1/Ev1/G2 geldt: de hele casuscel verbatim in `alle` tenzij de casus expliciet per episode (E1:/E2:/E3:) splitst.

- `episode.patient.zichtbaar.kop` = de patiëntkop letterlijk uit de casus (bv. "Mevrouw V., 72 jaar."), voor ALLE episodes; UI/overzicht tonen `kop`, stellen niets samen. Sleutels `TODO_BART` binnen data-objecten (bv. `statusTeksten.TODO_BART`) zijn geen data: iteraties in UI/overzicht/engine slaan sleutels die met `TODO_BART` beginnen over en tonen ze apart onder open vragen.

- Triggers (canoniek): `{type:"naKaart", n, alleenAlsGespeeld?: "O1"}` (na de n-de gespeelde kaart) en `{type:"naKaartVanKaart", kaart:"O1", n:3}` (n kaarten nadat die kaart gespeeld is). De bouwers van S3/S4 en S7 volgen dit.
- `invariant.vraagVarianten: [ { als: <predicaat>, vraag } ]` (eerste match wint, anders `vraag`) voor invarianten met meerdere casusvragen (bv. I6 geen kweek / afwachten; I7 geen kalium / niet gehalveerd). Evaluatie kiest één vraag.
- `statusTeksten.geenVerbetering48` mag `null` zijn als de casus geen status-tekst geeft; UI toont dan niets.
- `casus.rollen = { wissel: "B1", stop: "B2", pauzeer: "B3", hervat: "B5" }` staat in de casuskop (`casussen/uwi.js`): de kaart-id's die de generieke predicaten gebruiken voor wisselen/stoppen/pauzeren/hervatten. `regels/predicaten.js` bevat GEEN kaart-id's als standaard en geeft een Nederlandse fout als `rollen` ontbreekt. (Sets voor `uitSet` mogen door Predicaten worden afgeleid uit de gebeurtenisdefinities in `episode.gebeurtenissen[].zet` voor gebeurtenissen die in `ctx.gebeurtenissen` staan.)

- Conventies voor ALLE episodedata (S2/S3/S4 gelijktrekken): (1) tekst die de speler nooit mag zien (toelichting, reden, ontwerpnoten) staat onder `meta` (niet `toelichting` direct op het object); (2) TODO_BART-teksten zijn zelfstandig leesbaar voor Bart: GEEN verwijzing naar `contract`, `rapport`, ronde- of stuknummers; ze citeren de casuszin en de twee lezingen; (3) slotpunten en leestekens volgen per veld exact de casus-bron; (4) `TODO_BART*`-sleutels op de plek zelf mogen als `TODO_BART` of `TODO_BART_<naam>` (iteraties slaan alles over dat met `TODO_BART` begint).

- LEAD-beslissing (uit S2-criticus ronde 3): tekst die UITLEG voor de ontwerper is en de student zou helpen of voorzeggen staat NOOIT in `patient.zichtbaar`: dat geldt voor de risicogroep-uitleg ("Geen risicogroep. De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75 …", "Risicogroep [NHG].") in E1 en E3 net als in E2: onder `patient.meta.risicogroep`. De student ziet alleen kop, klachten, medicatie, lab en eerdere UWI-gegevens zoals de casus ze noemt. Een TODO_BART vraagt Bart of de risicogroepmelding zichtbaar mag zijn.

- LEAD-beslissing (na S4-ronde 3): BEIDE predicaatvormen (plat: `{p:"gespeeld", kaart:"V1"}`; en genest: `{p:"gespeeld", K:{kaart:"V1"}}`) zijn geldig; `regels/predicaten.js` valideert beide gelijk. Een databestand hoeft niet te worden omgezet; S8/S6/UI behandelen beide gelijk (geen eigen parser: gebruik Predicaten).

- LEAD-beslissing (na S3-ronde 4): `statusTeksten` zijn de casusfragmenten MET slotpunt, zoals in de casus: `af: "klachten nemen af."`, `aan: "klachten houden aan."` (E1, E2, E3 gelijk), `geenVerbetering48: "Na 48 uur geen verbetering."` (E3; E1/E2: null als de casus geen tekst geeft). De UI toont de tekst zoals hij is.

## 5. Evaluatie (`regels/evaluatie.js`)
`Evaluatie.beoordeel(casus, episodeId, state)` → 
```
{
 geschonden: [ { id, ernst, vraag } ],         // ALLE geschonden, gesorteerd op ernst oplopend (1 eerst)
 poortGehaald: boolean,
 downsides: [ { kaart, label, tekst, soort: "gespeeld"|"weggelaten" } ],   // uit data.downside; weggelaten alleen als invariant `weglaatDownside` verwijst
 vraag: "..." | null,                          // alleen bij schending: de vraag van de ernstigste (laagste ernst-getal; bij gelijke ernst: eerste in data)
 score: { duurzaamheid: n, doelmatigheid: n } | null,   // null bij schending
 profiel: { naam, reflectievraag } | null,     // null bij schending
 extraVragen: [...],                           // feedbackExtra die van toepassing zijn
 zichtbaar: [ ...zichtbaarAlsOntbreekt die van toepassing zijn ]
}
```
Evaluatie rekent met de tijdlijn en `ctx` — nooit met namen of drempels in de code.
Schendingen worden bepaald op de EINDSTAND: eisen die nog niet vervuld zijn bij afronden (ook door vroeg afronden) tellen als geschonden (zie TODO_BART-3).

## 6. Logging (`engine/logging.js`)
Per poging (zie bouwopdracht §5): `{ pseudoniem, casusId, episodeId, pogingnummer, eerstePoging: true|false, tijdlijn, onthuld, geschonden: [ids], score, profiel, tijdstempel }`.
`Logging.bewaar`, `Logging.alle`, `Logging.exportCSV()` (één regel per poging, tijdlijn als JSON-string in één cel), `Logging.exportJSON()`, `Logging.download(...)`. Altijd try/catch rond `localStorage`; val terug op geheugen.

## 7. Tests (`tests/tests.html`)
Laadt de lagen met `<script>`-tags en `tests/testlib.js` + `tests/routes.js`. Elke test: naam, groen/rood. Moet ook headless draaien in Node
(`node gauntlet/tools/run-node.js` laadt dezelfde bestanden en print `PASS/FAIL` + exitcode ≠ 0 bij rood).
Routes in tests worden gespeeld via `Engine` (niet door tijdlijnen te hardcoden in de evaluatie), met `rng` vast zodat A/B-volgorde deterministisch is, plus een variant met omgekeerde volgorde.

## 8. Gedeelde TODO_BART-lijst (beginstand; bouwers vullen aan in `casus.todoBart`, nooit zelf klinisch invullen)
- TODO_BART-1 (LEAD-beslissing na S3-ronde 1) "dag 2–4" / "na dag 3": de casus zegt letterlijk "O2 (dag 2–4)" en "V6 (na dag 3)" zonder "na V5"; V5-dag = cursusdag 1. Gekozen lezing: cursusdag = verschil in dagen t.o.v. de dag van V5 + 1. Dus O2 geldig op verschil 1–3 (cursusdag 2–4) en V6-halveren geldig op verschil ≥ 3 (cursusdag ≥ 4, vgl. feedback "Dag 4."). Zo is de casusroute (V5 dag 1, O2 dag 2) speelbaar. Bouwopdracht 6.1 noemt `opDagRelatief(O2,V5,2,4)` (verschil 2–4); dat verschil staat als alternatieve lezing in de TODO voor Bart.
- TODO_BART-2 I9: casus zegt "geen O2 ÉN geen Ev2" (schending alleen als beide ontbreken); bouwopdracht 6.1 zegt "O2 OF Ev2 ontbreekt". Casus is de bron → implementeer de casus-lezing, meld het conflict.
- TODO_BART-3 Eisen "binnen n beurten" bij vroeg afronden: onvervulde eis telt als schending.
- TODO_BART-4 (LEAD-beslissing: standaard UIT, want bouwopdracht 4.1 laat de speler vrij afronden; de TODO vermeldt het ontlopen expliciet en het alternatief `afrondenPasNaGebeurtenissen:true`; dit telt voor de criticus niet als 'niet de strengste lezing') Vroeg afronden vóór gebeurtenis A/B/C (en dus ontlopen van E3-invarianten); instelbare parameter `afrondenPasNaGebeurtenissen` (standaard uit).
- TODO_BART-5 V2 "(+ middel)": casus noemt "V2 (+ middel)" maar V2 is geen doelkaart; profiel/duurzaamheid/I4 bij V2 + V3/V4/V5.
- TODO_BART-6 Tweede O1 in E3 (na A): komt er een tweede kweekuitslag? C triggert maar één keer.
- TODO_BART-7 Statuswoord "klachten nemen toe": komt niet in de casus voor; wordt niet gebruikt.

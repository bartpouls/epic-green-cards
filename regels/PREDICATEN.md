# Regeltaal: predicaten en tellers

Bestand: `regels/predicaten.js` (global `window.Predicaten`). Een predicaat is een JSON-object met een veld `p` (de naam). Er staan geen functies in de data, zodat de regels ook in `overzicht.html` leesbaar zijn. Alle voorbeelden gebruiken verzonnen ids (`X1`, `Y2`); in de casus komen daar de echte kaart-ids te staan.

## Gebruik
```
var ctx  = Predicaten.maakContext(casus, episode, state);   // episode = object of id
var geschonden = Predicaten.evalueer(pred, ctx);            // true / false
var aantal = Predicaten.tel({ t: "gespeeld", K: { kaart: "X1" } }, ctx);
```
`ctx` bevat: `tijdlijn`, `gebeurtenissen`, `toestanden`, `waar` (= `episode.patient.waar`), `aantalDagen`, `laatsteDag`, `casus`, `episode`, `klachten` (lijst `{dag,status}`) en `status(dag)` (klachtenstatus van die dag, `null` als onbekend). De lijsten zijn kopieën van `state`. Evalueren verandert niets aan predicaat of ctx.

**Fouten:** een onbekend predicaat, onbekende teller, onbekende operator, ontbrekend verplicht veld, onbekend veld in een kaartverwijzing, onbekende set of onbekend `waar`-veld geeft een `Error` met Nederlandse tekst. Er wordt nooit stilzwijgend `false` teruggegeven.

## Kaartverwijzing `K`
`K = { kaart, doel?, optie?, optieNiet?: [..] }` matcht tijdlijnregels `{volg, kaart, dag, doel, optie}`. Alle genoemde velden moeten kloppen. Op predicaten staat K in het veld `K` (bij `voor`/`na` in `a` en `b`, bij `opDagRelatief` ook `anker`). Mag ook inline (`{p:"gespeeld", kaart:"X1"}`).

| Veld | Betekenis |
|---|---|
| `kaart` | kaart-id, of een lijst ids (één ervan) |
| `doel` / `optie` | exacte waarde; `null` = regel zonder doel/optie |
| `optieNiet` | lijst: de optie van de regel staat er niet in (regel zonder optie telt mee) |
| `kaartUit` *(uitbreiding)* | naam van een lijst in de episode, bv. `"antibiotica"`: de kaart staat in `episode.antibiotica` |
| `start` *(uitbreiding)* | middel-id (of lijst): regel waarmee dat middel start: de kaart zelf, óf de wissel-kaart (B1) met `doel` = middel |
| `naGebeurtenis` *(uitbreiding)* | gebeurtenis-id: alleen regels op een dag ≥ de dag van die gebeurtenis (gebeurtenis niet geweest: niets matcht) |
| `voorGebeurtenis` *(uitbreiding)* | alleen regels op een dag < de dag van die gebeurtenis (niet geweest: alles matcht) |

Voorbeeld: `{ "kaart": "X2", "doel": "Y1", "optie": "halveren" }`.

## Rollen van de bijsturingskaarten
Voor `actief`, `gestart`, `medicatieActief`, `aantalActieveAntibiotica` en `start` gelden de rollen uit het contract: **B1** = wisselen (`doel` = het nieuwe middel; vervangt alle lopende antibiotica), **B2** = stoppen (`doel` = het gestopte middel), **B3** = comedicatie pauzeren (`doel` = id), **B5** = hervatten (`doel` = id). Een casus mag die ids overschrijven met `casus.rollen = { wissel, stop, pauze, hervat }`. Antibiotica zijn de ids in `episode.antibiotica`. Er wordt gesimuleerd in volgorde van `volg`.

## Predicaten (contract §3)
| `p` | Velden | Betekenis | Voorbeeld |
|---|---|---|---|
| `gespeeld` | `K` | tijdlijn bevat een regel die K matcht | `{p:"gespeeld", K:{kaart:"X1"}}` |
| `nietGespeeld` | `K` | omgekeerde | `{p:"nietGespeeld", K:{kaart:"X1"}}` |
| `voor` | `a`, `b` (K) | eerste match van a ligt strikt vóór de eerste match van b (op `volg`); ontbreekt a of b: `false` | `{p:"voor", a:{kaart:"X1"}, b:{kaart:"X2"}}` |
| `na` | `a`, `b` | eerste match van a ligt strikt ná de eerste match van b; ontbreekt a of b: `false` | `{p:"na", a:{kaart:"X1"}, b:{kaart:"X2"}}` |
| `binnenBeurten` | `K`, `naGebeurtenis` (id), `n` | K gespeeld op een dag van dag(gebeurtenis) t/m dag(gebeurtenis)+n−1 (randen inclusief). Gebeurtenis niet geweest: `false`. `n` = 0: `false` | `{p:"binnenBeurten", K:{kaart:"X1"}, naGebeurtenis:"E", n:2}` |
| `opDagRelatief` | `K`, `anker` (K), `van`, `tot?` | er is een match van K met `van ≤ dag(K) − dag(eerste match anker) ≤ tot`; `tot` weglaten = oneindig; het anker zelf heeft verschil 0; geen anker: `false` | `{p:"opDagRelatief", K:{kaart:"X3"}, anker:{kaart:"X1"}, van:2, tot:4}` |
| `gestart` | `middel` (id of lijst) | er is een regel waarmee het middel start (de kaart zelf, of B1 met doel = middel) | `{p:"gestart", middel:"Q1"}` |
| `actief` | `middel?`, `op?`, `uitSet?` | middel is gestart en niet gestopt (B2) of vervangen (B1). Zonder `middel`: elk antibioticum uit `episode.antibiotica`. `middel` mag een lijst zijn (één ervan). Zonder `op`: eindstand van de tijdlijn. Met `uitSet`: het actieve middel moet ook in die benoemde set zitten (zie hieronder). Zie `op` hieronder | `{p:"actief", middel:"Q1", op:{dag:3}}` |
| `aantalActieveAntibiotica` | `op`, `n` | het maximum aantal gelijktijdig actieve antibiotica, gemeten na élke gespeelde kaart (dus ook binnen een dag), vergeleken met `n`. Hier is `op` de vergelijkingsoperator | `{p:"aantalActieveAntibiotica", op:">", n:1}` |
| `medicatieActief` | `id`, `op?` | comedicatie is actief: niet gepauzeerd (B3), of na pauze weer hervat (B5). Zonder pauze is elke id actief. Moment-`op` als bij `actief` | `{p:"medicatieActief", id:"m1", op:{dag:2}}` |
| `waar` | `veld`, `op`, `waarde` | vergelijkt `ctx.waar[veld]` (de ware waarde). Operatoren `<`, `<=`, `>`, `>=`, `==` (ook `=`), `!=`; ordening alleen op getallen. Onbekend veld: fout | `{p:"waar", veld:"w", op:"<", waarde:30}` |
| `inToestand` | `t` | `t` staat in `ctx.toestanden` | `{p:"inToestand", t:"s1"}` |
| `gebeurtenisGeweest` | `id` | gebeurtenis staat in `ctx.gebeurtenissen` | `{p:"gebeurtenisGeweest", id:"E"}` |
| `klachten` | `waarde`, `op?` | `waarde` ∈ `"af"`, `"aan"`, `"geenVerbetering48"`. Zonder `op`: ooit tijdens de episode. `op:{dag:n}`: status op dag n (uit `ctx.status`). `op:{eindeBeurtNaGebeurtenis:id, offset:k}`: status op dag(gebeurtenis)+k. `op:"laatste"`: status op `ctx.laatsteDag` | `{p:"klachten", waarde:"aan", op:{dag:3}}` |
| `en` / `of` | `args` (lijst) | alle / minstens één; lege `en` = waar, lege `of` = onwaar | `{p:"en", args:[P1, P2]}` |
| `niet` | `arg` | ontkenning | `{p:"niet", arg:P1}` |
| `alsDan` | `als`, `dan` | `niet(als) of dan` | `{p:"alsDan", als:P1, dan:P2}` |
| `waarheid` | `waarde` (true/false) | constante | `{p:"waarheid", waarde:true}` |

### Het moment `op` (bij `actief` en `medicatieActief`)
Toestand na het genoemde moment; ontbreekt `op` dan is het de eindstand.
- `{dag:n}`: aan het EINDE van dag n.
- `{eindeBeurtNaGebeurtenis:"E", offset:k}`: aan het einde van dag dag(E)+k (`offset` standaard 0). E niet geweest: het predicaat is `false`.
- `{naKaart:K}` *(uitbreiding)*: direct na de eerste regel die K matcht (op `volg`-niveau). Geen match: `false`.

### Benoemde sets (`uitSet`)
`uitSet:"resistent"` (of een andere naam). De set begint met de lijst `ctx.waar[naam]` of anders `episode[naam]` (als die bestaan) en wordt aangevuld met `zet[naam]` van elke gebeurtenis die op dat moment geweest is (`episode.gebeurtenissen[i].zet`). Voor `resistent` verwijdert `zet.gevoelig` middelen weer uit de set. Een naam die nergens in de data voorkomt: fout.

## Uitbreidingen (generiek) op het contract
| `p` | Velden | Betekenis | Voorbeeld |
|---|---|---|---|
| `binnenBeurtenNaKaart` | `K`, `naKaart` (K), `n` | K gespeeld op een dag van dag(eerste match naKaart) t/m +n−1. `n`=1: dezelfde beurt; `n`=2: dezelfde of de volgende beurt. De volgorde binnen één dag telt niet. Geen anker: `false` | `{p:"binnenBeurtenNaKaart", K:{kaart:"X2"}, naKaart:{start:"Q1"}, n:2}` |
| `tel` | `teller`, `op`, `waarde` | vergelijkt een teller (hieronder) met een getal, operatoren als bij `waar` | `{p:"tel", teller:{t:"gespeeld", K:{kaart:"X1"}}, op:">=", waarde:2}` |

Verder uitgebreid: de K-velden `kaartUit`, `start`, `naGebeurtenis`, `voorGebeurtenis`, het moment `{naKaart}`, `uitSet` bij `actief`, en `middel` als lijst (zie de tabellen).

## Tellers (contract §3b): `Predicaten.tel(teller, ctx)` → getal
| `t` | Velden | Betekenis | Voorbeeld |
|---|---|---|---|
| `gespeeld` | `K`, `terwijlKlachten?` | aantal tijdlijnregels dat K matcht (dubbel gespeeld telt dubbel). Met `terwijlKlachten:"af"\|"aan"\|"geenVerbetering48"` alleen regels waarvan `ctx.status(dag van spelen)` die waarde had (dag 1 of onbekende dag: `null`, telt niet) | `{t:"gespeeld", K:{kaart:"X1"}, terwijlKlachten:"af"}` |
| `aantalActieveAntibiotica` | `op:"max"` | het maximum aantal gelijktijdig actieve antibiotica over de episode (gemeten na elke kaart) | `{t:"aantalActieveAntibiotica", op:"max"}` |

Een onbekende teller of `op` is een fout.

## Vaste afspraken
- Volgorde komt uit `volg` (1-gebaseerd, ook als de tijdlijn ongesorteerd binnenkomt); dag-rekenen uit `dag`.
- "Eerste match" is steeds de regel met de laagste `volg`.
- `aantalActieveAntibiotica`, `actief` zonder middel en `kaartUit:"antibiotica"` vragen `episode.antibiotica`; ontbreekt die lijst dan volgt een fout.
- Tests: `tests/predicaten.tests.js` (testgroep `predicaten`), met alleen synthetische tijdlijnen.

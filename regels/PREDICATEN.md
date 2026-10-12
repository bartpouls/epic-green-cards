# Regeltaal: predicaten en tellers

Bestand: `regels/predicaten.js` (global `window.Predicaten`). Een predicaat is een JSON-object met een veld `p` (de naam). Er staan geen functies in de data, zodat de regels ook in `overzicht.html` leesbaar zijn. Alle voorbeelden gebruiken verzonnen ids (`X1`, `Y2`); in de casus komen daar de echte kaart-ids te staan.

## Gebruik
```
var ctx  = Predicaten.maakContext(casus, episode, state);   // episode = object of id
var geschonden = Predicaten.evalueer(pred, ctx);            // true / false
Predicaten.valideer(pred, casus, episode);                  // alleen controleren (geen spelstand nodig); of valideer(pred, ctx)
var aantal = Predicaten.tel({ t: "gespeeld", K: { kaart: "X1" } }, ctx);
```
`ctx` komt ALTIJD uit `Predicaten.maakContext`. Een ander object (`{}`, de casus, een episode, een kale `state`) is geen ctx en geeft de fout 'Er is geen geldige context (ctx) meegegeven' bij `evalueer`, `tel` en `valideer(pred, ctx)`, ook voor `waarheid`. `maakContext` zelf geeft een fout als `state.tijdlijn`, `gebeurtenissen`, `toestanden` of `klachten` geen lijst is (weglaten of `null` = lege lijst) of als `casus`/`state` geen object is.

`ctx` bevat: `tijdlijn`, `gebeurtenissen`, `toestanden`, `waar` (= `episode.patient.waar`), `aantalDagen`, `laatsteDag`, `casus`, `episode`, `klachten` (lijst `{dag,status}`) en `status(dag)` (klachtenstatus van die dag, `null` als onbekend). De lijsten zijn kopieën van `state`. Evalueren verandert niets aan predicaat of ctx.

**Validatie komt eerst, en hangt niet af van de spelstand.** `evalueer` (en `tel`) controleren het hele predicaat, met alle onderdelen van `en`/`of`/`niet`/`alsDan`, VOORDAT ze een waarde geven. Of een kaart al gespeeld is, een gebeurtenis al geweest is of een anker bestaat, speelt daarbij geen rol: een datafout geeft dus ook bij een lege tijdlijn, vóór de gebeurtenis en in een tak die niet nodig was een fout. `Predicaten.valideer(pred, casus, episode)` (of `valideer(pred, ctx)`) doet alleen die controle en geeft niets terug; het accepteert ook een teller (`{t:...}`). Zo kan het laden van een casus alle predicaten in één keer controleren.

**Fouten:** elk van deze gevallen geeft een `Error` met Nederlandse tekst:
- een onbekend predicaat (ook als de naam een JavaScript-naam is als `toString`, `constructor` of `__proto__`), een onbekende teller of een onbekende vergelijkingsoperator;
- een ontbrekend verplicht veld, of een veld van het verkeerde type of met een lege waarde. Regels:
  - `null` is een fout bij ALLE velden behalve `doel` en `optie` (daar betekent `null` 'regel zonder doel/optie') en `waarde` bij `waar` met `==`, `=` of `!=` (een bewust lege ware waarde). Dus een fout bij `kaart`, `kaartUit`, `start`, `middel`, `optieNiet`, `naGebeurtenis`, `voorGebeurtenis`, `id`, `t`, `veld`, `uitSet`, `op` (ook `op:null`; zonder `op` geldt de eindstand), `n`, `van`, `tot`, `offset`, `op.dag`, `K`, `a`, `b`, `anker`, `naKaart`, `arg`, `als`, `dan`, `args`, elk element van `en`/`of`, `teller` en `terwijlKlachten`. `undefined` geldt als 'veld afwezig'.
  - ids (`kaart`, `start`, `middel`, `optieNiet`, `id`, `t`, gebeurtenis-id's) zijn niet-lege tekst of een lijst daarvan; `kaart`, `start` en `middel` mogen geen lege lijst zijn (een lege `optieNiet` mag wel: er wordt niets uitgesloten);
  - `n`, `van`, `tot`, `offset`, `op.dag`, `waarde` bij `tel` en `n` bij `aantalActieveAntibiotica` zijn gehele getallen; `n` bij `binnenBeurten`/`binnenBeurtenNaKaart` is bovendien niet negatief (`n:0` = leeg venster, altijd onwaar);
  - `van` mag niet groter zijn dan `tot` bij `opDagRelatief`;
  - `waarde` bij `waar` is tekst, getal of waar/onwaar;
- een **onbekend veld** op een predicaat, teller, kaartverwijzing of moment `op` (typfout). Elk predicaat heeft een vaste lijst toegestane velden, in de platte én de geneste vorm; sleutels die met `TODO_BART` beginnen worden genegeerd;
- een onbekende lijst in `kaartUit` (de naam moet een eigen sleutel van de episode zijn en een lijst bevatten; `toString` en `constructor` tellen niet);
- een onbekende set in `uitSet`: de naam komt niet voor in `ctx.waar`, in de episode of in de `zet` van een gebeurtenisdefinitie. Uitzondering: `resistent` en `gevoelig` gelden allebei altijd als bekend (ze zijn elkaars tegenset), ook in een casus zonder enige resistentie-data; de set is dan leeg;
- een gebeurtenis-id (`naGebeurtenis`, `voorGebeurtenis`, `eindeBeurtNaGebeurtenis`, `gebeurtenisGeweest`) die niet in `episode.gebeurtenissen` staat. Dit wordt alleen gecontroleerd als die lijst bestaat en niet leeg is;
- een `medicatieActief` met een id dat niet in `episode.patient.medicatie` staat (of een episode zonder die lijst);
- een `actief` of `gestart` met een `middel` dat niet in `episode.antibiotica` staat (een andere kaart kan nooit "actief" of een startmiddel zijn), of een episode zonder die lijst;
- een `en`/`of` waarvan `args` geen lijst is, en een `niet`/`alsDan` zonder `arg`/`als`/`dan`: altijd de Nederlandse tekst, nooit een JavaScript-fout;
- een `waar` met een veld dat niet in `episode.patient.waar` staat, bij elke operator (ook `==`, `=`, `!=`); en een ordenende operator (`<`, `<=`, `>`, `>=`) waarbij het veld of de `waarde` geen getal is;
- een moment `op` dat niet precies één van `dag`, `eindeBeurtNaGebeurtenis` of `naKaart` heeft, of een `offset` zonder `eindeBeurtNaGebeurtenis`;
- een casus zonder `rollen` (of met een lege rol) bij elk predicaat dat de rollen nodig heeft: `actief`, `gestart`, `medicatieActief`, `aantalActieveAntibiotica`, de teller `aantalActieveAntibiotica` en elke kaartverwijzing met `start` (ook in `naKaart`, `anker` en `op.naKaart`).

Wat er niet gecontroleerd wordt: kaart-id's (`kaart`, `doel`, `start`) en toestand-id's (`inToestand`) worden niet tegen een lijst gelegd, omdat de episode geen sluitende lijst daarvan heeft; een typfout daarin geeft dus gewoon `false`.

`en`, `of` en `alsDan` evalueren altijd al hun onderdelen (geen kortsluiting) en de validatie loopt sowieso door alle onderdelen, ook als de uitkomst al vaststaat.

## Kaartverwijzing `K`
`K = { kaart, doel?, optie?, optieNiet?: [..] }` matcht tijdlijnregels `{volg, kaart, dag, doel, optie}`. Alle genoemde velden moeten kloppen. Er zijn twee gelijkwaardige vormen:
- **plat** (de vorm in de casusdata): de K-velden staan direct op het predicaat, `{p:"gespeeld", kaart:"X1", doel:"Y1"}`;
- **genest**: `{p:"gespeeld", K:{kaart:"X1", doel:"Y1"}}`.

Beide vormen mengen (`K` én losse K-velden) is een fout. Bij `voor`/`na` staan de verwijzingen altijd in `a` en `b`, bij `opDagRelatief` ook in `anker` en bij `binnenBeurtenNaKaart` in `naKaart` (steeds geneste objecten). Bij `binnenBeurten` is `naGebeurtenis` altijd een eigen veld van het predicaat (ook in de platte vorm). Een `naGebeurtenis` of `voorGebeurtenis` binnen een geneste `K` wordt overal gevalideerd (ook bij `binnenBeurten`), als elk ander gebeurtenis-id. Een K-veld dat niet in de tabel hieronder staat is een fout.

| Veld | Betekenis |
|---|---|
| `kaart` | kaart-id, of een lijst ids (één ervan) |
| `doel` / `optie` | exacte waarde; `null` = regel zonder doel/optie |
| `optieNiet` | lijst: de optie van de regel staat er niet in (regel zonder optie telt mee) |
| `kaartUit` *(uitbreiding)* | naam van een lijst in de episode, bv. `"antibiotica"`: de kaart staat in `episode.antibiotica` |
| `start` *(uitbreiding)* | middel-id (of lijst): regel waarmee dat middel start: de kaart zelf, óf de wissel-kaart met `doel` = middel |
| `naGebeurtenis` *(uitbreiding)* | gebeurtenis-id: alleen regels op een dag ≥ de dag van die gebeurtenis (gebeurtenis niet geweest: niets matcht) |
| `voorGebeurtenis` *(uitbreiding)* | alleen regels op een dag < de dag van die gebeurtenis (niet geweest: alles matcht) |

Voorbeeld: `{ "kaart": "X2", "doel": "Y1", "optie": "halveren" }`.

## Rollen van de bijsturingskaarten
Voor `actief`, `gestart`, `medicatieActief`, `aantalActieveAntibiotica` en `start` gelden de rollen uit `casus.rollen`: **wissel** (nu B1) = wisselen (`doel` = het nieuwe middel; vervangt alle lopende antibiotica), **stop** (B2) = stoppen (`doel` = het gestopte middel), **pauzeer** (B3) = comedicatie pauzeren (`doel` = id), **hervat** (B5) = hervatten (`doel` = id). Welke kaart welke rol heeft, staat in de data: `casus.rollen = { wissel, stop, pauzeer, hervat }` (in `casussen/uwi.js`). De code kent zelf geen kaart-id's. Ontbreekt `casus.rollen` of een van de vier, dan geeft elk predicaat dat de rollen nodig heeft (`actief`, `gestart`, `medicatieActief`, `aantalActieveAntibiotica`, de teller `aantalActieveAntibiotica` en een K met `start`) een fout, ook bij een lege tijdlijn. Predicaten die de rollen niet nodig hebben (bijvoorbeeld `gespeeld`, `voor`, `waar`) werken ook zonder. Antibiotica zijn de ids in `episode.antibiotica`; alleen die kunnen actief worden (een gespeelde kaart die geen antibioticum is, bijvoorbeeld een onderzoekskaart, wordt nooit actief en telt niet mee in `aantalActieveAntibiotica`). Er wordt gesimuleerd in volgorde van `volg`. De ids B1, B2, B3 en B5 zijn dus alleen de waarden in de huidige casus.

## Predicaten (contract §3)
| `p` | Velden | Betekenis | Voorbeeld |
|---|---|---|---|
| `gespeeld` | `K` | tijdlijn bevat een regel die K matcht | `{p:"gespeeld", K:{kaart:"X1"}}` |
| `nietGespeeld` | `K` | omgekeerde | `{p:"nietGespeeld", K:{kaart:"X1"}}` |
| `voor` | `a`, `b` (K) | eerste match van a ligt strikt vóór de eerste match van b (op `volg`); ontbreekt a of b: `false` | `{p:"voor", a:{kaart:"X1"}, b:{kaart:"X2"}}` |
| `na` | `a`, `b` | eerste match van a ligt strikt ná de eerste match van b; ontbreekt a of b: `false` | `{p:"na", a:{kaart:"X1"}, b:{kaart:"X2"}}` |
| `binnenBeurten` | `K`, `naGebeurtenis` (id), `n` | K gespeeld op een dag van dag(gebeurtenis) t/m dag(gebeurtenis)+n−1 (randen inclusief). Gebeurtenis niet geweest: `false`. `n` = 0: `false` | `{p:"binnenBeurten", K:{kaart:"X1"}, naGebeurtenis:"E", n:2}` |
| `opDagRelatief` | `K`, `anker` (K), `van`, `tot?` | er is een match van K met `van ≤ dag(K) − dag(eerste match anker) ≤ tot`; `tot` weglaten = oneindig; het anker zelf heeft verschil 0; geen anker: `false` | `{p:"opDagRelatief", K:{kaart:"X3"}, anker:{kaart:"X1"}, van:2, tot:4}` |
| `gestart` | `middel` (id of lijst, antibiotica uit `episode.antibiotica`) | er is een regel waarmee het middel start (de kaart zelf, of de wissel-kaart met doel = middel) | `{p:"gestart", middel:"Q1"}` |
| `actief` | `middel?`, `op?`, `uitSet?` | middel is gestart en niet gestopt (stop-kaart) of vervangen (wissel-kaart). Zonder `middel`: elk antibioticum uit `episode.antibiotica`. `middel` mag een lijst zijn (één ervan) en moet in `episode.antibiotica` staan. Zonder `op`: eindstand van de tijdlijn. Met `uitSet`: het actieve middel moet ook in die benoemde set zitten (zie hieronder). Zie `op` hieronder | `{p:"actief", middel:"Q1", op:{dag:3}}` |
| `aantalActieveAntibiotica` | `op`, `n` | het maximum aantal gelijktijdig actieve antibiotica, gemeten na élke gespeelde kaart (dus ook binnen een dag), vergeleken met `n`. Hier is `op` de vergelijkingsoperator | `{p:"aantalActieveAntibiotica", op:">", n:1}` |
| `actiefNaDagen` | `middel`, `anker`, `na` | middel is nog actief aan het EINDE van dag dag(eerste match van `anker`) + `na` (`na` ≥ 0). Anker niet gespeeld: onwaar. Wie het middel vóór dat dag-einde stopt of wisselt, valt er dus buiten. | `{p:"actiefNaDagen", middel:"Q1", anker:{start:"Q1"}, na:2}` |
| `medicatieActief` | `id`, `op?` | comedicatie is actief: niet gepauzeerd (pauzeer-kaart), of na pauze weer hervat (hervat-kaart). Zonder pauze is een bekend id actief. Het id moet in `episode.patient.medicatie` staan (lijst van `{id,label}` of van ids), anders een fout. Moment-`op` als bij `actief` | `{p:"medicatieActief", id:"m1", op:{dag:2}}` |
| `waar` | `veld`, `op`, `waarde` | vergelijkt `ctx.waar[veld]` (de ware waarde). Operatoren `<`, `<=`, `>`, `>=`, `==` (ook `=`), `!=`; ordening alleen op getallen (anders fout). `==`, `=` en `!=` vergelijken strikt: `"5"` is niet gelijk aan `5` en `true` niet aan `1`. Onbekend veld: fout | `{p:"waar", veld:"w", op:"<", waarde:30}` |
| `inToestand` | `t` | `t` staat in `ctx.toestanden` | `{p:"inToestand", t:"s1"}` |
| `gebeurtenisGeweest` | `id` | gebeurtenis staat in `ctx.gebeurtenissen` | `{p:"gebeurtenisGeweest", id:"E"}` |
| `klachten` | `waarde`, `op?` | `waarde` ∈ `"af"`, `"aan"`, `"geenVerbetering48"`. Zonder `op`: ooit tijdens de episode. `op:{dag:n}`: status op dag n (uit `ctx.status`). `op:{eindeBeurtNaGebeurtenis:id, offset:k}`: status op dag(gebeurtenis)+k. `op:"laatste"`: status op `ctx.laatsteDag` | `{p:"klachten", waarde:"aan", op:{dag:3}}` |
| `en` / `of` | `args` (lijst) | alle / minstens één; lege `en` = waar, lege `of` = onwaar | `{p:"en", args:[P1, P2]}` |
| `niet` | `arg` | ontkenning | `{p:"niet", arg:P1}` |
| `alsDan` | `als`, `dan` | `niet(als) of dan` | `{p:"alsDan", als:P1, dan:P2}` |
| `waarheid` | `waarde` (true/false) | constante | `{p:"waarheid", waarde:true}` |

### Het moment `op` (bij `actief` en `medicatieActief`)
Toestand na het genoemde moment; ontbreekt `op` dan is het de eindstand.
Precies één van de drie vormen; een `offset` hoort alleen bij `eindeBeurtNaGebeurtenis` en moet een getal zijn (ook als de gebeurtenis nog niet geweest is).
- `{dag:n}`: aan het EINDE van dag n.
- `{eindeBeurtNaGebeurtenis:"E", offset:k}`: aan het einde van dag dag(E)+k (`offset` standaard 0). E niet geweest: het predicaat is `false` (dus ook niet de eindstand; dat geldt voor `actief` en `medicatieActief`).
- `{naKaart:K}` *(uitbreiding)*: direct na de eerste regel die K matcht (op `volg`-niveau). Geen match: `false`.

### Benoemde sets (`uitSet`)
`uitSet:"resistent"` (of een andere naam). De set begint met de lijst `ctx.waar[naam]` of anders `episode[naam]` (als die bestaan) en wordt aangevuld met `zet[naam]` van elke gebeurtenis die op dat moment geweest is (`episode.gebeurtenissen[i].zet`). Voor `resistent` verwijdert `zet.gevoelig` middelen weer uit de set; omgekeerd verwijdert voor `gevoelig` een `zet.resistent` ze weer. Een naam die nergens in de data voorkomt: fout (ook `toString`, `constructor`, `__proto__`), met als enige uitzondering `resistent` en `gevoelig` (allebei altijd bekend, zie Fouten). Gebeurtenissen met dezelfde id als een eerdere definitie worden genegeerd (de eerste definitie telt).

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
- Een gebeurtenis-id komt normaal één keer voor; staat hij er toch twee keer in `ctx.gebeurtenissen`, dan telt de eerste (laagste index) voor `naGebeurtenis`, `binnenBeurten`, `eindeBeurtNaGebeurtenis` en `gebeurtenisGeweest`.
- Volgorde komt uit `volg` (1-gebaseerd, ook als de tijdlijn ongesorteerd binnenkomt); dag-rekenen uit `dag`.
- "Eerste match" is steeds de regel met de laagste `volg`.
- `aantalActieveAntibiotica`, `actief` zonder middel en `kaartUit:"antibiotica"` vragen `episode.antibiotica`; ontbreekt die lijst dan volgt een fout.
- Tests: `tests/predicaten.tests.js` (testgroep `predicaten`), met alleen synthetische tijdlijnen en twee synthetische casussen met verschillende rol-id's (B1/B2/B3/B5 en R1/R2/R3/R4) en lijstnamen (`antibiotica`, `reserve`), zodat hardgecodeerde rollen of lijstnamen rood geven.

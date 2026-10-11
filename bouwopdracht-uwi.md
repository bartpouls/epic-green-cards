# Bouwopdracht — Epic green cards, prototype tutorialcasus UWI

Voor: Claude Code (web). Opdrachtgever: Bart Pouls (Radboudumc). Versie 1.0, 11 oktober 2026.
Meelezen: `casus-uwi.md` (versie 1.1). Dat bestand is de **enige bron van klinische inhoud**.

---

## 0. Lees dit eerst

- **Doel:** een speelbaar prototype van de drie episodes uit `casus-uwi.md`. Het wordt gebruikt voor een playtest met studenten en een collega-onderwijskundige. Het moet werken en meten. Mooi hoeft nog niet.
- **Opdrachtgever is geen programmeur.** Leg elke stap uit zonder vakjargon. Vraag niets wat terminal- of Git-kennis vereist. Stel na elke mijlpaal één controlevraag in gewone taal.
- **Het budget is beperkt.** Bouw de kleinste versie die aan de acceptatiecriteria voldoet. Geen frameworks, geen build-stap en geen externe libraries zonder toestemming. Doe niets aan vormgeving voordat mijlpaal 4 is goedgekeurd.
- **Klinische inhoud verzin je nooit.** Alles wat klinisch is (middelen, doseringen, regels, feedbackteksten) neem je letterlijk over uit `casus-uwi.md` of uit sectie 6 van dit document. Ontbreekt er iets of is het dubbelzinnig? Zet dan in de data `"TODO_BART": "<vraag>"` en meld het. Vul het niet zelf in.

## 1. Scope

**Wel:**
- Episodes 1–3 van de casus UWI, speelbaar in volgorde. Een episode gaat pas open als de vorige is gehaald.
- Patiëntkaart met zichtbare en verborgen gegevens.
- Kaarten in zes categorieën, met doelkaarten.
- Tijdlijn per dag, actiebudget per beurt.
- Gebeurtenissen.
- Evaluatie: veiligheidspoort met Socratische vraag en herkansing; anders score, profiel en reflectievraag.
- Logging van elke poging, met export.

**Niet (fase 2 of later):**
- AI-feedbacklaag
- inloggen, server of database
- andere casussen
- patiëntvarianten
- vormgeving in Hearthstone-stijl
- geluid en animaties
- meertaligheid

## 2. Architectuur — drie gescheiden lagen

De lagen moeten strikt gescheiden blijven. Bij een nieuwe casus verandert alleen de data.

```
/index.html                 start; laadt alles met klassieke <script>-tags (werkt ook via dubbelklik, file://)
/casussen/uwi.js            SCENARIODATA: window.CASUSSEN = [{...}]; alleen data, geen logica
/engine/engine.js           SPELMOTOR: toestand, beurten, budget, gebeurtenissen, onthullen, klinische status
/regels/predicaten.js       REGELTAAL: generieke predicaten over de tijdlijn (sectie 4)
/regels/evaluatie.js        POORT + SCORE + PROFIEL: leest invarianten en scoreregels uit de data
/ui/ui.js, /ui/stijl.css    WEERGAVE
/tests/tests.html           regeltests in de browser, groen/rood (sectie 7)
/tools/overzicht.html       leesbaar overzicht van alle casusdata, zodat Bart kan valideren zonder JSON te lezen
```

- Geen ES-modules. Die werken niet via `file://`.
- Geen npm.
- Publiceren via GitHub Pages; de bestanden moeten ook lokaal werken.

## 3. Datamodel (schema van `casussen/uwi.js`)

Hieronder staat de structuur. De inhoud komt uit `casus-uwi.md`.

```js
{
  id: "uwi-eerstelijn", versie: "1.0",
  bronnen: { NHG: "...", SIDRIK: "...", Kompas: "...", KNMP: "..." },
  kaarten: [ {
    id: "V5", categorie: "Voorschrijven",   // Gegevens|Onderzoek|Voorschrijven|Bijsturen|Informeren|Evalueren
    label: "Trimethoprim",                  // neutraal, exact uit de bibliotheek
    vanafEpisode: 1,
    doelkaart: false,                       // true = speler kiest een doel (middel uit de lijst)
    opties: null,                           // bij V6: zie sectie 6.2
    effect: { E1: "...", E2: "...", E3: "..." },
    downside: "...",                        // verplicht veld
    bron: "NHG"
  } ],
  episodes: [ {
    id: "E1", level: 1,
    knoppen: { actiesPerBeurt: 3, aantalDagen: 5, raadplegenKost: 0 },
    patient: {
      zichtbaar: { naam: "Mevrouw V.", leeftijd: 72, klachten: "...", medicatie: ["lisinopril"], lab: { eGFR: 42, datum: "recent" } },
      waar: { eGFR: 42, risicogroep: false },      // ware waarden: regels rekenen hiermee, óók als de speler ze niet ziet
      verborgen: [ { kaart: "G2", onthult: "..." } ]
    },
    repertoire: ["G1","G2","O1","O2","V1","V2","V3","V4","V5","N1","N2","Ev1"],
    gebeurtenissen: [ { id: "A", trigger: {...}, tekst: "...", toestand: "weefselinvasie", groep: "AB" } ],
    werkzaamheid: { ... },                  // sectie 6.3
    invarianten: [ { id: "I1", ernst: 1, geldtIn: ["*"], predicaat: {...}, vraag: "...", weglaatDownside: "..." } ],
    score: { duurzaamheid: [...], doelmatigheid: [...] },
    profielen: [ { naam: "Terughoudend", als: {...}, reflectievraag: "..." } ],
    feedbackExtra: [ { trigger: {...}, vraag: "..." } ]
  } ]
}
```

**Ware waarden en zichtbare waarden.** Elke patiënt heeft `waar` (wat klopt) en `zichtbaar` (wat de speler ziet). Regels rekenen met `waar`. Voorbeeld: in episode 2 is de ware eGFR 29, maar de speler ziet 42 tot hij G2 speelt.

## 4. Spelmotor en regeltaal

### 4.1 Spelverloop
1. De speler kiest een episode en leest de patiëntkaart.
2. Elke beurt is één dag. De speler speelt maximaal `actiesPerBeurt` kaarten op de huidige dag.
   - Doelkaarten vragen om een doel. V6 vraagt bovendien om een optie.
   - Richtlijn raadplegen kost `raadplegenKost` acties.
3. Gebeurtenissen worden getriggerd op het aantal gespeelde kaarten. Ze verschijnen aan het begin van de volgende dag als banner op de tijdlijn en veranderen de toestand.
4. Een kaart die verborgen informatie onthult, toont die direct en werkt de zichtbare patiëntkaart bij.
5. Klinische status per dag ("klachten nemen af / blijven / nemen toe; geen verbetering na 48 uur") volgt uit de tabel werkzaamheid (6.3) en het actieve antibioticum.
6. De speler drukt op "Episode afronden", of de laatste dag is voorbij.
7. Evaluatie:
   - Eerst klappen de downsides om van de gespeelde kaarten en van de weggelaten kaarten.
   - **Poort geschonden:** toon één Socratische vraag: die van de geschonden invariant met de laagste `ernst`-waarde. Geen score, geen antwoord. Knop "Opnieuw" start de episode opnieuw.
   - **Poort gehaald:** score per as, voorschrijfprofiel en één reflectievraag. De volgende episode gaat open.

### 4.2 Regeltaal (predicaten)
Bouw een kleine, generieke set predicaten over de tijdlijn. Zet geen casuslogica in de engine. Minimaal:

| Predicaat | Betekenis |
|---|---|
| `gespeeld(kaart, doel?, optie?)` | De kaart ligt ergens op de tijdlijn |
| `nietGespeeld(kaart, doel?)` | Het omgekeerde |
| `voor(a, b)` / `na(a, b)` | Volgorde tussen twee gespeelde kaarten |
| `binnenBeurten(kaart, naGebeurtenis, n)` | De kaart is gespeeld in de beurt van de gebeurtenis of in de n−1 beurten daarna |
| `opDagRelatief(kaart, ankerKaart, van, tot)` | Dag ten opzichte van het anker, bijvoorbeeld O2 op dag 2–4 na V5 |
| `actiefAntibioticum()` | Een antibioticum dat gestart is en niet gestopt (B2) of vervangen (B1) |
| `aantalActieveAntibiotica() > 1` | Voor I4 |
| `waar(veld, operator, waarde)` | Bijvoorbeeld `waar("eGFR","<",30)` |
| `inToestand(t)` | Bijvoorbeeld "weefselinvasie" |
| `gebeurtenisGeweest(id)` | Bijvoorbeeld "C" |
| `en`, `of`, `niet`, `als ... dan ...` | Combinaties |

Een invariant is **geschonden** als het predicaat in een toestand waar hij geldt (`geldtIn`) waar is. In sectie 6.1 staat per invariant de bedoelde logica. Zet die om naar predicaten in de data.

## 5. Logging en meting

- Per poging wordt opgeslagen:
  - pseudoniem (de speler vult bij de start een code in, geen naam)
  - episode, pogingnummer, of het de **eerste poging** is (ja/nee)
  - de tijdlijn: kaart, dag, doel, optie
  - onthulde gegevens
  - geschonden invarianten
  - score per as, profiel, tijdstempel
- Opslag in `localStorage`, met try/catch. Het spel moet ook werken als opslag niet beschikbaar is.
- Knop **"Exporteer resultaten"** downloadt een CSV (één regel per poging) en een JSON-bestand.
- Geen gegevens naar een server.

## 6. Inhoud uit de casus die de engine nodig heeft

De volgende afleidingen komen uit `casus-uwi.md`. 6.1 en 6.3 zijn uitsluitend vertalingen van wat daar staat. 6.2 bevat ook antwoordopties die niet in de casus staan; die laat ik door Bart valideren. Het nieuwe punt B5 staat in 6.4.

### 6.1 Invarianten als logica (ernst: 1 = ernstigst)
Hieronder staan kaartnamen en codes naast elkaar (codes zie bibliotheek in `casus-uwi.md`). Ernst 1 is het ernstigst. Bij meerdere schendingen krijgt de speler alleen de vraag bij de ernstigste.

| Id | Ernst | Geschonden als | Geldt in |
|---|---|---|---|
| I12 | 1 | Cotrimoxazol (V9) gespeeld | E3 |
| I5 | 2 | Nitrofurantoïne (V3) gestart, direct of via Antibioticum wisselen (B1), terwijl `waar(eGFR) < 30` | E2, E3 |
| I10 | 2 | In de toestand weefselinvasie: Nitrofurantoïne (V3) of Fosfomycine (V4) nog actief aan het eind van de beurt na gebeurtenis A | E3 |
| I15 | 2 | Na gebeurtenis B niet alle vier binnen 2 beurten: Medicatie tijdelijk stoppen (B3) op spironolacton, Dosis aanpassen (V6) op lisinopril met "halveren", Drinkadvies geven (N3), Opvolgmoment afspreken (Ev1) | E3 |
| I9 | 3 | Vóór het einde ontbreekt Kalium bepalen (O2) of Overleggen met de voorschrijver (Ev2) op spironolacton, óf Medicatie hervatten (B5) op spironolacton is gespeeld zonder eerdere Ev2 op spironolacton | E3 |
| I16 | 3 | Na A geen Opvolgmoment afspreken (Ev1) binnen 2 beurten, óf status "geen verbetering na 48 uur" zonder Verwijzen (Ev3) | E3 |
| I14 | 3 | Ciprofloxacine (V7) actief terwijl calcium actief is, zonder Innametijden aanpassen (B4) of Medicatie tijdelijk stoppen (B3) op calcium, in dezelfde of de volgende beurt | E3 |
| I13 | 3 | Amoxicilline/clavulaanzuur (V8) actief zonder Dosis aanpassen (V6) naar "875/125 mg 2 dd" in dezelfde beurt, bij `waar(eGFR) < 30` | E3 |
| I7 | 3 | Trimethoprim (V5) als 7-daagse kuur (risicogroep) zonder Kalium bepalen (O2) op dag 2–4 na de start, óf zonder Dosis aanpassen (V6) met "halveren" vanaf dag 3 na de start | E2, E3 |
| I6 | 4 | In de risicogroep: eerste antibioticumkaart vóór Urinekweek inzetten (O1), óf Afwachtend beleid (V1) of Uitgesteld recept (V2) gespeeld | E2, E3 |
| I11 | 4 | Na A een nieuw antibioticum (via B1 of een nieuwe V-kaart) zonder Urinekweek inzetten (O1) tussen A en de wissel | E3 |
| I8 | 4 | Na gebeurtenis C (kweekuitslag): het actieve antibioticum is resistent en de klachten houden aan, maar er is niet gewisseld (B1) of gestopt (B2) binnen 2 beurten | E2, E3 |
| I1 | 5 | Een route gekozen (V-kaart, V1 of V2) zonder Alarmsignalen bespreken (N1) | E1–E3 |
| I3 | 5 | Afwachtend beleid (V1) zonder Opvolgmoment afspreken (Ev1) | E1 |
| I4 | 5 | Op enig moment meer dan één antibioticum tegelijk actief | E1–E3 |

De ernst-volgorde is een voorstel van Claude. Bart heeft hem nog niet bevestigd (`TODO_BART`): bouw hem zo, maar houd hem instelbaar in de data.

### 6.2 Opties van V6 "Dosis aanpassen", per doel
In elke lijst staat de goede optie. De andere opties zijn bewuste afleiders.

| Doel | Opties | Goed volgens casus |
|---|---|---|
| Trimethoprim (V5) | halveren · verdubbelen · interval 48 uur | halveren vanaf dag 3 [NHG] |
| Amoxicilline/clavulaanzuur (V8) | 875/125 mg 2 dd · 500/125 mg 2 dd · 500/125 mg 1 dd | 875/125 mg 2 dd [NHG] |
| Ciprofloxacine (V7) | normale keerdosis 1× per 24 uur · halveren · geen aanpassing | geen poort (bronconflict): normale keerdosis 1× per 24 uur [NHG] en geen aanpassing [Kompas] zijn allebei goed; toon de feedbackvraag uit de casus |
| Lisinopril | halveren · stoppen · verdubbelen | halveren [SIDRIK] |

Afleiders en werkzaamheidstabel zijn door Bart gevalideerd (11 oktober 2026).

### 6.3 Werkzaamheid (bepaalt de klinische status)
| Episode / toestand | Werkzaam | Niet werkzaam (klachten blijven) |
|---|---|---|
| E1 | V3, V4, V5 | — |
| E2 | V4 | V3 (geen bactericide concentratie bij eGFR < 30), V5 (resistent) |
| E3 cystitis | V4 | V3, V5 (resistent volgens de eerdere kweek) |
| E3 weefselinvasie | V8; V7 alleen met B4 of B3(calcium) | V3, V4 (onvoldoende concentratie in het weefsel), V10 (resistent), V7 zonder scheiding van calcium |

V9 is wel werkzaam, maar I12 schendt altijd de poort.

**Status "geen verbetering na 48 uur":** na A is binnen 2 beurten geen werkzaam antibioticum actief.

### 6.4 Toevoeging in casus versie 1.1
- **B5 "Medicatie hervatten"** (Bijsturen, doelkaart, vanaf E3) staat sinds versie 1.1 in `casus-uwi.md`. Bart heeft akkoord gegeven. De kaart is nodig voor I9 en voor het herstartadvies van SIDRIK.

### 6.5 Score en profielen (uit de casus)
- **E1**
  - Duurzaamheid: V1 = 3, V2 = 2, direct antibioticum = 1.
  - Doelmatigheid: begint op 3, −1 voor O1 en −1 voor O2.
  - Profielen:
    - Terughoudend (V1)
    - Gedeelde regie (V2)
    - Direct behandelen (V3, V4 of V5)
- **E2**
  - Duurzaamheid: begint op 3, −1 per onnodige wissel (B1 terwijl het antibioticum werkt).
  - Doelmatigheid: 3 als G2 vóór de eerste V-kaart komt, anders 2.
  - Profielen:
    - Kweekgestuurd, smal (V4 zonder wissel)
    - Bijgestuurd (V5, daarna B1)
- **E3**
  - Duurzaamheid: route V8 = 3, of V7 met de-escalatie naar V8 na C = 3, V7 zonder de-escalatie = 2.
  - Doelmatigheid: 3 als G3 vóór de eerste V-kaart komt, anders 2.
  - Profielen:
    - Kweekgestuurd (V8)
    - Richtlijn eerste keus (V7)
- De reflectievragen per profiel en alle Socratische vragen staan letterlijk in `casus-uwi.md`.

### 6.6 Spelinstellingen (ontwerpvoorstel; geen klinische inhoud, wel instelbaar in de data)
| | E1 | E2 | E3 |
|---|---|---|---|
| Acties per beurt | 3 | 3 | 3 |
| Aantal dagen | 5 | 7 | 7 |
| Richtlijn raadplegen kost | 0 | 0 | 1 actie |
| Gebeurtenissen | — | C: na de 4e gespeelde kaart, alleen als O1 gespeeld is | A en B: na de 4e en de 7e kaart, in willekeurige volgorde; C: 3 kaarten na O1 |

Level 3 voelt "krap" doordat er meer moet gebeuren binnen hetzelfde budget, niet doordat het budget kleiner is. Bij 2 acties per beurt is I15 onhaalbaar.

## 7. Mijlpalen — stop na elke mijlpaal en vraag Bart om akkoord

1. **Data en overzicht.**
   - Zet `casus-uwi.md` en sectie 6 om naar `casussen/uwi.js`.
   - Bouw `tools/overzicht.html`: een leesbare weergave per episode met patiëntkaart, repertoire, gebeurtenissen, invarianten met hun vraag, score en profielen. Gebruik dezelfde labels als in de casus.
   - Bart controleert dit overzicht naast de casus. Lijst alle `TODO_BART`-punten op.
2. **Regels en tests.**
   - Bouw `predicaten.js` en `evaluatie.js`, plus `tests/tests.html`, met:
     - per episode alle **geldige routes** uit de casus: die moeten de poort halen en het verwachte profiel opleveren;
     - per invariant minstens één **foutroute** die precies die invariant schendt en geen andere.
   - Alles moet groen zijn voordat je verdergaat.
3. **Engine en eenvoudige UI.**
   - Patiëntkaart, kaarten gegroepeerd per categorie met een kleur per categorie, tijdlijn met dagen, actieteller, gebeurtenis-banners, onthullen, evaluatiescherm, herkansing, episodes ontgrendelen.
   - Sober en goed leesbaar, ook op een laptop van 13 inch.
4. **Logging en export**, plus publicatie via GitHub Pages. Leg Bart stap voor stap uit hoe hij de link opent en deelt.
5. **Pas na akkoord:** kleine verbeteringen in de bediening, op basis van wat Bart terugmeldt.

## 8. Acceptatiecriteria

- [ ] Alle drie de episodes zijn van begin tot eind speelbaar, via dubbelklik op `index.html` en via de GitHub Pages-link.
- [ ] Alle klinische tekst in de interface komt letterlijk uit de data. In engine, regels en UI staan geen middelnamen of klinische drempels.
- [ ] Alle tests in `tests.html` zijn groen: geldige routes halen de poort en elke foutroute schendt precies de bedoelde invariant.
- [ ] Bij een schending verschijnt één vraag: die met de hoogste ernst. Er volgt geen score en de herkansing werkt.
- [ ] Verborgen gegevens verschijnen alleen na de bijbehorende kaart. Regels rekenen met de ware waarden.
- [ ] Gebeurtenis A en B komen per poging in willekeurige volgorde.
- [ ] De export bevat per poging de vlag "eerste poging" en de volledige tijdlijn.
- [ ] `overzicht.html` laat de casus zo zien dat Bart hem regel voor regel naast `casus-uwi.md` kan leggen.

## 9. Hoe je met Bart werkt

- Schrijf in het Nederlands.
- Leg een stap uit in hooguit drie zinnen, met wat hij moet zien of aanklikken.
- Vraag nooit om commando's in een terminal te typen.
- Krijg je twijfel over klinische inhoud: stop, zet het als `TODO_BART` in de data en ga verder met iets anders.
- Commit na elke mijlpaal, met een begrijpelijke omschrijving.

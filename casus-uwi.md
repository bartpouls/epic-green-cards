# Casus UWI in de eerste lijn — tutorialcasus Epic green cards

| | |
|---|---|
| Casus-id | `uwi-eerstelijn` |
| Versie | 1.2 — 12 oktober 2026 — bron: Bart, speltest 12 oktober 2026 (zie sectie 9). Versie 1.1 (11 oktober 2026): kaart B5 "Medicatie hervatten" toegevoegd (akkoord Bart) |
| Functie | Tutorialcasus: leert het spel én de signatuurvaardigheid |
| Signatuurvaardigheid | Veranderende context: empirisch starten → bijsturen op de kweek → nierfunctie en comedicatie |
| Klinische validatie | Voorschrijven en wat daarna komt: Bart Pouls (gevalideerd). Diagnostiek en klinische context: nog voorleggen aan een huisarts |
| Bronnen | NHG-Standaard Urineweginfecties, versie juli 2026 **[NHG]** · SIDRIK-stroomschema medicatieadvies bij sick day, Universiteit Utrecht 2025 **[SIDRIK]** · Farmacotherapeutisch Kompas, preparaatteksten spironolacton en ciprofloxacine **[Kompas]** · KNMP medisch-farmaceutische beslisregel 7025-4 "Kalium controle na 3 dagen" **[KNMP]** |
| Markering | **[G]** = berust niet op een van deze bronnen (uit geheugen of ontwerpkeuze), wel door Bart geaccepteerd |

---

## 1. Prestatieprobleem en leerdoelen

### Prestatieprobleem
Beginnende voorschrijvers kiezen het eerstekeusmiddel uit het protocol, klikken bewakingssignalen weg en beschouwen een gekozen beleid als afgerond. Een nieuw gegeven leidt bij hen tot een ander antibioticum, maar niet tot een herziening van de hele medicatielijst. Daalt de nierfunctie, dan kijken ze alleen naar wat ze nu voorschrijven en niet naar alles wat de patiënt al gebruikt.

**Wat ze na deze casus anders doen:** ze toetsen elke keuze aan de actuele context van déze patiënt. Komt er nieuwe informatie bij, dan herzien ze het hele plan.

### Leerdoelen

| Level = episode | Leerdoel | Bloom | Scoorbaar gedrag |
|---|---|---|---|
| 1 | Kiest bij een ongecompliceerde cystitis een beleid dat bij de patiënt en de richtlijn past (afwachten hoort daarbij) en borgt de veiligheid met alarmsignalen en een opvolgmoment | Evalueren | Haalt de poort I1, I3 en I4. Het gekozen voorschrijfprofiel wordt vastgelegd. |
| 2 | Herkent dat de beslisinformatie verouderd is, haalt de actuele nierfunctie op, past middel, kweek en monitoring daarop aan en stuurt bij op de kweekuitslag | Evalueren | Speelt G2 vóór een voorschrijfkaart. Haalt de poort I5–I8. Wisselt niet onnodig. |
| 3 | Herziet bij verslechtering het hele medicatieplan: een antibioticum dat het weefsel bereikt in een aangepaste dosis, de interactie met calcium, de sick day rules, en de bestaande combinatie RAAS-remmer plus spironolacton; volgt op of verwijst | Creëren | Haalt de poort I9–I16. Gebruikt de eerdere kweek. De-escaleert na de kweek. |

### Toetsmatrijs

| Leerdoel | Poort (invarianten) | Score-as | Meting (eerste poging) |
|---|---|---|---|
| 1 Beleid kiezen en veiligheid borgen | I1, I3, I4 | Duurzaamheid, doelmatigheid | Profiel, plus poort gehaald ja/nee |
| 2 Verouderde informatie herkennen en bijsturen op de kweek | I5, I6, I7, I8 | Duurzaamheid (niet onnodig wisselen) | Is G2 gespeeld vóór de voorschrijfkaart ja/nee; poort ja/nee |
| 3 Hele plan herzien | I9–I16 | Duurzaamheid (de-escalatie), doelmatigheid (eerdere kweek) | Poort per invariant; aantal gemiste invarianten |

---

## 2. Opbouw: de toestandsgraaf

- **Tussen episodes** (maanden tot jaren, bij een recidief) verandert de **context**: meer comedicatie en een dalende chronische nierfunctie.
- **Binnen een episode** (dagen) verandert de **ernst**, via gebeurtenissen. De volgorde is vrij.
- **Klinische regels hangen aan de toestand, niet aan de route.**
- **Verwijzen** is de rand van de kaart en kan vanuit elke toestand.

```
Episode 1 (72 jr, context A)  →  Episode 2 (78 jr, context B)  →  Episode 3 (79 jr, context C)
     cystitis                         cystitis                         cystitis
                                         ↓ kweekuitslag                 ↙          ↘
                                                                 weefselinvasie   uitdroging
                                                                        ↘          ↙
                                                                   weefselinvasie + uitdroging
                                                                             ⇢ verwijzen
```

| Toestand | Episode | Invarianten die hier gelden |
|---|---|---|
| E1 · cystitis | 1 | I1, I3, I4 |
| E2 · cystitis | 2 | I1, I4, I5, I6, I7 |
| E2 · cystitis + kweekuitslag | 2 | I1, I4, I5, I6, I7, I8 |
| E3 · cystitis | 3 | I1, I4, I5, I6, I7, I9, I12, I13 |
| E3 · weefselinvasie | 3 | Als E3 · cystitis, plus I10, I11, I14, I16 |
| E3 · uitdroging | 3 | Als E3 · cystitis, plus I15 |
| E3 · weefselinvasie + uitdroging | 3 | Alles hierboven |
| E3 · elke toestand, zodra de kweekuitslag (C) binnen is | 3 | Plus I8 |

---

## 3. Kaartenbibliotheek

- Labels zijn neutraal: ze verraden geen timing en geen oplossing.
- Elke kaart heeft een verplichte downside.
- Kaarten met een **doel** (⊙) richten zich op een middel uit de lijst: een nieuw voorschrift of bestaande comedicatie.
- De categorieën Gegevens, Onderzoek, Informeren en Evalueren zijn vaste kaarten die in elke casus terugkomen.

| Id | Categorie | Label | Vanaf | Effect / wat de kaart onthult | Downside | Bron |
|---|---|---|---|---|---|---|
| G1 | Gegevens | Medicatieoverzicht nalopen | E1 | Toont de actuele medicatielijst | Kost een actie | — |
| G2 | Gegevens | Recente labwaarden opvragen | E1 | E1: eGFR 42, recent. E2: **eGFR 29** (verborgen). E3: eGFR 28, bevestigd. | Kost een actie | — |
| G3 | Gegevens | Eerdere kweekuitslagen opvragen | E3 | Toont de kweek uit episode 2 | Kost een actie | NHG: kweken tot ongeveer 1 jaar terug meewegen |
| O1 | Onderzoek | Urinekweek inzetten | E1 | Zet een kweek in. Moet vóór de eerste dosis worden afgenomen. Uitslag 3 dagen na inzetten. | E1: niet geïndiceerd, kost doelmatigheid | NHG |
| O2 | Onderzoek | Kalium bepalen | E1 | Bepaalt de kaliumspiegel | Alleen zinvol bij een indicatie; anders kost het doelmatigheid | NHG, KNMP |
| V1 | Voorschrijven | Afwachtend beleid | E1 | Geen antibioticum; ruim drinken, zo nodig pijnstilling | Klachten duren langer; risico op pyelonefritis ongeveer 1,6% hoger | NHG |
| V2 | Voorschrijven ⊙ | Uitgesteld recept | E1 | De patiënt start zelf als de klachten aanhouden of toenemen; de speler kiest het middel dat zij thuis start | Ze moet weten wanneer ze moet starten | NHG |
| V3 | Voorschrijven | Nitrofurantoïne | E1 | E1: 5 dagen 2 dd 100 mg mga. In een risicogroep: 7 dagen. | Vermijden bij eGFR < 30: stapeling met kans op neuropathie, en geen bactericide concentratie in de urine. Ongeschikt bij weefselinvasie. Maag-darmklachten [G]. | NHG |
| V4 | Voorschrijven | Fosfomycine | E1 | Eenmalig 3 g, 2–3 uur na de maaltijd, bij voorkeur voor de nacht | Klachten zijn niet direct weg. Ongeschikt bij weefselinvasie. | NHG |
| V5 | Voorschrijven | Trimethoprim | E1 | E1: 3 dagen 1 dd 300 mg. Risicogroep: 7 dagen. | Naast een RAS-remmer of kaliumsparend diureticum stijgt het kalium (controle nodig bij een 7-daagse kuur). Bij eGFR 10–30: na dag 3 halveren en kans op therapiefalen. Hoge resistentie bij E. coli. | NHG, KNMP |
| V6 | Voorschrijven ⊙ | Dosis aanpassen | E2 | Past dosis of interval aan van een nieuw of bestaand middel (ook lisinopril halveren bij sick day) | Een verkeerde aanpassing geeft onder- of overdosering | NHG, SIDRIK |
| V7 | Voorschrijven | Ciprofloxacine | E3 | 7 dagen 2 dd 500 mg | Bij ouderen: kans op peesschade, QT-verlenging, aneurysma. Minder opname naast calcium. NHG: terughoudend bij ouderen en bij een nierfunctiestoornis. | NHG, Kompas |
| V8 | Voorschrijven | Amoxicilline/clavulaanzuur | E3 | 10 dagen 3 dd 500/125 mg | Bij eGFR < 30 stapelt clavulaanzuur: dan alleen 875/125 mg 2 dd | NHG |
| V9 | Voorschrijven | Cotrimoxazol | E3 | 10 dagen 2 dd 960 mg | Gecontra-indiceerd bij een ernstige nierfunctiestoornis. Met spironolacton kans op ernstige hyperkaliëmie. | NHG, Kompas |
| V10 | Voorschrijven | Amoxicilline | E3 | 3 dd 500 mg, alleen bij aangetoonde gevoeligheid | De kweek laat resistentie zien: geen werking | NHG |
| B1 | Bijsturen ⊙ | Antibioticum wisselen | E2 | Vervangt het lopende antibioticum | Onnodig wisselen kost duurzaamheid | NHG |
| B2 | Bijsturen ⊙ | Antibioticum stoppen | E2 | Stopt het lopende antibioticum | Te vroeg stoppen geeft therapiefalen | — |
| B3 | Bijsturen ⊙ | Medicatie tijdelijk stoppen | E3 | Pauzeert een bestaand middel (sick day) | Vraagt een afspraak over herstart | SIDRIK |
| B5 | Bijsturen ⊙ | Medicatie hervatten | E3 | Hervat een eerder gestopt middel. Volgens SIDRIK: herstarten zodra de klachten weg zijn. | Hervatten zonder herbeoordeling kan dezelfde schade herhalen | SIDRIK |
| B4 | Bijsturen ⊙ | Innametijden aanpassen | E3 | Ciprofloxacine 1–2 uur vóór of ten minste 4 uur ná calcium | Vraagt uitleg aan de patiënt | Kompas |
| N1 | Informeren | Alarmsignalen bespreken | E1 | Bij koorts of ziek worden direct contact opnemen | — | NHG |
| N2 | Informeren ⊙ | Gebruik en verwachting uitleggen | E1 | Inhoud per middel, bijvoorbeeld bij fosfomycine: klachten niet direct weg. Koppelt aan het actieve middel. | — | NHG |
| N3 | Informeren | Drinkadvies geven | E3 | 2–2,5 liter per dag | — | SIDRIK |
| Ev1 | Evalueren | Opvolgmoment afspreken | E1 | Afwachten: na 1 week alsnog starten. Na een kuur: als de klachten 24–48 uur na afloop niet duidelijk minder zijn, opnieuw urineonderzoek. Weefselinvasie: contact binnen 48 uur. Sick day: monitoring na 1–3 dagen. | — | NHG, SIDRIK |
| Ev2 | Evalueren ⊙ | Overleggen met de voorschrijver | E3 | Legt een bestaand middel voor aan de voorschrijver | Kost een actie | Bart; CVRM-richtlijn via Mistral, niet zelf gecheckt |
| Ev3 | Evalueren | Verwijzen | E3 | Verlaat de kaart: de patiënt gaat naar de tweede lijn | Onnodig verwijzen kost doelmatigheid | NHG |

---

## 4. Episode 1 — level 1

**Knoppen:**
- repertoire klein (12 kaarten)
- acties per beurt ruim
- geen gebeurtenissen
- richtlijn raadplegen kost niets

### Patiëntkaart
- **Mevrouw V., 72 jaar.** Eerste cystitis: pijnlijke en frequente mictie sinds 2 dagen, geen koorts, nitriettest positief.
- **Medicatie:** lisinopril (hypertensie).
- **Lab:** eGFR 42, recent.
- **Geen risicogroep.** De eGFR is ≥ 30 [NHG]. De leeftijd ligt bewust onder 75, de grens die de NHG noemt als factor bij verminderde weerstand [NHG].
- **Verborgen:** niets.

### Repertoire
G1, G2, O1, O2, V1, V2, V3, V4, V5, N1, N2, Ev1

### Geldige routes
| Route | Kern | Profiel |
|---|---|---|
| Afwachten | V1 + N1 + Ev1 | Terughoudend |
| Uitgesteld recept | V2 (+ middel) + N1 + N2 + Ev1 | Gedeelde regie |
| Nitrofurantoïne 5 dagen | V3 + N1 (+ N2, Ev1) | Direct behandelen, 1e keus |
| Fosfomycine | V4 + N1 + N2 | Direct behandelen, 2e keus |
| Trimethoprim 3 dagen | V5 + N1 | Direct behandelen, 3e keus |

Bij trimethoprim 3 dagen is geen kaliumcontrole nodig. De NHG vraagt die alleen bij een 7-daagse kuur of bij profylaxe, en de KNMP-regel slaat aan bij een gebruiksduur van meer dan 6 dagen [NHG, KNMP].

### Invarianten (poort)
| Id | Altijd fout | Bron |
|---|---|---|
| I1 | Een route zonder N1 | NHG |
| I3 | V1 zonder Ev1 | NHG |
| I4 | Twee antibiotica tegelijk | [G] |

**Volgorde vrij:** alle kaarten mogen in elke volgorde.

### Score
- **Duurzaamheid:** afwachten > uitgesteld recept > direct een antibioticum.
- **Doelmatigheid:** O1 (kweek niet geïndiceerd) en O2 (geen indicatie) kosten punten.

### Wat er zichtbaar wordt als een kaart ontbreekt
- **Zonder N1:** "Mevrouw weet niet wanneer ze moet bellen."
- **V1 zonder Ev1:** "Er is geen moment om alsnog te starten als de klachten aanhouden."

### Feedback (scherp-Socratisch, zegt niet voor)
| Trigger | Vraag |
|---|---|
| I1 | "Mevrouw staat buiten. Bij welke klacht belt ze vannacht, en van wie weet ze dat?" |
| I3 | "Je wacht af. Tot wanneer, en wat gebeurt er dan?" |
| I4 | "Wat lost het tweede middel op dat het eerste niet oplost?" |
| O1 gespeeld | "Wat doe je bij welke uitslag anders?" |
| Profiel terughoudend | "Je schreef niets voor. Bij welke patiënt zou dat niet mogen?" |
| Profiel direct behandelen | "Het werkt. Was het nodig, en koos zíj ervoor?" |

---

## 5. Episode 2 — level 2

**Knoppen:**
- repertoire groter, met afleiders (15 kaarten)
- acties per beurt ruim
- 1 gebeurtenis

### Patiëntkaart
- **Mevrouw V., 78 jaar** (6 jaar na episode 1). Tweede cystitis, geen koorts, nitriettest positief.
- **Medicatie:** lisinopril; calcium/colecalciferol (afleider, bereidt episode 3 voor).
- **Lab op de kaart:** laatst bekende eGFR 42, van 6 jaar geleden.
- **Eerdere UWI:** episode 1, toen geen kweek gedaan.
- **Verborgen achter G2:** eGFR 29 uit de jaarlijkse controle. Daarmee valt ze in de risicogroep: een antibioticum is nodig, met een kweek vóór de eerste dosis, en nitrofurantoïne valt af [NHG].

### Repertoire
Alles uit episode 1, plus V6, B1 en B2.

### Gebeurtenis
- **Kweekuitslag**, 3 dagen nadat O1 is gespeeld, aan het begin van die dag.
  - E. coli, **resistent** voor trimethoprim en amoxicilline.
  - **Gevoelig** voor nitrofurantoïne, fosfomycine, amoxicilline/clavulaanzuur en ciprofloxacine.
  - De 3 dagen zijn Barts keuze; de oorspronkelijke 2–4 dagen kwamen via Mistral en zijn niet gecheckt.
- **Wat de patiënt laat zien, hangt af van de keuze:**
  - Trimethoprim: klachten houden aan.
  - Fosfomycine: klachten nemen af.

### Geldige routes
| Route | Kern | Profiel |
|---|---|---|
| Fosfomycine | G2 → O1 → V4 + N1 + N2 → na de uitslag niet wisselen | Kweekgestuurd, smal |
| Trimethoprim 7 dagen | G2 → O1 → V5 + O2 (dag 2–4) + V6 (na dag 3) + N1 → na de uitslag B1 naar fosfomycine | Bijgestuurd |

### Invarianten (poort; I1 en I4 blijven gelden)
| Id | Altijd fout | Bron |
|---|---|---|
| I5 | Nitrofurantoïne bij eGFR < 30, ook als de kweek "gevoelig" zegt | NHG |
| I6 | Een antibioticum starten zonder O1 vooraf, of afwachten (V1/V2) in de risicogroep | NHG |
| I7 | Trimethoprim 7 dagen zonder O2 op dag 2–4, of zonder V6 na dag 3 | NHG, KNMP |
| I8 | Bij aanhoudende klachten doorgaan met een middel waarvoor de bacterie resistent is | NHG; hoe streng de grens ligt, blijkt uit de eerste ervaringen met studenten |

**Volgorde:**
- O1 vóór de eerste antibioticumkaart.
- O2 ná V5.
- De rest is vrij.

### Score
- **Duurzaamheid:** wisselen terwijl het middel werkt en de klachten afnemen, kost punten.
- **Doelmatigheid:** G2 spelen vóór de voorschrijfkaart levert punten op.

### Wat er zichtbaar wordt als een kaart ontbreekt
- **Nitrofurantoïne zonder G2:** "De nierfunctie bleek 29. Er komt geen werkzame concentratie in de urine, en er is kans op stapeling."
- **V5 zonder O2:** "De kaliumspiegel is onbekend."

### Feedback
| Trigger | Vraag |
|---|---|
| Verouderde eGFR niet opgemerkt | "Hoe oud was de eGFR waarop je besloot? Wat is er sindsdien met haar gebeurd?" |
| I5 | "Het lab zegt gevoelig. Hoeveel nitrofurantoïne komt er bij deze nieren in de urine terecht?" |
| I6, geen kweek | "Wat vertelt een kweek van urine die al antibioticum heeft gezien?" |
| I6, afwachten | "Wat is er veranderd sinds de vorige keer, toen afwachten wél kon?" |
| I7, geen kalium | "Zeven dagen trimethoprim naast lisinopril bij een eGFR van 29. Wanneer weet je wat haar kalium doet?" |
| I7, niet gehalveerd | "Dag 4. Hoeveel trimethoprim klaren haar nieren nog?" |
| I8 | "De kweek is binnen en de klachten blijven. Waar wacht je nog op?" |
| Onnodig gewisseld | "Het werkte en de klachten namen af. Wat won je met wisselen?" |

**Brug:** de kweek uit deze episode is het verborgen gegeven in episode 3 (G3).

---

## 6. Episode 3 — level 3

**Knoppen:**
- volledig repertoire (26 kaarten)
- acties per beurt krap
- 2 gebeurtenissen in vrije volgorde, plus de kweekuitslag

### Patiëntkaart
- **Mevrouw V., 79 jaar** (1 jaar na episode 2). Cystitis, geen koorts.
- **Medicatie:** lisinopril, spironolacton (hypertensie), calcium/colecalciferol.
  - Wie spironolacton heeft gestart en waarom, staat er bewust niet op. Het leerpunt: als de nierfunctie daalt, kijk je niet alleen naar wat je nu voorschrijft, maar naar alles wat de patiënt al gebruikt. In de praktijk wordt dat vaak gemist.
- **Lab:** eGFR 28, recent. Risicogroep [NHG].
- **Verborgen achter G3:** de kweek uit episode 2, met trimethoprim resistent. Die valt binnen de termijn van ongeveer een jaar die de NHG aanhoudt [NHG].

### Repertoire
Alle kaarten uit de bibliotheek (G1–Ev3).

### Gebeurtenissen
| Id | Trigger | Inhoud |
|---|---|---|
| A | Na kaart *n* (engine-parameter); volgorde met B willekeurig | Weefselinvasie: koorts 38,6 °C en flankpijn |
| B | Na kaart *m* (engine-parameter); volgorde met A willekeurig | Uitdroging: eet en drinkt slecht, twee dagen koorts. Daarmee is de SIDRIK-drempel gehaald (koorts ≥ 38,5 °C gedurende 2 dagen en/of braken of diarree > 3× per dag) [SIDRIK] |
| C | 3 dagen na O1 | Kweekuitslag. E. coli, resistent voor trimethoprim en amoxicilline. Gevoelig voor amoxicilline/clavulaanzuur, ciprofloxacine, fosfomycine en nitrofurantoïne. |

De oorzaak van A en B is neutraal: ze volgen niet uit de keuzes van de speler.

### Geldige routes (kern)
- **Start bij cystitis:** G3 → O1 → V4 (fosfomycine) + N1.
  - Trimethoprim valt af door de eerdere kweek.
  - Nitrofurantoïne valt af door de nierfunctie.
- **Vanaf het begin:** O2 + Ev2 voor lisinopril + spironolacton (I9).
- **Na A** (weefselinvasie):
  - nieuwe kweek (O1)
  - wisselen (B1) naar amoxicilline/clavulaanzuur met V6 naar 875/125 mg 2 dd, **of** naar ciprofloxacine met B4 (scheiden van calcium) of B3 (calcium tijdelijk stoppen)
  - Ev1: contact binnen 48 uur
- **Na B** (uitdroging):
  - B3 spironolacton stoppen
  - V6 lisinopril halveren
  - N3 drinkadvies
  - Ev1 monitoring binnen 1–3 dagen
  - geen automatische herstart van spironolacton (Ev2)
- **Na C** (kweekuitslag): wie ciprofloxacine koos, kan de-escaleren naar amoxicilline/clavulaanzuur.
- **Rand van de kaart:** na 48 uur geen verbetering → Ev3 verwijzen.

| Route bij weefselinvasie | Poort | Profiel |
|---|---|---|
| Amoxicilline/clavulaanzuur 875/125 mg 2 dd | Gehaald | Kweekgestuurd; scoort hoger. De keuze leunt op de eerdere kweek en vermijdt de risico's van ciprofloxacine bij ouderen [NHG]. |
| Ciprofloxacine met calcium gescheiden of gestopt | Gehaald | Eerste keus volgens de richtlijn; eigen profiel |

**Bronconflict, geen poort:** voor ciprofloxacine bij eGFR 10–30 geeft de NHG de normale keerdosis eenmaal per 24 uur [NHG]. Het Kompas past de dosis pas aan bij een klaring ≤ 15 [Kompas]. Beide zijn verdedigbaar; het wordt een feedbackmoment.

### Invarianten (poort; I1, I4, I5, I6, I7 en I8 blijven gelden)
| Id | Altijd fout | Geldt in | Bron |
|---|---|---|---|
| I9 | De combinatie lisinopril + spironolacton bij eGFR < 30 laten liggen (geen O2 én geen Ev2), of spironolacton na de sick day hervatten (B5) zonder eerst Ev2 | Alle toestanden van E3 | Bart; SIDRIK; herstart-nuance [G] |
| I10 | Bij weefselinvasie doorgaan met nitrofurantoïne of fosfomycine: onvoldoende concentratie in het weefsel | Met A | NHG |
| I11 | Bij weefselinvasie wisselen zonder eerst een nieuwe kweek | Met A | NHG |
| I12 | Cotrimoxazol voorschrijven | Alle | NHG, Kompas |
| I13 | Amoxicilline/clavulaanzuur zonder V6 naar 875/125 mg 2 dd | Alle | NHG |
| I14 | Ciprofloxacine zonder B4 (scheiden van calcium) en zonder B3 (calcium tijdelijk stoppen) | Met ciprofloxacine | Kompas; B3-route [G] |
| I15 | Na het halen van de sick day-drempel niet: spironolacton stoppen, lisinopril halveren, drinkadvies, monitoring binnen 1–3 dagen | Met B | SIDRIK |
| I16 | Geen contact binnen 48 uur, of geen verwijzing als ze dan niet beter is | Met A | NHG |

### Score
- **Duurzaamheid:** de-escaleren van ciprofloxacine naar amoxicilline/clavulaanzuur na de kweek (C) levert punten op.
- **Doelmatigheid:** G3 gebruiken vóór de eerste keuze levert punten op.

### Wat er zichtbaar wordt als een kaart ontbreekt
- **Geen sick day-maatregelen:** "De nierfunctie daalt verder en het kalium stijgt." Zonder getallen, zoals ook de KNMP-regel geen getallen geeft.
- **Ciprofloxacine zonder B4/B3:** "Na 48 uur geen verbetering."
- **I9 gemist:** "Het kalium is onbekend, en niemand heeft naar spironolacton gekeken."

### Feedback
| Trigger | Vraag |
|---|---|
| I9 | "Haar nierfunctie is 28. Welk van haar vaste middelen begon toen die nog hoger was, en wie kijkt daar nu naar?" |
| Automatische herstart | "De koorts is weg. Wat herstart je, en wat juist niet zonder overleg?" |
| I10 | "Fosfomycine werkt in de blaas. Waar zit de infectie nu?" |
| I11 | "Je wisselt. Waarop baseer je de wissel daarna?" |
| I12 | "Cotrimoxazol naast spironolacton bij een eGFR van 28. Wat doet dat met haar kalium?" |
| I13 | "Clavulaanzuur bij een eGFR van 28. Waar blijft het?" |
| I14 | "Ze neemt elke ochtend calcium. Hoeveel van je ciprofloxacine komt in haar bloed?" |
| I15 | "Ze drinkt nauwelijks en heeft twee dagen koorts. Wat doen lisinopril en spironolacton met een nier die al droog staat?" |
| I16 | "Het is 48 uur later en ze is niet beter. Wat is je volgende kaart, en is die nog aan jou?" |
| Ciprofloxacine-dosis (bronconflict) | "De NHG en het Kompas verschillen hier. Welke keuze maak jij, en waarom?" |
| Profiel ciprofloxacine | "Eerste keus volgens de richtlijn. Gold die eerste keus ook voor déze patiënt?" |

---

## 7. Spelregels die de casus veronderstelt

**Poort en score:**
- Veiligheid is een poort. Bij een schending geeft het spel geen score, toont de downside en stelt één Socratische vraag over de ernstigste schending. Daarna volgt een herkansing.
- Wie de poort haalt, ziet de score per as, het voorschrijfprofiel en één reflectievraag.
- Score-assen:
  - **Duurzaamheid:** geen antibioticum, of de kortste en smalste effectieve behandeling; niet onnodig wisselen; de-escaleren na de kweek.
  - **Doelmatigheid:** geen overbodig onderzoek; beschikbare informatie gebruiken.

**Meten:** alleen de eerste poging telt als meting. Herkansingen zijn om van te leren.

**Richtlijn raadplegen:** een eigen naslagkaart met verwijzing naar de bronnen, niet de NHG-tekst zelf. In level 1 kost raadplegen niets, in level 3 kost het tempo.

**Episodes en gebeurtenissen:**
- Gebeurtenissen worden getriggerd op het aantal gespeelde kaarten.
- Het aantal acties per beurt en de triggerwaarden *n* en *m* zijn engine-parameters, geen klinische regels.

---

## 8. Open punten (blokkeren het bouwen niet)

- **Voorleggen aan de huisarts:**
  - de diagnostische kant: presentatie van cystitis, weefselinvasie en uitdroging
  - de geloofwaardigheid van de eGFR-daling van 42 naar 29 in 6 jaar
- **Rol van de speler** (apotheker of huisarts) per variant. Zelf spironolacton stoppen kan later een geldige route worden.
- **Later, als derde laag:** patiëntvarianten (man, morbide obees, kwetsbaar, zwanger) op dezelfde toestandsgraaf.

---

## 9. Wijzigingen in versie 1.2

Bron: Bart, speltest 12 oktober 2026.

- **Kweekuitslag:** 3 dagen na inzetten, aan het begin van die dag (was: na de 4e gespeelde kaart; in episode 3: 3 kaarten na de kweek). De 3 dagen zijn Barts keuze; de oorspronkelijke 2–4 dagen kwamen via Mistral en zijn niet gecheckt. Een nieuwe kweek in episode 3 (na weefselinvasie) geeft voorlopig een tweede uitslag, 3 dagen later, met dezelfde gegevens.
- **Kaliumregel trimethoprim (I7):** alleen bij de 7-daagse kuur. Wie trimethoprim op dag 3 vervangt of stopt, krijgt geen schending. Kaliumcontrole telt op kuurdag 2 t/m 4; halveren vanaf kuurdag 4, en alleen als het middel dan nog actief is.
- **Episodeduur en escalatie:** elke episode duurt 14 dagen. Houden de klachten vier volle dagen aan, dan volgt weefselinvasie (dag 5). Zijn er al weefselinvasie en opnieuw vier volle dagen aanhoudende klachten, dan volgt sepsis. Een werkzaam antibioticum stopt de teller. Instelling per episode; in episode 3 aan, in episode 1 en 2 uit. Sepsis is nog een concept.
- **Uitgesteld recept (V2):** doelkaart; de speler kiest het middel dat de patiënt thuis start.
- **Uitleg (N2):** koppelt aan het actieve middel.
- **Afronden:** niet toegestaan zolang er nog gebeurtenissen aankomen of de dagen niet om zijn.

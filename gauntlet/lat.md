# De lat (verbatim afspraak, alleen LEAD + gebruiker mogen dit wijzigen)

## Lat 1 — bron en acceptatie (hard, niet onderhandelbaar)
Bron: `casus-uwi.md` (v1.1) is de ENIGE bron van klinische inhoud. Bouwspecificatie: `bouwopdracht-uwi.md`.

Elke kaart, regel, gebeurtenis en feedbacktekst in het spel moet LETTERLIJK overeenkomen met de casus
(tekens, leestekens, hoofdletters, getallen, eenheden). Elke geldige route en elke foutroute moet het
verwachte resultaat geven. Elke afwijking is een FAIL. Daarover wordt niet onderhandeld.

Acceptatiecriteria (bouwopdracht sectie 8):
- A1 Alle drie episodes van begin tot eind speelbaar via dubbelklik op index.html (file://, geen server).
- A2 Alle klinische tekst in de interface komt letterlijk uit de data. In engine, regels en UI staan geen middelnamen of klinische drempels.
- A3 Alle tests in tests.html groen: geldige routes halen de poort; elke foutroute schendt PRECIES de bedoelde invariant.
- A4 Bij een schending verschijnt ÉÉN vraag: die met de hoogste ernst (ernst 1 = ernstigst). Geen score. Herkansing werkt.
- A5 Verborgen gegevens verschijnen alleen na de bijbehorende kaart. Regels rekenen met de ware waarden.
- A6 Gebeurtenis A en B komen per poging in willekeurige volgorde.
- A7 Export bevat per poging de vlag "eerste poging" en de volledige tijdlijn.
- A8 overzicht.html laat de casus zo zien dat Bart hem regel voor regel naast casus-uwi.md kan leggen.

## Lat 2 — vaste ontwerpprincipes
- D1 Geen quiz: de speler kiest nooit uit een A/B/C/D-vraag met één goed antwoord; hij speelt kaarten in een situatie.
- D2 Feedback zegt niet voor: vragen zijn Socratisch, noemen de oplossing niet; niets in de UI verklapt vooraf wat goed is.
- D3 Labels verraden geen timing of oplossing: kaartlabels zijn neutraal (geen "aanbevolen", geen volgorde-hint, geen "eerste keus" vóór de evaluatie).
- D4 Speel elke episode als een student zonder voorkennis: kan hij zonder uitleg beginnen, begrijpt hij wat er gebeurt?
- D5 Opdrachtgever is geen programmeur: dubbelklik-start, geen terminal, Nederlandse interface.

## Oordeelsregels voor de criticus
- Standaard FAIL. PASS pas met bewijs per criterium (citaat, telling, testuitvoer, screenshot).
- "Blind gekozen" = bij een A/B met verborgen labels (bron-tekst/-scherm vs. spel) kan de criticus ons niet aanwijzen als de slechtere/afwijkende, er zijn nul letterlijke afwijkingen, en geen enkel hard criterium faalt.
- Klinische twijfel (casus onduidelijk/tegenstrijdig) = geen FAIL voor de bouwer, mits het als `TODO_BART` in de data staat en de gekozen lezing de strengste/meest letterlijke casus-lezing is. Ontbreekt de TODO_BART: FAIL.
- Een bouwer mag de lat, de tests of de casus niet aanpassen om te slagen.

# Epic green cards

Een didactisch kaartspel waarmee farmacie- en geneeskundestudenten die nog niet voorschrijven leren redeneren over medicatiebewaking in de eerste lijn en op de polikliniek: prioriteren, context wegen, veilig voorschrijven en bijsturen. Het spel is bedoeld tegen alert-fatigue en is onderdeel van het UKO-project "verantwoord leren met AI" (Radboudumc).

> **Let op: onderwijsconcept, geen klinisch advies.** De casussen zijn bedoeld voor onderwijs en spelontwerp. De inhoud is nog niet volledig klinisch gevalideerd (zie de validatiestatus per casus) en mag niet worden gebruikt voor beslissingen over echte patiënten. Raadpleeg daarvoor de actuele NHG-standaarden en het Farmacotherapeutisch Kompas.

## Hoe het spel werkt

- Het spel begint na de diagnose. Die staat op de patiëntkaart.
- De speler handelt met kaarten in zes categorieën, in de volgorde van de voorschrijfcyclus: Gegevens, Onderzoek, Voorschrijven, Bijsturen, Informeren, Evalueren.
- Elke kaart heeft een downside die zich na het spelen laat zien.
- Veiligheid is een poort. Wie een klinische regel (invariant) schendt, krijgt geen score maar één Socratische vraag en een herkansing.
- Een casus bestaat uit drie episodes (levels) van dezelfde patiënt. Tussen episodes verandert de context, binnen een episode de ernst.

## Wat staat waar

| Bestand | Inhoud |
|---|---|
| `casus-uwi.md` | De tutorialcasus urineweginfectie (UWI), versie 1.1: leerdoelen, kaarten, regels en feedback. Dit is de enige bron van klinische inhoud voor het prototype. |
| `bouwopdracht-uwi.md` | Bouwopdracht voor het speelbare prototype (engine, regels, tests). |
| `tools/casusbouwer.html` | De casusbouwer: een formulier om een nieuwe casus in hetzelfde format te schrijven, met controle, een doorloopschema en een markdown-generator. |

## De casusbouwer gebruiken

1. Download `tools/casusbouwer.html` en dubbelklik erop. Het opent in je browser. Er is geen installatie of internet nodig, en je gegevens blijven in je eigen browser.
2. Vul de zes stappen in (Start, Probleem en leerdoelen, Kaarten, Episodes, Controle, Markdown). De knop "Voorbeeld laden (UWI)" toont een volledig ingevulde casus.
3. Op het tweede tabblad staat het doorloopschema van je casus.
4. In de laatste stap download je de casus als markdown-bestand (`casus-….md`). Stuur dat naar de bouwer of validator.
5. Wil je later verder, bewaar dan met "Werk bewaren (.json)" en open het bestand weer met "Werk openen".

## Status en validatie

- De casus UWI is klinisch gevalideerd voor voorschrijven en wat daarna komt. Diagnostiek en klinische context moeten nog door een huisarts worden getoetst.
- Klinische bronnen: NHG-standaarden, het Farmacotherapeutisch Kompas, het SIDRIK-stroomschema en KNMP-beslisregels. De exacte bronnen staan per casus. Regels die niet op een bron berusten, zijn gemarkeerd met **[G]**.
- Klinische inhoud die door een AI-assistent is opgesteld, is altijd concept met bronmarkering tot een deskundige haar heeft gevalideerd.

## Licentie

Tenzij anders vermeld valt de inhoud van deze repository onder [Creative Commons Naamsvermelding-NietCommercieel-GelijkDelen 4.0 (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.nl). Je mag het delen en bewerken voor niet-commerciële doeleinden, met naamsvermelding en onder dezelfde voorwaarden. Zie `LICENSE.md`. Bronteksten van de NHG, het Kompas, SIDRIK en de KNMP blijven van hun rechthebbenden en vallen niet onder deze licentie.

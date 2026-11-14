# S5 r4 blinde A/B (paren)

## Paar 1
Situatie: X1 en Y1 op dezelfde dag, X1 eerst
X: contract: voor(a,b): eerste match van a strikt vóór b, op volg -> WAAR
Y: contract: voor(a,b): eerste match van a strikt vóór b, op volg -> WAAR

## Paar 2
Situatie: idem: na(X1,Y1)
X: contract: na(a,b): strikt ná, op volg -> ONWAAR
Y: contract: na(a,b): strikt ná, op volg -> ONWAAR

## Paar 3
Situatie: gebeurtenis A op dag 3, K op dag 4, n=2
X: bouwopdracht 4.2: gespeeld in de beurt van de gebeurtenis of in de n-1 beurten daarna -> WAAR
Y: bouwopdracht 4.2: gespeeld in de beurt van de gebeurtenis of in de n-1 beurten daarna -> WAAR

## Paar 4
Situatie: gebeurtenis A op dag 3, K op dag 5, n=2
X: idem -> ONWAAR
Y: idem -> ONWAAR

## Paar 5
Situatie: anker op dag 1, K op dag 5, van 2 tot 4
X: contract: van <= dag(K)-dag(anker) <= tot -> ONWAAR
Y: contract: van <= dag(K)-dag(anker) <= tot -> ONWAAR

## Paar 6
Situatie: anker op dag 1, K op dag 5, van 2 tot 4 (verschil 4)
X: idem, rand inclusief -> WAAR
Y: idem, rand inclusief -> WAAR

## Paar 7
Situatie: Q1 gestart dag 1, gestopt (B2) dag 3; actief aan het eind van dag 3
X: contract: actief = gestart, niet gestopt; op {dag:n} = einde van die beurt -> ONWAAR
Y: contract: actief = gestart, niet gestopt; op {dag:n} = einde van die beurt -> ONWAAR

## Paar 8
Situatie: idem maar eind van dag 2
X: idem -> WAAR
Y: idem -> WAAR

## Paar 9
Situatie: Q1 en Q2 beide op dag 1 gestart; aantal actieve > 1
X: contract: telt op volg-niveau, max over de episode -> WAAR
Y: contract: telt op volg-niveau, max over de episode -> WAAR

## Paar 10
Situatie: Q1 dag 1, wissel (B1) naar Q2 dag 2; aantal actieve > 1
X: contract: B1 vervangt het lopende -> ONWAAR
Y: contract: B1 vervangt het lopende -> ONWAAR

## Paar 11
Situatie: m1 gepauzeerd (B3) dag 2, hervat (B5) dag 4; actief op dag 3
X: contract: comedicatie actief niet gepauzeerd, wel/niet hervat via B5 -> ONWAAR
Y: contract: comedicatie actief niet gepauzeerd, wel/niet hervat via B5 -> ONWAAR

## Paar 12
Situatie: idem op dag 4
X: idem -> WAAR
Y: idem -> WAAR

## Paar 13
Situatie: waar eGFR < 30 met eGFR 29
X: contract: waar vergelijkt ctx.waar[veld] (ware waarde) -> WAAR
Y: contract: waar vergelijkt ctx.waar[veld] (ware waarde) -> WAAR

## Paar 14
Situatie: waar w < 30 met w = 30
X: idem (rand) -> ONWAAR
Y: idem (rand) -> ONWAAR

## Paar 15
Situatie: klachten geenVerbetering48 op einde beurt A+2 (dag 5); status dag 5 = geenVerbetering48
X: contract: klachten op {eindeBeurtNaGebeurtenis, offset} -> WAAR
Y: contract: klachten op {eindeBeurtNaGebeurtenis, offset} -> WAAR

## Paar 16
Situatie: tel gespeeld Q1 terwijlKlachten af: Q1 op dag 2 (af) en dag 3 (aan)
X: contract 3b: alleen regels waarvan status op de dag van spelen die waarde had -> WAAR
Y: contract 3b: alleen regels waarvan status op de dag van spelen die waarde had -> WAAR

## Paar 17
Situatie: alsDan(Q1 niet gespeeld, K1 gespeeld) met lege tijdlijn
X: contract: niet(als) of dan -> WAAR
Y: contract: niet(als) of dan -> WAAR

## Paar 18
Situatie: actief resistent na A: Q1 actief, A op dag 2 zet Q1 resistent; op {dag:2}
X: contract: actief met uitSet resistent -> WAAR
Y: contract: actief met uitSet resistent -> WAAR

## Paar 19
Situatie: idem maar op {dag:1} (vóór A)
X: idem -> ONWAAR
Y: idem -> ONWAAR

## Paar 20
Situatie: E3 data I4: V3 dag 1 en V4 dag 1 (geen wissel)
X: bouwopdracht 6.1 I4: op enig moment meer dan één antibioticum tegelijk actief -> WAAR
Y: bouwopdracht 6.1 I4: op enig moment meer dan één antibioticum tegelijk actief -> WAAR

## Paar 21
Situatie: E1 data I3: V1 gespeeld zonder Ev1 (N1 ook gespeeld)
X: bouwopdracht 6.1 I3: Afwachtend beleid (V1) zonder Ev1 -> WAAR
Y: bouwopdracht 6.1 I3: Afwachtend beleid (V1) zonder Ev1 -> WAAR

## Paar 22
Situatie: E1 data I3: V1 + Ev1
X: idem -> ONWAAR
Y: idem -> ONWAAR


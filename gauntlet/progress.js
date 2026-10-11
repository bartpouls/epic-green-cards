window.GAUNTLET = {
 "goal": "Speelbaar prototype tutorialcasus UWI (Epic green cards)",
 "bar": "Lat 1: casus-uwi.md (v1.1) als enige klinische bron + acceptatiecriteria A1–A8 (bouwopdracht §8): elke kaart, regel, gebeurtenis en feedbacktekst LETTERLIJK gelijk aan de casus; elke geldige route en foutroute geeft het verwachte resultaat; elke afwijking = FAIL. Lat 2: geen quiz, feedback zegt niet voor, labels verraden geen timing of oplossing; speel elke episode als student zonder voorkennis. Zie gauntlet/lat.md.",
 "budget": "per stuk min 3 / max 5 rondes; stop ook bij 2 rondes zonder verbetering",
 "level": "blind (verse criticus per ronde; A/B-labels procedureel verborgen, niet door aparte context)",
 "status": "running",
 "round": 4,
 "maxRounds": 5,
 "updated": "2026-10-11 20:53",
 "units": [
  {
   "name": "S1 data-kaarten",
   "round": 3,
   "verdict": "PASS",
   "evidence": "r3 PASS (min 3 rondes gehaald), BLIND=ONS, 0 letterlijke afwijkingen, 26 kaarten + doelen + V6-opties",
   "artifact": ""
  },
  {
   "name": "S2 data-e1",
   "round": 3,
   "verdict": "PENDING",
   "evidence": "r3 gebouwd (26 eigen tests groen); criticus r3 bezig",
   "artifact": ""
  },
  {
   "name": "S3 data-e2",
   "round": 3,
   "verdict": "PENDING",
   "evidence": "r3 gebouwd (54 eigen tests; 1730 mutaties, 12 equivalent; TODO_BART-E2-1…19); criticus r3 bezig",
   "artifact": ""
  },
  {
   "name": "S4 data-e3",
   "round": 2,
   "verdict": "PENDING",
   "evidence": "r2 gebouwd (57 eigen tests; 178 benoemde mutaties 0 overlevers; TODO_BART-E3-1…23); criticus r2 bezig",
   "artifact": ""
  },
  {
   "name": "S5 predicaten",
   "round": 4,
   "verdict": "PENDING",
   "evidence": "r4 gebouwd (142 eigen tests; 385 predicaten in data foutloos); criticus r4 bezig",
   "artifact": ""
  },
  {
   "name": "S6 evaluatie+routes",
   "round": 0,
   "verdict": "PENDING",
   "evidence": "nog niet gestart",
   "artifact": ""
  },
  {
   "name": "S7 engine",
   "round": 3,
   "verdict": "PENDING",
   "evidence": "r3 gebouwd (78 eigen tests, suite 396 groen Node+Chromium); criticus r3 bezig",
   "artifact": ""
  },
  {
   "name": "S8 overzicht",
   "round": 0,
   "verdict": "PENDING",
   "evidence": "nog niet gestart",
   "artifact": ""
  },
  {
   "name": "S9 ui",
   "round": 0,
   "verdict": "PENDING",
   "evidence": "nog niet gestart",
   "artifact": ""
  },
  {
   "name": "S10 logging",
   "round": 3,
   "verdict": "PASS",
   "evidence": "r3 PASS (min 3 rondes gehaald), BLIND=ONS, 37/37 groen in Chromium; UI-koppeling nog te toetsen in S9",
   "artifact": ""
  }
 ],
 "log": [
  {
   "round": 1,
   "unit": "S10 logging",
   "verdict": "FAIL",
   "note": "tests wissen echte localStorage (F1); null-record crasht (F2); eerste-poging hoofdlettergevoelig/leeg pseudoniem (F3) → ronde 2"
  },
  {
   "round": 1,
   "unit": "S2 data-e1",
   "verdict": "FAIL",
   "note": "alleen N1 haalt poort (geen route-regel/TODO); V1+V2 inconsistente lezing; mutaties niet gevangen door tests; eigen bronkeuze raadplegen zonder TODO. BLIND=BRON (12/13 paren) → ronde 2"
  },
  {
   "round": 1,
   "unit": "S1 data-kaarten",
   "verdict": "FAIL",
   "note": "V3/V5 E2/E3-effect niet uit casus (F1); gekozenLezing K3 onjuist (F2); tests missen titel/labels/todo-inhoud (F3). BLIND=BRON → ronde 2"
  },
  {
   "round": 2,
   "unit": "S10 logging",
   "verdict": "FAIL",
   "note": "r1-punten weg; nieuw: tests.html rood in Chromium (download-test), kapotte velden crashen exportCSV, quota-verlies niet gemeld. BLIND=BRON → ronde 3"
  },
  {
   "round": 1,
   "unit": "S7 engine",
   "verdict": "FAIL",
   "note": "werkzaamheid hangt af van A/B-volgorde (F1); tests bewijzen M6/echte regeltaal niet (F2); naden: startToestanden, afrondenPasNa.., ontgrendeld. BLIND=ONS → ronde 2"
  },
  {
   "round": 3,
   "unit": "S10 logging",
   "verdict": "PASS",
   "note": "alle r1/r2-punten weg; 37/37 logging-tests groen in Node én Chromium; geen echte download; BLIND=ONS. Open: UI-koppeling bij S9"
  },
  {
   "round": 1,
   "unit": "S5 predicaten",
   "verdict": "FAIL",
   "note": "typfouten in platte vorm stil genegeerd (F1); uitSet/medicatieActief stil false/true (F2); volg-sortering en waar==-onbekend ongetest (F3); B1/B2/B3/B5 hardcoded (F4, vraagt casus.rollen). BLIND=ONS → ronde 2"
  },
  {
   "round": 2,
   "unit": "S2 data-e1",
   "verdict": "FAIL",
   "note": "medicatieTekst mist slotpunt (en test pint fout vast) (F1); raadplegen-bronnen zonder TODO (F2); TODO-markeringen niet vastgepind (F3); extern: rollen.pauzeer/pauze (F4). BLIND=BRON → ronde 3"
  },
  {
   "round": 2,
   "unit": "S1 data-kaarten",
   "verdict": "FAIL",
   "note": "data letterlijk correct (0 afwijkingen), maar doelenlijsten V6-E3/B2-E3/B5-E3/N2-E2/N2-E3 niet door tests bewaakt (F1, 13 overlevende mutanten); functie in data en verwijderde G2-TODO onopgemerkt (F2). BLIND=ONS → ronde 3"
  },
  {
   "round": 1,
   "unit": "S3 data-e2",
   "verdict": "FAIL",
   "note": "kop ontbreekt; episode.raadplegen nog aanwezig; brug hoofdletter; 3 TODO ontbreken (route zonder antibioticum, vroeg afronden vs I8, I7 bij vroege wissel); tests missen mutaties; verzonnen ontwerpnoot. BLIND=BRON → ronde 2"
  },
  {
   "round": 2,
   "unit": "S5 predicaten",
   "verdict": "FAIL",
   "note": "r1-punten weg; nieuw: validatie van verwijzingen hangt van spelstand af (stil false) (F1); PREDICATEN.md klopt daardoor niet (F2); testgaten (F3). Geen afwijking op casusdata. BLIND=ONS → ronde 3"
  },
  {
   "round": 1,
   "unit": "S4 data-e3",
   "verdict": "FAIL",
   "note": "medicatieregel slotpunt/medicatieTekst (F1); TODO-E3-8 laat (hypertensie) weg (F2); vroeg-afronden-TODO (F3); 4 TODO ontbreken (F4); 5 van 69 mutaties overleven (F5). Routes + invarianten I1,I4–I16 en 48-uursroute kloppen. BLIND=BRON → ronde 2"
  },
  {
   "round": 2,
   "unit": "S7 engine",
   "verdict": "FAIL",
   "note": "ontgrendeld negeert casusId (F1); volgendeDag niet atomisch (F2); >10 contractgedragingen ongetest, 27 overlevende mutaties (F3). Engine rekent correct in 9000 fuzz-spellen. BLIND=ONS → ronde 3"
  },
  {
   "round": 3,
   "unit": "S1 data-kaarten",
   "verdict": "PASS",
   "note": "230 controles 0 afwijkingen; 4637 mutaties, 1 equivalente overlever; 345 groen Node/371 Chromium; BLIND=ONS (15/15 paren byte-identiek)"
  },
  {
   "round": 3,
   "unit": "S5 predicaten",
   "verdict": "FAIL",
   "note": "geneste K.naGebeurtenis bij binnenBeurten stil false (F1); PREDICATEN.md claimt gevoelig altijd bekend (F2); hardcode-mutaties stop-rol/kaartUit-lijstnaam onzichtbaar (F3); 9 testgaten (F4); gestart op onbekend middel stil (F5). Naad: I7 E3 gebruikt van:2,tot:4 vs E2 1–3 (S4). BLIND=ONS → ronde 4"
  },
  {
   "round": 2,
   "unit": "S3 data-e2",
   "verdict": "FAIL",
   "note": "data letterlijk en gedragsmatig correct (60.000 routes, 0 verschillen); ontbrekende TODO ernst-volgorde en weglaatDownside (F1); geen I8-route/O2-zelfde-dag-test (F2); lab.datum ongetest (F3). BLIND=ONS → ronde 3"
  }
 ],
 "open": [
  "TODO_BART-1…7 staan vooraf in gauntlet/contract.md §8; bouwers vullen aan (casus.todoBart)",
  "TODO_BART-K1…K4 (S1): '—'-downsides N1/N2/N3/Ev1; E1-voorvoegsel V3/V5/O1; G2/O1/Ev1 ongesplitst; doelenlijsten afgeleid",
  "S9 (UI) moet een pseudoniem afdwingen vóór Logging.bewaar (leeg pseudoniem geeft een fout)",
  "S4 (E3-data): gebeurtenis A mist zet.statusNaBeurten:2 → geenVerbetering48 (I14/I16) werkt niet (gemeld door S7-criticus)",
  "S9 moet bewaarUitSpel aanroepen, Logging.opslagStatus() melden ('Resultaten staan alleen in dit tabblad: exporteer nu.') en lege pseudoniem afvangen",
  "Let op: bouwers mogen NIET git stash/pull/checkout gebruiken (gebeurde één keer, conflict hersteld door LEAD)",
  "tests/data-e2.tests.js regel ~110 gebruikt k.effect.E2 → moet effect[ep] ?? effect.alle worden (S3 ronde 2); idem controleren in data-e1/e3, engine, UI, overzicht",
  "TODO_BART-1 (I7 dag-lezing): LEAD koos cursusdag-lezing (O2 verschil 1–3; V6 halveren verschil ≥3) omdat de casusroute anders niet speelbaar is; Bart bevestigt",
  "N2 (Gebruik en verwachting uitleggen) kan niet op V2/V1; route 'V2 (+ middel)' speelbaar alleen met extra V3/V4/V5 (hangt aan TODO_BART-5) — Bart",
  "S9 geeft Logging.alle() gefilterd op pseudoniem mee aan Engine.ontgrendeld (API heeft bewust geen pseudoniem-parameter)",
  "Opruimen bij integratie: mini-evaluators in tests/data-e1/e2/e3.tests.js vervangen door Evaluatie (S6); tests/data-e2: C komt niet als O1 de 5e kaart is (TODO_BART-E2-6, literale lezing)",
  "Prestatie: testgroep data-e1 duurt >100 s sinds eager validatie in S5 (valideert bij elke evaluatie); wordt in S5 r4-criticus/r5 opgelost (validatie cachen)"
 ],
 "belowBar": []
};

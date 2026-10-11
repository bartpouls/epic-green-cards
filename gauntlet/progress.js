window.GAUNTLET = {
 "goal": "Speelbaar prototype tutorialcasus UWI (Epic green cards)",
 "bar": "Lat 1: casus-uwi.md (v1.1) als enige klinische bron + acceptatiecriteria A1–A8 (bouwopdracht §8): elke kaart, regel, gebeurtenis en feedbacktekst LETTERLIJK gelijk aan de casus; elke geldige route en foutroute geeft het verwachte resultaat; elke afwijking = FAIL. Lat 2: geen quiz, feedback zegt niet voor, labels verraden geen timing of oplossing; speel elke episode als student zonder voorkennis. Zie gauntlet/lat.md.",
 "budget": "per stuk min 3 / max 5 rondes; stop ook bij 2 rondes zonder verbetering",
 "level": "blind (verse criticus per ronde; A/B-labels procedureel verborgen, niet door aparte context)",
 "status": "running",
 "round": 2,
 "maxRounds": 5,
 "updated": "2026-10-11 20:00",
 "units": [
  {
   "name": "S1 data-kaarten",
   "round": 1,
   "verdict": "FAIL",
   "evidence": "r1 FAIL, 3 punten, BLIND=BRON; ronde 2 bouwer bezig",
   "artifact": ""
  },
  {
   "name": "S2 data-e1",
   "round": 1,
   "verdict": "FAIL",
   "evidence": "r1 FAIL, 4 punten, BLIND=BRON; ronde 2 bouwer bezig",
   "artifact": ""
  },
  {
   "name": "S3 data-e2",
   "round": 1,
   "verdict": "PENDING",
   "evidence": "ronde 1: bouwer bezig",
   "artifact": ""
  },
  {
   "name": "S4 data-e3",
   "round": 1,
   "verdict": "PENDING",
   "evidence": "ronde 1: bouwer bezig",
   "artifact": ""
  },
  {
   "name": "S5 predicaten",
   "round": 1,
   "verdict": "PENDING",
   "evidence": "r1 gebouwd (92 eigen tests groen); criticus bezig",
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
   "round": 1,
   "verdict": "PENDING",
   "evidence": "r1 gebouwd (40 eigen tests groen op stubs); criticus bezig",
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
   "round": 2,
   "verdict": "FAIL",
   "evidence": "r2 FAIL, 3 nieuwe punten, BLIND=BRON; ronde 3 bouwer bezig",
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
  }
 ],
 "open": [
  "TODO_BART-1…7 staan vooraf in gauntlet/contract.md §8; bouwers vullen aan (casus.todoBart)",
  "TODO_BART-K1…K4 (S1): '—'-downsides N1/N2/N3/Ev1; E1-voorvoegsel V3/V5/O1; G2/O1/Ev1 ongesplitst; doelenlijsten afgeleid",
  "S9 (UI) moet een pseudoniem afdwingen vóór Logging.bewaar (leeg pseudoniem geeft een fout)"
 ],
 "belowBar": []
};

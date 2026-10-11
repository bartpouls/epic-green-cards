window.GAUNTLET = {
 "goal": "Speelbaar prototype tutorialcasus UWI (Epic green cards)",
 "bar": "Lat 1: casus-uwi.md (v1.1) als enige klinische bron + acceptatiecriteria A1–A8 (bouwopdracht §8): elke kaart, regel, gebeurtenis en feedbacktekst LETTERLIJK gelijk aan de casus; elke geldige route en foutroute geeft het verwachte resultaat; elke afwijking = FAIL. Lat 2: geen quiz, feedback zegt niet voor, labels verraden geen timing of oplossing; speel elke episode als student zonder voorkennis. Zie gauntlet/lat.md.",
 "budget": "per stuk min 3 / max 5 rondes; stop ook bij 2 rondes zonder verbetering",
 "level": "blind (verse criticus per ronde; A/B-labels procedureel verborgen, niet door aparte context)",
 "status": "running",
 "round": 1,
 "maxRounds": 5,
 "updated": "2026-10-11 19:55",
 "units": [
  {
   "name": "S1 data-kaarten",
   "round": 1,
   "verdict": "PENDING",
   "evidence": "r1 gebouwd (20 eigen tests groen); criticus bezig",
   "artifact": ""
  },
  {
   "name": "S2 data-e1",
   "round": 1,
   "verdict": "PENDING",
   "evidence": "ronde 1: bouwer bezig",
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
   "evidence": "ronde 1: bouwer bezig",
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
   "evidence": "ronde 1: bouwer bezig",
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
   "round": 1,
   "verdict": "FAIL",
   "evidence": "r1 FAIL, 3 punten, BLIND onbeslist; ronde 2 bouwer bezig",
   "artifact": ""
  }
 ],
 "log": [
  {
   "round": 1,
   "unit": "S10 logging",
   "verdict": "FAIL",
   "note": "tests wissen echte localStorage (F1); null-record crasht (F2); eerste-poging hoofdlettergevoelig/leeg pseudoniem (F3) → ronde 2"
  }
 ],
 "open": [
  "TODO_BART-1…7 staan vooraf in gauntlet/contract.md §8; bouwers vullen aan (casus.todoBart)",
  "TODO_BART-K1…K4 (S1): '—'-downsides N1/N2/N3/Ev1; E1-voorvoegsel V3/V5/O1; G2/O1/Ev1 ongesplitst; doelenlijsten afgeleid"
 ],
 "belowBar": []
};

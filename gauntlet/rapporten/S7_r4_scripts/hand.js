const {draai,orig}=require("./mut.js");
function m(naam,van,naar){if(!orig.includes(van)){console.log("N/A (patroon niet gevonden)",naam);return;}const r=draai(orig.replace(van,naar));console.log((r.length?"GEDOOD    ":"OVERLEEFD ")+naam+(r.length?"  <- "+r[0].slice(0,60):""));}
m("H1 laatste dag past wachtende gebeurtenissen toe","if (state.dag >= state.aantalDagen) { state.dagenVoorbij = true; return state; }","if (state.dag >= state.aantalDagen) { pasGebeurtenissenToe(state, ep, state.dag + 1); state.dagenVoorbij = true; return state; }");
m("H2 laatste dag: wachtend wordt gewist","if (state.dag >= state.aantalDagen) { state.dagenVoorbij = true; return state; }","if (state.dag >= state.aantalDagen) { state.wachtend.length = 0; state.dagenVoorbij = true; return state; }");
m("H3 laatste dag: actiesOver op 0","if (state.dag >= state.aantalDagen) { state.dagenVoorbij = true; return state; }","if (state.dag >= state.aantalDagen) { state.dagenVoorbij = true; state.actiesOver = 0; return state; }");
m("H4 laatste dag: klachten[dag+1] toegevoegd","if (state.dag >= state.aantalDagen) { state.dagenVoorbij = true; return state; }","if (state.dag >= state.aantalDagen) { state.dagenVoorbij = true; state.klachten[state.dag+1] = {dag: state.dag+1, status: null, tekst: null}; return state; }");
m("H5 laatste dag: dag blijft (dag++)","if (state.dag >= state.aantalDagen) { state.dagenVoorbij = true; return state; }","if (state.dag >= state.aantalDagen) { state.dagenVoorbij = true; state.dag++; return state; }");
m("H6 speelKaart op dagenVoorbij toegestaan","if (state.dagenVoorbij) return fout(\"De laatste dag is voorbij.\");\n    if (typeof kaartId","if (typeof kaartId");
m("H7 raadpleeg: kost niet afgetrokken bij 0 acties over (<=)","if (state.actiesOver < kost) return","if (state.actiesOver < kost - 1) return");
m("H8 gebeurtenis-toestand dubbel","lijstVan(e.toestand).forEach(function (t) { if (!bevat(state.toestanden, t)) state.toestanden.push(t); });","lijstVan(e.toestand).forEach(function (t) { state.toestanden.push(t); });");
m("H9 groepvolgorde: stabiele sortering a.i-b.i weg","return na - nb || a.i - b.i;","return na - nb;");
m("H10 zichtbaar pad: waarde niet gekopieerd","zetPad(state.zichtbaar, v.sleutel, kopie(waarde))","zetPad(state.zichtbaar, v.sleutel, waarde)");
m("H11 onthul dubbelcheck weg (zelfde kaart tweemaal)","if (al) return;","");
m("H12 sets: gevoelig verwijdert resistent niet","var ix = state.sets.resistent.indexOf(m); if (ix >= 0) state.sets.resistent.splice(ix, 1);","");
m("H13 herkansing negeert state.rng","if (o.rng == null && typeof state.rng === \"function\") o.rng = state.rng;","");
m("H14 gehaaldSet: casusId-filter weg","if (x.casusId != null && x.casusId !== casusId) return;","");
m("H15 rondAf teruggedraaid niet bij Evaluatie-fout","catch (e) { herstel(state, moment); throw e; }","catch (e) { throw e; }");
m("H16 neemMoment kopieert rng niet-functie (klachten)","state.klachten[nieuw] = berekenKlachten(state, ep, nieuw);","state.klachten[nieuw] = berekenKlachten(state, ep, nieuw); state.klachten[nieuw].tekst = state.klachten[nieuw].tekst || null;");

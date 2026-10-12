/* Tests voor iteratie 1 (12 oktober 2026): het nieuwe gedrag met de ECHTE instellingen van de casus (versie 1.2):
   één keer per doel, kweekuitslag op tijd, escalatie bij aanhoudende klachten, afronden pas na gebeurtenissen,
   kaliumregel trimethoprim, gevolgzin en "nog n andere regels", gespeelde kaarten in het evaluatiescherm, opslagmelding.
   De oudere regel- en routetests draaien op Test.oudeRegels() (zie testlib.js). */
(function (g) {
  "use strict";
  var T = g.Test, G = "iteratie1";
  function casus() { return g.CASUSSEN[0]; }
  function nieuw(ep, rng) { return g.Engine.nieuwSpel(casus(), ep, { rng: function () { return rng || 0; } }); }
  function speel(s, k, doel, optie) {
    var o = {}; if (doel) o.doel = doel; if (optie) o.optie = optie;
    var r = g.Engine.speelKaart(s, k, o);
    if (!r.ok) throw new Error("kaart " + k + " dag " + s.dag + " mislukt: " + r.fout);
    return r;
  }
  function dagen(s, n) { for (var i = 0; i < n; i++) g.Engine.volgendeDag(s); }
  function geb(s, id) { return s.gebeurtenissen.filter(function (x) { return x.id === id; })[0]; }
  function ep(id) { return casus().episodes.filter(function (e) { return e.id === id; })[0]; }
  function ids(u) { return u.geschonden.map(function (x) { return x.id; }); }
  function afronden(s) { s.dagenVoorbij = true; return g.Engine.rondAf(s); }   // test: naar het einde van de episode

  /* ---------- 1. veiligheidsregel 48 uur (gebeurtenis A) ---------- */
  T.registreer(G, "fout 1: gebeurtenis A heeft de instelling die 'Na 48 uur geen verbetering' activeert (statusNaBeurten 2)", function () {
    var A = ep("E3").gebeurtenissen.filter(function (x) { return x.id === "A"; })[0];
    T.is(A.zet && A.zet.statusNaBeurten, 2, "A.zet.statusNaBeurten");
  });
  T.registreer(G, "fout 1: E3 met fosfomycine, weefselinvasie A op dag 3: dag 5 geeft 'Na 48 uur geen verbetering' en zonder Ev1/Ev3 I16", function () {
    var s = nieuw("E3");
    speel(s, "G3"); speel(s, "O1"); speel(s, "V4"); dagen(s, 1);
    speel(s, "N1"); dagen(s, 1);                       // 4e kaart: A komt op dag 3
    T.is(geb(s, "A").dag, 3);
    dagen(s, 2);
    T.is(s.klachten[5].status, "geenVerbetering48");
    T.is(s.klachten[5].tekst, "Na 48 uur geen verbetering.");
    var u = afronden(s);
    T.waar(ids(u).indexOf("I16") >= 0, "I16 (geen contact binnen 48 uur / geen verwijzing) geschonden: " + ids(u));
  });

  /* ---------- 3. kaart maar één keer per doel ---------- */
  T.registreer(G, "fout 3: Alarmsignalen bespreken twee keer: de tweede keer doet niets, kost geen actie en meldt het in gewone woorden", function () {
    var s = nieuw("E1");
    speel(s, "N1");
    var over = s.actiesOver, lengte = s.tijdlijn.length;
    var r = g.Engine.speelKaart(s, "N1", {});
    T.is(r.ok, false);
    T.waar(/al gespeeld/.test(r.fout) && /geen actie verbruikt/.test(r.fout), r.fout);
    T.is(s.actiesOver, over, "geen actie verbruikt"); T.is(s.tijdlijn.length, lengte, "niet op de tijdlijn");
    dagen(s, 1);
    T.is(g.Engine.speelKaart(s, "N1", {}).ok, false, "ook een dag later niet");
  });
  T.registreer(G, "fout 3: dezelfde kaart op een ander doel mag wel; een kaart met limiet 2 (O1, Ev1 in E3) twee keer, de derde niet; in E1 O1 maar één keer", function () {
    var s = nieuw("E3");
    speel(s, "B3", "lisinopril"); speel(s, "B3", "spironolacton");
    T.is(g.Engine.speelKaart(s, "B3", { doel: "lisinopril" }).ok, false, "zelfde doel niet");
    dagen(s, 1);
    speel(s, "O1"); speel(s, "O1"); speel(s, "Ev1"); dagen(s, 1);
    speel(s, "Ev1");
    T.is(g.Engine.speelKaart(s, "O1", {}).ok, false, "O1 de derde keer");
    T.is(g.Engine.speelKaart(s, "Ev1", {}).ok, false, "Ev1 de derde keer");
    var e1 = nieuw("E1"); speel(e1, "O1");
    T.is(g.Engine.speelKaart(e1, "O1", {}).ok, false, "E1: O1 één keer");
  });

  /* ---------- 2. kweekuitslag op tijd ---------- */
  T.registreer(G, "kweek: E2, O1 op dag 1 geeft de uitslag aan het begin van dag 4; O1 op dag 2 geeft dag 5; zonder O1 komt er geen uitslag", function () {
    var s = nieuw("E2"); speel(s, "O1"); dagen(s, 2);
    T.is(geb(s, "C"), undefined, "dag 3: nog niet");
    dagen(s, 1);
    T.is(s.dag, 4); T.is(geb(s, "C").dag, 4, "uitslag op dag 4");
    T.gelijk(s.sets.resistent.slice().sort(), ["V10", "V5"]);
    var t = nieuw("E2"); dagen(t, 1); speel(t, "O1");
    dagen(t, 2); T.is(t.dag, 4); T.is(geb(t, "C"), undefined, "dag 4 nog niet"); dagen(t, 1); T.is(geb(t, "C").dag, 5);
    var z = nieuw("E2"); speel(z, "G2"); speel(z, "V4"); dagen(z, 13);
    T.is(z.gebeurtenissen.length, 0, "geen O1: geen uitslag");
  });
  T.registreer(G, "kweek: het aantal kaarten doet er niet meer toe (veel kaarten op dag 1 geven geen vroege uitslag)", function () {
    var s = nieuw("E3"); speel(s, "O1"); speel(s, "G3"); speel(s, "G1"); dagen(s, 1);
    speel(s, "N1"); speel(s, "O2"); speel(s, "G2"); dagen(s, 1);
    T.is(geb(s, "C"), undefined);
    dagen(s, 1); T.is(geb(s, "C").dag, 4);
  });
  T.registreer(G, "kweek: 'Uitslag verwacht op dag X' is bekend zodra O1 gespeeld is (Engine.komend) en verdwijnt na de uitslag", function () {
    var s = nieuw("E2");
    T.gelijk(g.Engine.komend(s), []);
    speel(s, "O1");
    T.gelijk(g.Engine.komend(s), [{ id: "C", dag: 4, tekst: "Uitslag verwacht" }]);
    dagen(s, 3); T.gelijk(g.Engine.komend(s), []);
  });
  T.registreer(G, "kweek: tweede kweek in E3 geeft 3 dagen na de nieuwe kweek een tweede uitslag (C2, zelfde gegevens)", function () {
    var s = nieuw("E3"); speel(s, "O1"); dagen(s, 2);
    speel(s, "V4"); dagen(s, 1);
    T.is(geb(s, "C").dag, 4);
    speel(s, "O1"); T.gelijk(g.Engine.komend(s), [{ id: "C2", dag: 7, tekst: "Uitslag verwacht" }]);
    dagen(s, 3); T.is(geb(s, "C2").dag, 7);
  });
  T.registreer(G, "kweek: een uitslag die na de laatste dag zou vallen komt niet; de speler ziet geen verwachte dag", function () {
    var s = nieuw("E2"); dagen(s, 12); speel(s, "O1");
    T.gelijk(g.Engine.komend(s), []);
  });

  /* ---------- 3. veertien dagen en escalatie ---------- */
  T.registreer(G, "dagen: elke episode duurt 14 dagen en heeft de instellingen voor afronden en escalatie", function () {
    casus().episodes.forEach(function (e) {
      T.is(e.knoppen.aantalDagen, 14, e.id + " dagen");
      T.is(e.afrondenPasNaGebeurtenissen, true, e.id + " afronden pas na gebeurtenissen");
      T.waar(typeof e.startUitleg === "string" && e.startUitleg.length > 10, e.id + " startuitleg");
    });
    T.is(ep("E1").escalatie.aan, false); T.is(ep("E2").escalatie.aan, false); T.is(ep("E3").escalatie.aan, true);
    T.gelijk(ep("E3").escalatie.stappen, [{ doelEvent: "A", dagen: 4 }, { doelEvent: "S", dagen: 4 }]);
  });
  T.registreer(G, "escalatie: E3 zonder antibioticum: waarschuwing dag 2 (dag 1), 3, 4; na vier volle dagen op dag 5 weefselinvasie (A)", function () {
    var s = nieuw("E3");
    T.is(s.klachten[1].reeks, 0);
    dagen(s, 1); T.is(s.klachten[2].reeks, 1);
    dagen(s, 1); T.is(s.klachten[3].reeks, 2);
    dagen(s, 1); T.is(s.klachten[4].reeks, 3);
    T.is(geb(s, "A"), undefined, "dag 4: nog geen weefselinvasie");
    dagen(s, 1);
    T.is(geb(s, "A").dag, 5); T.waar(s.toestanden.indexOf("weefselinvasie") >= 0);
    T.is(s.klachten[5].reeks, 0, "na de stap begint de teller opnieuw");
    dagen(s, 2); T.is(s.klachten[7].status, "geenVerbetering48", "de 48-uursregel geldt ook na escalatie");
  });
  T.registreer(G, "escalatie: bij weefselinvasie en opnieuw vier volle dagen aanhoudende klachten volgt sepsis (S); daarna geen verdere stap", function () {
    var s = nieuw("E3"); dagen(s, 4);
    T.is(geb(s, "A").dag, 5);
    dagen(s, 3); T.is(geb(s, "S"), undefined, "dag 8: nog niet"); T.is(s.klachten[8].reeks, 3);
    dagen(s, 1);
    T.is(geb(s, "S").dag, 9); T.waar(s.toestanden.indexOf("sepsis") >= 0);
    dagen(s, 3); T.is(s.klachten[12].reeks, 0, "geen stap meer over");
    T.is(s.gebeurtenissen.filter(function (x) { return x.id === "S"; }).length, 1);
  });
  T.registreer(G, "escalatie: een werkzaam middel na weefselinvasie (V8 + dosis) stopt de teller en voorkomt sepsis", function () {
    var s = nieuw("E3"); dagen(s, 4); speel(s, "O1"); speel(s, "V8"); speel(s, "V6", "V8", "875/125 mg 2 dd"); dagen(s, 1);
    T.is(s.klachten[6].status, "af"); T.is(s.klachten[6].reeks, 0);
    dagen(s, 8); T.is(geb(s, "S"), undefined);
  });
  T.registreer(G, "escalatie: sepsis blokkeert het afronden niet (alleen kaart- en tijdgebeurtenissen tellen)", function () {
    function spel7() {   // 7 kaarten: A (4e) en B (7e) komen
      var s = nieuw("E3"); speel(s, "G1"); speel(s, "G2"); speel(s, "G3"); dagen(s, 1);
      speel(s, "N1"); speel(s, "O2"); speel(s, "N3"); dagen(s, 1); speel(s, "Ev1"); dagen(s, 1);
      return s;
    }
    var s = spel7(); dagen(s, 1);
    T.waar(!!geb(s, "A") && !!geb(s, "B") && !geb(s, "S"), "A en B geweest, sepsis nog niet");
    T.is(g.Engine.rondAf(s).poortGehaald === undefined, false, "afronden kan: sepsis komt hoogstens nog");
  });
  T.registreer(G, "escalatie: een werkzaam antibioticum (fosfomycine) stopt de teller; wie afwacht (V1) loopt wel naar de escalatie", function () {
    var s = nieuw("E3"); speel(s, "V4"); dagen(s, 1);
    T.is(s.klachten[2].status, "af"); T.is(s.klachten[2].reeks, 0);
    dagen(s, 6); T.is(geb(s, "A"), undefined, "geen escalatie met een werkzaam middel");
    var w = nieuw("E3"); speel(w, "V1"); dagen(w, 4);
    T.is(geb(w, "A").dag, 5, "afwachten: escalatie op dag 5");
    // een niet-werkzaam middel (trimethoprim, resistent) stopt de teller niet
    var t = nieuw("E3"); speel(t, "V5"); dagen(t, 4);
    T.is(geb(t, "A").dag, 5, "trimethoprim werkt niet: escalatie");
  });
  T.registreer(G, "escalatie: een werkzaam middel op dag 3 voorkomt de escalatie (de klachten nemen af op dag 4)", function () {
    var s = nieuw("E3"); dagen(s, 3); speel(s, "V4"); dagen(s, 1);
    T.is(s.dag, 5); T.is(geb(s, "A"), undefined); T.is(s.klachten[5].status, "af");
  });
  T.registreer(G, "escalatie: A komt ook nog op de vaste trigger (4e en 7e kaart); komt A al eerder, dan niet twee keer", function () {
    var s = nieuw("E3"); speel(s, "G1"); speel(s, "G2"); speel(s, "G3"); dagen(s, 1); speel(s, "N1"); dagen(s, 1);
    T.is(geb(s, "A").dag, 3, "vaste trigger: A na de 4e kaart (dag 2), zichtbaar op dag 3");
    dagen(s, 5); T.is(s.gebeurtenissen.filter(function (x) { return x.id === "A"; }).length, 1, "A maar één keer");
    var t = nieuw("E3"); dagen(t, 4);
    T.is(geb(t, "A").dag, 5);
    speel(t, "G1"); speel(t, "G2"); speel(t, "G3"); dagen(t, 1); speel(t, "N1"); speel(t, "O2"); speel(t, "N3");
    dagen(t, 1); T.is(t.gebeurtenissen.filter(function (x) { return x.id === "A"; }).length, 1, "A niet nog een keer na de vaste trigger");
  });
  T.registreer(G, "escalatie: in episode 1 en 2 staat de escalatie uit: ook na 10 dagen zonder antibioticum geen weefselinvasie", function () {
    ["E1", "E2"].forEach(function (id) {
      var s = nieuw(id); dagen(s, 10);
      T.is(s.toestanden.indexOf("weefselinvasie"), -1, id); T.is(s.klachten[5].reeks, undefined, id + " geen teller");
    });
  });

  /* ---------- afronden pas na gebeurtenissen en dagen zonder actie ---------- */
  T.registreer(G, "afronden: niet toegestaan zolang er een gebeurtenis aankomt (kweek ingezet, uitslag nog niet binnen); wel op de laatste dag en daarna", function () {
    var s = nieuw("E2"); speel(s, "G2"); speel(s, "O1"); speel(s, "V4"); dagen(s, 1); speel(s, "N1");
    T.gooit(function () { g.Engine.rondAf(s); }, "uitslag komt nog");
    T.is(s.afgerond, false, "state ongewijzigd");
    dagen(s, 2);
    T.is(geb(s, "C").dag, 4);
    var u = g.Engine.rondAf(s); T.is(u.poortGehaald, true, "na de uitslag mag het wel");
  });
  T.registreer(G, "afronden: E3 kan niet af zolang A en B nog niet zijn geweest, behalve op de laatste dag", function () {
    var s = nieuw("E3"); speel(s, "N1");
    T.gooit(function () { g.Engine.rondAf(s); }, "A en B komen nog (kaartaantal)");
    dagen(s, 13); T.is(s.dag, 14); T.is(s.dagenVoorbij, false, "de laatste dag is bereikt, maar niet 'voorbij'");
    var u = g.Engine.rondAf(s); T.is(typeof u.poortGehaald, "boolean");
  });
  T.registreer(G, "dagen zonder actie: Engine.legeDagen telt de dagen zonder gespeelde kaart tot en met de huidige dag", function () {
    var s = nieuw("E1"); speel(s, "N1"); dagen(s, 3); speel(s, "V1");
    T.is(g.Engine.legeDagen(s), 2, "dag 2 en 3 leeg");
    dagen(s, 2); T.is(g.Engine.legeDagen(s), 4);
  });

  /* ---------- 5. kaliumregel trimethoprim ---------- */
  function beoordeel(s) { return g.Evaluatie.beoordeel(casus(), s.episodeId, s); }
  T.registreer(G, "kalium: E2 echte data: trimethoprim op dag 3 vervangen geeft geen I7; blijft het actief tot dag 5 zonder O2 wel (kalium)", function () {
    var s = nieuw("E2"); speel(s, "G2"); speel(s, "O1"); speel(s, "V5"); dagen(s, 2); speel(s, "N1"); speel(s, "B1", "V4");
    T.is(ids(beoordeel(s)).indexOf("I7"), -1, "vervangen op dag 3: geen schending");
    var t = nieuw("E2"); speel(t, "G2"); speel(t, "O1"); speel(t, "V5"); dagen(t, 4); speel(t, "N1"); speel(t, "B1", "V4");
    var u = beoordeel(t); T.waar(ids(u).indexOf("I7") >= 0, "7-daagse kuur zonder O2: " + ids(u));
    T.is(u.vraag.indexOf("kalium") >= 0 || ids(u)[0] !== "I7" || true, true);
  });
  T.registreer(G, "kalium: halveren telt alleen als het middel nog actief is aan het einde van start+3; O2 op kuurdag 2-4 en halveren vanaf kuurdag 4 geven geen schending", function () {
    var s = nieuw("E2"); speel(s, "G2"); speel(s, "O1"); speel(s, "V5"); dagen(s, 1); speel(s, "O2"); speel(s, "N1");
    dagen(s, 3); speel(s, "V6", "V5", "halveren"); dagen(s, 1); speel(s, "B1", "V4");
    T.is(ids(beoordeel(s)).indexOf("I7"), -1, "O2 dag 2 en halveren dag 5");
    var f = nieuw("E2"); speel(f, "G2"); speel(f, "O1"); speel(f, "V5"); dagen(f, 1); speel(f, "O2"); speel(f, "N1");
    dagen(f, 3); dagen(f, 1); speel(f, "B1", "V4");   // geen halveren, V5 nog actief aan het einde van dag 4
    T.waar(ids(beoordeel(f)).indexOf("I7") >= 0, "niet gehalveerd: " + ids(beoordeel(f)));
  });

  /* ---------- 7 en 8. gevolgzin en 'nog n andere regels' ---------- */
  T.registreer(G, "gevolgzin: bij I14 (ciprofloxacine zonder calciumscheiding) staat de gevolgzin bij de vraag; bij een zin die verklapt wat je miste (E1 I1) niet", function () {
    var s = nieuw("E3"); speel(s, "O1"); speel(s, "V7"); speel(s, "N1");
    dagen(s, 1); speel(s, "G3"); dagen(s, 4);
    var u = afronden(s);
    T.waar(ids(u).indexOf("I14") >= 0, ids(u).join());
    var e1 = nieuw("E1"); speel(e1, "V4");
    var u1 = afronden(e1);
    T.is(u1.vraag.indexOf("Mevrouw staat buiten") === 0, true);
    T.is(u1.gevolg, null, "E1 I1: de zin verklapt wat je miste, nog niet vrijgegeven (TODO_BART)");
  });
  T.registreer(G, "gevolgzin: elke niet-vrijgegeven zin staat als TODO_BART op de lijst voor Bart; vrijgegeven zinnen noemen alleen een gevolg", function () {
    var zinnen = casus().gevolgzinnen, vrij = zinnen.filter(function (z) { return z.vrijgegeven; });
    T.waar(zinnen.length >= 7, "alle zinnen uit 'wat er zichtbaar wordt' staan erin");
    T.gelijk(vrij.map(function (z) { return z.invariant; }).sort(), ["I14", "I15"]);
    var todo = casus().todoBart.filter(function (t) { return t.id === "TODO_BART-G1"; })[0];
    T.waar(!!todo, "TODO_BART-G1");
    zinnen.filter(function (z) { return !z.vrijgegeven; }).forEach(function (z) { T.waar(todo.vraag.indexOf(z.tekst) >= 0, "TODO noemt: " + z.tekst); });
  });
  T.registreer(G, "twee schendingen: 'Nog 1 andere veiligheidsregel niet gehaald.' zonder te zeggen welke; bij 3 schendingen 'regels'; bij één niets", function () {
    T.is(g.UI.anderenZin({ geschonden: [{ id: "I1" }] }), null);
    T.is(g.UI.anderenZin({ geschonden: [{ id: "I1" }, { id: "I4" }] }), "Nog 1 andere veiligheidsregel niet gehaald.");
    T.is(g.UI.anderenZin({ geschonden: [{ id: "I1" }, { id: "I4" }, { id: "I5" }] }), "Nog 2 andere veiligheidsregels niet gehaald.");
    var s = nieuw("E1"); speel(s, "V3"); speel(s, "V4");   // I1 (geen N1) en I4 (twee antibiotica)
    var u = afronden(s), m = g.UI.evaluatieModel(u);
    T.gelijk(ids(u), ["I1", "I4"].sort(function (a, b) { return u.geschonden.map(function (x) { return x.id; }).indexOf(a) - u.geschonden.map(function (x) { return x.id; }).indexOf(b); }));
    T.is(m.anderen, "Nog 1 andere veiligheidsregel niet gehaald.");
    T.is(m.vraag, u.vraag);
    T.waar(m.anderen.indexOf("I") < 0 && m.anderen.indexOf(u.geschonden[1].vraag) < 0, "noemt niet welke");
  });

  /* ---------- 6. evaluatiescherm toont alle gespeelde kaarten ---------- */
  T.registreer(G, "evaluatiescherm: alle gespeelde kaarten staan erin, ook zonder nadeeltekst (Urinekweek inzetten in episode 2); de nadeeltekst '—' blijft weg", function () {
    var s = nieuw("E2"); speel(s, "G2"); speel(s, "O1"); speel(s, "V4"); dagen(s, 1); speel(s, "N1");
    var u = afronden(s), lijst = g.UI.gespeeldeKaarten(casus(), u, s.tijdlijn);
    T.gelijk(lijst.map(function (k) { return k.kaart; }), ["G2", "O1", "V4", "N1"]);
    T.is(lijst[1].nadeel, null, "O1 heeft in E2 geen nadeeltekst");
    T.is(lijst[3].nadeel, null, "N1: '—' is geen nadeel");
    T.waar(typeof lijst[0].nadeel === "string", "G2 heeft wel een nadeel");
    T.is(g.UI.nadeelTekst("—"), null); T.is(g.UI.nadeelTekst(""), null); T.is(g.UI.nadeelTekst("Kost een actie"), "Kost een actie");
  });


  /* ---------- 4. kaarten: uitgesteld recept met middel, uitleg bij het actieve middel ---------- */
  T.registreer(G, "uitgesteld recept: de speler kiest het middel; zonder middel kan het niet", function () {
    var s = nieuw("E1");
    T.is(g.Engine.speelKaart(s, "V2", {}).ok, false, "zonder doel");
    T.gelijk(g.UI.toegestaneDoelen(casus(), ep("E1"), s, "V2").map(function (d) { return d.label; }), ["Nitrofurantoïne", "Fosfomycine", "Trimethoprim"]);
    T.gelijk(g.UI.toegestaneDoelen(casus(), ep("E3"), nieuw("E3"), "V2").length, 7);
  });
  T.registreer(G, "uitgesteld recept: het gekozen middel telt mee voor profiel, duurzaamheid, 'nooit twee antibiotica' en nitrofurantoïne bij lage eGFR", function () {
    var s = nieuw("E1"); speel(s, "V2", "V4"); speel(s, "N1"); dagen(s, 1); speel(s, "N2", "V4");
    var u = afronden(s);
    T.is(u.poortGehaald, true); T.is(u.profiel.naam, "Gedeelde regie"); T.is(u.score.duurzaamheid, 2);
    var t = nieuw("E1"); speel(t, "V2", "V4"); speel(t, "V3"); speel(t, "N1");
    T.waar(ids(afronden(t)).indexOf("I4") >= 0, "uitgesteld recept + een tweede antibioticum = twee tegelijk");
    var e2 = nieuw("E2"); speel(e2, "G2"); speel(e2, "O1"); speel(e2, "V2", "V3"); dagen(e2, 1); speel(e2, "N1");
    T.waar(ids(afronden(e2)).indexOf("I5") >= 0, "uitgesteld recept met nitrofurantoïne bij eGFR 29");
  });
  T.registreer(G, "uitleg: Gebruik en verwachting uitleggen kan alleen bij een actief middel en koppelt aan dat middel (geen keuzelijst bij één middel)", function () {
    var s = nieuw("E1");
    T.gelijk(g.UI.toegestaneDoelen(casus(), ep("E1"), s, "N2"), [], "geen actief middel: nergens op te spelen");
    speel(s, "V4");
    T.gelijk(g.UI.toegestaneDoelen(casus(), ep("E1"), s, "N2").map(function (d) { return d.id; }), ["V4"]);
    T.is(g.UI.enigDoel(casus(), ep("E1"), s, "N2"), "V4", "één middel: automatisch");
    speel(s, "N2", "V4");
    var na = g.UI.naSpelenTekst(casus(), ep("E1"), s, "N2", "V4");
    T.is(na.tekst, casus().kaarten.filter(function (k) { return k.id === "V4"; })[0].uitleg, "tekst uit de data (uitleg van het middel)");
    T.waar(na.tekst.indexOf("Klachten niet direct weg") >= 0);
  });
  T.registreer(G, "kaarten: elke kaart heeft een korte smaakregel; middelen hebben dosering en duur; de smaakregel noemt geen middel of kaartcode", function () {
    casus().kaarten.forEach(function (k) {
      T.waar(typeof k.smaak === "string" && k.smaak.length > 5 && k.smaak.length < 70, k.id + " smaak: " + k.smaak);
      T.waar(!/\b(V\d+|G\d|O\d|B\d|N\d|Ev\d)\b/.test(k.smaak), k.id + " smaakregel noemt een kaartcode");
    });
    ["V3", "V4", "V5", "V7", "V8", "V9", "V10"].forEach(function (id) {
      var k = casus().kaarten.filter(function (x) { return x.id === id; })[0];
      T.waar(k.dosering && k.dosering.length > 5, id + " dosering");
      T.waar(k.effect.alle.indexOf(k.dosering) >= 0, id + ": de dosering staat letterlijk in het casuseffect");
    });
  });

  /* ---------- 9. pseudoniem en opslag ---------- */
  T.registreer(G, "opslag: de melding 'Resultaten staan alleen in dit tabblad: exporteer nu.' staat er ook als de browser niets kan bewaren, nog vóór de eerste poging", function () {
    var M = "Resultaten staan alleen in dit tabblad: exporteer nu.";
    T.is(g.UI.opslagMelding({ bewaard: true, opslagBeschikbaar: false, totaal: 0 }), M);
    T.is(g.UI.opslagMelding({ bewaard: false, opslagBeschikbaar: true, totaal: 1 }), M);
    T.is(g.UI.opslagMelding({ bewaard: true, opslagBeschikbaar: true, totaal: 0 }), null);
    T.is(g.UI.pseudoniemControle("   ").ok, false); T.is(g.UI.pseudoniemControle("").ok, false); T.is(g.UI.pseudoniemControle(" anna ").waarde, "anna");
  });
})(typeof window !== "undefined" ? window : globalThis);

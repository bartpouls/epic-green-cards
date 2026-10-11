// Tests van de spelmotor (groep 'engine'). Gebruikt een kleine synthetische casus (NIET UWI) en een eigen
// eenvoudige stub van Predicaten/Evaluatie, zodat de engine los van de echte regeltaal en casusdata getest wordt.
//
// STUB-GRENS (expliciet): de beoordeling (regels/evaluatie.js, stuk S6) bestaat nog niet. De engine roept alleen
// Evaluatie.beoordeel(casus, episodeId, state) aan en geeft de uitkomst ongewijzigd terug (contract 2 en 5). Hier wordt
// uitsluitend dat AANROEPCONTRACT getest, met StubEvaluatie. Poort, score, profiel en routes worden NIET door deze
// tests bewezen; dat doen de tests van S6 (tests/evaluatie.tests.js, tests/routes.js) via de echte Engine.
// Predicaten (regeltaal) bestaat wel: de tests die "echt:" heten gebruiken de echte regeltaal en de echte UWI-data.
(function (g) {
  var T = g.Test, GROEP = "engine";

  /* ---------- stubs ---------- */
  function tekstWaar(k, r) { return (!k.kaart || r.kaart === k.kaart) && (k.doel == null || r.doel === k.doel); }
  var StubPredicaten = {
    maakContext: function (casus, episode, state) {
      return { tijdlijn: state.tijdlijn, gebeurtenissen: state.gebeurtenissen, toestanden: state.toestanden,
        waar: episode.patient.waar, aantalDagen: state.aantalDagen, casus: casus, episode: episode, state: state };
    },
    evalueer: function (p, ctx) {
      switch (p.p) {
        case "waarheid": return p.waarde;
        case "gespeeld": return ctx.tijdlijn.some(function (r) { return tekstWaar(p.K, r); });
        case "nietGespeeld": return !ctx.tijdlijn.some(function (r) { return tekstWaar(p.K, r); });
        case "niet": return !StubPredicaten.evalueer(p.arg, ctx);
        case "gebeurtenisGeweest": return ctx.gebeurtenissen.some(function (x) { return x.id === p.id; });
        case "klachtenNu": { var kl = ctx.state.klachten[ctx.state.dag]; return !!kl && kl.status === p.waarde; }
        case "actief": {
          var dag = p.op && p.op.dag;
          var start = ctx.tijdlijn.some(function (r) { return r.kaart === p.middel && (dag == null || r.dag <= dag); });
          var stop = ctx.tijdlijn.some(function (r) { return r.kaart === "S" && r.doel === p.middel && (dag == null || r.dag <= dag); });
          return start && !stop;
        }
        default: throw new Error("stub kent predicaat niet: " + p.p);
      }
    }
  };
  var StubEvaluatie = { beoordeel: function (casus, episodeId, state) { return { stub: true, episodeId: episodeId, afgerond: state.afgerond, aantal: state.tijdlijn.length }; } };

  function metStub(fn) {
    var oP = g.Predicaten, oE = g.Evaluatie;
    g.Predicaten = StubPredicaten; g.Evaluatie = StubEvaluatie;
    try { fn(); } finally { g.Predicaten = oP; g.Evaluatie = oE; }
  }
  function test(naam, fn) { T.registreer(GROEP, naam, function () { metStub(fn); }); }

  /* ---------- synthetische casus (niet klinisch, willekeurige ids/namen) ---------- */
  function maakFixture() {
    return {
      id: "fixtuur", versie: "0",
      kaarten: [
        { id: "K1", categorie: "Gegevens", label: "Kaart een", doelkaart: false, downside: "d" },
        { id: "K2", categorie: "Gegevens", label: "Kaart twee", doelkaart: false, downside: "d" },
        { id: "M1", categorie: "Voorschrijven", label: "Middel een", doelkaart: false, downside: "d" },
        { id: "M2", categorie: "Voorschrijven", label: "Middel twee", doelkaart: false, downside: "d" },
        { id: "S", categorie: "Bijsturen", label: "Stop", doelkaart: true, downside: "d",
          doelen: { X1: [ { id: "M1", label: "Middel een", vereist: { p: "waarheid", waarde: true } },
                          { id: "M2", label: "Middel twee", vereist: { p: "gespeeld", K: { kaart: "K2" } } } ] } },
        { id: "D", categorie: "Bijsturen", label: "Dosis", doelkaart: true, downside: "d",
          doelen: { X1: [ { id: "M1", label: "Middel een" } ] },
          opties: { M1: [ { tekst: "optie-a" }, { tekst: "optie-b", goed: true } ] } },
        { id: "Z", categorie: "Onderzoek", label: "Buiten repertoire", doelkaart: false, downside: "d" }
      ],
      todoBart: [],
      raadplegen: { titel: "Bron", bronnen: ["BRON-A"] },
      episodes: [ {
        id: "X1", level: 1,
        knoppen: { actiesPerBeurt: 3, aantalDagen: 4, raadplegenKost: 1 },
        startToestanden: ["basis"],
        antibiotica: ["M1", "M2"],
        patient: {
          zichtbaar: { naam: "Fixtuur", lab: { w: 10, datum: "recent" } },
          waar: { w: 3 },
          verborgen: [ { kaart: "K2", onthult: "Verborgen tekst", sleutel: "w", waarde: 3 } ]
        },
        repertoire: ["K1", "K2", "M1", "M2", "S", "D"],
        gebeurtenissen: [
          { id: "P", groep: "PQ", trigger: { type: "naKaart", n: 2 }, tekst: "tp", toestand: "erger", zet: { statusNaBeurten: 2, resistent: ["M2"] } },
          { id: "Q", groep: "PQ", trigger: { type: "naKaart", n: 4 }, tekst: "tq" },
          { id: "R", trigger: { type: "naKaartVanKaart", kaart: "K1", n: 1 }, tekst: "tr", zet: { gevoelig: ["M2"] } },
          { id: "V", trigger: { type: "naKaart", n: 3, alleenAlsGespeeld: "K2" }, tekst: "tv" }
        ],
        werkzaamheid: {
          basis: { werkzaam: [ { kaart: "M1" } ], nietWerkzaam: [ { kaart: "M2" } ] },
          erger: { werkzaam: [ { kaart: "M2", als: { p: "gespeeld", K: { kaart: "K1" } } } ], nietWerkzaam: [ { kaart: "M1" } ] }
        },
        statusTeksten: { af: "tekst-af", aan: "tekst-aan", geenVerbetering48: "tekst-48" }
      }, {
        id: "X2", level: 2,
        knoppen: { actiesPerBeurt: 2, aantalDagen: 2, raadplegenKost: 0 },
        startToestanden: ["basis"], antibiotica: [], patient: { zichtbaar: {}, waar: {}, verborgen: [] }, repertoire: ["K1"], gebeurtenissen: []
      } ]
    };
  }
  function lijstVanTest(x) { return x == null ? [] : (Array.isArray(x) ? x : [x]); }
  function rngVast(w) { return function () { return w; }; }
  function speel(s, k, o) { var r = g.Engine.speelKaart(s, k, o); T.waar(r.ok, "speelKaart " + k + " mislukte: " + r.fout); return r; }
  function nieuw(w) { return g.Engine.nieuwSpel(maakFixture(), "X1", { rng: rngVast(w == null ? 0 : w) }); }
  function dagen(s, n) { for (var i = 0; i < n; i++) g.Engine.volgendeDag(s); }

  /* ---------- bronscan (M6): ALLOWLIST op de volledige modulebron ---------- */
  // Principe (geen wapenwedloop met "bekende tokens"): wat NIET expliciet is toegestaan, is rood.
  //  1. Tekstconstanten: alleen exact de teksten in TOEGESTANE_TEKSTEN (contractsleutels, statuswaarden, triggertypes, typeof-woorden,
  //     de Nederlandse foutmeldingen). Elke andere tekst (ook een stukje van een klinische zin) is rood. Geen escapes, geen sjablonen.
  //  2. Geen reguliere-expressie-literalen en geen deling: elke "/" buiten een commentaar is rood. Daarom kan de tokenizer niet uit de pas
  //     lopen (er is geen "/" na ")" die voor deling of regex kan doorgaan): commentaar begint alleen met "//" of "/*" en eindigt bij een
  //     regeleinde (ook CR en de Unicode-regelscheiders) of "*/".
  //  3. Getallen: alleen 0 en 1, en nooit twee getallen met een bewerking ertussen (geen 1 + 1).
  //  4. Eigenschapsnamen na een punt: alleen TOEGESTANE_EIGENSCHAPPEN. Dynamische tekst/code (eval, Function, constructor, fromCharCode,
  //     atob, split/join/concat, toUpperCase, JSON.parse van tekst, ...) staat in VERBODEN_NAMEN en is overal rood; de enkele
  //     legitieme toepassing staat als vaste tokenreeks in TOEGESTANE_REEKSEN.
  //  5. Geen woord (>= 4 letters, accent-onafhankelijk) uit ENIGE tekst van de echte casusdata (labels, downsides, effecten, vragen,
  //     patiëntteksten, namen) in een naam of tekst van de module, behalve de CONTRACTWOORDEN. Ook geen id uit de data.
  //  6. Teken buiten ASCII, een backslash of een sjabloonteken buiten tekst/commentaar is rood.
  var TOEGESTANE_TEKSTEN = [
    "use strict", "undefined", "function", "object", "string", "number", ".",                       // taal en typeof
    "_casus", "_opties", "rng", "_bron", "poortGehaald", "TODO_BART", "statusTeksten",              // vaste sleutels (contract / engine)
    "actief", "af", "aan", "geenVerbetering48",                                                    // predicaat- en statuswaarden (contract 3, 3b)
    "naKaart", "naAantalKaarten", "naKaartVanKaart",                                               // triggertypes (contract 4b)
    "De regeltaal (Predicaten) is niet geladen.", "De beoordeling (Evaluatie) is niet geladen.",    // foutmeldingen (Nederlands, engine-eigen)
    "De casus bij dit spel is niet gevonden.", "De episode bij dit spel is niet gevonden.", "Onbekende episode: ",
    "De episode mist de knoppen (actiesPerBeurt, aantalDagen) in de data.",
    "De episode mist de beginstoestand(en) (startToestanden, een lijst) in de data.",
    "Deze episode is al afgerond.", "De laatste dag is voorbij.", "De laatste dag is al voorbij.",
    "Kies eerst een kaart om te spelen.", "Onbekende kaart: ", "Deze kaart zit niet in het repertoire van deze episode.",
    "Je hebt vandaag geen acties meer. Ga naar de volgende dag of rond de episode af.",
    "De kaart “", "” heeft geen doel of optie.", "” kan in deze episode op geen enkel doel worden gespeeld.",
    "Kies eerst een doel voor de kaart “", "”.", "Dit doel kan niet bij de kaart “",
    "Dit doel is nu niet beschikbaar voor de kaart “", "Voor dit doel zijn bij de kaart “", "” geen opties beschikbaar.",
    "Kies eerst een optie voor de kaart “", "Deze optie hoort niet bij dit doel.", "” heeft geen opties.",
    "Je hebt niet genoeg acties over om de richtlijn te raadplegen.",
    "Je kunt deze episode pas afronden nadat de gebeurtenissen zich hebben voorgedaan."
  ];
  var TOEGESTANE_EIGENSCHAPPEN = [
    // contract- en state-velden
    "AB", "CASUSSEN", "Engine", "Evaluatie", "Predicaten", "_casus", "_opties", "aantalDagen", "actief", "actiesOver", "actiesPerBeurt", "afgerond",
    "afrondenPasNaGebeurtenissen", "alleenAlsGespeeld", "als", "antibiotica", "beoordeel", "bronnen", "casusId", "dag", "dagenVoorbij", "doel", "doelen",
    "doelkaart", "episodeId", "episodes", "evalueer", "gebeurtenissen", "geschonden", "gevoelig", "groep", "groepen", "id", "kaart", "kaarten",
    "klachten", "knoppen", "label", "maakContext", "naVolg", "onthuld", "onthult", "optie", "opties", "patient", "poortGehaald", "raadplegen",
    "raadplegenKost", "raadplegingen", "repertoire", "resistent", "rng", "sets", "sleutel", "startToestanden", "status", "statusNaBeurten",
    "statusTeksten", "tekst", "tijdlijn", "titel", "toestand", "toestanden", "trigger", "type", "uitkomst", "verborgen", "vereist", "volg",
    "waar", "waarde", "wachtend", "werkzaam", "werkzaamheid", "zet", "zichtbaar",
    // eigen kortnamen in lokale objecten
    "i", "n", "t",
    // taal: alleen array- en getalbewerkingen die geen tekst opbouwen of ontleden
    "filter", "floor", "forEach", "indexOf", "isArray", "keys", "length", "map", "push", "random", "some", "sort", "splice"
  ];
  var VERBODEN_NAMEN = [
    "eval", "Function", "constructor", "prototype", "__proto__", "__defineGetter__", "__defineSetter__", "__lookupGetter__", "Reflect", "Proxy", "with",
    "fromCharCode", "fromCodePoint", "charAt", "charCodeAt", "codePointAt", "atob", "btoa", "Buffer", "unescape", "escape",
    "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "RegExp", "String", "Number", "parseInt", "parseFloat", "Symbol", "BigInt",
    "split", "join", "concat", "reverse", "slice", "substr", "substring", "replace", "replaceAll", "repeat", "padStart", "padEnd", "normalize", "trim",
    "toUpperCase", "toLowerCase", "toLocaleUpperCase", "toLocaleLowerCase", "toString", "toLocaleString", "toFixed", "toPrecision", "valueOf",
    "match", "matchAll", "search", "test", "exec", "raw", "fromEntries", "entries", "values", "at", "flatMap", "reduce", "getOwnPropertyNames",
    "getPrototypeOf", "setPrototypeOf", "apply", "bind", "call", "name", "arguments", "callee", "caller",
    "parse", "stringify", "require", "import", "importScripts", "process", "document", "localStorage", "sessionStorage", "fetch", "XMLHttpRequest",
    "setTimeout", "setInterval", "setImmediate", "Worker", "WebAssembly", "Atomics", "Intl"
  ];
  var VERBODEN_OPERATOREN = ["<<", ">>", ">>>", "**", "^", "~", "&", "|", "<<=", ">>=", ">>>=", "&=", "|=", "^=", "**=", "/=", "/"];
  // De enige plekken waar een verboden naam hoort; alles tussen deze tokens wordt als één geheel goedgekeurd (strikt, letterlijk).
  var TOEGESTANE_REEKSEN = [
    'JSON . parse ( JSON . stringify ( x ) )',          // kopie van JSON-baar spelstate-deel (geen tekst ontleden)
    'engineModule . toString ( )',                      // Engine._bron: de eigen broncode voor deze scan
    'Object . prototype . hasOwnProperty . call (',     // eigenschap-test op data
    'Object . defineProperty (',                        // niet-opsombare velden (_casus, _opties, _bron)
    'sleutel . split ( "." )',                          // pad "a.b" in data splitsen (alleen de sleutel uit de data zelf)
    '. slice ( )'                                       // kopie van een lijst (zonder argumenten)
  ];
  // Woorden (>= 4 letters) die zowel in de casusdata voorkomen als in namen van de module: contractvelden en gewoon Nederlands.
  // Bewust klein en expliciet; een woord dat hier staat maar niet in de modulebron voorkomt is een fout (de lijst mag niet groeien),
  // en geen enkel woord hier mag een toestand, comedicatie, waar-sleutel of middel uit de data zijn.
  var CONTRACTWOORDEN = [
    "aantal", "actief", "acties", "afgerond", "afronden", "alleen", "antibiotica", "beurt", "beurten", "bronnen", "casus", "controle", "dagen",
    "doel", "doelen", "doelkaart", "eerste", "einde", "episode", "episodes", "evaluatie", "fout", "gebeurtenis", "gebeurtenissen", "gehaald",
    "geschonden", "gespeeld", "gevoelig", "kaart", "kaarten", "klachten", "knoppen", "kost", "maak", "middel", "moment", "nieuw", "nieuwe", "null",
    "opties", "over", "patient", "periode", "poort", "raadplegen", "regel", "repertoire", "resistent", "start", "status", "statusteksten", "tekst",
    "teksten", "toestand", "toestanden", "trigger", "triggert", "verborgen", "volgende", "volgorde", "vorige", "waar", "werkzaam", "werkzaamheid",
    "zichtbaar"
  ];

  var PUNCTUATOREN = [">>>=", "...", "===", "!==", "**=", "<<=", ">>=", ">>>", "&&=", "||=", "??=", "=>", "==", "!=", "<=", ">=", "&&", "||", "??", "?.",
    "++", "--", "+=", "-=", "*=", "%=", "&=", "|=", "^=", "<<", ">>", "**", "/="];
  function regeleinde(c) { return c === "\n" || c === "\r" || c === "\u2028" || c === "\u2029"; }

  // Lexer: levert tokens {s: soort, w: waarde, prop: bool} en meldt direct alles wat in de code niet mag voorkomen.
  function lexBron(src) {
    var tokens = [], vondst = [], i = 0, n = src.length, c, j;
    function meld(wat) { vondst.push(wat); }
    while (i < n) {
      c = src[i];
      if (c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\u000b" || c === "\u000c") { i++; continue; }
      if (c === "/" && src[i + 1] === "/") { while (i < n && !regeleinde(src[i])) i++; continue; }
      if (c === "/" && src[i + 1] === "*") { j = src.indexOf("*/", i + 2); if (j < 0) { meld("commentaar niet afgesloten"); i = n; } else i = j + 2; continue; }
      if (c === "/") { meld("schuine streep in code (deling of reguliere expressie): " + src.slice(i, i + 20)); i++; continue; }
      if (c === '"' || c === "'") {
        j = i + 1;
        while (j < n && src[j] !== c && !regeleinde(src[j]) && src[j] !== "\\") j++;
        if (j >= n || src[j] !== c) { meld("tekst niet afgesloten of met escape/regeleinde: " + src.slice(i, i + 30)); i = j + 1; continue; }
        tokens.push({ s: "str", w: src.slice(i + 1, j) }); i = j + 1; continue;
      }
      if (c === "`") { meld("sjabloontekst (template literal)"); i++; continue; }
      if (c === "\\") { meld("backslash in code (escape in naam)"); i++; continue; }
      if (c.charCodeAt(0) > 126 || c.charCodeAt(0) < 32) { meld("teken buiten ASCII in code: U+" + c.charCodeAt(0).toString(16)); i++; continue; }
      if (/[A-Za-z_$]/.test(c)) {
        j = i + 1; while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++;
        var vorig = tokens[tokens.length - 1];
        tokens.push({ s: "id", w: src.slice(i, j), prop: !!vorig && vorig.s === "p" && (vorig.w === "." || vorig.w === "?.") });
        i = j; continue;
      }
      if (/[0-9]/.test(c)) {
        j = i + 1; while (j < n && /[A-Za-z0-9_.]/.test(src[j])) j++;
        tokens.push({ s: "num", w: src.slice(i, j) }); i = j; continue;
      }
      var gevonden = null;
      for (var q = 0; q < PUNCTUATOREN.length; q++) if (src.substr(i, PUNCTUATOREN[q].length) === PUNCTUATOREN[q]) { gevonden = PUNCTUATOREN[q]; break; }
      gevonden = gevonden || c;
      tokens.push({ s: "p", w: gevonden }); i += gevonden.length;
    }
    return { tokens: tokens, vondst: vondst };
  }
  function tokenTekst(t) { return t.s === "str" ? JSON.stringify(t.w) : t.w; }
  function woordNorm(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  function naamDelen(naam) {
    return naam.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_$0-9]+/g, " ").split(" ").map(woordNorm).filter(function (x) { return x.length >= 4; });
  }

  // Alle woorden (>= 4 letters, zonder accenten) uit ALLE tekstvelden van de echte casusdata, plus de namen/id's die als sleutel of waarde dienen.
  function dataWoorden() {
    var woorden = {};
    function loop(o) {
      if (typeof o === "string") (o.match(/\p{L}{4,}/gu) || []).forEach(function (w) { woorden[woordNorm(w)] = 1; });
      else if (Array.isArray(o)) o.forEach(loop);
      else if (o && typeof o === "object") for (var k in o) loop(o[k]);
    }
    (g.CASUSSEN || []).forEach(loop);
    return woorden;
  }

  // vondsten: lijst teksten; leeg = schoon. `data` = echteNamen(); `woorden` = dataWoorden(); `contract` = CONTRACTWOORDEN.
  function scanBron(src, data, woorden, contract) {
    var ids = Object.keys(data.ids), namen = Object.keys(data.namen), vondst = [], i;
    if (ids.length < 5 || !namen.length || Object.keys(woorden).length < 200)
      throw new Error("De scan heeft de echte casusdata nodig (id's, namen, woorden) en bewijst anders niets.");
    var lx = lexBron(src), tk = lx.tokens, bewaakt = tk.map(function () { return false; });
    vondst = vondst.concat(lx.vondst);
    // goedgekeurde tokenreeksen
    var strs = tk.map(tokenTekst);
    TOEGESTANE_REEKSEN.forEach(function (reeks) {
      var delen = reeks.split(" ");
      for (var a = 0; a + delen.length <= strs.length; a++) {
        var ok = true;
        for (var b = 0; b < delen.length; b++) if (strs[a + b] !== delen[b]) { ok = false; break; }
        if (ok) for (b = 0; b < delen.length; b++) bewaakt[a + b] = true;
      }
    });
    var verboden = {}, toegestaneEig = {}, toegestaneTeksten = {};
    VERBODEN_NAMEN.forEach(function (x) { verboden[x] = 1; });
    TOEGESTANE_EIGENSCHAPPEN.forEach(function (x) { toegestaneEig[x] = 1; });
    TOEGESTANE_TEKSTEN.forEach(function (x) { toegestaneTeksten[x] = 1; });
    var banned = {}, exempt = {};
    contract.forEach(function (x) { exempt[woordNorm(x)] = 1; });
    Object.keys(woorden).forEach(function (w) { if (!exempt[w]) banned[w] = 1; });
    namen.forEach(function (nm) { naamDelen(nm).concat([woordNorm(nm)]).forEach(function (w) { if (w.length >= 4) banned[w] = 1; }); });
    var bannedLijst = Object.keys(banned);
    function woordVondst(naam) {
      var n = woordNorm(naam).replace(/[^a-z]/g, ""), delen = naamDelen(naam), gevonden = [];
      bannedLijst.forEach(function (w) {
        if (n === w || delen.indexOf(w) >= 0 || (w.length >= 8 && n.indexOf(w) >= 0)) gevonden.push(w);
      });
      return gevonden;
    }
    for (i = 0; i < tk.length; i++) {
      var t = tk[i], v = tk[i - 1], na = tk[i + 1];
      if (t.s === "str") {
        if (!toegestaneTeksten[t.w]) vondst.push("tekst niet op de allowlist: " + t.w.slice(0, 50));
        if (na && na.s === "p" && (na.w === "." || na.w === "[" || na.w === "?.")) vondst.push("bewerking direct op een tekstconstante: " + t.w.slice(0, 30));
        if (na && na.s === "p" && na.w === ")" && tk[i + 2] && tk[i + 2].s === "p" && (tk[i + 2].w === "." || tk[i + 2].w === "[")) vondst.push("bewerking op een tekstconstante tussen haakjes: " + t.w.slice(0, 30));
      } else if (t.s === "num") {
        if (t.w !== "0" && t.w !== "1") vondst.push("getal in code (alleen 0 en 1): " + t.w);
      } else if (t.s === "p") {
        if (VERBODEN_OPERATOREN.indexOf(t.w) >= 0) vondst.push("operator niet toegestaan: " + t.w);
      } else if (t.s === "id") {
        if (!bewaakt[i]) {
          if (verboden[t.w]) vondst.push("verboden naam (dynamische code of tekstbouw): " + t.w);
          else if (t.prop && !toegestaneEig[t.w]) vondst.push("eigenschap niet op de allowlist: ." + t.w);
        }
        if (Object.prototype.hasOwnProperty.call(data.ids, t.w)) vondst.push("naam is een id uit de casusdata: " + t.w);
        woordVondst(t.w).forEach(function (w) { vondst.push("naam bevat het casuswoord '" + w + "': " + t.w); });
      }
    }
    for (i = 0; i < tk.length; i++) {
      // geen rekenwerk op 0/1 om andere getallen te maken (haakjes tellen niet mee)
      if (tk[i].s !== "num") continue;
      var r = i + 1; while (tk[r] && tk[r].s === "p" && (tk[r].w === ")" || tk[r].w === "(")) r++;
      if (tk[r] && tk[r].s === "p" && /^[-+*%]$/.test(tk[r].w)) {
        var r2 = r + 1; while (tk[r2] && tk[r2].s === "p" && tk[r2].w === "(") r2++;
        if (tk[r2] && tk[r2].s === "num") vondst.push("rekenwerk op getallen: " + tk[i].w + " " + tk[r].w + " " + tk[r2].w);
      }
      // lege lijst naast een bewerking of index (JSFuck-vorm: ![] +[] []+ [][...])
    }
    for (i = 0; i + 1 < tk.length; i++) {
      if (tk[i].w === "[" && tk[i].s === "p" && tk[i + 1].s === "p" && tk[i + 1].w === "]") {
        var voor = tk[i - 1], erna = tk[i + 2];
        if ((voor && voor.s === "p" && (voor.w === "!" || voor.w === "+" || voor.w === "-")) || (erna && erna.s === "p" && (erna.w === "+" || erna.w === "["))) vondst.push("lege lijst in een bewerking (tekst uit lege lijsten bouwen)");
      }
    }
    return vondst;
  }
  // De allowlist-teksten zelf horen geen id of naam uit de casusdata te bevatten (ze zijn engine-eigen).
  function teksteneigenSchoon(data) {
    var uit = [];
    TOEGESTANE_TEKSTEN.forEach(function (tekst) {
      Object.keys(data.ids).forEach(function (id) { if (woordIn(tekst, id, true)) uit.push("allowlist-tekst bevat id " + id + ": " + tekst); });
      Object.keys(data.namen).forEach(function (nm) { if (woordIn(tekst, nm, false)) uit.push("allowlist-tekst bevat naam " + nm + ": " + tekst); });
    });
    return uit;
  }
  function woordIn(tekst, woord, hoofdletters) {
    var re = new RegExp("(^|[^A-Za-z0-9_])" + woord.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + "([^A-Za-z0-9_]|$)", hoofdletters ? "" : "i");
    return re.test(tekst);
  }
  // Woorden uit de casusdata waarmee we de module scannen: ids (kaart, gebeurtenis, episode, invariant, doel) en namen (toestanden, comedicatie, waar-sleutels).
  function echteNamen() {
    var ids = {}, namen = {};
    function naam(n) { if (typeof n === "string" && n.length >= 4 && n.indexOf("TODO_BART") !== 0 && n !== "statusTeksten") namen[n] = 1; }
    (g.CASUSSEN || []).forEach(function (c) {
      if (c.id && String(c.id).length >= 3) ids[c.id] = 1;
      (c.kaarten || []).forEach(function (k) {
        ids[k.id] = 1;
        Object.keys(k.doelen || {}).forEach(function (e) { (k.doelen[e] || []).forEach(function (d) { ids[d.id] = 1; }); });
        Object.keys(k.opties || {}).forEach(function (d) { ids[d] = 1; });
      });
      (c.episodes || []).forEach(function (e) {
        ids[e.id] = 1;
        (e.gebeurtenissen || []).forEach(function (x) { ids[x.id] = 1; lijstVanTest(x.toestand).forEach(function (t) { ids[t] = 1; naam(t); }); });
        (e.antibiotica || []).forEach(function (m) { ids[m] = 1; });
        ((e.patient && e.patient.medicatie) || []).forEach(function (m) { ids[m.id] = 1; naam(m.id); });
        (e.startToestanden || []).forEach(function (m) { ids[m] = 1; naam(m); });
        Object.keys(e.werkzaamheid || {}).forEach(function (m) { ids[m] = 1; naam(m); });
        (e.invarianten || []).forEach(function (x) { ids[x.id] = 1; });
        Object.keys((e.patient && e.patient.waar) || {}).forEach(naam);
      });
    });
    delete ids.undefined;
    return { ids: ids, namen: namen };
  }
  function bronScan(src) { return scanBron(src, echteNamen(), dataWoorden(), CONTRACTWOORDEN); }

  /* ---------- M1 API, beurten, budget ---------- */
  test("nieuwSpel: beginstand klopt met contract 2", function () {
    var s = nieuw();
    T.is(s.casusId, "fixtuur"); T.is(s.episodeId, "X1"); T.is(s.dag, 1); T.is(s.actiesOver, 3); T.is(s.aantalDagen, 4);
    T.is(s.afgerond, false); T.gelijk(s.tijdlijn, []); T.gelijk(s.raadplegingen, []); T.gelijk(s.gebeurtenissen, []);
    T.gelijk(s.toestanden, ["basis"]); T.gelijk(s.onthuld, []); T.gelijk(s.klachten[1], { dag: 1, status: null, tekst: null });
    T.gelijk(s.klachten, [{ dag: 0, status: null, tekst: null }, { dag: 1, status: null, tekst: null }], "klachten[0] is een lege plaatsvervanger, index = dag");
    T.is("pogingnummer" in s || "eerstePoging" in s, false, "poging wordt door Logging bepaald, niet door de engine");
  });
  test("nieuwSpel: startToestanden (lijst) is canoniek; ontbreekt of is geen lijst -> Nederlandse fout, geen terugval", function () {
    var c = maakFixture(); c.episodes[0].startToestanden = ["basis", "erger"];
    T.gelijk(g.Engine.nieuwSpel(c, "X1", {}).toestanden, ["basis", "erger"]);
    [undefined, "basis", []].forEach(function (waarde) {
      var c2 = maakFixture(); if (waarde === undefined) delete c2.episodes[0].startToestanden; else c2.episodes[0].startToestanden = waarde;
      try { g.Engine.nieuwSpel(c2, "X1", {}); T.waar(false, "had moeten falen"); }
      catch (e) { T.waar(/startToestanden/.test(e.message) && /De episode/.test(e.message), "foutmelding: " + e.message); }
    });
    var c3 = maakFixture(); c3.episodes[0].startToestand = "basis"; delete c3.episodes[0].startToestanden;
    T.gooit(function () { g.Engine.nieuwSpel(c3, "X1", {}); });
  });
  test("speelKaart: null/leeg/geen tekst als kaart geeft een Nederlandse fout (geen TypeError), state ongewijzigd", function () {
    var s = nieuw();
    [null, undefined, "", 5].forEach(function (k) {
      var voor = JSON.stringify(s), r = g.Engine.speelKaart(s, k);
      T.is(r.ok, false); T.is(r.fout, "Kies eerst een kaart om te spelen."); T.is(JSON.stringify(s), voor);
    });
  });
  test("nieuwSpel: onbekende episode geeft Nederlandse fout", function () {
    T.gooit(function () { g.Engine.nieuwSpel(maakFixture(), "NOPE", {}); });
  });
  test("speelKaart: tijdlijnregel heeft het contractformaat, volg telt kaarten, dag klopt", function () {
    var s = nieuw(); speel(s, "K1"); speel(s, "M1");
    T.gelijk(s.tijdlijn[0], { volg: 1, kaart: "K1", dag: 1, doel: null, optie: null });
    T.gelijk(s.tijdlijn[1], { volg: 2, kaart: "M1", dag: 1, doel: null, optie: null });
  });
  test("actiebudget: 3 acties per beurt, de vierde wordt geweigerd, volgende dag herstelt het budget", function () {
    var s = nieuw(); speel(s, "K1"); speel(s, "K2"); speel(s, "M1");
    T.is(s.actiesOver, 0);
    var r = g.Engine.speelKaart(s, "M2"); T.is(r.ok, false); T.waar(/acties/.test(r.fout)); T.is(s.tijdlijn.length, 3);
    g.Engine.volgendeDag(s); T.is(s.dag, 2); T.is(s.actiesOver, 3);
    T.is(s.tijdlijn[2].dag, 1); speel(s, "M2"); T.is(s.tijdlijn[3].dag, 2); T.is(s.tijdlijn[3].volg, 4);
  });
  test("raadpleeg: kost uit data, telt niet mee in volg, geeft bronverwijzing", function () {
    var s = nieuw(); var r = g.Engine.raadpleeg(s);
    T.is(r.ok, true); T.is(r.kost, 1); T.is(s.actiesOver, 2); T.gelijk(r.bronnen, ["BRON-A"]); T.is(r.titel, "Bron");
    T.gelijk(s.raadplegingen, [{ dag: 1 }]); speel(s, "K1"); T.is(s.tijdlijn[0].volg, 1);
  });
  test("raadpleeg: kost 0 in andere episode kost niets; te weinig acties wordt geweigerd", function () {
    var s2 = g.Engine.nieuwSpel(maakFixture(), "X2", {}); g.Engine.raadpleeg(s2); T.is(s2.actiesOver, 2);
    var s = nieuw(); speel(s, "K1"); speel(s, "K2"); speel(s, "M1");
    var r = g.Engine.raadpleeg(s); T.is(r.ok, false); T.is(s.raadplegingen.length, 0); T.is(s.actiesOver, 0);
  });
  test("volgendeDag: dag++, laatste dag zet einde, eindeBereikt", function () {
    var s = nieuw(); T.is(g.Engine.eindeBereikt(s), false);
    dagen(s, 3); T.is(s.dag, 4); T.is(g.Engine.eindeBereikt(s), false);
    g.Engine.volgendeDag(s); T.is(s.dag, 4); T.is(g.Engine.eindeBereikt(s), true);
    var r = g.Engine.speelKaart(s, "K1"); T.is(r.ok, false);
    T.gooit(function () { g.Engine.volgendeDag(s); });
  });
  test("rondAf: zet afgerond, roept Evaluatie.beoordeel aan, is idempotent; daarna geen kaarten meer", function () {
    var s = nieuw(); speel(s, "K1");
    var u = g.Engine.rondAf(s); T.is(s.afgerond, true); T.is(u.stub, true); T.is(u.aantal, 1);
    T.is(g.Engine.rondAf(s), u); T.is(g.Engine.eindeBereikt(s), true);
    T.is(g.Engine.speelKaart(s, "K2").ok, false); T.is(g.Engine.raadpleeg(s).ok, false);
    T.gooit(function () { g.Engine.volgendeDag(s); });
  });
  test("rondAf: zonder Evaluatie een duidelijke fout en de episode blijft open", function () {
    var s = nieuw(); var o = g.Evaluatie; g.Evaluatie = undefined;
    try { T.gooit(function () { g.Engine.rondAf(s); }); } finally { g.Evaluatie = o; }
    T.is(s.afgerond, false);
  });
  test("afrondenPasNaGebeurtenissen (TODO_BART-4): standaard uit, aan blokkeert vroeg afronden", function () {
    var s = nieuw(); g.Engine.rondAf(s); T.is(s.afgerond, true);
    var c = maakFixture(); c.episodes[0].afrondenPasNaGebeurtenissen = true;   // contract 4b: episode-niveau
    var s2 = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    T.gooit(function () { g.Engine.rondAf(s2); }); T.is(s2.afgerond, false);
    var c2 = maakFixture(); c2.episodes[0].knoppen.afrondenPasNaGebeurtenissen = true;   // oude plek wordt niet meer gelezen
    var s3 = g.Engine.nieuwSpel(c2, "X1", { rng: rngVast(0) }); g.Engine.rondAf(s3); T.is(s3.afgerond, true);
    var s4 = g.Engine.nieuwSpel(maakFixture(), "X1", { rng: rngVast(0), afrondenPasNaGebeurtenissen: true });
    T.gooit(function () { g.Engine.rondAf(s4); });
  });

  /* ---------- M2 onthullen ---------- */
  test("onthullen: verborgen waarde pas na de bijbehorende kaart; waar blijft ongewijzigd", function () {
    var casus = maakFixture(); var s = g.Engine.nieuwSpel(casus, "X1", { rng: rngVast(0) });
    T.is(s.zichtbaar.lab.w, 10); speel(s, "K1"); T.is(s.zichtbaar.lab.w, 10); T.is(s.onthuld.length, 0);
    var r = speel(s, "K2");
    T.is(r.onthuld.length, 1); T.is(r.onthuld[0].tekst, "Verborgen tekst"); T.is(r.onthuld[0].waarde, 3); T.is(r.onthuld[0].kaart, "K2");
    T.is(r.onthuld[0].sleutel, "w"); T.is(r.onthuld[0].dag, 1);
    T.is(s.zichtbaar.lab.w, 3); T.is(s.zichtbaar.lab.datum, "recent");
    T.is(casus.episodes[0].patient.waar.w, 3, "waar ongewijzigd"); T.is(casus.episodes[0].patient.zichtbaar.lab.w, 10, "data zelf niet gemuteerd");
  });
  test("onthullen: dubbel spelen onthult niet nogmaals", function () {
    var s = nieuw(); speel(s, "K2"); var r = speel(s, "K2"); T.is(r.onthuld.length, 0); T.is(s.onthuld.length, 1);
  });

  /* ---------- M3 gebeurtenissen ---------- */
  test("gebeurtenis: getriggerd na kaart n, banner pas aan het begin van de volgende dag, toestand dan gezet", function () {
    var s = nieuw(0); speel(s, "K1"); speel(s, "M1");
    T.gelijk(s.gebeurtenissen, [], "nog niet zichtbaar op dezelfde dag"); T.gelijk(s.toestanden, ["basis"]);
    g.Engine.volgendeDag(s);
    var ids = s.gebeurtenissen.map(function (e) { return e.id + "@" + e.dag + "/" + e.naVolg; });
    T.waar(ids.indexOf("P@2/2") >= 0 || ids.indexOf("Q@2/2") >= 0, "groepsgebeurtenis op dag 2 na kaart 2: " + ids);
  });
  test("groep: rng bepaalt de getrokken volgorde (rng 0 = datavolgorde, hoge rng draait om)", function () {
    T.gelijk(nieuw(0).groepen.PQ, ["P", "Q"]);
    T.gelijk(nieuw(0.99).groepen.PQ, ["Q", "P"]);
    T.gelijk(nieuw(0).volgordeAB, [], "volgordeAB alleen gevuld voor een groep AB");
  });
  test("groep: omgekeerde volgorde via rng geeft omgekeerde koppeling aan de triggers (n=2 en n=4)", function () {
    var casus = maakFixture(); casus.episodes[0].gebeurtenissen = casus.episodes[0].gebeurtenissen.filter(function (e) { return e.groep; });
    function speelReeks(rng) {
      var s = g.Engine.nieuwSpel(casus, "X1", { rng: rng });
      speel(s, "K1"); speel(s, "K2"); g.Engine.volgendeDag(s);
      var eerste = s.gebeurtenissen.map(function (e) { return e.id; });
      speel(s, "M1"); speel(s, "M2"); g.Engine.volgendeDag(s);
      return { eerste: eerste, orde: s.groepen.PQ.slice(), alle: s.gebeurtenissen.map(function (e) { return e.id + e.dag; }) };
    }
    var a = speelReeks(function () { return 0; }), b = speelReeks(function () { return 0; });
    T.gelijk(a.orde, ["P", "Q"]); T.gelijk(a.eerste, ["P"]); T.gelijk(a.alle, ["P2", "Q3"]); T.gelijk(b.alle, a.alle, "deterministisch");
    // rng die [P,Q] omdraait: Fisher-Yates met n=2 kiest j = i + floor(rng*(2-i)); rng 0.6 -> j=1
    var c = speelReeks(function () { return 0.6; });
    T.gelijk(c.orde, ["Q", "P"]); T.gelijk(c.eerste, ["Q"]); T.gelijk(c.alle, ["Q2", "P3"]);
  });
  test("gebeurtenis: elke gebeurtenis maar één keer", function () {
    var s = nieuw(0); speel(s, "K1"); speel(s, "K2"); speel(s, "M1"); g.Engine.volgendeDag(s);
    speel(s, "M2"); speel(s, "K1"); speel(s, "K2"); g.Engine.volgendeDag(s);
    var tel = {}; s.gebeurtenissen.forEach(function (e) { tel[e.id] = (tel[e.id] || 0) + 1; });
    for (var id in tel) T.is(tel[id], 1, "gebeurtenis " + id + " meer dan eens");
  });
  test("trigger naKaartVanKaart: n kaarten na de eerste keer dat de genoemde kaart is gespeeld", function () {
    var s = nieuw(0); speel(s, "M1"); speel(s, "K1"); speel(s, "M2");   // K1 is kaart 2, R na kaart 3
    g.Engine.volgendeDag(s);
    var r = s.gebeurtenissen.filter(function (e) { return e.id === "R"; });
    T.is(r.length, 1); T.is(r[0].naVolg, 3); T.is(r[0].dag, 2);
  });
  test("trigger naKaartVanKaart: zonder die kaart gebeurt er niets", function () {
    var s = nieuw(0); speel(s, "M1"); speel(s, "M2"); speel(s, "K2"); g.Engine.volgendeDag(s);
    T.is(s.gebeurtenissen.filter(function (e) { return e.id === "R"; }).length, 0);
  });
  test("trigger alleenAlsGespeeld: gebeurt alleen als die kaart eerder is gespeeld", function () {
    var met = nieuw(0); speel(met, "K2"); speel(met, "M1"); speel(met, "M2"); g.Engine.volgendeDag(met);
    T.is(met.gebeurtenissen.filter(function (e) { return e.id === "V"; }).length, 1);
    var zonder = nieuw(0); speel(zonder, "K1"); speel(zonder, "M1"); speel(zonder, "M2"); g.Engine.volgendeDag(zonder);
    T.is(zonder.gebeurtenissen.filter(function (e) { return e.id === "V"; }).length, 0);
  });
  test("gebeurtenis zet toestand en sets (resistent/gevoelig) uit de data", function () {
    var c = maakFixture(); c.episodes[0].gebeurtenissen = c.episodes[0].gebeurtenissen.filter(function (e) { return e.id === "P"; });
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); speel(s, "M1"); g.Engine.volgendeDag(s);
    T.gelijk(s.toestanden, ["basis", "erger"]); T.gelijk(s.sets.resistent, ["M2"]);
    var c2 = maakFixture(); c2.episodes[0].gebeurtenissen = c2.episodes[0].gebeurtenissen.filter(function (e) { return e.id === "P" || e.id === "R"; });
    var s2 = g.Engine.nieuwSpel(c2, "X1", { rng: rngVast(0) });
    speel(s2, "K1"); speel(s2, "M1"); g.Engine.volgendeDag(s2);   // P (n=2) en R (K1 + 1 kaart) tegelijk: gevoelig haalt M2 uit resistent
    T.gelijk(s2.sets.resistent, []); T.gelijk(s2.sets.gevoelig, ["M2"]);
  });
  test("raadplegen telt niet mee voor triggers op aantal kaarten", function () {
    var s = nieuw(0); g.Engine.raadpleeg(s); speel(s, "K1"); g.Engine.volgendeDag(s);
    T.is(s.gebeurtenissen.filter(function (e) { return e.id === "P"; }).length, 0);
  });

  /* ---------- M4 klachtenstatus ---------- */
  test("klachten: geen antibioticum actief -> null", function () {
    var s = nieuw(); speel(s, "K1"); g.Engine.volgendeDag(s);
    T.gelijk(s.klachten[2], { dag: 2, status: null, tekst: null });
  });
  test("klachten: werkzaam antibioticum aan het eind van de vorige dag -> af, met tekst uit data", function () {
    var s = nieuw(); speel(s, "M1"); g.Engine.volgendeDag(s);
    T.gelijk(s.klachten[2], { dag: 2, status: "af", tekst: "tekst-af" });
  });
  test("klachten: alleen niet-werkzaam antibioticum actief -> aan", function () {
    var s = nieuw(); speel(s, "M2"); g.Engine.volgendeDag(s);
    T.gelijk(s.klachten[2], { dag: 2, status: "aan", tekst: "tekst-aan" });
  });
  test("klachten: gestopt middel telt niet mee (stop-kaart met doel)", function () {
    var s = nieuw(); speel(s, "M1"); speel(s, "S", { doel: "M1" }); g.Engine.volgendeDag(s);
    T.is(s.klachten[2].status, null);
  });
  test("klachten: werkzaamheid hangt aan de geldende toestand en aan als-voorwaarden", function () {
    // na P (toestand erger) is M2 werkzaam, maar alleen als K1 gespeeld is
    var s = nieuw(0); speel(s, "M2"); speel(s, "K1"); g.Engine.volgendeDag(s);
    T.is(s.toestanden[s.toestanden.length - 1], "erger");
    T.is(s.klachten[2].status, "af", "M2 + K1 in toestand erger");
    var s2 = nieuw(0); speel(s2, "M2"); speel(s2, "K2"); g.Engine.volgendeDag(s2);
    T.is(s2.klachten[2].status, "aan", "M2 zonder K1: als-voorwaarde niet vervuld");
    var s3 = nieuw(0); speel(s3, "M1"); speel(s3, "K2"); g.Engine.volgendeDag(s3);
    T.is(s3.klachten[2].status, "aan", "M1 is niet werkzaam in toestand erger");
  });
  test("klachten: geenVerbetering48 na gebeurtenis met statusNaBeurten 2, blijft tot werkzaam middel actief is", function () {
    var s = nieuw(0);
    speel(s, "K2"); speel(s, "M2"); g.Engine.volgendeDag(s);       // P op dag 2 (banner), toestand erger, M2 zonder K1 niet werkzaam
    T.is(s.klachten[2].status, "aan");
    g.Engine.volgendeDag(s); T.is(s.klachten[3].status, "aan", "dag dA+1");
    g.Engine.volgendeDag(s); T.gelijk(s.klachten[4], { dag: 4, status: "geenVerbetering48", tekst: "tekst-48" });
  });
  test("klachten: geenVerbetering48 blijft (dag 5+) en eindigt zodra een werkzaam middel aan het eind van een dag actief is", function () {
    var casus = maakFixture(); casus.episodes[0].knoppen.aantalDagen = 7;
    var s = g.Engine.nieuwSpel(casus, "X1", { rng: rngVast(0) });
    speel(s, "K2"); speel(s, "M2"); g.Engine.volgendeDag(s);
    dagen(s, 3);                                                    // naar dag 5
    T.is(s.klachten[4].status, "geenVerbetering48"); T.is(s.klachten[5].status, "geenVerbetering48");
    speel(s, "K1"); g.Engine.volgendeDag(s);                        // K1 maakt M2 werkzaam (toestand erger)
    T.is(s.klachten[6].status, "af");
    g.Engine.volgendeDag(s); T.is(s.klachten[7].status, "af");
  });
  test("klachten: werkzaam middel op tijd -> geen override", function () {
    var s = nieuw(0); speel(s, "K1"); speel(s, "M2"); g.Engine.volgendeDag(s);
    dagen(s, 2);
    T.is(s.klachten[2].status, "af"); T.is(s.klachten[3].status, "af"); T.is(s.klachten[4].status, "af");
  });

  /* ---------- M5 validatie ---------- */
  function ongewijzigd(s, fn) {
    var voor = JSON.stringify(s); var r = fn(); T.is(r.ok, false, "verwachtte ok:false"); T.waar(typeof r.fout === "string" && r.fout.length > 5, "Nederlandse foutmelding");
    T.is(JSON.stringify(s), voor, "state ongewijzigd"); return r;
  }
  test("validatie: onbekende kaart en kaart buiten repertoire -> fout, state ongewijzigd", function () {
    var s = nieuw(); ongewijzigd(s, function () { return g.Engine.speelKaart(s, "ONBEKEND"); });
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "Z"); });
  });
  test("validatie: doelkaart zonder doel, met onbekend doel -> fout", function () {
    var s = nieuw(); ongewijzigd(s, function () { return g.Engine.speelKaart(s, "S"); });
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "S", { doel: "NOPE" }); });
  });
  test("validatie: doel met niet-vervuld vereist-predicaat wordt geweigerd, daarna wel toegestaan", function () {
    var s = nieuw(); ongewijzigd(s, function () { return g.Engine.speelKaart(s, "S", { doel: "M2" }); });
    speel(s, "K2"); var r = speel(s, "S", { doel: "M2" }); T.is(r.regel.doel, "M2");
    T.gelijk(s.tijdlijn[1], { volg: 2, kaart: "S", dag: 1, doel: "M2", optie: null });
  });
  test("validatie: kaart zonder doel accepteert geen doel of optie", function () {
    var s = nieuw(); ongewijzigd(s, function () { return g.Engine.speelKaart(s, "K1", { doel: "M1" }); });
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "K1", { optie: "x" }); });
  });
  test("validatie: kaart met opties vraagt verplicht om een geldige optie", function () {
    var s = nieuw();
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "D", { doel: "M1" }); });
    ongewijzigd(s, function () { return g.Engine.speelKaart(s, "D", { doel: "M1", optie: "bestaat-niet" }); });
    var r = speel(s, "D", { doel: "M1", optie: "optie-a" });
    T.gelijk(r.regel, { volg: 1, kaart: "D", dag: 1, doel: "M1", optie: "optie-a" });
  });
  test("validatie: geweigerde zet kost geen actie en telt niet voor triggers", function () {
    var s = nieuw(0); g.Engine.speelKaart(s, "S"); g.Engine.speelKaart(s, "Z"); T.is(s.actiesOver, 3); T.is(s.wachtend.length, 0);
  });

  /* ---------- M6 / M8 data-gedreven ---------- */
  test("nieuwe casus = alleen nieuwe data: tweede synthetische casus met andere ids werkt zonder codewijziging", function () {
    var c = {
      id: "andere", kaarten: [ { id: "a", label: "A", categorie: "x", downside: "d" }, { id: "b", label: "B", categorie: "x", downside: "d" } ],
      episodes: [ { id: "e9", knoppen: { actiesPerBeurt: 1, aantalDagen: 3, raadplegenKost: 0 }, startToestanden: ["t0"], antibiotica: ["b"],
        patient: { zichtbaar: { k: 1 }, waar: {}, verborgen: [ { kaart: "a", onthult: "zie", sleutel: "k", waarde: 2 } ] },
        repertoire: ["a", "b"], gebeurtenissen: [ { id: "ZZ", trigger: { type: "naAantalKaarten", n: 1 }, tekst: "t", toestand: "t1" } ],
        werkzaamheid: { t0: { werkzaam: [ { kaart: "b" } ], nietWerkzaam: [] }, t1: { werkzaam: [], nietWerkzaam: [ { kaart: "b" } ] } },
        statusTeksten: { af: "goed", aan: "slecht", geenVerbetering48: "x" } } ]
    };
    var s = g.Engine.nieuwSpel(c, "e9", {});
    var r = speel(s, "a"); T.is(r.onthuld[0].tekst, "zie"); T.is(s.zichtbaar.k, 2);
    T.is(g.Engine.speelKaart(s, "b").ok, false, "1 actie per beurt");
    g.Engine.volgendeDag(s); T.gelijk(s.gebeurtenissen, [{ id: "ZZ", dag: 2, naVolg: 1 }]); T.gelijk(s.toestanden, ["t0", "t1"]);
    speel(s, "b"); g.Engine.volgendeDag(s); T.is(s.klachten[3].status, "aan"); T.is(s.klachten[3].tekst, "slecht");
  });
  test("klachten: werkzaamheid kiest op datavolgorde, niet op activeringsvolgorde (A/B-trekking verandert het klinische resultaat niet)", function () {
    function speelMet(rngWaarde) {
      var c = maakFixture(), ep = c.episodes[0];
      ep.gebeurtenissen = [
        { id: "P", groep: "PQ", trigger: { type: "naKaart", n: 1 }, tekst: "tp", toestand: "erger" },
        { id: "Q", groep: "PQ", trigger: { type: "naKaart", n: 2 }, tekst: "tq", toestand: "uitdroging" }
      ];
      ep.werkzaamheid.uitdroging = { werkzaam: [ { kaart: "M1" } ], nietWerkzaam: [] };
      ep.werkzaamheid.erger = { werkzaam: [], nietWerkzaam: [ { kaart: "M1" } ] };
      var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(rngWaarde) });
      speel(s, "M1"); speel(s, "K1"); dagen(s, 3);
      return s;
    }
    var a = speelMet(0), b = speelMet(0.99);
    T.waar(JSON.stringify(a.toestanden) !== JSON.stringify(b.toestanden), "de toestanden zijn in andere volgorde geactiveerd: " + a.toestanden + " / " + b.toestanden);
    T.gelijk(a.klachten, b.klachten);
    T.is(a.klachten[2].status, "af"); T.is(a.klachten[3].status, "af");
  });
  test("DBG", function () { var v = bronScan(g.Engine._bron); throw new Error(v.length + "\n" + v.join("\n")); });
  test("herkansing: nieuw spel zelfde episode, schone staat; poging wordt niet door de engine geteld", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); g.Engine.rondAf(s);
    var h = g.Engine.herkansing(s);
    T.is(h.afgerond, false); T.gelijk(h.tijdlijn, []); T.is(h.dag, 1); T.is(h.actiesOver, 3); T.is(h.episodeId, "X1");
    T.is("pogingnummer" in h || "eerstePoging" in h, false);
    T.is(g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }).dag, 1);
    T.waar(!/pogingenTeller|pogingnummer|eerstePoging/.test(g.Engine._bron), "geen geheugenteller in de engine");
  });
  test("casus-object wordt niet gemuteerd door een volledig spel", function () {
    var c = maakFixture(), voor = JSON.stringify(c), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K2"); speel(s, "M1"); g.Engine.volgendeDag(s); dagen(s, 3); g.Engine.rondAf(s);
    T.is(JSON.stringify(c), voor);
  });

  /* ---------- M7 ontgrendelen en herkansing ---------- */
  test("ontgrendeld: eerste episode altijd open, volgende pas na gehaald", function () {
    var c = maakFixture();
    T.is(g.Engine.ontgrendeld(c, "X1", []), true); T.is(g.Engine.ontgrendeld(c, "X2", []), false);
    T.is(g.Engine.ontgrendeld(c, "X2", ["X1"]), true);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", poortGehaald: false }]), false);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", poortGehaald: true }]), true);
    T.is(g.Engine.ontgrendeld(c, "X2", { X1: true }), true);
    T.is(g.Engine.ontgrendeld(c, "BESTAATNIET", ["X1"]), false);
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, []), ["X1"]); T.gelijk(g.Engine.ontgrendeldeEpisodes(c, ["X1"]), ["X1", "X2"]);
  });
  test("ontgrendeld met Logging-records (contract 6): poortGehaald===true OF (geen veld poortGehaald en geschonden leeg)", function () {
    var c = maakFixture();
    function rec(extra) { var r = { pseudoniem: "p", casusId: "fixtuur", episodeId: "X1", tijdlijn: [], onthuld: [], score: null, profiel: null }; for (var k in extra) r[k] = extra[k]; return r; }
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: [] })]), true, "Logging-record zonder schending");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: ["I3"] })]), false, "Logging-record met schending");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: ["I3"] }), rec({ geschonden: [] })]), true, "latere poging gehaald");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: [], poortGehaald: false })]), false, "expliciet niet gehaald wint");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ poortGehaald: true, geschonden: ["x"] })]), true);
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({})]), false, "geschonden ontbreekt: niet gehaald");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ geschonden: [], episodeId: "ANDER" })]), false, "andere episode telt niet");
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, [rec({ geschonden: [] })]), ["X1", "X2"]);
  });

  /* ---------- ronde 3: F1 (ontgrendelen per casus), F2 (atomische volgendeDag), F3 (contractgedrag vastgepind) ---------- */

  test("ontgrendeld: een Logging-record van een ANDERE casus (casusId) opent niets, ook niet met lege geschonden-lijst of poortGehaald", function () {
    var c = maakFixture();
    function rec(extra) { var r = { pseudoniem: "p", casusId: "andere-casus", episodeId: "X1", tijdlijn: [], geschonden: [] }; for (var k in extra) r[k] = extra[k]; return r; }
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({})]), false, "andere casus, geschonden leeg");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ poortGehaald: true })]), false, "andere casus, poortGehaald");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ uitkomst: { poortGehaald: true } })]), false, "andere casus, uitkomst.poortGehaald");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({ casusId: "fixtuur" })]), true, "dezelfde casus telt wel");
    T.is(g.Engine.ontgrendeld(c, "X2", [rec({}), rec({ casusId: "fixtuur" })]), true, "gemengd: het record van de eigen casus telt");
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", geschonden: [] }]), true, "record zonder casusId blijft geldig (oudere vorm)");
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, [rec({})]), ["X1"]);
    // Eerste episode is altijd open en een episode van een andere casus bestaat hier niet.
    T.is(g.Engine.ontgrendeld(c, "X1", [rec({})]), true);
  });
  test("ontgrendeld: record-vorm {episodeId, uitkomst:{poortGehaald}} wordt gelezen; false/ontbrekend telt niet", function () {
    var c = maakFixture();
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", uitkomst: { poortGehaald: true } }]), true);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", uitkomst: { poortGehaald: false } }]), false);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", uitkomst: { poortGehaald: false }, geschonden: [] }]), false, "expliciet niet gehaald wint van lege lijst");
  });

  test("volgendeDag is atomisch: een fout (kapot predicaat in de data) laat de state exact ongewijzigd; daarna werkt dezelfde stap alsnog", function () {
    var c = maakFixture(); c.episodes[0].werkzaamheid.erger.werkzaam[0].als = { p: "bestaatniet" };
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); speel(s, "M2");              // P (kaart 2) wacht; M2 is straks actief in toestand erger
    var voor = JSON.stringify(s), toestandenRef = s.toestanden, wachtendRef = s.wachtend;
    T.gooit(function () { g.Engine.volgendeDag(s); });
    T.is(JSON.stringify(s), voor, "state ongewijzigd na de fout");
    T.waar(s.toestanden === toestandenRef && s.wachtend === wachtendRef, "zelfde arrays (in-place hersteld)");
    T.is(s.dag, 1); T.is(s.klachten.length, 2); T.is(s.wachtend.length, 2, "P en R wachten"); T.gelijk(s.gebeurtenissen, []); T.gelijk(s.toestanden, ["basis"]);
    T.gelijk(s.sets, { resistent: [], gevoelig: [] });
    T.gooit(function () { g.Engine.volgendeDag(s); });
    T.is(JSON.stringify(s), voor, "ook een tweede poging verandert niets (geen overgeslagen dag)");
    c.episodes[0].werkzaamheid.erger.werkzaam[0].als = { p: "gespeeld", K: { kaart: "K1" } };   // data hersteld
    g.Engine.volgendeDag(s);
    T.is(s.dag, 2); T.is(s.klachten[2].status, "af"); T.is(s.gebeurtenissen.length, 2); T.is(s.wachtend.length, 0); T.is(s.actiesOver, 3);
  });
  test("volgendeDag is atomisch ook voor sets/toestanden: een gebeurtenis met zet wordt bij een fout niet half toegepast", function () {
    var c = maakFixture(); c.episodes[0].werkzaamheid.erger.werkzaam[0].als = { p: "bestaatniet" };
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); speel(s, "M2");
    T.gooit(function () { g.Engine.volgendeDag(s); });
    T.gelijk(s.sets.resistent, [], "P zet M2 resistent; bij een fout niet bewaard"); T.gelijk(s.toestanden, ["basis"]);
    T.is(s.actiesOver, 1);
  });

  /* validatie: de boodschap moet de BEDOELDE reden noemen, niet een andere weigering */
  test("validatie: doel ontbreekt en optie ontbreekt geven elk hun eigen melding", function () {
    var s = nieuw();
    var r1 = g.Engine.speelKaart(s, "S"); T.is(r1.ok, false); T.waar(/Kies eerst een doel/.test(r1.fout), r1.fout);
    var r2 = g.Engine.speelKaart(s, "D", { doel: "M1" }); T.is(r2.ok, false); T.waar(/Kies eerst een optie/.test(r2.fout), r2.fout);
    var r3 = g.Engine.speelKaart(s, "D", { doel: "M1", optie: "bestaat-niet" }); T.waar(/hoort niet bij dit doel/.test(r3.fout), r3.fout);
    var r4 = g.Engine.speelKaart(s, "S", { doel: "NOPE" }); T.waar(/kan niet bij de kaart/.test(r4.fout), r4.fout);
    T.is(s.tijdlijn.length, 0);
  });
  test("validatie: een doelkaart ZONDER opties (S) weigert een optie met de melding dat er geen opties zijn", function () {
    var s = nieuw(); var r = g.Engine.speelKaart(s, "S", { doel: "M1", optie: "x" });
    T.is(r.ok, false); T.waar(/geen opties/.test(r.fout), r.fout); T.is(s.tijdlijn.length, 0); T.is(s.actiesOver, 3);
  });
  test("validatie: vereist-predicaat ziet gebeurtenissen en klachtenstatus van de state (ctx is volledig)", function () {
    var c = maakFixture(); var k = c.kaarten.filter(function (x) { return x.id === "S"; })[0];
    k.doelen.X1 = [ { id: "M1", label: "Middel een", vereist: { p: "gebeurtenisGeweest", id: "P" } },
                    { id: "M2", label: "Middel twee", vereist: { p: "klachtenNu", waarde: "aan" } } ];
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    T.is(g.Engine.speelKaart(s, "S", { doel: "M1" }).ok, false, "P nog niet gebeurd");
    T.is(g.Engine.speelKaart(s, "S", { doel: "M2" }).ok, false, "klachten nog niet aan");
    speel(s, "K1"); speel(s, "M2"); g.Engine.volgendeDag(s);           // P op dag 2, M2 niet werkzaam zonder K1? (K1 gespeeld: wel) -> status af
    T.is(s.klachten[2].status, "af"); speel(s, "S", { doel: "M1" });   // gebeurtenisGeweest P
    var c2 = maakFixture(); c2.kaarten.filter(function (x) { return x.id === "S"; })[0].doelen.X1 = [ { id: "M2", label: "x", vereist: { p: "klachtenNu", waarde: "aan" } } ];
    var t = g.Engine.nieuwSpel(c2, "X1", { rng: rngVast(0) });
    speel(t, "M2"); g.Engine.volgendeDag(t);                            // M2 in basis: niet werkzaam -> aan
    T.is(t.klachten[2].status, "aan"); speel(t, "S", { doel: "M2" });
  });

  /* raadplegen: grenzen */
  test("raadpleeg: precies 'kost' acties over is genoeg (kost 1, 1 actie over -> ok, 0 over); bij 0 over geweigerd", function () {
    var s = nieuw(); speel(s, "K1"); speel(s, "K2"); T.is(s.actiesOver, 1);
    var r = g.Engine.raadpleeg(s); T.is(r.ok, true); T.is(s.actiesOver, 0); T.is(s.raadplegingen.length, 1);
    var r2 = g.Engine.raadpleeg(s); T.is(r2.ok, false); T.waar(/acties/.test(r2.fout)); T.is(s.raadplegingen.length, 1);
  });
  test("raadpleeg: na de laatste dag geweigerd (ook al zijn er acties over)", function () {
    var s = nieuw(); dagen(s, 4); T.is(s.dagenVoorbij, true); T.waar(s.actiesOver >= 1);
    var voor = JSON.stringify(s), r = g.Engine.raadpleeg(s); T.is(r.ok, false); T.waar(/laatste dag/.test(r.fout), r.fout); T.is(JSON.stringify(s), voor);
  });

  /* afronden */
  test("rondAf: gooit Evaluatie.beoordeel een fout, dan blijft de episode open (afgerond=false, geen uitkomst) en kan opnieuw", function () {
    var s = nieuw(); speel(s, "K1"); var o = g.Evaluatie;
    g.Evaluatie = { beoordeel: function () { throw new Error("kapot"); } };
    try { T.gooit(function () { g.Engine.rondAf(s); }); } finally { g.Evaluatie = o; }
    T.is(s.afgerond, false); T.is(s.uitkomst, null); T.is(g.Engine.eindeBereikt(s), false);
    T.is(g.Engine.speelKaart(s, "K2").ok, true, "na de fout kan er nog gespeeld worden");
    T.is(g.Engine.rondAf(s).stub, true); T.is(s.afgerond, true);
  });
  test("rondAf: Evaluatie.beoordeel krijgt (casus, episodeId, state) en de uitkomst gaat ongewijzigd terug (stub-grens naar S6)", function () {
    var s = nieuw(), gezien = null, uit = { eigen: 1 }, o = g.Evaluatie;
    g.Evaluatie = { beoordeel: function (c, e, st) { gezien = [c.id, e, st === s]; return uit; } };
    try { T.is(g.Engine.rondAf(s), uit); T.is(s.uitkomst, uit); } finally { g.Evaluatie = o; }
    T.gelijk(gezien, ["fixtuur", "X1", true]);
  });
  test("afrondenPasNaGebeurtenissen aan: een gebeurtenis die getriggerd maar nog wachtend is telt NIET als gebeurd; na de volgende dag wel", function () {
    var c = maakFixture(); c.episodes[0].afrondenPasNaGebeurtenissen = true;
    c.episodes[0].gebeurtenissen = c.episodes[0].gebeurtenissen.filter(function (e) { return e.id === "P"; }); c.episodes[0].gebeurtenissen[0].groep = undefined;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); speel(s, "M1"); T.is(s.wachtend.length, 1);
    T.gooit(function () { g.Engine.rondAf(s); }); T.is(s.afgerond, false);
    g.Engine.volgendeDag(s); T.is(s.gebeurtenissen.length, 1);
    T.is(g.Engine.rondAf(s).stub, true);
  });
  test("afrondenPasNaGebeurtenissen aan: na de laatste dag (dagenVoorbij) mag afronden altijd (contract 4b)", function () {
    var c = maakFixture(); c.episodes[0].afrondenPasNaGebeurtenissen = true;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    dagen(s, 4); T.is(s.dagenVoorbij, true);
    T.waar(s.gebeurtenissen.length < c.episodes[0].gebeurtenissen.length, "er zijn nog gebeurtenissen niet gebeurd");
    T.is(g.Engine.rondAf(s).stub, true); T.is(s.afgerond, true);
  });

  /* onthullen */
  function onthulCasus(verborgen, zichtbaar, waar) {
    var c = maakFixture(), e = c.episodes[0];
    e.patient.verborgen = verborgen; if (zichtbaar) e.patient.zichtbaar = zichtbaar; if (waar) e.patient.waar = waar;
    return c;
  }
  test("onthullen: zonder 'waarde' in de data wordt patient.waar[sleutel] onthuld (contract 4b), ook in zichtbaar", function () {
    var c = onthulCasus([ { kaart: "K2", onthult: "tekst", sleutel: "w" } ], { lab: { w: 10 } }, { w: 7 });
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); var r = speel(s, "K2");
    T.is(r.onthuld[0].waarde, 7); T.is(s.onthuld[0].waarde, 7); T.is(s.zichtbaar.lab.w, 7); T.is(c.episodes[0].patient.waar.w, 7);
  });
  test("onthullen: sleutel met punt ('lab.w') zet het geneste veld; een nieuw pad wordt aangemaakt", function () {
    var c = onthulCasus([ { kaart: "K2", onthult: "a", sleutel: "lab.w", waarde: 4 }, { kaart: "K1", onthult: "b", sleutel: "nieuw.diep", waarde: 5 } ], { lab: { w: 10 } }, {});
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); speel(s, "K2"); speel(s, "K1");
    T.is(s.zichtbaar.lab.w, 4); T.is(s.zichtbaar.nieuw.diep, 5); T.is(s.zichtbaar["lab.w"], undefined, "geen veld met een punt in de naam");
  });
  test("onthullen: zichtbaar-patch wordt gemengd (geneste objecten samengevoegd) zonder de casusdata te delen of te muteren", function () {
    var c = onthulCasus([ { kaart: "K2", onthult: "t", sleutel: "w", waarde: { a: 1 }, zichtbaar: { lab: { extra: { x: 1 } }, vlag: true } } ], { lab: { w: 10, datum: "d" } }, {});
    var voor = JSON.stringify(c), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); var r = speel(s, "K2");
    T.is(s.zichtbaar.lab.datum, "d", "bestaand veld blijft"); T.is(s.zichtbaar.lab.extra.x, 1); T.is(s.zichtbaar.vlag, true);
    s.zichtbaar.lab.extra.x = 99; s.zichtbaar.lab.w.a = 99; r.onthuld[0].waarde.a = 99; s.onthuld[0].waarde.a = 98;
    T.is(JSON.stringify(c), voor, "casusdata wordt niet gedeeld met state of resultaat");
  });
  test("onthullen: het resultaat van speelKaart is een kopie (wijzigen ervan raakt state.onthuld niet)", function () {
    var s = nieuw(); var r = speel(s, "K2"); r.onthuld[0].tekst = "veranderd";
    T.is(s.onthuld[0].tekst, "Verborgen tekst");
    var r2 = speel(s, "M1"); r2.regel.kaart = "X"; T.is(s.tijdlijn[1].kaart, "M1");
  });

  /* gebeurtenissen: eerste keer, statusNaBeurten uit de data */
  test("trigger naKaartVanKaart telt vanaf de EERSTE keer dat de kaart is gespeeld", function () {
    var s = nieuw(0); speel(s, "K1"); speel(s, "K1"); speel(s, "M1");   // K1 is kaart 1 en 2
    var r = s.wachtend.filter(function (x) { return x.id === "R"; });
    T.is(r.length, 1); T.is(r[0].naVolg, 2, "R na eerste K1 (kaart 1) + 1 = kaart 2, niet na de tweede K1 (dat zou kaart 3 zijn)");
  });
  test("statusNaBeurten komt uit de data: met 3 is de override pas op dA+3 (niet op dA+2)", function () {
    var c = maakFixture(); c.episodes[0].knoppen.aantalDagen = 8; c.episodes[0].gebeurtenissen[0].zet.statusNaBeurten = 3;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K2"); speel(s, "M2"); g.Engine.volgendeDag(s);          // P op dag 2 = dA
    g.Engine.volgendeDag(s); T.is(s.klachten[3].status, "aan");
    g.Engine.volgendeDag(s); T.is(s.klachten[4].status, "aan", "dA+2: nog geen override bij statusNaBeurten 3");
    g.Engine.volgendeDag(s); T.is(s.klachten[5].status, "geenVerbetering48", "dA+3");
    g.Engine.volgendeDag(s); T.is(s.klachten[6].status, "geenVerbetering48", "blijft");
  });
  test("statusNaBeurten ontbreekt: een gebeurtenis zonder dat veld geeft nooit de 48-uurs override", function () {
    var c = maakFixture(); c.episodes[0].knoppen.aantalDagen = 8; delete c.episodes[0].gebeurtenissen[0].zet.statusNaBeurten;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K2"); speel(s, "M2"); g.Engine.volgendeDag(s); dagen(s, 5);
    for (var d = 2; d <= 7; d++) T.is(s.klachten[d].status, "aan", "dag " + d);
  });
  test("klachtenstatus kijkt naar het EIND van de vorige dag: een middel dat vandaag pas wordt gestart telt nog niet", function () {
    var s = nieuw(); speel(s, "M1"); g.Engine.volgendeDag(s);           // dag 2 begint
    T.is(s.klachten[2].status, "af");
    speel(s, "S", { doel: "M1" }); g.Engine.volgendeDag(s);             // M1 gestopt op dag 2
    T.is(s.klachten[3].status, null, "gestopt op dag 2: aan het eind van dag 2 niet meer actief");
    var t = nieuw(); g.Engine.volgendeDag(t); T.is(t.klachten[2].status, null);
    speel(t, "M1"); T.is(t.klachten[2].status, null, "een kaart van vandaag verandert de status van vandaag niet");
  });

  /* herkansing en rng */
  test("herkansing: neemt opties.rng over, anders de rng van het vorige spel; trekt dus opnieuw volgens die rng", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    T.gelijk(g.Engine.herkansing(s).groepen.PQ, ["P", "Q"], "rng van het vorige spel (0)");
    T.gelijk(g.Engine.herkansing(s, { rng: rngVast(0.99) }).groepen.PQ, ["Q", "P"], "opties.rng wint");
    var s2 = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0.99) });
    T.gelijk(g.Engine.herkansing(s2).groepen.PQ, ["Q", "P"], "rng van het vorige spel (0.99)");
    T.gelijk(g.Engine.herkansing(s2, { rng: rngVast(0) }).groepen.PQ, ["P", "Q"]);
    T.is(g.Engine.herkansing(s2).casusId, "fixtuur"); T.is(g.Engine.herkansing(s2).episodeId, "X1");
  });
  test("herkansing: afrondenPasNaGebeurtenissen uit opties wordt doorgegeven", function () {
    var s = nieuw(); T.is(g.Engine.herkansing(s, { afrondenPasNaGebeurtenissen: true }).afrondenPasNaGebeurtenissen, true);
  });

  /* nieuwSpel: knoppen */
  test("nieuwSpel: ontbrekende of onjuiste knoppen (actiesPerBeurt, aantalDagen) geven een Nederlandse fout", function () {
    function met(wijzig) { var c = maakFixture(); wijzig(c.episodes[0]); return c; }
    [ function (e) { delete e.knoppen; }, function (e) { delete e.knoppen.actiesPerBeurt; }, function (e) { delete e.knoppen.aantalDagen; },
      function (e) { e.knoppen.actiesPerBeurt = "3"; }, function (e) { e.knoppen.aantalDagen = "4"; } ].forEach(function (w, i) {
      try { g.Engine.nieuwSpel(met(w), "X1", {}); T.waar(false, "geen fout bij variant " + i); }
      catch (e) { T.waar(/knoppen/.test(e.message) && /De episode/.test(e.message), "variant " + i + ": " + e.message); }
    });
  });

  /* geen koppeling aan id's: een synthetische casus met dezelfde id's als UWI maar andere inhoud moet de data volgen */
  test("geen id-koppeling: episode 'E2' met 2 acties, gebeurtenis 'C' na kaart 2 en kaart 'V9' volgen alleen de data", function () {
    var c = {
      id: "nep", kaarten: [ { id: "V9", label: "x", categorie: "c", downside: "d" }, { id: "O1", label: "y", categorie: "c", downside: "d" }, { id: "G1", label: "z", categorie: "c", downside: "d" } ],
      raadplegen: { titel: "t", bronnen: [] },
      episodes: [ { id: "E2", knoppen: { actiesPerBeurt: 2, aantalDagen: 3, raadplegenKost: 0 }, startToestanden: ["cystitis"], antibiotica: [],
        patient: { zichtbaar: {}, waar: { eGFR: 10 }, verborgen: [] }, repertoire: ["V9", "O1", "G1"],
        gebeurtenissen: [ { id: "C", trigger: { type: "naKaart", n: 2 }, tekst: "t", toestand: "weefselinvasie" } ], werkzaamheid: {} } ]
    };
    var s = g.Engine.nieuwSpel(c, "E2", {});
    T.is(s.actiesOver, 2); speel(s, "V9"); speel(s, "G1");
    T.is(g.Engine.speelKaart(s, "O1").ok, false, "2 acties, geen vaste 3");
    g.Engine.volgendeDag(s); T.is(s.actiesOver, 2, "budget uit de data (niet 3)");
    T.gelijk(s.gebeurtenissen, [{ id: "C", dag: 2, naVolg: 2 }], "C zonder O1, gewoon na kaart 2");
    T.gelijk(s.toestanden, ["cystitis", "weefselinvasie"]);
    T.is(g.Engine.raadpleeg(s).kost, 0, "raadplegenkost uit de data");
    g.Engine.volgendeDag(s); T.is(s.klachten[3].status, null);
  });

  /* ---------- echte regeltaal + echte UWI-data (geen stubs) ---------- */
  function echt(naam, fn) {
    T.registreer(GROEP, "echt: " + naam, function () {
      // Nooit stil terugkeren: ontbreekt de echte regeltaal of de echte data, dan is deze test ROOD (niet groen zonder bewijs).
      T.waar(!!g.Predicaten && typeof g.Predicaten.evalueer === "function", "echte regeltaal (regels/predicaten.js, window.Predicaten) ontbreekt: deze test bewijst niets en is daarom rood");
      T.waar(!!g.CASUSSEN && !!g.CASUSSEN[0] && Array.isArray(g.CASUSSEN[0].episodes) && g.CASUSSEN[0].episodes.length > 0, "echte casusdata (window.CASUSSEN[0].episodes uit casussen/uwi*.js) ontbreekt: deze test bewijst niets en is daarom rood");
      fn(g.CASUSSEN[0]);
    });
  }
  function ep(c, id) { return c.episodes.filter(function (e) { return e.id === id; })[0]; }
  function spel(c, id, w) { return g.Engine.nieuwSpel(c, id, { rng: rngVast(w == null ? 0 : w) }); }
  function iedereen(s, lijst) { lijst.forEach(function (k) { if (k === "|") g.Engine.volgendeDag(s); else speel(s, k); }); }

  echt("E1 volledig spel: G1, G2, V4 | N1, Ev1 | rest van de dagen; klachtenstatus uit de data; geen onthulling", function (c) {
    var voor = JSON.stringify(c), s = spel(c, "E1");
    T.gelijk(s.toestanden, ep(c, "E1").startToestanden);
    var r = speel(s, "G2"); T.gelijk(r.onthuld, [], "E1 heeft geen verborgen gegevens");
    T.is(s.zichtbaar.labTekst, ep(c, "E1").patient.zichtbaar.labTekst);
    iedereen(s, ["G1", "V4", "|", "N1", "Ev1", "|"]);
    T.is(s.klachten[2].status, "af"); T.is(s.klachten[2].tekst, ep(c, "E1").statusTeksten.af);
    T.gelijk(s.tijdlijn.map(function (x) { return x.volg + x.kaart + "@" + x.dag; }), ["1G2@1", "2G1@1", "3V4@1", "4N1@2", "5Ev1@2"]);
    T.is(g.Engine.speelKaart(s, "V6").ok, false, "V6 zit niet in het repertoire van E1");
    T.is(g.Engine.speelKaart(s, "G3").ok, false, "G3 zit niet in het repertoire van E1");
    g.Engine.volgendeDag(s); g.Engine.volgendeDag(s); T.is(s.dag, 5); T.is(s.klachten[5].status, "af");
    g.Engine.volgendeDag(s); T.is(g.Engine.eindeBereikt(s), true);
    T.is(JSON.stringify(c), voor, "casusdata ongewijzigd");
    T.is(g.Engine.raadpleeg(spel(c, "E1")).ok, true);
  });

  echt("raadpleeg leest casus.raadplegen (casusniveau), kost uit episode.knoppen", function (c) {
    var s = spel(c, "E1"), r = g.Engine.raadpleeg(s);
    T.is(r.ok, true); T.gelijk(r.bronnen, c.raadplegen.bronnen); T.is(r.titel, c.raadplegen.titel); T.is(r.kost, ep(c, "E1").knoppen.raadplegenKost);
  });
  echt("E1: V3 daarna nog V4 (twee antibiotica) en trimethoprim geven werkzame status; zonder antibioticum status null", function (c) {
    var s = spel(c, "E1"); iedereen(s, ["G1", "|"]); T.is(s.klachten[2].status, null);
    var s2 = spel(c, "E1"); iedereen(s2, ["V5", "|"]); T.is(s2.klachten[2].status, "af");
  });

  echt("E2: G2 onthult eGFR 29 (waar blijft 29, zichtbaar was 42), pas na G2", function (c) {
    var e = ep(c, "E2"), s = spel(c, "E2"), zichtVoor = JSON.stringify(s.zichtbaar);
    T.is(e.patient.zichtbaar.lab.eGFR, 42);
    speel(s, "G1"); T.is(JSON.stringify(s.zichtbaar), zichtVoor); T.is(s.onthuld.length, 0);
    var r = speel(s, "G2");
    T.is(r.onthuld.length, 1); T.is(r.onthuld[0].waarde, 29); T.is(r.onthuld[0].sleutel, "eGFR"); T.is(r.onthuld[0].tekst, e.patient.verborgen[0].onthult, "tekst letterlijk uit de data");
    T.is(s.zichtbaar.lab.eGFR, 29); T.is(s.zichtbaar.lab.datum, "uit de jaarlijkse controle"); T.is(s.zichtbaar.labTekst, e.patient.verborgen[0].zichtbaar.labTekst, "labTekst letterlijk uit de data");
    T.is(e.patient.waar.eGFR, 29, "waar ongewijzigd"); T.is(e.patient.zichtbaar.lab.eGFR, 42, "casusdata zichtbaar niet gemuteerd");
    T.is(speel(s, "G2").onthuld.length, 0, "niet dubbel");
    // Predicaat 'waar' rekent met de ware waarde, ook zonder G2
    var s2 = spel(c, "E2"), ctx = g.Predicaten.maakContext(c, e, s2);
    T.is(g.Predicaten.evalueer({ p: "waar", veld: "eGFR", op: "<", waarde: 30 }, ctx), true);
  });

  echt("E2: kweekuitslag C komt na de 4e kaart alleen als O1 gespeeld is; zet resistent/gevoelig uit de data", function (c) {
    var e = ep(c, "E2"), cdef = e.gebeurtenissen.filter(function (x) { return x.id === "C"; })[0];
    var met = spel(c, "E2"); iedereen(met, ["G1", "G2", "O1", "|", "V4", "|"]);
    T.gelijk(met.gebeurtenissen.map(function (x) { return x.id + "@" + x.dag + "/" + x.naVolg; }), ["C@3/4"], "banner pas op de volgende dag (dag 3), na kaart 4");
    T.gelijk(met.sets.resistent, cdef.zet.resistent); T.gelijk(met.sets.gevoelig, cdef.zet.gevoelig);
    var zonder = spel(c, "E2"); iedereen(zonder, ["G1", "G2", "V4", "|", "N1", "|"]);
    T.gelijk(zonder.gebeurtenissen, [], "geen O1: geen kweekuitslag");
    T.gelijk(zonder.sets.resistent, []);
    var laat = spel(c, "E2"); iedereen(laat, ["G1", "G2", "V4", "|", "N1", "O1", "|"]);
    T.gelijk(laat.gebeurtenissen, [], "O1 pas als 5e kaart: C komt niet (meest letterlijke lezing, TODO_BART in data)");
    T.waar(/O1 pas na de 4e kaart/.test(cdef.TODO_BART), "W1 staat als TODO_BART in de data");
  });

  echt("E2: V6 vereist een gestart middel/actieve comedicatie via de echte vereist-predicaten, en een optie", function (c) {
    var s = spel(c, "E2");
    var r = g.Engine.speelKaart(s, "V6", { doel: "V5", optie: "halveren" });
    T.is(r.ok, false); T.waar(/niet beschikbaar/.test(r.fout), r.fout);
    iedereen(s, ["G1", "G2", "V5"]); iedereen(s, ["|"]);
    var r2 = g.Engine.speelKaart(s, "V6", { doel: "V5" }); T.is(r2.ok, false); T.waar(/optie/.test(r2.fout), r2.fout);
    var voor = JSON.stringify(s); T.is(g.Engine.speelKaart(s, "V6", { doel: "V5", optie: "bestaat-niet" }).ok, false); T.is(JSON.stringify(s), voor);
    var ok = speel(s, "V6", { doel: "V5", optie: "halveren" });
    T.gelijk(ok.regel, { volg: 4, kaart: "V6", dag: 2, doel: "V5", optie: "halveren" });
  });

  echt("E3: G3 onthult, A en B in beide volgordes (rng), C = 3 kaarten na O1, klachtenstatus volgens toestand", function (c) {
    var e = ep(c, "E3"), A = e.gebeurtenissen.filter(function (x) { return x.id === "A"; })[0], B = e.gebeurtenissen.filter(function (x) { return x.id === "B"; })[0];
    var s0 = spel(c, "E3", 0), s1 = spel(c, "E3", 0.99);
    T.gelijk(s0.volgordeAB, ["A", "B"]); T.gelijk(s1.volgordeAB, ["B", "A"]);
    var r = speel(s0, "G3"); T.is(r.onthuld.length, 1); T.is(r.onthuld[0].kaart, "G3");
    // Beide volgordes, zelfde zetten: G1, G3, O1 | V4, N1 | N2, Ev1 | ...
    [s0, s1].forEach(function (s, ix) {
      if (ix === 1) speel(s, "G3");
      iedereen(s, ["G1", "O1", "|", "V4", "N1", "|"]);
    });
    // kaarten: G3(1) G1(2) O1(3) V4(4) N1(5): eerste trigger op kaart 4, C op kaart 6
    T.gelijk(s0.gebeurtenissen.map(function (x) { return x.id + "@" + x.dag + "/" + x.naVolg; }), ["A@3/4"]);
    T.gelijk(s1.gebeurtenissen.map(function (x) { return x.id + "@" + x.dag + "/" + x.naVolg; }), ["B@3/4"]);
    T.waar(s0.toestanden.indexOf(A.toestand) >= 0 && s0.toestanden.indexOf(B.toestand) < 0);
    T.waar(s1.toestanden.indexOf(B.toestand) >= 0 && s1.toestanden.indexOf(A.toestand) < 0);
    iedereen(s0, ["Ev1"]); T.gelijk(s0.wachtend.map(function (x) { return x.id; }), ["C"], "C na O1 + 3 kaarten (kaart 6)");
    g.Engine.volgendeDag(s0);
    T.waar(s0.gebeurtenissen.some(function (x) { return x.id === "C" && x.dag === 4 && x.naVolg === 6; }));
    T.waar(s0.sets.resistent.length > 0 && s0.sets.gevoelig.length > 0, "sets uit de data");
    // A: weefselinvasie -> fosfomycine niet werkzaam: aan, daarna 'geen verbetering na 48 uur' op dA+2
    T.is(s0.klachten[3].status, "aan");
    T.is(s0.klachten[3].tekst, e.statusTeksten.aan);
    // dag 3 = dA; dag 5 = dA+2
    g.Engine.volgendeDag(s0); T.is(s0.klachten[5].status, "geenVerbetering48"); T.is(s0.klachten[5].tekst, e.statusTeksten.geenVerbetering48);
    // Zonder statusNaBeurten op B: geen override door B alleen
    T.is(B.zet && B.zet.statusNaBeurten, undefined);
  });

  echt("E3: A/B-volgorde verandert niet welke werkzaamheid geldt (datavolgorde van episode.werkzaamheid)", function (c) {
    var e = ep(c, "E3");
    var sleutels = Object.keys(e.werkzaamheid).filter(function (k) { return k !== "statusTeksten" && k.indexOf("TODO_BART") !== 0; });
    T.waar(sleutels.length >= 2, "twee toestanden met werkzaamheid in E3");
    var s = spel(c, "E3"); iedereen(s, ["V8", "|"]);
    T.is(s.klachten[2].status, "aan", "V8 in cystitis (geen entry) is nog niet werkzaam");
  });

  echt("E3: hele reis speelt door met de echte regeltaal zonder uitzondering (willekeurige zetten, vaste rng)", function (c) {
    var ids = ep(c, "E3").repertoire;
    for (var ronde = 0; ronde < 40; ronde++) {
      var seed = ronde * 7 + 1, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      var s = g.Engine.nieuwSpel(c, "E3", { rng: rnd });
      for (var stap = 0; stap < 60 && !g.Engine.eindeBereikt(s); stap++) {
        var k = ids[Math.floor(rnd() * ids.length)], voor = JSON.stringify(s);
        var kaart = c.kaarten.filter(function (x) { return x.id === k; })[0], opts = {};
        if (kaart.doelen && kaart.doelen.E3) { var d = kaart.doelen.E3[Math.floor(rnd() * kaart.doelen.E3.length)]; opts.doel = d.id; if (kaart.opties) opts.optie = (kaart.opties[d.id] || [{ tekst: "x" }])[0].tekst; }
        var r = g.Engine.speelKaart(s, k, opts);
        if (!r.ok) { T.is(JSON.stringify(s), voor, "state ongewijzigd bij geweigerde zet"); T.waar(typeof r.fout === "string"); }
        if (s.actiesOver === 0 || rnd() < 0.2) g.Engine.volgendeDag(s);
        T.waar(s.actiesOver >= 0);
      }
    }
  });
  /* ---------- ronde 4: atomiciteit (F1), herkansing met opties (F2), ontgrendelen/herkansing latere episodes (F3), vastgepind gedrag (F4/F6/F7) ---------- */
  function gooitMet(fn, re, msg) {
    var m = null;
    try { fn(); } catch (e) { m = String((e && e.message) || e); }
    T.waar(m !== null, (msg || "verwachtte een fout") + " (er kwam geen fout)");
    T.waar(re.test(m), (msg || "foutmelding") + ": verwachtte " + re + ", kreeg: " + m);
  }
  function maakMini(gebeurtenissen, wijzig) {
    var kaart = function (id, extra) { var k = { id: id, categorie: "x", label: "Kaart " + id, doelkaart: false, downside: "d" }; for (var q in extra) k[q] = extra[q]; return k; };
    var c = {
      id: "mini", kaarten: [ kaart("a"), kaart("b"), kaart("c"), kaart("d"),
        kaart("s", { doelkaart: true, doelen: { m1: [ { id: "a", label: "a" }, { id: "b", label: "b" } ] } }) ],
      raadplegen: { titel: "t", bronnen: ["b1"] },
      episodes: [ { id: "m1", knoppen: { actiesPerBeurt: 3, aantalDagen: 6, raadplegenKost: 0 }, startToestanden: ["basis"], antibiotica: ["a", "b"],
        patient: { zichtbaar: { lab: { w: 10 } }, waar: { w: 3 }, verborgen: [] }, repertoire: ["a", "b", "c", "d", "s"],
        gebeurtenissen: gebeurtenissen || [], werkzaamheid: {}, statusTeksten: { af: "af!", aan: "aan!", geenVerbetering48: "48!" } } ]
    };
    if (wijzig) wijzig(c.episodes[0], c);
    return c;
  }
  function miniSpel(gebeurtenissen, rng, wijzig) { return g.Engine.nieuwSpel(maakMini(gebeurtenissen, wijzig), "m1", { rng: rng || rngVast(0) }); }
  // Speelt "c" tot er n kaarten op de tijdlijn staan (met volgende dagen ertussen) en past daarna de wachtende gebeurtenissen toe.
  function speelTot(s, n) {
    while (s.tijdlijn.length < n) { if (s.actiesOver < 1) g.Engine.volgendeDag(s); speel(s, "c"); }
    g.Engine.volgendeDag(s);
    return s;
  }
  function ev(s) { return s.gebeurtenissen.map(function (x) { return x.id + "@" + x.naVolg; }); }

  test("speelKaart is atomair: kapotte verborgen-data (sleutel geen tekst) -> fout, state byte-identiek, na herstel van de data speelt het gewoon", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen[0].sleutel = 5;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }), voor = JSON.stringify(s);
    gooitMet(function () { g.Engine.speelKaart(s, "K2"); }, /./, "kapotte data");
    T.is(JSON.stringify(s), voor); T.is(s.tijdlijn.length, 0, "kaart niet op de tijdlijn"); T.is(s.actiesOver, 3, "geen actie verbruikt"); T.gelijk(s.onthuld, []);
    c.episodes[0].patient.verborgen[0].sleutel = "w";
    var r = speel(s, "K2"); T.is(r.onthuld.length, 1); T.is(s.tijdlijn.length, 1); T.is(s.actiesOver, 2);
  });
  test("speelKaart is atomair: een tweede kapotte verborgen-rij laat geen halve onthulling achter (ook zichtbaar blijft ongemoeid)", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen.push({ kaart: "K2", onthult: "Tweede", sleutel: 7, waarde: 1 });
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }), voor = JSON.stringify(s);
    gooitMet(function () { g.Engine.speelKaart(s, "K2"); }, /./, "tweede rij kapot");
    T.is(JSON.stringify(s), voor); T.gelijk(s.onthuld, []); T.is(s.zichtbaar.lab.w, 10); T.is(s.tijdlijn.length, 0);
  });
  test("speelKaart is atomair: een gebeurtenis-trigger die halverwege faalt draait ook de al wachtende gebeurtenis en de tijdlijn terug", function () {
    var c = maakFixture(), aan = false, trig = c.episodes[0].gebeurtenissen[2];   // R, niet in een groep
    Object.defineProperty(trig, "trigger", { enumerable: true, get: function () { if (aan) throw new Error("kapotte trigger"); return { type: "naKaartVanKaart", kaart: "K1", n: 1 }; } });
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K1"); var voor = JSON.stringify(s); aan = true;
    gooitMet(function () { g.Engine.speelKaart(s, "K2"); }, /kapotte trigger/, "kapotte trigger");   // kaart 2: P (groep) zou al wachtend zijn geworden
    T.is(JSON.stringify(s), voor); T.gelijk(s.wachtend, []); T.is(s.tijdlijn.length, 1); T.is(s.actiesOver, 2);
    aan = false; speel(s, "K2"); T.gelijk(s.wachtend.map(function (x) { return x.id; }), ["P", "R"], "na herstel gaat de gebeurtenis gewoon af (P en R na kaart 2)");
  });
  test("speelKaart is atomair: een gooiend predicaat bij een doel-vereiste laat de state ongemoeid", function () {
    var c = maakFixture(); c.kaarten.filter(function (k) { return k.id === "S"; })[0].doelen.X1[0].vereist = { p: "bestaatniet" };
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }), voor = JSON.stringify(s);
    gooitMet(function () { g.Engine.speelKaart(s, "S", { doel: "M1" }); }, /bestaatniet|kent predicaat/, "kapot predicaat");
    T.is(JSON.stringify(s), voor);
  });
  test("speelKaart is atomair: sleutels die de onthulling al aan zichtbaar had toegevoegd verdwijnen bij herstel (ook nieuwe geneste objecten)", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen = [
      { kaart: "K2", onthult: "T1", sleutel: "diep.nieuw.pad", waarde: 5 }, { kaart: "K2", onthult: "T2", zichtbaar: { extra: { x: 1 } } },
      { kaart: "K2", onthult: "T3", sleutel: 7, waarde: 1 } ];
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }), voor = JSON.stringify(s);
    gooitMet(function () { g.Engine.speelKaart(s, "K2"); }, /./);
    T.is(JSON.stringify(s), voor); T.gelijk(Object.keys(s.zichtbaar), ["naam", "lab"]); T.is(s.zichtbaar.diep, undefined); T.is(s.zichtbaar.extra, undefined);
  });
  test("raadpleeg is atomair: onleesbare casus.raadplegen -> fout, geen actie verbruikt, geen registratie; na herstel van de data werkt het", function () {
    var c = maakFixture(); c.raadplegen = { titel: "t", get bronnen() { throw new Error("kapotte bronnen"); } };
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }), voor = JSON.stringify(s);
    gooitMet(function () { g.Engine.raadpleeg(s); }, /kapotte bronnen/, "kapotte bronnen");
    T.is(JSON.stringify(s), voor); T.is(s.actiesOver, 3); T.gelijk(s.raadplegingen, []);
    c.raadplegen = { titel: "Bron", bronnen: ["ok"] };
    var r = g.Engine.raadpleeg(s); T.is(r.ok, true); T.is(s.actiesOver, 2); T.gelijk(s.raadplegingen, [{ dag: 1 }]);
  });
  test("rondAf is atomair: een beoordeling die de state wijzigt en dan faalt laat niets achter; daarna kan de episode gewoon afgerond worden", function () {
    var s = nieuw(); speel(s, "K1"); var voor = JSON.stringify(s), oud = g.Evaluatie;
    g.Evaluatie = { beoordeel: function (c, e, st) { st.tijdlijn.push({ volg: 99 }); st.dag = 77; st.afgerond = true; throw new Error("kapotte beoordeling"); } };
    try { gooitMet(function () { g.Engine.rondAf(s); }, /kapotte beoordeling/, "gooiende beoordeling"); } finally { g.Evaluatie = oud; }
    T.is(JSON.stringify(s), voor); T.is(s.afgerond, false); T.is(s.uitkomst, null); T.is(s.tijdlijn.length, 1); T.is(s.dag, 1);
    var u = g.Engine.rondAf(s); T.is(u.stub, true); T.is(s.afgerond, true);
  });
  test("atomisch herstel op zijn plaats: dezelfde array- en objectverwijzingen blijven bestaan (een UI die state.tijdlijn vasthoudt ziet het herstel)", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen[0].sleutel = 5;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }), tl = s.tijdlijn, on = s.onthuld, zb = s.zichtbaar, lab = s.zichtbaar.lab, sets = s.sets, rngF = s.rng;
    gooitMet(function () { g.Engine.speelKaart(s, "K2"); }, /./);
    T.waar(s.tijdlijn === tl && s.onthuld === on && s.zichtbaar === zb && s.zichtbaar.lab === lab && s.sets === sets, "verwijzingen behouden");
    T.is(s.rng, rngF, "rng blijft dezelfde functie"); T.is(s.zichtbaar.lab.w, 10);
    T.is(Object.prototype.hasOwnProperty.call(s, "zichtbaar"), true);
  });

  /* herkansing behoudt de spelregels (F2) */
  test("herkansing behoudt de opt-in afrondenPasNaGebeurtenissen: zonder opties blokkeert vroeg afronden nog steeds; expliciet false haalt het weg", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0), afrondenPasNaGebeurtenissen: true });
    T.is(s.afrondenPasNaGebeurtenissen, true);
    var h = g.Engine.herkansing(s); T.is(h.afrondenPasNaGebeurtenissen, true, "vlag blijft aan");
    speel(h, "K1"); gooitMet(function () { g.Engine.rondAf(h); }, /nadat de gebeurtenissen zich hebben voorgedaan/, "vroeg afronden"); T.is(h.afgerond, false);
    T.is(g.Engine.herkansing(h).afrondenPasNaGebeurtenissen, true, "ook bij een herkansing van een herkansing");
    T.is(g.Engine.herkansing(s, { afrondenPasNaGebeurtenissen: false }).afrondenPasNaGebeurtenissen, false, "expliciet uit wint");
    var uit = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); T.is(g.Engine.herkansing(uit).afrondenPasNaGebeurtenissen, false);
    T.is(g.Engine.herkansing(uit, { afrondenPasNaGebeurtenissen: true }).afrondenPasNaGebeurtenissen, true, "expliciet aan wint");
    var c2 = maakFixture(); c2.episodes[0].afrondenPasNaGebeurtenissen = true;
    var d = g.Engine.nieuwSpel(c2, "X1", { rng: rngVast(0), afrondenPasNaGebeurtenissen: false });
    T.is(d.afrondenPasNaGebeurtenissen, false); T.is(g.Engine.herkansing(d).afrondenPasNaGebeurtenissen, false, "expliciet uit blijft uit, ook als de episode-standaard aan is");
    T.is(g.Engine.herkansing(g.Engine.nieuwSpel(c2, "X1", {})).afrondenPasNaGebeurtenissen, true, "episode-standaard blijft gelden");
  });
  test("herkansing behoudt ook een JSON-kopie van de state (vlag uit de state) en elke andere meegegeven optie", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0), afrondenPasNaGebeurtenissen: true, mijnOptie: { a: 1 } });
    var h = g.Engine.herkansing(s); T.gelijk(h._opties, { afrondenPasNaGebeurtenissen: true, mijnOptie: { a: 1 } });
    T.is(g.Engine.herkansing(h)._opties.mijnOptie.a, 1, "tweede generatie");
    T.gelijk(g.Engine.herkansing(s, { mijnOptie: 5 })._opties.mijnOptie, 5, "expliciet wint");
    T.is("rng" in h._opties, false, "rng zit niet in _opties (die staat in state.rng)");
    var kopie = JSON.parse(JSON.stringify(s)), oudC = g.CASUSSEN; g.CASUSSEN = [c];
    try { T.is(g.Engine.herkansing(kopie).afrondenPasNaGebeurtenissen, true, "vlag via de state zelf"); } finally { g.CASUSSEN = oudC; }
  });
  test("herkansing: trekt met de rng van het vorige spel, ook als Math.random iets anders zou geven (deterministisch, niet toevallig)", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0.99) }), oud = Math.random;
    Math.random = function () { return 0; };
    try {
      T.gelijk(g.Engine.herkansing(s).groepen.PQ, ["Q", "P"], "rng van het vorige spel (0.99), niet Math.random (0)");
      var s0 = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); Math.random = function () { return 0.99; };
      T.gelijk(g.Engine.herkansing(s0).groepen.PQ, ["P", "Q"], "rng van het vorige spel (0), niet Math.random (0.99)");
      T.gelijk(g.Engine.herkansing(s0, { rng: rngVast(0.99) }).groepen.PQ, ["Q", "P"], "opties.rng wint van de rng van het vorige spel");
      T.gelijk(g.Engine.nieuwSpel(c, "X1", {}).groepen.PQ, ["Q", "P"], "zonder rng: Math.random");
    } finally { Math.random = oud; }
  });
  test("herkansing: bij een reeks rng-waarden trekt de herkansing de volgende waarden uit dezelfde rng (exacte volgorden)", function () {
    var c = maakFixture(), reeks = [0.1, 0.9, 0.9, 0.1], i = 0;
    var s = g.Engine.nieuwSpel(c, "X1", { rng: function () { return reeks[i++ % 4]; } });
    T.gelijk(s.groepen.PQ, ["P", "Q"]);
    T.gelijk(g.Engine.herkansing(s).groepen.PQ, ["Q", "P"]); T.gelijk(g.Engine.herkansing(s).groepen.PQ, ["Q", "P"]); T.gelijk(g.Engine.herkansing(s).groepen.PQ, ["P", "Q"]);
  });

  /* ontgrendelen en herkansing, ook voor latere episodes (F3) */
  function maakFixture3() { var c = maakFixture(), e3 = JSON.parse(JSON.stringify(c.episodes[1])); e3.id = "X3"; e3.level = 3; c.episodes.push(e3); return c; }
  test("ontgrendeld met drie episodes: X3 pas open als X2 gehaald is (niet na alleen X1); elke episode kijkt naar zijn directe voorganger", function () {
    var c = maakFixture3();
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, []), ["X1"]);
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, ["X1"]), ["X1", "X2"]);
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, ["X2"]), ["X1", "X3"], "alleen X2 gehaald: X3 open, X2 niet");
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, ["X1", "X2"]), ["X1", "X2", "X3"]);
    T.is(g.Engine.ontgrendeld(c, "X3", ["X1"]), false); T.is(g.Engine.ontgrendeld(c, "X3", ["X2"]), true); T.is(g.Engine.ontgrendeld(c, "X3", ["X3"]), false);
    T.is(g.Engine.ontgrendeld(c, "X2", ["X3"]), false); T.is(g.Engine.ontgrendeld(c, "X1", ["X3"]), true);
    T.is(g.Engine.ontgrendeld(c, "X3", [{ episodeId: "X1", poortGehaald: true }]), false);
    T.is(g.Engine.ontgrendeld(c, "X3", [{ episodeId: "X2", poortGehaald: true }]), true);
    T.is(g.Engine.ontgrendeld(c, "X3", [{ episodeId: "X1", geschonden: [] }, { episodeId: "X2", geschonden: ["I1"] }]), false);
  });
  test("ontgrendeld: de object-vorm telt alleen waarden die waar zijn ({X1:false} opent niets)", function () {
    var c = maakFixture3();
    T.is(g.Engine.ontgrendeld(c, "X2", { X1: false }), false); T.is(g.Engine.ontgrendeld(c, "X2", { X1: true }), true);
    T.is(g.Engine.ontgrendeld(c, "X2", { X1: 0 }), false); T.is(g.Engine.ontgrendeld(c, "X2", { X1: 1 }), true);
    T.is(g.Engine.ontgrendeld(c, "X3", { X1: true, X2: false }), false); T.is(g.Engine.ontgrendeld(c, "X3", { X1: false, X2: true }), true);
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, { X1: true, X2: false }), ["X1", "X2"]);
    T.is(g.Engine.ontgrendeld(c, "X2", null), false); T.is(g.Engine.ontgrendeld(c, "X2", undefined), false); T.is(g.Engine.ontgrendeld(c, "X1", null), true);
    T.is(g.Engine.ontgrendeld(c, "X2", [null, 5, {}, { episodeId: "" }]), false, "rommel in de lijst opent niets");
  });
  test("herkansing van een latere episode blijft in die episode (X2 en X3, met hun eigen knoppen), niet de eerste", function () {
    var c = maakFixture3(), s2 = g.Engine.nieuwSpel(c, "X2", { rng: rngVast(0) }), s3 = g.Engine.nieuwSpel(c, "X3", { rng: rngVast(0) });
    var h2 = g.Engine.herkansing(s2), h3 = g.Engine.herkansing(s3);
    T.is(h2.episodeId, "X2"); T.is(h3.episodeId, "X3"); T.is(h2.actiesOver, 2); T.is(h2.aantalDagen, 2); T.is(h3.aantalDagen, 2);
    T.is(h2.casusId, "fixtuur"); T.waar(h2 !== s2 && h2.tijdlijn !== s2.tijdlijn, "echt een nieuw spel");
    speel(s2, "K1"); g.Engine.rondAf(s2); var h2b = g.Engine.herkansing(s2); T.is(h2b.afgerond, false); T.gelijk(h2b.tijdlijn, []); T.is(h2b.episodeId, "X2");
  });
  echt("UWI: E3 is dicht na alleen E1 gehaald, open na E2 gehaald; ontgrendeldeEpisodes per stand; herkansing van E2 en E3 blijft in die episode", function (c) {
    var ids = c.episodes.map(function (e) { return e.id; }); T.gelijk(ids, ["E1", "E2", "E3"]);
    function rec(ep, geschonden) { return { casusId: c.id, episodeId: ep, geschonden: geschonden }; }
    T.is(g.Engine.ontgrendeld(c, "E1", []), true); T.is(g.Engine.ontgrendeld(c, "E2", []), false); T.is(g.Engine.ontgrendeld(c, "E3", []), false);
    T.is(g.Engine.ontgrendeld(c, "E3", [rec("E1", [])]), false, "E3 blijft dicht na alleen E1");
    T.is(g.Engine.ontgrendeld(c, "E2", [rec("E1", [])]), true);
    T.is(g.Engine.ontgrendeld(c, "E3", [rec("E1", []), rec("E2", ["I3"])]), false, "E2 geschonden");
    T.is(g.Engine.ontgrendeld(c, "E3", [rec("E1", []), rec("E2", [])]), true, "E3 open na E2 gehaald");
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, []), ["E1"]);
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, [rec("E1", [])]), ["E1", "E2"]);
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, [rec("E1", []), rec("E2", [])]), ["E1", "E2", "E3"]);
    T.gelijk(g.Engine.ontgrendeldeEpisodes(c, { E1: false, E2: true }), ["E1", "E3"]);
    ["E1", "E2", "E3"].forEach(function (id) {
      var s = spel(c, id), h = g.Engine.herkansing(s);
      T.is(h.episodeId, id); T.is(h.casusId, c.id); T.is(h.aantalDagen, ep(c, id).knoppen.aantalDagen); T.is(h.actiesOver, ep(c, id).knoppen.actiesPerBeurt);
      T.gelijk(h.toestanden, ep(c, id).startToestanden);
    });
  });

  /* onthullen (F4) */
  test("onthullen: onthuld[].dag is de dag waarop de kaart gespeeld wordt (ook na dag 1), in resultaat en in state", function () {
    var s = nieuw(); dagen(s, 2); T.is(s.dag, 3);
    var r = speel(s, "K2"); T.is(r.onthuld[0].dag, 3); T.is(s.onthuld[0].dag, 3);
    var s1 = nieuw(); T.is(speel(s1, "K2").onthuld[0].dag, 1);
  });
  test("onthullen: meerdere verborgen-rijen voor één kaart worden allemaal onthuld (in datavolgorde), maar elke maar één keer", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen = [
      { kaart: "K2", onthult: "T1", sleutel: "lab.w", waarde: 7 },
      { kaart: "K2", onthult: "T1", sleutel: "lab.datum", waarde: "gisteren" },    // zelfde kaart en tekst, andere sleutel
      { kaart: "K2", onthult: "T2", sleutel: "lab.w", waarde: 8 },                  // zelfde kaart en sleutel, andere tekst
      { kaart: "K2", onthult: "T3", zichtbaar: { extra: { x: 1 } } },               // geen sleutel
      { kaart: "K1", onthult: "T4", sleutel: "diep.nieuw.pad", waarde: 5 },
      { kaart: "M1", onthult: "T5", sleutel: "w" },                                  // geen waarde: de ware waarde uit patient.waar
      { kaart: "M2", onthult: "T6", sleutel: "naam", waarde: "Nieuw" },
      { kaart: "K1", onthult: "T7", sleutel: "obj", waarde: { a: 1 } }
    ];
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); dagen(s, 1);
    var r = speel(s, "K2");
    T.gelijk(r.onthuld.map(function (x) { return x.tekst + "/" + x.sleutel + "/" + JSON.stringify(x.waarde) + "/" + x.dag + "/" + x.kaart; }),
      ["T1/lab.w/7/2/K2", "T1/lab.datum/\"gisteren\"/2/K2", "T2/lab.w/8/2/K2", "T3/null/null/2/K2"]);
    T.gelijk(s.onthuld.length, 4);
    T.is(s.zichtbaar.lab.w, 8, "laatste rij wint voor dezelfde sleutel"); T.is(s.zichtbaar.lab.datum, "gisteren"); T.is(s.zichtbaar.naam, "Fixtuur", "rest van zichtbaar blijft staan");
    T.is(s.zichtbaar.extra.x, 1, "patch zonder sleutel");
    T.is(speel(s, "K2").onthuld.length, 0, "niet nog een keer"); T.is(s.onthuld.length, 4);
    var r2 = speel(s, "K1"); T.gelijk(r2.onthuld.map(function (x) { return x.tekst; }), ["T4", "T7"]);
    T.is(s.zichtbaar.diep.nieuw.pad, 5, "ontbrekend pad wordt aangemaakt"); T.is(s.zichtbaar.lab.w, 8);
    g.Engine.volgendeDag(s);
    var r3 = speel(s, "M1"); T.is(r3.onthuld[0].waarde, 3, "ware waarde uit patient.waar"); T.is(s.zichtbaar.lab.w, 3, "sleutel zonder punt zet de bestaande geneste sleutel");
    T.is(r3.onthuld[0].dag, 3);
    speel(s, "M2"); T.is(s.zichtbaar.naam, "Nieuw", "bestaande bovenste sleutel"); T.is(s.zichtbaar.lab.datum, "gisteren", "zusters blijven staan");
    // kopieën: wijzigen van het resultaat of de state raakt de casusdata niet
    r2.onthuld[1].waarde.a = 99; T.is(c.episodes[0].patient.verborgen[7].waarde.a, 1); T.is(s.onthuld.filter(function (x) { return x.tekst === "T7"; })[0].waarde.a, 1);
    s.zichtbaar.obj.a = 55; T.is(c.episodes[0].patient.verborgen[7].waarde.a, 1);
    T.is(c.episodes[0].patient.waar.w, 3, "waar ongewijzigd");
  });
  test("onthullen: een gepunte sleutel wist de zusters niet (lab.w onthult, lab.datum blijft) en maakt een ontbrekend tussenobject aan", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen = [ { kaart: "K2", onthult: "T", sleutel: "lab.w", waarde: 2 }, { kaart: "K1", onthult: "U", sleutel: "w.sub", waarde: 4 } ];
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); speel(s, "K2");
    T.gelijk(s.zichtbaar.lab, { w: 2, datum: "recent" });
    speel(s, "K1"); T.gelijk(s.zichtbaar.w, { sub: 4 }, "een niet-object wordt vervangen door een object"); T.gelijk(s.zichtbaar.lab, { w: 2, datum: "recent" });
  });

  /* gebeurtenissen: sets, toestanden, groepen, rng (F4) */
  test("gebeurtenis zet: gevoelig haalt precies dat middel uit resistent; dubbel toevoegen mag niet; toestanden komen niet dubbel", function () {
    var s = miniSpel([
      { id: "E1", trigger: { type: "naKaart", n: 1 }, tekst: "t", zet: { resistent: ["m1", "m2", "m3"] } },
      { id: "E2", trigger: { type: "naKaart", n: 2 }, tekst: "t", toestand: "basis", zet: { gevoelig: ["m2"] } },
      { id: "E3", trigger: { type: "naKaart", n: 3 }, tekst: "t", toestand: ["x", "basis", "x"], zet: { resistent: ["m1"] } },
      { id: "E4", trigger: { type: "naKaart", n: 4 }, tekst: "t", zet: { gevoelig: ["m9"] } }
    ]);
    speelTot(s, 3);
    T.gelijk(s.sets.resistent, ["m1", "m3"], "precies m2 eruit"); T.gelijk(s.sets.gevoelig, ["m2"]); T.gelijk(s.toestanden, ["basis", "x"]);
    speelTot(s, 4);
    T.gelijk(s.sets.resistent, ["m1", "m3"], "gevoelig zonder resistent laat resistent ongemoeid"); T.gelijk(s.sets.gevoelig, ["m2", "m9"]);
    T.gelijk(ev(s), ["E1@1", "E2@2", "E3@3", "E4@4"]);
  });
  test("groepen: de eerst-getrokken gebeurtenis krijgt de vroegste trigger, ook als de data de groepsleden niet op volgorde van n heeft", function () {
    var data = [
      { id: "G", groep: "GH", trigger: { type: "naKaart", n: 7 }, tekst: "g" },
      { id: "H", groep: "GH", trigger: { type: "naKaart", n: 4 }, tekst: "h" }
    ];
    var s0 = miniSpel(data, rngVast(0)); T.gelijk(s0.groepen.GH, ["G", "H"]); speelTot(s0, 7); T.gelijk(ev(s0), ["G@4", "H@7"]);
    var s1 = miniSpel(data, rngVast(0.99)); T.gelijk(s1.groepen.GH, ["H", "G"]); speelTot(s1, 7); T.gelijk(ev(s1), ["H@4", "G@7"]);
    var gelijk = miniSpel([ { id: "G", groep: "GH", trigger: { type: "naKaart", n: 4 }, tekst: "g" }, { id: "H", groep: "GH", trigger: { type: "naKaart", n: 4 }, tekst: "h" } ], rngVast(0));
    speelTot(gelijk, 4); T.gelijk(ev(gelijk), ["G@4", "H@4"], "gelijke n: datavolgorde");
  });
  test("groepen van drie en rng-randwaarden: exacte volgorden, geldige permutatie bij rng 1, NaN, -1, 2 en een aantal trekkingen dat klopt", function () {
    var data = [
      { id: "X", groep: "XYZ", trigger: { type: "naKaart", n: 9 }, tekst: "x" },
      { id: "Y", groep: "XYZ", trigger: { type: "naKaart", n: 3 }, tekst: "y" },
      { id: "Z", groep: "XYZ", trigger: { type: "naKaart", n: 6 }, tekst: "z" }
    ];
    function reeks(w) { var i = 0; return function () { return w[i++ % w.length]; }; }
    var s = miniSpel(data, reeks([0.5, 0.5]));
    T.gelijk(s.groepen.XYZ, ["Y", "Z", "X"]); speelTot(s, 9); T.gelijk(ev(s), ["Y@3", "Z@6", "X@9"]);
    T.gelijk(miniSpel(data, rngVast(0)).groepen.XYZ, ["X", "Y", "Z"], "rng 0: datavolgorde");
    T.gelijk(miniSpel(data, reeks([0, 0.4])).groepen.XYZ, ["X", "Y", "Z"], "tweede trekking 0.4 uit twee plekken: blijft staan");
    T.gelijk(miniSpel(data, reeks([0.9, 0.4])).groepen.XYZ, ["Z", "Y", "X"]);
    T.gelijk(miniSpel(data, reeks([0.4, 0.6])).groepen.XYZ, ["Y", "Z", "X"]);
    T.gelijk(miniSpel(data, reeks([0.7, 0.9])).groepen.XYZ, ["Z", "X", "Y"]);
    T.gelijk(miniSpel(data, rngVast(1)).groepen.XYZ, ["Z", "X", "Y"], "rng 1");
    T.gelijk(miniSpel(data, rngVast(0.9999999)).groepen.XYZ, ["Z", "X", "Y"], "rng net onder 1 geeft hetzelfde als 1");
    T.gelijk(miniSpel(data, rngVast(2)).groepen.XYZ, ["Z", "X", "Y"], "rng 2 wordt begrensd");
    T.gelijk(miniSpel(data, rngVast(NaN)).groepen.XYZ, ["X", "Y", "Z"], "rng NaN: datavolgorde");
    T.gelijk(miniSpel(data, rngVast(-1)).groepen.XYZ, ["X", "Y", "Z"], "rng -1: datavolgorde");
    [1, 2, -1, NaN, 0.3, 0.5, 0.7, 0.9999999].forEach(function (w) { T.gelijk(miniSpel(data, rngVast(w)).groepen.XYZ.slice().sort(), ["X", "Y", "Z"], "permutatie bij rng " + w); });
    var twee = [ { id: "P", groep: "PQ", trigger: { type: "naKaart", n: 1 }, tekst: "p" }, { id: "Q", groep: "PQ", trigger: { type: "naKaart", n: 2 }, tekst: "q" } ];
    T.gelijk(miniSpel(twee, rngVast(1)).groepen.PQ, ["Q", "P"], "tweetal bij rng 1"); T.gelijk(miniSpel(twee, rngVast(0.5)).groepen.PQ, ["Q", "P"]); T.gelijk(miniSpel(twee, rngVast(0.49)).groepen.PQ, ["P", "Q"]);
    // aantal trekkingen: een groep van n leden kost n-1 trekkingen, een enkeling 0, geen groepen 0
    function telling(gebeurtenissen) { var n = 0; miniSpel(gebeurtenissen, function () { n++; return 0; }); return n; }
    T.is(telling([]), 0); T.is(telling([ { id: "S", groep: "SOLO", trigger: { type: "naKaart", n: 1 }, tekst: "s" } ]), 0, "groep van één");
    T.is(telling(twee), 1); T.is(telling(data), 2);
    T.is(telling(data.concat(twee, [ { id: "S", groep: "SOLO", trigger: { type: "naKaart", n: 1 }, tekst: "s" } ])), 3, "som over groepen");
    T.is(telling([ { id: "L", trigger: { type: "naKaart", n: 1 }, tekst: "l" } ]), 0, "gebeurtenis zonder groep");
    // zonder rng in de opties: Math.random
    var oud = Math.random, aantal = 0; Math.random = function () { aantal++; return 0.99; };
    try { T.gelijk(g.Engine.nieuwSpel(maakMini(twee), "m1", {}).groepen.PQ, ["Q", "P"]); T.is(aantal, 1); T.gelijk(g.Engine.nieuwSpel(maakMini(twee), "m1", { rng: "geen functie" }).groepen.PQ, ["Q", "P"]); }
    finally { Math.random = oud; }
  });
  test("gebeurtenis: een groep van drie triggert elk lid precies één keer, ook als meer kaarten volgen", function () {
    var data = [
      { id: "X", groep: "XYZ", trigger: { type: "naKaart", n: 2 }, tekst: "x" }, { id: "Y", groep: "XYZ", trigger: { type: "naKaart", n: 4 }, tekst: "y" },
      { id: "Z", groep: "XYZ", trigger: { type: "naKaart", n: 6 }, tekst: "z" } ];
    var s = miniSpel(data, rngVast(0)); speelTot(s, 12); T.gelijk(ev(s), ["X@2", "Y@4", "Z@6"]); T.is(s.wachtend.length, 0);
  });

  /* raadpleeg en state-vorm (F4) */
  test("raadpleeg: bronnen is een kopie (wijzigen van het antwoord raakt de casus en een volgend antwoord niet)", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    var r = g.Engine.raadpleeg(s); r.bronnen.push("INDRINGER"); r.bronnen[0] = "GEWIJZIGD";
    T.gelijk(c.raadplegen.bronnen, ["BRON-A"]); T.gelijk(g.Engine.raadpleeg(s).bronnen, ["BRON-A"]);
    delete c.raadplegen; var r2 = g.Engine.raadpleeg(s); T.is(r2.ok, true); T.is(r2.titel, null); T.gelijk(r2.bronnen, []); T.is(r2.kost, 1);
  });
  test("state: _casus en _opties zijn niet opsombaar en komen niet in JSON; de state-sleutels zijn precies de contractsleutels (plus de engine-extra's)", function () {
    var s = nieuw();
    T.is(Object.keys(s).indexOf("_casus"), -1); T.is(Object.keys(s).indexOf("_opties"), -1);
    T.is(JSON.stringify(s).indexOf("BRON-A"), -1, "de casus zit niet in de JSON van de state"); T.is(JSON.stringify(s).indexOf("fixtuur") >= 0, true, "casusId wel");
    T.is(s._casus.id, "fixtuur");
    ["casusId", "episodeId", "dag", "actiesOver", "aantalDagen", "afgerond", "tijdlijn", "raadplegingen", "gebeurtenissen", "toestanden", "onthuld", "zichtbaar", "volgordeAB", "klachten", "rng"].forEach(function (k) {
      T.waar(k in s, "contractsleutel " + k);
    });
    var gb = Object.getOwnPropertyDescriptor(s, "_casus"); T.is(gb.enumerable, false);
  });

  /* foutmeldingen en het casusVan-pad (F6) */
  test("Nederlandse foutmeldingen: onbekende episode (ook de laatste episode vindt hij), ontbrekende Evaluatie, onbekende casus/episode bij een state", function () {
    var c = maakFixture3();
    gooitMet(function () { g.Engine.nieuwSpel(c, "NOPE", {}); }, /^Onbekende episode: NOPE\.$/, "onbekende episode");
    gooitMet(function () { g.Engine.nieuwSpel({ id: "leeg" }, "X1", {}); }, /^Onbekende episode: X1\.$/, "casus zonder episodes");
    gooitMet(function () { g.Engine.nieuwSpel(null, "X1", {}); }, /Onbekende episode/, "geen casus");
    T.is(g.Engine.nieuwSpel(c, "X3", {}).episodeId, "X3", "de laatste episode wordt gevonden"); T.is(g.Engine.nieuwSpel(c, "X1", {}).episodeId, "X1");
    var s = nieuw(); var oud = g.Evaluatie;
    try {
      [undefined, null, {}, { beoordeel: 5 }].forEach(function (waarde) {
        g.Evaluatie = waarde; gooitMet(function () { g.Engine.rondAf(s); }, /^De beoordeling \(Evaluatie\) is niet geladen\.$/, "Evaluatie " + JSON.stringify(waarde)); T.is(s.afgerond, false);
      });
    } finally { g.Evaluatie = oud; }
    var oudP = g.Predicaten; g.Predicaten = undefined;
    try { gooitMet(function () { g.Engine.speelKaart(s, "S", { doel: "M1" }); }, /^De regeltaal \(Predicaten\) is niet geladen\.$/, "regeltaal"); } finally { g.Predicaten = oudP; }
    // een state zonder _casus (bv. een JSON-kopie) zoekt de casus in window.CASUSSEN op casusId
    var kopie = JSON.parse(JSON.stringify(s)); T.is(kopie._casus, undefined);
    var oudC = g.CASUSSEN;
    try {
      g.CASUSSEN = undefined;
      gooitMet(function () { g.Engine.speelKaart(kopie, "K1"); }, /^De casus bij dit spel is niet gevonden\.$/, "geen CASUSSEN");
      g.CASUSSEN = [ { id: "andere", episodes: [] } ];
      gooitMet(function () { g.Engine.speelKaart(kopie, "K1"); }, /^De casus bij dit spel is niet gevonden\.$/, "andere casus");
      gooitMet(function () { g.Engine.volgendeDag(kopie); }, /^De casus bij dit spel is niet gevonden\.$/, "volgendeDag");
      gooitMet(function () { g.Engine.raadpleeg(kopie); }, /^De casus bij dit spel is niet gevonden\.$/, "raadpleeg");
      gooitMet(function () { g.Engine.rondAf(kopie); }, /^De casus bij dit spel is niet gevonden\.$/, "rondAf");
      gooitMet(function () { g.Engine.herkansing(kopie); }, /^De casus bij dit spel is niet gevonden\.$/, "herkansing");
      g.CASUSSEN = [ { id: "andere", episodes: [] }, maakFixture() ];
      T.is(g.Engine.speelKaart(kopie, "K1").ok, true, "de casus wordt in de lijst gevonden op id (ook niet als eerste)");
      var kaal = JSON.parse(JSON.stringify(s)); kaal.episodeId = "NOPE";
      gooitMet(function () { g.Engine.speelKaart(kaal, "K1"); }, /^De episode bij dit spel is niet gevonden\.$/, "onbekende episode in state");
      gooitMet(function () { g.Engine.volgendeDag(kaal); }, /^De episode bij dit spel is niet gevonden\.$/, "volgendeDag episode");
    } finally { g.CASUSSEN = oudC; }
  });
  test("een JSON-kopie van de state speelt door via window.CASUSSEN: speelKaart, raadpleeg, volgendeDag, rondAf en herkansing", function () {
    var c = maakFixture(), s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); speel(s, "K2");
    var oudC = g.CASUSSEN; g.CASUSSEN = [c];
    try {
      var k = JSON.parse(JSON.stringify(s)); delete k.rng;
      T.is(g.Engine.speelKaart(k, "M1").ok, true); T.is(k.tijdlijn.length, 2);
      T.is(g.Engine.raadpleeg(k).ok, true); T.is(k.actiesOver, 0);
      g.Engine.volgendeDag(k); T.is(k.dag, 2); T.is(k.actiesOver, 3); T.is(k.klachten[2].status, "aan", "P na kaart 2: toestand erger, M1 daar niet werkzaam");
      T.is(g.Engine.speelKaart(k, "S", { doel: "M1" }).ok, true, "doel-vereiste via ctx van de gekopieerde state");
      var u = g.Engine.rondAf(k); T.is(u.stub, true); T.is(k.afgerond, true);
      var h = g.Engine.herkansing(k); T.is(h.episodeId, "X1"); T.is(h.dag, 1); T.is(typeof h.rng, "function", "zonder rng in de kopie: Math.random");
    } finally { g.CASUSSEN = oudC; }
  });

  test("onthullen: een zichtbaar-patch vervangt een object door een niet-object, negeert een patch die geen object is, en een rij met waarde maar zonder sleutel raakt zichtbaar niet", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen = [
      { kaart: "K1", onthult: "A1", zichtbaar: { lab: "vervangen" } },
      { kaart: "K2", onthult: "A2", zichtbaar: "geen object" },
      { kaart: "M1", onthult: "A3", waarde: 5 },
      { kaart: "M2", onthult: "A4", zichtbaar: { nieuw: { diep: [1, 2] }, lijst: [1] } }
    ];
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    speel(s, "K2"); T.gelijk(s.zichtbaar, { naam: "Fixtuur", lab: { w: 10, datum: "recent" } }, "patch die geen object is verandert niets");
    var r3 = speel(s, "M1"); T.gelijk(r3.onthuld, [{ kaart: "M1", dag: 1, sleutel: null, tekst: "A3", waarde: 5 }]); T.gelijk(s.zichtbaar, { naam: "Fixtuur", lab: { w: 10, datum: "recent" } });
    speel(s, "K1"); T.is(s.zichtbaar.lab, "vervangen", "een object wordt door een niet-object vervangen"); T.is(s.zichtbaar.naam, "Fixtuur");
    var s2 = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); speel(s2, "M2");
    T.gelijk(s2.zichtbaar.nieuw, { diep: [1, 2] }); T.gelijk(s2.zichtbaar.lijst, [1]); T.gelijk(s2.zichtbaar.lab, { w: 10, datum: "recent" }, "samenvoegen laat bestaande objecten staan");
    c.episodes[0].patient.verborgen[3].zichtbaar.nieuw.diep.push(3); T.gelijk(s2.zichtbaar.nieuw.diep, [1, 2], "patch is gekopieerd, niet gedeeld");
  });
  test("onthullen: een patch voegt samen in bestaande geneste objecten (lab.datum verandert, lab.w blijft)", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen = [ { kaart: "K1", onthult: "A", zichtbaar: { lab: { datum: "vandaag" } } } ];
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); speel(s, "K1"); T.gelijk(s.zichtbaar.lab, { w: 10, datum: "vandaag" });
    T.gelijk(c.episodes[0].patient.zichtbaar.lab, { w: 10, datum: "recent" }, "casusdata ongemoeid");
  });
  test("volgordeAB is een kopie van de getrokken groep AB (geen alias); zonder groep AB is hij leeg", function () {
    var data = [ { id: "A1", groep: "AB", trigger: { type: "naKaart", n: 1 }, tekst: "a" }, { id: "B1", groep: "AB", trigger: { type: "naKaart", n: 2 }, tekst: "b" } ];
    var s = miniSpel(data, rngVast(0.99));
    T.gelijk(s.volgordeAB, ["B1", "A1"]); T.gelijk(s.groepen.AB, ["B1", "A1"]);
    s.volgordeAB.push("X"); T.gelijk(s.groepen.AB, ["B1", "A1"], "wijzigen van volgordeAB raakt de groepen niet");
    T.is(s.volgordeAB !== s.groepen.AB, true);
    T.gelijk(miniSpel([]).volgordeAB, []); T.gelijk(miniSpel([ { id: "P", groep: "PQ", trigger: { type: "naKaart", n: 1 }, tekst: "p" } ]).volgordeAB, []);
  });
  test("groepen: een lid zonder (numerieke) trigger wordt achteraan gesorteerd en veroorzaakt geen fout", function () {
    var data = [ { id: "X", groep: "XY", trigger: { type: "naKaart", n: 2 }, tekst: "x" }, { id: "Y", groep: "XY", tekst: "y" } ];
    var s0 = miniSpel(data, rngVast(0)); speelTot(s0, 4); T.gelijk(ev(s0), ["X@2"], "Y heeft geen trigger en gaat nooit af");
    var s1 = miniSpel(data, rngVast(0.99)); speelTot(s1, 4); T.gelijk(ev(s1), ["Y@2"], "de eerst-getrokken (Y) krijgt de vroegste trigger; X krijgt de ontbrekende");
    var z = [ { id: "X", groep: "XY", trigger: { type: "naKaartVanKaart", kaart: "c", n: 2 }, tekst: "x" }, { id: "Y", groep: "XY", trigger: { type: "naKaart", n: 3 }, tekst: "y" } ];
    var s2 = miniSpel(z, rngVast(0)); speelTot(s2, 5); T.gelijk(ev(s2), ["X@3", "Y@3"], "naKaartVanKaart-trigger (n=2 na de eerste c) en naKaart 3 in een groep");
  });
  test("atomisch herstel bewaart ook de identiteit van de elementen in arrays (tijdlijnregels, onthuld-rijen)", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen.push({ kaart: "K1", onthult: "Tweede", sleutel: "lab.datum", waarde: "x" });
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); speel(s, "K2");
    var regel = s.tijdlijn[0], rij = s.onthuld[0], kl = s.klachten[1];
    c.episodes[0].patient.verborgen[1].sleutel = 9;
    gooitMet(function () { g.Engine.speelKaart(s, "K1"); }, /./);
    T.waar(s.tijdlijn[0] === regel && s.onthuld[0] === rij && s.klachten[1] === kl, "elementen behouden hun identiteit");
    T.is(s.tijdlijn.length, 1); T.is(s.onthuld.length, 1);
  });

  test("speelKaart: alle foutmeldingen zijn Nederlands, letterlijk, met het kaartlabel (niet het id) en laten de state ongemoeid", function () {
    var c = maakFixture();
    c.kaarten.push({ id: "Q1", categorie: "x", label: "Lege doelkaart", doelkaart: true, downside: "d" });          // doelkaart zonder doelen in deze episode
    c.kaarten.push({ id: "Q2", categorie: "x", label: "Doelen zonder vlag", downside: "d", doelen: { X1: [ { id: "M1", label: "Middel een" } ] } });
    c.kaarten.push({ id: "Q3", categorie: "x", label: "Opties zonder doelen", downside: "d", opties: { M1: [ { tekst: "o1" } ], M2: [] } });
    c.kaarten.push({ id: "Q4", categorie: "x", label: "Zonder vlag of doelen", downside: "d" });
    c.kaarten.push({ id: "Q5", categorie: "x", doelkaart: false, downside: "d" });                                  // geen label: het id wordt gebruikt
    c.episodes[0].repertoire.push("Q1", "Q2", "Q3", "Q4", "Q5");
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) });
    function fout(kaart, opts, verwacht, wat) {
      var voor = JSON.stringify(s), r = g.Engine.speelKaart(s, kaart, opts);
      T.is(r.ok, false, wat); T.is(r.fout, verwacht, wat); T.is(JSON.stringify(s), voor, wat + ": state ongewijzigd");
    }
    fout("ONBEKEND", {}, "Onbekende kaart: ONBEKEND.", "onbekende kaart");
    fout("Z", {}, "Deze kaart zit niet in het repertoire van deze episode.", "buiten repertoire");
    fout("K1", { doel: "M1" }, "De kaart “Kaart een” heeft geen doel of optie.", "doel bij gewone kaart");
    fout("K1", { optie: "x" }, "De kaart “Kaart een” heeft geen doel of optie.", "optie bij gewone kaart");
    fout("Q5", { doel: "M1" }, "De kaart “Q5” heeft geen doel of optie.", "geen label: id");
    fout("Q1", {}, "De kaart “Lege doelkaart” kan in deze episode op geen enkel doel worden gespeeld.", "doelkaart zonder doelen in deze episode");
    fout("Q1", { doel: "M1" }, "De kaart “Lege doelkaart” kan in deze episode op geen enkel doel worden gespeeld.", "doelkaart zonder doelen, met doel");
    fout("Q2", {}, "Kies eerst een doel voor de kaart “Doelen zonder vlag”.", "doelen zonder doelkaart-vlag vragen om een doel");
    fout("Q2", { doel: "M2" }, "Dit doel kan niet bij de kaart “Doelen zonder vlag”.", "doel niet toegestaan");
    fout("Q2", { doel: "M1", optie: "x" }, "De kaart “Doelen zonder vlag” heeft geen opties.", "optie bij kaart zonder opties");
    fout("Q3", {}, "Kies eerst een doel voor de kaart “Opties zonder doelen”.", "opties zonder doelen vragen om een doel");
    fout("Q3", { doel: "M2" }, "Voor dit doel zijn bij de kaart “Opties zonder doelen” geen opties beschikbaar.", "doel zonder opties");
    fout("Q3", { doel: "M1" }, "Kies eerst een optie voor de kaart “Opties zonder doelen”.", "optie ontbreekt");
    fout("Q3", { doel: "M1", optie: "zzz" }, "Deze optie hoort niet bij dit doel.", "optie onbekend");
    fout("Q3", { doel: "M3", optie: "o1" }, "Dit doel kan niet bij de kaart “Opties zonder doelen”.", "doel niet in opties");
    fout("S", { doel: "M2" }, "Dit doel is nu niet beschikbaar voor de kaart “Stop”.", "vereist niet vervuld");
    T.is(g.Engine.speelKaart(s, "Q4").ok, true, "kaart zonder vlag en zonder doelen is een gewone kaart");
    T.is(g.Engine.speelKaart(s, "Q2", { doel: "M1" }).ok, true); T.is(g.Engine.speelKaart(s, "Q3", { doel: "M1", optie: "o1" }).ok, true);
    s.actiesOver = 0; fout("K1", {}, "Je hebt vandaag geen acties meer. Ga naar de volgende dag of rond de episode af.", "geen acties");
    s.actiesOver = 3; g.Engine.rondAf(s); fout("K1", {}, "Deze episode is al afgerond.", "afgerond");
    var t = nieuw(); dagen(t, 3); g.Engine.volgendeDag(t); T.is(g.Engine.speelKaart(t, "K1").fout, "De laatste dag is voorbij.");
    T.is(g.Engine.raadpleeg(t).fout, "De laatste dag is voorbij.");
    var u = nieuw(); speel(u, "K1"); speel(u, "K2"); speel(u, "M1"); T.is(g.Engine.raadpleeg(u).fout, "Je hebt niet genoeg acties over om de richtlijn te raadplegen.");
    g.Engine.rondAf(u); T.is(g.Engine.raadpleeg(u).fout, "Deze episode is al afgerond.");
  });
  test("speelKaart: een doelkaart-vlag zonder doelen, of doelen zonder vlag, of opties zonder beide: telkens wordt een doel gevraagd; een gewone kaart in een andere episode blijft gewoon", function () {
    var c = maakFixture3(); c.episodes[1].repertoire = ["K1", "S", "D"]; c.episodes[1].gebeurtenissen = [];
    var s = g.Engine.nieuwSpel(c, "X2", { rng: rngVast(0) });
    T.is(g.Engine.speelKaart(s, "S").ok, false); T.is(g.Engine.speelKaart(s, "S").fout, "De kaart “Stop” kan in deze episode op geen enkel doel worden gespeeld.");
    T.is(g.Engine.speelKaart(s, "K1").ok, true);
  });
  test("triggers: een onbekend trigger-type of ontbrekende trigger gaat nooit af; naKaartVanKaart zonder de kaart evenmin", function () {
    var s = miniSpel([ { id: "O", trigger: { type: "bestaatniet", n: 1 }, tekst: "o" }, { id: "Z", tekst: "z" }, { id: "V", trigger: { type: "naKaartVanKaart", kaart: "d", n: 1 }, tekst: "v" },
      { id: "L", trigger: { type: "naKaart", n: 2, alleenAlsGespeeld: "d" }, tekst: "l" } ]);
    speelTot(s, 6); T.gelijk(ev(s), [], "geen enkele gebeurtenis zonder geldige trigger"); T.is(s.wachtend.length, 0);
    speel(s, "d"); T.gelijk(s.wachtend.map(function (x) { return x.id; }), [], "na de kaart d: V wacht op de kaart NA d, niet op d zelf");
    speel(s, "c"); T.gelijk(s.wachtend.map(function (x) { return x.id; }), ["V"]);
  });
  test("triggers: naKaartVanKaart telt vanaf de EERSTE keer dat de kaart gespeeld is, en alleenAlsGespeeld kijkt naar de hele tijdlijn", function () {
    var s = miniSpel([ { id: "V", trigger: { type: "naKaartVanKaart", kaart: "d", n: 2 }, tekst: "v" }, { id: "L", trigger: { type: "naKaart", n: 3, alleenAlsGespeeld: "d" }, tekst: "l" } ]);
    speel(s, "c"); speel(s, "d"); speel(s, "d"); g.Engine.volgendeDag(s); speel(s, "c"); g.Engine.volgendeDag(s);
    T.gelijk(ev(s), ["L@3", "V@4"], "beide gebeurtenissen gaan af");
    T.is(s.gebeurtenissen.filter(function (x) { return x.id === "V"; })[0].naVolg, 4, "eerste d op volg 2, dus n=2 later is volg 4");
    T.is(s.gebeurtenissen.filter(function (x) { return x.id === "L"; })[0].naVolg, 3);
  });
  test("groepen: bij gelijke n beslist de datavolgorde (verschillende triggers, dus zichtbaar in wanneer elk lid afgaat)", function () {
    var data = [ { id: "G", groep: "GH", trigger: { type: "naKaart", n: 4 }, tekst: "g" }, { id: "H", groep: "GH", trigger: { type: "naKaartVanKaart", kaart: "c", n: 4 }, tekst: "h" } ];
    var s = miniSpel(data, rngVast(0)); speelTot(s, 6); T.gelijk(ev(s), ["G@4", "H@5"], "G krijgt de eerste trigger (n=4 na kaart 4), H de tweede (4 na de eerste c = volg 5)");
    var t = miniSpel(data, rngVast(0.99)); speelTot(t, 6); T.gelijk(ev(t), ["H@4", "G@5"], "H is eerst getrokken: krijgt de eerste trigger (4)");
  });
  test("groepen: drie leden met gelijke n behouden de datavolgorde (stabiele sortering), zichtbaar aan het moment waarop elk afgaat", function () {
    var data = [ { id: "K1", groep: "G3", trigger: { type: "naKaart", n: 4 }, tekst: "a" }, { id: "K2", groep: "G3", trigger: { type: "naKaartVanKaart", kaart: "c", n: 4 }, tekst: "b" },
      { id: "K3", groep: "G3", trigger: { type: "naKaartVanKaart", kaart: "d", n: 4 }, tekst: "c" } ];
    var s = miniSpel(data, rngVast(0)); speel(s, "c"); speel(s, "c"); speel(s, "d"); speelTot(s, 8);
    T.gelijk(ev(s), ["K1@4", "K2@5", "K3@7"]);
  });
  test("groepen: een lid zonder trigger op elke plek in de datavolgorde (eerste, midden, laatste) geeft geen fout en gaat nooit af", function () {
    var X = { id: "X", groep: "G3", trigger: { type: "naKaart", n: 2 }, tekst: "x" }, W = { id: "W", groep: "G3", trigger: { type: "naKaart", n: 3 }, tekst: "w" }, Y = { id: "Y", groep: "G3", tekst: "y" };
    // rng 0 = datavolgorde: het lid op plek i krijgt de i-de trigger van de op n gesorteerde lijst; het lid zonder trigger sorteert achteraan
    var verwacht = [ [[Y, X, W], ["Y@2", "X@3"]], [[X, Y, W], ["X@2", "Y@3"]], [[X, W, Y], ["X@2", "W@3"]] ];
    verwacht.forEach(function (v, i) { var s = miniSpel(v[0], rngVast(0)); speelTot(s, 5); T.gelijk(ev(s), v[1], "variant " + i); });
  });
  test("groepen: een lid dat na het trekken uit de data verdwijnt laat de overige leden hun eigen trigger houden (geen fout)", function () {
    var data = [ { id: "X", groep: "G3", trigger: { type: "naKaart", n: 2 }, tekst: "x" }, { id: "Y", groep: "G3", trigger: { type: "naKaart", n: 3 }, tekst: "y" }, { id: "Z", groep: "G3", trigger: { type: "naKaart", n: 5 }, tekst: "z" } ];
    var c = maakMini(data), s = g.Engine.nieuwSpel(c, "m1", { rng: rngVast(0) });
    T.gelijk(s.groepen.G3, ["X", "Y", "Z"]);
    c.episodes[0].gebeurtenissen.shift();                             // X verdwijnt: Y en Z schuiven op in de gesorteerde triggers
    speelTot(s, 6); T.gelijk(ev(s), ["Y@5", "Z@5"], "Y (plek 1) krijgt de tweede trigger (5); Z (plek 2) bestaat niet meer in de lijst en houdt de eigen trigger (5)");
  });
  test("klachten: een toestand die als TODO_BART-sleutel in werkzaamheid staat telt niet als werkzaamheid-entry", function () {
    var s = miniSpel([], rngVast(0), function (e) {
      e.startToestanden = ["basis", "TODO_BART-9"];
      e.werkzaamheid = { basis: { werkzaam: [ { kaart: "a" } ], nietWerkzaam: [] }, "TODO_BART-9": { werkzaam: [], nietWerkzaam: [ { kaart: "a" } ] } };
    });
    speel(s, "a"); g.Engine.volgendeDag(s); T.is(s.klachten[2].status, "af", "de TODO_BART-sleutel is geen data");
  });
  test("ontgrendeld: een Logging-record met uitkomst die geen object is, of een gehaald dat een tekst of getal is, opent niets en geeft geen fout", function () {
    var c = maakFixture();
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", uitkomst: "tekst" }]), false);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", uitkomst: 5 }]), false);
    T.is(g.Engine.ontgrendeld(c, "X2", [{ episodeId: "X1", uitkomst: null, geschonden: [] }]), true, "uitkomst null: val terug op geschonden leeg");
    T.is(g.Engine.ontgrendeld(c, "X2", "X1"), false); T.is(g.Engine.ontgrendeld(c, "X2", 5), false); T.is(g.Engine.ontgrendeld(c, "X2", true), false);
    var nummers = maakFixture(); nummers.episodes[0].id = "0"; nummers.episodes[1].id = "1";
    T.is(g.Engine.ontgrendeld(nummers, "1", "ab"), false, "een losse tekst is geen lijst en geen object: geen tekenposities als episode-id's");
    T.is(g.Engine.ontgrendeld(nummers, "1", ["0"]), true);
  });
  test("speelKaart is atomair: een patch die een object door een niet-object vervangt, of een tekst door een object, wordt netjes teruggedraaid", function () {
    var c = maakFixture(); c.episodes[0].patient.verborgen = [
      { kaart: "K2", onthult: "T1", zichtbaar: { lab: "vervangen" } }, { kaart: "K2", onthult: "T2", sleutel: "naam.sub", waarde: 1 }, { kaart: "K2", onthult: "T3", sleutel: 7, waarde: 1 } ];
    var s = g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }), voor = JSON.stringify(s);
    gooitMet(function () { g.Engine.speelKaart(s, "K2"); }, /./);
    T.is(JSON.stringify(s), voor); T.gelijk(s.zichtbaar, { naam: "Fixtuur", lab: { w: 10, datum: "recent" } });
  });

  /* klachtenstatus: randgevallen volgens de LEAD-beslissing in contract 3b (F7) */
  function spelDagen(aantal, wijzig) { var c = maakFixture(); c.episodes[0].knoppen.aantalDagen = aantal; if (wijzig) wijzig(c.episodes[0]); return g.Engine.nieuwSpel(c, "X1", { rng: rngVast(0) }); }
  function statussen(s) { return s.klachten.slice(1).map(function (k) { return k.status; }); }
  test("klachten randgeval: na een werkzaam tussenspel keert geenVerbetering48 NIET terug (eerste nul-periode telt alleen)", function () {
    var s = spelDagen(9);
    speel(s, "K2"); speel(s, "M2"); dagen(s, 4);                        // dag 5: 48 liep op dag 4 en 5
    speel(s, "K1"); g.Engine.volgendeDag(s);                            // dag 6: werkzaam middel (M2 + K1) actief aan het eind van dag 5 -> af
    speel(s, "S", { doel: "M2" }); g.Engine.volgendeDag(s);             // dag 7: geen middel meer actief
    speel(s, "M1"); g.Engine.volgendeDag(s);                            // dag 8: M1 is in deze toestand niet werkzaam
    g.Engine.volgendeDag(s);                                            // dag 9
    T.gelijk(statussen(s), [null, "aan", "aan", "geenVerbetering48", "geenVerbetering48", "af", null, "aan", "aan"]);
    T.is(s.klachten[8].tekst, "tekst-aan"); T.is(s.klachten[4].tekst, "tekst-48"); T.is(s.klachten[7].tekst, null);
  });
  test("klachten randgeval: ook een LATERE gebeurtenis met statusNaBeurten start geen tweede nul-periode", function () {
    var s = spelDagen(12, function (e) { e.gebeurtenissen.push({ id: "W", trigger: { type: "naKaart", n: 5 }, tekst: "tw", zet: { statusNaBeurten: 2 } }); });
    speel(s, "K2"); speel(s, "M2"); dagen(s, 4);
    speel(s, "K1"); g.Engine.volgendeDag(s); speel(s, "S", { doel: "M2" }); g.Engine.volgendeDag(s);
    speel(s, "M1"); g.Engine.volgendeDag(s);                            // kaart 5 -> W op dag 8
    T.gelijk(s.gebeurtenissen.filter(function (x) { return x.id === "W"; }), [{ id: "W", dag: 8, naVolg: 5 }]);
    dagen(s, 4);                                                        // dag 12
    T.gelijk(statussen(s), [null, "aan", "aan", "geenVerbetering48", "geenVerbetering48", "af", null, "aan", "aan", "aan", "aan", "aan"]);
  });
  test("klachten randgeval: was aan het eind van dA+1 wel een werkzaam middel actief, dan komt er geen geenVerbetering48, ook niet na een latere gap", function () {
    var s = spelDagen(8);
    speel(s, "K1"); speel(s, "M2"); speel(s, "K2"); dagen(s, 3);        // P op dag 2; M2 + K1 werkzaam in erger; dag 4: af
    speel(s, "S", { doel: "M2" }); g.Engine.volgendeDag(s);             // dag 5: niets actief
    speel(s, "M1"); g.Engine.volgendeDag(s); dagen(s, 2);               // dag 6 t/m 8: M1 niet werkzaam
    T.gelijk(statussen(s), [null, "af", "af", "af", null, "aan", "aan", "aan"]);
  });
  test("klachten randgeval: zonder antibioticum is de status null, maar twee dagen na de gebeurtenis geldt geenVerbetering48 (geen werkzaam middel actief); n komt uit de data", function () {
    var s = spelDagen(6); speel(s, "K2"); speel(s, "K1"); dagen(s, 5);
    T.gelijk(statussen(s), [null, null, null, "geenVerbetering48", "geenVerbetering48", "geenVerbetering48"]);
    var s3 = spelDagen(7, function (e) { e.gebeurtenissen[0].zet.statusNaBeurten = 3; }); speel(s3, "K2"); speel(s3, "K1"); dagen(s3, 6);
    T.gelijk(statussen(s3), [null, null, null, null, "geenVerbetering48", "geenVerbetering48", "geenVerbetering48"], "statusNaBeurten 3: dA+3");
  });
  test("klachten randgeval: geenVerbetering48 loopt door als alle middelen gestopt of niet-werkzaam herstart worden; alleen een werkzaam middel beëindigt het", function () {
    var s = spelDagen(8);
    speel(s, "K2"); speel(s, "M2"); dagen(s, 3);                       // dag 4: 48
    speel(s, "S", { doel: "M2" }); g.Engine.volgendeDag(s);            // dag 5: M2 gestopt aan het eind van dag 4 -> niets actief
    speel(s, "M2"); g.Engine.volgendeDag(s); dagen(s, 2);              // opnieuw M2 (niet werkzaam zonder K1)
    T.gelijk(statussen(s), [null, "aan", "aan", "geenVerbetering48", "geenVerbetering48", "geenVerbetering48", "geenVerbetering48", "geenVerbetering48"]);
  });
  test("klachten: zonder werkzaamheid-entry voor de geldende toestand, of voor een middel dat nergens in staat, is de status 'aan' (nooit 'af')", function () {
    var s = miniSpel([], rngVast(0), function (e) { e.startToestanden = ["onbekend"]; });
    speel(s, "a"); g.Engine.volgendeDag(s); T.gelijk(s.klachten[2], { dag: 2, status: "aan", tekst: "aan!" });
    var t = miniSpel([], rngVast(0), function (e) { e.werkzaamheid = { basis: { werkzaam: [ { kaart: "a" } ], nietWerkzaam: [] } }; });
    speel(t, "b"); g.Engine.volgendeDag(t); T.is(t.klachten[2].status, "aan", "middel niet in de werkzaam-lijst");
    var u = miniSpel([], rngVast(0), function (e) { e.werkzaamheid = { basis: { werkzaam: [ { kaart: "a" } ], nietWerkzaam: [] } }; });
    speel(u, "a"); g.Engine.volgendeDag(u); T.gelijk(u.klachten[2], { dag: 2, status: "af", tekst: "af!" });
    var v = miniSpel([], rngVast(0), function (e) { e.werkzaamheid = { basis: { werkzaam: [], nietWerkzaam: [] } }; delete e.statusTeksten; });
    speel(v, "a"); g.Engine.volgendeDag(v); T.gelijk(v.klachten[2], { dag: 2, status: "aan", tekst: null }, "geen statusTeksten: tekst null, geen verzonnen tekst");
    var w = miniSpel([], rngVast(0), function (e) { e.werkzaamheid = { basis: { werkzaam: [ { kaart: "a" } ], nietWerkzaam: [] }, statusTeksten: { af: "uit-werkzaamheid" } }; delete e.statusTeksten; });
    speel(w, "a"); g.Engine.volgendeDag(w); T.is(w.klachten[2].tekst, "uit-werkzaamheid", "terugval op werkzaamheid.statusTeksten");
  });
})(typeof window !== "undefined" ? window : globalThis);

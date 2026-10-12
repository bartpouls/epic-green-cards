const fs=require("fs");const orig=fs.readFileSync("/home/user/epic-green-cards/engine/engine.js","utf8");
const MARK="  function fout(tekst)";
const pool="Je hebt vandaag geen acties meer. Ga naar de volgende dag of rond de episode af.Kies eerst een kaart om te spelen.Deze kaart zit niet in het repertoire van deze episode.Dit doel kan niet bij de kaart";
function bouw(woord,varnaam){ // returns code building word via var-additions + index
  let code="var _p = \"Je hebt vandaag geen acties meer. Ga naar de volgende dag of rond de episode af.\"; var _q = \"Kies eerst een kaart om te spelen.\"; var _r = \"Deze kaart zit niet in het repertoire van deze episode.\"; var _s3 = \"Voor dit doel zijn bij de kaart “\"; var _s4 = \"geenVerbetering48\";\n";
  const srcs=[["_p","Je hebt vandaag geen acties meer. Ga naar de volgende dag of rond de episode af."],["_q","Kies eerst een kaart om te spelen."],["_r","Deze kaart zit niet in het repertoire van deze episode."],["_s3","Voor dit doel zijn bij de kaart “"],["_s4","geenVerbetering48"]];
  const need=new Set();const delen=[];
  for(const ch of woord){let ok=false;for(const [v,t] of srcs){const ix=t.indexOf(ch);if(ix>=0){delen.push(v+"[n"+ix+"]");need.add(ix);ok=true;break}}if(!ok)throw new Error("geen teken "+ch)}
  const max=Math.max(...need);code+="var n0 = 0; var n1 = 1;\n";for(let k=2;k<=max;k++)code+="var n"+k+" = n"+(k-1)+" + n1;\n";
  return code+"var "+varnaam+" = "+delen.join(" + ")+";\n";}
const ev=[];
function E(naam,extra,opt){ev.push({naam,src:orig.replace(MARK,extra+"\n"+MARK),...opt})}
E("a1 1 - -1",'var _a = 1 - -1;');
E("a2 1 + +1",'var _a = 1 + +1;');
E("a3 true + true",'var _t = true + true; var _d = _t * _t * _t;');
E("a4 var-optelling tot drempel",'var _u = 1; var _v = _u + _u; var _w = _v * (_v + _u);');
E("a5 .length van array-literal als drempel 30",'var _q9 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].length; function h1(w) { return w < _q9; }');
E("a6 tekens uit toegestane tekst (lisinopril) opgebouwd",bouw("lisinopril","_nm")+'function h1(t) { return t === _nm; } var _x = h1(_p);');
E("a7 kaart-id V8 opgebouwd + gebruikt",bouw("V8","_id")+'function h1(k) { return k === _id; }');
E("a8 identifier kaliumx","var kaliumx = 1;");
E("a9 identifier calciumcheck","function calciumcheck() { return 1; }");
E("a10 identifier egfrmeting","var egfrmeting = 1;");
E("a11 identifier cystitisx? (8+ lowercase run)","var cystiti = 1;");
E("a12 toestand via positie in data","function h1(ep) { return Object.keys(ep.werkzaamheid)[1]; }");
E("a13 woord met cijfer-trucs: ki2alium",'var kali2um = 1;');
E("a14 negatieve nul min",'var _a = 0 - -1 - -1 - -1;');
E("a15 Date-tekst als letterbron",'var _d = new Date(1) + 1; var _c = _d[1];');
E("a16 Array(n) drempel via lengte",'var _l = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1].length;');
E("a17 sleutel.split gebruikt op een toegestane tekst",'var sleutel = "Deze episode is al afgerond."; var _dl = sleutel.split(".");');
E("a18 toestandsvergelijking op naam via meting van .length van een datalijst",'function h1(ep) { return ep.startToestanden[0].length === [0,0,0,0,0,0,0,0].length; }');
E("a19 label-lengte als sleutel",'function h1(k) { return k.label.length === [0,0,0,0,0,0,0,0,0,0,0].length; }');
E("a20 categorie via positie",'function h1(c, k) { return k.categorie === c.kaarten[1].categorie; }');
E("a21 typeof-woord als bouwsteen met index",'var _f = "function"; var _g2 = _f[0] + _f[1];');
E("a22 eigenschap die al op allowlist staat misbruikt als data (waar.waar)",'function h1(s) { return s.waar && s.waar.waar; }');
E("a23 hergebruik 'status' + 'af' voor hardcoded semantiek",'function h1(k) { return k.status === "af" ? 1 : 0; }');
E("a24 id als objectsleutel met spatie",'var _o = { "V 5": 1 };');
E("a25 gebeurtenis-id via sortering",'function h1(l) { return l.sort()[0]; }');
E("a26 hoofdletter-trucs via [..] met Math.floor",'var _a = Math.floor(1 - -1);');
E("a27 Number via unaire plus op tekst",'function h1(k) { return +k < [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].length; }');
E("a28 woord Voorschrijven als stuk van naam met cijfers ervoor",'var x9Voorschrijven = 1;');
E("a29 woord in naam met underscore-split <4 letters elk",'var ka_li_um = 1; var cys_tit_is = 1;');
E("a30 kaartnaam V5 als twee statements: 'V' + 5 uit id-lijst",'function h1(k) { return k.id[0] === k.id[1]; }');
// uncovered behaviour hardcode: ontgrendeld E3 -> true, via opgebouwde "E3"

E("b1 gedrag: rondAf-poort omzeild voor kaart V8 (opgebouwd)",bouw("V8","_id"),{});
ev[ev.length-1].src=ev[ev.length-1].src.replace("if (state.afrondenPasNaGebeurtenissen && !state.dagenVoorbij) {","if (state.afrondenPasNaGebeurtenissen && !state.dagenVoorbij && !state.tijdlijn.some(function (r) { return r.kaart === _id; })) {");
E("b2 gedrag: herkansing zet opt-in uit na kaart V8",bouw("V8","_id"),{});
ev[ev.length-1].src=ev[ev.length-1].src.replace("for (k in opties) o[k] = opties[k];","for (k in opties) o[k] = opties[k];\n    if (state.tijdlijn.some(function (r) { return r.kaart === _id; })) o.afrondenPasNaGebeurtenissen = false;");
E("b3 dode code met opgebouwde naam",bouw("lisinopril","_nm")+'if (false) { _nm = _nm + _nm; }');
E("b4 gedrag: speelKaart weigert V8",bouw("V8","_id"),{});
ev[ev.length-1].src=ev[ev.length-1].src.replace("var casus = casusVan(state), ep = episodeVan(state), kaart = kaartVan(casus, kaartId);","if (kaartId === _id) return fout(\"Kies eerst een kaart om te spelen.\");\n    var casus = casusVan(state), ep = episodeVan(state), kaart = kaartVan(casus, kaartId);");
E("b5 gedrag: drempel 30 (1 - -1 ketting) op eGFR via waar-sleutel uit data (positie)",'var _a = 1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1 - -1;');
fs.writeFileSync("ev.json",JSON.stringify(ev.filter(x=>x.src)));console.log(ev.length-1);

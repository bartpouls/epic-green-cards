const {draai,orig}=require("./mut.js");
function metExtra(extra){return orig.replace("function fout(tekst)",extra+"\n  function fout(tekst)");}
const E=[
 ["1 hoofdletterfunctie + (1+1)", 'function h1(k) { return k === "g".toUpperCase() + (1 + 1); } var _x = h1("Z");'],
 ["2 omgekeerde tekst", 'function h1(k) { return k === "2g".split("").reverse().join("").toUpperCase(); } var _x = h1("Z");'],
 ["3 regex-literal na ) lijkt commentaar", 'var _z = 0; if (_z) /\\//.test(_z); function h1(k) { return k === "G2"; }'],
 ["4 JSON.parse met dubbel geescapete unicode", 'function h1(k) { return k === JSON.parse(\'"\\\\u0047\\\\u0032"\'); } var _x = h1("Z");'],
 ["5 Buffer base64 (geen atob)", 'function h1(k) { return k === Buffer.from("RzI=", "base64").toString(); }'],
 ["6 Function via constructor-keten", 'function h1(k) { return [][("con" + "structor")][("con" + "structor")]("return 1")(); }'],
 ["7 globale eval via sleutel", 'function h1(k) { return g["ev" + "al"]("1"); }'],
 ["8 identifier met unicode-escape", 'function h1(k) { var \\u0047\\u0032 = 5; return k === "x" ? \\u0047\\u0032 : 0; }'],
 ["9 drempel 30 via Number(\"0x1e\")", 'function h1(w) { return w < Number("0x1e"); }'],
 ["10 drempel 29 via binair", 'function h1(w) { return w < Number("0b11101") + (1 - 0); }'],
 ["11 RegExp uit join", 'function h1(k) { return new RegExp(["^", "v", "\\\\", "d", "+$"].join("").replace("v", "V")).test(k); }'],
 ["12 template met uitdrukkingen", 'function h1(k) { return k === `${"g".toUpperCase()}${1 + 1}`; }'],
 ["13 bereikvergelijking zonder id", 'function h1(k) { return k >= "V0" && k <= "V9"; }'],
 ["14 comedicatie via join", 'function h1(m) { return m === ["lis", "inopril"].join(""); }'],
 ["15 decodeURIComponent", 'function h1(k) { return k === decodeURIComponent("%47") + (1 + 1); }'],
 ["16 charAt op id-prefix met toUpperCase", 'function h1(k) { return k[0] === "v".toUpperCase(); }'],
 ["17 toestand via slice", 'function h1(t) { return t === "cystitisx".slice(0, -1); }'],
 ["18 klinische tekst met Zero-Width-Space", 'function h1() { return "Mevrouw weet niet wanneer ze moet bellen."; }'],
 ["19 kleine letters id (E3 -> e3 toUpperCase)", 'function h1(s) { return s.episodeId === "e3".toUpperCase(); }'],
 ["20 getal via lengte", 'function h1(w) { return w < "abcdefghijklmnopqrstuvwxyzabcd".length; }'],
 ["21 id in een Map-sleutel via fromEntries van split", 'var _m = Object.fromEntries("g2,v5,ev1".split(",").map(function (x) { return [x.toUpperCase(), 1]; }));'],
];
for(const [naam,code] of E){
  let src; try{src=metExtra(code);}catch(e){}
  const r=draai(src);
  console.log((r.length?"GEDOOD    ":"OVERLEEFD ")+naam+(r.length?"  <- "+r[0].slice(0,70):""));
}

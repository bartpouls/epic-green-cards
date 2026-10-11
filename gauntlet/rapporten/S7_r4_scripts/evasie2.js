const {draai,orig}=require("./mut.js");
function metExtra(extra){return orig.replace("function fout(tekst)",extra+"\n  function fout(tekst)");}
const E=[
 ["A middelnaam met diaeresis", 'function h1(k) { return k === "nitrofurantoïne"; }'],
 ["B cotrimoxazol", 'function h1(k) { return k === "cotrimoxazol"; }'],
 ["C Amoxicilline/clavulaanzuur", 'function h1(k) { return /clavulaanzuur/.test(k); }'],
 ["D spironolacton", 'function h1(k) { return k === "spironolacton"; }'],
 ["E SIDRIK", 'function h1(k) { return k === "SIDRIK"; }'],
 ["F koorts / flankpijn", 'function h1(k) { return k === "flankpijn"; }'],
 ["G pyelonefritis", 'function h1(k) { return k === "pyelonefritis"; }'],
 ["H casuszin letterlijk", 'function h1() { return "De nierfunctie bleek 29."; }'],
 ["I voorschrijver / categorie-woord Voorschrijven", 'function h1(k) { return k === "Voorschrijven"; }'],
 ["J categorie 'Gegevens'", 'function h1(k) { return k.categorie === "Gegevens"; }'],
 ["K eigenschapsnaam resistent in code", 'function h1(k) { return k.resistent; }'],
];
for(const [naam,code] of E){const r=draai(metExtra(code));console.log((r.length?"GEDOOD    ":"OVERLEEFD ")+naam);}

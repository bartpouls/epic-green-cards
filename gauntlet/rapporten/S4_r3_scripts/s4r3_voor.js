const fs=require("fs");
const t=fs.readFileSync("s4r3_pairs.md","utf8").split("### ").slice(1);
// handmatige oordelen (vooraf, zonder sleutel) voor de niet-identieke paren: welke is het spel (gok), opmerking
const hand={
 9:["X = bron (beschrijvende tekst met 'engine-parameter'), Y = spel (concrete uitkomst)","Y volgt n=4, m=7 en C na kaart 5 (O1 was kaart 2 + 3); volgorde A,B. Inhoudelijk consistent; geen afwijking aan te wijzen.","BRON is abstracter, SPEL concreter; geen van beide 'beter'"],
 10:["Y = bron, X = spel","X: B krijgt de eerste trigger (kaart 4), A de tweede (kaart 7): in lijn met 'volgorde met A willekeurig'. Geen afwijking.","gelijkwaardig"],
 23:["X = spel (alleen het geciteerde zinnetje), Y = bron (met label en toelichting)","Het geciteerde zinnetje is letter voor letter gelijk; de ontwerpnotitie 'Zonder getallen, zoals ook de KNMP-regel geen getallen geeft.' wordt niet als speltekst getoond (staat wel in data als toelichting).","geen letterlijke afwijking; spel toont terecht alleen de speltekst"],
 24:["X = spel, Y = bron","Zinnetje 'Na 48 uur geen verbetering.' gelijk.","gelijkwaardig"],
 25:["X = spel, Y = bron","Zinnetje gelijk.","gelijkwaardig"],
 26:["X = spel (uitkomstregel), Y = bron (tabelrij)","Profiel Kweekgestuurd en poort gehaald komen overeen; 'scoort hoger' klopt (3/3 tegenover cipro 2/3). Reflectievraag null (casus geeft er geen; TODO E3-12). Bron-toelichting 'De keuze leunt op de eerdere kweek...' wordt nergens getoond.","SPEL iets armer (geen reflectievraag, geen toelichtingstekst), maar dat is de gedocumenteerde TODO"],
 27:["Y = spel, X = bron","Profiel 'Richtlijn eerste keus', poort gehaald, reflectievraag letterlijk, plus bronconflict-vraag: komt overeen met bron.","gelijkwaardig"],
 28:["X = spel, Y = bron","De-escalatie cipro -> V8 na C geeft duurzaamheid 3 ('levert punten op'); profiel Kweekgestuurd (casus zegt niets over dit profiel: TODO E3-11).","gelijkwaardig; bron zwijgt over het profiel"],
 29:["X = spel, Y = bron","Spel geeft doelmatigheid 3 als G3 voor de eerste V-kaart komt (ook al ligt O1 ervoor); bron zegt 'vóór de eerste keuze'. Gedocumenteerd in TODO E3-20.","gelijkwaardig"]
};
let o="# S4 data-e3, ronde 3: blinde A/B (voor opening van de sleutel)\n\nElk paar: X/Y willekeurig toegewezen door script (sleutel: S4_r3.sleutel.json, pas na dit oordeel geopend). Tekst hieronder is wat ik per paar VOORAF vastlegde.\n\n";
t.forEach((b,i)=>{ const l=b.split("\n");const x=l.find(z=>z.startsWith("X: ")).slice(3),y=l.find(z=>z.startsWith("Y: ")).slice(3);
  o+="## "+l[0]+"\n- X: "+x+"\n- Y: "+y+"\n";
  if(x===y) o+="- Oordeel: X en Y zijn teken voor teken identiek ("+x.length+" tekens, door script vastgesteld); ik kan het spel niet aanwijzen. Verschil letter voor letter: geen. Beter: geen verschil.\n\n";
  else { const h=hand[i+1]; o+="- Oordeel: "+h[0]+".\n- Verschil: "+h[1]+"\n- Beter: "+h[2]+"\n\n"; }});
fs.writeFileSync("/home/user/epic-green-cards/gauntlet/rapporten/S4_r3.ab.md",o);console.log(o.length);

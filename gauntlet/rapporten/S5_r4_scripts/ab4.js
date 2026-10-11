// S5 r4: blinde A/B. Verwachting (bron = contract §3/§3b + bouwopdracht 4.2/6.1) is hier VOORAF met de hand ingevuld; spel = Predicaten.evalueer.
const sb=require("../S5_r3_scripts/load.js");const P=sb.Predicaten;const casus=sb.CASUSSEN[0];const fs=require("fs");
const ep0={id:"EX",antibiotica:["Q1","Q2","Q3"],patient:{waar:{eGFR:29,w:30},medicatie:[{id:"m1"},{id:"m2"}]},gebeurtenissen:[{id:"A",zet:{resistent:["Q1"]}},{id:"C"}]};
const cx={rollen:{wissel:"B1",stop:"B2",pauzeer:"B3",hervat:"B5"},episodes:[ep0]};
function ctx(tl,geb,kl){return P.maakContext(cx,ep0,{tijdlijn:tl.map((r,i)=>({volg:i+1,kaart:r[0],dag:r[1],doel:r[2]||null,optie:r[3]||null})),gebeurtenissen:(geb||[]).map(g=>({id:g[0],dag:g[1]})),klachten:Object.keys(kl||{}).map(d=>({dag:+d,status:kl[d]})),toestanden:[],dag:9});}
const cE=(E,tl,geb)=>{const e=casus.episodes.find(x=>x.id===E);return P.maakContext(casus,e,{tijdlijn:tl.map((r,i)=>({volg:i+1,kaart:r[0],dag:r[1],doel:r[2]||null,optie:r[3]||null})),gebeurtenissen:(geb||[]).map(g=>({id:g[0],dag:g[1]})),toestanden:["cystitis"],klachten:[],dag:9});};
const inv=(E,id)=>casus.episodes.find(x=>x.id===E).invarianten.find(i=>i.id===id).predicaat;
// [situatie, bronzin, verwachting(hand), predicaat, ctx]
const L=[
["X1 en Y1 op dezelfde dag, X1 eerst","contract: voor(a,b): eerste match van a strikt vóór b, op volg",true,{p:"voor",a:{kaart:"X1"},b:{kaart:"Y1"}},ctx([["X1",1],["Y1",1]])],
["idem: na(X1,Y1)","contract: na(a,b): strikt ná, op volg",false,{p:"na",a:{kaart:"X1"},b:{kaart:"Y1"}},ctx([["X1",1],["Y1",1]])],
["gebeurtenis A op dag 3, K op dag 4, n=2","bouwopdracht 4.2: gespeeld in de beurt van de gebeurtenis of in de n-1 beurten daarna",true,{p:"binnenBeurten",kaart:"K1",naGebeurtenis:"A",n:2},ctx([["K1",4]],[["A",3]])],
["gebeurtenis A op dag 3, K op dag 5, n=2","idem",false,{p:"binnenBeurten",kaart:"K1",naGebeurtenis:"A",n:2},ctx([["K1",5]],[["A",3]])],
["anker op dag 1, K op dag 5, van 2 tot 4","contract: van <= dag(K)-dag(anker) <= tot",false,{p:"opDagRelatief",kaart:"K1",anker:{kaart:"X1"},van:2,tot:4},ctx([["X1",1],["K1",6]])],
["anker op dag 1, K op dag 5, van 2 tot 4 (verschil 4)","idem, rand inclusief",true,{p:"opDagRelatief",kaart:"K1",anker:{kaart:"X1"},van:2,tot:4},ctx([["X1",1],["K1",5]])],
["Q1 gestart dag 1, gestopt (B2) dag 3; actief aan het eind van dag 3","contract: actief = gestart, niet gestopt; op {dag:n} = einde van die beurt",false,{p:"actief",middel:"Q1",op:{dag:3}},ctx([["Q1",1],["B2",3,"Q1"]])],
["idem maar eind van dag 2","idem",true,{p:"actief",middel:"Q1",op:{dag:2}},ctx([["Q1",1],["B2",3,"Q1"]])],
["Q1 en Q2 beide op dag 1 gestart; aantal actieve > 1","contract: telt op volg-niveau, max over de episode",true,{p:"aantalActieveAntibiotica",op:">",n:1},ctx([["Q1",1],["Q2",1]])],
["Q1 dag 1, wissel (B1) naar Q2 dag 2; aantal actieve > 1","contract: B1 vervangt het lopende",false,{p:"aantalActieveAntibiotica",op:">",n:1},ctx([["Q1",1],["B1",2,"Q2"]])],
["m1 gepauzeerd (B3) dag 2, hervat (B5) dag 4; actief op dag 3","contract: comedicatie actief niet gepauzeerd, wel/niet hervat via B5",false,{p:"medicatieActief",id:"m1",op:{dag:3}},ctx([["B3",2,"m1"],["B5",4,"m1"]])],
["idem op dag 4","idem",true,{p:"medicatieActief",id:"m1",op:{dag:4}},ctx([["B3",2,"m1"],["B5",4,"m1"]])],
["waar eGFR < 30 met eGFR 29","contract: waar vergelijkt ctx.waar[veld] (ware waarde)",true,{p:"waar",veld:"eGFR",op:"<",waarde:30},ctx([])],
["waar w < 30 met w = 30","idem (rand)",false,{p:"waar",veld:"w",op:"<",waarde:30},ctx([])],
["klachten geenVerbetering48 op einde beurt A+2 (dag 5); status dag 5 = geenVerbetering48","contract: klachten op {eindeBeurtNaGebeurtenis, offset}",true,{p:"klachten",waarde:"geenVerbetering48",op:{eindeBeurtNaGebeurtenis:"A",offset:2}},ctx([],[["A",3]],{3:"aan",4:"aan",5:"geenVerbetering48"})],
["tel gespeeld Q1 terwijlKlachten af: Q1 op dag 2 (af) en dag 3 (aan)","contract 3b: alleen regels waarvan status op de dag van spelen die waarde had",1,{p:"tel",teller:{t:"gespeeld",kaart:"Q1",terwijlKlachten:"af"},op:"==",waarde:1},ctx([["Q1",2],["Q1",3]],[],{2:"af",3:"aan"})],
["alsDan(Q1 niet gespeeld, K1 gespeeld) met lege tijdlijn","contract: niet(als) of dan",true,{p:"alsDan",als:{p:"gespeeld",kaart:"Q1"},dan:{p:"gespeeld",kaart:"K1"}},ctx([])],
["actief resistent na A: Q1 actief, A op dag 2 zet Q1 resistent; op {dag:2}","contract: actief met uitSet resistent",true,{p:"actief",middel:"Q1",uitSet:"resistent",op:{dag:2}},ctx([["Q1",1]],[["A",2]])],
["idem maar op {dag:1} (vóór A)","idem",false,{p:"actief",middel:"Q1",uitSet:"resistent",op:{dag:1}},ctx([["Q1",1]],[["A",2]])],
["E3 data I4: V3 dag 1 en V4 dag 1 (geen wissel)","bouwopdracht 6.1 I4: op enig moment meer dan één antibioticum tegelijk actief",true,inv("E3","I4"),cE("E3",[["V3",1],["V4",1]])],
["E1 data I3: V1 gespeeld zonder Ev1 (N1 ook gespeeld)","bouwopdracht 6.1 I3: Afwachtend beleid (V1) zonder Ev1",true,inv("E1","I3"),cE("E1",[["N1",1],["V1",1]])],
["E1 data I3: V1 + Ev1","idem",false,inv("E1","I3"),cE("E1",[["N1",1],["V1",1],["Ev1",1]])],
];
const sleutel=[];let out="# S5 r4 blinde A/B (paren)\n\n";const spel=[];
L.forEach((x,i)=>{let r=P.evalueer(x[3],x[4]);spel.push(r);const bron=x[2]===1?true:x[2];
 const w=Math.random()<0.5; sleutel.push({paar:i+1,X:w?"spel":"bron",Y:w?"bron":"spel",bron:bron,spel:r});
 const o=b=>x[1]+" -> "+(b?"WAAR":"ONWAAR");
 out+="## Paar "+(i+1)+"\nSituatie: "+x[0]+"\nX: "+o(w?r:bron)+"\nY: "+o(w?bron:r)+"\n\n";});
fs.writeFileSync("/home/user/epic-green-cards/gauntlet/rapporten/S5_r4.sleutel.json",JSON.stringify(sleutel,null,1));
fs.writeFileSync("ab_paren.md",out);console.log(out);

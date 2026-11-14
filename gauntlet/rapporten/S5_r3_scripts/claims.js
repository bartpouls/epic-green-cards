const sb=require("./load.js");const P=sb.Predicaten;
let n=0,rood=0;
function mk(tl,o){o=o||{};const ep={id:"EX",antibiotica:o.ab||["Q1","Q2","Q3"],patient:{waar:o.waar||{w:35,s:"x",b:true,z:0},medicatie:o.med||[{id:"m1",label:"m1"},{id:"m2",label:"m2"}]},gebeurtenissen:o.gd===undefined?[{id:"E",zet:{resistent:["Q1"]}},{id:"G",zet:{gevoelig:["Q1"]}},{id:"H"}]:o.gd,lijstje:["Q1"]};
 if(o.ep)Object.assign(ep,o.ep);
 const casus={id:"c",rollen:!("rollen" in o)?{wissel:"B1",stop:"B2",pauzeer:"B3",hervat:"B5"}:o.rollen,episodes:[ep]};
 if(o.zonderAb)delete ep.antibiotica;if(o.zonderMed)delete ep.patient.medicatie;
 const tijdlijn=(tl||[]).map((r,i)=>({volg:r.volg||i+1,kaart:r[0]||r.kaart,dag:r[1]||r.dag,doel:r[2]||r.doel||null,optie:r[3]||r.optie||null}));
 return P.maakContext(casus,ep,{tijdlijn,gebeurtenissen:o.geb||[],toestanden:o.t||[],klachten:o.kl||[],dag:o.dag||1,aantalDagen:7});}
const R=(kaart,dag,doel,optie)=>[kaart,dag,doel,optie];
function is(naam,pred,ctx,verwacht){n++;let r;try{r=P.evalueer(pred,ctx);}catch(e){r="FOUT:"+e.message;}
 if(r!==verwacht){rood++;console.log("AFWIJKING",naam,"->",JSON.stringify(r),"verwacht",JSON.stringify(verwacht));}}
function fout(naam,fn,regex){n++;try{fn();rood++;console.log("GEEN FOUT",naam);}catch(e){ if(!(e&&typeof e.message==="string"&&e.name==="Error")||(regex&&!regex.test(e.message))||!/[a-z]/.test(e.message)){rood++;console.log("FOUT-ONGESCHIKT",naam,e&&e.message);} else if(e.name==="TypeError"||e.name==="ReferenceError"){rood++;console.log("TYPEFOUT (geen nette Nederlandse fout)",naam,e.constructor.name,e.message);} }}
const leeg=mk([]);
// 1 eager validatie, lege tijdlijn
fout("eager: fout in niet-genomen tak van of",()=>P.evalueer({p:"of",args:[{p:"waarheid",waarde:true},{p:"gespeeld",kaart:"X",foutveld:1}]},leeg));
fout("eager: fout in en na onwaar",()=>P.evalueer({p:"en",args:[{p:"waarheid",waarde:false},{p:"gebeurtenisGeweest",id:"ONBEKEND"}]},leeg));
fout("eager: alsDan dan-tak met kaartUit onbekend",()=>P.evalueer({p:"alsDan",als:{p:"waarheid",waarde:false},dan:{p:"gespeeld",kaartUit:"nee"}},leeg));
fout("eager: niet(arg onbekende set)",()=>P.evalueer({p:"niet",arg:{p:"actief",uitSet:"nee"}},leeg));
for(const nm of ["toString","constructor","__proto__","hasOwnProperty","valueOf"]){
 fout("onbekend predicaat "+nm,()=>P.evalueer({p:nm},leeg),/Onbekend predicaat/);
 fout("onbekende teller "+nm,()=>P.tel({t:nm},leeg),/Onbekende teller/);
 fout("uitSet "+nm,()=>P.evalueer({p:"actief",uitSet:nm},leeg),/Onbekende set/);
 fout("kaartUit "+nm,()=>P.evalueer({p:"gespeeld",kaartUit:nm},leeg),/Onbekende set/);
 fout("waar veld "+nm,()=>P.evalueer({p:"waar",veld:nm,op:"==",waarde:1},leeg),/staat niet/);
 fout("medicatie "+nm,()=>P.evalueer({p:"medicatieActief",id:nm},leeg),/Onbekende medicatie/);
 fout("gebeurtenis "+nm,()=>P.evalueer({p:"gebeurtenisGeweest",id:nm},leeg),/Onbekende gebeurtenis/);
 fout("middel "+nm,()=>P.evalueer({p:"actief",middel:nm},leeg),/geen antibioticum/);
}
fout("onbekende operator tel",()=>P.evalueer({p:"tel",teller:{t:"gespeeld",kaart:"X"},op:"~",waarde:1},leeg),/operator/);
fout("onbekende operator waar",()=>P.evalueer({p:"waar",veld:"w",op:"~",waarde:1},leeg),/operator/);
fout("onbekende operator aantalActieve",()=>P.evalueer({p:"aantalActieveAntibiotica",op:"max",n:1},leeg),/operator/);
// types
for(const [nm,pr] of [["n string",{p:"binnenBeurten",kaart:"X",naGebeurtenis:"E",n:"2"}],["n NaN",{p:"binnenBeurten",kaart:"X",naGebeurtenis:"E",n:NaN}],["n Infinity",{p:"binnenBeurten",kaart:"X",naGebeurtenis:"E",n:Infinity}],
 ["van string",{p:"opDagRelatief",kaart:"X",anker:{kaart:"Y"},van:"1"}],["tot null",{p:"opDagRelatief",kaart:"X",anker:{kaart:"Y"},van:1,tot:null}],
 ["offset string",{p:"actief",op:{eindeBeurtNaGebeurtenis:"E",offset:"1"}}],["op.dag string",{p:"actief",op:{dag:"3"}}],["tel waarde string",{p:"tel",teller:{t:"gespeeld",kaart:"X"},op:">",waarde:"1"}],
 ["kaart getal",{p:"gespeeld",kaart:5}],["kaart lijst met getal",{p:"gespeeld",kaart:["X",5]}],["middel getal",{p:"gestart",middel:3}],["start getal",{p:"gespeeld",start:3}],["optieNiet getal",{p:"gespeeld",kaart:"X",optieNiet:[1]}],["doel getal",{p:"gespeeld",kaart:"X",doel:3}],["optie getal",{p:"gespeeld",kaart:"X",optie:3}],
 ["typfout veld",{p:"gespeeld",kaart:"X",dooel:"Y"}],["typfout veld nest",{p:"gespeeld",K:{kaart:"X",dooel:"Y"}}],["typfout predicaat-veld waar",{p:"waar",veld:"w",op:"<",waarde:1,extra:1}],["typfout op moment",{p:"actief",op:{dagg:1}}],
 ["mengvorm",{p:"gespeeld",K:{kaart:"X"},doel:"Y"}],["K ontbreekt",{p:"gespeeld"}],["K leeg",{p:"gespeeld",K:{}}],["K null",{p:"gespeeld",K:null}],["K array",{p:"gespeeld",K:[{kaart:"X"}]}],
 ["offset zonder gebeurtenis",{p:"actief",op:{dag:1,offset:0}}],["twee soorten moment",{p:"actief",op:{dag:1,eindeBeurtNaGebeurtenis:"E"}}],["leeg moment",{p:"actief",op:{}}],["moment string",{p:"actief",op:"laatste"}],["moment getal",{p:"actief",op:3}],
 ["klachten op string onbekend",{p:"klachten",waarde:"af",op:"eerste"}],["klachten waarde onbekend",{p:"klachten",waarde:"weg"}],["klachten naKaart",{p:"klachten",waarde:"af",op:{naKaart:{kaart:"X"}}}],
 ["waarheid string",{p:"waarheid",waarde:"true"}],["en args niet array",{p:"en",args:{p:"waarheid",waarde:true}}],["niet zonder arg",{p:"niet"}],["niet arg null",{p:"niet",arg:null}],["en args met null",{p:"en",args:[null]}],["alsDan zonder dan",{p:"alsDan",als:{p:"waarheid",waarde:true}}],
 ["p getal",{p:5}],["p ontbreekt",{}],["pred null",null],["pred string","gespeeld"],["pred array",[]],
 ["gestart zonder middel",{p:"gestart"}],["medicatieActief zonder id",{p:"medicatieActief"}],["aantal zonder n",{p:"aantalActieveAntibiotica",op:">"}],
 ["waar ordening string",{p:"waar",veld:"s",op:">",waarde:"a"}],["waar ordening bool",{p:"waar",veld:"b",op:"<",waarde:1}],["waar ordening waarde string",{p:"waar",veld:"w",op:"<",waarde:"40"}],
 ["tel teller zonder t",{p:"tel",teller:{},op:">",waarde:1}],["tel teller extra veld",{p:"tel",teller:{t:"gespeeld",kaart:"X",foo:1},op:">",waarde:1}],["tel teller op ander",{p:"tel",teller:{t:"aantalActieveAntibiotica",op:">"},op:">",waarde:1}],["teller terwijlKlachten onbekend",{p:"tel",teller:{t:"gespeeld",kaart:"X",terwijlKlachten:"nee"},op:">",waarde:1}],
 ["TODO_BART-key op moment ok maar vals veld niet",{p:"gespeeld",kaart:"X",TODO_BARTx:1,vals:2}],
 ]){ fout(nm,()=>P.evalueer(pr,leeg)); }
// ok: TODO_BART keys genegeerd
is("TODO_BART sleutel genegeerd pred",{p:"gespeeld",kaart:"X",TODO_BART:"vraag"},leeg,false);
is("TODO_BART sleutel genegeerd K",{p:"gespeeld",K:{kaart:"X",TODO_BART_2:"v"}},leeg,false);
is("TODO_BART op moment",{p:"actief",op:{dag:1,TODO_BART:"v"}},leeg,false);
// 5 kaartUit en uitSet
is("kaartUit antibiotica",{p:"gespeeld",kaartUit:"antibiotica"},mk([R("Q2",1)]),true);
is("kaartUit andere lijst",{p:"gespeeld",kaartUit:"lijstje"},mk([R("Q2",1)]),false);
is("uitSet resistent leeg bekend",{p:"actief",uitSet:"resistent"},mk([R("Q1",1)],{gd:[]}),false);
is("uitSet gevoelig bekend (zonder defs) ",{p:"actief",uitSet:"gevoelig"},mk([R("Q1",1)],{gd:[]}),false);
is("uitSet basis uit waar",{p:"actief",uitSet:"resistent"},mk([R("Q1",1)],{waar:{resistent:["Q1"]}}),true);
is("uitSet basis uit episode",{p:"actief",uitSet:"zeldzaam"},mk([R("Q1",1)],{ep:{zeldzaam:["Q1"]}}),true);
is("uitSet uit zet van gebeurtenis die geweest is",{p:"actief",uitSet:"resistent"},mk([R("Q1",1)],{geb:[{id:"E",dag:2}]}),true);
is("uitSet gebeurtenis niet geweest",{p:"actief",uitSet:"resistent"},mk([R("Q1",1)]),false);
is("uitSet op moment vóór gebeurtenis",{p:"actief",uitSet:"resistent",op:{dag:1}},mk([R("Q1",1)],{geb:[{id:"E",dag:2}]}),false);
is("uitSet op moment op dag gebeurtenis",{p:"actief",uitSet:"resistent",op:{dag:2}},mk([R("Q1",1)],{geb:[{id:"E",dag:2}]}),true);
is("uitSet gevoelig verwijdert (G na E)",{p:"actief",uitSet:"resistent"},mk([R("Q1",1)],{geb:[{id:"E",dag:2},{id:"G",dag:3}]}),false);
is("uitSet dubbele definities: eerste telt",{p:"actief",uitSet:"resistent"},mk([R("Q1",1)],{gd:[{id:"E",zet:{resistent:["Q1"]}},{id:"E",zet:{resistent:[]}}],geb:[{id:"E",dag:2}]}),true);
// gebeurtenis-lijst leeg/ontbreekt => niet gecontroleerd
is("gebeurtenis-id niet gecontroleerd als lijst leeg",{p:"gebeurtenisGeweest",id:"ZZ"},mk([],{gd:[]}),false);
is("gebeurtenis-id niet gecontroleerd als lijst ontbreekt",{p:"gebeurtenisGeweest",id:"ZZ"},mk([],{gd:undefined,ep:{gebeurtenissen:undefined}}),false);
fout("gebeurtenis-lijst ontbreekt, maar eindeBeurt: ok?",()=>{P.evalueer({p:"actief",op:{eindeBeurtNaGebeurtenis:"E"}},mk([],{ep:{gebeurtenissen:undefined}}));throw new Error("ok-geen-fout-verwacht")},/ok-geen-fout/);
// medicatie en antibiotica lijst
fout("episode zonder medicatielijst",()=>P.evalueer({p:"medicatieActief",id:"m1"},mk([],{zonderMed:true})),/medicatie/);
fout("episode zonder antibiotica actief",()=>P.evalueer({p:"actief"},mk([],{zonderAb:true})),/antibiotica/);
fout("episode zonder antibiotica kaartUit antibiotica",()=>P.evalueer({p:"gespeeld",kaartUit:"antibiotica"},mk([],{zonderAb:true})),/Onbekende set/);
fout("episode zonder antibiotica aantal",()=>P.evalueer({p:"aantalActieveAntibiotica",op:">",n:1},mk([],{zonderAb:true})),/antibiotica/);
fout("actief middel geen antibioticum",()=>P.evalueer({p:"actief",middel:"V1"},leeg),/geen antibioticum/);
is("medicatie als lijst van ids",{p:"medicatieActief",id:"m1"},mk([],{med:["m1"]}),true);
// rollen
for(const [nm,pr] of [["actief",{p:"actief"}],["gestart",{p:"gestart",middel:"Q1"}],["medicatieActief",{p:"medicatieActief",id:"m1"}],["aantal",{p:"aantalActieveAntibiotica",op:">",n:1}],["tel aantal",{p:"tel",teller:{t:"aantalActieveAntibiotica",op:"max"},op:">",waarde:1}],["K start",{p:"gespeeld",start:"Q1"}],["anker start",{p:"opDagRelatief",kaart:"X",anker:{start:"Q1"},van:0}],["naKaart start",{p:"binnenBeurtenNaKaart",kaart:"X",naKaart:{start:"Q1"},n:1}],["op.naKaart start",{p:"actief",op:{naKaart:{start:"Q1"}}}],["a start",{p:"voor",a:{start:"Q1"},b:{kaart:"X"}}]]){
 for(const r of [null,{wissel:"B1",stop:"B2",pauzeer:"B3"},{wissel:"B1",stop:"B2",pauzeer:"B3",hervat:""},"B1"])
  fout("rollen ontbreken ("+JSON.stringify(r)+") bij "+nm,()=>P.evalueer(pr,mk([],{rollen:r})),/rollen/);
}
for(const [nm,pr] of [["gespeeld",{p:"gespeeld",kaart:"X"}],["voor",{p:"voor",a:{kaart:"X"},b:{kaart:"Y"}}],["waar",{p:"waar",veld:"w",op:">",waarde:1}],["klachten",{p:"klachten",waarde:"af"}],["tel gespeeld",{p:"tel",teller:{t:"gespeeld",kaart:"X"},op:">",waarde:0}],["binnenBeurten",{p:"binnenBeurten",kaart:"X",naGebeurtenis:"E",n:2}]])
 is("zonder rollen werkt "+nm,pr,mk([],{rollen:null}),nm==="waar");
// sem K
const kt=[R("A",1,"d1","o1"),R("A",2),R("B",3)];
is("doel null = regel zonder doel",{p:"gespeeld",kaart:"A",doel:null},mk(kt),true);
is("doel null; alleen met doel",{p:"gespeeld",kaart:"A",doel:null},mk([R("A",1,"d1")]),false);
is("optie null",{p:"gespeeld",kaart:"A",optie:null},mk([R("A",1,null,"o")]),false);
is("optieNiet met regel zonder optie telt mee",{p:"gespeeld",kaart:"A",optieNiet:["o1"]},mk([R("A",1)]),true);
is("optieNiet sluit uit",{p:"gespeeld",kaart:"A",optieNiet:["o1"]},mk([R("A",1,null,"o1")]),false);
is("kaart lijst",{p:"gespeeld",kaart:["Z","B"]},mk(kt),true);
is("naGebeurtenis niet geweest -> niets",{p:"gespeeld",kaart:"A",naGebeurtenis:"E"},mk(kt),false);
is("naGebeurtenis rand",{p:"gespeeld",kaart:"B",naGebeurtenis:"E"},mk(kt,{geb:[{id:"E",dag:3}]}),true);
is("voorGebeurtenis niet geweest -> alles",{p:"gespeeld",kaart:"A",voorGebeurtenis:"E"},mk(kt),true);
is("voorGebeurtenis rand excl",{p:"gespeeld",kaart:"B",voorGebeurtenis:"E"},mk(kt,{geb:[{id:"E",dag:3}]}),false);
is("start: kaart zelf",{p:"gestart",middel:"Q1"},mk([R("Q1",1)]),true);
is("start: B1 doel",{p:"gestart",middel:"Q2"},mk([R("Q1",1),R("B1",2,"Q2")]),true);
is("start: B2 doel telt niet",{p:"gestart",middel:"Q2"},mk([R("B2",2,"Q2")]),false);
is("start lijst",{p:"gestart",middel:["Q2","Q3"]},mk([R("B1",2,"Q3")]),true);
// binnenBeurten randen
for(const [d,v] of [[2,false],[3,true],[4,true],[5,false]]) is("binnenBeurten n=2 gebeurtenis d3 kaart d"+d,{p:"binnenBeurten",kaart:"A",naGebeurtenis:"E",n:2},mk([R("A",d)],{geb:[{id:"E",dag:3}]}),v);
is("binnenBeurten n=0",{p:"binnenBeurten",kaart:"A",naGebeurtenis:"E",n:0},mk([R("A",3)],{geb:[{id:"E",dag:3}]}),false);
is("binnenBeurten n negatief",{p:"binnenBeurten",kaart:"A",naGebeurtenis:"E",n:-2},mk([R("A",3)],{geb:[{id:"E",dag:3}]}),false);
is("binnenBeurten gebeurtenis niet geweest",{p:"binnenBeurten",kaart:"A",naGebeurtenis:"E",n:5},mk([R("A",3)]),false);
for(const [d,v] of [[1,false],[2,true],[3,true],[4,false]]) is("binnenBeurtenNaKaart n=2 anker d2 kaart d"+d,{p:"binnenBeurtenNaKaart",K:{kaart:"A"},naKaart:{kaart:"Z"},n:2},mk([R("Z",2),R("A",d)]),v);
is("BBNK dubbele anker: eerste telt",{p:"binnenBeurtenNaKaart",K:{kaart:"A"},naKaart:{kaart:"Z"},n:1},mk([R("Z",2),R("Z",5),R("A",5)]),false);
// opDagRelatief
for(const [d,v] of [[2,false],[3,false],[5,true],[7,true],[8,false]]) is("opDag 2..4 anker d3 kaart d"+d,{p:"opDagRelatief",K:{kaart:"A"},anker:{kaart:"Z"},van:2,tot:4},mk([R("Z",3),R("A",d)]),v);
is("opDag zonder tot: oneindig",{p:"opDagRelatief",K:{kaart:"A"},anker:{kaart:"Z"},van:2},mk([R("Z",1),R("A",100)]),true);
is("opDag anker zelf 0",{p:"opDagRelatief",K:{kaart:"Z"},anker:{kaart:"Z"},van:0,tot:0},mk([R("Z",1)]),true);
is("opDag geen anker",{p:"opDagRelatief",K:{kaart:"A"},anker:{kaart:"Z"},van:0},mk([R("A",1)]),false);
is("opDag K ervoor (negatief)",{p:"opDagRelatief",K:{kaart:"A"},anker:{kaart:"Z"},van:-2,tot:-1},mk([R("A",1),R("Z",3)]),true);
is("opDag eerste anker telt",{p:"opDagRelatief",K:{kaart:"A"},anker:{kaart:"Z"},van:0,tot:0},mk([R("Z",1),R("Z",4),R("A",4)]),false);
// voor/na
is("voor",{p:"voor",a:{kaart:"X"},b:{kaart:"Y"}},mk([R("X",1),R("Y",1)]),true);
is("voor ongesorteerd volg",{p:"voor",a:{kaart:"X"},b:{kaart:"Y"}},mk([{volg:2,kaart:"X",dag:1},{volg:1,kaart:"Y",dag:1}]),false);
is("na",{p:"na",a:{kaart:"X"},b:{kaart:"Y"}},mk([R("Y",1),R("X",1)]),true);
is("voor: eerste match telt",{p:"voor",a:{kaart:"X"},b:{kaart:"Y"}},mk([R("Y",1),R("X",2),R("Y",3),R("X",4)]),false);
// actief
is("actief eind",{p:"actief",middel:"Q1"},mk([R("Q1",1)]),true);
is("actief gestopt B2",{p:"actief",middel:"Q1"},mk([R("Q1",1),R("B2",2,"Q1")]),false);
is("actief gestopt B2 verkeerd doel",{p:"actief",middel:"Q1"},mk([R("Q1",1),R("B2",2,"Q2")]),true);
is("actief vervangen B1",{p:"actief",middel:"Q1"},mk([R("Q1",1),R("B1",2,"Q2")]),false);
is("actief nieuw door B1",{p:"actief",middel:"Q2"},mk([R("Q1",1),R("B1",2,"Q2")]),true);
is("actief zonder middel",{p:"actief"},mk([R("Q1",1)]),true);
is("actief zonder middel, niets",{p:"actief"},mk([]),false);
is("actief niet-antibioticum kaart",{p:"actief"},mk([R("X",1)]),false);
is("actief op dag",{p:"actief",middel:"Q1",op:{dag:1}},mk([R("Q1",1),R("B2",2,"Q1")]),true);
is("actief eindeBeurt offset 0",{p:"actief",middel:"Q1",op:{eindeBeurtNaGebeurtenis:"E"}},mk([R("Q1",1),R("B2",3,"Q1")],{geb:[{id:"E",dag:3}]}),false);
is("actief eindeBeurt E niet geweest -> false",{p:"actief",middel:"Q1",op:{eindeBeurtNaGebeurtenis:"E"}},mk([R("Q1",1)]),false);
is("actief naKaart",{p:"actief",middel:"Q1",op:{naKaart:{kaart:"Q1"}}},mk([R("Q1",1),R("B2",1,"Q1")]),true);
is("actief naKaart geen match -> false",{p:"actief",middel:"Q1",op:{naKaart:{kaart:"X"}}},mk([R("Q1",1)]),false);
is("actief middel lijst",{p:"actief",middel:["Q2","Q1"]},mk([R("Q1",1)]),true);
is("B1 zonder doel doet niets",{p:"actief",middel:"Q1"},mk([R("Q1",1),R("B1",2)]),true);
// aantal
is("aantal: 2 gelijktijdig dag",{p:"aantalActieveAntibiotica",op:">",n:1},mk([R("Q1",1),R("Q2",1)]),true);
is("aantal: wissel -> 1",{p:"aantalActieveAntibiotica",op:">",n:1},mk([R("Q1",1),R("B1",1,"Q2")]),false);
is("aantal: tussenstand telt (Q1,Q2,stop Q1 zelfde dag)",{p:"aantalActieveAntibiotica",op:">",n:1},mk([R("Q1",1),R("Q2",1),R("B2",1,"Q1")]),true);
is("aantal: ==0",{p:"aantalActieveAntibiotica",op:"==",n:0},mk([]),true);
is("aantal: dubbel gespeelde kaart telt 1",{p:"aantalActieveAntibiotica",op:">",n:1},mk([R("Q1",1),R("Q1",2)]),false);
// medicatie
is("med: gepauzeerd",{p:"medicatieActief",id:"m1"},mk([R("B3",1,"m1")]),false);
is("med: hervat",{p:"medicatieActief",id:"m1"},mk([R("B3",1,"m1"),R("B5",2,"m1")]),true);
is("med: pauze op dag",{p:"medicatieActief",id:"m1",op:{dag:1}},mk([R("B3",2,"m1")]),true);
is("med: pauze ander",{p:"medicatieActief",id:"m1"},mk([R("B3",1,"m2")]),true);
is("med: opnieuw gepauzeerd",{p:"medicatieActief",id:"m1"},mk([R("B3",1,"m1"),R("B5",2,"m1"),R("B3",3,"m1")]),false);
is("med: E niet geweest -> false",{p:"medicatieActief",id:"m1",op:{eindeBeurtNaGebeurtenis:"E"}},mk([]),false);
// waar
is("waar == string vs getal",{p:"waar",veld:"w",op:"==",waarde:"35"},leeg,false);
is("waar == true vs 1",{p:"waar",veld:"b",op:"==",waarde:1},leeg,false);
is("waar = ",{p:"waar",veld:"w",op:"=",waarde:35},leeg,true);
is("waar !=",{p:"waar",veld:"w",op:"!=",waarde:35},leeg,false);
is("waar < rand",{p:"waar",veld:"w",op:"<",waarde:35},leeg,false);
is("waar <= rand",{p:"waar",veld:"w",op:"<=",waarde:35},leeg,true);
is("waar nul",{p:"waar",veld:"z",op:"==",waarde:0},leeg,true);
is("waar == bool",{p:"waar",veld:"b",op:"==",waarde:true},leeg,true);
is("waar string ==",{p:"waar",veld:"s",op:"==",waarde:"x"},leeg,true);
// klachten
const kl=[{dag:1,status:null},{dag:2,status:"af"},{dag:3,status:"aan"}];
is("klachten ooit",{p:"klachten",waarde:"aan"},mk([],{kl}),true);
is("klachten dag",{p:"klachten",waarde:"aan",op:{dag:2}},mk([],{kl}),false);
is("klachten E+1",{p:"klachten",waarde:"aan",op:{eindeBeurtNaGebeurtenis:"E",offset:1}},mk([],{kl,geb:[{id:"E",dag:2}]}),true);
is("klachten E niet geweest",{p:"klachten",waarde:"aan",op:{eindeBeurtNaGebeurtenis:"E",offset:1}},mk([],{kl}),false);
is("klachten laatste",{p:"klachten",waarde:"aan",op:"laatste"},mk([],{kl,dag:3}),true);
is("klachten laatste: laatsteDag uit tijdlijn",{p:"klachten",waarde:"aan",op:"laatste"},mk([R("X",5)],{kl,dag:1}),false);
// en/of
is("en leeg",{p:"en",args:[]},leeg,true);is("of leeg",{p:"of",args:[]},leeg,false);
// tellers
function tl(t,c){try{return P.tel(t,c);}catch(e){return "FOUT:"+e.message}}
n++;if(tl({t:"gespeeld",kaart:"A"},mk([R("A",1),R("A",2)]))!==2){rood++;console.log("teller dubbel");}
n++;if(tl({t:"gespeeld",kaart:"A",terwijlKlachten:"af"},mk([R("A",1),R("A",2),R("A",3)],{kl}))!==1){rood++;console.log("teller terwijlKlachten",tl({t:"gespeeld",kaart:"A",terwijlKlachten:"af"},mk([R("A",1),R("A",2),R("A",3)],{kl})));}
n++;if(tl({t:"gespeeld",kaart:"A",terwijlKlachten:"aan"},mk([R("A",1),R("A",9)],{kl}))!==0){rood++;console.log("teller dag1/onbekend");}
n++;if(tl({t:"aantalActieveAntibiotica",op:"max"},mk([R("Q1",1),R("Q2",1),R("B2",1,"Q1")]))!==2){rood++;console.log("teller max");}
// tel predicate asymmetrisch
is("tel > asymmetrisch",{p:"tel",teller:{t:"gespeeld",kaart:"A"},op:">",waarde:1},mk([R("A",1),R("A",2),R("A",3)]),true);
is("tel < asymmetrisch",{p:"tel",teller:{t:"gespeeld",kaart:"A"},op:"<",waarde:1},mk([R("A",1),R("A",2),R("A",3)]),false);
// context-onveranderd
{const c=mk([R("Q1",1),R("B1",2,"Q2")],{geb:[{id:"E",dag:2}],kl});const snap=JSON.stringify([c.tijdlijn,c.gebeurtenissen,c.toestanden,c.klachten,c.episode,c.casus]);
 const p={p:"en",args:[{p:"actief",uitSet:"resistent"},{p:"gespeeld",kaart:["Q1"]},{p:"tel",teller:{t:"aantalActieveAntibiotica",op:"max"},op:">=",waarde:1}]};const ps=JSON.stringify(p);
 P.evalueer(p,c);n++;if(JSON.stringify([c.tijdlijn,c.gebeurtenissen,c.toestanden,c.klachten,c.episode,c.casus])!==snap||JSON.stringify(p)!==ps){rood++;console.log("MUTATIE ctx/pred");}}
// maakContext kopieën
{const st={tijdlijn:[{volg:1,kaart:"A",dag:1}],gebeurtenissen:[],toestanden:["x"],klachten:[]};const c=P.maakContext({episodes:[{id:"Z",patient:{waar:{}}}]},"Z",st);st.tijdlijn.push({volg:2,kaart:"B",dag:1});st.toestanden.push("y");n++;if(c.tijdlijn.length!==1||c.toestanden.length!==1){rood++;console.log("ctx geen kopie");}}
// valideer-API
fout("valideer(teller)",()=>P.valideer({t:"gespeeld",kaart:"X",x:1},mk([]).casus,mk([]).episode));
fout("valideer(pred, ctx)",()=>P.valideer({p:"gespeeld",kaart:"X",x:1},leeg));
n++;try{P.valideer({t:"gespeeld",kaart:"X"},leeg);}catch(e){rood++;console.log("valideer teller ok? ",e.message)}
console.log("claims:",n,"afwijkingen:",rood);

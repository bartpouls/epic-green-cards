// criticus r5: beweringen uit regels/PREDICATEN.md uitvoeren
const fs=require("fs"),vm=require("vm");const root="/home/user/epic-green-cards";
const sb={console};sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
vm.runInContext(fs.readFileSync(root+"/regels/predicaten.js","utf8"),sb);const P=sb.Predicaten;
const ep={id:"EX",antibiotica:["Q1","Q2","Q3"],reserve:["Q2"],patient:{waar:{w:10,s:"a",b:true,leeg:null},medicatie:[{id:"m1",label:"x"},"m2"]},
 gebeurtenissen:[{id:"E",zet:{resistent:["Q1"]}},{id:"F",zet:{gevoelig:["Q1"]}}],resistent:["Q3"]};
const casus={rollen:{wissel:"B1",stop:"B2",pauzeer:"B3",hervat:"B5"},episodes:[ep]};
const R=(volg,kaart,dag,doel,optie)=>({volg,kaart,dag,doel:doel===undefined?null:doel,optie:optie===undefined?null:optie});
function ctxv(tl,o){o=o||{};return P.maakContext(casus,ep,Object.assign({tijdlijn:tl,gebeurtenissen:[],toestanden:[],klachten:[]},o));}
let ok=0,bad=0;
function eis(naam,f){try{const r=f();if(r===true){ok++;}else{bad++;console.log("FAIL",naam,r);}}catch(e){bad++;console.log("FAIL(exc)",naam,e.message);}}
function geeft(naam,p,c,v){eis(naam,()=>{const r=P.evalueer(p,c);return r===v?true:"kreeg "+r;});}
function fout(naam,p,c){eis(naam,()=>{try{P.evalueer(p,c||ctxv([]));}catch(e){return /[a-z]/.test(e.message)&&!(e instanceof TypeError)&&!(e instanceof RangeError)&&!(e instanceof ReferenceError)?true:"jsfout "+e.message;}return "geen fout";});}
const c0=ctxv([]);
// onbekend predicaat incl. prototypenamen
["bestaatniet","toString","constructor","__proto__","hasOwnProperty","valueOf"].forEach(n=>fout("onbekend p "+n,{p:n}));
fout("onbekende teller",{p:"tel",teller:{t:"toString"},op:">",waarde:0});
fout("onbekende operator",{p:"waar",veld:"w",op:"~",waarde:1});
fout("onbekende operator toString",{p:"waar",veld:"w",op:"toString",waarde:1});
// null-regels
["kaart","start","optieNiet","kaartUit","naGebeurtenis","voorGebeurtenis"].forEach(v=>fout("null "+v,Object.assign({p:"gespeeld",kaart:"Q1"},{[v]:null})));
fout("null middel gestart",{p:"gestart",middel:null});fout("null middel actief",{p:"actief",middel:null});fout("null uitSet",{p:"actief",uitSet:null});
fout("null op actief",{p:"actief",op:null});fout("null op med",{p:"medicatieActief",id:"m1",op:null});fout("null op klachten",{p:"klachten",waarde:"af",op:null});
fout("null id gebeurtenisGeweest",{p:"gebeurtenisGeweest",id:null});fout("null t",{p:"inToestand",t:null});fout("null veld",{p:"waar",veld:null,op:"==",waarde:1});
fout("null n binnenBeurten",{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"E",n:null});
fout("null van",{p:"opDagRelatief",kaart:"Q1",anker:{kaart:"Q2"},van:null});
fout("null tot",{p:"opDagRelatief",kaart:"Q1",anker:{kaart:"Q2"},van:0,tot:null});
fout("null offset",{p:"klachten",waarde:"af",op:{eindeBeurtNaGebeurtenis:"E",offset:null}});
fout("null op.dag",{p:"actief",op:{dag:null}});
fout("null K",{p:"gespeeld",K:null});fout("null a",{p:"voor",a:null,b:{kaart:"Q1"}});fout("null anker",{p:"opDagRelatief",kaart:"Q1",anker:null,van:0});
fout("null naKaart",{p:"binnenBeurtenNaKaart",K:{kaart:"Q1"},naKaart:null,n:1});
fout("null arg",{p:"niet",arg:null});fout("null als",{p:"alsDan",als:null,dan:{p:"waarheid",waarde:true}});fout("null args",{p:"en",args:null});
fout("null element en",{p:"en",args:[null]});fout("null teller",{p:"tel",teller:null,op:">",waarde:0});fout("null terwijl",{p:"tel",teller:{t:"gespeeld",kaart:"Q1",terwijlKlachten:null},op:">",waarde:0});
fout("null waarde bij <",{p:"waar",veld:"w",op:"<",waarde:null});
geeft("null waarde bij == ok (leeg veld)",{p:"waar",veld:"leeg",op:"==",waarde:null},c0,true);
geeft("null waarde bij != ok",{p:"waar",veld:"w",op:"!=",waarde:null},c0,true);
geeft("null waarde bij = ok",{p:"waar",veld:"leeg",op:"=",waarde:null},c0,true);
// doel/optie null ok
geeft("doel null = regel zonder doel",{p:"gespeeld",kaart:"Q1",doel:null},ctxv([R(1,"Q1",1)]),true);
geeft("doel null matcht regel met doel niet",{p:"gespeeld",kaart:"B1",doel:null},ctxv([R(1,"B1",1,"Q1")]),false);
geeft("optie null",{p:"gespeeld",kaart:"Q1",optie:null},ctxv([R(1,"Q1",1,null,"h")]),false);
// ids
fout("lege kaart",{p:"gespeeld",kaart:""});fout("lege lijst kaart",{p:"gespeeld",kaart:[]});fout("kaart getal",{p:"gespeeld",kaart:5});fout("kaart [leeg]",{p:"gespeeld",kaart:[""]});
fout("lege lijst start",{p:"gespeeld",start:[]});fout("lege lijst middel",{p:"actief",middel:[]});
geeft("lege optieNiet ok",{p:"gespeeld",kaart:"Q1",optieNiet:[]},ctxv([R(1,"Q1",1)]),true);
// getallen
fout("n 1.5",{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"E",n:1.5});fout("n -1",{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"E",n:-1});
geeft("n 0 onwaar",{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"E",n:0},ctxv([R(1,"Q1",2)],{gebeurtenissen:[{id:"E",dag:2}]}),false);
fout("n '2'",{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"E",n:"2"});fout("n NaN",{p:"aantalActieveAntibiotica",op:">",n:NaN});fout("n Infinity",{p:"aantalActieveAntibiotica",op:">",n:Infinity});
fout("tel waarde 1.5",{p:"tel",teller:{t:"gespeeld",kaart:"Q1"},op:">",waarde:1.5});
fout("van>tot",{p:"opDagRelatief",kaart:"Q1",anker:{kaart:"Q2"},van:3,tot:1});
geeft("van=tot ok",{p:"opDagRelatief",kaart:"Q1",anker:{kaart:"Q2"},van:1,tot:1},ctxv([R(1,"Q2",1),R(2,"Q1",2)]),true);
fout("op.dag 1.5",{p:"actief",op:{dag:1.5}});fout("offset 1.5",{p:"klachten",waarde:"af",op:{eindeBeurtNaGebeurtenis:"E",offset:0.5}});
fout("waarde bij waar object",{p:"waar",veld:"w",op:"==",waarde:{}});fout("waarde NaN",{p:"waar",veld:"w",op:"==",waarde:NaN});
// velden
fout("typfout veld",{p:"gespeeld",kaart:"Q1",doell:"x"});fout("typfout K",{p:"gespeeld",K:{kaart:"Q1",doell:"x"}});fout("typfout moment",{p:"actief",op:{dag:1,extra:1}});
fout("typfout in alsDan.als",{p:"alsDan",als:{p:"gespeeld",kaart:"Q1",foo:1},dan:{p:"waarheid",waarde:true}});
geeft("TODO_BART genegeerd",{p:"gespeeld",kaart:"Q1",TODO_BART:"x"},ctxv([R(1,"Q1",1)]),true);
geeft("TODO_BART_x in K genegeerd",{p:"gespeeld",K:{kaart:"Q1",TODO_BART_x:1}},ctxv([R(1,"Q1",1)]),true);
fout("mengvorm",{p:"gespeeld",K:{kaart:"Q1"},doel:"x"});
// kaartUit
fout("kaartUit toString",{p:"gespeeld",kaartUit:"toString"});fout("kaartUit constructor",{p:"gespeeld",kaartUit:"constructor"});fout("kaartUit onbekend",{p:"gespeeld",kaartUit:"nee"});
geeft("kaartUit antibiotica",{p:"gespeeld",kaartUit:"antibiotica"},ctxv([R(1,"Q2",1)]),true);geeft("kaartUit reserve",{p:"gespeeld",kaartUit:"reserve"},ctxv([R(1,"Q1",1)]),false);
// uitSet
fout("uitSet onbekend",{p:"actief",uitSet:"nee"});fout("uitSet toString",{p:"actief",uitSet:"toString"});fout("uitSet __proto__",{p:"actief",uitSet:"__proto__"});
geeft("uitSet resistent basis uit episode",{p:"actief",middel:"Q3",uitSet:"resistent"},ctxv([R(1,"Q3",1)]),true);
geeft("uitSet resistent na E",{p:"actief",middel:"Q1",uitSet:"resistent"},ctxv([R(1,"Q1",1)],{gebeurtenissen:[{id:"E",dag:2}]}),true);
geeft("uitSet resistent voor E",{p:"actief",middel:"Q1",uitSet:"resistent",op:{dag:1}},ctxv([R(1,"Q1",1)],{gebeurtenissen:[{id:"E",dag:2}]}),false);
geeft("uitSet gevoelig verwijdert",{p:"actief",middel:"Q1",uitSet:"resistent"},ctxv([R(1,"Q1",1)],{gebeurtenissen:[{id:"E",dag:2},{id:"F",dag:3}]}),false);
geeft("uitSet reserve (episode-lijst)",{p:"actief",middel:"Q2",uitSet:"reserve"},ctxv([R(1,"Q2",1)]),true);
// gebeurtenis onbekend
fout("naGebeurtenis onbekend",{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"Z",n:1});fout("gebeurtenisGeweest onbekend",{p:"gebeurtenisGeweest",id:"Z"});
fout("voorGebeurtenis onbekend",{p:"gespeeld",kaart:"Q1",voorGebeurtenis:"Z"});fout("eindeBeurt onbekend",{p:"actief",op:{eindeBeurtNaGebeurtenis:"Z"}});
// medicatie
fout("medicatie onbekend",{p:"medicatieActief",id:"zz"});geeft("medicatie (string-id)",{p:"medicatieActief",id:"m2"},c0,true);
geeft("pauze/hervat",{p:"medicatieActief",id:"m1"},ctxv([R(1,"B3",1,"m1"),R(2,"B5",1,"m1")]),true);
geeft("pauze",{p:"medicatieActief",id:"m1"},ctxv([R(1,"B3",1,"m1")]),false);
geeft("pauze op dag voor pauze",{p:"medicatieActief",id:"m1",op:{dag:1}},ctxv([R(1,"B3",2,"m1")]),true);
// actief/gestart antibiotica
fout("actief niet-ab",{p:"actief",middel:"Z"});fout("gestart niet-ab",{p:"gestart",middel:"Z"});
// waar
geeft("waar string != getal",{p:"waar",veld:"w",op:"==",waarde:"10"},c0,false);geeft("waar true != 1",{p:"waar",veld:"b",op:"==",waarde:1},c0,false);
geeft("waar = ",{p:"waar",veld:"w",op:"=",waarde:10},c0,true);
fout("waar < op tekst",{p:"waar",veld:"s",op:"<",waarde:1});fout("waar onbekend veld ==",{p:"waar",veld:"nee",op:"==",waarde:1});fout("waar toString",{p:"waar",veld:"toString",op:"==",waarde:1});
["<","<=",">",">="].forEach((o,i)=>geeft("waar "+o,{p:"waar",veld:"w",op:o,waarde:10},c0,[false,true,false,true][i]));
// moment
fout("op twee soorten",{p:"actief",op:{dag:1,eindeBeurtNaGebeurtenis:"E"}});fout("op leeg",{p:"actief",op:{}});fout("offset bij dag",{p:"actief",op:{dag:1,offset:1}});
geeft("offset gebeurtenis niet geweest -> false",{p:"actief",op:{eindeBeurtNaGebeurtenis:"E"}},ctxv([R(1,"Q1",1)]),false);
geeft("medicatie E niet geweest -> false",{p:"medicatieActief",id:"m1",op:{eindeBeurtNaGebeurtenis:"E"}},ctxv([]),false);
geeft("actief naKaart",{p:"actief",middel:"Q1",op:{naKaart:{kaart:"Q1"}}},ctxv([R(1,"Q1",1),R(2,"B2",1,"Q1")]),true);
geeft("actief naKaart geen match",{p:"actief",op:{naKaart:{kaart:"Z"}}},ctxv([R(1,"Q1",1)]),false);
// rollen
const zonder={episodes:[ep]};
["actief","gestart"].forEach(n=>fout(n+" zonder rollen",n==="gestart"?{p:n,middel:"Q1"}:{p:n},P.maakContext(zonder,ep,{})));
fout("aantalActieve zonder rollen",{p:"aantalActieveAntibiotica",op:">",n:1},P.maakContext(zonder,ep,{}));
fout("K.start zonder rollen",{p:"gespeeld",start:"Q1"},P.maakContext(zonder,ep,{}));
fout("rol leeg",{p:"gestart",middel:"Q1"},P.maakContext({rollen:{wissel:"",stop:"B2",pauzeer:"B3",hervat:"B5"}},ep,{}));
geeft("gespeeld zonder rollen werkt",{p:"gespeeld",kaart:"Q1"},P.maakContext(zonder,ep,{tijdlijn:[R(1,"Q1",1)]}),true);
// ctx
[{}, casus, ep, {tijdlijn:[]}, null, undefined, "x", 5, []].forEach((c,i)=>fout("ctx ongeldig "+i,{p:"waarheid",waarde:true},c));
fout("maakContext lijst string",{}.x,undefined);
eis("maakContext state.tijdlijn string fout",()=>{try{P.maakContext(casus,ep,{tijdlijn:"x"});}catch(e){return true;}return "geen";});
eis("maakContext casus array fout",()=>{try{P.maakContext([],ep,{});}catch(e){return true;}return "geen";});
eis("maakContext state array fout",()=>{try{P.maakContext(casus,ep,[]);}catch(e){return true;}return "geen";});
eis("maakContext null lijsten = leeg",()=>{const c=P.maakContext(casus,ep,{tijdlijn:null,gebeurtenissen:null,toestanden:null,klachten:null});return c.tijdlijn.length===0;});
eis("maakContext episode-id",()=>P.maakContext(casus,"EX",{}).episode===ep);
eis("maakContext onbekende episode",()=>{try{P.maakContext(casus,"ZZ",{});}catch(e){return true;}return "geen";});
// en/of
geeft("lege en",{p:"en",args:[]},c0,true);geeft("lege of",{p:"of",args:[]},c0,false);
fout("en geen lijst",{p:"en",args:{}});fout("niet zonder arg",{p:"niet"});fout("alsDan zonder dan",{p:"alsDan",als:{p:"waarheid",waarde:true}});
fout("fout in niet-benodigde tak",{p:"of",args:[{p:"waarheid",waarde:true},{p:"gespeeld",kaart:null}]});
fout("fout bij lege tijdlijn onbereikbaar gebeurtenis",{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"Z",n:1},c0);
geeft("alsDan",{p:"alsDan",als:{p:"waarheid",waarde:false},dan:{p:"waarheid",waarde:false}},c0,true);
fout("waarheid 1",{p:"waarheid",waarde:1});
// tel
eis("tel",()=>P.tel({t:"gespeeld",kaart:"Q1"},ctxv([R(1,"Q1",1),R(2,"Q1",1)]))===2);
eis("tel terwijlKlachten",()=>P.tel({t:"gespeeld",kaart:"Q1",terwijlKlachten:"af"},ctxv([R(1,"Q1",1),R(2,"Q1",2),R(3,"Q1",2)],{klachten:[{dag:1,status:null},{dag:2,status:"af"}]}))===2);
fout("tel op != max",{p:"tel",teller:{t:"aantalActieveAntibiotica",op:"min"},op:">",waarde:0});
eis("tel max",()=>P.tel({t:"aantalActieveAntibiotica",op:"max"},ctxv([R(1,"Q1",1),R(2,"Q2",1),R(3,"B2",1,"Q1")]))===2);
eis("aantalActieve per moment (binnen dag)",()=>P.evalueer({p:"aantalActieveAntibiotica",op:">",n:1},ctxv([R(1,"Q1",1),R(2,"Q2",1),R(3,"B2",1,"Q1")]))===true);
eis("valideer teller",()=>{P.valideer({t:"gespeeld",kaart:"Q1"},casus,ep);try{P.valideer({t:"gespeeld",kaart:null},casus,ep);}catch(e){return true;}return "geen";});
eis("valideer(pred,ctx)",()=>{P.valideer({p:"waarheid",waarde:true},c0);return true;});
// voor/na
geeft("voor strikt volg zelfde dag",{p:"voor",a:{kaart:"Q1"},b:{kaart:"Q2"}},ctxv([R(1,"Q1",1),R(2,"Q2",1)]),true);
geeft("voor ontbreekt b",{p:"voor",a:{kaart:"Q1"},b:{kaart:"Q2"}},ctxv([R(1,"Q1",1)]),false);
geeft("voor zelfde kaart",{p:"voor",a:{kaart:"Q1"},b:{kaart:"Q1"}},ctxv([R(1,"Q1",1)]),false);
geeft("voor ongesorteerde tijdlijn",{p:"voor",a:{kaart:"Q1"},b:{kaart:"Q2"}},ctxv([R(2,"Q2",1),R(1,"Q1",1)]),true);
geeft("na",{p:"na",a:{kaart:"Q2"},b:{kaart:"Q1"}},ctxv([R(1,"Q1",1),R(2,"Q2",1)]),true);
// binnenBeurten randen
[[2,true],[3,true],[4,false],[1,false]].forEach(([d,v])=>geeft("binnenBeurten n=2 kaart dag "+d,{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"E",n:2},ctxv([R(1,"Q1",d)],{gebeurtenissen:[{id:"E",dag:2}]}),v));
geeft("binnenBeurten E niet geweest",{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"E",n:2},ctxv([R(1,"Q1",2)]),false);
geeft("opDag open eind",{p:"opDagRelatief",kaart:"Q1",anker:{kaart:"Q2"},van:2},ctxv([R(1,"Q2",1),R(2,"Q1",9)]),true);
geeft("opDag anker zelf 0",{p:"opDagRelatief",kaart:"Q2",anker:{kaart:"Q2"},van:0,tot:0},ctxv([R(1,"Q2",1)]),true);
geeft("opDag negatief verschil",{p:"opDagRelatief",kaart:"Q1",anker:{kaart:"Q2"},van:0},ctxv([R(1,"Q1",1),R(2,"Q2",3)]),false);
geeft("binnenBeurtenNaKaart n=1",{p:"binnenBeurtenNaKaart",K:{kaart:"Q1"},naKaart:{kaart:"Q2"},n:1},ctxv([R(1,"Q1",1),R(2,"Q2",1)]),true);
// klachten
geeft("klachten op dag",{p:"klachten",waarde:"aan",op:{dag:3}},ctxv([],{klachten:[{dag:3,status:"aan"}]}),true);
geeft("klachten laatste",{p:"klachten",waarde:"af",op:"laatste"},ctxv([R(1,"Q1",4)],{klachten:[{dag:3,status:"af"}]}),false);
geeft("klachten eindeBeurt+offset",{p:"klachten",waarde:"af",op:{eindeBeurtNaGebeurtenis:"E",offset:1}},ctxv([],{gebeurtenissen:[{id:"E",dag:2}],klachten:[{dag:3,status:"af"}]}),true);
fout("klachten waarde onbekend",{p:"klachten",waarde:"toeneemt"});
// gebeurtenis dubbel
geeft("dubbele gebeurtenis eerste telt",{p:"binnenBeurten",kaart:"Q1",naGebeurtenis:"E",n:1},ctxv([R(1,"Q1",2)],{gebeurtenissen:[{id:"E",dag:2},{id:"E",dag:5}]}),true);
// naGebeurtenis K-veld
geeft("naGebeurtenis niet geweest: niets matcht",{p:"gespeeld",kaart:"Q1",naGebeurtenis:"E"},ctxv([R(1,"Q1",2)]),false);
geeft("voorGebeurtenis niet geweest: alles matcht",{p:"gespeeld",kaart:"Q1",voorGebeurtenis:"E"},ctxv([R(1,"Q1",2)]),true);
// wissel vervangt
geeft("wissel vervangt",{p:"actief",middel:"Q1"},ctxv([R(1,"Q1",1),R(2,"B1",1,"Q2")]),false);
geeft("gestart via wissel",{p:"gestart",middel:"Q2"},ctxv([R(1,"B1",1,"Q2")]),true);
geeft("niet-ab-kaart nooit actief",{p:"actief"},ctxv([R(1,"Z",1)]),false);
// onveranderd
eis("evalueren muteert niet",()=>{const p={p:"en",args:[{p:"gespeeld",kaart:"Q1"}]},c=ctxv([R(1,"Q1",1)]);const a=JSON.stringify([p,c.tijdlijn]);P.evalueer(p,c);return a===JSON.stringify([p,c.tijdlijn])||"gemuteerd";});
// Nederlandse tekst
eis("fouttekst NL",()=>{try{P.evalueer({p:"x"},c0);}catch(e){return /Onbekend predicaat/.test(e.message);}});
console.log("claims ok",ok,"bad",bad);

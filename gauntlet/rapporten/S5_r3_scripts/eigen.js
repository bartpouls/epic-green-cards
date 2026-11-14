// Eigen JSON-predicaten (schendingsvoorwaarden) voor I1 en I4-I16, onafhankelijk uit bouwopdracht 6.1 + casus.
const V_ALLE=["V1","V2","V3","V4","V5","V7","V8","V9","V10"];
const g=(kaart,extra)=>Object.assign({p:"gespeeld",kaart},extra||{});
const ng=(kaart,extra)=>Object.assign({p:"nietGespeeld",kaart},extra||{});
const en=(...a)=>({p:"en",args:a}), of=(...a)=>({p:"of",args:a}), niet=a=>({p:"niet",arg:a});
const EIGEN={
 I1: en({p:"of",args:V_ALLE.map(k=>g(k))}, ng("N1")),
 I4: {p:"aantalActieveAntibiotica",op:">",n:1},
 I5: en({p:"gestart",middel:"V3"},{p:"waar",veld:"eGFR",op:"<",waarde:30}),
 I6: en({p:"waar",veld:"risicogroep",op:"==",waarde:true}, of(
      en(g(undefined,{kaartUit:"antibiotica"}), niet({p:"voor",a:{kaart:"O1"},b:{kaartUit:"antibiotica"}})), g("V1"), g("V2"))),
 I7: en({p:"gestart",middel:"V5"},{p:"waar",veld:"risicogroep",op:"==",waarde:true}, of(
      niet({p:"opDagRelatief",K:{kaart:"O2"},anker:{start:"V5"},van:1,tot:3}),
      niet({p:"opDagRelatief",K:{kaart:"V6",doel:"V5",optie:"halveren"},anker:{start:"V5"},van:3}))),
 I8: en({p:"gebeurtenisGeweest",id:"C"},
      {p:"actief",uitSet:"resistent",op:{eindeBeurtNaGebeurtenis:"C"}},
      {p:"klachten",waarde:"aan",op:{eindeBeurtNaGebeurtenis:"C"}},
      niet({p:"binnenBeurten",K:{kaart:["B1","B2"]},naGebeurtenis:"C",n:2})),
 I9: of(en(ng("O2"),ng("Ev2",{doel:"spironolacton"})),
        en(g("B5",{doel:"spironolacton"}),niet({p:"voor",a:{kaart:"Ev2",doel:"spironolacton"},b:{kaart:"B5",doel:"spironolacton"}}))),
 I10: en({p:"gebeurtenisGeweest",id:"A"},{p:"actief",middel:["V3","V4"],op:{eindeBeurtNaGebeurtenis:"A"}}),
 I11: of(en(g("B1",{naGebeurtenis:"A"}),niet({p:"voor",a:{kaart:"O1",naGebeurtenis:"A"},b:{kaart:"B1",naGebeurtenis:"A"}})),
         en(g(undefined,{kaartUit:"antibiotica",naGebeurtenis:"A"}),niet({p:"voor",a:{kaart:"O1",naGebeurtenis:"A"},b:{kaartUit:"antibiotica",naGebeurtenis:"A"}}))),
 I12: g("V9"),
 I13: en({p:"waar",veld:"eGFR",op:"<",waarde:30},{p:"actief",middel:"V8"},
      niet({p:"binnenBeurtenNaKaart",K:{kaart:"V6",doel:"V8",optie:"875/125 mg 2 dd"},naKaart:{start:"V8"},n:1})),
 I14: en({p:"gestart",middel:"V7"},{p:"medicatieActief",id:"calcium"},
      niet(of({p:"binnenBeurtenNaKaart",K:{kaart:"B4"},naKaart:{start:"V7"},n:2},
              {p:"binnenBeurtenNaKaart",K:{kaart:"B3",doel:"calcium"},naKaart:{start:"V7"},n:2}))),
 I15: en({p:"gebeurtenisGeweest",id:"B"}, niet(en(
      {p:"binnenBeurten",K:{kaart:"B3",doel:"spironolacton"},naGebeurtenis:"B",n:2},
      {p:"binnenBeurten",K:{kaart:"V6",doel:"lisinopril",optie:"halveren"},naGebeurtenis:"B",n:2},
      {p:"binnenBeurten",K:{kaart:"N3"},naGebeurtenis:"B",n:2},
      {p:"binnenBeurten",K:{kaart:"Ev1"},naGebeurtenis:"B",n:2}))),
 I16: en({p:"gebeurtenisGeweest",id:"A"}, of(niet({p:"binnenBeurten",K:{kaart:"Ev1"},naGebeurtenis:"A",n:2}),
      en({p:"klachten",waarde:"geenVerbetering48"},ng("Ev3"))))
};
module.exports=EIGEN;

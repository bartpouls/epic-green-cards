const {M,W,runPlan,samenvat,gd}=require("./bot.js");
const {en,niet}=W;
const had=(st,k,d)=>st.tijdlijn.some(t=>t.kaart===k&&(d===undefined||t.doel===d));
const aantal=(st,k)=>st.tijdlijn.filter(t=>t.kaart===k).length;
const naEv=(st,k,ev)=>st.tijdlijn.some(t=>t.kaart===k&&gd(st,ev)!==null&&t.dag>=gd(st,ev));
const pre=(start)=>[["G3"],["O1"],start||["V4"],["N1"]];
const O2=["O2",null,null,W.dag(4)], EV2=["Ev2","spironolacton",null,W.dag(4)];
const dB1=st=>gd(st,"B")!==null&&st.dag>=gd(st,"B")+1;
const sickday=()=>[
  ["B3","spironolacton",null,W.B],["V6","lisinopril","halveren",dB1],
  ["N3",null,null,dB1],
  ["Ev1",null,null,en(dB1,st=>!naEv(st,"Ev1","B"))],
];
const nieuweKweek=["O1",null,null,en(W.A,st=>!naEv(st,"O1","A"))];
const evA=["Ev1",null,null,en(W.A,st=>!naEv(st,"Ev1","A"),st=>naEv(st,"B1","A")||naEv(st,"B2","A")||naEv(st,"V7","A")||true)];
const R={};
R.fosfo_vroeg={plan:[["G3"],["O1"],["V4"],["N1"],["O2"],["Ev2","spironolacton"]],tot:2,tekst:"fosfomycine-start, afgerond voor A/B (vroeg afronden)"};
R.amoxclav={plan:[...pre(),nieuweKweek,["B1","V8",null,en(W.A,st=>naEv(st,"O1","A"))],["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")],evA,...sickday(),O2,EV2],tekst:"weefselinvasie: amox/clav 875/125 + sick-day-set"};
R.cipro_B4={plan:[...pre(),nieuweKweek,["B1","V7",null,en(W.A,st=>naEv(st,"O1","A"))],["B4","V7",null,st=>had(st,"B1","V7")],evA,...sickday(),O2,EV2],tekst:"cipro + B4 + sick-day-set"};
R.cipro_B3={plan:[...pre(),nieuweKweek,["B1","V7",null,en(W.A,st=>naEv(st,"O1","A"))],["B3","calcium",null,st=>had(st,"B1","V7")],evA,...sickday(),O2,EV2],tekst:"cipro + B3(calcium) + sick-day-set"};
R.deescalatie={plan:[...pre(),nieuweKweek,["B1","V7",null,en(W.A,st=>naEv(st,"O1","A"))],["B4","V7",null,st=>had(st,"B1","V7")],evA,...sickday(),
  ["B1","V8",null,en(W.C,st=>had(st,"B4"),st=>st.dag>=gd(st,"C")+1,W.dag(5),st=>st.actiesOver>=2)],["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")],O2,EV2],tekst:"cipro+B4, na C de-escaleren naar V8"};
R.verwijzen={plan:[...pre(),["B2","V4",null,W.A],evA,["Ev3",null,null,W.naA(2)],...sickday(),O2,EV2],tekst:"A: stop V4, Ev1, na 48 uur Ev3"};
R.cipro_start={plan:[["G3"],["O1"],["V7"],["B4","V7"],["N1"],
  nieuweKweek,["B1","V8",null,en(W.A,st=>naEv(st,"O1","A"))],["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")],evA,...sickday(),O2,EV2],tekst:"cipro direct + B4, bij A wisselen naar V8 (nieuwe kweek)"};
module.exports={R,had,naEv,pre,sickday,O2,EV2,nieuweKweek,evA};
if(require.main===module){
 for(const vol of ["AB","BA"]) for(const [n,x] of Object.entries(R)){ if(x.alleen&&x.alleen!==vol) continue;
   let o; try{ o=samenvat(runPlan(x.plan,vol,{tot:x.tot})); }catch(e){ console.log(vol,n,"FOUT:",e.message); continue; }
   console.log(vol,n,"-",x.tekst,"\n  ",o.tijdlijn,"\n   geb:",o.geb,"| kl:",o.klachten,"\n   geschonden:",o.geschonden,"poort:",o.poort,"score:",JSON.stringify(o.score),"profiel:",o.profiel,"extra:",o.extra,"zicht:",o.zicht.length,"rest:",o.rest);
 }
}

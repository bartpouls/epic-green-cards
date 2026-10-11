const {M,W,runPlan,samenvat,gd}=require("./bot.js");
const G=require("./geldig.js");
const {en,niet}=W; const {had,naEv,sickday,O2,EV2,nieuweKweek,evA}=G;
const dB1=st=>gd(st,"B")!==null&&st.dag>=gd(st,"B")+1;
const ev3=["Ev3",null,null,W.naA(2)];
const sd=(...weg)=>sickday().filter(x=>!weg.includes(x[0]+(x[1]?"/"+x[1]:"")));
const wissel=(naar,extra)=>[nieuweKweek,["B1",naar,null,en(W.A,st=>naEv(st,"O1","A"))],...(extra||[])];
const V6V8=["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")];
const preX=(start)=>[["G3"],["O1"],start,["N1"]];
const F=[]; // {id, naam, plan, tot, alleen}
const f=(id,naam,plan,opt)=>F.push(Object.assign({id,naam,plan},opt||{}));
// ---- I1
f("I1","base amox/clav zonder N1 (G1 als vulling)",[["G3"],["O1"],["V4"],["G1"],...wissel("V8",[V6V8]),evA,...sickday(),O2,EV2]);
// ---- I4
f("I4","V4 en V8 tegelijk (vroeg afronden)",[["O1"],["V4"],["O2"],["V8"],["V6","V8","875/125 mg 2 dd"],["N1"]],{tot:2});
f("I4","V4 en V10 tegelijk, geen A/B (vroeg afronden)",[["O1"],["V4"],["V10"],["O2"],["N1"]],{tot:2});
// ---- I5
f("I5","V3 start, bij A wisselen naar V8 (volledig)",[["G3"],["O1"],["V3"],["N1"],...wissel("V8",[V6V8]),evA,...sickday(),O2,EV2]);
f("I5","V3 vroeg afronden",[["G3"],["O1"],["V3"],["N1"],["O2"]],{tot:2});
// ---- I6
f("I6","V4 vóór O1 (volledig)",[["G3"],["V4"],["O1"],["N1"],...wissel("V8",[V6V8]),evA,...sickday(),O2,EV2]);
f("I6","V1 gespeeld naast valide behandeling",[["G3"],["O1"],["V1"],["V4"],["N1"],...wissel("V8",[V6V8]),evA,...sickday(),O2,EV2]);
f("I6","V2 gespeeld, geen antibioticum (vroeg)",[["G3"],["O1"],["V2"],["N1"],["O2"]],{tot:2});
// ---- I7
const v5=(o2dag,halveren)=>[["G3"],["O1"],["V5"],["N1"],...wissel("V8",[V6V8]),evA,...sickday(),
  ...(o2dag?[["O2",null,null,W.dag(o2dag)]]:[]),["Ev2","spironolacton",null,W.dag(4)],
  ...(halveren?[["V6","V5","halveren",W.dag(halveren)]]:[])];
f("I7","V5 zonder O2 en zonder halveren",v5(0,0).concat([["O2",null,null,W.dag(7)]]) ,{tot:7});
// dag-relatief: V5 op d1 => O2 verschil 2..4 => dag 3..5 ; halveren verschil>=3 => dag>=4
f("I7","V5, O2 op d3, geen halveren (vraag Dag 4)",v5(3,0),{tot:7});
const sdLaat=()=>[["B3","spironolacton",null,W.B],["V6","lisinopril","halveren",dB1],["N3",null,null,dB1],["Ev1",null,null,en(dB1,st=>!naEv(st,"Ev1","B"))]];
// I7: vroeg afronden zodat A/B/C niet zichtbaar zijn (max 4 kaarten voor de laatste dag-overgang, banner pas na volgendeDag)
f("I7","V5; O2 te vroeg (d1), geen halveren (vroeg)",[["O1"],["V5"],["O2"],["N1"]],{tot:2});
f("I7","V5; O2 d3 (diff 2) goed, halveren ontbreekt (vroeg, Dag 4-vraag)",[["O1"],["V5"],["N1",null,null],["O2",null,null,W.dag(3)]],{tot:3});
f("I7","V5; O2 d3 goed, halveren d3 (verschil 2) te vroeg (vroeg)",[["O1"],["V5"],["N1"],["O2",null,null,W.dag(3)],["V6","V5","halveren",W.dag(3)]],{tot:3});
f("I7","V5; O2 d3 goed, verdubbelen d3 (vroeg)",[["O1"],["V5"],["N1"],["O2",null,null,W.dag(3)],["V6","V5","verdubbelen",W.dag(3)]],{tot:3});
// ---- I8: V5 blijft actief na C. Alle andere eisen netjes (O2 d3, halveren d>=4, Ev1 voor A en B, Ev3, sick-day).
f("I8","V5 blijft actief na C, klachten aan (volledig netjes)",[["O1"],["V5"],["N1"],["G1"],["O2",null,null,W.dag(3)],["Ev1",null,null,en(W.A,st=>!naEv(st,"Ev1","A"))],["Ev3",null,null,W.A],
  ["B3","spironolacton",null,W.B],["V6","lisinopril","halveren",dB1],["N3",null,null,dB1],["Ev1",null,null,en(dB1,st=>!naEv(st,"Ev1","B"))],["V6","V5","halveren",W.dag(4)],["Ev2","spironolacton",null,W.dag(6)]],{tot:7});
// ---- I9
f("I9","geen O2 en geen Ev2",[["G3"],["O1"],["V4"],["N1"],...wissel("V8",[V6V8]),evA,...sickday()]);
f("I9","alleen Ev2 op lisinopril (telt niet)",[["G3"],["O1"],["V4"],["N1"],...wissel("V8",[V6V8]),evA,...sickday(),["Ev2","lisinopril",null,W.dag(4)]]);
f("I9","B5 spironolacton zonder Ev2 (O2 wel)",[["G3"],["O1"],["V4"],["N1"],...wissel("V8",[V6V8]),evA,...sickday(),O2,["B5","spironolacton",null,en(W.B,st=>st.dag>=gd(st,"B")+2)]]);
f("I9","Ev2 ná B5 (volgorde fout)",[["G3"],["O1"],["V4"],["N1"],...wissel("V8",[V6V8]),evA,...sickday(),["B5","spironolacton",null,en(W.B,st=>st.dag>=gd(st,"B")+2)],["Ev2","spironolacton",null,st=>had(st,"B5")]]);
// ---- I10
f("I10","V4 blijft actief na A (Ev1+Ev3 netjes)",[["G3"],["O1"],["V4"],["N1"],evA,ev3,...sickday(),O2,EV2]);
f("I10","V3? nee: V4 blijft; kweek wél vernieuwd",[["G3"],["O1"],["V4"],["N1"],nieuweKweek,evA,ev3,...sickday(),O2,EV2]);
// ---- I11
f("I11","wisselen na A zonder nieuwe O1",[["G3"],["O1"],["V4"],["N1"],["B1","V8",null,W.A],["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")],evA,...sickday(),O2,EV2]);
f("I11","nieuwe V-kaart na A zonder nieuwe O1 (V8 ná B2 V4)",[["G3"],["O1"],["V4"],["N1"],["B2","V4",null,W.A],["V8",null,null,W.A],["V6","V8","875/125 mg 2 dd",st=>had(st,"V8")],evA,...sickday(),O2,EV2]);
// ---- I12
f("I12","V9 (volledig)",[["G3"],["O1"],["V9"],["N1"],evA,...sickday(),O2,EV2]);
f("I12","V9 vroeg afronden",[["G3"],["O1"],["V9"],["N1"],["O2"]],{tot:2});
// ---- I13
f("I13","V8 zonder V6",[["G3"],["O1"],["V4"],["N1"],nieuweKweek,["B1","V8",null,en(W.A,st=>naEv(st,"O1","A"))],evA,...sickday(),O2,EV2]);
f("I13","V8 met V6 verkeerde optie 500/125 mg 2 dd",[["G3"],["O1"],["V4"],["N1"],nieuweKweek,["B1","V8",null,en(W.A,st=>naEv(st,"O1","A"))],["V6","V8","500/125 mg 2 dd",st=>had(st,"B1","V8")],evA,...sickday(),O2,EV2]);
f("I13","V8 met V6 pas de volgende dag",[["G3"],["O1"],["V4"],["N1"],nieuweKweek,["B1","V8",null,en(W.A,st=>naEv(st,"O1","A"))],["Ev1",null,null,st=>had(st,"B1","V8")],["V6","V8","875/125 mg 2 dd",st=>had(st,"B1","V8")&&st.tijdlijn.some(t=>t.kaart==="B1"&&t.dag<st.dag)],...sickday(),O2,EV2],{tot:7});
// ---- I14 (sickday vóór Ev3 in de wachtrij)
const c14=(extra)=>[["G3"],["O1"],["V4"],["N1"],nieuweKweek,["B1","V7",null,en(W.A,st=>naEv(st,"O1","A"))],...(extra||[]),evA,...sickday(),ev3,O2,EV2];
f("I14","cipro zonder B4/B3 (Ev3 gespeeld)",c14());
f("I14","cipro met B4 pas 2 dagen later",c14().concat([["B4","V7",null,st=>naEv(st,"B1","A")&&st.tijdlijn.some(t=>t.kaart==="B1"&&t.dag+2<=st.dag)]]));
f("I14","cipro vroeg afronden zonder B4",[["G3"],["O1"],["V7"],["N1"],["O2"]],{tot:2});
// ---- I15
const zonder=(w)=>sickday().filter(x=>w!==x[0]+(x[1]?"/"+x[1]:""));
const a2=(rest)=>[["G3"],["O1"],["V4"],["N1"],...wissel("V8",[V6V8]),evA,...rest,O2,EV2];
f("I15","zonder B3 spironolacton",a2(zonder("B3/spironolacton")));
f("I15","zonder V6 lisinopril halveren",a2(zonder("V6/lisinopril")));
f("I15","zonder N3",a2(zonder("N3")));
f("I15","V6 lisinopril 'stoppen' i.p.v. halveren",a2([["B3","spironolacton",null,W.B],["V6","lisinopril","stoppen",dB1],["N3",null,null,dB1],["Ev1",null,null,en(dB1,st=>!naEv(st,"Ev1","B"))]]));
// Ev1 voor B ontbreekt: A afhandelen met stop V4 + Ev1 op de dag van A (valt buiten het B-venster), Ev3 later
f("I15","zonder Ev1 binnen B-venster (A: stop V4, Ev1 op dA buiten B-venster, Ev3)",[["G3"],["O1"],["V4"],["N1"],["B2","V4",null,W.A],["Ev1",null,null,st=>gd(st,"A")!==null&&st.dag===gd(st,"A")&&(gd(st,"B")===null||st.dag<gd(st,"B")||st.dag>gd(st,"B")+1)],
   ["B3","spironolacton",null,W.B],["V6","lisinopril","halveren",dB1],["N3",null,null,dB1],ev3,O2,EV2],{tot:7});
// ---- I16
f("I16","geen Ev1 binnen 2 beurten na A (A: B1 V8+V6 netjes, Ev1 pas later)",[["G3"],["O1"],["V4"],["N1"],...wissel("V8",[V6V8]),...sickday(),["Ev1",null,null,st=>gd(st,"A")!==null&&st.dag>=gd(st,"A")+2],O2,EV2],{tot:7});
f("I16","geenVerbetering48 zonder Ev3 (A: stop V4, Ev1)",[["G3"],["O1"],["V4"],["N1"],["B2","V4",null,W.A],evA,...sickday(),O2,EV2]);
module.exports={F,f,sd,wissel,V6V8,ev3,preX};

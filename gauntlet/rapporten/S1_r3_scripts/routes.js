const {C,E}=require('./seam.js');
function speel(e,stappen,label){
  const st=E.nieuwSpel(C,e,{rng:()=>0.1});let uit=[];
  for(const s of stappen){
    if(s==='|'){E.volgendeDag(st);continue;}
    const [k,doel,optie]=s.split(':');
    if(st.actiesOver<1)E.volgendeDag(st);
    const r=E.speelKaart(st,k,{doel:doel||null,optie:optie||null});
    uit.push((r.ok?'ok ':'NEE ')+s+(r.ok?'':' -> '+r.fout));
  }
  const bad=uit.filter(x=>x.startsWith('NEE'));
  console.log((bad.length?'ROOD ':'GROEN ')+label+(bad.length?'\n   '+bad.join('\n   '):''));
}
speel('E1',['N1','V1','Ev1'],'E1 afwachten');
speel('E1',['V2','V4','N1','N2:V4','Ev1'],'E1 uitgesteld recept (V2 + middel)');
speel('E1',['V2','N1','N2:V2','Ev1'],'E1 uitgesteld recept zonder middel, N2 op V2');
speel('E1',['V2','N1','N2','Ev1'],'E1 uitgesteld recept zonder middel, N2 zonder doel');
speel('E1',['V3','N1','N2:V3','Ev1'],'E1 nitrofurantoine');
speel('E1',['V4','N1','N2:V4'],'E1 fosfomycine');
speel('E1',['V5','N1'],'E1 trimethoprim');
speel('E2',['G2','O1','V4','N1','N2:V4'],'E2 fosfomycine');
speel('E2',['G2','O1','V5','O2','V6:V5:halveren','N1','|','|','B1:V4'],'E2 trimethoprim 7d + B1 naar fosfomycine');
speel('E2',['V5','V6:V5:halveren','V6:lisinopril:halveren'],'E2 V6 op lisinopril (afleider?)');
speel('E3',['G3','O1','V4','N1','N2:V4'],'E3 cystitis fosfomycine');
speel('E3',['O2','Ev2:lisinopril','Ev2:spironolacton'],'E3 I9 route');
speel('E3',['V4','|','O1','B1:V8','V6:V8:875/125 mg 2 dd','Ev1'],'E3 na A amox/clav');
speel('E3',['V4','O1','B1:V7','B4:V7','Ev1'],'E3 na A cipro+B4');
speel('E3',['V4','O1','B1:V7','B3:calcium','Ev1'],'E3 na A cipro+B3 calcium');
speel('E3',['V4','O1','B1:V7','B3:calcium','V6:V7:geen aanpassing','|','B1:V8','V6:V8:875/125 mg 2 dd'],'E3 cipro daarna de-escalatie na C');
speel('E3',['V4','B3:spironolacton','V6:lisinopril:halveren','N3','Ev1','Ev2:spironolacton','B5:spironolacton'],'E3 sick day + Ev2 + B5');
speel('E3',['V4','B3:spironolacton','B5:spironolacton'],'E3 B5 zonder Ev2 (mag speelbaar zijn: poort schendt)');
speel('E3',['V4','B5:spironolacton'],'E3 B5 op niet-gepauzeerd (moet NEE)');
speel('E3',['V4','B2:V4','V8','B1:V8'],'E3 B1 doel is al actief (moet NEE)');
speel('E3',['V4','B4:V7'],'E3 B4 zonder V7 (moet NEE)');
speel('E3',['V4','V7','B1:V4'],'E3 B1 naar V4 terwijl V4 actief? (V7 vervangt niets; beide actief)');
speel('E3',['V4','B3:spironolacton','V6:spironolacton:halveren'],'V6 op spironolacton (moet NEE)');
speel('E3',['Ev3'],'E3 Ev3');
speel('E1',['N2:V4'],'E1 N2 zonder gestart middel (moet NEE)');
speel('E3',['V9','V9'],'E3 V9 dubbel');
speel('E3',['V4','B3:calcium','B3:calcium'],'E3 B3 dubbel op calcium (2e moet NEE)');

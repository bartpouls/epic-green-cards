// synthetische casus-generator (willekeurige namen; contractvorm)
module.exports=function gen(r){
  const ri=(a,b)=>a+Math.floor(r()*(b-a+1)), pick=a=>a[Math.floor(r()*a.length)];
  const nm=(p)=>p+Math.floor(r()*1e6).toString(36);
  const nA=ri(2,4); const ab=[];for(let i=0;i<nA;i++)ab.push(nm("mid"));
  const info=[nm("inf"),nm("inf"),nm("inf")]; const wis=nm("wis"),stop=nm("stp"),pau=nm("pau"),her=nm("her");
  const toest=[nm("toe"),nm("toe"),nm("toe")];
  const kaarten=[];
  ab.forEach(id=>kaarten.push({id,categorie:"x",label:id}));
  const vereistAltijd={p:"waarheid",waarde:true};
  const doelen=(ids)=>ids.map(i=>({id:i,label:i,vereist:r()<0.5?vereistAltijd:{p:"niet",arg:{p:"actief",middel:i}}}));
  const E1="E1";
  kaarten.push({id:wis,categorie:"x",label:wis,doelkaart:true,doelen:{[E1]:doelen(ab)}});
  kaarten.push({id:stop,categorie:"x",label:stop,doelkaart:true,doelen:{[E1]:ab.map(i=>({id:i,label:i,vereist:{p:"actief",middel:i}}))}});
  kaarten.push({id:pau,categorie:"x",label:pau,doelkaart:true,doelen:{[E1]:[{id:"com",label:"com"}]}});
  kaarten.push({id:her,categorie:"x",label:her,doelkaart:true,doelen:{[E1]:[{id:"com",label:"com"}]}});
  info.forEach(i=>kaarten.push({id:i,categorie:"y",label:i}));
  const anders={id:nm("opt"),categorie:"z",label:"opt",doelkaart:true,doelen:{[E1]:[{id:"d1",label:"d1"},{id:"d2",label:"d2"}]},opties:{d1:[{tekst:"a"},{tekst:"b"}],d2:[{tekst:"c"}]}};
  kaarten.push(anders);
  const rep=kaarten.map(k=>k.id).filter(()=>true);
  const nGeb=ri(1,4), geb=[], groep=r()<0.6?nm("grp"):null; let inGroep=0;
  const ids=[];
  for(let i=0;i<nGeb;i++){ const id=nm("geb"); ids.push(id);
    const tt=r(); let trigger;
    if(tt<0.5)trigger={type:"naKaart",n:ri(1,7)}; else if(tt<0.75)trigger={type:"naKaartVanKaart",kaart:pick(info.concat(ab)),n:ri(1,4)}; else trigger={type:"naAantalKaarten",n:ri(1,7)};
    if(r()<0.3)trigger.alleenAlsGespeeld=pick(info);
    const g={id,trigger,tekst:"t"}; if(groep&&inGroep<3&&r()<0.7){g.groep=groep;inGroep++}
    if(r()<0.6)g.toestand=r()<0.8?pick(toest):[pick(toest),pick(toest)];
    if(r()<0.5){g.zet={}; if(r()<0.5)g.zet.statusNaBeurten=ri(1,3); if(r()<0.5)g.zet.resistent=[pick(ab)]; if(r()<0.5)g.zet.gevoelig=[pick(ab)]}
    geb.push(g)}
  const werk={};
  const keys=toest.slice(0,ri(1,3)); const start=[keys[0]].concat(r()<0.3&&keys[1]?[keys[1]]:[]);
  keys.forEach(k=>{ const w=ab.filter(()=>r()<0.5).map(kaart=>{const o={kaart}; if(r()<0.3)o.als=pick([{p:"gespeeld",kaart:pick(info)},{p:"nietGespeeld",kaart:pick(info)},{p:"gespeeld",K:{kaart:pick(info)}}]);return o}); werk[k]={werkzaam:w,nietWerkzaam:[]}});
  const ep={id:E1,level:1,knoppen:{actiesPerBeurt:ri(1,4),aantalDagen:ri(3,8),raadplegenKost:ri(0,2)},startToestanden:start,antibiotica:ab,
    patient:{zichtbaar:{kop:"k"},waar:{x:1},medicatie:[{id:"com",label:"com"}],verborgen:[{kaart:info[0],onthult:"geheim",sleutel:"x",waarde:7},{kaart:info[1],onthult:"nog iets"}]},
    repertoire:rep,gebeurtenissen:geb,werkzaamheid:werk,statusTeksten:{af:"AF",aan:"AAN",geenVerbetering48:r()<0.5?"48":null},
    invarianten:[],score:{duurzaamheid:{start:3,regels:[]},doelmatigheid:{start:3,regels:[]}},profielen:[],feedbackExtra:[],zichtbaarAlsOntbreekt:[]};
  if(r()<0.5)ep.statusTeksten.TODO_BART="n";
  return{id:nm("casus"),versie:"0",rollen:{wissel:wis,stop:stop,pauzeer:pau,hervat:her},kaarten,todoBart:[],raadplegen:{titel:"t",bronnen:["b"]},episodes:[ep]};
};

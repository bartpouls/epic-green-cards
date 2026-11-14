const {maak}=require("./mini.js");
const M=maak(); 
const C=(k,d,o)=>[k,d,o];
// Dag-indeling: 3 acties per dag. Banner A/B verschijnt de dag NA de 4e resp. 7e kaart.
const R={};
R.fosfomycine=[C("G3"),C("O1"),C("V4"),"D",C("N1"),C("O2"),C("Ev2","spironolacton"),"D","D","D","D","D","D"];
// weefselinvasie amox/clav + V6: A na kaart 4 (volgorde AB) of na kaart 7 (BA)
R.amoxclav=[C("G3"),C("O1"),C("V4"),"D",C("N1"),C("O2"),C("Ev2","spironolacton"),"D",C("O1"),C("B1","V8"),C("V6","V8","875/125 mg 2 dd"),"D",C("Ev1"),"D","D","D"];

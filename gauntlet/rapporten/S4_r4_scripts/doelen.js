const L=require("./load.js");const sb=L.laad();const c=sb.CASUSSEN[0];
c.kaarten.filter(k=>k.doelen||k.opties).forEach(k=>{console.log(k.id,JSON.stringify(k.doelen&&k.doelen.E3),k.opties?JSON.stringify(k.opties):"");});

exports.plat=function(o){
  (function w(x){
    if(Array.isArray(x)){x.forEach(w);return;}
    if(!x||typeof x!=="object")return;
    Object.keys(x).forEach(k=>w(x[k]));
    if(["gespeeld","nietGespeeld","binnenBeurten","opDagRelatief"].includes(x.p)&&x.K&&typeof x.K==="object"){
      const K=x.K;delete x.K;Object.keys(K).forEach(k=>{ x[k]=K[k]; });
    }
  })(o);
  return o;
};

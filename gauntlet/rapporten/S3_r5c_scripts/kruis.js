// Kruiscontrole eigen orakel vs echte Evaluatie.beoordeel (S6, in ontwikkeling) op E2-routes. Alleen ter info voor de naden.
const O=require('./oracle.js'); const {sb,oracle,randomRoute,tl}=O; const N=+process.argv[2]||5000;
if(!sb.Evaluatie){ console.log('Evaluatie niet geladen'); process.exit(0); }
let bad=0,tot=0; const ex=[];
for(let i=0;i<N;i++){ const st=randomRoute(i%3===0?1:0); const a=oracle(st); let u; try{ u=sb.Evaluatie.beoordeel(sb.CASUSSEN[0],'E2',st); }catch(e){ bad++; if(ex.length<5) ex.push('FOUT '+e.message+' :: '+tl(st)); continue; }
  tot++; const ids=(u.geschonden||[]).map(x=>x.id);
  const verw={ids:a.ids, vraag:a.vraag};
  const gehaald=a.ids.length===0;
  const mism=[]; if(JSON.stringify(ids)!==JSON.stringify(a.ids)) mism.push('ids '+ids+' vs '+a.ids);
  if(u.vraag!==a.vraag) mism.push('vraag');
  if(!!u.poortGehaald!==gehaald) mism.push('poort');
  if(gehaald){ if(!u.score||u.score.duurzaamheid!==a.dur||u.score.doelmatigheid!==a.doelm) mism.push('score '+JSON.stringify(u.score)+' vs '+a.dur+'/'+a.doelm); if((u.profiel?u.profiel.naam:null)!==a.prof) mism.push('profiel '+(u.profiel&&u.profiel.naam)+' vs '+a.prof);
    const ev=(u.extraVragen||[]).length; const verwEv=(a.verouderd?1:0)+(a.onnodig?1:0); if(ev!==verwEv) mism.push('extraVragen '+ev+' vs '+verwEv); }
  else { if(u.score!==null) mism.push('score niet null bij schending'); }
  const zv=(u.zichtbaar||[]).length; if(zv!==a.zicht.length) mism.push('zichtbaar '+zv+' vs '+a.zicht.length);
  if(mism.length){ bad++; if(ex.length<8) ex.push(mism.join('; ')+' :: '+tl(st)); } }
console.log(JSON.stringify({N,beoordeeld:tot,afwijkend:bad})); ex.forEach(x=>console.log(x));

const fs=require('fs'),path=require('path');const {load}=require('./load.js');
const root=process.argv[2]; const O=(sb,s)=>require('./orac_mod.js')(sb,s);
const muts=[
 ['pred','B1 zet doel niet actief','act[r.doel] = true; }\n      } else if (r.kaart === rl.stop)','/*x*/ }\n      } else if (r.kaart === rl.stop)'],
 ['pred','B1 wist andere antibiotica niet',"ab().forEach(function (x) { delete act[x]; }); act[r.doel] = true;","act[r.doel] = true;"],
 ['pred','B2 stopt niet',"if (r.doel !== null) delete act[r.doel];","/*x*/"],
 ['pred','simuleer: V-kaart start niet',"act[r.kaart] = true;\n      }\n      maxAb","/*x*/;\n      }\n      maxAb"],
 ['pred','maxAb alleen eindstand',"maxAb = Math.max(maxAb, tel());","maxAb = tel();"],
 ['pred','voor: <= i.p.v. <',"return a !== null && b !== null && a.volg < b.volg;","return a !== null && b !== null && a.volg <= b.volg;"],
 ['pred','na: >= i.p.v. >',"return a !== null && b !== null && a.volg > b.volg;","return a !== null && b !== null && a.volg >= b.volg;"],
 ['pred','voor: null->true',"return a !== null && b !== null && a.volg < b.volg;","return (a !== null && b !== null && a.volg < b.volg) || (a!==null && b===null);"],
 ['pred','opDagRelatief: anker laatste i.p.v. eerste',"var a = eerste(ctx, A);\n      if (a === null) return false;\n      return alle(ctx, K).some(function (r) { var v = r.dag - a.dag;","var a = alle(ctx, A).slice(-1)[0] || null;\n      if (a === null) return false;\n      return alle(ctx, K).some(function (r) { var v = r.dag - a.dag;"],
 ['pred','opDagRelatief: tot exclusief',"return v >= p.van && v <= tot; });","return v >= p.van && v < tot; });"],
 ['pred','opDagRelatief: van exclusief',"return v >= p.van && v <= tot; });","return v > p.van && v <= tot; });"],
 ['pred','gestart: B1 telt niet',"var isStart = mids.indexOf(regel.kaart) >= 0 || (regel.kaart === rl.wissel && mids.indexOf(regel.doel) >= 0);","var isStart = mids.indexOf(regel.kaart) >= 0;"],
 ['pred','gestart: B1 elk doel',"(regel.kaart === rl.wissel && mids.indexOf(regel.doel) >= 0)","(regel.kaart === rl.wissel)"],
 ['pred','matcht: doel genegeerd',"if (K.doel !== undefined && regel.doel !== K.doel) return false;","/*x*/"],
 ['pred','matcht: optie genegeerd',"if (K.optie !== undefined && regel.optie !== K.optie) return false;","/*x*/"],
 ['pred','benoemdeSet: gebeurtenis zet niet',"if (heeft(def.zet, naam)) lijst(def.zet[naam]).forEach(function (x) { uit[x] = true; });","/*x*/"],
 ['pred','actief moment: offset genegeerd',"return { maxDag: d + (op.offset === undefined ? 0 : op.offset) };","return { maxDag: d };"],
 ['pred','actief moment: offset+1',"return { maxDag: d + (op.offset === undefined ? 0 : op.offset) };","return { maxDag: d + 1 + (op.offset === undefined ? 0 : op.offset) };"],
 ['pred','klachten ooit: eerste klacht alleen',"if (p.op === undefined) return lijst(ctx.klachten).some(function (k) { return k && k.status === p.waarde; });","if (p.op === undefined) return lijst(ctx.klachten).slice(-1).some(function (k) { return k && k.status === p.waarde; });"],
 ['pred','waar: == als !=',"if (op === \"==\" || op === \"=\") return a === b;","if (op === \"==\" || op === \"=\") return a !== b;"],
 ['pred','tel: terwijlKlachten genegeerd',"if (t.terwijlKlachten === undefined || ctx.status(r.dag) === t.terwijlKlachten) n++;","n++;"],
 ['pred','gebeurtenisGeweest: altijd true',"gebeurtenisGeweest: function (p, ctx) { return gebDag(ctx, p.id) !== null; },","gebeurtenisGeweest: function (p, ctx) { return true; },"],
 ['eng','C-trigger n+1',"if (t.type === \"naKaart\" || t.type === \"naAantalKaarten\") return volg === t.n;","if (t.type === \"naKaart\" || t.type === \"naAantalKaarten\") return volg === t.n + 1;"],
 ['eng','alleenAlsGespeeld genegeerd',"if (t.alleenAlsGespeeld && eersteVolg(state, t.alleenAlsGespeeld) == null) return false;","/*x*/"],
 ['eng','klachten: werkzaam altijd waar',"werkzaam = actief.some(function (k) {","werkzaam = true; actief.some(function (k) {"],
 ['eng','gebeurtenis dag = oude dag',"state.gebeurtenissen.push({ id: w.id, dag: nieuweDag, naVolg: w.naVolg });","state.gebeurtenissen.push({ id: w.id, dag: nieuweDag-1, naVolg: w.naVolg });"],
 ['eng','onthul: zichtbaar patch genegeerd',"if (v.zichtbaar && typeof v.zichtbaar === \"object\") meng(state.zichtbaar, v.zichtbaar);","/*x*/"],
 ['eng','onthul: zetPad genegeerd',"if (v.sleutel && waarde !== undefined) zetPad(state.zichtbaar, v.sleutel, kopie(waarde));","/*x*/"],
 ['eng','vereist genegeerd',"if (d && d.vereist && !P().evalueer(d.vereist, ctxVan(state)))","if (false)"],
 ['eng','repertoire niet gecontroleerd',"if (!bevat(ep.repertoire || [], kaartId)) return fout(","if (false) return fout("],
 ['eng','actiesbudget genegeerd',"if (state.actiesOver < 1) return fout(","if (false) return fout("],
 ['eng','sets: resistent niet gevuld',"lijstVan(e.zet.resistent).forEach(function (m) { if (!bevat(state.sets.resistent, m)) state.sets.resistent.push(m); });","/*x*/"],
];
let kill=0,tot=0; const out=[];
for(const [lag,naam,oud,nw] of muts){ const f=lag==='pred'?'regels/predicaten.js':'engine/engine.js'; const src=fs.readFileSync(path.join(root,f),'utf8'); if(!src.includes(oud)){ out.push('NIET GEVONDEN '+naam); continue; }
  const dir=fs.mkdtempSync(process.env.SPDIR+'/h'); const p=path.join(dir,'x.js'); fs.writeFileSync(p,src.replace(oud,nw));
  let sb; try{ sb=load(root,{[f]:p}); }catch(e){ out.push('laadfout '+naam); continue; }
  tot++; let red=0; try{ red=sb.Test.draaiAlles('data-e2').filter(x=>!x.ok).length; }catch(e){ red=1; }
  if(red){ kill++; out.push('GEDOOD  ('+red+' rood) '+lag+': '+naam); continue; }
  let div=null; try{ const Oo=O(sb,31337); for(let i=0;i<800&&!div;i++){ const st=Oo.randomRoute(); const a=Oo.ref(st),b=Oo.dataEval(st); if(JSON.stringify(a)!==JSON.stringify(b)) div=st.tijdlijn.map(r=>`${r.dag}:${r.kaart}${r.doel?'>'+r.doel:''}${r.optie?'/'+r.optie:''}`).join(' '); } }catch(e){ div='(fout) '+e.message; }
  out.push('OVERLEEFD '+lag+': '+naam+(div?'   <-- gedrag verschilt, route: '+div:'  (oracle ziet geen verschil)')); }
console.log(kill+'/'+tot+' gedood'); out.forEach(o=>console.log(o));

const {laad}=require("./laad.js");const fs=require("fs"),crypto=require("crypto");
const sb=laad();const E=sb.Engine,c=sb.CASUSSEN[0];const rng=v=>()=>v;
const sp=(s,k,o)=>{const r=E.speelKaart(s,k,o);if(!r.ok)throw new Error(k+": "+r.fout);return r;};
const nd=s=>E.volgendeDag(s);
const ge=s=>s.gebeurtenissen.map(x=>`${x.id} (banner dag ${x.dag}, getriggerd na kaart ${x.naVolg})`).join("; ")||"geen";
const ep=id=>c.episodes.find(e=>e.id===id);
const P=[];
// 1
{const s=E.nieuwSpel(c,"E2",{rng:rng(0)});["G1","G2","O1"].forEach(k=>sp(s,k));nd(s);sp(s,"V4");nd(s);
 P.push(["Kweekuitslag E2: \"Kweekuitslag, na de 4e gespeelde kaart (ongeveer dag 3). Alleen als O1 gespeeld is.\"",
  `Kaarten G1, G2, O1 (dag 1), V4 (dag 2). Gebeurtenissen: ${ge(s)}. Resistent: ${s.sets.resistent.join(", ")}; gevoelig: ${s.sets.gevoelig.join(", ")}.`]);}
// 2
{const s=E.nieuwSpel(c,"E2",{rng:rng(0)});["G1","G2","V4"].forEach(k=>sp(s,k));nd(s);sp(s,"N1");nd(s);
 P.push(["E2 zonder O1: kweekuitslag \"Alleen als O1 gespeeld is.\" (dus zonder O1 geen kweekuitslag)",
  `Kaarten G1, G2, V4 (dag 1), N1 (dag 2), geen O1. Gebeurtenissen: ${ge(s)}. Resistent: [${s.sets.resistent}].`]);}
// 3
{const s=E.nieuwSpel(c,"E3",{rng:rng(0)});sp(s,"G3");sp(s,"G1");sp(s,"O1");nd(s);sp(s,"V4");sp(s,"N1");sp(s,"N3");nd(s);
 P.push(["E3 gebeurtenis C: \"3 kaarten na O1\" (Kweekuitslag)",
  `O1 is kaart 3 (dag 1). Gebeurtenissen: ${ge(s)}. Kaarten gespeeld: ${s.tijdlijn.map(r=>r.volg+":"+r.kaart).join(" ")}.`]);}
// 4
{const out=[0,0.99].map(w=>{const s=E.nieuwSpel(c,"E3",{rng:rng(w)});return s.volgordeAB.join("-");});
 const s0=E.nieuwSpel(c,"E3",{rng:rng(0)}),s1=E.nieuwSpel(c,"E3",{rng:rng(0.99)});
 const run=s=>{["G1","G2","G3"].forEach(k=>sp(s,k));nd(s);sp(s,"N1");sp(s,"N3");sp(s,"Ev1");nd(s);sp(s,"O2");sp(s,"G1");sp(s,"V4");nd(s);return ge(s);};
 P.push(["E3: A en B \"in vrije volgorde\", A na de 4e en B na de 7e kaart in willekeurige volgorde (bouwopdracht 6.6); C: 3 kaarten na O1.",
  `Zelfde 9 kaarten (geen O1), twee trekkingen. rng laag: volgorde ${out[0]} -> ${run(s0)}. rng hoog: volgorde ${out[1]} -> ${run(s1)}.`]);}
// 5
{const t=["E1","E2","E3"].map(id=>{const s=E.nieuwSpel(c,id,{rng:rng(0)});const a=s.actiesOver;const r=E.raadpleeg(s);return `${id}: ${a} acties, raadplegen kost ${r.kost}, daarna ${s.actiesOver}`;});
 P.push(["Bouwopdracht 6.6: acties per beurt 3 / 3 / 3; richtlijn raadplegen kost 0 / 0 / 1 actie (E1 / E2 / E3).",t.join("; ")+"."]);}
// 6
{const s=E.nieuwSpel(c,"E2",{rng:rng(0)});const voor=s.zichtbaar.lab.eGFR+" ("+s.zichtbaar.lab.datum+")";sp(s,"G1");const mid=s.zichtbaar.lab.eGFR;const r=sp(s,"G2");
 P.push(["E2: \"Lab op de kaart: laatst bekende eGFR 42, van 6 jaar geleden.\" \"Verborgen achter G2: eGFR 29 uit de jaarlijkse controle.\"",
  `Zichtbaar eGFR voor spelen: ${voor}; na G1: ${mid}; na G2: ${s.zichtbaar.lab.eGFR} (${s.zichtbaar.lab.datum}); onthuld-tekst "${r.onthuld[0].tekst}"; ware eGFR in regels: ${ep("E2").patient.waar.eGFR}.`]);}
// 7
{const s=E.nieuwSpel(c,"E1",{rng:rng(0)});const r=sp(s,"G2");
 P.push(["E1 Patiëntkaart: \"Verborgen: niets.\" (G2 toont: E1: eGFR 42, recent.)",`G2 gespeeld in E1: ${r.onthuld.length} onthullingen; zichtbaar eGFR ${s.zichtbaar.lab.eGFR}.`]);}
// 8
{const m=(id,k,extra)=>{const s=E.nieuwSpel(c,id,{rng:rng(0)});(extra||[]).forEach(x=>sp(s,x));sp(s,k);nd(s);return s.klachten[2].tekst;};
 P.push(["E2 \"Wat de patiënt laat zien, hangt af van de keuze: Trimethoprim: klachten houden aan. Fosfomycine: klachten nemen af.\"",
  `Na één dag trimethoprim (V5): "${m("E2","V5")}". Na één dag fosfomycine (V4): "${m("E2","V4")}".`]);}
// 9
{const s=E.nieuwSpel(c,"E3",{rng:rng(0)});["G3","O1","V4"].forEach(k=>sp(s,k));nd(s);sp(s,"N1");nd(s);nd(s);nd(s);
 P.push(["Bouwopdracht 6.3: Status \"geen verbetering na 48 uur\": na A is binnen 2 beurten geen werkzaam antibioticum actief. (E3 weefselinvasie: V4 niet werkzaam)",
  `Fosfomycine (V4) op dag 1, A-banner dag ${s.gebeurtenissen.find(x=>x.id==="A").dag}. Status per dag: ${[2,3,4,5].map(d=>d+"="+s.klachten[d].status).join(", ")}; tekst dag 5: "${s.klachten[5].tekst}".`]);}
// 10
{const rec=(e,g)=>({casusId:c.id,episodeId:e,geschonden:g});
 P.push(["Bouwopdracht 1: \"Een episode gaat pas open als de vorige is gehaald.\" (poort gehaald = geen schending)",
  `Zonder pogingen: ${E.ontgrendeldeEpisodes(c,[]).join(",")} open. E1 met schending I1: ${E.ontgrendeldeEpisodes(c,[rec("E1",["I1"])]).join(",")} open. E1 gehaald: ${E.ontgrendeldeEpisodes(c,[rec("E1",[])]).join(",")} open. E1 en E2 gehaald: ${E.ontgrendeldeEpisodes(c,[rec("E1",[]),rec("E2",[])]).join(",")} open.`]);}
// 11
{const s=E.nieuwSpel(c,"E2",{rng:rng(0)});sp(s,"G2");sp(s,"V4");nd(s);E.rondAf(s);const h=E.herkansing(s);
 P.push(["Casus 7: bij een schending \"volgt een herkansing\"; bouwopdracht 4.1: knop \"Opnieuw\" start de episode opnieuw.",
  `Na afronden: afgerond=${s.afgerond}, ${s.tijdlijn.length} kaarten, dag ${s.dag}. Herkansing: episode ${h.episodeId}, dag ${h.dag}, ${h.tijdlijn.length} kaarten, afgerond=${h.afgerond}, zichtbaar eGFR ${h.zichtbaar.lab.eGFR}, onthuld ${h.onthuld.length}.`]);}
// 12
{const t=["E1","E2","E3"].map(id=>{const s=E.nieuwSpel(c,id,{rng:rng(0)});let n=0;while(!E.eindeBereikt(s)){nd(s);n++;}return `${id}: ${n} keer volgende dag, dag ${s.dag}, einde=${E.eindeBereikt(s)}`;});
 P.push(["Bouwopdracht 6.6: Aantal dagen 5 / 7 / 7; \"de laatste dag is voorbij\" sluit de episode.",t.join("; ")+"."]);}
// 13
{const s=E.nieuwSpel(c,"E3",{rng:rng(0)});const r=E.raadpleeg(s);
 P.push(["Casus 7: \"Richtlijn raadplegen: een eigen naslagkaart met verwijzing naar de bronnen, niet de NHG-tekst zelf.\"",
  `Raadplegen geeft titel "${r.titel}" en bronnen ${r.bronnen.join(", ")}; staat op de tijdlijn: ${s.tijdlijn.length} kaarten; raadplegingen: ${s.raadplegingen.length}.`]);}
// 14
{const s=E.nieuwSpel(c,"E2",{rng:rng(0)});sp(s,"G2");sp(s,"V5");sp(s,"O1");nd(s);sp(s,"N1");nd(s);
 P.push(["E2 gebeurtenis C: kweekuitslag na de 4e gespeelde kaart, alleen als O1 gespeeld is; de speler moet na de uitslag bijsturen (B1) of stoppen (B2).",
  `Kaarten G2, V5, O1 (dag 1), N1 (dag 2) = 4 kaarten. Gebeurtenissen: ${ge(s)}. Status dag 3: ${s.klachten[3].status} ("${s.klachten[3].tekst}").`]);}
// willekeurige X/Y
const sleutel=[];const uit=P.map((p,i)=>{const b=crypto.randomInt(2)===0;sleutel.push({paar:i+1,X:b?"bron":"spel",Y:b?"spel":"bron"});return {i:i+1,X:b?p[0]:p[1],Y:b?p[1]:p[0]};});
fs.writeFileSync(__dirname+"/../S7_r3.sleutel.json",JSON.stringify(sleutel,null,1));
uit.forEach(u=>console.log(`PAAR ${u.i}\n  X: ${u.X}\n  Y: ${u.Y}\n`));

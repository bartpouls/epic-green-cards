require("./load.js");
const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
function woorden(skip){const w={};function loop(o,pad){if(typeof o==="string")(o.match(/\p{L}{4,}/gu)||[]).forEach(x=>{const n=norm(x);(w[n]=w[n]||new Set()).add(pad)});else if(Array.isArray(o))o.forEach((x,i)=>loop(x,pad));else if(o&&typeof o==="object")for(const k in o){if(skip&&(k==="referentie"||k==="todoBart"||k.indexOf("TODO_BART")===0))continue;loop(o[k],pad+"."+k)}}CASUSSEN.forEach(loop.bind(null));return w}
// simpler
const volledig={},gefilterd={};
function walk(o,skip,acc,pad){if(typeof o==="string")(o.match(/\p{L}{4,}/gu)||[]).forEach(x=>{const n=norm(x);(acc[n]=acc[n]||[]).push(pad)});else if(Array.isArray(o))o.forEach(x=>walk(x,skip,acc,pad));else if(o&&typeof o==="object")for(const k in o){if(skip&&(k==="referentie"||k==="todoBart"||k.indexOf("TODO_BART")===0))continue;walk(o[k],skip,acc,pad+"."+k)}}
CASUSSEN.forEach(c=>{walk(c,false,volledig,"");walk(c,true,gefilterd,"")});
console.log(Object.keys(volledig).length,Object.keys(gefilterd).length);
const verloren=Object.keys(volledig).filter(w=>!gefilterd[w]);
console.log(verloren.length);
for(const w of verloren.sort())console.log(w,"|",[...new Set(volledig[w])].slice(0,2).join(","));

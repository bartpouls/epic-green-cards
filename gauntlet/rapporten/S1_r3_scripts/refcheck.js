const fs=require('fs');const root='/home/user/epic-green-cards';
const t=fs.readFileSync(root+'/tests/data-kaarten.tests.js','utf8');const md=fs.readFileSync(root+'/casus-uwi.md','utf8');const bo=fs.readFileSync(root+'/bouwopdracht-uwi.md','utf8');
let n=0,bad=0;
for(const m of t.matchAll(/^    "(\| (?:G|O|V|B|N|Ev)\d+ \|.*\|)"[,]?$/gm)){const regel=JSON.parse('"'+m[1]+'"');n++;if(!md.includes(regel)){bad++;console.log('NIET IN CASUS:',regel.slice(0,60));}}
for(const m of t.matchAll(/^    "(\| (?:Trimethoprim|Amoxicilline\/clavulaanzuur|Ciprofloxacine|Lisinopril) .*\|)"[,]?$/gm)){const regel=JSON.parse('"'+m[1]+'"');n++;if(!bo.includes(regel)){bad++;console.log('NIET IN BOUWOPDRACHT:',regel.slice(0,60));}}
const kop=JSON.parse(t.match(/var REF_KOP = (".*");/)[1]);n++;if(!md.includes(kop)){bad++;console.log('KOP niet in casus');}
console.log('referentieregels in test',n,'niet letterlijk in bron',bad);

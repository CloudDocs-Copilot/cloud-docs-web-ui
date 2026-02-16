const fs = require('fs');
const path = require('path');
const covPath = path.join(process.cwd(),'coverage','coverage-final.json');
if(!fs.existsSync(covPath)){ console.error('coverage-final.json not found'); process.exit(2); }
const cov = JSON.parse(fs.readFileSync(covPath,'utf8'));
const results = [];
for(const absPath in cov){
  const rel = path.relative(process.cwd(), absPath).replace(/\\/g,'/');
  const file = cov[absPath];
  const f = file.f || {};
  const b = file.b || {};
  const totalF = Object.keys(f).length;
  const coveredF = Object.values(f).filter(v=>v>0).length;
  let totalB = 0, coveredB = 0;
  for(const k in b){ totalB += b[k].length; coveredB += b[k].filter(v=>v>0).length; }
  const fPct = totalF? (coveredF/totalF*100) : 100;
  const bPct = totalB? (coveredB/totalB*100) : 100;
  if(fPct < 15 || bPct < 15){ results.push({file: rel, funcs: +fPct.toFixed(1), branches: +bPct.toFixed(1)}); }
}
if(results.length === 0){ console.log('No files with funcs or branches <15%'); process.exit(0); }
results.sort((a,b)=> (a.branches + a.funcs) - (b.branches + b.funcs));
for(const r of results){ console.log(`${r.file} | funcs: ${r.funcs}% | branches: ${r.branches}%`); }

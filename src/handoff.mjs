import {makeProject,parseProject,jsonReport,markdownReport} from './files.mjs';import {roundCards} from './cards.mjs';
const $=id=>document.getElementById(id);
export function installHandoff({getCurrent,generate,selectedRound}){
 let urls=[],revision=0,request=0;
 function release(){for(const value of urls)URL.revokeObjectURL(value);urls=[];}
 function url(text,type){const value=URL.createObjectURL(new Blob([text],{type}));urls.push(value);return value;}
 document.addEventListener('mixcircle:clear',()=>{revision++;release();});
 function refresh(){
  const report=getCurrent();if(!report)return;release();$('downloads').replaceChildren();const round=selectedRound();
  for(const [label,name,text,type]of [['JSON report','mixcircle-report.json',jsonReport(report),'application/json'],['Markdown brief','mixcircle.md',markdownReport(report),'text/markdown'],['Round '+round+' SVG','mixcircle-round-'+round+'.svg',roundCards(report,round),'image/svg+xml']]){
   const a=document.createElement('a');a.textContent=label;a.download=name;a.href=url(text,type);$('downloads').append(a);}
  $('save-project').disabled=false;
 }
 document.addEventListener('mixcircle:ready',refresh);document.addEventListener('mixcircle:round',refresh);
 $('save-project').addEventListener('click',()=>{const report=getCurrent();if(!report)return;const a=document.createElement('a');a.download='mixcircle-project.json';a.href=url(JSON.stringify(makeProject(report.config),null,2)+'\n','application/json');document.body.append(a);a.click();a.remove();$('file-status').textContent='Project download requested. It includes all participant labels and mix settings.';});
 $('open-project').addEventListener('change',async()=>{const file=$('open-project').files?.[0];if(!file)return;const version=revision,token=++request;
  try{if(file.size>40000)throw new Error('Use a project file up to 40,000 bytes.');let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());}catch{throw new Error('Could not decode this project as UTF-8. Current work was preserved.');}
   const project=parseProject(text);
   if(version!==revision||token!==request)throw new Error('Setup changed while loading. Current work was preserved; open again to replace it.');
   for(const id of ['title','groups','rounds','seed'])$(id).value=project.config[id];$('roster').value=project.config.participants.join('\n');$('search').value='';$('pair-filter').value='repeated';generate();$('file-status').textContent='Project reopened. The same algorithm and settings regenerate its rounds.';
  }catch(error){$('file-status').textContent=error.message;}finally{$('open-project').value='';}
 });
 globalThis.addEventListener('pagehide',release);
}

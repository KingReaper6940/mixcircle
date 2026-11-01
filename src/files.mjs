import {validateConfig} from './input.mjs';import {ALGORITHM} from './mixer.mjs';
export function makeProject(config){return {schema:'mixcircle-project-v1',algorithm:ALGORITHM,config:validateConfig(config)};}
export function parseProject(text){
 if(typeof text!=='string'||text.length>12000)throw new Error('Project JSON must be at most 12,000 text units.');
 let value;try{value=JSON.parse(text);}catch{throw new Error('Could not read project JSON. Current work was preserved.');}
 if(!value||value.schema!=='mixcircle-project-v1'||value.algorithm!==ALGORITHM||Object.keys(value).some(key=>!['schema','algorithm','config'].includes(key)))throw new Error('Expected a Mixcircle v1 project for '+ALGORITHM+'.');
 return makeProject(value.config);
}
export const jsonReport=report=>JSON.stringify(report,null,2)+'\n';
function fence(text){let size=2;for(const match of text.matchAll(/`+/g))size=Math.max(size,match[0].length);const mark='`'.repeat(size+1);return mark+'text\n'+text+'\n'+mark;}
export function markdownReport(report){
 const names=new Map(report.people.map(p=>[p.id,p.name])),out=['# Mixcircle','',report.scope,'',fence('Session: '+report.config.title+'\nAlgorithm: '+report.algorithm+'\nMix key: '+report.config.seed+'\nParticipants: '+report.people.length+'\nGroups per round: '+report.config.groups+'\nRounds: '+report.config.rounds),'',
  'Distinct pairs met: '+report.audit.metPairs+' / '+report.audit.possiblePairs+'. Repeat pair meetings: '+report.audit.repeatMeetings+'. Repeated pairs: '+report.audit.repeatedPairs+'. Solo placements: '+report.audit.singletonPlacements+'.',''];
 for(const round of report.rounds){out.push('## Round '+round.number,'');for(const group of round.groups)out.push(fence(group.id+'\n'+group.members.map(id=>id+' · '+names.get(id)).join('\n')),'');}
 out.push('## Per-person exposure','',fence(report.audit.people.map(p=>p.id+' · '+p.name+' | distinct partners '+p.uniquePartners+' | meeting slots '+p.meetingSlots+' | repeat slots '+p.repeatSlots).join('\n')),'','## All possible pairs','',fence(report.audit.pairRows.map(p=>p.a+' + '+p.b+' | meetings '+p.meetings+' | rounds '+(p.rounds.join(',')||'none')).join('\n')),'');
 return out.join('\n');
}

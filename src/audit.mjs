import {validateConfig} from './input.mjs';import {ALGORITHM} from './mixer.mjs';
export function auditMix(mix){
 const config=validateConfig(mix.config),n=config.participants.length,ids=config.participants.map((_,i)=>'P'+String(i+1).padStart(2,'0')),known=new Set(ids);
 if(mix.algorithm!==ALGORITHM||!Array.isArray(mix.people)||mix.people.length!==n||mix.people.some((p,i)=>p.id!==ids[i]||p.name!==config.participants[i]))throw new Error('Mix participant/version records do not match configuration.');
 if(!Array.isArray(mix.rounds)||mix.rounds.length!==config.rounds)throw new Error('Round count does not match configuration.');
 const pairs=new Map();for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)pairs.set(ids[i]+'|'+ids[j],{a:ids[i],b:ids[j],meetings:0,rounds:[]});
 const roundStats=[];
 for(let i=0;i<mix.rounds.length;i++){
  const round=mix.rounds[i];if(round.number!==i+1||!Array.isArray(round.groups)||round.groups.length!==config.groups)throw new Error('Round/group structure mismatch.');
  for(let g=0;g<round.groups.length;g++)if(round.groups[g].id!=='G'+(g+1)||!Array.isArray(round.groups[g].members)||!round.groups[g].members.length)throw new Error('Every configured group must be present and nonempty.');
  const members=round.groups.flatMap(g=>g.members),sizes=round.groups.map(g=>g.members.length);
  if(members.length!==n||new Set(members).size!==n||members.some(id=>!known.has(id))||Math.max(...sizes)-Math.min(...sizes)>1)throw new Error('Each participant must appear once per round in balanced groups.');
  let newPairs=0,repeatMeetings=0;
  for(const group of round.groups)for(let a=0;a<group.members.length;a++)for(let b=a+1;b<group.members.length;b++){
   const ids=[group.members[a],group.members[b]].sort(),pair=pairs.get(ids.join('|'));if(pair.meetings)repeatMeetings++;else newPairs++;pair.meetings++;pair.rounds.push(round.number);
  }
  roundStats.push({round:round.number,newPairs,repeatMeetings,singletons:sizes.filter(size=>size===1).length});
 }
 const pairRows=[...pairs.values()],people=mix.people.map(person=>{const observed=pairRows.filter(pair=>pair.a===person.id||pair.b===person.id);return {...person,uniquePartners:observed.filter(pair=>pair.meetings>0).length,meetingSlots:observed.reduce((sum,pair)=>sum+pair.meetings,0),repeatSlots:observed.reduce((sum,pair)=>sum+Math.max(0,pair.meetings-1),0)};});
 const totalMeetings=pairRows.reduce((sum,pair)=>sum+pair.meetings,0),metPairs=pairRows.filter(pair=>pair.meetings>0).length;
 return {possiblePairs:pairRows.length,metPairs,totalMeetings,repeatedPairs:pairRows.filter(pair=>pair.meetings>1).length,repeatMeetings:totalMeetings-metPairs,pairCountLowerBound:Math.max(0,totalMeetings-pairRows.length),singletonPlacements:roundStats.reduce((sum,r)=>sum+r.singletons,0),people,pairRows,roundStats};
}
export function makeReport(mix){return {schema:'mixcircle-report-v1',...mix,audit:auditMix(mix)};}

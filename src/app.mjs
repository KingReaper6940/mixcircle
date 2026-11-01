import {installHandoff} from './handoff.mjs';
import {parseRoster,validateConfig} from './input.mjs';import {makeMix} from './mixer.mjs';import {makeReport} from './audit.mjs';import {EXAMPLE} from './example.mjs';
const $=id=>document.getElementById(id),node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};let current=null,page=0;
export const getCurrent=()=>current;
export function clear(){document.dispatchEvent(new CustomEvent('mixcircle:clear'));current=null;$('results').hidden=true;$('errors').hidden=true;$('downloads').replaceChildren();$('group-cards').replaceChildren();$('save-project').disabled=true;$('status').textContent='Setup changed. Make the rounds again to refresh results.';}
export function selectedRound(){return Number($('round').value)||1;}
export function renderRound(){
 if(!current)return;const round=current.rounds[selectedRound()-1],people=new Map(current.people.map(p=>[p.id,p.name])),stats=current.audit.roundStats[round.number-1];$('group-cards').replaceChildren();
 for(const group of round.groups){const card=node('article');card.className='group-card';const h=node('h4',group.id);h.append(node('span',group.members.length+' people'));const list=node('ul');for(const id of group.members){const li=node('li');li.append(node('code',id),node('span',people.get(id)));list.append(li);}card.append(h,list);$('group-cards').append(card);}
 $('round-summary').textContent='Round '+round.number+': '+stats.newPairs+' new pair meetings, '+stats.repeatMeetings+' repeat pair meetings, '+stats.singletons+' solo groups.';
}
export function renderPairs(){
 if(!current)return;const people=new Map(current.people.map(p=>[p.id,p.name])),query=$('search').value.trim().toLowerCase(),filter=$('pair-filter').value;
 const rows=current.audit.pairRows.filter(pair=>(filter==='all'||filter==='repeated'&&pair.meetings>1||filter==='met'&&pair.meetings>0||filter==='unmet'&&pair.meetings===0)&&(!query||[pair.a,pair.b,people.get(pair.a),people.get(pair.b)].some(value=>value.toLowerCase().includes(query))));
 const pages=Math.max(1,Math.ceil(rows.length/30));page=Math.min(page,pages-1);$('pair-rows').replaceChildren();
 for(const pair of rows.slice(page*30,page*30+30)){const tr=node('tr'),names=node('td');for(const id of [pair.a,pair.b]){const p=node('div');p.append(node('code',id),node('span',people.get(id)));names.append(p);}tr.append(names,node('td',String(pair.meetings)),node('td',pair.rounds.join(', ')||'—'));$('pair-rows').append(tr);}
 if(!rows.length){const tr=node('tr'),td=node('td','No pairs match this view. Reports still contain all possible pairs.');td.colSpan=3;tr.append(td);$('pair-rows').append(tr);}
 $('page').textContent=rows.length+' pairs · page '+(page+1)+' / '+pages;$('previous').disabled=page===0;$('next').disabled=page>=pages-1;
}
function integer(id){const value=$(id).value;if(!value.trim())throw new Error('Enter an explicit value for '+id+'.');return Number(value);}
export function generate(){
 clear();page=0;$('error-list').replaceChildren();
 try{const config=validateConfig({title:$('title').value,participants:parseRoster($('roster').value),groups:integer('groups'),rounds:integer('rounds'),seed:$('seed').value});current=makeReport(makeMix(config));
  $('results').hidden=false;$('session-title').textContent=config.title;$('setup-summary').textContent=current.people.length+' people · '+config.groups+' groups per round · '+config.rounds+' rounds · mix key '+config.seed;
  $('met-pairs').textContent=current.audit.metPairs;$('repeat-meetings').textContent=current.audit.repeatMeetings;$('repeated-pairs').textContent=current.audit.repeatedPairs;
  $('singleton-note').hidden=!current.audit.singletonPlacements;$('singleton-note').textContent=current.audit.singletonPlacements+' solo placements across all rounds. Review the group count before using this mix.';
  $('round').replaceChildren();for(let i=1;i<=config.rounds;i++){const option=node('option',String(i));option.value=i;$('round').append(option);}
  $('person-rows').replaceChildren();for(const person of current.audit.people){const tr=node('tr'),td=node('td');td.append(node('code',person.id),node('span',person.name));tr.append(td,node('td',person.uniquePartners+' / '+(current.people.length-1)),node('td',String(person.meetingSlots)),node('td',String(person.repeatSlots)));$('person-rows').append(tr);}
  $('bound').textContent=current.audit.metPairs+' of '+current.audit.possiblePairs+' possible pairs met. Simple pair-count lower bound on repeat meetings: '+current.audit.pairCountLowerBound+'. This bound alone does not prove a repeat-free design exists or that this mix is optimal.';
  $('status').textContent='Rounds ready. Pairings independently recounted; heuristic result, not an optimality claim.';renderRound();renderPairs();document.dispatchEvent(new CustomEvent('mixcircle:ready'));
 }catch(error){clear();$('errors').hidden=false;for(const message of error.issues||[error.message])$('error-list').append(node('li',message));$('status').textContent='Setup needs attention. No assignments or exports are available.';}
}
for(const id of ['title','roster','groups','rounds','seed'])$(id).addEventListener('input',clear);
$('generate').addEventListener('click',generate);
$('round').addEventListener('change',()=>{renderRound();document.dispatchEvent(new CustomEvent('mixcircle:round'));});
$('search').addEventListener('input',()=>{page=0;renderPairs();});$('pair-filter').addEventListener('change',()=>{page=0;renderPairs();});
$('previous').addEventListener('click',()=>{page--;renderPairs();});$('next').addEventListener('click',()=>{page++;renderPairs();});
$('example').addEventListener('click',()=>start());
export function start(){for(const id of ['title','groups','rounds','seed'])$(id).value=EXAMPLE[id];$('roster').value=EXAMPLE.participants.join('\n');$('search').value='';$('pair-filter').value='repeated';generate();}
installHandoff({getCurrent,generate,selectedRound});
start();

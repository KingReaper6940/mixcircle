export class InputError extends Error{constructor(issues){super(issues[0]||'Check the input.');this.issues=issues;}}
const printable=value=>typeof value==='string'&&!/[\p{Cc}\p{Cf}\p{Cs}\u2028\u2029]/u.test(value);
export function parseRoster(source){
 if(typeof source!=='string'||source.length>5000)throw new InputError(['Roster must be at most 5,000 text units.']);
 const participants=[],issues=[],seen=new Map();
 source.split(/\r\n|\n|\r/).forEach((line,i)=>{const name=line.trim();if(!name)return;if(!printable(name)||name.length>60)issues.push('Line '+(i+1)+': use a printable label up to 60 text units.');else if(seen.has(name))issues.push('Line '+(i+1)+': repeated label '+name+' (first on line '+seen.get(name)+'). Add an initial or suffix.');else{seen.set(name,i+1);participants.push(name);}});
 if(participants.length<2||participants.length>48)issues.push('Use 2–48 nonblank participant labels.');
 if(issues.length)throw new InputError(issues);return participants;
}
export function validateConfig(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new InputError(['Expected a mixer configuration.']);
 const issues=[];for(const key of Object.keys(value))if(!['title','participants','groups','rounds','seed'].includes(key))issues.push('Unknown configuration field: '+key+'.');
 if(!printable(value.title)||!value.title||value.title.length>80||value.title.trim()!==value.title)issues.push('Title must be 1–80 printable units without edge whitespace.');
 if(!Array.isArray(value.participants)||value.participants.some(n=>typeof n!=='string'||n.trim()!==n||n.includes('\n')||n.includes('\r')))issues.push('Participants must be an array of trimmed, single-line labels.');
 let participants;
 if(!issues.length){try{participants=parseRoster(value.participants.join('\n'));if(participants.length!==value.participants.length)issues.push('Blank participant labels are not allowed in a project.');}catch(error){issues.push(...error.issues);}}
 if(!Number.isInteger(value.groups)||value.groups<1||value.groups>12||value.groups>(participants?.length??48))issues.push('Groups must be an integer from 1 to 12, no more than the participant count.');
 if(!Number.isInteger(value.rounds)||value.rounds<1||value.rounds>8)issues.push('Rounds must be an integer from 1 to 8.');
 if(!printable(value.seed)||!value.seed||value.seed.length>40||value.seed.trim()!==value.seed)issues.push('Mix key must be 1–40 printable units without edge whitespace.');
 if(issues.length)throw new InputError(issues);
 return {title:value.title,participants:[...participants],groups:value.groups,rounds:value.rounds,seed:value.seed};
}

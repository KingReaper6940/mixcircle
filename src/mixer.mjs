import {validateConfig} from './input.mjs';import {randomFromSeed,shuffled} from './random.mjs';
export const ALGORITHM='mixcircle-v1';
const less=(a,b)=>a[0]<b[0]||a[0]===b[0]&&a[1]<b[1];
export function balancedSizes(count,groups){return Array.from({length:groups},(_,i)=>Math.floor(count/groups)+(i<count%groups?1:0));}
function cost(order,sizes,history,n){let repeats=0,load=0,start=0;for(const size of sizes){for(let i=start;i<start+size;i++)for(let j=i+1;j<start+size;j++){const prior=history[order[i]*n+order[j]];if(prior>0)repeats++;load+=prior;}start+=size;}return [repeats,load];}
export function makeMix(input){
 const config=validateConfig(input),n=config.participants.length,random=randomFromSeed(config.seed),sizes=balancedSizes(n,config.groups),groupAt=sizes.flatMap((size,i)=>Array(size).fill(i)),history=new Uint8Array(n*n),ids=Array.from({length:n},(_,i)=>i),rounds=[];
 for(let round=1;round<=config.rounds;round++){
  let best=null,bestCost=[Infinity,Infinity];
  for(let attempt=0;attempt<24;attempt++){
   const order=shuffled(ids,random);let value=cost(order,sizes,history,n);
   if(value[0]>0)for(let step=0;step<80;step++){
    const a=Math.floor(random()*n),b=Math.floor(random()*n);if(groupAt[a]===groupAt[b])continue;
    [order[a],order[b]]=[order[b],order[a]];const next=cost(order,sizes,history,n);
    if(less(next,value))value=next;else [order[a],order[b]]=[order[b],order[a]];
    if(value[0]===0)break;
   }
   if(less(value,bestCost)){best=[...order];bestCost=value;}
   if(bestCost[0]===0)break;
  }
  let start=0;const groups=sizes.map((size,i)=>{const members=best.slice(start,start+size);start+=size;for(let a=0;a<members.length;a++)for(let b=a+1;b<members.length;b++){history[members[a]*n+members[b]]++;history[members[b]*n+members[a]]++;}
   return {id:'G'+(i+1),members:members.map(index=>'P'+String(index+1).padStart(2,'0'))};});
  rounds.push({number:round,groups});
 }
 return {algorithm:ALGORITHM,config,people:config.participants.map((name,i)=>({id:'P'+String(i+1).padStart(2,'0'),name})),rounds,
  scope:'Balanced-size seeded heuristic only. No global optimum, no-repeat, demographic fairness, room-capacity, accommodation or platform-integration guarantee.'};
}

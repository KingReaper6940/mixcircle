const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&apos;");
const short=(text,max)=>{const chars=[...text];return chars.length>max?chars.slice(0,max-1).join('')+'…':text;};
export function roundCards(report,roundNumber=1){
 if(!Number.isInteger(roundNumber)||roundNumber<1||roundNumber>report.rounds.length)throw new Error('Choose an existing round.');
 const round=report.rounds[roundNumber-1],columns=round.groups.length===1?1:2,cardWidth=columns===1?940:460,maxSize=Math.max(...round.groups.map(g=>g.members.length)),cardHeight=74+maxSize*27,height=150+Math.ceil(round.groups.length/columns)*(cardHeight+20)+55,people=new Map(report.people.map(p=>[p.id,p.name]));
 const out=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="'+height+'" viewBox="0 0 1000 '+height+'" role="img" aria-labelledby="title description">',
 '<title id="title">'+escape(report.config.title)+' — round '+roundNumber+'</title>',
 '<desc id="description">Balanced breakout group cards. Labels may be shortened; full labels are in tooltips and the JSON report. Group labels are not room-capacity or platform assignments.</desc>',
 '<rect width="1000" height="'+height+'" fill="#fffaf2"/>',
 '<text x="30" y="43" font-family="monospace" font-size="24" fill="#193d43">'+escape(short(report.config.title,48))+'</text>',
 '<text x="30" y="74" font-family="monospace" font-size="15" fill="#526970">Round '+roundNumber+' / '+report.config.rounds+' · mix key '+escape(short(report.config.seed,40))+'</text>',
 '<text x="30" y="104" font-family="monospace" font-size="12" fill="#526970">Heuristic grouping. Review repeats and individual needs before using.</text>'];
 round.groups.forEach((group,index)=>{const x=30+(index%columns)*480,y=130+Math.floor(index/columns)*(cardHeight+20);out.push('<g><rect x="'+x+'" y="'+y+'" width="'+cardWidth+'" height="'+cardHeight+'" rx="12" fill="#fff" stroke="#cddad9"/>','<text x="'+(x+22)+'" y="'+(y+34)+'" font-family="monospace" font-size="18" fill="#126d70">'+escape(group.id)+' · '+group.members.length+' people</text>');
  group.members.forEach((id,i)=>{const name=people.get(id);out.push('<g><title>'+escape(id+' · '+name)+'</title><text x="'+(x+22)+'" y="'+(y+67+i*27)+'" font-family="monospace" font-size="14" fill="#193d43">'+escape(id+' · '+short(name,columns===1?75:39))+'</text></g>');});out.push('</g>');});
 out.push('<text x="30" y="'+(height-22)+'" font-family="monospace" font-size="12" fill="#526970">Mixcircle · '+escape(report.algorithm)+' · Names and assignments are included in this export.</text></svg>');
 return out.join('\n')+'\n';
}

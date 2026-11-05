(()=>{'use strict';
const $=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg',KEY='kngs_flowchart_v2',W=950,H=700;
const nodeTypes=['start','process','input','decision','end'];
let data={nodes:[],edges:[]},nextId=1,selected=null,linkFrom=null,drag=null,mode='idle',timer=null,epoch=0,active=null,previousEdge=null,vars={},log=[],steps=0,animating=false;
const el=(tag,attrs,parent,txt)=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs||{}))n.setAttribute(k,String(v));if(txt!==undefined)n.textContent=String(txt);parent.append(n);return n};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaults={start:'Start',end:'End',process:'score = score + 1',input:'INPUT score',decision:'score >= 5'};
const get=id=>data.nodes.find(n=>n.id===id);
const byEdge=id=>data.edges.find(e=>e.id===id);
const dims=n=>n.type==='decision'?{w:182,h:94}:{w:158,h:70};
const maxX=n=>W-dims(n).w-16,maxY=n=>H-dims(n).h-18;
const box=n=>({...dims(n),x:n.x,y:n.y});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const edgeId=()=> 'e'+(nextId++);
function status(s){$('runStatus').textContent=s}
function message(msg,isError=false){$('feedback').className='notice'+(isError?' error':' ok');$('feedback').textContent=msg}
function hint(s){$('hint').textContent=s}
function addNode(type,x,y,label){if(!nodeTypes.includes(type))throw Error('Unknown node type');const n={id:'n'+(nextId++),type,x:clamp(x,10,W-205),y:clamp(y,10,H-120),label:label??defaults[type]};data.nodes.push(n);return n}
function addEdge(from,to,branch='next'){const source=get(from),target=get(to);if(!source||!target)throw Error('Select two valid shapes.');if(source.type==='end')throw Error('An End shape cannot have an outgoing arrow.');if(source.type==='decision'?!['yes','no'].includes(branch):branch!=='next')throw Error('This connector does not match the shape.');const same=data.edges.find(e=>e.from===from&&e.branch===branch);if(same){same.to=to;return same}const e={id:edgeId(),from,to,branch};data.edges.push(e);return e}
function outputPoint(n,branch){const b=box(n);if(n.type==='decision'&&branch==='no')return{x:b.x+b.w,y:b.y+b.h/2};return{x:b.x+b.w/2,y:b.y+b.h}}
function inputPoint(n){const b=box(n);return{x:b.x+b.w/2,y:b.y}}
function pathFor(edge){const a=get(edge.from),b=get(edge.to);if(!a||!b)return'';const p=outputPoint(a,edge.branch),q=inputPoint(b);if(a.id===b.id){const d=dims(a);return'M '+p.x+' '+p.y+' C '+(p.x+180)+' '+(p.y+120)+' '+(p.x-180)+' '+(p.y-105)+' '+q.x+' '+q.y}if(edge.branch==='no'&&a.type==='decision'){const xmid=p.x+Math.max(45,(q.x-p.x)/2);return'M '+p.x+' '+p.y+' C '+xmid+' '+p.y+' '+xmid+' '+q.y+' '+q.x+' '+q.y}if(q.y>p.y+20)return'M '+p.x+' '+p.y+' C '+p.x+' '+(p.y+Math.max(40,(q.y-p.y)*.52))+' '+q.x+' '+(q.y-Math.max(40,(q.y-p.y)*.48))+' '+q.x+' '+q.y;return'M '+p.x+' '+p.y+' C '+(p.x+95)+' '+(p.y+75)+' '+(q.x-95)+' '+(q.y-70)+' '+q.x+' '+q.y}
function saveAuto(){try{localStorage.setItem(KEY,JSON.stringify({data,nextId,variables:$('variables').value}))}catch(e){}}
function draw(){
 const lines=$('edges'),nodes=$('nodes');lines.textContent='';nodes.textContent='';
 for(const edge of data.edges){if(!get(edge.from)||!get(edge.to))continue;const d=pathFor(edge);const g=el('g',{'data-edge':edge.id},lines),activeEdge=edge.id===previousEdge;
 el('path',{d,fill:'none',stroke:'transparent','stroke-width':18,class:'edge','data-edge':edge.id},g);
 el('path',{d,fill:'none',stroke:activeEdge?'#19a471':selected==='edge:'+edge.id?'#dd8434':'#6184a3','stroke-width':activeEdge?4.4:2.7,'marker-end':activeEdge?'url(#arrowActive)':'url(#arrow)','pointer-events':'none','data-line':edge.id},g);
 if(get(edge.from).type==='decision'){const a=get(edge.from),p=outputPoint(a,edge.branch);let label=el('text',{x:p.x+(edge.branch==='no'?23:13),y:p.y+(edge.branch==='no'?-11:23),fill:'#875b25','font-size':14,'font-weight':850},g,edge.branch==='yes'?'Yes':'No');label.style.pointerEvents='none'}
 }
 for(const n of data.nodes){
  const {w,h}=dims(n),g=el('g',{transform:'translate('+n.x+' '+n.y+')','data-node':n.id,class:'node',tabindex:0,role:'button','aria-label':n.type+' '+n.label},nodes);
  const stroke=active===n.id?'#19a471':selected===n.id?'#dd8b32':n.type==='decision'?'#af7428':n.type==='start'?'#167b5a':n.type==='end'?'#ab5555':'#245d97';
  const fill=active===n.id?'#ddfaec':n.type==='decision'?'#fff3e0':n.type==='start'?'#e6f6ed':n.type==='end'?'#fbeceb':'#e9f3ff';
  let shape;
  if(n.type==='start'||n.type==='end')shape=el('rect',{x:3,y:7,width:w-6,height:h-14,rx:28,fill,stroke,'stroke-width':selected===n.id?4:2.5},g);
  else if(n.type==='decision')shape=el('polygon',{points:(w/2)+',2 '+(w-3)+','+(h/2)+' '+(w/2)+','+(h-2)+' 3,'+(h/2),fill,stroke,'stroke-width':selected===n.id?4:2.5},g);
  else if(n.type==='input')shape=el('polygon',{points:'25,4 '+(w-3)+',4 '+(w-25)+','+(h-4)+' 3,'+(h-4),fill,stroke,'stroke-width':selected===n.id?4:2.5},g);
  else shape=el('rect',{x:3,y:4,width:w-6,height:h-8,fill,stroke,'stroke-width':selected===n.id?4:2.5},g);
  shape.setAttribute('data-hit','shape');
  const text=el('text',{x:w/2,y:h/2,'text-anchor':'middle','font-size':14,fill:'#1d3955','font-weight':750,'pointer-events':'none'},g);
  const words=n.label.trim().split(/\s+/),maxChars=n.type==='decision'?18:20;let rows=[''];for(const word of words){const last=rows.length-1;if((rows[last]+' '+word).trim().length>maxChars&&rows[last]&&rows.length<3)rows.push(word);else rows[last]+=(rows[last]?' ':'')+word}
  rows=rows.map(x=>x.slice(0,maxChars+(rows.length===3?1:4)));rows.forEach((line,i)=>el('tspan',{x:w/2,dy:i===0?(-(rows.length-1)*8):17},text,line));
  if(n.type!=='end'){const ports=n.type==='decision'?['yes','no']:['next'];for(const branch of ports){const p=outputPoint(n,branch),localX=p.x-n.x,localY=p.y-n.y;const circle=el('circle',{cx:localX,cy:localY,r:8,fill:linkFrom?.id===n.id&&linkFrom.branch===branch?'#ed9d36':'#2179b1',class:'port','data-from':n.id,'data-branch':branch},g);el('title',{},circle,'Connect '+(branch==='next'?'next step':branch.toUpperCase()+' branch'));}}
  // Destination target may be selected by clicking the shape.
 }
 renderProperties();
}
function renderProperties(){
 const n=get(selected);
 if(selected?.startsWith('edge:')){const e=byEdge(selected.slice(5));$('properties').innerHTML=e?'<div class="field"><label>Selected arrow</label><div>'+esc(get(e.from)?.label)+' → '+esc(get(e.to)?.label)+'</div></div><button class="btn warn" id="removeEdge">Delete arrow</button>':'<p class="muted">Choose a shape or arrow.</p>';if(e)$('removeEdge').onclick=()=>{data.edges=data.edges.filter(x=>x.id!==e.id);selected=null;draw();saveAuto()};return}
 if(!n){$('properties').innerHTML='<p class="muted">Select a shape to edit its text, move it or delete it.</p>';return}
 $('properties').innerHTML='<div class="field"><label for="nodeType">Shape</label><select id="nodeType">'+nodeTypes.map(t=>'<option value="'+t+'"'+(n.type===t?' selected':'')+'>'+t[0].toUpperCase()+t.slice(1)+'</option>').join('')+'</select></div><div class="field"><label for="nodeLabel">Instruction / label</label><textarea id="nodeLabel" spellcheck="false">'+esc(n.label)+'</textarea></div><p class="muted">Use <strong>INPUT variable</strong> or <strong>PRINT expression</strong> for input/output; processes assign a value with <strong>=</strong>. A decision compares values.</p><div class="row"><button class="btn alt" id="updateNode">Apply</button><button class="btn warn" id="deleteNode">Delete</button></div>';
 $('updateNode').onclick=()=>{let old=n.type,proposed=$('nodeType').value;if(proposed!==old){n.type=proposed;data.edges=data.edges.filter(e=>e.from!==n.id||(proposed==='decision'?['yes','no'].includes(e.branch):proposed!=='end'&&e.branch==='next'));if(proposed==='end')data.edges=data.edges.filter(e=>e.from!==n.id)}n.label=$('nodeLabel').value.trim()||defaults[n.type];draw();saveAuto();message('Shape updated.')};
 $('deleteNode').onclick=()=>{data.nodes=data.nodes.filter(x=>x.id!==n.id);data.edges=data.edges.filter(e=>e.from!==n.id&&e.to!==n.id);selected=null;draw();saveAuto();message('Shape deleted. Check remaining connections.')};
}
function selectNode(id){selected=id;draw()}
function positionFrom(evt){const rect=$('canvas').getBoundingClientRect();return{x:(evt.clientX-rect.left)*W/rect.width,y:(evt.clientY-rect.top)*H/rect.height}}
const board=$('canvas');
board.addEventListener('pointerdown',ev=>{
 if(mode==='run'||animating)return;
 const port=ev.target.closest('[data-from]');
 if(port){const id=port.dataset.from,branch=port.dataset.branch;linkFrom={id,branch};selected=id;draw();hint('Connection started. Click a destination shape to create the '+branch+' arrow.');ev.preventDefault();return}
 const edge=ev.target.closest('[data-edge]');
 if(edge){selected='edge:'+edge.dataset.edge;draw();return}
 const group=ev.target.closest('[data-node]');
 if(group){const id=group.dataset.node;if(linkFrom){try{addEdge(linkFrom.id,id,linkFrom.branch);message('Arrow connected.');linkFrom=null;saveAuto()}catch(e){message(e.message,true)}selected=id;draw();return}selectNode(id);const p=positionFrom(ev),n=get(id);drag={id,ox:p.x-n.x,oy:p.y-n.y,startX:p.x,startY:p.y};ev.preventDefault();return}
 selected=null;linkFrom=null;draw();
});
window.addEventListener('pointermove',ev=>{if(!drag||mode==='run'||animating)return;const n=get(drag.id),p=positionFrom(ev);if(!n)return;n.x=clamp(Math.round((p.x-drag.ox)/5)*5,8,maxX(n));n.y=clamp(Math.round((p.y-drag.oy)/5)*5,8,maxY(n));draw()});
window.addEventListener('pointerup',()=>{if(drag){drag=null;saveAuto()}});
board.addEventListener('keydown',ev=>{const g=ev.target.closest('[data-node]');if(!g||!get(g.dataset.node))return;if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();if(linkFrom){try{addEdge(linkFrom.id,g.dataset.node,linkFrom.branch);linkFrom=null;saveAuto();message('Connected.')}catch(e){message(e.message,true)}}selectNode(g.dataset.node)}});
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{stop();const type=b.dataset.add;if((type==='start'||type==='end')&&data.nodes.some(n=>n.type===type)){message('Only one '+type+' node is allowed.',true);return}const n=addNode(type,340+Math.random()*50,130+Math.random()*75);selected=n.id;draw();saveAuto();message('Shape added. Drag it to move it, then connect from an output dot.')});
function checkDiagram(){
 const issues=[],starts=data.nodes.filter(n=>n.type==='start'),ends=data.nodes.filter(n=>n.type==='end');
 if(starts.length!==1)issues.push('Exactly one Start node is required.');
 if(ends.length!==1)issues.push('Exactly one End node is required.');
 for(const n of data.nodes){
  const out=data.edges.filter(e=>e.from===n.id),incoming=data.edges.filter(e=>e.to===n.id);
  if(n.type==='end'&&out.length)issues.push('End must not have outgoing arrows.');
  if(n.type!=='end'&&n.type!=='decision'&&out.filter(e=>e.branch==='next').length!==1)issues.push(n.label+': needs one outgoing arrow.');
  if(n.type==='decision'&&(!out.some(e=>e.branch==='yes')||!out.some(e=>e.branch==='no')))issues.push(n.label+': needs both Yes and No arrows.');
  if(n.type!=='start'&&!incoming.length)issues.push(n.label+': has no incoming arrow.');
 }
 if(starts.length===1){const seen=new Set(),queue=[starts[0].id];while(queue.length){const a=queue.shift();if(seen.has(a))continue;seen.add(a);data.edges.filter(e=>e.from===a).forEach(e=>queue.push(e.to))}if(ends.length===1&&!seen.has(ends[0].id))issues.push('End is unreachable from Start.');for(const n of data.nodes)if(!seen.has(n.id))issues.push(n.label+': unreachable from Start.')}
 if(!issues.length)message('✓ Structure valid: Start, End, all connections and branches are present.');else message('⚠ '+issues.join(' '),true);
 return issues;
}
$('validate').onclick=checkDiagram;
const parseValue=str=>{str=str.trim();if(/^["'].*["']$/.test(str))return str.slice(1,-1);if(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(str))return Number(str);if(str==='true')return true;if(str==='false')return false;if(Object.prototype.hasOwnProperty.call(vars,str))return vars[str];throw Error('Unknown value or variable: '+str)};
function expression(expr){
 expr=String(expr).trim();
 const tokens=expr.match(/"[^"]*"|'[^']*'|[-+]?(?:\d+(?:\.\d*)?|\.\d+)|[A-Za-z_]\w*|[()+*/-]/g)||[];
 if(tokens.join('').replace(/\s/g,'')!==expr.replace(/\s/g,''))throw Error('Unsupported expression: '+expr);
 let i=0;
 function primary(){const v=tokens[i++];if(v==='('){const x=add();if(tokens[i++]!==')')throw Error('Missing closing bracket');return x}if(v==='-')return -Number(primary());if(v==='+')return Number(primary());if(v===undefined)throw Error('Incomplete expression');return parseValue(v)}
 function mult(){let a=primary();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],b=primary();a=op==='*'?Number(a)*Number(b):Number(a)/Number(b)}return a}
 function add(){let a=mult();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],b=mult();a=op==='+'?(typeof a==='string'||typeof b==='string'?String(a)+String(b):Number(a)+Number(b)):Number(a)-Number(b)}return a}
 const result=add();if(i!==tokens.length)throw Error('Invalid expression: '+expr);if(typeof result==='number'&&!Number.isFinite(result))throw Error('Division by zero or invalid number');return result
}
function decision(label){const m=label.match(/^(.+?)\s*(>=|<=|==|!=|>|<|=)\s*(.+)$/);if(!m)throw Error('Decision should compare values, e.g. score >= 5');const a=expression(m[1]),b=expression(m[3]);if(['=','=='].includes(m[2]))return a===b;if(m[2]==='!=')return a!==b;return m[2]==='>'?a>b:m[2]==='<'?a<b:m[2]==='>='?a>=b:a<=b}
function initialiseVars(){vars={};for(const line of $('variables').value.split(/\n/)){const s=line.trim();if(!s)continue;const m=s.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);if(!m)throw Error('Test value must use name = value: '+s);vars[m[1]]=expression(m[2])}}
function logLine(text){log.push(text);$('log').textContent=log.slice(-45).join('\n');$('log').scrollTop=$('log').scrollHeight}
function stateView(){$('state').textContent=Object.keys(vars).length?Object.entries(vars).map(([k,v])=>k+' = '+JSON.stringify(v)).join('\n'):'No variables yet.'}
function execute(n){let branch='next',out='';
 if(n.type==='process'){const m=n.label.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);if(!m)throw Error('Process must assign a variable, e.g. score = score + 1');vars[m[1]]=expression(m[2]);out=m[1]+' = '+JSON.stringify(vars[m[1]])}
 else if(n.type==='input'){const m=n.label.match(/^(INPUT|PRINT|OUTPUT)\s+(.+)$/i);if(!m)throw Error('Input/Output syntax: INPUT age or PRINT score');if(m[1].toUpperCase()==='INPUT'){const name=m[2].trim();if(!/^[A-Za-z_]\w*$/.test(name))throw Error('Invalid INPUT variable name');if(!Object.prototype.hasOwnProperty.call(vars,name)){const response=prompt('Enter a value for '+name+' (number or quoted text):','0');if(response===null)throw Error('Input cancelled');vars[name]=parseValue(response)}out='INPUT '+name+' = '+JSON.stringify(vars[name])}else out='OUTPUT: '+JSON.stringify(expression(m[2]))}
 else if(n.type==='decision'){const yes=decision(n.label);branch=yes?'yes':'no';out=n.label+' → '+(yes?'Yes':'No')}
 else out=n.label;
 return{branch,out}
}
function runnerPosition(x,y){const r=$('runner');r.setAttribute('cx',x);r.setAttribute('cy',y);r.setAttribute('visibility','visible')}
function stop(){epoch++;if(timer){clearTimeout(timer);timer=null}mode='idle';animating=false;active=null;previousEdge=null;steps=0;vars={};log=[];$('runner').setAttribute('visibility','hidden');$('pause').disabled=true;$('pause').textContent='Ⅱ Pause';status('Ready');stateView();$('log').textContent='No steps yet.';draw()}
function prepare(){if(checkDiagram().length)return false;try{initialiseVars()}catch(e){message(e.message,true);return false}steps=0;log=[];previousEdge=null;active=data.nodes.find(n=>n.type==='start').id;stateView();$('log').textContent='';status('Ready to execute');draw();return true}
function finish(text){mode='idle';active=null;animating=false;status(text);$('pause').disabled=true;message(text);draw();$('runner').setAttribute('visibility','hidden')}
function animateEdge(edge,duration=490){return new Promise(resolve=>{const p=$('edges').querySelector('[data-line="'+edge.id+'"]');if(!p){resolve();return}const length=p.getTotalLength(),start=performance.now(),ownEpoch=epoch;animating=true;function frame(now){if(ownEpoch!==epoch){resolve();return}const t=Math.min(1,(now-start)/duration),e=t*t*(3-2*t),pt=p.getPointAtLength(e*length);runnerPosition(pt.x,pt.y);if(t<1)requestAnimationFrame(frame);else{animating=false;resolve()}}requestAnimationFrame(frame)})}
async function advance(single=false){
 if(animating)return;if(!active){if(!prepare())return}
 if(steps>=150){finish('Stopped: 150-step safety limit (possible infinite loop).');return}
 const n=get(active);if(!n){finish('Execution stopped: missing shape.');return}
 steps++;draw();status('Executing step '+steps);
 try{
 const result=execute(n);logLine(steps+'. '+result.out);stateView();
 if(n.type==='end'){finish('Finished successfully in '+steps+' steps.');return}
 const e=data.edges.find(e=>e.from===n.id&&e.branch===result.branch);
 if(!e)throw Error('No '+result.branch+' arrow from '+n.label);
 previousEdge=e.id;draw();const animationEpoch=epoch;await animateEdge(e);
 if(animationEpoch!==epoch)return;
 active=e.to;draw();status(single?'Paused after step '+steps:'Running step '+steps);
 }catch(ex){finish('Stopped: '+ex.message);message(ex.message,true)}
}
async function cycle(){if(mode!=='run'||animating)return;await advance(false);if(mode==='run')timer=setTimeout(cycle,420)}
$('run').onclick=()=>{if(mode==='run')return;if(mode==='pause'){mode='run';$('pause').textContent='Ⅱ Pause';status('Running');cycle();return}if(!active&&!prepare())return;mode='run';$('pause').disabled=false;$('pause').textContent='Ⅱ Pause';cycle()};
$('pause').onclick=()=>{if(mode==='run'){mode='pause';if(timer)clearTimeout(timer);timer=null;$('pause').textContent='▶ Resume';status('Paused')}else if(mode==='pause'){$('run').click()}};
$('step').onclick=async()=>{if(mode==='run'){$('pause').click()}mode='pause';$('pause').disabled=false;$('pause').textContent='▶ Resume';await advance(true)};
$('reset').onclick=()=>{stop();message('Run reset. Your flowchart remains unchanged.')};
function example(name){stop();data={nodes:[],edges:[]};nextId=1;const n=(t,x,y,label)=>addNode(t,x,y,label);const e=(a,b,branch='next')=>addEdge(a.id,b.id,branch);
 if(name==='age'){
 const a=n('start',70,100,'Start'),b=n('input',305,100,'INPUT age'),c=n('decision',555,85,'age >= 16'),d=n('input',520,300,'PRINT "Adult fare"'),f=n('input',735,300,'PRINT "Child fare"'),g=n('end',605,520,'End');e(a,b);e(b,c);e(c,d,'yes');e(c,f,'no');e(d,g);e(f,g);$('variables').value='age = 12';
 }else if(name==='score'){
 const a=n('start',45,90,'Start'),b=n('input',270,90,'INPUT score'),c=n('decision',505,75,'score >= 7'),d=n('input',450,300,'PRINT "Pass"'),f=n('input',730,300,'PRINT "Retry"'),g=n('end',625,510,'End');e(a,b);e(b,c);e(c,d,'yes');e(c,f,'no');e(d,g);e(f,g);$('variables').value='score = 8';
 }else if(name==='count'){
 const a=n('start',70,100,'Start'),b=n('process',305,100,'count = 0'),c=n('decision',540,80,'count < 4'),d=n('process',510,280,'count = count + 1'),p=n('input',300,445,'PRINT count'),g=n('end',760,430,'End');e(a,b);e(b,c);e(c,d,'yes');e(c,g,'no');e(d,p);e(p,c);$('variables').value='';
 }else{
 const a=n('start',70,100,'Start'),b=n('input',290,100,'INPUT password'),c=n('decision',540,80,'password == "open"'),d=n('input',480,300,'PRINT "Welcome"'),f=n('input',735,300,'PRINT "Denied"'),g=n('end',625,515,'End');e(a,b);e(b,c);e(c,d,'yes');e(c,f,'no');e(d,g);e(f,g);$('variables').value='password = "open"';
 }
 selected=null;linkFrom=null;draw();saveAuto();message('Example loaded. Change test values, then press Run or Step.');hint('Drag shapes, select a connector dot and then click another shape to connect them.');
}
$('examples').onchange=()=>{if($('examples').value)example($('examples').value)};
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function validImport(obj){if(!obj||!Array.isArray(obj.nodes)||!Array.isArray(obj.edges)||obj.nodes.length>100||obj.edges.length>240)throw Error('Invalid or oversized flowchart file.');const ids=new Set();const nodes=obj.nodes.map(n=>{if(!n||typeof n.id!=='string'||ids.has(n.id)||!nodeTypes.includes(n.type)||!Number.isFinite(n.x)||!Number.isFinite(n.y)||typeof n.label!=='string'||n.label.length>180)throw Error('Invalid shape data.');ids.add(n.id);return{id:n.id,type:n.type,x:clamp(n.x,8,770),y:clamp(n.y,8,580),label:n.label}});const edges=obj.edges.map(e=>{if(!e||typeof e.id!=='string'||!ids.has(e.from)||!ids.has(e.to)||!['next','yes','no'].includes(e.branch))throw Error('Invalid connection data.');return{id:e.id,from:e.from,to:e.to,branch:e.branch}});return{nodes,edges}}
function loadObject(obj){stop();data=validImport(obj.data||obj);const matches=data.nodes.concat(data.edges).map(x=>Number(String(x.id).replace(/\D/g,''))).filter(Number.isFinite);nextId=Math.max(1,...matches)+1;selected=null;linkFrom=null;draw();saveAuto();message('Flowchart loaded.')}
$('save').onclick=()=>{saveAuto();message('Saved on this browser and device. Use Export JSON for a portable copy.')};
$('load').onclick=()=>{try{const raw=localStorage.getItem(KEY);if(!raw)throw Error('No saved flowchart found');const obj=JSON.parse(raw);loadObject(obj);$('variables').value=obj.variables??'';saveAuto()}catch(e){message(e.message,true)}};
$('jsonExport').onclick=()=>download('kngs-flowchart.json',JSON.stringify({version:2,data,variables:$('variables').value},null,2),'application/json');
$('jsonImport').onclick=()=>$('fileInput').click();
$('fileInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>250000)throw Error('File too large');const obj=JSON.parse(await file.text());loadObject(obj);$('variables').value=String(obj.variables??'');saveAuto()}catch(ex){message(ex.message,true)}e.target.value=''};
$('svgExport').onclick=()=>{draw();const clone=$('canvas').cloneNode(true);clone.removeAttribute('id');clone.querySelector('#runner')?.remove();const svg='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(clone);download('kngs-flowchart.svg',svg,'image/svg+xml')};
$('print').onclick=()=>window.print();
$('variables').addEventListener('input',saveAuto);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&linkFrom){linkFrom=null;draw();hint('Connection cancelled.')};if((e.key==='Delete'||e.key==='Backspace')&&selected&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){if(selected.startsWith('edge:'))data.edges=data.edges.filter(x=>x.id!==selected.slice(5));else{data.nodes=data.nodes.filter(x=>x.id!==selected);data.edges=data.edges.filter(x=>x.from!==selected&&x.to!==selected)}selected=null;draw();saveAuto()}});
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.data){data=validImport(saved.data);nextId=Math.max(1,...data.nodes.concat(data.edges).map(x=>Number(String(x.id).replace(/\D/g,''))).filter(Number.isFinite))+1;$('variables').value=saved.variables||'';draw();message('Your last flowchart has been restored from this browser.')}else example('age')}catch(e){example('age')}
stateView();
})();
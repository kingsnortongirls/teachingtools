/* KNGS Network Designer v2: classroom graph simulation, fully local. */
(function(){
'use strict';
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const TYPES={pc:['Computer','#2979b8'],laptop:['Laptop','#458bb5'],server:['Server','#795aa4'],switch:['Switch','#2286a4'],router:['Router','#26699d'],ap:['Access point','#238e76'],printer:['Printer','#708298'],firewall:['Firewall','#c47545'],nas:['NAS','#8063a7'],phone:['Phone','#2a9985'],tablet:['Tablet','#578a93'],cloud:['Cloud / WAN','#6f79a9']};
const MEDIUM={ethernet:{name:'Ethernet',colour:'#478ab8',latency:2,speed:1000},fibre:{name:'Fibre',colour:'#9970ad',latency:1,speed:10000},wireless:{name:'Wireless',colour:'#c68a30',latency:8,speed:150}};
const STORE='kngs-network-designer-v2',SAVE='kngs-network-designer-save-v2',MAX_NODES=100,MAX_LINKS=240;
const svg=$('diagram'),viewport=$('viewport'),nodeLayer=$('deviceLayer'),edgeLayer=$('links'),routeLayer=$('routeLayer'),studio=$('studio');
const S={nodes:[],edges:[],nextId:1,selected:null,mode:'select',connecting:null,route:null,history:[],h:-1,camera:{x:120,y:100,z:1},drag:null,timer:null};
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const getNode=id=>S.nodes.find(n=>n.id===id),getEdge=id=>S.edges.find(e=>e.id===id);
const nodeName=id=>getNode(id)?.name||id;
function elem(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,String(attrs[k]));if(parent)parent.appendChild(e);return e;}
function textSvg(parent,value,attrs){const e=elem('text',attrs,parent);e.textContent=String(value);return e;}
function note(message,tone){$('status').textContent=message;$('status').style.color=tone==='error'?'#b34048':tone==='ok'?'#127556':'#365978';}
function traceNote(message,tone){$('traceNotice').textContent=message;$('traceNotice').className='notice'+(tone?' '+tone:'');}
function current(){return JSON.stringify({format:'kngs-network-v2',nodes:S.nodes,edges:S.edges,nextId:S.nextId});}
function stopPlay(){if(S.timer!==null){clearTimeout(S.timer);S.timer=null;}$('playBtn').textContent='Play ▶';}
function invalidate(){stopPlay();S.route=null;$('traceLog').textContent='Network changed. Find a route to run another packet.';traceNote('The network changed. Any previous route must be recalculated.');}
function updateUndo(){$('undoBtn').disabled=S.h<=0;$('redoBtn').disabled=S.h>=S.history.length-1;}
function historyPush(){const snap=current();if(S.history[S.h]!==snap){S.history.splice(S.h+1);S.history.push(snap);if(S.history.length>60)S.history.shift();S.h=S.history.length-1;}updateUndo();}
function autoSave(){try{localStorage.setItem(STORE,current());}catch(e){}}
function commit(message){invalidate();historyPush();autoSave();render();note(message,'ok');}
function applyState(data){S.nodes=data.nodes;S.edges=data.edges;S.nextId=data.nextId;S.selected=null;S.connecting=null;S.route=null;stopPlay();}
function undo(delta){const i=S.h+delta;if(i<0||i>=S.history.length)return;applyState(JSON.parse(S.history[i]));S.h=i;autoSave();render();note(delta<0?'Previous edit undone.':'Edit restored.');}
function createNode(type,x,y,name,ip){if(!TYPES[type]||S.nodes.length>=MAX_NODES)throw Error('Device type invalid or device limit reached.');const number=S.nodes.filter(n=>n.type===type).length+1;const n={id:'n'+S.nextId++,type,name:name||TYPES[type][0]+' '+number,ip:ip||'',x:Math.round(x),y:Math.round(y),online:true,vlan:1};S.nodes.push(n);return n.id;}
function createEdge(a,b,kind,latency,speed){if(a===b||!getNode(a)||!getNode(b))throw Error('Choose two different devices.');if(S.edges.length>=MAX_LINKS)throw Error('Maximum number of connections reached.');if(S.edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))throw Error('Those two devices are already connected.');const m=MEDIUM[kind]||MEDIUM.ethernet;const e={id:'e'+S.nextId++,a,b,kind:MEDIUM[kind]?kind:'ethernet',latency:latency??m.latency,speed:speed??m.speed,up:true,label:''};S.edges.push(e);return e.id;}
function addDevice(type){try{const i=S.nodes.length,c=S.camera;const x=clamp(c.x+viewport.clientWidth/(2*c.z)+(i%3)*33-32,100,2880),y=clamp(c.y+viewport.clientHeight/(2*c.z)+(i%4)*25-45,75,1920);const id=createNode(type,x,y);S.selected={kind:'node',id};commit(TYPES[type][0]+' added. Drag it to position.');}catch(e){note(e.message,'error');}}
function setMode(mode){if(!['select','link','pan'].includes(mode))return;S.mode=mode;S.connecting=null;document.querySelectorAll('[data-mode]').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('active',on);b.classList.toggle('alt',!on);b.setAttribute('aria-pressed',String(on));});viewport.classList.toggle('pan',mode==='pan');viewport.classList.toggle('connect',mode==='link');render();note(mode==='link'?'Connect mode: select two devices in sequence.':mode==='pan'?'Pan mode: drag the background.':'Select mode: drag devices or select links.');}
function select(kind,id){S.selected=kind&&id?{kind,id}:null;render();}
function chooseNode(id){if(!getNode(id))return;if(S.mode!=='link'){select('node',id);return;}if(!S.connecting){S.connecting=id;S.selected={kind:'node',id};render();note('Now select a destination device for '+nodeName(id)+'.');return;}const first=S.connecting;S.connecting=null;if(id===first){render();note('Choose two different devices to create a link.');return;}try{const edge=createEdge(first,id,$('linkKind').value);S.selected={kind:'edge',id:edge};commit('Connected '+nodeName(first)+' to '+nodeName(id)+'.');}catch(e){render();note(e.message,'error');}}
const ICON={
pc:'M3 4h18v13H3z M12 17v4 M7 21h10',laptop:'M4 4h16v13H4z M2 20h20l-2 2H4z',
server:'M4 3h16v7H4z M4 14h16v7H4z M8 7h.01 M8 18h.01',
switch:'M3 7h18v11H3z M7 13h2 M12 13h2 M17 13h2',
router:'M3 13h18v8H3z M7 13V4 M17 13V4 M4 7l3-3 3 3 M14 7l3-3 3 3',
ap:'M12 20h.01 M8 16q4-4 8 0 M4 12q8-8 16 0 M1 8q11-11 22 0',
printer:'M5 8V3h14v5 M5 18H3V8h18v10h-2 M5 14h14v8H5z',
firewall:'M12 2 3 6v6c0 5 4 8 9 10 5-2 9-5 9-10V6z M8 12h8 M12 8v8',
nas:'M4 3h16v18H4z M7 7h10 M7 11h10 M8 17h.01 M13 17h4',
phone:'M7 2h10v20H7z M11 19h2',tablet:'M3 2h18v20H3z M11 19h2',
cloud:'M6 18H5a4 4 0 0 1-.5-8 7 7 0 0 1 13-2A5 5 0 1 1 18 18z'
};
function drawIcon(type,g){const inner=elem('g',{transform:'translate(-59 -30) scale(1.08)',fill:'none',stroke:'#fff','stroke-width':1.7,'stroke-linecap':'round','stroke-linejoin':'round'},g);elem('path',{d:ICON[type]||ICON.pc},inner);}
function drawNode(n){const selected=S.selected?.kind==='node'&&S.selected.id===n.id,pending=S.connecting===n.id,active=S.route&&S.route.cursor>=0&&S.route.path[S.route.cursor]===n.id;
const g=elem('g',{'data-node':n.id,class:'device',transform:'translate('+n.x+' '+n.y+')',tabindex:0,role:'button','aria-label':n.name+', '+TYPES[n.type][0]+', '+(n.online?'online':'offline')},nodeLayer);
elem('title',{},g).textContent=n.name+' · '+TYPES[n.type][0]+' · '+(n.ip||'no IP address');
if(selected||pending||active)elem('rect',{x:-80,y:-48,width:160,height:96,rx:19,fill:'none',stroke:active?'#23a875':pending?'#d49a30':'#277fbc','stroke-width':4,'stroke-dasharray':pending?'6 4':''},g);
elem('rect',{x:-75,y:-43,width:150,height:86,rx:14,fill:n.online?'#fff':'#ebeff3',stroke:'#b9cfe0','stroke-width':1.8,filter:'url(#shadow)',class:'device-frame'},g);
elem('rect',{x:-75,y:-43,width:150,height:6,rx:2,fill:TYPES[n.type][1]},g);
elem('rect',{x:-63,y:-30,width:33,height:33,rx:9,fill:n.online?TYPES[n.type][1]:'#9ca9b1'},g);
drawIcon(n.type,g);
elem('circle',{cx:62,cy:-26,r:5.6,fill:n.online?'#20ae76':'#d76565',stroke:'#fff','stroke-width':1.6},g);
textSvg(g,n.name.length>17?n.name.slice(0,16)+'…':n.name,{x:-23,y:-16,'font-size':12.5,'font-weight':800,'font-family':'system-ui, sans-serif',fill:'#1a4261'});
textSvg(g,TYPES[n.type][0],{x:-23,y:-1,'font-size':10.5,'font-family':'system-ui, sans-serif',fill:'#55748d'});
textSvg(g,n.ip||'No IPv4 address',{x:0,y:27,'text-anchor':'middle','font-size':10.5,'font-family':'system-ui, sans-serif',fill:'#5b738d'});
}
function drawEdge(e){const a=getNode(e.a),b=getNode(e.b);if(!a||!b)return;const g=elem('g',{},edgeLayer),attrs={x1:a.x,y1:a.y,x2:b.x,y2:b.y},selected=S.selected?.kind==='edge'&&S.selected.id===e.id;
const healthy=e.up&&a.online&&b.online,colour=healthy?MEDIUM[e.kind].colour:'#aeb7c2';
elem('line',Object.assign({},attrs,{stroke:colour,'stroke-width':selected?5:3.3,'stroke-dasharray':e.up?(e.kind==='wireless'?'8 8':e.kind==='fibre'?'3 6':''):'6 6','pointer-events':'none',class:'link-visual'}),g);
elem('line',Object.assign({},attrs,{stroke:'transparent','stroke-width':23,class:'link-hit','data-edge':e.id,tabindex:0,role:'button','aria-label':'Connection from '+a.name+' to '+b.name}),g);
const px=(a.x+b.x)/2,py=(a.y+b.y)/2;
elem('rect',{x:px-47,y:py-14,width:94,height:25,rx:11,fill:'#fff','fill-opacity':'.94',stroke:selected?'#d89638':'#d3dfeb','stroke-width':1,'pointer-events':'none'},g);
const caption=e.label||((e.kind==='wireless'?'Wi-Fi':e.kind==='fibre'?'Fibre':'Ethernet')+' · '+e.speed);
textSvg(g,caption.length>17?caption.slice(0,16)+'…':caption,{x:px,y:py+3,'text-anchor':'middle','font-family':'system-ui, sans-serif','font-size':10.3,'font-weight':750,fill:'#43617b','pointer-events':'none'});
if(S.route&&S.route.cursor>=1){for(let i=1;i<=S.route.cursor;i++){const u=S.route.path[i-1],v=S.route.path[i];if((u===e.a&&v===e.b)||(u===e.b&&v===e.a)){elem('line',Object.assign({},attrs,{stroke:'#24b57d','stroke-width':7,'stroke-opacity':'.76','pointer-events':'none'}),routeLayer);break;}}}
}
function drawLayers(){edgeLayer.textContent='';nodeLayer.textContent='';routeLayer.textContent='';S.edges.forEach(drawEdge);S.nodes.forEach(drawNode);}
function renderSelects(){const items=S.nodes.map(n=>({id:n.id,name:n.name}));for(const id of ['source','destination']){const sel=$(id),before=sel.value;sel.textContent='';items.forEach(n=>{const o=document.createElement('option');o.value=n.id;o.textContent=n.name;sel.appendChild(o);});if(items.some(n=>n.id===before))sel.value=before;else if(id==='destination'&&items.length>1)sel.value=items[items.length-1].id;}}
function validIP(ip){if(!ip)return true;if(!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip))return false;return ip.split('.').every(v=>Number(v)<=255&&String(Number(v))===v);}
function field(parent,title,key,value,options,settings){const wrap=document.createElement('div');wrap.className='field';const lab=document.createElement('label');lab.textContent=title;wrap.appendChild(lab);let control;if(options){control=document.createElement('select');for(const [v,n]of options){const o=document.createElement('option');o.value=v;o.textContent=n;control.appendChild(o);}control.value=String(value);}else{control=document.createElement('input');control.type=settings?.number?'number':'text';control.value=String(value??'');if(settings?.min!==undefined)control.min=settings.min;if(settings?.max!==undefined)control.max=settings.max;control.maxLength=settings?.length||55;}control.dataset.property=key;control.id='property-'+key;lab.htmlFor=control.id;control.addEventListener('change',propertyChange);wrap.appendChild(control);parent.appendChild(wrap);}
function inspector(){const panel=$('inspector');panel.textContent='';if(!S.selected){const p=document.createElement('p');p.className='empty';p.textContent='Select a device or link to edit its name, address, connectivity or performance.';panel.appendChild(p);return;}const selection=S.selected,item=selection.kind==='node'?getNode(selection.id):getEdge(selection.id);if(!item){S.selected=null;return inspector();}
const head=document.createElement('div');head.className='subhead';head.textContent=selection.kind==='node'?('Device · '+TYPES[item.type][0]):('Connection · '+nodeName(item.a)+' ↔ '+nodeName(item.b));panel.appendChild(head);
if(selection.kind==='node'){
field(panel,'Device name','name',item.name,null,{length:45});field(panel,'Device type','type',item.type,Object.keys(TYPES).map(k=>[k,TYPES[k][0]]));
field(panel,'IPv4 address (optional)','ip',item.ip,null,{length:15});field(panel,'VLAN label (not enforced)','vlan',item.vlan,null,{number:true,min:1,max:4094});
field(panel,'Device state','online',String(item.online),[['true','Online'],['false','Offline']]);
}else{
field(panel,'Link medium','kind',item.kind,Object.keys(MEDIUM).map(k=>[k,MEDIUM[k].name]));
field(panel,'Latency (ms)','latency',item.latency,null,{number:true,min:1,max:10000});
field(panel,'Capacity (Mb/s)','speed',item.speed,null,{number:true,min:1,max:100000});
field(panel,'Short label','label',item.label||'',null,{length:28});
field(panel,'Link state','up',String(item.up),[['true','Working'],['false','Failed / disconnected']]);
}
const b=document.createElement('button');b.type='button';b.className='btn warn';b.style.marginTop='8px';b.textContent=selection.kind==='node'?'Delete device':'Delete connection';b.onclick=deleteSelected;panel.appendChild(b);
const p=document.createElement('p');p.className='muted';p.textContent='IPv4 and VLAN values are teaching annotations. Graph routing ignores IP subnet and VLAN enforcement.';panel.appendChild(p);
}
function propertyChange(e){const key=e.target.dataset.property,sel=S.selected;if(!sel)return;const item=sel.kind==='node'?getNode(sel.id):getEdge(sel.id);if(!item)return;let v=e.target.value;if(key==='name')v=v.trim().slice(0,45)||TYPES[item.type][0];if(key==='ip'){v=v.trim();if(!validIP(v)){note('Enter a valid IPv4 address, or leave it blank.','error');e.target.value=item.ip;return;}}
if(['latency','speed','vlan'].includes(key))v=clamp(Math.round(Number(v)||1),1,key==='vlan'?4094:key==='latency'?10000:100000);
if(['up','online'].includes(key))v=v==='true';
if(key==='type'&&!TYPES[v])return;
if(key==='kind'){if(!MEDIUM[v])return;item.kind=v;item.latency=MEDIUM[v].latency;item.speed=MEDIUM[v].speed;commit('Link medium and performance updated.');return;}
if(item[key]===v)return;item[key]=v;commit('Properties updated.');}
function deleteSelected(){if(!S.selected)return;const {kind,id}=S.selected;if(kind==='node'){S.nodes=S.nodes.filter(n=>n.id!==id);S.edges=S.edges.filter(e=>e.a!==id&&e.b!==id);}else S.edges=S.edges.filter(e=>e.id!==id);S.selected=null;S.connecting=null;commit(kind==='node'?'Device and attached links removed.':'Connection removed.');}
function liveEdges(){return S.edges.filter(e=>e.up&&getNode(e.a)?.online&&getNode(e.b)?.online);}
function connected(){const online=S.nodes.filter(n=>n.online),edges=liveEdges(),seen=new Set(),groups=[];for(const n of online){if(seen.has(n.id))continue;const q=[n.id],comp=[];seen.add(n.id);while(q.length){const id=q.shift();comp.push(id);for(const e of edges){const other=e.a===id?e.b:e.b===id?e.a:null;if(other&&!seen.has(other)){seen.add(other);q.push(other);}}}groups.push(comp);}return{online,edges,groups};}
function topology(x){const n=x.online.length,m=x.edges.length;if(n===0)return'No active devices';if(n===1)return'Single device';if(x.groups.length>1)return'Disconnected';if(n===2)return'Point-to-point';const degree=new Map(x.online.map(n=>[n.id,0]));for(const e of x.edges){degree.set(e.a,degree.get(e.a)+1);degree.set(e.b,degree.get(e.b)+1);}const d=[...degree.values()];if(m===n*(n-1)/2)return'Full mesh';if(m===n-1&&d.includes(n-1)&&d.filter(v=>v===1).length===n-1)return'Star';if(m===n&&d.every(v=>v===2))return'Ring';if(m===n-1&&d.filter(v=>v===1).length===2&&d.every(v=>v<=2))return'Chain';if(m>n-1)return'Partial mesh / hybrid';return'Tree / hybrid';}
function diagnostics(){const x=connected(),warnings=[],ips=new Map();if(!S.nodes.length)warnings.push('Add a device or load an example.');
if(x.online.length>1&&x.groups.length>1)warnings.push(x.groups.length+' isolated active device groups.');
const lonely=S.nodes.filter(n=>!S.edges.some(e=>e.a===n.id||e.b===n.id));if(lonely.length)warnings.push(lonely.length+' device(s) have no links.');
for(const n of S.nodes)if(n.ip){if(!validIP(n.ip))warnings.push('Invalid address on '+n.name+'.');if(ips.has(n.ip))warnings.push('Duplicate IPv4 '+n.ip+' on '+ips.get(n.ip)+' and '+n.name+'.');else ips.set(n.ip,n.name);}
const down=S.edges.filter(e=>!e.up).length;if(down)warnings.push(down+' link(s) are marked failed.');
const cards=[['Devices',S.nodes.length],['Links',S.edges.length],['Active groups',x.groups.length],['Working links',x.edges.length]];$('stats').textContent='';for(const [title,num]of cards){const box=document.createElement('div');box.className='stat';const big=document.createElement('strong');big.textContent=String(num);const small=document.createElement('small');small.textContent=title;box.append(big,small);$('stats').append(box);}
const out=$('diagnostics');out.textContent='';out.className='notice'+(warnings.length?' warn':' ok');const b=document.createElement('strong');b.textContent='Topology: '+topology(x);out.appendChild(b);
const msg=document.createElement('p');msg.textContent=warnings.length?warnings.join(' • '):'No obvious structural or IPv4 conflicts detected.';out.appendChild(msg);
const caveat=document.createElement('p');caveat.className='muted';caveat.textContent='Classification uses the active graph; a chain is not necessarily a real shared-bus network.';out.appendChild(caveat);
}
function render(){drawLayers();renderSelects();inspector();diagnostics();$('summary').textContent=S.nodes.length+' devices · '+S.edges.length+' links';$('selectedLabel').textContent=S.connecting?'Connect from '+nodeName(S.connecting):S.selected?(S.selected.kind==='node'?nodeName(S.selected.id):'Link selected'):'Nothing selected';updateUndo();}
function shortest(from,to,method){if(!getNode(from)?.online||!getNode(to)?.online)return null;const edges=liveEdges(),dist=new Map(S.nodes.map(n=>[n.id,Infinity])),prev=new Map(),used=new Set();dist.set(from,0);
while(used.size<S.nodes.length){let id=null,cost=Infinity;for(const n of S.nodes)if(!used.has(n.id)&&dist.get(n.id)<cost){cost=dist.get(n.id);id=n.id;}if(id===null)break;if(id===to)break;used.add(id);for(const e of edges){const next=e.a===id?e.b:e.b===id?e.a:null;if(!next||used.has(next))continue;const weight=method==='latency'?e.latency:1;if(cost+weight<dist.get(next)){dist.set(next,cost+weight);prev.set(next,{before:id,edgeId:e.id});}}}
if(!Number.isFinite(dist.get(to)))return null;const path=[to],edgeIds=[];let at=to;while(at!==from){const p=prev.get(at);if(!p)return null;path.unshift(p.before);edgeIds.unshift(p.edgeId);at=p.before;if(path.length>S.nodes.length+1)return null;}
const ls=edgeIds.map(getEdge);return{path,edgeIds,latency:ls.reduce((a,e)=>a+e.latency,0),bottleneck:ls.length?Math.min(...ls.map(e=>e.speed)):0,cursor:-1,done:false,failed:false};}
function findRoute(){stopPlay();const from=$('source').value,to=$('destination').value,method=$('pathMode').value;if(!from||!to||from===to){traceNote('Choose two different devices to send between.','error');return false;}const r=shortest(from,to,method);S.route=r;if(!r){$('traceLog').textContent='No path available. Check for offline devices, failed links or disconnected groups.';traceNote('No working route to that destination.','error');drawLayers();return false;}
$('traceLog').textContent='Selected '+(method==='latency'?'lowest-latency':'fewest-hop')+' path:\n'+r.path.map(nodeName).join(' → ')+'\nHops: '+r.edgeIds.length+' · Sum of link latencies: '+r.latency+' ms · Minimum link capacity: '+r.bottleneck+' Mb/s';
traceNote('Route found. Press Step or Play to send the packet.','ok');drawLayers();return true;}
function step(){if(!S.route||S.route.done){if(!findRoute())return false;}const r=S.route,ttl=clamp(Math.round(Number($('ttl').value)||16),1,64);
if(r.cursor>=ttl){r.done=true;r.failed=true;stopPlay();$('traceLog').textContent+='\nPACKET DROPPED: hop limit exhausted ('+ttl+').';traceNote('Packet dropped: it exceeded the hop limit.','error');drawLayers();return false;}
r.cursor++;if(r.cursor===0){$('traceLog').textContent+='\nPacket starts at '+nodeName(r.path[0])+' ('+clamp(Number($('packetSize').value)||2,1,1500)+' KB).';}
else $('traceLog').textContent+='\nHop '+r.cursor+': '+nodeName(r.path[r.cursor-1])+' → '+nodeName(r.path[r.cursor]);
if(r.cursor===r.path.length-1){r.done=true;stopPlay();$('traceLog').textContent+='\nDelivered. Total '+r.edgeIds.length+' hops.';traceNote('Delivered! Simplified link-delay sum: '+r.latency+' ms.','ok');}
else traceNote('Packet at '+nodeName(r.path[r.cursor])+'.');drawLayers();$('traceLog').scrollTop=$('traceLog').scrollHeight;return!r.done;}
function play(){if(S.timer!==null){stopPlay();traceNote('Playback paused.');return;}if(!S.route||S.route.done){if(!findRoute())return;}$('playBtn').textContent='Pause Ⅱ';function tick(){S.timer=null;const go=step();if(go){S.timer=setTimeout(tick,650);$('playBtn').textContent='Pause Ⅱ';}}tick();}
function resetRoute(){stopPlay();S.route=null;$('traceLog').textContent='No packet traced yet.';traceNote('Choose endpoints, then find a route.');drawLayers();}
function camera(){const width=Math.max(240,viewport.clientWidth),height=Math.max(220,viewport.clientHeight),viewW=width/S.camera.z,viewH=height/S.camera.z;S.camera.x=clamp(S.camera.x,0,Math.max(0,3000-viewW));S.camera.y=clamp(S.camera.y,0,Math.max(0,2000-viewH));svg.setAttribute('viewBox',[S.camera.x,S.camera.y,viewW,viewH].map(n=>n.toFixed(2)).join(' '));$('zoomLabel').textContent=Math.round(S.camera.z*100)+'%';}
function zoom(z,x=viewport.clientWidth/2,y=viewport.clientHeight/2){const worldX=S.camera.x+x/S.camera.z,worldY=S.camera.y+y/S.camera.z;S.camera.z=clamp(z,.38,2.5);S.camera.x=worldX-x/S.camera.z;S.camera.y=worldY-y/S.camera.z;camera();}
function fit(){const width=Math.max(300,viewport.clientWidth),height=Math.max(300,viewport.clientHeight);if(!S.nodes.length){S.camera={x:130,y:110,z:1};camera();return;}const xs=S.nodes.map(n=>n.x),ys=S.nodes.map(n=>n.y),xmin=Math.min(...xs)-190,xmax=Math.max(...xs)+190,ymin=Math.min(...ys)-140,ymax=Math.max(...ys)+140;S.camera.z=clamp(Math.min(width/(xmax-xmin),height/(ymax-ymin)),.38,1.65);S.camera.x=(xmin+xmax)/2-width/(2*S.camera.z);S.camera.y=(ymin+ymax)/2-height/(2*S.camera.z);camera();}
function pointerDown(e){if(e.pointerType==='mouse'&&e.button!==0)return;const node=e.target.closest?.('[data-node]'),edge=e.target.closest?.('[data-edge]');if(S.mode==='link'){if(node){chooseNode(node.getAttribute('data-node'));e.preventDefault();}return;}
if(S.mode==='select'&&node){const id=node.getAttribute('data-node');select('node',id);const n=getNode(id);S.drag={kind:'node',id,clientX:e.clientX,clientY:e.clientY,x:n.x,y:n.y,moved:false};}
else if(S.mode==='select'&&edge){select('edge',edge.getAttribute('data-edge'));return;}
else{if(S.mode==='select')select(null,null);S.drag={kind:'pan',clientX:e.clientX,clientY:e.clientY,x:S.camera.x,y:S.camera.y,moved:false};}
try{svg.setPointerCapture(e.pointerId);}catch(err){}e.preventDefault();}
function pointerMove(e){const d=S.drag;if(!d)return;const dx=e.clientX-d.clientX,dy=e.clientY-d.clientY;if(Math.abs(dx)+Math.abs(dy)>3)d.moved=true;
if(d.kind==='node'){const n=getNode(d.id);if(!n)return;n.x=clamp(Math.round(d.x+dx/S.camera.z),80,2920);n.y=clamp(Math.round(d.y+dy/S.camera.z),65,1930);drawLayers();}
else{S.camera.x=d.x-dx/S.camera.z;S.camera.y=d.y-dy/S.camera.z;camera();}}
function pointerUp(e){const d=S.drag;if(!d)return;S.drag=null;try{if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);}catch(err){}if(d.kind==='node'&&d.moved)commit('Device moved.');}
function keyboardCanvas(e){if(e.key!=='Enter'&&e.key!==' ')return;const n=e.target.closest?.('[data-node]'),l=e.target.closest?.('[data-edge]');if(n||l){e.preventDefault();if(n)chooseNode(n.getAttribute('data-node'));else select('edge',l.getAttribute('data-edge'));}}
function download(name,content,mime){const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.download=name;a.href=url;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1300);}
function exportSVG(){const clone=svg.cloneNode(true);clone.setAttribute('xmlns',NS);clone.setAttribute('width','1600');clone.setAttribute('height','1000');return '<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(clone);}
function validateImport(o){if(!o||o.format!=='kngs-network-v2'||!Array.isArray(o.nodes)||!Array.isArray(o.edges))throw Error('Not a Network Designer v2 file.');if(o.nodes.length>MAX_NODES||o.edges.length>MAX_LINKS)throw Error('File exceeds device or link limits.');const nodeIds=new Set(),edgeIds=new Set(),pairs=new Set();
const nodes=o.nodes.map(n=>{if(!n||typeof n.id!=='string'||nodeIds.has(n.id)||!TYPES[n.type])throw Error('Invalid or duplicate device.');nodeIds.add(n.id);return{id:n.id,type:n.type,name:String(n.name||TYPES[n.type][0]).slice(0,45),ip:String(n.ip||'').slice(0,15),online:n.online!==false,vlan:clamp(Math.round(Number(n.vlan)||1),1,4094),x:clamp(Math.round(Number(n.x)||100),80,2920),y:clamp(Math.round(Number(n.y)||100),65,1930)};});
const edges=o.edges.map(e=>{if(!e||typeof e.id!=='string'||edgeIds.has(e.id)||!nodeIds.has(e.a)||!nodeIds.has(e.b)||e.a===e.b||!MEDIUM[e.kind])throw Error('Invalid connection.');edgeIds.add(e.id);const pair=[e.a,e.b].sort().join('|');if(pairs.has(pair))throw Error('Duplicate connection.');pairs.add(pair);return{id:e.id,a:e.a,b:e.b,kind:e.kind,latency:clamp(Math.round(Number(e.latency)||2),1,10000),speed:clamp(Math.round(Number(e.speed)||1000),1,100000),up:e.up!==false,label:String(e.label||'').slice(0,28)};});
const maxId=Math.max(0,...[...nodeIds,...edgeIds].map(id=>Number(id.slice(1))).filter(Number.isFinite));return{nodes,edges,nextId:Math.max(maxId+1,Math.round(Number(o.nextId)||1),1)};}
function example(which,confirmFirst){if(confirmFirst&&S.nodes.length&&!confirm('Replace the current network with this example? Undo is available.'))return;
S.nodes=[];S.edges=[];S.selected=null;S.connecting=null;
const N=(type,x,y,name,ip)=>createNode(type,x,y,name,ip),E=(a,b,kind,delay,speed)=>createEdge(a,b,kind||'ethernet',delay,speed);
if(which==='star'){const central=N('switch',780,430,'Main switch');[N('pc',460,160,'PC 1'),N('pc',780,130,'PC 2'),N('pc',1120,180,'PC 3'),N('printer',480,710,'Printer'),N('server',1100,700,'File server')].forEach(id=>E(central,id));}
else if(which==='ring'){const ring=[];for(let i=0;i<6;i++){const angle=Math.PI*2*i/6-Math.PI/2;ring.push(N('switch',790+330*Math.cos(angle),470+285*Math.sin(angle),'Switch '+(i+1)));}ring.forEach((id,i)=>E(id,ring[(i+1)%ring.length],'fibre',2,1000));}
else if(which==='mesh'){const ns=[N('router',480,245,'Router A'),N('router',1100,245,'Router B'),N('router',480,720,'Router C'),N('router',1100,720,'Router D')];for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++)E(ns[i],ns[j],'fibre',2+j,10000);}
else if(which==='resilient'){const a=N('pc',300,450,'Source PC'),b=N('router',660,250,'Direct router'),c=N('router',660,640,'Alternate router'),d=N('switch',1010,640,'Transit switch'),e=N('server',1340,450,'Destination server');E(a,b,'ethernet',3,1000);E(b,e,'ethernet',24,1000);E(a,c,'ethernet',2,1000);E(c,d,'fibre',2,10000);E(d,e,'fibre',2,10000);E(b,d,'ethernet',8,1000);}
else if(which==='sites'){const a=N('pc',230,250,'Office PC','192.168.10.10'),b=N('switch',510,300,'Office switch'),c=N('router',820,300,'Branch router','192.168.10.1'),d=N('cloud',1110,360,'WAN'),e=N('router',1410,340,'Main router','192.168.20.1'),f=N('switch',1680,330,'Main switch'),g=N('server',1950,170,'Database','192.168.20.20'),h=N('nas',1950,560,'Backup NAS','192.168.20.21');E(a,b);E(b,c);E(c,d,'fibre',18,500);E(d,e,'fibre',21,500);E(e,f);E(f,g);E(f,h);}
else {const a=N('pc',250,230,'Classroom PC','192.168.1.21'),b=N('printer',250,540,'Office printer','192.168.1.45'),c=N('switch',570,385,'Core switch'),d=N('server',870,595,'File server','192.168.1.10'),e=N('router',890,385,'School router','192.168.1.1'),f=N('ap',950,160,'Wi-Fi access point','192.168.1.2'),g=N('laptop',1280,130,'Student laptop','192.168.1.55'),h=N('phone',1270,360,'Staff phone','192.168.1.56'),i=N('cloud',1300,630,'Internet');E(a,c);E(b,c);E(c,d,'fibre',1,10000);E(c,e);E(e,f);E(f,g,'wireless',7,150);E(f,h,'wireless',9,75);E(e,i,'fibre',12,1000);}
commit('Loaded '+({school:'School LAN',star:'Star topology',ring:'Ring topology',mesh:'Full mesh',resilient:'Redundant routes',sites:'Two-site WAN'}[which]||'School LAN')+' example.');fit();}
const challenges=[
'Load Redundant routes. Compare the fewest-hop route with the lowest-latency route. Which route changes, and why?',
'Load School LAN. Disable the link between the Core switch and School router. Can the laptop still reach the file server?',
'Build a ring of four switches. Disable one link and then two links. What happens to connectivity?',
'Give two devices the same IPv4 address. What does Network diagnostics report?',
'Build a star network. Put the central switch offline. Which connections are affected?',
'Create two disconnected groups and then join them. How do the diagnostics change?'
];
let challenge=0;
function fullToggle(){const currently=studio.classList.contains('expanded')||document.fullscreenElement===studio;if(currently){if(document.fullscreenElement===studio&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});studio.classList.remove('expanded');document.body.classList.remove('edit-full');$('fullscreenBtn').textContent='⛶ Full screen';$('fullscreenBtn').setAttribute('aria-pressed','false');}
else{studio.classList.add('expanded');document.body.classList.add('edit-full');$('fullscreenBtn').textContent='⤢ Exit full screen';$('fullscreenBtn').setAttribute('aria-pressed','true');if(studio.requestFullscreen)studio.requestFullscreen().catch(()=>{});}setTimeout(camera,90);}
function bind(){
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addDevice(b.dataset.add));
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('sample').onchange=e=>{if(e.target.value)example(e.target.value,true);e.target.value='';};
$('undoBtn').onclick=()=>undo(-1);$('redoBtn').onclick=()=>undo(1);
$('zoomOut').onclick=()=>zoom(S.camera.z/1.2);$('zoomIn').onclick=()=>zoom(S.camera.z*1.2);$('fitBtn').onclick=fit;
$('traceBtn').onclick=findRoute;$('stepBtn').onclick=step;$('playBtn').onclick=play;$('stopBtn').onclick=resetRoute;
$('saveBtn').onclick=()=>{try{localStorage.setItem(SAVE,current());note('Saved in this browser.','ok');}catch(e){note('Cannot save locally: export a JSON file instead.','error');}};
$('loadBtn').onclick=()=>{try{const raw=localStorage.getItem(SAVE);if(!raw){note('No saved network found.','error');return;}if(!confirm('Replace the current diagram with the saved network?'))return;applyState(validateImport(JSON.parse(raw)));commit('Saved network loaded.');fit();}catch(e){note('Could not load: '+e.message,'error');}};
$('exportBtn').onclick=()=>download('KNGS_network.json',JSON.stringify(JSON.parse(current()),null,2),'application/json');
$('importBtn').onclick=()=>{$('fileInput').value='';$('fileInput').click();};
$('fileInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>400000){note('File too large.','error');return;}try{const obj=validateImport(JSON.parse(await f.text()));applyState(obj);commit('JSON network imported.');fit();}catch(err){note('Import failed: '+err.message,'error');}};
$('svgBtn').onclick=()=>download('KNGS_network.svg',exportSVG(),'image/svg+xml');
$('printBtn').onclick=()=>{fit();window.print();};$('fullscreenBtn').onclick=fullToggle;
$('challengeBtn').onclick=()=>{challenge=(challenge+1)%challenges.length;$('challengeText').textContent=challenges[challenge];};
svg.addEventListener('pointerdown',pointerDown);svg.addEventListener('pointermove',pointerMove);svg.addEventListener('pointerup',pointerUp);svg.addEventListener('pointercancel',pointerUp);svg.addEventListener('keydown',keyboardCanvas);
viewport.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const r=viewport.getBoundingClientRect();zoom(S.camera.z*(e.deltaY>0?.9:1.1),e.clientX-r.left,e.clientY-r.top);},{passive:false});
document.addEventListener('keydown',e=>{const tag=e.target?.tagName?.toLowerCase();if(['input','select','textarea'].includes(tag)||e.target?.isContentEditable)return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo(e.shiftKey?1:-1);}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();undo(1);}else if(e.key==='Escape'){if(S.connecting){S.connecting=null;render();note('Connection cancelled.');}else if(studio.classList.contains('expanded'))fullToggle();}else if((e.key==='Backspace'||e.key==='Delete')&&S.selected){e.preventDefault();deleteSelected();}});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&studio.classList.contains('expanded')){studio.classList.remove('expanded');document.body.classList.remove('edit-full');$('fullscreenBtn').textContent='⛶ Full screen';$('fullscreenBtn').setAttribute('aria-pressed','false');setTimeout(camera,70);}});
if(typeof ResizeObserver!=='undefined')new ResizeObserver(camera).observe(viewport);else window.addEventListener('resize',camera);
}
function init(){bind();let restored=false;try{const saved=localStorage.getItem(STORE);if(saved){applyState(validateImport(JSON.parse(saved)));restored=true;}}catch(err){}
S.history=[current()];S.h=0;updateUndo();if(restored){render();fit();note('Previous network restored from this browser.');}else example('school',false);$('challengeText').textContent=challenges[0];setMode('select');}
init();
})();
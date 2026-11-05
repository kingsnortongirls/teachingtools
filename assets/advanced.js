(function(){
'use strict';
const $=x=>document.getElementById(x),lab=document.body.dataset.lab;
const page=(description,level,html,init)=>{ $('subtitle').textContent=description;$('level').textContent=level;$('app').innerHTML=html+'<div class="appfoot">Experiment, predict, explain, then check your answer.</div>';init() };
const btn=(id,fn)=>$(id).addEventListener('click',fn),change=(ids,fn)=>ids.forEach(x=>$(x).addEventListener('input',fn));
const table=(heads,rows)=>'<div class="tablewrap"><table><thead><tr>'+heads.map(h=>'<th>'+KNGS.esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+KNGS.esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const selection=(id,values)=>'<select id="'+id+'">'+values.map(v=>'<option value="'+v+'">'+v+'</option>').join('')+'</select>';
const output=(id)=>'<div class="output" id="'+id+'" aria-live="polite"></div>';
const size=(n)=>Number(n).toLocaleString('en-GB');
function cpu(){
page('Step through PC, MAR, MDR, CIR and accumulator changes using a simplified educational CPU.','GCSE · A Level',
'<div class="grid"><div class="panel"><h2>Program memory</h2><div class="fields"><div class="field"><label for="cpuProg">Program</label>'+selection('cpuProg',['Add two numbers','Count down','Store a result'])+'</div><button class="btn alt" id="cpuReset">Reset</button></div><div id="memory"></div><div class="row" style="margin-top:12px"><button class="btn" id="cpuStep">Next micro-step</button><button class="btn alt" id="cpuInstruction">Finish current instruction</button></div>'+output('cpuExplain')+'</div><div class="panel soft"><h2>CPU registers</h2><div class="grid" id="registers"></div><div class="notice">Simplified accumulator-based architecture. Individual real CPUs may use different registers and internal control steps. Data is held in a basic memory array.</div></div></div>',
()=>{
const progs=[['LDA 5','ADD 6','OUT','HLT','DATA 0','DATA 7','DATA 4'],['LDA 5','SUB 6','OUT','HLT','DATA 0','DATA 9','DATA 1'],['LDA 6','ADD 7','STA 8','OUT','HLT','DATA 0','DATA 12','DATA 3','DATA 0']];
let mem=[],pc=0,mar='—',mdr='—',cir='—',acc=0,phase=0,halt=false,out='—';
function render(message){$('memory').innerHTML=table(['Address','Instruction / data'],mem.map((x,i)=>[i,(i===pc?'▶ ':'')+x]));$('registers').innerHTML=Object.entries({PC:pc,MAR:mar,MDR:mdr,CIR:cir,ACC:acc,Output:out}).map(([k,v])=>'<div class="output" style="margin:0"><span class="muted">'+k+'</span><br><strong>'+KNGS.esc(v)+'</strong></div>').join('');KNGS.text('cpuExplain',message);$('cpuStep').disabled=halt;$('cpuInstruction').disabled=halt}
function reset(){mem=progs[$('cpuProg').selectedIndex].slice();pc=0;mar='—';mdr='—';cir='—';acc=0;phase=0;halt=false;out='—';render('Ready. Press Next micro-step to fetch the first instruction.')}
function step(){if(halt)return;if(phase===0){mar=pc;phase=1;render('Fetch: copy the PC address into MAR.');return}if(phase===1){mdr=mem[Number(mar)]||'HLT';pc++;phase=2;render('Fetch: memory[MAR] moves into MDR; PC increments.');return}if(phase===2){cir=mdr;phase=3;render('Decode: copy MDR into CIR. The control unit decodes the operation.');return}const [op,arg]=cir.split(' '),address=Number(arg),value=Number((mem[address]||'DATA 0').split(' ')[1]||0);if(op==='LDA')acc=value;if(op==='ADD')acc+=value;if(op==='SUB')acc-=value;if(op==='STA')mem[address]='DATA '+acc;if(op==='OUT')out=String(acc);if(op==='HLT')halt=true;phase=0;render('Execute '+cir+'. Accumulator now '+acc+(halt?'. Program halted.':'.'))}
btn('cpuStep',step);btn('cpuInstruction',()=>{if(halt)return;do{step()}while(phase!==0&&!halt)});btn('cpuReset',reset);$('cpuProg').onchange=reset;reset();
});
}
function sorting(){
page('Watch searching and sorting algorithms change a list one operation at a time.','GCSE · A Level',
'<div class="grid"><div class="panel"><h2>Algorithm visualisation</h2><div class="fields"><div class="field"><label for="algo">Algorithm</label>'+selection('algo',['Bubble sort','Insertion sort','Merge sort','Linear search','Binary search'])+'</div><div class="field"><label for="find">Search for</label><input id="find" type="number" value="37"></div></div><div class="bars" id="bars"></div><pre id="values"></pre><div class="row"><button class="btn" id="next">Next step</button><button class="btn alt" id="finish">Finish</button><button class="btn alt" id="shuffle">New numbers</button></div>'+output('sortExplain')+'</div><div class="panel soft"><h2>Comparison tracker</h2>'+output('sortCount')+'<p>Bubble sort repeatedly compares adjacent items. Insertion sort shifts larger items. Merge sort divides and merges sorted sections.</p><div class="notice">Binary search requires sorted input. The visualiser sorts its list before beginning binary search.</div></div></div>',
()=>{
let values=[64,18,91,37,50,12,73,28],frames=[],at=0;
function build(){let a=values.slice(),c=0;frames=[];const push=(msg,active=[])=>frames.push({a:a.slice(),msg,active,c});const algo=$('algo').value;const target=Number($('find').value);push('Start');if(algo==='Bubble sort'){for(let end=a.length-1;end>0;end--)for(let i=0;i<end;i++){c++;push('Compare neighbours '+i+' and '+(i+1),[i,i+1]);if(a[i]>a[i+1]){[a[i],a[i+1]]=[a[i+1],a[i]];push('Swap neighbours',[i,i+1])}}}else if(algo==='Insertion sort'){for(let i=1;i<a.length;i++){let v=a[i],j=i-1;while(j>=0){c++;push('Compare '+v+' with '+a[j],[j]);if(a[j]<=v)break;a[j+1]=a[j--];push('Shift larger element',[j+1])}a[j+1]=v;push('Insert '+v,[j+1])}}else if(algo==='Merge sort'){function merge(lo,hi){if(hi-lo<2)return;let mid=(lo+hi)>>1;merge(lo,mid);merge(mid,hi);let left=a.slice(lo,mid),right=a.slice(mid,hi),i=0,j=0,k=lo;while(i<left.length&&j<right.length){c++;a[k++]=left[i]<=right[j]?left[i++]:right[j++];push('Merge two sorted sublists',[k-1])}while(i<left.length){a[k++]=left[i++];push('Copy remaining left item',[k-1])}while(j<right.length){a[k++]=right[j++];push('Copy remaining right item',[k-1])}}merge(0,a.length)}else if(algo==='Linear search'){let found=false;for(let i=0;i<a.length;i++){c++;push('Compare '+a[i]+' to '+target,[i]);if(a[i]===target){found=true;push('Found target at index '+i,[i]);break}}if(!found)push('Target not present')}else{a.sort((x,y)=>x-y);push('Sorted list for binary search');let lo=0,hi=a.length-1,found=false;while(lo<=hi){let mid=(lo+hi)>>1;c++;push('Compare middle item '+a[mid]+' to '+target,[mid]);if(a[mid]===target){found=true;push('Found at index '+mid,[mid]);break}if(a[mid]<target)lo=mid+1;else hi=mid-1}if(!found)push('Target not present')}push('Finished');at=0;render()}
function render(){const f=frames[at];$('bars').innerHTML=f.a.map((v,i)=>'<div class="bar" title="'+v+'" style="height:'+v+'%;background:'+(f.active.includes(i)?'#dc933f':'#286dae')+'"></div>').join('');KNGS.text('values','['+f.a.join(', ')+']');KNGS.text('sortExplain','Step '+at+' of '+(frames.length-1)+': '+f.msg);KNGS.text('sortCount',f.c+' comparisons so far.');$('next').disabled=at>=frames.length-1}
btn('next',()=>{at=Math.min(at+1,frames.length-1);render()});btn('finish',()=>{at=frames.length-1;render()});btn('shuffle',()=>{values=Array.from({length:8},()=>10+Math.floor(Math.random()*85));build()});$('algo').onchange=build;$('find').onchange=build;build();
});
}
function tracing(){
page('Predict outputs, step through prepared Python traces and compare with the correct result.','KS3 · GCSE · A Level',
'<div class="grid"><div class="panel"><h2>Python exercise</h2><div class="fields"><div class="field"><label for="levelSel">Level</label>'+selection('levelSel',['KS3','GCSE','A Level'])+'</div><div class="field"><label for="exercise">Scenario</label><select id="exercise"></select></div></div><pre id="pyCode"></pre><div class="row"><button class="btn" id="step">Next trace step</button><button class="btn alt" id="complete">Run to end</button><button class="btn alt" id="restart">Restart</button></div>'+output('pyExplain')+'</div><div class="panel soft"><h2>Trace table</h2><div id="traceTable"></div><h3>Predict the printed output</h3><label for="prediction">Your prediction</label><textarea id="prediction" placeholder="Predict before executing the code."></textarea><button class="btn alt" id="check">Check prediction</button>'+output('pyFeedback')+'<div class="notice">Uses prepared Python examples and execution traces, not a real Python interpreter. This prevents students from running arbitrary scripts in the browser.</div></div></div>',
()=>{
const data={
'KS3':[{title:'Variables',code:'score = 3\nscore = score + 4\nbonus = score * 2\nprint(bonus)',trace:[['score = 3','score = 3'],['score += 4','score = 7'],['bonus = score * 2','bonus = 14'],['print(bonus)','14']],result:'14'},{title:'Selection',code:'age = 12\nif age >= 13:\n    print("Teenager")\nelse:\n    print("Under 13")',trace:[['age = 12','age = 12'],['if age >= 13','False'],['else','Take else branch'],['print(...)','Under 13']],result:'Under 13'}],
'GCSE':[{title:'FOR loop',code:'total = 0\nfor n in range(1, 5):\n    total += n\nprint(total)',trace:[['initialise','total = 0'],['n = 1','total = 1'],['n = 2','total = 3'],['n = 3','total = 6'],['n = 4','total = 10'],['print','10']],result:'10'},{title:'List',code:'scores = [8, 4, 9]\nscores[1] = scores[0] + 2\nprint(scores[1])\nprint(len(scores))',trace:[['initialise','[8, 4, 9]'],['assignment','[8, 10, 9]'],['first print','10'],['second print','3']],result:'10\n3'}],
'A Level':[{title:'Recursive factorial',code:'def fact(n):\n    if n <= 1: return 1\n    return n * fact(n-1)\nprint(fact(4))',trace:[['fact(4)','Call fact(3)'],['fact(3)','Call fact(2)'],['fact(2)','Call fact(1)'],['fact(1)','Return 1'],['fact(2)','Return 2'],['fact(3)','Return 6'],['fact(4)','Return 24'],['print','24']],result:'24'},{title:'List comprehension',code:'nums = [2, 5, 7, 8]\nresult = [x * 2 for x in nums if x % 2 == 0]\nprint(result)',trace:[['x=2','Include 4'],['x=5','Skip'],['x=7','Skip'],['x=8','Include 16'],['print','[4, 16]']],result:'[4, 16]'}]};
let item,step=0;
function setLevel(){$('exercise').innerHTML=data[$('levelSel').value].map((x,i)=>'<option value="'+i+'">'+x.title+'</option>').join('');reset()}
function reset(){item=data[$('levelSel').value][Number($('exercise').value)||0];step=0;KNGS.text('pyCode',item.code);KNGS.text('prediction','');KNGS.text('pyFeedback','');KNGS.text('pyExplain','Trace through one line or iteration at a time.');render()}
function render(){$('traceTable').innerHTML=table(['Executed code','Current state / output'],item.trace.slice(0,step));$('step').disabled=step>=item.trace.length}
function advance(){if(step>=item.trace.length)return;const [line,state]=item.trace[step++];KNGS.text('pyExplain',line+' → '+state);render()}
btn('step',advance);btn('complete',()=>{while(step<item.trace.length)advance()});btn('restart',reset);btn('check',()=>{const answer=$('prediction').value.trim();KNGS.text('pyFeedback',answer===item.result?'Correct prediction!':'Correct output: '+item.result)});$('levelSel').onchange=setLevel;$('exercise').onchange=reset;setLevel();
});
}
function logic(){
page('Build two-stage circuits with standard distinctive gate shapes, live signals and a matching truth table.','GCSE · A Level',
'<div class="grid"><div class="panel"><h2>Circuit configuration</h2><div class="fields"><div class="field"><label for="gate1">First gate (A and B)</label>'+selection('gate1',['AND','OR','XOR','NAND','NOR'])+'</div><div class="field"><label for="gate2">Second gate (first output and C)</label>'+selection('gate2',['AND','OR','XOR','NAND','NOR'])+'</div></div><div class="row" style="margin:13px 0"><label><input type="checkbox" id="A"> A</label><label><input type="checkbox" id="B"> B</label><label><input type="checkbox" id="C"> C</label><label><input type="checkbox" id="invert"> Add NOT gate to final output</label></div><svg viewBox="0 0 640 280" id="logicSvg" class="svgbox" role="img" aria-label="Two-stage logic circuit using standard gate symbols and coloured signal wires"></svg><p class="muted">Green wires carry 1 (HIGH); grey-blue wires carry 0 (LOW). Small circles at outputs mean inversion. Input and output values change with the switches.</p>'+output('logicOut')+'</div><div class="panel soft"><h2>Truth table</h2><div id="truthTable"></div><div class="notice">Uses conventional distinctive logic-gate outlines: AND has a flat left edge, OR has a curved left edge, XOR has an extra input curve, and NAND, NOR and NOT have inversion bubbles. All eight input combinations are shown.</div></div></div>',
()=>{
const NS='http://www.w3.org/2000/svg';
function op(k,a,b){return ({AND:a&&b,OR:a||b,XOR:a!==b,NAND:!(a&&b),NOR:!(a||b)})[k]}
function calc(a,b,c){const first=op($('gate1').value,a,b);let result=op($('gate2').value,first,c);return [first,$('invert').checked?!result:result]}
function add(parent,tag,attrs={},textContent){const node=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));if(textContent!==undefined)node.textContent=String(textContent);parent.appendChild(node);return node}
const colour=on=>on?'#16865c':'#7290ae';
function wire(svg,points,on){add(svg,'polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:colour(on),'stroke-width':3.6,'stroke-linecap':'round','stroke-linejoin':'round'})}
function text(svg,x,y,value,extra={}){return add(svg,'text',{x,y,fill:'#163b60','font-family':'system-ui,Arial,sans-serif','font-size':15,'font-weight':750,'text-anchor':'middle',...extra},value)}
function gate(svg,kind,x,y,inA,inB,out){
 const g=add(svg,'g',{transform:'translate('+x+' '+y+')'});
 const inverted=kind==='NAND'||kind==='NOR';
 const base=kind==='NAND'?'AND':kind==='NOR'?'OR':kind;
 const attrs={fill:'#e8f2ff',stroke:'#164d82','stroke-width':2.9,'stroke-linejoin':'round'};
 if(base==='AND')add(g,'path',{d:'M 16 4 L 50 4 A 31 31 0 0 1 50 66 L 16 66 Z',...attrs});
 else add(g,'path',{d:'M 13 4 Q 54 4 92 35 Q 54 66 13 66 Q 39 35 13 4 Z',...attrs});
 if(base==='XOR')add(g,'path',{d:'M 3 4 Q 29 35 3 66',fill:'none',stroke:'#164d82','stroke-width':2.9,'stroke-linecap':'round'});
 if(inverted)add(g,'circle',{cx:99,cy:35,r:6,fill:'#fff',stroke:'#164d82','stroke-width':2.9});
 const inputX=base==='AND'?16:27;
 const outputX=base==='AND'?81:92;
 wire(g,[[0,20],[inputX,20]],inA);
 wire(g,[[0,50],[inputX,50]],inB);
 if(inverted)wire(g,[[outputX,35],[93,35]],!out);
 const endX=inverted?105:outputX;
 return {inputX:x,upperY:y+20,lowerY:y+50,outX:x+endX,outY:y+35};
}
function draw(){
 const a=$('A').checked,b=$('B').checked,c=$('C').checked,[mid,y]=calc(a,b,c);
 const svg=$('logicSvg');svg.textContent='';
 const firstKind=$('gate1').value,secondKind=$('gate2').value;
 const g1=gate(svg,firstKind,163,47,a,b,mid);
 const g2=gate(svg,secondKind,371,117,mid,c,$('invert').checked?!y:y);
 // External input lines enter the gate bodies from the left.
 wire(svg,[[64,67],[163,67]],a);wire(svg,[[64,97],[163,97]],b);
 wire(svg,[[g1.outX,82],[326,82],[326,137],[371,137]],mid);
 wire(svg,[[64,238],[340,238],[340,167],[371,167]],c);
 const secondOut=$('invert').checked?!y:y;
 if($('invert').checked){
  wire(svg,[[g2.outX,152],[520,152]],secondOut);
  add(svg,'polygon',{points:'520,130 520,174 550,152',fill:'#e8f2ff',stroke:'#164d82','stroke-width':2.9,'stroke-linejoin':'round'});
  add(svg,'circle',{cx:557,cy:152,r:6,fill:'#fff',stroke:'#164d82','stroke-width':2.9});
  wire(svg,[[563,152],[611,152]],y);
 }else wire(svg,[[g2.outX,152],[611,152]],y);
 text(svg,34,71,'A = '+Number(a));text(svg,34,101,'B = '+Number(b));text(svg,34,242,'C = '+Number(c));
 text(svg,598,137,'Y = '+Number(y));
 text(svg,222,37,firstKind,{'font-size':12,fill:'#426a90'});
 text(svg,428,107,secondKind,{'font-size':12,fill:'#426a90'});
 if($('invert').checked)text(svg,538,117,'NOT',{'font-size':12,fill:'#426a90'});
}
function render(){
 const a=$('A').checked,b=$('B').checked,c=$('C').checked,[mid,y]=calc(a,b,c);
 KNGS.text('logicOut','Stage 1 = '+Number(mid)+' · Final output Y = '+Number(y));
 $('truthTable').innerHTML=table(['A','B','C','Stage 1','Y'],Array.from({length:8},(_,i)=>{const A=!!(i&4),B=!!(i&2),C=!!(i&1),r=calc(A,B,C);return [Number(A),Number(B),Number(C),Number(r[0]),Number(r[1])]}));
 draw();
}
['A','B','C','gate1','gate2','invert'].forEach(x=>$(x).onchange=render);render();
});
}
const functions={cpu,sorting,'python-tracing':tracing,'logic-gates':logic};
if(functions[lab])functions[lab]();
else if(window.KNGSExtra&&window.KNGSExtra[lab])window.KNGSExtra[lab]({page,table,output,selection,btn,change,size});
else $('app').textContent='This lab is not yet initialised.';
})();
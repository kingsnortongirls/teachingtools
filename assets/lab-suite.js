
(function(){'use strict';
function $(id){return document.getElementById(id)}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]})}
function store(id){var key='kngs_lab_'+id+'_v1';return {get:function(fallback){try{var data=JSON.parse(localStorage.getItem(key));return data===null?fallback:data}catch(e){return fallback}},set:function(value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}},clear:function(){try{localStorage.removeItem(key)}catch(e){}}}}
function shuffle(values){var a=values.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),v=a[i];a[i]=a[j];a[j]=v}return a}
function notice(id,message,kind){var el=typeof id==='string'?$(id):id;if(!el)return;el.className='notice '+(kind||'');el.textContent=message;el.hidden=!message}
function download(text,filename,mime){var blob=new Blob([text],{type:mime||'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1500)}
function score(id,correct,total){var el=$(id);if(el)el.textContent=String(correct)+' / '+String(total)}
window.KNGSLab={$:$,esc:esc,store:store,shuffle:shuffle,notice:notice,download:download,score:score};
})();

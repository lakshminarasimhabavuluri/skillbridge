var store={me:null,ex:[]},view='discover',open=null;
var MEMBERS=[
{id:'m1',name:'Ravi Teja',offers:['Arduino','C Programming','PCB Design'],wants:['Web Development','Git']},
{id:'m2',name:'Sneha Rao',offers:['Web Development','React','Git'],wants:['Embedded Systems','Arduino']},
{id:'m3',name:'Kiran Kumar',offers:['Python','Data Analysis'],wants:['Public Speaking','Arduino']},
{id:'m4',name:'Anusha Devi',offers:['Public Speaking','Resume Writing'],wants:['Python','Web Development']},
{id:'m5',name:'Harsha Vardhan',offers:['Embedded Systems','Verilog','MATLAB'],wants:['Resume Writing','React']},
{id:'m6',name:'Pooja Reddy',offers:['Canva Design','Video Editing'],wants:['Python','C Programming']}];
var REPLIES=['Sounds great! When are you free for a quick session?','Happy to swap. Shall we start with the basics?','I can do today evening. Does 7 PM work?','Nice! Send me what you already know so I can plan.','Perfect, let\u2019s do 30 minutes each way.'];
var bc=('BroadcastChannel' in window)?new BroadcastChannel('skillbridge'):null;
function load(){try{var s=localStorage.getItem('sb');if(s)store=JSON.parse(s)}catch(e){}}
function save(){try{localStorage.setItem('sb',JSON.stringify(store))}catch(e){}if(bc)bc.postMessage('sync')}
if(bc)bc.onmessage=function(){load();render()};
load();
function $(s){return document.querySelector(s)}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function parse(s){return s.split(',').map(function(x){return x.trim()}).filter(Boolean)}
function low(a){return a.map(function(x){return x.toLowerCase()})}
function inter(a,b){var l=low(b);return a.filter(function(x){return l.indexOf(x.toLowerCase())>-1})}
function score(m){var me=store.me;return inter(me.wants,m.offers).length+inter(me.offers,m.wants).length}
function chips(a,cls,hit){var h=low(hit||[]);return a.map(function(x){return'<span class="chip '+cls+(h.indexOf(x.toLowerCase())>-1?' hit':'')+'">'+esc(x)+'</span>'}).join('')}
function ini(n){return esc(n.trim().charAt(0).toUpperCase())}
function memberCard(m){
 var me=store.me,sc=score(m),ex=store.ex.some(function(e){return e.with===m.id});
 return'<div class="card"><div class="row"><div class="av">'+ini(m.name)+'</div><div><div class="name">'+esc(m.name)+'</div><div class="sub">Online now</div></div><div class="sp"></div>'+(sc?'<div class="score">'+sc+' match'+(sc>1?'es':'')+'</div>':'')+'</div>'+
 '<div class="swap"><div><b>Teaches</b>'+chips(m.offers,'',me.wants)+'</div><div class="br">\u21C4</div><div><b>Wants to learn</b>'+chips(m.wants,'w',me.offers)+'</div></div>'+
 '<button '+(ex?'disabled':'data-req="'+m.id+'"')+'>'+(ex?'Request sent':'Request skill swap')+'</button></div>'
}
function render(){
 var app=$('#app'),nav=$('#nav');
 if(!store.me){nav.innerHTML='';app.innerHTML='<h2>Set up your skill profile</h2><div class="card"><label for="n">Your name</label><input id="n" placeholder="e.g. Vishnu Reddy"><label for="o">Skills you can teach (comma separated)</label><input id="o" placeholder="Arduino, C Programming"><label for="w">Skills you want to learn</label><input id="w" placeholder="Web Development, Git"><button id="go">Find my matches</button></div>';
  $('#go').onclick=function(){var n=$('#n').value.trim(),o=parse($('#o').value),w=parse($('#w').value);if(!n||!o.length||!w.length){alert('Enter your name, at least one skill to teach, and one to learn.');return}store.me={name:n,offers:o,wants:w};save();render()};return}
 var pend=store.ex.reduce(function(n,e){return n+(e.unread||0)},0);
 var tabs=[['discover','Discover'],['matches','Matches'],['chat','Chats'+(pend?'<span class="badge">'+pend+'</span>':'')],['profile','Profile']];
 nav.innerHTML=tabs.map(function(t){return'<button data-v="'+t[0]+'" class="'+(view===t[0]?'on':'')+'">'+t[1]+'</button>'}).join('');
 var h='';
 if(view==='discover'){h='<h2>People to swap skills with</h2>'+MEMBERS.map(memberCard).join('')}
 else if(view==='matches'){var ms=MEMBERS.filter(function(m){return score(m)>0}).sort(function(a,b){return score(b)-score(a)});h='<h2>Your best matches</h2>'+(ms.length?ms.map(memberCard).join(''):'<div class="empty">No matches yet. Add more skills in your profile.</div>')}
 else if(view==='chat'){
  if(open){var e=store.ex.filter(function(x){return x.id===open})[0],m=MEMBERS.filter(function(x){return x.id===e.with})[0];e.unread=0;
   h='<button class="ghost" id="back">Back to chats</button><div class="card" style="margin-top:12px"><div class="row"><div class="av">'+ini(m.name)+'</div><div><div class="name">'+esc(m.name)+'</div><div class="sub">'+(e.status==='accepted'?'Swap accepted':'Waiting for reply')+'</div></div></div><div class="msgs" id="msgs" aria-live="polite">'+e.msgs.map(function(g){return'<div class="m '+(g.me?'me':'')+'">'+esc(g.t)+'<small>'+g.time+'</small></div>'}).join('')+'</div><div class="row"><input id="mi" placeholder="Type a message" style="margin:0"><button id="send">Send</button></div></div>'}
  else{h='<h2>Your swap chats</h2>'+(store.ex.length?store.ex.map(function(e){var m=MEMBERS.filter(function(x){return x.id===e.with})[0],l=e.msgs[e.msgs.length-1];return'<div class="card" data-open="'+e.id+'" style="cursor:pointer"><div class="row"><div class="av">'+ini(m.name)+'</div><div><div class="name">'+esc(m.name)+(e.unread?'<span class="badge">'+e.unread+'</span>':'')+'</div><div class="sub">'+(l?esc(l.t.slice(0,48)):'')+'</div></div><div class="sp"></div><div class="sub">'+e.status+'</div></div></div>'}).join(''):'<div class="empty">No chats yet. Send a swap request from Discover.</div>')}}
 else{h='<h2>Your profile</h2><div class="card"><div class="row"><div class="av">'+ini(store.me.name)+'</div><div class="name">'+esc(store.me.name)+'</div></div><div class="swap"><div><b>Teaches</b>'+chips(store.me.offers,'')+'</div><div class="br">\u21C4</div><div><b>Wants to learn</b>'+chips(store.me.wants,'w')+'</div></div></div><div class="card"><label for="o">Teach</label><input id="o" value="'+esc(store.me.offers.join(', '))+'"><label for="w">Learn</label><input id="w" value="'+esc(store.me.wants.join(', '))+'"><button id="sv">Save skills</button></div><button class="ghost" id="rs">Reset app</button>'}
 app.innerHTML=h;
 var ms=$('#msgs');if(ms)ms.scrollTop=ms.scrollHeight;
}
function now(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
function reply(id,first){
 setTimeout(function(){load();var e=store.ex.filter(function(x){return x.id===id})[0];if(!e)return;
  if(first)e.status='accepted';
  e.msgs.push({me:0,t:first?'Hi '+store.me.name.split(' ')[0]+'! I accepted your swap request. What would you like to learn first?':REPLIES[Math.floor(Math.random()*REPLIES.length)],time:now()});
  if(open!==id||view!=='chat')e.unread=(e.unread||0)+1;
  save();render()},first?1800:1400)}
document.addEventListener('click',function(ev){
 var t=ev.target.closest('[data-v],[data-req],[data-open],#back,#send,#sv,#rs');if(!t)return;
 if(t.dataset.v){view=t.dataset.v;open=null;render()}
 else if(t.dataset.req){var id='e'+Date.now();store.ex.push({id:id,with:t.dataset.req,status:'pending',unread:0,msgs:[{me:1,t:'Hi! I\u2019d like to swap skills with you.',time:now()}]});save();render();reply(id,true)}
 else if(t.dataset.open){open=t.dataset.open;render()}
 else if(t.id==='back'){open=null;render()}
 else if(t.id==='send'){var i=$('#mi'),v=i.value.trim();if(!v)return;var e=store.ex.filter(function(x){return x.id===open})[0];e.msgs.push({me:1,t:v,time:now()});save();render();reply(open,false)}
 else if(t.id==='sv'){var o=parse($('#o').value),w=parse($('#w').value);if(o.length&&w.length){store.me.offers=o;store.me.wants=w;save();render()}}
 else if(t.id==='rs'){if(confirm('Clear your profile and chats?')){store={me:null,ex:[]};save();view='discover';render()}}
});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='mi')$('#send').click()});
render();

'use strict';
/* CodePatch STEM volunteer mountain. Data comes from /api/hours/leaderboard and is re-fetched every 45s
   (and when the tab regains focus). When a rankings change is detected, the whole climb is rebuilt in place. */
const $=s=>document.querySelector(s),clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t,ss=t=>t*t*(3-2*t);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=t=>{const h=t/60|0,m=t%60,r=[];if(h)r.push(h+(h>1?' hours':' hour'));if(m)r.push(m+(m>1?' minutes':' minute'));return r.join(' ')||'0 minutes'};
const fmtC=t=>{const h=t/60|0,m=t%60;return h&&m?`${h}h ${m}m`:h?`${h}h`:`${m}m`};
const fmtDate=d=>new Date(d+'T00:00:00').toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});
const monthLbl=(k,long)=>new Date(k+'-01T00:00:00').toLocaleDateString([],long?{month:'long',year:'numeric'}:{month:'short'});
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),AR=1.7768331562167907,NW=1672;
const stg=$('#stage'),world=$('#world'),track=$('#track'),glow=$('#glow'),f1=$('#f1'),f2=$('#f2'),tb=$('#top'),fade=$('#fade'),meter=$('#meter'),pctEl=$('#pct'),mks=$('#mks');
const anc=e=>[.39+e*.14+.03*(1-e)*Math.sin(e*9),.885-e*.6];/* path up the mountain, in image fractions */

/* ---------- state ---------- */
let P=null,ver='',data=[],groups=[],n=0,beats=[],bEls=[],mkEls=[],K=[],topG=[],total=0,max=0,N=1,vals=[],tdefs=[];
let W0,H0,IW,IH,K0,SPAN=0,target=0,cur=0,vel=0,last=0,raf=0,mx=0,my=0,tmx=0,tmy=0,counted=0,lt='',lg='',lp=-1,lf='',gon=0;

/* ---------- content builders ---------- */
const tied=o=>data.filter(x=>x.t===o.t).length>1;
const card=o=>`<a class="card r${o.rank<4?o.rank:0}" href="#m=${o.id}" data-id="${o.id}"><div class="rk"><span>#${o.rank}</span>${[,'GOLD','SILVER','BRONZE'][o.rank]||''}${tied(o)?' TIED':''}</div><h3>${esc(o.name)}</h3><p class="hr">${fmt(o.t)}</p><div class="el"><i style="width:${Math.round(o.e*100)}%"></i></div><small>${esc(o.department.toUpperCase())}<span>ELEVATION ${Math.round(o.e*100)}%</span></small></a>`;
const heroHtml=`<p class="kick">SB CHAPTER | CODEPATCH STEM</p><h1>EVERY HOUR<br><span class="gd">TAKES YOU HIGHER.</span></h1><p class="lede">Recognizing the dedication, commitment, and contributions of our South Brunswick High School volunteers.</p><p class="cue">SCROLL TO BEGIN YOUR ASCENT <b>↓</b></p>`;
const statsHtml=()=>`<p class="kick">MIDWAY CAMP</p><h2>The climb so far</h2><div class="stats">${tdefs.map(d=>`<div class="tile"><b>0</b><span>${d[0]}</span></div>`).join('')}</div>`;
function summitHtml(){
  if(!max)return`<p class="kick" style="--k:0">BASE CAMP</p><h2 class="gd" style="--k:.5">THE MOUNTAIN AWAITS</h2><p class="sub" style="--k:1.2">No hours have been approved yet. The first volunteer to log time sets the route.</p>`;
  const names=topG.length>3?`${esc(topG[0].name)}, ${esc(topG[1].name)} &amp; ${topG.length-2} others`:topG.map(o=>esc(o.name)).join(' &amp; ');
  return`<p class="kick" style="--k:0">THE SUMMIT ACHIEVER</p><h2 class="gd" style="--k:.5">${names}</h2><p class="big" style="--k:1">${fmt(topG[0].t).toUpperCase()}</p><p class="rk1" style="--k:1.3">RANK #${topG[0].rank}</p><p class="sub" style="--k:1.7">Every hour counts. Every contribution matters. But reaching the summit takes dedication.</p>`}

/* ---------- build everything from a leaderboard payload ---------- */
function build(p){
  P=p;const s=p.stats;data=p.members.map(o=>({...o,t:o.minutes}));
  const none=!data.length;
  $('#empty').hidden=!none;track.hidden=none;meter.hidden=none;$('#statsec').hidden=none;$('#roster').hidden=none;
  if(none){$('#et').textContent='No members yet';$('#em').textContent='Check back soon. The mountain is being mapped.';$('#er').hidden=true;$('#sr').innerHTML='';return}
  total=s.totalMinutes;max=data[0].t;
  groups=[...new Set(data.map(o=>o.t))].sort((a,b)=>a-b).map(t=>data.filter(o=>o.t===t));n=groups.length;
  groups.forEach((g,i)=>{g.e=n>1?.55*g[0].t/(max||1)+.45*i/(n-1):1;g.forEach(o=>o.e=g.e)});/* elevation 0..1, ties share it */
  tdefs=[['Members',s.memberCount,v=>v],['Chapter volunteer hours',s.totalMinutes,fmtC],['Active volunteers · last '+s.activeDays+' days',s.activeVolunteers,v=>v],['Most hours by one member',s.mostActive?s.mostActive.minutes:0,fmtC]];
  vals=tdefs.map(d=>d[1]);
  const stops=groups.slice(0,-1);topG=groups[n-1];beats=[{k:'hero'}];let si=0;
  stops.forEach((g,i)=>{beats.push({k:'stop',g,side:si++%2?'R':'L'});if(i===Math.max(0,(stops.length>>1)-1))beats.push({k:'stats'})});
  beats.push({k:'summit',g:topG});N=beats.length;
  const hb=$('#beats');hb.replaceChildren();
  bEls=beats.map(b=>{const d=document.createElement('section');d.className='beat '+(b.k==='stop'?'stop '+b.side:b.k==='hero'?'hero':b.k==='stats'?'mid':'summit');d.innerHTML=b.k==='stop'?b.g.map(card).join(''):b.k==='hero'?heroHtml:b.k==='stats'?statsHtml():summitHtml();d._a=-1;hb.append(d);return d});
  if(counted)document.querySelectorAll('#beats .tile b').forEach((el,i)=>el.textContent=tdefs[i][2](vals[i]));
  $('#sr').innerHTML=data.map(o=>`<li>Rank ${o.rank}: ${esc(o.name)}, ${esc(o.department)}, ${fmt(o.t)}</li>`).join('');
  mks.replaceChildren();
  mkEls=groups.map((g,i)=>{const m=document.createElement('i');m.className='mk';m._a=anc(g.e);m._b=beats.findIndex(b=>b.g===g);m._t=i===n-1;m._s=null;m._p='';mks.append(m);return m});
  $('#rp').setAttribute('d',Array.from({length:51},(_,i)=>{const [x,y]=anc(i/50);return(i?'L':'M')+x*100+' '+y*100}).join(' '));
  renderStats();renderRoster();
  size();cur=target=clamp(scrollY/SPAN);vel=0;lt=lg='';lp=-1;draw(cur);if(!reduce.matches)fxStart();
}

/* ---------- statistics + roster sections ---------- */
function renderStats(){
  const s=P.stats,m=s.mostActive;
  $('#slead').textContent=m?`${m.name}${m.tied>1?' and '+(m.tied-1)+' other'+(m.tied>2?'s':''):''} lead${m.tied>1?'':'s'} the chapter with ${fmt(m.minutes)}.`:'No hours have been approved yet.';
  const t=[['Chapter hours',fmtC(s.totalMinutes)],['Active volunteers',s.activeVolunteers+' of '+s.memberCount],['Most active volunteer',m?esc(m.name):'None yet'],['Average per member',fmtC(s.memberCount?Math.round(s.totalMinutes/s.memberCount):0)]];
  $('#stiles').innerHTML=t.map(x=>`<div class="tile"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');
  const dm=Math.max(1,...s.departments.map(d=>d.minutes));
  $('#dept').innerHTML=s.departments.map(d=>`<li><div><b>${esc(d.name)}</b><small>${d.members} member${d.members===1?'':'s'} · avg ${fmtC(d.avgMinutes)}</small></div><div class="dbar" role="img" aria-label="${esc(d.name)}: ${fmt(d.minutes)}"><i style="--w:${Math.round(d.minutes/dm*100)}%"></i></div><span class="dh">${fmtC(d.minutes)}</span></li>`).join('');
  $('#mchart').innerHTML=bars(s.monthly,true);
}
function bars(rows,vals){const mm=Math.max(1,...rows.map(r=>r.minutes)),now=rows[rows.length-1].month;
  return rows.map(r=>`<div class="mc${r.month===now?' now':''}" title="${monthLbl(r.month,1)}: ${fmt(r.minutes)}"><div class="mb"><i style="--h:${Math.round(r.minutes/mm*100)}%"></i></div>${vals?`<em>${r.minutes?fmtC(r.minutes):''}</em>`:''}<small>${monthLbl(r.month)}</small></div>`).join('')}
function renderRoster(){
  const q=$('#rq').value.trim().toLowerCase(),sel=$('#rd'),dep=sel.value,ds=[...new Set(data.map(o=>o.department))].sort();
  if(sel.options.length!==ds.length+1||ds.some((d,i)=>sel.options[i+1].value!==d)){sel.innerHTML='<option value="">All departments</option>'+ds.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('');sel.value=ds.includes(dep)?dep:''}
  const rows=data.filter(o=>(!q||o.name.toLowerCase().includes(q))&&(!sel.value||o.department===sel.value));
  $('#rl').innerHTML=rows.length?rows.map(o=>`<li><button class="row r${o.rank<4?o.rank:0}" data-id="${o.id}"><span class="n">${o.rank}</span><span><b>${esc(o.name)}</b><small>${esc(o.department)}</small></span><span class="h">${fmtC(o.t)}</span></button></li>`).join(''):'<li class="none">No one matches that search.</li>';
}
$('#rq').addEventListener('input',renderRoster);$('#rd').addEventListener('change',renderRoster);
$('#rl').addEventListener('click',e=>{const b=e.target.closest('.row');if(b)location.hash='m='+b.dataset.id});

/* ---------- member profile ---------- */
const pf=$('#pf');
async function openProfile(id){
  const body=$('#pb');body.innerHTML='<p class="pm">Loading…</p>';if(!pf.open)pf.showModal();
  try{
    const r=await fetch('/api/hours/members/'+encodeURIComponent(id),{cache:'no-store'});if(!r.ok)throw 0;const p=await r.json(),pct=max?Math.round(p.minutes/max*100):0,rc=p.rank<4?[,'232,194,106','213,219,232','208,138,82'][p.rank]:'196,181,253';
    body.innerHTML=`<div class="pk" style="--c:${rc}"><span>#${p.rank}</span>OF ${p.of} VOLUNTEERS${p.rank<4?' · '+['','GOLD','SILVER','BRONZE'][p.rank]:''}</div><h2>${esc(p.name)}</h2><p class="pm">${esc(p.department)} department</p><p class="pbig">${fmt(p.minutes)}</p>
<div class="el"><i style="width:${pct}%"></i></div><p class="pm">${p.toNext?`${fmt(p.toNext.minutes)} behind ${esc(p.toNext.name)}, the next climber up.`:p.minutes?'At the top of the mountain.':'Log a first hour to start climbing.'}</p>
<h4>Last 12 months</h4><div class="mchart" role="img" aria-label="Monthly hours">${bars(p.monthly,false)}</div>
<h4>Volunteering history</h4>${p.history.length?`<ul class="hist">${p.history.map(h=>`<li><b>${esc(h.title)}</b><small>${fmtDate(h.date)} · ${esc(h.category)}</small><span class="h">${fmtC(h.minutes)}</span></li>`).join('')}</ul>`:'<p class="pm">No approved hours yet.</p>'}
<div class="pf-act"><a class="nb pl" href="/api/hours/members/${encodeURIComponent(p.id)}/report.csv" download>DOWNLOAD HOURS (CSV)</a></div>`;
  }catch{body.innerHTML='<p class="pm">This profile could not be loaded. It may have been removed.</p>'}
}
const fromHash=()=>{const m=/^#m=([a-f0-9]{24})$/.exec(location.hash);if(m)openProfile(m[1]);else if(pf.open)pf.close()};
addEventListener('hashchange',fromHash);
pf.addEventListener('close',()=>{if(location.hash.startsWith('#m='))history.replaceState(null,'',location.pathname+location.search)});
pf.addEventListener('click',e=>{if(e.target===pf)pf.close()});$('#pc').onclick=()=>pf.close();

/* ---------- mountain engine (camera path, glow, particles) ---------- */
function cams(){const pt=innerWidth<900;
beats.forEach(b=>{if(b.k==='hero')b.c=[.5,.52,1.05,.5,.5];
else if(b.k==='stop'){const [a,y]=anc(b.g.e);b.c=[a,y,Math.max(1.12,lerp(1.4,2.5,b.g.e)*(pt?.8:1)),pt?.5:b.side==='L'?.68:.32,pt?.3:.52]}
else if(b.k==='summit'){const [a,y]=anc(1);b.c=[a,y,pt?2.3:2.9,.5,.24]}});
beats.forEach((b,i)=>{if(b.k==='stats')b.c=beats[i-1].c.map((v,j)=>(v+beats[i+1].c[j])/2)});K=beats.map(b=>b.c)}
function size(){W0=stg.clientWidth;H0=stg.clientHeight;IW=Math.max(W0,H0*AR);IH=IW/AR;K0=IW/NW;world.style.width=NW+'px';world.style.height=NW/AR+'px';SPAN=Math.max(1,(N-1)*.9*H0);track.style.height=SPAN+1.6*H0+'px';cams();fxSize()}
const txt=(i,v)=>tdefs[i][2](v);
function count(){counted=1;const els=[...document.querySelectorAll('#beats .tile b')],t0=performance.now(),D=reduce.matches?1:1700;
(function f(now){const k=clamp((now-t0)/D),e=1-Math.pow(1-k,3);els.forEach((el,i)=>el.textContent=txt(i,Math.round(vals[i]*e)));if(k<1)requestAnimationFrame(f)})(t0)}
const cv=$('#fx'),cx=cv.getContext('2d'),stars=Array.from({length:110},()=>({x:Math.random(),y:Math.random()*.55,r:Math.random()*1.1+.4,p:Math.random()*6.3,s:.6+Math.random()*1.4}));
let FW,FH,sp=[],G=0,PX=0,PY=0,S=1,vis=1,fr=0,fl=0;
function fxSize(){const d=Math.min(devicePixelRatio||1,1.5);FW=W0;FH=H0;cv.width=FW*d;cv.height=FH*d;cx.setTransform(d,0,0,d,0,0)}
function fx(now){fr=0;const dt=Math.min(.05,(now-fl)/1e3||.016);fl=now;cx.clearRect(0,0,FW,FH);if(S<=.01&&G<=.05&&!sp.length)return;cx.globalCompositeOperation='lighter';
for(const s of stars){cx.fillStyle=`rgba(230,220,255,${S*(.4+.35*Math.sin(now/1e3*s.s+s.p))})`;cx.fillRect(s.x*FW,s.y*FH,s.r,s.r)}
if(G>.05&&!reduce.matches){if(sp.length<70&&Math.random()<G*.6)sp.push({x:PX+(Math.random()-.5)*FW*.5,y:PY+Math.random()*FH*.45+20,vx:(Math.random()-.5)*14,vy:-(18+Math.random()*40),l:0,L:2.5+Math.random()*2,r:Math.random()*1.8+.6})}
sp=sp.filter(q=>(q.l+=dt)<q.L);for(const q of sp){q.x+=q.vx*dt;q.y+=q.vy*dt;cx.fillStyle=`rgba(255,214,130,${Math.sin(Math.PI*q.l/q.L)*.85*G})`;cx.beginPath();cx.arc(q.x,q.y,q.r,0,6.3);cx.fill()}
if(vis&&!reduce.matches)fr=requestAnimationFrame(fx)}
const fxStart=()=>{if(!fr){fl=performance.now();fr=requestAnimationFrame(fx)}};
/* Catmull-Rom path through every beat's camera: no stops between beats, ends ease in and out */
function cam(u){const i=Math.min(Math.max(N-2,0),u|0),t=u-i,t2=t*t,t3=t2*t,P=j=>K[j<0?Math.min(1,N-1):j>=N?Math.max(N-2,0):j],a=P(i-1),b=P(i),c=P(i+1),d=P(i+2);return b.map((_,k)=>.5*(2*b[k]+(c[k]-a[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t2+(3*b[k]-a[k]-3*c[k]+d[k])*t3))}
function draw(p){p=clamp(p);
const u=p*(N-1),c=cam(u),z=Math.max(1.04,c[2]),Wz=IW*z,Hz=IH*z;
let tx=clamp(c[3]*W0-c[0]*Wz,W0-Wz+10,-10),ty=clamp(c[4]*H0-c[1]*Hz,H0-Hz+10,-10);tx-=mx*16;ty-=my*12;
const t=`translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${(z*K0).toFixed(4)})`;
if(t!==lt){world.style.transform=t;lt=t}
G=ss(clamp((u-(N-2.4))/1.4));S=1-clamp(u/1.2);PX=tx+.53*Wz;PY=ty+.275*Hz;
const gs=`translate3d(${PX.toFixed(0)}px,${PY.toFixed(0)}px,0)|${G.toFixed(3)}`;
if(gs!==lg){lg=gs;glow.style.transform=gs.split('|')[0];glow.style.opacity=G.toFixed(3);fade.style.opacity=G.toFixed(3)}const on=G>.02;if(on!==gon){gon=on;glow.classList.toggle('on',on)}if(!reduce.matches&&(S>.01||G>.05))fxStart();
const fs=(-p*8).toFixed(2);if(fs!==lf){lf=fs;f1.style.translate='0 '+fs+'vh';f2.style.translate='0 '+(fs*.5)+'vh'}
bEls.forEach((el,j)=>{const d=u-j,a=ss(clamp((1-Math.abs(d)/.5)*1.8));
if(Math.abs(a-el._a)>.004||(a===0&&el._a!==0)){el._a=a;el.style.setProperty('--a',a.toFixed(3));{const dd=d<0?1:-1;if(dd!==el._d){el._d=dd;el.style.setProperty('--d',dd)}}el.classList.toggle('vis',a>.01);el.classList.toggle('on',a>.4);if(beats[j].k==='stats'&&a>.5&&!counted)count()}});
mkEls.forEach(m=>{const d=u-m._b,s=d>.3?'ps':Math.abs(d)<=.3?'on':'';if(s!==m._s){m._s=s;m.className='mk'+(m._t?' top':'')+(s?' '+s:'')}const q=`translate3d(${(tx+m._a[0]*Wz).toFixed(1)}px,${(ty+m._a[1]*Hz).toFixed(1)}px,0)`;if(q!==m._p){m._p=q;m.style.transform=q}});
const pc=Math.round(p*100);if(pc!==lp){lp=pc;meter.style.setProperty('--p',p.toFixed(3));pctEl.textContent=pc+'%'}
if(reduce.matches)fx(0)}
function tick(t){raf=0;const dt=Math.min(.05,(t-last)/1e3||.016);last=t;
if(reduce.matches){cur=target;vel=0}else{/* critically damped spring: velocity stays continuous when a new wheel notch arrives */const w=2/.3,x=w*dt,ex=1/(1+x+.48*x*x+.235*x*x*x),ch=cur-target,tp=(vel+w*ch)*dt;vel=(vel-w*tp)*ex;cur=target+(ch+tp)*ex;if(Math.abs(cur-target)<3e-5&&Math.abs(vel)<1e-3){cur=target;vel=0}}
const k=1-Math.exp(-dt*3);mx+=(tmx-mx)*k;my+=(tmy-my)*k;draw(cur);
if(cur!==target||Math.abs(tmx-mx)>.002||Math.abs(tmy-my)>.002)raf=requestAnimationFrame(tick)}
const wake=()=>{if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}};
addEventListener('scroll',()=>{if(!P||track.hidden)return;target=clamp(scrollY/SPAN);tb.classList.toggle('on',scrollY>600);meter.classList.toggle('off',scrollY>SPAN+.55*H0);wake()},{passive:true});
addEventListener('pointermove',e=>{if(reduce.matches||e.pointerType==='touch'||track.hidden)return;tmx=e.clientX/innerWidth-.5;tmy=e.clientY/innerHeight-.5;wake()},{passive:true});
function refresh(){if(track.hidden)return;size();cur=target=clamp(scrollY/SPAN);vel=0;lt=lg='';draw(cur)}
addEventListener('resize',refresh);reduce.addEventListener('change',()=>{refresh();if(!reduce.matches)fxStart()});
new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&!reduce.matches)fxStart()}).observe(stg);
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.2});document.querySelectorAll('.rv').forEach(el=>io.observe(el));
const go=i=>scrollTo({top:i/(N-1)*SPAN,behavior:reduce.matches?'auto':'smooth'});
const to=id=>$(id).scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'start'});
$('#bs').onclick=()=>to('#statsec');$('#bt').onclick=()=>go(N-1);$('#br').onclick=()=>to('#roster');
tb.onclick=()=>scrollTo({top:0,behavior:reduce.matches?'auto':'smooth'});

/* ---------- loading, live refresh ---------- */
let toastT;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),3200)};
async function load(first){
  try{
    const r=await fetch('/api/hours/leaderboard',{cache:'no-store'});if(!r.ok)throw 0;const p=await r.json();
    if(p.version===ver)return;const had=!!ver;ver=p.version;build(p);if(had)toast('RANKINGS UPDATED');if(first)fromHash();
  }catch{if(first){$('#empty').hidden=false;track.hidden=true;$('#et').textContent='The trail is closed';$('#em').textContent='We could not load the leaderboard. Check your connection and try again.';$('#er').hidden=false}}
}
$('#er').onclick=()=>{$('#er').hidden=true;$('#et').textContent='Loading the mountain';$('#em').textContent='Fetching the latest rankings.';load(true)};
setInterval(()=>{if(!document.hidden)load()},45000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
load(true);

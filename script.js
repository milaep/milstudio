/* Mil Studio — page logic (rendering, slideshow, background, form). Edit content in config.js instead. */
/* ===== HELPERS ===== */
const $=s=>document.querySelector(s),C=CONFIG,ext='target="_blank" rel="noopener noreferrer"';
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const vid=u=>(/\/video\/(\d+)/.exec(u)||[])[1];
/* ===== THEME (system default, remembered choice) ===== */
const root=document.documentElement,themeBtn=$("#theme"),themeMeta=document.querySelector('meta[name="theme-color"]'),darkQ=matchMedia("(prefers-color-scheme: dark)");
const savedTheme=()=>{try{return localStorage.getItem("mil-theme")}catch{return null}};
function applyTheme(t,persist){
 const dark=t==="night";root.dataset.theme=dark?"night":"pitch";
 if(themeBtn){themeBtn.setAttribute("aria-pressed",dark);themeBtn.title=dark?"Switch to light mode":"Switch to dark mode"}
 if(themeMeta)themeMeta.content=dark?"#08120D":"#1E9E5A";
 if(persist){try{localStorage.setItem("mil-theme",dark?"night":"pitch")}catch{}}
}
const storedTheme=savedTheme();
applyTheme((storedTheme==="night"||storedTheme==="pitch")?storedTheme:(darkQ.matches?"night":"pitch"),false);
if(themeBtn)themeBtn.addEventListener("click",()=>applyTheme(root.dataset.theme==="night"?"pitch":"night",true));
if(darkQ.addEventListener)darkQ.addEventListener("change",e=>{if(!savedTheme())applyTheme(e.matches?"night":"pitch",false)});

/* ===== STATIC CONTENT ===== */
$("#loc").textContent=C.location;$("#name").textContent=C.name;$("#bio").textContent=C.bio;
$("#tt").href=C.tiktok;$("#more").href=C.tiktok;$("#yr").textContent=new Date().getFullYear();
$("#feat").innerHTML=`<div class="thumb feat" id="featbox">${C.team.map((s,i)=>`<div class="slide${i?"":" on"}" aria-hidden="${i?"true":"false"}">${s.image?`<img src="${esc(s.image)}" alt="${esc(s.title)}" loading="lazy">`:`<i></i><span class="ph">Image ${i+1} · placeholder</span>`}<div class="ov"><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div></div>`).join("")}<span class="tagt">Favorite team</span><div class="pills" aria-label="Slides">${C.team.map((s,i)=>`<button class="pl${i?"":" on"}" data-i="${i}" aria-label="Show slide ${i+1}"></button>`).join("")}</div></div>`;
const handle=(C.tiktok.match(/@[A-Za-z0-9._]+/)||["@m1l.aep"])[0];
$("#strip").innerHTML=C.projects.map((p,i)=>`<a class="gitem" href="${esc(p.url)}" ${ext} draggable="false"${vid(p.url)?` data-vid="${vid(p.url)}"`:""} aria-label="Watch edit ${i+1} by ${esc(handle)} on TikTok"><div class="gthumb">${p.thumb?`<img src="${esc(p.thumb)}" alt="" loading="lazy" draggable="false">`:`<span class="gph" aria-hidden="true">▶</span>`}</div><span class="gplay" aria-hidden="true">▶</span><span class="gby">by ${esc(handle)}</span></a>`).join("");
$("#dock").innerHTML=C.resources.concat(C.socials.map(s=>({icon:s.icon,title:s.label,url:s.url}))).map(r=>`<a class="ic" href="${esc(r.url)}" ${ext} aria-label="${esc(r.title)}" title="${esc(r.title)}">${ico(r.icon)}</a>`).join("");
$("#det").innerHTML=C.resources.map(r=>`<a class="card res" href="${esc(r.url)}" ${ext}><div class="e" aria-hidden="true">${ico(r.icon)}</div><div><b>${esc(r.title)}</b><span>${esc(r.desc)}</span></div><span class="go" aria-hidden="true">→</span></a>`).join("");
$("#showd").onclick=function(){const o=$("#det").classList.toggle("open");this.setAttribute("aria-expanded",o);this.textContent=o?"Hide details":"Show details"};
$("#ci").innerHTML=`<div class="crow"><em>✉</em><a href="mailto:${esc(C.email)}">${esc(C.email)}</a></div>`+C.socials.map(s=>`<div class="crow"><em>${ico(s.icon)}</em><a href="${esc(s.url)}" ${ext}>${esc(s.label)}</a></div>`).join("")+C.resources.filter(r=>/Discord|Telegram/.test(r.title)).map(r=>`<div class="crow"><em>${ico(r.icon)}</em><a href="${esc(r.url)}" ${ext}>${esc(r.title)}</a></div>`).join("");
/* ===== GALLERY SCROLL (buttons, drag, keyboard) ===== */
const strip=$("#strip"),gp=$("#gprev"),gn=$("#gnext");
const gstep=()=>((strip.querySelector(".gitem")||{}).offsetWidth||180)+16;
const gsmooth=reduce?"auto":"smooth";
function navState(){if(!strip)return;const max=strip.scrollWidth-strip.clientWidth-2;gp.disabled=strip.scrollLeft<=2;gn.disabled=strip.scrollLeft>=max}
if(strip&&gp&&gn){
 gp.onclick=()=>strip.scrollBy({left:-gstep()*2,behavior:gsmooth});
 gn.onclick=()=>strip.scrollBy({left:gstep()*2,behavior:gsmooth});
 strip.addEventListener("scroll",navState,{passive:true});
 addEventListener("resize",navState);
 strip.addEventListener("keydown",e=>{const k=e.key;if(k==="ArrowRight"||k==="ArrowLeft"){e.preventDefault();strip.scrollBy({left:(k==="ArrowRight"?1:-1)*gstep(),behavior:gsmooth})}else if(k==="Home"){e.preventDefault();strip.scrollTo({left:0,behavior:gsmooth})}else if(k==="End"){e.preventDefault();strip.scrollTo({left:strip.scrollWidth,behavior:gsmooth})}});
 let dx0=null,sl=0,moved=false;
 strip.addEventListener("pointerdown",e=>{delete strip.dataset.suppress;if(e.pointerType!=="mouse"||e.button!==0)return;dx0=e.clientX;sl=strip.scrollLeft;moved=false});
 strip.addEventListener("pointermove",e=>{if(dx0==null)return;const dx=e.clientX-dx0;
  if(!moved&&Math.abs(dx)>5){moved=true;strip.classList.add("drag");try{strip.setPointerCapture(e.pointerId)}catch{}}
  if(moved){e.preventDefault();strip.scrollLeft=sl-dx}});
 const endDrag=e=>{if(dx0==null)return;const was=moved;dx0=null;moved=false;strip.classList.remove("drag");try{strip.releasePointerCapture(e.pointerId)}catch{}
  if(was){strip.dataset.suppress="1";setTimeout(()=>delete strip.dataset.suppress,350)}};
 strip.addEventListener("pointerup",endDrag);strip.addEventListener("pointercancel",endDrag);
 strip.addEventListener("click",e=>{if(strip.dataset.suppress){e.preventDefault();e.stopPropagation()}},true);
 navState();
}
/* ===== STATS + CHARTS ===== */
/* Data comes from data/stats.json: {"updated":"YYYY-MM-DD","history":[{"date":"YYYY-MM-DD","followers":N,"views":N}, ...]}
   (running totals, one row per day). Views chart = views gained per day (per week in Year); followers chart = running total. */
let rng="year",HIST=[],PREVIEW=false;
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmt=n=>n==null?"—":n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(Math.round(n));
const nice=x=>{const e=Math.pow(10,Math.floor(Math.log10(x))),f=x/e;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e};
const fdate=t=>`${t.getDate()} ${MON[t.getMonth()]} ${t.getFullYear()}`;
function series(key,gain){
 const h=HIST.filter(r=>typeof r[key]==="number"&&r.date).map(r=>({t:new Date(r.date+"T00:00:00"),v:r[key]})).sort((a,b)=>a.t-b.t);
 let s=gain?h.slice(1).map((p,i)=>({t:p.t,v:Math.max(0,p.v-h[i].v)})):h;
 const cut=Date.now()-{day:7,month:30,year:365}[rng]*864e5;s=s.filter(p=>p.t.getTime()>=cut);
 if(rng==="year"&&s.length>60){const b=[];s.forEach((p,i)=>{if(i%7===0)b.push({t:p.t,v:0});const q=b[b.length-1];q.v=gain?q.v+p.v:p.v});b.wk=true;s=b}
 return s}
/* Placeholder points carry dates too, so axes and the tooltip still look right without data. */
function placeholder(up){
 const now=new Date(),n=rng==="day"?7:rng==="month"?30:12,a=[];let s=(up?7:3)*9301;
 for(let i=0;i<n;i++){s=(s*49297+233280)%233280;const t=new Date(now);
  if(rng==="year")t.setMonth(now.getMonth()-(n-1-i),1);else t.setDate(now.getDate()-(n-1-i));
  a.push({t,v:8+(up?i/n*6:0)+(s/233280)*4});
 }
 return a}
function curve(P){let d=`M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;for(let i=0;i<P.length-1;i++){const a=P[i-1]||P[i],b=P[i],c=P[i+1],e=P[i+2]||c;d+=` C${(b[0]+(c[0]-a[0])/6).toFixed(1)} ${(b[1]+(c[1]-a[1])/6).toFixed(1)} ${(c[0]-(e[0]-b[0])/6).toFixed(1)} ${(c[1]-(e[1]-b[1])/6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`}return d}
function draw(el,label,key,gain,up,total){
 const s=series(key,gain),real=s.length>1,pts=real?s:placeholder(up);
 const W=Math.max(220,(el.clientWidth||320)-48),H=168,M={l:4,r:46,t:10,b:26};
 const vals=pts.map(p=>p.v),mx=Math.max(...vals),mn=gain?0:Math.min(...vals);
 const step=nice(((mx-mn)||1)/2),lo=gain?0:Math.floor(mn/step)*step;let hi=Math.ceil(mx/step)*step;if(hi<=lo)hi=lo+step;
 const ticks=[];for(let v=lo;v<=hi+step/1e6;v+=step)ticks.push(v);
 const X=i=>M.l+i*(W-M.l-M.r)/(pts.length-1),Y=v=>M.t+(H-M.t-M.b)*(1-(v-lo)/(hi-lo));
 const P=pts.map((p,i)=>[X(i),Y(p.v)]),d=curve(P),n=pts.length,gid="g"+(up?1:0);
 let grid="",xl="",prev=-99;
 ticks.forEach((v,i)=>{grid+=`<line class="gl" x1="${M.l}" x2="${W-M.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/>`+(i===0||i===ticks.length-1?`<text class="ax" x="${W-M.r+6}" y="${(Y(v)+3).toFixed(1)}">${fmt(v)}</text>`:"")});
 pts.forEach((p,i)=>{const t=p.t;let txt=null;
  if(rng==="year"){if(i===0||t.getMonth()!==pts[i-1].t.getMonth())txt=MON[t.getMonth()]}
  else if(rng==="month"){if(i===0||i===n-1||i%Math.ceil(n/5)===0)txt=`${t.getDate()} ${MON[t.getMonth()]}`}
  else txt=WD[t.getDay()];
  if(txt&&X(i)-prev>=(rng==="year"?26:34)){prev=X(i);const anc=i===0?"start":i===n-1?"end":"middle";xl+=`<text class="ax" x="${X(i).toFixed(1)}" y="${H-5}" text-anchor="${anc}">${txt}</text>`}});
 el.innerHTML=`<div class="lb">${label}</div><div class="v">${fmt(total)}</div><div class="cw"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label} chart"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--acc)" stop-opacity=".16"/><stop offset="1" stop-color="var(--acc)" stop-opacity="0"/></linearGradient></defs>${grid}${xl}<path d="${d} L${X(n-1).toFixed(1)} ${H-M.b} L${X(0).toFixed(1)} ${H-M.b}Z" fill="url(#${gid})"/><path class="l" pathLength="1000" d="${d}"/><circle class="dot" r="4" cx="-10" cy="-10"/></svg><div class="tip"></div></div>`;
 const sv=el.querySelector("svg"),tip=el.querySelector(".tip"),dot=el.querySelector(".dot");
 const showPoint=i=>{i=Math.max(0,Math.min(n-1,i));
  dot.setAttribute("cx",P[i][0]);dot.setAttribute("cy",P[i][1]);dot.style.opacity=1;
  tip.innerHTML=`<b>${pts.wk&&gain?"Week of ":""}${fdate(pts[i].t)}</b>${Math.round(pts[i].v).toLocaleString("en-US")}`;
  const below=P[i][1]<H/2+10;
  tip.classList.toggle("above",!below);
  tip.style.left=Math.max(46,Math.min(W-46,P[i][0]))+"px";
  tip.style.top=(below?P[i][1]+10:P[i][1]-58)+"px";
  tip.classList.add("on")};
 const pick=e=>{const r=sv.getBoundingClientRect();showPoint(Math.round((e.clientX-r.left-M.l)/(W-M.l-M.r)*(n-1)))};
 sv.addEventListener("pointermove",pick);sv.addEventListener("pointerdown",pick);
 sv.addEventListener("pointerleave",()=>showPoint(n-1));
 showPoint(n-1);
 el.classList.remove("in");void el.offsetWidth;el.classList.add("in")}
function renderStats(){const L=HIST[HIST.length-1]||{};
 const badge=$("#pbadge");if(badge)badge.hidden=!PREVIEW;
 draw($("#c1"),"Views","views",true,false,L.views);draw($("#c2"),"Followers","followers",false,true,L.followers)}
$("#pn").textContent="TikTok";
$("#seg").innerHTML=["day","month","year"].map(r=>`<button data-r="${r}" aria-pressed="${r===rng}">${r[0].toUpperCase()+r.slice(1)}</button>`).join("");
$("#seg").onclick=e=>{const b=e.target.closest("button");if(!b)return;rng=b.dataset.r;document.querySelectorAll("#seg button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderStats()};
let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(renderStats,200)});
renderStats();
(function(){const u=C.stats&&C.stats.dataUrl;if(!u)return;
 const settotal=j=>{if(j.updated)$("#pn").innerHTML=`TikTok <small>updated ${esc(fdate(new Date(j.updated+"T00:00:00")))}</small>`};
 const demo=()=>{const d=C.stats&&C.stats.demoUrl;if(!d)return;
  fetch(d,{cache:"no-cache"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{HIST=Array.isArray(j.history)?j.history:[];PREVIEW=HIST.length>1;renderStats()}).catch(()=>{})};
 fetch(u,{cache:"no-cache"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{HIST=Array.isArray(j.history)?j.history:[];
  if(HIST.length<2){demo();return}
  PREVIEW=false;settotal(j);renderStats()}).catch(demo)})();
/* ===== NAV + REVEAL ===== */
const bg=$("#burger"),nl=$("#nl");bg.onclick=()=>{const o=nl.classList.toggle("open");bg.setAttribute("aria-expanded",o)};
nl.querySelectorAll("a").forEach(a=>a.onclick=()=>{nl.classList.remove("open");bg.setAttribute("aria-expanded",false)});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll(".rv:not(.in)").forEach(el=>io.observe(el));
/* ===== INTERACTIVE BACKGROUND ===== */
if(!reduce&&matchMedia("(hover:hover) and (pointer:fine)").matches){
 const sp=$("#spot"),pt=$("#pitch");let mx=innerWidth/2,my=innerHeight/3,x=mx,y=my,gx=0,gy=0;
 addEventListener("pointermove",e=>{mx=e.clientX;my=e.clientY},{passive:true});
 (function f(){x+=(mx-x)*.08;y+=(my-y)*.08;gx+=((mx/innerWidth-.5)*-30-gx)*.05;gy+=((my/innerHeight-.5)*-30-gy)*.05;
  sp.style.transform=`translate3d(${x}px,${y}px,0)`;pt.style.transform=`translate3d(${gx}px,${gy}px,0)`;requestAnimationFrame(f)})();
}else{$("#spot").style.cssText+=";left:50%;top:25%"}
const fb=$("#featbox"),sls=fb?[...fb.querySelectorAll(".slide")]:[],pls=fb?[...fb.querySelectorAll(".pl")]:[];let fi=0,ft;
function go(n){if(!sls.length)return;fi=(n+sls.length)%sls.length;sls.forEach((s,i)=>{s.classList.toggle("on",i===fi);s.setAttribute("aria-hidden",i!==fi)});pls.forEach((p,i)=>p.classList.toggle("on",i===fi))}
function play(){clearInterval(ft);if(!reduce&&sls.length>1)ft=setInterval(()=>go(fi+1),5000)}
if(fb){pls.forEach(p=>p.onclick=()=>{go(+p.dataset.i);play()});fb.onclick=e=>{if(!e.target.closest(".pl")){go(fi+1);play()}};fb.onmouseenter=()=>clearInterval(ft);fb.onmouseleave=play}
play();
/* ===== VIDEO PREVIEW (TikTok embed, loads only on click) ===== */
const md=$("#md"),mf=$("#mf");
function closeM(){md.classList.remove("open");mf.removeAttribute("src")}
document.addEventListener("click",e=>{const a=e.target.closest("a[data-vid]");if(a){e.preventDefault();mf.src="https://www.tiktok.com/embed/v2/"+a.dataset.vid;$("#mo").href=a.href;md.classList.add("open");$("#mx").focus();return}if(e.target.id==="md"||e.target.id==="mx")closeM()});
addEventListener("keydown",e=>{if(e.key==="Escape")closeM()});
/* ===== CONTACT FORM (mailto fallback) ===== */
$("#form").addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);
 location.href=`mailto:${C.email}?subject=${encodeURIComponent("Message from "+d.get("name"))}&body=${encodeURIComponent(d.get("message")+"\n\n— "+d.get("name")+" ("+d.get("email")+")")}`});

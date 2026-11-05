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
 if(themeMeta)themeMeta.content=dark?"#09090B":"#FBFCFE";
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
$("#dock").innerHTML=C.resources.filter(r=>r.dock!==false).concat(C.socials.map(s=>({icon:s.icon,title:s.label,url:s.url}))).map(r=>`<a class="ic" href="${esc(r.url)}" ${ext} aria-label="${esc(r.title)}" title="${esc(r.title)}">${ico(r.icon)}</a>`).join("");
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
/* ===== STATISTICS (edit the numbers in config.js) ===== */
const SIC={
 followers:'<circle cx="9.5" cy="8" r="3.2"/><path d="M4 19c0-3 2.4-4.8 5.5-4.8S15 16 15 19"/><path d="M16.2 5.3a3.2 3.2 0 0 1 0 5.6M17.6 14.6c2 .7 3.2 2.3 3.2 4.4"/>',
 following:'<circle cx="8.6" cy="8" r="3.2"/><path d="M3.4 19c0-3 2.3-4.8 5.2-4.8 1.1 0 2.1.25 2.9.72"/><path d="M14.8 15.6h5.4M18.1 13.3l2.3 2.3-2.3 2.3"/>',
 likes:'<path d="M12 19.6C8.2 17.1 4.8 14.1 4.8 10.7A3.7 3.7 0 0 1 12 8.4a3.7 3.7 0 0 1 7.2 2.3c0 3.4-3.4 6.4-7.2 8.9Z"/>',
 videos:'<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M10.2 9.6v4.8l4.2-2.4-4.2-2.4Z"/>',
 views:'<path d="M2.8 12S6.4 6.6 12 6.6 21.2 12 21.2 12 17.6 17.4 12 17.4 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.5"/>'
};
const shortStat=n=>n==null?"—":n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(Math.round(n));
const fullStat=n=>n==null?"—":Math.round(n).toLocaleString("en-US");
/* Every tile counts up once, together, when the section is first seen. */
function countUp(box){
 if(!box)return;
 const els=[...box.querySelectorAll(".n")].filter(e=>e.dataset.v!=="");
 if(!els.length)return;
 if(reduce){els.forEach(e=>{e.textContent=shortStat(+e.dataset.v)});return}
 /* The final value is already in the DOM, so a throttled or missing frame never leaves a wrong number. */
 const to=els.map(e=>+e.dataset.v),t0=performance.now(),dur=1100;
 const tick=t=>{
  const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
  els.forEach((el,i)=>{el.textContent=shortStat(p<1?to[i]*e:to[i])});
  if(p<1)requestAnimationFrame(tick);
 };
 requestAnimationFrame(tick);
}
/* Start on load when the tiles are already on screen, otherwise the moment they scroll in. */
function startCount(box){
 if(!box||box.dataset.counted)return;
 box.dataset.counted="1";
 const r=box.getBoundingClientRect();
 if(r.top<innerHeight&&r.bottom>0){countUp(box);return}
 if(!("IntersectionObserver"in window)){countUp(box);return}
 const io=new IntersectionObserver((es,o)=>es.forEach(en=>{if(en.isIntersecting){o.disconnect();countUp(box)}}),{threshold:.2});
 io.observe(box);
}
function renderStats(){
 const S=C.stats||{},box=$("#stats");if(!box)return;
 const items=(S.items||[]).filter(i=>i&&i.label);
 box.innerHTML=items.map(i=>`<div class="stat"><span class="k">${esc(i.label)}</span>${SIC[i.icon]?`<svg class="si" viewBox="0 0 24 24" aria-hidden="true">${SIC[i.icon]}</svg>`:""}<span class="n" data-v="${i.value==null?"":esc(i.value)}" title="${esc(fullStat(i.value))}" aria-label="${esc(fullStat(i.value)+" "+i.label)}">${shortStat(i.value)}</span></div>`).join("")
  +`<p class="stat-foot">${S.updated?`<span>Updated ${esc(S.updated)}</span>`:""}${S.profile?`<a href="${esc(S.profile)}" ${ext}>View profile<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></a>`:""}</p>`;
 startCount(box);
}
renderStats();
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
let mdTrigger=null;
const outside=()=>[...document.body.children].filter(el=>el!==md);
function openM(a){
 mdTrigger=a;mf.src="https://www.tiktok.com/embed/v2/"+a.dataset.vid;$("#mo").href=a.href;
 md.classList.add("open");
 /* Everything behind the dialog becomes inert, so Tab and screen readers stay inside it. */
 outside().forEach(el=>el.setAttribute("inert",""));
 $("#mx").focus();
}
function closeM(){
 if(!md.classList.contains("open"))return;
 md.classList.remove("open");mf.removeAttribute("src");
 outside().forEach(el=>el.removeAttribute("inert"));
 if(mdTrigger){mdTrigger.focus({preventScroll:true});mdTrigger=null}
}
document.addEventListener("click",e=>{const a=e.target.closest("a[data-vid]");if(a){e.preventDefault();openM(a);return}if(e.target.id==="md"||e.target.id==="mx")closeM()});
addEventListener("keydown",e=>{
 if(!md.classList.contains("open"))return;
 if(e.key==="Escape"){closeM();return}
 /* Fallback for browsers without `inert`: keep Tab inside the dialog. */
 if(e.key==="Tab"){
  const f=[...md.querySelectorAll('a[href],button,iframe,input,[tabindex]:not([tabindex="-1"])')];
  if(!f.length)return;
  const first=f[0],last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }
});
/* ===== CONTACT FORM (mailto fallback) ===== */
$("#form").addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);
 location.href=`mailto:${C.email}?subject=${encodeURIComponent("Message from "+d.get("name"))}&body=${encodeURIComponent(d.get("message")+"\n\n— "+d.get("name")+" ("+d.get("email")+")")}`});

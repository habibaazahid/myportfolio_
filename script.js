/* 1 ── PAGE LOAD */
addEventListener('load', () => document.body.classList.add('go'));

/* 2 ── PARTICLE CANVAS */
!(function(){
  const cvs = document.getElementById('bg-canvas');
  const ctx = cvs.getContext('2d');
  let W, H, mouse={x:-9999,y:-9999};
  const resize=()=>{W=cvs.width=innerWidth;H=cvs.height=innerHeight;};
  resize(); addEventListener('resize',resize);
  addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  const COLS=['91,168,255','167,139,250','45,212,191','244,114,182'];
  class P{
    reset(){
      this.x=this.ox=Math.random()*W; this.y=this.oy=Math.random()*H;
      this.vx=(Math.random()-.5)*.18; this.vy=(Math.random()-.5)*.18;
      this.r=Math.random()*1.1+.3; this.a=Math.random()*.22+.06;
      this.col=COLS[Math.floor(Math.random()*4)];
    }
    constructor(){this.reset();}
    step(){
      const dx=this.x-mouse.x,dy=this.y-mouse.y,d=Math.hypot(dx,dy);
      if(d<90){this.x+=dx/d*1.5;this.y+=dy/d*1.5;}
      else{this.x+=(this.ox-this.x)*.02;this.y+=(this.oy-this.y)*.02;}
      this.ox+=this.vx;this.oy+=this.vy;
      if(this.ox<0||this.ox>W)this.vx*=-1;
      if(this.oy<0||this.oy>H)this.vy*=-1;
    }
    draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle=`rgba(${this.col},${this.a})`;ctx.fill();}
  }
  const pts=Array.from({length:75},()=>new P());
  const connect=()=>{
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
      if(d<105){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(91,168,255,${.032*(1-d/105)})`;ctx.lineWidth=.5;ctx.stroke();}
    }
  };
  (function loop(){ctx.clearRect(0,0,W,H);pts.forEach(p=>{p.step();p.draw();});connect();requestAnimationFrame(loop);})();
})();

/* 3 ── SCROLL PROGRESS */
const prog=document.getElementById('prog');
addEventListener('scroll',()=>prog.style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%',{passive:true});

/* 4 ── CUSTOM CURSOR */
const cur=document.getElementById('cur'),ring=document.getElementById('ring');
let cx=0,cy=0,rx=0,ry=0;
const isD=matchMedia('(hover:hover) and (pointer:fine)').matches;
if(isD){
  addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;cur.style.left=cx+'px';cur.style.top=cy+'px';trail(cx,cy);});
  (function rloop(){rx+=(cx-rx)*.12;ry+=(cy-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(rloop);})();
  addEventListener('mousedown',()=>cur.style.transform='translate(-50%,-50%) scale(.45)');
  addEventListener('mouseup',  ()=>cur.style.transform='translate(-50%,-50%) scale(1)');
  document.querySelectorAll('a,button,.tag,.scard,.cc,.pjc,.skg,.tab,.rw,.h-sc,.cemail,.slink').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cur.classList.add('hov');ring.classList.add('hov');});
    el.addEventListener('mouseleave',()=>{cur.classList.remove('hov');ring.classList.remove('hov');});
  });
}

/* 5 ── CURSOR SPARKLE TRAIL */
const TC=['rgba(91,168,255,.7)','rgba(167,139,250,.65)','rgba(45,212,191,.65)','rgba(244,114,182,.6)'];
let tc=0;
function trail(x,y){
  if(tc++%3!==0)return;
  const el=document.createElement('div');
  const s=Math.random()*4+2;
  el.style.cssText=`position:fixed;pointer-events:none;z-index:9997;border-radius:50%;left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${TC[tc%4]};transform:translate(-50%,-50%);transition:all .6s ease;`;
  document.body.appendChild(el);
  requestAnimationFrame(()=>{el.style.opacity='0';el.style.transform=`translate(-50%,-50%) scale(0) translateY(-${Math.random()*14+6}px)`;});
  setTimeout(()=>el.remove(),660);
}

/* 6 ── HAMBURGER + MOBILE MENU */
const bgrr=document.getElementById('bgrr');
const mnav=document.getElementById('mnav');
const nav=document.getElementById('nav');
bgrr.addEventListener('click',()=>{
  bgrr.classList.toggle('x');mnav.classList.toggle('open');
  document.body.style.overflow=mnav.classList.contains('open')?'hidden':'';
});
mnav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{bgrr.classList.remove('x');mnav.classList.remove('open');document.body.style.overflow='';}));

/* 7 ── NAV SHRINK + SMART HIDE + ACTIVE LINKS */
const secs=document.querySelectorAll('section[id]');
const dlinks=document.querySelectorAll('.nlinks a');
const mlinks=document.querySelectorAll('#mnav a:not(.mcta)');
let prev=0,nhide=false;
addEventListener('scroll',()=>{
  const sy=scrollY;
  nav.classList.toggle('on',sy>50);
  if(sy>350){
    if(sy-prev>8&&!nhide){nav.classList.add('hide');nhide=true;}
    else if(prev-sy>8&&nhide){nav.classList.remove('hide');nhide=false;}
  } else {nav.classList.remove('hide');nhide=false;}
  prev=sy;
  let active='';
  secs.forEach(s=>{if(sy>=s.offsetTop-240)active=s.id;});
  [...dlinks,...mlinks].forEach(a=>a.classList.toggle('lit',a.getAttribute('href')==='#'+active));
},{passive:true});

/* 8 ── SCROLL REVEAL */
const ro=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{if(e.isIntersecting)setTimeout(()=>e.target.classList.add('in'),i*80);});
},{threshold:.08});
document.querySelectorAll('.rv,.rx,.tle').forEach(el=>ro.observe(el));
const tlo=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{if(e.isIntersecting)setTimeout(()=>e.target.classList.add('in'),i*140);});
},{threshold:.12});
document.querySelectorAll('.tle').forEach(el=>tlo.observe(el));

/* 9 ── SKILL TABS */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
    document.querySelectorAll('.pan').forEach(p=>p.classList.remove('on'));
    tab.classList.add('on');
    document.getElementById('p-'+tab.dataset.p).classList.add('on');
    if(tab.dataset.p==='fe')setTimeout(animBars,60);
  });
});

/* 10 ── SKILL BARS */
let bA=false;
function animBars(){
  document.querySelectorAll('.bfill').forEach(b=>{b.style.width='0';setTimeout(()=>b.style.width=b.dataset.w+'%',60);});
}
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!bA){bA=true;animBars();}},{threshold:.3}).observe(document.getElementById('sbars'));

/* 11 ── RINGS ANIMATION */
let rA=false;
new IntersectionObserver(e=>{
  if(e[0].isIntersecting&&!rA){rA=true;
    document.querySelectorAll('.rfg').forEach(r=>r.style.strokeDashoffset=(226-parseInt(r.dataset.v)).toString());
  }
},{threshold:.3}).observe(document.getElementById('rings'));

/* 12 ── DUAL TYPING */
[
  {el:document.getElementById('code-ty'), words:['"React"','"Next.js"','"TypeScript"','"Node.js"'], spd:80},
  {el:document.getElementById('term-ty'), words:['→ React components','→ CSS animations','→ MERN stack apps','→ Responsive layouts'], spd:62},
].forEach(({el,words,spd})=>{
  if(!el)return;
  let wi=0,ci=0,del=false;
  const run=()=>{
    const w=words[wi];
    if(!del){el.textContent=w.slice(0,++ci);if(ci===w.length){del=true;setTimeout(run,1900);return;}}
    else{el.textContent=w.slice(0,--ci);if(ci===0){del=false;wi=(wi+1)%words.length;}}
    setTimeout(run,del?34:spd);
  };
  run();
});

/* 13 ── 3D TILT STAT CARDS */
document.querySelectorAll('.scard,.h-sc').forEach(card=>{
  card.addEventListener('mouseenter',()=>card.style.transition='border-color .3s');
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(480px) rotateX(${-y*12}deg) rotateY(${x*12}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave',()=>{card.style.transform='';card.style.transition='transform .5s var(--spring),border-color .3s,background .3s';});
});

/* 14 ── CARD GLOW TRACKING */
document.querySelectorAll('.pjc,.skg').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.setProperty('--px',((e.clientX-r.left)/r.width*100)+'%');
    card.style.setProperty('--py',((e.clientY-r.top)/r.height*100)+'%');
    card.style.setProperty('--gx',((e.clientX-r.left)/r.width*100)+'%');
    card.style.setProperty('--gy',((e.clientY-r.top)/r.height*100)+'%');
  });
});

/* 15 ── CERT STAGGER */
const certO=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{if(e.isIntersecting)setTimeout(()=>{e.target.style.opacity='1';e.target.style.transform='translateY(0)';},i*70);});
},{threshold:.06});
document.querySelectorAll('.cc').forEach(c=>{
  c.style.cssText+='opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .5s var(--spring),border-color .3s';
  certO.observe(c);
});

/* 16 ── MAGNETIC BUTTONS */
document.querySelectorAll('.btn-pri,.btn-sec,.nconnect,.mcta,.slink').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.22}px)`;
  });
  btn.addEventListener('mouseleave',()=>btn.style.transform='');
});

/* 17 ── TAG RIPPLE */
const rs=document.createElement('style');
rs.textContent='@keyframes rpl{from{transform:scale(0);opacity:.6}to{transform:scale(7);opacity:0}}';
document.head.appendChild(rs);
document.querySelectorAll('.tag').forEach(tag=>{
  tag.addEventListener('click',e=>{
    const rp=document.createElement('span');
    const r=tag.getBoundingClientRect();
    rp.style.cssText=`position:absolute;border-radius:50%;width:32px;height:32px;margin:-16px;background:rgba(255,255,255,.15);pointer-events:none;z-index:9;left:${e.clientX-r.left}px;top:${e.clientY-r.top}px;animation:rpl .5s ease-out forwards;`;
    tag.appendChild(rp);setTimeout(()=>rp.remove(),520);
  });
});

/* 18 ── HERO NAME GLITCH */
const hn=document.querySelector('.h-name');
let gi;
hn.addEventListener('mouseenter',()=>{
  gi=setInterval(()=>{hn.style.textShadow=`${(Math.random()-.5)*7}px 0 rgba(91,168,255,.85),${(Math.random()-.5)*7}px 0 rgba(244,114,182,.75)`;},52);
});
hn.addEventListener('mouseleave',()=>{clearInterval(gi);hn.style.textShadow='';});

/* 19 ── COPY EMAIL */
const toast=document.getElementById('toast');
document.getElementById('copy-email').addEventListener('click',()=>{
  navigator.clipboard.writeText('habibaazahid@gmail.com').then(()=>{
    toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3000);
  });
});

/* 20 ── BACK TO TOP */
const btt=document.getElementById('btt');
addEventListener('scroll',()=>btt.classList.toggle('show',scrollY>500),{passive:true});

/* 21 ── HERO SPOTLIGHT */
const hero=document.getElementById('hero');
hero.addEventListener('mousemove',e=>{
  const r=hero.getBoundingClientRect();
  hero.style.background=`radial-gradient(680px circle at ${((e.clientX-r.left)/r.width*100).toFixed(1)}% ${((e.clientY-r.top)/r.height*100).toFixed(1)}%, rgba(91,168,255,.055), transparent 54%)`;
});
hero.addEventListener('mouseleave',()=>hero.style.background='');

/* 22 ── SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

/* 23 ── RING CLICK BOUNCE */
document.querySelectorAll('.rw').forEach(rw=>{
  rw.addEventListener('click',()=>{
    rw.style.transition='transform .2s var(--spring)';rw.style.transform='scale(1.1)';
    setTimeout(()=>rw.style.transform='',220);
  });
});

/* 24 ── COUNT-UP ANIMATION */
const cntO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target.querySelector('[data-count]');
    if(!el||el.dataset.done)return;
    el.dataset.done='1';
    const t=parseFloat(el.dataset.count),sfx=el.textContent.replace(/[\d.]/g,'');
    let f=0,tot=55;
    const step=()=>{f++;el.textContent=(t*f/tot).toFixed(t%1?.2:0)+sfx;if(f<tot)requestAnimationFrame(step);else el.textContent=t+sfx;};
    requestAnimationFrame(step);
  });
},{threshold:.6});
document.querySelectorAll('.h-sc').forEach(c=>cntO.observe(c));

/* 25 ── PROJECT CARD TILT */
document.querySelectorAll('.pjc').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    card.style.transform=`perspective(900px) rotateX(${-((e.clientY-r.top)/r.height-.5)*4}deg) rotateY(${((e.clientX-r.left)/r.width-.5)*4}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave',()=>card.style.transform='');
});

/* 26 ── CERT SHIMMER */
document.querySelectorAll('.cc').forEach(c=>{
  c.addEventListener('mousemove',e=>{
    const r=c.getBoundingClientRect();
    c.style.background=`radial-gradient(160px circle at ${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%, rgba(91,168,255,.09), var(--surf) 65%)`;
  });
  c.addEventListener('mouseleave',()=>c.style.background='');
});

/* 27 ── KEYBOARD TABS */
document.getElementById('tabs').addEventListener('keydown',e=>{
  const tabs=[...document.querySelectorAll('.tab')];
  const i=tabs.indexOf(document.activeElement);
  if(e.key==='ArrowRight'&&i<tabs.length-1){tabs[i+1].focus();tabs[i+1].click();}
  if(e.key==='ArrowLeft'&&i>0){tabs[i-1].focus();tabs[i-1].click();}
});

/* 28 ── LIVE CLOCK */
const clk=document.getElementById('fclock');
const tick=()=>{const n=new Date();clk.textContent=`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')} PKT · © ${n.getFullYear()}`;};
tick();setInterval(tick,30000);

/* 29 ── CODE CARD PARALLAX */
const ccard=document.getElementById('ccard');
addEventListener('mousemove',e=>{
  if(!ccard)return;
  const xd=(e.clientX/innerWidth-.5)*9,yd=(e.clientY/innerHeight-.5)*9;
  ccard.style.cssText+=`transform:perspective(900px) rotateX(${-yd}deg) rotateY(${xd}deg);transition:transform .18s ease;`;
});

/* 30 ── GRADIENT NAME SHIFT (animated) */
// Already applied via CSS @keyframes gshift on .l2
// Extra: tab focus indicator for accessibility
document.querySelectorAll('.tab').forEach(tab=>{
  tab.setAttribute('role','button');
  tab.setAttribute('tabindex','0');
  tab.addEventListener('keypress',e=>{if(e.key==='Enter')tab.click();});
});

dispatchEvent(new Event('scroll'));

const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext, useReducer } = React;

/* ══════════════════════════════════════════
   CUSTOM HOOKS
══════════════════════════════════════════ */
function useMousePosition() {
  const pos = useRef({ x: -999, y: -999 });
  useEffect(() => {
    const h = e => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return pos;
}

function useScrollProgress() {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const h = () => {
      const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setProg(Math.min(p * 100, 100));
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return prog;
}

function useIntersection(ref, threshold = 0.1) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

function useCounter(target, suffix = '', duration = 1600) {
  const [val, setVal] = useState('0' + suffix);
  const start = useRef(null);
  const run = useCallback(() => {
    const step = ts => {
      if (!start.current) start.current = ts;
      const p = Math.min((ts - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(target * ease) + suffix);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, suffix, duration]);
  return [val, run];
}

function useTyping(words, speed = 80) {
  const [text, setText] = useState('');
  useEffect(() => {
    let wi = 0, ci = 0, del = false, timer;
    const run = () => {
      const w = words[wi];
      if (!del) {
        setText(w.slice(0, ++ci));
        if (ci === w.length) { del = true; timer = setTimeout(run, 1800); return; }
      } else {
        setText(w.slice(0, --ci));
        if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
      }
      timer = setTimeout(run, del ? 32 : speed);
    };
    run();
    return () => clearTimeout(timer);
  }, []);
  return text;
}

/* ══════════════════════════════════════════
   CONTEXT & STATE
══════════════════════════════════════════ */
const AppCtx = createContext(null);
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME': return { ...state, dark: action.dark };
    case 'SET_SOUND': return { ...state, sound: action.sound };
    case 'SET_SECTION': return { ...state, activeSection: action.section };
    case 'SET_CURSOR': return { ...state, cursorMode: action.mode };
    default: return state;
  }
}

/* ══════════════════════════════════════════
   SOUND ENGINE (Web Audio API)
══════════════════════════════════════════ */
const AudioEngine = (() => {
  let ctx = null;
  const getCtx = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
  const play = (freq, type = 'sine', dur = 0.08, vol = 0.04) => {
    try {
      const c = getCtx(); if (c.state === 'suspended') c.resume();
      const osc = c.createOscillator(), gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = type; osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      osc.start(); osc.stop(c.currentTime + dur);
    } catch(e) {}
  };
  return {
    click: () => play(800, 'sine', 0.06, 0.03),
    hover: () => play(600, 'sine', 0.04, 0.015),
    success: () => { play(523, 'sine', 0.12, 0.04); setTimeout(() => play(659, 'sine', 0.1, 0.04), 80); setTimeout(() => play(784, 'sine', 0.14, 0.04), 160); },
    error: () => play(200, 'square', 0.14, 0.03),
    tab: () => play(440, 'triangle', 0.07, 0.025),
    type: () => play(1200 + Math.random() * 200, 'sine', 0.03, 0.008),
  };
})();

/* ══════════════════════════════════════════
   WEBGL BACKGROUND
══════════════════════════════════════════ */
function initWebGL() {
  const canvas = document.getElementById('webgl-bg');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; gl.viewport(0, 0, innerWidth, innerHeight); };
  resize(); window.addEventListener('resize', resize, { passive: true });
  const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}`;
  const FS = `precision mediump float;uniform float t;uniform vec2 r;uniform vec2 m;
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 mu=m/r;
  float d1=length(uv-vec2(.2+mu.x*.1,.8-mu.y*.1));
  float d2=length(uv-vec2(.8+sin(t*.3)*.15,.2+cos(t*.4)*.15));
  float d3=length(uv-vec2(.5+cos(t*.2)*.2,.5+sin(t*.5)*.18));
  float b1=smoothstep(.8,.0,d1)*0.09;
  float b2=smoothstep(.7,.0,d2)*0.07;
  float b3=smoothstep(.6,.0,d3)*0.05;
  vec3 c1=vec3(.36,.66,.99);vec3 c2=vec3(.66,.54,.98);vec3 c3=vec3(.18,.83,.75);
  vec3 col=c1*b1+c2*b2+c3*b3;
  gl_FragColor=vec4(col,1);
}`;
  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const tLoc = gl.getUniformLocation(prog, 't');
  const rLoc = gl.getUniformLocation(prog, 'r');
  const mLoc = gl.getUniformLocation(prog, 'm');
  let mx = innerWidth/2, my = innerHeight/2;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  let start = performance.now();
  const loop = () => {
    const t = (performance.now() - start) / 1000;
    gl.uniform1f(tLoc, t);
    gl.uniform2f(rLoc, canvas.width, canvas.height);
    gl.uniform2f(mLoc, mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(loop);
  };
  loop();
}

/* ══════════════════════════════════════════
   PARTICLE SYSTEM
══════════════════════════════════════════ */
function initParticles() {
  const c = document.getElementById('particle-canvas');
  const ctx = c.getContext('2d');
  let W, H, mouse = { x: -999, y: -999 };
  const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
  resize(); window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  class P {
    reset() { this.x = Math.random()*W; this.y = Math.random()*H; this.vx=(Math.random()-.5)*.09; this.vy=(Math.random()-.5)*.09; this.r=Math.random()*.7+.2; this.a=Math.random()*.08+.03; this.phase=Math.random()*Math.PI*2; }
    constructor() { this.reset(); }
    step() {
      this.phase+=.007;
      const alpha = this.a + Math.sin(this.phase)*.025;
      const dx=mouse.x-this.x, dy=mouse.y-this.y, d=Math.hypot(dx,dy);
      if (d<180&&d>0) { const f=(180-d)/180*.007; this.x+=dx*f; this.y+=dy*f; }
      this.x+=this.vx; this.y+=this.vy;
      if(this.x<0)this.x=W; if(this.x>W)this.x=0;
      if(this.y<0)this.y=H; if(this.y>H)this.y=0;
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(91,168,255,${alpha})`; ctx.fill();
    }
  }
  const pts = Array.from({length:60},()=>new P());
  const connect = () => {
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const d=Math.hypot(pts[i].x-pts[j].x, pts[i].y-pts[j].y);
      if(d<110) { ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.strokeStyle=`rgba(91,168,255,${.02*(1-d/110)})`; ctx.lineWidth=.35; ctx.stroke(); }
    }
  };
  (function loop(){ ctx.clearRect(0,0,W,H); pts.forEach(p=>p.step()); connect(); requestAnimationFrame(loop); })();
}

/* ══════════════════════════════════════════
   MAGNETIC CURSOR ENGINE
══════════════════════════════════════════ */
function initCursor() {
  const dot   = document.getElementById('cur-dot');
  const ring  = document.getElementById('cur-ring');
  const glow  = document.getElementById('cur-glow');
  const label = document.getElementById('cur-label');
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  let cx = innerWidth/2, cy = innerHeight/2;
  let rx = cx, ry = cy, gx = cx, gy = cy;
  let activated = false;

  window.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
    label.style.left = (cx + 16) + 'px'; label.style.top = cy + 'px';
    if (!activated) {
      activated = true;
      document.body.classList.add('cur-active');
    }
  }, { passive: true });

  (function loop() {
    rx += (cx - rx) * .12; ry += (cy - ry) * .12;
    gx += (cx - gx) * .06; gy += (cy - gy) * .06;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
    requestAnimationFrame(loop);
  })();

  window.addEventListener('mousedown', () => {
    dot.style.transform  = 'translate(-50%,-50%) scale(.3)';
    ring.style.transform = 'translate(-50%,-50%) scale(.85)';
  });
  window.addEventListener('mouseup', () => {
    dot.style.transform  = 'translate(-50%,-50%) scale(1)';
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
  });

  function resetCursor() {
    dot.style.width  = '6px'; dot.style.height = '6px';
    dot.style.borderRadius = '50%'; dot.style.opacity = '1';
    ring.style.width = '34px'; ring.style.height = '34px';
    ring.style.borderColor = 'rgba(91,168,255,.4)';
    label.style.opacity = '0';
  }
  function linkCursor() {
    dot.style.width  = '0'; dot.style.height = '0';
    ring.style.width = '46px'; ring.style.height = '46px';
    ring.style.borderColor = 'rgba(45,212,191,.65)';
    label.style.opacity = '0';
  }
  function projectCursor(txt) {
    dot.style.width  = '0'; dot.style.height = '0';
    ring.style.width = '62px'; ring.style.height = '62px';
    ring.style.borderColor = 'rgba(244,114,182,.55)';
    label.style.opacity = '1';
    label.textContent = txt || 'View';
  }
  function textCursor() {
    dot.style.width  = '2px'; dot.style.height = '18px';
    dot.style.borderRadius = '1px';
  }

  function attachHovers() {
    const done = '_chz';
    // Links, buttons, interactive elements → link cursor
    document.querySelectorAll('a, button, .dock-item, .tab-btn, .faq-q, .nbtn, .cv-btn, .cert-card, .astat, .hstat, .ms, .dn-dot').forEach(el => {
      if (el[done]) return; el[done] = true;
      el.addEventListener('mouseenter', linkCursor);
      el.addEventListener('mouseleave', resetCursor);
    });
    // Project cards → project cursor
    document.querySelectorAll('.pbc, .proj-hero-inner, .rv-card, .srv-card').forEach(el => {
      if (el[done]) return; el[done] = true;
      el.addEventListener('mouseenter', () => { projectCursor('View'); el._isProjCard = true; });
      el.addEventListener('mouseleave', () => { el._isProjCard = false; resetCursor(); });
    });
    // Text inputs → text cursor
    document.querySelectorAll('input, textarea').forEach(el => {
      if (el[done]) return; el[done] = true;
      el.addEventListener('mouseenter', textCursor);
      el.addEventListener('mouseleave', resetCursor);
      el.addEventListener('focus', textCursor);
      el.addEventListener('blur', resetCursor);
    });
  }

  setTimeout(attachHovers, 700);
  setInterval(attachHovers, 2500);
}

/* ══════════════════════════════════════════
   SPARKLE TRAIL
══════════════════════════════════════════ */
function initSparkle() {
  const colors=['var(--blue)','var(--violet)','var(--pink)','var(--teal)','var(--amber)'];
  let last=0;
  window.addEventListener('mousemove', e => {
    const now=Date.now(); if(now-last<35)return; last=now;
    const sp=document.createElement('div'); const sz=Math.random()*6+2;
    sp.className='spark';
    sp.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random()*colors.length)]};--dx:${(Math.random()-.5)*70}px;--dy:${(Math.random()-.5)*70}px;`;
    document.body.appendChild(sp); setTimeout(()=>sp.remove(),680);
  }, { passive:true });
}

/* ══════════════════════════════════════════
   KONAMI CODE
══════════════════════════════════════════ */
function initKonami() {
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  window.addEventListener('keydown', e => {
    if (e.key === seq[idx]) { idx++; if (idx === seq.length) { document.getElementById('konami-overlay').classList.add('show'); idx=0; } }
    else idx = 0;
  });
  // Rain animation
  const rain = document.getElementById('konami-rain');
  const chars='アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF♦♠♣♥◆★☆∞∑∏';
  for(let i=0;i<30;i++){
    const col=document.createElement('div');
    col.style.cssText=`position:absolute;top:-100%;left:${Math.random()*100}%;width:20px;font-family:var(--fm);font-size:.7rem;color:var(--teal);opacity:.3;animation:rainDrop ${2+Math.random()*3}s linear ${Math.random()*2}s infinite;text-align:center`;
    let t='';
    for(let j=0;j<20;j++) t+=chars[Math.floor(Math.random()*chars.length)]+'<br>';
    col.innerHTML=t; rain.appendChild(col);
  }
  const s=document.createElement('style'); s.textContent='@keyframes rainDrop{0%{top:-100%}100%{top:110%}}'; document.head.appendChild(s);
}

/* ══════════════════════════════════════════
   TOAST SYSTEM
══════════════════════════════════════════ */
function showToast(msg) {
  const t=document.getElementById('toast'), m=document.getElementById('toast-msg');
  if(m) m.textContent=msg;
  t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2800);
}

/* ══════════════════════════════════════════
   SCROLL PROGRESS BAR (DOM)
══════════════════════════════════════════ */
function initScrollProg() {
  const bar = document.getElementById('scroll-prog');
  const btt = document.getElementById('btt');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    bar.style.width=(sy/(document.body.scrollHeight-window.innerHeight)*100)+'%';
    if (btt) btt.classList.toggle('btt-show', sy > 500);
  }, { passive:true });
}

/* ══════════════════════════════════════════
   DOT NAVIGATION (DOM)
══════════════════════════════════════════ */
function DotNav({ sections, active }) {
  return (
    <div id="dot-nav">
      {sections.map(s => (
        <div key={s.id} className={`dn-dot ${active===s.id?'active':''}`} data-label={s.label}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({behavior:'smooth',block:'start'})}/>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   FLOATING DOCK
══════════════════════════════════════════ */
function Dock({ sound }) {
  const items = [
    { icon:'⬡', label:'Top', action:() => window.scrollTo({top:0,behavior:'smooth'}) },
    { icon:'👥', label:'About', action:() => document.getElementById('about-skills')?.scrollIntoView({behavior:'smooth'}) },
    { icon:'📁', label:'Projects', action:() => document.getElementById('projects')?.scrollIntoView({behavior:'smooth'}) },
    { icon:'✉️', label:'Contact', action:() => document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}) },
    { icon:'⚡', label:'GitHub', action:() => window.open('https://github.com/habibaazahid','_blank') },
    { icon:'💼', label:'LinkedIn', action:() => window.open('https://linkedin.com/in/habibazahid03','_blank') },
  ];
  return (
    <div id="dock">
      {items.map((item,i) => (
        <div key={i} className="dock-item" onClick={()=>{ if(sound) AudioEngine.click(); item.action(); }}>
          <div className="dock-icon">{item.icon}</div>
          <span className="dock-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   NAVBAR COMPONENT
══════════════════════════════════════════ */
function Navbar({ dark, sound, toggleTheme, toggleSound, activeSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prev = useRef(0);
  useEffect(() => {
    const h = () => {
      const sy = window.scrollY;
      setScrolled(sy > 50);
      if (sy > 350) { setHidden(sy - prev.current > 8 && sy > prev.current); }
      else setHidden(false);
      prev.current = sy;
    };
    window.addEventListener('scroll', h, { passive:true }); return ()=>window.removeEventListener('scroll',h);
  }, []);
  const links = [
    {href:'#about-skills',label:'About',num:'01'},
    {href:'#projects',label:'Projects',num:'02'},
    {href:'#journey',label:'Journey',num:'03'},
    {href:'#services',label:'Services',num:'04'},
    {href:'#reviews',label:'Reviews',num:'05'},
    {href:'#faq',label:'FAQ',num:'06'},
    {href:'#contact',label:'Contact',num:'07'},
  ];
  const nav = e => {
    e.preventDefault();
    if(sound) AudioEngine.click();
    document.querySelector(e.currentTarget.getAttribute('href'))?.scrollIntoView({behavior:'smooth',block:'start'});
    setMenuOpen(false);
  };
  return (
    <>
      <nav id="nav" className={`${scrolled?'scrolled':''} ${hidden?'hidden':''}`}>
        <div className="nlogo" onClick={()=>{window.scrollTo({top:0,behavior:'smooth'});if(sound)AudioEngine.click();}}>HZ.</div>
        <ul className="nlinks">
          {links.map(l=>(
            <li key={l.href}><a href={l.href} className={activeSection===l.href.slice(1)?'active':''} onClick={nav}><span className="ni">{l.num}</span>{l.label}</a></li>
          ))}
        </ul>
        <div className="nright">
          <button className="sound-toggle" onClick={()=>{toggleSound();if(sound)AudioEngine.click();}} title={sound?'Mute':'Enable sound'}>{sound?'🔊':'🔇'}</button>
          <button className="theme-toggle" onClick={()=>{toggleTheme();if(sound)AudioEngine.click();}}>{ dark?'🌙':'☀️'}</button>
          <a href="mailto:habibaazahid@gmail.com" className="nbtn" onClick={()=>sound&&AudioEngine.click()}>Let's Connect ↗</a>
          <a href="https://linkedin.com/in/habibazahid03" target="_blank" rel="noopener" className="nbtn" style={{padding:'8px 12px'}} onClick={()=>sound&&AudioEngine.click()} title="LinkedIn">💼</a>
          <a href="https://github.com/habibaazahid" target="_blank" rel="noopener" className="nbtn" style={{padding:'8px 12px'}} onClick={()=>sound&&AudioEngine.click()} title="GitHub">⚡</a>
          <a href="mailto:habibaazahid@gmail.com" className="cv-btn" onClick={()=>sound&&AudioEngine.click()}>↓ CV</a>
          <div className={`burger ${menuOpen?'open':''}`} onClick={()=>{setMenuOpen(p=>!p);if(sound)AudioEngine.click();}}>
            <span/><span/><span/>
          </div>
        </div>
      </nav>
      <div id="mobile-menu" className={menuOpen?'open':''}>
        {links.map(l=><a key={l.href} href={l.href} onClick={nav}>{l.label}</a>)}
        <a href="mailto:habibaazahid@gmail.com" className="m-cta" onClick={()=>{if(sound)AudioEngine.click();setMenuOpen(false);}}>Let's Connect ↗</a>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════ */
function Hero({ sound }) {
  const typeText = useTyping(['"React"', '"Node.js"', '"MongoDB"', '"TypeScript"', '"Next.js"']);
  const statRef = useRef(null);
  const [rev, runRev] = useCounter(847200,'',1500);
  const [usr, runUsr] = useCounter(24891,'',1500);
  const [conv, runConv] = useCounter(3847,'',1500);
  const statVis = useIntersection(statRef, 0.5);
  const hasRun = useRef(false);
  useEffect(()=>{
    if(statVis&&!hasRun.current){hasRun.current=true;runRev();runUsr();runConv();}
  },[statVis]);

  const orbitNodes = [
    {label:'React',top:'10%',left:'75%',delay:'0s'},
    {label:'CSS3',top:'50%',left:'88%',delay:'.5s'},
    {label:'JS',top:'85%',left:'60%',delay:'1s'},
    {label:'Node',top:'80%',left:'20%',delay:'1.5s'},
    {label:'Git',top:'15%',left:'30%',delay:'2s'},
  ];

  return (
    <section id="hero">
      <div>
        <div className="h-avail"><div className="h-pulse"></div>Available for Remote Work</div>
        <h1 className="h-name">Habiba<br/><span className="grad">Zahid.</span></h1>
        <div className="h-role"><span style={{width:5,height:5,borderRadius:'50%',background:'var(--blue)',boxShadow:'0 0 8px var(--blue)',flexShrink:0,display:'inline-block'}}></span>Aspiring Frontend Developer &amp; CS Student</div>
        <p className="h-desc">Studying at <strong>IU International University, Germany</strong> · Building beautiful, responsive web experiences with HTML, CSS, JavaScript &amp; React · <strong>6+ years</strong> of freelance excellence on ⭐ 5-star Upwork.</p>
        <div className="h-btns">
          <a href="#projects" className="btn-primary" onClick={e=>{e.preventDefault();if(sound)AudioEngine.click();document.getElementById('projects')?.scrollIntoView({behavior:'smooth'})}}><span>View My Work</span></a>
          <a href="#contact" className="btn-ghost" onClick={e=>{e.preventDefault();if(sound)AudioEngine.click();document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})}}>Get In Touch</a>
          <a href="https://linkedin.com/in/habibazahid03" target="_blank" rel="noopener" className="btn-ghost" style={{display:'flex',alignItems:'center',gap:6}} onClick={()=>sound&&AudioEngine.click()}>💼 LinkedIn</a>
        </div>
        <div className="h-stats" ref={statRef}>
          <div className="hstat"><div className="hstat-n">6+</div><div className="hstat-l">Years Freelancing</div></div>
          <div className="hstat"><div className="hstat-n">7</div><div className="hstat-l">Certifications</div></div>
          <div className="hstat"><div className="hstat-n">⭐ 5</div><div className="hstat-l">Upwork Rating</div></div>
        </div>
      </div>
      <div className="hero-right">
        <div className="code-card" id="ccard">
          <div className="cc-bar">
            <div className="cc-dots"><div className="cc-dot"/><div className="cc-dot"/><div className="cc-dot"/></div>
            <div className="cc-fname">habiba.tsx</div>
          </div>
          <div className="cc-body">
            <div><span className="t-kw">const</span> <span className="t-fn">habiba</span> = {'{'}</div>
            <div>&nbsp;&nbsp;<span className="t-prop">role</span>: <span className="t-str">"Frontend Developer"</span>,</div>
            <div>&nbsp;&nbsp;<span className="t-prop">university</span>: <span className="t-str">"IU Germany"</span>,</div>
            <div>&nbsp;&nbsp;<span className="t-prop">experience</span>: <span className="t-str">"6+ years"</span>,</div>
            <div>&nbsp;&nbsp;<span className="t-prop">rating</span>: <span className="t-str">"⭐ 5-star"</span>,</div>
            <div>&nbsp;&nbsp;<span className="t-prop">learning</span>: [<span className="t-str">{typeText}</span><span className="t-cursor"/>],</div>
            <div>&nbsp;&nbsp;<span className="t-prop">openTo</span>: <span className="t-str">"remote roles"</span>,</div>
            <div>{'}'};</div>
          </div>
        </div>
        <div className="orbit-widget">
          <div className="orbit-ring"></div>
          <div className="orbit-ring"></div>
          <div className="orbit-ring"></div>
          <div className="orbit-center">Frontend</div>
          {orbitNodes.map((n,i)=>(
            <div key={i} className="orbit-node" style={{top:n.top,left:n.left,animationDelay:n.delay}}
              onMouseEnter={()=>sound&&AudioEngine.hover()}
              title={n.label}>{n.label.slice(0,2)}</div>
          ))}
        </div>
        <div className="mini-stats">
          <div className="ms"><div className="ms-n">6+</div><div className="ms-l">Years</div></div>
          <div className="ms"><div className="ms-n">7</div><div className="ms-l">Certs</div></div>
          <div className="ms"><div className="ms-n">⭐5</div><div className="ms-l">Rating</div></div>
        </div>
      </div>
      <div className="scroll-hint">
        <div className="scroll-mouse"><div className="scroll-wheel"/></div>
        <span>Scroll</span>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   INTERACTIVE TERMINAL COMPONENT
══════════════════════════════════════════ */
function Terminal({ sound }) {
  const [lines, setLines] = useState([
    { prompt:'system', out:'Welcome to habiba.sh — type help for commands', cls:'info' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [hIdx, setHIdx] = useState(-1);
  const bodyRef = useRef(null);
  useEffect(()=>{ if(bodyRef.current) bodyRef.current.scrollTop=bodyRef.current.scrollHeight; },[lines]);

  const COMMANDS = {
    help: { out: ['Available commands:', '  skills     → View my tech skills', '  projects   → See my projects', '  certs      → List certifications', '  experience → Work experience', '  contact    → Get in touch', '  social     → Social links', '  clear      → Clear terminal', '  whoami     → About Habiba'], cls:'info' },
    whoami: { out:['Habiba Zahid — Aspiring Frontend Developer', 'CS Student @ IU International University, Germany', '6+ years freelance content writer on Upwork (⭐5-star)', 'Building: React · Node.js · MongoDB · TypeScript'], cls:'success' },
    skills: { out:['★ Frontend: HTML5(90%) CSS3(90%) JavaScript(75%) React(65%)', '★ Backend:  Node.js Express MongoDB REST APIs', '★ Tools:    Git Figma VS Code Vercel Tailwind', '★ AI/ML:    IBM AI Google AI Machine Learning'], cls:'highlight' },
    projects: { out:[
      '01 → Personal Portfolio Website',
      '     Built from scratch — HTML5, CSS3, JavaScript, no frameworks',
      '     · Animated particle canvas + mouse interaction',
      '     · Custom cursor with sparkle trail',
      '     · Scroll reveal animations, 3D tilt, magnetic buttons',
      '     · Skill tabs, progress bars, SVG rings, code card hero',
      '     · Mobile-responsive · Hamburger menu',
      '     Live → myportfolio.habibazahid.com',
      '     GitHub → github.com/habibaazahid/myportfolio__',
      '',
      '02 → Restaurant Landing Page     [HTML/CSS/JS]   · In progress',
      '03 → E-Commerce Storefront       [React/Shopify]  · In progress',
      '04 → Blog Platform               [MERN Stack]    · Coming soon',
      '05 → Agency Landing Page         [HTML/CSS/JS]   · In progress',
      '06 → Admin Dashboard             [React/Chart.js] · dashboard.habibazahid.com',
    ], cls:'highlight' },
    certs: { out:['1. CS50 — Harvard University', '2. HTML/CSS/JS — Johns Hopkins University', '3. Digital Marketing — University of Edinburgh', '4. IBM AI Foundations — IBM', '5. Machine Learning with Python — IBM', '6. Google AI Essentials — Google', '7. Maximize Productivity With AI — Google'], cls:'success' },
    experience: { out:['2023–2027 · BSc CS @ IU International University, Germany', '2019–Now  · Freelance Content Writer @ Upwork (⭐5-star)', 'Ongoing   · Student Ambassador @ IU International'], cls:'info' },
    contact: { out:['📧 habibaazahid@gmail.com', '🔗 linkedin.com/in/habibazahid03', '⚡ github.com/habibaazahid'], cls:'success' },
    social: { out:['GitHub  → github.com/habibaazahid', 'LinkedIn→ linkedin.com/in/habibazahid03', 'Upwork  → upwork.com/freelancers/habibazahid', 'Email   → habibaazahid@gmail.com'], cls:'highlight' },
    clear: null,
    hire: { out:['🚀 Great choice! Habiba is:', '  • Available for remote roles immediately', '  • Open to freelance & full-time opportunities', '  • Flexible with EST, GMT, CET timezones', '→ Email: habibaazahid@gmail.com'], cls:'success' },
    date: { out:[new Date().toLocaleString()], cls:'info' },
    ls: { out:['about.md  skills.json  projects/  certs.pdf  contact.txt'], cls:'highlight' },
  };

  const exec = cmd => {
    const c = cmd.trim().toLowerCase();
    if (!c) return;
    setHistory(h=>[c,...h]); setHIdx(-1);
    if (c === 'clear') { setLines([{ prompt:'system', out:'Terminal cleared. Type help for commands.', cls:'info' }]); return; }
    const result = COMMANDS[c];
    if (result) {
      if(sound) AudioEngine.success();
      const outputs = result.out.map(o=>({ prompt:'', out:o, cls:result.cls }));
      setLines(l=>[...l,{prompt:'~$',out:cmd,cls:''},{prompt:'',out:'',cls:''},...outputs]);
    } else {
      if(sound) AudioEngine.error();
      setLines(l=>[...l,{prompt:'~$',out:cmd,cls:''},{prompt:'',out:`command not found: ${c} — type "help"`,cls:'error'}]);
    }
  };

  return (
    <div className="terminal">
      <div className="term-bar">
        <span className="term-dot"/><span className="term-dot"/><span className="term-dot"/>
        <span className="term-title">habiba@portfolio:~$</span>
      </div>
      <div className="term-body" ref={bodyRef}>
        {lines.map((l,i)=>(
          <div key={i} className="term-line">
            {l.prompt && <span className="term-prompt">{l.prompt}</span>}
            <span className={`term-out ${l.cls||''}`}>{l.out}</span>
          </div>
        ))}
      </div>
      <div className="term-input-row">
        <span className="term-input-prompt">~$</span>
        <input className="term-input" value={input} placeholder="type a command…" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          onChange={e=>{setInput(e.target.value);if(sound)AudioEngine.type();}}
          onKeyDown={e=>{
            if(e.key==='Enter'){exec(input);setInput('');}
            if(e.key==='ArrowUp'){const i=Math.min(hIdx+1,history.length-1);setHIdx(i);setInput(history[i]||'');}
            if(e.key==='ArrowDown'){const i=Math.max(hIdx-1,-1);setHIdx(i);setInput(i<0?'':history[i]||'');}
            if(e.key==='Tab'){e.preventDefault();const match=Object.keys(COMMANDS).find(c=>c.startsWith(input));if(match)setInput(match);}
          }}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ABOUT + SKILLS SECTION
══════════════════════════════════════════ */
function AboutSkills({ sound }) {
  const [tab, setTab] = useState('fe');
  const barsRef = useRef(null);
  const ringsRef = useRef(null);
  const [barsAnim, setBarsAnim] = useState(false);
  const [ringsAnim, setRingsAnim] = useState(false);
  const statsRef = useRef(null);
  const statsVis = useIntersection(statsRef, 0.4);
  const hasCount = useRef(false);
  useEffect(()=>{
    if(statsVis&&!hasCount.current){
      hasCount.current=true;
      document.querySelectorAll('[data-count]').forEach(el=>{
        if(el.dataset.done)return; el.dataset.done='1';
        const target=parseFloat(el.dataset.count), suffix=el.dataset.suffix||'';
        let st=null;
        const step=ts=>{if(!st)st=ts;const p=Math.min((ts-st)/1600,1),e=1-Math.pow(1-p,4);el.textContent=Math.round(target*e)+suffix;if(p<1)requestAnimationFrame(step);else el.textContent=target+suffix;};
        requestAnimationFrame(step);
      });
    }
  },[statsVis]);
  useEffect(()=>{
    if(!barsRef.current)return;
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!barsAnim){setBarsAnim(true);}},{threshold:.3});
    o.observe(barsRef.current); return()=>o.disconnect();
  },[barsRef,barsAnim]);
  useEffect(()=>{
    if(!ringsRef.current)return;
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!ringsAnim){setRingsAnim(true);}},{threshold:.3});
    o.observe(ringsRef.current); return()=>o.disconnect();
  },[ringsRef,ringsAnim]);

  const MQ_ITEMS = ['HTML5','CSS3','JavaScript','React','Node.js','MongoDB','Python','Java','WordPress','Express.js','Tailwind','TypeScript','Next.js','Git','REST APIs','Figma'];
  const MQ_COLORS = ['#e34c26','#264de4','#f7df1e','#61dafb','#8892be','#4db33d','#3776ab','#007396','#21759b','#f05340','#38bdf8','#3178c6','#000','#f05032','#56b3b4','#ff6f00'];
  const mqItems = [...MQ_ITEMS,...MQ_ITEMS];

  const TABS = [
    { id:'fe', label:'🖥 Frontend' },
    { id:'be', label:'⚙️ Backend' },
    { id:'dm', label:'📊 Digital' },
    { id:'tl', label:'🛠 Tools' },
    { id:'ai', label:'🤖 AI' },
  ];

  const RINGS = [
    {pct:90,val:203,label:'HTML/CSS',g:'g1',c1:'#5ba8ff',c2:'#2dd4bf'},
    {pct:75,val:170,label:'JavaScript',g:'g2',c1:'#f472b6',c2:'#5ba8ff'},
    {pct:65,val:147,label:'React',g:'g3',c1:'#2dd4bf',c2:'#a78bfa'},
    {pct:80,val:181,label:'UI/UX',g:'g4',c1:'#a78bfa',c2:'#f472b6'},
    {pct:95,val:215,label:'Writing',g:'g5',c1:'#2dd4bf',c2:'#5ba8ff'},
    {pct:70,val:158,label:'Digital',g:'g6',c1:'#fbbf24',c2:'#2dd4bf'},
  ];

  return (
    <section id="about-skills">
      <div className="ey">About Me</div>
      <h2 className="sec-title reveal">Who I <em>Am.</em></h2>
      <div className="as-grid">
        <div className="reveal">
          <p className="about-p">I'm a <strong>dedicated CS student and aspiring Frontend Developer</strong> at IU International University of Applied Sciences, Germany, building real-world projects while growing my skills rapidly.</p>
          <p className="about-p">My <strong>6+ years of freelance content writing</strong> on Upwork sharpened client communication, deadline discipline, and problem-solving — giving me a professional edge beyond pure technical ability.</p>
          <p className="about-p">Passionate about crafting <strong>pixel-perfect, accessible, responsive interfaces</strong>. Seeking a remote role where I can grow fast and build things people love.</p>
          <Terminal sound={sound}/>
        </div>
        <div className="reveal" style={{transitionDelay:'.1s'}}>
          <div className="about-stats" ref={statsRef}>
            <div className="astat"><div className="astat-n" data-count="6" data-suffix="+">0+</div><div className="astat-l">Years Freelancing</div></div>
            <div className="astat"><div className="astat-n" data-count="7">0</div><div className="astat-l">Certifications</div></div>
            <div className="astat"><div className="astat-n" data-count="30" data-suffix="%">0%</div><div className="astat-l">Client Engagement ↑</div></div>
            <div className="astat"><div className="astat-n">⭐ 5</div><div className="astat-l">Upwork Rating</div></div>
          </div>
        </div>
      </div>

      <div className="ey">Skills</div>
      <h2 className="sec-title reveal">My <em>Skills.</em></h2>

      <div className="marquee-wrap reveal">
        <div className="mq-track">
          {mqItems.map((item,i)=>(
            <div key={i} className="mq-item" onMouseEnter={()=>sound&&AudioEngine.hover()}>
              <div className="mq-dot" style={{background:MQ_COLORS[i%MQ_ITEMS.length]}}></div>{item}
            </div>
          ))}
        </div>
      </div>

      <div className="tabs">
        {TABS.map(t=>(
          <button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`}
            onClick={()=>{ setTab(t.id); if(sound) AudioEngine.tab(); if(t.id==='fe') setTimeout(()=>barsRef.current&&setBarsAnim(v=>{if(!v){return true;}return v;}),60); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Frontend panel */}
      <div className={`tab-panel ${tab==='fe'?'active':''}`}>
        <div className="skgrid">
          <div className="skcard feat"
            onMouseMove={e=>{ const r=e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx',(e.clientX-r.left)/r.width*100+'%'); e.currentTarget.style.setProperty('--my',(e.clientY-r.top)/r.height*100+'%'); }}>
            <div className="fbadge">★ Primary Focus</div>
            <div className="skt">Frontend Development</div>
            <div className="sks">Building what users see &amp; love</div>
            <div className="tags" style={{marginBottom:20}}>
              {['HTML5','CSS3','JavaScript','React','Responsive Design','CSS Animations','UI/UX','Flexbox & Grid','WordPress'].map(t=>(
                <span key={t} className="tag tb" onMouseEnter={()=>sound&&AudioEngine.hover()}>{t}</span>
              ))}
            </div>
            <div className="bars" ref={barsRef}>
              {[['HTML5 & CSS3',90],['JavaScript (ES6+)',75],['React',65],['CSS Animations',85]].map(([n,w])=>(
                <div key={n} className="bar-row">
                  <div className="bar-meta"><span className="bar-name">{n}</span><span className="bar-pct">{w}%</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{width:barsAnim?w+'%':0}}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Other panels */}
      <div className={`tab-panel ${tab==='be'?'active':''}`}><div className="skgrid"><div className="skcard"><div className="skt">Backend</div><div className="sks">Server & APIs</div><div className="tags">{['Node.js','Express','MongoDB','REST APIs','Python','Java'].map(t=><span key={t} className="tag tg">{t}</span>)}</div></div></div></div>
      <div className={`tab-panel ${tab==='dm'?'active':''}`}><div className="skgrid"><div className="skcard"><div className="skt">Digital Marketing</div><div className="sks">Growth & analytics</div><div className="tags">{['SEO','Google Analytics','Digital Marketing','Social Media','Content Creation','CRM'].map(t=><span key={t} className="tag ta">{t}</span>)}</div></div></div></div>
      <div className={`tab-panel ${tab==='tl'?'active':''}`}><div className="skgrid"><div className="skcard"><div className="skt">Tools</div><div className="sks">Daily toolkit</div><div className="tags">{['Git & GitHub','VS Code','Figma','Canva','Vercel','MS Office'].map(t=><span key={t} className="tag tp">{t}</span>)}</div></div></div></div>
      <div className={`tab-panel ${tab==='ai'?'active':''}`}><div className="skgrid"><div className="skcard"><div className="skt">AI & Learning</div><div className="sks">Currently exploring</div><div className="tags">{['Machine Learning','IBM AI','Google AI','TypeScript','Next.js'].map(t=><span key={t} className="tag tv">{t}</span>)}</div></div></div></div>

      {/* Skill rings */}
      <div className="rings" ref={ringsRef}>
        {RINGS.map(r=>(
          <div key={r.label} className="ring-item" onMouseEnter={()=>sound&&AudioEngine.hover()}>
            <svg className="ring-svg" width="86" height="86" viewBox="0 0 88 88">
              <defs><linearGradient id={r.g} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={r.c1}/><stop offset="100%" stopColor={r.c2}/></linearGradient></defs>
              <circle className="ring-bg" cx="44" cy="44" r="36" strokeWidth="3.5"/>
              <circle className="ring-fg" cx="44" cy="44" r="36" strokeWidth="3.5" stroke={`url(#${r.g})`} strokeDasharray="226" style={{strokeDashoffset:ringsAnim?226-r.val:226}}/>
              <text className="ring-txt" x="44" y="44">{r.pct}%</text>
            </svg>
            <div className="ring-lbl">{r.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   PROJECTS SECTION — WORLD CLASS
   Apple-style: cinematic hero + bento grid
   Live canvas previews + scroll-reveal
   Animated per-card visual backgrounds
══════════════════════════════════════════ */

/* ── Live canvas animation for hero project ── */
function HeroCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = c.offsetWidth, H = c.height = c.offsetHeight;
    const ro = new ResizeObserver(() => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; });
    ro.observe(c);
    // Floating code lines
    const lines = Array.from({length:18}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      text: ['const habiba = {}','<Portfolio/>','useState(magic)','CSS: ✨','React.render()','npm run dev','git push','Vercel deploy 🚀','⭐ 5-star','HTML · CSS · JS','class Developer','export default HZ','.animate({y:0})','flex-direction:🔥','border-radius:∞','z-index: 999'][Math.floor(Math.random()*16)],
      speed: .18 + Math.random()*.22,
      opacity: .04 + Math.random()*.09,
      size: 10 + Math.random()*4,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      ctx.font = '500 12px "JetBrains Mono", monospace';
      lines.forEach(l => {
        l.y -= l.speed;
        if (l.y < -30) { l.y = H + 20; l.x = Math.random()*W; }
        ctx.globalAlpha = l.opacity;
        ctx.fillStyle = '#5ba8ff';
        ctx.font = `500 ${l.size}px "JetBrains Mono", monospace`;
        ctx.fillText(l.text, l.x, l.y);
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className="proj-hero-canvas" style={{width:'100%',height:'100%'}}/>;
}

/* ── Per-card mini canvas animations ── */
function CardCanvas({ type }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = c.offsetWidth, H = c.height = c.offsetHeight;
    const ro = new ResizeObserver(() => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; });
    ro.observe(c);
    let raf, t = 0;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      t += .008;
      if (type === 'portfolio') {
        // Floating code snippets drifting upward — matches this site's aesthetic
        const snippets = ['const habiba={}','<Portfolio/>','useState(✨)','CSS: magic','React.render()','npm run dev','git push','Vercel 🚀','⭐ 5-star','.animate()','.flex()','>_ terminal','WebGL','export default'];
        if (!c._lines) c._lines = snippets.map(txt => ({
          x: Math.random()*W, y: Math.random()*H,
          txt, speed: .15 + Math.random()*.2,
          alpha: .04 + Math.random()*.07,
          size: 10 + Math.random()*3,
        }));
        c._lines.forEach(l => {
          l.y -= l.speed;
          if (l.y < -20) { l.y = H + 10; l.x = Math.random()*W; }
          ctx.globalAlpha = l.alpha;
          ctx.fillStyle = Math.random() > .5 ? '#5ba8ff' : '#a78bfa';
          ctx.font = `500 ${l.size}px "JetBrains Mono", monospace`;
          ctx.fillText(l.txt, l.x, l.y);
        });
        ctx.globalAlpha = 1;
      } else if (type === 'restaurant') {
        // Warm wave lines
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(0, H*.3 + i*18);
          for (let x = 0; x <= W; x += 4) {
            ctx.lineTo(x, H*.3 + i*18 + Math.sin(x*.015 + t + i) * 14);
          }
          ctx.strokeStyle = `rgba(251,191,36,${.04 + i*.015})`;
          ctx.lineWidth = 1.2; ctx.stroke();
        }
      } else if (type === 'ecommerce') {
        // Grid dots product layout
        const cols = 4, rows = 3;
        for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++) {
          const x = (col+1)*W/(cols+1), y = (r+1)*H/(rows+1);
          const scale = .7 + Math.sin(t*1.2 + r*1.1 + col*.9)*.3;
          ctx.beginPath(); ctx.arc(x, y, 8*scale, 0, Math.PI*2);
          ctx.fillStyle = `rgba(244,114,182,${.08*scale})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(244,114,182,${.14*scale})`;
          ctx.lineWidth = 1; ctx.stroke();
        }
      } else if (type === 'blog') {
        // Text lines flowing
        const lineH = 14;
        for (let i = 0; i < 7; i++) {
          const y = 20 + i*lineH + (t*14 % (H+lineH*7)) - lineH*7;
          const w = (W*.35 + W*.5*Math.abs(Math.sin(i*.7+t*.2))) % W;
          ctx.fillStyle = `rgba(167,139,250,${.06 + (i%3)*.025})`;
          ctx.fillRect(18, y, w, 5);
        }
      } else if (type === 'agency') {
        // Geometric shapes morphing
        ctx.save();
        ctx.translate(W/2, H/2);
        for (let i = 0; i < 3; i++) {
          ctx.rotate(t*.4 + i*Math.PI/1.5);
          ctx.strokeStyle = `rgba(45,212,191,${.08 + i*.03})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(-30-i*14, -30-i*14, 60+i*28, 60+i*28);
        }
        ctx.restore();
      } else if (type === 'dashboard') {
        // Mini chart bars
        const bars = [.4,.7,.5,.9,.6,.8,.45,.75];
        bars.forEach((h, i) => {
          const animated = h + Math.sin(t*1.5 + i)*.1;
          const bw = W/(bars.length+1), bx = (i+.5)*bw, by = H*(1-animated*.7);
          const grad = ctx.createLinearGradient(bx, by, bx, H);
          grad.addColorStop(0, `rgba(91,168,255,.35)`);
          grad.addColorStop(1, `rgba(91,168,255,.05)`);
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.roundRect(bx - bw*.3, by, bw*.6, H-by, 3);
          ctx.fill();
        });
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [type]);
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>;
}

/* ── Single bento card ── */
function BentoCard({ project, size, sound }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const vis = useIntersection(ref, 0.15);

  const enter = () => {
    setHovered(true);
    if (sound) AudioEngine.hover();
  };
  const leave = () => { setHovered(false); };

  return (
    <div
      ref={ref}
      className={`pbc pbc-${size}`}
      style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(24px)', transition: 'opacity .65s ease, transform .65s var(--sp)' }}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={() => { if (project.link !== '#') { window.open(project.link,'_blank'); if(sound) AudioEngine.click(); } }}
    >
      {/* Animated canvas background */}
      {project.canvasType && <CardCanvas type={project.canvasType}/>}

      {/* Gradient overlay */}
      <div className="pbc-visual">
        <div className="pbc-gradient" style={{background: project.gradient}}/>
        <div className="pbc-emoji">{project.emoji}</div>
        <div className="pbc-lines"/>
      </div>

      <div className="pbc-inner">
        <div className="pbc-content">
          <div className={`pbc-status ${project.status}`}>
            {project.status === 'live' ? 'Live' : project.status === 'wip' ? 'In Progress' : 'Coming Soon'}
          </div>
          <div className="pbc-num">{project.num}</div>
          <div className="pbc-title">{project.title}</div>
          <div className="pbc-desc">{project.desc}</div>
        </div>
        <div className="pbc-foot">
          <div className="pbc-stack">
            {project.stack.map(t => <span key={t} className="pbc-tag">{t}</span>)}
          </div>
          <div className="pbc-arrow">↗</div>
        </div>
      </div>

      {project.link !== '#' && (
        <a href={project.link} target="_blank" rel="noopener" className="pbc-link"
          onClick={e => { e.stopPropagation(); if(sound) AudioEngine.click(); }}>
          {project.linkLabel}
        </a>
      )}
    </div>
  );
}

/* ══ MAIN PROJECTS COMPONENT ══ */
function Projects({ sound }) {
  const featRef = useRef(null);
  const featVis = useIntersection(featRef, 0.12);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const ALL = [
    {
      num:'01', title:'Personal Portfolio Website',
      desc:'Built from scratch — HTML5, CSS3, JavaScript, no frameworks or templates. Particle canvas, custom cursor with sparkle trail, scroll reveal animations, 3D tilt, magnetic buttons, skill tabs, and deployed live on Vercel.',
      stack:['HTML5','CSS3','JavaScript','Canvas API','CSS Animations','Vercel'],
      status:'live',
      gradient:'linear-gradient(135deg,rgba(91,168,255,.22),rgba(167,139,250,.14),rgba(244,114,182,.06),transparent 68%)',
      emoji:'🌐', canvasType:'portfolio',
      link:'https://myportfolio.habibazahid.com',
      github:'https://github.com/habibaazahid',
      linkLabel:'Visit Live',
      featured: true,
      metrics:[['30+','JS features'],['Canvas','Particle bg'],['No Frameworks','Vanilla JS'],['⭐ Live','Vercel']],
    },
    {
      num:'02', title:'Restaurant Landing Page',
      desc:'Animated menu reveals, sticky booking form, parallax imagery, and scroll-driven transitions.',
      stack:['HTML5','CSS3','JavaScript'], status:'wip',
      gradient:'linear-gradient(135deg,rgba(251,191,36,.18),rgba(249,115,22,.1),transparent 70%)',
      emoji:'🍕', canvasType:'restaurant', link:'https://github.com/habibaazahid', linkLabel:'View on GitHub',
    },
    {
      num:'03', title:'E-Commerce Storefront',
      desc:'Responsive product grid with filtering, cart logic, animations, and Shopify integration.',
      stack:['React','Shopify API','CSS Animations'], status:'wip',
      gradient:'linear-gradient(135deg,rgba(244,114,182,.2),rgba(167,139,250,.1),transparent 70%)',
      emoji:'🛍️', canvasType:'ecommerce', link:'https://github.com/habibaazahid', linkLabel:'View on GitHub',
    },
    {
      num:'04', title:'Blog & Content Platform',
      desc:'Full-stack MERN blogging platform with auth, rich text editor, and SEO-optimized architecture.',
      stack:['React','Node.js','MongoDB','JWT'], status:'soon',
      gradient:'linear-gradient(135deg,rgba(167,139,250,.2),rgba(91,168,255,.1),transparent 70%)',
      emoji:'📝', canvasType:'blog', link:'https://github.com/habibaazahid', linkLabel:'View on GitHub',
    },
    {
      num:'05', title:'Agency Landing Page',
      desc:'Bold creative agency site with parallax hero, morphing shapes, animated counters, and smooth scroll.',
      stack:['HTML5','CSS3','JavaScript'], status:'wip',
      gradient:'linear-gradient(135deg,rgba(45,212,191,.18),rgba(91,168,255,.1),transparent 70%)',
      emoji:'🏢', canvasType:'agency', link:'https://github.com/habibaazahid', linkLabel:'View on GitHub',
    },
    {
      num:'06', title:'Admin Dashboard',
      desc:'Live analytics dashboard — real-time crypto & weather APIs, Chart.js, dark/light mode, 10 pages.',
      stack:['React','Chart.js','Live APIs'], status:'live',
      gradient:'linear-gradient(135deg,rgba(91,168,255,.22),rgba(45,212,191,.12),transparent 70%)',
      emoji:'📊', canvasType:'dashboard', link:'https://dashboard.habibazahid.com/', linkLabel:'View Live',
    },
  ];

  /* sizes: featured spans full 12 cols, rest fill naturally */
  const SIZES = ['xl','m','s','s','m','l'];

  const enter = () => {
    document.body.classList.add('cur-project');
    const el = document.getElementById('cur-label');
    if (el) el.textContent = 'View';
    if (sound) AudioEngine.hover();
  };
  const leave = () => document.body.classList.remove('cur-project');

  return (
    <section id="projects">
      <div className="proj-eyebrow"><div className="ey">Work</div></div>
      <h2 className="proj-headline reveal">Six Projects.<br/><em>All Built.</em></h2>

      <div className="proj-bento">

        {/* ── 01 FEATURED — full-width bento card ── */}
        <div
          ref={featRef}
          className="pbc"
          style={{
            gridColumn: 'span 12',
            minHeight: 400,
            opacity: featVis ? 1 : 0,
            transform: featVis ? 'none' : 'translateY(28px)',
            transition: 'opacity .8s ease, transform .8s var(--sp)',
            cursor: 'pointer',
          }}
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect();
            setParallax({ x: (e.clientX-r.left)/r.width - .5, y: (e.clientY-r.top)/r.height - .5 });
          }}
          onMouseEnter={enter}
          onMouseLeave={() => { leave(); setParallax({x:0,y:0}); }}
          onClick={() => { window.open('https://myportfolio.habibazahid.com','_blank'); if(sound) AudioEngine.click(); }}
        >
          {/* Background layer */}
          <div className="pbc-visual">
            <div className="pbc-gradient" style={{background:ALL[0].gradient}}/>
            <CardCanvas type="portfolio"/>
            <div className="pbc-lines"/>
            {/* Parallax emoji */}
            <div style={{
              position:'absolute', bottom:-24, right:-16,
              fontSize:'clamp(6rem,12vw,10rem)', opacity:.13,
              pointerEvents:'none', filter:'blur(.5px)',
              transform:`translate(${parallax.x * -20}px, ${parallax.y * -14}px)`,
              transition: 'transform .12s linear',
            }}>🌐</div>
          </div>

          <div className="pbc-inner" style={{minHeight:400}}>
            {/* Top badges row */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div style={{
                display:'inline-flex',alignItems:'center',gap:6,
                fontFamily:'var(--fm)',fontSize:'.6rem',letterSpacing:'.18em',textTransform:'uppercase',
                background:'linear-gradient(135deg,var(--blue),var(--violet))',
                color:'#fff',padding:'5px 14px',borderRadius:20,
                boxShadow:'0 4px 18px rgba(91,168,255,.3)',
              }}>★ Featured — This Website</div>
              <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:'var(--fm)',fontSize:'.58rem',letterSpacing:'.12em',textTransform:'uppercase',color:'var(--green)',background:'rgba(52,211,153,.1)',border:'1px solid rgba(52,211,153,.22)',padding:'4px 12px',borderRadius:20}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 7px var(--green)',display:'inline-block',animation:'lp2 2s ease-in-out infinite'}}/>
                Live on Vercel
              </div>
            </div>

            {/* Two-col content */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'flex-end'}}>
              <div className="pbc-content">
                <div className="pbc-num">01 / 06</div>
                <div className="pbc-title" style={{fontSize:'clamp(1.5rem,2.5vw,2.2rem)',lineHeight:1.1,marginBottom:12}}>
                  Personal Portfolio<br/>Website
                </div>
                <div className="pbc-desc" style={{fontSize:'.88rem',lineHeight:1.85}}>
                  {ALL[0].desc}
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:18}}>
                <div className="pbc-stack" style={{gap:6}}>
                  {ALL[0].stack.map(t=><span key={t} className="pbc-tag" style={{borderRadius:20,padding:'4px 12px'}}>{t}</span>)}
                </div>
                <div style={{display:'flex',gap:20,paddingTop:14,borderTop:'1px solid var(--e1)'}}>
                  {ALL[0].metrics.map(([n,l])=>(
                    <div key={l}>
                      <div style={{fontFamily:'var(--fh)',fontSize:'1rem',fontWeight:800,color:'var(--blue)',lineHeight:1,marginBottom:2}}>{n}</div>
                      <div style={{fontFamily:'var(--fm)',fontSize:'.52rem',color:'var(--mu2)',letterSpacing:'.1em',textTransform:'uppercase'}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:9}}>
                  <a href={ALL[0].link} target="_blank" rel="noopener" className="proj-btn-primary"
                    onClick={e=>{e.stopPropagation();if(sound)AudioEngine.click();}}>Visit Live ↗</a>
                  <a href={ALL[0].github} target="_blank" rel="noopener" className="proj-btn-ghost"
                    onClick={e=>{e.stopPropagation();if(sound)AudioEngine.click();}}>GitHub</a>
                </div>
              </div>
            </div>

            <div className="pbc-foot" style={{marginTop:20}}>
              <div className="pbc-stack">
                <div className={`pbc-status live`}>Live</div>
              </div>
              <div className="pbc-arrow">↗</div>
            </div>
          </div>
        </div>

        {/* ── 02–06 BENTO CARDS ── */}
        {ALL.slice(1).map((p, i) => (
          <BentoCard key={p.num} project={p} size={SIZES[i+1]} sound={sound}/>
        ))}

      </div>

      <div className="proj-cta-strip reveal">
        <span className="proj-cta-text">More projects building — follow on GitHub</span>
        <a href="https://github.com/habibaazahid" target="_blank" rel="noopener"
          className="proj-cta-link" onClick={()=>sound&&AudioEngine.click()}>
          github.com/habibaazahid
        </a>
      </div>
    </section>
  );
}

  const BENTO = [
    {
      num:'02', title:'Restaurant Landing Page',
      desc:'Animated menu reveals, sticky booking form, parallax imagery, and scroll-driven transitions.',
      stack:['HTML5','CSS3','JavaScript'], status:'wip',
      gradient:'linear-gradient(135deg,rgba(251,191,36,.18),rgba(249,115,22,.1),transparent 70%)',
      emoji:'🍕', canvasType:'restaurant', link:'https://github.com/habibaazahid', linkLabel:'View on GitHub',
    },
    {
      num:'03', title:'E-Commerce Storefront',
      desc:'Responsive product grid with filtering, cart logic, animations, and Shopify integration.',
      stack:['React','Shopify API','CSS Animations'], status:'wip',
      gradient:'linear-gradient(135deg,rgba(244,114,182,.2),rgba(167,139,250,.1),transparent 70%)',
      emoji:'🛍️', canvasType:'ecommerce', link:'https://github.com/habibaazahid', linkLabel:'View on GitHub',
    },
    {
      num:'04', title:'Blog & Content Platform',
      desc:'Full-stack MERN blogging platform with auth, rich text editor, and SEO-optimized architecture.',
      stack:['React','Node.js','MongoDB','JWT'], status:'soon',
      gradient:'linear-gradient(135deg,rgba(167,139,250,.2),rgba(91,168,255,.1),transparent 70%)',
      emoji:'📝', canvasType:'blog', link:'https://github.com/habibaazahid', linkLabel:'View on GitHub',
    },
    {
      num:'05', title:'Agency Landing Page',
      desc:'Bold creative agency website with parallax hero, morphing shapes, animated counters, and smooth scroll.',
      stack:['HTML5','CSS3','JavaScript'], status:'wip',
      gradient:'linear-gradient(135deg,rgba(45,212,191,.18),rgba(91,168,255,.1),transparent 70%)',
      emoji:'🏢', canvasType:'agency', link:'https://github.com/habibaazahid', linkLabel:'View on GitHub',
    },
    {
      num:'06', title:'Admin Dashboard',
      desc:'Live analytics dashboard with real-time crypto, weather APIs, Chart.js, dark/light mode, and 10 pages.',
      stack:['React','Chart.js','Live APIs'], status:'live',
      gradient:'linear-gradient(135deg,rgba(91,168,255,.22),rgba(45,212,191,.12),transparent 70%)',
      emoji:'📊', canvasType:'dashboard', link:'https://dashboard.habibazahid.com/', linkLabel:'View Live',
    },
  ];

  // Bento sizing: [m, s, s, m, l] — 12-col grid fills perfectly
  const SIZES = ['m','s','s','m','l'];

  return (
    <section id="projects">

      {/* ── Section header ── */}
      <div className="proj-eyebrow">
        <div className="ey">Work</div>
      </div>
      <h2 className="proj-headline reveal">
        Six Projects.<br/><em>All Built.</em>
      </h2>

      {/* ── FEATURED CARD — same bento style, full width, extra tall ── */}
      <div
        ref={heroRef}
        className="pbc"
        style={{
          gridColumn:'span 12',
          minHeight: 420,
          opacity: heroVis ? 1 : 0,
          transform: heroVis ? 'none' : 'translateY(28px)',
          transition: 'opacity .8s ease, transform .8s var(--sp)',
          position:'relative',
          cursor:'pointer',
        }}
        onMouseMove={e => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--px',(e.clientX-r.left)/r.width*100+'%');
          e.currentTarget.style.setProperty('--py',(e.clientY-r.top)/r.height*100+'%');
          setHeroParallax({x:(e.clientX-r.left)/r.width-.5, y:(e.clientY-r.top)/r.height-.5});
        }}
        onMouseLeave={() => { setHeroParallax({x:0,y:0}); }}
        onMouseEnter={() => { if(sound) AudioEngine.hover(); }}
        onClick={() => { window.open('https://github.com/habibaazahid','_blank'); if(sound) AudioEngine.click(); }}
      >
        {/* Canvas + gradient bg */}
        <div className="pbc-visual">
          <div className="pbc-gradient" style={{background:'linear-gradient(135deg,rgba(91,168,255,.18),rgba(167,139,250,.1),rgba(244,114,182,.06),transparent 70%)'}}/>
          <HeroCanvas/>
          <div className="pbc-lines"/>
          {/* Large floating emoji */}
          <div style={{
            position:'absolute', bottom:-20, right:-20,
            fontSize:'clamp(7rem,14vw,12rem)', opacity:.14,
            transition:'all .5s var(--sp)', pointerEvents:'none',
            transform:`translate(${parallax.x*-20}px,${parallax.y*-14}px)`,
            filter:'blur(.5px)',
          }}>🌐</div>
        </div>

        {/* Top row: crown + live badge */}
        <div style={{position:'absolute',top:0,left:0,right:0,padding:'22px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:5}}>
          <div className="proj-featured-crown" style={{position:'static',transform:'none'}}>★ Featured — This Website</div>
          <div style={{display:'flex',alignItems:'center',gap:7,fontFamily:'var(--fm)',fontSize:'.6rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--green)',background:'rgba(52,211,153,.1)',border:'1px solid rgba(52,211,153,.25)',padding:'5px 13px',borderRadius:20}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 8px var(--green)',animation:'lp2 2s ease-in-out infinite',display:'inline-block'}}/>
            Live on Vercel
          </div>
        </div>

        {/* Main content — two column on wide, stack on narrow */}
        <div style={{
          position:'relative', zIndex:2,
          display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:48, alignItems:'flex-end',
          padding:'90px 28px 32px',
        }}>
          {/* Left: title + desc */}
          <div className="pbc-content">
            <div className="pbc-num" style={{marginBottom:16}}>01 / 06</div>
            <div className="pbc-title" style={{fontSize:'clamp(1.6rem,2.8vw,2.4rem)',letterSpacing:'-.04em',lineHeight:1.1,marginBottom:14}}>
              Personal Portfolio<br/>Website
            </div>
            <div className="pbc-desc" style={{maxWidth:440, fontSize:'.9rem', lineHeight:1.85}}>
              Built from scratch — HTML5, CSS3, JavaScript, no frameworks or templates. Animated particle canvas with mouse interaction, custom cursor &amp; sparkle trail, scroll reveal animations, 3D tilt effects, magnetic buttons, skill tabs, progress bars, SVG rings, and TypeScript-style code card. Deployed live on Vercel.
            </div>
          </div>

          {/* Right: stack + metrics + links */}
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            {/* Stack tags */}
            <div className="pbc-stack" style={{flexWrap:'wrap',gap:6}}>
              {['HTML5','CSS3','JavaScript','Canvas API','CSS Animations','Vercel'].map(t=>(
                <span key={t} className="pbc-tag" style={{borderRadius:20,padding:'4px 11px'}}>{t}</span>
              ))}
            </div>
            {/* Mini metrics */}
            <div style={{display:'flex',gap:24,paddingTop:16,borderTop:'1px solid var(--e1)'}}>
              {[['30+','JS features'],['Canvas','Particle bg'],['Vanilla JS','No frameworks'],['⭐ Live','Vercel']].map(([n,l])=>(
                <div key={l}>
                  <div style={{fontFamily:'var(--fh)',fontSize:'1.1rem',fontWeight:800,color:'var(--blue)',lineHeight:1,marginBottom:3,letterSpacing:'-.04em'}}>{n}</div>
                  <div style={{fontFamily:'var(--fm)',fontSize:'.55rem',color:'var(--mu2)',letterSpacing:'.1em',textTransform:'uppercase'}}>{l}</div>
                </div>
              ))}
            </div>
            {/* Links */}
            <div style={{display:'flex',gap:10}}>
              <a href="https://github.com/habibaazahid" target="_blank" rel="noopener"
                className="proj-btn-primary" onClick={e=>{e.stopPropagation();if(sound)AudioEngine.click();}}>
                GitHub ↗
              </a>
              <a href="https://myportfolio.habibazahid.com" target="_blank" rel="noopener"
                className="proj-btn-ghost" onClick={e=>{e.stopPropagation();if(sound)AudioEngine.click();}}>
                Visit Live
              </a>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="pbc-arrow" style={{position:'absolute',bottom:28,right:28,zIndex:5}}>↗</div>
      </div>
        {BENTO.map((p, i) => (
          <BentoCard key={p.num} project={p} size={SIZES[i]} sound={sound}/>
        ))}
      </div>

      {/* ── CTA strip ── */}
      <div className="proj-cta-strip reveal">
        <span className="proj-cta-text">More projects being built — follow along on GitHub</span>
        <a href="https://github.com/habibaazahid" target="_blank" rel="noopener"
          className="proj-cta-link"
          onClick={()=>sound&&AudioEngine.click()}>
          github.com/habibaazahid
        </a>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   JOURNEY SECTION
══════════════════════════════════════════ */
function Journey({ sound }) {
  const timelineRef = useRef(null);
  useEffect(()=>{
    const o=new IntersectionObserver(entries=>entries.forEach((e,i)=>{if(e.isIntersecting)setTimeout(()=>e.target.classList.add('visible'),i*180);}),{threshold:.1});
    document.querySelectorAll('.tle').forEach(el=>o.observe(el));
    return()=>o.disconnect();
  },[]);
  const certs=[
    {ico:'🏛️',name:'CS50: Introduction to Computer Science',by:'Harvard University'},
    {ico:'🔵',name:'HTML, CSS & JavaScript for Web Developers',by:'Johns Hopkins University'},
    {ico:'🌐',name:'Digital Marketing Strategy',by:'University of Edinburgh'},
    {ico:'🤖',name:'IBM AI Foundations for Business',by:'IBM'},
    {ico:'🔬',name:'Machine Learning with Python',by:'IBM'},
    {ico:'✨',name:'Google AI Essentials Specialization',by:'Google'},
    {ico:'⚡',name:'Maximize Productivity With AI Tools',by:'Google'},
  ];
  return (
    <section id="journey">
      <div className="ey">Journey</div>
      <h2 className="sec-title reveal">Experience &amp; <em>Credentials.</em></h2>
      <div className="journey-grid">
        <div>
          <div className="tl-sub">Timeline</div>
          <div className="tl" ref={timelineRef}>
            {[
              {date:'2023–2027',role:'BSc Computer Science',org:'IU International University, Germany · Distance',desc:'Studying core CS modules alongside self-driven frontend development. Building real projects and earning industry certifications.'},
              {date:'2019–Present',role:'Freelance Content Writer',org:'Upwork · Remote · ⭐ 5-Star Rating',desc:'Delivered eBooks, research papers, and marketing copy — boosting client engagement by 30%. Maintained a perfect 5-star rating.'},
              {date:'Ongoing',role:'Student Ambassador',org:'IU International University',desc:'Represented the university globally, organized orientations, and served as a bridge between students and faculty.'},
            ].map((e,i)=>(
              <div key={i} className="tle">
                <div className="tl-date">{e.date}</div>
                <div className="tl-role">{e.role}</div>
                <div className="tl-org">{e.org}</div>
                <div className="tl-desc">{e.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="tl-sub">Certifications</div>
          <div className="cert-list">
            {certs.map((c,i)=>(
              <div key={i} className="cert-card reveal" style={{transitionDelay:i*.06+'s'}}
                onMouseEnter={()=>sound&&AudioEngine.hover()}>
                <div className="cert-icon">{c.ico}</div>
                <div><div className="cert-name">{c.name}</div><div className="cert-by">{c.by}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SERVICES SECTION
══════════════════════════════════════════ */
function Services({ sound }) {
  const srvs=[
    {icon:'🎨',title:'UI/UX Design & Frontend',desc:'Pixel-perfect, responsive interfaces built with modern HTML, CSS & JavaScript.',list:['Responsive Web Design','CSS Animations & Interactions','React Component Development','Cross-browser Compatibility'],badge:'Available Now'},
    {icon:'⚡',title:'Full-Stack MERN Development',desc:'End-to-end applications using MongoDB, Express, React, and Node.js with RESTful APIs.',list:['REST API Design & Build','MongoDB Database Design','JWT Authentication','Deployment on Vercel/Railway'],badge:'Learning & Available'},
    {icon:'✍️',title:'Content Writing & SEO',desc:'6+ years of Upwork freelancing — eBooks, research papers, web copy, and SEO content.',list:['SEO Blog & Articles','Technical Writing','Research & Reports','Social Media Content'],badge:'⭐ 5-Star Rated'},
  ];
  return (
    <section id="services">
      <div className="ey">What I Offer</div>
      <h2 className="sec-title reveal">My <em>Services.</em></h2>
      <div className="srv-grid">
        {srvs.map((s,i)=>(
          <div key={i} className="srv-card reveal" style={{transitionDelay:i*.12+'s'}}
            onMouseMove={e=>{ const r=e.currentTarget.getBoundingClientRect(); e.currentTarget.style.background=`radial-gradient(320px circle at ${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%,rgba(91,168,255,.07),var(--surf) 55%)`; }}
            onMouseLeave={e=>e.currentTarget.style.background=''}
            onMouseEnter={()=>sound&&AudioEngine.hover()}>
            <span className="srv-icon">{s.icon}</span>
            <div className="srv-title">{s.title}</div>
            <p className="srv-desc">{s.desc}</p>
            <ul className="srv-list">{s.list.map(l=><li key={l}>{l}</li>)}</ul>
            <span className="srv-badge">{s.badge}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   REVIEWS CAROUSEL (Draggable)
══════════════════════════════════════════ */
function Reviews({ sound }) {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0), dragOffset = useRef(0);
  const trackRef = useRef(null);
  const reviews=[
    {stars:'★★★★★',text:'"Habiba delivered outstanding quality — the research was thorough and the writing was professional. Highly recommend!"',av:'JM',name:'James M.',role:'Business Owner · USA',grad:'linear-gradient(135deg,var(--blue),var(--violet))'},
    {stars:'★★★★★',text:'"Absolutely amazing work! Habiba understood the brief perfectly and delivered before the deadline. Will hire again!"',av:'SR',name:'Sarah R.',role:'Marketing Manager · UK',grad:'linear-gradient(135deg,var(--pink),var(--violet))'},
    {stars:'★★★★★',text:'"Creative, reliable, and communicates clearly. The final eBook exceeded my expectations. Great collaboration!"',av:'AK',name:'Ahmed K.',role:'Startup Founder · UAE',grad:'linear-gradient(135deg,var(--teal),var(--blue))'},
    {stars:'★★★★★',text:'"Fast delivery, excellent attention to detail, and great communication throughout the project."',av:'LK',name:'Lisa K.',role:'Content Director · Germany',grad:'linear-gradient(135deg,var(--amber),var(--pink))'},
  ];
  const goTo = i => { if(sound) AudioEngine.click(); setCurrent(Math.max(0,Math.min(i,reviews.length-1))); };
  const onPointerDown = e=>{ setDragging(true); dragStart.current=e.clientX; };
  const onPointerMove = e=>{ if(!dragging)return; dragOffset.current=e.clientX-dragStart.current; };
  const onPointerUp = ()=>{ if(!dragging)return; setDragging(false); if(dragOffset.current<-60)goTo(current+1); else if(dragOffset.current>60)goTo(current-1); dragOffset.current=0; };
  return (
    <section id="reviews">
      <div className="ey">Client Feedback</div>
      <h2 className="sec-title reveal">What Clients <em>Say.</em></h2>
      <div className={`carousel-wrap ${dragging?'dragging':''}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <div className="carousel-track" ref={trackRef} style={{transform:`translateX(calc(-${current*356}px))`}}>
          {reviews.map((r,i)=>(
            <div key={i} className="rv-card" onMouseEnter={()=>sound&&AudioEngine.hover()}>
              <span className="rv-badge">Upwork</span>
              <div className="rv-stars">{r.stars}</div>
              <p className="rv-text">{r.text}</p>
              <div className="rv-author">
                <div className="rv-av" style={{background:r.grad}}>{r.av}</div>
                <div><div className="rv-name">{r.name}</div><div className="rv-role">{r.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="carousel-dots">
        {reviews.map((_,i)=><div key={i} className={`car-dot ${i===current?'active':''}`} onClick={()=>goTo(i)}/>)}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   FAQ SECTION
══════════════════════════════════════════ */
function FAQ({ sound }) {
  const [open, setOpen] = useState(null);
  const faqs=[
    {q:'Are you available for remote work?',a:'Yes! I am actively looking for remote frontend roles, internships, and freelance projects. I have 6+ years of remote work experience through Upwork and am comfortable with async communication and international time zones.'},
    {q:'What is your tech stack?',a:'My primary stack is HTML5, CSS3, JavaScript (ES6+), and React. I am currently learning Node.js, Express, and MongoDB to become a full MERN stack developer. I also use Tailwind CSS, Git, GitHub, and deploy on Vercel.'},
    {q:'Do you take freelance projects?',a:"Absolutely. I'm open to frontend development projects, landing pages, portfolio sites, and content writing work. Reach out via email or LinkedIn and I'll get back to you within 24 hours."},
    {q:'What is your current availability?',a:'Available for part-time freelance work and actively applying for full-time remote junior frontend developer roles. Flexible with EST, GMT, and CET working hours.'},
    {q:'What makes you stand out?',a:'I combine 6+ years of remote freelance discipline with strong frontend skills and 7 industry certifications from Harvard, IBM, Google, and Johns Hopkins. I care deeply about design quality and always deliver on time.'},
  ];
  const toggle = i => {
    if(sound) AudioEngine.click();
    setOpen(open === i ? null : i);
  };
  return (
    <section id="faq">
      <div className="ey">Questions</div>
      <h2 className="sec-title reveal">FAQ<em>.</em></h2>
      <div className="faq-wrap">
        {faqs.map((f,i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={`faq-item reveal`} style={{transitionDelay:i*.06+'s', borderColor: isOpen ? 'var(--e2)' : 'var(--e1)'}}>
              <div className="faq-q" onClick={()=>toggle(i)} style={{color: isOpen ? 'var(--blue)' : ''}}>
                {f.q}
                <span className="faq-ico" style={{
                  transform: isOpen ? 'rotate(45deg)' : 'none',
                  background: isOpen ? 'var(--blue)' : 'transparent',
                  color: isOpen ? '#fff' : 'var(--blue)',
                  borderColor: isOpen ? 'var(--blue)' : 'var(--e2)',
                }}>+</span>
              </div>
              <div style={{
                maxHeight: isOpen ? '320px' : '0',
                overflow: 'hidden',
                transition: 'max-height .42s cubic-bezier(.16,1,.3,1)',
              }}>
                <div className="faq-answer-inner">{f.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   CONTACT SECTION
══════════════════════════════════════════ */
function Contact({ sound }) {
  const [form, setForm] = useState({name:'',email:'',subject:'',msg:''});
  const [sent, setSent] = useState(false);
  const [typing, setTyping] = useState(false);
  const [chars, setChars] = useState(0);
  const MAX = 500;
  const typingTimer = useRef(null);

  const update = (k,v) => {
    setForm(f=>({...f,[k]:v}));
    if(sound) AudioEngine.type();
    if(k==='msg') setChars(v.length);
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(()=>setTyping(false),900);
  };

  const send = () => {
    if(!form.name||!form.email||!form.msg){showToast('Please fill in all fields');if(sound)AudioEngine.error();return;}
    const ml=`mailto:habibaazahid@gmail.com?subject=${encodeURIComponent(form.subject||'Portfolio Contact')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.msg}`)}`;
    window.open(ml,'_blank');
    setSent(true); if(sound) AudioEngine.success(); showToast('Opening mail client… ✓');
    setTimeout(()=>setSent(false),3000);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('habibaazahid@gmail.com').then(()=>{showToast('Email copied! ✓');if(sound)AudioEngine.success();});
  };

  const charClass = chars>MAX?'over':chars>MAX*0.8?'warn':'';

  return (
    <section id="contact">
      <div className="ey" style={{justifyContent:'center'}}>Contact</div>
      <h2 className="ctit reveal"><span className="w1">Let's Build</span><span className="w2">Something.</span></h2>
      <p className="csub reveal">Open to remote frontend roles and freelance projects. My inbox is always open.</p>
      <div className="cform reveal">
        <div className="typing-indicator" style={{opacity:typing?1:0}}>Habiba is reading your message… ✨</div>
        <div className="cf-row">
          <div className="cf-field"><label className="cf-label">Your Name</label><input className="cf-input" placeholder="John Doe" value={form.name} onChange={e=>update('name',e.target.value)}/></div>
          <div className="cf-field"><label className="cf-label">Your Email</label><input className="cf-input" type="email" placeholder="john@email.com" value={form.email} onChange={e=>update('email',e.target.value)}/></div>
        </div>
        <div className="cf-row"><div className="cf-field full"><label className="cf-label">Subject</label><input className="cf-input" placeholder="Frontend role / Freelance project" value={form.subject} onChange={e=>update('subject',e.target.value)}/></div></div>
        <div className="cf-row"><div className="cf-field full"><label className="cf-label">Message</label><textarea className="cf-textarea" placeholder="Tell me about your project…" value={form.msg} onChange={e=>update('msg',e.target.value)}/><div className={`char-count ${charClass}`}>{chars}/{MAX}</div></div></div>
        <button className={`cf-send ${sent?'sent':''}`} onClick={send}><span>{sent?'✓ Sent! Opening mail…':'Send Message ↗'}</span></button>
      </div>
      <div className="cemail reveal" onClick={copyEmail}>habibaazahid@gmail.com ✉</div>
      <div className="socials reveal">
        {[
          ['⚡ GitHub','https://github.com/habibaazahid'],
          ['💼 LinkedIn','https://linkedin.com/in/habibazahid03'],
          ['✉️ Email','mailto:habibaazahid@gmail.com'],
          ['⭐ Upwork','https://www.upwork.com/freelancers/~habibazahid'],
        ].map(([l,h])=>(
          <a key={l} href={h} className="slink" target="_blank" rel="noopener" onClick={()=>sound&&AudioEngine.click()} onMouseEnter={()=>sound&&AudioEngine.hover()}>{l}</a>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   LIVE TIME STRIP
══════════════════════════════════════════ */
function LiveStrip() {
  const [times, setTimes] = useState({main:'--:--',date:'',pk:'--:--',us:'--:--',uk:'--:--',de:'--:--'});
  useEffect(()=>{
    const update=()=>{
      const now=new Date();
      const fmt=tz=>new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:tz}).format(now);
      const fmtDate=tz=>new Intl.DateTimeFormat('en',{weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:tz}).format(now);
      setTimes({main:fmt('Asia/Karachi'),date:fmtDate('Asia/Karachi'),pk:fmt('Asia/Karachi'),us:fmt('America/New_York'),uk:fmt('Europe/London'),de:fmt('Europe/Berlin')});
    };
    update(); const i=setInterval(update,1000); return()=>clearInterval(i);
  },[]);
  return (
    <div id="live-strip">
      <div>
        <div style={{fontFamily:'var(--fm)',fontSize:'.59rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--mu2)',marginBottom:5}}>Current Time · Pakistan (PKT)</div>
        <div className="ls-main">{times.main}</div>
        <div className="ls-date">{times.date}</div>
      </div>
      <div className="ls-zones">
        {[['🇵🇰 PKT',times.pk],['🇺🇸 EST',times.us],['🇬🇧 GMT',times.uk],['🇩🇪 CET',times.de]].map(([tz,t])=>(
          <div key={tz} className="ls-zone"><div className="ls-tz">{tz}</div><div className="ls-tc">{t}</div></div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   FOOTER
══════════════════════════════════════════ */
function Footer() {
  const [t,setT]=useState('');
  useEffect(()=>{const i=setInterval(()=>setT(`${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')} PKT`),1000);return()=>clearInterval(i);});
  return(
    <footer>
      <span>Designed &amp; Built by <a href="https://myportfolio.habibazahid.com">Habiba Zahid</a></span>
      <div className="footer-badge"><div className="footer-dot"/>Available for work · {t} · © {new Date().getFullYear()}</div>
    </footer>
  );
}

/* ══════════════════════════════════════════
   ROOT APP COMPONENT
══════════════════════════════════════════ */
const SECTIONS=[
  {id:'hero',label:'Hero'},{id:'about-skills',label:'About'},{id:'projects',label:'Projects'},
  {id:'journey',label:'Journey'},{id:'services',label:'Services'},{id:'reviews',label:'Reviews'},
  {id:'faq',label:'FAQ'},{id:'contact',label:'Contact'},
];

function App() {
  const [state, dispatch] = useReducer(appReducer, { dark:true, sound:true, activeSection:'hero', cursorMode:'default' });
  const [activeSection, setActiveSection] = useState('hero');

  const toggleTheme = () => {
    const newDark = !state.dark;
    dispatch({type:'SET_THEME',dark:newDark});
    document.documentElement.setAttribute('data-theme',newDark?'dark':'light');
    try{localStorage.setItem('hz-theme',newDark?'dark':'light');}catch(e){}
  };
  const toggleSound = () => dispatch({type:'SET_SOUND',sound:!state.sound});

  // Init theme
  useEffect(()=>{
    try{const s=localStorage.getItem('hz-theme');if(s==='light'){dispatch({type:'SET_THEME',dark:false});document.documentElement.setAttribute('data-theme','light');}}catch(e){}
  },[]);

  // Intersection observer for active section
  useEffect(()=>{
    const o=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting) setActiveSection(e.target.id); }); },{threshold:.35,rootMargin:'-20% 0px -20% 0px'});
    SECTIONS.forEach(s=>{ const el=document.getElementById(s.id); if(el) o.observe(el); });
    return()=>o.disconnect();
  },[]);

  // Scroll reveal
  useEffect(()=>{
    const o=new IntersectionObserver(entries=>entries.forEach((e,i)=>{ if(e.isIntersecting) setTimeout(()=>e.target.classList.add('visible'),i*55); },{threshold:.08}));
    document.querySelectorAll('.reveal').forEach(el=>o.observe(el));
    // re-run after render
    setTimeout(()=>document.querySelectorAll('.reveal').forEach(el=>o.observe(el)),500);
    return()=>o.disconnect();
  },[]);

  // Magnetic buttons
  useEffect(()=>{
    const addMagnet=(sel)=>{
      document.querySelectorAll(sel).forEach(btn=>{
        btn.addEventListener('mousemove',e=>{const r=btn.getBoundingClientRect();btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.18}px)`;});
        btn.addEventListener('mouseleave',()=>btn.style.transform='');
      });
    };
    setTimeout(()=>addMagnet('.btn-primary,.btn-ghost,.nbtn,.slink,.cf-send'),1000);
  },[]);

  // Project card tilt
  useEffect(()=>{
    const add=()=>document.querySelectorAll('.proj-card').forEach(c=>{
      c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();c.style.transform=`perspective(900px) rotateX(${-((e.clientY-r.top)/r.height-.5)*4}deg) rotateY(${((e.clientX-r.left)/r.width-.5)*4}deg) translateY(-6px)`;});
      c.addEventListener('mouseleave',()=>{c.classList.contains('feat')?c.style.transform='':c.style.transform='';});
    });
    setTimeout(add,800);
  },[]);

  return (
    <>
      <DotNav sections={SECTIONS} active={activeSection}/>
      <Dock sound={state.sound}/>
      <Navbar dark={state.dark} sound={state.sound} toggleTheme={toggleTheme} toggleSound={toggleSound} activeSection={activeSection}/>
      <Hero sound={state.sound}/>
      <div className="div"/>
      <AboutSkills sound={state.sound}/>
      <div className="div"/>
      <Projects sound={state.sound}/>
      <div className="div"/>
      <Journey sound={state.sound}/>
      <div className="div"/>
      <Services sound={state.sound}/>
      <div className="div"/>
      <Reviews sound={state.sound}/>
      <div className="div"/>
      <FAQ sound={state.sound}/>
      <div className="div"/>
      <Contact sound={state.sound}/>
      <LiveStrip/>
      <Footer/>
    </>
  );
}

/* ══════════════════════════════════════════
   BOOTSTRAP
══════════════════════════════════════════ */
// Progress counter
let pct = 0;
const pctEl = document.getElementById('ld-pct');
const pctInt = setInterval(()=>{ pct = Math.min(pct + Math.random()*12+3, 95); if(pctEl) pctEl.textContent=Math.round(pct)+'%'; },80);

window.addEventListener('load', () => {
  clearInterval(pctInt);
  if(pctEl) pctEl.textContent='100%';
  // Init all engines
  initWebGL();
  initParticles();
  initCursor();
  initSparkle();
  initKonami();
  initScrollProg();
  // Mount React
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App/>);
  // Hide loader
  setTimeout(()=>document.getElementById('loader').classList.add('out'),1800);
});

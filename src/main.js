import './style.css';
const $=s=>document.querySelector(s),S=[...document.querySelectorAll('.scene')],B=document.body;
let tok=0,idx=0,busy=false;const V={};
const wait=(ms,t)=>new Promise(r=>setTimeout(()=>r(t===tok),ms));
S.forEach(s=>s.querySelectorAll('.rv').forEach((e,i)=>e.style.setProperty('--i',i)));
addEventListener('pointermove',e=>{const r=document.documentElement.style;r.setProperty('--mx',(e.clientX/innerWidth-.5)*2);r.setProperty('--my',(e.clientY/innerHeight-.5)*2);const d=$('#dot');d.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;d.classList.toggle('big',!!e.target.closest('button'))});
function mk(box,eager){const n=box.dataset.n,v=document.createElement('video'),o={v,ok:false,box,go:false};
 box.innerHTML=`<div class="ph"><i class="scan"></i><small class="k">VIDEO ${n}</small><h3>${box.dataset.label}</h3><p class="k">MEDIA WILL BE LOADED</p><p class="k dim">AWAITING VISUAL FEED</p></div>`;
 Object.assign(v,{muted:true,playsInline:true,loop:false,controls:false,preload:eager?'auto':'none'});v.setAttribute('aria-hidden','true');
 v.addEventListener('loadeddata',()=>{o.ok=true;box.classList.add('live');if(o.want)v.play().catch(()=>{})});
 o.load=()=>{if(!o.go){o.go=true;v.src=box.dataset.src;v.load()}};box.prepend(v);if(eager)o.load();return o}
const intro=mk($('#boot .vs'),true);
S.forEach((s,i)=>{const b=s.querySelector('.vs');if(b&&i)V[i]=mk(b)});
function sched(s,t,a){s.querySelectorAll(`[${a}]`).forEach(e=>setTimeout(()=>{if(t!==tok)return;e.classList.add('show');if(e.dataset.x)setTimeout(()=>{if(t===tok)e.classList.add('gone')},+e.dataset.x)},+e.getAttribute(a)))}
const cont=(t,ms)=>setTimeout(()=>{if(t===tok)$('#cont').classList.add('on')},ms);
function fin(i,t){const s=S[i];if(t!==tok||s.classList.contains('ended'))return;s.classList.add('ended');sched(s,t,'data-end');cont(t,1800);if(s.dataset.auto)setTimeout(()=>{if(t===tok)go(i+1)},+s.dataset.auto)}
const WP=[[.15,.27,2.4,'01','COLLEGE CHAOS'],[.44,.5,2,'02','RANDOM CONVERSATIONS'],[.45,.85,2.4,'03','STUDY MODE: QUESTIONABLE'],[.89,.3,2.5,'04','LAUGHTER BETWEEN EVERYTHING'],[.83,.77,2.4,'05','THE LITTLE MOMENTS'],[.5,.5,1,'ARCHIVE','EVERY MEMORY, PART OF THE JOURNEY']];
function cam(p){const a=$('#arch'),W=innerWidth,H=innerHeight,bw=Math.max(W,H*16/9),bh=Math.max(H,W*9/16),s=p[2];
 a.style.transform=`translate(${W/2-s*p[0]*bw}px,${H/2-s*p[1]*bh}px) scale(${s})`;const c=$('#cap');c.classList.remove('show');setTimeout(()=>{c.innerHTML=`<b>${p[3]}</b> ${p[4]}`;c.classList.add('show')},500)}
async function memory(t){const a=$('#arch');a.style.transition='none';a.style.transform=`translate(${innerWidth/2-Math.max(innerWidth,innerHeight*16/9)/2}px,${innerHeight/2-Math.max(innerHeight,innerWidth*9/16)/2}px)`;a.classList.remove('lit');void a.offsetWidth;a.style.transition='';
 if(!await wait(4300,t))return;a.classList.add('lit');for(const p of WP){cam(p);if(!await wait(3400,t))return}}
/* ═══════════════════════════════════════════════════════ BACKGROUND MUSIC ═════ */
const BGM_PATH = '/assets/music/Ludovico%20Einaudi%20-%20Experience.mp3';
const bgm = new Audio(BGM_PATH);
bgm.loop = true;
bgm.preload = 'auto';
bgm.volume = 0.22;
bgm.muted = false;

let hasStarted = false;
let targetVol = 0.22;
let fadeTimer = null;

function logAudio(msg, err) {
  const line = `[SOFIE GT AUDIO] ${msg}` + (err ? ` : ${err.name || ''} ${err.message || err}` : '');
  console.log(line);
  try {
    fetch('/__log', { method: 'POST', body: line }).catch(() => {});
  } catch(e) {}
}

bgm.addEventListener('canplaythrough', () => {
  logAudio('File loaded');
});
bgm.addEventListener('error', () => {
  logAudio('Playback failed - audio element error', bgm.error);
});
bgm.addEventListener('playing', () => {
  logAudio('Playback started (playing event, volume=' + bgm.volume + ')');
});

function fadeVolumeTo(target, duration = 2000) {
  if (fadeTimer) clearInterval(fadeTimer);
  const startVol = bgm.volume;
  const diff = target - startVol;
  if (Math.abs(diff) < 0.005) {
    bgm.volume = target;
    return;
  }
  const steps = Math.max(1, Math.round(duration / 50));
  const stepChange = diff / steps;
  let count = 0;
  fadeTimer = setInterval(() => {
    count++;
    const next = bgm.volume + stepChange;
    if (count >= steps || (stepChange > 0 && next >= target) || (stepChange < 0 && next <= target)) {
      bgm.volume = Math.max(0, Math.min(1, target));
      clearInterval(fadeTimer);
      fadeTimer = null;
    } else {
      bgm.volume = Math.max(0, Math.min(1, next));
    }
  }, 50);
}

function updateSoundUI() {
  const btn = $('#snd');
  if (!btn) return;
  if (bgm.muted) {
    btn.textContent = 'MUTE';
    btn.classList.add('dim');
    btn.setAttribute('aria-label', 'Unmute sound');
  } else {
    btn.textContent = 'SOUND';
    btn.classList.remove('dim');
    btn.setAttribute('aria-label', 'Mute sound');
  }
}

function playMusic(reason = 'user interaction') {
  if (hasStarted && !bgm.paused) return;
  bgm.volume = 0.22;
  bgm.muted = false;
  logAudio('playMusic called (' + reason + ')');
  const playPromise = bgm.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      hasStarted = true;
      logAudio('Playback started');
      removeUnlock();
      updateSoundUI();
    }).catch(err => {
      if (err.name === 'NotAllowedError') {
        logAudio('Autoplay blocked');
      } else {
        logAudio('Playback failed', err);
      }
    });
  }
}

const unlockEvents = ['click', 'keydown', 'touchstart'];
function onUserInteraction(e) {
  logAudio('User interaction detected: ' + e.type);
  playMusic('interaction: ' + e.type);
}
function removeUnlock() {
  unlockEvents.forEach(ev => window.removeEventListener(ev, onUserInteraction));
}
unlockEvents.forEach(ev => window.addEventListener(ev, onUserInteraction));

// Attempt initial autoplay
logAudio('Autoplay attempt');
const autoPromise = bgm.play();
if (autoPromise !== undefined) {
  autoPromise.then(() => {
    hasStarted = true;
    logAudio('Playback started (autoplay allowed)');
    removeUnlock();
    updateSoundUI();
  }).catch(err => {
    if (err.name === 'NotAllowedError') {
      logAudio('Autoplay blocked');
    } else {
      logAudio('Autoplay error', err);
    }
  });
}

function enter(i){const t=tok,s=S[i];sched(s,t,'data-t');if(i<11)cont(t,(+s.dataset.cont||3500));
 if(i===8)memory(t);
 if(i===11){
   setTimeout(()=>{
     if(t===tok&&idx===11){
       targetVol=0.16;
       fadeVolumeTo(0.16,4000);
     }
   },12000);
 } else if(bgm.volume<0.22&&!bgm.muted){
   targetVol=0.22;
   fadeVolumeTo(0.22,2000);
 }
 if(V[i]){const o=V[i];o.load();o.want=true;o.v.currentTime=0;if(o.ok)o.v.play().catch(()=>{});o.v.onended=()=>fin(i,t);setTimeout(()=>{if(!o.ok)fin(i,t)},6500)}
}
async function go(i){if(busy||i<1||i>11)return;busy=true;tok++;const sw=$('#sw');sw.classList.remove('run');void sw.offsetWidth;sw.classList.add('run');$('#cv').classList.add('on');
 await new Promise(r=>setTimeout(r,650));
 S.forEach(s=>{s.classList.remove('on','ended');s.querySelectorAll('.show,.gone').forEach(e=>e.classList.remove('show','gone'))});
 [intro,...Object.values(V)].forEach(o=>{o.want=false;o.v.pause()});$('#cont').classList.remove('on');
 idx=i;S[i].classList.add('on');B.classList.add('hud');B.classList.toggle('last',i===11);
 $('#cnt').textContent=i<11?String(i).padStart(2,'0')+' / 10':'COMPLETE';$('#pg').style.width=i/11*100+'%';
 enter(i);$('#cv').classList.remove('on');busy=false}
function title(){++tok;$('#bl').textContent='';$('#boot').classList.remove('feed');intro.want=false;intro.v.pause();$('#ttl').classList.add('show');$('#skipi').classList.add('gone');setTimeout(()=>$('#start').focus({preventScroll:true}),900)}
async function boot(){const t=++tok,l=x=>$('#bl').innerHTML=x;await wait(500,t);
 l('SYSTEM INITIALIZING...');if(!await wait(2000,t))return;l('ROUTE INITIALIZED');if(!await wait(1700,t))return;l('');
 $('#boot').classList.add('feed');intro.want=true;if(intro.ok)intro.v.play().catch(()=>{});
 const end=new Promise(r=>{intro.v.onended=r;setTimeout(()=>{if(!intro.ok)r()},7000)});await end;if(t!==tok)return;
 $('#boot').classList.remove('feed');if(!await wait(1500,t))return;l('DESTINATION:<br>UNKNOWN');if(!await wait(2800,t))return;title()}

$('#start').onclick=()=>{
  logAudio('User interaction detected: START THE JOURNEY');
  playMusic('START THE JOURNEY button');
  go(1);
};
$('#skipi').onclick=()=>{
  logAudio('User interaction detected: SKIP INTRO');
  playMusic('SKIP INTRO button');
  title();
};
$('#cont').onclick=()=>{
  playMusic('CONTINUE button');
  go(idx+1);
};
$('#skip').onclick=()=>{
  playMusic('SKIP button');
  go(idx+1);
};
$('#rep').onclick=()=>{
  playMusic('REPLAY button');
  go(idx);
};

const sndBtn=$('#snd');
if(sndBtn){
  sndBtn.onclick=()=>{
    if(!hasStarted||bgm.paused){
      playMusic('SOUND button');
      return;
    }
    bgm.muted=!bgm.muted;
    console.log('[SOFIE GT AUDIO] Mute toggled, muted =', bgm.muted);
    updateSoundUI();
  };
}
addEventListener('keydown',e=>{
  if(e.key==='m'||e.key==='M'){
    if(!hasStarted||bgm.paused){
      playMusic('M key');
    }else{
      bgm.muted=!bgm.muted;
      console.log('[SOFIE GT AUDIO] Mute toggled via M key, muted =', bgm.muted);
      updateSoundUI();
    }
  }
  if(idx<1)return;
  if(e.key==='ArrowRight')go(idx+1);
  if(e.key==='ArrowLeft')go(idx-1);
});
boot();

import * as THREE from './vendor/three/three.module.js';
import { createAutoAdvance } from './auto-advance.js';

const frames = [
  { mode: 'Current session', kicker: 'A familiar dead end', title: 'The build is stuck. Again.', code: '$ cargo build --release\n\nerror: linker `cc` not found', body: 'A new agent session encounters a problem that an earlier session has already worked through.', next: 'Find past experience →', caption: 'The useful experience is in the earlier work.' },
  { mode: 'Loop Breaker / suggestion', kicker: 'Retrieve the next action', title: 'A similar run has a way forward.', code: 'Past session · Rust CI\n\n“The CI image lacks a C toolchain.\nI’ll install build-essential\nbefore the build step.”', body: 'Inspect the action that followed the failure. A retrieved suggestion is a lead to examine, not a guaranteed fix.', next: 'Open the exact turn →', caption: 'A relevant past session is brought forward.' },
  { mode: 'Replay / source turn', kicker: 'Inspect the source turn', title: 'The action. The record. The result.', code: '.github/workflows/ci.yml\n\n+ apt-get install -y build-essential\n  cargo build\n\nNext turn / $ cargo build --release\nFinished release [optimized]', body: 'The source shows the workflow change and the subsequent build output. Use the evidence to decide what applies now.', next: 'Replay the walkthrough ↺', caption: 'The source turn stays attached to the suggestion.' },
];

export function mountMemoryDemo(host) {
  host.classList.add('memory-demo');
  host.innerHTML = `<div class="mm-topline"><span class="mm-wordmark">memex / time machine</span><span>Interactive illustration · synthetic session</span></div>
    <div class="mm-steps" role="group" aria-label="Memory walkthrough steps"><button type="button" data-memory-step="0" aria-pressed="true">01 / Encounter a failure</button><button type="button" data-memory-step="1" aria-pressed="false">02 / Recall experience</button><button type="button" data-memory-step="2" aria-pressed="false">03 / Inspect the source</button></div>
    <div class="mm-stage"><div class="mm-spatial"><div class="mm-spatial-title">Past work / a spatial session archive</div><div class="mm-fallback"><p>Python dependencies</p><p>Containerize API</p><p>Rust CI / missing toolchain</p></div><div class="mm-spatial-caption"></div></div>
    <div class="mm-terminal"><div class="mm-terminal-head"><span data-memory-mode></span><span>Memex</span></div><div class="mm-terminal-body" aria-live="polite"></div><div class="mm-terminal-footer"><span class="mm-position"></span><button type="button" class="mm-next"></button></div></div></div>
    <div class="mm-bottom"><span>Source-linked recall → a next action you can inspect.</span><a href="${new URL('./media-proposal/memex-replay.png', import.meta.url).href}" target="_blank" rel="noopener noreferrer">View the original replay interface ↗</a></div>`;
  let step = 0, updateDeck = () => {};
  const body = host.querySelector('.mm-terminal-body');
  // Keep the sizing and visibility with the frames, not in a separately cached
  // stylesheet. Even older CSS must show only one step, with a stable height.
  body.style.display = 'grid';
  const panels = frames.map((f, index) => {
    const panel = document.createElement('div');
    panel.className = 'mm-frame';
    panel.style.gridArea = '1 / 1';
    panel.style.minWidth = '0';
    for (const [tag, cls, content] of [['p','mm-kicker',f.kicker],['h4','',f.title],['pre','',f.code],['p','',f.body]]) {
      const el = document.createElement(tag); el.className = cls; el.textContent = content; panel.append(el);
    }
    if (index > 0) { const p = document.createElement('p'); p.className = 'mm-source'; p.textContent = 'Synthetic source / 11-infra-fix-ci-cache.jsonl'; panel.append(p); }
    return panel;
  });
  body.replaceChildren(...panels);
  const render = (announce = true) => {
    const f = frames[step];
    host.dataset.step = String(step);
    host.querySelectorAll('[data-memory-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.memoryStep) === step)));
    host.querySelector('[data-memory-mode]').textContent = f.mode;
    body.setAttribute('aria-live', announce ? 'polite' : 'off');
    panels.forEach((panel, index) => {
      panel.style.visibility = index === step ? 'visible' : 'hidden';
      panel.setAttribute('aria-hidden', String(index !== step));
    });
    host.querySelector('.mm-position').textContent = `0${step + 1} / 03`;
    host.querySelector('.mm-next').textContent = f.next;
    host.querySelector('.mm-spatial-caption').textContent = f.caption;
    updateDeck(step);
  };
  host.querySelectorAll('[data-memory-step]').forEach(button => button.addEventListener('click', () => { step = Number(button.dataset.memoryStep); render(); }));
  host.querySelector('.mm-next').addEventListener('click', () => { step = (step + 1) % frames.length; render(); });
  render();
  try { updateDeck = spatialArchive(host.querySelector('.mm-spatial')); updateDeck(step); }
  catch (error) { host.querySelector('.mm-spatial').dataset.renderer = 'fallback'; console.warn('Memory archive is using its text diagram.', error); }
  createAutoAdvance({ host, label: 'Memex', advance() { step = (step + 1) % frames.length; render(false); } });
}

function spatialArchive(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0xf7f6f2, 0);
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Past sessions arranged in a spatial archive. The Rust CI session moves forward when its experience is retrieved.');
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 60);
  camera.position.set(0, 0, 12);
  const world = new THREE.Group(); scene.add(world);
  const names = ['Python / Dependencies', 'API / Container setup', 'Rust CI / Missing toolchain'];
  const cards = names.map((name, index) => {
    const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 520;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = index === 2 ? '#e8ece2' : '#fdfcf8'; ctx.fillRect(0,0,900,520);
    ctx.strokeStyle = index === 2 ? '#87957e' : '#c6c9bf'; ctx.lineWidth = 2; ctx.strokeRect(1,1,898,518);
    ctx.fillStyle = index === 2 ? '#36472f' : '#242421'; ctx.font = '22px monospace'; ctx.fillText('Session / '+String(index+1).padStart(2,'0'),45,59);
    ctx.beginPath(); ctx.moveTo(45,83); ctx.lineTo(855,83); ctx.stroke();
    ctx.font = 'bold 35px monospace'; ctx.fillText(name,45,163);
    ctx.font = '25px monospace';
    const lines = index === 2 ? ['$ cargo build --release','linker `cc` not found','→ inspect the recorded next action'] : index === 1 ? ['$ docker build','A recorded development session','Tools · context · result'] : ['$ pip install -r requirements.txt','A recorded development session','Tools · context · result'];
    lines.forEach((text,i) => ctx.fillText(text,45,237+i*54));
    ctx.font = '20px monospace'; ctx.fillText('Synthetic session / local archive',45,470);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6.2,3.58), new THREE.MeshBasicMaterial({ map:texture, side:THREE.DoubleSide }));
    world.add(mesh); return mesh;
  });
  const grid = new THREE.GridHelper(18, 24, 0xc4c8bb, 0xe3e4da); grid.position.y = -2.3; scene.add(grid);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let state = 0, visible = false, frame = 0, remaining = 0;
  function target(i) { const active = i===2 && state>0; return { x:active ? .4 : -.35+i*.28, y:active ? -.05 : .75-i*.6, z:active ? 2 : -2+i*.8, rx:active ? -.05 : -.43, ry:active ? -.08 : -.34 }; }
  function draw(instant = false) {
    cards.forEach((card,i) => { const t=target(i), b=instant?1:.15; card.position.lerp(new THREE.Vector3(t.x,t.y,t.z),b); card.rotation.x += (t.rx-card.rotation.x)*b; card.rotation.y += (t.ry-card.rotation.y)*b; });
    renderer.render(scene,camera);
  }
  function tick() { frame=0; if(!visible||document.hidden)return; draw(motion.matches); if(!motion.matches && --remaining>0)frame=requestAnimationFrame(tick); }
  function refresh() { cancelAnimationFrame(frame); remaining=42; if(visible&&!document.hidden)frame=requestAnimationFrame(tick); else draw(true); }
  const ro=new ResizeObserver(() => { const {width,height}=host.getBoundingClientRect(); if(!width||!height)return; renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=width<400?13.5:12;camera.updateProjectionMatrix();draw(true); }); ro.observe(host);
  const io=new IntersectionObserver(([entry]) => { visible=entry.isIntersecting;if(visible)refresh();else {cancelAnimationFrame(frame);frame=0;} },{threshold:.05});io.observe(host);
  document.addEventListener('visibilitychange',refresh);
  motion.addEventListener('change',refresh);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);host.dataset.renderer='fallback';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.renderer='webgl';refresh();});
  host.dataset.renderer='webgl';draw(true);
  return key=>{state=key;host.dataset.memoryState=String(key);refresh();};
}

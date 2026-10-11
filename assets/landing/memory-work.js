import * as THREE from './vendor/three/three.module.js';
import { createAutoAdvance } from './auto-advance.js';

const frames = [
  { mode: 'Current session', title: 'The build is stuck. Again.', result: '$ cargo build --release\n→ linker `cc` not found', code: '$ cargo build --release\n\nerror: linker `cc` not found', body: 'A missing C toolchain stops the run. A past session has already encountered this failure.', next: 'Find past experience →', caption: 'Find experience in earlier work.' },
  { mode: 'Loop Breaker / suggestion', title: 'A similar run has a way forward.', result: 'Past session · Rust CI\n→ Install the missing C toolchain', code: 'Past session · Rust CI\n\n“The CI image lacks a C toolchain.\nI’ll install build-essential\nbefore the build step.”', body: 'Recall the next action from a similar session, with its source attached. Inspect it before applying it.', next: 'Open the exact turn →', caption: 'Bring a relevant session forward.' },
  { mode: 'Replay / source turn', title: 'The action. The record. The result.', result: '+ build-essential\n→ Finished release [optimized]', code: '.github/workflows/ci.yml\n\n+ apt-get install -y build-essential\n  cargo build\n\nNext turn / $ cargo build --release\nFinished release [optimized]', body: 'See the recorded change and later build output. Decide what applies to the current run.', next: 'Replay the walkthrough ↺', caption: 'Keep the source attached to the action.' },
];

export function mountMemoryDemo(host) {
  const replayUrl = new URL('./media-proposal/memex-replay.png', import.meta.url).href;
  host.classList.add('memory-demo');
  host.innerHTML = `<div class="mm-topline"><span class="mm-wordmark">Memex / session memory</span><span>Synthetic session walkthrough</span></div>
    <div class="mm-steps" role="group" aria-label="Memory walkthrough steps"><button type="button" data-memory-step="0" aria-pressed="true">01 / Encounter a failure</button><button type="button" data-memory-step="1" aria-pressed="false">02 / Recall experience</button><button type="button" data-memory-step="2" aria-pressed="false">03 / Inspect the source</button></div>
    <div class="mm-stage">
      <div class="mm-spatial"><div class="mm-spatial-title">Past sessions / a memory to return to</div><div class="mm-fallback"><p>Python dependencies</p><p>Containerize API</p><p>Rust CI / missing toolchain</p></div><div class="mm-spatial-caption"></div></div>
      <div class="mm-terminal"><div class="mm-terminal-head"><span data-memory-mode></span><span>Memex</span></div><div class="mm-terminal-body" aria-live="polite"></div>
        <details class="mm-detail"><summary>Inspect the session detail</summary><div class="mm-detail-body"><pre></pre><p class="mm-source">Synthetic source / 11-infra-fix-ci-cache.jsonl</p></div></details>
        <div class="mm-terminal-footer"><span class="mm-position"></span><button type="button" class="mm-next"></button></div>
      </div>
    </div>
    <div class="mm-bottom"><span>Illustrated workflow · synthetic session</span><button type="button" class="mm-open-replay" aria-haspopup="dialog">View the original Replay interface <span aria-hidden="true">↗</span></button></div>
    <dialog class="mm-replay-dialog" aria-labelledby="mm-replay-title"><div class="mm-replay-head"><div><h4 id="mm-replay-title">Inside Memex Replay</h4><p>Original product interface · synthetic Rust CI session</p></div><button type="button" class="mm-close-replay" autofocus aria-label="Close Replay image">Close <span aria-hidden="true">×</span></button></div><div class="mm-replay-scroll" tabindex="0" aria-label="Original Replay interface. Scroll horizontally on smaller screens to inspect the session."><div class="mm-replay-image"><img src="${replayUrl}" width="1920" height="1248" loading="lazy" decoding="async" alt="Memex Replay interface showing eight turns of a synthetic Rust CI session and the recorded missing-linker error."></div></div><div class="mm-replay-bottom"><span>Eight turns. One recorded session.</span><a href="${replayUrl}" target="_blank" rel="noopener noreferrer">Open full image ↗</a></div></dialog>`;
  let step = 0, updateDeck = () => {};
  const body = host.querySelector('.mm-terminal-body');
  const detail = host.querySelector('.mm-detail');
  const replay = host.querySelector('.mm-replay-dialog');
  host.querySelector('.mm-open-replay').addEventListener('click', () => { replay.showModal(); autoplay.restart(); });
  host.querySelector('.mm-close-replay').addEventListener('click', () => replay.close());
  replay.addEventListener('click', event => {
    if (event.target !== replay) return;
    const rect = replay.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) replay.close();
  });
  // Keep the sizing and visibility with the frames, not in a separately cached
  // stylesheet. Even older CSS must show only one step, with a stable height.
  body.style.display = 'grid';
  const panels = frames.map(f => {
    const panel = document.createElement('div');
    panel.className = 'mm-frame';
    panel.style.gridArea = '1 / 1';
    panel.style.minWidth = '0';
    for (const [tag, cls, content] of [['h4','',f.title],['pre','mm-result',f.result],['p','',f.body]]) {
      const el = document.createElement(tag); el.className = cls; el.textContent = content; panel.append(el);
    }
    return panel;
  });
  body.replaceChildren(...panels);
  const render = (announce = true) => {
    const f = frames[step];
    host.dataset.step = String(step);
    host.querySelectorAll('[data-memory-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.memoryStep) === step)));
    host.querySelector('[data-memory-mode]').textContent = f.mode;
    detail.querySelector('pre').textContent = f.code;
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
  host.querySelectorAll('[data-memory-step]').forEach(button => button.addEventListener('click', () => { detail.open = false; step = Number(button.dataset.memoryStep); render(); }));
  host.querySelector('.mm-next').addEventListener('click', () => { detail.open = false; step = (step + 1) % frames.length; render(); });
  render();
  try { updateDeck = spatialArchive(host.querySelector('.mm-spatial')); updateDeck(step); }
  catch (error) { host.querySelector('.mm-spatial').dataset.renderer = 'fallback'; console.warn('Memory archive is using its text diagram.', error); }
  const autoplay = createAutoAdvance({ host, label: 'Memex', advance() {
    // Keep an expanded record readable even with an older autoplay module.
    if (detail.open || replay.open) return;
    step = (step + 1) % frames.length;
    render(false);
  } });
  detail.addEventListener('toggle', () => {
    // The shared controls expose expanded details as a pause. Restarting here
    // also gives cached autoplay modules a full interval after the record closes.
    autoplay.restart();
  });
  replay.addEventListener('close', () => autoplay.restart());
}

function spatialArchive(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0xf7f6f2, 0);
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Past sessions arranged in a spatial archive. The Rust CI session moves forward when its experience is retrieved.');
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 4, -4, .1, 60);
  camera.position.set(0, 0, 12);
  const world = new THREE.Group(); scene.add(world);
  const names = ['Python / Dependencies', 'API / Container setup', 'Rust CI / Missing toolchain'];
  const cards = names.map((name, index) => {
    const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 520;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = index === 2 ? '#e8ece2' : '#fdfcf8'; ctx.fillRect(0,0,900,520);
    ctx.strokeStyle = index === 2 ? '#87957e' : '#c6c9bf'; ctx.lineWidth = 2; ctx.strokeRect(1,1,898,518);
    ctx.fillStyle = index === 2 ? '#36472f' : '#242421'; ctx.font = '28px monospace'; ctx.fillText('Session / '+String(index+1).padStart(2,'0'),45,59);
    ctx.beginPath(); ctx.moveTo(45,83); ctx.lineTo(855,83); ctx.stroke();
    ctx.font = 'bold 36px monospace'; ctx.fillText(name,45,163);
    ctx.font = '31px monospace';
    const lines = index === 2 ? ['$ cargo build --release','linker `cc` not found','→ Recall the next action'] : index === 1 ? ['$ docker build','A past development session','Tools · context · result'] : ['$ pip install -r requirements.txt','A past development session','Tools · context · result'];
    lines.forEach((text,i) => ctx.fillText(text,45,237+i*54));
    ctx.font = '26px monospace'; ctx.fillText('Synthetic session / local archive',45,470);
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
  const ro=new ResizeObserver(() => {
    const {width,height}=host.getBoundingClientRect(); if(!width||!height)return;
    renderer.setSize(width,height,false);
    // Fit the card deck, not a fixed perspective distance: a short viewport
    // must never turn the main illustration into a miniature on a wide grid.
    const aspect=width/height, viewWidth=Math.max(7.6,6.1*aspect), viewHeight=viewWidth/aspect;
    camera.left=-viewWidth/2;camera.right=viewWidth/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;
    camera.updateProjectionMatrix();draw(true);
  }); ro.observe(host);
  const io=new IntersectionObserver(([entry]) => { visible=entry.isIntersecting;if(visible)refresh();else {cancelAnimationFrame(frame);frame=0;} },{threshold:.05});io.observe(host);
  document.addEventListener('visibilitychange',refresh);
  motion.addEventListener('change',refresh);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);host.dataset.renderer='fallback';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{host.dataset.renderer='webgl';refresh();});
  host.dataset.renderer='webgl';draw(true);
  return key=>{state=key;host.dataset.memoryState=String(key);refresh();};
}

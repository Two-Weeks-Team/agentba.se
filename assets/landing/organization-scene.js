// A conceptual organization, not a feed of current business activity.
// Three.js is pinned locally; the copy controller and text fallback work independently.
import * as THREE from './vendor/three/three.module.js';
import { blueprint } from './organization-blueprint.mjs';

const vector = p => new THREE.Vector3(...p);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = THREE.MathUtils.clamp;


class OrganizationScene {
  constructor(host) {
    this.host = host;
    this.view = host.closest('.organization-view');
    this.pauseButton = this.view.querySelector('[data-scene-pause]');
    this.resetButton = this.view.querySelector('[data-scene-reset]');
    this.hint = this.view.querySelector('[data-scene-hint]');
    this.abort = new AbortController();
    this.visible = false;
    this.paused = false;
    this.lost = false;
    this.time = 0;
    this.lastTime = 0;
    this.frame = 0;
    this.transition = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.spin = 0;
    this.drag = null;
    this.disposed = false;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    this.renderer.setClearColor(0xf7f6f2, host.dataset.sceneLayout === 'shared' ? 0 : 1);
    this.canvas = this.renderer.domElement;
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', 'Interactive conceptual organization. Drag horizontally or use arrow keys to rotate. Home resets the view.');
    host.append(this.canvas);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-6, 6, 5, -5, .1, 100);
    this.camera.position.set(9, 6.8, 11);
    this.camera.lookAt(0, .45, 0);
    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.edgesGeometry = new THREE.EdgesGeometry(this.geometry);
    this.white = [0xe2dfd5, 0xedeae1, 0xfdfcf8, 0xd6d2c7, 0xf4f1e8, 0xe8e4d9].map(color => new THREE.MeshBasicMaterial({ color }));
    this.black = new THREE.MeshBasicMaterial({ color: 0x363931 });
    this.outline = new THREE.LineBasicMaterial({ color: 0x99978c });
    this.inkOutline = new THREE.LineBasicMaterial({ color: 0x676c60 });
    this.wire = new THREE.LineBasicMaterial({ color: 0xa2a398 });
    this.particleMaterial = new THREE.MeshBasicMaterial({ color: 0xa56d48, depthTest: false });
    this.particleGeometry = new THREE.SphereGeometry(.057, 8, 6);

    this.blocks = Array.from({ length: 40 }, () => {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(this.geometry, this.white);
      const edge = new THREE.LineSegments(this.edgesGeometry, this.outline);
      group.add(mesh, edge);
      group.scale.setScalar(.001);
      group.visible = false;
      this.world.add(group);
      return { group, mesh, edge, targetP: new THREE.Vector3(), targetS: new THREE.Vector3(), active: false };
    });
    this.paths = [];
    this.labels = [];
    this.labelLayer = document.createElement('div');
    this.labelLayer.className = 'scene-labels';
    this.labelLayer.setAttribute('aria-hidden', 'true');
    host.append(this.labelLayer);

    const grid = new THREE.GridHelper(11, 16, 0xd8d6cc, 0xe2e0d7);
    grid.material.transparent = true;
    grid.material.opacity = .45;
    grid.position.y = -2.4;
    this.world.add(grid);
    this.grid = grid;
    this.projected = new THREE.Vector3();

    this.setStage(host.dataset.sceneStage || 'company', true);
    this.resize();
    host.dataset.renderer = 'webgl';
    host.dataset.threeVersion = THREE.REVISION;
    this.pauseButton.disabled = false;
    this.resetButton.disabled = false;
    this.bind();
    this.refresh();
  }

  setStage(key, instant = false) {
    const data = blueprint(key);
    this.host.dataset.sceneStage = key;
    this.canvas.setAttribute('aria-describedby', this.host.querySelector('.scene-fallback').id);
    this.blocks.forEach((item, i) => {
      const target = data.blocks[i];
      item.active = Boolean(target);
      if (target) {
        item.targetP.fromArray(target.p);
        item.targetS.fromArray(target.s);
        item.mesh.material = target.ink ? this.black : this.white;
        item.edge.material = target.ink ? this.inkOutline : this.outline;
        if (!item.group.visible) item.group.position.copy(item.targetP).multiplyScalar(.55);
        item.group.visible = true;
      } else item.targetS.setScalar(.001);
      if (instant || this.static) {
        item.group.position.copy(item.targetP);
        item.group.scale.copy(item.targetS);
        item.group.visible = item.active;
      }
    });
    this.paths.forEach(p => { this.world.remove(p.line, ...p.particles); p.line.geometry.dispose(); });
    this.paths = data.links.map((points, i) => {
      const vectors = points.map(vector);
      const curve = new THREE.CurvePath();
      for (let j = 1; j < vectors.length; j++) curve.add(new THREE.LineCurve3(vectors[j - 1], vectors[j]));
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(vectors), this.wire);
      const particles = Array.from({ length: 2 }, () => new THREE.Mesh(this.particleGeometry, this.particleMaterial));
      particles.forEach(p => { p.renderOrder = 2; });
      this.world.add(line, ...particles);
      return { line, curve, particles, offset: i * .17 };
    });
    this.labelLayer.replaceChildren();
    this.labels = data.labels.map(({ name, p }) => {
      const el = document.createElement('span');
      el.className = 'scene-label';
      el.textContent = name;
      this.labelLayer.append(el);
      return { el, point: vector(p) };
    });
    this.transition = instant || this.static ? 0 : 1;
    this.host.dataset.transition = this.transition ? 'moving' : 'settled';
    this.refresh();
  }

  get static() { return this.paused || reducedMotion.matches; }

  resize() {
    this.width = this.host.clientWidth;
    this.height = this.host.clientHeight;
    if (!this.width || !this.height) return;
    const aspect = this.width / this.height;
    // A full-width canvas leaves room for the narrative in the same scene.
    // The camera, rather than a second panel, places the organization to the right.
    this.sharedLayout = this.host.dataset.sceneLayout === 'shared' && matchMedia('(min-width: 901px)').matches;
    const viewAspect = this.sharedLayout ? aspect * .54 : aspect;
    // The hero is the main visual: give the organization a closer framing while
    // preserving the full-width transparent canvas and room for the left copy.
    // Other progression scenes keep their existing camera framing.
    const heroFraming = this.host.dataset.sceneFraming === 'hero';
    const vertical = heroFraming ? Math.max(7.4, 8.3 / viewAspect) : Math.max(8.6, 10.2 / viewAspect);
    const shift = this.sharedLayout ? vertical * aspect * .235 : 0;
    this.camera.left = -vertical * aspect / 2 - shift;
    this.camera.right = vertical * aspect / 2 - shift;
    this.camera.top = vertical / 2;
    this.camera.bottom = -vertical / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
    this.refresh();
  }

  bind() {
    const on = (target, type, handler) => target.addEventListener(type, handler, { signal: this.abort.signal });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.intersectionObserver = new IntersectionObserver(entries => {
      this.visible = entries[0].isIntersecting;
      this.refresh();
    }, { threshold: .05 });
    this.intersectionObserver.observe(this.host);
    on(document, 'visibilitychange', () => this.refresh());
    on(reducedMotion, 'change', () => {
      // Never start automatic movement while the OS preference requests less motion.
      if (reducedMotion.matches) this.finishTransition();
      this.refresh();
    });
    on(this.pauseButton, 'click', () => {
      this.paused = !this.paused;
      if (this.paused) this.finishTransition();
      this.refresh();
    });
    on(this.resetButton, 'click', () => { this.yaw = this.pitch = this.spin = 0; this.refresh(); });
    on(this.canvas, 'pointerdown', e => {
      if (e.button !== 0) return;
      this.drag = { x: e.clientX, y: e.clientY, yaw: this.yaw, pitch: this.pitch, touch: e.pointerType === 'touch' };
      this.canvas.setPointerCapture(e.pointerId);
    });
    on(this.canvas, 'pointermove', e => {
      if (!this.drag) return;
      this.yaw = clamp(this.drag.yaw + (e.clientX - this.drag.x) * .006, -.85, .85);
      if (!this.drag.touch) this.pitch = clamp(this.drag.pitch + (e.clientY - this.drag.y) * .003, -.2, .28);
      this.refresh();
    });
    const end = () => { this.drag = null; };
    on(this.canvas, 'pointerup', end);
    on(this.canvas, 'pointercancel', end);
    on(this.canvas, 'lostpointercapture', end);
    on(this.canvas, 'keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'Home') this.yaw = this.pitch = this.spin = 0;
      if (e.key === 'ArrowLeft') this.yaw = clamp(this.yaw - .12, -.85, .85);
      if (e.key === 'ArrowRight') this.yaw = clamp(this.yaw + .12, -.85, .85);
      if (e.key === 'ArrowUp') this.pitch = clamp(this.pitch - .08, -.2, .28);
      if (e.key === 'ArrowDown') this.pitch = clamp(this.pitch + .08, -.2, .28);
      this.refresh();
    });
    on(this.canvas, 'webglcontextlost', e => {
      e.preventDefault();
      this.lost = true;
      this.host.dataset.renderer = 'fallback';
      this.refresh();
    });
    on(this.canvas, 'webglcontextrestored', () => {
      this.lost = false;
      this.host.dataset.renderer = 'webgl';
      this.resize();
    });
    on(window, 'agentbase:stage', e => {
      if (this.host.id === 'stage-organization') this.setStage(e.detail.key);
    });
    // bfcache must be able to resume; dispose only on a real page exit.
    on(window, 'pagehide', e => { if (e.persisted) this.stop(); else this.dispose(); });
    on(window, 'pageshow', () => this.refresh());
  }

  finishTransition() {
    this.transition = 0;
    this.blocks.forEach(b => { b.group.position.copy(b.targetP); b.group.scale.copy(b.targetS); b.group.visible = b.active; });
    this.host.dataset.transition = 'settled';
  }

  refresh() {
    if (this.disposed) return;
    const active = this.visible && !document.hidden && !this.static && !this.lost;
    this.host.dataset.motion = this.lost ? 'unavailable' : reducedMotion.matches ? 'reduced' : this.paused ? 'paused' : active ? 'running' : 'idle';
    this.pauseButton.disabled = reducedMotion.matches || this.lost;
    this.pauseButton.textContent = reducedMotion.matches ? 'Motion off' : this.paused ? 'Play motion' : 'Pause motion';
    this.pauseButton.setAttribute('aria-pressed', String(this.paused || reducedMotion.matches));
    this.resetButton.disabled = this.lost;
    this.hint.textContent = this.lost ? 'Text diagram available' : 'Drag to rotate';
    if (!this.lost) this.render(0);
    if (active && !this.frame) {
      this.lastTime = performance.now();
      this.frame = requestAnimationFrame(t => this.tick(t));
    } else if (!active) this.stop();
  }

  stop() { cancelAnimationFrame(this.frame); this.frame = 0; }

  tick(now) {
    this.frame = 0;
    if (this.disposed || this.static || this.lost || !this.visible || document.hidden) return;
    const dt = Math.min((now - this.lastTime) / 1000, .05);
    this.lastTime = now;
    this.time += dt;
    if (!this.drag) this.spin = Math.sin(this.time * .22) * .09;
    this.render(dt);
    this.frame = requestAnimationFrame(t => this.tick(t));
  }

  render(dt) {
    if (!this.width || !this.height || this.lost || this.disposed) return;
    const blend = 1 - Math.exp(-dt * 7);
    if (this.transition) {
      this.blocks.forEach(b => { b.group.position.lerp(b.targetP, blend); b.group.scale.lerp(b.targetS, blend); });
      this.transition *= 1 - blend;
      if (this.transition < .002) this.finishTransition();
    }
    this.world.rotation.set(this.pitch, this.yaw + this.spin, 0);
    this.paths.forEach(path => {
      path.line.visible = this.transition < .35;
      path.particles.forEach((p, i) => {
        p.visible = this.transition < .15;
        p.position.copy(path.curve.getPoint((this.time * .15 + path.offset + i * .5) % 1));
      });
    });
    this.renderer.render(this.scene, this.camera);
    // Labels remain real, readable HTML instead of tiny text baked into a texture.
    this.world.updateMatrixWorld();
    const placed = [];
    this.labels.forEach(({ el, point }) => {
      this.projected.copy(point).applyMatrix4(this.world.matrixWorld).project(this.camera);
      const w = el.offsetWidth, h = el.offsetHeight;
      const x = clamp((this.projected.x + 1) * this.width / 2 - w / 2, this.sharedLayout ? this.width * .44 : 3, this.width - w - 3);
      let y = clamp((1 - this.projected.y) * this.height / 2 - h / 2, 4, this.height - h - 4);
      // Projected nodes can share screen space on a phone or after a rotation.
      // Keep every annotation legible without clipping the organization.
      for (let pass = 0; pass < 5; pass++) {
        const collision = placed.find(r => x < r.x + r.w + 4 && x + w + 4 > r.x && y < r.y + r.h + 4 && y + h + 4 > r.y);
        if (!collision) break;
        y = collision.y + collision.h + 5;
        if (y + h > this.height - 4) y = collision.y - h - 5;
      }
      placed.push({ x, y, w, h });
      el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      el.style.opacity = this.transition > .2 ? '0' : '1';
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.abort.abort();
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.paths.forEach(p => p.line.geometry.dispose());
    [this.geometry, this.edgesGeometry, this.particleGeometry, this.grid.geometry].forEach(g => g.dispose());
    [...this.white, this.black, this.outline, this.inkOutline, this.wire, this.particleMaterial, this.grid.material].forEach(m => m.dispose());
    this.renderer.dispose();
  }
}

document.querySelectorAll('.organization-scene').forEach(host => {
  try { new OrganizationScene(host); }
  catch (error) {
    host.dataset.renderer = 'fallback';
    host.closest('.organization-view').querySelector('[data-scene-hint]').textContent = 'Text diagram available';
    console.warn('The conceptual diagram is using its text fallback.', error);
  }
});

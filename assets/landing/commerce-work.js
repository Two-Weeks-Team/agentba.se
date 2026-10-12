import { t, localize } from './locale.js';
/**
 * Continuous product film beside a video → product → source walkthrough.
 * Load commerce-work.css separately. No production requests are made.
 * mountCommerceDemo(host) returns cleanup; remounting is safe.
 *
 * Generated sample imagery: Two-Weeks-Team/kbeauty.market at
 * 792b5a315d48b4d6a97f02d325dba4de12025e10, public/img/.
 * docs/BRIEF.md identifies these as unbranded illustrations, not real SKUs.
 * product-film.mp4/png is our original procedural 3D film, authored in
 * scripts/commerce-film.html. It is not creator footage or a review.
 *
 * Actual flow: components/shop/clip-stage.tsx keeps clips, product photos,
 * and the original-source link connected. figure-card.tsx associates clips
 * with products. The storefront has no own checkout enabled.
 * media-proposal/kbeauty-video-reference.png is an unaltered product UI
 * capture from 2026-09-12; its visible detail links to the full screenshot.
 * It is historical interface evidence, not current embed playback evidence.
 */

import { createAutoAdvance } from './auto-advance.js';

const mounts = new WeakMap();
let instanceCount = 0;
const media = name => new URL(`./media/commerce/${name}`, import.meta.url).href;
const referenceImage = new URL('./media-proposal/kbeauty-video-reference.png', import.meta.url).href;
const views = [
  {
    id: 'in-use', label: 'Video', title: 'Start with the video.',
    description: 'Discover a product through a creator or brand clip.',
    detail: 'Linked to this clip', next: 'Find product',
  },
  {
    id: 'product', label: 'Product', title: 'Meet the product.',
    description: 'Move from the clip to product photos and details.',
    detail: 'Sample skincare product', next: 'See source',
  },
  {
    id: 'source', label: 'Source', title: 'Keep the source.',
    description: 'A direct link leads back to the creator or brand’s original clip.',
    detail: 'Original clip link', next: 'Replay flow',
  },
];

function publicDestination(host) {
  const supplied = host.dataset.productUrl || host.dataset.liveProductUrl;
  try {
    const url = new URL(supplied || 'https://kbeauty.market', 'https://kbeauty.market');
    if (url.protocol === 'https:' && url.hostname === 'kbeauty.market' && !url.username && !url.password) {
      return { href: url.href, product: url.pathname.startsWith('/shop/') && url.pathname.length > 6 };
    }
  } catch {
    // Optional malformed product URLs fall back to the storefront.
  }
  return { href: 'https://kbeauty.market/', product: false };
}

/** @param {HTMLElement} host @returns {() => void} */
export function mountCommerceDemo(host) {
  if (!host?.ownerDocument || typeof host.appendChild !== 'function') {
    throw new TypeError('mountCommerceDemo requires a host element.');
  }
  mounts.get(host)?.();
  const document = host.ownerDocument;
  const window = document.defaultView;
  const prefix = `kb-walkthrough-${++instanceCount}`;
  const root = document.createElement('section');
  root.className = 'commerce-demo';
  root.dataset.kbView = views[0].id;
  root.setAttribute('aria-label', 'Kbeauty video-first discovery walkthrough');
  root.innerHTML = `
    <header class="kb-header">
      <span class="kb-wordmark">kbeauty.market</span>
      <span class="kb-edition">Illustrated flow</span>
    </header>
    <div class="kb-selectors" role="tablist" aria-label="From video to product to source">
      ${views.map((view, index) => `
        <button class="kb-view" id="${prefix}-${view.id}" type="button" role="tab"
          aria-controls="${prefix}-panel-${index}" aria-selected="${index === 0}"
          tabindex="${index === 0 ? '0' : '-1'}" data-kb-select="${index}">
          <span class="kb-step-number" aria-hidden="true">0${index + 1}</span>
          <span>${view.label}</span><span class="kb-step-arrow" aria-hidden="true">${index < 2 ? '→' : '↗'}</span>
        </button>
      `).join('')}
    </div>
    <div class="kb-body">
      <div class="kb-gallery">
        <figure class="kb-frame">
          <video class="kb-frame-video" muted loop playsinline preload="none"
            poster="${media('product-film.png')}" aria-label="Silent illustrative film of a sample skincare bottle"></video>
          <span class="kb-image-label">3D film</span>
          <button type="button" class="kb-film-toggle" data-kb-film-toggle aria-label="Play illustrative product film">Play</button>
          <figcaption class="kb-frame-caption">Illustrative sample product</figcaption>
          <span class="kb-film-progress" aria-hidden="true"><span></span></span>
        </figure>
      </div>
      <div class="kb-panels">
        ${views.map((view, index) => `
          <section class="kb-panel" id="${prefix}-panel-${index}" role="tabpanel"
            aria-labelledby="${prefix}-${view.id}" aria-hidden="${index !== 0}"
            style="visibility:${index ? 'hidden' : 'visible'}" ${index ? 'inert' : ''}>
            <div class="kb-view-context">
              <p class="kb-kicker">${index === 0 ? 'Video first' : index === 1 ? 'Product connected' : 'Source preserved'}</p>
              <h3 class="kb-title">${view.title}</h3>
              <p class="kb-context-copy">${view.description}</p>
            </div>
            <div class="kb-detail kb-detail--${view.id}">
              ${index === 2 ? `
                <span class="kb-source-mark" aria-hidden="true">↗</span>
                <div><p class="kb-detail-name">Creator / brand</p><p class="kb-detail-copy">${view.detail}</p></div>
              ` : `
                <img class="kb-product-image" src="${media('pdp-ampoule-hero.webp')}" width="112" height="112"
                  alt="Generated unbranded bottle representing a sample skincare product." decoding="async">
                <div><p class="kb-detail-name">${index === 0 ? 'Same product' : view.detail}</p>
                  <p class="kb-detail-copy">${index === 0 ? view.detail : 'Generated product still'}</p></div>
              `}
            </div>
            <button class="kb-find" type="button" data-kb-find="${(index + 1) % views.length}">
              <span>${view.next}</span><span aria-hidden="true">→</span>
            </button>
          </section>
        `).join('')}
      </div>
    </div>
    <figure class="kb-evidence">
      <a class="kb-reference-preview" href="${referenceImage}" target="_blank" rel="noopener noreferrer"
        aria-label="Open the full kbeauty.market product interface screenshot from September 12, 2026">
        <img src="${referenceImage}" width="305" height="804" loading="lazy" decoding="async"
          alt="Detail of the actual kbeauty.market interface showing an embedded creator clip.">
      </a>
      <figcaption>
        <p class="kb-kicker">From the actual storefront</p>
        <p class="kb-evidence-title">The clip lives with the product.</p>
        <p class="kb-evidence-copy">Product UI reference · Sep 12, 2026</p>
        <a class="kb-reference-link" href="${referenceImage}" target="_blank" rel="noopener noreferrer">
          View full screenshot <span aria-hidden="true">↗</span><span class="kb-sr-only"> (opens in a new tab)</span>
        </a>
      </figcaption>
    </figure>
    <footer class="kb-footer">
      <span class="kb-connection">Video → product → original source</span>
      <a class="kb-live-link" data-kb-live-link target="_blank" rel="noopener noreferrer">
        <span data-kb-live-label>Visit kbeauty.market</span><span aria-hidden="true">↗</span><span class="kb-sr-only"> (opens in a new tab)</span>
      </a>
    </footer>
    <p class="kb-sr-only" data-kb-status role="status" aria-live="polite" aria-atomic="true"></p>
  `;

  const tabs = [...root.querySelectorAll('[data-kb-select]')];
  const panels = [...root.querySelectorAll('.kb-panel')];
  const frame = root.querySelector('.kb-frame');
  const status = root.querySelector('[data-kb-status]');
  const video = root.querySelector('video');
  const videoToggle = root.querySelector('[data-kb-film-toggle]');
  const videoProgress = root.querySelector('.kb-film-progress > span');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { signal: events.signal });
  let selected = 0;
  let videoVisible = false, videoPaused = false, manualPlay = false, disposed = false, pageActive = true;
  video.muted = true;

  function videoControls() {
    const playing = !video.paused && !video.ended;
    videoToggle.textContent = t(video.error ? 'Unavailable' : playing ? 'Pause' : 'Play');
    videoToggle.disabled = Boolean(video.error);
    videoToggle.setAttribute('aria-label', t(video.error ? 'Illustrative film unavailable' : `${playing ? 'Pause' : 'Play'} illustrative product film`));
    root.dataset.videoState = video.error ? 'error' : playing ? 'playing' : 'paused';
  }

  function syncVideo() {
    // Information tabs never replace, seek, remount, or hide this video.
    const shouldPlay = !disposed && pageActive && videoVisible && !document.hidden && !videoPaused &&
      host.dataset.autoplay !== 'paused' && (!motion.matches || manualPlay);
    if (!shouldPlay || video.error) { video.pause(); videoControls(); return; }
    if (!video.getAttribute('src')) video.src = media('product-film.mp4');
    if (video.paused) video.play().catch(() => { if (!disposed) videoControls(); });
  }

  on(videoToggle, 'click', () => {
    if (video.paused) { videoPaused = false; manualPlay = true; }
    else { videoPaused = true; manualPlay = false; }
    syncVideo();
  });
  for (const type of ['playing', 'pause', 'error']) on(video, type, videoControls);
  on(video, 'timeupdate', () => {
    const progress = Number.isFinite(video.duration) && video.duration > 0 ? video.currentTime / video.duration : 0;
    videoProgress.style.transform = `scaleX(${progress})`;
  });
  on(document, 'visibilitychange', syncVideo);
  on(motion, 'change', () => { manualPlay = false; syncVideo(); });
  on(window, 'pagehide', () => { pageActive = false; syncVideo(); });
  on(window, 'pageshow', () => { pageActive = true; syncVideo(); });
  const videoObserver = new IntersectionObserver(([entry]) => {
    videoVisible = entry.isIntersecting && entry.intersectionRatio >= .2;
    syncVideo();
  }, { threshold: .2 });
  videoObserver.observe(frame);
  const playbackObserver = new MutationObserver(syncVideo);
  playbackObserver.observe(host, { attributes: true, attributeFilter: ['data-autoplay'] });
  const destination = publicDestination(host);
  root.querySelector('[data-kb-live-link]').href = destination.href;
  root.querySelector('[data-kb-live-label]').textContent = destination.product ? 'Explore the live product' : 'Visit kbeauty.market';

  function select(index, announce = true) {
    if (index === selected || !Number.isInteger(index) || !views[index]) return;
    selected = index;
    root.dataset.kbView = views[index].id;
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].setAttribute('aria-hidden', String(!active));
      panels[i].inert = !active;
      panels[i].style.visibility = active ? 'visible' : 'hidden';
    });
    if (announce) status.textContent = `${t(views[index].label)}. ${t(views[index].description)}`;
  }

  on(root, 'click', event => {
    const tab = event.target.closest?.('[data-kb-select]');
    if (tab && root.contains(tab)) select(Number(tab.dataset.kbSelect));
    const find = event.target.closest?.('[data-kb-find]');
    if (find && root.contains(find)) {
      const next = Number(find.dataset.kbFind);
      select(next);
      // The old panel becomes inert; retain keyboard focus in the selected tab.
      tabs[next].focus({ preventScroll: true });
    }
  });
  on(root, 'keydown', event => {
    const tab = event.target.closest?.('[data-kb-select]');
    if (!tab || !root.contains(tab)) return;
    const current = tabs.indexOf(tab);
    const next = {
      ArrowDown: (current + 1) % views.length,
      ArrowRight: (current + 1) % views.length,
      ArrowUp: (current + views.length - 1) % views.length,
      ArrowLeft: (current + views.length - 1) % views.length,
      Home: 0,
      End: views.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
    tabs[next].focus({ preventScroll: true });
  });

  localize(root);
  host.appendChild(root);
  const tour = createAutoAdvance({ host, label: 'Kbeauty', advance: () => select((selected + 1) % views.length, false) });
  const dispose = () => {
    disposed = true;
    tour.destroy();
    videoObserver.disconnect();
    playbackObserver.disconnect();
    events.abort();
    video.pause();
    video.removeAttribute('src');
    video.load();
    root.remove();
    if (mounts.get(host) === dispose) mounts.delete(host);
  };
  mounts.set(host, dispose);
  return dispose;
}

// Local walkthrough playback only: advancing never invokes a product or service.
export function createAutoAdvance({ host, advance, label, hoverTarget = host, pauseControl, delay = 1000 }) {
  const doc = host.ownerDocument;
  const view = doc.defaultView;
  const motion = view.matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { signal: abort.signal });
  let timer = 0;
  let visible = false;
  let hovering = view.matchMedia('(hover: hover)').matches && hoverTarget.matches(':hover');
  let keyboardFocus = false;
  let paused = false;
  let disposed = false;
  let controls, status, button;

  if (!pauseControl) {
    controls = doc.createElement('div');
    controls.className = 'demo-tour-controls';
    status = doc.createElement('span');
    button = doc.createElement('button');
    button.type = 'button';
    button.className = 'demo-tour-toggle';
    button.setAttribute('aria-controls', host.id);
    controls.append(status, button);
    host.after(controls);
    on(button, 'click', () => { paused = !paused; restart(); });
  }

  function restart() {
    view.clearTimeout(timer);
    if (disposed) return;
    const state = motion.matches ? 'reduced' : paused || pauseControl?.getAttribute('aria-pressed') === 'true' ? 'paused'
      : pauseControl?.disabled ? 'unavailable' : keyboardFocus ? 'focus' : hovering ? 'hover'
      : doc.hidden ? 'hidden' : !visible ? 'offscreen' : 'running';
    host.dataset.autoplay = state;
    if (button) {
      status.textContent = state === 'reduced' ? 'Manual walkthrough' : ['paused', 'focus', 'hover'].includes(state) ? 'Walkthrough paused' : 'Auto walkthrough';
      button.textContent = paused ? 'Resume' : 'Pause';
      button.setAttribute('aria-label', `${paused ? 'Resume' : 'Pause'} ${label} walkthrough`);
      button.setAttribute('aria-pressed', String(paused));
      button.disabled = motion.matches;
    }
    if (state !== 'running') return;
    // A manual selection or pause always gives the next state a full interval.
    timer = view.setTimeout(() => { advance(); restart(); }, delay);
  }

  on(hoverTarget, 'pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovering = true;
    restart();
  });
  on(hoverTarget, 'pointerleave', event => {
    if (event.pointerType === 'touch') return;
    hovering = false;
    restart();
  });
  on(hoverTarget, 'pointerdown', () => { keyboardFocus = false; restart(); });
  on(hoverTarget, 'focusin', event => { keyboardFocus = event.target.matches(':focus-visible'); restart(); });
  on(hoverTarget, 'focusout', event => {
    if (hoverTarget.contains(event.relatedTarget)) return;
    keyboardFocus = false;
    restart();
  });
  on(hoverTarget, 'keydown', () => { keyboardFocus = true; restart(); });
  on(hoverTarget, 'click', restart);
  on(motion, 'change', restart);
  on(doc, 'visibilitychange', restart);
  on(view, 'pagehide', () => view.clearTimeout(timer));
  on(view, 'pageshow', restart);

  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .2;
    restart();
  }, { threshold: .2 });
  observer.observe(host);
  const pauseObserver = new MutationObserver(restart);
  if (pauseControl) pauseObserver.observe(pauseControl, { attributes: true, attributeFilter: ['aria-pressed', 'disabled'] });
  restart();

  return {
    restart,
    destroy() {
      disposed = true;
      view.clearTimeout(timer);
      abort.abort();
      observer.disconnect();
      pauseObserver.disconnect();
      controls?.remove();
      delete host.dataset.autoplay;
    },
  };
}

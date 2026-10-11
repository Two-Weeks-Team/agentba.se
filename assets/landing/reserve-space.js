// Measure the real content at the current width, rather than guessing a fixed
// mobile height. Only the small changing regions reserve their largest state.
export function reserveSpace(host, prepare) {
  const view = host.ownerDocument.defaultView;
  let width = 0;
  let frame;
  let disposed = false;
  function measure() {
    if (disposed || !host.isConnected) return;
    const clone = host.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    Object.assign(clone.style, {
      position: 'fixed', top: '0', left: '0', width: `${host.getBoundingClientRect().width}px`,
      visibility: 'hidden', pointerEvents: 'none', zIndex: '-1',
    });
    // Insert beside the original so inherited type and container rules match.
    host.after(clone);
    try { prepare(clone); } finally { clone.remove(); }
  }
  function schedule() { view.cancelAnimationFrame(frame); frame = view.requestAnimationFrame(measure); }
  const observer = new ResizeObserver(entries => {
    const next = entries[0].contentRect.width;
    if (next === width) return;
    width = next;
    schedule();
  });
  observer.observe(host);
  host.ownerDocument.fonts.ready.then(schedule);
  measure();
  return () => { disposed = true; observer.disconnect(); view.cancelAnimationFrame(frame); };
}

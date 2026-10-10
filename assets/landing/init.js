// Enhance the server-rendered page after hydration. Each demonstration keeps
// its own readable fallback if WebGL or a module cannot load.
import './progression.js';
await Promise.allSettled([
  import('./organization-scene.js'),
  import('./media-page.js'),
]);

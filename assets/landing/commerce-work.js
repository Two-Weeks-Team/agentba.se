/**
 * Kbeauty: a clip-first discovery walkthrough, using generated stills.
 * Load commerce-work.css separately. No dependencies or production requests.
 *
 * mountCommerceDemo(host) returns a cleanup function; remounting is safe.
 * Optional: set host.dataset.productUrl to the main agent's public product URL.
 * Without that URL, the external CTA honestly links to the storefront home.
 *
 * Image provenance: Two-Weeks-Team/kbeauty.market,
 * 792b5a315d48b4d6a97f02d325dba4de12025e10, public/img/.
 * docs/BRIEF.md:94–103 identifies these as generated, unbranded imagery.
 * Copied without alteration: pdp-on-skin.webp, pdp-texture-swatch.webp,
 * pdp-ampoule-hero.webp. They illustrate one SAMPLE, not a verified real SKU.
 *
 * Interaction sources at that commit:
 * components/shop/clip-stage.tsx:77–105,143–179: clips first, photo last,
 * selection controls and an original-source link outside the player.
 * components/shop/figure-card.tsx:22–38,70–79: product and clip association.
 * app/(store)/shop/[handle]/page.tsx:354–399,411–429,464–490: product context,
 * AI disclosure, and creator/brand attribution. No claim of video analysis.
 * lib/site.ts:63–69: checkout is not enabled. This demo has no buying actions.
 * The existing media-proposal/kbeauty-video-reference.png is a dated product
 * UI reference from 2026-09-12, not proof of current TikTok playback.
 */

const mounts = new WeakMap();
let instanceCount = 0;

const media = (name) => new URL(`./media/commerce/${name}`, import.meta.url).href;
const referenceImage = new URL(
  "./media-proposal/kbeauty-video-reference.png",
  import.meta.url,
).href;

const views = [
  {
    id: "in-use",
    label: "In use",
    file: "pdp-on-skin.webp",
    alt: "Generated illustration of skincare drops on a cheek; not a real creator or customer review.",
    title: "Start with the moment.",
    description: "A clip draws you in. The product stays beside it, ready to explore.",
    caption: "An illustrated use view",
    context: "Use view → linked product",
  },
  {
    id: "texture",
    label: "Texture",
    file: "pdp-texture-swatch.webp",
    alt: "Generated close-up of a translucent skincare swatch; illustrative, not a product test.",
    title: "Take a closer look.",
    description: "Change the view without losing the product. The context stays connected.",
    caption: "An illustrated texture detail",
    context: "Detail view → same product",
  },
  {
    id: "product",
    label: "Product",
    file: "pdp-ampoule-hero.webp",
    alt: "Generated, unbranded glass dropper bottle representing a sample skincare product.",
    title: "Find the product behind it.",
    description: "From the frame to the product photo. Keep a path back to the original source.",
    caption: "An illustrated product photo",
    context: "Product photo → source context",
  },
];

function publicDestination(host) {
  const supplied = host.dataset.productUrl || host.dataset.liveProductUrl;
  try {
    const url = new URL(supplied || "https://kbeauty.market", "https://kbeauty.market");
    if (url.protocol === "https:" && url.hostname === "kbeauty.market" && !url.username && !url.password) {
      return { href: url.href, product: url.pathname.startsWith("/shop/") && url.pathname.length > 6 };
    }
  } catch {
    // An absent or malformed optional product URL falls back to the public home.
  }
  return { href: "https://kbeauty.market/", product: false };
}

/** @param {HTMLElement} host @returns {() => void} */
export function mountCommerceDemo(host) {
  if (!host || !host.ownerDocument || typeof host.appendChild !== "function") {
    throw new TypeError("mountCommerceDemo requires a host element.");
  }
  mounts.get(host)?.();

  const document = host.ownerDocument;
  const prefix = `kb-walkthrough-${++instanceCount}`;
  const root = document.createElement("section");
  root.className = "commerce-demo";
  root.dataset.kbView = views[0].id;
  root.setAttribute("aria-label", "Kbeauty illustrated video-first discovery walkthrough");

  root.innerHTML = `
    <header class="kb-header">
      <span class="kb-wordmark">kbeauty.market</span>
      <span class="kb-edition">Illustrated walkthrough</span>
    </header>
    <div class="kb-body">
      <div class="kb-gallery">
        <figure class="kb-frame" id="${prefix}-frame" role="tabpanel" aria-labelledby="${prefix}-in-use" tabindex="0">
          ${views.map((view, index) => `
            <img class="kb-frame-image kb-frame-image--${view.id}" data-kb-image="${view.id}"
              src="${media(view.file)}" alt="${view.alt}" width="${index === 0 ? 733 : 1024}"
              height="${index === 0 ? 1100 : 1024}" decoding="async" ${index ? "hidden" : ""}>
          `).join("")}
          <span class="kb-image-label">Generated still</span>
          <figcaption class="kb-frame-caption">
            <span class="kb-frame-caption-title" data-kb-caption>${views[0].caption}</span>
            <span class="kb-frame-index" data-kb-index>01 / 03</span>
          </figcaption>
        </figure>
        <div class="kb-selectors" role="tablist" aria-label="Explore the illustrated views" aria-orientation="vertical">
          ${views.map((view, index) => `
            <button class="kb-view" id="${prefix}-${view.id}" type="button" role="tab"
              aria-controls="${prefix}-frame" aria-selected="${index === 0}" tabindex="${index === 0 ? "0" : "-1"}"
              data-kb-select="${index}">
              <span class="kb-thumb"><img src="${media(view.file)}" alt="" width="66" height="78" decoding="async"></span>
              <span class="kb-view-label">${view.label}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="kb-editorial">
        <div class="kb-editorial-heading">
          <p class="kb-kicker">Video first. Product connected.</p>
          <h3 class="kb-title">Watch it.<br class="kb-title-break"> Find it.</h3>
        </div>
        <div class="kb-view-context">
          <h4 class="kb-context-title" data-kb-title>${views[0].title}</h4>
          <p class="kb-context-copy" data-kb-description>${views[0].description}</p>
        </div>

        <div class="kb-linked-product">
          <img class="kb-product-image" src="${media("pdp-ampoule-hero.webp")}" width="104" height="124"
            alt="Generated unbranded bottle for the same sample product in every view." decoding="async">
          <div class="kb-product-copy">
            <p class="kb-kicker">Linked product</p>
            <h4 class="kb-product-name">Sample skincare product</h4>
            <button class="kb-find" type="button" data-kb-find>
              <span data-kb-find-label>Find it</span><span data-kb-find-arrow aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <details class="kb-source">
          <summary class="kb-source-toggle"><span>About this walkthrough</span><span class="kb-source-symbol" aria-hidden="true"></span></summary>
          <div class="kb-source-content">
            <p>On kbeauty.market, creator and brand clips keep their original source links. This walkthrough uses generated imagery, not creator footage.</p>
            <a class="kb-reference-link" href="${referenceImage}" target="_blank" rel="noopener noreferrer">
              <span>Actual product UI · Sep 12, 2026<span class="kb-sr-only"> (opens image in a new tab)</span></span><span aria-hidden="true">↗</span>
            </a>
            <p class="kb-reference-note">Dated reference, not current playback.</p>
          </div>
        </details>
      </div>
    </div>
    <footer class="kb-footer">
      <span class="kb-connection" data-kb-connection>${views[0].context}</span>
      <a class="kb-live-link" data-kb-live-link target="_blank" rel="noopener noreferrer">
        <span data-kb-live-label>Visit kbeauty.market</span><span aria-hidden="true">↗</span><span class="kb-sr-only"> (opens in a new tab)</span>
      </a>
    </footer>
    <p class="kb-sr-only" data-kb-status role="status" aria-live="polite" aria-atomic="true"></p>
  `;

  const tabs = [...root.querySelectorAll("[data-kb-select]")];
  const pictures = [...root.querySelectorAll("[data-kb-image]")];
  const frame = root.querySelector(".kb-frame");
  const caption = root.querySelector("[data-kb-caption]");
  const counter = root.querySelector("[data-kb-index]");
  const title = root.querySelector("[data-kb-title]");
  const description = root.querySelector("[data-kb-description]");
  const connection = root.querySelector("[data-kb-connection]");
  const findLabel = root.querySelector("[data-kb-find-label]");
  const findArrow = root.querySelector("[data-kb-find-arrow]");
  const status = root.querySelector("[data-kb-status]");
  const destination = publicDestination(host);
  root.querySelector("[data-kb-live-link]").href = destination.href;
  root.querySelector("[data-kb-live-label]").textContent = destination.product ? "Explore the live product" : "Visit kbeauty.market";

  let selected = 0;

  function select(index) {
    if (index === selected) return;
    selected = index;
    const view = views[index];
    root.dataset.kbView = view.id;
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      pictures[i].hidden = i !== index;
    });
    frame.setAttribute("aria-labelledby", tabs[index].id);
    caption.textContent = view.caption;
    counter.textContent = `0${index + 1} / 03`;
    title.textContent = view.title;
    description.textContent = view.description;
    connection.textContent = view.context;
    findLabel.textContent = view.id === "product" ? "Back to the frame" : "Find it";
    findArrow.textContent = view.id === "product" ? "←" : "→";
    status.textContent = `${view.label}. ${view.caption}. ${view.description}`;
  }

  function onClick(event) {
    const tab = event.target.closest?.("[data-kb-select]");
    if (tab && root.contains(tab)) select(Number(tab.dataset.kbSelect));
    const find = event.target.closest?.("[data-kb-find]");
    if (find && root.contains(find)) select(selected === 2 ? 0 : 2);
  }

  function onKeyDown(event) {
    const tab = event.target.closest?.("[data-kb-select]");
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
    tabs[next].focus();
  }

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKeyDown);
  host.appendChild(root);

  const dispose = () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKeyDown);
    root.remove();
    if (mounts.get(host) === dispose) mounts.delete(host);
  };
  mounts.set(host, dispose);
  return dispose;
}

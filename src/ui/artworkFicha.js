import { FICHA_HTML_BASE } from "../paintings/artworksConfig.js";

const htmlCache = new Map();

async function loadFichaHtml(filename) {
  if (htmlCache.has(filename)) return htmlCache.get(filename);

  const promise = fetch(`${FICHA_HTML_BASE}${filename}`).then((res) => {
    if (!res.ok) throw new Error(`Failed to load ficha HTML: ${filename}`);
    return res.text();
  });

  htmlCache.set(filename, promise);
  return promise;
}

export function createArtworkFicha() {
  const panel = document.createElement("aside");
  panel.id = "artwork-ficha";
  panel.setAttribute("aria-label", "Ficha de la obra");
  panel.setAttribute("aria-hidden", "true");

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "artwork-ficha__close";
  closeBtn.setAttribute("aria-label", "Cerrar ficha");
  closeBtn.textContent = "×";

  const content = document.createElement("div");
  content.className = "artwork-ficha__content";

  panel.append(closeBtn, content);
  document.body.appendChild(panel);

  function hide() {
    panel.classList.remove("is-visible");
    panel.setAttribute("aria-hidden", "true");
  }

  async function show(artwork) {
    if (!artwork.fichaHtml) return;

    try {
      content.innerHTML = await loadFichaHtml(artwork.fichaHtml);
      content.scrollTop = 0;
      panel.setAttribute("aria-hidden", "false");
      panel.classList.add("is-visible");
    } catch (err) {
      console.error(err);
      content.innerHTML = `<p class="artwork-ficha__error">No se pudo cargar la ficha.</p>`;
      panel.setAttribute("aria-hidden", "false");
      panel.classList.add("is-visible");
    }
  }

  closeBtn.addEventListener("click", hide);

  function dispose() {
    panel.remove();
  }

  return { show, hide, dispose };
}

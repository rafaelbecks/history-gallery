export function createArtworkNav({ onPrev, onNext }) {
  const root = document.createElement("nav");
  root.id = "artwork-nav";
  root.setAttribute("aria-label", "Navegación de obras");

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "artwork-nav__btn";
  prevBtn.setAttribute("aria-label", "Obra anterior");
  prevBtn.innerHTML = "&#8592;";

  const label = document.createElement("span");
  label.className = "artwork-nav__label";
  label.textContent = "1 / 1";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "artwork-nav__btn";
  nextBtn.setAttribute("aria-label", "Obra siguiente");
  nextBtn.innerHTML = "&#8594;";

  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);

  root.append(prevBtn, label, nextBtn);
  document.body.appendChild(root);

  function setLabel(text) {
    label.textContent = text;
  }

  function dispose() {
    root.remove();
  }

  return { setLabel, dispose };
}

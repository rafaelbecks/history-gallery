/** Open via top-right icon; close on outside click. Ctrl/Cmd+I toggles the icon. */
export function setupPaneToggle({ panel, toggleBtn }) {
  let panelVisible = false;
  let iconVisible = false;

  function setPanelVisible(show) {
    panelVisible = show;
    panel.classList.toggle("hidden", !show);
    toggleBtn?.setAttribute("aria-expanded", String(show));
    if (show) toggleBtn?.classList.add("hidden");
  }

  function setIconVisible(show) {
    iconVisible = show;
    toggleBtn?.classList.toggle("hidden", !show);
  }

  function toggleIcon() {
    setIconVisible(!iconVisible);
  }

  toggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!panelVisible) setPanelVisible(true);
  });

  panel.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", () => {
    if (panelVisible) setPanelVisible(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key !== "i" && e.key !== "I") return;
    if (!e.ctrlKey && !e.metaKey) return;
    if (e.altKey || e.shiftKey) return;

    e.preventDefault();
    toggleIcon();
  });

  setPanelVisible(false);
  setIconVisible(false);

  return {
    setPanelVisible,
    setIconVisible,
    toggleIcon,
    isPanelVisible: () => panelVisible,
    isIconVisible: () => iconVisible,
  };
}

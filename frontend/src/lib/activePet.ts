const KEY = "activePetId";
const EVENT = "activePetIdChanged";

export function getActivePetId(): string | null {
  return localStorage.getItem(KEY);
}

export function setActivePetId(id: string) {
  localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event(EVENT));
}

export function clearActivePetId() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function onActivePetIdChanged(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  // optional: also react to cross-tab changes
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

const KEY = "activePetId";

export function getActivePetId(): string | null {
  return localStorage.getItem(KEY);
}
export function setActivePetId(id: string) {
  localStorage.setItem(KEY, id);
}
export function clearActivePetId() {
  localStorage.removeItem(KEY);
}

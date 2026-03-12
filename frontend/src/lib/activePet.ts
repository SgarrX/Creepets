import { useGameStore } from "../state/gameStore";

/**
 * Legacy helper: früher war activePetId in localStorage.
 * Jetzt kommt es aus Supabase (profiles.active_pet_id) über den GameStore.
 */
export function getActivePetId(): string | null {
  return useGameStore.getState().activePetId ?? null;
}

// Diese Funktionen existieren nur noch, damit alte Imports nicht crashen.
// Sie machen absichtlich nichts.
export function setActivePetId(_id: string) {
  // no-op (Supabase ist source of truth)
}
export function clearActivePetId() {
  // no-op
}
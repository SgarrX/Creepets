import { useGameStore } from "../state/gameStore";

/**
 * Returns the active pet id if present, otherwise null.
 * Use this in pages that require an active pet.
 */
export function requireActivePetId(): string | null {
  return useGameStore.getState().activePetId ?? null;
}
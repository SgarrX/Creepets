import { getActivePetId } from "./activePet";

export function requireActivePetId(): string {
  const id = getActivePetId();
  if (!id) throw new Error("Kein aktives Pet. Bitte zuerst adoptieren.");
  return id;
}

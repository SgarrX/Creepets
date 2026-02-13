import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { requireActivePetId } from "../lib/requirePet";
import type { InventoryResolved, Pet, ResolvedInvItem } from "../lib/types";

export default function Feed() {
  const [inv, setInv] = useState<InventoryResolved | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const petId = requireActivePetId();
    const [invRes, petRes] = await Promise.all([
      apiGet<{ data: InventoryResolved }>(`/api/pets/${petId}/inventory`),
      apiGet<{ data: Pet }>(`/api/pets/${petId}`)
    ]);
    setInv(invRes.data);
    setPet(petRes.data);
  }

  useEffect(() => {
    load().catch(e => setErr(String(e.message || e)));
  }, []);

  async function feed(item: ResolvedInvItem) {
    setErr(""); setMsg("");
    try {
      const petId = requireActivePetId();
      const res = await apiPost<{ data: { pet: Pet; inventory: InventoryResolved } }>(
        `/api/pets/${petId}/feed`,
        { foodItemId: item.itemId }
      );
      setPet(res.data.pet);
      setInv(res.data.inventory);
      setMsg(`Fed: ${item.item?.name ?? item.itemId}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  const foods = (inv?.items ?? []).filter(x => x.item?.type === "food");

  return (
    <div>
      <h2>Feed</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {pet && <p>Hunger: {pet.hunger} | Happiness: {pet.happiness} | Energy: {pet.energy}</p>}

      <h3>Food</h3>
      {!inv ? <p>Loading...</p> : foods.length === 0 ? <p>No food. Buy some in Shop.</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {foods.map(f => (
            <div key={f.itemId} style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{f.item?.name ?? f.itemId}</b>
                <span>× {f.qty}</span>
              </div>
              <button style={{ marginTop: 10 }} onClick={() => feed(f)}>Feed</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

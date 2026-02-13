import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { requireActivePetId } from "../lib/requirePet";
import type { Item, Pet } from "../lib/types";

export default function Shop() {
  const [items, setItems] = useState<Item[]>([]);
  const [pet, setPet] = useState<Pet | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    const petId = requireActivePetId();
    const [shopRes, petRes] = await Promise.all([
      apiGet<{ data: Item[] }>("/api/shop/items"),
      apiGet<{ data: Pet }>(`/api/pets/${petId}`)
    ]);
    setItems(shopRes.data);
    setPet(petRes.data);
  }

  useEffect(() => {
    load().catch(e => setErr(String(e.message || e)));
  }, []);

  async function buy(itemId: string) {
    setErr(""); setMsg("");
    try {
      const petId = requireActivePetId();
      const res = await apiPost<{ data: { pet: Pet } }>("/api/shop/buy", { petId, itemId, qty: 1 });
      setPet(res.data.pet);
      setMsg("Bought successfully!");
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  return (
    <div>
      <h2>Shop</h2>
      {pet && <p>Coins: <b>{pet.coins}</b></p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {items.map(i => (
          <div key={i.id} style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <b>{i.name}</b>
              <span>{i.price} coins</span>
            </div>
            <div style={{ opacity: 0.8, marginTop: 6 }}>Type: {i.type}</div>

            <div style={{ marginTop: 8, fontSize: 14 }}>
              <b>Effects:</b>
              <ul style={{ marginTop: 6 }}>
                {Object.entries(i.effects).map(([k, v]) => (
                  <li key={k}>{k}: {v > 0 ? `+${v}` : v}</li>
                ))}
              </ul>
            </div>

            <button style={{ marginTop: 10 }} onClick={() => buy(i.id)}>
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

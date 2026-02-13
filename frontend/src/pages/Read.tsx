import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { requireActivePetId } from "../lib/requirePet";
import type { InventoryResolved, Pet, ResolvedInvItem } from "../lib/types";

export default function Read() {
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

  async function read(item: ResolvedInvItem) {
    setErr("");
    setMsg("");
    try {
      const petId = requireActivePetId();
      const res = await apiPost<{ data: { pet: Pet; inventory: InventoryResolved } }>(
        `/api/pets/${petId}/read`,
        { bookItemId: item.itemId }
      );
      setPet(res.data.pet);
      setInv(res.data.inventory);
      setMsg(`Read: ${item.item?.name ?? item.itemId}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  const books = (inv?.items ?? []).filter(x => x.item?.type === "book");

  return (
    <div>
      <h2>Read</h2>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {pet && (
        <p>
          Intelligence: <b>{pet.intelligence}</b> | XP: <b>{pet.xp}</b> | Level: <b>{pet.level}</b>
        </p>
      )}

      <h3>Books</h3>
      {!inv ? (
        <p>Loading...</p>
      ) : books.length === 0 ? (
        <p>No books. Buy some in Shop.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {books.map(b => (
            <div key={b.itemId} style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <b>{b.item?.name ?? b.itemId}</b>
                <span>× {b.qty}</span>
              </div>

              {b.item?.effects && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  <b>Effects:</b>
                  <ul style={{ marginTop: 6 }}>
                    {Object.entries(b.item.effects).map(([k, v]) => (
                      <li key={k}>{k}: {v > 0 ? `+${v}` : v}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button style={{ marginTop: 10 }} onClick={() => read(b)}>
                Read
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

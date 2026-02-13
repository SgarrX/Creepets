import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { requireActivePetId } from "../lib/requirePet";
import type { InventoryResolved, Pet, ResolvedInvItem } from "../lib/types";

export default function Play() {
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

  async function play(item: ResolvedInvItem) {
    setErr("");
    setMsg("");
    try {
      const petId = requireActivePetId();
      const res = await apiPost<{ data: { pet: Pet; inventory: InventoryResolved } }>(
        `/api/pets/${petId}/play`,
        { toyItemId: item.itemId }
      );
      setPet(res.data.pet);
      setInv(res.data.inventory);
      setMsg(`Played with: ${item.item?.name ?? item.itemId}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  // optional: minigame button (score based)
  async function playMinigame() {
    setErr("");
    setMsg("");
    try {
      const petId = requireActivePetId();
      const randomScore = Math.floor(Math.random() * 120); // 0..119
      const res = await apiPost<{ data: { pet: Pet; inventory: InventoryResolved } }>(
        `/api/pets/${petId}/play`,
        { score: randomScore }
      );
      setPet(res.data.pet);
      setInv(res.data.inventory);
      setMsg(`Minigame score: ${randomScore} (rewards applied)`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  const toys = (inv?.items ?? []).filter(x => x.item?.type === "toy");

  return (
    <div>
      <h2>Play</h2>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {pet && (
        <p>
          Happiness: <b>{pet.happiness}</b> | Energy: <b>{pet.energy}</b> | Coins: <b>{pet.coins}</b>
        </p>
      )}

      <div style={{ margin: "12px 0" }}>
        <button onClick={playMinigame}>Play Minigame (random score)</button>
      </div>

      <h3>Toys</h3>
      {!inv ? (
        <p>Loading...</p>
      ) : toys.length === 0 ? (
        <p>No toys. Buy some in Shop.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {toys.map(t => (
            <div key={t.itemId} style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <b>{t.item?.name ?? t.itemId}</b>
                <span>× {t.qty}</span>
              </div>

              {t.item?.effects && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  <b>Effects:</b>
                  <ul style={{ marginTop: 6 }}>
                    {Object.entries(t.item.effects).map(([k, v]) => (
                      <li key={k}>{k}: {v > 0 ? `+${v}` : v}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button style={{ marginTop: 10 }} onClick={() => play(t)}>
                Play
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

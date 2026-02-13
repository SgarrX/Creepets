import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import { requireActivePetId } from "../lib/requirePet";
import type { InventoryResolved, ItemType } from "../lib/types";

export default function Inventory() {
  const [inv, setInv] = useState<InventoryResolved | null>(null);
  const [filter, setFilter] = useState<ItemType | "all">("all");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const petId = requireActivePetId();
      apiGet<{ data: InventoryResolved }>(`/api/pets/${petId}/inventory`)
        .then(r => setInv(r.data))
        .catch(e => setErr(String(e.message || e)));
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }, []);

  const items = useMemo(() => {
    const all = inv?.items ?? [];
    if (filter === "all") return all;
    return all.filter(x => x.item?.type === filter);
  }, [inv, filter]);

  return (
    <div>
      <h2>Inventory</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("food")}>Food</button>
        <button onClick={() => setFilter("toy")}>Toys</button>
        <button onClick={() => setFilter("book")}>Books</button>
      </div>

      {!inv ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No items in this category.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {items.map(x => (
            <div key={x.itemId} style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <b>{x.item?.name ?? x.itemId}</b>
                <span>× {x.qty}</span>
              </div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>
                Type: {x.item?.type ?? "unknown"}
              </div>

              {x.item?.effects && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  <b>Effects:</b>
                  <ul style={{ marginTop: 6 }}>
                    {Object.entries(x.item.effects).map(([k, v]) => (
                      <li key={k}>{k}: {v > 0 ? `+${v}` : v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

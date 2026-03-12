import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../state/gameStore";

export default function Read() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const activePetId = useGameStore((s) => s.activePetId);
  const pets = useGameStore((s) => s.pets);
  const itemsById = useGameStore((s) => s.itemsById);
  const inventory = useGameStore((s) => s.inventory);
  const useItem = useGameStore((s) => s.useItem);

  const pet = useMemo(() => {
    if (!activePetId) return null;
    return pets.find((p) => p.id === activePetId) ?? null;
  }, [activePetId, pets]);

  const books = useMemo(() => {
    return Object.values(inventory)
      .map((stack) => {
        const def = itemsById[stack.itemId];
        const type = (def?.meta?.type as string | undefined) ?? "unknown";
        return {
          itemId: stack.itemId,
          qty: stack.quantity,
          name: def?.name ?? stack.itemId,
          type,
          description: def?.description ?? "",
        };
      })
      .filter((x) => x.type === "book" && x.qty > 0);
  }, [inventory, itemsById]);

  async function handleRead(itemId: string, label: string) {
    setErr("");
    setMsg("");
    try {
      await useItem(itemId, 1);
      setMsg(`Gelesen: ${label}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  if (!activePetId || !pet) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Read</h2>
        <p className="alert-error">Du brauchst ein aktives Pet.</p>
        <Link to="/dashboard" className="nav-link active">
          Zum Dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Read</h2>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div className="panel" style={{ marginBottom: 12 }}>
        <b>{pet.name}</b> · Level <b>{pet.stats.level}</b> · XP <b>{pet.stats.xp}</b> · INT <b>{pet.stats.intelligence}</b>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Lesen bringt</h3>
        <div className="muted">
          Bücher erhöhen aktuell XP und helfen indirekt beim Leveln.
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Bücher</h3>

        {books.length === 0 ? (
          <p>
            Keine Bücher im Inventar. Hol dir welche im <Link to="/shop">Shop</Link>.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {books.map((b) => (
              <div key={b.itemId} className="panel">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <b>{b.name}</b>
                  <span>× {b.qty}</span>
                </div>

                {b.description && <div className="muted" style={{ marginTop: 8 }}>{b.description}</div>}

                <button className="btn primary" style={{ marginTop: 10 }} onClick={() => handleRead(b.itemId, b.name)}>
                  Read
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
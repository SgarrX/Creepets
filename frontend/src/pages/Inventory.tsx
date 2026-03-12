import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../state/gameStore";

type Filter = "all" | "food" | "toy" | "book" | "potion" | "unknown";

function canUse(type: string): boolean {
  return ["food", "toy", "book", "potion"].includes(type);
}

function fallbackEffects(type: string): string[] {
  if (type === "food") return ["hunger -20", "happiness +2"];
  if (type === "toy") return ["happiness +10"];
  if (type === "book") return ["xp +15"];
  if (type === "potion") return ["energy +30"];
  return [];
}

function formatEffects(meta: any, type: string): string[] {
  const effects = Array.isArray(meta?.effects) ? meta.effects : [];
  const lines = effects.map((e: any) => {
    const stat = String(e?.stat ?? "unknown");
    const delta = Number(e?.delta ?? 0);
    const sign = delta >= 0 ? "+" : "";
    return `${stat} ${sign}${delta}`;
  });

  return lines.length > 0 ? lines : fallbackEffects(type);
}

export default function Inventory() {
  const [filter, setFilter] = useState<Filter>("all");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const activePet = useGameStore((s) => s.getActivePet());
  const itemsById = useGameStore((s) => s.itemsById);
  const inventory = useGameStore((s) => s.inventory);
  const useItem = useGameStore((s) => s.useItem);

  const allRows = useMemo(() => {
    return Object.values(inventory)
      .map((stack) => {
        const def = itemsById[stack.itemId];
        const type = ((def?.meta?.type as string | undefined) ?? "unknown") as Filter;
        const priceRaw = (def?.meta as any)?.price;
        const price = typeof priceRaw === "number" ? priceRaw : Number(priceRaw);

        return {
          itemId: stack.itemId,
          qty: stack.quantity,
          name: def?.name ?? stack.itemId,
          type,
          price: Number.isFinite(price) ? price : null,
          description: def?.description ?? "",
          meta: def?.meta ?? {},
        };
      })
      .filter((x) => x.qty > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, itemsById]);

  const rows = useMemo(() => {
    return filter === "all" ? allRows : allRows.filter((x) => x.type === filter);
  }, [allRows, filter]);

  const groups = useMemo(() => {
    return {
      food: allRows.filter((r) => r.type === "food"),
      toy: allRows.filter((r) => r.type === "toy"),
      book: allRows.filter((r) => r.type === "book"),
      potion: allRows.filter((r) => r.type === "potion"),
    };
  }, [allRows]);

  async function handleUse(itemId: string, label: string) {
    setErr("");
    setMsg("");

    try {
      await useItem(itemId, 1);
      setMsg(`Benutzt: ${label}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  if (!activePet) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Inventory</h2>
        <p className="alert-error">Du brauchst erst ein Pet.</p>
        <Link to="/adopt" className="nav-link active">
          Zur Adoption →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Inventory</h2>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div className="panel" style={{ marginBottom: 12 }}>
        <b>{activePet.name}</b> <span className="muted">({activePet.species})</span> · Level{" "}
        {activePet.stats.level} · Energy {activePet.stats.energy}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 0.9fr) minmax(380px, 1.1fr)",
          gap: 12,
          alignItems: "start",
        }}
      >
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Übersicht</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(90px, 1fr))",
              gap: 10,
            }}
          >
            <div className="panel">
              <div className="muted">Food</div>
              <b>{groups.food.reduce((sum, r) => sum + r.qty, 0)}</b>
            </div>
            <div className="panel">
              <div className="muted">Toys</div>
              <b>{groups.toy.reduce((sum, r) => sum + r.qty, 0)}</b>
            </div>
            <div className="panel">
              <div className="muted">Books</div>
              <b>{groups.book.reduce((sum, r) => sum + r.qty, 0)}</b>
            </div>
            <div className="panel">
              <div className="muted">Potions</div>
              <b>{groups.potion.reduce((sum, r) => sum + r.qty, 0)}</b>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="muted" style={{ marginBottom: 8 }}>
              Filter
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["all", "food", "toy", "book", "potion"] as Filter[]).map((value) => (
                <button
                  key={value}
                  className={filter === value ? "btn primary" : "btn"}
                  onClick={() => setFilter(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>
            {filter === "all" ? "Alle Items" : `Items · ${filter}`}
          </h3>

          {rows.length === 0 ? (
            <p className="muted">Nichts da. Das Inventar macht gerade meditatives Leerrauschen.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {rows.map((r) => (
                <div key={r.itemId} className="panel">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <b>{r.name}</b>
                      <div className="muted" style={{ marginTop: 4 }}>
                        {r.type}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div>× {r.qty}</div>
                      {r.price != null ? <div className="muted">Preis {r.price}</div> : null}
                    </div>
                  </div>

                  {r.description ? (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {r.description}
                    </div>
                  ) : null}

                  <div className="muted" style={{ marginTop: 8 }}>
                    Effekte: {formatEffects(r.meta, r.type).join(" · ")}
                  </div>

                  {canUse(r.type) ? (
                    <button
                      className="btn primary"
                      style={{ marginTop: 10 }}
                      onClick={() => handleUse(r.itemId, r.name)}
                    >
                      Benutzen
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
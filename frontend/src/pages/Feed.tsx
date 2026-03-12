import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../state/gameStore";

function fallbackEffects(type: string): Array<{ stat: string; delta: number }> {
  if (type === "food") {
    return [
      { stat: "hunger", delta: -20 },
      { stat: "happiness", delta: 2 },
    ];
  }

  if (type === "potion") {
    return [{ stat: "energy", delta: 30 }];
  }

  return [];
}

function formatEffects(meta: any, type: string): string[] {
  const raw = Array.isArray(meta?.effects) ? meta.effects : [];
  const effects = raw.length > 0 ? raw : fallbackEffects(type);

  return effects.map((e: any) => {
    const stat = String(e?.stat ?? "unknown");
    const delta = Number(e?.delta ?? 0);
    const sign = delta >= 0 ? "+" : "";
    return `${stat} ${sign}${delta}`;
  });
}

export default function Feed() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const activePet = useGameStore((s) => s.getActivePet());
  const itemsById = useGameStore((s) => s.itemsById);
  const inventory = useGameStore((s) => s.inventory);
  const repo = useGameStore((s) => s.repo);
  const reloadDynamic = useGameStore((s) => s.reloadDynamic);

  const allItems = useMemo(() => {
    return Object.values(inventory)
      .map((stack) => {
        const def = itemsById[stack.itemId];
        const type = (def?.meta?.type as string | undefined) ?? "unknown";
        return {
          itemId: stack.itemId,
          qty: stack.quantity,
          name: def?.name ?? stack.itemId,
          description: def?.description ?? "",
          meta: def?.meta ?? {},
          type,
        };
      })
      .filter((x) => x.qty > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, itemsById]);

  const foods = useMemo(
    () => allItems.filter((x) => x.type === "food"),
    [allItems],
  );

  const potions = useMemo(
    () => allItems.filter((x) => x.type === "potion"),
    [allItems],
  );

  async function consume(itemId: string, label: string, kind: string) {
    if (!activePet) return;
    setErr("");
    setMsg("");
    try {
      await repo.useItem(activePet.id, itemId, 1);
      await reloadDynamic();
      setMsg(`${kind}: ${label}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  if (!activePet) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Feed</h2>
        <p className="alert-error">Du musst erst ein Pet adoptieren.</p>
        <Link to="/adopt" className="nav-link active">
          Zur Adoption →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Feed</h2>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div className="panel" style={{ marginBottom: 12 }}>
        <b>{activePet.name}</b> · Hunger: <b>{activePet.stats.hunger}</b> · Happiness:{" "}
        <b>{activePet.stats.happiness}</b> · Energy:{" "}
        <b>
          {activePet.stats.energy} / {activePet.stats.energyMax}
        </b>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Food</h3>

        {foods.length === 0 ? (
          <p>
            Kein Food im Inventar. Hol dir was im <Link to="/shop">Shop</Link>.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {foods.map((f) => {
              const effects = formatEffects(f.meta, f.type);

              return (
                <div key={f.itemId} className="panel">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <b>{f.name}</b>
                    <span>× {f.qty}</span>
                  </div>

                  {f.description ? (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {f.description}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 8 }}>
                    <b>Effekte:</b>
                    <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                      {effects.map((effect) => (
                        <li key={effect}>{effect}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="btn primary"
                    style={{ marginTop: 10 }}
                    onClick={() => consume(f.itemId, f.name, "Gefüttert")}
                  >
                    Feed
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Potions</h3>

        {potions.length === 0 ? (
          <p className="muted">Keine Potions im Inventar.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {potions.map((p) => {
              const effects = formatEffects(p.meta, p.type);

              return (
                <div key={p.itemId} className="panel">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <b>{p.name}</b>
                    <span>× {p.qty}</span>
                  </div>

                  {p.description ? (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {p.description}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 8 }}>
                    <b>Effekte:</b>
                    <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                      {effects.map((effect) => (
                        <li key={effect}>{effect}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="btn primary"
                    style={{ marginTop: 10 }}
                    onClick={() => consume(p.itemId, p.name, "Potion benutzt")}
                  >
                    Use Potion
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
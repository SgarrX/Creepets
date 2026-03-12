import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../state/gameStore";

function fallbackEffectsByType(type: string): string[] {
  if (type === "food") return ["hunger -20", "happiness +2"];
  if (type === "toy") return ["happiness +10"];
  if (type === "book") return ["xp +15"];
  if (type === "potion") return ["energy +30"];
  return [];
}

function formatEffects(meta: any): string[] {
  const effects = Array.isArray(meta?.effects) ? meta.effects : [];
  return effects.map((e: any) => {
    const stat = String(e?.stat ?? "unknown");
    const delta = Number(e?.delta ?? 0);
    const sign = delta >= 0 ? "+" : "";
    return `${stat} ${sign}${delta}`;
  });
}

function typeLabel(type: string): string {
  if (type === "food") return "Food";
  if (type === "toy") return "Toy";
  if (type === "book") return "Book";
  if (type === "potion") return "Potion";
  return type;
}

export default function Shop() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const profile = useGameStore((s) => s.profile);
  const activePet = useGameStore((s) => s.getActivePet());
  const itemsById = useGameStore((s) => s.itemsById);
  const repo = useGameStore((s) => s.repo);
  const reloadDynamic = useGameStore((s) => s.reloadDynamic);

  const coins = typeof profile?.coins === "number" ? profile.coins : 0;

  const items = useMemo(() => {
    return Object.values(itemsById)
      .map((d) => {
        const type = (d.meta?.type as string | undefined) ?? "unknown";
        const priceRaw = (d.meta as any)?.price;
        const price = typeof priceRaw === "number" ? priceRaw : Number(priceRaw);
        const metaEffects = formatEffects(d.meta);
        const effects = metaEffects.length > 0 ? metaEffects : fallbackEffectsByType(type);

        return {
          id: d.id,
          name: d.name,
          description: d.description,
          type,
          price: Number.isFinite(price) ? price : null,
          effects,
        };
      })
      .filter((x) => x.price != null)
      .filter((x) => ["food", "toy", "book", "potion"].includes(x.type))
      .sort((a, b) => {
        if ((a.price ?? 0) !== (b.price ?? 0)) return (a.price ?? 0) - (b.price ?? 0);
        return a.name.localeCompare(b.name);
      });
  }, [itemsById]);

  async function buy(itemId: string, label: string, price: number) {
    if (!activePet) {
      setErr("Du brauchst ein Pet.");
      return;
    }

    setErr("");
    setMsg("");

    try {
      await repo.buyItem(activePet.id, itemId, 1);
      await reloadDynamic();
      setMsg(`Gekauft: ${label} für ${price} Coins`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  if (!activePet) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Shop</h2>
        <p className="alert-error">Du brauchst erst ein Pet.</p>
        <Link to="/adopt" className="nav-link active">
          Zur Adoption →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Shop</h2>

      <div className="panel" style={{ marginBottom: 12 }}>
        Coins: <b>{coins}</b> · aktuelles Pet: <b>{activePet.name}</b>
      </div>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((item) => (
          <div key={item.id} className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <b>{item.name}</b>
                <div className="muted" style={{ marginTop: 4 }}>
                  {typeLabel(item.type)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="muted">Preis</div>
                <b>{item.price}</b>
              </div>
            </div>

            {item.description ? (
              <div className="muted" style={{ marginTop: 10 }}>
                {item.description}
              </div>
            ) : null}

            <div style={{ marginTop: 10 }}>
              <div className="muted" style={{ marginBottom: 6 }}>
                Wirkung / Stats
              </div>

              {item.effects.length === 0 ? (
                <div className="muted">Keine Wirkung hinterlegt.</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {item.effects.map((fx) => (
                    <li key={fx}>{fx}</li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className="btn primary"
              style={{ marginTop: 12 }}
              onClick={() => buy(item.id, item.name, item.price ?? 0)}
              disabled={(item.price ?? 0) > coins}
            >
              Kaufen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
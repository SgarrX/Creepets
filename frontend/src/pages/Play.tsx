import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../state/gameStore";
import { useLivePet } from "../utils/livePetStats";

function formatEffects(meta: any): string[] {
  const effects = Array.isArray(meta?.effects) ? meta.effects : [];
  const lines = effects.map((e: any) => {
    const stat = String(e?.stat ?? "unknown");
    const delta = Number(e?.delta ?? 0);
    const sign = delta >= 0 ? "+" : "";
    return `${stat} ${sign}${delta}`;
  });

  return lines.length > 0 ? lines : ["happiness +10"];
}

export default function Play() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const activePetBase = useGameStore((s) => s.getActivePet());
  const inventory = useGameStore((s) => s.inventory);
  const itemsById = useGameStore((s) => s.itemsById);
  const useItem = useGameStore((s) => s.useItem);

  const activePet = useLivePet(activePetBase);

  const toys = useMemo(() => {
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
      .filter((x) => x.type === "toy" && x.qty > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, itemsById]);

  async function playWithToy(itemId: string, label: string) {
    setErr("");
    setMsg("");

    try {
      await useItem(itemId, 1);
      setMsg(`Gespielt mit: ${label}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  if (!activePet) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Play</h2>
        <p className="alert-error">Du brauchst erst ein Pet.</p>
        <Link to="/adopt" className="nav-link active">
          Zur Adoption →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Play</h2>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div className="panel" style={{ marginBottom: 12 }}>
        <b>{activePet.name}</b> · Happiness: <b>{activePet.stats.happiness}</b> · Energy:{" "}
        <b>
          {activePet.stats.energy} / {activePet.stats.energyMax}
        </b>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Toys</h3>

        {toys.length === 0 ? (
          <p>
            Keine Toys im Inventar. Hol dir was im <Link to="/shop">Shop</Link>.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {toys.map((toy) => {
              const effects = formatEffects(toy.meta);

              return (
                <div key={toy.itemId} className="panel">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <b>{toy.name}</b>
                    <span>× {toy.qty}</span>
                  </div>

                  {toy.description ? (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {toy.description}
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
                    onClick={() => playWithToy(toy.itemId, toy.name)}
                  >
                    Play
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
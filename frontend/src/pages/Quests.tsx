import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { requireActivePetId } from "../lib/requirePet";
import type { Pet, Quest } from "../lib/types";

const MAX_ACTIVE = 3;

function badgeStyle(status: Quest["status"]) {
  const base: React.CSSProperties = {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    display: "inline-block"
  };

  if (status === "available") return { ...base, background: "#2b2c30", border: "1px solid #444" };
  if (status === "active") return { ...base, background: "#263b5a", border: "1px solid #4f8cff" };
  if (status === "completed") return { ...base, background: "#21452d", border: "1px solid #7cff9e" };
  return { ...base, background: "#3a3b40", border: "1px solid #666" }; // claimed
}

function progressPct(q: Quest) {
  if (q.goalCount <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((q.progress / q.goalCount) * 100)));
}

function isFinished(q: Quest) {
  return q.progress >= q.goalCount;
}

function minLevel(q: Quest) {
  return q.minLevel ?? 1;
}

export default function Quests() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const petId = requireActivePetId();
    const [petRes, qRes] = await Promise.all([
      apiGet<{ data: Pet }>(`/api/pets/${petId}`),
      apiGet<{ data: Quest[] }>(`/api/pets/${petId}/quests`)
    ]);
    setPet(petRes.data);
    setQuests(qRes.data);
  }

  useEffect(() => {
    load().catch(e => setErr(String(e.message || e)));
    const t = setInterval(() => load().catch(() => {}), 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCount = useMemo(
    () => quests.filter(q => q.status === "active").length,
    [quests]
  );

  const sorted = useMemo(() => {
    // Primär: minLevel absteigend (3 -> 2 -> 1)
    // Sekundär: Status-Rang, damit aktive/abgebbare innerhalb eines Levels oben stehen
    const rank: Record<Quest["status"], number> = {
      completed: 0,
      active: 1,
      available: 2,
      claimed: 3
    };

    return [...quests].sort((a, b) => {
      const lvl = minLevel(b) - minLevel(a);
      if (lvl !== 0) return lvl;
      return rank[a.status] - rank[b.status];
    });
  }, [quests]);

  async function annehmen(id: string) {
    setErr("");
    setMsg("");
    try {
      const petId = requireActivePetId();
      await apiPost(`/api/pets/${petId}/quests/${id}/accept`);
      setMsg("Quest angenommen!");
      await load();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  async function abgeben(id: string) {
    setErr("");
    setMsg("");
    try {
      const petId = requireActivePetId();
      const res = await apiPost<{ data: { quest: Quest; pet: Pet } }>(`/api/pets/${petId}/quests/${id}/claim`);
      setPet(res.data.pet);
      setMsg("Quest abgegeben! Rewards erhalten.");
      await load();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  async function aufgeben(id: string) {
    setErr("");
    setMsg("");
    try {
      const petId = requireActivePetId();
      await apiPost(`/api/pets/${petId}/quests/${id}/abandon`);
      setMsg("Quest aufgegeben. Slot frei!");
      await load();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  return (
    <div>
      <h2>Quests</h2>

      {pet && (
        <p>
          Coins: <b>{pet.coins}</b> | Level: <b>{pet.level}</b> | XP: <b>{pet.xp}</b>
          {" "} | Aktiv: <b>{activeCount}/{MAX_ACTIVE}</b>
        </p>
      )}

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      {sorted.length === 0 ? (
        <p>No quests available.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          {sorted.map(q => {
            const finished = isFinished(q);

            // Sichtbarkeit/Regeln:
            const showAccept = q.status === "available";
            const acceptDisabled = activeCount >= MAX_ACTIVE;

            const showTurnIn = q.status === "completed" || (q.status === "active" && finished);
            const showAbandon = q.status === "active" && !finished; // nur wenn noch nicht fertig

            return (
              <div key={q.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      {q.goalType.toUpperCase()} • min Lv {minLevel(q)}
                    </div>
                    <b style={{ fontSize: 16 }}>{q.title}</b>
                  </div>
                  <span style={badgeStyle(q.status)}>{q.status.toUpperCase()}</span>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.85 }}>
                    <span>Progress</span>
                    <b>
                      {q.progress}/{q.goalCount}
                    </b>
                  </div>

                  <div className="progress-bar" style={{ marginTop: 6 }}>
                    <div className="progress-fill" style={{ width: `${progressPct(q)}%` }} />
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: 14, opacity: 0.9 }}>
                  Rewards: <b>+{q.rewardCoins}</b> coins, <b>+{q.rewardXp}</b> XP
                </div>

                {/* ✅ Buttons nur anzeigen, wenn sinnvoll */}
                {(showAccept || showTurnIn || showAbandon) && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    {showAccept && (
                      <button
                        onClick={() => annehmen(q.id)}
                        disabled={acceptDisabled}
                        title={acceptDisabled ? "Maximal 3 aktive Quests. Gib eine Quest auf oder gib eine fertige ab." : ""}
                      >
                        Annehmen ({activeCount}/{MAX_ACTIVE})
                      </button>
                    )}

                    {showTurnIn && (
                      <button onClick={() => abgeben(q.id)} className="primary">
                        Abgeben
                      </button>
                    )}

                    {showAbandon && (
                      <button onClick={() => aufgeben(q.id)}>
                        Aufgeben
                      </button>
                    )}
                  </div>
                )}

                {q.status === "available" && activeCount >= MAX_ACTIVE && (
                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    Du hast bereits <b>{MAX_ACTIVE}</b> aktive Quests. Gib eine Quest auf oder gib eine fertige ab.
                  </div>
                )}

                {q.status === "active" && !finished && (
                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    Quest läuft… mach passende Aktionen oder <b>Aufgeben</b>, um Platz zu schaffen.
                  </div>
                )}

                {q.status === "claimed" && (
                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    Bereits abgegeben ✅
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
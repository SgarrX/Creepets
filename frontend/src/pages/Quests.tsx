import { useMemo, useState } from "react";
import { useGameStore } from "../state/gameStore";

function getRequirementTarget(req: any): number {
  if (!req) return 1;
  if (typeof req.amount === "number") return req.amount;
  if (typeof req.score === "number") return req.score;
  return 1;
}

function getProgressValue(progress: any, req: any): number {
  if (!progress) return 0;
  if (req?.type === "minigame_score_at_least") {
    return typeof progress.score === "number" ? progress.score : 0;
  }
  if (typeof progress.count === "number") return progress.count;
  return 0;
}

function isCompletable(req: any, progress: any): boolean {
  const target = getRequirementTarget(req);
  const current = getProgressValue(progress, req);
  return current >= target;
}

function describeRewards(rewards: any): string[] {
  const lines: string[] = [];

  if (typeof rewards?.coins === "number" && rewards.coins > 0) {
    lines.push(`${rewards.coins} Coins`);
  }

  if (typeof rewards?.xp === "number" && rewards.xp > 0) {
    lines.push(`${rewards.xp} XP`);
  }

  if (Array.isArray(rewards?.items)) {
    for (const it of rewards.items) {
      const itemId = it?.item_id ?? it?.itemId ?? it?.id ?? "item";
      const qty = it?.qty ?? it?.quantity ?? it?.amount ?? 1;
      lines.push(`${qty}× ${itemId}`);
    }
  }

  if (rewards?.stat_upgrades && typeof rewards.stat_upgrades === "object") {
    for (const [key, value] of Object.entries(rewards.stat_upgrades)) {
      if (typeof value === "number" && value > 0) {
        const label =
          key === "strength" ? "STR" : key === "agility" ? "AGI" : key === "intelligence" ? "INT" : key;
        lines.push(`${label} +${value}`);
      }
    }
  }

  return lines;
}

export default function Quests() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const activePet = useGameStore((s) => s.getActivePet());
  const questsById = useGameStore((s) => s.questsById);
  const playerQuests = useGameStore((s) => s.playerQuests);
  const acceptQuest = useGameStore((s) => s.acceptQuest);
  const completeQuest = useGameStore((s) => s.completeQuestAndApplyRewards);
  const abandonQuest = useGameStore((s) => s.abandonQuest);
  const countActiveQuests = useGameStore((s) => s.countActiveQuests);

  const activePetLevel = activePet?.stats.level ?? 1;
  const activeCount = countActiveQuests();
  const maxActive = 3;

  const activeQuests = useMemo(() => {
    return playerQuests
      .filter((pq) => pq.status === "active")
      .map((pq) => {
        const def = questsById[pq.questId];
        return {
          pq,
          def,
          ready: isCompletable(def?.requirements, pq.progress),
        };
      })
      .sort((a, b) => {
        const aLevel = a.def?.levelRequired ?? 1;
        const bLevel = b.def?.levelRequired ?? 1;
        if (bLevel !== aLevel) return bLevel - aLevel;
        return a.def?.title?.localeCompare(b.def?.title ?? "") ?? 0;
      });
  }, [playerQuests, questsById]);

  const completedQuestIds = useMemo(() => {
    return new Set(
      playerQuests
        .filter((pq) => pq.status === "completed")
        .map((pq) => pq.questId),
    );
  }, [playerQuests]);

  const activeQuestIds = useMemo(() => {
    return new Set(
      playerQuests
        .filter((pq) => pq.status === "active")
        .map((pq) => pq.questId),
    );
  }, [playerQuests]);

  const availableQuests = useMemo(() => {
    return Object.values(questsById)
      .filter((q) => q.levelRequired <= activePetLevel)
      .filter((q) => !activeQuestIds.has(q.id))
      .filter((q) => q.repeatable || !completedQuestIds.has(q.id))
      .sort((a, b) => {
        if (b.levelRequired !== a.levelRequired) return b.levelRequired - a.levelRequired;
        return a.title.localeCompare(b.title);
      });
  }, [questsById, activePetLevel, activeQuestIds, completedQuestIds]);

  async function handleAccept(questId: string) {
    setErr("");
    setMsg("");
    try {
      await acceptQuest(questId);
      setMsg("Quest angenommen.");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function handleComplete(playerQuestId: string) {
    setErr("");
    setMsg("");
    try {
      await completeQuest(playerQuestId);
      setMsg("Quest abgegeben.");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function handleAbandon(playerQuestId: string) {
    setErr("");
    setMsg("");
    try {
      await abandonQuest(playerQuestId);
      setMsg("Quest aufgegeben.");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  if (!activePet) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Quests</h2>
        <p className="alert-error">Du brauchst erst ein Pet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Quests</h2>

      <div className="panel" style={{ marginBottom: 12 }}>
        Aktives Pet: <b>{activePet.name}</b> · Level <b>{activePetLevel}</b> · aktive Quests{" "}
        <b>
          {activeCount}/{maxActive}
        </b>
      </div>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Aktive Quests</h3>

        {activeQuests.length === 0 ? (
          <p className="muted">Keine aktiven Quests.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {activeQuests.map(({ pq, def, ready }) => {
              const req = def?.requirements ?? {};
              const target = getRequirementTarget(req);
              const current = getProgressValue(pq.progress, req);
              const rewards = describeRewards(def?.rewards ?? {});

              return (
                <div key={pq.id} className="panel">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <b>{def?.title ?? pq.questId}</b>
                      <div className="muted" style={{ marginTop: 4 }}>
                        Level {def?.levelRequired ?? 1}
                      </div>
                    </div>

                    {ready ? (
                      <span className="alert-success">
                        <b>Abgabebereit</b>
                      </span>
                    ) : (
                      <span className="muted">In Arbeit</span>
                    )}
                  </div>

                  {def?.description ? (
                    <div style={{ marginTop: 10, fontWeight: 700 }}>{def.description}</div>
                  ) : null}

                  <div style={{ marginTop: 8 }}>
                    Fortschritt: <b>{current}</b> / <b>{target}</b>
                  </div>

                  {rewards.length > 0 ? (
                    <div className="muted" style={{ marginTop: 8 }}>
                      Belohnung: {rewards.join(" · ")}
                    </div>
                  ) : null}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <button
                      className="btn primary"
                      disabled={!ready}
                      onClick={() => handleComplete(pq.id)}
                    >
                      Abgeben
                    </button>
                    <button className="btn" onClick={() => handleAbandon(pq.id)}>
                      Aufgeben
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Verfügbare Quests</h3>

        {availableQuests.length === 0 ? (
          <p className="muted">
            Aktuell keine weiteren verfügbaren Quests.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {availableQuests.map((q) => {
              const rewards = describeRewards(q.rewards);

              return (
                <div key={q.id} className="panel">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <b>{q.title}</b>
                      <div className="muted" style={{ marginTop: 4 }}>
                        Benötigt Level {q.levelRequired}
                      </div>
                    </div>

                    <span className="alert-success">Verfügbar</span>
                  </div>

                  {q.description ? (
                    <div style={{ marginTop: 10, fontWeight: 700 }}>{q.description}</div>
                  ) : null}

                  {rewards.length > 0 ? (
                    <div className="muted" style={{ marginTop: 8 }}>
                      Belohnung: {rewards.join(" · ")}
                    </div>
                  ) : null}

                  <button
                    className="btn"
                    style={{ marginTop: 10 }}
                    disabled={activeCount >= maxActive}
                    onClick={() => handleAccept(q.id)}
                  >
                    Annehmen ({activeCount}/{maxActive})
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
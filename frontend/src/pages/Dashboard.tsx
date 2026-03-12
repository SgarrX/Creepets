import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../state/gameStore";
import { useLivePet } from "../utils/livePetStats";

type ActionItem = {
  itemId: string;
  name: string;
  qty: number;
  description?: string | null;
};

function xpNeeded(level: number): number {
  return 50 * Math.pow(2, Math.max(level - 1, 0));
}

function speciesLabel(species: string): string {
  if (species === "brute") return "Brute";
  if (species === "scout") return "Scout";
  if (species === "sage") return "Sage";
  return species;
}

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
  return getProgressValue(progress, req) >= getRequirementTarget(req);
}

function describeRewards(rewards: any): string[] {
  const lines: string[] = [];

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
          key === "strength"
            ? "STR"
            : key === "agility"
              ? "AGI"
              : key === "intelligence"
                ? "INT"
                : key;
        lines.push(`${label} +${value}`);
      }
    }
  }

  return lines;
}

export default function Dashboard() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const profile = useGameStore((s) => s.profile);
  const activePetBase = useGameStore((s) => s.getActivePet());
  const inventory = useGameStore((s) => s.inventory);
  const itemsById = useGameStore((s) => s.itemsById);
  const playerQuests = useGameStore((s) => s.playerQuests);
  const questsById = useGameStore((s) => s.questsById);
  const bestScores = useGameStore((s) => s.bestScores);
  const useItem = useGameStore((s) => s.useItem);
  const trainSkill = useGameStore((s) => s.trainSkill);
  const completeQuest = useGameStore((s) => s.completeQuestAndApplyRewards);
  const abandonQuest = useGameStore((s) => s.abandonQuest);
  const submitMinigameScore = useGameStore((s) => s.submitMinigameScore);

  const activePet = useLivePet(activePetBase);
  const coins = typeof profile?.coins === "number" ? profile.coins : 0;
  const bestScore = bestScores["random_minigame"]?.bestScore ?? 0;

  const rows = useMemo(() => {
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
      .filter((x) => x.qty > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, itemsById]);

  const foods = useMemo<ActionItem[]>(() => {
    return rows
      .filter((r) => r.type === "food")
      .slice(0, 3)
      .map((r) => ({
        itemId: r.itemId,
        name: r.name,
        qty: r.qty,
        description: r.description,
      }));
  }, [rows]);

  const potions = useMemo<ActionItem[]>(() => {
    return rows
      .filter((r) => r.type === "potion")
      .slice(0, 3)
      .map((r) => ({
        itemId: r.itemId,
        name: r.name,
        qty: r.qty,
        description: r.description,
      }));
  }, [rows]);

  const books = useMemo<ActionItem[]>(() => {
    return rows
      .filter((r) => r.type === "book")
      .slice(0, 3)
      .map((r) => ({
        itemId: r.itemId,
        name: r.name,
        qty: r.qty,
        description: r.description,
      }));
  }, [rows]);

  const toys = useMemo<ActionItem[]>(() => {
    return rows
      .filter((r) => r.type === "toy")
      .slice(0, 2)
      .map((r) => ({
        itemId: r.itemId,
        name: r.name,
        qty: r.qty,
        description: r.description,
      }));
  }, [rows]);

  const activeQuestCards = useMemo(() => {
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
        if (a.ready !== b.ready) return a.ready ? -1 : 1;
        return (b.def?.levelRequired ?? 1) - (a.def?.levelRequired ?? 1);
      })
      .slice(0, 3);
  }, [playerQuests, questsById]);

  async function quickUse(itemId: string, label: string, verb: string) {
    setErr("");
    setMsg("");
    try {
      await useItem(itemId, 1);
      setMsg(`${verb}: ${label}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function quickTrain(skill: "strength" | "agility" | "intelligence") {
    setErr("");
    setMsg("");
    try {
      await trainSkill(skill);
      setMsg(`Trainiert: ${skill}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function playMinigameNow() {
    setErr("");
    setMsg("");
    try {
      const score = Math.floor(Math.random() * 200);
      const coinsWon = await submitMinigameScore("random_minigame", score);
      setMsg(`Minigame gespielt. Score: ${score} · Coins gewonnen: ${coinsWon}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function handleCompleteQuest(playerQuestId: string) {
    setErr("");
    setMsg("");
    try {
      await completeQuest(playerQuestId);
      setMsg("Quest abgegeben.");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function handleAbandonQuest(playerQuestId: string) {
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
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        <p className="alert-error" style={{ marginBottom: 12 }}>
          Du hast noch kein Pet adoptiert.
        </p>
        <Link to="/adopt" className="nav-link active">
          Jetzt ein Pet adoptieren →
        </Link>
      </div>
    );
  }

  const neededXp = xpNeeded(activePet.stats.level);

  return (
    <div>
      <h2>Dashboard</h2>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(420px, 1.35fr) minmax(320px, 1fr)",
          gap: 12,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div className="panel">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                alignItems: "start",
                marginBottom: 14,
              }}
            >
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 4 }}>
                  {activePet.name} <span className="muted">({speciesLabel(activePet.species)})</span>
                </h3>
                <div className="muted">
                  Level <b>{activePet.stats.level}</b> · XP <b>{activePet.stats.xp}</b> /{" "}
                  <b>{neededXp}</b>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="muted">Coins</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{coins}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(100px, 1fr))",
                gap: 10,
              }}
            >
              <div className="panel">
                <div className="muted">Energy</div>
                <b>
                  {activePet.stats.energy} / {activePet.stats.energyMax}
                </b>
              </div>
              <div className="panel">
                <div className="muted">Hunger</div>
                <b>{activePet.stats.hunger}</b>
              </div>
              <div className="panel">
                <div className="muted">Happiness</div>
                <b>{activePet.stats.happiness}</b>
              </div>
              <div className="panel">
                <div className="muted">STR</div>
                <b>{activePet.stats.strength}</b>
              </div>
              <div className="panel">
                <div className="muted">AGI</div>
                <b>{activePet.stats.agility}</b>
              </div>
              <div className="panel">
                <div className="muted">INT</div>
                <b>{activePet.stats.intelligence}</b>
              </div>
            </div>
          </div>

          <div className="panel">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700 }}>Minigame</div>
              <div className="muted" style={{ justifySelf: "center" }}>
                Kosten: 5 Energy
              </div>
              <button className="btn primary" onClick={playMinigameNow}>
                Play
              </button>
            </div>

            <div className="muted" style={{ marginTop: 8 }}>
              Bester Score: <b>{bestScore}</b>
            </div>
          </div>

          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Aktive Quests</h3>
              <Link to="/quests" className="nav-link">
                Alle ansehen
              </Link>
            </div>

            {activeQuestCards.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                Keine aktiven Quests.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 10,
                }}
              >
                {activeQuestCards.map(({ pq, def, ready }) => {
                  const req = def?.requirements ?? {};
                  const target = getRequirementTarget(req);
                  const current = getProgressValue(pq.progress, req);
                  const rewards = describeRewards(def?.rewards ?? {});

                  return (
                    <div key={pq.id} className="panel" style={{ padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>
                            {def?.title ?? pq.questId}
                          </div>
                          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                            Level {def?.levelRequired ?? 1}
                          </div>
                        </div>

                        <div
                          className={ready ? "alert-success" : "muted"}
                          style={{ fontSize: 12, whiteSpace: "nowrap" }}
                        >
                          {ready ? "Bereit" : "Aktiv"}
                        </div>
                      </div>

                      {def?.description ? (
                        <div style={{ marginTop: 8, fontWeight: 700, fontSize: 13 }}>
                          {def.description}
                        </div>
                      ) : null}

                      <div style={{ marginTop: 8, fontSize: 13 }}>
                        Fortschritt: <b>{current}</b> / <b>{target}</b>
                      </div>

                      {rewards.length > 0 ? (
                        <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
                          Belohnung: {rewards.join(" · ")}
                        </div>
                      ) : null}

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        <button
                          className="btn primary"
                          style={{ padding: "6px 9px", fontSize: 12 }}
                          disabled={!ready}
                          onClick={() => handleCompleteQuest(pq.id)}
                        >
                          Abgeben
                        </button>
                        <button
                          className="btn"
                          style={{ padding: "6px 9px", fontSize: 12 }}
                          onClick={() => handleAbandonQuest(pq.id)}
                        >
                          Aufgeben
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 12,
          }}
        >
          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <h3 style={{ marginTop: 0, marginBottom: 0 }}>Quickactions · Feed</h3>
              <Link to="/feed" className="nav-link">
                ...
              </Link>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {foods.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  Kein Food im Inventar.
                </p>
              ) : (
                foods.map((f) => (
                  <button
                    key={f.itemId}
                    className="btn"
                    onClick={() => quickUse(f.itemId, f.name, "Gefüttert")}
                  >
                    {f.name} × {f.qty}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <h3 style={{ marginTop: 0, marginBottom: 0 }}>Quickactions · Potions</h3>
              <Link to="/feed" className="nav-link">
                ...
              </Link>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {potions.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  Keine Potions im Inventar.
                </p>
              ) : (
                potions.map((p) => (
                  <button
                    key={p.itemId}
                    className="btn"
                    onClick={() => quickUse(p.itemId, p.name, "Potion benutzt")}
                  >
                    {p.name} × {p.qty}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <h3 style={{ marginTop: 0, marginBottom: 0 }}>Quickactions · Read</h3>
              <Link to="/read" className="nav-link">
                ...
              </Link>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {books.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  Keine Bücher im Inventar.
                </p>
              ) : (
                books.map((b) => (
                  <button
                    key={b.itemId}
                    className="btn"
                    onClick={() => quickUse(b.itemId, b.name, "Gelesen")}
                  >
                    {b.name} × {b.qty}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <h3 style={{ marginTop: 0, marginBottom: 0 }}>Quickactions · Play</h3>
              <Link to="/play" className="nav-link">
                ...
              </Link>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {toys.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  Keine Toys im Inventar.
                </p>
              ) : (
                toys.map((t) => (
                  <button
                    key={t.itemId}
                    className="btn"
                    onClick={() => quickUse(t.itemId, t.name, "Gespielt mit")}
                  >
                    {t.name} × {t.qty}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <h3 style={{ marginTop: 0, marginBottom: 0 }}>Quickactions · Train</h3>
              <Link to="/train" className="nav-link">
                ...
              </Link>
            </div>

            <div
              style={{
                marginTop: 10,
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(90px, 1fr))",
                gap: 8,
              }}
            >
              <button className="btn" onClick={() => quickTrain("strength")}>
                STR +
              </button>
              <button className="btn" onClick={() => quickTrain("agility")}>
                AGI +
              </button>
              <button className="btn" onClick={() => quickTrain("intelligence")}>
                INT +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
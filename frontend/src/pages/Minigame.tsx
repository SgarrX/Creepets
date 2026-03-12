import { Link } from "react-router-dom";
import { useState } from "react";
import { useGameStore } from "../state/gameStore";
import { useLivePet } from "../utils/livePetStats";

function xpNeeded(level: number): number {
  return 50 * Math.pow(2, Math.max(level - 1, 0));
}

function speciesLabel(species: string): string {
  if (species === "brute") return "Brute";
  if (species === "scout") return "Scout";
  if (species === "sage") return "Sage";
  return species;
}

export default function Minigame() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const profile = useGameStore((s) => s.profile);
  const activePetBase = useGameStore((s) => s.getActivePet());
  const submitScore = useGameStore((s) => s.submitMinigameScore);
  const bestScores = useGameStore((s) => s.bestScores);

  const activePet = useLivePet(activePetBase);
  const coins = profile?.coins ?? 0;
  const bestScore = bestScores["random_minigame"]?.bestScore ?? 0;

  async function playMinigame() {
    setErr("");
    setMsg("");

    try {
      const score = Math.floor(Math.random() * 200);
      const coinsWon = await submitScore("random_minigame", score);
      setMsg(`Minigame gespielt. Score: ${score} · Coins gewonnen: ${coinsWon}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  if (!activePet) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Minigame</h2>
        <p className="alert-error">Du brauchst erst ein Pet.</p>
        <Link to="/adopt" className="nav-link active">
          Zur Adoption →
        </Link>
      </div>
    );
  }

  const nextXp = xpNeeded(activePet.stats.level);

  return (
    <div>
      <h2>Minigame</h2>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(360px, 1.1fr) minmax(320px, 0.9fr)",
          gap: 12,
        }}
      >
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Aktives Pet</h3>

          <div style={{ marginBottom: 10 }}>
            <b>{activePet.name}</b> <span className="muted">({speciesLabel(activePet.species)})</span>
          </div>

          <div className="muted">
            Level <b>{activePet.stats.level}</b> · XP <b>{activePet.stats.xp}</b> / <b>{nextXp}</b>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(100px, 1fr))",
              gap: 10,
              marginTop: 12,
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
          <h3 style={{ marginTop: 0 }}>Spielbereich</h3>

          <div className="muted" style={{ marginBottom: 10 }}>
            Coins: <b>{coins}</b> · Bester Score: <b>{bestScore}</b>
          </div>

          <ul style={{ marginTop: 0, paddingLeft: 18 }}>
            <li>Jedes Spiel kostet <b>5 Energy</b>.</li>
            <li>Coins hängen vom Score ab.</li>
            <li>Dein Pet profitiert zusätzlich von seinen Stats.</li>
          </ul>

          <button className="btn primary" onClick={playMinigame}>
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
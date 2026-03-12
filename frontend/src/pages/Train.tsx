import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../state/gameStore";

type Skill = "strength" | "agility" | "intelligence";

export default function Train() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const activePetId = useGameStore((s) => s.activePetId);
  const pets = useGameStore((s) => s.pets);
  const trainSkill = useGameStore((s) => s.trainSkill);

  const pet = useMemo(() => {
    if (!activePetId) return null;
    return pets.find((p) => p.id === activePetId) ?? null;
  }, [activePetId, pets]);

  async function handleTrain(skill: Skill) {
    setErr("");
    setMsg("");
    try {
      await trainSkill(skill);
      setMsg(`Trainiert: ${skill}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  if (!activePetId || !pet) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Train</h2>
        <p className="alert-error">Du brauchst ein aktives Pet.</p>
        <Link to="/dashboard" className="nav-link active">
          Zum Dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Train</h2>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)",
          gap: 12,
        }}
      >
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Aktueller Status</h3>

          <div style={{ marginBottom: 8 }}>
            <b>{pet.name}</b> ({pet.species})
          </div>

          <div className="muted">
            Energy <b>{pet.stats.energy}</b> · Level <b>{pet.stats.level}</b> · XP <b>{pet.stats.xp}</b>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(90px, 1fr))",
              gap: 10,
              marginTop: 12,
            }}
          >
            <div className="panel">
              <div className="muted">STR</div>
              <b>{pet.stats.strength}</b>
            </div>
            <div className="panel">
              <div className="muted">AGI</div>
              <b>{pet.stats.agility}</b>
            </div>
            <div className="panel">
              <div className="muted">INT</div>
              <b>{pet.stats.intelligence}</b>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Training</h3>
          <div className="muted" style={{ marginBottom: 12 }}>
            Jede Trainingseinheit kostet aktuell <b>10 Energy</b> und erhöht den gewählten Skill.
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <button className="btn" onClick={() => handleTrain("strength")}>
              Strength trainieren
            </button>
            <button className="btn" onClick={() => handleTrain("agility")}>
              Agility trainieren
            </button>
            <button className="btn" onClick={() => handleTrain("intelligence")}>
              Intelligence trainieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
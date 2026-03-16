import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../state/gameStore";
import type { StarterSpecies } from "../domain/types";
import brumbleIcon from "../data/Pictures/Brumble.png";
import whiskraIcon from "../data/Pictures/Whiskra.png";
import sproutIcon from "../data/Pictures/Sprout.png";

type StarterCard = {
  id: StarterSpecies;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
  };
  startItems: string[];
};

const STARTERS: StarterCard[] = [
  {
    id: "brute",
    title: "Brumble",
    subtitle: "kräftiger Starter",
    description:
        "Mehr Stärke, etwas robuster Start. Gut für Leute, die Probleme lieber mit einem metaphorischen Backstein lösen.",
    icon: brumbleIcon,
    stats: { strength: 4, agility: 2, intelligence: 1 },
    startItems: ["mehr Futter", "3 Toys", "1 Potion", "1 Buch"],
  },
  {
    id: "sage",
    title: "Whiskra",
    subtitle: "kluger Starter",
    description:
        "Mehr Intelligence und die beste Buchausstattung. Klassischer Bücherwurm mit Chaospotenzial.",
    icon: whiskraIcon,
    stats: { strength: 1, agility: 2, intelligence: 4 },
    startItems: ["weniger Futter", "2 Toys", "1 Potion", "3 Bücher"],
  },
  {
    id: "scout",
    title: "Sprout",
    subtitle: "flinker Starter",
    description:
        "Mehr Agility und viele Spielsachen. Für flinke Gremlins mit Hummeln im Hirn.",
    icon: sproutIcon,
    stats: { strength: 2, agility: 4, intelligence: 1 },
    startItems: ["solides Futter", "4 Toys", "1 Potion", "1 Buch"],
  },
];

export default function Adopt() {
  const nav = useNavigate();

  const profile = useGameStore((s) => s.profile);
  const adoptPet = useGameStore((s) => s.adoptPet);
  const activePet = useGameStore((s) => s.getActivePet());
  const lastError = useGameStore((s) => s.lastError);

  const [species, setSpecies] = useState<StarterSpecies>("brute");
  const [name, setName] = useState("Fluffy");
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedStarter = useMemo(
    () => STARTERS.find((s) => s.id === species) ?? STARTERS[0],
    [species],
  );

  const hasUsername = !!profile?.username?.trim();

  async function handleAdopt() {
    setLocalError("");

    if (!hasUsername) {
      setLocalError("Bitte zuerst auf der Home-Seite einen Username setzen.");
      return;
    }

    if (activePet) {
      setLocalError("Du hast bereits ein Pet. Weitere Adoptionen sind deaktiviert.");
      return;
    }

    if (!name.trim()) {
      setLocalError("Bitte gib deinem Pet einen Namen.");
      return;
    }

    try {
      setSaving(true);
      await adoptPet(name.trim(), species);
      nav("/dashboard");
    } catch (e: any) {
      setLocalError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  if (!hasUsername) {
    return (
      <div>
        <h2>Adoption</h2>
        <div className="panel">
          <p className="alert-error">
            Bevor du ein Pet adoptieren kannst, musst du zuerst auf der Home-Seite deinen Username festlegen.
          </p>
          <Link to="/" className="nav-link active">
            Zur Home-Seite →
          </Link>
        </div>
      </div>
    );
  }

  if (activePet) {
    return (
      <div>
        <h2>Adoption</h2>

        {(localError || lastError) && (
          <p className="alert-error">{localError || lastError}</p>
        )}

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Du hast bereits dein einziges Pet gewählt</h3>
          <p>
            Aktuell kümmert sich dein Account um <b>{activePet.name}</b>{" "}
            <span className="muted">({activePet.species})</span>.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <Link to="/dashboard" className="nav-link active">
              Zum Dashboard →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Adoption</h2>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Wähle deinen Starter</h3>
        <p className="muted" style={{ marginBottom: 0 }}>
          Du kannst genau <b>ein</b> Pet adoptieren.
        </p>
      </div>

      {(localError || lastError) && (
        <p className="alert-error">{localError || lastError}</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        {STARTERS.map((starter) => {
          const selected = starter.id === species;

          return (
            <button
              key={starter.id}
              type="button"
              className="panel"
              onClick={() => setSpecies(starter.id)}
              style={{
                textAlign: "left",
                cursor: "pointer",
                border: selected ? "2px solid rgba(120,220,170,0.9)" : undefined,
                boxShadow: selected ? "0 0 0 1px rgba(120,220,170,0.25)" : undefined,
              }}
            >
              <img
                  src={starter.icon}
                  alt={starter.title}
                  style={{
                    width: 230,
                    height: 230,
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto 12px auto",
                  }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: 4 }}>{starter.title}</h3>
                  <div className="muted">{starter.subtitle}</div>
                </div>
                {selected ? <span className="alert-success">Ausgewählt</span> : null}
              </div>

              <p style={{ marginTop: 12 }}>{starter.description}</p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(70px, 1fr))",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <div className="panel">
                  <div className="muted">STR</div>
                  <b>{starter.stats.strength}</b>
                </div>
                <div className="panel">
                  <div className="muted">AGI</div>
                  <b>{starter.stats.agility}</b>
                </div>
                <div className="panel">
                  <div className="muted">INT</div>
                  <b>{starter.stats.intelligence}</b>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="muted" style={{ marginBottom: 6 }}>
                  Startitems
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {starter.startItems.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Name</h3>

        <label className="field" style={{ maxWidth: 420 }}>
          <span>Wie soll dein Pet heißen?</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            placeholder="z. B. Fluffy"
          />
        </label>

        <div className="panel" style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <b>Auswahl:</b> {selectedStarter.title}
              <div className="muted" style={{ marginTop: 4 }}>
                Name: <b>{name.trim() || "—"}</b>
              </div>
            </div>
            <div className="muted">
              STR {selectedStarter.stats.strength} · AGI {selectedStarter.stats.agility} · INT{" "}
              {selectedStarter.stats.intelligence}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button className="btn primary" onClick={handleAdopt} disabled={saving || !name.trim()}>
            {saving ? "Adoptiere…" : "Pet adoptieren"}
          </button>

          <Link to="/dashboard" className="nav-link">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
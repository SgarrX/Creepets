import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { getActivePetId, setActivePetId } from "../lib/activePet";

type Template = { species: string; base: { strength: number; agility: number; intelligence: number } };
type Pet = { id: string; name: string; species: string };

export default function Adopt() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [species, setSpecies] = useState<string>("");
  const [name, setName] = useState<string>("Fluffy");
  const [error, setError] = useState<string>("");

  const nav = useNavigate();
  const activeId = getActivePetId();

  useEffect(() => {
    apiGet<{ data: Template[] }>("/api/pets/templates")
      .then(r => {
        setTemplates(r.data);
        if (r.data.length) setSpecies(r.data[0].species);
      })
      .catch(e => setError(String(e.message || e)));
  }, []);

  async function adopt() {
    // extra safety: even if user bypasses UI
    if (activeId) {
      setError("Du hast bereits ein aktives Pet. Bitte erst im Profile löschen (Clear active pet).");
      return;
    }

    setError("");
    try {
      const res = await apiPost<{ data: Pet }>("/api/pets", { name, species });
      setActivePetId(res.data.id);
      nav(`/pet/${res.data.id}`);
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  }

  // ✅ Guard: prevent overriding the active pet
  if (activeId) {
    return (
      <div>
        <h2>Adoption</h2>
        <p className="alert-error">
          Du hast bereits ein aktives Pet. Adoption ist gesperrt, damit nichts überschrieben wird.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <Link to={`/pet/${activeId}`} className="nav-link active">
            Zum Dashboard
          </Link>
          <Link to="/profile" className="nav-link">
            Zum Profile (Clear active pet)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Adoption</h2>
      {error && <p className="alert-error">{error}</p>}

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Species:&nbsp;
          <select value={species} onChange={(e) => setSpecies(e.target.value)}>
            {templates.map(t => (
              <option key={t.species} value={t.species}>
                {t.species}
              </option>
            ))}
          </select>
        </label>

        <label>
          Name:&nbsp;
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <button className="primary" onClick={adopt} disabled={!species || !name.trim()}>
          Adopt
        </button>
      </div>

      <p style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
        Tipp: Nach Adoption findest du dein Pet über <b>Dashboard</b> in der Navbar.
      </p>
    </div>
  );
}

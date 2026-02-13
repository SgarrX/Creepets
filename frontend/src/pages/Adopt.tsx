import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { setActivePetId } from "../lib/activePet";

type Template = { species: string; base: { strength: number; agility: number; intelligence: number } };
type Pet = { id: string; name: string; species: string };

export default function Adopt() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [species, setSpecies] = useState<string>("");
  const [name, setName] = useState<string>("Fluffy");
  const [error, setError] = useState<string>("");

  const nav = useNavigate();

  useEffect(() => {
    apiGet<{ data: Template[] }>("/api/pets/templates")
      .then(r => {
        setTemplates(r.data);
        if (r.data.length) setSpecies(r.data[0].species);
      })
      .catch(e => setError(String(e.message || e)));
  }, []);

  async function adopt() {
    setError("");
    try {
      const res = await apiPost<{ data: Pet }>("/api/pets", { name, species });
      setActivePetId(res.data.id);
      nav(`/pet/${res.data.id}`);
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  }

  return (
    <div>
      <h2>Adoption</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Species:&nbsp;
          <select value={species} onChange={(e) => setSpecies(e.target.value)}>
            {templates.map(t => (
              <option key={t.species} value={t.species}>{t.species}</option>
            ))}
          </select>
        </label>

        <label>
          Name:&nbsp;
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <button onClick={adopt}>Adopt</button>
      </div>
    </div>
  );
}

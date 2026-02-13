import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { requireActivePetId } from "../lib/requirePet";

export default function Train() {
  const [pet, setPet] = useState<any>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const petId = requireActivePetId();
    setPet((await apiGet<{ data: any }>(`/api/pets/${petId}`)).data);
  }

  useEffect(() => {
    load().catch(e => setErr(String(e.message || e)));
  }, []);

  async function train(skill: "strength" | "agility" | "intelligence") {
    setErr(""); setMsg("");
    try {
      const petId = requireActivePetId();
      const res = await apiPost<{ data: any }>(`/api/pets/${petId}/train`, { skill });
      setPet(res.data.pet);
      setMsg(`Trained ${skill}!`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  return (
    <div>
      <h2>Train</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {!pet ? <p>Loading...</p> : (
        <>
          <p>Energy: {pet.energy} | Level {pet.level} | XP {pet.xp}</p>
          <p>STR {pet.strength} | AGI {pet.agility} | INT {pet.intelligence}</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => train("strength")}>Strength</button>
            <button onClick={() => train("agility")}>Agility</button>
            <button onClick={() => train("intelligence")}>Intelligence</button>
          </div>
        </>
      )}
    </div>
  );
}

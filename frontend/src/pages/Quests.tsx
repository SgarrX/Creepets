import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { requireActivePetId } from "../lib/requirePet";

export default function Quests() {
  const [quests, setQuests] = useState<any[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    const petId = requireActivePetId();
    const r = await apiGet<{ data: any[] }>(`/api/pets/${petId}/quests`);
    setQuests(r.data);
  }

  useEffect(() => {
    load().catch(e => setErr(String(e.message || e)));
  }, []);

  async function accept(qId: string) {
    setErr("");
    try {
      const petId = requireActivePetId();
      await apiPost(`/api/pets/${petId}/quests/${qId}/accept`);
      await load();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  async function claim(qId: string) {
    setErr("");
    try {
      const petId = requireActivePetId();
      await apiPost(`/api/pets/${petId}/quests/${qId}/claim`);
      await load();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  return (
    <div>
      <h2>Quests</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <ul>
        {quests.map(q => (
          <li key={q.id} style={{ marginBottom: 10 }}>
            <b>{q.title}</b> — {q.status} ({q.progress}/{q.goalCount})
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={() => accept(q.id)} disabled={q.status !== "available"}>Accept</button>
              <button onClick={() => claim(q.id)} disabled={q.status !== "completed"}>Claim</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

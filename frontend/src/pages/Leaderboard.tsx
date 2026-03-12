import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

type LeaderboardRow = {
  username: string;
  pet: string;
  score: number;
  achieved_at: string;
};

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setErr("");
      setIsLoading(true);

      const res = await supabase.rpc("get_minigame_leaderboard");

      if (!alive) return;

      if (res.error) {
        setErr(res.error.message);
        setRows([]);
        setIsLoading(false);
        return;
      }

      setRows((res.data ?? []) as LeaderboardRow[]);
      setIsLoading(false);
    }

    void load();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>

      {err && <p className="alert-error">{err}</p>}
      {isLoading && <p className="muted">Loading…</p>}

      {!isLoading && rows.length === 0 ? (
        <p>No scores yet. Play a minigame to set a score.</p>
      ) : null}

      {!isLoading && rows.length > 0 ? (
        <div className="panel">
          <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th align="left">Username</th>
                <th align="left">Pet</th>
                <th align="right">Score</th>
                <th align="left">Zeitpunkt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => (
                <tr key={`${r.username}-${r.pet}-${r.score}-${index}`} style={{ borderTop: "1px solid #333" }}>
                  <td>{r.username}</td>
                  <td>{r.pet}</td>
                  <td align="right">{r.score}</td>
                  <td>{new Date(r.achieved_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function Leaderboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiGet<{ data: any[] }>("/api/leaderboard")
      .then(r => setRows(r.data))
      .catch(e => setErr(String(e.message || e)));
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th align="left">Name</th>
            <th align="left">Species</th>
            <th align="right">Level</th>
            <th align="right">XP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ borderTop: "1px solid #ddd" }}>
              <td>{r.name}</td>
              <td>{r.species}</td>
              <td align="right">{r.level}</td>
              <td align="right">{r.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

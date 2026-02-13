import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { getActivePetId } from "../lib/activePet";

export default function Home() {
  const [health, setHealth] = useState<string>("(loading)");
  const activePetId = getActivePetId();

  useEffect(() => {
    apiGet<{ ok: boolean }>("/api/health")
      .then(r => setHealth(r.ok ? "OK" : "NOT OK"))
      .catch(() => setHealth("ERROR"));
  }, []);

  return (
    <div>
      <h2>Home</h2>
      <p>API Health: <b>{health}</b></p>
      <p><Link to="/adopt">Adopt a pet</Link></p>
      {activePetId && (
        <p>
          Active Pet: <b>{activePetId}</b> → <Link to={`/pet/${activePetId}`}>Dashboard</Link>
        </p>
      )}
    </div>
  );
}

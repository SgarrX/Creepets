import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActivePetId } from "../lib/activePet";

export default function Dashboard() {
  const nav = useNavigate();
  const activeId = getActivePetId();

  useEffect(() => {
    if (activeId) {
      nav(`/pet/${activeId}`, { replace: true });
    }
  }, [activeId, nav]);

  if (activeId) return null; // wird sofort weitergeleitet

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <p className="alert-error" style={{ marginBottom: 12 }}>
        Du hast noch kein Pet adoptiert.
      </p>
      <Link to="/adopt" className="nav-link active">
        Jetzt ein Pet adoptieren →
      </Link>
    </div>
  );
}
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getActivePetId, onActivePetIdChanged } from "./activePet";

export default function DashboardLink() {
  const [id, setId] = useState<string | null>(() => getActivePetId());

  useEffect(() => {
    return onActivePetIdChanged(() => setId(getActivePetId()));
  }, []);

  const to = id ? `/pet/${id}` : "/adopt";

  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
    >
      Dashboard
    </NavLink>
  );
}

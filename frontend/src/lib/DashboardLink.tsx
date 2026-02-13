import { NavLink } from "react-router-dom";
import { getActivePetId } from "./activePet";

export default function DashboardLink() {
  const id = getActivePetId();
  const to = id ? `/pet/${id}` : "/adopt";

  return (
<NavLink
  to={to}
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  Dashboard
</NavLink>

  );
}

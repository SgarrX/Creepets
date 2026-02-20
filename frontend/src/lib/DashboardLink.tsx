import { NavLink } from "react-router-dom";

export default function DashboardLink() {
  return (
    <NavLink
      to="/dashboard"
      className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
    >
      Dashboard
    </NavLink>
  );
}
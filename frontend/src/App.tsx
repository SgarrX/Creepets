import { useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import DashboardLink from "./lib/DashboardLink";
import { clearActivePetId } from "./lib/activePet";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Adopt from "./pages/Adopt";
import PetDashboard from "./pages/PetDashboard";
import Feed from "./pages/Feed";
import Play from "./pages/Play";
import Read from "./pages/Read";
import Train from "./pages/Train";
import Inventory from "./pages/Inventory";
import Shop from "./pages/Shop";
import Quests from "./pages/Quests";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

export default function App() {
  // ✅ "Game neu starten" = Reload => immer ohne aktives Pet
  useEffect(() => {
    clearActivePetId();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">NeoPets SPA</h1>

        <nav className="navbar">
          <NavLink to="/" className="nav-link">Home</NavLink>

          {/* ✅ Dashboard zeigt Hinweis wenn kein Pet, sonst redirect */}
          <DashboardLink />

          <NavLink to="/adopt" className="nav-link">Adopt</NavLink>
          <NavLink to="/inventory" className="nav-link">Inventory</NavLink>
          <NavLink to="/shop" className="nav-link">Shop</NavLink>
          <NavLink to="/feed" className="nav-link">Feed</NavLink>
          <NavLink to="/play" className="nav-link">Play</NavLink>
          <NavLink to="/read" className="nav-link">Read</NavLink>
          <NavLink to="/train" className="nav-link">Train</NavLink>
          <NavLink to="/quests" className="nav-link">Quests</NavLink>
          <NavLink to="/leaderboard" className="nav-link">Leaderboard</NavLink>
          <NavLink to="/profile" className="nav-link">Profile</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* ✅ neu */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/adopt" element={<Adopt />} />
          <Route path="/pet/:id" element={<PetDashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/play" element={<Play />} />
          <Route path="/read" element={<Read />} />
          <Route path="/train" element={<Train />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}
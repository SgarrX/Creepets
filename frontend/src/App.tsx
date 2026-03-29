import { useEffect, useRef, useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Adopt from "./pages/Adopt";
import Feed from "./pages/Feed";
import Play from "./pages/Play";
import Read from "./pages/Read";
import Train from "./pages/Train";
import Inventory from "./pages/Inventory";
import Shop from "./pages/Shop";
import Quests from "./pages/Quests";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Minigame from "./pages/Minigame";

import { supabase } from "./supabaseClient";
import { useGameStore } from "./state/gameStore";
import pageBackground from "./data/Pictures/page_background.png";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms),
    ),
  ]);
}

function AuthPanel() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  async function signIn() {
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });
    if (error) setMsg(error.message);
  }

  async function signUp() {
    setMsg("");
    const { error } = await supabase.auth.signUp({
      email,
      password: pw,
    });
    if (error) setMsg(error.message);
    else {
      setMsg("Account erstellt. Falls Email-Confirm aktiv ist: bitte Mail bestätigen.");
    }
  }

  return (
      <div id="auth-panel" className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="panel-header">
          <h2 style={{ margin: 0 }}>Login</h2>
          <p className="muted" style={{ margin: 0 }}>
            Damit dein Spielstand gespeichert wird.
          </p>
        </div>

        {msg && <p className="alert-error">{msg}</p>}

        <div className="form-grid">
          <label className="field">
            <span>Email</span>
            <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
            />
          </label>

          <label className="field">
            <span>Passwort</span>
            <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
            />
          </label>

          <div className="row" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn primary" onClick={signIn} disabled={!email || !pw}>
              Login
            </button>
            <button className="btn" onClick={signUp} disabled={!email || !pw}>
              Registrieren
            </button>
          </div>
        </div>
      </div>
  );
}

function RootRedirect() {
  const profile = useGameStore((s) => s.profile);
  const activePet = useGameStore((s) => s.getActivePet());

  const hasUsername = !!profile?.username?.trim();
  const hasPet = !!activePet;

  if (hasUsername && hasPet) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/profile" replace />;
}

function TopBar({
                  userId,
                  onLogout,
                  onLoginClick,
                  syncing,
                }: {
  userId: string | null;
  onLogout: () => void;
  onLoginClick: () => void;
  syncing: boolean;
}) {
  const nav = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const profile = useGameStore((s) => s.profile);
  const [actionsOpen, setActionsOpen] = useState(false);

  const isLoggedIn = !!userId;

  useEffect(() => {
    setActionsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handlePointerDown(ev: MouseEvent) {
      if (!actionsOpen) return;
      const target = ev.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setActionsOpen(false);
      }
    }

    function handleEscape(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        setActionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [actionsOpen]);

  return (
      <header className="topbar">
        <div className="topbar-inner">
          <div
              className="brand"
              onClick={() => {
                if (!isLoggedIn) {
                  onLoginClick();
                  return;
                }
                nav("/");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (!isLoggedIn) {
                    onLoginClick();
                  } else {
                    nav("/");
                  }
                }
              }}
          >
            <div className="brand-dot" />
            <div>
              <div className="brand-title">Creepets</div>
            </div>
          </div>

          <nav className="nav">
            {isLoggedIn ? (
                <>
                  <NavLink
                      to="/profile"
                      className={({ isActive }) => cx("nav-link", isActive && "active")}
                  >
                    Profile
                  </NavLink>
                  <NavLink
                      to="/dashboard"
                      className={({ isActive }) => cx("nav-link", isActive && "active")}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                      to="/adopt"
                      className={({ isActive }) => cx("nav-link", isActive && "active")}
                  >
                    Adopt
                  </NavLink>
                  <NavLink
                      to="/inventory"
                      className={({ isActive }) => cx("nav-link", isActive && "active")}
                  >
                    Inventory
                  </NavLink>
                  <NavLink
                      to="/shop"
                      className={({ isActive }) => cx("nav-link", isActive && "active")}
                  >
                    Shop
                  </NavLink>
                  <NavLink
                      to="/minigame"
                      className={({ isActive }) => cx("nav-link", isActive && "active")}
                  >
                    Minigame
                  </NavLink>
                  <NavLink
                      to="/quests"
                      className={({ isActive }) => cx("nav-link", isActive && "active")}
                  >
                    Quests
                  </NavLink>

                  <div ref={menuRef} className="dropdown">
                    <button
                        type="button"
                        className={cx("nav-link", "nav-link-button", actionsOpen && "active")}
                        onClick={() => setActionsOpen((v) => !v)}
                        aria-expanded={actionsOpen}
                    >
                      Aktionen <span className="dropdown-caret">▾</span>
                    </button>

                    {actionsOpen ? (
                        <div className="dropdown-menu">
                          <NavLink to="/feed" className="dropdown-item">
                            Feed
                          </NavLink>
                          <NavLink to="/play" className="dropdown-item">
                            Play
                          </NavLink>
                          <NavLink to="/read" className="dropdown-item">
                            Read
                          </NavLink>
                          <NavLink to="/train" className="dropdown-item">
                            Train
                          </NavLink>
                          <div className="dropdown-sep" />
                          <NavLink to="/leaderboard" className="dropdown-item">
                            Leaderboard
                          </NavLink>
                          <NavLink to="/help" className="dropdown-item">
                            Help
                          </NavLink>
                        </div>
                    ) : null}
                  </div>
                </>
            ) : null}
          </nav>

          <div className="userbox">
            {isLoggedIn ? (
                <>
                  <div className="chip" title={userId ?? undefined}>
                    <span className="chip-dot" />
                    <span className="chip-text">
                  user · {profile?.username ?? "kein Username"}
                </span>
                  </div>

                  {syncing ? <span className="muted" style={{ fontSize: 12 }}>Sync…</span> : null}

                  <button className="btn" onClick={onLogout}>
                    Logout
                  </button>
                </>
            ) : (
                <button className="btn primary" onClick={onLoginClick}>
                  Login
                </button>
            )}
          </div>
        </div>
      </header>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const loadGame = useGameStore((s) => s.loadGame);
  const clearError = useGameStore((s) => s.clearError);
  const lastError = useGameStore((s) => s.lastError);
  const isLoading = useGameStore((s) => s.isLoading);

  const [booted, setBooted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string>("");

  useEffect(() => {
    clearError();
    setLocalError("");
  }, [location.pathname, clearError]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!alive) return;

        if (error) {
          console.error("getSession error:", error);
          setBooted(true);
          return;
        }

        const uid = data.session?.user?.id ?? null;
        setUserId(uid);
        setBooted(true);

        if (uid) {
          try {
            await withTimeout(loadGame(), 10_000, "loadGame");
          } catch (e: any) {
            console.error("Initial loadGame failed:", e);
            setLocalError(e?.message ?? String(e));
          }
        }
      } catch (e: any) {
        console.error("boot crashed:", e);
        if (!alive) return;
        setLocalError(e?.message ?? String(e));
        setBooted(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (!uid) {
        clearError();
        setLocalError("");
        return;
      }

      try {
        clearError();
        setLocalError("");
        await withTimeout(loadGame(), 10_000, "loadGame");
      } catch (e: any) {
        console.error("loadGame failed:", e);
        setLocalError(e?.message ?? String(e));
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadGame, clearError]);

  const logout = async () => {
    setLocalError("");
    clearError();

    const { error } = await supabase.auth.signOut();
    if (error) {
      setLocalError(error.message);
      return;
    }

    setUserId(null);
    navigate("/login");
  };

  const goToLogin = () => {
    navigate("/login");
    window.setTimeout(() => {
      const el = document.getElementById("auth-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
      <div
          className="app-shell"
          style={{
            minHeight: "100vh",
            backgroundImage: `url(${pageBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
      >
        <TopBar
            userId={userId}
            onLogout={() => void logout()}
            onLoginClick={goToLogin}
            syncing={isLoading}
        />

        <main className="container">
          {!booted ? (
              <div className="panel">
                <p>Loading…</p>
              </div>
          ) : !userId ? (
              <>
                {localError ? (
                    <div className="panel" style={{ marginBottom: 12 }}>
                      <p className="alert-error" style={{ margin: 0 }}>
                        {localError}
                      </p>
                    </div>
                ) : null}
                <Routes>
                  <Route path="*" element={<AuthPanel />} />
                </Routes>
              </>
          ) : (
              <>
                {(localError || lastError) && (
                    <div className="panel" style={{ marginBottom: 12 }}>
                      <p className="alert-error" style={{ margin: 0 }}>
                        {localError || lastError}
                      </p>
                    </div>
                )}

                <Routes>
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/login" element={<RootRedirect />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/adopt" element={<Adopt />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/play" element={<Play />} />
                  <Route path="/read" element={<Read />} />
                  <Route path="/train" element={<Train />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/minigame" element={<Minigame />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/quests" element={<Quests />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/help" element={<Home />} />
                  <Route path="*" element={<RootRedirect />} />
                </Routes>
              </>
          )}
        </main>
      </div>
  );
}
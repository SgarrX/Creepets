import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useGameStore } from "../state/gameStore";

export default function Profile() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const profile = useGameStore((s) => s.profile);
  const activePet = useGameStore((s) => s.getActivePet());
  const resetGame = useGameStore((s) => s.resetGame);
  const setUsername = useGameStore((s) => s.setUsername);

  const existingUsername = profile?.username?.trim() ?? "";
  const usernameLocked = existingUsername.length > 0;
  const coins = typeof profile?.coins === "number" ? profile.coins : 0;

  const [username, setUsernameInput] = useState(existingUsername);

  useEffect(() => {
    setUsernameInput(existingUsername);
  }, [existingUsername]);

  async function handleSaveUsername() {
    setErr("");
    setMsg("");

    if (usernameLocked) {
      setErr("Dein Username wurde bereits festgelegt und kann nicht mehr geändert werden.");
      return;
    }

    try {
      await setUsername(username.trim());
      setMsg("Username gespeichert.");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function doReset() {
    setErr("");
    setMsg("");

    try {
      await resetGame();
      setMsg("Spielstand wurde zurückgesetzt. Du startest wieder ohne Pet.");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  async function logout() {
    setErr("");
    setMsg("");
    const { error } = await supabase.auth.signOut();
    if (error) setErr(error.message);
  }

  return (
    <div>
      <h2>Profile</h2>

      {err && <p className="alert-error">{err}</p>}
      {msg && <p className="alert-success">{msg}</p>}

      <div className="panel" style={{ marginBottom: 12, maxWidth: 620 }}>
        <h3 style={{ marginTop: 0 }}>Username</h3>

        <p className="muted" style={{ marginTop: 0 }}>
          Dein Username wird oben in der Leiste, im Profil und im Leaderboard verwendet.
        </p>

        <label className="field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="z. B. CritterMeister"
            maxLength={24}
            disabled={usernameLocked}
          />
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          {!usernameLocked ? (
            <button
              className="btn primary"
              onClick={handleSaveUsername}
              disabled={!username.trim()}
            >
              Bestätigen
            </button>
          ) : (
            <div className="muted">Username ist fest gesetzt.</div>
          )}

          <div className="muted" style={{ alignSelf: "center" }}>
            Aktuell: <b>{profile?.username ?? "noch nicht gesetzt"}</b>
          </div>
        </div>

        {!activePet && usernameLocked ? (
          <div style={{ marginTop: 14 }}>
            <Link to="/adopt" className="nav-link active">
              Adopt a Pet →
            </Link>
          </div>
        ) : null}
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div>
          Username: <b>{profile?.username ?? "noch nicht gesetzt"}</b>
        </div>
        <div>
          User ID: <b>{profile?.id ?? "?"}</b>
        </div>
        <div>
          Coins: <b>{coins}</b>
        </div>
        <div>
          Pet:{" "}
          <b>
            {activePet ? `${activePet.name} (${activePet.species})` : "keins"}
          </b>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Reset</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Löscht dein Pet, Inventar, Queststände und Scores. Username und Account bleiben erhalten.
        </p>

        <button className="btn" onClick={doReset}>
          Reset game
        </button>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Logout</h3>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
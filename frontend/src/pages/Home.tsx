import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGameStore } from "../state/gameStore";

export default function Home() {
  const profile = useGameStore((s) => s.profile);
  const activePet = useGameStore((s) => s.getActivePet());
  const setUsername = useGameStore((s) => s.setUsername);

  const existingUsername = profile?.username?.trim() ?? "";
  const usernameLocked = existingUsername.length > 0;

  const [username, setUsernameInput] = useState(existingUsername);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

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
      setSaving(true);
      await setUsername(username.trim());
      setMsg("Username gespeichert.");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2>Home</h2>

      {!profile ? (
        <p>Bitte einloggen, um deinen Spielstand zu laden.</p>
      ) : (
        <>
          {err && <p className="alert-error">{err}</p>}
          {msg && <p className="alert-success">{msg}</p>}

          <div className="panel" style={{ marginBottom: 12, maxWidth: 560 }}>
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
                  disabled={saving || !username.trim()}
                >
                  {saving ? "Speichere…" : "Bestätigen"}
                </button>
              ) : (
                <div className="muted">
                  Username ist fest gesetzt.
                </div>
              )}

              <div className="muted" style={{ alignSelf: "center" }}>
                Aktuell: <b>{profile.username ?? "noch nicht gesetzt"}</b>
              </div>
            </div>
          </div>

          {!activePet ? (
            <p>
              <Link to="/adopt">Adopt a pet</Link>
            </p>
          ) : null}

          {activePet ? (
            <p>
              Active Pet: <b>{activePet.name}</b> → <Link to="/dashboard">Dashboard</Link>
            </p>
          ) : (
            <p>Du hast noch kein Pet adoptiert.</p>
          )}
        </>
      )}
    </div>
  );
}
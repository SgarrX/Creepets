import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useGameStore } from "../state/gameStore";

export default function Profile() {
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const profile = useGameStore((s) => s.profile);
  const activePet = useGameStore((s) => s.getActivePet());
  const resetGame = useGameStore((s) => s.resetGame);

  const coins = typeof profile?.coins === "number" ? profile.coins : 0;

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
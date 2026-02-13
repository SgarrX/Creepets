import { useState } from "react";
import { clearActivePetId, getActivePetId } from "../lib/activePet";

export default function Profile() {
  const [theme, setTheme] = useState("light");
  const active = getActivePetId();

  return (
    <div>
      <h2>Profile / Settings</h2>
      <p>Active Pet: <b>{active ?? "(none)"}</b></p>
      <button onClick={() => { clearActivePetId(); location.reload(); }}>Clear active pet</button>

      <hr />
      <label>
        UI Theme (local):&nbsp;
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select>
      </label>
    </div>
  );
}
